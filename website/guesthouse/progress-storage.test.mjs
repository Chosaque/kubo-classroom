import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,answer,next,toggleCard,draft,verify} from './mission-state.mjs';
import {createCourse} from './course.mjs';
import {PROGRESS_KEY,PROGRESS_VERSION,CURRICULUM_VERSION,encodeProgress,decodeProgress,restoreMissionProgress,createProgressStorage} from './progress-storage.mjs';

function lesson(overrides={}){return {selected:[],choice:null,done:false,phase:0,text:'',feedback:false,tokenValues:['private Thai text','private English text'],...overrides};}
function snapshot(overrides={}){return {chapter:0,step:0,states:new Map(),note:'',savedNote:'',noteSaved:false,mission:createState(),...overrides};}
function validJSON(){return JSON.parse(encodeProgress(snapshot()));}
function memoryStorage(){const items=new Map();return {items,getItem:key=>items.get(key)??null,setItem:(key,value)=>items.set(key,value),removeItem:key=>items.delete(key)};}
function completeMission(){const state=createState();answer(state,'desk');next(state);answer(state,'current');next(state);toggleCard(state,'old');toggleCard(state,'menu');draft(state);verify(state,'both');return state;}

test('round trip preserves course position, authored work, and explicitly completed activities',()=>{
 const saved=decodeProgress(encodeProgress(snapshot({chapter:7,step:9,note:'Draft edits',savedNote:'Nova wants cool + stars; availability unchecked.',noteSaved:true,states:new Map([
  ['2:0',lesson({done:true})],['3:0',lesson({choice:1,done:true})],['7:9',lesson({text:'Read supplied minutes, draft, check, return for review.',done:true})]
 ])})));
 assert.equal(saved.status,'saved');assert.equal(saved.progress.chapter,7);assert.equal(saved.progress.step,9);
 assert.equal(saved.progress.note,'Draft edits');assert.equal(saved.progress.savedNote,'Nova wants cool + stars; availability unchecked.');
 assert.equal(saved.progress.states.length,3);assert.ok(saved.progress.states.every(([,state])=>state.done));
});

test('the token playground, credentials, and unrelated state are excluded from persistence',()=>{
 const value=snapshot({chapter:6,states:new Map([['6:0',lesson({choice:0,done:true,text:'do not save this',connectionToken:'secret connection value'})]]),connectionToken:'another secret'});
 const encoded=encodeProgress(value);
 for(const privateText of ['private Thai text','private English text','do not save this','secret connection value','another secret','tokenValues','connectionToken'])assert.equal(encoded.includes(privateText),false,privateText);
 assert.equal(decodeProgress(encoded).status,'saved');
});

test('QI-01 restores card selection, draft evidence, and verification by replaying current rules',()=>{
 const restored=decodeProgress(encodeProgress(snapshot({chapter:1,step:0,mission:completeMission()})));
 assert.equal(restored.progress.step,2);
 const mission=restoreMissionProgress(restored.progress.mission);
 assert.equal(mission.step,2);assert.deepEqual([...mission.cards],['request','rooms']);assert.equal(mission.draft.room,101);assert.equal(mission.verified,true);
});

test('QI-01 wrong attempts and unfinished card work resume without a false pass',()=>{
 const state=createState();answer(state,'desk');next(state);answer(state,'current');next(state);toggleCard(state,'request');draft(state);
 const restored=restoreMissionProgress(decodeProgress(encodeProgress(snapshot({chapter:1,step:2,mission:state}))).progress.mission);
 assert.equal(restored.draft.kind,'missing-request');assert.equal(restored.verified,false);assert.equal(restored.cards.has('request'),false);
 const forged=validJSON();forged.mission={step:2,answers:['desk','current'],cards:['old','menu'],drafted:true,check:'both',verified:true};
 assert.equal(decodeProgress(JSON.stringify(forged)).progress.mission.verified,false);
});

test('schema or curriculum changes never restore stale successes',()=>{
 const value=validJSON();value.states=[['3:0',lesson({choice:1,done:true})]];
 for(const field of ['version','curriculum']){
  const result=decodeProgress(JSON.stringify({...value,[field]:field==='version'?PROGRESS_VERSION+1:CURRICULUM_VERSION+'-changed'}));
  assert.equal(result.status,'outdated');assert.equal(result.progress,null);
 }
});

test('malformed JSON and oversized or invalid structures are rejected without throwing',()=>{
 for(const raw of ['{','null','[]','x'.repeat(48001)])assert.equal(decodeProgress(raw).status,'invalid');
 const invalid=[
  {chapter:-1},{chapter:8},{step:999},{note:'n'.repeat(1201)},{savedNote:77},{noteSaved:true},
  {states:[['3:0',lesson({choice:88})]]},{states:[['3:0',lesson({selected:[0,0]})]]},
  {states:[['1:0',lesson()]]},{states:[['3:0',lesson({phase:3})]]},
  {states:[['3:0',lesson({done:'yes'})]]},{states:[['7:9',lesson({text:'x'.repeat(1801)})]]},
  {states:[['3:0',lesson()],['3:0',lesson()]]},{states:[['__proto__',lesson()]]},
  {mission:{...validJSON().mission,step:2}},{mission:{...validJSON().mission,cards:['request','request']}},
  {mission:{...validJSON().mission,cards:['external-record']}}
 ];
 for(const fields of invalid){const result=decodeProgress(JSON.stringify({...validJSON(),...fields}));assert.equal(result.status,'invalid',JSON.stringify(fields));assert.equal(result.progress,null);}
});

