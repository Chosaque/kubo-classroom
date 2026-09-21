import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { prepareCharacter, animateCharacter } from './character-motion.mjs';
import { createCourse } from './course.mjs';
import { createOriginalKubo, animateOriginalKubo } from './original-kubo.mjs';
import { createLessonScene } from './lesson-scene.mjs';
let lessonScene=null,lessonState={chapter:'WELCOME',step:0,complete:false};
const $=id=>document.getElementById(id);
let lang='th',selected=null,feedback=null,ready=false;
let lessonMode=true;
const assigned=new Map();
const text=(th,en)=>lang==='th'?th:en;
const guests=[
 {id:'luma',name:'Luma',color:'#b795ed',room:101,request:['ฉันเดินทางมาทั้งคืน ขอห้องเงียบ ๆ ที่แสงไม่จ้าหน่อยนะ','I’ve travelled all night. A quiet room with dim lighting, please.'],success:['เงียบและแสงนุ่มแบบนี้ หลับสบายแน่นอน!','Quiet and softly lit. I’ll sleep wonderfully!'],pos:[-2.35,0,1.65],height:2.1},
 {id:'pip',name:'Pip',color:'#65c5ba',room:102,request:['ฉันชอบต้นไม้และแสงสว่าง ขอห้องที่มองเห็นสวนได้ไหม','I love plants and bright light. Can I have a room overlooking the garden?'],success:['มีทั้งแสงและสวน ขอบคุณนะ Kubo!','Sunlight and a garden view. Thanks, Kubo!'],pos:[0,0,2.05],height:1.91},
 {id:'nova',name:'Nova',color:'#e6bc6e',room:103,request:['ดาวบ้านฉันอากาศเย็น ขอห้องเย็น ๆ ที่มองเห็นดวงดาวนะ','My home planet is cold. I’d like a cool room with a view of the stars.'],success:['อากาศเย็นกับวิวดาว เหมือนอยู่บ้านเลย!','Cool air and stars. Just like home!'],pos:[2.4,0,1.7],height:1.67}
];
const rooms=[{id:101,name:['ห้องจันทร์นิทรา','Moonlight'],features:['เงียบ · แสงสลัว','Quiet · Dim lighting']},{id:102,name:['ห้องสวนสุริยะ','Sun Garden'],features:['แสงสว่าง · วิวสวน','Bright · Garden view']},{id:103,name:['ห้องดาวเหนือ','North Star'],features:['อากาศเย็น · วิวดาว','Cool · Star view']}];
function local(pair){return pair[lang==='th'?0:1]}
function chooseGuest(id){if(lessonMode&&id!=='luma')return;selected=id;feedback=null;const actor=actors.get(id);if(actor)actor.userData.greet=performance.now();renderUI()}
function chooseRoom(id){
 const guest=guests.find(g=>g.id===selected);if(!guest||assigned.has(guest.id)||[...assigned.values()].includes(id))return;
 if(guest.room===id){assigned.set(guest.id,id);feedback={good:true,message:local(guest.success)};const actor=actors.get(guest.id);if(actor)actor.userData.celebrate=performance.now()}
 else{const actor=actors.get(guest.id);if(actor)actor.userData.mistake=performance.now();const chosen=rooms.find(r=>r.id===id);feedback={good:false,message:text(`ห้องนี้${chosen.features[0]} แต่ยังไม่ตรงคำขอของ ${guest.name} ลองอ่านคำขอแล้วเลือกอีกครั้งนะ`,`${chosen.name[1]} offers ${chosen.features[1].toLowerCase()}, which doesn’t match ${guest.name}’s request. Read the request and try again.`)}}
 renderUI();
}
function renderUI(){
 document.documentElement.lang=lang;
 $('back').href='/live/';$('back').textContent=text('ห้องทำงานสด · 8 สถานี →','Live Workshop · 8 stations →');$('heading').textContent=text('รับแขกจากต่างดาว','Welcome, space travellers');
 $('instruction').textContent=text('แตะแขกเพื่อฟังคำขอ แล้วเลือกห้องที่เหมาะ','Tap a guest, hear their request, and find their room.');
 $('progress').hidden=false;$('progress').textContent=text(`${assigned.size} / 3 เข้าพักแล้ว`,`${assigned.size} / 3 checked in`);
 $('language').textContent=text('EN','ไทย');$('language').setAttribute('aria-label',text('Switch to English','เปลี่ยนเป็นภาษาไทย'));
 $('reset').textContent=text('เริ่มใหม่','Start over');$('simulation').textContent=text('เกมจำลองสำหรับห้องเรียน · ไม่ได้เรียกใช้ AI จริง','Classroom simulation · No live AI or real bookings');
 $('guest-list').replaceChildren();
 guests.forEach(g=>{const b=document.createElement('button');b.className='guest-card';b.style.setProperty('--guest',g.color);b.setAttribute('aria-pressed',String(selected===g.id));b.innerHTML=`<span class="swatch"></span><span><strong>${g.name}</strong><small>${assigned.has(g.id)?text('เข้าพักแล้ว ✓','Checked in ✓'):text('ฟังคำขอ','Hear request')}</small></span>`;b.onclick=()=>chooseGuest(g.id);$('guest-list').append(b);const label=document.querySelector(`[data-guest="${g.id}"]`);if(label){label.setAttribute('aria-pressed',String(selected===g.id));label.classList.toggle('done',assigned.has(g.id));label.textContent=g.name+(assigned.has(g.id)?' ✓':'')}});
 const guest=guests.find(g=>g.id===selected);
 if(assigned.size===3){$('conversation').innerHTML=`<div class="complete-icon">✦</div><p class="speaker">KUBO</p><h2>${text('ทุกคนได้ห้องแล้ว!','Everyone’s settled in!')}</h2><p>${text('อ่านคำขอ → เปรียบเทียบข้อมูลห้อง → เลือก → ตรวจผล','Read the request → compare room details → choose → check the result.')}</p><p class="hint">${text('กดเริ่มใหม่เพื่อลองอีกรอบ','Start over to play another round.')}</p>`}
 else if(guest){$('conversation').innerHTML=`<p class="speaker">${text('คำขอของแขก','GUEST REQUEST')}</p><h2>${guest.name}</h2><blockquote>“${local(guest.request)}”</blockquote><p class="hint">${assigned.has(guest.id)?text('เข้าพักแล้ว เลือกแขกคนถัดไปได้เลย','Checked in. Choose another guest.'):text('เลือกจากข้อมูลห้องด้านล่าง','Choose using the room details below.')}</p>`}
 else{$('conversation').innerHTML=`<p class="speaker">KUBO</p><h2>${text('ช่วยฉันจัดห้องหน่อย','A room for every guest')}</h2><p>${text('แขก 3 คนต้องการห้องไม่เหมือนกัน แตะตัวละครหรือชื่อแขก แล้วฟังว่าพวกเขาต้องการอะไร','Our three guests need different rooms. Tap a character or their name to hear what they need.')}</p><p class="hint">${text('ยังไม่ต้องเดา เริ่มจากฟังคำขอก่อน','No guessing yet. Start with their request.')}</p>`}
 $('rooms').replaceChildren();rooms.forEach(r=>{const occupant=guests.find(g=>assigned.get(g.id)===r.id);const b=document.createElement('button');b.className='room';b.disabled=!guest||assigned.has(guest.id)||Boolean(occupant);b.innerHTML=`<span class="number">${r.id}</span><span><strong>${local(r.name)}</strong><small>${occupant?`${occupant.name} · ${text('เข้าพักแล้ว','Occupied')}`:local(r.features)}</small></span>`;b.onclick=()=>chooseRoom(r.id);$('rooms').append(b)});
 $('feedback').className=feedback?`feedback ${feedback.good?'good':'retry'}`:'';$('feedback').textContent=feedback?.message||'';
 document.body.dataset.mode=lessonMode?'mission':'practice';
 $('mission-mode').textContent=text('เรียนไปกับ Kubo · 7 บท','Learn with Kubo · 7 chapters');$('practice-mode').textContent=text('ลองจัดห้อง','Room practice');
 $('mission-mode').setAttribute('aria-pressed',String(lessonMode));$('practice-mode').setAttribute('aria-pressed',String(!lessonMode));
 $('mission').hidden=!lessonMode;
 for(const id of ['conversation','rooms','feedback'])$(id).hidden=lessonMode;
 labels.forEach(label=>{label.hidden=lessonMode});
 if(lessonMode){selected='kubo';$('heading').textContent=text('เข้ากะกับ Kubo','On shift with Kubo');$('instruction').textContent=text('แขกแต่ละคนต้องการอะไร แล้วห้องไหนตอบโจทย์?','Different guests. Different needs. Let’s find their rooms.');$('reset').textContent=text('เริ่มกิจกรรมนี้ใหม่','Restart this activity');mission.render()}
 lessonScene?.sync(lessonState,lang,lessonMode);
 updateStatus();
}
let loadFailure=false,loadMs=0;
function updateStatus(){ $('render-status').textContent=loadFailure?text('3D ไม่พร้อม แต่ยังทำกิจกรรมด้วยปุ่มได้','3D unavailable. The activity still works with buttons.'):ready?(lessonMode?text('Kubo นำทาง · คุณเลือกว่าจะไปต่อเมื่อไร','Kubo is your guide · You choose when to continue'):text('ล็อบบี้พร้อม · แตะตัวละครได้เลย','Lobby ready · Tap a character')):text('กำลังโหลดโมเดล 3D','Loading 3D models') }
const actors=new Map(),labels=new Map();
const animated=[];
const mission=createCourse({host:$('mission'),getLanguage:()=>lang,onChange:state=>{lessonState=state;const {chapter,step,total}=state;if(lessonMode){$('progress').hidden=chapter==='WELCOME';$('progress').textContent=`${chapter} · ${step+1} / ${total}`}lessonScene?.sync(state,lang,lessonMode)},onReaction:reaction=>{const now=performance.now();const actor=animated.find(a=>a.userData.motion?.id==='kubo');if(actor)actor.userData[reaction]=now;actors.forEach(a=>a.userData[reaction]=now)},onPractice:()=>{lessonMode=false;renderUI()}});
$('mission-mode').onclick=()=>{lessonMode=true;renderUI()};$('practice-mode').onclick=()=>{lessonMode=false;renderUI()};
$('language').onclick=()=>{lang=lang==='th'?'en':'th';feedback=null;renderUI()};
$('reset').onclick=()=>{if(lessonMode)mission.reset();else{assigned.clear();selected=null;feedback=null}animated.forEach(a=>{a.userData.celebrate=-1e6;a.userData.greet=-1e6;a.userData.mistake=-1e6});renderUI()};
renderUI();
async function init3D(){
 const started=performance.now();const canvas=$('scene');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;
 const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-7,7,5,-5,.1,100);camera.position.set(6,7.4,16);camera.lookAt(0,2,0);
 scene.add(new THREE.HemisphereLight(0xc7e8ff,0x77607a,2.6));const light=new THREE.DirectionalLight(0xffdfae,3.5);light.position.set(-3,8,6);scene.add(light);const fill=new THREE.DirectionalLight(0xa1b8ff,1.8);fill.position.set(5,4,-1);scene.add(fill);
 const loader=new GLTFLoader();
 const results=await Promise.all(['lobby','kubo','luma','pip','nova'].map(async id=>({id,gltf:await loader.loadAsync(`./models/${id==='kubo'?'kubo-original':id}.glb`)})));
 for(const {id,gltf} of results){const model=gltf.scene;
  model.traverse(o=>{if(o.isMesh){const materials=Array.isArray(o.material)?o.material:[o.material];for(const mat of materials){if(mat.transparent){mat.depthWrite=false;mat.side=THREE.FrontSide;mat.opacity=.32;mat.roughness=.2}if(mat.name==='wall'){mat.flatShading=true;mat.needsUpdate=true}}}});
  if(id==='lobby')scene.add(model);
  else if(id==='kubo'){const original=createOriginalKubo(gltf);scene.add(original);animated.push(original);const label=document.createElement('span');label.className='kubo-guide-label';label.textContent='Kubo ✦';$('stage').append(label)}
  else{const guest=guests.find(g=>g.id===id);prepareCharacter(model,id,guests.indexOf(guest)+1);model.position.fromArray(guest.pos);model.userData.guest=id;model.userData.baseY=0;actors.set(id,model);animated.push(model);scene.add(model);const label=document.createElement('button');label.className='guest-label';label.dataset.guest=id;label.textContent=guest.name;label.onclick=()=>chooseGuest(id);$('labels').append(label);labels.set(id,label)}
 }
 lessonScene=createLessonScene({scene,camera,actors,kubo:animated.find(a=>a.userData.originalKubo),stage:$('stage')});
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let pointerStart;
 canvas.addEventListener('pointerdown',e=>{pointerStart=[e.clientX,e.clientY]});
 canvas.addEventListener('pointerup',e=>{if(!pointerStart||Math.hypot(e.clientX-pointerStart[0],e.clientY-pointerStart[1])>10)return;const bounds=canvas.getBoundingClientRect();pointer.set((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects([...actors.values()],true)[0];if(hit){let root=hit.object;while(root&&!root.userData.guest)root=root.parent;if(root)chooseGuest(root.userData.guest)}});
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function resize(){const {width,height}=$('stage').getBoundingClientRect();renderer.setSize(width,height,false);const aspect=width/height;const halfHeight=Math.max(4.3,7.4/aspect);camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix()}
 new ResizeObserver(resize).observe($('stage'));resize();
 ready=true;loadMs=Math.round(performance.now()-started);$('loading').hidden=true;renderUI();
 let lastFrame=performance.now();
 function frame(now){const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;if(!document.hidden){lessonScene.update(now,dt,reduce.matches);animated.forEach(model=>(model.userData.originalKubo?animateOriginalKubo:animateCharacter)(model,now,dt,{selected,camera,reduced:reduce.matches}));actors.forEach((model,id)=>{const guest=guests.find(g=>g.id===id);const p=new THREE.Vector3(model.position.x,guest.height+.35,model.position.z).project(camera);const label=labels.get(id);label.style.left=`${(p.x*.5+.5)*100}%`;label.style.top=`${(-p.y*.5+.5)*100}%`});renderer.render(scene,camera)}requestAnimationFrame(frame)}
 requestAnimationFrame(frame);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback()});
 console.info(`Guesthouse: 5 GLBs ready in ${loadMs}ms. Three.js ${THREE.REVISION}.`);
}
function fallback(){loadFailure=true;$('stage').classList.add('fallback');$('loading').hidden=false;$('loading').textContent=text('3D ไม่พร้อม แต่ยังเล่นด้วยปุ่มด้านล่างได้','3D isn’t available. Play using the buttons below.');updateStatus()}
init3D().catch(error=>{console.error('Guesthouse 3D:',error);fallback()});
