/* Super Cinnamoroll Run (Gira Mundial de Sanrio por Ciudades del Mundo)
 * - 5 Ciudades con escenarios de alta fidelidad, ambientación artística y dificultad progresiva:
 *    1. 🇨🇱 Concepción (Chile): Campus UdeC, Campanil iluminado, Arco de Medicina, Río Biobío y Cerezos en flor (5-6 años).
 *    2. 🏖️ La Serena (Chile): Avenida del Mar, Faro Monumental colonial con luz giratoria y Océano Pacífico (6 años).
 *    3. 🇧🇷 Río de Janeiro (Brasil): Cristo Redentor en Corcovado, Pan de Azúcar, Bahía de Guanabara y samba (6-7 años).
 *    4. 🏔️ Santiago de Chile: Cordillera de los Andes con alpenglow, Gran Torre Costanera y Teleférico San Cristóbal (7-8 años).
 *    5. 🏮 China Mágica: Gran Muralla, Pagodas imperiales de 5 aleros, bosques de bambú y nubes de dragón (8 años · Gran Final).
 * - Selección de 5 héroes de Sanrio: Cinnamoroll, Milk, Pompompurin, Chiffon y Mocha.
 * - Niveles extendidos y ricos (5800 a 9200 px) con múltiples rutas (suelo y cielo).
 * - Gráficos vectoriales Canvas 100% artesanales (sin emojis de texto desprolijos).
 * - HUD con barra de distancia interactiva en tiempo real y selector de personajes/ciudades accesible para celulares.
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const VW = 960;
  const VH = 540;

  const HEROES = [
    {
      id: 'cinna',
      name: 'Cinnamoroll',
      badge: '🐶 Canela',
      imgSrc: 'assets/cinnamoroll_fly.png',
      desc: '¡Vuela y planea suavemente por el cielo con sus orejitas mágicas!',
      jumpPower: 520,
      glideGravity: 165,
      trailColor: '#8ecae6',
      w: 72,
      h: 48
    },
    {
      id: 'milk',
      name: 'Milk',
      badge: '🍼 Bebé',
      imgSrc: 'assets/milk_teddy.png',
      desc: '¡El más chiquitito! Da saltitos tiernos y flota con su osito de peluche.',
      jumpPower: 535,
      glideGravity: 185,
      trailColor: '#ffb3d1',
      w: 64,
      h: 56
    },
    {
      id: 'purin',
      name: 'Pompompurin',
      badge: '🍮 Purin',
      imgSrc: 'assets/pompompurin.png',
      desc: '¡El perrito con boina! Da rebotes súper elásticos como flan de caramelo.',
      jumpPower: 550,
      glideGravity: 210,
      trailColor: '#f59e0b',
      w: 68,
      h: 62
    },
    {
      id: 'chiffon',
      name: 'Chiffon',
      badge: '🌸 Esponjosa',
      imgSrc: 'assets/chiffon.png',
      desc: '¡La perrita enérgica! Salta alto y ágil con sus orejitas de nube.',
      jumpPower: 530,
      glideGravity: 175,
      trailColor: '#ff80bf',
      w: 74,
      h: 50
    },
    {
      id: 'mocha',
      name: 'Mocha',
      badge: '🎀 Elegante',
      imgSrc: 'assets/mocha_hq.png',
      desc: '¡La coqueta Mocha con flores rosas! Salta con agilidad y elegancia.',
      jumpPower: 535,
      glideGravity: 180,
      trailColor: '#c084fc',
      w: 72,
      h: 52
    }
  ];

  const CITIES = [
    {
      id: 'concepcion',
      name: 'Concepción',
      country: 'Chile',
      flag: '🇨🇱',
      badge: '🌸 Nivel 1 (5-6 años)',
      title: 'Jardines del Campanil y Biobío',
      desc: '¡Corre por el Campus UdeC, pasa junto al Campanil, cruza el Arco de Medicina y disfruta los cerezos en flor!',
      icon: '🏛️',
      itemIcon: '🧁',
      itemName: 'Rollitos de Canela',
      levelWidth: 5800,
      totalItems: 16,
      skyGradient: ['#8eccff', '#d4eeff', '#ffe8f4'],
      groundColor: '#4ade80',
      groundEdge: '#22c55e',
      groundBase: '#854d0e',
      platformStyle: 'concepcion'
    },
    {
      id: 'laserena',
      name: 'La Serena',
      country: 'Chile',
      flag: '🏖️',
      badge: '⭐ Nivel 2 (6 años)',
      title: 'Avenida del Mar y El Faro',
      desc: '¡Siente la brisa marina del Océano Pacífico, salta por la playa dorada y llega al histórico Faro Monumental!',
      icon: '🏮',
      itemIcon: '⭐',
      itemName: 'Estrellas Marinas',
      levelWidth: 6600,
      totalItems: 20,
      skyGradient: ['#38bdf8', '#fed7aa', '#fbcfe8'],
      groundColor: '#fde047',
      groundEdge: '#eab308',
      groundBase: '#b45309',
      platformStyle: 'laserena'
    },
    {
      id: 'rio',
      name: 'Río de Janeiro',
      country: 'Brasil',
      flag: '🇧🇷',
      badge: '👑 Nivel 3 (6-7 años)',
      title: 'Copacabana y Corcovado',
      desc: '¡Sube hasta el Cristo Redentor, contempla el Pan de Azúcar y baila samba con plataformas móviles!',
      icon: '🌴',
      itemIcon: '🥥',
      itemName: 'Cocos Tropicales',
      levelWidth: 7400,
      totalItems: 24,
      skyGradient: ['#a855f7', '#f472b6', '#fed7aa'],
      groundColor: '#38bdf8',
      groundEdge: '#ffffff',
      groundBase: '#0284c7',
      platformStyle: 'rio'
    },
    {
      id: 'santiago',
      name: 'Santiago de Chile',
      country: 'Chile',
      flag: '🏔️',
      badge: '💎 Nivel 4 (7-8 años)',
      title: 'Cordillera y Teleférico Andino',
      desc: '¡Admira los Andes nevados, la Gran Torre Costanera y vuela sobre las cabinas del Teleférico San Cristóbal!',
      icon: '🚡',
      itemIcon: '🍓',
      itemName: 'Frutillas Andinas',
      levelWidth: 8200,
      totalItems: 28,
      skyGradient: ['#6366f1', '#c084fc', '#ffe4e6'],
      groundColor: '#86efac',
      groundEdge: '#4ade80',
      groundBase: '#475569',
      platformStyle: 'santiago'
    },
    {
      id: 'china',
      name: 'China Mágica',
      country: 'China',
      flag: '🏮',
      badge: '🐉 Gran Final (8 años)',
      title: 'La Gran Muralla y Pagodas',
      desc: '¡El desafío más emocionante! Salta por la Gran Muralla, linternas flotantes, bambú y flores de loto sagradas.',
      icon: '🏯',
      itemIcon: '🥟',
      itemName: 'Dumplings Dorados',
      levelWidth: 9200,
      totalItems: 32,
      skyGradient: ['#f43f5e', '#fb923c', '#fef08a'],
      groundColor: '#e11d48',
      groundEdge: '#facc15',
      groundBase: '#7f1d1d',
      platformStyle: 'china'
    }
  ];

  class CinnamorollPlatformer {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.ctx = null;
      this.animId = null;
      this.running = false;

      this.currentCityIdx = 0;
      this.highestUnlockedCity = 0;
      this.selectedHero = HEROES[0];

      // Sprites cacheados
      this.heroImages = {};

      // Estado del jugador
      this.p = {
        x: 80,
        y: 350,
        vx: 0,
        vy: 0,
        w: 72,
        h: 48,
        grounded: false,
        canDoubleJump: true,
        gliding: false,
        facing: 1,
        animTimer: 0,
        squashX: 1.0,
        squashY: 1.0,
        coyoteTimer: 0,
        jumpBuffer: 0,
        wasGrounded: false,
        standingPlat: null
      };

      this.camX = 0;
      this.levelTime = 0;
      this.levelWidth = 5800;
      this.keys = { left: false, right: false, jump: false };

      this.cupcakes = [];
      this.platforms = [];
      this.springs = [];
      this.sceneryClouds = [];
      this.particles = [];
      this.ambientPetals = [];
      this.score = 0;
      this.totalCupcakes = 16;
      this.reachedGoal = false;

      // Soporte Multijugador Cooperativo Local/Remoto hasta 3 Players (P1, P2, P3)
      this.coPlayers = {
        2: this.createCoPlayer(2, 'milk', '#0284c7', 'P2 🩵'),
        3: this.createCoPlayer(3, 'purin', '#eab308', 'P3 💛')
      };
    }

    createCoPlayer(slot, heroId, badgeColor, label) {
      const hero = HEROES.find(h => h.id === heroId) || HEROES[0];
      return {
        slot,
        active: false,
        heroId: hero.id,
        hero,
        badgeColor,
        label,
        x: 60 - (slot - 1) * 28,
        y: 320,
        vx: 0,
        vy: 0,
        w: hero.w,
        h: hero.h,
        grounded: false,
        canDoubleJump: true,
        gliding: false,
        facing: 1,
        animTimer: 0,
        squashX: 1.0,
        squashY: 1.0,
        coyoteTimer: 0,
        jumpBuffer: 0,
        keys: { left: false, right: false, jump: false }
      };
    }

    ensureAssets() {
      HEROES.forEach(h => {
        if (!this.heroImages[h.id]) {
          const img = new Image();
          img.src = h.imgSrc;
          this.heroImages[h.id] = img;
        }
      });
      if (!this.heroImages['mocha']) {
        const mocha = new Image();
        mocha.src = 'assets/mocha_hq.png';
        this.heroImages['mocha'] = mocha;
      }
    }

    init(containerEl) {
      this.ensureAssets();
      this.container = containerEl;
      this.renderDOM();
      this.setupCanvas();
      this.buildCityLevel(this.currentCityIdx);
      this.bindInputs();
      this.startLoop();
    }

    renderDOM() {
      const hero = this.selectedHero;
      const city = CITIES[this.currentCityIdx];

      this.container.innerHTML = `
        <div class="platformer-wrapper">
          <canvas id="platformerCanvas" width="${VW}" height="${VH}"></canvas>

          <!-- HUD superior -->
          <div class="plat-hud">
            <!-- Píldora de Coleccionables de la Ciudad -->
            <div class="plat-score-pill">
              <span class="plat-cupcake-ico">${city.itemIcon}</span>
              <span id="platScoreNum">0 / ${city.totalItems}</span>
            </div>

            <!-- Barra de Progreso de Distancia en la Ciudad -->
            <div class="plat-progress-bar-wrap" id="platProgressWrap" title="Tu recorrido por la ciudad">
              <span class="plat-prog-flag" id="platProgFlag">${city.flag}</span>
              <div class="plat-progress-track">
                <div class="plat-progress-fill" id="platProgressFill" style="width: 0%"></div>
                <img src="${hero.imgSrc}" id="platProgressAvatar" class="plat-progress-avatar" style="left: 0%" alt="${hero.name}" />
              </div>
              <span class="plat-prog-meta">🏁</span>
            </div>

            <!-- Selector de Ciudad / Pasaporte Mágico (Toda la píldora táctil) -->
            <div class="plat-city-pill" id="platCityPill" role="button" tabindex="0" title="Toca para viajar a otra ciudad">
              <span class="plat-city-badge">${city.flag}</span>
              <span id="platCityNameText">${city.name}</span>
              <button class="btn-plat-switch-city" id="btnPlatSwitchCity" type="button">🗺️ Ciudades</button>
            </div>

            <!-- Selector de Personaje (Toda la píldora táctil) -->
            <div class="plat-hero-pill" id="platHeroPill" role="button" tabindex="0" title="Toca para cambiar de amigo de Sanrio">
              <img src="${hero.imgSrc}" alt="${hero.name}" class="plat-hud-avatar" />
              <span>${hero.name}</span>
              <button class="btn-plat-switch-hero" id="btnPlatSwitchHero" type="button">🔄 Cambiar</button>
            </div>

            <div class="plat-hint-tag">🪽 ¡Mantén SALTO para planear!</div>
          </div>

          <!-- Controles táctiles transparentes y ergonómicos en pantalla -->
          <div class="plat-touch-controls">
            <div class="plat-dpad">
              <button class="plat-btn btn-left" id="btnPlatLeft" aria-label="Izquierda">◀</button>
              <button class="plat-btn btn-right" id="btnPlatRight" aria-label="Derecha">▶</button>
            </div>
            <div class="plat-actions">
              <button class="plat-btn btn-jump" id="btnPlatJump" aria-label="Saltar y Planear">
                <span class="jump-ico">🪽</span>
                <span class="jump-txt">¡Saltar!</span>
              </button>
            </div>
          </div>

          <!-- Modal de Pasaporte / Selección de Ciudad -->
          <div class="plat-city-modal hidden" id="platCityModal">
            <div class="plat-city-modal-box">
              <div class="plat-modal-header">
                <span class="plat-modal-badge">🌍 Gira Mundial de Sanrio por Ciudades ✈️</span>
                <h2>¿A qué ciudad quieres viajar hoy, Amanda?</h2>
                <button class="btn-plat-modal-close" id="btnCloseCityModal" aria-label="Cerrar modal">✕ Cerrar</button>
              </div>
              <div class="plat-cities-grid">
                ${CITIES.map((c, idx) => `
                  <div class="plat-city-card ${idx === this.currentCityIdx ? 'active' : ''}" data-cidx="${idx}">
                    <span class="plat-city-card-badge">${c.badge}</span>
                    <span class="plat-city-card-icon">${c.flag}</span>
                    <h3>${c.name}</h3>
                    <h4>${c.title}</h4>
                    <p>${c.desc}</p>
                    <button class="btn-travel-city" type="button">${idx === this.currentCityIdx ? '✨ ¡Jugando aquí!' : '✈️ ¡Viajar aquí!'}</button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Modal de Selección de Personaje -->
          <div class="plat-char-modal hidden" id="platCharModal">
            <div class="plat-char-modal-box">
              <div class="plat-modal-header">
                <span class="plat-modal-badge">✨ Elige a tu Amigo de Sanrio ✨</span>
                <h2>¿Con quién quieres correr hoy, Amanda?</h2>
                <button class="btn-plat-modal-close" id="btnCloseCharModal" aria-label="Cerrar modal">✕ Cerrar</button>
              </div>
              <div class="plat-heroes-select-grid">
                ${HEROES.map(h => `
                  <div class="plat-hero-option ${h.id === this.selectedHero.id ? 'active' : ''}" data-id="${h.id}">
                    <span class="plat-opt-badge">${h.badge}</span>
                    <div class="plat-opt-img-box">
                      <img src="${h.imgSrc}" alt="${h.name}" />
                    </div>
                    <h3>${h.name}</h3>
                    <p>${h.desc}</p>
                    <button class="btn-pick-plat-hero" type="button">¡Elegir!</button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Pantalla de victoria con sello de pasaporte y amigos oficiales -->
          <div class="plat-victory-screen hidden" id="platVictoryScreen">
            <div class="plat-victory-card">
              <div class="victory-ribbon" id="platVictoryRibbon">🎉 ¡LLEGASTE A LA META EN ${city.name.toUpperCase()}! 🎉</div>
              <h2 id="platVictoryTitle">¡Amanda completó ${city.name} con ${this.score} ${city.itemName}!</h2>
              
              <!-- Estrellas de evaluación -->
              <div class="plat-victory-stars" id="platVictoryStars">⭐⭐⭐</div>
              <div class="plat-passport-stamp" id="platPassportStamp">
                <span>PASAPORTE SANRIO</span>
                <strong>SELLO OFICIAL: ${city.name.toUpperCase()} ✈️</strong>
              </div>

              <p id="platVictoryMsg">¡Los amigos de Sanrio están felices de haber viajado contigo a ${city.name}, ${city.country}! 💖</p>
              
              <div class="plat-victory-friends-row">
                <img src="assets/cinnamoroll_fly.png" alt="Cinnamoroll" class="vic-friend" />
                <img src="assets/milk_sitting.png" alt="Milk" class="vic-friend" />
                <img src="assets/pompompurin_hq.png" alt="Pompompurin" class="vic-friend" />
                <img src="assets/mocha_hq.png" alt="Mocha" class="vic-friend" />
                <img src="assets/chiffon.png" alt="Chiffon" class="vic-friend" />
              </div>

              <div class="plat-victory-actions">
                <button class="btn-plat-next-city" id="btnPlatNextCity">✈️ Siguiente Ciudad</button>
                <button class="btn-plat-repeat-city" id="btnPlatRepeatCity">🔄 Repetir Ciudad</button>
                <button class="btn-plat-choose-city" id="btnPlatChooseCity">🗺️ Elegir Ciudad</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Modal ciudad (Click en píldora entera o en botón)
      const cityModal = this.container.querySelector('#platCityModal');
      const cityPill = this.container.querySelector('#platCityPill');
      const openCityModal = () => {
        A.unlock();
        A.bubblePop(1);
        cityModal.classList.remove('hidden');
      };
      if (cityPill) cityPill.addEventListener('click', openCityModal);

      const closeCityModal = () => {
        A.unlock();
        A.bubblePop(1);
        cityModal.classList.add('hidden');
      };
      const btnCloseCity = this.container.querySelector('#btnCloseCityModal');
      if (btnCloseCity) btnCloseCity.addEventListener('click', closeCityModal);
      if (cityModal) {
        cityModal.addEventListener('click', (e) => {
          if (e.target === cityModal) closeCityModal();
        });
      }

      this.container.querySelectorAll('.plat-city-card').forEach(card => {
        card.addEventListener('click', (e) => {
          A.unlock();
          A.celebrate();
          const cidx = parseInt(e.currentTarget.dataset.cidx, 10);
          this.buildCityLevel(cidx);
          cityModal.classList.add('hidden');
        });
      });

      // Modal select hero (Click en píldora entera o en botón)
      const heroModal = this.container.querySelector('#platCharModal');
      const heroPill = this.container.querySelector('#platHeroPill');
      const openHeroModal = () => {
        A.unlock();
        A.bubblePop(1);
        heroModal.classList.remove('hidden');
      };
      if (heroPill) heroPill.addEventListener('click', openHeroModal);

      const closeHeroModal = () => {
        A.unlock();
        A.bubblePop(1);
        heroModal.classList.add('hidden');
      };
      const btnCloseHero = this.container.querySelector('#btnCloseCharModal');
      if (btnCloseHero) btnCloseHero.addEventListener('click', closeHeroModal);
      if (heroModal) {
        heroModal.addEventListener('click', (e) => {
          if (e.target === heroModal) closeHeroModal();
        });
      }

      this.container.querySelectorAll('.plat-hero-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
          A.unlock();
          A.celebrate();
          const id = e.currentTarget.dataset.id;
          const found = HEROES.find(h => h.id === id);
          if (found) {
            this.setHero(found);
            heroModal.classList.add('hidden');
          }
        });
      });

      // Acciones de pantalla de victoria
      const btnNext = this.container.querySelector('#btnPlatNextCity');
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(2);
          this.container.querySelector('#platVictoryScreen').classList.add('hidden');
          const nextIdx = (this.currentCityIdx + 1) % CITIES.length;
          this.buildCityLevel(nextIdx);
        });
      }

      const btnRepeat = this.container.querySelector('#btnPlatRepeatCity');
      if (btnRepeat) {
        btnRepeat.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          this.container.querySelector('#platVictoryScreen').classList.add('hidden');
          this.buildCityLevel(this.currentCityIdx);
        });
      }

      const btnChoose = this.container.querySelector('#btnPlatChooseCity');
      if (btnChoose) {
        btnChoose.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          this.container.querySelector('#platVictoryScreen').classList.add('hidden');
          cityModal.classList.remove('hidden');
        });
      }
    }

    setHero(hero) {
      this.selectedHero = hero;
      this.p.w = hero.w;
      this.p.h = hero.h;
      if (this.container) {
        const avatar = this.container.querySelector('.plat-hud-avatar');
        if (avatar) avatar.src = hero.imgSrc;
        const nameEl = this.container.querySelector('#platHeroPill span');
        if (nameEl) nameEl.textContent = hero.name;
        const progAvatar = this.container.querySelector('#platProgressAvatar');
        if (progAvatar) progAvatar.src = hero.imgSrc;
        this.container.querySelectorAll('.plat-hero-option').forEach(opt => {
          opt.classList.toggle('active', opt.dataset.id === hero.id);
        });
      }
      this.burstParticles(this.p.x + this.p.w / 2, this.p.y + this.p.h / 2, 16, ['#ffffff', hero.trailColor, '#ffd1dc']);
    }

    selectHeroById(heroId, playerSlot = 1) {
      if (A) A.unlock();
      const found = HEROES.find(h => h.id === heroId) || HEROES[0];
      if (playerSlot === 2 || playerSlot === 3) {
        const cp = this.coPlayers[playerSlot];
        if (cp) {
          const wasActive = cp.active;
          cp.active = true;
          cp.heroId = found.id;
          cp.hero = found;
          cp.w = found.w;
          cp.h = found.h;
          if (!wasActive) {
            cp.x = Math.max(20, this.p.x - 36 * (playerSlot - 1));
            cp.y = this.p.y - 10;
            cp.vx = 0;
            cp.vy = -180;
          }
          this.burstParticles(cp.x + cp.w / 2, cp.y + cp.h / 2, 18, ['#ffffff', found.trailColor, cp.badgeColor]);
        }
      } else {
        this.setHero(found);
        const heroModal = this.container ? this.container.querySelector('#platCharModal') : null;
        if (heroModal) heroModal.classList.add('hidden');
      }
      if (A) A.celebrate();
    }

    selectCityByIndex(cityIdx) {
      if (A) { A.unlock(); A.celebrate(); }
      const idx = Math.max(0, Math.min(CITIES.length - 1, parseInt(cityIdx, 10) || 0));
      if (this.container) {
        const cityModal = this.container.querySelector('#platCityModal');
        if (cityModal) cityModal.classList.add('hidden');
        const vic = this.container.querySelector('#platVictoryScreen');
        if (vic) vic.classList.add('hidden');
      }
      this.buildCityLevel(idx);
    }

    nextHero(playerSlot = 1) {
      if (playerSlot === 2 || playerSlot === 3) {
        const cp = this.coPlayers[playerSlot];
        const curId = cp?.heroId || 'milk';
        const idx = HEROES.findIndex(h => h.id === curId);
        const next = HEROES[(idx + 1) % HEROES.length];
        this.selectHeroById(next.id, playerSlot);
        return;
      }
      const currentId = this.selectedHero?.id || 'cinna';
      const idx = HEROES.findIndex(h => h.id === currentId);
      const nextIdx = (idx + 1) % HEROES.length;
      this.setHero(HEROES[nextIdx]);
      if (A) A.celebrate();
    }

    coPlayerJump(slot) {
      const cp = this.coPlayers[slot];
      if (!cp) return;
      if (!cp.active) {
        cp.active = true;
        cp.x = Math.max(20, this.p.x - 36 * (slot - 1));
        cp.y = this.p.y - 10;
      }
      const hero = cp.hero || HEROES[0];
      if (cp.grounded || cp.coyoteTimer > 0) {
        cp.vy = -hero.jumpPower;
        cp.grounded = false;
        cp.coyoteTimer = 0;
        cp.canDoubleJump = true;
        cp.squashX = 0.74;
        cp.squashY = 1.34;
        if (A) A.jump();
        this.burstParticles(cp.x + cp.w / 2, cp.y + cp.h, 10, ['#ffffff', hero.trailColor, cp.badgeColor]);
      } else if (cp.canDoubleJump && cp.vy > -240) {
        cp.vy = -Math.round(hero.jumpPower * 0.94);
        cp.canDoubleJump = false;
        cp.squashX = 0.78;
        cp.squashY = 1.28;
        if (A) A.softBoing();
        this.burstParticles(cp.x + cp.w / 2, cp.y + cp.h * 0.75, 12, ['#ffffff', hero.trailColor, cp.badgeColor]);
      }
    }

    setCoPlayerInput(slot, btn, pressed) {
      const cp = this.coPlayers[slot];
      if (!cp) return;
      if (pressed && !cp.active) {
        cp.active = true;
        cp.x = Math.max(20, this.p.x - 36 * (slot - 1));
        cp.y = this.p.y - 10;
        this.burstParticles(cp.x + cp.w / 2, cp.y + cp.h / 2, 16, ['#ffffff', cp.badgeColor]);
      }
      if (btn === 'left') cp.keys.left = pressed;
      if (btn === 'right') cp.keys.right = pressed;
      if (btn === 'jump' || btn === 'up') {
        cp.keys.jump = pressed;
        if (pressed) {
          this.coPlayerJump(slot);
        } else if (cp.vy < -180) {
          cp.vy *= 0.65;
        }
      }
      if (btn === 'treat' && pressed) {
        this.burstParticles(cp.x + cp.w / 2, cp.y + cp.h / 2, 14, ['#ff9ebb', '#fde047', cp.badgeColor]);
      }
    }

    setCoPlayerJoystick(slot, x, y) {
      const cp = this.coPlayers[slot];
      if (!cp) return;
      if ((Math.abs(x) > 0.25 || Math.abs(y) > 0.25) && !cp.active) {
        cp.active = true;
        cp.x = Math.max(20, this.p.x - 36 * (slot - 1));
        cp.y = this.p.y - 10;
      }
      cp.keys.left = x < -0.24;
      cp.keys.right = x > 0.24;
      const wantsJump = y < -0.65;
      if (wantsJump && !cp.keys.jump) {
        cp.keys.jump = true;
        this.coPlayerJump(slot);
      } else if (!wantsJump && cp.keys.jump) {
        cp.keys.jump = false;
      }
    }

    treat() {
      if (A) {
        A.unlock();
        A.sparkleChime();
      }
      this.burstParticles(this.p.x + this.p.w / 2, this.p.y + this.p.h / 2, 14, ['#ff9ebb', '#fde047', '#38bdf8', '#ffffff']);
      if (this.p.grounded) {
        this.p.vy = -280;
        this.p.grounded = false;
      }
    }

    setupCanvas() {
      this.canvas = this.container.querySelector('#platformerCanvas');
      this.ctx = this.canvas.getContext('2d');
    }

    /* -------------------------------------------------------------
       GENERADOR DE NIVELES EXTENDIDOS POR CIUDAD (5800 a 9200 px)
       ------------------------------------------------------------- */
    buildCityLevel(cityIdx) {
      this.currentCityIdx = cityIdx;
      this.currentCityIndex = cityIdx;
      if (cityIdx > this.highestUnlockedCity) {
        this.highestUnlockedCity = cityIdx;
      }
      const city = CITIES[cityIdx];
      this.levelWidth = city.levelWidth;
      this.totalCupcakes = city.totalItems;
      this.levelTime = 0;

      const p = this.p;
      p.x = 80;
      p.y = 350;
      p.vx = 0;
      p.vy = 0;
      p.w = this.selectedHero.w;
      p.h = this.selectedHero.h;
      p.grounded = false;
      p.canDoubleJump = true;
      p.coyoteTimer = 0;
      p.jumpBuffer = 0;
      p.squashX = 1.0;
      p.squashY = 1.0;
      p.standingPlat = null;
      p.lastSafeX = 80;
      p.lastSafeY = 350;
      this.score = 0;
      this.reachedGoal = false;
      this.camX = 0;

      if (this.coPlayers) {
        for (const slot of [2, 3]) {
          const cp = this.coPlayers[slot];
          if (cp && cp.active) {
            cp.x = 80 - (slot - 1) * 28;
            cp.y = 340;
            cp.vx = 0;
            cp.vy = 0;
            cp.grounded = false;
            cp.canDoubleJump = true;
          }
        }
      }

      // Nubes decorativas en el cielo lejano
      this.sceneryClouds = [];
      const cloudCount = Math.floor(city.levelWidth / 180);
      for (let i = 0; i < cloudCount; i++) {
        this.sceneryClouds.push({
          x: i * 210 + (Math.sin(i * 1.7) * 60),
          y: 30 + (i % 5) * 32,
          w: 85 + (i % 3) * 35,
          speed: 0.12 + (i % 3) * 0.08
        });
      }

      // Partículas ambientales (pétalos de sakura, confeti, hojas, etc.)
      this.ambientPetals = [];
      for (let i = 0; i < 40; i++) {
        this.ambientPetals.push({
          x: Math.random() * VW,
          y: Math.random() * VH,
          vx: 20 + Math.random() * 40,
          vy: 10 + Math.random() * 30,
          size: 4 + Math.random() * 5,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 3
        });
      }

      this.platforms = [];
      this.springs = [];
      this.cupcakes = [];

      if (city.id === 'concepcion') {
        // NIVEL 1: CONCEPCIÓN (5800 px · Campus UdeC, Praderas, Campanil, Cerezos)
        this.platforms = [
          // Ruta de suelo continuo (Campus UdeC, Praderas, Campanil, Arco, Biobío)
          { x: -50, y: 440, w: 1650, h: 110, type: 'ground' },
          { x: 1560, y: 430, w: 1640, h: 120, type: 'ground' },
          { x: 3160, y: 420, w: 1660, h: 130, type: 'ground' },
          { x: 4780, y: 430, w: 1100, h: 120, type: 'ground' },
          // Plataformas elevadas y ruta aérea de cerezos
          { x: 800, y: 380, w: 180, h: 26, type: 'sakura' },
          { x: 1040, y: 320, w: 190, h: 26, type: 'cloud' },
          { x: 1300, y: 260, w: 200, h: 26, type: 'sakura' },
          { x: 2370, y: 360, w: 180, h: 26, type: 'cloud', baseX: 2370, moveX: true, rangeX: 60, speedX: 1.2, phase: 0 },
          { x: 2620, y: 290, w: 190, h: 26, type: 'sakura' },
          { x: 2880, y: 230, w: 200, h: 26, type: 'cloud', baseX: 2880, moveX: true, rangeX: 70, speedX: 1.4, phase: Math.PI },
          { x: 4000, y: 350, w: 180, h: 26, type: 'sakura' },
          { x: 4240, y: 280, w: 190, h: 26, type: 'cloud' },
          { x: 4500, y: 220, w: 210, h: 26, type: 'sakura', baseX: 4500, moveX: true, rangeX: 65, speedX: 1.3, phase: 0.5 }
        ];

        this.springs = [
          { x: 620, y: 418, w: 60, h: 22, timer: 0, power: -680, theme: 'sakura' },
          { x: 2160, y: 408, w: 60, h: 22, timer: 0, power: -700, theme: 'sakura' },
          { x: 3780, y: 398, w: 60, h: 22, timer: 0, power: -710, theme: 'sakura' }
        ];

        const itemXs = [
          380, 640, 890, 1130, 1400, 1720, 2020, 2450,
          2710, 2980, 3320, 3680, 4090, 4330, 4600, 5020
        ];
        this.cupcakes = itemXs.map((x, i) => ({
          x,
          y: 220 + (i % 2 === 0 ? -40 : 30) + Math.sin(x * 0.01) * 35,
          got: false
        }));

      } else if (city.id === 'laserena') {
        // NIVEL 2: LA SERENA (6600 px · Avenida del Mar, Olas, Muelles, Faro Monumental)
        this.platforms = [
          // Ruta de suelo continuo (Avenida del Mar, Playa Dorada, Faro Monumental)
          { x: -50, y: 440, w: 1600, h: 110, type: 'ground' },
          { x: 1510, y: 420, w: 1570, h: 130, type: 'ground' },
          { x: 3040, y: 430, w: 1640, h: 120, type: 'ground' },
          { x: 4640, y: 410, w: 1100, h: 140, type: 'ground' },
          { x: 5700, y: 430, w: 1000, h: 120, type: 'ground' },
          // Plataformas elevadas (Muelles de madera y nubes marinas)
          { x: 740, y: 370, w: 180, h: 26, type: 'pier', baseX: 740, moveX: true, rangeX: 65, speedX: 1.3, phase: 0 },
          { x: 1000, y: 310, w: 180, h: 26, type: 'cloud' },
          { x: 1250, y: 250, w: 190, h: 26, type: 'pier', baseX: 1250, moveX: true, rangeX: 75, speedX: 1.5, phase: Math.PI },
          { x: 2260, y: 350, w: 180, h: 26, type: 'pier' },
          { x: 2510, y: 280, w: 190, h: 26, type: 'cloud', baseX: 2510, moveX: true, rangeX: 80, speedX: 1.4, phase: 0.8 },
          { x: 2780, y: 220, w: 190, h: 26, type: 'pier' },
          { x: 3850, y: 360, w: 180, h: 26, type: 'cloud', baseX: 3850, moveX: true, rangeX: 70, speedX: 1.6, phase: 0.2 },
          { x: 4100, y: 290, w: 190, h: 26, type: 'pier' },
          { x: 4360, y: 230, w: 200, h: 26, type: 'cloud', baseX: 4360, moveX: true, rangeX: 85, speedX: 1.5, phase: Math.PI },
          { x: 5430, y: 330, w: 200, h: 26, type: 'pier' }
        ];

        this.springs = [
          { x: 580, y: 418, w: 60, h: 22, timer: 0, power: -700, theme: 'star' },
          { x: 2040, y: 398, w: 60, h: 22, timer: 0, power: -710, theme: 'star' },
          { x: 3620, y: 408, w: 60, h: 22, timer: 0, power: -720, theme: 'star' },
          { x: 5200, y: 388, w: 60, h: 22, timer: 0, power: -720, theme: 'star' }
        ];

        const itemXs = [
          320, 580, 830, 1090, 1340, 1650, 1950, 2340,
          2600, 2870, 3180, 3520, 3940, 4190, 4450, 4780,
          5120, 5520, 5820, 6150
        ];
        this.cupcakes = itemXs.map((x, i) => ({
          x,
          y: 210 + (i % 2 === 0 ? -45 : 35) + Math.sin(x * 0.012) * 30,
          got: false
        }));

      } else if (city.id === 'rio') {
        // NIVEL 3: RÍO DE JANEIRO (7400 px · Copacabana, Morros, Pan de Azúcar, Corcovado)
        this.platforms = [
          // Ruta de suelo continuo (Calçadão de Copacabana, Selva Atlántica, Pan de Azúcar, Corcovado)
          { x: -50, y: 440, w: 1570, h: 110, type: 'ground' },
          { x: 1480, y: 420, w: 1570, h: 130, type: 'ground' },
          { x: 3010, y: 430, w: 1630, h: 120, type: 'ground' },
          { x: 4600, y: 410, w: 1690, h: 140, type: 'ground' },
          { x: 6250, y: 430, w: 1250, h: 120, type: 'ground' },
          // Plataformas elevadas (Plataformas tropicales móviles y nubes)
          { x: 700, y: 350, w: 180, h: 26, type: 'tropical', baseY: 350, moveY: true, rangeY: 50, speedY: 1.5, phase: 0 },
          { x: 960, y: 280, w: 180, h: 26, type: 'cloud', baseX: 960, moveX: true, rangeX: 80, speedX: 1.6, phase: 0.8 },
          { x: 1220, y: 220, w: 190, h: 26, type: 'tropical', baseY: 220, moveY: true, rangeY: 45, speedY: 1.7, phase: Math.PI },
          { x: 2210, y: 350, w: 180, h: 26, type: 'cloud', baseX: 2210, moveX: true, rangeX: 85, speedX: 1.6, phase: 0.2 },
          { x: 2470, y: 270, w: 190, h: 26, type: 'tropical', baseY: 270, moveY: true, rangeY: 55, speedY: 1.5, phase: 1.2 },
          { x: 2740, y: 210, w: 200, h: 26, type: 'cloud' },
          { x: 3800, y: 340, w: 180, h: 26, type: 'tropical', baseY: 340, moveY: true, rangeY: 50, speedY: 1.8, phase: 0.5 },
          { x: 4060, y: 260, w: 190, h: 26, type: 'cloud', baseX: 4060, moveX: true, rangeX: 90, speedX: 1.6, phase: Math.PI },
          { x: 4330, y: 200, w: 200, h: 26, type: 'tropical', baseY: 200, moveY: true, rangeY: 45, speedY: 1.6, phase: 0 },
          { x: 5430, y: 340, w: 190, h: 26, type: 'tropical', baseX: 5430, moveX: true, rangeX: 80, speedX: 1.7, phase: 1.0 },
          { x: 5700, y: 260, w: 200, h: 26, type: 'cloud' },
          { x: 5980, y: 340, w: 190, h: 26, type: 'tropical', baseY: 340, moveY: true, rangeY: 50, speedY: 1.5, phase: 0.3 }
        ];

        this.springs = [
          { x: 520, y: 418, w: 60, h: 22, timer: 0, power: -720, theme: 'tropical' },
          { x: 1980, y: 398, w: 60, h: 22, timer: 0, power: -730, theme: 'tropical' },
          { x: 3580, y: 408, w: 60, h: 22, timer: 0, power: -730, theme: 'tropical' },
          { x: 5180, y: 388, w: 60, h: 22, timer: 0, power: -740, theme: 'tropical' }
        ];

        const itemXs = [
          280, 520, 780, 1040, 1310, 1600, 1900, 2280,
          2550, 2820, 3140, 3480, 3880, 4140, 4420, 4750,
          5080, 5510, 5780, 6060, 6340, 6590, 6850, 7050
        ];
        this.cupcakes = itemXs.map((x, i) => ({
          x,
          y: 200 + (i % 2 === 0 ? -50 : 35) + Math.sin(x * 0.015) * 35,
          got: false
        }));

      } else if (city.id === 'santiago') {
        // NIVEL 4: SANTIAGO DE CHILE (8200 px · Andes Nevados, Costanera, Teleférico)
        this.platforms = [
          // Ruta de suelo continuo (Parque Bicentenario, Costanera, San Cristóbal, Cumbre Andina)
          { x: -50, y: 440, w: 1600, h: 110, type: 'ground' },
          { x: 1510, y: 410, w: 1610, h: 140, type: 'ground' },
          { x: 3080, y: 420, w: 1640, h: 130, type: 'ground' },
          { x: 4680, y: 410, w: 1700, h: 140, type: 'ground' },
          { x: 6340, y: 410, w: 1080, h: 140, type: 'ground' },
          { x: 7380, y: 430, w: 920, h: 120, type: 'ground' },
          // Cabinas móviles del teleférico y nubes andinas
          { x: 680, y: 360, w: 180, h: 28, type: 'teleferico', baseX: 680, moveX: true, rangeX: 95, speedX: 1.4, phase: 0 },
          { x: 960, y: 290, w: 180, h: 28, type: 'teleferico', baseY: 290, moveY: true, rangeY: 55, speedY: 1.5, phase: 0.6 },
          { x: 1240, y: 220, w: 190, h: 28, type: 'teleferico', baseX: 1240, moveX: true, rangeX: 100, speedX: 1.4, phase: Math.PI },
          { x: 2260, y: 340, w: 180, h: 28, type: 'teleferico', baseY: 340, moveY: true, rangeY: 60, speedY: 1.6, phase: 0.2 },
          { x: 2530, y: 260, w: 190, h: 28, type: 'teleferico', baseX: 2530, moveX: true, rangeX: 105, speedX: 1.5, phase: 1.4 },
          { x: 2810, y: 190, w: 190, h: 26, type: 'cloud' },
          { x: 3870, y: 340, w: 180, h: 28, type: 'teleferico', baseX: 3870, moveX: true, rangeX: 95, speedX: 1.7, phase: 2.2 },
          { x: 4140, y: 260, w: 190, h: 28, type: 'teleferico', baseY: 260, moveY: true, rangeY: 50, speedY: 1.5, phase: 0.5 },
          { x: 4410, y: 190, w: 200, h: 26, type: 'cloud' },
          { x: 5490, y: 330, w: 190, h: 28, type: 'teleferico', baseX: 5490, moveX: true, rangeX: 110, speedX: 1.6, phase: 0.9 },
          { x: 5770, y: 250, w: 190, h: 28, type: 'teleferico', baseY: 250, moveY: true, rangeY: 55, speedY: 1.7, phase: 1.6 },
          { x: 6050, y: 190, w: 210, h: 26, type: 'cloud', baseX: 6050, moveX: true, rangeX: 90, speedX: 1.5, phase: 0.2 },
          { x: 7100, y: 320, w: 200, h: 28, type: 'teleferico' }
        ];

        this.springs = [
          { x: 500, y: 418, w: 60, h: 22, timer: 0, power: -730, theme: 'teleferico' },
          { x: 2030, y: 388, w: 60, h: 22, timer: 0, power: -740, theme: 'teleferico' },
          { x: 3640, y: 398, w: 60, h: 22, timer: 0, power: -740, theme: 'teleferico' },
          { x: 5260, y: 388, w: 60, h: 22, timer: 0, power: -740, theme: 'teleferico' },
          { x: 6880, y: 388, w: 60, h: 22, timer: 0, power: -740, theme: 'teleferico' }
        ];

        const itemXs = [
          260, 520, 760, 1030, 1310, 1590, 1870, 2180,
          2430, 2710, 2980, 3280, 3590, 3960, 4220, 4490,
          4820, 5140, 5580, 5840, 6140, 6420, 6680, 6950,
          7210, 7470, 7720, 7920
        ];
        this.cupcakes = itemXs.map((x, i) => ({
          x,
          y: 190 + (i % 2 === 0 ? -55 : 40) + Math.sin(x * 0.016) * 35,
          got: false
        }));

      } else if (city.id === 'china') {
        // NIVEL 5: CHINA MÁGICA (9200 px · Gran Muralla, Pagodas, Bambú, Dragón)
        this.platforms = [
          // Ruta de suelo continuo (Puerta Imperial, Gran Muralla, Bosque de Bambú, Pagodas, Estanque Sagrado)
          { x: -50, y: 440, w: 1590, h: 110, type: 'ground' },
          { x: 1500, y: 410, w: 1650, h: 140, type: 'ground' },
          { x: 3110, y: 420, w: 1690, h: 130, type: 'ground' },
          { x: 4760, y: 410, w: 1740, h: 140, type: 'ground' },
          { x: 6460, y: 410, w: 1720, h: 140, type: 'ground' },
          { x: 8140, y: 430, w: 1160, h: 120, type: 'ground' },
          // Pagodas celestiales elevadas y nubes de dragón
          { x: 660, y: 360, w: 180, h: 26, type: 'pagoda', baseX: 660, moveX: true, rangeX: 100, speedX: 1.5, phase: 0 },
          { x: 940, y: 290, w: 190, h: 26, type: 'pagoda', baseY: 290, moveY: true, rangeY: 60, speedY: 1.7, phase: 0.8 },
          { x: 1220, y: 220, w: 200, h: 26, type: 'pagoda', baseX: 1220, moveX: true, rangeX: 110, speedX: 1.6, phase: Math.PI },
          { x: 2250, y: 340, w: 190, h: 26, type: 'pagoda', baseY: 340, moveY: true, rangeY: 60, speedY: 1.7, phase: 0.3 },
          { x: 2530, y: 260, w: 200, h: 26, type: 'pagoda', baseX: 2530, moveX: true, rangeX: 115, speedX: 1.7, phase: 1.5 },
          { x: 2820, y: 190, w: 210, h: 26, type: 'cloud' },
          { x: 3910, y: 340, w: 190, h: 26, type: 'pagoda', baseX: 3910, moveX: true, rangeX: 105, speedX: 1.8, phase: 2.1 },
          { x: 4190, y: 260, w: 190, h: 26, type: 'pagoda', baseY: 260, moveY: true, rangeY: 55, speedY: 1.6, phase: 0.9 },
          { x: 4470, y: 190, w: 210, h: 26, type: 'cloud' },
          { x: 5580, y: 330, w: 200, h: 26, type: 'pagoda', baseX: 5580, moveX: true, rangeX: 120, speedX: 1.7, phase: 1.1 },
          { x: 5870, y: 250, w: 200, h: 26, type: 'pagoda', baseY: 250, moveY: true, rangeY: 60, speedY: 1.8, phase: 0.5 },
          { x: 6160, y: 180, w: 220, h: 26, type: 'cloud', baseX: 6160, moveX: true, rangeX: 100, speedX: 1.6, phase: 2.0 },
          { x: 7260, y: 330, w: 200, h: 26, type: 'pagoda', baseX: 7260, moveX: true, rangeX: 110, speedX: 1.8, phase: 0.4 },
          { x: 7550, y: 250, w: 200, h: 26, type: 'pagoda', baseY: 250, moveY: true, rangeY: 55, speedY: 1.7, phase: 1.4 },
          { x: 7840, y: 190, w: 220, h: 26, type: 'cloud' }
        ];

        this.springs = [
          { x: 480, y: 418, w: 60, h: 22, timer: 0, power: -740, theme: 'lotus' },
          { x: 2020, y: 388, w: 60, h: 22, timer: 0, power: -750, theme: 'lotus' },
          { x: 3670, y: 398, w: 60, h: 22, timer: 0, power: -750, theme: 'lotus' },
          { x: 5320, y: 388, w: 60, h: 22, timer: 0, power: -750, theme: 'lotus' },
          { x: 7000, y: 388, w: 60, h: 22, timer: 0, power: -750, theme: 'lotus' },
          { x: 8020, y: 408, w: 60, h: 22, timer: 0, power: -750, theme: 'lotus' }
        ];

        const itemXs = [
          240, 490, 720, 980, 1260, 1530, 1820, 2120,
          2410, 2690, 2960, 3240, 3560, 3980, 4260, 4530,
          4880, 5200, 5660, 5940, 6240, 6520, 6810, 7120,
          7420, 7700, 7980, 8260, 8520, 8740, 8920, 9050
        ];
        this.cupcakes = itemXs.map((x, i) => ({
          x,
          y: 180 + (i % 2 === 0 ? -60 : 45) + Math.sin(x * 0.018) * 35,
          got: false
        }));
      }

      this.updateHUD();
      this.updateDOMCityPill();
    }

    updateDOMCityPill() {
      const city = CITIES[this.currentCityIdx];
      const pill = this.container ? this.container.querySelector('#platCityPill') : null;
      if (pill) {
        const badgeEl = pill.querySelector('.plat-city-badge');
        const textEl = pill.querySelector('#platCityNameText');
        if (badgeEl) badgeEl.textContent = city.flag;
        if (textEl) textEl.textContent = city.name;
      }
      const scorePill = this.container ? this.container.querySelector('.plat-score-pill .plat-cupcake-ico') : null;
      if (scorePill) scorePill.textContent = city.itemIcon;

      const progFlag = this.container ? this.container.querySelector('#platProgFlag') : null;
      if (progFlag) progFlag.textContent = city.flag;

      // Actualizar tarjeta activa en modal de ciudades
      if (this.container) {
        this.container.querySelectorAll('.plat-city-card').forEach((c, idx) => {
          if (idx === this.currentCityIdx) c.classList.add('active');
          else c.classList.remove('active');
        });
      }
    }

    jump() {
      if (A) A.unlock();
      if (this.container) {
        const vic = this.container.querySelector('#platVictoryScreen');
        if (vic && !vic.classList.contains('hidden')) {
          const btnNext = this.container.querySelector('#btnPlatNextCity');
          if (btnNext) btnNext.click();
          return;
        }
      }
      this.keys.jump = true;
      this.p.jumpBuffer = 0.22;
      this.tryJump();
    }

    tryJump() {
      const p = this.p;
      const hero = this.selectedHero;

      // 1. Salto desde el suelo o durante coyote time (generoso)
      if (p.grounded || p.coyoteTimer > 0) {
        p.vy = -hero.jumpPower;
        p.grounded = false;
        p.coyoteTimer = 0;
        p.jumpBuffer = 0;
        p.canDoubleJump = true; // recargar aleteo para el aire
        p.squashX = 0.72;
        p.squashY = 1.38;
        if (A) A.jump();
        this.burstParticles(p.x + p.w / 2, p.y + p.h, 12, ['#ffffff', hero.trailColor, '#ffeaf4']);
        return true;
      }

      // 2. Doble salto / Aleteo mágico con las orejitas en el aire
      if (p.canDoubleJump && p.vy > -240) {
        p.vy = -Math.round(hero.jumpPower * 0.94);
        p.canDoubleJump = false;
        p.jumpBuffer = 0;
        p.squashX = 0.76;
        p.squashY = 1.32;
        if (A) {
          A.softBoing();
          A.kawaiiChirp('cheer');
        }
        // Nubes esponjosas en las orejitas al aletear
        this.burstParticles(p.x + p.w / 2, p.y + p.h * 0.75, 16, ['#ffffff', '#aee0ff', hero.trailColor, '#ffd1dc']);
        return true;
      }

      return false;
    }

    bindInputs() {
      const onReleaseJump = () => {
        this.keys.jump = false;
        if (this.p && this.p.vy < -180) {
          this.p.vy *= 0.65;
        }
      };

      // Teclado global (registrar una sola vez para evitar saltos dobles acumulados)
      if (!this.keyboardBound) {
        this.keyboardBound = true;

        window.addEventListener('keydown', (e) => {
          if (!this.running) return;
          if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
          if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
          if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
            e.preventDefault();
            if (!e.repeat) this.jump();
          }
        });

        window.addEventListener('keyup', (e) => {
          if (!this.running) return;
          if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
          if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
          if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
            onReleaseJump();
          }
        });

        // Limpiar teclas si se pierde el foco de la ventana o pestaña (evita que se quede corriendo solo)
        const clearKeys = () => {
          this.keys.left = false;
          this.keys.right = false;
          this.keys.jump = false;
        };
        window.addEventListener('blur', clearKeys);
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) clearKeys();
        });
      }

      const btnL = this.container.querySelector('#btnPlatLeft');
      const btnR = this.container.querySelector('#btnPlatRight');
      const btnJ = this.container.querySelector('#btnPlatJump');

      const hookTouch = (el, pressFn, releaseFn) => {
        if (!el) return;
        el.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          try { el.setPointerCapture(e.pointerId); } catch (_) {}
          if (A) A.unlock();
          pressFn();
        });
        const onRelease = (e) => {
          try { el.releasePointerCapture(e.pointerId); } catch (_) {}
          releaseFn();
        };
        el.addEventListener('pointerup', onRelease);
        el.addEventListener('pointercancel', onRelease);
        // NOTA: Eliminamos pointerleave para que el deslizamiento mínimo del pulgar no cancele el movimiento
      };

      hookTouch(btnL, () => { this.keys.left = true; }, () => { this.keys.left = false; });
      hookTouch(btnR, () => { this.keys.right = true; }, () => { this.keys.right = false; });
      hookTouch(btnJ, () => {
        this.jump();
      }, onReleaseJump);

      if (this.canvas) {
        this.canvas.addEventListener('pointerdown', (e) => {
          const rect = this.canvas.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width * 0.45) {
            this.jump();
          }
        });
        this.canvas.addEventListener('pointerup', onReleaseJump);
        this.canvas.addEventListener('pointercancel', onReleaseJump);
      }
    }

    startLoop() {
      if (this.running) return;
      this.running = true;
      let lastTime = performance.now();

      const loop = (time) => {
        if (!this.running) return;
        const dt = Math.min(0.04, (time - lastTime) / 1000);
        lastTime = time;

        this.update(dt);
        this.draw();
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this.animId) cancelAnimationFrame(this.animId);
    }

    update(dt) {
      const p = this.p;
      const hero = this.selectedHero;
      this.levelTime += dt;

      // Actualizar plataformas móviles
      for (const plat of this.platforms) {
        if (plat.moveX) {
          const oldX = plat.x;
          plat.x = plat.baseX + Math.sin(this.levelTime * plat.speedX + (plat.phase || 0)) * plat.rangeX;
          plat.vx = (plat.x - oldX) / dt;
        }
        if (plat.moveY) {
          const oldY = plat.y;
          plat.y = plat.baseY + Math.sin(this.levelTime * plat.speedY + (plat.phase || 0)) * plat.rangeY;
          plat.vy = (plat.y - oldY) / dt;
        }
      }

      // Si el jugador está sobre una plataforma móvil, acompañar su movimiento
      if (p.grounded && p.standingPlat) {
        if (p.standingPlat.vx) p.x += p.standingPlat.vx * dt;
        if (p.standingPlat.vy) p.y += p.standingPlat.vy * dt;
      }

      // Movimiento horizontal con aceleración suave
      const maxSpeed = 330;
      const accel = 1800;
      const friction = p.grounded ? 1400 : 700;

      if (this.keys.left && !this.keys.right) {
        p.vx = Math.max(-maxSpeed, p.vx - accel * dt);
        p.facing = -1;
      } else if (this.keys.right && !this.keys.left) {
        p.vx = Math.min(maxSpeed, p.vx + accel * dt);
        p.facing = 1;
      } else {
        if (p.vx > 0) p.vx = Math.max(0, p.vx - friction * dt);
        else if (p.vx < 0) p.vx = Math.min(0, p.vx + friction * dt);
      }

      p.x += p.vx * dt;
      p.x = Math.max(0, Math.min(this.levelWidth - p.w, p.x));

      // Coyote time & Jump buffer
      if (p.grounded) {
        p.coyoteTimer = 0.20;
        p.canDoubleJump = true;
      } else {
        p.coyoteTimer -= dt;
      }

      if (p.jumpBuffer > 0) {
        p.jumpBuffer -= dt;
        if (this.tryJump()) {
          p.jumpBuffer = 0;
        }
      }

      // Mecánica de planeo suave con las orejitas
      p.gliding = !p.grounded && p.vy > 30 && this.keys.jump;

      // Gravedad
      const gravity = p.gliding ? hero.glideGravity : 740;
      p.vy += gravity * dt;

      // Estela de chispitas al planear
      if (p.gliding) {
        if (Math.random() < 0.45) {
          this.particles.push({
            x: p.x + (p.facing > 0 ? 8 : p.w - 8),
            y: p.y + p.h * 0.4,
            vx: -p.facing * 40 + (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 30,
            color: hero.trailColor,
            size: 3 + Math.random() * 4,
            alpha: 0.9
          });
        }
      }
      p.y += p.vy * dt;

      // Squash & Stretch
      p.squashX += (1.0 - p.squashX) * Math.min(1, dt * 10);
      p.squashY += (1.0 - p.squashY) * Math.min(1, dt * 10);

      // Animación de pasos
      if (p.grounded && Math.abs(p.vx) > 10) {
        p.animTimer += dt * 12;
      } else {
        p.animTimer += dt * 5;
      }

      // Colisión con plataformas
      p.wasGrounded = p.grounded;
      p.grounded = false;
      let matchedPlat = null;

      for (const plat of this.platforms) {
        if (
          p.x + p.w * 0.7 > plat.x &&
          p.x + p.w * 0.3 < plat.x + plat.w &&
          p.y + p.h >= plat.y &&
          p.y + p.h <= plat.y + 28 &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.grounded = true;
          matchedPlat = plat;

          if (!p.wasGrounded) {
            p.squashX = 1.25;
            p.squashY = 0.78;
            A.softBoing();
            this.burstParticles(p.x + p.w / 2, p.y + p.h, 6, ['#ffffff', hero.trailColor]);
          }
          if (plat.type === 'ground' || plat.w >= 260) {
            if (p.x >= plat.x + 40 && p.x + p.w <= plat.x + plat.w - 40) {
              p.lastSafeX = p.x;
              p.lastSafeY = plat.y - p.h;
            }
          }
        }
      }
      p.standingPlat = matchedPlat;

      // Colisión con trampolines
      for (const sp of this.springs) {
        if (sp.timer > 0) sp.timer -= dt;
        if (
          p.x + p.w * 0.7 > sp.x &&
          p.x + p.w * 0.3 < sp.x + sp.w &&
          p.y + p.h >= sp.y &&
          p.y + p.h <= sp.y + 24 &&
          p.vy >= 0
        ) {
          p.vy = sp.power || -720;
          p.grounded = false;
          sp.timer = 0.35;
          p.squashX = 0.75;
          p.squashY = 1.35;
          A.softBoing();
          A.kawaiiChirp('cheer');
          this.burstParticles(sp.x + sp.w / 2, sp.y, 16, ['#ff8fbf', '#ffe066', '#ffffff']);
        }
      }

      // Recolección de dulces
      for (const cp of this.cupcakes) {
        if (!cp.got && Math.hypot((p.x + p.w / 2) - cp.x, (p.y + p.h / 2) - cp.y) < 46) {
          cp.got = true;
          this.score++;
          A.collect(this.score);
          this.burstParticles(cp.x, cp.y, 16, ['#ff6b9d', '#ffe066', '#ffffff']);
          this.updateHUD();
        }
      }

      // Rescate mágico si cae (Amanda nunca pierde: regresa suavemente a la última plataforma segura)
      if (p.y > 515) {
        p.x = (p.lastSafeX !== undefined) ? p.lastSafeX : 80;
        p.y = (p.lastSafeY !== undefined) ? p.lastSafeY : 350;
        p.vx = 0;
        p.vy = 0;
        p.grounded = true;
        p.canDoubleJump = true;
        if (A) A.whoosh(true);
        this.burstParticles(p.x + p.w / 2, p.y + p.h / 2, 20, ['#aee0ff', '#ffffff', '#ffd1dc', '#fde047']);
      }

      // Meta al final del nivel
      if (p.x >= this.levelWidth - 520 && !this.reachedGoal) {
        this.reachedGoal = true;
        this.triggerVictory();
      }

      // Cámara suave que sigue al jugador
      const targetCamX = p.x - VW * 0.35;
      this.camX += (targetCamX - this.camX) * 0.12;
      this.camX = Math.max(0, Math.min(this.levelWidth - VW, this.camX));

      // Partículas
      for (const pt of this.particles) {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.alpha -= dt * 1.5;
      }
      this.particles = this.particles.filter(pt => pt.alpha > 0);

      // Partículas ambientales de fondo
      for (const ap of this.ambientPetals) {
        ap.x += (ap.vx - this.p.vx * 0.25) * dt;
        ap.y += ap.vy * dt;
        ap.angle += ap.spin * dt;
        if (ap.y > VH + 20) ap.y = -20;
        if (ap.x > VW + 30) ap.x = -30;
        else if (ap.x < -30) ap.x = VW + 30;
      }

      // Actualizar Jugadores Cooperativos (P2 y P3)
      for (const slot of [2, 3]) {
        const cp = this.coPlayers && this.coPlayers[slot];
        if (!cp || !cp.active) continue;
        const ch = cp.hero || HEROES[0];

        if (cp.keys.left && !cp.keys.right) {
          cp.vx = Math.max(-330, cp.vx - 1800 * dt);
          cp.facing = -1;
        } else if (cp.keys.right && !cp.keys.left) {
          cp.vx = Math.min(330, cp.vx + 1800 * dt);
          cp.facing = 1;
        } else {
          const fr = cp.grounded ? 1400 : 700;
          if (cp.vx > 0) cp.vx = Math.max(0, cp.vx - fr * dt);
          else if (cp.vx < 0) cp.vx = Math.min(0, cp.vx + fr * dt);
        }

        cp.x += cp.vx * dt;
        cp.x = Math.max(0, Math.min(this.levelWidth - cp.w, cp.x));

        if (cp.grounded) {
          cp.coyoteTimer = 0.20;
          cp.canDoubleJump = true;
        } else {
          cp.coyoteTimer -= dt;
        }

        cp.gliding = !cp.grounded && cp.vy > 30 && cp.keys.jump;
        cp.vy += (cp.gliding ? ch.glideGravity : 740) * dt;
        cp.y += cp.vy * dt;

        cp.squashX += (1.0 - cp.squashX) * Math.min(1, dt * 10);
        cp.squashY += (1.0 - cp.squashY) * Math.min(1, dt * 10);
        cp.animTimer += dt * (cp.grounded && Math.abs(cp.vx) > 10 ? 12 : 5);

        cp.grounded = false;
        for (const plat of this.platforms) {
          if (
            cp.x + cp.w * 0.7 > plat.x &&
            cp.x + cp.w * 0.3 < plat.x + plat.w &&
            cp.y + cp.h >= plat.y &&
            cp.y + cp.h <= plat.y + 28 &&
            cp.vy >= 0
          ) {
            cp.y = plat.y - cp.h;
            cp.vy = 0;
            cp.grounded = true;
            if (plat.vx) cp.x += plat.vx * dt;
            if (plat.vy) cp.y += plat.vy * dt;
          }
        }

        for (const sp of this.springs) {
          if (
            cp.x + cp.w * 0.7 > sp.x &&
            cp.x + cp.w * 0.3 < sp.x + sp.w &&
            cp.y + cp.h >= sp.y &&
            cp.y + cp.h <= sp.y + 24 &&
            cp.vy >= 0
          ) {
            cp.vy = sp.power || -720;
            cp.grounded = false;
            sp.timer = 0.35;
            if (A) A.softBoing();
          }
        }

        for (const cup of this.cupcakes) {
          if (!cup.got && Math.hypot((cp.x + cp.w / 2) - cup.x, (cp.y + cp.h / 2) - cup.y) < 46) {
            cup.got = true;
            this.score++;
            if (A) A.collect(this.score);
            this.burstParticles(cup.x, cup.y, 14, ['#ff6b9d', '#ffe066', cp.badgeColor]);
            this.updateHUD();
          }
        }

        // Burbuja de rescate cooperativo si cae o se aleja demasiado de la cámara
        if (cp.y > 515 || Math.abs(cp.x - p.x) > 560) {
          cp.x = Math.max(20, p.x - 36 * (slot - 1));
          cp.y = p.y - 16;
          cp.vx = 0;
          cp.vy = 0;
          cp.grounded = true;
          this.burstParticles(cp.x + cp.w / 2, cp.y + cp.h / 2, 14, ['#ffffff', cp.badgeColor, '#fde047']);
        }
      }

      // Actualizar progreso continuo en el HUD
      this.updateProgressTrack();
    }

    triggerVictory() {
      A.celebrate();
      const city = CITIES[this.currentCityIdx];
      const victoryScreen = this.container.querySelector('#platVictoryScreen');
      if (victoryScreen) {
        const ribbon = victoryScreen.querySelector('#platVictoryRibbon');
        const title = victoryScreen.querySelector('#platVictoryTitle');
        const msg = victoryScreen.querySelector('#platVictoryMsg');
        const starsEl = victoryScreen.querySelector('#platVictoryStars');
        const stampEl = victoryScreen.querySelector('#platPassportStamp strong');
        const btnNext = victoryScreen.querySelector('#btnPlatNextCity');

        if (ribbon) ribbon.textContent = `🎉 ¡LLEGASTE A LA META EN ${city.name.toUpperCase()}! 🎉`;
        if (title) title.textContent = `¡Amanda completó ${city.name} con ${this.score} de ${city.totalItems} ${city.itemName}!`;
        if (msg) msg.textContent = `¡Los amigos de Sanrio están felices de haber viajado contigo a ${city.name}, ${city.country}! 💖`;

        const pct = this.score / city.totalItems;
        window.Cinnamo?.passport?.addStars?.(pct >= 0.8 ? 3 : pct >= 0.5 ? 2 : 1, 'platformer');
        if (starsEl) {
          if (pct >= 0.8) starsEl.textContent = '⭐⭐⭐ ¡Puntaje Perfecto!';
          else if (pct >= 0.5) starsEl.textContent = '⭐⭐ ¡Súper Exploradora!';
          else starsEl.textContent = '⭐ ¡Buen Viaje!';
        }
        if (stampEl) stampEl.textContent = `SELLO OFICIAL: ${city.name.toUpperCase()} ✈️`;

        if (btnNext) {
          const isLast = (this.currentCityIdx === CITIES.length - 1);
          if (isLast) {
            btnNext.textContent = '🏆 ¡Gira Mundial Completada! (Volver al inicio)';
          } else {
            const nextCity = CITIES[this.currentCityIdx + 1];
            btnNext.textContent = `▶ Siguiente: ${nextCity.flag} ${nextCity.name}`;
          }
        }
        victoryScreen.classList.remove('hidden');
      }
    }

    burstParticles(x, y, count, colors) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 50 + Math.random() * 140;
        this.particles.push({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 40,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 5,
          alpha: 1
        });
      }
    }

    updateHUD() {
      const city = CITIES[this.currentCityIdx];
      const el = this.container ? this.container.querySelector('#platScoreNum') : null;
      if (el) el.textContent = `${this.score} / ${city.totalItems}`;
      this.updateProgressTrack();
    }

    updateProgressTrack() {
      if (!this.container) return;
      const fillEl = this.container.querySelector('#platProgressFill');
      const avatarEl = this.container.querySelector('#platProgressAvatar');
      const ratio = Math.max(0, Math.min(1, this.p.x / (this.levelWidth - 520)));
      const pct = (ratio * 100).toFixed(1);
      if (fillEl) fillEl.style.width = `${pct}%`;
      if (avatarEl) avatarEl.style.left = `calc(${pct}% - 14px)`;
    }

    /* -------------------------------------------------------------
       DIBUJO DE ESCENARIOS, CIUDADES Y MONUMENTOS EMBLEMÁTICOS
       ------------------------------------------------------------- */
    draw() {
      const ctx = this.ctx;
      const city = CITIES[this.currentCityIdx];
      ctx.clearRect(0, 0, VW, VH);

      // 1. Cielo en degradé de la ciudad
      const sky = ctx.createLinearGradient(0, 0, 0, VH);
      sky.addColorStop(0, city.skyGradient[0]);
      sky.addColorStop(0.5, city.skyGradient[1]);
      sky.addColorStop(1, city.skyGradient[2]);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, VW, VH);

      // 2. PARALAJE CAPA 1: Monumentos y Siluetas Lejanas (0.15x velocidad)
      ctx.save();
      ctx.translate(-this.camX * 0.15, 0);

      this.drawFarLandmarks(ctx, city);

      // Nubes decorativas lejanas con sombra esponjosa
      for (const cl of this.sceneryClouds) {
        this.drawFluffyCloud(ctx, cl.x, cl.y, cl.w);
      }
      ctx.restore();

      // 3. PARALAJE CAPA 2: Media Distancia Específica (0.42x velocidad)
      ctx.save();
      ctx.translate(-this.camX * 0.42, 0);
      this.drawMidScenery(ctx, city);
      ctx.restore();

      // 4. MUNDO PRINCIPAL (1.0x velocidad de juego)
      ctx.save();
      ctx.translate(-this.camX, 0);

      // Detalles artísticos del suelo por ciudad (flores, caracolas, olas, linternas)
      this.drawGroundDetails(ctx, city);

      // Plataformas
      this.drawPlatforms(ctx, city);

      // Trampolines
      this.drawSprings(ctx, city);

      // Coleccionables temáticos vectoriales de alta definición
      this.drawCollectibles(ctx, city);

      // Gran Arco Triunfal y Picnic de Meta con los Amigos de Sanrio
      this.drawGoalPicnic(ctx, city);

      // 5A. JUGADORES COOPERATIVOS ADICIONALES (P2 y P3)
      const anyCoActive = (this.coPlayers?.[2]?.active || this.coPlayers?.[3]?.active);
      for (const slot of [2, 3]) {
        const cp = this.coPlayers && this.coPlayers[slot];
        if (!cp || !cp.active) continue;
        ctx.save();
        const cWalk = cp.grounded && Math.abs(cp.vx) > 10 ? Math.sin(cp.animTimer) * 4 : 0;
        const cTilt = cp.gliding ? Math.sin(cp.animTimer * 1.6) * 0.12 : 0;
        ctx.translate(cp.x + cp.w / 2, cp.y + cp.h / 2 + cWalk);
        ctx.scale(cp.facing * cp.squashX, cp.squashY);
        ctx.rotate(cTilt);
        const cImg = this.heroImages[cp.heroId];
        if (cImg && cImg.complete) {
          ctx.drawImage(cImg, -cp.w / 2, -cp.h / 2, cp.w, cp.h);
        }
        ctx.restore();

        // Etiqueta flotante P2 / P3
        ctx.save();
        ctx.fillStyle = cp.badgeColor;
        ctx.beginPath();
        ctx.roundRect(cp.x + cp.w / 2 - 22, cp.y - 22, 44, 18, 9);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 11px "Baloo 2", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cp.label, cp.x + cp.w / 2, cp.y - 9);
        ctx.restore();
      }

      // 5B. PERSONAJE JUGADOR PRINCIPAL (P1)
      ctx.save();
      const hero = this.selectedHero;
      const p = this.p;

      const walkBob = p.grounded && Math.abs(p.vx) > 10 ? Math.sin(p.animTimer) * 4 : 0;
      const tilt = p.gliding
        ? Math.sin(p.animTimer * 1.6) * 0.12
        : (p.grounded ? p.facing * Math.min(0.08, Math.abs(p.vx) * 0.0003) : (p.vy > 0 ? 0.08 : -0.08));

      ctx.translate(p.x + p.w / 2, p.y + p.h / 2 + walkBob);
      ctx.scale(p.facing * p.squashX, p.squashY);
      ctx.rotate(tilt);

      const charImg = this.heroImages[hero.id];
      if (charImg && charImg.complete) {
        ctx.drawImage(charImg, -p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();

      if (anyCoActive) {
        ctx.save();
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.roundRect(p.x + p.w / 2 - 22, p.y - 22, 44, 18, 9);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 11px "Baloo 2", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('P1 🌸', p.x + p.w / 2, p.y - 9);
        ctx.restore();
      }

      // 6. PARTÍCULAS DEL JUGADOR
      for (const pt of this.particles) {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      // 7. PARTÍCULAS AMBIENTALES DE PRIMER PLANO (Pétalos, brisa, chispitas)
      this.drawAmbientForeground(ctx, city);
    }

    drawFluffyCloud(ctx, x, y, w) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(x, y, w * 0.28, 0, Math.PI * 2);
      ctx.arc(x + w * 0.28, y - w * 0.14, w * 0.36, 0, Math.PI * 2);
      ctx.arc(x + w * 0.58, y, w * 0.26, 0, Math.PI * 2);
      ctx.fill();

      // Sombra pastel inferior
      ctx.fillStyle = 'rgba(254, 215, 226, 0.35)';
      ctx.beginPath();
      ctx.arc(x + w * 0.28, y + w * 0.1, w * 0.28, 0, Math.PI);
      ctx.fill();
      ctx.restore();
    }

    drawAmbientForeground(ctx, city) {
      ctx.save();
      for (const ap of this.ambientPetals) {
        ctx.save();
        ctx.translate(ap.x, ap.y);
        ctx.rotate(ap.angle);

        if (city.id === 'concepcion') {
          // Pétalos de cerezo rosa (Sakura)
          ctx.fillStyle = 'rgba(251, 207, 232, 0.75)';
          ctx.beginPath();
          ctx.ellipse(0, 0, ap.size, ap.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (city.id === 'laserena') {
          // Destellos marinos dorados
          ctx.fillStyle = 'rgba(254, 240, 138, 0.65)';
          ctx.beginPath();
          ctx.arc(0, 0, ap.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else if (city.id === 'rio') {
          // Confeti de carnaval tropical
          ctx.fillStyle = (ap.size > 6) ? 'rgba(244, 114, 182, 0.75)' : 'rgba(56, 189, 248, 0.75)';
          ctx.fillRect(-ap.size / 2, -ap.size / 2, ap.size, ap.size * 0.6);
        } else if (city.id === 'santiago') {
          // Chispitas de nieve andina
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(0, 0, ap.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (city.id === 'china') {
          // Chispitas de linterna dorada
          ctx.fillStyle = 'rgba(253, 224, 71, 0.75)';
          ctx.beginPath();
          ctx.arc(0, 0, ap.size * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();
    }

    /* -------------------------------------------------------------
       MONUMENTOS LEJANOS (PARALAJE PROFUNDO 0.15x)
       ------------------------------------------------------------- */
    drawFarLandmarks(ctx, city) {
      if (city.id === 'concepcion') {
        // Colinas verdes suaves del Cerro Caracol
        const hillGrad = ctx.createLinearGradient(0, 360, 0, 520);
        hillGrad.addColorStop(0, 'rgba(167, 243, 208, 0.65)');
        hillGrad.addColorStop(1, 'rgba(110, 231, 183, 0.85)');
        ctx.fillStyle = hillGrad;
        for (let x = -200; x < this.levelWidth * 0.45 + 500; x += 440) {
          ctx.beginPath();
          ctx.arc(x, 530, 280, 0, Math.PI * 2);
          ctx.fill();
        }

        // Río Biobío amplio con reflejos
        const riverGrad = ctx.createLinearGradient(0, 460, 0, 520);
        riverGrad.addColorStop(0, 'rgba(125, 211, 252, 0.6)');
        riverGrad.addColorStop(1, 'rgba(56, 189, 248, 0.75)');
        ctx.fillStyle = riverGrad;
        ctx.fillRect(-200, 460, this.levelWidth * 0.5, 60);

        // Campanil UdeC & Arco de Medicina a lo largo del recorrido
        for (let x = 400; x < this.levelWidth * 0.4; x += 1350) {
          this.drawCampanilUdeC(ctx, x, 140);
          this.drawArcoMedicina(ctx, x + 520, 270);
          this.drawRioBiobioBridge(ctx, x + 850, 430);
        }

      } else if (city.id === 'laserena') {
        // Sol poniente dorado
        const sunGrad = ctx.createRadialGradient(680, 200, 10, 680, 200, 95);
        sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
        sunGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.45)');
        sunGrad.addColorStop(1, 'rgba(251, 207, 232, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(680, 200, 95, 0, Math.PI * 2);
        ctx.fill();

        // Océano Pacífico en 3 capas de olas
        this.drawOceanWaves(ctx, -200, 420, this.levelWidth * 0.5);

        // El Faro Monumental de La Serena
        for (let x = 450; x < this.levelWidth * 0.45; x += 1400) {
          this.drawFaroLaSerena(ctx, x, 160);
        }

      } else if (city.id === 'rio') {
        // Bahía de Guanabara
        const seaGrad = ctx.createLinearGradient(0, 440, 0, 520);
        seaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
        seaGrad.addColorStop(1, 'rgba(2, 132, 199, 0.75)');
        ctx.fillStyle = seaGrad;
        ctx.fillRect(-200, 440, this.levelWidth * 0.5, 80);

        // Morros tropicales, Pan de Azúcar y Cristo Redentor
        for (let x = 320; x < this.levelWidth * 0.45; x += 1450) {
          this.drawPaoDeAcucar(ctx, x, 180);
          this.drawCristoRedentor(ctx, x + 620, 120);
        }

      } else if (city.id === 'santiago') {
        // Cordillera de los Andes con 3 capas de picos nevados
        for (let x = -200; x < this.levelWidth * 0.45 + 500; x += 960) {
          this.drawAndesSnowMountains(ctx, x, 90);
        }
        // Gran Torre Costanera & Cerro San Cristóbal
        for (let x = 520; x < this.levelWidth * 0.45; x += 1450) {
          this.drawGranTorreCostanera(ctx, x, 110);
        }

      } else if (city.id === 'china') {
        // Montañas kársticas místicas estilo Shan Shui
        const mistGrad = ctx.createLinearGradient(0, 320, 0, 520);
        mistGrad.addColorStop(0, 'rgba(254, 202, 202, 0.5)');
        mistGrad.addColorStop(1, 'rgba(253, 230, 138, 0.7)');
        ctx.fillStyle = mistGrad;
        for (let x = -200; x < this.levelWidth * 0.45 + 500; x += 400) {
          ctx.beginPath();
          ctx.arc(x, 510, 260, 0, Math.PI * 2);
          ctx.fill();
        }

        // Gran Muralla & Pagodas Imperiales
        for (let x = 360; x < this.levelWidth * 0.45; x += 1300) {
          this.drawGranMuralla(ctx, x, 210);
          this.drawPagodaImperial(ctx, x + 540, 150);
        }
      }
    }

    /* -------------------------------------------------------------
       PLANO MEDIO (PARALAJE MEDIO 0.42x)
       ------------------------------------------------------------- */
    drawMidScenery(ctx, city) {
      if (city.id === 'concepcion') {
        // Cerezos en flor (sakura) del campus y faroles antiguos
        for (let x = 160; x < this.levelWidth * 0.65; x += 360) {
          this.drawSakuraCherryTrees(ctx, x, 360);
        }
      } else if (city.id === 'laserena') {
        // Palmeras de Avenida del Mar y gaviotas marinas
        for (let x = 140; x < this.levelWidth * 0.65; x += 380) {
          this.drawCoastalPalms(ctx, x, 340);
        }
        for (let x = 300; x < this.levelWidth * 0.65; x += 550) {
          this.drawSeagull(ctx, x, 180 + Math.sin(x) * 30);
        }
      } else if (city.id === 'rio') {
        // Selva de Tijuca, palmeras imperiales y flores gigantes
        for (let x = 180; x < this.levelWidth * 0.65; x += 360) {
          this.drawTropicalCanopy(ctx, x, 360);
        }
      } else if (city.id === 'santiago') {
        // Línea del Teleférico San Cristóbal con cabinas animadas
        for (let x = 220; x < this.levelWidth * 0.65; x += 580) {
          this.drawTelefericoCable(ctx, x, 200);
        }
        // Araucarias milenarias andinas
        for (let x = 120; x < this.levelWidth * 0.65; x += 440) {
          this.drawAraucariaTree(ctx, x, 340);
        }
      } else if (city.id === 'china') {
        // Cañas de bambú verde y linternas imperiales colgantes
        for (let x = 180; x < this.levelWidth * 0.65; x += 340) {
          this.drawBambooGrove(ctx, x, 320);
          this.drawHangingLantern(ctx, x + 90, 230);
        }
      }
    }

    /* -------------------------------------------------------------
       ARTE VECTORIAL DE MONUMENTOS (DETALLE Y ALTA FIDELIDAD)
       ------------------------------------------------------------- */

    /* 1. Concepción: Campanil UdeC */
    drawCampanilUdeC(ctx, x, y) {
      ctx.save();
      // Sombra proyectada suave
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(x - 6, y + 230, 68, 12);

      // Torre central de granito crema
      const towerGrad = ctx.createLinearGradient(x, y, x + 56, y);
      towerGrad.addColorStop(0, '#ffffff');
      towerGrad.addColorStop(0.7, '#f8fafc');
      towerGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = towerGrad;
      ctx.fillRect(x, y + 50, 56, 185);

      // Molduras horizontales y cornisas
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x - 4, y + 50, 64, 8);
      ctx.fillRect(x - 4, y + 115, 64, 7);
      ctx.fillRect(x - 4, y + 175, 64, 7);

      // Base con portal arqueado
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(x + 28, y + 215, 12, Math.PI, 0);
      ctx.lineTo(x + 40, y + 235);
      ctx.lineTo(x + 16, y + 235);
      ctx.closePath();
      ctx.fill();

      // Ventanales del campanario con arcos romanos
      ctx.fillStyle = '#64748b';
      for (let i = 0; i < 2; i++) {
        const wx = x + 10 + i * 22;
        ctx.beginPath();
        ctx.arc(wx + 7, y + 72, 7, Math.PI, 0);
        ctx.lineTo(wx + 14, y + 105);
        ctx.lineTo(wx, y + 105);
        ctx.closePath();
        ctx.fill();

        // Campana dorada visible en el interior
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(wx + 7, y + 84, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#64748b';
      }

      // Reloj oficial del Campanil UdeC
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 28, y + 145, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Manecillas del reloj
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 28, y + 145);
      ctx.lineTo(x + 28, y + 134);
      ctx.moveTo(x + 28, y + 145);
      ctx.lineTo(x + 36, y + 145);
      ctx.stroke();

      // Cúpula superior piramidal con pátina de cobre
      const roofGrad = ctx.createLinearGradient(x, y, x + 56, y);
      roofGrad.addColorStop(0, '#34d399');
      roofGrad.addColorStop(1, '#059669');
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(x - 2, y + 50);
      ctx.lineTo(x + 28, y - 6);
      ctx.lineTo(x + 58, y + 50);
      ctx.closePath();
      ctx.fill();

      // Aguja y veleta dorada
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 28, y - 6);
      ctx.lineTo(x + 28, y - 24);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x + 28, y - 24, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* Arco de Medicina UdeC */
    drawArcoMedicina(ctx, x, y) {
      ctx.save();
      // Columnata clásica
      ctx.fillStyle = '#f1f5f9';
      for (let c = 0; c < 6; c++) {
        const cx = x + c * 32;
        ctx.fillRect(cx, y + 30, 14, 75);
        // Capitel y basa
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(cx - 2, y + 26, 18, 5);
        ctx.fillRect(cx - 2, y + 102, 18, 5);
        ctx.fillStyle = '#f1f5f9';
      }

      // Entablamento y dintel
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x - 10, y + 20, 194, 8);

      // Frontis semicircular monumental con relieve
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(x + 87, y + 20, 84, Math.PI, 0);
      ctx.fill();

      // Relieve escultórico estilizado en el frontis
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(x + 87, y - 20, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x + 52, y - 10, 70, 8);
      ctx.restore();
    }

    /* Río Biobío y Puente Colgante Llacolén */
    drawRioBiobioBridge(ctx, x, y) {
      ctx.save();
      // Pilares de hormigón del puente
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x, y - 10, 12, 40);
      ctx.fillRect(x + 140, y - 10, 12, 40);

      // Tablero del puente
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x - 40, y + 12, 240, 6);

      // Tensores y cables atirantados
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 6, y - 10);
        ctx.lineTo(x - 30 + i * 20, y + 12);
        ctx.moveTo(x + 146, y - 10);
        ctx.lineTo(x + 110 + i * 20, y + 12);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* Árboles de cerezo sakura de Concepción */
    drawSakuraCherryTrees(ctx, x, y) {
      ctx.save();
      // Tronco curvado
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(x, y + 80);
      ctx.quadraticCurveTo(x + 10, y + 40, x - 5, y);
      ctx.stroke();

      // Copa esponjosa en nubes rosas
      const sakuraGrad = ctx.createRadialGradient(x, y, 10, x, y, 55);
      sakuraGrad.addColorStop(0, '#fbcfe8');
      sakuraGrad.addColorStop(0.7, '#f472b6');
      sakuraGrad.addColorStop(1, '#ec4899');
      ctx.fillStyle = sakuraGrad;

      ctx.beginPath();
      ctx.arc(x - 22, y - 10, 28, 0, Math.PI * 2);
      ctx.arc(x + 18, y - 18, 34, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 36, 30, 0, Math.PI * 2);
      ctx.arc(x - 32, y - 30, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* 2. La Serena: Faro Monumental Colonial */
    drawFaroLaSerena(ctx, x, y) {
      ctx.save();
      // Base cuadrangular fortificada con almenas coloniales
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 8, y + 150, 96, 60);

      // Muro perimetral almenado
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x - 12, y + 146, 104, 8);
      for (let m = 0; m < 5; m++) {
        ctx.fillRect(x - 8 + m * 22, y + 138, 12, 10);
      }

      // Torre central blanca y roja
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 10, y + 30, 60, 120);

      // Franjas rojas carmesí tradicionales
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 10, y + 55, 60, 20);
      ctx.fillRect(x + 10, y + 100, 60, 20);

      // Balcón superior con barandilla
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 4, y + 26, 72, 6);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      for (let b = 0; b < 6; b++) {
        ctx.beginPath();
        ctx.moveTo(x + 8 + b * 12, y + 26);
        ctx.lineTo(x + 8 + b * 12, y + 18);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 18);
      ctx.lineTo(x + 74, y + 18);
      ctx.stroke();

      // Linterna del faro iluminada
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 40, y + 10, 16, 0, Math.PI * 2);
      ctx.fill();

      // Cúpula cónica del faro
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(x + 22, y + 8);
      ctx.lineTo(x + 40, y - 14);
      ctx.lineTo(x + 58, y + 8);
      ctx.closePath();
      ctx.fill();

      // Haz de luz giratorio del Faro de La Serena
      ctx.save();
      const lightAngle = Math.sin(this.levelTime * 1.5) * 0.4;
      ctx.translate(x + 40, y + 10);
      ctx.rotate(lightAngle);

      const beamGrad = ctx.createRadialGradient(0, 0, 5, 260, 0, 260);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      beamGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.35)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = beamGrad;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(320, -50);
      ctx.lineTo(320, 50);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    /* Olas del Océano Pacífico */
    drawOceanWaves(ctx, x, y, width) {
      ctx.save();
      // Capa de agua profunda
      ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.fillRect(x, y, width, 100);

      // Olas con crestas animadas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      const waveOffset = Math.sin(this.levelTime * 2.5) * 12;
      for (let wx = x; wx < x + width; wx += 90) {
        ctx.arc(wx + 45 + waveOffset, y + 6, 26, Math.PI, 0);
      }
      ctx.lineTo(x + width, y + 20);
      ctx.lineTo(x, y + 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    /* Palmeras playeras de La Serena */
    drawCoastalPalms(ctx, x, y) {
      ctx.save();
      // Tronco curvado con textura de corteza
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(x, y + 100);
      ctx.quadraticCurveTo(x + 18, y + 45, x, y);
      ctx.stroke();

      // Frondas verdes radiantes
      ctx.fillStyle = '#22c55e';
      for (let a = 0; a < 7; a++) {
        const ang = (a / 7) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(ang) * 32, y + Math.sin(ang) * 18, 30, 11, ang, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cocos / dátiles
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(x - 4, y + 4, 5, 0, Math.PI * 2);
      ctx.arc(x + 4, y + 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawSeagull(ctx, x, y) {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      const flap = Math.sin(this.levelTime * 6 + x) * 6;
      ctx.beginPath();
      ctx.moveTo(x - 14, y + flap);
      ctx.quadraticCurveTo(x - 7, y - 6, x, y);
      ctx.quadraticCurveTo(x + 7, y - 6, x + 14, y + flap);
      ctx.stroke();
      ctx.restore();
    }

    /* 3. Río de Janeiro: Cristo Redentor & Pan de Azúcar */
    drawPaoDeAcucar(ctx, x, y) {
      ctx.save();
      // Morro de granito macizo
      const rockGrad = ctx.createLinearGradient(x, y, x + 160, y + 140);
      rockGrad.addColorStop(0, '#64748b');
      rockGrad.addColorStop(0.5, '#475569');
      rockGrad.addColorStop(1, '#334155');
      ctx.fillStyle = rockGrad;

      ctx.beginPath();
      ctx.ellipse(x + 80, y + 110, 95, 120, 0, Math.PI, 0);
      ctx.fill();

      // Vegetación selvática en la cima
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(x + 80, y + 25, 65, 30, 0, Math.PI, 0);
      ctx.fill();

      // Cable del teleférico (Bondinho)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 90, y + 40);
      ctx.lineTo(x + 240, y + 30);
      ctx.stroke();

      // Cabina amarilla del Bondinho
      const tramX = x + 30 + Math.sin(this.levelTime * 0.8) * 60;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.roundRect(tramX, y + 32, 28, 20, 6);
      ctx.fill();
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(tramX + 4, y + 36, 20, 8);
      ctx.restore();
    }

    drawCristoRedentor(ctx, x, y) {
      ctx.save();
      // Cerro Corcovado verde escarpado
      const hillGrad = ctx.createLinearGradient(x, y, x, y + 200);
      hillGrad.addColorStop(0, '#15803d');
      hillGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = hillGrad;

      ctx.beginPath();
      ctx.moveTo(x - 90, y + 220);
      ctx.lineTo(x, y + 55);
      ctx.lineTo(x + 90, y + 220);
      ctx.closePath();
      ctx.fill();

      // Pedestal de piedra
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x - 14, y + 44, 28, 14);

      // Halo de luz suave
      const aura = ctx.createRadialGradient(x, y + 20, 5, x, y + 20, 60);
      aura.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(x, y + 20, 60, 0, Math.PI * 2);
      ctx.fill();

      // Estatua blanca del Cristo con túnica y brazos abiertos
      ctx.fillStyle = '#ffffff';
      // Túnica
      ctx.beginPath();
      ctx.moveTo(x - 10, y + 44);
      ctx.lineTo(x - 7, y + 16);
      ctx.lineTo(x + 7, y + 16);
      ctx.lineTo(x + 10, y + 44);
      ctx.closePath();
      ctx.fill();

      // Brazos extendidos bendiciendo
      ctx.fillRect(x - 42, y + 17, 84, 8);

      // Cabeza
      ctx.beginPath();
      ctx.arc(x, y + 10, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawTropicalCanopy(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(x, y, 45, 0, Math.PI * 2);
      ctx.arc(x + 35, y - 10, 40, 0, Math.PI * 2);
      ctx.arc(x - 30, y - 15, 38, 0, Math.PI * 2);
      ctx.fill();

      // Flor de hibisco fucsia
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(x + 12, y - 20, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(x + 12, y - 20, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* 4. Santiago de Chile: Cordillera de los Andes, Costanera & Teleférico */
    drawAndesSnowMountains(ctx, x, y) {
      ctx.save();
      // Capa 1: Cordón frontal morado
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(x, y + 260);
      ctx.lineTo(x + 180, y + 50);
      ctx.lineTo(x + 320, y + 180);
      ctx.lineTo(x + 500, y + 30);
      ctx.lineTo(x + 680, y + 260);
      ctx.closePath();
      ctx.fill();

      // Capa 2: Picos nevados titánicos iluminados con Alpenglow
      ctx.fillStyle = '#fbcfe8';
      // Cumbre 1
      ctx.beginPath();
      ctx.moveTo(x + 180, y + 50);
      ctx.lineTo(x + 225, y + 115);
      ctx.lineTo(x + 195, y + 100);
      ctx.lineTo(x + 180, y + 120);
      ctx.lineTo(x + 160, y + 100);
      ctx.lineTo(x + 135, y + 115);
      ctx.closePath();
      ctx.fill();

      // Nieve blanca pura
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x + 180, y + 50);
      ctx.lineTo(x + 215, y + 95);
      ctx.lineTo(x + 180, y + 85);
      ctx.lineTo(x + 145, y + 95);
      ctx.closePath();
      ctx.fill();

      // Cumbre 2
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.moveTo(x + 500, y + 30);
      ctx.lineTo(x + 555, y + 115);
      ctx.lineTo(x + 525, y + 95);
      ctx.lineTo(x + 500, y + 115);
      ctx.lineTo(x + 475, y + 95);
      ctx.lineTo(x + 445, y + 115);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x + 500, y + 30);
      ctx.lineTo(x + 540, y + 90);
      ctx.lineTo(x + 500, y + 78);
      ctx.lineTo(x + 460, y + 90);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    drawGranTorreCostanera(ctx, x, y) {
      ctx.save();
      // Rascacielos prismático moderno
      const glassGrad = ctx.createLinearGradient(x, y, x + 64, y);
      glassGrad.addColorStop(0, '#38bdf8');
      glassGrad.addColorStop(0.5, '#bae6fd');
      glassGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = glassGrad;

      ctx.beginPath();
      ctx.moveTo(x + 10, y + 25);
      ctx.lineTo(x + 54, y + 25);
      ctx.lineTo(x + 64, y + 280);
      ctx.lineTo(x, y + 280);
      ctx.closePath();
      ctx.fill();

      // Líneas de pisos iluminadas
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      for (let f = y + 45; f < y + 270; f += 14) {
        ctx.beginPath();
        ctx.moveTo(x + 6, f);
        ctx.lineTo(x + 58, f);
        ctx.stroke();
      }

      // Corona facetada y antena
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(x + 20, y + 10, 24, 15);

      // Luz estroboscópica roja parpadeante de aviación
      const beaconAlpha = (Math.sin(this.levelTime * 5) > 0) ? 1 : 0.2;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 32, y + 10);
      ctx.lineTo(x + 32, y - 8);
      ctx.stroke();

      ctx.fillStyle = `rgba(239, 68, 68, ${beaconAlpha})`;
      ctx.beginPath();
      ctx.arc(x + 32, y - 8, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawTelefericoCable(ctx, x, y) {
      ctx.save();
      // Cable tenso
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 160, y - 25);
      ctx.lineTo(x + 240, y + 25);
      ctx.stroke();

      // Cabina roja moderna del teleférico
      const gondolaX = x + Math.sin(this.levelTime * 0.9) * 40;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(gondolaX, y + 12, 38, 28, 8);
      ctx.fill();

      // Ventanilla panorámica de cristal
      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(gondolaX + 6, y + 16, 26, 12);

      // Brazo metálico de sujeción al cable
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gondolaX + 19, y + 12);
      ctx.lineTo(gondolaX + 19, y - 2);
      ctx.stroke();
      ctx.restore();
    }

    drawAraucariaTree(ctx, x, y) {
      ctx.save();
      // Tronco recto
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x, y + 100);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Ramas geométricas en paraguas características de la Araucaria
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 6;
      for (let r = 0; r < 4; r++) {
        const ry = y + r * 18;
        const rw = 36 - r * 5;
        ctx.beginPath();
        ctx.moveTo(x - rw, ry - 6);
        ctx.quadraticCurveTo(x, ry + 4, x + rw, ry - 6);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* 5. China Mágica: Gran Muralla, Pagoda Imperial y Bambú */
    drawGranMuralla(ctx, x, y) {
      ctx.save();
      // Muralla de piedra serpenteando
      const wallGrad = ctx.createLinearGradient(x, y, x, y + 140);
      wallGrad.addColorStop(0, '#78716c');
      wallGrad.addColorStop(1, '#44403c');
      ctx.fillStyle = wallGrad;

      ctx.beginPath();
      ctx.moveTo(x, y + 130);
      ctx.lineTo(x + 90, y + 45);
      ctx.lineTo(x + 190, y + 75);
      ctx.lineTo(x + 290, y + 35);
      ctx.lineTo(x + 390, y + 130);
      ctx.closePath();
      ctx.fill();

      // Torre de vigilancia fortificada
      ctx.fillStyle = '#e7e5e4';
      ctx.fillRect(x + 80, y + 22, 42, 45);
      // Almenas
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(x + 76, y + 14, 50, 8);

      // Estandarte imperial rojo y dorado ondeando
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(x + 120, y + 14);
      ctx.lineTo(x + 145, y + 20);
      ctx.lineTo(x + 120, y + 26);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawPagodaImperial(ctx, x, y) {
      ctx.save();
      const levels = 4;
      for (let i = 0; i < levels; i++) {
        const ly = y + i * 32;
        const lw = 76 - i * 14;
        const lx = x - lw / 2;

        // Pared lacada roja
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(lx + 8, ly + 10, lw - 16, 22);

        // Ventana enrejada
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(lx + lw / 2 - 4, ly + 14, 8, 12);

        // Aleros curvos dorados
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(lx - 16, ly + 12);
        ctx.quadraticCurveTo(lx + lw / 2, ly - 6, lx + lw + 16, ly + 12);
        ctx.lineTo(lx + lw + 6, ly + 6);
        ctx.lineTo(lx - 6, ly + 6);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    drawBambooGrove(ctx, x, y) {
      ctx.save();
      // Caña de bambú esmeralda
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x, y, 11, 150);
      // Nudos de bambú
      ctx.fillStyle = '#15803d';
      for (let n = 0; n < 5; n++) {
        ctx.fillRect(x - 3, y + n * 32, 17, 5);
      }
      // Hojas afiladas
      ctx.fillStyle = '#4ade80';
      for (let h = 0; h < 4; h++) {
        const hy = y + h * 35;
        ctx.beginPath();
        ctx.ellipse(x + 18, hy, 16, 5, 0.4, 0, Math.PI * 2);
        ctx.ellipse(x - 14, hy + 10, 16, 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawHangingLantern(ctx, x, y) {
      ctx.save();
      // Cable
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Vaivén suave con el viento
      const sway = Math.sin(this.levelTime * 2 + x) * 0.12;
      ctx.translate(x, y);
      ctx.rotate(sway);

      // Linterna ovalada de seda roja
      const lanGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 22);
      lanGrad.addColorStop(0, '#fef08a');
      lanGrad.addColorStop(0.4, '#ef4444');
      lanGrad.addColorStop(1, '#b91c1c');
      ctx.fillStyle = lanGrad;

      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tapas doradas
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-7, -22, 14, 4);
      ctx.fillRect(-7, 18, 14, 4);

      // Borla de seda dorada
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 22);
      ctx.lineTo(0, 36);
      ctx.stroke();
      ctx.restore();
    }

    /* -------------------------------------------------------------
       DETALLES DEL SUELO POR CIUDAD (SIN EMOJIS DESPROLIJOS)
       ------------------------------------------------------------- */
    drawGroundDetails(ctx, city) {
      ctx.save();
      const step = 140;
      for (let fx = 60; fx < this.levelWidth - 200; fx += step) {
        if (city.id === 'concepcion') {
          // Margaritas y flores silvestres vectoriales
          this.drawCuteFlower(ctx, fx, 436, '#ffffff', '#facc15');
          if (fx % (step * 2) === 0) {
            this.drawCuteFlower(ctx, fx + 50, 438, '#fbcfe8', '#f472b6');
          }
        } else if (city.id === 'laserena') {
          // Estrellas de mar y caracolas en la arena dorada
          this.drawSandStar(ctx, fx, 438);
          if (fx % (step * 2) === 0) {
            this.drawConchShell(ctx, fx + 50, 438);
          }
        } else if (city.id === 'rio') {
          // Olas de mosaico de Copacabana en el borde y flores tropicales
          this.drawHibiscusFlower(ctx, fx, 436);
        } else if (city.id === 'santiago') {
          // Flores de Copihue rojo andino y pasto alpino
          this.drawCopihueFlower(ctx, fx, 436);
        } else if (city.id === 'china') {
          // Flores de loto rosadas y linternas de piedra
          this.drawLotusFlower(ctx, fx, 436);
        }
      }
      ctx.restore();
    }

    drawCuteFlower(ctx, x, y, petalColor, centerColor) {
      ctx.save();
      ctx.fillStyle = petalColor;
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(ang) * 6, y + Math.sin(ang) * 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = centerColor;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawSandStar(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#fb7185';
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(ang) * 7, y + Math.sin(ang) * 7, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawConchShell(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.ellipse(x, y, 8, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    drawHibiscusFlower(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#f43f5e';
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(ang) * 8, y + Math.sin(ang) * 8, 8, 5, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawCopihueFlower(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#dc2626';
      // Campana colgante de copihue
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 8);
      ctx.lineTo(x + 5, y - 8);
      ctx.lineTo(x + 7, y + 4);
      ctx.lineTo(x, y + 8);
      ctx.lineTo(x - 7, y + 4);
      ctx.closePath();
      ctx.fill();
      // Tallo verde
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x, y - 14);
      ctx.stroke();
      ctx.restore();
    }

    drawLotusFlower(ctx, x, y) {
      ctx.save();
      // Hoja de loto verde debajo
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(x, y + 4, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pétalos rosa de loto
      ctx.fillStyle = '#f472b6';
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(ang) * 7, y + Math.sin(ang) * 5 - 2, 7, 4, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x, y - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* -------------------------------------------------------------
       PLATAFORMAS ARTÍSTICAS TEMÁTICAS
       ------------------------------------------------------------- */
    drawPlatforms(ctx, city) {
      for (const plat of this.platforms) {
        if (plat.type === 'ground') {
          // Cubierta temática suave
          ctx.fillStyle = city.groundColor;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, 24, [16, 16, 0, 0]);
          ctx.fill();

          // Ribete decorativo ondulado
          ctx.fillStyle = city.groundEdge;
          ctx.beginPath();
          for (let wx = plat.x; wx < plat.x + plat.w; wx += 28) {
            ctx.arc(wx + 14, plat.y + 22, 10, 0, Math.PI);
          }
          ctx.fill();

          // Base del suelo
          ctx.fillStyle = city.groundBase;
          ctx.fillRect(plat.x, plat.y + 24, plat.w, plat.h);

        } else if (plat.type === 'teleferico') {
          // Cabina del teleférico de Santiago como plataforma móvil
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 14);
          ctx.fill();

          // Ventanillas de cristal con reflejo
          ctx.fillStyle = '#dbeafe';
          ctx.fillRect(plat.x + 12, plat.y + 6, plat.w - 24, plat.h - 14);

          // Brazo de enganche al cable superior
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(plat.x + plat.w / 2, plat.y);
          ctx.lineTo(plat.x + plat.w / 2, plat.y - 18);
          ctx.stroke();

        } else if (plat.type === 'pagoda') {
          // Teja curva de pagoda china lacada en rojo y oro
          ctx.fillStyle = '#b91c1c';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y + 6, plat.w, plat.h - 6, 8);
          ctx.fill();

          // Alero dorado curvado
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(plat.x - 8, plat.y + 8);
          ctx.quadraticCurveTo(plat.x + plat.w / 2, plat.y - 4, plat.x + plat.w + 8, plat.y + 8);
          ctx.lineTo(plat.x + plat.w, plat.y + 4);
          ctx.lineTo(plat.x, plat.y + 4);
          ctx.closePath();
          ctx.fill();

        } else if (plat.type === 'sakura') {
          // Plataforma de jardín con flores de cerezo (Concepción)
          ctx.fillStyle = '#fbcfe8';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 14);
          ctx.fill();

          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.roundRect(plat.x + 8, plat.y + 4, plat.w - 16, 6, 999);
          ctx.fill();

        } else if (plat.type === 'pier') {
          // Plataforma de muelle de madera costera (La Serena)
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 10);
          ctx.fill();

          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2;
          for (let px = plat.x + 20; px < plat.x + plat.w; px += 24) {
            ctx.beginPath();
            ctx.moveTo(px, plat.y);
            ctx.lineTo(px, plat.y + plat.h);
            ctx.stroke();
          }

        } else if (plat.type === 'tropical') {
          // Plataforma floral tropical (Río)
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 14);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(plat.x + 8, plat.y + 4, plat.w - 16, 6, 999);
          ctx.fill();

        } else {
          // Nubes esponjosas flotantes universales
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(107, 143, 199, 0.28)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 16);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Franja pastel central
          ctx.fillStyle = '#fed7aa';
          ctx.beginPath();
          ctx.roundRect(plat.x + 8, plat.y + 6, plat.w - 16, 6, 999);
          ctx.fill();
        }
      }
    }

    /* -------------------------------------------------------------
       TRAMPOLINES RESORTES SANRIO (CON ANIMACIÓN DE COMPRESIÓN)
       ------------------------------------------------------------- */
    drawSprings(ctx, city) {
      for (const sp of this.springs) {
        const bounce = sp.timer > 0 ? Math.sin(sp.timer * 25) * 10 : 0;
        ctx.save();

        // Base de soporte
        ctx.fillStyle = '#475569';
        ctx.fillRect(sp.x + 6, sp.y + 16, sp.w - 12, 6);

        // Resorte espiral metálico comprimible
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const midX = sp.x + sp.w / 2;
        ctx.moveTo(midX, sp.y + 16);
        ctx.lineTo(midX - 10, sp.y + 10 + bounce * 0.4);
        ctx.lineTo(midX + 10, sp.y + 6 + bounce * 0.7);
        ctx.lineTo(midX, sp.y + bounce);
        ctx.stroke();

        // Cojín mullido elástico
        const cushionGrad = ctx.createLinearGradient(sp.x, sp.y + bounce, sp.x, sp.y + bounce + 16);
        cushionGrad.addColorStop(0, '#ff9ec4');
        cushionGrad.addColorStop(1, '#ec4899');
        ctx.fillStyle = cushionGrad;

        ctx.beginPath();
        ctx.roundRect(sp.x, sp.y + bounce, sp.w, 14, 8);
        ctx.fill();

        // Flor o estrella dorada central en el cojín
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(midX, sp.y + 7 + bounce, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    /* -------------------------------------------------------------
       COLECCIONABLES KAWAII VECTORIALES (SIN EMOJIS DE TEXTO)
       ------------------------------------------------------------- */
    drawCollectibles(ctx, city) {
      for (const cp of this.cupcakes) {
        if (!cp.got) {
          const hoverY = Math.sin(this.levelTime * 3 + cp.x) * 7;
          this.drawKawaiiItem(ctx, city.id, cp.x, cp.y + hoverY);
        }
      }
    }

    drawKawaiiItem(ctx, cityId, x, y) {
      ctx.save();
      // Halo radial luminoso
      const halo = ctx.createRadialGradient(x, y, 4, x, y, 28);
      halo.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
      halo.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();

      if (cityId === 'concepcion') {
        // Rollito de canela glaseado kawaii
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();

        // Glaseado blanco en espiral
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 1.5);
        ctx.stroke();

        // Ojitos kawaii y rubor
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(x - 5, y - 2, 2, 0, Math.PI * 2);
        ctx.arc(x + 5, y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(x - 8, y + 2, 2.5, 0, Math.PI * 2);
        ctx.arc(x + 8, y + 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (cityId === 'laserena') {
        // Estrella marina sonriente
        ctx.fillStyle = '#fbbf24';
        for (let i = 0; i < 5; i++) {
          const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.arc(x + Math.cos(ang) * 14, y + Math.sin(ang) * 14, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Ojitos tiernos
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(x - 4, y - 2, 1.8, 0, Math.PI * 2);
        ctx.arc(x + 4, y - 2, 1.8, 0, Math.PI * 2);
        ctx.fill();

      } else if (cityId === 'rio') {
        // Coco tropical con pajita
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y - 3, 11, 0, Math.PI * 2);
        ctx.fill();

        // Pajita rayada
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 4);
        ctx.lineTo(x + 14, y - 18);
        ctx.stroke();

        // Flor rosa
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(x - 7, y - 8, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (cityId === 'santiago') {
        // Frutilla andina brillante
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(x, y + 16);
        ctx.bezierCurveTo(x - 16, y + 6, x - 14, y - 10, x, y - 10);
        ctx.bezierCurveTo(x + 14, y - 10, x + 16, y + 6, x, y + 16);
        ctx.fill();

        // Pepitas doradas
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x - 5, y - 2, 2, 2);
        ctx.fillRect(x + 3, y - 2, 2, 2);
        ctx.fillRect(x - 1, y + 5, 2, 2);

        // Hojitas verdes
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x, y - 11, 5, 0, Math.PI * 2);
        ctx.fill();

      } else if (cityId === 'china') {
        // Dumpling dorado kawaii
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(x, y + 2, 15, Math.PI, 0);
        ctx.lineTo(x + 12, y + 8);
        ctx.lineTo(x - 12, y + 8);
        ctx.closePath();
        ctx.fill();

        // Pliegues superiores
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 10);
        ctx.lineTo(x, y - 4);
        ctx.lineTo(x + 6, y - 10);
        ctx.stroke();

        // Ojitos
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(x - 4, y, 1.8, 0, Math.PI * 2);
        ctx.arc(x + 4, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Destellito dorado de 4 puntas
      this.drawSparkleStar(ctx, x + 16, y - 14, 5, '#ffffff');

      ctx.restore();
    }

    drawSparkleStar(ctx, x, y, size, color) {
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.quadraticCurveTo(x, y, x + size, y);
      ctx.quadraticCurveTo(x, y, x, y + size);
      ctx.quadraticCurveTo(x, y, x - size, y);
      ctx.quadraticCurveTo(x, y, x, y - size);
      ctx.fill();
      ctx.restore();
    }

    /* -------------------------------------------------------------
       GRAN ARCO TRIUNFAL Y PICNIC DE META CON AMIGOS DE SANRIO
       ------------------------------------------------------------- */
    drawGoalPicnic(ctx, city) {
      const goalX = this.levelWidth - 360;

      ctx.save();
      // Arcoíris pastel en el fondo de la meta
      const rbColors = ['#ffccd5', '#fed7aa', '#fef08a', '#bbf7d0', '#bae6fd', '#ddd6fe'];
      for (let r = 0; r < rbColors.length; r++) {
        ctx.strokeStyle = rbColors[r];
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(goalX + 70, 420, 160 + r * 6, Math.PI, 0);
        ctx.stroke();
      }

      // Columnas del Gran Arco de Triunfo Sanrio
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(goalX - 110, 240, 18, 190);
      ctx.fillRect(goalX + 230, 240, 18, 190);

      // Franjas de caramelo rosas en las columnas
      ctx.fillStyle = '#ff80bf';
      for (let s = 250; s < 420; s += 28) {
        ctx.fillRect(goalX - 110, s, 18, 12);
        ctx.fillRect(goalX + 230, s, 18, 12);
      }

      // Cartel luminoso de bienvenida
      const bannerGrad = ctx.createLinearGradient(goalX - 120, 210, goalX + 240, 250);
      bannerGrad.addColorStop(0, '#ff9ec4');
      bannerGrad.addColorStop(1, '#ff6b9d');
      ctx.fillStyle = bannerGrad;
      ctx.beginPath();
      ctx.roundRect(goalX - 125, 215, 370, 42, 16);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Texto de bienvenida en el cartel
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 16px "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🎉 ¡BIENVENIDA A ${city.name.toUpperCase()} AMANDA! 🎉`, goalX + 60, 242);

      // Guirnalda de banderines festivos
      for (let b = 0; b < 10; b++) {
        const bx = goalX - 100 + b * 34;
        ctx.fillStyle = (b % 2 === 0) ? '#fef08a' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(bx, 257);
        ctx.lineTo(bx + 16, 257);
        ctx.lineTo(bx + 8, 272);
        ctx.closePath();
        ctx.fill();
      }

      // Mantel a cuadros de picnic
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(goalX - 60, 410, 260, 24);
      ctx.fillStyle = '#ffccd5';
      for (let sq = goalX - 60; sq < goalX + 200; sq += 20) {
        ctx.fillRect(sq, 410, 10, 24);
      }

      // Tarta de fresas de celebración
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.roundRect(goalX + 50, 390, 40, 22, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(goalX + 50, 390, 40, 6);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(goalX + 70, 388, 5, 0, Math.PI * 2);
      ctx.fill();

      // Globos de helio flotando
      this.drawHeliumBalloon(ctx, goalX - 90, 170, '#f472b6');
      this.drawHeliumBalloon(ctx, goalX - 70, 150, '#38bdf8');
      this.drawHeliumBalloon(ctx, goalX + 210, 160, '#fde047');
      this.drawHeliumBalloon(ctx, goalX + 230, 180, '#c084fc');

      // Amigos oficiales de Sanrio esperándote en la meta
      if (this.heroImages['milk'] && this.heroImages['milk'].complete) {
        ctx.drawImage(this.heroImages['milk'], goalX - 50, 362, 75, 68);
      }
      if (this.heroImages['purin'] && this.heroImages['purin'].complete) {
        ctx.drawImage(this.heroImages['purin'], goalX + 20, 355, 74, 74);
      }
      if (this.heroImages['mocha'] && this.heroImages['mocha'].complete) {
        ctx.drawImage(this.heroImages['mocha'], goalX + 95, 365, 78, 64);
      }
      if (this.heroImages['chiffon'] && this.heroImages['chiffon'].complete) {
        ctx.drawImage(this.heroImages['chiffon'], goalX + 165, 358, 80, 68);
      }

      ctx.restore();
    }

    drawHeliumBalloon(ctx, x, y, color) {
      ctx.save();
      // Hilo
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y + 16);
      ctx.quadraticCurveTo(x + 5, y + 35, x, y + 55);
      ctx.stroke();

      // Globo
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brillo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(x - 4, y - 6, 4, 7, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.platformerGame = new CinnamorollPlatformer();
})();
