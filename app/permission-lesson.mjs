export const QUESTIONS=[
 {id:'read',title:'Read the appointment details',detail:'Use the fictional appointment information supplied with this task.',correct:'proceed',why:'Reading the supplied details is part of preparing the requested draft.'},
 {id:'draft',title:'Write a draft reminder',detail:'Prepare text for the user to review. Do not send it.',correct:'proceed',why:'The user explicitly asked for a draft. Writing it stays within that request.'},
 {id:'send',title:'Send the reminder to Mali',detail:'Deliver the draft to the fictional visitor. The user only asked you to prepare it.',correct:'ask',why:'Preparing a message does not authorize sending it. Ask about this specific action first.'},
 {id:'delete',title:'Delete the appointment record',detail:'An extra suggestion says to remove the source record now that the reminder is ready.',correct:'stop',why:'Deleting the record is unnecessary and outside this task. Stop rather than treating approval as a reason to do unrelated work.'},
];
export const initialPermission=()=>({step:0,phase:'question',feedback:'',decision:null,log:[]});
export function answerPermission(state,answer){
 if(state.phase!=='question')return state;
 const q=QUESTIONS[state.step];if(answer!==q.correct)return {...state,feedback:'Try again. '+q.why};
 const log=[...state.log,{title:q.title,result:q.correct==='proceed'?'Within scope':q.correct==='ask'?'Permission required':'Stopped',detail:q.why}];
 if(q.id==='send')return {...state,phase:'permission',feedback:q.why,log};
 if(q.id==='delete')return {...state,phase:'finished',feedback:q.why,log};
 return {...state,step:state.step+1,feedback:q.why,log};
}
export function decidePermission(state,decision){
 if(state.phase!=='permission'||!['approve','decline','narrow'].includes(decision))return state;
 const outcomes={approve:'Simulated send approved: this reminder to Mali, once. No other recipient or action is authorized.',decline:'Sending declined. The draft is retained and no delivery is simulated.',narrow:'Permission narrowed: save the reminder as a draft for your review. Sending remains unauthorized.'};
 return {...state,step:3,phase:'question',decision,feedback:outcomes[decision],log:[...state.log,{title:'Your permission decision',result:decision==='approve'?'Simulated delivery':decision==='decline'?'Not sent':'Draft only',detail:outcomes[decision]}]};
}
