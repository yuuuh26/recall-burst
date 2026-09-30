// Only on-device voices: questions never go to a remote speech service.
export const LANGUAGE_OPTIONS = [['auto','自動'],['ja-JP','日本語'],['en-US','英語'],['zh-CN','中国語'],['ko-KR','韓国語'],['fr-FR','フランス語'],['de-DE','ドイツ語'],['es-ES','スペイン語'],['it-IT','イタリア語'],['pt-BR','ポルトガル語'],['ru-RU','ロシア語'],['ar-SA','アラビア語'],['hi-IN','ヒンディー語']];
export function validLanguage(value){if(value==='auto'||value==='')return true;if(typeof value!=='string'||value.length>35||! /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(value))return false;try{return Intl.getCanonicalLocales(value).length===1;}catch{return false;}}
export function detectLanguage(text,override='auto'){
 if(override&&override!=='auto'&&validLanguage(override))return Intl.getCanonicalLocales(override)[0];
 if(/[\u3040-\u30ff]/u.test(text))return 'ja-JP';
 if(/[\uac00-\ud7af\u1100-\u11ff]/u.test(text))return 'ko-KR';
 if(/[\u0400-\u04ff]/u.test(text))return 'ru-RU';
 if(/[\u0600-\u06ff]/u.test(text))return 'ar-SA';
 if(/[\u0900-\u097f]/u.test(text))return 'hi-IN';
 // Han-only text is ambiguous; editor/JSON can override the Japanese default.
 if(/[\u3400-\u9fff]/u.test(text))return 'ja-JP';
 if(/[a-z\u00c0-\u024f]/iu.test(text))return 'en-US';
 return 'ja-JP';
}
export function questionLanguage(q,direction='forward'){return direction==='reverse'?detectLanguage(q.answer,q.answerLang):detectLanguage(q.prompt,q.promptLang);}
export function localVoice(voices,lang){const base=lang.split('-')[0].toLowerCase();const candidates=voices.filter(v=>v.localService===true&&v.lang.replaceAll('_','-').split('-')[0].toLowerCase()===base);return candidates.find(v=>v.lang.replaceAll('_','-').toLowerCase()===lang.toLowerCase())??candidates.find(v=>v.default)??candidates[0];}
export function speechChunks(text){const chunks=[];let rest=text.trim();while(rest.length){let end=Math.min(120,rest.length);if(rest.length>120){const part=rest.slice(0,120);const boundary=Math.max(part.lastIndexOf('。'),part.lastIndexOf('！'),part.lastIndexOf('？'),part.lastIndexOf('. '),part.lastIndexOf('? '),part.lastIndexOf('! '),part.lastIndexOf(' '));if(boundary>35)end=boundary+1;if(/[\ud800-\udbff]/u.test(rest[end-1]))end--; }chunks.push(rest.slice(0,end).trim());rest=rest.slice(end).trim();}return chunks.filter(Boolean);}
export class SpeechReader{
 constructor({synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance}={}){this.synth=synth;this.Utterance=Utterance;this.pending=null;}
 get supported(){return Boolean(this.synth&&this.Utterance);}
 cancel(){const pending=this.pending;this.pending=null;pending?.cleanup();try{this.synth?.cancel();}catch{} }
 speak(text,lang,{onState=()=>{},onDone=()=>{},volume=0.9}={}){
  this.cancel();if(!this.supported){onState('unsupported');onDone('unsupported');return;}
  const timers=new Set();let listener=null;const pending={cleanup:()=>{for(const t of timers)clearTimeout(t);timers.clear();if(listener)this.synth.removeEventListener?.('voiceschanged',listener);}};this.pending=pending;
  const active=()=>this.pending===pending;
  const later=(fn,ms)=>{const t=setTimeout(()=>{timers.delete(t);if(active())fn();},ms);timers.add(t);return t;};
  const finish=status=>{if(!active())return;this.pending=null;pending.cleanup();if(status!=='done')try{this.synth.cancel();}catch{}onState(status);onDone(status);};
  const chunks=speechChunks(text);let index=0;
  const play=voice=>{if(!active())return;if(index>=chunks.length){finish('done');return;}const utterance=new this.Utterance(chunks[index++]);pending.utterance=utterance;utterance.lang=lang;utterance.voice=voice;utterance.rate=1;utterance.volume=volume;
   let settled=false;const startTimer=later(()=>{if(!settled)finish('unavailable');},2200);let endTimer;
   utterance.onstart=()=>{if(!active()||settled)return;clearTimeout(startTimer);timers.delete(startTimer);onState('speaking');endTimer=later(()=>finish('unavailable'),Math.min(20000,4000+utterance.text.length*150));};
   utterance.onend=()=>{if(!active()||settled)return;settled=true;clearTimeout(startTimer);clearTimeout(endTimer);timers.delete(startTimer);timers.delete(endTimer);play(voice);};
   utterance.onerror=()=>{if(!settled){settled=true;finish('unavailable');}};
   try{this.synth.speak(utterance);}catch{finish('unavailable');}
  };
  const ready=()=>{if(!active()||pending.utterance)return;let voices;try{voices=this.synth.getVoices();}catch{finish('unavailable');return;}const voice=localVoice(voices,lang);if(voice){if(listener){this.synth.removeEventListener?.('voiceschanged',listener);listener=null;}play(voice);}else if(voices.length)finish('unavailable');};
  onState('preparing');listener=ready;this.synth.addEventListener?.('voiceschanged',listener);ready();if(active()&&!pending.utterance)later(()=>{ready();if(active()&&!pending.utterance)finish('unavailable');},900);
 }
}
