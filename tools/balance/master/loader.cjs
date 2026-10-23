'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'../../..');
function loadMaster({difficulty='medium'}={}){
 const binding=require('../../../dist/balance.js').create(difficulty),cache=new Map(),privateGlobal={};
 function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;
  const m={exports:{}};cache.set(file,m);
  const localRequire=name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)):require(name);
  const code=fs.readFileSync(file,'utf8');new Function('require','module','exports','globalThis',code+'\n//# sourceURL='+file)(localRequire,m,m.exports,privateGlobal);
  if(file===path.join(ROOT,'dist/card-data.js'))m.exports=binding.cardData();
  if(file===path.join(ROOT,'dist/artifact-data.js'))m.exports=binding.artifactData();
  if(file===path.join(ROOT,'dist/economy-data.js'))m.exports=binding.economyData(m.exports);
  if(file===path.join(ROOT,'dist/rich-text-data.js'))m.exports=binding.richTextData(m.exports);
  if(file===path.join(ROOT,'dist/config.js'))binding.configure(m.exports);
  return m.exports;
 }
 const out={build:'master',difficulty,binding};
 for(const [key,file]of Object.entries({E:'engine',C:'config',A:'artifacts',CC:'card-combat',Q:'education',X:'mystery',G:'map',R:'rich-text',L:'combat-log',Eco:'economy',data:'card-data'}))out[key]=load(path.join(ROOT,'dist/'+file+'.js'));
 out.provenance={...binding.identity,engineHash:crypto.createHash('sha256').update([...cache.keys()].sort().map(p=>path.relative(ROOT,p)+'\n'+fs.readFileSync(p,'utf8')).join('\n')).digest('hex'),source:'integrated working tree',pupilCalibration:false};
 out.sourceFiles=[...cache.keys()].map(p=>path.relative(ROOT,p));
 return out;
}
module.exports={loadMaster,ROOT};
