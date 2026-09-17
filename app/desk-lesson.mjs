export const CAPACITY=8;
export const CARDS=[
 {id:'request',title:'The request',text:'Write a short reminder for a visitor’s appointment at the fictional Sunny Clinic.',cost:2,kind:'useful'},
 {id:'current',title:'Latest appointment',text:'Confirmed today: Tuesday at 10:00, reception B.',cost:2,kind:'useful'},
 {id:'tone',title:'Writing preference',text:'Use friendly language and keep the reminder to one sentence.',cost:1,kind:'useful'},
 {id:'old',title:'An earlier appointment',text:'An old draft says Monday at 09:00, reception A. It was replaced today.',cost:2,kind:'outdated'},
 {id:'menu',title:'Lunch menu',text:'The staff café serves noodles on Tuesday.',cost:2,kind:'irrelevant'},
 {id:'decor',title:'Office decorations',text:'The reception team likes green curtains and wooden picture frames.',cost:2,kind:'irrelevant'},
 {id:'private',title:'Private visitor record',text:'A fictional home address and ID number. Neither is needed for this reminder.',cost:2,kind:'private'},
 {id:'boundary',title:'A useful boundary',text:'Include only appointment details. Leave out personal records.',cost:1,kind:'useful'},
];
export function evaluateDesk(ids){
 const selected=CARDS.filter(c=>ids.includes(c.id)),has=id=>ids.includes(id),notes=[];
 if(!selected.length)return {answer:'My desk is empty. Give me the request and the appointment details so I know what to write.',notes:['The AI needs relevant context to answer a task.'],mood:'empty'};
 let answer='';
 if(!has('request'))answer='I have some information, but I don’t know what you want me to do with it.';
 else if(!has('current')&&!has('old'))answer='I can write a reminder, but the appointment time and location are missing.';
 else if(has('current')&&has('old'))answer='I see two different appointments: Monday at 09:00 and Tuesday at 10:00. Which should I use?';
 else if(has('old'))answer='Your appointment is on Monday at 09:00 at reception A.';
 else answer=has('tone')?'A friendly reminder: your appointment is on Tuesday at 10:00 at reception B.':'Appointment reminder: Tuesday, 10:00, reception B.';
 if(!has('request'))notes.push('The request tells Kubo what to do. Facts alone do not define the task.');
 if(has('current'))notes.push('The latest appointment supplies the correct time and place.');
 if(has('old'))notes.push('The earlier draft is outdated. This simulation makes Kubo stumble on it; a real AI may correctly notice that it was replaced.');
 if(selected.some(c=>c.kind==='irrelevant'))notes.push('Unrelated cards take up space without helping the reminder. A fuller context is not automatically a better context.');
 if(has('private'))notes.push('The private record is unnecessary. Remove it before sharing context with an AI; this demo never includes it in the reminder.');
 if(has('tone'))notes.push('The writing preference guides the style without changing the facts.');
 if(has('boundary'))notes.push('The boundary makes it clear which details belong in the answer.');
 if(has('request')&&!has('current')&&!has('old'))notes.push('Add the latest appointment to supply the missing facts.');
 if(!notes.length)notes.push('Try adding the latest appointment and comparing the answer.');
 return {answer,notes,mood:has('old')||!has('request')||!has('current')?'confused':'ready'};
}
