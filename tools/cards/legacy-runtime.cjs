'use strict';
// Frozen ordinary card definitions for prior-save and historical experiment replay.
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'../..');
module.exports=function legacyRuntime(){const cache=new Map(),privateGlobal={};
 function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);const req=name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)):require(name);new Function('require','module','exports','globalThis',fs.readFileSync(file,'utf8'))(req,m,m.exports,privateGlobal);if(file===path.join(root,'dist/card-data.js'))m.exports=m.exports.legacyEffectsData||m.exports;return m.exports;}
 return Object.fromEntries(Object.entries({E:'engine',A:'artifacts',C:'config',CC:'card-combat',Q:'education',X:'mystery',G:'map',R:'rich-text',L:'combat-log',data:'card-data'}).map(([key,file])=>[key,load(path.join(root,'dist/'+file+'.js'))]));
};
