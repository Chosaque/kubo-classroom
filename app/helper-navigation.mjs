import {STATIONS,free,planPath} from './navigation.mjs';
export const HELPER_HOMES=[[-3.45,3],[-.5,3],[4.2,3.15],[4.4,-.3]];
export function helperStation(agent,status){
 if(status==='Needs your input')return 'station-6';
 if(status==='Thinking')return 'station-1';
 if(status==='Working')return STATIONS.some(s=>s.id===agent.stationId)?agent.stationId:'station-1';
 return null;
}
export function helperTarget(stationId,reserved=[]){
 const station=STATIONS.find(s=>s.id===stationId);if(!station)return null;
 const [x,z]=station.target,dx=station.look[0]-x,dz=station.look[1]-z,length=Math.hypot(dx,dz),forward=[dx/length,dz/length],side=[-forward[1],forward[0]];
 for(const back of [0,.7,1.4])for(const offset of [.7,-.7,1.4,-1.4,0]){
  const point=[x+side[0]*offset-forward[0]*back,z+side[1]*offset-forward[1]*back];
  if(free(point)&&Math.hypot(point[0]-x,point[1]-z)>=.65&&reserved.every(p=>Math.hypot(point[0]-p[0],point[1]-p[1])>=.65))return point;
 }
 return null;
}
export class HelperJourney{
 constructor(home){this.home=[...home];this.position=[...home];this.path=[];this.heading=0;this.stationId=null;this.state='idle';this.key='';this.target=[...home];}
 go(stationId,target){
  const key=JSON.stringify([stationId,target]);if(this.key===key)return;
  this.key=key;this.stationId=stationId;this.target=target&&[...target];
  const route=target&&planPath(this.position,target);
  this.path=route?route.slice(1):[];this.state=route?'walking':'blocked';
 }
 pause(){this.path=[];this.state='idle';this.key='';}
 update(dt){
  if(this.state!=='walking')return;
  let budget=Math.min(dt,.05)*1.8;
  while(this.path.length&&budget>0){const p=this.path[0],dx=p[0]-this.position[0],dz=p[1]-this.position[1],distance=Math.hypot(dx,dz);
   if(distance>.001)this.heading=Math.atan2(dx,dz);
   if(distance<=budget){this.position=[...p];this.path.shift();budget-=distance;}else{this.position[0]+=dx/distance*budget;this.position[1]+=dz/distance*budget;budget=0;}
  }
  if(!this.path.length){this.state=this.stationId?'working':'idle';const station=STATIONS.find(s=>s.id===this.stationId);if(station)this.heading=Math.atan2(station.look[0]-this.position[0],station.look[1]-this.position[1]);}
 }
}
