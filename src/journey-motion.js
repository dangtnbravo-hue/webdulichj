const clamp=value=>Math.max(0,Math.min(1,value));
const ease=value=>{const t=clamp(value);return t*t*(3-2*t)};
export function journeyCamera(progress){
 const p=clamp(progress);
 const stops=[{p:0,altitude:18},{p:.3,altitude:6},{p:.62,altitude:1.7},{p:1,altitude:.5}];
 const end=stops.findIndex(stop=>stop.p>=p);
 const before=stops[Math.max(0,end-1)],after=stops[Math.max(0,end)];
 const local=after.p===before.p?0:ease((p-before.p)/(after.p-before.p));
 const altitude=Math.exp(Math.log(before.altitude)+(Math.log(after.altitude)-Math.log(before.altitude))*local);
 return {lat:18-2*ease(p),lng:107-ease(p),altitude,stage:p<.3?0:p<.72?1:2,stars:1-ease(p/.75)};
}
