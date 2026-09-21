import {createAgentTeam} from './agent-team.mjs';
import {translate} from './thai.mjs';
import * as T from 'three';
import {ROOM_PALETTES,roomColorRole} from './room-palettes.mjs';
import {EXPRESSIONS,faceWeight} from './face-expressions.mjs';
import {STATION_HELP} from './station-help.mjs';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Movement, STATIONS } from './navigation.mjs';
import { liveIntent } from './live-state.mjs';
import {stationClip,reactionFor,speech,PREVIEWS,CLIP_LABELS} from './animation-state.mjs';

export async function createWorkspace(element,onState,onEvent,onManual=()=>{},options={}) {
 const scene=new T.Scene(),team=createAgentTeam(scene,element),renderer=new T.WebGLRenderer({antialias:true,alpha:true});
 const compact=matchMedia('(max-width:640px)').matches;
 renderer.setPixelRatio(Math.min(devicePixelRatio,compact?1.25:1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 renderer.domElement.setAttribute('aria-label','QI-07 interactive room. Click a station to send Kubo there.');element.appendChild(renderer.domElement);
 const bubble=document.createElement('div');bubble.className='cube-speech';bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');
 const bubbleLabel=document.createElement('small'),bubbleText=document.createElement('span');bubble.append(bubbleLabel,bubbleText);element.appendChild(bubble);
 const stationBubble=document.createElement('div');stationBubble.className='station-hover-bubble';stationBubble.hidden=true;stationBubble.setAttribute('role','tooltip');element.appendChild(stationBubble);
 let highlighted=null;const highlights=[],stationBounds=new Map();
 const highlight=id=>{highlighted=STATIONS.some(s=>s.id===id)?id:null;stationBubble.hidden=!highlighted;stationBubble.textContent=highlighted?translate(STATION_HELP[highlighted],document.documentElement.lang):'';for(const h of highlights){if(h.baked){h.material.color.copy(h.color);if(h.id===highlighted)h.material.color.lerp(new T.Color('#ffd184'),.6);}else{h.material.emissive.copy(h.color);h.material.emissiveIntensity=h.intensity;if(h.id===highlighted){h.material.emissive.set('#f2bd68');h.material.emissiveIntensity=.65;}}}};
 const camera=new T.PerspectiveCamera(37,1,.1,100);camera.position.set(12.2,13.3,16.6);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.8,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=9;controls.maxDistance=38;controls.maxPolarAngle=1.43;controls.minPolarAngle=.28;controls.update();controls.saveState();
 const pmrem=new T.PMREMGenerator(renderer),envScene=new RoomEnvironment(),env=pmrem.fromScene(envScene,.04);scene.environment=env.texture;scene.environmentIntensity=.6;envScene.dispose();
 scene.add(new T.HemisphereLight(0xffedd5,0x6a503e,1));
 const light=new T.DirectionalLight(0xffe6c7,3.1);light.position.set(-3,10,6);light.castShadow=true;light.shadow.mapSize.set(compact?1024:2048,compact?1024:2048);Object.assign(light.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:30});light.shadow.bias=-.0003;light.shadow.normalBias=.025;scene.add(light);
 const fill=new T.DirectionalLight(0xfff2de,1.2);fill.position.set(6,6,-2);scene.add(fill);
 const ground=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.15}));ground.rotation.x=-Math.PI/2;ground.position.y=-.40;ground.receiveShadow=true;scene.add(ground);
 let id=0,disposed=false,frame=0,actor=null,mixer=null,activeClip=null,oldRevision=-1,lastStateTime=0,lastVisualTime=0,resume=()=>{},roomLighting=null;
 const subscribers=new Set();
 let roomId='explore',liveKey='',following=false,currentTask=null,feedConnected=false,oneShot=null,stationTime=0,lastStation=null,queuedCelebration=false;
 const seenEvents=new Set(),fx={},props=[],faces=[];let headBone=null,clipElapsed=0,faceTime=0;
 let expression='auto';const setExpression=value=>{if(EXPRESSIONS.includes(value))expression=value;};
 let outfit='original';const garments=[],fabric=[];
 const setOutfit=value=>{if(!['original','overalls','pinafore','hijab'].includes(value))return;outfit=value;for(const o of garments)o.visible=o.userData.outfit===value||(value==='hijab'&&o.userData.outfit==='pinafore');for(const f of fabric){f.object.material.color.copy(f.color);if(value==='overalls'&&f.name.includes('trouser'))f.object.material.color.set('#7fac96');if(['pinafore','hijab'].includes(value)&&f.name.includes('trouser'))f.object.material.color.set('#ded0cb');f.object.visible=!(value!=='original'&&/necktie|tie knot/.test(f.name));}};
 const locked=()=>['active','waiting'].includes(currentTask?.runtimeState||currentTask?.state);
 const snapshot=()=>({...movement.snapshot(),animation:activeClip,animationLabel:CLIP_LABELS[activeClip]||activeClip});
 const react=(clip,after=null)=>{if(!actions[clip])return;actions[clip].stop();if(activeClip===clip)activeClip=null;oneShot={clip,remaining:actions[clip].getClip().duration,after};};
 const depart=fn=>{oneShot=null;fn();};
 const makeMovement=()=>new Movement((type,data)=>{
  const event={id:++id,type,...data,roomId,time:new Date().toISOString(),...(options.lessonMode?{simulation:true}:{})};onEvent(event);console.info(options.lessonMode?'[Permission lesson simulation]':'[Agentic Dashboard]',event);
  if(!options.lessonMode)window.dispatchEvent(new CustomEvent('agentic-dashboard:event',{detail:event}));subscribers.forEach(fn=>{try{fn(event);}catch{}});
 });
 let movement=makeMovement();const rooms=new Map([['explore',movement]]);
 const setLiveTask=(task,connected,follow)=>{
  const nextId=task?.id||'explore';
  if(nextId!==roomId){roomId=nextId;if(!rooms.has(roomId))rooms.set(roomId,makeMovement());movement=rooms.get(roomId);oldRevision=-1;liveKey='';oneShot=null;queuedCelebration=false;lastStation=null;stationTime=0;mixer?.stopAllAction();activeClip=null;if(actor)actor.rotation.y=movement.heading;for(const e of task?.events||[])seenEvents.add(e.id);}
  currentTask=task;follow=follow||locked();following=follow;feedConnected=connected;
  if(follow){const intent=liveIntent(task,connected),key=JSON.stringify(intent);if(key!==liveKey){liveKey=key;
   if(intent.kind==='station')depart(()=>movement.go(intent.stationId,'live-event'));
   else if(intent.kind==='home')depart(()=>movement.command({action:'return_to_center'}));
   else{oneShot=null;movement.pause(intent.reason);}
  }
  if(connected)for(const e of task?.events||[]){if(!seenEvents.has(e.id)){seenEvents.add(e.id);const clip=reactionFor(e);if(clip&&!e.historical&&Date.now()-Date.parse(e.time)<8000){if(clip==='Celebrate')queuedCelebration=true;else if(!oneShot)react(clip);}}}
  if(seenEvents.size>1000){const recent=[...seenEvents].slice(-500);seenEvents.clear();recent.forEach(e=>seenEvents.add(e));}
  }else liveKey='';
  onState(snapshot());
 };
 const actions={};
 const path=new T.Line(new T.BufferGeometry(),new T.LineDashedMaterial({color:0x9d6643,dashSize:.13,gapSize:.085}));scene.add(path);
 const marker=new T.Mesh(new T.RingGeometry(.20,.25,32),new T.MeshBasicMaterial({color:0x9b633e,side:T.DoubleSide,transparent:true,opacity:.7}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
 const picks=[];const roomFinishes=[];
 const setTheme=value=>{const palette=ROOM_PALETTES[value];if(!palette)return;for(const {material,role} of roomFinishes)material.color.set(palette[role]);for(const h of highlights)if(h.baked)h.color.copy(h.material.color);highlight(highlighted);path.material.color.set(palette.wood);marker.material.color.set(palette.body);};
 const resize=()=>{const w=element.clientWidth,h=element.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<600?48:37;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(element);resize();
 const choose=id=>{if(!actor||locked())return;onManual();following=false;queuedCelebration=false;depart(()=>movement.go(id));onState(snapshot());};
 const preview=clip=>{if(locked())return;if(!PREVIEWS.includes(clip))throw new Error('Unknown animation preview');onManual();following=false;movement.pause('animation_preview');queuedCelebration=false;react(clip);};
 const cast=event=>{
  const rect=renderer.domElement.getBoundingClientRect(),mouse=new T.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
  const ray=new T.Raycaster();ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(picks,false)[0];return hit?.object.userData.stationId;
 };
 let press=null;
 const down=e=>{press={x:e.clientX,y:e.clientY,id:e.pointerId};};
 const up=e=>{if(press&&press.id===e.pointerId&&Math.hypot(e.clientX-press.x,e.clientY-press.y)<6){const id=cast(e);if(id)choose(id);}press=null;};
 const hover=e=>{renderer.domElement.style.cursor=!locked()&&cast(e)?'pointer':'grab';};
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointermove',hover);
 const api={getState:()=>({...snapshot(),roomId,following,locked:locked(),speech:bubbleText.textContent}),command:input=>{if(!actor)throw new Error('Scene is still loading');if(locked())throw new Error('Kubo is following an active task. Manual controls are locked.');onManual();following=false;oneShot=null;queuedCelebration=false;const result=movement.command(input);onState(snapshot());return result;},subscribe:fn=>{if(typeof fn!=='function')throw new Error('Subscriber must be a function');subscribers.add(fn);return()=>subscribers.delete(fn);}};
 const toolLifecycle=new AbortController();
 const dispose=()=>{disposed=true;team.dispose();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();mixer?.stopAllAction();subscribers.clear();toolLifecycle.abort();if(window.agenticDashboard===api)delete window.agenticDashboard;renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointermove',hover);scene.traverse(o=>{if(o.isMesh||o.isLine){o.geometry?.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose());}});env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();bubble.remove();stationBubble.remove();};
 try {
  const loader=new GLTFLoader();const [room,cube,roomLight]=await Promise.all([loader.loadAsync('/qi07-room.glb'),loader.loadAsync('/cube-guy.glb'),new T.TextureLoader().loadAsync('/room-lighting.png')]);roomLighting=roomLight;roomLight.flipY=false;roomLight.colorSpace=T.SRGBColorSpace;
  if(disposed)return {dispose};
  room.scene.traverse(o=>{if(o.isMesh){o.castShadow=!o.userData.bakedLighting;o.receiveShadow=true;if(o.userData.bakedLighting){const convert=m=>{const baked=new T.MeshStandardMaterial({name:m.name,color:m.color,map:roomLight,side:m.side,roughness:.9,metalness:0,envMapIntensity:.3});baked.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#ifdef USE_MAP\nvec4 sampledDiffuseColor = texture2D(map, vMapUv);\ndiffuseColor.rgb *= mix(vec3(1.0), sampledDiffuseColor.rgb, 0.4);\n#endif');};baked.customProgramCacheKey=()=> 'soft-baked-room-v1';return baked;};o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);}if(o.userData.stationId)picks.push(o);}});scene.add(room.scene);
  room.scene.updateMatrixWorld(true);
  for(const o of picks){const id=o.userData.stationId;if(!stationBounds.has(id))stationBounds.set(id,new T.Box3());stationBounds.get(id).union(new T.Box3().setFromObject(o));const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const copy=m.clone();copy.onBeforeCompile=m.onBeforeCompile;copy.customProgramCacheKey=m.customProgramCacheKey;if(copy.emissive)highlights.push({id,material:copy,color:copy.emissive.clone(),intensity:copy.emissiveIntensity});else if(copy.color)highlights.push({id,material:copy,color:copy.color.clone(),baked:true});return copy;});o.material=Array.isArray(o.material)?materials:materials[0];}
  room.scene.traverse(o=>{if(o.isMesh){const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const role=roomColorRole(o.name,m.name);if(!role||!m.color)return m;const copy=m.clone();copy.onBeforeCompile=m.onBeforeCompile;copy.customProgramCacheKey=m.customProgramCacheKey;roomFinishes.push({material:copy,role});for(const h of highlights)if(h.material===m)h.material=copy;return copy;});o.material=Array.isArray(o.material)?materials:materials[0];}if(o.name.startsWith('FX_'))fx[o.name]={object:o,position:o.position.clone(),rotation:o.rotation.clone()};});setTheme('cream');
  actor=new T.Group();actor.add(cube.scene);cube.scene.scale.setScalar(.45);scene.add(actor);
  cube.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}});
  cube.scene.traverse(o=>{if(o.name.startsWith('PROP_')){props.push(o);o.visible=false;}if(o.isBone&&o.name==='head')headBone=o;});
  cube.scene.traverse(o=>{if(o.morphTargetDictionary&&o.userData.facialMorphs)faces.push(o);});
  cube.scene.traverse(o=>{if(o.userData.outfit){garments.push(o);o.visible=false;}else if(o.isMesh&&o.material?.color){const name=o.name.replaceAll('_',' ').toLowerCase();if(/trouser|necktie|tie knot/.test(name)){o.material=o.material.clone();fabric.push({object:o,name,color:o.material.color.clone()});}}});setOutfit(outfit);
  mixer=new T.AnimationMixer(cube.scene);
  for(const clip of cube.animations)actions[clip.name]=mixer.clipAction(clip);
  for(const name of ['Idle','Run','Turn','Sit','Stand','Typing','ReadScreen','PressButton','ReadFile','CheckData','SortDocuments','UpdateBoard','InspectSafe','WaitApproval',...PREVIEWS])if(!actions[name])throw new Error('Missing character animation: '+name);
  if(!options.lessonMode)window.agenticDashboard=api;
  if(!options.lessonMode&&document.modelContext?.registerTool){
   for(const tool of [
    {name:'get_workspace_state',description:'Read Kubo position, station and movement state.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>api.getState()},
    {name:'control_cube_guy',description:'Start local movement or change the arrived character work state. Returns current state; departure is not arrival.',inputSchema:{type:'object',properties:{action:{type:'string',enum:['go_to_station','begin_work','wait_for_approval','return_to_center','reset']},stationId:{type:'string',enum:STATIONS.map(s=>s.id)}},required:['action'],additionalProperties:false},execute:input=>api.command(input)},
   ])Promise.resolve(document.modelContext.registerTool(tool,{signal:toolLifecycle.signal})).catch(()=>{});
  }
  onState(snapshot());
  const clock=new T.Clock();
  const draw=()=>{
   if(disposed)return;if(document.hidden){frame=0;return;}
   frame=requestAnimationFrame(draw);const dt=Math.min(clock.getDelta(),.05);
   if(oneShot){oneShot.remaining-=dt;if(oneShot.remaining<=0){const after=oneShot.after;oneShot=null;after?.();}}
   if(!oneShot)movement.update(dt);
   const atStation=['working','waiting'].includes(movement.state)?movement.stationId:null;
   if(atStation!==lastStation){lastStation=atStation;stationTime=0;}else stationTime+=dt;
   if(queuedCelebration&&movement.state==='idle'&&!oneShot){queuedCelebration=false;react('Celebrate');}
   actor.position.set(movement.position[0],.12,movement.position[1]);
   const delta=T.MathUtils.euclideanModulo(movement.heading-actor.rotation.y+Math.PI,2*Math.PI)-Math.PI;
   actor.rotation.y+=delta*(1-Math.exp(-dt*8));
   const clip=oneShot?.clip||(movement.state==='running'?'Run':following&&currentTask?.thinking&&!currentTask?.stale?'Thinking':atStation?stationClip(atStation,stationTime):movement.state==='turning'?'Turn':'Idle');
   if(clip!==activeClip){const next=actions[clip];next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1);next.setLoop(oneShot?T.LoopOnce:T.LoopRepeat,oneShot?1:Infinity);next.clampWhenFinished=!!oneShot;next.play();if(activeClip)actions[activeClip].crossFadeTo(next,['Typing','ReadScreen'].includes(clip)||['Typing','ReadScreen'].includes(activeClip)?.65:.45,false);activeClip=clip;clipElapsed=0;}
   clipElapsed+=dt;
   if(highlighted){const box=stationBounds.get(highlighted);if(box){const point=box.getCenter(new T.Vector3());point.y=box.max.y+.35;point.project(camera);stationBubble.style.left=Math.max(125,Math.min(element.clientWidth-125,(point.x*.5+.5)*element.clientWidth))+'px';stationBubble.style.top=Math.max(65,Math.min(element.clientHeight-20,(-point.y*.5+.5)*element.clientHeight))+'px';}}
   mixer.update(dt);
   faceTime+=dt;const blinkPhase=faceTime%3.7,blink=blinkPhase<.18?Math.sin(Math.PI*blinkPhase/.18):0;
   for(const face of faces)for(const [key,index] of Object.entries(face.morphTargetDictionary)){
    const target=key==='Blink'?blink:key==='Happy'?(['Wave','Celebrate','Approved'].includes(clip)?1:0):key==='Concerned'?(['Concerned','Denied','Interrupted'].includes(clip)?1:0):key==='Curious'?(clip==='WaitApproval'||clip==='TaskReceived'?1:0):key==='Focus'?(atStation&&clip!=='WaitApproval'?.65:0):0;
    const weight=faceWeight(key,expression,target,face.name.startsWith('Vertical')?blink:0);
    face.morphTargetInfluences[index]+=(weight-face.morphTargetInfluences[index])*Math.min(1,dt*(key==='Blink'?45:8));
   }
   const duration=actions[clip].getClip().duration||1;
   const wave=Math.sin(Math.PI*(oneShot?Math.min(1,clipElapsed/duration):(clipElapsed%duration)/duration))**2;
   for(const p of props)p.visible=p.name.startsWith('PROP_File')?['ReadFile','CheckData','SortDocuments'].includes(clip):p.name.startsWith('PROP_ReadingCuff')?['ReadFile','InspectSafe'].includes(clip):['CheckData','UpdateBoard'].includes(clip);
   for(const [name,f] of Object.entries(fx)){
    let offset=0,angle=0,axis='z';
    if(name==='FX_Chair')offset=0;
    if(name==='FX_SafeDial'&&clip==='InspectSafe'){angle=.28*Math.sin(2*Math.PI*(clipElapsed%duration)/duration);axis='z';}
    if(name==='FX_Shortcut'&&clip==='PressButton'){offset=-.05*wave;axis='y';}
    if(name==='FX_IntakePaper'&&clip==='SortDocuments'){offset=.16*wave;axis='y';}
    if(name==='FX_BoardCard'&&clip==='UpdateBoard'){offset=.12*wave;axis='y';}
    if(name==='FX_PermissionDoor'&&clip==='Approved'){angle=-.55*wave;axis='y';}
    const target=f.position.clone();target[axis]+=offset;f.object.position.lerp(target,Math.min(1,dt*9));
    for(const a of ['x','y','z'])f.object.rotation[a]+=(f.rotation[a]+(a===axis?angle:0)-f.object.rotation[a])*Math.min(1,dt*9);
   }
   if(oldRevision!==movement.revision){
    oldRevision=movement.revision;path.geometry.dispose();path.geometry=new T.BufferGeometry().setFromPoints(movement.path.map(p=>new T.Vector3(p[0],.16,p[1])));path.computeLineDistances();path.visible=movement.path.length>1;
    const station=STATIONS.find(s=>s.id===movement.stationId);marker.visible=!!station;if(station)marker.position.set(station.target[0],.155,station.target[1]);
   }
   if(performance.now()-lastStateTime>180){onState(snapshot());lastStateTime=performance.now();}
   if(options.visualReporting!==false&&following&&feedConnected&&currentTask?.progress&&performance.now()-lastVisualTime>750){lastVisualTime=performance.now();fetch('/api/visual',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({threadId:roomId,stepId:currentTask.progress.id,stationId:movement.stationId,state:oneShot?'turning':movement.state})}).catch(()=>{});}
   controls.update();scene.updateMatrixWorld(true);
   const anchor=headBone?headBone.getWorldPosition(new T.Vector3()).add(new T.Vector3(0,.95,0)):actor.position.clone().add(new T.Vector3(0,2.1,0));anchor.project(camera);
   const w=element.clientWidth,h=element.clientHeight,x=(anchor.x*.5+.5)*w,y=(-anchor.y*.5+.5)*h;
   bubble.style.left=`${Math.max(110,Math.min(w-110,x))}px`;bubble.style.top=`${Math.max(155,Math.min(h-60,y))}px`;bubble.hidden=anchor.z>1||anchor.z< -1;
   const words=speech({task:currentTask,connected:feedConnected,following,movement,reaction:oneShot?.clip,animation:clip,stationName:STATIONS.find(s=>s.id===movement.stationId)?.name});
   words.label=translate(words.label,document.documentElement.lang);words.text=translate(words.text,document.documentElement.lang);if(highlighted)stationBubble.textContent=translate(STATION_HELP[highlighted],document.documentElement.lang);
   if(bubbleLabel.textContent!==words.label)bubbleLabel.textContent=words.label;if(bubbleText.textContent!==words.text)bubbleText.textContent=words.text;
   team.update(dt,camera);renderer.render(scene,camera);
  };resume=()=>{if(!document.hidden&&!frame&&!disposed){clock.getDelta();draw();}};document.addEventListener('visibilitychange',resume,{signal:toolLifecycle.signal});draw();
  return {setAgents:team.setAgents,choose,preview,highlight,setTheme,setOutfit,setExpression,setLiveTask,reset:()=>{if(locked())return;onManual();following=false;oneShot=null;queuedCelebration=false;movement.reset();onState(snapshot());},resetView:()=>controls.reset(),dispose:()=>{roomLighting?.dispose();dispose();}};
 } catch(error){dispose();throw error;}
}



