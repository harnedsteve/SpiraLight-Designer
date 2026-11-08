const CACHE = "spiralight-designer-v6";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("spiralight-designer-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("message", event => {
  if(event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => {
      if(response.ok && new URL(event.request.url).pathname.endsWith("/index.html")) {
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE).then(cache=>cache.put("./index.html",copy)));
      }
      return response;
    }).catch(()=>caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
