import {countries,resizePhoto} from './journal.js';
import {vietnamRegions} from './vietnam-regions.js';
export function createGalleryUpload({section,onPublish}){
  const dialog=document.createElement('dialog');dialog.className='gallery-upload';dialog.setAttribute('aria-label','Thêm ảnh hành trình');
  dialog.innerHTML='<button type="button" class="dialog-close" aria-label="Đóng thêm ảnh">×</button><form><p class="eyebrow">GOM ẢNH · KHOE CHUYẾN ĐI</p><h2>Thêm ảnh hành trình</h2><p>Đăng một bộ ảnh riêng vào thư viện, không cần viết bài.</p><label>Tên bộ ảnh<input name="title" required maxlength="120" placeholder="Một chiều ở Bangkok"></label><div class="memory-form-row"><label>Quốc gia<select name="country" required></select></label><label>Ngày chụp (nếu nhớ)<input type="date" name="date"></label></div><label class="upload-region">Miền<select name="vietnamRegion"><option value="">Chưa phân miền</option></select></label><label>Chọn ảnh<input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple></label><p>JPG, PNG, WebP · tối đa 12 ảnh/bộ, 15 MB/ảnh. Ảnh được tối ưu trước khi tải lên.</p><div class="gallery-upload-previews"></div><p class="upload-status" role="status"></p><button class="button blue" type="submit">Đăng ảnh công khai</button></form>';
  const form=dialog.querySelector('form'),status=dialog.querySelector('.upload-status'),preview=dialog.querySelector('.gallery-upload-previews');
  const choices=countries.filter(c=>section==='vietnam'?c.code==='VN':c.code!=='VN');
  form.elements.country.append(...choices.map(c=>new Option(c.name,c.code)));
  form.elements.vietnamRegion.append(...vietnamRegions.map(r=>new Option(r.name,r.id)));
  const button=document.createElement('button');button.type='button';button.className='gallery-add button blue';button.textContent='+ Thêm ảnh';button.hidden=true;
  let photos=[],busy=false;
  function lock(value){busy=value;dialog.querySelectorAll('button,input,select').forEach(el=>el.disabled=value)}
  function render(){
    preview.replaceChildren();photos.forEach((photo,index)=>{
      const row=document.createElement('div');const image=document.createElement('img');image.src=photo.url;image.alt=`Ảnh đã chọn ${index+1}`;
      const label=document.createElement('label');label.textContent=`Chú thích ảnh ${index+1}`;const input=document.createElement('input');input.maxLength=500;input.value=photo.caption;input.addEventListener('input',()=>photo.caption=input.value);label.append(input);
      const remove=document.createElement('button');remove.type='button';remove.textContent='Bỏ ảnh';remove.addEventListener('click',()=>{photos.splice(index,1);render()});row.append(image,label,remove);preview.append(row);
    });
  }
  button.addEventListener('click',()=>{form.reset();photos=[];preview.replaceChildren();status.textContent='';dialog.querySelector('.upload-region').hidden=section!=='vietnam';dialog.showModal();document.body.classList.add('dialog-open')});
  form.elements.photos.addEventListener('change',async event=>{
    const files=[...event.target.files];event.target.value='';if(busy||!files.length)return;
    if(photos.length+files.length>12){status.textContent='Mỗi bộ ảnh tối đa 12 ảnh. Bỏ bớt ảnh đã chọn hoặc chọn ít hơn.';return}
    lock(true);status.textContent='Đang chuẩn bị ảnh xem trước…';
    try{const added=[];for(const file of files)added.push({url:await resizePhoto(file),caption:''});photos.push(...added);render();status.textContent='Kiểm tra ảnh và chú thích trước khi đăng.'}catch(error){status.textContent=error.message||'Chưa đọc được ảnh. Thử ảnh khác nhé.'}finally{lock(false)}
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    if(!form.elements.title.value.trim()){status.textContent='Nhập tên bộ ảnh trước khi đăng.';return}
    if(!photos.length){status.textContent='Chọn ít nhất một ảnh để đăng.';return}
    if(!window.confirm('Đăng công khai bộ ảnh này? Mọi người sẽ xem được ảnh và chú thích. Các bản nháp bài viết khác không được đăng trong thao tác này.'))return;
    lock(true);status.textContent='Đang tải ảnh và đăng vào thư viện…';
    try{
      await onPublish({id:crypto.randomUUID(),galleryOnly:true,title:form.elements.title.value.trim(),country:form.elements.country.value,date:form.elements.date.value,vietnamRegion:section==='vietnam'?form.elements.vietnamRegion.value:'',story:'',tips:'',photos:photos.map(p=>p.url),blocks:photos.map((p,photo)=>({type:'photo',photo,caption:p.caption}))});
      dialog.close();
    }catch(error){status.textContent=error.message||'Chưa đăng được. Ảnh đã chọn vẫn ở đây để bạn thử lại.'}finally{lock(false)}
  });
  dialog.querySelector('.dialog-close').addEventListener('click',()=>{if(!busy)dialog.close()});dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault()});dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');button.focus({preventScroll:true})});
  document.body.append(dialog);
  return {button,setOwner(owner){button.hidden=!owner}};
}
