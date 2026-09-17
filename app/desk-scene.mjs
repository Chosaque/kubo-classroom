import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export async function createDesk(host,options={}){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=T.ACESFilmicToneMapping;host.appendChild(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,40);camera.position.set(4,4.3,7.8);camera.lookAt(0,1.25,0);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);room.dispose();scene.environment=env.texture;scene.environmentIntensity=.65;scene.add(new T.HemisphereLight('#fff4df','#a58b73',2));const key=new T.DirectionalLight('#fff4dd',2);key.position.set(-3,6,4);scene.add(key);
 let cube,desk,library;try{[cube,desk,library]=await Promise.all([new GLTFLoader().loadAsync('/cube-guy.glb'),new GLTFLoader().loadAsync('/qi01-desk.glb'),new GLTFLoader().loadAsync('/lesson-stacks.glb')]);}catch(e){env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();throw e;}
 const furniture=desk.scene;const b=new T.Box3().setFromObject(furniture),size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3());const scale=4.4/size.x;furniture.scale.setScalar(scale);furniture.position.set(-center.x*scale,-b.min.y*scale,-center.z*scale);scene.add(furniture);const top=size.y*scale;
 const guy=cube.scene;guy.traverse(o=>{if(o.name.startsWith('PROP_')||o.userData.outfit)o.visible=false;if(o.isMesh)o.frustumCulled=false;});guy.scale.setScalar(.85);guy.position.set(0,0,-1.9);scene.add(guy);
 const mixer=new T.AnimationMixer(guy),idle=cube.animations.find(c=>c.name==='Idle');if(idle)mixer.clipAction(idle).play();
 const papers=new T.Group();scene.add(papers);
 const templates=['StackBook','StackVolume','StackDocuments'].map(name=>{const o=library.scene.getObjectByName(name);if(!o)throw new Error('Missing Blender stack asset: '+name);const copy=o.clone(true);copy.position.set(0,0,0);return copy;});
 let previousCards=new Set(),playbackPaused=false,mood='ready',moodTime=0;
 const demoFaces=[];if(options.demonstration)guy.traverse(o=>{if(o.morphTargetDictionary&&o.userData.facialMorphs)demoFaces.push(o);});
 function updateFace(dt){for(const face of demoFaces)for(const [key,index] of Object.entries(face.morphTargetDictionary)){const target=key==='Happy'&&mood==='happy'?1:key==='Concerned'&&mood==='confused'?1:key==='Motivated'&&mood==='motivated'?1:0;face.morphTargetInfluences[index]+=(target-face.morphTargetInfluences[index])*Math.min(1,dt*8);}host.dataset.mood=mood;}
 function clearPapers(){if(options.demonstration)papers.traverse(o=>{if(o.isMesh&&o.userData.demoMaterial)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});papers.clear();}
 const setCards=cards=>{clearPapers();const heights=[0,0,0,0,0,0],units=cards.reduce((sum,c)=>sum+Math.max(1,Math.round(c.cost||1)),0);let index=0;
  for(const card of cards){for(let j=0;j<Math.max(1,Math.round(card.cost||1));j++,index++){
   // A space is a bundle of reading, not one thin book. Fill the tabletop
   // before stacking higher, with stable positions when information changes.
   const pile=[0,2,4,1,3,5,0,2][index%8];
   for(let layer=0;layer<3;layer++){
   const book=templates[(index+layer)%templates.length].clone(true);
   book.scale.set(1.28,.85,1.28);
   const box=new T.Box3().setFromObject(book),size=box.getSize(new T.Vector3());
   const angle=[-.14,.12,.18,-.09,.04,-.17,.11][(index*3+layer)%7];
   book.rotation.y=angle;book.position.set([-1.39,0,1.39][pile%3]+Math.sin(index*2.3+layer)*.035,top+.015+heights[pile]-box.min.y,(pile<3?.57:-.55)+Math.cos(index*1.7+layer)*.035);
   book.userData={...book.userData,lessonItem:card.id||card.title,weightUnit:j+1};
   if(options.demonstration){book.traverse(o=>{if(o.isMesh){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();o.userData.demoMaterial=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.color)m.color.set(card.id==='correct'?'#92b98b':'#d99a7d');}}});book.userData.targetY=book.position.y;book.userData.drop=previousCards.has(card.id)||playbackPaused?1:0;}
   papers.add(book);heights[pile]+=size.y+.003;
   }
  }}
  previousCards=new Set(cards.map(c=>c.id));host.dataset.stackUnits=String(units);host.dataset.stackItems=String(cards.length);
 };
 let revealTime=options.intro?0:1.2,revealing=false;
 const guyBounds=new T.Box3().setFromObject(guy),focus=new T.Vector3(0,guyBounds.max.y*.76,-1.9),wide=new T.Vector3(),look=new T.Vector3();
 const close=focus.clone().add(new T.Vector3(0,.1,5.2));
 function pose(){const t=Math.min(1,revealTime/1.2),s=t*t*(3-2*t);camera.position.lerpVectors(close,wide,s);look.lerpVectors(focus,new T.Vector3(0,1.25,0),s);camera.lookAt(look);}
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;wide.set(camera.aspect<1?4.8:4,camera.aspect<1?5:4.3,camera.aspect<1?10:7.8);pose();camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(host);resize();
 let frame=0,disposed=false;const clock=new T.Clock(),reduced=matchMedia('(prefers-reduced-motion: reduce)');const draw=()=>{if(disposed||document.hidden){frame=0;return;}const dt=Math.min(clock.getDelta(),.05);if(!reduced.matches&&!playbackPaused)mixer.update(dt);if(revealing&&!playbackPaused){revealTime=reduced.matches?1.2:Math.min(1.2,revealTime+dt);pose();}if(options.demonstration){updateFace(reduced.matches?1:dt);if(!playbackPaused)moodTime+=dt;guy.rotation.y=mood==='confused'&&!reduced.matches?Math.sin(moodTime*2)*.16:0;papers.children.forEach(book=>{if(!playbackPaused||reduced.matches)book.userData.drop=reduced.matches?1:Math.min(1,book.userData.drop+dt*1.5);book.position.y=book.userData.targetY+Math.pow(1-book.userData.drop,3)*2;});}renderer.render(scene,camera);frame=requestAnimationFrame(draw);};const resume=()=>{if(!disposed&&!document.hidden&&!frame){clock.getDelta();draw();}};document.addEventListener('visibilitychange',resume);draw();
 return {setCards,setMood(value){mood=value;},setPaused(value){playbackPaused=value;},closeUp(){revealing=false;revealTime=0;pose();},reveal(){revealing=true;},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',resume);clearPapers();library.scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});mixer.stopAllAction();scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();}};
}
