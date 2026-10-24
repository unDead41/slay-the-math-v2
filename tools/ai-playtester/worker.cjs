'use strict';
const {parentPort,workerData}=require('node:worker_threads');
if(parentPort){try{const {experiment}=require('./experiments.cjs'),report=experiment(workerData,{onStart:metadata=>parentPort.postMessage({type:'start',metadata}),onRow:row=>parentPort.postMessage({type:'row',row}),onProgress:progress=>parentPort.postMessage({type:'progress',...progress})});parentPort.postMessage({type:'done',report});}catch(e){parentPort.postMessage({type:'error',error:e.message});process.exitCode=1;}}
