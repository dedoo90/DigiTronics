const DIGITRONICS_PWA_VERSION = 'digitronics-pwa-enterprise-v7-treasury-local-summary';
const APP_SHELL_CACHE = DIGITRONICS_PWA_VERSION;
const APP_SHELL_ASSETS = [
  './',
  './DigiTronics_v5.html',
  './manifest.json',
  './icons/digitronics-icon-192.svg',
  './icons/digitronics-icon-256.svg',
  './icons/digitronics-icon-384.svg',
  './icons/digitronics-icon-512.svg',
  './icons/digitronics-maskable-192.svg',
  './icons/digitronics-maskable-512.svg',
  './icons/digitronics-dark-512.svg',
  './icons/digitronics-light-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then(cache => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('digitronics-pwa-') && key !== APP_SHELL_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        const copy = response.clone();
        caches.open(APP_SHELL_CACHE).then(cache => cache.put(request, copy)).catch(() => {});
        return response;
      }).catch(() => cached || caches.match('./DigiTronics_v5.html'));
      return cached || network;
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag !== 'digitronics-offline-sync') return;
  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
      clients.forEach(client => client.postMessage({ type: 'DIGITRONICS_BACKGROUND_SYNC', version: DIGITRONICS_PWA_VERSION }));
    })
  );
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'DIGITRONICS_SKIP_WAITING') return;
  self.skipWaiting();
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./DigiTronics_v5.html');
    })
  );
});
