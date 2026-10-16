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

PORT = 8993

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
t_server = threading.Thread(target=httpd.serve_forever, daemon=True)
t_server.start()

user_data_dir = os.path.join(os.environ.get("TEMP", "C:\\temp"), "test_jump_debug_file")
chrome_proc = subprocess.Popen([
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless=new",
    "--remote-debugging-port=9231",
    f"--user-data-dir={user_data_dir}",
    "--no-first-run",
    "--disable-gpu",
    "--window-size=960,600",
    f"http://127.0.0.1:{PORT}/index.html#platformer"
])
time.sleep(2.5)

tabs = json.loads(urllib.request.urlopen("http://127.0.0.1:9231/json").read())
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

try:
    print("Screen:", eval_js("window.Cinnamo.hub.currentScreen"))
    check_error = eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            try {
                g.update(0.016);
                g.draw();
                return { running: g.running, animId: g.animId, ok: true };
            } catch (err) {
                return { running: g.running, error: err.message, stack: err.stack };
            }
        })()
    """)
    print("Check error:", check_error)

    # Simulate keyboard jump (Space)
    eval_js("window.dispatchEvent(new KeyboardEvent('keydown', {code: 'Space', bubbles: true}))")
    time.sleep(0.05)
    stateKbd = eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            return { x: g.p.x, y: g.p.y, vy: g.p.vy, grounded: g.p.grounded, jumpKey: g.keys.jump, buffer: g.p.jumpBuffer };
        })()
    """)
    print("State after Space keydown:", stateKbd)

    # Simulate touch jump button
    eval_js("document.querySelector('#btnPlatJump').dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}))")
    time.sleep(0.05)
    stateBtn = eval_js("""
        (function() {
            const g = window.Cinnamo.platformerGame;
            return { x: g.p.x, y: g.p.y, vy: g.p.vy, grounded: g.p.grounded, jumpKey: g.keys.jump, buffer: g.p.jumpBuffer };
        })()
    """)
    print("State after #btnPlatJump pointerdown:", stateBtn)

    # Simulate walk right
    eval_js("window.dispatchEvent(new KeyboardEvent('keydown', {code: 'ArrowRight', bubbles: true}))")
    for step in range(10):
        time.sleep(0.1)
        st = eval_js("""
            (function() {
                const g = window.Cinnamo.platformerGame;
                return { x: Math.round(g.p.x), y: Math.round(g.p.y), vx: Math.round(g.p.vx), vy: Math.round(g.p.vy), grounded: g.p.grounded, plat: g.p.standingPlat ? g.p.standingPlat.type : null };
            })()
        """)
        print(f"Walking t={step*0.1:.1f}s:", st)

finally:
    chrome_proc.terminate()
    chrome_proc.wait()
    httpd.shutdown()
