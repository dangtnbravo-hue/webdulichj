import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyCamera} from '../src/journey-motion.js';
test('one camera moves continuously from space to Earth to Vietnam and reverses without state',()=>{
 let previous=Infinity;
 for(let step=0;step<=100;step++){
  const camera=journeyCamera(step/100);
  assert.ok(Number.isFinite(camera.altitude)&&camera.altitude<=previous+1e-10&&camera.altitude>=.499);
  assert.ok(camera.lat>=16&&camera.lat<=18);assert.ok(camera.lng>=106&&camera.lng<=107);assert.ok(camera.stars>=0&&camera.stars<=1);
  previous=camera.altitude;
 }
 assert.equal(journeyCamera(0).stage,0);assert.equal(journeyCamera(.5).stage,1);assert.equal(journeyCamera(1).stage,2);
 assert.ok(Math.abs(journeyCamera(0).altitude-18)<1e-10);assert.ok(Math.abs(journeyCamera(1).altitude-.5)<1e-10);
 const midway=journeyCamera(.3);journeyCamera(.9);assert.deepEqual(journeyCamera(.3),midway);
 assert.deepEqual(journeyCamera(-1),journeyCamera(0));assert.deepEqual(journeyCamera(2),journeyCamera(1));
});
test('zoom remains continuous across the three approach stages',()=>{
 for(const boundary of [.3,.62])assert.ok(Math.abs(journeyCamera(boundary-.0001).altitude-journeyCamera(boundary+.0001).altitude)<.001);
});
