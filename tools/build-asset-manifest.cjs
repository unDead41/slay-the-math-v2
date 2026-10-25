'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const contentId=entries=>hash(JSON.stringify(entries.map(e=>[e.url,e.sha256]).sort((a,b)=>a[0].localeCompare(b[0])))).slice(0,24);
function build(root,{write=true,output=null}={}){
 const dist=output||path.join(root,'dist'),html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
 const read=name=>{const vm=require('node:vm'),context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(dist,name),'utf8'),context);return context.module.exports;};
 const animation=read('animation-data.js'),icons=read('icon-assets.js'),music=read('music-data.js').assets;
 const actors={},actorPacks=new Map();
 for(const [id,a]of Object.entries({...animation.actors,mc_01:animation.hero})){
  const pack=id==='mc_01'?'hero':id==='sentinel'?'boss1':id==='dealer'?'boss2':'stage'+(a.stage+1);
  const stem={wisp:'ember_mirror',beetle:'prism_guard',bat:'rune_bat',knight:'mirror_knight',shard:'polished_shard_beast'}[id];
  const posters=a.posters||Object.fromEntries(['standing','attack','defend','skill','damage'].map(p=>[p==='standing'?'idle':p,'ground-'+stem+'-'+p+'.webp']));
  const files=[...new Set([...Object.values(a.animations).map(x=>'assets/'+x.image),...Object.values(posters).map(x=>'assets/'+x)])];
  actors[id]={pack,files,idle:'assets/'+a.animations.idle.image,poster:'assets/'+posters.idle};for(const f of files)actorPacks.set(f,pack);
 }
 const functionalIcons=new Set([...Object.values(icons.ui).map(x=>'assets/'+x),...Object.values(icons.status).map(x=>x.startsWith('assets/')?x:'assets/'+x)]);
 const core=new Set(['assets/menu-corridor.webp','assets/math-emblem.svg','assets/music/menu_ancient_stone_keep.mp3',...functionalIcons]);
 // Stylesheet backgrounds are prepared and rewritten to verified object URLs.
 for(const name of fs.readdirSync(dist).filter(name=>name.endsWith('.css')))for(const m of fs.readFileSync(path.join(dist,name),'utf8').matchAll(/url\(['"]?(assets\/[^)'"\s]+)['"]?\)/g))core.add(m[1]);
 const activeAudio=new Set(Object.values(music.assets).flatMap(a=>a.srcs));
 const scripts=[...html.matchAll(/<script src="([^"]+)"([^>]*)>/g)].map(m=>({url:m[1].split('?')[0],lazy:m[2].includes('stm-practice'),runtime:m[2].includes('stm-runtime')}));
 const scriptSet=new Set(scripts.filter(x=>!x.lazy).map(x=>x.url));
 const entries=[];function walk(dir,prefix=''){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const url=prefix+item.name;if(item.isDirectory()){if(!url.startsWith('__dev'))walk(path.join(dir,item.name),url+'/');continue;}
  if(!/\.(?:js|css|svg|png|webp|jpg|mp3|ogg|woff2?)$/i.test(url)||['sw.js'].includes(url))continue;
  if(/^assets\/ground-alyssa-(standing|attack|defend|skill|damage)\.webp$/.test(url))continue;
  if(/\.(mp3|ogg)$/.test(url)&&!activeAudio.has(url))continue;
  let pack=url==='education-practice.js'?'practice':core.has(url)||scriptSet.has(url)||!url.startsWith('assets/')&&/\.css$/.test(url)?'core':actorPacks.get(url)||/^assets\/tutorial\//.test(url)&&'tutorial'||/^assets\/menu-/.test(url)&&'menu'||activeAudio.has(url)&&'audio'||'common';
  const bytes=fs.readFileSync(path.join(dir,item.name));entries.push({url,bytes:bytes.length,sha256:hash(bytes),pack,kind:/\.(mp3|ogg)$/.test(url)?'audio':/\.(webp|png|jpg|svg)$/.test(url)?'image':'code',required:pack==='core'&&!/\.(mp3|ogg)$/.test(url)&&!functionalIcons.has(url)});
 }}walk(dist);entries.sort((a,b)=>a.url.localeCompare(b.url));
 const important=entries.filter(e=>['core','hero','stage1','menu'].includes(e.pack)||e.pack==='common'&&/^assets\/(?:cards-|stm_icon_|artifact-|situation-|map-|math-artifacts|arena-(?:elite-1|normal-1))/.test(e.url));
 const initialActors=new Set(Object.values(actors).filter(a=>a.pack==='stage1').flatMap(a=>[a.idle,a.poster]));
 const rank=e=>e.required?0:functionalIcons.has(e.url)?5:e.pack==='hero'?1:initialActors.has(e.url)||e.url===music.assets.menu.srcs[0]?2:e.pack==='stage1'?4:3;
 important.sort((a,b)=>rank(a)-rank(b)||a.url.localeCompare(b.url));
 const startup={ratio:.75,urls:important.map(e=>e.url)};
 const out={schemaVersion:1,gameVersion:JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version,manifestId:contentId(entries),entries,scripts,startup,styles:[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m=>m[1].split('?')[0]),actors,menuAudio:music.assets.menu.srcs[0]};
 if(write)fs.writeFileSync(path.join(dist,'asset-manifest.json'),JSON.stringify(out));return out;
}
build.contentId=contentId;module.exports=build;if(require.main===module){const out=build(path.resolve(__dirname,'..'));console.log('Resource manifest: '+out.entries.length+' files; '+out.manifestId);}
