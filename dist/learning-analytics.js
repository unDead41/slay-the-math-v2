/* Observes the existing learning owner. This module never reserves questions,
 * changes owner events, consumes gameplay RNG or writes run/Practice saves.
 */
(function(root){
 'use strict';
 const common=typeof module!=='undefined'&&module.exports;
 const mechanics=common?require('./mechanics.js'):root.STMMechanics;
 const defaultBank=common?require('./question-data.js'):root.DCQuestionBank;
 const defaultCurriculum=common?require('./learning-curriculum.js'):root.DCLearningCurriculum;
 const STORAGE_KEY='slay-the-math.learning-analytics.v1',MAX_RECORDS=5000,MINIMUM_EVIDENCE=3;
 const RECORD_PREFIX=STORAGE_KEY+'.record.',ALIAS_PREFIX=STORAGE_KEY+'.alias.';
 const scopes=new Set(['gameplay','practice','review']);
 const copy=value=>JSON.parse(JSON.stringify(value));
 const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
 const text=value=>typeof value==='string'&&value.length>0&&value.length<=200;
 const timestamp=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
 const identity=row=>JSON.stringify([row.scope,row.sessionId,row.questionId]);
 function stable(value){if(Array.isArray(value))return '['+value.map(stable).join(',')+']';if(object(value))return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';return JSON.stringify(value);}
 const equal=(a,b)=>stable(a)===stable(b);
 // Synchronous SHA-256 keeps occurrence identities identical in browser tabs
 // and Node without consuming randomness or changing the synchronous API.
 const shaConstants=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 function sha256(value){
  const bytes=[];
  for(const char of value){const cp=char.codePointAt(0);if(cp<128)bytes.push(cp);else if(cp<2048)bytes.push(192|(cp>>>6),128|(cp&63));else if(cp<65536)bytes.push(224|(cp>>>12),128|((cp>>>6)&63),128|(cp&63));else bytes.push(240|(cp>>>18),128|((cp>>>12)&63),128|((cp>>>6)&63),128|(cp&63));}
  const bits=bytes.length*8,high=Math.floor(bits/0x100000000),low=bits>>>0;bytes.push(128);while(bytes.length%64!==56)bytes.push(0);
  for(let n=24;n>=0;n-=8)bytes.push((high>>>n)&255);for(let n=24;n>=0;n-=8)bytes.push((low>>>n)&255);
  const hash=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],words=new Uint32Array(64),rotate=(n,b)=>(n>>>b)|(n<<(32-b));
  for(let offset=0;offset<bytes.length;offset+=64){
   for(let i=0;i<16;i++){const at=offset+i*4;words[i]=(bytes[at]<<24)|(bytes[at+1]<<16)|(bytes[at+2]<<8)|bytes[at+3];}
   for(let i=16;i<64;i++){const a=words[i-15],b=words[i-2],s0=rotate(a,7)^rotate(a,18)^(a>>>3),s1=rotate(b,17)^rotate(b,19)^(b>>>10);words[i]=(words[i-16]+s0+words[i-7]+s1)>>>0;}
   let [a,b,c,d,e,f,g,h]=hash;
   for(let i=0;i<64;i++){const s1=rotate(e,6)^rotate(e,11)^rotate(e,25),choose=(e&f)^(~e&g),t1=(h+s1+choose+shaConstants[i]+words[i])>>>0,s0=rotate(a,2)^rotate(a,13)^rotate(a,22),majority=(a&b)^(a&c)^(b&c),t2=(s0+majority)>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}
   for(const [i,n] of [a,b,c,d,e,f,g,h].entries())hash[i]=(hash[i]+n)>>>0;
  }
  return hash.map(n=>n.toString(16).padStart(8,'0')).join('');
 }
 const occurrenceId=key=>'learning:'+sha256(key);
 const recordJournalKey=row=>RECORD_PREFIX+sha256(identity(row))+'.'+sha256(stable(row));
 const aliasJournalKey=entry=>ALIAS_PREFIX+sha256(aliasKey(entry.scope,entry.sessionId))+'.'+sha256(stable(entry));
 const readError='Saved learning records could not be read and have been kept. Export new records before leaving this page.';
 const saveError='Learning records could not be saved on this device. Export your records before leaving this page.';
 const limitError='The 5,000 learning record storage limit has been reached. Export records; new observations remain in this page.';
 const aliasLimitError='The 5,000 learning session link storage limit has been reached. Export records; new links remain in this page.';
 const aliasKey=(scope,id)=>JSON.stringify([scope,id]);
 const stepsOpened=record=>record.events.some(event=>event.type==='STEPS_TOGGLED');
 function resolveAlias(aliases,scope,id){
  const visited=new Set();
  while(aliases.has(aliasKey(scope,id))){if(visited.has(id))throw Error('Cyclic learning session links');visited.add(id);id=aliases.get(aliasKey(scope,id));}
  return id;
 }
 function aliasData(aliases){
  const grouped=new Map();
  for(const [key,target] of aliases){const [scope,id]=JSON.parse(key);if(!grouped.has(scope))grouped.set(scope,[]);grouped.get(scope).push([id,target]);}
  return Object.fromEntries([...grouped].map(([scope,entries])=>[scope,Object.fromEntries(entries)]));
 }
 function parseAliases(value){
  const aliases=new Map();if(value===undefined)return aliases;
  if(!object(value))throw Error('Invalid learning session links');
  for(const [scope,entries] of Object.entries(value)){
   if(!scopes.has(scope)||!object(entries))throw Error('Invalid learning session links');
   for(const [id,target] of Object.entries(entries)){if(!text(id)||!text(target))throw Error('Invalid learning session link');aliases.set(aliasKey(scope,id),target);if(aliases.size>MAX_RECORDS)throw Error('Too many learning session links');}
  }
  for(const [key] of aliases){const [scope,id]=JSON.parse(key);aliases.set(key,resolveAlias(aliases,scope,id));}
  return aliases;
 }
 function mergeAliases(...maps){
  const result=new Map();
  for(const map of maps)for(const [key,target] of map)if(!result.has(key)){
   result.set(key,target);const [scope,id]=JSON.parse(key);
   // A previously linked identity never changes its established destination.
   // Conflicting old-tab links must not form a cycle with newer saved links.
   try{result.set(key,resolveAlias(result,scope,id));}catch{result.delete(key);}
  }
  return result;
 }
 function secureId(){
  const crypto=common?require('node:crypto'):root.crypto;
  if(typeof crypto?.randomUUID==='function')return crypto.randomUUID();
  if(typeof crypto?.getRandomValues==='function'){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const s=[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');return s.slice(0,8)+'-'+s.slice(8,12)+'-'+s.slice(12,16)+'-'+s.slice(16,20)+'-'+s.slice(20);}
  throw Error('Secure identifiers are unavailable.');
 }
 function metadata(question){return {questionId:question.id,topicCode:question.topicCode,chapter:question.chapter,curriculumStandards:[...(question.curriculumStandards||[])],skillIds:[...(question.learning?.skillIds||[])],foundationId:question.learning?.foundationId||null};}
 function canonicalOwner(row,question,bank){
  if(!object(row)||!question||row.questionId!==question.id||!Array.isArray(row.events)||row.events.length>10000||!Array.isArray(row.choiceOrder)||!equal(row.choiceOrder,question.choices.map(c=>c.id))||row.sourceSeed!==question.seed)return null;
  try{
   // Replaying one row uses no sampling and preserves support/attempt order.
   const session=mechanics.session.restoreSession({version:1,bankVersion:bank.bankVersion||bank.version,rngState:1,runIndex:1,exposureIds:[question.id],records:{[question.id]:row},archivedRecords:{},pendingQuestionId:null,lastQuestionId:question.id},bank);
   const canonical=session.records[question.id];return canonical&&equal(canonical,row)?copy(canonical):null;
  }catch{return null;}
 }
 function validateRecord(value,{bank=defaultBank}={}){
  if(!object(value)||!bank?.questions)return false;
  const fields=['id','schemaVersion','sourceSchemaVersion','bankVersion','questionId','topicCode','chapter','curriculumStandards','skillIds','foundationId','scope','sessionId','source','language','firstCapturedAt','updatedAt','record'];
  if(Object.keys(value).length!==fields.length||Object.keys(value).some(k=>!fields.includes(k))||!text(value.id)||!/^[\w.:-]+$/.test(value.id)||value.schemaVersion!==1||value.sourceSchemaVersion!==1||!scopes.has(value.scope)||!text(value.sessionId)||!text(value.source)||!['en','ms'].includes(value.language)||!timestamp(value.firstCapturedAt)||!timestamp(value.updatedAt)||Date.parse(value.updatedAt)<Date.parse(value.firstCapturedAt))return false;
  const versions=new Set([bank.bankVersion||bank.version,'form4-review-1.0.0','form4-review-1.4.0','form4-review-1.5.0']);
  const question=bank.questions.find(q=>q.id===value.questionId);
  return versions.has(value.bankVersion)&&!!question&&equal(metadata(question),Object.fromEntries(Object.keys(metadata(question)).map(k=>[k,value[k]])))&&!!canonicalOwner(value.record,question,bank);
 }
 function extendsEvents(longer,shorter){return longer.length>=shorter.length&&shorter.every((event,i)=>equal(event,longer[i]));}
 function prefer(a,b){
  if(!a)return b;if(!b)return a;
  const ae=a.record.events,be=b.record.events;
  const firstCapturedAt=Date.parse(a.firstCapturedAt)<=Date.parse(b.firstCapturedAt)?a.firstCapturedAt:b.firstCapturedAt;
  const origin=row=>({...row,id:a.id,firstCapturedAt});
  if(extendsEvents(ae,be)&&ae.length>be.length)return origin(a);
  if(extendsEvents(be,ae)&&be.length>ae.length)return origin(b);
  if(equal(a.record,b.record))return origin(a);
  // Divergent owner streams cannot be concatenated into an invented history.
  // Keep the most recently captured complete owner snapshot deterministically.
  const newer=Date.parse(b.updatedAt)>Date.parse(a.updatedAt)||(b.updatedAt===a.updatedAt&&stable(b.record)>stable(a.record));
  return origin(newer?b:a);
 }
 function createStore({storage,bank=defaultBank,curriculum=defaultCurriculum,now=()=>new Date().toISOString(),idFactory=secureId}={}){
  if(!bank?.questions)throw Error('The canonical question bank is required.');
  const catalog=new Map(bank.questions.map(q=>[q.id,q]));
  const versions=new Set([bank.bankVersion||bank.version,'form4-review-1.0.0','form4-review-1.4.0','form4-review-1.5.0']);
  let memory=new Map(),sessions={},aliases=new Map(),readProblem='',writeProblem='',limitProblem='',cachedRaw,cachedData;
  const dirty=new Map(),dirtySessions=new Map(),dirtyAliases=new Map(),journalCache=new Map();
  function parse(raw){
   if(raw===null||raw===undefined)return {records:new Map(),sessions:{},aliases:new Map()};
   const data=JSON.parse(raw);
   if(!object(data)||data.schemaVersion!==1||!Array.isArray(data.records)||data.records.length>MAX_RECORDS||!object(data.sessions))throw Error('Invalid learning storage');
   const records=new Map(),ids=new Set();
   for(const row of data.records){if(!validateRecord(row,{bank})||records.has(identity(row))||ids.has(row.id))throw Error('Invalid learning occurrence');records.set(identity(row),row);ids.add(row.id);}
   for(const [scope,id] of Object.entries(data.sessions))if(!scopes.has(scope)||!text(id))throw Error('Invalid learning session identity');
   return {records,sessions:{...data.sessions},aliases:parseAliases(data.sessionAliases)};
  }
  function refresh(){
   let raw;
   try{if(!storage)throw Error('Storage unavailable');raw=storage.getItem(STORAGE_KEY);}catch{readProblem=saveError;return false;}
   let latest,projectionProblem=false;
   try{latest=raw===cachedRaw&&cachedData?cachedData:parse(raw);cachedRaw=raw;cachedData=latest;}catch{projectionProblem=true;latest={records:new Map(),sessions:{},aliases:new Map()};}
   const journalRecords=new Map(),journalAliases=new Map();let journalProblem=false;
   // localStorage has no read/modify/write transaction. Immutable independent
   // keys retain each committed observation even if an aggregate write races.
   try{
    if(typeof storage.key==='function'&&Number.isSafeInteger(storage.length)){
     const keys=new Set();for(let i=0;i<storage.length;i++){const key=storage.key(i);if(typeof key==='string'&&(key.startsWith(RECORD_PREFIX)||key.startsWith(ALIAS_PREFIX)))keys.add(key);}
     for(const key of [...keys].sort()){
      try{
       const raw=storage.getItem(key);if(raw===null)continue;let entry=journalCache.get(key)?.raw===raw?journalCache.get(key).entry:null;
       if(!entry){entry=JSON.parse(raw);if(key.startsWith(RECORD_PREFIX)){if(!validateRecord(entry,{bank})||recordJournalKey(entry)!==key)throw Error('Invalid learning journal record');}else if(!object(entry)||Object.keys(entry).length!==4||entry.schemaVersion!==1||!scopes.has(entry.scope)||!text(entry.sessionId)||!text(entry.canonicalSessionId)||entry.sessionId===entry.canonicalSessionId||aliasJournalKey(entry)!==key)throw Error('Invalid learning journal link');journalCache.set(key,{raw,entry});}
       if(key.startsWith(RECORD_PREFIX)){const id=identity(entry);journalRecords.set(id,prefer(journalRecords.get(id),entry));}else{const id=aliasKey(entry.scope,entry.sessionId);if(!journalAliases.has(id))journalAliases.set(id,entry.canonicalSessionId);}
      }catch{journalProblem=true;}
     }
     for(const [key] of journalAliases){const [scope,id]=JSON.parse(key);resolveAlias(journalAliases,scope,id);}
    }
   }catch{journalProblem=true;}
   const merged=new Map(latest.records);
   for(const [key,row] of journalRecords)merged.set(key,prefer(merged.get(key),row));
   for(const [key,row] of memory)merged.set(key,prefer(merged.get(key),row));
   for(const [key,row] of dirty)merged.set(key,prefer(merged.get(key),row));
   memory=merged;sessions={...latest.sessions,...Object.fromEntries(dirtySessions)};aliases=mergeAliases(journalAliases,latest.aliases,aliases,dirtyAliases);readProblem=journalProblem||projectionProblem?readError:'';
   limitProblem=memory.size>MAX_RECORDS?limitError:aliases.size>MAX_RECORDS?aliasLimitError:'';return !journalProblem&&!projectionProblem;
  }
  function persist(){
   if(!refresh())return false;
   if(memory.size>MAX_RECORDS){limitProblem=limitError;return false;}
   if(aliases.size>MAX_RECORDS){limitProblem=aliasLimitError;return false;}
   if(!dirty.size&&!dirtySessions.size&&!dirtyAliases.size)return true;
   try{
    for(const row of dirty.values()){const key=recordJournalKey(row),raw=JSON.stringify(row);storage.setItem(key,raw);journalCache.set(key,{raw,entry:row});}
    for(const [key,target] of dirtyAliases){const [scope,sessionId]=JSON.parse(key),entry={schemaVersion:1,scope,sessionId,canonicalSessionId:target},journalKey=aliasJournalKey(entry),raw=JSON.stringify(entry);storage.setItem(journalKey,raw);journalCache.set(journalKey,{raw,entry});}
    if(!refresh())return false;
    if(memory.size>MAX_RECORDS||aliases.size>MAX_RECORDS)return false;
    const projected={records:new Map(memory),sessions:{...sessions},aliases:new Map(aliases)},raw=JSON.stringify({schemaVersion:1,sessions:projected.sessions,...(aliases.size?{sessionAliases:aliasData(projected.aliases)}:{}),records:[...projected.records.values()]});
    storage.setItem(STORAGE_KEY,raw);cachedRaw=raw;cachedData=projected;dirty.clear();dirtySessions.clear();dirtyAliases.clear();writeProblem='';limitProblem='';refresh();return !readProblem;
   }catch{writeProblem=saveError;return false;}
  }
  function newId(){
   const used=new Set([...memory.values()].map(r=>r.id).concat(Object.values(sessions)));
   for(let i=0;i<100;i++){const id=idFactory();if(text(id)&&/^[\w.:-]+$/.test(id)&&!used.has(id))return id;}
   throw Error('A unique learning identifier could not be created.');
  }
  function getSessionId(scope){
   if(!scopes.has(scope))throw Error('Unknown learning scope.');refresh();
   if(!sessions[scope]){sessions[scope]=newId();dirtySessions.set(scope,sessions[scope]);persist();}
   return sessions[scope];
  }
  function startSession(scope){
   if(!scopes.has(scope))throw Error('Unknown learning scope.');refresh();sessions[scope]=newId();dirtySessions.set(scope,sessions[scope]);persist();return sessions[scope];
  }
  function linkSession(scope,newSessionId,previousSessionId){
   if(!scopes.has(scope))throw Error('Unknown learning scope.');
   if(!text(newSessionId)||!text(previousSessionId))throw Error('Valid learning session identities are required.');
   refresh();const canonical=resolveAlias(aliases,scope,previousSessionId),existing=resolveAlias(aliases,scope,newSessionId);
   if(newSessionId===canonical)return canonical;
   if(existing!==newSessionId)return existing;
   const key=aliasKey(scope,newSessionId);aliases.set(key,canonical);dirtyAliases.set(key,canonical);persist();return canonical;
  }
  function capture(session,{scope='gameplay',sessionId,source=scope,questionIds,language='en'}={}){
   const result={changed:false,changedRecords:[]};
   if(!object(session)||session.version!==1||!object(session.records)||!scopes.has(scope)||!text(source)||!['en','ms'].includes(language))return result;
   const bankVersion=session.bankVersion||bank.bankVersion||bank.version;if(!versions.has(bankVersion))return result;
   const filter=questionIds===undefined?null:new Set(Array.isArray(questionIds)?questionIds:[]);
   const candidates=[];
   for(const [id,row] of Object.entries(session.records)){if(filter&&!filter.has(id))continue;const q=catalog.get(id),record=canonicalOwner(row,q,bank);if(record)candidates.push({q,record});}
   if(!candidates.length)return result;
   refresh();sessionId=sessionId??getSessionId(scope);if(!text(sessionId))return result;sessionId=resolveAlias(aliases,scope,sessionId);
   for(const {q,record} of candidates){
    const key=identity({scope,sessionId,questionId:q.id}),previous=memory.get(key);
    if(previous&&(equal(previous.record,record)||extendsEvents(previous.record.events,record.events)))continue;
    const observed=now();if(!timestamp(observed))throw Error('A valid capture time is required.');
    const row={id:previous?.id||occurrenceId(key),schemaVersion:1,sourceSchemaVersion:session.version,bankVersion:previous?.bankVersion||bankVersion,...metadata(q),scope,sessionId,source,language,firstCapturedAt:previous?.firstCapturedAt||observed,updatedAt:previous&&Date.parse(previous.updatedAt)>Date.parse(observed)?previous.updatedAt:observed,record};
    memory.set(key,row);dirty.set(key,row);result.changedRecords.push(copy(row));
   }
   if(result.changedRecords.length){result.changed=true;persist();result.changedRecords=result.changedRecords.map(row=>copy(memory.get(identity(row))||row));}
   return result;
  }
  function records(){refresh();return [...memory.values()].sort((a,b)=>a.firstCapturedAt.localeCompare(b.firstCapturedAt)||a.id.localeCompare(b.id)).map(copy);}
  function aggregate(rows){
   const answered=rows.filter(r=>r.record.attempts.length),distinctAnswered=new Set(answered.map(r=>r.questionId)).size;
   const count=fn=>rows.filter(fn).length;
   const firstAttemptCorrect=answered.filter(r=>r.record.attempts[0].correct).length;
   const independentFirstTry=answered.filter(r=>{const a=r.record.attempts[0];return a.correct&&!a.hintUsed&&!a.moreHintViewed&&!a.foundationViewed;}).length;
   return {occurrences:rows.length,answered:answered.length,distinctAnswered,attempts:rows.reduce((n,r)=>n+r.record.attempts.length,0),wrongAttempts:rows.reduce((n,r)=>n+r.record.attempts.filter(a=>!a.correct).length,0),correct:count(r=>r.record.status==='correct'),firstAttemptCorrect,independentFirstTry,correctWithSupport:count(r=>r.record.completion?.category==='supported'),correctAfterRetry:count(r=>r.record.status==='correct'&&r.record.attempts.slice(0,-1).some(a=>!a.correct)),revealed:count(r=>r.record.status==='revealed'),revealOnly:count(r=>r.record.status==='revealed'&&!r.record.attempts.length),pending:count(r=>r.record.status==='pending'),openedOnly:count(r=>r.record.status==='pending'&&!r.record.attempts.length),hintUsed:count(r=>r.record.hintState.hintUsed),moreHintViewed:count(r=>r.record.hintState.moreHintViewed),foundationViewed:count(r=>r.record.foundationViewed),stepsViewed:count(r=>stepsOpened(r.record)),supportedAttempts:rows.reduce((n,r)=>n+r.record.attempts.filter(a=>a.hintUsed||a.moreHintViewed||a.foundationViewed).length,0),firstTryAccuracy:answered.length?firstAttemptCorrect/answered.length:null,independentFirstTryAccuracy:answered.length?independentFirstTry/answered.length:null,status:!answered.length?'not-assessed':distinctAnswered<MINIMUM_EVIDENCE?'not-enough-evidence':'practice-progress'};
  }
  function report({scope='all',language='en'}={}){
   if(scope!=='all'&&!scopes.has(scope))throw Error('Unknown learning scope.');language=language==='ms'?'ms':'en';
   const selected=records().filter(r=>scope==='all'?r.scope!=='review':r.scope===scope);
   const matching=questions=>{const ids=new Set(questions.map(q=>q.id));return selected.filter(r=>ids.has(r.questionId));};
   const topics=Object.entries(bank.topics||{}).map(([id,topic])=>({id,topicCode:id,chapter:topic.chapter,label:language==='ms'?topic.malay:topic.name,totalQuestions:bank.questions.filter(q=>q.topicCode===id).length,...aggregate(selected.filter(r=>r.topicCode===id))}));
   const contentStandards=Object.values(curriculum?.contentStandards||{}).map(sk=>{const qs=bank.questions.filter(q=>q.curriculumStandards?.some(id=>id.startsWith(sk.id+'.')));return {id:sk.id,label:sk[language],topicCode:sk.topicCode,chapter:sk.chapter,totalQuestions:qs.length,source:copy(sk.source),...aggregate(matching(qs))};});
   const learningStandards=Object.values(curriculum?.learningStandards||{}).map(sp=>{const qs=bank.questions.filter(q=>q.curriculumStandards?.includes(sp.id));return {id:sp.id,contentStandardId:sp.contentStandardId,label:sp[language],topicCode:sp.topicCode,chapter:sp.chapter,totalQuestions:qs.length,source:copy(sp.source),...aggregate(matching(qs))};});
   const skills=(bank.learningSupport?.features?.skills||[]).map(skill=>{const qs=bank.questions.filter(q=>q.learning?.skillIds?.includes(skill.id));return {id:skill.id,skillId:skill.id,label:skill.label,topicCode:skill.topicCode,foundationId:skill.foundationId,totalQuestions:qs.length,...aggregate(matching(qs))};});
   const sessionGroups=new Map();for(const row of selected){const key=JSON.stringify([row.scope,row.sessionId]);if(!sessionGroups.has(key))sessionGroups.set(key,[]);sessionGroups.get(key).push(row);}
   const sessions=[...sessionGroups.values()].map(rows=>({id:rows[0].scope+':'+rows[0].sessionId,sessionId:rows[0].sessionId,scope:rows[0].scope,firstCapturedAt:rows.map(r=>r.firstCapturedAt).sort()[0],updatedAt:rows.map(r=>r.updatedAt).sort().at(-1),...aggregate(rows)})).sort((a,b)=>a.firstCapturedAt.localeCompare(b.firstCapturedAt)||a.id.localeCompare(b.id));
   // Two observed difficulties across at least three distinct answered items
   // produce practice links, never a mastery level or a weakness diagnosis.
   const recommendations=skills.filter(s=>s.distinctAnswered>=MINIMUM_EVIDENCE&&s.answered-s.independentFirstTry>=2).sort((a,b)=>(b.answered-b.independentFirstTry)/b.answered-(a.answered-a.independentFirstTry)/a.answered||a.id.localeCompare(b.id)).slice(0,3).map(skill=>({skillId:skill.id,label:skill.label,topicCode:skill.topicCode,foundationId:skill.foundationId,questionIds:bank.questions.filter(q=>q.learning?.skillIds?.includes(skill.id)).map(q=>q.id),reason:language==='ms'?'Ulang kaji asas dan cuba soalan serupa.':'Review the Basics and try similar questions.'}));
   const questions=bank.questions.map(q=>({id:q.id,...metadata(q),totalQuestions:1,...aggregate(selected.filter(r=>r.questionId===q.id))}));
   return {schemaVersion:1,bankVersion:bank.bankVersion||bank.version,scope,language,minimumEvidence:MINIMUM_EVIDENCE,totals:{totalQuestions:bank.questions.length,...aggregate(selected)},topics,contentStandards,learningStandards,skills,sessions,recommendations,questions};
  }
  function exportData(){persist();return {schemaVersion:1,game:'Mathematics Slayer',purpose:'Learning observations',bankVersion:bank.bankVersion||bank.version,exportedAt:now(),sessionAliases:aliasData(aliases),records:records()};}
  function csv(){
   const cell=value=>{let valueText=String(value??'');if(/^[\s\uFEFF]*[=+@-]|^[\t\r]/.test(valueText))valueText="'"+valueText;return '"'+valueText.replace(/"/g,'""')+'"';};
   const rows=[['Occurrence ID','Question ID','Bank version','Source schema version','Scope','Session ID','Source','Language','Topic','Chapter','Learning standards','Skills','Basics','First captured at','Updated at','Question state','Attempts','Wrong attempts','First attempt correct','Independent first try','Completion category','Hint opened','More Hint opened','Basics opened','Steps opened']];
   for(const r of exportData().records){const first=r.record.attempts[0];rows.push([r.id,r.questionId,r.bankVersion,r.sourceSchemaVersion,r.scope,r.sessionId,r.source,r.language,r.topicCode,r.chapter,r.curriculumStandards.join('; '),r.skillIds.join('; '),r.foundationId,r.firstCapturedAt,r.updatedAt,r.record.status,r.record.attempts.length,r.record.attempts.filter(a=>!a.correct).length,first?first.correct:'',first?first.correct&&!first.hintUsed&&!first.moreHintViewed&&!first.foundationViewed:'',r.record.completion?.category||'',r.record.hintState.hintUsed,r.record.hintState.moreHintViewed,r.record.foundationViewed,stepsOpened(r.record)]);}
   return '\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
  }
  refresh();return {capture,getSessionId,startSession,linkSession,records,report,exportData,csv,get error(){return readProblem||limitProblem||writeProblem;}};
 }
 const api={STORAGE_KEY,MAX_RECORDS,MINIMUM_EVIDENCE,createStore,validateRecord,fingerprint:sha256};
 if(common)module.exports=api;else root.DCAnalytics=api;
})(typeof globalThis!=='undefined'?globalThis:this);
