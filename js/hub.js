/* Gestor del Hub Central y Navegación de la Suite Cinnamoroll Land
 * Permite cambiar sin problemas entre los 6 juegos y controla la música relajante global.
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
      this.dismissPreloader();
    }

    dismissPreloader() {
      const p = document.getElementById('appPreloader');
      if (p) {
        setTimeout(() => {
          p.classList.add('fade-out');
          setTimeout(() => { try { p.remove(); } catch (_) {} }, 400);
        }, 150);
      }
    }

    cacheDOMElements() {
      this.screens = {
        hub: document.getElementById('screen-hub'),
        flight: document.getElementById('screen-flight'),
        math: document.getElementById('screen-math'),
        coloring: document.getElementById('screen-coloring'),
        memory: document.getElementById('screen-memory'),
        platformer: document.getElementById('screen-platformer'),
        doom: document.getElementById('screen-doom'),
        writing: document.getElementById('screen-writing'),
        puzzle: document.getElementById('screen-puzzle')
      };

      this.btnHome = document.getElementById('globalBtnHome');
      this.btnMusic = document.getElementById('globalBtnMusic');
      this.musicIcon = document.getElementById('musicIcon');
      this.btnTrack = document.getElementById('globalBtnTrack');
      this.trackIcon = document.getElementById('trackIcon');
      this.trackName = document.getElementById('trackName');
    }

    updateTrackUI() {
      if (!this.trackIcon || !this.trackName) return;
      const t = A.getCurrentTrack();
      if (t) {
        this.trackIcon.textContent = t.icon;
        this.trackName.textContent = t.name.split(' ')[0];
      }
    }

    bindEvents() {
      // Botón universal de volver a la casita (Hub)
      this.btnHome.addEventListener('click', () => {
        A.unlock();
        A.bubblePop(1);
        this.stopActiveGames();
        this.showScreen('hub');
      });

      // Botón universal de música relajante de caja de música
      this.btnMusic.addEventListener('click', () => {
        A.unlock();
        this.musicEnabled = A.toggleMusic();
        this.musicIcon.textContent = this.musicEnabled ? '🎵' : '🔇';
        this.btnMusic.classList.toggle('playing', this.musicEnabled);
        if (this.btnTrack) {
          this.btnTrack.classList.toggle('hidden', !this.musicEnabled);
          this.updateTrackUI();
        }
      });

      // Botón para cambiar de melodía
      if (this.btnTrack) {
        this.btnTrack.addEventListener('click', () => {
          A.unlock();
          const next = A.nextTrack();
          this.updateTrackUI();
        });
      }

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
            if (this.btnTrack) {
              this.btnTrack.classList.remove('hidden');
              this.updateTrackUI();
            }
          }

          const targetGame = e.currentTarget.dataset.game;
          this.launchGame(targetGame);
        });
      });
    }

    stopActiveGames() {
      if (window.Cinnamo.pauseFlightGame) window.Cinnamo.pauseFlightGame();
      if (window.Cinnamo.platformerGame && window.Cinnamo.platformerGame.stop) window.Cinnamo.platformerGame.stop();
      if (window.Cinnamo.doomGame && window.Cinnamo.doomGame.stop) window.Cinnamo.doomGame.stop();
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
      this.stopActiveGames();
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
      } else if (gameKey === 'memory') {
        const memoryMount = document.getElementById('memory-mount');
        if (window.Cinnamo.memoryGame) {
          window.Cinnamo.memoryGame.init(memoryMount);
        }
      } else if (gameKey === 'platformer') {
        const platMount = document.getElementById('platformer-mount');
        if (window.Cinnamo.platformerGame) {
          window.Cinnamo.platformerGame.init(platMount);
        }
      } else if (gameKey === 'doom') {
        const doomMount = document.getElementById('doom-mount');
        if (window.Cinnamo.doomGame) {
          window.Cinnamo.doomGame.init(doomMount);
        }
      } else if (gameKey === 'writing') {
        const writingMount = document.getElementById('writing-mount');
        if (window.Cinnamo.writingGame) {
          window.Cinnamo.writingGame.init(writingMount);
        }
      } else if (gameKey === 'puzzle') {
        const puzzleMount = document.getElementById('puzzle-mount');
        if (window.Cinnamo.puzzleGame) {
          window.Cinnamo.puzzleGame.init(puzzleMount);
        }
      }
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.hub = new SuiteHub();
  window.addEventListener('DOMContentLoaded', () => {
    window.Cinnamo.hub.init();
  });

  // Registro del Service Worker (network-first: sirve de respaldo offline)
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    // Si un SW nuevo toma el control (despliegue nuevo), recargar una sola vez para usar los archivos frescos
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      window.location.reload();
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        .then((reg) => reg.update())
        .catch(() => {});
    });
  }
})();
