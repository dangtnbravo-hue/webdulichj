import L from 'leaflet';
import boundary from './vietnam-boundary.json';
import { vietnamPlaces } from './vietnam-places.js';
// Neutral reference labels remain distinct from confirmed visited-place pins.
const referenceCities=[['Hà Nội',21.0285,105.8542],['Huế',16.4637,107.5909],['Nha Trang',12.2388,109.1967],['Phú Quốc',10.22,103.96],['Côn Đảo',8.684,106.61]];
export function createVietnamMap(container,{onCountry,onPlace}) {
  const map=L.map(container,{center:[16.5,106],zoom:5,fadeAnimation:false,zoomSnap:.25,minZoom:3,maxZoom:11,scrollWheelZoom:false,maxBounds:[[5,97],[27,117]],maxBoundsViscosity:.8});
  map.attributionControl.setPrefix(false);map.attributionControl.addAttribution('<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth 1:10m</a>');
  const outline=L.geoJSON(boundary,{style:{color:'#238779',weight:1.5,fillColor:'#a9dfc6',fillOpacity:.9},onEachFeature(_feature,layer){layer.on('click',()=>onCountry('VN'));}}).addTo(map);
  referenceCities.forEach(([name,lat,lng])=>{
    L.circleMarker([lat,lng],{radius:3,color:'#47788d',weight:1,fillColor:'white',fillOpacity:1,interactive:false}).addTo(map);
    L.marker([lat,lng],{icon:L.divIcon({className:'vietnam-city-label reference-city',html:name,iconSize:[120,20],iconAnchor:[-7,10]}),interactive:false,keyboard:false}).addTo(map);
  });
  const provincePalette=['#73bce8','#78c9ad','#b6a3e5','#f1ba8a','#e8a0b9','#b0ce80','#83cbd6','#e7ce80'];
  const provinceCache=new Map();
  let provinces;
  let activeMode;
  let requestId=0;
  let selectedProvince;
  const modeSelect=document.querySelector('#vietnam-boundary-mode');
  const provinceSearch=document.querySelector('#vietnam-province-search');
  const provinceStatus=document.querySelector('#vietnam-province-status');
  const retry=document.querySelector('#vietnam-province-retry');
  const placesIn=feature=>vietnamPlaces.filter(place=>feature.properties.members.includes(place.provinceCode));
  function provinceStyle(feature){return {className:'vietnam-province-shape',color:'#fff',weight:1,fillColor:provincePalette[feature.properties.colorIndex],fillOpacity:.9};}
  function selectProvince(layer,zoom=false,position){
    map.closePopup();selectedPlace=null;selectedLayer.clearLayers();onPlace?.();
    selectedProvince=layer;layer.setStyle({color:'#225c79',weight:2.5,fillOpacity:1});layer.bringToFront();
    if(zoom)map.fitBounds(layer.getBounds(),{padding:[45,45],maxZoom:8,animate:false});
    const feature=layer.feature;
    provinceSearch.value=feature.properties.id;
    const box=document.createElement('div');box.className='country-map-popup province-popup';
    const title=document.createElement('strong');title.textContent=feature.properties.name;box.append(title);
    const era=document.createElement('small');era.textContent=activeMode==='34'?'Phạm vi minh họa sau sắp xếp 2025':'Phạm vi trước năm 2025';box.append(era);
    const matches=placesIn(feature);
    const description=document.createElement('p');description.textContent=matches.length?`Đôn đã ghé ${matches.length} địa điểm trong khu vực này:`:'Chưa có địa điểm được Đôn ghi nhận trong khu vực này.';box.append(description);
    for(const place of matches){const button=document.createElement('button');button.type='button';button.textContent=`✓ ${place.name}`;button.addEventListener('click',()=>showPlace(place,true));box.append(button);}
    L.popup({maxWidth:255}).setLatLng(position||layer.getBounds().getCenter()).setContent(box).openOn(map);
  }
  async function loadProvinces(mode){
    const current=++requestId;
    provinceSearch.disabled=true;retry.hidden=true;provinceStatus.textContent='Đang tô màu từng tỉnh/thành…';
    try {
      let collection=provinceCache.get(mode);
      if(!collection){const response=await fetch(`/maps/vietnam-provinces-${mode}.geojson`);if(!response.ok)throw new Error('Boundary unavailable');collection=await response.json();if(collection.type!=='FeatureCollection'||collection.features.length!==Number(mode))throw new Error('Invalid boundary set');provinceCache.set(mode,collection);}
      if(current!==requestId)return;
      map.closePopup();if(provinces)provinces.remove();activeMode=mode;
      provinces=L.geoJSON(collection,{style:provinceStyle,onEachFeature(feature,layer){
        const tooltip=document.createElement('span');tooltip.textContent=feature.properties.name;
        layer.bindTooltip(tooltip,{sticky:true,className:'vietnam-province-tooltip'});
        layer.on('mouseover',()=>{if(layer!==selectedProvince)layer.setStyle({weight:2,color:'#4887a0'});});
        layer.on('mouseout',()=>{if(layer!==selectedProvince)provinces.resetStyle(layer);});
        layer.on('click',event=>selectProvince(layer,false,event.latlng));
      }}).addTo(map);
      provinceSearch.replaceChildren();const prompt=document.createElement('option');prompt.value='';prompt.textContent='Chọn một tỉnh/thành để xem';provinceSearch.append(prompt);
      [...collection.features].sort((a,b)=>a.properties.name.localeCompare(b.properties.name,'vi')).forEach(feature=>{const option=document.createElement('option');option.value=feature.properties.id;option.textContent=feature.properties.name;provinceSearch.append(option);});
      provinceSearch.disabled=false;
      provinceStatus.textContent=`${mode} khu vực · Màu nền phân biệt tỉnh/thành, ghim vàng là nơi đã đến.`;
    } catch {
      if(current!==requestId)return;
      if(activeMode){modeSelect.value=activeMode;provinceSearch.disabled=false;}
      provinceStatus.textContent='Chưa tải được ranh giới tỉnh/thành. Bản đồ nền và 20 ghim vẫn dùng được.';retry.hidden=false;
    }
  }
  modeSelect.addEventListener('change',()=>loadProvinces(modeSelect.value));
  provinceSearch.addEventListener('change',()=>{if(!provinceSearch.value||!provinces)return;const layer=provinces.getLayers().find(layer=>layer.feature.properties.id===provinceSearch.value);if(layer)selectProvince(layer,true);});
  retry.addEventListener('click',()=>loadProvinces(modeSelect.value));
  loadProvinces(modeSelect.value);
  const pinLayer=L.layerGroup().addTo(map);
  const selectedLayer=L.layerGroup().addTo(map);
  let selectedPlace;
  const icon=L.divIcon({className:'vietnam-place-pin',html:'<svg viewBox="0 0 28 38" aria-hidden="true"><path d="M14 36S2 24 2 14a12 12 0 0 1 24 0c0 10-12 22-12 22Z" fill="#ffbf45" stroke="white" stroke-width="2"/><path d="m9 14 4 4 7-8" fill="none" stroke="#204e62" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',iconSize:[27,37],iconAnchor:[13.5,36],popupAnchor:[0,-32]});
  function placePopup(place) {
    const box=document.createElement('div');box.className='country-map-popup vietnam-place-popup';
    const title=document.createElement('strong');title.textContent=place.name;box.append(title);
    const status=document.createElement('p');status.textContent='✓ Đôn đã ghé. Một dấu chân, cả rổ chuyện chờ kể.';box.append(status);
    const note=document.createElement('small');note.textContent='Ghim ở vị trí đại diện địa danh, không phải GPS chuyến đi.';box.append(note);
    const link=document.createElement('a');link.href='#my-journal';link.textContent='Xem nhật ký Việt Nam ↗';link.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('map:show-journal',{detail:{code:'VN'}}));map.closePopup();});box.append(link);
    return box;
  }
  function showPlace(place,zoom=false) {
    map.closePopup();
    selectedPlace=place;onPlace?.();
    if(zoom)map.setView([place.lat,place.lng],Math.max(8,map.getZoom()),{animate:false});
    selectedLayer.clearLayers();
    L.marker([place.lat,place.lng],{icon,title:`${place.name} — đã đến`,alt:`${place.name} — đã đến`,keyboard:true,zIndexOffset:1000}).addTo(selectedLayer).on('click',()=>showPlace(place));
    L.popup({maxWidth:240,autoPanPadding:[25,25]}).setLatLng([place.lat,place.lng]).setContent(placePopup(place)).openOn(map);
  }
  // Group nearby pins in screen space; clicking a group reveals its places.
  function renderPins() {
    pinLayer.clearLayers();
    const groups=[];
    for(const place of vietnamPlaces){
      const point=map.latLngToLayerPoint([place.lat,place.lng]);
      const nearby=groups.find(group=>point.distanceTo(group.center)<43);
      if(nearby)nearby.places.push(place);else groups.push({center:point,places:[place]});
    }
    for(const group of groups){
      if(group.places.length===1){const place=group.places[0];L.marker([place.lat,place.lng],{icon,title:`${place.name} — đã đến`,alt:`${place.name} — đã đến`,keyboard:true}).addTo(pinLayer).on('click',()=>showPlace(place));}
      else {
        const places=group.places;
        const center=[places.reduce((sum,p)=>sum+p.lat,0)/places.length,places.reduce((sum,p)=>sum+p.lng,0)/places.length];
        const cluster=L.divIcon({className:'vietnam-place-cluster',html:`<span>${places.length}</span>`,iconSize:[39,39],iconAnchor:[19.5,19.5]});
        L.marker(center,{icon:cluster,title:`${places.length} địa điểm đã đến: ${places.map(p=>p.name).join(', ')}`,alt:`Phóng to ${places.length} địa điểm đã đến`,keyboard:true}).addTo(pinLayer).on('click',()=>map.fitBounds(L.latLngBounds(places.map(p=>[p.lat,p.lng])),{padding:[65,65],maxZoom:10,animate:false}));
      }
    }
  }
  function focus(){map.invalidateSize({pan:false});map.fitBounds(outline.getBounds(),{paddingTopLeft:[25,container.clientWidth<760?215:25],paddingBottomRight:[60,35],animate:false});renderPins();}
  map.on('zoomend moveend',renderPins);
  map.on('popupclose',()=>{selectedPlace=null;selectedLayer.clearLayers();if(selectedProvince){provinces?.resetStyle(selectedProvince);selectedProvince=null;}});
  const observer=new ResizeObserver(()=>{if(container.clientWidth){if(selectedPlace){map.invalidateSize({pan:false});renderPins();}else focus();}});observer.observe(container);
  map.zoomControl._zoomInButton.setAttribute('aria-label','Phóng to bản đồ Việt Nam');map.zoomControl._zoomOutButton.setAttribute('aria-label','Thu nhỏ bản đồ Việt Nam');
  return {
    reset(){map.closePopup();selectedLayer.clearLayers();selectedPlace=null;focus();},
    update(visited){outline.setStyle({fillColor:visited||vietnamPlaces.length?'#a9dfc6':'#93d8bb'});},
    show(content){selectedPlace=null;selectedLayer.clearLayers();L.popup({maxWidth:235}).setLatLng([16.6,107.4]).setContent(content).openOn(map);},
    focusPlace(id){const place=vietnamPlaces.find(p=>p.id===id);if(place)showPlace(place,true);},
    activate(){focus();},
  };
}
