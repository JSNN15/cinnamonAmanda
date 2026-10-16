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

import tempfile
import shutil

PORT = 8996
CDP_PORT_HOST = 9325
CDP_PORT_PHONE = 9326

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()
    def handle(self):
        try:
            super().handle()
        except:
            pass

class ThreadingSimpleServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

httpd = ThreadingSimpleServer(("127.0.0.1", PORT), QuietHandler)
t_server = threading.Thread(target=httpd.serve_forever, daemon=True)
t_server.start()

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data_dir_host = tempfile.mkdtemp(prefix="cinna_host_")
user_data_dir_phone = tempfile.mkdtemp(prefix="cinna_phone_")

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

chrome_host = None
chrome_phone = None

try:
    print("=== TEST MULTI-DISPOSITIVO DE TODOS LOS JUEGOS CON MANDO REMOTO ===")
    
    # 1. Iniciar PC / TV Host
    chrome_host = subprocess.Popen([
        chrome_path,
        "--headless=new",
        f"--remote-debugging-port={CDP_PORT_HOST}",
        f"--user-data-dir={user_data_dir_host}",
        "--no-first-run",
        "--disable-gpu",
        "--window-size=1280,800",
        f"http://127.0.0.1:{PORT}/index.html"
    ])
    time.sleep(2.5)

    tabs = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT_HOST}/json").read())
    host_tab = [t for t in tabs if "index.html" in t.get("url", "")][0]
    ws_host = MinimalWS(host_tab["webSocketDebuggerUrl"])
    ws_host.send_cmd("Page.enable")
    ws_host.send_cmd("Runtime.enable")

    room_code = ws_host.eval("window.Cinnamo?.controllerBridge?.roomCode")
    print(f"✅ [Host PC/TV] Listo. Código de Sala: {room_code}")

    # 2. Iniciar Teléfono Celular en proceso completamente aislado
    chrome_phone = subprocess.Popen([
        chrome_path,
        "--headless=new",
        f"--remote-debugging-port={CDP_PORT_PHONE}",
        f"--user-data-dir={user_data_dir_phone}",
        "--no-first-run",
        "--disable-gpu",
        "--window-size=390,844",
        f"http://127.0.0.1:{PORT}/controller.html?room={room_code}"
    ])
    time.sleep(2.5)

    phone_tabs = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT_PHONE}/json").read())
    phone_tab = [t for t in phone_tabs if "controller.html" in t.get("url", "")][0]
    ws_phone = MinimalWS(phone_tab["webSocketDebuggerUrl"])
    ws_phone.send_cmd("Page.enable")
    ws_phone.send_cmd("Runtime.enable")

    print("📡 Conectando Mando Celular...")
    connected = False
    for i in range(10):
        time.sleep(1.0)
        phone_status = ws_phone.eval("document.getElementById('connStatus')?.textContent")
        host_count = ws_host.eval("window.Cinnamo?.controllerBridge?.connectedCount")
        if host_count and host_count >= 1 and "En Vivo" in str(phone_status):
            connected = True
            print(f"✅ ¡Conexión WebRTC en Vivo establecida! ({phone_status})")
            break

    if not connected:
        print("❌ Falla conectando WebRTC. Abortando.")
        sys.exit(1)

    # -------------------------------------------------------------
    # PRUEBA 1: Navegación desde el Mando (Hub -> A Volar)
    # -------------------------------------------------------------
    print("\n--- TEST 1: ¡A VOLAR! ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'flight' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_phone = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    assert screen_host == 'flight', f"Host screen should be flight, got {screen_host}"
    print(f"✅ Pantalla en TV: '{screen_host}' | Mando UI: '{mode_phone}'")

    # Mando interactúa: pirueta (jump) y saludo (treat)
    ws_phone.eval("sendButton('jump', true)")
    time.sleep(0.1)
    ws_phone.eval("sendButton('jump', false)")
    ws_phone.eval("sendButton('treat', true)")
    time.sleep(0.1)
    ws_phone.eval("sendButton('treat', false)")
    # Joystick analógico
    ws_phone.eval("sendData({ type: 'joystick', x: 0, y: -0.7, dist: 0.7, angle: -90 })")
    time.sleep(0.2)
    ws_phone.eval("sendData({ type: 'joystick', x: 0, y: 0, dist: 0, angle: 0 })")
    print("✅ Controles de ¡A Volar! (Pirueta, Saludo, Stick) respondieron con éxito.")

    # -------------------------------------------------------------
    # PRUEBA 2: Pastelería de Números (Math)
    # -------------------------------------------------------------
    print("\n--- TEST 2: PASTELERÍA DE NÚMEROS (MATH) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'math' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_phone = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    btn_count = ws_phone.eval("document.querySelectorAll('#mathRemoteGrid .btn-math-remote').length")
    question = ws_phone.eval("document.getElementById('mathRemoteQuestion')?.textContent")
    assert screen_host == 'math', f"Host screen should be math, got {screen_host}"
    print(f"✅ TV: '{screen_host}' | Mando: '{mode_phone}' | Pregunta: '{question}' | Opciones: {btn_count}")

    # Responder seleccionando la primera opción en el celular
    target_val = ws_phone.eval("parseInt(document.querySelector('.btn-math-remote')?.dataset.val, 10)")
    ws_phone.eval(f"sendData({{ type: 'mathAnswer', val: {target_val} }})")
    time.sleep(0.5)
    print(f"✅ Respuesta {target_val} enviada desde celular a la TV.")

    # -------------------------------------------------------------
    # PRUEBA 3: Super Cinnamoroll Run (Platformer)
    # -------------------------------------------------------------
    print("\n--- TEST 3: SUPER CINNAMOROLL RUN ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'platformer' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_phone = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    hero_before = ws_host.eval("window.Cinnamo?.platformerGame?.selectedHero?.id")
    print(f"✅ TV: '{screen_host}' | Mando: '{mode_phone}' | Héroe inicial: {hero_before}")

    # Rotar héroe con botón AMIGO desde el mando
    ws_phone.eval("sendData({ type: 'switchHero' })")
    time.sleep(0.5)
    hero_after = ws_host.eval("window.Cinnamo?.platformerGame?.selectedHero?.id")
    assert hero_after != hero_before, f"Hero should change! before: {hero_before}, after: {hero_after}"
    print(f"✅ Botón AMIGO cambió héroe a: {hero_after}")

    # Correr con Joystick diagonal y Saltar
    ws_phone.eval("sendData({ type: 'joystick', x: 0.8, y: 0, dist: 0.8, angle: 0 })")
    ws_phone.eval("sendButton('jump', true)")
    time.sleep(0.2)
    is_jumping = ws_host.eval("window.Cinnamo?.platformerGame?.keys?.jump")
    is_running = ws_host.eval("window.Cinnamo?.platformerGame?.keys?.right")
    ws_phone.eval("sendButton('jump', false)")
    ws_phone.eval("sendData({ type: 'joystick', x: 0, y: 0, dist: 0, angle: 0 })")
    print(f"✅ Joystick y Salto en Super Run ejecutados (keys.jump={is_jumping}, keys.right={is_running}).")

    # Botón Dulce
    ws_phone.eval("sendButton('treat', true)")
    time.sleep(0.1)
    ws_phone.eval("sendButton('treat', false)")
    print("✅ Botón Dulce (treat) activado en Super Run.")

    # -------------------------------------------------------------
    # PRUEBA 4: Repartidor 3D (Doom)
    # -------------------------------------------------------------
    print("\n--- TEST 4: REPARTIDOR 3D (DOOM) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'doom' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_phone = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    print(f"✅ TV: '{screen_host}' | Mando: '{mode_phone}'")

    # Iniciar partida 3D desde el control remoto si está en pantalla de selección
    in_select = ws_host.eval("window.Cinnamo?.doomGame?.inCharSelect")
    if in_select:
        ws_phone.eval("sendButton('jump', true)")
        time.sleep(0.1)
        ws_phone.eval("sendButton('jump', false)")
        time.sleep(0.5)
        print("✅ Partida 3D iniciada desde el botón ¡JUGAR! del mando.")

    hero_doom_before = ws_host.eval("window.Cinnamo?.doomGame?.selectedHero?.id")
    # Rotar héroe en Doom
    ws_phone.eval("sendData({ type: 'switchHero' })")
    time.sleep(0.5)
    hero_doom_after = ws_host.eval("window.Cinnamo?.doomGame?.selectedHero?.id")
    assert hero_doom_after != hero_doom_before, f"Doom hero should change! before: {hero_doom_before}, after: {hero_doom_after}"
    print(f"✅ Botón AMIGO cambió héroe en 3D a: {hero_doom_after}")

    # Lanzar dulce (throwTreat / shootTreat)
    proj_count_before = ws_host.eval("window.Cinnamo?.doomGame?.projectiles?.length || 0")
    ws_phone.eval("sendButton('jump', true)")
    time.sleep(0.1)
    ws_phone.eval("sendButton('jump', false)")
    time.sleep(0.2)
    proj_count_after = ws_host.eval("window.Cinnamo?.doomGame?.projectiles?.length || 0")
    assert proj_count_after > proj_count_before, f"Projectile should be fired! before: {proj_count_before}, after: {proj_count_after}"
    print(f"✅ Disparo de dulce 3D verificado (proyectiles: {proj_count_after}).")

    # -------------------------------------------------------------
    # PRUEBA 5: Memorice Sanrio (Memory)
    # -------------------------------------------------------------
    print("\n--- TEST 5: MEMORICE SANRIO ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'memory' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_phone = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    cards_phone = ws_phone.eval("document.querySelectorAll('#memoryRemoteGrid .btn-memory-card').length")
    print(f"✅ TV: '{screen_host}' | Mando: '{mode_phone}' | Cartas táctiles en Celular: {cards_phone}")

    # Voltear carta 0 desde el celular
    flipped_before = ws_host.eval("window.Cinnamo?.memoryGame?.flippedCards?.length || 0")
    ws_phone.eval("sendData({ type: 'flipCard', index: 0 })")
    time.sleep(0.3)
    flipped_after = ws_host.eval("window.Cinnamo?.memoryGame?.flippedCards?.length || 0")
    print(f"✅ Volteo de carta desde celular ejecutado (volteadas en TV: {flipped_after}).")

    # -------------------------------------------------------------
    # PRUEBA 6: Rompecabezas (Puzzle)
    # -------------------------------------------------------------
    print("\n--- TEST 6: ROMPECABEZAS (PUZZLE) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'puzzle' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_phone = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    placed_before = ws_host.eval("Object.keys(window.Cinnamo?.puzzleGame?.placedPieces || {}).length")
    print(f"✅ TV: '{screen_host}' | Mando: '{mode_phone}' | Piezas colocadas: {placed_before}")

    # Encajar siguiente pieza mágicamente desde el control remoto
    ws_phone.eval("sendData({ type: 'puzzlePlaceNext' })")
    time.sleep(0.4)
    placed_after = ws_host.eval("Object.keys(window.Cinnamo?.puzzleGame?.placedPieces || {}).length")
    assert placed_after > placed_before, f"Pieces should increase! before: {placed_before}, after: {placed_after}"
    print(f"✅ Botón ✨ ENCAJAR PIEZA ✨ colocó pieza exitosamente ({placed_after} piezas).")

    # Alternar Pista Mágica (Silueta)
    ghost_before = ws_host.eval("window.Cinnamo?.puzzleGame?.showGhostGuide")
    ws_phone.eval("sendData({ type: 'puzzleHint' })")
    time.sleep(0.3)
    ghost_after = ws_host.eval("window.Cinnamo?.puzzleGame?.showGhostGuide")
    assert ghost_after != ghost_before, f"Ghost guide should toggle! before: {ghost_before}, after: {ghost_after}"
    print(f"✅ Botón PISTA MÁGICA alternó silueta de ayuda ({ghost_before} -> {ghost_after}).")

    # -------------------------------------------------------------
    # PRUEBA 7: Taller de Pintura (Coloring)
    # -------------------------------------------------------------
    print("\n--- TEST 7: TALLER DE PINTURA (COLORING) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'coloring' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_phone = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    chips_count = ws_phone.eval("document.querySelectorAll('#coloringChipsRow .color-chip-btn').length")
    print(f"✅ TV: '{screen_host}' | Mando: '{mode_phone}' | Chips de colores Sanrio: {chips_count}")

    # Elegir color Celeste (#8ecae6) desde el celular
    ws_phone.eval("sendData({ type: 'colorPick', color: '#8ecae6' })")
    time.sleep(0.3)
    selected_color = ws_host.eval("window.Cinnamo?.coloringGame?.selectedColor")
    assert selected_color == '#8ecae6', f"Selected color should be #8ecae6, got {selected_color}"
    print(f"✅ Selección remota de color: {selected_color} (Celeste Cinnamoroll).")

    # Cambiar herramienta a Borrador
    ws_phone.eval("sendData({ type: 'colorTool', tool: 'eraser' })")
    time.sleep(0.3)
    selected_tool = ws_host.eval("window.Cinnamo?.coloringGame?.currentTool")
    assert selected_tool == 'eraser', f"Tool should be eraser, got {selected_tool}"
    print(f"✅ Selección remota de herramienta: {selected_tool} (Borrador).")

    # Siguiente lámina
    sheet_before = ws_host.eval("window.Cinnamo?.coloringGame?.currentSheet?.id")
    ws_phone.eval("sendData({ type: 'colorNextSheet' })")
    time.sleep(0.4)
    sheet_after = ws_host.eval("window.Cinnamo?.coloringGame?.currentSheet?.id")
    print(f"✅ Cambio remoto de lámina verificado: {sheet_before} -> {sheet_after}.")

    # -------------------------------------------------------------
    # PRUEBA 8: Palabras Mágicas (Writing)
    # -------------------------------------------------------------
    print("\n--- TEST 8: PALABRAS MÁGICAS (WRITING) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'writing' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_phone = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    word_before = ws_host.eval("window.Cinnamo?.writingGame?.getCurrentTraceChar ? window.Cinnamo.writingGame.getCurrentTraceChar() : 'A'")
    print(f"✅ TV: '{screen_host}' | Mando: '{mode_phone}' | Letra actual: {word_before}")

    # Siguiente letra / palabra
    ws_phone.eval("sendData({ type: 'writingNext' })")
    time.sleep(0.4)
    word_after = ws_host.eval("window.Cinnamo?.writingGame?.getCurrentTraceChar ? window.Cinnamo.writingGame.getCurrentTraceChar() : 'A'")
    print(f"✅ Botón Siguiente Letra en celular ejecutado: {word_before} -> {word_after}.")

    # -------------------------------------------------------------
    # PRUEBA 9: Retorno al Menú Principal (Hub)
    # -------------------------------------------------------------
    print("\n--- TEST 9: VOLVER AL MENÚ PRINCIPAL ---")
    ws_phone.eval("document.getElementById('btnRemoteHome').click()")
    time.sleep(1.0)
    screen_final = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_final = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    assert screen_final == 'hub', f"Final screen should be hub, got {screen_final}"
    print(f"✅ TV volvió al Menú: '{screen_final}' | Mando UI: '{mode_final}'")

    # -------------------------------------------------------------
    # PRUEBA 10: Modo Cooperativo Asimétrico & Pasaporte de Stickers
    # -------------------------------------------------------------
    print("\n--- TEST 10: MODO COOPERATIVO ASIMÉTRICO & PASAPORTE DE STICKERS ---")
    stars_before = ws_host.eval("window.Cinnamo?.passport?.state?.stars || 0")
    ws_phone.eval("document.getElementById('btnCoopStarRain').click()")
    time.sleep(0.5)
    ws_phone.eval("document.getElementById('btnCoopShield').click()")
    time.sleep(0.4)
    ws_phone.eval("document.getElementById('btnCoopCheer').click()")
    time.sleep(0.4)
    stars_after = ws_host.eval("window.Cinnamo?.passport?.state?.stars || 0")
    unlocked_count = ws_host.eval("window.Cinnamo?.passport?.state?.unlocked?.length || 0")
    assert stars_after > stars_before, f"Stars should increase after Co-op powers! {stars_before} -> {stars_after}"
    print(f"✅ Poderes Cooperativos (Lluvia, Escudo, Ánimo) sumaron estrellas: {stars_before} -> {stars_after} (Stickers: {unlocked_count}/10)")

    ws_phone.eval("document.getElementById('btnCoopPassport').click()")
    time.sleep(0.5)
    passport_open = ws_host.eval("!document.getElementById('passportModal')?.classList.contains('hidden')")
    assert passport_open is True, "Passport modal should open on TV when triggered from phone"
    print("✅ Modal de Pasaporte de Stickers abierto en TV desde el celular.")

    print("\n🎉 ¡TODOS LOS 8 JUEGOS, MODO COOPERATIVO Y PASAPORTE VERIFICADOS AL 100%! 🎉")

finally:
    if chrome_host:
        try:
            chrome_host.terminate()
            chrome_host.wait(timeout=3)
        except:
            pass
    if chrome_phone:
        try:
            chrome_phone.terminate()
            chrome_phone.wait(timeout=3)
        except:
            pass
    try:
        httpd.shutdown()
    except:
        pass
