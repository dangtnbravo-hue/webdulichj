const clamp=x=>Math.max(0,Math.min(1,x));
const fade=(a,b,p)=>{const x=clamp((p-a)/(b-a));return x*x*(3-2*x)};
export function houseFrame(progress){
 const p=clamp(progress);
 return {progress:p,door:fade(.13,.43,p),choices:fade(.84,.98,p),
  text:[1-fade(.17,.3,p),fade(.3,.4,p)*(1-fade(.58,.71,p))],stage:p<.3?0:p<.75?1:2};
}
export function smoothHouseProgress(current,target,elapsed){return Math.abs(target-current)<.00015?target:current+(target-current)*(1-Math.exp(-Math.min(64,Math.max(0,elapsed))/110))}
