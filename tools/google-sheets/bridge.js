/* Runs inside Google's nested HtmlService iframe, not in the game origin. */
(function(config){'use strict';
 let port=null;
 window.addEventListener('message',event=>{
  const data=event.data;if(port||event.source!==window.top||event.origin!==config.parentOrigin||!data||data.type!=='stm-google-connect'||data.protocolVersion!==1||data.channel!==config.channel||event.ports.length!==1)return;
  port=event.ports[0];port.onmessage=event=>{
   const data=event.data;if(!data||data.type!=='stm-google-request'||data.protocolVersion!==1||typeof data.requestId!=='string'||data.requestId.length>100)return;
   const reply=response=>port.postMessage({type:'stm-google-reply',protocolVersion:1,requestId:data.requestId,response});
   try{google.script.run.withSuccessHandler(reply).withFailureHandler(()=>reply({status:503,body:{error:'Google collection is temporarily unavailable.'}})).stmEducationDispatch(data.request);}catch{reply({status:503,body:{error:'Google collection is temporarily unavailable.'}});}
  };port.start();port.postMessage({type:'stm-google-connected',protocolVersion:1});
 });
 window.top.postMessage({type:'stm-google-ready',protocolVersion:1,channel:config.channel},config.parentOrigin);
})(STM_BRIDGE_CONFIG);
