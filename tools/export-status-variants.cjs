/* Reproducible mechanical exports. Native generated PNGs remain unchanged. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
async function build(root=path.resolve(__dirname,'..')){
 const sharp=require(process.env.IMAGE_QA_MODULE||'sharp'),dir=path.join(root,'references/status-polish'),input=JSON.parse(fs.readFileSync(path.join(dir,'inputs.json'))),assets=[];
 const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
 for(const folder of ['1080','4k'])fs.mkdirSync(path.join(dir,folder),{recursive:true});
 for(const x of input.inputs){
  const source=path.join(dir,x.source),raw=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true}),{width:w,height:h}=raw.info;
  let l=w,t=h,r=-1,b=-1;for(let y=0;y<h;y++)for(let z=0;z<w;z++)if(raw.data[(y*w+z)*4+3]){l=Math.min(l,z);r=Math.max(r,z);t=Math.min(t,y);b=Math.max(b,y);}
  if(r<0||b<0)throw Error('Empty icon '+x.id);
  const crop={left:l,top:t,width:r-l+1,height:b-t+1};
  const render=(size,pad)=>sharp(source).extract(crop).resize(size-2*pad,size-2*pad,{fit:'contain',background:'#00000000'}).extend({top:pad,bottom:pad,left:pad,right:pad,background:'#00000000'});
  const file='stm_icon_status_'+x.id.replaceAll('-','_')+'_v2.webp',bytes=await render(512,40).webp({lossless:true,effort:4}).toBuffer();fs.writeFileSync(path.join(root,'dist/assets',file),bytes);
  await render(1080,100).png().toFile(path.join(dir,'1080',x.id+'.png'));await render(4096,100).webp({lossless:true,effort:4}).toFile(path.join(dir,'4k',x.id+'.webp'));
  assets.push({id:x.id,file,sha256:hash(bytes),bytes:bytes.length,source:x.source,sourceSHA256:hash(fs.readFileSync(source)),sourceCanvas:[w,h],alphaBounds:[l,t,r,b],runtimeCanvas:[512,512],runtimePadding:40,exports:{square1080:{file:'1080/'+x.id+'.png',canvas:[1080,1080],padding:100},square4K:{file:'4k/'+x.id+'.webp',canvas:[4096,4096],padding:100,resampled:true}},motif:{block:'single broad shield','next-block':'dominant hourglass','retain-block':'dominant circular return arrow'}[x.id]});
 }
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({version:2,tool:'built-in imagegen',nativeDetail:'Native generated source dimensions recorded per asset. 4096 exports are resampled, not additional native detail.',assets},null,2)+'\n');console.log(JSON.stringify(assets.map(x=>({id:x.id,sourceCanvas:x.sourceCanvas,bytes:x.bytes}))));
}
module.exports=build;if(require.main===module)build().catch(e=>{console.error(e);process.exitCode=1;});
