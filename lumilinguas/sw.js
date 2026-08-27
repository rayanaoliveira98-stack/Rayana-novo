/* LumiLínguas — Service Worker: funcionamento offline completo.
 * Pré-cacheia app + conteúdo; estratégia cache-first (o conteúdo é local).
 * Ao publicar nova versão, troque CACHE_VERSION.
 */
var CACHE_VERSION = 'lumilinguas-v1';

var ASSETS = [
  './',
  'index.html',
  'admin.html',
  'css/app.css',
  'manifest.webmanifest',
  'icons/icon.svg',
  'js/langs.js',
  'js/srs.js',
  'js/session.js',
  'js/gate.js',
  'js/store.js',
  'js/audio.js',
  'js/speech.js',
  'js/activities.js',
  'js/parent.js',
  'js/app.js',
  'content/curriculum.js',
  'content/pack-pt.js',
  'content/pack-en.js',
  'content/pack-de.js',
  'content/pack-es.js',
  'content/pack-fr.js',
  'content/pack-it.js',
  'content/pack-tr.js',
  'content/pack-zh.js',
  'content/pack-ja.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res && res.ok && new URL(e.request.url).origin === location.origin) {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      });
    })
  );
});
