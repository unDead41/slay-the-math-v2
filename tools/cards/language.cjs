/* Presentation policy after current mechanics adapters. Never change effect data. */
'use strict';
const aliases=Object.freeze({'Timbunan Ambilan':'Draw Pile','Timbunan Buangan':'Discard Pile','Habis Guna':'Exhaust','Duri Bara':'Thorns',Blok:'Block',Kekuatan:'Strength',Ketangkasan:'Agility',Kelincahan:'Agility',Pertahanan:'Defense',Fokus:'Focus',Tenaga:'Energy',Pasif:'Passive',Terdedah:'Vulnerable',Lemah:'Weak',Tangan:'Hand',Bertahan:'Defend',Kemahiran:'Skill',Serangan:'Attack'});
const pattern=new RegExp('\\b('+Object.keys(aliases).join('|')+')\\b','g');
function terms(text,names=[]){
 if(typeof text!=='string')return text;
 if(!names.length)return text.replace(pattern,word=>aliases[word]);
 const escaped=names.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length);
 const protectedNames=new Set(names),all=new RegExp('\\b('+[...escaped,...Object.keys(aliases)].join('|')+')\\b','g');
 return text.replace(all,word=>protectedNames.has(word)?word:aliases[word]);
}
function localize(data){
 const current=JSON.parse(JSON.stringify(data));
 const names=current.cards.map(c=>c.display_name.bm);
 const keywords=new Set(['damage','block','draw','strength','agility','defense','energy','focus','vulnerable','weak','thorns','exhaust','discard','draw_pile','hand','attack','defend','skill','passive','hp']);
 for(const [id,entry]of Object.entries(current.glossary)){
  if(keywords.has(id))entry.label.bm=entry.label.en;
  entry.tooltip.bm=terms(entry.tooltip.bm);
 }
 for(const card of current.cards){
  card.text.bm=card.text.bm.map(token=>token.type==='text'?{...token,text:terms(token.text,names)}:token);
  card.mechanic_notes.bm=terms(card.mechanic_notes.bm,names);
  if(card.name==='Ember Core'){
   card.mechanic_notes.en=card.mechanic_notes.en.replace(/Target the main enemy[^.]*\./,'Target the single living enemy.');
   card.mechanic_notes.bm=card.mechanic_notes.bm.replace('Sasar musuh utama jika masih hidup; jika tidak, sasar musuh hidup paling kiri.','Sasar satu musuh yang masih hidup.');
  }
 }
 return current;
}
module.exports=localize;module.exports.terms=terms;module.exports.aliases=aliases;
