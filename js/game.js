/* Lógica del juego: volar, juntar estrellas, celebrar. Sin "game over": sólo refuerzo positivo.
 * Soporta hasta 3 jugadores simultáneos en pantalla (P1 🌸, P2 🩵, P3 💛) con mando móvil o Bluetooth.
 */
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
  const loadSettings = () => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') || {}; } catch (_) { return {}; }
  };
  const settings = Object.assign({ voice: false, mic: false, tilt: false, sound: true, invertTilt: false }, loadSettings());
  const saveSettings = () => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (_) {} };

  /* ---------------- Estado ---------------- */
  let W = 0, H = 0, DPR = 1, size = 100, px = 0, top = 0, bottom = 0;
  const S = {
    mode: 'menu', t: 0, score: 0, inLevel: 0, level: 0,
    themeFrom: 0, themeTo: 0, themeMix: 1,
    items: [], parts: [], clouds: [], stars: [],
    spawnT: 1, trail: null, celebrateT: 0, combo: 0, comboT: 0,
    p: { slot: 1, heroId: 'cinna', y: 0.5, vy: 0, mood: 'idle', moodT: 0, spin: 0, spinT: 0, blinkT: 2, blink: 0, wiggle: 0 },
    coPlayers: {
      2: { slot: 2, active: false, heroId: 'milk', y: 0.32, vy: 0, axis: 0, keys: { up: false, down: false }, mood: 'idle', moodT: 0, spin: 0, spinT: 0, blinkT: 2.3, blink: 0, wiggle: 0 },
      3: { slot: 3, active: false, heroId: 'purin', y: 0.68, vy: 0, axis: 0, keys: { up: false, down: false }, mood: 'idle', moodT: 0, spin: 0, spinT: 0, blinkT: 3.1, blink: 0, wiggle: 0 },
    }
  };

  function layout() {
    size = clamp(Math.min(W, H) * 0.2, 70, 170);
    px = W * 0.28;
    top = H * 0.12 + size * 0.55;
    bottom = H * 0.84 - size * 0.5;
  }
  const playToY = v => lerp(top, bottom, v);
  const getFlyerX = slot => slot === 1 ? px : (slot === 2 ? Math.max(size * 0.65, px - size * 0.78) : Math.max(size * 0.45, px - size * 1.48));
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
  function setMood(m, t, target = S.p) { target.mood = m; target.moodT = t; }
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
        floatText(px, playToY(S.p.y) - size * 0.45, `¡Hola ${cinnaName()}! 💖`);
        A.kawaiiChirp('cheer');
        break;
    }
  }
  IN.on('action', onAction);

  /* ---------------- Controles Cooperativos P2 y P3 ---------------- */
  function setCoPlayerJoystick(slot, x, y) {
    const cp = S.coPlayers[slot];
    if (!cp) return;
    cp.active = true;
    cp.axis = Math.abs(y) > 0.12 ? clamp(y, -1, 1) : 0;
    if (cp.axis !== 0 && S.mode !== 'play') startGame();
  }

  function setCoPlayerInput(slot, btn, pressed) {
    const cp = S.coPlayers[slot];
    if (!cp) return;
    cp.active = true;
    if (pressed && S.mode !== 'play') startGame();
    const fx = getFlyerX(slot);
    const fy = playToY(cp.y);
    if (btn === 'up') {
      cp.keys.up = pressed;
      if (pressed) {
        cp.vy = -1.9;
        setMood('happy', 0.8, cp);
        A.whoosh(true);
      }
    } else if (btn === 'down') {
      cp.keys.down = pressed;
      if (pressed) {
        cp.vy = 1.5;
        A.whoosh(false);
      }
    } else if ((btn === 'jump' || btn === 'spin') && pressed) {
      if (cp.spinT <= 0) {
        cp.spinT = 0.8;
        A.spin();
        setMood('wow', 0.9, cp);
        floatText(fx, fy - size * 0.42, '¡Pirueta! ✨');
      }
    } else if ((btn === 'treat' || btn === 'hello') && pressed) {
      setMood('happy', 1.4, cp);
      cp.wiggle = 1.4;
      burst(fx, fy - size * 0.38, 8, ['#38bdf8', '#fde047', '#f472b6'], 120, 'heart');
      floatText(fx, fy - size * 0.42, `¡Equipo P${slot}! 💖`);
      A.kawaiiChirp('cheer');
    }
  }

  function selectHeroById(heroId, slot = 1) {
    const valid = ['cinna', 'milk', 'purin', 'mocha', 'chiffon'];
    const id = valid.includes(heroId) ? heroId : 'cinna';
    if (slot === 2 || slot === 3) {
      S.coPlayers[slot].active = true;
      S.coPlayers[slot].heroId = id;
    } else {
      S.p.heroId = id;
    }
  }

  function collect(it, collector = S.p) {
    it.got = true;
    S.score++; S.inLevel++;
    S.combo = S.comboT > 0 ? S.combo + 1 : 0; S.comboT = 1.2;
    const colors = it.type === 'heart' ? ['#ff8fbf', '#ffc2dc', '#fff'] : it.type === 'roll' ? ['#f2c27b', '#fff', '#ffe066'] : ['#ffe066', '#fff6b0', '#fff'];
    burst(it.x, it.y, it.type === 'star' ? 12 : 22, colors);
    floatText(it.x, it.y - it.r, '+1');
    it.type === 'star' ? A.collect(S.combo) : A.colorSplat();
    setMood('happy', 0.5, collector);
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
    window.Cinnamo?.passport?.addStars?.(2, 'flight');
    setMood('happy', 3); S.p.spinT = 0.8;
    for (const s of [2, 3]) {
      if (S.coPlayers[s].active) {
        setMood('happy', 3, S.coPlayers[s]);
        S.coPlayers[s].spinT = 0.8;
      }
    }
    const el = $('cheer');
    el.textContent = CHEERS[(Math.random() * CHEERS.length) | 0];
    el.classList.remove('hidden'); el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    setTimeout(() => el.classList.add('hidden'), 2400);
    setTimeout(() => updateHud(false), 600);
  }

  function stepFlyerAnim(flyer, dt) {
    flyer.blinkT -= dt;
    if (flyer.blinkT <= 0) { flyer.blink = 0.13; flyer.blinkT = rand(2, 5); }
    flyer.blink = Math.max(0, flyer.blink - dt);
    flyer.moodT -= dt; if (flyer.moodT <= 0) flyer.mood = 'idle';
    flyer.wiggle = Math.max(0, flyer.wiggle - dt);
    if (flyer.spinT > 0) { flyer.spinT -= dt; flyer.spin = (1 - Math.max(0, flyer.spinT) / 0.8) * Math.PI * 2; } else flyer.spin = 0;
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

    stepFlyerAnim(p, dt);
    for (const s of [2, 3]) {
      if (S.coPlayers[s].active) stepFlyerAnim(S.coPlayers[s], dt);
    }

    updateParticles(dt);
    if (S.mode !== 'play') return;

    // movimiento P1: resorte amortiguado → suave, directo y receptivo hacia arriba y hacia abajo
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

    // movimiento Cooperativo P2 y P3
    for (const s of [2, 3]) {
      const cp = S.coPlayers[s];
      if (!cp.active) continue;
      const keyAxis = (cp.keys.down ? 1 : 0) - (cp.keys.up ? 1 : 0);
      const cpAxis = cp.axis !== 0 ? cp.axis : keyAxis;
      const cpAcc = cpAxis !== 0 ? (cpAxis * 2.8 - cp.vy) * 14 : -cp.vy * 7;
      cp.vy += cpAcc * dt;
      cp.y += cp.vy * dt;
      if (cp.y < 0) { cp.y = 0; cp.vy = Math.abs(cp.vy) * 0.3; }
      if (cp.y > 1) { cp.y = 1; cp.vy = -Math.abs(cp.vy) * 0.3; }
    }

    spawn(dt);
    S.comboT -= dt;
    if (S.celebrateT > 0) S.celebrateT -= dt;

    // Lista de voladores activos (P1, P2, P3) con imán generoso
    const activeFlyers = [
      { ref: p, x: getFlyerX(1), y: playToY(p.y) + Math.sin(S.t * 3) * size * 0.05 }
    ];
    for (const s of [2, 3]) {
      const cp = S.coPlayers[s];
      if (cp.active) {
        activeFlyers.push({ ref: cp, x: getFlyerX(s), y: playToY(cp.y) + Math.sin(S.t * 3 + s) * size * 0.05 });
      }
    }

    const v = speed();
    for (const it of S.items) {
      if (it.got) continue;
      it.x -= v * dt;
      it.ph += dt * 3;
      for (const fl of activeFlyers) {
        const dx = fl.x - it.x, dy = fl.y - it.y, d = Math.hypot(dx, dy);
        if (d < size * 1.5 && dx > -size * 0.5) {
          const f = (1 - d / (size * 1.5)) * 900 * dt;
          it.x += dx / d * f;
          it.y += dy / d * f;
        }
        if (d < size * 0.55 + it.r) {
          collect(it, fl.ref);
          break;
        }
      }
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

  function drawPlayerBadge(x, y, slot) {
    const colors = { 1: '#ec4899', 2: '#0ea5e9', 3: '#eab308' };
    const labels = { 1: 'P1 🌸', 2: 'P2 🩵', 3: 'P3 💛' };
    ctx.save();
    ctx.font = '800 13px "Baloo 2", system-ui';
    const txt = labels[slot] || `P${slot}`;
    const tw = Math.max(44, ctx.measureText(txt).width + 18);
    const bx = x - tw / 2;
    const by = y - size * 0.68;
    ctx.fillStyle = colors[slot] || '#ec4899';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, tw, 22, 11);
    else ctx.rect(bx, by, tw, 22);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, x, by + 11);
    ctx.restore();
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

    // arcoíris suave de día
    if (th.sun > 0.01) {
      const rcx = W * 0.58, rcy = H * 1.02, rr = Math.max(W, H) * 0.62, band = Math.max(8, H * 0.018);
      const RAINBOW = ['#ff9ec4', '#ffc58f', '#fff09a', '#a8f0c0', '#9fd0ff', '#c9b5ff'];
      ctx.globalAlpha = th.sun * 0.32;
      ctx.lineWidth = band;
      RAINBOW.forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.beginPath(); ctx.arc(rcx, rcy, rr - i * band, Math.PI, Math.PI * 2); ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }

    // colinas lejanas con paralaje (dan profundidad al vuelo)
    const speed = S.mode === 'play' ? 1 : 0.35;
    hills(H * 0.8, H * 0.1, W * 0.55, S.t * 14 * speed, 'rgba(255,255,255,0.22)');
    hills(H * 0.86, H * 0.08, W * 0.38, S.t * 26 * speed, 'rgba(255,255,255,0.3)');

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

    // Cinnamoroll (P1) y compañeros cooperativos (P2, P3)
    const p = S.p;
    const inMenu = S.mode === 'menu';
    const hasCoop = S.coPlayers[2].active || S.coPlayers[3].active;
    const charState = {
      t: S.t,
      heroId: p.heroId || 'cinna',
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
      // Dibujar compañeros cooperativos P3 y P2 primero (ligeramente detrás de P1)
      for (const s of [3, 2]) {
        const cp = S.coPlayers[s];
        if (!cp.active) continue;
        const cpx = getFlyerX(s);
        const cpy = playToY(cp.y) + Math.sin(S.t * 3 + s) * size * 0.05;
        CH.draw(ctx, cpx, cpy, size * 0.88, {
          t: S.t + s * 0.4,
          heroId: cp.heroId || (s === 2 ? 'milk' : 'purin'),
          flapSpeed: cp.wiggle > 0 ? 22 : 8 + Math.min(6, Math.abs(cp.vy) * 8),
          flapAmp: cp.wiggle > 0 ? 0.55 : 0.38,
          mood: cp.mood, blink: cp.blink > 0,
          tilt: clamp(cp.vy * 0.35, -0.35, 0.35),
          spin: cp.spin, glow: true
        });
        drawPlayerBadge(cpx, cpy, s);
      }

      const p1y = playToY(p.y) + Math.sin(S.t * 3) * size * 0.05;
      CH.draw(ctx, px, p1y, size, charState);
      if (hasCoop) drawPlayerBadge(px, p1y, 1);
    }

    // partículas
    for (const q of S.parts) drawPart(q);
  }

  function hills(baseY, amp, wave, off, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) {
      const k = (x + off) / wave * Math.PI * 2;
      ctx.lineTo(x, baseY - amp * (0.6 + 0.4 * Math.sin(k)) - amp * 0.25 * Math.sin(k * 2.3));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
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
      settings.sound = !settings.sound; A.setSfxMuted(!settings.sound);
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
        setStatus(want ? ({ voice: 'Di: “arriba”, “abajo”, “gira”, “hola”', mic: 'Sopla o canta para subir', tilt: 'Inclinación activa (toca de nuevo para recalibrar)' }[k]) : '');
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
  A.setSfxMuted(!settings.sound);
  IN.adapters.tilt.invert = settings.invertTilt;
  const pending = ['voice', 'mic', 'tilt'].filter(k => settings[k]);
  pending.forEach(k => { settings[k] = false; });
  refreshChips();
  const inFlight = () => !window.Cinnamo?.hub || window.Cinnamo.hub.currentScreen === 'flight';
  if (pending.length) {
    // solo se re-activan con un toque dentro de ¡A Volar!, nunca desde el menú u otro juego
    const resume = e => {
      if (!inFlight()) return;
      window.removeEventListener('pointerdown', resume, true);
      if (e.target.closest && e.target.closest('.chip')) return; // el papá está tocando los controles a mano
      pending.forEach(k => toggle(k));
    };
    window.addEventListener('pointerdown', resume, true);
  }

  // Micrófono, voz e inclinación se apagan al salir del vuelo y vuelven al entrar
  window.Cinnamo.suspendFlightSensors = () => {
    ['voice', 'mic', 'tilt'].forEach(k => {
      const ad = IN.adapters[k];
      if (ad && ad.active) ad.stop();
    });
    IN.setAxis?.(0);
  };
  window.Cinnamo.resumeFlightSensors = () => {
    ['voice', 'mic', 'tilt'].forEach(k => {
      const ad = IN.adapters[k];
      if (settings[k] && ad && !ad.active) ad.start().catch(() => { settings[k] = false; refreshChips(); });
    });
  };

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

  S.setCoPlayerJoystick = setCoPlayerJoystick;
  S.setCoPlayerInput = setCoPlayerInput;
  S.selectHeroById = selectHeroById;

  window.Cinnamo.state = S; // útil para depurar desde la consola
  window.Cinnamo.game = S;
  window.Cinnamo.flightGame = {
    state: S,
    coPlayers: S.coPlayers,
    startGame,
    pause,
    moveUp: (pressed = true) => IN.setKey('up', pressed),
    moveDown: (pressed = true) => IN.setKey('down', pressed),
    spin: () => IN.emit('action', { type: 'spin', source: 'api' }),
    hello: () => IN.emit('action', { type: 'hello', source: 'api' }),
    setAxis: (val) => IN.setAxis(val),
    setCoPlayerJoystick,
    setCoPlayerInput,
    selectHeroById
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
