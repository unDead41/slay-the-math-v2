'use strict';
// Current runtime correction; preserve the supplier package as historical input.
module.exports=function singleTarget(source){
 const numeric=require('../balance/specs/balance-spec.v1.2.json').cards;
 const out=JSON.parse(JSON.stringify(source)),text=text=>({type:'text',text}),token=(type,ref)=>({type,ref});
 out.singleTargetVersion='single-enemy-1';out.previousCardDefinitions={};
 for(const name of ['Rune Sweep','Fate Storm']){
  const c=out.cards.find(c=>c.name===name);if(!c)throw Error('Missing single-enemy card '+name);
  out.previousCardDefinitions[c.id]=JSON.parse(JSON.stringify(c));
  const spec=numeric.find(s=>s.id===c.id),p=spec.numeric_patch;
  c.energy={kind:'fixed',amount:spec.proposed_energy};c.focus_rule.amount=name==='Rune Sweep'?p.focus_damage_main:p.focus_first_hit;c.runtime_integration_status='integrated';
  c.upgrade={values:{},limits:{},costReduction:0};
  if(name==='Rune Sweep'){
   c.values={damage:{base:p.damage_main,focus_bonus:p.focus_damage_main,stat:'strength'}};c.upgrade.values.damage=p.upgrade_damage_main;
   c.actions=[{op:'damage',value:'damage',target:'selected_enemy'}];
   c.text.en=[text('Deal '),token('calculation','damage'),text(' '),token('game','damage'),text(' to the enemy.')];
   c.text.bm=[text('Beri '),token('calculation','damage'),text(' '),token('game','damage'),text(' kepada musuh.')];
   c.mechanic_notes={en:'One hit on the enemy. Add Strength once. Focus adds 4 damage; upgrade adds 3 damage. Defense and Block reduce the hit normally.',bm:'Satu pukulan kepada musuh. Tambah Kekuatan sekali. Fokus menambah 4 kerosakan; naik taraf menambah 3 kerosakan. Pertahanan dan Blok mengurangkan kerosakan seperti biasa.'};
  }else{
   c.values={first:{base:p.hits[0],focus_bonus:p.focus_first_hit,stat:'strength'},other:{base:p.hits[1],focus_bonus:0},hits:{base:p.hits.length-1,focus_bonus:0}};c.upgrade.values.first=p.upgrade_first_hit;
   c.actions=[{op:'damage',value:'first',target:'selected_enemy'},{op:'damage',value:'other',target:'selected_enemy',repeat:p.hits.length-1}];
   c.text.en=[text('Deal '),token('calculation','first'),text(' '),token('game','damage'),text(', then '),token('calculation','other'),text(' '),token('game','damage'),text(' '),token('calculation','hits'),text(' more times to the same enemy.')];
   c.text.bm=[text('Beri '),token('calculation','first'),text(' '),token('game','damage'),text(', kemudian '),token('calculation','other'),text(' '),token('game','damage'),text(' sebanyak '),token('calculation','hits'),text(' kali lagi kepada musuh yang sama.')];
   c.mechanic_notes={en:'Three hits on the same enemy, without random target selection. Add Strength, the +4 Focus bonus and the +3 upgrade bonus to the first hit only. Each hit uses Defense, Block, Weak, Vulnerable and boss seals normally. Stop when the enemy dies.',bm:'Tiga pukulan kepada musuh yang sama tanpa memilih sasaran rawak. Tambah Kekuatan, bonus Fokus +4 dan bonus naik taraf +3 pada pukulan pertama sahaja. Setiap pukulan menggunakan Pertahanan, Blok, Lemah, Terdedah dan meterai bos seperti biasa. Berhenti apabila musuh tewas.'};
  }
  c.mechanic_notes_bm=c.mechanic_notes.bm;
 }
 out.design_defaults.enemy_model='One living enemy per battle; every enemy-directed card effect targets that enemy.';
 out.glossary.damage.tooltip={en:'Damage is reduced by Defense first, then Block. Focus adds the printed bonus once to the first hit.',bm:'Kerosakan dikurangkan oleh Pertahanan dahulu, kemudian Blok. Fokus menambah bonus yang dinyatakan sekali pada pukulan pertama.'};
 out.glossary.strength.tooltip={en:'Strength increases Attack damage. Fate Storm adds it once on the first hit; other cards follow their listed effects.',bm:'Kekuatan menambah kerosakan Serangan. Fate Storm menambahnya sekali pada pukulan pertama; kad lain mengikut kesan yang dinyatakan.'};
 if(out.glossary.random){out.glossary.random.tooltip.en='An outcome is selected by chance. Battles have one enemy; attacks do not choose a random target.';out.glossary.random.tooltip.bm='Kesudahan dipilih secara rawak. Pertarungan mempunyai satu musuh; serangan tidak memilih sasaran secara rawak.';}
 return out;
};
