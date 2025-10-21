const CACHE_NAME = 'music-player-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './cover.jpg',
  './sw.js'
];

// 安装 Service Worker 并缓存文件
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.map(n => n === CACHE_NAME ? null : caches.delete(n)));
      self.clients.claim();
    })()
  );
});

// 拦截网络请求，优先使用缓存
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isAudio = url.pathname.endsWith('.mp3') || event.request.destination === 'audio';
  const isLyrics = url.pathname.endsWith('.lrc');

  if (isAudio || isLyrics) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(res => res || fetch(event.request))
    );
  }
});