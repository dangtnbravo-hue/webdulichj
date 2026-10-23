import * as THREE from 'three';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
export function createHouseScene(container,{onFailure}){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#eceee5');scene.fog=new THREE.Fog('#eceee5',25,70);
 const camera=new THREE.PerspectiveCamera(43,1,.08,90);
 const renderer=new THREE.WebGLRenderer({antialias:!matchMedia('(pointer: coarse)').matches,alpha:false,powerPreference:'default'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;container.append(renderer.domElement);
 const hemi=new THREE.HemisphereLight('#fff7e4','#818c71',2.5);scene.add(hemi);
 const sun=new THREE.DirectionalLight('#fff1d6',3.5);sun.position.set(-6,14,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15,near:1,far:45});sun.shadow.bias=-.001;scene.add(sun);
 const inside=new THREE.PointLight('#fff0cb',35,12,2);inside.position.set(0,3,0);scene.add(inside);
 const mats=new Map();
 const material=color=>{if(!mats.has(color))mats.set(color,new THREE.MeshStandardMaterial({color,roughness:.86}));return mats.get(color)};
 function box(w,h,d,x,y,z,color,parent=scene){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh}
 function cylinder(r1,r2,h,x,y,z,color,segments=12,parent=scene){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material(color));mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh}
 function ball(r,x,y,z,color,parent=scene){const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),material(color));mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh}
 function canvasTexture(draw,w=512,h=256){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'),w,h);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return texture}
 function sign(text,w,h,x,y,z,bg='#efe5ca',ink='#345e51',font=52,parent=scene){
  const texture=canvasTexture((ctx,cw,ch)=>{ctx.fillStyle=bg;ctx.fillRect(0,0,cw,ch);ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${font}px sans-serif`;ctx.fillText(text,cw/2,ch/2,cw-30)});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture,roughness:1}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),material('#e6eadc'));ground.rotation.x=-Math.PI/2;ground.position.y=-.32;ground.receiveShadow=true;scene.add(ground);
 cylinder(10.5,10.8,.28,0,-.15,0,'#a3b59a',64);
 box(8.4,.22,6.4,0,0,0,'#b9ad95');box(8,.08,6,0,.15,0,'#ccaf86');
 // Rear and side walls; the front has a genuine doorway for the camera to cross.
 box(.22,4,6,-4,2,0,'#eee5d1');box(.22,4,6,4,2,0,'#eee5d1');box(8,4,.22,0,2,-3,'#e6d9bf');
 box(3,4,.22,-2.5,2,3,'#f7ecd7');box(3,4,.22,2.5,2,3,'#f7ecd7');box(2,1,.22,0,3.5,3,'#f7ecd7');
 const roofShape=new THREE.Shape();roofShape.moveTo(-4.65,4);roofShape.lineTo(4.65,4);roofShape.lineTo(0,6.35);roofShape.closePath();
 const roof=new THREE.Mesh(new THREE.ExtrudeGeometry(roofShape,{depth:7,bevelEnabled:false}),material('#b86848'));roof.position.z=-3.5;roof.castShadow=true;scene.add(roof);
 // Roof tile courses follow the two slopes.
 for(let i=0;i<9;i++)for(const side of [-1,1]){const t=(i+.5)/9;const x=side*4.65*t,y=6.35-2.35*t;box(.065,.045,7.05,x,y+.035,0,'#cb8058').rotation.z=side*-Math.atan2(2.35,4.65)}
 box(.38,3.15,.4,-1.05,1.62,3.15,'#d1b58b');box(.38,3.15,.4,1.05,1.62,3.15,'#d1b58b');box(2.5,.22,.4,0,3.15,3.15,'#d1b58b');
 const doorLeft=new THREE.Group(),doorRight=new THREE.Group();doorLeft.position.set(-.91,.2,3.13);doorRight.position.set(.91,.2,3.13);scene.add(doorLeft,doorRight);
 for(const [door,direction] of [[doorLeft,1],[doorRight,-1]]){
  box(.9,2.82,.1,direction*.45,1.41,0,'#517462',door);
  for(const y of [.65,1.55,2.28])box(.65,.52,.06,direction*.45,y,.075,'#648675',door);
  ball(.045,direction*.77,1.4,.12,'#e2bd73',door);
 }
 sign('ĐÔN ĐÚ ĐỞN',2.6,.45,0,3.67,3.145,'#e7d7b4','#416454',54);
 for(const x of [-2.55,2.55]){
  box(1.65,1.8,.16,x,2.22,3.15,'#55725f');box(1.4,1.55,.05,x,2.22,3.25,'#b9cebe');
  box(.07,1.55,.05,x,2.22,3.3,'#f6ecd7');box(1.4,.07,.05,x,2.22,3.3,'#f6ecd7');box(1.9,.12,.38,x,1.32,3.23,'#b89d77');
  for(let j=0;j<4;j++){cylinder(.11,.08,.17,x-.55+j*.36,1.45,3.26,'#b47250');ball(.16,x-.55+j*.36,1.64,3.26,'#6b8b4e')}
 }
 box(3.1,.18,1.1,0,.05,3.6,'#d4c4a5');box(3.6,.08,.8,0,.025,4.35,'#ddd1b7');
 for(let i=0;i<6;i++){const stone=cylinder(.48,.52,.08,Math.sin(i*.55)*.45,.04,5.1+i*.84,'#d9d3bb',7);stone.rotation.y=i*.5}
 function tree(x,z,scale){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);cylinder(.12,.18,2.1,0,1,0,'#89745a',9,g);ball(1.1,0,2.7,0,'#698963',g);ball(.85,.65,2.35,.15,'#7b965f',g);ball(.8,-.65,2.25,.2,'#8ba26c',g)}
 tree(-5.7,1.4,1.15);tree(5.6,-1.7,1.3);tree(-5,-3.5,.8);
 cylinder(.42,.3,.65,4.8,.18,4,'#b98465');ball(.55,4.8,.8,4,'#72976a');
 const bag=ball(.5,1.55,.62,3.68,'#63816a');bag.scale.set(.8,1.2,.55);box(.42,.35,.17,1.55,.42,3.98,'#88a17c');
 // The room is open below the roof and lit from the doorway.
 box(2.6,.025,2.6,0,.22,.3,'#bd8266');
 for(let i=0;i<8;i++)box(2.6,.028,.035,0,.24,-.85+i*.32,'#d6ad83');
 box(4,.18,1.9,0,1.18,-1.65,'#aa7a4d');for(const x of [-1.72,1.72])for(const z of [-2.35,-.98])box(.12,1.08,.12,x,.62,z,'#6e5843');
 const worldTexture=canvasTexture((ctx,w,h)=>{
  ctx.fillStyle='#f2e8ce';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#d4d0b5';ctx.lineWidth=1;
  for(let x=0;x<w;x+=w/12){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  for(let y=0;y<h;y+=h/6){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  const countries=feature(world,world.objects.countries).features;
  for(const country of countries){const polys=country.geometry.type==='MultiPolygon'?country.geometry.coordinates:[country.geometry.coordinates];ctx.fillStyle=Number(country.id)===704?'#bf6c42':'#8a9f79';for(const poly of polys){ctx.beginPath();for(const ring of poly){ring.forEach(([lng,lat],index)=>{const x=(lng+180)/360*w,y=(90-lat)/180*h;index?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath()}ctx.fill('evenodd')}}
  const x=(106+180)/360*w,y=(90-16)/180*h;ctx.fillStyle='#bb5735';ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();
  ctx.font='600 25px sans-serif';ctx.fillStyle='#49694e';ctx.fillText('ĐI ĐÂU TIẾP?',28,h-28);
 },1024,512);
 const map=new THREE.Mesh(new THREE.PlaneGeometry(3.55,1.6),new THREE.MeshStandardMaterial({map:worldTexture,roughness:1}));map.rotation.x=-Math.PI/2;map.position.set(0,1.282,-1.6);scene.add(map);
 box(.5,.32,.3,-1.55,1.47,-2.15,'#3f4941');const lens=cylinder(.12,.12,.16,-1.55,1.49,-1.94,'#222c2c',18);lens.rotation.x=Math.PI/2;
 cylinder(.11,.1,.22,1.6,1.4,-2.05,'#d2c8ab',18);
 box(.85,.55,.1,-2,2.3,-2.83,'#a37d51');sign('ĐI CÓ HỘI',.75,.23,-2,2.35,-2.76,'#efe5ce','#58765e',60);
 box(.85,.55,.1,2,2.5,-2.83,'#a37d51');sign('KỂ CÓ ĐÔN',.75,.23,2,2.55,-2.76,'#efe5ce','#58765e',60);
 box(1.5,.12,.45,2.8,1.7,-2.6,'#a37d51');for(let i=0;i<4;i++)box(.16,.5+i*.035,.28,2.3+i*.24,2,-2.6,['#78917c','#d0ae79','#a6654e','#7f9390'][i]);
 const path=new THREE.CatmullRomCurve3([new THREE.Vector3(9,6.6,16),new THREE.Vector3(3,3.15,8),new THREE.Vector3(0,2.1,4.4),new THREE.Vector3(0,2.12,1.65),new THREE.Vector3(0,3.4,-.05)],false,'catmullrom',.35);
 const targetPath=new THREE.CatmullRomCurve3([new THREE.Vector3(0,2,0),new THREE.Vector3(0,1.8,1),new THREE.Vector3(0,1.8,-.5),new THREE.Vector3(0,1.25,-1.6),new THREE.Vector3(0,1.25,-1.6)]);
 let destroyed=false,lastFrame={progress:0,door:0},draws=0,departure=0;
 function draw(){if(destroyed||document.hidden)return;renderer.render(scene,camera);container.dataset.draws=String(++draws)}
 function update(frame){if(destroyed)return;lastFrame=frame;const p=frame.progress;camera.position.copy(path.getPoint(p));const look=targetPath.getPoint(p);if(container.clientWidth<760){const shift=.6*Math.max(0,Math.min(1,(p-.65)/.35));camera.position.x+=shift;look.x+=shift;camera.position.sub(look).multiplyScalar(1+.25*(1-Math.min(1,p/.5))).add(look)}camera.lookAt(look);
  const small=container.clientWidth<760,offset=1-Math.min(1,p/.7);
  camera.setViewOffset(container.clientWidth,container.clientHeight,-container.clientWidth*(small?.01:.15)*offset,small?-container.clientHeight*.12*offset:0,container.clientWidth,container.clientHeight);
  doorLeft.rotation.y=frame.door*Math.PI*.49;doorRight.rotation.y=-frame.door*Math.PI*.49;draw();container.dataset.progress=String(p);
 }
 const resize=()=>{const w=container.clientWidth,h=container.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<760?57:43;camera.updateProjectionMatrix();update(lastFrame)}};
 const observer=new ResizeObserver(resize);observer.observe(container);resize();
 const awake=()=>draw();document.addEventListener('visibilitychange',awake);
 function destroy(){if(destroyed)return;destroyed=true;cancelAnimationFrame(departure);observer.disconnect();document.removeEventListener('visibilitychange',awake);renderer.domElement.removeEventListener('webglcontextlost',lost);const resources=new Set();scene.traverse(object=>{if(object.geometry)resources.add(object.geometry);for(const mat of [object.material].flat().filter(Boolean)){resources.add(mat);for(const value of Object.values(mat))if(value?.isTexture)resources.add(value)}});resources.forEach(resource=>resource.dispose());renderer.dispose();container.replaceChildren()}
 function lost(event){event.preventDefault();destroy();onFailure()}
 renderer.domElement.addEventListener('webglcontextlost',lost);
 return {update,destroy,depart(region){return new Promise(resolve=>{
  const start=performance.now(),from=camera.position.clone(),look=targetPath.getPoint(1),destination=region==='vietnam'?new THREE.Vector3(1.05,1.65,-1.6):new THREE.Vector3(0,2.1,-1.6);
  function tick(time){if(destroyed){resolve();return}const t=Math.min(1,(time-start)/700),e=t*t*(3-2*t);camera.position.lerpVectors(from,destination,e);camera.lookAt(region==='vietnam'?new THREE.Vector3(1.04,1.28,-1.45):look);draw();if(t<1)departure=requestAnimationFrame(tick);else resolve()}
  departure=requestAnimationFrame(tick);
 })}};
}
