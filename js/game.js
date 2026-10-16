/* Lógica del juego: volar, juntar estrellas, celebrar. Sin "game over": sólo refuerzo positivo. */
(function () {
  const { audio: A, input: IN, character: CH } = window.Cinnamo;
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;

  const canvas = $('game');
  const ctx = canvas.getContext('2d');

  const GOAL = 10; // estrellas para cada celebración (contable con los dedos)
  const PRAISE = ['¡Muy bien!', '¡Genial!', '¡Bravo!', '¡Increíble!', '¡Lo lograste!', '¡Súper!'];
  const CHEERS = ['¡Bravo!', '¡Genial!', '¡Súper!', '¡Wiii!'];

  const THEMES = [
    { top: '#9fd3ff', bottom: '#ffe3f1', cloud: '#ffffff', floor: '#ffd9ea', stars: 0.0, sun: 1 },   // día
    { top: '#ff9ec4', bottom: '#ffe2b8', cloud: '#fff3f8', floor: '#ffc9dc', stars: 0.15, sun: 1 },  // atardecer
    { top: '#2f3f96', bottom: '#7f90e3', cloud: '#fbe3f0', floor: '#f7cfe3', stars: 1.0, sun: 0 },   // noche
    { top: '#b9a6ff', bottom: '#ffd3e6', cloud: '#ffffff', floor: '#ffd6ea', stars: 0.4, sun: 0.5 }, // amanecer
  ].map(t => ({ ...t, topC: hex(t.top), bottomC: hex(t.bottom), cloudC: hex(t.cloud), floorC: hex(t.floor) }));

  function hex(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) { return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',')})`; }

  /* ---------------- Settings persistentes ---------------- */
  const SETTINGS_KEY = 'cinnamo.settings.v1';
  const settings = Object.assign({ voice: false, mic: false, tilt: false, sound: true, invertTilt: false },
    JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
  const saveSettings = () => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  /* ---------------- Estado ---------------- */
  let W = 0, H = 0, DPR = 1, size = 100, px = 0, top = 0, bottom = 0;
  const S = {
    mode: 'menu', t: 0, score: 0, inLevel: 0, level: 0,
    themeFrom: 0, themeTo: 0, themeMix: 1,
    items: [], parts: [], clouds: [], stars: [],
    spawnT: 1, trail: null, celebrateT: 0, combo: 0, comboT: 0,
    p: { y: 0.5, vy: 0, mood: 'idle', moodT: 0, spin: 0, spinT: 0, blinkT: 2, blink: 0, wiggle: 0 },
  };

  function layout() {
    size = clamp(Math.min(W, H) * 0.2, 70, 170);
    px = W * 0.26;
    top = H * 0.12 + size * 0.55;
    bottom = H * 0.84 - size * 0.5;
  }
  const playToY = v => lerp(top, bottom, v);
  IN.pointerMapper = clientY => clamp((clientY - top) / (bottom - top), 0, 1);

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layout();
    if (!S.clouds.length) initScenery();
  }

  function initScenery() {
    for (let i = 0; i < 9; i++) {
      const far = i < 5;
      S.clouds.push({ x: rand(0, W), y: rand(H * 0.08, H * 0.7), s: far ? rand(22, 38) : rand(40, 64), v: far ? rand(12, 20) : rand(28, 42), far });
    }
    for (let i = 0; i < 70; i++) S.stars.push({ x: Math.random(), y: Math.random() * 0.75, r: rand(0.8, 2.4), ph: rand(0, 6.28) });
  }

  /* ---------------- Items ---------------- */
  function spawn(dt) {
    if (S.celebrateT > 0) return;
    S.spawnT -= dt;
    if (S.trail) { // caminito de estrellas en forma de ola: invita a seguirlo
      if (S.spawnT <= 0) {
        const tr = S.trail;
        addItem('star', clamp(tr.base + Math.sin(tr.i * 0.8) * tr.amp, 0.05, 0.95));
        S.spawnT = 0.28; tr.i++;
        if (tr.i >= tr.n) { S.trail = null; S.spawnT = 1.4; }
      }
      return;
    }
    if (S.spawnT > 0) return;
    const r = Math.random();
    if (r < 0.22) {
      S.trail = { base: rand(0.25, 0.75), amp: rand(0.12, 0.25), i: 0, n: 5 + (Math.random() * 3 | 0) };
      S.spawnT = 0;
    } else {
      const type = r < 0.78 ? 'star' : r < 0.92 ? 'roll' : 'heart';
      // ni muy lejos de donde está ahora: siempre alcanzable
      addItem(type, clamp(S.p.y + rand(-0.45, 0.45), 0.03, 0.97));
      S.spawnT = rand(0.9, 1.5);
    }
  }
  function addItem(type, y) {
    S.items.push({ type, x: W + 60, y: playToY(y), ph: rand(0, 6.28), r: size * (type === 'star' ? 0.22 : 0.26), got: false });
  }
  const speed = () => Math.min(W * 0.17 * (1 + S.level * 0.07), W * 0.3);

  /* ---------------- Partículas ---------------- */
  function burst(x, y, n, colors, spd = 220, kind = 'spark') {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), v = rand(spd * 0.3, spd);
      S.parts.push({ kind, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (kind === 'confetti' ? 200 : 0),
        life: kind === 'confetti' ? rand(1.8, 3) : rand(0.5, 0.9), t: 0, c: colors[i % colors.length],
        s: kind === 'confetti' ? rand(6, 12) : rand(3, 7), rot: rand(0, 6), vr: rand(-8, 8) });
    }
  }
  function floatText(x, y, txt) { S.parts.push({ kind: 'text', x, y, vx: 0, vy: -70, life: 0.9, t: 0, txt }); }

  /* ---------------- Acciones ---------------- */
  function setMood(m, t) { S.p.mood = m; S.p.moodT = t; }
  function currentPointer() { return S.p.y; }

  function onAction({ type, source }) {
    if (window.Cinnamo?.hub && window.Cinnamo.hub.currentScreen !== 'flight') return;
    if (type === 'start') { if (S.mode !== 'play') startGame(); return; }
    if (type === 'pause') { S.mode === 'play' ? pause() : S.mode === 'pause' && startGame(); return; }
    if (type === 'mute') { toggle('sound'); return; }
    if (S.mode !== 'play') {
      if (source === 'voice' && (type === 'up' || type === 'hello')) startGame(); // "¡vamos a volar!" arranca
      return;
    }
    switch (type) {
      case 'up':
        S.p.vy = -1.9;
        IN.setTarget('voice', Math.max(0.06, currentPointer() - 0.4), 1800);
        floatText(px, playToY(S.p.y) - size * 0.45, '¡Arriba! 🪽');
        setMood('happy', 0.8);
        A.whoosh(true);
        break;
      case 'down':
        S.p.vy = 1.5;
        IN.setTarget('voice', Math.min(0.94, currentPointer() + 0.4), 1800);
        floatText(px, playToY(S.p.y) - size * 0.45, '¡Abajo! ☁️');
        A.whoosh(false);
        break;
      case 'spin':
        if (S.p.spinT <= 0) {
          S.p.spinT = 0.8;
          A.spin();
          setMood('wow', 0.9);
          floatText(px, playToY(S.p.y) - size * 0.45, '¡Pirueta! ✨');
        }
        break;
      case 'hello':
        setMood('happy', 1.4); S.p.wiggle = 1.4;
        burst(px, playToY(S.p.y) - size * 0.4, 8, ['#ff8fbf', '#ffb3d1'], 120, 'heart');
        floatText(px, playToY(S.p.y) - size * 0.45, '¡Hola Amanda! 💖');
        A.kawaiiChirp('cheer');
        break;
    }
  }
  IN.on('action', onAction);

  function collect(it) {
    it.got = true;
    S.score++; S.inLevel++;
    S.combo = S.comboT > 0 ? S.combo + 1 : 0; S.comboT = 1.2;
    const colors = it.type === 'heart' ? ['#ff8fbf', '#ffc2dc', '#fff'] : it.type === 'roll' ? ['#f2c27b', '#fff', '#ffe066'] : ['#ffe066', '#fff6b0', '#fff'];
    burst(it.x, it.y, it.type === 'star' ? 12 : 22, colors);
    floatText(it.x, it.y - it.r, '+1');
    it.type === 'star' ? A.collect(S.combo) : A.colorSplat();
    setMood('happy', 0.5);
    updateHud(true);
    if (S.inLevel >= GOAL) celebrate();
  }

  function celebrate() {
    S.inLevel = 0; S.level++;
    S.celebrateT = 3;
    S.themeFrom = S.themeTo; S.themeTo = S.level % THEMES.length; S.themeMix = 0;
    for (let i = 0; i < 4; i++) burst(rand(W * 0.2, W * 0.8), rand(H * 0.1, H * 0.4), 40,
      ['#ff8fbf', '#9fd3ff', '#ffe066', '#b9a6ff', '#9be3c1', '#fff'], 380, 'confetti');
    A.celebrate();
    setMood('happy', 3); S.p.spinT = 0.8;
    const el = $('cheer');
    el.textContent = CHEERS[(Math.random() * CHEERS.length) | 0];
    el.classList.remove('hidden'); el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    setTimeout(() => el.classList.add('hidden'), 2400);
    setTimeout(() => updateHud(false), 600);
  }

  /* ---------------- Update ---------------- */
  function update(dt) {
    S.t += dt;
    const p = S.p;

    // escenario siempre se mueve (también en el menú)
    for (const c of S.clouds) {
      c.x -= c.v * dt * (S.mode === 'play' ? 1.6 : 0.6);
      if (c.x < -c.s * 3) { c.x = W + c.s * 3; c.y = rand(H * 0.08, H * 0.7); }
    }
    if (S.themeMix < 1) S.themeMix = Math.min(1, S.themeMix + dt / 3);

    // parpadeo
    p.blinkT -= dt;
    if (p.blinkT <= 0) { p.blink = 0.13; p.blinkT = rand(2, 5); }
    p.blink = Math.max(0, p.blink - dt);
    p.moodT -= dt; if (p.moodT <= 0) p.mood = 'idle';
    p.wiggle = Math.max(0, p.wiggle - dt);
    if (p.spinT > 0) { p.spinT -= dt; p.spin = (1 - Math.max(0, p.spinT) / 0.8) * Math.PI * 2; } else p.spin = 0;

    updateParticles(dt);
    if (S.mode !== 'play') return;

    // movimiento: resorte amortiguado → suave, directo y receptivo hacia arriba y hacia abajo
    const ctl = IN.getControl();
    let acc;
    if (ctl.axis !== 0) {
      const targetVy = ctl.axis * 2.8;
      acc = (targetVy - p.vy) * 14;
      delete IN.targets.voice;
      delete IN.targets.pointer;
    } else if (ctl.target !== null) {
      acc = (ctl.target - p.y) * 36 - p.vy * 10;
    } else {
      acc = -p.vy * 7;
    }
    p.vy += acc * dt;
    p.y += p.vy * dt;
    if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) * 0.3; }
    if (p.y > 1) { p.y = 1; p.vy = -Math.abs(p.vy) * 0.3; }

    spawn(dt);
    S.comboT -= dt;
    if (S.celebrateT > 0) S.celebrateT -= dt;

    // items + imán generoso (para manos de 5 años)
    const py = playToY(p.y) + Math.sin(S.t * 3) * size * 0.05;
    const v = speed();
    for (const it of S.items) {
      if (it.got) continue;
      it.x -= v * dt;
      it.ph += dt * 3;
      const dx = px - it.x, dy = py - it.y, d = Math.hypot(dx, dy);
      if (d < size * 1.5 && dx > -size * 0.5) { const f = (1 - d / (size * 1.5)) * 900 * dt; it.x += dx / d * f; it.y += dy / d * f; }
      if (d < size * 0.55 + it.r) collect(it);
    }
    S.items = S.items.filter(it => !it.got && it.x > -80);
  }

  function updateParticles(dt) {
    for (const q of S.parts) {
      q.t += dt;
      q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.kind === 'confetti') { q.vy += 380 * dt; q.vx *= 0.99; q.rot += q.vr * dt; }
      else if (q.kind !== 'text') { q.vx *= 0.92; q.vy *= 0.92; }
    }
    S.parts = S.parts.filter(q => q.t < q.life);
  }

  /* ---------------- Render ---------------- */
  function theme() {
    const a = THEMES[S.themeFrom], b = THEMES[S.themeTo], t = S.themeMix;
    return {
      top: mix(a.topC, b.topC, t), bottom: mix(a.bottomC, b.bottomC, t),
      cloud: mix(a.cloudC, b.cloudC, t), floor: mix(a.floorC, b.floorC, t),
      stars: lerp(a.stars, b.stars, t), sun: lerp(a.sun, b.sun, t),
    };
  }

  function render() {
    const th = theme();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, th.top); g.addColorStop(1, th.bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // estrellitas de fondo
    if (th.stars > 0.01) {
      ctx.fillStyle = '#fff';
      for (const s of S.stars) {
        ctx.globalAlpha = th.stars * (0.5 + 0.5 * Math.sin(S.t * 2 + s.ph));
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // sol / luna
    const cx = W * 0.82, cy = H * 0.2, R = Math.min(W, H) * 0.07;
    if (th.sun > 0.01) {
      ctx.globalAlpha = th.sun;
      const sg = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 2.2);
      sg.addColorStop(0, 'rgba(255,240,170,0.9)'); sg.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, R * 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    }
    if (th.sun < 0.99) {
      ctx.globalAlpha = 1 - th.sun;
      ctx.fillStyle = '#fff6c9';
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, H);
      ctx.arc(cx + R * 0.45, cy - R * 0.25, R * 0.85, 0, Math.PI * 2);
      ctx.clip('evenodd');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // nubes (lejanas → cercanas)
    for (const c of S.clouds) if (c.far) cloud(c.x, c.y, c.s, th.cloud, 0.6);
    for (const c of S.clouds) if (!c.far) cloud(c.x, c.y, c.s, th.cloud, 0.9);

    // piso de nubes rosadas
    const fr = Math.max(H * 0.09, 50), off = (S.t * (S.mode === 'play' ? 60 : 20)) % (fr * 1.4);
    ctx.fillStyle = th.floor;
    for (let x = -off - fr; x < W + fr * 2; x += fr * 1.4) {
      const yy = H - fr * 0.55 + Math.sin(x * 0.01) * fr * 0.15;
      ctx.beginPath(); ctx.arc(x, yy, fr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillRect(0, H - fr * 0.4, W, fr);

    // items
    for (const it of S.items) drawItem(it);

    // Cinnamoroll
    const p = S.p;
    const inMenu = S.mode === 'menu';
    const charState = {
      t: S.t,
      flapSpeed: p.wiggle > 0 ? 22 : 8 + Math.min(6, Math.abs(p.vy) * 8),
      flapAmp: p.wiggle > 0 ? 0.55 : 0.38,
      mood: p.mood, blink: p.blink > 0,
      tilt: clamp(p.vy * 0.35, -0.35, 0.35),
      spin: p.spin, glow: true,
    };
    if (inMenu) {
      // en el menú lo dibujamos dentro de la tarjeta para que no quede tapado
      const mc = $('menuChar'), m = mc.getContext('2d');
      if (mc.width !== mc.clientWidth * DPR) { mc.width = mc.clientWidth * DPR; mc.height = mc.clientHeight * DPR; }
      m.setTransform(DPR, 0, 0, DPR, 0, 0);
      m.clearRect(0, 0, mc.clientWidth, mc.clientHeight);
      CH.draw(m, mc.clientWidth / 2, mc.clientHeight * 0.5 + Math.sin(S.t * 2) * 5, mc.clientWidth * 0.52,
        { ...charState, tilt: 0, glow: false, mood: 'idle' });
    } else {
      CH.draw(ctx, px, playToY(p.y) + Math.sin(S.t * 3) * size * 0.05, size, charState);
    }

    // partículas
    for (const q of S.parts) drawPart(q);
  }

  const PUFFS = [[0, 0, 1], [-0.95, 0.25, 0.7], [0.95, 0.25, 0.75], [-0.4, -0.4, 0.7], [0.45, -0.35, 0.65]];
  function cloud(x, y, s, color, alpha) {
    ctx.globalAlpha = alpha; ctx.fillStyle = color;
    ctx.beginPath();
    for (const [ox, oy, r] of PUFFS) {
      const cx = x + ox * s, cy = y + oy * s, rr = r * s;
      ctx.moveTo(cx + rr, cy);
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function starPath(x, y, r, inner = 0.48, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = rot + i * Math.PI / 5, rr = i % 2 ? r * inner : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
  }
  function heartPath(x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.9);
    ctx.bezierCurveTo(x - r * 1.4, y, x - r * 0.8, y - r * 1.1, x, y - r * 0.4);
    ctx.bezierCurveTo(x + r * 0.8, y - r * 1.1, x + r * 1.4, y, x, y + r * 0.9);
    ctx.closePath();
  }

  function drawItem(it) {
    const y = it.y + Math.sin(it.ph) * 6, r = it.r;
    ctx.lineJoin = 'round';
    // brillo
    const gl = ctx.createRadialGradient(it.x, y, r * 0.3, it.x, y, r * 1.8);
    gl.addColorStop(0, 'rgba(255,255,255,0.6)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(it.x, y, r * 1.8, 0, Math.PI * 2); ctx.fill();

    if (it.type === 'star') {
      starPath(it.x, y, r, 0.5, -Math.PI / 2 + Math.sin(it.ph) * 0.15);
      ctx.fillStyle = '#ffe066'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#f2b100'; ctx.stroke();
      ctx.fillStyle = '#7a5a00';
      ctx.beginPath(); ctx.arc(it.x - r * 0.18, y, r * 0.06, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(it.x + r * 0.18, y, r * 0.06, 0, 7); ctx.fill();
    } else if (it.type === 'roll') { // rollito de canela (¡su nombre!)
      ctx.fillStyle = '#efc07e'; ctx.strokeStyle = '#a8703a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(it.x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.2) {
        const rr = r * 0.85 * (a / (Math.PI * 5));
        ctx.lineTo(it.x + Math.cos(a + it.ph * 0.3) * rr, y + Math.sin(a + it.ph * 0.3) * rr);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(it.x - r * 0.6, y - r * 0.3); ctx.quadraticCurveTo(it.x, y + r * 0.2, it.x + r * 0.6, y - r * 0.4); ctx.stroke();
    } else {
      heartPath(it.x, y, r);
      ctx.fillStyle = '#ff8fbf'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#e8679f'; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.ellipse(it.x - r * 0.4, y - r * 0.3, r * 0.18, r * 0.12, -0.6, 0, 7); ctx.fill();
    }
  }

  function drawPart(q) {
    const a = 1 - q.t / q.life;
    ctx.globalAlpha = Math.max(0, a);
    if (q.kind === 'text') {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#e8679f'; ctx.lineWidth = 5;
      ctx.font = `800 ${Math.round(size * 0.35)}px "Baloo 2", system-ui`;
      ctx.textAlign = 'center';
      ctx.strokeText(q.txt, q.x, q.y); ctx.fillText(q.txt, q.x, q.y);
    } else if (q.kind === 'confetti') {
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot);
      ctx.fillStyle = q.c; ctx.fillRect(-q.s / 2, -q.s / 4, q.s, q.s / 2);
      ctx.restore();
    } else if (q.kind === 'heart') {
      ctx.fillStyle = q.c; heartPath(q.x, q.y, q.s * 2); ctx.fill();
    } else {
      ctx.fillStyle = q.c; starPath(q.x, q.y, q.s * a + 1, 0.45); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------------- HUD / UI ---------------- */
  const progress = $('progress');
  for (let i = 0; i < GOAL; i++) progress.appendChild(document.createElement('span'));
  function updateHud() {
    $('scoreNum').textContent = S.score;
    [...progress.children].forEach((el, i) => el.classList.toggle('on', i < S.inLevel));
  }

  function startGame() {
    A.unlock();
    resize();
    const first = S.mode === 'menu';
    S.mode = 'play';
    $('menu').classList.add('hidden');
    $('hud').classList.remove('hidden');
    $('topbtns').classList.remove('hidden');
    const touchControls = $('flightTouchControls');
    if (touchControls) touchControls.classList.remove('hidden');
    if (first) A.kawaiiChirp('cheer');
    last = performance.now();
  }
  function pause() {
    if (S.mode !== 'play') return;
    S.mode = 'pause';
    $('menu').classList.remove('hidden');
    const touchControls = $('flightTouchControls');
    if (touchControls) touchControls.classList.add('hidden');
    $('btnPlay').querySelector('.tri').textContent = '▶';
  }

  function initFlightTouchControls() {
    const wireButton = (btnId, key, soundFn) => {
      const el = $(btnId);
      if (!el) return;
      const start = e => {
        e.preventDefault();
        e.stopPropagation();
        IN.setKey(key, true);
        el.classList.add('active');
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
        if (soundFn) soundFn();
      };
      const end = e => {
        IN.setKey(key, false);
        el.classList.remove('active');
        try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      el.addEventListener('pointerdown', start);
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
      el.addEventListener('lostpointercapture', end);
    };

    wireButton('btnFlightUp', 'up', () => A.whoosh(true));
    wireButton('btnFlightDown', 'down', () => A.whoosh(false));

    const wireAction = (btnId, actionName) => {
      const el = $(btnId);
      if (!el) return;
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        IN.emit('action', { type: actionName, source: 'touch' });
      });
    };

    wireAction('btnFlightSpin', 'spin');
    wireAction('btnFlightHello', 'hello');
  }
  initFlightTouchControls();

  window.Cinnamo.startFlightGame = startGame;
  window.Cinnamo.pauseFlightGame = pause;

  $('btnPlay').addEventListener('click', startGame);
  $('btnPause').addEventListener('click', pause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  IN.attachPointer(canvas);

  // feedback para papás de lo que escuchó el reconocimiento
  let heardTimer;
  IN.on('heard', ({ text }) => {
    const el = $('heard');
    el.textContent = '👂 ' + text;
    el.classList.remove('hidden');
    clearTimeout(heardTimer); heardTimer = setTimeout(() => el.classList.add('hidden'), 1800);
  });
  IN.on('micLevel', lvl => {
    $('micmeter').classList.toggle('hidden', lvl < 0);
    if (lvl >= 0) $('micfill').style.height = (lvl * 100).toFixed(0) + '%';
  });
  IN.on('status', ({ source, ok, msg }) => {
    setStatus(msg);
    if (!ok && settings[source] !== undefined) { settings[source] = false; saveSettings(); refreshChips(source, 'err'); }
  });

  /* ---------------- Panel de controles (papás) ---------------- */
  const statusEl = $('status');
  const setStatus = msg => { statusEl.textContent = msg || ''; };

  function refreshChips(errFor) {
    document.querySelectorAll('.chip').forEach(ch => {
      const k = ch.dataset.toggle;
      ch.classList.toggle('on', !!settings[k]);
      ch.classList.toggle('err', k === errFor);
      ch.classList.toggle('na', IN.supported[k] === false);
    });
    document.querySelectorAll('.hint').forEach(h => {
      const m = h.dataset.mode;
      h.classList.toggle('off', m !== 'keys' && !settings[m]);
    });
  }

  async function enable(k, on) {
    const ad = IN.adapters[k];
    if (!ad) return;
    if (on) {
      // voz y soplido comparten el micrófono: en varios dispositivos chocan, así que son excluyentes
      if (k === 'voice' && settings.mic) { IN.adapters.mic.stop(); settings.mic = false; }
      if (k === 'mic' && settings.voice) { IN.adapters.voice.stop(); settings.voice = false; }
      await ad.start();
    } else ad.stop();
  }

  async function toggle(k) {
    if (k === 'sound') {
      settings.sound = !settings.sound; A.setMuted(!settings.sound);
      if (!settings.sound && 'speechSynthesis' in window) speechSynthesis.cancel();
    } else if (k === 'invertTilt') {
      settings.invertTilt = !settings.invertTilt; IN.adapters.tilt.invert = settings.invertTilt;
    } else {
      const ad = IN.adapters[k];
      if (k === 'tilt' && settings.tilt && ad.active) { ad.recalibrate(); setStatus('Inclinación recalibrada ✔'); return; }
      const want = !settings[k];
      try {
        await enable(k, want);
        settings[k] = want;
        setStatus(want ? ({ voice: 'Decí: “arriba”, “abajo”, “gira”, “hola”', mic: 'Soplá o cantá para subir', tilt: 'Inclinación activa (tocá de nuevo para recalibrar)' }[k]) : '');
      } catch (e) {
        settings[k] = false;
        setStatus(e.message || String(e));
        saveSettings(); refreshChips(k);
        return;
      }
    }
    saveSettings(); refreshChips();
  }

  document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => { A.unlock(); toggle(ch.dataset.toggle); }));

  // restaurar settings: sonido/invertir directo; sensores requieren gesto del usuario → se re-activan al primer toque
  A.setMuted(!settings.sound);
  IN.adapters.tilt.invert = settings.invertTilt;
  const pending = ['voice', 'mic', 'tilt'].filter(k => settings[k]);
  pending.forEach(k => { settings[k] = false; });
  refreshChips();
  if (pending.length) {
    const resume = e => {
      window.removeEventListener('pointerdown', resume, true);
      if (e.target.closest && e.target.closest('.chip')) return; // el papá está tocando los controles a mano
      pending.forEach(k => toggle(k));
    };
    window.addEventListener('pointerdown', resume, true);
  }

  /* ---------------- Loop ---------------- */
  let last = performance.now();
  function frame(t) {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    if (!window.Cinnamo?.hub || window.Cinnamo.hub.currentScreen === 'flight') {
      update(dt);
      render();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  updateHud();
  requestAnimationFrame(frame);

  window.Cinnamo.state = S; // útil para depurar desde la consola
  window.Cinnamo.game = S;
  window.Cinnamo.flightGame = {
    state: S,
    startGame,
    pause,
    moveUp: (pressed = true) => IN.setKey('up', pressed),
    moveDown: (pressed = true) => IN.setKey('down', pressed),
    spin: () => IN.emit('action', { type: 'spin', source: 'api' }),
    hello: () => IN.emit('action', { type: 'hello', source: 'api' }),
    setAxis: (val) => IN.setAxis(val)
  };

  // ?demo → arranca solo y vuela en piloto automático (para probar la visual)
  if (new URLSearchParams(location.search).has('demo')) {
    startGame();
    setInterval(() => {
      const next = S.items.filter(i => !i.got && i.x > px).sort((a, b) => a.x - b.x)[0];
      if (next) IN.setTarget('demo', (next.y - top) / (bottom - top), 300);
    }, 100);
  }
})();
