/* One versioned definition binding, shared by the browser and Node replay. */
(function(root){'use strict';
const D=typeof module!=='undefined'?require('./balance-data.js'):root.STMBalanceData;
const clone=x=>JSON.parse(JSON.stringify(x));
function create(difficulty){
 if(!Object.hasOwn(D.profiles,difficulty))throw Error('Unknown Master difficulty.');
 const profile=clone(D.profiles[difficulty]),identity={version:D.version,difficulty,definitionHash:D.definitionHash};
 return {
  identity,profile,saveKey:'duel-cube-math.'+D.version+'.'+difficulty,
  cardData:()=>clone(D.cards),artifactData:()=>clone(D.artifacts),
  richTextData(data){
   const out=clone(data),terms=Object.entries(out.glossary).map(([id,v])=>({id,label:v.label})).filter(v=>v.label).sort((a,b)=>b.label.length-a.label.length);
   for(const a of D.artifacts.artifacts){const segments=[];let text=a.text;
    while(text){const matches=terms.map(t=>({...t,index:text.indexOf(t.label)})).filter(t=>t.index>=0).sort((a,b)=>a.index-b.index||b.label.length-a.label.length),m=matches[0];
     if(!m){segments.push({type:'text',text});break;}if(m.index)segments.push({type:'text',text:text.slice(0,m.index)});segments.push({type:'term',glossary_id:m.id,text:m.label,category:out.glossary[m.id].category});text=text.slice(m.index+m.label.length);
    }
    out.artifacts[a.id]={...out.artifacts[a.id],segments};
   }
   return out;
  },
  economyData(data){const out=clone(data);out.profiles=clone(D.profiles);out.combatInput=D.version;return out;},
  configure(C){
   C.MAX_HP=profile.starting_max_hp;C.MASTER_BALANCE=clone(identity);
   C.COMBAT_BALANCE={...identity,profile:clone(profile),brooch_requires_block:true};
   for(const e of D.enemies){const old=C.enemies[e.id];old.hp=e.hp;old.defense=e.defense;old.balanceTier=e.tier;
    old.patterns=e.patterns.map((p,i)=>({damage:p.damage_per_hit,block:p.block,hits:p.hits,label:old.patterns[i]?.label||'Intent '+(i+1)}));
   }
   return C;
  }
 };
}
if(typeof module!=='undefined')module.exports={create};
else{
 const difficulty=new URLSearchParams(root.location.search).get('balance');
 root.STMBalance=Object.hasOwn(D.profiles,difficulty)?create(difficulty):null;
 if(root.STMBalance)root.STMCardData=root.STMBalance.cardData();
}
})(typeof window!=='undefined'?window:globalThis);
