const CACHE_NAME = "afc-app-cache";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/calendar.html",
  "/gallery.html",
  "/testimonies.html",
  "/admin.html",
  "/assets/church_logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
