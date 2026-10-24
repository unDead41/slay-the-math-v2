/* Fixed-fixture text coverage; no player storage or external network. */
const fs=require('node:fs'),path=require('node:path');const {JSDOM,VirtualConsole}=require(process.env.DOM_QA_MODULE||'jsdom');
const repo=path.resolve(__dirname,'..'),E=require(repo+'/dist/engine.js'),{shopRoom}=require(repo+'/tests/helpers/shop.cjs'),{mysteryRoom}=require(repo+'/tests/helpers/mystery.cjs');
const html=fs.readFileSync(repo+'/dist/index.html','utf8'),files=[...html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g)].map(x=>x[1]),found=new Map(),errors=[];
(async()=>{
function boot(saved,difficulty){const vc=new VirtualConsole(),dom=new JSDOM(html,{url:'https://game.example/'+(difficulty?'?balance='+difficulty:''),runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};w.HTMLAnchorElement.prototype.click=function(){};w.HTMLElement.prototype.scrollIntoView=function(){};w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));w.localStorage.setItem('slay-the-math.question-language.v1',process.env.LANG_AUDIT||'ms');if(saved)w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(saved));w.addEventListener('error',e=>errors.push(e.message));for(const f of files)w.eval(fs.readFileSync(repo+'/dist/'+f,'utf8'));return {dom,w,d:w.document,click:(action,extra='')=>{const b=w.document.querySelector('[data-action="'+action+'"]'+extra);if(!b||b.disabled)return false;b.click();return true}};}
async function capture(s,name){await Promise.resolve();await Promise.resolve();const {d}=s,walker=d.createTreeWalker(d.body,4);let n;const add=t=>{t=t.trim();if(!/[A-Za-z]{2,}/.test(t))return;const old=found.get(t)||new Set();old.add(name);found.set(t,old);};while(n=walker.nextNode())if(!n.parentElement?.closest('script,style,math,svg,textarea'))add(n.data);for(const el of d.querySelectorAll('[aria-label],[title],[placeholder],[alt]'))for(const attr of ['aria-label','title','placeholder','alt'])if(el.hasAttribute(attr))add(el.getAttribute(attr));}
for(const action of [null,'saves','music','library','analytics','new','help']){const s=boot();try{if(action)s.click(action);await capture(s,'home-'+(action||'menu'));}catch(e){errors.push(String(e))}finally{s.dom.window.close()}}
function legacy(scene){const r=E.newRun(21,'learn');delete r.route;if(['battle','reward','stageclear','defeat','victory'].includes(scene))E.startBattle(r,scene==='victory'?'dealer':'wisp');r.scene=scene;if(scene==='camp')r.depth=2;if(scene==='event')r.depth=3;if(scene==='stageclear')r.depth=4;if(scene==='defeat')r.hp=0;if(scene==='victory'){r.stage=1;r.depth=4;r.battle.hp=0;r.battle.seals=2;}if(scene==='reward')r.rewards=['blast','fort','balance'];return r;}
for(const scene of ['map','battle','reward','camp','event','stageclear','defeat','victory']){const s=boot(legacy(scene));try{s.click('continue');await capture(s,scene);if(scene==='battle')for(const action of ['deck','statuses','history','forecast']){s.click(action);await capture(s,'battle-'+action);s.click('close')}}catch(e){errors.push(scene+' '+e)}finally{s.dom.window.close()}}
{const s=boot(shopRoom());try{s.click('continue');for(const id of ['cards','artifacts','remove']){s.click('shop-tab','[data-id="'+id+'"]');await capture(s,'shop-'+id);}}finally{s.dom.window.close()}}
for(let i=1;i<=15;i++){try{const s=boot(mysteryRoom('ME'+String(i).padStart(2,'0')));try{s.click('continue');await capture(s,'mystery-'+i);}finally{s.dom.window.close()}}catch(e){errors.push('mystery-'+i+' '+e.message)}}
{const s=boot(E.newRun(21,'challenge'));try{s.click('continue');await capture(s,'artifact-choice');s.click('artifacts');await capture(s,'artifact-inventory');}finally{s.dom.window.close()}}

