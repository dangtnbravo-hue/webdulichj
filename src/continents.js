// Country groups follow the UN M49 continental grouping (the Americas combined).
export const continents=[
  {id:'chau-a',name:'Châu Á',countries:'AF AM AZ BH BD BT BN KH CN CY GE IN ID IR IQ IL JP JO KZ KW KG LA LB MY MV MN MM NP KP OM PK PS PH QA SA SG KR LK SY TJ TH TL TR TM AE UZ VN YE'.split(' ')},
  {id:'chau-au',name:'Châu Âu',countries:'AL AD AT BY BE BA BG HR CZ DK EE FI FR DE GR VA HU IS IE IT LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA GB'.split(' ')},
  {id:'chau-phi',name:'Châu Phi',countries:'DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW'.split(' ')},
  {id:'chau-my',name:'Châu Mỹ',countries:'AG AR BS BB BZ BO BR CA CL CO CR CU DM DO EC SV GD GT GY HT HN JM MX NI PA PY PE KN LC VC SR TT US UY VE'.split(' ')},
  {id:'chau-dai-duong',name:'Châu Đại Dương',countries:'AU FJ KI MH FM NR NZ PW PG WS SB TO TV VU'.split(' ')},
  {id:'chau-nam-cuc',name:'Châu Nam Cực',countries:['AQ']},
];
export function requestedContinent(search){return continents.find(c=>c.id===new URLSearchParams(search).get('chau'))||null;}
export function countryInContinent(code,continent){return !continent||continent.countries.includes(code);}
export function mountWorldNavigation(){
  const navigation=document.querySelector('.world-navigation');if(!navigation)return;
  const trigger=navigation.querySelector('.navigation-trigger');
  const panel=navigation.querySelector('.continent-navigation');
  function setOpen(open){
    trigger.setAttribute('aria-expanded',String(open));
    navigation.dataset.open=String(open);panel.hidden=!open;
  }
  trigger.addEventListener('click',()=>setOpen(trigger.getAttribute('aria-expanded')!=='true'));
  document.addEventListener('click',event=>{if(!navigation.contains(event.target))setOpen(false);});
  navigation.addEventListener('keydown',event=>{if(event.key==='Escape'){setOpen(false);trigger.focus();event.stopPropagation();}});
  navigation.addEventListener('focusout',event=>{if(!navigation.contains(event.relatedTarget))setOpen(false);});
  panel.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
}
