import Globe from 'globe.gl';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
export function createJourneySpace(container,{onFailure}){
  const mobile=matchMedia('(pointer: coarse)').matches;
  const vietnam=feature(world,world.objects.countries).features.filter(country=>Number(country.id)===704);
  const globe=new Globe(container,{rendererConfig:{alpha:true,antialias:!mobile,powerPreference:'low-power'},waitForGlobeReady:false})
    .backgroundColor('rgba(0,0,0,0)').globeImageUrl('/images/earth-blue-marble.jpg')
    .showAtmosphere(true).atmosphereColor('#80cfff').atmosphereAltitude(.16)
    .polygonsData(vietnam).polygonsTransitionDuration(0).polygonAltitude(.003)
    .polygonCapColor(()=>'rgba(103,220,163,.15)').polygonSideColor(()=>'rgba(0,0,0,0)').polygonStrokeColor(()=>'#d6ffb8');
  const controls=globe.controls();controls.enabled=false;controls.minDistance=100.5;controls.maxDistance=10000;
  const canvas=globe.renderer().domElement;
  globe.renderer().setPixelRatio(Math.min(devicePixelRatio||1,mobile?1:1.5));
  const size=()=>{if(container.clientWidth&&container.clientHeight){const w=container.clientWidth,h=container.clientHeight;globe.width(w).height(h).globeOffset(w<760?[w*.1,h*.14]:[w*.18,0])}};
  const observer=new ResizeObserver(size);observer.observe(container);size();
  let active=true,visible=true,destroyed=false;
  function play(){if(destroyed)return;if(active&&visible&&!document.hidden)globe.resumeAnimation();else globe.pauseAnimation()}
  const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;play()});visibility.observe(container);
  document.addEventListener('visibilitychange',play);
  function destroy(){
    if(destroyed)return;destroyed=true;observer.disconnect();visibility.disconnect();document.removeEventListener('visibilitychange',play);canvas.removeEventListener('webglcontextlost',lost);
    globe.pauseAnimation();controls.dispose();
    const resources=new Set();globe.scene().traverse(object=>{if(object.geometry)resources.add(object.geometry);for(const material of [object.material].flat().filter(Boolean)){resources.add(material);for(const value of Object.values(material))if(value?.isTexture)resources.add(value)}});
    resources.forEach(resource=>resource.dispose());globe.renderer().dispose();container.replaceChildren();
  }
  function lost(event){event.preventDefault();destroy();onFailure()}
  canvas.addEventListener('webglcontextlost',lost);
  return {update(camera){if(destroyed)return;globe.pointOfView({lat:camera.lat,lng:camera.lng,altitude:camera.altitude},0);container.dataset.altitude=String(camera.altitude)},activate(value){active=value;play()},destroy};
}
