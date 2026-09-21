import {chapters,tokenTexts} from './course-data.mjs';
import {createMission} from './mission.mjs';
export const sameSelection=(selected,expected)=>selected.length===expected.length&&expected.every(x=>selected.includes(x));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createCourse({host,getLanguage,onChange,onReaction,onPractice}){
 let chapter=0,step=0,counter=null,tokenError=false,note='',savedNote='',noteSaved=false,tokenLoading=false;
 const states=new Map();const completed=new Set();
 host.innerHTML='<div id="course-nav"></div><div id="course-body"></div><div id="context-mission" hidden></div><div id="course-onward"></div>';
 const nav=host.querySelector('#course-nav'),body=host.querySelector('#course-body'),context=host.querySelector('#context-mission'),onward=host.querySelector('#course-onward');
 const l=p=>p[getLanguage()==='th'?0:1],t=(th,en)=>l([th,en]);
 const key=()=>`${chapter}:${step}`;
 const state=()=>{if(!states.has(key()))states.set(key(),{selected:[],choice:null,done:false,phase:0,text:'',feedback:false,tokenValues:[...tokenTexts.short]});return states.get(key())};
 const button=(label,act,extra='')=>`<button type="button" data-course="${act}" ${extra}>${escape(label)}</button>`;
 let contextComplete=false,contextStep=0;
 const mission=createMission({host:context,getLanguage,onChange:({step:s,complete})=>{contextStep=s;contextComplete=complete;if(complete)completed.add('1:2');if(chapter===1){const position=nav.querySelector('.course-position');if(position)position.firstChild.textContent=`QI-01 · ${s+1} / 3 `;onChange({chapter:'QI-01',step:s,total:3,complete});renderOnward()}},onReaction,onPractice});
 function renderOnward(){onward.innerHTML=chapter===1&&contextComplete?button(t('ต่อ QI-02 →','Continue to QI-02 →'),'chapter:2','class="primary-action"'):''}
 function report(){onChange({chapter:chapters[chapter].id,step,total:chapters[chapter].beats.length,complete:state().done});}
 function tokenHTML(s){return `<div class="token-grid">${['ไทย','English'].map((name,i)=>`<label>${name}<textarea data-token="${i}" rows="3" maxlength="1500">${escape(s.tokenValues[i])}</textarea><output id="count-${i}">${counter?counter(s.tokenValues[i]):t('กำลังโหลดตัวตัดโทเคน…','Loading tokenizer…')}</output> ${t('โทเคน','tokens')}</label>`).join('')}</div><p class="mission-hint">js-tiktoken · o200k_base · ${t('นับเฉพาะข้อความ ไม่รวมโครงข้อความแชตหรือเครื่องมือ','Text only; excludes chat framing and tool overhead')}</p>${tokenError?`<p role="alert">${t('โหลดตัวนับไม่สำเร็จ ลองโหลดหน้าใหม่ ไม่มีการใช้ค่าประมาณแทน','Tokenizer failed to load. Reload to retry; no estimated counts are substituted.')}</p>`:''}`}
 async function loadCounter(){if(counter||tokenError||tokenLoading)return;tokenLoading=true;try{const module=await import('./vendor/token-counter.js');counter=module.createCounter();if(chapter===6)render()}catch(e){tokenError=true;if(chapter===6)render();console.error('Tokenizer failed',e)}}
 function extraHTML(b,s){
  if(b.kind==='note')return `<label class="work-field">${t('บันทึกส่งต่อ (เก็บเฉพาะในหน้านี้)','Handover note (this page only)')}<textarea data-field="note" rows="4" maxlength="1200" placeholder="Nova…">${escape(note)}</textarea></label>${button(t('บันทึกโน้ต','Save note'),'save','class="primary-action"')}${s.done?`<div class="draft-example"><strong>${t('เทียบกับรายการที่ควรมี','Compare with this checklist')}</strong><p>${t('Nova ยืนยันว่าอยากได้เย็น + วิวดาว / 103 ตรงคุณสมบัติ / ยังไม่ตรวจที่ว่าง / ยังไม่จอง / ขั้นต่อไปตรวจสถานะคืนนี้','Nova confirmed cool + stars / 103 matches features / availability unchecked / not booked / next: check tonight’s status')}</p><small>${t('บันทึกแล้ว ไม่ได้หมายความว่าข้อความของคุณผ่านการตรวจความถูกต้อง ให้ผู้เรียนตรวจเองตามรายการ','Saved does not mean your wording has been validated. Review it against the checklist.')}</small></div>`:''}`;
  if(b.kind==='retrieve'&&s.done)return `<article class="evidence"><strong>${t('โหลดเข้าสู่โต๊ะแล้ว','Loaded onto the desk')}</strong><p>${escape(noteSaved?savedNote:t('ตัวอย่างบันทึก: Nova ขอเย็น + วิวดาว; 103 ตรงคุณสมบัติ; ต้องตรวจที่ว่าง; ยังไม่จอง','Sample note: Nova wants cool + stars; 103 fits; check availability; not booked.'))}</p><small>${noteSaved?t('บันทึกที่คุณเขียนใน QI-02','Your note from QI-02'):t('ใช้ตัวอย่างเพราะคุณข้ามขั้นเขียนโน้ต','Using a sample because the note-writing step was skipped')}</small></article>`;
  if(b.kind==='hide'&&s.choice!==null)return `<div class="draft-example">${l([
   ['[งานหาย] Pip ต้องการสว่างและสวน; 102 ตรง; 1 ประโยค → ถามว่าต้องการให้ทำอะไร','[Task missing] Pip wants bright + garden; 102 fits; one sentence → Ask what to do.'],
   ['ร่างคำแนะนำให้ Pip; [ข้อมูลห้องหาย]; 1 ประโยค → ค้นข้อมูลห้องที่ได้รับอนุญาตหรือถาม อย่าเดา','Draft a recommendation for Pip; [room facts missing]; one sentence → Retrieve authorized facts or ask, not guess.'],
   ['ร่างคำแนะนำให้ Pip; 102 สว่างและวิวสวน; [รูปแบบหาย] → ใช้คำตอบสั้นที่เหมาะสมได้','Draft a recommendation for Pip; 102 is bright with a garden; [format missing] → A concise default can still work.']
  ][s.choice])}</div>`;
  if(b.kind==='lookup')return `<div class="tool-result"><p>${s.phase===0?t('ยังไม่ได้เรียกเครื่องมือ','Tool not called'):s.phase===1?t('ส่งคำขอแล้ว · ยังไม่ได้เปิดผล','Request issued · response not inspected'):t('ได้รับผลจำลอง: ห้อง 103 ว่างเวลา 19:10 คืนนี้ · เย็น · วิวดาว · ยังไม่จอง','Simulated result received: 103 available tonight at 19:10 · cool · star view · not booked')}</p>${s.phase<2?button(s.phase===0?t('เรียกค้นหาจำลอง','Run simulated lookup'):t('เปิดผลที่ส่งกลับ','Read returned result'),'lookup','class="primary-action"'):''}</div>`;
  if(b.kind==='recipe')return `${button(t('เปิดแนวทางร่างข้อความ','Open the drafting guide'),'recipe','class="primary-action"')}${s.done?`<ol class="recipe"><li>${t('อ่านคำขอและขอบเขตว่าให้ร่างเท่านั้น','Read the task and draft-only boundary')}</li><li>${t('ตรวจแหล่งข้อมูล ห้อง วัน เวลา สถานที่ และคำแนะนำให้มาก่อน','Check source, room, day, time, location, and early arrival')}</li><li>${t('ร่างข้อความหนึ่งประโยคจากข้อมูลยืนยัน','Draft one sentence from confirmed facts')}</li><li>${t('เทียบร่างกับบันทึก แก้จุดไม่ตรง แล้วคืนให้ตรวจ ไม่ส่งเอง','Compare against the record, repair mismatches, and return for review; do not send')}</li></ol>`:''}`;
  if(b.kind==='tokens'&&s.choice!==null){loadCounter();return tokenHTML(s)}
  if(b.kind==='shorten'&&s.done){loadCounter();return `<div class="evidence"><p>${escape(l(tokenTexts.long))}</p><p>${t('ต้นฉบับ','Original')}: ${counter?counter(l(tokenTexts.long)):'…'} → ${t('ฉบับย่อที่ครบ','Complete short version')}: ${counter?counter(l(tokenTexts.short)):'…'} ${t('โทเคน','tokens')}</p></div>`}
  if(b.kind==='permission'&&s.done)return `<p class="tool-result" role="status">${s.choice===0?t('ส่งจำลองถึง Pip 1 ครั้งแล้ว · ไม่มีข้อความจริงออกจากหน้านี้','One simulated send to Pip completed · No real message left this page'):t('เก็บเป็นร่าง · ไม่ส่ง','Kept as draft · Not sent')}</p>`;
  if(b.kind==='transfer')return `<div class="agent-recipe"><strong>${t('ชุดงานที่เราประกอบแล้ว','The workflow we assembled')}</strong><p>${t('คำขอ → บันทึกที่เกี่ยวข้อง → กติกา → Skill → อ่านข้อมูล → ร่าง → ตรวจ → คืนร่างหรือขอสิทธิ์ส่ง','Task → relevant record → rules → skill → read facts → draft → review → return draft or request sending permission')}</p></div><label class="work-field">${t('แผนงานใหม่ของคุณ','Your new-task plan')}<textarea data-field="transfer" rows="5" maxlength="1800">${escape(s.text)}</textarea></label>${button(t('เปิดตัวอย่างเพื่อเทียบ','Reveal an example for comparison'),'transfer','class="primary-action"')}${s.done?`<div class="takeaway"><p>${t('งาน: ร่างสรุปประชุม / ข้อมูล: บันทึกประชุมที่ผู้ใช้ให้ / เครื่องมือ: อ่านเอกสารที่อนุญาต / กติกา: ไม่แต่งมติหรือชื่อ / วงจร: อ่าน–ร่าง–ตรวจ / หยุด: คืนร่างพร้อมจุดไม่ชัด / ห้ามส่งอีเมลเอง','Task: draft meeting summary / Context: supplied meeting notes / Tool: authorized document reader / Rules: invent no decisions or names / Loop: read–draft–check / Stop: return draft and uncertainties / Do not email automatically')}</p><p>${t('จบกะแล้ว! ขั้นต่อไปของเวิร์กช็อปคือสร้างและทดสอบ Agent ที่ร่างอย่างเดียวกับข้อมูลตัวอย่าง','Shift complete! A follow-on workshop would configure and test a draft-only agent against known sample input.')}</p><small>${t('เปิดตัวอย่างไม่ได้หมายความว่าแผนของคุณผ่านการประเมินแล้ว ให้ผู้สอนช่วยตรวจ','Revealing this example does not validate your plan. Review it with the presenter.')}</small></div>`:''}`;
  return '';
 }
 function render(){
  const ch=chapters[chapter],s=state();
  nav.innerHTML=`<label class="chapter-picker">${t('เลือกบทเรียน','Choose chapter')}<select id="chapter-picker">${chapters.map((c,i)=>`<option value="${i}" ${i===chapter?'selected':''}>${i?c.id+' · ':''}${escape(l(c.name))}</option>`).join('')}</select></label><p class="course-position">${chapter===1?'QI-01':ch.id} · ${chapter===1?contextStep+1:step+1} / ${ch.beats.length} <span>${t('33 ขั้น · เลือกเปลี่ยนบทได้','33 steps · Chapters are freely navigable')}</span></p>`;
  if(chapter===0)nav.querySelector('.course-position').hidden=true;
  context.hidden=chapter!==1;body.hidden=chapter===1;
  if(chapter===1){mission.render();renderOnward();return}
  onward.innerHTML='';const b=ch.beats[step];
  body.innerHTML=`<h2 id="course-title" tabindex="-1">${escape(l(b.title))}</h2><div class="kubo-says"><strong>Kubo</strong><p>${escape(l(b.story)).replaceAll('\n','<br>')}</p></div>${b.options.length?`<fieldset class="answer-options"><legend>${b.kind==='multi'?t('เลือกให้ครบแล้วตรวจ','Select all that apply, then check'):t('ลองเลือกก่อนดูข้อสรุป','Choose before the reveal')}</legend>${b.options.map((o,i)=>button(l(o),`pick:${i}`,`aria-pressed="${b.kind==='multi'?s.selected.includes(i):s.choice===i}"`)).join('')}</fieldset>${b.kind==='multi'?button(t('ตรวจรายการที่เลือก','Check selected items'),'check','class="primary-action check-selection"'):''}`:''}${extraHTML(b,s)}${s.feedback&&!s.done?`<div class="mission-feedback retry" role="status">${t('ยังไม่ตรง ลองเทียบกับคำขอ ข้อมูลที่ยืนยัน และขอบเขตอีกครั้ง','Not quite. Compare your choice with the request, confirmed evidence, and allowed scope.')}</div>`:''}${s.done?`<div class="mission-feedback good" role="status">${escape(l(b.takeaway))}</div>`:''}<nav class="mission-navigation">${button(t('← ย้อนกลับ','← Back'),'back',chapter===0&&step===0?'disabled':'')}${button(chapter===7&&step===9?t('กลับไปต้นบทเรียน','Return to the beginning'):t('ถัดไป →','Next →'),'next',`class="primary-action" ${s.done?'':'disabled'}`)}</nav><details class="teacher-notes lesson-extras"><summary>${t('บันทึกผู้สอน','Presenter notes')}</summary><p>${t('ให้ผู้เรียนอธิบายเหตุผลก่อนเลือก เปิดข้อสรุปหลังตอบ ทุกผลเป็นตัวอย่างที่เตรียมไว้ ไม่ใช่ผล AI สด การข้ามบทไม่ถือว่าทำกิจกรรมก่อนหน้าผ่านแล้ว','Ask learners to explain their prediction first, then discuss the reveal. Results are authored examples, not live AI output. Navigating past a chapter does not mark skipped activities complete.')}</p><p>${s.done?escape(l(b.takeaway)):t('ข้อสรุปจะเปิดหลังทำกิจกรรม','The takeaway appears after the activity.')}</p></details>`;
  report();
 }
 function done(){const s=state();s.done=true;s.feedback=false;completed.add(key());onReaction('celebrate')}
 function go(c,n=0){chapter=c;step=n;render();body.querySelector('#course-title')?.focus({preventScroll:true})}
 host.addEventListener('change',e=>{if(e.target.id==='chapter-picker')go(Number(e.target.value))});
 host.addEventListener('input',e=>{if(e.target.dataset.field==='note')note=e.target.value;if(e.target.dataset.field==='transfer')state().text=e.target.value;if(e.target.dataset.token!==undefined){const i=Number(e.target.dataset.token);state().tokenValues[i]=e.target.value;const output=host.querySelector(`#count-${i}`);if(counter)output.textContent=counter(e.target.value)}});
 host.addEventListener('click',e=>{
  const control=e.target.closest('[data-course]');if(!control||control.disabled)return;
  const [act,value]=control.dataset.course.split(':'),b=chapters[chapter].beats[step],s=state();
  if(act==='chapter'){go(Number(value));return}
  if(act==='pick'){
   const i=Number(value);if(b.kind==='multi'){s.selected=s.selected.includes(i)?s.selected.filter(x=>x!==i):[...s.selected,i];s.done=false;s.feedback=false;completed.delete(key())}
   else{s.choice=i;s.done=false;if(b.correct===null||i===b.correct)done();else{s.feedback=true;completed.delete(key());onReaction('mistake')}}
  }
  if(act==='check'){if(sameSelection(s.selected,b.correct))done();else{s.feedback=true;onReaction('mistake')}}
  if(act==='save'){if(note.trim()){savedNote=note;noteSaved=true;done()}else s.feedback=true}
  if(act==='lookup'){s.phase++;if(s.phase===2)done()}
  if(act==='recipe')done();
  if(act==='transfer'){if(s.text.trim())done();else s.feedback=true}
  if(act==='next'&&s.done){if(step<chapters[chapter].beats.length-1)go(chapter,step+1);else go((chapter+1)%chapters.length);return}
  if(act==='back'){if(step>0)go(chapter,step-1);else if(chapter>0)go(chapter-1,chapters[chapter-1].beats.length-1);return}
  render();[...host.querySelectorAll('[data-course]')].find(el=>el.dataset.course===control.dataset.course)?.focus({preventScroll:true});
 });
 return {render,reset(){if(chapter===1)mission.reset();else{states.delete(key());completed.delete(key());if(chapter===2&&step===0){note='';noteSaved=false}render()}},getState(){return {chapter,step,completed:[...completed]}}};
}
