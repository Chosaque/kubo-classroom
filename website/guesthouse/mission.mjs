import {records,createState,answer,canContinue,next,toggleCard,draft,verify} from './mission-state.mjs';

const titles=[['Kubo เห็นอะไรตอนนี้?','What can Kubo see right now?'],['คำขอชุดไหนใช้กับคืนนี้?','Which request applies tonight?'],['จัดโต๊ะให้ Kubo','Set up Kubo’s desk']];
const leads=[['Luma อยากพักแล้ว ช่วย Kubo เลือกข้อมูลที่จะใช้หาห้องคืนนี้','Luma needs some rest. Help Kubo find the information for tonight’s room.'],['มีบันทึกเก่าและประกาศอาหารเพิ่มบนโต๊ะ ลองตัดสินใจก่อนดูตัวอย่าง','An old note and a café notice have joined the desk. Make your call before the reveal.'],['แตะเพื่อนำข้อมูลที่ไม่ใช้คืนนี้ออก แล้วให้ Kubo แนะนำห้อง','Set aside the notes tonight’s task doesn’t need. Then ask Kubo for a recommendation.']];
const notes=[
 ['ถามผู้เรียนว่า Kubo เห็นอะไรในรอบนี้ แยกข้อมูลบนโต๊ะออกจากแฟ้มที่เก็บไว้ โต๊ะคือภาพเปรียบเทียบของ context ไม่มีการอ้างจำนวนการ์ดเป็นขีดจำกัดโทเคนจริง','Ask what Kubo can see in this turn. Distinguish the current desk from stored files. The desk is an analogy for context; card count is not a token limit.'],
 ['ให้ผู้เรียนทายก่อนเฉลย บันทึกใหม่มีน้ำหนักเพราะ Luma ยืนยันและระบุว่าเปลี่ยนความต้องการ ไม่ใช่เพียงมีเวลาที่ใหม่กว่า ตัวอย่างห้อง 102 เป็นข้อผิดพลาดที่เขียนไว้สำหรับสอน ไม่ใช่ผล AI สด โมเดลจริงอาจจัดการข้อมูลเก่าได้ถูกต้อง การ์ด 4 ใบไม่ใช่การวัด context rot','Let learners predict first. The current request controls because Luma explicitly confirmed a change, not merely because its timestamp is newer. The room-102 draft is an authored possible error, not a live AI result. Real models may handle stale records correctly. Four cards are not a context-rot benchmark.'],
 ['ให้ผู้เรียนเก็บทั้งคำขอคืนนี้และข้อมูลห้อง แล้วตรวจว่า 101 ตรงทั้งความเงียบและแสงสลัว การนำการ์ดออกไม่ได้ลบต้นฉบับ ในงานจริงควรตรวจแหล่งที่มาและความเกี่ยวข้อง หากยังขัดแย้งโดยไม่รู้ว่าอะไรยืนยันแล้วให้ถาม งานนี้จบที่คำแนะนำ การอนุมัติการจองอยู่ในบทหลัง','Keep both tonight’s request and the room directory; check room 101 against quiet and dim lighting. Setting aside a card does not delete its source. Verify authority and relevance in real work; ask when unresolved conflict remains. This mission ends with a recommendation; booking permission belongs to a later chapter.']
];
const course=[
 ['QI-01','ข้อมูลในบริบท','Current context','คำขอคืนนี้ → บันทึกเก่า → จัดโต๊ะ','Tonight’s request → old notes → clean desk'],
 ['QI-02','จัดบริบท','Shape context','Write · Compress · Select · Isolate · เรียกบันทึกกลับ','Write · Compress · Select · Isolate · retrieve notes'],
 ['QI-03','คำสั่งชัดเจน','Clear instructions','ระบุงาน ข้อมูล และรูปแบบผลลัพธ์','Specify the task, facts, and output'],
 ['QI-04','วงจร Agent','The agent loop','Think → Choose → Act → Read → Decide','Think → Choose → Act → Read → Decide'],
 ['QI-05','ข้อมูลภายนอก','External content','MCP และคำสั่งแฝงในเอกสาร','MCP and instructions hidden in documents'],
 ['QI-06','โทเคนไทย–อังกฤษ','Thai & English tokens','เทียบจำนวนโทเคนที่วัดจริงและรักษาข้อมูลสำคัญ','Compare measured tokens; preserve essential facts'],
 ['QI-07','ห้องทำงาน','The workroom','ประกอบบริบท กฎ Skills เครื่องมือ ผู้ช่วย และการอนุมัติ','Combine context, rules, skills, tools, a helper, and permission']
];

