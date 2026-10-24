/* Injected only into sandbox app copies, including production previews. */
{
 const api=window.STMDevApi,F=window.STMDevFixtures;let god=false,freeMap=true;
 const active=()=>god&&window.STMDevMode.get(),health=window.STMDevRuntime.godMode(active);
 for(const [key,original]of Object.entries(E)){if(typeof original!=='function'||['validate','clone','restore','newRun'].includes(key))continue;E[key]=function(...args){return args[0]===run&&run&&active()?health.action(run,()=>original.apply(this,args)):original.apply(this,args);};}
 const baseSnapshot=api.snapshot;api.snapshot=function(){return {...baseSnapshot(),godMode:god,freeMap};};
 api.godMode=function(value){god=!!value;health.protect(run);render();return api.snapshot();};
 api.freeMap=function(value){freeMap=!!value;render();return api.snapshot();};
 api.mapNodes=function(stage=run?.stage||0,seed=7){return F.mapNodes(run||F.create({kind:'map',stage,seed}),stage);};
 api.teleport=function(stage,id,seed=7){return api.loadRun(F.teleport(run||F.create({kind:'map',stage,seed}),stage,id));};
 api.returnMap=function(){if(!run)throw Error('Launch a scene first.');return api.loadRun(F.mapReady(run));};
 api.addCards=function(id,count,upgraded,destination){if(!run)throw Error('Launch a map or combat first.');return api.loadRun(F.addCards(run,id,count,upgraded,destination));};
 api.openEvent=function(id,options){return api.loadRun(F.eventSetup(id,options));};
 const command=api.command;api.command=function(action){if(action==='lose'&&active())throw Error('Turn God Mode OFF before forcing defeat.');return command(action);};
 const baseRender=render;render=function(...args){health.protect(run);const result=baseRender.apply(this,args);if(god&&run&&!ui.home){const tag=document.createElement('p');tag.id='dev-god-status';tag.textContent='DEV GOD MODE · HP loss disabled';tag.style.cssText='position:fixed;top:4px;right:8px;z-index:10000;padding:5px;background:#302b19;color:#ffe49a;font:12px system-ui';document.body.append(tag);}document.querySelectorAll('#dev-god-status').forEach((e,i,a)=>{if(i<a.length-1||!god||!run||ui.home)e.remove();});if(freeMap&&window.STMDevMode.get()&&run?.scene==='map'&&!ui.home)for(const node of document.querySelectorAll('.dungeon-room[data-id]')){node.disabled=false;node.classList.add('available');node.classList.remove('locked');node.dataset.devTeleport='true';node.querySelector('.room-state').textContent='Dev: Enter';node.setAttribute('aria-label',node.getAttribute('aria-label')+' Dev teleport available.');}return result;};
 document.addEventListener('click',event=>{const target=event.target.closest('[data-dev-teleport]');if(!target||!freeMap||!window.STMDevMode.get()||run?.scene!=='map')return;event.preventDefault();event.stopImmediatePropagation();try{api.teleport(run.stage,target.dataset.id);}catch(error){toast(error.message,true);}},true);
}
