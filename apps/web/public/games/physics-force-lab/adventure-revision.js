(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./adventure-data.js'):root.PhysicsAdventure);if(typeof module==='object'&&module.exports)module.exports=api;else root.PhysicsRevision=api;})(typeof globalThis!=='undefined'?globalThis:this,function(A){
  'use strict';
  const SAVE_KEY='wga_physics_revision_v1',groups=new Map(),cards=[];
  const bounded=(n,max=999999)=>Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
  for(const [mi,m]of A.missions.entries())for(let station=0;station<m.stations.length;station++){
    const e=A.experiment(m,station),key=JSON.stringify([e.grade,e.question,e.answers,e.correct]);
    if(!groups.has(key)){const c={id:m.id+':'+station,grade:e.grade,question:e.question,answers:[...e.answers],correct:e.correct,aliases:[]};groups.set(key,c);cards.push(c);}
    groups.get(key).aliases.push({mi,station});
  }
  const byId=new Map(cards.map(c=>[c.id,c]));
  function blank(){return{version:1,turn:0,records:{},session:null};}
  function source(profile,card){return card.aliases.find(({mi,station})=>{const m=A.missions[mi];return A.isUnlocked(profile,mi)&&(profile.completed?.[m.id]===true||profile.journal?.[m.id]?.[station]||profile.checkpoints?.[m.id]?.solved?.includes(station));});}
  function catalog(profile,grade='all'){return cards.flatMap(c=>{const ref=source(profile,c);if(!ref||grade!=='all'&&c.grade!==Number(grade))return[];const m=A.missions[ref.mi],e=A.experiment(m,ref.station);return[{...c,...ref,mission:m.title,stationName:m.stations[ref.station].name,concept:e.concept,explanation:e.explanation}];});}
  function sanitize(raw){
    const p=blank();if(!raw||raw.version!==1)return p;p.turn=bounded(raw.turn);
    for(const c of cards){const r=raw.records?.[c.id];if(r&&typeof r==='object'){const attempts=bounded(r.attempts,9999);if(attempts)p.records[c.id]={attempts,correct:Math.min(attempts,bounded(r.correct,9999)),lastCorrect:r.lastCorrect===true,lastSeen:Math.min(p.turn,bounded(r.lastSeen))};}}
    const s=raw.session;if(s&&Array.isArray(s.ids)&&s.ids.length>0&&s.ids.length<=6&&s.ids.every(id=>byId.has(id))&&new Set(s.ids).size===s.ids.length){
      const answers=[];if(Array.isArray(s.answers))for(const choice of s.answers.slice(0,s.ids.length)){if(!Number.isInteger(choice)||choice<0||choice>2)break;answers.push(choice);}
      p.session={ids:[...s.ids],answers,cursor:Math.min(bounded(s.cursor,s.ids.length),answers.length),seed:bounded(s.seed,2147483647)};
    }return p;
  }
  function load(storage){try{return sanitize(JSON.parse(storage.getItem(SAVE_KEY)));}catch{return blank();}}
  function save(storage,p){try{storage.setItem(SAVE_KEY,JSON.stringify(p));return true;}catch{return false;}}
  function resume(p,profile){if(p.session&&!p.session.ids.every(id=>{const c=byId.get(id);return c&&source(profile,c);}))p.session=null;return p.session;}
  function random(rng){const n=Number(rng());return Number.isFinite(n)?Math.max(0,Math.min(.999999999,n)):0;}
  function start(p,profile,grade='all',rng=Math.random){
    const pool=catalog(profile,grade).map(c=>({...c,tie:random(rng)})),selected=[],grades=new Set();
    while(pool.length&&selected.length<6){
      const rank=c=>{const r=p.records[c.id];return(grades.has(c.grade)?10:0)+(r?(r.lastCorrect?2:0):1);};
      pool.sort((a,b)=>rank(a)-rank(b)||(p.records[a.id]?.lastSeen||0)-(p.records[b.id]?.lastSeen||0)||a.tie-b.tie||a.id.localeCompare(b.id));
      const c=pool.shift();selected.push(c.id);grades.add(c.grade);
    }
    p.session=selected.length?{ids:selected,answers:[],cursor:0,seed:Math.floor(random(rng)*2147483647)}:null;return p.session;
  }
  function current(p,profile){const s=resume(p,profile);return s&&s.cursor<s.ids.length?catalog(profile).find(c=>c.id===s.ids[s.cursor])||null:null;}
  function options(p,card){
    let seed=(p.session?.seed||1)>>>0;for(const ch of card.id)seed=(Math.imul(seed,31)+ch.charCodeAt(0))>>>0;
    const list=card.answers.map((text,choice)=>({text,choice}));
    for(let i=list.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[list[i],list[j]]=[list[j],list[i]];}return list;
  }
  function answer(p,profile,choice){
    const c=current(p,profile),s=p.session;if(!c||!Number.isInteger(choice)||choice<0||choice>=c.answers.length)return null;
    if(s.answers.length>s.cursor)return{correct:s.answers[s.cursor]===c.correct,fresh:false};
    s.answers.push(choice);const r=p.records[c.id]||{attempts:0,correct:0,lastCorrect:false,lastSeen:0};const correct=choice===c.correct;
    p.turn=bounded(p.turn+1);p.records[c.id]={attempts:bounded(r.attempts+1,9999),correct:Math.min(9999,r.correct+Number(correct)),lastCorrect:correct,lastSeen:p.turn};return{correct,fresh:true};
  }
  function next(p,profile){if(!resume(p,profile)||p.session.answers.length<=p.session.cursor)return false;p.session.cursor++;return true;}
  function summary(p,profile){const available=catalog(profile);return{available:available.length,practised:available.filter(c=>p.records[c.id]?.attempts>0).length,revisit:available.filter(c=>p.records[c.id]&&!p.records[c.id].lastCorrect).length};}
  return{SAVE_KEY,cards,blank,sanitize,load,save,catalog,start,resume,current,options,answer,next,summary};
});
