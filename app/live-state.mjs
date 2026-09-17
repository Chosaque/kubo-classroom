export function liveIntent(task,connected,now=Date.now()){
 if(!connected||!task?.readable)return {kind:'pause',reason:'updates_unavailable'};
 if(task.state==='completed')return {kind:'home',reason:'turn_completed'};
 if(task.thinking&&!task.stale)return {kind:'station',stationId:task.stationId||'station-1'};
 if(task.state==='interrupted'||task.state==='unknown')return {kind:'pause',reason:task.state};
 if(task.stale||task.state==='active'&&!task.progress&&now-Date.parse(task.lastEventAt)>20000)return {kind:'pause',reason:'no_recent_update'};
 if(task.state==='waiting')return {kind:'station',stationId:'station-6'};
 if(task.state==='active'&&/^station-[1-8]$/.test(task.stationId||''))return {kind:'station',stationId:task.stationId};
 return {kind:'pause',reason:'awaiting_event'};
}
