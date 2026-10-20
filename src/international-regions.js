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

export function regionPreviewLayout(region){
  const polygons=region.geometry.type==='Polygon'?[region.geometry.coordinates]:region.geometry.coordinates;
  const lat=region.properties.center[0],scaleX=Math.cos(lat*Math.PI/180);
  function bounds(parts){const coordinates=parts.flat(2);return [Math.min(...coordinates.map(p=>p[0])),Math.min(...coordinates.map(p=>p[1])),Math.max(...coordinates.map(p=>p[0])),Math.max(...coordinates.map(p=>p[1]))];}
  function area(ring){return Math.abs(ring.reduce((sum,p,i)=>{const next=ring[(i+1)%ring.length];return sum+p[0]*next[1]-next[0]*p[1];},0));}
  const largest=polygons.reduce((best,p,i)=>area(p[0])>area(polygons[best][0])?i:best,0);
  const all=bounds(polygons),main=bounds([polygons[largest]]);
  const inset=polygons.length>1&&Math.max(main[2]-main[0],main[3]-main[1])<Math.max(all[2]-all[0],all[3]-all[1])*.35;
  const offshore=polygons.filter((_,i)=>i!==largest),islandBounds=inset?bounds(offshore):null;
  const paths=polygons.map((rings,i)=>{
    const b=inset?(i===largest?main:islandBounds):all;
    const viewport=inset?(i===largest?[6,10,104,84]:[120,10,34,84]):[8,8,144,88];
    const [x,y,w,h]=viewport,width=Math.max(.0001,(b[2]-b[0])*scaleX),height=Math.max(.0001,b[3]-b[1]);
    const scale=Math.min(w/width,h/height),dx=x+(w-width*scale)/2,dy=y+(h-height*scale)/2;
    return rings.map(ring=>ring.map(([lng,latitude],j)=>`${j?'L':'M'}${(dx+(lng-b[0])*scaleX*scale).toFixed(2)},${(dy+(b[3]-latitude)*scale).toFixed(2)}`).join(' ')+' Z').join(' ');
  });
  return {paths,inset};
}
export function regionPreviewPaths(region){return regionPreviewLayout(region).paths;}
