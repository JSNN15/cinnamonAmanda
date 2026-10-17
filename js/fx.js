/* Efectos visuales compartidos de Cinnamoroll Land (v29)
 * Capa de confeti y destellos sobre toda la suite. Se engancha a los sonidos de
 * celebración de audio.js, así cada juego festeja igual sin tocar su lógica:
 *   - A.celebrate()    → lluvia de confeti pastel desde arriba
 *   - A.sparkleChime() → estallido de estrellitas donde la niña tocó
 * También expone window.Cinnamo.fx.{confetti, sparkle} por si un juego quiere llamarlo directo.
 */
(function () {
  const Cinnamo = (window.Cinnamo = window.Cinnamo || {});
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORS = ['#ff8fbf', '#ffc2dc', '#8ec2ff', '#bcd7ff', '#ffe066', '#c4b5fd', '#86efac', '#ffffff'];
  const SHAPES = ['rect', 'circle', 'star', 'heart'];

  let canvas = null, ctx = null, W = 0, H = 0, DPR = 1, raf = 0, last = 0;
  const parts = [];
  let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.className = 'cinna-fx-layer';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[(Math.random() * arr.length) | 0];

  function star(c, r) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath();
  }

  function heart(c, r) {
    c.beginPath();
    c.moveTo(0, r * 0.35);
    c.bezierCurveTo(-r * 1.1, -r * 0.4, -r * 0.5, -r * 1.1, 0, -r * 0.45);
    c.bezierCurveTo(r * 0.5, -r * 1.1, r * 1.1, -r * 0.4, 0, r * 0.35);
    c.closePath();
  }

  function loop(t) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.t += dt;
      if (p.t >= p.life || p.y > H + 40) { parts.splice(i, 1); continue; }
      p.vy += p.g * dt;
      p.vx *= p.drag; p.vy *= p.drag;
      p.x += (p.vx + Math.sin(p.t * p.wob) * p.sway) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const fade = Math.min(1, (p.life - p.t) / 0.4);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      if (p.shape === 'rect') {
        // confeti de papel que "gira" aplastando su ancho
        ctx.scale(Math.cos(p.t * p.wob * 1.5), 1);
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      } else if (p.shape === 'circle') {
        ctx.beginPath(); ctx.arc(0, 0, p.s / 2.6, 0, Math.PI * 2); ctx.fill();
      } else if (p.shape === 'star') {
        star(ctx, p.s / 1.8); ctx.fill();
      } else {
        heart(ctx, p.s / 1.6); ctx.fill();
      }
      ctx.restore();
    }
    if (parts.length) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = 0;
      ctx.clearRect(0, 0, W, H);
    }
  }

  function kick() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
  }

  function confetti(opts = {}) {
    ensureCanvas();
    const n = Math.round((opts.count || 120) * (reduced ? 0.25 : 1));
    for (let i = 0; i < n; i++) {
      parts.push({
        x: rand(0, W), y: rand(-H * 0.25, -10),
        vx: rand(-40, 40), vy: rand(60, 220), g: 260, drag: 0.995,
        s: rand(9, 16), c: pick(COLORS), shape: pick(SHAPES),
        rot: rand(0, 6.28), vr: rand(-5, 5), wob: rand(2, 5), sway: rand(10, 40),
        t: 0, life: rand(2.4, 3.6),
      });
    }
    kick();
  }

  function sparkle(x, y, opts = {}) {
    ensureCanvas();
    if (x == null) { x = lastPointer.x; y = lastPointer.y; }
    const n = Math.round((opts.count || 18) * (reduced ? 0.4 : 1));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand(-0.2, 0.2), sp = rand(140, 320);
      parts.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 180, drag: 0.94,
        s: rand(8, 15), c: pick(COLORS.slice(0, 7)), shape: i % 3 ? 'star' : 'heart',
        rot: rand(0, 6.28), vr: rand(-4, 4), wob: 0, sway: 0,
        t: 0, life: rand(0.7, 1.1),
      });
    }
    kick();
  }

  window.addEventListener('pointerdown', e => { lastPointer = { x: e.clientX, y: e.clientY }; }, { passive: true, capture: true });

  // Engancharse a los sonidos de festejo: cada juego ya los llama al acertar o ganar
  function hookAudio() {
    const A = Cinnamo.audio;
    if (!A || A._fxHooked) return;
    A._fxHooked = true;
    const origCelebrate = A.celebrate.bind(A);
    let lastConfetti = 0;
    A.celebrate = function () {
      origCelebrate();
      const now = performance.now();
      // evita que dos festejos seguidos (p.ej. juego + sticker) acumulen demasiado confeti
      if (now - lastConfetti > 900) { lastConfetti = now; confetti(); }
    };
    const origSparkle = A.sparkleChime.bind(A);
    A.sparkleChime = function () {
      origSparkle();
      sparkle();
    };
  }

  hookAudio();
  Cinnamo.fx = { confetti, sparkle };
})();
