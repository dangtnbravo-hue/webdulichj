import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyPlanets,planetPositions} from '../src/journey-planets.js';
test('additional planets appear in space and leave the frame before the Vietnam approach',()=>{
 assert.deepEqual(journeyPlanets.map(p=>p.name),['Sao Thổ','Sao Mộc','Sao Hỏa','Sao Hải Vương']);
 assert.ok(planetPositions(0).every(p=>p.opacity===1&&p.scale===1&&p.dx===0&&p.dy===0));
 assert.ok(planetPositions(.3).every(p=>p.opacity>0&&p.opacity<1&&p.scale>1));
 assert.ok(planetPositions(.6).every(p=>p.opacity===0));assert.ok(planetPositions(1).every(p=>p.opacity===0));
 assert.deepEqual(planetPositions(.2),planetPositions(.2));assert.deepEqual(planetPositions(-1),planetPositions(0));
});
