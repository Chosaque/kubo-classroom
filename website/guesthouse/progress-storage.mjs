import {chapters} from './course-data.mjs';
import {records,assessCards,createState} from './mission-state.mjs';

export const PROGRESS_KEY='kubo-classroom.course-progress';
export const PROGRESS_VERSION=1;
const MAX_BYTES=48000;
const MAX_STATES=chapters.reduce((count,chapter)=>count+chapter.beats.filter(Boolean).length,0);
// Include scenario wording as well as answer keys. Edited lessons invalidate old passes.
const content=JSON.stringify({chapters,records,missionRevision:1});
let hash=2166136261;
for(let i=0;i<content.length;i++)hash=Math.imul(hash^content.charCodeAt(i),16777619)>>>0;
export const CURRICULUM_VERSION=`guesthouse-${hash.toString(16)}`;
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const integer=(value,min,max)=>Number.isInteger(value)&&value>=min&&value<=max;
const requireValue=(condition)=>{if(!condition)throw new Error('Invalid saved course progress');};
const boundedText=(value,max)=>{requireValue(typeof value==='string'&&value.length<=max);return value;};
const bool=value=>{requireValue(typeof value==='boolean');return value;};

function normalizeMission(value){
 requireValue(object(value)&&integer(value.step,0,2));
 requireValue(Array.isArray(value.answers)&&value.answers.length===2);
 requireValue([null,'desk','archive'].includes(value.answers[0])&&[null,'current','old','all'].includes(value.answers[1]));
 requireValue(Array.isArray(value.cards)&&value.cards.length<=records.length&&new Set(value.cards).size===value.cards.length);
 requireValue(value.cards.every(id=>records.some(record=>record.id===id)));
 requireValue([null,'both','number'].includes(value.check));
 const drafted=bool(value.drafted);
 const result=drafted?assessCards(new Set(value.cards)):null;
 const verified=value.step===2&&value.answers[0]==='desk'&&value.answers[1]==='current'&&result?.ok===true&&value.check==='both';
 requireValue(value.step===0||value.answers[0]==='desk');
 requireValue(value.step<2||value.answers[1]==='current');
 return {step:value.step,answers:[...value.answers],cards:[...value.cards],drafted,check:result?.ok?value.check:null,verified};
}

function normalizeProgress(value){
 requireValue(object(value)&&integer(value.chapter,0,chapters.length-1));
 requireValue(integer(value.step,0,chapters[value.chapter].beats.length-1));
 const note=boundedText(value.note,1200),savedNote=boundedText(value.savedNote,1200),noteSaved=bool(value.noteSaved);
 requireValue(!noteSaved||savedNote.trim().length>0);
 requireValue(Array.isArray(value.states)&&value.states.length<=MAX_STATES);
 const seen=new Set();
 const states=value.states.map(entry=>{
  requireValue(Array.isArray(entry)&&entry.length===2&&typeof entry[0]==='string'&&/^\d+:\d+$/.test(entry[0])&&!seen.has(entry[0]));
  const [key,s]=entry,[chapter,step]=key.split(':').map(Number),beat=chapters[chapter]?.beats[step];
  requireValue(key===`${chapter}:${step}`&&Boolean(beat)&&object(s));seen.add(key);
  requireValue(Array.isArray(s.selected)&&s.selected.length<=beat.options.length&&new Set(s.selected).size===s.selected.length);
  requireValue(s.selected.every(index=>integer(index,0,beat.options.length-1)));
  requireValue(s.choice===null||integer(s.choice,0,beat.options.length-1));
  requireValue(integer(s.phase,0,2));
  const text=boundedText(s.text,beat.kind==='transfer'?1800:0),feedback=bool(s.feedback);
  let satisfied=false;
  if(beat.kind==='multi')satisfied=s.selected.length===beat.correct.length&&beat.correct.every(index=>s.selected.includes(index));
  else if(beat.kind==='note')satisfied=noteSaved&&savedNote.trim().length>0;
  else if(beat.kind==='transfer')satisfied=text.trim().length>0;
  else if(beat.kind==='lookup')satisfied=s.phase===2;
  else if(beat.kind==='recipe')satisfied=true;
  else satisfied=s.choice!==null&&(beat.correct===null||s.choice===beat.correct);
  return [key,{selected:[...s.selected],choice:s.choice,done:bool(s.done)&&satisfied,phase:s.phase,text,feedback}];
 });
 const mission=normalizeMission(value.mission);
 return {chapter:value.chapter,step:value.chapter===1?mission.step:value.step,states,note,savedNote,noteSaved,mission};
}

// Explicit projection: token playground text and arbitrary UI fields never enter storage.
export function encodeProgress(snapshot){
 const mission=snapshot.mission;
 const projected={
  chapter:snapshot.chapter,step:snapshot.step,note:snapshot.note,savedNote:snapshot.savedNote,noteSaved:snapshot.noteSaved,
  states:[...snapshot.states].filter(([key])=>key.split(':')[0]!=='1').map(([key,state])=>[key,{
   selected:state.selected,choice:state.choice,done:state.done,phase:state.phase,
   text:chapters[Number(key.split(':')[0])]?.beats[Number(key.split(':')[1])]?.kind==='transfer'?state.text:'',feedback:state.feedback
  }]),
  mission:{step:mission.step,answers:mission.answers,cards:[...mission.cards],drafted:Boolean(mission.draft),check:mission.check}
 };
 return JSON.stringify({version:PROGRESS_VERSION,curriculum:CURRICULUM_VERSION,...normalizeProgress(projected)});
}

export function decodeProgress(raw){
 if(raw===null)return {status:'empty',progress:null};
 try{
  requireValue(typeof raw==='string'&&raw.length<=MAX_BYTES);
  const parsed=JSON.parse(raw);requireValue(object(parsed));
  if(parsed.version!==PROGRESS_VERSION||parsed.curriculum!==CURRICULUM_VERSION)return {status:'outdated',progress:null};
  return {status:'saved',progress:normalizeProgress(parsed)};
 }catch{return {status:'invalid',progress:null};}
}

export function restoreMissionProgress(progress){
 if(!progress)return createState();
 const value=normalizeMission(progress),cards=new Set(value.cards);
 return {...createState(),step:value.step,answers:value.answers,cards,draft:value.drafted?assessCards(cards):null,check:value.check,verified:value.verified};
}

export function createProgressStorage({getStorage=()=>globalThis.localStorage}={}){
 let status='empty',hasSaved=false;
 return {
  read(){try{const storage=getStorage();if(!storage)throw new Error('Storage unavailable');const result=decodeProgress(storage.getItem(PROGRESS_KEY));status=result.status;hasSaved=Boolean(result.progress);return result.progress;}catch{status='unavailable';hasSaved=false;return null;}},
  save(snapshot){try{const storage=getStorage();if(!storage)throw new Error('Storage unavailable');storage.setItem(PROGRESS_KEY,encodeProgress(snapshot));status='saved';hasSaved=true;return true;}catch{status='unavailable';return false;}},
  clear(){hasSaved=false;try{const storage=getStorage();if(!storage)throw new Error('Storage unavailable');storage.removeItem(PROGRESS_KEY);status='empty';return true;}catch{status='unavailable';return false;}},
  status:()=>status,
  hasSavedProgress:()=>hasSaved
 };
}
