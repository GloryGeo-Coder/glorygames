/* Local learning history and revision sets. Campaign XP, stars, cursors and unlocks are never written here. */
(function(root){
 'use strict';
 const V=typeof module==='object'&&module.exports?require('./revision-variants.js'):root.AtlasRevisionVariants;
 const KEY='wga_map_master_world_learning_v1',statuses=['independent','supported','retry','hint'];
 const bound=(n,max=999999999)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
 const copy=value=>JSON.parse(JSON.stringify(value));
 function create(missions,storage){
  const entries=missions.flatMap((m,mission)=>m.questions.map((q,index)=>({mission,index,missionId:m.id,id:q.id,grade:m.grade,topic:m.topic||m.skill,question:q}))),byId=new Map(entries.map(e=>[e.id,e]));
  let raw=null;try{raw=JSON.parse(storage?.getItem(KEY)||'null');}catch{}
  const data={version:1,order:bound(raw?.order),records:{},session:null};let persistent=!!storage;
  if(raw?.version===1&&raw.records&&typeof raw.records==='object')for(const e of entries){const r=Object.hasOwn(raw.records,e.id)?raw.records[e.id]:null;if(r&&statuses.includes(r.last))data.records[e.id]={last:r.last,mode:r.mode==='revision'?'revision':'campaign',order:bound(r.order),reviewed:bound(r.reviewed),reviews:bound(r.reviews,999999),errors:bound(r.errors,999999)};}
  data.order=Math.max(data.order,...Object.values(data.records).map(r=>Math.max(r.order,r.reviewed)));
  function save(){try{if(!storage)throw Error('unavailable');storage.setItem(KEY,JSON.stringify(data));}catch{persistent=false;}}
  function status(e,progress){const score=progress.best[e.mission]?.scores[e.index]||0,r=data.records[e.id],run=progress.runs[e.mission],pending=run?.index===e.index&&(run.hinted||run.attempts>0),seen=score>0||!!r||!!pending;return {seen,score,needs:seen&&(r?r.last!=='independent':pending||score===50||score===70),last:r?.last||(pending?'retry':score===100?'independent':'supported'),reviewed:r?.reviewed||0,reviews:r?.reviews||0};}
  const eligible=(e,p)=>p.available.includes(e.mission)&&status(e,p).seen;
  function summary(progress,grade){
   const make=(label,grade)=>({label,grade,total:0,tried:0,independent:0,focus:0,reviewed:0});const grades=new Map(),topics=new Map();
   for(const e of entries){const s=status(e,progress);if(!grades.has(e.grade))grades.set(e.grade,make('Grade '+e.grade,e.grade));const rows=[grades.get(e.grade)];if(e.grade===grade){if(!topics.has(e.topic))topics.set(e.topic,make(e.topic,grade));rows.push(topics.get(e.topic));}for(const r of rows){r.total++;r.tried+=Number(s.seen);r.independent+=Number(s.score===100);r.focus+=Number(s.needs);r.reviewed+=Number(s.reviews>0);}}
   return {grades:[...grades.values()],topics:[...topics.values()],selected:grades.get(grade)||make('Grade '+grade,grade)};
  }
  function plan(progress,grade,mode='focus'){
   if(!['focus','mixed'].includes(mode))return [];
   const candidates=entries.filter(e=>e.grade===grade&&eligible(e,progress)&&(mode==='mixed'||status(e,progress).needs));
   candidates.sort((a,b)=>{const x=status(a,progress),y=status(b,progress);return (mode==='focus'?Number(x.last!=='retry')-Number(y.last!=='retry'):0)||x.reviewed-y.reviewed||a.mission-b.mission||a.index-b.index;});
   const result=[];let round=new Set();while(candidates.length&&result.length<6){let i=candidates.findIndex(e=>!round.has(e.mission));if(i<0){round=new Set();i=0;}const e=candidates.splice(i,1)[0];round.add(e.mission);const variants=V.forQuestion(e.id),variant=variants.length&&status(e,progress).reviews%2===0?variants[0].id:null;result.push({missionId:e.missionId,questionId:e.id,variant});}return result;
  }
  function validSession(s){if(!s||!['focus','mixed'].includes(s.mode)||!Array.isArray(s.items)||s.items.length<1||s.items.length>6||new Set(s.items.map(i=>i?.questionId)).size!==s.items.length||!Array.isArray(s.results)||s.position!==s.results.length||s.position<0||s.position>s.items.length)return null;
   for(const item of s.items){const e=byId.get(item?.questionId);if(!e||e.missionId!==item.missionId||e.grade!==s.grade||(item.variant!==null&&!V.apply(e.question,item.variant)))return null;}
   if(s.results.some((r,i)=>!r||r.questionId!==s.items[i]?.questionId||!['independent','supported'].includes(r.result)))return null;
   return {grade:s.grade,mode:s.mode,items:s.items.map(i=>({missionId:i.missionId,questionId:i.questionId,variant:i.variant})),position:s.position,results:s.results.map(r=>({questionId:r.questionId,result:r.result})),attempts:bound(s.attempts,999),hinted:!!s.hinted};
  }
  data.session=raw?.version===1?validSession(raw.session):null;
  function pending(progress){const s=data.session;return !!s&&s.position<s.items.length&&s.items.every(i=>eligible(byId.get(i.questionId),progress));}
  function start(progress,grade,mode){const items=plan(progress,grade,mode);if(!items.length)return false;data.session={grade,mode,items,position:0,results:[],attempts:0,hinted:false};save();return true;}
  function current(progress){if(!pending(progress))return null;const item=data.session.items[data.session.position],e=byId.get(item.questionId);return {...e,question:item.variant?V.apply(e.question,item.variant):e.question,variant:item.variant,position:data.session.position,total:data.session.items.length};}
  function record(id,last,mode,state,complete=false){const e=byId.get(id);if(!e||!statuses.includes(last)||!['campaign','revision'].includes(mode))return false;const r=data.records[id]||{last,mode,order:0,reviewed:0,reviews:0,errors:0};data.order=Math.min(999999999,data.order+1);Object.assign(r,{last,mode,order:data.order});if(last==='retry')r.errors=Math.min(999999,r.errors+1);
   if(mode==='revision'){const s=data.session;if(!s||s.position>=s.items.length||s.items[s.position].questionId!==id)return false;if(complete){r.reviews=Math.min(999999,r.reviews+1);r.reviewed=data.order;s.results.push({questionId:id,result:last==='independent'?'independent':'supported'});s.position++;s.attempts=0;s.hinted=false;}else{s.attempts=bound(state.attempts,999);s.hinted=!!state.hinted;}}
   data.records[id]=r;save();return true;
  }
  return {summary,plan,start,current,pending,record,get session(){return data.session?copy(data.session):null;},get persistent(){return persistent;},get history(){return copy(data.records);}};
 }
 const api={KEY,create};if(typeof module==='object'&&module.exports)module.exports=api;else root.AtlasLearning=api;
})(typeof window!=='undefined'?window:globalThis);
