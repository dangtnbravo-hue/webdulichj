import test from 'node:test';
import assert from 'node:assert/strict';
import {vietnamRegions,requestedVietnamRegion,memoryInVietnamRegion} from '../src/vietnam-regions.js';
test('Vietnam menu selects three regions and keeps unclassified articles in the full list',()=>{
  assert.deepEqual(vietnamRegions.map(r=>r.name),['Miền Bắc','Miền Trung','Miền Nam']);
  for(const region of vietnamRegions){
    assert.equal(requestedVietnamRegion('?mien='+region.id),region);
    assert.equal(memoryInVietnamRegion({country:'VN',vietnamRegion:region.id},region),true);
    assert.equal(memoryInVietnamRegion({country:'VN'},region),false);
    assert.equal(memoryInVietnamRegion({country:'ID',vietnamRegion:region.id},region),false);
  }
  assert.equal(requestedVietnamRegion('?mien=invalid'),null);
  assert.equal(memoryInVietnamRegion({country:'VN'},null),true);
  assert.equal(memoryInVietnamRegion({country:'VN',vietnamRegion:'nam'},vietnamRegions[0]),false);
});
