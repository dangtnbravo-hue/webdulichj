import {journeyCamera} from './journey-motion.js';
export function mountJourneyEntry(app){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const root=document.createElement('main');root.id='journey-entry';
  root.classList.add('journey-cinematic');
  root.innerHTML=`<header class="journey-nav"><a href="/" class="journey-brand">ĐÔN <span>ĐÚ ĐỞN</span><small>THEO CHÂN MỘT NGƯỜI HAM ĐI</small></a><a href="#journey-choice" class="journey-skip">Vào thẳng cho nóng <span aria-hidden="true">↗</span></a></header>
  <div class="journey-reel"><span id="journey-step" class="journey-scroll-marker" aria-hidden="true"></span><div class="journey-stage">
  <div class="journey-space" aria-hidden="true"><div class="journey-stars"></div><div class="journey-space-fallback"><img src="/images/earth-blue-marble.jpg" alt=""></div><div class="journey-space-planet"></div><span class="journey-vietnam-label">VIỆT NAM</span></div><div class="journey-film-shade" aria-hidden="true"></div>
  <div class="journey-film-copy"><section class="journey-film-scene" aria-labelledby="journey-title"><p class="journey-kicker">01 / XUẤT PHÁT HƠI XA MỘT CHÚT</p><h1 id="journey-title">Chào bạn,<br><em>mình là Đôn.</em></h1><p>Chào mừng tới Đôn Đú Đởn.<br>Kéo xuống nhé. Mình đáp xuống Trái Đất đã.</p></section>
  <section class="journey-film-scene" aria-labelledby="journey-step-title"><p class="journey-kicker">02 / TRÁI ĐẤT ĐÂY RỒI</p><h2 id="journey-step-title">Thế giới rộng.<br><em>Mình cứ đi thôi.</em></h2><p>Nhiều nước để ghé, nhiều chuyện để kể.<br>Nhưng trước hết, zoom gần thêm chút nữa.</p></section>
  <section class="journey-film-scene" aria-labelledby="journey-near-title"><p class="journey-kicker">03 / TỌA ĐỘ QUEN THUỘC</p><h2 id="journey-near-title">Việt Nam đây.<br><em>Đi đâu trước?</em></h2><p>Về tới nhà rồi. Còn khối chỗ để khám phá.<br>Cuộn tiếp để chọn Việt Nam hoặc Thế giới.</p></section></div>
  <div class="journey-film-bottom"><a class="journey-scroll" href="#journey-choice">Cuộn tiếp, còn nhiều chỗ để đú <span aria-hidden="true">↓</span></a><div class="journey-trail" aria-hidden="true"><svg viewBox="0 0 360 40"><defs><g id="journey-foot"><ellipse cy="-5" rx="3" ry="6"/><ellipse cy="4" rx="2.5" ry="2.5"/></g></defs><path class="journey-route-base" d="M12 20 Q95 3 180 20 T348 20"/><path class="journey-route-progress" d="M12 20 Q95 3 180 20 T348 20"/><g class="journey-footprints"></g></svg></div><span class="journey-film-count" aria-hidden="true">01 / 03</span></div></div></div>
<section id="journey-choice" class="journey-destinations" aria-labelledby="journey-choice-title" tabindex="-1"><p class="journey-kicker">03 / TỚI NGÃ RẼ RỒI</p><h2 id="journey-choice-title">Hôm nay,<br><em>mình đi đâu?</em></h2><p>Thích đi xa hay đi quanh nhà? Chọn một bên, mình dẫn đường.</p><div class="journey-destination-grid"><a class="journey-destination" href="/the-gioi/" data-journey-flight="international"><img src="/images/photo-1464822759023-fed622ff2c3b.jpg" alt=""><span class="journey-card-top">01 / ĐI XA MỘT CHÚT <b aria-hidden="true">↗</b></span><span class="journey-card-copy"><small>CHUYỆN NGOÀI BIÊN GIỚI</small><strong>Thế giới<br>của Đôn</strong><span>Ra ngoài biên giới chơi <b aria-hidden="true">→</b></span></span></a><a class="journey-destination" href="/viet-nam/" data-journey-flight="vietnam"><img src="/images/photo-1528127269322-539801943592.jpg" alt=""><span class="journey-card-top">02 / ĐI GẦN CŨNG VUI <b aria-hidden="true">↗</b></span><span class="journey-card-copy"><small>ĐI DỌC DẢI CHỮ S</small><strong>Việt Nam<br>của Đôn</strong><span>Đi một vòng Việt Nam <b aria-hidden="true">→</b></span></span></a></div><p class="journey-signoff">Đi có hội. Kể có Đôn.</p><a class="journey-original" href="/">Về trang chủ</a></section><p class="sr-only" id="journey-flight-status" role="status"></p>`;
  app.before(root);
  const route=root.querySelector('.journey-route-progress'),footprints=root.querySelector('.journey-footprints');
  const length=route.getTotalLength();route.style.strokeDasharray=length;
  const feet=Array.from({length:16},(_,index)=>{
    const point=route.getPointAtLength(length*(index+.5)/16),next=route.getPointAtLength(Math.min(length,length*(index+.5)/16+3));
    const foot=document.createElementNS('http://www.w3.org/2000/svg','use');foot.setAttribute('href','#journey-foot');
    const angle=Math.atan2(next.y-point.y,next.x-point.x)*180/Math.PI+90;
    foot.setAttribute('transform',`translate(${point.x} ${point.y+(index%2?7:-7)}) rotate(${angle+(index%2?9:-9)})`);footprints.append(foot);return foot;
  });
  const reel=root.querySelector('.journey-reel'),scenes=[...root.querySelectorAll('.journey-film-scene')];
  const planet=root.querySelector('.journey-space-planet'),stars=root.querySelector('.journey-stars'),fallback=root.querySelector('.journey-space-fallback');
  for(let i=0;i<110;i++){
    const star=document.createElement('i');star.style.cssText=`left:${(i*73.37)%100}%;top:${(i*41.63)%100}%;opacity:${.25+(i%5)*.15};width:${i%7===0?3:1}px;height:${i%7===0?3:1}px`;stars.append(star);
  }
  let space,lastCamera=journeyCamera(0),frame=0;
  const fallbackView=()=>{root.dataset.spaceMode='fallback';fallback.hidden=false;planet.hidden=true};
  root.dataset.spaceMode='loading';
  import('./journey-space.js').then(({createJourneySpace})=>{
    try{space=createJourneySpace(planet,{onFailure:fallbackView});space.update(reduced.matches?journeyCamera(.6):lastCamera);root.dataset.spaceMode='globe';fallback.hidden=true}catch{fallbackView()}
  }).catch(fallbackView);
  function update(){
    frame=0;
    const distance=Math.max(1,reel.offsetHeight-innerHeight);
    const progress=Math.max(0,Math.min(1,-reel.getBoundingClientRect().top/distance));
    const camera=journeyCamera(progress),current=camera.stage;lastCamera=camera;
    // Reduced motion keeps the planet still while retaining the three text stops.
    const displayed=reduced.matches?journeyCamera(.6):camera;
    space?.update(displayed);space?.activate(reel.getBoundingClientRect().bottom>0);
    stars.style.opacity=String(reduced.matches ? .6 : camera.stars);
    stars.style.transform=reduced.matches?'none':`scale(${1+progress*1.2})`;
    fallback.style.transform=reduced.matches?'none':`translate(-50%,-50%) scale(${.2+Math.min(progress,.7)*1.6})`;
    scenes.forEach((scene,i)=>{scene.style.opacity=i===current?'1':'0';scene.inert=i!==current;scene.setAttribute('aria-hidden',String(i!==current))});
    root.querySelector('.journey-vietnam-label').style.opacity=!reduced.matches&&current===2&&root.dataset.spaceMode==='globe'?'1':'0';
    root.dataset.scene=String(current);root.dataset.cameraAltitude=String(displayed.altitude);
    root.querySelector('.journey-film-count').textContent=`0${current+1} / 03`;
    route.style.strokeDashoffset=length*(1-progress);feet.forEach((foot,i)=>foot.style.opacity=(i+.5)/feet.length<=progress?'1':'0');
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update)}
  window.addEventListener('pagehide',()=>space?.activate(false));window.addEventListener('pageshow',schedule);
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
