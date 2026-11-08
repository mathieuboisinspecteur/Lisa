/* Service worker de Lisa : permet l'utilisation sans réseau. */
const CACHE="lisa-v15";
const LOCAL=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png"];
const LIBS=["https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js","https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);
await Promise.all(LOCAL.map(u=>c.add(new Request(u,{cache:"reload"})).catch(()=>{})));
await Promise.all(LIBS.map(u=>fetch(new Request(u,{mode:"no-cors"})).then(r=>c.put(u,r)).catch(()=>{})));
self.skipWaiting()})())});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE&&k.startsWith("lisa-"))await caches.delete(k);await self.clients.claim()})())});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
const same=u.origin===self.location.origin,lib=r.destination==="script"&&!same;
if(!same&&!lib)return;
e.respondWith((async()=>{const c=await caches.open(CACHE);const hit=await c.match(r,{ignoreSearch:same});
const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res}).catch(()=>null);
if(hit){e.waitUntil(net);return hit}
const res=await net;if(res)return res;
if(r.mode==="navigate"){const f=await c.match("index.html")||await c.match("./");if(f)return f}
return new Response("",{status:504,statusText:"Hors ligne"})})())});
