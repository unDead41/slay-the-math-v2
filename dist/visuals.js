/* Pose registry: visual-only. All combat outcomes remain owned by engine.js. */
(function(root){
  'use strict';
  const C = root.DCConfig;
  const mapIcons = {battle:'map-battle.webp',elite:'map-elite.webp',boss:'map-boss.webp',
    shop:'map-shop.webp',camp:'map-camp.webp',event:'map-event.webp',...root.DCIconAssets?.map};
  const enemies = {};
  for(const [id,stem] of Object.entries({wisp:'ember_mirror',beetle:'prism_guard',
    bat:'rune_bat',knight:'mirror_knight',shard:'polished_shard_beast'})) {
    enemies[id]=Object.fromEntries(['standing','attack','defend','skill','damage']
      .map(pose=>[pose,'ground-'+stem+'-'+pose+'.webp']));
  }
  function enemy(id, pose='standing', stage=0) {
    const actor=root.DCAnimationData?.actors[id],action=pose==='standing'?'idle':pose==='damage'?'damaged':pose;
    if(actor?.stage===stage&&actor.posters)return actor.posters[action]||actor.posters.idle;
    return enemies[id]?.[pose] || enemies[id]?.standing || 'ground-'+C.enemies[id].art;
  }
  function hero(pose='idle') {
    const action=pose==='standing'?'idle':pose==='damage'?'damaged':pose;
    const posters=root.DCAnimationData.hero.posters;
    return posters[action]||posters.idle;
  }
  root.DCVisuals = {mapIcons, enemy, hero,
    icons:{focus:'ui-focus.webp',predict:'ui-predict.png',rest:mapIcons.camp,settings:'ui-settings.webp',book:'ui-tutorial.webp',
      cards:'ui-card_collection.webp',bolt:'ui-energy.webp',heart:'ui-health.webp',
      coin:'ui-money.webp',close:'ui-close.webp',hand:'ui-on_hand.webp',
      drawPile:'ui-draw_pile.webp',discard:'ui-discard.webp',exhaust:'ui-exhaust.webp',...root.DCIconAssets?.ui},
    floatingEnemies:['wisp','bat','weaver'],
    scale:{hero:1,wisp:.64,beetle:.76,knight:.91,shard:.70,bat:.61,
      sentinel:1.04,dealer:1.02,weaver:.82,shade:.82,mimic:.61,golem:.86,reaper:.95},
    arena:(stage,kind='normal')=>'arena-'+kind+'-'+(stage+1)+'.webp',
    menuScenes:[{id:'corridor',label:'Dungeon Corridor',art:'menu-corridor.webp'},
      {id:'campfire',label:'By the Campfire',art:'menu-campfire.webp'},
      {id:'archive',label:'Rune Archive',art:'menu-archive.webp'},
      {id:'map',label:'A Path Ahead',art:'menu-map.webp'},
      {id:'door',label:'The Dungeon Door',art:'menu-door.webp'}],
    situationScenes:{shop:{art:'situation-shop.webp'},camp:{art:'situation-rest.webp'},
      reward:{art:'situation-reward.webp'},stageclear:{art:'situation-reward.webp'},
      victory:{art:'situation-reward.webp'},defeat:{art:'situation-defeat.webp'}},
    portrait:'alyssa-front.webp', timing:{pose:760,guard:330,menu:5000,menuFade:5000}, enemyPoseSheets:enemies};
})(window);
