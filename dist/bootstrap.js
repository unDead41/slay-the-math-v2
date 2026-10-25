/* First visit and scene resources. Presentation never owns engine decisions. */
(function(host){'use strict';
if(!host.document?.currentScript||!host.STMAssetReadiness)return;
const doc=host.document,base=new URL('.',doc.baseURI),MAX_WAIT=180000,loaded=new Set(),visuals=new Map();
const imageJobs=new WeakMap();
const EMPTY='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
let currentRun=null,pendingEntry=false,permitEntry=null,retryAction=null,panelOwner=0,scenePreparation=null;
let downloadTimer=null,downloadAllRunning=false,needsReload=false,entered=false,codeReady=false,downloadPaused=false,manualFull=false,downloadSettling=false,startup,backgroundQueue;
let bootGeneration=0,manager,manifest,sceneToken=0,sceneKey='',opening=null,backgroundKey='',startAt,bootTimer,interval,activeSceneTimer;
const byId=id=>doc.getElementById(id),gate=()=>byId('resource-loader');
const offlineChosen=()=>host.STMPlayMode?.snapshot().mode==='offline';
function message(title,detail){byId('resource-title').textContent=title;byId('resource-detail').textContent=detail;}
function progress(p){byId('resource-progress').value=p.totalBytes?Math.min(99,p.loadedBytes/p.totalBytes*100):0;byId('resource-count').textContent=p.verifiedFiles+' / '+p.totalFiles+' files · '+(p.loadedBytes/1048576).toFixed(1)+' / '+(p.totalBytes/1048576).toFixed(1)+' MB';}
function controls({retry=false,enter=false,online=false,settings=codeReady}={}){byId('resource-retry').hidden=!retry;byId('resource-enter').hidden=!enter;byId('resource-online').hidden=!online;const button=byId('resource-settings');if(button)button.hidden=!settings;}
function endClock(){host.clearTimeout(bootTimer);host.clearInterval(interval);}
function invalidateVisuals(){for(const [url,v]of visuals)if(!v.ready){visuals.delete(url);if(v.url)host.URL.revokeObjectURL(v.url);}}
function failure(error,token){if(token!==undefined&&token!==bootGeneration)return;bootGeneration++;endClock();manager?.pause();invalidateVisuals();needsReload=!!error.reload;byId('resource-retry').textContent=needsReload?'Reload Game':'Retry Resources';message('Resources need another try',error.message||'Check your connection, then try again.');controls({retry:true,online:codeReady&&!needsReload&&!offlineChosen()});byId('resource-online').textContent='Continue with current resources';byId('resource-progress').removeAttribute('value');}
function deadline(work,timeoutMs=MAX_WAIT,onTimeout=()=>{}){let timer;return Promise.race([Promise.resolve().then(work),new Promise((_resolve,reject)=>{timer=host.setTimeout(()=>{onTimeout();reject(Error('Loading time limit reached. Retry when your connection is ready.'));},timeoutMs);})]).finally(()=>host.clearTimeout(timer));}
async function execute(url,plain=false){
 const absolute=new URL(url,base).href;if(loaded.has(absolute))return;let source=absolute;
 if(!plain){const response=await manager.fetchAsset(url,{priority:0});source=host.URL.createObjectURL(await response.blob());}
 try{await new Promise((resolve,reject)=>{const script=doc.createElement('script');script.src=source;script.async=false;const onError=event=>{if(event.filename===source){const error=Error('Game code could not start. Reload to try the current build.');error.reload=true;host.removeEventListener('error',onError);reject(error);}};host.addEventListener('error',onError);script.onload=()=>{host.removeEventListener('error',onError);resolve();};script.onerror=()=>{host.removeEventListener('error',onError);reject(Error('Game code could not load. Please reload and retry.'));};doc.body.append(script);});loaded.add(absolute);}finally{if(!plain)host.URL.revokeObjectURL(source);}
}
function assetKey(url){const u=new URL(url,base);return manifest?.entries.find(e=>new URL(e.url,base).href===u.href)?.url;}
function assetURL(url){const key=assetKey(url);return key?visuals.get(key)?.url||EMPTY:EMPTY;}
function decode(url,{priority=0}={}){
 const key=assetKey(url);if(!key)return Promise.reject(Error('Unknown image resource'));
 if(visuals.has(key)){const saved=visuals.get(key);if(saved.fetching&&priority<saved.priority){saved.priority=priority;manager.fetchAsset(key,{priority}).catch(()=>{});}visuals.delete(key);visuals.set(key,saved);return saved.promise;}
 const record={url:null,ready:false,fetching:true,priority};
 record.promise=(async()=>{const response=await manager.fetchAsset(key,{priority});record.fetching=false;const objectURL=host.URL.createObjectURL(await response.blob());record.url=objectURL;const image=new host.Image();image.src=objectURL;await image.decode();if(!image.naturalWidth)throw Error('An image could not be prepared.');if(visuals.get(key)!==record){host.URL.revokeObjectURL(objectURL);throw Error('Image preparation was cancelled');}record.ready=true;return objectURL;})().catch(error=>{if(visuals.get(key)===record)visuals.delete(key);if(record.url)host.URL.revokeObjectURL(record.url);throw error;});
 visuals.set(key,record);return record.promise;
}
function visibleImages(root){return [...root.querySelectorAll('img[data-stm-asset]')].filter(img=>!img.matches('.menu-ambience,.menu-backdrop')||img.classList.contains('active'));}
function imageElement(img){
 const key=img.dataset.stmAsset;if(!key||!manager)return Promise.resolve();
 const current=imageJobs.get(img);if(current?.key===key)return current.promise;
 const saved=visuals.get(key);if(saved?.ready&&img.getAttribute('src')===saved.url&&img.complete&&img.naturalWidth){if(img.dataset.stmImageState!=='ready'){img.dataset.stmImageState='ready';host.DCIconReadiness?.install(doc).refreshImage(img);}return Promise.resolve();}
 const job={key,promise:null};imageJobs.set(img,job);
 const owns=()=>imageJobs.get(img)===job&&img.dataset.stmAsset===key;
 const refresh=()=>host.DCIconReadiness?.install(doc).refreshImage(img);
 img.dataset.stmImageState='pending';refresh();
 job.promise=(async()=>{
  try{const url=await decode(key);if(!img.isConnected||!owns())return;img.loading='eager';if(img.getAttribute('src')!==url)img.src=url;await img.decode();if(!img.isConnected||!owns())return;img.dataset.stmImageState='ready';refresh();}
  catch(error){if(!img.isConnected||!owns())return;img.dataset.stmImageState='failed';img.dispatchEvent(new host.Event('error'));throw error;}
  finally{if(imageJobs.get(img)===job)imageJobs.delete(img);}
 })();return job.promise;
}

function paintImages(root=doc){return Promise.all(visibleImages(root).map(imageElement));}
// Supplier renderers accept a URL string rather than an existing image node.
// A per-resource placeholder lets late completion identify only its own images.
function imageURL(url){
 const key=assetKey(url);if(!key)return EMPTY;
 const saved=visuals.get(key),source=saved?.ready?saved.url:EMPTY+'#stm-asset='+encodeURIComponent(key);
 host.queueMicrotask(()=>{for(const img of doc.images)if(img.getAttribute('src')===source){img.dataset.stmAsset=key;imageElement(img).catch(()=>{});}});
 return source;
}
function pruneVisuals(){
 const keep=new Set([...manifest.entries.filter(e=>e.pack==='core'&&e.kind==='image').map(e=>e.url),...[...doc.querySelectorAll('[data-stm-asset]')].map(el=>el.dataset.stmAsset)]);
 const recent=[...visuals.keys()].slice(-16);for(const [key,v]of visuals)if(v.ready&&!keep.has(key)&&!recent.includes(key)){visuals.delete(key);host.URL.revokeObjectURL(v.url);}
}
async function styles(){
 for(const link of doc.querySelectorAll('link[rel="stylesheet"]')){
  if(link.dataset.stmVerified)continue;const key=assetKey(link.getAttribute('href').split('?')[0]);if(!key)continue;
  let css=await (await manager.fetchAsset(key,{priority:0})).text();
  css=css.replace(/url\(['"]?(assets\/[^)'"\s]+)['"]?\)/g,(_match,url)=>'url("'+assetURL(url)+'")');
  const style=doc.createElement('style');style.dataset.stmVerified=key;style.textContent=css;link.replaceWith(style);
 }
 const icon=doc.querySelector('[data-stm-icon]');if(icon)icon.href=assetURL(icon.dataset.stmIcon);
}
async function worker(required=false){if(!host.navigator.serviceWorker||base.protocol!=='https:'&&base.hostname!=='localhost'&&base.hostname!=='127.0.0.1')return false;
 try{let registration=await host.navigator.serviceWorker.getRegistration?.(base.href);
  if(!registration?.active||!required&&!new URL(host.location.href).searchParams.has('stm-release'))try{registration=await host.navigator.serviceWorker.register(new URL('sw.js',base),{scope:base.pathname});}catch(error){if(!registration?.active)throw error;}
  if(!registration?.active)registration=await Promise.race([host.navigator.serviceWorker.ready,new Promise(r=>host.setTimeout(()=>r(null),1500))]);
  const until=Date.now()+(required?4000:0);
  do{const target=registration?.active||host.navigator.serviceWorker.controller;
   if(target){target.postMessage({type:'STM_RESOURCES',cacheName:manager.cacheName,base:base.href,entries:manifest.entries.map(e=>({url:e.url,sha256:e.sha256}))});
    if(!required)return true;if(host.MessageChannel){const capable=await new Promise(resolve=>{const channel=new host.MessageChannel(),timer=host.setTimeout(()=>{channel.port1.close();resolve(false);},250);channel.port1.onmessage=e=>{host.clearTimeout(timer);channel.port1.close();resolve(e.data?.protocol==='stm-offline-v1');};target.postMessage({type:'STM_OFFLINE_CAPS'},[channel.port2]);});if(capable)return true;}
   }
   if(!required||Date.now()>=until)break;await new Promise(r=>host.setTimeout(r,100));registration=await host.navigator.serviceWorker.getRegistration(base.href);
  }while(Date.now()<until);
 }catch(_){}return false;
}
async function runtime(plain=false){for(const script of doc.querySelectorAll(plain?'script[type="application/stm-runtime"],script[type="application/stm-practice"]':'script[type="application/stm-runtime"]'))await execute(script.getAttribute('src'),plain);}
function validateEntrypoint(){
 const byPath=new Map(manifest.entries.map(e=>[new URL(e.url,base).pathname,e]));
 const scripts=[...doc.querySelectorAll('script[type="application/stm-runtime"]')].map(s=>new URL(s.getAttribute('src'),base));
 const expected=manifest.scripts.filter(s=>s.runtime);let valid=scripts.length===expected.length&&scripts.every((s,i)=>s.pathname===new URL(expected[i].url,base).pathname);
 for(const element of doc.querySelectorAll('script[src],link[rel="stylesheet"][href]')){const url=new URL(element.getAttribute('src')||element.getAttribute('href'),base),entry=byPath.get(url.pathname);if(entry&&url.searchParams.has('v')&&url.searchParams.get('v')!==entry.sha256.slice(0,16))valid=false;}
 if(!valid){const error=Error('A newer resource list is available. Reload Game to use one complete build. Your save is safe.');error.reload=true;throw error;}
}
async function boot(){
 const token=++bootGeneration;endClock();controls();codeReady=false;gate().hidden=false;startAt=Date.now();message('Preparing your dungeon','Preparing 75% of the important package. The rest downloads while you play.');
 interval=host.setInterval(()=>{byId('resource-time').textContent=Math.max(0,180-Math.floor((Date.now()-startAt)/1000))+' seconds remaining';},1000);
 bootTimer=host.setTimeout(()=>failure(Error('The 3-minute loading limit was reached. Your progress is safe. Check your connection and retry.'),token),MAX_WAIT);
 try{
  if(!manifest){const manifestURL=new URL('asset-manifest.json',base),pinned=new URL(host.location.href).searchParams.get('stm-release');if(pinned)manifestURL.searchParams.set('stm-release',pinned);const response=await host.fetch(manifestURL,{cache:'no-store',signal:host.AbortSignal.timeout(MAX_WAIT)});if(!response.ok)throw Error('The download list could not load. Please reload and retry.');manifest=await response.json();if(pinned&&manifest.offline?.releaseId!==pinned)throw Error('The installed offline release does not match this page. Open the game address again.');manager=host.STMAssetReadiness.create({host,base:base.href,manifest});api.manager=manager;startup=host.STMAssetReadiness.startupPlan(manifest);
   if(manifest.offline&&host.STMOfflineInstall){api.offline=host.STMOfflineInstall.create({host,base:base.href,manifest,manager,ensureWorker:()=>worker(true)});api.offline.subscribe(s=>{if(entered)downloadStatus();else if(codeReady&&offlineChosen()){byId('resource-progress').value=s.percent;byId('resource-count').textContent=s.verifiedFiles+' / '+s.totalFiles+' files · '+(s.verifiedBytes/1048576).toFixed(1)+' / '+(s.totalBytes/1048576).toFixed(1)+' MB';}});}
   backgroundQueue=host.STMAssetReadiness.createBackgroundQueue({manager,canRun:priority=>entered&&!offlineChosen()&&!['checking','downloading'].includes(api.offline?.phase)&&!downloadPaused&&!doc.hidden&&host.navigator.onLine!==false&&(manager.cacheMode==='persistent'||priority<85||manualFull),limit:()=>!doc.body.classList.contains('home-active')&&currentRun?.scene==='battle'?1:2,onChange:()=>{
    if(!entered||!backgroundQueue)return;const q=backgroundQueue.stats();
    if(!q.active&&!q.queued&&!downloadSettling){downloadSettling=true;manager.reconcile().then(()=>{if(entered){automatic();downloadStatus();}}).finally(()=>{downloadSettling=false;});}
    else if(!q.active)downloadStatus();
   }});
  }
  if(token!==bootGeneration)return;validateEntrypoint();manager.resume();await manager.reconcile({retryStorage:true});if(token!==bootGeneration)return;await worker();if(token!==bootGeneration)return;
  const required=manifest.entries.filter(e=>e.pack==='core'&&e.required),startupProgress=()=>progress(manager.progress(startup.urls));await manager.prepare(required.map(e=>e.url),{onProgress:startupProgress,timeoutMs:Math.max(1,MAX_WAIT-(Date.now()-startAt))});
  if(token!==bootGeneration)return;message('Preparing images','Checking the first screen before opening it.');await Promise.all(required.filter(e=>e.kind==='image').map(e=>decode(e.url)));
  if(token!==bootGeneration)return;await styles();if(token!==bootGeneration)return;await runtime();if(token!==bootGeneration)return;codeReady=true;
  if(offlineChosen()){if(!api.offline){const error=Error('This release has no complete offline package. Reload Game, then retry.');error.reload=true;throw error;}endClock();message('Preparing the complete offline game','Keep this page open until every file has been saved and verified.');byId('resource-time').textContent='Complete offline preparation can take longer than 3 minutes.';const s=await api.offline.install();if(token!==bootGeneration)return;if(!s.ready)throw Error(s.error||'Offline preparation is incomplete. Reconnect and Retry.');message('Ready to play offline','All files for this release have been saved and verified.');controls({enter:true});return;}
  if(manager.cacheMode!=='persistent'){endClock();startupProgress();message('Browser storage unavailable','Browser storage is unavailable. Essential files are ready; other files load when needed.');byId('resource-online').textContent='Continue with current resources';byId('resource-time').textContent='The 75% package has not been saved on this browser.';controls({online:true,retry:true});return;}
  message('Preparing important resources','Preparing 75% of the important package. The rest downloads while you play.');
  await manager.prepare(startup.beforeMenu,{onProgress:startupProgress,timeoutMs:Math.max(1,MAX_WAIT-(Date.now()-startAt))});if(token!==bootGeneration)return;
  if(manager.cacheMode!=='persistent')throw Error('Browser storage filled up. Retry or continue online with essential files.');
  if(Date.now()-startAt>=MAX_WAIT)throw Error('The loading limit was reached. Retry to finish.');
  endClock();startupProgress();message('Your dungeon is ready','At least 75% of the important package is ready. The rest downloads automatically after Enter.');byId('resource-time').textContent='Verified resources are saved on this browser.';controls({enter:true});
  manager.fetchAsset(manifest.menuAudio,{priority:5}).catch(()=>{byId('resource-online').hidden=false;});
 }catch(error){failure(error,token);}
}
function later(url,priority){backgroundQueue?.enqueue(url,priority);}
function automatic(all=false){if(!manager||offlineChosen()||manager.cacheMode!=='persistent'&&!all)return;const important=new Set(startup.urls);for(const e of manifest.entries){if(!all&&e.pack==='practice')continue;later(e.url,important.has(e.url)?80:e.pack==='boss2'?99:e.pack==='stage2'?96:e.pack==='boss1'?95:90);}}
function background(run){if(!manager||!entered||!run)return;const key=String(run.seed)+':'+run.stage;if(backgroundKey===key){backgroundQueue.pump();return;}backgroundKey=key;
 const map=host.DCEngine.getMap(run),actors=new Map();
 for(const node of map.nodes)if(node.enemyId&&node.type!=='boss'&&node.depth>=run.depth){const a=manifest.actors[node.enemyId];if(a)actors.set(node.enemyId,Math.min(actors.get(node.enemyId)??99,node.depth));}
 for(const file of manifest.actors.mc_01.files)later(file,55);
 for(const [id,depth]of actors)for(const file of manifest.actors[id].files)later(file,60+Math.min(20,depth));
 for(const e of manifest.entries.filter(e=>e.pack==='common'&&/assets\/(cards-|stm_icon_|situation-|map-)/.test(e.url)))later(e.url,80);
 for(const e of manifest.entries.filter(e=>e.pack==='boss'+(run.stage+1)))later(e.url,90);
}
function claimPanel(title,blocking=false){const owner=++panelOwner;retryAction=null;host.clearTimeout(activeSceneTimer);const panel=byId('resource-scene');panel.hidden=false;panel.querySelector('strong').textContent=title;panel.querySelector('button').hidden=true;doc.body.classList.toggle('scene-preparing',blocking);return owner;}
function finishPanel(owner){if(owner!==panelOwner)return;byId('resource-scene').hidden=true;doc.body.classList.remove('scene-preparing');}
function failPanel(owner,text,retry,blocking=false){if(owner!==panelOwner)return;host.clearTimeout(activeSceneTimer);const panel=byId('resource-scene');panel.querySelector('strong').textContent=text;panel.querySelector('button').hidden=false;doc.body.classList.toggle('scene-preparing',blocking);retryAction=retry;}
function failedSceneImages(){return visibleImages(doc).some(img=>img.dataset.stmImageState==='failed');}
function failSceneImage(owner,preparing){if(owner!==panelOwner||!failedSceneImages())return;const next=++panelOwner;if(preparing)preparing.imageOwner=next;byId('resource-scene').hidden=false;failPanel(next,'Some artwork could not load. Retry resources.',retryScene,!!preparing?.pending);}
function scene(run,home){
 currentRun=run;if(!manager)return;
 // A new hand/status/poster is a refresh inside the same room. Only actual
 // navigation may hide the arena while its initial resources are prepared.
 const key=home?'home':run?[run.seed,run.started,run.stage,run.scene,run.depth,run.route?.active||'',run.battle?.enemyId||''].join(':'):'practice';
 if(key===sceneKey){const token=sceneToken,owner=panelOwner,preparing=scenePreparation;paintImages().then(()=>{if(token===sceneToken&&owner===panelOwner&&!preparing?.pending&&preparing?.imageOwner===owner&&!failedSceneImages())finishPanel(owner);}).catch(()=>{if(token===sceneToken&&owner===panelOwner)failSceneImage(owner,preparing);});return;}
 sceneKey=key;const token=++sceneToken,owner=++panelOwner;retryAction=null;host.clearTimeout(activeSceneTimer);byId('resource-scene').hidden=true;doc.body.classList.remove('scene-preparing');
 const preparing=scenePreparation={token,owner,pending:true,imageOwner:null};
 background(run);const actorIds=!home&&run?.scene==='battle'?['mc_01',run.battle.enemyId]:[];
 for(const id of actorIds){const actor=manifest.actors[id];if(actor)for(const f of actor.files)manager.fetchAsset(f,{priority:10}).catch(()=>{});}
 if(!home&&run){const panel=byId('resource-scene');doc.body.classList.add('scene-preparing');panel.hidden=false;panel.querySelector('strong').textContent='Preparing this room…';panel.querySelector('button').hidden=true;}
 activeSceneTimer=host.setTimeout(()=>{failPanel(owner,'Some artwork is taking longer. You can retry.',retryScene);},15000);
 Promise.all([paintImages(),...actorIds.map(id=>host.DCActorAnimation.preload(run.stage,id))]).then(()=>new Promise(r=>host.requestAnimationFrame(()=>host.requestAnimationFrame(r)))).then(()=>{if(token!==sceneToken)return;preparing.pending=false;const current=preparing.imageOwner===panelOwner?preparing.imageOwner:owner;if(current!==panelOwner)return;host.clearTimeout(activeSceneTimer);if(failedSceneImages()){byId('resource-scene').hidden=false;failPanel(current,'Some artwork could not load. Retry resources.',retryScene);}else finishPanel(current);pruneVisuals();}).catch(()=>{if(token!==sceneToken)return;preparing.pending=false;failPanel(preparing.imageOwner===panelOwner?preparing.imageOwner:owner,'Some artwork could not load. Retry resources.',retryScene);});
}
function retryScene(){manager.resume();backgroundQueue?.retry();invalidateVisuals();if(currentRun?.scene==='battle')for(const id of ['mc_01',currentRun.battle.enemyId])host.DCActorAnimation.forgetPreload(currentRun.stage,id);sceneKey='';doc.dispatchEvent(new host.CustomEvent('stm-retry-resources'));}
async function practice(){
 if(host.DCEducationPractice)return;if(!manager){const script=doc.querySelector('script[type="application/stm-practice"]');return execute(script.getAttribute('src'),true);}if(opening)return opening;
 manager.resume();backgroundQueue?.retry();const owner=claimPanel('Loading Education Practice · all 120 questions…');
 opening=deadline(async()=>{await manager.preparePack('practice',{timeoutMs:Infinity});const script=doc.querySelector('script[type="application/stm-practice"]');await execute(script.getAttribute('src'));},MAX_WAIT,()=>manager.pause()).then(()=>finishPanel(owner)).catch(error=>{failPanel(owner,'Practice could not load. Retry resources.',()=>doc.dispatchEvent(new host.CustomEvent('stm-retry-practice')));throw error;}).finally(()=>{opening=null;});return opening;
}
function audio(state){const el=byId('resource-audio');if(!el)return;el.hidden=!!state.unlocked&&!state.error||state.muted&&state.voiceMuted;el.textContent=state.error?'Retry Sound':state.unlocked?'Loading Sound…':'Enable Sound';}
function prepareEntry(event){
 const target=event.target.closest?.('[data-action="node"]');if(!target||!manager||!currentRun||currentRun.scene!=='map'||target.disabled)return;
 if(permitEntry===target){permitEntry=null;return;}
 const run=currentRun,node=host.DCEngine.availableNodes(run).find(n=>n.id===target.dataset.id);if(!node)return;
 event.preventDefault();event.stopImmediatePropagation();if(pendingEntry)return;pendingEntry=true;manager.resume();
 const token=sceneToken,ids=node.enemyId?['mc_01',node.enemyId]:[],urls=[];
 for(const id of ids){const a=manifest.actors[id];if(a)urls.push(a.idle,a.poster);}
 if(node.enemyId)urls.push('assets/'+host.DCVisuals.arena(run.stage,node.type==='boss'?'boss':node.type==='elite'?'elite':'normal'));
 else if(node.type==='event')urls.push(...manifest.entries.filter(e=>/^assets\/mystery-.*\.webp$/.test(e.url)).map(e=>e.url));
 else if(node.type==='shop')urls.push('assets/situation-shop.webp');else if(node.type==='camp')urls.push('assets/situation-rest.webp');
 const known=new Set(manifest.entries.map(e=>e.url)),wanted=[...new Set(urls)].filter(u=>known.has(u)),owner=claimPanel('Preparing this room…',true);
 deadline(async()=>{await manager.prepare(wanted,{onProgress:p=>{if(owner===panelOwner)byId('resource-scene').querySelector('strong').textContent='Preparing this room · '+p.verifiedFiles+' / '+p.totalFiles+' resources';},timeoutMs:Infinity});await Promise.all([
  ...wanted.filter(u=>!ids.some(id=>manifest.actors[id]?.idle===u)).map(decode),...ids.map(id=>host.DCActorAnimation.preload(run.stage,id))
 ]);},MAX_WAIT,()=>{manager.pause();invalidateVisuals();for(const id of ids)host.DCActorAnimation.forgetPreload(run.stage,id);}).then(()=>{
  pendingEntry=false;if(currentRun!==run||sceneToken!==token||owner!==panelOwner||!target.isConnected)return;
  finishPanel(owner);permitEntry=target;target.click();
 }).catch(()=>{pendingEntry=false;failPanel(owner,'This room is not ready. Your position is unchanged. Retry resources.',()=>target.click());});
}
const api=host.STMHosted={scene,practice,audio,assetURL,imageURL,imageElement,paintImages,prepareImage:decode,manager:null,offline:null,downloads:()=>({...backgroundQueue?.stats(),paused:downloadPaused,online:manager?.cacheMode!=='persistent',storageMode:manager?.cacheMode,mode:host.STMPlayMode?.snapshot().mode||'online',connectionHint:host.navigator.onLine===false?'disconnected':'unknown'})};
function downloadStatus(){if(!manager)return;const stats=manager.stats(),q=backgroundQueue?.stats()||{active:0,queued:0,failed:0},percent=Math.floor(stats.availableBytes/stats.totalBytes*100),online=stats.cacheMode!=='persistent';
 if(offlineChosen()&&api.offline){const s=api.offline.snapshot();byId('resource-downloads').querySelector('summary').textContent='Offline · '+s.percent+'%';byId('resource-download-status').textContent=s.verifiedFiles+' / '+s.totalFiles+' resources verified · '+(s.verifiedBytes/1048576).toFixed(1)+' / '+(s.totalBytes/1048576).toFixed(1)+' MB';byId('resource-download-mode').textContent=host.STMPlayModeUI?.offlineText(s)||s.phase;byId('resource-download-all').disabled=s.ready;byId('resource-download-all').textContent='Prepare offline / Retry / Resume';byId('resource-download-pause').textContent=s.phase==='paused'?'Resume download':'Pause download';return;}
 byId('resource-downloads').querySelector('summary').textContent='Downloads · '+percent+'%';
 byId('resource-download-status').textContent=stats.availableFiles+' / '+manifest.entries.length+' resources cached · '+(stats.availableBytes/1048576).toFixed(1)+' / '+(stats.totalBytes/1048576).toFixed(1)+' MB · '+(q.queued+q.active)+' pending';
 byId('resource-download-mode').textContent=online?'Browser storage is unavailable. Only current resources are retained.':host.navigator.onLine===false?'Network unavailable: downloads resume when connected.':downloadPaused?'Background downloads paused.':q.failed?'Some downloads failed. Retry remaining resources.':q.active||q.queued?'Downloading automatically in the background…':'Cached game resources are ready. Offline preparation is checked in Settings.';
 byId('resource-download-pause').textContent=downloadPaused?'Resume background downloads':'Pause background downloads';
 if(downloadAllRunning&&!q.active&&!q.queued){downloadAllRunning=false;byId('resource-download-all').disabled=false;}
 byId('resource-download-all').textContent=q.failed?'Retry remaining resources':'Download all resources';
}
function startDownloadStatus(){if(downloadTimer)host.clearInterval(downloadTimer);let ticks=0;downloadStatus();downloadTimer=host.setInterval(()=>{if(doc.hidden)return;if(++ticks%5){downloadStatus();return;}manager.reconcile().then(()=>api.offline?.reconcile()).then(()=>{if(entered){automatic();downloadStatus();}});},1000);}
async function resumeBackground(){if(!manager||!entered)return;manager.resume();await manager.reconcile({retryStorage:true});if(!entered)return;backgroundQueue.retry();backgroundKey='';background(currentRun);automatic(manualFull);backgroundQueue.pump();downloadStatus();}
function enter(){host.DCAudio?.unlock();gate().hidden=true;entered=true;if(manager){byId('resource-downloads').hidden=false;startDownloadStatus();resumeBackground();}doc.querySelector('[data-action="new"]')?.focus();}
function start(){
 host.DCGameLanguage?.install(doc);
 doc.addEventListener('click',prepareEntry,{capture:true});
 byId('resource-download-all').addEventListener('click',async()=>{if(offlineChosen()&&api.offline){api.offline.install();return;}if(downloadAllRunning||!manager)return;downloadAllRunning=true;manualFull=true;downloadPaused=false;byId('resource-download-all').disabled=true;manager.resume();await manager.reconcile({retryStorage:true});backgroundQueue.retry();automatic(true);downloadStatus();});
 byId('resource-download-pause').addEventListener('click',()=>{if(offlineChosen()&&api.offline){if(api.offline.phase==='paused')api.offline.install();else api.offline.pause();return;}downloadPaused=!downloadPaused;if(downloadPaused)backgroundQueue?.pump();else resumeBackground();downloadStatus();});
 host.addEventListener('stm-play-mode-change',()=>{backgroundQueue?.pump();if(entered){if(!offlineChosen())resumeBackground();downloadStatus();}else if(codeReady)boot();});
 doc.addEventListener('visibilitychange',()=>{if(!doc.hidden&&api.offline?.ready)api.offline.audit();});
 host.addEventListener('online',resumeBackground);host.addEventListener('offline',()=>{backgroundQueue?.pump();if(entered)downloadStatus();});doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)resumeBackground();});
 host.addEventListener('pagehide',()=>{host.clearInterval(downloadTimer);downloadTimer=null;});host.addEventListener('pageshow',event=>{if(event.persisted&&manager&&!gate().hidden)downloadStatus();else if(event.persisted&&manager)startDownloadStatus();});
 byId('resource-enter').addEventListener('click',enter);byId('resource-online').addEventListener('click',enter);byId('resource-retry').addEventListener('click',()=>{if(needsReload){host.location.reload();return;}sceneKey='';boot();});byId('resource-audio').addEventListener('click',()=>host.DCAudio?.unlock());byId('resource-scene').querySelector('button').addEventListener('click',()=>{if(retryAction){const retry=retryAction;retryAction=null;retry();}else retryScene();});
 const developer=location.pathname.includes('/__dev/')||[...doc.querySelectorAll('script[type="application/stm-runtime"]')].some(s=>s.getAttribute('src').includes('__dev/'));
 if(base.protocol==='file:'||host.DC_ASSETS||developer){for(const link of doc.querySelectorAll('[data-stm-style]'))link.removeAttribute('media');const icon=doc.querySelector('[data-stm-icon]');if(icon)icon.href=host.DC_ASSETS?.['math-emblem.svg']||new URL(icon.dataset.stmIcon,base).href;runtime(true).then(()=>{gate().hidden=true;}).catch(failure);return;}boot();
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
