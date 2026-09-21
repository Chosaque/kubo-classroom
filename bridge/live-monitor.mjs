import {readdir,stat,open,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';

const LIMIT=512*1024, MAX_LINE=4*1024*1024;
const validId=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{8,100}$/.test(v);
const station=(n)=>`station-${n}`;
export function agentParent(meta){
 if(meta?.thread_source==='guardian_review'||meta?.source?.subagent?.other==='guardian')return null;
 const spawn=meta?.source?.subagent?.thread_spawn||meta?.source?.subagent?.spawn;
 const parent=spawn?.parent_thread_id||meta?.parent_thread_id;
 return validId(parent)&&(!!spawn||['subagent','agent','agent_spawn'].includes(meta?.thread_source))?parent:null;
}
// No raw messages, reasoning, arguments, commands or output leave this adapter.
export function publicEvent(record,pending=new Map()){
 const p=record?.payload;if(!p||!Number.isFinite(Date.parse(record.timestamp)))return null;
 const event=(type,message,state='active',stationId=null)=>({type,message,state,stationId,time:record.timestamp});
 if(record.type==='event_msg'){
  if(p.type==='item_started'&&/^reasoning$/i.test(p.item?.type||''))return event('thinking_started','Thinking','active',station(1));
  if(p.type==='agent_reasoning')return event('thinking_started','Thinking','active',station(1));
  if(p.type==='task_started')return event('task_started','Task started','active',station(8));
  if(p.type==='task_complete')return event('task_completed','Turn completed','completed');
  if(p.type==='turn_aborted')return event('task_interrupted','Turn interrupted','interrupted');
  if(p.type==='item_completed'){
   const item=p.item||{};
   if(item.type==='CommandExecution'){
    const failed=typeof item.exit_code==='number'&&item.exit_code!==0;
    return event(failed?'command_failed':'command_completed',failed?'Local command returned an error':'Local command finished','active',station(1));
   }
   if(item.type==='FileChange')return event('files_changed','File edit reported','active',station(1));
   if(item.type==='McpToolCall')return event('connector_completed','Connector operation finished','active',station(7));
   if(item.type==='Extension')return event('tool_completed','Tool operation finished','active',station(7));
   // AgentMessage and Reasoning intentionally excluded, including their contents.
  }
  return null;
 }
 if(record.type!=='response_item')return null;
 if(['function_call','custom_tool_call'].includes(p.type)){
  const name=typeof p.name==='string'?p.name:'';
  let e;
  if(/request_user_input/.test(name))e=event('input_requested','Input requested','waiting',station(6));
  else if(/apply_patch/.test(name))e=event('editing_started','Editing files','active',station(1));
  else if(/web|search|browse/.test(name))e=event('lookup_started','Looking up information','active',station(7));
  else if(/mcp/.test(name))e=event('connector_started','Using a connected tool','active',station(7));
  else if(/exec|shell|python/.test(name))e=event('tool_started','Tool operation started','active',station(1));
  else if(/wait|sleep/.test(name))e=event('tool_waiting','Waiting for a tool result','active',station(1));
  else e=event('tool_started','Tool operation started','active',station(1));
  if(typeof p.call_id==='string'){pending.set(p.call_id,e);if(pending.size>100)pending.delete(pending.keys().next().value);}
  return e;
 }
 if(['function_call_output','custom_tool_call_output'].includes(p.type)){
  const prior=pending.get(p.call_id);pending.delete(p.call_id);
  if(prior?.type==='input_requested')return event('input_received','Input request returned','active',station(8));
  return event('tool_returned','Tool operation returned','active',prior?.stationId||station(1));
 }
 return null;
}

async function filesIn(root){
 const result=[];
 async function walk(dir,depth=0){if(depth>4)return;for(const e of await readdir(dir,{withFileTypes:true})){
  const path=join(dir,e.name);if(e.isSymbolicLink())continue;
  if(e.isDirectory())await walk(path,depth+1);
  else if(e.isFile()&&/^rollout-.*\.jsonl$/.test(e.name)){const s=await stat(path);result.push({path,size:s.size,mtime:s.mtimeMs});}
 }}
 await walk(root);return result.sort((a,b)=>b.mtime-a.mtime).slice(0,240);
}
async function readRange(path,start,length){
 const fd=await open(path,'r');try{const buffer=Buffer.alloc(length);const r=await fd.read(buffer,0,length,start);return buffer.subarray(0,r.bytesRead);}finally{await fd.close();}
}

export class LiveMonitor{
 constructor({codexHome=join(homedir(),'.codex'),primaryThreadId=null,now=()=>Date.now()}={}){
  this.root=join(codexHome,'sessions');this.index=join(codexHome,'session_index.jsonl');this.primaryThreadId=primaryThreadId;this.now=now;
  this.tasks=new Map();this.readers=new Map();this.metadata=new Map();this.names=new Map();this.revision=0;this.lastScan=0;this.lastPollAt=null;this.error=null;this.busy=false;this.nextId=0;
 }
 async discover(){
  const all=await filesIn(this.root), latest=new Map();
  try{const s=await stat(this.index);const bytes=await readRange(this.index,Math.max(0,s.size-LIMIT),Math.min(s.size,LIMIT));for(const line of bytes.toString('utf8').split('\n'))try{const r=JSON.parse(line);if(validId(r.id)&&typeof r.thread_name==='string')this.names.set(r.id,r.thread_name.slice(0,160));}catch{}}catch{}
  for(const f of all){
   let meta=this.metadata.get(f.path);
   if(!meta){
    const head=(await readRange(f.path,0,Math.min(f.size,MAX_LINE))).toString('utf8');
    try{const r=JSON.parse(head.slice(0,head.indexOf('\n')));if(r.type!=='session_meta')continue;meta=r.payload;this.metadata.set(f.path,{id:meta.id,source:meta.source,thread_source:meta.thread_source,parent_thread_id:meta.parent_thread_id});}catch{continue;}
   }
   if(!validId(meta.id)||meta.thread_source==='guardian_review'||meta.source?.subagent?.other==='guardian'||(typeof meta.source!=='string'&&!agentParent(meta)))continue;
   if(!latest.has(meta.id))latest.set(meta.id,f);
  }
  const selected=[...latest.entries()].sort(([a,fa],[b,fb])=>a===this.primaryThreadId?-1:b===this.primaryThreadId?1:fb.mtime-fa.mtime).slice(0,80);
  const keep=new Set();
  for(const [id,f] of selected){
   keep.add(id);const meta=this.metadata.get(f.path),parentId=agentParent(meta);let r=this.readers.get(id);
   if(!r||r.path!==f.path||f.size<r.offset||(f.size===r.offset&&f.mtime>r.mtime)){
    const offset=Math.max(0,f.size-LIMIT);r={path:f.path,offset,mtime:f.mtime,buffer:'',skipFirst:offset>0,pending:new Map(),bootstrap:true};this.readers.set(id,r);
    this.tasks.set(id,{id,parentId,isAgent:!!parentId,title:parentId?`Kubo ${id.slice(0,6)}`:this.names.get(id)||`Task ${id.slice(0,8)}`,state:'unknown',lastEventAt:null,activity:'No recent public event',stationId:null,events:[],readable:true});this.revision++;
   }else{const task=this.tasks.get(id),title=task.isAgent?task.title:this.names.get(id)||task.title;if(task.title!==title){task.title=title;this.revision++;}}
  }
  for(const id of this.tasks.keys())if(!keep.has(id)){this.tasks.delete(id);this.readers.delete(id);this.revision++;}
 }
 async tick(){
  if(this.busy)return;this.busy=true;
  try{
   if(!this.lastScan||this.now()-this.lastScan>=3000){await this.discover();this.lastScan=this.now();}
   let readable=0;
   for(const [id,r] of this.readers){
    const task=this.tasks.get(id);
    try{
     const s=await stat(r.path);if(s.size<r.offset||(s.size===r.offset&&s.mtimeMs>r.mtime)){this.lastScan=0;continue;}
     if(s.size>r.offset){
      const bytes=await readRange(r.path,r.offset,Math.min(s.size-r.offset,LIMIT));r.offset+=bytes.length;r.buffer+=bytes.toString('utf8');
      let n;while((n=r.buffer.indexOf('\n'))>=0){const line=r.buffer.slice(0,n);r.buffer=r.buffer.slice(n+1);if(r.skipFirst){r.skipFirst=false;continue;}let record;try{record=JSON.parse(line);}catch{continue;}
       const e=publicEvent(record,r.pending);if(!e)continue;
       const epoch=Date.parse(e.time);if(task.lastEventAt&&epoch<Date.parse(task.lastEventAt))continue;
       task.state=e.state;task.lastEventAt=e.time;task.activity=e.message;task.stationId=e.stationId;task.thinking=e.type==='thinking_started';
       task.events.push({...e,id:`${id}:${++this.nextId}`,observedAt:new Date(this.now()).toISOString(),historical:r.bootstrap});task.events=task.events.slice(-60);this.revision++;
      }
      if(r.buffer.length>MAX_LINE){r.buffer='';r.skipFirst=true;}
      if(r.offset>=s.size)r.bootstrap=false;
     }
     r.mtime=s.mtimeMs;if(!task.readable){task.readable=true;this.revision++;}readable++;
    }catch{if(task.readable){task.readable=false;this.revision++;}this.lastScan=0;}
   }
   this.error=readable?'': 'No readable local task records';this.lastPollAt=new Date(this.now()).toISOString();
  }catch{this.error='Local task records unavailable';}finally{this.busy=false;}
 }
 snapshot(){return {version:1,revision:this.revision,source:'local-codex-records',primaryThreadId:this.primaryThreadId,connection:this.error?'unavailable':'connected',message:this.error||'Reading local Codex activity',lastPollAt:this.lastPollAt,serverTime:new Date(this.now()).toISOString(),tasks:[...this.tasks.values()].map(t=>({...t,stale:t.state==='active'&&(!t.lastEventAt||this.now()-Date.parse(t.lastEventAt)>20000)}))};}
}
