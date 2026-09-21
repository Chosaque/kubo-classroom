import {createWorkspace} from '../app/interactive-runtime.js';
import {STATIONS} from '../app/navigation.mjs';
const $=id=>document.getElementById(id),th=['โต๊ะข้อมูล','กติกา','ทักษะ','คู่มือทักษะ','ตรวจงาน','ขออนุญาต','รับข้อมูล','วางแผน'];
let language=localStorage.getItem('kubo-workshop-language')||'th',runtime,feed=null,selected='',connected=false,timer=null,busy=false,generation=0;
const L=(en,thai)=>language==='th'?thai:en;
function localize(){document.documentElement.lang=language;document.querySelectorAll('[data-en]').forEach(e=>e.textContent=e.dataset[language]);$('language').textContent=language==='th'?'EN':'ไทย';document.querySelectorAll('#stations button').forEach((b,i)=>b.lastChild.textContent=language==='th'?th[i]:STATIONS[i].name);render();}
$('language').onclick=()=>{language=language==='th'?'en':'th';localStorage.setItem('kubo-workshop-language',language);localize();};
STATIONS.forEach((s,i)=>{const b=document.createElement('button'),n=document.createElement('b'),label=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');b.append(n,label);b.disabled=true;b.onclick=()=>runtime?.choose(s.id);b.onmouseenter=()=>runtime?.highlight(s.id);b.onmouseleave=()=>runtime?.highlight(null);b.onfocus=b.onmouseenter;b.onblur=b.onmouseleave;$('stations').append(b);});
function render(){
 const task=feed?.tasks.find(t=>t.id===selected),stale=!!task&&(task.stale||task.state==='active'&&!task.progress&&Date.now()-Date.parse(task.lastEventAt||0)>20000),locked=connected&&!!task&&['active','waiting'].includes(task.runtimeState||task.state);
 $('connection').textContent=connected?L('Connected · this computer','เชื่อมต่อแล้ว · คอมพิวเตอร์นี้'):L('Not connected','ยังไม่ได้เชื่อมต่อ');
 $('activity').textContent=connected&&task?(stale?L('No recent update','ยังไม่มีข้อมูลใหม่'):task.activity):L('Explore Kubo’s room','สำรวจห้องของ Kubo');
 $('detail').textContent=connected?(task?`${task.provider||'Codex'} · ${task.title} · ${L('Reported status','สถานะที่รายงาน')}`:L('No local sessions found. Start a task in Codex or Claude Code.','ยังไม่พบงาน เริ่มงานใน Codex หรือ Claude Code')):L('Connect to follow real work on this computer.','เชื่อมต่อเพื่อดูงานจริงบนคอมพิวเตอร์นี้');
 document.querySelectorAll('#stations button').forEach(b=>b.disabled=!runtime||locked);
 runtime?.setLiveTask(connected&&task?{...task,stale}:null,connected,connected&&!!task);
 runtime?.setAgents(connected?feed.tasks.filter(t=>t.parentId===selected):[],connected);
 $('tasks').disabled=!connected||!feed?.tasks.length;
 $('history').replaceChildren();if(connected&&task)for(const e of (task.events||[]).slice(-5).reverse()){const li=document.createElement('li');li.textContent=`${new Date(e.time).toLocaleTimeString(language==='th'?'th-TH':'en-GB')} · ${e.message}`;$('history').append(li);}
}
async function poll(epoch){if(busy)return;busy=true;try{const response=await fetch('http://127.0.0.1:4318/api/live',{signal:AbortSignal.timeout(5000),cache:'no-store'});if(!response.ok)throw Error('bridge');const data=await response.json();if(epoch!==generation)return;if(data.version!==1||!Array.isArray(data.tasks))throw Error('format');feed=data;connected=true;$('error').textContent='';const tasks=data.tasks.filter(t=>!t.isAgent);if(!tasks.some(t=>t.id===selected))selected=tasks.find(t=>t.id===data.primaryThreadId)?.id||tasks[0]?.id||'';$('tasks').replaceChildren(...tasks.map(t=>{const o=document.createElement('option');o.value=t.id;o.textContent=`${t.provider||'Codex'} · ${t.title}`;return o;}));$('tasks').value=selected;}catch{if(epoch!==generation)return;connected=false;feed=null;$('error').textContent=L('Bridge unavailable. Run npm run live:bridge, then allow local network access in your browser. Retrying…','ยังเชื่อมต่อไม่ได้ รัน npm run live:bridge และอนุญาตเครือข่ายภายในในเบราว์เซอร์ กำลังลองใหม่…');}finally{busy=false;if(epoch===generation)render();}}
$('tasks').onchange=()=>{selected=$('tasks').value;render();};
$('connect').onclick=()=>{if(timer)return;const epoch=++generation;$('disconnect').hidden=false;$('connect').hidden=true;poll(epoch);timer=setInterval(()=>poll(epoch),2000);};
$('disconnect').onclick=()=>{generation++;clearInterval(timer);timer=null;connected=false;feed=null;$('tasks').replaceChildren();$('error').textContent='';$('disconnect').hidden=true;$('connect').hidden=false;render();};
$('reset').onclick=()=>runtime?.resetView();
localize();
try{runtime=await createWorkspace($('canvas'),()=>{},()=>{},()=>{}, {visualReporting:false});runtime.setTheme('midnight');$('loading').hidden=true;render();}catch{$('loading').textContent=L('The 3D room could not load. Refresh with WebGL enabled.','โหลดห้อง 3D ไม่สำเร็จ กรุณารีเฟรชและเปิด WebGL');}
addEventListener('pagehide',()=>{generation++;clearInterval(timer);runtime?.dispose();});
