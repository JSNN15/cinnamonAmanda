/* Palabras Mágicas · Taller Waldorf & Montessori de Escritura
 * Diseñado especialmente para Amanda (5 años).
 * 
 * Enfoque pedagógico preescolar:
 *  1. Alfabeto Móvil Montessori: galletitas de letras que se pueden ARRASTRAR libremente
 *     con el dedito o ratón, con atracción magnética hacia el molde correcto, y toque rápido asistido.
 *  2. Fónica dulce y voz cálida: pronuncia el sonido de cada letra al tocarla y la palabra completa al terminar.
 *  3. Trazado Sensorial con Dedo: letras gigantes guiadas por estrellas luminosas sobre pizarra.
 *  4. Pizarra Libre de Tizas Pastel: dibujo libre con esponjita para borrar y colores pastel.
 *  5. Cero frustración: sin penalizaciones ni cronómetros; refuerzo positivo constante.
 * 
 * Vocabulario afectivo y Sanrio:
 *  - Familia: MAMÁ, PAPÁ, AMANDA, AMOR
 *  - Amigos: CINNAMOROLL, MILK, PURIN, MOCHA, CHIFFON
 *  - Naturaleza dulce: SOL, NUBE, FLOR, PASTEL
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const WORDS = [
    // 💖 Familia y Amanda
    {
      id: 'mama',
      cat: 'familia',
      catName: '💖 Familia',
      word: 'MAMÁ',
      letters: ['M', 'A', 'M', 'Á'],
      phonetic: 'Ma - má',
      icon: '👩‍👧',
      img: 'assets/cinnamoroll_fly.png',
      desc: '¡La persona más dulce y amorosa del mundo!',
      color: '#ff69b4',
      bgGrad: 'linear-gradient(135deg, #ffeef8, #ffd1e8)'
    },
    {
      id: 'papa',
      cat: 'familia',
      catName: '💖 Familia',
      word: 'PAPÁ',
      letters: ['P', 'A', 'P', 'Á'],
      phonetic: 'Pa - pá',
      icon: '👨‍👧',
      img: 'assets/pompompurin_hq.png',
      desc: '¡El mejor papá, fuerte y cariñoso!',
      color: '#3b82f6',
      bgGrad: 'linear-gradient(135deg, #eff6ff, #bfdbfe)'
    },
    {
      id: 'amanda',
      cat: 'familia',
      catName: '💖 Amanda',
      word: 'AMANDA',
      letters: ['A', 'M', 'A', 'N', 'D', 'A'],
      phonetic: 'A - man - da',
      icon: '👑',
      img: 'assets/cinnamoroll_fly.png',
      desc: '¡Amanda, la princesa más alegre y linda!',
      color: '#ec4899',
      isAmanda: true,
      bgGrad: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)'
    },
    {
      id: 'amor',
      cat: 'familia',
      catName: '💖 Familia',
      word: 'AMOR',
      letters: ['A', 'M', 'O', 'R'],
      phonetic: 'A - mor',
      icon: '💖',
      img: 'assets/milk_teddy.png',
      desc: '¡Mucho cariño y abrazos de nube!',
      color: '#f43f5e',
      bgGrad: 'linear-gradient(135deg, #fff1f2, #fecdd3)'
    },

    // 🐶 Amigos de Sanrio
    {
      id: 'cinna',
      cat: 'amigos',
      catName: '🐶 Amigos Sanrio',
      word: 'CINNAMOROLL',
      letters: ['C', 'I', 'N', 'N', 'A', 'M', 'O', 'R', 'O', 'L', 'L'],
      phonetic: 'Cin - na - mo - roll',
      icon: '🪽',
      img: 'assets/cinnamoroll_fly.png',
      desc: '¡Cinnamoroll vuela suave por el cielo con sus orejas!',
      color: '#0288d1',
      bgGrad: 'linear-gradient(135deg, #f0f9ff, #bae6fd)'
    },
    {
      id: 'milk',
      cat: 'amigos',
      catName: '🐶 Amigos Sanrio',
      word: 'MILK',
      letters: ['M', 'I', 'L', 'K'],
      phonetic: 'Milk',
      icon: '🍼',
      img: 'assets/milk_teddy.png',
      desc: '¡El perrito bebé con su chupete y su osito!',
      color: '#6366f1',
      bgGrad: 'linear-gradient(135deg, #eef2ff, #c7d2fe)'
    },
    {
      id: 'purin',
      cat: 'amigos',
      catName: '🐶 Amigos Sanrio',
      word: 'PURIN',
      letters: ['P', 'U', 'R', 'I', 'N'],
      phonetic: 'Pu - rin',
      icon: '🍮',
      img: 'assets/pompompurin_hq.png',
      desc: '¡Pompompurin y su rica boina de chocolate!',
      color: '#d97706',
      bgGrad: 'linear-gradient(135deg, #fffbeb, #fde68a)'
    },
    {
      id: 'mocha',
      cat: 'amigos',
      catName: '🐶 Amigos Sanrio',
      word: 'MOCHA',
      letters: ['M', 'O', 'C', 'H', 'A'],
      phonetic: 'Mo - cha',
      icon: '🎀',
      img: 'assets/mocha_hq.png',
      desc: '¡La amiga elegante con flor rosa y orejitas largas!',
      color: '#9333ea',
      bgGrad: 'linear-gradient(135deg, #faf5ff, #e9d5ff)'
    },
    {
      id: 'chiffon',
      cat: 'amigos',
      catName: '🐶 Amigos Sanrio',
      word: 'CHIFFON',
      letters: ['C', 'H', 'I', 'F', 'F', 'O', 'N'],
      phonetic: 'Chif - fon',
      icon: '🌸',
      img: 'assets/chiffon.png',
      desc: '¡La perrita saltarina con orejas esponjosas de nube!',
      color: '#db2777',
      bgGrad: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)'
    },

    // 🌸 Palabras Dulces
    {
      id: 'sol',
      cat: 'dulces',
      catName: '🌸 Palabras Dulces',
      word: 'SOL',
      letters: ['S', 'O', 'L'],
      phonetic: 'Sol',
      icon: '☀️',
      img: 'assets/pompompurin_hq.png',
      desc: '¡El sol calienta y alegra la mañana!',
      color: '#eab308',
      bgGrad: 'linear-gradient(135deg, #fefce8, #fef08a)'
    },
    {
      id: 'nube',
      cat: 'dulces',
      catName: '🌸 Palabras Dulces',
      word: 'NUBE',
      letters: ['N', 'U', 'B', 'E'],
      phonetic: 'Nu - be',
      icon: '☁️',
      img: 'assets/cinnamoroll_fly.png',
      desc: '¡Las nubes de algodón donde descansa Cinnamoroll!',
      color: '#38bdf8',
      bgGrad: 'linear-gradient(135deg, #f0f9ff, #bae6fd)'
    },
    {
      id: 'flor',
      cat: 'dulces',
      catName: '🌸 Palabras Dulces',
      word: 'FLOR',
      letters: ['F', 'L', 'O', 'R'],
      phonetic: 'Flor',
      icon: '🌸',
      img: 'assets/mocha_hq.png',
      desc: '¡Flores de cerezo perfumadas y suaves!',
      color: '#ec4899',
      bgGrad: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)'
    },
    {
      id: 'pastel',
      cat: 'dulces',
      catName: '🌸 Palabras Dulces',
      word: 'PASTEL',
      letters: ['P', 'A', 'S', 'T', 'E', 'L'],
      phonetic: 'Pas - tel',
      icon: '🧁',
      img: 'assets/milk_teddy.png',
      desc: '¡Pastelitos horneados con crema de vainilla!',
      color: '#f97316',
      bgGrad: 'linear-gradient(135deg, #fff7ed, #fed7aa)'
    }
  ];

  function normalizeChar(c) {
    if (!c) return '';
    return c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }

  function lettersMatch(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    return normalizeChar(a) === normalizeChar(b);
  }

  class WritingWorkshopGame {
    constructor() {
      this.container = null;
      this.currentWordIdx = 0;
      this.currentMode = 'montessori'; // 'montessori', 'trace', 'free'
      this.placedLetters = []; // ranuras de letras
      this.availableCookies = []; // galletitas en la bandeja
      this.selectedTraceLetterIdx = 0;
      this.activeDrag = null;

      // Pizarra libre
      this.brushColor = '#ff69b4';
      this.brushSize = 12;
    }

    init(containerEl) {
      this.container = containerEl;
      this.currentWordIdx = 0;
      this.currentMode = 'montessori';
      this.loadWord(0);
      this.render();
    }

    loadWord(idx) {
      this.currentWordIdx = idx;
      const w = WORDS[this.currentWordIdx];
      this.placedLetters = new Array(w.letters.length).fill(null);

      // Galletitas para el banco inferior:
      // Exactamente las letras requeridas, mezcladas en desorden
      this.availableCookies = w.letters
        .map((letter, i) => ({
          id: `c_${i}_${letter}`,
          letter: letter,
          origIdx: i,
          used: false
        }))
        .sort(() => Math.random() - 0.5);

      this.selectedTraceLetterIdx = 0;
    }

    speak(text) {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'es-ES';
          u.rate = 0.85; // Hablar suave y pausado para preescolar
          u.pitch = 1.25; // Tono dulce y afectuoso
          window.speechSynthesis.speak(u);
        } catch (_) {}
      }
    }

    render() {
      const w = WORDS[this.currentWordIdx];
      this.container.innerHTML = `
        <div class="writing-wrap">
          <!-- Selector de palabras superior con píldoras de amigos y familia -->
          <div class="writing-top-bar">
            <div class="word-selector-pills">
              ${WORDS.map((item, idx) => `
                <button class="word-chip-btn ${idx === this.currentWordIdx ? 'active' : ''}" data-idx="${idx}">
                  ${item.icon || '🌸'} ${item.word}
                </button>
              `).join('')}
            </div>

            <!-- Modos pedagógicos -->
            <div class="writing-modes-bar">
              <button class="wmode-btn ${this.currentMode === 'montessori' ? 'active' : ''}" data-mode="montessori">
                🍪 Alfabeto Móvil
              </button>
              <button class="wmode-btn ${this.currentMode === 'trace' ? 'active' : ''}" data-mode="trace">
                ✨ Trazado Mágico
              </button>
              <button class="wmode-btn ${this.currentMode === 'free' ? 'active' : ''}" data-mode="free">
                🖍️ Pizarra Libre
              </button>
            </div>
          </div>

          <!-- Escenario Central -->
          <div class="writing-stage-card" style="background: ${w.bgGrad}">
            <!-- Encabezado de la palabra -->
            <div class="word-card-header">
              <div class="word-mascot-badge">
                <img src="${w.img}" alt="${w.word}" class="w-mascot-img" />
              </div>
              <div class="word-info-box">
                <span class="w-cat-tag">${w.catName}</span>
                <h1 class="w-main-word" style="color: ${w.color}">${w.word}</h1>
                <p class="w-desc-text">${w.desc}</p>
              </div>
              <button class="btn-hear-word" id="btnHearWord" title="Escuchar la palabra">
                🔊 Escuchar
              </button>
            </div>

            <!-- Contenido dinámico del modo -->
            <div id="wModeStageContent" class="w-mode-stage-content">
              ${this.renderModeContent()}
            </div>
          </div>
        </div>
      `;

      this.bindDOMEvents();

      if (this.currentMode === 'montessori') {
        this.setupCookieDragAndDrop();
      } else if (this.currentMode === 'trace') {
        this.setupTraceCanvas();
      } else if (this.currentMode === 'free') {
        this.setupFreeCanvas();
      }
    }

    renderModeContent() {
      const w = WORDS[this.currentWordIdx];

      if (this.currentMode === 'montessori') {
        // MODO 1: ALFABETO MÓVIL MONTESSORI CON ARRASTRE TÁCTIL
        return `
          <div class="montessori-tray-container">
            <div class="tray-instructions">
              👆 <strong>Arrastra con tu dedito</strong> cada galletita a su molde para escribir <strong>${w.word}</strong>:
            </div>

            <!-- Moldes de la palabra (Slots para encajar las letras) -->
            <div class="letter-slots-row" id="letterSlotsRow">
              ${w.letters.map((char, slotIdx) => {
                const placed = this.placedLetters[slotIdx];
                return `
                  <div class="letter-slot ${placed ? 'filled' : 'empty'}" data-slot="${slotIdx}" title="${placed ? 'Toca para devolver a la bandeja' : 'Arrastra una galleta aquí'}">
                    <span class="slot-letter-preview">${placed ? placed.letter : char}</span>
                    <span class="slot-dash"></span>
                    ${placed ? `<span class="slot-placed-sparkle">✨</span>` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Bandeja inferior de Galletas de Letras -->
            <div class="cookie-tray-frame">
              <div class="tray-sub-heading">🍪 Bandeja de galletitas recién horneadas:</div>
              <div class="cookie-letters-bank" id="cookieBank">
                ${this.availableCookies.map((cookie, cIdx) => `
                  <div class="letter-cookie-btn ${cookie.used ? 'used' : ''}" 
                       data-cookie="${cIdx}" 
                       role="button" 
                       tabindex="0"
                       style="touch-action: none;">
                    <span class="cookie-char">${cookie.letter}</span>
                    <span class="cookie-deco">✨</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Acciones auxiliares -->
            <div class="w-actions-row">
              <button class="btn-w-reset" id="btnResetWord">🔄 Empezar de nuevo</button>
            </div>
          </div>
        `;
      } else if (this.currentMode === 'trace') {
        // MODO 2: TRAZADO SENSORIAL CON ESTRELLAS
        return `
          <div class="trace-sensory-container">
            <div class="trace-letters-selector">
              <span>Elige qué letra trazar:</span>
              <div class="trace-letters-row">
                ${w.letters.map((char, idx) => `
                  <button class="trace-pick-btn ${idx === this.selectedTraceLetterIdx ? 'active' : ''}" data-tidx="${idx}">
                    ${char}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="trace-board-stage">
              <canvas id="traceCanvas" width="460" height="340" class="trace-canvas"></canvas>
              <div class="trace-prompt-badge">✨ Sigue el caminito de estrellas con tu dedo ✨</div>
            </div>

            <div class="w-actions-row">
              <button class="btn-w-reset" id="btnClearTrace">✨ Limpiar trazo</button>
            </div>
          </div>
        `;
      } else {
        // MODO 3: PIZARRA LIBRE DE TIZAS PASTEL
        return `
          <div class="free-board-container">
            <div class="free-tools-bar">
              <div class="chalk-colors-row">
                ${['#ff69b4', '#60a5fa', '#fde047', '#4ade80', '#c084fc', '#ffffff'].map(c => `
                  <button class="chalk-color-dot ${c === this.brushColor ? 'active' : ''}" data-color="${c}" style="background: ${c}"></button>
                `).join('')}
              </div>
              <div class="chalk-size-row">
                <button class="chalk-size-btn ${this.brushSize === 6 ? 'active' : ''}" data-size="6">Fina</button>
                <button class="chalk-size-btn ${this.brushSize === 12 ? 'active' : ''}" data-size="12">Media</button>
                <button class="chalk-size-btn ${this.brushSize === 22 ? 'active' : ''}" data-size="22">Gruesa</button>
              </div>
              <button class="btn-sponge-erase" id="btnClearFree">🧽 Borrar Pizarra</button>
            </div>

            <div class="chalkboard-frame">
              <canvas id="freeChalkCanvas" width="560" height="340" class="chalk-canvas"></canvas>
            </div>
          </div>
        `;
      }
    }

    bindDOMEvents() {
      // 1. Selector de palabras
      this.container.querySelectorAll('.word-chip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          const idx = parseInt(e.currentTarget.dataset.idx, 10);
          this.loadWord(idx);
          this.render();
          const w = WORDS[idx];
          this.speak(w.word);
        });
      });

      // 2. Selector de modos
      this.container.querySelectorAll('.wmode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(2);
          this.currentMode = e.currentTarget.dataset.mode;
          this.render();
        });
      });

      // 3. Botón escuchar palabra
      const btnHear = this.container.querySelector('#btnHearWord');
      if (btnHear) {
        btnHear.addEventListener('click', () => {
          A.unlock();
          A.bellChime(660);
          const w = WORDS[this.currentWordIdx];
          this.speak(w.word);
        });
      }

      // 4. Reinicio en Montessori
      const btnReset = this.container.querySelector('#btnResetWord');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          this.loadWord(this.currentWordIdx);
          this.render();
        });
      }

      // 5. Clic en slot ya colocado: devuelve la galleta a la bandeja (libertad Montessori)
      this.container.querySelectorAll('.letter-slot.filled').forEach(slot => {
        slot.addEventListener('click', (e) => {
          const slotIdx = parseInt(e.currentTarget.dataset.slot, 10);
          const placedCookie = this.placedLetters[slotIdx];
          if (placedCookie) {
            A.unlock();
            A.whoosh(false);
            placedCookie.used = false;
            this.placedLetters[slotIdx] = null;
            this.render();
          }
        });
      });

      // 6. Modo Trace
      if (this.currentMode === 'trace') {
        this.container.querySelectorAll('.trace-pick-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            A.unlock();
            A.bubblePop(1);
            this.selectedTraceLetterIdx = parseInt(e.currentTarget.dataset.tidx, 10);
            this.render();
            const w = WORDS[this.currentWordIdx];
            this.speak(w.letters[this.selectedTraceLetterIdx]);
          });
        });

        const btnClearT = this.container.querySelector('#btnClearTrace');
        if (btnClearT) {
          btnClearT.addEventListener('click', () => {
            A.unlock();
            this.setupTraceCanvas();
          });
        }
      }

      // 7. Modo Free Chalkboard
      if (this.currentMode === 'free') {
        this.container.querySelectorAll('.chalk-color-dot').forEach(btn => {
          btn.addEventListener('click', (e) => {
            A.unlock();
            this.brushColor = e.currentTarget.dataset.color;
            this.container.querySelectorAll('.chalk-color-dot').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          });
        });

        this.container.querySelectorAll('.chalk-size-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            A.unlock();
            this.brushSize = parseInt(e.currentTarget.dataset.size, 10);
            this.container.querySelectorAll('.chalk-size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          });
        });

        const btnClearF = this.container.querySelector('#btnClearFree');
        if (btnClearF) {
          btnClearF.addEventListener('click', () => {
            A.unlock();
            A.whoosh();
            this.setupFreeCanvas();
          });
        }
      }
    }

    /* -------------------------------------------------------------
       SISTEMA DE ARRASTRE TÁCTIL Y TOQUE MONTESSORI (DRAG & DROP)
       ------------------------------------------------------------- */
    setupCookieDragAndDrop() {
      const cookieButtons = this.container.querySelectorAll('.letter-cookie-btn');

      cookieButtons.forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
          const cookieIdx = parseInt(btn.dataset.cookie, 10);
          const cookie = this.availableCookies[cookieIdx];
          if (!cookie || cookie.used) return;

          e.preventDefault();
          A.unlock();
          A.bubblePop(1);

          // Pronunciar letra al primer contacto táctil
          this.speak(cookie.letter);

          // Capturar puntero para seguimiento ultra suave
          if (btn.setPointerCapture) {
            try { btn.setPointerCapture(e.pointerId); } catch (_) {}
          }

          // Crear clon flotante de galletita que seguirá al dedo
          const clone = document.createElement('div');
          clone.className = 'letter-cookie-drag-clone';
          clone.innerHTML = `<span class="cookie-char">${cookie.letter}</span><span class="cookie-deco">✨</span>`;
          clone.style.left = `${e.clientX}px`;
          clone.style.top = `${e.clientY}px`;
          document.body.appendChild(clone);

          btn.classList.add('cookie-dragging-origin');

          const dragState = {
            pointerId: e.pointerId,
            cookieIdx,
            cookie,
            btn,
            clone,
            startX: e.clientX,
            startY: e.clientY,
            moved: false,
            hoveredSlot: null
          };
          this.activeDrag = dragState;

          const onMove = (moveEv) => {
            if (!this.activeDrag || this.activeDrag.pointerId !== moveEv.pointerId) return;
            const dx = moveEv.clientX - dragState.startX;
            const dy = moveEv.clientY - dragState.startY;
            if (Math.hypot(dx, dy) > 6) {
              dragState.moved = true;
            }

            // Mover clon flotante centrado bajo el dedo
            clone.style.left = `${moveEv.clientX}px`;
            clone.style.top = `${moveEv.clientY}px`;

            // Detectar ranura vacía más cercana
            const emptySlots = this.container.querySelectorAll('.letter-slot.empty');
            let closestSlot = null;
            let closestDist = 9999;

            emptySlots.forEach(slot => {
              const r = slot.getBoundingClientRect();
              const cx = r.left + r.width / 2;
              const cy = r.top + r.height / 2;
              const dist = Math.hypot(moveEv.clientX - cx, moveEv.clientY - cy);
              if (dist < closestDist) {
                closestDist = dist;
                closestSlot = slot;
              }
            });

            // Limpiar resaltados previos
            this.container.querySelectorAll('.letter-slot').forEach(s => {
              s.classList.remove('slot-magnet-hover', 'slot-magnet-match');
            });

            // Radio magnético de 75px
            if (closestSlot && closestDist < 75) {
              dragState.hoveredSlot = closestSlot;
              const slotIdx = parseInt(closestSlot.dataset.slot, 10);
              const w = WORDS[this.currentWordIdx];
              const expectedChar = w.letters[slotIdx];

              if (lettersMatch(cookie.letter, expectedChar)) {
                closestSlot.classList.add('slot-magnet-match');
              } else {
                closestSlot.classList.add('slot-magnet-hover');
              }
            } else {
              dragState.hoveredSlot = null;
            }
          };

          const onUp = (upEv) => {
            if (!this.activeDrag || this.activeDrag.pointerId !== upEv.pointerId) return;

            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);

            if (btn.releasePointerCapture) {
              try { btn.releasePointerCapture(upEv.pointerId); } catch (_) {}
            }

            const cur = this.activeDrag;
            this.activeDrag = null;

            cur.btn.classList.remove('cookie-dragging-origin');

            // Limpiar auras de ranuras
            this.container.querySelectorAll('.letter-slot').forEach(s => {
              s.classList.remove('slot-magnet-hover', 'slot-magnet-match');
            });

            // 1. Si no hubo arrastre sostenido (fue un Toque Rápido / Tap)
            if (!cur.moved) {
              cur.clone.remove();
              this.handleCookieTap(cur.cookieIdx);
              return;
            }

            // 2. Si se arrastró y soltó sobre una ranura cercana
            if (cur.hoveredSlot) {
              const slotIdx = parseInt(cur.hoveredSlot.dataset.slot, 10);
              const w = WORDS[this.currentWordIdx];
              const expectedChar = w.letters[slotIdx];

              if (lettersMatch(cur.cookie.letter, expectedChar)) {
                // ¡SNAP MAGNÉTICO EXITOSO!
                const slotRect = cur.hoveredSlot.getBoundingClientRect();
                cur.clone.style.transition = 'all 0.14s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                cur.clone.style.left = `${slotRect.left + slotRect.width / 2}px`;
                cur.clone.style.top = `${slotRect.top + slotRect.height / 2}px`;
                cur.clone.style.transform = 'translate(-50%, -50%) scale(1)';

                setTimeout(() => {
                  cur.clone.remove();
                  this.placeLetterSuccess(cur.cookieIdx, slotIdx);
                }, 140);
                return;
              } else {
                // Letra errónea para este molde: aviso gentil elástico sin frustración
                A.softBoing();
                cur.hoveredSlot.classList.add('wobble-friendly');
                setTimeout(() => cur.hoveredSlot.classList.remove('wobble-friendly'), 450);
              }
            }

            // 3. Si se soltó en el vacío o incorrecta: retorno elástico a la bandeja
            const btnRect = cur.btn.getBoundingClientRect();
            cur.clone.style.transition = 'all 0.22s ease-out';
            cur.clone.style.left = `${btnRect.left + btnRect.width / 2}px`;
            cur.clone.style.top = `${btnRect.top + btnRect.height / 2}px`;
            cur.clone.style.transform = 'translate(-50%, -50%) scale(0.9)';
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

    // Modo toque rápido accesible (Tap-to-Place)
    handleCookieTap(cookieIdx) {
      const cookie = this.availableCookies[cookieIdx];
      if (!cookie || cookie.used) return;

      const w = WORDS[this.currentWordIdx];
      // Buscar primera ranura vacía que coincida con esta letra
      let targetSlotIdx = -1;
      for (let i = 0; i < w.letters.length; i++) {
        if (!this.placedLetters[i] && lettersMatch(cookie.letter, w.letters[i])) {
          targetSlotIdx = i;
          break;
        }
      }

      if (targetSlotIdx !== -1) {
        this.placeLetterSuccess(cookieIdx, targetSlotIdx);
      } else {
        // Ninguna ranura vacía compatible
        A.softBoing();
        const btn = this.container.querySelector(`.letter-cookie-btn[data-cookie="${cookieIdx}"]`);
        if (btn) {
          btn.classList.add('wobble-friendly');
          setTimeout(() => btn.classList.remove('wobble-friendly'), 500);
        }
      }
    }

    placeLetterSuccess(cookieIdx, slotIdx) {
      const cookie = this.availableCookies[cookieIdx];
      if (!cookie) return;

      cookie.used = true;
      this.placedLetters[slotIdx] = cookie;

      // Sonido de campana afinado y de recolección
      const pitch = 440 + slotIdx * 60;
      A.bellChime(pitch);
      A.collect(slotIdx);
      this.speak(cookie.letter);

      this.render();

      // Destello de estrellitas en la ranura
      const filledSlot = this.container.querySelector(`.letter-slot[data-slot="${slotIdx}"]`);
      if (filledSlot) {
        this.spawnStarsOnSlot(filledSlot);
      }

      // Verificar si completó la palabra entera
      const allFilled = this.placedLetters.every(l => l !== null);
      if (allFilled) {
        setTimeout(() => {
          this.triggerWordVictory();
        }, 400);
      }
    }

    spawnStarsOnSlot(slotEl) {
      const r = slotEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const icons = ['✨', '⭐', '🌸', '💖', '🍪'];

      for (let i = 0; i < 6; i++) {
        const star = document.createElement('div');
        star.className = 'slot-star-sparkle';
        star.textContent = icons[i % icons.length];
        const angle = (i / 6) * Math.PI * 2;
        const dist = 32 + Math.random() * 20;
        star.style.left = `${cx}px`;
        star.style.top = `${cy}px`;
        star.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        star.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 650);
      }
    }

    triggerWordVictory() {
      const w = WORDS[this.currentWordIdx];
      A.celebrate();
      this.speak(`¡Excelente Amanda! ¡Escribiste ${w.word}!`);

      // Modal de celebración pastel
      const modal = document.createElement('div');
      modal.className = 'w-victory-modal-overlay';
      modal.innerHTML = `
        <div class="w-victory-card">
          <div class="w-victory-badge">🎉 ¡PALABRA COMPLETADA! 🎉</div>
          <h2 style="color: ${w.color}">${w.word}</h2>
          <div class="w-victory-img-box">
            <img src="${w.img}" alt="${w.word}" />
          </div>
          <p>¡Amanda, eres una gran escritora de Cinnamoroll Land! ✨</p>
          <div class="w-victory-actions">
            <button class="btn-w-next" id="btnNextWordModal">▶ Siguiente Palabra</button>
            <button class="btn-w-repeat" id="btnRepeatWordModal">🔄 Repetir</button>
          </div>
        </div>
      `;
      this.container.appendChild(modal);

      modal.querySelector('#btnNextWordModal').addEventListener('click', () => {
        A.unlock();
        modal.remove();
        const nextIdx = (this.currentWordIdx + 1) % WORDS.length;
        this.loadWord(nextIdx);
        this.render();
        this.speak(WORDS[nextIdx].word);
      });

      modal.querySelector('#btnRepeatWordModal').addEventListener('click', () => {
        A.unlock();
        modal.remove();
        this.loadWord(this.currentWordIdx);
        this.render();
      });
    }

    // --- SETUP MODO 2: TRAZADO SENSORIAL CON ESTRELLAS ---
    setupTraceCanvas() {
      const canvas = this.container.querySelector('#traceCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = WORDS[this.currentWordIdx];
      const char = w.letters[this.selectedTraceLetterIdx] || 'A';

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fondo pizarra de tiza suave
      ctx.fillStyle = '#2d3748';
      ctx.roundRect(0, 0, canvas.width, canvas.height, 24);
      ctx.fill();

      // Guía translúcida de la letra grande en el centro
      ctx.font = '800 220px "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Letra punteada con halo
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeText(char, canvas.width / 2, canvas.height / 2 + 10);

      // Letra interior suave
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillText(char, canvas.width / 2, canvas.height / 2 + 10);

      // Guía punteada central
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 12]);
      ctx.strokeText(char, canvas.width / 2, canvas.height / 2 + 10);
      ctx.setLineDash([]);

      // Interacción de trazado con brillo
      let drawing = false;
      const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - r.left, y: clientY - r.top };
      };

      const start = (e) => {
        e.preventDefault();
        A.unlock();
        drawing = true;
        const p = getPos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
      };

      const move = (e) => {
        if (!drawing) return;
        e.preventDefault();
        const p = getPos(e);

        ctx.strokeStyle = '#ff69b4';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 12;

        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Estrellitas en el trazo
        if (Math.random() < 0.25) {
          ctx.save();
          ctx.fillStyle = '#fffbeb';
          ctx.font = '16px serif';
          ctx.fillText('✨', p.x, p.y);
          ctx.restore();
          A.bubblePop(1);
        }
      };

      const stop = () => {
        if (drawing) {
          drawing = false;
          ctx.shadowBlur = 0;
          A.sparkleChime();
        }
      };

      canvas.addEventListener('pointerdown', start);
      canvas.addEventListener('pointermove', move);
      canvas.addEventListener('pointerup', stop);
      canvas.addEventListener('pointercancel', stop);
    }

    // --- SETUP MODO 3: PIZARRA LIBRE DE TIZAS PASTEL ---
    setupFreeCanvas() {
      const canvas = this.container.querySelector('#freeChalkCanvas');
      if (!canvas) return;
      this.freeCanvas = canvas;
      this.freeCtx = canvas.getContext('2d');

      const ctx = this.freeCtx;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Pizarra oscura con textura suave
      ctx.fillStyle = '#1e293b';
      ctx.roundRect(0, 0, canvas.width, canvas.height, 24);
      ctx.fill();

      // Líneas guía sutiles tipo cuaderno
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      for (let y = 60; y < canvas.height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(canvas.width - 20, y);
        ctx.stroke();
      }

      let drawing = false;
      const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: (clientX - r.left) * (canvas.width / r.width),
          y: (clientY - r.top) * (canvas.height / r.height)
        };
      };

      canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        A.unlock();
        drawing = true;
        const p = getPos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
      });

      canvas.addEventListener('pointermove', (e) => {
        if (!drawing) return;
        e.preventDefault();
        const p = getPos(e);

        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = this.brushColor;
        ctx.shadowBlur = 6;

        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });

      const stop = () => {
        if (drawing) {
          drawing = false;
          ctx.shadowBlur = 0;
        }
      };

      canvas.addEventListener('pointerup', stop);
      canvas.addEventListener('pointercancel', stop);
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.writingGame = new WritingWorkshopGame();
})();