test('saved success flags cannot turn wrong, unchecked, or empty work into a pass',()=>{
 const value=validJSON();value.states=[
  ['3:0',lesson({choice:0,done:true})],['2:2',lesson({selected:[0],done:true})],
  ['2:0',lesson({done:true})],['7:9',lesson({done:true,text:'  '})],['4:2',lesson({phase:1,done:true})],
  ['7:0',lesson({selected:[0,1],done:false})]
 ];
 const result=decodeProgress(JSON.stringify(value));assert.equal(result.status,'saved');assert.ok(result.progress.states.every(([,state])=>!state.done));
});

test('selected correct options do not bypass an explicit multi-select check',()=>{
 const raw=encodeProgress(snapshot({states:new Map([['7:0',lesson({selected:[0,1]})]])}));
 assert.equal(decodeProgress(raw).progress.states[0][1].done,false);
});

test('storage supports save, reload, and scoped clearing without touching other app data',()=>{
 const storage=memoryStorage();storage.setItem('unrelated-app','keep me');
 const first=createProgressStorage({getStorage:()=>storage});assert.equal(first.read(),null);assert.equal(first.status(),'empty');
 assert.equal(first.save(snapshot({chapter:3,step:1})),true);assert.equal(first.hasSavedProgress(),true);assert.equal(first.status(),'saved');
 const second=createProgressStorage({getStorage:()=>storage});assert.equal(second.read().chapter,3);assert.equal(second.hasSavedProgress(),true);
 assert.equal(second.clear(),true);assert.equal(second.status(),'empty');assert.equal(second.hasSavedProgress(),false);assert.equal(storage.getItem(PROGRESS_KEY),null);assert.equal(storage.getItem('unrelated-app'),'keep me');
});

test('blocked storage access, quota errors, and deletion errors do not throw',()=>{
 for(const getStorage of [()=>undefined,()=>{throw new Error('SecurityError');},()=>({getItem(){throw new Error('Blocked');},setItem(){throw new Error('QuotaExceededError');},removeItem(){throw new Error('Blocked');}})]){
  const progress=createProgressStorage({getStorage});assert.equal(progress.read(),null);assert.equal(progress.status(),'unavailable');assert.equal(progress.save(snapshot()),false);assert.equal(progress.clear(),false);assert.equal(progress.status(),'unavailable');assert.equal(progress.hasSavedProgress(),false);
 }
});

test('a later quota failure preserves the last valid snapshot and reports unsaved work',()=>{
 const storage=memoryStorage(),progress=createProgressStorage({getStorage:()=>storage});progress.save(snapshot({chapter:2}));
 storage.setItem=()=>{throw new Error('QuotaExceededError');};assert.equal(progress.save(snapshot({chapter:3})),false);assert.equal(progress.status(),'unavailable');
 assert.equal(decodeProgress(storage.getItem(PROGRESS_KEY)).progress.chapter,2);
});

test('corrupt and obsolete saves stay recoverable by starting again',()=>{
 const storage=memoryStorage(),progress=createProgressStorage({getStorage:()=>storage});storage.setItem(PROGRESS_KEY,'{');
 assert.equal(progress.read(),null);assert.equal(progress.status(),'invalid');assert.equal(progress.hasSavedProgress(),false);
 assert.equal(progress.save(snapshot({chapter:1})),true);assert.equal(progress.status(),'saved');assert.equal(progress.read().chapter,1);
 storage.setItem(PROGRESS_KEY,JSON.stringify({...validJSON(),version:0}));assert.equal(progress.read(),null);assert.equal(progress.status(),'outdated');assert.equal(progress.clear(),true);
});

// Minimal event surface: these tests exercise the real course/mission handlers,
// while browser QA covers rendering, keyboard focus, and responsive layout.
function eventHost(){
 const children=new Map(),listeners=new Map();
 return {innerHTML:'',firstChild:{textContent:''},focus(){},remove(){},
  querySelector(selector){if(!children.has(selector))children.set(selector,eventHost());return children.get(selector);},
  querySelectorAll(){return [];},addEventListener(type,handler){listeners.set(type,handler);},
  fire(type,target){listeners.get(type)?.({target});}
 };
}
function click(host,key,value){const control={disabled:false,dataset:{[key]:value}};host.fire('click',{closest:()=>control});}
function courseAt(options={}){
 const host=eventHost(),course=createCourse({host,getLanguage:()=> 'en',onChange(){},onReaction(){},onPractice(){},...options});
 course.render();return {host,course};
}
function withStorage(run){
 const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),storage=memoryStorage();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:storage});
 try{run(storage);}finally{if(original)Object.defineProperty(globalThis,'localStorage',original);else delete globalThis.localStorage;}
}

