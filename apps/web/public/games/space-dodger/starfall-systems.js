/* Shared campaign rules and controls for the 3D renderer and compatibility renderer. */
(() => {
  'use strict';
  const KEY='wga_starfall_campaign_v4';
  const levels=[
    {name:'Echoes of Asterion',zone:'Lost Survey Fleet',mission:'Rescue four escape pods and recover the fleet’s navigation cores.',tip:'Nova: The route home is open, but the survey fleet is missing. Green pods carry survivors. Bring them back.',duration:78,cores:10,kills:12,rescues:4,asteroidRate:1.05,enemyRate:1.8,speed:34,hue:'#62ffba',enemyTypes:['scout','darter'],boss:null,music:[196,294,392,494],environment:'wreckage'},
    {name:'Ion Tempest',zone:'The Sapphire Storm',mission:'Cross the ion storm, collect twelve cores and survive the charged lanes.',tip:'Nova: A red lane is charging. Leave it before the pulse. Your shield can absorb a mistake; your hull cannot absorb many.',duration:85,cores:12,kills:14,storm:true,asteroidRate:1.1,enemyRate:1.65,speed:36,hue:'#71a9ff',enemyTypes:['scout','shield','darter'],boss:null,music:[174,261,349,440],environment:'ion'},
    {name:'Relay Breaker',zone:'Silent Array',mission:'Destroy four command relays and disable the defence drones.',tip:'Nova: The red relay cores are stationary ahead. Line up your weapons, break the array, then clear the drones.',duration:90,cores:10,kills:16,relays:4,asteroidRate:1.15,enemyRate:1.6,speed:36,hue:'#ff668d',enemyTypes:['turret','shield','scout'],boss:null,music:[164,246,329,392],environment:'relay'},
    {name:'Ark of the Dawn',zone:'Refugee Passage',mission:'Escort the Dawn Ark with at least 20% integrity while clearing sixteen raiders.',tip:'Nova: The Ark carries the people you rescued. Raiders are targeting its engines. Destroy them before they cross our defensive line.',duration:92,cores:10,kills:16,escort:true,asteroidRate:1.2,enemyRate:1.6,speed:35,hue:'#ffd988',enemyTypes:['darter','heavy','scout'],boss:null,music:[196,247,330,494],environment:'ark'},
    {name:'Singularity Crossing',zone:'Event Horizon',mission:'Pass through five navigation gates and gather rift cores in the gravity current.',tip:'Nova: The current will pull sideways. Use the gold gates to plot a safe crossing. Boost changes your handling; keep an exit in view.',duration:100,cores:12,kills:18,gates:5,gravity:true,asteroidRate:1.05,enemyRate:1.6,speed:38,hue:'#bd85ff',enemyTypes:['mine','darter','shield'],boss:null,music:[146,220,294,440],environment:'rift'},
    {name:'Heart of Starfall',zone:'The Sovereign Citadel',mission:'Break the Starfall Sovereign and guide the Dawn Ark home.',tip:'Nova: The Sovereign is powering the remnant fleet. Watch the shield warning and fire while its core is exposed. Clear its last defence and bring everyone home.',duration:130,cores:14,kills:24,asteroidRate:1.05,enemyRate:1.45,speed:40,hue:'#42e8ff',enemyTypes:['scout','heavy','shield','turret'],boss:{name:'Starfall Sovereign',hp:520,at:45,color:'#ff315a'},music:[164,220,329,440,659],environment:'citadel'}
  ].map(Object.freeze);
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  function createCampaign(storage,total=18){
    const data={unlocked:1,last:0,best:{},checkpoint:null};
    try{const p=JSON.parse(storage?.getItem(KEY)||'null');if(p){
      data.unlocked=Math.floor(clamp(p.unlocked,1,total));data.last=Math.floor(clamp(p.last,0,data.unlocked-1));
      for(let i=0;i<total;i++){const b=p.best?.[i];if(b&&Number.isFinite(b.score))data.best[i]={score:clamp(b.score,0,999999999),medal:Math.floor(clamp(b.medal,1,3))};}
      if(p.checkpoint&&p.checkpoint.level<=data.unlocked-1)data.checkpoint={level:Math.floor(clamp(p.checkpoint.level,0,total-1)),score:clamp(p.checkpoint.score,0,999999999),hull:clamp(p.checkpoint.hull,1,100),shield:clamp(p.checkpoint.shield,0,100),lives:Math.floor(clamp(p.checkpoint.lives,1,3))};
    }}catch{}
    const save=()=>{try{storage?.setItem(KEY,JSON.stringify(data));}catch{}};
    function enter(index,run){data.last=index;data.checkpoint={level:index,score:Math.floor(run.score),hull:run.hull,shield:run.shield,lives:run.lives};save();}
    function complete(index,run){
      const medal=run.hull>=75&&run.elapsed<=180?3:run.hull>=40?2:1;
      const old=data.best[index];data.best[index]={score:Math.max(old?.score||0,Math.floor(run.score)),medal:Math.max(old?.medal||0,medal)};
      data.unlocked=Math.max(data.unlocked,Math.min(total,index+2));data.last=Math.min(total-1,index+1);save();return medal;
    }
    return {data,enter,complete,save};
  }
  function goals(level,run){return (run.rescues||0)>=(level.rescues||0)&&(run.relays||0)>=(level.relays||0)&&(run.gates||0)>=(level.gates||0)&&(!level.escort||(run.escortHull??100)>=20);}
  function complete(level,run,bossDefeated=false){
    if(level.boss)return bossDefeated&&goals(level,run);
    const full=run.cores>=level.cores&&run.kills>=level.kills&&run.elapsed>=Math.min(level.duration,45);
    const recovered=run.elapsed>=level.duration&&run.cores>=Math.ceil(level.cores*.65)&&run.kills>=Math.ceil(level.kills*.65);
    return (full||recovered)&&goals(level,run);
  }
  function objective(level,run){return `${run.cores}/${level.cores} cores · ${run.kills}/${level.kills} targets${level.rescues?` · ${run.rescues||0}/${level.rescues} rescued`:''}${level.relays?` · ${run.relays||0}/${level.relays} relays`:''}${level.gates?` · ${run.gates||0}/${level.gates} gates`:''}${level.escort?` · Ark ${Math.round(run.escortHull??100)}%`:''} · ${Math.max(0,Math.ceil(level.duration-run.elapsed))}s`;}
  function resetMission(run){Object.assign(run,{rescues:0,relays:0,gates:0,escortHull:100,invulnerable:0,bossDefeated:false,stormTime:0,stormLane:-1,stormHit:false});}
  function quality(win){const compact=win.innerWidth<760||win.matchMedia?.('(pointer:coarse)').matches;return {compact,pixelRatio:compact?1.25:1.65,stars:compact?100:180,particles:compact?180:420,reducedMotion:!!win.matchMedia?.('(prefers-reduced-motion:reduce)').matches};}
  function bindInput({window:win,document:doc,canvas,getState,ensureAudio,onPause,onMute,onPlasma,onPointer}){
    const keys=new Set(),held=new Set();let pointer=null;
    function sync(){const run=getState();const has=(...xs)=>xs.some(x=>keys.has(x)||held.has(x));
      run.input.x=Number(has('ArrowRight','KeyD','right'))-Number(has('ArrowLeft','KeyA','left'));
      run.input.y=Number(has('ArrowUp','KeyW','up'))-Number(has('ArrowDown','KeyS','down'));
      run.input.fire=has('Space','fire','pointer')||!!doc.getElementById('autoFire')?.checked;
      run.input.boost=has('ShiftLeft','ShiftRight','boost');}
    function clear(){keys.clear();held.clear();pointer=null;Object.assign(getState().input,{x:0,y:0,fire:false,boost:false});}
    win.addEventListener('keydown',e=>{
      if(['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName))return;
      if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();
      if(!e.repeat){if(e.code==='KeyP'||e.code==='Escape')onPause();if(e.code==='KeyM')onMute();if(e.code==='KeyE')onPlasma();}
      keys.add(e.code);sync();
    });win.addEventListener('keyup',e=>{keys.delete(e.code);sync();});
    for(const button of doc.querySelectorAll('#mobileControls [data-dir],#fireBtn,#boostBtn')){
      const key=button.dataset.dir||(button.id==='fireBtn'?'fire':'boost');
      button.addEventListener('pointerdown',e=>{e.preventDefault();ensureAudio();button.setPointerCapture?.(e.pointerId);held.add(key);sync();});
      for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>{held.delete(key);sync();});
    }
    canvas.addEventListener('pointerdown',e=>{if(getState().status!=='playing')return;ensureAudio();pointer=e.pointerId;canvas.setPointerCapture?.(e.pointerId);held.add('pointer');sync();onPointer(e);});
    canvas.addEventListener('pointermove',e=>{if(pointer===e.pointerId&&getState().status==='playing')onPointer(e);});
    const release=e=>{if(pointer===e.pointerId){pointer=null;held.delete('pointer');sync();}};
    canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
    win.addEventListener('blur',()=>{clear();onPause(true);});doc.addEventListener('visibilitychange',()=>{if(doc.hidden){clear();onPause(true);}});
    return {clear,sync,keys,held};
  }
  window.StarfallSystems=Object.freeze({KEY,levels,createCampaign,complete,goals,objective,resetMission,quality,bindInput});
})();
