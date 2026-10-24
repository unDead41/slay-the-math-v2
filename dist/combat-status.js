/* Read-only combat badge descriptions. The engine owns every value and expiry. */
(function(root){'use strict';
 const data=typeof module!=='undefined'&&module.exports?require('./card-data.js'):root.STMCardData;
 const CC=typeof module!=='undefined'&&module.exports?require('./card-combat.js'):root.DCCardCombat;
 const C=typeof module!=='undefined'&&module.exports?require('./config.js'):root.DCConfig;
 const icons=(typeof module!=='undefined'&&module.exports?require('./icon-assets.js'):root.DCIconAssets)?.status||Object.freeze({strength:'assets/status-strength.svg',agility:'assets/status-agility.svg',defense:'assets/status-defense.svg',block:'assets/status-block.svg',weak:'assets/status-weak.svg',vulnerable:'assets/status-vulnerable.svg',thorns:'assets/status-thorns.svg','next-draw':'assets/status-next-draw.svg','next-block':'assets/status-next-block.svg','retain-block':'assets/status-retain-block.svg'});
 const number=n=>Number.isSafeInteger(n),positive=n=>number(n)&&n>0;
 const plural=(n,one,many)=>n===1?one:many;
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
  const bm=/^(bm|ms)(-|$)/i.test(lang);
  const add=(id,label,value,kind,description)=>{
   if(bm&&rules.effectsVersion){
    if(id==='weak'){label='Lemah';description=value+' fasa serangan berbaki. Setiap pukulan Serangan memberi '+rules.status_definitions.weak.reduction_percent+'% kurang kerosakan. Satu tempoh tamat selepas fasa '+(player?'pemain':'musuh')+'. Gabung dengan Terdedah dan bundar ke bawah sekali.';}
    if(id==='vulnerable'){label='Terdedah';description=value+' fasa serangan berbaki. Setiap pukulan Serangan yang diterima memberi '+rules.status_definitions.vulnerable.bonus_percent+'% lebih kerosakan. Satu tempoh tamat selepas fasa '+(player?'musuh':'pemain')+'. Tindanan menambah tempoh, bukan peratus.';}
    if(id==='retain-block'){label='Simpan Blok';description='Simpan sehingga '+value+' baki Blok pada awal giliran berikutnya. '+(s?.emberCarry?'Bara Terakhir: '+s.emberCarry+' baki Blok kecemasan disimpan sekali. ':'')+'Gunakan had tertinggi, bukan jumlah had. Blok yang telah digunakan tidak diberi semula.';}
   }
   if(number(value)&&value!==0)out.push({id,label,value,kind,icon:icons[id],description});
  };
  if(player){
   if(number(b.strength)&&b.strength!==0)add('strength','Strength',b.strength,b.strength>0?'buff':'debuff','Attack hits deal '+Math.abs(b.strength)+' '+(b.strength>0?'extra':'less')+' damage. Lasts this combat.');
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
 const api={view};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DCCombatStatus=api;
})(typeof window!=='undefined'?window:globalThis);
