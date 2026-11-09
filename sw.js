const CACHE="spiralight-designer-v16";
const ASSETS=["./index.html","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("spiralight-designer-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("message",event=>{
 if(event.data&&event.data.type==="SKIP_WAITING")self.skipWaiting();
});
self.addEventListener("fetch",event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=="GET"||url.origin!==self.location.origin)return;
 if(req.mode==="navigate"){
  event.respondWith(fetch(req,{cache:"no-store"}).then(response=>{
   if(response.ok){
    const copy=response.clone();
    event.waitUntil(caches.open(CACHE).then(cache=>cache.put("./index.html",copy)));
   }
   return response;
  }).catch(()=>caches.match("./index.html")));
  return;
 }
 // Never intercept explicit version checks; always ask the network.
 if(url.searchParams.has("updateCheck"))return;
 event.respondWith(caches.match(req).then(hit=>hit||fetch(req)));
});
