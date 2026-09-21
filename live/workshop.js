import {createWorkspace} from '../app/interactive-runtime.js';
import {STATIONS} from '../app/navigation.mjs';
import {sessions,sessionTime} from './sessions.mjs';
import {teamFor} from '../app/agent-team-state.mjs';
const $=id=>document.getElementById(id),th=['โต๊ะข้อมูล','กติกา','ทักษะ','คู่มือทักษะ','ตรวจงาน','ขออนุญาต','รับข้อมูล','วางแผน'];
const localMode=['127.0.0.1','localhost'].includes(location.hostname)&&location.port==='4318';
let language=localStorage.getItem('kubo-workshop-language')||'th',runtime,feed=null,selected='',connected=false,timer=null;
let stream=null,lastPacket=0;
const searchButton=document.createElement('button'),searchInput=document.createElement('input'),searchStatus=document.createElement('p');
searchButton.type='button';searchButton.dataset.en='Search sessions';searchButton.dataset.th='ค้นหาเซสชัน';searchButton.setAttribute('aria-expanded','false');searchButton.setAttribute('aria-controls','session-search');
searchInput.id='session-search';searchInput.type='search';searchInput.hidden=true;searchInput.autocomplete='off';searchInput.style.cssText='width:100%;margin:8px 0;padding:10px;border-radius:10px;border:1px solid #ffffff35;background:#10152b;color:#f6eee0;font:inherit';
searchStatus.className='note';searchStatus.setAttribute('role','status');
$('tasks').before(searchButton,searchInput,searchStatus);
searchButton.onclick=()=>{searchInput.hidden=!searchInput.hidden;searchButton.setAttribute('aria-expanded',String(!searchInput.hidden));if(!searchInput.hidden)searchInput.focus();else{searchInput.value='';render();}};
searchInput.oninput=()=>render();
searchInput.onkeydown=e=>{if(e.key==='Escape'){searchInput.value='';render();}};
function renderSessions(){
 const tasks=sessions(feed?.tasks,searchInput.value);
 searchInput.placeholder=L('Search by name or assistant…','ค้นหาชื่อหรือผู้ช่วย…');searchInput.setAttribute('aria-label',L('Search sessions','ค้นหาเซสชัน'));
 searchButton.disabled=!connected;
 searchStatus.textContent=connected?`${tasks.length} ${L('sessions · newest activity first','เซสชัน · กิจกรรมล่าสุดก่อน')}`:'';
 const options=tasks.map(t=>{const o=document.createElement('option');o.value=t.id;const time=sessionTime(t);o.textContent=`${t.provider||'Codex'} · ${t.title} · ${time?new Date(time).toLocaleString(language==='th'?'th-TH':'en-GB',{dateStyle:'short',timeStyle:'short'}):L('Date unavailable','ไม่มีวันที่')}`;return o;});
 if(!tasks.some(t=>t.id===selected)){const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=tasks.length?L('Select a matching session','เลือกเซสชันที่ค้นพบ'):L('No matching sessions','ไม่พบเซสชัน');options.unshift(placeholder);}
 const signature=JSON.stringify(options.map(o=>[o.value,o.textContent]));
 if($('tasks').dataset.signature!==signature||$('tasks').options.length!==options.length){$('tasks').replaceChildren(...options);$('tasks').dataset.signature=signature;}
 $('tasks').value=tasks.some(t=>t.id===selected)?selected:'';
 $('tasks').disabled=!connected||!tasks.length;
}
function acceptFeed(data){if(data.version!==1||!Array.isArray(data.tasks))return;feed=data;connected=true;$('error').textContent='';const tasks=sessions(data.tasks);if(!tasks.some(t=>t.id===selected))selected=tasks.find(t=>t.id===data.primaryThreadId)?.id||tasks[0]?.id||'';render();}
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
 runtime?.setAgents(connected?teamFor(feed.tasks,selected):[],connected);
 renderSessions();
 $('history').replaceChildren();if(connected&&task)for(const e of (task.events||[]).slice(-5).reverse()){const li=document.createElement('li');li.textContent=`${new Date(e.time).toLocaleTimeString(language==='th'?'th-TH':'en-GB')} · ${e.message}`;$('history').append(li);}
}
function unavailable(){connected=false;feed=null;$('error').textContent=L('Reconnecting… If this continues, open Start Kubo again.','กำลังเชื่อมต่อใหม่… หากยังไม่สำเร็จ ให้เปิด Start Kubo อีกครั้ง');render();}
function connectLocal(){
 if(stream)return;
 $('disconnect').hidden=false;$('connect').hidden=true;
 stream=new EventSource('/api/events');lastPacket=Date.now();
 stream.onmessage=e=>{try{const data=JSON.parse(e.data);if(data.version!==1||!Array.isArray(data.tasks))return;lastPacket=Date.now();acceptFeed(data);}catch{unavailable();}};
 stream.onerror=unavailable;
 timer=setInterval(()=>{if(Date.now()-lastPacket>10000)unavailable();},2000);
}
$('tasks').onchange=()=>{selected=$('tasks').value;render();};
$('connect').onclick=()=>{if(localMode)connectLocal();else{$('setup').hidden=!$('setup').hidden;$('connect').setAttribute('aria-expanded',String(!$('setup').hidden));}};
$('disconnect').onclick=()=>{clearInterval(timer);timer=null;stream?.close();stream=null;connected=false;feed=null;$('error').textContent='';$('disconnect').hidden=true;$('connect').hidden=false;render();};
$('reset').onclick=()=>runtime?.resetView();
if(localMode){$('connect').dataset.en='Resume live activity';$('connect').dataset.th='เชื่อมต่ออีกครั้ง';$('setup').hidden=true;}
localize();
if(localMode)connectLocal();
try{runtime=await createWorkspace($('canvas'),()=>{},()=>{},()=>{}, {visualReporting:false});runtime.setTheme('midnight');$('loading').hidden=true;render();}catch{$('loading').textContent=L('The 3D room could not load. Refresh with WebGL enabled.','โหลดห้อง 3D ไม่สำเร็จ กรุณารีเฟรชและเปิด WebGL');}
addEventListener('pagehide',()=>{clearInterval(timer);stream?.close();stream=null;runtime?.dispose();});
addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
