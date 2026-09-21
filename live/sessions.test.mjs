import test from 'node:test';
import assert from 'node:assert/strict';
import {sessions} from './sessions.mjs';
const tasks=[
 {id:'old',title:'Lesson plan',provider:'Codex',lastEventAt:'2026-09-19T10:00:00Z'},
 {id:'unknown',title:'Other',lastEventAt:null},
 {id:'new',title:'Classroom',provider:'Claude Code',lastEventAt:'2026-09-21T10:00:00Z'},
 {id:'child',title:'Subagent',isAgent:true,lastEventAt:'2026-09-22T10:00:00Z'}
];
test('latest activity first, missing dates last, excludes subagents',()=>{
 assert.deepEqual(sessions(tasks).map(t=>t.id),['new','old','unknown']);
 assert.equal(tasks[0].id,'old');
});
test('search matches title, assistant and ID without case sensitivity',()=>{
 assert.deepEqual(sessions(tasks,' CLAUDE ').map(t=>t.id),['new']);
 assert.deepEqual(sessions(tasks,'lesson').map(t=>t.id),['old']);
 assert.deepEqual(sessions(tasks,'unknown').map(t=>t.id),['unknown']);
 assert.deepEqual(sessions(tasks,'nothing'),[]);
});
test('new events take precedence over an older declared step timestamp',()=>{
 const active={...tasks[0],events:[{time:'2026-09-22T10:00:00Z'}]};
 assert.equal(sessions([tasks[2],active])[0].id,'old');
});
