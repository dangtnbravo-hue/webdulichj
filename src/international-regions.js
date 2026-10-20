const colors=['#35b9a5','#5e9de6','#be80d6','#f3b85e','#ed879b','#9bbb52','#5ec5d6','#d49a68','#908bdf','#77bc8b','#d28dbd','#bdb268'];
let pending;
export function loadInternationalRegions(){
  return pending??=fetch('/maps/international-regions.geojson').then(response=>{if(!response.ok)throw Error('Region data unavailable');return response.json();}).then(data=>data.features).catch(error=>{pending=null;throw error;});
}
export function regionHasVisit(region,codes){return codes.has(region.properties.code)&&region.properties.placeIds.length>0;}
export function regionColor(region){return colors[region.properties.colorIndex%colors.length];}
export function regionPlaces(region,codes,places){return codes.has(region.properties.code)?places.filter(p=>region.properties.placeIds.includes(p.id)):[];}
