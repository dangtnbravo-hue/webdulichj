"""Build illustrative 63-unit and merged 34-unit maps from Natural Earth ADM1.
Usage: python build-vietnam-provinces.py /path/ne_10m_admin_1_states_provinces.geojson
Requires Shapely 2.x. This helper is not part of the website's runtime/build.
The 34 groups reflect the 2025 provincial mergers, not a cadastral survey.
"""
import json
import sys
from pathlib import Path
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
from shapely import make_valid

GROUPS = [
 ('tuyen-quang','Tuyên Quang',['VN-03','VN-07']),
 ('cao-bang','Cao Bằng',['VN-04']),
 ('lai-chau','Lai Châu',['VN-01']),
 ('lao-cai','Lào Cai',['VN-02','VN-06']),
 ('thai-nguyen','Thái Nguyên',['VN-53','VN-69']),
 ('dien-bien','Điện Biên',['VN-71']),
 ('lang-son','Lạng Sơn',['VN-09']),
 ('son-la','Sơn La',['VN-05']),
 ('phu-tho','Phú Thọ',['VN-68','VN-70','VN-14']),
 ('bac-ninh','Bắc Ninh',['VN-56','VN-54']),
 ('quang-ninh','Quảng Ninh',['VN-13']),
 ('ha-noi','Hà Nội',['VN-HN']),
 ('hai-phong','Hải Phòng',['VN-HP','VN-61']),
 ('hung-yen','Hưng Yên',['VN-66','VN-20']),
 ('ninh-binh','Ninh Bình',['VN-18','VN-67','VN-63']),
 ('thanh-hoa','Thanh Hóa',['VN-21']),
 ('nghe-an','Nghệ An',['VN-22']),
 ('ha-tinh','Hà Tĩnh',['VN-23']),
 ('quang-tri','Quảng Trị',['VN-25','VN-24']),
 ('hue','Huế',['VN-26']),
 ('da-nang','Đà Nẵng',['VN-DN','VN-27']),
 ('quang-ngai','Quảng Ngãi',['VN-29','VN-28']),
 ('gia-lai','Gia Lai',['VN-30','VN-31']),
 ('dak-lak','Đắk Lắk',['VN-33','VN-32']),
 ('khanh-hoa','Khánh Hòa',['VN-34','VN-36']),
 ('lam-dong','Lâm Đồng',['VN-35','VN-72','VN-40']),
 ('dong-nai','Đồng Nai',['VN-39','VN-58']),
 ('tay-ninh','Tây Ninh',['VN-37','VN-41']),
 ('ho-chi-minh','Hồ Chí Minh',['VN-SG','VN-57','VN-43']),
 ('dong-thap','Đồng Tháp',['VN-45','VN-46']),
 ('an-giang','An Giang',['VN-44','VN-47']),
 ('vinh-long','Vĩnh Long',['VN-49','VN-50','VN-51']),
 ('can-tho','Cần Thơ',['VN-CT','VN-73','VN-52']),
 ('ca-mau','Cà Mau',['VN-59','VN-55']),
]
# Correct misleading regional display names in the source using their ISO codes.
NAME_FIXES={'VN-39':'Đồng Nai','VN-53':'Bắc Kạn','VN-66':'Hưng Yên','VN-SG':'Hồ Chí Minh','VN-26':'Thừa Thiên Huế'}
source=json.loads(Path(sys.argv[1]).read_text())
old={}
for f in source['features']:
 if f['properties'].get('adm0_a3')!='VNM': continue
 p=f['properties'];code=p['iso_3166_2']
 old[code]={'name':NAME_FIXES.get(code,p.get('name_vi') or p['name']),'geometry':make_valid(shape(f['geometry']))}
assert len(old)==63
all_members=[c for _,_,members in GROUPS for c in members]
assert len(GROUPS)==34 and len(all_members)==len(set(all_members))==63 and set(all_members)==set(old)

def build(items):
 geometries=[item['shape'] for item in items]
 neighbors=[set() for _ in items]
 for i in range(len(items)):
  for j in range(i):
   if geometries[i].distance(geometries[j])<0.00002:
    neighbors[i].add(j);neighbors[j].add(i)
 colors={}
 for i in sorted(range(len(items)),key=lambda i:(-len(neighbors[i]),items[i]['id'])):
  used={colors[j] for j in neighbors[i] if j in colors}
  colors[i]=next(c for c in range(8) if c not in used)
 features=[]
 for i,item in enumerate(items):
  assert item['shape'].is_valid and not item['shape'].is_empty
  features.append({'type':'Feature','properties':{k:item[k] for k in ('id','name','members')}|{'colorIndex':colors[i]},'geometry':mapping(item['shape'])})
 return {'type':'FeatureCollection','features':features}

historical=build([{'id':c,'name':v['name'],'members':[c],'shape':v['geometry']} for c,v in sorted(old.items())])
modern=build([{'id':id,'name':name,'members':members,'shape':unary_union([old[c]['geometry'] for c in members])} for id,name,members in GROUPS])
assert abs(unary_union([shape(f['geometry']) for f in historical['features']]).area-unary_union([shape(f['geometry']) for f in modern['features']]).area)<0.000001
root=Path(__file__).resolve().parents[1]/'public/maps'
root.mkdir(exist_ok=True)
for mode,data in [('63',historical),('34',modern)]:
 path=root/f'vietnam-provinces-{mode}.geojson'
 path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
 print(mode,len(data['features']),path.stat().st_size,'bytes')
