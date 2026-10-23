const clamp=value=>Math.max(0,Math.min(1,value));
const ease=value=>{const t=clamp(value);return t*t*(3-2*t)};
const between=(from,to,value)=>ease((value-from)/(to-from));
export function journeyCamera(progress){
 const p=clamp(progress),approach=ease(p/.84);
 const altitude=Math.exp(Math.log(120)+(Math.log(.5)-Math.log(120))*approach);
 const choices=between(.84,.97,p);
 const textWindows=[[0,.13,.24,.34],[.34,.4,.57,.67],[.66,.73,.8,.87]];
 return {
  lat:18-2*approach,lng:107-approach,altitude,
  stage:p<.34?0:p<.68?1:2,
  stars:1-between(.32,.7,p),
  galaxyOpacity:1-between(.18,.45,p),galaxyScale:1+3.2*between(0,.47,p),
  earthOpacity:.65+.35*between(.12,.42,p),locator:1-between(.25,.42,p),choices,
  text:textWindows.map(([start,full,out,end],i)=>(i===0?1:between(start,full,p))*(1-between(out,end,p)))
 };
}
// Frame-rate independent easing, used only until scroll motion settles.
export function smoothJourneyProgress(current,target,elapsed){
 if(Math.abs(target-current)<.0001)return target;
 return current+(target-current)*(1-Math.exp(-Math.min(64,Math.max(0,elapsed))/85));
}
