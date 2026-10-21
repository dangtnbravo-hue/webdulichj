export function mountEntryScreen({start}){
  const app=document.querySelector('#app'),scope=document.body.dataset.section;
  const path=region=>region==='vietnam'?'/viet-nam/':'/the-gioi/';
  document.querySelectorAll('#app a[data-map-region]').forEach(link=>{link.href=path(link.dataset.mapRegion);link.removeAttribute('data-map-region');});
  document.querySelectorAll('#app .logo').forEach(logo=>{logo.href='/';});
  if(scope){
    app.hidden=false;
    document.querySelector('.travel-region-switch').hidden=true;
    document.querySelector('#explore').hidden=true;
    document.querySelector('.categories').hidden=true;
    document.querySelectorAll('nav [data-nav-category]').forEach(link=>link.hidden=true);
    const articlesLink=document.querySelector('nav a[href="#explore"]');articlesLink.href='#my-journal';articlesLink.textContent='Bài viết';
    document.querySelectorAll('a[href="#explore"]').forEach(link=>link.href='#travel-map');
    start(scope).then(()=>{
      window.dispatchEvent(new CustomEvent('travel:region',{detail:{region:scope}}));
      const target=['#my-journal','#about','#travel-map'].includes(location.hash)?document.querySelector(location.hash):null;
      if(target)target.scrollIntoView({block:'start'});
    });
    return;
  }
  app.hidden=true;
  const entry=document.createElement('section');entry.id='entry-screen';entry.setAttribute('aria-labelledby','entry-title');
  entry.innerHTML=`<div class="entry-shell"><div class="entry-brand">ĐÔN <span>ĐÚ ĐỞN</span><small>ĐI CÓ HỘI · KỂ CÓ ĐÔN</small></div><div class="entry-intro"><p>MỘT CHIẾC CHÂN HAM ĐI. HAI MIỀN ĐỂ KỂ.</p><h1 id="entry-title">Hôm nay, mình<br><em>đú đởn đâu đây?</em></h1><span>Chọn một miền, cùng Đôn gom chuyện.</span></div><div class="entry-choices"><button type="button" class="entry-choice entry-world" data-entry-region="international"><img src="/images/photo-1464822759023-fed622ff2c3b.jpg" alt="Dãy núi hùng vĩ bên hồ nước xanh" fetchpriority="high"><span class="entry-card-top"><span>01 / ĐI XA MỘT CHÚT</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="entry-card-copy"><small>CHUYỆN NGOÀI BIÊN GIỚI</small><strong>Thế giới<br> của Đôn</strong><span>Mang tính ham đi ra ngoài biên giới.</span><b>Khui chuyện thế giới <span aria-hidden="true">→</span></b></span></button><button type="button" class="entry-choice entry-vietnam" data-entry-region="vietnam"><img src="/images/photo-1528127269322-539801943592.jpg" alt="Vịnh Hạ Long với những đảo đá xanh giữa mặt nước" fetchpriority="high"><span class="entry-card-top"><span>02 / THƯƠNG GẦN MỘT CHÚT</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="entry-card-copy"><small>ĐI DỌC DẢI CHỮ S</small><strong>Việt Nam<br> của Đôn</strong><span>Đi quanh chữ S, gom cả rổ chuyện.</span><b>Ghé chuyện quê mình <span aria-hidden="true">→</span></b></span></button></div><p class="entry-footnote">Đi thì đú đởn. Về thì kể hoài.</p><p id="entry-status" role="status"></p></div>`;
  app.before(entry);
  entry.querySelectorAll('[data-entry-region]').forEach(button=>button.addEventListener('click',()=>location.assign(path(button.dataset.entryRegion))));
  const hash=location.hash;
  if(['#my-journal','#travel-map','#explore','#about','#the-gioi','#viet-nam'].includes(hash)){
    const target=hash==='#viet-nam'?'vietnam':'international';
    location.replace(path(target)+(['#the-gioi','#viet-nam'].includes(hash)?'':hash));
  }
}
