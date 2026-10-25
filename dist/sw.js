/* Verified static player releases only. Never cache API responses or player data. */
'use strict';
const protocol='stm-offline-v1',base=new URL('./',self.location.href),prefix='stm-assets-'+encodeURIComponent(base.pathname)+'-',receiptURL=new URL('.__stm_offline__/complete.json',base).href,clientsById=new Map();
const hash=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
const privatePath=url=>url.origin!==base.origin||!url.pathname.startsWith(base.pathname)||/^(?:__dev|api|backend|tools)(?:\/|$)/.test(url.pathname.slice(base.pathname.length));
const safeEntry=e=>e&&typeof e.url==='string'&&!e.url.startsWith('/')&&!e.url.includes('..')&&!privatePath(new URL(e.url,base))&&Number.isSafeInteger(e.bytes)&&e.bytes>=0&&/^[a-f0-9]{64}$/.test(e.sha256);
async function valid(response,e){if(!response?.ok)return false;const bytes=await response.clone().arrayBuffer();return (e.bytes===undefined||bytes.byteLength===e.bytes)&&await hash(bytes)===e.sha256;}
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
 const data=event.data;if(data?.type==='STM_OFFLINE_CAPS'){event.ports[0]?.postMessage({protocol});return;}
 if(data?.type!=='STM_RESOURCES'||!event.source?.id)return;
 try{if(data.base!==base.href||!data.cacheName.startsWith(prefix)||!Array.isArray(data.entries))return;const allowed=new Map();for(const e of data.entries){const url=new URL(e.url,base);if(!privatePath(url)&&/^[a-f0-9]{64}$/.test(e.sha256))allowed.set(url.pathname,{url:e.url,sha256:e.sha256});}clientsById.set(event.source.id,{cacheName:data.cacheName,allowed});}catch(_){}
});
async function installed(release){
 const result=[];for(const name of await caches.keys()){
  if(!name.startsWith(prefix))continue;
  try{const cache=await caches.open(name),saved=await cache.match(receiptURL);if(!saved?.ok)continue;const r=await saved.json();
   if(r.protocol!==protocol||!/^[a-f0-9]{24}$/.test(r.releaseId)||r.manifestId!==r.releaseId||name!==prefix+r.manifestId||release&&r.releaseId!==release)continue;
   const response=await cache.match(new URL('asset-manifest.json',base).href);if(!response?.ok)continue;const bytes=await response.clone().arrayBuffer();if(await hash(bytes)!==r.manifestHash)continue;
   const manifest=JSON.parse(new TextDecoder().decode(bytes)),files=manifest.offline?.files;
   if(manifest.manifestId!==r.manifestId||manifest.offline.releaseId!==r.releaseId||!Array.isArray(files)||!files.every(safeEntry)||JSON.stringify(r.files)!==JSON.stringify(files.map(e=>[e.url,e.bytes,e.sha256])))continue;
   const allowed=new Map(files.map(e=>[new URL(e.url,base).pathname,e]));allowed.set(new URL('asset-manifest.json',base).pathname,{url:'asset-manifest.json',sha256:r.manifestHash,bytes:bytes.byteLength});
   result.push({cache,allowed,releaseId:r.releaseId,completedAt:r.completedAt||0});
  }catch(_){}
 }return result.sort((a,b)=>b.completedAt-a.completedAt);
}
async function complete(candidate,verify=true){const keys=new Set((await candidate.cache.keys()).map(r=>r.url));for(const e of candidate.allowed.values()){if(!keys.has(new URL(e.url,base).href)||verify&&!await cached(candidate,e))return false;}return true;}
async function cached(candidate,e){const response=await candidate.cache.match(new URL(e.url,base).href);return await valid(response,e)?response:null;}
function unavailable(){return new Response('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Offline preparation needed</title><body><h1>Offline preparation needed / Persediaan offline diperlukan</h1><p>The complete game is not available on this browser. Connect to the game address, then use Settings to retry or resume.</p><p>Game belum lengkap pada browser ini. Sambung ke alamat game, kemudian buka Tetapan untuk cuba lagi atau sambung muat turun.</p><a href="./">Try again / Cuba lagi</a></body></html>',{status:503,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});}
async function navigation(request,url){
 const release=url.searchParams.get('stm-release');
 if(!release){try{return await fetch(request);}catch(_){} }
 for(const c of await installed(release)){
  if(!await complete(c,!!release))continue;const entry=c.allowed.get(new URL('index.html',base).pathname);if(!entry||!await cached(c,entry))continue;
  if(!release){const pinned=new URL(url);pinned.searchParams.set('stm-release',c.releaseId);return Response.redirect(pinned.href,307);}
  return cached(c,entry);
 }return unavailable();
}
async function resource(event,url){
 const supplied=url.searchParams.get('stm-release');let release=supplied;
 if(!release&&event.clientId){try{const client=await self.clients.get(event.clientId);if(client)release=new URL(client.url).searchParams.get('stm-release');}catch(_){}}
 const version=url.searchParams.get('v');
 if(release){
  const c=(await installed(release))[0],e=c?.allowed.get(url.pathname);
  if(!e||version&&version!==e.sha256&&version!==e.sha256.slice(0,16))return new Response('Offline release mismatch',{status:409});
  const saved=await cached(c,e);if(saved)return saved;
  try{const response=await fetch(event.request);if(await valid(response,e))return response;}catch(_){}return new Response('Offline file missing or invalid',{status:503});
 }
 const config=clientsById.get(event.clientId),e=config?.allowed.get(url.pathname);
 if(e&&(!version||version===e.sha256||version===e.sha256.slice(0,16))){const response=await (await caches.open(config.cacheName)).match(new URL(e.url,base).href);if(await valid(response,e))return response;}
 if(version&&/^[a-f0-9]{16}(?:[a-f0-9]{48})?$/.test(version))for(const c of await installed()){const entry=c.allowed.get(url.pathname);if(entry&&(version===entry.sha256||version===entry.sha256.slice(0,16))){const response=await cached(c,entry);if(response)return response;}}
 return fetch(event.request);
}
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(privatePath(url))return;
 if(event.request.mode==='navigate'){
  if(![base.pathname,base.pathname+'index.html'].includes(url.pathname))return;
  event.respondWith(navigation(event.request,url));return;
 }
 event.respondWith(resource(event,url));
});
