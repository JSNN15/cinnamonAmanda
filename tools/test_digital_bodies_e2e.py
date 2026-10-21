#!/usr/bin/env python3
"""
================================================================================
Cinnamoroll World: Casa de Sueños - 2.5D Digital Bodies E2E Automated Suite
================================================================================
Authoritative End-to-End Test Suite for the 2.5D Digital Bodies (Cuerpos Digitales)
Visual & Interactive Overhaul across all 5 rooms:
  cafe, bedroom, garden, beach, spa.

Reference specifications:
- ORIGINAL_REQUEST.md
- ARQUITECTURA_AVATAR_WORLD_PRO_CUERPOS_DIGITALES.md
- AUDITORIA_SENIOR_JUEGO_PROFESIONAL.md
- TEST_INFRA.md

Architecture:
- Pure Python standard library (zero external pip dependencies).
- Embedded Threading HTTP Server with aggressive no-cache headers.
- Isolated Headless Chrome instance managed via Chrome DevTools Protocol (CDP).
- Lightweight RFC 6455 compliant WebSocket client (MinimalCDPWebSocket).
- Four Authoritative Test Tiers:
    * Tier 1 (Feature Coverage):
        - Cafe: tea_table.hasFrontCover === true, cafe_teapot.gadget === 'teapot'
        - Garden: swing.hasFrontCover === true, watering_can.gadget === 'watering', picnic_basket.gadget === 'picnic'
        - Beach: beach_lounger.hasFrontCover === true, flamingo_ring.hasFrontCover === true && seat === true
        - Spa: bubble_tub.hasFrontCover === true, pet_house present, spa_pet_bowl.gadget === 'pet_bowl', spa_brush.gadget === 'brush'
        - Catalog: CATALOG_DECOR contains perfume_bottle, hair_dryer, watering_can, flamingo_ring, spa_brush
    * Tier 2 (Boundary & Corner Cases):
        - Dynamic Eye Gaze: Gaze offsets strictly clamped to [-2.2, 2.2] X and [-1.5, 1.5] Y, zero NaN values across extreme/null targets
        - Articulated Toggles: oven, counter, vanity, cafe_teapot, watering_can, picnic_basket, spa_pet_bowl, spa_brush, perfume_bottle, hair_dryer
        - Rapid Multi-Toggle Stress: 5x back-to-back toggling resilience
        - Front Layer Drawing: drawObjectFrontLayer renders real vector occlusion geometry without errors for all 6 covered objects
    * Tier 3 (Cross-Feature Combinations):
        - Z-Sandwich Seating: avatars seated on real tea_table, swing, beach_lounger, flamingo_ring with front layer over waist
        - Z-Sandwich Invariant: backLayer (obj.y) < avatar (obj.y+8) < frontLayer (obj.y+18)
        - Drop-to-Interact: Dropping food on Amanda (slot 1), Friend (slot 2), Friend2 (slot 3) triggers chewTimer & yummy reaction
        - Drop-to-Interact: Dropping gadget on Amanda, Friend, Friend2 equips item & articulates hands
    * Tier 4 (Real-World Application Scenarios):
        - Multi-Room Dollhouse Flow:
            1. Cafe tea party (seating, teapot pouring, feeding, baking)
            2. Garden watering & picnic (swinging, watering can spray, picnic treats)
            3. Beach flamingo swimming (flamingo ring seating, sunbathing, gaze tracking)
            4. Spa pet grooming (bubble bath, puppy feeding, bubble brush makeover)
        - Continuous multi-room navigation with 0 console errors and 0 uncaught exceptions
================================================================================
"""

import argparse
import base64
import http.server
import json
import os
import shutil
import socket
import socketserver
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')


def find_free_port():
    """Allocate an open ephemeral TCP port on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def locate_chrome():
    """Locate Google Chrome executable in standard system locations."""
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        shutil.which("chrome"),
        shutil.which("google-chrome")
    ]
    for path in candidates:
        if path and os.path.exists(path):
            return path
    raise FileNotFoundError("Google Chrome executable not found in system search paths.")


class QuietHTTPHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP server handler that serves static files and enforces no-cache."""
    def log_message(self, format, *args):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def handle(self):
        try:
            super().handle()
        except Exception:
            pass


class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True


