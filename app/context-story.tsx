'use client';
import {useEffect,useRef,useState} from 'react';
import {useLanguage} from './language';
import './context-story.css';
const lines=[
 ['Let’s learn about Context Rot.','มาเรียนรู้เรื่อง Context Rot กันครับ'],
 ['I answer well when I have the information I need.','Kubo ตอบคำถามได้ดี เมื่อมีข้อมูลที่ต้องใช้ครบถ้วนครับ'],
 ['Too much old or unrelated information can make me less sure of my answer.','เมื่อมีข้อมูลเก่าหรือข้อมูลที่ไม่เกี่ยวข้องมากเกินไป Kubo เริ่มไม่มั่นใจในคำตอบเลย'],
 ['The latest appointment says 10:00 at reception B. But the old notes say 09:00 at reception A… Which one was it?','นัดล่าสุดบอก 10.00 น. ห้องต้อนรับ B แต่บันทึกเก่าบอก 09.00 น. ห้องต้อนรับ A… เอ๊ะ อันไหนนะ?'],
 ['Time to clear my context! Let’s keep what this task needs.','Kubo ต้องเคลียร์ข้อมูลแล้ว! เก็บไว้เฉพาะข้อมูลที่งานนี้ต้องใช้กันครับ'],
 ['Help me remove the old and unrelated information.','ช่วย Kubo นำข้อมูลเก่าและข้อมูลที่ไม่เกี่ยวข้องออกหน่อยครับ'],
 ['Aha! Now I’ve got it!','อ๋อ! Kubo นึกออกแล้ว!'],
 ['Your appointment is tomorrow at 10:00 at reception B.','พรุ่งนี้มีนัดเวลา 10.00 น. ที่ห้องต้อนรับ B ครับ'],
];
const records=[
 {id:'correct',text:['Latest confirmation: tomorrow, 10:00, reception B.','ยืนยันล่าสุด: พรุ่งนี้ 10.00 น. ห้องต้อนรับ B']},
 {id:'old-time',text:['Old appointment: 09:00. Replaced by the latest confirmation.','นัดหมายเก่า: 09.00 น. ถูกแทนที่ด้วยข้อมูลยืนยันล่าสุดแล้ว']},
 {id:'old-place',text:['Old location: reception A. The appointment has moved.','สถานที่เก่า: ห้องต้อนรับ A นัดหมายถูกย้ายแล้ว']},
 {id:'menu',text:['Lunch menu: noodles and fried rice.','เมนูอาหารกลางวัน: ก๋วยเตี๋ยวและข้าวผัด']},
];
const distractions=records.slice(1).map(r=>r.id);
export default function ContextStory(){
 const {language}=useLanguage(),i=language==='th'?1:0,t=(en:string,th:string)=>i?th:en;
 const [step,setStep]=useState(0),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[pile,setPile]=useState<string[]>([]),[remaining,setRemaining]=useState(distractions),[hint,setHint]=useState(false),[barHeight,setBarHeight]=useState(65);
 const host=useRef<HTMLDivElement>(null),api=useRef<any>(null);
 useEffect(()=>{const bar=document.querySelector('.presentation-toolbar');if(!bar)return;const observer=new ResizeObserver(()=>setBarHeight(bar.getBoundingClientRect().height));observer.observe(bar);return()=>observer.disconnect();},[]);
 useEffect(()=>{let stopped=false,local:any;import('./desk-scene.mjs').then(m=>m.createDesk(host.current,{intro:true,demonstration:true})).then(a=>{local=a;if(stopped)a.dispose();else{api.current=a;setReady(true);}}).catch(()=>{if(!stopped)setFailed(true);});return()=>{stopped=true;local?.dispose();api.current=null;};},[]);
 useEffect(()=>{setHint(false);if(step<2||step>5){setPile([]);return;}if(step!==2){setPile(distractions);return;}if(matchMedia('(prefers-reduced-motion: reduce)').matches){setPile(distractions);return;}setPile([]);let count=0;const timer=setInterval(()=>{if(document.hidden)return;setPile(distractions.slice(0,++count));if(count===3)clearInterval(timer);},800);return()=>clearInterval(timer);},[step]);
 useEffect(()=>{if(!ready)return;const clutter=step===5?remaining:pile;api.current.setCards(step===0?[]:[{id:'correct',cost:1},...clutter.map(id=>({id,cost:2}))]);api.current.setMood(step===2||step===3?'confused':step===4||step===5?'motivated':'happy');if(step<2||step>5)api.current.closeUp();else api.current.reveal();},[step,pile,remaining,ready]);
 useEffect(()=>{if(step!==5||remaining.length)return;const timer=setTimeout(()=>setStep(6),850);return()=>clearTimeout(timer);},[step,remaining]);
 useEffect(()=>{if(step!==7)return;let elapsed=0,last=performance.now();const timer=setInterval(()=>{const now=performance.now();if(!document.hidden)elapsed+=Math.min(now-last,300);last=now;if(elapsed>=7000)window.location.hash='qi-02';},250);return()=>clearInterval(timer);},[step]);
 function go(next:number){if(next===5)setRemaining(distractions);setHint(false);setStep(next);}
 function remove(id:string){if(id==='correct'){setHint(true);return;}setHint(false);setRemaining(r=>r.filter(x=>x!==id));}
 const speech=failed?t('The 3D scene could not load. Refresh to try again.','ฉาก 3 มิติโหลดไม่ได้ ลองรีเฟรชอีกครั้งนะครับ'):hint?t('That is the latest confirmation—I still need it!','อันนี้คือข้อมูลยืนยันล่าสุด Kubo ยังต้องใช้ครับ!'):step===5&&!remaining.length?t('All clear…','ข้อมูลพร้อมแล้ว…'):lines[step][i];
 return <main className="context-story" data-step={step} style={{height:`calc(100dvh - ${barHeight}px)`}} aria-label={t('QI-01: Context Rot','QI-01: Context Rot')}>
 <div ref={host} className="story-canvas" role="img" aria-label={t('Kubo and his desk','Kubo และโต๊ะทำงาน')}/>
 <div className={`story-bubble mood-${step===2||step===3?'confused':'happy'}`} aria-live="polite" key={step}><p>{speech}</p></div>
 {step===5&&<section className="story-cleanup" aria-label={t('Information on Kubo’s desk','ข้อมูลบนโต๊ะของ Kubo')}>
 <header className="story-question"><span>{t('Our question for Kubo','คำถามที่เราถาม Kubo')}</span><h2>{t('What time is my appointment tomorrow, and where?','พรุ่งนี้ฉันมีนัดกี่โมง และที่ไหน?')}</h2></header>
 {records.filter(r=>r.id==='correct'||remaining.includes(r.id)).map(r=><div className="story-record" key={r.id}><p>{r.text[i]}</p><button onClick={()=>remove(r.id)} aria-label={`${t('Remove','นำออก')}: ${r.text[i]}`}>{t('Remove','นำออก')}</button></div>)}
 </section>}
 <button className="story-previous" disabled={step===0} onClick={()=>go(step-1)}>{t('← Previous','← ก่อนหน้า')}</button>
 <button className="story-next" disabled={step===5} onClick={()=>{if(step===7)window.location.hash='qi-02';else go(step+1);}}>{step===7?t('Next lesson →','บทถัดไป →'):t('Next →','ถัดไป →')}</button>
 </main>;
}
