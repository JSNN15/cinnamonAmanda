/* Gestor del Hub Central y Navegación de la Suite Cinnamoroll Land
 * Permite cambiar sin problemas entre los 3 juegos y controla la música relajante global.
 */
(function () {
  const { audio: A } = window.Cinnamo;

  class SuiteHub {
    constructor() {
      this.currentScreen = 'hub';
      this.musicEnabled = false;
    }

    init() {
      this.cacheDOMElements();
      this.bindEvents();
      this.showScreen('hub');
    }

    cacheDOMElements() {
      this.screens = {
        hub: document.getElementById('screen-hub'),
        flight: document.getElementById('screen-flight'),
        math: document.getElementById('screen-math'),
        coloring: document.getElementById('screen-coloring')
      };

      this.btnHome = document.getElementById('globalBtnHome');
      this.btnMusic = document.getElementById('globalBtnMusic');
      this.musicIcon = document.getElementById('musicIcon');
    }

    bindEvents() {
      // Botón universal de volver a la casita (Hub)
      this.btnHome.addEventListener('click', () => {
        A.unlock();
        A.bubblePop(1);
        if (window.Cinnamo.pauseFlightGame) window.Cinnamo.pauseFlightGame();
        this.showScreen('hub');
      });

      // Botón universal de música relajante de caja de música
      this.btnMusic.addEventListener('click', () => {
        A.unlock();
        this.musicEnabled = A.toggleMusic();
        this.musicIcon.textContent = this.musicEnabled ? '🎵' : '🔇';
        this.btnMusic.classList.toggle('playing', this.musicEnabled);
      });

      // Tarjetas del Hub
      document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', (e) => {
          A.unlock();
          A.kawaiiChirp('cheer');
          // Iniciar música automáticamente si aún no estaba activa
          if (!this.musicEnabled) {
            this.musicEnabled = true;
            A.startMusic();
            this.musicIcon.textContent = '🎵';
            this.btnMusic.classList.add('playing');
          }

          const targetGame = e.currentTarget.dataset.game;
          this.launchGame(targetGame);
        });
      });
    }

    showScreen(screenName) {
      this.currentScreen = screenName;
      Object.keys(this.screens).forEach(key => {
        if (this.screens[key]) {
          this.screens[key].classList.toggle('active', key === screenName);
        }
      });

      // El botón Home sólo se muestra cuando estamos dentro de un juego
      this.btnHome.classList.toggle('hidden', screenName === 'hub');
    }

    launchGame(gameKey) {
      this.showScreen(gameKey);

      if (gameKey === 'flight') {
        if (window.Cinnamo.startFlightGame) {
          window.Cinnamo.startFlightGame();
        }
      } else if (gameKey === 'math') {
        const mathMount = document.getElementById('math-mount');
        if (window.Cinnamo.mathGame) {
          window.Cinnamo.mathGame.init(mathMount);
        }
      } else if (gameKey === 'coloring') {
        const colorMount = document.getElementById('coloring-mount');
        if (window.Cinnamo.coloringGame) {
          window.Cinnamo.coloringGame.init(colorMount);
        }
      }
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.hub = new SuiteHub();
  window.addEventListener('DOMContentLoaded', () => {
    window.Cinnamo.hub.init();
  });
})();
