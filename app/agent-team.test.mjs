import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createAgentTeam} from './agent-team.mjs';
import {agentStatus,agentClip,visibleAgents,teamFor} from './agent-team-state.mjs';

test('helper work state covers all stations, thinking and approval; stale data stays idle',()=>{
 const now=Date.now(),agent={id:'helper',state:'active',readable:true,lastEventAt:new Date(now).toISOString()};
 assert.equal(agentClip(agentStatus({...agent,thinking:true},true,now)),'Thinking');
 assert.equal(agentClip(agentStatus({...agent,state:'waiting'},true,now)),'WaitApproval');
 const expected=['Work','InspectSafe','PressButton','ReadFile','CheckData','WaitApproval','SortDocuments','UpdateBoard'];
 expected.forEach((clip,i)=>assert.equal(agentClip('Working',`station-${i+1}`),clip));
 assert.equal(agentClip('Working',null),'Work');
 assert.equal(agentClip(agentStatus({...agent,stale:true},true,now)),'Idle');
 assert.equal(agentStatus({...agent,lastEventAt:'invalid'},true,now),'No recent update');
 assert.equal(agentStatus({...agent,progress:{stage:'check'},lastEventAt:new Date(now-25000).toISOString()},true,now),'Working');
 assert.equal(agentStatus(agent,false,now),'Updates disconnected');
});

test('working helpers remain visible when earlier helpers are finished, including descendants',()=>{
 const old=Array.from({length:4},(_,i)=>({id:`old-${i}`,isAgent:true,parentId:'root',state:'completed'}));
 const active={id:'working',isAgent:true,parentId:'old-0',state:'active'};
 assert.equal(visibleAgents(teamFor([...old,active],'root'))[0].id,'working');
});

test('real helper rigs move independently and recover their work loop after idle',async t=>{
 const bytes=await readFile(new URL('../website/cube-guy.glb',import.meta.url));
 const model=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 t.mock.method(GLTFLoader.prototype,'loadAsync',async()=>model);
 const oldDocument=globalThis.document;
 globalThis.document={documentElement:{lang:'en'},createElement:()=>({style:{setProperty(){}},remove(){}})};
 const host={dataset:{},clientWidth:1000,clientHeight:600,appendChild(){}};
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(),team=createAgentTeam(scene,host);
 const now=new Date().toISOString();
 const helpers=[{id:'a',stationId:'station-5'},{id:'b',stationId:'station-4'},{id:'c',thinking:true}].map(a=>({...a,title:a.id,state:'active',readable:true,lastEventAt:now}));
 const bones=()=>{const values=[];scene.traverse(o=>{if(o.isBone)values.push(...o.position,...o.quaternion);});return values;};
 try{
  team.setAgents(helpers,true);await new Promise(resolve=>setImmediate(resolve));
  team.update(.05,camera);const before=bones();
  assert.ok(team.getState().every(a=>a.movement==='walking'&&a.animation==='Walk'));
  for(let i=0;i<400;i++)team.update(.05,camera);
  assert.ok(bones().some((n,i)=>Math.abs(n-before[i])>.001),'real joint transforms must change');
  assert.deepEqual(team.getState().map(a=>a.animation),['CheckData','ReadFile','Thinking']);
  assert.ok(team.getState().every(a=>a.movement==='working'&&Math.hypot(a.position[0]-a.target[0],a.position[1]-a.target[1])<.01));
  const time=team.getState()[0].animationTime;team.setAgents(helpers,true);team.update(.05,camera);
  assert.notEqual(team.getState()[0].animationTime,time,'feed refresh must not freeze the mixer');
  team.setAgents(helpers.map(a=>({...a,stale:true})),true);
  for(let i=0;i<12;i++)team.update(.05,camera);
  assert.ok(team.getState().every(a=>a.animation==='Idle'));
  team.setAgents(helpers,true);
  for(let i=0;i<12;i++)team.update(.05,camera);
  assert.ok(team.getState().every(a=>a.animationWeight>.99),'work loops must regain their full weight');
 }finally{team.dispose();globalThis.document=oldDocument;}
});
