const CACHE_NAME = 'music-player-v3'; // 更新版本号
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './cover.jpg',
  
  // 缓存所有音乐文件
  './DAN DAN 心魅かれてく.mp3',
  './Mojito.mp3',
  './Reality.mp3',
  './Stay With Me.mp3',
  './Waiting for Love.mp3',
  './Whistle.mp3',
  './一眼万年.mp3',
  './七里香.mp3',
  './三生三世.mp3',
  './不为谁而作的歌.mp3',
  './不再见.mp3',
  './不能说的秘密.mp3',
  './世界が終るまでは….mp3',
  './东风破.mp3',
  './习惯失恋.mp3',
  './伤心的人别听慢歌.mp3',
  './你不是真正的快乐.mp3',
  './你瞒我瞒.mp3',
  './依然爱你.mp3',
  './倔强.mp3',
  './兰亭序.mp3',
  './别搞.mp3',
  './到处都是爱.mp3',
  './十七岁.mp3',
  './发如雪.mp3',
  './可惜没有如果.mp3',
  './后来的我们.mp3',
  './告白气球.mp3',
  './嚣张.mp3',
  './天后.mp3',
  './奢香夫人.mp3',
  './女孩.mp3',
  './她说.mp3',
  './好心分手.mp3',
  './孤独颂歌.mp3',
  './少女的祈祷.mp3',
  './干杯.mp3',
  './开往早晨的午夜.mp3',
  './心墙.mp3',
  './心淡.mp3',
  './心跳.mp3',
  './必杀技.mp3',
  './恋爱ing.mp3',
  './我们的歌.mp3',
  './我是如此相信.mp3',
  './我爱你不问归期.mp3',
  './手写的从前.mp3',
  './手心的蔷薇.mp3',
  './搁浅.mp3',
  './改变自己.mp3',
  './断了的弦.mp3',
  './无赖.mp3',
  './易燃易爆炸.mp3',
  './是非题.mp3',
  './晴天.mp3',
  './最后的人.mp3',
  './月半小夜曲.mp3',
  './月牙湾.mp3',
  './杀手.mp3',
  './枫.mp3',
  './派对动物.mp3',
  './海芋恋.mp3',
  './海鸥.mp3',
  './消愁.mp3',
  './烟火里的尘埃.mp3',
  './烟花易冷.mp3',
  './爱一点.mp3',
  './爱的华尔兹.mp3',
  './爱的就是你.mp3',
  './爱错.mp3',
  './珊瑚海.mp3',
  './知足.mp3',
  './稻香.mp3',
  './突然好想你.mp3',
  './第一眼.mp3',
  './等你下课.mp3',
  './简单爱.mp3',
  './算什么男人.mp3',
  './给我一首歌的时间.mp3',
  './编号89757.mp3',
  './美人鱼.mp3',
  './群青.mp3',
  './自娱自乐.mp3',
  './花海.mp3',
  './若月亮还没来.mp3',
  './蒲公英的约定.mp3',
  './西界.mp3',
  './许愿.mp3',
  './说好的幸福呢.mp3',
  './轨迹.mp3',
  './追光者.mp3',
  './那些你很冒险的梦.mp3',
  './那些年.mp3',
  './那年错过的爱情.mp3',
  './需要人陪.mp3',
  './青花瓷.mp3',
  './鲜花.mp3',
  './龙卷风.mp3'
];

// 安装 Service Worker 并缓存文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活 Service Worker 并清理旧缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截网络请求，优先使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有匹配的资源，则返回它
        if (response) {
          return response;
        }
        // 否则，通过网络请求资源，并将其添加到缓存中
        return fetch(event.request).then(
          function(response) {
            // 检查我们是否收到了有效的响应
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});