import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export async function createWelcome(host){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 host.appendChild(renderer.domElement);const scene=new T.Scene();const camera=new T.PerspectiveCamera(35,1,.1,50);camera.position.set(0,2.6,9);camera.lookAt(0,2.2,0);
 const pmrem=new T.PMREMGenerator(renderer),environmentScene=new RoomEnvironment(),env=pmrem.fromScene(environmentScene,.04);environmentScene.dispose();scene.environment=env.texture;scene.environmentIntensity=.65;
 scene.add(new T.HemisphereLight('#fff5e7','#bd9e83',2));const key=new T.DirectionalLight('#fff0da',2.3);key.position.set(-3,6,5);scene.add(key);
 const resize=()=>{renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.position.z=camera.aspect<.8?12:9;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(host);resize();
 let gltf;try{gltf=await new GLTFLoader().loadAsync('/cube-guy.glb');}catch(error){observer.disconnect();env.texture.dispose();env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();throw error;}
 const cube=gltf.scene;scene.add(cube);cube.position.y=.5;
 cube.traverse(o=>{if(o.name.startsWith('PROP_')||o.userData.outfit)o.visible=false;if(o.isMesh)o.frustumCulled=false;});
 const mixer=new T.AnimationMixer(cube),clip=gltf.animations.find(c=>c.name==='Wave')||gltf.animations.find(c=>c.name==='Idle');if(clip)mixer.clipAction(clip).play();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,disposed=false;const clock=new T.Clock();
 const draw=()=>{if(disposed||document.hidden){frame=0;return;}const dt=Math.min(clock.getDelta(),.05);if(!reduced.matches)mixer.update(dt);renderer.render(scene,camera);frame=requestAnimationFrame(draw);};
 const resume=()=>{if(!document.hidden&&!frame&&!disposed){clock.getDelta();draw();}};document.addEventListener('visibilitychange',resume);draw();
 return()=>{disposed=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',resume);observer.disconnect();mixer.stopAllAction();scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});env.texture.dispose();env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
}
