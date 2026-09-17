export const BLOCKS=[
 {id:'role',title:'Role',question:'Who should the AI act as?',text:'You are a friendly clinic receptionist.',cost:1},
 {id:'task',title:'Task',question:'What should it do?',text:'Write an appointment reminder for a visitor.',cost:1},
 {id:'context',title:'Context',question:'What facts does it need?',text:'The appointment is on Tuesday at 10:00, reception B, at the fictional Sunny Clinic.',cost:1},
 {id:'output',title:'Output',question:'What should the answer look like?',text:'Use one short, friendly sentence.',cost:1},
];
export const VAGUE='Help me with this.';
export const VAGUE_REPLY='What would you like help with? Please tell me the task and any relevant details.';
export function buildPrompt(ids){return BLOCKS.filter(b=>ids.includes(b.id)).map(b=>b.text).join('\n\n')||VAGUE;}
export function evaluatePrompt(ids){
 const has=id=>ids.includes(id),notes=[];
 if(has('role'))notes.push('The role suggests a receptionist’s tone. It does not give the AI extra knowledge or professional qualifications.');
 if(has('task'))notes.push('The task makes the requested action clear: write a reminder.');else notes.push('The action is missing. Facts and a role alone do not say what to do.');
 if(has('context'))notes.push('The context supplies the day, time and place, so the response can use facts you provided.');else notes.push('The appointment facts are missing. A useful response should ask for them instead of inventing them.');
 if(has('output'))notes.push('The output instruction sets the length and tone of the finished reminder.');else notes.push('Without an output instruction, the AI has more freedom to choose the format.');
 let answer;
 if(!has('task'))answer='What would you like me to do'+(has('context')?' with these appointment details?':'?');
 else if(!has('context'))answer='What day, time and reception area should I include in the appointment reminder?';
 else if(has('output'))answer='A friendly reminder: your appointment at Sunny Clinic is on Tuesday at 10:00, reception B.';
 else answer=(has('role')?'Hello from Sunny Clinic!\n':'Appointment reminder\n')+'Day: Tuesday\nTime: 10:00\nLocation: reception B';
 return {answer,notes};
}
