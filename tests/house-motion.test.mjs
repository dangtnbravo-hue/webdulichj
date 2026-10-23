import test from 'node:test';
import assert from 'node:assert/strict';
import {houseFrame,smoothHouseProgress} from '../src/house-motion.js';
test('house opens the door before entering and reveals destination choices only at the desk',()=>{
 assert.equal(houseFrame(0).door,0);assert.equal(houseFrame(0).choices,0);assert.equal(houseFrame(.5).door,1);assert.equal(houseFrame(.7).choices,0);assert.equal(houseFrame(1).choices,1);
 for(let i=0;i<=100;i++){const f=houseFrame(i/100);assert.ok(f.door>=0&&f.door<=1);assert.ok(f.text.every(x=>x>=0&&x<=1));assert.ok(f.choices>=0&&f.choices<=1)}
 const mid=houseFrame(.6);houseFrame(1);assert.deepEqual(houseFrame(.6),mid);
 assert.deepEqual(houseFrame(-1),houseFrame(0));assert.deepEqual(houseFrame(2),houseFrame(1));
});
test('house scroll eases forward and backward without overshooting',()=>{
 for(const [start,target] of [[0,1],[1,0]]){let p=start;for(let i=0;i<120;i++){const next=smoothHouseProgress(p,target,16);assert.ok(next>=0&&next<=1);assert.ok(Math.abs(target-next)<=Math.abs(target-p));p=next}assert.ok(Math.abs(target-p)<.00015)}
});
