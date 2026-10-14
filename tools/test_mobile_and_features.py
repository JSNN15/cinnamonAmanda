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
import hashlib

# 1. Start local HTTP server
PORT = 8999
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
t_server = threading.Thread(target=httpd.serve_forever, daemon=True)
t_server.start()

# 2. Launch headless Chrome with mobile viewport emulation (iPhone 12/13/14 390x844)
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data_dir = os.path.join(os.environ.get("TEMP", "C:\\temp"), "cinna_chrome_test")
chrome_proc = subprocess.Popen([
    chrome_path,
    "--headless=new",
    "--remote-debugging-port=9222",
    f"--user-data-dir={user_data_dir}",
    "--no-first-run",
    "--disable-gpu",
    "--window-size=390,844",
    f"http://127.0.0.1:{PORT}/index.html"
])

time.sleep(2.5)

# Lightweight minimal WebSocket client using pure standard library
class MinimalWS:
    def __init__(self, ws_url):
        # ws://localhost:9222/devtools/page/...
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
        header = bytearray([0x81]) # text frame, fin=1
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
                # parse frame
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
                if len(buf) >= offset + payload_len:
                    return buf[offset:offset+payload_len].decode('utf-8')
        return ""

    def close(self):
        try:
            self.sock.close()
        except:
            pass

def eval_js(ws, expr):
    global req_id
    req_id += 1
    call = json.dumps({
        "id": req_id,
        "method": "Runtime.evaluate",
        "params": {
            "expression": expr,
            "returnByValue": True,
            "awaitPromise": True
        }
    })
    ws.send(call)
    while True:
        resp = json.loads(ws.recv())
        if resp.get("id") == req_id:
            res_val = resp.get("result", {}).get("result", {}).get("value")
            return res_val

