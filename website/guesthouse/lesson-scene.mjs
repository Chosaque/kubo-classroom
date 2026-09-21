import * as THREE from 'three';

// Authored visual cues follow course state, never a timer that advances lessons.
const stations = [
 ['โต๊ะบริบท','Context Desk'],['กติกา','Safe'],['ทางลัด','Shortcut'],
 ['คู่มือ','Skill Files'],['รับเอกสาร','Document Intake'],['ตรวจงาน','Task Board'],
 ['ผู้ช่วย','Helper Station'],['ขออนุญาต','Permission Door']
];
const cues = {
 WELCOME:[['ต้อนรับแขก','Welcome guests']],
 'QI-01':[['ข้อมูลคืนนี้','Tonight’s context'],['เทียบข้อมูล','Compare evidence'],['จัดแล้วตรวจ','Sort and check']],
 'QI-02':[['บันทึกส่งต่อ','Write a note'],['เก็บข้อเท็จจริง','Keep the facts'],['เลือกบริบท','Select context'],['แยกงาน','Separate tasks'],['เรียกบันทึกกลับ','Retrieve note']],
 'QI-03':[['คำสั่งยังไม่ครบ','Missing instructions'],['งาน · ข้อมูล · ขอบเขต','Task · Context · Boundary'],['ส่วนที่ขาด','Missing part']],
 'QI-04':[['คิด','Think'],['เลือกเครื่องมือ','Choose'],['เรียกเครื่องมือ','Act'],['อ่านผล','Read'],['ตัดสินใจ','Decide'],['ยังรอผล','Pending']],
 'QI-05':[['อ่านแหล่งข้อมูล','Read source'],['หยุดคำสั่งแทรก','Block injected instruction'],['ตรวจพฤติกรรม','Check behavior']],
 'QI-06':[['นับโทเคนจริง','Count actual tokens'],['ย่อโดยคงข้อเท็จจริง','Shorten; keep facts']],
 'QI-07':[...stations,['ขอบเขตงานนี้','Action boundary'],['ส่งมอบร่าง','Return draft']]
};
const actions={WELCOME:['Wave'],'QI-01':['ReadFile','CheckData','SortDocuments'],'QI-02':['Typing','ReadFile','SortDocuments','Interrupted','ReadFile'],'QI-03':['Thinking','Typing','Concerned'],'QI-04':['Thinking','ReadScreen','PressButton','CheckData','Approved','WaitApproval'],'QI-05':['ReadFile','Denied','CheckData'],'QI-06':['ReadScreen','Typing'],'QI-07':['SortDocuments','InspectSafe','PressButton','ReadFile','CheckData','UpdateBoard','TaskReceived','WaitApproval','Thinking','Approved']};
export function sceneCue({chapter='WELCOME',step=0}={}) {
 const index=Math.max(0,Math.min(step,(cues[chapter]||cues.WELCOME).length-1));
 return {chapter,step:index,label:(cues[chapter]||cues.WELCOME)[index],action:(actions[chapter]||actions.WELCOME)[index],guest:chapter==='WELCOME'?'pip':chapter==='QI-01'?'luma':'nova',station:chapter==='QI-07'?Math.min(index,7):-1};
}
export function createLessonScene({scene,camera,actors,kubo,stage}) {
 const group=new THREE.Group();scene.add(group);
 const caption=document.createElement('div');caption.className='scene-cue';caption.setAttribute('aria-live','polite');stage.append(caption);
 const replay=document.createElement('button');replay.className='scene-replay';stage.append(replay);
 const resetView=document.createElement('button');resetView.className='scene-reset-view';stage.append(resetView);
 const gold=0xe7c777,teal=0x68cbbc,red=0xe39b92;
 const ring=new THREE.Mesh(new THREE.RingGeometry(.62,.7,48),new THREE.MeshBasicMaterial({color:gold,side:THREE.DoubleSide,transparent:true,opacity:.8}));ring.rotation.x=-Math.PI/2;ring.position.y=.018;group.add(ring);
 const cards=[];
 for(let i=0;i<5;i++){
  const card=new THREE.Mesh(new THREE.BoxGeometry(.48,.64,.055),new THREE.MeshStandardMaterial({color:i<2?teal:0xc5becf,roughness:.75}));group.add(card);cards.push(card);
 }
 const nodes=stations.map((_,i)=>{const node=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.025,24),new THREE.MeshStandardMaterial({color:gold,emissive:gold,emissiveIntensity:.08}));node.position.set(-3.6+i*1.05,.018,3.8);group.add(node);return node;});
 const home=new Map([...actors].map(([id,a])=>[id,a.position.clone()]));
 const kuboHome=kubo.position.clone(),cameraHome=camera.position.clone();
 let state={chapter:'WELCOME',step:0,complete:false},cue=sceneCue(state),lang='th',enabled=true,start=0,key='',focus=new THREE.Vector3(0,2,0);
 let wideView=false,shotKey='';
 const cameraAim=focus.clone(),cameraOffset=cameraHome.clone().sub(focus);
 resetView.onclick=()=>{wideView=true;};
 function trigger(){start=performance.now();kubo.userData.lessonAction=enabled?cue.action:null;kubo.userData.lessonActionAt=start;const actor=actors.get(cue.guest);if(actor)actor.userData.greet=start;}
 replay.onclick=()=>{wideView=false;trigger();};
 function sync(next,language,active){
  state=next;lang=language;enabled=active;cue=sceneCue(state);
  const nextKey=`${state.chapter}:${state.step}:${Boolean(state.complete)}:${active}`;
  const nextShot=`${state.chapter}:${state.step}:${active}`;
  if(nextShot!==shotKey){shotKey=nextShot;wideView=false;}
  caption.textContent=cue.label[lang==='th'?0:1];caption.hidden=!active;replay.hidden=!active;group.visible=active;
  replay.textContent=lang==='th'?'↻ ดูอีกครั้ง':'↻ Replay scene';
  resetView.textContent=lang==='th'?'มุมกว้าง':'Reset view';resetView.hidden=!active;
  if(nextKey!==key){key=nextKey;trigger();}
 }
 function update(now,dt,reduced){
  const blend=reduced?1:1-Math.exp(-dt*3.4),age=(now-start)/1000;
  const active=actors.get(cue.guest);
  actors.forEach((actor,id)=>{const target=home.get(id).clone();if(enabled&&id===cue.guest)target.z+=.65;actor.position.x=THREE.MathUtils.lerp(actor.position.x,target.x,blend);actor.position.z=THREE.MathUtils.lerp(actor.position.z,target.z,blend);});
  const target=kuboHome.clone();
  if(enabled&&cue.station>=0){target.set(nodes[cue.station].position.x,0,3.6);}
  else if(enabled){target.x+=.3;target.z-=.3;}
  const distance=Math.hypot(kubo.position.x-target.x,kubo.position.z-target.z);
  kubo.userData.lessonWalking=enabled&&!reduced&&distance>.08;
  kubo.position.lerp(target,blend);
  const looking=kubo.userData.lessonWalking?target:camera.position;
  kubo.userData.lessonLook=enabled?{x:looking.x,z:looking.z}:null;
  // Translate both camera and aim to preserve the comfortable viewing angle.
  // Orthographic cameras need zoom, not a dolly, to make a subject larger.
  const aim=focus.clone();let zoom=1;
  if(enabled&&!reduced&&!wideView&&!state.complete&&cue.chapter!=='WELCOME'){
   if(cue.station>=0){aim.set(kubo.position.x,1.35,kubo.position.z);zoom=1.65;}
   else if(cue.chapter==='QI-01'&&active){aim.copy(kubo.position).lerp(active.position,.55);aim.y=1.45;zoom=1.55;}
   else if(['QI-02','QI-03','QI-05','QI-06'].includes(cue.chapter)){
    aim.set(-1.35,2.2,1.8);zoom=1.45;
   }else{aim.set(kubo.position.x,1.45,kubo.position.z);zoom=1.8;}
  }
  const cameraBlend=reduced?1:1-Math.exp(-Math.min(dt,.05)*2.2);
  cameraAim.lerp(aim,cameraBlend);
  camera.position.copy(cameraAim).add(cameraOffset);camera.lookAt(cameraAim);
  camera.zoom=THREE.MathUtils.lerp(camera.zoom,zoom,cameraBlend);camera.updateProjectionMatrix();
  if(!enabled)return;
  ring.visible=cue.station<0;if(active){ring.position.x=active.position.x;ring.position.z=active.position.z;}
  nodes.forEach((node,i)=>{node.visible=cue.station>=0;node.material.emissiveIntensity=i===cue.station?.65:.04;node.scale.setScalar(i===cue.station?1.35:1);});
  const obstruct=cue.chapter==='QI-05'&&cue.step>0;
  const packing=cue.chapter==='QI-02'||cue.chapter==='QI-06';
  cards.forEach((card,i)=>{
   card.visible=['QI-02','QI-03','QI-05','QI-06'].includes(cue.chapter)&&cue.station<0&&(cue.chapter!=='QI-03'||i<3);
   const spread=packing&&state.complete?.34:.62;
   const x=-1.25+i*spread,z=obstruct&&i>1?-.5:1;
   const y=3.6+(reduced?0:Math.sin(Math.min(age,1)*Math.PI/2)*.25);
   card.position.lerp(new THREE.Vector3(x,y,z),blend);
   card.rotation.z=reduced?0:Math.sin(Math.min(age,1)*Math.PI)*.12*(i%2?1:-1);
   card.material.color.setHex(obstruct&&i>1?red:state.complete?teal:i<2?teal:0xc5becf);
  });
 }
 return {sync,update};
}
