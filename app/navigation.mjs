export const START = [-.30,1.49];
export const RADIUS = .59;
export const STATIONS = [
 {id:'station-1',number:1,name:'Context Desk',detail:'context window · PC',target:[.28,1.352],look:[.28,-.48],arrival:'working'},
 {id:'station-2',number:2,name:'Safe',detail:'CLAUDE.md',target:[-3.822,-2.150],look:[-3.822,-3.864],arrival:'working'},
 {id:'station-3',number:3,name:'Shortcut',detail:'SKILL.md',target:[-3.08,1.96],look:[-3.08,.84],arrival:'working'},
 {id:'station-4',number:4,name:'Skill Files',detail:'SKILL.md',target:[3.668,-2.100],look:[3.668,-3.708],arrival:'working'},
 {id:'station-5',number:5,name:'Helper Station',detail:'data-check.md',target:[2.30,2.036],look:[3.78,1.596],arrival:'working'},
 {id:'station-6',number:6,name:'Permission Door',detail:'approval / access',target:[-5.098,2.401],look:[-5.718,2.401],arrival:'waiting'},
 {id:'station-7',number:7,name:'Document Intake',detail:'MCP + external files',target:[.60,3.638],look:[2.03,3.808],arrival:'working'},
 {id:'station-8',number:8,name:'Task Board',detail:'task list',target:[.07,-3.964],look:[.07,-4.599],arrival:'working'},
];
export const OBSTACLES = [
 [-1.425,1.425,-.943,.607],[-4.457,-3.187,-4.414,-3.314],
 [-3.54,-2.62,.43,1.25],[2.943,4.393,-4.363,-3.253],
 [3,4.56,1.041,2.151],[1.30,2.76,3.398,4.218],
];
const bounds=[-5.15,5.15,-4.108,4.168];
export function free([x,z]) {
 return x>=bounds[0]&&x<=bounds[1]&&z>=bounds[2]&&z<=bounds[3]&&!OBSTACLES.some(([a,b,c,d])=>x>a-RADIUS&&x<b+RADIUS&&z>c-RADIUS&&z<d+RADIUS);
}
export function clear(a,b){
 if(!free(a)||!free(b))return false;
 // Exact segment/rectangle intersections avoid skipping a tiny furniture corner.
 for(const [x0,x1,z0,z1] of OBSTACLES){
  let lo=0,hi=1;
  for(const [axis,min,max] of [[0,x0-RADIUS-1e-6,x1+RADIUS+1e-6],[1,z0-RADIUS-1e-6,z1+RADIUS+1e-6]]){
   const delta=b[axis]-a[axis];
   if(Math.abs(delta)<1e-12){if(a[axis]<min||a[axis]>max){lo=2;break;}}
   else{const t0=(min-a[axis])/delta,t1=(max-a[axis])/delta;lo=Math.max(lo,Math.min(t0,t1));hi=Math.min(hi,Math.max(t0,t1));}
  }
  if(lo<=hi)return false;
 }
 return true;
}
const step=.05;
const key=(x,z)=>`${x},${z}`;
function nearest(point){
 const x=Math.round(point[0]/step),z=Math.round(point[1]/step);
 for(let r=0;r<8;r++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){
  const p=[(x+dx)*step,(z+dz)*step];if(free(p)&&clear(point,p))return [x+dx,z+dz];
 }
 return null;
}
export function planPath(start,end){
 if(!free(start)||!free(end))return null;
 if(clear(start,end))return [start.slice(),end.slice()];
 const from=nearest(start),to=nearest(end);if(!from||!to)return null;
 const heuristic=(x,z)=>Math.hypot(x-to[0],z-to[1]);
 const open=[{x:from[0],z:from[1],g:0,f:heuristic(...from)}], costs=new Map([[key(...from),0]]),parent=new Map(),closed=new Set();
 let found=false;
 while(open.length){
  let best=0;for(let i=1;i<open.length;i++)if(open[i].f<open[best].f)best=i;
  const n=open.splice(best,1)[0],k=key(n.x,n.z);if(closed.has(k))continue;closed.add(k);
  if(n.x===to[0]&&n.z===to[1]){found=true;break;}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const x=n.x+dx,z=n.z+dz,nk=key(x,z),g=n.g+Math.hypot(dx,dz);
   if(closed.has(nk)||g>=(costs.get(nk)??Infinity)||!clear([n.x*step,n.z*step],[x*step,z*step]))continue;
   costs.set(nk,g);parent.set(nk,k);open.push({x,z,g,f:g+heuristic(x,z)});
  }
 }
 if(!found)return null;
 let k=key(...to),raw=[end.slice()];while(k){raw.push(k.split(',').map(Number).map(v=>v*step));k=parent.get(k);}raw.push(start.slice());raw.reverse();
 const smooth=[raw[0]];let i=0;while(i<raw.length-1){let j=raw.length-1;while(j>i+1&&!clear(raw[i],raw[j]))j--;smooth.push(raw[j]);i=j;}return smooth;
}
export class Movement {
 constructor(emit=()=>{}){this.emit=emit;this.position=START.slice();this.state='idle';this.stationId=null;this.path=[];this.index=0;this.heading=0;this.revision=0;this.arrivalMode='idle';}
 snapshot(){return {position:this.position.slice(),state:this.state,stationId:this.stationId,path:this.path.map(p=>p.slice()),heading:this.heading,revision:this.revision};}
 cancel(reason){if(['running','turning'].includes(this.state))this.emit('movement_cancelled',{stationId:this.stationId,reason});}
 go(id,source='click'){
  const station=STATIONS.find(s=>s.id===id);if(!station)throw new Error('Unknown station ID');
  if(source==='click')this.emit('station_clicked',{stationId:id});
  if(this.stationId===id&&this.state!=='idle')return this.snapshot();
  const path=planPath(this.position,station.target);if(!path){this.emit('movement_error',{stationId:id,reason:'No clear route'});return this.snapshot();}
  this.cancel('new_destination');this.stationId=id;this.path=path;this.index=1;this.state='running';this.arrivalMode=station.arrival;this.revision++;this.emit('cube_guy_departed',{stationId:id,source});return this.snapshot();
 }
 reset(){this.cancel('reset');this.position=START.slice();this.state='idle';this.stationId=null;this.path=[];this.heading=0;this.revision++;this.emit('cube_guy_reset',{});return this.snapshot();}
 pause(reason='paused'){if(this.state!=='idle'||this.path.length){this.cancel(reason);this.state='idle';this.path=[];this.revision++;}return this.snapshot();}
 command(input){
  if(!input||typeof input!=='object')throw new Error('Command must be an object');
  if(input.action==='go_to_station')return this.go(input.stationId,'agent');
  if(input.action==='reset')return this.reset();
  if(input.action==='return_to_center'){
   const route=planPath(this.position,START);if(!route)throw new Error('No route to center');this.cancel('return_to_center');this.stationId=null;this.path=route;this.index=1;this.arrivalMode='idle';this.state='running';this.revision++;this.emit('cube_guy_departed',{stationId:null,source:'agent'});return this.snapshot();
  }
  if(['begin_work','wait_for_approval'].includes(input.action)){
   if(!this.stationId||['running','turning'].includes(this.state))throw new Error('Kubo must arrive at a station first');
   this.state=input.action==='begin_work'?'working':'waiting';this.emit(this.state==='working'?'cube_guy_working':'approval_waiting',{stationId:this.stationId});return this.snapshot();
  }
  throw new Error('Unsupported action');
 }
 update(dt){
  if(this.state==='running'){
   let budget=Math.min(dt,.05)*1.5;
   while(budget>0&&this.index<this.path.length){const p=this.path[this.index],dx=p[0]-this.position[0],dz=p[1]-this.position[1],distance=Math.hypot(dx,dz);this.heading=Math.atan2(dx,dz);
    if(distance<=budget){this.position=p.slice();this.index++;budget-=distance;}else{this.position[0]+=dx/distance*budget;this.position[1]+=dz/distance*budget;budget=0;}
   }
   if(this.index>=this.path.length){this.state='turning';this.turnTime=.25;const station=STATIONS.find(s=>s.id===this.stationId);this.finalHeading=station?Math.atan2(station.look[0]-this.position[0],station.look[1]-this.position[1]):0;}
  }else if(this.state==='turning'){
   this.turnTime-=dt;this.heading=this.finalHeading;
   if(this.turnTime<=0){this.state=this.arrivalMode;this.path=[];this.revision++;this.emit('cube_guy_arrived',{stationId:this.stationId});if(this.state==='working')this.emit('cube_guy_working',{stationId:this.stationId});if(this.state==='waiting')this.emit('approval_waiting',{stationId:this.stationId});}
  }
 }
}
