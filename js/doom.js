/* Cinnamon Treat-Shooter 2.5D (El Repartidor Mágico de Dulces)
 * Motor Raycaster 2.5D con SELECCIÓN DE PERSONAJE:
 * Cinnamoroll, Milk o Pompompurin.
 * 
 * Mejoras clave:
 *  - Algoritmo DDA con sombreado de caras (Wolfenstein/DOOM) y zócalos de chocolate para ver los muros con claridad.
 *  - Texturas procedurales nítidas (Galleta de Mantequilla, Oblea Rosa, Caramelo Menta) y suelo en perspectiva.
 *  - Detección de colisiones con radio físico del jugador, deslizamiento en muros y rebote táctil.
 *  - Brazos y patitas en primera persona (estilo DOOM) sosteniendo el dulce en sus manos con vaivén (bobbing) y animación de lanzamiento.
 *  - Inteligencia artificial para los amigos: deambulan suavemente, miran al jugador, piden dulces y bailan con corazones y estrellas al comer.
 */
(function () {
  const { audio: A } = window.Cinnamo;

  const VW = 640;
  const VH = 360;

  // Personajes jugables seleccionables
  const PLAYABLE_CHARACTERS = [
    {
      id: 'cinna',
      name: 'Cinnamoroll',
      badge: '🐶 Canela',
      imgSrc: 'assets/cinnamoroll_fly.png',
      treatEmoji: '🍥',
      treatName: 'Rollito de Canela',
      pawColor: '#ffffff',
      cuffColor: '#93c5fd',
      desc: '¡Reparte rollitos de canela recién horneados con sus patitas esponjosas!'
    },
    {
      id: 'milk',
      name: 'Milk',
      badge: '🍼 Bebé',
      imgSrc: 'assets/milk_teddy.png',
      treatEmoji: '🍼',
      treatName: 'Biberón de Leche Tibia',
      pawColor: '#ffffff',
      cuffColor: '#c7d2fe',
      desc: '¡El más chiquitito! Reparte ricos biberones de leche tibia.'
    },
    {
      id: 'purin',
      name: 'Pompompurin',
      badge: '🍮 Purin',
      imgSrc: 'assets/pompompurin.png',
      treatEmoji: '🍮',
      treatName: 'Pudín de Caramelo',
      pawColor: '#fcd34d',
      cuffColor: '#78350f',
      desc: '¡El perrito con boina! Reparte deliciosos flanes de caramelo con cereza.'
    }
  ];

  // Mapa del laberinto (1: galleta waffle, 2: oblea rosa, 3: caramelo menta, 0: camino)
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

  class TreatDoomGame {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.ctx = null;
      this.animId = null;
      this.running = false;
      this.inCharSelect = true;

      this.selectedHero = PLAYABLE_CHARACTERS[0];

      this.player = {
        x: 1.5,
        y: 3.5,
        angle: 0,
        fov: Math.PI / 3, // 60 deg
        speed: 2.3,
        rotSpeed: 2.5
      };

      this.keys = { forward: false, backward: false, left: false, right: false };
      this.projectiles = [];
      this.friends = [];
      this.particles = [];
      this.fedCount = 0;
      this.totalFriends = 4;

      // Variables de vaivén (bobbing), retroceso de lanzamiento y colisión
      this.walkTimer = 0;
      this.recoil = 0;
      this.swayAngle = 0;
      this.bumpIntensity = 0;
      this.lastBumpSoundTime = 0;

      // Sprites de los amigos (carga bajo demanda)
      this.friendImages = null;
    }

    ensureAssets() {
      if (this.friendImages) return;
      this.friendImages = {
        milk: new Image(),
        purin: new Image(),
        mocha: new Image(),
        chiffon: new Image(),
        cinna: new Image()
      };
      this.friendImages.milk.src = 'assets/milk_teddy.png';
      this.friendImages.purin.src = 'assets/pompompurin.png';
      this.friendImages.mocha.src = 'assets/mocha.png';
      this.friendImages.chiffon.src = 'assets/chiffon.png';
      this.friendImages.cinna.src = 'assets/cinnamoroll_fly.png';
    }

    init(containerEl) {
      this.ensureAssets();
      this.container = containerEl;
      this.inCharSelect = true;
      this.renderCharSelect();
    }

    renderCharSelect() {
      this.container.innerHTML = `
        <div class="doom-char-select-wrap">
          <div class="char-select-header">
            <span class="select-badge">✨ Elige a tu Repartidor Mágico ✨</span>
            <h1>¿Con quién quieres jugar hoy, Amanda?</h1>
            <p>¡Elige a tu personaje favorito para repartir dulces a todos sus amigos!</p>
          </div>

          <div class="char-heroes-grid">
            ${PLAYABLE_CHARACTERS.map(c => `
              <div class="char-hero-card ${c.id === this.selectedHero.id ? 'selected' : ''}" data-id="${c.id}">
                <div class="hero-card-badge">${c.badge}</div>
                <div class="hero-card-avatar">
                  <img src="${c.imgSrc}" alt="${c.name}" />
                </div>
                <h2>${c.name}</h2>
                <div class="hero-card-weapon">
                  <span class="weapon-pill">${c.treatEmoji} ${c.treatName}</span>
                </div>
                <p class="hero-card-desc">${c.desc}</p>
                <button class="btn-select-hero">▶ ¡Elegir a ${c.name}!</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      this.container.querySelectorAll('.char-hero-card').forEach(card => {
        card.addEventListener('click', (e) => {
          A.unlock();
          A.celebrate();
          const id = e.currentTarget.dataset.id;
          const found = PLAYABLE_CHARACTERS.find(c => c.id === id);
          if (found) {
            this.selectedHero = found;
            this.start3DGame();
          }
        });
      });
    }

    start3DGame() {
      this.inCharSelect = false;
      this.render3DStage();
      this.setupCanvas();
      this.setupFriendsList();
      this.bindInputs();
      this.startLoop();
    }

    setupFriendsList() {
      // Amigos en el laberinto (distribuidos en distintas zonas de la panadería mágica)
      const allPossible = [
        { id: 'mocha', name: 'Mocha', x: 7.5, y: 3.5, imgKey: 'mocha', hungry: true, phrase: '¡Quiero un dulce! 🎀' },
        { id: 'chiffon', name: 'Chiffon', x: 6.5, y: 6.5, imgKey: 'chiffon', hungry: true, phrase: '¡Tengo apetito! 🌸' },
        { id: 'milk', name: 'Milk', x: 3.8, y: 1.5, imgKey: 'milk', hungry: true, phrase: '¡Quiero lechita! 🍼' },
        { id: 'purin', name: 'Pompompurin', x: 9.5, y: 7.5, imgKey: 'purin', hungry: true, phrase: '¡Mucho apetito! 🍮' },
        { id: 'cinna', name: 'Cinnamoroll', x: 3.8, y: 1.5, imgKey: 'cinna', hungry: true, phrase: '¡Un rollito porfa! 🪽' }
      ];

      // Excluir al héroe que está usando Amanda
      this.friends = allPossible
        .filter(f => f.id !== this.selectedHero.id)
        .slice(0, 4)
        .map(f => ({
          ...f,
          originX: f.x,
          originY: f.y,
          wanderTimer: 1.5 + Math.random() * 2,
          jumpY: 0,
          happyTimer: 0
        }));

      this.totalFriends = this.friends.length;
      this.fedCount = 0;
      this.projectiles = [];
      this.particles = [];
      this.player.x = 1.5;
      this.player.y = 1.5;
      this.player.angle = 0;
      this.walkTimer = 0;
      this.recoil = 0;
      this.bumpIntensity = 0;
    }

    render3DStage() {
      const hero = this.selectedHero;
      this.container.innerHTML = `
        <div class="doom-wrapper">
          <canvas id="doomCanvas" width="${VW}" height="${VH}"></canvas>

          <!-- Marcador Superior -->
          <div class="doom-hud">
            <div class="doom-score-pill">
              <span class="hud-ico">💖</span>
              <span>Amigos Felices: <strong id="doomFedCount">0 / 4</strong></span>
            </div>
            <div class="doom-hero-pill">
              <span>Jugando como: <strong>${hero.name}</strong> ${hero.treatEmoji}</span>
            </div>
            <button class="btn-change-hero" id="btnChangeHero">🔄 Cambiar Personaje</button>
          </div>

          <!-- Radar / Minimap -->
          <canvas id="doomMinimap" class="doom-radar-canvas" width="120" height="100"></canvas>

          <!-- Controles táctiles transparentes para tablets / móviles -->
          <div class="doom-touch-controls">
            <div class="doom-dpad">
              <button class="doom-touch-btn dpad-up" id="btnDoomUp" aria-label="Avanzar">⬆️</button>
              <div class="dpad-row">
                <button class="doom-touch-btn dpad-left" id="btnDoomLeft" aria-label="Girar izquierda">◀️</button>
                <button class="doom-touch-btn dpad-down" id="btnDoomDown" aria-label="Retroceder">⬇️</button>
                <button class="doom-touch-btn dpad-right" id="btnDoomRight" aria-label="Girar derecha">▶️</button>
              </div>
            </div>

            <button class="doom-launch-big-btn" id="btnDoomLaunch">
              <span class="launch-ico">${hero.treatEmoji}</span>
              <span class="launch-label">¡Repartir Dulce!</span>
            </button>
          </div>

          <!-- Pantalla de Victoria -->
          <div class="doom-victory-overlay hidden" id="doomVictoryOverlay">
            <div class="doom-victory-box">
              <div class="victory-ribbon">💖 ¡MISIÓN DE AMISTAD CUMPLIDA! 💖</div>
              <h2>¡Todos los amigos están felices y llenitos!</h2>
              <div class="victory-hero-celebrate">
                <img src="${hero.imgSrc}" alt="${hero.name}" />
                <h3>¡Gran trabajo, ${hero.name} y Amanda!</h3>
              </div>
              <button class="btn-doom-replay" id="btnDoomReplay">▶ ¡Repartir dulces otra vez!</button>
            </div>
          </div>
        </div>
      `;
    }

    setupCanvas() {
      this.canvas = this.container.querySelector('#doomCanvas');
      this.ctx = this.canvas.getContext('2d');
    }

    bindInputs() {
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

      const btnLaunch = this.container.querySelector('#btnDoomLaunch');
      if (btnLaunch) {
        btnLaunch.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          A.unlock();
          this.shootTreat();
        });
      }

      const btnChange = this.container.querySelector('#btnChangeHero');
      if (btnChange) {
        btnChange.addEventListener('click', () => {
          A.unlock();
          this.stop();
          this.init(this.container);
        });
      }

      const btnReplay = this.container.querySelector('#btnDoomReplay');
      if (btnReplay) {
        btnReplay.addEventListener('click', () => {
          A.unlock();
          A.bubblePop(1);
          this.container.querySelector('#doomVictoryOverlay').classList.add('hidden');
          this.setupFriendsList();
          this.updateHUD();
        });
      }
    }

    shootTreat() {
      if (this.recoil > 0.4) return; // Pequeño enfriamiento
      A.whoosh(true);
      this.recoil = 1.0;

      const dirX = Math.cos(this.player.angle);
      const dirY = Math.sin(this.player.angle);

      this.projectiles.push({
        x: this.player.x + dirX * 0.45,
        y: this.player.y + dirY * 0.45,
        vx: dirX * 5.4,
        vy: dirY * 5.4,
        emoji: this.selectedHero.treatEmoji,
        treatName: this.selectedHero.treatName,
        life: 2.5
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
        this.render(dt);
        this.renderMinimap();
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this.animId) cancelAnimationFrame(this.animId);
    }

    // Comprobación de colisión con radio físico (DOOM-style player radius)
    canMoveTo(x, y, radius = 0.28, checkFriends = false) {
      const minX = Math.floor(x - radius);
      const maxX = Math.floor(x + radius);
      const minY = Math.floor(y - radius);
      const maxY = Math.floor(y + radius);

      for (let my = minY; my <= maxY; my++) {
        for (let mx = minX; mx <= maxX; mx++) {
          if (mx < 0 || mx >= MAP_W || my < 0 || my >= MAP_H) return false;
          if (MAP[my][mx] > 0) return false;
        }
      }

      if (checkFriends && this.friends) {
        for (const fr of this.friends) {
          if (Math.hypot(x - fr.x, y - fr.y) < radius + 0.35) return false;
        }
      }
      return true;
    }

    update(dt) {
      const p = this.player;

      // Giro suave
      if (this.keys.left) p.angle -= p.rotSpeed * dt;
      if (this.keys.right) p.angle += p.rotSpeed * dt;

      // Inclinación visual del arma al girar
      const targetSway = (this.keys.left ? 12 : 0) + (this.keys.right ? -12 : 0);
      this.swayAngle += (targetSway - this.swayAngle) * Math.min(1, dt * 10);

      // Movimiento con deslizamiento y colisión física
      let moveStep = 0;
      if (this.keys.forward) moveStep = p.speed * dt;
      if (this.keys.backward) moveStep = -p.speed * dt * 0.75;

      if (moveStep !== 0) {
        const moveX = Math.cos(p.angle) * moveStep;
        const moveY = Math.sin(p.angle) * moveStep;
        let didBump = false;

        // Deslizamiento independiente en X e Y (no atraviesa muros ni amigos)
        if (this.canMoveTo(p.x + moveX, p.y, 0.28, true)) {
          p.x += moveX;
        } else {
          didBump = true;
        }

        if (this.canMoveTo(p.x, p.y + moveY, 0.28, true)) {
          p.y += moveY;
        } else {
          didBump = true;
        }

        this.walkTimer += dt * 6.8;

        // Reacción y retroalimentación táctil de choque contra pared
        if (didBump) {
          const nowMs = performance.now();
          if (nowMs - this.lastBumpSoundTime > 380) {
            this.lastBumpSoundTime = nowMs;
            A.softBoing();
          }
          this.bumpIntensity = 1.0;
        }
      }

      this.bumpIntensity = Math.max(0, this.bumpIntensity - dt * 5.0);

      // Desvanecimiento del retroceso de lanzamiento
      if (this.recoil > 0) {
        this.recoil = Math.max(0, this.recoil - dt * 3.5);
      }

      // IA y Animación de los Amigos
      for (const fr of this.friends) {
        // Amigo alimentado celebrando: rebota de alegría y crea brillos
        if (!fr.hungry) {
          fr.jumpY = Math.abs(Math.sin(performance.now() / 140)) * 24;
          continue;
        }

        // Amigo con hambre: deambula pasito a pasito cerca de su rincón
        fr.wanderTimer -= dt;
        if (fr.wanderTimer <= 0) {
          fr.wanderTimer = 2.0 + Math.random() * 2.5;
          const wanderAngle = Math.random() * Math.PI * 2;
          const stepDist = 0.25;
          const tx = fr.x + Math.cos(wanderAngle) * stepDist;
          const ty = fr.y + Math.sin(wanderAngle) * stepDist;

          // No alejarse más de 1.2 casillas de su lugar original y no atravesar muros
          if (Math.hypot(tx - fr.originX, ty - fr.originY) < 1.3 && this.canMoveTo(tx, ty, 0.25)) {
            fr.x = tx;
            fr.y = ty;
          }
        }
      }

      // Partículas flotantes de alegría (corazones y estrellitas)
      for (const part of this.particles) {
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        part.z += part.vz * dt;
        part.life -= dt;
      }
      this.particles = this.particles.filter(pt => pt.life > 0);

      // Proyectiles de dulces volando
      for (const pr of this.projectiles) {
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
        pr.life -= dt;

        // Impacto de dulce con un amigo
        for (const fr of this.friends) {
          if (fr.hungry && Math.hypot(pr.x - fr.x, pr.y - fr.y) < 0.68) {
            fr.hungry = false;
            pr.life = -1;
            this.fedCount++;
            A.celebrate();
            A.collect(this.fedCount);
            this.updateHUD();

            // Estallido de corazones y estrellas sobre el amigo
            for (let k = 0; k < 8; k++) {
              this.particles.push({
                x: fr.x + (Math.random() - 0.5) * 0.4,
                y: fr.y + (Math.random() - 0.5) * 0.4,
                z: 0.5 + Math.random() * 0.4,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                vz: 0.6 + Math.random() * 0.6,
                char: ['💖', '✨', '⭐', '🌸'][k % 4],
                life: 1.8
              });
            }

            if (this.fedCount === this.totalFriends) {
              setTimeout(() => {
                this.container.querySelector('#doomVictoryOverlay').classList.remove('hidden');
              }, 600);
            }
            break;
          }
        }

        // Si choca con un muro, desaparece con sonido suave
        if (!this.canMoveTo(pr.x, pr.y, 0.08)) {
          pr.life = -1;
        }
      }
      this.projectiles = this.projectiles.filter(pr => pr.life > 0);
    }

    updateHUD() {
      const el = this.container ? this.container.querySelector('#doomFedCount') : null;
      if (el) el.textContent = `${this.fedCount} / ${this.totalFriends}`;
    }

    render(dt) {
      const ctx = this.ctx;
      const p = this.player;

      // 1. Cielo pastel suave con nubes
      const skyGrad = ctx.createLinearGradient(0, 0, 0, VH / 2);
      skyGrad.addColorStop(0, '#7ec8f8');
      skyGrad.addColorStop(1, '#e3f3ff');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, VW, VH / 2);

      // Nubes decorativas en el cielo que rotan con la vista
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 150 - p.angle * 90) % VW + VW) % VW;
        ctx.beginPath();
        ctx.arc(cx, 38, 22, 0, Math.PI * 2);
        ctx.arc(cx + 18, 32, 28, 0, Math.PI * 2);
        ctx.arc(cx + 40, 39, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Suelo con perspectiva y baldosas de pasteladería
      // Rayas en perspectiva que dan noción de distancia y movimiento al suelo
      const floorGrad = ctx.createLinearGradient(0, VH / 2, 0, VH);
      floorGrad.addColorStop(0, '#ffd8ea');
      floorGrad.addColorStop(1, '#ffbedc');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, VH / 2, VW, VH / 2);

      // Baldosas de perspectiva sobre el suelo (líneas horizontales con escala cuadrática)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      for (let y = VH / 2 + 10; y < VH; y += 14 + (y - VH / 2) * 0.35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(VW, y);
        ctx.stroke();
      }

      // 3. Algoritmo DDA Digital Differential Analysis (Wolfenstein / DOOM clásico)
      const numRays = VW / 2; // 320 rayos en columnas de 2px
      const halfFov = p.fov / 2;
      const zBuffer = new Array(numRays);

      // Cámara y choque
      const shakeY = (this.bumpIntensity > 0.05) ? Math.sin(performance.now() / 30) * this.bumpIntensity * 4 : 0;

      for (let r = 0; r < numRays; r++) {
        const rayAngle = p.angle - halfFov + (r / numRays) * p.fov;
        const rayDirX = Math.cos(rayAngle);
        const rayDirY = Math.sin(rayAngle);

        let mapX = Math.floor(p.x);
        let mapY = Math.floor(p.y);

        const deltaDistX = Math.abs(1 / (rayDirX === 0 ? 1e-6 : rayDirX));
        const deltaDistY = Math.abs(1 / (rayDirY === 0 ? 1e-6 : rayDirY));

        let stepX, sideDistX;
        if (rayDirX < 0) {
          stepX = -1;
          sideDistX = (p.x - mapX) * deltaDistX;
        } else {
          stepX = 1;
          sideDistX = (mapX + 1.0 - p.x) * deltaDistX;
        }

        let stepY, sideDistY;
        if (rayDirY < 0) {
          stepY = -1;
          sideDistY = (p.y - mapY) * deltaDistY;
        } else {
          stepY = 1;
          sideDistY = (mapY + 1.0 - p.y) * deltaDistY;
        }

        let hit = 0;
        let side = 0; // 0 = Cara vertical (Este/Oeste), 1 = Cara horizontal (Norte/Sur)
        let steps = 0;

        while (hit === 0 && steps < 30) {
          steps++;
          if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0;
          } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1;
          }

          if (mapX >= 0 && mapX < MAP_W && mapY >= 0 && mapY < MAP_H && MAP[mapY][mapX] > 0) {
            hit = MAP[mapY][mapX];
          }
        }

        let perpWallDist;
        if (side === 0) {
          perpWallDist = (sideDistX - deltaDistX);
        } else {
          perpWallDist = (sideDistY - deltaDistY);
        }

        // Corrección de efecto ojo de pez
        const correctDist = Math.max(0.2, perpWallDist * Math.cos(rayAngle - p.angle));
        zBuffer[r] = correctDist;

        // Altura del muro en pantalla
        const wallH = Math.min(VH * 1.8, (VH / correctDist) * 1.05);
        const topY = Math.floor((VH - wallH) / 2) + shakeY;
        const colX = r * 2;
        const colW = 2.2;

        // Coordenada exacta de textura (0.0 a 1.0 a lo largo del muro)
        let wallX;
        if (side === 0) {
          wallX = p.y + perpWallDist * rayDirY;
        } else {
          wallX = p.x + perpWallDist * rayDirX;
        }
        wallX -= Math.floor(wallX);

        // Paleta base según tipo de muro
        let baseColor = '#f6c78e';     // 1: Galleta de mantequilla
        let mortarColor = '#e0a65b';
        if (hit === 2) {
          baseColor = '#ff9ebb';       // 2: Oblea de fresa
          mortarColor = '#f472b6';
        } else if (hit === 3) {
          baseColor = '#8ee6b8';       // 3: Caramelo menta
          mortarColor = '#60c993';
        }

        // Sombreado clásico DOOM: Caras Norte/Sur tienen un 28% más de sombra
        // para que cada esquina del laberinto se distinga nítidamente
        const faceShade = (side === 1) ? 0.72 : 1.0;
        const distShade = Math.max(0.35, 1 - (correctDist / 12));
        const finalShade = faceShade * distShade;

        // Dibujar franja base del muro
        ctx.fillStyle = baseColor;
        ctx.fillRect(colX, topY, colW, wallH);

        // --- Textura 1: Mampostería de Galleta (líneas de mortero y chispas) ---
        if (hit === 1) {
          // Ranuras de galleta verticales
          if (wallX < 0.05 || Math.abs(wallX - 0.5) < 0.04) {
            ctx.fillStyle = mortarColor;
            ctx.fillRect(colX, topY, colW, wallH);
          }
          // Chispitas de chocolate
          if ((Math.abs(wallX - 0.25) < 0.03 || Math.abs(wallX - 0.75) < 0.03) && (r % 6 === 0)) {
            ctx.fillStyle = '#5c3d2e';
            ctx.fillRect(colX, topY + wallH * 0.45, colW, wallH * 0.1);
          }
        } else if (hit === 2) {
          // --- Textura 2: Oblea Waffle cruzada con crema blanca al centro ---
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.fillRect(colX, topY + wallH * 0.46, colW, Math.max(2, wallH * 0.08));
          if (Math.abs(wallX - 0.33) < 0.03 || Math.abs(wallX - 0.66) < 0.03) {
            ctx.fillStyle = mortarColor;
            ctx.fillRect(colX, topY, colW, wallH);
          }
        } else if (hit === 3) {
          // --- Textura 3: Caramelo Menta con rayas diagonales ---
          const stripePhase = (wallX * 4) % 1;
          if (stripePhase < 0.4) {
            ctx.fillStyle = '#bbf7d0';
            ctx.fillRect(colX, topY, colW, wallH);
          }
        }

        // --- ZÓCALO INFERIOR DE CHOCOLATE (Delimita exactamente el suelo y el muro) ---
        const skirtH = Math.max(4, wallH * 0.12);
        ctx.fillStyle = '#5a3825'; // Chocolate oscuro Sanrio
        ctx.fillRect(colX, topY + wallH - skirtH, colW, skirtH);

        // Línea dorada encima del zócalo
        ctx.fillStyle = '#fde047';
        ctx.fillRect(colX, topY + wallH - skirtH, colW, 2);

        // --- MOLDURA SUPERIOR DE CREMA BLANCA ---
        const crownH = Math.max(3, wallH * 0.08);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(colX, topY, colW, crownH);

        // Sombra de profundidad general
        if (finalShade < 0.98) {
          ctx.fillStyle = `rgba(30, 20, 45, ${1 - finalShade})`;
          ctx.fillRect(colX, topY, colW, wallH);
        }
      }

      // 4. Sprites 3D de amigos, proyectiles y partículas (Billboard)
      const sprites = [];

      for (const fr of this.friends) {
        const dx = fr.x - p.x;
        const dy = fr.y - p.y;
        const dist = Math.hypot(dx, dy);
        sprites.push({ type: 'friend', data: fr, dist, x: fr.x, y: fr.y });
      }

      for (const pr of this.projectiles) {
        const dx = pr.x - p.x;
        const dy = pr.y - p.y;
        const dist = Math.hypot(dx, dy);
        sprites.push({ type: 'projectile', data: pr, dist, x: pr.x, y: pr.y });
      }

      for (const pt of this.particles) {
        const dx = pt.x - p.x;
        const dy = pt.y - p.y;
        const dist = Math.hypot(dx, dy);
        sprites.push({ type: 'particle', data: pt, dist, x: pt.x, y: pt.y });
      }

      sprites.sort((a, b) => b.dist - a.dist);

      for (const sp of sprites) {
        const dx = sp.x - p.x;
        const dy = sp.y - p.y;

        let angleToSprite = Math.atan2(dy, dx) - p.angle;
        while (angleToSprite < -Math.PI) angleToSprite += Math.PI * 2;
        while (angleToSprite > Math.PI) angleToSprite -= Math.PI * 2;

        if (Math.abs(angleToSprite) < halfFov + 0.35 && sp.dist > 0.25) {
          const screenX = (VW / 2) + Math.tan(angleToSprite) * (VW / (2 * Math.tan(halfFov)));
          const spriteH = Math.min(VH * 0.72, (VH / sp.dist) * 0.85);
          const spriteW = spriteH * 1.15;
          const rayIdx = Math.floor((screenX / VW) * numRays);

          if (rayIdx >= 0 && rayIdx < numRays && sp.dist < zBuffer[rayIdx] + 0.35) {
            if (sp.type === 'friend') {
              const fr = sp.data;
              const screenY = VH / 2 - spriteH / 2 + 10 - fr.jumpY + shakeY;
              const img = this.friendImages[fr.imgKey];

              if (img && img.complete) {
                ctx.drawImage(img, screenX - spriteW / 2, screenY, spriteW, spriteH);
              }

              // Burbuja tierna de diálogo sobre el personaje
              const bubbleText = fr.hungry ? fr.phrase : '¡Ñam ñam! ¡Gracias Amanda! 💖';
              const bubbleFontSize = Math.min(15, Math.max(11, Math.floor(spriteH * 0.08)));
              ctx.font = `800 ${bubbleFontSize}px "Baloo 2", sans-serif`;
              ctx.textAlign = 'center';

              const bubbleY = Math.max(56, screenY - 12);

              // Fondo de píldora para que se lea perfecto
              ctx.fillStyle = fr.hungry ? 'rgba(255, 240, 245, 0.95)' : 'rgba(240, 255, 240, 0.95)';
              ctx.strokeStyle = fr.hungry ? '#ff69b4' : '#4caf50';
              ctx.lineWidth = 2.5;

              const textW = ctx.measureText(bubbleText).width + 16;
              ctx.beginPath();
              ctx.roundRect(screenX - textW / 2, bubbleY - bubbleFontSize - 3, textW, bubbleFontSize + 8, 999);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = fr.hungry ? '#d81b60' : '#2e7d32';
              ctx.fillText(bubbleText, screenX, bubbleY - 2);
            } else if (sp.type === 'projectile') {
              const pr = sp.data;
              const screenY = VH / 2 - spriteH / 2 + 15 + shakeY;
              ctx.font = `${Math.floor(spriteH * 0.65)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText(pr.emoji, screenX, screenY + spriteH * 0.5);
            } else if (sp.type === 'particle') {
              const pt = sp.data;
              const screenY = VH / 2 - spriteH / 2 - (pt.z * spriteH) + shakeY;
              ctx.font = `${Math.floor(spriteH * 0.45)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText(pt.char, screenX, screenY);
            }
          }
        }
      }

      // 5. RENDERIZADO EN PRIMERA PERSONA (DOOM-Style Paws & Held Treat)
      // Brazos y patitas ilustradas sosteniendo el dulce directamente en la pantalla
      this.renderFirstPersonArms(ctx, dt);
    }

    renderFirstPersonArms(ctx, dt) {
      const hero = this.selectedHero;
      const t = this.walkTimer;

      // Vaivén al caminar (Weapon Bobbing de DOOM)
      const isMoving = this.keys.forward || this.keys.backward;
      const bobX = isMoving ? Math.cos(t) * 12 : Math.cos(performance.now() / 600) * 3;
      const bobY = isMoving ? Math.abs(Math.sin(t)) * 14 : Math.sin(performance.now() / 600) * 4;

      // Inclinación al girar
      const sway = this.swayAngle;

      // Animación de retroceso/lanzamiento
      let recoilOffset = 0;
      let treatScale = 1.0;
      if (this.recoil > 0.6) {
        // Fase 1: Empujón hacia adelante al lanzar el dulce
        const p = (this.recoil - 0.6) / 0.4;
        recoilOffset = -30 * p;
        treatScale = 1.15;
      } else if (this.recoil > 0.2) {
        // Fase 2: Manos bajan brevemente vacías
        const p = (this.recoil - 0.2) / 0.4;
        recoilOffset = 25 * p;
        treatScale = 0; // El dulce ya voló
      } else if (this.recoil > 0) {
        // Fase 3: Nuevo dulce fresco reaparece en las patitas con resorte
        const p = this.recoil / 0.2;
        recoilOffset = 15 * p;
        treatScale = 1.0 - p * 0.4;
      }

      const baseX = VW / 2 + bobX + sway;
      const baseY = VH - 28 + bobY + recoilOffset;

      ctx.save();
      ctx.translate(baseX, baseY);

      // --- 1. Brazos y cuerpo del personaje (perspectiva primera persona) ---
      const armColor = hero.pawColor;
      const outlineColor = '#5c3d2e';

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = outlineColor;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Pancita suave y redonda en la parte inferior de la vista
      ctx.beginPath();
      ctx.ellipse(0, 56, 100, 40, 0, 0, Math.PI * 2);
      ctx.fillStyle = armColor;
      ctx.fill();
      ctx.stroke();

      // Brazo izquierdo (chubby y suave saliendo del cuerpito hacia la bandeja)
      ctx.beginPath();
      ctx.moveTo(-100, 52);
      ctx.bezierCurveTo(-85, 18, -68, -18, -48, -40);
      ctx.lineTo(-24, -20);
      ctx.bezierCurveTo(-44, 12, -56, 38, -62, 52);
      ctx.closePath();
      ctx.fillStyle = armColor;
      ctx.fill();
      ctx.stroke();

      // Brazo derecho
      ctx.beginPath();
      ctx.moveTo(100, 52);
      ctx.bezierCurveTo(85, 18, 68, -18, 48, -40);
      ctx.lineTo(24, -20);
      ctx.bezierCurveTo(44, 12, 56, 38, 62, 52);
      ctx.closePath();
      ctx.fillStyle = armColor;
      ctx.fill();
      ctx.stroke();

      // --- 2. Dulce en el centro sostenido en bandeja ---
      if (treatScale > 0.05) {
        ctx.save();
        ctx.translate(0, -48);
        ctx.scale(treatScale, treatScale);

        if (hero.id === 'cinna') {
          // Plato blanco
          ctx.beginPath();
          ctx.ellipse(0, 22, 54, 16, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.stroke();

          // Bollo de rollito de canela
          ctx.beginPath();
          ctx.ellipse(0, 0, 44, 28, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#e89e53';
          ctx.fill();
          ctx.stroke();

          // Glaseado de crema blanca arriba
          ctx.beginPath();
          ctx.ellipse(0, -6, 36, 16, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fill();

          // Espirales de canela
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0.4, Math.PI * 2.3);
          ctx.strokeStyle = '#8a4b1c';
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, 12, 0.6, Math.PI * 2.1);
          ctx.stroke();

          // Brillo
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✨', 34, -22);
        } else if (hero.id === 'milk') {
          // Biberón de leche tibia
          ctx.beginPath();
          ctx.roundRect(-24, -30, 48, 68, 12);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#fffbeb';
          ctx.fillRect(-22, -15, 44, 50);

          ctx.strokeStyle = '#93c5fd';
          ctx.lineWidth = 2.5;
          for (let ly = -8; ly <= 22; ly += 9) {
            ctx.beginPath();
            ctx.moveTo(-16, ly);
            ctx.lineTo(-4, ly);
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.roundRect(-20, -44, 40, 15, 6);
          ctx.fillStyle = '#93c5fd';
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, -48, 11, Math.PI, 0);
          ctx.fillStyle = '#fde68a';
          ctx.fill();
          ctx.stroke();

          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🍼', 0, 18);
        } else if (hero.id === 'purin') {
          // Plato de pudín
          ctx.beginPath();
          ctx.ellipse(0, 24, 56, 16, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(-36, 20);
          ctx.lineTo(-24, -14);
          ctx.quadraticCurveTo(0, -22, 24, -14);
          ctx.lineTo(36, 20);
          ctx.closePath();
          ctx.fillStyle = '#fef08a';
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(0, -14, 25, 10, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#78350f';
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, -26, 9, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      }

      // --- 3. Patitas abrazando y sosteniendo el plato a los lados ---
      // Patita izquierda
      ctx.beginPath();
      ctx.ellipse(-48, -48, 20, 18, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = armColor;
      ctx.fill();
      ctx.stroke();

      // Huellita rosa en pata izquierda
      ctx.beginPath();
      ctx.ellipse(-48, -48, 8, 7, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = (hero.id === 'purin') ? '#b45309' : '#f472b6';
      ctx.fill();

      // Deditos izquierda
      for (const [ox, oy] of [[-44, -62], [-58, -50], [-52, -34]]) {
        ctx.beginPath();
        ctx.arc(ox, oy, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = armColor;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fillStyle = (hero.id === 'purin') ? '#b45309' : '#f472b6';
        ctx.fill();
      }

      // Patita derecha
      ctx.beginPath();
      ctx.ellipse(48, -48, 20, 18, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = armColor;
      ctx.fill();
      ctx.stroke();

      // Huellita rosa en pata derecha
      ctx.beginPath();
      ctx.ellipse(48, -48, 8, 7, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = (hero.id === 'purin') ? '#b45309' : '#f472b6';
      ctx.fill();

      // Deditos derecha
      for (const [ox, oy] of [[44, -62], [58, -50], [52, -34]]) {
        ctx.beginPath();
        ctx.arc(ox, oy, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = armColor;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fillStyle = (hero.id === 'purin') ? '#b45309' : '#f472b6';
        ctx.fill();
      }

      ctx.restore();
    }

    renderMinimap() {
      const canvas = this.container.querySelector('#doomMinimap');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const cellW = canvas.width / MAP_W;
      const cellH = canvas.height / MAP_H;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Muros
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          if (MAP[y][x] > 0) {
            ctx.fillStyle = (MAP[y][x] === 1) ? '#f5c98d' : ((MAP[y][x] === 2) ? '#ff8fab' : '#81e6a9');
            ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
          }
        }
      }

      // Amigos en el minimapa (verde si están alimentados, rosa parpadeante si tienen hambre)
      for (const fr of this.friends) {
        ctx.fillStyle = fr.hungry ? '#ff1493' : '#4caf50';
        ctx.beginPath();
        ctx.arc(fr.x * cellW, fr.y * cellH, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Jugador y cono de visión
      const px = this.player.x * cellW;
      const py = this.player.y * cellH;
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Cono de visión
      const fov = this.player.fov;
      ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.arc(px, py, 20, this.player.angle - fov / 2, this.player.angle + fov / 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.doomGame = new TreatDoomGame();
})();
