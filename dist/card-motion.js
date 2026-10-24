/* Cards are already resolved and saved. This module only presents their receipts. */
(function(root){'use strict';
 const K=typeof module!=='undefined'&&module.exports?require('./card-kit.js'):root.STMCardKit;
 const catalog=new Map(K.data.cards.map(c=>[c.id,c]));
 const motifs={blazing_spirit:'strength',growing_flame:'growth',swift_step:'agility',battle_rhythm:'rhythm',rune_armor:'armor',lasting_shield:'retain',grimoire_ward:'ward',ember_core:'ember',clear_mind:'draw',last_ember:'last-ember'};
 const timings=Object.freeze({draw:220,recall:260,discard:280,exhaust:400,activate:300,shuffle:240,return:240,stagger:32,passive:1250});
 function snapshot(run){if(run?.scene!=='battle'||!run.battle)return null;return {identity:[run.seed,run.started,run.stage,run.depth,run.route?.active||'',run.battle.enemyId].join(':'),seq:run.battle.combatLog?.seq||0};}
 function describe(entry,lang='en'){
  const card=catalog.get(entry?.source);if(entry?.kind!=='passive-trigger'||card?.category!=='passive')return null;
  const v=entry.values||{},bm=['ms','bm'].includes(lang),motif=motifs[card.id.split('.').at(-1)],amount=n=>Number.isFinite(n)?n:0;let detail='';
  if(v.attribute)detail='+'+amount(v.amount)+' '+({strength:'Strength',agility:'Agility',defense:'Defense'}[v.attribute]||v.attribute);
  else if(motif==='retain')detail=amount(v.retained)+' Block '+(bm?'dikekalkan':'kept');
  else if(motif==='draw')detail=amount(v.draw)+' '+(bm?'kad dicabut':amount(v.draw)===1?'card drawn':'cards drawn');
  else if(motif==='ember')detail='−'+amount(v.damage)+' HP';
  else if(motif==='last-ember')detail='+'+amount(v.block)+' Block · +'+amount(v.focus)+' Focus';
  else if(motif==='ward')detail='+'+amount(v.block)+' Block';
  const changes=v.attribute?{[v.attribute]:amount(v.amount)}:motif==='ward'?{block:amount(v.block)}:motif==='last-ember'?{block:amount(v.block),focus:amount(v.focus)}:{};
  return {id:entry.id,source:card.id,title:K.cardName(card,lang),icon:K.assetPath(card.icon),detail,summary:entry.summary,motif,changes,target:motif==='ember'?'enemy':'player'};
 }
 function effects(before,run,lang='en'){
  const after=snapshot(run);if(!before||!after||before.identity!==after.identity||after.seq<before.seq)return [];
  return (run.battle.combatLog?.entries||[]).filter(e=>e.id>before.seq).map(e=>describe(e,lang)).filter(Boolean);
 }
 function plan(transfers){
  const out=[],skip=new Set();
  for(let i=0;i<transfers.length;i++){
   if(skip.has(i))continue;let m={...transfers[i]};
   if(m.to==='resolving'){
    const final=transfers.findIndex((n,j)=>j>i&&n.card.uid===m.card.uid&&n.from==='resolving');
    if(final<0)continue;skip.add(final);m={...transfers[final],from:m.from};
   }
   if(m.from==='discard'&&m.to==='draw'){
    const cards=[m.card];while(i+1<transfers.length&&transfers[i+1].from==='discard'&&transfers[i+1].to==='draw')cards.push(transfers[++i].card);
    out.push({...m,kind:'shuffle',revealed:false,cards,count:cards.length});continue;
   }
   const kind=m.to==='hand'?(m.from==='discard'?'recall':'draw'):m.to==='exhaust'?'exhaust':m.to==='discard'?'discard':m.to==='active'?'activate':m.to==='draw'?'return':null;
   if(kind)out.push({...m,kind});
  }
  return out;
 }
 function create(options={}){
  const doc=options.document||root.document;
  let layer=null,frame=0,dead=false;
  const quality=()=>options.quality?.()==='low'?'low':'full';
  const animations=new Set(),hidden=new Map();
  const visible=()=>!dead&&!doc.hidden&&options.motion?.()!==false&&!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function rect(el){if(!el)return null;const r=el.getBoundingClientRect();return r.width&&r.height?{x:r.x,y:r.y,width:r.width,height:r.height}:null;}
  function geometry(){
   const cards=new Map(),piles=new Map(),passives=new Map();
   for(const el of doc.querySelectorAll('[data-motion-uid]')){if(el.closest('.card-motion-layer'))continue;const r=rect(el);if(r)cards.set(el.dataset.motionUid,{rect:r,node:el});}
   for(const el of doc.querySelectorAll('[data-action="pile"][data-zone]'))piles.set(el.dataset.zone,rect(el));
   for(const el of doc.querySelectorAll('.passive-badge[data-id]'))passives.set(el.dataset.id,{rect:rect(el),node:el});
   return {cards,piles,passives,theatre:rect(doc.querySelector('.battle-theatre')),hand:rect(doc.querySelector('.combat-hand'))};
  }
  function cancel(){
   if(frame)root.cancelAnimationFrame(frame);frame=0;
   for(const a of [...animations])a.cancel();animations.clear();
   for(const [el,value]of hidden)el.style.visibility=value;hidden.clear();
   layer?.remove();layer=null;
  }
  function capture(run){cancel();return {state:snapshot(run),geometry:geometry()};}
  function host(){if(!layer){layer=doc.createElement('div');layer.className='card-motion-layer';layer.dataset.quality=quality();layer.setAttribute('aria-hidden','true');layer.inert=true;doc.body.append(layer);}return layer;}
  function remove(el){el.remove();if(layer&&!layer.childElementCount){layer.remove();layer=null;}}
  function animate(el,frames,settings,done=()=>{}){
   const a=el.animate(frames,{easing:'cubic-bezier(.2,.7,.2,1)',fill:'both',...settings});animations.add(a);
   a.finished.then(()=>{animations.delete(a);done();a.cancel();},()=>{animations.delete(a);done();});return a;
  }
  function reveal(el){if(hidden.has(el)){el.style.visibility=hidden.get(el);hidden.delete(el);}}
  function cardFace(node){
   if(!node)return null;const copy=node.cloneNode(true);
   copy.querySelectorAll('.package-card-action').forEach(el=>el.remove());
   for(const el of [copy,...copy.querySelectorAll('*')]){
    for(const attr of [...el.attributes])if(attr.name==='id'||attr.name==='name'||attr.name.startsWith('aria-')||attr.name.startsWith('data-')||attr.name.startsWith('on'))el.removeAttribute(attr.name);
    if(el.matches('button,input,select,textarea,a,[tabindex]')){el.tabIndex=-1;el.removeAttribute('href');}
    if(el.tagName==='IMG')el.loading='eager';
   }
   copy.removeAttribute('disabled');copy.classList.remove('is-disabled','is-selected');copy.classList.add('card-motion-face');copy.style.visibility='visible';return copy;
  }
  function point(zone,move,before,after){
   const state=zone==='from'?before:after,name=move[zone];
   if(name==='hand'||name==='choice'){const card=state.cards.get(move.card.uid);if(card)return card.rect;}
   if(name==='active'){const badge=state.passives.get(move.card.key);if(badge?.rect)return badge.rect;}
   if(['draw','discard','exhaust'].includes(name)){const pile=state.piles.get(name)||after.piles.get(name);if(pile)return pile;}
   const hand=after.hand;if(hand)return {x:hand.x+hand.width*.45,y:hand.y-75,width:80,height:120};return null;
  }
  function sparks(x,y,delay,motif='exhaust'){
   for(let n=0;n<(quality()==='low'?3:7);n++){
    const dot=doc.createElement('i');dot.className='card-motion-spark '+motif;dot.style.left=x+'px';dot.style.top=y+'px';host().append(dot);
    const angle=(n*137.5-90)*Math.PI/180,reach=20+n*5;
    animate(dot,[{transform:'translate(0,0) scale(1)',opacity:0},{offset:.18,opacity:1},{transform:'translate('+Math.cos(angle)*reach+'px,'+(-18+Math.sin(angle)*reach)+'px) scale(0)',opacity:0}],{duration:380,delay},()=>remove(dot));
   }
  }
  function flight(move,before,after,delay){
   const start=point('from',move,before,after),end=point('to',move,before,after);if(!start||!end)return;
   const incoming=move.to==='hand'?after.cards.get(move.card.uid):null;
   const width=Math.max(64,Math.min(210,(incoming?.rect||before.cards.get(move.card.uid)?.rect||{width:110}).width)),height=width*1.5;
   const el=doc.createElement('div');el.className='card-motion-flight motion-'+move.kind;el.dataset.motionKind=move.kind;if(move.revealed)el.dataset.cardUid=move.card.uid;
   el.style.width=width+'px';el.style.height=height+'px';
   const face=move.revealed?cardFace(incoming?.node||before.cards.get(move.card.uid)?.node):null;
   const back=doc.createElement('div');back.className='card-motion-back';const seal=doc.createElement('span');seal.textContent='✦';back.append(seal);el.append(back);if(face)el.append(face);
   if(move.kind==='shuffle'){const count=doc.createElement('b');count.className='card-motion-stack-count';count.textContent=String(move.count);el.append(count);}
   host().append(el);
   if(incoming&&!hidden.has(incoming.node)){hidden.set(incoming.node,incoming.node.style.visibility);incoming.node.style.visibility='hidden';}
   const scale=r=>Math.max(.12,Math.min(1.2,r.width/width)),sx=start.x+start.width/2-width/2,sy=start.y+start.height/2-height/2,ex=end.x+end.width/2-width/2,ey=end.y+end.height/2-height/2;
   const outgoing=['discard','exhaust'].includes(move.kind),fromAngle=outgoing?-5:-16,toAngle=move.kind==='discard'?24:move.kind==='exhaust'?-28:0;
   const transform=(x,y,s,angle)=>'translate3d('+x+'px,'+y+'px,0) rotate('+angle+'deg) scale('+s+')';
   const duration=timings[move.kind],startScale=scale(start),endScale=move.kind==='exhaust'?.08:scale(end);
   animate(el,[{transform:transform(sx,sy,startScale,fromAngle),opacity:1},{offset:.55,transform:transform((sx+ex)/2,Math.min(sy,ey)-42,(startScale+endScale)/2,move.kind==='discard'?10:-5),opacity:1},{transform:transform(ex,ey,endScale,toAngle),opacity:outgoing||move.kind==='shuffle'||move.kind==='activate'||move.kind==='return'?0:1}],{duration,delay},()=>{if(incoming)reveal(incoming.node);remove(el);});
   if(face){const turn=move.from==='draw'&&move.to==='hand';animate(face,[{opacity:turn?0:1,transform:turn?'rotateY(-85deg)':'rotateY(0)'},{offset:.45,opacity:1,transform:'rotateY(0)'},{opacity:move.kind==='exhaust'?0:1}],{duration,delay});animate(back,[{opacity:turn?1:0},{offset:.5,opacity:0},{opacity:0}],{duration,delay});}
   if(move.kind==='exhaust')sparks(end.x+end.width/2,end.y+end.height/2,delay+duration*.45);
   const pile=doc.querySelector('[data-action="pile"][data-zone="'+move.to+'"] .pile-art');
   if(pile)animate(pile,[{filter:'brightness(1)'},{offset:.5,filter:'brightness(1.7)'},{filter:'brightness(1)'}],{duration:220,delay:delay+duration*.7});
  }
  function cue(effect,after,index,presentation){
   if(!after.theatre)return;const arena=after.theatre,badge=after.passives.get(effect.source),compact=arena.height<300,delay=(presentation?.leadMs||0)+index*(presentation?.passiveGapMs||(compact?timings.passive:90));
   const el=doc.createElement('div');el.className='card-motion-passive motif-'+effect.motif;el.dataset.passiveSource=effect.source;el.dataset.effectDetail=effect.detail;
   const icon=doc.createElement('img');icon.src=root.DCIconAssets?.resolve(effect.icon.replace(/^assets\//,''),root.DC_ASSETS)||effect.icon;icon.alt='';icon.width=44;icon.height=44;
   const copy=doc.createElement('span'),name=doc.createElement('strong'),detail=doc.createElement('b');name.textContent=effect.title;detail.textContent=effect.detail;copy.append(name,detail);el.append(icon,copy);
   const left=Math.min(root.innerWidth-240,Math.max(12,(badge?.rect?.x||arena.x)+52)),top=Math.min(root.innerHeight-80,arena.y+Math.max(60,arena.height*.28)+(compact?0:index*71));
   el.style.left=Math.max(8,left)+'px';el.style.top=Math.max(8,top)+'px';host().append(el);
   animate(el,[{opacity:0,transform:'translate3d(-12px,8px,0) scale(.94)'},{offset:.16,opacity:1,transform:'translate3d(0,0,0) scale(1)'},{offset:.76,opacity:1},{opacity:0,transform:'translate3d(0,-14px,0) scale(.98)'}],{duration:timings.passive,delay},()=>remove(el));
   if(badge?.node)animate(badge.node,[{boxShadow:'0 0 0 0 #ebc87800'},{offset:.3,boxShadow:'0 0 0 3px #ebc878,0 0 22px #dcae7966'},{boxShadow:'0 0 0 0 #ebc87800'}],{duration:650,delay});
   const target=rect(doc.querySelector('.'+effect.target+' .fighter-panel'));if(!target)return;
   const sigil=doc.createElement('div');sigil.className='card-motion-sigil motif-'+effect.motif;sigil.style.left=(target.x+target.width/2-36)+'px';sigil.style.top=(target.y-70)+'px';const stamp=icon.cloneNode();sigil.append(stamp);host().append(sigil);
   animate(sigil,[{opacity:0,transform:'translateY(12px) scale(.55)'},{offset:.25,opacity:.85,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(-18px) scale(1.15)'}],{duration:650,delay},()=>remove(sigil));
   if(['ember','last-ember','growth','strength'].includes(effect.motif))sparks(target.x+target.width/2,target.y-28,delay+120,effect.motif);
  }
  function play(before,run,transfers=[],lang='en',presentation){
   cancel();if(!before||!visible()||run?.scene!=='battle'||typeof doc.createElement('div').animate!=='function')return;
   const moves=plan(transfers),passives=presentation?.passives||effects(before.state,run,lang);if(!moves.length&&!passives.length)return;
   frame=root.requestAnimationFrame(()=>{
    frame=0;if(!visible()||doc.querySelector('dialog[open]')||!doc.querySelector('.combat-layout'))return;
    try{
     const after=geometry(),prior=before.geometry;let groupStart=0,groupEnd=0,index=0,kind='';const ends=new Map();
     for(const move of moves){
      if(move.kind!==kind){groupStart=groupEnd;index=0;kind=move.kind;}
      const cards=move.cards||[move.card],delay=Math.max(groupStart+index++*timings.stagger,...cards.map(c=>ends.get(c.uid)||0));
      flight(move,prior,after,delay);const end=delay+timings[move.kind];groupEnd=Math.max(groupEnd,end);for(const c of cards)ends.set(c.uid,end);
     }
     passives.forEach((effect,index)=>cue(effect,after,index,presentation));
    }catch(_){cancel();}
   });
  }
  const hide=()=>{if(doc.hidden)cancel();},resize=()=>cancel();
  doc.addEventListener('visibilitychange',hide);root.addEventListener('resize',resize);root.addEventListener('pagehide',resize);
  return {capture,play,cancel,destroy(){cancel();dead=true;doc.removeEventListener('visibilitychange',hide);root.removeEventListener('resize',resize);root.removeEventListener('pagehide',resize);}};
 }
 const api={snapshot,describe,effects,plan,create,timings};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DCCardMotion=api;
})(typeof window!=='undefined'?window:globalThis);
