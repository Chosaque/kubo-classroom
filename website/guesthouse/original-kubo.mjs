import * as THREE from 'three';
export function repairClapClip(source){
 const clip=source.clone();
 // The exported clap sweeps through the shirt. Move the sleeve curve and
 // attached mittens forward together; retain fixed shoulder attachment points.
 for(const track of clip.tracks){
  const sleeve=track.name.match(/^sleeve_(?:-?1)_(\d+)\.position$/);
  const mitten=/^arm_mitten_-?1\.position$/.test(track.name);
  if(!sleeve&&!mitten)continue;
  const u=sleeve?Number(sleeve[1])/12:1;
  const x=Math.min(1,u/.2),offset=.85*x*x*(3-2*x);
  const smooth=v=>{const n=Math.max(0,Math.min(1,v));return n*n*(3-2*n)};
  for(let i=2;i<track.values.length;i+=3){const time=track.times[(i-2)/3];const envelope=smooth(time/.25)*smooth((clip.duration-time)/.25);track.values[i]+=offset*envelope;}
 }
 return clip;
}
// The original classroom mascot, with its authored skeletal animations intact.
export function createOriginalKubo(gltf){
 const host=new THREE.Group(),model=gltf.scene;
 model.traverse(o=>{if(o.name.startsWith('PROP_')||o.userData.outfit)o.visible=false;if(o.isMesh)o.frustumCulled=false});
 host.add(model);host.scale.setScalar(.68);host.position.set(-3.65,0,3.4);host.userData.motion={id:'kubo'};
 const mixer=new THREE.AnimationMixer(model),actions=new Map();
 for(const clip of gltf.animations){
  const action=mixer.clipAction(clip.name==='Celebrate'?repairClapClip(clip):clip);
  const continuous=clip.name==='Idle'||clip.name==='Walk';
  action.setLoop(continuous?THREE.LoopRepeat:THREE.LoopOnce,continuous?Infinity:1);
  action.clampWhenFinished=!continuous;
  actions.set(clip.name,action);
 }
 const idle=actions.get('Idle');if(idle){idle.play();mixer.update(0);}
 host.userData.originalKubo={mixer,actions,current:'Idle',transition:null,pending:null,playing:null,seen:{},reduced:false,lessonActive:false};host.userData.greet=performance.now();return host;
}
const TRANSITION_SECONDS=.25;
function eventRequests(host){
 const fields=[['greet','Wave'],['lessonActionAt',host.userData.lessonAction],['mistake','Concerned'],['celebrate','Celebrate']];
 return fields.map(([source,name])=>{
  const at=host.userData[source];
  const valid=typeof at==='number'&&Number.isFinite(at)&&at>=0&&typeof name==='string';
  return {source,name,at,token:valid?`${name}:${at}`:null};
 });
}
// Blend from the actual current weights, including interrupted transitions.
// Three's fadeIn/fadeOut start at fixed endpoints, which can jump if interrupted.
function transitionTo(data,name){
 const next=data.actions.get(name);if(!next)return;
 if(!next.isRunning()&&next.getEffectiveWeight()===0)next.reset().setEffectiveWeight(0).play();
 else if(!next.isScheduled())next.reset().setEffectiveWeight(0).play();
 const from=new Map([...data.actions].map(([key,action])=>[key,action.isScheduled()?action.getEffectiveWeight():0]));
 data.current=name;data.transition={from,elapsed:0};
}
function advanceBlend(data,dt){
 if(!data.transition)return;
 const transition=data.transition;
 transition.elapsed=Math.min(TRANSITION_SECONDS,transition.elapsed+dt);
 const fraction=transition.elapsed/TRANSITION_SECONDS,blend=fraction*fraction*(3-2*fraction);
 for(const [name,action] of data.actions){
  const weight=(transition.from.get(name)||0)*(1-blend)+(name===data.current?blend:0);
  action.setEffectiveWeight(weight);
  if(fraction===1&&name!==data.current&&action.isScheduled())action.stop();
 }
 if(fraction===1)data.transition=null;
}
export function animateOriginalKubo(host,now,dt,{camera,reduced}){
 const data=host.userData.originalKubo;
 const elapsed=Number.isFinite(dt)?Math.max(0,Math.min(dt,.05)):0;
 const requests=eventRequests(host),lessonActive=Boolean(host.userData.lessonAction);
 const leavingLesson=data.lessonActive&&!lessonActive;data.lessonActive=lessonActive;
 const invalidated=request=>request&&!requests.some(event=>event.source===request.source&&event.token===request.token);
 if(invalidated(data.pending))data.pending=null;
 if(invalidated(data.playing)){data.playing=null;if(data.current!=='Idle')transitionTo(data,'Idle');}
 if(leavingLesson){data.pending=null;data.playing=null;if(data.current!=='Idle')transitionTo(data,'Idle');}
 for(const event of requests){
  if(data.seen[event.source]!==event.token){
   data.seen[event.source]=event.token;
   // Negative/reset fields cancel actions; each valid request is consumed once.
   // Later entries win simultaneous requests: reaction > lesson > greeting.
   if(!reduced&&!leavingLesson&&event.token&&data.actions.has(event.name))data.pending=event;
  }
 }
 if(reduced){
  data.pending=null;data.playing=null;data.transition=null;
  if(!data.reduced){
   data.mixer.stopAllAction();
   for(const action of data.actions.values())action.setEffectiveWeight(0);
   const idle=data.actions.get('Idle');if(idle){idle.reset().setEffectiveWeight(1).play();idle.time=0;}
   data.current='Idle';data.mixer.update(0);
  }
  data.reduced=true;
 }else{
  data.reduced=false;
  if(host.userData.lessonWalking&&data.actions.has('Walk')){
   data.playing=null;
   if(data.current!=='Walk')transitionTo(data,'Walk');
  }else if(data.pending){
   const action=data.actions.get(data.pending.name);
   if(action.isScheduled()&&action.getEffectiveWeight()>0){
    // Same-clip replay (or a very quick return to a fading clip): first fade
    // through Idle, then restart only once that clip has no visible influence.
    data.playing=null;if(data.current!=='Idle')transitionTo(data,'Idle');
   }else{
    action.reset().setEffectiveTimeScale(1).setEffectiveWeight(0).play();
    data.playing=data.pending;data.pending=null;transitionTo(data,data.playing.name);
   }
  }else if(data.playing){
   const action=data.actions.get(data.playing.name);
   if(action.paused&&action.time>=action.getClip().duration){data.playing=null;transitionTo(data,'Idle');}
  }else if(data.current!=='Idle')transitionTo(data,'Idle');
  advanceBlend(data,elapsed);
  data.mixer.update(elapsed);
 }
 const look=host.userData.lessonLook||camera.position;
 const yaw=Math.atan2(look.x-host.position.x,look.z-host.position.z);
 const delta=Math.atan2(Math.sin(yaw-host.rotation.y),Math.cos(yaw-host.rotation.y));
 host.rotation.y+=delta*(reduced?1:1-Math.exp(-elapsed*4));
}
