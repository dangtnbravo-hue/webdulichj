import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {vietnamPlaces} from '../src/vietnam-places.js';

test('34 and 63 illustrative province maps cover all place codes without duplication',async()=>{
  const modern=JSON.parse(await readFile(new URL('../public/maps/vietnam-provinces-34.geojson',import.meta.url)));
  const historical=JSON.parse(await readFile(new URL('../public/maps/vietnam-provinces-63.geojson',import.meta.url)));
  assert.equal(modern.features.length,34);assert.equal(historical.features.length,63);
  const oldCodes=historical.features.map(f=>f.properties.id);
  const members=modern.features.flatMap(f=>f.properties.members);
  assert.equal(new Set(members).size,63);assert.deepEqual([...members].sort(),[...oldCodes].sort());
  for(const dataset of [modern,historical])for(const feature of dataset.features){
    assert.ok(feature.properties.name);assert.ok(['Polygon','MultiPolygon'].includes(feature.geometry.type));assert.ok(feature.geometry.coordinates.length);assert.ok(feature.properties.colorIndex>=0&&feature.properties.colorIndex<8);
  }
  for(const place of vietnamPlaces){assert.equal(modern.features.filter(f=>f.properties.members.includes(place.provinceCode)).length,1,place.name);assert.equal(historical.features.filter(f=>f.properties.members.includes(place.provinceCode)).length,1,place.name);}
  const find=name=>modern.features.find(f=>f.properties.name===name);
  assert.deepEqual(find('Ninh Bình').properties.members,['VN-18','VN-67','VN-63']);
  assert.deepEqual(find('Hải Phòng').properties.members,['VN-HP','VN-61']);
  assert.deepEqual(find('Bắc Ninh').properties.members,['VN-56','VN-54']);
  assert.deepEqual(find('Quảng Trị').properties.members,['VN-25','VN-24']);
  assert.deepEqual(find('Phú Thọ').properties.members,['VN-68','VN-70','VN-14']);
});
