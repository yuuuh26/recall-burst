import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {toeicPack,installContentPacks,questionsInRange} from '../js/content.js';
import {validateImport,exportBackup,exportAI} from '../js/backup.js';
import {makeChoices,updateStats} from '../js/learning.js';
import {rewardExpression,idleExpression} from '../js/characters.js';
import {DEFAULT_SETTINGS} from '../js/config.js';
const words=JSON.parse(fs.readFileSync(new URL('../data/toeic-beat.json',import.meta.url)));
const pack={id:'toeic-beat-500-v1',...validateImport(toeicPack(words))};
const old={decks:[{id:'mine',name:'自分の問題'}],questions:[{id:'mine:1',deckId:'mine',prompt:'MY PROMPT',answer:'MY ANSWER',enabled:false}],questionStats:[updateStats(null,'mine:1',true,1000)],sessions:[],settings:{...DEFAULT_SETTINGS,bgm:'OFF'},characters:[],appMeta:[{id:'initialized'},{id:'lastDeck',deckId:'mine'}]};
test('all original 500 source records stay lossless, with five 100-word ranges',()=>{
 assert.equal(words.length,500);assert.equal(new Set(words.map(w=>w.id)).size,500);
 for(let i=0;i<500;i++){const q=pack.questions[i];assert.deepEqual(q.sourceData,words[i]);assert.equal(q.prompt,words[i].word);assert.equal(q.answer,words[i].meaning);assert.equal(q.promptLang,'en-US');assert.equal(q.answerLang,'ja-JP');for(const field of ['example1','example1Ja','example2','example2Ja','note'])assert(q.note.includes(words[i][field]));}
 for(let level=1;level<=5;level++){const list=questionsInRange(pack.questions,pack.decks[0],`level-${level}`);assert.equal(list.length,100);assert(list.every(q=>q.sourceData.level===level));}
 assert.equal(questionsInRange(pack.questions,pack.decks[0]).length,500);
});
test('TOEIC four-choice candidates preserve POS and avoid synonyms/exclusions in both directions',()=>{
 for(const q of pack.questions)for(const direction of ['forward','reverse']){
  const choices=makeChoices(q,pack.questions,direction);assert.equal(new Set(choices).size,4,`${q.id}:${direction}`);
  const answer=direction==='reverse'?q.prompt:q.answer;assert(choices.includes(answer));
  for(const value of choices.filter(x=>x!==answer)){
   assert(!(direction==='reverse'?q.sourceData.synonyms:q.sourceData.excludeMeanings).includes(value));
   assert(pack.questions.some(x=>(direction==='reverse'?x.prompt:x.answer)===value&&x.sourceData.partOfSpeech===q.sourceData.partOfSpeech&&x.id!==q.id&&!q.sourceData.synonyms.includes(x.prompt)&&!q.sourceData.excludeMeanings.includes(x.answer)&&(direction!=='reverse'||x.answer!==q.answer)));
  }
 }
});
test('install is additive, atomic before save, idempotent and never resurrects deleted pack questions',()=>{
 const before=structuredClone(old);const installed=installContentPacks(old,[pack]);assert(installed.changed);assert.deepEqual(old,before);assert.deepEqual(installed.state.questions[0],old.questions[0]);
 for(const key of ['questionStats','sessions','settings','characters'])assert.deepEqual(installed.state[key],old[key]);assert.equal(installed.state.questions.length,501);
 const edited=installed.state;edited.questions[1].prompt='EDITED';edited.questions[1].enabled=false;edited.questions.pop();edited.decks[0].name='MY NAME';
 const again=installContentPacks(edited,[pack]);assert.equal(again.changed,false);assert.deepEqual(again.state,edited);
 const collision=structuredClone(old);collision.questions.push({...pack.questions[0],deckId:'mine'});const collisionBefore=structuredClone(collision);assert.throws(()=>installContentPacks(collision,[pack]));assert.deepEqual(collision,collisionBefore);
});
test('AI/full backup roundtrip keeps ranges and every source field',()=>{
 const state={...old,decks:pack.decks,questions:pack.questions,questionStats:[]};
 const ai=validateImport(exportAI(state));assert.deepEqual(ai.decks,state.decks);assert.deepEqual(ai.questions,state.questions);
 const backup=validateImport(exportBackup(state));assert.deepEqual(backup.questions,state.questions);assert.deepEqual(backup.decks,state.decks);
 const malformed=exportAI(state);malformed.questions[0].sourceData.synonyms='invalid';assert.throws(()=>validateImport(malformed));
});
test('correct accumulation expands rewards, survives combo reset and varies FEVER expressions',()=>{
 assert(!['wink','clap','laugh','cheer'].includes(rewardExpression('GOOD',52,1,{correctCount:1,index:1})));
 assert.equal(rewardExpression('GREAT',500,5,{correctCount:5}),'clap');assert.equal(rewardExpression('PERFECT',1000,10,{correctCount:10}),'laugh');
 let previous;const earned=[];for(let index=12;index<30;index++){const expression=rewardExpression('GOOD',1500,11,{correctCount:index,index,previous});assert.notEqual(expression,previous);earned.push(expression);previous=expression;}assert(new Set(earned).size>=5);
 assert(['laugh','clap','delight','wink','cheer'].includes(rewardExpression('GOOD',1500,1,{correctCount:15,index:15})));
 assert.equal(rewardExpression('MISS',2000,0,{correctCount:20}),'miss');assert.equal(rewardExpression('CLEAR',2000,20),'clear');assert.equal(idleExpression(1300,0,0,15),'delight');
});
