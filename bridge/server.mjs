import http from 'node:http';
import {LiveMonitor} from './live-monitor.mjs';
import {claudeTasks} from './claude-monitor.mjs';
import {ProgressStore} from './progress-store.mjs';
const progress=new ProgressStore();
const port=4318,monitor=new LiveMonitor({primaryThreadId:process.env.CODEX_THREAD_ID||null});
const origins=new Set(['https://kubo-classroom.vercel.app','http://127.0.0.1:4349','http://localhost:4349','http://127.0.0.1:4350']);
let snapshot={version:1,tasks:[],connection:'unavailable'},busy=false;
async function refresh(){if(busy)return;busy=true;try{let codex;try{const r=await fetch('http://127.0.0.1:4317/api/live',{signal:AbortSignal.timeout(800)});if(!r.ok)throw Error();codex=await r.json();if(codex.version!==1||!Array.isArray(codex.tasks))throw Error();}catch{await monitor.tick();codex=monitor.snapshot();}const claude=await claudeTasks();snapshot={...codex,serverTime:new Date().toISOString(),tasks:[...codex.tasks.map(t=>({...t,provider:'Codex'})),...claude]};}finally{busy=false;}}
const server=http.createServer((req,res)=>{
 const origin=req.headers.origin;if(!['127.0.0.1:4318','localhost:4318'].includes(req.headers.host)||(origin&&!origins.has(origin))){res.writeHead(403);res.end('Origin not allowed');return;}
 if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Private-Network','true');}
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');res.writeHead(204);res.end();return;}
 if(req.method==='POST'&&req.url==='/api/progress'&&!origin&&req.headers['sec-fetch-site']!=='cross-site'){
  if(req.headers['content-type']!=='application/json'){res.writeHead(415);res.end();return;}
  let body='';req.on('data',chunk=>{body+=chunk;if(body.length>4096)req.destroy();});req.on('end',()=>{try{const step=progress.report(JSON.parse(body));res.setHeader('Content-Type','application/json');res.end(JSON.stringify(step));}catch{res.writeHead(400);res.end('Invalid work step');}});return;
 }
 if(req.method!=='GET'||req.url!=='/api/live'){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(progress.merge(snapshot)));
});
await refresh();const timer=setInterval(refresh,2000);
server.on('error',e=>{clearInterval(timer);console.error(e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log('Kubo bridge ready. Open https://kubo-classroom.vercel.app/live/ and connect this computer.'));
for(const s of ['SIGINT','SIGTERM'])process.on(s,()=>{clearInterval(timer);server.close();});
