import Globe from 'globe.gl';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import locations from './country-locations.json';

const names = new Intl.DisplayNames(['vi'], {type:'region'});
const numericCodes = Object.fromEntries(Object.entries(locations).map(([code,country])=>[Number(country.numeric),code]));
const palette = ['#30c6b2','#57a8ed','#c08ee6','#ffc76b','#f08f9d','#a4cb75'];
export async function createGlobe(container, {onCountry, onFailure}) {
  const probe=document.createElement('canvas');
  const context=probe.getContext('webgl2');
  if(!context) throw new Error('WebGL2 unavailable');
  context.getExtension('WEBGL_lose_context')?.loseContext();
  let visited=new Set();
  let autoRotate=false;
  let visible=true;
  let active=true;
  const globe=new Globe(container,{rendererConfig:{antialias:true,alpha:true},waitForGlobeReady:false})
    .backgroundColor('#061b35')
    .globeImageUrl('/images/earth-blue-marble.jpg')
    .showAtmosphere(true).atmosphereColor('#5cbfff').atmosphereAltitude(.17)
    .polygonsData(feature(world,world.objects.countries).features.filter(f=>f.properties.name!=='Antarctica'))
    .polygonAltitude(f=>visited.has(numericCodes[Number(f.id)])?.018:.003)
    .polygonCapColor(f=>visited.has(numericCodes[Number(f.id)])?'rgba(255,190,66,0.72)':`${palette[Math.abs(Number(f.id)||0)%palette.length]}33`)
    .polygonSideColor(()=>'rgba(255,200,90,0.22)')
    .polygonStrokeColor(f=>visited.has(numericCodes[Number(f.id)])?'#ffe098':'rgba(196,229,255,0.3)')
    .polygonLabel(f=>{const code=numericCodes[Number(f.id)];return code?`${names.of(code)}${visited.has(code)?' · Đã đến ✓':''}`:f.properties.name;})
    .onPolygonClick(f=>{const code=numericCodes[Number(f.id)];if(code)onCountry(code);})
    .htmlLat(d=>d.lat).htmlLng(d=>d.lng).htmlAltitude(.05)
    .htmlElement(d=>{const pin=document.createElement('button');pin.type='button';pin.className='globe-country-pin';pin.title=`${names.of(d.code)} — đã đến`;pin.setAttribute('aria-label',pin.title);pin.textContent='✓';pin.addEventListener('click',event=>{event.stopPropagation();onCountry(d.code);});return pin;})
    .htmlElementVisibilityModifier((element,visible)=>{element.style.visibility=visible?'visible':'hidden';element.style.pointerEvents=visible?'auto':'none';})
    .ringsData([]).ringColor(()=>t=>`rgba(255,203,97,${1-t})`).ringMaxRadius(4).ringPropagationSpeed(1).ringRepeatPeriod(1800);
  globe.pointOfView({lat:19,lng:107,altitude:2.25},0);
  const controls=globe.controls();controls.enablePan=false;controls.minDistance=125;controls.maxDistance=700;controls.autoRotateSpeed=.45;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  function refreshAnimation(){const playing=active&&visible&&!document.hidden;if(playing)globe.resumeAnimation();else globe.pauseAnimation();controls.autoRotate=autoRotate&&playing;}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refreshAnimation();},{rootMargin:'120px'});observer.observe(container);
  document.addEventListener('visibilitychange',refreshAnimation);
  const resize=new ResizeObserver(()=>{if(container.clientWidth){globe.width(container.clientWidth).height(container.clientHeight);}});resize.observe(container);
  globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  globe.renderer().domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();onFailure();});
  // Keep a usable colored globe even if the optional photographic texture fails.
  const textureCheck=new Image();textureCheck.onerror=()=>{globe.globeImageUrl(null);document.querySelector('#globe-feedback').textContent='Ảnh Trái Đất chưa tải được; vẫn có thể xoay và xem các nước trên địa cầu màu.';};textureCheck.src='/images/earth-blue-marble.jpg';
  return {
    update(codes){visited=new Set(codes);const points=[...visited].filter(c=>locations[c]).map(code=>({code,lat:locations[code].latlng[0],lng:locations[code].latlng[1]}));globe.htmlElementsData(points);globe.ringsData(motion.matches?[]:points);globe.polygonAltitude(globe.polygonAltitude()).polygonCapColor(globe.polygonCapColor()).polygonStrokeColor(globe.polygonStrokeColor());},
    focus(code){const [lat,lng]=locations[code].latlng;globe.pointOfView({lat,lng,altitude:1.65},motion.matches?0:700);},
    reset(){globe.pointOfView({lat:19,lng:107,altitude:2.25},motion.matches?0:600);},
    zoom(factor){const point=globe.pointOfView();globe.pointOfView({...point,altitude:Math.max(.6,Math.min(5,point.altitude*factor))},motion.matches?0:250);},
    rotate(){autoRotate=!autoRotate;refreshAnimation();return autoRotate;},
    activate(value){active=value;refreshAnimation();if(value&&container.clientWidth)globe.width(container.clientWidth).height(container.clientHeight);},
  };
}