req_id = 0
try:
    tabs = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read().decode())
    page_tab = [t for t in tabs if t.get("type") == "page"][0]
    ws = MinimalWS(page_tab["webSocketDebuggerUrl"])
    print("Connected to Chrome via WebSocket CDP!")

    # Emulate real iPhone 375x667
    req_id += 1
    ws.send(json.dumps({
        "id": req_id,
        "method": "Emulation.setDeviceMetricsOverride",
        "params": {
            "width": 375,
            "height": 667,
            "deviceScaleFactor": 2,
            "mobile": True
        }
    }))
    ws.recv()

    # 1. Test platformer bounds and character selector on mobile (390x844)
    res_plat = eval_js(ws, """
    (() => {
        window.Cinnamo.hub.launchGame('platformer');
        const wrapper = document.querySelector('.platformer-wrapper');
        const hud = document.querySelector('.plat-hud');
        const heroPill = document.getElementById('platHeroPill');
        const cityPill = document.getElementById('platCityPill');
        const scorePill = document.querySelector('.plat-score-pill');
        const hudComputed = window.getComputedStyle(hud);
        
        // Test clicking hero switch button and picking hero
        document.getElementById('btnPlatSwitchHero').click();
        const modal = document.getElementById('platCharModal');
        const modalVisible = !modal.classList.contains('hidden');
        
        // Pick Pompompurin
        const purin = modal.querySelector('.plat-hero-option[data-id="purin"]');
        if (purin) purin.click();
        const chosen = window.Cinnamo.platformerGame.selectedHero.name;

        return {
            windowWidth: window.innerWidth,
            wrapperWidth: wrapper.getBoundingClientRect().width,
            hudWidth: hud.getBoundingClientRect().width,
            heroRight: heroPill.getBoundingClientRect().right,
            modalVisible,
            chosenHero: chosen
        };
    })()
    """)
    print("1. Platformer Hero Selection Test:", res_plat)

    # 2. Test Math typography and numbers
    res_math = eval_js(ws, """
    (() => {
        window.Cinnamo.hub.launchGame('math');
        window.Cinnamo.mathGame.setTier('7-8'); // older kids level
        const numEl = document.querySelector('.math-ans-number');
        const computedFont = window.getComputedStyle(numEl).fontFamily;
        const qText = document.getElementById('mathQuestionText').textContent.trim();
        
        // Test remote submit answer
        const total = window.Cinnamo.mathGame.total;
        window.Cinnamo.mathGame.submitAnswer(total);
        const score = window.Cinnamo.mathGame.score;

        return {
            font: computedFont,
            question: qText,
            total,
            scoreAfterSubmit: score
        };
    })()
    """)
    print("2. Math Typography & Submit Test:", res_math)

    # 3. Test Writing Trace mode (letter M 5 points, alphabet selector, no premature completion)
    res_writing = eval_js(ws, """
    (() => {
        window.Cinnamo.hub.launchGame('writing');
        // Switch to trace mode
        const btnTrace = document.querySelector('.wmode-btn[data-mode="trace"]');
        if (btnTrace) btnTrace.click();
        
        const accPill = document.getElementById('traceAccuracyPill');
        const accNum = document.getElementById('traceAccuracyNum');
        const canvas = document.getElementById('traceCanvas');
        const alphaBtns = document.querySelectorAll('.trace-alpha-btn');
        const banner = document.getElementById('traceCelebrationBanner');
        
        // Select letter M
        const btnM = Array.from(document.querySelectorAll('.trace-pick-btn')).find(b => b.textContent.trim() === 'M');
        if (btnM) btnM.click();
        
        const curChar = window.Cinnamo.writing.getCurrentTraceChar();
        const confM = window.Cinnamo.writing.container ? true : false;
        
        // Simulate drawing part of M (less than complete)
        const rect = canvas.getBoundingClientRect();
        canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: rect.left + rect.width * 0.22, clientY: rect.top + rect.height * 0.88, bubbles: true }));
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + rect.width * 0.22, clientY: rect.top + rect.height * 0.14, bubbles: true }));
        
        const midPct = accNum ? accNum.textContent : '0%';
        const prematureDone = window.Cinnamo.writing.traceCompleted;
        const bannerHiddenMid = banner.classList.contains('hidden');
        
        // Release pointer without finishing
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: rect.left + rect.width * 0.22, clientY: rect.top + rect.height * 0.14, bubbles: true }));
        const prematureDoneAfterUp = window.Cinnamo.writing.traceCompleted;
        
        // Test switching to 'Z' via alphabet ribbon
        const btnZ = Array.from(alphaBtns).find(b => b.textContent.trim() === 'Z');
        if (btnZ) btnZ.click();
        const charAfterZ = window.Cinnamo.writing.getCurrentTraceChar();
        
        return {
            curChar,
            alphaBtnsCount: alphaBtns.length,
            midPct,
            prematureDone,
            bannerHiddenMid,
            prematureDoneAfterUp,
            charAfterZ,
            hasCanvas: !!canvas
        };
    })()
    """)
    print("3. Writing Trace Mode Test (M, Alphabet, No Premature Done):", res_writing)

    # Take screenshot of M in trace mode
    eval_js(ws, """
    (() => {
        const btnM = Array.from(document.querySelectorAll('.trace-pick-btn')).find(b => b.textContent.trim() === 'M');
        if (btnM) btnM.click();
        const canvas = document.getElementById('traceCanvas');
        if (canvas) canvas.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()
    """)
    time.sleep(0.4)
    req_id += 1
    ws.send(json.dumps({'id': req_id, 'method': 'Page.captureScreenshot', 'params': {'format': 'png'}}))
    while True:
        msg = json.loads(ws.recv())
        if msg.get('id') == req_id:
            img_bytes = base64.b64decode(msg['result']['data'])
            out_file = os.path.join(os.path.dirname(__file__), 'trace_m_preview.png')
            with open(out_file, 'wb') as f:
                f.write(img_bytes)
            print("Screenshot of Letter M saved to:", out_file)
            break

    # 4. Test controller.html directly
    eval_js(ws, "window.location.href = 'http://127.0.0.1:8999/controller.html?room=TEST';")
    time.sleep(1.5)

    res_controller = eval_js(ws, """
    (() => {
        const joyKnob = document.getElementById('joystickKnob');
        const joyZone = document.getElementById('joystickZone');
        
        // Test diagonal movement on joystick
        const rect = joyZone.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        
        // Drag diagonally up-right
        joyZone.dispatchEvent(new PointerEvent('pointerdown', { clientX: cx + 35, clientY: cy - 35, pointerId: 1, bubbles: true }));
        const knobTransform = joyKnob.style.transform;
        
        // Test context switch to math
        window.dispatchEvent(new MessageEvent('message', {
            data: {
                type: 'context',
                screen: 'math',
                question: '¿Cuánto es 5 + 3?',
                options: [6, 7, 8],
                treatEmoji: '🍥'
            }
        }));
        
        // Also call handleGameContext directly if message event is internal
        const mathLayout = document.getElementById('layoutMath');
        const mathGrid = document.getElementById('mathRemoteGrid');
        
        return {
            hasKnob: !!joyKnob,
            knobTransform,
            mathVisible: !mathLayout.classList.contains('hidden')
        };
    })()
    """)
    print("4. Controller.html Smart Companion Test:", res_controller)

    ws.close()

except Exception as err:
    print("Test error:", err)

finally:
    chrome_proc.terminate()
    httpd.shutdown()
    print("Tests finished and cleaned up.")
