(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StackChallenges=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const KEY='wga_stack_tower_challenges_v1';
  const styles=[
    {id:'classic',name:'Classic skyline',need:'Available to everyone',colors:null},
    {id:'sunset',name:'Sunset construction',need:'Build 10 floors',colors:[['#ffd18b','#f7794c','#a43637'],['#ffe6a9','#e9a126','#9a561d']]},
    {id:'aurora',name:'Aurora glass',need:'Build 20 floors',colors:[['#b8fff1','#16a7aa','#176184'],['#ddd1ff','#8c70e8','#493b9b']]},
    {id:'gold',name:'Golden landmark',need:'Complete a daily challenge',colors:[['#fff0a5','#dba020','#80530b'],['#fff8cb','#efa83b','#9b5721']]},
    {id:'neon',name:'Neon megatower',need:'Complete a timed objective',colors:[['#b1fffc','#0eb2ce','#174a9d'],['#ffb4ed','#d32bc1','#5e248c']]},
    {id:'ocean',name:'Ocean spire',need:'Complete 3 different daily challenges',colors:[['#bdf8ff','#1aaccb','#07547e'],['#c1ffe3','#28b993','#13605e']]},
    {id:'steel',name:'Steel architect',need:'Complete 3 timed objectives',colors:[['#f0f8ff','#869eb4','#35475b'],['#e1f5ff','#5c8fa4','#284b62']]},
    {id:'royal',name:'Royal skyline',need:'Build 30 floors',colors:[['#f1d5ff','#a254d1','#502970'],['#fff1bd','#d49b35','#77521f']]}
  ];
  const timedObjectives=[
    {id:'standard',name:'City Builder',height:12,perfects:5,seconds:90},
    {id:'express',name:'Express Foundation',height:8,perfects:2,seconds:45},
    {id:'precision',name:'Precision Architect',height:10,perfects:7,seconds:90}
  ];
  const utcDay=(date=new Date())=>date.toISOString().slice(0,10);
  function daily(day){if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw new Error('Invalid day');const n=Number(day.replaceAll('-',''));const names=['Harbour Works','Cloudside Project','Aurora Landmark'];return {day,name:names[n%3],height:10+(n%3)*2,perfects:3+(n%2)};}
  function clean(raw){const dates=Array.isArray(raw?.dates)?raw.dates.filter(d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-366):[];return {version:1,dates:[...new Set(dates)],timedWins:Number.isSafeInteger(raw?.timedWins)?Math.max(0,Math.min(9999,raw.timedWins)):0,style:styles.some(s=>s.id===raw?.style)?raw.style:'classic'};}
  function load(storage){try{return clean(JSON.parse(storage.getItem(KEY)||'null'));}catch{return clean(null);}}
  function save(storage,profile){try{storage.setItem(KEY,JSON.stringify(clean(profile)));return true;}catch{return false;}}
  function unlocked(id,best,profile){return id==='classic'||(id==='sunset'&&best>=10)||(id==='aurora'&&best>=20)||(id==='gold'&&profile.dates.length>0)||(id==='neon'&&profile.timedWins>0)||(id==='ocean'&&profile.dates.length>=3)||(id==='steel'&&profile.timedWins>=3)||(id==='royal'&&best>=30);}
  function objective(mode,day,timedId='standard'){if(mode==='daily')return {...daily(day),seconds:0};if(mode==='timed'){const goal=timedObjectives.find(x=>x.id===timedId)||timedObjectives[0];return {...goal};}return null;}
  function achieved(goal,height,perfects){return !!goal&&height>=goal.height&&perfects>=goal.perfects;}
  return {KEY,styles,timedObjectives,utcDay,daily,clean,load,save,unlocked,objective,achieved};
});
