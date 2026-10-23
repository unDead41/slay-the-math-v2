/* Selected Form 4 SK/SP names transcribed from the supplied KPM/BPK DSKP,
 * September 2018. English labels are working translations, not a claim of
 * complete curriculum coverage or an official assessment/TP classification.
 */
(function(root){
 'use strict';
 const source=Object.freeze({id:'dskp-kssm-mathematics-2018',author:'Kementerian Pendidikan Malaysia / Bahagian Pembangunan Kurikulum',title:'DSKP KSSM Matematik Tingkatan 4 dan 5',edition:'September 2018',filename:'03-DSKP-KSSM-MATEMATIK-TG-4-dan-5.pdf',form:4});
 function reference(pages){return {...source,printedPages:pages,pdfPages:pages.map(n=>n+14)};}
 const contentStandards={};
 const learningStandards={};
 function sk(id,topicCode,ms,en,pages){contentStandards[id]={id,topicCode,chapter:Number(id.split('.')[0]),ms,en,source:reference(pages)};}
 function sp(id,ms,en,pages){const contentStandardId=id.split('.').slice(0,2).join('.'),parent=contentStandards[contentStandardId];learningStandards[id]={id,contentStandardId,topicCode:parent.topicCode,chapter:parent.chapter,ms,en,source:reference(pages)};}
 sk('9.1','PROB','Peristiwa Bergabung','Combined events',[68]);
 sk('9.2','PROB','Peristiwa Bersandar dan Peristiwa Tak Bersandar','Dependent and independent events',[68,69]);
 sk('9.3','PROB','Peristiwa Saling Eksklusif dan Peristiwa Tidak Saling Eksklusif','Mutually exclusive and non-mutually exclusive events',[69,70]);
 sk('9.4','PROB','Aplikasi Kebarangkalian Peristiwa Bergabung','Applications of probability of combined events',[70]);
 sk('4.1','SET','Persilangan Set','Intersection of sets',[48]);
 sk('4.2','SET','Kesatuan Set','Union of sets',[48]);
 sk('4.3','SET','Gabungan Operasi Set','Combined operations on sets',[49]);
 sk('3.1','LOGIC','Pernyataan','Statements',[42,43]);
 sk('3.2','LOGIC','Hujah','Arguments',[43,44,45]);
 sp('9.1.1','Memerihalkan peristiwa bergabung dan menyenaraikan peristiwa bergabung yang mungkin.','Describe combined events and list possible combined events.',[68]);
 sp('9.2.1','Membezakan peristiwa bersandar dan peristiwa tak bersandar.','Distinguish dependent and independent events.',[68]);
 sp('9.2.2','Membuat dan menentusahkan konjektur tentang rumus kebarangkalian peristiwa bergabung.','Make and verify conjectures about the probability formula for combined events.',[68]);
 sp('9.2.3','Menentukan kebarangkalian peristiwa bergabung bagi peristiwa bersandar dan peristiwa tak bersandar.','Determine the probability of combined dependent and independent events.',[68,69]);
 sp('9.3.1','Membezakan peristiwa saling eksklusif dan peristiwa tidak saling eksklusif.','Distinguish mutually exclusive and non-mutually exclusive events.',[69]);
 sp('9.3.3','Menentukan kebarangkalian peristiwa bergabung bagi peristiwa saling eksklusif dan peristiwa tidak saling eksklusif.','Determine the probability of combined mutually exclusive and non-mutually exclusive events.',[69,70]);
 sp('9.4.1','Menyelesaikan masalah yang melibatkan kebarangkalian peristiwa bergabung.','Solve problems involving the probability of combined events.',[70]);
 sp('4.1.1','Menentu dan menghuraikan persilangan set menggunakan pelbagai perwakilan.','Determine and describe set intersections using different representations.',[48]);
 sp('4.1.2','Menentukan pelengkap bagi persilangan set.','Determine the complement of a set intersection.',[48]);
 sp('4.1.3','Menyelesaikan masalah yang melibatkan persilangan set.','Solve problems involving set intersections.',[48]);
 sp('4.2.1','Menentu dan menghuraikan kesatuan set menggunakan pelbagai perwakilan.','Determine and describe set unions using different representations.',[48]);
 sp('4.2.2','Menentukan pelengkap bagi kesatuan set.','Determine the complement of a set union.',[48]);
 sp('4.2.3','Menyelesaikan masalah yang melibatkan kesatuan set.','Solve problems involving set unions.',[48]);
 sp('4.3.1','Menentu dan menghuraikan gabungan operasi set menggunakan pelbagai perwakilan.','Determine and describe combined set operations using different representations.',[49]);
 sp('4.3.2','Menentukan pelengkap bagi gabungan operasi set.','Determine the complement of combined set operations.',[49]);
 sp('4.3.3','Menyelesaikan masalah yang melibatkan gabungan operasi set.','Solve problems involving combined set operations.',[49]);
 sp('3.1.1','Menerangkan maksud pernyataan dan seterusnya menentukan nilai kebenaran bagi suatu pernyataan.','Explain statements and determine their truth values.',[42]);
 sp('3.1.2','Menafikan suatu pernyataan.','Negate a statement.',[42]);
 sp('3.1.3','Menentukan nilai kebenaran suatu pernyataan majmuk.','Determine the truth value of a compound statement.',[42]);
 sp('3.1.4','Membina pernyataan dalam bentuk implikasi (i) Jika p, maka q (ii) p jika dan hanya jika q.','Form implications: if p then q; p if and only if q.',[42]);
 sp('3.1.5','Membina dan membandingkan nilai kebenaran akas, songsangan dan kontrapositif bagi suatu implikasi.','Form and compare the truth values of the converse, inverse and contrapositive.',[42]);
 sp('3.1.6','Menentukan contoh penyangkal untuk menafikan kebenaran pernyataan tertentu.','Find counterexamples to disprove a statement.',[43]);
 sp('3.2.1','Menerangkan maksud hujah, dan membezakan hujah deduktif dan hujah induktif.','Explain arguments and distinguish deductive and inductive arguments.',[43]);
 sp('3.2.2','Menentu dan menjustifikasikan keesahan suatu hujah deduktif dan seterusnya menentukan sama ada hujah yang sah itu munasabah.','Determine and justify deductive validity and whether a valid argument is sound.',[43,44]);
 sp('3.2.3','Membentuk hujah deduktif yang sah bagi suatu situasi.','Form a valid deductive argument for a situation.',[45]);
 sp('3.2.4','Menentu dan menjustifikasikan kekuatan suatu hujah induktif dan seterusnya menentukan sama ada hujah yang kuat itu meyakinkan.','Determine and justify inductive strength and whether a strong argument is cogent.',[45]);
 sp('3.2.5','Membentuk hujah induktif yang kuat bagi suatu situasi.','Form a strong inductive argument for a situation.',[45]);
 sp('3.2.6','Menyelesaikan masalah yang melibatkan penaakulan logik.','Solve problems involving logical reasoning.',[45]);
 const api={schemaVersion:1,form:4,source,contentStandards,learningStandards};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DCLearningCurriculum=api;
})(typeof globalThis!=='undefined'?globalThis:this);
