/*
 * Capa de entrada desacoplada.
 *
 * El juego NO conoce teclas, micrófonos ni sensores. Sólo consume:
 *   - axis   : -1..1  velocidad vertical deseada (teclado)          → -1 = subir
 *   - target :  0..1  posición vertical deseada (toque, sensores)   →  0 = arriba, 1 = abajo
 *   - action : eventos discretos ('up', 'down', 'spin', 'hello')
 *
 * Cada "adapter" traduce un dispositivo a esas 3 primitivas. Agregar un sensor nuevo
 * (Arduino, micro:bit, ESP32 vía WebSocket/Web Serial/Web Bluetooth) = escribir un adapter
 * o usar directamente Cinnamo.input.feed({...}).
 */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const now = () => performance.now();

  class InputManager {
    constructor() {
      this.keys = new Set();
      this.customAxis = 0;
      this.targets = {};      // source -> { y, until, at }
      this.listeners = {};
      this.pointerMapper = y => y / window.innerHeight; // el juego lo reemplaza
      this.adapters = {};
    }

    on(evt, fn) { (this.listeners[evt] = this.listeners[evt] || []).push(fn); }
    emit(evt, data) { (this.listeners[evt] || []).forEach(fn => fn(data)); }

    setTarget(source, y, ttl = 400) {
      const t = now();
      this.targets[source] = { y: clamp(y, 0, 1), until: t + ttl, at: t };
    }

    setKey(key, pressed) {
      if (pressed) this.keys.add(key);
      else this.keys.delete(key);
    }

    setAxis(val) {
      this.customAxis = clamp(val, -1, 1);
    }

    /** API pública para sensores externos. */
    feed(msg = {}) {
      const src = msg.source || 'external';
      if (typeof msg.axis === 'number') this.setAxis(msg.axis);
      if (typeof msg.target === 'number') this.setTarget(src, msg.target, msg.ttl || 500);
      if (typeof msg.tilt === 'number') this.setTarget(src, 0.5 + clamp(msg.tilt, -1, 1) * 0.5, msg.ttl || 500);
      if (msg.action) this.emit('action', { type: msg.action, source: src });
    }

    /** Estado consolidado que el juego lee cada frame. */
    getControl() {
      let axis = this.customAxis || 0;
      if (this.keys.has('up')) axis -= 1;
      if (this.keys.has('down')) axis += 1;
      axis = clamp(axis, -1, 1);
      const t = now();
      let best = null;
      for (const k in this.targets) {
        const tg = this.targets[k];
        if (tg.until > t && (!best || tg.at > best.at)) best = tg;
      }
      return { axis, target: best ? best.y : null };
    }
  }

  const mgr = new InputManager();

  /* ---------------- Teclado ---------------- */
  const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down' };
  const ACTIONKEYS = { Space: 'spin', KeyH: 'hello', KeyP: 'pause', Escape: 'pause', Enter: 'start', KeyM: 'mute' };
  window.addEventListener('keydown', e => {
    if (window.Cinnamo?.hub && window.Cinnamo.hub.currentScreen !== 'flight') return;
    if (KEYMAP[e.code]) { mgr.keys.add(KEYMAP[e.code]); e.preventDefault(); }
    else if (ACTIONKEYS[e.code] && !e.repeat) { mgr.emit('action', { type: ACTIONKEYS[e.code], source: 'keys' }); e.preventDefault(); }
  });
  window.addEventListener('keyup', e => {
    if (KEYMAP[e.code]) mgr.keys.delete(KEYMAP[e.code]);
  });
  window.addEventListener('blur', () => mgr.keys.clear());

  /* ---------------- Toque / mouse ---------------- */
  // El dedo "arrastra" a Cinnamoroll: lo más natural para una nena de 5 años en tablet.
  function attachPointer(el) {
    let down = false;
    const upd = e => mgr.setTarget('pointer', mgr.pointerMapper(e.clientY), 800);
    el.addEventListener('pointerdown', e => { down = true; upd(e); el.setPointerCapture?.(e.pointerId); });
    el.addEventListener('pointermove', e => { if (down) upd(e); });
    const end = () => { down = false; };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    // mantener el objetivo vivo mientras el dedo está apoyado y quieto
    setInterval(() => { const t = mgr.targets.pointer; if (down && t) t.until = now() + 400; }, 100);
  }

  /* ---------------- Comandos de voz (Web Speech API) ---------------- */
  const COMMANDS = [
    ['spin', ['vuelta', 'gir', 'gira', 'girar', 'rueda', 'rodar', 'pirueta', 'spin', 'trompo', 'voltereta']],
    ['up', ['arriba', 'sub', 'sube', 'subir', 'vuel', 'vol', 'vuela', 'volar', 'alto', 'cielo', 'salta', 'saltar', 'trepa', 'up', 'ariba', 'ariva', 'arriva']],
    ['down', ['abaj', 'abajo', 'baj', 'baja', 'bajar', 'suelo', 'piso', 'cae', 'down']],
    ['hello', ['hola', 'cinna', 'canel', 'chau', 'chao', 'hello', 'lindo', 'bebe', 'amigo']],
  ];
  const strip = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  class VoiceCommands {
    static supported() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); }
    constructor(m) {
      this.m = m;
      this.active = false;
      this.rec = null;
      this.lastActionTime = 0;
      this.lastActionType = null;
    }

    start() {
      if (!VoiceCommands.supported()) return Promise.reject(new Error('Este navegador no soporta reconocimiento de voz (usá Chrome o Edge).'));
      const R = window.SpeechRecognition || window.webkitSpeechRecognition;
      const r = new R();
      const nav = (navigator.language || '').toLowerCase();
      r.lang = nav.startsWith('es') ? navigator.language : 'es-ES';
      r.continuous = true;
      r.interimResults = true;
      r.maxAlternatives = 3;

      r.onstart = () => { 
        this.m.emit('status', { source: 'voice', ok: true, msg: 'Escuchando: ¡decí "arriba", "abajo", "gira"!' });
      };

      r.onresult = e => {
        try {
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const res = e.results[i];
            const text = Array.from(res).map(a => a.transcript).join(' ');
            this.handle(res[0].transcript, text, res.isFinal);
          }
        } catch (err) {
          console.warn('Voice onresult handler error:', err);
        }
      };

      r.onerror = e => {
        // Silently ignore no-speech or aborted errors; they naturally happen during pauses
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          this.active = false;
          this.m.emit('status', { source: 'voice', ok: false, msg: 'Permiso de micrófono denegado.' });
        }
      };

      r.onend = () => { 
        if (this.active) {
          setTimeout(() => {
            if (this.active) {
              try { r.start(); } catch (_) {}
            }
          }, 250);
        }
      };

      this.rec = r;
      this.active = true;
      try {
        r.start();
      } catch (err) {
        return Promise.reject(err);
      }
      return Promise.resolve();
    }

    handle(display, allAlternatives, isFinal) {
      const hits = this.match(display) || this.match(allAlternatives);
      const nowMs = performance.now();
      if (hits.length > 0) {
        const action = hits[0];
        // Permite repetir el mismo comando si pasaron más de 450ms, o inmediatamente si es otro comando
        if (action !== this.lastActionType || (nowMs - this.lastActionTime) > 450) {
          this.lastActionType = action;
          this.lastActionTime = nowMs;
          this.m.emit('action', { type: action, source: 'voice' });
        }
      }
      this.m.emit('heard', { text: display, final: isFinal });
    }

    match(text) {
      if (!text) return [];
      const hits = [];
      const words = strip(text).split(/[^a-zñ]+/);
      for (const w of words) {
        if (!w) continue;
        // Decir el nombre del jugador también saluda
        const playerKey = strip(window.Cinnamo?.playerName?.get?.() || '');
        for (const [action, keys] of COMMANDS) {
          const allKeys = action === 'hello' && playerKey ? keys.concat(playerKey) : keys;
          if (allKeys.some(k => w.startsWith(k) || k.startsWith(w) && w.length >= 3)) {
            hits.push(action);
            break;
          }
        }
      }
      return hits;
    }

    stop() {
      this.active = false;
      try { this.rec && this.rec.stop(); } catch (_) {}
    }
  }

  /* ---------------- Volumen del micrófono: soplar / cantar = subir ---------------- */
  // Más robusto que el reconocimiento de voz con voces infantiles y funciona offline.
  class MicLevel {
    static supported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); }
    constructor(m) { this.m = m; this.active = false; this.level = 0; }

    async start() {
      if (!MicLevel.supported()) throw new Error('Micrófono no disponible (abrí el juego desde localhost o HTTPS).');
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      });
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      const src = this.ctx.createMediaStreamSource(this.stream);
      this.an = this.ctx.createAnalyser();
      this.an.fftSize = 1024;
      src.connect(this.an);
      this.buf = new Float32Array(this.an.fftSize);
      this.floor = 0.005;
      this.calibUntil = now() + 900; // 1er segundo: medir ruido ambiente
      this.active = true;
      this.loop();
    }

    loop() {
      if (!this.active) return;
      this.an.getFloatTimeDomainData(this.buf);
      let s = 0;
      for (let i = 0; i < this.buf.length; i++) s += this.buf[i] * this.buf[i];
      const rms = Math.sqrt(s / this.buf.length);
      if (now() < this.calibUntil) {
        this.floor = Math.max(this.floor, rms);
      } else {
        const raw = clamp((rms - this.floor * 1.6) / 0.12, 0, 1);
        // sube rápido, baja suave (como flotar)
        this.level += (raw - this.level) * (raw > this.level ? 0.25 : 0.04);
        this.m.setTarget('mic', 0.95 - this.level * 0.95, 300);
        this.m.emit('micLevel', this.level);
      }
      requestAnimationFrame(() => this.loop());
    }

    stop() {
      this.active = false;
      this.stream && this.stream.getTracks().forEach(t => t.stop());
      this.ctx && this.ctx.close();
      this.m.emit('micLevel', -1);
    }
  }

  /* ---------------- Inclinación (giroscopio / acelerómetro del dispositivo) ---------------- */
  class Tilt {
    static supported() { return 'DeviceOrientationEvent' in window; }
    constructor(m) { this.m = m; this.active = false; this.invert = false; this.base = null; this.range = 25; }

    async start() {
      if (!Tilt.supported()) throw new Error('Este dispositivo no tiene sensor de orientación.');
      if (typeof DeviceOrientationEvent.requestPermission === 'function') { // iOS 13+
        const p = await DeviceOrientationEvent.requestPermission();
        if (p !== 'granted') throw new Error('Permiso de movimiento denegado.');
      }
      this.base = null;
      this.got = false;
      this.h = e => {
        const ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
        let v = ang === 90 ? -e.gamma : (ang === -90 || ang === 270) ? e.gamma : e.beta;
        if (v == null) return;
        this.got = true;
        if (this.base === null) this.base = v;   // la posición inicial = centro
        let n = clamp((v - this.base) / this.range, -1, 1);
        if (this.invert) n = -n;
        this.m.setTarget('tilt', 0.5 + n * 0.5, 500);
      };
      window.addEventListener('deviceorientation', this.h);
      this.active = true;
      setTimeout(() => {
        if (this.active && !this.got) this.m.emit('status', { source: 'tilt', ok: false, msg: 'No llegan datos del sensor (¿es una PC? ¿HTTPS?).' });
      }, 1500);
    }
    recalibrate() { this.base = null; }
    stop() { this.active = false; window.removeEventListener('deviceorientation', this.h); }
  }

  /* ---------------- Sensor externo por WebSocket (futuro: Arduino / ESP32 / micro:bit) ---------------- */
  // Abrir con ?ws=ws://192.168.0.50:8765  — mensajes JSON: {"tilt":-0.3} | {"target":0.2} | {"action":"spin"}
  function attachWebSocketFromURL() {
    const url = new URLSearchParams(location.search).get('ws');
    if (!url) return;
    const connect = () => {
      const ws = new WebSocket(url);
      ws.onopen = () => mgr.emit('status', { source: 'ws', ok: true, msg: 'Sensor externo conectado' });
      ws.onmessage = ev => { try { mgr.feed({ source: 'ws', ...JSON.parse(ev.data) }); } catch (_) {} };
      ws.onclose = () => setTimeout(connect, 2000);
    };
    connect();
  }

  mgr.adapters.voice = new VoiceCommands(mgr);
  mgr.adapters.mic = new MicLevel(mgr);
  mgr.adapters.tilt = new Tilt(mgr);
  mgr.supported = { voice: VoiceCommands.supported(), mic: MicLevel.supported(), tilt: Tilt.supported() };
  mgr.attachPointer = attachPointer;
  attachWebSocketFromURL();

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.input = mgr;
})();
