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

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
t_server = threading.Thread(target=httpd.serve_forever, daemon=True)
t_server.start()

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data_dir = os.path.join(os.environ.get("TEMP", "C:\\temp"), "cinna_plat_v19_test")
chrome_proc = subprocess.Popen([
    chrome_path,
    "--headless=new",
    "--remote-debugging-port=9227",
    f"--user-data-dir={user_data_dir}",
    "--no-first-run",
    "--disable-gpu",
    "--window-size=390,844",
    f"http://127.0.0.1:{PORT}/index.html#platformer"
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

    def send(self, data_str):
        data = data_str.encode('utf-8')
        length = len(data)
        mask_key = os.urandom(4)
        header = bytearray([0x81])
        if length <= 125:
            header.append(0x80 | length)
        elif length <= 65535:
            header.append(0x80 | 126)
            header.extend(length.to_bytes(2, 'big'))
        else:
            header.append(0x80 | 127)
            header.extend(length.to_bytes(8, 'big'))
        header.extend(mask_key)
        masked = bytearray(length)
        for i in range(length):
            masked[i] = data[i] ^ mask_key[i % 4]
        self.sock.sendall(header + masked)

    def recv(self):
        buf = bytearray()
        while True:
            chunk = self.sock.recv(4096)
            if not chunk:
                break
            buf.extend(chunk)
            if len(buf) >= 2:
                payload_len = buf[1] & 0x7F
                offset = 2
                if payload_len == 126:
                    if len(buf) < 4: continue
                    payload_len = int.from_bytes(buf[2:4], 'big')
                    offset = 4
                elif payload_len == 127:
                    if len(buf) < 10: continue
                    payload_len = int.from_bytes(buf[2:10], 'big')
                    offset = 10
                total_frame = offset + payload_len
                if len(buf) >= total_frame:
                    payload = buf[offset:total_frame]
                    return payload.decode('utf-8', errors='ignore')

    def close(self):
        try:
            self.sock.close()
        except Exception:
            pass

req_id = 0
def eval_js(ws, expr):
    global req_id
    req_id += 1
    msg = {
        "id": req_id,
        "method": "Runtime.evaluate",
        "params": {
            "expression": expr,
            "returnByValue": True
        }
    }
    ws.send(json.dumps(msg))
    while True:
        resp = json.loads(ws.recv())
        if resp.get("id") == req_id:
            res = resp.get("result", {}).get("result", {})
            return res.get("value")

try:
    tabs_data = urllib.request.urlopen("http://127.0.0.1:9227/json").read()
    tabs = json.loads(tabs_data)
    target_tab = next(t for t in tabs if "cinnamon" in t.get("url", "") or f"{PORT}" in t.get("url", ""))
    ws_url = target_tab["webSocketDebuggerUrl"]
    ws = MinimalWS(ws_url)

    # 1. Verificar pantalla actual
    screen = eval_js(ws, "window.Cinnamo.hub.currentScreen")
    print(f"Current screen: {screen}")
    assert screen == "platformer", f"Expected 'platformer', got {screen}"

    # 2. Probar cada una de las 5 ciudades
    test_cities = [
        {"idx": 0, "id": "concepcion", "name": "Concepción", "width": 5800, "items": 16},
        {"idx": 1, "id": "laserena", "name": "La Serena", "width": 6600, "items": 20},
        {"idx": 2, "id": "rio", "name": "Río de Janeiro", "width": 7400, "items": 24},
        {"idx": 3, "id": "santiago", "name": "Santiago de Chile", "width": 8200, "items": 28},
        {"idx": 4, "id": "china", "name": "China Mágica", "width": 9200, "items": 32}
    ]

    for c in test_cities:
        res = eval_js(ws, f"""
            (function() {{
                const game = window.Cinnamo.platformerGame;
                game.buildCityLevel({c['idx']});
                // Ejecutar varios frames de renderizado
                game.update(0.016);
                game.draw();
                return {{
                    cityId: game.currentCityIdx,
                    levelWidth: game.levelWidth,
                    totalItems: game.totalCupcakes,
                    platformsCount: game.platforms.length,
                    springsCount: game.springs.length,
                    itemsCount: game.cupcakes.length,
                    progressWidth: document.querySelector('#platProgressFill') ? document.querySelector('#platProgressFill').style.width : null
                }};
            }})()
        """)
        print(f"City {c['name']} (Level {c['idx']+1}): {res}")
        assert res["levelWidth"] == c["width"], f"Expected width {c['width']}, got {res['levelWidth']}"
        assert res["totalItems"] == c["items"], f"Expected items {c['items']}, got {res['totalItems']}"
        assert res["platformsCount"] >= 8, f"Too few platforms: {res['platformsCount']}"
        assert res["itemsCount"] == c["items"], f"Collectible mismatch: {res['itemsCount']}"

    # 3. Probar apertura táctil del selector de personajes desde el pill
    hero_modal_test = eval_js(ws, """
        (function() {
            const pill = document.querySelector('#platHeroPill');
            const modal = document.querySelector('#platCharModal');
            pill.click();
            const isOpen = !modal.classList.contains('hidden');
            // Elegir a Pompompurin
            const optPurin = document.querySelector('.plat-hero-option[data-id="purin"]');
            optPurin.click();
            const isClosed = modal.classList.contains('hidden');
            const heroId = window.Cinnamo.platformerGame.selectedHero.id;
            return { isOpen, isClosed, heroId };
        })()
    """)
    print(f"Hero modal test: {hero_modal_test}")
    assert hero_modal_test["isOpen"], "Hero modal did not open on pill click"
    assert hero_modal_test["isClosed"], "Hero modal did not close on option select"
    assert hero_modal_test["heroId"] == "purin", f"Expected 'purin', got {hero_modal_test['heroId']}"

    # 4. Probar apertura táctil del selector de ciudades desde el pill
    city_modal_test = eval_js(ws, """
        (function() {
            const pill = document.querySelector('#platCityPill');
            const modal = document.querySelector('#platCityModal');
            pill.click();
            const isOpen = !modal.classList.contains('hidden');
            // Elegir China Mágica
            const cardChina = document.querySelector('.plat-city-card[data-cidx="4"]');
            cardChina.click();
            const isClosed = modal.classList.contains('hidden');
            const cityIdx = window.Cinnamo.platformerGame.currentCityIdx;
            return { isOpen, isClosed, cityIdx };
        })()
    """)
    print(f"City modal test: {city_modal_test}")
    assert city_modal_test["isOpen"], "City modal did not open on pill click"
    assert city_modal_test["isClosed"], "City modal did not close on card select"
    assert city_modal_test["cityIdx"] == 4, f"Expected city index 4 (China), got {city_modal_test['cityIdx']}"

    # 5. Probar avance de carrera y actualización de la barra de distancia
    progress_test = eval_js(ws, """
        (function() {
            const game = window.Cinnamo.platformerGame;
            game.p.x = game.levelWidth * 0.5;
            game.update(0.016);
            game.draw();
            const fillWidth = document.querySelector('#platProgressFill').style.width;
            return { px: game.p.x, fillWidth };
        })()
    """)
    print(f"Progress runner bar test: {progress_test}")
    assert "5" in progress_test["fillWidth"], f"Expected ~50% progress fill, got {progress_test['fillWidth']}"

    print(">>> ALL PLATFORMER V19 EXTENDED CITY TESTS PASSED 100%! <<<")
    ws.close()
finally:
    chrome_proc.terminate()
    chrome_proc.wait()
    httpd.shutdown()
