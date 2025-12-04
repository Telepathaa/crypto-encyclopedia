const CACHE_NAME = 'site-cache-v1';
const URLS_TO_CACHE = ['/', '/index.html', '/index.css', '/index.js'];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  if (evt.request.method !== 'GET') return;

  evt.respondWith(
    caches.match(evt.request).then(cached => {
      if (cached) return cached;
      return fetch(evt.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            if (evt.request.url.startsWith(self.location.origin)) {
              cache.put(evt.request, copy);
            }
          });
          return res;
        })
        .catch(() => caches.match('/offline.html'));
    })
  );
});
