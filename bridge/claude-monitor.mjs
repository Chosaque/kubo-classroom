import {readdir,stat,open} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';
export function claudeEvent(r){
 const time=r.timestamp;if(!Number.isFinite(Date.parse(time)))return null;
 const event=(message,state,stationId)=>({message,state,stationId,time,type:'claude_activity'});
 if(r.type==='user')return event('Task input received','active','station-1');
 if(r.type==='system'&&r.subtype==='turn_duration')return event('Turn completed','completed',null);
 if(r.type!=='assistant')return null;
 const tools=(r.message?.content||[]).filter(x=>x.type==='tool_use');
 if(tools.length){const n=tools.at(-1).name||'';return event(/AskUserQuestion/.test(n)?'Input requested':'Tool operation started',/AskUserQuestion/.test(n)?'waiting':'active',/AskUserQuestion/.test(n)?'station-6':/Web|Search|MCP|mcp/.test(n)?'station-7':'station-1');}
 if(r.message?.stop_reason==='end_turn')return event('Turn completed','completed',null);
 return null;
}
export async function claudeTasks(root=join(homedir(),'.claude','projects')){
 const files=[];async function walk(dir,depth=0){if(depth>3)return;for(const e of await readdir(dir,{withFileTypes:true})){if(e.isSymbolicLink())continue;const p=join(dir,e.name);if(e.isDirectory())await walk(p,depth+1);else if(e.name.endsWith('.jsonl')){const s=await stat(p);files.push({p,size:s.size,mtime:s.mtimeMs,name:e.name});}}}
 try{await walk(root);}catch{return [];}
 const tasks=[];for(const f of files.sort((a,b)=>b.mtime-a.mtime).slice(0,16)){let fd;try{fd=await open(f.p);const offset=Math.max(0,f.size-262144),buffer=Buffer.alloc(Math.min(f.size,262144));await fd.read(buffer,0,buffer.length,offset);const lines=buffer.toString('utf8').split('\n');if(offset)lines.shift();const events=[];for(const line of lines){try{const e=claudeEvent(JSON.parse(line));if(e)events.push({...e,id:`claude:${f.name}:${events.length}`,historical:true});}catch{}}const latest=events.at(-1);if(!latest)continue;tasks.push({id:`claude-${f.name.replace('.jsonl','')}`,provider:'Claude Code',title:`Session ${f.name.slice(0,8)}`,state:latest.state,stationId:latest.stationId,activity:latest.message,lastEventAt:latest.time,stale:Date.now()-Date.parse(latest.time)>20000,readable:true,events:events.slice(-20)});}catch{}finally{await fd?.close();}}return tasks;
}
