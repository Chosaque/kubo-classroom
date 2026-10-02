import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createOriginalKubo, animateOriginalKubo } from './original-kubo.mjs';

const bytes=await readFile(new URL('./models/kubo-original.glb',import.meta.url));
const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
function fixture(){
 const host=createOriginalKubo({scene:asset.scene.clone(true),animations:asset.animations});
 host.userData.greet=-1;
 const data=host.userData.originalKubo,camera=new THREE.PerspectiveCamera();camera.position.set(0,4,8);
 let now=0,sequence=0;
 return {host,data,
  cue(name){host.userData.lessonAction=name;host.userData.lessonActionAt=++sequence;},
  tick(frames=1,reduced=false){for(let i=0;i<frames;i++){now+=1000/60;animateOriginalKubo(host,now,1/60,{camera,reduced});}},
 };
}
function pose(host){
 const result=[];
 host.children[0].traverse(object=>result.push(...object.position.toArray(),...object.quaternion.toArray()));
 return result;
}

test('the actual Approved clip plays once and blends back to Idle instead of looping for six seconds',()=>{
 const f=fixture();let loops=0,finishes=0;
 f.data.mixer.addEventListener('loop',event=>{if(event.action.getClip().name==='Approved')loops++;});
 f.data.mixer.addEventListener('finished',event=>{if(event.action.getClip().name==='Approved')finishes++;});
 f.cue('Approved');f.tick(360);
 assert.equal(f.data.actions.get('Approved').loop,THREE.LoopOnce);
 assert.equal(loops,0);assert.equal(finishes,1);
 assert.equal(f.data.current,'Idle');
 assert.equal(f.data.actions.get('Approved').isScheduled(),false);
 assert.equal(f.data.actions.get('Idle').loop,THREE.LoopRepeat);
 assert.equal(f.data.actions.get('Walk').loop,THREE.LoopRepeat);
});

test('same-clip Wave replay avoids the original two-unit one-frame mitten jump',()=>{
 const f=fixture();f.cue('Wave');f.tick(65);
 const mitten=f.host.getObjectByName('arm_mitten_1');assert.ok(mitten);
 const before=mitten.position.clone(),oldTime=f.data.actions.get('Wave').time;
 f.cue('Wave');f.tick();
 assert.ok(mitten.position.distanceTo(before)<.35,'the currently visible Wave pose must not reset instantly');
 assert.ok(f.data.actions.get('Wave').time>=oldTime,'the weighted action keeps its current timeline during the bridge');
 assert.equal(f.data.current,'Idle');
 f.tick(20);
 assert.equal(f.data.current,'Wave');
 assert.ok(f.data.actions.get('Wave').time<.2,'Wave restarts only after its old influence has faded out');
 f.tick(210);assert.equal(f.data.current,'Idle');
});

test('rapid cues and repeated Replay blend from current weights and coalesce to the latest request',()=>{
 const f=fixture();f.cue('Wave');f.tick(40);
 const names=['PressButton','Wave','ReadFile','Wave','Wave','Wave','Wave'];
 for(const name of names){
  f.cue(name);
  for(let frame=0;frame<3;frame++){
   f.tick();
   const weight=[...f.data.actions.values()].filter(action=>action.isScheduled()).reduce((sum,action)=>sum+action.getEffectiveWeight(),0);
   assert.ok(Math.abs(weight-1)<1e-6,'interruptions preserve normalized pose weights');
  }
 }
 const latest=f.host.userData.lessonActionAt;f.tick(35);
 assert.equal(f.data.current,'Wave');assert.equal(f.data.playing.at,latest);
 assert.equal(f.data.pending,null);
 f.tick(240);assert.equal(f.data.current,'Idle');
});

test('a cue waits for arrival without expiring, and a newer cue replaces the pending one',()=>{
 const f=fixture();f.host.userData.lessonWalking=true;f.cue('ReadFile');f.tick(300);
 f.cue('InspectSafe');f.tick(300);
 assert.equal(f.data.current,'Walk');assert.equal(f.data.playing,null);
 assert.equal(f.data.actions.get('InspectSafe').time,0);
 f.host.userData.lessonWalking=false;f.tick();
 assert.equal(f.data.current,'InspectSafe');
 assert.ok(f.data.actions.get('InspectSafe').time<.05);
 f.tick(275);assert.equal(f.data.current,'Idle');
});

test('an interrupted clip finishing cannot dismiss a newer reaction',()=>{
 const f=fixture();f.cue('Approved');f.tick(80);
 f.host.userData.celebrate=100;f.tick(10);
 assert.equal(f.data.current,'Celebrate');assert.equal(f.data.playing.source,'celebrate');
 f.tick(150);assert.equal(f.data.current,'Idle');
});

test('leaving a lesson cancels a pending gesture and reset timestamps cancel active reactions',()=>{
 const f=fixture();f.host.userData.lessonWalking=true;f.cue('ReadFile');f.tick(20);
 f.cue(null);f.host.userData.lessonWalking=false;f.tick(30);
 assert.equal(f.data.pending,null);assert.equal(f.data.current,'Idle');
 assert.equal(f.data.actions.get('ReadFile').time,0);
 f.host.userData.celebrate=100;f.tick(25);
 assert.equal(f.data.current,'Celebrate');
 f.host.userData.celebrate=-1e6;f.tick();
 assert.equal(f.data.current,'Idle');assert.equal(f.data.playing,null);
 f.tick(30);assert.equal(f.data.actions.get('Celebrate').isScheduled(),false);
});

test('reduced motion holds one authored Idle pose and does not replay events seen while motion was reduced',()=>{
 const f=fixture();f.cue('Wave');f.tick(40);f.tick(1,true);
 const still=pose(f.host);f.tick(60,true);
 assert.deepEqual(pose(f.host),still);
 assert.equal(f.data.actions.get('Idle').time,0);
 assert.equal(f.data.actions.get('Wave').isScheduled(),false);
 f.cue('ReadFile');f.tick(10,true);f.tick(60,false);
 assert.equal(f.data.current,'Idle');assert.equal(f.data.pending,null);
 f.cue('ReadFile');f.tick();assert.equal(f.data.current,'ReadFile');
});
