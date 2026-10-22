// Country labels at overview scale; exact recorded coordinates when zoomed in.
export function globeLabelGroups(points,altitude){
  if(altitude<1.1)return points.map(place=>({code:place.code,places:[place],lat:place.lat,lng:place.lng,overview:false}));
  const countries=new Map();
  for(const place of points){
    if(!countries.has(place.code))countries.set(place.code,[]);
    countries.get(place.code).push(place);
  }
  return [...countries].map(([code,places])=>{
    const radians=places.map(p=>p.lng*Math.PI/180);
    const lng=Math.atan2(radians.reduce((sum,n)=>sum+Math.sin(n),0),radians.reduce((sum,n)=>sum+Math.cos(n),0))*180/Math.PI;
    return {code,places,lat:places.reduce((sum,p)=>sum+p.lat,0)/places.length,lng,overview:true};
  });
}
