import {shuffle} from './utils.js';
export const emptyStats = (id,direction='forward') => ({id:`${id}:${direction}`,questionId:id,direction,attempts:0,correct:0,streak:0,totalMs:0,lastSeen:null,lastMiss:null,mastery:'NEW'});
export function updateStats(previous,id,correct,ms,direction='forward',date=new Date().toISOString()){
 const s={...emptyStats(id,direction),...previous};s.attempts++;s.correct+=Number(correct);s.streak=correct?s.streak+1:0;s.totalMs+=ms;s.lastSeen=date;if(!correct)s.lastMiss=date;
 const rate=s.correct/s.attempts;const avg=s.totalMs/s.attempts;
 s.mastery=rate>=0.9&&s.streak>=5&&avg<=4000?'MASTERED':rate>=0.75&&s.streak>=3?'FAMILIAR':'LEARNING';return s;
}
export const weak = s => !!s?.attempts&&(s.streak===0||s.correct/s.attempts<0.8||s.totalMs/s.attempts>4000);
export function priority(s,time=Date.now()){
 if(s?.lastMiss&&s.streak<3&&time-Date.parse(s.lastMiss)<7*86400000)return 600+Math.max(0,3-s.streak);
 if(s?.attempts&&s.correct/s.attempts<0.8)return 500+(1-s.correct/s.attempts)*50;
 if(s?.attempts&&s.totalMs/s.attempts>4000)return 400+Math.min(50,s.totalMs/s.attempts/1000);
 if(s?.lastSeen&&time-Date.parse(s.lastSeen)>7*86400000)return 300+Math.min(50,(time-Date.parse(s.lastSeen))/86400000);
 if(!s?.attempts)return 200;
 return s.mastery==='MASTERED'?50:100;
}
export function buildQueue(questions,stats,count,direction='forward',onlyWeak=false){const map=new Map(stats.map(s=>[s.id,s]));let pool=questions.filter(q=>q.enabled!==false);if(onlyWeak)pool=pool.filter(q=>weak(map.get(`${q.id}:${direction}`)));if(!pool.length)return [];
 // Randomize ties; keep the six priority bands meaningful. Even mastered cards stay in normal sessions.
 const sorted=shuffle(pool).sort((a,b)=>priority(map.get(`${b.id}:${direction}`))-priority(map.get(`${a.id}:${direction}`)));
 const result=[];while(result.length<count){for(const q of sorted){if(result.length>=count)break;if(pool.length>1&&result.at(-1)?.id===q.id)continue;result.push(q);}}return result;
}
export function scheduleRetry(queue,index,question,retried,rng=Math.random){if(retried.has(question.id))return;retried.add(question.id);const gap=3+Math.floor(rng()*6);const desired=index+gap+1;
 // Add intervening cards at a short session's tail, so the missed card is never repeated immediately.
 while(queue.length<desired){const filler=queue.filter(q=>q.id!==question.id);if(!filler.length)break;queue.push(filler[(queue.length-index-1)%filler.length]);}
 queue.splice(Math.min(desired,queue.length),0,question);
}
export function makeChoices(q,pool,direction='forward'){
 const answer=direction==='reverse'?q.prompt:q.answer;
 if(q.sourceApp==='toeic-beat'&&q.sourceData){
  const source=q.sourceData;const seen=new Set([answer,...(direction==='reverse'?source.synonyms:source.excludeMeanings)]);
  const eligible=shuffle(pool.filter(x=>x.enabled!==false&&x.id!==q.id&&x.sourceApp===q.sourceApp&&x.sourceData?.partOfSpeech===source.partOfSpeech&&!(source.synonyms??[]).includes(x.prompt)&&!(source.excludeMeanings??[]).includes(x.answer)&&(direction!=='reverse'||x.answer!==q.answer)))
   .sort((a,b)=>Number(b.category===q.category)-Number(a.category===q.category));
  const distractors=[];for(const x of eligible){const value=direction==='reverse'?x.prompt:x.answer;if(value&&!seen.has(value)){seen.add(value);distractors.push(value);if(distractors.length===3)break;}}
  return distractors.length===3?shuffle([answer,...distractors]):null;
 }
 const provided=direction==='reverse'?[]:(q.choices??[]);
 const candidates=[...new Set([...provided,...pool.filter(x=>x.enabled!==false&&x.id!==q.id).map(x=>direction==='reverse'?x.prompt:x.answer)])].filter(x=>x&&x!==answer);
 if(candidates.length<3)return null;return shuffle([answer,...shuffle(candidates).slice(0,3)]);
}
