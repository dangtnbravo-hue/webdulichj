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
 assert.equal(internationalPlaces.find(p=>p.id==='fuji').kind,'city');
});

test('Fuji pin is in the author-confirmed city, not at the Mount Fuji summit',()=>{const fuji=internationalPlaces.find(p=>p.id==='fuji');assert.ok(fuji.lat<35.2&&fuji.lat>35.1);});

test('globe never invents country-centre pins or anonymous destinations',async()=>{
 const {confirmedGlobePlaces}=await import('../src/international-places.js');
 const all=confirmedGlobePlaces(['ID','MY','KH','SG','TH','JP','CN','US','VN','ZZ']);
 assert.equal(all.length,11);assert.equal(new Set(all.map(p=>p.id)).size,11);
 assert.ok(all.every(p=>p.name.trim()&&p.kind==='city'));
 assert.deepEqual(confirmedGlobePlaces(['US','VN','ZZ']),[]);
 assert.equal(confirmedGlobePlaces(['CN','CN']).length,3);
});

test('foreign counters share the pin registry: seven confirmed countries, excluding Vietnam, duplicates and stale extras',async()=>{
 const {confirmedForeignCountries}=await import('../src/international-places.js');
 const saved=['ID','MY','KH','SG','TH','JP','CN','VN','US','US','ZZ','CN'];
 assert.deepEqual(confirmedForeignCountries(saved),['ID','MY','KH','SG','TH','JP','CN']);
 assert.equal(confirmedForeignCountries(saved).length,7);
 assert.deepEqual(confirmedForeignCountries(['VN','US']),[]);
 assert.deepEqual(confirmedForeignCountries(['JP','JP','CN']),['JP','CN']);
});

test('article countries add country pins and counters without inventing cities or counting stale saved codes',async()=>{
 const {articleCountryCodes,confirmedGlobePlaces,confirmedForeignCountries}=await import('../src/international-places.js');
 const articles=articleCountryCodes([{country:'FR'},{country:'FR'},{country:'ID'},{country:'VN'}]);
 assert.deepEqual(articles,['FR','ID']);
 const codes=['ID','FR','US','VN'];
 const locations={FR:{latlng:[46,2]},ID:{latlng:[-5,120]},US:{latlng:[38,-97]}};
 const points=confirmedGlobePlaces(codes,articles,locations);
 assert.equal(points.length,2);assert.equal(points[0].id,'jakarta');
 assert.deepEqual(points[1],{id:'country-FR',code:'FR',name:'Pháp',lat:46,lng:2,kind:'country'});
 assert.deepEqual(confirmedForeignCountries(codes,articles),['ID','FR']);
 assert.deepEqual(confirmedGlobePlaces(codes,[],locations).map(p=>p.id),['jakarta']);
 assert.deepEqual(confirmedForeignCountries(codes,[]),['ID']);
 assert.deepEqual(confirmedGlobePlaces(['ID'],['FR'],locations).map(p=>p.id),['jakarta']);
});
