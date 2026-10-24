/* Passive V4: one shared seal, ordered motif tracks, periodic presentation only. */
(function(root){'use strict';
 const TAU=Math.PI*2,PERIOD=24,EXTENT=213,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const mod=(x,n)=>((x%n)+n)%n,ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
 const mix=(a,b,t)=>a+(b-a)*t;
 const COLORS=['#ffa95b','#ffd28c','#fff0bf','#ffd36f','#9cdbff','#79ebd7','#c8adff','#ff824e','#eadcff','#ffc276'];
 const MOTIFS=['Flame crown','Kindling blossom','Wind comets','Resonant cadence','Runic bastions','Eternal links','Scripted ward','Molten reactor','Lucid folios','Ember heartbeat'];
 const RADII=[72,117,163];
 function orderedLayers(order){return [...new Set(order)].slice(0,3).map((id,slot)=>({id,slot,radius:RADII[slot]}));}
 function primitive(list,commands,color,alpha=.6,width=.85,fill=false,tag=''){
  list.push({commands,color,alpha:clamp(alpha),width,fill,tag});
 }
 function arc(list,r,a,b,color,alpha=.6,width=.85,tag=''){
  primitive(list,[['A',0,0,r,a,b]],color,alpha,width,false,tag);
 }
 function circ(list,x,y,r,color,alpha=.6,width=.85,fill=false,tag=''){
  primitive(list,[['A',x,y,r,0,TAU],['Z']],color,alpha,width,fill,tag);
 }
 function poly(list,points,color,alpha=.5,width=.85,fill=false,tag=''){
  primitive(list,points.map(([x,y],i)=>[i?'L':'M',x,y]).concat([['Z']]),color,alpha,width,fill,tag);
 }
 function polygon(n,r,rot=0){return Array.from({length:n},(_,i)=>[Math.cos(rot+i*TAU/n)*r,Math.sin(rot+i*TAU/n)*r]);}
 function at(list,x,y,a,fn){
  const local=[];fn(local);const cs=Math.cos(a),sn=Math.sin(a);
  const point=(px,py)=>[x+px*cs-py*sn,y+px*sn+py*cs];
  for(const item of local){const commands=item.commands.map(c=>{
   if(c[0]==='Z')return c;
   if(c[0]==='A'){const p=point(c[1],c[2]);return ['A',...p,c[3],c[4]+a,c[5]+a];}
   const out=[c[0]];for(let i=1;i<c.length;i+=2)out.push(...point(c[i],c[i+1]));return out;
  });list.push({...item,commands});}
 }
 function glyph(list,x,y,a,size,color,alpha,variant=0){
  at(list,x,y,a,l=>{
   primitive(l,[['M',-size*.35,size*.65],['L',-size*.35,-size*.65],['L',size*.4,-size*.08],['L',-size*.35,size*.18]],color,alpha,.7);
   if(variant%2)primitive(l,[['M',0,-size*.45],['L',size*.42,size*.55],['M',-size*.6,.25*size],['L',size*.45,.25*size]],color,alpha,.7);
   else primitive(l,[['M',0,-size*.85],['L',0,size*.85],['M',-size*.65,0],['L',size*.65,0]],color,alpha,.7);
  });
 }
 function baseAt(seconds,count=3,{quality='full',levels}={}){
  const p=mod(seconds,PERIOD)/PERIOD,q=TAU*p,parts=[],ivory='#ffe9c3',white='#fff6e1',gold='#d6b783';
  const l2=levels?.[0]??Number(count>=2),l3=levels?.[1]??Number(count>=3);
  // This whole structure is independent of passive identity, colour and order.
  for(const [r,a,w]of [[30,.15,.6],[44,.3,.7],[99,.32,.7],[105,.66,1.1],[110,.4,.65]])arc(parts,r,0,TAU,ivory,a,w);
  for(let i=0;i<36;i++){
   const a=i*TAU/36+.10*Math.sin(q),r=107,major=i%3===0;
   primitive(parts,[['M',Math.cos(a)*r,Math.sin(a)*r],['L',Math.cos(a)*(r-(major?4.5:2)),Math.sin(a)*(r-(major?4.5:2))]],white,major?.65:.28,major?.8:.55);
  }
  for(let i=0;i<8;i++){const a=i*TAU/8-.16*Math.sin(q);arc(parts,94,a+.035,a+.44,ivory,.45,.95);arc(parts,96,a+.035,a+.44,gold,.22,.55);}
  if(l2>.0001){
   const b=[];for(const r of [137,142,147])arc(b,r,0,TAU,ivory,r===142?.62:.27,r===142?1:.6);
   poly(b,polygon(4,135,Math.PI/4+.12*Math.sin(q)),ivory,.4,.75);
   poly(b,polygon(4,135,-.12*Math.sin(q)),ivory,.32,.65);
   for(let i=0;i<8;i++){
    const a=i*TAU/8,x=Math.cos(a)*139,y=Math.sin(a)*139;
    if(i%2===0){circ(b,x,y,3.2,white,.7,.8);circ(b,x,y,1,white,.5,.7,true);}
    else poly(b,polygon(4,2.6,a).map(([xx,yy])=>[xx+x,yy+y]),gold,.65,.65);
   }
   parts.push(...b.map(v=>({...v,alpha:v.alpha*l2})));
  }
  if(l3>.0001){
   const b=[];
   for(const [r,a,w]of [[177,.7,1.15],[181,.3,.65],[190,.6,.85],[194,.28,.6],[153,.22,.65]])arc(b,r,0,TAU,ivory,a,w);
   // Reference 15: double triangles, a large clean inner aperture, arc tiles.
   poly(b,polygon(3,175,-Math.PI/2),white,.59,.9);
   poly(b,polygon(3,175,Math.PI/2),ivory,.29,.65);
   for(let i=0;i<24;i++){
    const a=i*TAU/24+.065*Math.sin(q),da=.072;
    const pts=[[184,a-da],[188,a-da],[188,a+da],[184,a+da]].map(([r,t])=>[r*Math.cos(t),r*Math.sin(t)]);
    poly(b,pts,ivory,.48,.65);
   }
   for(let i=0;i<3;i++){
    const a=i*TAU/3-Math.PI/2,x=Math.cos(a)*175,y=Math.sin(a)*175;
    at(b,x,y,a+Math.PI/2,l=>{poly(l,[[-5,7],[0,-7],[5,7],[0,4]],white,.83,.8,true);});
   }
   const n=quality==='low'?12:24;
   for(let i=0;i<n;i++){
    const a=i*TAU/n-.06*Math.sin(q);
    glyph(b,Math.cos(a)*199,Math.sin(a)*199,a+Math.PI/2,2.9,ivory,.42,i%4);
   }
   for(let i=0;i<6;i++){
    const a=i*TAU/6+q;arc(b,174,a+.08,a+.23,white,.7,1.35);
   }
   parts.push(...b.map(v=>({...v,alpha:v.alpha*l3})));
  }
  return {period:PERIOD,p,count,levels:[l2,l3],parts};
 }
 function motifAt(seconds,id,radius=72,{quality='full',weight=1,slot=0}={}){
  const p=mod(seconds,PERIOD)/PERIOD,q=TAU*p,r=radius,c=COLORS[id],parts=[],hot='#fff2d6';
  const orbit=(id%2?-1:1)*q+(id*.391),breathe=.5+.5*Math.sin(q*3+id*.72);
  const node=(a,fn)=>at(parts,Math.cos(a)*r,Math.sin(a)*r,a+Math.PI/2,fn);
  // Colour is carried by the ornament, never by the shared base circle.
  arc(parts,r,0,TAU,c,.18,.7);
  if(id===0){
   for(let j=0;j<4;j++){const a=orbit+j*TAU/4,lick=2*Math.sin(q*4+j*1.7);
    node(a,l=>{
     primitive(l,[['M',-12,8],['C',-20,-1,-9,-7,-9,-15-lick],['C',-5,-10,-5,-5,0,-6],['C',1,-13,7,-14,9,-23-lick],['C',13,-12,20,-2,11,7],['C',4,13,-6,13,-12,8],['Z']],c,.82,1.15,true,'flame-crest');
     primitive(l,[['M',-7,8],['C',-9,1,1,-1,2,-10],['C',9,-3,10,2,4,8]],hot,.72,.85);
    });
    for(let k=0;k<3;k++)arc(parts,r+5+k*2,a-.48-k*.06,a-.08,c,.22-k*.045,1.1-k*.2);
   }
  }else if(id===1){
   for(let j=0;j<5;j++){const a=orbit+j*TAU/5,s=1+.12*Math.sin(q*3+j*TAU/5);
    node(a,l=>{
     for(const sign of [-1,1])primitive(l,[['M',0,9],['C',sign*17*s,3,sign*16*s,-15,sign*5,-20*s],['C',sign*2,-10,0,-4,0,9],['Z']],c,.68,1,true,'growing-petal');
     primitive(l,[['M',0,9],['C',-3,-2,-3,-13,0,-26*s],['C',7,-14,7,-1,0,9],['Z']],hot,.69,.85,true);
     circ(l,0,6,2,c,.85,.7,true);
    });
   }
  }else if(id===2){
   for(let j=0;j<3;j++){
    const a=orbit*2+j*TAU/3;
    for(let k=0;k<7;k++)arc(parts,r+k*.95,a-.82+k*.065,a-.05,c,.1+k*.055,.55+k*.12,'comet-trail');
    node(a,l=>{
     primitive(l,[['M',-9,1],['Q',0,-2,8,-13],['L',4,0],['L',10,8],['Q',0,5,-9,1]],hot,.9,1.2,true,'wind-feather');
     primitive(l,[['M',-9,8],['Q',-17,11,-22,7],['M',-5,11],['Q',-11,16,-20,14]],c,.65,.9);
    });
   }
  }else if(id===3){
   for(let j=0;j<12;j++){
    const a=j*TAU/12+.08*Math.sin(q),beat=Math.pow((1+Math.cos(q*4-j*TAU/6))/2,3),x=Math.cos(a)*r,y=Math.sin(a)*r;
    at(parts,x,y,a+Math.PI/2,l=>{
     for(let k=-1;k<=1;k++){const ht=3+(1-Math.abs(k)*.33)*(5+beat*11);primitive(l,[['M',k*3.3,ht*.4],['L',k*3.3,-ht]],c,.45+beat*.5,k===0?1.8:1.1,false,'rhythm-bar');}
     circ(l,0,3,2,hot,.5+beat*.4,.65,true);
    });
   }
   const pts=[];for(let j=0;j<=96;j++){const a=j*TAU/96,rr=r-8+Math.sin(a*6-q*4)*2.2;pts.push([j?'L':'M',Math.cos(a)*rr,Math.sin(a)*rr]);}primitive(parts,pts,c,.55,.8,false,'cadence-wave');
  }else if(id===4){
   for(let j=0;j<6;j++){const a=id*.391+.18*Math.sin(q)+j*TAU/6;
    node(a,l=>{
     poly(l,[[-10,-13],[10,-13],[8,4],[0,15],[-8,4]],c,.83,1.2,true,'armor-plate');
     poly(l,[[-6,-9],[6,-9],[5,2],[0,10],[-5,2]],hot,.62,.65);
     primitive(l,[['M',0,-8],['L',0,6],['M',-4,-2],['L',4,-2],['M',-14,-8],['L',-14,5],['M',14,-8],['L',14,5]],c,.68,.85);
    });
   }
  }else if(id===5){
   for(let j=0;j<4;j++){const a=id*.391+.14*Math.sin(q)+j*TAU/4;
    for(const d of [-3,3])arc(parts,r+d,a+.14,a+1.13,c,d<0?.65:.82,1.3,'retention-link');
    node(a,l=>{
     primitive(l,[['M',-13,-4],['Q',-19,-4,-19,2],['Q',-19,8,-13,8],['L',0,8],['Q',6,8,6,2],['Q',6,-4,0,-4],['Z']],c,.85,1.35,false,'interlocked-chain');
     primitive(l,[['M',0,-8],['Q',-6,-8,-6,-2],['Q',-6,4,0,4],['L',13,4],['Q',19,4,19,-2],['Q',19,-8,13,-8],['Z']],hot,.7,1.1);
     poly(l,[[-2,-5],[2,-5],[2,5],[-2,5]],c,.6,.7,true);
    });
   }
  }else if(id===6){
   for(let j=0;j<8;j++){const a=id*.391+.15*Math.sin(q)+j*TAU/8,awake=.45+.35*Math.pow((1+Math.cos(q*3-j*TAU/8))/2,3);
    node(a,l=>{
     poly(l,polygon(6,12,Math.PI/6),c,awake,.9,false,'ward-hexagram');
     glyph(l,0,0,0,7,hot,.86,j%4);
     primitive(l,[['M',-15,-2],['L',-18,0],['L',-15,2],['M',15,-2],['L',18,0],['L',15,2]],c,.6,.7);
    });
    arc(parts,r-17,a+.11,a+TAU/8-.11,c,.25,.6);
   }
  }else if(id===7){
   for(let j=0;j<3;j++){const a=orbit+j*TAU/3,heat=.5+.5*Math.cos(q*3+j*TAU/3);
    node(a,l=>{
     poly(l,polygon(6,16,Math.PI/6+Math.sin(q*2)*.12),c,.82,1.25,true,'reactor-shell');
     poly(l,polygon(3,11,-Math.PI/2),hot,.76,1,true,'molten-core');
     circ(l,0,0,4+heat*2,'#ffddad',.9,1,true);
     for(let k=0;k<6;k++){const aa=k*TAU/6;primitive(l,[['M',Math.cos(aa)*19,Math.sin(aa)*19],['L',Math.cos(aa)*(22+heat*3),Math.sin(aa)*(22+heat*3)]],c,.58,1);}
    });
    arc(parts,r-5,a+.23,a+1.5,c,.35,.8);
   }
  }else if(id===8){
   for(let j=0;j<3;j++){const a=orbit+j*TAU/3,turn=.6+.35*Math.sin(q*2+j*TAU/3);
    node(a,l=>{
     primitive(l,[['M',0,9],['Q',-9,4,-17,6],['L',-17,-12],['Q',-7,-16,0,-9],['Q',7,-16,17,-12],['L',17,6],['Q',9,4,0,9],['Z']],c,.81,1.1,true,'open-folio');
     primitive(l,[['M',0,9],['L',0,-9],['M',-13,-7],['Q',-8,-9,-4,-6],['M',-13,-2],['L',-4,0],['M',4,-6],['Q',9,-9,13,-7],['M',4,0],['L',13,-2]],hot,.66,.7);
     primitive(l,[['M',0,6],['Q',-8*turn,-2,-10*turn,-16],['Q',-2,-16,0,-9]],hot,.7,.75,false,'turning-page');
    });
    arc(parts,r-16,a+.16,a+.88,c,.34,.8);
   }
  }else if(id===9){
   const heartbeat=Math.pow((1+Math.cos(q*3))/2,4)*.65+Math.pow((1+Math.cos(q*3-.9))/2,6)*.35;
   for(let j=0;j<3;j++){const a=orbit+j*TAU/3;
    node(a,l=>{
     primitive(l,[['M',0,15],['C',-19,4,-15,-5,-6,-10],['Q',-4,-1,0,-2],['Q',7,-10,4,-23],['C',25,-3,14,5,0,15],['Z']],c,.7+heartbeat*.2,1.1,true,'last-ember-heart');
     primitive(l,[['M',0,10],['Q',-7,3,1,-6],['Q',8,4,0,10]],hot,.82,.9,true);
    });
   }
   for(let j=0;j<2;j++){const cycle=mod(p*3+j*.5,1),alpha=Math.sin(Math.PI*cycle)**2;arc(parts,r-19+cycle*14,0,TAU,c,alpha*.48,.65+alpha*.65,'heartbeat-wave');}
  }
  // A small, smoothly enveloped ember/filament flow stays on its own track.
  const n=quality==='low'?4:9;
  for(let i=0;i<n;i++){
   const a=i*2.399+q*(id===2?2:1),rr=r+Math.sin(q*2+i)*5,alpha=(.22+.24*Math.cos(q*3+i)**2)*weight;
   circ(parts,Math.cos(a)*rr,Math.sin(a)*rr,i%3===0?1.05:.6,c,alpha,.5,true,'track-mote');
  }
  return {id,slot,radius:r,color:c,motif:MOTIFS[id],parts:parts.map(v=>({...v,alpha:v.alpha*weight}))};
 }
 function frameAt(seconds,order=[0,4,6],{quality='full',tracks,levels,entrance=1}={}){
  const slots=tracks||orderedLayers(order).map(t=>({...t,weight:1}));
  const base=baseAt(seconds,order.length,{quality,levels});
  const layers=slots.filter(t=>t.weight>.00001).map(t=>motifAt(seconds,t.id,t.radius,{quality,weight:t.weight,slot:t.slot}));
  return {period:PERIOD,p:base.p,count:order.length,base,layers,entrance,extent:EXTENT};
 }
 function trace(ctx,commands,append=false){if(!append)ctx.beginPath();for(const c of commands){
  if(c[0]==='M')ctx.moveTo(c[1],c[2]);else if(c[0]==='L')ctx.lineTo(c[1],c[2]);else if(c[0]==='C')ctx.bezierCurveTo(...c.slice(1));else if(c[0]==='Q')ctx.quadraticCurveTo(...c.slice(1));else if(c[0]==='A'){ctx.moveTo(c[1]+Math.cos(c[4])*c[3],c[2]+Math.sin(c[4])*c[3]);ctx.arc(...c.slice(1));}else if(c[0]==='Z')ctx.closePath();
 }}
 function drawParts(ctx,parts,{bloom=false,quality='full'}={}){
  ctx.lineCap='round';ctx.lineJoin='round';ctx.globalCompositeOperation='lighter';
  // Batch equal materials so rune rows and repeated motifs share a draw call.
  const groups=new Map();for(const v of parts){if(v.alpha<.0001)continue;const key=[v.color,v.alpha,v.width,v.fill].join(':');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(v);}
  for(const group of groups.values()){
   const v=group[0];ctx.strokeStyle=v.color;ctx.fillStyle=v.color;ctx.beginPath();for(const item of group)trace(ctx,item.commands,true);
   if(bloom){ctx.lineWidth=v.width+(quality==='low'?2.5:5.5);ctx.globalAlpha=v.alpha*.055;ctx.stroke();}
   else{if(v.fill){ctx.globalAlpha=v.alpha*.2;ctx.fill();}ctx.lineWidth=v.width+1.15;ctx.globalAlpha=v.alpha*.22;ctx.stroke();ctx.lineWidth=v.width;ctx.globalAlpha=v.alpha;ctx.stroke();}
  }
 }
 function create(){
  let order=[0,4,6],changes=[],fromLevels=[1,1],toLevels=[1,1],changedAt=0,introAt=-10,revision=0,cacheKey='',cachedFrame=null;
  let surface=null,surfaceKey='',ratio=1;
  function snapshot(seconds){const u=ease((seconds-changedAt)/.85),intro=ease((seconds-introAt)/1.15);
   return {tracks:changes.map(v=>({...v,slot:mix(v.fromSlot,v.toSlot,u),radius:mix(v.fromRadius,v.toRadius,u),weight:mix(v.fromWeight,v.toWeight,u)})),levels:fromLevels.map((v,i)=>mix(v,toLevels[i],u)),entrance:intro};
  }
  function setSelection(next,seconds,{immediate=false,intro=false}={}){
   const newOrder=orderedLayers(next).map(v=>v.id),current=snapshot(seconds),target=orderedLayers(newOrder);
   const prior=new Map(current.tracks.map(v=>[v.id,v]));
   fromLevels=immediate?[Number(newOrder.length>=2),Number(newOrder.length>=3)]:current.levels;
   toLevels=[Number(newOrder.length>=2),Number(newOrder.length>=3)];
   changes=target.map(v=>{const prev=prior.get(v.id);prior.delete(v.id);return {id:v.id,fromSlot:immediate?v.slot:prev?.slot??v.slot,toSlot:v.slot,fromRadius:immediate?v.radius:prev?.radius??v.radius,toRadius:v.radius,fromWeight:immediate?1:prev?.weight??0,toWeight:1};});
   if(!immediate)for(const prev of prior.values())changes.push({id:prev.id,fromSlot:prev.slot,toSlot:prev.slot,fromRadius:prev.radius,toRadius:prev.radius,fromWeight:prev.weight,toWeight:0});
   order=newOrder;changedAt=immediate?seconds-1:seconds;if(intro)introAt=seconds;else if(immediate)introAt=seconds-2;
   revision++;cacheKey='';return snapshot(seconds);
  }
  setSelection(order,0,{immediate:true});
  function frame(seconds,quality){const key=[seconds,quality,revision].join(':');if(cacheKey!==key){cacheKey=key;cachedFrame=frameAt(seconds,order,{quality,...snapshot(seconds)});}return cachedFrame;}
  function texture(f,quality){
   const key=[cacheKey,quality,root.devicePixelRatio||1].join(':');if(surfaceKey===key&&surface)return surface;
   if(!surface)surface=root.document.createElement('canvas');ratio=Math.min(root.devicePixelRatio||1,quality==='low'?1.25:2);
   const size=Math.round(EXTENT*2*ratio);if(surface.width!==size){surface.width=size;surface.height=size;}
   const c=surface.getContext('2d');c.setTransform(ratio,0,0,ratio,size/2,size/2);c.clearRect(-EXTENT,-EXTENT,EXTENT*2,EXTENT*2);
   const reach=111+f.base.levels[0]*36+f.base.levels[1]*57;
   const haze=c.createRadialGradient(0,0,reach*.22,0,0,reach);haze.addColorStop(0,'#ffeac900');haze.addColorStop(.65,'#f2b96a0d');haze.addColorStop(.88,'#ffda8620');haze.addColorStop(1,'#ffda8600');c.fillStyle=haze;c.globalAlpha=f.entrance;c.fillRect(-reach,-reach,reach*2,reach*2);
   const all=[...f.base.parts,...f.layers.flatMap(v=>v.parts)];drawParts(c,all,{bloom:true,quality});drawParts(c,all,{quality});c.globalAlpha=1;
   surfaceKey=key;return surface;
  }
  return {setSelection,snapshot,frame,paint(ctx,seconds,{quality='full',front=false,plan=false}={}){
   const f=frame(seconds,quality),image=texture(f,quality);
   ctx.save();ctx.globalAlpha*=f.entrance;ctx.scale(1,plan?1:.34);
   ctx.beginPath();ctx.rect(-EXTENT,front?0:-EXTENT,EXTENT*2,EXTENT);ctx.clip();
   ctx.drawImage(image,-EXTENT,-EXTENT,EXTENT*2,EXTENT*2);ctx.restore();return f;
  }};
 }
 const api={PERIOD,EXTENT,COLORS,MOTIFS,RADII,orderedLayers,baseAt,motifAt,frameAt,create};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.STMPassiveField=api;
})(typeof window!=='undefined'?window:globalThis);
