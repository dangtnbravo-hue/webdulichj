import test from 'node:test';
import assert from 'node:assert/strict';
import {galleryPhotos} from '../src/photo-gallery.js';
test('gallery follows article photo order and captions, supports old articles and excludes text-only posts',()=>{
 const memories=[{id:'a',title:'Chuyến đi',country:'JP',date:'2023-08-24',photos:['one.jpg','two.jpg'],blocks:[{type:'photo',photo:1,caption:'Ảnh thứ hai'},{type:'text',text:'Chữ'},{type:'photo',photo:0,caption:''}]},{id:'b',title:'Bài cũ',country:'VN',date:'',photos:['old.jpg']},{id:'c',photos:[]}];
 const result=galleryPhotos(memories);assert.deepEqual(result.map(p=>p.url),['two.jpg','one.jpg','old.jpg']);assert.equal(result[0].caption,'Ảnh thứ hai');assert.equal(result[0].country,'JP');assert.equal(result[2].memoryId,'b');assert.equal(result[2].caption,'');assert.deepEqual(galleryPhotos([]),[]);
});
