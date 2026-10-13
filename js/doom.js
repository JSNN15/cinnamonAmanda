/* Cinnamon Treat-Shooter 2.5D (El Repartidor Mágico de Rollitos)
 * Raycaster 2.5D estilo DOOM pero completamente pacífico y kawaii para una niña de 5 años:
 * En lugar de armas, Cinnamoroll sostiene una bandeja de rollitos de canela 🍥 y paletas 🍭
 * y recorre un laberinto de galletitas repartiendo comida a sus amigos hambrientos (Milk, Mocha, Purin, Chiffon).
 */
(function () {
  const { audio: A } = window.Cinnamo;

  // Mapa del laberinto del jardín de caramelos (1 = galleta, 2 = oblea rosa, 3 = seto de menta, 0 = camino)
  const MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 3, 0, 2, 0, 3, 3, 3, 0, 0, 1],
    [1, 0, 3, 0, 0, 0, 0, 0, 3, 0, 2, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 2, 1],
    [1, 2, 2, 0, 1, 0, 0, 3, 3, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
    [1, 0, 3, 3, 0, 2, 2, 0, 0, 0, 3, 1],
    [1, 0, 0, 3, 0, 0, 2, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];
  const MAP_W = 12;
  const MAP_H = 10;

  // Amigos que esperan dulces
  const FRIENDS_DEF = [
    { id: 'milk', name: 'Milk', x: 2.5, y: 1.8, emoji: '🍼', hungry: true, phrase: '¡Tengo hambre! 🍼' },
    { id: 'mocha', name: 'Mocha', x: 7.5, y: 2.5, emoji: '🎀', hungry: true, phrase: '¡Quiero un dulce! 🎀' },
    { id: 'pompompurin', name: 'Pompompurin', x: 9.5, y: 7.5, emoji: '🍮', hungry: true, phrase: '¡Mucho apetito! 🍮' },
    { id: 'chiffon', name: 'Chiffon', x: 1.8, y: 7.2, emoji: '🌸', hungry: true, phrase: '¡Un rollito por favor! 🌸' }
  ];

  class TreatDoomGame {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.ctx = null;
      this.animId = null;
      this.running = false;

      // Jugador
      this.player = {
        x: 1.5,
        y: 3.5,
        angle: 0,
        fov: Math.PI / 3, // 60 grados
        speed: 2.2,
        rotSpeed: 2.4
      };

      // Controles
      this.keys = { forward: false, backward: false, left: false, right: false };

      // Proyectiles de dulces lanzados
      this.treatProjectiles = [];

      // Estado de los amigos
      this.friends = [];
      this.fedCount = 0;
      this.totalFriends = FRIENDS_DEF.length;

      // Arma/Bandeja seleccionada (rollito o paleta)
      this.currentTreat = 'rollito'; // 'rollito' o 'paleta'
      this.launchBob = 0;
    }

    init(containerEl) {
      this.container = containerEl;
      this.renderDOM();
      this.setupCanvas();
      this.resetGame();
      this.bindInputs();
      this.startLoop();
    }

    renderDOM() {
      this.container.innerHTML = `
        <div class="doom-wrapper">
          <canvas id="doomCanvas"></canvas>

          <!-- Barra superior del Repartidor -->
          <div class="doom-hud">
            <div class="doom-score-pill">
              <span>💖 Amigos Felices: <strong id="doomFedCount">0 / ${this.totalFriends}</strong></span>
            </div>
            <div class="treat-switcher-pills">
              <button class="treat-type-btn active" id="btnChooseRoll" data-type="rollito">🍥 Rollito</button>
              <button class="treat-type-btn" id="btnChooseLolly" data-type="paleta">🍭 Paleta</button>
            </div>
          </div>

          <!-- Minimapa / Radar de amigos -->
          <canvas id="doomMinimap" class="doom-radar-canvas" width="120" height="100"></canvas>

          <!-- Bandeja de Cinnamoroll en primer plano (First-Person paws & tray) -->
          <div class="cinna-firstperson-tray" id="cinnaHands">
            <div class="tray-treat-display" id="trayTreatGraphic">🍥</div>
            <div class="cinna-paw paw-left">🐾</div>
            <div class="cinna-paw paw-right">🐾</div>
          </div>

          <!-- Controles virtuales en pantalla para tablets / iPad -->
          <div class="doom-touch-controls">
            <div class="doom-dpad">
              <button class="doom-touch-btn dpad-up" id="btnDoomUp">⬆️</button>
              <div class="dpad-row">
                <button class="doom-touch-btn dpad-left" id="btnDoomLeft">◀️</button>
                <button class="doom-touch-btn dpad-down" id="btnDoomDown">⬇️</button>
                <button class="doom-touch-btn dpad-right" id="btnDoomRight">▶️</button>
              </div>
            </div>

            <button class="doom-launch-big-btn" id="btnDoomLaunch">
              <span class="launch-ico" id="launchBtnIcon">🍥</span>
              <span class="launch-label">¡Repartir Dulce!</span>
            </button>
          </div>

          <!-- Victoria cuando todos los amigos comen -->
          <div class="doom-victory-overlay hidden" id="doomVictoryOverlay">
            <div class="doom-victory-box">
              <div class="victory-ribbon">💖 ¡MISIÓN DE AMISTAD CUMPLIDA! 💖</div>
              <h2>¡Ningún amigo tiene hambre hoy!</h2>
              <div class="victory-friends-parade">
                <div class="parade-item"><span>🍼 Milk</span><strong>¡Llenito!</strong></div>
                <div class="parade-item"><span>🎀 Mocha</span><strong>¡Delicioso!</strong></div>
                <div class="parade-item"><span>🍮 Purin</span><strong>¡Feliz!</strong></div>
                <div class="parade-item"><span>🌸 Chiffon</span><strong>¡Gracias!</strong></div>
              </div>
              <p>¡Amanda, eres la mejor pastelera de todo el mundo de Cinnamoroll!</p>
              <button class="btn-doom-replay" id="btnDoomReplay">▶ ¡Repartir dulces otra vez!</button>
            </div>
          </div>
        </div>
      `;
    }

    setupCanvas() {
      this.canvas = this.container.querySelector('#doomCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = this.canvas.clientWidth || window.innerWidth;
      this.canvas.height = this.canvas.clientHeight || (window.innerHeight - 60);
    }

    resetGame() {
      this.player.x = 1.5;
      this.player.y = 3.5;
      this.player.angle = 0;
      this.treatProjectiles = [];
      this.fedCount = 0;
      this.friends = FRIENDS_DEF.map(f => ({ ...f, hungry: true }));
      this.updateHUD();
    }

    bindInputs() {
      // Teclado (WASD / Flechas / Espacio)
      window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = true;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = true;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
        if (e.code === 'Space') {
          e.preventDefault();
          this.shootTreat();
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = false;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = false;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
      });

      // Controles táctiles
      const hook = (id, prop) => {
        const el = this.container.querySelector(id);
        if (!el) return;
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); A.unlock(); this.keys[prop] = true; });
        el.addEventListener('pointerup', () => { this.keys[prop] = false; });
        el.addEventListener('pointercancel', () => { this.keys[prop] = false; });
        el.addEventListener('pointerleave', () => { this.keys[prop] = false; });
      };

      hook('#btnDoomUp', 'forward');
      hook('#btnDoomDown', 'backward');
      hook('#btnDoomLeft', 'left');
      hook('#btnDoomRight', 'right');

      // Botón lanzar dulce
      const btnLaunch = this.container.querySelector('#btnDoomLaunch');
      if (btnLaunch) {
        btnLaunch.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          A.unlock();
          this.shootTreat();
        });
      }

      // Selector de dulce (Rollito vs Paleta)
      this.container.querySelectorAll('.treat-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          A.unlock();
          A.bubblePop(1);
          this.currentTreat = e.currentTarget.dataset.type;
          this.container.querySelectorAll('.treat-type-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');

          const icon = this.currentTreat === 'rollito' ? '🍥' : '🍭';
          this.container.querySelector('#trayTreatGraphic').textContent = icon;
          this.container.querySelector('#launchBtnIcon').textContent = icon;
        });
      });

      // Botón revancha
      const btnReplay = this.container.querySelector('#btnDoomReplay');
      if (btnReplay) {
        btnReplay.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          this.container.querySelector('#doomVictoryOverlay').classList.add('hidden');
          this.resetGame();
        });
      }
    }

    shootTreat() {
      A.whoosh(true);
      // Animación de impulso en las patitas
      const tray = this.container.querySelector('#cinnaHands');
      if (tray) {
        tray.classList.add('launch-recoil');
        setTimeout(() => tray.classList.remove('launch-recoil'), 250);
      }

      // Crear proyectil en 3D
      const dirX = Math.cos(this.player.angle);
      const dirY = Math.sin(this.player.angle);

      this.treatProjectiles.push({
        x: this.player.x + dirX * 0.3,
        y: this.player.y + dirY * 0.3,
        vx: dirX * 4.8,
        vy: dirY * 4.8,
        emoji: this.currentTreat === 'rollito' ? '🍥' : '🍭',
        life: 2.2
      });
    }

    startLoop() {
      this.running = true;
      let lastTime = performance.now();

      const loop = (time) => {
        if (!this.running) return;
        const dt = Math.min(0.04, (time - lastTime) / 1000);
        lastTime = time;

        this.update(dt);
        this.render();
        this.renderMinimap();
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this.animId) cancelAnimationFrame(this.animId);
    }

    update(dt) {
      const p = this.player;

      // Rotación
      if (this.keys.left) p.angle -= p.rotSpeed * dt;
      if (this.keys.right) p.angle += p.rotSpeed * dt;

      // Movimiento con detección de colisión con muros
      let moveStep = 0;
      if (this.keys.forward) moveStep = p.speed * dt;
      if (this.keys.backward) moveStep = -p.speed * dt;

      if (moveStep !== 0) {
        const nextX = p.x + Math.cos(p.angle) * moveStep;
        const nextY = p.y + Math.sin(p.angle) * moveStep;

        if (!this.isWall(nextX, p.y)) p.x = nextX;
        if (!this.isWall(p.x, nextY)) p.y = nextY;
      }

      // Actualizar proyectiles de dulces
      for (const pr of this.treatProjectiles) {
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
        pr.life -= dt;

        // Comprobar si golpeó a algún amigo hambriento
        for (const fr of this.friends) {
          if (fr.hungry && Math.hypot(pr.x - fr.x, pr.y - fr.y) < 0.6) {
            fr.hungry = false;
            pr.life = -1; // Desaparece el proyectil
            this.fedCount++;
            A.celebrate();
            A.collect(this.fedCount);
            this.updateHUD();

            if (this.fedCount === this.totalFriends) {
              setTimeout(() => {
                this.container.querySelector('#doomVictoryOverlay').classList.remove('hidden');
              }, 700);
            }
          }
        }

        // Chocar con muro
        if (this.isWall(pr.x, pr.y)) {
          pr.life = -1;
        }
      }
      this.treatProjectiles = this.treatProjectiles.filter(pr => pr.life > 0);
    }

    isWall(x, y) {
      const mx = Math.floor(x);
      const my = Math.floor(y);
      if (mx < 0 || mx >= MAP_W || my < 0 || my >= MAP_H) return true;
      return MAP[my][mx] > 0;
    }

    updateHUD() {
      const el = this.container.querySelector('#doomFedCount');
      if (el) el.textContent = `${this.fedCount} / ${this.totalFriends}`;
    }

    render() {
      const ctx = this.ctx;
      const W = this.canvas.width;
      const H = this.canvas.height;
      const p = this.player;

      // 1. Cielo pastel y suelo de damero dulce
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H / 2);
      skyGrad.addColorStop(0, '#aee0ff');
      skyGrad.addColorStop(1, '#e3f3ff');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H / 2);

      const floorGrad = ctx.createLinearGradient(0, H / 2, 0, H);
      floorGrad.addColorStop(0, '#ffdce9');
      floorGrad.addColorStop(1, '#ffc2d8');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, H / 2, W, H / 2);

      // 2. Raycasting de muros pastel
      const numRays = Math.floor(W / 2);
      const halfFov = p.fov / 2;
      const zBuffer = new Array(numRays);

      for (let r = 0; r < numRays; r++) {
        const rayAngle = p.angle - halfFov + (r / numRays) * p.fov;
        const cosRay = Math.cos(rayAngle);
        const sinRay = Math.sin(rayAngle);

        // Algoritmo DDA
        let dist = 0;
        let hitType = 0;
        let side = 0;
        const maxDist = 16;
        const step = 0.04;

        let curX = p.x;
        let curY = p.y;

        while (dist < maxDist) {
          curX += cosRay * step;
          curY += sinRay * step;
          dist += step;

          const mx = Math.floor(curX);
          const my = Math.floor(curY);

          if (mx >= 0 && mx < MAP_W && my >= 0 && my < MAP_H && MAP[my][mx] > 0) {
            hitType = MAP[my][mx];
            break;
          }
        }

        // Corrección de efecto ojo de pez
        const correctDist = dist * Math.cos(rayAngle - p.angle);
        zBuffer[r] = correctDist;

        // Altura del muro en pantalla
        const wallH = Math.min(H * 1.5, (H / correctDist) * 0.9);
        const topY = (H - wallH) / 2;

        // Color del muro según tipo (Galleta, Oblea rosa, Menta)
        let wallColor = '#f5c98d';
        if (hitType === 2) wallColor = '#ff9ebb'; // Oblea
        if (hitType === 3) wallColor = '#a7e8bd'; // Menta

        // Sombreado por distancia
        const shade = Math.max(0.35, 1 - correctDist / 12);
        ctx.fillStyle = wallColor;
        ctx.globalAlpha = shade;
        ctx.fillRect(r * 2, topY, 2.2, wallH);
      }
      ctx.globalAlpha = 1;

      // 3. Render de Sprites de Amigos y Proyectiles (Ordenados por distancia)
      const sprites = [];

      // Añadir amigos
      for (const fr of this.friends) {
        const dx = fr.x - p.x;
        const dy = fr.y - p.y;
        const dist = Math.hypot(dx, dy);
        sprites.push({ type: 'friend', data: fr, dist, x: fr.x, y: fr.y });
      }

      // Añadir proyectiles de dulces volando
      for (const pr of this.treatProjectiles) {
        const dx = pr.x - p.x;
        const dy = pr.y - p.y;
        const dist = Math.hypot(dx, dy);
        sprites.push({ type: 'projectile', data: pr, dist, x: pr.x, y: pr.y });
      }

      // Ordenar de más lejano a más cercano (Painter's algorithm)
      sprites.sort((a, b) => b.dist - a.dist);

      for (const sp of sprites) {
        const dx = sp.x - p.x;
        const dy = sp.y - p.y;

        // Transformación al espacio de la cámara del jugador
        const angleToSprite = Math.atan2(dy, dx) - p.angle;
        let normAngle = angleToSprite;
        while (normAngle < -Math.PI) normAngle += Math.PI * 2;
        while (normAngle > Math.PI) normAngle -= Math.PI * 2;

        if (Math.abs(normAngle) < halfFov + 0.3 && sp.dist > 0.2) {
          const screenX = (W / 2) + Math.tan(normAngle) * (W / (2 * Math.tan(halfFov)));
          const spriteSize = Math.min(H * 0.9, (H / sp.dist) * 0.8);
          const rayIdx = Math.floor((screenX / W) * numRays);

          // Verificar si no está tapado por un muro
          if (rayIdx >= 0 && rayIdx < numRays && sp.dist < zBuffer[rayIdx] + 0.3) {
            const screenY = H / 2 - spriteSize / 2;

            if (sp.type === 'friend') {
              const fr = sp.data;
              ctx.font = `${Math.floor(spriteSize * 0.75)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText(fr.emoji, screenX, screenY + spriteSize * 0.75);

              // Burbuja sobre la cabeza
              const bubbleText = fr.hungry ? fr.phrase : '¡Yummy! 💖';
              ctx.font = `bold ${Math.max(14, Math.floor(spriteSize * 0.24))}px sans-serif`;
              ctx.fillStyle = fr.hungry ? '#ff4081' : '#4caf50';
              ctx.fillText(bubbleText, screenX, screenY - 12);
            } else if (sp.type === 'projectile') {
              ctx.font = `${Math.floor(spriteSize * 0.6)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText(sp.data.emoji, screenX, screenY + spriteSize * 0.6);
            }
          }
        }
      }
    }

    renderMinimap() {
      const canvas = this.container.querySelector('#doomMinimap');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const cellW = canvas.width / MAP_W;
      const cellH = canvas.height / MAP_H;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar celdas
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          if (MAP[y][x] > 0) {
            ctx.fillStyle = '#ffb3d1';
            ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
          }
        }
      }

      // Dibujar amigos
      for (const fr of this.friends) {
        ctx.fillStyle = fr.hungry ? '#ff4081' : '#4caf50';
        ctx.beginPath();
        ctx.arc(fr.x * cellW, fr.y * cellH, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dibujar jugador
      const px = this.player.x * cellW;
      const py = this.player.y * cellH;
      ctx.fillStyle = '#2196f3';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Línea de visión
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(this.player.angle) * 10, py + Math.sin(this.player.angle) * 10);
      ctx.stroke();
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.doomGame = new TreatDoomGame();
})();
