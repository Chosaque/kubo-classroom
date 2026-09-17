import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export async function createOrchestrator(host){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=T.ACESFilmicToneMapping;host.appendChild(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,40);camera.position.set(0,2.5,8.5);camera.lookAt(0,2,0);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);room.dispose();scene.environment=env.texture;scene.environmentIntensity=.55;
 scene.add(new T.HemisphereLight('#fff5e7','#52689f',2));const key=new T.DirectionalLight('#fff0d5',2.7);key.position.set(-3,5,5);scene.add(key);
 const rim=new T.DirectionalLight('#98adff',2);rim.position.set(3,4,-3);scene.add(rim);
 let raf=0,disposed=false,current;
 const resize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=camera.aspect<.7?10:8.5;camera.updateProjectionMatrix();};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 let gltf;try{gltf=await new GLTFLoader().loadAsync('/cube-guy.glb');}catch(e){observer.disconnect();env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();throw e;}
 const model=gltf.scene;model.traverse(o=>{if(o.name.startsWith('PROP_')||o.userData.outfit)o.visible=false;if(o.isMesh)o.frustumCulled=false;});scene.add(model);model.rotation.y=-.12;
 const mixer=new T.AnimationMixer(model);
 function action(name='Idle'){const clip=gltf.animations.find(c=>c.name===name)||gltf.animations.find(c=>c.name==='Idle');if(!clip)return;const next=mixer.clipAction(clip);if(next===current)return;next.reset().setEffectiveWeight(1).play();if(current)current.crossFadeTo(next,.4,false);current=next;}
 action();let previous=performance.now();const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function draw(){if(disposed||document.hidden){raf=0;return;}const now=performance.now(),dt=Math.min((now-previous)/1000,.05);previous=now;if(!reduced.matches)mixer.update(dt);renderer.render(scene,camera);raf=requestAnimationFrame(draw);}
 function resume(){if(!disposed&&!document.hidden&&!raf){previous=performance.now();draw();}}document.addEventListener('visibilitychange',resume);draw();
 return {action,dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',resume);mixer.stopAllAction();const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();}};
}
