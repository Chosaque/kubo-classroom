import {randomUUID} from 'node:crypto';
export const STAGES={context:[1,'Reviewing what you asked for'],rules:[2,'Reading the project rules'],skill:[3,'Choosing the right instructions'],references:[4,'Reading supporting instructions'],check:[5,'Checking the work for mistakes'],approval:[6,'Waiting for your permission'],intake:[7,'Gathering the project files'],plan:[8,'Organizing the next steps']};
export class ProgressStore{
 constructor(now=()=>Date.now()){this.now=now;this.steps=new Map();this.visuals=new Map();}
 report(input){
  if(!input||Object.keys(input).some(k=>!['threadId','stage','message','completed'].includes(k))||!/^[-\w]{8,100}$/.test(input.threadId||'')||(!STAGES[input.stage]&&!['thinking','done','clear'].includes(input.stage)))throw Error('Invalid work step');
  if(input.message!==undefined&&(typeof input.message!=='string'||input.message.length>180||/[\x00-\x1f<>]/.test(input.message)))throw Error('Use one short plain sentence');
  const prior=this.steps.get(input.threadId),time=new Date(this.now()).toISOString();
  if(input.completed!==undefined&&(typeof input.completed!=='string'||!input.completed.trim()||input.completed.length>180||/[\x00-\x1f<>]/.test(input.completed)))throw Error('Use a short completion sentence');
  if(input.completed&&!prior)throw Error('No declared step exists to complete');
  if(input.stage==='thinking')input={...input,message:input.message||'Thinking'};
  const step={id:randomUUID(),threadId:input.threadId,stage:input.stage,message:input.message||STAGES[input.stage]?.[1]||'Finished this task',stationId:STAGES[input.stage]?`station-${STAGES[input.stage][0]}`:null,time,type:'work_step',source:'agent-reported',state:input.stage==='approval'?'waiting':input.stage==='done'?'completed':'active'};
  if(input.stage==='thinking')step.stationId='station-1';
  const completion=input.completed?{id:randomUUID(),threadId:input.threadId,type:'work_step_completed',stage:prior.stage,message:input.completed,time,source:'agent-reported',stationId:prior.stationId}:null;
  const events=[...(prior?.events||[]),...(completion?[completion]:[]),step].slice(-40);this.steps.set(input.threadId,{...step,events});return step;
 }
 visual(input){
  if(!input||!/^[-\w]{8,100}$/.test(input.threadId||'')||!['idle','running','turning','working','waiting'].includes(input.state)||typeof input.stepId!=='string')throw Error('Invalid visual state');
  const step=this.steps.get(input.threadId);if(!step||step.id!==input.stepId)return;
  const prior=this.visuals.get(input.threadId),arrived=input.stationId===step.stationId&&['working','waiting'].includes(input.state);
  this.visuals.set(input.threadId,{stepId:step.id,stationId:input.stationId,state:input.state,seenAt:this.now(),arrivedAt:arrived?(prior?.stepId===step.id&&prior?.arrivedAt||this.now()):null});
 }
 view(threadId){return this.visuals.get(threadId)||null;}
 merge(snapshot){const ids=new Set(snapshot.tasks.map(t=>t.id));const declared=[...this.steps.values()].filter(s=>!ids.has(s.threadId)&&s.stage!=='clear').map(s=>({id:s.threadId,title:'Declared task '+s.threadId.slice(0,8),state:s.state,readable:true,events:[],lastEventAt:s.time,stationId:s.stationId,source:'agent-reported'}));return {...snapshot,tasks:[...snapshot.tasks,...declared].map(task=>{
  const step=this.steps.get(task.id);if(!step||step.stage==='clear')return task;
  const terminal=task.events?.findLast(e=>['task_started','task_completed','task_interrupted'].includes(e.type)&&Date.parse(e.time)>Date.parse(step.time));
  if(terminal)return task;
  // Fresh public task activity confirms the declared operation is still running.
  // Browser heartbeats never renew this lease, and terminal events still win above.
  const confirmedAt=Math.max(Date.parse(step.time),task.readable&&task.state==='active'?Date.parse(task.lastEventAt)||0:0);
  const age=this.now()-confirmedAt,stale=step.stage!=='done'&&age>(step.stage==='approval'?3600000:180000);
  return {...task,thinking:step.stage==='thinking'||task.thinking,runtimeState:task.state,state:step.state,stationId:step.stationId,activity:step.message,lastEventAt:step.time,stale,progress:{id:step.id,stage:step.stage,source:step.source},events:[...task.events,...step.events].sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)).slice(-80)};
 })};}
}
