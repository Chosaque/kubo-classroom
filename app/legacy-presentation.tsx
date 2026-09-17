'use client';
import {useEffect,useRef,useState} from 'react';
import {useLanguage,LanguageProvider,LanguageSwitch} from './language';
import DeskLesson from './context-story';
import LessonIntro from './lesson-intro';
import ContextTools from './context-tools';
import PromptLesson from './prompt-lesson';
import PermissionLesson from './permission-lesson';
import InjectionLesson from './injection-lesson';
import TokenLesson from './token-lesson';
import {teamFor,agentStatus,DEMO_AGENTS,AGENT_COLORS} from './agent-team-state.mjs';
// @ts-ignore Shared expression choices.
import {EXPRESSIONS} from './face-expressions.mjs';
import {Button} from '@/components/ui/button';
import {SidebarProvider,Sidebar,SidebarContent,SidebarHeader,SidebarMenu,SidebarMenuItem,SidebarMenuButton,SidebarTrigger,useSidebar} from '@/components/ui/sidebar';
import {Box,RotateCcw,House,Radio,X,SlidersHorizontal} from 'lucide-react';
// @ts-ignore Shared preference validation.
import {THEMES,OUTFITS,taskActive,roomVisible} from './room-preferences.mjs';
// @ts-ignore Shared with the local navigation tests.
import {STATIONS} from './navigation.mjs';
// @ts-ignore Shared beginner-friendly station descriptions.
import {STATION_HELP} from './station-help.mjs';
type Task={isAgent?:boolean;parentId?:string;id:string;title:string;state:string;runtimeState?:string;lastEventAt:string|null;activity:string;stationId:string|null;stale:boolean;readable:boolean;events:any[];progress?:{id:string;stage:string;source:string}};
type Feed={connection:string;primaryThreadId:string|null;tasks:Task[];lastPollAt:string|null;serverTime:string};
const states:Record<string,string>={active:'Active',waiting:'Needs input',completed:'Turn completed',interrupted:'Interrupted',unknown:'No recent event'};
function StationChoice({station,selected,locked,onChoose,onHighlight}:{station:{id:keyof typeof STATION_HELP;number:number;name:string};selected:boolean;locked:boolean;onChoose:()=>void;onHighlight:(id:string|null)=>void}){
 const {L}=useLanguage();
 return L(<div className="station-item"><button className="station-button" aria-label={`${station.number} ${station.name}`} aria-pressed={selected} aria-disabled={locked} aria-describedby={`help-${station.id}`} onMouseEnter={()=>onHighlight(station.id)} onMouseLeave={()=>onHighlight(null)} onFocus={()=>onHighlight(station.id)} onBlur={()=>onHighlight(null)} onClick={()=>{if(!locked)onChoose();}}><b>{station.number}</b><strong>{station.name}</strong></button><p id={`help-${station.id}`} className="station-explanation">{STATION_HELP[station.id]}</p></div>);
}
function RoomChoice({task,selected,onSelect,onHide}:{task:Task;selected:boolean;onSelect:()=>void;onHide:()=>void}){
 const {L}=useLanguage();
 const {setOpenMobile}=useSidebar();
 return L(<SidebarMenuItem className="office-card"><SidebarMenuButton className="room-button" isActive={selected} onClick={()=>{onSelect();setOpenMobile(false);}} title={task.title}><span className={`room-dot ${task.state}`}/><span><strong>{task.title}</strong><small>{task.stale?'No recent update':states[task.state]}</small></span></SidebarMenuButton>{!taskActive(task)&&<button className="hide-office" onClick={onHide} aria-label={`Hide office: ${task.title}`} title="Hide until this task runs again"><X size={14}/></button>}</SidebarMenuItem>);
}
export function Workspace({presentationMode=false}:{presentationMode?:boolean}={}){
 const Surface=presentationMode?'section':'main';
 const {L}=useLanguage();
 const host=useRef<HTMLDivElement>(null),api=useRef<any>(null);
 const publicDemo=presentationMode||typeof window!=='undefined'&&(window.location.hostname.endsWith('.github.io')||window.location.hostname.endsWith('.vercel.app'));
 const [snapshot,setSnapshot]=useState({state:'loading',stationId:null as string|null,animationLabel:''}),[ready,setReady]=useState(false),[error,setError]=useState('');
 const [feed,setFeed]=useState<Feed|null>(null),[transport,setTransport]=useState(false),[taskId,setTaskId]=useState(''),[follow,setFollow]=useState(true),[now,setNow]=useState(0);
 const lastPacket=useRef(0),[motionEvents,setMotionEvents]=useState<any[]>([]);
 const [hidden,setHidden]=useState<Record<string,number>>({}),[theme,setTheme]=useState('cream'),[outfit,setOutfit]=useState('original'),[preferencesReady,setPreferencesReady]=useState(false);
 const [expression,setExpression]=useState('auto');
 useEffect(()=>{try{const p=JSON.parse(localStorage.getItem('cube-preferences-v1')||'{}');if(THEMES.includes(p.theme))setTheme(p.theme);if(OUTFITS.includes(p.outfit))setOutfit(p.outfit);if(EXPRESSIONS.includes(p.expression))setExpression(p.expression);if(p.hidden&&typeof p.hidden==='object')setHidden(Object.fromEntries(Object.entries(p.hidden).filter(([,v])=>typeof v==='number')) as Record<string,number>);}catch{}setPreferencesReady(true);},[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;if(preferencesReady)try{localStorage.setItem('cube-preferences-v1',JSON.stringify({theme,outfit,expression,hidden}));}catch{}},[theme,outfit,expression,hidden,preferencesReady]);
 useEffect(()=>{if(ready)api.current?.setExpression(expression);},[ready,expression]);
 useEffect(()=>{if(ready)api.current?.setOutfit(outfit);},[ready,outfit]);
 useEffect(()=>{if(ready)api.current?.setTheme(theme);},[ready,theme]);
 useEffect(()=>{let disposed=false;let runtime:any;
  import('./interactive-runtime.js').then(m=>m.createWorkspace(host.current,setSnapshot,(e:any)=>setMotionEvents(list=>[e,...list].slice(0,80)),()=>setFollow(false))).then(r=>{runtime=r;if(disposed)r.dispose();else{api.current=r;setReady(true);}}).catch(e=>{if(!disposed)setError(e.message||'Could not load the room');});
  return()=>{disposed=true;runtime?.dispose();};
 },[]);
 useEffect(()=>{
  if(publicDemo){const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);}
  const events=new EventSource('/api/events');
  events.onmessage=e=>{try{const data=JSON.parse(e.data);if(data.version!==1||!Array.isArray(data.tasks))return;lastPacket.current=Date.now();setTransport(true);setFeed(data);setTaskId(current=>data.tasks.some((t:Task)=>t.id===current)?current:(data.tasks.some((t:Task)=>t.id===data.primaryThreadId)?data.primaryThreadId:data.tasks[0]?.id||''));}catch{}};
  events.onerror=()=>setTransport(false);
  const timer=setInterval(()=>{setNow(Date.now());if(Date.now()-lastPacket.current>12000)setTransport(false);},1000);
  return()=>{events.close();clearInterval(timer);};
 },[publicDemo]);
 const visibleTasks=feed?.tasks.filter(t=>!t.isAgent&&roomVisible(t,hidden))||[];
 const [agentPreview,setAgentPreview]=useState(false);
 useEffect(()=>{if(feed&&!visibleTasks.some(t=>t.id===taskId))setTaskId(visibleTasks[0]?.id||'');},[feed,hidden,taskId]);
 const task=visibleTasks.find(t=>t.id===taskId),connected=transport&&feed?.connection==='connected';
 const helperBusy=teamFor(feed?.tasks||[],taskId).some((a:Task)=>['active','waiting'].includes(a.runtimeState||a.state));
 const locked=helperBusy||!!task&&['active','waiting'].includes(task.runtimeState||task.state),effectiveFollow=publicDemo?false:follow||locked;
 const stale=!!task&&(task.stale||task.state==='active'&&!task.progress&&now-Date.parse(task.lastEventAt||'')>20000);
 useEffect(()=>{if(ready)api.current?.setLiveTask(task?{...task,stale,runtimeState:helperBusy?'active':task.runtimeState}:null,connected,effectiveFollow);},[ready,task,connected,effectiveFollow,stale,helperBusy]);
 const helperTeam=publicDemo&&agentPreview?DEMO_AGENTS.map(a=>({...a,lastEventAt:new Date(now||Date.now()).toISOString()})):teamFor(feed?.tasks||[],taskId);
 useEffect(()=>{if(ready)api.current?.setAgents(helperTeam,publicDemo?agentPreview:!!connected);},[ready,feed,taskId,now,agentPreview,connected,publicDemo]);
 const selected=STATIONS.find((s:any)=>s.id===snapshot.stationId);
 const label:Record<string,string>={loading:'Opening the room…',idle:'Idle',running:'Running',turning:'Turning',working:'Working animation',waiting:'Waiting animation'};
 const status=publicDemo?'Visual demo':!connected?'Updates disconnected':!task?.readable?'Task records unavailable':stale?'No recent update':task?.progress?.stage==='done'&&locked?'Wrapping up':states[task?.state||'unknown'];
 const ago=task?.lastEventAt&&now?`${Math.max(0,Math.floor((now-Date.parse(task.lastEventAt))/1000))}s ago`:'—';
 return L(<SidebarProvider style={{'--sidebar-width':'255px'} as any}><Sidebar className="rooms-sidebar"><div className="rooms-panel"><SidebarHeader><div className="rooms-heading"><Box size={21}/><strong>Working rooms</strong></div><p>One room per local task</p></SidebarHeader><SidebarContent><SidebarMenu aria-label="Task rooms">{visibleTasks.map(t=><RoomChoice key={t.id} task={t} selected={taskId===t.id} onSelect={()=>setTaskId(t.id)} onHide={()=>setHidden(h=>({...h,[t.id]:Date.now()}))}/>)}</SidebarMenu>{!visibleTasks.length&&<p className="rooms-empty">No offices to show. A task will appear when it starts.</p>}{Object.keys(hidden).length>0&&<Button variant="ghost" onClick={()=>setHidden({})}>Show hidden offices</Button>}</SidebarContent></div></Sidebar>
 <Surface className={`workspace live-workspace ${presentationMode?'office-presentation-mode':''}`} data-ready={ready} data-state={snapshot.state} data-station={snapshot.stationId||'none'} data-task={taskId} data-connected={!!connected} data-follow={effectiveFollow} data-locked={locked}>
  <header><div className="brand"><SidebarTrigger/><h1>Agentic Dashboard</h1></div><div className="header-actions"><span className={`local ${(connected||publicDemo)?'':'offline'}`}><i/>{publicDemo?'Visual demo':connected?'Connected':'Disconnected'}</span><details className="customize-menu"><summary><SlidersHorizontal size={17}/>Customize</summary><div className="personalize"><label>Colors<select aria-label="Color theme" value={theme} onChange={e=>setTheme(e.target.value)}><option value="cream">Warm cream</option><option value="mint">Soft mint</option><option value="lavender">Lilac pastel</option></select></label><label>Outfit<select aria-label="Kubo outfit" value={outfit} onChange={e=>setOutfit(e.target.value)}><option value="original">Classic office</option><option value="overalls">Mint overalls</option><option value="pinafore">Rose pinafore</option><option value="hijab">Lilac hijab + pinafore</option></select></label><label>Face<select aria-label="Kubo expression" value={expression} onChange={e=>setExpression(e.target.value)}><option value="auto">Automatic</option><option value="angry">Angry</option><option value="tired">Tired</option><option value="sad">Sad</option><option value="motivated">Motivated</option></select></label></div></details></div></header>
  <div className="live-summary"><div><p>{publicDemo?'Kubo’s visual workspace':task?.title||'Live workspace'}</p><strong>{status}</strong><span>{publicDemo?'Explore Kubo and the eight stations. Live work remains on the PC dashboard.':task?.activity||'Waiting for a public task event'}{publicDemo?'':` · ${ago}`}</span></div>{!publicDemo&&<Button disabled={locked} variant={effectiveFollow?'default':'outline'} onClick={()=>setFollow(v=>!v)}><Radio size={16}/>{locked?'Live task · locked':effectiveFollow?'Following live':'Resume live'}</Button>}</div>
  <p className="original-language-note">Live task titles and messages stay in their original language.</p><div className="main-grid"><section className="scene" aria-label="Interactive office"><div ref={host} className="canvas-host"/>
   {!ready&&<div role="status" className="loading">{error||'Opening the room…'}{error&&<Button onClick={()=>location.reload()}>Reload</Button>}</div>}
   <div className="scene-controls"><Button variant="ghost" aria-label="Reset camera view" title="Reset camera view" onClick={()=>api.current?.resetView()}><RotateCcw size={17}/></Button><span className="camera-hint">Drag to look around · Pinch or scroll to zoom</span></div>
  </section><aside className="station-panel"><div className="current" aria-live="polite"><p>KUBO</p><h2>{snapshot.animationLabel||label[snapshot.state]||snapshot.state}</h2><span>{selected?selected.name:'Ready in this room'}</span></div><p className="learning-context">{selected?STATION_HELP[selected.id as keyof typeof STATION_HELP]:'Your companion follows the work happening in this task.'}</p><div className="activity-card"><small>{publicDemo?'TRY IT OUT':'CURRENT ACTIVITY'}</small><p>{publicDemo?'Open Explore the stations to discover how your AI agent works.':!connected?'Live updates are disconnected. The current activity cannot be confirmed.':stale?'There is no recent update to confirm the current activity.':task?.activity||'Start a task in Codex to follow its activity here.'}</p><span className="activity-status"><i/>{status}</span></div><section className="agent-team"><h3>Kubo’s team</h3>{publicDemo?<><p className="demo-label">Visual preview · no agents are started</p><Button variant="outline" onClick={()=>setAgentPreview(v=>!v)}>{agentPreview?'Hide agent preview':'Show agent preview'}</Button></>:<p>Small Kubos appear when this task spawns helper agents.</p>}{helperTeam.length?<ul>{helperTeam.map((a:any,i:number)=><li key={a.id} style={{'--agent-color':AGENT_COLORS[i%4]} as any}><strong>{a.title}</strong><small>{agentStatus(a,publicDemo?agentPreview:!!connected,now||Date.now())}</small><small>{a.activity}</small></li>)}</ul>:<p>No helper agents in this office yet.</p>}{helperTeam.length>4&&<p>Showing four helpers in the room. The full team is listed here.</p>}</section><details className="task-details"><summary>View task details</summary><p>{publicDemo?'This is a visual demonstration. Your live tasks stay on the local dashboard.':`Last reported activity: ${ago}. Progress appears only when the task reports it.`}</p><p>{locked?'Kubo is following the active task. Station movement is locked.':'You can explore the stations or resume live following.'}</p><Button variant="outline" disabled={!ready||locked} onClick={()=>api.current?.reset()}><House size={16}/>Return Kubo to center</Button></details><details className="station-guide" open={presentationMode||undefined} onToggle={e=>{if(!e.currentTarget.open)api.current?.highlight(null);}}><summary>Explore the stations</summary><p>Each place represents a different part of an AI agent’s work. Hover or focus a station to find it in the room.</p><nav aria-label="Stations">{STATIONS.map((s:any)=><StationChoice key={s.id} station={s} selected={snapshot.stationId===s.id} locked={!ready||locked} onChoose={()=>api.current?.choose(s.id)} onHighlight={id=>api.current?.highlight(id)}/>)}</nav></details></aside></div>
 </Surface></SidebarProvider>);
}

