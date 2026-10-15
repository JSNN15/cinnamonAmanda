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

PORT = 8994

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
t_server = threading.Thread(target=httpd.serve_forever, daemon=True)
t_server.start()

user_data_dir = os.path.join(os.environ.get("TEMP", "C:\\temp"), "test_platformer_v20")
chrome_proc = subprocess.Popen([
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless=new",
    "--remote-debugging-port=9232",
    f"--user-data-dir={user_data_dir}",
    "--no-first-run",
    "--disable-gpu",
    "--window-size=960,600",
    f"http://127.0.0.1:{PORT}/index.html#platformer"
])
time.sleep(2.5)

tabs = json.loads(urllib.request.urlopen("http://127.0.0.1:9232/json").read())
target_tab = next(t for t in tabs if f"{PORT}" in t.get("url", ""))
ws_url = target_tab["webSocketDebuggerUrl"]
host_port, path = ws_url.replace("ws://", "").split("/", 1)
host, port = host_port.split(":")
s = socket.create_connection((host, int(port)))
key = base64.b64encode(os.urandom(16)).decode()
req = f"GET /{path} HTTP/1.1\r\nHost: {host_port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
s.sendall(req.encode())
s.recv(4096)

def ws_send(data):
    b = data.encode('utf-8')
    l = len(b)
    m = os.urandom(4)
    h = bytearray([0x81, 0x80 | (126 if l > 125 else l)])
    if l > 125: h.extend(l.to_bytes(2, 'big'))
    h.extend(m)
    h.extend([b[i] ^ m[i%4] for i in range(l)])
    s.sendall(h)

def ws_recv():
    buf = bytearray()
    while len(buf) < 2: buf.extend(s.recv(4096))
    plen = buf[1] & 0x7F
    off = 2
    if plen == 126:
        while len(buf) < 4: buf.extend(s.recv(4096))
        plen = int.from_bytes(buf[2:4], 'big'); off = 4
    while len(buf) < off + plen: buf.extend(s.recv(4096))
    return buf[off:off+plen].decode('utf-8', errors='ignore')

req_id = 0
def eval_js(expr):
    global req_id
    req_id += 1
    msg = {"id": req_id, "method": "Runtime.evaluate", "params": {"expression": expr, "returnByValue": True}}
    ws_send(json.dumps(msg))
    while True:
        res = json.loads(ws_recv())
        if res.get("id") == req_id:
            return res.get("result", {}).get("result", {}).get("value")

failures = []

