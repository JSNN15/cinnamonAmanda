/* El Taller de Dibujo de Cinnamoroll & Amigos
 * Láminas OFICIALES en blanco y negro de Cinnamoroll, Milk, Mocha, Pompompurin y Chiffon.
 * - Capa de contorno siempre visible SOBRE el color (mix-blend-mode: multiply).
 * - Cursor dinámico sobre la pizarra que muestra el grosor exacto del pincel y el color.
 * - Sellitos kawaii funcionales con efectos sonoros, partículas y trazo continuo.
 * - Borrador que sólo borra los colores sin dañar el dibujo.
 * - Exportación de alta resolución a PNG.
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
    { name: 'Rojo Fresa', color: '#fb7185' },
    { name: 'Chocolate Sanrio', color: '#5c3d2e' }
  ];

  const STAMPS = [
    { emoji: '⭐', label: 'Estrella' },
    { emoji: '💖', label: 'Corazón' },
    { emoji: '🌸', label: 'Flor' },
    { emoji: '🎀', label: 'Lazo' },
    { emoji: '🧁', label: 'Pastelito' },
    { emoji: '🍥', label: 'Rollito' },
    { emoji: '🍼', label: 'Biberón' },
    { emoji: '🍮', label: 'Flan' },
    { emoji: '🍓', label: 'Frutilla' },
    { emoji: '✨', label: 'Brillito' }
  ];

  const SHEETS = [
    { id: 'cinna', label: 'Cinnamoroll 🪽', title: 'Cinnamoroll Volando en el Cielo', src: 'assets/sheet_cinnamoroll.png?v=14' },
    { id: 'milk', label: 'Milk 🍼', title: 'El Pequeño Bebé Milk con su Osito', src: 'assets/sheet_milk.png?v=14' },
    { id: 'purin', label: 'Pompompurin 🍮', title: 'Pompompurin con su Boina y Corazón', src: 'assets/sheet_pompompurin.png?v=14' },
    { id: 'mocha', label: 'Mocha 🎀', title: 'Mocha con sus Lazos de Flores', src: 'assets/sheet_mocha.png?v=14' },
    { id: 'chiffon', label: 'Chiffon 🌸', title: 'Chiffon con sus Orejas Esponjosas', src: 'assets/sheet_chiffon.png?v=14' }
  ];

  class ColoringStudio {
    constructor() {
      this.container = null;
      this.currentSheet = SHEETS[0];
      this.selectedColor = PALETTE[0].color;
      this.currentTool = 'crayon'; // 'crayon', 'eraser', 'stamp'
      this.brushSize = 20;
      this.selectedStamp = STAMPS[0].emoji;
      this.isDrawing = false;
      this.lastPos = null;
      this.lastStampPos = null;
      this.savedCanvases = {}; // Sheet ID -> DataURL de dibujo guardado
      this.history = [];       // Pila de estados para Deshacer (Undo)
    }

    stop() {
      this.isDrawing = false;
      if (this._onWinPointerUp) {
        window.removeEventListener('pointerup', this._onWinPointerUp);
        window.removeEventListener('pointercancel', this._onWinPointerUp);
        this._onWinPointerUp = null;
      }
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

          <!-- Pizarra de Dibujo: Capas Superpuestas -->
          <div class="coloring-board-stage" id="boardStage">
            <div class="sheet-title-tag">${this.currentSheet.title}</div>
            
            <div class="interactive-canvas-box" id="canvasBox">
              <!-- Capa 1 (Fondo/Pintura): Lienzo inferior donde se pinta y se estampan sellos -->
              <canvas class="freehand-draw-canvas" id="freehandCanvas" width="600" height="500"></canvas>

              <!-- Capa 2 (Contorno Superior): Imagen en B&W multiplicada para que las líneas NUNCA se tapen -->
              <img src="${this.currentSheet.src}" class="bw-sheet-overlay" id="sheetImg" alt="${this.currentSheet.title}" />

              <!-- Cursor flotante interactivo que muestra el grosor y color del pincel -->
              <div class="brush-cursor-indicator" id="brushCursor"></div>
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

            <!-- Selector de Grosores de Pincel -->
            <div class="brush-size-selector ${this.currentTool === 'stamp' ? 'hidden' : ''}" id="sizeSelector">
              <button class="size-pill ${this.brushSize === 8 ? 'active' : ''}" data-size="8">✏️ Fino (8px)</button>
              <button class="size-pill ${this.brushSize === 20 ? 'active' : ''}" data-size="20">🖍️ Medio (20px)</button>
              <button class="size-pill ${this.brushSize === 40 ? 'active' : ''}" data-size="40">🖌️ Grueso (40px)</button>
            </div>

            <!-- Selector de Sellitos Kawaii -->
            <div class="stamps-picker ${this.currentTool === 'stamp' ? '' : 'hidden'}" id="stampsPicker">
              ${STAMPS.map(st => `
                <button class="stamp-opt-btn ${st.emoji === this.selectedStamp ? 'active' : ''}" 
                        data-stamp="${st.emoji}" 
                        title="${st.label}">
                  ${st.emoji}
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

            <!-- Acciones auxiliares -->
            <div class="aux-actions-row">
              <button class="aux-btn" id="btnUndoArt" title="Deshacer el último trazo">↩️ Deshacer</button>
              <button class="aux-btn" id="btnClearSheet">📄 Hoja Nueva</button>
              <button class="aux-btn special" id="btnDownloadArt">📸 Guardar Foto</button>
            </div>
          </div>
        </div>
      `;

      this.bindEvents();

      if (window.Cinnamo?.controllerBridge?.broadcastGameContext) {
        window.Cinnamo.controllerBridge.broadcastGameContext({
          screen: 'coloring',
          sheetId: this.currentSheet.id,
          sheetTitle: this.currentSheet.title,
          selectedColor: this.selectedColor,
          currentTool: this.currentTool
        });
      }
    }

    bindEvents() {
      const canvas = this.container.querySelector('#freehandCanvas');
      const ctx = canvas.getContext('2d');
      const sheetImg = this.container.querySelector('#sheetImg');
      const canvasBox = this.container.querySelector('#canvasBox');
      const brushCursor = this.container.querySelector('#brushCursor');

      // Restaurar dibujo guardado de esta lámina si existe
      if (this.savedCanvases && this.savedCanvases[this.currentSheet.id]) {
        const savedImg = new Image();
        savedImg.onload = () => {
          ctx.drawImage(savedImg, 0, 0);
        };
        // El dibujo restaurado es la base: Deshacer vuelve a él, nunca lo borra entero
        this.historyBase = this.savedCanvases[this.currentSheet.id];
        this.history = [];
        savedImg.src = this.historyBase;
      } else {
        this.historyBase = null;
        this.history = [];
      }

      // 1. Cambio de lámina (con memoria de dibujo)
      this.container.querySelectorAll('.sheet-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          const found = SHEETS.find(s => s.id === e.currentTarget.dataset.id);
          if (found && found.id !== this.currentSheet.id) {
            // Guardar lo que Amanda dibujó en esta lámina antes de cambiar
            this.savedCanvases[this.currentSheet.id] = canvas.toDataURL();
            this.currentSheet = found;
            this.render();
          }
        });
      });

      // 2. Cambio de herramienta
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
          updateCursorVisual();
        });
      });

      // 3. Cambio de tamaño de pincel
      this.container.querySelectorAll('.size-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          this.brushSize = parseInt(e.currentTarget.dataset.size, 10);
          this.container.querySelectorAll('.size-pill').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          updateCursorVisual();
        });
      });

      // 4. Cambio de sello
      this.container.querySelectorAll('.stamp-opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(2);
          this.selectedStamp = e.currentTarget.dataset.stamp;
          this.container.querySelectorAll('.stamp-opt-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          updateCursorVisual();
        });
      });

      // 5. Cambio de color
      this.container.querySelectorAll('.swatch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.colorSplat();
          this.selectedColor = e.currentTarget.dataset.color;
          this.container.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');

          // Si estaba en borrador o sello, volver al crayón automáticamente
          if (this.currentTool === 'eraser') {
            this.currentTool = 'crayon';
            this.container.querySelectorAll('.tool-btn').forEach(b => {
              b.classList.toggle('active', b.dataset.tool === 'crayon');
            });
            this.container.querySelector('#stampsPicker').classList.add('hidden');
            this.container.querySelector('#sizeSelector').classList.remove('hidden');
          }
          updateCursorVisual();
        });
      });

      // 6. Indicador de Cursor Visual con grosor dinámico
      const updateCursorVisual = () => {
        if (!brushCursor) return;
        const rect = canvasBox.getBoundingClientRect();
        const scale = rect.width / canvas.width;
        const screenDiameter = Math.max(8, this.brushSize * scale);

        if (this.currentTool === 'crayon') {
          brushCursor.style.width = `${screenDiameter}px`;
          brushCursor.style.height = `${screenDiameter}px`;
          brushCursor.style.borderRadius = '50%';
          brushCursor.style.border = `2.5px solid ${this.selectedColor}`;
          brushCursor.style.backgroundColor = `${this.selectedColor}55`;
          brushCursor.style.boxShadow = `0 0 0 1.5px rgba(255, 255, 255, 0.95), 0 2px 8px rgba(0, 0, 0, 0.25)`;
          brushCursor.textContent = '';
        } else if (this.currentTool === 'eraser') {
          brushCursor.style.width = `${screenDiameter}px`;
          brushCursor.style.height = `${screenDiameter}px`;
          brushCursor.style.borderRadius = '50%';
          brushCursor.style.border = '2.5px dashed #444444';
          brushCursor.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
          brushCursor.style.boxShadow = '0 0 0 1.5px rgba(255, 255, 255, 0.95), 0 2px 8px rgba(0, 0, 0, 0.2)';
          brushCursor.textContent = '';
        } else if (this.currentTool === 'stamp') {
          brushCursor.style.width = '46px';
          brushCursor.style.height = '46px';
          brushCursor.style.borderRadius = '50%';
          brushCursor.style.border = '2px dashed #ff69b4';
          brushCursor.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
          brushCursor.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
          brushCursor.style.fontSize = '28px';
          brushCursor.style.lineHeight = '42px';
          brushCursor.style.textAlign = 'center';
          brushCursor.textContent = this.selectedStamp;
        }
      };

      const setCursorPos = (clientX, clientY) => {
        if (!brushCursor) return;
        const rect = canvasBox.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        brushCursor.style.left = `${x}px`;
        brushCursor.style.top = `${y}px`;
        brushCursor.style.display = 'block';
      };

      canvasBox.addEventListener('pointerenter', (e) => {
        updateCursorVisual();
        setCursorPos(e.clientX, e.clientY);
      });

      canvasBox.addEventListener('pointermove', (e) => {
        setCursorPos(e.clientX, e.clientY);
      });

      canvasBox.addEventListener('pointerleave', () => {
        if (brushCursor) brushCursor.style.display = 'none';
      });

      // 7. Lógica de Dibujo y Sellos sobre el Lienzo
      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
          x: Math.max(0, Math.min(canvas.width, (clientX - rect.left) * scaleX)),
          y: Math.max(0, Math.min(canvas.height, (clientY - rect.top) * scaleY)),
          clientX,
          clientY
        };
      };

      const stampAt = (x, y) => {
        A.unlock();
        A.bubblePop(3);

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = '48px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.selectedStamp, x, y);
        ctx.restore();

        // Efecto visual de pequeñas estrellitas saltando
        const rect = canvasBox.getBoundingClientRect();
        const screenX = x * (rect.width / canvas.width);
        const screenY = y * (rect.height / canvas.height);
        this.spawnStampBurst(canvasBox, screenX, screenY);
      };

      const onPointerDown = (e) => {
        e.preventDefault();
        A.unlock();
        this.isDrawing = true;
        if (canvasBox.setPointerCapture && e.pointerId !== undefined) {
          try { canvasBox.setPointerCapture(e.pointerId); } catch (_) {}
        }
        const pos = getPos(e);
        this.lastPos = pos;
        updateCursorVisual();
        setCursorPos(pos.clientX, pos.clientY);

        if (this.currentTool === 'stamp') {
          stampAt(pos.x, pos.y);
          this.lastStampPos = { ...pos };
        } else {
          // Trazo inicial de punto
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, this.brushSize / 2, 0, Math.PI * 2);
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

      const onPointerMove = (e) => {
        const pos = getPos(e);
        setCursorPos(pos.clientX, pos.clientY);

        if (!this.isDrawing) return;
        e.preventDefault();

        if (this.currentTool === 'stamp') {
          if (this.lastStampPos) {
            const dist = Math.hypot(pos.x - this.lastStampPos.x, pos.y - this.lastStampPos.y);
            if (dist > 52) {
              stampAt(pos.x, pos.y);
              this.lastStampPos = { ...pos };
            }
          }
        } else {
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
        }
      };

      const pushHistory = () => {
        try {
          const url = canvas.toDataURL();
          this.history.push(url);
          if (this.history.length > 20) this.history.shift();
          if (this.savedCanvases) this.savedCanvases[this.currentSheet.id] = url;
        } catch (_) {}
      };

      const onPointerUp = (e) => {
        if (canvasBox.releasePointerCapture && e && e.pointerId !== undefined) {
          try { canvasBox.releasePointerCapture(e.pointerId); } catch (_) {}
        }
        if (this.isDrawing) {
          this.isDrawing = false;
          pushHistory();
        }
        this.lastPos = null;
        this.lastStampPos = null;
      };

      if (this._onWinPointerUp) {
        window.removeEventListener('pointerup', this._onWinPointerUp);
        window.removeEventListener('pointercancel', this._onWinPointerUp);
      }
      this._onWinPointerUp = onPointerUp;

      canvasBox.addEventListener('pointerdown', onPointerDown);
      canvasBox.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', this._onWinPointerUp);
      window.addEventListener('pointercancel', this._onWinPointerUp);

      // 8. Deshacer el último trazo (Undo)
      const btnUndo = this.container.querySelector('#btnUndoArt');
      if (btnUndo) {
        btnUndo.addEventListener('click', () => {
          A.unlock();
          if (this.history.length > 1) {
            A.softBoing();
            this.history.pop(); // descartar estado actual
            const prev = this.history[this.history.length - 1];
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              if (this.savedCanvases) this.savedCanvases[this.currentSheet.id] = prev;
            };
            img.src = prev;
          } else if (this.history.length === 1) {
            A.softBoing();
            this.history.pop();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (this.historyBase) {
              const base = this.historyBase;
              const img = new Image();
              img.onload = () => ctx.drawImage(img, 0, 0);
              img.src = base;
              if (this.savedCanvases) this.savedCanvases[this.currentSheet.id] = base;
            } else if (this.savedCanvases) {
              delete this.savedCanvases[this.currentSheet.id];
            }
          }
        });
      }

      // 9. Limpiar hoja (deja el dibujo en blanco manteniendo el contorno)
      this.container.querySelector('#btnClearSheet').addEventListener('click', () => {
        A.unlock();
        A.softBoing();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.history = [];
        this.historyBase = null;
        if (this.savedCanvases) delete this.savedCanvases[this.currentSheet.id];
      });

      // 10. Guardar foto (combina el color con el contorno multiplicado)
      this.container.querySelector('#btnDownloadArt').addEventListener('click', () => {
        A.unlock();
        A.celebrate();
        // Estrellas solo si pintó algo, una vez por lámina
        this.rewardedSheets = this.rewardedSheets || new Set();
        if (this.history.length > 0 && !this.rewardedSheets.has(this.currentSheet.id)) {
          this.rewardedSheets.add(this.currentSheet.id);
          window.Cinnamo?.passport?.addStars?.(2, 'coloring');
        }
        this.exportArtwork(canvas, sheetImg);
      });

      updateCursorVisual();
    }

    spawnStampBurst(container, x, y) {
      for (let i = 0; i < 4; i++) {
        const star = document.createElement('span');
        star.className = 'stamp-pop-particle';
        star.textContent = ['✨', '💖', '⭐', '🌸'][i % 4];
        const angle = (i / 4) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const dist = 24 + Math.random() * 16;
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        star.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        star.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
        container.appendChild(star);
        setTimeout(() => { try { star.remove(); } catch (_) {} }, 600);
      }
    }

    exportArtwork(canvas, sheetImg) {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const expCtx = exportCanvas.getContext('2d');

      // 1. Fondo blanco de hoja
      expCtx.fillStyle = '#ffffff';
      expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // 2. Colores y sellos dibujados por Amanda
      expCtx.drawImage(canvas, 0, 0);

      // 3. Contorno del personaje por encima (con multiply para preservar líneas y ojos intactos)
      expCtx.globalCompositeOperation = 'multiply';
      expCtx.drawImage(sheetImg, 0, 0, exportCanvas.width, exportCanvas.height);
      expCtx.globalCompositeOperation = 'source-over';

      // 4. Firma de Amanda en la esquina inferior derecha
      expCtx.fillStyle = '#7a523a';
      expCtx.font = 'bold 15px "Baloo 2", cursive, sans-serif';
      expCtx.textAlign = 'right';
      expCtx.fillText(`✨ Obra de Arte de ${cinnaName()} • Cinnamoroll Land`, exportCanvas.width - 20, exportCanvas.height - 16);

      const a = document.createElement('a');
      a.download = `Dibujo_${cinnaName().replace(/[^A-Za-zÑñ]/g, '')}_${this.currentSheet.id}.png`;
      a.href = exportCanvas.toDataURL('image/png');
      a.click();
    }

    selectSheetById(sheetId) {
      if (!this.container) return;
      const btn = this.container.querySelector(`.sheet-tab-btn[data-id="${sheetId}"]`);
      if (btn) {
        btn.click();
      } else {
        const found = SHEETS.find(s => s.id === sheetId);
        if (found) {
          A.unlock();
          A.bubblePop(2);
          this.currentSheet = found;
          this.render();
        }
      }
    }

    setBrushSize(size) {
      const sz = parseInt(size, 10) || 20;
      this.brushSize = sz;
      if (this.container) {
        const btn = this.container.querySelector(`.size-pill[data-size="${sz}"]`);
        if (btn) btn.click();
      }
    }

    setStamp(emoji) {
      if (!emoji) return;
      this.selectedStamp = emoji;
      this.currentTool = 'stamp';
      if (this.container) {
        const toolBtn = this.container.querySelector('.tool-btn[data-tool="stamp"]');
        if (toolBtn) toolBtn.click();
        const stBtn = this.container.querySelector(`.stamp-opt-btn[data-stamp="${window.CSS?.escape ? CSS.escape(emoji) : emoji}"]`);
        if (stBtn) stBtn.click();
      }
    }

    saveArtRemotely() {
      if (!this.container) return;
      const btn = this.container.querySelector('#btnDownloadArt');
      if (btn) btn.click();
    }

    remotePad(action, normX, normY) {
      if (!this.container) return;
      const canvas = this.container.querySelector('#freehandCanvas');
      const cursor = this.container.querySelector('#brushCursor');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const x = Math.max(0, Math.min(canvas.width, normX * canvas.width));
      const y = Math.max(0, Math.min(canvas.height, normY * canvas.height));

      if (cursor) {
        const r = canvas.getBoundingClientRect();
        cursor.style.opacity = action === 'up' ? '0' : '1';
        cursor.style.left = `${(x / canvas.width) * r.width}px`;
        cursor.style.top = `${(y / canvas.height) * r.height}px`;
      }

      if (action === 'down') {
        A.unlock();
        this.isDrawing = true;
        this._remotePos = { x, y };
        if (this.currentTool === 'stamp') {
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          ctx.font = '38px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(this.selectedStamp, x, y);
          ctx.restore();
          A.sparkleChime();
          this._remoteStampPos = { x, y };
        } else {
          ctx.beginPath();
          ctx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
          if (this.currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fill();
          } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = this.selectedColor;
            ctx.fill();
          }
          A.bubblePop(1);
        }
      } else if (action === 'move' && this.isDrawing) {
        if (this.currentTool === 'stamp') {
          const prev = this._remoteStampPos || { x: -999, y: -999 };
          if (Math.hypot(x - prev.x, y - prev.y) > 44) {
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.font = '38px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.selectedStamp, x, y);
            ctx.restore();
            A.bubblePop(2);
            this._remoteStampPos = { x, y };
          }
        } else if (this._remotePos) {
          ctx.beginPath();
          ctx.moveTo(this._remotePos.x, this._remotePos.y);
          ctx.lineTo(x, y);
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
          this._remotePos = { x, y };
        }
      } else if (action === 'up') {
        if (this.isDrawing) {
          this.isDrawing = false;
          try {
            const url = canvas.toDataURL();
            this.history.push(url);
            if (this.history.length > 20) this.history.shift();
            if (this.savedCanvases) this.savedCanvases[this.currentSheet.id] = url;
          } catch (_) {}
        }
        this._remotePos = null;
        this._remoteStampPos = null;
      }
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.coloringGame = new ColoringStudio();
})();
