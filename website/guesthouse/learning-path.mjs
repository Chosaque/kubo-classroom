
export function createLearningPath({host,getLanguage,course,hasStorageError=()=>false,openChallenge,clearAll}) {
 const t=(th,en)=>getLanguage()==='th'?th:en;
 const button=(label,id,cls='')=>'<button type="button" data-path="'+id+'" class="'+cls+'">'+label+'</button>';
 function storageMessage(){const status=course.storageStatus();return (status==='unavailable'||hasStorageError()?t('บันทึกในเบราว์เซอร์ไม่ได้ แต่ยังทำกิจกรรมต่อได้ เก็บข้อความของคุณไว้ก่อนปิดหน้านี้','Browser saving is unavailable. You can continue; copy your writing before closing this page.'):status==='invalid'||status==='outdated'?t('เริ่มความคืบหน้าใหม่ เพราะข้อมูลที่บันทึกไม่ตรงกับบทเรียนนี้','A fresh start: saved progress could not be used with this lesson.'):t('บันทึกอัตโนมัติในเบราว์เซอร์นี้เท่านั้น ไม่ซิงก์ข้ามอุปกรณ์ ข้อความในช่องนับ token จะไม่ถูกบันทึก','Saved automatically in this browser only. No cross-device sync. Token-counter text is never saved.'));}
 function refreshStorage(){const status=host.querySelector('[role="status"]');if(status)status.textContent=storageMessage();if(course.storageStatus()==='unavailable'||hasStorageError()){const details=host.querySelector('.path-storage');if(details)details.open=true;}}
 function render(){
  const current=course.getState(), started=current.chapter>0||current.completed.length>0;
  host.innerHTML='<p class="path-kicker">'+t('กะแรกกับ Kubo','Your first shift with Kubo')+'</p><h2>'+t('ช่วยให้ถูก ตรวจให้เป็น','Guide the work. Check the result.')+'</h2><p>'+t('เลือกข้อมูลให้ตรงงาน ช่วย Kubo ร่างคำตอบ แล้วตัดสินใจว่าทำอะไรต่อได้','Choose the right information, help Kubo draft a response, and decide what may happen next.')+'</p><ol class="path-steps"><li>'+t('เลือกหลักฐาน','Choose evidence')+'</li><li>'+t('ฝึกกับ Kubo','Practice with Kubo')+'</li><li>'+t('ลองโจทย์ใหม่','Try a new task')+'</li></ol><div class="path-actions">'+button(started?t('เรียนต่อ','Continue learning'):t('เริ่มกะแรก','Start your first shift'),'learn','primary-action')+button(t('ลองกะถัดไป','Try the next shift'),'challenge','secondary-action')+'</div><details class="path-storage"><summary>'+t('ความคืบหน้าและงานที่บันทึก','Progress and saved work')+'</summary><p role="status">'+storageMessage()+'</p><p>'+t('ใช้เฉพาะข้อมูลสมมติ หากใช้เครื่องร่วมกับคนอื่น ให้ล้างงานเมื่อเสร็จ','Use fictional information only. On a shared device, clear your work when finished.')+'</p>'+button(t('ล้างงานที่บันทึก','Clear saved work'),'clear','path-clear')+'</details>';
 }
 host.addEventListener('click',e=>{
  const action=e.target.closest('[data-path]')?.dataset.path;
  if(action==='learn'){const state=course.getState();if(state.chapter===0)course.goTo(1);host.dispatchEvent(new CustomEvent('resume-course',{bubbles:true}));}
  if(action==='challenge')openChallenge();
  if(action==='clear'&&confirm(t('ล้างความคืบหน้าและข้อความที่บันทึกในเบราว์เซอร์นี้ทั้งหมดหรือไม่?','Clear all course progress and saved writing in this browser?')))clearAll();
 });
 return {render:()=>{render();refreshStorage()},refreshStorage};
}
