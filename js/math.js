/* La Pastelería Mágica de Cinnamoroll & Milk
 * Juego preescolar de sumas y restas adaptado con amor y pedagogía para 5 años.
 * Personajes animados, conteo táctil interactivo, y guía positiva "¿Estás segura? ¡Contemos juntas!".
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const TREAT_TYPES = [
    { name: 'rollito', emoji: '🍥', label: 'Rollitos de Canela' },
    { name: 'frutilla', emoji: '🍓', label: 'Frutillas Dulces' },
    { name: 'galleta', emoji: '⭐', label: 'Galletas Estrella' },
    { name: 'caramelo', emoji: '🍬', label: 'Caramelitos' },
    { name: 'cupcake', emoji: '🧁', label: 'Cupcakes Rosados' }
  ];

  class MathBakeryGame {
    constructor() {
      this.container = null;
      this.mode = 'add'; // 'add', 'sub', 'mix'
      this.score = 0;
      this.totalGoal = 5;
      this.currentOp = '+';
      this.numA = 2;
      this.numB = 1;
      this.total = 3;
      this.treatType = TREAT_TYPES[0];
      this.countedItems = new Set();
      this.answered = false;
      this.isCountingHelpActive = false;
    }

    init(containerEl) {
      this.container = containerEl;
      this.score = 0;
      this.nextRound();
    }

    setMode(newMode) {
      this.mode = newMode;
      this.nextRound();
    }

    nextRound() {
      this.answered = false;
      this.isCountingHelpActive = false;
      this.countedItems.clear();

      // Determinar operación según modo
      if (this.mode === 'mix') {
        this.currentOp = Math.random() > 0.5 ? '+' : '-';
      } else if (this.mode === 'sub') {
        this.currentOp = '-';
      } else {
        this.currentOp = '+';
      }

      this.treatType = TREAT_TYPES[Math.floor(Math.random() * TREAT_TYPES.length)];

      if (this.currentOp === '+') {
        // Sumas sencillas para 5 años: totales entre 2 y 6
        this.numA = 1 + Math.floor(Math.random() * 3); // 1, 2, 3
        this.numB = 1 + Math.floor(Math.random() * 3); // 1, 2, 3
        this.total = this.numA + this.numB;
      } else {
        // Restas sencillas: total original 3 a 6, resta 1 a 2
        this.numA = 2 + Math.floor(Math.random() * 4); // 2, 3, 4, 5
        this.numB = 1 + Math.floor(Math.random() * (this.numA - 1)); // 1 hasta A-1
        this.total = this.numA - this.numB;
      }

      this.render();
    }

    render() {
      // Opciones de respuesta: el valor correcto + 2 distractores
      const pool = [1, 2, 3, 4, 5, 6, 7].filter(n => n !== this.total);
      pool.sort(() => Math.random() - 0.5);
      const options = [this.total, pool[0], pool[1]].sort((a, b) => a - b);

      this.container.innerHTML = `
        <div class="math-wrap">
          <!-- Barra superior: Modo de juego y Progreso -->
          <div class="math-top-bar">
            <div class="mode-toggles">
              <button class="mode-btn ${this.mode === 'add' ? 'active' : ''}" data-mode="add">➕ Sumas</button>
              <button class="mode-btn ${this.mode === 'sub' ? 'active' : ''}" data-mode="sub">➖ Restas</button>
              <button class="mode-btn ${this.mode === 'mix' ? 'active' : ''}" data-mode="mix">🎲 Mezcla</button>
            </div>
            <div class="math-progress-pills">
              ${Array.from({ length: this.totalGoal }).map((_, i) => `
                <span class="math-star-pill ${i < this.score ? 'done' : ''}">🍪</span>
              `).join('')}
            </div>
          </div>

          <!-- Escenario de la pastelería -->
          <div class="bakery-stage">
            <!-- Cinnamoroll a la izquierda -->
            <div class="baker-char cinna-side" id="cinnaBaker">
              <div class="cinna-avatar-wrap">
                <img src="cinnamoroll_sprite.png" class="cinna-char-img" alt="Cinnamoroll" />
              </div>
              <div class="char-bubble cinna-bubble" id="cinnaBubble">
                ${this.currentOp === '+' 
                  ? `¡Tengo <strong>${this.numA}</strong> ${this.treatType.emoji}!` 
                  : `¡Preparé <strong>${this.numA}</strong> ${this.treatType.emoji}!`}
              </div>
            </div>

            <!-- Bandeja de dulces en el centro -->
            <div class="bakery-tray-container" id="trayContainer">
              <div class="tray-hint">👆 ¡Toca los dulces para contarlos con tu dedo!</div>
              
              <div class="sweet-tray">
                ${this.currentOp === '+' ? `
                  <!-- Grupo A -->
                  <div class="treat-cluster group-left">
                    ${Array.from({ length: this.numA }).map((_, i) => `
                      <button class="treat-btn" data-idx="a-${i}" aria-label="Dulce ${i + 1}">
                        <span class="treat-graphic">${this.treatType.emoji}</span>
                        <span class="treat-count hidden"></span>
                      </button>
                    `).join('')}
                  </div>

                  <div class="math-sign-symbol">➕</div>

                  <!-- Grupo B -->
                  <div class="treat-cluster group-right">
                    ${Array.from({ length: this.numB }).map((_, i) => `
                      <button class="treat-btn" data-idx="b-${i}" aria-label="Dulce ${this.numA + i + 1}">
                        <span class="treat-graphic">${this.treatType.emoji}</span>
                        <span class="treat-count hidden"></span>
                      </button>
                    `).join('')}
                  </div>
                ` : `
                  <!-- Modo Resta: Dulces que quedan vs dulces que comió Milk -->
                  <div class="treat-cluster group-remain">
                    ${Array.from({ length: this.total }).map((_, i) => `
                      <button class="treat-btn remain-item" data-idx="r-${i}">
                        <span class="treat-graphic">${this.treatType.emoji}</span>
                        <span class="treat-count hidden"></span>
                      </button>
                    `).join('')}
                  </div>

                  <div class="math-sign-symbol">➖</div>

                  <div class="treat-cluster group-eaten">
                    ${Array.from({ length: this.numB }).map((_, i) => `
                      <div class="treat-btn eaten-item" title="¡Milk se comió este dulce!">
                        <span class="treat-graphic muted">${this.treatType.emoji}</span>
                        <span class="eaten-badge">😋</span>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>

            <!-- Milk a la derecha (Completamente animado) -->
            <div class="baker-char milk-side" id="milkBaker">
              <div class="milk-avatar-wrap">
                <svg viewBox="0 0 120 110" class="milk-svg-enhanced" id="milkSvg">
                  <defs>
                    <linearGradient id="milkEye" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#40c4ff" />
                      <stop offset="100%" stop-color="#0288d1" />
                    </linearGradient>
                    <radialGradient id="pacifierGlow" cx="40%" cy="40%" r="60%">
                      <stop offset="0%" stop-color="#b3e5fc" />
                      <stop offset="100%" stop-color="#4fc3f7" />
                    </radialGradient>
                  </defs>

                  <!-- Orejitas caídas y tiernas de Milk -->
                  <g class="milk-ears">
                    <path class="milk-ear ear-l" d="M 32,58 C 12,48 2,68 8,92 C 14,106 32,102 36,82 C 38,70 36,62 32,58 Z" 
                          fill="#ffffff" stroke="#5c3d2e" stroke-width="3.5" stroke-linejoin="round" />
                    <path class="milk-ear ear-r" d="M 88,58 C 108,48 118,68 112,92 C 106,106 88,102 84,82 C 82,70 84,62 88,58 Z" 
                          fill="#ffffff" stroke="#5c3d2e" stroke-width="3.5" stroke-linejoin="round" />
                  </g>

                  <!-- Cuerpo de bebé -->
                  <ellipse cx="60" cy="85" rx="28" ry="20" fill="#ffffff" stroke="#5c3d2e" stroke-width="3.5" />
                  <!-- Patitas de bebé -->
                  <ellipse cx="48" cy="100" rx="9" ry="6" fill="#ffffff" stroke="#5c3d2e" stroke-width="3" />
                  <ellipse cx="72" cy="100" rx="9" ry="6" fill="#ffffff" stroke="#5c3d2e" stroke-width="3" />

                  <!-- Cabeza redondita -->
                  <ellipse cx="60" cy="54" rx="38" ry="30" fill="#ffffff" stroke="#5c3d2e" stroke-width="3.5" />

                  <!-- Mechas/rulo característico de la cabeza de Milk -->
                  <path d="M 60,25 C 54,20 62,12 68,18 C 72,22 66,27 60,25 Z" 
                        fill="#ffffff" stroke="#5c3d2e" stroke-width="3" stroke-linecap="round" />

                  <!-- Mejillas rosadas súper tiernas -->
                  <ellipse cx="36" cy="62" rx="8" ry="5" fill="#ffb6d2" />
                  <ellipse cx="84" cy="62" rx="8" ry="5" fill="#ffb6d2" />

                  <!-- Ojos grandes celestes brillantes -->
                  <g class="milk-eyes" id="milkEyes">
                    <ellipse cx="46" cy="50" rx="5" ry="7.5" fill="url(#milkEye)" stroke="#5c3d2e" stroke-width="1.5" />
                    <ellipse cx="74" cy="50" rx="5" ry="7.5" fill="url(#milkEye)" stroke="#5c3d2e" stroke-width="1.5" />
                    <!-- Brillos de los ojos -->
                    <circle cx="44.5" cy="47" r="2.2" fill="#ffffff" />
                    <circle cx="47.5" cy="53" r="1.1" fill="#ffffff" />
                    <circle cx="72.5" cy="47" r="2.2" fill="#ffffff" />
                    <circle cx="75.5" cy="53" r="1.1" fill="#ffffff" />
                  </g>

                  <!-- Chupete azul oficial de Milk -->
                  <g class="milk-pacifier" id="milkPacifier">
                    <ellipse cx="60" cy="64" rx="11" ry="8" fill="url(#pacifierGlow)" stroke="#5c3d2e" stroke-width="2.8" />
                    <circle cx="60" cy="69" r="6" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.2" />
                  </g>
                </svg>
              </div>
              <div class="char-bubble milk-bubble" id="milkBubble">
                ${this.currentOp === '+' 
                  ? `¡Y yo traje <strong>${this.numB}</strong>! 🍼` 
                  : `¡Me comí <strong>${this.numB}</strong>! 😋`}
              </div>
            </div>
          </div>

          <!-- Pregunta pedagógica y botones grandes de respuesta -->
          <div class="math-question-panel">
            <h2 id="mathQuestionText">
              ${this.currentOp === '+' 
                ? '¿Cuántos dulces hay en total en la mesa?' 
                : '¿Cuántos dulces quedaron en la bandeja?'}
            </h2>
            <div class="options-grid">
              ${options.map(val => `
                <button class="math-ans-btn" data-val="${val}">
                  <span class="math-ans-number">${val}</span>
                  <span class="math-ans-dots">${'🍓'.repeat(val)}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      this.bindEvents();
    }

    bindEvents() {
      // Cambio de modo (Sumas / Restas / Mezcla)
      this.container.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          this.setMode(e.currentTarget.dataset.mode);
        });
      });

      // Tocar dulces individuales para contarlos con el dedito
      this.container.querySelectorAll('.treat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          const target = e.currentTarget;
          const idx = target.dataset.idx;
          if (!idx) return;

          this.countedItems.add(idx);
          const currentCount = this.countedItems.size;

          A.bubblePop(currentCount);

          target.classList.add('pop-counted');
          const badge = target.querySelector('.treat-count');
          if (badge) {
            badge.textContent = currentCount;
            badge.classList.remove('hidden');
          }

          setTimeout(() => target.classList.remove('pop-counted'), 400);
        });
      });

      // Tocar las respuestas numéricas
      this.container.querySelectorAll('.math-ans-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (this.answered || this.isCountingHelpActive) return;
          A.unlock();
          const chosen = parseInt(e.currentTarget.dataset.val, 10);

          if (chosen === this.total) {
            this.handleSuccess(e.currentTarget);
          } else {
            this.handleDoubtAndGuide(e.currentTarget);
          }
        });
      });
    }

    handleSuccess(btnEl) {
      this.answered = true;
      this.score++;
      btnEl.classList.add('correct');

      A.celebrate();

      // Animación de fiesta en Cinnamoroll y Milk
      const cinna = this.container.querySelector('#cinnaBaker');
      const milk = this.container.querySelector('#milkBaker');
      const milkBubble = this.container.querySelector('#milkBubble');
      const cinnaBubble = this.container.querySelector('#cinnaBubble');

      if (cinna) cinna.classList.add('party-jump');
      if (milk) milk.classList.add('party-jump');

      if (milkBubble) milkBubble.innerHTML = '¡Siii, contaste muy bien! 💖';
      if (cinnaBubble) cinnaBubble.innerHTML = '¡Eres una gran pastelera! 🌟';

      // Revelar todos los números ordenados en los dulces
      const activeTreats = this.container.querySelectorAll('.sweet-tray .treat-btn:not(.eaten-item)');
      activeTreats.forEach((item, i) => {
        const badge = item.querySelector('.treat-count');
        if (badge) {
          badge.textContent = i + 1;
          badge.classList.remove('hidden');
        }
      });

      setTimeout(() => {
        if (this.score >= this.totalGoal) {
          this.showVictoryScreen();
        } else {
          this.nextRound();
        }
      }, 1900);
    }

    /* Reacción pedagógica cuando eligen una respuesta incorrecta:
     * Milk reacciona con duda tierna: "¿Estás segura, Amanda? 🤔 ¡Contemos juntas!".
     * Se iluminan los pastelitos uno por uno para que la niña aprenda sin frustración.
     */
    handleDoubtAndGuide(btnEl) {
      A.softBoing();
      btnEl.classList.add('wobble-friendly');
      setTimeout(() => btnEl.classList.remove('wobble-friendly'), 600);

      const milk = this.container.querySelector('#milkBaker');
      const milkBubble = this.container.querySelector('#milkBubble');
      const tray = this.container.querySelector('#trayContainer');

      if (milk) {
        milk.classList.add('curious-tilt');
        setTimeout(() => milk.classList.remove('curious-tilt'), 2000);
      }

      if (milkBubble) {
        milkBubble.innerHTML = '¿Estás segura? 🤔 ¡Contemos juntas!';
        milkBubble.classList.add('highlight-speech');
        setTimeout(() => milkBubble.classList.remove('highlight-speech'), 2200);
      }

      if (tray) {
        tray.classList.add('gentle-pulse');
        setTimeout(() => tray.classList.remove('gentle-pulse'), 1200);
      }

      // Guía paso a paso: ilumina y cuenta cada pastelito que debe ser contado
      this.isCountingHelpActive = true;
      const targets = Array.from(this.container.querySelectorAll('.sweet-tray .treat-btn:not(.eaten-item)'));

      targets.forEach((item, index) => {
        setTimeout(() => {
          if (!this.container) return;
          item.classList.add('glow-count');
          A.bubblePop(index + 1);
          const badge = item.querySelector('.treat-count');
          if (badge) {
            badge.textContent = index + 1;
            badge.classList.remove('hidden');
          }
          setTimeout(() => item.classList.remove('glow-count'), 500);

          if (index === targets.length - 1) {
            setTimeout(() => {
              this.isCountingHelpActive = false;
            }, 600);
          }
        }, (index + 1) * 450);
      });
    }

    showVictoryScreen() {
      A.celebrate();
      this.container.innerHTML = `
        <div class="math-victory-box">
          <div class="victory-confetti-badge">🎉 ¡Excelente Pastelera Amanda! 🎉</div>
          <h2>¡Completaste todos los pedidos de la pastelería!</h2>
          <div class="victory-bakers-row">
            <div class="victory-mascot-cinna">
              <img src="cinnamoroll_sprite.png" alt="Cinnamoroll" />
              <span>Cinnamoroll</span>
            </div>
            <div class="giant-cake">🎂✨</div>
            <div class="victory-mascot-milk">
              <svg viewBox="0 0 120 110" width="120" height="110">
                <g class="milk-ears">
                  <path d="M 32,58 C 12,48 2,68 8,92 C 14,106 32,102 36,82 C 38,70 36,62 32,58 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="3.5" />
                  <path d="M 88,58 C 108,48 118,68 112,92 C 106,106 88,102 84,82 C 82,70 84,62 88,58 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="3.5" />
                </g>
                <ellipse cx="60" cy="85" rx="28" ry="20" fill="#ffffff" stroke="#5c3d2e" stroke-width="3.5" />
                <ellipse cx="60" cy="54" rx="38" ry="30" fill="#ffffff" stroke="#5c3d2e" stroke-width="3.5" />
                <path d="M 60,25 C 54,20 62,12 68,18 C 72,22 66,27 60,25 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="3" />
                <ellipse cx="36" cy="62" rx="8" ry="5" fill="#ffb6d2" />
                <ellipse cx="84" cy="62" rx="8" ry="5" fill="#ffb6d2" />
                <ellipse cx="46" cy="50" rx="5" ry="7.5" fill="#0288d1" stroke="#5c3d2e" stroke-width="1.5" />
                <ellipse cx="74" cy="50" rx="5" ry="7.5" fill="#0288d1" stroke="#5c3d2e" stroke-width="1.5" />
                <circle cx="44.5" cy="47" r="2.2" fill="#ffffff" />
                <circle cx="72.5" cy="47" r="2.2" fill="#ffffff" />
                <ellipse cx="60" cy="64" rx="11" ry="8" fill="#4fc3f7" stroke="#5c3d2e" stroke-width="2.8" />
                <circle cx="60" cy="69" r="6" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.2" />
              </svg>
              <span>Milk</span>
            </div>
          </div>
          <p class="victory-cheer">¡Eres súper inteligente y cariñosa! 🌸</p>
          <button id="btnMathReplay" class="btn-math-replay">▶ ¡Jugar otra ronda!</button>
        </div>
      `;

      this.container.querySelector('#btnMathReplay').addEventListener('click', () => {
        A.unlock();
        A.bubblePop(1);
        this.init(this.container);
      });
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.mathGame = new MathBakeryGame();
})();
