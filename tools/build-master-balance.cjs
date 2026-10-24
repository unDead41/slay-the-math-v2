'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function build(root=path.resolve(__dirname,'..')){
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 const candidate=require(path.join(root,'tools/balance/candidate.cjs')),settings=read('tools/balance/master/config.json');
 const profiles=Object.fromEntries(Object.entries(candidate.spec.profiles).map(([k,v])=>[k,{...v,...settings.profileOverrides[k]}]));
 const ordinary=require(path.join(root,'dist/card-data.js'));let cards=candidate.cards(ordinary.legacyEffectsData||ordinary);const artifacts=candidate.artifacts(require(path.join(root,'dist/artifact-data.js')));
 for(const a of artifacts.artifacts)Object.assign(a.values,settings.economicArtifacts[a.id.slice(0,3)]||{});
 const descriptions={
  s01:v=>`After winning a combat, heal ${v.heal} HP.`,s02:v=>`Your first Attack each turn deals +${v.damage_bonus_per_card} damage on its first hit.`,
  s03:v=>`Your first Defend each turn gives +${v.block_bonus} Block.`,s04:v=>`Start each combat with ${v.focus} Focus, capped at 3.`,
  s05:v=>`Draw ${v.draw} extra card on the first turn of each combat.`,s06:v=>`Shop purchases cost ${v.discount_percent}% less. Only the highest discount applies; round up once.`,
  s07:v=>`Start each combat with ${v.block} Block.`,s08:v=>`Gain ${v.max_hp} Max HP and heal ${v.heal} HP once when claimed.`,s09:v=>`Gain ${v.gold} Gold once when claimed.`,
  s10:v=>`After your first Skill each combat, draw ${v.draw} card.`,s11:v=>`The first time your card enters Exhaust each combat, gain ${v.block} Block.`,s12:v=>`After your first Passive each combat, gain ${v.block} Block.`,
  e01:v=>`After playing ${v.cards_required} cards in a turn, gain ${v.energy} Energy. Once per turn.`,e02:v=>`Play an Attack and a Defend in the same turn to gain ${v.block} Block. Once per turn.`,
  e03:v=>`Roll a d6 once after your opening hand: 1–2 gain ${v.faces_1_2.block} Block; 3–4 draw ${v.faces_3_4.draw}; 5–6 gain ${v.faces_5_6.energy} Energy.`,
  e04:v=>`End your turn with at least ${v.min_unspent_energy} Energy to gain ${v.block} Block.`,e05:v=>`The first time your card enters Exhaust each turn, draw ${v.draw} card and gain ${v.block} Block.`,
  e06:v=>`After winning a combat, heal ${v.heal} HP.`,e07:v=>`Your first Attack each turn deals +${v.damage_bonus_per_card} damage on its first hit.`,e08:v=>`Your first Defend each turn gives +${v.block_bonus} Block.`,
  e09:v=>`Use positive Block to fully block a positive enemy attack and retaliate for ${v.retaliation_damage} damage. Once per turn.`,e10:v=>`After your first Skill each turn, draw ${v.draw} card.`,
  e11:v=>`Draw ${v.draw} extra cards on the first turn of each combat.`,e12:v=>`While alive, the first time you reach ${v.hp_threshold_percent}% HP or less each combat, gain ${v.block} Block.`,
  e13:v=>`The first time a card effect discards from your hand each turn, draw ${v.draw} card and gain ${v.block} Block.`,e14:v=>`Shop purchases cost ${v.discount_percent}% less. Only the highest discount applies; round up once.`,
  e15:v=>`Start each combat with ${v.strength} Strength. Apply it once per Attack, on its first hit.`,e16:v=>`Start each combat with ${v.agility} Agility. Apply it once per Defend, on its first immediate Block.`,
  b01:v=>`Gain ${v.energy} extra Energy at the start of every turn.`,b02:v=>`Start combat with ${v.initial_strength} Strength and ${v.initial_agility} Agility. Gain +${v.strength_per_later_turn} Strength and +${v.agility_per_later_turn} Agility each later turn, up to ${v.max_artifact_contribution_each_stat} of each from this artifact.`,b03:v=>`Draw ${v.draw} extra cards at the start of every turn.`
 };
 for(const a of artifacts.artifacts)a.text=descriptions[a.id.slice(0,3)](a.values);
 // The supplier text is preserved in the legacy data. Candidate timing must
 // describe the actions actually resolved by the candidate, in both languages.
 const token=(type,ref)=>({type,ref}),txt=text=>({type:'text',text});
 const mana=cards.cards.find(c=>c.name==='Mana Reading');
 mana.text.en=[txt('Draw '),token('calculation','draw'),txt(' cards now; draw '),token('calculation','laterDraw'),txt(' next turn. '),token('game','exhaust'),txt('.')];
 mana.text.bm=[txt('Ambil '),token('calculation','draw'),txt(' kad sekarang; ambil '),token('calculation','laterDraw'),txt(' pada giliran berikutnya. '),token('game','exhaust'),txt('.')];
 const deep=cards.cards.find(c=>c.name==='Deep Study');
 for(const lang of ['en','bm'])deep.text[lang].push(txt(' '),token('game','exhaust'),txt('.'));
 if(cards.glossary.strength){cards.glossary.strength.tooltip.en='Adds Strength once per Attack card, to its first damage hit.';cards.glossary.strength.tooltip.bm='Tambah Kekuatan sekali bagi setiap kad Serang, pada hit damage pertama.';}
 if(cards.glossary.agility){cards.glossary.agility.tooltip.en='Adds Agility once per Defend card, to its first immediate Block grant.';cards.glossary.agility.tooltip.bm='Tambah Ketangkasan sekali bagi setiap kad Bertahan, pada pemberian Blok segera pertama.';}
 cards=require('./cards/effects.cjs')(cards,{profile:'master'});
 const body={...settings,profiles,enemies:candidate.spec.enemies,cards,artifacts};
 body.definitionHash=crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
 fs.writeFileSync(path.join(root,'dist/balance-data.js'),'/* Generated by tools/build-master-balance.cjs. Explicit opt-in candidate. */\n(function(root){const data='+JSON.stringify(body)+';if(typeof module!==\'undefined\')module.exports=data;else root.STMBalanceData=data;})(globalThis);\n');
 return body;
}
if(require.main===module)build();module.exports=build;
