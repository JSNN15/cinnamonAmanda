/* ============================================================
   ESCENAS ILUSTRADAS DEL MENÚ (hub-art.js)
   Cada tarjeta de juego recibe un fondo SVG dibujado a mano con el tema
   del juego (arcoíris, pastelería, colinas...), en vez de emojis sueltos.
   Se pinta detrás del personaje dentro de .card-illustration[data-scene].
   ============================================================ */
(function () {
  const O = '#5c3d2e'; // contorno cálido, el mismo de los juegos

  const cloud = (x, y, s = 1, op = 0.95) => `
    <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}" fill="#fff">
      <ellipse cx="0" cy="0" rx="34" ry="14"/><circle cx="-12" cy="-8" r="13"/><circle cx="8" cy="-12" r="17"/><circle cx="24" cy="-4" r="11"/>
    </g>`;
  const star = (x, y, r = 6, c = '#fff6b0', op = 1) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      pts.push(`${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="${c}" opacity="${op}" class="hs-twinkle"/>`;
  };
  const sparkle = (x, y, r = 7, c = '#fff', op = 0.9) =>
    `<path d="M${x} ${y - r}c${r * 0.15} ${r * 0.7} ${r * 0.3} ${r * 0.85} ${r} ${r}c-${r * 0.7} ${r * 0.15}-${r * 0.85} ${r * 0.3}-${r} ${r}c-${r * 0.15}-${r * 0.7}-${r * 0.3}-${r * 0.85}-${r}-${r}c${r * 0.7}-${r * 0.15} ${r * 0.85}-${r * 0.3} ${r}-${r}z" fill="${c}" opacity="${op}" class="hs-twinkle"/>`;

  const SCENES = {
    // Casa de sueños: casita con jardín
    avatar: () => `
      <circle cx="262" cy="30" r="16" fill="#fff3a8"/>
      ${cloud(60, 36, 0.9)}${cloud(210, 58, 0.6, 0.8)}
      <path d="M0 118 Q80 100 160 112 T320 106 V160 H0z" fill="#c9f2d4"/>
      <g transform="translate(222 64)">
        <rect x="0" y="22" width="62" height="48" rx="6" fill="#fff" stroke="${O}" stroke-width="2.2"/>
        <path d="M-8 26 31 -6 70 26z" fill="#ff9ec4" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="24" y="44" width="14" height="26" rx="6" fill="#ffd27a" stroke="${O}" stroke-width="2"/>
        <rect x="6" y="32" width="13" height="12" rx="3" fill="#bfe6ff" stroke="${O}" stroke-width="1.8"/>
        <rect x="43" y="32" width="13" height="12" rx="3" fill="#bfe6ff" stroke="${O}" stroke-width="1.8"/>
      </g>
      <g stroke="#fff" stroke-width="4" stroke-linecap="round">${[14, 34, 54, 74].map(x => `<path d="M${x} 118v-18"/>`).join('')}<path d="M8 106h72"/></g>
      ${star(120, 24, 5)}${sparkle(176, 30, 6)}`,

    // ¡A volar!: arcoíris y nubes
    flight: () => `
      <g fill="none" stroke-width="9" opacity="0.75">
        <path d="M30 150 A130 120 0 0 1 290 150" stroke="#ffb3c7"/>
        <path d="M42 150 A118 108 0 0 1 278 150" stroke="#ffe08a"/>
        <path d="M54 150 A106 96 0 0 1 266 150" stroke="#b5f0c6"/>
        <path d="M66 150 A94 84 0 0 1 254 150" stroke="#b9dcff"/>
        <path d="M78 150 A82 72 0 0 1 242 150" stroke="#d9c7ff"/>
      </g>
      ${cloud(40, 120, 1.2)}${cloud(280, 124, 1.1)}${cloud(250, 34, 0.6, 0.85)}
      ${star(36, 28, 7)}${star(90, 50, 4)}${star(214, 18, 5)}${sparkle(286, 70, 6)}`,

    // Pastelería: toldo festoneado y estante con cupcakes
    math: () => `
      <g>${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 36} 0h36v16a18 12 0 0 1-36 0z" fill="${i % 2 ? '#fff' : '#ff9ec4'}"/>`).join('')}</g>
      <rect x="0" y="112" width="320" height="8" rx="4" fill="#f3b7d0"/>
      ${[30, 270].map(x => `
        <g transform="translate(${x} 112)">
          <path d="M-14 0 -10 -18h20L14 0z" fill="#ffd27a" stroke="${O}" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M-15 -18a8 8 0 0 1 4-12 11 11 0 0 1 22 0 8 8 0 0 1 4 12z" fill="#fff" stroke="${O}" stroke-width="1.8"/>
          <circle cx="0" cy="-34" r="3.4" fill="#ff5f8f"/>
        </g>`).join('')}
      ${sparkle(70, 40, 6)}${sparkle(252, 46, 5)}${star(214, 70, 4, '#fff')}`,

    // Taller de dibujo: manchas de pintura y trazos de crayón
    coloring: () => `
      <path d="M20 40c10-18 40-14 44 2s-10 30-26 28-26-12-18-30z" fill="#ff9ec4" opacity="0.85"/>
      <path d="M262 22c18-6 40 6 36 24s-26 20-38 12-14-30 2-36z" fill="#9fd3ff" opacity="0.85"/>
      <path d="M248 104c14-10 38-4 40 10s-18 24-32 18-20-18-8-28z" fill="#b5f0c6" opacity="0.9"/>
      <path d="M24 112c12-8 30-2 30 10s-16 18-26 12-14-16-4-22z" fill="#d9c7ff" opacity="0.9"/>
      <path d="M70 128c30-14 60 6 90-6s50 4 80-4" fill="none" stroke="#ff7aa8" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
      <path d="M86 20c24 8 46-6 70 2" fill="none" stroke="#ffc94d" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
      ${sparkle(222, 70, 6)}${star(60, 76, 4)}`,

    // Memorice: cartas en abanico detrás
    memory: () => `
      ${[[38, 34, -16, '#ffc2dc'], [282, 30, 14, '#bfe6ff'], [262, 98, -10, '#fff3a8'], [46, 104, 12, '#c9f2d4']].map(([x, y, r, c]) => `
        <g transform="translate(${x} ${y}) rotate(${r})">
          <rect x="-20" y="-27" width="40" height="54" rx="8" fill="#fff" stroke="${O}" stroke-width="2"/>
          <rect x="-15" y="-22" width="30" height="44" rx="5" fill="${c}"/>
          <path d="M0 -4a5 5 0 0 1 8 3c0 5-8 9-8 9s-8-4-8-9a5 5 0 0 1 8-3z" fill="#fff"/>
        </g>`).join('')}
      ${sparkle(110, 26, 6)}${star(206, 22, 5)}`,

    // Super Run: colinas, plataforma y galletas
    platformer: () => `
      ${cloud(60, 30, 0.8)}${cloud(250, 40, 0.7, 0.85)}
      <path d="M-10 120 Q60 70 130 116 T270 110 T340 100 V160 H-10z" fill="#9fe2b5"/>
      <path d="M-10 132 Q90 104 180 128 T340 124 V160 H-10z" fill="#7bd49a"/>
      <rect x="236" y="70" width="64" height="12" rx="6" fill="#ff9ec4" stroke="${O}" stroke-width="2"/>
      ${[[252, 56], [270, 52], [288, 56], [40, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#ffc94d" stroke="${O}" stroke-width="1.6"/>`).join('')}
      ${star(150, 20, 5)}`,

    // Repartidor 3D: piso en perspectiva y torres de castillo
    doom: () => `
      <g opacity="0.55" stroke="#fff" stroke-width="2">
        ${Array.from({ length: 9 }, (_, i) => `<path d="M160 70 L${-80 + i * 60} 160"/>`).join('')}
        ${[86, 104, 128, 158].map(y => `<path d="M0 ${y}H320"/>`).join('')}
      </g>
      ${[[26, 60], [294, 56]].map(([x, h]) => `
        <g transform="translate(${x} 70)">
          <rect x="-16" y="-${h - 30}" width="32" height="${h}" fill="#ffe7d1" stroke="${O}" stroke-width="2"/>
          <path d="M-20 -${h - 30} 0 -${h} 20 -${h - 30}z" fill="#ff9ec4" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
          <rect x="-5" y="-${h - 42}" width="10" height="13" rx="5" fill="#9fd3ff" stroke="${O}" stroke-width="1.6"/>
        </g>`).join('')}
      ${sparkle(96, 24, 6)}${star(228, 20, 5)}`,

    // Palabras mágicas: bloques de letras flotando
    writing: () => `
      ${[['A', 34, 40, -10, '#ffc2dc'], ['Ñ', 284, 34, 12, '#bfe6ff'], ['M', 270, 106, -8, '#fff3a8'], ['O', 44, 108, 9, '#c9f2d4']].map(([l, x, y, r, c]) => `
        <g transform="translate(${x} ${y}) rotate(${r})" class="hs-bob">
          <rect x="-19" y="-19" width="38" height="38" rx="8" fill="${c}" stroke="${O}" stroke-width="2"/>
          <text x="0" y="8" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="24" fill="${O}">${l}</text>
        </g>`).join('')}
      ${sparkle(110, 22, 6)}${star(214, 24, 4)}`,

    // Puzzles: piezas grandes de fondo
    puzzle: () => {
      const piece = (x, y, s, c, r) => `<path transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="M-20 -20h12a8 8 0 1 1 16 0h12v12a8 8 0 1 1 0 16v12H8a8 8 0 1 0-16 0h-12V8a8 8 0 1 0 0-16z" fill="${c}" stroke="${O}" stroke-width="2"/>`;
      return `${piece(40, 40, 1, '#ffc2dc', -12)}${piece(284, 36, 0.9, '#fff3a8', 10)}${piece(276, 112, 1.05, '#c9f2d4', -6)}${piece(44, 112, 0.85, '#d9c7ff', 14)}${sparkle(118, 24, 6)}${star(206, 22, 4)}`;
    }
  };

  function paint(root = document) {
    root.querySelectorAll('.card-illustration[data-scene]').forEach(box => {
      if (box.querySelector('.hub-scene')) return;
      const fn = SCENES[box.dataset.scene];
      if (!fn) return;
      box.insertAdjacentHTML('afterbegin',
        `<svg class="hub-scene" viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${fn()}</svg>`);
    });
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.hubArt = { paint };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => paint());
  else paint();
})();
