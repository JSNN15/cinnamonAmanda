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

PORT = 8995
CDP_PORT = 9225

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

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data_dir = os.path.join(os.environ.get("TEMP", "C:\\temp"), "cinna_fs_test")
chrome_proc = subprocess.Popen([
    chrome_path,
    "--headless=new",
    f"--remote-debugging-port={CDP_PORT}",
    f"--user-data-dir={user_data_dir}",
    "--no-first-run",
    "--disable-gpu",
    "--window-size=390,844",
    f"http://127.0.0.1:{PORT}/index.html"
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

    print("=== TEST: BOTONES DE PANTALLA COMPLETA EN AMBAS PANTALLAS ===")

    # 1. Verificar botón de pantalla completa en la Pantalla Principal (index.html)
    fs_btn_exists = ws_host.eval("!!document.getElementById('globalBtnFullscreen')")
    fs_icon = ws_host.eval("document.getElementById('fullscreenIcon')?.textContent")
    fs_title = ws_host.eval("document.getElementById('globalBtnFullscreen')?.getAttribute('title')")
    
    # Verificar overflow horizontal en móvil (viewport 390px)
    scroll_w = ws_host.eval("document.documentElement.scrollWidth")
    client_w = ws_host.eval("document.documentElement.clientWidth")
    
    print(f"[Host] Botón Pantalla Completa existe: {fs_btn_exists}, Icono: '{fs_icon}', Tooltip: '{fs_title}'")
    print(f"[Host Viewport 390px] scrollWidth={scroll_w}, clientWidth={client_w}")
    assert fs_btn_exists is True, "No se encontró el botón globalBtnFullscreen en index.html!"
    assert fs_icon == "📺", f"Icono esperado '📺', obtenido: '{fs_icon}'"
    assert scroll_w <= client_w, f"Desbordamiento horizontal detectado: scrollWidth={scroll_w} > clientWidth={client_w}"

    # 2. Abrir el mando en segunda pestaña
    new_tab = ws_host.send_cmd("Target.createTarget", {
        "url": f"http://127.0.0.1:{PORT}/controller.html"
    })
    target_id = new_tab.get("result", {}).get("targetId")
    time.sleep(1.5)

    tabs = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT}/json").read())
    ctrl_tab = [t for t in tabs if target_id in t.get("id", "") or "controller.html" in t.get("url", "")][0]
    ws_ctrl = MinimalWS(ctrl_tab["webSocketDebuggerUrl"])
    ws_ctrl.send_cmd("Page.enable")
    ws_ctrl.send_cmd("Runtime.enable")

    # 3. Verificar botón de pantalla completa en el Controlador Celular (controller.html)
    ctrl_fs_exists = ws_ctrl.eval("!!document.getElementById('btnRemoteFullscreen')")
    ctrl_fs_icon = ws_ctrl.eval("document.getElementById('btnRemoteFullscreen')?.textContent")
    ctrl_fs_title = ws_ctrl.eval("document.getElementById('btnRemoteFullscreen')?.getAttribute('title')")
    
    ctrl_scroll_w = ws_ctrl.eval("document.documentElement.scrollWidth")
    ctrl_client_w = ws_ctrl.eval("document.documentElement.clientWidth")

    print(f"[Controller] Botón Pantalla Completa existe: {ctrl_fs_exists}, Icono: '{ctrl_fs_icon}', Tooltip: '{ctrl_fs_title}'")
    print(f"[Controller Viewport 390px] scrollWidth={ctrl_scroll_w}, clientWidth={ctrl_client_w}")
    assert ctrl_fs_exists is True, "No se encontró el botón btnRemoteFullscreen en controller.html!"
    assert ctrl_fs_icon == "📺", f"Icono esperado '📺', obtenido: '{ctrl_fs_icon}'"
    assert ctrl_scroll_w <= ctrl_client_w, f"Desbordamiento horizontal en controller: {ctrl_scroll_w} > {ctrl_client_w}"

    # 4. Probar clic en ambos botones
    ws_host.eval("document.getElementById('globalBtnFullscreen')?.click();")
    ws_ctrl.eval("document.getElementById('btnRemoteFullscreen')?.click();")
    time.sleep(0.5)

    print("\n=======================================================")
    print("✨ ¡AMBAS PANTALLAS CUENTAN CON SU BOTÓN DE PANTALLA COMPLETA 📺! ✨")
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
