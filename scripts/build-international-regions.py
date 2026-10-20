"""Build illustrative regional overlays for the seven recorded foreign countries.
Usage: python scripts/build-international-regions.py NE_ADM1.geojson YUNNAN_ECHARTS.json
Requires Shapely 2. Sources and license: THIRD_PARTY_NOTICES.md.
"""
import json, sys
from pathlib import Path
from shapely.geometry import shape, mapping
from shapely import make_valid
from shapely.ops import unary_union
CODES={'CHN':'CN','THA':'TH','JPN':'JP','IDN':'ID','MYS':'MY','KHM':'KH','SGP':'SG'}
PLACES={'ID-JK':['jakarta'],'MY-14':['kuala-lumpur'],'KH-12':['phnom-penh'],'KH-17':['siem-reap'],'TH-10':['bangkok'],'JP-13':['tokyo'],'CN-530100':['con-minh'],'CN-530700':['le-giang'],'CN-533400':['shangri-la']}
YUNNAN_NAMES={'530100':'Côn Minh','530300':'Khúc Tĩnh','530400':'Ngọc Khê','530500':'Bảo Sơn','530600':'Chiêu Thông','530700':'Lệ Giang','530800':'Phổ Nhĩ','530900':'Lâm Thương','532300':'Sở Hùng','532500':'Hồng Hà','532600':'Văn Sơn','532800':'Tây Song Bản Nạp','532900':'Đại Lý','533100':'Đức Hoành','533300':'Nộ Giang','533400':'Địch Khánh · Shangri-La'}
def decode_ring(encoded, offset):
    x,y=offset; result=[]
    for i in range(0,len(encoded),2):
        dx,dy=ord(encoded[i])-64,ord(encoded[i+1])-64
        x+=(dx>>1)^(-(dx&1));y+=(dy>>1)^(-(dy&1))
        result.append([x/1024,y/1024])
    return result
regions=[];geometries=[]
def add(geometry, id, code, name, level):
    geometry=make_valid(geometry)
    if geometry.geom_type=='GeometryCollection':
        geometry=unary_union([g for g in geometry.geoms if g.geom_type in ('Polygon','MultiPolygon')])
    geometry=geometry.simplify(.012,preserve_topology=True)
    if geometry.is_empty:return
    center=geometry.representative_point()
    props={'regionId':id,'code':code,'name':name,'level':level,'placeIds':PLACES.get(id,[]),'center':[round(center.y,5),round(center.x,5)],'span':round(max(geometry.bounds[2]-geometry.bounds[0],geometry.bounds[3]-geometry.bounds[1]),3)}
    regions.append({'type':'Feature','properties':props,'geometry':mapping(geometry)})
    geometries.append(geometry)
for f in json.load(open(sys.argv[1]))['features']:
    p=f['properties'];code=CODES.get(p.get('adm0_a3'))
    if not code:continue
    if p['iso_3166_2']=='CN-YN':continue
    add(shape(f['geometry']),p['iso_3166_2'],code,p.get('name_vi') or p['name'],'province')
for f in json.load(open(sys.argv[2]))['features']:
    g=f['geometry'];coords=g['coordinates'];offsets=g['encodeOffsets']
    if g['type']=='Polygon':coords=[decode_ring(r,o) for r,o in zip(coords,offsets)]
    else:coords=[[decode_ring(r,o) for r,o in zip(poly,off)] for poly,off in zip(coords,offsets)]
    id=str(f['id']);add(shape({'type':g['type'],'coordinates':coords}),'CN-'+id,'CN',YUNNAN_NAMES[id],'prefecture')
# Adjacent regions receive different colors; colors remain stable between 2D and 3D.
for i,region in enumerate(regions):
    neighbors={regions[j]['properties']['colorIndex'] for j in range(i) if geometries[i].distance(geometries[j])<.025 or (region['properties']['placeIds'] and regions[j]['properties']['placeIds'])}
    region['properties']['colorIndex']=next(c for c in range(12) if c not in neighbors)
Path('public/maps/international-regions.geojson').write_text(json.dumps({'type':'FeatureCollection','features':regions},ensure_ascii=False,separators=(',',':')))
print(len(regions),'regions')
