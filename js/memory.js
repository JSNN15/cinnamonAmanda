/* Memorice de Sanrio (Juego de Memoria y Parejas)
 * Con los personajes OFICIALES de Cinnamoroll y sus amigos:
 * Cinnamoroll, Milk con su osito, Pompompurin con su boina, Mocha con sus flores, y Chiffon.
 * Cartas con volteo 3D, 3 niveles de dificultad, y celebración mágica de estrellas.
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const CHARACTERS = [
    {
      id: 'cinna',
      name: 'Cinnamoroll',
      emoji: '🪽',
      color: '#cce7ff',
      imgSrc: 'assets/cinnamoroll_fly.png'
    },
    {
      id: 'milk',
      name: 'Milk',
      emoji: '🍼',
      color: '#ffe0ed',
      imgSrc: 'assets/milk_teddy.png'
    },
    {
      id: 'purin',
      name: 'Pompompurin',
      emoji: '🍮',
      color: '#fff3b0',
      imgSrc: 'assets/pompompurin.png'
    },
    {
      id: 'mocha',
      name: 'Mocha',
      emoji: '🎀',
      color: '#faebd7',
      imgSrc: 'assets/mocha.png'
    },
    {
      id: 'chiffon',
      name: 'Chiffon',
      emoji: '🌸',
      color: '#ffd6e8',
      imgSrc: 'assets/chiffon.png'
    },
    {
      id: 'milk_sit',
      name: 'Bebé Milk',
      emoji: '🧸',
      color: '#e2f0cb',
      imgSrc: 'assets/milk_sitting.png'
    }
  ];

  class MemoryGame {
    constructor() {
      this.container = null;
      this.difficulty = 6;
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

      const deck = [];
      selectedChars.forEach((ch, idx) => {
        deck.push({ ...ch, uid: `card-${idx}-a`, matchKey: ch.id });
        deck.push({ ...ch, uid: `card-${idx}-b`, matchKey: ch.id });
      });

      deck.sort(() => Math.random() - 0.5);
      this.cards = deck;

      this.render();
    }

    render() {
      const numPairs = this.difficulty / 2;

      this.container.innerHTML = `
        <div class="memory-wrap">
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

          <div class="memory-grid grid-size-${this.difficulty}">
            ${this.cards.map((card, i) => `
              <div class="memory-card-slot" data-index="${i}">
                <div class="card-inner">
                  <div class="card-back">
                    <span class="card-back-pattern">🐾</span>
                    <span class="card-back-sparkle">✨</span>
                  </div>
                  <div class="card-front" style="background: ${card.color};">
                    <div class="card-art-box">
                      <img src="${card.imgSrc}" class="memory-char-sprite" alt="${card.name}" />
                    </div>
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
      this.container.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          const diff = parseInt(e.currentTarget.dataset.diff, 10);
          this.startNewGame(diff);
        });
      });

      this.container.querySelectorAll('.memory-card-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
          if (this.isLocked) return;
          const target = e.currentTarget;
          const idx = parseInt(target.dataset.index, 10);
          const cardData = this.cards[idx];

          if (target.classList.contains('flipped') || target.classList.contains('matched')) return;

          A.unlock();
          A.bubblePop(this.flippedCards.length + 1);

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

          if (this.matchedPairs === this.difficulty / 2) {
            setTimeout(() => this.showVictoryScreen(), 600);
          }
        }, 400);
      } else {
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
            <img src="assets/cinnamoroll_fly.png" class="victory-bounce-cinna" alt="Cinnamoroll" />
            <img src="assets/milk_teddy.png" class="victory-bounce-cinna" alt="Milk" />
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
