/* Sandbox-only HP protection; no engine/save schema changes. */
(function(root,factory){const api=factory();if(typeof module!=='undefined')module.exports=api;else root.STMDevRuntime=api;})(globalThis,function(){'use strict';
 function godMode(enabled){const getters=new WeakMap();
  function protect(run){if(!run||!enabled())return;const d=Object.getOwnPropertyDescriptor(run,'hp');if(getters.has(run)&&d?.get===getters.get(run))return;let hp=run.hp;const get=()=>Math.min(hp,run.maxHp);Object.defineProperty(run,'hp',{enumerable:true,configurable:true,get,set(value){hp=enabled()?Math.min(run.maxHp,Math.max(hp,value)):value;}});getters.set(run,get);}
  function action(run,fn){const before=run.hp;protect(run);try{return fn();}finally{if(enabled()&&run.hp<Math.min(before,run.maxHp))run.hp=Math.min(before,run.maxHp);protect(run);}}
  return {protect,action};
 }
 return {godMode};
});
