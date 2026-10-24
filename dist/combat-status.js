/* Read-only combat badge descriptions. The engine owns every value and expiry. */
(function(root){'use strict';
 const data=typeof module!=='undefined'&&module.exports?require('./card-data.js'):root.STMCardData;
 const CC=typeof module!=='undefined'&&module.exports?require('./card-combat.js'):root.DCCardCombat;
 const C=typeof module!=='undefined'&&module.exports?require('./config.js'):root.DCConfig;
 const icons=(typeof module!=='undefined'&&module.exports?require('./icon-assets.js'):root.DCIconAssets)?.status||Object.freeze({strength:'assets/status-strength.svg',agility:'assets/status-agility.svg',defense:'assets/status-defense.svg',block:'assets/status-block.svg',weak:'assets/status-weak.svg',vulnerable:'assets/status-vulnerable.svg',thorns:'assets/status-thorns.svg','next-draw':'assets/status-next-draw.svg','next-block':'assets/status-next-block.svg','retain-block':'assets/status-retain-block.svg'});
 const number=n=>Number.isSafeInteger(n),positive=n=>number(n)&&n>0;
 const plural=(n,one,many)=>n===1?one:many;
 const names=Object.freeze({strength:['Strength','Kekuatan'],agility:['Agility','Ketangkasan'],defense:['Defense','Pertahanan'],block:['Block','Blok'],weak:['Weak','Lemah'],vulnerable:['Vulnerable','Terdedah'],thorns:['Thorns','Duri'],'next-draw':['Next Draw','Tarikan Seterusnya'],'next-block':['Next Block','Blok Seterusnya'],'retain-block':['Retain Block','Simpan Blok']});
 const words=Object.freeze({all:['All statuses','Semua status'],title:['Statuses','Status'],help:['Compare every active status here. Select one for its exact effect and duration.','Bandingkan semua status di sini. Pilih satu untuk melihat kesan dan tempohnya.'],empty:['No active statuses.','Tiada status aktif.'],buff:['Buff','Kesan baik'],debuff:['Debuff','Kesan buruk'],queued:['Next turn','Giliran berikutnya'],close:['Close status panel','Tutup panel status'],size:['Status display size','Saiz paparan status'],normal:['Normal','Biasa'],large:['Large','Besar'],sizeHelp:['Changes status pictures and labels. Your cards and arena keep their size.','Mengubah saiz gambar dan label status. Saiz kad dan arena dikekalkan.']});
 const isBM=lang=>/^(bm|ms)(-|$)/i.test(lang);
 function name(id,lang='en'){return names[id]?.[isBM(lang)?1:0]||id;}
 function text(key,lang='en'){return words[key]?.[isBM(lang)?1:0]||key;}
 function presentation(id,value,who,rules,run,lang){
  const bm=isBM(lang),b=run.battle,s=b.cardCombat,player=who==='player',n=Math.abs(value),sign=value>0?'+':'−',turn=b.turn+1,select=(en,ms)=>bm?ms:en;
  let measure='',summary='',timing=select('This combat','Pertarungan ini'),descriptionMS='';
  if(id==='strength'){measure=select('Attack damage','Kerosakan Serangan');summary=sign+n+' '+measure;descriptionMS=(value>0?'Tambah ':'Kurangkan ')+n+' kerosakan pada pukulan Serangan yang menggunakan Kekuatan. Pratonton kad menunjukkan kerosakan sebenar setiap pukulan. Kekal sepanjang pertarungan ini.';}
  if(id==='agility'){measure=select('Block per Defend','Blok setiap Pertahanan');summary=sign+n+' '+measure;descriptionMS='Kad Pertahanan memberi '+n+' Blok '+(value>0?'tambahan':'lebih sedikit')+'. Kekal sepanjang pertarungan ini.';}
  if(id==='defense'){measure=select('Damage per hit','Kerosakan setiap pukulan');summary=select('Reduce incoming damage by ','Kurangkan kerosakan diterima sebanyak ')+value;descriptionMS='Kurangkan '+value+' kerosakan Serangan setiap pukulan sebelum Blok digunakan. Kekal sepanjang pertarungan ini.';}
  if(id==='block'){measure=select('Damage absorbed','Kerosakan diserap');summary=select('Absorb up to ','Serap sehingga ')+value+select(' damage',' kerosakan');timing=select(player?'Until your next turn':'Replaced by next intent',player?'Sehingga giliran anda berikutnya':'Diganti oleh niat berikutnya');descriptionMS='Serap sehingga '+value+' kerosakan sebelum HP berkurang. Blok yang digunakan akan hilang. '+(player?'Baki Blok tamat pada awal giliran anda berikutnya, kecuali Blok yang disimpan.':'Blok musuh diganti mengikut niat giliran berikutnya.');}
  if(id==='weak'||id==='vulnerable'){
   const weak=id==='weak',st=s?.statuses?.[player?'self':'enemy']||{};
   if(rules.effectsVersion){const percent=weak?rules.status_definitions.weak.reduction_percent:rules.status_definitions.vulnerable.bonus_percent;measure=select(value+' attack '+plural(value,'phase','phases'),value+' fasa serangan');summary=(weak?'−':'+')+percent+'% '+select(weak?'outgoing Attack damage':'incoming Attack damage',weak?'kerosakan Serangan diberi':'kerosakan Serangan diterima');timing=select('One duration ends after the '+(weak?(player?'player':'enemy'):(player?'enemy':'player'))+' attack phase','Satu tempoh tamat selepas fasa serangan '+(weak?(player?'pemain':'musuh'):(player?'musuh':'pemain')));descriptionMS=value+' fasa serangan berbaki. '+(weak?'Setiap pukulan Serangan memberi '+percent+'% kurang kerosakan.':'Setiap pukulan Serangan yang diterima memberi '+percent+'% lebih kerosakan.')+' '+timing+'. Tindanan menambah tempoh, bukan peratus. Gabung Lemah dan Terdedah, kemudian bundar ke bawah sekali.';}
   else{const amount=rules.status_definitions[id].amount_per_hit;measure=select(value+' '+plural(value,'stack','stacks'),value+' tindanan');summary=(weak?'−':'+')+amount+' '+select(weak?'outgoing damage per hit':'incoming damage per hit',weak?'kerosakan diberi setiap pukulan':'kerosakan diterima setiap pukulan');timing=select('One stack used per Attack hit','Satu tindanan digunakan setiap pukulan Serangan');descriptionMS=value+' tindanan. Setiap pukulan Serangan '+(weak?'memberi '+amount+' kurang kerosakan, sehingga minimum 0':'yang diterima memberi '+amount+' kerosakan tambahan')+' dan menggunakan satu tindanan.'+(positive(st[id+'Until'])?' Baki tindanan tamat '+(player?'sebelum':'selepas')+' fasa musuh pada giliran '+st[id+'Until']+'.':'');}
  }
  if(id==='thorns'){measure=select('Return damage per hit','Kerosakan balas setiap pukulan');summary=select('Return ','Balas ')+value+select(' damage when hit',' kerosakan apabila diserang');timing=select('Ends after the next enemy phase','Tamat selepas fasa musuh berikutnya');descriptionMS='Selagi anda hidup, setiap pukulan Serangan musuh dibalas dengan '+value+' kerosakan HP tetap, termasuk pukulan yang diserap sepenuhnya. Abaikan Pertahanan dan Blok musuh. Boss yang masih bermeterai kekal sekurang-kurangnya 1 HP. '+timing+'.';}
  if(id==='next-draw'){measure=select(value+' extra '+plural(value,'card','cards'),value+' kad tambahan');summary=select('Draw ','Tarik ')+measure;timing=select('Start of turn ','Awal giliran ')+turn;descriptionMS='Tarik '+value+' kad tambahan pada giliran '+turn+', selepas tarikan biasa. Tarikan berhenti apabila Tangan mencapai '+C.HAND_LIMIT+' kad atau tiada kad berbaki. Kesan ini berlaku sekali sahaja.';}
  if(id==='next-block'){measure=value+' '+select('Block to gain','Blok akan diterima');summary=select('Gain ','Dapat ')+value+' '+select('Block','Blok');timing=select('Start of turn ','Awal giliran ')+turn;descriptionMS='Dapat '+value+' Blok pada awal giliran '+turn+', selepas Blok disimpan. Ketangkasan sudah termasuk dalam nilai ini. Kesan ini berlaku sekali sahaja.';}
  if(id==='retain-block'){measure=select('Cap: ','Had: ')+value+' '+select('Block','Blok');summary=select('Keep up to ','Simpan sehingga ')+value+' '+select('unused Block','baki Blok');timing=select('Start of turn ','Awal giliran ')+turn;descriptionMS='Simpan sehingga '+value+' baki Blok pada awal giliran '+turn+'. '+(s?.emberCarry?'Bara Terakhir menyimpan '+s.emberCarry+' baki Blok kecemasan sekali sahaja. ':'')+'Ini ialah had simpanan, bukan Blok tambahan. Gunakan had tertinggi, bukan jumlah had. Blok yang telah digunakan tidak diberi semula.';}
  let inlineMeasure={strength:select('Attack damage','Kerosakan'),agility:select('Block / Defend','Blok'),defense:select('Per hit','Setiap pukulan'),block:select('Damage absorbed','Kerosakan diserap'),thorns:select('Return damage','Kerosakan balas'),'next-draw':select(value+' '+plural(value,'card','cards'),value+' kad'),'next-block':value+' '+select('Block','Blok'),'retain-block':select('Cap: ','Had: ')+value,weak:rules.effectsVersion?select(value+' '+plural(value,'phase','phases'),value+' fasa'):select(value+' '+plural(value,'stack','stacks'),value+' tindanan'),vulnerable:rules.effectsVersion?select(value+' '+plural(value,'phase','phases'),value+' fasa'):select(value+' '+plural(value,'stack','stacks'),value+' tindanan')}[id]||measure;
  if(id==='weak'||id==='vulnerable'){const weak=id==='weak',effect=rules.status_definitions[id];inlineMeasure=(weak?'−':'+')+(rules.effectsVersion?(weak?effect.reduction_percent:effect.bonus_percent)+'%':effect.amount_per_hit+'/'+select('hit','pukulan'))+' · '+inlineMeasure;}
  return {measure,inlineMeasure,summary,timing,descriptionMS};
 }
 function expiry(status,id,who){
  const until=status[id+'Until'];
  if(!positive(until))return '';
  return ' Remaining stacks expire '+(who==='player'?'before':'after')+' the enemy phase of turn '+until+'.';
 }
 function sumQueue(queue,kind,turn){
  let total=0;
  for(const q of Array.isArray(queue)?queue:[])if(q&&q.kind===kind&&q.turn===turn&&positive(q.value)&&number(total+q.value))total+=q.value;
  return total;
 }
 function view(run,who,lang='en'){
  const b=run?.battle;
  if(!b||!['player','enemy'].includes(who))return [];
  const rules=CC?.definitionData(run)||data;
  const out=[],player=who==='player',s=b.cardCombat,status=s?.statuses?.[player?'self':'enemy']||{};
  const bm=isBM(lang);
  const add=(id,label,value,kind,description)=>{
   if(!number(value)||value===0)return;
   const p=presentation(id,value,who,rules,run,lang);
   out.push({id,label:name(id,lang),value,kind,icon:icons[id],description:bm?p.descriptionMS:description,measure:p.measure,inlineMeasure:p.inlineMeasure,summary:p.summary,timing:p.timing});
  };
  if(player){
   if(number(b.strength)&&b.strength!==0)add('strength','Strength',b.strength,b.strength>0?'buff':'debuff','Attack cards deal '+Math.abs(b.strength)+' '+(b.strength>0?'extra':'less')+' damage on hits that use Strength. The card preview shows the final damage for each hit. Lasts this combat.');
   if(number(b.agility)&&b.agility!==0)add('agility','Agility',b.agility,b.agility>0?'buff':'debuff','Defend cards grant '+Math.abs(b.agility)+' '+(b.agility>0?'extra':'less')+' Block. Lasts this combat.');
  }
  const defense=player?b.defense:b.enemyDefense,block=player?b.block:b.enemyBlock;
  if(positive(defense))add('defense','Defense',defense,'buff','Reduce incoming Attack damage by '+defense+' per hit before Block. Lasts this combat.');
  if(positive(block))add('block','Block',block,'buff','Absorb up to '+block+' incoming damage before HP is lost. Spent Block is removed.'+(player?' Unspent Block resets at your next turn start, except for retained Block.':' Enemy Block is replaced by the next turn\'s intent.'));
  if(positive(status.weak))add('weak','Weak',status.weak,'debuff',rules.effectsVersion?status.weak+' attack '+plural(status.weak,'phase','phases')+' remaining. Every outgoing Attack hit deals '+rules.status_definitions.weak.reduction_percent+'% less damage. One duration ends after the '+(player?'player':'enemy')+' attack phase; combine with Vulnerable and round down once.':status.weak+' '+plural(status.weak,'stack','stacks')+'. Each outgoing Attack hit deals '+rules.status_definitions.weak.amount_per_hit+' less damage, down to 0, and uses 1 stack.'+expiry(status,'weak',who));
  if(positive(status.vulnerable))add('vulnerable','Vulnerable',status.vulnerable,'debuff',rules.effectsVersion?status.vulnerable+' attack '+plural(status.vulnerable,'phase','phases')+' remaining. Every incoming Attack hit deals '+rules.status_definitions.vulnerable.bonus_percent+'% more damage. One duration ends after the '+(player?'enemy':'player')+' attack phase; stacks extend duration, not percentage.':status.vulnerable+' '+plural(status.vulnerable,'stack','stacks')+'. Each incoming Attack hit deals '+rules.status_definitions.vulnerable.amount_per_hit+' extra damage and uses 1 stack.'+expiry(status,'vulnerable',who));
  if(player){
   const thorns=s?.statuses?.thorns;
   if(positive(thorns))add('thorns','Thorns',thorns,'buff','While you survive, each enemy Attack hit returns '+thorns+' fixed HP damage, even when fully blocked. Ignores enemy Defense and Block; a sealed boss stays at 1 HP or more. Ends after the next enemy phase.');
   if(number(b.turn)&&b.turn>=0&&number(b.turn+1)){
    const turn=b.turn+1,draw=sumQueue(s?.queue,'draw',turn),laterBlock=sumQueue(s?.queue,'block',turn);
    if(positive(draw))add('next-draw','Next Draw',draw,'queued','Draw '+draw+' extra '+plural(draw,'card','cards')+' on turn '+turn+', after the normal draw. Draws stop at the '+C.HAND_LIMIT+'-card Hand limit or when no cards remain. This queued grant happens once.');
    if(positive(laterBlock))add('next-block','Next Block',laterBlock,'queued','Gain '+laterBlock+' Block at the start of turn '+turn+', after Block retention. Agility is already included in this saved amount. This queued grant happens once.');
    const carry=Math.max(s?.carry||0,s?.emberCarry||0);if(positive(carry))add('retain-block','Retain Block',carry,'queued','Keep up to '+carry+' unspent Block at the start of turn '+turn+'. '+(s?.emberCarry?'Last Ember: '+s.emberCarry+' unused emergency Block survives this reset once. ':'')+'This is a retention cap, not extra Block. Multiple retention effects use the highest cap; it clears after the next turn start.');
   }
  }
  return out;
 }
 const api={view,name,text};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DCCombatStatus=api;
})(typeof window!=='undefined'?window:globalThis);
