/* Small versioned entry pages load the current runtime, retaining each file URL
 * so existing file-based browser saves stay at their original storage location. */
const fs=require('node:fs'),path=require('node:path');
module.exports=function syncGameEntrypoints(root){
 const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8').replace('<head>','<head><base href="dist/">');
 for(const name of ['MAIN-SEKARANG.html','index.html'])fs.writeFileSync(path.join(root,name),html);
};
if(require.main===module)module.exports(path.resolve(__dirname,'..'));
