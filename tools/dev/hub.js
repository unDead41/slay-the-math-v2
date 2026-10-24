(function(){'use strict';
 const $=id=>document.getElementById(id),frame=$('preview'),logs=[],KEY='slay-the-math.dev-presets.v1';let api=null,catalog=null,lastSetup=null,presets=[],storageOK=true;
 const val=id=>$(id).value,number=id=>Number(val(id));
 function status(message,error=false){$('status').textContent=message;$('status').style.color=error?'#ff9b9b':'';}
 function record(action,details){logs.push({time:new Date().toISOString(),action,details});if(logs.length>80)logs.shift();$('log').textContent=JSON.stringify(logs,null,2);}
 async function safely(action,fn){try{if(!api)throw Error('Game tools are still loading.');const result=await fn();status(action+' complete.');record(action,result);return result;}catch(e){status(e.message,true);record(action,{error:e.message});}}
 function option(select,items,getId,getLabel){const old=select.value;select.replaceChildren(...items.map(x=>{const o=document.createElement('option');o.value=getId(x);o.textContent=getLabel(x);return o;}));if(items.some(x=>getId(x)===old))select.value=old;}
 function fillEnemies(){const q=val('search').toLowerCase();option($('enemy'),Object.entries(catalog.enemies).filter(([id,e])=>(id+' '+e.name).toLowerCase().includes(q)),x=>x[0],([id,e])=>e.name+' · '+id+(e.boss?' · Boss':''));fillIntents();option($('event'),catalog.events.filter(e=>(e.id+' '+e.name).toLowerCase().includes(q)),e=>e.id,e=>e.name+' · '+e.id);}
 function fillIntents(){option($('intent'),[{id:'',label:'Normal behavior'},...(catalog.enemies[val('enemy')]?.patterns||[]).map((p,i)=>({id:String(i),label:p.label}))],x=>x.id,x=>x.label);}
 function fillCards(){const q=val('cardSearch').toLowerCase();option($('card'),catalog.cards.filter(c=>(!val('category')||c.category===val('category'))&&(c.id+' '+c.name).toLowerCase().includes(q)),c=>c.id,c=>c.name+' · '+c.id);cardStates();}
 function cardStates(){const card=catalog.cards.find(c=>c.id===val('card'));for(const o of $('cardState').options)o.disabled=!card?.focus_eligible&&['focus','both'].includes(o.value);if($('cardState').selectedOptions[0]?.disabled)$('cardState').value='base';}
 function fillNodes(){option($('mapNode'),api.mapNodes(number('stage'),number('seed')),n=>n.id,n=>'Level '+(n.depth+1)+' · '+n.label+' · '+n.name+' · '+n.id);}
 function fillAnimations(){const a=catalog.actors[val('actor')];option($('animation'),Object.keys(a.animations),x=>x,x=>x);$('frame').max=a.animations[val('animation')].frames.length-1;}
 function setup(){const deck=val('deck').split(/[\n,]/).map(x=>x.trim()).filter(Boolean).map(id=>({key:id.replace(/\+$/,''),upgraded:id.endsWith('+')}));return {kind:val('kind'),seed:number('seed'),stage:number('stage'),mode:val('mode'),enemy:val('enemy'),intent:val('intent'),elite:$('elite').checked,event:val('event'),hp:number('hp'),gold:number('gold'),enemyHp:val('enemyHp'),energy:number('energy'),focus:number('focus'),visit:number('visit'),deck,artifacts:[...$('artifacts').selectedOptions].map(o=>o.value)};}
 function assign(o){$('search').value='';fillEnemies();if(o.enemy!==undefined)$('enemy').value=o.enemy;fillIntents();for(const id of ['kind','seed','stage','mode','enemy','intent','event','hp','gold','enemyHp','energy','focus','visit'])if(o[id]!==undefined)$(id).value=o[id];$('elite').checked=!!o.elite;$('deck').value=(o.deck||[]).map(c=>typeof c==='string'?c:c.key+(c.upgraded?'+':'')).join('\n');for(const opt of $('artifacts').options)opt.selected=(o.artifacts||[]).includes(opt.value);}
 function motion(){return {actor:val('actor'),action:val('animation'),speed:number('speed'),scale:number('scale'),x:number('offsetX'),y:number('offsetY'),loop:$('loop').checked,overlay:$('overlay').checked,flip:$('flip').checked};}
 function download(name,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function presetList(){option($('preset'),presets,p=>p.name,p=>p.name);}
 function savePresets(next){if(!storageOK)throw Error('Preset storage is unavailable or unreadable. Export your setup instead.');localStorage.setItem(KEY,JSON.stringify(next));presets=next;presetList();}
 function details(){return {version:catalog.version,setup:lastSetup,current:api.snapshot(),logs};}
 frame.addEventListener('load',()=>{api=frame.contentWindow.STMDevApi;if(!api){status('Game adapter failed to load. Check developer server output.',true);return;}catalog=api.catalog();$('hp').max=catalog.maxHp;fillEnemies();fillCards();option($('artifacts'),catalog.artifacts,a=>a.id,a=>a.name+' · '+a.id);option($('actor'),Object.entries(catalog.actors),x=>x[0],x=>x[1].name);fillAnimations();fillNodes();status('Ready · v'+catalog.version+' · sandbox progress is temporary.');record('ready',{version:catalog.version});});
 document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('.panel').forEach(x=>x.hidden=x.id!==b.dataset.tab);}));
 const on=(id,fn)=>$(id).addEventListener('click',()=>safely($(id).textContent,fn));
 on('launch',()=>{const o=setup(),result=api.launch(o);lastSetup=o;return {scene:result.run.scene,valid:result.valid};});
 on('restart',()=>api.restart());on('back',()=>api.home());on('refill',()=>api.command('refill'));on('turn',()=>api.command('turn'));on('draw',()=>api.command('draw'));on('forceWin',()=>api.command('win'));on('forceLose',()=>api.command('lose'));
 on('reset',()=>{assign({kind:'combat',seed:7,stage:0,mode:'learn',enemy:Object.keys(catalog.enemies)[0],intent:'',event:catalog.events[0].id,hp:30,gold:500,enemyHp:'',energy:3,focus:0,visit:1,deck:[],artifacts:[]});api.home();lastSetup=null;});
 on('godMode',()=>{const result=api.godMode(!api.snapshot().godMode);$('godMode').setAttribute('aria-checked',String(result.godMode));$('godMode').textContent='God Mode: '+(result.godMode?'ON':'OFF');return result;});
 $('freeMap').addEventListener('change',()=>safely('Free map',()=>api.freeMap($('freeMap').checked)));
 on('refreshNodes',()=>{fillNodes();return api.mapNodes(number('stage'),number('seed'));});
 $('stage').addEventListener('change',()=>{if(api)fillNodes();});
 on('teleport',()=>api.teleport(number('stage'),val('mapNode'),number('seed')));on('returnMap',()=>api.returnMap());
 on('openEvent',()=>api.openEvent(val('event'),setup()));
 on('addCard',()=>api.addCards(val('card'),number('addCount'),$('addUpgraded').checked,val('addDestination')));
 on('compare',()=>api.cards(val('card'),val('language'),setup()));
 on('testCard',()=>api.testCard(val('card'),val('cardState'),setup()));
 on('openMotion',()=>api.motion(motion()));on('applyMotion',()=>api.motion(motion()));
 on('resetMotion',()=>{for(const [k,v]of Object.entries({speed:1,scale:1,offsetX:0,offsetY:0}))$(k).value=v;$('loop').checked=$('overlay').checked=true;$('flip').checked=false;return api.motion(motion());});
 on('playMotion',()=>api.playback('toggle'));on('restartMotion',()=>api.motion(motion()));on('stepMotion',()=>api.playback('step'));
 $('frame').addEventListener('input',()=>safely('Seek frame',()=>api.playback('seek',number('frame'))));
 on('exportMotion',()=>download('stm-motion-proposal.json',{version:1,build:catalog.version,status:'PROPOSED',options:motion(),original:catalog.actors[val('actor')]}));
 on('savePreset',()=>{const p={version:1,name:val('presetName').trim(),setup:setup()};frame.contentWindow.STMDevFixtures.validatePreset(p);savePresets([...presets.filter(x=>x.name!==p.name),p]);});
 on('loadPreset',()=>{const p=presets.find(p=>p.name===val('preset'));frame.contentWindow.STMDevFixtures.validatePreset(p);assign(p.setup);lastSetup=p.setup;return p;});
 on('deletePreset',()=>savePresets(presets.filter(p=>p.name!==val('preset'))));
 on('exportPreset',()=>download('stm-scene-preset.json',{version:1,name:val('presetName').trim()||'Scene setup',setup:setup()}));
 $('importPreset').addEventListener('change',()=>safely('Import preset',async()=>{const file=$('importPreset').files[0];if(!file)return;if(file.size>100000)throw Error('Preset exceeds 100 KB.');const p=frame.contentWindow.STMDevFixtures.validatePreset(JSON.parse(await file.text()));assign(p.setup);$('presetName').value=p.name;return p;}));
 on('copy',async()=>{await navigator.clipboard.writeText(JSON.stringify(details(),null,2));});on('downloadLog',()=>download('stm-dev-test-details.json',details()));on('clearLog',()=>{logs.length=0;});
 $('search').addEventListener('input',()=>catalog&&fillEnemies());$('enemy').addEventListener('change',()=>{fillIntents();const actor=catalog.actors[val('enemy')];if(actor?.stage!==undefined)$('stage').value=actor.stage;});$('cardSearch').addEventListener('input',fillCards);$('category').addEventListener('change',fillCards);$('card').addEventListener('change',cardStates);$('actor').addEventListener('change',fillAnimations);$('animation').addEventListener('change',()=>{$('frame').max=catalog.actors[val('actor')].animations[val('animation')].frames.length-1;$('frame').value=0;});
 try{const raw=localStorage.getItem(KEY);if(raw){const saved=JSON.parse(raw);if(!Array.isArray(saved)||saved.some(p=>p.version!==1||typeof p.name!=='string'||!p.setup))throw Error('Unreadable preset file.');presets=saved;}presetList();}catch(e){storageOK=false;status('Preset storage: '+e.message,true);record('preset-storage',{error:e.message});}
 window.addEventListener('error',e=>record('error',{message:e.message}));
})();
