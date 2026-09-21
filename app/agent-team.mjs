import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {AGENT_COLORS,agentStatus,agentClip,visibleAgents} from './agent-team-state.mjs';
import {translate} from './thai.mjs';
const slots=[[-3.45,3.0],[-.50,3.0],[4.2,3.15],[4.4,-.3]];
export function createAgentTeam(scene,host){
 let library=null,promise=null,disposed=false,input=[],connected=false;const members=new Map();
 function remove(id){const m=members.get(id);if(!m)return;m.mixer.stopAllAction();m.label.remove();scene.remove(m.root);m.ring.geometry.dispose();m.ring.material.dispose();m.materials.forEach(x=>x.dispose());members.delete(id);}
 function reconcile(){
  if(!library||disposed)return;const shown=visibleAgents(input);for(const id of members.keys())if(!shown.some(a=>a.id===id))remove(id);
  shown.forEach((a,i)=>{if(members.has(a.id)){const m=members.get(a.id);m.root.position.set(slots[i][0],.12,slots[i][1]);m.ring.material.color.set(AGENT_COLORS[i]);m.materials.filter(x=>x.name.includes('Agent Jacket')).forEach(x=>x.color.set(AGENT_COLORS[i]));m.label.style.setProperty('--agent-color',AGENT_COLORS[i]);return;}const root=new T.Group(),body=clone(library.scene),materials=[],color=AGENT_COLORS[i];
   body.scale.setScalar(.27);root.add(body);root.position.set(slots[i][0],.12,slots[i][1]);root.rotation.y=i%2?-.4:.4;
   body.traverse(o=>{if(o.isMesh){o.castShadow=false;o.frustumCulled=false;const recolor=m=>{const c=m.clone();materials.push(c);if(c.name.includes('Agent Jacket'))c.color.set(color);return c;};o.material=Array.isArray(o.material)?o.material.map(recolor):recolor(o.material);}if(o.name.startsWith('PROP_')||o.name.startsWith('OUTFIT_'))o.visible=false;});
   const ring=new T.Mesh(new T.RingGeometry(.34,.39,32),new T.MeshBasicMaterial({color,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.035;root.add(ring);scene.add(root);
   const label=document.createElement('div');label.className='agent-marker';label.style.setProperty('--agent-color',color);host.appendChild(label);
   const mixer=new T.AnimationMixer(body),actions=Object.fromEntries(library.animations.map(c=>[c.name,mixer.clipAction(c)]));members.set(a.id,{root,body,ring,materials,label,mixer,actions,clip:null,elapsed:i*1.3,phase:i*.37,status:'Ready'});
  });host.dataset.agentCount=String(shown.length);
 }
 function setAgents(agents,isConnected){input=agents;connected=isConnected;if(!input.length){for(const id of [...members.keys()])remove(id);host.dataset.agentCount='0';return;}
  if(!promise){promise=new GLTFLoader().loadAsync('/cube-guy.glb').then(g=>{library=g;if(!disposed)reconcile();else releaseLibrary();}).catch(()=>{host.dataset.agentError='Could not load helper characters';});}else reconcile();
 }
 function update(dt,camera){const lang=document.documentElement.lang;for(const a of visibleAgents(input)){const m=members.get(a.id);if(!m)continue;m.elapsed+=dt;const status=agentStatus(a,connected),requested=agentClip(status,a.stationId,m.elapsed),clip=m.actions[requested]?requested:'Idle';m.status=status;
  if(clip!==m.clip){const next=m.actions[clip];if(next){next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).setLoop(T.LoopRepeat,Infinity);next.clampWhenFinished=false;next.time=m.phase*next.getClip().duration;next.play();if(m.clip)m.actions[m.clip]?.crossFadeTo(next,.35,false);}m.clip=clip;}
  m.mixer.update(dt);m.body.traverse(o=>{if(o.name.startsWith('PROP_'))o.visible=o.name.startsWith('PROP_File')?['ReadFile','CheckData','SortDocuments'].includes(clip):o.name.startsWith('PROP_ReadingCuff')?['ReadFile','InspectSafe'].includes(clip):['CheckData','UpdateBoard'].includes(clip);});
  const p=m.root.position.clone().add(new T.Vector3(0,1.52,0)).project(camera);m.label.hidden=p.z>1||p.z< -1;m.label.style.left=((p.x*.5+.5)*host.clientWidth)+'px';m.label.style.top=((-p.y*.5+.5)*host.clientHeight)+'px';m.label.textContent=translate(a.title,lang)+' · '+translate(status,lang);
 }}
 function releaseLibrary(){library?.scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}
 return {setAgents,update,getState:()=>[...members].map(([id,m])=>({id,status:m.status,animation:m.clip,animationTime:m.actions[m.clip]?.time||0,animationWeight:m.actions[m.clip]?.getEffectiveWeight()||0})),dispose(){disposed=true;for(const id of [...members.keys()])remove(id);releaseLibrary();}};
}
