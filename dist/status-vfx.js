/* Read-only RPG presentation. The engine and existing status badges own all values. */
(function(root){'use strict';
 const Status=typeof module!=='undefined'&&module.exports?require('./combat-status.js'):root.DCCombatStatus;
 const definitions=Object.freeze(Object.fromEntries(Object.entries({
  strength:{motif:'ember'},
  agility:{motif:'agility'},
  defense:{motif:'armor'},
  block:{motif:'shield'},
  thorns:{motif:'thorns'},
  weak:{motif:'weak',harmful:true},
  vulnerable:{motif:'vulnerable',harmful:true}
 }).map(([id,d])=>[id,{...d,name:Status.name(id),ms:Status.name(id,'ms')}])));
 const passiveIds=['blazing_spirit','growing_flame','swift_step','battle_rhythm','rune_armor','lasting_shield','grimoire_ward','ember_core','clear_mind','last_ember'].map(s=>'stm.passive.'+s);
 function actorState(run,role){
  const b=run.battle,equipped=role==='player'?(b.active||[]).map(c=>c.key):[],seen=new Set(),passives=[];
  for(const e of b.combatLog?.entries||[]){
   const id=passiveIds.indexOf(e.source);
   if(e.actor!==role||e.kind!=='passive-trigger'||id<0||!equipped.includes(e.source)||seen.has(e.source))continue;
   seen.add(e.source);passives.push({id,source:e.source,receipt:e.id});
  }
  // The bounded log can discard a first trigger. Existing trigger counters are
  // authoritative for presence; ownership alone must never start a circle.
  const restored=equipped.filter(source=>!seen.has(source)&&b.cardCombat?.counters?.[source]?.triggers>0)
   .sort((a,z)=>(b.cardCombat.counters[a].activatedTurn||0)-(b.cardCombat.counters[z].activatedTurn||0))
   .map(source=>({id:passiveIds.indexOf(source),source,receipt:null})).filter(p=>p.id>=0);
  return {values:Object.fromEntries(Status.view(run,role).filter(s=>definitions[s.id]).map(s=>[s.id,s.value])),equipped,passives:[...restored,...passives]};
 }
 function snapshot(run){
  if(run?.scene!=='battle'||!run.battle)return null;
  const actors={player:actorState(run,'player'),enemy:actorState(run,'enemy')};
  return {identity:[run.seed,run.started,run.stage,run.depth,run.route?.active??'',run.battle.enemyId].join(':'),seq:run.battle.combatLog?.seq||0,hp:run.hp,enemyHp:run.battle.hp,values:actors.player.values,actors};
 }
 function auras(state){return state?Object.entries(state.values).map(([id,value])=>({id,value,...definitions[id],harmful:!!definitions[id].harmful||value<0})):[];}
 function ambient(run){return auras(snapshot(run));}
 function effects(before,run,lang='en'){
  const after=snapshot(run);if(!before||!after||before.identity!==after.identity||after.seq<before.seq)return [];
  const out=[],bm=['ms','bm'].includes(lang);
  for(const e of run.battle.combatLog?.entries||[]){
   const amount=e.values?.blockAbsorbed;
   if(e.id>before.seq&&e.actor==='enemy'&&e.kind==='enemy-turn'&&Number.isSafeInteger(amount)&&amount>0)out.push({id:'block',kind:'impact',motif:'shield',amount,broken:!after.values.block,label:amount+' '+Status.name('block',lang)+' '+(bm?'diserap':'absorbed'),receipt:e.id});
  }
  for(const [id,d]of Object.entries(definitions)){
   const delta=(after.values[id]||0)-(before.values[id]||0);if(!delta)continue;
   const kind=['block','thorns'].includes(id)&&delta<0?'expire':d.harmful?(delta>0?'down':'cleanse'):delta>0?'up':'down';
   out.push({id,kind,motif:d.motif,delta,label:(delta>0?'+':'−')+Math.abs(delta)+' '+Status.name(id,lang)});
  }
  return out;
 }
 // Rank a committed action, not the definition-table order. All omitted labels
 // are retained in one bounded summary; the canonical badges/log stay complete.
 function priority(e){return e.kind==='impact'?(e.broken?100:85):e.kind==='down'?95:e.kind==='cleanse'?80:e.kind==='expire'?10:e.id==='block'?65:50;}
 function visualEvents(before,after,run,entries,cues){
  const out={player:[],enemy:[]},keys=new Set(entries.filter(e=>e.actor==='player'&&e.kind==='card').map(e=>e.key));
  const hits=(run.battle.cardCombat?.receipts||[]).filter(tx=>keys.has(tx.id)).flatMap(tx=>tx.damageEvents||[]),enemyAbsorbed=hits.reduce((n,h)=>n+(h.absorbed||0),0);
  for(const role of ['player','enemy']){
   const prior=before.actors?.[role]?.values||(role==='player'?before.values:{}),next=after.actors[role].values,list=out[role];
   const impact=role==='player'?cues.find(e=>e.kind==='impact'):enemyAbsorbed>0?{broken:!next.block&&(hits.some(h=>h.hpLost>0)||enemyAbsorbed>=(prior.block||0))}:null;
   if(impact)list.push({id:'block',event:impact.broken?'break':'hit'});
   const retaliation=role==='player'&&entries.some(e=>e.kind==='retaliation'&&e.values?.requestedDamage>0);
   if(retaliation)list.push({id:'thorns',event:'hit'});
   for(const id of Object.keys(definitions)){
    const from=prior[id]||0,to=next[id]||0;if(from===to)continue;
    if(['strength','agility','defense'].includes(id))list.push({id,event:to>from?'up':'down',from});
    else if(id==='block'){if(!impact&&(!to||to>from))list.push({id,event:to>from?'gain':'expire',from});}
    else if(!from&&to)list.push({id,event:'gain'});
    else if(from&&!to)list.push({id,event:'expire'});
   }
  }
  return out;
 }
 function plan(before,run,lang='en',{passives=[],transfers=[],compact=false}={}){
  const after=snapshot(run);if(!before||!after||before.identity!==after.identity||after.seq<before.seq)return {cues:[],passives:[],leadMs:0,sound:null};
  const entries=(run.battle.combatLog?.entries||[]).filter(e=>e.id>before.seq),enemyTurn=entries.some(e=>e.actor==='enemy'&&e.kind==='enemy-turn');
  const leadMs=enemyTurn?60:transfers.some(t=>t.from==='hand')?40:0;
  const ordered=passives.map(e=>({...e})).sort((a,b)=>Number(b.motif==='last-ember')-Number(a.motif==='last-ember'));
  let cues=effects(before,run,lang).map(e=>({...e}));
  // A partial shield hit followed by turn-start expiry is not a broken shield.
  // HP loss after actual absorption proves depletion even if a refill follows.
  for(const e of cues)if(e.kind==='impact'){
   const receipt=entries.find(x=>x.id===e.receipt);
   e.broken=receipt?.values?.hpLost>0;
   // Without HP loss, only infer an exact depletion when no artifact can add
   // Block before/during the enemy turn and no Passive awards Block mid-hit.
   if(!e.broken&&!run.artifactState?.owned?.length&&!entries.some(x=>x.kind==='passive-trigger'&&x.values?.block>0))e.broken=(before.values.block||0)>0&&e.amount>=before.values.block;
  }
  if(cues.some(e=>e.kind==='impact'))cues=cues.filter(e=>e.id!=='block'||e.kind!=='expire');
  const visuals=visualEvents(before,after,run,entries,cues);
  for(const e of cues){
   const owners=ordered.map((p,i)=>({p,i})).filter(({p})=>p.changes?.[e.id]>0);
   const covered=e.delta>0&&owners.length&&owners.reduce((n,{p})=>n+p.changes[e.id],0)===e.delta;
   if(covered){e.labelOwner=owners.map(({p})=>p.source);e.passiveIndex=owners[0].i;}
  }
  cues.sort((a,b)=>priority(b)-priority(a));
  if(cues.length>4){const extra=cues.splice(3);cues.push({id:'summary',kind:'summary',motif:'summary',items:extra,label:extra.filter(e=>!e.labelOwner&&e.kind!=='expire').map(e=>e.label).join(' · ')});}
  let sound=null;
  if(cues.some(e=>e.kind==='impact'&&e.broken))sound='shield-break';
  else if(after.hp<before.hp||after.enemyHp<before.enemyHp)sound='hit';
  else if(cues.some(e=>e.kind==='impact'))sound='shield-hit';
  else if(cues.some(e=>e.kind==='down'))sound='stat-down';
  else if(cues.some(e=>e.kind==='cleanse'))sound='cleanse';
  else if(cues.some(e=>e.id==='block'&&e.kind==='up'))sound='shield-gain';
  else if(ordered.length)sound='passive';
  else if(cues.some(e=>e.kind==='up'))sound='stat-up';
  else if(cues.some(e=>e.kind==='expire'))sound='shield-expire';
  else if(transfers.some(t=>t.to==='exhaust'))sound='exhaust';
  else if(transfers.some(t=>t.to==='hand'))sound='draw';
  else if(transfers.some(t=>t.to==='discard'))sound='discard';
  else if(entries.length)sound='tap';
  return {cues,passives:ordered,leadMs,passiveGapMs:compact?1250:90,sound,visuals};
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
  const layered=!!root.DCCombatVFX,renderer=root.DCCombatVFX?.create({document:doc,motion:options.motion,quality:options.quality});
  let state=null,host=null,dead=false,pageHidden=false,frame=0,generation=0,soundTimer=0;const animations=new Set();
  const quality=()=>options.quality?.()==='low'?'low':'full';
  const audible=()=>!dead&&!pageHidden&&!doc.hidden&&!doc.querySelector('#dialog[open]');
  const enabled=()=>!dead&&!pageHidden&&!doc.hidden&&options.motion?.()!==false&&!media?.matches;
  const allowed=()=>enabled()&&!doc.querySelector('#dialog[open]');
  function remove(el){const parent=el.parentElement;el.remove();if(host&&parent===host&&!host.childElementCount){host.remove();host=null;}}
  // Replaced readouts belong to one action; material lifecycles can span actions.
  function cancelBursts(visuals=true){generation++;if(frame)win.cancelAnimationFrame(frame);frame=0;if(soundTimer)win.clearTimeout(soundTimer);soundTimer=0;for(const a of animations)a.cancel();animations.clear();host?.querySelectorAll('[data-status-effect],.status-vfx-readout').forEach(el=>el.remove());if(visuals)renderer?.cancelBursts();}
  function cancel(){cancelBursts();host?.remove();host=null;renderer?.cancel();}
  function reset(){cancel();state=null;renderer?.reset();}
  function ensureHost(){
   const anchor=doc.querySelector('.player .fighter-anchor');if(!anchor)return null;
   if(host?.parentElement===anchor)return host;
   // DOM patching may remove the previous label host while retaining canvases.
   // Replacing that detached host must not stop a newly scheduled impact.
   host?.remove();host=doc.createElement('div');host.className='status-vfx';host.dataset.quality=quality();host.setAttribute('aria-hidden','true');host.inert=true;anchor.append(host);return host;
  }
  function sync(){
   if(!state||!allowed()){cancel();return;}
   if(layered){renderer?.mount(state);return;}
   if(host?.isConnected)return;
   const active=auras(state);if(!active.length)return;
   const layer=ensureHost();if(!layer)return;layer.classList.toggle('vfx-crowded',active.length>=4);
   for(const aura of active){
    const el=doc.createElement('div');el.className='status-vfx-aura vfx-'+aura.motif+(aura.harmful?' vfx-harmful':'');el.dataset.statusAura=aura.id;el.dataset.statusValue=String(aura.value);el.innerHTML=shape(aura.harmful&&aura.motif!=='vulnerable'?'weak':aura.motif);
    if(aura.id==='strength'&&!aura.harmful&&quality()==='full')for(let i=0;i<3;i++){const ember=doc.createElement('i');ember.className='status-vfx-ember';ember.style.setProperty('--ember-i',String(i));el.append(ember);}
    layer.append(el);
   }
  }
  function mount(run){const next=snapshot(run);if(!renderer||!state||state.identity!==next?.identity||next.seq<state.seq)reset();else cancelBursts(false);state=next;sync();}
  function capture(run){cancelBursts(false);return snapshot(run);}
  function animate(el,frames,timing,done){
   const a=el.animate(frames,{easing:'cubic-bezier(.2,.7,.2,1)',fill:'both',...timing});animations.add(a);
   a.finished.then(()=>{animations.delete(a);done?.();a.cancel();},()=>{animations.delete(a);done?.();});
  }
  function burst(effect,index,batch,readout){
   const layer=ensureHost();if(!layer||typeof layer.animate!=='function')return;
   const el=doc.createElement('div'),up=effect.kind==='up'||effect.kind==='cleanse',delay=batch.leadMs+(effect.passiveIndex===undefined?index*65:effect.passiveIndex*(batch.passiveGapMs||90));
   el.className='status-vfx-burst vfx-'+effect.motif+' vfx-'+effect.kind;el.dataset.statusEffect=effect.id;el.dataset.statusKind=effect.kind;if(effect.delta!==undefined)el.dataset.statusDelta=String(effect.delta);if(effect.amount!==undefined)el.dataset.absorbed=String(effect.amount);if(effect.broken)el.classList.add('vfx-broken');
   el.innerHTML=layered||effect.kind==='summary'?'':shape(effect.kind==='down'?'weak':effect.motif);
   if(effect.kind!=='expire'){
    if(effect.label&&!effect.labelOwner){const label=doc.createElement('span');label.className='status-vfx-label vfx-'+effect.motif+' vfx-'+effect.kind;label.textContent=effect.label;readout.append(label);animate(label,[{opacity:0,transform:'translateY(6px)'},{offset:.2,opacity:1,transform:'translateY(0)'},{offset:.75,opacity:1},{opacity:0,transform:'translateY(-5px)'}],{duration:1000,delay},()=>{label.remove();if(!readout.childElementCount)readout.remove();});}
    const count=layered||effect.kind==='summary'?0:quality()==='low'?2:effect.kind==='impact'?6:5;
    for(let i=0;i<count;i++){
     const p=doc.createElement('i'),x=18+i*16,dx=(i-2.5)*8,dy=up?-65-i*7:effect.kind==='impact'?(i%2?-34:22):50+i*6;
     p.className='status-vfx-particle';p.style.left=x+'%';p.style.top=(effect.kind==='impact'?48:65)+'%';el.append(p);
     animate(p,[{opacity:0,transform:'translate(0,0) scale(.3)'},{offset:.2,opacity:.9},{opacity:0,transform:'translate('+dx+'px,'+dy+'px) rotate(50deg) scale(.2)'}],{duration:620,delay});
    }
   }
   layer.append(el);
   if(effect.kind==='impact'){
    if(!layered&&effect.broken&&quality()==='full')for(let i=0;i<4;i++){const shard=doc.createElement('i');shard.className='status-vfx-shard';shard.style.left=(22+i*18)+'%';shard.style.top=(32+i%2*22)+'%';el.append(shard);animate(shard,[{opacity:0,transform:'translate(0,0) rotate(0)'},{offset:.2,opacity:1},{opacity:0,transform:'translate('+((i-1.5)*28)+'px,'+(25+i%2*20)+'px) rotate('+((i-1.5)*45)+'deg)'}],{duration:620,delay});}
    animate(el,[{opacity:0,transform:'translateX(5px) scale(.97)'},{offset:.16,opacity:.95,transform:'translateX(0) scale(1.035)'},{offset:.45,opacity:.65,transform:'scale(1)'},{opacity:0,transform:effect.broken?'scale(1.15)':'scale(1.015)'}],{duration:650,delay},()=>remove(el));
   }
   else if(effect.kind==='expire')animate(el,[{opacity:.42,transform:'scale(1)'},{opacity:0,transform:'scale(1.08)'}],{duration:460,delay},()=>remove(el));
   else animate(el,[{opacity:0,transform:'translateY('+(up?12:-8)+'px) scale(.94)'},{offset:.18,opacity:.9,transform:'translateY(0) scale(1)'},{offset:.55,opacity:.65},{opacity:0,transform:'translateY('+(up?-18:18)+'px) scale(1.04)'}],{duration:850,delay},()=>remove(el));
  }
  function play(before,run,lang='en',presentation){
   cancelBursts(false);const after=snapshot(run);if(!state||state.identity!==after?.identity||dead||pageHidden||doc.hidden)return;
   const batch=presentation||plan(before,run,lang),token=generation;if(!batch.cues.length&&!batch.sound&&!Object.values(batch.visuals||{}).some(v=>v.length))return;
   renderer?.play(batch);
   // Confirmed native choices close just after act returns. Show only on the
   // next presentation frame; a new action/dialog/scene cancels this generation.
   frame=win.requestAnimationFrame(()=>{frame=0;if(token!==generation||!audible()||state?.identity!==after.identity)return;
    if(batch.sound&&options.onSound)soundTimer=win.setTimeout(()=>{soundTimer=0;if(token===generation&&audible())options.onSound(batch.sound);},enabled()?batch.leadMs:0);
    if(allowed()&&batch.cues.length){
     const layer=ensureHost();if(!layer)return;const readout=doc.createElement('div');readout.className='status-vfx-readout';layer.append(readout);batch.cues.forEach((e,i)=>burst(e,i,batch,readout));
     if(!readout.childElementCount)readout.remove();
     else{
      // Fit the entire bounded label stack above HP, including a wrapped
      // remainder summary in short landscape. Geometry never changes gameplay.
      const panel=doc.querySelector('.player .fighter-panel'),arena=doc.querySelector('.battle-theatre');
      if(panel&&arena){const r=readout.getBoundingClientRect(),a=arena.getBoundingClientRect(),p=panel.getBoundingClientRect(),h=layer.getBoundingClientRect(),scale=layer.offsetHeight?h.height/layer.offsetHeight:1;
       if(r.height>0&&r.bottom>p.top-5){const top=Math.max(a.top+5,Math.min(r.top,p.top-r.height-5));readout.style.top=(readout.offsetTop+(top-r.top)/(scale||1))+'px';}
      }
     }
    }
   });
  }
  function hidden(){sync();}
  function pagehide(){pageHidden=true;cancel();}
  function pageshow(){pageHidden=false;sync();}
  const bindings=[[doc,'visibilitychange',hidden],[win,'pagehide',pagehide],[win,'pageshow',pageshow],[win,'resize',cancelBursts],[media,'change',sync]];
  for(const [target,event,handler]of bindings)target?.addEventListener?.(event,handler);
  function destroy(){dead=true;reset();renderer?.destroy();for(const [target,event,handler]of bindings)target?.removeEventListener?.(event,handler);}
  return {mount,capture,play,sync,cancel,reset,destroy};
 }
 const api={snapshot,ambient,effects,plan,create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DCStatusVFX=api;
})(typeof window!=='undefined'?window:globalThis);
