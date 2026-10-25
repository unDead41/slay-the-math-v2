'use strict';
const fs=require('node:fs'),path=require('node:path'),D=require('./experience-data.cjs'),{VERSION}=require('./agent.cjs');
const MODEL=path.join(__dirname,'experience-model.json'),keyPattern=/^stm\.(attack|defend|skill|passive)\.[a-z_]+:(true|false)$/;
function createExperience(x,{enabled=true,model}={}){
 const fallback=status=>({status,id:null,deckAdjustment:()=>0});if(!enabled)return fallback('DISABLED');
 if(model===undefined){try{if(fs.statSync(MODEL).size>1024*1024)return fallback('INVALID_MODEL');model=JSON.parse(fs.readFileSync(MODEL,'utf8'));}catch(e){return fallback(e.code==='ENOENT'?'MISSING_MODEL':'INVALID_MODEL');}}
 if(model===null)return fallback('MISSING_MODEL');
 try{
  if(!model||model.schemaVersion!==1||model.kind!=='bounded-acquisition-priors'||!model.profiles||typeof model.profiles!=='object')return fallback('INVALID_MODEL');
  const {id,...body}=model;if(id!==D.digest(body))return fallback('INVALID_MODEL');
  for(const [key,p]of Object.entries(model.profiles)){
   if(D.runtimeKey(p.runtime)!==key||!p.cards||!p.pairs)return fallback('INVALID_MODEL');
   for(const [name,v]of Object.entries(p.cards))if(!keyPattern.test(name)||!valid(v))return fallback('INVALID_MODEL');
   for(const [name,v]of Object.entries(p.pairs))if(!valid(v)||!Array.isArray(v.cards)||v.cards.length!==2||v.cards[0]>=v.cards[1]||typeof v.upgraded!=='boolean'||name!==v.cards.map(c=>c+':'+v.upgraded).join('|')||!v.cards.every(c=>keyPattern.test(c+':'+v.upgraded)))return fallback('INVALID_MODEL');
  }
  if(model.trainingPolicy!==VERSION||model.policySignature!==D.policySignature())return fallback('STALE_POLICY');
  const profile=model.profiles[D.runtimeKey(x.provenance)];if(!profile)return fallback('STALE_RUNTIME');
  if(!Object.keys(profile.cards).length&&!Object.keys(profile.pairs).length)return fallback('NO_SAMPLES');
  return {status:'READY',id:model.id,deckAdjustment(deck){
   const keys=deck.map(c=>c.key+':'+!!c.upgraded),unique=new Set(keys);let value=keys.reduce((n,key)=>n+(profile.cards[key]?.adjustment||0),0);
   for(const p of Object.values(profile.pairs))if(p.cards.every(c=>unique.has(c+':'+p.upgraded)))value+=p.adjustment;
   return Math.max(-.25,Math.min(.25,value/Math.max(1,deck.length)));
  }};
 }catch{return fallback('INVALID_MODEL');}
}
function valid(v){return v&&Number.isSafeInteger(v.contexts)&&v.contexts>0&&Number.isFinite(v.meanDelta)&&Number.isFinite(v.adjustment)&&Math.abs(v.adjustment)<=.25;}
module.exports={createExperience};
