import http from 'node:http';
import {LiveMonitor} from './live-monitor.mjs';
import {claudeTasks} from './claude-monitor.mjs';
import {ProgressStore} from './progress-store.mjs';
import {fileURLToPath} from 'node:url';
import {serveWebsite} from './static.mjs';
const website=fileURLToPath(new URL('../website/',import.meta.url));
const bridgeVersion='2.0.0';
const progress=new ProgressStore();
const streams=new Set();
const port=4318,monitor=new LiveMonitor({primaryThreadId:process.env.CODEX_THREAD_ID||null});
const origins=new Set(['http://127.0.0.1:4318','http://localhost:4318']);
let snapshot={version:1,tasks:[],connection:'unavailable'},busy=false;
async function refresh(){if(busy)return;busy=true;try{let codex;try{const r=await fetch('http://127.0.0.1:4317/api/live',{signal:AbortSignal.timeout(800)});if(!r.ok)throw Error();codex=await r.json();if(codex.version!==1||!Array.isArray(codex.tasks))throw Error();}catch{await monitor.tick();codex=monitor.snapshot();}const claude=await claudeTasks();snapshot={...codex,serverTime:new Date().toISOString(),tasks:[...codex.tasks.map(t=>({...t,provider:'Codex'})),...claude]};}finally{busy=false;}}
const server=http.createServer((req,res)=>{
 const origin=req.headers.origin;if(!['127.0.0.1:4318','localhost:4318'].includes(req.headers.host)||(origin&&!origins.has(origin))){res.writeHead(403);res.end('Origin not allowed');return;}
 if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Private-Network','true');}
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('Cross-Origin-Resource-Policy','same-origin');
 res.setHeader('X-Frame-Options','DENY');
 if(req.method==='GET'&&req.url==='/api/health'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({app:'kubo-classroom',version:bridgeVersion}));return;}
 if(req.method==='GET'&&new URL(req.url,'http://127.0.0.1:4318').pathname==='/connect'){res.writeHead(302,{Location:'/live/'});res.end();return;}
 if(req.method==='GET'&&req.url==='/api/events'){res.setHeader('Content-Type','text/event-stream');res.setHeader('Connection','keep-alive');res.write('data: '+JSON.stringify(progress.merge(snapshot))+'\n\n');streams.add(res);req.on('close',()=>streams.delete(res));return;}
 if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');res.writeHead(204);res.end();return;}
 if(req.method==='POST'&&req.url==='/api/progress'&&!origin&&req.headers['sec-fetch-site']!=='cross-site'){
  if(req.headers['content-type']!=='application/json'){res.writeHead(415);res.end();return;}
  let body='';req.on('data',chunk=>{body+=chunk;if(body.length>4096)req.destroy();});req.on('end',()=>{try{const step=progress.report(JSON.parse(body));res.setHeader('Content-Type','application/json');res.end(JSON.stringify(step));}catch{res.writeHead(400);res.end('Invalid work step');}});return;
 }
 if(req.url!=='/api/live'){
  if((req.method==='GET'||req.method==='HEAD')&&!req.url.startsWith('/api/')){void serveWebsite(req,res,website);return;}
  res.writeHead(404);res.end();return;
 }
 if(req.method!=='GET'){res.writeHead(405);res.end();return;}
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(progress.merge(snapshot)));
});
await refresh();const timer=setInterval(refresh,2000);
const streamTimer=setInterval(()=>{for(const res of streams){if(res.writableLength>1048576){res.destroy();streams.delete(res);}else res.write('data: '+JSON.stringify(progress.merge(snapshot))+'\n\n');}},2000);
server.on('error',e=>{clearInterval(timer);clearInterval(streamTimer);console.error(e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log('Kubo Classroom ready: http://127.0.0.1:4318/live/'));
for(const s of ['SIGINT','SIGTERM'])process.on(s,()=>{clearInterval(timer);clearInterval(streamTimer);for(const res of streams)res.end();server.close();});
