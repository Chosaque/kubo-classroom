export const ITEMS=[
 {id:'request',title:'Reminder task',text:'Write an appointment reminder for fictional Sunny Clinic.',cost:2},
 {id:'long',title:'Long appointment notes',text:'The visitor called on Friday. Reception checked the calendar, discussed available times and confirmed Tuesday at 10:00, reception B. The reminder should use that confirmed appointment.',cost:4},
 {id:'style',title:'Writing preference',text:'Use one friendly sentence.',cost:1},
 {id:'old',title:'Replaced draft',text:'Old appointment: Monday, 09:00, reception A. Replaced by the confirmed Tuesday appointment.',cost:2},
 {id:'lunch',title:'Café menu',text:'Tuesday lunch: noodles and fruit.',cost:2},
 {id:'party',title:'A separate task',text:'Plan a team party for Friday at 16:00 in meeting room C.',cost:2},
 {id:'summary',title:'Appointment summary',text:'Confirmed appointment: Tuesday, 10:00, reception B.',cost:2},
];
export const item=id=>ITEMS.find(c=>c.id===id);
export const spaces=ids=>ids.reduce((n,id)=>n+item(id).cost,0);
export const initialContext=()=>({desk:['request','long','style','old','lunch','party'],saved:[],shelf:[],separate:[],tried:[],message:'My desk mixes a reminder, background notes and a different task. Help me organize it.'});
export function organize(state,action){
 const next={...state,desk:[...state.desk],saved:[...state.saved],shelf:[...state.shelf],separate:[...state.separate],tried:[...state.tried]};
 const move=(ids,to)=>{const found=next.desk.filter(id=>ids.includes(id));next.desk=next.desk.filter(id=>!ids.includes(id));next[to].push(...found);return found.length;};
 let changed=false;
 if(action==='write'){changed=!!move(['style'],'saved');next.message=changed?'I wrote the preference in a saved note and cleared it from my desk. It is available to bring back, but it is not in my current context.':'The preference is already saved. Bring it back from Saved notes if you want to use it.';}
 if(action==='compress'){const i=next.desk.indexOf('long');changed=i>=0;if(changed){next.desk[i]='summary';next.shelf.push('long');}next.message=changed?'I kept the confirmed day, time and place in a shorter summary. The call history is left out; the original is kept below.':'The appointment is already summarized. The original notes are still available below.';}
 if(action==='select'){changed=!!move(['old','lunch'],'shelf');next.message=changed?'I kept the reminder information and put the old draft and café menu aside. Choosing relevant information creates more working space.':'The outdated draft and café menu are already off the desk.';}
 if(action==='isolate'){changed=!!move(['party'],'separate');next.message=changed?'I moved party planning into its own task space. Its Friday time will not share the reminder’s context.':'Party planning already has a separate task space.';}
 if(action==='retrieve'){const i=next.saved.indexOf('style');if(i>=0){next.saved.splice(i,1);next.desk.push('style');}next.message='I brought the preference back onto the desk. I can use it in this response now.';}
 if(changed&&!next.tried.includes(action))next.tried.push(action);
 return next;
}
export function tryReminder(state){
 if(state.desk.includes('old'))return 'There are two appointment times on my desk. This scripted example asks for clarification; selecting the current facts will help.';
 const reminder=state.desk.includes('style')?'A friendly reminder: your appointment is on Tuesday at 10:00 at reception B.':'Appointment: Tuesday, 10:00, reception B.';
 return reminder+(state.desk.includes('party')?' Party details still share this context. Separate them to keep the two tasks focused.':'')+(state.saved.includes('style')?' The saved writing preference is outside my current context. Bring it back to use it.':'');
}
