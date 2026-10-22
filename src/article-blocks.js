const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function articleBlocks(memory){
  return memory.blocks ?? [
    ...(memory.story?[{type:'text',text:memory.story}]:[]),
    ...memory.photos.map((_,photo)=>({type:'photo',photo,caption:''}))
  ];
}
export function validateBlocks(blocks,photos){
  if(!Array.isArray(blocks)||blocks.length>100)throw new Error('Invalid article blocks');
  const used=new Set();let length=0;
  const result=blocks.map(block=>{
    if(block?.type==='text'&&typeof block.text==='string'){
      length+=block.text.length;if(length>20000)throw new Error('Article text too long');
      return {type:'text',text:block.text};
    }
    if(block?.type==='photo'&&Number.isInteger(block.photo)&&block.photo>=0&&block.photo<photos.length&&!used.has(block.photo)&&typeof block.caption==='string'&&block.caption.length<=500){
      used.add(block.photo);return {type:'photo',photo:block.photo,caption:block.caption};
    }
    throw new Error('Invalid article block');
  });
  if(used.size!==photos.length)throw new Error('Missing photo block');
  return result;
}
export function articleHTML(memory){
  return articleBlocks(memory).map(block=>block.type==='text'
    ?`<p class="preserve-lines" style="white-space:pre-wrap">${escape(block.text)}</p>`
    :`<figure class="article-photo"><img src="${escape(memory.photos[block.photo])}" alt="${escape(block.caption||memory.title)}" loading="lazy" style="max-width:100%;height:auto"><figcaption>${escape(block.caption)}</figcaption></figure>`).join('');
}
