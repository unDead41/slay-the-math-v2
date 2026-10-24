const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let JSDOM;try{({JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'));}catch{}
test('native drag and selection are blocked on game art but inputs and repeated binds remain usable',{skip:!JSDOM},async()=>{
 const file=path.join(__dirname,'../dist/input-guard.js');assert.ok(fs.existsSync(file),'Shared input guard must exist');const {bind}=require(file),dom=new JSDOM('<body><img id="art"><p id="label">Game</p><textarea>hello</textarea><input type="range"><div data-allow-selection>copy</div></body>');
 try{const d=dom.window.document,dispose=bind(d);assert.equal(bind(d),dispose);const fire=(el,name)=>{const event=new dom.window.Event(name,{bubbles:true,cancelable:true});el.dispatchEvent(event);return event.defaultPrevented;};
 assert.equal(fire(d.querySelector('img'),'dragstart'),true);assert.equal(fire(d.querySelector('p'),'selectstart'),true);assert.equal(fire(d.querySelector('textarea'),'selectstart'),false);assert.equal(fire(d.querySelector('input'),'pointerdown'),false);assert.equal(fire(d.querySelector('[data-allow-selection]'),'selectstart'),false);
 const img=d.createElement('img');d.body.append(img);assert.equal(fire(img,'pointerdown'),false);assert.equal(img.draggable,false);assert.equal(fire(img,'dragstart'),true);dispose();assert.equal(fire(d.querySelector('p'),'selectstart'),false);
 }finally{dom.window.close();}
});
