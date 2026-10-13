/* Super Cinnamoroll Run (Aventura 2D de Plataformas)
 * Juego tipo Mario Bros adaptado para una niña de 5 años:
 * Planeo suave con orejitas (ear-glide), camas elásticas de nubes, pastelitos para recoger,
 * rescate mágico si cae (sin perder nunca), y fiesta picnic con Milk y Mocha en la meta.
 */
(function () {
  const { audio: A, character: CH } = window.Cinnamo;

  class CinnamorollPlatformer {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.ctx = null;
      this.animId = null;
      this.running = false;

      // Estado del jugador Cinnamoroll
      this.p = {
        x: 80,
        y: 200,
        vx: 0,
        vy: 0,
        w: 52,
        h: 38,
        grounded: false,
        gliding: false,
        facing: 1, // 1: derecha, -1: izquierda
        flapTimer: 0,
        spinTimer: 0,
        mood: 'idle'
      };

      // Cámara horizontal
      this.camX = 0;
      this.levelWidth = 3200;

      // Teclas / Controles virtuales
      this.keys = { left: false, right: false, jump: false };

      // Coleccionables y elementos del nivel
      this.cupcakes = [];
      this.clouds = [];
      this.platforms = [];
      this.springs = [];
      this.particles = [];
      this.score = 0;
      this.totalCupcakes = 8;
      this.reachedGoal = false;
    }

    init(containerEl) {
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
          <canvas id="platformerCanvas"></canvas>

          <!-- Marcador superior de fresas y progreso -->
          <div class="plat-hud">
            <div class="plat-score-pill">
              <span class="plat-cupcake-ico">🧁</span>
              <span id="platScoreNum">0 / ${this.totalCupcakes}</span>
            </div>
            <div class="plat-hint-tag">🪽 ¡Mantén salto para planear en el aire!</div>
          </div>

          <!-- Controles táctiles en pantalla para iPad / Tablets -->
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

          <!-- Pantalla de victoria al llegar a la meta -->
          <div class="plat-victory-overlay hidden" id="platVictoryScreen">
            <div class="plat-victory-card">
              <div class="victory-ribbon">🎉 ¡PICNIC MÁGICO COMPLETADO! 🎉</div>
              <h2>¡Llegaste a la meta con todos los dulces!</h2>
              <div class="picnic-scene-art">
                <img src="cinnamoroll_sprite.png" class="picnic-cinna" alt="Cinnamoroll" />
                <div class="picnic-basket">🧺🍰🍓✨</div>
              </div>
              <p>¡Amanda, Cinnamoroll y sus amigos están felices disfrutando el picnic!</p>
              <button class="btn-plat-replay" id="btnPlatReplay">▶ ¡Jugar otra aventura!</button>
            </div>
          </div>
        </div>
      `;
    }

    setupCanvas() {
      this.canvas = this.container.querySelector('#platformerCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = this.canvas.clientWidth || window.innerWidth;
      this.canvas.height = this.canvas.clientHeight || (window.innerHeight - 60);
    }

    buildLevel() {
      this.p.x = 80;
      this.p.y = 220;
      this.p.vx = 0;
      this.p.vy = 0;
      this.p.grounded = false;
      this.score = 0;
      this.reachedGoal = false;
      this.particles = [];

      // Plataformas del mundo (suelo y nubes flotantes)
      this.platforms = [
        // Suelo inicial
        { x: 0, y: 380, w: 600, h: 200, type: 'ground' },
        { x: 700, y: 380, w: 550, h: 200, type: 'ground' },
        { x: 1350, y: 380, w: 700, h: 200, type: 'ground' },
        { x: 2150, y: 380, w: 1050, h: 200, type: 'ground' }, // Meta final

        // Nubes flotantes
        { x: 280, y: 280, w: 140, h: 36, type: 'cloud' },
        { x: 500, y: 220, w: 160, h: 36, type: 'cloud' },
        { x: 720, y: 250, w: 150, h: 36, type: 'cloud' },
        { x: 960, y: 210, w: 170, h: 36, type: 'cloud' },
        { x: 1200, y: 270, w: 150, h: 36, type: 'cloud' },
        { x: 1450, y: 230, w: 160, h: 36, type: 'cloud' },
        { x: 1720, y: 200, w: 160, h: 36, type: 'cloud' },
        { x: 1980, y: 260, w: 160, h: 36, type: 'cloud' },
      ];

      // Trampolines de nubes rosas (salto elástico gigante)
      this.springs = [
        { x: 420, y: 360, w: 65, h: 25, bounceTimer: 0 },
        { x: 1100, y: 360, w: 65, h: 25, bounceTimer: 0 },
        { x: 1850, y: 360, w: 65, h: 25, bounceTimer: 0 },
      ];

      // 8 Cupcakes y fresas mágicas
      this.cupcakes = [
        { x: 340, y: 230, got: false },
        { x: 560, y: 170, got: false },
        { x: 800, y: 200, got: false },
        { x: 1020, y: 160, got: false },
        { x: 1270, y: 220, got: false },
        { x: 1520, y: 180, got: false },
        { x: 1790, y: 150, got: false },
        { x: 2050, y: 210, got: false },
      ];

      this.updateHUD();
    }

    bindInputs() {
      // Teclado
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

      // Controles táctiles
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

      // Botón reiniciar en victoria
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
        this.burstParticles(this.p.x + 25, this.p.y + 35, 6, ['#ffffff', '#ffb6d2']);
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

      // Movimiento horizontal
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

      // Gravedad y planeo con orejitas (Ear-Glide)
      p.gliding = !p.grounded && this.keys.jump && p.vy > 0;
      const gravity = p.gliding ? 220 : 680;
      p.vy += gravity * dt;

      if (p.gliding) {
        p.vy = Math.min(p.vy, 90); // Caída muy suave como una pluma
        p.flapTimer += dt * 15;
      } else {
        p.flapTimer += dt * 8;
      }
      p.y += p.vy * dt;

      // Colisión con plataformas
      p.grounded = false;
      for (const plat of this.platforms) {
        if (
          p.x + p.w * 0.7 > plat.x &&
          p.x + p.w * 0.3 < plat.x + plat.w &&
          p.y + p.h >= plat.y &&
          p.y + p.h <= plat.y + 26 &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.grounded = true;
        }
      }

      // Colisión con trampolines
      for (const sp of this.springs) {
        if (sp.bounceTimer > 0) sp.bounceTimer -= dt;
        if (
          p.x + p.w * 0.7 > sp.x &&
          p.x + p.w * 0.3 < sp.x + sp.w &&
          p.y + p.h >= sp.y &&
          p.y + p.h <= sp.y + 20 &&
          p.vy >= 0
        ) {
          p.vy = -16.5; // Gran rebote
          sp.bounceTimer = 0.35;
          A.softBoing();
          this.burstParticles(sp.x + sp.w / 2, sp.y, 10, ['#ff8fbf', '#ffe066']);
        }
      }

      // Recolección de cupcakes y fresas
      for (const cp of this.cupcakes) {
        if (!cp.got && Math.hypot((p.x + 25) - cp.x, (p.y + 18) - cp.y) < 38) {
          cp.got = true;
          this.score++;
          A.collect(this.score);
          this.burstParticles(cp.x, cp.y, 12, ['#ff6b9d', '#ffe066', '#ffffff']);
          this.updateHUD();
        }
      }

      // Rescate mágico si cae al vacío (¡para que Amanda nunca pierda!)
      if (p.y > 520) {
        p.x = Math.max(80, p.x - 180);
        p.y = 200;
        p.vy = -6;
        A.whoosh(true);
        this.burstParticles(p.x + 25, p.y + 20, 16, ['#aee0ff', '#ffffff']);
      }

      // Detección de meta picnic
      if (p.x >= 2800 && !this.reachedGoal) {
        this.reachedGoal = true;
        A.celebrate();
        this.container.querySelector('#platVictoryScreen').classList.remove('hidden');
      }

      // Suavizado de la cámara
      const targetCamX = p.x - this.canvas.width * 0.35;
      this.camX += (targetCamX - this.camX) * 0.08;
      this.camX = Math.max(0, Math.min(this.levelWidth - this.canvas.width, this.camX));

      // Actualizar partículas
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
      const el = this.container.querySelector('#platScoreNum');
      if (el) el.textContent = `${this.score} / ${this.totalCupcakes}`;
    }

    draw() {
      const ctx = this.ctx;
      const W = this.canvas.width;
      const H = this.canvas.height;
      ctx.clearRect(0, 0, W, H);

      // 1. Cielo y fondo pastel en gradiente
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#9fd3ff');
      sky.addColorStop(0.5, '#d4ecff');
      sky.addColorStop(1, '#ffeaf4');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(-this.camX, 0);

      // 2. Colinas de caramelo y nubes lejanas (Parallax)
      ctx.fillStyle = 'rgba(255, 230, 240, 0.65)';
      for (let x = -200; x < this.levelWidth + 400; x += 320) {
        ctx.beginPath();
        ctx.arc(x, 420, 190, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Plataformas (Suelo verde pastel y nubes)
      for (const plat of this.platforms) {
        if (plat.type === 'ground') {
          // Borde superior de pasto dulce
          ctx.fillStyle = '#bbf2c8';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, 30, [16, 16, 0, 0]);
          ctx.fill();
          // Cuerpo de tierra pastel
          ctx.fillStyle = '#eed6c4';
          ctx.fillRect(plat.x, plat.y + 25, plat.w, plat.h);
        } else {
          // Nube flotante
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(107, 143, 199, 0.25)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 18);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // 4. Trampolines rosas
      for (const sp of this.springs) {
        const sq = sp.bounceTimer > 0 ? 8 : 0;
        ctx.fillStyle = '#ff8fbf';
        ctx.beginPath();
        ctx.roundRect(sp.x, sp.y + sq, sp.w, sp.h - sq, 12);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.fillText('☁️', sp.x + sp.w / 2 - 8, sp.y + 18);
      }

      // 5. Cupcakes coleccionables flotantes
      for (const cp of this.cupcakes) {
        if (!cp.got) {
          const bob = Math.sin(performance.now() * 0.005 + cp.x) * 6;
          ctx.font = '28px sans-serif';
          ctx.fillText('🧁', cp.x - 14, cp.y + bob);
        }
      }

      // 6. Meta de llegada: Arcoíris y Picnic
      ctx.font = '48px sans-serif';
      ctx.fillText('🌈', 2850, 290);
      ctx.fillText('🧺', 2940, 375);
      ctx.font = '36px sans-serif';
      ctx.fillText('🍼', 3000, 375); // Milk esperando
      ctx.fillText('🎀', 3050, 375); // Mocha esperando

      // 7. Cinnamoroll (Animado con sus orejitas)
      ctx.save();
      ctx.translate(this.p.x + this.p.w / 2, this.p.y + this.p.h / 2);
      ctx.scale(this.p.facing, 1);

      const flap = Math.sin(this.p.flapTimer) * (this.p.gliding ? 0.6 : 0.25);
      CH.draw(ctx, 0, 0, 72, {
        t: performance.now() * 0.002,
        flapSpeed: this.p.gliding ? 20 : 8,
        flapAmp: this.p.gliding ? 0.65 : 0.3,
        mood: this.p.gliding ? 'happy' : 'idle',
        blink: false,
        tilt: this.p.gliding ? 0.15 : 0
      });
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
