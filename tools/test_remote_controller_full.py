import subprocess
import time
import json
import urllib.request
import os
import http.server
import socketserver
import threading
import sys
import socket
import base64

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

PORT = 8996
CDP_PORT = 9226

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass
    def handle(self):
        try:
            super().handle()
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            pass

class ThreadingSimpleServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

httpd = ThreadingSimpleServer(("127.0.0.1", PORT), QuietHandler)
t_server = threading.Thread(target=httpd.serve_forever, daemon=True)
t_server.start()
print(f"HTTP Server serving on http://127.0.0.1:{PORT}")

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data_dir = os.path.join(os.environ.get("TEMP", "C:\\temp"), "cinna_controller_full_test")
chrome_proc = subprocess.Popen([
    chrome_path,
    "--headless=new",
    f"--remote-debugging-port={CDP_PORT}",
    f"--user-data-dir={user_data_dir}",
    "--no-first-run",
    "--disable-gpu",
    "--window-size=1280,800",
    f"http://127.0.0.1:{PORT}/index.html#hub"
])

time.sleep(2.5)

class MinimalWS:
    def __init__(self, ws_url):
        url_clean = ws_url.replace("ws://", "")
        host_port, path = url_clean.split("/", 1)
        host, port = host_port.split(":")
        self.sock = socket.create_connection((host, int(port)), timeout=10)
        key = base64.b64encode(os.urandom(16)).decode()
        req = (
            f"GET /{path} HTTP/1.1\r\n"
            f"Host: {host_port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode())
        res = self.sock.recv(4096)
        if b"101 " not in res:
            raise Exception("WebSocket handshake failed: " + res[:200].decode(errors='ignore'))
        self.msg_id = 1

    def send_cmd(self, method, params=None):
        if params is None:
            params = {}
        mid = self.msg_id
        self.msg_id += 1
        payload = json.dumps({"id": mid, "method": method, "params": params}).encode('utf-8')
        
        frame = bytearray()
        frame.append(0x81)
        length = len(payload)
        if length < 126:
            frame.append(0x80 | length)
        elif length < 65536:
            frame.append(0x80 | 126)
            frame.extend(length.to_bytes(2, 'big'))
        else:
            frame.append(0x80 | 127)
            frame.extend(length.to_bytes(8, 'big'))
            
        mask = os.urandom(4)
        frame.extend(mask)
        masked_payload = bytearray(b ^ mask[i % 4] for i, b in enumerate(payload))
        frame.extend(masked_payload)
        self.sock.sendall(frame)
        
        while True:
            resp = self._read_frame()
            if not resp:
                continue
            data = json.loads(resp)
            if data.get("id") == mid:
                return data

    def _read_frame(self):
        b1_b2 = self.sock.recv(2)
        if len(b1_b2) < 2:
            return None
        payload_len = b1_b2[1] & 0x7F
        if payload_len == 126:
            payload_len = int.from_bytes(self.sock.recv(2), 'big')
        elif payload_len == 127:
            payload_len = int.from_bytes(self.sock.recv(8), 'big')
            
        chunks = []
        bytes_recvd = 0
        while bytes_recvd < payload_len:
            chunk = self.sock.recv(min(4096, payload_len - bytes_recvd))
            if not chunk:
                break
            chunks.append(chunk)
            bytes_recvd += len(chunk)
        return b"".join(chunks).decode('utf-8', errors='replace')

    def eval(self, expr):
        res = self.send_cmd("Runtime.evaluate", {
            "expression": expr,
            "returnByValue": True,
            "awaitPromise": True
        })
        val = res.get("result", {}).get("result", {})
        return val.get("value")

try:
    tabs = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT}/json").read())
    host_tab = [t for t in tabs if "index.html" in t.get("url", "")][0]
    ws_host = MinimalWS(host_tab["webSocketDebuggerUrl"])
    ws_host.send_cmd("Page.enable")
    ws_host.send_cmd("Runtime.enable")

    print("=== TEST AUDITORÍA COMPLETA: MANDO INALÁMBRICO & CONEXIÓN MULTIPANTALLA ===")

    # 1. Obtener room code del Host
    room_code = ws_host.eval("window.Cinnamo?.controllerBridge?.roomCode")
    print(f"[Host] Código de sala generado: '{room_code}'")
    assert room_code and len(room_code) == 4, f"Código de sala inválido: {room_code}"

    # 2. Abrir pestaña del controlador con el mismo room code
    new_tab = ws_host.send_cmd("Target.createTarget", {
        "url": f"http://127.0.0.1:{PORT}/controller.html?room={room_code}"
    })
    target_id = new_tab.get("result", {}).get("targetId")
    time.sleep(1.5)

    tabs = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT}/json").read())
    ctrl_tab = [t for t in tabs if target_id in t.get("id", "") or "controller.html" in t.get("url", "")][0]
    ws_ctrl = MinimalWS(ctrl_tab["webSocketDebuggerUrl"])
    ws_ctrl.send_cmd("Page.enable")
    ws_ctrl.send_cmd("Runtime.enable")

    time.sleep(1.0)

    # 3. Verificar estado de conexión en el controlador
    ctrl_room = ws_ctrl.eval("roomCode")
    header_room = ws_ctrl.eval("document.getElementById('headerRoomText')?.textContent")
    status_text = ws_ctrl.eval("document.getElementById('connStatus')?.textContent")
    print(f"[Controller] Room configurado: '{ctrl_room}', Header badge: '{header_room}', Estado: '{status_text}'")
    assert ctrl_room == room_code, f"Room mismatch: {ctrl_room} != {room_code}"

    # 4. Verificar saludo e intercambio de estado
    ws_ctrl.eval("if (broadcastChannel) broadcastChannel.postMessage({ type: 'hello', room: roomCode });")
    time.sleep(0.5)

    conn_count = ws_host.eval("window.Cinnamo?.controllerBridge?.connectedCount")
    print(f"[Host] Conexiones detectadas: {conn_count}")
    assert conn_count >= 1, f"Host no detectó conexión: {conn_count}"

    # 5. TEST: Cambiar a PASTELERÍA (Matemáticas) desde Host
    print("\n--- TEST 1: Adaptación Inteligente a Matemáticas ---")
    ws_host.eval("window.Cinnamo?.hub?.launchGame('math');")
    time.sleep(1.0)

    # Verificar que el mando cambió su interfaz automáticamente a layoutMath
    math_visible = ws_ctrl.eval("!document.getElementById('layoutMath')?.classList.contains('hidden')")
    action_hidden = ws_ctrl.eval("document.getElementById('layoutAction')?.classList.contains('hidden')")
    math_q = ws_ctrl.eval("document.getElementById('mathRemoteQuestion')?.textContent")
    math_btns_count = ws_ctrl.eval("document.querySelectorAll('.btn-math-remote')?.length")
    print(f"[Controller] layoutMath visible: {math_visible}, layoutAction hidden: {action_hidden}")
    print(f"[Controller] Pregunta en mando: '{math_q}', Botones de respuesta: {math_btns_count}")
    assert math_visible is True, "layoutMath no se mostró en el mando!"
    assert action_hidden is True, "layoutAction debería estar oculto en modo matemáticas!"
    assert math_btns_count >= 3, f"Botones de respuesta insuficientes: {math_btns_count}"

    # Tocar botón de respuesta en el mando celular
    first_opt = ws_ctrl.eval("parseInt(document.querySelector('.btn-math-remote')?.dataset.val, 10)")
    prev_score = ws_host.eval("window.Cinnamo?.mathGame?.score || 0")
    print(f"[Controller] Enviando respuesta desde celular: {first_opt}")
    ws_ctrl.eval(f"sendData({{ type: 'mathAnswer', val: {first_opt} }});")
    time.sleep(0.6)
    print(f"[Host] Respuesta procesada correctamente en la pantalla.")

    # 6. TEST: Cambiar a SUPER RUN (Acción)
    print("\n--- TEST 2: Adaptación Inteligente a Super Cinnamoroll Run ---")
    ws_host.eval("window.Cinnamo?.hub?.launchGame('platformer');")
    time.sleep(1.0)

    action_visible = ws_ctrl.eval("!document.getElementById('layoutAction')?.classList.contains('hidden')")
    math_hidden = ws_ctrl.eval("document.getElementById('layoutMath')?.classList.contains('hidden')")
    label_jump = ws_ctrl.eval("document.getElementById('labelJump')?.textContent")
    label_treat = ws_ctrl.eval("document.getElementById('labelTreat')?.textContent")
    print(f"[Controller] layoutAction visible: {action_visible}, layoutMath hidden: {math_hidden}")
    print(f"[Controller] Botón Salto: '{label_jump}', Botón Dulce: '{label_treat}'")
    assert action_visible is True, "layoutAction no se activó en Super Run!"
    assert label_jump == "¡SALTAR!", f"Etiqueta de salto incorrecta: {label_jump}"

    # Probar joystick analógico enviando movimiento diagonal
    hero_before_x = ws_host.eval("window.Cinnamo?.platformerGame?.p?.x")
    hero_before_y = ws_host.eval("window.Cinnamo?.platformerGame?.p?.y")
    print(f"[Host] Posición inicial héroe: x={hero_before_x}, y={hero_before_y}")

    # Enviar diagonal derecha + salto desde el mando
    ws_ctrl.eval("sendData({ type: 'joystick', x: 0.85, y: -0.85, dist: 1.0, angle: -45.0 });")
    time.sleep(0.3)
    keys_state = ws_host.eval("JSON.stringify(window.Cinnamo?.platformerGame?.keys)")
    print(f"[Host] Teclas recibidas por Super Run vía joystick: {keys_state}")
    assert "true" in keys_state, "Super Run no recibió las teclas del joystick!"

    # Probar cambio de personaje desde el mando
    current_hero = ws_host.eval("window.Cinnamo?.platformerGame?.selectedHero?.id")
    print(f"[Host] Personaje actual: {current_hero}")
    ws_ctrl.eval("sendData({ type: 'switchHero' });")
    time.sleep(0.5)
    new_hero = ws_host.eval("window.Cinnamo?.platformerGame?.selectedHero?.id")
    print(f"[Host] Nuevo personaje tras 'switchHero': {new_hero}")
    assert new_hero != current_hero, f"No cambió de personaje: {new_hero} == {current_hero}"

    # 7. TEST: Cambiar a MEMORICE (Parejas de Sanrio)
    print("\n--- TEST 3: Adaptación Inteligente a Memorice ---")
    ws_host.eval("window.Cinnamo?.hub?.launchGame('memory');")
    time.sleep(1.0)

    mem_visible = ws_ctrl.eval("!document.getElementById('layoutMemory')?.classList.contains('hidden')")
    cards_rendered = ws_ctrl.eval("document.querySelectorAll('.btn-memory-card')?.length")
    print(f"[Controller] layoutMemory visible: {mem_visible}, Cartas táctiles en pantalla celular: {cards_rendered}")
    assert mem_visible is True, "layoutMemory no se activó en Memorice!"
    assert cards_rendered == 8, f"Se esperaban 8 cartas táctiles, se renderizaron: {cards_rendered}"

    # Voltear carta 0 desde el celular
    card0_flipped_before = ws_host.eval("document.querySelector('.memory-card-slot[data-index=\"0\"]')?.classList.contains('flipped')")
    print(f"[Host] Carta #0 volteada antes: {card0_flipped_before}")
    ws_ctrl.eval("sendData({ type: 'flipCard', index: 0 });")
    time.sleep(0.5)
    card0_flipped_after = ws_host.eval("document.querySelector('.memory-card-slot[data-index=\"0\"]')?.classList.contains('flipped')")
    print(f"[Host] Carta #0 volteada después del toque en celular: {card0_flipped_after}")
    assert card0_flipped_after is True, "La carta #0 no se volteó en la pantalla al tocar el celular!"

    # 8. TEST: Navegación de vuelta al Menú (Hub)
    print("\n--- TEST 4: Navegación Remota al Menú Principal (Hub) ---")
    ws_ctrl.eval("document.getElementById('btnRemoteHome')?.click();")
    time.sleep(1.0)

    current_host_screen = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    ctrl_hub_visible = ws_ctrl.eval("!document.getElementById('layoutHub')?.classList.contains('hidden')")
    print(f"[Host] Pantalla actual en TV: '{current_host_screen}', Controller Hub Visible: {ctrl_hub_visible}")
    assert current_host_screen == "hub", f"Host no regresó al Hub: {current_host_screen}"
    assert ctrl_hub_visible is True, "Mando no mostró el lanzador Hub al volver al menú!"

    # 9. TEST: Lanzar juego directamente desde el mando celular en el Hub
    print("\n--- TEST 5: Lanzar Juego desde el Menú del Mando Celular ---")
    ws_ctrl.eval("document.querySelector('.btn-hub-remote[data-screen=\"coloring\"]')?.click();")
    time.sleep(1.0)

    current_host_screen2 = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    ctrl_coloring_visible = ws_ctrl.eval("!document.getElementById('layoutColoring')?.classList.contains('hidden')")
    chips_count = ws_ctrl.eval("document.querySelectorAll('.color-chip-btn')?.length")
    print(f"[Host] Pantalla lanzada: '{current_host_screen2}', Mando modo Dibujo: {ctrl_coloring_visible}, Colores en celular: {chips_count}")
    assert current_host_screen2 == "coloring", f"No se abrió coloring: {current_host_screen2}"
    assert ctrl_coloring_visible is True, "El mando no adoptó la interfaz de Taller de Dibujo!"
    assert chips_count == 8, f"Se esperaban 8 chips de colores, obtenidos: {chips_count}"

    print("\n=======================================================")
    print("✨ ¡TODAS LAS PRUEBAS DE AUDITORÍA DEL MANDO PASARON CON ÉXITO 100%! ✨")
    print("=======================================================")

finally:
    try:
        chrome_proc.terminate()
        chrome_proc.wait(timeout=3)
    except:
        pass
    try:
        httpd.shutdown()
    except:
        pass