try:
    print("==================================================")
    print("SUITE DE PRUEBAS V20: SALTO Y CONTROLES PLATFORMER")
    print("==================================================")

    # 1. Verificar existencia del método jump() y tryJump() en platformerGame
    has_jump = eval_js("typeof window.Cinnamo.platformerGame.jump === 'function'")
    has_try_jump = eval_js("typeof window.Cinnamo.platformerGame.tryJump === 'function'")
    print(f"1. Metodos jump() y tryJump() presentes: jump={has_jump}, tryJump={has_try_jump}")
    if not (has_jump and has_try_jump):
        failures.append("platformerGame no tiene metodos jump() y tryJump()")

    # 2. Verificar salto desde el suelo
    eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            g.buildCityLevel(0);
            g.p.x = 100;
            g.p.y = 392;
            g.p.vy = 0;
            g.p.grounded = true;
            g.p.canDoubleJump = true;
            g.jump();
        })()
    """)
    st_jump1 = eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            return { vy: g.p.vy, grounded: g.p.grounded, canDoubleJump: g.p.canDoubleJump };
        })()
    """)
    print(f"2. Salto desde el suelo: vy={st_jump1['vy']} (esperado <= -500), grounded={st_jump1['grounded']}")
    if st_jump1['vy'] > -500 or st_jump1['grounded']:
        failures.append(f"Fallo salto desde el suelo: vy={st_jump1['vy']}, grounded={st_jump1['grounded']}")

    # 3. Verificar doble salto / aleteo magico en el aire
    eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            g.p.grounded = false;
            g.p.coyoteTimer = 0;
            g.p.vy = 50; // cayendo
            g.jump();
        })()
    """)
    st_double = eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            return { vy: g.p.vy, grounded: g.p.grounded, canDoubleJump: g.p.canDoubleJump };
        })()
    """)
    print(f"3. Doble salto / Aleteo en el aire: vy={st_double['vy']} (esperado <= -450), canDoubleJump={st_double['canDoubleJump']}")
    if st_double['vy'] > -450 or st_double['canDoubleJump']:
        failures.append(f"Fallo doble salto: vy={st_double['vy']}, canDoubleJump={st_double['canDoubleJump']}")

    # 4. Verificar salto desde puente de mando remoto (controller-bridge)
    eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            const b = window.Cinnamo.bridge;
            g.p.x = 200;
            g.p.y = 392;
            g.p.vy = 0;
            g.p.grounded = true;
            b.handleRemoteInput('jump', true);
        })()
    """)
    st_remote = eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            return { vy: g.p.vy, jumpKey: g.keys.jump };
        })()
    """)
    print(f"4. Salto desde control remoto (handleRemoteInput 'jump'): vy={st_remote['vy']} (esperado <= -500), key={st_remote['jumpKey']}")
    if st_remote['vy'] > -500 or not st_remote['jumpKey']:
        failures.append(f"Fallo salto remoto: vy={st_remote['vy']}")

    # 5. Verificar salto analógico arriba desde palanca joystick
    eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            const b = window.Cinnamo.bridge;
            g.p.x = 200;
            g.p.y = 392;
            g.p.vy = 0;
            g.p.grounded = true;
            g.keys.jump = false;
            b.handleRemoteJoystick(0.5, -0.7, -54, 0.86);
        })()
    """)
    st_joy = eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            return { vy: g.p.vy, right: g.keys.right, jump: g.keys.jump };
        })()
    """)
    print(f"5. Salto diagonal desde joystick analógico: vy={st_joy['vy']}, right={st_joy['right']}, jump={st_joy['jump']}")
    if st_joy['vy'] > -500 or not st_joy['right'] or not st_joy['jump']:
        failures.append(f"Fallo joystick diagonal: {st_joy}")

    # 6. Verificar continuidad del suelo en las 5 ciudades (CERO pozos sin fondo)
    cities_check = eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            const results = [];
            for (let cidx = 0; cidx < 5; cidx++) {
                g.buildCityLevel(cidx);
                const maxW = g.levelWidth;
                let gaps = 0;
                let worstGapX = null;
                // Verificar paso a paso cada 20px
                for (let x = 0; x < maxW - 400; x += 20) {
                    const hasGround = g.platforms.some(plat => 
                        plat.type === 'ground' && 
                        x + 50 > plat.x && 
                        x + 20 < plat.x + plat.w
                    );
                    if (!hasGround) {
                        gaps++;
                        if (worstGapX === null) worstGapX = x;
                    }
                }
                results.push({ cidx, maxW, gaps, worstGapX });
            }
            return results;
        })()
    """)
    print("6. Verificación de suelo continuo en 5 ciudades:")
    for cr in cities_check:
        print(f"   - Ciudad {cr['cidx']} (ancho {cr['maxW']}px): {cr['gaps']} huecos en el suelo")
        if cr['gaps'] > 0:
            failures.append(f"Ciudad {cr['cidx']} tiene huecos en el suelo (primer hueco en x={cr['worstGapX']})")

    # 7. Verificar rescate de caídas (sin bucle infinito)
    rescue_check = eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            g.buildCityLevel(0);
            g.p.lastSafeX = 300;
            g.p.lastSafeY = 392;
            g.p.x = 500;
            g.p.y = 530; // cae
            g.p.vx = 300;
            g.p.vy = 400;

            // Actualizar 1 frame de rescate
            g.update(0.016);
            const afterRescue = { x: g.p.x, y: g.p.y, vx: g.p.vx, vy: g.p.vy, grounded: g.p.grounded };

            // Simular 60 frames (1 segundo)
            let fellAgain = false;
            for (let f = 0; f < 60; f++) {
                g.update(0.016);
                if (g.p.y > 515) fellAgain = true;
            }

            return { afterRescue, fellAgain, finalY: Math.round(g.p.y) };
        })()
    """)
    print(f"7. Rescate de caída: Asentado en x={rescue_check['afterRescue']['x']}, y={rescue_check['afterRescue']['y']}, vx={rescue_check['afterRescue']['vx']}, vy={rescue_check['afterRescue']['vy']}")
    print(f"   Re-caída en el siguiente segundo: {rescue_check['fellAgain']}, Y final: {rescue_check['finalY']}")
    if rescue_check['fellAgain']:
        failures.append("El personaje volvió a caer en bucle tras el rescate")
    if rescue_check['afterRescue']['vx'] != 0 or rescue_check['afterRescue']['vy'] != 0:
        failures.append(f"Inercia no se anuló en el rescate: vx={rescue_check['afterRescue']['vx']}")

    # 8. Verificar audio jump() presente
    has_audio_jump = eval_js("typeof window.Cinnamo.audio.jump === 'function'")
    print(f"8. Audio jump() existe: {has_audio_jump}")
    if not has_audio_jump:
        failures.append("window.Cinnamo.audio.jump() no existe")

    print("\n--------------------------------------------------")
    if not failures:
        print(">>> RESULTADO: TODOS LOS TESTS DE PLATFORMER PASARON CON EXITO! <<<")
    else:
        print(f">>> FALLOS DETECTADOS ({len(failures)}):")
        for f in failures:
            print("  -", f)
    print("--------------------------------------------------")

finally:
    chrome_proc.terminate()
    chrome_proc.wait()
    httpd.shutdown()
    if failures:
        sys.exit(1)
