'use strict';
/* Optional receiver; the existing dependency-free game server is unchanged. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{createCollector,DEFAULT_DATABASE_PATH}=require('./collector.cjs');
const PROJECT=path.resolve(__dirname,'../..'),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.mp4':'video/mp4','.woff2':'font/woff2'};
function createServer(options={}){
 const gameRoot=fs.realpathSync(options.gameRoot||path.join(PROJECT,options.production?'release-prod':'dist'));
 if(!fs.existsSync(path.join(gameRoot,'index.html')))throw Error('Build the game before starting the analytics server.');
 const collector=createCollector({databasePath:options.databasePath||DEFAULT_DATABASE_PATH,origin:options.origin});
 const server=http.createServer(async(req,res)=>{
  try{
   if(await collector.handler(req,res))return;
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end('GET or HEAD is required.');return;}
   let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Invalid file address.');return;}
   const file=path.resolve(gameRoot,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(gameRoot+path.sep)){res.writeHead(403);res.end('Access denied.');return;}
   let physical;try{physical=await fs.promises.realpath(file);}catch{res.writeHead(404);res.end('File not found.');return;}
   if(!physical.startsWith(gameRoot+path.sep)){res.writeHead(403);res.end('Access denied.');return;}
   let data;try{data=await fs.promises.readFile(physical);}catch{res.writeHead(404);res.end('File not found.');return;}
   if(file===path.join(gameRoot,'index.html'))data=Buffer.from(data.toString('utf8').replace(/<\/head>/i,'<script>window.DC_EDUCATION_ENDPOINT="/api/education";</script></head>'));
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
  }catch{if(!res.headersSent)res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});res.end('The local server could not complete this request.');}
 });
 server.requestTimeout=15000;server.headersTimeout=10000;server.keepAliveTimeout=5000;server.on('close',()=>collector.close());return {server,collector};
}
async function start(options={}){const app=createServer(options),port=options.port===undefined?4173:Number(options.port),host=options.host||'127.0.0.1';try{await new Promise((resolve,reject)=>{app.server.once('error',reject);app.server.listen(port,host,resolve);});return app;}catch(error){app.collector.close();throw error;}}
if(require.main===module){
 const args=process.argv.slice(2);if(args.some(value=>!['--prod'].includes(value))){process.stderr.write('Usage: node tools/analytics/server.cjs [--prod]. Use the ordinary development server for Dev sandbox.\n');process.exitCode=1;}
 else start({production:args.includes('--prod'),port:process.env.PORT===undefined?4173:process.env.PORT,host:process.env.STM_ANALYTICS_HOST||'127.0.0.1',databasePath:process.env.STM_ANALYTICS_DB||DEFAULT_DATABASE_PATH,origin:process.env.STM_ANALYTICS_ORIGIN}).then(({server})=>{
  process.stdout.write('Slay the Math v'+require('../../package.json').version+' — optional education collector\n');process.stdout.write('Game: http://localhost:'+server.address().port+'\n');process.stdout.write('Listening: '+server.address().address+'\n');process.stdout.write('Sharing stays off until enabled in Learning Report. Closing this terminal stops the receiver.\n');
  const close=()=>server.close(()=>process.exit(0));process.on('SIGINT',close);process.on('SIGTERM',close);
 }).catch(error=>{process.stderr.write(error.code==='EADDRINUSE'?'Port is in use. Stop the old game server with Ctrl+C, then start the collector server.\n':error.message+'\n');process.exitCode=1;});
}
module.exports={createServer,start};
