/* Super Cinnamoroll Run (Gira Mundial de Sanrio por Ciudades del Mundo)
 * - 5 Ciudades con escenarios, ambientación y dificultad progresiva:
 *    1. 🇨🇱 Concepción (Chile): Campus UdeC, Campanil y Arco de Medicina (5-6 años).
 *    2. 🏖️ La Serena (Chile): Avenida del Mar, El Faro Monumental y plataformas marinas (6 años).
 *    3. 🇧🇷 Río de Janeiro (Brasil): Cristo Redentor, Pan de Azúcar y samba tropical (6-7 años).
 *    4. 🏔️ Santiago de Chile: Cordillera de los Andes, Gran Torre Costanera y Teleférico (7-8 años).
 *    5. 🏮 China Mágica: La Gran Muralla, Pagodas y nubes de dragón (8 años · Gran Final).
 * - Selección de 5 héroes de Sanrio: Cinnamoroll, Milk, Pompompurin, Chiffon y Mocha.
 * - Plataformas móviles (vaivén horizontal y vertical) y trampolines temáticos.
 * - Paraje en paralaje con monumentos emblemáticos vectoriales nítidos.
 * - Físicas fluidas de salto, coyote time, jump buffering y planeo suave con orejas.
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
      jumpPower: 460,
      glideGravity: 180,
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
      jumpPower: 475,
      glideGravity: 210,
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
      jumpPower: 490,
      glideGravity: 230,
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
      jumpPower: 470,
      glideGravity: 190,
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
      jumpPower: 475,
      glideGravity: 195,
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
      desc: '¡Corre por el Campus UdeC, pasa junto al Campanil, cruza el Arco de Medicina y disfruta los parques!',
      icon: '🏛️',
      itemIcon: '🧁',
      itemName: 'Rollitos de Canela',
      levelWidth: 3200,
      totalItems: 8,
      skyGradient: ['#98d2ff', '#d6efff', '#ffe8f3'],
      groundColor: '#4ade80',
      groundEdge: '#22c55e',
      groundBase: '#d97706',
      platformStyle: 'concepcion',
      decorations: ['🌸', '🌼', '🌳', '✨']
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
      levelWidth: 3600,
      totalItems: 10,
      skyGradient: ['#60a5fa', '#fde68a', '#fbcfe8'],
      groundColor: '#fde047',
      groundEdge: '#eab308',
      groundBase: '#b45309',
      platformStyle: 'laserena',
      decorations: ['🐚', '⭐', '🌊', '🌴']
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
      levelWidth: 4000,
      totalItems: 12,
      skyGradient: ['#c084fc', '#f472b6', '#fed7aa'],
      groundColor: '#38bdf8',
      groundEdge: '#ffffff',
      groundBase: '#0284c7',
      platformStyle: 'rio',
      decorations: ['🌺', '🍍', '🎉', '🦜']
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
      levelWidth: 4400,
      totalItems: 14,
      skyGradient: ['#818cf8', '#c084fc', '#fed7aa'],
      groundColor: '#86efac',
      groundEdge: '#4ade80',
      groundBase: '#64748b',
      platformStyle: 'santiago',
      decorations: ['🏔️', '🚡', '🌸', '✨']
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
      levelWidth: 4800,
      totalItems: 16,
      skyGradient: ['#fb7185', '#fde047', '#fed7aa'],
      groundColor: '#e11d48',
      groundEdge: '#facc15',
      groundBase: '#7f1d1d',
      platformStyle: 'china',
      decorations: ['🏮', '🎋', '🌸', '🐉']
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
      this.levelWidth = 3200;
      this.keys = { left: false, right: false, jump: false };

      this.cupcakes = [];
      this.platforms = [];
      this.springs = [];
      this.sceneryClouds = [];
      this.particles = [];
      this.score = 0;
      this.totalCupcakes = 8;
      this.reachedGoal = false;
    }

    ensureAssets() {
      HEROES.forEach(h => {
        if (!this.heroImages[h.id]) {
          const img = new Image();
          img.src = h.imgSrc;
          this.heroImages[h.id] = img;
        }
      });
      // Mocha para el picnic final
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

            <!-- Selector de Ciudad / Pasaporte Mágico -->
            <div class="plat-city-pill" id="platCityPill">
              <span class="plat-city-badge">${city.flag}</span>
              <span id="platCityNameText">${city.name}</span>
              <button class="btn-plat-switch-city" id="btnPlatSwitchCity" title="Viajar a otra ciudad">🗺️ Ciudades</button>
            </div>

            <!-- Selector de Personaje -->
            <div class="plat-hero-pill" id="platHeroPill">
              <img src="${hero.imgSrc}" alt="${hero.name}" class="plat-hud-avatar" />
              <span>${hero.name}</span>
              <button class="btn-plat-switch-hero" id="btnPlatSwitchHero" title="Cambiar Personaje">🔄 Cambiar</button>
            </div>

            <div class="plat-hint-tag">🪽 ¡Mantén SALTO para planear!</div>
          </div>

          <!-- Controles táctiles transparentes en pantalla -->
          <div class="plat-touch-controls">
            <div class="plat-dpad">
              <button class="plat-btn btn-left" id="btnPlatLeft" aria-label="Izquierda">◀</button>
              <button class="plat-btn btn-right" id="btnPlatRight" aria-label="Derecha">▶</button>
            </div>
            <div class="plat-actions">
              <button class="plat-btn btn-jump" id="btnPlatJump" aria-label="Saltar">
                <span class="jump-ico">🪽</span>
                <span class="jump-txt">¡Saltar!</span>
              </button>
            </div>
          </div>

          <!-- Modal de Pasaporte / Selección de Ciudad -->
          <div class="plat-city-modal hidden" id="platCityModal">
            <div class="plat-city-modal-box">
              <div class="plat-modal-header">
                <span class="plat-modal-badge">🌍 Gira Mundial de Cinnamoroll & Amanda ✈️</span>
                <h2>¿A qué ciudad quieres viajar hoy?</h2>
                <button class="btn-plat-modal-close" aria-label="Cerrar modal">✕ Cerrar</button>
              </div>
              <div class="plat-cities-grid">
                ${CITIES.map((c, idx) => `
                  <div class="plat-city-card ${idx === this.currentCityIdx ? 'active' : ''}" data-cidx="${idx}">
                    <span class="plat-city-card-badge">${c.badge}</span>
                    <span class="plat-city-card-icon">${c.flag}</span>
                    <h3>${c.name}</h3>
                    <h4>${c.title}</h4>
                    <p>${c.desc}</p>
                    <button class="btn-travel-city">${idx === this.currentCityIdx ? '✨ ¡Jugando aquí!' : '✈️ ¡Viajar aquí!'}</button>
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
                <button class="btn-plat-modal-close" aria-label="Cerrar modal">✕ Cerrar</button>
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
                    <button class="btn-pick-plat-hero">¡Elegir!</button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Pantalla de victoria con amigos oficiales -->
          <div class="plat-victory-overlay hidden" id="platVictoryScreen">
            <div class="plat-victory-card">
              <div class="victory-ribbon" id="platVictoryRibbon">🎉 ¡LLEGASTE A LA META EN ${city.name.toUpperCase()}! 🎉</div>
              <h2 id="platVictoryTitle">¡Misión completada con todos los dulces!</h2>
              <div class="picnic-friends-stage">
                <img src="assets/cinnamoroll_fly.png" class="picnic-char cinna" alt="Cinnamoroll" />
                <img src="assets/milk_teddy.png" class="picnic-char milk" alt="Milk" />
                <img src="assets/pompompurin.png" class="picnic-char purin" alt="Pompompurin" />
                <img src="assets/mocha_hq.png" class="picnic-char mocha" alt="Mocha" />
                <img src="assets/chiffon.png" class="picnic-char chiffon" alt="Chiffon" />
              </div>
              <p id="platVictoryMsg">¡Amanda, eres la mejor viajera de Cinnamoroll Land! 🌸</p>
              
              <div class="plat-victory-actions">
                <button class="btn-plat-next-city" id="btnPlatNextCity">▶ Siguiente Ciudad</button>
                <button class="btn-plat-repeat-city" id="btnPlatRepeatCity">🔄 Repetir Ciudad</button>
                <button class="btn-plat-choose-city" id="btnPlatChooseCity">🗺️ Elegir Ciudad</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Modal ciudad
      const cityModal = this.container.querySelector('#platCityModal');
      const btnSwitchCity = this.container.querySelector('#btnPlatSwitchCity');
      if (btnSwitchCity) {
        btnSwitchCity.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          cityModal.classList.remove('hidden');
        });
      }

      const closeCityModal = () => {
        A.unlock();
        A.bubblePop(1);
        cityModal.classList.add('hidden');
      };
      const btnCloseCity = cityModal ? cityModal.querySelector('.btn-plat-modal-close') : null;
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

      // Modal select hero
      const heroModal = this.container.querySelector('#platCharModal');
      const btnSwitchHero = this.container.querySelector('#btnPlatSwitchHero');
      if (btnSwitchHero) {
        btnSwitchHero.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          heroModal.classList.remove('hidden');
        });
      }

      const closeHeroModal = () => {
        A.unlock();
        A.bubblePop(1);
        heroModal.classList.add('hidden');
      };
      const btnCloseHero = heroModal ? heroModal.querySelector('.btn-plat-modal-close') : null;
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
      const avatar = this.container.querySelector('.plat-hud-avatar');
      if (avatar) avatar.src = hero.imgSrc;
      const nameEl = this.container.querySelector('#platHeroPill span');
      if (nameEl) nameEl.textContent = hero.name;
      this.burstParticles(this.p.x + this.p.w / 2, this.p.y + this.p.h / 2, 16, ['#ffffff', hero.trailColor, '#ffd1dc']);
    }

    nextHero() {
      const currentId = this.selectedHero?.id || 'cinna';
      const idx = HEROES.findIndex(h => h.id === currentId);
      const nextIdx = (idx + 1) % HEROES.length;
      this.setHero(HEROES[nextIdx]);
      if (A) A.celebrate();
    }

    setupCanvas() {
      this.canvas = this.container.querySelector('#platformerCanvas');
      this.ctx = this.canvas.getContext('2d');
    }

    /* -------------------------------------------------------------
       GENERADOR DE NIVELES POR CIUDAD (DIFICULTAD PROGRESIVA)
       ------------------------------------------------------------- */
    buildCityLevel(cityIdx) {
      this.currentCityIdx = cityIdx;
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

      // Nubes decorativas en el cielo lejano
      this.sceneryClouds = [];
      const cloudCount = Math.floor(city.levelWidth / 190);
      for (let i = 0; i < cloudCount; i++) {
        this.sceneryClouds.push({
          x: i * 200 + Math.random() * 80,
          y: 35 + (i % 4) * 38,
          w: 80 + (i % 3) * 35,
          speed: 0.15 + (i % 3) * 0.12
        });
      }

      // Diseño de plataformas según la ciudad y dificultad
      this.platforms = [];
      this.springs = [];
      this.cupcakes = [];

      if (city.id === 'concepcion') {
        // NIVEL 1: CONCEPCIÓN (5-6 años · Pleno césped, colinas y aprendizaje suave)
        this.platforms = [
          { x: -50, y: 440, w: 720, h: 100, type: 'ground' },
          { x: 740, y: 380, w: 170, h: 26, type: 'cloud' },
          { x: 970, y: 320, w: 180, h: 26, type: 'cloud' },
          { x: 1210, y: 260, w: 190, h: 26, type: 'cloud' },
          { x: 1470, y: 400, w: 580, h: 100, type: 'ground' },
          { x: 2110, y: 330, w: 170, h: 26, type: 'cloud' },
          { x: 2340, y: 260, w: 190, h: 26, type: 'cloud' },
          { x: 2590, y: 430, w: 750, h: 110, type: 'ground' }
        ];

        this.springs = [
          { x: 580, y: 418, w: 56, h: 22, timer: 0, power: -660, emoji: '🌸' },
          { x: 1920, y: 378, w: 56, h: 22, timer: 0, power: -680, emoji: '🌸' }
        ];

        const itemXs = [420, 820, 1060, 1300, 1620, 1850, 2200, 2430];
        this.cupcakes = itemXs.map(x => ({ x, y: 240 + Math.sin(x) * 60, got: false }));

      } else if (city.id === 'laserena') {
        // NIVEL 2: LA SERENA (6 años · Plataformas móviles con vaivén suave marino)
        this.platforms = [
          { x: -50, y: 440, w: 620, h: 100, type: 'ground' },
          // Nubes marinas que se mecen horizontalmente con la marea
          { x: 670, y: 370, w: 160, h: 26, type: 'cloud', baseX: 670, moveX: true, rangeX: 55, speedX: 1.2, phase: 0 },
          { x: 940, y: 310, w: 170, h: 26, type: 'cloud' },
          { x: 1180, y: 260, w: 160, h: 26, type: 'cloud', baseX: 1180, moveX: true, rangeX: 65, speedX: 1.4, phase: Math.PI },
          { x: 1460, y: 410, w: 520, h: 100, type: 'ground' },
          { x: 2040, y: 340, w: 170, h: 26, type: 'cloud', baseX: 2040, moveX: true, rangeX: 70, speedX: 1.3, phase: 0.5 },
          { x: 2320, y: 270, w: 180, h: 26, type: 'cloud' },
          { x: 2580, y: 330, w: 170, h: 26, type: 'cloud', baseX: 2580, moveX: true, rangeX: 60, speedX: 1.5, phase: 1.2 },
          { x: 2880, y: 430, w: 850, h: 110, type: 'ground' }
        ];

        this.springs = [
          { x: 490, y: 418, w: 56, h: 22, timer: 0, power: -680, emoji: '🐚' },
          { x: 1860, y: 388, w: 56, h: 22, timer: 0, power: -700, emoji: '🐚' }
        ];

        const itemXs = [380, 720, 990, 1240, 1560, 1780, 2100, 2370, 2640, 2800];
        this.cupcakes = itemXs.map(x => ({ x, y: 230 + Math.sin(x) * 50, got: false }));

      } else if (city.id === 'rio') {
        // NIVEL 3: RÍO DE JANEIRO (6-7 años · Plataformas móviles verticales y ritmo de samba)
        this.platforms = [
          { x: -50, y: 440, w: 580, h: 100, type: 'ground' },
          // Plataforma vertical Copacabana
          { x: 630, y: 340, w: 160, h: 26, type: 'cloud', baseY: 340, moveY: true, rangeY: 45, speedY: 1.4, phase: 0 },
          { x: 890, y: 280, w: 170, h: 26, type: 'cloud', baseX: 890, moveX: true, rangeX: 70, speedX: 1.5, phase: 0.8 },
          { x: 1180, y: 230, w: 180, h: 26, type: 'cloud', baseY: 230, moveY: true, rangeY: 40, speedY: 1.6, phase: Math.PI },
          { x: 1470, y: 410, w: 500, h: 100, type: 'ground' },
          { x: 2040, y: 350, w: 170, h: 26, type: 'cloud', baseX: 2040, moveX: true, rangeX: 75, speedX: 1.6, phase: 0 },
          { x: 2330, y: 270, w: 170, h: 26, type: 'cloud', baseY: 270, moveY: true, rangeY: 50, speedY: 1.5, phase: 1.1 },
          { x: 2610, y: 210, w: 180, h: 26, type: 'cloud' },
          { x: 2890, y: 330, w: 170, h: 26, type: 'cloud', baseX: 2890, moveX: true, rangeX: 65, speedX: 1.7, phase: 2.0 },
          { x: 3180, y: 430, w: 920, h: 110, type: 'ground' }
        ];

        this.springs = [
          { x: 460, y: 418, w: 58, h: 22, timer: 0, power: -700, emoji: '🥁' },
          { x: 1840, y: 388, w: 58, h: 22, timer: 0, power: -710, emoji: '🥁' },
          { x: 3050, y: 408, w: 58, h: 22, timer: 0, power: -700, emoji: '🥁' }
        ];

        const itemXs = [320, 680, 940, 1230, 1580, 1800, 2090, 2380, 2660, 2840, 2980, 3140];
        this.cupcakes = itemXs.map(x => ({ x, y: 220 + Math.sin(x) * 55, got: false }));

      } else if (city.id === 'santiago') {
        // NIVEL 4: SANTIAGO DE CHILE (7-8 años · Teleférico andino móvil y altura)
        this.platforms = [
          { x: -50, y: 440, w: 560, h: 100, type: 'ground' },
          // Cabinas móviles del teleférico San Cristóbal
          { x: 610, y: 360, w: 170, h: 28, type: 'teleferico', baseX: 610, moveX: true, rangeX: 85, speedX: 1.3, phase: 0 },
          { x: 910, y: 290, w: 180, h: 28, type: 'teleferico', baseY: 290, moveY: true, rangeY: 48, speedY: 1.5, phase: 0.6 },
          { x: 1220, y: 230, w: 190, h: 28, type: 'teleferico', baseX: 1220, moveX: true, rangeX: 95, speedX: 1.4, phase: Math.PI },
          { x: 1530, y: 400, w: 520, h: 100, type: 'ground' },
          { x: 2130, y: 330, w: 180, h: 28, type: 'teleferico', baseY: 330, moveY: true, rangeY: 55, speedY: 1.6, phase: 0.2 },
          { x: 2430, y: 250, w: 190, h: 28, type: 'teleferico', baseX: 2430, moveX: true, rangeX: 100, speedX: 1.5, phase: 1.4 },
          { x: 2750, y: 200, w: 180, h: 26, type: 'cloud' },
          { x: 3040, y: 280, w: 180, h: 28, type: 'teleferico', baseX: 3040, moveX: true, rangeX: 90, speedX: 1.7, phase: 2.2 },
          { x: 3350, y: 360, w: 170, h: 26, type: 'cloud', baseY: 360, moveY: true, rangeY: 40, speedY: 1.4, phase: 0.5 },
          { x: 3630, y: 430, w: 880, h: 110, type: 'ground' }
        ];

        this.springs = [
          { x: 440, y: 418, w: 58, h: 22, timer: 0, power: -710, emoji: '🚡' },
          { x: 1920, y: 378, w: 58, h: 22, timer: 0, power: -720, emoji: '🚡' },
          { x: 3500, y: 408, w: 58, h: 22, timer: 0, power: -710, emoji: '🚡' }
        ];

        const itemXs = [280, 660, 960, 1270, 1620, 1860, 2180, 2480, 2790, 3080, 3260, 3420, 3550, 3680];
        this.cupcakes = itemXs.map(x => ({ x, y: 200 + Math.sin(x) * 60, got: false }));

      } else if (city.id === 'china') {
        // NIVEL 5: CHINA MÁGICA (8 años · Gran Muralla, puentes pagodas, linternas y loto sagrado)
        this.platforms = [
          { x: -50, y: 440, w: 560, h: 100, type: 'ground' },
          // Linternas y puentes chinos
          { x: 610, y: 360, w: 170, h: 26, type: 'pagoda', baseX: 610, moveX: true, rangeX: 90, speedX: 1.4, phase: 0 },
          { x: 900, y: 290, w: 180, h: 26, type: 'pagoda', baseY: 290, moveY: true, rangeY: 55, speedY: 1.6, phase: 0.8 },
          { x: 1200, y: 220, w: 190, h: 26, type: 'pagoda', baseX: 1200, moveX: true, rangeX: 100, speedX: 1.5, phase: Math.PI },
          { x: 1510, y: 390, w: 520, h: 100, type: 'ground' },
          { x: 2110, y: 330, w: 180, h: 26, type: 'pagoda', baseY: 330, moveY: true, rangeY: 55, speedY: 1.7, phase: 0.3 },
          { x: 2410, y: 250, w: 190, h: 26, type: 'pagoda', baseX: 2410, moveX: true, rangeX: 110, speedX: 1.6, phase: 1.5 },
          { x: 2730, y: 190, w: 200, h: 26, type: 'pagoda' },
          { x: 3040, y: 270, w: 180, h: 26, type: 'pagoda', baseX: 3040, moveX: true, rangeX: 100, speedX: 1.8, phase: 2.1 },
          { x: 3350, y: 350, w: 180, h: 26, type: 'pagoda', baseY: 350, moveY: true, rangeY: 45, speedY: 1.5, phase: 0.9 },
          { x: 3650, y: 270, w: 180, h: 26, type: 'pagoda', baseX: 3650, moveX: true, rangeX: 85, speedX: 1.6, phase: 1.2 },
          { x: 3950, y: 430, w: 950, h: 110, type: 'ground' }
        ];

        this.springs = [
          { x: 440, y: 418, w: 60, h: 22, timer: 0, power: -730, emoji: '🪷' },
          { x: 1880, y: 368, w: 60, h: 22, timer: 0, power: -740, emoji: '🪷' },
          { x: 3820, y: 408, w: 60, h: 22, timer: 0, power: -740, emoji: '🪷' }
        ];

        const itemXs = [260, 560, 780, 1040, 1340, 1650, 1920, 2240, 2560, 2860, 3160, 3460, 3620, 3780, 3960, 4120];
        this.cupcakes = itemXs.map(x => ({ x, y: 190 + Math.sin(x) * 55, got: false }));
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

      // Actualizar tarjeta activa en modal de ciudades
      if (this.container) {
        this.container.querySelectorAll('.plat-city-card').forEach((c, idx) => {
          if (idx === this.currentCityIdx) c.classList.add('active');
          else c.classList.remove('active');
        });
      }
    }

    bindInputs() {
      window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
        if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
          A.unlock();
          this.keys.jump = true;
          this.p.jumpBuffer = 0.15;
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
        if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
          this.keys.jump = false;
          if (this.p.vy < -160) {
            this.p.vy *= 0.55;
          }
        }
      });

      const btnL = this.container.querySelector('#btnPlatLeft');
      const btnR = this.container.querySelector('#btnPlatRight');
      const btnJ = this.container.querySelector('#btnPlatJump');

      const hookTouch = (el, pressFn, releaseFn) => {
        if (!el) return;
        el.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          A.unlock();
          pressFn();
        });
        el.addEventListener('pointerup', releaseFn);
        el.addEventListener('pointercancel', releaseFn);
        el.addEventListener('pointerleave', releaseFn);
      };

      hookTouch(btnL, () => { this.keys.left = true; }, () => { this.keys.left = false; });
      hookTouch(btnR, () => { this.keys.right = true; }, () => { this.keys.right = false; });
      hookTouch(btnJ, () => {
        this.keys.jump = true;
        this.p.jumpBuffer = 0.15;
      }, () => {
        this.keys.jump = false;
        if (this.p.vy < -160) this.p.vy *= 0.55;
      });

      if (this.canvas) {
        this.canvas.addEventListener('pointerdown', (e) => {
          const rect = this.canvas.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width * 0.55) {
            A.unlock();
            this.keys.jump = true;
            this.p.jumpBuffer = 0.15;
          }
        });
        this.canvas.addEventListener('pointerup', () => {
          this.keys.jump = false;
          if (this.p.vy < -160) this.p.vy *= 0.55;
        });
      }
    }

    tryJump() {
      const p = this.p;
      if (p.grounded || p.coyoteTimer > 0) {
        p.vy = -this.selectedHero.jumpPower;
        p.grounded = false;
        p.coyoteTimer = 0;
        p.jumpBuffer = 0;
        p.standingPlat = null;

        p.squashX = 0.82;
        p.squashY = 1.25;

        A.whoosh(true);
        this.burstParticles(p.x + p.w / 2, p.y + p.h, 10, ['#ffffff', this.selectedHero.trailColor, '#ffeaf4']);
      }
    }

    startLoop() {
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

      // Si el jugador está sobre una plataforma móvil, desplazarlo con ella
      if (p.grounded && p.standingPlat && p.standingPlat.moveX) {
        p.x += (p.standingPlat.vx || 0) * dt;
      }

      // Movimiento horizontal suave
      const maxSpeed = 295;
      let targetVx = 0;
      if (this.keys.left) {
        targetVx = -maxSpeed;
        p.facing = -1;
      } else if (this.keys.right) {
        targetVx = maxSpeed;
        p.facing = 1;
      }

      const accel = p.grounded ? 16 : 9;
      p.vx += (targetVx - p.vx) * Math.min(1, dt * accel);
      if (Math.abs(p.vx) < 4) p.vx = 0;
      p.x += p.vx * dt;

      // Coyote time y Jump buffer
      if (p.grounded) {
        p.coyoteTimer = 0.12;
      } else {
        p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
      }

      if (p.jumpBuffer > 0) {
        p.jumpBuffer -= dt;
        if (p.coyoteTimer > 0) {
          this.tryJump();
        }
      }

      // Planeo suave en el aire (Ear-Glide)
      p.gliding = !p.grounded && this.keys.jump && p.vy > 0;
      const gravity = p.gliding ? hero.glideGravity : 720;
      p.vy += gravity * dt;

      if (p.gliding) {
        p.vy = Math.min(p.vy, 90);
        if (Math.random() < 0.35) {
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
          p.lastSafeX = p.x;
          p.lastSafeY = plat.y - p.h - 10;
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
          p.vy = sp.power || -680;
          p.grounded = false;
          sp.timer = 0.35;
          p.squashX = 0.75;
          p.squashY = 1.35;
          A.softBoing();
          A.kawaiiChirp('cheer');
          this.burstParticles(sp.x + sp.w / 2, sp.y, 14, ['#ff8fbf', '#ffe066', '#ffffff']);
        }
      }

      // Recolección de dulces
      for (const cp of this.cupcakes) {
        if (!cp.got && Math.hypot((p.x + p.w / 2) - cp.x, (p.y + p.h / 2) - cp.y) < 46) {
          cp.got = true;
          this.score++;
          A.collect(this.score);
          this.burstParticles(cp.x, cp.y, 14, ['#ff6b9d', '#ffe066', '#ffffff']);
          this.updateHUD();
        }
      }

      // Rescate mágico si cae (Amanda nunca pierde: regresa suavemente a la última plataforma segura)
      if (p.y > 515) {
        p.x = (p.lastSafeX !== undefined) ? p.lastSafeX : Math.max(80, p.x - 260);
        p.y = (p.lastSafeY !== undefined) ? p.lastSafeY : 230;
        p.vy = -260;
        p.grounded = false;
        A.whoosh(true);
        this.burstParticles(p.x + p.w / 2, p.y + p.h / 2, 18, ['#aee0ff', '#ffffff', '#ffd1dc']);
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
    }

    triggerVictory() {
      A.celebrate();
      const city = CITIES[this.currentCityIdx];
      const victoryScreen = this.container.querySelector('#platVictoryScreen');
      if (victoryScreen) {
        const ribbon = victoryScreen.querySelector('#platVictoryRibbon');
        const title = victoryScreen.querySelector('#platVictoryTitle');
        const msg = victoryScreen.querySelector('#platVictoryMsg');
        const btnNext = victoryScreen.querySelector('#btnPlatNextCity');

        if (ribbon) ribbon.textContent = `🎉 ¡LLEGASTE A LA META EN ${city.name.toUpperCase()}! 🎉`;
        if (title) title.textContent = `¡Amanda completó ${city.name} con ${this.score} ${city.itemName}!`;
        if (msg) msg.textContent = `¡Los amigos de Sanrio están felices de haber viajado contigo a ${city.name}, ${city.country}! 💖`;

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
    }

    /* -------------------------------------------------------------
       DIBUJO DE ESCENARIOS Y MONUMENTOS EMBLEMÁTICOS
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

      // 2. PARALAJE CAPA 1: Monumentos y Siluetas Lejanas (0.12x velocidad)
      ctx.save();
      ctx.translate(-this.camX * 0.12, 0);

      this.drawFarLandmarks(ctx, city);

      // Nubes decorativas lejanas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      for (const cl of this.sceneryClouds) {
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, cl.w * 0.28, 0, Math.PI * 2);
        ctx.arc(cl.x + cl.w * 0.26, cl.y - cl.w * 0.12, cl.w * 0.35, 0, Math.PI * 2);
        ctx.arc(cl.x + cl.w * 0.55, cl.y, cl.w * 0.26, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. PARALAJE CAPA 2: Media Distancia Específica (0.35x velocidad)
      ctx.save();
      ctx.translate(-this.camX * 0.35, 0);
      this.drawMidScenery(ctx, city);
      ctx.restore();

      // 4. MUNDO PRINCIPAL (1.0x velocidad de juego)
      ctx.save();
      ctx.translate(-this.camX, 0);

      // Flores / detalles del suelo por ciudad
      const decoStep = 130;
      for (let fx = 50; fx < this.levelWidth; fx += decoStep) {
        const deco = city.decorations[Math.floor(fx / decoStep) % city.decorations.length];
        ctx.font = '22px sans-serif';
        ctx.fillText(deco, fx, 436);
      }

      // Plataformas
      this.drawPlatforms(ctx, city);

      // Trampolines
      this.drawSprings(ctx, city);

      // Coleccionables temáticos
      this.drawCollectibles(ctx, city);

      // Meta con mantel de picnic y amigos oficiales de Sanrio
      this.drawGoalPicnic(ctx, city);

      // 5. PERSONAJE JUGADOR
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

      // 6. PARTÍCULAS
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
    }

    /* Dibujo de monumentos lejanos según la ciudad elegida */
    drawFarLandmarks(ctx, city) {
      if (city.id === 'concepcion') {
        // Campanil de la Universidad de Concepción & Arco de Medicina
        // Colinas verdes suaves de fondo
        ctx.fillStyle = 'rgba(187, 247, 208, 0.55)';
        for (let x = -200; x < this.levelWidth * 0.35 + 400; x += 380) {
          ctx.beginPath();
          ctx.arc(x, 520, 260, 0, Math.PI * 2);
          ctx.fill();
        }

        // Río Biobío
        ctx.fillStyle = 'rgba(125, 211, 252, 0.4)';
        ctx.fillRect(-200, 460, this.levelWidth, 60);

        // Campanil UdeC a lo lejos
        for (let x = 340; x < this.levelWidth * 0.5; x += 1100) {
          this.drawCampanilUdeC(ctx, x, 180);
          this.drawArcoMedicina(ctx, x + 420, 290);
        }

      } else if (city.id === 'laserena') {
        // El Faro Monumental de La Serena & Océano Pacífico
        // Sol radiante en el horizonte
        ctx.fillStyle = 'rgba(254, 240, 138, 0.65)';
        ctx.beginPath();
        ctx.arc(680, 220, 75, 0, Math.PI * 2);
        ctx.fill();

        // Olas suaves del mar
        ctx.fillStyle = 'rgba(125, 211, 252, 0.5)';
        ctx.fillRect(-200, 430, this.levelWidth, 90);

        // Siluetas del Faro Monumental
        for (let x = 400; x < this.levelWidth * 0.5; x += 1200) {
          this.drawFaroLaSerena(ctx, x, 220);
        }

      } else if (city.id === 'rio') {
        // Cristo Redentor en el Corcovado & Pan de Azúcar
        // Bahía de Guanabara
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.fillRect(-200, 440, this.levelWidth, 80);

        // Morros tropicales
        for (let x = 280; x < this.levelWidth * 0.5; x += 1150) {
          this.drawPaoDeAcucar(ctx, x, 210);
          this.drawCristoRedentor(ctx, x + 520, 150);
        }

      } else if (city.id === 'santiago') {
        // Cordillera de los Andes con picos nevados & Gran Torre Costanera
        for (let x = -200; x < this.levelWidth * 0.5 + 400; x += 900) {
          this.drawAndesSnowMountains(ctx, x, 120);
        }
        for (let x = 480; x < this.levelWidth * 0.5; x += 1200) {
          this.drawGranTorreCostanera(ctx, x, 140);
        }

      } else if (city.id === 'china') {
        // La Gran Muralla serpenteando por montañas místicas & Pagodas
        ctx.fillStyle = 'rgba(254, 202, 202, 0.4)';
        for (let x = -200; x < this.levelWidth * 0.5 + 400; x += 350) {
          ctx.beginPath();
          ctx.arc(x, 500, 240, 0, Math.PI * 2);
          ctx.fill();
        }

        for (let x = 320; x < this.levelWidth * 0.5; x += 1050) {
          this.drawGranMuralla(ctx, x, 240);
          this.drawPagodaImperial(ctx, x + 440, 190);
        }
      }
    }

    drawMidScenery(ctx, city) {
      if (city.id === 'concepcion') {
        // Parque con cerezos y flores
        ctx.fillStyle = 'rgba(244, 114, 182, 0.4)';
        for (let x = -200; x < this.levelWidth * 0.6; x += 280) {
          ctx.beginPath();
          ctx.arc(x, 480, 120, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (city.id === 'laserena') {
        // Palmeras de Avenida del Mar
        for (let x = 120; x < this.levelWidth * 0.6; x += 360) {
          this.drawPalmera(ctx, x, 340);
        }
      } else if (city.id === 'rio') {
        // Selva de Tijuca con confeti festivo
        ctx.fillStyle = 'rgba(74, 222, 128, 0.45)';
        for (let x = -100; x < this.levelWidth * 0.6; x += 300) {
          ctx.beginPath();
          ctx.arc(x, 490, 140, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (city.id === 'santiago') {
        // Cabinas del Teleférico cruzando el cielo
        for (let x = 200; x < this.levelWidth * 0.6; x += 550) {
          this.drawTelefericoCable(ctx, x, 220);
        }
      } else if (city.id === 'china') {
        // Cañas de bambú y linternas colgantes
        for (let x = 160; x < this.levelWidth * 0.6; x += 320) {
          this.drawBambu(ctx, x, 320);
          this.drawLinternaChica(ctx, x + 80, 240);
        }
      }
    }

    /* Vectores de monumentos de Concepción */
    drawCampanilUdeC(ctx, x, y) {
      ctx.save();
      // Torre base
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x, y + 60, 48, 160);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 4, y + 180, 40, 40);

      // Cornisas y molduras
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x - 4, y + 60, 56, 8);
      ctx.fillRect(x - 6, y + 120, 60, 8);

      // Reloj redondo del Campanil
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 24, y + 90, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cúpula campanario
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 60);
      ctx.lineTo(x + 24, y + 10);
      ctx.lineTo(x + 46, y + 60);
      ctx.closePath();
      ctx.fill();

      // Aguja y cruz
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 24, y + 10);
      ctx.lineTo(x + 24, y - 8);
      ctx.stroke();
      ctx.restore();
    }

    drawArcoMedicina(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#f1f5f9';
      // Columnas
      for (let c = 0; c < 5; c++) {
        ctx.fillRect(x + c * 32, y + 20, 12, 80);
      }
      // Dintel y frontis curvo
      ctx.fillRect(x - 8, y + 12, 160, 12);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(x + 72, y + 12, 70, Math.PI, 0);
      ctx.fill();
      ctx.restore();
    }

    /* Monumentos de La Serena */
    drawFaroLaSerena(ctx, x, y) {
      ctx.save();
      // Torre cuadrangular almenada
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x, y + 40, 68, 140);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 6, y + 80, 56, 16);
      ctx.fillRect(x + 6, y + 130, 56, 16);

      // Almenas
      ctx.fillStyle = '#e2e8f0';
      for (let m = 0; m < 5; m++) {
        ctx.fillRect(x + m * 14, y + 32, 10, 10);
      }

      // Linterna del faro con luz dorada
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 34, y + 20, 18, 0, Math.PI * 2);
      ctx.fill();

      // Rayo de luz giratorio
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(x + 34, y + 20);
      ctx.lineTo(x + 340, y - 40);
      ctx.lineTo(x + 340, y + 80);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    drawPalmera(ctx, x, y) {
      ctx.save();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x, y + 100);
      ctx.quadraticCurveTo(x + 12, y + 40, x, y);
      ctx.stroke();

      // Hojas verdes
      ctx.fillStyle = '#22c55e';
      for (let a = 0; a < 6; a++) {
        const ang = (a / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(ang) * 26, y + Math.sin(ang) * 16, 26, 10, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    /* Monumentos de Río de Janeiro */
    drawPaoDeAcucar(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(x + 80, y + 120, 95, 130, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(x + 80, y + 40, 60, 40, 0, Math.PI, 0);
      ctx.fill();
      ctx.restore();
    }

    drawCristoRedentor(ctx, x, y) {
      ctx.save();
      // Cerro Corcovado verde
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(x - 70, y + 200);
      ctx.lineTo(x, y + 50);
      ctx.lineTo(x + 70, y + 200);
      ctx.closePath();
      ctx.fill();

      // Estatua blanca del Cristo con brazos extendidos
      ctx.fillStyle = '#ffffff';
      // Cuerpo
      ctx.fillRect(x - 8, y + 14, 16, 42);
      // Brazos extendidos
      ctx.fillRect(x - 38, y + 18, 76, 8);
      // Cabeza
      ctx.beginPath();
      ctx.arc(x, y + 10, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* Monumentos de Santiago de Chile */
    drawAndesSnowMountains(ctx, x, y) {
      ctx.save();
      // Cordillera de fondo
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(x, y + 260);
      ctx.lineTo(x + 160, y + 20);
      ctx.lineTo(x + 280, y + 160);
      ctx.lineTo(x + 440, y);
      ctx.lineTo(x + 600, y + 260);
      ctx.closePath();
      ctx.fill();

      // Nieve en las cumbres
      ctx.fillStyle = '#ffffff';
      // Cumbre 1
      ctx.beginPath();
      ctx.moveTo(x + 160, y + 20);
      ctx.lineTo(x + 195, y + 70);
      ctx.lineTo(x + 175, y + 60);
      ctx.lineTo(x + 160, y + 75);
      ctx.lineTo(x + 145, y + 60);
      ctx.lineTo(x + 125, y + 70);
      ctx.closePath();
      ctx.fill();

      // Cumbre 2
      ctx.beginPath();
      ctx.moveTo(x + 440, y);
      ctx.lineTo(x + 490, y + 75);
      ctx.lineTo(x + 465, y + 60);
      ctx.lineTo(x + 440, y + 75);
      ctx.lineTo(x + 415, y + 60);
      ctx.lineTo(x + 390, y + 75);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawGranTorreCostanera(ctx, x, y) {
      ctx.save();
      // Rascacielos moderno prismático
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 20);
      ctx.lineTo(x + 44, y + 20);
      ctx.lineTo(x + 52, y + 260);
      ctx.lineTo(x, y + 260);
      ctx.closePath();
      ctx.fill();

      // Reflejos de cristal
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(x + 18, y + 30, 8, 220);
      ctx.fillRect(x + 32, y + 30, 4, 220);

      // Cúpula superior
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + 16, y + 8, 20, 12);
      ctx.restore();
    }

    drawTelefericoCable(ctx, x, y) {
      ctx.save();
      // Cable
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 140, y - 20);
      ctx.lineTo(x + 220, y + 20);
      ctx.stroke();

      // Cabina roja
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(x, y + 10, 36, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#bfdbfe';
      ctx.fillRect(x + 6, y + 14, 24, 10);
      ctx.restore();
    }

    /* Monumentos de China */
    drawGranMuralla(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.moveTo(x, y + 120);
      ctx.lineTo(x + 80, y + 40);
      ctx.lineTo(x + 180, y + 70);
      ctx.lineTo(x + 280, y + 30);
      ctx.lineTo(x + 360, y + 120);
      ctx.closePath();
      ctx.fill();

      // Almenas y torre de vigilancia
      ctx.fillStyle = '#e7e5e4';
      ctx.fillRect(x + 70, y + 20, 36, 40);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(x + 66, y + 12, 44, 8);
      ctx.restore();
    }

    drawPagodaImperial(ctx, x, y) {
      ctx.save();
      const levels = 3;
      for (let i = 0; i < levels; i++) {
        const ly = y + i * 36;
        const lw = 70 - i * 14;
        const lx = x - lw / 2;

        // Pared
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(lx + 8, ly + 12, lw - 16, 24);

        // Techo curvo de pagoda
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(lx - 12, ly + 14);
        ctx.quadraticCurveTo(lx + lw / 2, ly - 4, lx + lw + 12, ly + 14);
        ctx.lineTo(lx + lw + 4, ly + 10);
        ctx.lineTo(lx - 4, ly + 10);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    drawBambu(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x, y, 10, 140);
      // Nudos
      ctx.fillStyle = '#15803d';
      for (let n = 0; n < 4; n++) {
        ctx.fillRect(x - 2, y + n * 35, 14, 4);
      }
      ctx.restore();
    }

    drawLinternaChica(ctx, x, y) {
      ctx.save();
      // Linterna roja
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(x, y, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x - 6, y - 20, 12, 4);
      ctx.fillRect(x - 6, y + 18, 12, 4);
      // Borla dorada
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 22);
      ctx.lineTo(x, y + 36);
      ctx.stroke();
      ctx.restore();
    }

    /* Dibujo de plataformas adaptadas a cada ciudad */
    drawPlatforms(ctx, city) {
      for (const plat of this.platforms) {
        if (plat.type === 'ground') {
          // Cubierta temática
          ctx.fillStyle = city.groundColor;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, 24, [16, 16, 0, 0]);
          ctx.fill();

          // Ribete decorativo
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
          // Cabina del teleférico de Santiago como plataforma
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 14);
          ctx.fill();

          // Ventanillas de cristal
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
          // Teja curva de pagoda china
          ctx.fillStyle = '#b91c1c';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y + 6, plat.w, plat.h - 6, 8);
          ctx.fill();

          // Borde alero dorado
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(plat.x - 8, plat.y + 8);
          ctx.quadraticCurveTo(plat.x + plat.w / 2, plat.y - 4, plat.x + plat.w + 8, plat.y + 8);
          ctx.lineTo(plat.x + plat.w, plat.y + 4);
          ctx.lineTo(plat.x, plat.y + 4);
          ctx.closePath();
          ctx.fill();

        } else {
          // Nubes esponjosas flotantes (Concepción / La Serena / Río)
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(107, 143, 199, 0.28)';
          ctx.shadowBlur = 10;
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

    drawSprings(ctx, city) {
      for (const sp of this.springs) {
        const bounce = sp.timer > 0 ? Math.sin(sp.timer * 20) * 8 : 0;
        ctx.fillStyle = '#ff7eaa';
        ctx.beginPath();
        ctx.roundRect(sp.x, sp.y + bounce, sp.w, sp.h - bounce, 12);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.fillText(sp.emoji || '🌸', sp.x + sp.w / 2 - 8, sp.y + 16 + bounce);
      }
    }

    drawCollectibles(ctx, city) {
      for (const cp of this.cupcakes) {
        if (!cp.got) {
          const hoverY = Math.sin(performance.now() * 0.005 + cp.x) * 7;
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(city.itemIcon, cp.x, cp.y + hoverY);

          // Brillo estrellita
          ctx.font = '14px sans-serif';
          ctx.fillText('✨', cp.x + 18, cp.y - 12 + hoverY);
        }
      }
    }

    drawGoalPicnic(ctx, city) {
      const goalX = this.levelWidth - 360;

      // Arcoíris y globos en la meta
      ctx.font = '54px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌈', goalX + 80, 310);
      ctx.fillText('🎈', goalX - 80, 360);
      ctx.font = '42px sans-serif';
      ctx.fillText('🧺', goalX + 80, 425);

      // Amigos esperándote en la meta
      if (this.heroImages['milk'] && this.heroImages['milk'].complete) {
        ctx.drawImage(this.heroImages['milk'], goalX - 50, 362, 75, 68);
      }
      if (this.heroImages['purin'] && this.heroImages['purin'].complete) {
        ctx.drawImage(this.heroImages['purin'], goalX + 30, 355, 74, 74);
      }
      if (this.heroImages['mocha'] && this.heroImages['mocha'].complete) {
        ctx.drawImage(this.heroImages['mocha'], goalX + 110, 365, 78, 64);
      }
      if (this.heroImages['chiffon'] && this.heroImages['chiffon'].complete) {
        ctx.drawImage(this.heroImages['chiffon'], goalX + 190, 358, 80, 68);
      }
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.platformerGame = new CinnamorollPlatformer();
})();
