/* Memorice de Sanrio (Juego de Memoria y Parejas)
 * Con los personajes OFICIALES de Cinnamoroll y sus amigos:
 * Cinnamoroll, Milk con su osito, Pompompurin con su boina, Mocha con sus flores, y Chiffon.
 * Cartas con volteo 3D, niveles adaptados a 5 a 8 años (hasta 16 cartas / 8 parejas en rejilla 4x4).
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
      imgSrc: 'assets/pompompurin_hq.png'
    },
    {
      id: 'mocha',
      name: 'Mocha',
      emoji: '🎀',
      color: '#faebd7',
      imgSrc: 'assets/mocha_hq.png'
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
    },
    {
      id: 'purin_flan',
      name: 'Flan Purin',
      emoji: '🍮',
      color: '#fef08a',
      imgSrc: 'assets/puzzle_purin.png'
    },
    {
      id: 'mocha_tea',
      name: 'Té de Mocha',
      emoji: '🎀',
      color: '#fbcfe8',
      imgSrc: 'assets/puzzle_mocha.png'
    }
  ];

  class MemoryGame {
    constructor() {
      this.container = null;
      this.difficulty = 8; // 8 (5-6 años), 12 (6-7 años), 16 (7-8 años)
      this.cards = [];
      this.flippedCards = [];
      this.matchedPairs = 0;
      this.isLocked = false;
      this.moves = 0;
      this.matchTimeouts = [];
    }

    clearMatchTimeouts() {
      if (this.matchTimeouts) {
        this.matchTimeouts.forEach(t => clearTimeout(t));
        this.matchTimeouts = [];
      }
    }

    stop() {
      this.clearMatchTimeouts();
    }

    init(containerEl) {
      this.clearMatchTimeouts();
      this.container = containerEl;
      this.startNewGame(this.difficulty);
    }

    startNewGame(totalCards = 8) {
      this.clearMatchTimeouts();
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

      if (window.Cinnamo?.controllerBridge?.broadcastGameContext) {
        window.Cinnamo.controllerBridge.broadcastGameContext({
          screen: 'memory',
          cardsCount: this.difficulty || 8,
          matchedPairs: this.matchedPairs,
          totalPairs: this.difficulty / 2
        });
      }
    }

    flipCard(index) {
      if (this.container) {
        const playAgainBtn = this.container.querySelector('#btnPlayAgainMemory');
        if (playAgainBtn) {
          playAgainBtn.click();
          return;
        }
      }
      this.handleCardClick(index);
    }

    render() {
      const numPairs = this.difficulty / 2;

      this.container.innerHTML = `
        <div class="memory-wrap">
          <div class="memory-top-bar">
            <div class="diff-selector">
              <button class="diff-btn ${this.difficulty === 8 ? 'active' : ''}" data-diff="8">🌸 8 Cartas (5-6 años)</button>
              <button class="diff-btn ${this.difficulty === 12 ? 'active' : ''}" data-diff="12">⭐ 12 Cartas (6-7 años)</button>
              <button class="diff-btn ${this.difficulty === 16 ? 'active' : ''}" data-diff="16">👑 16 Cartas (7-8 años)</button>
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
                    <span class="card-char-emoji">${card.emoji}</span>
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
          const idx = parseInt(e.currentTarget.dataset.index, 10);
          this.handleCardClick(idx);
        });
      });
    }

    handleCardClick(index) {
      if (this.isLocked) return;

      const card = this.cards[index];
      const slotEl = this.container.querySelector(`.memory-card-slot[data-index="${index}"]`);

      if (!slotEl || slotEl.classList.contains('flipped') || slotEl.classList.contains('matched')) {
        return;
      }

      A.unlock();
      A.whoosh();

      slotEl.classList.add('flipped');
      this.flippedCards.push({ index, card, el: slotEl });

      if (this.flippedCards.length === 2) {
        this.moves++;
        this.checkMatch();
      }
    }

    checkMatch() {
      const [first, second] = this.flippedCards;
      this.isLocked = true;

      if (first.card.matchKey === second.card.matchKey) {
        const tSuccess = setTimeout(() => {
          A.collect(this.matchedPairs + 1);
          A.sparkleChime();

          first.el.classList.add('matched');
          second.el.classList.add('matched');

          this.matchedPairs++;
          window.Cinnamo?.passport?.addStars?.(1, 'memory');
          const counter = this.container.querySelector('#matchedCount');
          if (counter) counter.textContent = this.matchedPairs;

          this.flippedCards = [];
          this.isLocked = false;

          if (this.matchedPairs === this.difficulty / 2) {
            const tWin = setTimeout(() => this.triggerVictory(), 400);
            this.matchTimeouts.push(tWin);
          }
        }, 400);
        this.matchTimeouts.push(tSuccess);
      } else {
        const tFail = setTimeout(() => {
          A.softBoing();
          first.el.classList.remove('flipped');
          second.el.classList.remove('flipped');

          this.flippedCards = [];
          this.isLocked = false;
        }, 900);
        this.matchTimeouts.push(tFail);
      }
    }

    triggerVictory() {
      A.celebrate();
      window.Cinnamo?.passport?.addStars?.(3, 'memory');
      const numPairs = this.difficulty / 2;

      const modal = document.createElement('div');
      modal.className = 'w-victory-modal-overlay';
      modal.innerHTML = `
        <div class="w-victory-card">
          <div class="w-victory-badge">🃏 ¡MEMORICE COMPLETADO! 🃏</div>
          <h2 style="color: #ec4899">¡Encontraste las ${numPairs} parejas!</h2>
          <div class="w-victory-img-box">
            <img src="assets/cinnamoroll_fly.png" alt="Cinnamoroll" />
          </div>
          <p>¡${cinnaName()}, tienes una memoria de estrella! 💖 ⭐⭐⭐</p>
          <div class="w-victory-actions">
            <button class="btn-w-next" id="btnPlayAgainMemory">▶ Jugar Otra Vez</button>
          </div>
        </div>
      `;
      this.container.appendChild(modal);

      modal.querySelector('#btnPlayAgainMemory').addEventListener('click', () => {
        A.unlock();
        modal.remove();
        this.startNewGame(this.difficulty);
      });
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.memoryGame = new MemoryGame();
})();
