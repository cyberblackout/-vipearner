const CACHE_NAME = 'vipearner-v1';
const urlsToCache = ['/', '/auth', '/manifest.json'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
    if (event.request.url.includes('/api/')) {
        event.respondWith(fetch(event.request));
    } else {
        event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    }
});