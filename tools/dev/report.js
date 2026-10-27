(function(root,factory){const api=factory();if(typeof module!=='undefined')module.exports=api;else root.STMDevReport=api;})(globalThis,function(){'use strict';
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function html(details,image=null){if(image!==null&&!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(image))throw Error('Invalid screenshot.');return '<!doctype html><html lang="en"><meta charset="utf-8"><title>Mathematics Slayer bug report</title><style>body{max-width:1100px;margin:30px auto;padding:20px;font:16px system-ui;background:#111827;color:#f5f5f5}img{max-width:100%;height:auto}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><h1>Mathematics Slayer — Dev Report</h1><p>Local export. No automatic upload.</p>'+(image?'<img alt="User-selected screenshot" src="'+image+'">':'<p>No screenshot included.</p>')+'<pre>'+escape(JSON.stringify(details,null,2))+'</pre></html>';}
 async function screenshot(){
  if(!navigator.mediaDevices?.getDisplayMedia)throw Error('Screen capture requires a supported browser on HTTPS or localhost. Use Download Report without Screenshot instead.');
  const stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false,preferCurrentTab:true});let video;
  try{video=document.createElement('video');video.muted=true;video.srcObject=stream;await video.play();await new Promise((ok,no)=>{const timer=setTimeout(()=>no(Error('Screen capture timed out.')),5000);if(video.requestVideoFrameCallback)video.requestVideoFrameCallback(()=>{clearTimeout(timer);ok();});else setTimeout(()=>{clearTimeout(timer);ok();},150);});
   const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;if(!canvas.width||!canvas.height)throw Error('Screen capture is empty.');canvas.getContext('2d').drawImage(video,0,0);return canvas.toDataURL('image/png');
  }finally{stream.getTracks().forEach(track=>track.stop());if(video){video.pause();video.srcObject=null;}}
 }
 return {html,screenshot};
});
