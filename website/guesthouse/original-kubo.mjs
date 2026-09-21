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
 for(const clip of gltf.animations)actions.set(clip.name,mixer.clipAction(clip.name==='Celebrate'?repairClapClip(clip):clip));
 host.userData.originalKubo={mixer,actions,current:null};host.userData.greet=performance.now();return host;
}
export function animateOriginalKubo(host,now,dt,{camera,reduced}){
 const data=host.userData.originalKubo;
 const recent=(field,seconds)=>now-(host.userData[field]??-1e9)<seconds*1000;
 const lessonAction=recent('lessonActionAt',6)&&data.actions.has(host.userData.lessonAction)?host.userData.lessonAction:null;
 const name=reduced?'Idle':host.userData.lessonWalking&&data.actions.has('Walk')?'Walk':recent('celebrate',2)?'Celebrate':recent('mistake',1.6)?'Concerned':lessonAction|| (recent('greet',3)?'Wave':'Idle');
 if(!reduced&&lessonAction&&name===lessonAction&&data.lessonActionAt!==host.userData.lessonActionAt){data.actions.get(name)?.reset();data.lessonActionAt=host.userData.lessonActionAt;}
 if(data.current!==name){const previous=data.actions.get(data.current),next=data.actions.get(name)||data.actions.get('Idle');if(next){next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(.25).play();if(previous)previous.fadeOut(.25)}data.current=name;}
 const look=host.userData.lessonLook||camera.position;
 const yaw=Math.atan2(look.x-host.position.x,look.z-host.position.z);
 const delta=Math.atan2(Math.sin(yaw-host.rotation.y),Math.cos(yaw-host.rotation.y));
 host.rotation.y+=delta*(reduced?1:1-Math.exp(-dt*4));
 if(!reduced)data.mixer.update(dt);else {data.mixer.stopAllAction();const idle=data.actions.get('Idle');if(idle){idle.reset().play();idle.time=0;}data.mixer.update(0);}
}
