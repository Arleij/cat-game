/* Kurosuke offline cache.
   Bump CACHE after changing index.html so the old copy is thrown away. */
var CACHE='kurosuke-v2';
var ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);})
    .then(function(){return self.skipWaiting();}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){return self.clients.claim();}));
});

/* Serve from cache instantly, refresh in the background for the next launch. */
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(function(hit){
    var net=fetch(e.request).then(function(res){
      if(res && res.status===200 && res.type==='basic'){
        var copy=res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request,copy); });
      }
      return res;
    }).catch(function(){ return hit; });
    return hit || net;
  }));
});
