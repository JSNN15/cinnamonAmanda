/* La Pastelería Mágica de Cinnamoroll y Milk
 * Juego preescolar de contar y sumar (1 a 10) con pasteles interactivos y botones táctiles adaptados para 5 años.
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const TREAT_TYPES = [
    { name: 'rollito', emoji: '🍥', label: 'Rollitos de canela' },
    { name: 'frutilla', emoji: '🍓', label: 'Frutillas dulces' },
    { name: 'galleta', emoji: '⭐', label: 'Galletitas estrella' },
    { name: 'dulce', emoji: '🍬', label: 'Caramelitos' }
  ];

  class MathBakeryGame {
    constructor() {
      this.container = null;
      this.score = 0;
      this.currentRound = 0;
      this.totalGoal = 5;
      this.numA = 2;
      this.numB = 1;
      this.treatType = TREAT_TYPES[0];
      this.countedItems = new Set();
      this.answered = false;
    }

    init(containerEl) {
      this.container = containerEl;
      this.score = 0;
      this.currentRound = 0;
      this.nextRound();
    }

    nextRound() {
      this.answered = false;
      this.countedItems.clear();
      this.currentRound++;

      // Generar sumas fáciles adecuadas para 5 años (totales entre 2 y 7)
      this.treatType = TREAT_TYPES[Math.floor(Math.random() * TREAT_TYPES.length)];
      this.numA = 1 + Math.floor(Math.random() * 3); // 1 a 3
      this.numB = 1 + Math.floor(Math.random() * 3); // 1 a 3
      this.total = this.numA + this.numB;

      this.render();
    }

    render() {
      // Opciones de respuesta: el total correcto + 2 distractores cercanos
      const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => n !== this.total);
      pool.sort(() => Math.random() - 0.5);
      const options = [this.total, pool[0], pool[1]].sort((a, b) => a - b);

      this.container.innerHTML = `
        <div class="math-wrap">
          <!-- Barra de progreso con galletitas -->
          <div class="math-hud">
            <div class="math-score">⭐ ${this.score}</div>
            <div class="math-progress">
              ${Array.from({ length: this.totalGoal }).map((_, i) => `
                <span class="dot-cookie ${i < this.score ? 'done' : ''}">🍪</span>
              `).join('')}
            </div>
          </div>

          <!-- Escenario de pastelería -->
          <div class="bakery-scene">
            <!-- Cinnamoroll pastelero a la izquierda -->
            <div class="baker-char cinna-baker" id="cinnaBaker">
              <img src="cinnamoroll_sprite.png" class="baker-img" alt="Cinnamoroll" />
              <div class="speech-bubble">¡Tengo ${this.numA}!</div>
            </div>

            <!-- Bandeja mágica de dulces en el centro -->
            <div class="bakery-tray-box" id="trayBox">
              <div class="tray-label">Toca los dulces para contarlos 👇</div>
              <div class="bakery-tray">
                <!-- Grupo A (de Cinnamoroll) -->
                <div class="treat-group group-a">
                  ${Array.from({ length: this.numA }).map((_, i) => `
                    <button class="treat-item" data-idx="a-${i}">
                      <span class="treat-ico">${this.treatType.emoji}</span>
                      <span class="count-badge hidden"></span>
                    </button>
                  `).join('')}
                </div>

                <div class="plus-sign">➕</div>

                <!-- Grupo B (de Milk) -->
                <div class="treat-group group-b">
                  ${Array.from({ length: this.numB }).map((_, i) => `
                    <button class="treat-item" data-idx="b-${i}">
                      <span class="treat-ico">${this.treatType.emoji}</span>
                      <span class="count-badge hidden"></span>
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- El pequeño Milk a la derecha -->
            <div class="baker-char milk-baker" id="milkBaker">
              <div class="milk-avatar">
                <svg viewBox="0 0 100 80" width="100" height="80">
                  <ellipse cx="22" cy="46" rx="12" ry="24" transform="rotate(-15 22 46)" fill="#ffffff" stroke="#5c3d2e" stroke-width="3" />
                  <ellipse cx="78" cy="46" rx="12" ry="24" transform="rotate(15 78 46)" fill="#ffffff" stroke="#5c3d2e" stroke-width="3" />
                  <ellipse cx="50" cy="42" rx="34" ry="26" fill="#ffffff" stroke="#5c3d2e" stroke-width="3.5" />
                  <path d="M 50,18 C 45,14 52,8 57,12 C 60,16 54,20 50,18 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.5" />
                  <ellipse cx="38" cy="38" rx="3.5" ry="5.5" fill="#2aa8e6" />
                  <ellipse cx="62" cy="38" rx="3.5" ry="5.5" fill="#2aa8e6" />
                  <ellipse cx="30" cy="46" rx="6" ry="4" fill="#ffb6d2" />
                  <ellipse cx="70" cy="46" rx="6" ry="4" fill="#ffb6d2" />
                  <circle cx="50" cy="49" r="8" fill="#81d4fa" stroke="#5c3d2e" stroke-width="2.5" />
                  <circle cx="50" cy="53" r="4.5" fill="#ffffff" stroke="#5c3d2e" stroke-width="1.8" />
                </svg>
              </div>
              <div class="speech-bubble">¡Traje ${this.numB}!</div>
            </div>
          </div>

          <!-- Pregunta y Botones de respuesta adaptados -->
          <div class="question-bar">
            <h2>¿Cuántos dulces hay en total?</h2>
            <div class="answers-row">
              ${options.map(val => `
                <button class="ans-btn" data-val="${val}">
                  <span class="ans-num">${val}</span>
                  <span class="ans-dots">${'●'.repeat(val)}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      this.bindEvents();
    }

    bindEvents() {
      // Tocar dulces para contarlos con el dedo (pedagogía preescolar)
      this.container.querySelectorAll('.treat-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          const target = e.currentTarget;
          const idx = target.dataset.idx;

          this.countedItems.add(idx);
          const currentCount = this.countedItems.size;

          A.bubblePop(currentCount);

          // Animación de rebote y muestra del número
          target.classList.add('bounced');
          const badge = target.querySelector('.count-badge');
          badge.textContent = currentCount;
          badge.classList.remove('hidden');

          setTimeout(() => target.classList.remove('bounced'), 400);
        });
      });

      // Tocar los botones de respuesta
      this.container.querySelectorAll('.ans-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (this.answered) return;
          A.unlock();
          const chosen = parseInt(e.currentTarget.dataset.val, 10);

          if (chosen === this.total) {
            this.handleSuccess(e.currentTarget);
          } else {
            this.handleRetry(e.currentTarget);
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
      this.container.querySelector('#cinnaBaker').classList.add('party');
      this.container.querySelector('#milkBaker').classList.add('party');

      // Revelar todos los números si faltaban
      this.container.querySelectorAll('.treat-item').forEach((item, i) => {
        const badge = item.querySelector('.count-badge');
        badge.textContent = i + 1;
        badge.classList.remove('hidden');
      });

      setTimeout(() => {
        if (this.score >= this.totalGoal) {
          this.showVictoryScreen();
        } else {
          this.nextRound();
        }
      }, 1800);
    }

    handleRetry(btnEl) {
      A.softBoing();
      btnEl.classList.add('wobble');
      setTimeout(() => btnEl.classList.remove('wobble'), 500);

      const tray = this.container.querySelector('#trayBox');
      tray.classList.add('pulse-help');
      setTimeout(() => tray.classList.remove('pulse-help'), 700);
    }

    showVictoryScreen() {
      A.celebrate();
      this.container.innerHTML = `
        <div class="math-victory">
          <h1>🎉 ¡Excelente pastelera! 🎉</h1>
          <p>¡Contaste todos los dulces de la pastelería!</p>
          <div class="victory-characters">
            <img src="cinnamoroll_sprite.png" class="victory-cinna" alt="Cinnamoroll" />
            <div class="victory-milk">
              <svg viewBox="0 0 100 80" width="130" height="100">
                <ellipse cx="22" cy="46" rx="12" ry="24" transform="rotate(-15 22 46)" fill="#ffffff" stroke="#5c3d2e" stroke-width="3" />
                <ellipse cx="78" cy="46" rx="12" ry="24" transform="rotate(15 78 46)" fill="#ffffff" stroke="#5c3d2e" stroke-width="3" />
                <ellipse cx="50" cy="42" rx="34" ry="26" fill="#ffffff" stroke="#5c3d2e" stroke-width="3.5" />
                <path d="M 50,18 C 45,14 52,8 57,12 C 60,16 54,20 50,18 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.5" />
                <ellipse cx="38" cy="38" rx="3.5" ry="5.5" fill="#2aa8e6" />
                <ellipse cx="62" cy="38" rx="3.5" ry="5.5" fill="#2aa8e6" />
                <ellipse cx="30" cy="46" rx="6" ry="4" fill="#ffb6d2" />
                <ellipse cx="70" cy="46" rx="6" ry="4" fill="#ffb6d2" />
                <circle cx="50" cy="49" r="8" fill="#81d4fa" stroke="#5c3d2e" stroke-width="2.5" />
                <circle cx="50" cy="53" r="4.5" fill="#ffffff" stroke="#5c3d2e" stroke-width="1.8" />
              </svg>
            </div>
          </div>
          <button id="btnPlayAgain" class="big-btn-math">▶ ¡Jugar de nuevo!</button>
        </div>
      `;

      this.container.querySelector('#btnPlayAgain').addEventListener('click', () => {
        A.unlock();
        A.bubblePop(1);
        this.init(this.container);
      });
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.mathGame = new MathBakeryGame();
})();
