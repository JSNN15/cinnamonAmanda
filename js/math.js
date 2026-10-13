/* La Pastelería Mágica de Cinnamoroll & Milk
 * Juego preescolar de sumas y restas con los personajes OFICIALES de Sanrio.
 * Cinnamoroll y Milk (con su osito, chupete y rulo), guía pedagógica amorosa
 * "¿Estás segura Amanda? ¡Contemos juntas!" y conteo táctil interactivo.
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

      if (this.mode === 'mix') {
        this.currentOp = Math.random() > 0.5 ? '+' : '-';
      } else if (this.mode === 'sub') {
        this.currentOp = '-';
      } else {
        this.currentOp = '+';
      }

      this.treatType = TREAT_TYPES[Math.floor(Math.random() * TREAT_TYPES.length)];

      if (this.currentOp === '+') {
        this.numA = 1 + Math.floor(Math.random() * 3); // 1..3
        this.numB = 1 + Math.floor(Math.random() * 3); // 1..3
        this.total = this.numA + this.numB;
      } else {
        this.numA = 2 + Math.floor(Math.random() * 4); // 2..5
        this.numB = 1 + Math.floor(Math.random() * (this.numA - 1)); // 1..A-1
        this.total = this.numA - this.numB;
      }

      this.render();
    }

    render() {
      const pool = [1, 2, 3, 4, 5, 6, 7].filter(n => n !== this.total);
      pool.sort(() => Math.random() - 0.5);
      const options = [this.total, pool[0], pool[1]].sort((a, b) => a - b);

      this.container.innerHTML = `
        <div class="math-wrap">
          <!-- Barra superior de Modo y Progreso -->
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

          <!-- Escenario con personajes OFICIALES -->
          <div class="bakery-stage">
            <!-- Cinnamoroll Oficial a la izquierda -->
            <div class="baker-char cinna-side" id="cinnaBaker">
              <div class="cinna-avatar-wrap">
                <img src="assets/cinnamoroll_fly.png" class="official-baker-img cinna-official" alt="Cinnamoroll" />
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
                  <div class="treat-cluster group-left">
                    ${Array.from({ length: this.numA }).map((_, i) => `
                      <button class="treat-btn" data-idx="a-${i}" aria-label="Dulce ${i + 1}">
                        <span class="treat-graphic">${this.treatType.emoji}</span>
                        <span class="treat-count hidden"></span>
                      </button>
                    `).join('')}
                  </div>

                  <div class="math-sign-symbol">➕</div>

                  <div class="treat-cluster group-right">
                    ${Array.from({ length: this.numB }).map((_, i) => `
                      <button class="treat-btn" data-idx="b-${i}" aria-label="Dulce ${this.numA + i + 1}">
                        <span class="treat-graphic">${this.treatType.emoji}</span>
                        <span class="treat-count hidden"></span>
                      </button>
                    `).join('')}
                  </div>
                ` : `
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

            <!-- Milk Oficial con su osito y chupete a la derecha -->
            <div class="baker-char milk-side" id="milkBaker">
              <div class="milk-avatar-wrap">
                <img src="assets/milk_teddy.png" class="official-baker-img milk-official" id="milkImg" alt="Milk" />
              </div>
              <div class="char-bubble milk-bubble" id="milkBubble">
                ${this.currentOp === '+' 
                  ? `¡Y yo traje <strong>${this.numB}</strong>! 🍼` 
                  : `¡Me comí <strong>${this.numB}</strong>! 😋`}
              </div>
            </div>
          </div>

          <!-- Pregunta pedagógica y opciones de respuesta -->
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
      // Cambio de modo
      this.container.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          this.setMode(e.currentTarget.dataset.mode);
        });
      });

      // Conteo táctil de dulces
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

      // Respuestas
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

      const cinna = this.container.querySelector('#cinnaBaker');
      const milk = this.container.querySelector('#milkBaker');
      const milkBubble = this.container.querySelector('#milkBubble');
      const cinnaBubble = this.container.querySelector('#cinnaBubble');

      if (cinna) cinna.classList.add('party-jump');
      if (milk) milk.classList.add('party-jump');

      if (milkBubble) milkBubble.innerHTML = '¡Siii, contaste muy bien Amanda! 💖';
      if (cinnaBubble) cinnaBubble.innerHTML = '¡Eres una gran pastelera! 🌟';

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
        milkBubble.innerHTML = '¿Estás segura Amanda? 🤔 ¡Contemos juntas!';
        milkBubble.classList.add('highlight-speech');
        setTimeout(() => milkBubble.classList.remove('highlight-speech'), 2200);
      }

      if (tray) {
        tray.classList.add('gentle-pulse');
        setTimeout(() => tray.classList.remove('gentle-pulse'), 1200);
      }

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
              <img src="assets/cinnamoroll_fly.png" alt="Cinnamoroll" />
              <span>Cinnamoroll</span>
            </div>
            <div class="giant-cake">🎂✨</div>
            <div class="victory-mascot-milk">
              <img src="assets/milk_teddy.png" alt="Milk" />
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
