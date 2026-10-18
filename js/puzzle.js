/* Puzzles de Lógica y Rompecabezas Visuales con Cinnamoroll
 * Diseñado y calibrado para niñas de 5 a 8 años (Kínder a 3° Básico).
 * 
 * Enfoque Pedagógico Progresivo (5 a 8 Años):
 *  1. Dificultad Adaptativa de Piezas:
 *     - 🧩 6 Piezas (3x2): 5-6 años (Kínder)
 *     - ⭐ 9 Piezas (3x3): 6-7 años (1° Básico)
 *     - 👑 12 Piezas (4x3): 7-8 años (2° Básico)
 *     - 💎 16 Piezas (4x4): 8+ años (3° Básico - Desafío Experta)
 *  2. Ojo Mágico (Silueta Guía Conmutable ON/OFF):
 *     - Modo Desafío (OFF): tablero de madera limpia solo con rejilla de encaje (fomenta la deducción mental de primaria).
 *     - Modo Pista (ON): silueta translúcida al 28% de apoyo.
 *  3. Temporizador amigable y estrellas de logro para autosuperación.
 *  4. Arrastre táctil fluido (Pointer Events), encaje magnético y asistencia de toque rápido.
 *  5. 100% visual y libre de bloqueos frustrantes.
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

  class SeniorSchoolJigsawGame {
    constructor() {
      this.container = null;
      this.currentCharIdx = 0;
      this.pieceCountMode = 6; // 6, 9, 12, 16
      this.showGhostGuide = true; // Interruptor Ojo Mágico
      this.placedPieces = {}; // pieceId -> true
      this.trayPieces = []; // array de piezas en bandeja
      this.boardWidth = 440;
      this.boardHeight = 304;
      this.activeDrag = null;
      this.currentDragCleanup = null;

      // Temporizador amistoso
      this.timerSeconds = 0;
      this.timerInterval = null;
    }

    getCurrentChar() {
      return PUZZLE_CHARACTERS[this.currentCharIdx];
    }

    stop() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.cleanupActiveDrag();
    }

    cleanupActiveDrag() {
      if (this.currentDragCleanup) {
        try { this.currentDragCleanup(); } catch (_) {}
        this.currentDragCleanup = null;
      }
      document.querySelectorAll('.puzzle-piece-drag-clone').forEach(el => el.remove());
      if (this.container) {
        this.container.querySelectorAll('.tray-token-dragging').forEach(el => el.classList.remove('tray-token-dragging'));
        this.container.querySelectorAll('.slot-magnet-match').forEach(el => el.classList.remove('slot-magnet-match'));
      }
      this.activeDrag = null;
    }

    init(containerEl) {
      this.stop();
      this.container = containerEl;
      this.currentCharIdx = 0;
      this.pieceCountMode = 6;
      this.showGhostGuide = true;
      this.loadPuzzle(0, 6);
      this.render();
    }

    getGridDimensions(pieceCount) {
      switch (pieceCount) {
        case 6:  return { cols: 3, rows: 2 };
        case 9:  return { cols: 3, rows: 3 };
        case 12: return { cols: 4, rows: 3 };
        case 16: return { cols: 4, rows: 4 };
        default: return { cols: 3, rows: 2 };
      }
    }

    loadPuzzle(charIdx, pieceCount = 6) {
      this.cleanupActiveDrag();
      this.currentCharIdx = charIdx;
      this.pieceCountMode = pieceCount;
      this.placedPieces = {};
      this.activeDrag = null;

      // Dimensiones adaptativas de pantalla
      const availW = this.container && this.container.clientWidth ? this.container.clientWidth : window.innerWidth;
      const targetW = Math.min(460, Math.max(290, availW - 48));
      this.boardWidth = targetW;
      this.boardHeight = Math.round(targetW * (304 / 440));

      const { cols, rows } = this.getGridDimensions(pieceCount);

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

      this.trayPieces = [...pieces].sort(() => Math.random() - 0.5);

      // Reiniciar temporizador amistoso
      this.timerSeconds = 0;
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.timerSeconds++;
        const timerEl = this.container ? this.container.querySelector('#puzzleTimerText') : null;
        if (timerEl) {
          const mins = Math.floor(this.timerSeconds / 60);
          const secs = this.timerSeconds % 60;
          timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
      }, 1000);
    }

    speak(text) {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'es-ES';
          u.rate = 0.88;
          u.pitch = 1.25;
          window.speechSynthesis.speak(u);
        } catch (_) {}
      }
    }

    render() {
      this.cleanupActiveDrag();
      const char = PUZZLE_CHARACTERS[this.currentCharIdx];
      const { cols, rows } = this.getGridDimensions(this.pieceCountMode);
      const slotW = this.boardWidth / cols;
      const slotH = this.boardHeight / rows;
      const totalPieces = cols * rows;
      const allDone = Object.keys(this.placedPieces).length === totalPieces;

      const mins = Math.floor(this.timerSeconds / 60);
      const secs = this.timerSeconds % 60;
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      this.container.innerHTML = `
        <div class="puzzle-wrap">
          <!-- Barra superior de selección -->
          <div class="puzzle-top-bar">
            <!-- Selector de personajes -->
            <div class="puzzle-pills-row">
              ${PUZZLE_CHARACTERS.map((item, idx) => `
                <button class="puzzle-tab-btn ${idx === this.currentCharIdx ? 'active' : ''}" data-idx="${idx}">
                  ${item.badge}
                </button>
              `).join('')}
            </div>

            <!-- Selector de Dificultad para 5 a 8 Años -->
            <div class="puzzle-difficulty-row">
              <span class="diff-title-tag">🧩 Nivel:</span>
              <button class="puz-diff-btn ${this.pieceCountMode === 6 ? 'active' : ''}" data-pieces="6">
                🌸 6 Piezas (5-6 años)
              </button>
              <button class="puz-diff-btn ${this.pieceCountMode === 9 ? 'active' : ''}" data-pieces="9">
                ⭐ 9 Piezas (6-7 años)
              </button>
              <button class="puz-diff-btn ${this.pieceCountMode === 12 ? 'active' : ''}" data-pieces="12">
                👑 12 Piezas (7-8 años)
              </button>
              <button class="puz-diff-btn ${this.pieceCountMode === 16 ? 'active' : ''}" data-pieces="16">
                💎 16 Piezas (8+ años)
              </button>
            </div>
          </div>

          <!-- Escenario Central -->
          <div class="puzzle-stage-card ${allDone ? 'puzzle-completed-glow' : ''}" style="background: ${char.bgGrad}">
            <!-- Encabezado con estado y botón Marca de Agua -->
            <div class="puzzle-header-info">
              <div class="puzzle-mascot-avatar">
                <img src="${char.avatarImg}" alt="${char.name}" />
              </div>
              <div class="puzzle-title-box">
                <div class="puzzle-badges-top-line">
                  <span class="puzzle-badge-pill">${char.badge} · ${this.pieceCountMode} piezas</span>
                  <span class="puzzle-timer-pill">⏱️ <span id="puzzleTimerText">${timeStr}</span></span>
                </div>
                <h1 style="color: ${char.themeColor}">${char.title}</h1>
                <p>👇 Arrastra las piezas de madera a su lugar en el cuadro:</p>
              </div>

              <!-- Interruptor Marca de Agua (Silueta Sutil ON/OFF) -->
              <button class="btn-ghost-toggle ${this.showGhostGuide ? 'active' : ''}" id="btnToggleGhost" title="Activar o desactivar marca de agua de ayuda">
                ${this.showGhostGuide ? '💧 Marca de agua: ON' : '🙈 Marca de agua: OFF (Desafío)'}
              </button>
            </div>

            <!-- Zona de Juego: Tablero y Bandeja -->
            <div class="puzzle-gameplay-stage">
              <!-- Tablero con Marco de Madera y Guía Opcional -->
              <div class="puzzle-board-frame">
                <div class="puzzle-board-box ${this.showGhostGuide ? 'with-ghost' : 'no-ghost'}" 
                     id="puzzleBoardBox"
                     style="width: ${this.boardWidth}px; height: ${this.boardHeight}px; --guide-bg: url('${char.imgSrc}');">
                  
                  <!-- Rejilla de ranuras del tablero -->
                  ${this.renderBoardSlots(cols, rows, slotW, slotH, char.imgSrc)}
                </div>
              </div>

              <!-- Bandeja Inferior de Piezas de Madera -->
              <div class="puzzle-pieces-tray">
                <div class="tray-title-tag">
                  ✨ Piezas por encajar (${Object.keys(this.placedPieces).length} / ${totalPieces}):
                </div>

                <div class="pieces-bank-list" id="puzzlePiecesBank">
                  ${this.trayPieces.map(piece => {
                    const isPlaced = !!this.placedPieces[piece.id];
                    if (isPlaced) return '';
                    return this.renderTrayPiece(piece, cols, rows, slotW, slotH, char.imgSrc);
                  }).join('')}

                  ${allDone ? `
                    <div class="puzzle-tray-complete-badge">
                      🎉 ¡Brillante! ¡Completaste el rompecabezas de ${this.pieceCountMode} piezas!
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

      if (window.Cinnamo?.controllerBridge?.broadcastGameContext) {
        window.Cinnamo.controllerBridge.broadcastGameContext({
          screen: 'puzzle',
          charName: char.name,
          placedCount: Object.keys(this.placedPieces).length,
          totalPieces
        });
      }
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
                  <span class="slot-coord-guide">${c + 1},${r + 1}</span>
                </div>
              `}
            </div>
          `;
        }
      }
      return html;
    }

    renderTrayPiece(piece, cols, rows, slotW, slotH, imgSrc) {
      // Escala visual adaptativa para que quepan holgadamente en la bandeja
      let scale = 0.75;
      if (this.pieceCountMode === 9) scale = 0.70;
      if (this.pieceCountMode === 12) scale = 0.65;
      if (this.pieceCountMode === 16) scale = 0.58;

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

      // 2. Selector de dificultad (6, 9, 12, 16 piezas)
      this.container.querySelectorAll('.puz-diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(2);
          const count = parseInt(e.currentTarget.dataset.pieces, 10);
          this.loadPuzzle(this.currentCharIdx, count);
          this.render();
        });
      });

      // 3. Alternar Silueta Guía (Ojo Mágico ON/OFF)
      const btnGhost = this.container.querySelector('#btnToggleGhost');
      if (btnGhost) {
        btnGhost.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          this.showGhostGuide = !this.showGhostGuide;
          this.render();
        });
      }

      // 4. Toque directo en slot vacío del tablero
      this.container.querySelectorAll('.puzzle-board-slot.empty').forEach(slot => {
        slot.addEventListener('click', (e) => {
          const targetPieceId = e.currentTarget.dataset.pieceId;
          if (this.placedPieces[targetPieceId]) return;

          A.unlock();
          this.placePieceSuccess(targetPieceId);
        });
      });

      // 5. Botón reiniciar puzzle
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
       ARRASTRE TÁCTIL Y ENCAJE MAGNÉTICO ROBUSTO (POINTER EVENTS)
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
          this.cleanupActiveDrag();

          A.unlock();
          A.bubblePop(1);

          const pointerId = e.pointerId;
          if (token.setPointerCapture) {
            try { token.setPointerCapture(pointerId); } catch (_) {}
          }

          const isTouch = e.pointerType === 'touch';
          const touchOffsetY = isTouch ? -32 : 0;

          const clone = document.createElement('div');
          clone.className = 'puzzle-piece-drag-clone';
          clone.style.width = `${slotW}px`;
          clone.style.height = `${slotH}px`;
          clone.style.left = `${e.clientX}px`;
          clone.style.top = `${e.clientY + touchOffsetY}px`;
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
          const magnetRadius = Math.max(72, Math.max(slotW, slotH) * 0.88);

          const dragState = {
            pointerId,
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
            if (Math.hypot(dx, dy) > 8) {
              dragState.moved = true;
            }

            const currentX = moveEv.clientX;
            const currentY = moveEv.clientY + touchOffsetY;
            clone.style.left = `${currentX}px`;
            clone.style.top = `${currentY}px`;

            if (targetSlot) {
              const r = targetSlot.getBoundingClientRect();
              const cx = r.left + r.width / 2;
              const cy = r.top + r.height / 2;
              const dist = Math.hypot(currentX - cx, currentY - cy);

              if (dist <= magnetRadius) {
                dragState.isOverTarget = true;
                targetSlot.classList.add('slot-magnet-match');
              } else {
                dragState.isOverTarget = false;
                targetSlot.classList.remove('slot-magnet-match');
              }
            }
          };

          const finishDrag = (upEv) => {
            if (this.currentDragCleanup) {
              this.currentDragCleanup();
              this.currentDragCleanup = null;
            }

            const cur = this.activeDrag;
            this.activeDrag = null;
            if (!cur) return;

            cur.token.classList.remove('tray-token-dragging');
            if (cur.targetSlot) cur.targetSlot.classList.remove('slot-magnet-match');

            // Tap rápido sin arrastre -> asistencia de toque para niñas de 5 a 8 años
            if (!cur.moved) {
              cur.clone.remove();
              this.placePieceSuccess(cur.pieceId);
              return;
            }

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

            // Si soltó en lugar incorrecto o fuera, regresa suave a la bandeja
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

          const cleanup = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', finishDrag);
            window.removeEventListener('pointercancel', finishDrag);
            if (token.releasePointerCapture) {
              try { token.releasePointerCapture(pointerId); } catch (_) {}
            }
          };

          this.currentDragCleanup = cleanup;
          window.addEventListener('pointermove', onMove, { passive: false });
          window.addEventListener('pointerup', finishDrag);
          window.addEventListener('pointercancel', finishDrag);
        });
      });
    }

    placePieceSuccess(pieceId) {
      if (this.placedPieces[pieceId]) return;

      this.placedPieces[pieceId] = true;
      const count = Object.keys(this.placedPieces).length;
      const total = this.pieceCountMode;

      A.bellChime(500 + count * 45);
      A.sparkleChime();

      const cheers = ['¡Excelente!', '¡Genial!', '¡Qué bien!', '¡Perfecto!', '¡Bravo Amanda!'];
      if (count < total && count % 2 === 0) {
        this.speak(cheers[count % cheers.length]);
      }

      this.render();

      const slotEl = this.container.querySelector(`#slot_${pieceId}`);
      if (slotEl) {
        this.spawnStarsOnSlot(slotEl);
      }

      if (count >= total) {
        if (this.timerInterval) clearInterval(this.timerInterval);
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
        (this.container || document.body).appendChild(star);
        setTimeout(() => star.remove(), 650);
      }
    }

    triggerVictory() {
      const char = PUZZLE_CHARACTERS[this.currentCharIdx];
      const mins = Math.floor(this.timerSeconds / 60);
      const secs = this.timerSeconds % 60;
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      A.celebrate();
      // Más piezas, más estrellas: 6→3, 9→4, 12→5, 16→6
      const puzzleStars = { 6: 3, 9: 4, 12: 5, 16: 6 }[this.pieceCountMode] || 3;
      window.Cinnamo?.passport?.addStars?.(puzzleStars, 'puzzle');
      this.speak(`¡Hurra Amanda! ¡Completaste el rompecabezas de ${this.pieceCountMode} piezas de ${char.name} en ${this.timerSeconds} segundos!`);

      const modal = document.createElement('div');
      modal.className = 'w-victory-modal-overlay';
      modal.innerHTML = `
        <div class="w-victory-card">
          <div class="w-victory-badge">🧩 ¡ROMPECABEZAS ${this.pieceCountMode} PIEZAS COMPLETADO! 🧩</div>
          <h2 style="color: ${char.themeColor}">${char.title}</h2>
          <div class="w-victory-img-box">
            <img src="${char.imgSrc}" alt="${char.name}" style="border-radius: 16px; border: 3px solid #fbcfe8;" />
          </div>
          <p>¡Amanda, tiempo récord: <strong>${timeStr}</strong>! ¡Eres una experta de la lógica en Cinnamoroll Land! 💖 ⭐⭐⭐</p>
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

    toggleGhost() {
      A.unlock();
      A.bubblePop(1);
      this.showGhostGuide = !this.showGhostGuide;
      this.render();
    }

    toggleEye() {
      this.toggleGhost();
    }

    nextCharacter() {
      A.unlock();
      if (this.container) {
        const nextModalBtn = this.container.querySelector('#btnNextPuzzleModal');
        if (nextModalBtn) {
          nextModalBtn.click();
          return;
        }
      }
      A.bubblePop(1);
      const nextIdx = (this.currentCharIdx + 1) % PUZZLE_CHARACTERS.length;
      this.loadPuzzle(nextIdx, this.pieceCountMode);
      this.render();
      this.speak(PUZZLE_CHARACTERS[nextIdx].voiceIntro);
    }

    placeNextPiece() {
      if (this.container) {
        const nextModalBtn = this.container.querySelector('#btnNextPuzzleModal');
        if (nextModalBtn) {
          nextModalBtn.click();
          return;
        }
      }
      const nextPiece = this.trayPieces.find(p => !this.placedPieces[p.id]);
      if (nextPiece) {
        A.unlock();
        this.placePieceSuccess(nextPiece.id);
      }
    }

    resetPuzzle() {
      A.unlock();
      A.bubblePop(1);
      this.loadPuzzle(this.currentCharIdx, this.pieceCountMode);
      this.render();
    }

    selectCharacterById(charId) {
      A.unlock();
      A.bubblePop(2);
      const map = { cinna: 0, milk: 1, chiffon: 2, purin: 3, mocha: 4 };
      const idx = map[charId] !== undefined ? map[charId] : 0;
      if (this.container) {
        const modal = this.container.querySelector('.w-victory-modal-overlay');
        if (modal) modal.remove();
      }
      this.loadPuzzle(idx, this.pieceCountMode);
      this.render();
      if (PUZZLE_CHARACTERS[idx]) this.speak(PUZZLE_CHARACTERS[idx].voiceIntro);
    }

    setDifficultyPieces(pieces) {
      const p = parseInt(pieces, 10);
      if (![6, 9, 12, 16].includes(p)) return;
      A.unlock();
      A.bubblePop(2);
      this.loadPuzzle(this.currentCharIdx, p);
      this.render();
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.puzzleGame = new SeniorSchoolJigsawGame();
})();
