/* Cinnamon Treat-Shooter 2.5D (El Repartidor Mágico de Dulces de Sanrio)
 * Motor Raycaster 2.5D con SELECCIÓN DE PERSONAJE:
 * Cinnamoroll, Milk o Pompompurin.
 * 
 * MEJORAS ARQUITECTÓNICAS Y FÍSICAS SENIOR:
 *  1. Mapa de Pabellón Amplio (14x12) con pasillos anchos (2-4 baldosas), plaza central y salones temáticos.
 *  2. Separación elástica entre amigos (Boids Flocking Repulsion): NUNCA se superponen ni se enciman.
 *  3. Ceder el paso cortésmente (Gentle Step-Aside): Los amigos se hacen a un lado suavemente al acercarse Amanda.
 *  4. Colisión suave de jugador optimizada: Cero atascos o bloqueos, incluso con amigos al rededor.
 *  5. Renderizado 3D de personajes: Sombras de suelo proyectadas en perspectiva, niebla de profundidad,
 *     iluminación volumétrica y balanceo de respiración tridimensional.
 *  6. Manos y dulces en primera persona con modelado volumétrico 3D, reflejos cerámicos y glaseados realistas.
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
      padColor: '#f472b6',
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
      padColor: '#f472b6',
      desc: '¡El más chiquitito! Reparte ricos biberones de leche tibia.'
    },
    {
      id: 'purin',
      name: 'Pompompurin',
      badge: '🍮 Purin',
      imgSrc: 'assets/pompompurin_hq.png',
      treatEmoji: '🍮',
      treatName: 'Pudín de Caramelo',
      pawColor: '#fef08a',
      cuffColor: '#78350f',
      padColor: '#b45309',
      desc: '¡El perrito con boina! Reparte deliciosos flanes de caramelo con cereza.'
    },
    {
      id: 'chiffon',
      name: 'Chiffon',
      badge: '🌸 Chiffon',
      imgSrc: 'assets/chiffon.png',
      treatEmoji: '🧁',
      treatName: 'Cupcake de Vainilla',
      pawColor: '#fef3c7',
      cuffColor: '#f472b6',
      padColor: '#fb7185',
      desc: '¡La perrita enérgica! Reparte esponjosos cupcakes de vainilla con chispitas.'
    },
    {
      id: 'mocha',
      name: 'Mocha',
      badge: '🎀 Mocha',
      imgSrc: 'assets/mocha_hq.png',
      treatEmoji: '🍫',
      treatName: 'Chocolate con Malvaviscos',
      pawColor: '#d97706',
      cuffColor: '#92400e',
      padColor: '#fbbf24',
      desc: '¡La líder elegante! Reparte chocolate caliente cremoso con malvaviscos.'
    }
  ];

  // Mapa de la Gran Pastelería Sanrio (14 x 12)
  // Pasillos anchos de 2 a 3 baldosas, plaza central y 4 salones abiertos.
  // 1: Galleta waffle dorada, 2: Oblea de fresa, 3: Caramelo menta, 0: Camino despejado
  const MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1], // Salón Sup Izq (Milk/Cinna) | Salón Sup Der (Mocha)
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 1, 1], // Pasillos anchos a los lados de la plaza
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Gran Plaza Central de Dulces
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Salón Inf Izq (Chiffon) | Salón Inf Der (Purin)
    [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];
  const MAP_W = 14;
  const MAP_H = 12;

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
        x: 6.5,
        y: 2.5,
        angle: Math.PI / 2, // Mirando hacia el centro
        fov: Math.PI / 3,   // 60 deg
        speed: 2.4,
        rotSpeed: 2.6
      };

      this.keys = { forward: false, backward: false, left: false, right: false };
      this.projectiles = [];
      this.friends = [];
      this.particles = [];
      this.fedCount = 0;
      this.totalFriends = 4;

      this.walkTimer = 0;
      this.recoil = 0;
      this.swayAngle = 0;
      this.bumpIntensity = 0;
      this.lastBumpSoundTime = 0;

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
      this.friendImages.purin.src = 'assets/pompompurin_hq.png';
      this.friendImages.mocha.src = 'assets/mocha_hq.png';
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
                <p>${c.desc}</p>
                <button class="btn-select-hero">¡Jugar con ${c.name}!</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      this.container.querySelectorAll('.char-hero-card').forEach(card => {
        card.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          const found = PLAYABLE_CHARACTERS.find(c => c.id === id);
          if (found) {
            A.unlock();
            A.celebrate();
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
      // Amigos distribuidos en los 4 salones amplios de la gran pastelería
      const allPossible = [
        { id: 'mocha', name: 'Mocha', x: 10.5, y: 2.5, imgKey: 'mocha', hungry: true, phrase: '¡Quiero un dulce! 🎀' },
        { id: 'chiffon', name: 'Chiffon', x: 2.5, y: 9.5, imgKey: 'chiffon', hungry: true, phrase: '¡Tengo apetito! 🌸' },
        { id: 'milk', name: 'Milk', x: 2.5, y: 2.5, imgKey: 'milk', hungry: true, phrase: '¡Quiero lechita! 🍼' },
        { id: 'purin', name: 'Pompompurin', x: 10.5, y: 9.5, imgKey: 'purin', hungry: true, phrase: '¡Mucho apetito! 🍮' },
        { id: 'cinna', name: 'Cinnamoroll', x: 6.5, y: 8.5, imgKey: 'cinna', hungry: true, phrase: '¡Un rollito porfa! 🪽' }
      ];

      // Excluir al héroe que está usando Amanda
      this.friends = allPossible
        .filter(f => f.id !== this.selectedHero.id)
        .slice(0, 4)
        .map(f => ({
          ...f,
          originX: f.x,
          originY: f.y,
          vx: 0,
          vy: 0,
          facingLeft: false,
          wanderTimer: 1.5 + Math.random() * 2,
          jumpY: 0,
          breathePhase: Math.random() * Math.PI * 2
        }));

      this.totalFriends = this.friends.length;
      this.fedCount = 0;
      this.projectiles = [];
      this.particles = [];
      this.player.x = 6.5;
      this.player.y = 2.5;
      this.player.angle = Math.PI / 2;
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
              <span>Amigos Felices: <strong id="doomFedCount">0 / ${this.totalFriends}</strong></span>
            </div>
            <div class="doom-hero-pill">
              <span>Jugando como: <strong>${hero.name}</strong> ${hero.treatEmoji}</span>
            </div>
            <button class="btn-change-hero" id="btnChangeHero">🔄 Cambiar Personaje</button>
          </div>

          <!-- Radar / Minimap -->
          <canvas id="doomMinimap" class="doom-radar-canvas" width="130" height="110"></canvas>

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
      if (!this.inputsBound) {
        this.inputsBound = true;
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
      }

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
      if (this.recoil > 0.4) return;
      A.whoosh(true);
      this.recoil = 1.0;

      const dirX = Math.cos(this.player.angle);
      const dirY = Math.sin(this.player.angle);

      this.projectiles.push({
        x: this.player.x + dirX * 0.45,
        y: this.player.y + dirY * 0.45,
        vx: dirX * 5.6,
        vy: dirY * 5.6,
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

    // Comprobación de colisión en mapa
    canMoveTo(x, y, radius = 0.24, checkFriends = false) {
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
          // Radio de colisión suave reducido para no atascar jamás al jugador
          if (Math.hypot(x - fr.x, y - fr.y) < radius + 0.16) return false;
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

        // Deslizamiento independiente en X e Y
        if (this.canMoveTo(p.x + moveX, p.y, 0.24, true)) {
          p.x += moveX;
        } else {
          didBump = true;
        }

        if (this.canMoveTo(p.x, p.y + moveY, 0.24, true)) {
          p.y += moveY;
        } else {
          didBump = true;
        }

        this.walkTimer += dt * 7.0;

        // Sonido suave al toparse con muros
        if (didBump) {
          const nowMs = performance.now();
          if (nowMs - this.lastBumpSoundTime > 400) {
            this.lastBumpSoundTime = nowMs;
            A.softBoing();
          }
          this.bumpIntensity = 0.8;
        }
      }

      this.bumpIntensity = Math.max(0, this.bumpIntensity - dt * 5.0);

      if (this.recoil > 0) {
        this.recoil = Math.max(0, this.recoil - dt * 3.5);
      }

      // --- IA DE LOS AMIGOS (FÍSICA ANTIBLOQUEO & SEPARACIÓN ELÁSTICA) ---
      for (const fr of this.friends) {
        fr.breathePhase += dt * 3.0;

        // Si ya comió: brinca alegremente
        if (!fr.hungry) {
          fr.jumpY = Math.abs(Math.sin(performance.now() / 140)) * 22;
          continue;
        }

        // 1. CEDER EL PASO AL JUGADOR (Gentle Step-Aside):
        // Si Amanda se acerca a menos de 1.05m, el amigo se hace a un lado amablemente
        const distToPlayer = Math.hypot(fr.x - p.x, fr.y - p.y);
        if (distToPlayer < 1.05 && distToPlayer > 0.01) {
          const pushX = (fr.x - p.x) / distToPlayer;
          const pushY = (fr.y - p.y) / distToPlayer;
          const yieldSpeed = dt * 1.5;
          if (this.canMoveTo(fr.x + pushX * yieldSpeed, fr.y + pushY * yieldSpeed, 0.22, false)) {
            fr.x += pushX * yieldSpeed;
            fr.y += pushY * yieldSpeed;
            fr.facingLeft = (pushX < 0);
          }
        }

        // 2. Deambular tranquilo cerca de su zona
        fr.wanderTimer -= dt;
        if (fr.wanderTimer <= 0) {
          fr.wanderTimer = 2.5 + Math.random() * 3.0;
          const wanderAngle = Math.random() * Math.PI * 2;
          const stepDist = 0.35;
          const tx = fr.x + Math.cos(wanderAngle) * stepDist;
          const ty = fr.y + Math.sin(wanderAngle) * stepDist;

          // No alejarse más de 2.0 casillas de su salón y no atravesar muros
          if (Math.hypot(tx - fr.originX, ty - fr.originY) < 2.0 && this.canMoveTo(tx, ty, 0.22, false)) {
            fr.facingLeft = (tx < fr.x);
            fr.x = tx;
            fr.y = ty;
          }
        }
      }

      // 3. SEPARACIÓN MUTUA DE AMIGOS (Boids Flocking Repulsion):
      // Si dos amigos se acercan a menos de 1.2 casillas, se repelen elásticamente para NUNCA superponerse
      for (let i = 0; i < this.friends.length; i++) {
        for (let j = i + 1; j < this.friends.length; j++) {
          const f1 = this.friends[i];
          const f2 = this.friends[j];
          const dx = f1.x - f2.x;
          const dy = f1.y - f2.y;
          const d = Math.hypot(dx, dy);
          const minSeparation = 1.25;

          if (d < minSeparation && d > 0.001) {
            const overlap = (minSeparation - d) * 0.5;
            const nx = dx / d;
            const ny = dy / d;

            if (this.canMoveTo(f1.x + nx * overlap, f1.y + ny * overlap, 0.22, false)) {
              f1.x += nx * overlap;
              f1.y += ny * overlap;
            }
            if (this.canMoveTo(f2.x - nx * overlap, f2.y - ny * overlap, 0.22, false)) {
              f2.x -= nx * overlap;
              f2.y -= ny * overlap;
            }
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
          if (fr.hungry && Math.hypot(pr.x - fr.x, pr.y - fr.y) < 0.72) {
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

        // Si choca con un muro, desaparece suavemente
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

      // 1. Cielo pastel suave con nubes flotantes
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

      // 2. Suelo con perspectiva y baldosas de pastelería
      const floorGrad = ctx.createLinearGradient(0, VH / 2, 0, VH);
      floorGrad.addColorStop(0, '#ffd8ea');
      floorGrad.addColorStop(1, '#ffbedc');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, VH / 2, VW, VH / 2);

      // Baldosas de perspectiva sobre el suelo
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      for (let y = VH / 2 + 10; y < VH; y += 14 + (y - VH / 2) * 0.35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(VW, y);
        ctx.stroke();
      }

      // 3. Algoritmo DDA Digital Differential Analysis (DOOM Raycaster)
      const numRays = VW / 2; // 320 rayos en columnas de 2px
      const halfFov = p.fov / 2;
      const zBuffer = new Array(numRays);

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
        let side = 0;
        let steps = 0;

        while (hit === 0 && steps < 35) {
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

        const correctDist = Math.max(0.2, perpWallDist * Math.cos(rayAngle - p.angle));
        zBuffer[r] = correctDist;

        // Altura del muro en pantalla
        const wallH = Math.min(VH * 1.8, (VH / correctDist) * 1.05);
        const topY = Math.floor((VH - wallH) / 2) + shakeY;
        const colX = r * 2;
        const colW = 2.2;

        let wallX;
        if (side === 0) {
          wallX = p.y + perpWallDist * rayDirY;
        } else {
          wallX = p.x + perpWallDist * rayDirX;
        }
        wallX -= Math.floor(wallX);

        // Paleta base según tipo de muro con iluminación 3D
        let baseColor = '#f6c78e';     // 1: Galleta de mantequilla dorada
        let mortarColor = '#e0a65b';
        if (hit === 2) {
          baseColor = '#ff9ebb';       // 2: Oblea de fresa pastel
          mortarColor = '#f472b6';
        } else if (hit === 3) {
          baseColor = '#8ee6b8';       // 3: Caramelo menta suave
          mortarColor = '#60c993';
        }

        // Sombreado direccional de caras 3D (Caras Norte/Sur con sombreado 0.72x)
        const faceShade = (side === 1) ? 0.72 : 1.0;
        const distShade = Math.max(0.35, 1 - (correctDist / 14));
        const finalShade = faceShade * distShade;

        ctx.fillStyle = baseColor;
        ctx.fillRect(colX, topY, colW, wallH);

        // Texturas de muros 3D
        if (hit === 1) {
          // Ranuras verticales de galleta waffle
          if (wallX < 0.05 || Math.abs(wallX - 0.5) < 0.04) {
            ctx.fillStyle = mortarColor;
            ctx.fillRect(colX, topY, colW, wallH);
          }
          // Chispas de chocolate
          if ((Math.abs(wallX - 0.25) < 0.03 || Math.abs(wallX - 0.75) < 0.03) && (r % 6 === 0)) {
            ctx.fillStyle = '#5c3d2e';
            ctx.fillRect(colX, topY + wallH * 0.45, colW, wallH * 0.1);
          }
        } else if (hit === 2) {
          // Oblea con crema blanca central
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.fillRect(colX, topY + wallH * 0.46, colW, Math.max(2, wallH * 0.08));
          if (Math.abs(wallX - 0.33) < 0.03 || Math.abs(wallX - 0.66) < 0.03) {
            ctx.fillStyle = mortarColor;
            ctx.fillRect(colX, topY, colW, wallH);
          }
        } else if (hit === 3) {
          // Rayas de caramelo
          const stripePhase = (wallX * 4) % 1;
          if (stripePhase < 0.4) {
            ctx.fillStyle = '#bbf7d0';
            ctx.fillRect(colX, topY, colW, wallH);
          }
        }

        // ZÓCALO INFERIOR DE CHOCOLATE (Delimitador visual nítido)
        const skirtH = Math.max(4, wallH * 0.12);
        ctx.fillStyle = '#5a3825';
        ctx.fillRect(colX, topY + wallH - skirtH, colW, skirtH);

        ctx.fillStyle = '#fde047';
        ctx.fillRect(colX, topY + wallH - skirtH, colW, 2);

        // MOLDURA SUPERIOR
        const crownH = Math.max(3, wallH * 0.08);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(colX, topY, colW, crownH);

        // Sombra de profundidad en muro
        if (finalShade < 0.98) {
          ctx.fillStyle = `rgba(30, 20, 45, ${1 - finalShade})`;
          ctx.fillRect(colX, topY, colW, wallH);
        }
      }

      // --- 4. RENDERIZADO 3D DE PERSONAJES, PROYECTILES Y PARTÍCULAS ---
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
          const spriteH = Math.min(VH * 0.75, (VH / sp.dist) * 0.88);
          const spriteW = spriteH * 1.15;
          const rayIdx = Math.floor((screenX / VW) * numRays);

          if (rayIdx >= 0 && rayIdx < numRays && sp.dist < zBuffer[rayIdx] + 0.35) {
            if (sp.type === 'friend') {
              const fr = sp.data;

              // A. SOMBRA PROYECTADA EN EL SUELO 3D (Ground Shadow Ellipse)
              // Ancla visualmente al personaje sobre el piso tridimensional
              const shadowFloorY = VH / 2 + (VH / sp.dist) * 0.44 + shakeY;
              const shadowW = spriteW * 0.65;
              const shadowH = shadowW * 0.22;
              const shadowGrad = ctx.createRadialGradient(screenX, shadowFloorY, 2, screenX, shadowFloorY, shadowW / 2);
              shadowGrad.addColorStop(0, 'rgba(45, 18, 38, 0.45)');
              shadowGrad.addColorStop(0.7, 'rgba(45, 18, 38, 0.2)');
              shadowGrad.addColorStop(1, 'rgba(45, 18, 38, 0)');
              ctx.fillStyle = shadowGrad;
              ctx.beginPath();
              ctx.ellipse(screenX, shadowFloorY, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
              ctx.fill();

              // B. RENDERIZADO DEL SPRITE CON PROFUNDIDAD Y RESPIRACIÓN 3D
              const screenY = VH / 2 - spriteH / 2 + 10 - fr.jumpY + shakeY;
              const img = this.friendImages[fr.imgKey];

              if (img && img.complete) {
                ctx.save();
                ctx.translate(screenX, screenY + spriteH / 2);

                // Orientación de mirada según su movimiento
                if (fr.facingLeft) {
                  ctx.scale(-1, 1);
                }

                // Respiración y balanceo orgánico 3D
                const breathe = 1 + Math.sin(fr.breathePhase) * 0.035;
                ctx.scale(1, breathe);

                // Sombra de profundidad por distancia (iluminación del entorno)
                const depthLight = Math.max(0.65, 1 - (sp.dist / 14));
                if (depthLight < 0.98) {
                  ctx.filter = `brightness(${depthLight.toFixed(2)})`;
                }

                ctx.drawImage(img, -spriteW / 2, -spriteH / 2, spriteW, spriteH);
                ctx.restore();
              }

              // C. BURBUJA 3D DE DIÁLOGO ADAPTADA
              const bubbleText = fr.hungry ? fr.phrase : '¡Ñam ñam! ¡Gracias Amanda! 💖';
              const bubbleFontSize = Math.min(15, Math.max(11, Math.floor(spriteH * 0.085)));
              ctx.font = `800 ${bubbleFontSize}px "Baloo 2", sans-serif`;
              ctx.textAlign = 'center';

              const bubbleY = Math.max(54, screenY - 14);
              ctx.fillStyle = fr.hungry ? 'rgba(255, 240, 245, 0.96)' : 'rgba(240, 255, 240, 0.96)';
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

              // Sombra en el piso bajo el dulce
              const projShadowY = VH / 2 + (VH / sp.dist) * 0.44 + shakeY;
              ctx.fillStyle = 'rgba(50, 20, 40, 0.25)';
              ctx.beginPath();
              ctx.ellipse(screenX, projShadowY, spriteW * 0.2, spriteW * 0.08, 0, 0, Math.PI * 2);
              ctx.fill();

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

      // --- 5. RENDERIZADO EN PRIMERA PERSONA CON ACABADO VOLUMÉTRICO 3D ---
      this.renderFirstPersonArms(ctx, dt);
    }

    renderFirstPersonArms(ctx, dt) {
      const hero = this.selectedHero;
      const t = this.walkTimer;

      // Vaivén al caminar (DOOM Weapon Bobbing)
      const isMoving = this.keys.forward || this.keys.backward;
      const bobX = isMoving ? Math.cos(t) * 12 : Math.cos(performance.now() / 650) * 3;
      const bobY = isMoving ? Math.abs(Math.sin(t)) * 14 : Math.sin(performance.now() / 650) * 4;
      const sway = this.swayAngle;

      let recoilOffset = 0;
      let treatScale = 1.0;
      if (this.recoil > 0.6) {
        const p = (this.recoil - 0.6) / 0.4;
        recoilOffset = -30 * p;
        treatScale = 1.15;
      } else if (this.recoil > 0.2) {
        const p = (this.recoil - 0.2) / 0.4;
        recoilOffset = 25 * p;
        treatScale = 0;
      } else if (this.recoil > 0) {
        const p = this.recoil / 0.2;
        recoilOffset = 15 * p;
        treatScale = 1.0 - p * 0.4;
      }

      const baseX = VW / 2 + bobX + sway;
      const baseY = VH - 26 + bobY + recoilOffset;

      ctx.save();
      ctx.translate(baseX, baseY);

      // --- A. BRAZOS VOLUMÉTRICOS CON SOMBREADO 3D SUAVE ---
      const armColor = hero.pawColor;
      const shadeColor = (hero.id === 'purin') ? '#fcd34d' : (hero.id === 'chiffon' ? '#fde68a' : (hero.id === 'mocha' ? '#92400e' : '#e0e7ff'));

      // Sombra proyectada detrás de los brazos
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.beginPath();
      ctx.ellipse(0, 48, 110, 44, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pancita redonda en primer plano con gradiente esférico 3D
      const bellyGrad = ctx.createRadialGradient(0, 20, 20, 0, 50, 110);
      bellyGrad.addColorStop(0, armColor);
      bellyGrad.addColorStop(0.7, armColor);
      bellyGrad.addColorStop(1, shadeColor);
      ctx.fillStyle = bellyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 56, 102, 42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brazo Izquierdo (Cilindro 3D con luz especular)
      const armLGrad = ctx.createLinearGradient(-100, 30, -30, -30);
      armLGrad.addColorStop(0, shadeColor);
      armLGrad.addColorStop(0.5, armColor);
      armLGrad.addColorStop(1, armColor);
      ctx.fillStyle = armLGrad;
      ctx.beginPath();
      ctx.moveTo(-100, 52);
      ctx.bezierCurveTo(-85, 18, -68, -18, -48, -40);
      ctx.lineTo(-24, -20);
      ctx.bezierCurveTo(-44, 12, -56, 38, -62, 52);
      ctx.closePath();
      ctx.fill();

      // Brazo Derecho
      const armRGrad = ctx.createLinearGradient(100, 30, 30, -30);
      armRGrad.addColorStop(0, shadeColor);
      armRGrad.addColorStop(0.5, armColor);
      armRGrad.addColorStop(1, armColor);
      ctx.fillStyle = armRGrad;
      ctx.beginPath();
      ctx.moveTo(100, 52);
      ctx.bezierCurveTo(85, 18, 68, -18, 48, -40);
      ctx.lineTo(24, -20);
      ctx.bezierCurveTo(44, 12, 56, 38, 62, 52);
      ctx.closePath();
      ctx.fill();

      // --- B. BANDEJA DE PORCELANA Y DULCE 3D MODELADO ---
      if (treatScale > 0.05) {
        ctx.save();
        ctx.translate(0, -48);
        ctx.scale(treatScale, treatScale);

        // 1. Sombra bajo la bandeja
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(0, 26, 58, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Plato de Porcelana con Borde Dorado y Brillo Especular
        const plateGrad = ctx.createLinearGradient(0, 8, 0, 24);
        plateGrad.addColorStop(0, '#ffffff');
        plateGrad.addColorStop(0.6, '#f8fafc');
        plateGrad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = plateGrad;
        ctx.beginPath();
        ctx.ellipse(0, 22, 54, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Filo dorado
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (hero.id === 'cinna') {
          // --- ROLLITO DE CANELA 3D VOLUMÉTRICO ---
          // Bollo horneado con gradiente cálido
          const rollGrad = ctx.createRadialGradient(0, -6, 8, 0, 0, 36);
          rollGrad.addColorStop(0, '#fde68a');
          rollGrad.addColorStop(0.5, '#d97706');
          rollGrad.addColorStop(1, '#92400e');
          ctx.fillStyle = rollGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, 42, 26, 0, 0, Math.PI * 2);
          ctx.fill();

          // Glaseado de crema blanca brillante
          const glazeGrad = ctx.createRadialGradient(-6, -8, 4, 0, -6, 28);
          glazeGrad.addColorStop(0, '#ffffff');
          glazeGrad.addColorStop(0.7, '#fef3c7');
          glazeGrad.addColorStop(1, 'rgba(254, 243, 199, 0.8)');
          ctx.fillStyle = glazeGrad;
          ctx.beginPath();
          ctx.ellipse(0, -5, 34, 15, 0, 0, Math.PI * 2);
          ctx.fill();

          // Espirales de canela con relieve 3D
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0.4, Math.PI * 2.3);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, 11, 0.6, Math.PI * 2.1);
          ctx.stroke();

          // Brillos mágicos
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✨', 32, -20);

        } else if (hero.id === 'milk') {
          // --- BIBERÓN DE LECHE 3D CRISTALINO ---
          // Botella de vidrio con leche tibia
          const bottleGrad = ctx.createLinearGradient(-24, 0, 24, 0);
          bottleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          bottleGrad.addColorStop(0.3, '#ffffff');
          bottleGrad.addColorStop(0.7, '#fef9c3');
          bottleGrad.addColorStop(1, 'rgba(224, 242, 254, 0.85)');
          ctx.fillStyle = bottleGrad;
          ctx.beginPath();
          ctx.roundRect(-24, -30, 48, 66, 12);
          ctx.fill();

          // Graduación métrica
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 2;
          for (let ly = -8; ly <= 20; ly += 8) {
            ctx.beginPath();
            ctx.moveTo(-16, ly);
            ctx.lineTo(-4, ly);
            ctx.stroke();
          }

          // Cuello celeste con brillo
          ctx.fillStyle = '#60a5fa';
          ctx.beginPath();
          ctx.roundRect(-20, -42, 40, 14, 6);
          ctx.fill();

          // Chupete amarillo translúcido
          const teatGrad = ctx.createRadialGradient(0, -48, 3, 0, -48, 12);
          teatGrad.addColorStop(0, '#fef08a');
          teatGrad.addColorStop(1, '#f59e0b');
          ctx.fillStyle = teatGrad;
          ctx.beginPath();
          ctx.arc(0, -48, 10, Math.PI, 0);
          ctx.fill();

          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🍼', 0, 18);

        } else if (hero.id === 'purin') {
          // --- PUDÍN DE CARAMELO 3D CON CEREZA ---
          // Cuerpo del flan de vainilla
          const flanGrad = ctx.createRadialGradient(0, 4, 10, 0, 10, 36);
          flanGrad.addColorStop(0, '#fef08a');
          flanGrad.addColorStop(0.7, '#fde047');
          flanGrad.addColorStop(1, '#eab308');
          ctx.fillStyle = flanGrad;
          ctx.beginPath();
          ctx.moveTo(-36, 18);
          ctx.lineTo(-24, -14);
          ctx.quadraticCurveTo(0, -22, 24, -14);
          ctx.lineTo(36, 18);
          ctx.closePath();
          ctx.fill();

          // Caramelo oscuro chorreante arriba
          const caramelGrad = ctx.createRadialGradient(0, -14, 4, 0, -14, 24);
          caramelGrad.addColorStop(0, '#92400e');
          caramelGrad.addColorStop(1, '#451a03');
          ctx.fillStyle = caramelGrad;
          ctx.beginPath();
          ctx.ellipse(0, -14, 25, 9, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cereza con brillo especular 3D
          const cherryGrad = ctx.createRadialGradient(-3, -28, 2, 0, -26, 9);
          cherryGrad.addColorStop(0, '#fca5a5');
          cherryGrad.addColorStop(0.5, '#dc2626');
          cherryGrad.addColorStop(1, '#7f1d1d');
          ctx.fillStyle = cherryGrad;
          ctx.beginPath();
          ctx.arc(0, -26, 8.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (hero.id === 'chiffon') {
          // --- CUPCAKE DE VAINILLA Y FRESA 3D (CHIFFON) ---
          const cupGrad = ctx.createLinearGradient(-26, 0, 26, 0);
          cupGrad.addColorStop(0, '#fbcfe8');
          cupGrad.addColorStop(0.5, '#f472b6');
          cupGrad.addColorStop(1, '#db2777');
          ctx.fillStyle = cupGrad;
          ctx.beginPath();
          ctx.moveTo(-24, 20);
          ctx.lineTo(-30, -2);
          ctx.lineTo(30, -2);
          ctx.lineTo(24, 20);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1.5;
          for (let lx = -20; lx <= 20; lx += 8) {
            ctx.beginPath();
            ctx.moveTo(lx * 0.85, 20);
            ctx.lineTo(lx, -2);
            ctx.stroke();
          }

          const swirlGrad = ctx.createRadialGradient(0, -18, 6, 0, -18, 30);
          swirlGrad.addColorStop(0, '#ffffff');
          swirlGrad.addColorStop(0.5, '#fbcfe8');
          swirlGrad.addColorStop(1, '#f472b6');
          ctx.fillStyle = swirlGrad;
          ctx.beginPath();
          ctx.ellipse(0, -10, 32, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(0, -20, 22, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(0, -28, 12, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          const strawGrad = ctx.createRadialGradient(-2, -37, 2, 0, -35, 9);
          strawGrad.addColorStop(0, '#fda4af');
          strawGrad.addColorStop(0.6, '#e11d48');
          strawGrad.addColorStop(1, '#9f1239');
          ctx.fillStyle = strawGrad;
          ctx.beginPath();
          ctx.arc(0, -35, 7.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✨', 24, -22);
        } else if (hero.id === 'mocha') {
          // --- CHOCOLATE CALIENTE CON MALVAVISCOS 3D (MOCHA) ---
          const mugGrad = ctx.createLinearGradient(-26, 0, 26, 0);
          mugGrad.addColorStop(0, '#fef3c7');
          mugGrad.addColorStop(0.3, '#ffffff');
          mugGrad.addColorStop(0.8, '#fed7aa');
          mugGrad.addColorStop(1, '#f97316');
          ctx.fillStyle = mugGrad;
          ctx.beginPath();
          ctx.roundRect(-24, -12, 48, 32, [4, 4, 16, 16]);
          ctx.fill();

          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(26, 4, 10, -Math.PI * 0.4, Math.PI * 0.4);
          ctx.stroke();

          const chocGrad = ctx.createRadialGradient(0, -12, 4, 0, -12, 22);
          chocGrad.addColorStop(0, '#78350f');
          chocGrad.addColorStop(0.8, '#451a03');
          chocGrad.addColorStop(1, '#290e02');
          ctx.fillStyle = chocGrad;
          ctx.beginPath();
          ctx.ellipse(0, -12, 22, 9, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(-12, -18, 10, 8, 3);
          ctx.fill();
          ctx.fillStyle = '#fce7f3';
          ctx.beginPath();
          ctx.roundRect(4, -16, 9, 7, 3);
          ctx.fill();

          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('☕', 0, -28);
        }

        ctx.restore();
      }

      // --- C. PATITAS AFELPADAS 3D CON ALMOHADILLAS ---
      const pawPadColor = hero.padColor;

      // Patita Izquierda
      const pawLGrad = ctx.createRadialGradient(-48, -48, 4, -48, -48, 20);
      pawLGrad.addColorStop(0, armColor);
      pawLGrad.addColorStop(0.8, armColor);
      pawLGrad.addColorStop(1, shadeColor);
      ctx.fillStyle = pawLGrad;
      ctx.beginPath();
      ctx.ellipse(-48, -48, 20, 18, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Almohadilla central
      ctx.fillStyle = pawPadColor;
      ctx.beginPath();
      ctx.ellipse(-48, -48, 8, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Deditos izquierda
      for (const [ox, oy] of [[-44, -62], [-58, -50], [-52, -34]]) {
        ctx.fillStyle = armColor;
        ctx.beginPath();
        ctx.arc(ox, oy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pawPadColor;
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Patita Derecha
      const pawRGrad = ctx.createRadialGradient(48, -48, 4, 48, -48, 20);
      pawRGrad.addColorStop(0, armColor);
      pawRGrad.addColorStop(0.8, armColor);
      pawRGrad.addColorStop(1, shadeColor);
      ctx.fillStyle = pawRGrad;
      ctx.beginPath();
      ctx.ellipse(48, -48, 20, 18, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Almohadilla central
      ctx.fillStyle = pawPadColor;
      ctx.beginPath();
      ctx.ellipse(48, -48, 8, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Deditos derecha
      for (const [ox, oy] of [[44, -62], [58, -50], [52, -34]]) {
        ctx.fillStyle = armColor;
        ctx.beginPath();
        ctx.arc(ox, oy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pawPadColor;
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
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
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Muros del minimapa
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          if (MAP[y][x] > 0) {
            ctx.fillStyle = (MAP[y][x] === 1) ? '#f5c98d' : ((MAP[y][x] === 2) ? '#ff8fab' : '#81e6a9');
            ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
          }
        }
      }

      // Amigos en el minimapa (verde si están alimentados, rosa si tienen hambre)
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
      ctx.fillStyle = 'rgba(37, 99, 235, 0.22)';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.arc(px, py, 22, this.player.angle - fov / 2, this.player.angle + fov / 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.doomGame = new TreatDoomGame();
})();
