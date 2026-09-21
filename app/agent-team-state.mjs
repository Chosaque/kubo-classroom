import {stationClip} from './animation-state.mjs';
export const AGENT_COLORS=['#70a9d6','#a491cf','#70b59d','#dc9c85'];
export function teamFor(tasks,parentId){
 if(!parentId)return [];
 const byId=new Map(tasks.map(t=>[t.id,t]));
 return tasks.filter(t=>{if(!t.isAgent||t.id===parentId)return false;let p=t.parentId;const seen=new Set([t.id]);while(p&&!seen.has(p)){if(p===parentId)return true;seen.add(p);p=byId.get(p)?.parentId;}return false;}).sort((a,b)=>a.id.localeCompare(b.id));
}
export function agentStatus(agent,connected,now=Date.now()){
 if(!connected)return 'Updates disconnected';
 if(agent.state==='completed')return 'Finished';
 if(agent.state==='interrupted')return 'Interrupted';
 const updated=Date.parse(agent.lastEventAt);
 if(agent.stale||agent.readable===false||!Number.isFinite(updated)||(!agent.progress&&now-updated>20000))return 'No recent update';
 if(agent.state==='waiting')return 'Needs your input';
 if(agent.state==='active'&&agent.thinking)return 'Thinking';
 return agent.state==='active'?'Working':'Ready';
}
export function agentClip(status,stationId,seconds=0){
 if(status==='Thinking')return 'Thinking';
 if(status==='Needs your input')return 'WaitApproval';
 // Helpers stand in their own slots; the main actor's seated typing needs a chair.
 if(status==='Working')return !stationId||stationId==='station-1'?'Work':stationClip(stationId,seconds);
 return 'Idle';
}
export function visibleAgents(agents){
 const priority=a=>['active','waiting'].includes(a.runtimeState||a.state)?0:1;
 return [...agents].sort((a,b)=>priority(a)-priority(b)||a.id.localeCompare(b.id)).slice(0,4);
}
export const DEMO_AGENTS=[
 {id:'demo-blue',title:'Kubo Blue',state:'active',stationId:'station-4',activity:'Reading reference files'},
 {id:'demo-lilac',title:'Kubo Lilac',state:'active',stationId:'station-5',activity:'Checking the work'},
 {id:'demo-mint',title:'Kubo Mint',state:'waiting',stationId:'station-6',activity:'Waiting for your input'},
].map(t=>({...t,isAgent:true,parentId:'demo-office',readable:true,stale:false}));
