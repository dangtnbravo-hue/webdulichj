import './house-entry.css';
import {houseFrame,smoothHouseProgress} from './house-motion.js';
export function mountHouseEntry(app){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.createElement('main');root.id='house-entry';
 const arrow='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 18 12-12M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 root.innerHTML=`<header class="house-nav"><a class="house-brand" href="/">ĐÔN <b>ĐÚ ĐỞN</b><small>CĂN CỨ CỦA MỘT NGƯỜI HAM ĐI</small></a><a class="house-skip" href="#house-choice">Vào thẳng bản đồ ${arrow}</a></header><div class="house-reel"><div class="house-stage"><div class="house-canvas" aria-hidden="true"></div><div class="house-fallback" hidden aria-hidden="true"><svg viewBox="0 0 600 400"><ellipse cx="300" cy="335" rx="245" ry="35" fill="#c2d0b5"/><path d="M145 170h310v160H145z" fill="#f0dfbf"/><path d="m115 175 185-120 185 120z" fill="#af6950"/><path d="M265 215h70v115h-70z" fill="#567d65"/><path d="M175 215h55v65h-55zm195 0h55v65h-55z" fill="#a7c1b4"/></svg></div><div class="house-copy"><section><p>01 / GHÉ CĂN CỨ CHÚT NHÉ</p><h1>Đôn có nhà.<br><em>Nhưng hay đi vắng.</em></h1><span>Chào bạn. Vào nhà xem mình đã đi đâu nhé.</span></section><section><p>02 / CỬA MỞ RỒI</p><h2>Vào nhà đi.<br><em>Bản đồ trên bàn đấy.</em></h2></section></div><section id="house-choice" class="house-choice" tabindex="-1" aria-labelledby="house-choice-heading"><p>03 / TỚI LƯỢT BẠN CHỌN</p><h2 id="house-choice-heading">Lần này đi đâu?</h2><div><a href="/the-gioi/" data-house-destination="international"><small>ĐI XA MỘT CHÚT</small><strong>Thế giới ${arrow}</strong></a><a href="/viet-nam/" data-house-destination="vietnam"><small>ĐI GẦN CŨNG VUI</small><strong>Việt Nam ${arrow}</strong></a></div></section><div class="house-bottom"><a href="#house-choice">Cuộn để vào nhà <span aria-hidden="true">↓</span></a><span class="house-step">01 / 03</span></div><div class="house-curtain" aria-hidden="true"></div></div></div><p class="sr-only house-status" role="status"></p>`;
 app.before(root);
 const reel=root.querySelector('.house-reel'),canvas=root.querySelector('.house-canvas'),fallback=root.querySelector('.house-fallback'),choices=root.querySelector('.house-choice'),texts=[...root.querySelectorAll('.house-copy section')],bottom=root.querySelector('.house-bottom'),counter=root.querySelector('.house-step'),curtain=root.querySelector('.house-curtain');
 choices.inert=true;let scene,progress=0,raf=0,lastTime=0,top=0,distance=1,pendingFocus=false,leaving=false;
 function measure(){top=reel.getBoundingClientRect().top+scrollY;distance=Math.max(1,reel.offsetHeight-innerHeight)}measure();
 function fallbackView(){root.dataset.mode='fallback';canvas.hidden=true;fallback.hidden=false}
 import('./house-scene.js').then(({createHouseScene})=>{try{scene=createHouseScene(canvas,{onFailure:fallbackView});root.dataset.mode='3d';scene.update(houseFrame(reduced.matches ? .92 : progress))}catch{fallbackView()}}).catch(fallbackView);
 function update(time=performance.now()){
  raf=0;if(leaving)return;const target=Math.max(0,Math.min(1,(scrollY-top)/distance));
  progress=reduced.matches?target:smoothHouseProgress(progress,target,lastTime?time-lastTime:16);lastTime=time;const frame=houseFrame(progress);
  scene?.update(reduced.matches?houseFrame(.92):frame);
  texts.forEach((text,i)=>{const opacity=reduced.matches?(i===frame.stage?1:0):frame.text[i];text.style.opacity=String(opacity);text.inert=opacity<.5;text.setAttribute('aria-hidden',String(opacity<.5))});
  const reveal=reduced.matches?(progress>.86?1:0):frame.choices;choices.style.opacity=String(reveal);choices.style.transform=`translate(-50%,${reduced.matches?0:(1-reveal)*20}px)`;choices.inert=reveal<.7;choices.setAttribute('aria-hidden',String(reveal<.7));
  bottom.style.opacity=String(1-reveal);bottom.inert=reveal>.7;counter.textContent=`0${frame.stage+1} / 03`;root.dataset.progress=String(progress);
  if(pendingFocus&&reveal>.95){pendingFocus=false;choices.focus({preventScroll:true})}
  if(Math.abs(progress-target)>.00015)raf=requestAnimationFrame(update);
 }
 const schedule=()=>{if(!raf)raf=requestAnimationFrame(update)};
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{measure();schedule()});reduced.addEventListener('change',schedule);addEventListener('pageshow',()=>{leaving=false;raf=0;curtain.getAnimations().forEach(animation=>animation.cancel());curtain.style.opacity='0';schedule()});
 root.querySelectorAll('a[href="#house-choice"]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();pendingFocus=true;scrollTo({top:top+distance,behavior:reduced.matches?'instant':'smooth'})}));
 root.querySelectorAll('[data-house-destination]').forEach(link=>link.addEventListener('click',async event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reduced.matches)return;
  event.preventDefault();if(leaving)return;leaving=true;cancelAnimationFrame(raf);raf=0;
  root.querySelector('.house-status').textContent=link.dataset.houseDestination==='vietnam'?'Đến Việt Nam…':'Khám phá Thế giới…';
  if(scene&&root.dataset.mode==='3d')await scene.depart(link.dataset.houseDestination);
  if(curtain.animate)try{await curtain.animate([{opacity:0},{opacity:1}],{duration:220,fill:'forwards'}).finished}catch{}
  location.assign(link.href);
 }));update();
}
