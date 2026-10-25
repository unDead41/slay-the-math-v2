/* Project-level configuration, separate from the temporary game preview. */
(function(){'use strict';
 const $=id=>document.getElementById(id),input=$('collection-url'),status=$('collection-status'),save=$('collection-save'),local=$('collection-local');let revision='',busy=false;
 function message(text,error=false){status.textContent=text;status.dataset.error=String(error);}
 if(document.getElementById('collection')?.hasAttribute('data-collection-static')){for(const el of [input,save,local,$('collection-reload')])el.disabled=true;message('Configure the project connection in the local Developer Hub (npm run start:dev), then rebuild production. Player consent and delivery remain in Learning Report.');return;}
 function lock(value){busy=value;save.disabled=value||!revision;local.disabled=value||!revision;$('collection-reload').disabled=value;}
 async function request(options){const response=await fetch('/__dev/education-collection',{cache:'no-store',...options}),data=await response.json();if(!response.ok)throw Error(data.error||'Collection settings could not be opened.');return data;}
 async function load(){lock(true);try{const data=await request();revision=data.revision;input.value=data.googleScriptUrl;message(data.googleScriptUrl?'Google link saved for future builds. Live delivery is not verified here.':'No Google link is set. Player reports still work on the device.');}catch(error){message(error.message,true);}finally{lock(false);}}
 async function store(value){if(busy||!revision)return;lock(true);try{const data=await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({googleScriptUrl:value,revision})});revision=data.revision;input.value=data.googleScriptUrl;message('Project setting saved. Rebuild the player release, deploy the current Code.gs, then send one real test report. Player consent is still required.');}catch(error){message(error.message,true);}finally{lock(false);}}
 save.addEventListener('click',()=>store(input.value));local.addEventListener('click',()=>store(''));$('collection-reload').addEventListener('click',load);load();
})();
