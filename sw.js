const CACHE_NAME = 'neverlost-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/heatmap.css',
  '/css/animations.css',
  '/js/app.js',
  '/js/card.js',
  '/js/scheduler.js',
  '/js/storage.js',
  '/js/scratch.js',
  '/js/heatmap.js',
  '/js/stats.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});