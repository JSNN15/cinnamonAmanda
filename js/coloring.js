/* El Taller de Dibujo de Cinnamoroll & Amigos
 * Láminas OFICIALES en blanco y negro de Cinnamoroll, Milk, Mocha, Pompompurin y Chiffon.
 * Permite rayar con crayones de verdad, borrar, estampar sellos kawaii y descargar la obra de arte.
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const PALETTE = [
    { name: 'Celeste Cinnamoroll', color: '#8ecae6' },
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

  const SHEETS = [
    { id: 'cinna', label: 'Cinnamoroll 🪽', title: 'Cinnamoroll Volando en el Cielo', src: 'assets/sheet_cinnamoroll.png' },
    { id: 'milk', label: 'Milk 🍼', title: 'El Pequeño Bebé Milk con su Osito', src: 'assets/sheet_milk.png' },
    { id: 'purin', label: 'Pompompurin 🍮', title: 'Pompompurin con su Boina y Corazón', src: 'assets/sheet_pompompurin.png' },
    { id: 'mocha', label: 'Mocha 🎀', title: 'Mocha con sus Lazos de Flores', src: 'assets/sheet_mocha.png' },
    { id: 'chiffon', label: 'Chiffon 🌸', title: 'Chiffon con sus Orejas Esponjosas', src: 'assets/sheet_chiffon.png' }
  ];

  class ColoringStudio {
    constructor() {
      this.container = null;
      this.currentSheet = SHEETS[0];
      this.selectedColor = PALETTE[0].color;
      this.currentTool = 'crayon'; // 'crayon', 'eraser', 'stamp'
      this.brushSize = 18;
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
          <!-- Selector de Láminas Oficiales -->
          <div class="templates-scroll-bar">
            ${SHEETS.map(s => `
              <button class="sheet-tab-btn ${s.id === this.currentSheet.id ? 'active' : ''}" data-id="${s.id}">
                ${s.label}
              </button>
            `).join('')}
          </div>

          <!-- Pizarra de Dibujo con Lámina de Fondo -->
          <div class="coloring-board-stage" id="boardStage">
            <div class="sheet-title-tag">${this.currentSheet.title}</div>
            
            <div class="interactive-canvas-box" id="canvasBox">
              <!-- Imagen de Lámina en Blanco y Negro -->
              <img src="${this.currentSheet.src}" class="bw-sheet-img" id="sheetImg" alt="${this.currentSheet.title}" />

              <!-- Lienzo transparente superior para rayar con crayones -->
              <canvas class="freehand-draw-canvas" id="freehandCanvas" width="600" height="500"></canvas>
            </div>
          </div>

          <!-- Barra de Herramientas -->
          <div class="coloring-controls-bar">
            <!-- Herramientas -->
            <div class="tools-selector">
              <button class="tool-btn ${this.currentTool === 'crayon' ? 'active' : ''}" data-tool="crayon">
                🖍️ Rayar
              </button>
              <button class="tool-btn ${this.currentTool === 'eraser' ? 'active' : ''}" data-tool="eraser">
                🧽 Borrar
              </button>
              <button class="tool-btn ${this.currentTool === 'stamp' ? 'active' : ''}" data-tool="stamp">
                ⭐ Sellitos
              </button>
            </div>

            <!-- Tamaños -->
            <div class="brush-size-selector" id="sizeSelector">
              <button class="size-pill ${this.brushSize === 8 ? 'active' : ''}" data-size="8">✏️ Fino</button>
              <button class="size-pill ${this.brushSize === 18 ? 'active' : ''}" data-size="18">🖍️ Medio</button>
              <button class="size-pill ${this.brushSize === 34 ? 'active' : ''}" data-size="34">🖌️ Grueso</button>
            </div>

            <!-- Sellos -->
            <div class="stamps-picker ${this.currentTool === 'stamp' ? '' : 'hidden'}" id="stampsPicker">
              ${STAMPS.map(st => `
                <button class="stamp-opt-btn ${st === this.selectedStamp ? 'active' : ''}" data-stamp="${st}">
                  ${st}
                </button>
              `).join('')}
            </div>

            <!-- Paleta de Colores Pastel -->
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

            <!-- Acciones -->
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
      const sheetImg = this.container.querySelector('#sheetImg');

      // Cambio de lámina
      this.container.querySelectorAll('.sheet-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          const found = SHEETS.find(s => s.id === e.currentTarget.dataset.id);
          if (found) {
            this.currentSheet = found;
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

      // Tamaños
      this.container.querySelectorAll('.size-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          this.brushSize = parseInt(e.currentTarget.dataset.size, 10);
          this.container.querySelectorAll('.size-pill').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
        });
      });

      // Sellos
      this.container.querySelectorAll('.stamp-opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(2);
          this.selectedStamp = e.currentTarget.dataset.stamp;
          this.container.querySelectorAll('.stamp-opt-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
        });
      });

      // Colores
      this.container.querySelectorAll('.swatch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.colorSplat();
          this.selectedColor = e.currentTarget.dataset.color;
          this.container.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
        });
      });

      // Dibujo con crayones
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
        A.unlock();
        this.isDrawing = true;
        this.lastPos = getPos(e);

        if (this.currentTool === 'stamp') {
          A.bubblePop(3);
          ctx.font = '44px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(this.selectedStamp, this.lastPos.x, this.lastPos.y);
          this.isDrawing = false;
        } else {
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
        if (!this.isDrawing || this.currentTool === 'stamp') return;
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

      // Limpiar hoja
      this.container.querySelector('#btnClearSheet').addEventListener('click', () => {
        A.unlock();
        A.softBoing();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });

      // Guardar foto
      this.container.querySelector('#btnDownloadArt').addEventListener('click', () => {
        A.unlock();
        A.celebrate();
        this.exportArtwork(canvas, sheetImg);
      });
    }

    exportArtwork(canvas, sheetImg) {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const expCtx = exportCanvas.getContext('2d');

      expCtx.fillStyle = '#ffffff';
      expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      expCtx.drawImage(sheetImg, 0, 0, exportCanvas.width, exportCanvas.height);
      expCtx.drawImage(canvas, 0, 0);

      const a = document.createElement('a');
      a.download = `Dibujo_Amanda_${this.currentSheet.id}.png`;
      a.href = exportCanvas.toDataURL('image/png');
      a.click();
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.coloringGame = new ColoringStudio();
})();
