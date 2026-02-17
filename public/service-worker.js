const CACHE_NAME = 'box-motors-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/db.js',
  '/logos.png',
  '/logos.jpg',
  '/logo.svg'
];

// Instalar cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Ativar e limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Para requisições GET
  if (request.method === 'GET') {
    // APIs - network first, cache fallback
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(
        fetch(request)
          .then(response => {
            // Cache a resposta se for 200
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => caches.match(request))
      );
    } else {
      // Arquivos estáticos - cache first, network fallback
      event.respondWith(
        caches.match(request)
          .then(response => response || fetch(request))
          .catch(() => {
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          })
      );
    }
  }
});
