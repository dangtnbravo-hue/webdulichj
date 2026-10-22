export function galleryPhotos(memories){
  return memories.flatMap(memory=>{
    const photos=memory.blocks?memory.blocks.filter(block=>block.type==='photo').map(block=>({url:memory.photos[block.photo],caption:block.caption})):memory.photos.map(url=>({url,caption:''}));
    return photos.map((photo,index)=>({...photo,title:memory.title,country:memory.country,date:memory.date,memoryId:memory.id,index}));
  });
}
export function createPhotoGallery(){
  const names=new Intl.DisplayNames(['vi'],{type:'region'});
  const section=document.createElement('section');section.id='photo-gallery';section.className='section travel-gallery';
  section.innerHTML='<div class="container"><p class="eyebrow">MỖI TẤM ẢNH · MỘT CHUYẾN ĐI</p><div class="gallery-heading"><div><h2>Chỉ ngắm ảnh.<br><em>Cũng thấy muốn đi.</em></h2><p>Những khung hình Đôn đã chia sẻ trong các bài viết.</p></div><label>Lọc nơi chụp<select aria-label="Lọc ảnh theo quốc gia"><option value="">Tất cả</option></select></label></div><p class="gallery-status" role="status"></p><div class="travel-photo-grid"></div><button type="button" class="gallery-more button blue" hidden>Xem thêm ảnh</button></div>';
  const dialog=document.createElement('dialog');dialog.className='photo-lightbox';dialog.setAttribute('aria-label','Xem ảnh hành trình');
  dialog.innerHTML='<button type="button" class="dialog-close" aria-label="Đóng ảnh">×</button><figure><img alt=""><figcaption></figcaption></figure><div class="photo-lightbox-tools"><button type="button" aria-label="Ảnh trước">←</button><span role="status"></span><button type="button" aria-label="Ảnh tiếp theo">→</button></div>';
  document.body.append(dialog);
  const grid=section.querySelector('.travel-photo-grid'),select=section.querySelector('select'),more=section.querySelector('.gallery-more');
  const previous=dialog.querySelector('[aria-label="Ảnh trước"]'),next=dialog.querySelector('[aria-label="Ảnh tiếp theo"]');
  let photos=[],filtered=[],limit=24,current=0,lastTrigger;
  function show(index){
    current=(index+filtered.length)%filtered.length;const photo=filtered[current];if(!photo)return;
    const image=dialog.querySelector('img');image.src=photo.url;image.alt=photo.caption||photo.title;
    dialog.querySelector('figcaption').textContent=[photo.caption,photo.title,names.of(photo.country),photo.date].filter(Boolean).join(' · ');
    dialog.querySelector('[role="status"]').textContent=`${current+1} / ${filtered.length}`;
    previous.disabled=next.disabled=filtered.length<2;
  }
  function render(){
    filtered=photos.filter(photo=>!select.value||photo.country===select.value);grid.replaceChildren();
    section.querySelector('.gallery-status').textContent=filtered.length?`${filtered.length} ảnh công khai · Bấm ảnh để xem lớn`:'Chưa có ảnh công khai trong mục này. Ảnh sẽ xuất hiện sau khi Đôn đăng bài kèm ảnh.';
    filtered.slice(0,limit).forEach((photo,index)=>{
      const button=document.createElement('button');button.type='button';button.className='travel-photo';button.setAttribute('aria-label',`Xem ảnh ${index+1}: ${photo.caption||photo.title}`);
      const image=document.createElement('img');image.src=photo.url;image.alt=photo.caption||photo.title;image.loading='lazy';image.decoding='async';
      const label=document.createElement('span');label.textContent=photo.caption||photo.title;
      const location=document.createElement('small');location.textContent=names.of(photo.country);button.append(image,label,location);
      button.addEventListener('click',()=>{lastTrigger=button;show(index);dialog.showModal();document.body.classList.add('dialog-open')});grid.append(button);
    });more.hidden=limit>=filtered.length;
  }
  select.addEventListener('change',()=>{limit=24;render()});more.addEventListener('click',()=>{limit+=24;render()});
  previous.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(current+(event.key==='ArrowLeft'?-1:1))}});
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true})});
  return {section,update(memories){
    if(dialog.open)dialog.close();photos=galleryPhotos(memories);const chosen=select.value;
    select.replaceChildren(new Option('Tất cả',''),...[...new Set(photos.map(photo=>photo.country))].map(code=>new Option(names.of(code),code)));
    if([...select.options].some(option=>option.value===chosen))select.value=chosen;
    limit=24;render();
  },error(){section.querySelector('.gallery-status').textContent='Chưa tải được ảnh công khai. Bạn thử tải lại trang khi có kết nối nhé.';}};
}
