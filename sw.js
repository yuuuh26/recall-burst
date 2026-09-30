const VERSION = '1.0.0-r2';
const PREFIX = 'yuu-recall-burst-v';
const CACHE = PREFIX + VERSION;
const ASSETS = [
  "./assets/icons/maskable-512.png",
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./data/seed.json",
  "./js/characters.js",
  "./js/effects.js",
  "./js/stats.js",
  "./js/audio.js",
  "./js/app.js",
  "./js/backup.js",
  "./js/utils.js",
  "./js/game.js",
  "./js/editor.js",
  "./js/db.js",
  "./js/learning.js",
  "./js/config.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/avatars/koharu/neutral.webp",
  "./assets/avatars/koharu/miss.webp",
  "./assets/avatars/koharu/delight.webp",
  "./assets/avatars/koharu/smile.webp",
  "./assets/avatars/koharu/clear.webp",
  "./assets/avatars/koharu/fever.webp",
  "./assets/avatars/koharu/master.webp",
  "./assets/avatars/koharu/happy.webp"
];
self.addEventListener('install', event => {
  // Do not skipWaiting: an in-progress game keeps its current app version.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Each active worker serves one coherent precached app version.
    const cached = await cache.match(event.request, {ignoreSearch: true});
    if (cached) return cached;
    try { return await fetch(event.request); }
    catch (error) {
      if (event.request.mode === 'navigate') return cache.match('./index.html');
      throw error;
    }
  })());
});
