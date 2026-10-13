/* Super Cinnamoroll Run (Aventura 2D de Plataformas de Sanrio)
 * - Selección de personaje jugable: Cinnamoroll, Milk, Pompompurin y Chiffon.
 * - Motor de salto y físicas corregido (snappy jump con velocidad delta-time real).
 * - Coyote time y Jump buffering para control ultra receptivo preescolar.
 * - Squash & Stretch, animación de orejitas, inclinación de carrera y planeo suave.
 * - Fondo en paralaje multicapa (cielo, arcoíris, colinas de malvavisco y flores).
 * - Controles centrados y responsivos en PC y móviles.
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
    }
  ];

  class CinnamorollPlatformer {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.ctx = null;
      this.animId = null;
      this.running = false;
      this.inCharSelect = false;

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
        wasGrounded: false
      };

      this.camX = 0;
      this.levelWidth = 3400;
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
      // Cargar también Mocha para el picnic final
      if (!this.heroImages['mocha']) {
        const mocha = new Image();
        mocha.src = 'assets/mocha.png';
        this.heroImages['mocha'] = mocha;
      }
    }

    init(containerEl) {
      this.ensureAssets();
      this.container = containerEl;
      this.renderDOM();
      this.setupCanvas();
      this.buildLevel();
      this.bindInputs();
      this.startLoop();
    }

    renderDOM() {
      const hero = this.selectedHero;
      this.container.innerHTML = `
        <div class="platformer-wrapper">
          <canvas id="platformerCanvas" width="${VW}" height="${VH}"></canvas>

          <!-- HUD superior -->
          <div class="plat-hud">
            <div class="plat-score-pill">
              <span class="plat-cupcake-ico">🧁</span>
              <span id="platScoreNum">0 / ${this.totalCupcakes}</span>
            </div>

            <div class="plat-hero-pill" id="platHeroPill">
              <img src="${hero.imgSrc}" alt="${hero.name}" class="plat-hud-avatar" />
              <span>${hero.name}</span>
              <button class="btn-plat-switch-hero" id="btnPlatSwitchHero" title="Cambiar Personaje">🔄 Cambiar</button>
            </div>

            <div class="plat-hint-tag">🪽 ¡Mantén SALTO para planear en el aire!</div>
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

          <!-- Modal de Selección de Personaje -->
          <div class="plat-char-modal hidden" id="platCharModal">
            <div class="plat-char-modal-box">
              <div class="plat-modal-header">
                <span class="plat-modal-badge">✨ Elige a tu Amigo de Sanrio ✨</span>
                <h2>¿Con quién quieres correr hoy, Amanda?</h2>
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
              <div class="victory-ribbon">🎉 ¡PICNIC MÁGICO CON TUS AMIGOS! 🎉</div>
              <h2>¡Llegaste a la meta con todos los pastelitos!</h2>
              <div class="picnic-friends-stage">
                <img src="assets/cinnamoroll_fly.png" class="picnic-char cinna" alt="Cinnamoroll" />
                <img src="assets/milk_teddy.png" class="picnic-char milk" alt="Milk" />
                <img src="assets/pompompurin.png" class="picnic-char purin" alt="Pompompurin" />
                <img src="assets/mocha.png" class="picnic-char mocha" alt="Mocha" />
                <img src="assets/chiffon.png" class="picnic-char chiffon" alt="Chiffon" />
              </div>
              <p>¡Amanda, eres la mejor amiga de Cinnamoroll Land! 🌸</p>
              <button class="btn-plat-replay" id="btnPlatReplay">▶ ¡Jugar otra aventura!</button>
            </div>
          </div>
        </div>
      `;

      // Modal select hero
      const modal = this.container.querySelector('#platCharModal');
      const btnSwitch = this.container.querySelector('#btnPlatSwitchHero');
      if (btnSwitch) {
        btnSwitch.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          modal.classList.remove('hidden');
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
            modal.classList.add('hidden');
          }
        });
      });
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

    setupCanvas() {
      this.canvas = this.container.querySelector('#platformerCanvas');
      this.ctx = this.canvas.getContext('2d');
    }

    buildLevel() {
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
      this.score = 0;
      this.reachedGoal = false;
      this.camX = 0;

      // Nubes decorativas en el cielo lejano
      this.sceneryClouds = [];
      for (let i = 0; i < 18; i++) {
        this.sceneryClouds.push({
          x: i * 220 + Math.random() * 80,
          y: 35 + (i % 4) * 42,
          w: 80 + (i % 3) * 35,
          speed: 0.2 + (i % 3) * 0.15
        });
      }

      // Plataformas
      this.platforms = [
        // Suelo inicial suave
        { x: -50, y: 440, w: 680, h: 100, type: 'ground' },
        // Escalera de nubes de azúcar
        { x: 700, y: 380, w: 160, h: 26, type: 'cloud' },
        { x: 920, y: 320, w: 160, h: 26, type: 'cloud' },
        { x: 1140, y: 260, w: 180, h: 26, type: 'cloud' },
        // Gran isla flotante de waffle
        { x: 1380, y: 390, w: 520, h: 100, type: 'ground' },
        // Islas altas sobre el arcoíris
        { x: 1960, y: 310, w: 160, h: 26, type: 'cloud' },
        { x: 2180, y: 240, w: 180, h: 26, type: 'cloud' },
        { x: 2420, y: 320, w: 170, h: 26, type: 'cloud' },
        // Pradera final de picnic
        { x: 2650, y: 430, w: 850, h: 110, type: 'ground' }
      ];

      // Trampolines de gelatina rosa
      this.springs = [
        { x: 540, y: 418, w: 56, h: 22, timer: 0 },
        { x: 1780, y: 368, w: 56, h: 22, timer: 0 },
        { x: 2520, y: 408, w: 56, h: 22, timer: 0 }
      ];

      // Cupcakes flotantes
      this.cupcakes = [
        { x: 420, y: 380, got: false },
        { x: 780, y: 320, got: false },
        { x: 1000, y: 260, got: false },
        { x: 1220, y: 200, got: false },
        { x: 1540, y: 330, got: false },
        { x: 1720, y: 320, got: false },
        { x: 2040, y: 250, got: false },
        { x: 2260, y: 180, got: false }
      ];

      this.updateHUD();
    }

    bindInputs() {
      window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
        if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
          A.unlock();
          this.keys.jump = true;
          this.p.jumpBuffer = 0.15; // Jump buffering
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
        if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
          this.keys.jump = false;
          // Variable jump height: suelta el salto antes para salto corto
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

      // Toque en el lienzo derecho también salta (intuitivo en móvil)
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

      const btnReplay = this.container.querySelector('#btnPlatReplay');
      if (btnReplay) {
        btnReplay.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          this.container.querySelector('#platVictoryScreen').classList.add('hidden');
          this.buildLevel();
        });
      }
    }

    tryJump() {
      const p = this.p;
      // Salto habilitado si está en el suelo o dentro de coyote time
      if (p.grounded || p.coyoteTimer > 0) {
        p.vy = -this.selectedHero.jumpPower;
        p.grounded = false;
        p.coyoteTimer = 0;
        p.jumpBuffer = 0;

        // Animación de estiramiento vertical al saltar (Stretch)
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

      // Movimiento horizontal suave con aceleración e inercia
      const maxSpeed = 290;
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
        // Estela mágica de brillos al planear
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

      // Squash & Stretch recuperación elástica a 1.0
      p.squashX += (1.0 - p.squashX) * Math.min(1, dt * 10);
      p.squashY += (1.0 - p.squashY) * Math.min(1, dt * 10);

      // Temporizador de animación de pasos
      if (p.grounded && Math.abs(p.vx) > 10) {
        p.animTimer += dt * 12;
      } else {
        p.animTimer += dt * 5;
      }

      // Colisión con plataformas
      p.wasGrounded = p.grounded;
      p.grounded = false;

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

          // Si acaba de aterrizar, squash suave de impacto
          if (!p.wasGrounded) {
            p.squashX = 1.25;
            p.squashY = 0.78;
            A.softBoing();
            this.burstParticles(p.x + p.w / 2, p.y + p.h, 6, ['#ffffff', hero.trailColor]);
          }
        }
      }

      // Colisión con trampolines rosas
      for (const sp of this.springs) {
        if (sp.timer > 0) sp.timer -= dt;
        if (
          p.x + p.w * 0.7 > sp.x &&
          p.x + p.w * 0.3 < sp.x + sp.w &&
          p.y + p.h >= sp.y &&
          p.y + p.h <= sp.y + 24 &&
          p.vy >= 0
        ) {
          p.vy = -680; // Súper impulso elástico hacia las nubes
          p.grounded = false;
          sp.timer = 0.35;
          p.squashX = 0.75;
          p.squashY = 1.35;
          A.softBoing();
          A.kawaiiChirp('cheer');
          this.burstParticles(sp.x + sp.w / 2, sp.y, 14, ['#ff8fbf', '#ffe066', '#ffffff']);
        }
      }

      // Recolección de pastelitos
      for (const cp of this.cupcakes) {
        if (!cp.got && Math.hypot((p.x + p.w / 2) - cp.x, (p.y + p.h / 2) - cp.y) < 46) {
          cp.got = true;
          this.score++;
          A.collect(this.score);
          this.burstParticles(cp.x, cp.y, 14, ['#ff6b9d', '#ffe066', '#ffffff']);
          this.updateHUD();
        }
      }

      // Rescate mágico si cae (Amanda nunca pierde)
      if (p.y > 510) {
        p.x = Math.max(80, p.x - 240);
        p.y = 240;
        p.vy = -340;
        A.whoosh(true);
        this.burstParticles(p.x + p.w / 2, p.y + p.h / 2, 18, ['#aee0ff', '#ffffff', '#ffd1dc']);
      }

      // Meta picnic al final
      if (p.x >= 2850 && !this.reachedGoal) {
        this.reachedGoal = true;
        A.celebrate();
        this.container.querySelector('#platVictoryScreen').classList.remove('hidden');
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
      const el = this.container ? this.container.querySelector('#platScoreNum') : null;
      if (el) el.textContent = `${this.score} / ${this.totalCupcakes}`;
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, VW, VH);

      // 1. Cielo en degradé pastel
      const sky = ctx.createLinearGradient(0, 0, 0, VH);
      sky.addColorStop(0, '#98d2ff');
      sky.addColorStop(0.45, '#d6efff');
      sky.addColorStop(1, '#ffe8f3');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, VW, VH);

      // 2. PARALAJE CAPA 1: Nubes lejanas y Arcoíris (0.12x velocidad)
      ctx.save();
      ctx.translate(-this.camX * 0.12, 0);

      // Arcoíris gigante de fondo
      ctx.save();
      ctx.globalAlpha = 0.55;
      const rainbowColors = ['#ff9999', '#ffcc99', '#ffff99', '#99ff99', '#99ccff', '#cc99ff'];
      rainbowColors.forEach((col, i) => {
        ctx.strokeStyle = col;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(950, 480, 420 - i * 14, Math.PI, 0);
        ctx.stroke();
      });
      ctx.restore();

      // Nubes decorativas en el cielo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (const cl of this.sceneryClouds) {
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, cl.w * 0.28, 0, Math.PI * 2);
        ctx.arc(cl.x + cl.w * 0.26, cl.y - cl.w * 0.12, cl.w * 0.35, 0, Math.PI * 2);
        ctx.arc(cl.x + cl.w * 0.55, cl.y, cl.w * 0.26, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. PARALAJE CAPA 2: Colinas de Fresa y Algodón de Azúcar (0.35x velocidad)
      ctx.save();
      ctx.translate(-this.camX * 0.35, 0);
      ctx.fillStyle = 'rgba(255, 218, 235, 0.75)';
      for (let x = -300; x < this.levelWidth * 0.5 + 400; x += 360) {
        ctx.beginPath();
        ctx.arc(x, 510, 240, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 4. MUNDO PRINCIPAL (1.0x velocidad con cámara del jugador)
      ctx.save();
      ctx.translate(-this.camX, 0);

      // Flores y detalles en el suelo
      for (let fx = 60; fx < this.levelWidth; fx += 140) {
        ctx.font = '22px sans-serif';
        ctx.fillText(['🌸', '🌼', '🍓', '✨'][Math.floor(fx / 140) % 4], fx, 436);
      }

      // Plataformas
      for (const plat of this.platforms) {
        if (plat.type === 'ground') {
          // Cubierta verde menta con crema
          ctx.fillStyle = '#bdf4cb';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, 24, [16, 16, 0, 0]);
          ctx.fill();

          // Glaseado ondulado blanco
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          for (let wx = plat.x; wx < plat.x + plat.w; wx += 28) {
            ctx.arc(wx + 14, plat.y + 22, 10, 0, Math.PI);
          }
          ctx.fill();

          // Base de galleta waffle
          ctx.fillStyle = '#edd2be';
          ctx.fillRect(plat.x, plat.y + 24, plat.w, plat.h);

          // Líneas de waffle
          ctx.strokeStyle = '#d9b69b';
          ctx.lineWidth = 2.5;
          for (let ly = plat.y + 36; ly < plat.y + plat.h; ly += 20) {
            ctx.beginPath();
            ctx.moveTo(plat.x, ly);
            ctx.lineTo(plat.x + plat.w, ly);
            ctx.stroke();
          }
        } else {
          // Nubes esponjosas flotantes
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(107, 143, 199, 0.28)';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 16);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Franja pastel central
          ctx.fillStyle = '#ffdeeb';
          ctx.beginPath();
          ctx.roundRect(plat.x + 8, plat.y + 6, plat.w - 16, 6, 999);
          ctx.fill();
        }
      }

      // Trampolines de gelatina rosa
      for (const sp of this.springs) {
        const bounce = sp.timer > 0 ? Math.sin(sp.timer * 20) * 8 : 0;
        ctx.fillStyle = '#ff7eaa';
        ctx.beginPath();
        ctx.roundRect(sp.x, sp.y + bounce, sp.w, sp.h - bounce, 12);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.fillText('☁️', sp.x + sp.w / 2 - 8, sp.y + 16 + bounce);
      }

      // Cupcakes flotantes con anillo de brillo
      for (const cp of this.cupcakes) {
        if (!cp.got) {
          const hoverY = Math.sin(performance.now() * 0.005 + cp.x) * 7;
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🧁', cp.x, cp.y + hoverY);

          // Brillo
          ctx.font = '14px sans-serif';
          ctx.fillText('✨', cp.x + 18, cp.y - 12 + hoverY);
        }
      }

      // Meta picnic con mantel, globos y amigos
      ctx.font = '54px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌈', 3040, 310);
      ctx.fillText('🎈', 2880, 360);
      ctx.font = '42px sans-serif';
      ctx.fillText('🧺', 3040, 425);

      // Amigos en el picnic
      if (this.heroImages['milk'] && this.heroImages['milk'].complete) {
        ctx.drawImage(this.heroImages['milk'], 2920, 362, 75, 68);
      }
      if (this.heroImages['purin'] && this.heroImages['purin'].complete) {
        ctx.drawImage(this.heroImages['purin'], 3000, 355, 74, 74);
      }
      if (this.heroImages['mocha'] && this.heroImages['mocha'].complete) {
        ctx.drawImage(this.heroImages['mocha'], 3080, 365, 78, 64);
      }
      if (this.heroImages['chiffon'] && this.heroImages['chiffon'].complete) {
        ctx.drawImage(this.heroImages['chiffon'], 3160, 358, 80, 68);
      }

      // 5. PERSONAJE JUGADOR CON ANIMACIÓN EXPRESSIVA
      ctx.save();
      const hero = this.selectedHero;
      const p = this.p;

      // Bobbing de pasos en tierra
      const walkBob = p.grounded && Math.abs(p.vx) > 10 ? Math.sin(p.animTimer) * 4 : 0;
      // Inclinación aerodinámica
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
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.platformerGame = new CinnamorollPlatformer();
})();
