/* Chapter One of City of Legends. Career data is additive to the existing garage save. */
(() => {
  'use strict';
  const KEY = 'high-spead-racer-city-legends-v1';
  const JOBS = Object.freeze([
    {id:'first-green',title:'First Green',district:'Under the highway',route:9,distance:1100,baseSpeed:27,maxSpeed:43,rivals:1,weather:'rain',goal:'duel',limit:1,pace:1.025,reward:180,rep:45,
      brief:'Back in Veyra Bay, you have one worn family coupe and a garage facing closure. Your sibling’s championship crash still hangs over its name. Ivo’s immaculate car waits beneath the highway. Win your first duel.',
      radio:'Mara · His car is faster. Watch how early he brakes. Use Brake to make space, then Nitro to pass.',
      outro:'Ivo · That old coupe still has something. Tell Mara I remember your sibling’s last race.'},
    {id:'precious-cargo',title:'Precious Cargo',district:'Old Town → workshop',route:7,distance:1500,baseSpeed:27,maxSpeed:42,rivals:0,weather:'dry',goal:'delivery',limit:55,pace:1,reward:340,rep:55,loaner:true,
      brief:'A client’s restored Silver GT must reach the showcase. Bring it home with at least 55% condition. Scrapes reduce your payment. The loan car returns to its owner after the job.',
      radio:'Mara · This one belongs to a customer. Read the gaps. A clean delivery pays for our first workbench.',
      outro:'Mara · Paid in full enough to keep the doors open. Our first customer left a photograph on the wall.'},
    {id:'engine-proof',title:'Engine Proof',district:'Coastal road',route:0,distance:1400,baseSpeed:28,maxSpeed:43,rivals:0,weather:'dry',goal:'test',limit:8,pace:1,reward:280,rep:60,
      brief:'Test the new engine tune in your family coupe. Hold Nitro for a total of 8 seconds and reach the workshop. Pickups refill your bottle.',
      radio:'Mara · Listen for the shift. Give me eight seconds under load, then bring our car home.',
      outro:'Mara · Good readings. A well-built starter can still earn its place. The parts shelf is finally stocked.'},
    {id:'local-clock',title:'Against the Clock',district:'Downtown avenues',route:2,distance:1500,baseSpeed:30,maxSpeed:46,rivals:0,weather:'dry',goal:'time',limit:44,pace:1,reward:380,rep:80,
      brief:'Beat the local driver’s 44-second downtown time. Every bump costs momentum. Clean lane changes and carefully timed Nitro matter.',
      radio:'Mara · There’s no prize for the biggest dent. Keep your speed and beat that clock.',
      outro:'Lena · Word is the family garage is racing again. Come to the harbour. Bring that coupe.'},
    {id:'harbour-names',title:'Names at the Harbour',district:'Harbour Afterdark',route:6,distance:1900,baseSpeed:32,maxSpeed:48,rivals:5,weather:'rain',goal:'race',limit:3,pace:1.005,reward:500,rep:110,
      brief:'Finish in the top three to earn an invitation from the local crews. Rain reduces grip and makes bumps more costly. Keep the car composed.',
      radio:'Lena · The champion’s sponsors own the big grids. Out here, you earn your place. Top three gets you noticed.',
      outro:'Lena · The Precision crew wants a mountain run. Your sibling raced them before the crash. They may know more.'},
    {id:'precision-invite',title:'The Precision Invitation',district:'Mountain pass',route:3,distance:2100,baseSpeed:30,maxSpeed:45,rivals:3,weather:'fog',goal:'race',limit:2,pace:1.02,reward:650,rep:150,
      brief:'Finish in the top two against the Precision crew. Fog shortens your view. Save Nitro for a clear lane and keep contact to a minimum.',
      radio:'Sora · Anyone can push a straight. Show me you can read a road and recover when it goes wrong.',
      outro:'Sora · You have your sibling’s patience. Keep the garage alive. When the championship opens, we will talk.'}
  ].map(Object.freeze));
  const cleanName = value => String(value || '').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,20) || 'Rookie';
  function create(storage) {
    let data = {driver:null,reputation:0,completed:{},best:{}};
    try {
      const p=JSON.parse(storage?.getItem(KEY)||'null');
      if(p&&typeof p==='object'){
        if(p.driver) data.driver={name:cleanName(p.driver.name),look:['ember','ocean','graphite'].includes(p.driver.look)?p.driver.look:'ember',identity:['precision','bold','balanced'].includes(p.driver.identity)?p.driver.identity:'balanced'};
        for(const job of JOBS) if(p.completed?.[job.id]===true)data.completed[job.id]=true;
        data.reputation=JOBS.filter(j=>data.completed[j.id]).reduce((sum,j)=>sum+j.rep,0);
        for(const job of JOBS){const b=p.best?.[job.id];if(b&&Number.isFinite(b.time)&&b.time>0)data.best[job.id]={time:b.time,condition:Math.max(0,Math.min(100,Number(b.condition)||0))};}
      }
    } catch {}
    function save(){try{storage?.setItem(KEY,JSON.stringify(data));}catch{}}
    function unlocked(index){return index===0||JOBS.slice(0,index).every(j=>data.completed[j.id]);}
    function result(job,run){
      const success=job.goal==='delivery'?run.condition>=job.limit:job.goal==='test'?run.boostSeconds>=job.limit:job.goal==='time'?run.time<=job.limit:run.position<=job.limit;
      const first=success&&!data.completed[job.id];
      const payment=success?Math.floor(job.reward*(job.goal==='delivery'?.4+.6*run.condition/100:1)):0;
      if(success){
        data.completed[job.id]=true;
        if(first)data.reputation+=job.rep;
        if(!data.best[job.id]||run.time<data.best[job.id].time)data.best[job.id]={time:run.time,condition:run.condition};
        save();
      }
      return {success,first,payment,reputation:first?job.rep:0};
    }
    function setDriver(driver){data.driver={name:cleanName(driver.name),look:['ember','ocean','graphite'].includes(driver.look)?driver.look:'ember',identity:['precision','bold','balanced'].includes(driver.identity)?driver.identity:'balanced'};save();return data.driver;}
    function garage(){const n=JOBS.filter(j=>data.completed[j.id]).length;return n===0?'Family workshop · empty bays':n<3?'Working garage · first customer photographs':n<5?'Tuned workshop · stocked parts and local trophies':'Crew garage · team wall and Precision invitation';}
    return {data,JOBS,unlocked,result,setDriver,garage,next:()=>JOBS.findIndex(j=>!data.completed[j.id])};
  }
  window.RacerCareer=Object.freeze({create,JOBS,KEY});
})();
