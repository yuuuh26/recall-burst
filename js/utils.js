export const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const uid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export function shuffle(list,rng=Math.random){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function toast(message){const e=document.querySelector('#toast');e.textContent=message;e.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>e.classList.remove('visible'),3500);}
export function downloadJSON(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
export const dateLabel = value => new Date(value).toLocaleString('ja-JP',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
export function showDialog(html){const dlg=document.querySelector('#dialog');document.querySelector('#dialog-body').innerHTML=html;dlg.showModal();return dlg;}
export const closeDialog = () => document.querySelector('#dialog').close();
export function bindDialogClose(){document.querySelector('#dialog-body').querySelectorAll('[data-close]').forEach(e=>e.onclick=closeDialog);}
