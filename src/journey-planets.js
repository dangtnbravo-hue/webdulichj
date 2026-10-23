// Decorative composition, not astronomical positions or distances.
export const journeyPlanets=[
 {id:'saturn',name:'Sao Thổ',x:25,y:21,size:100,depth:.8},
 {id:'jupiter',name:'Sao Mộc',x:85,y:26,size:160,depth:1.2},
 {id:'mars',name:'Sao Hỏa',x:43,y:80,size:62,depth:.7},
 {id:'neptune',name:'Sao Hải Vương',x:88,y:77,size:74,depth:1}
];
export function planetPositions(progress){
 const p=Math.max(0,Math.min(1,progress));
 const t=Math.max(0,Math.min(1,(p-.18)/.3));
 const opacity=1-t*t*(3-2*t);
 return journeyPlanets.map(planet=>({...planet,opacity,dx:(planet.x-68)*p*planet.depth*2.3,dy:(planet.y-50)*p*planet.depth*2.3,scale:1+p*planet.depth*1.5}));
}
