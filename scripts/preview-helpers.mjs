// Local visual QA only. No live connection or actual agents are started.
import {createWorkspace} from '../app/interactive-runtime.js';
const host=document.getElementById('canvas');
const workspace=await createWorkspace(host,()=>{},()=>{},()=>{},{visualReporting:false});
workspace.setTheme('midnight');
const helpers=[
 {id:'qa-blue',title:'Preview · checking',stationId:'station-5'},
 {id:'qa-lilac',title:'Preview · reading',stationId:'station-4'},
 {id:'qa-mint',title:'Preview · thinking',thinking:true},
];
function show(stale=false){workspace.setAgents(helpers.map(a=>({...a,readable:true,state:'active',stale,lastEventAt:new Date().toISOString()})),true);}
document.getElementById('work').onclick=()=>show();
document.getElementById('pause').onclick=()=>show(true);
show();
