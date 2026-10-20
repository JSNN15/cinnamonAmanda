/* Cinnamoroll & Amigos: renderizado fiel al personaje original oficial de Sanrio.
 * Utiliza el spritesheet auténtico derivado de las ilustraciones oficiales para Cinnamoroll
 * y renderizado vectorial kawaii articulado para los compañeros de vuelo cooperativo (Milk, Purin, Mocha, Chiffon).
 */
(function () {
  const FRAME_W = 607;
  const FRAME_H = 393;
  const CENTER_X = 297;
  const CENTER_Y = 210;

  // Cargar spritesheet auténtico bajo demanda (no bloquea el arranque)
  let img = null;
  let imgLoaded = false;
  function ensureSprite() {
    if (img) return;
    img = new Image();
    img.src = 'cinnamoroll_sheet.png';
    img.onload = () => { imgLoaded = true; };
  }

  // Carga diferida en segundo plano tras renderizar el menú
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(ensureSprite, 1000);
    });
  }

  // Paleta oficial para fallback vectorial y amigos Sanrio cooperativos (P1, P2, P3)
  const OUT = '#5b3e31';       // contorno marrón chocolate cálido Sanrio
  const WHITE = '#ffffff';
  const EYE = '#2aa8e6';        // celeste cian vivo
  const CHEEK = 'rgba(255, 170, 195, 0.85)';
  const TONGUE = '#ff9eb5';

  const HERO_PALETTES = {
    cinna:   { body: '#ffffff', ear: '#ffffff', eye: '#2aa8e6', cheek: 'rgba(255, 170, 195, 0.85)', glow: 'rgba(255, 255, 255, 0.7)' },
    milk:    { body: '#fffdf7', ear: '#fffdf7', eye: '#0284c7', cheek: 'rgba(255, 179, 198, 0.88)', glow: 'rgba(186, 230, 253, 0.75)', pacifier: true, curl: true },
    purin:   { body: '#fef08a', ear: '#fde047', eye: '#5b3e31', cheek: 'rgba(252, 165, 165, 0.85)', glow: 'rgba(254, 240, 138, 0.75)', beret: true },
    mocha:   { body: '#d6a77a', ear: '#b88658', eye: '#4a2c11', cheek: 'rgba(255, 141, 161, 0.85)', glow: 'rgba(251, 207, 232, 0.75)', flowers: true },
    chiffon: { body: '#fdebd0', ear: '#e59866', eye: '#5b3e31', cheek: 'rgba(255, 133, 162, 0.85)', glow: 'rgba(254, 215, 170, 0.75)', fluffy: true }
  };

  function drawVectorFallback(ctx, x, y, size, st) {
    const heroId = (st && st.heroId) || 'cinna';
    const pal = HERO_PALETTES[heroId] || HERO_PALETTES.cinna;
    const k = size / 100;
    ctx.save();
    ctx.translate(x, y);
    if (st && st.glow) {
      const g = ctx.createRadialGradient(0, 0, size * 0.15, 0, 0, size * 0.9);
      g.addColorStop(0, pal.glow);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2); ctx.fill();
    }
    ctx.rotate((st.tilt || 0) + (st.spin || 0));
    ctx.scale(k, k);
    ctx.lineWidth = 3.8;
    ctx.strokeStyle = OUT;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const flap = Math.sin(st.t * (st.flapSpeed || 8)) * (st.flapAmp ?? 0.35);

    // cola
    ctx.beginPath();
    ctx.arc(-34, 42, 14, 0, Math.PI * 2);
    ctx.fillStyle = pal.body; ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(-34, 42, 7, 0.5, Math.PI * 1.8);
    ctx.stroke();

    // orejas
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * -26, -18);
      ctx.rotate(s * (-0.15 + flap));
      ctx.beginPath();
      ctx.ellipse(s * -48, 6, pal.fluffy ? 44 : 52, pal.fluffy ? 22 : 18, s * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = pal.ear; ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // cuerpo y patitas
    ctx.beginPath();
    ctx.ellipse(0, 36, 32, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.body; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-14, 62, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(14, 62, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // bracitos
    const armUp = st.mood === 'happy' ? -10 : 0;
    ctx.beginPath();
    ctx.ellipse(-26, 28 + armUp, 8, 12, 0.45, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(26, 28 + armUp, 8, 12, -0.45, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // cabeza suave
    ctx.beginPath();
    ctx.ellipse(0, 0, 56, 38, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.body; ctx.fill(); ctx.stroke();

    // Accesorios distintivos de cada amigo Sanrio
    if (pal.curl) {
      ctx.beginPath(); ctx.arc(0, -38, 9, 0, Math.PI * 1.8);
      ctx.fillStyle = pal.body; ctx.fill(); ctx.stroke();
    }
    if (pal.beret) {
      ctx.beginPath(); ctx.ellipse(0, -36, 28, 10, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#8b5a3c'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(3, -53); ctx.stroke();
    }
    if (pal.flowers) {
      for (const sx of [-32, 32]) {
        ctx.fillStyle = '#f472b6';
        ctx.beginPath(); ctx.arc(sx, -26, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(sx, -26, 3.5, 0, Math.PI * 2); ctx.fill();
      }
    }

    // cachetes rosados
    ctx.fillStyle = pal.cheek;
    ctx.beginPath(); ctx.ellipse(-34, 12, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(34, 12, 12, 7, 0, 0, Math.PI * 2); ctx.fill();

    // ojos
    if (st.blink) {
      ctx.beginPath();
      ctx.arc(-22, 2, 6, Math.PI * 0.15, Math.PI * 0.85);
      ctx.arc(22, 2, 6, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    } else {
      ctx.fillStyle = pal.eye;
      ctx.beginPath(); ctx.ellipse(-22, 2, 5.5, 8.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(22, 2, 5.5, 8.5, 0, 0, Math.PI * 2); ctx.fill();
    }

    // boca o chupete (Milk)
    if (pal.pacifier) {
      ctx.beginPath(); ctx.arc(0, 14, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 14, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; ctx.fill();
    } else if (st.mood === 'happy' || st.mood === 'wow') {
      ctx.beginPath();
      ctx.moveTo(-6, 8);
      ctx.lineTo(6, 8);
      ctx.quadraticCurveTo(0, 24, -6, 8);
      ctx.fillStyle = WHITE; ctx.fill();
      ctx.stroke();
      ctx.save(); ctx.clip();
      ctx.fillStyle = TONGUE;
      ctx.beginPath(); ctx.arc(0, 22, 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(-4, 11, 4, 0, Math.PI);
      ctx.arc(4, 11, 4, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * @param st { t, flapSpeed, flapAmp, mood:'idle'|'happy'|'wow', blink:boolean, tilt, spin, glow, heroId }
   */
  function draw(ctx, x, y, size, st) {
    if (st && st.heroId && st.heroId !== 'cinna') {
      drawVectorFallback(ctx, x, y, size, st);
      return;
    }
    if (!img) ensureSprite();
    if (!imgLoaded) {
      drawVectorFallback(ctx, x, y, size, st);
      return;
    }

    const targetW = size * 1.85;
    const targetH = targetW * (FRAME_H / FRAME_W);

    ctx.save();
    ctx.translate(x, y);

    // Halo suave
    if (st.glow) {
      const g = ctx.createRadialGradient(0, 0, targetW * 0.1, 0, 0, targetW * 0.6);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      g.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, targetW * 0.6, 0, Math.PI * 2); ctx.fill();
    }

    ctx.rotate((st.tilt || 0) + (st.spin || 0));

    // Selección de frame según animación
    // 0: fly_mid, 1: fly_up, 2: fly_down, 3: fly_blink, 4: idle_mid, 5: idle_blink
    const isIdle = (st.mood === 'idle' && (!st.flapSpeed || st.flapSpeed < 10));
    let frameIdx = 0;

    if (st.blink) {
      frameIdx = isIdle ? 5 : 3;
    } else if (isIdle) {
      frameIdx = 4;
    } else {
      // Ciclo de aleteo suave con función seno
      const spd = st.flapSpeed || 8;
      const flapPhase = Math.sin(st.t * spd);
      if (flapPhase > 0.38) {
        frameIdx = 1; // alas arriba
      } else if (flapPhase < -0.38) {
        frameIdx = 2; // alas abajo
      } else {
        frameIdx = 0; // alas centro
      }
    }

    const srcX = frameIdx * FRAME_W;
    const drawX = -targetW * (CENTER_X / FRAME_W);
    const drawY = -targetH * (CENTER_Y / FRAME_H);

    ctx.drawImage(
      img,
      srcX, 0, FRAME_W, FRAME_H,
      drawX, drawY, targetW, targetH
    );

    ctx.restore();
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.character = { draw };
})();
