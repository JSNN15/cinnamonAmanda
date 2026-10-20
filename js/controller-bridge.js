/* ============================================================
   PUENTE DE MANDOS INALÁMBRICOS & BLUETOOTH (controller-bridge.js)
   Permite:
   1. Conectar cualquier Celular como Mando Kawaii mediante Código QR / WebRTC (PeerJS)
   2. Conectar Mandos Físicos de Consola (Nintendo Switch Joy-Con, Xbox, PS4/PS5, 8BitDo)
   ============================================================ */
(function () {
  const A = () => window.Cinnamo?.audio;
  const IN = () => window.Cinnamo?.input;
  const cssEsc = (v) => (window.CSS?.escape ? CSS.escape(String(v ?? '')) : String(v ?? '').replace(/[^\w#-]/g, ''));

  class ControllerBridge {
    constructor() {
      this.roomCode = this.getOrGenerateRoomCode();
      this.roomKey = this.getOrGenerateRoomKey();
      this.peer = null;
      this.peerReconnectDelay = 1000;
      this.connections = [];
      this.broadcastChannel = null;
      this.isHost = true;
      this.connectedCount = 0;
      this.statusListeners = [];
      this.physicalGamepadActive = false;
      this.inputMode = 'touch'; // 'touch' | 'remote'
      this.lastGamepadState = { 1: {}, 2: {}, 3: {} };
      this.players = {
        1: { slot: 1, active: true, heroId: 'cinna', conn: null },
        2: { slot: 2, active: false, heroId: 'milk', conn: null },
        3: { slot: 3, active: false, heroId: 'purin', conn: null }
      };

      this.initBroadcast();
      this.ensurePeerHost();
      this.initPhysicalGamepadLoop();
      this.initInputModeCoordinator();
    }

    /* ---------- COORDINADOR INTELIGENTE TOUCH vs MANDO REMOTO + MULTI-PLAYER ---------- */
    initInputModeCoordinator() {
      const applyInitial = () => {
        document.body.classList.add('touch-input-active');
        this.updateInputModeBadge();
        const badge = document.getElementById('globalInputModeBadge');
        if (badge && !badge._boundClick) {
          badge._boundClick = true;
          badge.style.cursor = 'pointer';
          badge.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.connectedCount > 0 || this.physicalGamepadActive) {
              this.setInputMode(this.inputMode === 'remote' ? 'touch' : 'remote');
            } else {
              const btnGp = document.getElementById('globalBtnGamepad');
              if (btnGp) btnGp.click();
            }
          });
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyInitial);
      } else {
        applyInitial();
      }

      window.addEventListener('pointerdown', (e) => {
        if (!e.isTrusted) return;
        if (e.target && (e.target.closest('#gamepadModal') || e.target.closest('#globalInputModeBadge'))) return;
        if (this.inputMode !== 'touch') {
          this.setInputMode('touch');
        }
      }, { passive: true });
    }

    setInputMode(mode) {
      const normalized = mode === 'remote' ? 'remote' : 'touch';
      this.inputMode = normalized;
      if (document.body) {
        document.body.classList.toggle('remote-controller-active', normalized === 'remote');
        document.body.classList.toggle('touch-input-active', normalized === 'touch');
      }
      this.updateInputModeBadge();
    }

    updateInputModeBadge() {
      const badge = document.getElementById('globalInputModeBadge');
      const iconEl = document.getElementById('inputModeIcon');
      const textEl = document.getElementById('inputModeText');
      if (!badge || !iconEl || !textEl) return;

      const tags = ['P1🌸'];
      if (this.players[2]?.active) tags.push('P2🩵');
      if (this.players[3]?.active) tags.push('P3💛');
      const playersStr = tags.join(' ');

      if (this.inputMode === 'remote') {
        badge.className = 'input-mode-badge mode-remote';
        window.CinnaIcons?.set(iconEl, 'phone');
        textEl.textContent = `Mando TV · ${playersStr}`;
      } else {
        badge.className = 'input-mode-badge mode-touch';
        window.CinnaIcons?.set(iconEl, 'touch');
        textEl.textContent = (this.connectedCount > 0 || this.physicalGamepadActive || this.players[2]?.active || this.players[3]?.active)
          ? `Touch + 📱 ${playersStr}`
          : 'Touch Activo';
      }
    }

    getOrGenerateRoomCode(forceNew = false) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRoom = urlParams.get('room');
      if (!forceNew && urlRoom) {
        const clean = urlRoom.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        if (clean.length >= 6) {
          sessionStorage.setItem('cinna_room_code', clean);
          localStorage.setItem('cinna_last_room', clean);
          return clean;
        }
      }

      // Aislar sesiones paralelas usando sessionStorage por pestaña/dispositivo
      let code = !forceNew ? sessionStorage.getItem('cinna_room_code') : null;
      if (!code) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        code = '';
        code = this.randomCode(6, chars);
        sessionStorage.setItem('cinna_room_code', code);
      }
      localStorage.setItem('cinna_last_room', code);
      return code;
    }

    randomCode(len, chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') {
      const out = [];
      const rnd = new Uint32Array(len);
      if (window.crypto?.getRandomValues) window.crypto.getRandomValues(rnd);
      for (let i = 0; i < len; i++) {
        const r = window.crypto?.getRandomValues ? rnd[i] : Math.floor(Math.random() * 1e9);
        out.push(chars.charAt(r % chars.length));
      }
      return out.join('');
    }

    safeSession(op, key, val) {
      try {
        if (op === 'get') return sessionStorage.getItem(key);
        sessionStorage.setItem(key, val);
      } catch (_) {}
      return null;
    }

    // Clave secreta que solo viaja dentro del QR: el celular que la trae entra directo,
    // el que solo escribió el código necesita que alguien lo acepte en la TV.
    getOrGenerateRoomKey(forceNew = false) {
      let key = !forceNew ? this.safeSession('get', 'cinna_room_key') : null;
      if (!key) {
        key = this.randomCode(10);
        this.safeSession('set', 'cinna_room_key', key);
      }
      return key;
    }

    getControllerUrl() {
      const loc = window.location;
      const base = loc.origin + loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
      return `${base}controller.html?room=${this.roomCode}&k=${this.roomKey}`;
    }

    getActivePlayersSummary() {
      return {
        1: { active: true, heroId: this.players[1].heroId },
        2: { active: !!this.players[2].active, heroId: this.players[2].heroId },
        3: { active: !!this.players[3].active, heroId: this.players[3].heroId }
      };
    }

    assignSlotForConnection(conn) {
      for (const s of [1, 2, 3]) {
        if (!this.players[s].conn || !this.players[s].conn.open) {
          this.players[s].conn = conn;
          this.players[s].active = true;
          conn._playerSlot = s;
          if ((s === 2 || s === 3) && window.Cinnamo?.platformerGame?.selectHeroById) {
            window.Cinnamo.platformerGame.selectHeroById(this.players[s].heroId, s);
          }
          if (window.Cinnamo?.avatarWorldGame?.players?.[s]) {
            window.Cinnamo.avatarWorldGame.players[s].active = true;
            window.Cinnamo.avatarWorldGame.syncPlayerBadgesUI?.();
          }
          return s;
        }
      }
      conn._playerSlot = 1;
      return 1;
    }

    onStatus(fn) {
      this.statusListeners.push(fn);
      fn({ count: this.connectedCount, room: this.roomCode, gamepad: this.physicalGamepadActive, inputMode: this.inputMode, players: this.getActivePlayersSummary() });
    }

    notifyStatus() {
      this.updateInputModeBadge();
      const state = {
        count: this.connectedCount,
        room: this.roomCode,
        gamepad: this.physicalGamepadActive,
        inputMode: this.inputMode,
        players: this.getActivePlayersSummary()
      };
      this.statusListeners.forEach(fn => { try { fn(state); } catch (_) {} });
    }

    broadcastGameContext(ctx) {
      // Mientras se escribe el nombre, el celular muestra su teclado A-Z; al terminar vuelve al juego
      this.lastGameContext = ctx;
      const pn = window.Cinnamo?.playerName;
      const shown = pn?.isOpen?.() ? { screen: 'name' } : ctx;
      this.lastContext = { ...shown, playerName: pn?.get?.() || '', players: this.getActivePlayersSummary() };
      const payload = { type: 'context', ...this.lastContext };
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
        if (this.broadcastChannel) {
          try { this.broadcastChannel.close(); } catch (_) {}
        }
        if ('BroadcastChannel' in window) {
          this.broadcastChannel = new BroadcastChannel(`cinna_pad_${this.roomCode}`);
          this.broadcastChannel.onmessage = (ev) => {
            if (!ev.data) return;
            if (ev.data.type === 'hello') {
              const reqSlot = parseInt(ev.data.player, 10);
              const slot = (reqSlot >= 1 && reqSlot <= 3) ? reqSlot : 1;
              this.players[slot].active = true;
              this.connectedCount = Math.max(1, this.connectedCount);
              this.setInputMode('remote');
              this.notifyStatus();
              this.broadcastChannel.postMessage({
                type: 'welcome',
                room: this.roomCode,
                assignedSlot: slot,
                players: this.getActivePlayersSummary()
              });
              if (this.lastGameContext || this.lastContext) {
                this.broadcastGameContext(this.lastGameContext || this.lastContext);
              } else if (window.Cinnamo?.hub?.currentScreen) {
                this.broadcastGameContext({ screen: window.Cinnamo.hub.currentScreen });
              }
            } else {
              this.handleRemoteData(ev.data, null);
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

      if (this.peer && !this.peer.destroyed) {
        try { this.peer.destroy(); } catch (_) {}
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
          this.peerReconnectDelay = 1000;
          this.notifyStatus();
        });

        this.peer.on('connection', (conn) => {
          conn._authorized = false;
          conn._askedTv = false;

          conn.on('data', (data) => {
            if (!data) return;
            if (data.type === 'ping') {
              try { conn.send({ type: 'pong' }); } catch (_) {}
              return;
            }
            if (!conn._authorized) {
              // Nada de lo que mande un celular se obedece hasta que esté autorizado
              if (data.type !== 'hello') return;
              const modalOpen = !document.getElementById('gamepadModal')?.classList.contains('hidden');
              const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);
              if ((data.key && data.key === this.roomKey) || modalOpen || isLocalDev) {
                this.authorizeConnection(conn, data.player);
              } else if (!conn._askedTv) {
                conn._askedTv = true;
                this.askTvToAccept(conn, data.player);
              }
              return;
            }
            if (data.type === 'hello') {
              if (data.player >= 1 && data.player <= 3) {
                conn._playerSlot = parseInt(data.player, 10);
                this.players[conn._playerSlot].active = true;
              }
              this.setInputMode('remote');
              this.sendWelcome(conn);
              return;
            }
            this.handleRemoteData(data, conn);
          });

          conn.on('close', () => this.handleConnectionClosed(conn));
          conn.on('error', () => this.handleConnectionClosed(conn));
        });

        this.peer.on('disconnected', () => {
          // La tablet se durmió o se cortó el Wi-Fi: volver a registrarse en el servidor
          if (!this.peer || this.peer.destroyed) return;
          clearTimeout(this.peerReconnectTimer);
          this.peerReconnectTimer = setTimeout(() => {
            try { this.peer.reconnect(); } catch (_) { this.initPeerHost(); }
          }, this.peerReconnectDelay);
          this.peerReconnectDelay = Math.min(this.peerReconnectDelay * 2, 30000);
        });

        this.peer.on('error', (err) => {
          if (err.type === 'unavailable-id') {
            this.roomCode = this.getOrGenerateRoomCode(true);
            this.initBroadcast();
            const roomDisplay = document.getElementById('gamepadRoomDisplay');
            if (roomDisplay) roomDisplay.textContent = this.roomCode;
            setTimeout(() => this.initPeerHost(), 800);
          } else if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(err.type)) {
            clearTimeout(this.peerReconnectTimer);
            this.peerReconnectTimer = setTimeout(() => this.initPeerHost(), this.peerReconnectDelay);
            this.peerReconnectDelay = Math.min(this.peerReconnectDelay * 2, 30000);
          } else {
            console.warn('Peer error:', err);
          }
        });
      } catch (e) {
        console.warn('Error inicializando PeerJS:', e);
      }
    }

    ensurePeerHost() {
      this.safeSession('set', 'cinna_peer_on', '1');
      if (!this.peer || this.peer.destroyed) this.initPeerHost();
    }

    sendWelcome(conn) {
      try {
        conn.send({
          type: 'welcome',
          room: this.roomCode,
          assignedSlot: conn._playerSlot || 1,
          players: this.getActivePlayersSummary()
        });
        const ctx = this.lastContext || { screen: window.Cinnamo?.hub?.currentScreen || 'hub' };
        conn.send({ type: 'context', ...ctx, players: this.getActivePlayersSummary() });
      } catch (_) {}
    }

    authorizeConnection(conn, requestedPlayer) {
      if (conn._authorized || !conn.open) return;
      conn._authorized = true;
      let slot = this.assignSlotForConnection(conn);
      const req = parseInt(requestedPlayer, 10);
      if (req >= 1 && req <= 3) {
        slot = req;
        conn._playerSlot = req;
        this.players[req].active = true;
      }
      this.connections.push(conn);
      this.connectedCount = this.connections.length;
      this.setInputMode('remote');
      this.notifyStatus();
      const slotBadges = { 1: 'P1 🌸', 2: 'P2 🩵', 3: 'P3 💛' };
      this.showToast(`📱 ¡Mando ${slotBadges[slot]} conectado! ✨`);
      if (A()) {
        A().unlock();
        A().celebrate();
      }
      this.sendWelcome(conn);
    }

    // Celular que escribió el código a mano (sin la clave del QR): se pregunta en la TV
    askTvToAccept(conn, requestedPlayer) {
      const box = document.createElement('div');
      box.className = 'cinna-accept-controller';
      box.setAttribute('role', 'alertdialog');
      box.innerHTML = `
        <div class="cinna-accept-card">
          <div class="cinna-accept-title">📱 Un celular quiere ser mando</div>
          <div class="cinna-accept-desc">¿Es de tu familia? Pídele a un adulto que decida.</div>
          <div class="cinna-accept-actions">
            <button type="button" class="cinna-accept-yes">✅ Aceptar</button>
            <button type="button" class="cinna-accept-no">✖ No</button>
          </div>
        </div>`;
      const done = (ok) => {
        clearTimeout(timer);
        window.removeEventListener('keydown', onKey);
        box.remove();
        if (ok) {
          this.authorizeConnection(conn, requestedPlayer);
        } else {
          try { conn.send({ type: 'rejected' }); } catch (_) {}
          setTimeout(() => { try { conn.close(); } catch (_) {} }, 300);
        }
      };
      const onKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(true); }
        else if (e.key === 'Escape') { e.preventDefault(); done(false); }
      };
      window.addEventListener('keydown', onKey);
      const timer = setTimeout(() => done(false), 60000);
      const btnYes = box.querySelector('.cinna-accept-yes');
      btnYes.addEventListener('click', (e) => { e.stopPropagation(); done(true); });
      box.querySelector('.cinna-accept-no').addEventListener('click', (e) => { e.stopPropagation(); done(false); });
      conn.on('close', () => { clearTimeout(timer); window.removeEventListener('keydown', onKey); box.remove(); });
      document.body.appendChild(box);
      setTimeout(() => { try { btnYes.focus(); } catch (_) {} }, 50);
      if (A()) { A().unlock(); A().bubblePop?.(2); }
    }

    // Al desconectarse un celular se sueltan todos sus botones para que nadie camine solo
    handleConnectionClosed(conn) {
      if (conn._closedHandled) return;
      conn._closedHandled = true;
      const wasAuthorized = conn._authorized;
      this.connections = this.connections.filter(c => c !== conn);
      this.connectedCount = this.connections.length;
      if (wasAuthorized) {
        const slot = conn._playerSlot || 1;
        this.releasePlayerInputs(slot);
        for (const s of [1, 2, 3]) {
          if (this.players[s].conn === conn) this.players[s].conn = null;
        }
        const stillUsed = this.connections.some(c => (c._playerSlot || 1) === slot);
        if (!stillUsed && (slot === 2 || slot === 3)) {
          this.players[slot].active = false;
          const plat = window.Cinnamo?.platformerGame;
          if (plat?.coPlayers?.[slot]) plat.coPlayers[slot].active = false;
          const aw = window.Cinnamo?.avatarWorldGame;
          if (aw?.players?.[slot]) {
            aw.players[slot].active = false;
            aw.syncPlayerBadgesUI?.();
          }
        }
        if (this.connectedCount === 0 && !this.physicalGamepadActive) this.setInputMode('touch');
      }
      this.notifyStatus();
    }

    releasePlayerInputs(slot) {
      try {
        this.handleRemoteJoystick(0, 0, 0, 0, slot);
        ['left', 'right', 'up', 'down', 'jump'].forEach(btn => this.handleRemoteInput(btn, false, slot));
      } catch (_) {}
      if (slot === 1) {
        const plat = window.Cinnamo?.platformerGame;
        if (plat?.keys) { plat.keys.left = plat.keys.right = plat.keys.jump = false; plat._jumpBtnHeld = false; }
        const doom = window.Cinnamo?.doomGame;
        if (doom?.keys) { doom.keys.left = doom.keys.right = doom.keys.forward = doom.keys.backward = false; }
        const input = IN();
        if (input) {
          input.setAxis?.(0);
          input.setKey?.('up', false);
          input.setKey?.('down', false);
        }
      }
    }

    /* ---------- 3. TRADUCCIÓN DE ENTRADA REMOTA HACIA TODOS LOS JUEGOS ---------- */
    handleRemoteData(data, conn = null) {
      if (!data) return;
      if (this.inputMode !== 'remote') {
        this.setInputMode('remote');
      }
      const playerSlot = Math.max(1, Math.min(3, parseInt(data.player || conn?._playerSlot || 1, 10)));

      // Selección / activación de Jugador (P1, P2, P3) para multijugador hasta 3 players
      if (data.type === 'setPlayerSlot') {
        const slot = Math.max(1, Math.min(3, parseInt(data.slot || playerSlot, 10)));
        if (conn) conn._playerSlot = slot;
        this.players[slot].active = data.active !== false;
        if (data.heroId) this.players[slot].heroId = data.heroId;
        if (slot === 2 || slot === 3) {
          const plat = window.Cinnamo?.platformerGame;
          if (plat) {
            if (this.players[slot].active && plat.selectHeroById) {
              plat.selectHeroById(this.players[slot].heroId, slot);
            } else if (!this.players[slot].active && plat.coPlayers?.[slot]) {
              plat.coPlayers[slot].active = false;
            }
          }
          const fl = window.Cinnamo?.flightGame;
          if (fl && fl.coPlayers?.[slot]) {
            fl.coPlayers[slot].active = this.players[slot].active;
            if (this.players[slot].heroId && fl.selectHeroById) {
              fl.selectHeroById(this.players[slot].heroId, slot);
            }
          }
        }
        const aw = window.Cinnamo?.avatarWorldGame;
        if (aw && aw.players?.[slot]) {
          aw.players[slot].active = this.players[slot].active;
          if (data.heroId && aw.applyCustomization) {
            aw.applyCustomization(slot, 'base', data.heroId);
          }
          aw.syncPlayerBadgesUI?.();
        }
        const badge = slot === 1 ? 'P1 🌸' : (slot === 2 ? 'P2 🩵' : 'P3 💛');
        this.showToast(`🎮 ¡${badge} listo en la partida!`);
        this.notifyStatus();
        return;
      }

      // Movimiento con Palanca Táctil Analógica (diagonales fluidas por jugador P1/P2/P3)
      if (data.type === 'joystick') {
        this.handleRemoteJoystick(data.x, data.y, data.angle, data.dist, playerSlot);
        return;
      }

      // Selección directa de Personaje desde el Celular (Sin tocar el PC)
      if (data.type === 'selectHero') {
        const heroId = data.heroId || 'cinna';
        this.players[playerSlot].heroId = heroId;
        this.players[playerSlot].active = true;
        const screen = window.Cinnamo?.hub?.currentScreen;
        if (screen === 'avatar' && window.Cinnamo?.avatarWorldGame?.applyCustomization) {
          window.Cinnamo.avatarWorldGame.applyCustomization(playerSlot, 'base', heroId);
        } else if (screen === 'flight' && window.Cinnamo?.flightGame?.selectHeroById) {
          window.Cinnamo.flightGame.selectHeroById(heroId, playerSlot);
        } else if (screen === 'doom' && window.Cinnamo?.doomGame?.selectHeroById) {
          window.Cinnamo.doomGame.selectHeroById(heroId);
        } else if (screen === 'puzzle' && window.Cinnamo?.puzzleGame?.selectCharacterById) {
          window.Cinnamo.puzzleGame.selectCharacterById(heroId);
        } else if (window.Cinnamo?.platformerGame?.selectHeroById) {
          window.Cinnamo.platformerGame.selectHeroById(heroId, playerSlot);
        }
        this.notifyStatus();
        return;
      }

      // Cambio cíclico rápido de personaje en Super Run, Repartidor 3D o Avatar World
      if (data.type === 'switchHero') {
        const screen = window.Cinnamo?.hub?.currentScreen;
        if (screen === 'avatar' && window.Cinnamo?.avatarWorldGame?.cycleCustomForPlayer) {
          window.Cinnamo.avatarWorldGame.cycleCustomForPlayer(playerSlot, 'base');
        } else if (screen === 'platformer' && window.Cinnamo?.platformerGame) {
          if (playerSlot === 2 || playerSlot === 3) {
            const heroOrder = ['cinna', 'milk', 'purin', 'chiffon', 'mocha'];
            const curr = this.players[playerSlot].heroId || 'milk';
            const nextId = heroOrder[(heroOrder.indexOf(curr) + 1) % heroOrder.length];
            this.players[playerSlot].heroId = nextId;
            window.Cinnamo.platformerGame.selectHeroById(nextId, playerSlot);
          } else if (window.Cinnamo.platformerGame.nextHero) {
            window.Cinnamo.platformerGame.nextHero();
          }
        } else if (screen === 'doom' && window.Cinnamo?.doomGame?.nextHero) {
          window.Cinnamo.doomGame.nextHero();
        }
        return;
      }

      // Acciones remotas de Cinnamoroll World: Casa de Sueños (Avatar World)
      if (data.type === 'avatarRoom') {
        window.Cinnamo?.avatarWorldGame?.selectRoom?.(parseInt(data.roomIdx, 10) || 0);
        return;
      }
      if (data.type === 'avatarRoomStep') {
        window.Cinnamo?.avatarWorldGame?.changeRoom?.(parseInt(data.dir, 10) < 0 ? -1 : 1);
        return;
      }
      if (data.type === 'avatarCustom') {
        window.Cinnamo?.avatarWorldGame?.cycleCustomForPlayer?.(playerSlot, data.category || 'outfit');
        return;
      }
      if (data.type === 'avatarDecor') {
        const decorTypes = ['cake_stand', 'plush_bunny', 'plant_pot', 'star_cushion', 'tea_set', 'fairy_lamp', 'gift_box', 'balloon_bunch'];
        const decorType = data.decorType === 'random' || !data.decorType ? decorTypes[Math.floor(Math.random() * decorTypes.length)] : data.decorType;
        window.Cinnamo?.avatarWorldGame?.spawnDecorItem?.(decorType, playerSlot);
        return;
      }
      if (data.type === 'avatarLight') {
        window.Cinnamo?.avatarWorldGame?.cycleLighting?.();
        return;
      }

      // Selección directa de Ciudad en Super Cinnamoroll Run
      if (data.type === 'selectCity') {
        if (window.Cinnamo?.platformerGame?.selectCityByIndex) {
          window.Cinnamo.platformerGame.selectCityByIndex(parseInt(data.cityIdx, 10));
        }
        return;
      }

      // Respuesta y Configuración de Matemática desde el Celular
      if (data.type === 'mathAnswer') {
        if (window.Cinnamo?.mathGame?.submitAnswer) {
          window.Cinnamo.mathGame.submitAnswer(data.val);
        }
        return;
      }
      if (data.type === 'mathConfig') {
        const mg = window.Cinnamo?.mathGame;
        if (mg) {
          if (data.tier && mg.setTier) mg.setTier(data.tier);
          if (data.mode && mg.setMode) mg.setMode(data.mode);
          if (data.countHelp && mg.countNextTreat) mg.countNextTreat();
        }
        return;
      }

      // Volteo de carta y dificultad en Memorice desde el celular
      if (data.type === 'flipCard') {
        if (window.Cinnamo?.memoryGame?.flipCard) {
          window.Cinnamo.memoryGame.flipCard(data.index);
        } else if (window.Cinnamo?.memoryGame?.handleCardClick) {
          window.Cinnamo.memoryGame.handleCardClick(data.index);
        }
        return;
      }
      if (data.type === 'memoryNewGame' || data.type === 'memoryDifficulty') {
        if (window.Cinnamo?.memoryGame?.startNewGame) {
          const cards = parseInt(data.cards, 10) || window.Cinnamo.memoryGame.difficulty || 8;
          window.Cinnamo.memoryGame.startNewGame(cards);
        }
        return;
      }

      // Acciones completas de Rompecabezas
      if (data.type === 'puzzlePlaceNext') {
        if (window.Cinnamo?.puzzleGame?.placeNextPiece) {
          window.Cinnamo.puzzleGame.placeNextPiece();
        }
        return;
      }
      if (data.type === 'puzzleSelectChar') {
        if (window.Cinnamo?.puzzleGame?.selectCharacterById) {
          window.Cinnamo.puzzleGame.selectCharacterById(data.charId);
        }
        return;
      }
      if (data.type === 'puzzleDifficulty') {
        if (window.Cinnamo?.puzzleGame?.setDifficultyPieces) {
          window.Cinnamo.puzzleGame.setDifficultyPieces(data.pieces);
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

      // Acciones completas de Taller de Dibujo + Touchpad Remoto
      if (data.type === 'colorPick') {
        const chip = document.querySelector(`.swatch-btn[data-color="${cssEsc(data.color)}"]`) || 
                     document.querySelector(`.palette-chip[data-color="${cssEsc(data.color)}"]`);
        if (chip) chip.click();
        else if (window.Cinnamo?.coloringGame && /^#[0-9a-f]{3,8}$/i.test(String(data.color))) window.Cinnamo.coloringGame.selectedColor = data.color;
        return;
      }
      if (data.type === 'colorTool') {
        const tBtn = document.querySelector(`.tool-btn[data-tool="${cssEsc(data.tool)}"]`);
        if (tBtn) tBtn.click();
        return;
      }
      if (data.type === 'colorSheet') {
        if (window.Cinnamo?.coloringGame?.selectSheetById) {
          window.Cinnamo.coloringGame.selectSheetById(data.sheetId);
        }
        return;
      }
      if (data.type === 'colorSize') {
        if (window.Cinnamo?.coloringGame?.setBrushSize) {
          window.Cinnamo.coloringGame.setBrushSize(data.size);
        }
        return;
      }
      if (data.type === 'colorStamp') {
        if (window.Cinnamo?.coloringGame?.setStamp) {
          window.Cinnamo.coloringGame.setStamp(data.stamp);
        }
        return;
      }
      if (data.type === 'colorSave') {
        if (window.Cinnamo?.coloringGame?.saveArtRemotely) {
          window.Cinnamo.coloringGame.saveArtRemotely();
        }
        return;
      }
      if (data.type === 'colorPad') {
        if (window.Cinnamo?.coloringGame?.remotePad) {
          window.Cinnamo.coloringGame.remotePad(data.action, data.x, data.y);
        }
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

      // Acciones completas de Palabras Mágicas + Teclado A-Z + Touchpad de Trazo
      if (data.type === 'writingMode') {
        if (window.Cinnamo?.writingGame?.setModeRemote) {
          window.Cinnamo.writingGame.setModeRemote(data.mode);
        }
        return;
      }
      if (data.type === 'writingTier') {
        if (window.Cinnamo?.writingGame?.setTierRemote) {
          window.Cinnamo.writingGame.setTierRemote(data.tier);
        }
        return;
      }
      if (data.type === 'nameKey') {
        window.Cinnamo?.playerName?.pressKey?.(data.char);
        return;
      }
      if (data.type === 'writingKey') {
        if (window.Cinnamo?.writingGame?.pressLetterKey) {
          window.Cinnamo.writingGame.pressLetterKey(data.char);
        }
        return;
      }
      if (data.type === 'writingAutoStep') {
        if (window.Cinnamo?.writingGame?.autoStepRemote) {
          window.Cinnamo.writingGame.autoStepRemote();
        }
        return;
      }
      if (data.type === 'writingPad') {
        if (window.Cinnamo?.writingGame?.remotePad) {
          window.Cinnamo.writingGame.remotePad(data.action, data.x, data.y);
        }
        return;
      }
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

      // Navegación remota (Hub / Cambiar juego / Música)
      if (data.type === 'nav') {
        if (data.screen === 'hub') {
          const btnH = document.getElementById('globalBtnHome');
          if (btnH) btnH.click();
        } else if (window.Cinnamo?.hub?.launchGame && document.querySelector(`[data-game="${cssEsc(data.screen)}"]`)) {
          window.Cinnamo.hub.launchGame(data.screen);
        }
        return;
      }
      if (data.type === 'toggleMusic') {
        const btnM = document.getElementById('globalBtnMusic');
        if (btnM) btnM.click();
        return;
      }
      if (data.type === 'nextTrack') {
        const btnT = document.getElementById('globalBtnTrack');
        if (btnT) btnT.click();
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

      // Botón estándar (d-pad o botones de acción por jugador P1/P2/P3)
      if (data.type === 'input' || data.btn !== undefined) {
        this.handleRemoteInput(data.btn, data.pressed, playerSlot);
        return;
      }
    }

    handleRemoteJoystick(x, y, angle, dist, playerSlot = 1) {
      const screen = window.Cinnamo?.hub?.currentScreen || 'platformer';

      // 1. Super Cinnamoroll Run (Soporta P1, P2 y P3 simultáneos en pantalla)
      if (screen === 'platformer') {
        const plat = window.Cinnamo?.platformerGame;
        if (!plat) return;
        if (playerSlot === 2 || playerSlot === 3) {
          if (plat.setCoPlayerJoystick) plat.setCoPlayerJoystick(playerSlot, x, y);
          return;
        }
        if (plat.keys) {
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

      // 3. A Volar (Vuelo analógico suave: soporta P1, P2 y P3 simultáneos en pantalla)
      if (screen === 'flight') {
        if (playerSlot === 2 || playerSlot === 3) {
          window.Cinnamo?.flightGame?.setCoPlayerJoystick?.(playerSlot, x, y);
          return;
        }
        const input = IN();
        if (input) {
          if (Math.abs(y) > 0.12) {
            input.setAxis(y);
            if (input.targets) {
              delete input.targets.voice;
              delete input.targets.pointer;
            }
          } else {
            input.setAxis(0);
          }
        }
        return;
      }

      // 4. Cinnamoroll World: Casa de Sueños (Avatar World — P1, P2 y P3 simultáneos)
      if (screen === 'avatar') {
        window.Cinnamo?.avatarWorldGame?.setPlayerJoystick?.(playerSlot, x, y);
        return;
      }
    }

    handleRemoteInput(btn, pressed, playerSlot = 1) {
      const screen = window.Cinnamo?.hub?.currentScreen || 'platformer';

      // Pantalla "¿Cómo te llamas?": flechas mueven, A elige letra, B borra
      if (window.Cinnamo?.playerName?.isOpen?.()) {
        window.Cinnamo.playerName.handlePad(btn, pressed);
        return;
      }

      // Si hay un modal de victoria abierto en cualquier juego, permitir avanzar con Saltar/Dulce
      if (pressed && (btn === 'jump' || btn === 'treat')) {
        const modalBtnIds = [
          'btnPlatNextCity',
          'btnDoomReplay',
          'btnNextMathParty',
          'btnMemoryVictoryReplay',
          'btnNextPuzzleModal',
          'btnNextWordModal',
          'btnNextSentenceModal',
          'btnNextTraceLetter'
        ];
        for (const id of modalBtnIds) {
          const el = document.getElementById(id);
          if (el && !el.closest('.hidden') && el.offsetParent !== null) {
            el.click();
            return;
          }
        }
      }

      // 0. Despachar a Cinnamoroll World: Casa de Sueños (avatar-world.js) — Soporta P1, P2 y P3
      if (screen === 'avatar') {
        window.Cinnamo?.avatarWorldGame?.setPlayerInput?.(playerSlot, btn, pressed);
        return;
      }

      // 1. Despachar a Super Cinnamoroll Run (platformer.js) — Soporta P1, P2 y P3
      if (screen === 'platformer') {
        const plat = window.Cinnamo?.platformerGame;
        if (!plat) return;
        if (playerSlot === 2 || playerSlot === 3) {
          if (plat.setCoPlayerInput) plat.setCoPlayerInput(playerSlot, btn, pressed);
          if (btn === 'treat' && pressed && plat.treat) plat.treat();
          return;
        }
        if (plat.keys) {
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

      // 3. Despachar a A Volar (game.js: subir/bajar continuo, pirueta, saludo; soporta P1, P2 y P3)
      if (screen === 'flight') {
        if (playerSlot === 2 || playerSlot === 3) {
          window.Cinnamo?.flightGame?.setCoPlayerInput?.(playerSlot, btn, pressed);
          return;
        }
        const input = IN();
        if (input) {
          if (btn === 'up') {
            input.setKey('up', pressed);
            if (pressed) input.feed({ action: 'up' });
          }
          if (btn === 'down') {
            input.setKey('down', pressed);
            if (pressed) input.feed({ action: 'down' });
          }
          if ((btn === 'jump' || btn === 'spin') && pressed) input.feed({ action: 'spin' });
          if ((btn === 'treat' || btn === 'hello') && pressed) input.feed({ action: 'hello' });
          if (pressed && (window.Cinnamo?.game?.mode !== 'play' || window.Cinnamo?.flightGame?.state?.mode !== 'play')) {
            if (window.Cinnamo?.startFlightGame) window.Cinnamo.startFlightGame();
            else input.feed({ action: 'start' });
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

    /* ---------- 4. SOPORTE DE HASTA 3 MANDOS FÍSICOS (Gamepad API) ---------- */
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
        let slotIdx = 1;
        for (let i = 0; i < gamepads.length && slotIdx <= 3; i++) {
          const gp = gamepads[i];
          if (!gp) continue;
          anyConnected = true;
          const slot = slotIdx++;

          const axisX = gp.axes[0] || 0;
          const axisY = gp.axes[1] || 0;
          const deadZone = 0.35;

          const btnA = gp.buttons[0]?.pressed || false;
          const btnB = gp.buttons[1]?.pressed || false;
          const dUp = gp.buttons[12]?.pressed || axisY < -deadZone;
          const dDown = gp.buttons[13]?.pressed || axisY > deadZone;
          const dLeft = gp.buttons[14]?.pressed || axisX < -deadZone;
          const dRight = gp.buttons[15]?.pressed || axisX > deadZone;

          const current = { left: dLeft, right: dRight, up: dUp, down: dDown, jump: btnA, treat: btnB };
          const prev = this.lastGamepadState[slot] || {};

          for (const k in current) {
            if (current[k] !== prev[k]) {
              this.handleRemoteInput(k, current[k], slot);
            }
          }
          this.lastGamepadState[slot] = current;
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
        this.ensurePeerHost();
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        if (roomDisplay) roomDisplay.textContent = this.roomCode;

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
          statusPill.textContent = `🟢 ¡${st.count} Mando(s) Celular Conectado(s)! (Hasta 3 Players) ✨`;
        } else if (st.gamepad) {
          statusPill.className = 'gamepad-status-pill connected';
          statusPill.textContent = '🎮 ¡Mando físico Bluetooth conectado!';
        } else {
          statusPill.className = 'gamepad-status-pill';
          statusPill.textContent = '🟡 Esperando que los celulares se conecten (1 a 3 Jugadores)...';
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
