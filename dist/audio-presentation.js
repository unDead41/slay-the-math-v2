(function(root){
'use strict';
const sequences={dungeonMaster:['vo_dm_01','vo_dm_02','vo_dm_03','vo_dm_04'],merchant:['vo_shop_01','vo_shop_02','vo_shop_03']};
const MAX_RECORDS=128;
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const count=value=>Number.isSafeInteger(value)&&value>=0?value:0;
const selectedVoice=(speaker,visit)=>sequences[speaker][Math.min(visit,sequences[speaker].length)-1];
const empty=()=>({version:1,visits:{dungeonMaster:0,merchant:0},encounters:{}});
function normalizeAudioMetadata(value){
 const out=empty();
 if(!object(value)||value.version!==1)return out;
 for(const speaker of Object.keys(sequences))out.visits[speaker]=count(value.visits?.[speaker]);
 if(!object(value.encounters))return out;
 for(const key of Object.keys(value.encounters)){
  if(Object.keys(out.encounters).length>=MAX_RECORDS)break;
  const record=value.encounters[key],speaker=record?.speaker,visit=record?.visitNumber;
  if(!object(record)||!Object.hasOwn(sequences,speaker)||!Number.isSafeInteger(visit)||visit<1)continue;
  if(typeof key!=='string'||key.length>240||/[\x00-\x1f\x7f]/.test(key)||!key.startsWith(speaker==='merchant'?'shop:':'artifact:'))continue;
  if(record.voiceId!==selectedVoice(speaker,visit))continue;
  out.encounters[key]={speaker,visitNumber:visit,voiceId:record.voiceId};
  out.visits[speaker]=Math.max(out.visits[speaker],visit);
 }
 return out;
}
function normalizeRunAudio(run){
 if(!object(run))return false;
 let changed=false;
 if(Object.hasOwn(run,'audioPresentation')){
  const normalized=normalizeAudioMetadata(run.audioPresentation);
  if(JSON.stringify(run.audioPresentation)!==JSON.stringify(normalized)){run.audioPresentation=normalized;changed=true;}
 }
 // The engine's checkpoint owns an independent whole-run snapshot.
 if(object(run.checkpoint)&&run.checkpoint!==run&&Object.hasOwn(run.checkpoint,'audioPresentation')){
  const normalized=normalizeAudioMetadata(run.checkpoint.audioPresentation);
  if(JSON.stringify(run.checkpoint.audioPresentation)!==JSON.stringify(normalized)){run.checkpoint.audioPresentation=normalized;changed=true;}
 }
 return changed;
}
function observe(run,{surface,visible=true}={}){
 if(!object(run))return {changed:false,encounter:null};
 let changed=normalizeRunAudio(run),speaker,key;
 if(!visible)return {changed,encounter:null};
 if(surface==='artifact'){
  const offer=run.artifactState?.offer;
  if(!offer||offer.ready===false||!Array.isArray(offer.ids)||!offer.ids.length||typeof offer.source!=='string'||!offer.source)return {changed,encounter:null};
  speaker='dungeonMaster';key='artifact:'+offer.source;
 }else if(surface==='shop'&&run.scene==='shop'){
  const node=run.route?.active??run.depth;
  if((typeof node!=='string'&&typeof node!=='number')||node===null||node===undefined)return {changed,encounter:null};
  speaker='merchant';key='shop:'+(run.stage===1?1:0)+':'+node;
 }else return {changed,encounter:null};
 if(key.length>240||/[\x00-\x1f\x7f]/.test(key))return {changed,encounter:null};
 if(!Object.hasOwn(run,'audioPresentation')){run.audioPresentation=empty();changed=true;}
 const state=run.audioPresentation;
 if(!Object.hasOwn(state.encounters,key)){
  // Saturation cannot occur in the two-stage route. Keep duplicate protection
  // for imported oversized ledgers instead of pruning/recounting old visits.
  if(Object.keys(state.encounters).length>=MAX_RECORDS)return {changed,encounter:null};
  const visit=Math.min(Number.MAX_SAFE_INTEGER,state.visits[speaker]+1);
  state.visits[speaker]=visit;state.encounters[key]={speaker,visitNumber:visit,voiceId:selectedVoice(speaker,visit)};changed=true;
 }
 return {changed,encounter:Object.freeze({key,...state.encounters[key]})};
}
const api={observe,normalizeAudioMetadata,normalizeRunAudio};
if(typeof module!=='undefined')module.exports=api;else root.DCAudioPresentation=api;
})(typeof window!=='undefined'?window:globalThis);
