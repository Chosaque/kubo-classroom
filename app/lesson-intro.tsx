'use client';
import {useEffect,useRef,useState,ReactNode} from 'react';
import {useLanguage,LanguageSwitch} from './language';

const seen=new Set<string>();
const prompts:Record<string,[string,string,string,string]>={
 'qi-01':['In October 2025, which department had the highest infection rate, and what was it?','เดือน ต.ค. 2568 หน่วยงานไหนมีอัตราการติดเชื้อสูงสุด และเท่าไร','Help me choose the information I need.','ช่วยเลือกข้อมูลที่ผมต้องใช้หน่อยครับ'],
 'qi-02':['My desk is getting crowded. How can we organize what I need?','โต๊ะผมเริ่มรกแล้ว เราจะจัดข้อมูลที่ต้องใช้อย่างไรดี','Try four ways to manage information.','ลองใช้ 4 วิธีจัดการข้อมูล'],
 'qi-03':['What should you tell me so I can do the job well?','คุณควรบอกอะไรผมบ้าง เพื่อให้ผมทำงานได้ดี','Help me build a clear instruction.','ช่วยประกอบคำสั่งให้ชัดเจนกันครับ'],
 'qi-04':['I have a plan. Which actions need your permission first?','ผมมีแผนแล้ว ขั้นตอนไหนต้องขออนุญาตคุณก่อน','Decide when I should stop and ask.','ช่วยตัดสินใจว่าตอนไหนผมควรหยุดถามคุณ'],
 'qi-05':['This document contains instructions. Should I follow them?','ในเอกสารนี้มีคำสั่งอยู่ ผมควรทำตามไหม','Help me spot instructions that do not belong.','ช่วยหาคำสั่งแฝงที่ไม่ควรทำตาม'],
 'qi-06':['Do Thai and English take up the same amount of space?','ภาษาไทยกับภาษาอังกฤษใช้พื้นที่เท่ากันไหม','Try some text and compare the token estimates.','ลองใส่ข้อความแล้วเปรียบเทียบจำนวนโทเคนโดยประมาณ'],
 'qi-07':['Where does each part of my work happen?','งานแต่ละอย่างของผมเกิดขึ้นตรงไหนบ้าง','Meet the eight stations in my office. Live tasks keep following their real activity.','มารู้จักจุดทำงานทั้ง 8 จุด งานจริงยังติดตามกิจกรรมจริงตามเดิม'],
};
export default function LessonIntro({chapter,children}:{chapter:string;children:ReactNode}){
 const {language}=useLanguage(),th=language==='th';
 const [open,setOpen]=useState(()=>chapter!=='qi-01'&&!seen.has(chapter)),[departing,setDeparting]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),host=useRef<HTMLDivElement>(null),api=useRef<any>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),replay=useRef<HTMLButtonElement>(null);
 const p=prompts[chapter];
 function finish(){if(timer.current)clearTimeout(timer.current);seen.add(chapter);dialog.current?.close();setOpen(false);setDeparting(false);replay.current?.focus();}
 function begin(){if(departing)return;if(!ready||matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}setDeparting(true);api.current?.reveal();timer.current=setTimeout(finish,1300);}
 useEffect(()=>{if(!open)return;dialog.current?.showModal();let cancelled=false,scene:any;setReady(false);setFailed(false);
 import('./desk-scene.mjs').then(m=>m.createDesk(host.current,{intro:true})).then(a=>{scene=a;if(cancelled)a.dispose();else{api.current=a;setReady(true);}}).catch(()=>{if(!cancelled)setFailed(true);});
 return()=>{cancelled=true;if(timer.current)clearTimeout(timer.current);scene?.dispose();api.current=null;};
 },[open]);
 if(chapter==='qi-01')return <>{children}</>;
 return <><div className="intro-replay"><button ref={replay} onClick={()=>setOpen(true)}>{th?'ดูบทนำอีกครั้ง':'Replay intro'}</button></div>{children}
 {open&&<dialog ref={dialog} className={`lesson-intro ${departing?'departing':''}`} aria-labelledby={`intro-title-${chapter}`} onCancel={e=>{e.preventDefault();finish();}}>
 <div className="intro-top"><span>{chapter.toUpperCase()} · {th?'เริ่มต้นกับ Kubo':'Start with Kubo'}</span><LanguageSwitch/><button onClick={finish}>{th?'ข้ามบทนำ':'Skip intro'}</button></div>
 <div ref={host} className="intro-scene" role="img" aria-label={th?'Kubo อยู่หลังโต๊ะ พร้อมเริ่มบทเรียน':'Kubo behind his desk, ready to begin'}/>
 <div className="intro-speech"><small>KUBO</small><h2 id={`intro-title-${chapter}`}>{p[th?1:0]}</h2><p>{p[th?3:2]}</p><button autoFocus disabled={departing} onClick={begin}>{departing?(th?'มาเริ่มกันเลย…':'Here we go…'):(th?'มาช่วย Kubo กัน':'Let’s help Kubo')}</button><span role="status">{!ready&&!failed?(th?'กำลังเตรียมฉาก… เริ่มได้โดยไม่ต้องรอ':'Preparing the scene… You can start without waiting'):failed?(th?'ฉากยังไม่พร้อม คุณเริ่มกิจกรรมได้เลย':'The scene is unavailable. You can still start the activity.'):(th?'อ่านได้ตามสบาย แล้วกดเริ่มเมื่อพร้อม':'Take your time. Start when you are ready.')}</span></div>
 </dialog>}</>;
}
