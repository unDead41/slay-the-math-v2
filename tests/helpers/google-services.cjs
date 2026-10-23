/* External Apps Script services only; the actual generated receiver runs in V8. */
'use strict';
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function services(){
 const properties=new Map(),books=new Map(),logs=[];let count=0,locked=false,flushes=0,failure=null;
 function trip(label){if(failure===label){failure=null;throw Error('Injected service failure: '+label);}}
 class Sheet{
  constructor(name){this.name=name;this.rows=[];this.hidden=false;}
  getLastRow(){return this.rows.length;}
  getMaxRows(){return this.maxRows||1000;}
  getMaxColumns(){return this.maxCols||26;}
  insertRowsAfter(at,n){this.maxRows=at+n;}
  insertColumnsAfter(at,n){this.maxCols=at+n;}
  getName(){return this.name;}
  hideSheet(){this.hidden=true;return this;}
  setFrozenRows(){return this;}
  getRange(row,col,height=1,width=1){const sheet=this;return {setNumberFormat(){return this;},setValues(values){trip(sheet.name);for(let r=0;r<height;r++){sheet.rows[row+r-1]??=[];for(let c=0;c<width;c++)sheet.rows[row+r-1][col+c-1]=values[r][c];}return this;},getValues(){return Array.from({length:height},(_,r)=>Array.from({length:width},(_,c)=>sheet.rows[row+r-1]?.[col+c-1]??''));}};}
 }
 function book(id){const sheets=new Map();return {id,sheets,getId:()=>id,getUrl:()=> 'https://docs.google.com/spreadsheets/d/'+id,getSheetByName:name=>sheets.get(name)||null,insertSheet(name){const s=new Sheet(name);sheets.set(name,s);return s;},getSheets:()=>[...sheets.values()]};}
 const context={console:{log:v=>logs.push(v)},PropertiesService:{getScriptProperties:()=>({getProperty:k=>properties.get(k)||null,setProperty:(k,v)=>properties.set(k,v)})},SpreadsheetApp:{create(){const b=book('sheet-'+ ++count);books.set(b.id,b);return b;},openById(id){if(!books.has(id))throw Error('Not found');return books.get(id);},flush(){trip('flush');flushes++;}},LockService:{getScriptLock:()=>({tryLock(){if(locked)return false;locked=true;return true;},releaseLock(){locked=false;}})},HtmlService:{XFrameOptionsMode:{ALLOWALL:'ALLOWALL'},createHtmlOutput(html){return {html,setXFrameOptionsMode(value){this.mode=value;return this;},setTitle(){return this;}};}}};
 vm.createContext(context);
 return {context,properties,books,logs,get flushes(){return flushes;},get locked(){return locked;},failOnce:label=>failure=label,holdLock:value=>locked=value,load(file=path.resolve(__dirname,'../../integrations/google-sheets/Code.gs')){vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});return context;},rows(name){return [...books.values()][0]?.getSheetByName(name)?.rows||[];}};
}
module.exports={services};
