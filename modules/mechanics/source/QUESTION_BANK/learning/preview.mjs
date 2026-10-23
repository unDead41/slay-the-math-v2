/** Offline folio UI. Every answer and help transition belongs to session.mjs. */
const previewData=JSON.parse(document.getElementById('preview-data').textContent);
const QL=globalThis.DCQuestionLanguage,bank=previewData.bank,glossary=QL.installGlossary(previewData.glossary),foundations=previewData.foundations.modules;
const root=document.getElementById('preview'),byId=id=>document.getElementById(id);
const storageKey='slay-the-math.education-practice.v1';
const reviewStates=new Map(),activeTabs=new Map(),basicsOpen=new Set(),messages=new Map(),audioReviewGenerations=new Map();
const calculationIndex=new Map(),topicCodes=[...new Set(bank.questions.map(q=>q.topicCode))];
const shortTopics={PROB:'Probability',SET:'Sets',LOGIC:'Logic'};
const drawerMedia=globalThis.matchMedia('(max-width: 960px)');
let session,storageError='',storagePaused=false,storageAvailable=true,savedLearningText=null;
let question=bank.questions[0],selectedChoice=null,attemptCounter=0,mode='review',empty=false;
let lastRenderedQuestionKey=null,atlasIsOpen=false;
let contentLanguage=QL.language();byId('language-select').value=contentLanguage;document.documentElement.lang=contentLanguage;
let analyticsDisk=null,devPractice=false,analyticsEndpoint=globalThis.DC_EDUCATION_ENDPOINT||'/api/education',analyticsPageURL=location.href;
try{analyticsDisk=globalThis.localStorage;}catch{}
try{
 devPractice=!!globalThis.STMDevMode;
 if(parent!==window&&parent.location.origin===(globalThis.origin||location.origin)){devPractice=devPractice||!!parent.STMDevMode;analyticsEndpoint=parent.DC_EDUCATION_ENDPOINT||analyticsEndpoint;analyticsPageURL=parent.location.href;}
}catch{}
if(!/^https?:\/\//.test(analyticsPageURL))analyticsPageURL=document.baseURI;
const analyticsStore=globalThis.DCAnalytics.createStore({storage:analyticsDisk,bank,curriculum:globalThis.DCLearningCurriculum});
let practiceAnalyticsId=analyticsStore.getSessionId('practice'),reviewAnalyticsId=null,analyticsScope='all',analyticsView='overview',analyticsReturnFocus=null,analyticsClient=null,questionFeedback=null,localAnalyticsError='';
const reviewAnalyticsIds=new Map(),collectionAvailable=!devPractice&&/^https?:\/\//.test(analyticsPageURL);
analyticsClient=(globalThis.DCLearningDelivery||globalThis.DCLearningSync).createClient({storage:analyticsDisk,endpoint:analyticsEndpoint,host:globalThis,
 fetch:devPractice?async()=>{throw Error('Collection is disabled in developer practice.');}:typeof globalThis.fetch==='function'?globalThis.fetch.bind(globalThis):async()=>{throw Error('The collector is unavailable here.');},
 onchange:()=>refreshAnalyticsSurfaces(true)});
for(const option of byId('difficulty-select').options)option.value=option.value;
const tips=attachRichTextTooltips(root,{glossary,calculationIndex,getLanguage:()=>byId('language-select').value,getTheme:()=>root.dataset.theme});
questionFeedback=attachQuestionFeedback({bank,root,getQuestion:()=>question,getRecord:()=>currentRecord(),getMode:()=>mode,
 onChange:payload=>enqueueAnalytics(payload,'question-feedback'),getDelivery:analyticsStatus,onOpenSharing:()=>openAnalyticsReport('sharing')});

try{savedLearningText=localStorage.getItem(storageKey);}
catch{storageAvailable=false;storageError='Saving between visits is unavailable. Your progress will stay available while this page is open.';}
try{session=savedLearningText?restoreSession(JSON.parse(savedLearningText),bank):createSession({seed:127031});}
catch{session=createSession({seed:127031});practiceAnalyticsId=analyticsStore.startSession('practice');storagePaused=true;storageError='The saved learning record could not be read and has been kept. You can practise for this visit, or start a fresh learning record from Practice record to replace it.';}
captureAnalytics(session,'practice',practiceAnalyticsId);

function persist(){
 captureAnalytics(session,'practice',practiceAnalyticsId);
 if(storagePaused||!storageAvailable)return;
 try{localStorage.setItem(storageKey,JSON.stringify(session));}
 catch{storageAvailable=false;storageError='Saving between visits is unavailable. Your progress will stay available while this page is open.';}
}
function questionKey(){return mode+':'+question.id;}
function reviewSession(q){
 if(!reviewStates.has(q.id)){
  const reserved=reserveNext(createSession({seed:q.seed}),{...bank,questions:[q]});
  reviewStates.set(q.id,reserved.session);
 }
 return reviewStates.get(q.id);
}
function currentSession(){return mode==='learn'?session:reviewSession(question);}
function currentRecord(){return currentSession().records[question.id];}
function putSession(next){
 if(mode==='learn'){session=next;persist();}
 else{
  reviewStates.set(question.id,next);
  if(!reviewAnalyticsIds.has(question.id))reviewAnalyticsIds.set(question.id,reviewAnalyticsId||(reviewAnalyticsId=analyticsStore.startSession('review')));
  captureAnalytics(next,'review',reviewAnalyticsIds.get(question.id),[question.id]);
 }
}

function analyticsText(english,malay){return contentLanguage==='ms'?malay:english;}
function analyticsStatus(){
 const status=analyticsClient?.status()||{enabled:false,pending:0,state:'on-device',error:''};
 const localError=[analyticsStore.error,localAnalyticsError,questionFeedback?.error].filter(Boolean).join(' '),error=[localError,status.error].filter(Boolean).join(' ');
 return {...status,collectionDisabled:!collectionAvailable,...(!collectionAvailable?{enabled:false,state:'on-device'}:{}),...(error?{error}:{}),...(localError?{state:'save-error'}:{}),dev:devPractice};
}
function noteAnalyticsFailure(){localAnalyticsError=analyticsText('Learning reporting could not update. Keep this page open and export a copy before leaving.','Rekod laporan pembelajaran tidak dapat dikemas kini. Biarkan halaman ini terbuka dan eksport salinan sebelum keluar.');}
function enqueueAnalytics(payload,kind='learning-record'){
 try{return analyticsClient.enqueue({id:payload.id,kind,payload});}
 catch{noteAnalyticsFailure();return null;}
}
function captureAnalytics(ownerSession,scope,sessionId,questionIds){
 try{
  const result=analyticsStore.capture(ownerSession,{scope,sessionId,source:scope==='practice'?'practice':'review',language:contentLanguage,...(questionIds?{questionIds}:{})});
  for(const payload of result.changedRecords)enqueueAnalytics(payload);
 }catch{noteAnalyticsFailure();}
 refreshAnalyticsSurfaces();
}
function refreshAnalyticsSurfaces(statusOnly=false){
 if(!analyticsClient)return;
 if(byId('practice-analytics-dialog')?.open)renderAnalyticsReport(statusOnly);
 questionFeedback?.refreshDelivery();
}
function renderAnalyticsReport(statusOnly=false){
 const status=analyticsStatus(),content=byId('practice-analytics-content'),UI=globalThis.DCAnalyticsUI;
 const saved=UI.captureState(content.querySelector('.learning-report'));
 const syncArea=statusOnly?content.querySelector('[data-analytics-sync]'):null;
 const scrollTop=byId('practice-analytics-dialog').scrollTop;
 byId('practice-analytics-title').textContent=analyticsText('Learning Report','Laporan Pembelajaran');
 byId('close-practice-analytics').textContent=analyticsText('Close report','Tutup laporan');
 if(syncArea)syncArea.innerHTML=UI.syncHTML(status,contentLanguage);
 else content.innerHTML=UI.html({report:analyticsStore.report({scope:analyticsScope,language:contentLanguage}),status,language:contentLanguage,view:analyticsView});
 const report=content.querySelector('.learning-report');UI.restoreState(report,saved,{focus:true});analyticsView=report.dataset.view;
 if(!syncArea&&!collectionAvailable){
  const notice=document.createElement('p');notice.className='analytics-practice-note';notice.textContent=devPractice?analyticsText('Developer practice stays in this temporary session. Collection is disabled.','Latihan pembangun kekal dalam sesi sementara ini. Pengumpulan dinyahaktifkan.'):analyticsText('This offline file keeps records on this device. Open the game through its HTTP server to enable collection.','Fail luar talian ini menyimpan rekod pada peranti ini. Buka permainan melalui pelayan HTTP untuk mengaktifkan pengumpulan.');content.prepend(notice);
 }
 byId('practice-analytics-dialog').scrollTop=scrollTop;
}
function openAnalyticsReport(view){
 analyticsReturnFocus=document.activeElement;byId('practice-analytics-status').textContent='';renderAnalyticsReport();
 if(view){analyticsView=view;globalThis.DCAnalyticsUI.selectView(byId('practice-analytics-content').querySelector('.learning-report'),view);}
 if(!byId('practice-analytics-dialog').open)byId('practice-analytics-dialog').showModal();byId('close-practice-analytics').focus();
}
function closeAnalyticsReport(){byId('practice-analytics-dialog').close();analyticsReturnFocus?.focus();}
function analyticsFile(){
 const data=analyticsStore.exportData(),status=analyticsStatus();
 const content=JSON.stringify({...data,questionFeedback:questionFeedback.exportData(),collection:{enabled:status.enabled,pendingEntries:status.pendingEntries||[]},ownerRecovery:{schemaVersion:1,scope:'practice',sessionId:practiceAnalyticsId,session:JSON.parse(JSON.stringify(session))}},null,2)+'\n';
 return new File([content],'slay-the-math-learning-backup-'+new Date().toISOString().slice(0,10)+'.json',{type:'application/json'});
}
function downloadAnalytics(){
 try{
  const file=analyticsFile(),url=URL.createObjectURL(file),link=document.createElement('a');link.href=url;link.download=file.name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  byId('practice-analytics-status').textContent=analyticsText('Learning backup download prepared.','Muat turun sandaran pembelajaran disediakan.');
 }catch{byId('practice-analytics-status').textContent=analyticsText('The download could not start. Keep this page open and try again.','Muat turun tidak dapat dimulakan. Biarkan halaman ini terbuka dan cuba lagi.');}
}
function setMessage(text,tone=''){messages.set(questionKey(),{text,tone});}
function topicName(code){return bank.topics?.[code]?.name||bank.questions.find(q=>q.topicCode===code)?.topic||code;}
function rich(node,runs,allow=false){return renderRichText(typeof node==='string'?byId(node):node,runs,{glossary,calculationIndex,allowCalculations:allow});}
function visual(node,value,allow=false){renderVisual(byId(node),QL.visual(value,contentLanguage,question.topicCode),{glossary,calculationIndex,allowCalculations:allow});}
function plainParagraph(text,className){const node=document.createElement('p');node.textContent=text;if(className)node.className=className;return node;}
function interactiveTerm(target){return !!target?.closest?.('[data-richtext-kind],[data-stm-tip],[data-glossary-id],[data-calculation-id]');}
function focusQuestion(){byId('question-heading').focus({preventScroll:true});byId('question-surface').scrollIntoView({block:'start',behavior:'auto'});}

function filteredQuestions(){
 const search=byId('question-search').value.trim().toLocaleLowerCase();
 const topic=byId('atlas-topic-select').value,difficulty=byId('difficulty-select').value;
 return bank.questions.filter(q=>{
  if(topic&&q.topicCode!==topic)return false;
  if(difficulty&&q.difficulty!==difficulty)return false;
  if(!search)return true;
  const localized=QL.question(q,contentLanguage);
  const text=[q.id,q.topic,q.topicCode,shortTopics[q.topicCode],q.difficulty,q.prompt,localized.prompt,localized.topic,QL.t(shortTopics[q.topicCode],contentLanguage),QL.t(q.difficulty,contentLanguage),localized.harmonization?.contextNote||'',...(q.curriculumStandards||[])].join(' ').toLocaleLowerCase();
  return search.split(/\s+/).every(word=>text.includes(word));
 });
}
function renderAtlas(){
 const filtered=filteredQuestions(),hasFilters=!!(byId('question-search').value||byId('atlas-topic-select').value||byId('difficulty-select').value);
 byId('atlas-results').textContent=`${filtered.length} of ${bank.questions.length} questions`;
 byId('atlas-mobile-count').textContent=bank.questions.length;
 byId('clear-filters').hidden=!hasFilters;byId('atlas-empty').hidden=filtered.length>0;
 byId('question-atlas').replaceChildren();
 byId('atlas-intro').textContent=mode==='learn'?'The atlas opens Review. Your Learning question stays saved.':'Open any question in Review.';
 byId('atlas-footnote').textContent=mode==='learn'?'Dots show your Learning record. Atlas visits use a separate review.':'Review stays in this open page.';
 const rovingId=filtered.some(q=>q.id===question.id)?question.id:filtered[0]?.id;
 for(const code of topicCodes){
  const rows=filtered.filter(q=>q.topicCode===code);if(!rows.length)continue;
  const section=document.createElement('section');section.className='atlas-topic';section.setAttribute('aria-label',topicName(code));
  const heading=document.createElement('h3');heading.className='atlas-topic-heading';
  const title=document.createElement('span');title.textContent=shortTopics[code]||topicName(code);
  const count=document.createElement('span');count.textContent=`${rows.length} questions`;heading.append(title,count);
  const grid=document.createElement('div');grid.className='atlas-grid';grid.setAttribute('role','group');grid.setAttribute('aria-label',title.textContent+' questions');
  for(const q of rows){
   const record=mode==='learn'?session.records[q.id]:reviewStates.get(q.id)?.records[q.id];
   const button=document.createElement('button');button.type='button';button.className='atlas-question';button.dataset.questionId=q.id;
   button.textContent=q.id.split('-').at(-1).replace(/^0/,'');
   const status=record?.status||'unseen';button.dataset.status=status;
   const statusName=status==='pending'?'opened':status==='correct'?'correct':status==='revealed'?'answer revealed':'not started';
   button.setAttribute('aria-label',`${q.id}, ${q.difficulty}, ${statusName}`);button.title=`${q.id} · ${q.difficulty} · ${statusName}`;
   button.setAttribute('aria-current',String(q.id===question.id&&!empty));button.tabIndex=q.id===rovingId?0:-1;
   button.addEventListener('click',()=>navigateReview(q.id,{focus:true}));grid.append(button);
  }
  section.append(heading,grid);byId('question-atlas').append(section);
 }
}
function navigateReview(id,{focus=false}={}){
 const q=bank.questions.find(item=>item.id===id);if(!q)return;
 question=q;mode='review';empty=false;byId('mode-select').value=mode;
 selectedChoice=reviewSession(q).records[q.id].lastChoiceId||null;
 render();setAtlasOpen(false);
 if(focus)focusQuestion();
}
function nextReview(direction=1){
 const filtered=filteredQuestions(),rows=filtered.length?filtered:bank.questions;
 let index=rows.findIndex(q=>q.id===question.id);
 index=index<0?(direction>0?0:rows.length-1):(index+direction+rows.length)%rows.length;
 navigateReview(rows[index].id,{focus:true});
}
function nextLearningQuestion({focus=false}={}){
 const selection=reserveNext(session,bank,{topicCode:byId('topic-select').value||null});
 session=selection.session;persist();empty=!selection.question;
 if(selection.question){question=selection.question;selectedChoice=session.records[question.id].lastChoiceId||null;}
 render();
 if(focus&&!empty)focusQuestion();
}
function switchMode(next){
 mode=next;byId('mode-select').value=next;empty=false;
 if(next==='learn'){
  const id=session.pendingQuestionId||session.lastQuestionId;
  const found=bank.questions.find(q=>q.id===id);
  if(found&&session.records[found.id]){question=found;selectedChoice=session.records[found.id].lastChoiceId||null;render();}
  else nextLearningQuestion();
 }else{
  selectedChoice=reviewSession(question).records[question.id].lastChoiceId||null;render();
 }
}

function renderProgress(){
 const records=Object.values(session.records),closed=records.filter(r=>r.status!=='pending');
 const counts={independent:0,supported:0,retry:0,revealed:0};
 for(const record of closed)if(record.completion)counts[record.completion.category]++;
 byId('progress-mini').textContent=`${closed.length} / ${bank.questions.length}`;
 byId('progress-caption').textContent=`${closed.length} of ${bank.questions.length} finished · ${session.exposureIds.length} seen${session.pendingQuestionId?' · one question in progress':''}.`;
 byId('overall-progress').max=bank.questions.length;byId('overall-progress').value=closed.length;
 byId('save-status').textContent=storagePaused?'Saving paused':storageAvailable?'Saved in this browser':'For this visit';
 byId('resume-learning-label').textContent=records.length?'Resume learning':'Start learning';
 byId('resume-learning').setAttribute('aria-label',records.length?`Resume learning${session.pendingQuestionId?' at '+session.pendingQuestionId:''}`:'Start a learning session');
 byId('progress-summary').replaceChildren();
 for(const [key,label] of [['independent','First try · no help'],['supported','Correct · with help'],['retry','Correct · after retry'],['revealed','Solution viewed']]){
  const card=document.createElement('div'),value=document.createElement('strong');value.textContent=counts[key];card.append(value,document.createTextNode(label));byId('progress-summary').append(card);
 }
 byId('topic-progress').replaceChildren();
 for(const code of topicCodes){
  const qs=bank.questions.filter(q=>q.topicCode===code),rows=qs.map(q=>session.records[q.id]).filter(Boolean),done=rows.filter(r=>r.status!=='pending');
  const card=document.createElement('div');card.className='topic-progress-card';
  const title=document.createElement('strong');title.textContent=shortTopics[code]||topicName(code);
  const finished=document.createElement('span');finished.textContent=`${done.length} / ${qs.length} finished`;
  const correct=document.createElement('span');correct.textContent=`${done.filter(r=>r.status==='correct').length} correct · ${rows.length} seen`;
  card.append(title,finished,correct);byId('topic-progress').append(card);
 }
 byId('progress-list').replaceChildren();
 for(const skill of skillProgress(session,bank)){
  const card=document.createElement('div');card.className='learning-skill';card.dataset.skillId=skill.skillId;
  const name=document.createElement('strong');name.textContent=skill.label;
  const progress=document.createElement('progress');progress.max=skill.totalQuestions||1;progress.value=skill.completed;progress.setAttribute('aria-label',skill.label+' questions finished');
  const line=document.createElement('div');line.textContent=skill.completed?`${skill.correct} / ${skill.completed} correct · ${skill.seen} / ${skill.totalQuestions} seen`:`Not tried · ${skill.totalQuestions} available`;
  const support=document.createElement('div');support.textContent=`First try ${skill.independentFirstTry} · With help ${skill.correctWithSupport} · Retry ${skill.correctAfterRetry}`;
  const evidence=document.createElement('div');evidence.className='skill-state';evidence.textContent=skill.status;
  card.append(name,progress,line,support,evidence);byId('progress-list').append(card);
 }
}
function renderScenario(){
 const metadata=question.harmonization||{},context=metadata.contextNote?.trim()||'';
 byId('context-panel').hidden=!context;
 if(metadata.contextRichText)rich('context-note',metadata.contextRichText);else byId('context-note').textContent=context;
 const given=Array.isArray(metadata.given)?metadata.given.filter(Boolean):[],asked=metadata.asked?.trim()||'';
 byId('given-panel').hidden=!given.length;byId('asked-panel').hidden=!asked;byId('question-data').hidden=!(given.length||asked);
 byId('given-facts').replaceChildren();for(let i=0;i<given.length;i++){const item=document.createElement('li');if(metadata.givenRichText?.[i])rich(item,metadata.givenRichText[i]);else item.textContent=given[i];byId('given-facts').append(item);}
 if(metadata.askedRichText)rich('asked-text',metadata.askedRichText);else byId('asked-text').textContent=asked;
}
function renderSources(closed=false){
 const metadata=question.harmonization||{},sources=metadata.sources||[],alignment=metadata.alignment||'';
 const names={core:'Core',supporting:'Supporting',enrichment:'Enrichment'};
 byId('alignment-badge').hidden=!alignment;byId('alignment-badge').textContent=names[alignment]||alignment;
 byId('source-alignment').replaceChildren();
 if(alignment){const title=document.createElement('strong');title.textContent=`Curriculum fit: ${names[alignment]||alignment}. `;byId('source-alignment').append(title);}
 if(closed&&metadata.alignmentNote)byId('source-alignment').append(plainParagraph(metadata.alignmentNote,'source-authoring-note'));
 if(!closed)byId('source-alignment').append(plainParagraph('Authoring notes appear after the question is finished.','source-notes-locked'));
 byId('question-sources').replaceChildren();
 if(!sources.length)byId('question-sources').append(plainParagraph('Source mapping is not available for this record.'));
 for(const source of sources){
  const registry=bank.sourceRegistry?.[source.sourceId]||{},article=document.createElement('article');article.className='source-reference';article.dataset.sourceId=source.sourceId;
  const title=document.createElement('h4');title.textContent=registry.title||source.sourceId;article.append(title);
  const pdfPages=Array.isArray(source.pdfPages)?source.pdfPages:[],parts=[];
  if(pdfPages.length)parts.push(`PDF ${pdfPages.length===1?'page':'pages'} ${pdfPages.join(', ')}`);
  if(source.printedPages)parts.push(`printed ${/[,–-]/.test(source.printedPages)?'pages':'page'} ${source.printedPages}`);
  if(parts.length)article.append(plainParagraph(parts.join(' · '),'source-pages'));
  if(source.section)article.append(plainParagraph(source.section));
  if(source.standards?.length)article.append(plainParagraph('Standards: '+source.standards.join(', ')));
  if(closed&&source.basis)article.append(plainParagraph(source.basis,'source-basis'));
  article.append(plainParagraph(`${source.sourceId}${registry.filename?' · '+registry.filename:''}`,'source-file'));
  byId('question-sources').append(article);
 }
}
function renderBasics(){
 const original=foundations.find(m=>m.id===question.learning.foundationId),module=original?QL.foundation(original,contentLanguage):null,open=basicsOpen.has(questionKey())&&!!module;
 byId('basics-panel').hidden=!open;byId('basics-button').disabled=!module;byId('basics-button').setAttribute('aria-expanded',String(open));
 byId('basics-cards').replaceChildren();byId('basics-checks').replaceChildren();if(!open)return;
 byId('basics-title').textContent=module.title;
 for(const item of module.cards){
  const card=document.createElement('article');card.className='learning-foundation-card';
  const title=document.createElement('h3');title.textContent=item.title;const p=document.createElement('p');rich(p,item.richText,true);card.append(title,p);byId('basics-cards').append(card);
 }
 for(const check of module.checks){
  const fieldset=document.createElement('fieldset');fieldset.className='learning-check';
  const legend=document.createElement('legend');rich(legend,check.richText,true);fieldset.append(legend);
  const radios=[];
  for(let i=0;i<check.choices.length;i++){
   const line=document.createElement('div');line.className='learning-check-option';
   const input=document.createElement('input');input.type='radio';input.name=questionKey()+':'+check.id;input.value=i;
   const words=document.createElement('span');words.id='practice-'+check.id+'-'+i;rich(words,check.choiceRichText[i],true);input.setAttribute('aria-labelledby',words.id);
   line.append(input,words);line.addEventListener('click',event=>{if(!interactiveTerm(event.target))input.checked=true;});fieldset.append(line);radios.push(input);
  }
  const button=document.createElement('button');button.type='button';button.textContent='Check practice';
  const feedback=document.createElement('p');feedback.className='learning-check-feedback';feedback.setAttribute('role','status');
  button.addEventListener('click',()=>{const selected=radios.findIndex(r=>r.checked);if(selected<0){feedback.textContent=QL.t('Choose an answer first.',contentLanguage);return;}rich(feedback,check.feedbackRichText[selected],true);});
  fieldset.append(button,feedback);byId('basics-checks').append(fieldset);
 }
}
function updateChoiceSelection(){
 for(const row of byId('choices').querySelectorAll('.choice')){
  const input=row.querySelector('input');input.checked=input.value===selectedChoice;row.classList.toggle('selected',input.checked);
 }
}
function renderChoices(view,record){
 byId('choices').replaceChildren();
 for(const choice of question.choices){
  const row=document.createElement('div');row.className='choice';row.dataset.choiceId=choice.id;
  const input=document.createElement('input');input.type='radio';input.name='answer';input.value=choice.id;input.checked=choice.id===selectedChoice;input.disabled=view.closed;
  row.classList.toggle('selected',input.checked);row.classList.toggle('closed',view.closed);
  const text=document.createElement('div');text.className='choice-text';text.id=choice.id+'-text';input.setAttribute('aria-labelledby',text.id);
  const letter=document.createElement('span');letter.className='choice-letter';letter.textContent=choice.label+'.';
  const words=document.createElement('span');words.className='choice-words';rich(words,view.choices[choice.id]);text.append(letter,words);row.append(input,text);
  let result='';
  if(view.closed&&choice.id===question.correctChoiceId){row.classList.add('correct');result='Correct';}
  else if(record.lastChoiceId===choice.id&&record.attempts.at(-1)?.correct===false){row.classList.add('wrong');result=view.closed?'Your choice':'Try again';}
  if(result){const badge=document.createElement('span');badge.className='choice-result';badge.textContent=result;row.append(badge);}
  input.addEventListener('change',()=>{selectedChoice=choice.id;updateChoiceSelection();});
  row.addEventListener('click',event=>{if(!interactiveTerm(event.target)&&!input.disabled){selectedChoice=choice.id;updateChoiceSelection();}});
  byId('choices').append(row);
 }
}
function renderSupport(view,record){
 const key=questionKey(),tab=activeTabs.has(key)?activeTabs.get(key):record.hintState.moreHintViewed?'more':record.hintState.hintUsed?'hint':null;
 const showHint=tab==='hint'&&!!view.hintSteps,showMore=tab==='more'&&record.hintState.moreHintViewed&&!!view.moreHint;
 byId('hint-tab').disabled=view.closed&&!record.hintState.hintUsed;
 byId('hint-tab').setAttribute('aria-selected',String(showHint));byId('hint-tab').tabIndex=showMore?-1:0;
 byId('more-hint-tab').setAttribute('aria-selected',String(showMore));byId('more-hint-tab').tabIndex=showMore?0:-1;
 byId('more-hint-tab').disabled=!record.hintState.moreHintUnlocked;
 byId('more-hint-label').textContent=record.hintState.moreHintUnlocked?'More Hint':'More Hint · locked';
 byId('hint-panel').hidden=!showHint;byId('more-hint-panel').hidden=!showMore;
 rich('hint-concept',showHint?view.hintSteps.concept:[]);rich('hint-next',showHint?view.hintSteps.nextStep:[]);rich('more-hint-text',showMore?view.moreHint:[]);
 // Hint 1 keeps its filled reference values when revisited after the solution.
 visual('hint-visual',showHint?selectSupportVisual(question):null);
 visual('more-hint-visual',showMore?selectSupportVisual(question):null);
 byId('more-hint-rule').textContent=view.closed?'This question is finished. You can review the solution below.':record.hintState.moreHintUnlocked?'More Hint is ready. Open it for a more specific next step.':record.hintState.hintUsed?'Hint is open. A wrong answer submitted now unlocks More Hint.':'Open Hint first. A wrong answer after that unlocks More Hint.';
 renderBasics();
}
function renderSolution(view,record){
 byId('answer-panel').hidden=!view.closed;byId('answer-title').replaceChildren();
 byId('solution-kicker').textContent=record.status==='correct'?'Correct · the completed idea':'Solution · question finished';
 if(view.closed&&view.answer){
  byId('answer-title').append(document.createTextNode('Answer '+view.answer.label+': '));
  const words=document.createElement('span');rich(words,view.choices[question.correctChoiceId]);byId('answer-title').append(words);
 }
 rich('explanation',view.closed?view.explanation:[],view.allowCalculations);
 byId('worked-steps').replaceChildren();byId('worked-steps').hidden=!view.workedSteps;
 byId('show-steps').setAttribute('aria-expanded',String(!!view.workedSteps));byId('show-steps').textContent=view.workedSteps?'Hide Steps':'Show Steps';
 if(view.workedSteps)for(const step of view.workedSteps){const item=document.createElement('li'),body=document.createElement('div');body.className='worked-step-text';rich(body,step.richText,true);item.append(body);byId('worked-steps').append(item);}
 visual('solution-visual',view.closed?view.visual:null,true);
 byId('solution-visual-details').hidden=!view.closed||!view.visual;
}
function render(){
 question=QL.question(bank.questions.find(q=>q.id===question.id),contentLanguage);
 tips.close();calculationIndex.clear();root.dataset.mode=mode;
 byId('bank-version').textContent=bank.bankVersion||'120-question collection';
 byId('storage-notice').hidden=!storageError;byId('storage-notice').textContent=storageError;
 byId('mode-description').textContent=mode==='review'?'Browse every question. Reset a review whenever you want another try.':'Finish one question, then get an unseen question chosen from your practice.';
 byId('mode-badge').textContent=mode==='review'?'Review':'Learning';
 byId('topic-picker').hidden=mode!=='learn';byId('restart-review').hidden=mode!=='review';byId('previous-question').hidden=mode!=='review';
 byId('question-surface').hidden=empty;byId('empty-state').hidden=!empty;
 byId('question-select').value=question.id;
 byId('learning-report').textContent=analyticsText('Learning Report','Laporan Pembelajaran');
 byId('term-interaction-help').textContent=analyticsText('Hover, focus or tap a highlighted term. Press Escape or tap outside to close it.','Letakkan penuding, fokus atau tekan istilah yang disorot. Tekan Escape atau di luar petua untuk menutupnya.');
 if(byId('practice-analytics-dialog').open)renderAnalyticsReport();
 if(!empty)currentSession();
 renderProgress();renderAtlas();
 const pending=!!session.pendingQuestionId;
 byId('topic-select').disabled=mode==='learn'&&pending;
 byId('learning-selection-note').textContent=pending?'Finish your current question before changing the next topic.':'The next unseen question adapts to your recent answers and skills.';
 if(empty){
  const nextTopic=byId('topic-select').value,used=new Set(session.exposureIds);
  const available=bank.questions.some(q=>!used.has(q.id)&&(!nextTopic||q.topicCode===nextTopic));
  byId('empty-title').textContent=available?'Your next topic is ready.':'No unseen questions remain here.';
  byId('empty-message').textContent=available?'Select Next unseen question to continue learning.':nextTopic?'Choose another topic above, or explore the collection in Review.':'You have seen the whole collection. Review any question, or start a fresh learning record from Practice record.';
  byId('empty-state').append(byId('next-question'));byId('next-question').disabled=!available;byId('next-question').textContent=available?'Next unseen question →':'No unseen questions here';
  QL.applyInterface(root,contentLanguage);notifyAudio(null);return;
 }
 // The same button returns to the folio after an exhausted topic changes.
 byId('question-surface').querySelector('.folio-navigation').insertBefore(byId('next-question'),byId('next-question-note'));
 const record=currentRecord(),view=selectLearningView(question,record),key=questionKey();
 if(lastRenderedQuestionKey!==key){byId('solution-visual-details').open=false;byId('source-details').open=false;lastRenderedQuestionKey=key;}
 const index=bank.questions.findIndex(q=>q.id===question.id);
 byId('question-position').textContent=`Question ${String(index+1).padStart(3,'0')} / ${bank.questions.length}`;
 byId('question-state').textContent=record.status==='correct'?'Completed · correct':record.status==='revealed'?'Solution viewed':mode==='learn'?'Learning in progress':'Ready to explore';
 byId('question-heading').textContent=question.id;
 byId('question-meta').replaceChildren();
 const topic=document.createElement('span');topic.className='topic-label';topic.textContent=topicName(question.topicCode);
 const difficulty=document.createElement('span');difficulty.className='difficulty-badge';difficulty.textContent=question.difficulty;
 byId('question-meta').append(topic,difficulty);
 rich('question-prompt',view.prompt);renderScenario();renderChoices(view,record);renderSources(view.closed);
 byId('attempt-caption').textContent=record.attempts.length?`${record.attempts.length} ${record.attempts.length===1?'answer':'answers'} checked`:'One answer';
 byId('submit-answer').disabled=view.closed;byId('reveal-answer').disabled=view.closed;
 byId('submit-answer').textContent=view.closed?(record.status==='correct'?'Answered correctly':'Question finished'):'Check answer →';
 byId('choice-help').textContent=view.closed?'Explore the explanation and worked steps below.':analyticsText('Tap a highlighted term for its meaning. Select a choice, then check it.','Tekan istilah yang disorot untuk membaca maksudnya. Pilih jawapan, kemudian semak.');
 const message=messages.get(key);
 byId('status').textContent=message?.text||(record.status==='correct'?'Correct. Read the explanation or open Show Steps.':record.status==='revealed'?'You viewed the solution. This is recorded separately from a correct answer.':'');
 byId('status').dataset.tone=message?.tone||(record.status==='correct'?'correct':'');
 const wrongFeedback=view.feedback?.kind==='retry'&&!view.closed;
 byId('choice-feedback-panel').hidden=!wrongFeedback;
 byId('choice-feedback-title').textContent=wrongFeedback?`Answer ${question.choices.find(c=>c.id===record.lastChoiceId)?.label||''} · try this idea`:'Try this idea';
 rich('choice-feedback',wrongFeedback?view.feedback.richText:[]);
 renderSupport(view,record);renderSolution(view,record);questionFeedback.render();
 byId('next-question').disabled=mode==='learn'&&!!session.pendingQuestionId;
 byId('next-question').textContent=mode==='learn'?'Next unseen question →':'Next review →';
 byId('next-question-note').textContent=mode==='learn'&&session.pendingQuestionId?'Finish this question or view its solution to continue.':mode==='learn'?'Your next question has not been seen in this learning record.':'';
 QL.applyInterface(root,contentLanguage);
 notifyAudio(record,view.closed);
}

// The host owns the one global Voice bus. Practice never reads or changes a run.
function notifyAudio(record,closed=false){
 if(parent===window)return;
 parent.postMessage(record?{type:'stm-education-practice-audio',questionId:question.id,key:questionKey()+':'+(mode==='review'?(audioReviewGenerations.get(question.id)||0):currentSession().runIndex),closed:!!closed,hintUsed:!!record.hintState.hintUsed,moreHintViewed:!!record.hintState.moreHintViewed,record:{status:record.status,hintState:{hintUsed:!!record.hintState.hintUsed,moreHintViewed:!!record.hintState.moreHintViewed},events:record.events.map(e=>({type:e.type,...(e.attemptId?{attemptId:e.attemptId}:{})})),attempts:record.attempts.map(a=>({id:a.id,correct:a.correct}))}}:{type:'stm-education-practice-audio-clear'},location.origin==='null'?'*':location.origin);
}

function setAtlasOpen(open,{restoreFocus=false}={}){
 const mobile=drawerMedia.matches;atlasIsOpen=mobile&&open;
 byId('atlas-panel').hidden=mobile&&!atlasIsOpen;byId('atlas-backdrop').hidden=!atlasIsOpen;
 byId('atlas-toggle').setAttribute('aria-expanded',String(atlasIsOpen));document.body.classList.toggle('atlas-open',atlasIsOpen);
 byId('masthead').inert=atlasIsOpen;byId('main-pane').inert=atlasIsOpen;
 if(atlasIsOpen){byId('atlas-panel').setAttribute('role','dialog');byId('atlas-panel').setAttribute('aria-modal','true');byId('atlas-close').focus();}
 else{byId('atlas-panel').removeAttribute('role');byId('atlas-panel').removeAttribute('aria-modal');if(restoreFocus&&mobile)byId('atlas-toggle').focus();}
}
function toggleProgress(open=byId('progress-panel').hidden){byId('progress-panel').hidden=!open;byId('progress-button').setAttribute('aria-expanded',String(open));renderProgress();}
function openResetDialog(){byId('reset-description').textContent=analyticsText('This clears the current Practice record. Every question will be unseen again. Earlier Learning Reports and your open Review questions stay available.','Ini mengosongkan rekod Latihan semasa. Semua soalan akan menjadi belum dilihat semula. Laporan Pembelajaran terdahulu dan soalan Semakan yang terbuka masih tersedia.');byId('reset-learning-dialog').showModal();}

for(const code of topicCodes){
 for(const id of ['atlas-topic-select','topic-select']){const option=document.createElement('option');option.value=code;option.textContent=shortTopics[code]||topicName(code);byId(id).append(option);}
}
for(const q of bank.questions){const option=document.createElement('option');option.value=q.id;option.textContent=`${q.id} · ${shortTopics[q.topicCode]||q.topicCode} · ${q.difficulty}`;byId('question-select').append(option);}
byId('question-select').addEventListener('change',()=>navigateReview(byId('question-select').value,{focus:true}));
byId('mode-select').addEventListener('change',()=>switchMode(byId('mode-select').value));
byId('resume-learning').addEventListener('click',()=>{switchMode('learn');if(!empty)focusQuestion();});
byId('next-question').addEventListener('click',()=>{if(mode==='learn')nextLearningQuestion({focus:true});else nextReview();});
byId('previous-question').addEventListener('click',()=>nextReview(-1));
byId('topic-select').addEventListener('change',()=>{if(empty)render();else byId('learning-selection-note').textContent='Select Next unseen question when you are ready.';});
byId('theme-select').addEventListener('change',()=>{root.dataset.theme=byId('theme-select').value;tips.close();});
byId('language-select').addEventListener('change',()=>{contentLanguage=byId('language-select').value;QL.setLanguage(contentLanguage);document.documentElement.lang=contentLanguage;render();});
byId('progress-button').addEventListener('click',()=>toggleProgress(byId('progress-panel').hidden));
byId('learning-report').addEventListener('click',()=>openAnalyticsReport());
byId('close-practice-analytics').addEventListener('click',closeAnalyticsReport);
byId('practice-analytics-dialog').addEventListener('cancel',event=>{event.preventDefault();closeAnalyticsReport();});
byId('practice-analytics-content').addEventListener('click',event=>{
 const control=event.target.closest('[data-analytics-action]');if(!control||control.disabled)return;
 const action=control.dataset.analyticsAction;
 if(action==='scope'){
  if(!['all','gameplay','practice','review'].includes(control.dataset.scope))return;
  analyticsScope=control.dataset.scope;renderAnalyticsReport();byId('practice-analytics-content').querySelector('[data-analytics-action="scope"][data-scope="'+analyticsScope+'"]')?.focus();
 }else if(action==='view'){analyticsView=control.dataset.view;globalThis.DCAnalyticsUI.selectView(byId('practice-analytics-content').querySelector('.learning-report'),analyticsView);byId('practice-analytics-dialog').scrollTop=0;}
 else if(action==='export'&&control.dataset.exportformat==='json')downloadAnalytics();
 else if(action==='practice'){closeAnalyticsReport();byId('resume-learning').click();}
 else if(action==='share'&&collectionAvailable){analyticsClient.setEnabled(!analyticsClient.status().enabled);refreshAnalyticsSurfaces();}
 else if(action==='sync'&&collectionAvailable)analyticsClient.flush();
 else if(action==='use-default-destination'&&collectionAvailable){
  try{analyticsClient.useDefaultDestination();renderAnalyticsReport();byId('practice-analytics-status').textContent='';byId('practice-analytics-content').querySelector('[data-analytics-action=share]')?.focus({preventScroll:true});}
  catch(error){byId('practice-analytics-status').textContent=error.message;}
 }
 else if(action==='review'){
  const id=control.dataset.id,target=bank.questions.find(q=>q.id===id);if(!target)return;
  closeAnalyticsReport();navigateReview(target.id,{focus:true});
 }else if(action==='foundation'){
  const target=bank.questions.find(q=>q.id===question.id&&q.learning.foundationId===control.dataset.id)||bank.questions.find(q=>q.learning.foundationId===control.dataset.id);if(!target)return;
  closeAnalyticsReport();if(target.id!==question.id)navigateReview(target.id);
  basicsOpen.add(questionKey());putSession(openSupport(currentSession(),question.id,'foundation'));render();byId('basics-title').scrollIntoView({block:'start'});byId('basics-button').focus();
 }
});
byId('practice-analytics-content').addEventListener('change',event=>{
 const report=byId('practice-analytics-content').querySelector('.learning-report');
 if(event.target.matches('[data-analytics-scope]')){if(!['all','gameplay','practice','review'].includes(event.target.value))return;analyticsScope=event.target.value;renderAnalyticsReport();byId('practice-analytics-content').querySelector('[data-analytics-scope]')?.focus({preventScroll:true});}
 else if(event.target.matches('[data-analytics-question-filter]'))globalThis.DCAnalyticsUI.filterQuestions(report);
});
byId('practice-analytics-content').addEventListener('input',event=>{if(event.target.matches('[data-analytics-search]'))globalThis.DCAnalyticsUI.filterQuestions(byId('practice-analytics-content').querySelector('.learning-report'));});
byId('basics-button').addEventListener('click',()=>{
 const key=questionKey();
 if(basicsOpen.has(key))basicsOpen.delete(key);else{basicsOpen.add(key);putSession(openSupport(currentSession(),question.id,'foundation'));}
 render();
});
byId('hint-tab').addEventListener('click',()=>{putSession(openSupport(currentSession(),question.id,'hint'));activeTabs.set(questionKey(),'hint');render();});
byId('more-hint-tab').addEventListener('click',()=>{putSession(openSupport(currentSession(),question.id,'moreHint'));activeTabs.set(questionKey(),'more');render();});
root.querySelector('[role="tablist"]').addEventListener('keydown',event=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
 const tabs=[...root.querySelectorAll('[role="tab"]:not(:disabled)')];if(!tabs.length)return;
 const index=tabs.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
 tabs[next].focus();tabs[next].click();
});
byId('submit-answer').addEventListener('click',()=>{
 if(!selectedChoice){setMessage('Choose an answer first.');render();return;}
 const attemptId=globalThis.crypto?.randomUUID?.()||question.id+':'+Date.now()+':'+(++attemptCounter);
 putSession(submitAnswer(currentSession(),bank,{questionId:question.id,choiceId:selectedChoice,attemptId}));
 const record=currentRecord();setMessage(record.status==='correct'?'Correct. Read the explanation or open Show Steps.':record.hintState.moreHintUnlocked?'Try again. Read the feedback; More Hint is now available.':'Try again. Read the feedback or open Hint.',record.status==='correct'?'correct':'retry');render();
});
byId('reveal-answer').addEventListener('click',()=>{putSession(revealAnswer(currentSession(),question.id));setMessage('The solution is open and this question is finished. It is recorded separately from a correct answer.');render();});
byId('show-steps').addEventListener('click',()=>{putSession(openSupport(currentSession(),question.id,'steps'));render();});
byId('restart-review').addEventListener('click',()=>{
 audioReviewGenerations.set(question.id,(audioReviewGenerations.get(question.id)||0)+1);
 reviewAnalyticsIds.set(question.id,analyticsStore.startSession('review'));
 reviewStates.delete(question.id);basicsOpen.delete(questionKey());activeTabs.delete(questionKey());messages.delete(questionKey());selectedChoice=null;byId('solution-visual-details').open=false;render();
});
for(const id of ['question-search','atlas-topic-select','difficulty-select'])byId(id).addEventListener(id==='question-search'?'input':'change',renderAtlas);
byId('clear-filters').addEventListener('click',()=>{byId('question-search').value='';byId('atlas-topic-select').value='';byId('difficulty-select').value='';renderAtlas();});
byId('question-atlas').addEventListener('keydown',event=>{
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
 if(!event.target.classList.contains('atlas-question'))return;event.preventDefault();
 const buttons=[...byId('question-atlas').querySelectorAll('.atlas-question')],index=buttons.indexOf(event.target);if(index<0)return;
 const step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-8,ArrowDown:8}[event.key]||0;
 const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:Math.max(0,Math.min(buttons.length-1,index+step));
 for(const button of byId('question-atlas').querySelectorAll('button'))button.tabIndex=-1;buttons[next].tabIndex=0;buttons[next].focus();
});
byId('atlas-toggle').addEventListener('click',()=>setAtlasOpen(!atlasIsOpen));
byId('atlas-close').addEventListener('click',()=>setAtlasOpen(false,{restoreFocus:true}));
byId('atlas-backdrop').addEventListener('click',()=>setAtlasOpen(false,{restoreFocus:true}));
byId('atlas-panel').addEventListener('keydown',event=>{
 if(!atlasIsOpen)return;
 if(event.key==='Escape'){event.preventDefault();setAtlasOpen(false,{restoreFocus:true});return;}
 if(event.key!=='Tab')return;
 const focusable=[...byId('atlas-panel').querySelectorAll('button:not(:disabled),input,select')].filter(node=>!node.hidden&&node.tabIndex>=0),first=focusable[0],last=focusable.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
drawerMedia.addEventListener('change',()=>setAtlasOpen(false));
byId('empty-review-button').addEventListener('click',()=>navigateReview(question.id,{focus:true}));
byId('reset-learning').addEventListener('click',openResetDialog);
byId('cancel-reset-learning').addEventListener('click',()=>byId('reset-learning-dialog').close());
byId('confirm-reset-learning').addEventListener('click',()=>{
 practiceAnalyticsId=analyticsStore.startSession('practice');
 session=createSession({seed:127031});storagePaused=false;storageError=storageAvailable?'':storageError;
 for(const key of [...activeTabs.keys()])if(key.startsWith('learn:'))activeTabs.delete(key);
 for(const key of [...basicsOpen])if(key.startsWith('learn:'))basicsOpen.delete(key);
 for(const key of [...messages.keys()])if(key.startsWith('learn:'))messages.delete(key);
 persist();byId('reset-learning-dialog').close();
 if(mode==='learn')nextLearningQuestion();else render();
});
for(const button of root.querySelectorAll('button'))if(button.id!=='feedback-save')button.type='button';
render();setAtlasOpen(false);
if(typeof globalThis.DC_PRACTICE_INITIAL_REVIEW==='string'&&bank.questions.some(q=>q.id===globalThis.DC_PRACTICE_INITIAL_REVIEW))navigateReview(globalThis.DC_PRACTICE_INITIAL_REVIEW,{focus:true});
if(collectionAvailable)analyticsClient.start();
window.addEventListener('pagehide',()=>analyticsClient.stop());
window.addEventListener('pageshow',event=>{if(event.persisted&&collectionAvailable)analyticsClient.start();});
window.addEventListener('storage',()=>refreshAnalyticsSurfaces());