function Welcome(){
 const {L,language}=useLanguage();
 const host=useRef<HTMLDivElement>(null);const [error,setError]=useState('');
 useEffect(()=>{let stopped=false;let clean:(()=>void)|undefined;import('./welcome-scene.mjs').then(m=>m.createWelcome(host.current)).then(fn=>{if(stopped)fn();else clean=fn;}).catch(()=>setError('Kubo could not load. Please refresh to try again.'));return()=>{stopped=true;clean?.();};},[]);
 return L(<section className="welcome-stage" aria-label="Welcome to the Agentic AI presentation"><div ref={host} className="welcome-character" role="img" aria-label="Kubo waving behind the Welcome sign"/><div className="welcome-sign"><h1>Welcome</h1></div><a className="welcome-continue" href="#qi-01">{language==='th'?'เริ่มเรียน →':'Continue →'}</a>{error&&<p className="welcome-error" role="status">{error}</p>}</section>);
}

function Presentation(){
 const {L}=useLanguage();
 const [tab,setTab]=useState('welcome');
 useEffect(()=>{const sync=()=>setTab(['#qi-01','#qi-02','#qi-03','#qi-04','#qi-05','#qi-06','#qi-07'].includes(location.hash)?location.hash.slice(1):'welcome');sync();addEventListener('hashchange',sync);return()=>removeEventListener('hashchange',sync);},[]);
 return L(<div className="presentation"><div className="presentation-toolbar"><nav className="chapter-tabs" aria-label="Presentation chapters"><a href="#welcome" aria-current={tab==='welcome'?'page':undefined} onClick={()=>setTab('welcome')}>Welcome</a><a href="#qi-01" aria-current={tab==='qi-01'?'page':undefined} onClick={()=>setTab('qi-01')}>QI-01 · Agent’s Desk</a><a href="#qi-02" aria-current={tab==='qi-02'?'page':undefined} onClick={()=>setTab('qi-02')}>QI-02 · Organize</a><a href="#qi-03" aria-current={tab==='qi-03'?'page':undefined} onClick={()=>setTab('qi-03')}>QI-03 · Instructions</a><a href="#qi-04" aria-current={tab==='qi-04'?'page':undefined} onClick={()=>setTab('qi-04')}>QI-04 · Permission</a><a href="#qi-05" aria-current={tab==='qi-05'?'page':undefined} onClick={()=>setTab('qi-05')}>QI-05 · Spot the trick</a><a href="#qi-06" aria-current={tab==='qi-06'?'page':undefined} onClick={()=>setTab('qi-06')}>QI-06 · Tokens</a><a href="#qi-07" aria-current={tab==='qi-07'?'page':undefined} onClick={()=>setTab('qi-07')}>QI-07 · Workspace</a></nav><LanguageSwitch/></div>{tab==='welcome'?<Welcome/>:<LessonIntro key={tab} chapter={tab}>{tab==='qi-01'?<DeskLesson/>:tab==='qi-02'?<ContextTools/>:tab==='qi-03'?<PromptLesson/>:tab==='qi-04'?<PermissionLesson/>:tab==='qi-05'?<InjectionLesson/>:tab==='qi-06'?<TokenLesson/>:<Workspace/>}</LessonIntro>}</div>);
}
export default function LocalizedPresentation(){return <LanguageProvider><Presentation/></LanguageProvider>;}
