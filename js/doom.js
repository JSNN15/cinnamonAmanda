/* Cinnamon Treat-Shooter 2.5D (El Repartidor Mágico de Dulces)
 * Motor Raycaster 2.5D robusto, nítido y colorido con SELECCIÓN DE PERSONAJE:
 * Elige entre Cinnamoroll, Milk o Pompompurin.
 * Laberinto de galletas con texturas, cielo pastel, suelo ajedrezado,
 * y sprites de amigos oficiales en cartelera 3D (Milk, Mocha, Purin, Chiffon).
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
      desc: '¡Reparte rollitos de canela recién horneados!'
    },
    {
      id: 'milk',
      name: 'Milk',
      badge: '🍼 Bebé',
      imgSrc: 'assets/milk_teddy.png',
      treatEmoji: '🧸',
      treatName: 'Galletita de Osito',
      pawColor: '#ffffff',
      desc: '¡Reparte ricas galletitas de osito y biberones!'
    },
    {
      id: 'purin',
      name: 'Pompompurin',
      badge: '🍮 Purin',
      imgSrc: 'assets/pompompurin.png',
      treatEmoji: '🍮',
      treatName: 'Pudín de Caramelo',
      pawColor: '#fde047',
      desc: '¡Reparte deliciosos flanes y pudines dulces!'
    }
  ];

  // Mapa del laberinto (1: galleta waffle, 2: oblea rosa, 3: seto menta, 0: camino)
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
        speed: 2.4,
        rotSpeed: 2.6
      };

      this.keys = { forward: false, backward: false, left: false, right: false };
      this.projectiles = [];
      this.friends = [];
      this.fedCount = 0;
      this.totalFriends = 4;

      // Cargar imágenes de los amigos
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

          <div class="char-select-cards-row">
            ${PLAYABLE_CHARACTERS.map(c => `
              <div class="char-hero-card ${c.id === this.selectedHero.id ? 'active' : ''}" data-id="${c.id}">
                <div class="hero-badge">${c.badge}</div>
                <div class="hero-img-box">
                  <img src="${c.imgSrc}" alt="${c.name}" />
                </div>
                <h2>${c.name}</h2>
                <div class="hero-treat-tag">${c.treatEmoji} ${c.treatName}</div>
                <p>${c.desc}</p>
                <button class="btn-pick-hero">▶ ¡Elegir a ${c.name}!</button>
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
      // Amigos en el laberinto según quién esté jugando (para no repetir al héroe)
      const allPossible = [
        { id: 'mocha', name: 'Mocha', x: 7.5, y: 2.5, imgKey: 'mocha', hungry: true, phrase: '¡Quiero un dulce! 🎀' },
        { id: 'chiffon', name: 'Chiffon', x: 1.8, y: 7.2, imgKey: 'chiffon', hungry: true, phrase: '¡Tengo apetito! 🌸' },
        { id: 'milk', name: 'Milk', x: 2.5, y: 1.8, imgKey: 'milk', hungry: true, phrase: '¡Quiero merienda! 🍼' },
        { id: 'purin', name: 'Pompompurin', x: 9.5, y: 7.5, imgKey: 'purin', hungry: true, phrase: '¡Mucho apetito! 🍮' },
        { id: 'cinna', name: 'Cinnamoroll', x: 2.5, y: 1.8, imgKey: 'cinna', hungry: true, phrase: '¡Un rollito porfa! 🪽' }
      ];

      // Excluir al héroe seleccionado
      this.friends = allPossible.filter(f => f.id !== this.selectedHero.id).slice(0, 4);
      this.totalFriends = this.friends.length;
      this.fedCount = 0;
      this.projectiles = [];
      this.player.x = 1.5;
      this.player.y = 3.5;
      this.player.angle = 0;
    }

    render3DStage() {
      const hero = this.selectedHero;

      this.container.innerHTML = `
        <div class="doom-wrapper">
          <canvas id="doomCanvas" width="${VW}" height="${VH}"></canvas>

          <!-- Barra superior -->
          <div class="doom-hud">
            <div class="doom-score-pill">
              <span>💖 Amigos Felices: <strong id="doomFedCount">0 / ${this.totalFriends}</strong></span>
            </div>
            <div class="doom-hero-pill">
              <span>Jugando como: <strong>${hero.name}</strong> ${hero.treatEmoji}</span>
            </div>
            <button class="btn-change-hero" id="btnChangeHero">🔄 Cambiar Personaje</button>
          </div>

          <!-- Radar / Minimap -->
          <canvas id="doomMinimap" class="doom-radar-canvas" width="120" height="100"></canvas>

          <!-- Bandeja y patitas en primer plano del personaje elegido -->
          <div class="cinna-firstperson-tray" id="cinnaHands">
            <div class="tray-treat-display" id="trayTreatGraphic">${hero.treatEmoji}</div>
            <div class="hero-firstperson-paw paw-left" style="background-color: ${hero.pawColor};">🐾</div>
            <div class="hero-firstperson-paw paw-right" style="background-color: ${hero.pawColor};">🐾</div>
          </div>

          <!-- Controles táctiles transparentes -->
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
      A.whoosh(true);
      const tray = this.container.querySelector('#cinnaHands');
      if (tray) {
        tray.classList.add('launch-recoil');
        setTimeout(() => tray.classList.remove('launch-recoil'), 220);
      }

      const dirX = Math.cos(this.player.angle);
      const dirY = Math.sin(this.player.angle);

      this.projectiles.push({
        x: this.player.x + dirX * 0.35,
        y: this.player.y + dirY * 0.35,
        vx: dirX * 5.2,
        vy: dirY * 5.2,
        emoji: this.selectedHero.treatEmoji,
        life: 2.4
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

      if (this.keys.left) p.angle -= p.rotSpeed * dt;
      if (this.keys.right) p.angle += p.rotSpeed * dt;

      let moveStep = 0;
      if (this.keys.forward) moveStep = p.speed * dt;
      if (this.keys.backward) moveStep = -p.speed * dt;

      if (moveStep !== 0) {
        const nextX = p.x + Math.cos(p.angle) * moveStep;
        const nextY = p.y + Math.sin(p.angle) * moveStep;
        if (!this.isWall(nextX, p.y)) p.x = nextX;
        if (!this.isWall(p.x, nextY)) p.y = nextY;
      }

      // Proyectiles
      for (const pr of this.projectiles) {
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
        pr.life -= dt;

        for (const fr of this.friends) {
          if (fr.hungry && Math.hypot(pr.x - fr.x, pr.y - fr.y) < 0.65) {
            fr.hungry = false;
            pr.life = -1;
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

        if (this.isWall(pr.x, pr.y)) {
          pr.life = -1;
        }
      }
      this.projectiles = this.projectiles.filter(pr => pr.life > 0);
    }

    isWall(x, y) {
      const mx = Math.floor(x);
      const my = Math.floor(y);
      if (mx < 0 || mx >= MAP_W || my < 0 || my >= MAP_H) return true;
      return MAP[my][mx] > 0;
    }

    updateHUD() {
      const el = this.container ? this.container.querySelector('#doomFedCount') : null;
      if (el) el.textContent = `${this.fedCount} / ${this.totalFriends}`;
    }

    render() {
      const ctx = this.ctx;
      const p = this.player;

      // 1. Cielo soleado pastel
      const skyGrad = ctx.createLinearGradient(0, 0, 0, VH / 2);
      skyGrad.addColorStop(0, '#7ec8f8');
      skyGrad.addColorStop(1, '#d8efff');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, VW, VH / 2);

      // Nubes decorativas en el cielo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 4; i++) {
        const cx = ((i * 180 - p.angle * 80) % VW + VW) % VW;
        ctx.beginPath();
        ctx.arc(cx, 40, 24, 0, Math.PI * 2);
        ctx.arc(cx + 20, 35, 30, 0, Math.PI * 2);
        ctx.arc(cx + 45, 42, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Suelo ajedrezado pastel
      const floorGrad = ctx.createLinearGradient(0, VH / 2, 0, VH);
      floorGrad.addColorStop(0, '#ffd6e7');
      floorGrad.addColorStop(1, '#ffb8d6');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, VH / 2, VW, VH / 2);

      // 3. Raycasting nítido
      const numRays = VW / 2;
      const halfFov = p.fov / 2;
      const zBuffer = new Array(numRays);

      for (let r = 0; r < numRays; r++) {
        const rayAngle = p.angle - halfFov + (r / numRays) * p.fov;
        const cosRay = Math.cos(rayAngle);
        const sinRay = Math.sin(rayAngle);

        let dist = 0;
        let hitType = 1;
        const maxDist = 16;
        const step = 0.035;

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

        const correctDist = dist * Math.cos(rayAngle - p.angle);
        zBuffer[r] = correctDist;

        const wallH = Math.min(VH * 1.6, (VH / correctDist) * 1.05);
        const topY = (VH - wallH) / 2;

        let wallColor = '#f5c98d'; // Galleta
        if (hitType === 2) wallColor = '#ff8fab'; // Oblea rosa
        if (hitType === 3) wallColor = '#81e6a9'; // Seto menta

        const shade = Math.max(0.4, 1 - correctDist / 14);
        ctx.fillStyle = wallColor;
        ctx.globalAlpha = shade;
        ctx.fillRect(r * 2, topY, 2.2, wallH);

        // Borde superior de galleta
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(r * 2, topY, 2.2, 3);
      }
      ctx.globalAlpha = 1;

      // 4. Sprites de los amigos oficiales en 3D (Billboard)
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

      sprites.sort((a, b) => b.dist - a.dist);

      for (const sp of sprites) {
        const dx = sp.x - p.x;
        const dy = sp.y - p.y;

        let angleToSprite = Math.atan2(dy, dx) - p.angle;
        while (angleToSprite < -Math.PI) angleToSprite += Math.PI * 2;
        while (angleToSprite > Math.PI) angleToSprite -= Math.PI * 2;

        if (Math.abs(angleToSprite) < halfFov + 0.35 && sp.dist > 0.25) {
          const screenX = (VW / 2) + Math.tan(angleToSprite) * (VW / (2 * Math.tan(halfFov)));
          const spriteH = Math.min(VH * 1.1, (VH / sp.dist) * 0.95);
          const spriteW = spriteH * 1.1;
          const rayIdx = Math.floor((screenX / VW) * numRays);

          if (rayIdx >= 0 && rayIdx < numRays && sp.dist < zBuffer[rayIdx] + 0.4) {
            const screenY = VH / 2 - spriteH / 2 + 10;

            if (sp.type === 'friend') {
              const fr = sp.data;
              const img = this.friendImages[fr.imgKey];

              if (img && img.complete) {
                ctx.drawImage(img, screenX - spriteW / 2, screenY, spriteW, spriteH);
              }

              // Burbuja animada sobre la cabeza
              const bubbleText = fr.hungry ? fr.phrase : '¡Yummy! 💖';
              ctx.font = `bold ${Math.max(14, Math.floor(spriteH * 0.22))}px sans-serif`;
              ctx.fillStyle = '#ffffff';
              ctx.strokeStyle = '#5c3d2e';
              ctx.lineWidth = 3;
              ctx.textAlign = 'center';

              const bubbleY = screenY - 14;
              ctx.strokeText(bubbleText, screenX, bubbleY);
              ctx.fillStyle = fr.hungry ? '#ff1493' : '#2e7d32';
              ctx.fillText(bubbleText, screenX, bubbleY);
            } else if (sp.type === 'projectile') {
              ctx.font = `${Math.floor(spriteH * 0.6)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText(sp.data.emoji, screenX, screenY + spriteH * 0.5);
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
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          if (MAP[y][x] > 0) {
            ctx.fillStyle = '#ffb3d1';
            ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
          }
        }
      }

      for (const fr of this.friends) {
        ctx.fillStyle = fr.hungry ? '#ff1493' : '#4caf50';
        ctx.beginPath();
        ctx.arc(fr.x * cellW, fr.y * cellH, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const px = this.player.x * cellW;
      const py = this.player.y * cellH;
      ctx.fillStyle = '#2196f3';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(this.player.angle) * 12, py + Math.sin(this.player.angle) * 12);
      ctx.stroke();
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.doomGame = new TreatDoomGame();
})();
