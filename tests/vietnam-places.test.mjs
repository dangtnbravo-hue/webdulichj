import {test} from 'node:test';
import assert from 'node:assert/strict';
import {vietnamPlaces} from '../src/vietnam-places.js';
import {visitedPlaces} from '../src/visited-places.js';

test('all twenty author-confirmed Vietnam destinations are mapped once without changing foreign count',()=>{
  const expected=['Ninh Bình','Mộc Châu','Quảng Ninh','Hải Phòng','Bắc Ninh','Bắc Giang','Nghệ An','Hải Dương','Thái Bình','Quảng Trị','Quảng Bình','Đà Nẵng','Hồ Chí Minh','Vĩnh Phúc','Hưng Yên','Hà Nam','Nam Định','Tuyên Quang','Hòa Bình','Hà Tĩnh'];
  assert.deepEqual(vietnamPlaces.map(p=>p.name),expected);
  assert.equal(new Set(vietnamPlaces.map(p=>p.id)).size,20);
  for(const place of vietnamPlaces){assert.match(place.id,/^[a-z-]+$/);assert.ok(place.lat>=8&&place.lat<=24&&place.lng>=102&&place.lng<=110,place.name);}
  assert.deepEqual(visitedPlaces.VN,expected);
  assert.equal(Object.keys(visitedPlaces).filter(c=>c!=='VN').length,7);
});
