/* Doozi POS service worker — makes the app installable + work offline.
   App shell is network-first (fresh when online, cached fallback offline);
   fonts/external assets are cache-first. The backup API is never cached. */
'use strict';
const CACHE = 'doozi-pos-v1';
const SHELL = [
  './', './index.html',
  './css/style.css',
  './js/data.js', './js/cloud.js', './js/app.js',
  './manifest.json', './icon.svg',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                  // never cache POST (backups etc.)
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return;      // backup API: always network

  if (url.origin === self.location.origin) {
    // App shell → network-first so updates always apply when online.
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
  } else {
    // Fonts / external assets → cache-first, refresh in background.
    e.respondWith(
      caches.match(req).then(cached => {
        const net = fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => cached);
        return cached || net;
      })
    );
  }
});
