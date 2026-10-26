import {loadInternationalRegions,regionHasVisit,regionColor,regionPlaces,visitedRegions} from './international-regions.js';
import { internationalPlaces, internationalMapPoints, confirmedForeignCountries } from './international-places.js';
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
const section=document.body.dataset.section;
let region=section||'international';
let viewMode='globe';
let internationalView='globe';
let visited=new Set();
let articleCountries=[];
let ready=false;
let canEdit=false;
let vietnamMemories=0;
let selectedCode, selectedPlace, selectedRegion;
let internationalRegions=[], regionLayer;
const markerIcon=L.divIcon({className:'visited-map-pin',html:'<svg viewBox="0 0 32 42" aria-hidden="true"><path d="M16 40S2 26 2 16a14 14 0 0 1 28 0c0 10-14 24-14 24Z" fill="#f2b63f" stroke="white" stroke-width="2"/><path d="m10 16 4 4 8-9" fill="none" stroke="#173e55" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',iconSize:[30,40],iconAnchor:[15,39],popupAnchor:[0,-32]});
const foreignCodes=()=>confirmedForeignCountries([...visited],articleCountries);
function countryStyle(f) {
  // Visit highlights belong to recorded regions, never a whole country.
  return {color:'#a7c5d1',weight:.7,fillColor:'#e6f0f3',fillOpacity:1};
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
    if(code!=='VN'&&internationalPlaces.some(p=>p.code===code)) {const list=document.createElement('div');list.className='country-city-buttons';internationalPlaces.filter(p=>p.code===code).forEach(place=>{const button=document.createElement('button');button.type='button';button.dataset.cityFocus=place.id;button.textContent=place.name;button.addEventListener('click',()=>showInternationalPlace(place.id));list.append(button);});box.append(list);}
    else if(visitedPlaces[code]?.length) {const places=document.createElement('p');places.className='visited-city-list';places.textContent=`Điểm đã ghé: ${visitedPlaces[code].join(' · ')}`;box.append(places);}
    if(code!=='VN'&&articleCountries.includes(code)&&!internationalPlaces.some(p=>p.code===code)){const note=document.createElement('p');note.textContent='Có bài viết về nước này. Ghim là vị trí đại diện quốc gia, chưa phải địa điểm chuyến đi cụ thể.';box.append(note);}
    const link=document.createElement('a');link.href='#my-journal';link.textContent=code==='VN'?'Xem nhật ký Việt Nam ↗':'Xem nhật ký quốc tế ↗';link.addEventListener('click',()=>openJournal(code));box.append(link);
  } else if(canEdit) {
    const button=document.createElement('button');button.type='button';button.textContent='Đánh dấu đã đến +';button.disabled=!ready;
    button.addEventListener('click',()=>{button.disabled=true;button.textContent='Đang lưu…';window.dispatchEvent(new CustomEvent('map:visit',{detail:{code}}));});box.append(button);
  }
  return box;
}
function regionStyle(f){return {className:'international-region-shape',color:regionHasVisit(f,visited)?'#f4fffa':'#cbe2e8',weight:regionHasVisit(f,visited)?1.8:.7,fillColor:regionColor(f),fillOpacity:regionHasVisit(f,visited)?.95:.5};}
function appendRegionArea(box,feature){
  const area=document.createElement('p');area.className='region-area';
  area.textContent=`Diện tích theo ranh giới bản đồ: ≈ ${new Intl.NumberFormat('vi-VN').format(feature.properties.areaKm2)} km²`;
  const label=document.createElement('small');label.textContent=`Phạm vi: ${feature.properties.name}. ${feature.properties.code==='SG'?'Đường bao quốc gia gồm vùng nước ven bờ theo nguồn bản đồ. ':''}Số liệu ước tính từ hình học bản đồ.`;
  box.append(area,label);
}
function showInternationalRegion(feature,fly=true){
  if(!regionHasVisit(feature,visited))return;
  if(region==='vietnam')setRegion('international');
  selectedRegion=feature;selectedPlace=null;selectedCode=feature.properties.code;
  const p=feature.properties;
  const box=document.createElement('div');box.className='country-map-popup international-region-popup';
  const title=document.createElement('strong');title.textContent=p.name;box.append(title);
  const country=document.createElement('p');country.textContent=`${names.of(p.code)} · ${p.level==='country'?'Toàn quốc':p.level==='city'?'Thành phố':p.level==='prefecture'?'Địa cấp thuộc Vân Nam':'Tỉnh/bang/khu vực'}`;box.append(country);
  appendRegionArea(box,feature);
  const places=regionPlaces(feature,visited,internationalPlaces);
  const note=document.createElement('p');note.textContent=places.length?'Có dấu chân của Đôn tại:':'Chưa ghi nhận điểm ghé cụ thể trong vùng này.';box.append(note);
  const list=document.createElement('div');list.className='country-city-buttons';
  places.forEach(place=>{const button=document.createElement('button');button.type='button';button.textContent=place.name;button.dataset.cityFocus=place.id;button.addEventListener('click',()=>showInternationalPlace(place.id));list.append(button);});box.append(list);
  document.querySelector('#international-region-select').value=p.regionId;
  if(viewMode==='globe'){
    if(fly)globe?.focusRegion(feature);
    document.querySelector('#globe-country-content').replaceChildren(box);document.querySelector('#globe-country-panel').hidden=false;
  }else{
    if(fly)map.fitBounds(L.geoJSON(feature).getBounds(),{padding:[40,40],maxZoom:8,animate:false});
    L.popup({maxWidth:250}).setLatLng(p.center).setContent(box).openOn(map);
  }
}
function refreshRegionOverlays(){
  if(!regionLayer)return;
  const shown=visitedRegions(internationalRegions,visited);
  regionLayer.clearLayers().addData({type:'FeatureCollection',features:shown});
  const select=document.querySelector('#international-region-select'),current=select.value;
  select.replaceChildren(new Option('Chọn một vùng Đôn đã ghé…',''));
  for(const code of [...new Set(shown.map(f=>f.properties.code))]){
    const group=document.createElement('optgroup');group.label=names.of(code);
    shown.filter(f=>f.properties.code===code).sort((a,b)=>a.properties.name.localeCompare(b.properties.name,'vi')).forEach(f=>group.append(new Option(f.properties.name,f.properties.regionId)));select.append(group);
  }
  select.disabled=!shown.length;
  select.value=shown.some(f=>f.properties.regionId===current)?current:'';
  document.querySelector('#international-region-status').textContent=`${shown.length} mảng màu có điểm Đôn đã ghé · Chỉ hiện nơi đã đi, phần còn lại giữ nền tự nhiên · Ghim vàng: địa điểm.`;
}
async function mountInternationalRegions(){
  const status=document.querySelector('#international-region-status');
  try{
    internationalRegions=await loadInternationalRegions();
    regionLayer=L.geoJSON(null,{style:regionStyle,onEachFeature(f,layer){layer.bindTooltip(`${f.properties.name} · ${names.of(f.properties.code)}`);layer.on('click',()=>showInternationalRegion(f,false));}}).addTo(map);
    refreshRegionOverlays();
    const select=document.querySelector('#international-region-select');
    select.addEventListener('change',()=>{const f=internationalRegions.find(f=>f.properties.regionId===select.value);if(f)showInternationalRegion(f);});
  }catch{status.textContent='Chưa tải được ranh giới vùng. Bạn vẫn có thể chọn ghim thành phố; hãy tải lại trang để thử lại.';}
}
function showInternationalPlace(id,fly=true) {
  const place=internationalPlaces.find(p=>p.id===id);
  if(!place||!visited.has(place.code))return;
  if(region==='vietnam')setRegion('international');
  selectedPlace=place;selectedRegion=null;selectedCode=place.code;
  const boundary=internationalRegions.find(f=>f.properties.placeIds.includes(place.id));
  document.querySelector('#international-region-select').value=boundary?.properties.regionId||'';
  const box=document.createElement('div');box.className='country-map-popup international-place-popup';
  const title=document.createElement('strong');title.textContent=place.name;box.append(title);
  const country=document.createElement('p');country.textContent=`${names.of(place.code)} · Đôn đã ghé ✓`;box.append(country);
  if(boundary)appendRegionArea(box,boundary);
  const note=document.createElement('p');note.textContent=place.kind==='area'?'Vị trí đại diện khu vực Fuji.':'Vị trí đại diện thành phố, không phải tọa độ từng bức ảnh.';box.append(note);
  const link=document.createElement('a');link.href='#my-journal';link.textContent='Khui nhật ký nước này ↗';link.addEventListener('click',()=>openJournal(place.code));box.append(link);
  if(viewMode==='globe') {
    if(fly)globe?.focusPlace(place);
    document.querySelector('#globe-country-content').replaceChildren(box);
    document.querySelector('#globe-country-panel').hidden=false;
  } else {
    if(fly){if(boundary)map.fitBounds(boundary.properties.bounds,{padding:[40,40],maxZoom:12,animate:false});else map.setView([place.lat,place.lng],7,{animate:false});}
    L.popup({maxWidth:250}).setLatLng([place.lat,place.lng]).setContent(box).openOn(map);
  }
}
function showCountry(code,fly=true) {
  if(section&&((code==='VN')!==(section==='vietnam'))){location.assign(code==='VN'?'/viet-nam/':'/the-gioi/');return;}
  if(!locations[code]) return;
  if(code==='VN'&&region!=='vietnam')setRegion('vietnam');
  if(code!=='VN'&&region==='vietnam')setRegion('international');
  selectedCode=code;selectedPlace=null;selectedRegion=null;
  if(region==='vietnam') {vietnamMap.show(popup('VN'));return;}
  if(viewMode==='globe') {
    if(fly)globe?.focus(code);
    document.querySelector('#globe-country-content').replaceChildren(popup(code));
    document.querySelector('#globe-country-panel').hidden=false;return;
  }
  const position=locations[code].latlng;
  if(fly){const regions=visitedRegions(internationalRegions,visited).filter(f=>f.properties.code===code);if(regions.length)map.fitBounds(L.geoJSON({type:'FeatureCollection',features:regions}).getBounds(),{padding:[40,40],maxZoom:12,animate:false});else map.setView(position,Math.max(map.getZoom(),3),{animate:false});}
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
  countryLayer.setStyle(countryStyle);refreshRegionOverlays();markers.clearLayers();
  internationalMapPoints(foreign,locations).forEach(place=>{const marker=L.marker([place.lat,place.lng],{icon:markerIcon,title:place.kind==='country'?`${place.name} · Có bài viết · Vị trí đại diện quốc gia`:`${place.name} · ${names.of(place.code)}`,alt:place.name,keyboard:true}).addTo(markers);marker.on('click',()=>place.kind==='country'?showCountry(place.code,false):showInternationalPlace(place.id,false));});
  document.querySelectorAll('[data-destination-country]').forEach(group=>{group.hidden=!visited.has(group.dataset.destinationCountry);});
  globe?.update(foreign,articleCountries);
  vietnamMap?.update(visited.has('VN'));
  if(selectedCode) {
    if(domestic)vietnamMap.show(popup('VN'));
    else if(viewMode==='globe'||map._popup) {if(selectedRegion&&regionHasVisit(selectedRegion,visited))showInternationalRegion(selectedRegion,false);else if(selectedPlace&&visited.has(selectedPlace.code))showInternationalPlace(selectedPlace.id,false);else showCountry(selectedCode,false);}
  }
}
function resetMap() {
  selectedCode=null;selectedPlace=null;selectedRegion=null;document.querySelector('#international-region-select').value='';map.closePopup();document.querySelector('#globe-country-panel').hidden=true;
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
    if(!globePromise)globePromise=import('./globe-view.js').then(module=>module.createGlobe(document.querySelector('#globe-canvas'),{onCountry:code=>showCountry(code),onPlace:place=>showInternationalPlace(place.id),onRegion:feature=>showInternationalRegion(feature),onFailure:()=>{globe=null;globePromise=null;internationalView='flat';if(region==='international'){switchView('flat');document.querySelector('#map-status').textContent='Thiết bị vừa ngắt đồ họa 3D. Bản đồ 2D vẫn dùng được; bấm Địa cầu 3D để thử lại, hoặc mở trang bằng Safari/Chrome.';}}}));
    globe=await globePromise;globe.update(foreignCodes(),articleCountries);globe.activate(region==='international'&&viewMode==='globe');
    if(selectedCode&&region==='international'&&viewMode==='globe'){if(selectedRegion)globe.focusRegion(selectedRegion);else if(selectedPlace)globe.focusPlace(selectedPlace);else globe.focus(selectedCode);}
    document.querySelector('#globe-feedback').textContent='Thu nhỏ xem tên nước · Phóng gần xem địa điểm đã ghé. Bấm tên nước để khám phá từng điểm.';
  } catch {
    globe?.destroy();globe=null;document.querySelector('#globe-canvas').replaceChildren();
    globePromise=null;internationalView='flat';
    if(region==='international'){switchView('flat');document.querySelector('#map-status').textContent='Chưa mở được địa cầu 3D. Thử mở trang trực tiếp bằng Safari/Chrome, rồi bấm Địa cầu 3D để thử lại. Bản đồ 2D vẫn xem được.';}
  }
}
function setRegion(nextRegion) {
  if(section&&nextRegion!==section){location.assign(nextRegion==='vietnam'?'/viet-nam/':'/the-gioi/');return;}
  region=nextRegion;selectedCode=null;selectedPlace=null;selectedRegion=null;map.closePopup();
  const domestic=region==='vietnam';
  document.querySelector('.travel-map-hero').dataset.region=region;
  document.querySelectorAll('[data-map-region]').forEach(control=>{const selected=control.dataset.mapRegion===region;control.classList.toggle('active',selected);if(control.tagName==='BUTTON')control.setAttribute('aria-pressed',String(selected));});
  document.querySelector('#map-heading').innerHTML=domestic?'Việt Nam của Đôn.<br><em>Đởn khắp quê mình.</em>':'Thế giới của Đôn.<br><em>Đú đởn khắp nơi.</em>';
  document.querySelector('#map-region-intro').textContent=domestic?'Chưa cần bay xa. Đi quanh nhà, gom cả rổ chuyện.':'Bản đồ có ghim, Đôn có chuyện. Chấm một nước, khui một kỷ niệm.';
  document.querySelector('#international-map-views').hidden=domestic;
  document.querySelector('#map-country-form').hidden=domestic;
  document.querySelector('#vietnam-write-memory').hidden=!domestic||!canEdit;
  document.querySelector('#vietnam-stage').hidden=!domestic;
  document.querySelector('#vietnam-place-directory').hidden=!domestic;
  document.querySelector('#international-place-directory').hidden=domestic;
  document.querySelector('.map-photo-preview').hidden=domestic;
  document.querySelector('#vietnam-province-controls').hidden=!domestic;
  document.querySelector('#globe-country-panel').hidden=true;
  document.querySelector('#map-reset').textContent=domestic?'Toàn Việt Nam':'Toàn thế giới';
  document.querySelector('#map-location-note').textContent=domestic?'Ghim đã đến theo tên bạn cung cấp · Vị trí đại diện địa danh':'Các mảng màu: tỉnh/bang/khu vực · Ghim vàng: điểm đã ghé';
  document.querySelector('#map-help-text').textContent=domestic?'Đôn đã ghé 20 nơi ở Việt Nam. Chọn tên bên dưới để tìm ghim; địa danh giữ theo tên bạn cung cấp, không phải danh sách đơn vị hành chính hiện hành.':'Chọn một nước ngoài để đánh dấu đã đến. Danh sách quốc tế không tính Việt Nam; dữ liệu lấy từ nhật ký trên trình duyệt này.';
  if(domestic) {
    document.querySelector('#globe-stage').hidden=true;document.querySelector('#world-map').hidden=true;globe?.activate(false);
    if(!vietnamMap)vietnamMap=createVietnamMap(document.querySelector('#vietnam-map'),{onCountry:()=>showCountry('VN',false),onPlace:()=>{selectedCode=null;selectedPlace=null;selectedRegion=null;}});
    vietnamMap.activate();document.querySelector('#vietnam-map-loading').hidden=true;
  } else switchView(internationalView);
  refresh();
  window.dispatchEvent(new CustomEvent('travel:region',{detail:{region}}));
}
export function mountWorldMap({initialRegion='international'}={}) {
  const select=document.querySelector('#map-country-select');
  countryCodes.forEach(code=>{const option=document.createElement('option');option.value=code;option.textContent=names.of(code);select.append(option);});
  map=L.map('world-map',{fadeAnimation:false,center:[18,15],zoom:1.5,minZoom:0,maxZoom:13,zoomSnap:.25,scrollWheelZoom:false,worldCopyJump:false,maxBounds:[[-85,-210],[85,210]],maxBoundsViscosity:.8});
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
  document.querySelectorAll('[data-international-place]').forEach(button=>button.addEventListener('click',()=>showInternationalPlace(button.dataset.internationalPlace)));
  document.querySelector('#show-globe').addEventListener('click',()=>switchView('globe'));
  document.querySelector('#show-flat-map').addEventListener('click',()=>switchView('flat'));
  document.querySelector('#globe-zoom-in').addEventListener('click',()=>globe?.zoom(.8));document.querySelector('#globe-zoom-out').addEventListener('click',()=>globe?.zoom(1.25));
  document.querySelector('#globe-rotate').addEventListener('click',event=>{const rotating=globe?.rotate()||false;event.currentTarget.setAttribute('aria-pressed',String(rotating));event.currentTarget.textContent=rotating?'Dừng xoay':'Tự xoay';});
  document.querySelector('.globe-panel-close').addEventListener('click',()=>{document.querySelector('#globe-country-panel').hidden=true;selectedCode=null;selectedPlace=null;selectedRegion=null;});
  window.addEventListener('journal:updated',event=>{articleCountries=event.detail.articleCountries||[];visited=new Set(event.detail.countries);if(vietnamPlaces.length)visited.add('VN');ready=event.detail.ready;canEdit=Boolean(event.detail.canEdit);vietnamMemories=event.detail.vietnamMemories||0;refresh();});
  window.addEventListener('journal:save-error',()=>{if(selectedCode)showCountry(selectedCode,false);document.querySelector('#map-status').textContent='Chưa lưu được dấu chân. Kiểm tra quyền hoặc dung lượng lưu trữ trong nhật ký.';});
  new ResizeObserver(()=>map.invalidateSize({pan:false})).observe(document.querySelector('#world-map'));
  mountInternationalRegions();
  setRegion(initialRegion);
}
