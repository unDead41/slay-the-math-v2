/* Settings owns the sole Online/Offline choice; pet surfaces consume the contract. */
(function(host){'use strict';
const doc=host.document,mode=host.STMPlayMode;if(!doc||!mode)return;
const language=()=>host.DCQuestionLanguage?.language?.()||host.DCGameLanguage?.language?.()||'en';
const t=text=>host.DCGameLanguage?.translate(text,language())||text;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let scheduled=false,answerGeneration=0;
function settingsHTML(){const selected=mode.snapshot().mode;return '<section class="play-mode-settings" data-no-translate><fieldset><legend>'+esc(t('Play mode'))+'</legend><div class="play-mode-options">'+['online','offline'].map(value=>'<label><input type="radio" name="stm-play-mode" data-stm-mode="'+value+'" value="'+value+'" '+(selected===value?'checked':'')+'><span>'+esc(t(value==='online'?'Online':'Offline'))+'</span></label>').join('')+'</div><p>'+esc(t('Your choice is separate from the internet connection.'))+'</p><p id="stm-connection-hint"></p><p id="stm-mode-storage" role="status"></p></fieldset><section aria-labelledby="stm-offline-title"><h3 id="stm-offline-title">'+esc(t('Offline game'))+'</h3><p id="stm-offline-status" role="status"></p><progress id="stm-offline-progress" max="100" value="0" aria-label="'+esc(t('Offline download progress'))+'"></progress><p id="stm-offline-count"></p><p id="stm-offline-storage"></p><p id="stm-offline-failures" role="alert"></p><div class="button-row"><button type="button" class="btn" data-stm-offline="resume">'+esc(t('Prepare offline / Retry / Resume'))+'</button><button type="button" class="btn" data-stm-offline="pause">'+esc(t('Pause download'))+'</button></div></section><details class="pet-local-help"><summary>'+esc(t('Pet help'))+'</summary><p>'+esc(t('Local FAQ works offline. Free chat needs Online and an available API.'))+'</p><div class="button-row">'+['Block','Focus','Predict','Offline'].map(topic=>'<button type="button" class="btn" data-stm-pet-topic="'+topic+'">'+topic+'</button>').join('')+'</div><label>'+esc(t('Your question'))+'<input id="stm-pet-question" maxlength="1000" autocomplete="off"></label><button type="button" class="btn" data-stm-pet-ask>'+esc(t('Ask for help'))+'</button><p id="stm-pet-answer" role="status"></p><p id="stm-pet-api-status"></p></details></section>';}
const phases={idle:'Offline preparation has not started.',checking:'Verifying saved offline files…',downloading:'Downloading the complete offline game…',paused:'Offline download paused.',partial:'Offline preparation is incomplete.',ready:'Ready to play offline',error:'Offline preparation needs another try.'};
function offlineText(s){return s?.errorCode==='quota'?'Not enough browser storage. Free space, then Resume.':s?.errorCode==='worker'?'The offline worker is unavailable. Reload after your run, then Retry.':s?.errorCode==='storage'?'Offline browser storage is unavailable. Nothing is marked ready.':phases[s?.phase]||phases.idle;}
function refresh(){
 if(!doc.querySelector('.play-mode-settings'))return;const choice=mode.snapshot(),installer=host.STMHosted?.offline,s=installer?.snapshot(),put=(id,text)=>{const el=doc.getElementById(id);if(el)el.textContent=text;};
 for(const radio of doc.querySelectorAll('[data-stm-mode]'))radio.checked=radio.value===choice.mode;
 put('stm-connection-hint',t(host.navigator.onLine===false?'The browser reports no network. Internet/API access is not confirmed.':'Internet/API availability is checked when a request is made.'));
 put('stm-mode-storage',!choice.explicit?t('Select Online here to allow pet API requests.'):!choice.persisted?t('This mode choice could not be saved on the browser.'):'');
 if(host.DC_ASSETS){put('stm-offline-status',t('Standalone portable file: resources are embedded. This is separate from a browser offline installation.'));}
 else{put('stm-offline-status',t(offlineText(s)));put('stm-offline-count',s?t('Verified')+': '+s.verifiedFiles+' / '+s.totalFiles+' · '+(s.verifiedBytes/1000000).toFixed(1)+' / '+(s.totalBytes/1000000).toFixed(1)+' MB · '+t('Remaining')+': '+(s.remainingBytes/1000000).toFixed(1)+' MB':'');}
 const progress=doc.getElementById('stm-offline-progress');if(progress)progress.value=s?.percent||0;
 put('stm-offline-storage',s?.persistence===false?t('The browser may clear saved files under storage pressure. Recheck before leaving the internet.'):s?.persistence===true?t('Persistent storage protection was granted. Clearing browser data still removes the game.'):'');
 put('stm-offline-failures',s?.failures?.map(f=>f.url+': '+f.reason).slice(0,5).join('\n')||'');
 const busy=['checking','downloading'].includes(s?.phase),resume=doc.querySelector('[data-stm-offline=resume]'),pause=doc.querySelector('[data-stm-offline=pause]');if(resume)resume.disabled=!installer||busy||!!s?.ready;if(pause)pause.disabled=!installer||!busy;
 const pet=host.STMPetHelp?.status();put('stm-pet-api-status',t(!choice.petAPIAllowed?'Pet API is off. Local FAQ is available.':pet?.api==='available'?'The last pet API request succeeded.':pet?.api==='unavailable'?'Online chat is unavailable. Local FAQ is available.':'Online chat is not confirmed. Local FAQ is available.'));
}
function schedule(){if(scheduled)return;scheduled=true;host.requestAnimationFrame(()=>{scheduled=false;refresh();});}
async function ask(text){const answer=doc.getElementById('stm-pet-answer');if(!answer||!host.STMPetHelp)return;const generation=++answerGeneration;delete answer.dataset.source;answer.textContent=t('Preparing help…');const reply=await host.STMPetHelp.ask(text,{language:language()});if(generation!==answerGeneration||!answer.isConnected)return;answer.textContent=t(reply.source==='local'?'Local FAQ':'Online reply')+': '+reply.answer;answer.dataset.source=reply.source;refresh();}
doc.addEventListener('click',event=>{
 const control=event.target.closest?.('[data-stm-mode],[data-stm-offline],[data-stm-pet-topic],[data-stm-pet-ask]');if(!control||control.disabled)return;
 if(control.dataset.stmMode){mode.set(control.dataset.stmMode);if(control.dataset.stmMode==='offline')host.STMHosted?.offline?.install();else host.STMHosted?.offline?.pause();refresh();}
 else if(control.dataset.stmOffline==='pause')host.STMHosted?.offline?.pause();
 else if(control.dataset.stmOffline==='resume')host.STMHosted?.offline?.install();
 else if(control.dataset.stmPetTopic)ask(control.dataset.stmPetTopic);
 else if(control.hasAttribute('data-stm-pet-ask'))ask(doc.getElementById('stm-pet-question')?.value||'');
});
doc.addEventListener('keydown',event=>{
 const radio=event.target.closest?.('input[type="radio"][data-stm-mode]');
 if(radio&&!event.isComposing&&[' ','Spacebar','Enter'].includes(event.key)){
  event.preventDefault();if(!event.repeat&&!radio.disabled)radio.click();return;
 }
 if(event.target.id==='stm-pet-question'&&event.key==='Enter'&&!event.isComposing){event.preventDefault();ask(event.target.value);}
});
mode.subscribe(()=>{answerGeneration++;const answer=doc.getElementById('stm-pet-answer');if(answer){answer.textContent=t('Local FAQ works offline. Free chat needs Online and an available API.');answer.dataset.source='local';}schedule();});host.addEventListener('stm-offline-change',schedule);host.addEventListener('online',schedule);host.addEventListener('offline',schedule);
host.STMPlayModeUI={settingsHTML,refresh,offlineText};
})(window);
