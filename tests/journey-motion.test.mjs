import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyFrames} from '../src/journey-motion.js';
test('photo sequence always has a visible scene, stays finite, and can be scrubbed backward',()=>{
 for(let step=0;step<=100;step++){
  const frames=journeyFrames(step/100);assert.equal(frames.length,3);
  assert.ok(frames.some(frame=>frame.opacity>=.5));
  for(const frame of frames){assert.ok(Number.isFinite(frame.scale)&&frame.scale>=1&&frame.scale<=1.5);assert.ok(frame.opacity>=0&&frame.opacity<=1)}
 }
 assert.equal(journeyFrames(0)[0].opacity,1);assert.equal(journeyFrames(.5)[1].opacity,1);assert.equal(journeyFrames(1)[2].opacity,1);
 const midway=journeyFrames(.3);journeyFrames(.9);assert.deepEqual(journeyFrames(.3),midway);
 assert.deepEqual(journeyFrames(-1),journeyFrames(0));assert.deepEqual(journeyFrames(2),journeyFrames(1));
});
test('first scene zooms in while following scenes open back out',()=>{
 assert.ok(journeyFrames(.2)[0].scale>journeyFrames(0)[0].scale);
 assert.ok(journeyFrames(.55)[1].scale<journeyFrames(.3)[1].scale);
 assert.ok(journeyFrames(1)[2].scale<journeyFrames(.65)[2].scale);
});
