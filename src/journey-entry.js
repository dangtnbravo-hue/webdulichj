import {journeyPlanets,planetPositions} from './journey-planets.js';
import {journeyCamera,smoothJourneyProgress} from './journey-motion.js';
export function mountJourneyEntry(app){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const root=document.createElement('main');root.id='journey-entry';
  root.classList.add('journey-cinematic');
  root.innerHTML=`<header class="journey-nav"><a href="/" class="journey-brand">ĐÔN <span>ĐÚ ĐỞN</span><small>THEO CHÂN MỘT NGƯỜI HAM ĐI</small></a><a href="#journey-choice" class="journey-skip">Bỏ qua <span aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a></header>
  <div class="journey-reel"><span id="journey-step" class="journey-scroll-marker" aria-hidden="true"></span><div class="journey-stage">
  <div class="journey-space" aria-hidden="true"><div class="journey-galaxy"></div><div class="journey-stars"></div><div class="journey-planet-field"></div><div class="journey-space-fallback"><img src="/images/earth-blue-marble.jpg" alt=""></div><div class="journey-space-planet"></div><div class="journey-earth-locator"><span>Trái Đất</span></div><span class="journey-vietnam-label">VIỆT NAM</span></div><div class="journey-film-shade" aria-hidden="true"></div>
  <div class="journey-film-copy"><section class="journey-film-scene" aria-labelledby="journey-title"><p class="journey-kicker">01 / NGÂN HÀ</p><h1 id="journey-title">Chào bạn.<br><em>Mình là Đôn.</em></h1><p>Cuộn một vòng nhé.</p></section>
  <section class="journey-film-scene" aria-labelledby="journey-step-title"><p class="journey-kicker">02 / TRÁI ĐẤT</p><h2 id="journey-step-title">Thế giới rộng.</h2><p>Việt Nam ở đâu nhỉ?</p></section>
  <section class="journey-film-scene" aria-labelledby="journey-near-title"><p class="journey-kicker">03 / VIỆT NAM</p><h2 id="journey-near-title">À, nhà đây.</h2><p>Đi gần cũng vui.</p></section></div>
  <div class="journey-film-bottom"><a class="journey-scroll" href="#journey-choice">Cuộn để đi tiếp <span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a><div class="journey-trail" aria-hidden="true"><svg viewBox="0 0 360 40"><defs><g id="journey-foot"><ellipse cy="-5" rx="3" ry="6"/><ellipse cy="4" rx="2.5" ry="2.5"/></g></defs><path class="journey-route-base" d="M12 20 Q95 3 180 20 T348 20"/><path class="journey-route-progress" d="M12 20 Q95 3 180 20 T348 20"/><g class="journey-footprints"></g></svg></div><span class="journey-film-count" aria-hidden="true">01 / 03</span></div></div></div>
<section id="journey-choice" class="journey-destinations" aria-labelledby="journey-choice-title" tabindex="-1"><p class="journey-kicker">TỚI LƯỢT BẠN CHỌN</p><h2 id="journey-choice-title">Đi đâu trước?</h2><div class="journey-destination-grid"><a class="journey-destination" href="/the-gioi/" data-journey-flight="international"><img src="/images/photo-1464822759023-fed622ff2c3b.jpg" alt=""><span class="journey-card-top">01 / ĐI XA MỘT CHÚT <b aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></b></span><span class="journey-card-copy"><small>CHUYỆN NGOÀI BIÊN GIỚI</small><strong>Thế giới</strong><span>Ra ngoài biên giới chơi <b aria-hidden="true">→</b></span></span></a><a class="journey-destination" href="/viet-nam/" data-journey-flight="vietnam"><img src="/images/photo-1528127269322-539801943592.jpg" alt=""><span class="journey-card-top">02 / ĐI GẦN CŨNG VUI <b aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></b></span><span class="journey-card-copy"><small>ĐI DỌC DẢI CHỮ S</small><strong>Việt Nam</strong><span>Đi một vòng Việt Nam <b aria-hidden="true">→</b></span></span></a></div><p class="journey-signoff">Đi có hội. Kể có Đôn.</p><a class="journey-original" href="/">Về trang chủ</a></section><p class="sr-only" id="journey-flight-status" role="status"></p>`;
  app.before(root);
  const stage=root.querySelector('.journey-stage'),choices=root.querySelector('#journey-choice');
  stage.append(choices);choices.inert=true;
  const galaxy=root.querySelector('.journey-galaxy');
  const planetField=root.querySelector('.journey-planet-field');
  const planetElements=journeyPlanets.map(planet=>{
    const node=document.createElement('div');node.className=`journey-other-planet journey-planet-${planet.id}`;node.dataset.planet=planet.id;node.title=planet.name;
    node.style.cssText=`left:${planet.x}%;top:${planet.y}%;--planet-size:${planet.size}px;`;
    if(planet.id==='saturn')node.innerHTML='<i class="journey-saturn-back"></i><span></span><i class="journey-saturn-front"></i>';
    else node.append(document.createElement('span'));
    planetField.append(node);return node;
  });
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
  let space,lastCamera=journeyCamera(0),frame=0,shownProgress=0,lastTime=0,pendingChoiceFocus=false;
  const fallbackView=()=>{root.dataset.spaceMode='fallback';fallback.hidden=false;planet.hidden=true};
  root.dataset.spaceMode='loading';
  import('./journey-space.js').then(({createJourneySpace})=>{
    try{space=createJourneySpace(planet,{onFailure:fallbackView});space.update(reduced.matches?journeyCamera(.58):lastCamera);root.dataset.spaceMode='globe';fallback.hidden=true}catch{fallbackView()}
  }).catch(fallbackView);
  function update(time=performance.now()){
    frame=0;
    const distance=Math.max(1,reel.offsetHeight-innerHeight);
    const target=Math.max(0,Math.min(1,-reel.getBoundingClientRect().top/distance));
    shownProgress=reduced.matches?target:smoothJourneyProgress(shownProgress,target,lastTime?time-lastTime:16);lastTime=time;
    const progress=shownProgress,camera=journeyCamera(progress),current=camera.stage;lastCamera=camera;
    const displayed=reduced.matches?journeyCamera(.58):camera;
    space?.update(displayed);space?.activate(reel.getBoundingClientRect().bottom>0);
    galaxy.style.opacity=String(reduced.matches?0:camera.galaxyOpacity);
    galaxy.style.transform=reduced.matches?'none':`scale(${camera.galaxyScale})`;
    planet.style.opacity=String(reduced.matches?1:camera.earthOpacity);
    const planetFrames=planetPositions(progress);
    planetElements.forEach((node,i)=>{
      const state=planetFrames[i];node.style.opacity=String(reduced.matches?0:state.opacity);
      node.style.transform=reduced.matches?'none':`translate(calc(-50% + ${state.dx}vw),calc(-50% + ${state.dy}vh)) scale(${state.scale})`;
    });
    root.querySelector('.journey-earth-locator').style.opacity=reduced.matches?'0':String(camera.locator);
    stars.style.opacity=String(reduced.matches ? .4 : camera.stars);
    stars.style.transform=reduced.matches?'none':`scale(${1+progress*.5})`;
    fallback.style.transform=reduced.matches?'none':`translate(-50%,-50%) scale(${.06+Math.min(progress,.8)*1.6})`;
    scenes.forEach((scene,i)=>{
      const opacity=reduced.matches?(i===current&&progress<.86?1:0):camera.text[i];
      scene.style.opacity=String(opacity);scene.inert=opacity<.5;scene.setAttribute('aria-hidden',String(opacity<.5));
      scene.style.transform=`translateY(calc(-50% + ${reduced.matches?0:(1-opacity)*14}px))`;
    });
    const reveal=reduced.matches?(progress>=.86?1:0):camera.choices;
    choices.style.opacity=String(reveal);choices.style.transform=`translate(-50%,calc(-50% + ${reduced.matches?0:(1-reveal)*30}px))`;
    choices.inert=reveal<.7;choices.setAttribute('aria-hidden',String(reveal<.7));
    root.style.setProperty('--journey-choice-shade',String(reveal*.72));
    root.querySelector('.journey-vietnam-label').style.opacity=!reduced.matches&&current===2&&root.dataset.spaceMode==='globe'?String((1-reveal)*.75):'0';
    root.querySelector('.journey-film-bottom').style.opacity=String(1-reveal);
    root.querySelector('.journey-film-bottom').inert=reveal>.7;
    root.dataset.scene=String(current);root.dataset.cameraAltitude=String(displayed.altitude);root.dataset.progress=String(progress);
    root.querySelector('.journey-film-count').textContent=`0${current+1} / 03`;
    route.style.strokeDashoffset=length*(1-progress);feet.forEach((foot,i)=>foot.style.opacity=(i+.5)/feet.length<=progress?'1':'0');
    if(pendingChoiceFocus&&reveal>.95){pendingChoiceFocus=false;choices.focus({preventScroll:true})}
    if(Math.abs(shownProgress-target)>.0001)frame=requestAnimationFrame(update);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update)}
  root.querySelectorAll('a[href="#journey-choice"]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();pendingChoiceFocus=true;
    scrollTo({top:reel.getBoundingClientRect().top+scrollY+Math.max(1,reel.offsetHeight-innerHeight),behavior:reduced.matches?'instant':'smooth'});
  }));
  window.addEventListener('pagehide',()=>space?.activate(false));window.addEventListener('pageshow',schedule);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);update();
  let flying=false;
  root.querySelectorAll('[data-journey-flight]').forEach(link=>link.addEventListener('click',async event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    if(reduced.matches||!Element.prototype.animate)return;
    event.preventDefault();if(flying)return;flying=true;
    root.querySelector('#journey-flight-status').textContent=link.dataset.journeyFlight==='vietnam'?'Đang đến Việt Nam…':'Đang đến Thế giới…';
    const portal=document.createElement('div');portal.className='journey-flight journey-space-flight';portal.setAttribute('aria-hidden','true');
    portal.style.cssText='inset:0;width:100vw;height:100dvh;';
    const snapshot=space?.snapshot();
    if(snapshot){const image=document.createElement('img');image.src=snapshot;image.alt='';portal.append(image)}
    document.body.append(portal);
    try{await portal.animate([{transform:'scale(1)',opacity:1},{transform:'scale(1.16)',opacity:.25}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}).finished}catch{}
    location.assign(link.href);
  }));
  addEventListener('pageshow',()=>{flying=false;document.querySelectorAll('.journey-flight').forEach(node=>node.remove())});
}
