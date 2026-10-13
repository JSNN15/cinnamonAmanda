/* Palabras Mágicas · Taller Waldorf & Montessori de Escritura
 * Diseñado especialmente para Amanda (5 años).
 * 
 * Enfoque pedagógico:
 *  1. Alfabeto Móvil Montessori: galletitas de letras para ordenar en moldes.
 *  2. Trazado Sensorial con Dedo: letras grandes guiadas por estrellas luminosas.
 *  3. Pizarra Libre de Tizas Pastel: repaso con tizas de colores y esponjita.
 *  4. Fónica y voz cálida: pronuncia cada letra y palabra con entonación preescolar.
 * 
 * Vocabulario afectivo y Sanrio:
 *  - Familia: MAMÁ, PAPÁ, AMANDA, AMOR
 *  - Amigos: CINNAMOROLL, MILK, PURIN, MOCHA, CHIFFON
 *  - Naturaleza dulce: SOL, NUBE, FLOR, PASTEL, DULCE
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
      img: 'assets/pompompurin.png',
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
      img: 'assets/pompompurin.png',
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
      img: 'assets/mocha.png',
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
      img: 'assets/pompompurin.png',
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
      img: 'assets/mocha.png',
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

  class WritingWorkshopGame {
    constructor() {
      this.container = null;
      this.currentWordIdx = 0;
      this.currentMode = 'montessori'; // 'montessori', 'trace', 'free'
      this.placedLetters = []; // Índices de letras colocadas
      this.availableCookies = []; // Letras en el banco inferior
      this.selectedTraceLetterIdx = 0;

      // Estado de dibujo libre
      this.freeCanvas = null;
      this.freeCtx = null;
      this.isDrawing = false;
      this.brushColor = '#ff69b4';
      this.brushSize = 10;
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

      // Preparar galletas de letras para el alfabeto móvil:
      // Incluir las letras de la palabra en desorden + 2 letras extra para mayor diversión
      const extras = ['A', 'E', 'O', 'L', 'S', 'M', 'R'];
      const pool = [...w.letters];
      for (let i = 0; i < 2; i++) {
        const randExtra = extras[Math.floor(Math.random() * extras.length)];
        pool.push(randExtra);
      }
      // Mezclar aleatoriamente
      this.availableCookies = pool
        .map((letter, i) => ({ id: `c_${i}_${letter}`, letter, used: false }))
        .sort(() => Math.random() - 0.5);

      this.selectedTraceLetterIdx = 0;
    }

    speak(text) {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'es-ES';
          u.rate = 0.85; // Hablar despacito para niños
          u.pitch = 1.25; // Tono dulce y alegre
          window.speechSynthesis.speak(u);
        } catch (_) {}
      }
    }

    render() {
      const w = WORDS[this.currentWordIdx];
      this.container.innerHTML = `
        <div class="writing-wrap">
          <!-- Barra superior de categorías y modos -->
          <div class="writing-top-bar">
            <div class="word-selector-pills">
              ${WORDS.map((item, idx) => `
                <button class="word-chip-btn ${idx === this.currentWordIdx ? 'active' : ''}" data-idx="${idx}">
                  ${item.icon || '🌸'} ${item.word}
                </button>
              `).join('')}
            </div>

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

          <!-- Escenario Central según modo -->
          <div class="writing-stage-card" style="background: ${w.bgGrad}">
            <!-- Encabezado de la palabra actual -->
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
      if (this.currentMode === 'trace') {
        this.setupTraceCanvas();
      } else if (this.currentMode === 'free') {
        this.setupFreeCanvas();
      }
    }

    renderModeContent() {
      const w = WORDS[this.currentWordIdx];

      if (this.currentMode === 'montessori') {
        // MODO 1: ALFABETO MÓVIL MONTESSORI
        return `
          <div class="montessori-tray-container">
            <div class="tray-instructions">
              👆 Toca o arrastra cada galletita de letra a su molde para formar <strong>${w.word}</strong>:
            </div>

            <!-- Moldes de la palabra (Slots vacíos o con letra colocada) -->
            <div class="letter-slots-row">
              ${w.letters.map((char, slotIdx) => {
                const placed = this.placedLetters[slotIdx];
                return `
                  <div class="letter-slot ${placed ? 'filled' : 'empty'}" data-slot="${slotIdx}">
                    <span class="slot-letter-preview">${placed ? placed.letter : char}</span>
                    <span class="slot-dash"></span>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Banco inferior de Galletas de Letras -->
            <div class="cookie-letters-bank">
              ${this.availableCookies.map((cookie, cIdx) => `
                <button class="letter-cookie-btn ${cookie.used ? 'used' : ''}" data-cookie="${cIdx}">
                  <span class="cookie-char">${cookie.letter}</span>
                  <span class="cookie-deco">✨</span>
                </button>
              `).join('')}
            </div>

            <!-- Botón de reiniciar palabra -->
            <div class="w-actions-row">
              <button class="btn-w-reset" id="btnResetWord">🔄 Empezar de nuevo</button>
            </div>
          </div>
        `;
      } else if (this.currentMode === 'trace') {
        // MODO 2: TRAZADO SENSORIAL CON ESTRELLAS
        const currLetter = w.letters[this.selectedTraceLetterIdx] || w.letters[0];
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

      // 4. Modo Montessori: Clic en galletitas de letras
      if (this.currentMode === 'montessori') {
        const btnReset = this.container.querySelector('#btnResetWord');
        if (btnReset) {
          btnReset.addEventListener('click', () => {
            A.unlock();
            A.bubblePop(1);
            this.loadWord(this.currentWordIdx);
            this.render();
          });
        }

        this.container.querySelectorAll('.letter-cookie-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const cookieIdx = parseInt(e.currentTarget.dataset.cookie, 10);
            this.handleCookieClick(cookieIdx);
          });
        });
      }

      // 5. Modo Trace: cambiar letra
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

      // 6. Modo Free Chalkboard
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

    handleCookieClick(cookieIdx) {
      const cookie = this.availableCookies[cookieIdx];
      if (!cookie || cookie.used) return;

      A.unlock();
      const w = WORDS[this.currentWordIdx];

      // Buscar el primer slot vacío
      const firstEmptySlot = this.placedLetters.findIndex(l => l === null);
      if (firstEmptySlot === -1) return;

      const expectedLetter = w.letters[firstEmptySlot];

      // Comprobar si la letra coincide con el siguiente molde
      if (cookie.letter === expectedLetter) {
        // ¡Letra Correcta!
        cookie.used = true;
        this.placedLetters[firstEmptySlot] = cookie;

        // Sonido de campana afinado a la letra
        const pitch = 440 + firstEmptySlot * 60;
        A.bellChime(pitch);
        this.speak(cookie.letter);

        // Actualizar UI
        this.render();

        // Verificar si completó la palabra entera
        const allFilled = this.placedLetters.every(l => l !== null);
        if (allFilled) {
          setTimeout(() => {
            this.triggerWordVictory();
          }, 350);
        }
      } else {
        // Letra incorrecta: aviso elástico amigable sin penalización
        A.softBoing();
        const btn = this.container.querySelector(`.letter-cookie-btn[data-cookie="${cookieIdx}"]`);
        if (btn) {
          btn.classList.add('wobble-friendly');
          setTimeout(() => btn.classList.remove('wobble-friendly'), 500);
        }
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
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 12;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Estrellita pequeña en la punta
        if (Math.random() < 0.2) {
          ctx.font = '16px sans-serif';
          ctx.fillText('✨', p.x + (Math.random() - 0.5) * 20, p.y + (Math.random() - 0.5) * 20);
          A.sparkleChime();
        }
      };

      const end = () => { drawing = false; ctx.shadowBlur = 0; };

      canvas.onpointerdown = start;
      canvas.onpointermove = move;
      canvas.onpointerup = end;
      canvas.onpointercancel = end;
    }

    // --- SETUP MODO 3: PIZARRA LIBRE CON TIZAS PASTEL ---
    setupFreeCanvas() {
      const canvas = this.container.querySelector('#freeChalkCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      this.freeCanvas = canvas;
      this.freeCtx = ctx;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Pizarra verde bosque / azul suave Waldorf
      ctx.fillStyle = '#1e3a2f';
      ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
      ctx.fill();

      // Marco suave
      ctx.strokeStyle = '#c2a649';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

      // Líneas guía tenues de cuaderno caligráfico
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      for (let y = 70; y < canvas.height; y += 70) {
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(canvas.width - 10, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Letra tenue de sugerencia
      const w = WORDS[this.currentWordIdx];
      ctx.font = '800 64px "Baloo 2", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.textAlign = 'center';
      ctx.fillText(w.word, canvas.width / 2, 80);

      let drawing = false;
      const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - r.left, y: clientY - r.top };
      };

      canvas.onpointerdown = (e) => {
        e.preventDefault();
        A.unlock();
        drawing = true;
        const p = getPos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
      };

      canvas.onpointermove = (e) => {
        if (!drawing) return;
        e.preventDefault();
        const p = getPos(e);
        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = this.brushColor;
        ctx.shadowBlur = 4;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      };

      canvas.onpointerup = () => { drawing = false; ctx.shadowBlur = 0; };
      canvas.onpointercancel = () => { drawing = false; ctx.shadowBlur = 0; };
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.writingGame = new WritingWorkshopGame();
})();
