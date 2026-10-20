import L from 'leaflet';
import boundary from './vietnam-boundary.json';

// These are orientation labels, not the author's visited destinations.
const referenceCities = [
  ['Hà Nội',21.0285,105.8542],
  ['Huế',16.4637,107.5909],
  ['Đà Nẵng',16.0544,108.2022],
  ['Nha Trang',12.2388,109.1967],
  ['TP. Hồ Chí Minh',10.8231,106.6297],
  ['Phú Quốc',10.22,103.96],
  ['Côn Đảo',8.684,106.61],
];
export function createVietnamMap(container, {onCountry}) {
  const map=L.map(container,{fadeAnimation:false,zoomSnap:.25,minZoom:3,maxZoom:10,scrollWheelZoom:false,maxBounds:[[5,97],[27,117]],maxBoundsViscosity:.8});
  map.attributionControl.setPrefix(false);
  map.attributionControl.addAttribution('<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth 1:10m</a>');
  const outline=L.geoJSON(boundary,{style:{color:'#238779',weight:1.5,fillColor:'#93d8bb',fillOpacity:.9},onEachFeature(_feature,layer){layer.on('click',()=>onCountry('VN'));}}).addTo(map);
  const labels=L.layerGroup().addTo(map);
  referenceCities.forEach(([name,lat,lng])=>{
    L.circleMarker([lat,lng],{radius:3,color:'#246286',weight:1,fillColor:'white',fillOpacity:1,interactive:false}).addTo(labels);
    const label=L.divIcon({className:'vietnam-city-label',html:name,iconSize:[120,20],iconAnchor:[-7,10]});
    L.marker([lat,lng],{icon:label,interactive:false,keyboard:false}).addTo(labels);
  });
  const visitMarker=L.circleMarker([16.6,107.4],{className:'vietnam-visited-mark',radius:7,color:'white',weight:2,fillColor:'#f4b83d',fillOpacity:1});
  visitMarker.on('click',()=>onCountry('VN'));
  function focus(){map.invalidateSize({pan:false});map.fitBounds(outline.getBounds(),{paddingTopLeft:[25,container.clientWidth<760?175:25],paddingBottomRight:[60,35],animate:false});}
  function showPopup(content){L.popup({maxWidth:235}).setLatLng([16.6,107.4]).setContent(content).openOn(map);}
  const observer=new ResizeObserver(()=>{if(container.clientWidth)focus();});observer.observe(container);
  map.zoomControl._zoomInButton.setAttribute('aria-label','Phóng to bản đồ Việt Nam');
  map.zoomControl._zoomOutButton.setAttribute('aria-label','Thu nhỏ bản đồ Việt Nam');
  return {
    reset(){map.closePopup();focus();},
    update(visited){outline.setStyle({fillColor:visited?'#ffce72':'#93d8bb',color:visited?'#ab7e31':'#238779'});if(visited)visitMarker.addTo(map);else visitMarker.remove();},
    show:showPopup,
    activate(){focus();},
  };
}
