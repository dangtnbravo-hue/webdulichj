import Globe from 'globe.gl';
import {loadInternationalRegions,regionHasVisit,regionColor} from './international-regions.js';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import locations from './country-locations.json';
import {internationalMapPoints} from './international-places.js';
const names=new Intl.DisplayNames(['vi'],{type:'region'});
const numericCodes=Object.fromEntries(Object.entries(locations).map(([code,country])=>[Number(country.numeric),code]));
const palette=['#30c6b2','#57a8ed','#c08ee6','#ffc76b','#f08f9d','#a4cb75'];
export async function createGlobe(container,{onCountry,onPlace,onRegion,onFailure}) {
  const context=document.createElement('canvas').getContext('webgl2');
  if(!context)throw new Error('WebGL2 unavailable');
  context.getExtension('WEBGL_lose_context')?.loseContext();
  const regions=await loadInternationalRegions().catch(()=>[]);
  const subdivided=new Set(regions.map(f=>f.properties.code));
  container.dataset.regionCount=String(regions.length);
  let visited=new Set(),points=[],selectedId=null,clusterKey='',frame=0;
  let autoRotate=false,visible=true,active=true;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const globe=new Globe(container,{rendererConfig:{antialias:true,alpha:true},waitForGlobeReady:false})
    .backgroundColor('#061b35').globeImageUrl('/images/earth-blue-marble.jpg')
    .showAtmosphere(true).atmosphereColor('#5cbfff').atmosphereAltitude(.17)
    .polygonsData([...feature(world,world.objects.countries).features.filter(f=>f.properties.name!=='Antarctica'&&!subdivided.has(numericCodes[Number(f.id)])),...regions])
    .polygonAltitude(f=>f.properties.regionId?(regionHasVisit(f,visited)?.012:.005):.002)
    .polygonCapColor(f=>f.properties.regionId?`${regionColor(f)}${regionHasVisit(f,visited)?'ed':'78'}`:`${palette[Math.abs(Number(f.id)||0)%palette.length]}33`)
    .polygonSideColor(()=>'rgba(255,200,90,0.22)')
    .polygonStrokeColor(f=>f.properties.regionId?(regionHasVisit(f,visited)?'#eafff4':'rgba(219,243,255,0.65)'):'rgba(196,229,255,0.3)')
    .polygonLabel(f=>{if(f.properties.regionId){const p=f.properties;return `${p.name} · ${names.of(p.code)}${regionHasVisit(f,visited)?' · Có điểm Đôn đã ghé ✓':''}`;}const code=numericCodes[Number(f.id)];return code?`${names.of(code)}${visited.has(code)?' · Đã đến ✓':''}`:f.properties.name;})
    .onPolygonClick(f=>{if(f.properties.regionId){onRegion(f);return;}const code=numericCodes[Number(f.id)];if(code)onCountry(code);})
    .htmlLat(d=>d.lat).htmlLng(d=>d.lng).htmlAltitude(.055)
    .htmlElement(d=>{
      const pin=document.createElement('button');pin.type='button';pin.className='globe-country-pin';
      if(d.places.length>1){pin.classList.add('globe-city-cluster');pin.textContent=String(d.places.length);pin.title=`${names.of(d.code)}: ${d.places.map(p=>p.name).join(', ')} — bấm để phóng to`;pin.addEventListener('click',e=>{e.stopPropagation();onCountry(d.code);focusPoints(d.places);});}
      else {
        const place=d.places[0];pin.textContent='✓';pin.title=`${place.name} · ${names.of(place.code)} — đã đến`;pin.dataset.placeId=place.id;
        if(place.kind!=='country'){pin.classList.add('globe-city-pin');const label=document.createElement('span');label.className='globe-city-name';label.textContent=place.name;pin.append(label);}
        pin.setAttribute('aria-current',String(place.id===selectedId));
        pin.addEventListener('click',e=>{e.stopPropagation();place.kind==='country'?onCountry(place.code):onPlace(place);});
      }
      pin.setAttribute('aria-label',pin.title);return pin;
    })
    .htmlElementVisibilityModifier((element,shown)=>{element.style.visibility=shown?'visible':'hidden';element.style.pointerEvents=shown?'auto':'none';})
    .ringsData([]).ringColor(()=>t=>`rgba(255,203,97,${1-t})`).ringMaxRadius(1.3).ringPropagationSpeed(.7).ringRepeatPeriod(2000);
  const controls=globe.controls();controls.enablePan=false;controls.minDistance=118;controls.maxDistance=700;controls.autoRotateSpeed=.45;
  function rebuild(force=false){
    frame=0;
    const groups=[];
    for(const point of points){
      const position=globe.getScreenCoords(point.lat,point.lng,.055);
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
  globe.onZoom(schedule);globe.pointOfView({lat:19,lng:107,altitude:2.25},0);
  function refreshAnimation(){const playing=active&&visible&&!document.hidden;if(playing)globe.resumeAnimation();else globe.pauseAnimation();controls.autoRotate=autoRotate&&playing;}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refreshAnimation();},{rootMargin:'120px'}).observe(container);
  document.addEventListener('visibilitychange',refreshAnimation);
  new ResizeObserver(()=>{if(container.clientWidth){globe.width(container.clientWidth).height(container.clientHeight);schedule();}}).observe(container);
  globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  globe.renderer().domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onFailure();});
  const textureCheck=new Image();textureCheck.onerror=()=>{globe.globeImageUrl(null);document.querySelector('#globe-feedback').textContent='Ảnh Trái Đất chưa tải được; vẫn có thể xoay và xem các vùng màu.';};textureCheck.src='/images/earth-blue-marble.jpg';
  return {
    update(codes){visited=new Set(codes);points=internationalMapPoints(codes,locations);if(selectedId&&!points.some(p=>p.id===selectedId))selectedId=null;rebuild();globe.ringsData(motion.matches?[]:points);globe.polygonAltitude(globe.polygonAltitude()).polygonCapColor(globe.polygonCapColor()).polygonStrokeColor(globe.polygonStrokeColor());},
    focus(code){selectedId=null;const known=points.filter(p=>p.code===code);if(known.length&&known[0].kind!=='country')focusPoints(known);else{const [lat,lng]=locations[code].latlng;globe.pointOfView({lat,lng,altitude:1.65},motion.matches?0:650);}rebuild(true);},
    focusRegion(region){selectedId=null;const [lat,lng]=region.properties.center;globe.pointOfView({lat,lng,altitude:Math.min(1.6,.24+region.properties.span/45)},motion.matches?0:650);rebuild(true);},
    focusPlace(place){selectedId=place.id;focusPoints([place]);rebuild(true);},
    reset(){selectedId=null;globe.pointOfView({lat:19,lng:107,altitude:2.25},motion.matches?0:600);rebuild(true);},
    zoom(factor){const point=globe.pointOfView();globe.pointOfView({...point,altitude:Math.max(.18,Math.min(5,point.altitude*factor))},motion.matches?0:250);},
    rotate(){autoRotate=!autoRotate;refreshAnimation();return autoRotate;},
    activate(value){active=value;refreshAnimation();if(value&&container.clientWidth){globe.width(container.clientWidth).height(container.clientHeight);schedule();}},
  };
}
