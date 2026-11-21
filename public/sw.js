/* Only a static offline page is cached. Profiles, APIs and booking data never enter Cache Storage. */
const CACHE = 'mybeauty-offline-v1';
self.addEventListener('install', event => {



  event.waitUntil(caches.open(CACHE).then(cache => cache.add('/offline.html')));



  self.skipWaiting();
});
self.addEventListener('activate', event => {



  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mybeauty-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {



  if (event.request.mode !== 'navigate' || event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;



  event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html')));
});
