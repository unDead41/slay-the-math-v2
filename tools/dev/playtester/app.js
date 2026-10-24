(function(){'use strict';
 const $=id=>document.getElementById(id);let selectedId=new URL(location.href).searchParams.get('job'),job=null,history=[],timer=null,loaded=false,submitting=false,refreshing=false,selectionVersion=0,stateGeneration=0;
 const names=new Map();
 async function request(url,options){const r=await fetch('/__dev/ai/'+url,options),data=await r.json();if(!r.ok)throw Error(data.error||'Request failed.');return data;}
 const post=data=>({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 const running=()=>history.some(j=>j.status==='running');
 function message(text,error=false){$('status').textContent=text;$('status').dataset.error=String(error);}
 function setup(){return {mode:$('mode').value,difficulty:$('difficulty').value,skill:$('skill').value,predict:$('predict').value,route:$('route').value,seed:Number($('seed').value),seeds:Number($('seeds').value),enemy:$('enemy').value,cards:[$('cardA').value,...($('cardB').value?[$('cardB').value]:[])],upgraded:$('upgraded').checked};}
 function count(){
  const cards=$('mode').value==='cards';$('cardFields').hidden=!cards;$('routeField').hidden=cards;$('difficulty').querySelector('[value=all]').disabled=cards;if(cards&&$('difficulty').value==='all')$('difficulty').value='medium';
  const o=setup(),n=o.seeds*(o.skill==='all'?3:1)*(o.difficulty==='all'?3:1)*(cards?1<<o.cards.length:1);$('caseCount').textContent=n+' planned '+(cards?'encounters':'campaign attempts')+'. Large campaigns may take several minutes.';
 }
 function cells(table,rows){$(table).querySelector('tbody').replaceChildren(...rows.map(values=>{const tr=document.createElement('tr');for(const value of values){const td=document.createElement('td');td.textContent=String(value);tr.append(td);}return tr;}));}
 function remember(id){selectedId=id;const u=new URL(location.href);if(id)u.searchParams.set('job',id);else u.searchParams.delete('job');window.history.replaceState(null,'',u);}
 function render(next){
  const changed=next?.id!==job?.id;if(changed){selectionVersion++;$('trace').textContent='Loading selected report…';$('source').textContent='';}
  if(next&&changed){const o=next.options;for(const id of ['mode','difficulty','skill','predict','route','seed','seeds','enemy'])$(id).value=o[id];$('cardA').value=o.cards[0];$('cardB').value=o.cards[1]||'';$('upgraded').checked=o.upgraded;count();}
  job=next;$('start').disabled=!loaded||submitting||running();$('cancel').disabled=job?.status!=='running';$('json').disabled=$('csv').disabled=!job;
  if(!job)return;
  const s=job.summary;$('progress').max=job.progress.total||1;$('progress').value=job.progress.completed;$('progressText').textContent=job.progress.completed+' / '+job.progress.total+' completed · '+job.status;
  $('actualConfig').textContent='Selected report: '+job.options.mode+' · '+job.options.difficulty+' · '+job.options.skill+' · Predict '+job.options.predict+' · seeds '+job.options.seed+'–'+(job.options.seed+job.options.seeds-1);
  message(job.status==='running'?'Playtest running. Cancel retains completed cases.':job.status==='completed'?'Finished. Review invalid/censored counts and sample size.':job.status==='cancelled'?'Cancelled. Completed cases remain available.':job.error||'Worker failed.',job.status==='failed');
  $('totals').replaceChildren(...[['Wins',s.wins],['Losses',s.losses],['Censored',s.censored],['Invalid',s.invalid]].map(([label,value])=>{const div=document.createElement('div'),strong=document.createElement('strong');div.className='metric';strong.textContent=value;div.append(strong,document.createTextNode(label));return div;}));
  cells('groups',s.groups.map(g=>[g.key,g.wins,g.losses,g.censored,g.invalid,g.terminalWinRate===null?'Unmeasured':(100*g.terminalWinRate).toFixed(1)+'%']));
  const number=n=>n===null||n===undefined?'Unmeasured':n.toFixed(2);$('powerSection').hidden=job.options.mode!=='cards';
  cells('power',s.power.map(p=>[p.difficulty+'/'+p.skill,p.seedsComplete+'/'+p.seedsExpected,number(p.individualDeltas[0]?.delta),number(p.individualDeltas[1]?.delta),number(p.totalDelta),number(p.interaction),p.status]));
  cells('usage',s.cardUsage.slice(0,20).map(c=>[c.policy,names.get(c.cardId)||c.cardId,c.plays,c.energySpent,c.focusSpent,c.hpDamage]));
  const unit=n=>n===undefined||n===null?'Unmeasured':n,cardName=c=>names.get(c.cardId)||(c.cardId==='__other__'?'Other / starting / artifact sources':c.cardId),cards=s.cardUsage.slice(0,20);
  cells('support',cards.map(c=>[c.policy,cardName(c),unit(c.blockGranted),unit(c.blockUsed),unit(c.blockExpired),unit(c.blockUnused),unit(c.blockRemaining),unit(c.weakPrevented),unit(c.defensePrevented),unit(c.blockRetained)]));
  cells('utilities',cards.map(c=>[c.policy,cardName(c),unit(c.cardsDrawn),c.strengthGranted===undefined?'Unmeasured':[c.strengthGranted,c.agilityGranted,c.defenseGranted].join(' / '),unit(c.buffedHits),unit(c.statusesApplied),unit(c.statusesConsumed),unit(c.passiveTriggers),unit(c.passiveDamage),unit(c.retaliationDamage),unit(c.focusGained)]));
  cells('efficiency',cards.map(c=>[c.policy,cardName(c),number(c.efficiency?.directDamagePerEnergy),number(c.efficiency?.blockUsedPerEnergy),number(c.efficiency?.mitigationPerEnergy),number(c.efficiency?.cardsDrawnPerEnergy)]));
 }
 function renderHistory(){
  $('history').replaceChildren(...history.map(j=>{const o=document.createElement('option');o.value=j.id;o.textContent=new Date(j.startedAt).toLocaleString()+' · '+j.options.mode+' / '+j.options.difficulty+' / '+j.options.skill+' · '+j.status;return o;}));
  if(!history.length){const o=document.createElement('option');o.value='';o.textContent='No playtests yet';$('history').append(o);}
  if(!history.some(j=>j.id===selectedId))remember(history[0]?.id||null);$('history').value=selectedId||'';
 }
 async function detail(){
  if(!job)return;const id=job.id,version=selectionVersion,report=await request('jobs/'+id+'/report');if(job?.id!==id||version!==selectionVersion)return;
  const last=report.rows.at(-1);$('trace').textContent=last?JSON.stringify({seed:last.seed,difficulty:last.difficulty,skill:last.skill,searchNodes:last.ai?.searchNodes,maxHorizonTurns:last.ai?.maxHorizonTurns,sampledReveals:last.ai?.sampledReveals,truncatedRollouts:last.ai?.truncatedRollouts,decisions:last.ai?.trace,visibleChoices:last.ai?.choiceDecisions},null,2):'No completed cases yet.';
  $('deckTrace').textContent=last?.ai?.deckDecisions?.length?JSON.stringify(last.ai.deckDecisions,null,2):'Deck decisions are recorded during full campaigns.';
  $('source').textContent=report.sourceHash?'Source SHA256: '+report.sourceHash:'Source snapshot pending; an early cancellation may have no source hash.';
 }
 async function refresh(){
  if(refreshing)return;refreshing=true;clearTimeout(timer);
  const generation=stateGeneration;
  try{const state=await request('jobs');if(generation!==stateGeneration)return;history=state.history;renderHistory();render(history.find(j=>j.id===selectedId)||null);await detail();}catch(e){message(e.message,true);}finally{refreshing=false;if(running())timer=setTimeout(refresh,750);}
 }
 $('setup').addEventListener('submit',async event=>{
  event.preventDefault();if(submitting||running())return;submitting=true;$('start').disabled=true;message('Starting local worker…');
  try{const next=await request('jobs',post(setup()));stateGeneration++;remember(next.id);history.unshift(next);renderHistory();render(next);await refresh();}catch(e){message(e.message,true);}finally{submitting=false;$('start').disabled=!loaded||running();}
 });
 $('history').addEventListener('change',()=>{remember($('history').value);render(history.find(j=>j.id===selectedId)||null);detail().catch(e=>message(e.message,true));});
 $('cancel').addEventListener('click',async()=>{if(job?.status!=='running')return;const id=job.id;$('cancel').disabled=true;try{const next=await request('jobs/'+id+'/cancel',post({}));stateGeneration++;history=history.map(j=>j.id===id?next:j);if(selectedId===id)render(next);await refresh();}catch(e){message(e.message,true);}});
 $('refresh').addEventListener('click',refresh);
 async function download(kind){if(!job)return;const id=job.id;try{const r=await fetch('/__dev/ai/jobs/'+id+'/'+(kind==='json'?'report':'csv'));if(!r.ok)throw Error('Report download failed.');const url=URL.createObjectURL(await r.blob()),a=document.createElement('a');a.href=url;a.download='stm-ai-'+id+'.'+kind;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){message(e.message,true);}}
 $('json').addEventListener('click',()=>download('json'));$('csv').addEventListener('click',()=>download('csv'));$('setup').addEventListener('change',count);$('setup').addEventListener('input',count);
 (async()=>{try{const c=await request('catalog');for(const card of c.cards)names.set(card.id,card.name);for(const id of ['cardA','cardB','enemy'])for(const item of id==='enemy'?c.enemies:c.cards){const o=document.createElement('option');o.value=item.id;o.textContent=item.name+' · '+item.id;$(id).append(o);}$('cardA').value='stm.attack.rune_sweep';$('enemy').value='wisp';$('build').textContent='Game '+c.version+' · AI Playtester';loaded=true;count();message('Ready. Choose an experiment.');await refresh();$('start').disabled=running();}catch(e){message(e.message,true);}})();
 window.addEventListener('pagehide',()=>clearTimeout(timer));
})();
