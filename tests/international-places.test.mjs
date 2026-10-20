import test from 'node:test';
import assert from 'node:assert/strict';
import {internationalPlaces,internationalMapPoints} from '../src/international-places.js';
import {visitedPlaces} from '../src/visited-places.js';
test('eleven confirmed international destinations retain seven countries and exact city pins',()=>{
 assert.equal(internationalPlaces.length,11);
 assert.equal(new Set(internationalPlaces.map(p=>p.id)).size,11);
 assert.equal(new Set(internationalPlaces.map(p=>p.code)).size,7);
 assert.deepEqual(visitedPlaces.CN,['Lệ Giang','Côn Minh','Shangri-La']);
 assert.deepEqual(visitedPlaces.TH,['Bangkok']);
 for(const place of internationalPlaces){assert.ok(Math.abs(place.lat)<=90&&Math.abs(place.lng)<=180);assert.ok(!('date' in place));}
 const locations={CN:{latlng:[35,105]},US:{latlng:[38,-97]},VN:{latlng:[16,106]}};
 const points=internationalMapPoints(['CN','CN','US','VN'],locations);
 assert.equal(points.length,4);assert.equal(points.at(-1).kind,'country');assert.equal(points.at(-1).code,'US');
 assert.equal(internationalPlaces.find(p=>p.id==='fuji').kind,'area');
});
