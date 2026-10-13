/* El Taller de Pintura de Cinnamoroll & Amigos
 * Colorear con un toque (tap-to-fill), paleta pastel Sanrio y sellitos mágicos de brillos.
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const PALETTE = [
    { name: 'Celeste Cinnamoroll', color: '#aee0ff' },
    { name: 'Rosa Pastel', color: '#ffb6d2' },
    { name: 'Amarillo Vainilla', color: '#fff099' },
    { name: 'Marrón Moka', color: '#c49a6c' },
    { name: 'Blanco Algodón', color: '#ffffff' },
    { name: 'Lila Lavanda', color: '#dfc2fe' },
    { name: 'Verde Menta', color: '#b8f3d6' },
    { name: 'Caramelo Purin', color: '#7a4b26' },
  ];

  // 4 Láminas oficiales: Cinnamoroll, Milk, Mocha, Pompompurin
  const TEMPLATES = [
    {
      id: 'cinnamoroll',
      label: 'Cinnamoroll',
      name: 'Cinnamoroll en las Nubes',
      svg: `
        <svg viewBox="0 0 600 500" class="coloring-svg">
          <!-- Fondo y nubes -->
          <rect id="bg" class="color-zone" x="10" y="10" width="580" height="480" rx="30" fill="#eaf4ff" />
          <path id="nube1" class="color-zone" d="M 80,450 C 60,400 120,360 170,390 C 220,350 300,360 330,410 C 370,380 440,390 460,450 Z" fill="#ffffff" />
          <path id="sol" class="color-zone" d="M 500,90 A 45,45 0 1,1 410,90 A 45,45 0 1,1 500,90" fill="#fff5b8" />
          <path id="estrella" class="color-zone" d="M 120,80 L 128,102 L 152,102 L 133,116 L 140,138 L 120,124 L 100,138 L 107,116 L 88,102 L 112,102 Z" fill="#ffe066" />

          <!-- Oreja Izquierda -->
          <path id="oreja-izq" class="color-zone" d="M 230,170 C 180,140 70,160 50,220 C 30,270 90,290 140,280 C 190,270 230,230 240,210 Z" fill="#ffffff" />
          
          <!-- Oreja Derecha -->
          <path id="oreja-der" class="color-zone" d="M 370,170 C 420,140 530,160 550,220 C 570,270 510,290 460,280 C 410,270 370,230 360,210 Z" fill="#ffffff" />

          <!-- Colita enrulada -->
          <path id="cola" class="color-zone" d="M 230,340 C 200,340 180,365 190,390 C 200,415 240,415 250,390 C 255,375 240,360 225,375" fill="#ffffff" />

          <!-- Cuerpo y patitas -->
          <path id="cuerpo" class="color-zone" d="M 240,260 C 220,320 220,380 270,390 C 300,395 330,395 350,380 C 380,360 380,310 360,260 Z" fill="#ffffff" />
          <ellipse id="pata-izq" class="color-zone" cx="265" cy="390" rx="18" ry="12" fill="#ffffff" />
          <ellipse id="pata-der" class="color-zone" cx="335" cy="390" rx="18" ry="12" fill="#ffffff" />

          <!-- Bracitos -->
          <ellipse id="brazo-izq" class="color-zone" cx="225" cy="275" rx="16" ry="24" transform="rotate(25 225 275)" fill="#ffffff" />
          <ellipse id="brazo-der" class="color-zone" cx="375" cy="275" rx="16" ry="24" transform="rotate(-25 375 275)" fill="#ffffff" />

          <!-- Cabeza -->
          <path id="cabeza" class="color-zone" d="M 300,120 C 380,120 420,160 420,205 C 420,255 370,275 300,275 C 230,275 180,255 180,205 C 180,160 220,120 300,120 Z" fill="#ffffff" />

          <!-- Cachetitos -->
          <ellipse id="mejilla-izq" class="color-zone" cx="225" cy="225" rx="18" ry="10" fill="#ffb6d2" />
          <ellipse id="mejilla-der" class="color-zone" cx="375" cy="225" rx="18" ry="10" fill="#ffb6d2" />

          <!-- Ojos celestes -->
          <ellipse id="ojo-izq" class="color-zone" cx="250" cy="195" rx="9" ry="14" fill="#2aa8e6" />
          <ellipse id="ojo-der" class="color-zone" cx="350" cy="195" rx="9" ry="14" fill="#2aa8e6" />

          <!-- Boca simpática -->
          <path id="boca" class="color-zone" d="M 285,215 Q 300,240 315,215 Z" fill="#ff9eb5" />
          <path d="M 285,215 Q 300,240 315,215 Z" fill="none" stroke="#5c3d2e" stroke-width="4" stroke-linecap="round" />

          <!-- Contornos oficiales (estilo chocolate Sanrio) -->
          <g fill="none" stroke="#5c3d2e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none">
            <path d="M 230,170 C 180,140 70,160 50,220 C 30,270 90,290 140,280 C 190,270 230,230 240,210 Z" />
            <path d="M 370,170 C 420,140 530,160 550,220 C 570,270 510,290 460,280 C 410,270 370,230 360,210 Z" />
            <path d="M 230,340 C 200,340 180,365 190,390 C 200,415 240,415 250,390 C 255,375 240,360 225,375" />
            <path d="M 240,260 C 220,320 220,380 270,390 C 300,395 330,395 350,380 C 380,360 380,310 360,260 Z" />
            <ellipse cx="265" cy="390" rx="18" ry="12" />
            <ellipse cx="335" cy="390" rx="18" ry="12" />
            <ellipse cx="225" cy="275" rx="16" ry="24" transform="rotate(25 225 275)" />
            <ellipse cx="375" cy="275" rx="16" ry="24" transform="rotate(-25 375 275)" />
            <path d="M 300,120 C 380,120 420,160 420,205 C 420,255 370,275 300,275 C 230,275 180,255 180,205 C 180,160 220,120 300,120 Z" />
            <path d="M 285,215 C 290,222 297,222 300,218 C 303,222 310,222 315,215" stroke-width="4" />
          </g>
        </svg>
      `
    },
    {
      id: 'milk',
      label: 'Milk 🍼',
      name: 'El Bebé Milk con su Chupete',
      svg: `
        <svg viewBox="0 0 600 500" class="coloring-svg">
          <rect id="bg" class="color-zone" x="10" y="10" width="580" height="480" rx="30" fill="#fff5fa" />
          <path id="corazon1" class="color-zone" d="M 120,90 C 100,50 50,70 70,110 C 90,140 120,160 120,160 C 120,160 150,140 170,110 C 190,70 140,50 120,90 Z" fill="#ffd1e3" />
          <path id="corazon2" class="color-zone" d="M 470,90 C 450,50 400,70 420,110 C 440,140 470,160 470,160 C 470,160 500,140 520,110 C 540,70 490,50 470,90 Z" fill="#ffd1e3" />

          <!-- Orejitas caídas de Milk -->
          <path id="oreja-izq" class="color-zone" d="M 210,180 C 150,160 100,210 110,280 C 120,330 170,330 190,280 C 205,240 215,200 210,180 Z" fill="#ffffff" />
          <path id="oreja-der" class="color-zone" d="M 390,180 C 450,160 500,210 490,280 C 480,330 430,330 410,280 C 395,240 385,200 390,180 Z" fill="#ffffff" />

          <!-- Biberón -->
          <rect id="botella" class="color-zone" x="160" y="320" width="40" height="70" rx="8" fill="#e0f3ff" />
          <path id="tetina" class="color-zone" d="M 170,320 L 175,300 L 185,300 L 190,320 Z" fill="#ffe082" />

          <!-- Cuerpo bebé -->
          <ellipse id="cuerpo" class="color-zone" cx="300" cy="340" rx="70" ry="60" fill="#ffffff" />
          <ellipse id="pañal" class="color-zone" cx="300" cy="365" rx="60" ry="30" fill="#e8f4ff" />

          <!-- Patitas -->
          <circle id="pata-izq" class="color-zone" cx="260" cy="395" r="16" fill="#ffffff" />
          <circle id="pata-der" class="color-zone" cx="340" cy="395" r="16" fill="#ffffff" />

          <!-- Cabeza de Milk -->
          <circle id="cabeza" class="color-zone" cx="300" cy="210" r="95" fill="#ffffff" />

          <!-- Rizo característico en la frente -->
          <path id="rizo" class="color-zone" d="M 300,125 C 290,115 305,95 320,105 C 330,115 315,130 305,125 Z" fill="#ffffff" />

          <!-- Ojos grandes y tiernos -->
          <ellipse id="ojo-izq" class="color-zone" cx="255" cy="205" rx="10" ry="15" fill="#2aa8e6" />
          <ellipse id="ojo-der" class="color-zone" cx="345" cy="205" rx="10" ry="15" fill="#2aa8e6" />

          <!-- Cachetes -->
          <ellipse id="mejilla-izq" class="color-zone" cx="230" cy="235" rx="16" ry="10" fill="#ffb6d2" />
          <ellipse id="mejilla-der" class="color-zone" cx="370" cy="235" rx="16" ry="10" fill="#ffb6d2" />

          <!-- Chupete azul de Milk -->
          <circle id="chupete-base" class="color-zone" cx="300" cy="245" r="22" fill="#81d4fa" />
          <circle id="chupete-anillo" class="color-zone" cx="300" cy="256" r="12" fill="#ffffff" />

          <g fill="none" stroke="#5c3d2e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none">
            <path d="M 210,180 C 150,160 100,210 110,280 C 120,330 170,330 190,280 C 205,240 215,200 210,180 Z" />
            <path d="M 390,180 C 450,160 500,210 490,280 C 480,330 430,330 410,280 C 395,240 385,200 390,180 Z" />
            <circle cx="300" cy="210" r="95" />
            <path d="M 300,125 C 290,115 305,95 320,105 C 330,115 315,130 305,125 Z" />
            <circle cx="300" cy="245" r="22" />
            <circle cx="300" cy="256" r="12" stroke-width="4" />
            <ellipse cx="300" cy="340" rx="70" ry="60" />
            <circle cx="260" cy="395" r="16" />
            <circle cx="340" cy="395" r="16" />
          </g>
        </svg>
      `
    },
    {
      id: 'mocha',
      label: 'Mocha 🌸',
      name: 'Mocha con su Flor',
      svg: `
        <svg viewBox="0 0 600 500" class="coloring-svg">
          <rect id="bg" class="color-zone" x="10" y="10" width="580" height="480" rx="30" fill="#fff9f0" />
          <circle id="burbuja1" class="color-zone" cx="100" cy="120" r="40" fill="#ffe3ed" />
          <circle id="burbuja2" class="color-zone" cx="500" cy="130" r="35" fill="#ffe3ed" />

          <!-- Orejas onduladas color café -->
          <path id="oreja-izq" class="color-zone" d="M 210,160 C 130,140 80,210 90,290 C 100,350 160,350 180,300 C 195,260 215,190 210,160 Z" fill="#c49a6c" />
          <path id="oreja-der" class="color-zone" d="M 390,160 C 470,140 520,210 510,290 C 500,350 440,350 420,300 C 405,260 385,190 390,160 Z" fill="#c49a6c" />

          <!-- Flor icónica en la oreja -->
          <g id="flor">
            <circle id="petalo1" class="color-zone" cx="390" cy="120" r="16" fill="#ff80ab" />
            <circle id="petalo2" class="color-zone" cx="420" cy="120" r="16" fill="#ff80ab" />
            <circle id="petalo3" class="color-zone" cx="430" cy="145" r="16" fill="#ff80ab" />
            <circle id="petalo4" class="color-zone" cx="410" cy="170" r="16" fill="#ff80ab" />
            <circle id="petalo5" class="color-zone" cx="380" cy="155" r="16" fill="#ff80ab" />
            <circle id="centro-flor" class="color-zone" cx="405" cy="142" r="12" fill="#fff59d" />
          </g>

          <!-- Cuerpo café -->
          <ellipse id="cuerpo" class="color-zone" cx="300" cy="340" rx="65" ry="55" fill="#c49a6c" />

          <!-- Moño coqueto en el cuello -->
          <path id="moño-izq" class="color-zone" d="M 300,285 L 265,270 L 265,300 Z" fill="#ff4081" />
          <path id="moño-der" class="color-zone" d="M 300,285 L 335,270 L 335,300 Z" fill="#ff4081" />
          <circle id="moño-centro" class="color-zone" cx="300" cy="285" r="8" fill="#ffd54f" />

          <!-- Patitas -->
          <ellipse id="pata-izq" class="color-zone" cx="265" cy="390" rx="16" ry="12" fill="#c49a6c" />
          <ellipse id="pata-der" class="color-zone" cx="335" cy="390" rx="16" ry="12" fill="#c49a6c" />

          <!-- Cabeza café moka -->
          <ellipse id="cabeza" class="color-zone" cx="300" cy="210" rx="95" ry="75" fill="#c49a6c" />

          <!-- Ojos -->
          <ellipse id="ojo-izq" class="color-zone" cx="255" cy="205" rx="8" ry="13" fill="#3e2723" />
          <ellipse id="ojo-der" class="color-zone" cx="345" cy="205" rx="8" ry="13" fill="#3e2723" />

          <!-- Cachetes -->
          <ellipse id="mejilla-izq" class="color-zone" cx="230" cy="235" rx="16" ry="10" fill="#ff80ab" />
          <ellipse id="mejilla-der" class="color-zone" cx="370" cy="235" rx="16" ry="10" fill="#ff80ab" />

          <!-- Boquita en 'w' -->
          <path id="boca" d="M 290,225 C 295,232 298,232 300,228 C 302,232 305,232 310,225" stroke="#3e2723" stroke-width="4" fill="none" stroke-linecap="round" />

          <g fill="none" stroke="#3e2723" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none">
            <path d="M 210,160 C 130,140 80,210 90,290 C 100,350 160,350 180,300 C 195,260 215,190 210,160 Z" />
            <path d="M 390,160 C 470,140 520,210 510,290 C 500,350 440,350 420,300 C 405,260 385,190 390,160 Z" />
            <ellipse cx="300" cy="210" rx="95" ry="75" />
            <ellipse cx="300" cy="340" rx="65" ry="55" />
          </g>
        </svg>
      `
    },
    {
      id: 'pompompurin',
      label: 'Pompompurin 🍮',
      name: 'Pompompurin y su Pudín',
      svg: `
        <svg viewBox="0 0 600 500" class="coloring-svg">
          <rect id="bg" class="color-zone" x="10" y="10" width="580" height="480" rx="30" fill="#fffde7" />

          <!-- Plato y Flan de Purin -->
          <ellipse id="plato" class="color-zone" cx="470" cy="390" rx="60" ry="20" fill="#ffffff" />
          <path id="flan-base" class="color-zone" d="M 435,385 L 445,335 L 495,335 L 505,385 Z" fill="#fff9c4" />
          <ellipse id="caramelo" class="color-zone" cx="470" cy="335" rx="26" ry="10" fill="#6d4c41" />
          <circle id="cereza" class="color-zone" cx="470" cy="318" r="9" fill="#e91e63" />

          <!-- Orejitas caídas -->
          <ellipse id="oreja-izq" class="color-zone" cx="180" cy="220" rx="24" ry="48" transform="rotate(-15 180 220)" fill="#fff59d" />
          <ellipse id="oreja-der" class="color-zone" cx="370" cy="220" rx="24" ry="48" transform="rotate(15 370 220)" fill="#fff59d" />

          <!-- Cuerpo regordete y panza -->
          <ellipse id="cuerpo" class="color-zone" cx="275" cy="340" rx="100" ry="85" fill="#fff59d" />

          <!-- Patitas -->
          <circle id="pata-izq" class="color-zone" cx="215" cy="415" r="22" fill="#fff59d" />
          <circle id="pata-der" class="color-zone" cx="335" cy="415" r="22" fill="#fff59d" />

          <!-- Cabeza grande redonda -->
          <circle id="cabeza" class="color-zone" cx="275" cy="210" r="90" fill="#fff59d" />

          <!-- Boina marrón clásica de Purin -->
          <ellipse id="boina" class="color-zone" cx="275" cy="120" rx="42" ry="18" fill="#5d4037" />
          <circle id="boina-tope" class="color-zone" cx="275" cy="102" r="7" fill="#5d4037" />

          <!-- Cara -->
          <circle id="ojo-izq" class="color-zone" cx="235" cy="195" r="8" fill="#4e342e" />
          <circle id="ojo-der" class="color-zone" cx="315" cy="195" r="8" fill="#4e342e" />
          <ellipse id="mejilla-izq" class="color-zone" cx="210" cy="220" rx="15" ry="10" fill="#ffab91" />
          <ellipse id="mejilla-der" class="color-zone" cx="340" cy="220" rx="15" ry="10" fill="#ffab91" />
          <circle id="nariz" class="color-zone" cx="275" cy="205" r="7" fill="#4e342e" />

          <!-- Boquita en estrella / trípode -->
          <path id="boca" d="M 275,212 L 275,224 M 275,224 C 270,230 263,228 260,224 M 275,224 C 280,230 287,228 290,224" stroke="#4e342e" stroke-width="4" stroke-linecap="round" fill="none" />

          <g fill="none" stroke="#5d4037" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none">
            <ellipse cx="180" cy="220" rx="24" ry="48" transform="rotate(-15 180 220)" />
            <ellipse cx="370" cy="220" rx="24" ry="48" transform="rotate(15 370 220)" />
            <circle cx="275" cy="210" r="90" />
            <ellipse cx="275" cy="120" rx="42" ry="18" />
            <circle cx="275" cy="102" r="7" />
            <ellipse cx="275" cy="340" rx="100" ry="85" />
            <circle cx="215" cy="415" r="22" />
            <circle cx="335" cy="415" r="22" />
            <ellipse cx="470" cy="390" rx="60" ry="20" stroke-width="4" />
          </g>
        </svg>
      `
    }
  ];

  class ColoringGame {
    constructor() {
      this.currentTemplateIdx = 0;
      this.selectedColor = PALETTE[0].color;
      this.sparkleMode = false;
      this.container = null;
    }

    init(containerEl) {
      this.container = containerEl;
      this.render();
    }

    render() {
      const tmpl = TEMPLATES[this.currentTemplateIdx];
      this.container.innerHTML = `
        <div class="coloring-wrap">
          <!-- Selector superior de personajes -->
          <div class="char-tabs">
            ${TEMPLATES.map((t, idx) => `
              <button class="char-tab ${idx === this.currentTemplateIdx ? 'active' : ''}" data-idx="${idx}">
                ${t.label || t.name.split(' ')[0]}
              </button>
            `).join('')}
          </div>

          <!-- Lienzo principal SVG -->
          <div class="canvas-box" id="svgHolder">
            ${tmpl.svg}
            <div id="sparkleLayer" class="sparkle-layer"></div>
          </div>

          <!-- Paleta pastel y herramientas -->
          <div class="palette-bar">
            <div class="color-swatches">
              ${PALETTE.map(p => `
                <button class="swatch ${p.color === this.selectedColor && !this.sparkleMode ? 'active' : ''}" 
                        style="background: ${p.color}" 
                        data-color="${p.color}" 
                        title="${p.name}"></button>
              `).join('')}
            </div>

            <div class="tools-bar">
              <button id="btnSparkle" class="tool-btn ${this.sparkleMode ? 'active' : ''}">✨ Purpurina</button>
              <button id="btnReset" class="tool-btn">🧹 Limpiar</button>
              <button id="btnSave" class="tool-btn">💾 Guardar</button>
            </div>
          </div>
        </div>
      `;

      this.bindEvents();
    }

    bindEvents() {
      // Cambio de personaje
      this.container.querySelectorAll('.char-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          this.currentTemplateIdx = parseInt(e.currentTarget.dataset.idx, 10);
          this.render();
        });
      });

      // Selección de color
      this.container.querySelectorAll('.swatch').forEach(sw => {
        sw.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(2);
          this.sparkleMode = false;
          this.selectedColor = e.currentTarget.dataset.color;
          this.container.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
          this.container.querySelector('#btnSparkle').classList.remove('active');
          e.currentTarget.classList.add('active');
        });
      });

      // Modo Purpurina
      const sparkleBtn = this.container.querySelector('#btnSparkle');
      sparkleBtn.addEventListener('click', () => {
        A.unlock();
        this.sparkleMode = !this.sparkleMode;
        sparkleBtn.classList.toggle('active', this.sparkleMode);
        if (this.sparkleMode) {
          this.container.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
          A.colorSplat();
        }
      });

      // Limpiar
      this.container.querySelector('#btnReset').addEventListener('click', () => {
        A.unlock();
        A.softBoing();
        this.render();
      });

      // Guardar imagen (descarga PNG o abre)
      this.container.querySelector('#btnSave').addEventListener('click', () => {
        A.unlock();
        A.celebrate();
        this.exportImage();
      });

      // Pintar zonas o estampar brillos
      const svgHolder = this.container.querySelector('#svgHolder');
      svgHolder.addEventListener('pointerdown', (e) => {
        A.unlock();
        const rect = svgHolder.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.sparkleMode) {
          this.addSparkle(x, y);
          A.colorSplat();
          return;
        }

        const zone = e.target.closest('.color-zone');
        if (zone) {
          zone.setAttribute('fill', this.selectedColor);
          A.colorSplat();
          this.addMiniBurst(x, y, this.selectedColor);
        }
      });
    }

    addMiniBurst(x, y, color) {
      const layer = this.container.querySelector('#sparkleLayer');
      for (let i = 0; i < 6; i++) {
        const star = document.createElement('span');
        star.className = 'mini-star';
        star.textContent = '★';
        star.style.left = x + 'px';
        star.style.top = y + 'px';
        star.style.color = color === '#ffffff' ? '#ffe066' : color;
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 40;
        star.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        star.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        layer.appendChild(star);
        setTimeout(() => star.remove(), 700);
      }
    }

    addSparkle(x, y) {
      const layer = this.container.querySelector('#sparkleLayer');
      const star = document.createElement('div');
      star.className = 'stamped-sparkle';
      star.textContent = ['✨', '💖', '⭐', '🌸'][Math.floor(Math.random() * 4)];
      star.style.left = (x - 16) + 'px';
      star.style.top = (y - 16) + 'px';
      layer.appendChild(star);
    }

    exportImage() {
      const svg = this.container.querySelector('svg');
      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + svg64;
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = 1200;
        c.height = 1000;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const a = document.createElement('a');
        a.download = `cinnamoroll-amigos-${TEMPLATES[this.currentTemplateIdx].id}.png`;
        a.href = c.toDataURL('image/png');
        a.click();
      };
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.coloringGame = new ColoringGame();
})();
