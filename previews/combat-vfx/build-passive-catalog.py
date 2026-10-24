from pathlib import Path

root = Path(__file__).parent
source = (root / 'passive-vfx.js').read_text()
names = ['Blazing Spirit', 'Growing Flame', 'Swift Step', 'Battle Rhythm', 'Rune Armor', 'Lasting Shield', 'Grimoire Ward', 'Ember Core', 'Clear Mind', 'Last Ember']
import json
html = '''<!doctype html><html lang="ms"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Passive V10 · Sepuluh motif</title>
<style>*{box-sizing:border-box}body{max-width:1420px;margin:auto;padding:24px;background:#0a1118;color:#ecdcc3;font:14px system-ui}h1{font:30px Georgia;margin:0 0 8px}p{color:#b5bdc6;line-height:1.5;margin:0 0 18px}nav{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin:18px 0 22px}button,select{background:#172634;border:1px solid #7b6950;color:#ffeacb;padding:9px 12px;border-radius:6px}input{accent-color:#e4bd72}main{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}article{border:1px solid #645543;border-radius:9px;background:radial-gradient(ellipse,#20313e,#0c1722 72%);overflow:hidden;padding:13px}h2{font-size:14px;font-weight:600;margin:0 0 4px}small{display:block;font-size:11px;color:#aab7c5;line-height:1.5;min-height:32px}canvas{display:block;width:100%;aspect-ratio:1}.mono canvas{filter:grayscale(1)}footer{margin-top:22px;color:#aab3be;font-size:12px}@media(max-width:800px){main{grid-template-columns:repeat(2,minmax(0,1fr))}body{padding:14px}}@media print{nav{display:none}}</style>
<header><h1>Passive V10 · Sepuluh motif tersendiri</h1><p>Setiap panel menggunakan circle dan layer pertama yang sama. Bandingkan bentuk serta gerakan hiasan setiap Passive.</p></header>
<nav><label>Kualiti <select id="quality"><option value="full">Full</option><option value="low">Low</option></select></label><label><input type="checkbox" id="mono"> Tanpa warna</label><label>Fasa <input id="phase" type="range" min="0" max="1000" value="300"><output id="time">7.20 s</output></label><button id="start">Awal loop</button><button id="end">Akhir loop</button></nav><main id="catalog"></main><footer>Magic circle dikongsi · Hiasan unik bagi setiap Passive · Preview sahaja</footer>
<script>'''+source+'''</script><script>
const names='''+json.dumps(names)+''', cards=[], $=id=>document.getElementById(id);
for(let id=0;id<10;id++){
 const article=document.createElement('article'),h=document.createElement('h2'),sub=document.createElement('small'),canvas=document.createElement('canvas');
 h.textContent=names[id];sub.textContent=STMPassiveField.MOTIFS[id];canvas.width=560;canvas.height=560;canvas.setAttribute('aria-label',STMPassiveField.DESCRIPTIONS[id]);
 article.append(h,sub,canvas);$('catalog').append(article);const field=STMPassiveField.create();field.setSelection([id],0,{immediate:true});cards.push({field,canvas});
}
function render(){const t=Number($('phase').value)*.024,quality=$('quality').value;for(const {field,canvas} of cards){const ctx=canvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,560,560);ctx.translate(280,280);ctx.scale(2.25,2.25);for(const front of [false,true])field.paint(ctx,t,{quality,plan:true,front});}document.body.classList.toggle('mono',$('mono').checked);$('time').value=t.toFixed(2)+' s';document.body.dataset.quality=quality;document.body.dataset.phase=$('phase').value;document.body.dataset.rendered='true';}
$('quality').onchange=$('phase').oninput=$('mono').onchange=render;$('start').onclick=()=>{$('phase').value=0;render();};$('end').onclick=()=>{$('phase').value=1000;render();};render();
// Compare actual Canvas endpoint pixels for every identity, slot and quality.
const proof={endpointVariants:0,identicalEndpointPixels:true,emptyVariants:[],errors:[]};
try{for(const quality of ['full','low'])for(let id=0;id<10;id++)for(let slot=0;slot<3;slot++){
 const order=[id,...Array.from({length:10},(_,n)=>n).filter(n=>n!==id).slice(0,2)];[order[0],order[slot]]=[order[slot],order[0]];
 const field=STMPassiveField.create();field.setSelection(order,0,{immediate:true});const c=document.createElement('canvas');c.width=c.height=426;const ctx=c.getContext('2d');
 const sample=t=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,426,426);ctx.translate(213,213);for(const front of [false,true])field.paint(ctx,t,{quality,plan:true,front});return ctx.getImageData(0,0,426,426).data;};
 const a=sample(0),b=sample(24);let nonzero=0;for(let n=0;n<a.length;n++){if(a[n]!==b[n])proof.identicalEndpointPixels=false;if(n%4===3&&a[n])nonzero++;}if(!nonzero)proof.emptyVariants.push({id,slot,quality});proof.endpointVariants++;
}}catch(e){proof.errors.push(String(e));}
document.body.dataset.endpointProof=JSON.stringify(proof);
</script></html>'''
(root / 'dist/qa-passive-catalog.html').write_text(html)
# The downloadable gallery contains the controls and artwork, without QA work at load.
(root / 'dist/passive-catalog.html').write_text(html[:html.index('// Compare actual Canvas endpoint pixels')]+'</script></html>')
