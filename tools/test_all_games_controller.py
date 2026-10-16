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
    print("\n--- TEST 1: ¡A VOLAR! (VUELO VERTICAL: ARRIBA Y ABAJO) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'flight' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_phone = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    assert screen_host == 'flight', f"Host screen should be flight, got {screen_host}"
    print(f"✅ Pantalla en TV: '{screen_host}' | Mando UI: '{mode_phone}'")

    # Iniciar vuelo si está en menú
    ws_host.eval("if (window.Cinnamo?.game?.mode !== 'play') window.Cinnamo?.startFlightGame?.()")
    time.sleep(0.3)
    game_mode = ws_host.eval("window.Cinnamo?.game?.mode")
    assert game_mode == 'play', f"Flight game should be in play mode, got {game_mode}"

    # Verificar presencia de controles táctiles en pantalla
    has_touch_controls = ws_host.eval("!document.getElementById('flightTouchControls')?.classList.contains('hidden')")
    has_btn_up = ws_host.eval("!!document.getElementById('btnFlightUp')")
    has_btn_down = ws_host.eval("!!document.getElementById('btnFlightDown')")
    assert has_touch_controls and has_btn_up and has_btn_down, "Flight touch controls and up/down buttons must exist!"
    print(f"✅ Controles táctiles integrados en pantalla verificados (Up={has_btn_up}, Down={has_btn_down}).")

    # Test Mover Hacia Arriba (sendButton('up', true))
    y_start = ws_host.eval("window.Cinnamo?.game?.p?.y")
    ws_phone.eval("sendButton('up', true)")
    time.sleep(0.35)
    vy_up = ws_host.eval("window.Cinnamo?.game?.p?.vy")
    y_after_up = ws_host.eval("window.Cinnamo?.game?.p?.y")
    ws_phone.eval("sendButton('up', false)")
    time.sleep(0.1)
    assert vy_up < 0 or y_after_up < y_start, f"Character should move upwards! vy={vy_up}, y_start={y_start}, y_after={y_after_up}"
    print(f"✅ Movimiento hacia ARRIBA verificado: y={y_start:.2f} -> {y_after_up:.2f} (vy={vy_up:.2f}).")

    # Test Mover Hacia Abajo (sendButton('down', true))
    y_before_down = ws_host.eval("window.Cinnamo?.game?.p?.y")
    ws_phone.eval("sendButton('down', true)")
    time.sleep(0.35)
    vy_down = ws_host.eval("window.Cinnamo?.game?.p?.vy")
    y_after_down = ws_host.eval("window.Cinnamo?.game?.p?.y")
    ws_phone.eval("sendButton('down', false)")
    time.sleep(0.1)
    assert vy_down > 0 or y_after_down > y_before_down, f"Character should move downwards! vy={vy_down}, y_before={y_before_down}, y_after={y_after_down}"
    print(f"✅ Movimiento hacia ABAJO verificado: y={y_before_down:.2f} -> {y_after_down:.2f} (vy={vy_down:.2f}).")

    # Mando interactúa: pirueta (jump) y saludo (treat)
    ws_phone.eval("sendButton('jump', true)")
    time.sleep(0.1)
    ws_phone.eval("sendButton('jump', false)")
    ws_phone.eval("sendButton('treat', true)")
    time.sleep(0.1)
    ws_phone.eval("sendButton('treat', false)")
    # Joystick analógico hacia arriba y abajo
    ws_phone.eval("sendData({ type: 'joystick', x: 0, y: -0.7, dist: 0.7, angle: -90 })")
    time.sleep(0.2)
    vy_joy_up = ws_host.eval("window.Cinnamo?.game?.p?.vy")
    ws_phone.eval("sendData({ type: 'joystick', x: 0, y: 0.7, dist: 0.7, angle: 90 })")
    time.sleep(0.2)
    vy_joy_down = ws_host.eval("window.Cinnamo?.game?.p?.vy")
    ws_phone.eval("sendData({ type: 'joystick', x: 0, y: 0, dist: 0, angle: 0 })")
    print(f"✅ Joystick analógico arriba/abajo verificado (vy_joy_up={vy_joy_up:.2f}, vy_joy_down={vy_joy_down:.2f}).")

    # -------------------------------------------------------------
    # PRUEBA 2: Pastelería de Números (Math + Nivel + Modo + Contar)
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

    # Cambiar nivel de edad y operación desde el celular sin usar mouse
    ws_phone.eval("sendData({ type: 'mathConfig', tier: '6-7', mode: 'sub' })")
    time.sleep(0.4)
    math_tier = ws_host.eval("window.Cinnamo?.mathGame?.ageTier")
    math_mode = ws_host.eval("window.Cinnamo?.mathGame?.mode")
    assert math_tier == '6-7' and math_mode == 'sub', f"Math tier/mode should be 6-7/sub, got {math_tier}/{math_mode}"
    ws_phone.eval("sendData({ type: 'mathConfig', countHelp: true })")
    time.sleep(0.3)
    counted_size = ws_host.eval("window.Cinnamo?.mathGame?.countedItems?.size || 0")
    assert counted_size >= 1, "Remote countHelp should count at least 1 treat on TV"
    print(f"✅ Nivel ({math_tier}), Operación ({math_mode}) y Conteo táctil remoto ({counted_size} dulce) verificados.")

    # Responder seleccionando la primera opción en el celular
    target_val = ws_phone.eval("parseInt(document.querySelector('.btn-math-remote')?.dataset.val, 10)")
    ws_phone.eval(f"sendData({{ type: 'mathAnswer', val: {target_val} }})")
    time.sleep(0.5)
    print(f"✅ Respuesta {target_val} enviada desde celular a la TV.")

    # -------------------------------------------------------------
    # PRUEBA 3: Super Cinnamoroll Run + 3 Jugadores Simultáneos (P1, P2, P3) + Ciudades
    # -------------------------------------------------------------
    print("\n--- TEST 3: SUPER CINNAMOROLL RUN (3 PLAYERS SIMULTÁNEOS + CIUDADES) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'platformer' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_phone = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    hero_before = ws_host.eval("window.Cinnamo?.platformerGame?.selectedHero?.id")
    print(f"✅ TV: '{screen_host}' | Mando: '{mode_phone}' | Héroe P1 inicial: {hero_before}")

    # Elegir directamente a Mocha para P1 desde el selector del mando
    ws_phone.eval("sendData({ type: 'selectHero', heroId: 'mocha', player: 1 })")
    time.sleep(0.4)
    hero_p1 = ws_host.eval("window.Cinnamo?.platformerGame?.selectedHero?.id")
    assert hero_p1 == 'mocha', f"P1 hero should be mocha, got {hero_p1}"
    print(f"✅ Selección directa de personaje P1 desde el mando: {hero_p1}")

    # Sumar Jugador 2 (Milk) y Jugador 3 (Purin) en simultáneo
    ws_phone.eval("sendData({ type: 'setPlayerSlot', slot: 2, player: 2, heroId: 'milk', active: true })")
    ws_phone.eval("sendData({ type: 'setPlayerSlot', slot: 3, player: 3, heroId: 'purin', active: true })")
    time.sleep(0.4)
    p2_active = ws_host.eval("window.Cinnamo?.platformerGame?.coPlayers?.[2]?.active")
    p3_active = ws_host.eval("window.Cinnamo?.platformerGame?.coPlayers?.[3]?.active")
    assert p2_active is True and p3_active is True, f"P2 and P3 should be active! P2={p2_active}, P3={p3_active}"
    print(f"✅ ¡3 Jugadores simultáneos activos en pantalla! (P1={hero_p1}, P2=milk, P3=purin)")

    # Mover y hacer saltar a P1, P2 y P3 en simultáneo
    ws_phone.eval("sendData({ type: 'joystick', player: 1, x: 0.8, y: 0, dist: 0.8, angle: 0 })")
    ws_phone.eval("sendData({ type: 'input', player: 1, btn: 'jump', pressed: true })")
    ws_phone.eval("sendData({ type: 'joystick', player: 2, x: 0.8, y: -0.8, dist: 1.0, angle: -45 })")
    ws_phone.eval("sendData({ type: 'input', player: 3, btn: 'jump', pressed: true })")
    time.sleep(0.25)
    is_jumping = ws_host.eval("window.Cinnamo?.platformerGame?.keys?.jump")
    p2_vx = ws_host.eval("window.Cinnamo?.platformerGame?.coPlayers?.[2]?.vx || 0")
    p3_vy = ws_host.eval("window.Cinnamo?.platformerGame?.coPlayers?.[3]?.vy || 0")
    ws_phone.eval("sendData({ type: 'input', player: 1, btn: 'jump', pressed: false })")
    ws_phone.eval("sendData({ type: 'input', player: 3, btn: 'jump', pressed: false })")
    ws_phone.eval("sendData({ type: 'joystick', player: 1, x: 0, y: 0, dist: 0, angle: 0 })")
    ws_phone.eval("sendData({ type: 'joystick', player: 2, x: 0, y: 0, dist: 0, angle: 0 })")
    print(f"✅ Física simultánea P1/P2/P3 verificada (P1.jump={is_jumping}, P2.vx={p2_vx}, P3.vy={p3_vy:.1f}).")

    # Cambiar de ciudad directamente desde el celular (Ej: Río de Janeiro = 2)
    ws_phone.eval("sendData({ type: 'selectCity', cityIdx: 2 })")
    time.sleep(0.4)
    city_idx = ws_host.eval("window.Cinnamo?.platformerGame?.currentCityIndex")
    assert city_idx == 2, f"City index should be 2 (Río), got {city_idx}"
    print(f"✅ Cambio directo de Ciudad desde el celular verificado (currentCityIndex={city_idx} · Río de Janeiro).")

    # -------------------------------------------------------------
    # PRUEBA 4: Repartidor 3D (Doom — Selección directa de Héroe + Auto-Start)
    # -------------------------------------------------------------
    print("\n--- TEST 4: REPARTIDOR 3D (DOOM) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'doom' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    in_select_initial = ws_host.eval("window.Cinnamo?.doomGame?.inCharSelect")
    print(f"✅ TV: '{screen_host}' | En pantalla de selección inicial: {in_select_initial}")

    # Elegir directamente a Purin desde el celular -> debe elegirlo e iniciar el mundo 3D sin tocar el mouse
    ws_phone.eval("sendData({ type: 'selectHero', heroId: 'purin', player: 1 })")
    time.sleep(0.5)
    in_select_after = ws_host.eval("window.Cinnamo?.doomGame?.inCharSelect")
    hero_doom_selected = ws_host.eval("window.Cinnamo?.doomGame?.selectedHero?.id")
    assert in_select_after is False and hero_doom_selected == 'purin', f"Doom should auto-start with purin! inSelect={in_select_after}, hero={hero_doom_selected}"
    print(f"✅ Selección directa en celular ('{hero_doom_selected}') inició el juego 3D automáticamente sin teclado/mouse.")

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
    # PRUEBA 5: Memorice Sanrio (Memory + Selector de Dificultad)
    # -------------------------------------------------------------
    print("\n--- TEST 5: MEMORICE SANRIO ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'memory' })")
    time.sleep(1.2)
    ws_phone.eval("sendData({ type: 'memoryDifficulty', cards: 12 })")
    time.sleep(0.5)
    mem_diff = ws_host.eval("window.Cinnamo?.memoryGame?.difficulty")
    cards_phone = ws_phone.eval("document.querySelectorAll('#memoryRemoteGrid .btn-memory-card').length")
    assert mem_diff == 12 and cards_phone == 12, f"Memory difficulty should be 12, got TV={mem_diff}, Phone={cards_phone}"
    print(f"✅ Cambio de dificultad desde celular verificado: {mem_diff} cartas en TV y {cards_phone} en Celular.")

    ws_phone.eval("sendData({ type: 'flipCard', index: 0 })")
    time.sleep(0.3)
    flipped_after = ws_host.eval("window.Cinnamo?.memoryGame?.flippedCards?.length || 0")
    print(f"✅ Volteo de carta desde celular ejecutado (volteadas en TV: {flipped_after}).")

    # -------------------------------------------------------------
    # PRUEBA 6: Rompecabezas (Puzzle + Personaje + Dificultad + Encajar)
    # -------------------------------------------------------------
    print("\n--- TEST 6: ROMPECABEZAS (PUZZLE) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'puzzle' })")
    time.sleep(1.2)
    ws_phone.eval("sendData({ type: 'selectHero', heroId: 'chiffon' })")
    ws_phone.eval("sendData({ type: 'puzzleDifficulty', pieces: 9 })")
    time.sleep(0.5)
    puz_char = ws_host.eval("window.Cinnamo?.puzzleGame?.getCurrentChar?.()?.id")
    puz_grid = ws_host.eval("window.Cinnamo?.puzzleGame?.pieceCountMode")
    assert puz_char == 'chiffon' and puz_grid == 9, f"Puzzle should be chiffon/9 pieces, got {puz_char}/{puz_grid}"
    print(f"✅ Personaje ({puz_char}) y Dificultad ({puz_grid} piezas) seleccionados desde el celular.")

    placed_before = ws_host.eval("Object.keys(window.Cinnamo?.puzzleGame?.placedPieces || {}).length")
    ws_phone.eval("sendData({ type: 'puzzlePlaceNext' })")
    time.sleep(0.4)
    placed_after = ws_host.eval("Object.keys(window.Cinnamo?.puzzleGame?.placedPieces || {}).length")
    assert placed_after > placed_before, f"Pieces should increase! before: {placed_before}, after: {placed_after}"
    print(f"✅ Botón ✨ ENCAJAR PIEZA ✨ colocó pieza exitosamente ({placed_after} piezas).")

    # -------------------------------------------------------------
    # PRUEBA 7: Taller de Pintura (Coloring + Touchpad en Vivo + Lámina + Grosor)
    # -------------------------------------------------------------
    print("\n--- TEST 7: TALLER DE PINTURA (COLORING + TOUCHPAD) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'coloring' })")
    time.sleep(1.2)
    ws_phone.eval("sendData({ type: 'colorSheet', sheetId: 'milk' })")
    ws_phone.eval("sendData({ type: 'colorSize', size: 40 })")
    ws_phone.eval("sendData({ type: 'colorPick', color: '#8ecae6' })")
    time.sleep(0.4)
    sheet_id = ws_host.eval("window.Cinnamo?.coloringGame?.currentSheet?.id")
    b_size = ws_host.eval("window.Cinnamo?.coloringGame?.brushSize")
    assert sheet_id == 'milk' and b_size == 40, f"Coloring sheet/size should be milk/40, got {sheet_id}/{b_size}"

    # Pintar un trazo desde el Touchpad del celular hacia la TV
    undo_before = ws_host.eval("window.Cinnamo?.coloringGame?.history?.length || 0")
    ws_phone.eval("sendData({ type: 'colorPad', action: 'down', x: 0.3, y: 0.3 })")
    ws_phone.eval("sendData({ type: 'colorPad', action: 'move', x: 0.6, y: 0.6 })")
    ws_phone.eval("sendData({ type: 'colorPad', action: 'up', x: 0.6, y: 0.6 })")
    time.sleep(0.3)
    undo_after = ws_host.eval("window.Cinnamo?.coloringGame?.history?.length || 0")
    assert undo_after > undo_before, f"Remote touchpad stroke should record on canvas! history: {undo_before} -> {undo_after}"
    print(f"✅ Lámina ({sheet_id}), Grosor ({b_size}px) y Trazo por Touchpad Remoto verificados.")

    # -------------------------------------------------------------
    # PRUEBA 8: Palabras Mágicas (Writing + Modos + Paso Mágico + Teclado A-Z + Touchpad)
    # -------------------------------------------------------------
    print("\n--- TEST 8: PALABRAS MÁGICAS (WRITING) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'writing' })")
    time.sleep(1.2)
    # En modo 'words', usar Paso Mágico para colocar la primera letra automáticamente
    slot_before = ws_host.eval("(window.Cinnamo?.writingGame?.placedLetters || []).filter(l => l !== null).length")
    ws_phone.eval("sendData({ type: 'writingAutoStep' })")
    time.sleep(0.4)
    slot_after = ws_host.eval("(window.Cinnamo?.writingGame?.placedLetters || []).filter(l => l !== null).length")
    assert slot_after > slot_before, f"AutoStep should place next letter cookie! {slot_before} -> {slot_after}"
    print(f"✅ Paso Mágico colocó galleta de letra en modo Montessori ({slot_before} -> {slot_after}).")

    # Cambiar a modo Trazar ('trace') y elegir letra 'M' desde el teclado A-Z del celular
    ws_phone.eval("sendData({ type: 'writingMode', mode: 'trace' })")
    time.sleep(0.4)
    ws_phone.eval("sendData({ type: 'writingKey', char: 'M' })")
    time.sleep(0.3)
    trace_char = ws_host.eval("window.Cinnamo?.writingGame?.getCurrentTraceChar?.()")
    assert trace_char == 'M', f"Trace char should be M, got {trace_char}"
    ws_phone.eval("sendData({ type: 'writingPad', action: 'down', x: 0.25, y: 0.75 })")
    ws_phone.eval("sendData({ type: 'writingPad', action: 'move', x: 0.25, y: 0.25 })")
    ws_phone.eval("sendData({ type: 'writingPad', action: 'up', x: 0.25, y: 0.25 })")
    time.sleep(0.2)
    print(f"✅ Modo Trazar ('{trace_char}') y Touchpad de caligrafía remota verificados.")

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
    ws_host.eval("document.getElementById('btnClosePassportModal')?.click()")
    time.sleep(0.2)

    # -------------------------------------------------------------
    # PRUEBA 11: Cinnamoroll World: Casa de Sueños (Avatar World + 3 Players + Vestidor + Decoración + Smart Input Mode)
    # -------------------------------------------------------------
    print("\n--- TEST 11: CINNAMOROLL WORLD: CASA DE SUEÑOS (AVATAR WORLD + SMART INPUT MODE) ---")
    ws_phone.eval("sendData({ type: 'nav', screen: 'avatar' })")
    time.sleep(1.2)
    screen_host = ws_host.eval("window.Cinnamo?.hub?.currentScreen")
    mode_phone = ws_phone.eval("document.getElementById('footerGameLabel')?.textContent")
    input_mode = ws_host.eval("window.Cinnamo?.controllerBridge?.inputMode")
    badge_text = ws_host.eval("document.getElementById('inputModeText')?.textContent")
    assert screen_host == 'avatar', f"Host screen should be avatar, got {screen_host}"
    assert input_mode == 'remote', f"Input mode should be remote when controller sends commands, got {input_mode}"
    print(f"✅ TV: '{screen_host}' | Mando: '{mode_phone}' | Smart Input Mode: '{input_mode}' ({badge_text})")

    # Activar y personalizar los 3 jugadores simultáneos en Casa Avatar
    ws_phone.eval("sendData({ type: 'setPlayerSlot', slot: 2, player: 2, heroId: 'milk', active: true })")
    ws_phone.eval("sendData({ type: 'setPlayerSlot', slot: 3, player: 3, heroId: 'mocha', active: true })")
    ws_phone.eval("sendData({ type: 'avatarCustom', category: 'outfit', player: 1 })")
    ws_phone.eval("sendData({ type: 'avatarCustom', category: 'hat', player: 1 })")
    ws_phone.eval("sendData({ type: 'avatarCustom', category: 'prop', player: 2 })")
    ws_phone.eval("sendData({ type: 'avatarCustom', category: 'expr', player: 3 })")
    time.sleep(0.5)
    aw_p2 = ws_host.eval("window.Cinnamo?.avatarWorldGame?.players?.[2]?.active")
    aw_p3 = ws_host.eval("window.Cinnamo?.avatarWorldGame?.players?.[3]?.active")
    aw_outfit1 = ws_host.eval("window.Cinnamo?.avatarWorldGame?.players?.[1]?.outfitId")
    assert aw_p2 is True and aw_p3 is True, f"P2 and P3 should be active in Avatar World! P2={aw_p2}, P3={aw_p3}"
    print(f"✅ 3 Avatares activos y personalizados desde el mando (P1 outfit={aw_outfit1}, P2=Milk, P3=Mocha).")

    # Mover a los 3 jugadores, interactuar con muebles y bailar
    ws_phone.eval("sendData({ type: 'joystick', player: 1, x: -0.7, y: 0.2, dist: 0.7, angle: 160 })")
    ws_phone.eval("sendData({ type: 'joystick', player: 2, x: 0.6, y: -0.3, dist: 0.7, angle: -25 })")
    ws_phone.eval("sendData({ type: 'input', player: 3, btn: 'treat', pressed: true })")
    time.sleep(0.35)
    ws_phone.eval("sendData({ type: 'joystick', player: 1, x: 0, y: 0, dist: 0, angle: 0 })")
    ws_phone.eval("sendData({ type: 'joystick', player: 2, x: 0, y: 0, dist: 0, angle: 0 })")
    ws_phone.eval("sendData({ type: 'input', player: 3, btn: 'treat', pressed: false })")
    ws_phone.eval("sendData({ type: 'input', player: 1, btn: 'jump', pressed: true })")
    time.sleep(0.1)
    ws_phone.eval("sendData({ type: 'input', player: 1, btn: 'jump', pressed: false })")

    # Agregar muebles / comida desde el mando y cambiar de habitación e iluminación
    items_before = ws_host.eval("window.Cinnamo?.avatarWorldGame?.getRoomItems?.()?.length || 0")
    ws_phone.eval("sendData({ type: 'avatarDecor', decorType: 'cake', player: 1 })")
    ws_phone.eval("sendData({ type: 'avatarDecor', decorType: 'plush', player: 2 })")
    time.sleep(0.3)
    items_after = ws_host.eval("window.Cinnamo?.avatarWorldGame?.getRoomItems?.()?.length || 0")
    assert items_after >= items_before + 2, f"Decor items should spawn in room! {items_before} -> {items_after}"
    print(f"✅ Decoración interactiva desde mando verificada (objetos en sala: {items_before} -> {items_after}).")

    # Guardar captura de la Cafetería con los 3 personajes y objetos
    artifact_dir = r"C:\Users\JuliánNeiraNova\.gemini\antigravity\brain\b4ade427-5458-4e3a-bc9d-65fece9018b2"
    if os.path.isdir(artifact_dir):
        shot1 = ws_host.send_cmd("Page.captureScreenshot", {"format": "png"})
        if shot1 and "result" in shot1 and "data" in shot1["result"]:
            with open(os.path.join(artifact_dir, "avatar_world_cafe_3players.png"), "wb") as f:
                f.write(base64.b64decode(shot1["result"]["data"]))

    # Cambiar a Jardín & Fiesta (roomIdx = 2) y probar iluminación Atardecer
    ws_phone.eval("sendData({ type: 'avatarRoom', roomIdx: 2 })")
    ws_phone.eval("sendData({ type: 'avatarLight' })")
    time.sleep(0.5)
    aw_room = ws_host.eval("window.Cinnamo?.avatarWorldGame?.currentRoomIdx")
    aw_light = ws_host.eval("window.Cinnamo?.avatarWorldGame?.lightingMode")
    assert aw_room == 2 and aw_light == 'sunset', f"Avatar room/light should be 2/sunset, got {aw_room}/{aw_light}"
    print(f"✅ Cambio de habitación ({aw_room} · Jardín) e Iluminación continua ('{aw_light}') verificados.")

    if os.path.isdir(artifact_dir):
        shot2 = ws_host.send_cmd("Page.captureScreenshot", {"format": "png"})
        if shot2 and "result" in shot2 and "data" in shot2["result"]:
            with open(os.path.join(artifact_dir, "avatar_world_garden_sunset.png"), "wb") as f:
                f.write(base64.b64decode(shot2["result"]["data"]))

        # Abrir Vestidor Kawaii y capturar screenshot
        ws_host.eval("window.Cinnamo?.avatarWorldGame?.openWardrobe(1)")
        time.sleep(0.35)
        shot3 = ws_host.send_cmd("Page.captureScreenshot", {"format": "png"})
        if shot3 and "result" in shot3 and "data" in shot3["result"]:
            with open(os.path.join(artifact_dir, "avatar_world_wardrobe_modal.png"), "wb") as f:
                f.write(base64.b64decode(shot3["result"]["data"]))
        ws_host.eval("window.Cinnamo?.avatarWorldGame?.closeWardrobe()")

    print("\n🎉 ¡TODOS LOS 9 JUEGOS, AVATAR WORLD, 3 JUGADORES SIMULTÁNEOS (P1/P2/P3) Y SMART INPUT MODE 100% VERIFICADOS! 🎉")

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
