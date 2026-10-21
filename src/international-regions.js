const colors=['#35b9a5','#5e9de6','#be80d6','#f3b85e','#ed879b','#9bbb52','#5ec5d6','#d49a68','#908bdf','#77bc8b','#d28dbd','#bdb268'];
let pending;
export function loadInternationalRegions(){
  return pending??=fetch('/maps/international-regions.geojson').then(response=>{if(!response.ok)throw Error('Region data unavailable');return response.json();}).then(data=>data.features).catch(error=>{pending=null;throw error;});
}
export function regionHasVisit(region,codes){return codes.has(region.properties.code)&&region.properties.placeIds.length>0;}
export function regionColor(region){return colors[region.properties.colorIndex%colors.length];}
export function regionPlaces(region,codes,places){return codes.has(region.properties.code)?places.filter(p=>region.properties.placeIds.includes(p.id)):[];}

export function visitedRegions(regions,codes){return regions.filter(region=>regionHasVisit(region,codes));}

// Frame geographic bounds by moving the camera; never scale the actual polygon.
export function regionView(region,aspect=1,fov=50){
  const [[south,west],[north,east]]=region.properties.bounds;
  const lat=(south+north)/2,lng=(west+east)/2;
  const vertical=(north-south)*Math.PI/180;
  const horizontal=(east-west)*Math.PI/180*Math.cos(lat*Math.PI/180);
  const radius=Math.max(vertical,horizontal/Math.max(.3,aspect))/2;
  return {lat,lng,altitude:Math.max(.012,Math.min(2, .008+1.4*radius/Math.tan(fov*Math.PI/360)))};
}
