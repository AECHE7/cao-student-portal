// CAO Performers' Hub service worker — caches the app shell for fast/offline
// loading. Never caches script.google.com requests: dashboard data, tasks,
// excuses, stickers, and Wrapped must always come from the live backend.

const CACHE_NAME = "cao-portal-shell-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (event.request.method !== "GET") return;
  if (url.indexOf("script.google.com") !== -1) return;
  if (url.indexOf(self.location.origin) === -1) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});
