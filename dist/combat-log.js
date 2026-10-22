(function(root){'use strict';
 const C=typeof module!=='undefined'?require('./config.js'):root.DCConfig;
 const LIMIT=80,integer=n=>Number.isSafeInteger(n)&&n>=0,plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
 const string=(x,max)=>typeof x==='string'&&x.length>0&&x.length<=max;
 const clone=x=>JSON.parse(JSON.stringify(x));
 function valuesOK(values){return plain(values)&&Object.keys(values).length<=24&&Object.entries(values).every(([key,value])=>string(key,60)&&(value===null||typeof value==='boolean'||typeof value==='string'&&value.length<=240||typeof value==='number'&&Number.isFinite(value)&&Math.abs(value)<=1000000000));}
 function entryOK(e,turn){return plain(e)&&integer(e.id)&&e.id>0&&integer(e.turn)&&e.turn>0&&e.turn<=turn&&['player','enemy'].includes(e.actor)&&string(e.actorName,100)&&string(e.kind,60)&&string(e.source,160)&&string(e.label,120)&&string(e.summary,800)&&(e.key===undefined||string(e.key,200))&&(e.values===undefined||valuesOK(e.values));}
 function valid(r){const b=r?.battle,s=b?.combatLog;if(s===undefined)return true;if(!plain(s)||s.version!==1||!integer(s.seq)||s.seq>1000000000||!Array.isArray(s.entries)||s.entries.length>LIMIT)return false;let previous=0;const keys=new Set();for(const e of s.entries){if(!entryOK(e,b.turn)||e.id<=previous||e.id>s.seq||e.key!==undefined&&keys.has(e.key))return false;previous=e.id;if(e.key!==undefined)keys.add(e.key);}return s.entries.length?previous===s.seq:s.seq===0;}
 function entries(r){return clone(r?.battle?.combatLog?.entries||[]);}
 function record(r,event){const b=r?.battle;if(!b)throw Error('Combat history needs a battle.');if(!valid(r))throw Error('Combat history is invalid.');const s=b.combatLog||{version:1,seq:0,entries:[]};if(event.key!==undefined){const previous=s.entries.find(e=>e.key===event.key);if(previous)return clone(previous);}
  const actor=event.actor||'player',e={id:s.seq+1,turn:event.turn??Math.max(1,b.turn),actor,actorName:event.actorName||(actor==='enemy'?C.enemies[b.enemyId]?.name:C.MC.name)||'Unknown',kind:event.kind,source:event.source,label:event.label,summary:event.summary};if(event.key!==undefined)e.key=event.key;if(event.values!==undefined)e.values=clone(event.values);if(!entryOK(e,Math.max(1,b.turn)))throw Error('This combat history entry is invalid.');s.seq=e.id;s.entries.push(e);if(s.entries.length>LIMIT)s.entries.splice(0,s.entries.length-LIMIT);b.combatLog=s;return clone(e);
 }
 const api={record,entries,valid};if(typeof module!=='undefined')module.exports=api;else root.DCCombatLog=api;
})(typeof window!=='undefined'?window:globalThis);
