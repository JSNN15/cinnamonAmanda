/* ============================================================
   ÍCONOS VECTORIALES PROPIOS (icons.js)
   Un solo set de íconos SVG con trazo redondeado y relleno pastel,
   para no depender de emojis (que cambian según el teléfono o tablet).
   Uso:
     - En HTML: <i class="ci" data-icon="home"></i> (se hidrata solo).
     - En JS:   CinnaIcons.svg('home')  -> string SVG
                CinnaIcons.set(el, 'music') -> reemplaza el ícono del elemento
   Colores: el trazo usa currentColor y el relleno var(--ic-fill).
   ============================================================ */
(function () {
  // Cada ícono es el interior de un <svg viewBox="0 0 24 24">.
  // f = relleno suave (var(--ic-fill)), s = solo trazo.
  const P = {
    home: '<path class="f" d="M4 11.2 12 4.5l8 6.7V19a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19z"/><path d="M9.6 20.6v-5a2.4 2.4 0 0 1 4.8 0v5"/>',
    medal: '<path d="M8 3.5 10.4 9M16 3.5 13.6 9"/><circle class="f" cx="12" cy="14.6" r="5.6"/><path class="dot" d="m12 11.6 1 2 2.1.3-1.5 1.5.4 2.1-2-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3z"/>',
    expand: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>',
    compress: '<path d="M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4M20 9h-3.5A1.5 1.5 0 0 1 15 7.5V4M15 20v-3.5a1.5 1.5 0 0 1 1.5-1.5H20M4 15h3.5A1.5 1.5 0 0 1 9 16.5V20"/>',
    gamepad: '<path class="f" d="M7.2 7h9.6a4.4 4.4 0 0 1 4.3 3.5l.8 4.4a2.6 2.6 0 0 1-4.5 2.2L15.6 15H8.4l-1.8 2.1a2.6 2.6 0 0 1-4.5-2.2l.8-4.4A4.4 4.4 0 0 1 7.2 7z"/><path d="M7.5 9.6v3M6 11.1h3"/><circle class="dot" cx="15.6" cy="10.2" r="1"/><circle class="dot" cx="17.6" cy="12.2" r="1"/>',
    music: '<path d="M9 17.5V6.2l10-2.2v11.3"/><ellipse class="f" cx="6.8" cy="17.6" rx="2.6" ry="2.1"/><ellipse class="f" cx="16.8" cy="15.4" rx="2.6" ry="2.1"/><path d="M9 9.2 19 7"/>',
    'music-off': '<path d="M9 17.5V6.2l10-2.2v11.3"/><ellipse class="f" cx="6.8" cy="17.6" rx="2.6" ry="2.1"/><ellipse class="f" cx="16.8" cy="15.4" rx="2.6" ry="2.1"/><path class="cut" d="M3.5 3.5l17 17"/>',
    touch: '<path class="f" d="M9.5 11V5.2a1.7 1.7 0 0 1 3.4 0v5.2l3.9.7a2.2 2.2 0 0 1 1.8 2.5l-.7 4.2a3 3 0 0 1-3 2.5h-3.6a3 3 0 0 1-2.4-1.2L6 15.4a1.6 1.6 0 0 1 2.4-2.1z"/>',
    phone: '<rect class="f" x="6.5" y="2.8" width="11" height="18.4" rx="2.6"/><path d="M10.5 18h3"/>',
    play: '<path class="f" d="M8 5.6v12.8a1 1 0 0 0 1.5.9l10-6.4a1 1 0 0 0 0-1.7l-10-6.4A1 1 0 0 0 8 5.6z"/>',
    hanger: '<path d="M12 8.6V7.4a2.2 2.2 0 1 0-2.2-2.2"/><path class="f" d="M12 8.6 3.4 15a1.6 1.6 0 0 0 1 2.9h15.2a1.6 1.6 0 0 0 1-2.9z"/>',
    toybox: '<path class="f" d="M3.6 10.4h16.8v8.2a1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8z"/><path class="f" d="M2.8 7.6h18.4v2.8H2.8z"/><path d="M12 7.6v12.8M12 7.6c-1.5-3.6-5.6-3.4-4.8-1 .4 1 2.6 1 4.8 1zm0 0c1.5-3.6 5.6-3.4 4.8-1-.4 1-2.6 1-4.8 1z"/>',
    sun: '<circle class="f" cx="12" cy="12" r="4.4"/><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/>',
    moon: '<path class="f" d="M19.6 14.6A8 8 0 1 1 9.4 4.4a6.4 6.4 0 0 0 10.2 10.2z"/>',
    sunset: '<path class="f" d="M6.4 16a5.6 5.6 0 0 1 11.2 0z"/><path d="M3 16h18M7 19.5h10M12 4.5v3M5.6 7.6l1.6 1.6M18.4 7.6l-1.6 1.6"/>',
    friends: '<circle class="f" cx="9" cy="8.6" r="3.4"/><path class="f" d="M2.8 19.4a6.2 6.2 0 0 1 12.4 0z"/><circle cx="16.6" cy="8.2" r="2.8"/><path d="M17.4 13.6a5.4 5.4 0 0 1 3.8 5.2"/>',
    'arrow-left': '<path d="M14.6 5.4 8 12l6.6 6.6"/>',
    'arrow-right': '<path d="M9.4 5.4 16 12l-6.6 6.6"/>',
    up: '<path d="M5.4 14.6 12 8l6.6 6.6"/>',
    down: '<path d="M5.4 9.4 12 16l6.6-6.6"/>',
    check: '<path d="m5 12.6 4.4 4.4L19 7.4"/>',
    close: '<path d="m6.5 6.5 11 11M17.5 6.5l-11 11"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    heart: '<path class="f" d="M12 20s-7.6-4.6-7.6-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.6 2.6C19.6 15.4 12 20 12 20z"/>',
    star: '<path class="f" d="m12 3.4 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.8l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>',
    sparkle: '<path class="f" d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/><path d="M19 16.5v4M17 18.5h4"/>',
    wing: '<path class="f" d="M3.6 16.4c4.2.6 9-1 12.4-4.6 2-2.1 3.4-4.8 4.4-7.8-5.6 1-11.2 3.4-14.6 8.4z"/><path d="M8 15.2c2.6-1.6 5-3.6 6.8-6M6.4 12.6c2-1 3.8-2.4 5.2-4.2"/>',
    cupcake: '<path class="f" d="M5.6 12.4h12.8l-1.8 7.2a1.4 1.4 0 0 1-1.4 1H8.8a1.4 1.4 0 0 1-1.4-1z"/><path class="f" d="M5 12.4a3.2 3.2 0 0 1 1.4-5.8A5.6 5.6 0 0 1 17 6.2a3.2 3.2 0 0 1 2 6.2z"/><path d="M10 15v3.8M14 15v3.8"/><circle class="dot" cx="12" cy="3.6" r="1.2"/>',
    brush: '<path class="f" d="M14.4 4.6 19.4 9.6 11 18a3.5 3.5 0 0 1-5 0 3.5 3.5 0 0 1 0-5z"/><path d="M7.6 16.4c-1 1.4-2.4 2.4-4.2 2.8.4-1.8 1.4-3.2 2.8-4.2"/><path d="M13 6l5 5"/>',
    cards: '<rect class="f" x="3.4" y="5.6" width="10" height="14" rx="2" transform="rotate(-8 8.4 12.6)"/><rect class="f" x="10.4" y="4.2" width="10" height="14" rx="2" transform="rotate(8 15.4 11.2)"/><path class="dot" d="M15.6 9.2a1.4 1.4 0 0 1 2.4 1c0 1.6-2.6 3-2.6 3s-2.4-1.6-2.2-3.2a1.4 1.4 0 0 1 2.4-.8z"/>',
    flag: '<path d="M5.6 21V3.6"/><path class="f" d="M5.6 4.4c3.6-1.6 6.4 1.8 10 .4l3-1.2v9.2l-3 1.2c-3.6 1.4-6.4-2-10-.4z"/>',
    gift: '<rect class="f" x="4" y="10" width="16" height="10.4" rx="1.8"/><rect class="f" x="3" y="7" width="18" height="3.6" rx="1.2"/><path d="M12 7v13.4M12 7c-1.4-3.4-5.4-3.4-4.6-1 .4 1 2.4 1 4.6 1zm0 0c1.4-3.4 5.4-3.4 4.6-1-.4 1-2.4 1-4.6 1z"/>',
    pencil: '<path class="f" d="M15.6 4.4a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L9 19l-4.6 1 1-4.6z"/><path d="M14 6l4 4"/>',
    puzzle: '<path class="f" d="M5 6.6h3.4a2.2 2.2 0 1 1 4.2 0H16v3.4a2.2 2.2 0 1 1 0 4.2V19h-3.6a2.2 2.2 0 1 0-4.2 0H5v-4a2.2 2.2 0 1 0 0-4.2z"/>',
    house: '<path class="f" d="M3.6 11 12 4l8.4 7v8.2a1.4 1.4 0 0 1-1.4 1.4H5a1.4 1.4 0 0 1-1.4-1.4z"/><path class="f" d="M10 20.6V15h4v5.6"/><path class="dot" d="M12 9.4a1.2 1.2 0 0 1 2 .8c0 1.2-2 2.2-2 2.2s-2-1-2-2.2a1.2 1.2 0 0 1 2-.8z"/>',
    flower: '<circle class="f" cx="12" cy="6.6" r="3"/><circle class="f" cx="17.2" cy="10.4" r="3"/><circle class="f" cx="15.2" cy="16.4" r="3"/><circle class="f" cx="8.8" cy="16.4" r="3"/><circle class="f" cx="6.8" cy="10.4" r="3"/><circle class="dot" cx="12" cy="12" r="2.2"/>',
    cup: '<path class="f" d="M4.6 9h11.2v5.4a5 5 0 0 1-5 5h-1.2a5 5 0 0 1-5-5z"/><path d="M15.8 10.4h1.4a2.4 2.4 0 0 1 0 4.8h-1.8M8 3.6c-.8 1 .8 1.6 0 2.8M11.6 3.6c-.8 1 .8 1.6 0 2.8"/>',
    voice: '<rect class="f" x="9" y="3.2" width="6" height="11" rx="3"/><path d="M5.8 11.4a6.2 6.2 0 0 0 12.4 0M12 17.6v3"/>',
    refresh: '<path d="M19.4 12a7.4 7.4 0 1 1-2.2-5.2"/><path d="M19.6 4.4v4.2h-4.2"/>',
    pause: '<rect class="f" x="6.4" y="5" width="4" height="14" rx="1.6"/><rect class="f" x="13.6" y="5" width="4" height="14" rx="1.6"/>',
    hand: '<path class="f" d="M7.4 12.2V6.6a1.5 1.5 0 0 1 3 0v4.6V4.8a1.5 1.5 0 0 1 3 0v6.4V6.2a1.5 1.5 0 0 1 3 0v7.6l1.4-2a1.5 1.5 0 0 1 2.4 1.8l-3.4 5a5.2 5.2 0 0 1-4.3 2.3h-.8A4.3 4.3 0 0 1 7.4 16.6z"/>'
  };

  // Colores de relleno por defecto para cada ícono (tono pastel de su tema)
  const FILL = {
    home: '#ffd7e8', medal: '#ffe08a', gamepad: '#d6e8ff', music: '#ffd0e6', 'music-off': '#e2e8f0',
    touch: '#ffe4cf', phone: '#dbeafe', play: '#ffffff', hanger: '#ffd0e6', toybox: '#ffe7a8',
    sun: '#ffe066', moon: '#fff1a8', sunset: '#ffb38a', friends: '#cdeaff', heart: '#ff9ec4',
    star: '#ffe066', sparkle: '#fff3a8', wing: '#ffffff', cupcake: '#ffc2dc', brush: '#ffe08a',
    cards: '#e3d6ff', flag: '#a7f3c4', gift: '#ffc59e', pencil: '#ffd0e6', puzzle: '#bfe6ff',
    house: '#ffd0e6', flower: '#ffc2dc', cup: '#ffe7d1', voice: '#e3d6ff', pause: '#ffffff', hand: '#ffe4cf'
  };

  function svg(name, opts = {}) {
    const inner = P[name] || P.sparkle;
    const fill = opts.fill || FILL[name] || '#ffffff';
    const size = opts.size ? ` width="${opts.size}" height="${opts.size}"` : '';
    const cls = opts.className ? ` ${opts.className}` : '';
    return `<svg class="ci-svg${cls}" viewBox="0 0 24 24"${size} aria-hidden="true" focusable="false" style="--ic-fill:${fill}">${inner}</svg>`;
  }

  function set(el, name, opts) {
    if (!el) return;
    el.dataset.icon = name;
    el.innerHTML = svg(name, opts);
  }

  function hydrate(root = document) {
    root.querySelectorAll('[data-icon]:not([data-icon-done])').forEach(el => {
      el.setAttribute('data-icon-done', '');
      el.innerHTML = svg(el.dataset.icon, { fill: el.dataset.fill });
    });
  }

  // Estilos base: tamaño 1em, trazo redondeado y grosor uniforme
  const css = document.createElement('style');
  css.textContent = `
    .ci, .ci-svg { display: inline-flex; width: 1em; height: 1em; line-height: 0; flex-shrink: 0; }
    .ci-svg { overflow: visible; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .ci-svg .f { fill: var(--ic-fill, #fff); }
    .ci-svg .dot { fill: currentColor; stroke: none; }
    .ci-svg .cut { stroke-width: 2.4; }
  `;
  (document.head || document.documentElement).appendChild(css);

  window.CinnaIcons = { svg, set, hydrate, names: Object.keys(P) };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => hydrate());
  } else {
    hydrate();
  }
})();
