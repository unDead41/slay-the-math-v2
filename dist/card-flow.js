/* Ephemeral observation only. No callbacks, timers, RNG or save fields. */
(function(root){'use strict';
 const sessions=new WeakMap();
 function begin(run){if(!run||typeof run!=='object')return null;const token={run,moves:[],parent:null};sessions.set(run,token);return token;}
 function fork(parentRun,childRun){const parent=sessions.get(parentRun);if(!parent)return null;const token=begin(childRun);token.parent=parent;return token;}
 function move(run,card,from,to,revealed=false){const token=sessions.get(run);if(!token||!card)return;token.moves.push({card:{uid:card.uid,key:card.key,upgraded:!!card.upgraded},from,to,revealed:!!revealed});}
 function end(token,commit=true){
  if(!token||sessions.get(token.run)!==token)return [];
  sessions.delete(token.run);const moves=commit?token.moves:[];
  if(commit&&token.parent&&sessions.get(token.parent.run)===token.parent)token.parent.moves.push(...moves);
  return moves;
 }
 const api={begin,fork,move,end};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DCCardFlow=api;
})(typeof window!=='undefined'?window:globalThis);
