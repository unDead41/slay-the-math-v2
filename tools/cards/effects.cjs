'use strict';
// Build the frozen first revision, then apply only the approved follow-up.
const previous=require('./effects-v1.cjs'),settings=require('./effects.json');
const copy=x=>JSON.parse(JSON.stringify(x));
module.exports=function effects(source,{profile='ordinary'}={}){
 const out=previous(source,{profile}),t=text=>({type:'text',text}),calc=ref=>({type:'calculation',ref}),game=ref=>({type:'game',ref}),card=name=>out.cards.find(c=>c.name===name);
 if(profile==='ordinary'){
  const archive=copy(out);delete archive.legacyEffectsData;
  out.archivedEffectsData={[out.effectsVersion]:archive};
 }
 out.effectsVersion=settings.version;
 const notes=(c,en,bm)=>{c.mechanic_notes={en,bm};c.mechanic_notes_bm=bm;};
 const page=card('Last Page');page.values.draw.base=settings.last_page_draw;page.values.emptyBonus.base=settings.last_page_empty_bonus;
 page.text.en=[game('draw'),t(' '),calc('draw'),t(' cards. If your '),game('hand'),t(' is empty after playing this card, '),game('draw'),t(' '),calc('emptyBonus'),t(' more card.')];
 page.text.bm=[game('draw'),t(' '),calc('draw'),t(' kad. Jika '),game('hand'),t(' kosong selepas kad ini dimainkan, '),game('draw'),t(' '),calc('emptyBonus'),t(' kad lagi.')];
 notes(page,`Costs 1 Energy. Draw ${settings.last_page_draw} cards, plus ${settings.last_page_empty_bonus} if your Hand is empty after playing this card. Focus and upgrade each add one main draw. All draws respect the Hand limit.`,`Kos 1 Tenaga. Ambil ${settings.last_page_draw} kad, tambah ${settings.last_page_empty_bonus} jika Tangan kosong selepas kad ini dimainkan. Fokus dan naik taraf masing-masing menambah satu ambilan utama. Semua ambilan mengikut had Tangan.`);
 const recall=card('Recall');recall.energy={kind:'fixed',amount:settings.recall_energy};
 notes(recall,`Costs ${settings.recall_energy} Energy. Choose one real card from your Discard Pile and return it to your Hand, then Exhaust Recall. The card being played cannot return itself. Focus and upgrade add ordinary draws when space and cards are available.`,`Kos ${settings.recall_energy} Tenaga. Pilih satu kad sebenar dari Timbunan Buangan dan kembalikan ke Tangan, kemudian Habis Guna Recall. Kad yang sedang dimainkan tidak boleh mengambil dirinya sendiri. Fokus dan naik taraf menambah ambilan biasa jika ada ruang dan kad.`);
 const barrier=card('Mana Barrier');if(profile==='ordinary')barrier.values.block.energy_multiplier=settings.ordinary_mana_per_energy;
 const perEnergy=barrier.values.block.energy_multiplier;
 notes(barrier,`Use all remaining Energy, at least 1. Gain ${perEnergy} Block per Energy. Add Agility once. Focus and upgrade add their displayed bonus once, not once per Energy.`,`Guna semua baki Tenaga, sekurang-kurangnya 1. Dapat ${perEnergy} Blok bagi setiap Tenaga. Tambah Kelincahan sekali. Bonus Fokus dan naik taraf ditambah sekali, bukan bagi setiap Tenaga.`);
 return out;
};
