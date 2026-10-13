/* Super Cinnamoroll Run (Aventura 2D de Plataformas)
 * Motor robusto con resolución virtual fija (960x540) adaptada para que NUNCA se corte.
 * Sprite oficial de Cinnamoroll con planeo de orejitas (ear-glide), trampolines de nubes,
 * y meta picnic con los sprites oficiales de Milk, Pompompurin y Mocha.
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const VW = 960;
  const VH = 540;

  class CinnamorollPlatformer {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.ctx = null;
      this.animId = null;
      this.running = false;

      // Sprites oficiales (carga bajo demanda)
      this.cinnaImg = null;
      this.milkImg = null;
      this.purinImg = null;
      this.mochaImg = null;

      // Estado del jugador
      this.p = {
        x: 80,
        y: 350,
        vx: 0,
        vy: 0,
        w: 70,
        h: 46,
        grounded: false,
        gliding: false,
        facing: 1,
        animTimer: 0
      };

      this.camX = 0;
      this.levelWidth = 3200;
      this.keys = { left: false, right: false, jump: false };

      this.cupcakes = [];
      this.platforms = [];
      this.springs = [];
      this.particles = [];
      this.score = 0;
      this.totalCupcakes = 8;
      this.reachedGoal = false;
    }

    ensureAssets() {
      if (this.cinnaImg) return;
      this.cinnaImg = new Image();
      this.cinnaImg.src = 'assets/cinnamoroll_fly.png';

      this.milkImg = new Image();
      this.milkImg.src = 'assets/milk_teddy.png';

      this.purinImg = new Image();
      this.purinImg.src = 'assets/pompompurin.png';

      this.mochaImg = new Image();
      this.mochaImg.src = 'assets/mocha.png';

      this.chiffonImg = new Image();
      this.chiffonImg.src = 'assets/chiffon.png';
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
      this.container.innerHTML = `
        <div class="platformer-wrapper">
          <canvas id="platformerCanvas" width="${VW}" height="${VH}"></canvas>

          <!-- HUD superior -->
          <div class="plat-hud">
            <div class="plat-score-pill">
              <span class="plat-cupcake-ico">🧁</span>
              <span id="platScoreNum">0 / ${this.totalCupcakes}</span>
            </div>
            <div class="plat-hint-tag">🪽 ¡Mantén SALTO para planear suave con tus orejitas!</div>
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
              </div>
              <p>¡Amanda, eres la heroína de Cinnamoroll Land! 🌸</p>
              <button class="btn-plat-replay" id="btnPlatReplay">▶ ¡Jugar otra aventura!</button>
            </div>
          </div>
        </div>
      `;
    }

    setupCanvas() {
      this.canvas = this.container.querySelector('#platformerCanvas');
      this.ctx = this.canvas.getContext('2d');
    }

    buildLevel() {
      this.p.x = 80;
      this.p.y = 350;
      this.p.vx = 0;
      this.p.vy = 0;
      this.p.grounded = false;
      this.score = 0;
      this.reachedGoal = false;
      this.particles = [];

      // Plataformas calculadas proporcionalmente para que NUNCA se corten
      const groundY = 440;

      this.platforms = [
        // Suelos principales
        { x: 0, y: groundY, w: 640, h: 100, type: 'ground' },
        { x: 740, y: groundY, w: 600, h: 100, type: 'ground' },
        { x: 1440, y: groundY, w: 650, h: 100, type: 'ground' },
        { x: 2200, y: groundY, w: 1000, h: 100, type: 'ground' }, // Meta

        // Nubes flotantes seguras
        { x: 280, y: 320, w: 150, h: 32, type: 'cloud' },
        { x: 480, y: 240, w: 160, h: 32, type: 'cloud' },
        { x: 780, y: 300, w: 150, h: 32, type: 'cloud' },
        { x: 1000, y: 220, w: 160, h: 32, type: 'cloud' },
        { x: 1250, y: 310, w: 150, h: 32, type: 'cloud' },
        { x: 1520, y: 240, w: 160, h: 32, type: 'cloud' },
        { x: 1780, y: 190, w: 160, h: 32, type: 'cloud' },
        { x: 2020, y: 280, w: 160, h: 32, type: 'cloud' }
      ];

      // Trampolines elásticos
      this.springs = [
        { x: 420, y: groundY - 18, w: 70, h: 22, timer: 0 },
        { x: 1140, y: groundY - 18, w: 70, h: 22, timer: 0 },
        { x: 1880, y: groundY - 18, w: 70, h: 22, timer: 0 }
      ];

      // 8 Cupcakes coleccionables
      this.cupcakes = [
        { x: 350, y: 270, got: false },
        { x: 550, y: 190, got: false },
        { x: 850, y: 250, got: false },
        { x: 1080, y: 170, got: false },
        { x: 1320, y: 260, got: false },
        { x: 1600, y: 190, got: false },
        { x: 1850, y: 140, got: false },
        { x: 2100, y: 230, got: false }
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
          this.tryJump();
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
        if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') this.keys.jump = false;
      });

      const btnL = this.container.querySelector('#btnPlatLeft');
      const btnR = this.container.querySelector('#btnPlatRight');
      const btnJ = this.container.querySelector('#btnPlatJump');

      const hookTouch = (el, pressFn, releaseFn) => {
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
        this.tryJump();
      }, () => {
        this.keys.jump = false;
      });

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
      if (this.p.grounded) {
        this.p.vy = -12.5;
        this.p.grounded = false;
        A.whoosh(true);
        this.burstParticles(this.p.x + 35, this.p.y + 40, 8, ['#ffffff', '#ffb6d2']);
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

      const moveSpeed = 260;
      if (this.keys.left) {
        p.vx = -moveSpeed;
        p.facing = -1;
      } else if (this.keys.right) {
        p.vx = moveSpeed;
        p.facing = 1;
      } else {
        p.vx *= 0.82;
        if (Math.abs(p.vx) < 5) p.vx = 0;
      }
      p.x += p.vx * dt;

      // Planeo suave con orejitas (Ear-Glide)
      p.gliding = !p.grounded && this.keys.jump && p.vy > 0;
      const gravity = p.gliding ? 200 : 660;
      p.vy += gravity * dt;

      if (p.gliding) {
        p.vy = Math.min(p.vy, 85);
      }
      p.y += p.vy * dt;
      p.animTimer += dt * 8;

      // Colisión con plataformas
      p.grounded = false;
      for (const plat of this.platforms) {
        if (
          p.x + p.w * 0.7 > plat.x &&
          p.x + p.w * 0.3 < plat.x + plat.w &&
          p.y + p.h >= plat.y &&
          p.y + p.h <= plat.y + 24 &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.grounded = true;
        }
      }

      // Colisión con trampolines
      for (const sp of this.springs) {
        if (sp.timer > 0) sp.timer -= dt;
        if (
          p.x + p.w * 0.7 > sp.x &&
          p.x + p.w * 0.3 < sp.x + sp.w &&
          p.y + p.h >= sp.y &&
          p.y + p.h <= sp.y + 20 &&
          p.vy >= 0
        ) {
          p.vy = -16.5;
          sp.timer = 0.35;
          A.softBoing();
          this.burstParticles(sp.x + sp.w / 2, sp.y, 10, ['#ff8fbf', '#ffe066']);
        }
      }

      // Coleccionables
      for (const cp of this.cupcakes) {
        if (!cp.got && Math.hypot((p.x + 35) - cp.x, (p.y + 20) - cp.y) < 42) {
          cp.got = true;
          this.score++;
          A.collect(this.score);
          this.burstParticles(cp.x, cp.y, 12, ['#ff6b9d', '#ffe066', '#ffffff']);
          this.updateHUD();
        }
      }

      // Rescate mágico si cae al vacío (¡Amanda nunca pierde!)
      if (p.y > 490) {
        p.x = Math.max(80, p.x - 200);
        p.y = 260;
        p.vy = -6;
        A.whoosh(true);
        this.burstParticles(p.x + 35, p.y + 20, 16, ['#aee0ff', '#ffffff']);
      }

      // Meta picnic
      if (p.x >= 2800 && !this.reachedGoal) {
        this.reachedGoal = true;
        A.celebrate();
        this.container.querySelector('#platVictoryScreen').classList.remove('hidden');
      }

      // Cámara horizontal
      const targetCamX = p.x - VW * 0.35;
      this.camX += (targetCamX - this.camX) * 0.1;
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
        const spd = 40 + Math.random() * 120;
        this.particles.push({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 30,
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
      sky.addColorStop(0, '#9fd3ff');
      sky.addColorStop(0.5, '#d4ecff');
      sky.addColorStop(1, '#ffeaf4');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, VW, VH);

      ctx.save();
      ctx.translate(-this.camX, 0);

      // 2. Colinas de caramelo lejanas
      ctx.fillStyle = 'rgba(255, 225, 240, 0.7)';
      for (let x = -200; x < this.levelWidth + 400; x += 320) {
        ctx.beginPath();
        ctx.arc(x, 480, 200, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Plataformas
      for (const plat of this.platforms) {
        if (plat.type === 'ground') {
          ctx.fillStyle = '#bbf2c8';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, 24, [14, 14, 0, 0]);
          ctx.fill();

          ctx.fillStyle = '#eed6c4';
          ctx.fillRect(plat.x, plat.y + 20, plat.w, plat.h);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(107, 143, 199, 0.25)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 16);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // 4. Trampolines rosas
      for (const sp of this.springs) {
        const sq = sp.timer > 0 ? 6 : 0;
        ctx.fillStyle = '#ff8fbf';
        ctx.beginPath();
        ctx.roundRect(sp.x, sp.y + sq, sp.w, sp.h - sq, 10);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.fillText('☁️', sp.x + sp.w / 2 - 8, sp.y + 16);
      }

      // 5. Cupcakes flotantes
      for (const cp of this.cupcakes) {
        if (!cp.got) {
          const bob = Math.sin(performance.now() * 0.005 + cp.x) * 6;
          ctx.font = '28px sans-serif';
          ctx.fillText('🧁', cp.x - 14, cp.y + bob);
        }
      }

      // 6. Meta picnic con los amigos oficiales
      ctx.font = '48px sans-serif';
      ctx.fillText('🌈', 2850, 340);
      ctx.font = '36px sans-serif';
      ctx.fillText('🧺', 2950, 435);

      if (this.milkImg.complete) {
        ctx.drawImage(this.milkImg, 2900, 365, 80, 70);
      }
      if (this.purinImg.complete) {
        ctx.drawImage(this.purinImg, 2985, 360, 75, 75);
      }
      if (this.mochaImg.complete) {
        ctx.drawImage(this.mochaImg, 3065, 370, 80, 65);
      }
      if (this.chiffonImg && this.chiffonImg.complete) {
        ctx.drawImage(this.chiffonImg, 3150, 362, 85, 70);
      }

      // 7. Cinnamoroll oficial
      ctx.save();
      ctx.translate(this.p.x + this.p.w / 2, this.p.y + this.p.h / 2);
      ctx.scale(this.p.facing, 1);

      const bob = this.p.grounded ? Math.sin(this.p.animTimer) * 3 : 0;
      const tilt = this.p.gliding ? 0.08 * Math.sin(this.p.animTimer) : 0;
      ctx.rotate(tilt);

      if (this.cinnaImg.complete) {
        ctx.drawImage(this.cinnaImg, -this.p.w / 2, -this.p.h / 2 + bob, this.p.w, this.p.h);
      }
      ctx.restore();

      // 8. Partículas
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
