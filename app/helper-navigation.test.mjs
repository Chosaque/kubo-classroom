import test from 'node:test';
import assert from 'node:assert/strict';
import {STATIONS,free} from './navigation.mjs';
import {HelperJourney,HELPER_HOMES,helperTarget} from './helper-navigation.mjs';
test('helpers can reach all eight stations and face their work area',()=>{
 for(const station of STATIONS){const reserved=[];
  for(const home of HELPER_HOMES){const target=helperTarget(station.id,reserved);assert.ok(target,`${station.id} must fit four helpers`);reserved.push(target);
   const journey=new HelperJourney(home);journey.go(station.id,target);assert.notEqual(journey.state,'blocked',station.id);
   for(let i=0;i<500;i++){journey.update(.05);assert.ok(free(journey.position),'path must avoid furniture');}
   assert.equal(journey.state,'working');assert.deepEqual(journey.position,target);
   assert.equal(journey.heading,Math.atan2(station.look[0]-target[0],station.look[1]-target[1]));
  }
 }
});
test('refresh does not teleport or restart a helper and stale updates stop travel',()=>{
 const journey=new HelperJourney(HELPER_HOMES[0]),target=helperTarget('station-4');journey.go('station-4',target);journey.update(.05);
 const position=[...journey.position],path=journey.path;journey.go('station-4',target);assert.deepEqual(journey.position,position);assert.equal(journey.path,path);
 journey.pause();journey.update(.05);assert.deepEqual(journey.position,position);assert.equal(journey.state,'idle');
});