test('course events save writing, reload the saved note, and keep reset scoped to the activity',()=>withStorage(storage=>{
 let {host,course}=courseAt();
 assert.equal(course.storageStatus(),'empty');assert.equal(storage.getItem(PROGRESS_KEY),null);
 course.goTo(2);host.fire('input',{dataset:{field:'note'},value:'Nova: cool + stars; check tonight; not booked.'});
 assert.equal(course.getState().completed.includes('2:0'),false);
 click(host,'course','save');assert.equal(course.getState().completed.includes('2:0'),true);
 host.fire('input',{dataset:{field:'note'},value:'An unfinished revision'});
 ({host,course}=courseAt());assert.equal(course.getState().chapter,2);assert.equal(course.hasSavedProgress(),true);
 assert.match(host.querySelector('#course-body').innerHTML,/An unfinished revision/);
 course.goTo(2,4);click(host,'course','pick:0');assert.match(host.querySelector('#course-body').innerHTML,/Nova: cool \+ stars; check tonight; not booked/);
 course.reset();assert.equal(course.getState().completed.includes('2:0'),true);assert.equal(course.getState().completed.includes('2:4'),false);
 course.goTo(2);course.reset();const saved=decodeProgress(storage.getItem(PROGRESS_KEY)).progress;
 assert.equal(saved.note,'');assert.equal(saved.savedNote,'');assert.equal(saved.noteSaved,false);
 assert.equal(course.goTo(99),false);assert.equal(course.getState().chapter,2);
 assert.equal(course.clearSavedProgress(),true);assert.deepEqual(course.getState(),{chapter:0,step:0,completed:[]});assert.equal(course.hasSavedProgress(),false);assert.equal(storage.getItem(PROGRESS_KEY),null);
}));

test('QI-01 event lifecycle resumes verified work and replay removes its completion',()=>withStorage(storage=>{
 let {host,course}=courseAt();course.goTo(1);
 let missionHost=host.querySelector('#context-mission');
 for(const action of ['answer:desk','next','answer:current','next','card:old','card:menu','draft','verify:both'])click(missionHost,'action',action);
 assert.deepEqual(course.getState(),{chapter:1,step:2,completed:['1:2']});
 ({host,course}=courseAt());assert.equal(course.getState().step,2);assert.equal(course.getState().completed.includes('1:2'),true);
 missionHost=host.querySelector('#context-mission');assert.match(missionHost.innerHTML,/A room that fits Luma/);
 click(missionHost,'action','reset');assert.equal(course.getState().step,0);assert.equal(course.getState().completed.includes('1:2'),false);
 const saved=decodeProgress(storage.getItem(PROGRESS_KEY)).progress;assert.equal(saved.mission.verified,false);assert.equal(saved.mission.step,0);
}));

test('finishing QI-07 enters the next-shift challenge with a saved plan and supports the old fallback',()=>withStorage(storage=>{
 let challenges=0;
 const {host,course}=courseAt({onChallenge(){challenges++;}});course.goTo(7,9);
 assert.match(host.querySelector('#course-body').innerHTML,/Try the next shift/);
 host.fire('input',{dataset:{field:'transfer'},value:'Draft from the supplied meeting record, check, and return for approval.'});
 click(host,'course','transfer');click(host,'course','next');assert.equal(challenges,1);assert.equal(course.getState().chapter,7);
 assert.equal(decodeProgress(storage.getItem(PROGRESS_KEY)).progress.states.find(([key])=>key==='7:9')[1].done,true);
 const fallback=courseAt();click(fallback.host,'course','next');assert.equal(fallback.course.getState().chapter,0);
}));

test('storage-status notifications report input save failure and recovery without rerendering or refocusing',()=>withStorage(storage=>{
 const statuses=[];let rendered=0,focused=0;
 const {host,course}=courseAt({onStorageStatus:status=>statuses.push(status),onChange(){rendered++;}});
 assert.deepEqual(statuses,[]);course.goTo(2);assert.equal(statuses.at(-1),'saved');
 const body=host.querySelector('#course-body'),html=body.innerHTML,renderCount=rendered;
 body.querySelector('#course-title').focus=()=>{focused++;};
 const setItem=storage.setItem;storage.setItem=()=>{throw new Error('QuotaExceededError');};
 host.fire('input',{dataset:{field:'note'},value:'Unsaved but still editable work'});
 assert.equal(statuses.at(-1),'unavailable');assert.equal(course.storageStatus(),'unavailable');
 assert.equal(rendered,renderCount);assert.equal(body.innerHTML,html);assert.equal(focused,0);
 storage.setItem=setItem;host.fire('input',{dataset:{field:'note'},value:'Recovered local saving'});
 assert.equal(statuses.at(-1),'saved');assert.equal(rendered,renderCount);assert.equal(focused,0);
 assert.equal(decodeProgress(storage.getItem(PROGRESS_KEY)).progress.note,'Recovered local saving');
 course.clearSavedProgress();assert.equal(statuses.at(-1),'empty');
 storage.removeItem=()=>{throw new Error('Blocked');};assert.equal(course.clearSavedProgress(),false);assert.equal(statuses.at(-1),'unavailable');
}));
