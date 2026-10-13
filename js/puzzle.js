/* Puzzles de Lógica y Formas Mágicas con Cinnamoroll
 * Juego de razonamiento espacial, asociación visual y tangram preescolar para Amanda (5 años).
 * 
 * Protagonistas de Sanrio:
 *  1. Cinnamoroll y su Taza de Té
 *  2. Milk y su Biberón Mágico
 *  3. Pompompurin y su Flan de Caramelo
 *  4. Mocha y su Pastel de Fresa
 *  5. Chiffon en el Jardín de Flores
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const PUZZLES = [
    {
      id: 'cinna_cup',
      title: 'Cinnamoroll en la Taza de Café',
      charName: 'Cinnamoroll',
      imgSrc: 'assets/cinnamoroll_fly.png',
      themeColor: '#0288d1',
      bgGrad: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
      badge: '☕ Té y Canela',
      desc: 'Encaja las piezas de porcelana y galleta para armar a Cinnamoroll volando sobre su taza.',
      pieces: [
        { id: 'p1', shape: 'circle', label: 'Cabeza Nube', color: '#ffffff', border: '#93c5fd', slotX: 180, slotY: 70, size: 80, emoji: '☁️' },
        { id: 'p2', shape: 'ear_left', label: 'Oreja Izquierda', color: '#ffffff', border: '#93c5fd', slotX: 90, slotY: 60, size: 75, emoji: '🪽' },
        { id: 'p3', shape: 'ear_right', label: 'Oreja Derecha', color: '#ffffff', border: '#93c5fd', slotX: 270, slotY: 60, size: 75, emoji: '🪽' },
        { id: 'p4', shape: 'cup', label: 'Taza Pastel', color: '#ffb6d5', border: '#f43f5e', slotX: 160, slotY: 160, size: 120, emoji: '☕' },
        { id: 'p5', shape: 'star', label: 'Estrella Mágica', color: '#fde047', border: '#ca8a04', slotX: 300, slotY: 180, size: 55, emoji: '⭐' }
      ]
    },
    {
      id: 'milk_baby',
      title: 'Milk y su Biberón de Leche',
      charName: 'Milk',
      imgSrc: 'assets/milk_teddy.png',
      themeColor: '#6366f1',
      bgGrad: 'linear-gradient(135deg, #eef2ff, #c7d2fe)',
      badge: '🍼 Dulce Bebé',
      desc: 'Encaja las figuras para ayudar a Milk a preparar su merienda con su osito de peluche.',
      pieces: [
        { id: 'p1', shape: 'circle', label: 'Carita de Bebé', color: '#ffffff', border: '#a5b4fc', slotX: 180, slotY: 60, size: 85, emoji: '👶' },
        { id: 'p2', shape: 'pacifier', label: 'Chupete Celeste', color: '#93c5fd', border: '#3b82f6', slotX: 195, slotY: 105, size: 50, emoji: '💠' },
        { id: 'p3', shape: 'teddy', label: 'Osito de Peluche', color: '#fed7aa', border: '#ea580c', slotX: 100, slotY: 150, size: 75, emoji: '🧸' },
        { id: 'p4', shape: 'bottle', label: 'Biberón Dulce', color: '#ffffff', border: '#60a5fa', slotX: 260, slotY: 140, size: 80, emoji: '🍼' },
        { id: 'p5', shape: 'heart', label: 'Corazón Rosa', color: '#f472b6', border: '#db2777', slotX: 185, slotY: 200, size: 60, emoji: '💖' }
      ]
    },
    {
      id: 'purin_flan',
      title: 'Pompompurin y su Flan Gigante',
      charName: 'Pompompurin',
      imgSrc: 'assets/pompompurin.png',
      themeColor: '#d97706',
      bgGrad: 'linear-gradient(135deg, #fffbeb, #fde68a)',
      badge: '🍮 Flan Dorado',
      desc: 'Ordena la boina de chocolate y el delicioso pudín de caramelo con cereza.',
      pieces: [
        { id: 'p1', shape: 'beret', label: 'Boina Chocolate', color: '#78350f', border: '#451a03', slotX: 185, slotY: 35, size: 70, emoji: '🎩' },
        { id: 'p2', shape: 'circle', label: 'Carita Dorada', color: '#fef08a', border: '#ca8a04', slotX: 175, slotY: 85, size: 90, emoji: '🐶' },
        { id: 'p3', shape: 'flan', label: 'Flan de Caramelo', color: '#fde047', border: '#b45309', slotX: 160, slotY: 180, size: 120, emoji: '🍮' },
        { id: 'p4', shape: 'cherry', label: 'Cereza Dulce', color: '#ef4444', border: '#991b1b', slotX: 205, slotY: 160, size: 40, emoji: '🍒' },
        { id: 'p5', shape: 'cookie', label: 'Galletita Miel', color: '#fed7aa', border: '#c2410c', slotX: 95, slotY: 175, size: 60, emoji: '🍪' }
      ]
    },
    {
      id: 'mocha_tea',
      title: 'Mocha en el Salón de Té',
      charName: 'Mocha',
      imgSrc: 'assets/mocha.png',
      themeColor: '#9333ea',
      bgGrad: 'linear-gradient(135deg, #faf5ff, #e9d5ff)',
      badge: '🎀 Lazos y Rosas',
      desc: 'Encaja las flores y el pastel para la fiesta del té de la elegante Mocha.',
      pieces: [
        { id: 'p1', shape: 'circle', label: 'Carita Mocha', color: '#e2d5c3', border: '#8c6b53', slotX: 180, slotY: 70, size: 85, emoji: '🌸' },
        { id: 'p2', shape: 'flower', label: 'Flor Rosa', color: '#f472b6', border: '#be185d', slotX: 235, slotY: 45, size: 50, emoji: '🌺' },
        { id: 'p3', shape: 'ribbon', label: 'Lazo Elegante', color: '#ec4899', border: '#9d174d', slotX: 190, slotY: 155, size: 65, emoji: '🎀' },
        { id: 'p4', shape: 'cake', label: 'Pastel Fresa', color: '#fbcfe8', border: '#db2777', slotX: 100, slotY: 165, size: 80, emoji: '🍰' },
        { id: 'p5', shape: 'teapot', label: 'Tetera Pastel', color: '#c084fc', border: '#7e22ce', slotX: 265, slotY: 155, size: 85, emoji: '🫖' }
      ]
    },
    {
      id: 'chiffon_meadow',
      title: 'Chiffon en el Jardín de Flores',
      charName: 'Chiffon',
      imgSrc: 'assets/chiffon.png',
      themeColor: '#db2777',
      bgGrad: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)',
      badge: '🌸 Nube Saltarina',
      desc: 'Arma las nubes esponjosas y las mariposas del prado de Chiffon.',
      pieces: [
        { id: 'p1', shape: 'circle', label: 'Carita Chiffon', color: '#fce7f3', border: '#f43f5e', slotX: 180, slotY: 75, size: 85, emoji: '☁️' },
        { id: 'p2', shape: 'cloud_l', label: 'Oreja Nube Izq', color: '#ffffff', border: '#f472b6', slotX: 95, slotY: 65, size: 80, emoji: '☁️' },
        { id: 'p3', shape: 'cloud_r', label: 'Oreja Nube Der', color: '#ffffff', border: '#f472b6', slotX: 265, slotY: 65, size: 80, emoji: '☁️' },
        { id: 'p4', shape: 'rainbow', label: 'Arcoíris Mágico', color: '#fbcfe8', border: '#ec4899', slotX: 150, slotY: 175, size: 140, emoji: '🌈' },
        { id: 'p5', shape: 'butterfly', label: 'Mariposa Alada', color: '#c084fc', border: '#9333ea', slotX: 100, slotY: 160, size: 55, emoji: '🦋' }
      ]
    }
  ];

  class ShapeLogicPuzzleGame {
    constructor() {
      this.container = null;
      this.currentPuzzleIdx = 0;
      this.placedPieces = {}; // id -> true
      this.selectedPieceId = null;
    }

    init(containerEl) {
      this.container = containerEl;
      this.currentPuzzleIdx = 0;
      this.loadPuzzle(0);
      this.render();
    }

    loadPuzzle(idx) {
      this.currentPuzzleIdx = idx;
      this.placedPieces = {};
      this.selectedPieceId = null;
    }

    speak(text) {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'es-ES';
          u.rate = 0.88;
          u.pitch = 1.3;
          window.speechSynthesis.speak(u);
        } catch (_) {}
      }
    }

    render() {
      const p = PUZZLES[this.currentPuzzleIdx];
      const allDone = p.pieces.every(pc => this.placedPieces[pc.id]);

      this.container.innerHTML = `
        <div class="puzzle-wrap">
          <!-- Barra superior de selección de puzzles -->
          <div class="puzzle-top-bar">
            <div class="puzzle-pills-row">
              ${PUZZLES.map((item, idx) => `
                <button class="puzzle-tab-btn ${idx === this.currentPuzzleIdx ? 'active' : ''}" data-idx="${idx}">
                  ${item.badge}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Escenario Central del Rompecabezas -->
          <div class="puzzle-stage-card" style="background: ${p.bgGrad}">
            <div class="puzzle-header-info">
              <div class="puzzle-mascot-avatar">
                <img src="${p.imgSrc}" alt="${p.charName}" />
              </div>
              <div class="puzzle-title-box">
                <span class="puzzle-badge-pill">${p.badge}</span>
                <h1 style="color: ${p.themeColor}">${p.title}</h1>
                <p>${p.desc}</p>
              </div>
            </div>

            <!-- Tablero de Encaje Montessori y Bandeja de Piezas -->
            <div class="puzzle-gameplay-stage">
              <!-- Tablero con Siluetas de Madera / Galleta -->
              <div class="puzzle-board-frame">
                <div class="puzzle-board-canvas-box" id="puzzleBoardBox">
                  ${p.pieces.map(pc => {
                    const isPlaced = !!this.placedPieces[pc.id];
                    return `
                      <div class="puzzle-slot ${isPlaced ? 'placed' : 'empty'}" 
                           data-piece-id="${pc.id}"
                           style="left: ${pc.slotX}px; top: ${pc.slotY}px; width: ${pc.size}px; height: ${pc.size}px; border-color: ${pc.border};">
                        <span class="slot-shadow-emoji">${pc.emoji}</span>
                        ${isPlaced ? `
                          <div class="slot-placed-token" style="background: ${pc.color}; border: 3px solid ${pc.border};">
                            <span class="token-emoji">${pc.emoji}</span>
                          </div>
                        ` : `
                          <div class="slot-dotted-guide"></div>
                        `}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Bandeja de Piezas Móviles de Galleta -->
              <div class="puzzle-pieces-tray">
                <div class="tray-title-tag">✨ Piezas para encajar:</div>
                <div class="pieces-bank-list">
                  ${p.pieces.map(pc => {
                    const isPlaced = !!this.placedPieces[pc.id];
                    const isSelected = (this.selectedPieceId === pc.id);
                    if (isPlaced) return '';
                    return `
                      <button class="puzzle-piece-token ${isSelected ? 'selected' : ''}" 
                              data-piece-id="${pc.id}"
                              style="background: ${pc.color}; border: 3px solid ${pc.border};">
                        <span class="token-emoji">${pc.emoji}</span>
                        <span class="token-label">${pc.label}</span>
                      </button>
                    `;
                  }).join('')}
                  ${allDone ? `
                    <div class="puzzle-tray-complete-badge">
                      🎉 ¡Completaste todas las piezas!
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
    }

    bindEvents() {
      // 1. Selector de puzzles
      this.container.querySelectorAll('.puzzle-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          const idx = parseInt(e.currentTarget.dataset.idx, 10);
          this.loadPuzzle(idx);
          this.render();
          this.speak(PUZZLES[idx].title);
        });
      });

      // 2. Clic en pieza de la bandeja
      this.container.querySelectorAll('.puzzle-piece-token').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          const pieceId = e.currentTarget.dataset.pieceId;
          this.selectedPieceId = (this.selectedPieceId === pieceId) ? null : pieceId;
          A.bubblePop(2);
          this.render();
        });
      });

      // 3. Clic en slot del tablero
      this.container.querySelectorAll('.puzzle-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
          const slotPieceId = e.currentTarget.dataset.pieceId;
          if (this.placedPieces[slotPieceId]) return; // Ya colocada

          A.unlock();
          if (this.selectedPieceId) {
            // Intentar encajar la pieza seleccionada
            if (this.selectedPieceId === slotPieceId) {
              this.placePieceSuccess(slotPieceId);
            } else {
              // Pieza equivocada para este molde: aviso elástico amigable
              A.softBoing();
              e.currentTarget.classList.add('wobble-friendly');
              setTimeout(() => e.currentTarget.classList.remove('wobble-friendly'), 500);
            }
          } else {
            // Si Amanda toca directo el slot vacío sin haber seleccionado antes la pieza,
            // automáticamente buscamos la pieza correspondiente y la encajamos (asistencia gentil preescolar)
            this.placePieceSuccess(slotPieceId);
          }
        });
      });

      // 4. Botón reiniciar puzzle
      const btnReset = this.container.querySelector('#btnResetPuzzle');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          this.loadPuzzle(this.currentPuzzleIdx);
          this.render();
        });
      }
    }

    placePieceSuccess(pieceId) {
      const p = PUZZLES[this.currentPuzzleIdx];
      const piece = p.pieces.find(pc => pc.id === pieceId);
      if (!piece) return;

      this.placedPieces[pieceId] = true;
      this.selectedPieceId = null;

      // Sonido musical de campanita y éxito
      const count = Object.keys(this.placedPieces).length;
      A.collect(count);
      A.sparkleChime();
      this.speak(piece.label);

      this.render();

      // Verificar si completó el puzzle entero
      const allDone = p.pieces.every(pc => this.placedPieces[pc.id]);
      if (allDone) {
        setTimeout(() => {
          this.triggerPuzzleVictory();
        }, 400);
      }
    }

    triggerPuzzleVictory() {
      const p = PUZZLES[this.currentPuzzleIdx];
      A.celebrate();
      this.speak(`¡Hurra Amanda! ¡Completaste el puzzle de ${p.charName}!`);

      const modal = document.createElement('div');
      modal.className = 'w-victory-modal-overlay';
      modal.innerHTML = `
        <div class="w-victory-card">
          <div class="w-victory-badge">🧩 ¡ROMPECABEZAS MÁGICO COMPLETADO! 🧩</div>
          <h2 style="color: ${p.themeColor}">${p.title}</h2>
          <div class="w-victory-img-box">
            <img src="${p.imgSrc}" alt="${p.charName}" />
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
        const nextIdx = (this.currentPuzzleIdx + 1) % PUZZLES.length;
        this.loadPuzzle(nextIdx);
        this.render();
        this.speak(PUZZLES[nextIdx].title);
      });

      modal.querySelector('#btnRepeatPuzzleModal').addEventListener('click', () => {
        A.unlock();
        modal.remove();
        this.loadPuzzle(this.currentPuzzleIdx);
        this.render();
      });
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.puzzleGame = new ShapeLogicPuzzleGame();
})();
