import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {internationalPlaces} from '../src/international-places.js';
import {regionHasVisit,regionColor,regionPlaces} from '../src/international-regions.js';
const features=JSON.parse(readFileSync(new URL('../public/maps/international-regions.geojson',import.meta.url))).features;
function ringContains(ring,[x,y]){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if(((yi>y)!==(yj>y))&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
function contains(f,point){const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;return polygons.some(rings=>ringContains(rings[0],point)&&!rings.slice(1).some(ring=>ringContains(ring,point)));}
test('regional overlays subdivide seven countries and distinguish the three Yunnan destinations',()=>{
 assert.equal(features.length,249);assert.equal(new Set(features.map(f=>f.properties.regionId)).size,249);
 assert.deepEqual([...new Set(features.map(f=>f.properties.code))].sort(),['CN','ID','JP','KH','MY','SG','TH']);
 const regionsFor=place=>features.filter(f=>f.properties.placeIds.includes(place.id));
 for(const place of internationalPlaces.filter(p=>!['fuji','singapore'].includes(p.id))){const regions=regionsFor(place);assert.equal(regions.length,1,place.name);assert.equal(regions[0].properties.code,place.code);assert.ok(contains(regions[0],[place.lng,place.lat]),place.name+' point must lie in its own highlighted region');}
 const china=internationalPlaces.filter(p=>p.code==='CN').map(p=>regionsFor(p)[0]);assert.equal(new Set(china.map(f=>f.properties.regionId)).size,3);assert.equal(new Set(china.map(regionColor)).size,3);
 for(const f of features){assert.ok(['Polygon','MultiPolygon'].includes(f.geometry.type));assert.equal(regionHasVisit(f,new Set()),false);assert.deepEqual(regionPlaces(f,new Set(),internationalPlaces),[]);}
 assert.ok(features.filter(f=>f.properties.code==='TH').length>70);
 assert.equal(features.filter(f=>regionHasVisit(f,new Set(['CN']))).length,3);
 assert.equal(features.find(f=>f.properties.regionId==='CN-YN'),undefined);
 assert.equal(features.filter(f=>f.properties.placeIds.includes('fuji')||f.properties.placeIds.includes('singapore')).length,0);
});
