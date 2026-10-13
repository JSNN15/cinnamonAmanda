/* El Taller de Pintura & Dibujo de Cinnamoroll y Amigos
 * Permite tanto rellenar zonas con toque mágico como rayar/colorear libremente con crayones
 * sobre láminas claras en blanco y negro oficiales de Cinnamoroll, Milk, Mocha, Pompompurin y Chiffon.
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const PALETTE = [
    { name: 'Celeste Cinnamoroll', color: '#9fd3ff' },
    { name: 'Rosa Pastel', color: '#ffb3d1' },
    { name: 'Amarillo Vainilla', color: '#ffe680' },
    { name: 'Marrón Moka', color: '#a67c52' },
    { name: 'Lila Lavanda', color: '#d8b4fe' },
    { name: 'Verde Menta', color: '#a7f3d0' },
    { name: 'Caramelo Purin', color: '#f59e0b' },
    { name: 'Blanco Nube', color: '#ffffff' },
    { name: 'Chocolate Sanrio', color: '#5c3d2e' },
  ];

  const STAMPS = ['⭐', '💖', '🌸', '🍥', '🧁'];

  // 5 Láminas nítidas en blanco y negro con trazo grueso y claro
  const TEMPLATES = [
    {
      id: 'cinnamoroll',
      label: 'Cinnamoroll 🪽',
      title: 'Cinnamoroll en las Nubes',
      svg: `
        <svg viewBox="0 0 600 500" class="bw-art-svg" id="bwSvgArt">
          <!-- Fondo de nubes -->
          <rect class="paint-zone" x="0" y="0" width="600" height="500" fill="#ffffff" />
          <path class="paint-zone" d="M 60,440 C 40,390 110,350 160,380 C 220,330 310,340 340,400 C 390,360 480,380 500,440 Z" fill="#ffffff" stroke="#222" stroke-width="6" stroke-linejoin="round" />
          <path class="paint-zone" d="M 490,90 A 45,45 0 1,1 400,90 A 45,45 0 1,1 490,90" fill="#ffffff" stroke="#222" stroke-width="6" />
          <path class="paint-zone" d="M 120,80 L 130,105 L 155,105 L 135,120 L 142,145 L 120,130 L 98,145 L 105,120 L 85,105 L 110,105 Z" fill="#ffffff" stroke="#222" stroke-width="5" />

          <!-- Oreja Izquierda Cinnamoroll -->
          <path class="paint-zone" d="M 230,170 C 170,130 50,150 40,225 C 30,285 100,300 155,290 C 205,275 235,230 240,205 Z" fill="#ffffff" stroke="#222" stroke-width="7" stroke-linejoin="round" />

          <!-- Oreja Derecha Cinnamoroll -->
          <path class="paint-zone" d="M 370,170 C 430,130 550,150 560,225 C 570,285 500,300 445,290 C 395,275 365,230 360,205 Z" fill="#ffffff" stroke="#222" stroke-width="7" stroke-linejoin="round" />

          <!-- Colita enrollada -->
          <path class="paint-zone" d="M 230,350 C 190,350 170,380 185,410 C 200,435 245,430 255,400 C 260,380 240,365 225,380" fill="#ffffff" stroke="#222" stroke-width="6" stroke-linecap="round" />

          <!-- Cuerpo -->
          <path class="paint-zone" d="M 240,265 C 220,330 225,395 270,405 C 305,410 335,410 355,395 C 390,370 385,315 360,265 Z" fill="#ffffff" stroke="#222" stroke-width="7" />
          <!-- Patitas -->
          <ellipse class="paint-zone" cx="265" cy="405" rx="20" ry="14" fill="#ffffff" stroke="#222" stroke-width="6" />
          <ellipse class="paint-zone" cx="335" cy="405" rx="20" ry="14" fill="#ffffff" stroke="#222" stroke-width="6" />

          <!-- Brazos -->
          <ellipse class="paint-zone" cx="220" cy="285" rx="18" ry="26" transform="rotate(25 220 285)" fill="#ffffff" stroke="#222" stroke-width="6" />
          <ellipse class="paint-zone" cx="380" cy="285" rx="18" ry="26" transform="rotate(-25 380 285)" fill="#ffffff" stroke="#222" stroke-width="6" />

          <!-- Cabeza grande -->
          <path class="paint-zone" d="M 300,115 C 390,115 435,160 435,210 C 435,265 380,285 300,285 C 220,285 165,265 165,210 C 165,160 210,115 300,115 Z" fill="#ffffff" stroke="#222" stroke-width="7" />

          <!-- Mejillas -->
          <ellipse class="paint-zone" cx="225" cy="225" rx="20" ry="12" fill="#ffffff" stroke="#222" stroke-width="5" />
          <ellipse class="paint-zone" cx="375" cy="225" rx="20" ry="12" fill="#ffffff" stroke="#222" stroke-width="5" />

          <!-- Ojos grandes de Cinnamoroll -->
          <ellipse class="paint-zone" cx="250" cy="190" rx="11" ry="16" fill="#ffffff" stroke="#222" stroke-width="6" />
          <ellipse class="paint-zone" cx="350" cy="190" rx="11" ry="16" fill="#ffffff" stroke="#222" stroke-width="6" />

          <!-- Boca en W tierna -->
          <path class="paint-zone" d="M 285,215 Q 300,238 315,215" fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" />
        </svg>
      `
    },
    {
      id: 'milk',
      label: 'Milk 🍼',
      title: 'El Pequeño Bebé Milk',
      svg: `
        <svg viewBox="0 0 600 500" class="bw-art-svg" id="bwSvgArt">
          <rect class="paint-zone" x="0" y="0" width="600" height="500" fill="#ffffff" />
          <!-- Corazones de fondo -->
          <path class="paint-zone" d="M 110,90 C 90,50 40,70 60,110 C 80,140 110,160 110,160 C 110,160 140,140 160,110 C 180,70 130,50 110,90 Z" fill="#ffffff" stroke="#222" stroke-width="5" />
          <path class="paint-zone" d="M 480,90 C 460,50 410,70 430,110 C 450,140 480,160 480,160 C 480,160 510,140 530,110 C 550,70 500,50 480,90 Z" fill="#ffffff" stroke="#222" stroke-width="5" />

          <!-- Biberón -->
          <rect class="paint-zone" x="140" y="310" width="50" height="85" rx="10" fill="#ffffff" stroke="#222" stroke-width="6" />
          <path class="paint-zone" d="M 152,310 L 158,285 L 172,285 L 178,310 Z" fill="#ffffff" stroke="#222" stroke-width="5" />

          <!-- Orejas caídas de Milk -->
          <path class="paint-zone" d="M 215,190 C 150,165 95,215 105,295 C 115,355 175,355 195,295 C 210,250 220,210 215,190 Z" fill="#ffffff" stroke="#222" stroke-width="7" stroke-linejoin="round" />
          <path class="paint-zone" d="M 385,190 C 450,165 505,215 495,295 C 485,355 425,355 405,295 C 390,250 380,210 385,190 Z" fill="#ffffff" stroke="#222" stroke-width="7" stroke-linejoin="round" />

          <!-- Cuerpo bebé -->
          <ellipse class="paint-zone" cx="300" cy="355" rx="75" ry="60" fill="#ffffff" stroke="#222" stroke-width="7" />
          <ellipse class="paint-zone" cx="260" cy="405" rx="20" ry="14" fill="#ffffff" stroke="#222" stroke-width="6" />
          <ellipse class="paint-zone" cx="340" cy="405" rx="20" ry="14" fill="#ffffff" stroke="#222" stroke-width="6" />

          <!-- Cabeza de Milk -->
          <ellipse class="paint-zone" cx="300" cy="205" rx="110" ry="85" fill="#ffffff" stroke="#222" stroke-width="7" />

          <!-- Rulito de pelo en la cabeza -->
          <path class="paint-zone" d="M 300,120 C 285,105 305,85 320,100 C 330,110 315,125 300,120 Z" fill="#ffffff" stroke="#222" stroke-width="6" />

          <!-- Ojos de Milk -->
          <ellipse class="paint-zone" cx="255" cy="190" rx="12" ry="18" fill="#ffffff" stroke="#222" stroke-width="6" />
          <ellipse class="paint-zone" cx="345" cy="190" rx="12" ry="18" fill="#ffffff" stroke="#222" stroke-width="6" />

          <!-- Mejillas -->
          <ellipse class="paint-zone" cx="225" cy="225" rx="18" ry="12" fill="#ffffff" stroke="#222" stroke-width="5" />
          <ellipse class="paint-zone" cx="375" cy="225" rx="18" ry="12" fill="#ffffff" stroke="#222" stroke-width="5" />

          <!-- Chupete de Milk -->
          <ellipse class="paint-zone" cx="300" cy="235" rx="26" ry="19" fill="#ffffff" stroke="#222" stroke-width="6" />
          <circle class="paint-zone" cx="300" cy="250" r="12" fill="#ffffff" stroke="#222" stroke-width="5" />
        </svg>
      `
    },
    {
      id: 'mocha',
      label: 'Mocha 🎀',
      title: 'Mocha con sus Lazos Rosados',
      svg: `
        <svg viewBox="0 0 600 500" class="bw-art-svg" id="bwSvgArt">
          <rect class="paint-zone" x="0" y="0" width="600" height="500" fill="#ffffff" />
          <!-- Estrellas y flores -->
          <circle class="paint-zone" cx="100" cy="110" r="24" fill="#ffffff" stroke="#222" stroke-width="5" />
          <circle class="paint-zone" cx="500" cy="110" r="24" fill="#ffffff" stroke="#222" stroke-width="5" />

          <!-- Orejas largas de Mocha -->
          <path class="paint-zone" d="M 230,170 C 160,130 50,160 40,240 C 30,310 100,320 160,300 C 210,280 235,230 240,205 Z" fill="#ffffff" stroke="#222" stroke-width="7" />
          <path class="paint-zone" d="M 370,170 C 440,130 550,160 560,240 C 570,310 500,320 440,300 C 390,280 365,230 360,205 Z" fill="#ffffff" stroke="#222" stroke-width="7" />

          <!-- Lazos de flores en las orejas -->
          <g class="paint-zone">
            <circle cx="160" cy="180" r="14" fill="#ffffff" stroke="#222" stroke-width="5" />
            <path d="M 135,170 C 130,150 160,150 160,170 Z" fill="#ffffff" stroke="#222" stroke-width="5" />
            <path d="M 185,170 C 190,150 160,150 160,170 Z" fill="#ffffff" stroke="#222" stroke-width="5" />
          </g>
          <g class="paint-zone">
            <circle cx="440" cy="180" r="14" fill="#ffffff" stroke="#222" stroke-width="5" />
            <path d="M 415,170 C 410,150 440,150 440,170 Z" fill="#ffffff" stroke="#222" stroke-width="5" />
            <path d="M 465,170 C 470,150 440,150 440,170 Z" fill="#ffffff" stroke="#222" stroke-width="5" />
          </g>

          <!-- Cuerpo -->
          <path class="paint-zone" d="M 240,265 C 220,330 225,395 270,405 C 305,410 335,410 355,395 C 390,370 385,315 360,265 Z" fill="#ffffff" stroke="#222" stroke-width="7" />
          <ellipse class="paint-zone" cx="265" cy="405" rx="20" ry="14" fill="#ffffff" stroke="#222" stroke-width="6" />
          <ellipse class="paint-zone" cx="335" cy="405" rx="20" ry="14" fill="#ffffff" stroke="#222" stroke-width="6" />

          <!-- Cabeza de Mocha -->
          <path class="paint-zone" d="M 300,115 C 390,115 435,160 435,210 C 435,265 380,285 300,285 C 220,285 165,265 165,210 C 165,160 210,115 300,115 Z" fill="#ffffff" stroke="#222" stroke-width="7" />

          <!-- Ojos coquetos y pestañas de Mocha -->
          <ellipse class="paint-zone" cx="250" cy="190" rx="11" ry="16" fill="#ffffff" stroke="#222" stroke-width="6" />
          <path d="M 240,175 L 232,168" stroke="#222" stroke-width="5" stroke-linecap="round" />
          <ellipse class="paint-zone" cx="350" cy="190" rx="11" ry="16" fill="#ffffff" stroke="#222" stroke-width="6" />
          <path d="M 360,175 L 368,168" stroke="#222" stroke-width="5" stroke-linecap="round" />

          <!-- Mejillas sonrosadas -->
          <ellipse class="paint-zone" cx="225" cy="225" rx="20" ry="12" fill="#ffffff" stroke="#222" stroke-width="5" />
          <ellipse class="paint-zone" cx="375" cy="225" rx="20" ry="12" fill="#ffffff" stroke="#222" stroke-width="5" />

          <path class="paint-zone" d="M 285,215 Q 300,238 315,215" fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" />
        </svg>
      `
    },
    {
      id: 'pompompurin',
      label: 'Pompompurin 🍮',
      title: 'Pompompurin con su Boina Marrón',
      svg: `
        <svg viewBox="0 0 600 500" class="bw-art-svg" id="bwSvgArt">
          <rect class="paint-zone" x="0" y="0" width="600" height="500" fill="#ffffff" />
          <!-- Huesito y pudín -->
          <path class="paint-zone" d="M 80,120 C 65,100 95,90 110,110 L 150,110 C 165,90 195,100 180,120 C 195,140 165,150 150,130 L 110,130 C 95,150 65,140 80,120 Z" fill="#ffffff" stroke="#222" stroke-width="5" />

          <!-- Boina marrón de Purin -->
          <path class="paint-zone" d="M 240,110 C 240,75 360,75 360,110 Z" fill="#ffffff" stroke="#222" stroke-width="7" />
          <ellipse class="paint-zone" cx="300" cy="72" rx="10" ry="8" fill="#ffffff" stroke="#222" stroke-width="5" />

          <!-- Orejas caídas de Purin -->
          <ellipse class="paint-zone" cx="190" cy="210" rx="28" ry="55" transform="rotate(25 190 210)" fill="#ffffff" stroke="#222" stroke-width="7" />
          <ellipse class="paint-zone" cx="410" cy="210" rx="28" ry="55" transform="rotate(-25 410 210)" fill="#ffffff" stroke="#222" stroke-width="7" />

          <!-- Gran cuerpo redondito y tierno -->
          <ellipse class="paint-zone" cx="300" cy="300" rx="145" ry="135" fill="#ffffff" stroke="#222" stroke-width="8" />

          <!-- Patitas cortas -->
          <ellipse class="paint-zone" cx="240" cy="425" rx="30" ry="20" fill="#ffffff" stroke="#222" stroke-width="6" />
          <ellipse class="paint-zone" cx="360" cy="425" rx="30" ry="20" fill="#ffffff" stroke="#222" stroke-width="6" />

          <!-- Manitas -->
          <ellipse class="paint-zone" cx="170" cy="310" rx="24" ry="18" fill="#ffffff" stroke="#222" stroke-width="6" />
          <ellipse class="paint-zone" cx="430" cy="310" rx="24" ry="18" fill="#ffffff" stroke="#222" stroke-width="6" />

          <!-- Ojos redondos pequeños -->
          <circle class="paint-zone" cx="265" cy="220" r="9" fill="#ffffff" stroke="#222" stroke-width="5" />
          <circle class="paint-zone" cx="335" cy="220" r="9" fill="#ffffff" stroke="#222" stroke-width="5" />

          <!-- Nariz de perrito y boquita -->
          <ellipse class="paint-zone" cx="300" cy="235" rx="9" ry="6" fill="#ffffff" stroke="#222" stroke-width="5" />
          <path class="paint-zone" d="M 285,248 C 295,258 300,250 300,248 C 300,250 305,258 315,248" fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" />

          <!-- Mejillas -->
          <ellipse class="paint-zone" cx="230" cy="245" rx="16" ry="10" fill="#ffffff" stroke="#222" stroke-width="5" />
          <ellipse class="paint-zone" cx="370" cy="245" rx="16" ry="10" fill="#ffffff" stroke="#222" stroke-width="5" />
        </svg>
      `
    },
    {
      id: 'chiffon',
      label: 'Chiffon 🌸',
      title: 'Chiffon con sus Orejas Esponjosas',
      svg: `
        <svg viewBox="0 0 600 500" class="bw-art-svg" id="bwSvgArt">
          <rect class="paint-zone" x="0" y="0" width="600" height="500" fill="#ffffff" />
          <!-- Flores flotantes -->
          <path class="paint-zone" d="M 120,110 C 100,80 150,70 140,100 C 170,90 170,140 140,130 C 150,160 100,150 120,110 Z" fill="#ffffff" stroke="#222" stroke-width="5" />
          <circle class="paint-zone" cx="480" cy="110" r="26" fill="#ffffff" stroke="#222" stroke-width="5" />

          <!-- Orejas rizadas/esponjosas de Chiffon -->
          <path class="paint-zone" d="M 220,170 C 170,120 70,140 70,210 C 65,250 100,270 120,290 C 150,305 190,280 230,220 Z" fill="#ffffff" stroke="#222" stroke-width="7" />
          <path class="paint-zone" d="M 380,170 C 430,120 530,140 530,210 C 535,250 500,270 480,290 C 450,305 410,280 370,220 Z" fill="#ffffff" stroke="#222" stroke-width="7" />

          <!-- Cuerpo -->
          <ellipse class="paint-zone" cx="300" cy="340" rx="70" ry="65" fill="#ffffff" stroke="#222" stroke-width="7" />
          <ellipse class="paint-zone" cx="260" cy="405" rx="20" ry="14" fill="#ffffff" stroke="#222" stroke-width="6" />
          <ellipse class="paint-zone" cx="340" cy="405" rx="20" ry="14" fill="#ffffff" stroke="#222" stroke-width="6" />

          <!-- Cabeza -->
          <ellipse class="paint-zone" cx="300" cy="195" rx="100" ry="80" fill="#ffffff" stroke="#222" stroke-width="7" />

          <!-- Ojos alegres de Chiffon -->
          <ellipse class="paint-zone" cx="255" cy="185" rx="11" ry="16" fill="#ffffff" stroke="#222" stroke-width="6" />
          <ellipse class="paint-zone" cx="345" cy="185" rx="11" ry="16" fill="#ffffff" stroke="#222" stroke-width="6" />

          <!-- Nariz y boquita -->
          <path class="paint-zone" d="M 285,210 Q 300,230 315,210" fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" />

          <!-- Mejillas -->
          <ellipse class="paint-zone" cx="225" cy="215" rx="18" ry="11" fill="#ffffff" stroke="#222" stroke-width="5" />
          <ellipse class="paint-zone" cx="375" cy="215" rx="18" ry="11" fill="#ffffff" stroke="#222" stroke-width="5" />
        </svg>
      `
    }
  ];

  class ColoringStudio {
    constructor() {
      this.container = null;
      this.currentTemplate = TEMPLATES[0];
      this.selectedColor = PALETTE[0].color;
      this.currentTool = 'crayon'; // 'crayon', 'bucket', 'eraser', 'stamp'
      this.brushSize = 18; // 8 (fino), 18 (medio), 34 (grueso)
      this.selectedStamp = STAMPS[0];
      this.isDrawing = false;
      this.lastPos = { x: 0, y: 0 };
    }

    init(containerEl) {
      this.container = containerEl;
      this.render();
    }

    render() {
      this.container.innerHTML = `
        <div class="color-studio-wrap">
          <!-- Barra de navegación de láminas (Cinnamoroll y sus amigos) -->
          <div class="templates-scroll-bar">
            ${TEMPLATES.map(tmpl => `
              <button class="sheet-tab-btn ${tmpl.id === this.currentTemplate.id ? 'active' : ''}" data-id="${tmpl.id}">
                ${tmpl.label}
              </button>
            `).join('')}
          </div>

          <!-- Lienzo principal: lámina en B&W + capa de dibujo para rayar -->
          <div class="coloring-board-stage" id="boardStage">
            <div class="sheet-title-tag">${this.currentTemplate.title}</div>
            
            <div class="interactive-canvas-box" id="canvasBox">
              <!-- Capa 1: Vector SVG en Blanco y Negro -->
              <div class="svg-sheet-layer" id="svgSheetLayer">
                ${this.currentTemplate.svg}
              </div>

              <!-- Capa 2: Canvas HTML5 transparente para rayar libremente con crayones y sellos -->
              <canvas class="freehand-draw-canvas" id="freehandCanvas" width="600" height="500"></canvas>
            </div>
          </div>

          <!-- Paleta de herramientas y colores adaptada para deditos de 5 años -->
          <div class="coloring-controls-bar">
            <!-- Selector de herramientas -->
            <div class="tools-selector">
              <button class="tool-btn ${this.currentTool === 'crayon' ? 'active' : ''}" data-tool="crayon" title="Crayón para rayar">
                🖍️ Rayar
              </button>
              <button class="tool-btn ${this.currentTool === 'bucket' ? 'active' : ''}" data-tool="bucket" title="Relleno Mágico">
                🪄 Pintar
              </button>
              <button class="tool-btn ${this.currentTool === 'eraser' ? 'active' : ''}" data-tool="eraser" title="Borrador">
                🧽 Borrar
              </button>
              <button class="tool-btn ${this.currentTool === 'stamp' ? 'active' : ''}" data-tool="stamp" title="Sellos mágicos">
                ⭐ Sellitos
              </button>
            </div>

            <!-- Tamaños de trazo -->
            <div class="brush-size-selector" id="sizeSelector">
              <button class="size-pill ${this.brushSize === 8 ? 'active' : ''}" data-size="8">✏️ Fino</button>
              <button class="size-pill ${this.brushSize === 18 ? 'active' : ''}" data-size="18">🖍️ Medio</button>
              <button class="size-pill ${this.brushSize === 34 ? 'active' : ''}" data-size="34">🖌️ Grueso</button>
            </div>

            <!-- Sellitos kawaii (visible si herramienta = stamp) -->
            <div class="stamps-picker ${this.currentTool === 'stamp' ? '' : 'hidden'}" id="stampsPicker">
              ${STAMPS.map(st => `
                <button class="stamp-opt-btn ${st === this.selectedStamp ? 'active' : ''}" data-stamp="${st}">
                  ${st}
                </button>
              `).join('')}
            </div>

            <!-- Paleta de colores Sanrio -->
            <div class="color-swatches-row">
              ${PALETTE.map(p => `
                <button class="swatch-btn ${p.color === this.selectedColor ? 'active' : ''}" 
                        data-color="${p.color}" 
                        style="background-color: ${p.color};" 
                        title="${p.name}" 
                        aria-label="${p.name}">
                </button>
              `).join('')}
            </div>

            <!-- Acciones auxiliares: Limpiar y Guardar -->
            <div class="aux-actions-row">
              <button class="aux-btn" id="btnClearSheet">📄 Hoja Nueva</button>
              <button class="aux-btn special" id="btnDownloadArt">📸 Guardar Foto</button>
            </div>
          </div>
        </div>
      `;

      this.bindEvents();
    }

    bindEvents() {
      const canvas = this.container.querySelector('#freehandCanvas');
      const ctx = canvas.getContext('2d');

      // Cambio de lámina
      this.container.querySelectorAll('.sheet-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          const found = TEMPLATES.find(t => t.id === e.currentTarget.dataset.id);
          if (found) {
            this.currentTemplate = found;
            this.render();
          }
        });
      });

      // Cambio de herramienta
      this.container.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.kawaiiChirp('chirp');
          this.currentTool = e.currentTarget.dataset.tool;
          this.container.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');

          const stampsPicker = this.container.querySelector('#stampsPicker');
          const sizeSelector = this.container.querySelector('#sizeSelector');
          if (this.currentTool === 'stamp') {
            stampsPicker.classList.remove('hidden');
            sizeSelector.classList.add('hidden');
          } else {
            stampsPicker.classList.add('hidden');
            sizeSelector.classList.remove('hidden');
          }
        });
      });

      // Selección de tamaño
      this.container.querySelectorAll('.size-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          this.brushSize = parseInt(e.currentTarget.dataset.size, 10);
          this.container.querySelectorAll('.size-pill').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
        });
      });

      // Selección de sello
      this.container.querySelectorAll('.stamp-opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(2);
          this.selectedStamp = e.currentTarget.dataset.stamp;
          this.container.querySelectorAll('.stamp-opt-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
        });
      });

      // Selección de color
      this.container.querySelectorAll('.swatch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.colorSplat();
          this.selectedColor = e.currentTarget.dataset.color;
          this.container.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
        });
      });

      // Relleno mágico sobre zonas vectoriales de la lámina
      const svg = this.container.querySelector('#bwSvgArt');
      svg.addEventListener('click', (e) => {
        if (this.currentTool !== 'bucket') return;
        const target = e.target.closest('.paint-zone');
        if (target) {
          A.unlock();
          A.colorSplat();
          target.setAttribute('fill', this.selectedColor);
        }
      });

      // Dibujo táctil y libre sobre el Canvas (Crayones y Rayar)
      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
        };
      };

      const startDraw = (e) => {
        if (this.currentTool === 'bucket') return;
        A.unlock();
        this.isDrawing = true;
        this.lastPos = getPos(e);

        if (this.currentTool === 'stamp') {
          // Estampar sello kawaii
          A.bubblePop(3);
          ctx.font = '40px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(this.selectedStamp, this.lastPos.x, this.lastPos.y);
          this.isDrawing = false;
        } else {
          // Trazo inicial de crayón o borrador
          ctx.beginPath();
          ctx.arc(this.lastPos.x, this.lastPos.y, this.brushSize / 2, 0, Math.PI * 2);
          if (this.currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fill();
          } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = this.selectedColor;
            ctx.fill();
          }
        }
      };

      const moveDraw = (e) => {
        if (!this.isDrawing || this.currentTool === 'bucket' || this.currentTool === 'stamp') return;
        e.preventDefault();
        const pos = getPos(e);

        ctx.beginPath();
        ctx.moveTo(this.lastPos.x, this.lastPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = this.brushSize;

        if (this.currentTool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = this.selectedColor;
        }

        ctx.stroke();
        this.lastPos = pos;
      };

      const stopDraw = () => {
        this.isDrawing = false;
      };

      canvas.addEventListener('mousedown', startDraw);
      canvas.addEventListener('mousemove', moveDraw);
      window.addEventListener('mouseup', stopDraw);

      canvas.addEventListener('touchstart', startDraw, { passive: false });
      canvas.addEventListener('touchmove', moveDraw, { passive: false });
      window.addEventListener('touchend', stopDraw);

      // Botón Limpiar Hoja
      this.container.querySelector('#btnClearSheet').addEventListener('click', () => {
        A.unlock();
        A.softBoing();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Reset SVG fills to white
        this.container.querySelectorAll('#bwSvgArt .paint-zone').forEach(el => {
          el.setAttribute('fill', '#ffffff');
        });
      });

      // Botón Guardar / Descargar Foto de la obra
      this.container.querySelector('#btnDownloadArt').addEventListener('click', () => {
        A.unlock();
        A.celebrate();
        this.exportArtwork(canvas, svg);
      });
    }

    exportArtwork(canvas, svg) {
      // Combina el SVG de fondo y el canvas en una imagen final para guardar
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const expCtx = exportCanvas.getContext('2d');

      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const b64Start = 'data:image/svg+xml;base64,';
      const image64 = b64Start + svg64;

      const img = new Image();
      img.onload = () => {
        expCtx.drawImage(img, 0, 0);
        expCtx.drawImage(canvas, 0, 0);

        const a = document.createElement('a');
        a.download = `Cinnamoroll_Dibujo_Amanda_${this.currentTemplate.id}.png`;
        a.href = exportCanvas.toDataURL('image/png');
        a.click();
      };
      img.src = image64;
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.coloringGame = new ColoringStudio();
})();
