/* ============================================================
   CINNAMOROLL WORLD: CASA DE SUEÑOS (avatar-world.js)
   Juego estilo Avatar World / Toca Life World con:
   1. Ilustración vectorial continua y suave en Canvas 2D (cero efecto "sticker pegado"):
      sombras de contacto dinámicas, contornos cálidos (#5c3d2e), iluminación ambiental
      reactiva (Día / Atardecer / Noche) y ordenamiento de profundidad (Y-sorting).
   2. Creador y Vestidor Completo de Personajes (6 personajes base Sanrio, 8 sombreros,
      7 vestidos/trajes, 5 lentes/accesorios, 6 objetos en mano y 6 expresiones faciales).
   3. 3 Habitaciones Interactivas y Editables (Cafetería Dulce, Dormitorio de Nubes,
      Jardín Sakura & Fiesta) con muebles movibles y catálogo de decoración.
   4. Soporte híbrido inteligente: Touch/Drag directo en pantalla + Hasta 3 Jugadores
      Simultáneos (P1 🌸, P2 🩵, P3 💛) con Mando Celular o Bluetooth.
   ============================================================ */
(function () {
  const A = () => window.Cinnamo?.audio;

  const CHARACTER_BASES = [
    {
      id: 'cinna',
      name: 'Cinnamoroll',
      bodyColor: '#ffffff',
      shadowTint: '#e0f2fe',
      earType: 'long_floppy',
      earColor: '#ffffff',
      innerEar: '#ffd6e7',
      cheekColor: '#ff9ebb',
      eyeColor: '#38bdf8',
      tailType: 'cinnamon_roll'
    },
    {
      id: 'milk',
      name: 'Milk',
      bodyColor: '#fffdf9',
      shadowTint: '#e0f2fe',
      earType: 'short_floppy',
      earColor: '#fffdf9',
      innerEar: '#ffd6e7',
      cheekColor: '#ffb3c6',
      eyeColor: '#0284c7',
      tailType: 'curl',
      hasPacifier: true,
      topCurl: true
    },
    {
      id: 'mocha',
      name: 'Mocha',
      bodyColor: '#c69c72',
      shadowTint: '#9c734b',
      earType: 'long_wavy',
      earColor: '#b08359',
      innerEar: '#f5cba7',
      cheekColor: '#ff8da1',
      eyeColor: '#4a2c11',
      tailType: 'fluffy',
      earFlowers: true
    },
    {
      id: 'chiffon',
      name: 'Chiffon',
      bodyColor: '#fdebd0',
      shadowTint: '#f5cba7',
      earType: 'fluffy_cloud',
      earColor: '#e59866',
      innerEar: '#fadbd8',
      cheekColor: '#ff85a2',
      eyeColor: '#5c3d2e',
      tailType: 'fluffy_poof'
    },
    {
      id: 'purin',
      name: 'Pompompurin',
      bodyColor: '#fef08a',
      shadowTint: '#facc15',
      earType: 'round_droop',
      earColor: '#fef08a',
      innerEar: '#fde047',
      cheekColor: '#fca5a5',
      eyeColor: '#5c3d2e',
      tailType: 'fluffy',
      defaultBeret: true
    },
    {
      id: 'cappuccino',
      name: 'Cappuccino',
      bodyColor: '#e6ccb2',
      shadowTint: '#ddb892',
      earType: 'short_floppy',
      earColor: '#b08968',
      innerEar: '#f5ebe0',
      cheekColor: '#fca5a5',
      eyeColor: '#5c3d2e',
      tailType: 'fluffy',
      mouthCream: true
    }
  ];

  const OUTFITS = [
    { id: 'sky_dress', name: 'Vestido Nube', icon: '👗', primary: '#7dd3fc', secondary: '#e0f2fe', ribbon: '#f472b6', style: 'dress' },
    { id: 'chef_apron', name: 'Chef Pastelera', icon: '👩‍🍳', primary: '#fda4af', secondary: '#ffffff', ribbon: '#e11d48', style: 'apron' },
    { id: 'star_pajama', name: 'Pijama Estelar', icon: '🌙', primary: '#c4b5fd', secondary: '#fef08a', ribbon: '#8b5cf6', style: 'pajama' },
    { id: 'ballet_tutu', name: 'Tutú Ballet', icon: '🩰', primary: '#f9a8d4', secondary: '#fdf2f8', ribbon: '#db2777', style: 'tutu' },
    { id: 'royal_cape', name: 'Capa Real', icon: '👑', primary: '#c084fc', secondary: '#fef08a', ribbon: '#9333ea', style: 'cape' },
    { id: 'denim_overalls', name: 'Jardinera Kawaii', icon: '👖', primary: '#60a5fa', secondary: '#fef08a', ribbon: '#2563eb', style: 'overalls' },
    { id: 'sakura_kimono', name: 'Kimono Sakura', icon: '👘', primary: '#fda4af', secondary: '#fef9c3', ribbon: '#be123c', style: 'kimono' }
  ];

  const HATS = [
    { id: 'none', name: 'Sin Gorro', icon: '✨' },
    { id: 'crown', name: 'Corona Real', icon: '👑' },
    { id: 'beret', name: 'Boina Pastel', icon: '🎨' },
    { id: 'bow', name: 'Lazo Seda', icon: '🎀' },
    { id: 'sakura', name: 'Corona Flores', icon: '🌸' },
    { id: 'sleep_cap', name: 'Gorrito Sueño', icon: '🌙' },
    { id: 'wizard', name: 'Mago Estelar', icon: '🎩' },
    { id: 'strawberry', name: 'Fresita Dulce', icon: '🍓' }
  ];

  const GLASSES = [
    { id: 'none', name: 'Sin Lentes', icon: '👀' },
    { id: 'hearts', name: 'Lentes Corazón', icon: '💗' },
    { id: 'stars', name: 'Lentes Estrella', icon: '⭐' },
    { id: 'round', name: 'Gafas Sabias', icon: '👓' },
    { id: 'sleep_mask', name: 'Antifaz Nube', icon: '😴' }
  ];

  const HAND_PROPS = [
    { id: 'wand', name: 'Varita Mágica', icon: '🪄' },
    { id: 'teacup', name: 'Tacita de Té', icon: '☕' },
    { id: 'teddy', name: 'Osito Peluche', icon: '🧸' },
    { id: 'roll', name: 'Rollito Canela', icon: '🍥' },
    { id: 'mic', name: 'Micrófono Pop', icon: '🎤' },
    { id: 'balloon', name: 'Globo Corazón', icon: '🎈' },
    { id: 'none', name: 'Manos Libres', icon: '🐾' }
  ];

  const EXPRESSIONS = [
    { id: 'happy', name: 'Feliz', icon: '😊' },
    { id: 'starry', name: 'Emocionada', icon: '🤩' },
    { id: 'yummy', name: 'Ñam Rico', icon: '😋' },
    { id: 'sleepy', name: 'Dormilona', icon: '😴' },
    { id: 'party', name: 'Fiesta', icon: '🥳' },
    { id: 'love', name: 'Ternura', icon: '🥰' }
  ];

  const CATALOG_DECOR = [
    { type: 'cake_stand', name: 'Pastel de Fresa', icon: '🎂', w: 68, h: 64, food: true },
    { type: 'plush_bunny', name: 'Conejito Peluche', icon: '🐰', w: 58, h: 64, toy: true },
    { type: 'plant_pot', name: 'Maceta Sakura', icon: '🪴', w: 64, h: 86, decor: true },
    { type: 'star_cushion', name: 'Cojín Estrella', icon: '⭐', w: 76, h: 48, seat: true },
    { type: 'tea_set', name: 'Tetera Mágica', icon: '🫖', w: 64, h: 58, food: true },
    { type: 'fairy_lamp', name: 'Lámpara Hadas', icon: '🏮', w: 54, h: 92, light: true },
    { type: 'gift_box', name: 'Caja Sorpresa', icon: '🎁', w: 62, h: 62, toy: true },
    { type: 'balloon_bunch', name: 'Globos Fiesta', icon: '🎈', w: 66, h: 115, decor: true }
  ];

  const ROOMS = [
    {
      id: 'cafe',
      name: '🧁 Cafetería & Cocina',
      wallTop: '#fff5f7',
      wallBottom: '#fce7f3',
      wainscot: '#fbcfe8',
      floorTop: '#fdebd0',
      floorStripe: '#f8dfc2',
      accent: '#ec4899'
    },
    {
      id: 'bedroom',
      name: '🛏️ Cuarto de Nubes',
      wallTop: '#f0f9ff',
      wallBottom: '#e0f2fe',
      wainscot: '#bae6fd',
      floorTop: '#f3e8ff',
      floorStripe: '#e9d5ff',
      accent: '#0284c7'
    },
    {
      id: 'garden',
      name: '🌸 Jardín & Fiesta',
      wallTop: '#e0f2fe',
      wallBottom: '#bae6fd',
      wainscot: '#86efac',
      floorTop: '#dcfce7',
      floorStripe: '#bbf7d0',
      accent: '#16a34a'
    }
  ];

  class AvatarWorldGame {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.ctx = null;
      this.running = false;
      this.rafId = null;
      this.lastTime = 0;
      this.time = 0;

      this.logicalW = 1000;
      this.logicalH = 560;
      this.floorY = 395;

      this.currentRoomIdx = 0;
      this.lightingMode = 'day'; // 'day' | 'sunset' | 'night'
      this.editMode = false;
      this.wardrobeOpen = false;
      this.wardrobeTargetSlot = 1;
      this.wardrobeTab = 'base'; // 'base' | 'outfit' | 'hat' | 'glasses' | 'prop' | 'expr'

      this.particles = [];
      this.floatingNotes = [];
      this.dragState = null;

      // Inicializar los 3 Avatares (P1, P2, P3)
      this.avatars = {
        1: this.createAvatar(1, 'cinna', 320, 445, 'P1 🌸', '#ec4899', 'sky_dress', 'crown', 'none', 'wand', 'happy', true),
        2: this.createAvatar(2, 'milk', 520, 455, 'P2 🩵', '#0284c7', 'star_pajama', 'bow', 'none', 'teddy', 'happy', true),
        3: this.createAvatar(3, 'mocha', 690, 448, 'P3 💛', '#eab308', 'ballet_tutu', 'sakura', 'hearts', 'teacup', 'starry', false)
      };
      this.players = this.avatars;

      this.roomObjects = {
        cafe: [
          { id: 'oven', type: 'oven', name: 'Horno Pastelero', x: 165, y: 382, w: 135, h: 130, state: false, progress: 0 },
          { id: 'counter', type: 'counter', name: 'Mostrador de Dulces', x: 380, y: 392, w: 190, h: 105, state: false },
          { id: 'tea_table', type: 'tea_table', name: 'Mesa de Té', x: 675, y: 438, w: 170, h: 86, seat: true, food: true },
          { id: 'jukebox_cafe', type: 'music_box', name: 'Radio Pastel', x: 865, y: 392, w: 86, h: 110, state: false }
        ],
        bedroom: [
          { id: 'cloud_bed', type: 'cloud_bed', name: 'Cama Nube', x: 235, y: 418, w: 230, h: 125, seat: true, sleep: true, state: false },
          { id: 'vanity', type: 'vanity', name: 'Tocador Mágico', x: 545, y: 392, w: 145, h: 145, wardrobe: true },
          { id: 'moon_lamp', type: 'moon_lamp', name: 'Lámpara de Luna', x: 745, y: 388, w: 78, h: 145, light: true, state: true },
          { id: 'plush_rug', type: 'rug', name: 'Alfombra Corazón', x: 530, y: 492, w: 240, h: 58, seat: true }
        ],
        garden: [
          { id: 'sakura_swing', type: 'swing', name: 'Columpio Sakura', x: 230, y: 398, w: 165, h: 185, seat: true, swingAngle: 0 },
          { id: 'fountain', type: 'fountain', name: 'Fuente de Deseos', x: 525, y: 420, w: 175, h: 125, state: true },
          { id: 'party_stage', type: 'stage', name: 'Escenario Fiesta', x: 805, y: 408, w: 200, h: 130, seat: true, state: false },
          { id: 'picnic_basket', type: 'cake_stand', name: 'Pastel de Fiesta', x: 485, y: 488, w: 72, h: 64, food: true }
        ]
      };

      this.loadSavedState();
    }

    createAvatar(slot, baseId, x, y, badge, badgeColor, outfitId, hatId, glassesId, propId, exprId, active) {
      return {
        slot,
        active,
        baseId,
        outfitId,
        hatId,
        glassesId,
        propId,
        exprId,
        badge,
        badgeColor,
        x,
        y,
        targetX: null,
        targetY: null,
        vx: 0,
        vy: 0,
        facing: slot === 2 ? -1 : 1,
        walkPhase: 0,
        earAngle: 0,
        earVel: 0,
        blinkTimer: 2 + Math.random() * 3,
        isBlinking: false,
        chewTimer: 0,
        sleeping: false,
        sittingOn: null,
        danceTimer: 0,
        emotionBubble: null,
        emotionTimer: 0,
        keys: { left: false, right: false, up: false, down: false }
      };
    }

    loadSavedState() {
      try {
        const raw = localStorage.getItem('cinna_avatar_world_v1');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed.avatars) {
          for (const s of [1, 2, 3]) {
            if (parsed.avatars[s] && this.avatars[s]) {
              Object.assign(this.avatars[s], {
                baseId: parsed.avatars[s].baseId || this.avatars[s].baseId,
                outfitId: parsed.avatars[s].outfitId || this.avatars[s].outfitId,
                hatId: parsed.avatars[s].hatId || this.avatars[s].hatId,
                glassesId: parsed.avatars[s].glassesId || this.avatars[s].glassesId,
                propId: parsed.avatars[s].propId || this.avatars[s].propId,
                exprId: parsed.avatars[s].exprId || this.avatars[s].exprId
              });
            }
          }
        }
      } catch (_) {}
    }

    saveState() {
      try {
        const summary = {
          avatars: {
            1: { baseId: this.avatars[1].baseId, outfitId: this.avatars[1].outfitId, hatId: this.avatars[1].hatId, glassesId: this.avatars[1].glassesId, propId: this.avatars[1].propId, exprId: this.avatars[1].exprId },
            2: { baseId: this.avatars[2].baseId, outfitId: this.avatars[2].outfitId, hatId: this.avatars[2].hatId, glassesId: this.avatars[2].glassesId, propId: this.avatars[2].propId, exprId: this.avatars[2].exprId },
            3: { baseId: this.avatars[3].baseId, outfitId: this.avatars[3].outfitId, hatId: this.avatars[3].hatId, glassesId: this.avatars[3].glassesId, propId: this.avatars[3].propId, exprId: this.avatars[3].exprId }
          }
        };
        localStorage.setItem('cinna_avatar_world_v1', JSON.stringify(summary));
      } catch (_) {}
    }

    init(containerEl) {
      this.stop();
      this.container = containerEl;
      this.renderLayout();
      this.running = true;
      this.lastTime = performance.now();
      const loop = (now) => {
        if (!this.running) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
        this.lastTime = now;
        this.update(dt);
        this.draw();
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
      this.broadcastContext();
    }

    stop() {
      this.running = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    get players() {
      return this.avatars;
    }
    set players(val) {
      this.avatars = val;
    }

    getRoomItems() {
      const roomKey = ROOMS[this.currentRoomIdx]?.id || 'cafe';
      return this.roomObjects[roomKey] || [];
    }

    openWardrobe(slot = 1) {
      this.wardrobeTargetSlot = slot;
      this.wardrobeOpen = true;
      this.updateWardrobeDOM();
    }

    closeWardrobe() {
      this.wardrobeOpen = false;
      this.updateWardrobeDOM();
    }

    syncPlayerBadgesUI() {
      const btnP3 = this.container?.querySelector('#btnAwToggleP3');
      if (btnP3 && this.avatars[3]) {
        btnP3.textContent = `👥 ${this.avatars[3].active ? '3 Amigos (P1-P3)' : '2 Amigos (+P3)'}`;
      }
    }

    broadcastContext() {
      if (window.Cinnamo?.controllerBridge?.broadcastGameContext) {
        window.Cinnamo.controllerBridge.broadcastGameContext({
          screen: 'avatar',
          room: ROOMS[this.currentRoomIdx].id,
          roomName: ROOMS[this.currentRoomIdx].name,
          lighting: this.lightingMode
        });
      }
    }

    renderLayout() {
      if (!this.container) return;
      this.container.innerHTML = `
        <div class="avatar-world-shell">
          <!-- Barra flotante superior de Habitaciones, Vestidor y Decoración -->
          <div class="aw-hud-top">
            <div class="aw-room-tabs">
              ${ROOMS.map((r, i) => `
                <button class="aw-room-btn ${i === this.currentRoomIdx ? 'active' : ''}" data-room="${i}">
                  ${r.name}
                </button>
              `).join('')}
            </div>

            <div class="aw-action-pills">
              <button class="aw-pill-btn aw-btn-wardrobe" id="btnAwOpenWardrobe">
                👗 Vestidor Kawaii
              </button>
              <button class="aw-pill-btn aw-btn-decor ${this.editMode ? 'active' : ''}" id="btnAwToggleDecor">
                🛋️ Decorar Casa
              </button>
              <button class="aw-pill-btn aw-btn-light" id="btnAwCycleLight" title="Cambiar Día / Atardecer / Noche">
                ☀️ Ambiente
              </button>
              <button class="aw-pill-btn aw-btn-players" id="btnAwToggleP3" title="Sumar o quitar amigos en pantalla">
                👥 ${this.avatars[3].active ? '3 Amigos (P1-P3)' : '2 Amigos (+P3)'}
              </button>
            </div>
          </div>

          <!-- Lienzo Continuo Vectorial de Alta Definición -->
          <div class="aw-canvas-stage" id="awCanvasStage">
            <canvas id="avatarWorldCanvas" width="1000" height="560"></canvas>

            <!-- Bandeja Inferior de Decoración y Comida (cuando Modo Decorar está activo) -->
            <div class="aw-decor-Catalog ${this.editMode ? '' : 'hidden'}" id="awDecorDrawer">
              <span class="aw-drawer-title">✨ Toca para agregar a la habitación (y arrastra cualquier mueble):</span>
              <div class="aw-decor-items">
                ${CATALOG_DECOR.map(item => `
                  <button class="aw-decor-chip" data-decor="${item.type}">
                    <span class="aw-decor-ico">${item.icon}</span>
                    <span class="aw-decor-lbl">${item.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Modal / Panel de Vestidor de Personajes (Estilo Avatar World) -->
            <div class="aw-wardrobe-modal ${this.wardrobeOpen ? '' : 'hidden'}" id="awWardrobeModal">
              <div class="aw-wardrobe-card">
                <div class="aw-wardrobe-header">
                  <div class="aw-wardrobe-player-tabs">
                    <button class="aw-p-tab ${this.wardrobeTargetSlot === 1 ? 'active' : ''}" data-pslot="1">P1 🌸</button>
                    <button class="aw-p-tab ${this.wardrobeTargetSlot === 2 ? 'active' : ''}" data-pslot="2">P2 🩵</button>
                    <button class="aw-p-tab ${this.wardrobeTargetSlot === 3 ? 'active' : ''}" data-pslot="3">P3 💛</button>
                  </div>
                  <h3>✨ Vestidor y Estilo de Personaje ✨</h3>
                  <button class="aw-wardrobe-close" id="btnAwCloseWardrobe">✔ Listo</button>
                </div>

                <div class="aw-wardrobe-cats">
                  <button class="aw-cat-btn ${this.wardrobeTab === 'base' ? 'active' : ''}" data-wcat="base">🐶 Amigo</button>
                  <button class="aw-cat-btn ${this.wardrobeTab === 'outfit' ? 'active' : ''}" data-wcat="outfit">👗 Ropa</button>
                  <button class="aw-cat-btn ${this.wardrobeTab === 'hat' ? 'active' : ''}" data-wcat="hat">👑 Gorros</button>
                  <button class="aw-cat-btn ${this.wardrobeTab === 'glasses' ? 'active' : ''}" data-wcat="glasses">🕶️ Lentes</button>
                  <button class="aw-cat-btn ${this.wardrobeTab === 'prop' ? 'active' : ''}" data-wcat="prop">🪄 Manito</button>
                  <button class="aw-cat-btn ${this.wardrobeTab === 'expr' ? 'active' : ''}" data-wcat="expr">😊 Carita</button>
                </div>

                <div class="aw-wardrobe-grid" id="awWardrobeGrid">
                  ${this.renderWardrobeOptionsHTML()}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      this.canvas = this.container.querySelector('#avatarWorldCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.bindDOMEvents();
    }

    renderWardrobeOptionsHTML() {
      const av = this.avatars[this.wardrobeTargetSlot] || this.avatars[1];
      if (this.wardrobeTab === 'base') {
        return CHARACTER_BASES.map(c => `
          <button class="aw-opt-card ${av.baseId === c.id ? 'active' : ''}" data-wtype="base" data-wval="${c.id}">
            <span class="aw-opt-swatch" style="background:${c.bodyColor}; border-color:${c.innerEar}">🐾</span>
            <span class="aw-opt-name">${c.name}</span>
          </button>
        `).join('');
      }
      if (this.wardrobeTab === 'outfit') {
        return OUTFITS.map(o => `
          <button class="aw-opt-card ${av.outfitId === o.id ? 'active' : ''}" data-wtype="outfit" data-wval="${o.id}">
            <span class="aw-opt-ico" style="background:${o.primary}22">${o.icon}</span>
            <span class="aw-opt-name">${o.name}</span>
          </button>
        `).join('');
      }
      if (this.wardrobeTab === 'hat') {
        return HATS.map(h => `
          <button class="aw-opt-card ${av.hatId === h.id ? 'active' : ''}" data-wtype="hat" data-wval="${h.id}">
            <span class="aw-opt-ico">${h.icon}</span>
            <span class="aw-opt-name">${h.name}</span>
          </button>
        `).join('');
      }
      if (this.wardrobeTab === 'glasses') {
        return GLASSES.map(g => `
          <button class="aw-opt-card ${av.glassesId === g.id ? 'active' : ''}" data-wtype="glasses" data-wval="${g.id}">
            <span class="aw-opt-ico">${g.icon}</span>
            <span class="aw-opt-name">${g.name}</span>
          </button>
        `).join('');
      }
      if (this.wardrobeTab === 'prop') {
        return HAND_PROPS.map(p => `
          <button class="aw-opt-card ${av.propId === p.id ? 'active' : ''}" data-wtype="prop" data-wval="${p.id}">
            <span class="aw-opt-ico">${p.icon}</span>
            <span class="aw-opt-name">${p.name}</span>
          </button>
        `).join('');
      }
      return EXPRESSIONS.map(e => `
        <button class="aw-opt-card ${av.exprId === e.id ? 'active' : ''}" data-wtype="expr" data-wval="${e.id}">
          <span class="aw-opt-ico">${e.icon}</span>
          <span class="aw-opt-name">${e.name}</span>
        </button>
      `).join('');
    }

    bindDOMEvents() {
      if (!this.container) return;

      // Cambiar habitación
      this.container.querySelectorAll('.aw-room-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectRoom(parseInt(btn.dataset.room, 10));
        });
      });

      // Abrir / cerrar vestidor
      const btnOpenW = this.container.querySelector('#btnAwOpenWardrobe');
      const btnCloseW = this.container.querySelector('#btnAwCloseWardrobe');
      if (btnOpenW) {
        btnOpenW.addEventListener('click', () => {
          if (A()) { A().unlock(); A().bubblePop(2); }
          this.wardrobeOpen = !this.wardrobeOpen;
          this.updateWardrobeDOM();
        });
      }
      if (btnCloseW) {
        btnCloseW.addEventListener('click', () => {
          if (A()) { A().unlock(); A().softBoing(); }
          this.wardrobeOpen = false;
          this.updateWardrobeDOM();
        });
      }

      // Alternar Modo Decorar
      const btnDecor = this.container.querySelector('#btnAwToggleDecor');
      if (btnDecor) {
        btnDecor.addEventListener('click', () => {
          if (A()) { A().unlock(); A().bubblePop(1); }
          this.editMode = !this.editMode;
          btnDecor.classList.toggle('active', this.editMode);
          const drawer = this.container.querySelector('#awDecorDrawer');
          if (drawer) drawer.classList.toggle('hidden', !this.editMode);
        });
      }

      // Alternar Iluminación Ambiental
      const btnLight = this.container.querySelector('#btnAwCycleLight');
      if (btnLight) {
        btnLight.addEventListener('click', () => {
          this.cycleLighting();
        });
      }

      // Sumar / quitar 3er amigo en pantalla
      const btnP3 = this.container.querySelector('#btnAwToggleP3');
      if (btnP3) {
        btnP3.addEventListener('click', () => {
          if (A()) { A().unlock(); A().celebrate(); }
          this.avatars[2].active = true;
          this.avatars[3].active = !this.avatars[3].active;
          btnP3.textContent = `👥 ${this.avatars[3].active ? '3 Amigos (P1-P3)' : '2 Amigos (+P3)'}`;
          this.spawnBurst(this.avatars[3].x, this.avatars[3].y - 50, '#fef08a', 16);
        });
      }

      // Agregar objeto del catálogo de decoración
      this.container.querySelectorAll('.aw-decor-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          this.spawnDecorItem(chip.dataset.decor);
        });
      });

      this.bindWardrobeInnerEvents();
      this.bindCanvasPointerEvents();
    }

    bindWardrobeInnerEvents() {
      if (!this.container) return;
      const modal = this.container.querySelector('#awWardrobeModal');
      if (!modal) return;

      modal.querySelectorAll('.aw-p-tab').forEach(btn => {
        btn.onclick = () => {
          if (A()) { A().unlock(); A().bubblePop(1); }
          this.wardrobeTargetSlot = parseInt(btn.dataset.pslot, 10);
          this.avatars[this.wardrobeTargetSlot].active = true;
          this.updateWardrobeDOM();
        };
      });

      modal.querySelectorAll('.aw-cat-btn').forEach(btn => {
        btn.onclick = () => {
          if (A()) { A().unlock(); A().bubblePop(1); }
          this.wardrobeTab = btn.dataset.wcat;
          this.updateWardrobeDOM();
        };
      });

      modal.querySelectorAll('.aw-opt-card').forEach(card => {
        card.onclick = () => {
          const type = card.dataset.wtype;
          const val = card.dataset.wval;
          this.applyCustomization(this.wardrobeTargetSlot, type, val);
          this.updateWardrobeDOM();
        };
      });
    }

    updateWardrobeDOM() {
      if (!this.container) return;
      const modal = this.container.querySelector('#awWardrobeModal');
      if (!modal) return;
      modal.classList.toggle('hidden', !this.wardrobeOpen);
      modal.querySelectorAll('.aw-p-tab').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.pslot, 10) === this.wardrobeTargetSlot);
      });
      modal.querySelectorAll('.aw-cat-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.wcat === this.wardrobeTab);
      });
      const grid = modal.querySelector('#awWardrobeGrid');
      if (grid) grid.innerHTML = this.renderWardrobeOptionsHTML();
      this.bindWardrobeInnerEvents();
    }

    applyCustomization(slot, category, value) {
      const av = this.avatars[slot] || this.avatars[1];
      av.active = true;
      if (A()) { A().unlock(); A().sparkleChime(); }
      if (category === 'base') av.baseId = value;
      else if (category === 'outfit') av.outfitId = value;
      else if (category === 'hat') av.hatId = value;
      else if (category === 'glasses') av.glassesId = value;
      else if (category === 'prop') av.propId = value;
      else if (category === 'expr') {
        av.exprId = value;
        const found = EXPRESSIONS.find(e => e.id === value);
        if (found) this.showEmotionBubble(av, found.icon);
      }
      this.spawnBurst(av.x, av.y - 60, '#f472b6', 14);
      this.saveState();
      this.rewardOnce('dress', 1);
    }

    // Juego libre: las estrellas se dan una vez por tipo de acción en la sesión (no se pueden acumular sin fin)
    rewardOnce(key, amount) {
      this.rewarded = this.rewarded || new Set();
      if (this.rewarded.has(key)) return;
      this.rewarded.add(key);
      window.Cinnamo?.passport?.addStars?.(amount, 'avatar');
    }

    cycleCustomForPlayer(slot, category) {
      const av = this.avatars[slot] || this.avatars[1];
      av.active = true;
      const lists = {
        base: CHARACTER_BASES,
        outfit: OUTFITS,
        hat: HATS,
        glasses: GLASSES,
        prop: HAND_PROPS,
        expr: EXPRESSIONS
      };
      const propMap = {
        base: 'baseId',
        outfit: 'outfitId',
        hat: 'hatId',
        glasses: 'glassesId',
        prop: 'propId',
        expr: 'exprId'
      };
      const list = lists[category];
      const key = propMap[category];
      if (!list || !key) return;
      const idx = list.findIndex(item => item.id === av[key]);
      const next = list[(idx + 1) % list.length];
      this.applyCustomization(slot, category, next.id);
    }

    selectRoom(roomIdx) {
      const idx = Math.max(0, Math.min(ROOMS.length - 1, parseInt(roomIdx, 10) || 0));
      if (A()) { A().unlock(); A().bubblePop(2); }
      this.currentRoomIdx = idx;
      for (const s of [1, 2, 3]) {
        this.avatars[s].sittingOn = null;
        this.avatars[s].sleeping = false;
      }
      if (this.container) {
        this.container.querySelectorAll('.aw-room-btn').forEach((b, i) => {
          b.classList.toggle('active', i === idx);
        });
      }
      this.broadcastContext();
    }

    cycleLighting() {
      if (A()) { A().unlock(); A().sparkleChime(); }
      const order = ['day', 'sunset', 'night'];
      this.lightingMode = order[(order.indexOf(this.lightingMode) + 1) % order.length];
      const btnLight = this.container?.querySelector('#btnAwCycleLight');
      if (btnLight) {
        const icons = { day: '☀️ Día', sunset: '🌅 Atardecer', night: '🌙 Noche' };
        btnLight.textContent = icons[this.lightingMode];
      }
      this.broadcastContext();
    }

    spawnDecorItem(decorType) {
      const template = CATALOG_DECOR.find(d => d.type === decorType) || CATALOG_DECOR[0];
      const roomKey = ROOMS[this.currentRoomIdx].id;
      const list = this.roomObjects[roomKey];
      const x = 220 + Math.random() * 560;
      const y = 415 + Math.random() * 95;
      const newObj = {
        id: `decor_${Date.now()}_${Math.floor(Math.random() * 999)}`,
        type: template.type,
        name: template.name,
        icon: template.icon,
        x,
        y,
        w: template.w,
        h: template.h,
        food: !!template.food,
        toy: !!template.toy,
        seat: !!template.seat,
        light: !!template.light,
        custom: true,
        state: true
      };
      // Máximo 14 objetos agregados por cuarto: el más antiguo se va para que el juego no se ponga lento
      const customs = list.filter(o => o.custom);
      if (customs.length >= 14) list.splice(list.indexOf(customs[0]), 1);
      list.push(newObj);
      if (A()) { A().unlock(); A().celebrate(); }
      this.spawnBurst(x, y - 20, '#38bdf8', 16);
      this.rewardOnce('decor', 2);
    }

    bindCanvasPointerEvents() {
      if (!this.canvas) return;

      const toLogical = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        return {
          x: ((e.clientX - rect.left) / rect.width) * this.logicalW,
          y: ((e.clientY - rect.top) / rect.height) * this.logicalH
        };
      };

      this.canvas.onpointerdown = (e) => {
        e.preventDefault();
        try { this.canvas.setPointerCapture(e.pointerId); } catch (_) {}
        if (A()) A().unlock();
        const pt = toLogical(e);

        // 1. Verificar si tocó a un Avatar (P1, P2, P3) para arrastrarlo o expresarse
        const activeAvs = Object.values(this.avatars).filter(a => a.active).sort((a, b) => b.y - a.y);
        for (const av of activeAvs) {
          if (Math.abs(pt.x - av.x) < 48 && pt.y >= av.y - 135 && pt.y <= av.y + 15) {
            av.sittingOn = null;
            av.sleeping = false;
            av.targetX = null;
            av.targetY = null;
            this.dragState = {
              kind: 'avatar',
              target: av,
              pointerId: e.pointerId,
              offsetX: av.x - pt.x,
              offsetY: av.y - pt.y,
              moved: false
            };
            if (A()) A().bubblePop(1);
            return;
          }
        }

        // 2. Verificar si tocó un Mueble u Objeto Interactivo
        const roomKey = ROOMS[this.currentRoomIdx].id;
        const objs = [...this.roomObjects[roomKey]].sort((a, b) => b.y - a.y);
        for (const obj of objs) {
          if (Math.abs(pt.x - obj.x) < obj.w / 2 + 12 && pt.y >= obj.y - obj.h && pt.y <= obj.y + 18) {
            this.dragState = {
              kind: 'object',
              target: obj,
              pointerId: e.pointerId,
              offsetX: obj.x - pt.x,
              offsetY: obj.y - pt.y,
              startX: pt.x,
              startY: pt.y,
              moved: false
            };
            return;
          }
        }

        // 3. Si tocó el piso o escenario, caminar P1 suavemente hacia ese punto
        const p1 = this.avatars[1];
        p1.sittingOn = null;
        p1.sleeping = false;
        p1.targetX = Math.max(85, Math.min(this.logicalW - 85, pt.x));
        p1.targetY = Math.max(this.floorY - 5, Math.min(this.logicalH - 28, pt.y));
        this.spawnBurst(pt.x, pt.y, '#bae6fd', 6);
      };

      this.canvas.onpointermove = (e) => {
        if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;
        e.preventDefault();
        const pt = toLogical(e);
        const ds = this.dragState;

        if (ds.kind === 'avatar') {
          ds.moved = true;
          ds.target.x = Math.max(70, Math.min(this.logicalW - 70, pt.x + ds.offsetX));
          ds.target.y = Math.max(this.floorY - 30, Math.min(this.logicalH - 24, pt.y + ds.offsetY));
        } else if (ds.kind === 'object') {
          if (Math.hypot(pt.x - ds.startX, pt.y - ds.startY) > 8) {
            ds.moved = true;
          }
          if (ds.moved && (this.editMode || ds.target.custom || ds.target.food || ds.target.toy)) {
            ds.target.x = Math.max(70, Math.min(this.logicalW - 70, pt.x + ds.offsetX));
            ds.target.y = Math.max(260, Math.min(this.logicalH - 22, pt.y + ds.offsetY));
          }
        }
      };

      const onPointerEnd = (e) => {
        if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;
        try { this.canvas.releasePointerCapture(e.pointerId); } catch (_) {}
        const ds = this.dragState;
        this.dragState = null;

        if (ds.kind === 'avatar') {
          this.checkAvatarDropInteraction(ds.target);
        } else if (ds.kind === 'object') {
          if (!ds.moved) {
            this.triggerObjectInteraction(ds.target, this.avatars[1]);
          } else if (ds.target.food) {
            // Si arrastró una comida cerca de un personaje, ¡darle de comer!
            for (const s of [1, 2, 3]) {
              const av = this.avatars[s];
              if (av.active && Math.hypot(av.x - ds.target.x, (av.y - 50) - (ds.target.y - 25)) < 85) {
                this.feedAvatar(av, ds.target);
                break;
              }
            }
          }
        }
      };

      this.canvas.onpointerup = onPointerEnd;
      this.canvas.onpointercancel = onPointerEnd;
    }

    checkAvatarDropInteraction(av) {
      const roomKey = ROOMS[this.currentRoomIdx].id;
      const objs = this.roomObjects[roomKey];
      for (const obj of objs) {
        if (Math.hypot(av.x - obj.x, av.y - obj.y) < 88) {
          if (obj.sleep) {
            av.sittingOn = obj;
            av.sleeping = true;
            av.x = obj.x;
            av.y = obj.y - 12;
            av.exprId = 'sleepy';
            this.showEmotionBubble(av, '💤');
            if (A()) A().softBoing();
            return;
          }
          if (obj.seat) {
            av.sittingOn = obj;
            av.sleeping = false;
            av.x = obj.x;
            av.y = obj.y - 8;
            this.showEmotionBubble(av, '🎵');
            if (A()) A().bubblePop(2);
            return;
          }
          if (obj.food) {
            this.feedAvatar(av, obj);
            return;
          }
        }
      }
    }

    feedAvatar(av, foodObj) {
      av.chewTimer = 2.6;
      av.exprId = 'yummy';
      av.sleeping = false;
      this.showEmotionBubble(av, '😋');
      if (A()) A().celebrate();
      this.spawnBurst(av.x, av.y - 65, '#fda4af', 18);
      this.rewardOnce('feed', 2);
    }

    triggerObjectInteraction(obj, av) {
      if (!obj) return;
      if (A()) A().unlock();

      if (obj.wardrobe) {
        this.wardrobeTargetSlot = av?.slot || 1;
        this.wardrobeOpen = true;
        this.updateWardrobeDOM();
        if (A()) A().sparkleChime();
        return;
      }

      if (obj.light) {
        this.cycleLighting();
        obj.state = !obj.state;
        return;
      }

      if (obj.food && av) {
        this.feedAvatar(av, obj);
        return;
      }

      if (obj.sleep && av) {
        av.sittingOn = obj;
        av.sleeping = !av.sleeping;
        av.x = obj.x;
        av.y = obj.y - 12;
        av.exprId = av.sleeping ? 'sleepy' : 'happy';
        this.showEmotionBubble(av, av.sleeping ? '💤' : '☀️');
        if (A()) A().softBoing();
        return;
      }

      if (obj.seat && av) {
        av.sittingOn = obj;
        av.sleeping = false;
        av.x = obj.x;
        av.y = obj.y - 10;
        if (obj.type === 'stage') {
          av.danceTimer = 4.0;
          av.exprId = 'party';
          this.showEmotionBubble(av, '🎤');
        } else {
          this.showEmotionBubble(av, '💖');
        }
        if (A()) A().celebrate();
        this.spawnBurst(obj.x, obj.y - 50, '#fef08a', 15);
        return;
      }

      // Alternar estado general (horno, cafetera, radio, fuente)
      obj.state = !obj.state;
      if (obj.type === 'oven' && obj.state) {
        // Hornear un rollito recién salido del horno
        this.spawnDecorItem('cake_stand');
      } else if (obj.type === 'music_box') {
        for (const s of [1, 2, 3]) {
          if (this.avatars[s].active) {
            this.avatars[s].danceTimer = obj.state ? 6.0 : 0;
            this.avatars[s].exprId = 'party';
          }
        }
        if (A()) A().celebrate();
      } else {
        if (A()) A().bubblePop(2);
      }
      this.spawnBurst(obj.x, obj.y - 45, '#7dd3fc', 14);
    }

    interactNearestForPlayer(slot = 1) {
      const av = this.avatars[slot] || this.avatars[1];
      av.active = true;
      const roomKey = ROOMS[this.currentRoomIdx].id;
      const objs = this.roomObjects[roomKey];
      let best = null;
      let bestDist = 175;
      for (const obj of objs) {
        const d = Math.hypot(av.x - obj.x, av.y - obj.y);
        if (d < bestDist) {
          bestDist = d;
          best = obj;
        }
      }
      if (best) {
        this.triggerObjectInteraction(best, av);
      } else {
        // Si no hay mueble cerca, hacer un baile alegre con chispas
        av.danceTimer = 2.5;
        this.showEmotionBubble(av, '✨');
        if (A()) { A().unlock(); A().celebrate(); }
        this.spawnBurst(av.x, av.y - 60, av.badgeColor, 14);
      }
    }

    setPlayerJoystick(slot, x, y) {
      const av = this.avatars[slot];
      if (!av) return;
      av.active = true;
      av.vx = Math.abs(x) > 0.18 ? x * 230 : 0;
      av.vy = Math.abs(y) > 0.18 ? y * 155 : 0;
      if (av.vx !== 0 || av.vy !== 0) {
        av.targetX = null;
        av.targetY = null;
        av.sittingOn = null;
        av.sleeping = false;
        if (av.vx > 15) av.facing = 1;
        else if (av.vx < -15) av.facing = -1;
      }
    }

    setPlayerInput(slot, btn, pressed) {
      const av = this.avatars[slot];
      if (!av) return;
      av.active = true;
      if (btn === 'left' || btn === 'right' || btn === 'up' || btn === 'down') {
        av.keys[btn] = pressed;
        const dx = (av.keys.right ? 1 : 0) - (av.keys.left ? 1 : 0);
        const dy = (av.keys.down ? 1 : 0) - (av.keys.up ? 1 : 0);
        this.setPlayerJoystick(slot, dx, dy);
      } else if ((btn === 'jump' || btn === 'treat') && pressed) {
        this.interactNearestForPlayer(slot);
      }
    }

    showEmotionBubble(av, emoji) {
      av.emotionBubble = emoji;
      av.emotionTimer = 2.4;
    }

    spawnBurst(x, y, color, count = 12) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const speed = 40 + Math.random() * 90;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 30,
          r: 4 + Math.random() * 5,
          color,
          life: 0.7 + Math.random() * 0.4,
          maxLife: 1.0
        });
      }
    }

    update(dt) {
      this.time += dt;

      // Actualizar objetos animados de la habitación
      const roomKey = ROOMS[this.currentRoomIdx].id;
      for (const obj of this.roomObjects[roomKey]) {
        if (obj.type === 'swing') {
          const hasRider = Object.values(this.avatars).some(a => a.active && a.sittingOn === obj);
          obj.swingAngle = Math.sin(this.time * 3.2) * (hasRider ? 0.22 : 0.05);
        }
        if (obj.type === 'music_box' && obj.state && Math.random() < dt * 3.5) {
          this.floatingNotes.push({
            x: obj.x + (Math.random() - 0.5) * 30,
            y: obj.y - 70,
            vy: -45 - Math.random() * 20,
            life: 1.5,
            icon: Math.random() < 0.5 ? '🎵' : '🎶'
          });
        }
      }

      // Actualizar Avatares (P1, P2, P3)
      for (const s of [1, 2, 3]) {
        const av = this.avatars[s];
        if (!av.active) continue;

        // Movimiento hacia punto tocado (Tap-to-walk)
        if (av.targetX !== null && av.targetY !== null) {
          const dx = av.targetX - av.x;
          const dy = av.targetY - av.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 8) {
            av.targetX = null;
            av.targetY = null;
            av.vx = 0;
            av.vy = 0;
            this.checkAvatarDropInteraction(av);
          } else {
            av.vx = (dx / dist) * 210;
            av.vy = (dy / dist) * 145;
            av.facing = av.vx >= 0 ? 1 : -1;
          }
        }

        if (!av.sittingOn) {
          av.x = Math.max(75, Math.min(this.logicalW - 75, av.x + av.vx * dt));
          av.y = Math.max(this.floorY - 12, Math.min(this.logicalH - 24, av.y + av.vy * dt));
        } else if (av.sittingOn.type === 'swing') {
          av.x = av.sittingOn.x + Math.sin(av.sittingOn.swingAngle) * 26;
          av.y = av.sittingOn.y - 14;
        }

        const speed = Math.hypot(av.vx, av.vy);
        if (speed > 10 || av.danceTimer > 0) {
          av.walkPhase += dt * (av.danceTimer > 0 ? 12 : 9.5);
          const targetEar = Math.sin(av.walkPhase) * 0.28;
          av.earVel += (targetEar - av.earAngle) * 18 * dt;
          av.earVel *= 0.85;
          av.earAngle += av.earVel;
        } else {
          av.walkPhase += dt * 2.2;
          av.earAngle = Math.sin(this.time * 2.1 + av.slot) * 0.06;
        }

        // Parpadeo natural orgánico
        av.blinkTimer -= dt;
        if (av.blinkTimer <= 0) {
          av.isBlinking = !av.isBlinking;
          av.blinkTimer = av.isBlinking ? 0.14 : (2.4 + Math.random() * 3.2);
        }

        if (av.chewTimer > 0) {
          av.chewTimer = Math.max(0, av.chewTimer - dt);
          if (av.chewTimer === 0 && av.exprId === 'yummy') av.exprId = 'happy';
        }
        if (av.danceTimer > 0) {
          av.danceTimer = Math.max(0, av.danceTimer - dt);
        }
        if (av.emotionTimer > 0) {
          av.emotionTimer = Math.max(0, av.emotionTimer - dt);
          if (av.emotionTimer === 0) av.emotionBubble = null;
        }
      }

      // Partículas suaves
      this.particles.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 120 * dt;
        p.life -= dt;
      });
      this.particles = this.particles.filter(p => p.life > 0);

      this.floatingNotes.forEach(n => {
        n.y += n.vy * dt;
        n.x += Math.sin(this.time * 4 + n.y * 0.05) * 18 * dt;
        n.life -= dt;
      });
      this.floatingNotes = this.floatingNotes.filter(n => n.life > 0);
    }

    /* ============================================================
       MOTOR DE ILUSTRACIÓN VECTORIAL CONTINUA (ESTILO AVATAR WORLD)
       ============================================================ */
    draw() {
      const ctx = this.ctx;
      if (!ctx) return;
      const W = this.logicalW;
      const H = this.logicalH;
      const room = ROOMS[this.currentRoomIdx];

      ctx.save();
      ctx.clearRect(0, 0, W, H);

      // 1. Dibujar Fondo Arquitectónico Suave de la Habitación
      this.drawRoomBackdrop(ctx, room, W, H);

      // 2. Ordenar todos los elementos (Muebles + Avatares) por profundidad Y (Y-Sorting continuo)
      const renderList = [];
      const roomObjs = this.roomObjects[room.id] || [];
      for (const obj of roomObjs) {
        renderList.push({ sortY: obj.y, kind: 'object', item: obj });
      }
      for (const s of [1, 2, 3]) {
        const av = this.avatars[s];
        if (av && av.active) {
          renderList.push({ sortY: av.y + (av.sittingOn ? 6 : 0), kind: 'avatar', item: av });
        }
      }
      renderList.sort((a, b) => a.sortY - b.sortY);

      for (const entry of renderList) {
        if (entry.kind === 'object') {
          this.drawInteractiveObject(ctx, entry.item);
        } else {
          this.drawVectorAvatar(ctx, entry.item);
        }
      }

      // 3. Notas musicales y partículas mágicas
      for (const n of this.floatingNotes) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, n.life));
        ctx.font = '24px sans-serif';
        ctx.fillText(n.icon, n.x, n.y);
        ctx.restore();
      }
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Filtro de Iluminación Ambiental Continua (integra personajes y fondo en la misma atmósfera)
      this.drawAmbientLightingOverlay(ctx, W, H);

      ctx.restore();
    }

    drawRoomBackdrop(ctx, room, W, H) {
      // Pared con gradiente suave
      const wallGrad = ctx.createLinearGradient(0, 0, 0, this.floorY);
      wallGrad.addColorStop(0, room.wallTop);
      wallGrad.addColorStop(1, room.wallBottom);
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, W, this.floorY);

      // Zócalo / Wainscoting pastel
      ctx.fillStyle = room.wainscot;
      ctx.fillRect(0, this.floorY - 58, W, 58);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, this.floorY - 58);
      ctx.lineTo(W, this.floorY - 58);
      ctx.stroke();

      // Piso cálido con tablones / césped suave en perspectiva
      const floorGrad = ctx.createLinearGradient(0, this.floorY, 0, H);
      floorGrad.addColorStop(0, room.floorTop);
      floorGrad.addColorStop(1, room.floorStripe);
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, this.floorY, W, H - this.floorY);

      // Líneas suaves de piso para dar profundidad espacial
      ctx.strokeStyle = 'rgba(92, 61, 46, 0.07)';
      ctx.lineWidth = 2;
      for (let i = 1; i <= 4; i++) {
        const py = this.floorY + i * 38;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(W, py);
        ctx.stroke();
      }

      // Ventana Panorámica Arqueada con Cielo en Vivo (Día / Atardecer / Noche)
      const winX = 490;
      const winY = 175;
      const winW = 210;
      const winH = 165;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(winX - winW / 2, winY - winH / 2, winW, winH, [80, 80, 18, 18]);
      const skyMap = {
        day: ['#bae6fd', '#e0f2fe'],
        sunset: ['#fda4af', '#fef08a'],
        night: ['#1e1b4b', '#312e81']
      };
      const pair = skyMap[this.lightingMode] || skyMap.day;
      const skyG = ctx.createLinearGradient(0, winY - winH / 2, 0, winY + winH / 2);
      skyG.addColorStop(0, pair[0]);
      skyG.addColorStop(1, pair[1]);
      ctx.fillStyle = skyG;
      ctx.fill();
      ctx.clip();

      // Sol o Luna dentro de la ventana
      ctx.fillStyle = this.lightingMode === 'night' ? '#fef08a' : (this.lightingMode === 'sunset' ? '#fb7185' : '#fde047');
      ctx.beginPath();
      ctx.arc(winX + 45, winY - 32, 24, 0, Math.PI * 2);
      ctx.fill();

      // Nubes suaves pasando por la ventana
      const cloudOffset = (this.time * 14) % 240;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(winX - 90 + cloudOffset, winY + 25, 22, 0, Math.PI * 2);
      ctx.arc(winX - 68 + cloudOffset, winY + 20, 28, 0, Math.PI * 2);
      ctx.arc(winX - 45 + cloudOffset, winY + 26, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Marco de madera crema de la ventana
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(winX - winW / 2, winY - winH / 2, winW, winH, [80, 80, 18, 18]);
      ctx.stroke();
      ctx.strokeStyle = '#5c3d2e';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // Guirnalda de banderines pastel en el techo
      ctx.save();
      const colors = ['#f9a8d4', '#93c5fd', '#fde047', '#c4b5fd', '#86efac'];
      for (let i = 0; i < 12; i++) {
        const bx = 70 + i * 76;
        const by = 48 + Math.sin(i * 0.7) * 8;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(bx - 18, by);
        ctx.lineTo(bx + 18, by);
        ctx.lineTo(bx, by + 26);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#5c3d2e';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
      ctx.restore();
    }

    drawInteractiveObject(ctx, obj) {
      ctx.save();
      const x = obj.x;
      const y = obj.y;

      // Sombra de contacto suave en el piso (integra el mueble al suelo)
      ctx.fillStyle = 'rgba(92, 61, 46, 0.14)';
      ctx.beginPath();
      ctx.ellipse(x, y + 4, obj.w * 0.46, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 2.8;
      ctx.strokeStyle = '#5c3d2e';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      if (obj.type === 'oven') {
        // Horno Pastelero Kawaii
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.roundRect(x - 64, y - 122, 128, 122, 22);
        ctx.fill();
        ctx.stroke();

        // Ventana del horno (brilla cálida cuando está encendido)
        ctx.fillStyle = obj.state ? '#fde047' : '#fff1f2';
        ctx.beginPath();
        ctx.roundRect(x - 46, y - 82, 92, 58, 14);
        ctx.fill();
        ctx.stroke();

        // Rollito horneándose adentro
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obj.state ? '🥐' : '🍥', x, y - 44);
      } else if (obj.type === 'counter') {
        // Vitrina de Pastelería
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x - 90, y - 96, 180, 96, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f9a8d4';
        ctx.beginPath();
        ctx.roundRect(x - 94, y - 102, 188, 22, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🧁   🍰   🍩', x, y - 42);
      } else if (obj.type === 'tea_table') {
        // Mesa de Té Redonda Pastel
        ctx.fillStyle = '#e59866';
        ctx.fillRect(x - 8, y - 55, 16, 55);
        ctx.strokeRect(x - 8, y - 55, 16, 55);

        ctx.fillStyle = '#fff1f2';
        ctx.beginPath();
        ctx.ellipse(x, y - 58, 82, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🫖 🍓 ☕', x, y - 54);
      } else if (obj.type === 'cloud_bed') {
        // Cama Nube Acolchada
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x - 110, y - 110, 220, 70, 35);
        ctx.fill();
        ctx.stroke();

        // Colchón y edredón pastel
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.roundRect(x - 108, y - 68, 216, 68, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f9a8d4';
        ctx.beginPath();
        ctx.roundRect(x - 65, y - 64, 170, 62, 22);
        ctx.fill();
        ctx.stroke();

        // Almohada mullida
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.roundRect(x - 96, y - 78, 56, 36, 16);
        ctx.fill();
        ctx.stroke();
      } else if (obj.type === 'vanity') {
        // Tocador con Espejo de Vestidor
        ctx.fillStyle = '#f5d0fe';
        ctx.beginPath();
        ctx.ellipse(x, y - 92, 46, 52, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.ellipse(x, y - 92, 36, 42, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x - 62, y - 54, 124, 54, 14);
        ctx.fill();
        ctx.stroke();
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💄 👗 🎀', x, y - 22);
      } else if (obj.type === 'moon_lamp') {
        // Lámpara de Luna Mágica
        ctx.strokeStyle = '#5c3d2e';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 95);
        ctx.stroke();

        if (obj.state) {
          const glow = ctx.createRadialGradient(x, y - 110, 6, x, y - 110, 58);
          glow.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
          glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y - 110, 58, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(x, y - 110, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (obj.type === 'swing') {
        // Columpio Sakura con péndulo
        ctx.save();
        ctx.translate(x, y - 165);
        ctx.rotate(obj.swingAngle || 0);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-42, 0);
        ctx.lineTo(-42, 135);
        ctx.moveTo(42, 0);
        ctx.lineTo(42, 135);
        ctx.stroke();

        ctx.fillStyle = '#fdebd0';
        ctx.strokeStyle = '#5c3d2e';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.roundRect(-55, 130, 110, 18, 9);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (obj.type === 'fountain') {
        // Fuente de Agua Cristalina
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(x, y - 18, 82, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath();
        ctx.ellipse(x, y - 20, 70, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        const jetH = 38 + Math.sin(this.time * 6) * 8;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, y - 22);
        ctx.quadraticCurveTo(x - 18, y - 22 - jetH, x - 32, y - 18);
        ctx.moveTo(x, y - 22);
        ctx.quadraticCurveTo(x + 18, y - 22 - jetH, x + 32, y - 18);
        ctx.stroke();
      } else if (obj.type === 'stage') {
        // Escenario Musical Kawaii
        ctx.fillStyle = '#f5d0fe';
        ctx.beginPath();
        ctx.ellipse(x, y - 16, 95, 32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fdf4ff';
        ctx.beginPath();
        ctx.ellipse(x, y - 24, 82, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌟 🎤 🌟', x, y - 20);
      } else if (obj.type === 'rug') {
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.ellipse(x, y - 6, 110, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // Objeto del Catálogo o Radio
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x - 32, y - 58, 64, 56, 18);
        ctx.fill();
        ctx.stroke();
        ctx.font = '34px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obj.icon || '🎶', x, y - 18);
      }

      // Indicador sutil en Modo Decorar
      if (this.editMode) {
        ctx.strokeStyle = '#0284c7';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x - obj.w / 2, y - obj.h, obj.w, obj.h);
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    /* ============================================================
       RENDERIZADOR VECTORIAL DE AVATARES (11 CAPAS ARTICULADAS)
       ============================================================ */
    drawVectorAvatar(ctx, av) {
      const base = CHARACTER_BASES.find(b => b.id === av.baseId) || CHARACTER_BASES[0];
      const outfit = OUTFITS.find(o => o.id === av.outfitId) || OUTFITS[0];

      ctx.save();
      const speed = Math.hypot(av.vx, av.vy);
      const isMoving = speed > 10 || av.danceTimer > 0;
      const bobY = isMoving ? Math.abs(Math.sin(av.walkPhase)) * -9 : Math.sin(this.time * 2.2 + av.slot) * -2.5;
      const danceTilt = av.danceTimer > 0 ? Math.sin(av.walkPhase) * 0.14 : 0;

      // 1. Sombra de contacto suave en el suelo (escala con el salto/caminata)
      const shadowScale = 1 - Math.abs(bobY) * 0.018;
      ctx.fillStyle = 'rgba(92, 61, 46, 0.18)';
      ctx.beginPath();
      ctx.ellipse(av.x, av.y + 4, 38 * shadowScale, 12 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(av.x, av.y + bobY);
      ctx.rotate(danceTilt);

      // Etiqueta de Jugador (P1 🌸, P2 🩵, P3 💛)
      ctx.save();
      ctx.font = 'bold 13px "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.strokeStyle = av.badgeColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-28, -142, 56, 22, 11);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#5c3d2e';
      ctx.fillText(av.badge, 0, -126);
      ctx.restore();

      ctx.scale(av.facing, 1);
      ctx.strokeStyle = '#5c3d2e';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 2. Cola de rollito de canela o pompón trasero
      ctx.save();
      ctx.fillStyle = base.bodyColor;
      ctx.beginPath();
      ctx.arc(-24, -24, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (base.tailType === 'cinnamon_roll') {
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-24, -24, 5, 0, Math.PI * 1.5);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Patitas articuladas con ciclo de caminata
      const legSwing = isMoving ? Math.sin(av.walkPhase) * 7 : 0;
      ctx.fillStyle = base.bodyColor;
      ctx.beginPath();
      ctx.ellipse(-12 + legSwing, -8, 11, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(12 - legSwing, -8, 11, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 4. Torso + Vestido / Traje Personalizado
      ctx.fillStyle = outfit.primary;
      ctx.beginPath();
      ctx.moveTo(-22, -46);
      ctx.quadraticCurveTo(-30, -14, -26, -12);
      ctx.lineTo(26, -12);
      ctx.quadraticCurveTo(30, -14, 22, -46);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Detalle secundario del vestido (cuello / delantal / cinturón)
      ctx.fillStyle = outfit.secondary;
      ctx.beginPath();
      ctx.ellipse(0, -42, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Lazo central del traje
      ctx.fillStyle = outfit.ribbon;
      ctx.beginPath();
      ctx.arc(0, -34, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // 5. Orejas Físicas Articuladas (sello distintivo de Cinnamoroll & Amigos)
      this.drawArticulatedEars(ctx, base, av.earAngle);

      // 6. Cabeza Suave con Sombreado Radial Continuo
      const headGrad = ctx.createRadialGradient(-8, -76, 8, 0, -68, 42);
      headGrad.addColorStop(0, '#ffffff');
      headGrad.addColorStop(0.35, base.bodyColor);
      headGrad.addColorStop(1, base.shadowTint);
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(0, -68, 38, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rulito de leche de Milk
      if (base.topCurl) {
        ctx.fillStyle = base.bodyColor;
        ctx.beginPath();
        ctx.arc(2, -98, 8, 0, Math.PI * 1.8);
        ctx.fill();
        ctx.stroke();
      }

      // 7. Mejillas sonrojadas difuminadas
      ctx.save();
      ctx.fillStyle = base.cheekColor;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.ellipse(-21, -62, 8.5, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(21, -62, 8.5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 8. Expresión Facial en Vivo (Ojos + Boquita + Chupete)
      this.drawFacialExpression(ctx, base, av);

      // 9. Lentes / Accesorio Facial
      this.drawGlassesLayer(ctx, av.glassesId);

      // 10. Sombrero / Corona / Lazo
      this.drawHatLayer(ctx, av.hatId, base);

      // 11. Bracitos y Objeto Sostenido en la Mano
      this.drawArmsAndProp(ctx, base, av);

      ctx.restore();

      // Burbuja flotante de emoción (sin espejo horizontal)
      if (av.emotionBubble) {
        ctx.save();
        ctx.translate(av.x + 34, av.y - 125 + bobY);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#5c3d2e';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(av.emotionBubble, 0, 1);
        ctx.restore();
      }
    }

    drawArticulatedEars(ctx, base, earAngle) {
      ctx.save();
      ctx.fillStyle = base.earColor;
      ctx.strokeStyle = '#5c3d2e';
      ctx.lineWidth = 2.8;

      const len = base.earType === 'long_floppy' || base.earType === 'long_wavy' ? 46 : 30;
      const wid = base.earType === 'fluffy_cloud' ? 18 : 14;

      // Oreja izquierda
      ctx.save();
      ctx.translate(-30, -76);
      ctx.rotate(0.45 + earAngle);
      ctx.beginPath();
      ctx.ellipse(0, len * 0.55, wid, len * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = base.innerEar;
      ctx.beginPath();
      ctx.ellipse(0, len * 0.58, wid * 0.55, len * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Oreja derecha
      ctx.save();
      ctx.translate(30, -76);
      ctx.rotate(-0.45 - earAngle);
      ctx.fillStyle = base.earColor;
      ctx.beginPath();
      ctx.ellipse(0, len * 0.55, wid, len * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = base.innerEar;
      ctx.beginPath();
      ctx.ellipse(0, len * 0.58, wid * 0.55, len * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    drawFacialExpression(ctx, base, av) {
      ctx.save();
      const expr = av.sleeping ? 'sleepy' : av.exprId;

      // Ojos
      if (av.isBlinking || expr === 'sleepy' || expr === 'love') {
        ctx.strokeStyle = '#5c3d2e';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(-15, -69, 6, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(15, -69, 6, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      } else {
        ctx.fillStyle = base.eyeColor;
        ctx.beginPath();
        ctx.ellipse(-15, -69, 5.5, 7, 0, 0, Math.PI * 2);
        ctx.ellipse(15, -69, 5.5, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brillo estelar en los ojos (estilo Avatar World)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-16.5, -71.5, 2.3, 0, Math.PI * 2);
        ctx.arc(13.5, -71.5, 2.3, 0, Math.PI * 2);
        ctx.fill();
        if (expr === 'starry') {
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✦', -15, -66);
          ctx.fillText('✦', 15, -66);
        }
      }

      // Boquita o Chupete
      if (base.hasPacifier && av.chewTimer <= 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -59, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (av.chewTimer > 0 || expr === 'yummy') {
        const openH = 4 + Math.abs(Math.sin(this.time * 14)) * 4;
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.ellipse(0, -59, 6, openH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // Boquita kawaii en "w" suave
        ctx.strokeStyle = '#5c3d2e';
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.moveTo(-6, -61);
        ctx.quadraticCurveTo(-3, -57, 0, -61);
        ctx.quadraticCurveTo(3, -57, 6, -61);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawGlassesLayer(ctx, glassesId) {
      if (!glassesId || glassesId === 'none') return;
      ctx.save();
      ctx.lineWidth = 2.5;
      if (glassesId === 'hearts') {
        ctx.fillStyle = 'rgba(244, 114, 182, 0.55)';
        ctx.strokeStyle = '#db2777';
        ctx.beginPath();
        ctx.arc(-15, -69, 9, 0, Math.PI * 2);
        ctx.arc(15, -69, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (glassesId === 'stars') {
        ctx.font = '19px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⭐', -15, -63);
        ctx.fillText('⭐', 15, -63);
      } else if (glassesId === 'round') {
        ctx.strokeStyle = '#5c3d2e';
        ctx.beginPath();
        ctx.arc(-15, -69, 9, 0, Math.PI * 2);
        ctx.moveTo(-6, -69);
        ctx.lineTo(6, -69);
        ctx.arc(15, -69, 9, 0, Math.PI * 2);
        ctx.stroke();
      } else if (glassesId === 'sleep_mask') {
        ctx.fillStyle = '#c084fc';
        ctx.strokeStyle = '#5c3d2e';
        ctx.beginPath();
        ctx.roundRect(-26, -84, 52, 16, 8);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    drawHatLayer(ctx, hatId, base) {
      const effectiveHat = (hatId === 'none' && base.defaultBeret) ? 'beret' : hatId;
      if (!effectiveHat || effectiveHat === 'none') return;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '28px sans-serif';
      const map = {
        crown: '👑',
        beret: '🎨',
        bow: '🎀',
        sakura: '🌸',
        sleep_cap: '🌙',
        wizard: '🎩',
        strawberry: '🍓'
      };
      if (map[effectiveHat]) {
        ctx.fillText(map[effectiveHat], 0, -96);
      }
      ctx.restore();
    }

    drawArmsAndProp(ctx, base, av) {
      ctx.save();
      ctx.fillStyle = base.bodyColor;
      ctx.strokeStyle = '#5c3d2e';
      ctx.lineWidth = 2.6;

      // Bracito izquierdo
      ctx.beginPath();
      ctx.ellipse(-23, -34, 8, 6, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bracito derecho
      ctx.beginPath();
      ctx.ellipse(23, -34, 8, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Objeto en la mano derecha
      const prop = HAND_PROPS.find(p => p.id === av.propId);
      if (prop && prop.id !== 'none') {
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(prop.icon, 32, -32);
      }
      ctx.restore();
    }

    drawAmbientLightingOverlay(ctx, W, H) {
      if (this.lightingMode === 'day') return;
      ctx.save();
      if (this.lightingMode === 'sunset') {
        ctx.fillStyle = 'rgba(251, 113, 133, 0.11)';
        ctx.fillRect(0, 0, W, H);
      } else if (this.lightingMode === 'night') {
        ctx.fillStyle = 'rgba(30, 27, 75, 0.24)';
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    }
  }

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.avatarWorldGame = new AvatarWorldGame();
})();
