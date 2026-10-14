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
ARTIFACT_DIR = r"C:\Users\JuliánNeiraNova\.gemini\antigravity\brain\b4ade427-5458-4e3a-bc9d-65fece9018b2"

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
t_server = threading.Thread(target=httpd.serve_forever, daemon=True)
t_server.start()

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data_dir = os.path.join(os.environ.get("TEMP", "C:\\temp"), "cinna_capture_cities_fixed")
chrome_proc = subprocess.Popen([
    chrome_path,
    "--headless=new",
    "--remote-debugging-port=9229",
    f"--user-data-dir={user_data_dir}",
    "--no-first-run",
    "--disable-gpu",
    "--window-size=960,600",
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
            if "exceptionDetails" in resp.get("result", {}):
                print(f"JS Exception: {resp['result']['exceptionDetails']}")
            return res.get("value")

def take_screenshot(ws, filename):
    global req_id
    req_id += 1
    msg = {
        "id": req_id,
        "method": "Page.captureScreenshot",
        "params": {"format": "png"}
    }
    ws.send(json.dumps(msg))
    while True:
        resp = json.loads(ws.recv())
        if resp.get("id") == req_id:
            data = resp.get("result", {}).get("data", "")
            out_path = os.path.join(ARTIFACT_DIR, filename)
            with open(out_path, "wb") as f:
                f.write(base64.b64decode(data))
            print(f"Captured: {out_path}")
            return out_path

try:
    tabs_data = urllib.request.urlopen("http://127.0.0.1:9229/json").read()
    tabs = json.loads(tabs_data)
    target_tab = next(t for t in tabs if "cinnamon" in t.get("url", "") or f"{PORT}" in t.get("url", ""))
    ws_url = target_tab["webSocketDebuggerUrl"]
    ws = MinimalWS(ws_url)

    cities_config = [
        {"idx": 0, "name": "concepcion", "px": 1600, "camX": 1200},
        {"idx": 1, "name": "laserena", "px": 2100, "camX": 1700},
        {"idx": 2, "name": "rio", "px": 2400, "camX": 2000},
        {"idx": 3, "name": "santiago", "px": 2800, "camX": 2400},
        {"idx": 4, "name": "china", "px": 3200, "camX": 2800}
    ]

    for c in cities_config:
        eval_js(ws, f"""
            (function() {{
                const game = window.Cinnamo.platformerGame;
                game.buildCityLevel({c['idx']});
                game.p.x = {c['px']};
                game.camX = {c['camX']};
                game.update(0.016);
                game.draw();
            }})()
        """)
        time.sleep(0.3)
        take_screenshot(ws, f"platformer_city_{c['name']}.png")

    ws.close()
finally:
    chrome_proc.terminate()
    chrome_proc.wait()
    httpd.shutdown()
