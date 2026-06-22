/* ============================================================
   Service Worker · 美食视频工坊离线缓存
   ============================================================ */

const CACHE_NAME = 'recipe-video-studio-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

/* 安装：预缓存核心文件 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS).catch(() => {
        /* 某个文件不存在时不中断安装 */
        return Promise.resolve();
      }))
      .then(() => self.skipWaiting())
  );
});

/* 激活：清理旧版本缓存 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* 请求拦截：先查缓存，缓存失败再走网络 */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  /* 只处理 GET 请求 */
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* 对同源请求使用"缓存优先，回退网络" */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        return (
          cached ||
          fetch(req)
            .then((response) => {
              /* 克隆响应以便一边返回一边写入缓存 */
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, clone).catch(() => {});
              });
              return response;
            })
            .catch(() => {
              /* 网络失败，且无缓存时返回离线首页 */
              return caches.match('./index.html');
            })
        );
      })
    );
    return;
  }

  /* 跨域请求（如字体）走网络优先 */
  event.respondWith(
    fetch(req)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, clone).catch(() => {});
        });
        return response;
      })
      .catch(() => caches.match(req).then((r) => r || Response.error()))
  );
});

/* 手动触发跳过等待（被主页面调用） */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
