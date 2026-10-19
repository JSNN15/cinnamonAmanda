/* Gestor del Hub Central y Navegación de la Suite Cinnamoroll Land
 * Permite cambiar sin problemas entre los 6 juegos y controla la música relajante global.
 */
(function () {
  const GAME_INTROS = {
    avatar: 'Casa de sueños. Viste a tus amigos y decora la casa.',
    flight: '¡A volar! Junta estrellas en el cielo.',
    math: 'Pastelería de números. Cuenta y suma dulces.',
    coloring: 'Taller de dibujo. Pinta con muchos colores.',
    memory: 'Memorice. Encuentra las parejas.',
    platformer: 'Súper carrera. Salta y junta pastelitos.',
    doom: 'Repartidor de dulces. Lleva un dulce a cada amigo.',
    writing: 'Palabras mágicas. Arma palabras con letras.',
    puzzle: 'Puzzles. Arma la imagen pieza por pieza.'
  };

  const { audio: A } = window.Cinnamo;

  class SuiteHub {
    constructor() {
      this.currentScreen = 'hub';
      this.musicEnabled = false;
    }

    init() {
      this.cacheDOMElements();
      this.bindEvents();
      
      const initialHash = (window.location.hash || '').replace('#', '');
      if (initialHash && initialHash !== 'hub' && this.screens[initialHash]) {
        this.launchGame(initialHash);
      } else {
        this.showScreen('hub');
      }
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
        puzzle: document.getElementById('screen-puzzle'),
        avatar: document.getElementById('screen-avatar')
      };

      this.btnHome = document.getElementById('globalBtnHome');
      this.btnMusic = document.getElementById('globalBtnMusic');
      this.musicIcon = document.getElementById('musicIcon');
      this.btnTrack = document.getElementById('globalBtnTrack');
      this.trackIcon = document.getElementById('trackIcon');
      this.trackName = document.getElementById('trackName');
      this.btnFullscreen = document.getElementById('globalBtnFullscreen');
      this.fullscreenIcon = document.getElementById('fullscreenIcon');
      this.fullscreenText = this.btnFullscreen ? this.btnFullscreen.querySelector('.btn-text') : null;
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

      // Botón universal de Pantalla Completa (Full Screen)
      if (this.btnFullscreen) {
        const updateFullscreenUI = () => {
          const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
          if (this.fullscreenIcon) {
            this.fullscreenIcon.textContent = isFs ? '🗗' : '📺';
          }
          if (this.fullscreenText) {
            this.fullscreenText.textContent = isFs ? 'Salir' : 'Pantalla';
          }
          this.btnFullscreen.setAttribute('title', isFs ? 'Salir de Pantalla Completa' : 'Activar Pantalla Completa');
          this.btnFullscreen.classList.toggle('active-fullscreen', isFs);
        };

        this.btnFullscreen.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(2);
          const docEl = document.documentElement;
          const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
          if (!isFs) {
            if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
            else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
            else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen();
            else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
          } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
          }
        });

        document.addEventListener('fullscreenchange', updateFullscreenUI);
        document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
        document.addEventListener('mozfullscreenchange', updateFullscreenUI);
        document.addEventListener('MSFullscreenChange', updateFullscreenUI);
      }

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
          // Decir de qué se trata el juego: muchos jugadores aún no leen
          window.Cinnamo?.say?.(GAME_INTROS[targetGame]);
          this.launchGame(targetGame);
        });
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
        });
      });

      // Soporte para botón 'Atrás' en móviles Android/iOS y navegadores
      window.addEventListener('popstate', () => {
        const hash = (window.location.hash || '').replace('#', '');
        if (!hash || hash === 'hub') {
          this.stopActiveGames();
          this.showScreen('hub');
        } else if (this.screens[hash] && this.currentScreen !== hash) {
          this.launchGame(hash);
        }
      });
    }

    stopActiveGames() {
      if (window.Cinnamo.pauseFlightGame) window.Cinnamo.pauseFlightGame();
      if (window.Cinnamo.suspendFlightSensors) window.Cinnamo.suspendFlightSensors();
      if (window.Cinnamo.platformerGame && window.Cinnamo.platformerGame.stop) window.Cinnamo.platformerGame.stop();
      if (window.Cinnamo.doomGame && window.Cinnamo.doomGame.stop) window.Cinnamo.doomGame.stop();
      if (window.Cinnamo.puzzleGame && window.Cinnamo.puzzleGame.stop) window.Cinnamo.puzzleGame.stop();
      if (window.Cinnamo.writingGame && window.Cinnamo.writingGame.stop) window.Cinnamo.writingGame.stop();
      if (window.Cinnamo.mathGame && window.Cinnamo.mathGame.stop) window.Cinnamo.mathGame.stop();
      if (window.Cinnamo.memoryGame && window.Cinnamo.memoryGame.stop) window.Cinnamo.memoryGame.stop();
      if (window.Cinnamo.coloringGame && window.Cinnamo.coloringGame.stop) window.Cinnamo.coloringGame.stop();
      if (window.Cinnamo.avatarWorldGame && window.Cinnamo.avatarWorldGame.stop) window.Cinnamo.avatarWorldGame.stop();
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

      // Sincronizar hash de navegación para preservar el juego actual ante cualquier recarga
      try {
        if (screenName === 'hub') {
          if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        } else {
          if (window.location.hash !== `#${screenName}`) {
            history.pushState(null, '', `#${screenName}`);
          }
        }
      } catch (_) {}

      // Notificar a los mandos conectados del cambio de pantalla
      if (window.Cinnamo?.controllerBridge?.broadcastGameContext) {
        window.Cinnamo.controllerBridge.broadcastGameContext({
          screen: screenName
        });
      }
    }

    launchGame(gameKey) {
      this.stopActiveGames();
      this.showScreen(gameKey);

      if (gameKey === 'flight') {
        if (window.Cinnamo.startFlightGame) {
          window.Cinnamo.startFlightGame();
        }
        if (window.Cinnamo.resumeFlightSensors) window.Cinnamo.resumeFlightSensors();
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
      } else if (gameKey === 'avatar') {
        const avatarMount = document.getElementById('avatar-mount');
        if (window.Cinnamo.avatarWorldGame) {
          window.Cinnamo.avatarWorldGame.init(avatarMount);
        }
      }

      // Reconfirmar sincronización de contexto con el mando tras montar el juego
      // (math y memory ya emiten su contexto enriquecido con opciones/cartas dentro de init)
      if (gameKey !== 'math' && gameKey !== 'memory' && window.Cinnamo?.controllerBridge?.broadcastGameContext) {
        window.Cinnamo.controllerBridge.broadcastGameContext({ screen: gameKey });
      }
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.hub = new SuiteHub();
  window.addEventListener('DOMContentLoaded', () => {
    window.Cinnamo.hub.init();
  });

  // Registro del Service Worker (100% silencioso: nunca recarga la página ni interrumpe el juego)
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        .then((reg) => reg.update())
        .catch(() => {});
    });
  }
})();