export function createMission({host,getLanguage,onChange,onReaction,onPractice}){
 let state=createState();
 const local=pair=>pair[getLanguage()==='th'?0:1];
 const t=(th,en)=>local([th,en]);
 function button(label,action,attrs=''){return `<button type="button" data-action="${action}" ${attrs}>${label}</button>`}
 function recordHTML(record,interactive=false){const chosen=state.cards.has(record.id);const tag=interactive?'button':'article';return `<${tag} class="evidence ${interactive&&!chosen?'set-aside':''}" ${interactive?`type="button" data-action="card:${record.id}" aria-pressed="${chosen}"`:''}><span class="record-top"><strong>${local(record.title)}</strong>${interactive?`<span class="card-state">${chosen?t('บนโต๊ะ ✓','On desk ✓'):t('พักไว้ +','Set aside +')}</span>`:''}</span><span class="source">${local(record.source)}</span><span class="record-body">${local(record.body).replaceAll('\n','<br>')}</span></${tag}>`}
 function feedbackHTML(){
  if(state.step===0&&state.answers[0])return `<div class="mission-feedback ${state.answers[0]==='desk'?'good':'retry'}" role="status">${state.answers[0]==='desk'?t('ใช่ Kubo ใช้ข้อมูลที่นำมาให้ในรอบนี้ แฟ้มที่เก็บไว้ยังต้องถูกเรียกมาใช้ก่อน','Yes. Kubo uses the information supplied for this turn. A stored file must first be brought into context.'):t('ลองอีกครั้ง การเก็บข้อมูลไว้ในแฟ้มไม่ได้ทำให้ Kubo เห็นทุกอย่างอัตโนมัติ ดูว่าตอนนี้มีอะไรอยู่บนโต๊ะ','Try again. Stored records aren’t all visible automatically. Look at what is actually on the desk.')}</div>`;
  if(state.step===1&&state.answers[1]){
   const ok=state.answers[1]==='current';
   return `<div class="mission-feedback ${ok?'good':'retry'}" role="status">${ok?t('ยึดคำขอคืนนี้ เพราะ Luma ยืนยันเองว่าเปลี่ยนเป็นเงียบและแสงสลัว บันทึกครั้งก่อนใช้กับการพักคนละครั้ง','Use tonight’s request: Luma explicitly confirmed a change to quiet and dim lighting. The old note describes another stay.'):t('บันทึกครั้งก่อนใช้กับอีกทริป คืนนี้ Luma ยืนยันว่าเปลี่ยนความต้องการแล้ว ลองเลือกแหล่งข้อมูลอีกครั้ง','The old note belongs to another trip. Luma explicitly changed the request tonight. Choose the controlling source again.')}</div>${ok?`<div class="draft-example"><strong>${t('ตัวอย่างเมื่อหยิบข้อมูลเก่ามาใช้','A possible stale-record mistake')}</strong><p>“${t('Luma ชอบแสงสว่าง จึงแนะนำห้อง 102','Luma likes bright light, so I recommend room 102')}”</p><small>${t('ขัดกับคำขอคืนนี้ · ตัวอย่างที่เตรียมไว้ ไม่ใช่คำตอบจาก AI สด','Conflicts with tonight’s request · Authored example, not live AI output')}</small></div>`:''}`;
  }
  if(state.step===2&&state.draft){
   const d=state.draft;
   const messages={
    'missing-request':[ 'ยังไม่มีคำขอคืนนี้บนโต๊ะ Kubo จึงไม่รู้ว่าตอนนี้ Luma ต้องการอะไร นำคำขอคืนนี้กลับมาแล้วลองใหม่','Tonight’s request is missing. Kubo doesn’t know what Luma currently needs. Bring that card back and try again.'],
    'missing-rooms':['มีคำขอแล้ว แต่ยังไม่มีข้อมูลห้องให้เปรียบเทียบ นำข้อมูลห้องที่ว่างกลับมาแล้วลองใหม่','The request is here, but there are no room facts to compare. Bring back the available-room card.'],
    'cleanup':[d.old?'ยังมีบันทึกของการพักครั้งก่อนปนอยู่ พักบันทึกนั้นไว้ เพราะ Luma ยืนยันการเปลี่ยนแล้ว':'ประกาศอาหารไม่ช่วยตัดสินว่าห้องไหนเงียบและแสงสลัว พักไว้ก่อนเพื่อลดข้อมูลรบกวน',d.old?'The previous stay is still mixed in. Set it aside: Luma has explicitly confirmed a change.':'The café notice doesn’t help identify a quiet, dim room. Set it aside to reduce distraction.']
   };
   if(!d.ok)return `<div class="mission-feedback retry" role="status">${local(messages[d.kind])}</div>`;
   return `<div class="recommendation" role="status"><span class="room-number">101</span><div><strong>${t('Kubo แนะนำห้องจันทร์นิทรา','Kubo recommends Moonlight')}</strong><p>${t('ห้อง 101 เงียบและแสงสลัว ตรงกับคำขอที่ Luma ยืนยันคืนนี้','Room 101 is quiet and dim, matching the request Luma confirmed tonight.')}</p></div></div><fieldset class="answer-options"><legend>${t('ตรวจคำแนะนำก่อนจบ','Check the recommendation')}</legend>${button(t('ตรงทั้งความเงียบและแสงสลัว','It matches both quiet and dim lighting'),'verify:both',`aria-pressed="${state.check==='both'}"`)}${button(t('เลือกเพราะเป็นหมายเลขห้องที่น้อยที่สุด','It was chosen because it has the lowest number'),'verify:number',`aria-pressed="${state.check==='number'}"`)}</fieldset>${state.check==='number'?`<div class="mission-feedback retry" role="status">${t('หมายเลขห้องไม่ใช่เหตุผล ลองเทียบคุณสมบัติห้องกับคำขอทั้งสองข้อ','The room number isn’t the reason. Compare the room features with both parts of the request.')}</div>`:''}`;
  }
  return '';
 }
 function render(){
  const step=state.step;
  host.innerHTML=`<nav class="mission-steps" aria-label="${t('ลำดับภารกิจ','Mission steps')}">${titles.map((title,i)=>`<span ${i===step?'aria-current="step"':''}><b>${i+1}</b>${local([['ดูข้อมูล','See'],['ทายก่อน','Predict'],['จัดและตรวจ','Choose & check']][i])}</span>`).join('')}</nav><h2 id="mission-title" tabindex="-1">${state.verified?t('Luma ได้คำแนะนำที่ตรงใจแล้ว','A room that fits Luma'):local(titles[step])}</h2>`;
  if(state.verified){host.innerHTML+=`<div class="mission-finish"><span class="finish-star">✦</span><blockquote>“${t('ห้องเงียบ แสงสลัว คืนนี้ได้นอนเต็มอิ่มแล้ว!','Quiet and softly lit. I can finally get some rest!')}”<cite>— Luma</cite></blockquote><p>${t('เก็บคำขอคืนนี้ + ข้อมูลห้อง → แนะนำห้อง 101 → ตรวจครบทั้งสองเงื่อนไข','Keep tonight’s request + room facts → recommend 101 → verify both requirements.')}</p><p class="takeaway">${t('Context คือข้อมูลที่ Kubo ใช้ในรอบนี้ เลือกให้เกี่ยวข้องและตรวจว่าใช้กับงานปัจจุบัน','Context is what Kubo can use in this turn. Choose relevant information and check that it applies now.')}</p><p class="mission-hint">${t('บันทึกครั้งก่อนและเมนูยังอยู่ในแฟ้ม เพียงไม่ใช้กับคำตอบนี้','The old note and menu remain in the archive. They’re simply not used for this answer.')}</p>${button(t('ลองใหม่','Replay mission'),'reset','class="primary-action"')}${button(t('ลองจัดห้องให้แขกคนอื่น','Try rooms for the other guests'),'practice','class="secondary-action"')}</div>`}
  else{
   host.innerHTML+=`<p class="mission-lead">${local(leads[step])}</p><div class="desk-caption">${t('บนโต๊ะของ Kubo','On Kubo’s desk')} <span>${step===0?'2':step===1?'4':state.cards.size} ${t('รายการ','records')}</span></div><div class="evidence-list">${(step===0?records.slice(0,2):records).map(r=>recordHTML(r,step===2)).join('')}</div>`;
   if(step===0){host.innerHTML+=`<details class="archive" ${state.archiveOpen?'open':''}><summary>${t('ในแฟ้ม แต่ยังไม่อยู่บนโต๊ะ · 2 รายการ','In the archive, not on the desk · 2 records')}</summary><p>${t('บันทึกการพักครั้งก่อน · ประกาศร้านอาหาร','Previous stay · Café notice')}</p></details><fieldset class="answer-options"><legend>${t('Kubo ใช้ข้อมูลอะไรตอบในรอบนี้?','What can Kubo use in this turn?')}</legend>${button(t('ข้อมูลที่อยู่บนโต๊ะตอนนี้','The information currently on the desk'),'answer:desk',`aria-pressed="${state.answers[0]==='desk'}"`)}${button(t('ทุกอย่างที่เคยเก็บไว้ในแฟ้ม','Everything ever stored in the archive'),'answer:archive',`aria-pressed="${state.answers[0]==='archive'}"`)}</fieldset>`}
   if(step===1){host.innerHTML+=`<fieldset class="answer-options"><legend>${t('ควรยึดข้อมูลไหนในการเลือกห้องคืนนี้?','Which source should control tonight’s choice?')}</legend>${button(t('คำขอคืนนี้ที่ Luma ยืนยันว่าเปลี่ยนแล้ว','Tonight’s change confirmed by Luma'),'answer:current',`aria-pressed="${state.answers[1]==='current'}"`)}${button(t('บันทึกครั้งก่อน เพราะเคยใช้แล้ว','The previous stay, because it worked before'),'answer:old',`aria-pressed="${state.answers[1]==='old'}"`)}${button(t('ใช้ทุกอย่าง โดยไม่แยกว่ามาจากการพักครั้งไหน','Use everything without separating the visits'),'answer:all',`aria-pressed="${state.answers[1]==='all'}"`)}</fieldset>`}
   if(step===2)host.innerHTML+=`<p class="mission-hint">${t('แตะการ์ดเพื่อพักไว้หรือนำกลับ ไม่ได้ลบข้อมูลจากแฟ้ม','Tap a card to set it aside or bring it back. Its source stays in the archive.')}</p>${button(t('ให้ Kubo แนะนำห้อง','Ask Kubo to recommend a room'),'draft','class="primary-action"')}`;
   host.innerHTML+=feedbackHTML();
   host.innerHTML+=`<nav class="mission-navigation" aria-label="${t('เปลี่ยนขั้นตอน','Step navigation')}">${button(t('ย้อนกลับ','Back'),'back',step===0?'disabled':'')}${step<2?button(t('ถัดไป →','Next →'),'next',`class="primary-action" ${canContinue(state)?'':'disabled'}`):''}</nav>`;
  }
  host.innerHTML+=`<div class="lesson-extras"><details class="teacher-notes" ${state.notesOpen?'open':''}><summary>${t('บันทึกผู้สอน','Presenter notes')}</summary><p>${local(notes[step])}</p></details><details class="course-map" ${state.mapOpen?'open':''}><summary>${t('ลำดับบทเรียนเดิม','Original lesson sequence')}</summary><ol>${course.map((c,i)=>`<li><strong>${c[0]} · ${getLanguage()==='th'?c[1]:c[2]}</strong><span>${getLanguage()==='th'?c[3]:c[4]}</span><small>${i===0?t('ภารกิจนี้','This mission'):t('ยังไม่แปลงเป็นภารกิจ','Guesthouse mission not built yet')}</small></li>`).join('')}</ol></details></div>`;
  host.querySelector('.teacher-notes').ontoggle=e=>state.notesOpen=e.target.open;
  host.querySelector('.course-map').remove();
  const archive=host.querySelector('.archive');if(archive)archive.ontoggle=e=>state.archiveOpen=e.target.open;
  onChange({step,complete:state.verified,title:local(titles[step])});
 }
 host.addEventListener('click',e=>{
  const control=e.target.closest('button[data-action]');if(!control||control.disabled)return;
  const [actionName,value]=control.dataset.action.split(':');let focusTitle=false;
  if(actionName==='answer')answer(state,value);
  if(actionName==='next'){focusTitle=next(state)}
  if(actionName==='back'){state.step=Math.max(0,state.step-1);focusTitle=true}
  if(actionName==='card')toggleCard(state,value);
  if(actionName==='draft'){draft(state);onReaction(state.draft.ok?'greet':'mistake')}
  if(actionName==='verify'){verify(state,value);onReaction(state.verified?'celebrate':'mistake');focusTitle=state.verified}
  if(actionName==='reset'){state=createState();focusTitle=true}
  if(actionName==='practice'){onPractice();return}
  render();
  if(focusTitle)host.querySelector('#mission-title').focus({preventScroll:true});
  else{const replacement=[...host.querySelectorAll('[data-action]')].find(b=>b.dataset.action===control.dataset.action);replacement?.focus({preventScroll:true})}
 });
 return {render,reset(){state=createState();render()},getState(){return state}};
}
