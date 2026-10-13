/* Cinnamoroll: renderizado fiel al personaje original oficial de Sanrio.
 * Utiliza el spritesheet auténtico derivado de las ilustraciones oficiales
 * con animación fluida de aleteo de orejas, parpadeo tierno y expresiones.
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

  // Paleta oficial para fallback vectorial
  const OUT = '#5b3e31';       // contorno marrón chocolate cálido Sanrio
  const WHITE = '#ffffff';
  const EYE = '#2aa8e6';        // celeste cian vivo
  const CHEEK = 'rgba(255, 170, 195, 0.85)';
  const TONGUE = '#ff9eb5';

  function drawVectorFallback(ctx, x, y, size, st) {
    const k = size / 100;
    ctx.save();
    ctx.translate(x, y);
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
    ctx.fillStyle = WHITE; ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(-34, 42, 7, 0.5, Math.PI * 1.8);
    ctx.stroke();

    // orejas
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * -26, -18);
      ctx.rotate(s * (-0.15 + flap));
      ctx.beginPath();
      ctx.ellipse(s * -48, 6, 52, 18, s * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = WHITE; ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // cuerpo y patitas
    ctx.beginPath();
    ctx.ellipse(0, 36, 32, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = WHITE; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-14, 62, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(14, 62, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // bracitos
    const armUp = st.mood === 'happy' ? -10 : 0;
    ctx.beginPath(); ctx.ellipse(-26, 28 + armUp, 8, 12, 0.45, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(26, 28 + armUp, 8, 12, -0.45, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // cabeza suave
    ctx.beginPath();
    ctx.ellipse(0, 0, 56, 38, 0, 0, Math.PI * 2);
    ctx.fillStyle = WHITE; ctx.fill(); ctx.stroke();

    // cachetes rosados
    ctx.fillStyle = CHEEK;
    ctx.beginPath(); ctx.ellipse(-34, 12, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(34, 12, 12, 7, 0, 0, Math.PI * 2); ctx.fill();

    // ojos celestes
    if (st.blink) {
      ctx.beginPath();
      ctx.arc(-22, 2, 6, Math.PI * 0.15, Math.PI * 0.85);
      ctx.arc(22, 2, 6, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    } else {
      ctx.fillStyle = EYE;
      ctx.beginPath(); ctx.ellipse(-22, 2, 5.5, 8.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(22, 2, 5.5, 8.5, 0, 0, Math.PI * 2); ctx.fill();
    }

    // boca
    if (st.mood === 'happy' || st.mood === 'wow') {
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
   * @param st { t, flapSpeed, flapAmp, mood:'idle'|'happy'|'wow', blink:boolean, tilt, spin, glow }
   */
  function draw(ctx, x, y, size, st) {
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
