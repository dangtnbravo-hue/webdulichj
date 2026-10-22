import test from 'node:test';
import assert from 'node:assert/strict';
import {globeLabelGroups} from '../src/globe-labels.js';
import {internationalPlaces} from '../src/international-places.js';
test('overview groups eleven destinations into seven country labels, close zoom preserves all exact locations',()=>{
 const overview=globeLabelGroups(internationalPlaces,2.25);
 assert.equal(overview.length,7);assert.ok(overview.every(group=>group.overview));
 assert.equal(overview.find(g=>g.code==='CN').places.length,3);
 const close=globeLabelGroups(internationalPlaces,.5);
 assert.equal(close.length,11);
 for(let i=0;i<close.length;i++){
   assert.equal(close[i].overview,false);assert.deepEqual(close[i].places,[internationalPlaces[i]]);
   assert.equal(close[i].lat,internationalPlaces[i].lat);assert.equal(close[i].lng,internationalPlaces[i].lng);
 }
 assert.equal(globeLabelGroups(internationalPlaces,1.1).length,7);
 assert.equal(globeLabelGroups(internationalPlaces,1.09).length,11);
});
test('article-only countries keep representative pins at close zoom and groups handle the dateline',()=>{
 const point={id:'country-FR',code:'FR',name:'Pháp',lat:46,lng:2,kind:'country'};
 assert.deepEqual(globeLabelGroups([point],.1)[0].places,[point]);
 assert.equal(globeLabelGroups([point],.1)[0].places[0].kind,'country');
 const grouped=globeLabelGroups([{code:'US',lat:1,lng:179},{code:'US',lat:3,lng:-179}],2)[0];
 assert.equal(grouped.lat,2);assert.ok(Math.abs(Math.abs(grouped.lng)-180)<.001);
 assert.deepEqual(globeLabelGroups([],2),[]);
});
