/* Palabras Mágicas · Taller Waldorf & Montessori de Lectura y Escritura
 * Diseñado y calibrado para niñas de 5 a 8 años (Kínder a 3° Básico).
 * 
 * Enfoque Pedagógico Progresivo (5 a 8 Años):
 *  - Nivel Kínder (5-6 años): Palabras cortas con guía fonética y galletas exactas.
 *  - Nivel 1° Básico (6-7 años): Palabras medianas y largas + Letras distractoras para afianzar ortografía.
 *  - Nivel 2°-3° Básico (7-8 años):
 *      1. Modo Detective: deducir letras faltantes con letras ocultas.
 *      2. Modo Frases Mágicas: construir oraciones completas ordenando bloques de palabras.
 * 
 * Modos de Juego:
 *  1. 🍪 Alfabeto Móvil (Montessori Drag & Drop)
 *  2. 📖 Frases Mágicas (Construcción sintáctica de oraciones)
 *  3. ✨ Trazado Mágico (Pizarra de caligrafía con estrellas)
 *  4. 🖍️ Pizarra Libre de Tizas Pastel
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const WORDS = [
    // 🎀 NIVEL 1 (5-6 años): Vocabulario Afectivo y Fonético Básico
    {
      id: 'mama',
      tier: '5-6',
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
      tier: '5-6',
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
      id: 'sol',
      tier: '5-6',
      catName: '☀️ Naturaleza',
      word: 'SOL',
      letters: ['S', 'O', 'L'],
      phonetic: 'Sol',
      icon: '☀️',
      img: 'assets/pompompurin_hq.png',
      desc: '¡El sol brillante que calienta la mañana!',
      color: '#eab308',
      bgGrad: 'linear-gradient(135deg, #fefce8, #fef08a)'
    },
    {
      id: 'nube',
      tier: '5-6',
      catName: '☁️ Naturaleza',
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
      tier: '5-6',
      catName: '🌸 Naturaleza',
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
      id: 'milk',
      tier: '5-6',
      catName: '🐶 Sanrio',
      word: 'MILK',
      letters: ['M', 'I', 'L', 'K'],
      phonetic: 'Milk',
      icon: '🍼',
      img: 'assets/milk_teddy.png',
      desc: '¡El perrito bebé con su chupete y osito!',
      color: '#6366f1',
      bgGrad: 'linear-gradient(135deg, #eef2ff, #c7d2fe)'
    },
    {
      id: 'amor',
      tier: '5-6',
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

    // ⭐ NIVEL 2 (6-7 años): Palabras Medianas y Amigos de Sanrio
    {
      id: 'amanda',
      tier: '6-7',
      catName: '👑 Princesa',
      word: 'AMANDA',
      letters: ['A', 'M', 'A', 'N', 'D', 'A'],
      phonetic: 'A - man - da',
      icon: '👑',
      img: 'assets/cinnamoroll_fly.png',
      desc: '¡Amanda, la niña más alegre, dulce y brillante!',
      color: '#ec4899',
      bgGrad: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)'
    },
    {
      id: 'chiffon',
      tier: '6-7',
      catName: '🌸 Sanrio',
      word: 'CHIFFON',
      letters: ['C', 'H', 'I', 'F', 'F', 'O', 'N'],
      phonetic: 'Chif - fon',
      icon: '🌸',
      img: 'assets/chiffon.png',
      desc: '¡La perrita saltarina con orejas de nube!',
      color: '#db2777',
      bgGrad: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)'
    },
    {
      id: 'purin',
      tier: '6-7',
      catName: '🍮 Sanrio',
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
      tier: '6-7',
      catName: '🎀 Sanrio',
      word: 'MOCHA',
      letters: ['M', 'O', 'C', 'H', 'A'],
      phonetic: 'Mo - cha',
      icon: '🎀',
      img: 'assets/mocha_hq.png',
      desc: '¡La amiga elegante con flor rosa y té caliente!',
      color: '#9333ea',
      bgGrad: 'linear-gradient(135deg, #faf5ff, #e9d5ff)'
    },
    {
      id: 'pastel',
      tier: '6-7',
      catName: '🧁 Dulces',
      word: 'PASTEL',
      letters: ['P', 'A', 'S', 'T', 'E', 'L'],
      phonetic: 'Pas - tel',
      icon: '🧁',
      img: 'assets/milk_teddy.png',
      desc: '¡Rico pastelito de vainilla con fresas frescas!',
      color: '#f97316',
      bgGrad: 'linear-gradient(135deg, #fff7ed, #fed7aa)'
    },
    {
      id: 'estrella',
      tier: '6-7',
      catName: '✨ Mágico',
      word: 'ESTRELLA',
      letters: ['E', 'S', 'T', 'R', 'E', 'L', 'L', 'A'],
      phonetic: 'Es - tre - lla',
      icon: '⭐',
      img: 'assets/cinnamoroll_fly.png',
      desc: '¡Estrellitas que iluminan la noche mágica!',
      color: '#ca8a04',
      bgGrad: 'linear-gradient(135deg, #fefce8, #fde68a)'
    },

    // 👑 NIVEL 3 (7-8 años): Desafíos Ortográficos y Palabras Complejas
    {
      id: 'cinna',
      tier: '7-8',
      catName: '🪽 Sanrio Avanzado',
      word: 'CINNAMOROLL',
      letters: ['C', 'I', 'N', 'N', 'A', 'M', 'O', 'R', 'O', 'L', 'L'],
      phonetic: 'Cin - na - mo - roll',
      icon: '🪽',
      img: 'assets/cinnamoroll_fly.png',
      desc: '¡El perrito que vuela suave por el cielo con sus orejas!',
      color: '#0288d1',
      bgGrad: 'linear-gradient(135deg, #f0f9ff, #bae6fd)'
    },
    {
      id: 'arcoiris',
      tier: '7-8',
      catName: '🌈 Primaria',
      word: 'ARCOÍRIS',
      letters: ['A', 'R', 'C', 'O', 'Í', 'R', 'I', 'S'],
      phonetic: 'Ar - co - í - ris',
      icon: '🌈',
      img: 'assets/chiffon.png',
      desc: '¡Siete colores mágicos que cruzan el cielo de nubes!',
      color: '#8b5cf6',
      bgGrad: 'linear-gradient(135deg, #f5f3ff, #ddd6fe)'
    },
    {
      id: 'mariposa',
      tier: '7-8',
      catName: '🦋 Naturaleza',
      word: 'MARIPOSA',
      letters: ['M', 'A', 'R', 'I', 'P', 'O', 'S', 'A'],
      phonetic: 'Ma - ri - po - sa',
      icon: '🦋',
      img: 'assets/chiffon.png',
      desc: '¡Vuela de flor en flor en el jardín de Chiffon!',
      color: '#ec4899',
      bgGrad: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)'
    },
    {
      id: 'chocolate',
      tier: '7-8',
      catName: '🍫 Pastelería',
      word: 'CHOCOLATE',
      letters: ['C', 'H', 'O', 'C', 'O', 'L', 'A', 'T', 'E'],
      phonetic: 'Cho - co - la - te',
      icon: '🍫',
      img: 'assets/pompompurin_hq.png',
      desc: '¡Dulce de cacao calientito para los días de frío!',
      color: '#78350f',
      bgGrad: 'linear-gradient(135deg, #fffbeb, #fed7aa)'
    },
    {
      id: 'amistad',
      tier: '7-8',
      catName: '💖 Valores',
      word: 'AMISTAD',
      letters: ['A', 'M', 'I', 'S', 'T', 'A', 'D'],
      phonetic: 'A - mis - tad',
      icon: '🤝',
      img: 'assets/cinnamoroll_fly.png',
      desc: '¡El lazo más lindo entre Cinnamoroll, Amanda y sus amigos!',
      color: '#10b981',
      bgGrad: 'linear-gradient(135deg, #ecfdf5, #a7f3d0)'
    }
  ];

  // 📖 FRASES MÁGICAS PARA 6 A 8 AÑOS
  const SENTENCES = [
    {
      id: 's1',
      phrase: 'AMANDA VUELA CON CINNAMOROLL',
      words: ['AMANDA', 'VUELA', 'CON', 'CINNAMOROLL'],
      icon: '🪽',
      img: 'assets/cinnamoroll_fly.png',
      desc: '¡Amanda y Cinnamoroll planean juntos sobre las nubes!'
    },
    {
      id: 's2',
      phrase: 'MAMÁ Y PAPÁ TE AMAN MUCHO',
      words: ['MAMÁ', 'Y', 'PAPÁ', 'TE', 'AMAN', 'MUCHO'],
      icon: '💖',
      img: 'assets/milk_teddy.png',
      desc: '¡Todo el cariño y abrazos de la familia!'
    },
    {
      id: 's3',
      phrase: 'MILK ABRAZA A SU OSITO',
      words: ['MILK', 'ABRAZA', 'A', 'SU', 'OSITO'],
      icon: '🧸',
      img: 'assets/milk_teddy.png',
      desc: '¡El tierno perrito bebé cuida a su amigo peluche!'
    },
    {
      id: 's4',
      phrase: 'CHIFFON SALTA EN LAS FLORES',
      words: ['CHIFFON', 'SALTA', 'EN', 'LAS', 'FLORES'],
      icon: '🌸',
      img: 'assets/chiffon.png',
      desc: '¡La perrita saltarina juega feliz en el jardín!'
    },
    {
      id: 's5',
      phrase: 'PURIN COMPARTE UN RICO FLAN',
      words: ['PURIN', 'COMPARTE', 'UN', 'RICO', 'FLAN'],
      icon: '🍮',
      img: 'assets/pompompurin_hq.png',
      desc: '¡Un banquete dulce de caramelo con amigos!'
    },
    {
      id: 's6',
      phrase: 'MOCHA TOMA TÉ CON PASTELITOS',
      words: ['MOCHA', 'TOMA', 'TÉ', 'CON', 'PASTELITOS'],
      icon: '🎀',
      img: 'assets/mocha_hq.png',
      desc: '¡Una merienda elegante en tazas de porcelana!'
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
      this.currentTier = 'all'; // '5-6', '6-7', '7-8', 'all'
      this.currentWordIdx = 0;
      this.currentSentenceIdx = 0;
      this.currentMode = 'montessori'; // 'montessori', 'sentences', 'trace', 'free'
      
      // Estado Palabras
      this.placedLetters = [];
      this.availableCookies = [];
      this.selectedTraceLetterIdx = 0;
      
      // Estado Frases
      this.placedSentenceWords = [];
      this.availableSentencePills = [];

      this.activeDrag = null;

      // Pizarra libre
      this.brushColor = '#ff69b4';
      this.brushSize = 12;
    }

    init(containerEl) {
      this.container = containerEl;
      this.currentTier = 'all';
      this.currentWordIdx = 0;
      this.currentSentenceIdx = 0;
      this.currentMode = 'montessori';
      this.loadWord(0);
      this.render();
    }

    getFilteredWords() {
      if (this.currentTier === 'all') return WORDS;
      return WORDS.filter(w => w.tier === this.currentTier);
    }

    getCurrentWord() {
      const list = this.getFilteredWords();
      return list[this.currentWordIdx] || WORDS[0];
    }

    getCurrentSentence() {
      return SENTENCES[this.currentSentenceIdx];
    }

    stop() {
      this.cleanupActiveDrag();
    }

    cleanupActiveDrag() {
      if (this.currentDragCleanup) {
        try { this.currentDragCleanup(); } catch (_) {}
        this.currentDragCleanup = null;
      }
      document.querySelectorAll('.letter-cookie-drag-clone, .sentence-pill-drag-clone').forEach(el => el.remove());
      if (this.container) {
        this.container.querySelectorAll('.cookie-dragging-origin, .pill-dragging-origin').forEach(el => {
          el.classList.remove('cookie-dragging-origin', 'pill-dragging-origin');
        });
        this.container.querySelectorAll('.slot-magnet-hover, .slot-magnet-match').forEach(el => {
          el.classList.remove('slot-magnet-hover', 'slot-magnet-match');
        });
      }
      this.activeDrag = null;
    }

    loadWord(idx) {
      this.cleanupActiveDrag();
      const list = this.getFilteredWords();
      this.currentWordIdx = Math.max(0, Math.min(idx, list.length - 1));
      const w = list[this.currentWordIdx];
      this.placedLetters = new Array(w.letters.length).fill(null);

      // Preparación de letras en bandeja:
      // Si la palabra es de nivel 6-7 o 7-8, agregamos letras distractoras para enriquecer el reto
      const pool = [...w.letters];
      const distractorCount = (w.tier === '7-8') ? 3 : (w.tier === '6-7' ? 2 : 0);
      const alphabet = ['A', 'E', 'O', 'L', 'S', 'R', 'M', 'T', 'N', 'P', 'C'];
      
      for (let i = 0; i < distractorCount; i++) {
        const randChar = alphabet[Math.floor(Math.random() * alphabet.length)];
        pool.push(randChar);
      }

      this.availableCookies = pool
        .map((letter, i) => ({
          id: `c_${i}_${letter}`,
          letter: letter,
          used: false
        }))
        .sort(() => Math.random() - 0.5);

      this.selectedTraceLetterIdx = 0;
    }

    loadSentence(idx) {
      this.cleanupActiveDrag();
      this.currentSentenceIdx = idx % SENTENCES.length;
      const s = SENTENCES[this.currentSentenceIdx];
      this.placedSentenceWords = new Array(s.words.length).fill(null);
      this.availableSentencePills = s.words
        .map((w, i) => ({ id: `w_${i}_${w}`, word: w, used: false }))
        .sort(() => Math.random() - 0.5);
    }

    speak(text) {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'es-ES';
          u.rate = 0.88;
          u.pitch = 1.2;
          window.speechSynthesis.speak(u);
        } catch (_) {}
      }
    }

    render() {
      this.cleanupActiveDrag();
      const list = this.getFilteredWords();
      const w = list[this.currentWordIdx] || WORDS[0];

      this.container.innerHTML = `
        <div class="writing-wrap">
          <!-- Barra superior: Selector de Edad y Modos -->
          <div class="writing-top-bar">
            <!-- Selector de Edad / Grado Escolar -->
            <div class="writing-age-tier-row">
              <span class="tier-label-title">🎯 Nivel:</span>
              <button class="tier-chip-btn ${this.currentTier === 'all' ? 'active' : ''}" data-tier="all">
                🌈 Todos
              </button>
              <button class="tier-chip-btn ${this.currentTier === '5-6' ? 'active' : ''}" data-tier="5-6">
                🎀 5-6 Años (Kínder)
              </button>
              <button class="tier-chip-btn ${this.currentTier === '6-7' ? 'active' : ''}" data-tier="6-7">
                ⭐ 6-7 Años (1° Básico)
              </button>
              <button class="tier-chip-btn ${this.currentTier === '7-8' ? 'active' : ''}" data-tier="7-8">
                👑 7-8 Años (2°-3° Básico)
              </button>
            </div>

            <!-- Modos pedagógicos -->
            <div class="writing-modes-bar">
              <button class="wmode-btn ${this.currentMode === 'montessori' ? 'active' : ''}" data-mode="montessori">
                🍪 Palabras Mágicas
              </button>
              <button class="wmode-btn ${this.currentMode === 'sentences' ? 'active' : ''}" data-mode="sentences">
                📖 Frases Mágicas (6-8 años)
              </button>
              <button class="wmode-btn ${this.currentMode === 'trace' ? 'active' : ''}" data-mode="trace">
                ✨ Trazado Mágico
              </button>
              <button class="wmode-btn ${this.currentMode === 'free' ? 'active' : ''}" data-mode="free">
                🖍️ Pizarra Libre
              </button>
            </div>

            <!-- Carrusel de palabras o frases -->
            ${this.currentMode !== 'sentences' ? `
              <div class="word-selector-pills">
                ${list.map((item, idx) => `
                  <button class="word-chip-btn ${idx === this.currentWordIdx ? 'active' : ''}" data-idx="${idx}">
                    ${item.icon || '🌸'} ${item.word}
                  </button>
                `).join('')}
              </div>
            ` : `
              <div class="word-selector-pills">
                ${SENTENCES.map((item, idx) => `
                  <button class="sentence-chip-btn ${idx === this.currentSentenceIdx ? 'active' : ''}" data-sidx="${idx}">
                    ${item.icon} ${item.phrase}
                  </button>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Escenario Central -->
          <div class="writing-stage-card" style="background: ${w.bgGrad}">
            ${this.renderModeHeader()}
            <div id="wModeStageContent" class="w-mode-stage-content">
              ${this.renderModeContent()}
            </div>
          </div>
        </div>
      `;

      this.bindDOMEvents();

      if (this.currentMode === 'montessori') {
        this.setupCookieDragAndDrop();
      } else if (this.currentMode === 'sentences') {
        this.setupSentenceDragAndDrop();
      } else if (this.currentMode === 'trace') {
        this.setupTraceCanvas();
      } else if (this.currentMode === 'free') {
        this.setupFreeCanvas();
      }
    }

    renderModeHeader() {
      if (this.currentMode === 'sentences') {
        const s = SENTENCES[this.currentSentenceIdx];
        return `
          <div class="word-card-header">
            <div class="word-mascot-badge">
              <img src="${s.img}" alt="${s.phrase}" class="w-mascot-img" />
            </div>
            <div class="word-info-box">
              <span class="w-cat-tag">📖 Construcción de Frases (6-8 años)</span>
              <h1 class="w-main-word" style="color: #4338ca; font-size: clamp(20px, 3.2vw, 28px);">${s.phrase}</h1>
              <p class="w-desc-text">${s.desc}</p>
            </div>
            <button class="btn-hear-word" id="btnHearSentence" title="Escuchar la oración completa">
              🔊 Escuchar
            </button>
          </div>
        `;
      }

      const list = this.getFilteredWords();
      const w = list[this.currentWordIdx] || WORDS[0];
      return `
        <div class="word-card-header">
          <div class="word-mascot-badge">
            <img src="${w.img}" alt="${w.word}" class="w-mascot-img" />
          </div>
          <div class="word-info-box">
            <span class="w-cat-tag">${w.catName} · Nivel ${w.tier} años</span>
            <h1 class="w-main-word" style="color: ${w.color}">${w.word}</h1>
            <p class="w-desc-text">${w.desc}</p>
          </div>
          <button class="btn-hear-word" id="btnHearWord" title="Escuchar la palabra">
            🔊 Escuchar
          </button>
        </div>
      `;
    }

    renderModeContent() {
      if (this.currentMode === 'sentences') {
        // MODO FRASES MÁGICAS (LECTURA & SINTAXIS PARA 6-8 AÑOS)
        const s = SENTENCES[this.currentSentenceIdx];
        return `
          <div class="sentences-workshop-container">
            <div class="tray-instructions">
              👆 <strong>Arrastra cada palabra a su lugar</strong> para formar la oración:
            </div>

            <!-- Moldes de la oración -->
            <div class="sentence-slots-row" id="sentenceSlotsRow">
              ${s.words.map((targetWord, slotIdx) => {
                const placed = this.placedSentenceWords[slotIdx];
                return `
                  <div class="sentence-slot ${placed ? 'filled' : 'empty'}" data-sslot="${slotIdx}">
                    <span class="slot-word-preview">${placed ? placed.word : targetWord}</span>
                    <span class="slot-dash"></span>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Banco de palabras nube en la bandeja -->
            <div class="sentence-bank-tray">
              <div class="tray-sub-heading">☁️ Palabras para ordenar:</div>
              <div class="sentence-words-bank">
                ${this.availableSentencePills.map((pill, pIdx) => `
                  <div class="sentence-pill-btn ${pill.used ? 'used' : ''}" 
                       data-pill="${pIdx}"
                       role="button"
                       tabindex="0"
                       style="touch-action: none;">
                    <span class="pill-word-text">${pill.word}</span>
                    <span class="pill-deco">✨</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="w-actions-row">
              <button class="btn-w-reset" id="btnResetSentence">🔄 Reiniciar Frase</button>
            </div>
          </div>
        `;
      }

      if (this.currentMode === 'montessori') {
        // MODO ALFABETO MÓVIL MONTESSORI CON ARRASTRE TÁCTIL Y DISTRACTORES
        const list = this.getFilteredWords();
        const w = list[this.currentWordIdx] || WORDS[0];
        const hasDistractors = (w.tier !== '5-6');

        return `
          <div class="montessori-tray-container">
            <div class="tray-instructions">
              👆 <strong>Arrastra con tu dedito</strong> las galletas al molde para escribir <strong>${w.word}</strong>
              ${hasDistractors ? ` <span class="distractor-badge">(¡Cuidado con las letras trampa!)</span>` : ''}:
            </div>

            <!-- Moldes de la palabra -->
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
              <div class="tray-sub-heading">🍪 Bandeja de galletitas horneadas:</div>
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

            <div class="w-actions-row">
              <button class="btn-w-reset" id="btnResetWord">🔄 Empezar de nuevo</button>
            </div>
          </div>
        `;
      }

      if (this.currentMode === 'trace') {
        // MODO TRAZADO SENSORIAL CON ESTRELLAS
        const list = this.getFilteredWords();
        const w = list[this.currentWordIdx] || WORDS[0];
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
      }

      // MODO PIZARRA LIBRE
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

    bindDOMEvents() {
      // 1. Selector de Nivel de Edad
      this.container.querySelectorAll('.tier-chip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          this.currentTier = e.currentTarget.dataset.tier;
          this.loadWord(0);
          this.render();
        });
      });

      // 2. Selector de palabras
      this.container.querySelectorAll('.word-chip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          const idx = parseInt(e.currentTarget.dataset.idx, 10);
          this.loadWord(idx);
          this.render();
          const list = this.getFilteredWords();
          if (list[idx]) this.speak(list[idx].word);
        });
      });

      // 3. Selector de frases
      this.container.querySelectorAll('.sentence-chip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          const idx = parseInt(e.currentTarget.dataset.sidx, 10);
          this.loadSentence(idx);
          this.render();
          this.speak(SENTENCES[idx].phrase);
        });
      });

      // 4. Selector de modos
      this.container.querySelectorAll('.wmode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(2);
          this.currentMode = e.currentTarget.dataset.mode;
          if (this.currentMode === 'sentences') {
            this.loadSentence(this.currentSentenceIdx);
          }
          this.render();
        });
      });

      // 5. Botón escuchar palabra
      const btnHear = this.container.querySelector('#btnHearWord');
      if (btnHear) {
        btnHear.addEventListener('click', () => {
          A.unlock();
          A.bellChime(660);
          const list = this.getFilteredWords();
          const w = list[this.currentWordIdx] || WORDS[0];
          this.speak(w.word);
        });
      }

      // 6. Botón escuchar frase
      const btnHearS = this.container.querySelector('#btnHearSentence');
      if (btnHearS) {
        btnHearS.addEventListener('click', () => {
          A.unlock();
          A.bellChime(660);
          const s = SENTENCES[this.currentSentenceIdx];
          this.speak(s.phrase);
        });
      }

      // 7. Reiniciar palabra
      const btnReset = this.container.querySelector('#btnResetWord');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          this.loadWord(this.currentWordIdx);
          this.render();
        });
      }

      // 8. Reiniciar frase
      const btnResetS = this.container.querySelector('#btnResetSentence');
      if (btnResetS) {
        btnResetS.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          this.loadSentence(this.currentSentenceIdx);
          this.render();
        });
      }

      // 9. Clic en slot ya colocado para devolverlo (autocorrección Montessori)
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

      // 10. Devolver palabra de la frase colocada
      this.container.querySelectorAll('.sentence-slot.filled').forEach(slot => {
        slot.addEventListener('click', (e) => {
          const slotIdx = parseInt(e.currentTarget.dataset.sslot, 10);
          const placedPill = this.placedSentenceWords[slotIdx];
          if (placedPill) {
            A.unlock();
            A.whoosh(false);
            placedPill.used = false;
            this.placedSentenceWords[slotIdx] = null;
            this.render();
          }
        });
      });

      // 11. Trace mode
      if (this.currentMode === 'trace') {
        this.container.querySelectorAll('.trace-pick-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            A.unlock();
            A.bubblePop(1);
            this.selectedTraceLetterIdx = parseInt(e.currentTarget.dataset.tidx, 10);
            this.render();
            const list = this.getFilteredWords();
            const w = list[this.currentWordIdx] || WORDS[0];
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

      // 12. Free mode
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
       ARRASTRE TÁCTIL MONTESSORI DE GALLETAS DE LETRAS
       ------------------------------------------------------------- */
    setupCookieDragAndDrop() {
      this.cleanupActiveDrag();
      const cookieButtons = this.container.querySelectorAll('.letter-cookie-btn');

      cookieButtons.forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
          if (e.button !== undefined && e.button !== 0) return;

          const cookieIdx = parseInt(btn.dataset.cookie, 10);
          const cookie = this.availableCookies[cookieIdx];
          if (!cookie || cookie.used) return;

          e.preventDefault();
          A.unlock();
          A.bubblePop(1);
          this.speak(cookie.letter);

          this.cleanupActiveDrag();

          if (btn.setPointerCapture) {
            try { btn.setPointerCapture(e.pointerId); } catch (_) {}
          }

          const isTouch = e.pointerType === 'touch';
          const touchOffsetY = isTouch ? -28 : 0;

          const clone = document.createElement('div');
          clone.className = 'letter-cookie-drag-clone';
          clone.innerHTML = `<span class="cookie-char">${cookie.letter}</span><span class="cookie-deco">✨</span>`;
          clone.style.left = `${e.clientX}px`;
          clone.style.top = `${e.clientY + touchOffsetY}px`;
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
            touchOffsetY,
            moved: false,
            hoveredSlot: null
          };
          this.activeDrag = dragState;

          const onMove = (moveEv) => {
            if (!this.activeDrag) return;
            if (moveEv.pointerId !== undefined && moveEv.pointerId !== dragState.pointerId) return;
            moveEv.preventDefault();

            const dx = moveEv.clientX - dragState.startX;
            const dy = moveEv.clientY - dragState.startY;
            if (Math.hypot(dx, dy) > 6) {
              dragState.moved = true;
            }

            const curX = moveEv.clientX;
            const curY = moveEv.clientY + dragState.touchOffsetY;
            clone.style.left = `${curX}px`;
            clone.style.top = `${curY}px`;

            const emptySlots = this.container.querySelectorAll('.letter-slot.empty');
            let closestSlot = null;
            let closestDist = 9999;

            emptySlots.forEach(slot => {
              const r = slot.getBoundingClientRect();
              const cx = r.left + r.width / 2;
              const cy = r.top + r.height / 2;
              const dist = Math.hypot(curX - cx, curY - cy);
              if (dist < closestDist) {
                closestDist = dist;
                closestSlot = slot;
              }
            });

            this.container.querySelectorAll('.letter-slot').forEach(s => {
              s.classList.remove('slot-magnet-hover', 'slot-magnet-match');
            });

            const magnetRadius = 85;
            if (closestSlot && closestDist < magnetRadius) {
              dragState.hoveredSlot = closestSlot;
              const slotIdx = parseInt(closestSlot.dataset.slot, 10);
              const list = this.getFilteredWords();
              const w = list[this.currentWordIdx] || WORDS[0];
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

          const finishDrag = (upEv) => {
            if (!this.activeDrag) return;
            if (upEv && upEv.pointerId !== undefined && upEv.pointerId !== dragState.pointerId) return;

            if (btn.releasePointerCapture && upEv && upEv.pointerId !== undefined) {
              try { btn.releasePointerCapture(upEv.pointerId); } catch (_) {}
            }

            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', finishDrag);
            window.removeEventListener('pointercancel', finishDrag);
            this.currentDragCleanup = null;

            const cur = this.activeDrag;
            this.activeDrag = null;

            cur.btn.classList.remove('cookie-dragging-origin');
            this.container.querySelectorAll('.letter-slot').forEach(s => {
              s.classList.remove('slot-magnet-hover', 'slot-magnet-match');
            });

            // 1. Toque Rápido (Tap-to-Snap):
            if (!cur.moved) {
              cur.clone.remove();
              this.handleCookieTap(cur.cookieIdx);
              return;
            }

            // 2. Encaje si coincide el molde:
            if (cur.hoveredSlot) {
              const slotIdx = parseInt(cur.hoveredSlot.dataset.slot, 10);
              const list = this.getFilteredWords();
              const w = list[this.currentWordIdx] || WORDS[0];
              const expectedChar = w.letters[slotIdx];

              if (lettersMatch(cur.cookie.letter, expectedChar)) {
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
                A.softBoing();
                cur.hoveredSlot.classList.add('wobble-friendly');
                setTimeout(() => {
                  if (cur.hoveredSlot) cur.hoveredSlot.classList.remove('wobble-friendly');
                }, 450);
              }
            }

            // 3. Retorno elástico a la bandeja:
            const originRect = cur.btn.getBoundingClientRect();
            cur.clone.style.transition = 'all 0.2s ease-out';
            cur.clone.style.left = `${originRect.left + originRect.width / 2}px`;
            cur.clone.style.top = `${originRect.top + originRect.height / 2}px`;
            cur.clone.style.transform = 'translate(-50%, -50%) scale(0.9)';
            cur.clone.style.opacity = '0.4';

            setTimeout(() => {
              cur.clone.remove();
            }, 200);
          };

          this.currentDragCleanup = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', finishDrag);
            window.removeEventListener('pointercancel', finishDrag);
          };

          window.addEventListener('pointermove', onMove, { passive: false });
          window.addEventListener('pointerup', finishDrag);
          window.addEventListener('pointercancel', finishDrag);
        });
      });
    }

    handleCookieTap(cookieIdx) {
      this.cleanupActiveDrag();
      const cookie = this.availableCookies[cookieIdx];
      if (!cookie || cookie.used) return;

      const list = this.getFilteredWords();
      const w = list[this.currentWordIdx] || WORDS[0];
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
        A.softBoing();
        const btn = this.container.querySelector(`.letter-cookie-btn[data-cookie="${cookieIdx}"]`);
        if (btn) {
          btn.classList.add('wobble-friendly');
          setTimeout(() => btn.classList.remove('wobble-friendly'), 500);
        }
      }
    }

    placeLetterSuccess(cookieIdx, slotIdx) {
      this.cleanupActiveDrag();
      const cookie = this.availableCookies[cookieIdx];
      if (!cookie) return;

      cookie.used = true;
      this.placedLetters[slotIdx] = cookie;

      const pitch = 440 + slotIdx * 60;
      A.bellChime(pitch);
      A.collect(slotIdx);
      this.speak(cookie.letter);

      this.render();

      const filledSlot = this.container.querySelector(`.letter-slot[data-slot="${slotIdx}"]`);
      if (filledSlot) {
        this.spawnStarsOnSlot(filledSlot);
      }

      const allFilled = this.placedLetters.every(l => l !== null);
      if (allFilled) {
        setTimeout(() => {
          this.triggerWordVictory();
        }, 400);
      }
    }

    /* -------------------------------------------------------------
       ARRASTRE TÁCTIL DE PALABRAS EN MODO FRASES (6 A 8 AÑOS)
       ------------------------------------------------------------- */
    setupSentenceDragAndDrop() {
      this.cleanupActiveDrag();
      const pillButtons = this.container.querySelectorAll('.sentence-pill-btn');

      pillButtons.forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
          if (e.button !== undefined && e.button !== 0) return;

          const pillIdx = parseInt(btn.dataset.pill, 10);
          const pill = this.availableSentencePills[pillIdx];
          if (!pill || pill.used) return;

          e.preventDefault();
          A.unlock();
          A.bubblePop(1);
          this.speak(pill.word);

          this.cleanupActiveDrag();

          if (btn.setPointerCapture) {
            try { btn.setPointerCapture(e.pointerId); } catch (_) {}
          }

          const isTouch = e.pointerType === 'touch';
          const touchOffsetY = isTouch ? -28 : 0;

          const clone = document.createElement('div');
          clone.className = 'sentence-pill-drag-clone';
          clone.innerHTML = `<span class="pill-word-text">${pill.word}</span><span class="pill-deco">✨</span>`;
          clone.style.left = `${e.clientX}px`;
          clone.style.top = `${e.clientY + touchOffsetY}px`;
          document.body.appendChild(clone);

          btn.classList.add('pill-dragging-origin');

          const s = SENTENCES[this.currentSentenceIdx];
          const dragState = {
            pointerId: e.pointerId,
            pillIdx,
            pill,
            btn,
            clone,
            startX: e.clientX,
            startY: e.clientY,
            touchOffsetY,
            moved: false,
            hoveredSlot: null
          };
          this.activeDrag = dragState;

          const onMove = (moveEv) => {
            if (!this.activeDrag) return;
            if (moveEv.pointerId !== undefined && moveEv.pointerId !== dragState.pointerId) return;
            moveEv.preventDefault();

            const dx = moveEv.clientX - dragState.startX;
            const dy = moveEv.clientY - dragState.startY;
            if (Math.hypot(dx, dy) > 6) {
              dragState.moved = true;
            }

            const curX = moveEv.clientX;
            const curY = moveEv.clientY + dragState.touchOffsetY;
            clone.style.left = `${curX}px`;
            clone.style.top = `${curY}px`;

            const emptySlots = this.container.querySelectorAll('.sentence-slot.empty');
            let closestSlot = null;
            let closestDist = 9999;

            emptySlots.forEach(slot => {
              const r = slot.getBoundingClientRect();
              const cx = r.left + r.width / 2;
              const cy = r.top + r.height / 2;
              const dist = Math.hypot(curX - cx, curY - cy);
              if (dist < closestDist) {
                closestDist = dist;
                closestSlot = slot;
              }
            });

            this.container.querySelectorAll('.sentence-slot').forEach(sl => {
              sl.classList.remove('slot-magnet-hover', 'slot-magnet-match');
            });

            const magnetRadius = 85;
            if (closestSlot && closestDist < magnetRadius) {
              dragState.hoveredSlot = closestSlot;
              const slotIdx = parseInt(closestSlot.dataset.sslot, 10);
              const targetWord = s.words[slotIdx];
              if (pill.word === targetWord) {
                closestSlot.classList.add('slot-magnet-match');
              } else {
                closestSlot.classList.add('slot-magnet-hover');
              }
            } else {
              dragState.hoveredSlot = null;
            }
          };

          const finishDrag = (upEv) => {
            if (!this.activeDrag) return;
            if (upEv && upEv.pointerId !== undefined && upEv.pointerId !== dragState.pointerId) return;

            if (btn.releasePointerCapture && upEv && upEv.pointerId !== undefined) {
              try { btn.releasePointerCapture(upEv.pointerId); } catch (_) {}
            }

            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', finishDrag);
            window.removeEventListener('pointercancel', finishDrag);
            this.currentDragCleanup = null;

            const cur = this.activeDrag;
            this.activeDrag = null;

            cur.btn.classList.remove('pill-dragging-origin');
            this.container.querySelectorAll('.sentence-slot').forEach(sl => {
              sl.classList.remove('slot-magnet-hover', 'slot-magnet-match');
            });

            // 1. Toque Rápido (Tap-to-Snap):
            if (!cur.moved) {
              cur.clone.remove();
              this.handlePillTap(cur.pillIdx);
              return;
            }

            // 2. Encaje si coincide la palabra:
            if (cur.hoveredSlot) {
              const slotIdx = parseInt(cur.hoveredSlot.dataset.sslot, 10);
              const targetWord = s.words[slotIdx];

              if (cur.pill.word === targetWord) {
                const sRect = cur.hoveredSlot.getBoundingClientRect();
                cur.clone.style.transition = 'all 0.14s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                cur.clone.style.left = `${sRect.left + sRect.width / 2}px`;
                cur.clone.style.top = `${sRect.top + sRect.height / 2}px`;
                cur.clone.style.transform = 'translate(-50%, -50%) scale(1)';

                setTimeout(() => {
                  cur.clone.remove();
                  this.placeSentenceWordSuccess(cur.pillIdx, slotIdx);
                }, 140);
                return;
              } else {
                A.softBoing();
                cur.hoveredSlot.classList.add('wobble-friendly');
                setTimeout(() => {
                  if (cur.hoveredSlot) cur.hoveredSlot.classList.remove('wobble-friendly');
                }, 450);
              }
            }

            // 3. Retorno elástico a la bandeja:
            const btnRect = cur.btn.getBoundingClientRect();
            cur.clone.style.transition = 'all 0.2s ease-out';
            cur.clone.style.left = `${btnRect.left + btnRect.width / 2}px`;
            cur.clone.style.top = `${btnRect.top + btnRect.height / 2}px`;
            cur.clone.style.transform = 'translate(-50%, -50%) scale(0.9)';
            cur.clone.style.opacity = '0.4';

            setTimeout(() => {
              cur.clone.remove();
            }, 200);
          };

          this.currentDragCleanup = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', finishDrag);
            window.removeEventListener('pointercancel', finishDrag);
          };

          window.addEventListener('pointermove', onMove, { passive: false });
          window.addEventListener('pointerup', finishDrag);
          window.addEventListener('pointercancel', finishDrag);
        });
      });
    }

    handlePillTap(pillIdx) {
      const pill = this.availableSentencePills[pillIdx];
      if (!pill || pill.used) return;

      const s = SENTENCES[this.currentSentenceIdx];
      let targetSlotIdx = -1;
      for (let i = 0; i < s.words.length; i++) {
        if (!this.placedSentenceWords[i] && pill.word === s.words[i]) {
          targetSlotIdx = i;
          break;
        }
      }

      if (targetSlotIdx !== -1) {
        this.placeSentenceWordSuccess(pillIdx, targetSlotIdx);
      } else {
        A.softBoing();
        const btn = this.container.querySelector(`.sentence-pill-btn[data-pill="${pillIdx}"]`);
        if (btn) {
          btn.classList.add('wobble-friendly');
          setTimeout(() => btn.classList.remove('wobble-friendly'), 500);
        }
      }
    }

    placeSentenceWordSuccess(pillIdx, slotIdx) {
      const pill = this.availableSentencePills[pillIdx];
      if (!pill) return;

      pill.used = true;
      this.placedSentenceWords[slotIdx] = pill;

      A.bellChime(480 + slotIdx * 70);
      A.collect(slotIdx);
      this.speak(pill.word);

      this.render();

      const filledSlot = this.container.querySelector(`.sentence-slot[data-sslot="${slotIdx}"]`);
      if (filledSlot) {
        this.spawnStarsOnSlot(filledSlot);
      }

      const allFilled = this.placedSentenceWords.every(w => w !== null);
      if (allFilled) {
        setTimeout(() => {
          this.triggerSentenceVictory();
        }, 400);
      }
    }

    spawnStarsOnSlot(slotEl) {
      const r = slotEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const icons = ['✨', '⭐', '🌸', '💖', '🍪', '📖'];

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
      const list = this.getFilteredWords();
      const w = list[this.currentWordIdx] || WORDS[0];
      A.celebrate();
      this.speak(`¡Excelente Amanda! ¡Completaste la palabra ${w.word}!`);

      const modal = document.createElement('div');
      modal.className = 'w-victory-modal-overlay';
      modal.innerHTML = `
        <div class="w-victory-card">
          <div class="w-victory-badge">🎉 ¡PALABRA COMPLETADA! 🎉</div>
          <h2 style="color: ${w.color}">${w.word}</h2>
          <div class="w-victory-img-box">
            <img src="${w.img}" alt="${w.word}" />
          </div>
          <p>¡Amanda, eres una campeona de las palabras en Cinnamoroll Land! ✨</p>
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
        const nextIdx = (this.currentWordIdx + 1) % list.length;
        this.loadWord(nextIdx);
        this.render();
        const nextList = this.getFilteredWords();
        if (nextList[nextIdx]) this.speak(nextList[nextIdx].word);
      });

      modal.querySelector('#btnRepeatWordModal').addEventListener('click', () => {
        A.unlock();
        modal.remove();
        this.loadWord(this.currentWordIdx);
        this.render();
      });
    }

    triggerSentenceVictory() {
      const s = SENTENCES[this.currentSentenceIdx];
      A.celebrate();
      this.speak(`¡Maravilloso Amanda! ¡Leíste y ordenaste la frase: ${s.phrase}!`);

      const modal = document.createElement('div');
      modal.className = 'w-victory-modal-overlay';
      modal.innerHTML = `
        <div class="w-victory-card">
          <div class="w-victory-badge">📖 ¡FRASE MÁGICA LEÍDA Y COMPLETADA! 📖</div>
          <h2 style="color: #4338ca; font-size: 24px;">${s.phrase}</h2>
          <div class="w-victory-img-box">
            <img src="${s.img}" alt="${s.phrase}" />
          </div>
          <p>¡Amanda, qué gran lectora y escritora eres! 💖</p>
          <div class="w-victory-actions">
            <button class="btn-w-next" id="btnNextSentenceModal">▶ Siguiente Frase</button>
            <button class="btn-w-repeat" id="btnRepeatSentenceModal">🔄 Repetir</button>
          </div>
        </div>
      `;
      this.container.appendChild(modal);

      modal.querySelector('#btnNextSentenceModal').addEventListener('click', () => {
        A.unlock();
        modal.remove();
        const nextIdx = (this.currentSentenceIdx + 1) % SENTENCES.length;
        this.loadSentence(nextIdx);
        this.render();
        this.speak(SENTENCES[nextIdx].phrase);
      });

      modal.querySelector('#btnRepeatSentenceModal').addEventListener('click', () => {
        A.unlock();
        modal.remove();
        this.loadSentence(this.currentSentenceIdx);
        this.render();
      });
    }

    // --- SETUP MODO 3: TRAZADO SENSORIAL CON ESTRELLAS ---
    setupTraceCanvas() {
      const canvas = this.container.querySelector('#traceCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const list = this.getFilteredWords();
      const w = list[this.currentWordIdx] || WORDS[0];
      const char = w.letters[this.selectedTraceLetterIdx] || 'A';

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#2d3748';
      ctx.roundRect(0, 0, canvas.width, canvas.height, 24);
      ctx.fill();

      ctx.font = '800 220px "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeText(char, canvas.width / 2, canvas.height / 2 + 10);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillText(char, canvas.width / 2, canvas.height / 2 + 10);

      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 12]);
      ctx.strokeText(char, canvas.width / 2, canvas.height / 2 + 10);
      ctx.setLineDash([]);

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

    // --- SETUP MODO 4: PIZARRA LIBRE DE TIZAS PASTEL ---
    setupFreeCanvas() {
      const canvas = this.container.querySelector('#freeChalkCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1e293b';
      ctx.roundRect(0, 0, canvas.width, canvas.height, 24);
      ctx.fill();

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
