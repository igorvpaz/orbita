const CACHE = 'orbita-static-v5-theme'
const SHELL = [
  '/theme.js',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
]
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  )
})
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('orbita-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(
        async () =>
          (await caches.match('/offline.html')) ||
          new Response('Sem conexão', { status: 503 }),
      ),
    )
    return
  }
  if (SHELL.includes(url.pathname))
    event.respondWith(
      caches
        .match(event.request, { ignoreSearch: true })
        .then((cached) => cached || fetch(event.request)),
    )
})
