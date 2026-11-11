/* FITARY Journey — Service Worker.
   Zweck: Die App startet auch ohne Netz. Alles, was zum Laufen nötig ist (Shell),
   liegt im Cache; die Daten selbst liegen ohnehin lokal im Gerät (localStorage),
   es wird also nichts an einen Server geschickt.
   Strategie: Navigation = Netz zuerst, Cache als Rückfall (so landen neue Versionen
   sofort). Statische Dateien = Cache zuerst, im Hintergrund erneuern. */

const VERSION = 'fitary-v1';
const SHELL = [
  './',
  'index.html',
  'app.css',
  'app.js',
  'manifest.webmanifest',
  'assets/logo.png',
  'assets/logo-mark.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-maskable-512.png',
  'assets/apple-touch-icon.png',
  'assets/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // Einzeln, damit eine fehlende Datei nicht die ganze Installation kippt.
    await Promise.all(SHELL.map(u => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // Schriften u. Ä. ans Netz durchlassen

  // Seitenaufruf: frisch versuchen, offline aus dem Cache liefern.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put('index.html', fresh.clone());
        return fresh;
      } catch (err) {
        const cache = await caches.open(VERSION);
        return (await cache.match('index.html')) || (await cache.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Statisches: Cache zuerst, still im Hintergrund erneuern.
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => {
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    return hit || (await net) || Response.error();
  })());
});
