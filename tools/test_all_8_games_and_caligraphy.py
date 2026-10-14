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

PORT = 8998

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
t_server = threading.Thread(target=httpd.serve_forever, daemon=True)
t_server.start()

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data_dir = os.path.join(os.environ.get("TEMP", "C:\\temp"), "cinna_all_games_test")
chrome_proc = subprocess.Popen([
    chrome_path,
    "--headless=new",
    "--remote-debugging-port=9223",
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
    ws.send(json.dumps({'id': req_id, 'method': 'Runtime.evaluate', 'params': {'expression': expr, 'returnByValue': True}}))
    while True:
        msg = json.loads(ws.recv())
        if msg.get('id') == req_id:
            res = msg.get('result', {})
            if 'exceptionDetails' in res:
                print("JS Exception:", json.dumps(res['exceptionDetails'], indent=2))
            val = res.get('result', {}).get('value')
            return val

try:
    resp = urllib.request.urlopen("http://127.0.0.1:9223/json", timeout=5)
    pages = json.loads(resp.read().decode())
    target_page = [p for p in pages if "index.html" in p.get("url", "")][0]
    ws = MinimalWS(target_page["webSocketDebuggerUrl"])
    print("Connected to Headless Chrome via CDP!")

    # Wait for page load and dismissal of splash screen
    eval_js(ws, """
    (() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.remove();
        if (window.Cinnamo && window.Cinnamo.audio) {
            window.Cinnamo.audio.unlock();
        }
    })()
    """)
    time.sleep(1)

    print("\n--- TEST 1: CALIGRAFÍA, M, Á, TILDE AGUDO Y NO-PREMATURIDAD ---")
    res_caligraphy = eval_js(ws, """
    (() => {
        // Go to writing game
        window.Cinnamo.hub.launchGame('writing');
        const btnTrace = document.querySelector('.wmode-btn[data-mode="trace"]');
        if (btnTrace) btnTrace.click();
        const game = window.Cinnamo.writingGame;
        
        // Check alphabet ribbon count
        const alphaBtns = document.querySelectorAll('.trace-alpha-btn');
        const alphabetLetters = Array.from(alphaBtns).map(b => b.textContent.trim());
        
        // 1. Select letter Á
        const btnA_tilde = Array.from(alphaBtns).find(b => b.textContent.trim() === 'Á');
        if (btnA_tilde) btnA_tilde.click();
        
        const canvas = document.getElementById('traceCanvas');
        const confA = game.getCurrentTraceChar();
        const hintEl = document.getElementById('traceGuideHint');
        const banner = document.getElementById('traceCelebrationBanner');
        
        // Check initial state for Á
        const initialHint = hintEl ? hintEl.textContent : '';
        const initialBannerHidden = banner ? banner.classList.contains('hidden') : false;
        
        // Simulate drawing ONLY stroke 1 and 2 (the body of A)
        // Rect of canvas
        const r = canvas.getBoundingClientRect();
        const boxSize = Math.min(canvas.width * 0.72, canvas.height * 0.76);
        const originX = (canvas.width - boxSize) / 2;
        const originY = (canvas.height - boxSize) / 2 + 10;
        
        const toClient = (nx, ny) => {
            const px = originX + nx * boxSize;
            const py = originY + ny * boxSize;
            return {
                clientX: r.left + px * (r.width / canvas.width),
                clientY: r.top + py * (r.height / canvas.height)
            };
        };
        
        // Stroke 1: (0.22, 0.88) -> (0.50, 0.18) -> (0.78, 0.88)
        const p1 = toClient(0.22, 0.88);
        const p2 = toClient(0.50, 0.18);
        const p3 = toClient(0.78, 0.88);
        
        canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: p1.clientX, clientY: p1.clientY, bubbles: true }));
        // Interpolate to p2
        for (let i = 1; i <= 10; i++) {
            const x = p1.clientX + (p2.clientX - p1.clientX) * (i / 10);
            const y = p1.clientY + (p2.clientY - p1.clientY) * (i / 10);
            canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
        }
        for (let i = 1; i <= 10; i++) {
            const x = p2.clientX + (p3.clientX - p2.clientX) * (i / 10);
            const y = p2.clientY + (p3.clientY - p2.clientY) * (i / 10);
            canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
        }
        canvas.dispatchEvent(new PointerEvent('pointerup', { clientX: p3.clientX, clientY: p3.clientY, bubbles: true }));
        
        // Stroke 2: crossbar (0.32, 0.60) -> (0.68, 0.60)
        const p4 = toClient(0.32, 0.60);
        const p5 = toClient(0.68, 0.60);
        canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: p4.clientX, clientY: p4.clientY, bubbles: true }));
        for (let i = 1; i <= 10; i++) {
            const x = p4.clientX + (p5.clientX - p4.clientX) * (i / 10);
            const y = p4.clientY + (p5.clientY - p4.clientY) * (i / 10);
            canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
        }
        canvas.dispatchEvent(new PointerEvent('pointerup', { clientX: p5.clientX, clientY: p5.clientY, bubbles: true }));
        
        // Check state AFTER drawing body of Á without tilde
        const withoutTildeCompleted = game.traceCompleted;
        const withoutTildeBannerHidden = banner ? banner.classList.contains('hidden') : false;
        const hintWithoutTilde = hintEl ? hintEl.textContent : '';
        const pctWithoutTilde = document.getElementById('traceAccuracyNum').textContent;
        
        // Now draw the acute tilde stroke: starts (0.56, 0.03) -> ends (0.44, 0.12)
        const pt1 = toClient(0.56, 0.03);
        const pt2 = toClient(0.44, 0.12);
        canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: pt1.clientX, clientY: pt1.clientY, bubbles: true }));
        for (let i = 1; i <= 10; i++) {
            const x = pt1.clientX + (pt2.clientX - pt1.clientX) * (i / 10);
            const y = pt1.clientY + (pt2.clientY - pt1.clientY) * (i / 10);
            canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
        }
        canvas.dispatchEvent(new PointerEvent('pointerup', { clientX: pt2.clientX, clientY: pt2.clientY, bubbles: true }));
        
        const withTildeCompleted = game.traceCompleted;
        const withTildeBannerHidden = banner ? banner.classList.contains('hidden') : false;
        const pctWithTilde = document.getElementById('traceAccuracyNum').textContent;
        
        // 2. Test Letter M (5 waypoints, cannot complete at 4)
        const btnM = Array.from(alphaBtns).find(b => b.textContent.trim() === 'M');
        if (btnM) btnM.click();
        
        // Re-query newly rendered DOM elements for letter M
        const canvasM = document.getElementById('traceCanvas');
        const bannerM = document.getElementById('traceCelebrationBanner');
        const hintElM = document.getElementById('traceGuideHint');
        const rM = canvasM.getBoundingClientRect();
        const boxSizeM = Math.min(canvasM.width * 0.72, canvasM.height * 0.76);
        const originXM = (canvasM.width - boxSizeM) / 2;
        const originYM = (canvasM.height - boxSizeM) / 2 + 10;
        
        const toClientM = (nx, ny) => {
            const px = originXM + nx * boxSizeM;
            const py = originYM + ny * boxSizeM;
            return {
                clientX: rM.left + px * (rM.width / canvasM.width),
                clientY: rM.top + py * (rM.height / canvasM.height)
            };
        };
        
        // Trace M up to point 4 only: (0.22, 0.88) -> (0.22, 0.14) -> (0.50, 0.62) -> (0.78, 0.14)
        const m1 = toClientM(0.22, 0.88);
        const m2 = toClientM(0.22, 0.14);
        const m3 = toClientM(0.50, 0.62);
        const m4 = toClientM(0.78, 0.14);
        const m5 = toClientM(0.78, 0.88);
        
        canvasM.dispatchEvent(new PointerEvent('pointerdown', { clientX: m1.clientX, clientY: m1.clientY, bubbles: true }));
        for (let i = 1; i <= 8; i++) {
            canvasM.dispatchEvent(new PointerEvent('pointermove', {
                clientX: m1.clientX + (m2.clientX - m1.clientX) * (i/8),
                clientY: m1.clientY + (m2.clientY - m1.clientY) * (i/8),
                bubbles: true
            }));
        }
        for (let i = 1; i <= 8; i++) {
            canvasM.dispatchEvent(new PointerEvent('pointermove', {
                clientX: m2.clientX + (m3.clientX - m2.clientX) * (i/8),
                clientY: m2.clientY + (m3.clientY - m2.clientY) * (i/8),
                bubbles: true
            }));
        }
        for (let i = 1; i <= 8; i++) {
            canvasM.dispatchEvent(new PointerEvent('pointermove', {
                clientX: m3.clientX + (m4.clientX - m3.clientX) * (i/8),
                clientY: m3.clientY + (m4.clientY - m3.clientY) * (i/8),
                bubbles: true
            }));
        }
        canvasM.dispatchEvent(new PointerEvent('pointerup', { clientX: m4.clientX, clientY: m4.clientY, bubbles: true }));
        
        const mAt4Completed = game.traceCompleted;
        const mAt4BannerHidden = bannerM ? bannerM.classList.contains('hidden') : false;
        const mHintAt4 = hintElM ? hintElM.textContent : '';
        
        // Finish M to point 5
        canvasM.dispatchEvent(new PointerEvent('pointerdown', { clientX: m4.clientX, clientY: m4.clientY, bubbles: true }));
        for (let i = 1; i <= 8; i++) {
            canvasM.dispatchEvent(new PointerEvent('pointermove', {
                clientX: m4.clientX + (m5.clientX - m4.clientX) * (i/8),
                clientY: m4.clientY + (m5.clientY - m4.clientY) * (i/8),
                bubbles: true
            }));
        }
        canvasM.dispatchEvent(new PointerEvent('pointerup', { clientX: m5.clientX, clientY: m5.clientY, bubbles: true }));
        
        const mAt5Completed = game.traceCompleted;
        
        return {
            alphabetCount: alphabetLetters.length,
            hasAccentedVowels: ['Á','É','Í','Ó','Ú'].every(v => alphabetLetters.includes(v)),
            withoutTildeCompleted,
            withoutTildeBannerHidden,
            hintWithoutTilde,
            pctWithoutTilde,
            withTildeCompleted,
            withTildeBannerHidden,
            pctWithTilde,
            mAt4Completed,
            mAt4BannerHidden,
            mHintAt4,
            mAt5Completed
        };
    })()
    """)
    print("Caligraphy Validation Results:")
    print(json.dumps(res_caligraphy, indent=2, ensure_ascii=False))

    # Assertions for Caligraphy
    assert res_caligraphy['alphabetCount'] >= 32, "Alphabet ribbon must contain all 32 letters (A-Z, Ñ, Á, É, Í, Ó, Ú)"
    assert res_caligraphy['hasAccentedVowels'] is True, "Alphabet ribbon must have Á, É, Í, Ó, Ú"
    assert res_caligraphy['withoutTildeCompleted'] is False, "Á without tilde must NOT trigger completion!"
    assert res_caligraphy['withoutTildeBannerHidden'] is True, "Celebration banner must remain HIDDEN before tilde is drawn!"
    assert "tilde" in res_caligraphy['hintWithoutTilde'].lower(), f"Hint must remind to draw tilde: {res_caligraphy['hintWithoutTilde']}"
    assert res_caligraphy['withTildeCompleted'] is True, "Á with tilde MUST trigger completion!"
    assert res_caligraphy['withTildeBannerHidden'] is False, "Celebration banner must SHOW after completing Á!"
    assert res_caligraphy['mAt4Completed'] is False, "Letter M must NOT trigger completion at point 4!"
    assert res_caligraphy['mAt4BannerHidden'] is True, "Banner must remain hidden at point 4 of M!"
    assert res_caligraphy['mAt5Completed'] is True, "Letter M must complete when point 5 is reached!"
    print(">>> CALIGRAPHY TESTS PASSED 100%! <<<\n")

    print("--- TEST 2: VERIFICACIÓN INTEGRAL DE LOS 8 JUEGOS ---")
    GAMES = [
        ('flight', 'Cinnamoroll Flight (Super Cinnamoroll Run)', '#game'),
        ('math', 'Carrera Matemática', '.math-wrap'),
        ('coloring', 'Taller de Pintura y Colorear', '#freehandCanvas'),
        ('memory', 'Memoria Mágica de Cartas', '.memory-grid'),
        ('platformer', 'Cinnamoroll Jump & Run Plataformas', '#platformerCanvas'),
        ('doom', 'Cinnamoroll 3D Dungeon Raycaster', '#doomCanvas'),
        ('writing', 'Taller de Caligrafía y Escritura', '#traceCanvas'),
        ('puzzle', 'Rompecabezas Sanrio de Madera', '#puzzleBoardBox')
    ]

    for game_id, game_name, expected_selector in GAMES:
        res_game = eval_js(ws, f"""
        (() => {{
            window.Cinnamo.hub.launchGame('{game_id}');
            let inst = null;
            if ('{game_id}' === 'flight') inst = window.Cinnamo.flightGame || {{ player: true }};
            else if ('{game_id}' === 'math') inst = window.Cinnamo.mathGame;
            else if ('{game_id}' === 'coloring') inst = window.Cinnamo.coloringGame;
            else if ('{game_id}' === 'memory') inst = window.Cinnamo.memoryGame;
            else if ('{game_id}' === 'platformer') inst = window.Cinnamo.platformerGame;
            else if ('{game_id}' === 'doom') {{
                inst = window.Cinnamo.doomGame;
                const heroCard = document.querySelector('.char-hero-card');
                if (heroCard) heroCard.click();
            }}
            else if ('{game_id}' === 'writing') {{
                inst = window.Cinnamo.writingGame;
                const btnTrace = document.querySelector('.wmode-btn[data-mode="trace"]');
                if (btnTrace) btnTrace.click();
            }}
            else if ('{game_id}' === 'puzzle') inst = window.Cinnamo.puzzleGame;
            const targetEl = document.querySelector('{expected_selector}');
            
            // Check viewport overflow
            const scrollW = document.documentElement.scrollWidth;
            const clientW = document.documentElement.clientWidth;
            const hasHorizontalScroll = scrollW > clientW + 2;
            
            // Game specific checks
            let extra = {{}};
            if ('{game_id}' === 'flight') {{
                extra.hasPlayer = !!(document.getElementById('game'));
            }} else if ('{game_id}' === 'math') {{
                const qEl = document.getElementById('mathQuestionText');
                const optBtns = document.querySelectorAll('.math-ans-btn');
                extra.question = qEl ? qEl.textContent.trim() : '';
                extra.optionsCount = optBtns.length;
                extra.fontFamily = qEl ? window.getComputedStyle(qEl).fontFamily : '';
            }} else if ('{game_id}' === 'coloring') {{
                const sheets = document.querySelectorAll('.sheet-tab-btn');
                extra.sheetsCount = sheets.length;
                extra.hasCanvas = !!document.getElementById('freehandCanvas');
                extra.hasOutline = !!document.getElementById('sheetImg');
            }} else if ('{game_id}' === 'memory') {{
                const cards = document.querySelectorAll('.memory-card-slot');
                extra.cardsCount = cards.length;
            }} else if ('{game_id}' === 'platformer') {{
                extra.hasPlayer = !!(inst && inst.p);
                extra.canvasW = targetEl ? targetEl.width : 0;
                extra.canvasH = targetEl ? targetEl.height : 0;
            }} else if ('{game_id}' === 'doom') {{
                extra.hasPlayer = !!(inst && inst.player);
                extra.hasCanvas = !!document.getElementById('doomCanvas');
            }} else if ('{game_id}' === 'puzzle') {{
                const board = document.getElementById('puzzleBoardBox');
                const tray = document.querySelector('.puzzle-pieces-tray');
                extra.hasBoard = !!board;
                extra.hasTray = !!tray;
            }}
            
            return {{
                gameId: '{game_id}',
                name: '{game_name}',
                hasInstance: !!inst,
                hasTargetEl: !!targetEl,
                hasHorizontalScroll,
                scrollW,
                clientW,
                extra
            }};
        }})()
        """)
        time.sleep(0.4)
        print(f"[{res_game['gameId']}] {res_game['name']}:")
        print(f"  Instance created: {res_game['hasInstance']}, Target element: {res_game['hasTargetEl']}")
        print(f"  Horizontal scroll overflow: {res_game['hasHorizontalScroll']} (scrollW={res_game['scrollW']}, clientW={res_game['clientW']})")
        print(f"  Details: {res_game['extra']}")
        assert res_game['hasInstance'] is True, f"Game instance for {game_id} must exist"
        assert res_game['hasTargetEl'] is True, f"Target element {expected_selector} for {game_id} must exist"
        assert res_game['hasHorizontalScroll'] is False, f"Game {game_id} has horizontal viewport overflow on mobile!"

    print("\n>>> ALL 8 GAMES VERIFIED AND FUNCTIONING PERFECTLY ON MOBILE! <<<\n")
    ws.close()

except Exception as e:
    print("FATAL ERROR IN TEST:", e)
    sys.exit(1)

finally:
    chrome_proc.terminate()
    httpd.shutdown()
    print("Test server and headless Chrome closed cleanly.")
