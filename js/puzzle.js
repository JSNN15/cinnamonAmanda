/* Puzzles de Lógica y Rompecabezas Visuales con Cinnamoroll
 * Diseñado con pedagogía preescolar para Amanda (4-5 años).
 * 
 * Principios de Diseño para Niñas de Prebásica:
 *  1. CERO texto necesario para jugar: todo es reconocimiento visual de patrones y siluetas.
 *  2. Ilustraciones auténticas y nítidas de Sanrio: Cinnamoroll, Milk, Chiffon, Pompompurin y Mocha.
 *  3. Tablero con Silueta Guía ("Ghost Image"): marca de agua suave para que la niña compare y asocie.
 *  4. Piezas Reales de Madera Ilustrada: cada pieza es un recorte visual directo del dibujo (orejas, carita, colita, etc.).
 *  5. Arrastre táctil magnético fluido (Drag & Drop) y toque directo asistido (Tap-to-Place).
 *  6. Selección adaptativa: 4 piezas grandes (2x2) o 6 piezas (3x2).
 *  7. Celebración mágica con purpurina, sonidos dulces y confeti.
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const PUZZLE_CHARACTERS = [
    {
      id: 'cinna',
      name: 'Cinnamoroll',
      title: 'Cinnamoroll en el Cielo de Nubes',
      badge: '🪽 Cinnamoroll',
      imgSrc: 'assets/puzzle_cinnamoroll.png',
      avatarImg: 'assets/cinnamoroll_fly.png',
      themeColor: '#0288d1',
      bgGrad: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
      voiceIntro: '¡Armemos a Cinnamoroll volando por las nubes!'
    },
    {
      id: 'milk',
      name: 'Milk',
      title: 'Milk y su Osito de Peluche',
      badge: '🍼 Milk Bebé',
      imgSrc: 'assets/puzzle_milk.png',
      avatarImg: 'assets/milk_teddy.png',
      themeColor: '#6366f1',
      bgGrad: 'linear-gradient(135deg, #eef2ff, #c7d2fe)',
      voiceIntro: '¡Ayudemos al tierno Milk y a su osito!'
    },
    {
      id: 'chiffon',
      name: 'Chiffon',
      title: 'Chiffon en el Prado de Flores',
      badge: '🌸 Chiffon',
      imgSrc: 'assets/puzzle_chiffon.png',
      avatarImg: 'assets/chiffon.png',
      themeColor: '#db2777',
      bgGrad: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)',
      voiceIntro: '¡Armemos a la alegre Chiffon con sus orejitas de nube!'
    },
    {
      id: 'purin',
      name: 'Pompompurin',
      title: 'Pompompurin y su Flan Gigante',
      badge: '🍮 Purin',
      imgSrc: 'assets/puzzle_purin.png',
      avatarImg: 'assets/pompompurin_hq.png',
      themeColor: '#d97706',
      bgGrad: 'linear-gradient(135deg, #fffbeb, #fde68a)',
      voiceIntro: '¡Encajemos a Pompompurin y su rico flan de caramelo!'
    },
    {
      id: 'mocha',
      name: 'Mocha',
      title: 'Mocha en la Fiesta del Té',
      badge: '🎀 Mocha',
      imgSrc: 'assets/puzzle_mocha.png',
      avatarImg: 'assets/mocha_hq.png',
      themeColor: '#9333ea',
      bgGrad: 'linear-gradient(135deg, #faf5ff, #e9d5ff)',
      voiceIntro: '¡Armemos a la elegante Mocha con su flor rosa!'
    }
  ];

  class SeniorPreschoolJigsawGame {
    constructor() {
      this.container = null;
      this.currentCharIdx = 0;
      this.pieceCountMode = 4; // 4 (2x2) o 6 (3x2)
      this.placedPieces = {}; // pieceId -> true
      this.trayPieces = []; // array de piezas en la bandeja
      this.boardWidth = 440;
      this.boardHeight = 304;
      this.activeDrag = null;
    }

    init(containerEl) {
      this.container = containerEl;
      this.currentCharIdx = 0;
      this.pieceCountMode = 4;
      this.loadPuzzle(0, 4);
      this.render();
    }

    loadPuzzle(charIdx, pieceCount = 4) {
      this.currentCharIdx = charIdx;
      this.pieceCountMode = pieceCount;
      this.placedPieces = {};
      this.activeDrag = null;

      // Dimensiones adaptativas de tablero para smartphones y PC
      const availW = this.container && this.container.clientWidth ? this.container.clientWidth : window.innerWidth;
      const targetW = Math.min(440, Math.max(290, availW - 48));
      this.boardWidth = targetW;
      this.boardHeight = Math.round(targetW * (304 / 440));

      const cols = pieceCount === 6 ? 3 : 2;
      const rows = 2;
      const total = cols * rows;

      const pieces = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const id = `p_${c}_${r}`;
          pieces.push({
            id,
            col: c,
            row: r,
            totalCols: cols,
            totalRows: rows
          });
        }
      }

      // Barajar las piezas en la bandeja de madera
      this.trayPieces = [...pieces].sort(() => Math.random() - 0.5);
    }

    speak(text) {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'es-ES';
          u.rate = 0.85;
          u.pitch = 1.3;
          window.speechSynthesis.speak(u);
        } catch (_) {}
      }
    }

    render() {
      const char = PUZZLE_CHARACTERS[this.currentCharIdx];
      const cols = this.pieceCountMode === 6 ? 3 : 2;
      const rows = 2;
      const slotW = this.boardWidth / cols;
      const slotH = this.boardHeight / rows;
      const allDone = Object.keys(this.placedPieces).length === (cols * rows);

      this.container.innerHTML = `
        <div class="puzzle-wrap">
          <!-- Selector superior de personajes Sanrio -->
          <div class="puzzle-top-bar">
            <div class="puzzle-pills-row">
              ${PUZZLE_CHARACTERS.map((item, idx) => `
                <button class="puzzle-tab-btn ${idx === this.currentCharIdx ? 'active' : ''}" data-idx="${idx}">
                  ${item.badge}
                </button>
              `).join('')}
            </div>

            <!-- Selector de dificultad (4 o 6 piezas) -->
            <div class="puzzle-difficulty-row">
              <button class="puz-diff-btn ${this.pieceCountMode === 4 ? 'active' : ''}" data-pieces="4">
                🧩 4 Piezas (Fácil)
              </button>
              <button class="puz-diff-btn ${this.pieceCountMode === 6 ? 'active' : ''}" data-pieces="6">
                ⭐ 6 Piezas (Desafío)
              </button>
            </div>
          </div>

          <!-- Escenario Central del Rompecabezas -->
          <div class="puzzle-stage-card ${allDone ? 'puzzle-completed-glow' : ''}" style="background: ${char.bgGrad}">
            <!-- Encabezado con avatar grande -->
            <div class="puzzle-header-info">
              <div class="puzzle-mascot-avatar">
                <img src="${char.avatarImg}" alt="${char.name}" />
              </div>
              <div class="puzzle-title-box">
                <span class="puzzle-badge-pill">${char.badge}</span>
                <h1 style="color: ${char.themeColor}">${char.title}</h1>
                <p>👇 <strong>Arrastra las piezas de madera</strong> a la silueta en el cuadro:</p>
              </div>
            </div>

            <!-- Zona de Juego: Tablero y Bandeja -->
            <div class="puzzle-gameplay-stage">
              <!-- Tablero con Marco de Madera y Silueta Guía Montessori -->
              <div class="puzzle-board-frame">
                <div class="puzzle-board-box" 
                     id="puzzleBoardBox"
                     style="width: ${this.boardWidth}px; height: ${this.boardHeight}px; background-image: url('${char.imgSrc}');">
                  
                  <!-- Rejilla de ranuras del tablero -->
                  ${this.renderBoardSlots(cols, rows, slotW, slotH, char.imgSrc)}
                </div>
              </div>

              <!-- Bandeja Inferior de Piezas de Madera Ilustrada -->
              <div class="puzzle-pieces-tray">
                <div class="tray-title-tag">
                  ✨ Piezas para encajar (${Object.keys(this.placedPieces).length} / ${cols * rows}):
                </div>

                <div class="pieces-bank-list" id="puzzlePiecesBank">
                  ${this.trayPieces.map(piece => {
                    const isPlaced = !!this.placedPieces[piece.id];
                    if (isPlaced) return '';
                    return this.renderTrayPiece(piece, cols, rows, slotW, slotH, char.imgSrc);
                  }).join('')}

                  ${allDone ? `
                    <div class="puzzle-tray-complete-badge">
                      🎉 ¡Todas las piezas encajaron perfecto!
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- Acciones inferiores -->
            <div class="puzzle-bottom-actions">
              <button class="btn-puzzle-reset" id="btnResetPuzzle">🔄 Empezar de nuevo</button>
            </div>
          </div>
        </div>
      `;

      this.bindEvents();
      this.setupPuzzleDragAndDrop(cols, rows, slotW, slotH, char.imgSrc);
    }

    renderBoardSlots(cols, rows, slotW, slotH, imgSrc) {
      let html = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const id = `p_${c}_${r}`;
          const isPlaced = !!this.placedPieces[id];
          const left = c * slotW;
          const top = r * slotH;

          html += `
            <div class="puzzle-board-slot ${isPlaced ? 'placed' : 'empty'}"
                 id="slot_${id}"
                 data-piece-id="${id}"
                 data-col="${c}"
                 data-row="${r}"
                 style="left: ${left}px; top: ${top}px; width: ${slotW}px; height: ${slotH}px;">
              ${isPlaced ? `
                <div class="placed-piece-fill" 
                     style="background-image: url('${imgSrc}');
                            background-size: ${this.boardWidth}px ${this.boardHeight}px;
                            background-position: -${left}px -${top}px;">
                </div>
              ` : `
                <div class="slot-ghost-guide">
                  <span class="slot-plus-guide">+</span>
                </div>
              `}
            </div>
          `;
        }
      }
      return html;
    }

    renderTrayPiece(piece, cols, rows, slotW, slotH, imgSrc) {
      // Dimensiones de vista previa en bandeja (ligeramente compactas para pantalla táctil)
      const scale = this.pieceCountMode === 6 ? 0.72 : 0.82;
      const previewW = Math.round(slotW * scale);
      const previewH = Math.round(slotH * scale);
      const bgLeft = Math.round(piece.col * slotW * scale);
      const bgTop = Math.round(piece.row * slotH * scale);
      const bgTotalW = Math.round(this.boardWidth * scale);
      const bgTotalH = Math.round(this.boardHeight * scale);

      return `
        <div class="puzzle-tray-piece-token"
             id="token_${piece.id}"
             data-piece-id="${piece.id}"
             data-col="${piece.col}"
             data-row="${piece.row}"
             role="button"
             tabindex="0"
             style="width: ${previewW}px; height: ${previewH}px; touch-action: none;">
          <div class="tray-piece-inner"
               style="background-image: url('${imgSrc}');
                      background-size: ${bgTotalW}px ${bgTotalH}px;
                      background-position: -${bgLeft}px -${bgTop}px;">
          </div>
          <span class="tray-piece-bevel"></span>
        </div>
      `;
    }

    bindEvents() {
      // 1. Selector de personajes
      this.container.querySelectorAll('.puzzle-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          const idx = parseInt(e.currentTarget.dataset.idx, 10);
          this.loadPuzzle(idx, this.pieceCountMode);
          this.render();
          this.speak(PUZZLE_CHARACTERS[idx].voiceIntro);
        });
      });

      // 2. Selector de dificultad (4 o 6 piezas)
      this.container.querySelectorAll('.puz-diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(2);
          const count = parseInt(e.currentTarget.dataset.pieces, 10);
          this.loadPuzzle(this.currentCharIdx, count);
          this.render();
        });
      });

      // 3. Toque directo en slot vacío del tablero (Asistencia Montessori)
      this.container.querySelectorAll('.puzzle-board-slot.empty').forEach(slot => {
        slot.addEventListener('click', (e) => {
          const targetPieceId = e.currentTarget.dataset.pieceId;
          if (this.placedPieces[targetPieceId]) return;

          A.unlock();
          // Colocación asistida con animación
          this.placePieceSuccess(targetPieceId);
        });
      });

      // 4. Botón reiniciar puzzle
      const btnReset = this.container.querySelector('#btnResetPuzzle');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          this.loadPuzzle(this.currentCharIdx, this.pieceCountMode);
          this.render();
        });
      }
    }

    /* -------------------------------------------------------------
       SISTEMA DE ARRASTRE TÁCTIL Y ENCAJE MAGNÉTICO (POINTER EVENTS)
       ------------------------------------------------------------- */
    setupPuzzleDragAndDrop(cols, rows, slotW, slotH, imgSrc) {
      const trayTokens = this.container.querySelectorAll('.puzzle-tray-piece-token');

      trayTokens.forEach(token => {
        token.addEventListener('pointerdown', (e) => {
          const pieceId = token.dataset.pieceId;
          const col = parseInt(token.dataset.col, 10);
          const row = parseInt(token.dataset.row, 10);
          if (this.placedPieces[pieceId]) return;

          e.preventDefault();
          A.unlock();
          A.bubblePop(1);

          // Captura de puntero
          if (token.setPointerCapture) {
            try { token.setPointerCapture(e.pointerId); } catch (_) {}
          }

          // Crear clon flotante a tamaño completo del molde
          const clone = document.createElement('div');
          clone.className = 'puzzle-piece-drag-clone';
          clone.style.width = `${slotW}px`;
          clone.style.height = `${slotH}px`;
          clone.style.left = `${e.clientX}px`;
          clone.style.top = `${e.clientY}px`;
          clone.innerHTML = `
            <div class="drag-clone-inner"
                 style="background-image: url('${imgSrc}');
                        background-size: ${this.boardWidth}px ${this.boardHeight}px;
                        background-position: -${col * slotW}px -${row * slotH}px;">
            </div>
            <div class="drag-clone-shine"></div>
          `;
          document.body.appendChild(clone);

          token.classList.add('tray-token-dragging');

          const targetSlot = this.container.querySelector(`#slot_${pieceId}`);

          const dragState = {
            pointerId: e.pointerId,
            pieceId,
            col,
            row,
            token,
            clone,
            targetSlot,
            startX: e.clientX,
            startY: e.clientY,
            moved: false,
            isOverTarget: false
          };
          this.activeDrag = dragState;

          const onMove = (moveEv) => {
            if (!this.activeDrag || this.activeDrag.pointerId !== moveEv.pointerId) return;
            const dx = moveEv.clientX - dragState.startX;
            const dy = moveEv.clientY - dragState.startY;
            if (Math.hypot(dx, dy) > 6) {
              dragState.moved = true;
            }

            // Seguir al dedo
            clone.style.left = `${moveEv.clientX}px`;
            clone.style.top = `${moveEv.clientY}px`;

            // Comprobar cercanía al slot correspondiente
            if (targetSlot) {
              const r = targetSlot.getBoundingClientRect();
              const cx = r.left + r.width / 2;
              const cy = r.top + r.height / 2;
              const dist = Math.hypot(moveEv.clientX - cx, moveEv.clientY - cy);

              // Radio magnético de 80px
              if (dist < 80) {
                dragState.isOverTarget = true;
                targetSlot.classList.add('slot-magnet-match');
              } else {
                dragState.isOverTarget = false;
                targetSlot.classList.remove('slot-magnet-match');
              }
            }
          };

          const onUp = (upEv) => {
            if (!this.activeDrag || this.activeDrag.pointerId !== upEv.pointerId) return;

            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);

            if (token.releasePointerCapture) {
              try { token.releasePointerCapture(upEv.pointerId); } catch (_) {}
            }

            const cur = this.activeDrag;
            this.activeDrag = null;

            cur.token.classList.remove('tray-token-dragging');
            if (cur.targetSlot) cur.targetSlot.classList.remove('slot-magnet-match');

            // 1. Toque Rápido (Tap-to-Snap): vuela directo al molde
            if (!cur.moved) {
              cur.clone.remove();
              this.placePieceSuccess(cur.pieceId);
              return;
            }

            // 2. Arrastrado sobre el slot correspondiente: ¡SNAP!
            if (cur.isOverTarget && cur.targetSlot) {
              const r = cur.targetSlot.getBoundingClientRect();
              cur.clone.style.transition = 'all 0.14s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
              cur.clone.style.left = `${r.left + r.width / 2}px`;
              cur.clone.style.top = `${r.top + r.height / 2}px`;
              cur.clone.style.transform = 'translate(-50%, -50%) scale(1)';

              setTimeout(() => {
                cur.clone.remove();
                this.placePieceSuccess(cur.pieceId);
              }, 140);
              return;
            }

            // 3. Fuera del slot: aviso boing amigable y retorno elástico a la bandeja
            A.softBoing();
            const tokenRect = cur.token.getBoundingClientRect();
            cur.clone.style.transition = 'all 0.22s ease-out';
            cur.clone.style.left = `${tokenRect.left + tokenRect.width / 2}px`;
            cur.clone.style.top = `${tokenRect.top + tokenRect.height / 2}px`;
            cur.clone.style.transform = 'translate(-50%, -50%) scale(0.8)';
            cur.clone.style.opacity = '0.5';

            setTimeout(() => {
              cur.clone.remove();
            }, 220);
          };

          window.addEventListener('pointermove', onMove, { passive: false });
          window.addEventListener('pointerup', onUp);
          window.addEventListener('pointercancel', onUp);
        });
      });
    }

    placePieceSuccess(pieceId) {
      if (this.placedPieces[pieceId]) return;

      this.placedPieces[pieceId] = true;
      const count = Object.keys(this.placedPieces).length;
      const total = this.pieceCountMode;

      // Sonido musical de campanita ascendente
      A.bellChime(520 + count * 65);
      A.sparkleChime();

      // Frases de elogio dulce y espontáneo
      const cheers = ['¡Eso!', '¡Qué bien!', '¡Perfecto!', '¡Bravo Amanda!', '¡Genial!'];
      if (count < total) {
        this.speak(cheers[count % cheers.length]);
      }

      this.render();

      // Efecto de estrellitas en el slot encajado
      const slotEl = this.container.querySelector(`#slot_${pieceId}`);
      if (slotEl) {
        this.spawnStarsOnSlot(slotEl);
      }

      // Comprobar victoria total
      if (count >= total) {
        setTimeout(() => {
          this.triggerVictory();
        }, 450);
      }
    }

    spawnStarsOnSlot(slotEl) {
      const r = slotEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const sparkles = ['✨', '⭐', '🌸', '💖', '🧩'];

      for (let i = 0; i < 7; i++) {
        const star = document.createElement('div');
        star.className = 'slot-star-sparkle';
        star.textContent = sparkles[i % sparkles.length];
        const angle = (i / 7) * Math.PI * 2;
        const dist = 38 + Math.random() * 24;
        star.style.left = `${cx}px`;
        star.style.top = `${cy}px`;
        star.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        star.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 650);
      }
    }

    triggerVictory() {
      const char = PUZZLE_CHARACTERS[this.currentCharIdx];
      A.celebrate();
      this.speak(`¡Hurra Amanda! ¡Armaste completo el puzzle de ${char.name}!`);

      // Modal de Gran Victoria
      const modal = document.createElement('div');
      modal.className = 'w-victory-modal-overlay';
      modal.innerHTML = `
        <div class="w-victory-card">
          <div class="w-victory-badge">🧩 ¡ROMPECABEZAS MÁGICO COMPLETADO! 🧩</div>
          <h2 style="color: ${char.themeColor}">${char.title}</h2>
          <div class="w-victory-img-box">
            <img src="${char.imgSrc}" alt="${char.name}" style="border-radius: 16px; border: 3px solid #fbcfe8;" />
          </div>
          <p>¡Amanda, eres una campeona de la lógica en Cinnamoroll Land! 💖</p>
          <div class="w-victory-actions">
            <button class="btn-w-next" id="btnNextPuzzleModal">▶ Siguiente Rompecabezas</button>
            <button class="btn-w-repeat" id="btnRepeatPuzzleModal">🔄 Jugar de nuevo</button>
          </div>
        </div>
      `;
      this.container.appendChild(modal);

      modal.querySelector('#btnNextPuzzleModal').addEventListener('click', () => {
        A.unlock();
        modal.remove();
        const nextIdx = (this.currentCharIdx + 1) % PUZZLE_CHARACTERS.length;
        this.loadPuzzle(nextIdx, this.pieceCountMode);
        this.render();
        this.speak(PUZZLE_CHARACTERS[nextIdx].voiceIntro);
      });

      modal.querySelector('#btnRepeatPuzzleModal').addEventListener('click', () => {
        A.unlock();
        modal.remove();
        this.loadPuzzle(this.currentCharIdx, this.pieceCountMode);
        this.render();
      });
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.puzzleGame = new SeniorPreschoolJigsawGame();
})();
