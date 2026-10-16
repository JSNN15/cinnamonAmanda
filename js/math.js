/* La Pastelería Mágica de Cinnamoroll & Milk
 * Juego de cálculo mental y aritmética adaptado para 5 a 8 años (Kínder a 3° Básico).
 * 
 * Enfoque Pedagógico por Edades:
 *  - 🍼 Kínder (5-6 años): Sumas y restas hasta 10 con conteo interactivo con el dedo.
 *  - 🎒 1° Básico (6-7 años): Sumas y restas hasta 20 con cálculo mental.
 *  - 🚀 2°-3° Básico (7-8 años): Operaciones hasta 40 y multiplicaciones dulces (2x, 3x, 4x, 5x).
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
      this.ageTier = '5-6'; // '5-6', '6-7', '7-8'
      this.mode = 'add'; // 'add', 'sub', 'mult', 'mix'
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
      this.guideTimeouts = [];
    }

    clearGuideTimeouts() {
      if (this.guideTimeouts) {
        this.guideTimeouts.forEach(t => clearTimeout(t));
        this.guideTimeouts = [];
      }
      this.isCountingHelpActive = false;
    }

    stop() {
      this.clearGuideTimeouts();
    }

    init(containerEl) {
      this.clearGuideTimeouts();
      this.container = containerEl;
      this.score = 0;
      this.nextRound();
    }

    setTier(newTier) {
      this.clearGuideTimeouts();
      this.ageTier = newTier;
      this.nextRound();
    }

    setMode(newMode) {
      this.clearGuideTimeouts();
      this.mode = newMode;
      this.nextRound();
    }

    nextRound() {
      this.clearGuideTimeouts();
      this.answered = false;
      this.isCountingHelpActive = false;
      this.countedItems.clear();

      // Determinar operador según modo y edad
      if (this.mode === 'mix') {
        const ops = (this.ageTier === '7-8') ? ['+', '-', 'x'] : ['+', '-'];
        this.currentOp = ops[Math.floor(Math.random() * ops.length)];
      } else if (this.mode === 'mult') {
        this.currentOp = 'x';
      } else if (this.mode === 'sub') {
        this.currentOp = '-';
      } else {
        this.currentOp = '+';
      }

      this.treatType = TREAT_TYPES[Math.floor(Math.random() * TREAT_TYPES.length)];

      if (this.currentOp === '+') {
        if (this.ageTier === '5-6') {
          this.numA = 1 + Math.floor(Math.random() * 4); // 1..4
          this.numB = 1 + Math.floor(Math.random() * 4); // 1..4
        } else if (this.ageTier === '6-7') {
          this.numA = 3 + Math.floor(Math.random() * 8); // 3..10
          this.numB = 2 + Math.floor(Math.random() * 7); // 2..8
        } else {
          // 7-8 años: sumas hasta 35
          this.numA = 7 + Math.floor(Math.random() * 14); // 7..20
          this.numB = 5 + Math.floor(Math.random() * 12); // 5..16
        }
        this.total = this.numA + this.numB;
      } else if (this.currentOp === '-') {
        if (this.ageTier === '5-6') {
          this.numA = 3 + Math.floor(Math.random() * 5); // 3..7
          this.numB = 1 + Math.floor(Math.random() * (this.numA - 1));
        } else if (this.ageTier === '6-7') {
          this.numA = 8 + Math.floor(Math.random() * 11); // 8..18
          this.numB = 2 + Math.floor(Math.random() * (this.numA - 3));
        } else {
          // 7-8 años: restas de dos dígitos
          this.numA = 15 + Math.floor(Math.random() * 18); // 15..32
          this.numB = 4 + Math.floor(Math.random() * (this.numA - 5));
        }
        this.total = this.numA - this.numB;
      } else {
        // Multiplicación dulce (2x, 3x, 4x, 5x para 7-8 años)
        this.numA = 2 + Math.floor(Math.random() * 4); // 2..5
        this.numB = 2 + Math.floor(Math.random() * 4); // 2..5
        this.total = this.numA * this.numB;
      }

      this.render();
    }

    render() {
      // Generar 3 opciones inteligentes alrededor del resultado
      const offsets = [-3, -2, -1, 1, 2, 3].sort(() => Math.random() - 0.5);
      const candidates = new Set([this.total]);
      for (const off of offsets) {
        const val = this.total + off;
        if (val > 0 && val !== this.total) {
          candidates.add(val);
          if (candidates.size === 3) break;
        }
      }
      const options = Array.from(candidates).sort((a, b) => a - b);

      this.container.innerHTML = `
        <div class="math-wrap">
          <!-- Barra superior: Selector de Edad y Modos -->
          <div class="math-top-bar">
            <!-- Selector de Edad para 5 a 8 años -->
            <div class="math-age-tier-row">
              <span class="math-tier-title">🎯 Nivel:</span>
              <button class="math-tier-btn ${this.ageTier === '5-6' ? 'active' : ''}" data-tier="5-6">
                🍼 5-6 Años (Kínder)
              </button>
              <button class="math-tier-btn ${this.ageTier === '6-7' ? 'active' : ''}" data-tier="6-7">
                🎒 6-7 Años (1° Básico)
              </button>
              <button class="math-tier-btn ${this.ageTier === '7-8' ? 'active' : ''}" data-tier="7-8">
                🚀 7-8 Años (2°-3° Básico)
              </button>
            </div>

            <!-- Selector de Operaciones -->
            <div class="mode-toggles">
              <button class="mode-btn ${this.mode === 'add' ? 'active' : ''}" data-mode="add">➕ Sumas</button>
              <button class="mode-btn ${this.mode === 'sub' ? 'active' : ''}" data-mode="sub">➖ Restas</button>
              ${this.ageTier === '7-8' ? `
                <button class="mode-btn ${this.mode === 'mult' ? 'active' : ''}" data-mode="mult">✖️ Tablas</button>
              ` : ''}
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
            <!-- Cinnamoroll Oficial -->
            <div class="baker-char cinna-side" id="cinnaBaker">
              <div class="cinna-avatar-wrap">
                <img src="assets/cinnamoroll_fly.png" class="official-baker-img cinna-official" alt="Cinnamoroll" />
              </div>
              <div class="char-bubble cinna-bubble" id="cinnaBubble">
                ${this.currentOp === '+' 
                  ? `¡Tengo <strong>${this.numA}</strong> ${this.treatType.emoji}!` 
                  : (this.currentOp === '-'
                    ? `¡Preparé <strong>${this.numA}</strong> ${this.treatType.emoji}!`
                    : `¡Horneé <strong>${this.numA}</strong> bandejas!`)}
              </div>
            </div>

            <!-- Bandeja de dulces en el centro -->
            <div class="bakery-tray-container" id="trayContainer">
              <div class="tray-hint">👆 ¡Toca los dulces para contarlos con tu dedo!</div>
              
              <div class="sweet-tray">
                ${this.renderTrayElements()}
              </div>
            </div>

            <!-- Milk Oficial -->
            <div class="baker-char milk-side" id="milkBaker">
              <div class="milk-avatar-wrap">
                <img src="assets/milk_teddy.png" class="official-baker-img milk-official" id="milkImg" alt="Milk" />
              </div>
              <div class="char-bubble milk-bubble" id="milkBubble">
                ${this.currentOp === '+' 
                  ? `¡Y yo traje <strong>${this.numB}</strong>! 🍼` 
                  : (this.currentOp === '-'
                    ? `¡Me comí <strong>${this.numB}</strong>! 😋`
                    : `¡Con <strong>${this.numB}</strong> ${this.treatType.emoji} cada una!`)}
              </div>
            </div>
          </div>

          <!-- Pregunta pedagógica y opciones de respuesta -->
          <div class="math-question-panel">
            <h2 id="mathQuestionText">
              ${this.currentOp === '+' 
                ? `¿Cuánto es ${this.numA} + ${this.numB}?` 
                : (this.currentOp === '-'
                  ? `¿Cuánto es ${this.numA} - ${this.numB}?`
                  : `¿Cuánto es ${this.numA} × ${this.numB}?`)}
            </h2>
            <div class="options-grid">
              ${options.map(val => `
                <button class="math-ans-btn" data-val="${val}">
                  <span class="math-ans-number ${val >= 10 ? 'double-digit' : ''}">${val}</span>
                  <span class="math-ans-dots">${val <= 6 ? this.treatType.emoji.repeat(val) : `✨ ${val} dulces ✨`}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      // Notificar al mando de celular el contexto actual de la pregunta
      if (window.Cinnamo?.controllerBridge?.broadcastGameContext) {
        window.Cinnamo.controllerBridge.broadcastGameContext({
          screen: 'math',
          question: this.currentOp === '+' 
            ? `¿Cuánto es ${this.numA} + ${this.numB}?` 
            : (this.currentOp === '-' ? `¿Cuánto es ${this.numA} - ${this.numB}?` : `¿Cuánto es ${this.numA} × ${this.numB}?`),
          options: options,
          treatEmoji: this.treatType.emoji,
          score: this.score,
          totalGoal: this.totalGoal
        });
      }

      this.bindEvents();
    }

    renderTrayElements() {
      // Limitar renderizado de elementos individuales a max 15 para evitar saturación visual en pantallas
      const maxVisualA = Math.min(this.numA, 10);
      const maxVisualB = Math.min(this.numB, 10);

      if (this.currentOp === '+') {
        return `
          <div class="treat-cluster group-left">
            ${Array.from({ length: maxVisualA }).map((_, i) => `
              <button class="treat-btn" data-idx="a-${i}" aria-label="Dulce ${i + 1}">
                <span class="treat-graphic">${this.treatType.emoji}</span>
                <span class="treat-count hidden"></span>
              </button>
            `).join('')}
            ${this.numA > 10 ? `<span class="extra-count-badge">+${this.numA - 10}</span>` : ''}
          </div>

          <div class="math-sign-symbol">➕</div>

          <div class="treat-cluster group-right">
            ${Array.from({ length: maxVisualB }).map((_, i) => `
              <button class="treat-btn" data-idx="b-${i}" aria-label="Dulce ${this.numA + i + 1}">
                <span class="treat-graphic">${this.treatType.emoji}</span>
                <span class="treat-count hidden"></span>
              </button>
            `).join('')}
            ${this.numB > 10 ? `<span class="extra-count-badge">+${this.numB - 10}</span>` : ''}
          </div>
        `;
      } else if (this.currentOp === '-') {
        const visualRemain = Math.min(this.total, 10);
        return `
          <div class="treat-cluster group-remain">
            ${Array.from({ length: visualRemain }).map((_, i) => `
              <button class="treat-btn remain-item" data-idx="r-${i}">
                <span class="treat-graphic">${this.treatType.emoji}</span>
                <span class="treat-count hidden"></span>
              </button>
            `).join('')}
            ${this.total > 10 ? `<span class="extra-count-badge">+${this.total - 10}</span>` : ''}
          </div>

          <div class="math-sign-symbol">➖</div>

          <div class="treat-cluster group-eaten">
            ${Array.from({ length: maxVisualB }).map((_, i) => `
              <div class="treat-btn eaten-item" title="¡Milk se comió este dulce!">
                <span class="treat-graphic muted">${this.treatType.emoji}</span>
                <span class="eaten-badge">😋</span>
              </div>
            `).join('')}
            ${this.numB > 10 ? `<span class="extra-count-badge">+${this.numB - 10}</span>` : ''}
          </div>
        `;
      } else {
        // Multiplicación
        return `
          <div class="treat-cluster group-mult">
            ${Array.from({ length: this.numA }).map((_, gIdx) => `
              <div class="mult-group-box">
                ${Array.from({ length: this.numB }).map((_, bIdx) => `
                  <button class="treat-btn" data-idx="m-${gIdx}-${bIdx}">
                    <span class="treat-graphic">${this.treatType.emoji}</span>
                    <span class="treat-count hidden"></span>
                  </button>
                `).join('')}
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    bindEvents() {
      // Selector de Edad
      this.container.querySelectorAll('.math-tier-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          this.setTier(e.currentTarget.dataset.tier);
        });
      });

      // Cambio de modo
      this.container.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          this.setMode(e.currentTarget.dataset.mode);
        });
      });

      // Conteo táctil de dulces
      this.container.querySelectorAll('.treat-btn:not(.eaten-item)').forEach(btn => {
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

    submitAnswer(val) {
      if (this.container) {
        const partyBtn = this.container.querySelector('#btnNextMathParty');
        if (partyBtn) {
          partyBtn.click();
          return;
        }
      }
      if (this.answered || this.isCountingHelpActive) return;
      A.unlock();
      const chosen = parseInt(val, 10);
      const btn = this.container ? this.container.querySelector(`.math-ans-btn[data-val="${chosen}"]`) : null;
      if (chosen === this.total) {
        if (btn) this.handleSuccess(btn);
      } else {
        if (btn) this.handleDoubtAndGuide(btn);
      }
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
        setTimeout(() => item.classList.add('dance-bounce'), i * 80);
      });

      setTimeout(() => {
        if (this.score >= this.totalGoal) {
          this.triggerPartyVictory();
        } else {
          this.nextRound();
        }
      }, 1500);
    }

    handleDoubtAndGuide(btnEl) {
      this.isCountingHelpActive = true;
      btnEl.classList.add('wobble');
      A.softBoing();

      const milkBubble = this.container.querySelector('#milkBubble');
      const cinnaBubble = this.container.querySelector('#cinnaBubble');
      const tray = this.container.querySelector('#trayContainer');

      if (cinnaBubble) cinnaBubble.innerHTML = '¿Estás segura Amanda? 🤔';
      if (milkBubble) milkBubble.innerHTML = '¡Toquemos los dulces para contar juntas! 👆';
      if (tray) tray.classList.add('highlight-tray');

      const allActive = this.container.querySelectorAll('.sweet-tray .treat-btn:not(.eaten-item)');
      allActive.forEach((btn, i) => {
        const tStep = setTimeout(() => {
          btn.classList.add('pop-counted');
          const badge = btn.querySelector('.treat-count');
          if (badge) {
            badge.textContent = i + 1;
            badge.classList.remove('hidden');
          }
          A.bubblePop(i + 1);
        }, (i + 1) * 350);
        this.guideTimeouts.push(tStep);
      });

      const totalDelay = (allActive.length + 1) * 350 + 600;
      const tEnd = setTimeout(() => {
        if (cinnaBubble) cinnaBubble.innerHTML = `¡Hay <strong>${this.total}</strong> en total! 🌸`;
        if (milkBubble) milkBubble.innerHTML = `¡Elige el número <strong>${this.total}</strong> Amanda! ✨`;
        if (tray) tray.classList.remove('highlight-tray');
        this.isCountingHelpActive = false;
        btnEl.classList.remove('wobble');
      }, totalDelay);
      this.guideTimeouts.push(tEnd);
    }

    triggerPartyVictory() {
      A.celebrate();
      const modal = document.createElement('div');
      modal.className = 'w-victory-modal-overlay';
      modal.innerHTML = `
        <div class="w-victory-card">
          <div class="w-victory-badge">🧁 ¡MAESTRA PASTELERA DE SANRIO! 🧁</div>
          <h2 style="color: #ea580c">¡Completaste tus 5 pedidos!</h2>
          <div class="w-victory-img-box">
            <img src="assets/cinnamoroll_fly.png" alt="Cinnamoroll" />
          </div>
          <p>¡Amanda, eres una campeona de los números en Cinnamoroll Land! 💖 ⭐⭐⭐</p>
          <div class="w-victory-actions">
            <button class="btn-w-next" id="btnNextMathParty">▶ Seguir Horneando</button>
          </div>
        </div>
      `;
      this.container.appendChild(modal);

      modal.querySelector('#btnNextMathParty').addEventListener('click', () => {
        A.unlock();
        modal.remove();
        this.score = 0;
        this.nextRound();
      });
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.mathGame = new MathBakeryGame();
})();
