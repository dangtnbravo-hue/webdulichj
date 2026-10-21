import test from 'node:test';
import assert from 'node:assert/strict';
import {continents,requestedContinent,countryInContinent} from '../src/continents.js';
import {internationalPlaces} from '../src/international-places.js';
test('continent groups are disjoint and classify destination countries and future articles',()=>{
 const codes=continents.flatMap(c=>c.countries);assert.equal(codes.length,new Set(codes).size);assert.equal(codes.length,196);
 const asia=requestedContinent('?chau=chau-a');assert.equal(asia.name,'Châu Á');
 for(const place of internationalPlaces)assert.ok(countryInContinent(place.code,asia));
 for(const [code,id] of [['FR','chau-au'],['US','chau-my'],['BR','chau-my'],['EG','chau-phi'],['NZ','chau-dai-duong'],['AQ','chau-nam-cuc']])assert.ok(countryInContinent(code,requestedContinent('?chau='+id)));
 assert.equal(countryInContinent('ID',requestedContinent('?chau=chau-au')),false);assert.equal(requestedContinent('?chau=not-a-continent'),null);
 assert.equal(countryInContinent('ID',null),true);
});
