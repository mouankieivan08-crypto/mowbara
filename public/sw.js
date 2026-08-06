/**
 * Service Worker de Mwaebara (PWA)
 * RÈGLE ABSOLUE 5 : Le service worker ne met en cache que la coque applicative et les données statiques :
 * HTML, CSS, JS, polices, contacts.json, categories.json.
 * JAMAIS de requête de conversation, de réponse de classification, ou de fragment de message.
 */

const CACHE_NAME = 'mwaebara-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/data/contacts.json',
  '/data/categories.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // RÈGLE ABSOLUE : Toute requête vers l'API de classification ou de conversation est expressément exclue du cache.
  if (url.pathname.includes('/api/classification') || url.pathname.includes('/api/logs')) {
    return; // Laisser passer sans cache
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Optionnel : ne mettre en cache de façon dynamique que les assets statiques du même domaine
        if (
          event.request.method === 'GET' &&
          networkResponse.status === 200 &&
          (url.origin === self.location.origin) &&
          !STATIC_ASSETS.includes(url.pathname) &&
          (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.woff2'))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Si hors-ligne et que l'asset statique n'est pas trouvé (par exemple contacts ou categories),
      // nous retournons les données statiques si possible ou échouons proprement.
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
