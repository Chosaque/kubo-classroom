const [stage,message]=process.argv.slice(2);
const threadId=process.env.CODEX_THREAD_ID||(process.env.CLAUDE_SESSION_ID?`claude-${process.env.CLAUDE_SESSION_ID}`:null);
if(!threadId)throw Error('The actual current CODEX_THREAD_ID or CLAUDE_SESSION_ID is required.');
const response=await fetch('http://127.0.0.1:4318/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({threadId,stage,message}),signal:AbortSignal.timeout(4000)});
if(!response.ok)throw Error('Work declaration failed');console.log('Reported work step');
