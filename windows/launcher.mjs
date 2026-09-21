import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {openSync,closeSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
const url='http://127.0.0.1:4318/live/';
async function status(){
 try{const r=await fetch('http://127.0.0.1:4318/api/health',{signal:AbortSignal.timeout(1000)});const data=await r.json();return data.app==='kubo-classroom'&&data.version==='2.0.0'?'ready':'occupied';}
 catch{return 'offline';}
}
try{
 if(await status()!=='ready'){
  const log=openSync(new URL('../kubo-startup.log',import.meta.url),'a');
  const child=spawn(process.execPath,[fileURLToPath(new URL('../bridge/server.mjs',import.meta.url))],{detached:true,windowsHide:true,stdio:['ignore',log,log]});
  child.on('error',e=>console.error(e.message));child.unref();closeSync(log);
  let ready=false;
  for(let attempt=0;attempt<45;attempt++){if(await status()==='ready'){ready=true;break;}await delay(500);}
  if(!ready)throw Error('Kubo could not start. Close an older Kubo connection if one is running, then try again. Details are in kubo-startup.log.');
 }
 if(!process.argv.includes('--check'))await new Promise((resolve,reject)=>{
  const browser=spawn('cmd.exe',['/d','/s','/c',`start "" "${url}"`],{windowsVerbatimArguments:true,windowsHide:true,stdio:'ignore'});
  browser.on('error',reject);browser.on('exit',code=>code===0?resolve():reject(Error(`Open ${url} in your browser to continue.`)));
 });
 console.log('Kubo is ready. Keep the extracted folder for next time.');
}catch(error){console.error(error.message);process.exitCode=1;}
