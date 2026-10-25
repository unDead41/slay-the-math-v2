/* Packaged help and a permission-gated transport boundary; no provider/key/backend. */
(function(root){'use strict';
const faq=[
 {id:'block',match:/\bblock\b|perlindungan/i,en:'Block protects you against incoming damage. Read the current value and open the status details for its effect and duration.',ms:'Block melindungi anda daripada damage yang diterima. Semak nilainya dan buka butiran status untuk melihat kesan serta tempohnya.'},
 {id:'focus',match:/\bfocus\b|fokus/i,en:'Check the Focus preview before playing an eligible card. Passive cards do not use Focus. The Tutorial shows how to practise.',ms:'Semak paparan Focus sebelum memainkan kad yang layak. Kad Passive tidak menggunakan Focus. Cuba langkahnya dalam Tutorial.'},
 {id:'predict',match:/predict|hint|petunjuk|soalan|question|probab|kebarangkalian|logic|logik|\bset\b/i,en:'Use the question and its given information. When Hint is available, read it first. Tutorial and Education Practice provide local help and worked steps; this FAQ does not reveal an active answer.',ms:'Baca soalan dan maklumat yang diberi. Apabila Hint tersedia, baca dahulu. Tutorial dan Latihan Pembelajaran menyediakan bantuan serta langkah jawapan. FAQ ini tidak mendedahkan jawapan soalan yang sedang dijawab.'},
 {id:'card',match:/card|kad|energy|hand|attack|defend|skill|passive/i,en:'Read the card preview, its Energy cost and the enemy intent before playing. Open Tutorial for a safe example that does not change your run.',ms:'Baca paparan kad, kos Energy dan tindakan musuh sebelum bermain. Buka Tutorial untuk contoh yang tidak mengubah permainan anda.'},
 {id:'offline',match:/offline|online|internet|download|muat turun|sambungan/i,en:'Choose the play mode in Settings. Offline is ready only after every required file is saved and verified. Local FAQ works offline; free chat through an API requires internet and an explicit Online choice.',ms:'Pilih mod permainan dalam Tetapan. Offline sedia selepas semua fail penting disimpan dan disahkan. FAQ tempatan berfungsi offline. Chat bebas melalui API memerlukan internet dan pilihan Online yang jelas.'},
 {id:'route',match:/map|peta|shop|kedai|mystery|boss|stage/i,en:'Read the map and choose a connected room. The Tutorial explains Shop, Mystery and both stages with local pictures and practice.',ms:'Baca peta dan pilih bilik yang bersambung. Tutorial menerangkan Shop, Mystery dan kedua-dua stage dengan gambar serta latihan tempatan.'}
];
function localReply(question,language='en'){const lang=language==='ms'?'ms':'en',item=faq.find(f=>f.match.test(String(question)));return {source:'local',faqId:item?.id||null,answer:item?item[lang]:lang==='ms'?'Bantuan ini menggunakan FAQ tempatan. Cuba topik Block, Focus, Predict, kad atau offline. Buka Tutorial atau Latihan Pembelajaran untuk bantuan lanjut.':'This help uses local FAQ. Try Block, Focus, Predict, cards or offline. Open Tutorial or Education Practice for more help.'};}
function create({mode,transport=null}={}){
 let api='unconfigured';mode.subscribe(()=>{api=mode.canUsePetAPI()?(transport?'unknown':'unconfigured'):'blocked';});
 async function ask(question,{language='en'}={}){
  const text=String(question||'').trim().slice(0,1000),local=()=>({...localReply(text,language),api});
  if(!mode.canUsePetAPI()){api='blocked';return local();}if(!transport){api='unconfigured';return local();}
  try{const reply=await mode.requestOnline(signal=>transport({question:text,language:language==='ms'?'ms':'en',signal}));if(!reply||typeof reply.answer!=='string'||!reply.answer.trim()||reply.answer.length>6000)throw Error('Invalid pet response');api='available';return {source:'api',api,answer:reply.answer};}
  catch(_){api=mode.canUsePetAPI()?'unavailable':'blocked';return local();}
 }
 return {protocol:'stm-pet-help-v1',ask,topics:()=>faq.map(f=>({id:f.id,en:f.en,ms:f.ms})),status:()=>({api:mode.canUsePetAPI()?api:'blocked',onlinePermission:mode.canUsePetAPI()}),setTransport(next){if(next!==null&&typeof next!=='function')throw Error('A pet transport must be a function');transport=next;api=mode.canUsePetAPI()?(transport?'unknown':'unconfigured'):'blocked';}};
}
const api={create,localReply};if(typeof module!=='undefined')module.exports=api;else root.STMPetHelp=create({mode:root.STMPlayMode});
})(typeof window!=='undefined'?window:globalThis);