// Current card details and all shared status explanations.
{const s=boot();try{s.click('library');for(const card of s.w.STMCardData.cards){const input=s.d.querySelector('#card-search');input.value=s.w.STMCardKit.cardName(card,s.w.DCQuestionLanguage.language());input.dispatchEvent(new s.w.Event('input',{bubbles:true}));await capture(s,'card-'+card.id);}}finally{s.dom.window.close()}}
{const s=boot(require(repo+'/tests/helpers/icon-status.cjs')());try{s.click('continue');s.click('statuses');await capture(s,'status-all');for(const id of ['strength','agility','defense','block','weak','vulnerable','thorns','next-draw','next-block','retain-block']){s.click('status-details','[data-id="'+id+'"]');await capture(s,'status-'+id);s.click('statuses');}}finally{s.dom.window.close()}}
{const s=boot();try{s.click('help');for(const ch of s.w.DCTutorialData.chapters){s.d.querySelector('[data-tutorial-action="chapter"][data-value="'+ch.id+'"]').click();await capture(s,'tutorial-'+ch.id);}}finally{s.dom.window.close()}}
for(let i=1;i<=15;i++)for(const phase of ['question','success','failure','reward']){
 let s;try{const r=mysteryRoom('ME'+String(i).padStart(2,'0'),'challenge');E.startMystery(r);const q=require(repo+'/dist/education.js').catalog[r.mysteryState.pending.questionId];
 if(phase==='failure'){for(const c of q.choices.filter(c=>c.id!==q.correctChoiceId).slice(0,2))E.answerMystery(r,c.id);}
 else if(phase!=='question')E.answerMystery(r,q.correctChoiceId);
 if(phase==='reward')E.continueMystery(r);
 s=boot(r);s.click('continue');await capture(s,'mystery-'+i+'-'+phase);
 if(phase==='reward'&&r.mysteryState?.pending?.phase==='reward')for(const o of require(repo+'/dist/mystery.js').definition(r).success.options){s.click('mystery-option','[data-id="'+o.id+'"]');await capture(s,'mystery-'+i+'-option-'+o.id);}
 }catch(e){errors.push('matrix mystery '+i+' '+phase+': '+e.message)}finally{s?.dom.window.close()}
}


{const s=boot();try{s.click('library');for(const a of s.w.DCArtifactData.artifacts)s.w.STMMechanicsHost.tracker.discover(a.id,'Stage 1');s.click('collection-tab','[data-kind="artifacts"]');for(const a of s.w.DCArtifactData.artifacts){const el=s.d.querySelector('[data-artifact-id="'+a.id+'"]')||s.d.querySelector('[data-codex-id="'+a.id+'"]');if(el)el.click();await capture(s,'codex-'+a.id);}}finally{s.dom.window.close()}}


for(const stage of [0,1])for(const turn of [1,2,3]){
 const helper=require(repo+'/tests/helpers/legacy-run.cjs'),r=helper.newRun(21,'learn');delete r.route;r.stage=stage;E.startBattle(r,stage?'shade':'wisp');r.battle.turn=turn;helper.legacyForecast(r);E.hint(r);
 let s=boot(r);try{if(!s.click('continue')||!s.click('forecast'))throw Error('Legacy fixture is unavailable');await capture(s,'legacy-predict-'+r.battle.question.kind);}finally{s.dom.window.close()}
}


for(const c of require(repo+'/dist/card-data.js').cards.filter(c=>c.category==='passive')){
 const r=require(repo+'/tools/dev/fixtures.js').cardSetup(c.id);E.playCard(r,r.battle.hand[0].uid);const s=boot(r);try{if(!s.click('continue')||!s.click('passive-details','[data-id="'+c.id+'"]'))throw Error('Passive fixture is unavailable');await capture(s,'passive-'+c.id);}finally{s.dom.window.close()}
}


for(const difficulty of ['easy','medium','hard']){const s=boot(null,difficulty);try{await capture(s,'profile-'+difficulty+'-menu');s.click('new');await capture(s,'profile-'+difficulty+'-mode');s.click('start-challenge');await capture(s,'profile-'+difficulty+'-artifact');}finally{s.dom.window.close()}}

const list=[...found].map(([text,states])=>({text,states:[...states]}));const states=[...new Set(list.flatMap(x=>x.states))],language=process.env.LANG_AUDIT||'ms';const output=path.resolve(process.argv[2]||path.join(repo,'docs/audits/dual-language-bm-bi'));fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'ui-matrix-'+language+'.json'),JSON.stringify({language,states,strings:list,errors},null,2)+'\n');console.log(JSON.stringify({language,states:states.length,strings:list.length,errors}));if(errors.length)process.exitCode=1;

})().catch(e=>{console.error(e);process.exitCode=1});
