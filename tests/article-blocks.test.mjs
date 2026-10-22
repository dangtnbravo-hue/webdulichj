import test from 'node:test';
import assert from 'node:assert/strict';
import {articleBlocks,validateBlocks,articleHTML} from '../src/article-blocks.js';
const memory={title:'Chuyến đi',story:'Bài cũ',photos:['data:image/jpeg;base64,YQ==']};
test('legacy articles keep text and photos; blocks preserve interleaved order',()=>{
  assert.deepEqual(articleBlocks(memory).map(b=>b.type),['text','photo']);
  const blocks=[{type:'text',text:'Đầu'},{type:'photo',photo:0,caption:'Một góc phố'},{type:'text',text:'Cuối'}];
  const saved=validateBlocks(JSON.parse(JSON.stringify(blocks)),memory.photos);
  const html=articleHTML({...memory,blocks:saved});
  assert.ok(html.indexOf('Đầu')<html.indexOf('<figure'));
  assert.ok(html.indexOf('</figure>')<html.indexOf('Cuối'));
  assert.match(html,/Một góc phố/);
  const uploaded={...memory,photos:['https://example.test/upload.jpg'],blocks:saved};
  assert.match(articleHTML(uploaded),/https:\/\/example.test\/upload.jpg/);
});
test('blocks reject missing, repeated, or invalid photo references and excessive text',()=>{
  for(const blocks of [[],[{type:'photo',photo:1,caption:''}],[{type:'photo',photo:0,caption:''},{type:'photo',photo:0,caption:''}],[{type:'text',text:'a'.repeat(20001)}],[{type:'html',text:'<script>'}]])assert.throws(()=>validateBlocks(blocks,memory.photos));
});
test('article text and captions render as text rather than HTML',()=>{
 const html=articleHTML({...memory,blocks:[{type:'text',text:'<script>alert(1)</script>'},{type:'photo',photo:0,caption:'<img onerror=alert(1)>'}]});
 assert.doesNotMatch(html,/<script>|<img onerror/);assert.match(html,/&lt;script&gt;/);
});
