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
      let code = sessionStorage.getItem('cinna_room_code');
      if (!code) {
        // Generar código simpático de 4 letras fáciles
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        code = '';
        for (let i = 0; i < 4; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
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
      try {
        this.peer = new Peer(peerId, {
          debug: 0
        });

        this.peer.on('open', (id) => {
          console.log('🎮 Servidor de Mando iniciado con ID:', id);
          this.notifyStatus();
        });

        this.peer.on('connection', (conn) => {
          console.log('📱 ¡Celular conectado al mando!');
          this.connections.push(conn);
          this.connectedCount = this.connections.length;
          this.notifyStatus();

          // Celebración sonora suave en PC
          if (A()) {
            A().unlock();
            A().celebrate();
          }

          conn.on('open', () => {
            conn.send({ type: 'welcome', room: this.roomCode });
            const ctx = this.lastContext || { screen: window.Cinnamo?.hub?.currentScreen || 'hub' };
            try { conn.send({ type: 'context', ...ctx }); } catch (_) {}
          });

          conn.on('data', (data) => {
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

    /* ---------- 3. TRADUCCIÓN DE ENTRADA REMOTA HACIA LOS JUEGOS ---------- */
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

      // Cambio rápido de personaje en Super Run
      if (data.type === 'switchHero') {
        if (window.Cinnamo?.platformerGame?.nextHero) {
          window.Cinnamo.platformerGame.nextHero();
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

      // Botón estándar (d-pad o botones de acción)
      if (data.type === 'input' || data.btn !== undefined) {
        this.handleRemoteInput(data.btn, data.pressed);
        return;
      }
    }

    handleRemoteJoystick(x, y, angle, dist) {
      // 1. Super Cinnamoroll Run (Diagonales fluidas: correr y saltar/planear)
      const plat = window.Cinnamo?.platformerGame;
      if (plat && plat.keys) {
        plat.keys.left = x < -0.26;
        plat.keys.right = x > 0.26;
        const wantsJump = y < -0.32;
        if (wantsJump && !plat.keys.jump) {
          plat.keys.jump = true;
          if (plat.jump) plat.jump();
        } else if (!wantsJump) {
          plat.keys.jump = false;
        }
      }

      // 2. Repartidor 3D (Caminar y rotar en simultáneo)
      const doom = window.Cinnamo?.doomGame;
      if (doom && doom.keys) {
        doom.keys.forward = y < -0.26;
        doom.keys.backward = y > 0.26;
        doom.keys.left = x < -0.26;
        doom.keys.right = x > 0.26;
      }

      // 3. A Volar (Vuelo 360° suave)
      const input = IN();
      if (input) {
        if (y < -0.26) input.feed({ action: 'up' });
        else if (y > 0.26) input.feed({ action: 'down' });
        else input.feed({ action: null });
      }
    }

    handleRemoteInput(btn, pressed) {
      // 1. Despachar a Super Cinnamoroll Run (platformer.js)
      const plat = window.Cinnamo?.platformerGame;
      if (plat && plat.keys) {
        if (btn === 'left') plat.keys.left = pressed;
        if (btn === 'right') plat.keys.right = pressed;
        if (btn === 'jump') {
          plat.keys.jump = pressed;
          if (pressed && plat.jump) plat.jump();
        }
      }

      // 2. Despachar a Repartidor 3D (doom.js)
      const doom = window.Cinnamo?.doomGame;
      if (doom && doom.keys) {
        if (btn === 'left') doom.keys.left = pressed;
        if (btn === 'right') doom.keys.right = pressed;
        if (btn === 'up') doom.keys.forward = pressed;
        if (btn === 'down') doom.keys.backward = pressed;
        if (btn === 'treat' && pressed) {
          if (doom.throwTreat) doom.throwTreat();
        }
        if (btn === 'jump' && pressed) {
          if (doom.throwTreat) doom.throwTreat();
        }
      }

      // 3. Despachar a A Volar (game.js)
      const input = IN();
      if (input) {
        if (btn === 'up') input.feed({ action: pressed ? 'up' : null });
        if (btn === 'down') input.feed({ action: pressed ? 'down' : null });
        if ((btn === 'jump' || btn === 'spin') && pressed) input.feed({ action: 'spin' });
      }

      // 4. Despachar evento global de teclado sintético para compatibilidad universal
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bridge.initUI());
  } else {
    bridge.initUI();
  }
})();
