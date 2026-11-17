// Science Quest service worker: keeps the app usable on a weak or missing connection.
// - App files (/_next/static) are cached the first time they load.
// - Pages are fetched from the network first; if offline, the last copy of that page is used.
// - Supabase API calls are never cached (progress always goes through the save queue).
const VERSION = 'sq-v1';
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase and fonts: straight to the network
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/teacher')) return; // teacher data must be live

  if (url.pathname.startsWith('/_next/static/') || url.pathname === '/icon.svg') {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  const isPage = req.mode === 'navigate' || req.headers.get('RSC') === '1';
  if (isPage) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && !res.redirected) caches.open(PAGES).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('/dashboard')) || Response.error()),
    );
  }
});
