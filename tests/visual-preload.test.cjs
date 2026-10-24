const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('warming the current actor reuses its decoded idle texture for the first canvas frame',async()=>{
 let loads=0,paints=0;const host={DCAnimationData:require('../dist/animation-data.js'),CanvasRenderingContext2D:function(){},requestAnimationFrame(){return 1;},cancelAnimationFrame(){},Image:class {set src(v){this.url=v;loads++;}decode(){return Promise.resolve();}}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../dist/animation.js'),'utf8'),{window:host});const api=host.DCActorAnimation;assert.equal(typeof api.preload,'function','Actor warmup API must exist');await api.preload(0,'mc_01');
 const parent={dataset:{}},canvas={parentElement:parent,dataset:{},getContext(){return {clearRect(){},drawImage(){paints++;}};}};const player=api.mount(canvas,0,'mc_01');await new Promise(r=>setImmediate(r));assert.equal(loads,1);assert.equal(paints,1);assert.equal(parent.dataset.animationReady,'true');player.destroy();
});
