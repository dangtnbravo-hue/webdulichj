import { cloudClient, cloudConfigured, trustedPhoto } from './cloud-config.js';
import { mountJournal, validState, viewMemory } from './journal.js';
import { visitedPlaces } from './visited-places.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names=new Intl.DisplayNames(['vi'],{type:'region'});
const defaultContent={version:1,countries:Object.keys(visitedPlaces),memories:[]};
let published=structuredClone(defaultContent);
let revision=0;
let owner=false;
let region='international';
const readerEvents=new AbortController();
function announce(message){document.querySelector('#publishing-status').textContent=message;}
async function readPublished(){
  const {data,error}=await cloudClient.from('site_journal').select('content,revision').eq('id',1).single();
  if(error)throw new Error('Chưa đọc được nội dung công khai. Kiểm tra kết nối và chạy tệp Supabase setup.sql.');
  return {content:validState(data.content),revision:data.revision};
}
function renderPublic(){
  const section=document.querySelector('#public-story-grid');if(!section)return;
  const memories=published.memories.filter(m=>region==='vietnam'?m.country==='VN':m.country!=='VN');
  const query=(document.querySelector('#public-search').value||'').toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  const filtered=memories.filter(m=>`${m.title} ${m.story} ${m.tips}`.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').includes(query));
  document.querySelector('#public-memory-status').textContent=`${region==='vietnam'?'Việt Nam':'Quốc tế'} · ${filtered.length} bài viết công khai`;
  section.innerHTML=filtered.length?filtered.map(m=>`<article class="memory-card">${m.photos[0]?`<button class="memory-cover" data-read-published="${m.id}" aria-label="Đọc ${escape(m.title)}"><img src="${m.photos[0]}" alt="${escape(m.title)}" loading="lazy"></button>`:'<div class="memory-no-photo">ĐI CÓ HỘI · KỂ CÓ ĐÔN</div>'}<div class="memory-card-body"><p class="memory-meta">${escape(names.of(m.country))}${m.date?` · ${escape(m.date)}`:''}</p><h3><button data-read-published="${m.id}">${escape(m.title)}</button></h3><p class="memory-excerpt">${escape(m.story||m.tips)}</p><button class="read-more" data-read-published="${m.id}">Nghe Đôn kể ↗</button></div></article>`).join(''):'<div class="journal-empty"><h3>Chuyện đang được Đôn gom góp.</h3><p>Chưa có bài công khai phù hợp trong mục này. Ghé lại hóng chuyện sau nhé.</p></div>';
  window.dispatchEvent(new CustomEvent('journal:updated',{detail:{countries:published.countries,ready:true,canEdit:false,vietnamMemories:published.memories.filter(m=>m.country==='VN').length}}));
}
function mountPublic(){
  const section=document.createElement('section');section.id='my-journal';section.className='section personal-journal';
  section.innerHTML=`<div class="container"><p class="eyebrow">CHUYỆN CỦA ĐÔN · MỜI BẠN HÓNG</p><h2>Đôn đi một chuyến.<br><em>Kể bạn nghe cả rổ.</em></h2><div class="public-reading-toolbar"><div class="filters" aria-label="Nhóm bài công khai"><button data-public-region="international" aria-pressed="true" class="active">Quốc tế</button><button data-public-region="vietnam" aria-pressed="false">Việt Nam</button></div><label><span class="sr-only">Tìm bài đã đăng</span><input type="search" id="public-search" placeholder="Hóng chuyện gì nào?" maxlength="100"></label></div><p id="public-memory-status" role="status"></p><div id="public-story-grid"></div><p id="public-load-status" role="status"></p></div>`;
  document.querySelector('#about').before(section);
  document.body.insertAdjacentHTML('beforeend','<dialog id="memory-view" aria-label="Bài viết của Đôn"><button class="dialog-close" type="button" aria-label="Đóng bài viết">×</button><div class="memory-view-body"></div></dialog>');
  const dialog=document.querySelector('#memory-view');dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
  section.addEventListener('click',event=>{const button=event.target.closest('[data-read-published]');if(button){const memory=published.memories.find(m=>m.id===button.dataset.readPublished);if(memory)viewMemory(memory);}});
  function setRegion(value){region=value;document.querySelectorAll('[data-public-region]').forEach(b=>{const selected=b.dataset.publicRegion===region;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});renderPublic();}
  section.querySelectorAll('[data-public-region]').forEach(b=>b.addEventListener('click',()=>setRegion(b.dataset.publicRegion)));
  document.querySelector('#public-search').addEventListener('input',renderPublic);
  window.addEventListener('travel:region',event=>setRegion(event.detail.region),{signal:readerEvents.signal});
  window.addEventListener('map:show-journal',event=>setRegion(event.detail.code==='VN'?'vietnam':'international'),{signal:readerEvents.signal});
  renderPublic();
}
async function publishSnapshot(content){
  if(!owner)throw new Error('Chỉ tài khoản chủ website được đăng nội dung.');
  const next=validState(content);
  const converted=new Map();
  for(const memory of next.memories){
    const paths=[];
    for(const photo of memory.photos){
      if(trustedPhoto(photo)){paths.push(photo);continue;}
      if(converted.has(photo)){paths.push(converted.get(photo));continue;}
      const blob=await (await fetch(photo)).blob();
      const path=`${memory.id}/${crypto.randomUUID()}.jpg`;
      const {error}=await cloudClient.storage.from('journal-photos').upload(path,blob,{contentType:'image/jpeg',upsert:false});
      if(error)throw new Error('Chưa tải được ảnh lên Supabase. Bản nháp vẫn còn; kiểm tra bucket và quyền tài khoản.');
      const {data}=cloudClient.storage.from('journal-photos').getPublicUrl(path);
      if(!trustedPhoto(data.publicUrl))throw new Error('Địa chỉ ảnh trả về không hợp lệ.');
      converted.set(photo,data.publicUrl);paths.push(data.publicUrl);
    }
    memory.photos=paths;
  }
  if(new Blob([JSON.stringify(next)]).size>5*1024*1024)throw new Error('Nội dung chữ vượt giới hạn 5 MB cho một lần đăng. Hãy giảm bớt nội dung.');
  const {data,error}=await cloudClient.from('site_journal').update({content:next}).eq('id',1).eq('revision',revision).select('revision').maybeSingle();
  if(error)throw new Error('Chưa đăng được nội dung. Kiểm tra phiên đăng nhập và quyền chủ website; bản nháp vẫn còn.');
  if(!data)throw new Error('Bản công khai đã thay đổi ở thiết bị khác. Hãy sao lưu bản nháp, tải lại trang và kiểm tra trước khi đăng tiếp.');
  revision=data.revision;published=next;
}
async function mountOwner(){
  readerEvents.abort();document.querySelector('#my-journal')?.remove();document.querySelector('#memory-view')?.remove();
  owner=true;await mountJournal({onPublish:publishSnapshot,onRestore:async()=>{const result=await readPublished();published=result.content;revision=result.revision;return published;}});
  document.querySelector('#owner-login').hidden=true;document.querySelector('#owner-logout').hidden=false;document.querySelector('#owner-quick-actions').hidden=false;
  announce('Bạn đã đăng nhập. Bấm Viết bài & thêm ảnh để bắt đầu. Lưu kỷ niệm giữ bản nháp; Đăng nhật ký công khai sẽ đăng toàn bộ nhật ký sau khi bạn xác nhận.');
}
async function isOwner(){const {data:{user}}=await cloudClient.auth.getUser();if(!user)return false;const {data,error}=await cloudClient.rpc('is_site_owner');return !error&&data===true;}
function downloadLegacy(){
  const request=indexedDB.open('may-du-ky-journal',1);
  request.onupgradeneeded=()=>{request.transaction.abort();announce('Trình duyệt này chưa có bản nháp cũ.');};
  request.onsuccess=()=>{const db=request.result;const read=db.transaction('journal','readonly').objectStore('journal').get('state');read.onsuccess=()=>{db.close();if(!read.result){announce('Không tìm thấy bản nháp cũ trên trình duyệt này.');return;}const url=URL.createObjectURL(new Blob([JSON.stringify(read.result)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='don-du-don-ban-nhap-cu.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Đã tải bản sao lưu cũ trên trình duyệt này. Giữ tệp ở nơi riêng tư.');};read.onerror=()=>{db.close();announce('Không đọc được bản nháp cũ.');};};request.onerror=()=>announce('Không mở được kho bản nháp cũ.');
}
export async function mountPublishing(){
  document.querySelector('#stories').hidden=true;
  document.querySelectorAll('a[href="#stories"]').forEach(a=>a.href='#my-journal');
  document.querySelector('.search-toggle').addEventListener('click',event=>{event.stopImmediatePropagation();document.querySelector('#my-journal').scrollIntoView({behavior:'smooth'});document.querySelector('#public-search')?.focus({preventScroll:true});},{capture:true});
  const admin=document.createElement('section');admin.className='section container author-access';admin.innerHTML=`<details><summary>Góc riêng của Đôn · Quản trị</summary><p>Khách cứ đọc thoải mái. Chỉ tài khoản chủ website được đăng nội dung công khai.</p><form id="owner-login" ${cloudConfigured?'':'hidden'}><label>Email quản trị<input type="email" name="email" autocomplete="username" required></label><label>Mật khẩu<input type="password" name="password" autocomplete="current-password" required></label><button class="button blue">Đăng nhập quản trị</button></form><div id="owner-quick-actions" class="owner-quick-actions" hidden><button id="owner-quick-write" type="button" class="button blue">Viết bài & thêm ảnh +</button><button id="owner-quick-drafts" type="button">Xem bản nháp</button><button id="owner-quick-publish" type="button">Đăng nhật ký công khai</button></div><button id="owner-logout" type="button" hidden>Đăng xuất quản trị</button><p id="publishing-status" role="status"></p><button type="button" id="legacy-backup">Tải bản sao lưu cũ trên thiết bị này</button><p class="photo-help">Bản nháp cũ trên trình duyệt vẫn được giữ. Chỉ chủ website mới có thể đưa bản nháp lên trang công khai.</p></details>`;
  document.querySelector('footer').before(admin);
  document.querySelector('#legacy-backup').addEventListener('click',downloadLegacy);
  document.querySelector('#owner-quick-write').addEventListener('click',()=>{const target=document.querySelector('#add-memory');if(!owner||!target)return;if(target.disabled){announce('Bản nháp chưa sẵn sàng hoặc đang lưu. Kiểm tra thông báo trong mục Nhật ký của tôi.');return;}target.click();});
  document.querySelector('#owner-quick-drafts').addEventListener('click',()=>{if(owner)document.querySelector('#my-journal').scrollIntoView({behavior:'smooth',block:'start'});});
  document.querySelector('#owner-quick-publish').addEventListener('click',()=>{const target=document.querySelector('#publish-journal');if(!owner||!target)return;if(target.disabled){announce('Nhật ký đang bận lưu hoặc đăng. Bạn chờ hoàn tất nhé.');return;}document.querySelector('#my-journal').scrollIntoView({behavior:'smooth',block:'start'});target.click();});
  document.querySelector('#owner-logout').addEventListener('click',async()=>{const {error}=await cloudClient.auth.signOut();if(error){announce('Chưa đăng xuất được. Thử lại khi có kết nối mạng.');return;}window.location.reload();});
  document.querySelector('#owner-login').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;const fields=new FormData(form);const button=form.querySelector('button');button.disabled=true;announce('Đang kiểm tra tài khoản chủ website…');try{const {error}=await cloudClient.auth.signInWithPassword({email:String(fields.get('email')),password:String(fields.get('password'))});if(error)throw new Error();if(!await isOwner()){await cloudClient.auth.signOut();announce('Tài khoản này không có quyền chủ website. Kiểm tra thiết lập site_owner trong Supabase.');return;}const result=await readPublished();published=result.content;revision=result.revision;await mountOwner();}catch{announce('Chưa đăng nhập được. Kiểm tra email, mật khẩu và cấu hình Supabase.');}finally{form.elements.password.value='';button.disabled=false;}});
  if(!cloudConfigured){mountPublic();announce('Chưa kết nối Supabase. Chủ website cần cấu hình URL, publishable key và chạy setup.sql trước khi đăng bài. Khách hiện chỉ xem danh sách quốc gia có sẵn.');return;}
  try{const result=await readPublished();published=result.content;revision=result.revision;if(await isOwner()){await mountOwner();return;}mountPublic();}
  catch(error){mountPublic();document.querySelector('#public-load-status').textContent='Chưa tải được bài viết công khai. Vui lòng thử lại sau.';announce(error.message);}
}
