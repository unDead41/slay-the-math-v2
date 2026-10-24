/* Only verified static assets for the requesting project's manifest. Never cache HTML/APIs/player data. */
'use strict';
const clientsById=new Map();
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
 const data=event.data;if(data?.type!=='STM_RESOURCES'||!event.source?.id)return;
 try{const base=new URL(data.base);if(base.origin!==self.location.origin||base.href!==new URL('./',self.location.href).href||!data.cacheName.startsWith('stm-assets-'+encodeURIComponent(base.pathname)+'-'))return;
 const allowed=new Map();for(const e of data.entries){const url=new URL(e.url,base);if(url.origin===base.origin&&url.pathname.startsWith(base.pathname)&&!url.pathname.includes('/__dev/')&&!url.pathname.includes('/api/'))allowed.set(url.pathname,{key:url.href,hash:e.sha256});}
 clientsById.set(event.source.id,{cacheName:data.cacheName,allowed});
 }catch(_){}
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||event.request.mode==='navigate')return;
 const config=clientsById.get(event.clientId),url=new URL(event.request.url),asset=config?.allowed.get(url.pathname);if(!asset||url.origin!==self.location.origin)return;
 const version=url.searchParams.get('v');if(version&&version!==asset.hash&&version!==asset.hash.slice(0,16))return;
 event.respondWith(caches.open(config.cacheName).then(cache=>cache.match(asset.key)).then(response=>response||fetch(event.request)));
});
