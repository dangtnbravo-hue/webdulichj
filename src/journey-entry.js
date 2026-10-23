export function mountJourneyEntry(app){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const root=document.createElement('main');root.id='journey-entry';
  root.innerHTML=`<header class="journey-nav"><a href="/" class="journey-brand">ĐÔN <span>ĐÚ ĐỞN</span><small>THEO CHÂN MỘT NGƯỜI HAM ĐI</small></a><a href="#journey-choice" class="journey-skip">Vào thẳng cho nóng <span aria-hidden="true">↗</span></a></header>
  <div class="journey-trail" aria-hidden="true"><svg viewBox="0 0 120 1400" preserveAspectRatio="none"><defs><g id="journey-foot"><ellipse cy="-7" rx="5" ry="10"/><ellipse cy="7" rx="4" ry="4"/></g></defs><path class="journey-route-base" d="M60 0 C-10 160 130 230 60 390 S-10 620 60 790 S130 1030 60 1200 L60 1400"/><path class="journey-route-progress" d="M60 0 C-10 160 130 230 60 390 S-10 620 60 790 S130 1030 60 1200 L60 1400"/><g class="journey-footprints"></g></svg></div>
  <section class="journey-scene journey-hello" aria-labelledby="journey-title"><div class="journey-copy"><p class="journey-kicker">01 / CHÀO BẠN ĐỒNG HÀNH</p><h1 id="journey-title">Chào bạn,<br><em>mình là Đôn.</em></h1><p>Chào mừng tới Đôn Đú Đởn.<br>Mình đi chơi, chụp ảnh, rồi về kể lại.<br>Bạn cứ kéo xuống, chưa phải đi bộ đâu.</p><a class="journey-scroll" href="#journey-step">Đi một đoạn với mình nhé <span aria-hidden="true">↓</span></a></div><div class="journey-hero-art"><img src="/images/photo-1464822759023-fed622ff2c3b.jpg" alt="Núi cao bên mặt hồ xanh — ảnh minh họa hành trình" fetchpriority="high"><span class="journey-photo-tag">ĐI CHƠI LÀ CHÍNH. CÓ ẢNH LÀ VUI.</span><span class="journey-stamp" aria-hidden="true">HAM ĐI<br>HAY KỂ<br>✳</span></div><span class="journey-margin-note" aria-hidden="true">CUỘN TIẾP ĐI. CÒN NHIỀU CHỖ ĐỂ ĐÚ.</span></section>
  <section id="journey-step" class="journey-scene journey-onward" aria-labelledby="journey-step-title"><div class="journey-story-art"><img src="/images/photo-1528127269322-539801943592.jpg" alt="Cảnh núi đá và mặt nước vịnh Hạ Long — ảnh minh họa" loading="lazy"><span>Đi một chuyến, có chuyện tám cả buổi.</span></div><div class="journey-copy"><p class="journey-kicker">02 / CHÂN CHƯA MỎI ĐÂU</p><h2 id="journey-step-title">Đi xa cũng được.<br><em>Đi gần cũng vui.</em></h2><p>Không phải cứ ra nước ngoài mới là đi chơi.<br>Ở Việt Nam cũng còn khối chỗ để khám phá.</p><p>Chỗ nào đã ghé, ảnh nào đã chụp,<br>mình gom vào đây. Bạn cứ xem, chưa cần xếp vali.</p><a class="journey-scroll" href="#journey-choice">Rồi, chọn chỗ đi thôi <span aria-hidden="true">↓</span></a></div></section>
  <section id="journey-choice" class="journey-destinations" aria-labelledby="journey-choice-title" tabindex="-1"><p class="journey-kicker">03 / TỚI NGÃ RẼ RỒI</p><h2 id="journey-choice-title">Hôm nay,<br><em>mình đi đâu?</em></h2><p>Thích đi xa hay đi quanh nhà? Chọn một bên, mình dẫn đường.</p><div class="journey-destination-grid"><a class="journey-destination" href="/the-gioi/" data-journey-flight="international"><img src="/images/photo-1464822759023-fed622ff2c3b.jpg" alt=""><span class="journey-card-top">01 / ĐI XA MỘT CHÚT <b aria-hidden="true">↗</b></span><span class="journey-card-copy"><small>CHUYỆN NGOÀI BIÊN GIỚI</small><strong>Thế giới<br>của Đôn</strong><span>Ra ngoài biên giới chơi <b aria-hidden="true">→</b></span></span></a><a class="journey-destination" href="/viet-nam/" data-journey-flight="vietnam"><img src="/images/photo-1528127269322-539801943592.jpg" alt=""><span class="journey-card-top">02 / ĐI GẦN CŨNG VUI <b aria-hidden="true">↗</b></span><span class="journey-card-copy"><small>ĐI DỌC DẢI CHỮ S</small><strong>Việt Nam<br>của Đôn</strong><span>Đi một vòng Việt Nam <b aria-hidden="true">→</b></span></span></a></div><p class="journey-signoff">Đi có hội. Kể có Đôn.</p><a class="journey-original" href="/">Về trang chủ</a></section><p class="sr-only" id="journey-flight-status" role="status"></p>`;
  app.before(root);
  const route=root.querySelector('.journey-route-progress'),footprints=root.querySelector('.journey-footprints');
  const length=route.getTotalLength();route.style.strokeDasharray=length;
  const feet=Array.from({length:22},(_,index)=>{
    const point=route.getPointAtLength(length*(index+.5)/22),next=route.getPointAtLength(Math.min(length,length*(index+.5)/22+3));
    const foot=document.createElementNS('http://www.w3.org/2000/svg','use');foot.setAttribute('href','#journey-foot');
    const angle=Math.atan2(next.y-point.y,next.x-point.x)*180/Math.PI-90;
    foot.setAttribute('transform',`translate(${point.x+(index%2?9:-9)} ${point.y}) rotate(${angle+(index%2?9:-9)})`);footprints.append(foot);return foot;
  });
  let frame=0;
  function update(){
    frame=0;const start=root.querySelector('.journey-trail').getBoundingClientRect().top+scrollY;
    const end=root.querySelector('#journey-choice').getBoundingClientRect().top+scrollY;
    const progress=reduced.matches?1:Math.max(0,Math.min(1,(scrollY+innerHeight*.7-start)/Math.max(1,end-start)));
    route.style.strokeDashoffset=length*(1-progress);feet.forEach((foot,i)=>foot.style.opacity=(i+.5)/feet.length<=progress?'1':'0');
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update)}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);update();
  let flying=false;
  root.querySelectorAll('[data-journey-flight]').forEach(link=>link.addEventListener('click',async event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    if(reduced.matches||!Element.prototype.animate)return;
    event.preventDefault();if(flying)return;flying=true;
    root.querySelector('#journey-flight-status').textContent=link.dataset.journeyFlight==='vietnam'?'Đang đến Việt Nam…':'Đang đến Thế giới…';
    const box=link.getBoundingClientRect(),portal=document.createElement('div');portal.className='journey-flight';portal.setAttribute('aria-hidden','true');
    portal.style.cssText=`left:${box.left}px;top:${box.top}px;width:${box.width}px;height:${box.height}px;`;
    portal.append(link.querySelector('img').cloneNode());document.body.append(portal);
    try{await portal.animate([{borderRadius:'20px',left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px',opacity:1},{borderRadius:'0px',left:'0px',top:'0px',width:'100vw',height:'100dvh',opacity:1}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}).finished}catch{}
    location.assign(link.href);
  }));
  addEventListener('pageshow',()=>{flying=false;document.querySelectorAll('.journey-flight').forEach(node=>node.remove())});
}