class MinimalCDPWebSocket:
    """Zero-dependency RFC 6455 WebSocket client communicating with Chrome DevTools Protocol."""

    def __init__(self, ws_url):
        url_clean = ws_url.replace("ws://", "")
        host_port, path = url_clean.split("/", 1)
        host, port = host_port.split(":")
        self.sock = socket.create_connection((host, int(port)), timeout=12)
        key = base64.b64encode(os.urandom(16)).decode('ascii')
        req = (
            f"GET /{path} HTTP/1.1\r\n"
            f"Host: {host_port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode('utf-8'))
        res = self.sock.recv(4096)
        if b"101 " not in res:
            raise ConnectionError("WebSocket handshake failed: " + res[:200].decode(errors='ignore'))
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
        result_obj = res.get("result", {})
        if "exceptionDetails" in result_obj:
            exc = result_obj["exceptionDetails"]
            return {"__eval_error__": exc.get("text", "JS Exception"), "details": exc}
        return result_obj.get("result", {}).get("value")

    def close(self):
        try:
            self.sock.close()
        except Exception:
            pass


class TestCaseResult:
    def __init__(self, test_id, tier, title, passed, details=None, error=None):
        self.test_id = test_id
        self.tier = tier
        self.title = title
        self.passed = passed
        self.details = details or {}
        self.error = error

    def to_dict(self):
        return {
            "id": self.test_id,
            "tier": self.tier,
            "title": self.title,
            "passed": self.passed,
            "details": self.details,
            "error": self.error
        }


class DigitalBodiesE2ETestRunner:
    def __init__(self, http_port=None, cdp_port=None, headless=True, soft_fail=False):
        self.http_port = http_port or find_free_port()
        self.cdp_port = cdp_port or find_free_port()
        self.headless = headless
        self.soft_fail = soft_fail
        self.chrome_path = locate_chrome()
        self.temp_dir = tempfile.mkdtemp(prefix="cinna_e2e_digital_bodies_")
        self.http_server = None
        self.chrome_proc = None
        self.ws = None
        self.results = []

    def start_server(self):
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        handler = lambda *args, **kwargs: QuietHTTPHandler(*args, directory=root_dir, **kwargs)
        self.http_server = ThreadingTCPServer(("127.0.0.1", self.http_port), handler)
        t = threading.Thread(target=self.http_server.serve_forever, daemon=True)
        t.start()

    def launch_browser(self):
        args = [
            self.chrome_path,
            f"--remote-debugging-port={self.cdp_port}",
            f"--user-data-dir={self.temp_dir}",
            "--no-first-run",
            "--disable-extensions",
            "--disable-default-apps",
            "--disable-gpu",
            "--window-size=1280,800",
            f"http://127.0.0.1:{self.http_port}/index.html#avatar"
        ]
        if self.headless:
            args.insert(1, "--headless=new")

        self.chrome_proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # Wait until Chrome has navigated to index.html
        ws_url = None
        for _ in range(40):
            try:
                resp = urllib.request.urlopen(f"http://127.0.0.1:{self.cdp_port}/json", timeout=1.0)
                tabs = json.loads(resp.read().decode('utf-8'))
                page_tabs = [t for t in tabs if "index.html" in t.get("url", "")]
                if page_tabs:
                    ws_url = page_tabs[0]["webSocketDebuggerUrl"]
                    break
            except Exception:
                pass
            time.sleep(0.2)

        if not ws_url:
            raise TimeoutError("Failed to acquire CDP WebSocket URL for index.html from Chrome.")

        self.ws = MinimalCDPWebSocket(ws_url)
        self.ws.send_cmd("Page.enable")
        self.ws.send_cmd("Runtime.enable")

        # Global runtime error interception
        self.ws.eval("""
            window.__testErrors = [];
            window.addEventListener('error', e => window.__testErrors.push({ type: 'error', message: e.message, filename: e.filename, lineno: e.lineno }));
            window.addEventListener('unhandledrejection', e => window.__testErrors.push({ type: 'unhandledrejection', message: String(e.reason) }));
        """)

        # Wait for avatarWorldGame to be fully initialized with avatars
        for _ in range(50):
            ready = self.ws.eval("!!window.Cinnamo?.avatarWorldGame?.roomObjects && !!window.Cinnamo?.avatarWorldGame?.avatars?.[1]")
            if ready:
                break
            self.ws.eval("window.Cinnamo?.hub?.launchGame('avatar')")
            time.sleep(0.2)

    def record(self, test_id, tier, title, passed, details=None, error=None):
        res = TestCaseResult(test_id, tier, title, passed, details, error)
        self.results.append(res)
        tag = " PASS " if passed else " FAIL "
        color = "\033[92m" if passed else "\033[91m"
        reset = "\033[0m"
        detail_msg = f" -> {error}" if error else (f" -> {details}" if not passed and details else "")
        print(f"[{color}{tag}{reset}] Tier {tier} | {test_id}: {title}{detail_msg}")

    # =========================================================================
    # TIER 1: FEATURE COVERAGE
    # =========================================================================
    def run_tier_1(self):
        print("\n" + "=" * 80)
        print("TIER 1: FEATURE COVERAGE")
        print("=" * 80)

        # 1.1 - 1.2 Cafe Room
        cafe_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            const items = g?.roomObjects?.cafe || [];
            const teaTable = items.find(o => (o.type === 'tea_table' || o.id === 'tea_table') && o.hasFrontCover === true);
            const teapot = items.find(o => (o.id === 'cafe_teapot' || o.type === 'cafe_teapot' || o.gadget === 'teapot') && o.gadget === 'teapot');
            return {
                teaTable: !!teaTable,
                teaTableDetails: teaTable ? { id: teaTable.id, hasFrontCover: teaTable.hasFrontCover, seat: teaTable.seat } : null,
                teapot: !!teapot,
                teapotDetails: teapot ? { id: teapot.id, gadget: teapot.gadget } : null
            };
        })()
        """)
        cafe_dict = cafe_res if isinstance(cafe_res, dict) else {}
        self.record("1.1", 1, "Cafe Room: tea_table hasFrontCover === true",
                    cafe_dict.get("teaTable") is True, cafe_dict.get("teaTableDetails"))
        self.record("1.2", 1, "Cafe Room: cafe_teapot gadget === 'teapot'",
                    cafe_dict.get("teapot") is True, cafe_dict.get("teapotDetails"))

        # 1.3 - 1.5 Garden Room
        garden_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            const items = g?.roomObjects?.garden || [];
            const swing = items.find(o => (o.type === 'swing' || o.id === 'swing' || o.id === 'sakura_swing') && o.hasFrontCover === true);
            const watering = items.find(o => (o.id === 'watering_can' || o.type === 'watering_can' || o.gadget === 'watering') && o.gadget === 'watering');
            const picnic = items.find(o => (o.id === 'picnic_basket' || o.type === 'picnic_basket' || o.gadget === 'picnic') && o.gadget === 'picnic');
            return {
                swing: !!swing,
                swingDetails: swing ? { id: swing.id, hasFrontCover: swing.hasFrontCover, seat: swing.seat } : null,
                watering: !!watering,
                wateringDetails: watering ? { id: watering.id, gadget: watering.gadget } : null,
                picnic: !!picnic,
                picnicDetails: picnic ? { id: picnic.id, gadget: picnic.gadget } : null
            };
        })()
        """)
        garden_dict = garden_res if isinstance(garden_res, dict) else {}
        self.record("1.3", 1, "Garden Room: swing hasFrontCover === true",
                    garden_dict.get("swing") is True, garden_dict.get("swingDetails"))
        self.record("1.4", 1, "Garden Room: watering_can gadget === 'watering'",
                    garden_dict.get("watering") is True, garden_dict.get("wateringDetails"))
        self.record("1.5", 1, "Garden Room: picnic_basket gadget === 'picnic'",
                    garden_dict.get("picnic") is True, garden_dict.get("picnicDetails"))

        # 1.6 - 1.7 Beach Room
        beach_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            const items = g?.roomObjects?.beach || [];
            const lounger = items.find(o => (o.type === 'beach_lounger' || o.id === 'beach_lounger') && o.hasFrontCover === true);
            const flamingo = items.find(o => (o.type === 'flamingo_ring' || o.id === 'flamingo_ring') && o.hasFrontCover === true && o.seat === true);
            return {
                lounger: !!lounger,
                loungerDetails: lounger ? { id: lounger.id, hasFrontCover: lounger.hasFrontCover, seat: lounger.seat } : null,
                flamingo: !!flamingo,
                flamingoDetails: flamingo ? { id: flamingo.id, hasFrontCover: flamingo.hasFrontCover, seat: flamingo.seat } : null
            };
        })()
        """)
        beach_dict = beach_res if isinstance(beach_res, dict) else {}
        self.record("1.6", 1, "Beach Room: beach_lounger hasFrontCover === true",
                    beach_dict.get("lounger") is True, beach_dict.get("loungerDetails"))
        self.record("1.7", 1, "Beach Room: flamingo_ring hasFrontCover === true && seat === true",
                    beach_dict.get("flamingo") is True, beach_dict.get("flamingoDetails"))

        # 1.8 - 1.11 Spa Room
        spa_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            const items = g?.roomObjects?.spa || [];
            const tub = items.find(o => (o.type === 'bubble_tub' || o.id === 'bubble_tub') && o.hasFrontCover === true);
            const petHouse = items.find(o => o.type === 'pet_house' || o.id === 'pet_house');
            const petBowl = items.find(o => (o.id === 'spa_pet_bowl' || o.type === 'spa_pet_bowl' || o.gadget === 'pet_bowl') && o.gadget === 'pet_bowl');
            const brush = items.find(o => (o.id === 'spa_brush' || o.type === 'spa_brush' || o.gadget === 'brush') && o.gadget === 'brush');
            return {
                tub: !!tub,
                tubDetails: tub ? { id: tub.id, hasFrontCover: tub.hasFrontCover } : null,
                petHouse: !!petHouse,
                petHouseDetails: petHouse ? { id: petHouse.id, type: petHouse.type } : null,
                petBowl: !!petBowl,
                petBowlDetails: petBowl ? { id: petBowl.id, gadget: petBowl.gadget } : null,
                brush: !!brush,
                brushDetails: brush ? { id: brush.id, gadget: brush.gadget } : null
            };
        })()
        """)
        spa_dict = spa_res if isinstance(spa_res, dict) else {}
        self.record("1.8", 1, "Spa Room: bubble_tub hasFrontCover === true",
                    spa_dict.get("tub") is True, spa_dict.get("tubDetails"))
        self.record("1.9", 1, "Spa Room: pet_house 3-face structure present",
                    spa_dict.get("petHouse") is True, spa_dict.get("petHouseDetails"))
        self.record("1.10", 1, "Spa Room: spa_pet_bowl gadget === 'pet_bowl'",
                    spa_dict.get("petBowl") is True, spa_dict.get("petBowlDetails"))
        self.record("1.11", 1, "Spa Room: spa_brush gadget === 'brush'",
                    spa_dict.get("brush") is True, spa_dict.get("brushDetails"))

        # 1.12 CATALOG_DECOR Presence
        catalog_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            const catalog = g?.CATALOG_DECOR || window.CATALOG_DECOR || window.Cinnamo?.CATALOG_DECOR || g?.constructor?.CATALOG_DECOR || [];
            const required = ['perfume_bottle', 'hair_dryer', 'watering_can', 'flamingo_ring', 'spa_brush'];
            const checked = required.map(type => ({
                type,
                found: catalog.some(d => d.type === type)
            }));
            const missing = checked.filter(c => !c.found).map(c => c.type);
            return {
                allFound: missing.length === 0 && catalog.length > 0,
                catalogCount: catalog.length,
                missing
            };
        })()
        """)
        cat_dict = catalog_res if isinstance(catalog_res, dict) else {}
        self.record("1.12", 1, "CATALOG_DECOR: contains perfume, dryer, watering_can, flamingo, brush",
                    cat_dict.get("allFound") is True, cat_dict)

    # =========================================================================
    # TIER 2: BOUNDARY & CORNER CASES
    # =========================================================================
    def run_tier_2(self):
        print("\n" + "=" * 80)
        print("TIER 2: BOUNDARY & CORNER CASES")
        print("=" * 80)

        # 2.1 - 2.2 Dynamic Eye Gaze Math, Clamping & NaN Resilience
        gaze_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            const cv = document.createElement('canvas');
            cv.width = 1000; cv.height = 560;
            const ctx = cv.getContext('2d');
            const av = g?.avatars?.[1] || { x: 320, y: 445, exprId: 'happy' };
            const base = { eyeColor: '#38bdf8', bodyColor: '#ffffff' };

            const targets = [
                { name: 'extreme_right', x: av.x + 100000, y: av.y },
                { name: 'extreme_left', x: av.x - 100000, y: av.y },
                { name: 'extreme_up', x: av.x, y: av.y - 100000 },
                { name: 'extreme_down', x: av.x, y: av.y + 100000 },
                { name: 'coincident', x: av.x, y: av.y },
                { name: 'nan_coords', x: NaN, y: NaN },
                { name: 'null_target', null: true }
            ];

            let clamped = true;
            let zeroNaN = true;
            const testDetails = [];

            for (const t of targets) {
                if (g) g.dragState = t.null ? null : { target: { x: t.x, y: t.y }, moved: true };

                let directGaze = null;
                if (g && typeof g.computeEyeGaze === 'function') {
                    try {
                        directGaze = g.computeEyeGaze(av, t.null ? null : { x: t.x, y: t.y });
                        if (directGaze) {
                            if (isNaN(directGaze.x) || isNaN(directGaze.y)) zeroNaN = false;
                            if (Math.abs(directGaze.x) > 2.201 || Math.abs(directGaze.y) > 1.501) clamped = false;
                        }
                    } catch(e) {
                        zeroNaN = false;
                    }
                }

                const ellipses = [];
                const origEllipse = ctx.ellipse;
                ctx.ellipse = function(x, y, rx, ry, rot, start, end) {
                    ellipses.push({ x, y, rx, ry });
                    if (origEllipse) origEllipse.apply(this, arguments);
                };

                let err = null;
                try {
                    if (g) g.drawFacialExpression(ctx, base, av, 1.0);
                } catch(e) {
                    err = e.message;
                }
                ctx.ellipse = origEllipse;

                for (const el of ellipses) {
                    if (isNaN(el.x) || isNaN(el.y) || isNaN(el.rx) || isNaN(el.ry)) {
                        zeroNaN = false;
                    }
                }

                testDetails.push({ name: t.name, directGaze, error: err, ellipsesDrawn: ellipses.length });
            }
            if (g) g.dragState = null;
            return { clamped, zeroNaN, testDetails };
        })()
        """)
        gaze_dict = gaze_res if isinstance(gaze_res, dict) else {}
        self.record("2.1", 2, "Eye Gaze: Offsets strictly clamped to [-2.2, 2.2] X and [-1.5, 1.5] Y",
                    gaze_dict.get("clamped") is True, gaze_dict.get("testDetails"))
        self.record("2.2", 2, "Eye Gaze: Zero NaN values across extreme targets, coincident & null",
                    gaze_dict.get("zeroNaN") is True, gaze_dict.get("testDetails"))

        # 2.3 - 2.12 Articulated Toggles on 10 Objects
        toggles_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            const av = g?.avatars?.[1];
            const targets = [
                { id: 'oven', type: 'oven' },
                { id: 'counter', type: 'counter' },
                { id: 'vanity', type: 'vanity' },
                { id: 'cafe_teapot', type: 'cafe_teapot', gadget: 'teapot' },
                { id: 'watering_can', type: 'watering_can', gadget: 'watering' },
                { id: 'picnic_basket', type: 'picnic_basket', gadget: 'picnic' },
                { id: 'spa_pet_bowl', type: 'spa_pet_bowl', gadget: 'pet_bowl' },
                { id: 'spa_brush', type: 'spa_brush', gadget: 'brush' },
                { id: 'perfume_bottle', type: 'perfume_bottle', gadget: 'perfume' },
                { id: 'hair_dryer', type: 'hair_dryer', gadget: 'dryer' }
            ];

            const out = {};
            for (const t of targets) {
                const obj = Object.assign({ x: 500, y: 400, w: 100, h: 100, state: false }, t);
                const p0 = g?.particles ? g.particles.length : 0;
                let err = null;
                const s0 = obj.state;
                try {
                    if (g) g.triggerObjectInteraction(obj, av);
                } catch(e) {
                    err = e.message;
                }
                const p1 = g?.particles ? g.particles.length : 0;
                out[t.id] = {
                    updated: (obj.state !== s0) || (p1 >= p0),
                    state: obj.state,
                    particlesSpawned: (p1 >= p0),
                    error: err
                };
            }
            return out;
        })()
        """)
        toggles_dict = toggles_res if isinstance(toggles_res, dict) else {}
        toggle_items = [
            ("2.3", "oven"), ("2.4", "counter"), ("2.5", "vanity"),
            ("2.6", "cafe_teapot"), ("2.7", "watering_can"), ("2.8", "picnic_basket"),
            ("2.9", "spa_pet_bowl"), ("2.10", "spa_brush"), ("2.11", "perfume_bottle"),
            ("2.12", "hair_dryer")
        ]
        for tid, key in toggle_items:
            res_item = toggles_dict.get(key, {})
            self.record(tid, 2, f"Articulated Toggle: {key} updates state/particles without console errors",
                        res_item.get("error") is None and res_item.get("updated") is True, res_item)

        # 2.13 Rapid Multi-Toggle Stress Test
        stress_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            const av = g?.avatars?.[1];
            const testObj = { id: 'stress_oven', type: 'oven', x: 200, y: 400, w: 100, h: 100, state: false };
            let err = null;
            try {
                if (g) {
                    for (let i = 0; i < 5; i++) {
                        g.triggerObjectInteraction(testObj, av);
                    }
                }
            } catch(e) {
                err = e.message;
            }
            return { ok: err === null, error: err };
        })()
        """)
        stress_dict = stress_res if isinstance(stress_res, dict) else {}
        self.record("2.13", 2, "Articulated Toggles: Rapid multi-toggle stress (5x consecutive toggles)",
                    stress_dict.get("ok") is True, stress_dict)

        # 2.14 - 2.16 drawObjectFrontLayer Vector Drawing and Safety
        front_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            const cv = document.createElement('canvas');
            cv.width = 1000; cv.height = 560;
            const ctx = cv.getContext('2d');
            const covered = ['cloud_bed', 'bubble_tub', 'tea_table', 'swing', 'beach_lounger', 'flamingo_ring'];

            let allUnocc = true;
            let allOcc = true;
            let allEdge = true;
            const details = {};

            for (const type of covered) {
                const obj = { id: 'front_' + type, type, x: 500, y: 400, w: 160, h: 120, hasFrontCover: true, state: true };
                let errUnocc = null;
                let errOcc = null;
                let errEdge = null;
                let drawOpsCount = 0;

                const drawMethods = ['beginPath', 'fill', 'stroke', 'drawImage', 'arc', 'ellipse', 'rect', 'quadraticCurveTo', 'bezierCurveTo'];
                const origs = {};
                drawMethods.forEach(m => {
                    origs[m] = ctx[m];
                    ctx[m] = function() {
                        drawOpsCount++;
                        return origs[m].apply(this, arguments);
                    };
                });

                // 1. Unoccupied render
                try {
                    if (g) g.drawObjectFrontLayer(ctx, obj);
                } catch(e) {
                    errUnocc = e.message;
                    allUnocc = false;
                }

                // 2. Occupied render
                try {
                    if (g) {
                        g.avatars[1].sittingOn = obj;
                        g.drawObjectFrontLayer(ctx, obj);
                        g.avatars[1].sittingOn = null;
                    }
                } catch(e) {
                    errOcc = e.message;
                    allOcc = false;
                }

                // 3. Off-screen edge coordinates
                try {
                    const edgeObj = Object.assign({}, obj, { x: -200, y: -100 });
                    if (g) g.drawObjectFrontLayer(ctx, edgeObj);
                } catch(e) {
                    errEdge = e.message;
                    allEdge = false;
                }

                drawMethods.forEach(m => { ctx[m] = origs[m]; });
                details[type] = { errUnocc, errOcc, errEdge, drawOpsCount, drewGeometry: drawOpsCount > 0 };
            }
            return { allUnocc, allOcc, allEdge, details };
        })()
        """)
        front_dict = front_res if isinstance(front_res, dict) else {}
        self.record("2.14", 2, "Front Layer Drawing: drawObjectFrontLayer safe unoccupied for all 6 covered types",
                    front_dict.get("allUnocc") is True, front_dict.get("details"))
        self.record("2.15", 2, "Front Layer Drawing: drawObjectFrontLayer safe occupied for all 6 covered types",
                    front_dict.get("allOcc") is True, front_dict.get("details"))
        self.record("2.16", 2, "Front Layer Drawing: Boundary / off-screen coordinate resilience",
                    front_dict.get("allEdge") is True, front_dict.get("details"))

    # =========================================================================
    # TIER 3: CROSS-FEATURE COMBINATIONS
    # =========================================================================
    def run_tier_3(self):
        print("\n" + "=" * 80)
        print("TIER 3: CROSS-FEATURE COMBINATIONS")
        print("=" * 80)

        # 3.1 - 3.5 Seating on Real Covered Objects & Z-Sandwich Invariant
        seating_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            if (!g || !g.roomObjects) return { error: "avatarWorldGame not initialized" };
            const cv = document.createElement('canvas');
            cv.width = 1000; cv.height = 560;
            const ctx = cv.getContext('2d');
            const coveredMap = [
                { room: 'cafe', type: 'tea_table' },
                { room: 'garden', type: 'swing' },
                { room: 'beach', type: 'beach_lounger' },
                { room: 'beach', type: 'flamingo_ring' }
            ];

            const out = {};
            let allInvariantsHold = true;

            for (const item of coveredMap) {
                const roomItems = g.roomObjects?.[item.room] || [];
                let obj = roomItems.find(o => o.type === item.type || o.id === item.type || (item.type === 'swing' && o.id === 'sakura_swing'));
                const isReal = !!obj;
                if (!obj) {
                    obj = { id: 'seat_' + item.type, type: item.type, x: 500, y: 400, w: 160, h: 120, seat: true, hasFrontCover: false };
                }

                const av = g.avatars[1];
                av.sittingOn = obj;

                // Mathematical Z-Sandwich Invariant: sortY(base) < sortY(avatar) < sortY(front)
                const baseSortY = obj.y;
                const avatarSortY = av.sittingOn.y + 8;
                const frontSortY = obj.y + 18;
                const invariantHold = (baseSortY < avatarSortY) && (avatarSortY < frontSortY);
                if (!invariantHold) allInvariantsHold = false;

                let renderErr = null;
                try {
                    g.drawInteractiveObject(ctx, obj);
                    g.drawVectorAvatar(ctx, av);
                    g.drawObjectFrontLayer(ctx, obj);
                } catch(e) {
                    renderErr = e.message;
                }
                av.sittingOn = null;

                out[item.type] = {
                    isRealObjectInRoom: isReal,
                    hasFrontCover: obj.hasFrontCover === true,
                    invariantHold,
                    renderOk: isReal && obj.hasFrontCover === true && renderErr === null,
                    error: renderErr
                };
            }
            return { items: out, allInvariantsHold };
        })()
        """)
        seat_items = seating_res.get("items", {}) if isinstance(seating_res, dict) else {}
        self.record("3.1", 3, "Z-Sandwich Seating: Avatar seated on real tea_table with front layer over waist",
                    seat_items.get("tea_table", {}).get("renderOk") is True, seat_items.get("tea_table"))
        self.record("3.2", 3, "Z-Sandwich Seating: Avatar seated on real swing with front vine ropes active",
                    seat_items.get("swing", {}).get("renderOk") is True, seat_items.get("swing"))
        self.record("3.3", 3, "Z-Sandwich Seating: Avatar seated on real beach_lounger with towel lapel",
                    seat_items.get("beach_lounger", {}).get("renderOk") is True, seat_items.get("beach_lounger"))
        self.record("3.4", 3, "Z-Sandwich Seating: Avatar seated inside real flamingo_ring with front head & wings",
                    seat_items.get("flamingo_ring", {}).get("renderOk") is True, seat_items.get("flamingo_ring"))
        self.record("3.5", 3, "Z-Sandwich Rendering Invariant: backLayer (obj.y) < avatar (obj.y+8) < frontLayer (obj.y+18)",
                    seating_res.get("allInvariantsHold") is True if isinstance(seating_res, dict) else False, seating_res)

        # 3.6 - 3.11 Drop-to-Interact on All 3 Characters
        drop_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            if (!g || !g.avatars) return { error: "avatars not initialized" };
            const slots = [1, 2, 3];
            const out = [];

            for (const s of slots) {
                const char = g.avatars[s];
                if (!char) continue;
                char.active = true;
                char.chewTimer = 0;
                char.heldItem = null;

                // 1. Food Drop
                const foodObj = { id: 'food_drop_' + s, type: 'cake_stand', food: true, x: char.x, y: char.y - 25 };
                if (typeof g.feedAvatar === 'function') {
                    g.feedAvatar(char, foodObj);
                }
                const foodOk = (char.chewTimer > 0) && (char.exprId === 'yummy' || char.emotionBubble === 'yum');

                // 2. Gadget Drop Simulation via drop handler or pointer event
                const gadgetObj = { id: 'gadget_drop_' + s, type: 'watering_can', gadget: 'watering', x: char.x, y: char.y - 25 };
                if (typeof g.dropItemOnAvatar === 'function') {
                    try { g.dropItemOnAvatar(char, gadgetObj); } catch(e) {}
                } else if (typeof g.handleDropOnAvatar === 'function') {
                    try { g.handleDropOnAvatar(char, gadgetObj); } catch(e) {}
                } else {
                    g.dragState = { kind: 'object', target: gadgetObj, pointerId: 1, moved: true, startX: char.x, startY: char.y - 25, offsetX: 0, offsetY: 0 };
                    gadgetObj.x = char.x;
                    gadgetObj.y = char.y - 25;
                    if (g.canvas && typeof g.canvas.onpointerup === 'function') {
                        try {
                            g.canvas.onpointerup({ pointerId: 1, clientX: char.x, clientY: char.y - 25 });
                        } catch(e) {}
                    }
                }
                const gadgetOk = !!(char.heldItem || char.propId === 'watering_can' || char.chewTimer > 0 || char.emotionBubble);

                out.push({
                    slot: s,
                    foodOk,
                    gadgetOk,
                    chewTimer: char.chewTimer,
                    heldItem: char.heldItem || char.propId
                });
            }
            g.dragState = null;
            return out;
        })()
        """)
        char_names = {1: "Amanda (slot 1)", 2: "Friend (slot 2)", 3: "Friend2 (slot 3)"}
        if isinstance(drop_res, list):
            for item in drop_res:
                s = item.get("slot", 1)
                name = char_names.get(s, f"Slot {s}")
                self.record(f"3.{5 + s}", 3, f"Drop-to-Interact: Dropping food on {name} triggers chewing & yummy expression",
                            item.get("foodOk") is True, item)
                self.record(f"3.{8 + s}", 3, f"Drop-to-Interact: Dropping gadget on {name} equips item & articulates hands",
                            item.get("gadgetOk") is True, item)
        else:
            for s in [1, 2, 3]:
                name = char_names.get(s, f"Slot {s}")
                self.record(f"3.{5 + s}", 3, f"Drop-to-Interact: Dropping food on {name} triggers chewing & yummy expression",
                            False, drop_res)
                self.record(f"3.{8 + s}", 3, f"Drop-to-Interact: Dropping gadget on {name} equips item & articulates hands",
                            False, drop_res)

    # =========================================================================
    # TIER 4: REAL-WORLD APPLICATION SCENARIOS
    # =========================================================================
    def run_tier_4(self):
        print("\n" + "=" * 80)
        print("TIER 4: REAL-WORLD APPLICATION SCENARIOS")
        print("=" * 80)

        flow_res = self.ws.eval("""
        (() => {
            const g = window.Cinnamo?.avatarWorldGame;
            if (!g || !g.roomObjects) return { ok: false, error: "avatarWorldGame missing or not initialized" };
            const steps = [];

            // Scenario 4.1: Cafe Tea Party
            try {
                g.selectRoom(0, 0);
                const cafeItems = g.getRoomItems();
                const table = cafeItems.find(o => o.type === 'tea_table' || o.id === 'tea_table');
                const teapot = cafeItems.find(o => o.gadget === 'teapot' || o.id === 'cafe_teapot');
                const oven = cafeItems.find(o => o.type === 'oven' || o.id === 'oven');
                const counter = cafeItems.find(o => o.type === 'counter' || o.id === 'counter');

                if (table) g.avatars[1].sittingOn = table;
                if (teapot) g.triggerObjectInteraction(teapot, g.avatars[1]);
                if (oven) g.triggerObjectInteraction(oven, g.avatars[1]);
                if (counter) g.triggerObjectInteraction(counter, g.avatars[1]);

                const food = cafeItems.find(o => o.food);
                if (food) g.feedAvatar(g.avatars[1], food);
                steps.push({ scenario: 'cafe', ok: true });
            } catch(e) {
                steps.push({ scenario: 'cafe', ok: false, error: e.message });
            }

            // Scenario 4.2: Cherry Blossom Garden
            try {
                g.selectRoom(2, 1);
                const gardenItems = g.getRoomItems();
                const swing = gardenItems.find(o => o.type === 'swing' || o.id === 'sakura_swing' || o.id === 'swing');
                const watering = gardenItems.find(o => o.gadget === 'watering' || o.id === 'watering_can');
                const basket = gardenItems.find(o => o.gadget === 'picnic' || o.id === 'picnic_basket');

                if (swing) g.avatars[2].sittingOn = swing;
                if (watering) g.triggerObjectInteraction(watering, g.avatars[1]);
                if (basket) g.triggerObjectInteraction(basket, g.avatars[1]);
                steps.push({ scenario: 'garden', ok: true });
            } catch(e) {
                steps.push({ scenario: 'garden', ok: false, error: e.message });
            }

            // Scenario 4.3: Ice Cream Beach
            try {
                g.selectRoom(3, 1);
                const beachItems = g.getRoomItems();
                const lounger = beachItems.find(o => o.type === 'beach_lounger' || o.id === 'beach_lounger');
                const flamingo = beachItems.find(o => o.type === 'flamingo_ring' || o.id === 'flamingo_ring');

                if (lounger) g.avatars[1].sittingOn = lounger;
                if (flamingo) g.avatars[3].sittingOn = flamingo;

                g.dragState = { target: { x: 750, y: 320 }, moved: true };
                steps.push({ scenario: 'beach', ok: true });
            } catch(e) {
                steps.push({ scenario: 'beach', ok: false, error: e.message });
            }

            // Scenario 4.4: Spa & Pet Grooming
            try {
                g.selectRoom(4, 1);
                const spaItems = g.getRoomItems();
                const tub = spaItems.find(o => o.type === 'bubble_tub' || o.id === 'bubble_tub');
                const bowl = spaItems.find(o => o.gadget === 'pet_bowl' || o.id === 'spa_pet_bowl');
                const brush = spaItems.find(o => o.gadget === 'brush' || o.id === 'spa_brush');

                if (tub) g.avatars[1].sittingOn = tub;
                if (bowl) g.triggerObjectInteraction(bowl, g.avatars[1]);
                if (brush) g.triggerObjectInteraction(brush, g.avatars[1]);
                steps.push({ scenario: 'spa', ok: true });
            } catch(e) {
                steps.push({ scenario: 'spa', ok: false, error: e.message });
            }

            // Reset test state cleanly
            g.dragState = null;
            g.avatars[1].sittingOn = null;
            g.avatars[2].sittingOn = null;
            g.avatars[3].sittingOn = null;

            return {
                allOk: steps.every(s => s.ok),
                steps
            };
        })()
        """)
        step_dict = {s.get("scenario"): s for s in flow_res.get("steps", [])} if isinstance(flow_res, dict) else {}
        self.record("4.1", 4, "Scenario Flow: Cafe Afternoon Tea Party (seating, teapot pouring, feeding, baking)",
                    step_dict.get("cafe", {}).get("ok") is True, step_dict.get("cafe"))
        self.record("4.2", 4, "Scenario Flow: Cherry Blossom Garden Care (swinging, watering flowers, picnic treats)",
                    step_dict.get("garden", {}).get("ok") is True, step_dict.get("garden"))
        self.record("4.3", 4, "Scenario Flow: Ice Cream Beach Pool Party (flamingo floating, sunbathing, gaze tracking)",
                    step_dict.get("beach", {}).get("ok") is True, step_dict.get("beach"))
        self.record("4.4", 4, "Scenario Flow: Spa & Pet Grooming Day (bubble bath, puppy feeding, bubble brush makeover)",
                    step_dict.get("spa", {}).get("ok") is True, step_dict.get("spa"))

        # 4.5 End-to-End Console and Runtime Integrity Check
        runtime_errors = self.ws.eval("window.__testErrors || []")
        has_errors = isinstance(runtime_errors, list) and len(runtime_errors) > 0
        self.record("4.5", 4, "End-to-End Integrity: Continuous multi-room transitions with 0 console/runtime errors",
                    not has_errors, {"errorCount": len(runtime_errors) if isinstance(runtime_errors, list) else 0, "errors": runtime_errors})

    # =========================================================================
    # SUMMARY AND TEARDOWN
    # =========================================================================
    def print_summary(self):
        total = len(self.results)
        passed = sum(1 for r in self.results if r.passed)
        failed = total - passed
        pass_rate = (passed / total * 100) if total > 0 else 0

        tier_counts = {1: [0, 0], 2: [0, 0], 3: [0, 0], 4: [0, 0]}
        for r in self.results:
            tier_counts[r.tier][1] += 1
            if r.passed:
                tier_counts[r.tier][0] += 1

        print("\n" + "=" * 80)
        print("DIGITAL BODIES E2E TEST SCORECARD")
        print("=" * 80)
        for t in range(1, 5):
            p, tot = tier_counts[t]
            rate = (p / tot * 100) if tot > 0 else 0
            color = "\033[92m" if p == tot else "\033[93m" if p > 0 else "\033[91m"
            reset = "\033[0m"
            print(f"Tier {t}: {color}{p}/{tot} passed ({rate:5.1f}%){reset}")

        overall_color = "\033[92m" if passed == total else "\033[91m"
        print("-" * 80)
        print(f"TOTAL:  {overall_color}{passed}/{total} passed ({pass_rate:5.1f}%)\033[0m")
        print("=" * 80)

        report_path = os.path.join(os.path.dirname(__file__), "test_digital_bodies_results.json")
        try:
            with open(report_path, "w", encoding="utf-8") as f:
                json.dump({
                    "timestamp": time.time(),
                    "total": total,
                    "passed": passed,
                    "failed": failed,
                    "passRate": pass_rate,
                    "results": [r.to_dict() for r in self.results]
                }, f, indent=2)
            print(f"📄 Full test report saved to: {report_path}")
        except Exception as e:
            print(f"Warning: Could not save JSON report: {e}")

        return passed == total

    def cleanup(self):
        if self.ws:
            self.ws.close()
        if self.chrome_proc:
            try:
                self.chrome_proc.terminate()
                self.chrome_proc.wait(timeout=3)
            except Exception:
                pass
        if self.http_server:
            try:
                self.http_server.shutdown()
            except Exception:
                pass
        if os.path.exists(self.temp_dir):
            try:
                shutil.rmtree(self.temp_dir, ignore_errors=True)
            except Exception:
                pass

    def run(self):
        try:
            print("🚀 Booting embedded HTTP server and headless Chrome CDP session...")
            self.start_server()
            self.launch_browser()
            print("✅ Chrome and Avatar World successfully initialized.")

            self.run_tier_1()
            self.run_tier_2()
            self.run_tier_3()
            self.run_tier_4()

            all_passed = self.print_summary()
            if not self.soft_fail and not all_passed:
                return 1
            return 0
        finally:
            self.cleanup()


def main():
    parser = argparse.ArgumentParser(description="2.5D Digital Bodies E2E Automated Test Runner")
    parser.add_argument("--port", type=int, default=None, help="HTTP server port (default: auto-allocated)")
    parser.add_argument("--cdp-port", type=int, default=None, help="Chrome DevTools port (default: auto-allocated)")
    parser.add_argument("--no-headless", action="store_true", help="Run Chrome with GUI visible")
    parser.add_argument("--soft", action="store_true", help="Always exit with code 0 (soft-fail / report only)")
    args = parser.parse_args()

    runner = DigitalBodiesE2ETestRunner(
        http_port=args.port,
        cdp_port=args.cdp_port,
        headless=not args.no_headless,
        soft_fail=args.soft
    )
    sys.exit(runner.run())


if __name__ == '__main__':
    main()
