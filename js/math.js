/* La Pastelería Mágica de Cinnamoroll & Milk
 * Juego de cálculo mental y aritmética adaptado para 5 a 8 años (Kínder a 3° Básico).
 * 
 * Enfoque Pedagógico por Edades:
 *  - 🍼 Kínder (5-6 años): Sumas y restas hasta 10 con conteo interactivo con el dedo.
 *  - 🎒 1° Básico (6-7 años): Sumas y restas hasta 20 con cálculo mental.
 *  - 🚀 2°-3° Básico (7-8 años): Operaciones hasta 40 y multiplicaciones dulces (2x, 3x, 4x, 5x).
 *
 * La dificultad se ajusta sola según los aciertos a la primera (ver js/math-progress.js).
 */
(function () {
  const { audio: A } = window.Cinnamo;
  const P = window.Cinnamo.mathProgress;
  const store = (() => { try { return window.localStorage; } catch (e) { return null; } })();

  const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

  // Rangos por nivel (2 pasos por tramo de edad: fácil y medio)
  const ADD_LEVELS = [
    { a: [1, 3], b: [1, 3] },    // 🍼 Kínder fácil (hasta 6)
    { a: [1, 5], b: [1, 5] },    // 🍼 Kínder medio (hasta 10)
    { a: [3, 10], b: [2, 8] },   // 🎒 1° Básico fácil
    { a: [6, 12], b: [4, 9] },   // 🎒 1° Básico medio (hasta 21)
    { a: [7, 20], b: [5, 16] },  // 🚀 2°-3° fácil
    { a: [12, 25], b: [8, 15] }  // 🚀 2°-3° medio (hasta 40)
  ];
  const SUB_LEVELS = [
    { a: [3, 5], bMin: 1, keep: 1 },
    { a: [5, 10], bMin: 1, keep: 1 },
    { a: [8, 18], bMin: 2, keep: 1 },
    { a: [12, 20], bMin: 3, keep: 2 },
    { a: [15, 32], bMin: 4, keep: 2 },
    { a: [20, 40], bMin: 6, keep: 2 }
  ];
  const MULT_LEVELS = [
    { a: [2, 3], b: [2, 5] },    // tablas del 2 y 3
    { a: [2, 5], b: [2, 5] },    // tablas del 2 al 5
    { a: [2, 5], b: [2, 6] }
  ];

  const TIER_LABEL = { '5-6': '🍼 Kínder', '6-7': '🎒 1° Básico', '7-8': '🚀 2°-3° Básico' };
  const OP_LABEL = { add: '➕ Sumas', sub: '➖ Restas', mult: '✖️ Tablas' };
  const OP_OF = { '+': 'add', '-': 'sub', 'x': 'mult' };

  const levelName = (op, level) => {
    if (op === 'mult') return ['Tablas 2 y 3', 'Tablas 2 al 5', 'Tablas hasta ×6'][level];
    return `${TIER_LABEL[P.tierForLevel(level)]} · ${level % 2 === 0 ? 'fácil' : 'medio'}`;
  };

  const formatDay = (ts) => {
    if (!ts) return 'aún no juega';
    const d = new Date(ts);
    const today = new Date();
    const diff = Math.round((new Date(today.toDateString()) - new Date(d.toDateString())) / 86400000);
    if (diff === 0) return 'hoy';
    if (diff === 1) return 'ayer';
    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  };

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
      this.progress = P.load(store);
      this.missedThisRound = false;
      this.parentsOpen = false;
      this.levelMsg = null;
    }

    saveProgress() {
      P.save(store, this.progress);
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
      if (!P.TIERS.includes(newTier)) return;
      P.setStartTier(this.progress, newTier);
      this.saveProgress();
      this.nextRound();
    }

    setAuto(on) {
      this.progress.auto = !!on;
      this.saveProgress();
    }

    resetProgress() {
      this.progress = P.freshState();
      this.saveProgress();
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

      // El tramo de edad sale del nivel de sumas/restas (ajuste automático)
      const sk = this.progress.skills;
      this.ageTier = P.tierForLevel(Math.max(sk.add.level, sk.sub.level));
      if (this.mode === 'mult' && this.ageTier !== '7-8') this.mode = 'add';

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
        const r = ADD_LEVELS[sk.add.level];
        this.numA = rnd(r.a[0], r.a[1]);
        this.numB = rnd(r.b[0], r.b[1]);
        this.total = this.numA + this.numB;
      } else if (this.currentOp === '-') {
        const r = SUB_LEVELS[sk.sub.level];
        this.numA = rnd(r.a[0], r.a[1]);
        this.numB = rnd(r.bMin, Math.max(r.bMin, this.numA - r.keep));
        this.total = this.numA - this.numB;
      } else {
        // Multiplicación dulce: numA bandejas con numB dulces cada una
        const r = MULT_LEVELS[sk.mult.level];
        this.numA = rnd(r.a[0], r.a[1]);
        this.numB = rnd(r.b[0], r.b[1]);
        this.total = this.numA * this.numB;
      }

      this.missedThisRound = false;
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
            <!-- Nivel actual (se ajusta solo según los aciertos) -->
            <div class="math-age-tier-row">
              <span class="math-level-badge" title="Nivel actual">
                ${this.progress.auto ? '✨' : '🔒'} ${levelName(OP_OF[this.currentOp], this.progress.skills[OP_OF[this.currentOp]].level)}
              </span>
              ${this.levelMsg ? `<span class="math-level-up">${this.levelMsg}</span>` : ''}
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

          ${this.renderParentsPanel()}
        </div>
      `;
      this.levelMsg = null;

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
          totalGoal: this.totalGoal,
          ageTier: this.ageTier,
          mode: this.mode
        });
      }

      this.bindEvents();
    }

    renderParentsPanel() {
      const sk = this.progress.skills;
      const rows = ['add', 'sub', 'mult'].map(op => {
        const s = sk[op];
        const pct = s.total ? Math.round((s.firstTry / s.total) * 100) : null;
        const recentHits = s.recent.filter(Boolean).length;
        return `
          <tr>
            <td><strong>${OP_LABEL[op]}</strong></td>
            <td>${levelName(op, s.level)}</td>
            <td>${pct === null ? '—' : `${pct}% <small>(${s.firstTry}/${s.total})</small>`}</td>
            <td>${s.recent.length ? `${recentHits}/${s.recent.length}` : '—'}</td>
            <td>${s.masteredAt ? `✅ <small>${formatDay(s.masteredAt)}</small>` : (s.total ? 'practicando' : '—')}</td>
            <td>${formatDay(s.lastPlayed)}</td>
          </tr>`;
      }).join('');

      return `
        <details class="parents math-parents" id="mathParents" ${this.parentsOpen ? 'open' : ''}>
          <summary>👨‍👩‍👧 Para papás: progreso de Amanda</summary>
          <div class="math-parents-body">
            <div class="math-progress-table-wrap">
              <table class="math-progress-table">
                <thead>
                  <tr><th>Operación</th><th>Nivel</th><th>A la primera</th><th>Últimas 10</th><th>Domina</th><th>Jugó</th></tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
            <p class="math-parents-note">
              Sube de nivel con 4 aciertos a la primera de 5 y baja con 2 errores seguidos.
              "Domina" = 8 de 10 a la primera en el nivel más alto.
            </p>
            <label class="math-auto-toggle">
              <input type="checkbox" id="mathAutoToggle" ${this.progress.auto ? 'checked' : ''} />
              ✨ Ajuste automático de dificultad
            </label>
            <div class="math-age-tier-row">
              <span class="math-tier-title">🎯 Empezar desde:</span>
              ${P.TIERS.map(t => `
                <button class="math-tier-btn ${this.ageTier === t ? 'active' : ''}" data-tier="${t}">${TIER_LABEL[t]} (${t} años)</button>
              `).join('')}
            </div>
            <button class="math-reset-btn" id="mathResetProgress">🗑️ Reiniciar progreso</button>
          </div>
        </details>`;
    }

    // Registra sólo la primera respuesta de cada pregunta
    recordFirstAnswer(correct) {
      if (this.missedThisRound) return;
      if (!correct) this.missedThisRound = true;
      const op = OP_OF[this.currentOp];
      const event = P.record(this.progress, op, correct);
      this.saveProgress();
      if (event === 'up') this.levelMsg = '🌟 ¡Subiste de nivel!';
      else if (event === 'mastered') this.levelMsg = `🏆 ¡Dominas ${OP_LABEL[op].slice(3)}!`;
    }

    countNextTreat() {
      if (!this.container) return;
      A.unlock();
      const allActive = Array.from(this.container.querySelectorAll('.sweet-tray .treat-btn:not(.eaten-item)'));
      for (const btn of allActive) {
        const idx = btn.dataset.idx;
        if (idx && !this.countedItems.has(idx)) {
          btn.click();
          return;
        }
      }
      // Si ya se contaron todos, reiniciar conteo para volver a empezar
      this.countedItems.clear();
      allActive.forEach(btn => {
        const badge = btn.querySelector('.treat-count');
        if (badge) badge.classList.add('hidden');
      });
      if (allActive[0]) allActive[0].click();
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

      // Panel de papás
      const parents = this.container.querySelector('#mathParents');
      if (parents) parents.addEventListener('toggle', () => { this.parentsOpen = parents.open; });
      const autoToggle = this.container.querySelector('#mathAutoToggle');
      if (autoToggle) autoToggle.addEventListener('change', (e) => this.setAuto(e.currentTarget.checked));
      const resetBtn = this.container.querySelector('#mathResetProgress');
      if (resetBtn) resetBtn.addEventListener('click', () => {
        if (window.confirm('¿Borrar todo el progreso de matemáticas de Amanda?')) this.resetProgress();
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
      this.recordFirstAnswer(true);
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
      this.recordFirstAnswer(false);
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
