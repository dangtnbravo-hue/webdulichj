import Globe from 'globe.gl';
import {loadInternationalRegions,regionColor,visitedRegions,regionView} from './international-regions.js';
import locations from './country-locations.json';
import {internationalMapPoints} from './international-places.js';
const names=new Intl.DisplayNames(['vi'],{type:'region'});
export async function createGlobe(container,{onCountry,onPlace,onRegion,onFailure}) {
  const context=document.createElement('canvas').getContext('webgl2');
  if(!context)throw new Error('WebGL2 unavailable');
  context.getExtension('WEBGL_lose_context')?.loseContext();
  const regions=await loadInternationalRegions().catch(()=>[]);
  let regionKey='';
  container.dataset.regionCount='0';
  let visited=new Set(),points=[],selectedId=null,clusterKey='',frame=0;
  let autoRotate=false,visible=true,active=true;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const globe=new Globe(container,{rendererConfig:{antialias:true,alpha:true},waitForGlobeReady:false})
    .backgroundColor('#061b35').globeImageUrl('/images/earth-blue-marble.jpg')
    .showAtmosphere(true).atmosphereColor('#5cbfff').atmosphereAltitude(.17)
    .polygonsData([]).polygonsTransitionDuration(0)
    .polygonAltitude(.004).polygonCapCurvatureResolution(8)
    .polygonCapColor(f=>`${regionColor(f)}ed`)
    .polygonSideColor(()=>'rgba(0,0,0,0)')
    .polygonStrokeColor(()=>'#eafff4')
    .polygonLabel(f=>`${f.properties.name} · ${names.of(f.properties.code)} · Có điểm Đôn đã ghé ✓`)
    .onPolygonClick(onRegion)
    .htmlLat(d=>d.lat).htmlLng(d=>d.lng).htmlAltitude(.006)
    .htmlElement(d=>{
      const pin=document.createElement('button');pin.type='button';pin.className='globe-country-pin';
      if(d.places.length>1){pin.classList.add('globe-city-cluster');pin.textContent=String(d.places.length);pin.title=`${names.of(d.code)}: ${d.places.map(p=>p.name).join(', ')} — bấm để phóng to`;pin.addEventListener('click',e=>{e.stopPropagation();onCountry(d.code);focusPoints(d.places);});}
      else {
        const place=d.places[0];pin.textContent='✓';pin.title=`${place.name} · ${names.of(place.code)} — đã đến`;pin.dataset.placeId=place.id;
        if(place.kind!=='country'){pin.classList.add('globe-city-pin');const label=document.createElement('span');label.className='globe-city-name';label.textContent=place.name;pin.append(label);}
        pin.setAttribute('aria-current',String(place.id===selectedId));
        pin.addEventListener('click',e=>{e.stopPropagation();place.kind==='country'?onCountry(place.code):onPlace(place);});
      }
      pin.dataset.countryCode=d.code;
      const label=pin.querySelector('.globe-city-name')||document.createElement('span');label.className='globe-city-name';
      if(!label.textContent)label.textContent=d.places[0].name;
      if(d.places.length>1)label.textContent=`${names.of(d.code)} · ${d.places.length} điểm`;
      const region=regions.find(f=>f.properties.placeIds.includes(d.places[0].id));
      if(region){pin.style.setProperty('--place-color',regionColor(region));}
      pin.append(label);pin.setAttribute('aria-label',pin.title);return pin;
    })
    .htmlElementVisibilityModifier((element,shown)=>{element.style.visibility=shown?'visible':'hidden';element.style.pointerEvents=shown?'auto':'none';});
  const controls=globe.controls();controls.enablePan=false;controls.minDistance=101;controls.maxDistance=700;controls.autoRotateSpeed=.45;
  function rebuild(force=false){
    frame=0;
    const groups=[];
    for(const point of points){
      const position=globe.getScreenCoords(point.lat,point.lng,.006);
      const group=point.id===selectedId?null:groups.find(g=>g.code===point.code&&!g.selected&&Math.hypot(position.x-g.screen.x,position.y-g.screen.y)<34);
      if(group)group.places.push(point);else groups.push({code:point.code,screen:position,places:[point],selected:point.id===selectedId});
    }
    const key=groups.map(group=>group.places.map(p=>p.id).join('+')).join('|')+`:${selectedId}`;
    if(force||key!==clusterKey){clusterKey=key;globe.htmlElementsData(groups.map(g=>({code:g.code,places:g.places,lat:g.places.reduce((s,p)=>s+p.lat,0)/g.places.length,lng:g.places.reduce((s,p)=>s+p.lng,0)/g.places.length})));}
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(()=>rebuild());}
  function focusPoints(places){
    const lat=places.reduce((n,p)=>n+p.lat,0)/places.length,lng=places.reduce((n,p)=>n+p.lng,0)/places.length;
    const span=Math.max(...places.map(p=>p.lat))-Math.min(...places.map(p=>p.lat))+Math.max(...places.map(p=>p.lng))-Math.min(...places.map(p=>p.lng));
    globe.pointOfView({lat,lng,altitude:Math.min(1.65,Math.max(.24,.24+span/45))},motion.matches?0:650);
  }
  function focusRegion(region){
    globe.pointOfView(regionView(region,Math.max(.3,container.clientWidth/container.clientHeight),globe.camera().fov),motion.matches?0:650);
  }
  globe.onZoom(schedule);globe.pointOfView({lat:19,lng:107,altitude:2.25},0);
  function refreshAnimation(){const playing=active&&visible&&!document.hidden;if(playing)globe.resumeAnimation();else globe.pauseAnimation();controls.autoRotate=autoRotate&&playing;}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refreshAnimation();},{rootMargin:'120px'}).observe(container);
  document.addEventListener('visibilitychange',refreshAnimation);
  new ResizeObserver(()=>{if(container.clientWidth){globe.width(container.clientWidth).height(container.clientHeight);schedule();}}).observe(container);
  globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  globe.renderer().domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onFailure();});
  const textureCheck=new Image();textureCheck.onerror=()=>{globe.globeImageUrl(null);document.querySelector('#globe-feedback').textContent='Ảnh Trái Đất chưa tải được; vẫn có thể xoay và xem các vùng màu.';};textureCheck.src='/images/earth-blue-marble.jpg';
  return {
    update(codes){
      visited=new Set(codes);points=internationalMapPoints(codes,locations);
      if(selectedId&&!points.some(p=>p.id===selectedId))selectedId=null;
      rebuild();
      const visibleRegions=visitedRegions(regions,visited);
      const nextKey=visibleRegions.map(f=>f.properties.regionId).join('|');
      // Do not rebuild GPU geometry when only journal content changes.
      if(nextKey!==regionKey){
        regionKey=nextKey;globe.polygonsData(visibleRegions);
        container.dataset.regionCount=String(visibleRegions.length);
      }
    },
    focus(code){selectedId=null;const known=points.filter(p=>p.code===code),areas=visitedRegions(regions,visited).filter(f=>f.properties.code===code);if(areas.length===1)focusRegion(areas[0]);else if(known.length&&known[0].kind!=='country')focusPoints(known);else{const [lat,lng]=locations[code].latlng;globe.pointOfView({lat,lng,altitude:1.65},motion.matches?0:650);}rebuild(true);},
    focusRegion(region){selectedId=null;focusRegion(region);rebuild(true);},
    focusPlace(place){selectedId=place.id;const region=regions.find(f=>f.properties.placeIds.includes(place.id));if(region)focusRegion(region);else focusPoints([place]);rebuild(true);},
    reset(){selectedId=null;globe.pointOfView({lat:19,lng:107,altitude:2.25},motion.matches?0:600);rebuild(true);},
    zoom(factor){const point=globe.pointOfView();globe.pointOfView({...point,altitude:Math.max(.012,Math.min(5,point.altitude*factor))},motion.matches?0:250);},
    rotate(){autoRotate=!autoRotate;refreshAnimation();return autoRotate;},
    activate(value){active=value;refreshAnimation();if(value&&container.clientWidth){globe.width(container.clientWidth).height(container.clientHeight);schedule();}},
  };
}
