export function mountEntryScreen({start}){
  const app=document.querySelector('#app');app.hidden=true;
  const entry=document.createElement('section');entry.id='entry-screen';entry.setAttribute('aria-labelledby','entry-title');
  entry.innerHTML=`<div class="entry-shell"><div class="entry-brand">ĐÔN <span>ĐÚ ĐỞN</span><small>ĐI CÓ HỘI · KỂ CÓ ĐÔN</small></div><div class="entry-intro"><p>MỘT CHIẾC CHÂN HAM ĐI. HAI MIỀN ĐỂ KỂ.</p><h1 id="entry-title">Hôm nay, mình<br><em>đú đởn đâu đây?</em></h1><span>Chọn một miền, cùng Đôn gom chuyện.</span></div><div class="entry-choices"><button type="button" class="entry-choice entry-world" data-entry-region="international"><img src="/images/photo-1464822759023-fed622ff2c3b.jpg" alt="Dãy núi hùng vĩ bên hồ nước xanh" fetchpriority="high"><span class="entry-card-top"><span>01 / ĐI XA MỘT CHÚT</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="entry-card-copy"><small>CHUYỆN NGOÀI BIÊN GIỚI</small><strong>Thế giới<br> của Đôn</strong><span>Mang tính ham đi ra ngoài biên giới.</span><b>Khui chuyện thế giới <span aria-hidden="true">→</span></b></span></button><button type="button" class="entry-choice entry-vietnam" data-entry-region="vietnam"><img src="/images/photo-1528127269322-539801943592.jpg" alt="Vịnh Hạ Long với những đảo đá xanh giữa mặt nước" fetchpriority="high"><span class="entry-card-top"><span>02 / THƯƠNG GẦN MỘT CHÚT</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="entry-card-copy"><small>ĐI DỌC DẢI CHỮ S</small><strong>Việt Nam<br> của Đôn</strong><span>Đi quanh chữ S, gom cả rổ chuyện.</span><b>Ghé chuyện quê mình <span aria-hidden="true">→</span></b></span></button></div><p class="entry-footnote">Đi thì đú đởn. Về thì kể hoài.</p><p id="entry-status" role="status"></p></div>`;
  app.before(entry);
  let startup,selectedRegion='international';
  async function enter(region,target='#travel-map'){
    selectedRegion=region;entry.hidden=true;app.hidden=false;window.scrollTo({top:0,behavior:'instant'});
    if(!startup)startup=Promise.resolve(start(region));
    await startup;
    if(!entry.hidden)return;
    document.querySelector(`.travel-region-switch [data-map-region="${selectedRegion}"]`).click();
    history.replaceState(null,'',target==='#travel-map'?(selectedRegion==='vietnam'?'#viet-nam':'#the-gioi'):target);
    const heading=document.querySelector(target==='#travel-map'?'#map-heading':target);
    if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});if(target!=='#travel-map')heading.scrollIntoView({block:'start'});}
  }
  entry.querySelectorAll('[data-entry-region]').forEach(button=>button.addEventListener('click',()=>enter(button.dataset.entryRegion)));
  document.querySelectorAll('#app .logo').forEach(logo=>logo.addEventListener('click',event=>{event.preventDefault();entry.hidden=false;app.hidden=true;history.replaceState(null,'',location.pathname);window.scrollTo({top:0,behavior:'instant'});entry.querySelector('[data-entry-region]').focus({preventScroll:true});}));
  const hash=location.hash;
  if(['#my-journal','#travel-map','#explore','#about','#the-gioi','#viet-nam'].includes(hash))enter(hash==='#viet-nam'?'vietnam':'international',['#the-gioi','#viet-nam'].includes(hash)?'#travel-map':hash);
}
