export const CHARACTERS = [{id:'koharu',name:'小春',folder:'assets/avatars/koharu/',neutral:'neutral.webp',smile:'smile.webp',happy:'happy.webp',delight:'delight.webp',fever:'fever.webp',cheer:'cheer.webp',wink:'wink.webp',clap:'clap.webp',laugh:'laugh.webp',miss:'miss.webp',clear:'clear.webp'}];
export const character = id => CHARACTERS.find(c=>c.id===id)??CHARACTERS[0];
export function avatarURL(id,state='neutral'){const c=character(id);return new URL('../'+c.folder+(c[state]??c.neutral),import.meta.url).href;}
export async function preloadCharacter(id){const c=character(id);const files=[...new Set(Object.values(c).filter(v=>typeof v==='string'&&/\.(webp|png|jpg)$/.test(v)))];await Promise.all(files.map(file=>new Promise(resolve=>{const image=new Image();image.onload=async()=>{try{await image.decode?.();}catch{}resolve();};image.onerror=resolve;image.src=new URL('../'+c.folder+file,import.meta.url).href;})));}
export function joyLevel(score){return score>=1200?3:score>=500?2:score>0?1:0;}
export function idleExpression(score,combo,index,correctCount=0){if(index>0&&(index+1)%6===0)return 'cheer';if(combo>=10)return ['delight','laugh','happy'][index%3];if(correctCount>=12)return 'delight';return ['neutral','smile','happy','delight'][joyLevel(score)];}
export function rewardExpression(type,score,combo,{correctCount=combo,perfectStreak=0,previous,index=correctCount}={}){
 if(type==='MISS')return 'miss';if(type==='CLEAR')return 'clear';
 const milestones={3:'happy',5:'clap',10:'laugh',20:'clap',30:'laugh',50:'cheer'};
 if(milestones[combo])return milestones[combo];if(type==='FEVER')return 'laugh';
 const earned=Math.max(joyLevel(score),correctCount>=12?3:correctCount>=6?2:correctCount>0?1:0);
 let pool=earned>=3?['laugh','clap','delight','wink','cheer']:earned>=2?['delight','wink','clap','cheer']:correctCount>=3?['happy','delight','wink']:type==='PERFECT'?['delight','happy']:type==='GREAT'?['happy','smile']:['smile','happy'];
 if(perfectStreak>0&&perfectStreak%3===0&&previous!=='wink')return 'wink';
 pool=pool.filter(s=>s!==previous);return pool[index%pool.length];
}
export function reactionMessage(type,score,correctCount,expression){
 if(type==='MISS')return '惜しい！ 次で取り返そう！';
 if(expression==='clap')return 'すごい！ 拍手しちゃう！';if(expression==='wink')return 'ばっちり！ その調子！';if(expression==='laugh')return 'やった！！ どんどん覚えてる！';if(expression==='cheer')return 'がんばって！ 私も応援してるよ！';
 const phrases=correctCount>=12||score>=1200?['最高！！ 一緒にもっといこう！','すっごくうれしい！ また正解だね！','すごいよ！ 思わず笑顔になっちゃう！']:correctCount>=6||score>=500?['いいね！ 私もうれしくなってきた！','覚えてきたね！ この調子！','その正解、うれしい！']:type==='PERFECT'?['完璧！！ めっちゃ覚えてる！']:type==='GREAT'?['いいね！ かなり覚えてる！']:['ちゃんと思い出せたね！'];return phrases[correctCount%phrases.length];
}
export function setCharacter(id,state,combo=0,reaction='neutral',score=0){const stage=document.querySelector('.game-avatar');if(!stage)return;const img=stage.querySelector('img');img.src=avatarURL(id,state);img.alt=`${character(id).name}：${{neutral:'思い出すのを待っている',smile:'うれしそうな笑顔',happy:'明るい笑顔',delight:'大喜び',cheer:'応援のポーズ',wink:'うれしそうにウインク',clap:'正解に拍手',laugh:'喜びで笑っている',fever:'FEVERで大喜び',miss:'次も応援している',clear:'クリアを喜んでいる'}[state]??'笑顔'}`;stage.dataset.expression=state;stage.dataset.joy=joyLevel(score);const label=stage.querySelector('#joy-label');if(label)label.textContent=['',' · うれしい！',' · わくわく！',' · 大喜び！'][joyLevel(score)];stage.dataset.reaction=reaction;stage.style.setProperty('--closeness',String(combo>=20?1.18:combo>=10?1.12:combo>=5?1.08:combo>=3?1.04:1));}
export function reactCharacter(id,type,combo,score=0,context={}){const expression=rewardExpression(type,score,combo,context);setCharacter(id,expression,combo,type,score);return expression;}
