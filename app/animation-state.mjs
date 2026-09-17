export const STATION_CLIPS={'station-1':'Typing','station-2':'InspectSafe','station-3':'PressButton','station-4':'ReadFile','station-5':'CheckData','station-6':'WaitApproval','station-7':'SortDocuments','station-8':'UpdateBoard'};
export const PREVIEWS=['Wave','TaskReceived','Celebrate','Concerned','Interrupted','Approved','Denied','Walk'];
export const PREVIEW_LABELS={Wave:'Wave hello',TaskReceived:'Task received',Celebrate:'Celebrate',Concerned:'Concerned',Interrupted:'Interrupted',Approved:'Approval granted',Denied:'Approval denied',Walk:'Walk'};
export const CLIP_LABELS={Idle:'Idle',Run:'Playful run',Turn:'Turning',Sit:'Sitting down',Stand:'Standing up',Typing:'Typing',ReadScreen:'Reading the screen',PressButton:'Pressing the shortcut',ReadFile:'Reading a file',CheckData:'Checking documents',SortDocuments:'Sorting documents',UpdateBoard:'Updating the board',InspectSafe:'Inspecting the safe',WaitApproval:'Waiting at the door',...PREVIEW_LABELS};
export function stationClip(stationId,seconds=0){return stationId==='station-1'&&seconds%10>7?'ReadScreen':STATION_CLIPS[stationId]||'Idle';}
export function reactionFor(event){return {task_started:'TaskReceived',task_completed:'Celebrate',task_interrupted:'Interrupted',command_failed:'Concerned',approval_granted:'Approved',approval_denied:'Denied'}[event?.type]||null;}
export function speech({task,connected,following,movement,reaction=null,animation=null,now=Date.now(),stationName=''}){
 if(!following){
  if(reaction)return {label:'Animation preview',text:reaction==='Wave'?'Hi there! 👋':PREVIEW_LABELS[reaction]||CLIP_LABELS[reaction]||reaction};
  return {label:'Explore preview',text:movement.state==='running'?`On my way to ${stationName||'the center'}.`:['working','waiting'].includes(movement.state)?`Preview: ${(CLIP_LABELS[animation||STATION_CLIPS[movement.stationId]]||'working').toLowerCase()}.`:'Ready to explore.'};
 }
 const label=task?.title||'Live task';
 if(!connected||!task?.readable)return {label,text:'Updates disconnected. I’ve paused the animation.'};
 if(task.thinking&&!task.stale)return {label,text:'Thinking…'};
 if(task.progress?.stage==='done')return {label,text:task.activity};
 if(task.state==='completed')return {label,text:'This turn is complete.'};
 if(task.state==='interrupted')return {label,text:'This turn was interrupted.'};
 if(task.stale||task.state==='active'&&!task.progress&&now-Date.parse(task.lastEventAt)>20000)return {label,text:'Live status is out of date. Activity cannot be confirmed.'};
 if(task.progress)return {label:'Current step · '+label,text:task.activity};
 if(task.state==='waiting')return {label,text:'I need your input before continuing.'};
 const messages={'Task started':'I’m getting started on your request.','Tool operation started':'I’m working on your request.','Tool operation returned':'Your task is still active. The latest operation returned.','Waiting for a tool result':'The current operation is still running.','Editing files':'I’m updating project files.','File edit reported':'I’ve made a change to a project file.','Looking up information':'I’m looking for information to help with your request.','Using a connected tool':'I’m checking a connected app.','Connector operation finished':'The connected app has returned a result.','Local command finished':'A step on your computer has finished.','Local command returned an error':'Something went wrong with the last step.','Input request returned':'Your input request has returned.'};
 return {label,text:messages[task?.activity]||'Your task is active.'};
}

