(function(root){
 'use strict';
 const KEY='wga_map_master_world_progress_v1',SETTINGS='wga_map_master_world_settings_v1',LEGACY='wga_map_master_africa_explorer_best_v1';
 const finite=(x,d=0)=>typeof x==='number'&&Number.isFinite(x)?x:d;
 const bounded=(x,max)=>Math.max(0,Math.min(max,Math.floor(finite(x))));
 function read(storage,key){try{return JSON.parse(storage?.getItem(key)||'null');}catch{return null;}}
 function write(storage,key,value){try{if(!storage)return false;storage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
 function availability(best,missions){
  const available=[];for(const grade of new Set(missions.map(m=>m.grade))){for(const [i,m] of missions.entries()){if(m.grade!==grade)continue;available.push(i);if(!best[i].scores.every(n=>n>0))break;}}
  let unlocked=1;for(let i=0;i<best.length-1;i++){if(best[i].scores.every(n=>n>0))unlocked=i+2;else break;}
  return {available,unlocked};
 }
 function normalise(input,missions){const v=input&&typeof input==='object'?input:{},ids=Array.isArray(v.missionIds)?v.missionIds:null;
  // v1 had exactly five missions. v2 maps each record by stable ID, never by a future display position.
  const sourceIndex=missions.map((m,i)=>ids?ids.indexOf(m.id):i<5?i:-1);
  const best=missions.map((m,i)=>{const old=sourceIndex[i],record=old>=0?v.best?.[old]:null,scores=m.questions.map((_,j)=>[50,70,100].includes(record?.scores?.[j])?record.scores[j]:0);return {scores,stars:scores.every(n=>n>0)?bounded(record?.stars,3):0};});
  const unlocked=availability(best,missions),raw=v.resume||{},oldResume=Number.isInteger(raw.mission)?raw.mission:0,mapped=sourceIndex.indexOf(oldResume),mission=unlocked.available.includes(mapped)?mapped:0;
  const runs=missions.map((m,i)=>{const old=sourceIndex[i],r=(old>=0?v.runs?.[old]:null)||(i===mission?raw:{}),pending=best[i].scores.findIndex(n=>n===0),index=bounded(r.index??(pending<0?0:pending),pending<0?m.questions.length-1:pending);return {mission:i,index,attempts:bounded(r.attempts,999),hinted:!!r.hinted,mistakes:bounded(r.mistakes,999),hints:bounded(r.hints,99)};});
  return {version:2,missionIds:missions.map(m=>m.id),best,...unlocked,runs,resume:{...runs[mission]}};
 }
 function settings(input){const v=input&&typeof input==='object'?input:{};return {muted:!!v.muted,musicVolume:Math.max(0,Math.min(1,finite(v.musicVolume,.35))),effectsVolume:Math.max(0,Math.min(1,finite(v.effectsVolume,.7)))};}
 function create(missions,storage){let progress=normalise(read(storage,KEY),missions),legacy=bounded(read(storage,LEGACY),999999999);const prefs=settings(read(storage,SETTINGS));
  const state={mission:progress.resume.mission,index:progress.resume.index,phase:'home',attempts:0,hinted:false,mistakes:0,hints:0,route:[],feedback:null};let persistent=!!storage;
  const mission=()=>missions[state.mission],question=()=>mission().questions[state.index],score=()=>progress.best.reduce((sum,m)=>sum+m.scores.reduce((a,b)=>a+b,0),0);
  function save(){persistent=write(storage,KEY,progress)&&persistent;const total=score();if(total>legacy){legacy=total;try{storage?.setItem(LEGACY,String(total));}catch{persistent=false;}}}
  function cursor(){progress.resume={mission:state.mission,index:state.index,attempts:state.attempts,hinted:state.hinted,mistakes:state.mistakes,hints:state.hints};progress.runs[state.mission]={...progress.resume};save();}
  function start(index=progress.resume.mission,{replay=false}={}){if(!Number.isInteger(index)||index<0||!progress.available.includes(index))return false;const r=progress.runs[index],resume=!replay;
   Object.assign(state,{mission:index,index:resume?r.index:0,phase:'brief',attempts:resume?r.attempts:0,hinted:resume?r.hinted:false,mistakes:resume?r.mistakes:0,hints:resume?r.hints:0,route:[],feedback:null});cursor();return true;
  }
  function begin(){if(state.phase!=='brief')return false;state.phase='question';return true;}
  function hint(){if(state.phase!=='question')return null;if(!state.hinted){state.hinted=true;state.hints++;cursor();}return question().hint;}
  function answer(value){if(state.phase!=='question')return null;const q=question();if(q.type==='route'){
    const expected=q.answer[state.route.length];if(value===expected){state.route.push(value);if(state.route.length<q.answer.length)return {partial:true};}else return finish(false,value);
   }
   const correct=q.type==='coordinate'?Array.isArray(value)&&value.length===2&&q.answer.every((n,i)=>Number.isFinite(value[i])&&value[i]===n):q.type==='route'||value===q.answer;
   return finish(correct,value);
  }
  function finish(correct,value){const q=question();if(!correct){state.attempts++;state.mistakes++;state.route=[];cursor();}
   let earned=0;if(correct){earned=state.attempts>0?50:state.hinted?70:100;const record=progress.best[state.mission];record.scores[state.index]=Math.max(record.scores[state.index],earned);
    if(state.index===mission().questions.length-1){record.stars=Math.max(record.stars,state.mistakes===0&&state.hints===0?3:state.mistakes<=2?2:1);Object.assign(progress,availability(progress.best,missions));progress.runs[state.mission]={mission:state.mission,index:0,attempts:0,hinted:false,mistakes:0,hints:0};progress.resume={...progress.runs[nextMission()??state.mission]};}
    else{progress.resume={mission:state.mission,index:state.index+1,attempts:0,hinted:false,mistakes:state.mistakes,hints:state.hints};progress.runs[state.mission]={...progress.resume};}save();
   }
   state.feedback={correct,earned,value,explanation:correct?q.explanation:'Use the clue and try again. '+q.hint};state.phase='feedback';return state.feedback;
  }
  function next(){if(state.phase!=='feedback')return false;if(!state.feedback.correct){state.phase='question';state.feedback=null;return true;}
   if(state.index===mission().questions.length-1){state.phase='summary';return true;}
   state.index++;state.attempts=0;state.hinted=false;state.route=[];state.feedback=null;state.phase='question';return true;
  }
  function nextMission(index=state.mission){const grade=missions[index].grade;return missions.findIndex((m,i)=>i>index&&m.grade===grade)===-1?null:missions.findIndex((m,i)=>i>index&&m.grade===grade);}
  function configure(values){Object.assign(prefs,settings({...prefs,...values}));persistent=write(storage,SETTINGS,prefs)&&persistent;}
  return {state,prefs,mission,question,score,start,begin,hint,answer,next,configure,nextMission,isUnlocked:index=>progress.available.includes(index),get progress(){return progress;},get legacyBest(){return legacy;},get persistent(){return persistent;}};
 }
 const api={KEY,SETTINGS,LEGACY,normalise,settings,create};if(typeof module==='object'&&module.exports)module.exports=api;else root.AcademyEngine=api;
})(typeof window!=='undefined'?window:globalThis);
