/* Memorice de Sanrio (Juego de Memoria y Parejas)
 * Diseñado con amor para una niña de 5 años: cartas grandes, volteo 3D suave,
 * personajes tiernos de Cinnamoroll y sus amigos, y celebración con estrellas.
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const CHARACTERS = [
    {
      id: 'cinnamoroll',
      name: 'Cinnamoroll',
      emoji: '🪽',
      tag: '¡El perrito que vuela!',
      color: '#cce7ff',
      svg: `
        <svg viewBox="0 0 100 80" width="70" height="56">
          <path d="M 25,35 C 10,25 0,35 5,50 C 10,60 25,58 28,45 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.5" />
          <path d="M 75,35 C 90,25 100,35 95,50 C 90,60 75,58 72,45 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.5" />
          <ellipse cx="50" cy="42" rx="28" ry="22" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.8" />
          <ellipse cx="38" cy="40" rx="3.5" ry="5.5" fill="#2aa8e6" />
          <ellipse cx="62" cy="40" rx="3.5" ry="5.5" fill="#2aa8e6" />
          <ellipse cx="32" cy="46" rx="5" ry="3.5" fill="#ffb6d2" />
          <ellipse cx="68" cy="46" rx="5" ry="3.5" fill="#ffb6d2" />
          <path d="M 46,45 Q 50,49 54,45" fill="none" stroke="#5c3d2e" stroke-width="2" stroke-linecap="round" />
        </svg>
      `
    },
    {
      id: 'milk',
      name: 'Milk',
      emoji: '🍼',
      tag: '¡El bebé con chupete!',
      color: '#ffe0ed',
      svg: `
        <svg viewBox="0 0 100 80" width="70" height="56">
          <path d="M 30,42 C 15,35 10,50 15,65 C 20,72 30,70 32,58 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.5" />
          <path d="M 70,42 C 85,35 90,50 85,65 C 80,72 70,70 68,58 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.5" />
          <ellipse cx="50" cy="42" rx="26" ry="22" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.8" />
          <path d="M 50,22 C 46,18 52,14 55,17 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="2" />
          <ellipse cx="40" cy="40" rx="3.2" ry="5" fill="#2aa8e6" />
          <ellipse cx="60" cy="40" rx="3.2" ry="5" fill="#2aa8e6" />
          <ellipse cx="34" cy="46" rx="4.5" ry="3" fill="#ffb6d2" />
          <ellipse cx="66" cy="46" rx="4.5" ry="3" fill="#ffb6d2" />
          <circle cx="50" cy="48" r="6" fill="#81d4fa" stroke="#5c3d2e" stroke-width="2" />
        </svg>
      `
    },
    {
      id: 'mocha',
      name: 'Mocha',
      emoji: '🎀',
      tag: '¡Perrita con lazos!',
      color: '#faebd7',
      svg: `
        <svg viewBox="0 0 100 80" width="70" height="56">
          <path d="M 25,35 C 10,25 0,35 5,50 C 10,60 25,58 28,45 Z" fill="#c49a6c" stroke="#5c3d2e" stroke-width="2.5" />
          <path d="M 75,35 C 90,25 100,35 95,50 C 90,60 75,58 72,45 Z" fill="#c49a6c" stroke="#5c3d2e" stroke-width="2.5" />
          <ellipse cx="50" cy="42" rx="28" ry="22" fill="#c49a6c" stroke="#5c3d2e" stroke-width="2.8" />
          <circle cx="24" cy="38" r="4.5" fill="#ff8fbf" stroke="#5c3d2e" stroke-width="1.5" />
          <circle cx="76" cy="38" r="4.5" fill="#ff8fbf" stroke="#5c3d2e" stroke-width="1.5" />
          <ellipse cx="38" cy="40" rx="3.2" ry="5" fill="#5c3d2e" />
          <ellipse cx="62" cy="40" rx="3.2" ry="5" fill="#5c3d2e" />
          <ellipse cx="32" cy="46" rx="5" ry="3.5" fill="#ffb6d2" />
          <ellipse cx="68" cy="46" rx="5" ry="3.5" fill="#ffb6d2" />
          <path d="M 46,45 Q 50,49 54,45" fill="none" stroke="#5c3d2e" stroke-width="2" stroke-linecap="round" />
        </svg>
      `
    },
    {
      id: 'pompompurin',
      name: 'Pompompurin',
      emoji: '🍮',
      tag: '¡Amigo con boina!',
      color: '#fff3b0',
      svg: `
        <svg viewBox="0 0 100 80" width="70" height="56">
          <ellipse cx="25" cy="45" rx="8" ry="16" transform="rotate(20 25 45)" fill="#ffe066" stroke="#5c3d2e" stroke-width="2.5" />
          <ellipse cx="75" cy="45" rx="8" ry="16" transform="rotate(-20 75 45)" fill="#ffe066" stroke="#5c3d2e" stroke-width="2.5" />
          <ellipse cx="50" cy="46" rx="30" ry="25" fill="#ffe066" stroke="#5c3d2e" stroke-width="2.8" />
          <path d="M 40,24 C 40,16 60,16 60,24 Z" fill="#7a4b26" stroke="#5c3d2e" stroke-width="2" />
          <ellipse cx="50" cy="16" rx="3" ry="2.2" fill="#7a4b26" />
          <circle cx="41" cy="42" r="2.8" fill="#5c3d2e" />
          <circle cx="59" cy="42" r="2.8" fill="#5c3d2e" />
          <ellipse cx="50" cy="46" rx="3" ry="2" fill="#7a4b26" />
          <path d="M 47,50 Q 50,53 53,50" fill="none" stroke="#5c3d2e" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      `
    },
    {
      id: 'chiffon',
      name: 'Chiffon',
      emoji: '🌸',
      tag: '¡Perrita enérgica!',
      color: '#ffd6e8',
      svg: `
        <svg viewBox="0 0 100 80" width="70" height="56">
          <path d="M 28,34 C 15,22 4,32 8,48 C 12,58 24,56 26,46 Z" fill="#ffecd2" stroke="#5c3d2e" stroke-width="2.5" />
          <path d="M 72,34 C 85,22 96,32 92,48 C 88,58 76,56 74,46 Z" fill="#ffecd2" stroke="#5c3d2e" stroke-width="2.5" />
          <ellipse cx="50" cy="42" rx="27" ry="22" fill="#ffecd2" stroke="#5c3d2e" stroke-width="2.8" />
          <ellipse cx="38" cy="40" rx="3.2" ry="5" fill="#5c3d2e" />
          <ellipse cx="62" cy="40" rx="3.2" ry="5" fill="#5c3d2e" />
          <ellipse cx="32" cy="46" rx="5" ry="3.5" fill="#ffb6d2" />
          <ellipse cx="68" cy="46" rx="5" ry="3.5" fill="#ffb6d2" />
          <path d="M 46,45 Q 50,49 54,45" fill="none" stroke="#5c3d2e" stroke-width="2" stroke-linecap="round" />
        </svg>
      `
    },
    {
      id: 'espresso',
      name: 'Espresso',
      emoji: '☕',
      tag: '¡El perrito elegante!',
      color: '#e2f0cb',
      svg: `
        <svg viewBox="0 0 100 80" width="70" height="56">
          <path d="M 26,36 C 14,24 2,36 8,50 C 14,60 26,56 28,44 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.5" />
          <path d="M 74,36 C 86,24 98,36 92,50 C 86,60 74,56 72,44 Z" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.5" />
          <ellipse cx="50" cy="42" rx="28" ry="22" fill="#ffffff" stroke="#5c3d2e" stroke-width="2.8" />
          <path d="M 45,22 C 48,16 52,16 55,22" fill="none" stroke="#5c3d2e" stroke-width="2.5" stroke-linecap="round" />
          <ellipse cx="38" cy="40" rx="3.5" ry="5.5" fill="#2aa8e6" />
          <ellipse cx="62" cy="40" rx="3.5" ry="5.5" fill="#2aa8e6" />
          <ellipse cx="32" cy="46" rx="5" ry="3.5" fill="#ffb6d2" />
          <ellipse cx="68" cy="46" rx="5" ry="3.5" fill="#ffb6d2" />
          <path d="M 46,46 Q 50,49 54,46" fill="none" stroke="#5c3d2e" stroke-width="2" stroke-linecap="round" />
        </svg>
      `
    }
  ];

  class MemoryGame {
    constructor() {
      this.container = null;
      this.difficulty = 6; // 6 cartas (3 pares), 8 (4 pares), 12 (6 pares)
      this.cards = [];
      this.flippedCards = [];
      this.matchedPairs = 0;
      this.isLocked = false;
      this.moves = 0;
    }

    init(containerEl) {
      this.container = containerEl;
      this.startNewGame(this.difficulty);
    }

    startNewGame(totalCards = 6) {
      this.difficulty = totalCards;
      this.moves = 0;
      this.matchedPairs = 0;
      this.flippedCards = [];
      this.isLocked = false;

      const numPairs = totalCards / 2;
      const selectedChars = CHARACTERS.slice(0, numPairs);

      // Crear pares duplicados
      const deck = [];
      selectedChars.forEach((ch, idx) => {
        deck.push({ ...ch, uid: `card-${idx}-a`, matchKey: ch.id });
        deck.push({ ...ch, uid: `card-${idx}-b`, matchKey: ch.id });
      });

      // Barajar las cartas
      deck.sort(() => Math.random() - 0.5);
      this.cards = deck;

      this.render();
    }

    render() {
      const numPairs = this.difficulty / 2;

      this.container.innerHTML = `
        <div class="memory-wrap">
          <!-- Barra de controles y dificultad -->
          <div class="memory-top-bar">
            <div class="diff-selector">
              <button class="diff-btn ${this.difficulty === 6 ? 'active' : ''}" data-diff="6">🌸 Fácil (3 Parejas)</button>
              <button class="diff-btn ${this.difficulty === 8 ? 'active' : ''}" data-diff="8">⭐ Medio (4 Parejas)</button>
              <button class="diff-btn ${this.difficulty === 12 ? 'active' : ''}" data-diff="12">🌟 Estrella (6 Parejas)</button>
            </div>
            <div class="memory-stats-pill">
              <span>💖 Parejas: <strong id="matchedCount">${this.matchedPairs}</strong> / ${numPairs}</span>
            </div>
          </div>

          <!-- Cuadrícula de cartas con efecto 3D -->
          <div class="memory-grid grid-size-${this.difficulty}">
            ${this.cards.map((card, i) => `
              <div class="memory-card-slot" data-index="${i}">
                <div class="card-inner">
                  <!-- Dorso de la carta (tapado) -->
                  <div class="card-back">
                    <span class="card-back-pattern">🐾</span>
                    <span class="card-back-sparkle">✨</span>
                  </div>
                  <!-- Frente de la carta (personaje descubierto) -->
                  <div class="card-front" style="background: ${card.color};">
                    <div class="card-art-box">${card.svg}</div>
                    <div class="card-char-name">${card.name}</div>
                    <div class="card-char-emoji">${card.emoji}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      this.bindEvents();
    }

    bindEvents() {
      // Cambio de dificultad
      this.container.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          const diff = parseInt(e.currentTarget.dataset.diff, 10);
          this.startNewGame(diff);
        });
      });

      // Tocar cartas
      this.container.querySelectorAll('.memory-card-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
          if (this.isLocked) return;
          const target = e.currentTarget;
          const idx = parseInt(target.dataset.index, 10);
          const cardData = this.cards[idx];

          // Evitar voltear si ya está volteada o emparejada
          if (target.classList.contains('flipped') || target.classList.contains('matched')) return;

          A.unlock();
          A.bubblePop(this.flippedCards.length + 1);

          // Voltear carta
          target.classList.add('flipped');
          this.flippedCards.push({ el: target, data: cardData });

          if (this.flippedCards.length === 2) {
            this.moves++;
            this.checkMatch();
          }
        });
      });
    }

    checkMatch() {
      const [c1, c2] = this.flippedCards;
      const isMatch = c1.data.matchKey === c2.data.matchKey;

      if (isMatch) {
        // ¡Pareja encontrada!
        this.matchedPairs++;
        this.isLocked = true;

        setTimeout(() => {
          A.kawaiiChirp('cheer');
          A.collect(this.matchedPairs);

          c1.el.classList.add('matched');
          c2.el.classList.add('matched');

          const counter = this.container.querySelector('#matchedCount');
          if (counter) counter.textContent = this.matchedPairs;

          this.flippedCards = [];
          this.isLocked = false;

          // ¿Completó todas las parejas?
          if (this.matchedPairs === this.difficulty / 2) {
            setTimeout(() => this.showVictoryScreen(), 600);
          }
        }, 400);
      } else {
        // No coinciden: esperar un momento y voltear de regreso
        this.isLocked = true;
        setTimeout(() => {
          A.softBoing();
          c1.el.classList.remove('flipped');
          c2.el.classList.remove('flipped');
          this.flippedCards = [];
          this.isLocked = false;
        }, 1100);
      }
    }

    showVictoryScreen() {
      A.celebrate();
      this.container.innerHTML = `
        <div class="memory-victory-modal">
          <div class="victory-ribbon">⭐ ¡BRAVO AMANDA! ⭐</div>
          <h2>¡Tienes una memoria mágica!</h2>
          <p>¡Encontraste todas las parejas de Cinnamoroll y sus amigos!</p>
          <div class="victory-mascot-row">
            <img src="cinnamoroll_sprite.png" class="victory-bounce-cinna" alt="Cinnamoroll" />
            <div class="trophy-badge">🏆💖</div>
          </div>
          <div class="victory-stats">
            <span>¡${this.matchedPairs} parejas encontradas en ${this.moves} intentos!</span>
          </div>
          <div class="victory-action-buttons">
            <button class="btn-play-again-mem" data-diff="6">🌸 Jugar Fácil</button>
            <button class="btn-play-again-mem" data-diff="8">⭐ Jugar Medio</button>
            <button class="btn-play-again-mem" data-diff="12">🌟 Jugar Estrella</button>
          </div>
        </div>
      `;

      this.container.querySelectorAll('.btn-play-again-mem').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          const diff = parseInt(e.currentTarget.dataset.diff, 10);
          this.startNewGame(diff);
        });
      });
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.memoryGame = new MemoryGame();
})();
