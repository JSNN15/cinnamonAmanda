/* ============================================================
   CINNAMOROLL WORLD: CASA DE SUEÑOS (avatar-world.js) · v35
   Juego libre estilo Toca Life pensado para niñas y niños de ~5 años en tablet:
   - Pocos controles: tocar el piso para caminar, tocar un objeto para usarlo,
     arrastrar amigos y cosas, flechas grandes a los lados para cambiar de cuarto.
   - Solo dos botones redondos: Ropa (vestidor) y Juguetes (baúl).
   - Tocar la ventana (o el sol en el jardín) cambia día / atardecer / noche.
   - Todo está dibujado con vectores en Canvas (sin emojis): personajes, ropa,
     gorros, objetos, comida y burbujas de emoción.
   - Hasta 3 jugadores a la vez con el celular como mando o mandos Bluetooth.
   ============================================================ */
(function () {
  const A = () => window.Cinnamo?.audio;
  const OUT = '#5c3d2e'; // contorno cálido de todo el juego
  const TAU = Math.PI * 2;

  const CHARACTER_BASES = [
    { id: 'cinna', name: 'Cinnamoroll', bodyColor: '#ffffff', shadowTint: '#e0f2fe', earType: 'long_floppy', earColor: '#ffffff', innerEar: '#ffd6e7', cheekColor: '#ff9ebb', eyeColor: '#38bdf8', tailType: 'cinnamon_roll' },
    { id: 'milk', name: 'Milk', bodyColor: '#fffdf9', shadowTint: '#e0f2fe', earType: 'short_floppy', earColor: '#fffdf9', innerEar: '#ffd6e7', cheekColor: '#ffb3c6', eyeColor: '#0284c7', tailType: 'curl', hasPacifier: true, topCurl: true },
    { id: 'mocha', name: 'Mocha', bodyColor: '#c69c72', shadowTint: '#9c734b', earType: 'long_wavy', earColor: '#b08359', innerEar: '#f5cba7', cheekColor: '#ff8da1', eyeColor: '#4a2c11', tailType: 'fluffy', earFlowers: true },
    { id: 'chiffon', name: 'Chiffon', bodyColor: '#fdebd0', shadowTint: '#f5cba7', earType: 'fluffy_cloud', earColor: '#e59866', innerEar: '#fadbd8', cheekColor: '#ff85a2', eyeColor: '#5c3d2e', tailType: 'fluffy_poof' },
    { id: 'purin', name: 'Pompompurin', bodyColor: '#fef08a', shadowTint: '#facc15', earType: 'round_droop', earColor: '#fef08a', innerEar: '#fde047', cheekColor: '#fca5a5', eyeColor: '#5c3d2e', tailType: 'fluffy', defaultBeret: true },
    { id: 'cappuccino', name: 'Cappuccino', bodyColor: '#e6ccb2', shadowTint: '#ddb892', earType: 'short_floppy', earColor: '#b08968', innerEar: '#f5ebe0', cheekColor: '#fca5a5', eyeColor: '#5c3d2e', tailType: 'fluffy', mouthCream: true }
  ];

  const OUTFITS = [
    { id: 'sky_dress', name: 'Vestido Nube', primary: '#7dd3fc', secondary: '#e0f2fe', ribbon: '#f472b6', style: 'dress' },
    { id: 'chef_apron', name: 'Chef Pastelera', primary: '#fda4af', secondary: '#ffffff', ribbon: '#e11d48', style: 'apron' },
    { id: 'star_pajama', name: 'Pijama Estelar', primary: '#c4b5fd', secondary: '#fef08a', ribbon: '#8b5cf6', style: 'pajama' },
    { id: 'ballet_tutu', name: 'Tutú Ballet', primary: '#f9a8d4', secondary: '#fdf2f8', ribbon: '#db2777', style: 'tutu' },
    { id: 'royal_cape', name: 'Capa Real', primary: '#c084fc', secondary: '#fef08a', ribbon: '#9333ea', style: 'cape' },
    { id: 'denim_overalls', name: 'Jardinera', primary: '#60a5fa', secondary: '#fef08a', ribbon: '#2563eb', style: 'overalls' },
    { id: 'sakura_kimono', name: 'Kimono Sakura', primary: '#fda4af', secondary: '#fef9c3', ribbon: '#be123c', style: 'kimono' },
    { id: 'rainbow_royal', name: 'Gala Arcoíris ⭐', primary: '#f472b6', secondary: '#fef08a', ribbon: '#38bdf8', style: 'rainbow_royal', rewardId: 'reward_rainbow_royal' }
  ];

  const HATS = [
    { id: 'none', name: 'Sin gorro' },
    { id: 'crown', name: 'Corona' },
    { id: 'beret', name: 'Boina' },
    { id: 'bow', name: 'Lazo' },
    { id: 'sakura', name: 'Flores' },
    { id: 'sleep_cap', name: 'Gorro de dormir' },
    { id: 'wizard', name: 'Sombrero mágico' },
    { id: 'strawberry', name: 'Frutilla' },
    { id: 'unicorn_horn', name: 'Unicornio ⭐', rewardId: 'reward_unicorn_horn' }
  ];

  const GLASSES = [
    { id: 'none', name: 'Sin lentes' },
    { id: 'hearts', name: 'Corazones' },
    { id: 'stars', name: 'Estrellas' },
    { id: 'round', name: 'Lentes redondos' },
    { id: 'sleep_mask', name: 'Antifaz' }
  ];

  const HAND_PROPS = [
    { id: 'wand', name: 'Varita' },
    { id: 'boba_tea', name: 'Boba Tea 🧋' },
    { id: 'shop_basket', name: 'Canasta 🧺' },
    { id: 'teacup', name: 'Tacita' },
    { id: 'teddy', name: 'Osito' },
    { id: 'roll', name: 'Rollito' },
    { id: 'mic', name: 'Micrófono' },
    { id: 'balloon', name: 'Globo' },
    { id: 'ice_cream_cone', name: 'Helado Triple ⭐', rewardId: 'reward_ice_cream_cone' },
    { id: 'none', name: 'Manos libres' }
  ];

  const EXPRESSIONS = [
    { id: 'happy', name: 'Feliz', bubble: 'heart' },
    { id: 'starry', name: 'Emocionada', bubble: 'star' },
    { id: 'yummy', name: 'Rico', bubble: 'yum' },
    { id: 'sleepy', name: 'Con sueño', bubble: 'zzz' },
    { id: 'party', name: 'Fiesta', bubble: 'note' },
    { id: 'love', name: 'Ternura', bubble: 'heart' }
  ];

  const CATALOG_DECOR = [
    { type: 'cake_stand', name: 'Pastel', w: 68, h: 64, food: true },
    { type: 'plush_bunny', name: 'Conejito', w: 58, h: 64, toy: true },
    { type: 'plant_pot', name: 'Maceta', w: 64, h: 86, decor: true },
    { type: 'star_cushion', name: 'Cojín', w: 76, h: 48, seat: true },
    { type: 'tea_set', name: 'Tetera', w: 64, h: 58, food: true },
    { type: 'fairy_lamp', name: 'Lámpara', w: 54, h: 92, light: true },
    { type: 'gift_box', name: 'Regalo', w: 62, h: 62, toy: true },
    { type: 'balloon_bunch', name: 'Globos', w: 66, h: 115, decor: true },
    { type: 'rainbow_cake', name: 'Pastel Arcoíris', w: 76, h: 74, food: true },
    { type: 'cloud_throne', name: 'Trono de Nubes ⭐', w: 92, h: 110, seat: true, rewardId: 'reward_cloud_throne' },
    { type: 'ice_cream_fountain', name: 'Copa Helada ⭐', w: 68, h: 78, food: true, rewardId: 'reward_ice_cream_fountain' }
  ];
  // Nombres cortos que manda el celular
  const DECOR_ALIASES = { cake: 'cake_stand', plush: 'plush_bunny', plant: 'plant_pot', gift: 'gift_box', lamp: 'fairy_lamp', throne: 'cloud_throne', icecream: 'ice_cream_fountain' };

  const ROOMS = [
    { id: 'cafe', name: 'Cafetería', icon: 'cupcake', wallTop: '#fff5f7', wallBottom: '#fce7f3', stripe: '#fde4ef', wainscot: '#fbcfe8', floorTop: '#fdebd0', floorStripe: '#f6d9b8', accent: '#ec4899' },
    { id: 'bedroom', name: 'Cuarto', icon: 'moon', wallTop: '#eef7ff', wallBottom: '#dff0ff', stripe: '#d3eaff', wainscot: '#bae6fd', floorTop: '#f3e8ff', floorStripe: '#e4d2fb', accent: '#0284c7' },
    { id: 'garden', name: 'Jardín', icon: 'flower', outdoor: true, wallTop: '#bfe6ff', wallBottom: '#e6f6ff', wainscot: '#ffffff', floorTop: '#c9f2d4', floorStripe: '#a7e6b9', accent: '#16a34a' },
    { id: 'beach', name: 'Playa', icon: 'sun', outdoor: true, beach: true, wallTop: '#7dd3fc', wallBottom: '#e0f2fe', wainscot: '#38bdf8', floorTop: '#fef08a', floorStripe: '#fde047', accent: '#0284c7' },
    { id: 'spa', name: 'Spa & Mascotas', icon: 'sparkle', wallTop: '#f0fdf4', wallBottom: '#dcfce7', stripe: '#bbf7d0', wainscot: '#86efac', floorTop: '#e0f2fe', floorStripe: '#bae6fd', accent: '#14b8a6' }
  ];

  const SLOT_COLORS = { 1: '#ec4899', 2: '#0ea5e9', 3: '#eab308' };

  // Qué parte del personaje muestra la miniatura de cada categoría del vestidor
  const WARDROBE_CATS = [
    { id: 'base', name: 'Amigo', list: CHARACTER_BASES, key: 'baseId', zoom: 'face' },
    { id: 'outfit', name: 'Ropa', list: OUTFITS, key: 'outfitId', zoom: 'body' },
    { id: 'hat', name: 'Gorro', list: HATS, key: 'hatId', zoom: 'face' },
    { id: 'glasses', name: 'Lentes', list: GLASSES, key: 'glassesId', zoom: 'face' },
    { id: 'prop', name: 'En la mano', list: HAND_PROPS, key: 'propId', zoom: 'body' },
    { id: 'expr', name: 'Carita', list: EXPRESSIONS, key: 'exprId', zoom: 'face' }
  ];

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
  };
  const fillStroke = (ctx, fill, lw = 2.6) => {
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.lineWidth = lw;
    ctx.strokeStyle = OUT;
    ctx.stroke();
  };
  const starPath = (ctx, x, y, r, inner = 0.45, points = 5) => {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / points;
      const rr = i % 2 ? r * inner : r;
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };
  const heartPath = (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.4, y + s * 0.1, x - s * 0.9, y - s * 1.1, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.9, y - s * 1.1, x + s * 1.4, y + s * 0.1, x, y + s * 0.9);
    ctx.closePath();
  };

  class AvatarWorldGame {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.ctx = null;
      this.running = false;
      this.rafId = null;
      this.lastTime = 0;
      this.time = 0;
      this.dpr = 1;

      this.logicalW = 1000;
      this.logicalH = 560;
      this.floorY = 395;

      this.currentRoomIdx = 0;
      this.mapOpen = false; // Mapa isométrico interactivo estilo Avatar World Pazu
      this.lightingMode = 'day'; // 'day' | 'sunset' | 'night'
      this.sheet = null; // null | 'closet' | 'toys'
      this.wardrobeTargetSlot = 1;
      this.wardrobeTab = 'outfit';
      this.transition = 0; // >0 mientras se cambia de cuarto (cortina de nubes)
      this.pingTimer = 2.5;

      this.particles = [];
      this.floatingNotes = [];
      this.dragState = null;

      this.avatars = {
        1: this.createAvatar(1, 'cinna', 320, 445, 'sky_dress', 'crown', 'none', 'wand', 'happy', true),
        2: this.createAvatar(2, 'milk', 520, 455, 'star_pajama', 'bow', 'none', 'teddy', 'happy', true),
        3: this.createAvatar(3, 'mocha', 690, 448, 'ballet_tutu', 'sakura', 'hearts', 'teacup', 'starry', false)
      };

      this.roomObjects = {
        cafe: [
          { id: 'oven', type: 'oven', name: 'Horno', x: 145, y: 382, w: 135, h: 130, state: false, fixed: true },
          { id: 'kitchen_mixer', type: 'mixer', name: 'Batidora de Recetas', x: 278, y: 390, w: 88, h: 98, state: false, fixed: true },
          { id: 'counter', type: 'counter', name: 'Vitrina', x: 445, y: 392, w: 190, h: 105, state: false, fixed: true },
          { id: 'tea_table', type: 'tea_table', name: 'Mesa de té', x: 700, y: 438, w: 170, h: 86, seat: true, food: true },
          { id: 'jukebox_cafe', type: 'music_box', name: 'Radio', x: 880, y: 392, w: 86, h: 110, state: false }
        ],
        bedroom: [
          { id: 'cloud_bed', type: 'cloud_bed', name: 'Cama nube', x: 235, y: 418, w: 230, h: 125, seat: true, sleep: true, state: false, fixed: true },
          { id: 'vanity', type: 'vanity', name: 'Tocador', x: 545, y: 392, w: 145, h: 145, wardrobe: true, fixed: true },
          { id: 'moon_lamp', type: 'moon_lamp', name: 'Lámpara de luna', x: 745, y: 388, w: 78, h: 145, light: true, state: true },
          { id: 'plush_rug', type: 'rug', name: 'Alfombra', x: 530, y: 492, w: 240, h: 58, seat: true, flat: true }
        ],
        garden: [
          { id: 'sakura_swing', type: 'swing', name: 'Columpio', x: 230, y: 398, w: 165, h: 185, seat: true, swingAngle: 0, fixed: true },
          { id: 'fountain', type: 'fountain', name: 'Fuente', x: 525, y: 420, w: 175, h: 125, state: true, fixed: true },
          { id: 'party_stage', type: 'stage', name: 'Escenario', x: 805, y: 408, w: 200, h: 130, seat: true, state: false, fixed: true },
          { id: 'picnic_basket', type: 'cake_stand', name: 'Pastel', x: 485, y: 488, w: 72, h: 64, food: true }
        ],
        beach: [
          { id: 'sand_castle', type: 'sand_castle', name: 'Castillo de Arena', x: 215, y: 452, w: 145, h: 105, toy: true, state: false, fixed: true },
          { id: 'ice_cream_cart', type: 'ice_cream_cart', name: 'Carrito de Helados', x: 495, y: 412, w: 175, h: 135, state: false, fixed: true },
          { id: 'beach_lounger', type: 'beach_lounger', name: 'Reposera de Playa', x: 785, y: 445, w: 180, h: 115, seat: true, sleep: true, state: false, fixed: true },
          { id: 'surf_board', type: 'surf_board', name: 'Tabla de Surf', x: 635, y: 492, w: 125, h: 50, seat: true, toy: true }
        ],
        spa: [
          { id: 'bubble_tub', type: 'bubble_tub', name: 'Tina de Burbujas', x: 245, y: 432, w: 210, h: 118, seat: true, state: true, fixed: true },
          { id: 'pet_house', type: 'pet_house', name: 'Casita de Mascotas', x: 530, y: 412, w: 155, h: 122, toy: true, state: true, fixed: true },
          { id: 'salon_mirror', type: 'vanity', name: 'Tocador de Spa', x: 795, y: 392, w: 145, h: 145, wardrobe: true, fixed: true },
          { id: 'aroma_lamp', type: 'fairy_lamp', name: 'Aroma Relajante', x: 660, y: 410, w: 54, h: 92, light: true, state: true }
        ]
      };

      this.loadSavedState();
    }

    get players() { return this.avatars; }
    set players(val) { this.avatars = val; }

    createAvatar(slot, baseId, x, y, outfitId, hatId, glassesId, propId, exprId, active) {
      return {
        slot, active, baseId, outfitId, hatId, glassesId, propId, exprId,
        x, y, targetX: null, targetY: null, pendingObj: null, vx: 0, vy: 0,
        facing: slot === 2 ? -1 : 1,
        walkPhase: 0, earAngle: 0, earVel: 0,
        blinkTimer: 2 + Math.random() * 3, isBlinking: false,
        chewTimer: 0, sleeping: false, sittingOn: null, danceTimer: 0,
        emotionBubble: null, emotionTimer: 0, hop: 0,
        keys: { left: false, right: false, up: false, down: false }
      };
    }

    /* ---------- Guardado: ropa de cada amigo y la decoración de cada cuarto ---------- */
    loadSavedState() {
      try {
        const raw = localStorage.getItem('cinna_avatar_world_v1');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        for (const s of [1, 2, 3]) {
          const saved = parsed.avatars?.[s];
          if (!saved) continue;
          for (const cat of WARDROBE_CATS) {
            if (saved[cat.key] && cat.list.some(o => o.id === saved[cat.key])) this.avatars[s][cat.key] = saved[cat.key];
          }
        }
        if (parsed.decor) {
          for (const room of ROOMS) {
            for (const d of (parsed.decor[room.id] || []).slice(0, 14)) {
              const tpl = CATALOG_DECOR.find(c => c.type === d.type);
              if (tpl) this.roomObjects[room.id].push(this.makeDecor(tpl, d.x, d.y));
            }
          }
        }
      } catch (_) {}
    }

    saveState() {
      try {
        const avatars = {};
        for (const s of [1, 2, 3]) {
          avatars[s] = {};
          for (const cat of WARDROBE_CATS) avatars[s][cat.key] = this.avatars[s][cat.key];
        }
        const decor = {};
        for (const room of ROOMS) {
          decor[room.id] = this.roomObjects[room.id].filter(o => o.custom).map(o => ({ type: o.type, x: Math.round(o.x), y: Math.round(o.y) }));
        }
        localStorage.setItem('cinna_avatar_world_v1', JSON.stringify({ avatars, decor }));
      } catch (_) {}
    }

    /* ---------- Ciclo de vida ---------- */
    init(containerEl) {
      this.stop();
      this.container = containerEl;
      this.sheet = null;
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
      if (this._onResize) {
        window.removeEventListener('resize', this._onResize);
        this._onResize = null;
      }
    }

    getRoomItems() {
      return this.roomObjects[ROOMS[this.currentRoomIdx].id] || [];
    }

    playerName(slot) {
      if (slot === 1) {
        const n = window.Cinnamo?.playerName?.get?.();
        if (n) return n.charAt(0) + n.slice(1).toLowerCase();
      }
      return `Amigo ${slot}`;
    }

    broadcastContext() {
      window.Cinnamo?.controllerBridge?.broadcastGameContext?.({
        screen: 'avatar',
        room: ROOMS[this.currentRoomIdx].id,
        roomIdx: this.currentRoomIdx,
        roomName: ROOMS[this.currentRoomIdx].name,
        lighting: this.lightingMode
      });
    }

    /* ---------- Interfaz: lienzo + flechas de cuarto + dos botones ---------- */
    renderLayout() {
      if (!this.container) return;
      const icon = (n) => window.CinnaIcons ? window.CinnaIcons.svg(n) : '';
      this.container.innerHTML = `
        <div class="aw-shell">
          <div class="aw-stage" id="awStage">
            <canvas id="avatarWorldCanvas" aria-label="Casa de Cinnamoroll"></canvas>

            <button class="aw-door aw-door-left" data-dir="-1" aria-label="Ir al cuarto anterior">
              <span class="aw-door-arrow">${icon('arrow-left')}</span><span class="aw-door-room"></span>
            </button>
            <button class="aw-door aw-door-right" data-dir="1" aria-label="Ir al cuarto siguiente">
              <span class="aw-door-room"></span><span class="aw-door-arrow">${icon('arrow-right')}</span>
            </button>

            <button class="aw-map-btn" id="btnAwMap" aria-label="Mapa de Ciudad Cinnamoroll">
              <span class="ci">${icon('map')}</span><span>Ciudad</span>
            </button>

            <div class="aw-room-dots" role="tablist" aria-label="Habitaciones">
              ${ROOMS.map((r, i) => `<span class="aw-dot ${i === this.currentRoomIdx ? 'active' : ''}" data-room-idx="${i}" title="${r.name}">${icon(r.icon)}</span>`).join('')}
            </div>

            <button class="aw-fab aw-fab-toys" id="btnAwToys" aria-label="Juguetes">${icon('toybox')}</button>
            <button class="aw-fab aw-fab-closet" id="btnAwCloset" aria-label="Ropa">${icon('hanger')}</button>

            <div class="aw-trash hidden" id="awTrash" aria-hidden="true">
              <svg viewBox="0 0 24 24" class="ci-svg"><path d="M5 7h14l-1.2 12a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" style="fill:#fff"/><path d="M3.5 7h17M9.5 7V4.5h5V7M10 11v6M14 11v6"/></svg>
            </div>

            <div class="aw-sheet hidden" id="awSheet" role="dialog" aria-modal="false"></div>
          </div>
        </div>
      `;

      this.canvas = this.container.querySelector('#avatarWorldCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.stage = this.container.querySelector('#awStage');
      this.resizeCanvas();
      this._onResize = () => this.resizeCanvas();
      window.addEventListener('resize', this._onResize);
      this.updateDoors();
      this.bindDOMEvents();
    }

    // Resolución nítida en tablets (pantallas retina) sin cambiar las coordenadas del juego
    resizeCanvas() {
      if (!this.canvas) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.dpr = dpr;
      this.canvas.width = Math.round(this.logicalW * dpr);
      this.canvas.height = Math.round(this.logicalH * dpr);
    }

    updateDoors() {
      if (!this.container) return;
      const n = ROOMS.length;
      const prev = ROOMS[(this.currentRoomIdx + n - 1) % n];
      const next = ROOMS[(this.currentRoomIdx + 1) % n];
      const icon = (r) => window.CinnaIcons ? window.CinnaIcons.svg(r.icon) : '';
      const l = this.container.querySelector('.aw-door-left .aw-door-room');
      const r = this.container.querySelector('.aw-door-right .aw-door-room');
      if (l) l.innerHTML = icon(prev);
      if (r) r.innerHTML = icon(next);
      this.container.querySelector('.aw-door-left')?.setAttribute('aria-label', `Ir a ${prev.name}`);
      this.container.querySelector('.aw-door-right')?.setAttribute('aria-label', `Ir a ${next.name}`);
      this.container.querySelectorAll('.aw-dot').forEach((d, i) => d.classList.toggle('active', i === this.currentRoomIdx));
    }

    bindDOMEvents() {
      if (!this.container) return;
      this.container.querySelectorAll('.aw-door').forEach(btn => {
        btn.addEventListener('click', () => {
          this.mapOpen = false;
          this.updateMapButtonUI();
          this.changeRoom(parseInt(btn.dataset.dir, 10));
        });
      });
      this.container.querySelector('#btnAwMap')?.addEventListener('click', () => {
        this.toggleMap();
      });
      this.container.querySelectorAll('.aw-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.dataset.roomIdx, 10);
          if (!isNaN(idx)) {
            this.mapOpen = false;
            this.updateMapButtonUI();
            this.selectRoom(idx);
          }
        });
      });
      this.container.querySelector('#btnAwCloset')?.addEventListener('click', () => {
        if (this.mapOpen) { this.mapOpen = false; this.updateMapButtonUI(); }
        if (this.sheet === 'closet') this.closeSheet();
        else this.openWardrobe(this.wardrobeTargetSlot);
      });
      this.container.querySelector('#btnAwToys')?.addEventListener('click', () => {
        if (this.mapOpen) { this.mapOpen = false; this.updateMapButtonUI(); }
        if (this.sheet === 'toys') this.closeSheet();
        else this.openToys();
      });
      this.bindCanvasPointerEvents();
    }

    /* ---------- Hojas inferiores: vestidor y baúl de juguetes ---------- */
    openWardrobe(slot = 1) {
      this.wardrobeTargetSlot = slot;
      this.avatars[slot].active = true;
      this.sheet = 'closet';
      if (A()) { A().unlock(); A().sparkleChime(); }
      this.renderSheet();
    }

    openToys() {
      this.sheet = 'toys';
      if (A()) { A().unlock(); A().bubblePop(2); }
      this.renderSheet();
    }

    closeWardrobe() { this.closeSheet(); }

    closeSheet() {
      this.sheet = null;
      if (A()) { A().unlock(); A().softBoing(); }
      this.renderSheet();
    }

    renderSheet() {
      const el = this.container?.querySelector('#awSheet');
      if (!el) return;
      this.container.querySelector('#btnAwCloset')?.classList.toggle('active', this.sheet === 'closet');
      this.container.querySelector('#btnAwToys')?.classList.toggle('active', this.sheet === 'toys');
      el.classList.toggle('hidden', !this.sheet);
      el.classList.toggle('aw-sheet-toys', this.sheet === 'toys');
      if (!this.sheet) { el.innerHTML = ''; return; }
      const done = window.CinnaIcons ? window.CinnaIcons.svg('check') : '';

      if (this.sheet === 'toys') {
        el.innerHTML = `
          <div class="aw-sheet-row">
            <div class="aw-tiles aw-tiles-toys">
              ${CATALOG_DECOR.map(d => `<button class="aw-tile" data-decor="${d.type}" aria-label="${d.name}"><canvas width="96" height="96"></canvas></button>`).join('')}
            </div>
            <button class="aw-sheet-done" aria-label="Listo">${done}</button>
          </div>`;
        el.querySelectorAll('.aw-tile').forEach(tile => {
          this.paintDecorThumb(tile.querySelector('canvas'), tile.dataset.decor);
          tile.addEventListener('click', () => {
            this.spawnDecorItem(tile.dataset.decor);
            tile.classList.remove('pop'); void tile.offsetWidth; tile.classList.add('pop');
          });
        });
      } else {
        const av = this.avatars[this.wardrobeTargetSlot];
        const cat = WARDROBE_CATS.find(c => c.id === this.wardrobeTab) || WARDROBE_CATS[1];
        el.innerHTML = `
          <div class="aw-closet">
          <div class="aw-preview" style="--slot:${SLOT_COLORS[this.wardrobeTargetSlot]}"><canvas width="132" height="170"></canvas></div>
          <div class="aw-closet-main">
          <div class="aw-sheet-row aw-sheet-top">
            <div class="aw-friends">
              ${[1, 2, 3].map(s => `
                <button class="aw-friend ${s === this.wardrobeTargetSlot ? 'active' : ''} ${this.avatars[s].active ? '' : 'off'}" data-slot="${s}" style="--slot:${SLOT_COLORS[s]}" aria-label="${this.playerName(s)}">
                  <canvas width="64" height="64"></canvas>
                  ${this.avatars[s].active ? '' : `<span class="aw-friend-plus">${window.CinnaIcons ? window.CinnaIcons.svg('plus') : '+'}</span>`}
                </button>`).join('')}
            </div>
            <div class="aw-cats">
              ${WARDROBE_CATS.map(c => `<button class="aw-cat ${c.id === cat.id ? 'active' : ''}" data-cat="${c.id}" aria-label="${c.name}"><canvas width="48" height="48"></canvas></button>`).join('')}
            </div>
            <button class="aw-sheet-done" aria-label="Listo">${done}</button>
          </div>
          <div class="aw-tiles">
            ${cat.list.map(o => `<button class="aw-tile ${av[cat.key] === o.id ? 'active' : ''}" data-val="${o.id}" aria-label="${o.name}"><canvas width="104" height="104"></canvas></button>`).join('')}
          </div>
          </div>
          </div>`;
        this.paintAvatarThumb(el.querySelector('.aw-preview canvas'), Object.assign({}, av, { facing: 1, isBlinking: false }), 'body');

        el.querySelectorAll('.aw-friend').forEach(btn => {
          const s = parseInt(btn.dataset.slot, 10);
          this.paintAvatarThumb(btn.querySelector('canvas'), this.avatars[s], 'face');
          btn.addEventListener('click', () => {
            if (A()) { A().unlock(); A().bubblePop(1); }
            if (!this.avatars[s].active) {
              this.avatars[s].active = true;
              this.spawnBurst(this.avatars[s].x, this.avatars[s].y - 60, SLOT_COLORS[s], 16);
            }
            this.wardrobeTargetSlot = s;
            this.renderSheet();
          });
        });
        el.querySelectorAll('.aw-cat').forEach(btn => {
          if (btn.dataset.cat === 'base') {
            this.paintAvatarThumb(btn.querySelector('canvas'), Object.assign({}, av, { hatId: 'none', glassesId: 'none', propId: 'none', exprId: 'happy', isBlinking: false, facing: 1 }), 'face');
          } else this.paintCategoryIcon(btn.querySelector('canvas'), btn.dataset.cat);
          btn.addEventListener('click', () => {
            if (A()) { A().unlock(); A().bubblePop(1); }
            this.wardrobeTab = btn.dataset.cat;
            this.renderSheet();
          });
        });
        el.querySelectorAll('.aw-tile').forEach(tile => {
          const preview = Object.assign({}, av, { [cat.key]: tile.dataset.val, isBlinking: false, chewTimer: 0, sleeping: false, danceTimer: 0, vx: 0, vy: 0, facing: 1 });
          this.paintAvatarThumb(tile.querySelector('canvas'), preview, cat.zoom);
          tile.addEventListener('click', () => {
            this.applyCustomization(this.wardrobeTargetSlot, cat.id, tile.dataset.val);
            this.renderSheet();
          });
        });
      }
      el.querySelector('.aw-sheet-done')?.addEventListener('click', () => this.closeSheet());
    }

    // Prepara un canvas pequeño con buena resolución y devuelve su contexto escalado
    prepThumb(canvas) {
      const cssW = canvas.width;
      const cssH = canvas.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, w: cssW, h: cssH };
    }

    paintAvatarThumb(canvas, av, zoom = 'body') {
      if (!canvas) return;
      const { ctx, w, h } = this.prepThumb(canvas);
      const copy = Object.assign({}, av, { x: 0, y: 0, emotionBubble: null, hop: 0, lifted: false });
      ctx.save();
      if (zoom === 'face') {
        const s = w / 112;
        ctx.translate(w / 2, h * 0.5 + 76 * s);
        ctx.scale(s, s);
      } else {
        const s = h / 168;
        ctx.translate(w / 2 - 4 * s, h - 14 * s);
        ctx.scale(s, s);
      }
      this.drawVectorAvatar(ctx, copy, { noBadge: true, noShadow: zoom === 'face', still: true });
      ctx.restore();
    }

    paintDecorThumb(canvas, type) {
      if (!canvas) return;
      const { ctx, w, h } = this.prepThumb(canvas);
      const tpl = CATALOG_DECOR.find(d => d.type === type);
      const s = Math.min(1.05, (h - 18) / (tpl?.h || 70));
      ctx.save();
      ctx.translate(w / 2, h - 8);
      ctx.scale(s, s);
      this.drawDecorShape(ctx, type, 0, 0, true);
      ctx.restore();
    }

    paintCategoryIcon(canvas, cat) {
      if (!canvas) return;
      const { ctx, w, h } = this.prepThumb(canvas);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      const s = w / 48;
      ctx.scale(s, s);
      if (cat === 'base') {
        const base = CHARACTER_BASES.find(b => b.id === this.avatars[this.wardrobeTargetSlot].baseId) || CHARACTER_BASES[0];
        ctx.translate(0, 14);
        ctx.scale(0.42, 0.42);
        ctx.translate(0, 68);
        this.drawArticulatedEars(ctx, base, 0);
        ctx.beginPath(); ctx.ellipse(0, -68, 38, 30, 0, 0, TAU); fillStroke(ctx, base.bodyColor, 5);
        ctx.fillStyle = base.eyeColor;
        ctx.beginPath(); ctx.ellipse(-15, -69, 6, 8, 0, 0, TAU); ctx.ellipse(15, -69, 6, 8, 0, 0, TAU); ctx.fill();
      } else if (cat === 'outfit') {
        ctx.beginPath();
        ctx.moveTo(-6, -17); ctx.quadraticCurveTo(0, -13, 6, -17); ctx.lineTo(13, -12); ctx.lineTo(9, -5); ctx.lineTo(8, -3);
        ctx.quadraticCurveTo(20, 10, 18, 16); ctx.quadraticCurveTo(0, 20, -18, 16); ctx.quadraticCurveTo(-20, 10, -8, -3);
        ctx.lineTo(-9, -5); ctx.lineTo(-13, -12); ctx.closePath();
        fillStroke(ctx, '#7dd3fc', 2.2);
        this.drawBowShape(ctx, 0, -4, 0.3, '#f472b6');
      } else if (cat === 'hat') {
        ctx.translate(0, 26); ctx.scale(1.25, 1.25); this.drawHatShape(ctx, 'crown', 0, -12);
      } else if (cat === 'glasses') {
        ctx.scale(1.3, 1.3); ctx.translate(0, 69); this.drawGlassesLayer(ctx, 'hearts');
      } else if (cat === 'prop') {
        ctx.translate(-4, 16); ctx.scale(0.95, 0.95); this.drawPropShape(ctx, 'wand', 0, 0);
      } else {
        ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); fillStroke(ctx, '#fff3a8', 2.4);
        ctx.fillStyle = OUT;
        ctx.beginPath(); ctx.arc(-6, -4, 2.6, 0, TAU); ctx.arc(6, -4, 2.6, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(0, 2, 7, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 2.4; ctx.strokeStyle = OUT; ctx.stroke();
      }
      ctx.restore();
    }

    syncPlayerBadgesUI() {
      if (this.sheet === 'closet') this.renderSheet();
    }

    /* ---------- Acciones del juego ---------- */
    applyCustomization(slot, category, value) {
      const av = this.avatars[slot] || this.avatars[1];
      av.active = true;
      if (A()) { A().unlock(); A().sparkleChime(); }
      const cat = WARDROBE_CATS.find(c => c.id === category);
      if (!cat || !cat.list.some(o => o.id === value)) return;
      av[cat.key] = value;
      if (category === 'expr') {
        const found = EXPRESSIONS.find(e => e.id === value);
        if (found) this.showEmotionBubble(av, found.bubble);
      }
      av.hop = 1;
      this.spawnBurst(av.x, av.y - 60, '#f472b6', 14);
      this.saveState();
      this.rewardOnce('dress', 1);
    }

    // Juego libre: las estrellas se dan una vez por tipo de acción en la sesión
    rewardOnce(key, amount) {
      this.rewarded = this.rewarded || new Set();
      if (this.rewarded.has(key)) return;
      this.rewarded.add(key);
      window.Cinnamo?.passport?.addStars?.(amount, 'avatar');
    }

    cycleCustomForPlayer(slot, category) {
      const av = this.avatars[slot] || this.avatars[1];
      const cat = WARDROBE_CATS.find(c => c.id === category);
      if (!cat) return;
      const idx = cat.list.findIndex(item => item.id === av[cat.key]);
      const next = cat.list[(idx + 1) % cat.list.length];
      this.applyCustomization(slot, category, next.id);
      if (this.sheet === 'closet') this.renderSheet();
    }

    changeRoom(dir, walker = null) {
      const n = ROOMS.length;
      this.selectRoom((this.currentRoomIdx + dir + n) % n, dir, walker);
    }

    openMap() {
      if (this.sheet) this.closeSheet();
      this.mapOpen = true;
      if (A()) { A().unlock(); A().sparkleChime(); }
      this.updateMapButtonUI();
      this.broadcastContext();
    }

    closeMap() {
      this.mapOpen = false;
      if (A()) { A().unlock(); A().softBoing(); }
      this.updateMapButtonUI();
      this.broadcastContext();
    }

    toggleMap() {
      if (this.mapOpen) this.closeMap();
      else this.openMap();
    }

    updateMapButtonUI() {
      const btn = this.container?.querySelector('#btnAwMap');
      if (btn) btn.classList.toggle('active', !!this.mapOpen);
      this.container?.querySelectorAll('.aw-door').forEach(d => {
        d.style.opacity = this.mapOpen ? '0' : '1';
        d.style.pointerEvents = this.mapOpen ? 'none' : 'auto';
      });
    }

    getMapBuildings() {
      return [
        { idx: 0, id: 'cafe', name: 'Pastelería & Súper', emoji: '🧁', x: 225, y: 390, w: 210, h: 155, roof: '#f472b6', wall: '#fff1f2', side: '#fce7f3', accent: '#db2777' },
        { idx: 1, id: 'bedroom', name: 'Casa de Nubes', emoji: '🛏️', x: 235, y: 205, w: 195, h: 140, roof: '#60a5fa', wall: '#f0f9ff', side: '#e0f2fe', accent: '#0284c7' },
        { idx: 2, id: 'garden', name: 'Parque Sakura', emoji: '🌸', x: 505, y: 245, w: 210, h: 145, roof: '#f9a8d4', wall: '#fdf2f8', side: '#fbcfe8', accent: '#16a34a' },
        { idx: 4, id: 'spa', name: 'Spa & Mascotas', emoji: '🛁', x: 780, y: 210, w: 200, h: 145, roof: '#2dd4bf', wall: '#f0fdfa', side: '#ccfbf1', accent: '#0d9488' },
        { idx: 3, id: 'beach', name: 'Bahía Helada', emoji: '🏖️', x: 760, y: 415, w: 220, h: 145, roof: '#38bdf8', wall: '#fef9c3', side: '#fef08a', accent: '#0284c7' }
      ];
    }

    selectRoom(roomIdx, dir = 1, walker = null) {
      const idx = Math.max(0, Math.min(ROOMS.length - 1, parseInt(roomIdx, 10) || 0));
      if (A()) { A().unlock(); A().bubblePop(2); }
      const changed = idx !== this.currentRoomIdx || this.mapOpen;
      this.mapOpen = false;
      this.updateMapButtonUI();
      this.currentRoomIdx = idx;
      for (const s of [1, 2, 3]) {
        const av = this.avatars[s];
        av.sittingOn = null;
        av.sleeping = false;
        av.targetX = av.targetY = null;
        av.pendingObj = null;
        if (changed) {
          // Los amigos entran por el lado contrario, como si cruzaran la puerta
          const enterX = dir > 0 ? 120 + (s - 1) * 70 : this.logicalW - 120 - (s - 1) * 70;
          av.x = walker === av ? (dir > 0 ? 110 : this.logicalW - 110) : enterX;
          av.facing = dir > 0 ? 1 : -1;
        }
      }
      if (changed) this.transition = 1;
      this.updateDoors();
      this.broadcastContext();
    }

    cycleLighting() {
      if (A()) { A().unlock(); A().sparkleChime(); }
      const order = ['day', 'sunset', 'night'];
      this.lightingMode = order[(order.indexOf(this.lightingMode) + 1) % order.length];
      const room = ROOMS[this.currentRoomIdx];
      const src = room.outdoor ? { x: 860, y: 96 } : { x: 490, y: 175 };
      this.spawnBurst(src.x, src.y, this.lightingMode === 'night' ? '#fef08a' : '#fda4af', 14);
      this.broadcastContext();
    }

    makeDecor(template, x, y) {
      return {
        id: `decor_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
        type: template.type, name: template.name, x, y, w: template.w, h: template.h,
        food: !!template.food, toy: !!template.toy, seat: !!template.seat, light: !!template.light,
        custom: true, state: true, drop: 0
      };
    }

    spawnDecorItem(decorType, slot = 1) {
      const type = DECOR_ALIASES[decorType] || decorType;
      const template = CATALOG_DECOR.find(d => d.type === type) || CATALOG_DECOR[0];
      const list = this.getRoomItems();
      const av = this.avatars[slot] || this.avatars[1];
      // Aparece cerca de quien lo pide, cayendo desde arriba con rebote
      const x = Math.max(110, Math.min(this.logicalW - 110, av.x + (av.facing || 1) * (90 + Math.random() * 60)));
      const y = Math.max(this.floorY + 30, Math.min(this.logicalH - 30, av.y + (Math.random() - 0.5) * 40));
      const obj = this.makeDecor(template, x, y);
      obj.drop = 1;
      const customs = list.filter(o => o.custom);
      if (customs.length >= 14) list.splice(list.indexOf(customs[0]), 1);
      list.push(obj);
      if (A()) { A().unlock(); A().celebrate(); }
      this.spawnBurst(x, y - 30, '#38bdf8', 16);
      this.saveState();
      this.rewardOnce('decor', 2);
      return obj;
    }

    /* ---------- Toques en el lienzo ---------- */
    bindCanvasPointerEvents() {
      if (!this.canvas) return;
      const toLogical = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        return {
          x: ((e.clientX - rect.left) / rect.width) * this.logicalW,
          y: ((e.clientY - rect.top) / rect.height) * this.logicalH
        };
      };
      const trash = this.container.querySelector('#awTrash');
      const overTrash = (e) => {
        if (!trash || trash.classList.contains('hidden')) return false;
        const r = trash.getBoundingClientRect();
        return e.clientX >= r.left - 10 && e.clientX <= r.right + 10 && e.clientY >= r.top - 10 && e.clientY <= r.bottom + 10;
      };

      this.canvas.onpointerdown = (e) => {
        e.preventDefault();
        if (this.dragState) return;
        try { this.canvas.setPointerCapture(e.pointerId); } catch (_) {}
        if (A()) A().unlock();
        if (this.sheet) this.closeSheet();
        const pt = toLogical(e);
        const room = ROOMS[this.currentRoomIdx];

        // 0. Si el Mapa de Ciudad está abierto, tocar un edificio viaja directo a ese lugar
        if (this.mapOpen) {
          for (const b of this.getMapBuildings()) {
            if (Math.abs(pt.x - b.x) <= b.w * 0.52 && pt.y >= b.y - b.h && pt.y <= b.y + 28) {
              this.spawnBurst(b.x, b.y - 45, b.roof, 18);
              this.selectRoom(b.idx);
              return;
            }
          }
          // Tocar el sol en el mapa también cambia el clima
          if (Math.hypot(pt.x - 500, pt.y - 72) < 55) {
            this.cycleLighting();
            return;
          }
          return;
        }

        // 1. Amigos: se pueden tomar y arrastrar
        const activeAvs = Object.values(this.avatars).filter(a => a.active).sort((a, b) => b.y - a.y);
        for (const av of activeAvs) {
          if (Math.abs(pt.x - av.x) < 52 && pt.y >= av.y - 140 && pt.y <= av.y + 18) {
            av.sittingOn = null;
            av.sleeping = false;
            av.targetX = av.targetY = null;
            av.pendingObj = null;
            this.dragState = { kind: 'avatar', target: av, pointerId: e.pointerId, offsetX: av.x - pt.x, offsetY: av.y - pt.y, startX: pt.x, startY: pt.y, moved: false };
            if (A()) A().bubblePop(1);
            return;
          }
        }

        // 2. Objetos: tocar = usar, arrastrar = mover
        const objs = [...this.getRoomItems()].sort((a, b) => b.y - a.y);
        for (const obj of objs) {
          const top = obj.flat ? obj.y - obj.h : obj.y - obj.h;
          if (Math.abs(pt.x - obj.x) < obj.w / 2 + 12 && pt.y >= top && pt.y <= obj.y + 18) {
            this.dragState = { kind: 'object', target: obj, pointerId: e.pointerId, offsetX: obj.x - pt.x, offsetY: obj.y - pt.y, startX: pt.x, startY: pt.y, moved: false };
            return;
          }
        }

        // 3. La ventana (o el sol del jardín) cambia el momento del día
        const sky = room.outdoor ? { x: 860, y: 96, r: 54 } : { x: 490, y: 175, r: 100 };
        if (Math.hypot(pt.x - sky.x, (pt.y - sky.y) * (room.outdoor ? 1 : 1.25)) < sky.r) {
          this.cycleLighting();
          return;
        }

        // 4. Piso: la niña o niño (P1) camina hasta ahí
        this.walkTo(this.avatars[1], pt.x, pt.y);
        this.spawnRipple(pt.x, Math.max(this.floorY, pt.y));
      };

      this.canvas.onpointermove = (e) => {
        const ds = this.dragState;
        if (!ds || e.pointerId !== ds.pointerId) return;
        e.preventDefault();
        const pt = toLogical(e);
        if (!ds.moved && Math.hypot(pt.x - ds.startX, pt.y - ds.startY) > 10) {
          ds.moved = true;
          if (ds.kind === 'object' && ds.target.custom && trash) trash.classList.remove('hidden');
        }
        if (!ds.moved) return;
        if (ds.kind === 'avatar') {
          ds.target.x = Math.max(60, Math.min(this.logicalW - 60, pt.x + ds.offsetX));
          ds.target.y = Math.max(this.floorY - 30, Math.min(this.logicalH - 20, pt.y + ds.offsetY));
          ds.target.lifted = true;
        } else {
          const obj = ds.target;
          obj.x = Math.max(60, Math.min(this.logicalW - 60, pt.x + ds.offsetX));
          obj.y = Math.max(obj.fixed ? this.floorY - 20 : this.floorY - 40, Math.min(this.logicalH - 16, pt.y + ds.offsetY));
          if (trash) trash.classList.toggle('hot', overTrash(e));
        }
      };

      const onPointerEnd = (e) => {
        const ds = this.dragState;
        if (!ds || e.pointerId !== ds.pointerId) return;
        try { this.canvas.releasePointerCapture(e.pointerId); } catch (_) {}
        this.dragState = null;
        const droppedOnTrash = overTrash(e);
        if (trash) trash.classList.add('hidden');

        if (ds.kind === 'avatar') {
          ds.target.lifted = false;
          if (!ds.moved) {
            // Tocar a un amigo: salta feliz y abre su ropa si se toca de nuevo
            const av = ds.target;
            av.hop = 1;
            this.showEmotionBubble(av, 'heart');
            if (A()) A().kawaiiChirp?.('happy');
            if (this._lastTapAv === av && performance.now() - this._lastTapAt < 600) this.openWardrobe(av.slot);
            this._lastTapAv = av;
            this._lastTapAt = performance.now();
          } else {
            this.checkAvatarDropInteraction(ds.target);
          }
          return;
        }

        const obj = ds.target;
        if (ds.moved) {
          if (obj.custom && droppedOnTrash) {
            const list = this.getRoomItems();
            list.splice(list.indexOf(obj), 1);
            this.spawnBurst(obj.x, obj.y - 30, '#cbd5e1', 18);
            if (A()) A().softBoing();
            this.saveState();
            return;
          }
          if (obj.food) {
            // Combinación de ingredientes: arrastrar comida a otro postre o a la batidora/horno crea una Receta Especial
            const otherFood = this.getRoomItems().find(o => o !== obj && (o.food || o.type === 'mixer' || o.type === 'oven') && Math.hypot(o.x - obj.x, o.y - obj.y) < 88);
            if (otherFood) {
              this.craftSpecialRecipe(obj, otherFood);
              return;
            }
            for (const s of [1, 2, 3]) {
              const av = this.avatars[s];
              if (av.active && Math.hypot(av.x - obj.x, (av.y - 50) - (obj.y - 25)) < 90) {
                this.feedAvatar(av, obj);
                break;
              }
            }
          }
          if (obj.custom) this.saveState();
          return;
        }

        // Toque simple: lámparas responden al instante; lo demás, P1 camina y lo usa
        const p1 = this.avatars[1];
        if (obj.light || Math.hypot(p1.x - obj.x, p1.y - obj.y) < 110) {
          this.triggerObjectInteraction(obj, p1);
        } else {
          this.walkTo(p1, obj.x + (p1.x < obj.x ? -1 : 1) * Math.min(70, obj.w / 2), Math.max(obj.y + 10, this.floorY + 10), obj);
        }
      };

      this.canvas.onpointerup = onPointerEnd;
      this.canvas.onpointercancel = onPointerEnd;
    }

    walkTo(av, x, y, obj = null) {
      av.active = true;
      av.sittingOn = null;
      av.sleeping = false;
      av.targetX = Math.max(85, Math.min(this.logicalW - 85, x));
      av.targetY = Math.max(this.floorY - 5, Math.min(this.logicalH - 28, y));
      av.pendingObj = obj;
    }

    checkAvatarDropInteraction(av) {
      for (const obj of this.getRoomItems()) {
        if (Math.hypot(av.x - obj.x, av.y - obj.y) < 88) {
          if (obj.sleep) { this.sitOn(av, obj, true); return; }
          if (obj.seat) { this.sitOn(av, obj, false); return; }
          if (obj.food) { this.feedAvatar(av, obj); return; }
        }
      }
    }

    sitOn(av, obj, sleep) {
      av.sittingOn = obj;
      av.sleeping = sleep;
      av.x = obj.x;
      av.y = obj.y - (sleep ? 12 : 8);
      if (sleep) {
        av.exprId = 'sleepy';
        this.showEmotionBubble(av, 'zzz');
        if (A()) A().softBoing();
      } else if (obj.type === 'stage') {
        av.danceTimer = 4.0;
        av.exprId = 'party';
        this.showEmotionBubble(av, 'mic');
        if (A()) A().celebrate();
        this.spawnBurst(obj.x, obj.y - 50, '#fef08a', 15);
      } else {
        this.showEmotionBubble(av, 'heart');
        if (A()) A().bubblePop(2);
      }
    }

    feedAvatar(av, foodObj) {
      av.chewTimer = 2.6;
      av.exprId = 'yummy';
      av.sleeping = false;
      av.hop = 1;
      this.showEmotionBubble(av, 'yum');
      if (A()) A().celebrate();
      this.spawnBurst(av.x, av.y - 65, '#fda4af', 18);
      this.rewardOnce('feed', 2);
    }

    craftSpecialRecipe(ingredientObj, stationObj) {
      const list = this.getRoomItems();
      if (ingredientObj && ingredientObj.custom && list.includes(ingredientObj)) {
        list.splice(list.indexOf(ingredientObj), 1);
      }
      const x = stationObj ? stationObj.x : 340;
      const y = stationObj ? Math.max(this.floorY + 36, stationObj.y + 18) : 445;
      const crafted = this.spawnDecorItem('rainbow_cake', 1);
      crafted.x = Math.max(110, Math.min(this.logicalW - 110, x + 75));
      crafted.y = y;
      this.spawnBurst(crafted.x, crafted.y - 36, '#f472b6', 22);
      this.spawnBurst(crafted.x, crafted.y - 46, '#fde047', 16);
      for (const s of [1, 2, 3]) {
        if (this.avatars[s].active) {
          this.avatars[s].hop = 1;
          this.showEmotionBubble(this.avatars[s], 'star');
        }
      }
      this.rewardOnce('recipe_craft', 3);
      return crafted;
    }

    triggerObjectInteraction(obj, av) {
      if (!obj) return;
      if (A()) A().unlock();
      obj.wiggle = 1;

      if (obj.wardrobe) { this.openWardrobe(av?.slot || 1); return; }
      if (obj.light) { obj.state = !obj.state; if (A()) A().sparkleChime(); this.spawnBurst(obj.x, obj.y - obj.h + 10, '#fef08a', 12); return; }
      if (obj.food && av && !obj.seat) { this.feedAvatar(av, obj); return; }
      if (obj.toy && av) {
        av.danceTimer = 2.5; av.exprId = 'starry'; this.showEmotionBubble(av, 'star');
        if (A()) A().celebrate(); this.spawnBurst(obj.x, obj.y - 40, '#c4b5fd', 16);
        return;
      }
      if (obj.sleep && av) {
        if (av.sittingOn === obj && av.sleeping) {
          av.sleeping = false; av.sittingOn = null; av.exprId = 'happy';
          this.showEmotionBubble(av, 'sun');
        } else this.sitOn(av, obj, true);
        return;
      }
      if (obj.seat && av) {
        if (obj.food && av.sittingOn === obj) { this.feedAvatar(av, obj); return; }
        this.sitOn(av, obj, false);
        if (obj.type !== 'stage' && A()) A().celebrate();
        return;
      }

      // Horno, batidora de recetas, vitrina, carrito de helados, radio y fuente
      obj.state = !obj.state;
      if (obj.type === 'oven' && obj.state) {
        this.ovenTimer = 1.4; // en un momento sale un pastel recién horneado
        if (A()) A().bubblePop(2);
      } else if (obj.type === 'mixer') {
        this.craftSpecialRecipe(null, obj);
      } else if (obj.type === 'counter') {
        const cake = this.spawnDecorItem('cake_stand');
        cake.x = Math.max(110, Math.min(this.logicalW - 110, obj.x + 130));
      } else if (obj.type === 'ice_cream_cart') {
        const sundae = this.spawnDecorItem('ice_cream_fountain', av?.slot || 1);
        sundae.x = Math.max(110, Math.min(this.logicalW - 110, obj.x + 115));
      } else if (obj.type === 'music_box') {
        for (const s of [1, 2, 3]) {
          if (this.avatars[s].active) {
            this.avatars[s].danceTimer = obj.state ? 6.0 : 0;
            this.avatars[s].exprId = 'party';
          }
        }
        if (A()) A().celebrate();
      } else if (A()) A().bubblePop(2);
      this.spawnBurst(obj.x, obj.y - 45, '#7dd3fc', 14);
    }

    interactNearestForPlayer(slot = 1) {
      const av = this.avatars[slot] || this.avatars[1];
      av.active = true;
      let best = null;
      let bestDist = 175;
      for (const obj of this.getRoomItems()) {
        const d = Math.hypot(av.x - obj.x, av.y - obj.y);
        if (d < bestDist) { bestDist = d; best = obj; }
      }
      if (best) this.triggerObjectInteraction(best, av);
      else this.danceFor(slot);
    }

    danceFor(slot) {
      const av = this.avatars[slot] || this.avatars[1];
      av.active = true;
      av.danceTimer = 2.5;
      this.showEmotionBubble(av, 'sparkle');
      if (A()) { A().unlock(); A().celebrate(); }
      this.spawnBurst(av.x, av.y - 60, SLOT_COLORS[slot], 14);
    }

    setPlayerJoystick(slot, x, y) {
      const av = this.avatars[slot];
      if (!av) return;
      av.active = true;
      av.vx = Math.abs(x) > 0.18 ? x * 230 : 0;
      av.vy = Math.abs(y) > 0.18 ? y * 155 : 0;
      av.joy = av.vx !== 0 || av.vy !== 0;
      if (av.joy) {
        av.targetX = av.targetY = null;
        av.pendingObj = null;
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
      } else if (btn === 'jump' && pressed) {
        this.interactNearestForPlayer(slot);
      } else if (btn === 'treat' && pressed) {
        this.danceFor(slot);
      }
    }

    showEmotionBubble(av, kind) {
      av.emotionBubble = kind;
      av.emotionTimer = 2.4;
    }

    spawnBurst(x, y, color, count = 12) {
      for (let i = 0; i < count; i++) {
        const angle = (TAU * i) / count + Math.random() * 0.4;
        const speed = 40 + Math.random() * 90;
        this.particles.push({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 30,
          r: 3 + Math.random() * 4, color, life: 0.7 + Math.random() * 0.4,
          shape: i % 3 === 0 ? 'star' : 'dot', spin: Math.random() * TAU
        });
      }
    }

    spawnRipple(x, y) {
      this.particles.push({ x, y, vx: 0, vy: 0, r: 6, color: '#ffffff', life: 0.5, shape: 'ring' });
    }

    /* ---------- Simulación ---------- */
    update(dt) {
      this.time += dt;
      if (this.transition > 0) this.transition = Math.max(0, this.transition - dt * 2.4);

      const items = this.getRoomItems();
      for (const obj of items) {
        if (obj.type === 'swing') {
          const hasRider = Object.values(this.avatars).some(a => a.active && a.sittingOn === obj);
          obj.swingAngle = Math.sin(this.time * 3.2) * (hasRider ? 0.22 : 0.05);
        }
        if (obj.type === 'music_box' && obj.state && Math.random() < dt * 3.5) {
          this.floatingNotes.push({ x: obj.x + (Math.random() - 0.5) * 30, y: obj.y - 90, vy: -45 - Math.random() * 20, life: 1.5, hue: Math.random() < 0.5 ? '#ec4899' : '#8b5cf6' });
        }
        if (obj.drop > 0) obj.drop = Math.max(0, obj.drop - dt * 2.6);
        if (obj.wiggle > 0) obj.wiggle = Math.max(0, obj.wiggle - dt * 2.2);
        if (obj.ping > 0) obj.ping = Math.max(0, obj.ping - dt * 0.9);
      }

      // Pista suave: cada tanto un objeto brilla para invitar a tocarlo
      this.pingTimer -= dt;
      if (this.pingTimer <= 0 && items.length) {
        const candidates = items.filter(o => !o.flat);
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        if (pick) pick.ping = 1;
        this.pingTimer = 3.2 + Math.random() * 1.8;
      }

      if (this.ovenTimer > 0) {
        this.ovenTimer -= dt;
        if (this.ovenTimer <= 0) {
          const oven = items.find(o => o.type === 'oven');
          if (oven) {
            const cake = this.spawnDecorItem('cake_stand');
            cake.x = oven.x + 110;
            cake.y = Math.max(cake.y, this.floorY + 40);
            oven.state = false;
          }
        }
      }

      for (const s of [1, 2, 3]) {
        const av = this.avatars[s];
        if (!av.active) continue;

        if (av.targetX !== null && av.targetY !== null) {
          const dx = av.targetX - av.x;
          const dy = av.targetY - av.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 8) {
            av.targetX = av.targetY = null;
            av.vx = av.vy = 0;
            const obj = av.pendingObj;
            av.pendingObj = null;
            if (obj && this.getRoomItems().includes(obj)) {
              av.facing = obj.x >= av.x ? 1 : -1;
              this.triggerObjectInteraction(obj, av);
            } else this.checkAvatarDropInteraction(av);
          } else {
            av.vx = (dx / dist) * 230;
            av.vy = (dy / dist) * 160;
            av.facing = av.vx >= 0 ? 1 : -1;
          }
        }

        if (!av.sittingOn && !av.lifted) {
          av.x = Math.max(70, Math.min(this.logicalW - 70, av.x + av.vx * dt));
          av.y = Math.max(this.floorY - 12, Math.min(this.logicalH - 24, av.y + av.vy * dt));
          // Caminar con el mando hasta el borde lleva al cuarto de al lado
          if (av.joy && this.transition === 0) {
            if (av.x <= 71 && av.vx < -40) { this.changeRoom(-1, av); continue; }
            if (av.x >= this.logicalW - 71 && av.vx > 40) { this.changeRoom(1, av); continue; }
          }
        } else if (av.sittingOn?.type === 'swing') {
          av.x = av.sittingOn.x + Math.sin(av.sittingOn.swingAngle) * 26;
          av.y = av.sittingOn.y - 14;
        }

        const speed = Math.hypot(av.vx, av.vy);
        if ((speed > 10 && !av.sittingOn) || av.danceTimer > 0) {
          av.walkPhase += dt * (av.danceTimer > 0 ? 12 : 9.5);
          const targetEar = Math.sin(av.walkPhase) * 0.28;
          av.earVel += (targetEar - av.earAngle) * 18 * dt;
          av.earVel *= 0.85;
          av.earAngle += av.earVel;
        } else {
          av.walkPhase += dt * 2.2;
          av.earAngle = Math.sin(this.time * 2.1 + av.slot) * 0.06;
        }

        av.blinkTimer -= dt;
        if (av.blinkTimer <= 0) {
          av.isBlinking = !av.isBlinking;
          av.blinkTimer = av.isBlinking ? 0.14 : (2.4 + Math.random() * 3.2);
        }
        if (av.hop > 0) av.hop = Math.max(0, av.hop - dt * 2.8);
        if (av.chewTimer > 0) {
          av.chewTimer = Math.max(0, av.chewTimer - dt);
          if (av.chewTimer === 0 && av.exprId === 'yummy') av.exprId = 'happy';
        }
        if (av.danceTimer > 0) av.danceTimer = Math.max(0, av.danceTimer - dt);
        if (av.emotionTimer > 0) {
          av.emotionTimer = Math.max(0, av.emotionTimer - dt);
          if (av.emotionTimer === 0) av.emotionBubble = null;
        }
      }

      for (const p of this.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.shape !== 'ring') p.vy += 120 * dt;
        else p.r += dt * 90;
        p.life -= dt;
      }
      this.particles = this.particles.filter(p => p.life > 0);

      for (const n of this.floatingNotes) {
        n.y += n.vy * dt;
        n.x += Math.sin(this.time * 4 + n.y * 0.05) * 18 * dt;
        n.life -= dt;
      }
      this.floatingNotes = this.floatingNotes.filter(n => n.life > 0);
    }

    /* ============================================================
       DIBUJO HD · ESTILO AVATAR WORLD PAZU GAMES (v38)
       ============================================================ */
    draw() {
      const ctx = this.ctx;
      if (!ctx) return;
      const W = this.logicalW;
      const H = this.logicalH;
      const room = ROOMS[this.currentRoomIdx];

      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (this.mapOpen) {
        this.drawTownMap(ctx, W, H);
        this.drawParticlesLayer(ctx);
        return;
      }

      this.drawRoomBackdrop(ctx, room, W, H);

      const renderList = [];
      for (const obj of this.getRoomItems()) renderList.push({ sortY: obj.flat ? -1 : obj.y, kind: 'object', item: obj });
      for (const s of [1, 2, 3]) {
        const av = this.avatars[s];
        if (av.active) renderList.push({ sortY: av.y + (av.sittingOn ? 6 : 0) + (av.lifted ? 400 : 0), kind: 'avatar', item: av });
      }
      renderList.sort((a, b) => a.sortY - b.sortY);
      for (const entry of renderList) {
        if (entry.kind === 'object') this.drawInteractiveObject(ctx, entry.item);
        else this.drawVectorAvatar(ctx, entry.item);
      }

      // Lámpara colgante de flor en primer plano superior (estilo Pazu Supermarket/Bakery)
      if (room.id === 'cafe') {
        this.drawFlowerPendantLamp(ctx, 360, 0, '#f472b6', '#fef08a');
        this.drawFlowerPendantLamp(ctx, 680, 0, '#38bdf8', '#fde047');
      } else if (room.id === 'spa') {
        this.drawFlowerPendantLamp(ctx, 500, 0, '#2dd4bf', '#fef9c3');
      }

      this.drawParticlesLayer(ctx);
      this.drawAmbientLightingOverlay(ctx, W, H, room);

      // Cortina de nubes al cambiar de cuarto
      if (this.transition > 0) {
        const t = this.transition;
        ctx.save();
        ctx.globalAlpha = Math.min(1, t * 1.6);
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 7; i++) {
          const cx = (i / 6) * W;
          const r = 140 * Math.min(1, t * 1.8);
          ctx.beginPath(); ctx.arc(cx, H * 0.35 + (i % 2) * 120, r, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + 70, H * 0.8 - (i % 2) * 90, r, 0, TAU); ctx.fill();
        }
        ctx.restore();
      }
    }

    drawParticlesLayer(ctx) {
      for (const n of this.floatingNotes) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, n.life));
        this.drawNote(ctx, n.x, n.y, 1, n.hue);
        ctx.restore();
      }
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
        if (p.shape === 'ring') {
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.4, 0, 0, TAU); ctx.stroke();
        } else if (p.shape === 'star') {
          ctx.fillStyle = p.color;
          starPath(ctx, p.x, p.y, p.r * 1.5);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
        }
        ctx.restore();
      }
    }

    /* ---------- MAPA INTERACTIVO DE CIUDAD CINNAMOROLL (Estilo Pazu Avatar World) ---------- */
    drawTownMap(ctx, W, H) {
      ctx.save();
      // 1. Cielo panorámico y Sol sonriente asomándose tras las colinas
      const skyG = ctx.createLinearGradient(0, 0, 0, 175);
      if (this.lightingMode === 'night') {
        skyG.addColorStop(0, '#1e1b4b'); skyG.addColorStop(1, '#312e81');
      } else if (this.lightingMode === 'sunset') {
        skyG.addColorStop(0, '#fb7185'); skyG.addColorStop(1, '#fde68a');
      } else {
        skyG.addColorStop(0, '#7dd3fc'); skyG.addColorStop(1, '#e0f2fe');
      }
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, W, 175);

      // Sol sonriente estilo Pazu (Imagen 3)
      const sx = 500, sy = 76;
      const sunGlow = ctx.createRadialGradient(sx, sy, 15, sx, sy, 95);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      sunGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath(); ctx.arc(sx, sy, 95, 0, TAU); ctx.fill();
      for (let i = 0; i < 12; i++) {
        const a = this.time * 0.25 + (i * TAU) / 12;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(a) * 44, sy + Math.sin(a) * 44);
        ctx.lineTo(sx + Math.cos(a - 0.12) * 58, sy + Math.sin(a - 0.12) * 58);
        ctx.lineTo(sx + Math.cos(a + 0.12) * 58, sy + Math.sin(a + 0.12) * 58);
        ctx.closePath();
        fillStroke(ctx, '#facc15', 2);
      }
      ctx.beginPath(); ctx.arc(sx, sy, 42, 0, TAU);
      fillStroke(ctx, this.lightingMode === 'night' ? '#fef9c3' : '#fde047', 2.8);
      ctx.fillStyle = '#fb7185';
      ctx.globalAlpha = 0.55;
      ctx.beginPath(); ctx.ellipse(sx - 20, sy + 4, 7, 4, 0, 0, TAU); ctx.ellipse(sx + 20, sy + 4, 7, 4, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = OUT;
      ctx.beginPath(); ctx.arc(sx - 13, sy - 4, 4, 0, TAU); ctx.arc(sx + 13, sy - 4, 4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(sx - 14.5, sy - 5.5, 1.6, 0, TAU); ctx.arc(sx + 11.5, sy - 5.5, 1.6, 0, TAU); ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.arc(sx, sy + 3, 10, 0.18 * Math.PI, 0.82 * Math.PI); ctx.stroke();

      // Nubes suaves
      this.drawCloud(ctx, 140 + Math.sin(this.time * 0.4) * 25, 58, 0.72);
      this.drawCloud(ctx, 850 - Math.sin(this.time * 0.35) * 25, 62, 0.75);

      // 2. Terreno verde de la ciudad y colinas de fondo
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(0, 145);
      ctx.quadraticCurveTo(240, 88, 500, 128);
      ctx.quadraticCurveTo(760, 85, W, 140);
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      fillStroke(ctx, '#86efac', 2.4);

      const grassG = ctx.createLinearGradient(0, 135, 0, H);
      grassG.addColorStop(0, '#bbf7d0');
      grassG.addColorStop(1, '#86efac');
      ctx.fillStyle = grassG;
      ctx.fillRect(0, 135, W, H - 135);

      // Bahía costera en la esquina inferior derecha (para la Playa)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(560, H);
      ctx.quadraticCurveTo(600, 345, W, 325);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 4; ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(640, H);
      ctx.quadraticCurveTo(680, 385, W, 365);
      ctx.lineTo(W, H);
      ctx.closePath();
      const bayG = ctx.createLinearGradient(640, 365, W, H);
      bayG.addColorStop(0, '#38bdf8'); bayG.addColorStop(1, '#0284c7');
      ctx.fillStyle = bayG;
      ctx.fill();
      ctx.restore();

      // 3. Calles pavimentadas en perspectiva con pasos de cebra y veredas
      ctx.fillStyle = '#cbd5e1';
      roundRect(ctx, 40, 265, W - 80, 74, 24); fillStroke(ctx, '#e2e8f0', 2.4);
      roundRect(ctx, 355, 145, 76, 390, 20); fillStroke(ctx, '#e2e8f0', 2.4);
      ctx.fillStyle = '#64748b';
      roundRect(ctx, 52, 275, W - 104, 54, 18); ctx.fill();
      roundRect(ctx, 365, 155, 56, 370, 14); ctx.fill();

      // Líneas discontinuas y pasos de cebra blancos
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 12]);
      ctx.beginPath();
      ctx.moveTo(75, 302); ctx.lineTo(W - 75, 302);
      ctx.moveTo(393, 170); ctx.lineTo(393, 510);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pasos de cebra (crosswalks)
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(330, 279 + i * 10, 18, 6);
        ctx.fillRect(438, 279 + i * 10, 18, 6);
        ctx.fillRect(625, 279 + i * 10, 18, 6);
        ctx.fillRect(371 + i * 10, 248, 6, 18);
        ctx.fillRect(371 + i * 10, 338, 6, 18);
      }

      // Plaza central con fuente en rotonda
      ctx.beginPath(); ctx.ellipse(505, 435, 92, 46, 0, 0, TAU);
      fillStroke(ctx, '#fef3c7', 2.6);
      ctx.beginPath(); ctx.ellipse(505, 432, 54, 26, 0, 0, TAU);
      fillStroke(ctx, '#ffffff', 2.4);
      ctx.beginPath(); ctx.ellipse(505, 432, 44, 19, 0, 0, TAU);
      ctx.fillStyle = '#38bdf8'; ctx.fill();
      ctx.beginPath(); ctx.arc(505, 418, 12, 0, TAU);
      fillStroke(ctx, '#ffffff', 2.2);
      ctx.strokeStyle = '#bae6fd'; ctx.lineWidth = 3.5;
      const jh = 18 + Math.sin(this.time * 5) * 4;
      ctx.beginPath();
      ctx.moveTo(505, 412); ctx.quadraticCurveTo(485, 412 - jh, 472, 430);
      ctx.moveTo(505, 412); ctx.quadraticCurveTo(525, 412 - jh, 538, 430);
      ctx.stroke();

      // Árboles y faroles de ciudad
      for (const [tx, ty, col] of [[82, 225, '#f9a8d4'], [382, 165, '#4ade80'], [635, 175, '#f9a8d4'], [928, 235, '#4ade80'], [90, 460, '#4ade80'], [385, 485, '#f9a8d4']]) {
        ctx.fillStyle = '#92400e';
        roundRect(ctx, tx - 5, ty - 22, 10, 24, 3); fillStroke(ctx, '#b45309', 2);
        ctx.beginPath(); ctx.arc(tx, ty - 34, 20, 0, TAU);
        ctx.arc(tx - 13, ty - 26, 14, 0, TAU);
        ctx.arc(tx + 13, ty - 26, 14, 0, TAU);
        fillStroke(ctx, col, 2.2);
      }

      // 4. Los 5 Edificios 2.5D Interactivos
      const buildings = this.getMapBuildings();
      for (const b of buildings) {
        const isCurrent = b.idx === this.currentRoomIdx;
        const hoverBob = isCurrent ? Math.sin(this.time * 4) * 3 : 0;
        const bx = b.x, by = b.y + hoverBob;

        ctx.save();
        // Sombra de edificio
        ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
        ctx.beginPath(); ctx.ellipse(bx + 6, b.y + 10, b.w * 0.48, 20, 0, 0, TAU); ctx.fill();

        // Pared lateral 2.5D (extrusión isométrica derecha)
        ctx.beginPath();
        ctx.moveTo(bx + b.w * 0.34, by - b.h * 0.72);
        ctx.lineTo(bx + b.w * 0.48, by - b.h * 0.62);
        ctx.lineTo(bx + b.w * 0.48, by - 6);
        ctx.lineTo(bx + b.w * 0.34, by);
        ctx.closePath();
        fillStroke(ctx, b.side, 2.4);

        // Fachada principal
        roundRect(ctx, bx - b.w * 0.38, by - b.h * 0.74, b.w * 0.74, b.h * 0.74, 14);
        fillStroke(ctx, b.wall, 2.8);

        // Techo 2.5D con moldura
        ctx.beginPath();
        ctx.moveTo(bx - b.w * 0.43, by - b.h * 0.70);
        ctx.lineTo(bx - b.w * 0.01, by - b.h * 0.98);
        ctx.lineTo(bx + b.w * 0.46, by - b.h * 0.70);
        ctx.closePath();
        fillStroke(ctx, b.roof, 2.8);

        // Detalles únicos por edificio
        if (b.id === 'cafe') {
          // Toldo a rayas estilo Pastelería/Supermercado Pazu + Cupcake gigante en el techo
          for (let k = -3; k <= 3; k++) {
            roundRect(ctx, bx + k * 20 - 10, by - 56, 20, 16, [0, 0, 8, 8]);
            fillStroke(ctx, k % 2 === 0 ? '#f43f5e' : '#ffffff', 1.8);
          }
          roundRect(ctx, bx - 52, by - 38, 60, 30, 6); fillStroke(ctx, '#bae6fd', 2);
          roundRect(ctx, bx + 16, by - 38, 28, 38, [8, 8, 0, 0]); fillStroke(ctx, '#f472b6', 2);
          this.drawCupcake(ctx, bx, by - b.h * 0.95, 0.95);
        } else if (b.id === 'bedroom') {
          // Mansión de Nubes con cúpula estelar y balcón
          this.drawCloud(ctx, bx, by - b.h * 0.92, 0.48);
          ctx.fillStyle = '#fde047'; starPath(ctx, bx, by - b.h * 0.96, 11); fillStroke(ctx, '#fde047', 2);
          roundRect(ctx, bx - 44, by - 64, 34, 34, [16, 16, 4, 4]); fillStroke(ctx, '#bae6fd', 2);
          roundRect(ctx, bx + 8, by - 64, 34, 34, [16, 16, 4, 4]); fillStroke(ctx, '#bae6fd', 2);
          roundRect(ctx, bx - 16, by - 34, 28, 34, [10, 10, 0, 0]); fillStroke(ctx, '#c084fc', 2);
        } else if (b.id === 'garden') {
          // Parque Sakura con arco floral y cerezos
          roundRect(ctx, bx - 46, by - 68, 88, 68, [44, 44, 8, 8]); fillStroke(ctx, '#dcfce7', 2.2);
          this.drawFlower(ctx, bx - 32, by - 66, 8, '#f472b6');
          this.drawFlower(ctx, bx, by - 78, 10, '#fb7185');
          this.drawFlower(ctx, bx + 32, by - 66, 8, '#f472b6');
        } else if (b.id === 'spa') {
          // Spa & Mascotas con domo de burbujas y huellita
          for (const [dx, dy, r] of [[-22, -b.h * 0.9, 12], [0, -b.h * 0.98, 16], [22, -b.h * 0.9, 12]]) {
            ctx.beginPath(); ctx.arc(bx + dx, by + dy, r, 0, TAU); fillStroke(ctx, '#e0f2fe', 2);
          }
          roundRect(ctx, bx - 44, by - 58, 42, 32, 10); fillStroke(ctx, '#99f6e4', 2);
          roundRect(ctx, bx + 8, by - 42, 30, 42, [12, 12, 0, 0]); fillStroke(ctx, '#f9a8d4', 2);
        } else if (b.id === 'beach') {
          // Bahía Helada con Faro a rayas, palmera y kiosco de helados
          roundRect(ctx, bx - 58, by - 96, 24, 92, 6); fillStroke(ctx, '#ffffff', 2.2);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(bx - 56, by - 78, 20, 16);
          ctx.fillRect(bx - 56, by - 46, 20, 16);
          ctx.beginPath(); ctx.arc(bx - 46, by - 102, 12, 0, TAU); fillStroke(ctx, '#fde047', 2);
          this.drawCupcake(ctx, bx + 12, by - b.h * 0.92, 0.9);
        }

        // Placa de título estilo Pazu Avatar World (doble borde blanco + sombra 3D)
        ctx.font = '800 14px "Baloo 2", "Fredoka", sans-serif';
        const label = `${b.emoji} ${b.name}`;
        const tw = Math.max(130, ctx.measureText(label).width + 26);
        roundRect(ctx, bx - tw / 2, by + 4, tw, 28, 14);
        ctx.fillStyle = isCurrent ? '#facc15' : '#ffffff';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = isCurrent ? '#ca8a04' : b.accent;
        ctx.stroke();
        ctx.fillStyle = isCurrent ? '#713f12' : '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, bx, by + 18);

        // Pin flotante de Cinnamoroll sobre el edificio actual
        if (isCurrent) {
          const py = by - b.h - 22 + Math.sin(this.time * 6) * 5;
          ctx.beginPath();
          ctx.moveTo(bx - 10, py + 14); ctx.lineTo(bx + 10, py + 14); ctx.lineTo(bx, py + 28); ctx.closePath();
          fillStroke(ctx, '#ec4899', 2.2);
          ctx.beginPath(); ctx.arc(bx, py, 20, 0, TAU);
          fillStroke(ctx, '#ec4899', 3);
          ctx.beginPath(); ctx.arc(bx, py, 15, 0, TAU);
          ctx.fillStyle = '#ffffff'; ctx.fill();
          ctx.fillStyle = '#0284c7';
          ctx.beginPath(); ctx.arc(bx - 5, py, 2.5, 0, TAU); ctx.arc(bx + 5, py, 2.5, 0, TAU); ctx.fill();
          ctx.fillStyle = '#f472b6';
          ctx.beginPath(); ctx.ellipse(bx - 9, py + 3, 3, 1.8, 0, 0, TAU); ctx.ellipse(bx + 9, py + 3, 3, 1.8, 0, 0, TAU); ctx.fill();
        }
        ctx.restore();
      }

      // Cartel superior del Mapa de Ciudad
      ctx.save();
      const bannerW = 360, bannerH = 42;
      roundRect(ctx, W / 2 - bannerW / 2, 504, bannerW, bannerH, 21);
      fillStroke(ctx, '#ffffff', 3.2);
      ctx.font = '800 17px "Baloo 2", "Fredoka", sans-serif';
      ctx.fillStyle = '#0369a1';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🗺️ Toca cualquier edificio para entrar a jugar ✨', W / 2, 525);
      ctx.restore();

      ctx.restore();
    }

    /* ---------- LÁMPARA COLGANTE DE FLOR (Inspirada en Imagen 1 de Pazu Avatar World) ---------- */
    drawFlowerPendantLamp(ctx, x, topY, petalColor = '#f472b6', centerColor = '#fef08a') {
      ctx.save();
      const sway = Math.sin(this.time * 1.4 + x * 0.01) * 0.03;
      ctx.translate(x, topY);
      ctx.rotate(sway);

      // Cable desde el techo
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 48); ctx.stroke();

      // Haz de luz cálido hacia abajo
      const cone = ctx.createRadialGradient(0, 68, 6, 0, 120, 125);
      cone.addColorStop(0, 'rgba(254, 240, 138, 0.38)');
      cone.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(-28, 56); ctx.lineTo(28, 56); ctx.lineTo(95, 195); ctx.lineTo(-95, 195);
      ctx.closePath();
      ctx.fill();

      // Bombilla brillante inferior
      ctx.beginPath(); ctx.arc(0, 62, 12, 0, TAU);
      fillStroke(ctx, centerColor, 2.2);

      // Pétalos en abanico 2.5D de la pantalla de flor
      for (const dx of [-24, -12, 12, 24]) {
        ctx.beginPath();
        ctx.ellipse(dx, 52, 13, 9, dx * -0.02, 0, TAU);
        fillStroke(ctx, petalColor, 2.2);
      }
      ctx.beginPath(); ctx.ellipse(0, 50, 16, 10, 0, 0, TAU);
      fillStroke(ctx, '#ffffff', 2.2);
      ctx.beginPath(); ctx.arc(0, 42, 6, 0, TAU);
      fillStroke(ctx, centerColor, 2);
      ctx.restore();
    }

    /* ---------- GÓNDOLA DE SUPERMERCADO Y PASTELERÍA (Inspirada en Imagen 1 de Pazu) ---------- */
    drawSupermarketShelves(ctx, x, y) {
      ctx.save();
      ctx.translate(x, y);
      // Mueble estantería alta 2.5D con fondo madera pastel y laterales con volumen
      roundRect(ctx, -104, -118, 214, 210, 18);
      fillStroke(ctx, '#f472b6', 2.8);
      roundRect(ctx, -98, -110, 196, 196, 14);
      fillStroke(ctx, '#fff1f2', 2.4);

      // Cartel superior de la góndola
      roundRect(ctx, -76, -128, 152, 24, 12);
      fillStroke(ctx, '#fef08a', 2.4);
      ctx.fillStyle = OUT;
      ctx.font = '800 12px "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ SÚPER CINNA $1 ★', 0, -112);

      // 3 Repisas repletas de productos detallados
      const shelfYs = [-48, 12, 72];
      for (let sIdx = 0; sIdx < shelfYs.length; sIdx++) {
        const sy = shelfYs[sIdx];
        if (sIdx === 0) {
          // Repisa 1: Cajas de cereales, botellas de leche y frascos de miel
          for (const [bx, col, lbl] of [[-78, '#38bdf8', 'LECHE'], [-40, '#f472b6', 'FRESA'], [0, '#facc15', 'MIEL'], [38, '#a78bfa', 'UVA'], [72, '#4ade80', 'TÉ']]) {
            roundRect(ctx, bx - 13, sy - 38, 26, 38, 5);
            fillStroke(ctx, col, 2);
            roundRect(ctx, bx - 10, sy - 26, 20, 14, 3);
            ctx.fillStyle = '#ffffff'; ctx.fill();
            ctx.fillStyle = OUT; ctx.font = '800 7px "Baloo 2", sans-serif';
            ctx.fillText(lbl, bx, sy - 17);
          }
        } else if (sIdx === 1) {
          // Repisa 2: Frascos de mermelada, galletas y vasos de Boba
          for (const [bx, col] of [[-76, '#fb7185'], [-42, '#fde047'], [-8, '#60a5fa'], [28, '#f9a8d4'], [64, '#34d399']]) {
            roundRect(ctx, bx - 14, sy - 34, 28, 34, 8);
            fillStroke(ctx, 'rgba(255,255,255,0.9)', 2);
            roundRect(ctx, bx - 11, sy - 22, 22, 18, 5);
            ctx.fillStyle = col; ctx.fill();
            roundRect(ctx, bx - 15, sy - 39, 30, 8, 4);
            fillStroke(ctx, col, 1.8);
          }
        } else {
          // Repisa 3: Bolsas de harina, cajas de macarons y jugos
          for (const [bx, col] of [[-74, '#fde68a'], [-34, '#bfdbfe'], [8, '#fbcfe8'], [48, '#ddd6fe'], [78, '#fed7aa']]) {
            roundRect(ctx, bx - 15, sy - 36, 30, 36, 6);
            fillStroke(ctx, col, 2);
            ctx.fillStyle = '#ffffff';
            heartPath(ctx, bx, sy - 18, 5); ctx.fill();
          }
        }
        // Tabla de la repisa + etiquetas de precio
        roundRect(ctx, -96, sy, 192, 9, 4);
        fillStroke(ctx, '#fbcfe8', 2.2);
        for (const px of [-65, 0, 65]) {
          roundRect(ctx, px - 12, sy + 2, 24, 10, 3);
          fillStroke(ctx, '#ffffff', 1.4);
          ctx.fillStyle = '#16a34a'; ctx.font = '800 8px "Baloo 2", sans-serif';
          ctx.fillText('$2', px, sy + 9);
        }
      }
      ctx.restore();
    }

    drawRoomBackdrop(ctx, room, W, H) {
      if (room.beach) { this.drawBeachBackdrop(ctx, room, W, H); return; }
      if (room.outdoor) { this.drawGardenBackdrop(ctx, room, W, H); return; }
      const fy = this.floorY;

      const wallGrad = ctx.createLinearGradient(0, 0, 0, fy);
      wallGrad.addColorStop(0, room.wallTop);
      wallGrad.addColorStop(1, room.wallBottom);
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, W, fy);

      // Papel mural detallado por habitación
      ctx.save();
      if (room.id === 'cafe') {
        ctx.fillStyle = room.stripe;
        for (let x = 0; x < W; x += 52) ctx.fillRect(x, 0, 22, fy - 62);
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        for (let x = 36; x < W; x += 104) for (let y = 110; y < fy - 80; y += 105) { heartPath(ctx, x, y, 6); ctx.fill(); }
      } else if (room.id === 'spa') {
        // Mosaicos de mármol y azulejos relajantes en el Spa
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.14)';
        ctx.lineWidth = 2;
        for (let x = 0; x < W; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, fy - 60); ctx.stroke(); }
        for (let y = 40; y < fy - 60; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      } else {
        ctx.fillStyle = room.stripe;
        for (let x = 30; x < W; x += 90) for (let y = 40; y < fy - 70; y += 80) {
          const ox = (Math.floor(y / 80) % 2) * 45;
          starPath(ctx, x + ox, y, 7); ctx.fill();
        }
      }
      ctx.restore();

      // Zócalo arquitectónico 2.5D con paneles biselados
      ctx.fillStyle = room.wainscot;
      ctx.fillRect(0, fy - 62, W, 62);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      for (let x = 18; x < W; x += 58) {
        roundRect(ctx, x, fy - 50, 40, 38, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(92, 61, 46, 0.14)';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      roundRect(ctx, 0, fy - 66, W, 8, 4);
      fillStroke(ctx, '#ffffff', 2.2);

      // Piso 2.5D: En la Cafetería/Súper combina baldosas cerámicas celestes/blancas con sector de madera cálida (como Imagen 1 Pazu)
      if (room.id === 'cafe') {
        const tileSplitX = 640;
        const tileG = ctx.createLinearGradient(0, fy, 0, H);
        tileG.addColorStop(0, '#e0f2fe');
        tileG.addColorStop(1, '#bae6fd');
        ctx.fillStyle = tileG;
        ctx.fillRect(0, fy, tileSplitX, H - fy);

        // Damero de baldosas en perspectiva
        ctx.save();
        ctx.beginPath(); ctx.rect(0, fy, tileSplitX, H - fy); ctx.clip();
        const rows = 4;
        for (let r = 0; r < rows; r++) {
          const y0 = fy + (r / rows) * (H - fy);
          const y1 = fy + ((r + 1) / rows) * (H - fy);
          for (let c = -2; c < 10; c++) {
            if ((r + c) % 2 === 0) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
              ctx.beginPath();
              ctx.moveTo(c * 75 - r * 18, y0);
              ctx.lineTo((c + 1) * 75 - r * 18, y0);
              ctx.lineTo((c + 1) * 75 - (r + 1) * 18, y1);
              ctx.lineTo(c * 75 - (r + 1) * 18, y1);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
        // Brillo especular diagonal en las baldosas
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(140, fy); ctx.lineTo(220, fy); ctx.lineTo(120, H); ctx.lineTo(40, H); ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Sector derecho de piso de madera cálida (zona Salón de Té)
        const woodG = ctx.createLinearGradient(0, fy, 0, H);
        woodG.addColorStop(0, '#fdebd0');
        woodG.addColorStop(1, '#f5cba7');
        ctx.fillStyle = woodG;
        ctx.fillRect(tileSplitX, fy, W - tileSplitX, H - fy);
        ctx.strokeStyle = 'rgba(92, 61, 46, 0.14)';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 4; i++) {
          const py = fy + i * 38;
          ctx.beginPath(); ctx.moveTo(tileSplitX, py); ctx.lineTo(W, py); ctx.stroke();
        }
        roundRect(ctx, tileSplitX - 4, fy, 8, H - fy, 3);
        fillStroke(ctx, '#fbbf24', 2);
      } else {
        const floorGrad = ctx.createLinearGradient(0, fy, 0, H);
        floorGrad.addColorStop(0, room.floorTop);
        floorGrad.addColorStop(1, room.floorStripe);
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, fy, W, H - fy);
        ctx.strokeStyle = 'rgba(92, 61, 46, 0.09)';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 4; i++) {
          const py = fy + i * 38;
          ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
        }
        for (let i = -6; i <= 6; i++) {
          ctx.beginPath(); ctx.moveTo(W / 2 + i * 60, fy); ctx.lineTo(W / 2 + i * 150, H); ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(92, 61, 46, 0.08)';
      ctx.fillRect(0, fy, W, 9);

      // Ventana panorámica y mobiliario mural según la habitación
      if (room.id === 'cafe') {
        this.drawWindow(ctx, 515, 175, 190, 155);
        this.drawSupermarketShelves(ctx, 215, 200);
        // Pósters promocionales estilo Pazu
        this.drawFrame(ctx, 735, 138, 92, 76, (c) => {
          this.drawCupcake(c, -16, 16, 1.05);
          c.fillStyle = '#db2777'; c.font = '800 11px "Baloo 2", sans-serif'; c.textAlign = 'center';
          c.fillText('2x1', 18, 0);
          c.fillStyle = '#0284c7'; c.font = '800 10px "Baloo 2", sans-serif';
          c.fillText('BOBA', 18, 14);
        });
        this.drawShelf(ctx, 880, 175);
      } else if (room.id === 'spa') {
        this.drawWindow(ctx, 490, 172, 200, 158);
        // Repisa de toallas enrolladas y velas aromáticas en el Spa
        this.drawShelf(ctx, 210, 165);
        this.drawFrame(ctx, 760, 145, 88, 70, (c) => {
          this.drawFlower(c, 0, 2, 12, '#2dd4bf');
        });
      } else {
        this.drawWindow(ctx, 490, 175, 210, 165);
        this.drawFrame(ctx, 250, 140, 90, 72, (c) => { c.fillStyle = '#fef08a'; starPath(c, 0, 0, 22); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke(); });
        this.drawFrame(ctx, 760, 150, 74, 62, (c) => { c.fillStyle = '#f9a8d4'; heartPath(c, 0, 2, 14); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke(); });
      }

      // Guirnalda de banderines festivos
      ctx.save();
      ctx.strokeStyle = 'rgba(92,61,46,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 26);
      ctx.quadraticCurveTo(W / 2, 54, W, 26);
      ctx.stroke();
      const colors = ['#f9a8d4', '#93c5fd', '#fde047', '#c4b5fd', '#86efac'];
      for (let i = 0; i < 13; i++) {
        const t = (i + 0.5) / 13;
        const bx = t * W;
        const by = 26 + 4 * 14 * t * (1 - t) + Math.sin(this.time * 1.5 + i) * 1.5;
        ctx.beginPath(); ctx.moveTo(bx - 15, by); ctx.lineTo(bx + 15, by); ctx.lineTo(bx, by + 22); ctx.closePath();
        fillStroke(ctx, colors[i % colors.length], 1.8);
      }
      ctx.restore();
    }

    drawGardenBackdrop(ctx, room, W, H) {
      const fy = this.floorY;
      const skies = { day: ['#9fd8ff', '#e6f6ff'], sunset: ['#fda4af', '#fde68a'], night: ['#1e1b4b', '#4338ca'] };
      const pair = skies[this.lightingMode] || skies.day;
      const g = ctx.createLinearGradient(0, 0, 0, fy);
      g.addColorStop(0, pair[0]);
      g.addColorStop(1, pair[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, fy);

      // Sol o luna (se toca para cambiar el momento del día)
      const sx = 860, sy = 96;
      if (this.lightingMode === 'night') {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        for (let i = 0; i < 26; i++) {
          const x = (i * 137) % W, y = 20 + ((i * 71) % 240);
          const tw = 0.5 + 0.5 * Math.sin(this.time * 2 + i);
          ctx.globalAlpha = 0.4 + tw * 0.6;
          starPath(ctx, x, y, 3 + (i % 3)); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath(); ctx.arc(sx, sy, 34, 0, TAU); ctx.fill();
        ctx.fillStyle = pair[0];
        ctx.beginPath(); ctx.arc(sx + 14, sy - 8, 30, 0, TAU); ctx.fill();
      } else {
        const glow = ctx.createRadialGradient(sx, sy, 10, sx, sy, 85);
        glow.addColorStop(0, 'rgba(255,240,150,0.85)');
        glow.addColorStop(1, 'rgba(255,240,150,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(sx, sy, 85, 0, TAU); ctx.fill();
        ctx.fillStyle = this.lightingMode === 'sunset' ? '#fb923c' : '#fde047';
        ctx.beginPath(); ctx.arc(sx, sy, 38, 0, TAU); fillStroke(ctx, ctx.fillStyle, 2.6);
        ctx.fillStyle = '#fb7185'; ctx.globalAlpha = 0.55;
        ctx.beginPath(); ctx.ellipse(sx - 18, sy + 4, 6, 3.5, 0, 0, TAU); ctx.ellipse(sx + 18, sy + 4, 6, 3.5, 0, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = OUT;
        ctx.beginPath(); ctx.arc(sx - 11, sy - 4, 3.4, 0, TAU); ctx.arc(sx + 11, sy - 4, 3.4, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(sx, sy + 4, 8, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
      }

      for (let i = 0; i < 3; i++) {
        const cx = ((this.time * (10 + i * 4) + i * 360) % (W + 300)) - 150;
        this.drawCloud(ctx, cx, 70 + i * 60, 0.9 - i * 0.15);
      }

      // Colinas en capas con profundidad
      ctx.fillStyle = this.lightingMode === 'night' ? '#334155' : '#86efac';
      ctx.beginPath(); ctx.moveTo(0, fy - 55);
      ctx.quadraticCurveTo(260, fy - 165, 540, fy - 65);
      ctx.quadraticCurveTo(800, fy - 155, 1000, fy - 75);
      ctx.lineTo(1000, fy); ctx.lineTo(0, fy); ctx.closePath(); ctx.fill();

      ctx.fillStyle = this.lightingMode === 'night' ? '#4c6b8a' : '#b5ecc6';
      ctx.beginPath(); ctx.moveTo(0, fy - 35);
      ctx.quadraticCurveTo(200, fy - 120, 420, fy - 45);
      ctx.quadraticCurveTo(640, fy - 125, 1000, fy - 50);
      ctx.lineTo(1000, fy); ctx.lineTo(0, fy); ctx.closePath(); ctx.fill();

      // Árboles sakura frondosos a los lados
      this.drawSakuraTree(ctx, 75, fy + 6, 1.08);
      this.drawSakuraTree(ctx, 955, fy + 4, 0.94);

      // Cerca blanca con enredaderas florales
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(92,61,46,0.35)';
      ctx.lineWidth = 2;
      roundRect(ctx, 0, fy - 40, W, 9, 4); ctx.fill(); ctx.stroke();
      for (let x = 12; x < W; x += 34) {
        ctx.beginPath();
        ctx.moveTo(x, fy); ctx.lineTo(x, fy - 52); ctx.lineTo(x + 9, fy - 62); ctx.lineTo(x + 18, fy - 52); ctx.lineTo(x + 18, fy);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }

      // Pasto con sendero de piedras y flores
      const fg = ctx.createLinearGradient(0, fy, 0, H);
      fg.addColorStop(0, room.floorTop);
      fg.addColorStop(1, room.floorStripe);
      ctx.fillStyle = fg;
      ctx.fillRect(0, fy, W, H - fy);

      // Sendero de adoquines redondeados
      for (const [sx2, sy2, rx2, ry2] of [[370, fy + 55, 28, 12], [435, fy + 75, 32, 13], [510, fy + 92, 34, 14], [590, fy + 80, 30, 12], [655, fy + 60, 26, 11]]) {
        ctx.beginPath(); ctx.ellipse(sx2, sy2, rx2, ry2, 0.08, 0, TAU);
        fillStroke(ctx, '#f1f5f9', 2);
      }

      for (let i = 0; i < 22; i++) {
        const x = (i * 97 + 40) % W;
        const y = fy + 20 + ((i * 53) % (H - fy - 30));
        ctx.fillStyle = ['#ffffff', '#fbcfe8', '#fef08a'][i % 3];
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * TAU;
          ctx.beginPath(); ctx.arc(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.2, 0, TAU); ctx.fill();
        }
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill();
      }

      // Pétalos cayendo
      ctx.fillStyle = 'rgba(249,168,212,0.88)';
      for (let i = 0; i < 14; i++) {
        const px = (i * 89 + Math.sin(this.time * 0.8 + i) * 40 + this.time * 20) % W;
        const py = (i * 47 + this.time * (26 + i * 2)) % (H - 40);
        ctx.beginPath(); ctx.ellipse(px, py, 5.5, 3.2, this.time + i, 0, TAU); ctx.fill();
      }
    }

    drawBeachBackdrop(ctx, room, W, H) {
      const fy = this.floorY;
      const skies = { day: ['#7dd3fc', '#e0f2fe'], sunset: ['#fb7185', '#fef08a'], night: ['#1e1b4b', '#312e81'] };
      const pair = skies[this.lightingMode] || skies.day;
      const g = ctx.createLinearGradient(0, 0, 0, fy);
      g.addColorStop(0, pair[0]);
      g.addColorStop(1, pair[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, fy);

      const sx = 860, sy = 96;
      ctx.fillStyle = this.lightingMode === 'night' ? '#fef9c3' : (this.lightingMode === 'sunset' ? '#fb923c' : '#fde047');
      ctx.beginPath(); ctx.arc(sx, sy, 38, 0, TAU); fillStroke(ctx, ctx.fillStyle, 2.6);

      for (let i = 0; i < 3; i++) {
        const cx = ((this.time * (12 + i * 4) + i * 340) % (W + 300)) - 150;
        this.drawCloud(ctx, cx, 68 + i * 52, 0.85 - i * 0.12);
      }

      // Isla lejana con Faro y velero navegando
      const seaTop = fy - 96;
      ctx.fillStyle = '#86efac';
      ctx.beginPath(); ctx.arc(170, seaTop + 8, 65, Math.PI, TAU); fillStroke(ctx, '#86efac', 2.2);
      roundRect(ctx, 158, seaTop - 58, 22, 52, 4); fillStroke(ctx, '#ffffff', 2.2);
      ctx.fillStyle = '#ef4444'; ctx.fillRect(160, seaTop - 44, 18, 12); ctx.fillRect(160, seaTop - 22, 18, 12);
      ctx.beginPath(); ctx.arc(169, seaTop - 64, 9, 0, TAU); fillStroke(ctx, '#fde047', 2);

      // Mar turquesa animado con 3 capas de olas
      const seaGrad = ctx.createLinearGradient(0, seaTop, 0, fy);
      seaGrad.addColorStop(0, this.lightingMode === 'night' ? '#1d4ed8' : '#0284c7');
      seaGrad.addColorStop(0.5, this.lightingMode === 'night' ? '#0284c7' : '#38bdf8');
      seaGrad.addColorStop(1, this.lightingMode === 'night' ? '#38bdf8' : '#a5f3fc');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, seaTop, W, 96);

      // Velero animado en el horizonte
      const boatX = 620 + Math.sin(this.time * 0.7) * 45;
      const boatY = seaTop + 22 + Math.sin(this.time * 2.2) * 3;
      ctx.save();
      ctx.translate(boatX, boatY);
      ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.lineTo(14, 10); ctx.lineTo(-14, 10); ctx.closePath();
      fillStroke(ctx, '#f43f5e', 2);
      ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, -34); ctx.lineTo(20, -6); ctx.closePath();
      fillStroke(ctx, '#ffffff', 2);
      ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(-2, -28); ctx.lineTo(-16, -6); ctx.closePath();
      fillStroke(ctx, '#fef08a', 2);
      ctx.restore();

      ctx.strokeStyle = 'rgba(255,255,255,0.88)';
      ctx.lineWidth = 4;
      for (let row = 0; row < 2; row++) {
        const wy = seaTop + 30 + row * 34;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 28) {
          const yOff = Math.sin(this.time * 2.6 + x * 0.03 + row) * 5;
          if (x === 0) ctx.moveTo(x, wy + yOff);
          else ctx.lineTo(x, wy + yOff);
        }
        ctx.stroke();
      }

      // Arena dorada suave con orilla de espuma
      const sandG = ctx.createLinearGradient(0, fy, 0, H);
      sandG.addColorStop(0, '#fef08a');
      sandG.addColorStop(1, '#fde047');
      ctx.fillStyle = sandG;
      ctx.fillRect(0, fy, W, H - fy);

      // Palmera tropical en el extremo izquierdo
      ctx.save();
      ctx.translate(78, fy + 16);
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(8, -80, 22, -165); ctx.lineTo(36, -165); ctx.quadraticCurveTo(22, -80, 8, 0); ctx.closePath();
      fillStroke(ctx, '#b45309', 2.4);
      for (const a of [-2.4, -1.6, -0.7, 0.2, 1.0]) {
        ctx.save(); ctx.translate(28, -165); ctx.rotate(a + Math.sin(this.time * 1.5 + a) * 0.05);
        ctx.beginPath(); ctx.ellipse(32, 0, 36, 11, 0, 0, TAU); fillStroke(ctx, '#22c55e', 2.2);
        ctx.restore();
      }
      for (const [cx2, cy2] of [[22, -158], [34, -156], [28, -148]]) {
        ctx.beginPath(); ctx.arc(cx2, cy2, 7, 0, TAU); fillStroke(ctx, '#78350f', 2);
      }
      ctx.restore();

      for (let i = 0; i < 8; i++) {
        const cx = 75 + i * 120;
        const cy = fy + 24 + (i % 3) * 38;
        ctx.fillStyle = i % 2 === 0 ? '#f9a8d4' : '#fdba74';
        starPath(ctx, cx, cy, 8, 0.45, 5);
        ctx.fill();
      }
    }

    drawCloud(ctx, x, y, s = 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.fillStyle = 'rgba(255,255,255,0.94)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 60, 22, 0, 0, TAU);
      ctx.arc(-24, -12, 24, 0, TAU);
      ctx.arc(14, -20, 30, 0, TAU);
      ctx.arc(42, -6, 18, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    drawSakuraTree(ctx, x, y, s) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-6, -90, -18, -150); ctx.lineTo(12, -150); ctx.quadraticCurveTo(6, -90, 14, 0); ctx.closePath();
      fillStroke(ctx, '#9c6644', 2.6);
      const blobs = [[-50, -170, 46], [10, -200, 54], [60, -160, 44], [-10, -140, 40], [30, -130, 34]];
      for (const [bx, by, r] of blobs) { ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); fillStroke(ctx, '#f9a8d4', 2.4); }
      ctx.fillStyle = '#fbcfe8';
      for (const [bx, by, r] of blobs) { ctx.beginPath(); ctx.arc(bx - r * 0.3, by - r * 0.3, r * 0.42, 0, TAU); ctx.fill(); }
      ctx.restore();
    }

    drawWindow(ctx, winX, winY, winW, winH) {
      ctx.save();
      roundRect(ctx, winX - winW / 2, winY - winH / 2, winW, winH, [80, 80, 18, 18]);
      const skyMap = { day: ['#7dd3fc', '#e0f2fe'], sunset: ['#fda4af', '#fef08a'], night: ['#1e1b4b', '#312e81'] };
      const pair = skyMap[this.lightingMode] || skyMap.day;
      const skyG = ctx.createLinearGradient(0, winY - winH / 2, 0, winY + winH / 2);
      skyG.addColorStop(0, pair[0]);
      skyG.addColorStop(1, pair[1]);
      ctx.fillStyle = skyG;
      ctx.fill();
      ctx.clip();
      if (this.lightingMode === 'night') {
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 8; i++) { starPath(ctx, winX - 80 + i * 24, winY - 50 + ((i * 37) % 70), 3); ctx.fill(); }
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath(); ctx.arc(winX + 45, winY - 30, 22, 0, TAU); ctx.fill();
        ctx.fillStyle = pair[0];
        ctx.beginPath(); ctx.arc(winX + 55, winY - 36, 19, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = this.lightingMode === 'sunset' ? '#fb7185' : '#fde047';
        ctx.beginPath(); ctx.arc(winX + 45, winY - 32, 24, 0, TAU); ctx.fill();
      }
      const cloudOffset = (this.time * 14) % 300;
      this.drawCloud(ctx, winX - 140 + cloudOffset, winY + 30, 0.55);
      ctx.restore();

      ctx.save();
      roundRect(ctx, winX - winW / 2, winY - winH / 2, winW, winH, [80, 80, 18, 18]);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 10; ctx.stroke();
      ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(winX, winY - winH / 2 + 4); ctx.lineTo(winX, winY + winH / 2); ctx.moveTo(winX - winW / 2, winY + 10); ctx.lineTo(winX + winW / 2, winY + 10); ctx.stroke();
      for (const side of [-1, 1]) {
        const cx = winX + side * (winW / 2 + 6);
        ctx.beginPath();
        ctx.moveTo(cx - side * 30, winY - winH / 2 - 14);
        ctx.quadraticCurveTo(cx + side * 26, winY - 20, cx - side * 4, winY + winH / 2 + 10);
        ctx.lineTo(cx + side * 16, winY + winH / 2 + 10);
        ctx.quadraticCurveTo(cx + side * 22, winY - 30, cx + side * 18, winY - winH / 2 - 14);
        ctx.closePath();
        fillStroke(ctx, '#fbcfe8', 2.2);
      }
      roundRect(ctx, winX - winW / 2 - 40, winY - winH / 2 - 22, winW + 80, 12, 6);
      fillStroke(ctx, '#f9a8d4', 2.2);
      //Jardinera con flores bajo la ventana
      roundRect(ctx, winX - winW * 0.42, winY + winH / 2 - 6, winW * 0.84, 18, 8);
      fillStroke(ctx, '#fed7aa', 2.2);
      for (const fx of [-55, -20, 20, 55]) {
        this.drawFlower(ctx, winX + fx, winY + winH / 2 - 8, 6, fx % 40 === 0 ? '#f472b6' : '#60a5fa');
      }
      ctx.restore();
    }

    drawFrame(ctx, x, y, w, h, paint) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(x) * 0.03);
      roundRect(ctx, -w / 2, -h / 2, w, h, 10);
      fillStroke(ctx, '#ffffff', 2.4);
      roundRect(ctx, -w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 6);
      ctx.fillStyle = '#fff7ed';
      ctx.fill();
      paint(ctx);
      ctx.restore();
    }

    drawShelf(ctx, x, y) {
      ctx.save();
      roundRect(ctx, x - 80, y + 18, 160, 10, 5);
      fillStroke(ctx, '#f9a8d4', 2.2);
      const jars = [['#fde68a', -50], ['#bfdbfe', 0], ['#fbcfe8', 50]];
      for (const [c, dx] of jars) {
        roundRect(ctx, x + dx - 16, y - 20, 32, 38, 10);
        fillStroke(ctx, 'rgba(255,255,255,0.9)', 2.2);
        roundRect(ctx, x + dx - 12, y - 6, 24, 20, 6);
        ctx.fillStyle = c; ctx.fill();
        roundRect(ctx, x + dx - 18, y - 26, 36, 9, 4);
        fillStroke(ctx, '#f472b6', 2);
      }
      ctx.restore();
    }

    /* ---------- MUEBLES Y OBJETOS INTERACTIVOS 2.5D HD (Estilo Pazu Avatar World) ---------- */
    drawInteractiveObject(ctx, obj) {
      ctx.save();
      const x = obj.x;
      const drop = obj.drop > 0 ? -Math.pow(obj.drop, 2) * 220 : 0;
      const wig = obj.wiggle > 0 ? Math.sin(obj.wiggle * 18) * obj.wiggle * 0.06 : 0;
      const y = obj.y;

      // Sombra de contacto realista con gradiente suave
      ctx.fillStyle = 'rgba(71, 85, 105, 0.18)';
      ctx.beginPath();
      ctx.ellipse(x, y + 5, obj.w * 0.48 * (1 - (obj.drop || 0) * 0.5), 14, 0, 0, TAU);
      ctx.fill();

      ctx.translate(x, y + drop);
      ctx.rotate(wig);
      ctx.translate(-x, -y);

      ctx.lineWidth = 2.8;
      ctx.strokeStyle = OUT;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      if (obj.type === 'oven') {
        // Horno de Chef Pastelero 2.5D con campana extractora, tetera, reloj digital y puerta de vidrio
        roundRect(ctx, x - 66, y - 126, 132, 126, 22); fillStroke(ctx, '#fbcfe8', 2.8);
        // Lateral 2.5D
        roundRect(ctx, x - 60, y - 120, 120, 114, 18); fillStroke(ctx, '#fce7f3', 2);
        // Panel de control superior con reloj digital y perillas
        roundRect(ctx, x - 54, y - 114, 108, 22, 8); fillStroke(ctx, '#ffffff', 2.2);
        roundRect(ctx, x - 18, y - 110, 36, 14, 4); fillStroke(ctx, '#0f172a', 1.6);
        ctx.fillStyle = '#4ade80'; ctx.font = '800 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText(obj.state ? '350°' : '12:00', x, y - 100);
        for (const dx of [-38, 38]) {
          ctx.beginPath(); ctx.arc(x + dx, y - 103, 5.5, 0, TAU); fillStroke(ctx, '#f472b6', 1.8);
        }
        // Tetera sobre las hornillas
        this.drawTeapot(ctx, x - 26, y - 126, 0.68);
        // Ventana del horno con reflejo de cristal y luz interior
        roundRect(ctx, x - 48, y - 84, 96, 60, 14);
        fillStroke(ctx, obj.state ? '#fde68a' : '#1e293b', 2.8);
        if (obj.state) {
          const glow = ctx.createRadialGradient(x, y - 54, 4, x, y - 54, 52);
          glow.addColorStop(0, 'rgba(251,191,36,0.85)'); glow.addColorStop(1, 'rgba(251,191,36,0)');
          ctx.fillStyle = glow; ctx.fillRect(x - 48, y - 84, 96, 60);
        }
        // Rejilla interior y rollito horneándose
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 42, y - 42); ctx.lineTo(x + 42, y - 42); ctx.stroke();
        this.drawRoll(ctx, x - 14, y - 48, obj.state ? 1.05 + Math.sin(this.time * 6) * 0.06 : 0.95);
        this.drawCupcake(ctx, x + 18, y - 44, 0.72);
        // Manilla cromada
        roundRect(ctx, x - 36, y - 78, 72, 6, 3); fillStroke(ctx, '#ffffff', 1.8);

      } else if (obj.type === 'counter') {
        // MOSTRADOR HELADERÍA + CAJA REGISTRADORA $2.00 + FREEZER CON HIELOS (Inspirado en Imagen 1 de Pazu Avatar World)
        // Base del mostrador 2.5D
        roundRect(ctx, x - 98, y - 98, 196, 98, 20); fillStroke(ctx, '#ffffff', 2.8);
        roundRect(ctx, x - 92, y - 90, 74, 82, 12); fillStroke(ctx, '#fce7f3', 2);

        // Cubículo inferior izquierdo con Bolsas de Regalo con moño (igual a Imagen 1 Pazu)
        for (const [bx, col] of [[x - 72, '#f472b6'], [x - 42, '#38bdf8']]) {
          roundRect(ctx, bx - 11, y - 48, 22, 32, 4); fillStroke(ctx, col, 1.8);
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(bx, y - 48, 5, Math.PI, TAU); ctx.stroke();
          this.drawBowShape(ctx, bx, y - 34, 0.25, '#fef08a');
        }

        // Mesón superior rosa brillante
        roundRect(ctx, x - 102, y - 104, 204, 18, 9); fillStroke(ctx, '#f472b6', 2.8);

        // Caja Registradora Electrónica con pantalla verde "$2.00" y lector de tarjetas (sobre el lado izquierdo)
        roundRect(ctx, x - 86, y - 134, 54, 32, 8); fillStroke(ctx, '#e2e8f0', 2.4);
        roundRect(ctx, x - 80, y - 150, 42, 18, 5); fillStroke(ctx, '#0f172a', 2.2);
        ctx.fillStyle = '#4ade80';
        ctx.font = '800 11px "Baloo 2", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('$2.00', x - 59, y - 137);
        // Teclas de la caja + ticket blanco saliendo
        for (let kx = 0; kx < 3; kx++) {
          roundRect(ctx, x - 78 + kx * 13, y - 122, 9, 7, 2); fillStroke(ctx, ['#f43f5e', '#facc15', '#38bdf8'][kx], 1.4);
        }
        // Lector POS de tarjeta al lado de la caja
        roundRect(ctx, x - 26, y - 124, 16, 22, 4); fillStroke(ctx, '#38bdf8', 1.8);

        // Vitrina Freezer Refrigerada derecha con cubitos de hielo translúcidos, paletas, conos y Boba Tea
        roundRect(ctx, x - 12, y - 86, 102, 76, 14); fillStroke(ctx, '#e0f2fe', 2.4);
        // Cama de cubitos de hielo brillantes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let ix = 0; ix < 6; ix++) {
          roundRect(ctx, x - 6 + ix * 15, y - 34 + (ix % 2) * 3, 13, 11, 3);
          ctx.fill();
          ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 1.4; ctx.stroke();
        }
        // Paletas heladas de colores, cono soft-serve y cupcake en la vitrina
        for (const [px, col] of [[x + 6, '#f43f5e'], [x + 26, '#a3e635'], [x + 46, '#fb923c']]) {
          roundRect(ctx, px - 2, y - 42, 4, 12, 2); fillStroke(ctx, '#fde68a', 1.4);
          roundRect(ctx, px - 7, y - 64, 14, 24, 7); fillStroke(ctx, col, 2);
          ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(px - 4, y - 60, 3, 14);
        }
        this.drawCupcake(ctx, x + 72, y - 46, 0.78);
        // Brillo diagonal del cristal de la vitrina
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x - 2, y - 78); ctx.lineTo(x + 16, y - 52); ctx.moveTo(x + 12, y - 78); ctx.lineTo(x + 26, y - 58); ctx.stroke();

      } else if (obj.type === 'tea_table') {
        // Juego de Comedor & Salón de Té con 2 sillas acolchadas y mantel de encaje
        for (const side of [-1, 1]) {
          const cx = x + side * 62;
          roundRect(ctx, cx - 18, y - 82, 36, 46, 14); fillStroke(ctx, '#fbcfe8', 2.4);
          roundRect(ctx, cx - 20, y - 42, 40, 12, 6); fillStroke(ctx, '#f472b6', 2.2);
          roundRect(ctx, cx - 14, y - 30, 6, 26, 3); fillStroke(ctx, '#e59866', 2);
          roundRect(ctx, cx + 8, y - 30, 6, 26, 3); fillStroke(ctx, '#e59866', 2);
        }
        roundRect(ctx, x - 9, y - 56, 18, 52, 5); fillStroke(ctx, '#e59866', 2.6);
        roundRect(ctx, x - 34, y - 8, 68, 9, 4); fillStroke(ctx, '#e59866', 2.4);
        ctx.beginPath(); ctx.ellipse(x, y - 58, 84, 26, 0, 0, TAU); fillStroke(ctx, '#fff1f2', 2.8);
        ctx.beginPath(); ctx.ellipse(x, y - 60, 72, 18, 0, 0, TAU); ctx.strokeStyle = '#f9a8d4'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
        this.drawTeapot(ctx, x - 38, y - 62, 0.78);
        this.drawCakeSlice(ctx, x + 2, y - 60, 0.85);
        this.drawTeacup(ctx, x + 42, y - 62, 0.82);

      } else if (obj.type === 'cloud_bed') {
        // Cama Real con Dosel de Nubes 2.5D, respaldo capitoné, 3 almohadas y peluche
        // Cortinas de dosel translúcidas detrás
        ctx.save();
        ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
        ctx.beginPath();
        ctx.moveTo(x - 95, y - 145); ctx.quadraticCurveTo(x - 115, y - 80, x - 105, y - 20);
        ctx.lineTo(x - 65, y - 20); ctx.quadraticCurveTo(x - 75, y - 85, x, y - 140);
        ctx.quadraticCurveTo(x + 75, y - 85, x + 65, y - 20);
        ctx.lineTo(x + 105, y - 20); ctx.quadraticCurveTo(x + 115, y - 80, x + 95, y - 145);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // Corona del dosel
        roundRect(ctx, x - 48, y - 154, 96, 16, 8); fillStroke(ctx, '#fde047', 2.4);
        // Respaldo nube capitoné
        roundRect(ctx, x - 112, y - 114, 224, 74, 36); fillStroke(ctx, '#ffffff', 2.8);
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x - 80 + i * 52, y - 114, 22, Math.PI, TAU); fillStroke(ctx, '#ffffff', 2.6); }
        // Base y colchón acolchado
        roundRect(ctx, x - 110, y - 68, 220, 68, 24); fillStroke(ctx, '#bae6fd', 2.8);
        roundRect(ctx, x - 62, y - 64, 170, 62, 22); fillStroke(ctx, '#f9a8d4', 2.8);
        // Costuras del acolchado y estrellas bordadas
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        for (let i = 0; i < 4; i++) { starPath(ctx, x - 26 + i * 36, y - 34 + (i % 2) * 10, 6.5); ctx.fill(); }
        // Almohadas mullidas
        roundRect(ctx, x - 98, y - 82, 56, 36, 16); fillStroke(ctx, '#fef9c3', 2.6);
        roundRect(ctx, x - 64, y - 78, 46, 32, 14); fillStroke(ctx, '#e0f2fe', 2.4);

      } else if (obj.type === 'vanity') {
        // Tocador Hollywood 2.5D con focos luminosos, perfumes y taburete acolchado
        ctx.beginPath(); ctx.ellipse(x, y - 94, 48, 54, 0, 0, TAU); fillStroke(ctx, '#f5d0fe', 2.8);
        ctx.beginPath(); ctx.ellipse(x, y - 94, 37, 43, 0, 0, TAU);
        const mg = ctx.createLinearGradient(x - 30, y - 130, x + 30, y - 50);
        mg.addColorStop(0, '#f0f9ff'); mg.addColorStop(1, '#bae6fd');
        ctx.fillStyle = mg; ctx.fill();
        // Focos Hollywood alrededor del espejo
        for (let i = 0; i < 7; i++) {
          const a = Math.PI * 0.8 + (i / 6) * Math.PI * 1.4;
          const bx = x + Math.cos(a) * 43;
          const by = y - 94 + Math.sin(a) * 48;
          ctx.beginPath(); ctx.arc(bx, by, 4.5, 0, TAU);
          fillStroke(ctx, '#fef08a', 1.6);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x - 16, y - 112); ctx.lineTo(x - 4, y - 124); ctx.moveTo(x - 18, y - 98); ctx.lineTo(x + 4, y - 120); ctx.stroke();
        this.drawBowShape(ctx, x, y - 148, 0.9, '#f472b6');
        roundRect(ctx, x - 64, y - 54, 128, 54, 14); fillStroke(ctx, '#ffffff', 2.8);
        roundRect(ctx, x - 52, y - 40, 104, 14, 7); fillStroke(ctx, '#fbcfe8', 2);
        // Frasco de perfume con atomizador + labial
        roundRect(ctx, x - 48, y - 72, 16, 18, 5); fillStroke(ctx, '#38bdf8', 2);
        ctx.beginPath(); ctx.arc(x - 40, y - 76, 4, 0, TAU); fillStroke(ctx, '#fde047', 1.6);
        this.drawLipstick(ctx, x - 22, y - 54, 0.82);
        this.drawHanger(ctx, x + 32, y - 54, 0.72);

      } else if (obj.type === 'moon_lamp') {
        roundRect(ctx, x - 22, y - 10, 44, 10, 5); fillStroke(ctx, '#e9d5ff', 2.4);
        ctx.strokeStyle = OUT; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y - 90); ctx.stroke();
        if (obj.state) {
          const glow = ctx.createRadialGradient(x, y - 110, 6, x, y - 110, 75);
          glow.addColorStop(0, 'rgba(254, 240, 138, 0.85)'); glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y - 110, 75, 0, TAU); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(x, y - 110, 24, 0, TAU); fillStroke(ctx, obj.state ? '#fde047' : '#fef9c3', 2.8);
        ctx.fillStyle = 'rgba(250,204,21,0.45)';
        ctx.beginPath(); ctx.arc(x - 8, y - 116, 5, 0, TAU); ctx.arc(x + 8, y - 102, 4, 0, TAU); ctx.fill();

      } else if (obj.type === 'swing') {
        ctx.save();
        roundRect(ctx, x - 72, y - 178, 144, 14, 7); fillStroke(ctx, '#b07a4a', 2.6);
        ctx.translate(x, y - 165);
        ctx.rotate(obj.swingAngle || 0);
        ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(-42, 0); ctx.lineTo(-42, 135); ctx.moveTo(42, 0); ctx.lineTo(42, 135); ctx.stroke();
        for (let i = 0; i < 4; i++) { this.drawFlower(ctx, -42, 20 + i * 32, 5.5, '#fbcfe8'); this.drawFlower(ctx, 42, 34 + i * 32, 5.5, '#fbcfe8'); }
        roundRect(ctx, -56, 128, 112, 20, 10); fillStroke(ctx, '#fdebd0', 2.8);
        roundRect(ctx, -48, 122, 96, 10, 5); fillStroke(ctx, '#f9a8d4', 2);
        ctx.restore();

      } else if (obj.type === 'fountain') {
        ctx.beginPath(); ctx.ellipse(x, y - 18, 86, 30, 0, 0, TAU); fillStroke(ctx, '#ffffff', 2.8);
        ctx.beginPath(); ctx.ellipse(x, y - 20, 74, 22, 0, 0, TAU); ctx.fillStyle = '#38bdf8'; ctx.fill();
        // Nenúfares flotantes
        for (const lx of [-42, 38]) {
          ctx.beginPath(); ctx.ellipse(x + lx, y - 16, 10, 5, 0, 0, TAU); fillStroke(ctx, '#4ade80', 1.6);
          this.drawFlower(ctx, x + lx, y - 19, 3.5, '#f9a8d4');
        }
        roundRect(ctx, x - 12, y - 64, 24, 44, 6); fillStroke(ctx, '#ffffff', 2.4);
        ctx.beginPath(); ctx.ellipse(x, y - 64, 34, 11, 0, 0, TAU); fillStroke(ctx, '#ffffff', 2.4);
        // Estatua superior de Cinnamoroll dorado
        ctx.beginPath(); ctx.arc(x, y - 78, 11, 0, TAU); fillStroke(ctx, '#fef08a', 2);
        if (obj.state) {
          const jetH = 40 + Math.sin(this.time * 6) * 8;
          ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(x, y - 82); ctx.quadraticCurveTo(x - 24, y - 82 - jetH, x - 50, y - 22);
          ctx.moveTo(x, y - 82); ctx.quadraticCurveTo(x + 24, y - 82 - jetH, x + 50, y - 22);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.92)';
          for (let i = 0; i < 5; i++) {
            const t = (this.time * 1.4 + i / 5) % 1;
            ctx.beginPath(); ctx.arc(x + (i - 2) * 22 * t, y - 82 - Math.sin(t * Math.PI) * jetH, 3.2, 0, TAU); ctx.fill();
          }
        }

      } else if (obj.type === 'stage') {
        // Escenario Musical con parlantes laterales y luces de concierto
        ctx.beginPath(); ctx.ellipse(x, y - 16, 98, 34, 0, 0, TAU); fillStroke(ctx, '#f5d0fe', 2.8);
        ctx.beginPath(); ctx.ellipse(x, y - 24, 84, 25, 0, 0, TAU); fillStroke(ctx, '#fdf4ff', 2.8);
        for (const side of [-1, 1]) {
          roundRect(ctx, x + side * 74 - 14, y - 68, 28, 46, 7); fillStroke(ctx, '#334155', 2.2);
          ctx.beginPath(); ctx.arc(x + side * 74, y - 38, 8, 0, TAU); fillStroke(ctx, '#38bdf8', 1.8);
          ctx.beginPath(); ctx.arc(x + side * 74, y - 55, 5, 0, TAU); fillStroke(ctx, '#f472b6', 1.6);
          ctx.fillStyle = '#fde047';
          starPath(ctx, x + side * 48, y - 26, 9 + Math.sin(this.time * 4 + side) * 1.5); fillStroke(ctx, '#fde047', 2);
        }
        this.drawMic(ctx, x, y - 30, 0.95);
        if (obj.state) {
          ctx.globalAlpha = 0.35 + 0.15 * Math.sin(this.time * 5);
          ctx.fillStyle = '#fef08a';
          ctx.beginPath(); ctx.moveTo(x - 20, y - 200); ctx.lineTo(x + 20, y - 200); ctx.lineTo(x + 90, y - 24); ctx.lineTo(x - 90, y - 24); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
        }

      } else if (obj.type === 'rug') {
        ctx.beginPath(); ctx.ellipse(x, y - 6, 114, 30, 0, 0, TAU); fillStroke(ctx, '#fbcfe8', 2.8);
        ctx.beginPath(); ctx.ellipse(x, y - 6, 95, 21, 0, 0, TAU); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.setLineDash([8, 7]); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#f9a8d4'; heartPath(ctx, x, y - 8, 10); ctx.fill();

      } else if (obj.type === 'music_box') {
        // Rockola Wurlitzer Kawaii con arco de neón y vinilo giratorio
        roundRect(ctx, x - 40, y - 98, 80, 98, [40, 40, 14, 14]); fillStroke(ctx, '#c4b5fd', 2.8);
        roundRect(ctx, x - 32, y - 90, 64, 82, [32, 32, 10, 10]); fillStroke(ctx, '#ede9fe', 2.2);
        const pulse = obj.state ? 1 + Math.sin(this.time * 10) * 0.12 : 1;
        ctx.beginPath(); ctx.arc(x, y - 54, 20 * pulse, 0, TAU); fillStroke(ctx, '#1e293b', 2.2);
        ctx.beginPath(); ctx.arc(x, y - 54, 7 * pulse, 0, TAU); fillStroke(ctx, '#f472b6', 1.8);
        for (let i = 0; i < 4; i++) {
          roundRect(ctx, x - 24 + i * 13, y - 24, 9, 12, 3);
          fillStroke(ctx, obj.state && i === Math.floor(this.time * 5) % 4 ? '#fde047' : '#38bdf8', 1.6);
        }

      } else if (obj.type === 'mixer') {
        // Estación Batidora de Recetas Mágicas con mesón, bolsa de harina y bowl de cristal
        roundRect(ctx, x - 42, y - 48, 84, 48, 12); fillStroke(ctx, '#fff1f2', 2.6);
        roundRect(ctx, x - 46, y - 54, 92, 12, 6); fillStroke(ctx, '#f9a8d4', 2.4);
        // Bolsa de harina al lado
        roundRect(ctx, x - 38, y - 82, 24, 28, 6); fillStroke(ctx, '#fef3c7', 2);
        // Base y brazo de la batidora KitchenAid kawaii
        roundRect(ctx, x - 6, y - 62, 44, 10, 5); fillStroke(ctx, '#f472b6', 2.4);
        ctx.beginPath(); ctx.arc(x + 8, y - 72, 16, 0, Math.PI); fillStroke(ctx, '#bae6fd', 2.4);
        roundRect(ctx, x - 4, y - 102, 42, 18, 9); fillStroke(ctx, '#f472b6', 2.4);
        ctx.fillStyle = '#fde047'; starPath(ctx, x + 16, y - 93, 6); ctx.fill();

      } else if (obj.type === 'sand_castle') {
        // Gran Castillo de Arena de 3 Torres con banderines, conchitas, balde y pala
        for (const side of [-1, 1]) {
          roundRect(ctx, x + side * 46 - 16, y - 64, 32, 60, 6); fillStroke(ctx, '#fde047', 2.4);
          ctx.beginPath();
          ctx.moveTo(x + side * 46 - 20, y - 64); ctx.lineTo(x + side * 46, y - 88); ctx.lineTo(x + side * 46 + 20, y - 64);
          ctx.closePath(); fillStroke(ctx, '#38bdf8', 2.2);
        }
        roundRect(ctx, x - 42, y - 52, 84, 52, 8); fillStroke(ctx, '#fde047', 2.6);
        roundRect(ctx, x - 28, y - 92, 56, 44, 8); fillStroke(ctx, '#fef08a', 2.6);
        ctx.beginPath(); ctx.moveTo(x - 34, y - 92); ctx.lineTo(x, y - 122); ctx.lineTo(x + 34, y - 92); ctx.closePath(); fillStroke(ctx, '#f472b6', 2.4);
        // Bandera en la punta
        ctx.strokeStyle = OUT; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(x, y - 122); ctx.lineTo(x, y - 140); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - 140); ctx.lineTo(x + 18, y - 134); ctx.lineTo(x, y - 128); ctx.closePath(); fillStroke(ctx, '#fbbf24', 1.8);
        // Puerta y balde playero
        ctx.beginPath(); ctx.arc(x, y - 4, 15, Math.PI, TAU); fillStroke(ctx, '#b45309', 2.2);
        roundRect(ctx, x + 56, y - 24, 22, 22, 4); fillStroke(ctx, '#f43f5e', 2);

      } else if (obj.type === 'ice_cream_cart') {
        // Carrito Heladero Retro con vitrina de hielo, paletas, toldo festoneado y ruedas con rayos
        roundRect(ctx, x - 76, y - 88, 152, 70, 16); fillStroke(ctx, '#fff1f2', 2.8);
        // Vitrina con hielos y paletas
        roundRect(ctx, x - 64, y - 80, 128, 36, 10); fillStroke(ctx, '#e0f2fe', 2.2);
        for (const [px, col] of [[-40, '#f43f5e'], [-14, '#fde047'], [14, '#a855f7'], [40, '#4ade80']]) {
          roundRect(ctx, x + px - 7, y - 74, 14, 22, 7); fillStroke(ctx, col, 1.8);
        }
        // Postes y toldo a rayas
        ctx.strokeStyle = OUT; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x - 64, y - 88); ctx.lineTo(x - 64, y - 128); ctx.moveTo(x + 64, y - 88); ctx.lineTo(x + 64, y - 128); ctx.stroke();
        for (let k = -3; k <= 3; k++) {
          roundRect(ctx, x + k * 22 - 11, y - 136, 22, 24, [8, 8, 10, 10]);
          fillStroke(ctx, k % 2 === 0 ? '#f472b6' : '#ffffff', 2);
        }
        for (const wx of [-44, 44]) {
          ctx.beginPath(); ctx.arc(x + wx, y - 14, 19, 0, TAU); fillStroke(ctx, '#fde047', 2.6);
          ctx.beginPath(); ctx.arc(x + wx, y - 14, 7, 0, TAU); fillStroke(ctx, '#ffffff', 2);
        }
        this.drawCupcake(ctx, x, y - 42, 0.95);

      } else if (obj.type === 'beach_lounger') {
        // Reposera con sombrilla a rayas y coco tropical con bombilla
        roundRect(ctx, x - 78, y - 34, 156, 26, 12); fillStroke(ctx, '#7dd3fc', 2.8);
        roundRect(ctx, x - 72, y - 52, 46, 24, 10); fillStroke(ctx, '#fef08a', 2.4);
        ctx.strokeStyle = OUT; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x + 30, y - 34); ctx.lineTo(x + 44, y - 130); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 44, y - 124, 58, Math.PI, TAU); fillStroke(ctx, '#f472b6', 2.6);
        // Coco con bombilla al lado
        ctx.beginPath(); ctx.arc(x + 62, y - 40, 11, 0, TAU); fillStroke(ctx, '#16a34a', 2);
        ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(x + 62, y - 48); ctx.lineTo(x + 70, y - 58); ctx.stroke();

      } else if (obj.type === 'surf_board') {
        ctx.beginPath(); ctx.ellipse(x, y - 16, 62, 20, -0.08, 0, TAU); fillStroke(ctx, '#38bdf8', 2.6);
        ctx.beginPath(); ctx.ellipse(x, y - 16, 48, 8, -0.08, 0, TAU); fillStroke(ctx, '#fef08a', 1.8);
        ctx.fillStyle = '#f472b6'; starPath(ctx, x, y - 16, 10); ctx.fill();

      } else if (obj.type === 'bubble_tub') {
        // Jacuzzi de Burbujas 2.5D con grifo cisne dorado, patito de hule y botellas de champú
        for (let i = -3; i <= 3; i++) {
          const by = y - 70 - Math.abs(Math.sin(this.time * 2.2 + i)) * 11;
          ctx.beginPath(); ctx.arc(x + i * 22, by, 17, 0, TAU); fillStroke(ctx, '#e0f2fe', 2);
        }
        // Patito de hule flotando en la espuma
        const duckY = y - 74 + Math.sin(this.time * 3) * 2.5;
        ctx.beginPath(); ctx.ellipse(x - 28, duckY, 11, 8, 0, 0, TAU); fillStroke(ctx, '#facc15', 2);
        ctx.beginPath(); ctx.arc(x - 21, duckY - 8, 7, 0, TAU); fillStroke(ctx, '#facc15', 2);
        ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.ellipse(x - 14, duckY - 7, 4, 2.2, 0, 0, TAU); ctx.fill();
        // Grifo dorado
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x + 72, y - 68); ctx.quadraticCurveTo(x + 72, y - 98, x + 54, y - 88); ctx.stroke();
        roundRect(ctx, x - 94, y - 64, 188, 58, 28); fillStroke(ctx, '#ffffff', 2.8);
        roundRect(ctx, x - 100, y - 72, 200, 16, 8); fillStroke(ctx, '#99f6e4', 2.4);
        // Escalón de madera de spa
        roundRect(ctx, x - 36, y - 10, 72, 12, 5); fillStroke(ctx, '#fed7aa', 2.2);

      } else if (obj.type === 'pet_house') {
        // Mansión de Mascotas con Perrito Animado asomándose, plato de comida y huesito
        roundRect(ctx, x - 62, y - 82, 124, 82, 16); fillStroke(ctx, '#dcfce7', 2.8);
        ctx.beginPath(); ctx.moveTo(x - 74, y - 76); ctx.lineTo(x, y - 128); ctx.lineTo(x + 74, y - 76); ctx.closePath(); fillStroke(ctx, '#f9a8d4', 2.8);
        ctx.beginPath(); ctx.arc(x, y - 28, 28, Math.PI, TAU); fillStroke(ctx, '#1e293b', 2.4);
        ctx.fillStyle = '#f472b6'; heartPath(ctx, x, y - 96, 10); ctx.fill();

        // ¡Perrito bebé animado asomándose en la puerta!
        const pupBob = Math.sin(this.time * 3.5) * 2.5;
        const py = y - 18 + pupBob;
        ctx.beginPath(); ctx.ellipse(x - 16, py - 12, 7, 13, 0.35 + Math.sin(this.time * 4) * 0.1, 0, TAU); fillStroke(ctx, '#fde68a', 2);
        ctx.beginPath(); ctx.ellipse(x + 16, py - 12, 7, 13, -0.35 - Math.sin(this.time * 4) * 0.1, 0, TAU); fillStroke(ctx, '#fde68a', 2);
        ctx.beginPath(); ctx.ellipse(x, py - 12, 16, 13, 0, 0, TAU); fillStroke(ctx, '#fef9c3', 2.2);
        ctx.fillStyle = OUT;
        ctx.beginPath(); ctx.arc(x - 6, py - 13, 2.4, 0, TAU); ctx.arc(x + 6, py - 13, 2.4, 0, TAU); ctx.fill();
        ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.arc(x, py - 9, 2.5, 0, TAU); ctx.fill();
        // Platito de mascota al costado
        ctx.beginPath(); ctx.ellipse(x + 48, y - 6, 15, 7, 0, 0, TAU); fillStroke(ctx, '#38bdf8', 2);
      } else {
        this.drawDecorShape(ctx, obj.type, x, y, obj.state);
      }

      // Brillito de invitación
      if (obj.ping > 0) {
        const t = 1 - obj.ping;
        ctx.globalAlpha = Math.sin(obj.ping * Math.PI);
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 3; i++) {
          const a = t * 3 + (i * TAU) / 3;
          starPath(ctx, x + Math.cos(a) * (obj.w * 0.45), y - obj.h * 0.75 + Math.sin(a) * 18, 7, 0.4, 4);
          ctx.fill();
          ctx.strokeStyle = 'rgba(236,72,153,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }

    // Objetos del baúl de juguetes (también usados en las miniaturas)
    drawDecorShape(ctx, type, x, y, on = true) {
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (type === 'cake_stand') {
        ctx.beginPath(); ctx.ellipse(x, y - 6, 34, 9, 0, 0, TAU); fillStroke(ctx, '#ffffff', 2.4);
        roundRect(ctx, x - 4, y - 18, 8, 12, 3); fillStroke(ctx, '#ffffff', 2);
        roundRect(ctx, x - 28, y - 48, 56, 30, 10); fillStroke(ctx, '#fbcfe8', 2.6);
        ctx.beginPath();
        ctx.moveTo(x - 28, y - 38);
        for (let i = 0; i <= 7; i++) ctx.quadraticCurveTo(x - 28 + i * 8 - 4, y - 30 + (i % 2) * 4, x - 28 + i * 8, y - 38);
        ctx.lineTo(x + 28, y - 44); ctx.lineTo(x - 28, y - 44); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
        roundRect(ctx, x - 28, y - 48, 56, 30, 10); ctx.lineWidth = 2.6; ctx.strokeStyle = OUT; ctx.stroke();
        this.drawStrawberry(ctx, x, y - 50, 0.8);
      } else if (type === 'plush_bunny') {
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * 10, y - 52, 7, 16, s * 0.2, 0, TAU); fillStroke(ctx, '#fce7f3', 2.4); }
        ctx.beginPath(); ctx.ellipse(x, y - 16, 20, 16, 0, 0, TAU); fillStroke(ctx, '#fce7f3', 2.4);
        ctx.beginPath(); ctx.arc(x, y - 36, 16, 0, TAU); fillStroke(ctx, '#fce7f3', 2.4);
        ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(x - 6, y - 38, 2.4, 0, TAU); ctx.arc(x + 6, y - 38, 2.4, 0, TAU); ctx.fill();
        ctx.fillStyle = '#f9a8d4'; ctx.beginPath(); ctx.arc(x, y - 32, 2.2, 0, TAU); ctx.fill();
        this.drawBowShape(ctx, x, y - 22, 0.45, '#60a5fa');
      } else if (type === 'plant_pot') {
        for (const [dx, h, a] of [[-12, 44, -0.4], [0, 58, 0], [12, 46, 0.4]]) {
          ctx.save(); ctx.translate(x + dx * 0.4, y - 30); ctx.rotate(a);
          ctx.beginPath(); ctx.ellipse(0, -h / 2, 9, h / 2, 0, 0, TAU); fillStroke(ctx, '#86efac', 2.2);
          ctx.restore();
        }
        this.drawFlower(ctx, x, y - 82, 8, '#f9a8d4');
        ctx.beginPath(); ctx.moveTo(x - 24, y - 32); ctx.lineTo(x + 24, y - 32); ctx.lineTo(x + 18, y); ctx.lineTo(x - 18, y); ctx.closePath(); fillStroke(ctx, '#fda4af', 2.6);
        roundRect(ctx, x - 27, y - 38, 54, 10, 5); fillStroke(ctx, '#fb7185', 2.2);
      } else if (type === 'star_cushion') {
        ctx.fillStyle = '#fde68a';
        starPath(ctx, x, y - 24, 36, 0.55); fillStroke(ctx, '#fde68a', 2.6);
        ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(x - 8, y - 26, 2.4, 0, TAU); ctx.arc(x + 8, y - 26, 2.4, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y - 22, 5, 0.2 * Math.PI, 0.8 * Math.PI); ctx.lineWidth = 2; ctx.stroke();
      } else if (type === 'tea_set') {
        roundRect(ctx, x - 32, y - 8, 64, 8, 4); fillStroke(ctx, '#ffffff', 2.2);
        this.drawTeapot(ctx, x - 8, y - 8, 1);
        this.drawTeacup(ctx, x + 22, y - 8, 0.6);
      } else if (type === 'fairy_lamp') {
        if (on) {
          const glow = ctx.createRadialGradient(x, y - 64, 4, x, y - 64, 54);
          glow.addColorStop(0, 'rgba(253, 224, 71, 0.75)'); glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y - 64, 54, 0, TAU); ctx.fill();
        }
        roundRect(ctx, x - 16, y - 8, 32, 8, 4); fillStroke(ctx, '#c4b5fd', 2.2);
        ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y - 40); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 20, y - 44); ctx.lineTo(x + 20, y - 44); ctx.lineTo(x + 14, y - 86); ctx.lineTo(x - 14, y - 86); ctx.closePath();
        fillStroke(ctx, on ? '#fef9c3' : '#f1f5f9', 2.6);
        roundRect(ctx, x - 18, y - 92, 36, 8, 4); fillStroke(ctx, '#f9a8d4', 2.2);
        ctx.fillStyle = on ? '#fbbf24' : '#cbd5e1'; starPath(ctx, x, y - 64, 8); ctx.fill();
      } else if (type === 'gift_box') {
        roundRect(ctx, x - 26, y - 44, 52, 44, 6); fillStroke(ctx, '#c4b5fd', 2.6);
        roundRect(ctx, x - 30, y - 54, 60, 14, 5); fillStroke(ctx, '#ddd6fe', 2.4);
        ctx.fillStyle = '#f472b6'; ctx.fillRect(x - 5, y - 54, 10, 54);
        ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.strokeRect(x - 5, y - 54, 10, 54);
        this.drawBowShape(ctx, x, y - 58, 0.7, '#f472b6');
      } else if (type === 'balloon_bunch') {
        const cols = ['#f9a8d4', '#93c5fd', '#fde047'];
        const pos = [[-18, -88], [16, -96], [0, -66]];
        ctx.strokeStyle = OUT; ctx.lineWidth = 1.6;
        for (const [dx, dy] of pos) { ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.quadraticCurveTo(x + dx * 0.4, y + dy * 0.4, x + dx, y + dy + 16); ctx.stroke(); }
        pos.forEach(([dx, dy], i) => {
          const sway = Math.sin(this.time * 1.6 + i) * 2;
          ctx.beginPath(); ctx.ellipse(x + dx + sway, y + dy, 15, 18, 0, 0, TAU); fillStroke(ctx, cols[i], 2.4);
          ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(x + dx + sway - 5, y + dy - 6, 4, 6, -0.4, 0, TAU); ctx.fill();
        });
        roundRect(ctx, x - 10, y - 10, 20, 10, 4); fillStroke(ctx, '#fff', 2);
      } else if (type === 'rainbow_cake') {
        ctx.beginPath(); ctx.ellipse(x, y - 6, 36, 10, 0, 0, TAU); fillStroke(ctx, '#ffffff', 2.4);
        roundRect(ctx, x - 30, y - 34, 60, 24, 8); fillStroke(ctx, '#f9a8d4', 2.4);
        roundRect(ctx, x - 24, y - 54, 48, 22, 8); fillStroke(ctx, '#93c5fd', 2.4);
        roundRect(ctx, x - 18, y - 70, 36, 18, 7); fillStroke(ctx, '#fde047', 2.4);
        this.drawStrawberry(ctx, x, y - 74, 0.85);
      } else if (type === 'cloud_throne') {
        roundRect(ctx, x - 36, y - 96, 72, 86, 32); fillStroke(ctx, '#e0f2fe', 2.6);
        roundRect(ctx, x - 42, y - 42, 84, 36, 16); fillStroke(ctx, '#f9a8d4', 2.6);
        ctx.fillStyle = '#fde047'; starPath(ctx, x, y - 76, 12); fillStroke(ctx, '#fde047', 2);
      } else if (type === 'ice_cream_fountain') {
        ctx.beginPath(); ctx.ellipse(x, y - 6, 26, 8, 0, 0, TAU); fillStroke(ctx, '#ffffff', 2.2);
        ctx.beginPath(); ctx.moveTo(x - 24, y - 42); ctx.lineTo(x + 24, y - 42); ctx.lineTo(x + 10, y - 8); ctx.lineTo(x - 10, y - 8); ctx.closePath(); fillStroke(ctx, '#bae6fd', 2.4);
        for (const [dx, dy, c] of [[-12, -48, '#f9a8d4'], [12, -48, '#fde047'], [0, -60, '#c4b5fd']]) {
          ctx.beginPath(); ctx.arc(x + dx, y + dy, 13, 0, TAU); fillStroke(ctx, c, 2.2);
        }
        this.drawStrawberry(ctx, x, y - 74, 0.75);
      } else {
        roundRect(ctx, x - 32, y - 58, 64, 56, 18); fillStroke(ctx, '#ffffff', 2.6);
        ctx.fillStyle = '#fde047'; starPath(ctx, x, y - 30, 14); fillStroke(ctx, '#fde047', 2);
      }
      ctx.restore();
    }

    /* ---------- Comida y objetos pequeños ---------- */
    drawCupcake(ctx, x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-13, -14); ctx.lineTo(13, -14); ctx.lineTo(10, 4); ctx.lineTo(-10, 4); ctx.closePath(); fillStroke(ctx, '#fde68a', 2.2);
      ctx.strokeStyle = 'rgba(92,61,46,0.4)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-5, -12); ctx.lineTo(-4, 2); ctx.moveTo(4, -12); ctx.lineTo(4, 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-15, -14); ctx.quadraticCurveTo(-18, -24, -8, -26); ctx.quadraticCurveTo(0, -36, 8, -26); ctx.quadraticCurveTo(18, -24, 15, -14); ctx.closePath(); fillStroke(ctx, '#fbcfe8', 2.2);
      ctx.beginPath(); ctx.arc(0, -32, 3.6, 0, TAU); fillStroke(ctx, '#ef4444', 1.6);
      ctx.restore();
    }

    drawCakeSlice(ctx, x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-16, 2); ctx.lineTo(16, 2); ctx.lineTo(16, -18); ctx.lineTo(-16, -8); ctx.closePath(); fillStroke(ctx, '#fff7ed', 2.2);
      ctx.fillStyle = '#f9a8d4'; ctx.fillRect(-15, -6, 30, 4);
      ctx.beginPath(); ctx.moveTo(-17, -8); ctx.lineTo(17, -19); ctx.lineTo(17, -23); ctx.lineTo(-17, -12); ctx.closePath(); fillStroke(ctx, '#fbcfe8', 2);
      this.drawStrawberry(ctx, 8, -22, 0.55);
      ctx.restore();
    }

    drawDonut(ctx, x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, TAU); fillStroke(ctx, '#e6b17e', 2.2);
      ctx.beginPath(); ctx.arc(0, -1, 12, 0, TAU); ctx.fillStyle = '#f9a8d4'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, TAU); fillStroke(ctx, '#fff7ed', 2);
      const sp = ['#60a5fa', '#fde047', '#ffffff'];
      for (let i = 0; i < 6; i++) { const a = i; ctx.fillStyle = sp[i % 3]; ctx.fillRect(Math.cos(a) * 8 - 1.5, Math.sin(a) * 8 - 1, 3, 2); }
      ctx.restore();
    }

    drawStrawberry(ctx, x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.bezierCurveTo(-12, -2, -10, -16, 0, -14); ctx.bezierCurveTo(10, -16, 12, -2, 0, 4); ctx.closePath(); fillStroke(ctx, '#ef4444', 2);
      ctx.fillStyle = '#fef9c3';
      for (const [dx, dy] of [[-4, -8], [3, -9], [0, -3], [-5, -2], [5, -3]]) { ctx.beginPath(); ctx.arc(dx, dy, 0.9, 0, TAU); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(-6, -14); ctx.lineTo(0, -12); ctx.lineTo(6, -14); ctx.lineTo(0, -18); ctx.closePath(); fillStroke(ctx, '#4ade80', 1.6);
      ctx.restore();
    }

    drawTeapot(ctx, x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(14, -16); ctx.quadraticCurveTo(28, -18, 26, -30); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#bae6fd'; ctx.stroke();
      ctx.beginPath(); ctx.arc(-18, -14, 7, -Math.PI / 2, Math.PI / 2, true); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -14, 17, 14, 0, 0, TAU); fillStroke(ctx, '#bae6fd', 2.2);
      ctx.beginPath(); ctx.ellipse(0, -27, 10, 4, 0, 0, TAU); fillStroke(ctx, '#e0f2fe', 2);
      ctx.beginPath(); ctx.arc(0, -32, 3, 0, TAU); fillStroke(ctx, '#f472b6', 1.6);
      ctx.fillStyle = '#ffffff'; heartPath(ctx, 0, -13, 5); ctx.fill();
      ctx.restore();
    }

    drawTeacup(ctx, x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.ellipse(0, 0, 16, 4, 0, 0, TAU); fillStroke(ctx, '#ffffff', 2);
      ctx.beginPath(); ctx.arc(12, -9, 5, -Math.PI / 2, Math.PI / 2); ctx.lineWidth = 2.6; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-12, -16); ctx.lineTo(12, -16); ctx.quadraticCurveTo(12, -1, 0, -1); ctx.quadraticCurveTo(-12, -1, -12, -16); ctx.closePath(); fillStroke(ctx, '#fbcfe8', 2.2);
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-3, -22); ctx.quadraticCurveTo(-6, -27, -2, -31); ctx.moveTo(4, -22); ctx.quadraticCurveTo(1, -27, 5, -31); ctx.stroke();
      ctx.restore();
    }

    drawRoll(ctx, x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, TAU); fillStroke(ctx, '#f5c48a', 2.2);
      ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let t = 0; t < 12; t += 0.2) { const r = t * 1.05; const a = t * 1.1; const px = Math.cos(a) * r; const py = Math.sin(a) * r; if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-9, -6); ctx.quadraticCurveTo(0, -12, 9, -6); ctx.stroke();
      ctx.restore();
    }

    drawLipstick(ctx, x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      roundRect(ctx, -6, -14, 12, 14, 3); fillStroke(ctx, '#fde68a', 2);
      ctx.beginPath(); ctx.moveTo(-4, -14); ctx.lineTo(-4, -24); ctx.lineTo(4, -28); ctx.lineTo(4, -14); ctx.closePath(); fillStroke(ctx, '#f43f5e', 2);
      ctx.restore();
    }

    drawHanger(ctx, x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.strokeStyle = OUT; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(0, -30, 5, Math.PI, Math.PI * 2.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -25); ctx.lineTo(-18, -12); ctx.lineTo(18, -12); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(-16, 0); ctx.lineTo(16, 0); ctx.lineTo(12, -12); ctx.closePath(); fillStroke(ctx, '#7dd3fc', 2);
      ctx.restore();
    }

    drawFlower(ctx, x, y, r, color) {
      ctx.save();
      ctx.fillStyle = color;
      for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.75, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, TAU); ctx.fill();
      ctx.restore();
    }

    drawBowShape(ctx, x, y, s, color) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      for (const d of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(d * 14, -16, d * 22, -6); ctx.quadraticCurveTo(d * 24, 6, d * 18, 10); ctx.quadraticCurveTo(d * 10, 8, 0, 0); ctx.closePath();
        fillStroke(ctx, color, 2.2);
      }
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); fillStroke(ctx, color, 2.2);
      ctx.restore();
    }

    drawMic(ctx, x, y, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      roundRect(ctx, -4, -12, 8, 22, 3); fillStroke(ctx, '#c4b5fd', 2);
      ctx.beginPath(); ctx.arc(0, -18, 8, 0, TAU); fillStroke(ctx, '#e5e7eb', 2.2);
      ctx.strokeStyle = 'rgba(92,61,46,0.35)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-6, -18); ctx.lineTo(6, -18); ctx.moveTo(0, -25); ctx.lineTo(0, -11); ctx.stroke();
      ctx.restore();
    }

    drawNote(ctx, x, y, s = 1, color = '#ec4899') {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(4, 4); ctx.lineTo(4, -16); ctx.lineTo(14, -12); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 5, 6, 4.5, -0.4, 0, TAU); ctx.fill();
      ctx.restore();
    }

    /* ---------- PERSONAJES HD · ESTILO AVATAR WORLD PAZU GAMES ---------- */
    drawVectorAvatar(ctx, av, opts = {}) {
      const base = CHARACTER_BASES.find(b => b.id === av.baseId) || CHARACTER_BASES[0];
      const outfit = OUTFITS.find(o => o.id === av.outfitId) || OUTFITS[0];
      const t = opts.still ? 0 : this.time;

      ctx.save();
      const speed = Math.hypot(av.vx || 0, av.vy || 0);
      const isMoving = !opts.still && ((speed > 10 && !av.sittingOn) || av.danceTimer > 0);
      const hopY = av.hop > 0 ? -Math.sin(av.hop * Math.PI) * 26 : 0;
      const liftY = av.lifted ? -18 + Math.sin(this.time * 8) * 3 : 0;
      const bobY = (isMoving ? Math.abs(Math.sin(av.walkPhase)) * -9 : Math.sin(t * 2.2 + av.slot) * -2.5) + hopY + liftY;
      const danceTilt = av.danceTimer > 0 && !opts.still ? Math.sin(av.walkPhase) * 0.14 : (av.lifted ? Math.sin(this.time * 6) * 0.08 : 0);

      if (!opts.noShadow) {
        const shadowScale = 1 - Math.abs(bobY) * 0.012;
        ctx.fillStyle = 'rgba(71, 85, 105, 0.22)';
        ctx.beginPath();
        ctx.ellipse(av.x, av.y + 5, 40 * shadowScale, 13 * shadowScale, 0, 0, TAU);
        ctx.fill();
      }

      ctx.translate(av.x, av.y + bobY);
      ctx.rotate(danceTilt);

      // Etiqueta con el nombre (solo si juegan varios)
      const multi = [2, 3].some(s => this.avatars[s].active);
      if (!opts.noBadge && multi) {
        ctx.save();
        const label = this.playerName(av.slot);
        ctx.font = '800 15px "Baloo 2", sans-serif';
        const tw = Math.max(40, ctx.measureText(label).width + 22);
        const ly = av.hatId === 'wizard' ? -176 : (av.hatId === 'none' || av.hatId === 'bow' ? -142 : -158);
        ctx.fillStyle = SLOT_COLORS[av.slot];
        roundRect(ctx, -tw / 2, ly, tw, 24, 12);
        ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-6, ly + 24); ctx.lineTo(6, ly + 24); ctx.lineTo(0, ly + 31); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, ly + 17);
        ctx.restore();
      }

      ctx.scale(av.facing || 1, 1);
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Cola 2.5D
      ctx.save();
      if (base.tailType === 'cinnamon_roll') {
        ctx.beginPath(); ctx.arc(-26, -24, 11.5, 0, TAU); fillStroke(ctx, base.bodyColor);
        ctx.strokeStyle = '#d6a77a'; ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let k = 0; k < 8; k += 0.25) { const r = k * 1.1; const px = -26 + Math.cos(k * 1.3) * r; const py = -24 + Math.sin(k * 1.3) * r; if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
        ctx.stroke();
      } else if (base.tailType === 'fluffy_poof') {
        for (const [dx, dy] of [[-28, -26], [-34, -18], [-24, -16]]) { ctx.beginPath(); ctx.arc(dx, dy, 8, 0, TAU); fillStroke(ctx, base.earColor, 2.4); }
      } else {
        ctx.beginPath(); ctx.arc(-25, -22, 10.5, 0, TAU); fillStroke(ctx, base.bodyColor);
      }
      ctx.restore();

      // Piernas, calcetines con vuelitos y Zapatitos Bicolor 2.5D (Estilo Pazu Avatar World)
      const legSwing = isMoving ? Math.sin(av.walkPhase) * 7.5 : 0;
      for (const [side, lx] of [[-1, -13 + legSwing], [1, 13 - legSwing]]) {
        ctx.save();
        ctx.translate(lx, -7);
        // Calcetín blanco con borde superior
        roundRect(ctx, -8, -9, 16, 10, 4); fillStroke(ctx, '#ffffff', 2.2);
        // Zapatito kawaii con suela y puntera brillante
        ctx.beginPath();
        ctx.ellipse(side * 1.5, 1, 12.5, 7.5, 0, 0, TAU);
        fillStroke(ctx, outfit.ribbon || '#f472b6', 2.4);
        // Puntera blanca y correa
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath(); ctx.ellipse(side * 5, 0, 4.5, 3.5, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(-6, 5); ctx.lineTo(8, 5); ctx.stroke();
        ctx.restore();
      }

      // Vestuario en capas
      this.drawOutfit(ctx, outfit);

      // Sombra suave bajo el mentón sobre el cuello
      ctx.fillStyle = 'rgba(92, 61, 46, 0.14)';
      ctx.beginPath(); ctx.ellipse(0, -43, 18, 5, 0, 0, TAU); ctx.fill();

      // Orejas articuladas con pliegue 3D
      this.drawArticulatedEars(ctx, base, av.earAngle || 0);

      // Cabeza Cel-Shaded con volumen 3D y brillo especular superior
      const headGrad = ctx.createRadialGradient(-10, -78, 6, 0, -68, 44);
      headGrad.addColorStop(0, '#ffffff');
      headGrad.addColorStop(0.45, base.bodyColor);
      headGrad.addColorStop(1, base.shadowTint);
      ctx.beginPath(); ctx.ellipse(0, -68, 39, 31, 0, 0, TAU); fillStroke(ctx, headGrad, 2.9);

      // Brillo crescent en la frente (acabado Pazu HD)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath(); ctx.ellipse(-12, -86, 14, 4.5, -0.22, 0, TAU); ctx.fill();

      if (base.topCurl) {
        ctx.beginPath(); ctx.arc(2, -99, 8.5, 0, Math.PI * 1.8); fillStroke(ctx, base.bodyColor, 2.4);
      }
      if (base.earFlowers) {
        this.drawFlower(ctx, -27, -89, 5.8, '#fbcfe8');
        this.drawFlower(ctx, 27, -89, 5.8, '#fbcfe8');
      }

      // Mejillas sonrojadas aerografiadas con doble punto de luz kawaii
      ctx.save();
      for (const cx of [-22, 22]) {
        const blushG = ctx.createRadialGradient(cx, -61, 1, cx, -61, 10);
        blushG.addColorStop(0, base.cheekColor);
        blushG.addColorStop(1, 'rgba(255, 158, 187, 0)');
        ctx.fillStyle = blushG;
        ctx.globalAlpha = 0.78;
        ctx.beginPath(); ctx.ellipse(cx, -61, 10, 6, 0, 0, TAU); ctx.fill();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 2.2, -62, 1.3, 0, TAU);
        ctx.arc(cx + 2.2, -60.5, 0.9, 0, TAU);
        ctx.fill();
      }
      ctx.restore();

      this.drawFacialExpression(ctx, base, av, t);
      this.drawGlassesLayer(ctx, av.glassesId);
      this.drawHatLayer(ctx, av.hatId, base);
      this.drawArmsAndProp(ctx, base, av, outfit);

      ctx.restore();

      if (av.emotionBubble && !opts.noBadge) {
        ctx.save();
        ctx.translate(av.x + 38, av.y - 128 + bobY);
        const pop = Math.min(1, (2.4 - av.emotionTimer) * 6);
        ctx.scale(pop, pop);
        ctx.beginPath(); ctx.arc(0, 0, 21, 0, TAU);
        ctx.moveTo(-10, 16); ctx.lineTo(-18, 26); ctx.lineTo(-2, 19);
        fillStroke(ctx, '#ffffff', 2.2);
        this.drawBubbleIcon(ctx, av.emotionBubble);
        ctx.restore();
      }
    }

    drawOutfit(ctx, outfit) {
      ctx.save();
      const style = outfit.style;
      // Capa real por detrás con forro interior
      if (style === 'cape' || style === 'rainbow_royal') {
        ctx.beginPath();
        ctx.moveTo(-22, -48); ctx.quadraticCurveTo(-44, -10, -36, -5);
        ctx.lineTo(36, -5); ctx.quadraticCurveTo(44, -10, 22, -48);
        ctx.closePath();
        fillStroke(ctx, style === 'rainbow_royal' ? '#f472b6' : '#9333ea', 2.6);
      }

      // Mangas abullonadas en los hombros
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(s * 22, -38, 8.5, 7, s * 0.3, 0, TAU);
        fillStroke(ctx, outfit.secondary || '#ffffff', 2.2);
      }

      // Torso con gradiente 2.5D y pliegues
      const clothG = ctx.createLinearGradient(-24, -46, 24, -10);
      clothG.addColorStop(0, outfit.primary);
      clothG.addColorStop(1, outfit.secondary || outfit.primary);
      ctx.beginPath();
      if (style === 'tutu' || style === 'dress' || style === 'rainbow_royal') {
        ctx.moveTo(-20, -46); ctx.lineTo(20, -46);
        ctx.lineTo(style === 'tutu' ? 26 : 31, -11);
        ctx.lineTo(style === 'tutu' ? -26 : -31, -11);
        ctx.closePath();
      } else {
        ctx.moveTo(-22, -46); ctx.quadraticCurveTo(-30, -14, -26, -11);
        ctx.lineTo(26, -11); ctx.quadraticCurveTo(30, -14, 22, -46);
        ctx.closePath();
      }
      fillStroke(ctx, outfit.primary, 2.8);

      // Sombra lateral cel-shaded en el vestido/traje
      ctx.fillStyle = 'rgba(92, 61, 46, 0.1)';
      ctx.beginPath(); ctx.ellipse(12, -26, 10, 14, 0.15, 0, TAU); ctx.fill();

      if (style === 'tutu') {
        for (let i = -3; i <= 3; i++) {
          ctx.beginPath(); ctx.ellipse(i * 8.5, -14, 9, 6.5, 0, 0, TAU);
          fillStroke(ctx, '#fdf2f8', 2);
        }
        // Cinturón de satén
        roundRect(ctx, -21, -26, 42, 6, 3); fillStroke(ctx, outfit.ribbon, 1.8);
      } else if (style === 'apron') {
        // Delantal de pastelera con tirantes, encaje inferior y bolsillo con cuchara
        roundRect(ctx, -15, -39, 30, 27, 6); fillStroke(ctx, '#ffffff', 2.2);
        roundRect(ctx, -9, -25, 18, 10, 4); fillStroke(ctx, '#fce7f3', 1.8);
        ctx.fillStyle = outfit.ribbon; heartPath(ctx, 0, -31, 4.5); ctx.fill();
      } else if (style === 'pajama') {
        // Pijama con botones centrales y estrellitas
        ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(0, -12); ctx.stroke();
        ctx.fillStyle = outfit.secondary;
        for (const [dx, dy] of [[-11, -32], [11, -22], [-8, -18], [12, -36]]) { starPath(ctx, dx, dy, 4); ctx.fill(); }
      } else if (style === 'overalls') {
        // Jardinera denim con tirantes, botones de bronce y bolsillo con pincel
        roundRect(ctx, -16, -45, 7, 14, 3); fillStroke(ctx, '#2563eb', 2);
        roundRect(ctx, 9, -45, 7, 14, 3); fillStroke(ctx, '#2563eb', 2);
        roundRect(ctx, -15, -36, 30, 24, 5); fillStroke(ctx, '#3b82f6', 2.2);
        roundRect(ctx, -8, -29, 16, 12, 3); fillStroke(ctx, '#1d4ed8', 1.8);
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.arc(-12, -34, 2.8, 0, TAU); ctx.arc(12, -34, 2.8, 0, TAU); ctx.fill();
      } else if (style === 'kimono') {
        ctx.beginPath(); ctx.moveTo(-14, -46); ctx.lineTo(4, -24); ctx.moveTo(14, -46); ctx.lineTo(-4, -24); ctx.lineWidth = 2.4; ctx.strokeStyle = OUT; ctx.stroke();
        roundRect(ctx, -24, -28, 48, 10, 4); fillStroke(ctx, outfit.secondary, 2.2);
        this.drawBowShape(ctx, 0, -23, 0.35, outfit.ribbon);
        this.drawFlower(ctx, 13, -16, 3.5, '#ffffff');
      } else if (style === 'dress' || style === 'rainbow_royal') {
        if (style === 'rainbow_royal') {
          // Franjas arcoíris pastel en la falda
          roundRect(ctx, -25, -24, 50, 6, 3); fillStroke(ctx, '#fde047', 1.6);
          roundRect(ctx, -28, -18, 56, 6, 3); fillStroke(ctx, '#38bdf8', 1.6);
          ctx.fillStyle = '#fde047'; starPath(ctx, 0, -31, 6.5); fillStroke(ctx, '#fde047', 1.6);
        }
        // Vuelito de encaje blanco en el ruedo
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(-27, -14); for (let i = 0; i < 6; i++) ctx.quadraticCurveTo(-22 + i * 9, -8, -17 + i * 9, -14); ctx.stroke();
      }

      // Cuello Peter Pan / Cuello Real y Moño
      if (style !== 'kimono') {
        ctx.beginPath();
        ctx.ellipse(-7, -44, 8, 4.5, 0.25, 0, TAU);
        ctx.ellipse(7, -44, 8, 4.5, -0.25, 0, TAU);
        fillStroke(ctx, '#ffffff', 2);
        if (style === 'cape') {
          ctx.fillStyle = '#fde047'; starPath(ctx, 0, -37, 5.5); fillStroke(ctx, '#fde047', 1.6);
        } else {
          this.drawBowShape(ctx, 0, -39, 0.34, outfit.ribbon);
        }
      }
      ctx.restore();
    }

    drawArticulatedEars(ctx, base, earAngle) {
      ctx.save();
      const len = base.earType === 'long_floppy' || base.earType === 'long_wavy' ? 46 : (base.earType === 'round_droop' ? 22 : 30);
      const wid = base.earType === 'fluffy_cloud' ? 18 : 14.5;
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * 30, -76);
        ctx.rotate(side * -(0.45 + earAngle));
        if (base.earType === 'fluffy_cloud') {
          for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc((i % 2 ? 4 : -4), 6 + i * 9, 11, 0, TAU); fillStroke(ctx, base.earColor, 2.6); }
        } else {
          ctx.beginPath(); ctx.ellipse(0, len * 0.55, wid, len * 0.55, 0, 0, TAU); fillStroke(ctx, base.earColor, 2.8);
          // Interior rosado con gradiente suave
          const earG = ctx.createLinearGradient(0, len * 0.2, 0, len * 0.9);
          earG.addColorStop(0, base.innerEar);
          earG.addColorStop(1, 'rgba(255,255,255,0.4)');
          ctx.fillStyle = earG;
          ctx.beginPath(); ctx.ellipse(0, len * 0.58, wid * 0.56, len * 0.36, 0, 0, TAU); ctx.fill();
          // Brillo superior en la oreja
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.beginPath(); ctx.ellipse(-side * 3, len * 0.28, wid * 0.22, len * 0.14, 0, 0, TAU); ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();
    }

    /* ---------- OJOS Y EXPRESIONES HD ESTILO PAZU AVATAR WORLD ---------- */
    drawFacialExpression(ctx, base, av, t = this.time) {
      ctx.save();
      const expr = av.sleeping ? 'sleepy' : av.exprId;
      ctx.strokeStyle = OUT;

      // 1. Cejas expresivas (clave del look Avatar World Pazu)
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = OUT;
      const browLift = (expr === 'starry' || expr === 'party') ? -3 : (expr === 'sleepy' ? 1.5 : 0);
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * 10, -80 + browLift);
        ctx.quadraticCurveTo(side * 16, -83.5 + browLift, side * 21, -79.5 + browLift);
        ctx.stroke();
      }

      // 2. Ojos multicapa con esclerótica, iris degradado, pupila, doble brillo especular y pestañas superiores
      if (expr === 'party') {
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-21, -66); ctx.lineTo(-15, -73); ctx.lineTo(-9, -66); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(9, -66); ctx.lineTo(15, -73); ctx.lineTo(21, -66); ctx.stroke();
      } else if (av.isBlinking || expr === 'sleepy' || expr === 'love') {
        ctx.lineWidth = 2.8;
        for (const side of [-1, 1]) {
          ctx.beginPath(); ctx.arc(side * 15, -69, 6.5, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke();
          // Pestañita lateral al cerrar los ojos
          ctx.beginPath(); ctx.moveTo(side * 21, -67); ctx.lineTo(side * 23.5, -65.5); ctx.stroke();
        }
        if (expr === 'love') {
          ctx.fillStyle = '#f472b6';
          heartPath(ctx, -26, -82, 4.5); ctx.fill();
          heartPath(ctx, 26, -84, 3.8); ctx.fill();
        }
      } else {
        // Ojos grandes Pazu HD (para 'happy', 'yummy', 'starry')
        const isWarmEye = base.eyeColor === '#5c3d2e' || base.eyeColor === '#4a2c11';
        for (const side of [-1, 1]) {
          const ex = side * 15.5;
          const ey = -68.5;

          // Base blanca (esclerótica) con contorno suave
          ctx.beginPath();
          ctx.ellipse(ex, ey, 6.9, 8.2, 0, 0, TAU);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Iris grande con gradiente vertical de 3 tonos
          const irisG = ctx.createLinearGradient(ex, ey - 7, ex, ey + 7);
          if (isWarmEye) {
            irisG.addColorStop(0, '#3e2211');
            irisG.addColorStop(0.55, '#78350f');
            irisG.addColorStop(1, '#d97706');
          } else {
            irisG.addColorStop(0, '#0369a1');
            irisG.addColorStop(0.55, '#0ea5e9');
            irisG.addColorStop(1, '#7dd3fc');
          }
          ctx.beginPath();
          ctx.ellipse(ex - side * 0.4, ey + 0.4, 5.7, 7.2, 0, 0, TAU);
          ctx.fillStyle = irisG;
          ctx.fill();

          // Pupila central profunda
          ctx.beginPath();
          ctx.ellipse(ex - side * 0.4, ey + 0.6, 3.1, 4.1, 0, 0, TAU);
          ctx.fillStyle = isWarmEye ? '#1c0f07' : '#082f49';
          ctx.fill();

          // Brillo inferior translúcido en el iris
          ctx.fillStyle = isWarmEye ? 'rgba(253, 224, 71, 0.45)' : 'rgba(186, 230, 253, 0.55)';
          ctx.beginPath();
          ctx.ellipse(ex, ey + 4.2, 3.4, 1.8, 0, 0, TAU);
          ctx.fill();

          // Doble catchlight especular (brillo principal grande arriba-izq + secundario abajo-der)
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(ex - 2.1, ey - 2.8, 2.3, 2.8, -0.2, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex + 2.0, ey + 2.4, 1.25, 0, TAU);
          ctx.fill();

          // Si está en modo 'starry', estrellita dorada brillante dentro del ojo
          if (expr === 'starry') {
            ctx.fillStyle = '#fef08a';
            starPath(ctx, ex + 0.5, ey + 0.5, 3.8);
            ctx.fill();
          }

          // Párpado superior grueso curvado y pestaña exterior (Eyelash Pazu)
          ctx.strokeStyle = '#2b1810';
          ctx.lineWidth = 3.1;
          ctx.beginPath();
          ctx.arc(ex, ey + 0.5, 7.1, Math.PI * 1.08, Math.PI * 1.92);
          ctx.stroke();
          // Rabillo de pestaña exterior
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(ex + side * 6.4, ey - 2.2);
          ctx.lineTo(ex + side * 9.0, ey - 4.2);
          ctx.stroke();
        }
      }

      // 3. Naricita / Boquita expresiva con lengüita rosada
      ctx.strokeStyle = OUT;
      if (base.hasPacifier && av.chewTimer <= 0 && expr !== 'party') {
        ctx.beginPath(); ctx.arc(0, -58.5, 6.8, 0, TAU); fillStroke(ctx, '#38bdf8', 2.2);
        ctx.beginPath(); ctx.arc(0, -58.5, 9, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-1.5, -60, 2.2, 0, TAU); ctx.fill();
      } else if (av.chewTimer > 0 || expr === 'yummy' || expr === 'party') {
        const openH = expr === 'party' && av.chewTimer <= 0 ? 6.5 : 4.5 + Math.abs(Math.sin(t * 14)) * 3.8;
        ctx.save();
        ctx.beginPath(); ctx.ellipse(0, -57.5, 6.5, openH, 0, 0, TAU);
        fillStroke(ctx, '#be123c', 2.2);
        ctx.clip();
        // Lengüita rosada interior
        ctx.fillStyle = '#fda4af';
        ctx.beginPath(); ctx.arc(0, -57.5 + openH * 0.7, 5.2, 0, TAU); ctx.fill();
        ctx.restore();
      } else {
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-6.5, -60.5);
        ctx.quadraticCurveTo(-3.2, -56.2, 0, -60.2);
        ctx.quadraticCurveTo(3.2, -56.2, 6.5, -60.5);
        ctx.stroke();
      }
      if (base.mouthCream) {
        ctx.fillStyle = '#fff7ed';
        ctx.beginPath(); ctx.arc(-9, -55, 3.2, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }

    drawGlassesLayer(ctx, glassesId) {
      if (!glassesId || glassesId === 'none') return;
      ctx.save();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = OUT;
      if (glassesId === 'hearts') {
        for (const dx of [-15.5, 15.5]) {
          heartPath(ctx, dx, -69, 9.5); fillStroke(ctx, 'rgba(244, 114, 182, 0.55)', 2.4);
          ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.beginPath(); ctx.arc(dx - 3, -72, 2, 0, TAU); ctx.fill();
        }
        ctx.beginPath(); ctx.moveTo(-6, -71); ctx.lineTo(6, -71); ctx.stroke();
      } else if (glassesId === 'stars') {
        for (const dx of [-15.5, 15.5]) { starPath(ctx, dx, -69, 11.5, 0.5); fillStroke(ctx, 'rgba(253, 224, 71, 0.65)', 2.2); }
        ctx.beginPath(); ctx.moveTo(-5, -70); ctx.lineTo(5, -70); ctx.stroke();
      } else if (glassesId === 'round') {
        for (const dx of [-15.5, 15.5]) {
          ctx.fillStyle = 'rgba(186,230,253,0.38)';
          ctx.beginPath(); ctx.arc(dx, -69, 9.5, 0, TAU); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(dx - 4, -73); ctx.lineTo(dx + 1, -67); ctx.stroke();
          ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
        }
        ctx.beginPath(); ctx.moveTo(-6, -69); ctx.lineTo(6, -69); ctx.stroke();
      } else if (glassesId === 'sleep_mask') {
        roundRect(ctx, -28, -78, 56, 18, 9); fillStroke(ctx, '#c084fc', 2.4);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(-13, -71, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(13, -71, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      }
      ctx.restore();
    }

    drawHatLayer(ctx, hatId, base) {
      const effectiveHat = (hatId === 'none' && base.defaultBeret) ? 'purin_beret' : hatId;
      if (!effectiveHat || effectiveHat === 'none') return;
      this.drawHatShape(ctx, effectiveHat, 0, -94);
    }

    drawHatShape(ctx, id, x, y) {
      ctx.save();
      ctx.translate(x, y);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (id === 'crown') {
        ctx.beginPath();
        ctx.moveTo(-20, 2); ctx.lineTo(-22, -18); ctx.lineTo(-11, -8); ctx.lineTo(0, -24); ctx.lineTo(11, -8); ctx.lineTo(22, -18); ctx.lineTo(20, 2); ctx.closePath();
        const g = ctx.createLinearGradient(0, -24, 0, 2); g.addColorStop(0, '#fef08a'); g.addColorStop(1, '#fbbf24');
        fillStroke(ctx, g, 2.4);
        for (const [dx, c] of [[-11, '#f472b6'], [0, '#60a5fa'], [11, '#f472b6']]) { ctx.beginPath(); ctx.arc(dx, -3, 3, 0, TAU); ctx.fillStyle = c; ctx.fill(); }
        for (const dx of [-22, 0, 22]) { ctx.beginPath(); ctx.arc(dx, dx === 0 ? -25 : -19, 2.6, 0, TAU); fillStroke(ctx, '#fff', 1.6); }
      } else if (id === 'beret' || id === 'purin_beret') {
        const c = id === 'purin_beret' ? '#8b5a3c' : '#f9a8d4';
        ctx.rotate(-0.15);
        ctx.beginPath(); ctx.ellipse(2, -4, 30, 11, 0, 0, TAU); fillStroke(ctx, c, 2.4);
        ctx.beginPath(); ctx.ellipse(4, -9, 24, 9, 0, Math.PI, TAU); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();
        ctx.strokeStyle = OUT; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(4, -14); ctx.lineTo(6, -21); ctx.stroke();
      } else if (id === 'bow') {
        this.drawBowShape(ctx, 18, 2, 0.95, '#f472b6');
      } else if (id === 'sakura') {
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(0, 6, 30, 9, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
        for (const [dx, dy, c] of [[-24, 2, '#fbcfe8'], [-12, -4, '#f9a8d4'], [0, -6, '#fbcfe8'], [12, -4, '#f9a8d4'], [24, 2, '#fbcfe8']]) {
          ctx.save();
          ctx.fillStyle = c; ctx.strokeStyle = OUT; ctx.lineWidth = 1.4;
          for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; ctx.beginPath(); ctx.arc(dx + Math.cos(a) * 4.5, dy + Math.sin(a) * 4.5, 3.6, 0, TAU); ctx.fill(); ctx.stroke(); }
          ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(dx, dy, 2.4, 0, TAU); ctx.fill();
          ctx.restore();
        }
      } else if (id === 'sleep_cap') {
        ctx.beginPath(); ctx.moveTo(-26, 2); ctx.quadraticCurveTo(-18, -30, 6, -30); ctx.quadraticCurveTo(30, -28, 38, -6); ctx.lineTo(26, 2); ctx.closePath();
        fillStroke(ctx, '#93c5fd', 2.4);
        ctx.fillStyle = '#fef9c3'; starPath(ctx, -4, -14, 4); ctx.fill(); starPath(ctx, 12, -20, 3); ctx.fill();
        roundRect(ctx, -28, -4, 56, 10, 5); fillStroke(ctx, '#ffffff', 2.2);
        ctx.beginPath(); ctx.arc(40, -4, 6, 0, TAU); fillStroke(ctx, '#ffffff', 2.2);
      } else if (id === 'wizard') {
        ctx.beginPath(); ctx.ellipse(0, 0, 34, 8, 0, 0, TAU); fillStroke(ctx, '#7c3aed', 2.4);
        ctx.beginPath(); ctx.moveTo(-18, -2); ctx.quadraticCurveTo(-6, -30, 8, -46); ctx.quadraticCurveTo(10, -24, 18, -2); ctx.closePath();
        fillStroke(ctx, '#8b5cf6', 2.4);
        ctx.fillStyle = '#fde047';
        starPath(ctx, 2, -18, 5); ctx.fill();
        starPath(ctx, -6, -6, 3); ctx.fill();
        ctx.beginPath(); ctx.arc(8, -47, 3.4, 0, TAU); fillStroke(ctx, '#fde047', 1.6);
      } else if (id === 'strawberry') {
        ctx.beginPath(); ctx.moveTo(-28, 2); ctx.bezierCurveTo(-30, -30, 30, -30, 28, 2); ctx.closePath();
        fillStroke(ctx, '#ef4444', 2.4);
        ctx.fillStyle = '#fef9c3';
        for (const [dx, dy] of [[-14, -8], [-4, -14], [8, -12], [16, -4], [-18, -2], [2, -4]]) { ctx.beginPath(); ctx.ellipse(dx, dy, 1.4, 2, 0, 0, TAU); ctx.fill(); }
        ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(-4, -26); ctx.lineTo(0, -21); ctx.lineTo(5, -27); ctx.lineTo(10, -20); ctx.quadraticCurveTo(0, -16, -10, -20); ctx.closePath();
        fillStroke(ctx, '#4ade80', 2);
      } else if (id === 'unicorn_horn') {
        ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(0, -34); ctx.lineTo(9, 0); ctx.closePath();
        fillStroke(ctx, '#fde047', 2.4);
        for (const [dx, c] of [[-14, '#f9a8d4'], [0, '#93c5fd'], [14, '#c4b5fd']]) {
          this.drawFlower(ctx, dx, 2, 5, c);
        }
      }
      ctx.restore();
    }

    drawArmsAndProp(ctx, base, av, outfit) {
      ctx.save();
      ctx.beginPath(); ctx.ellipse(-24, -33, 8.5, 6.2, -0.3, 0, TAU); fillStroke(ctx, base.bodyColor, 2.6);
      const prop = av.propId;
      if (prop && prop !== 'none') this.drawPropShape(ctx, prop, 30, -34);
      ctx.beginPath(); ctx.ellipse(24, -33, 8.5, 6.2, 0.3, 0, TAU); fillStroke(ctx, base.bodyColor, 2.6);
      ctx.restore();
    }

    // Objetos en la mano; incluye Boba Tea con perlas de tapioca y Canasta de Supermercado (Imagen 1 Pazu)
    drawPropShape(ctx, id, x, y) {
      ctx.save();
      ctx.translate(x, y);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (id === 'wand') {
        ctx.rotate(0.35);
        ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, -24); ctx.stroke();
        ctx.strokeStyle = '#fbcfe8'; ctx.lineWidth = 3; ctx.stroke();
        starPath(ctx, 0, -30, 10.5); fillStroke(ctx, '#fde047', 2.2);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-3, -33, 2, 0, TAU); ctx.fill();
      } else if (id === 'boba_tea') {
        // Vaso de Boba Tea con perlas de tapioca, hielo, tapa domo y bombilla ancha (Imagen 1 Pazu)
        ctx.translate(4, 2);
        // Bombilla ancha rayada
        roundRect(ctx, -2, -32, 5, 18, 2); fillStroke(ctx, '#38bdf8', 1.8);
        // Tapa domo transparente
        ctx.beginPath(); ctx.arc(0, -14, 10, Math.PI, TAU); fillStroke(ctx, 'rgba(255,255,255,0.85)', 2);
        // Vaso con leche de fresa/taro
        ctx.beginPath(); ctx.moveTo(-10, -14); ctx.lineTo(10, -14); ctx.lineTo(7, 8); ctx.lineTo(-7, 8); ctx.closePath();
        fillStroke(ctx, '#fbcfe8', 2.2);
        // Perlas de tapioca oscuras en el fondo
        ctx.fillStyle = '#3e2211';
        for (const [px, py] of [[-4, 4], [0, 5], [4, 4], [-2, 1], [2, 1]]) {
          ctx.beginPath(); ctx.arc(px, py, 1.9, 0, TAU); ctx.fill();
        }
        roundRect(ctx, -11, -15, 22, 4, 2); fillStroke(ctx, '#f472b6', 1.8);
      } else if (id === 'shop_basket') {
        // Canasta de compras con leche, frutilla y baguette (Imagen 1 Pazu)
        ctx.translate(6, 4);
        ctx.strokeStyle = OUT; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(0, -10, 11, Math.PI, TAU); ctx.stroke();
        roundRect(ctx, -12, -12, 24, 14, 4); fillStroke(ctx, '#38bdf8', 1.8);
        ctx.beginPath(); ctx.moveTo(-14, -10); ctx.lineTo(14, -10); ctx.lineTo(10, 8); ctx.lineTo(-10, 8); ctx.closePath();
        fillStroke(ctx, '#f472b6', 2.2);
        // Rejilla de la canasta
        ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-5, -8); ctx.lineTo(-4, 6); ctx.moveTo(0, -8); ctx.lineTo(0, 6); ctx.moveTo(5, -8); ctx.lineTo(4, 6); ctx.stroke();
      } else if (id === 'teacup') {
        this.drawTeacup(ctx, 4, 2, 0.75);
      } else if (id === 'teddy') {
        ctx.translate(6, 0);
        for (const dx of [-8, 8]) { ctx.beginPath(); ctx.arc(dx, -20, 5, 0, TAU); fillStroke(ctx, '#d6a77a', 2); }
        ctx.beginPath(); ctx.ellipse(0, 0, 10, 9, 0, 0, TAU); fillStroke(ctx, '#d6a77a', 2);
        ctx.beginPath(); ctx.arc(0, -13, 10, 0, TAU); fillStroke(ctx, '#d6a77a', 2);
        ctx.beginPath(); ctx.ellipse(0, -10, 4.5, 3.5, 0, 0, TAU); ctx.fillStyle = '#fde4c8'; ctx.fill();
        ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(-3.6, -15, 1.4, 0, TAU); ctx.arc(3.6, -15, 1.4, 0, TAU); ctx.arc(0, -11, 1.4, 0, TAU); ctx.fill();
      } else if (id === 'roll') {
        this.drawRoll(ctx, 6, -2, 0.75);
      } else if (id === 'mic') {
        ctx.rotate(0.3);
        this.drawMic(ctx, 0, 2, 0.95);
      } else if (id === 'balloon') {
        const sway = Math.sin(this.time * 1.8) * 3;
        ctx.strokeStyle = OUT; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10 + sway, -24, 6 + sway, -46); ctx.stroke();
        heartPath(ctx, 6 + sway, -60, 15); fillStroke(ctx, '#fb7185', 2.4);
        ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.beginPath(); ctx.ellipse(0 + sway, -66, 3, 5, -0.5, 0, TAU); ctx.fill();
      } else if (id === 'ice_cream_cone') {
        ctx.beginPath(); ctx.moveTo(-7, -6); ctx.lineTo(7, -6); ctx.lineTo(0, 12); ctx.closePath();
        fillStroke(ctx, '#f5c48a', 2);
        for (const [dy, c] of [[-10, '#f9a8d4'], [-18, '#93c5fd'], [-26, '#fde047']]) {
          ctx.beginPath(); ctx.arc(0, dy, 7, 0, TAU); fillStroke(ctx, c, 2);
        }
      }
      ctx.restore();
    }

    drawBubbleIcon(ctx, kind) {
      ctx.save();
      ctx.lineJoin = 'round';
      if (kind === 'heart') { heartPath(ctx, 0, 1, 9); fillStroke(ctx, '#f472b6', 2); }
      else if (kind === 'star') { starPath(ctx, 0, 1, 11); fillStroke(ctx, '#fde047', 2); }
      else if (kind === 'sparkle') { starPath(ctx, 0, 0, 12, 0.3, 4); fillStroke(ctx, '#c4b5fd', 2); }
      else if (kind === 'note') this.drawNote(ctx, -2, 2, 1.2, '#8b5cf6');
      else if (kind === 'mic') this.drawMic(ctx, 0, 10, 0.8);
      else if (kind === 'sun') {
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.4;
        for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 9, Math.sin(a) * 9); ctx.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); fillStroke(ctx, '#fde047', 2);
      } else if (kind === 'zzz') {
        ctx.fillStyle = '#6366f1';
        ctx.font = '800 15px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('z', -6, 4); ctx.font = '800 11px "Baloo 2", sans-serif'; ctx.fillText('z', 4, -3); ctx.font = '800 8px "Baloo 2", sans-serif'; ctx.fillText('z', 10, -9);
      } else if (kind === 'yum') {
        this.drawCupcake(ctx, 0, 12, 0.6);
      }
      ctx.restore();
    }

    drawAmbientLightingOverlay(ctx, W, H, room) {
      if (this.lightingMode === 'day') return;
      ctx.save();
      if (this.lightingMode === 'sunset') {
        ctx.fillStyle = 'rgba(251, 113, 133, 0.12)';
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.fillStyle = 'rgba(30, 27, 75, 0.32)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        for (const obj of this.getRoomItems()) {
          if (!obj.light || !obj.state) continue;
          const ly = obj.type === 'moon_lamp' ? obj.y - 110 : obj.y - 64;
          const g = ctx.createRadialGradient(obj.x, ly, 10, obj.x, ly, 170);
          g.addColorStop(0, 'rgba(255, 220, 120, 0.35)');
          g.addColorStop(1, 'rgba(255, 220, 120, 0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(obj.x, ly, 170, 0, TAU); ctx.fill();
        }
      }
      ctx.restore();
    }

    // Retrato para la tarjeta del menú: tres amigos vestidos con el motor HD Pazu
    renderCardPortrait(canvas) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const s = H / 175;
      const friends = [
        Object.assign(this.createAvatar(2, 'milk', 0, 0, 'star_pajama', 'sleep_cap', 'none', 'boba_tea', 'happy', true), { facing: 1 }),
        Object.assign(this.createAvatar(1, 'cinna', 0, 0, 'royal_cape', 'crown', 'none', 'wand', 'starry', true), { facing: 1 }),
        Object.assign(this.createAvatar(3, 'mocha', 0, 0, 'ballet_tutu', 'sakura', 'hearts', 'shop_basket', 'happy', true), { facing: -1 })
      ];
      const xs = [W * 0.2, W * 0.5, W * 0.8];
      const ys = [H - 10 * s, H - 4 * s, H - 10 * s];
      const sc = [0.88, 1, 0.88];
      friends.forEach((f, i) => {
        ctx.save();
        ctx.translate(xs[i], ys[i]);
        ctx.scale(s * sc[i], s * sc[i]);
        f.isBlinking = false;
        this.drawVectorAvatar(ctx, f, { noBadge: true, still: true });
        ctx.restore();
      });
    }
  }


  window.Cinnamo = window.Cinnamo || {};
  const game = new AvatarWorldGame();
  window.Cinnamo.avatarWorldGame = game;

  const paintCard = () => {
    game.renderCardPortrait(document.getElementById('awCardPortrait'));
    game.renderCardPortrait(document.getElementById('remoteAvatarCard'));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paintCard);
  else paintCard();
  // Repintar cuando cargue la fuente (las etiquetas usan Baloo 2)
  document.fonts?.ready?.then(paintCard).catch(() => {});
})();
