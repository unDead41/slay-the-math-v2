/* Shield material study V3. Deterministic geometry and a closed periodic field. */
(function(root){'use strict';
 const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),mod=(x,n)=>((x%n)+n)%n;
 const smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
 const ramp=(t,a,b)=>smooth((t-a)/(b-a));
 const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
 const duration=event=>['active','hit'].includes(event)?8:10;
 const meshCache=new Map();
 function mesh(quality){
  if(meshCache.has(quality))return meshCache.get(quality);
  const cols=quality==='low'?14:20,rows=quality==='low'?8:12,dl=TAU/cols,da=Math.PI/(rows+1),out=[];
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const lon=(col+(row%2)*.5)*dl,lat=-Math.PI/2+(row+1)*da,index=row*cols+col;
   const unit=(lo,la)=>{la=Math.max(-1.54,Math.min(1.54,la));return [Math.cos(la)*Math.sin(lo),Math.sin(la),Math.cos(la)*Math.cos(lo)];};
   const center=unit(lon,lat),vertices=Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*TAU/6;return unit(lon+Math.cos(a)*dl/Math.sqrt(3),lat+Math.sin(a)*da*(2/3));});
   out.push({index,lon,lat,center,vertices,seed:hash(index+17)});
  }
  meshCache.set(quality,out);return out;
 }
 function stateAt(seconds,event='active',{loop=true}={}){
  const period=duration(event),t=loop?mod(seconds,period):Math.max(0,seconds),p=mod(seconds,period)/period;
  let formation=1,dissolve=0,visibility=1,phase='steady',impactAge=-1,breakAge=-1;
  if(event==='gain'){
   formation=ramp(t,.18,1.5);dissolve=loop?ramp(t,6.9,8.7):0;visibility=formation*(1-dissolve);
   phase=t<.18?'quiet':t<1.5?'forming':dissolve>0&&dissolve<1?'resetting':dissolve===1?'quiet':'steady';if(loop&&t>=8.7){formation=0;dissolve=0;visibility=0;phase='quiet';}
  }else if(event==='hit'){
   impactAge=t-1.55;phase=impactAge>=0&&impactAge<1.6?'impact':'steady';
  }else if(event==='break'){
   impactAge=t-1.55;breakAge=t-1.65;
   const gone=ramp(t,1.73,2.25),reform=loop?ramp(t,5.9,8.3):0;
   visibility=1-gone+reform;formation=t>=5.5?reform:1;
   phase=t<1.55?'steady':t<1.8?'impact':t<4.2?'shattering':t<5.9?'quiet':t<8.3&&loop?'reforming':loop?'steady':'quiet';
  }else if(event==='expire'){
   dissolve=ramp(t,1.55,3.75);const reform=loop?ramp(t,5.9,8.3):0;
   if(reform>0){formation=reform;dissolve=0;visibility=reform;}else visibility=1-dissolve;
   phase=t<1.55?'steady':t<3.75?'dissolving':t<5.9?'quiet':t<8.3&&loop?'reforming':loop?'steady':'quiet';
  }
  if(!loop&&['break','expire'].includes(event)&&t>4.8){visibility=0;formation=0;phase='quiet';}
  const impact=impactAge>=0&&impactAge<1.7?Math.exp(-impactAge*5)*Math.sin(Math.min(1,impactAge/.07)*Math.PI/2):0;
  return {event,loop,seconds,t,period,p,formation,dissolve,visibility:clamp(visibility),phase,impact,impactAge,breakAge};
 }
 function point(v,p,impact=0){
  const yaw=.105*Math.sin(TAU*p),cy=Math.cos(yaw),sy=Math.sin(yaw),x=v[0]*cy+v[2]*sy,z=v[2]*cy-v[0]*sy;
  const breathe=1+.004*Math.sin(TAU*p),rx=138*breathe*(1-impact*.012),ry=169*breathe*(1+impact*.005);
  return {x:x*rx+impact*1.5,y:v[1]*ry-145,z,normal:[x,v[1],z]};
 }
 function mask(cell,s){
  const y=clamp((cell.center.y+145+169)/338);
  const form=ramp(s.formation,.05+.8*(1-y),.2+.8*(1-y));
  const fade=1-ramp(s.dissolve,.15+.7*y,.3+.7*y);
  return form*fade;
 }
 function frameAt(seconds,event='active',{loop=true,quality='full'}={}){
  const s=stateAt(seconds,event,{loop}),light=[Math.cos(TAU*s.p)*.7,-.3,Math.sin(TAU*s.p)*.6+.5];
  const cells=mesh(quality).map(m=>{
   const center=point(m.center,s.p,s.impact),vertices=m.vertices.map(v=>point(v,s.p,s.impact));
   const edge=Math.pow(1-Math.abs(center.z),1.8),lightDot=Math.max(0,center.normal[0]*light[0]+center.normal[1]*light[1]+center.normal[2]*light[2]);
   const energy=Math.pow((1+Math.sin(TAU*(2*s.p)+m.lat*3.6+m.lon*1.3))/2,10);
   const impactDistance=Math.acos(Math.max(-1,Math.min(1,center.normal[0]*.8+center.normal[1]*-.18+center.normal[2]*.572)));
   const age=s.impactAge,wave=age>=0&&age<1.7?Math.exp(-Math.pow((impactDistance-age*2.7)/.12,2))*(1-ramp(age,.3,1.5)):0;
   const frontWeight=ramp(center.z,-.13,.13);
   const cell={...m,center,vertices,frontWeight,edge,light:lightDot,energy,wave,alpha:1};
   cell.alpha=mask(cell,s);
   if(event==='break'&&s.t<=5.5){const delay=.05+m.seed*.16+impactDistance*.035;cell.alpha*=1-ramp(s.breakAge,delay,delay+.17);}
   return cell;
  });
  const fragments=[];
  if(event==='break'&&s.breakAge>=0&&s.breakAge<2.65){
   for(const m of mesh(quality)){
    if(m.index%(quality==='low'?5:4))continue;
    const age=s.breakAge-(.05+m.seed*.16);if(age<0||age>2.4)continue;
    const c=point(m.center,1.65/s.period),verts=m.vertices.map(v=>point(v,1.65/s.period));
    const speed=28+m.seed*55,vx=m.center[0]*speed+12,vy=m.center[1]*speed-12,dx=vx*age,dy=vy*age+24*age*age;
    const rot=(m.seed-.5)*age*3.8,cs=Math.cos(rot),sn=Math.sin(rot),fold=.2+.8*Math.abs(Math.cos(age*(1.1+m.seed))),size=1-age*.1;
    const points=verts.map(v=>{const x=(v.x-c.x)*size,y=(v.y-c.y)*size*fold;return [c.x+dx+x*cs-y*sn,c.y+dy+x*sn+y*cs];});
    const alpha=ramp(age,0,.09)*(1-ramp(age,1.05,2.35));
    fragments.push({points,alpha,frontWeight:ramp(c.z,-.13,.13),center:[c.x+dx,c.y+dy],tail:[c.x+dx-vx*.045,c.y+dy-(vy+48*age)*.045],seed:m.seed});
   }
  }
  return {...s,cells,fragments};
 }
 function path(ctx,points){ctx.beginPath();for(let i=0;i<points.length;i++)i?ctx.lineTo(points[i][0]??points[i].x,points[i][1]??points[i].y):ctx.moveTo(points[i][0]??points[i].x,points[i][1]??points[i].y);ctx.closePath();}
 function haze(ctx,x,y,rx,ry,color,alpha){if(alpha<.0001)return;ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);const g=ctx.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,color);g.addColorStop(.25,color+'aa');g.addColorStop(1,color+'00');ctx.globalAlpha*=alpha;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rx,0,TAU);ctx.fill();ctx.restore();}
 function shellClip(ctx,f){ctx.beginPath();ctx.ellipse(f.impact*1.5,-145,138*(1-f.impact*.012),169*(1+f.impact*.005),0,0,TAU);ctx.clip();if(f.formation<1){const top=24-f.formation*338;ctx.beginPath();ctx.rect(-160,top,320,360);ctx.clip();}}
 function shell(ctx,f,front,quality){
  if(f.visibility<.0001)return;
  ctx.save();shellClip(ctx,f);const opacity=f.visibility;
  const film=ctx.createRadialGradient(-49,-213,18,0,-145,177);
  film.addColorStop(0,'#c5f9ff00');film.addColorStop(.42,'#8ce6ff03');film.addColorStop(.72,'#287ebd0c');film.addColorStop(.93,'#72e1fc24');film.addColorStop(1,'#c2f5ff48');
  ctx.globalAlpha*=opacity*(front?.8:.65);ctx.fillStyle=film;ctx.fillRect(-160,-325,320,365);
  if(front&&quality!=='low'){
   const reflection=ctx.createLinearGradient(-140,0,140,0);reflection.addColorStop(0,'#b8faff13');reflection.addColorStop(.17,'#e1fcff00');reflection.addColorStop(.72,'#e1fcff00');reflection.addColorStop(1,'#bef8ff17');ctx.fillStyle=reflection;ctx.fillRect(-145,-315,290,340);
  }
  ctx.restore();
 }
 function rim(ctx,f,front,quality){
  const visibility=f.visibility*(1-f.dissolve*.45);if(visibility<.0001)return;
  ctx.save();if(f.formation<1){ctx.beginPath();ctx.rect(-180,24-f.formation*338,360,365);ctx.clip();}
  ctx.translate(f.impact*1.5,-145);const rx=138*(1-f.impact*.012),ry=169*(1+f.impact*.005),p=TAU*f.p;
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#72d9f6';ctx.shadowColor='#6cddff';
  ctx.globalAlpha*=visibility*(front?.72:.38);ctx.lineWidth=front?1.25:5.5;ctx.shadowBlur=quality==='low'?3:front?10:17;
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.stroke();
  if(front){
   ctx.shadowBlur=quality==='low'?2:8;ctx.strokeStyle='#d6fbff';ctx.lineWidth=1.05;ctx.globalAlpha*=.85;
   for(let j=0;j<2;j++){const a=p+j*Math.PI+.3;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,a,a+.5);ctx.stroke();}
   ctx.strokeStyle='#94e8ff';ctx.lineWidth=.7;ctx.globalAlpha*=.45;ctx.shadowBlur=0;ctx.beginPath();ctx.ellipse(0,0,rx-3,ry-3,0,0,TAU);ctx.stroke();
  }
  ctx.restore();
 }
 function cells(ctx,f,front){
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.shadowBlur=0;
  for(const c of f.cells){
   const side=front?c.frontWeight:1-c.frontWeight;if(c.alpha*side<.002)continue;
   const faceSafe=front&&Math.abs(c.center.x)<67&&c.center.y<-75&&c.center.y>-281?.25:1;
   const a=c.alpha*side*(front?.09:.065)*(1+c.edge*3.2+c.light*.45+c.energy*1.2+c.wave*8)*faceSafe;
   ctx.save();ctx.globalAlpha*=Math.min(.8,a);ctx.strokeStyle=c.wave>.2?'#e4fcff':'#a5eafd';ctx.lineWidth=.7+c.edge*.4+c.wave*.8;
   path(ctx,c.vertices);ctx.stroke();
   if(c.energy>.65||c.wave>.14||c.edge>.7){ctx.globalAlpha*=.28;ctx.fillStyle='#8de7ff';ctx.fill();}
   ctx.restore();
  }
  ctx.restore();
 }
 function surfaceRipples(ctx,f,front){
  if(!front||f.impactAge<0||f.impactAge>1.7||(f.event==='break'&&f.breakAge>.8))return;
  const age=f.impactAge,a=(1-ramp(age,.2,1.55))*ramp(age,0,.055),hx=109,hy=-175;
  ctx.save();shellClip(ctx,f);haze(ctx,hx,hy,34+age*18,43+age*21,'#d6fbff',a*.36);
  const n=[.8,-.18,.572],tangent=[.22,.975,0];const cross=[n[1]*tangent[2]-n[2]*tangent[1],n[2]*tangent[0]-n[0]*tangent[2],n[0]*tangent[1]-n[1]*tangent[0]];
  ctx.strokeStyle='#c9f9ff';ctx.lineWidth=1.2;ctx.shadowColor='#89e8ff';ctx.shadowBlur=7;
  for(let k=0;k<3;k++){
   const radius=(age-k*.115)*2.6;if(radius<=0||radius>2.4)continue;ctx.save();ctx.globalAlpha*=a*(.65-k*.13);ctx.beginPath();let open=false;
   for(let j=0;j<=80;j++){const a=j/80*TAU,u=Math.cos(a),v=Math.sin(a),cr=Math.cos(radius),sr=Math.sin(radius),p=[n[0]*cr+(tangent[0]*u+cross[0]*v)*sr,n[1]*cr+(tangent[1]*u+cross[1]*v)*sr,n[2]*cr+(tangent[2]*u+cross[2]*v)*sr];const q=point(p,f.p);if(q.z>-.05){if(open)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);open=true;}else open=false;}
   ctx.stroke();ctx.restore();
  }
  ctx.restore();
 }
 function debris(ctx,f,front,quality){
  for(const fragment of f.fragments){const side=front?fragment.frontWeight:1-fragment.frontWeight;if(side*fragment.alpha<.005)continue;ctx.save();ctx.globalAlpha*=side*fragment.alpha;ctx.strokeStyle='#b9f5ff';ctx.lineWidth=1.1;ctx.shadowColor='#7cdfff';ctx.shadowBlur=quality==='low'?2:5;path(ctx,fragment.points);ctx.fillStyle='#a4edff18';ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha*=.2;ctx.beginPath();ctx.moveTo(...fragment.tail);ctx.lineTo(...fragment.center);ctx.stroke();ctx.restore();}
  if(front&&f.event==='expire'&&f.dissolve>0&&f.dissolve<1){
   const n=quality==='low'?12:30;
   for(let i=0;i<n;i++){const delay=hash(i+92)*1.35,age=f.t-1.55-delay;if(age<=0||age>=1.8)continue;const a=Math.sin(Math.PI*age/1.8)*.3,x=(hash(i+4)-.5)*235+Math.sin(age+i)*7,y=-287+hash(i+123)*260-age*21;haze(ctx,x,y,3.3,3.3,'#b4edff',a);}
  }
 }
 function create(){
  let key='',cached=null;const materials=new Map();
  function material(front,quality){const key=front+':'+quality;if(materials.has(key))return materials.get(key);const canvas=root.document.createElement('canvas'),ratio=Math.min(root.devicePixelRatio||1,quality==='low'?1.25:1.75);canvas.width=Math.round(360*ratio);canvas.height=Math.round(390*ratio);const c=canvas.getContext('2d');c.scale(ratio,ratio);c.translate(180,335);const stable=stateAt(0,'active');shell(c,stable,front,quality);rim(c,stable,front,quality);materials.set(key,canvas);return canvas;}
  function paintMaterial(ctx,f,front,quality){if(f.visibility<.0001)return;ctx.save();if(f.formation<1){ctx.beginPath();ctx.rect(-180,24-f.formation*338,360,365);ctx.clip();}const b=1+.004*Math.sin(TAU*f.p);ctx.globalAlpha*=f.visibility;ctx.translate(f.impact*1.5,-145);ctx.scale(b*(1-f.impact*.012),b*(1+f.impact*.005));ctx.translate(0,145);ctx.drawImage(material(front,quality),-180,-335,360,390);ctx.restore();}
  function tracers(ctx,f,front,quality){if(!front||f.visibility<.0001)return;ctx.save();if(f.formation<1){ctx.beginPath();ctx.rect(-180,24-f.formation*338,360,365);ctx.clip();}ctx.globalAlpha*=f.visibility*.38;ctx.strokeStyle='#dcfbff';ctx.lineWidth=.85;ctx.shadowColor='#b1efff';ctx.shadowBlur=quality==='low'?0:3;const a=TAU*f.p+.8;for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(0,-145,138,169,0,a+i*Math.PI,a+i*Math.PI+.32);ctx.stroke();}ctx.restore();}
  return {paint(ctx,seconds,event,{loop=true,quality='full',front=true,alpha=1}={}){
   const nextKey=[seconds,event,loop,quality].join(':');if(key!==nextKey){key=nextKey;cached=frameAt(seconds,event,{loop,quality});}const f=cached;
   ctx.save();ctx.globalAlpha*=alpha;
   if(!front){haze(ctx,0,-135,153,184,'#2388c0',f.visibility*.055);}
   paintMaterial(ctx,f,front,quality);cells(ctx,f,front);tracers(ctx,f,front,quality);surfaceRipples(ctx,f,front);debris(ctx,f,front,quality);
   ctx.restore();return f;
  }};
 }
 const api={create,stateAt,frameAt,duration};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.STMShieldField=api;
})(typeof window!=='undefined'?window:globalThis);
