import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {internationalPlaces} from '../src/international-places.js';
import {regionHasVisit,regionColor,regionPlaces,visitedRegions} from '../src/international-regions.js';
const features=JSON.parse(readFileSync(new URL('../public/maps/international-regions.geojson',import.meta.url))).features;
function ringContains(ring,[x,y]){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if(((yi>y)!==(yj>y))&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
function contains(f,point){const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;return polygons.some(rings=>ringContains(rings[0],point)&&!rings.slice(1).some(ring=>ringContains(ring,point)));}
test('only confirmed destination regions are shipped and visible overlays follow the published country list',()=>{
 assert.equal(features.length,11);assert.equal(new Set(features.map(f=>f.properties.regionId)).size,11);
 assert.deepEqual([...new Set(features.map(f=>f.properties.code))].sort(),['CN','ID','JP','KH','MY','SG','TH']);
 const regionsFor=place=>features.filter(f=>f.properties.placeIds.includes(place.id));
 for(const place of internationalPlaces){const regions=regionsFor(place);assert.equal(regions.length,1,place.name);assert.equal(regions[0].properties.code,place.code);assert.ok(contains(regions[0],[place.lng,place.lat]),place.name+' point must lie in its own highlighted region');}
 const china=internationalPlaces.filter(p=>p.code==='CN').map(p=>regionsFor(p)[0]);assert.equal(new Set(china.map(f=>f.properties.regionId)).size,3);assert.equal(new Set(china.map(regionColor)).size,3);
 for(const f of features){assert.ok(['Polygon','MultiPolygon'].includes(f.geometry.type));assert.equal(regionHasVisit(f,new Set()),false);assert.deepEqual(regionPlaces(f,new Set(),internationalPlaces),[]);}
 assert.deepEqual(features.filter(f=>f.properties.code==='TH').map(f=>f.properties.regionId),['TH-10']);
 assert.equal(visitedRegions(features,new Set()).length,0);
 assert.equal(visitedRegions(features,new Set(['CN'])).length,3);
 assert.ok(features.every(f=>f.properties.placeIds.length>0));
 assert.ok(readFileSync(new URL('../public/maps/international-regions.geojson',import.meta.url)).length<50000);
 assert.equal(features.filter(f=>regionHasVisit(f,new Set(['CN']))).length,3);
 assert.equal(features.find(f=>f.properties.regionId==='CN-YN'),undefined);
 assert.equal(features.find(f=>f.properties.placeIds.includes('fuji')).properties.regionId,'JP-22210');
 assert.equal(features.find(f=>f.properties.placeIds.includes('singapore')).properties.level,'country');
});

test('area metadata reflects full geographic regions and camera fitting preserves their bounds',async()=>{
 const {regionView}=await import('../src/international-regions.js');
 for(const [id,min,max] of [['CN-530700',19500,21500],['CN-530100',20000,22500],['TH-10',1450,1700],['MY-14',200,300]]){
  const region=features.find(f=>f.properties.regionId===id);
  assert.ok(region.properties.areaKm2>min&&region.properties.areaKm2<max,id);
  const before=JSON.stringify(region);
  const view=regionView(region,2.2);
  const [[south,west],[north,east]]=region.properties.bounds;
  assert.equal(view.lat,(south+north)/2);assert.equal(view.lng,(west+east)/2);
  assert.ok(view.altitude>=.012&&view.altitude<.24);
  assert.ok(regionView(region,.6).altitude>=view.altitude,'narrow screens need more camera distance');
  assert.equal(JSON.stringify(region),before,'camera fitting must not enlarge geographic geometry');
 }
});
