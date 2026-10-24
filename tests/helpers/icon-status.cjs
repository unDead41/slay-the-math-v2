/* Real engine fixture for the complete status comparison surface. */
const E=require('../../dist/engine.js'),data=require('../../dist/card-data.js'),F=require('../../tools/dev/fixtures.js');
module.exports=function statusFixture(){
 const r=F.create({kind:'combat',enemy:'sentinel',intent:1,focus:2,deck:data.cards.map(c=>c.id)});
 function hand(name){const b=r.battle,pool=[...b.hand,...b.draw,...b.discard],key=data.cards.find(c=>c.name===name).id,index=pool.findIndex(c=>c.key===key);if(index<0)throw Error('Missing fixture card '+name);b.hand=[pool.splice(index,1)[0]];b.draw=pool;b.discard=[];b.energy=3;return b.hand[0].uid;}
 for(const name of ['Blazing Spirit','Swift Step','Rune Armor','Ember Wall','Layered Shield','Next Chapter','Hold the Line','Weak Point'])E.playCard(r,hand(name));
 const b=r.battle;Object.assign(b.cardCombat.statuses.self,{weak:2,weakUntil:b.turn+1,vulnerable:2,vulnerableUntil:b.turn+1});b.seals=1;hand('Rune Strike');
 if(!E.validate(r))throw Error('Invalid complete status fixture');return r;
};
