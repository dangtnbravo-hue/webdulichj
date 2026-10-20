// A decorative glow follows a mouse only while it moves. No perpetual render loop.
export function mountAmbientBackground() {
  const selector='.travel-map-hero, .personal-journal, .about, footer';
  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const surfaces=new Set();
  let controller;
  let active;
  let latest;
  let frame=0;
  function hide() {
    if(frame)cancelAnimationFrame(frame);
    frame=0;latest=null;
    if(active)active.dataset.ambientActive='false';
    active=null;
  }
  function draw() {
    frame=0;
    if(!latest||!latest.surface.isConnected)return;
    const {surface,x,y}=latest;
    const bounds=surface.getBoundingClientRect();
    const overlay=surface.querySelector(':scope > .ambient-overlay');
    if(!overlay)return;
    if(active&&active!==surface)active.dataset.ambientActive='false';
    active=surface;
    overlay.style.setProperty('--ambient-x',`${Math.round(x-bounds.left)}px`);
    overlay.style.setProperty('--ambient-y',`${Math.round(y-bounds.top)}px`);
    surface.dataset.ambientActive='true';
  }
  function bind(surface) {
    surface.addEventListener('pointermove',event=>{
      if(event.pointerType!=='mouse'||document.hidden)return;
      latest={surface,x:event.clientX,y:event.clientY};
      if(!frame)frame=requestAnimationFrame(draw);
    },{passive:true,capture:true,signal:controller.signal});
    surface.addEventListener('pointerleave',()=>{
      if(active===surface||latest?.surface===surface)hide();
    },{passive:true,signal:controller.signal});
  }
  function discover() {
    document.querySelectorAll(selector).forEach(surface=>{
      if(surfaces.has(surface))return;
      surfaces.add(surface);surface.classList.add('ambient-surface');
      const overlay=document.createElement('div');overlay.className='ambient-overlay';overlay.setAttribute('aria-hidden','true');surface.prepend(overlay);
      if(controller)bind(surface);
    });
    for(const surface of surfaces)if(!surface.isConnected)surfaces.delete(surface);
  }
  function configure() {
    controller?.abort();controller=null;hide();
    if(finePointer.matches&&!reducedMotion.matches) {
      controller=new AbortController();surfaces.forEach(bind);
    }
  }
  discover();configure();
  finePointer.addEventListener('change',configure);reducedMotion.addEventListener('change',configure);
  window.addEventListener('scroll',hide,{passive:true,capture:true});
  window.addEventListener('blur',hide);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
  // The public journal is replaced by the owner's editor after login.
  const observer=new MutationObserver(discover);
  observer.observe(document.querySelector('main'),{childList:true});
}
