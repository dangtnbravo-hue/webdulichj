const names=new Intl.DisplayNames(['vi'],{type:'region'});
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
export function destinationStory(stories,selection){
 const candidates=stories.filter(story=>!story.galleryOnly&&story.country!=='VN'&&(!selection?.code||story.country===selection.code));
 const sorted=candidates.toSorted((a,b)=>(b.date||'').localeCompare(a.date||''));
 if(selection?.name){
  const name=normalize(selection.name);
  const match=sorted.find(story=>normalize(story.title+' '+(story.story||story.excerpt||'')).includes(name));
  if(match)return match;
 }
 return sorted[0]||null;
}
export function mountDestinationCard(host,{onOpen}){
 let stories=[],selection=null;
 const article=document.createElement('article');article.className='destination-feature';
 article.innerHTML='<p class="destination-feature-label"></p><div class="destination-feature-visual"><img hidden alt=""><div class="destination-feature-placeholder" aria-hidden="true"><span><svg width="56" height="56" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="25" stroke="currentColor" stroke-width="1.5"/><ellipse cx="32" cy="32" rx="11" ry="25" stroke="currentColor" stroke-width="1.5"/><path d="M8 24h48M8 40h48M7 32h50" stroke="currentColor" stroke-width="1.5"/></svg></span><small>ĐI CÓ HỘI · KỂ CÓ ĐÔN</small></div></div><div class="destination-feature-body"><p class="destination-feature-country"></p><h2></h2><p class="destination-feature-excerpt"></p><p class="destination-feature-hint"></p><div class="destination-feature-action"></div></div>';
 const status=document.createElement('p');status.className='sr-only';status.setAttribute('role','status');
 const reset=document.createElement('button');reset.type='button';reset.className='destination-feature-reset';reset.textContent='Về chuyến đi gần nhất';
 reset.addEventListener('click',()=>{selection=null;render();});
 host.prepend(article,status,reset);
 function render(){
  const story=destinationStory(stories,selection);
  const country=selection?.code||story?.country;
  const title=selection?.name||(selection?.code?names.of(selection.code):story?.title)||'Chọn một ghim, khui một chuyện.';
  article.querySelector('.destination-feature-label').textContent=selection?'ĐIỂM BẠN ĐANG KHÁM PHÁ':'CHUYẾN ĐI GẦN NHẤT';
  article.querySelector('.destination-feature-country').textContent=country?names.of(country):'THEO CHÂN ĐÔN';
  article.querySelector('h2').textContent=title;
  const image=article.querySelector('img'),placeholder=article.querySelector('.destination-feature-placeholder');
  const photo=story?.photos?.[0];
  image.hidden=!photo;placeholder.hidden=Boolean(photo);
  if(photo){image.alt=story.title;image.src=photo;}else image.removeAttribute('src');
  image.onerror=()=>{image.hidden=true;placeholder.hidden=false;};
  article.querySelector('.destination-feature-excerpt').textContent=story?(story.excerpt||story.story||story.tips||'').slice(0,260):selection?(selection.visited===false?'Nơi này chưa có dấu chân của Đôn.':'Đôn đã ghé. Chuyện và ảnh ở đây sẽ được bổ sung sau.'):'Bấm tên nước hoặc ghim trên địa cầu để xem chuyến đi của Đôn.';
  article.querySelector('.destination-feature-hint').textContent=story&&selection?'Bài viết tại '+names.of(story.country)+' · '+story.title:story?'Chạm một ghim trên địa cầu để đổi điểm đến.':'';
  const actions=article.querySelector('.destination-feature-action');actions.replaceChildren();
  if(story){
   const button=document.createElement(story.url?'a':'button');
   if(story.url)button.href=story.url;else{button.type='button';button.addEventListener('click',()=>onOpen(story));}
   button.className='button blue';button.textContent='Xem chuyến đi';const arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('width','18');arrow.setAttribute('height','18');arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<path d="M6 18 18 6M6 6h12v12" fill="none" stroke="currentColor" stroke-width="1.5"/>';button.append(arrow);actions.append(button);
  }
  reset.hidden=!selection;
  status.textContent=selection?'Đang xem '+title:'Đang xem chuyến đi gần nhất';
 }
 addEventListener('map:destination',event=>{selection=event.detail;render();});
 render();
 return {update(nextStories){stories=nextStories;render();}};
}
