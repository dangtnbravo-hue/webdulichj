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
    const articlesLink=document.querySelector('nav a[href="#explore"]');articlesLink.href='#my-journal';articlesLink.querySelector('span').textContent='Bài viết';
    document.querySelectorAll('a[href="#explore"]').forEach(link=>link.href='#travel-map');
    start(scope).then(()=>{
      window.dispatchEvent(new CustomEvent('travel:region',{detail:{region:scope}}));
      const target=['#my-journal','#about','#travel-map','#photo-gallery'].includes(location.hash)?document.querySelector(location.hash):null;
      if(target)target.scrollIntoView({block:'start'});
    });
    return;
  }
  app.hidden=true;
  const hash=location.hash;
  if(['#my-journal','#travel-map','#explore','#about','#the-gioi','#viet-nam','#photo-gallery'].includes(hash)){
    const target=hash==='#viet-nam'?'vietnam':'international';
    location.replace(path(target)+(['#the-gioi','#viet-nam'].includes(hash)?'':hash));
    return;
  }
  // Existing house-preview links now open the official homepage.
  const url=new URL(location.href);
  if(url.searchParams.get('ban-nhap')==='ngoi-nha'){
    url.searchParams.delete('ban-nhap');
    history.replaceState(history.state,'',url.pathname+url.search+url.hash);
  }
  import('./house-entry.js').then(({mountHouseEntry})=>mountHouseEntry(app));
}
