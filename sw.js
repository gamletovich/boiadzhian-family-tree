// Офлайн-оболочка. Кэшируется только сама страница (она и так публична: дерево в ней зашифровано), манифест и значки.
// Пароль, ключ и расшифрованное дерево сюда не попадают: расшифровка идёт в памяти страницы, не через сеть. Версия кэша — от хэша страницы.
const CACHE = 'family-tree-beb058ca2fec';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'}))))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;                // формы, Umami и прочее — мимо кэша
  const base = new URL('./', location.href).pathname, key = u.pathname.startsWith(base) ? u.pathname.slice(base.length) || './' : '';
  if (!SHELL.includes(key)) return;                                              // только оболочка; всё остальное (в т. ч. files/*.bin) — как обычно
  e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); } return res; })   // сначала сеть: свежая версия сразу после публикации
    .catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || caches.match('index.html'))));                                   // нет сети — копия из кэша
});
