import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createLessonScene } from './lesson-scene.mjs';

function fixture(t){
 const previous=globalThis.document;
 const documentStub={createElement:()=>({setAttribute(){},hidden:false,textContent:''})};
 globalThis.document=documentStub;
 t.after(()=>{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;});
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-7,7,4,-4,.1,100);
 camera.position.set(9,9,12);
 const actors=new Map(['luma','pip','nova'].map((id,index)=>{const actor=new THREE.Group();actor.position.set(index,0,1);return [id,actor];}));
 const kubo=new THREE.Group();kubo.position.set(-3.65,0,3.4);
 const buttons=[],stage={append(element){buttons.push(element);}};
 const controller=createLessonScene({scene,camera,actors,kubo,stage});
 let now=0;
 return {controller,kubo,buttons,
  tick(frames=1,reduced=false){for(let i=0;i<frames;i++){now+=1000/60;controller.update(now,1/60,reduced);}},
 };
}

test('completion and language changes update the scene without retriggering its cue',t=>{
 const f=fixture(t);
 f.controller.sync({chapter:'QI-01',step:0,complete:false},'en',true);
 const first=f.kubo.userData.lessonActionAt;
 f.controller.sync({chapter:'QI-01',step:0,complete:true},'en',true);
 f.controller.sync({chapter:'QI-01',step:0,complete:true},'th',true);
 assert.equal(f.kubo.userData.lessonActionAt,first);
 f.buttons[1].onclick();assert.ok(f.kubo.userData.lessonActionAt>first);
});

test('station travel uses bounded constant speed rather than fast initial sliding and a long crawl',t=>{
 const f=fixture(t);f.controller.sync({chapter:'QI-07',step:7,complete:false},'en',true);
 let before=f.kubo.position.clone();
 for(let frame=0;frame<120;frame++){
  f.tick();const distance=f.kubo.position.distanceTo(before);
  assert.ok(Math.abs(distance-.025)<1e-8,'travel stays at 1.5 scene units per second');
  assert.equal(f.kubo.userData.lessonWalking,true);
  before=f.kubo.position.clone();
 }
 f.tick(300);
 assert.ok(Math.abs(f.kubo.position.x-3.75)<1e-8);
 assert.ok(Math.abs(f.kubo.position.z-3.6)<1e-8);
 assert.equal(f.kubo.userData.lessonWalking,false);
});

test('returning from a station walks toward home and keeps a forward target on the final travel frame',t=>{
 const f=fixture(t);f.controller.sync({chapter:'QI-07',step:7,complete:false},'en',true);f.tick(400);
 f.controller.sync({chapter:'QI-07',step:7,complete:false},'en',false);
 assert.equal(f.kubo.userData.lessonAction,null);
 const before=f.kubo.position.clone();f.tick();
 assert.equal(f.kubo.userData.lessonWalking,true);
 assert.ok(f.kubo.position.distanceTo(before)<=.02500001);
 assert.ok(f.kubo.userData.lessonLook.x<f.kubo.position.x);
 let sawFinal=false;
 for(let i=0;i<400;i++){
  f.tick();
  if(f.kubo.userData.lessonWalking){
   assert.ok(Math.hypot(f.kubo.userData.lessonLook.x-f.kubo.position.x,f.kubo.userData.lessonLook.z-f.kubo.position.z)>.99);
   if(f.kubo.position.distanceTo(new THREE.Vector3(-3.65,0,3.4))<1e-8)sawFinal=true;
  }
 }
 assert.equal(sawFinal,true);assert.equal(f.kubo.userData.lessonWalking,false);
 assert.equal(f.kubo.userData.lessonLook,null);
});

test('reduced-motion changes settle immediately without walking or residual travel on resume',t=>{
 const f=fixture(t);f.controller.sync({chapter:'QI-07',step:7,complete:false},'en',true);f.tick(30);
 f.tick(1,true);const settled=f.kubo.position.clone();
 assert.equal(f.kubo.userData.lessonWalking,false);assert.ok(Math.abs(settled.x-3.75)<1e-8);
 f.tick(30,true);assert.deepEqual(f.kubo.position,settled);
 f.tick(30,false);assert.deepEqual(f.kubo.position,settled);assert.equal(f.kubo.userData.lessonWalking,false);
 f.controller.sync({chapter:'QI-07',step:7,complete:false},'en',false);f.tick(1,true);
 assert.deepEqual(f.kubo.position,new THREE.Vector3(-3.65,0,3.4));
 assert.equal(f.kubo.userData.lessonWalking,false);
});
