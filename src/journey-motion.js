const clamp=value=>Math.max(0,Math.min(1,value));
const ease=(from,to,value)=>{const t=clamp((value-from)/(to-from));return t*t*(3-2*t)};
export function journeyFrames(progress){
 const p=clamp(progress);
 return [
  {opacity:1-ease(.23,.4,p),scale:1+.5*ease(0,.4,p)},
  {opacity:ease(.23,.4,p)*(1-ease(.58,.75,p)),scale:1.45-.4*ease(.25,.6,p)+.15*ease(.6,.75,p)},
  {opacity:ease(.58,.75,p),scale:1.45-.45*ease(.6,1,p)}
 ];
}
