import { vietnamPlaces } from './vietnam-places.js';
import { visitedPlaces } from './visited-places.js';
import { createVietnamMap } from './vietnam-map.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import locations from './country-locations.json';

const names = new Intl.DisplayNames(['vi'], {type:'region'});
const countryCodes = Object.keys(locations).filter(code => code !== 'VN').sort((a,b) => names.of(a).localeCompare(names.of(b),'vi'));
const numericCodes = Object.fromEntries(Object.entries(locations).map(([code,value]) => [Number(value.numeric),code]));
const worldFeatures = feature(world,world.objects.countries);
// Unwrap rings at ±180° so Leaflet does not draw a line across the globe.
function unwrapRing(ring) {
  const result=[];
  for(const [originalLongitude,latitude] of ring) {
    let longitude=originalLongitude;
    if(result.length) {
      const previous=result[result.length-1][0];
      while(longitude-previous>180) longitude-=360;
      while(longitude-previous< -180) longitude+=360;
    }
    result.push([longitude,latitude]);
  }
  return result;
}
worldFeatures.features=worldFeatures.features.filter(f=>f.properties.name!=='Antarctica');
for(const f of worldFeatures.features) {
  if(f.geometry.type==='Polygon') f.geometry.coordinates=f.geometry.coordinates.map(unwrapRing);
  if(f.geometry.type==='MultiPolygon') f.geometry.coordinates=f.geometry.coordinates.map(p=>p.map(unwrapRing));
}
let map, countryLayer, markers, globe, globePromise, vietnamMap;
let region='international';
let viewMode='globe';
let internationalView='globe';
let visited=new Set();
let ready=false;
let canEdit=false;
let vietnamMemories=0;
let selectedCode;
const palette=['#c0e9d9','#c5def5','#e0cef1','#f5dfb5','#f2cbd7','#d4e8ba'];
const markerIcon=L.divIcon({className:'visited-map-pin',html:'<svg viewBox="0 0 32 42" aria-hidden="true"><path d="M16 40S2 26 2 16a14 14 0 0 1 28 0c0 10-14 24-14 24Z" fill="#f2b63f" stroke="white" stroke-width="2"/><path d="m10 16 4 4 8-9" fill="none" stroke="#173e55" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',iconSize:[30,40],iconAnchor:[15,39],popupAnchor:[0,-32]});
const foreignCodes=()=>[...visited].filter(code=>code!=='VN');
function countryStyle(f) {
  const code=numericCodes[Number(f.id)];
  const marked=code!=='VN'&&visited.has(code);
  return {color:marked?'#b17d25':'#a7c5d1',weight:marked?1.2:.7,fillColor:marked?'#ffcb61':palette[Math.abs(Number(f.id)||0)%palette.length],fillOpacity:1};
}
function openJournal(code) {
  window.dispatchEvent(new CustomEvent('map:show-journal',{detail:{code}}));
  map.closePopup();document.querySelector('#globe-country-panel').hidden=true;
}
function popup(code) {
  const box=document.createElement('div');box.className='country-map-popup';
  const title=document.createElement('strong');title.textContent=names.of(code);box.append(title);
  const status=document.createElement('p');status.textContent=visited.has(code)?'✓ Chân đã ghé, chuyện còn đây.':'Chỗ này chưa ghim. Đôi chân có đang rục rịch không?';box.append(status);
  if(visited.has(code)) {
    if(visitedPlaces[code]?.length) {const places=document.createElement('p');places.className='visited-city-list';places.textContent=`Điểm đã ghé: ${visitedPlaces[code].join(' · ')}`;box.append(places);}
    const link=document.createElement('a');link.href='#my-journal';link.textContent=code==='VN'?'Xem nhật ký Việt Nam ↗':'Xem nhật ký quốc tế ↗';link.addEventListener('click',()=>openJournal(code));box.append(link);
  } else if(canEdit) {
    const button=document.createElement('button');button.type='button';button.textContent='Đánh dấu đã đến +';button.disabled=!ready;
    button.addEventListener('click',()=>{button.disabled=true;button.textContent='Đang lưu…';window.dispatchEvent(new CustomEvent('map:visit',{detail:{code}}));});box.append(button);
  }
  return box;
}
function showCountry(code,fly=true) {
  if(!locations[code]) return;
  if(code==='VN'&&region!=='vietnam')setRegion('vietnam');
  if(code!=='VN'&&region==='vietnam')setRegion('international');
  selectedCode=code;
  if(region==='vietnam') {vietnamMap.show(popup('VN'));return;}
  if(viewMode==='globe') {
    if(fly)globe?.focus(code);
    document.querySelector('#globe-country-content').replaceChildren(popup(code));
    document.querySelector('#globe-country-panel').hidden=false;return;
  }
  const position=locations[code].latlng;
  if(fly)map.setView(position,Math.max(map.getZoom(),3),{animate:false});
  L.popup({maxWidth:230}).setLatLng(position).setContent(popup(code)).openOn(map);
}
function refresh() {
  const domestic=region==='vietnam';
  const foreign=foreignCodes();
  document.querySelector('#map-country-count').textContent=domestic?vietnamPlaces.length:foreign.length;
  document.querySelector('#map-count-label').textContent=domestic?'địa điểm Việt Nam đã đến':'nước ngoài đã đến';
  document.querySelector('#map-country-select').disabled=!ready;
  document.querySelector('#map-country-form button').disabled=!ready;
  document.querySelector('#vietnam-write-memory').disabled=!ready||!canEdit;
  document.querySelector('#vietnam-write-memory').hidden=!domestic||!canEdit;
  const status=document.querySelector('#map-status');
  if(!ready)status.textContent='Đang mở nhật ký trên trình duyệt này…';
  else if(domestic)status.textContent=`${vietnamPlaces.length} địa điểm đã ghé · ${vietnamMemories} kỷ niệm được lưu. Bấm cụm ghim để phóng to hoặc chọn tên địa điểm.`;
  else status.textContent=foreign.length?`${foreign.length} nước ngoài đã ghé. Chạm ghim để khui chuyện.`:'Chưa có dấu chân quốc tế. Chọn một nước đã đến để ghim kỷ niệm nhé.';
  countryLayer.setStyle(countryStyle);markers.clearLayers();
  foreign.forEach(code=>{if(!locations[code])return;const marker=L.marker(locations[code].latlng,{icon:markerIcon,title:`${names.of(code)} — đã đến`,alt:`${names.of(code)} — đã đến`,keyboard:true}).addTo(markers);marker.on('click',()=>showCountry(code,false));});
  globe?.update(foreign);
  vietnamMap?.update(visited.has('VN'));
  if(selectedCode) {
    if(domestic)vietnamMap.show(popup('VN'));
    else if(viewMode==='globe'||map._popup)showCountry(selectedCode,false);
  }
}
function resetMap() {
  selectedCode=null;map.closePopup();document.querySelector('#globe-country-panel').hidden=true;
  if(region==='vietnam'){vietnamMap?.reset();return;}
  globe?.reset();map.fitBounds([[-55,-175],[75,180]],{padding:[12,12],animate:false});
}
async function switchView(mode) {
  if(region==='vietnam')return;
  viewMode=mode;internationalView=mode;
  document.querySelector('#globe-stage').hidden=mode!=='globe';
  document.querySelector('#world-map').hidden=mode!=='flat';
  document.querySelector('#show-globe').setAttribute('aria-pressed',String(mode==='globe'));
  document.querySelector('#show-flat-map').setAttribute('aria-pressed',String(mode==='flat'));
  globe?.activate(mode==='globe');
  if(mode==='flat'){map.invalidateSize({pan:false});resetMap();return;}
  try {
    if(!globePromise)globePromise=import('./globe-view.js').then(module=>module.createGlobe(document.querySelector('#globe-canvas'),{onCountry:code=>showCountry(code),onFailure:()=>{internationalView='flat';if(region==='international'){switchView('flat');document.querySelector('#map-status').textContent='Thiết bị không giữ được chế độ 3D. Đã chuyển sang bản đồ 2D.';}}}));
    globe=await globePromise;globe.update(foreignCodes());globe.activate(region==='international'&&viewMode==='globe');
    if(selectedCode&&region==='international'&&viewMode==='globe')globe.focus(selectedCode);
    document.querySelector('#globe-feedback').textContent='Màu vàng là những nước ngoài Đôn đã ghé. Xoay một vòng, hóng cả thế giới.';
  } catch {
    globePromise=null;internationalView='flat';
    if(region==='international'){switchView('flat');document.querySelector('#map-status').textContent='Trình duyệt chưa hỗ trợ địa cầu 3D. Bản đồ quốc tế 2D vẫn xem và đánh dấu bình thường.';}
  }
}
function setRegion(nextRegion) {
  region=nextRegion;selectedCode=null;map.closePopup();
  const domestic=region==='vietnam';
  document.querySelector('.travel-map-hero').dataset.region=region;
  document.querySelectorAll('[data-map-region]').forEach(control=>{const selected=control.dataset.mapRegion===region;control.classList.toggle('active',selected);if(control.tagName==='BUTTON')control.setAttribute('aria-pressed',String(selected));});
  document.querySelector('#map-heading').innerHTML=domestic?'Đi dọc chữ S.<br><em>Đởn khắp quê mình.</em>':'Đôn đi đây.<br><em>Đú đởn khắp nơi.</em>';
  document.querySelector('#map-region-intro').textContent=domestic?'Chưa cần bay xa. Đi quanh nhà, gom cả rổ chuyện.':'Bản đồ có ghim, Đôn có chuyện. Chấm một nước, khui một kỷ niệm.';
  document.querySelector('#international-map-views').hidden=domestic;
  document.querySelector('#map-country-form').hidden=domestic;
  document.querySelector('#vietnam-write-memory').hidden=!domestic||!canEdit;
  document.querySelector('#vietnam-stage').hidden=!domestic;
  document.querySelector('#vietnam-place-directory').hidden=!domestic;
  document.querySelector('#globe-country-panel').hidden=true;
  document.querySelector('#map-reset').textContent=domestic?'Toàn Việt Nam':'Toàn thế giới';
  document.querySelector('#map-location-note').textContent=domestic?'Ghim đã đến theo tên bạn cung cấp · Vị trí đại diện địa danh':'Màu vàng & ghim ✓: đã đến · Vị trí đại diện quốc gia';
  document.querySelector('#map-help-text').textContent=domestic?'Đôn đã ghé 20 nơi ở Việt Nam. Chọn tên bên dưới để tìm ghim; địa danh giữ theo tên bạn cung cấp, không phải danh sách đơn vị hành chính hiện hành.':'Chọn một nước ngoài để đánh dấu đã đến. Danh sách quốc tế không tính Việt Nam; dữ liệu lấy từ nhật ký trên trình duyệt này.';
  if(domestic) {
    document.querySelector('#globe-stage').hidden=true;document.querySelector('#world-map').hidden=true;globe?.activate(false);
    if(!vietnamMap)vietnamMap=createVietnamMap(document.querySelector('#vietnam-map'),{onCountry:()=>showCountry('VN',false),onPlace:()=>{selectedCode=null;}});
    vietnamMap.activate();document.querySelector('#vietnam-map-loading').hidden=true;
  } else switchView(internationalView);
  refresh();
  window.dispatchEvent(new CustomEvent('travel:region',{detail:{region}}));
}
export function mountWorldMap() {
  const select=document.querySelector('#map-country-select');
  countryCodes.forEach(code=>{const option=document.createElement('option');option.value=code;option.textContent=names.of(code);select.append(option);});
  map=L.map('world-map',{fadeAnimation:false,center:[18,15],zoom:1.5,minZoom:0,maxZoom:6,zoomSnap:.25,scrollWheelZoom:false,worldCopyJump:false,maxBounds:[[-85,-210],[85,210]],maxBoundsViscosity:.8});
  map.attributionControl.setPrefix(false);map.attributionControl.addAttribution('Bản đồ: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a> · Vị trí: <a href="https://github.com/mledoze/countries" target="_blank" rel="noopener noreferrer">Countries</a>');
  countryLayer=L.geoJSON(worldFeatures,{style:countryStyle,onEachFeature(f,layer){const code=numericCodes[Number(f.id)];if(code){layer.on('click',()=>showCountry(code,false));layer.on('mouseover',()=>layer.setStyle({weight:1.5,color:'#087cbd'}));layer.on('mouseout',()=>countryLayer.resetStyle(layer));}}}).addTo(map);
  markers=L.layerGroup().addTo(map);
  map.zoomControl._zoomInButton.setAttribute('aria-label','Phóng to bản đồ quốc tế');map.zoomControl._zoomOutButton.setAttribute('aria-label','Thu nhỏ bản đồ quốc tế');
  document.querySelector('#map-reset').addEventListener('click',resetMap);
  document.querySelector('#map-country-form').addEventListener('submit',event=>{event.preventDefault();if(select.value)showCountry(select.value);});
  document.querySelector('#map-journal-link').addEventListener('click',()=>window.dispatchEvent(new CustomEvent('travel:region',{detail:{region}})));
  document.querySelector('#vietnam-map-journal').addEventListener('click',()=>openJournal('VN'));
  document.querySelector('#vietnam-write-memory').addEventListener('click',()=>window.dispatchEvent(new Event('map:write-vietnam')));
  document.querySelectorAll('[data-map-region]').forEach(control=>control.addEventListener('click',()=>setRegion(control.dataset.mapRegion)));
  document.querySelectorAll('[data-vietnam-place]').forEach(button=>button.addEventListener('click',()=>{if(region!=='vietnam')setRegion('vietnam');vietnamMap.focusPlace(button.dataset.vietnamPlace);}));
  document.querySelector('#show-globe').addEventListener('click',()=>switchView('globe'));
  document.querySelector('#show-flat-map').addEventListener('click',()=>switchView('flat'));
  document.querySelector('#globe-zoom-in').addEventListener('click',()=>globe?.zoom(.8));document.querySelector('#globe-zoom-out').addEventListener('click',()=>globe?.zoom(1.25));
  document.querySelector('#globe-rotate').addEventListener('click',event=>{const rotating=globe?.rotate()||false;event.currentTarget.setAttribute('aria-pressed',String(rotating));event.currentTarget.textContent=rotating?'Dừng xoay':'Tự xoay';});
  document.querySelector('.globe-panel-close').addEventListener('click',()=>{document.querySelector('#globe-country-panel').hidden=true;selectedCode=null;});
  window.addEventListener('journal:updated',event=>{visited=new Set(event.detail.countries);if(vietnamPlaces.length)visited.add('VN');ready=event.detail.ready;canEdit=Boolean(event.detail.canEdit);vietnamMemories=event.detail.vietnamMemories||0;refresh();});
  window.addEventListener('journal:save-error',()=>{if(selectedCode)showCountry(selectedCode,false);document.querySelector('#map-status').textContent='Chưa lưu được dấu chân. Kiểm tra quyền hoặc dung lượng lưu trữ trong nhật ký.';});
  new ResizeObserver(()=>map.invalidateSize({pan:false})).observe(document.querySelector('#world-map'));
  setRegion('international');
}
