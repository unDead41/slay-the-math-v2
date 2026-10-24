/* Preview V10: targeted identity, continuity, ordering and preservation checks. */
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
process.chdir(__dirname);
const expected=require('./fixtures/v9-preservation.json');
const F=require('./passive-vfx.js'),B=require('./fixtures/passive-v9.js');
const digest=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const report={version:10,passiveEngine:5,scope:'Standalone HTML preview only',period:F.PERIOD};
function visibleSignature(f){const out=[];for(const part of [...f.base.parts,...f.layers.flatMap(l=>l.parts)]){out.push(part.alpha);for(const c of part.commands){if(c[0]==='Z')continue;if(c[0]==='A')for(const a of [c[4],(c[4]+c[5])/2,c[5]])out.push((c[1]+Math.cos(a)*c[3])*part.alpha,(c[2]+Math.sin(a)*c[3])*part.alpha);else for(const v of c.slice(1))out.push(v*part.alpha);}}return out;}
let variants=0,maxStep=0,maxVelocityMismatch=0;
for(const quality of ['full','low'])for(let id=0;id<10;id++)for(let slot=0;slot<3;slot++){
 const order=[id,...Array.from({length:10},(_,n)=>n).filter(n=>n!==id).slice(0,2)];[order[0],order[slot]]=[order[slot],order[0]];
 const at=t=>visibleSignature(F.frameAt(t,order,{quality})),zero=at(0),end=at(24),e=.0001,left=at(24-e),right=at(e);assert.deepEqual(zero,end);
 for(let i=0;i<zero.length;i++){maxStep=Math.max(maxStep,Math.abs(right[i]-left[i]));maxVelocityMismatch=Math.max(maxVelocityMismatch,Math.abs((right[i]-zero[i])/e-(zero[i]-left[i])/e));}variants++;
}
assert(maxStep<.025);assert(maxVelocityMismatch<.03);report.loopMath={variants,exactEndpoints:true,epsilonSeconds:.0001,maxPremultipliedStep:maxStep,maxVelocityMismatch};
let baseComparisons=0,orderedTriples=0;
for(const quality of ['full','low']){
 for(const count of [1,2,3])for(const t of [0,1.2,7.2,14,23.999,24]){assert.deepEqual(F.baseAt(t,count,{quality}),B.baseAt(t,count,{quality}));baseComparisons++;}
 const base=digest(F.frameAt(7.2,[0,1,2],{quality}).base);
 for(let a=0;a<10;a++)for(let b=0;b<10;b++)for(let c=0;c<10;c++)if(a!==b&&a!==c&&b!==c){const order=[a,b,c],f=F.frameAt(7.2,order,{quality});assert.equal(digest(f.base),base);assert.deepEqual(f.layers.map(v=>[v.id,v.slot,v.radius]),order.map((id,slot)=>[id,slot,F.RADII[slot]]));orderedTriples++;}
}
report.sharedBase={unchangedFromV9:baseComparisons,identityIndependentTriples:orderedTriples};
const expectedCounts=[4,30,3,36,6,4,8,3,3,3];
for(const quality of ['full','low'])for(let id=0;id<10;id++)for(const t of [0,7.2,12,24]){const parts=F.motifAt(t,id,72,{quality}).parts;assert.equal(parts.filter(p=>p.tag===F.SIGNATURES[id]).length,expectedCounts[id]);}
assert.equal(new Set(F.SIGNATURES).size,10);
assert.equal(new Set(Array.from({length:10},(_,id)=>digest(F.motifAt(7.2,id).parts.filter(p=>p.tag===F.SIGNATURES[id]).map(p=>p.commands)))).size,10);
report.identities={uniquePrimaryShapes:10,primaryTags:F.SIGNATURES,primaryCounts:expectedCounts,lowPreservesPrimaryShapes:true,visualReview:'Native browser contact sheet in colour and grayscale, recorded separately.'};
const field=F.create();field.setSelection([0,1],0,{immediate:true});field.setSelection([1,0],3);assert.deepEqual(field.snapshot(3).tracks.map(v=>[v.id,v.radius]),[[1,117],[0,72]]);assert.deepEqual(field.snapshot(4).tracks.map(v=>[v.id,v.radius]),[[1,72],[0,117]]);
field.setSelection([0,1],5);const before=field.snapshot(5.3);field.setSelection([9,0,1],5.3);for(const prior of before.tracks){const after=field.snapshot(5.3).tracks.find(v=>v.id===prior.id);assert.equal(after.radius,prior.radius);assert.equal(after.weight,prior.weight);}field.setSelection([9,1],7);assert.deepEqual(field.snapshot(8).tracks.filter(v=>v.weight>.001).map(v=>[v.id,v.radius]),[[9,72],[1,117]]);
report.transitions={ABThenBA:true,interruptionKeepsPosition:true,removalCompactsOrder:true};
let samples=0,maxExtent=0;for(const quality of ['full','low'])for(let id=0;id<10;id++)for(let slot=0;slot<3;slot++)for(let t=0;t<=24;t+=.125){for(const part of F.motifAt(t,id,F.RADII[slot],{quality,slot}).parts)for(const c of part.commands){for(const value of c.slice(1))assert(Number.isFinite(value));if(c[0]==='A')maxExtent=Math.max(maxExtent,Math.hypot(c[1],c[2])+c[3]);else if(c[0]!=='Z')for(let n=1;n<c.length;n+=2)maxExtent=Math.max(maxExtent,Math.hypot(c[n],c[n+1]));}samples++;}
assert(maxExtent+5<F.EXTENT);report.geometry={finiteSamples:samples,maxControlPointExtent:maxExtent,textureExtent:F.EXTENT};
for(const filename of ['orbital-vfx.js','shield-vfx.js'])assert.equal(digest(fs.readFileSync(filename,'utf8')),expected.v9SourceHashes[filename]);
const adapter=fs.readFileSync('effects.js','utf8');assert.equal(digest(adapter.replace("passiveVersion='5'","passiveVersion='4'")),expected.v9SourceHashes['effects.js']);
report.preserved={statAndBarrierModule:true,shieldModule:true,actorRendererAndScheduler:true,passiveOnlyFloorPolicy:true};
const html=fs.readFileSync('index.html','utf8');
const assets=s=>[...s.matchAll(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g)].map(m=>digest(m[0])).sort();assert.deepEqual(assets(html),expected.originalEmbeddedImageHashes);
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];for(const [i,m]of scripts.entries())new vm.Script(m[1],{filename:'inline-'+i});assert.equal(scripts.length,6);assert(!/(?:src|href)=["']https?:/.test(html));assert(!html.includes('@@'));assert(html.includes('passive-circle-v5'));
report.artifact={scriptsValid:scripts.length,selfContained:true,originalEmbeddedAssetsUnchanged:assets(html).length,bytes:Buffer.byteLength(html),sha256:digest(html)};
fs.mkdirSync('dist',{recursive:true});
fs.writeFileSync('dist/passive-v10-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
