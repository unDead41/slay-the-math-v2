/* Read-only RPG presentation. The engine and existing status badges own all values. */
(function(root){'use strict';
 const Status=typeof module!=='undefined'&&module.exports?require('./combat-status.js'):root.DCCombatStatus;
 const definitions=Object.freeze({
  strength:{name:'Strength',ms:'Kekuatan',motif:'ember'},
  agility:{name:'Agility',ms:'Ketangkasan',motif:'agility'},
  defense:{name:'Defense',ms:'Pertahanan',motif:'armor'},
  block:{name:'Block',ms:'Block',motif:'shield'},
  thorns:{name:'Thorns',ms:'Duri',motif:'thorns'},
  weak:{name:'Weak',ms:'Lemah',motif:'weak',harmful:true},
  vulnerable:{name:'Vulnerable',ms:'Terdedah',motif:'vulnerable',harmful:true}
 });
 function snapshot(run){
  if(run?.scene!=='battle'||!run.battle)return null;
  return {identity:[run.seed,run.started,run.stage,run.depth,run.route?.active??'',run.battle.enemyId].join(':'),seq:run.battle.combatLog?.seq||0,values:Object.fromEntries(Status.view(run,'player').filter(s=>definitions[s.id]).map(s=>[s.id,s.value]))};
 }
 function auras(state){return state?Object.entries(state.values).map(([id,value])=>({id,value,...definitions[id],harmful:!!definitions[id].harmful||value<0})):[];}
 function ambient(run){return auras(snapshot(run));}
 function effects(before,run,lang='en'){
  const after=snapshot(run);if(!before||!after||before.identity!==after.identity||after.seq<before.seq)return [];
  const out=[],bm=['ms','bm'].includes(lang);
  for(const e of run.battle.combatLog?.entries||[]){
   const amount=e.values?.blockAbsorbed;
   if(e.id>before.seq&&e.actor==='enemy'&&e.kind==='enemy-turn'&&Number.isSafeInteger(amount)&&amount>0)out.push({id:'block',kind:'impact',motif:'shield',amount,broken:!after.values.block,label:amount+' Block '+(bm?'diserap':'absorbed'),receipt:e.id});
  }
  for(const [id,d]of Object.entries(definitions)){
   const delta=(after.values[id]||0)-(before.values[id]||0);if(!delta)continue;
   const kind=['block','thorns'].includes(id)&&delta<0?'expire':d.harmful?(delta>0?'down':'cleanse'):delta>0?'up':'down';
   out.push({id,kind,motif:d.motif,delta,label:(delta>0?'+':'−')+Math.abs(delta)+' '+(bm?d.ms:d.name)});
  }
  return out;
 }
 // Decorative shapes are code-native; selected card/artifact and status icons stay untouched.
 const shapes={
  shield:'<path class="vfx-surface" d="M120 23 207 65 197 185Q185 264 120 306 55 264 43 185L33 65Z"/><path d="M120 36 193 73 184 182Q173 249 120 290 67 249 56 182L47 73Z"/><path class="vfx-detail" d="M120 57v195M72 112l48-25 48 25M72 167l48-25 48 25"/>',
  armor:'<ellipse cx="120" cy="329" rx="100" ry="19"/><ellipse class="vfx-detail" cx="120" cy="329" rx="85" ry="12"/><path d="m20 266 12-12 12 12-12 12Zm176 0 12-12 12 12-12 12ZM30 237V113m180 124V113M41 99l-11-17-11 17m202 0-11-17-11 17"/>',
  ember:'<ellipse cx="120" cy="330" rx="95" ry="18"/><path class="vfx-surface" d="M34 306q-23-24 0-58-3 22 12 33 7-11 8-26 22 40-20 51Zm174 0q23-24 0-58 3 22-12 33-7-11-8-26-22 40 20 51Z"/><path class="vfx-detail" d="M55 338q65 20 130 0"/>',
  agility:'<path d="M24 293C-2 178 26 99 79 63M38 301C15 189 40 116 85 82M216 293c26-115-2-194-55-230m41 238c23-112-2-185-47-219"/><path class="vfx-detail" d="M49 323q71 24 142 0m-20-270 9-13 7 13-7 12ZM51 53l9-13 7 13-7 12Z"/>',
  thorns:'<ellipse cx="120" cy="326" rx="99" ry="18"/><path class="vfx-surface" d="m24 319-9-29 23 21m24 13-7-32 21 31m28 6 15-35 15 35m29-6 21-31-7 32m24-13 23-21-9 29"/>',
  weak:'<path d="M28 91q-25 24 0 48t0 48-2 53m186-149q25 24 0 48t0 48 2 53"/><path class="vfx-surface" d="m17 247 13 18 13-18m154 0 13 18 13-18M15 295l15 20 15-20m150 0 15 20 15-20"/>',
  vulnerable:'<path d="M34 94 18 143l18 19-14 34 20 34M206 94l16 49-18 19 14 34-20 34M47 309l26 16m94 0 26-16"/><path class="vfx-detail" d="m45 107-8 40 14 16-12 30m156-86 8 40-14 16 12 30M78 339l27 4m30 0 27-4"/>'
 };
 function shape(motif){return '<svg viewBox="0 0 240 360" preserveAspectRatio="none" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(shapes[motif]||shapes.weak)+'</svg>';}
 function create(options={}){
  const doc=options.document||root.document,win=doc.defaultView||root,media=win.matchMedia?.('(prefers-reduced-motion: reduce)');
  let state=null,host=null,dead=false,pageHidden=false,frame=0,generation=0;const animations=new Set();
  const enabled=()=>!dead&&!pageHidden&&!doc.hidden&&options.motion?.()!==false&&!media?.matches;
  const allowed=()=>enabled()&&!doc.querySelector('#dialog[open]');
  function remove(el){const parent=el.parentElement;el.remove();if(host&&parent===host&&!host.childElementCount){host.remove();host=null;}}
  function cancelBursts(){generation++;if(frame)win.cancelAnimationFrame(frame);frame=0;for(const a of animations)a.cancel();animations.clear();host?.querySelectorAll('[data-status-effect]').forEach(el=>el.remove());}
  function cancel(){cancelBursts();host?.remove();host=null;}
  function reset(){cancel();state=null;}
  function ensureHost(){
   const anchor=doc.querySelector('.player .fighter-anchor');if(!anchor)return null;
   if(host?.parentElement===anchor)return host;
   if(host)cancel();host=doc.createElement('div');host.className='status-vfx';host.setAttribute('aria-hidden','true');host.inert=true;anchor.append(host);return host;
  }
  function sync(){
   if(!state||!allowed()){cancel();return;}
   if(host?.isConnected)return;
   const active=auras(state);if(!active.length)return;
   const layer=ensureHost();if(!layer)return;
   for(const aura of active){
    const el=doc.createElement('div');el.className='status-vfx-aura vfx-'+aura.motif+(aura.harmful?' vfx-harmful':'');el.dataset.statusAura=aura.id;el.dataset.statusValue=String(aura.value);el.innerHTML=shape(aura.harmful&&aura.motif!=='vulnerable'?'weak':aura.motif);
    if(aura.id==='strength'&&!aura.harmful)for(let i=0;i<3;i++){const ember=doc.createElement('i');ember.className='status-vfx-ember';ember.style.setProperty('--ember-i',String(i));el.append(ember);}
    layer.append(el);
   }
  }
  function mount(run){reset();state=snapshot(run);sync();}
  function capture(run){cancelBursts();return snapshot(run);}
  function animate(el,frames,timing,done){
   const a=el.animate(frames,{easing:'cubic-bezier(.2,.7,.2,1)',fill:'both',...timing});animations.add(a);
   a.finished.then(()=>{animations.delete(a);done?.();a.cancel();},()=>{animations.delete(a);done?.();});
  }
  function burst(effect,index){
   const layer=ensureHost();if(!layer||typeof layer.animate!=='function')return;
   const el=doc.createElement('div'),up=effect.kind==='up'||effect.kind==='cleanse',delay=index*65;
   el.className='status-vfx-burst vfx-'+effect.motif+' vfx-'+effect.kind;el.dataset.statusEffect=effect.id;el.dataset.statusKind=effect.kind;if(effect.delta!==undefined)el.dataset.statusDelta=String(effect.delta);if(effect.amount!==undefined)el.dataset.absorbed=String(effect.amount);if(effect.broken)el.classList.add('vfx-broken');
   el.innerHTML=shape(effect.kind==='down'?'weak':effect.motif);
   if(effect.kind!=='expire'){
    const label=doc.createElement('span');label.className='status-vfx-label';label.textContent=effect.label;label.style.top=(18+index*11)+'%';el.append(label);
    const count=effect.kind==='impact'?6:5;
    for(let i=0;i<count;i++){
     const p=doc.createElement('i'),x=18+i*16,dx=(i-2.5)*8,dy=up?-65-i*7:effect.kind==='impact'?(i%2?-34:22):50+i*6;
     p.className='status-vfx-particle';p.style.left=x+'%';p.style.top=(effect.kind==='impact'?48:65)+'%';el.append(p);
     animate(p,[{opacity:0,transform:'translate(0,0) scale(.3)'},{offset:.2,opacity:.9},{opacity:0,transform:'translate('+dx+'px,'+dy+'px) rotate(50deg) scale(.2)'}],{duration:620,delay});
    }
   }
   layer.append(el);
   if(effect.kind==='impact')animate(el,[{opacity:0,transform:'translateX(5px) scale(.97)'},{offset:.16,opacity:.95,transform:'translateX(0) scale(1.035)'},{offset:.45,opacity:.65,transform:'scale(1)'},{opacity:0,transform:effect.broken?'scale(1.15)':'scale(1.015)'}],{duration:650,delay},()=>remove(el));
   else if(effect.kind==='expire')animate(el,[{opacity:.42,transform:'scale(1)'},{opacity:0,transform:'scale(1.08)'}],{duration:460,delay},()=>remove(el));
   else animate(el,[{opacity:0,transform:'translateY('+(up?12:-8)+'px) scale(.94)'},{offset:.18,opacity:.9,transform:'translateY(0) scale(1)'},{offset:.55,opacity:.65},{opacity:0,transform:'translateY('+(up?-18:18)+'px) scale(1.04)'}],{duration:850,delay},()=>remove(el));
  }
  function play(before,run,lang='en'){
   cancelBursts();if(!enabled())return;const after=snapshot(run);if(!state||state.identity!==after?.identity)return;
   const cues=effects(before,run,lang).slice(0,4),token=generation;if(!cues.length)return;
   // Confirmed native choices close just after act returns. Show only on the
   // next presentation frame; a new action/dialog/scene cancels this generation.
   frame=win.requestAnimationFrame(()=>{frame=0;if(token===generation&&allowed()&&state?.identity===after.identity)cues.forEach(burst);});
  }
  function hidden(){sync();}
  function pagehide(){pageHidden=true;cancel();}
  function pageshow(){pageHidden=false;sync();}
  const bindings=[[doc,'visibilitychange',hidden],[win,'pagehide',pagehide],[win,'pageshow',pageshow],[win,'resize',cancelBursts],[media,'change',sync]];
  for(const [target,event,handler]of bindings)target?.addEventListener?.(event,handler);
  function destroy(){dead=true;reset();for(const [target,event,handler]of bindings)target?.removeEventListener?.(event,handler);}
  return {mount,capture,play,sync,cancel,reset,destroy};
 }
 const api={snapshot,ambient,effects,create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DCStatusVFX=api;
})(typeof window!=='undefined'?window:globalThis);
