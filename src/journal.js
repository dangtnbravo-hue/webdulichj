const codes = 'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');
const names = new Intl.DisplayNames(['vi'], { type: 'region' });
const countries = codes.map(code => ({ code, name: names.of(code) })).sort((a,b) => a.name.localeCompare(b.name,'vi'));
const countryName = code => names.of(code);
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photoPattern = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/;
let state = { version: 1, countries: [], memories: [] };
let database;
let editingId = null;
let retainedPhotos = [];
let busy = false;
let journalGroup = 'vietnam';
const inGroup = code => journalGroup === 'vietnam' ? code === 'VN' : code !== 'VN';

function openDatabase() {
  return new Promise((resolve,reject) => {
    const request = indexedDB.open('may-du-ky-journal', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('journal');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Đóng các tab Đôn Đú Đởn khác rồi thử lại.'));
  });
}
function loadState() {
  return new Promise((resolve,reject) => {
    const transaction = database.transaction('journal', 'readonly');
    const request = transaction.objectStore('journal').get('state');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function persist(next) {
  if(new Blob([JSON.stringify(next)]).size > 45*1024*1024) return Promise.reject(new Error('Kho nhật ký tối đa 45 MB. Sao lưu rồi xóa bớt ảnh trước khi lưu thêm.'));
  return new Promise((resolve,reject) => {
    const transaction = database.transaction('journal', 'readwrite');
    transaction.objectStore('journal').put(next, 'state');
    transaction.oncomplete = () => { state = next; render(); resolve(); };
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Không thể lưu.'));
  });
}
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function announce(message) { document.querySelector('#journal-status').textContent = message; }
function setBusy(value) {
  busy = value;
  document.querySelectorAll('#my-journal button, #my-journal input, #my-journal select, #my-journal textarea, #memory-dialog button, #memory-dialog input, #memory-dialog select, #memory-dialog textarea').forEach(el => el.disabled = value);
}
async function mutate(action, message) {
  if(busy) return;
  setBusy(true);
  try { await action(); announce(message); }
  catch { window.dispatchEvent(new Event('journal:save-error')); announce('Chưa lưu được thay đổi. Dữ liệu hiện tại vẫn được giữ. Kiểm tra dung lượng hoặc quyền lưu trữ của trình duyệt.'); }
  finally { setBusy(false); }
}
function render() {
  window.dispatchEvent(new CustomEvent('journal:updated', { detail: { countries: [...state.countries], ready: Boolean(database) } }));
  document.querySelector('#country-count').textContent = state.countries.filter(code => code !== 'VN').length;
  const memories = state.memories.filter(m => inGroup(m.country));
  const visited = state.countries.filter(inGroup);
  document.querySelectorAll('[data-journal-group]').forEach(button => { const active = button.dataset.journalGroup === journalGroup; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
  document.querySelector('#journal-group-status').textContent = `${journalGroup === 'vietnam' ? 'Việt Nam' : 'Nước ngoài'} · ${memories.length} kỷ niệm`;
  const countrySelect = document.querySelector('#visited-country');
  const selectedCountry = countrySelect.value;
  countrySelect.innerHTML = countries.filter(c => inGroup(c.code)).map(c => `<option value="${c.code}">${escapeHTML(c.name)}</option>`).join('');
  countrySelect.value = inGroup(selectedCountry) && codes.includes(selectedCountry) ? selectedCountry : journalGroup === 'vietnam' ? 'VN' : 'JP';
  document.querySelector('#memory-count').textContent = state.memories.length;
  document.querySelector('#photo-count').textContent = state.memories.reduce((n,m) => n+m.photos.length,0);
  document.querySelector('#visited-countries').innerHTML = visited.length ? visited.map(code => `<span class="country-chip"><span>${escapeHTML(countryName(code))}</span><button data-remove-country="${code}" aria-label="Bỏ đánh dấu ${escapeHTML(countryName(code))}">×</button></span>`).join('') : '<p class="journal-empty-small">Chưa có dấu chân trong nhóm này. Thêm điểm đến đầu tiên của bạn.</p>';
  document.querySelector('#memory-grid').innerHTML = memories.length ? memories.map(m => `<article class="memory-card">${m.photos[0] ? `<button class="memory-cover" data-view-memory="${m.id}" aria-label="Xem ${escapeHTML(m.title)}"><img src="${m.photos[0]}" alt="Ảnh kỷ niệm: ${escapeHTML(m.title)}" loading="lazy"><span>${m.photos.length} ảnh</span></button>` : '<div class="memory-no-photo">MỘT CHUYẾN ĐI, MỘT CÂU CHUYỆN</div>'}<div class="memory-card-body"><p class="memory-meta">${escapeHTML(countryName(m.country))}${m.date ? ` · ${escapeHTML(new Date(`${m.date}T12:00:00`).toLocaleDateString('vi-VN'))}` : ''}</p><h3><button data-view-memory="${m.id}">${escapeHTML(m.title)}</button></h3><p class="memory-excerpt">${escapeHTML(m.story || m.tips || 'Một dấu chân mới trong hành trình của bạn.')}</p><div class="memory-actions"><button data-edit-memory="${m.id}">Chỉnh sửa</button><button data-share-memory="${m.id}">Xuất để chia sẻ ↗</button><button data-delete-memory="${m.id}" class="delete-memory">Xóa</button></div></div></article>`).join('') : '<div class="journal-empty"><span>✧</span><h3>Nhóm này đang chờ câu chuyện của bạn.</h3><p>Thêm ảnh, ghi lại một kỷ niệm, chia sẻ điều bạn đã học được trên đường.</p><button class="button blue" id="empty-add-memory">Viết kỷ niệm đầu tiên +</button></div>';
  document.querySelector('#empty-add-memory')?.addEventListener('click', () => openEditor());
}
function validState(raw) {
  if(!raw || raw.version !== 1 || !Array.isArray(raw.countries) || !Array.isArray(raw.memories) || raw.memories.length > 500 || raw.countries.some(c => !codes.includes(c))) throw new Error('Invalid backup');
  const ids = new Set();
  const memories = raw.memories.map(m => {
    if(!m || !/^[a-f0-9-]{36}$/.test(m.id) || ids.has(m.id) || !codes.includes(m.country) || typeof m.title !== 'string' || !m.title.trim() || m.title.length > 120 || typeof m.story !== 'string' || m.story.length > 20000 || typeof m.tips !== 'string' || m.tips.length > 10000 || typeof m.date !== 'string' || (m.date && (!/^\d{4}-\d{2}-\d{2}$/.test(m.date) || !Number.isFinite(Date.parse(m.date)) || new Date(m.date).toISOString().slice(0,10)!==m.date)) || !Array.isArray(m.photos) || m.photos.length > 12 || m.photos.some(p => typeof p !== 'string' || p.length > 3000000 || !photoPattern.test(p))) throw new Error('Invalid memory');
    ids.add(m.id);
    return { id: m.id, title: m.title.trim(), country: m.country, date: m.date, story: m.story, tips: m.tips, photos: [...m.photos] };
  });
  return { version: 1, countries: [...new Set([...raw.countries,...memories.map(m=>m.country)])], memories };
}
async function resizePhoto(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 15*1024*1024) throw new Error('Chọn ảnh JPG, PNG hoặc WebP, mỗi ảnh tối đa 15 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
    const canvas = document.createElement('canvas'); canvas.width=Math.max(1,Math.round(bitmap.width*scale)); canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const context = canvas.getContext('2d'); context.fillStyle='#fff'; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(bitmap,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',.84);
  } finally { bitmap.close(); }
}
function renderPhotoPreview() {
  document.querySelector('#retained-photos').innerHTML=retainedPhotos.map((photo,index)=>`<div><img src="${photo}" alt="Ảnh đã lưu ${index+1}"><button type="button" data-remove-photo="${index}" aria-label="Bỏ ảnh ${index+1}">×</button></div>`).join('');
}
function openEditor(memory) {
  editingId = memory?.id || null; retainedPhotos = [...(memory?.photos || [])];
  const form = document.querySelector('#memory-form'); form.reset();
  form.elements.title.value = memory?.title || ''; form.elements.country.value = memory?.country || (journalGroup === 'vietnam' ? 'VN' : state.countries.find(code => code !== 'VN') || 'JP'); form.elements.date.value = memory?.date || ''; form.elements.story.value = memory?.story || ''; form.elements.tips.value = memory?.tips || '';
  document.querySelector('#memory-editor-heading').textContent = memory ? 'Chỉnh sửa kỷ niệm' : 'Giữ lại một chuyến đi';
  document.querySelector('#memory-save-status').textContent = ''; renderPhotoPreview();
  document.querySelector('#memory-dialog').showModal(); document.body.classList.add('dialog-open');
}
function viewMemory(memory) {
  const dialog = document.querySelector('#memory-view');
  dialog.querySelector('.memory-view-body').innerHTML = `<p class="eyebrow">${escapeHTML(countryName(memory.country))}${memory.date ? ` · ${escapeHTML(memory.date)}` : ''}</p><h2>${escapeHTML(memory.title)}</h2>${memory.story ? `<h3>Kỷ niệm của tôi</h3><p class="preserve-lines">${escapeHTML(memory.story)}</p>` : ''}${memory.tips ? `<h3>Kinh nghiệm muốn chia sẻ</h3><p class="preserve-lines">${escapeHTML(memory.tips)}</p>` : ''}<div class="memory-gallery">${memory.photos.map((p,i)=>`<img src="${p}" alt="${escapeHTML(memory.title)} — ảnh ${i+1}" loading="lazy">`).join('')}</div>`;
  dialog.showModal(); document.body.classList.add('dialog-open');
}
function exportAlbum(memories, selected = false) {
  if(!memories.length) { announce('Thêm một kỷ niệm trước khi xuất album.'); return; }
  if(!window.confirm('Album HTML sẽ chứa ảnh, kỷ niệm và kinh nghiệm của bạn. Người nhận có thể xem toàn bộ nội dung trong tệp. Tiếp tục xuất?')) return;
  const visited = selected ? [...new Set(memories.map(m=>m.country))] : state.countries;
  const html = `<!doctype html><html lang="vi"><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Nhật ký hành trình · Đôn Đú Đởn</title><style>body{margin:0;background:#f4f8fa;color:#18344a;font:16px/1.8 system-ui,sans-serif}main{max-width:850px;margin:auto;padding:40px 22px}header{padding:30px 0;border-bottom:3px solid #249957}h1,h2{line-height:1.4}h1{color:#087cbd}article{background:white;padding:28px;border-radius:12px;margin:28px 0}h3{color:#249957}p{white-space:pre-wrap;overflow-wrap:anywhere}img{max-width:100%;height:auto;border-radius:8px;display:block;margin:15px auto}.meta{font-size:13px;color:#607a86}footer{font-size:12px;color:#607a86}</style><main><header><div>ĐÔN ĐÚ ĐỞN · NHẬT KÝ CÁ NHÂN</div><h1>Đi để nhớ. Kể để kết nối.</h1><p>${visited.filter(code => code !== 'VN').length} nước ngoài đã đến${visited.includes('VN') ? ' · Có hành trình Việt Nam' : ''} · ${memories.length} kỷ niệm</p><p class="meta">${escapeHTML(visited.map(countryName).join(' · '))}</p></header>${memories.map(m=>`<article><div class="meta">${escapeHTML(countryName(m.country))}${m.date ? ` · ${escapeHTML(m.date)}` : ''}</div><h2>${escapeHTML(m.title)}</h2>${m.story ? `<h3>Kỷ niệm</h3><p>${escapeHTML(m.story)}</p>` : ''}${m.tips ? `<h3>Kinh nghiệm muốn chia sẻ</h3><p>${escapeHTML(m.tips)}</p>` : ''}${m.photos.map((p,i)=>`<img src="${p}" alt="${escapeHTML(m.title)} — ảnh ${i+1}">`).join('')}</article>`).join('')}<footer>Album cá nhân được xuất từ Đôn Đú Đởn. Tệp chứa ảnh để xem mà không cần kết nối Internet.</footer></main></html>`;
  download('don-du-don-album.html',html,'text/html;charset=utf-8'); announce('Đã xuất album HTML. Bạn có thể gửi tệp cho người thân; đây chưa phải đường link công khai.');
}
export async function mountJournal() {
  const section = document.createElement('section'); section.id='my-journal'; section.className='section personal-journal';
  const options = countries.map(c=>`<option value="${c.code}">${escapeHTML(c.name)}</option>`).join('');
  section.innerHTML = `<div class="container"><div class="journal-heading"><div><p class="eyebrow">HỘ CHIẾU CỦA NHỮNG KỶ NIỆM</p><h2>Thế giới qua <em>đôi mắt bạn.</em></h2><p>Những nơi đã đến. Những người đã gặp. Những điều muốn giữ mãi.</p></div><button id="add-memory" class="button blue">Viết kỷ niệm +</button></div><div class="journal-stats"><div><strong id="country-count">0</strong><span>nước ngoài đã đến</span></div><div><strong id="memory-count">0</strong><span>tổng kỷ niệm đã lưu</span></div><div><strong id="photo-count">0</strong><span>tổng ảnh hành trình</span></div><p>Mỗi vùng đất một dấu chân.<br>Mỗi chuyến đi một câu chuyện.</p></div><div class="storage-notice"><strong>Nhật ký riêng trên trình duyệt này</strong><p>Ảnh và bài viết chưa được đưa lên mạng hoặc đồng bộ thiết bị. Xóa dữ liệu trình duyệt có thể làm mất nhật ký. Hãy tải bản sao lưu sau khi thêm kỷ niệm. Ảnh được tối ưu kích thước; giữ bản gốc ở nơi khác.</p></div><div class="journal-group-bar"><div class="filters journal-group-filters" aria-label="Chọn nhóm nhật ký"><button data-journal-group="vietnam" class="active" aria-pressed="true">Việt Nam</button><button data-journal-group="abroad" aria-pressed="false">Nước ngoài</button></div><p id="journal-group-status" role="status"></p></div><div class="passport"><div><h3>Những dấu chân của tôi</h3><p>Bộ đếm nước ngoài không gồm Việt Nam. Một nước chỉ tính một lần, dù bạn quay lại nhiều lần.</p></div><form id="country-form"><label class="sr-only" for="visited-country">Quốc gia đã đến</label><select id="visited-country">${options}</select><button class="button green-button">Đã đến +</button></form><div id="visited-countries"></div></div><div class="journal-tools"><h3>Ngăn ký ức</h3><div><button id="backup-journal">Tải bản sao lưu</button><button id="import-journal">Nhập bản sao lưu</button><button id="share-journal">Xuất album chia sẻ ↗</button><input id="backup-file" type="file" accept="application/json,.json" hidden></div></div><p id="journal-status" role="status" aria-live="polite"></p><div id="memory-grid"></div></div>`;
  document.querySelector('#about').before(section);
  document.body.insertAdjacentHTML('beforeend', `<dialog id="memory-dialog" aria-labelledby="memory-editor-heading"><button class="dialog-close" type="button" aria-label="Đóng biểu mẫu">×</button><form id="memory-form"><p class="eyebrow">MỘT MẢNH KÝ ỨC MỚI</p><h2 id="memory-editor-heading">Giữ lại một chuyến đi</h2><label>Tên kỷ niệm<input name="title" required maxlength="120" placeholder="Ngày đầu tiên ở Nhật Bản…"></label><div class="memory-form-row"><label>Quốc gia<select name="country" required>${options}</select></label><label>Ngày chuyến đi<input name="date" type="date"></label></div><label>Kỷ niệm của bạn<textarea name="story" rows="5" maxlength="20000" placeholder="Điều gì khiến bạn nhớ nhất về chuyến đi này?"></textarea></label><label>Kinh nghiệm muốn chia sẻ<textarea name="tips" rows="4" maxlength="10000" placeholder="Đi lại, chỗ ở, món ngon, những điều nên chuẩn bị…"></textarea></label><label>Ảnh kỷ niệm<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><p class="photo-help">Tối đa 12 ảnh mỗi kỷ niệm, mỗi ảnh tối đa 15 MB. Hỗ trợ JPG, PNG, WebP. Ảnh được thu nhỏ tối đa 1600 px để tiết kiệm dung lượng.</p><div id="retained-photos"></div><p id="memory-save-status" role="status"></p><button class="button blue" type="submit">Lưu kỷ niệm</button></form></dialog><dialog id="memory-view" aria-label="Chi tiết kỷ niệm"><button class="dialog-close" type="button" aria-label="Đóng kỷ niệm">×</button><div class="memory-view-body"></div></dialog>`);
  render(); setBusy(true);
  try { database = await openDatabase(); const stored = await loadState(); if(stored) state = validState(stored); render(); setBusy(false); }
  catch { announce('Không mở được kho lưu trữ. Hãy bật quyền lưu trữ, kiểm tra chế độ riêng tư hoặc thử trình duyệt khác. Nhật ký hiện chưa sẵn sàng.'); return; }
  document.querySelectorAll('[data-journal-group]').forEach(button => button.addEventListener('click', () => { journalGroup = button.dataset.journalGroup; render(); }));
  window.addEventListener('map:show-journal', event => {
    if (busy || !codes.includes(event.detail?.code)) return;
    journalGroup = event.detail.code === 'VN' ? 'vietnam' : 'abroad';
    render();
  });
  window.addEventListener('map:visit', event => {
    const code = event.detail?.code;
    if (!codes.includes(code) || busy) { window.dispatchEvent(new Event('journal:save-error')); return; }
    if (state.countries.includes(code)) { render(); return; }
    mutate(() => persist({...state, countries: [...state.countries, code]}), `Đã đánh dấu ${countryName(code)} trên bản đồ.`);
  });
  document.querySelector('#add-memory').addEventListener('click',()=>openEditor());
  document.querySelector('#country-form').addEventListener('submit',event=>{event.preventDefault();const code=document.querySelector('#visited-country').value;if(state.countries.includes(code)){announce(`${countryName(code)} đã có trong danh sách. Mỗi quốc gia chỉ tính một lần.`);return;}mutate(()=>persist({...state,countries:[...state.countries,code]}),`Đã thêm ${countryName(code)} vào hành trình.`);});
  section.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||busy)return;
    if(button.dataset.removeCountry){const code=button.dataset.removeCountry;if(state.memories.some(m=>m.country===code)){announce('Quốc gia này đang có kỷ niệm. Hãy chuyển hoặc xóa các kỷ niệm liên quan trước khi bỏ đánh dấu.');return;}if(window.confirm(`Bỏ ${countryName(code)} khỏi danh sách đã đến?`))mutate(()=>persist({...state,countries:state.countries.filter(c=>c!==code)}),'Đã bỏ đánh dấu quốc gia.');}
    const id=button.dataset.editMemory||button.dataset.viewMemory||button.dataset.deleteMemory||button.dataset.shareMemory;const memory=state.memories.find(m=>m.id===id);if(!memory)return;
    if(button.dataset.editMemory)openEditor(memory);if(button.dataset.viewMemory)viewMemory(memory);if(button.dataset.shareMemory)exportAlbum([memory],true);
    if(button.dataset.deleteMemory&&window.confirm(`Xóa kỷ niệm “${memory.title}” và các ảnh đi kèm? Danh sách quốc gia đã đến vẫn được giữ.`))mutate(()=>persist({...state,memories:state.memories.filter(m=>m.id!==id)}),'Đã xóa kỷ niệm. Quốc gia đã đến vẫn được giữ.');
  });
  document.querySelectorAll('#memory-dialog, #memory-view').forEach(dialog=>{dialog.querySelector('.dialog-close').addEventListener('click',()=>{if(!busy)dialog.close();});dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));});
  document.querySelector('#retained-photos').addEventListener('click',e=>{const button=e.target.closest('[data-remove-photo]');if(button){retainedPhotos.splice(Number(button.dataset.removePhoto),1);renderPhotoPreview();}});
  document.querySelector('#memory-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    const form=event.currentTarget;const fields=new FormData(form);const files=[...form.elements.photos.files];const status=document.querySelector('#memory-save-status');
    if(!String(fields.get('title')).trim()){status.textContent='Vui lòng nhập tên kỷ niệm.';return;}
    if(files.length+retainedPhotos.length>12){status.textContent='Mỗi kỷ niệm tối đa 12 ảnh. Bỏ bớt ảnh trước khi lưu.';return;}
    setBusy(true);status.textContent='Đang xử lý ảnh và lưu kỷ niệm…';
    try{const photos=[...retainedPhotos];for(const file of files)photos.push(await resizePhoto(file));const memory={id:editingId||crypto.randomUUID(),title:String(fields.get('title')).trim(),country:String(fields.get('country')),date:String(fields.get('date')),story:String(fields.get('story')),tips:String(fields.get('tips')),photos};const next=validState({...state,countries:[...new Set([...state.countries,memory.country])],memories:editingId?state.memories.map(m=>m.id===editingId?memory:m):[memory,...state.memories]});const previousGroup=journalGroup;journalGroup=memory.country==='VN'?'vietnam':'abroad';try{await persist(next);}catch(error){journalGroup=previousGroup;throw error;}document.querySelector('#memory-dialog').close();announce('Đã lưu kỷ niệm và cập nhật bộ đếm. Nhớ tải bản sao lưu để giữ an toàn.');}
    catch(error){status.textContent=error.message.startsWith('Chọn ảnh')?error.message:'Chưa lưu được. Kiểm tra định dạng ảnh và dung lượng trình duyệt; dữ liệu cũ vẫn được giữ.';}
    finally{setBusy(false);}
  });
  document.querySelector('#backup-journal').addEventListener('click',()=>{download(`don-du-don-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(state),'application/json');announce('Đã tải bản sao lưu gồm ảnh và nội dung. Giữ tệp ở nơi riêng tư; có thể nhập lại trên thiết bị khác.');});
  document.querySelector('#share-journal').addEventListener('click',()=>exportAlbum(state.memories));
  document.querySelector('#import-journal').addEventListener('click',()=>document.querySelector('#backup-file').click());
  document.querySelector('#backup-file').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file||busy)return;if(file.size>50*1024*1024){announce('Tệp sao lưu tối đa 50 MB.');return;}setBusy(true);try{const incoming=validState(JSON.parse(await file.text()));if(!window.confirm(`Nhập ${incoming.memories.length} kỷ niệm, ${incoming.countries.length} quốc gia? Dữ liệu sẽ được gộp. Kỷ niệm có cùng mã sẽ được thay bằng bản nhập.`))return;const merged=new Map(state.memories.map(m=>[m.id,m]));incoming.memories.forEach(m=>merged.set(m.id,m));await persist(validState({version:1,countries:[...new Set([...state.countries,...incoming.countries])],memories:[...merged.values()]}));announce('Đã nhập bản sao lưu và gộp với nhật ký hiện tại.');}catch{announce('Không nhập được: tệp không đúng định dạng, quá giới hạn, hoặc không đủ dung lượng. Dữ liệu cũ vẫn được giữ.');}finally{setBusy(false);}});
}
