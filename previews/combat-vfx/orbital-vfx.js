/* V9: shared actor-neutral particle lanes and bounded material buffers. Preview only. */
(function(root){'use strict';
 const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mod=(x,n)=>((x%n)+n)%n;
 const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);},ramp=(t,a,b)=>ease((t-a)/(b-a));
 const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const softAbs=v=>(Math.sqrt(v*v+.01)-.1)/(Math.sqrt(1.01)-.1);
 const BOUNDS={left:-205,top:-375,right:205,bottom:0};
 const PROFILES={full:{segments:96,fibers:true,grains:28,spikes:58,rows:8,surface:64,arcs:5,links:36,ratio:1.6,blur:9,bloom:7},low:{segments:62,fibers:false,grains:12,spikes:34,rows:5,surface:40,arcs:3,links:24,ratio:1,blur:3,bloom:3},dense:{segments:32,fibers:false,grains:8,spikes:24,rows:4,surface:28,arcs:3,links:18,ratio:1,blur:3,bloom:3},'dense-low':{segments:24,fibers:false,grains:4,spikes:16,rows:3,surface:20,arcs:2,links:12,ratio:1,blur:2,bloom:2}};
 const profile=quality=>PROFILES[quality]||PROFILES.full;
 PROFILES.multi={segments:64,fibers:false,grains:12,spikes:42,rows:6,surface:44,arcs:3,links:28,ratio:1.4,blur:4,bloom:4};
 const STAT={
  strength:{color:'#f54b59',hot:'#ffd4c9',dark:'#480e1e',motif:'Crimson Ember Orbit',family:'ember-blades',speed:1,count:3},
  agility:{color:'#56e49a',hot:'#d8ffe8',dark:'#0b3929',motif:'Verdant Slipstream',family:'feather-wings',speed:2,count:4},
  defense:{color:'#65b9ff',hot:'#def4ff',dark:'#102648',motif:'Sapphire Bastions',family:'faceted-guard-knots',speed:1,count:4}
 };
 const MATERIAL={thorns:{color:'#a9774d',hot:'#e2c09a',dark:'#281b17'},vulnerable:{color:'#e83f51',hot:'#ffacb1',dark:'#150b14'},weak:{color:'#ad73ef',hot:'#efdaff',dark:'#13091f'}};
 const DEFINITIONS=[];
 for(const [attribute,label]of [['strength','Strength'],['agility','Agility'],['defense','Defense']])for(const sign of ['up','down']){
  const d=STAT[attribute];DEFINITIONS.push({id:attribute+'-'+sign,attribute,kind:'orbit',state:'active',group:sign==='up'?'buff':'debuff',name:label+(sign==='up'?' naik':' turun'),period:12,...d,description:label+' '+(attribute==='strength'?'merah dengan serpihan bara berteras pijar':attribute==='agility'?'hijau dengan komet angin berekor kembar':'biru dengan kristal berfaset')+' mengelilingi Alyssa. Partikel runcing '+(sign==='up'?'menunjuk dan naik ke atas untuk buff':'menunjuk dan turun ke bawah untuk debuff')+' mengikut warna stat. Ring dan urutan slot dikekalkan.'});
 }
 const labels={active:'aktif',gain:'terbentuk',hit:'menerima hit',expire:'tamat tempoh'},names={thorns:'Thorns',vulnerable:'Vulnerable',weak:'Weak'};
 const descriptions={
  thorns:{active:'Barrier perang berisi lutsinar dengan duri berfaset yang mencucuk keluar dari permukaan. Tiada mesh heksagon atau bulatan lantai.',gain:'Membran perang terbentuk, kemudian duri memanjang keluar dan mengunci pada permukaan barrier.',hit:'Apabila menerima hit, semua duri menyentak keluar serentak. Duri perang memancar 360° dari seluruh permukaan barrier, termasuk depan dan belakang Alyssa, lalu pudar sementara barrier kembali stabil. Tiada VFX lantai.',expire:'Duri masuk semula ke membran sebelum barrier perang melarut. Mod ulang membina semula barrier secara lembut.'},
  vulnerable:{active:'Lilitan merah hitam dan filamen elektrik mengelilingi Alyssa tanpa membran bubble atau garisan bulat shield.',gain:'Lilitan merah gelap menggulung masuk, kemudian elektrik ringan muncul. Tiada membran bubble.',expire:'Elektrik reda dahulu. Lilitan merah hitam terurai berperingkat dan menghilang; mod ulang menyambung semula lilitan tanpa bubble.'},
  weak:{active:'Tiga belitan rantai ungu bergradasi hitam bersilang mengelilingi Alyssa. Pautan metalik mempunyai teras gelap dan tepi ungu terang. Tiada membran bubble atau garisan bulat shield.',gain:'Pautan rantai ungu hitam bergerak ke kedudukan dan bersambung mengelilingi badan tanpa membran bubble.',expire:'Rantai ungu hitam menegang, terputus pada pautan, berputar dan berterbangan sebelum pudar. Mod sekali tamat tanpa rantai; mod ulang menyambung semula rantai.'}
 };
 for(const attribute of ['thorns','vulnerable','weak'])for(const state of attribute==='thorns'?['active','gain','hit','expire']:['active','gain','expire']){
  DEFINITIONS.push({id:attribute+'-'+state,attribute,kind:'barrier',state,group:attribute==='thorns'?'buff':'debuff',name:names[attribute]+' '+labels[state],motif:attribute==='thorns'?'Briar Aegis':attribute==='vulnerable'?'Crimson Maelstrom':'Midnight Chains',family:attribute==='thorns'?'brown-spiked-shell':attribute==='vulnerable'?'red-black-electric-vortex':'purple-black-chain-cage',period:state==='active'?12:state==='hit'?8:10,event:state!=='active',...MATERIAL[attribute],description:descriptions[attribute][state]});
 }
 const byId=new Map(DEFINITIONS.map(d=>[d.id,d]));
 const aliases={'thorns-up':'thorns-active','weak-applied':'weak-active','weak-cleared':'weak-expire','vulnerable-applied':'vulnerable-active','vulnerable-cleared':'vulnerable-expire'};
 function definition(id){const d=byId.get(aliases[id]||id);if(!d)throw Error('Unknown V6 effect '+id);return d;}
 const duration=id=>definition(id).period;
 function stateAt(seconds,id,{loop=true}={}){
  const d=definition(id),period=d.period,t=loop?mod(seconds,period):clamp(seconds,0,period),p=t/period,q=TAU*p;
  let formation=1,visibility=1,spikeGrowth=1,phase='steady',hit=0,breakAge=-1,unwind=0,reforming=false;
  if(d.kind==='barrier'&&d.state==='gain'){
   formation=ramp(t,.18,1.85);const reset=loop?ramp(t,6.8,8.8):0;visibility=formation*(1-reset);spikeGrowth=ramp(t,.9,2.5);
   phase=t<.18?'quiet':t<2.5?'forming':reset>0&&reset<1?'resetting':reset===1?'quiet':'steady';
   if(loop&&t>=8.8){formation=0;visibility=0;spikeGrowth=0;}
  }else if(d.kind==='barrier'&&d.state==='hit'){
   const age=t-1.55;hit=age>=0&&age<1.7?Math.sin(Math.min(1,age/.07)*Math.PI/2)*Math.exp(-age*3.9):0;phase=age>=0&&age<1.7?'impact':'steady';
  }else if(d.kind==='barrier'&&d.state==='expire'){
   const rf=loop?ramp(t,5.8,8.5):0;reforming=loop&&t>=5.8;formation=reforming?rf:1;
   if(d.attribute==='thorns'){spikeGrowth=1-ramp(t,1.1,2.6)+rf;visibility=1-ramp(t,2.1,3.9)+rf;phase=t<1.1?'steady':t<2.6?'retracting':t<3.9?'dissolving':'quiet';}
   if(d.attribute==='vulnerable'){unwind=ramp(t,1.15,3.7);visibility=1-ramp(t,1.65,4)+rf;phase=t<1.15?'steady':t<4?'unwinding':'quiet';if(reforming)unwind=0;}
   if(d.attribute==='weak'){breakAge=t-1.6;visibility=1-ramp(t,1.45,2.6)+rf;phase=t<1.4?'steady':t<1.75?'straining':t<4.1?'shattering':'quiet';}
   if(reforming){phase=t<8.5?'reforming':'steady';if(d.attribute==='thorns')spikeGrowth=rf;}
  }
  return{id:d.id,attribute:d.attribute,kind:d.kind,state:d.state,t,p,q,period,phase,formation,visibility:clamp(visibility),spikeGrowth:clamp(spikeGrowth),hit,breakAge,unwind,reforming,loop};
 }
 function part(list,commands,d,alpha=.7,width=1,opts={}){list.push({commands,color:opts.color||d.color,hot:opts.hot||d.hot,dark:opts.dark||d.dark,alpha:clamp(alpha),width,fill:!!opts.fill,material:opts.material||'light',frontWeight:opts.frontWeight??ease(((opts.z??0)+.2)/.4),tag:opts.tag||'',...opts});}
 function line(list,pts,d,alpha,width,opts={}){part(list,pts.map((p,i)=>[i?'L':'M',...p]),d,alpha,width,opts);}
 function poly(list,pts,d,alpha,width,opts={}){part(list,pts.map((p,i)=>[i?'L':'M',...p]).concat([['Z']]),d,alpha,width,{...opts,fill:true});}
 function star(list,x,y,size,d,alpha,z=0){poly(list,[[x-size,y],[x-size*.2,y-size*.2],[x,y-size],[x+size*.2,y-size*.2],[x+size,y],[x+size*.2,y+size*.2],[x,y+size],[x-size*.2,y+size*.2]],d,alpha,.5,{z,material:'grain',tag:'orbit-spark'});}
 function transformCommands(commands,x,y,angle,scale=1,squash=1){const cs=Math.cos(angle),sn=Math.sin(angle);return commands.map(c=>{if(c[0]==='Z')return c;const out=[c[0]];for(let i=1;i<c.length;i+=2){const xx=c[i]*scale,yy=c[i+1]*scale*squash;out.push(x+xx*cs-yy*sn,y+xx*sn+yy*cs);}return out;});}
 function ringLayout(count=1,slot=0){
  count=clamp(Math.floor(count),1,3);slot=clamp(Math.floor(slot),0,count-1);
  return{angle:count===1?0:slot===0?.53:slot===1?-.53:0,rx:count===3&&slot===2?155:145,ry:count===3&&slot===2?24:28,cy:-176};
 }
 function planStatParticles(ids,{quality='full',actor='player'}={}){
  const unique=new Map();for(const id of ids){const d=definition(id);if(d.kind==='orbit')unique.set(d.attribute,id);}
  const count=unique.size,perRail=quality==='full'?(count===1?3:2):quality==='multi'?2:quality==='low'?(count===1?2:1):1;
  return [...unique].map(([attribute,id],slot)=>({id,attribute,slot:slot+1,total:count,flow:{channel:['strength','agility','defense'].indexOf(attribute),radius:{strength:84,agility:122,defense:160}[attribute],perRail,phase:actor==='enemy'?.137:0,sway:2,actor}}));
 }
 function orbitPoint(theta,q,attribute,ring=ringLayout()){
  const x=Math.cos(theta)*(ring.rx+Math.sin(q)),y=Math.sin(theta)*ring.ry,cs=Math.cos(ring.angle),sn=Math.sin(ring.angle);
  return{x:x*cs-y*sn,y:ring.cy+x*sn+y*cs,z:Math.sin(theta)};
 }
 function statBeads(list,s,d,quality,flow){
  const count=flow.perRail*2,up=d.id.endsWith('-up'),direction=up?-1:1;
  for(let i=0;i<count;i++){
   const rail=i%2,rank=Math.floor(i/2),u=mod(s.p*4+rank/flow.perRail+rail*.173+flow.channel*.071+flow.phase,1),alpha=Math.sin(Math.PI*u)**2*.88,x=(rail?1:-1)*flow.radius+Math.sin(s.q+i+flow.channel)*flow.sway,y=up?-76-230*u:-306+230*u;
   const z=rail?1:-1,radius=.8+hash(i+917)*.12,angle=(up?0:Math.PI)+Math.sin(s.q*2+i)*.1;
   const shape=d.attribute==='strength'?'ember-lance':d.attribute==='agility'?'wind-comet':'faceted-crystal';
   const commands=d.attribute==='strength'?[['M',0,-17],['Q',8,-5,5,3],['L',0,13],['L',-6,5],['Q',-11,-3,-5,-9],['L',-2,0],['Z']]:d.attribute==='agility'?[['M',0,-17],['Q',11,-4,4,5],['L',0,15],['Q',-1,1,-8,7],['Q',-11,-2,0,-17],['Z']]:[['M',0,-16],['L',7,-3],['L',4,8],['L',0,13],['L',-5,6],['L',-7,-3],['Z']];
   const core=d.attribute==='strength'?[['M',0,-10],['Q',4,-1,0,7],['L',-2,2]]:d.attribute==='agility'?[['M',0,-11],['Q',5,-2,0,8],['M',-3,-3],['Q',-1,1,-3,4]]:[['M',0,-13],['L',0,10],['M',-5,-3],['L',0,1],['L',5,-3]];
   for(const offset of d.attribute==='agility'?[-2.8,2.8]:[0])line(list,[[x+offset,y-direction*20],[x+offset*.2,y-direction*6]],d,alpha*.3,1.1,{z,tag:'stat-bead-trail',material:'ribbon'});
   part(list,transformCommands(commands,x,y,angle,radius),d,alpha,1.05,{z,fill:true,material:'stat-sigil',tag:up?'stat-bead-up':'stat-bead-down',orb:{x,y,radius,direction,index:i,progress:u,shape,channel:flow.channel,rail,actor:flow.actor}});
   part(list,transformCommands(core,x,y,angle,radius),d,alpha*.8,.7,{z,color:d.hot,tag:'stat-bead-core'});
  }
 }
 function statOrbit(list,s,d,quality,ring,flow){
  const q=s.q,spec=STAT[d.attribute],n=profile(quality).segments;
  for(let i=0;i<n;i++){
   const a=i*TAU/n,b=(i+1)*TAU/n,mid=(a+b)/2,p0=orbitPoint(a,q,d.attribute,ring),p1=orbitPoint(b,q,d.attribute,ring),pm=orbitPoint(mid,q,d.attribute,ring);
   const light=Math.pow((1+Math.cos(mid-q*spec.speed))/2,5),alpha=.16+light*.66,width=2+light*2.25;
   line(list,[[p0.x,p0.y],[p1.x,p1.y]],d,alpha,width,{z:pm.z,tag:'body-orbit-ribbon',material:'ribbon'});
   if(profile(quality).fibers)line(list,[[p0.x,p0.y],[p1.x,p1.y]],d,alpha*.36,.65,{z:pm.z,tag:'orbit-fiber',color:d.hot});
  }
  for(let i=0;i<spec.count;i++){
   const theta=q*spec.speed+i*TAU/spec.count,p=orbitPoint(theta,q,d.attribute,ring),a=Math.atan2(Math.cos(theta)*ring.ry,-Math.sin(theta)*ring.rx)+ring.angle,size=.78+.18*(p.z+1)/2;
   let commands;
   if(d.attribute==='strength')commands=[['M',0,-18],['C',12,-8,11,0,5,7],['L',0,17],['L',-6,7],['C',-13,-1,-7,-6,-9,-13],['L',-1,-5],['Z']];
   else if(d.attribute==='agility')commands=[['M',-16,7],['Q',-9,-12,15,-15],['Q',8,-2,-1,2],['Q',8,0,17,4],['Q',3,14,-16,7],['Z']];
   else commands=[['M',0,-17],['L',12,-3],['L',7,12],['L',0,18],['L',-9,9],['L',-12,-4],['Z']];
   part(list,transformCommands(commands,p.x,p.y,a,size,.7+.3*softAbs(p.z)),d,.9,1.2,{z:p.z,fill:true,material:'facet',tag:spec.family});
   const inner=d.attribute==='strength'?[['M',-1,-8],['Q',6,1,0,9],['L',-3,2]]:d.attribute==='agility'?[['M',-9,5],['Q',-2,-2,9,-8],['M',-6,9],['Q',3,5,11,6]]:[['M',0,-14],['L',0,14],['M',-10,-3],['L',0,2],['L',10,-3],['M',0,2],['L',7,10]];
   part(list,transformCommands(inner,p.x,p.y,a,size,.7+.3*softAbs(p.z)),d,.85,.75,{z:p.z,color:d.hot,tag:'ornament-core'});
  }
  const grains=profile(quality).grains;
  for(let i=0;i<grains;i++){
   const theta=i*2.399963+q*spec.speed,p=orbitPoint(theta,q,d.attribute,ring),r=8*Math.sin(q*2+i*1.7),alpha=.25+.42*Math.cos(q*2+i)**2;
   if(i%6===0)star(list,p.x+Math.cos(theta)*r,p.y+Math.sin(theta)*r,i%12===0?4.1:2.4,d,alpha,p.z);
   else poly(list,[[p.x+r-1,p.y],[p.x+r,p.y-1.5],[p.x+r+1,p.y],[p.x+r,p.y+1.5]],d,alpha,.35,{z:p.z,material:'grain',tag:'orbit-grain'});
  }
  statBeads(list,s,d,quality,flow);
 }
 const norm=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l);};
 function project(v,s,{extra=0,freeze=false}={}){
  const q=freeze?TAU*1.6/s.period:s.q,yaw=.13*Math.sin(q),cs=Math.cos(yaw),sn=Math.sin(yaw),x=v[0]*cs+v[2]*sn,z=v[2]*cs-v[0]*sn;
  const grow=.86+.14*s.formation,breath=1+.004*Math.sin(q),press=s.hit*Math.pow(Math.max(0,x*.9-v[1]*.12+z*.4),7);
  return{x:x*(141+extra)*grow*breath*(1-press*.055),y:-166+v[1]*(160+extra)*grow*breath,z,unit:[x,v[1],z]};
 }
 function shell(list,s,d){if(s.visibility<.00001)return;part(list,[],d,s.visibility,1,{material:'shell',shell:{rx:141*(.86+.14*s.formation)*(1+.004*Math.sin(s.q)),ry:160*(.86+.14*s.formation)*(1+.004*Math.sin(s.q)),cy:-166},frontWeight:.5,tag:d.attribute+'-film'});}
 function faceSafe(p,amount=.7){return 1-amount*ramp(p.z,.1,.6)*(1-ramp(Math.abs(p.x),45,88))*ramp(-p.y,72,108)*(1-ramp(-p.y,272,307));}
 function thornShell(list,s,d,quality){
  shell(list,s,d);if(s.visibility<.00001)return;const count=profile(quality).spikes;
  for(let i=0;i<count;i++){
   const y=1-2*(i+.5)/count,phi=i*2.399963,rr=Math.sqrt(1-y*y),u=[rr*Math.cos(phi),y,rr*Math.sin(phi)],p=project(u,s),seed=hash(i+47),rim=Math.pow(1-softAbs(p.z),1.2);
   const nearHit=Math.pow(Math.max(0,p.unit[0]*.9-p.unit[1]*.12+p.unit[2]*.4),8),length=(18+seed*17)*s.spikeGrowth+s.hit*(12+seed*2),tip=project(u,s,{extra:length}),tangent=[y*Math.cos(phi),-rr,y*Math.sin(phi)],bitangent=[-Math.sin(phi),0,Math.cos(phi)],width=.027+seed*.012;
   const base=Array.from({length:4},(_,k)=>{const a=k*TAU/4;return project(norm(u.map((v,j)=>v+Math.cos(a)*tangent[j]*width+Math.sin(a)*bitangent[j]*width)),s);});
   const safe=faceSafe(p,.76),alpha=s.visibility*(.25+rim*.72)*safe;
   for(let k=0;k<2;k++)poly(list,[[base[k].x,base[k].y],[tip.x,tip.y],[base[k+1].x,base[k+1].y]],d,alpha,.8,{z:p.z,material:'thorn',hot:k?d.color:d.hot,tag:'extruded-thorn'});
   line(list,[[p.x,p.y],[tip.x,tip.y]],d,alpha*(.55+s.hit*(.7+nearHit*.3)),.75,{z:p.z,color:d.hot,tag:'thorn-edge'});
  }
  if(d.state==='hit')thornBurst(list,s,d,quality);
 }
 function thornBurst(list,s,d,quality){
  const age=s.t-1.55,envelope=ramp(age,0,.065)*(1-ramp(age,.36,.96));if(envelope<.00001)return;
  const count=profile(quality).spikes;
  for(let i=0;i<count;i++){
   const yy=1-2*(i+.5)/count,phi=i*2.399963,rr=Math.sqrt(1-yy*yy),u=[rr*Math.cos(phi),yy,rr*Math.sin(phi)],seed=hash(i+47);
   const distance=22+(54+seed*12)*age,p=project(u,s,{extra:distance}),tip=project(u,s,{extra:distance+16+seed*8}),tail=project(u,s,{extra:Math.max(2,distance-20)});
   const fade=(1-ramp(Math.abs(tip.x),183,202))*(1-ramp(tip.y,-35,-3))*ramp(tip.y,-373,-352),safe=faceSafe(p,.75),alpha=envelope*fade*safe;
   if(alpha<.001)continue;
   const length=Math.hypot(tip.x-p.x,tip.y-p.y),width=2.1+seed*1.7,angle=Math.atan2(tip.y-p.y,tip.x-p.x),cs=Math.cos(angle),sn=Math.sin(angle);
   const base=[p.x,p.y],left=[p.x-sn*width,p.y+cs*width],right=[p.x+sn*width,p.y-cs*width],head=[tip.x,tip.y];
   line(list,[[tail.x,tail.y],base],d,alpha*.4,1.2,{z:p.z,color:d.hot,tag:'thorn-radial-trail'});
   poly(list,[left,head,base],d,alpha,.8,{z:p.z,material:'thorn',tag:'thorn-radial-spike',burst:{index:i,position:[p.x,p.y],tip:head,direction:p.unit,travel:distance,length,hemisphere:p.z>=0?'front':'back'}});
   poly(list,[right,head,base],d,alpha*.82,.65,{z:p.z,material:'thorn',hot:d.color,tag:'thorn-radial-facet'});
   line(list,[base,head],d,alpha*.8,.65,{z:p.z,color:d.hot,tag:'thorn-radial-core'});
  }
 }
 function sphereCurve(a,tilt,turn){const ca=Math.cos(a),sa=Math.sin(a),ct=Math.cos(turn),st=Math.sin(turn),si=Math.sin(tilt),co=Math.cos(tilt);return[ca*ct-sa*st*co,sa*si,ca*st+sa*ct*co];}
 function vortex(list,s,d,quality){
  if(s.visibility<.00001)return;const rows=profile(quality).rows,n=profile(quality).surface;
  for(let row=0;row<rows;row++){
   const lat=-1.1+row*2.2/(rows-1),sin=Math.sin(lat),rowFade=s.visibility*(1-s.unwind*ramp(row/(rows-1),.05,.95));
   for(let i=0;i<n;i++){
    const a=i*TAU/n,b=(i+1)*TAU/n,swirl=s.q+(row%2?1:-1)*.24,unit=t=>{const raw=sin+.18*Math.sin(t+swirl+row*.7)+.045*Math.sin(t*2+swirl+row),yy=raw/Math.pow(1+Math.pow(raw/.97,16),1/16),rx=Math.sqrt(Math.max(.02,1-yy*yy));return[rx*Math.cos(t),yy,rx*Math.sin(t)];},p=project(unit(a),s),p2=project(unit(b),s),pm=project(unit((a+b)/2),s);
    const flow=.2+.8*Math.pow((1+Math.sin(a*2-s.q*2+row*.8))/2,4),safe=faceSafe(pm,.7);
    line(list,[[p.x,p.y],[p2.x,p2.y]],d,rowFade*(.18+flow*.6)*safe,2.5+flow*2.2,{z:pm.z,material:'vortex',tag:'red-black-surface-coil'});
   }
  }
  const arcs=profile(quality).arcs;
  for(let k=0;k<arcs;k++){
   const gate=Math.pow((1+Math.cos(s.q*3+k*1.7))/2,5)*s.visibility*(1-s.unwind),pts=[],start=k*1.27+s.q,lat=(k%3-1)*.45;
   for(let j=0;j<19;j++){const u=j/18,a=start+u*.74,la=lat+Math.sin(u*20+k+s.q*4)*.024*Math.sin(u*Math.PI),p=project([Math.cos(la)*Math.cos(a),Math.sin(la),Math.cos(la)*Math.sin(a)],s,{extra:3});pts.push([p.x,p.y]);}
   const center=project([Math.cos(lat)*Math.cos(start+.37),Math.sin(lat),Math.cos(lat)*Math.sin(start+.37)],s);line(list,pts,d,gate*.7,1.2,{z:center.z,color:'#ffc0c4',tag:'surface-electricity'});
  }
 }
 function chainCoordinates(s,ring,index,count,{freeze=false}={}){
  const q=freeze?TAU*1.6/s.period:s.q,a=index*TAU/count+q,tilts=[.35,1.03,-.91],turns=[.12,1.13,-.77],unit=t=>sphereCurve(t,tilts[ring],turns[ring]);
  const p=project(unit(a),s,{freeze}),next=project(unit(a+.02),s,{freeze}),prev=project(unit(a-.02),s,{freeze}),angle=Math.atan2(next.y-prev.y,next.x-prev.x),spacing=Math.hypot(next.x-prev.x,next.y-prev.y)*TAU/count/.04;
  return{...p,angle,long:Math.max(4.5,spacing*.67),short:(index%2?3.8:6.4)*(.65+.35*softAbs(p.z)),index,ring};
 }
 function chainCage(list,s,d,quality){
  const count=profile(quality).links,breaking=d.state==='expire'&&!s.reforming&&s.breakAge>=0;if(!breaking&&s.visibility<.00001)return;
  for(let ring=0;ring<3;ring++)for(let i=0;i<count;i++){
   const seed=hash(ring*100+i),delay=seed*.28,age=s.breakAge-delay,detached=breaking&&age>0,link=chainCoordinates(s,ring,i,count,{freeze:breaking});
   let x=link.x,y=link.y,angle=link.angle,alpha=d.state==='expire'&&!s.reforming?1:s.visibility,size=1;
   if(detached){if(age>2.45)continue;const push=26+seed*38,vx=link.unit[0]*push+(seed-.5)*18,vy=link.unit[1]*push-15;x+=vx*age;y+=vy*age+24*age*age;angle+=(seed-.5)*age*5;size=1-age*.07;alpha=(1-ramp(age,.7,2.3));alpha*=1-ramp(Math.abs(x),174,202);alpha*=1-ramp(y,-39,-7);}
   else if(breaking)alpha=1-ramp(s.breakAge,delay,delay+.1);
   const assemble=(!breaking&&s.formation<1)?ramp(s.formation,(i/count)*.58,(i/count)*.58+.36):1,safe=faceSafe({x,y,z:link.z},.6);alpha*=assemble*safe;
   const L=link.long*size,H=link.short*size,commands=[['M',-L*.55,-H],['L',L*.55,-H],['C',L*1.12,-H,L*1.12,H,L*.55,H],['L',-L*.55,H],['C',-L*1.12,H,-L*1.12,-H,-L*.55,-H],['Z']];
   part(list,transformCommands(commands,x,y,angle),d,alpha*.88,1.7,{z:link.z,material:'chain',tag:detached?'broken-chain-link':'interlocked-chain-link',detached});
  }
 }
 function frameAt(seconds,id,{loop=true,quality='full',ring=ringLayout(),flow=null}={}){
  const d=definition(id),s=stateAt(seconds,id,{loop}),parts=[];
  if(d.kind==='orbit')statOrbit(parts,s,d,quality,ring,flow||planStatParticles([id],{quality})[0].flow);else if(d.attribute==='thorns')thornShell(parts,s,d,quality);else if(d.attribute==='vulnerable')vortex(parts,s,d,quality);else chainCage(parts,s,d,quality);
  return{...s,family:d.family,color:d.color,hot:d.hot,dark:d.dark,parts,bounds:BOUNDS,detachedLinks:parts.filter(p=>p.detached&&p.alpha>.001).length,spikes:parts.filter(p=>p.tag==='extruded-thorn').length/2,electricArcs:parts.filter(p=>p.tag==='surface-electricity'&&p.alpha>.05).length};
 }
 function trace(ctx,commands){ctx.beginPath();for(const c of commands){if(c[0]==='M')ctx.moveTo(c[1],c[2]);else if(c[0]==='L')ctx.lineTo(c[1],c[2]);else if(c[0]==='C')ctx.bezierCurveTo(...c.slice(1));else if(c[0]==='Q')ctx.quadraticCurveTo(...c.slice(1));else ctx.closePath();}}
 function create(){
  let key='',cached=null,surfaceProfile='';const surfaces=new Map();
  function release(){for(const entry of surfaces.values()){entry.canvas.width=1;entry.canvas.height=1;}surfaces.clear();}
  function paintShell(ctx,p,front,quality){
   const {rx,ry,cy}=p.shell;ctx.save();ctx.translate(0,cy);ctx.scale(1,ry/rx);const film=ctx.createRadialGradient(-rx*.2,-rx*.22,10,0,0,rx);
   film.addColorStop(0,p.dark+'00');film.addColorStop(.55,p.dark+'07');film.addColorStop(.83,p.dark+(front?'48':'30'));film.addColorStop(.96,p.color+(front?'47':'35'));film.addColorStop(1,p.hot+'45');
   ctx.globalCompositeOperation='source-over';ctx.globalAlpha=p.alpha*(front?.82:.5);ctx.fillStyle=film;ctx.beginPath();ctx.arc(0,0,rx,0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=p.color;ctx.globalAlpha=p.alpha*(front?.46:.42);ctx.lineWidth=front?1.1:2;ctx.shadowBlur=profile(quality).blur;ctx.shadowColor=p.color;ctx.stroke();ctx.restore();
  }
  function texture(f,front,quality){
   const ratio=Math.min(root.devicePixelRatio||1,profile(quality).ratio),activeProfile=quality+':'+ratio;if(surfaceProfile!==activeProfile){release();surfaceProfile=activeProfile;}const cacheKey=String(front);let entry=surfaces.get(cacheKey);
   if(!entry){entry={canvas:root.document.createElement('canvas'),key:''};surfaces.set(cacheKey,entry);}if(entry.key===key)return entry.canvas;
   const image=entry.canvas,w=410,h=375,cw=Math.round(w*ratio),ch=Math.round(h*ratio);if(image.width!==cw||image.height!==ch){image.width=cw;image.height=ch;}
   const ctx=image.getContext('2d');ctx.setTransform(ratio,0,0,ratio,205*ratio,375*ratio);ctx.clearRect(-205,-375,w,h);ctx.lineCap='round';ctx.lineJoin='round';
   for(const p of f.parts){
    if(p.material==='shell'){paintShell(ctx,p,front,quality);continue;}
    const weight=front?p.frontWeight:1-p.frontWeight,alpha=p.alpha*weight;if(alpha<.001)continue;trace(ctx,p.commands);ctx.globalCompositeOperation='lighter';ctx.strokeStyle=p.color;ctx.globalAlpha=alpha*.075;ctx.lineWidth=p.width+profile(quality).bloom;ctx.stroke();
    if(p.material==='chain'){
     ctx.globalCompositeOperation='source-over';ctx.strokeStyle=p.dark;ctx.lineWidth=p.width+2.2;ctx.globalAlpha=alpha*.9;ctx.stroke();const metal=ctx.createLinearGradient(-140,-270,140,-75);metal.addColorStop(0,p.hot);metal.addColorStop(.28,p.color);metal.addColorStop(.6,p.dark);metal.addColorStop(1,p.hot);
     ctx.strokeStyle=metal;ctx.lineWidth=p.width;ctx.globalAlpha=alpha;ctx.stroke();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=p.hot;ctx.lineWidth=.55;ctx.globalAlpha=alpha*.65;ctx.stroke();continue;
    }
    if(p.material==='stat-sigil'){
     const {x,y,direction}=p.orb,g=ctx.createLinearGradient(x-5,y+direction*14,x+5,y-direction*12);g.addColorStop(0,p.hot);g.addColorStop(.32,p.color);g.addColorStop(.75,p.dark);g.addColorStop(1,p.color+'55');ctx.globalCompositeOperation='source-over';ctx.fillStyle=g;ctx.globalAlpha=alpha;ctx.fill();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=p.color;ctx.lineWidth=.8;ctx.globalAlpha=alpha*.85;ctx.stroke();continue;
    }
    if(p.fill){const g=ctx.createLinearGradient(-150,-280,150,-50);g.addColorStop(0,p.hot+'a8');g.addColorStop(.35,p.color+'7c');g.addColorStop(.7,p.dark+'9a');g.addColorStop(1,p.hot+'95');ctx.globalCompositeOperation='source-over';ctx.fillStyle=p.material==='grain'?p.color:g;ctx.globalAlpha=alpha*.8;ctx.fill();}
    ctx.globalCompositeOperation='lighter';ctx.strokeStyle=['vortex','ribbon','facet','thorn','grain'].includes(p.material)?p.color:p.hot;ctx.lineWidth=p.width;ctx.globalAlpha=alpha*(p.material==='thorn'?.8:.9);ctx.stroke();
   }
   ctx.globalCompositeOperation='destination-in';ctx.globalAlpha=1;const fade=ctx.createLinearGradient(0,-27,0,0);fade.addColorStop(0,'#fff');fade.addColorStop(1,'#fff0');ctx.fillStyle=fade;ctx.fillRect(-205,-375,w,h);entry.key=key;return image;
  }
  return{paint(ctx,seconds,id,{loop=true,quality='full',front=false,alpha=1,reveal=1,ring=ringLayout(),flow=null}={}){
   const next=[seconds,id,loop,quality,ring.angle,ring.rx,ring.ry,ring.cy,flow?.radius,flow?.perRail,flow?.phase,flow?.channel].join(':');if(next!==key){key=next;cached=frameAt(seconds,id,{loop,quality,ring,flow});}const f=cached;ctx.save();ctx.globalCompositeOperation=f.kind==='barrier'?'source-over':'lighter';ctx.globalAlpha*=alpha*reveal;ctx.drawImage(texture(f,front,quality),-205,-375,410,375);ctx.restore();return f;
  },stats(){return{surfaces:surfaces.size,bytes:[...surfaces.values()].reduce((n,e)=>n+e.canvas.width*e.canvas.height*4,0)};},destroy(){release();cached=null;key='';}};
 }
 const api={DEFINITIONS,STAT,MATERIAL,BOUNDS,definition,duration,stateAt,frameAt,ringLayout,planStatParticles,create};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.STMAuraField=api;
})(typeof window!=='undefined'?window:globalThis);
