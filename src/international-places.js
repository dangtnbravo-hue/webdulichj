// Destinations explicitly supplied by the author, at representative city/area centers.
export const internationalPlaces = [
  {id:'jakarta',code:'ID',name:'Jakarta',lat:-6.2088,lng:106.8456,kind:'city'},
  {id:'kuala-lumpur',code:'MY',name:'Kuala Lumpur',lat:3.139,lng:101.6869,kind:'city'},
  {id:'phnom-penh',code:'KH',name:'Phnom Penh',lat:11.5564,lng:104.9282,kind:'city'},
  {id:'siem-reap',code:'KH',name:'Siem Reap',lat:13.3633,lng:103.8564,kind:'city'},
  {id:'singapore',code:'SG',name:'Singapore',lat:1.3521,lng:103.8198,kind:'city'},
  {id:'bangkok',code:'TH',name:'Bangkok',lat:13.7563,lng:100.5018,kind:'city'},
  {id:'tokyo',code:'JP',name:'Tokyo',lat:35.6762,lng:139.6503,kind:'city'},
  {id:'fuji',code:'JP',name:'Fuji',lat:35.3606,lng:138.7274,kind:'area'},
  {id:'le-giang',code:'CN',name:'Lệ Giang',lat:26.8721,lng:100.2299,kind:'city'},
  {id:'con-minh',code:'CN',name:'Côn Minh',lat:25.0389,lng:102.7183,kind:'city'},
  {id:'shangri-la',code:'CN',name:'Shangri-La',lat:27.8299,lng:99.706,kind:'city'},
];
export function internationalMapPoints(codes,locations) {
  const names=new Intl.DisplayNames(['vi'],{type:'region'});
  return [...new Set(codes)].filter(code=>code!=='VN'&&locations[code]).flatMap(code=>{
    const known=internationalPlaces.filter(place=>place.code===code);
    if(known.length)return known;
    const [lat,lng]=locations[code].latlng;
    return [{id:`country-${code}`,code,name:names.of(code),lat,lng,kind:'country'}];
  });
}
