/* ============================================================================
   PASAPORTE MÁGICO DE AMANDA & MODO COOPERATIVO ASIMÉTRICO (TV + CELULAR) v25
   1. Álbum Persistente de Stickers y Estrellas en localStorage (cinnamo_passport_v1)
   2. Poderes Cooperativos en Tiempo Real desde el Mando Móvil:
      - 🌟 Lluvia de Estrellas (coopStarRain)
      - 🛡️ Escudo de Algodón de Azúcar (coopShield)
      - 💖 Porra de Ánimo en Vivo (coopCheer)
   ============================================================================ */
(function () {
  const STORAGE_KEY = 'cinnamo_passport_v1';

  const STICKERS_CATALOG = [
    {
      id: 'welcome_amanda',
      get name() { return `¡Hola, ${window.cinnaName ? cinnaName() : 'Peque'}!`; },
      game: 'hub',
      icon: '👑',
      img: 'assets/cinnamoroll_fly.png',
      desc: '¡Pase oficial de Cinnamoroll Land!',
      starsReq: 0
    },
    {
      id: 'sky_pilot',
      name: 'Piloto de las Nubes',
      game: 'flight',
      icon: '🛫',
      img: 'assets/puzzle_cinnamoroll.png',
      desc: 'Vuela entre nubes de algodón y atrapa estrellas.',
      starsReq: 5
    },
    {
      id: 'master_baker',
      name: 'Pastelería Mágica',
      game: 'math',
      icon: '🧁',
      img: 'assets/milk_teddy.png',
      desc: 'Hornea y cuenta pastelitos junto a Milk.',
      starsReq: 10
    },
    {
      id: 'sanrio_artist',
      name: 'Artista del Arcoíris',
      game: 'coloring',
      icon: '🎨',
      img: 'assets/mocha_hq.png',
      desc: 'Pinta láminas mágicas con colores pastel.',
      starsReq: 15
    },
    {
      id: 'memory_queen',
      name: 'Memoria de Estrella',
      game: 'memory',
      icon: '🃏',
      img: 'assets/pompompurin_hq.png',
      desc: 'Encuentra las parejas de todos sus amigos.',
      starsReq: 20
    },
    {
      id: 'world_runner',
      name: 'Vuelta al Mundo',
      game: 'platformer',
      icon: '🏃',
      img: 'assets/chiffon.png',
      desc: 'Corre y salta por Concepción, Santiago, Río y China.',
      starsReq: 30
    },
    {
      id: 'castle_angel',
      name: 'Reparto Dulce 3D',
      game: 'doom',
      icon: '🏰',
      img: 'assets/milk_sitting.png',
      desc: 'Comparte rollitos de canela en el Pabellón 3D.',
      starsReq: 40
    },
    {
      id: 'magic_writer',
      name: 'Pluma de Sueños',
      game: 'writing',
      icon: '✍️',
      img: 'assets/puzzle_mocha.png',
      desc: 'Traza letras y arma palabras con amor.',
      starsReq: 50
    },
    {
      id: 'puzzle_genius',
      name: 'Mente de los Puzzles',
      game: 'puzzle',
      icon: '🧩',
      img: 'assets/puzzle_purin.png',
      desc: 'Encaja cada pieza mágica en su lugar.',
      starsReq: 65
    },
    {
      id: 'coop_superstar',
      name: 'Súper Equipo Familiar',
      game: 'coop',
      icon: '💖',
      img: 'assets/puzzle_chiffon.png',
      desc: 'Juega en equipo con el Mando Mágico Cooperativo.',
      starsReq: 80
    }
  ];

  class AmandaPassportAndCoop {
    constructor() {
      this.state = this.loadState();
      this.shieldUntil = 0;
      this.shieldRaf = null;
      this.injectStyles();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }

    loadState() {
      const fallback = {
        stars: 5,
        unlocked: ['welcome_amanda', 'sky_pilot'],
        gamesPlayed: {},
        coopUses: 0
      };
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return {
          stars: typeof parsed.stars === 'number' ? parsed.stars : 5,
          unlocked: Array.isArray(parsed.unlocked) && parsed.unlocked.length ? parsed.unlocked : ['welcome_amanda', 'sky_pilot'],
          gamesPlayed: parsed.gamesPlayed || {},
          coopUses: parsed.coopUses || 0
        };
      } catch (_) {
        return fallback;
      }
    }

    saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (_) {}
      this.updateTopBarBadge();
    }

    init() {
      this.createPassportModal();
      this.createCoopOverlay();
      this.updateTopBarBadge();
    }

    injectStyles() {
      if (document.getElementById('cinnaPassportStyles')) return;
      const style = document.createElement('style');
      style.id = 'cinnaPassportStyles';
      style.textContent = `
        .passport-btn {
          background: linear-gradient(135deg, #fef08a 0%, #f472b6 100%) !important;
          color: #5c3d2e !important;
          border: 2px solid #ffffff !important;
          box-shadow: 0 3px 10px rgba(244, 114, 182, 0.35) !important;
        }
        .passport-modal-card {
          max-width: 680px !important;
          width: 94vw !important;
          max-height: 88vh !important;
          overflow-y: auto !important;
          background: linear-gradient(180deg, #fffdf9 0%, #fdf2f8 100%) !important;
          border: 4px solid #f9a8d4 !important;
          border-radius: 28px !important;
          padding: 20px 22px !important;
        }
        .passport-summary-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: linear-gradient(90deg, #e0f2fe 0%, #fce7f3 100%);
          border: 2px solid #bae6fd;
          border-radius: 20px;
          padding: 10px 16px;
          margin: 10px 0 16px;
          flex-wrap: wrap;
        }
        .passport-stat-pill {
          font-size: 16px;
          font-weight: 800;
          color: #0369a1;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .stickers-album-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(122px, 1fr));
          gap: 12px;
          margin-top: 8px;
        }
        .sticker-card {
          background: #ffffff;
          border: 3px solid #f9a8d4;
          border-radius: 20px;
          padding: 10px 8px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
          position: relative;
          box-shadow: 0 5px 12px rgba(236, 72, 153, 0.12);
          user-select: none;
        }
        .sticker-card.unlocked {
          background: linear-gradient(145deg, #ffffff 0%, #fef9c3 55%, #fce7f3 100%);
          border-color: #facc15;
        }
        .sticker-card.unlocked:hover, .sticker-card.unlocked:active {
          transform: scale(1.07) rotate(-2deg);
          box-shadow: 0 8px 18px rgba(250, 204, 21, 0.38);
        }
        .sticker-card.locked {
          opacity: 0.58;
          filter: grayscale(0.85);
          border-style: dashed;
          border-color: #cbd5e1;
        }
        .sticker-thumb-wrap {
          width: 68px;
          height: 68px;
          margin: 0 auto 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.06);
        }
        .sticker-thumb-wrap img {
          width: 58px;
          height: 58px;
          object-fit: contain;
        }
        .sticker-badge-ico {
          position: absolute;
          bottom: -4px;
          right: -4px;
          font-size: 20px;
          background: #fff;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }
        .sticker-name {
          font-size: 13px;
          font-weight: 800;
          color: #5c3d2e;
          line-height: 1.15;
          margin-bottom: 3px;
        }
        .sticker-req {
          font-size: 11px;
          font-weight: 700;
          color: #db2777;
        }
        /* Overlay Cooperativo Asimétrico */
        #coopStageOverlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9998;
          overflow: hidden;
        }
        .coop-falling-star {
          position: fixed;
          top: -40px;
          font-size: 32px;
          pointer-events: none;
          z-index: 9999;
          animation: coopStarFall 1.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          filter: drop-shadow(0 4px 8px rgba(250, 204, 21, 0.65));
        }
        @keyframes coopStarFall {
          0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(92vh) scale(1.25) rotate(360deg); opacity: 0; }
        }
        .coop-shield-border {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9990;
          border: 8px solid rgba(244, 114, 182, 0.75);
          box-shadow: inset 0 0 45px rgba(56, 189, 248, 0.65), inset 0 0 85px rgba(244, 114, 182, 0.45);
          border-radius: 18px;
          opacity: 0;
          transition: opacity 0.35s ease;
          animation: coopShieldPulse 1.4s infinite alternate;
        }
        .coop-shield-border.active {
          opacity: 1;
        }
        @keyframes coopShieldPulse {
          0% { border-color: rgba(244, 114, 182, 0.8); box-shadow: inset 0 0 38px rgba(56, 189, 248, 0.6); }
          100% { border-color: rgba(250, 204, 21, 0.9); box-shadow: inset 0 0 65px rgba(244, 114, 182, 0.75); }
        }
        .coop-banner-toast {
          position: fixed;
          top: 68px;
          left: 50%;
          transform: translateX(-50%) translateY(-30px) scale(0.9);
          background: linear-gradient(135deg, #fffbeb 0%, #fce7f3 100%);
          border: 3px solid #f472b6;
          color: #5c3d2e;
          font-weight: 800;
          font-size: 18px;
          padding: 10px 24px;
          border-radius: 999px;
          box-shadow: 0 10px 25px rgba(236, 72, 153, 0.32);
          z-index: 10000;
          opacity: 0;
          pointer-events: none;
          transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-align: center;
          white-space: nowrap;
        }
        .coop-banner-toast.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }
      `;
      document.head.appendChild(style);
    }

    createPassportModal() {
      if (document.getElementById('passportModal')) return;
      const modal = document.createElement('div');
      modal.id = 'passportModal';
      modal.className = 'cinna-modal-overlay hidden';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="cinna-modal-card passport-modal-card">
          <button id="btnClosePassportModal" class="modal-close-btn" aria-label="Cerrar">✕</button>
          <div class="modal-header">
            <span class="modal-icon">🏅</span>
            <h2>Pasaporte Mágico de ${cinnaName()}</h2>
          </div>
          <p class="modal-desc" style="margin-bottom:6px;">
            ¡Colecciona estrellas jugando o en modo Cooperativo con tu celular para desbloquear todos los Stickers brillantes!
          </p>
          <div class="passport-summary-bar">
            <div class="passport-stat-pill">⭐ Estrellas Mágicas: <strong id="passportStarCount">0</strong></div>
            <div class="passport-stat-pill">🏅 Stickers: <strong id="passportStickerCount">0 / 10</strong></div>
          </div>
          <div class="stickers-album-grid" id="passportStickersGrid"></div>
        </div>
      `;
      document.body.appendChild(modal);

      const btnPassport = document.getElementById('globalBtnPassport');
      const btnClose = document.getElementById('btnClosePassportModal');
      if (btnPassport) {
        btnPassport.addEventListener('click', () => this.openPassport());
      }
      if (btnClose) {
        btnClose.addEventListener('click', () => this.closePassport());
      }
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closePassport();
      });
    }

    createCoopOverlay() {
      if (document.getElementById('coopStageOverlay')) return;
      const ov = document.createElement('div');
      ov.id = 'coopStageOverlay';
      ov.innerHTML = `
        <div id="coopShieldBorder" class="coop-shield-border"></div>
        <div id="coopBannerToast" class="coop-banner-toast">💖 ¡Ayuda Mágica Cooperativa! ✨</div>
      `;
      document.body.appendChild(ov);
    }

    updateTopBarBadge() {
      const badgeEl = document.getElementById('passportBadgeText');
      if (badgeEl) {
        badgeEl.textContent = `${this.state.unlocked.length}/${STICKERS_CATALOG.length}`;
      }
    }

    addStars(amount = 1, gameKey = null) {
      this.state.stars = Math.max(0, (this.state.stars || 0) + amount);
      if (gameKey) {
        this.state.gamesPlayed[gameKey] = (this.state.gamesPlayed[gameKey] || 0) + 1;
      }

      let newlyUnlocked = null;
      for (const st of STICKERS_CATALOG) {
        if (!this.state.unlocked.includes(st.id)) {
          if (this.state.stars >= st.starsReq || (gameKey && st.game === gameKey && this.state.gamesPlayed[gameKey] >= 1)) {
            this.state.unlocked.push(st.id);
            newlyUnlocked = st;
          }
        }
      }
      this.saveState();

      if (newlyUnlocked) {
        this.showCoopBanner(`🏅 ¡Nuevo Sticker: ${newlyUnlocked.icon} ${newlyUnlocked.name}! ✨`, 3400);
        if (window.Cinnamo?.audio) {
          window.Cinnamo.audio.unlock();
          window.Cinnamo.audio.celebrate();
        }
      }
      return newlyUnlocked;
    }

    renderPassportGrid() {
      const titleEl = document.querySelector('#passportModal .modal-header h2');
      if (titleEl) titleEl.textContent = `Pasaporte Mágico de ${cinnaName()}`;
      const starEl = document.getElementById('passportStarCount');
      const countEl = document.getElementById('passportStickerCount');
      const grid = document.getElementById('passportStickersGrid');
      if (!grid) return;

      if (starEl) starEl.textContent = this.state.stars;
      if (countEl) countEl.textContent = `${this.state.unlocked.length} / ${STICKERS_CATALOG.length}`;

      grid.innerHTML = STICKERS_CATALOG.map(st => {
        const isUnlocked = this.state.unlocked.includes(st.id);
        return `
          <div class="sticker-card ${isUnlocked ? 'unlocked' : 'locked'}" data-sticker="${st.id}" title="${st.desc}">
            <div class="sticker-thumb-wrap">
              <img src="${st.img}" alt="${st.name}" loading="lazy" />
              <span class="sticker-badge-ico">${isUnlocked ? st.icon : '🔒'}</span>
            </div>
            <div class="sticker-name">${st.name}</div>
            <div class="sticker-req">${isUnlocked ? '✨ ¡Obtenido!' : `⭐ ${st.starsReq} estrellas`}</div>
          </div>
        `;
      }).join('');

      grid.querySelectorAll('.sticker-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.sticker;
          const st = STICKERS_CATALOG.find(s => s.id === id);
          if (!st) return;
          if (window.Cinnamo?.audio) {
            window.Cinnamo.audio.unlock();
            window.Cinnamo.audio.sparkleChime();
          }
          if (this.state.unlocked.includes(id)) {
            this.showCoopBanner(`${st.icon} ${st.name}: ${st.desc}`, 2600);
            if ('speechSynthesis' in window) {
              try {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(`Sticker ${st.name}. ${st.desc}`);
                if (!window.Cinnamo?.applyVoice?.(u)) u.lang = 'es-CL';
                u.pitch = 1.25;
                window.speechSynthesis.speak(u);
              } catch (_) {}
            }
          } else {
            this.showCoopBanner(`🔒 Gana estrellas aprendiendo en los juegos para conseguir "${st.name}" (⭐ ${st.starsReq})`, 2600);
          }
        });
      });
    }

    openPassport() {
      const modal = document.getElementById('passportModal');
      if (!modal) return;
      if (window.Cinnamo?.audio) {
        window.Cinnamo.audio.unlock();
        window.Cinnamo.audio.bubblePop(2);
      }
      this.renderPassportGrid();
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    }

    closePassport() {
      const modal = document.getElementById('passportModal');
      if (!modal) return;
      if (window.Cinnamo?.audio) {
        window.Cinnamo.audio.unlock();
        window.Cinnamo.audio.softBoing();
      }
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    togglePassport() {
      const modal = document.getElementById('passportModal');
      if (!modal) return;
      if (modal.classList.contains('hidden')) {
        this.openPassport();
      } else {
        this.closePassport();
      }
    }

    /* ========================================================================
       3. PODERES DEL MODO COOPERATIVO ASIMÉTRICO (TV + CELULAR EN TIEMPO REAL)
       ======================================================================== */
    showCoopBanner(text, duration = 2600) {
      const banner = document.getElementById('coopBannerToast');
      if (!banner) return;
      banner.textContent = text;
      banner.classList.add('visible');
      clearTimeout(this._bannerTimeout);
      this._bannerTimeout = setTimeout(() => {
        banner.classList.remove('visible');
      }, duration);
    }

    spawnScreenStars(emojis = ['⭐', '🌟', '🍥', '💖', '✨'], count = 16) {
      const overlay = document.getElementById('coopStageOverlay') || document.body;
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'coop-falling-star';
        el.textContent = emojis[i % emojis.length];
        el.style.left = `${6 + Math.random() * 88}vw`;
        el.style.animationDelay = `${(i * 0.06).toFixed(2)}s`;
        overlay.appendChild(el);
        setTimeout(() => el.remove(), 2200);
      }
    }

    triggerStarRain() {
      const A = window.Cinnamo?.audio;
      if (A) {
        A.unlock();
        A.sparkleChime();
        A.collect(3);
      }

      this.state.coopUses = (this.state.coopUses || 0) + 1;
      this.addStars(5, 'coop');
      this.spawnScreenStars(['🌟', '⭐', '🍥', '💖', '🧁', '✨'], 18);

      const screen = window.Cinnamo?.hub?.currentScreen || 'hub';

      if (screen === 'flight' && window.Cinnamo?.state) {
        const S = window.Cinnamo.state;
        const W = window.innerWidth || 960;
        const H = window.innerHeight || 540;
        for (let i = 0; i < 6; i++) {
          S.items.push({
            x: W * (0.35 + i * 0.09),
            y: H * (0.2 + Math.random() * 0.55),
            r: 26,
            type: i % 2 === 0 ? 'star' : 'roll',
            ph: Math.random() * 6,
            got: false
          });
        }
        this.showCoopBanner(`🌟 ¡Lluvia Cooperativa de Estrellas para ${cinnaName()}! (+6 ⭐)`, 2800);
      } else if (screen === 'platformer' && window.Cinnamo?.platformerGame) {
        const plat = window.Cinnamo.platformerGame;
        plat.coins = (plat.coins || 0) + 5;
        plat.score = (plat.score || 0) + 100;
        if (plat.updateHUD) plat.updateHUD();
        if (plat.p && plat.burstParticles) {
          plat.burstParticles(plat.p.x + 28, plat.p.y, 24, ['#facc15', '#f472b6', '#38bdf8', '#ffffff']);
        }
        this.showCoopBanner('🌟 ¡Lluvia Cooperativa en Super Run! (+5 🍥 Dulces)', 2800);
      } else if (screen === 'doom' && window.Cinnamo?.doomGame) {
        const doom = window.Cinnamo.doomGame;
        if (doom.shootTreat) doom.shootTreat();
        this.showCoopBanner('🌟 ¡Lluvia de Pastelitos en el Castillo 3D! 🧁', 2800);
      } else if (screen === 'puzzle' && window.Cinnamo?.puzzleGame) {
        window.Cinnamo.puzzleGame.placeNextPiece?.();
        this.showCoopBanner('🌟 ¡Estrella Cooperativa encajó una pieza mágica! 🧩', 2800);
      } else if (screen === 'math' && window.Cinnamo?.mathGame) {
        const math = window.Cinnamo.mathGame;
        const btns = math.container ? math.container.querySelectorAll('.sweet-tray .treat-btn:not(.eaten-item)') : [];
        btns.forEach((b, idx) => {
          setTimeout(() => b.click(), idx * 140);
        });
        this.showCoopBanner('🌟 ¡Ayuda Cooperativa contando los dulces! 🧁', 2800);
      } else {
        this.showCoopBanner(`🌟 ¡Lluvia Mágica de Estrellas! (+5 ⭐ al Pasaporte de ${cinnaName()})`, 2800);
      }
    }

    triggerShield() {
      const A = window.Cinnamo?.audio;
      if (A) {
        A.unlock();
        A.spin();
        A.sparkleChime();
      }

      this.state.coopUses = (this.state.coopUses || 0) + 1;
      this.addStars(3, 'coop');

      const shieldEl = document.getElementById('coopShieldBorder');
      if (shieldEl) {
        shieldEl.classList.add('active');
        clearTimeout(this._shieldTimer);
        this._shieldTimer = setTimeout(() => {
          shieldEl.classList.remove('active');
        }, 8000);
      }

      const screen = window.Cinnamo?.hub?.currentScreen || 'hub';
      if (screen === 'platformer' && window.Cinnamo?.platformerGame) {
        const plat = window.Cinnamo.platformerGame;
        if (plat.p) {
          plat.p.invulnT = 8.0;
          plat.p.canDoubleJump = true;
          if (plat.p.vy > 0) plat.p.vy = -380;
          if (plat.burstParticles) {
            plat.burstParticles(plat.p.x + 28, plat.p.y + 28, 28, ['#38bdf8', '#f472b6', '#fef08a', '#ffffff']);
          }
        }
        this.showCoopBanner('🛡️ ¡Escudo de Algodón de Azúcar Activo (8s de Protección)! 🌸', 3200);
      } else if (screen === 'flight' && window.Cinnamo?.state) {
        const S = window.Cinnamo.state;
        S.p.spinT = 0.8;
        S.p.mood = 'happy';
        S.p.moodT = 5.0;
        this.showCoopBanner('🛡️ ¡Escudo Magnético de Nubes Activo para Cinnamoroll! ☁️', 3200);
      } else if (screen === 'doom' && window.Cinnamo?.doomGame) {
        const doom = window.Cinnamo.doomGame;
        if (doom.shootTreat) doom.shootTreat();
        this.showCoopBanner('🛡️ ¡Aura de Dulzura Protectora en el Castillo 3D! 💖', 3200);
      } else {
        this.showCoopBanner(`🛡️ ¡Burbuja Mágica de Algodón de Azúcar para ${cinnaName()}! ✨`, 3200);
      }
    }

    triggerCheer() {
      const A = window.Cinnamo?.audio;
      if (A) {
        A.unlock();
        A.celebrate();
      }
      this.state.coopUses = (this.state.coopUses || 0) + 1;
      this.addStars(2, 'coop');
      this.spawnScreenStars(['💖', '🌸', '🎉', '👑', '⭐'], 14);

      const phrases = [
        `💖 ¡Vamos ${cinnaName()}, lo estás haciendo increíble! 🌟`,
        `🎉 ¡Súper Equipo Cinnamoroll y ${cinnaName()}! 👑`,
        `🌸 ¡Brillas como una estrella, ${cinnaName()}! ✨`
      ];
      const msg = phrases[this.state.coopUses % phrases.length];
      this.showCoopBanner(msg, 3200);

      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(`¡Vamos ${cinnaName()}, tú puedes!`);
          if (!window.Cinnamo?.applyVoice?.(u)) u.lang = 'es-CL';
          u.pitch = 1.28;
          window.speechSynthesis.speak(u);
        } catch (_) {}
      }
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  const manager = new AmandaPassportAndCoop();
  window.Cinnamo.passport = manager;
  window.Cinnamo.coop = manager;
})();
