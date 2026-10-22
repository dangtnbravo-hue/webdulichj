import {articleHTML} from './article-blocks.js';
import {cloudClient, cloudConfigured} from './cloud-config.js';
import {validState} from './journal.js';
import {jakartaDraft} from './jakarta-draft.js';

const edit=document.createElement('a');
edit.href='/the-gioi/?quan-tri=1';edit.textContent='Chủ website: sửa bài và thêm ảnh';
document.querySelector('footer').append(edit);

// Keep the original article available if the cloud is not configured or offline.
async function loadArticle(){
  if(!cloudConfigured)return;
  try{
    const {data,error}=await cloudClient.from('site_journal').select('content').eq('id',1).single();
    if(error)throw error;
    const memory=validState(data.content).memories.find(m=>m.id===jakartaDraft.id);
    if(!memory)return;
    document.title=`${memory.title} · Đôn Đú Đởn`;
    document.querySelector('h1').textContent=memory.title;
    document.querySelector('.meta').textContent=`Indonesia${memory.date?' · '+memory.date:''}`;
    const story=document.querySelector('.story');story.innerHTML=articleHTML(memory);
    if(memory.tips){const paragraph=document.createElement('p');paragraph.textContent=memory.tips;paragraph.style.whiteSpace='pre-wrap';story.append(paragraph);}
    document.querySelector('.note').textContent='Bài viết do Đôn cập nhật trực tiếp trên website.';
  }catch{
    document.querySelector('.note').textContent='Chưa tải được bản cập nhật mới nhất. Đang hiển thị bản bài viết có sẵn; hãy thử tải lại khi có kết nối.';
  }
}
loadArticle();
