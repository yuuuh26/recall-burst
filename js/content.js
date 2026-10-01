import {validateImport} from './backup.js';

// Original fields stay lossless in sourceData; displayed prompt/answer are unchanged.
export function toeicPack(words){
 if(!Array.isArray(words)||words.length!==500)throw new Error('TOEIC問題集の形式が正しくありません。');
 const deckId='toeic-beat';const date='2026-10-01T00:00:00.000Z';
 return {format:'recall-burst-ai',schemaVersion:1,decks:[{id:deckId,name:'TOEIC BEAT · 500語',description:'TOEIC BEATの単語・訳・例文をそのまま移植。LEVEL 1〜5を選べます。',ranges:[{id:'all',name:'全500語'},...Array.from({length:5},(_,i)=>({id:`level-${i+1}`,name:`LEVEL ${i+1} · 100語`,tag:`level:${i+1}`}))],createdAt:date,updatedAt:date}],questions:words.map(w=>({id:`toeic-beat:${w.id}`,deckId,prompt:w.word,answer:w.meaning,promptLang:'en-US',answerLang:'ja-JP',choices:[],enabled:true,tags:[`level:${w.level}`,w.partOfSpeech],difficulty:String(w.difficulty),category:w.category,sourceApp:'toeic-beat',sourceData:structuredClone(w),note:[`発音：/${w.ipa}/`, `品詞：${w.partOfSpeech} · LEVEL ${w.level}`,w.example1,w.example1Ja,w.example2,w.example2Ja,`組み合わせ：${w.collocations.join(' / ')}`,w.note,`同義語：${w.synonyms.join(' / ')}`].join('\n'),createdAt:date,updatedAt:date}))};
}
export async function loadContentPacks(){
 const response=await fetch('./data/packs.json');if(!response.ok)throw new Error('問題集の一覧を読み込めませんでした。');const registry=await response.json();
 if(!Array.isArray(registry))throw new Error('問題集の一覧が不正です。');
 const packs=[];for(const entry of registry){const file=await fetch(entry.path);if(!file.ok)throw new Error('問題集を読み込めませんでした。');const raw=await file.json();packs.push({id:entry.id,...validateImport(entry.format==='toeic-beat'?toeicPack(raw):raw)});}return packs;
}
export function installContentPacks(state,packs){
 const next=structuredClone(state);let changed=false;
 for(const pack of packs){
  const marker=`content-pack:${pack.id}`;if(next.appMeta.some(x=>x.id===marker))continue;
  const decks=new Set(next.decks.map(x=>x.id));const questions=new Map(next.questions.map(x=>[x.id,x]));
  for(const q of pack.questions){const existing=questions.get(q.id);if(existing&&existing.deckId!==q.deckId)throw new Error('問題集のIDが既存問題と重複しています。');}
  // Existing edits/disabled flags win; never replace questions or learning records.
  next.decks.unshift(...structuredClone(pack.decks.filter(d=>!decks.has(d.id))));
  next.questions.push(...structuredClone(pack.questions.filter(q=>!questions.has(q.id))));
  next.appMeta.push({id:marker,installedAt:new Date().toISOString()});changed=true;
 }return {state:next,changed};
}
export function questionsInRange(questions,deck,rangeId='all'){
 const range=deck?.ranges?.find(r=>r.id===rangeId);
 return questions.filter(q=>q.deckId===deck?.id&&q.enabled!==false&&(!range?.tag||q.tags?.includes(range.tag)));
}
