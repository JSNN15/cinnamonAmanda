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

PORT = 8997

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
t_server = threading.Thread(target=httpd.serve_forever, daemon=True)
t_server.start()

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data_dir = os.path.join(os.environ.get("TEMP", "C:\\temp"), "cinna_reload_test")
chrome_proc = subprocess.Popen([
    chrome_path,
    "--headless=new",
    "--remote-debugging-port=9226",
    f"--user-data-dir={user_data_dir}",
    "--no-first-run",
    "--disable-gpu",
    "--window-size=390,844",
    f"http://127.0.0.1:{PORT}/index.html#writing"
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
    tabs_data = urllib.request.urlopen("http://127.0.0.1:9226/json").read()
    tabs = json.loads(tabs_data)
    target_tab = next(t for t in tabs if "cinnamon" in t.get("url", "") or f"{PORT}" in t.get("url", ""))
    ws_url = target_tab["webSocketDebuggerUrl"]
    ws = MinimalWS(ws_url)

    # Initial check right after load (hash resumption in hub.init)
    initial_screen = eval_js(ws, "window.Cinnamo.hub.currentScreen")
    initial_hash = eval_js(ws, "window.location.hash")
    print(f"At 2.5s: screen={initial_screen}, hash={initial_hash}")

    # Wait 8 seconds to thoroughly test beyond the 5-second window
    print("Waiting 8 seconds to monitor if page reloads or kicks user out...")
    time.sleep(8)

    after_screen = eval_js(ws, "window.Cinnamo.hub.currentScreen")
    after_hash = eval_js(ws, "window.location.hash")
    print(f"At 10.5s: screen={after_screen}, hash={after_hash}")

    assert after_screen == "writing", f"Expected screen to remain 'writing', got {after_screen}"
    assert after_hash == "#writing", f"Expected hash to remain '#writing', got {after_hash}"
    print(">>> 5-SECOND RELOAD TEST PASSED 100%! User is never kicked out of the game. <<<")

    ws.close()
finally:
    chrome_proc.terminate()
    chrome_proc.wait()
    httpd.shutdown()
