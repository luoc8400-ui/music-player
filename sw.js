const CACHE_NAME = 'music-player-v6';
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
  const AUDIO_EXTS = ['.mp3', '.ogg', '.wav'];
  const isAudio = AUDIO_EXTS.some(ext => url.pathname.endsWith(ext)) || event.request.destination === 'audio';
  const isLyrics = url.pathname.endsWith('.lrc');
  const rangeHeader = event.request.headers.get('range');

  if (isAudio) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isLyrics) {
    event.respondWith(networkFirstCache(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

async function handleAudioRequest(event, url) {
  const normalizedReq = new Request(url.href, { method: 'GET' });
  try {
    const resp = await fetch(event.request);
    // 只缓存完整响应，避免缓存 206 部分内容
    if (resp.ok && resp.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(normalizedReq, resp.clone());
    }
    return resp;
  } catch (e) {
    const cached = await caches.match(normalizedReq);
    return cached || new Response('offline', { status: 503 });
  }
}

async function handleRangeRequest(event, url) {
  const normalizedReq = new Request(url.href, { method: 'GET' });
  const cache = await caches.open(CACHE_NAME);
  let cached = await cache.match(normalizedReq);

  // 没有缓存完整文件时，先抓取整文件并缓存
  if (!cached) {
    const networkResp = await fetch(normalizedReq);
    if (!networkResp.ok) return networkResp;
    if (networkResp.status === 200) {
      await cache.put(normalizedReq, networkResp.clone());
    }
    cached = networkResp.clone();
  }

  const buf = await cached.arrayBuffer();
  const { start, end } = parseRangeHeader(event.request.headers.get('range'), buf.byteLength);
  const sliced = buf.slice(start, end + 1);

  const headers = new Headers(cached.headers);
  headers.set('Content-Range', `bytes ${start}-${end}/${buf.byteLength}`);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(end - start + 1));

  return new Response(sliced, { status: 206, headers });
}

function parseRangeHeader(rangeHeader, totalLength) {
  const matches = /bytes=(\d+)-(\d+)?/.exec(rangeHeader || '');
  const start = matches ? Number(matches[1]) : 0;
  const end = matches && matches[2] ? Number(matches[2]) : (totalLength - 1);
  return { start, end };
}

function cacheFirst(req) {
  return caches.match(req).then(res => res || fetch(req));
}

function networkFirstCache(req) {
  return fetch(req)
    .then(resp => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return resp;
    })
    .catch(() => caches.match(req));
}