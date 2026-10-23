import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyCamera,smoothJourneyProgress} from '../src/journey-motion.js';
test('single approach keeps Earth tiny in galaxy view and moves continuously toward Vietnam',()=>{
 let previous=Infinity;
 for(let step=0;step<=200;step++){
  const camera=journeyCamera(step/200);
  assert.ok(Number.isFinite(camera.altitude)&&camera.altitude<=previous+1e-10&&camera.altitude>=.499);
  assert.ok(camera.lat>=16&&camera.lat<=18);assert.ok(camera.lng>=106&&camera.lng<=107);
  for(const key of ['stars','galaxyOpacity','earthOpacity','choices'])assert.ok(camera[key]>=0&&camera[key]<=1,key);
  assert.ok(camera.text.every(opacity=>opacity>=0&&opacity<=1));previous=camera.altitude;
 }
 assert.ok(journeyCamera(0).altitude>100);assert.equal(journeyCamera(0).galaxyOpacity,1);assert.equal(journeyCamera(0).choices,0);
 assert.equal(journeyCamera(.5).stage,1);assert.ok(journeyCamera(.5).altitude<5);
 assert.ok(Math.abs(journeyCamera(1).altitude-.5)<1e-10);assert.equal(journeyCamera(1).choices,1);assert.equal(journeyCamera(1).galaxyOpacity,0);
 assert.ok(journeyCamera(1).text.every(opacity=>opacity===0));
 const midway=journeyCamera(.3);journeyCamera(.9);assert.deepEqual(journeyCamera(.3),midway);
 assert.deepEqual(journeyCamera(-1),journeyCamera(0));assert.deepEqual(journeyCamera(2),journeyCamera(1));
});
test('camera and choice reveal remain continuous at scene boundaries',()=>{
 for(const boundary of [.34,.68,.84,.97]){
  const before=journeyCamera(boundary-.000001),after=journeyCamera(boundary+.000001);
  assert.ok(Math.abs(before.altitude-after.altitude)<.005);
  assert.ok(Math.abs(before.choices-after.choices)<.001);
 }
});
test('scroll easing converges without overshooting in either direction and respects elapsed time',()=>{
 for(const [start,target] of [[0,1],[1,0]]){
  let value=start;
  for(let frame=0;frame<100;frame++){
   const next=smoothJourneyProgress(value,target,16);
   assert.ok(next>=0&&next<=1);assert.ok(Math.abs(target-next)<=Math.abs(target-value));value=next;
  }
  assert.ok(Math.abs(target-value)<.0001);
 }
 assert.ok(Math.abs(smoothJourneyProgress(0,1,32)-smoothJourneyProgress(smoothJourneyProgress(0,1,16),1,16))<1e-10);
 assert.equal(smoothJourneyProgress(.5,.5,16),.5);
});
