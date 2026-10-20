import { visitedPlaces } from './visited-places.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import locations from './country-locations.json';

const names = new Intl.DisplayNames(['vi'], { type: 'region' });
const countryCodes = Object.keys(locations).sort((a,b) => names.of(a).localeCompare(names.of(b),'vi'));
const numericCodes = Object.fromEntries(countryCodes.map(code => [Number(locations[code].numeric),code]));
// Leaflet does not split rings at the antimeridian. Unwrap adjacent vertices
// so an island crossing ±180° does not draw a line across the whole world.
const worldFeatures = feature(world, world.objects.countries);
function unwrapRing(ring) {
  const result = [];
  for (const [originalLongitude, latitude] of ring) {
    let longitude = originalLongitude;
    if (result.length) {
      const previous = result[result.length - 1][0];
      while (longitude - previous > 180) longitude -= 360;
      while (longitude - previous < -180) longitude += 360;
    }
    result.push([longitude, latitude]);
  }
  return result;
}
worldFeatures.features = worldFeatures.features.filter(f => f.properties.name !== 'Antarctica');
for (const f of worldFeatures.features) {
  if (f.geometry.type === 'Polygon') f.geometry.coordinates = f.geometry.coordinates.map(unwrapRing);
  if (f.geometry.type === 'MultiPolygon') f.geometry.coordinates = f.geometry.coordinates.map(p => p.map(unwrapRing));
}
let map;
let countryLayer;
let markers;
let visited = new Set();
let ready = false;
let selectedCode;
let globe;
let viewMode = 'globe';
let globePromise;
const mapPalette = ['#c0e9d9','#c5def5','#e0cef1','#f5dfb5','#f2cbd7','#d4e8ba'];
const markerIcon = L.divIcon({className:'visited-map-pin',html:'<svg viewBox="0 0 32 42" aria-hidden="true"><path d="M16 40S2 26 2 16a14 14 0 0 1 28 0c0 10-14 24-14 24Z" fill="#f2b63f" stroke="white" stroke-width="2"/><path d="m10 16 4 4 8-9" fill="none" stroke="#173e55" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',iconSize:[30,40],iconAnchor:[15,39],popupAnchor:[0,-32]});
function countryStyle(f) {
  const code = numericCodes[Number(f.id)];
  return {color:visited.has(code)?'#b17d25':'#a7c5d1',weight:visited.has(code)?1.2:.7,fillColor:visited.has(code)?'#ffcb61':mapPalette[Math.abs(Number(f.id)||0)%mapPalette.length],fillOpacity:1};
}
function popup(code) {
  const box = document.createElement('div'); box.className='country-map-popup';
  const title = document.createElement('strong'); title.textContent=names.of(code); box.append(title);
  const status = document.createElement('p'); status.textContent=visited.has(code)?'✓ Chân đã ghé, chuyện còn đây.':'Chỗ này chưa ghim. Đôi chân có đang rục rịch không?'; box.append(status);
  if(visited.has(code)) {
    if(visitedPlaces[code]?.length) { const places=document.createElement('p'); places.className='visited-city-list'; places.textContent=`Điểm đã ghé: ${visitedPlaces[code].join(' · ')}`; box.append(places); }
    const link=document.createElement('a'); link.href='#my-journal'; link.textContent='Xem nhật ký của tôi ↗'; link.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('map:show-journal',{detail:{code}}));map.closePopup();document.querySelector('#globe-country-panel').hidden=true;}); box.append(link);
  } else {
    const button=document.createElement('button'); button.type='button'; button.textContent='Đánh dấu đã đến +'; button.disabled=!ready;
    button.addEventListener('click',()=>{button.disabled=true;button.textContent='Đang lưu…';window.dispatchEvent(new CustomEvent('map:visit',{detail:{code}}));}); box.append(button);
  }
  return box;
}
function showCountry(code, fly = true) {
  if(!locations[code]) return;
  selectedCode=code;
  if(viewMode==='globe') {
    if(fly) globe?.focus(code);
    document.querySelector('#globe-country-content').replaceChildren(popup(code));
    document.querySelector('#globe-country-panel').hidden=false;
    return;
  }
  const latlng=locations[code].latlng;
  if(fly) map.setView(latlng, Math.max(map.getZoom(),3), {animate:false});
  L.popup({maxWidth:230}).setLatLng(latlng).setContent(popup(code)).openOn(map);
}
export function mountWorldMap() {
  const select=document.querySelector('#map-country-select');
  countryCodes.forEach(code=>{const option=document.createElement('option');option.value=code;option.textContent=names.of(code);select.append(option);});
  map=L.map('world-map',{fadeAnimation:false,center:[18,15],zoom:1.5,minZoom:0,maxZoom:6,zoomSnap:.25,scrollWheelZoom:false,worldCopyJump:false,maxBounds:[[-85,-210],[85,210]],maxBoundsViscosity:.8,attributionControl:true});
  map.attributionControl.setPrefix(false);
  map.attributionControl.addAttribution('Bản đồ: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a> · Vị trí: <a href="https://github.com/mledoze/countries" target="_blank" rel="noopener noreferrer">Countries</a>');
  countryLayer=L.geoJSON(worldFeatures,{style:countryStyle,onEachFeature(f,layer){const code=numericCodes[Number(f.id)];if(code) {layer.on('click',()=>showCountry(code,false));layer.on('mouseover',()=>layer.setStyle({weight:1.5,color:'#087cbd'}));layer.on('mouseout',()=>countryLayer.resetStyle(layer));}}}).addTo(map);
  markers=L.layerGroup().addTo(map);
  map.zoomControl._zoomInButton.setAttribute('aria-label','Phóng to bản đồ');
  map.zoomControl._zoomOutButton.setAttribute('aria-label','Thu nhỏ bản đồ');
  function resetMap(){map.closePopup();selectedCode=null;document.querySelector('#globe-country-panel').hidden=true;globe?.reset();map.fitBounds([[-55,-175],[75,180]],{padding:[12,12],animate:false});}
  resetMap();
  document.querySelector('#map-reset').addEventListener('click',resetMap);
  document.querySelector('#map-country-form').addEventListener('submit',event=>{event.preventDefault();if(select.value)showCountry(select.value);});
  window.addEventListener('journal:updated',event=>{
    const details=event.detail;visited=new Set(details.countries);ready=details.ready;
    select.disabled=!ready;document.querySelector('#map-country-form button').disabled=!ready;
    document.querySelector('#map-country-count').textContent=[...visited].filter(c=>c!=='VN').length;
    const status=document.querySelector('#map-status');
    status.textContent=!ready?'Nhật ký chưa sẵn sàng. Kiểm tra thông báo trong mục Nhật ký của tôi.':visited.size?`${visited.size} ghim đã lưu${visited.has('VN')?' · Bao gồm Việt Nam':''}. Chọn ghim để xem quốc gia.`:'Bản đồ còn trống, Đôn đâu chịu ngồi yên. Chọn nước đã đến để ghim kỷ niệm nhé.';
    countryLayer.setStyle(countryStyle);markers.clearLayers();
    [...visited].forEach(code=>{if(!locations[code])return;const marker=L.marker(locations[code].latlng,{icon:markerIcon,title:`${names.of(code)} — đã đến`,alt:`${names.of(code)} — đã đến`,keyboard:true}).addTo(markers);marker.on('click',()=>showCountry(code,false));});
    globe?.update([...visited]);
    if(selectedCode && (viewMode==='globe'||map._popup))showCountry(selectedCode,false);
  });
  window.addEventListener('journal:save-error',()=>{if(selectedCode)showCountry(selectedCode,false);document.querySelector('#map-status').textContent='Chưa lưu được dấu chân. Kiểm tra quyền hoặc dung lượng lưu trữ trong mục nhật ký.';});
  new ResizeObserver(()=>map.invalidateSize({pan:false})).observe(document.querySelector('#world-map'));
  const globeStage=document.querySelector('#globe-stage');
  const flatStage=document.querySelector('#world-map');
  async function switchView(mode) {
    viewMode=mode;
    globeStage.hidden=mode!=='globe';flatStage.hidden=mode!=='flat';
    document.querySelector('#show-globe').setAttribute('aria-pressed',String(mode==='globe'));
    document.querySelector('#show-flat-map').setAttribute('aria-pressed',String(mode==='flat'));
    globe?.activate(mode==='globe');
    if(mode==='flat'){map.invalidateSize({pan:false});resetMap();return;}
    try {
      if(!globePromise) globePromise=import('./globe-view.js').then(module=>module.createGlobe(document.querySelector('#globe-canvas'),{onCountry:code=>showCountry(code),onFailure:()=>{switchView('flat');document.querySelector('#map-status').textContent='Thiết bị không giữ được chế độ 3D. Đã chuyển sang bản đồ 2D.';}}));
      globe=await globePromise;globe.update([...visited]);globe.activate(viewMode==='globe');
      document.querySelector('#globe-feedback').textContent='Màu vàng là nơi Đôn đã ghé. Xoay một vòng, hóng cả thế giới.';
    } catch {
      globePromise=null;
      switchView('flat');document.querySelector('#map-status').textContent='Trình duyệt chưa hỗ trợ địa cầu 3D. Bản đồ 2D vẫn xem và đánh dấu bình thường.';
    }
  }
  document.querySelector('#show-globe').addEventListener('click',()=>switchView('globe'));
  document.querySelector('#show-flat-map').addEventListener('click',()=>switchView('flat'));
  document.querySelector('#globe-zoom-in').addEventListener('click',()=>globe?.zoom(.8));
  document.querySelector('#globe-zoom-out').addEventListener('click',()=>globe?.zoom(1.25));
  document.querySelector('#globe-rotate').addEventListener('click',event=>{const rotating=globe?.rotate()||false;event.currentTarget.setAttribute('aria-pressed',String(rotating));event.currentTarget.textContent=rotating?'Dừng xoay':'Tự xoay';});
  document.querySelector('.globe-panel-close').addEventListener('click',()=>{document.querySelector('#globe-country-panel').hidden=true;selectedCode=null;});
  switchView('globe');
}
