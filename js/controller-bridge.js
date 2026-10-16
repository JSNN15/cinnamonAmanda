/* ============================================================
   PUENTE DE MANDOS INALÁMBRICOS & BLUETOOTH (controller-bridge.js)
   Permite:
   1. Conectar cualquier Celular como Mando Kawaii mediante Código QR / WebRTC (PeerJS)
   2. Conectar Mandos Físicos de Consola (Nintendo Switch Joy-Con, Xbox, PS4/PS5, 8BitDo)
   ============================================================ */
(function () {
  const A = () => window.Cinnamo?.audio;
  const IN = () => window.Cinnamo?.input;

  class ControllerBridge {
    constructor() {
      this.roomCode = this.getOrGenerateRoomCode();
      this.peer = null;
      this.connections = [];
      this.broadcastChannel = null;
      this.isHost = true;
      this.connectedCount = 0;
      this.statusListeners = [];
      this.physicalGamepadActive = false;
      this.lastGamepadState = {};
      
      this.initBroadcast();
      this.initPeerHost();
      this.initPhysicalGamepadLoop();
    }

    getOrGenerateRoomCode() {
      let code = localStorage.getItem('cinna_room_code') || sessionStorage.getItem('cinna_room_code');
      if (!code) {
        // Generar código simpático de 4 letras fáciles
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        code = '';
        for (let i = 0; i < 4; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        localStorage.setItem('cinna_room_code', code);
        sessionStorage.setItem('cinna_room_code', code);
      }
      return code;
    }

    getControllerUrl() {
      const loc = window.location;
      const base = loc.origin + loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
      return `${base}controller.html?room=${this.roomCode}`;
    }

    onStatus(fn) {
      this.statusListeners.push(fn);
      fn({ count: this.connectedCount, room: this.roomCode, gamepad: this.physicalGamepadActive });
    }

    notifyStatus() {
      const state = { count: this.connectedCount, room: this.roomCode, gamepad: this.physicalGamepadActive };
      this.statusListeners.forEach(fn => { try { fn(state); } catch (_) {} });
    }

    broadcastGameContext(ctx) {
      this.lastContext = ctx;
      const payload = { type: 'context', ...ctx };
      this.connections.forEach(conn => {
        if (conn && conn.open) {
          try { conn.send(payload); } catch (_) {}
        }
      });
      if (this.broadcastChannel) {
        try { this.broadcastChannel.postMessage(payload); } catch (_) {}
      }
    }

    /* ---------- 1. BROADCAST CHANNEL (Fallback para misma máquina/pestañas) ---------- */
    initBroadcast() {
      try {
        if ('BroadcastChannel' in window) {
          this.broadcastChannel = new BroadcastChannel(`cinna_pad_${this.roomCode}`);
          this.broadcastChannel.onmessage = (ev) => {
            if (!ev.data) return;
            if (ev.data.type === 'hello') {
              this.connectedCount = Math.max(1, this.connectedCount);
              this.notifyStatus();
              this.broadcastChannel.postMessage({ type: 'welcome', room: this.roomCode });
              if (this.lastContext) {
                this.broadcastGameContext(this.lastContext);
              } else if (window.Cinnamo?.hub?.currentScreen) {
                this.broadcastGameContext({ screen: window.Cinnamo.hub.currentScreen });
              }
            } else {
              this.handleRemoteData(ev.data);
            }
          };
        }
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    /* ---------- 2. WEBRTC PEER-TO-PEER (Para Celulares vía Wi-Fi o Internet) ---------- */
    initPeerHost() {
      if (typeof Peer === 'undefined') {
        console.warn('PeerJS no disponible, usando BroadcastChannel como fallback.');
        return;
      }

      const peerId = `cinna-host-${this.roomCode.toLowerCase()}`;
      const peerConfig = {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      };

      try {
        this.peer = new Peer(peerId, peerConfig);

        this.peer.on('open', (id) => {
          console.log('🎮 Servidor de Mando iniciado con ID:', id);
          this.notifyStatus();
        });

        this.peer.on('connection', (conn) => {
          console.log('📱 ¡Celular conectado al mando!');
          this.connections.push(conn);
          this.connectedCount = this.connections.length;
          this.notifyStatus();
          this.showToast('📱 ¡Mando celular conectado! 🌸');

          // Celebración sonora suave en PC
          if (A()) {
            A().unlock();
            A().celebrate();
          }

          conn.on('open', () => {
            try {
              conn.send({ type: 'welcome', room: this.roomCode });
              const ctx = this.lastContext || { screen: window.Cinnamo?.hub?.currentScreen || 'hub' };
              conn.send({ type: 'context', ...ctx });
            } catch (_) {}
          });

          conn.on('data', (data) => {
            if (!data) return;
            if (data.type === 'ping') {
              try { conn.send({ type: 'pong' }); } catch (_) {}
              return;
            }
            if (data.type === 'hello') {
              try {
                conn.send({ type: 'welcome', room: this.roomCode });
                const ctx = this.lastContext || { screen: window.Cinnamo?.hub?.currentScreen || 'hub' };
                conn.send({ type: 'context', ...ctx });
              } catch (_) {}
              return;
            }
            this.handleRemoteData(data);
          });

          conn.on('close', () => {
            this.connections = this.connections.filter(c => c !== conn);
            this.connectedCount = this.connections.length;
            this.notifyStatus();
          });
        });

        this.peer.on('error', (err) => {
          if (err.type === 'unavailable-id') {
            localStorage.removeItem('cinna_room_code');
            sessionStorage.removeItem('cinna_room_code');
            this.roomCode = this.getOrGenerateRoomCode();
            setTimeout(() => this.initPeerHost(), 1000);
          } else {
            console.warn('Peer error:', err);
          }
        });
      } catch (e) {
        console.warn('Error inicializando PeerJS:', e);
      }
    }

    /* ---------- 3. TRADUCCIÓN DE ENTRADA REMOTA HACIA TODOS LOS JUEGOS ---------- */
    handleRemoteData(data) {
      if (!data) return;

      // Movimiento con Palanca Táctil Analógica (diagonales fluidas)
      if (data.type === 'joystick') {
        this.handleRemoteJoystick(data.x, data.y, data.angle, data.dist);
        return;
      }

      // Respuesta de Matemática desde el Celular
      if (data.type === 'mathAnswer') {
        if (window.Cinnamo?.mathGame?.submitAnswer) {
          window.Cinnamo.mathGame.submitAnswer(data.val);
        }
        return;
      }

      // Cambio rápido de personaje en Super Run o Repartidor 3D
      if (data.type === 'switchHero') {
        const screen = window.Cinnamo?.hub?.currentScreen;
        if (screen === 'platformer' && window.Cinnamo?.platformerGame?.nextHero) {
          window.Cinnamo.platformerGame.nextHero();
        } else if (screen === 'doom' && window.Cinnamo?.doomGame?.nextHero) {
          window.Cinnamo.doomGame.nextHero();
        }
        return;
      }

      // Volteo de carta en Memorice desde el celular
      if (data.type === 'flipCard') {
        if (window.Cinnamo?.memoryGame?.flipCard) {
          window.Cinnamo.memoryGame.flipCard(data.index);
        } else if (window.Cinnamo?.memoryGame?.handleCardClick) {
          window.Cinnamo.memoryGame.handleCardClick(data.index);
        }
        return;
      }

      // Reinicio de Memorice
      if (data.type === 'memoryNewGame') {
        if (window.Cinnamo?.memoryGame?.startNewGame) {
          window.Cinnamo.memoryGame.startNewGame(window.Cinnamo.memoryGame.difficulty || 8);
        }
        return;
      }

      // Acciones de Rompecabezas
      if (data.type === 'puzzlePlaceNext') {
        if (window.Cinnamo?.puzzleGame?.placeNextPiece) {
          window.Cinnamo.puzzleGame.placeNextPiece();
        }
        return;
      }
      if (data.type === 'puzzleReset') {
        if (window.Cinnamo?.puzzleGame?.resetPuzzle) {
          window.Cinnamo.puzzleGame.resetPuzzle();
        }
        return;
      }
      if (data.type === 'puzzleHint') {
        if (window.Cinnamo?.puzzleGame?.toggleGhost) {
          window.Cinnamo.puzzleGame.toggleGhost();
        } else {
          const eyeBtn = document.getElementById('btnToggleGhost') || document.getElementById('btnToggleEye');
          if (eyeBtn) eyeBtn.click();
        }
        return;
      }
      if (data.type === 'puzzleNext') {
        if (window.Cinnamo?.puzzleGame?.nextCharacter) {
          window.Cinnamo.puzzleGame.nextCharacter();
        } else {
          const nextBtn = document.getElementById('btnNextPuzzleModal') || document.getElementById('btnNextCharacter');
          if (nextBtn) nextBtn.click();
        }
        return;
      }

      // Acciones de Taller de Dibujo
      if (data.type === 'colorPick') {
        const chip = document.querySelector(`.swatch-btn[data-color="${data.color}"]`) || 
                     document.querySelector(`.palette-chip[data-color="${data.color}"]`);
        if (chip) chip.click();
        else if (window.Cinnamo?.coloringGame) window.Cinnamo.coloringGame.selectedColor = data.color;
        return;
      }
      if (data.type === 'colorTool') {
        const tBtn = document.querySelector(`.tool-btn[data-tool="${data.tool}"]`);
        if (tBtn) tBtn.click();
        return;
      }
      if (data.type === 'colorUndo') {
        const undoBtn = document.getElementById('btnUndoArt');
        if (undoBtn) undoBtn.click();
        return;
      }
      if (data.type === 'colorNextSheet') {
        const active = document.querySelector('.sheet-tab-btn.active');
        const next = active ? (active.nextElementSibling || document.querySelector('.sheet-tab-btn')) : null;
        if (next) next.click();
        return;
      }
      if (data.type === 'colorClear') {
        const clr = document.getElementById('btnClearSheet') || 
                    document.querySelector('.tool-btn[data-action="clear"]');
        if (clr) clr.click();
        return;
      }

      // Acciones de Palabras Mágicas
      if (data.type === 'writingNext') {
        if (window.Cinnamo?.writingGame?.nextLetter) {
          window.Cinnamo.writingGame.nextLetter();
        } else {
          const nxt = document.getElementById('btnNextTraceLetter') || 
                      document.getElementById('btnNextWordModal') || 
                      document.getElementById('btnNextSentenceModal') || 
                      document.querySelector('.btn-w-next');
          if (nxt) nxt.click();
        }
        return;
      }
      if (data.type === 'writingPrev') {
        if (window.Cinnamo?.writingGame?.prevLetter) {
          window.Cinnamo.writingGame.prevLetter();
        }
        return;
      }
      if (data.type === 'writingSpeak') {
        if (window.Cinnamo?.writingGame?.speakCurrent) {
          window.Cinnamo.writingGame.speakCurrent();
        }
        return;
      }
      if (data.type === 'writingClear') {
        if (window.Cinnamo?.writingGame?.clearTrace) {
          window.Cinnamo.writingGame.clearTrace();
        } else {
          const clr = document.getElementById('btnClearTrace') || 
                      document.getElementById('btnClearFree') || 
                      document.getElementById('btnClearCanvas');
          if (clr) clr.click();
        }
        return;
      }

      // Navegación remota (Hub / Cambiar juego)
      if (data.type === 'nav') {
        if (data.screen === 'hub') {
          const btnH = document.getElementById('globalBtnHome');
          if (btnH) btnH.click();
        } else if (window.Cinnamo?.hub?.launchGame) {
          window.Cinnamo.hub.launchGame(data.screen);
        }
        return;
      }

      // Pantalla Completa solicitada desde el celular
      if (data.type === 'toggleFullscreen') {
        const btnFs = document.getElementById('globalBtnFullscreen');
        if (btnFs) btnFs.click();
        return;
      }

      // Modo Cooperativo Asimétrico (TV + Celular) & Pasaporte de Stickers
      if (data.type === 'coopStarRain') {
        window.Cinnamo?.coop?.triggerStarRain?.();
        return;
      }
      if (data.type === 'coopShield') {
        window.Cinnamo?.coop?.triggerShield?.();
        return;
      }
      if (data.type === 'coopCheer') {
        window.Cinnamo?.coop?.triggerCheer?.();
        return;
      }
      if (data.type === 'coopPassport') {
        window.Cinnamo?.passport?.togglePassport?.();
        return;
      }

      // Botón estándar (d-pad o botones de acción)
      if (data.type === 'input' || data.btn !== undefined) {
        this.handleRemoteInput(data.btn, data.pressed);
        return;
      }
    }

    handleRemoteJoystick(x, y, angle, dist) {
      const screen = window.Cinnamo?.hub?.currentScreen || 'platformer';

      // 1. Super Cinnamoroll Run (Diagonales fluidas: correr y saltar/planear)
      if (screen === 'platformer') {
        const plat = window.Cinnamo?.platformerGame;
        if (plat && plat.keys) {
          plat.keys.left = x < -0.24;
          plat.keys.right = x > 0.24;
          const wantsJump = y < -0.65;
          if (wantsJump && !plat.keys.jump) {
            plat.keys.jump = true;
            if (plat.jump) plat.jump();
          } else if (!wantsJump && plat.keys.jump && !plat._jumpBtnHeld) {
            plat.keys.jump = false;
            if (plat.p && plat.p.vy < -180) {
              plat.p.vy *= 0.65;
            }
          }
        }
        return;
      }

      // 2. Repartidor 3D (Caminar y rotar en simultáneo)
      if (screen === 'doom') {
        const doom = window.Cinnamo?.doomGame;
        if (doom && doom.keys) {
          doom.keys.forward = y < -0.24;
          doom.keys.backward = y > 0.24;
          doom.keys.left = x < -0.24;
          doom.keys.right = x > 0.24;
        }
        return;
      }

      // 3. A Volar (Vuelo 360° analógico suave sin saturar el audio)
      if (screen === 'flight') {
        const input = IN();
        if (input && Math.abs(y) > 0.15) {
          input.setTarget('gamepad', Math.max(0.06, Math.min(0.94, 0.5 + y * 0.45)), 180);
        }
        return;
      }
    }

    handleRemoteInput(btn, pressed) {
      const screen = window.Cinnamo?.hub?.currentScreen || 'platformer';

      // 1. Despachar a Super Cinnamoroll Run (platformer.js)
      if (screen === 'platformer') {
        const plat = window.Cinnamo?.platformerGame;
        if (plat && plat.keys) {
          if (btn === 'left') plat.keys.left = pressed;
          if (btn === 'right') plat.keys.right = pressed;
          if (btn === 'jump' || btn === 'up') {
            plat._jumpBtnHeld = pressed;
            plat.keys.jump = pressed;
            if (pressed && plat.jump) {
              plat.jump();
            } else if (!pressed && plat.p && plat.p.vy < -180) {
              plat.p.vy *= 0.65;
            }
          }
          if (btn === 'treat' && pressed) {
            if (plat.treat) plat.treat();
          }
        }
        return;
      }

      // 2. Despachar a Repartidor 3D (doom.js)
      if (screen === 'doom') {
        const doom = window.Cinnamo?.doomGame;
        if (doom) {
          if (doom.inCharSelect) {
            if (pressed && (btn === 'jump' || btn === 'treat')) {
              doom.start3DGame();
              return;
            }
          }
          if (doom.keys) {
            if (btn === 'left') doom.keys.left = pressed;
            if (btn === 'right') doom.keys.right = pressed;
            if (btn === 'up') doom.keys.forward = pressed;
            if (btn === 'down') doom.keys.backward = pressed;
            if ((btn === 'treat' || btn === 'jump') && pressed) {
              if (doom.shootTreat) doom.shootTreat();
              else if (doom.throwTreat) doom.throwTreat();
            }
          }
        }
        return;
      }

      // 3. Despachar a A Volar (game.js)
      if (screen === 'flight') {
        const input = IN();
        if (input) {
          if (btn === 'up' && pressed) input.feed({ action: 'up' });
          if (btn === 'down' && pressed) input.feed({ action: 'down' });
          if ((btn === 'jump' || btn === 'spin') && pressed) input.feed({ action: 'spin' });
          if (btn === 'treat' && pressed) input.feed({ action: 'hello' });
          if (pressed && window.Cinnamo?.game?.mode !== 'play') {
            input.feed({ action: 'start' });
          }
        }
        return;
      }

      // 4. Despachar evento global de teclado sintético para menús u otros componentes
      const keyMap = {
        left: 'ArrowLeft',
        right: 'ArrowRight',
        up: 'ArrowUp',
        down: 'ArrowDown',
        jump: 'Space',
        treat: 'KeyE'
      };
      const code = keyMap[btn];
      if (code) {
        const evtType = pressed ? 'keydown' : 'keyup';
        window.dispatchEvent(new KeyboardEvent(evtType, { code, key: code, bubbles: true }));
      }
    }

    /* ---------- 4. SOPORTE DE MANDOS FÍSICOS (Gamepad API) ---------- */
    initPhysicalGamepadLoop() {
      window.addEventListener('gamepadconnected', (e) => {
        console.log('🎮 Mando físico conectado:', e.gamepad.id);
        this.physicalGamepadActive = true;
        this.notifyStatus();
        this.showToast(`🎮 Mando conectado: ${e.gamepad.id.split('(')[0]}`);
      });

      window.addEventListener('gamepaddisconnected', () => {
        this.physicalGamepadActive = false;
        this.notifyStatus();
      });

      const poll = () => {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        let anyConnected = false;
        for (let i = 0; i < gamepads.length; i++) {
          const gp = gamepads[i];
          if (!gp) continue;
          anyConnected = true;

          // Ejes: Stick izquierdo
          const axisX = gp.axes[0] || 0;
          const axisY = gp.axes[1] || 0;
          const deadZone = 0.35;

          // Botones estándar
          // 0: A / Cruz, 1: B / Círculo, 12: Dpad Arriba, 13: Dpad Abajo, 14: Dpad Izq, 15: Dpad Der
          const btnA = gp.buttons[0]?.pressed || false;
          const btnB = gp.buttons[1]?.pressed || false;
          const dUp = gp.buttons[12]?.pressed || axisY < -deadZone;
          const dDown = gp.buttons[13]?.pressed || axisY > deadZone;
          const dLeft = gp.buttons[14]?.pressed || axisX < -deadZone;
          const dRight = gp.buttons[15]?.pressed || axisX > deadZone;

          const current = { left: dLeft, right: dRight, up: dUp, down: dDown, jump: btnA, treat: btnB };

          for (const k in current) {
            if (current[k] !== this.lastGamepadState[k]) {
              this.handleRemoteInput(k, current[k]);
            }
          }
          this.lastGamepadState = current;
          break; // Usar el primer mando activo
        }
        this.physicalGamepadActive = anyConnected;
        requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
    }

    initUI() {
      const btnGamepad = document.getElementById('globalBtnGamepad');
      const modal = document.getElementById('gamepadModal');
      const btnClose = document.getElementById('btnCloseGamepadModal');
      const qrContainer = document.getElementById('gamepadQrCode');
      const roomDisplay = document.getElementById('gamepadRoomDisplay');
      const statusPill = document.getElementById('gamepadConnStatus');

      if (!btnGamepad || !modal) return;

      const openModal = () => {
        if (A()) { A().unlock(); A().bubblePop(2); }
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        if (roomDisplay) roomDisplay.textContent = this.roomCode;

        // Renderizar código QR
        if (qrContainer && typeof QRCode !== 'undefined') {
          qrContainer.innerHTML = '';
          try {
            new QRCode(qrContainer, {
              text: this.getControllerUrl(),
              width: 154,
              height: 154,
              colorDark: '#5c3d2e',
              colorLight: '#ffffff',
              correctLevel: QRCode.CorrectLevel.M
            });
          } catch (e) {
            console.warn('QRCode render error:', e);
            qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=154x154&data=${encodeURIComponent(this.getControllerUrl())}" alt="QR Code" width="154" height="154" />`;
          }
        } else if (qrContainer) {
          qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=154x154&data=${encodeURIComponent(this.getControllerUrl())}" alt="QR Code" width="154" height="154" />`;
        }
      };

      const closeModal = () => {
        if (A()) { A().unlock(); A().softBoing(); }
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
      };

      btnGamepad.addEventListener('click', openModal);
      if (btnClose) btnClose.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

      this.onStatus((st) => {
        if (!statusPill) return;
        if (st.count > 0) {
          statusPill.className = 'gamepad-status-pill connected';
          statusPill.textContent = '🟢 ¡Celular conectado! Mando Listo ✨';
        } else if (st.gamepad) {
          statusPill.className = 'gamepad-status-pill connected';
          statusPill.textContent = '🎮 ¡Mando físico Bluetooth conectado!';
        } else {
          statusPill.className = 'gamepad-status-pill';
          statusPill.textContent = '🟡 Esperando que el celular se conecte...';
        }
      });
    }

    showToast(msg) {
      let toast = document.getElementById('cinnaGamepadToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cinnaGamepadToast';
        toast.className = 'cinna-gamepad-toast';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 3500);
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  const bridge = new ControllerBridge();
  window.Cinnamo.controllerBridge = bridge;
  window.Cinnamo.bridge = bridge;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bridge.initUI());
  } else {
    bridge.initUI();
  }
})();
