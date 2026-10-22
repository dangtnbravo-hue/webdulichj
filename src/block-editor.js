import {articleBlocks} from './article-blocks.js';
export function createBlockEditor(container,{photos,onRemovePhoto,onChange=()=>{}}){
  let blocks=[];
  function render(){
    container.replaceChildren();
    blocks.forEach((block,index)=>{
      const row=document.createElement('section');row.className='article-edit-block';
      const label=document.createElement('label');label.textContent=block.type==='text'?'Đoạn văn':'Chú thích ảnh';
      const input=document.createElement(block.type==='text'?'textarea':'input');
      input.value=block.type==='text'?block.text:block.caption;
      input.maxLength=block.type==='text'?20000:500;
      if(block.type==='text')input.rows=5;
      input.addEventListener('input',()=>{block[block.type==='text'?'text':'caption']=input.value;onChange()});
      if(block.type==='photo'){
        const image=document.createElement('img');image.src=photos()[block.photo];image.alt=block.caption||'Ảnh trong bài';row.append(image);
      }
      label.append(input);row.append(label);
      for(const [text,action,disabled] of [
        ['↑ Lên',()=>{[blocks[index-1],blocks[index]]=[blocks[index],blocks[index-1]];render()},index===0],
        ['↓ Xuống',()=>{[blocks[index+1],blocks[index]]=[blocks[index],blocks[index+1]];render()},index===blocks.length-1],
        ['Xóa khối',()=>{blocks.splice(index,1);if(block.type==='photo'){onRemovePhoto(block.photo);blocks.forEach(b=>{if(b.type==='photo'&&b.photo>block.photo)b.photo--})}render()},false],
        ['+ Đoạn văn sau đây',()=>{blocks.splice(index+1,0,{type:'text',text:''});render()},blocks.length>=100]
      ]){
        const button=document.createElement('button');button.type='button';button.textContent=text;button.disabled=disabled;button.addEventListener('click',action);row.append(button);
      }
      container.append(row);
    });
    onChange();
  }
  return {
    open(memory){blocks=structuredClone(articleBlocks(memory));if(!blocks.length)blocks.push({type:'text',text:''});render()},
    addText(){if(blocks.length<100){blocks.push({type:'text',text:''});render()}},
    addPhotos(indices){indices.forEach(photo=>blocks.push({type:'photo',photo,caption:''}));render()},
    getBlocks(){return structuredClone(blocks)},
    refresh:render
  };
}
