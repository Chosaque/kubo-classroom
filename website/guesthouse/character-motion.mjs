// Small part-based character animation. No skeleton or external animation runtime.
import * as THREE from 'three';

export function sampleMotion(seconds,index,{reduced=false,celebrationAge=99,greetingAge=99,mistakeAge=99}={}) {
 if(reduced)return {blink:1,bob:0,breath:1,sway:0,wave:0,shake:0};
 const phase=index*1.73;
 const blinkTime=(seconds+phase)%(4.3+index*.53);
 const blink=blinkTime<.18?Math.max(.06,Math.abs(blinkTime-.09)/.09):1;
 const celebrating=celebrationAge>=0&&celebrationAge<1.2;
 const greeting=greetingAge>=0&&greetingAge<1.6;
 return {
  blink,
  bob:index===1?.065+.055*Math.sin(seconds*1.8+phase):0,
  breath:1+.012*Math.sin(seconds*2+phase),
  sway:.025*Math.sin(seconds*1.25+phase),
  wave:greeting?Math.sin(greetingAge*Math.PI/1.6)*(.24+.12*Math.sin(greetingAge*13)):celebrating?.28*Math.sin(celebrationAge*12):.04*Math.sin(seconds*2+phase),
  shake:mistakeAge>=0&&mistakeAge<.7?Math.sin(mistakeAge*22)*.10*(1-mistakeAge/.7):0,
  hop:celebrating?Math.abs(Math.sin(celebrationAge*Math.PI/1.2))*.16:0
 };
}

export function prepareCharacter(model,id,index) {
 model.updateMatrixWorld(true);
 const eyes=[];const tentacles=[];const arms=[];
 model.traverse(o=>{if(o.isMesh){if(/eye|pupil|catchlight/i.test(o.name))eyes.push(o);if(/tentacle/i.test(o.name))tentacles.push(o);if(id==='pip'&&/arm/i.test(o.name))arms.push(o)}});
 function pivotFor(objects,top=false){
  const bounds=new THREE.Box3();objects.forEach(o=>bounds.expandByObject(o));
  const centre=bounds.getCenter(new THREE.Vector3());if(top)centre.y=bounds.max.y-.035;
  const pivot=new THREE.Group();pivot.position.copy(centre);model.add(pivot);model.updateMatrixWorld(true);
  objects.forEach(o=>pivot.attach(o));return pivot;
 }
 const blinkPivot=eyes.length?pivotFor(eyes):null;
 const limbPivots=tentacles.map(o=>pivotFor([o],true));
 const armPivots=arms.map(o=>{
  // Blender's arm origins are seated shoulder pivots, not mesh centres.
  const pivot=new THREE.Group();o.getWorldPosition(pivot.position);model.add(pivot);model.updateMatrixWorld(true);pivot.attach(o);return pivot;
 });
 model.userData.motion={id,index,blinkPivot,limbPivots,armPivots,yaw:0};
 return model;
}

export function animateCharacter(model,now,dt,{selected,camera,reduced}) {
 const data=model.userData.motion;if(!data)return;
 const pose=sampleMotion(now/1000,data.index,{reduced,celebrationAge:(now-(model.userData.celebrate??-1e6))/1000,greetingAge:(now-(model.userData.greet??-1e6))/1000,mistakeAge:(now-(model.userData.mistake??-1e6))/1000});
 const chosen=selected===data.id;
 const target=chosen?Math.atan2(camera.position.x-model.position.x,camera.position.z-model.position.z):[.08,-.16,.12,-.22][data.index];
 data.yaw=reduced?target:THREE.MathUtils.lerp(data.yaw,target,1-Math.exp(-dt*5));
 model.rotation.y=data.yaw+(chosen?0:pose.sway)+pose.shake;
 const base=model.userData.restScale??1;
 model.scale.set(base/Math.sqrt(pose.breath),base*pose.breath,base/Math.sqrt(pose.breath));
 model.position.y=(model.userData.baseY??0)+pose.bob+(pose.hop||0);
 if(data.blinkPivot)data.blinkPivot.scale.y=pose.blink;
 data.limbPivots.forEach((p,i)=>{p.rotation.z=reduced?0:Math.sin(now/650+i*1.4)*.10;p.rotation.x=reduced?0:Math.sin(now/780+i)*.07});
 data.armPivots.forEach((p,i)=>{p.rotation.z=(i===1?1:-1)*pose.wave});
}
