export function mountJourneyEntry(app){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const root=document.createElement('main');root.id='journey-entry';
  root.innerHTML=`<header class="journey-nav"><a href="/" class="journey-brand">ĐÔN <span>ĐÚ ĐỞN</span><small>THEO CHÂN MỘT NGƯỜI HAM ĐI</small></a><a href="#journey-choice" class="journey-skip">Đến nơi muốn khám phá <span aria-hidden="true">↗</span></a></header>
  <div class="journey-trail" aria-hidden="true"><svg viewBox="0 0 120 1400" preserveAspectRatio="none"><defs><g id="journey-foot"><ellipse cy="-7" rx="5" ry="10"/><ellipse cy="7" rx="4" ry="4"/></g></defs><path class="journey-route-base" d="M60 0 C-10 160 130 230 60 390 S-10 620 60 790 S130 1030 60 1200 L60 1400"/><path class="journey-route-progress" d="M60 0 C-10 160 130 230 60 390 S-10 620 60 790 S130 1030 60 1200 L60 1400"/><g class="journey-footprints"></g></svg></div>
  <section class="journey-scene journey-hello" aria-labelledby="journey-title"><div class="journey-copy"><p class="journey-kicker">01 / RẤT VUI VÌ BẠN Ở ĐÂY</p><h1 id="journey-title">Chào bạn,<br><em>mình là Đôn.</em></h1><p>Chào mừng bạn đến với Đôn Đú Đởn.<br>Một góc nhỏ để cất những chuyến đi,<br>và những chuyện muốn kể khi trở về.</p><a class="journey-scroll" href="#journey-step">Theo chân mình một đoạn nhé <span aria-hidden="true">↓</span></a></div><div class="journey-hero-art"><img src="/images/photo-1464822759023-fed622ff2c3b.jpg" alt="Núi cao bên mặt hồ xanh — ảnh minh họa hành trình" fetchpriority="high"><span class="journey-photo-tag">CỨ ĐI, RỒI SẼ CÓ CHUYỆN ĐỂ KỂ.</span><span class="journey-stamp" aria-hidden="true">ĐI MỘT CHÚT<br>NHỚ THẬT LÂU<br>✳</span></div><span class="journey-margin-note" aria-hidden="true">MỘT CHUYẾN ĐI BẮT ĐẦU TỪ MỘT BƯỚC CHÂN.</span></section>
  <section id="journey-step" class="journey-scene journey-onward" aria-labelledby="journey-step-title"><div class="journey-story-art"><img src="/images/photo-1528127269322-539801943592.jpg" alt="Cảnh núi đá và mặt nước vịnh Hạ Long — ảnh minh họa" loading="lazy"><span>Gom một chút nắng. Mang về một chút thương.</span></div><div class="journey-copy"><p class="journey-kicker">02 / ĐI THÊM MỘT CHÚT</p><h2 id="journey-step-title">Có lúc đi xa.<br><em>Có lúc về gần.</em></h2><p>Có những nơi khiến mình muốn bước tiếp.<br>Cũng có những nơi, trở lại rồi vẫn thấy thương.</p><p>Mình giữ chúng ở đây — bằng những tấm ảnh,<br>những dấu chân, và chuyện dọc đường.</p><a class="journey-scroll" href="#journey-choice">Cùng chọn hướng tiếp theo <span aria-hidden="true">↓</span></a></div></section>
  <section id="journey-choice" class="journey-destinations" aria-labelledby="journey-choice-title" tabindex="-1"><p class="journey-kicker">03 / HÀNH TRÌNH CỦA BẠN BẮT ĐẦU</p><h2 id="journey-choice-title">Hôm nay,<br><em>mình đi đâu?</em></h2><p>Hai miền để khám phá. Chọn một nơi, mình cùng đi.</p><div class="journey-destination-grid"><a class="journey-destination" href="/the-gioi/" data-journey-flight="international"><img src="/images/photo-1464822759023-fed622ff2c3b.jpg" alt=""><span class="journey-card-top">01 / ĐI XA MỘT CHÚT <b aria-hidden="true">↗</b></span><span class="journey-card-copy"><small>CHUYỆN NGOÀI BIÊN GIỚI</small><strong>Thế giới<br>của Đôn</strong><span>Bay qua những miền đất mới <b aria-hidden="true">→</b></span></span></a><a class="journey-destination" href="/viet-nam/" data-journey-flight="vietnam"><img src="/images/photo-1528127269322-539801943592.jpg" alt=""><span class="journey-card-top">02 / THƯƠNG GẦN MỘT CHÚT <b aria-hidden="true">↗</b></span><span class="journey-card-copy"><small>ĐI DỌC DẢI CHỮ S</small><strong>Việt Nam<br>của Đôn</strong><span>Ghé những nơi thân thuộc <b aria-hidden="true">→</b></span></span></a></div><p class="journey-signoff">Đi thì đú đởn. Về thì kể hoài.</p><a class="journey-original" href="/">Về trang chọn quen thuộc</a></section><p class="sr-only" id="journey-flight-status" role="status"></p>`;
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
