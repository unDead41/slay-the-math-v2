'use strict';
// Source-only native Canvas measurement; no product build or game state is changed.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root='/dev/shm/stm-all-main-20261025',out=__dirname,D=require(root+'/dist/animation-data.js'),refs=require(root+'/tests/fixtures/vfx-body-reference.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function measure(page,source,projection){return page.evaluate(async({source,projection})=>{
 const image=new Image();image.src=source;await image.decode();
 const c=document.createElement('canvas');[c.width,c.height]=projection.canvas;
 const ctx=c.getContext('2d'),r=projection.sourceRect,p=projection.sourcePivot,s=projection.drawScale,f=projection.floor;
 ctx.drawImage(image,...r,f[0]-p[0]*s,f[1]-p[1]*s,r[2]*s,r[3]*s);
 const pixels=ctx.getImageData(0,0,c.width,c.height).data;let minX=c.width,minY=c.height,maxX=-1,maxY=-1,count=0,sumX=0,sumY=0;
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>96){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);count++;sumX+=x;sumY+=y;}
 image.src='';c.width=c.height=1;return {opaqueBounds:[minX,minY,maxX,maxY],opaquePixels:count,centroid:[sumX/count,sumY/count]};
},{source,projection});}
(async()=>{let browser;try{
 browser=await chromium.launch({headless:true,executablePath:'/tmp/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage();
 const result={kind:'NATIVE_SOURCE_REGISTRATION_MEASUREMENT',animationDataSha256:sha(fs.readFileSync(root+'/dist/animation-data.js')),actors:[]};
 for(const ref of refs.actors){
  const spec=ref.actor==='mc_01'?D.hero:D.actors[ref.actor],clip=spec.animations.idle,bytes=fs.readFileSync(path.join(root,'dist/assets',clip.image));
  const projection={canvas:D.canvas,sourceRect:clip.frames[0],sourcePivot:clip.pivots?.[0]||spec.sourcePivot||D.sourcePivot,drawScale:(spec.drawScale??D.drawScale)*(clip.scales?.[0]??1),floor:spec.floorPivot||D.floorPivot};
  const source='data:image/webp;base64,'+bytes.toString('base64'),current=await measure(page,source,projection),row={actor:ref.actor,source:clip.image,sourceSha256:sha(bytes),projection,...current};
  if(ref.actor==='mc_01'){
   const previousProjection={...projection,sourcePivot:D.hero.sourcePivot},previous=await measure(page,source,previousProjection),shiftX=(previousProjection.sourcePivot[0]-projection.sourcePivot[0])*projection.drawScale;
   row.previousProjection=previousProjection;row.previous=previous;row.registrationShiftX=shiftX;row.bodyAxisFromInspectedSourceGrid=ref.bodyAxisX+shiftX;
  }
  result.actors.push(row);
 }
 fs.writeFileSync(path.join(out,'registration-measurement.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{await browser?.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
