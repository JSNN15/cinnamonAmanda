/* Service Worker para Cinnamoroll Land (Amanda)
 * Estrategia NETWORK-FIRST: siempre intenta traer la versión más nueva desde GitHub Pages
 * y sólo usa la caché como respaldo cuando no hay conexión. Así un despliegue nuevo
 * nunca queda "atrapado" detrás de archivos viejos en caché.
 */
const CACHE_NAME = 'cinnamoroll-land-v16';
const CORE_ASSETS = [
  './',
  './index.html',
  './controller.html',
  './styles.css',
  './cinnamoroll_sprite.png',
  './assets/cinnamoroll_fly.png',
  './assets/milk_teddy.png',
  './assets/milk_sitting.png',
  './assets/pompompurin.png',
  './assets/pompompurin_hq.png',
  './assets/mocha.png',
  './assets/mocha_hq.png',
  './assets/chiffon.png',
  './assets/puzzle_cinnamoroll.png',
  './assets/puzzle_milk.png',
  './assets/puzzle_chiffon.png',
  './assets/puzzle_purin.png',
  './assets/puzzle_mocha.png',
  './assets/sheet_cinnamoroll.png',
  './assets/sheet_milk.png',
  './assets/sheet_pompompurin.png',
  './assets/sheet_mocha.png',
  './assets/sheet_chiffon.png',
  './js/peerjs.min.js',
  './js/qrcode.min.js',
  './js/controller-bridge.js',
  './js/audio.js',
  './js/input.js',
  './js/character.js',
  './js/game.js',
  './js/math.js',
  './js/coloring.js',
  './js/memory.js',
  './js/platformer.js',
  './js/doom.js',
  './js/writing.js',
  './js/puzzle.js',
  './js/hub.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Sólo gestionamos archivos propios; fuentes de Google y demás van directo a la red.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((cached) => cached || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))
      )
  );
});
