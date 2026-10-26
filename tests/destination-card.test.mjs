import test from 'node:test';
import assert from 'node:assert/strict';
import {destinationStory} from '../src/destination-card.js';
const stories=[
 {id:'old',country:'JP',date:'2022-01-01',title:'Tokyo của mình'},
 {id:'new',country:'JP',date:'2024-02-01',title:'Fuji'},
 {id:'album',country:'TH',date:'2026-01-01',title:'Ảnh',galleryOnly:true},
 {id:'vn',country:'VN',date:'2026-01-01',title:'Việt Nam'}
];
test('destination story uses latest trip, prefers matching city and never substitutes another country or an album',()=>{
 assert.equal(destinationStory(stories,null).id,'new');
 assert.equal(destinationStory(stories,{code:'JP',name:'Tokyo'}).id,'old');
 assert.equal(destinationStory(stories,{code:'JP',name:'Kyoto'}).id,'new');
 assert.equal(destinationStory(stories,{code:'TH'}),null);
 assert.equal(destinationStory(stories,{code:'ID'}),null);
 assert.equal(destinationStory([],null),null);
});
