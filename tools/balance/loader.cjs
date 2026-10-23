'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const candidate=require('./candidate.cjs');
const ROOT=path.resolve(__dirname,'../..'),BASE='2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7',sources=new Map();
function source(file,pinned){
 if(!pinned&&process.env.STM_BALANCE_REPLAY_MEASURED==='1'&&file===path.join(ROOT,'dist/card-combat.js'))return fs.readFileSync(path.join(ROOT,'tools/balance/snapshots/measured-card-combat.js'),'utf8');
 const key=(pinned?'base:':'work:')+file;
 if(!sources.has(key))sources.set(key,pinned?cp.execFileSync('git',['show',BASE+':'+path.relative(ROOT,file)],{cwd:ROOT,encoding:'utf8',maxBuffer:16*1024*1024}):fs.readFileSync(file,'utf8'));
 return sources.get(key);
}
function loadEngine({build='baseline',difficulty='medium'}={}){
 if(!['baseline','candidate','cards_only'].includes(build))throw Error('Unknown balance build');
 if(build!=='baseline'&&!candidate.spec.profiles[difficulty])throw Error('Unknown difficulty');
 const cache=new Map(),privateGlobal={},pinned=build==='baseline';
 function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;
  const module={exports:{}};cache.set(file,module);
  const localRequire=name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)):require(name);
  const code=source(file,pinned);new Function('require','module','exports','globalThis',code+'\n//# sourceURL='+file)(localRequire,module,module.exports,privateGlobal);
  if(build!=='baseline'&&file===path.join(ROOT,'dist/card-data.js'))module.exports=candidate.cards(module.exports);
  if(build!=='baseline'&&file===path.join(ROOT,'dist/artifact-data.js'))module.exports=candidate.artifacts(module.exports);
  if(build==='candidate'&&file===path.join(ROOT,'dist/config.js'))candidate.config(module.exports,difficulty);
  return module.exports;
 }
 const E=load(path.join(ROOT,'dist/engine.js'));
 const out={E,C:load(path.join(ROOT,'dist/config.js')),A:load(path.join(ROOT,'dist/artifacts.js')),CC:load(path.join(ROOT,'dist/card-combat.js')),Q:load(path.join(ROOT,'dist/education.js')),data:load(path.join(ROOT,'dist/card-data.js')),build,difficulty};
 out.provenance={baseCommit:BASE,build,difficulty,cardHash:crypto.createHash('sha256').update(JSON.stringify(out.data)).digest('hex'),engineHash:crypto.createHash('sha256').update([...cache.keys()].sort().map(file=>path.relative(ROOT,file)+'\n'+source(file,pinned)).join('\n')).digest('hex'),artifactHash:crypto.createHash('sha256').update(JSON.stringify(out.A.catalog)).digest('hex'),engineSource:build==='baseline'?'pinned git object':'working branch with optional definition contracts'};
 return out;
}
module.exports={loadEngine,ROOT,BASE};
