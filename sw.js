/* Service Worker para Cinnamoroll Land (Amanda)
 * Permite carga instantánea (<100ms) mediante caché local y funcionamiento offline.
 */
const CACHE_NAME = 'cinnamoroll-land-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './cinnamoroll_sprite.png',
  './js/audio.js',
  './js/input.js',
  './js/character.js',
  './js/game.js',
  './js/math.js',
  './js/coloring.js',
  './js/memory.js',
  './js/platformer.js',
  './js/doom.js',
  './js/hub.js',
  './assets/milk_teddy.png',
  './assets/cinnamoroll_fly.png',
  './assets/pompompurin.png',
  './assets/mocha.png',
  './assets/chiffon.png',
  './assets/milk_sitting.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  // Para el documento principal (index.html): Network con timeout rápido o caché inmediata
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return networkRes;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Para imágenes, fuentes, CSS y scripts: Cache-First con actualización en segundo plano
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // En segundo plano revalidar caché silenciosamente
        fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes));
            }
          })
          .catch(() => {});
        return cached;
      }
      return fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      });
    })
  );
});
