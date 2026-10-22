export const vietnamRegions=[{id:'bac',name:'Miền Bắc'},{id:'trung',name:'Miền Trung'},{id:'nam',name:'Miền Nam'}];
export function requestedVietnamRegion(search){return vietnamRegions.find(region=>region.id===new URLSearchParams(search).get('mien'))||null;}
export function memoryInVietnamRegion(memory,region){return !region||(memory.country==='VN'&&memory.vietnamRegion===region.id);}
