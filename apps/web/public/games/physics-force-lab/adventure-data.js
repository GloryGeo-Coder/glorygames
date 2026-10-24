(function (root, factory) {
  const node=typeof module === 'object' && module.exports;
  const api = factory(node ? require('./adventure-chapter2.js') : root.PhysicsRecoveryDistrict,node ? require('./adventure-grade7.js') : root.PhysicsHeatChapter,node ? require('./adventure-grade8.js') : root.PhysicsSignalChapter,node ? require('./adventure-grade9.js') : root.PhysicsPowerChapter,node ? require('./adventure-grade10.js') : root.PhysicsFinalChapter);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PhysicsAdventure = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (recovery,heat,signal,power,finalChapter) {
  'use strict';
  const SAVE_KEY = 'wga_physics_adventure_v1';
  const clamp = (n, a, b) => Math.min(b, Math.max(a, Number(n) || 0));
  const missions = [
    { id:'cargo', title:'The silent workshop', grade:4, topic:'Energy and movement', color:'#54e6bc', bg:'level-01-force-lab.png',
      story:'Your first morning at Nova Physics Institute begins with a blackout. Professor Newtonia is trapped behind a stalled supply lift. Pip, your lab companion, has found three cargo trolleys. Transfer energy to move their repair kits into the marked bays.',
      ending:'The lift powers up. Newtonia steps out with a cracked Quantum Core log: the shutdown began in the signal tower. Your first repair photograph joins the workshop wall.',
      concept:'A moving person can transfer energy to a trolley by pushing it.', type:'cart', variable:'Push setting', unit:'', min:1, max:6, step:1, initial:1,
      prediction:'What happens when you use a stronger push, keeping the trolley and track the same?', predictions:['The trolley travels farther','The trolley receives less movement energy','The trolley always stays still'], correctPrediction:0,
      question:'What supplied the energy that moved the trolley?', answers:['Your push transferred energy to the trolley','The track created energy from nothing','The trolley moved without an energy input'], correct:0,
      explanation:'Your muscles supplied energy. The push transferred some of it to the trolley, and friction eventually slowed it down.',
      hint:'Increase only the push setting. Keep the same trolley and track for a fair comparison.',
      stations:[{name:'Medical supplies',target:[4.5,5.5],resistance:1,goal:'Stop the trolley in the 4.5–5.5 m bay.'},{name:'Lift parts',target:[6.5,7.5],resistance:1.2,goal:'Reach the 6.5–7.5 m repair bay.'},{name:'Professor’s toolkit',target:[10,11],resistance:1.3,goal:'Reach the 10–11 m bay without overshooting.'}] },
    { id:'sound', title:'A voice across the bridge', grade:4, topic:'Energy and sound', color:'#ffd074', bg:'level-09-wave-tunnel.png',
      story:'The bridge radio is silent, but its emergency receiver still works. Newtonia asks you to build three vibrating signals. Shorten a clamped ruler to make a higher note, and use the visible wave display to match each receiver.',
      ending:'Pip relays your signal. The bridge lights return and a message arrives: “Core safeguards were disabled remotely.” Follow the repair trail to the wheel workshop.',
      concept:'Vibrations produce sound. Faster vibrations produce a higher pitch.',type:'sound',variable:'Free ruler length',unit:'cm',min:10,max:30,step:1,initial:30,
      prediction:'If you shorten the free vibrating part of the ruler, what happens to its pitch?',predictions:['The pitch becomes higher','The sound must become louder','The pitch always stays the same'],correctPrediction:0,
      question:'Which observation explains the higher pitch?',answers:['The shorter ruler vibrated faster','The ruler changed colour','Higher pitch always means louder sound'],correct:0,
      explanation:'Pitch depends on how fast something vibrates. Loudness is a different property. The ruler model shows faster vibrations as a higher note.',hint:'Try a shorter free length for a higher note. The wave remains visible even with sound off.',
      stations:[{name:'Bridge receiver',target:[230,250],goal:'Match the receiver: 230–250 Hz.'},{name:'Harbour radio',target:[415,440],goal:'Match the receiver: 415–440 Hz.'},{name:'Emergency beacon',target:[655,680],goal:'Match the receiver: 655–680 Hz.'}] },
    { id:'wheels',title:'The recovery convoy',grade:5,topic:'Systems for moving things: wheels and axles',color:'#71caff',bg:'level-06-machines-workshop.png',
      story:'A convoy carrying replacement Core parts has broken down. Its wheels bind against badly fitted axles. Compare wheel assemblies using the same starting energy, then fit a freely turning set to each recovery cart.',
      ending:'The convoy rolls again. Your workshop gains a spare-parts bench, and the grateful driver gives you a spring launcher from the old energy gardens.',
      concept:'Wheels turning freely around axles help a vehicle move more easily.',type:'wheels',variable:'Wheel assembly',initial:'locked',options:[['locked','Locked axle'],['rubbing','Wheels rubbing'],['free','Freely turning wheels']],
      prediction:'With the same starting energy, which assembly should move farthest?',predictions:['Freely turning wheels','A locked axle','Wheels rubbing against the body'],correctPrediction:0,
      question:'Why must the starting energy stay the same when comparing the assemblies?',answers:['So the wheel assembly is the only changed variable','So every cart must stop at the same place','Because wheels create their own energy'],correct:0,
      explanation:'A fair comparison changes one factor. Freely turning wheels reduce resistance compared with a locked or rubbing assembly.',hint:'Test a locked axle first, then change only the assembly to freely turning wheels.',
      stations:[{name:'Supply cart',target:[9,13],energy:6,goal:'Make this cart travel at least 9 m.'},{name:'Recovery trailer',target:[11,15],energy:7,goal:'Make this trailer travel at least 11 m.'},{name:'Convoy leader',target:[13,17],energy:8,goal:'Make the final cart travel at least 13 m.'}] },
    { id:'spring',title:'The energy gardens',grade:5,topic:'Stored energy: springs and movement',color:'#b6a0ff',bg:'level-05-energy-reactor.png',
      story:'The energy gardens have lost their transport line. Use a compressed spring to send repair capsules to the stranded stations. Too little compression falls short; too much sends a capsule past its receiver.',
      ending:'Repair capsules reach every receiver. The garden turbines turn and Newtonia discovers a damaged beacon circuit linking the district to the Quantum Core.',
      concept:'Compressing a spring stores energy. Releasing it can produce movement.',type:'spring',variable:'Spring compression',unit:'cm',min:1,max:10,step:1,initial:1,
      prediction:'What does compressing the same spring farther do?',predictions:['It stores more energy','It removes all stored energy','It makes the spring create energy'],correctPrediction:0,
      question:'What energy change launched the capsule?',answers:['Stored energy in the spring became movement energy','Movement energy vanished without a transfer','The capsule created energy by moving'],correct:0,
      explanation:'You supplied energy while compressing the spring. On release, stored energy transferred to the capsule as movement energy.',hint:'Compare one setting at a time. A small change in compression can change the travel distance substantially.',
      stations:[{name:'Garden receiver',target:[4.5,5.5],goal:'Land in the 4.5–5.5 m receiver.'},{name:'Turbine tower',target:[9,10.5],goal:'Land in the 9–10.5 m receiver.'},{name:'Core relay',target:[15,16.5],goal:'Land in the 15–16.5 m receiver.'}] },
    { id:'circuit',title:'Light the district',grade:6,topic:'Electric circuits, conductors and insulators',color:'#ffaf85',bg:'level-07-circuit-lab.png',
      story:'The district beacon has three broken connections. Test the materials, choose a conductor and close each switch. When all three lamps shine, the route to the next Core district will be safe.',
      ending:'The whole district lights up. Nova’s first recovery team is back at work, and your restored workshop now has five mission photographs. The Core mystery continues beyond the academy. You can replay your investigations or explore the original labs.',
      concept:'A lamp needs an energy source and a complete conducting path.',type:'circuit',variable:'Bridge material',initial:'plastic',options:[['plastic','Plastic strip'],['copper','Copper wire'],['rubber','Rubber strip'],['wood','Dry wooden stick']],
      prediction:'Which bridge material will let current flow when the switch closes?',predictions:['Copper wire','Plastic strip','Rubber strip'],correctPrediction:0,
      question:'Why did the lamp light up?',answers:['The cell supplied energy through a complete conducting circuit','The plastic became an energy source','An open switch completed the circuit'],correct:0,
      explanation:'Copper is a conductor. With the switch closed, a complete conducting path connects the cell and lamp. Plastic and rubber are insulators.',hint:'Use a conducting material and close the switch. Change just one of these factors between tests.',
      stations:[{name:'Workshop lamp',goal:'Light the workshop lamp.'},{name:'Bridge lamp',goal:'Repair the bridge lamp.'},{name:'District beacon',goal:'Complete the district beacon circuit.'}] }
  ];
  missions.push(...recovery.missions);
  // Cached older entry pages can still run their original two chapters.
  if(heat)missions.push(...heat.missions);
  if(heat&&signal)missions.push(...signal.missions);
  if(heat&&signal&&power)missions.push(...power.missions);
  if(heat&&signal&&power&&finalChapter)missions.push(...finalChapter.missions);
  function experiment(mission, station) {
    const m=typeof mission==='number'?missions[mission]:mission;
    return {...m,...m.stations[station].lesson};
  }
  function route(mission) {
    const m=typeof mission==='number'?missions[mission]:mission;
    if(missions.indexOf(m)>=10)return {length:4400,stations:[900,2100,3300],end:4220,platforms:[{x:1320,y:350,w:180},{x:2580,y:350,w:180},{x:3660,y:350,w:180}]};
    return missions.indexOf(m)<5
      ? {length:3200,stations:[660,1460,2260],end:3020,platforms:[]}
      : {length:4000,stations:[800,1900,3000],end:3820,platforms:[{x:1110,y:350,w:180},{x:2260,y:350,w:180},{x:3230,y:350,w:180}]};
  }
  function cell(mission,index) {
    const r=route(mission);
    if(r.platforms.length&&index%4===3){const p=r.platforms[Math.floor(index/4)];return {x:p.x+p.w/2,y:p.y-28};}
    return {x:220+index*(r.platforms.length?300:235),y:index%3===1?335:390};
  }
  function landingFloor(terrain,x,previousY,nextY,velocityY) {
    let floor=420;
    if(velocityY>=0)for(const p of terrain.platforms)if(x>=p.x-16&&x<=p.x+p.w+16&&previousY<=p.y&&nextY>=p.y)floor=Math.min(floor,p.y);
    return floor;
  }
  function normalizeValue(e,value) {
    if(e.type==='grid')return recovery.normalizeGrid(value);
    if(e.options)return e.options.some(o=>o[0]===value)?value:e.initial;
    if(!Number.isFinite(Number(value)))return e.initial;
    return clamp(Math.round((Number(value)-e.min)/e.step)*e.step+e.min,e.min,e.max);
  }
  function cleanLab(e,l={}) {
    return {value:normalizeValue(e,l.value??e.initial),closed:l.closed!==false,
      prediction:Number.isInteger(l.prediction)&&l.prediction>=0&&l.prediction<e.predictions.length?l.prediction:null,
      trials:Array.isArray(l.trials)?l.trials.slice(-6).filter(t=>t&&typeof t==='object').map(t=>({value:normalizeValue(e,t.value),closed:t.closed!==false})):[],
      hint:!!l.hint,hintLevel:Math.floor(clamp(l.hintLevel??(l.hint?1:0),0,2))};
  }
  function comparisonReady(e,l) {return !e.needsComparison||new Set(l.trials.map(t=>JSON.stringify(e.type==='circuit'?[t.value,t.closed]:[t.value]))).size>=2;}
  function hint(mission,index,level=1) {const e=experiment(mission,index);return level>1?mission.stations[index].hint2||e.explanation:e.hint;}
  function recordRepair(p,mission,index) {
    p.journal[mission.id]||={};
    const lab=cleanLab(experiment(mission,index),p.checkpoints[mission.id]?.labs[index]);
    p.journal[mission.id][index]=lab;
  }
  function observation(e,result) {
    if(['grid','circuit'].includes(e.type))return result.output?'lamp on':'lamp off';
    if(e.type==='daylight')return result.detail;
    if(e.type==='convection')return result.state==='circulating'?'Whole-tank convection current':'Warm upper layer; weak whole-tank circulation';
    if(e.grade===10){
      if(result.samples)return `${result.output} ${result.unit}; displacement ${result.displacement} m`;
      if(e.type==='journey')return `${result.distance} m distance; ${result.displacement} m east displacement`;
      if(e.type==='mechanical-energy')return `${result.potential} J potential + ${result.kinetic} J kinetic`;
      if(e.type==='em-link')return result.detail;
      return `${result.output} ${result.unit}`;
    }
    if(e.grade===9){
      if(e.type==='forces')return `${Math.abs(result.output)} N ${result.state==='balanced'?'balanced':result.state+' resultant'}`;
      if(e.type==='magnet')return result.state==='attract'?'Magnetic attraction':'Magnetic repulsion';
      if(e.type==='voltage-share')return `${result.drops[0]} V + ${result.drops[1]} V = 3 V`;
      if(e.type==='supply-route')return `${result.output}/3 stages in supply order`;
      if(e.type==='energy-budget')return `${result.output.toFixed(3)} kWh; R${result.cost.toFixed(2)}; ${result.lit?'lighting supplied':'no lighting'}`;
      return `${result.output} ${result.unit}`;
    }
    if(e.grade===8){
      if(['network','coil','transmit'].includes(e.type))return `${result.output} ${result.unit}`;
      if(e.type==='charge')return `${result.state==='attract'?'Attraction':'Repulsion'}: ${result.rodCharge<0?'negative':'positive'} rod and ${result.probe<0?'negative':'positive'} probe`;
      if(e.type==='branch')return `${result.output} lamp${result.output===1?'':'s'} on`;
      if(e.type==='mirror')return `Reflected ray: ${result.state} receiver direction`;
      if(e.type==='refract')return result.state==='air'?'No change of direction':`Ray bends towards the normal in ${result.state}`;
      if(e.type==='surface')return result.state==='smooth'?'Parallel reflected rays':'Scattered reflected rays';
      if(e.type==='spectrum')return result.state==='spectrum'?'Visible spectrum':result.state==='white'?'White beam':'Beam blocked';
      if(e.type==='combine')return result.state==='white'?'Recombined white light':'Separate spectral components';
    }
    if(result.energy)return `${result.energy.potential} potential, ${result.energy.kinetic} kinetic, ${result.energy.surroundings} surroundings (model units)`;
    return `${result.output} ${result.unit}`.trim();
  }
  function setting(e,t,index) {return e.type==='grid'?`Wire arrangement ${index+1}`:e.type==='supply-route'?t.value.split('').map(n=>['Generator','Transmission','Local supply'][Number(n)]).join(' → '):`${e.grade>=7&&e.options?e.options.find(o=>o[0]===t.value)?.[1]||t.value:t.value}${e.unit?' '+e.unit:''}${e.type==='circuit'?(t.closed?', switch closed':', switch open'):''}`;}
  function notebook(p) {
    return missions.flatMap(m=>Object.keys(p.journal[m.id]||{}).map(key=>{
      const index=Number(key),e=experiment(m,index);
      const evidence=p.journal[m.id][key];
      return {mission:m.title,station:m.stations[index].name,grade:e.grade,topic:e.topic,concept:e.concept,explanation:e.explanation,evidence,
        observations:evidence.trials.map((t,n)=>`${setting(e,t,n)} → ${observation(e,simulate(m,index,t.value,t.closed))}`)};
    }));
  }
  // Deliberately simplified, repeatable teaching models, not laboratory measurements.
  function simulate(mission, station, value, closed=true) {
    const m=experiment(mission,station);
    const s=m.stations[station];
    const final=finalChapter?.simulate(m,s,value);
    if(final)return final;
    const mechanical=power?.simulate(m,s,value);
    if(mechanical)return mechanical;
    const electrical=signal?.simulate(m,s,value);
    if(electrical)return electrical;
    const thermal=heat?.simulate(m,s,value);
    if(thermal)return thermal;
    const extra=recovery.simulate(m,s,value);
    if(extra)return extra;
    let output=0, unit='m', detail='';
    if(m.type==='cart') { value=clamp(value,1,6); output=Math.max(0,value*2-s.resistance); detail='Same trolley and track; only the push changes.'; }
    if(m.type==='sound') { value=clamp(value,10,30); output=240*(20/value)**2;unit='Hz';detail='Same ruler and pluck; only its free length changes.'; }
    if(m.type==='wheels') { output=s.energy*({locked:.4,rubbing:1,free:2}[value]||.4);detail='Same cart, track and starting energy; only the wheel assembly changes.'; }
    if(m.type==='spring') {value=clamp(value,1,10);output=.2*value*value;detail='Same spring and capsule; only compression changes.';}
    if(m.type==='circuit') {output=value==='copper'&&closed?1:0;unit='';detail=output?'Complete conducting path: lamp on.':!closed?'The open switch breaks the path.':'The bridge is an insulator: lamp off.';}
    const success=m.type==='circuit'?output===1:output>=s.target[0]&&output<=s.target[1];
    return {output:Math.round(output*10)/10,unit,success,detail};
  }
  function blank() { return {version:1,current:0,completed:{},records:{},journal:{},checkpoints:{},settings:{music:.45,effects:.7,reduced:false}}; }
  function sanitize(raw) {
    const p=blank(); if(!raw||raw.version!==1)return p;
    for(const m of missions) {
      if(raw.completed?.[m.id]===true&&missions.slice(0,missions.indexOf(m)).every(previous=>p.completed[previous.id]))p.completed[m.id]=true;
      if(raw.records?.[m.id])p.records[m.id]=Math.floor(clamp(raw.records[m.id],0,12));
      for(let i=0;i<3;i++)if(raw.journal?.[m.id]?.[i]&&typeof raw.journal[m.id][i]==='object'){
        p.journal[m.id]||={};p.journal[m.id][i]=cleanLab(experiment(m,i),raw.journal[m.id][i]);
      }
      const c=raw.checkpoints?.[m.id];
      if(c&&typeof c==='object') {
        const solved=Array.isArray(c.solved)?[...new Set(c.solved.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]:[];
        const labs={};
        for(let i=0;i<3;i++) {
          const l=c.labs?.[i];if(!l||typeof l!=='object')continue;
          labs[i]=cleanLab(experiment(m,i),l);
        }
        p.checkpoints[m.id]={x:clamp(c.x,50,route(m).length-160),solved,cells:Array.isArray(c.cells)?[...new Set(c.cells.filter(n=>Number.isInteger(n)&&n>=0&&n<12))]:[],labs};
        for(const i of solved)if(!p.journal[m.id]?.[i])recordRepair(p,m,i);
        if(p.checkpoints[m.id].cells.length)p.records[m.id]=Math.max(p.records[m.id]||0,p.checkpoints[m.id].cells.length);
      }
    }
    p.current=clamp(Math.floor(raw.current),0,missions.length-1);
    if(!isUnlocked(p,p.current))p.current=missions.findIndex((_,i)=>isUnlocked(p,i)&&!p.completed[missions[i].id]);
    p.current=Math.max(0,p.current);
    if(p.completed[missions[p.current].id]&&p.checkpoints[missions[p.current].id]?.solved.length===3&&p.current<missions.length-1&&isUnlocked(p,p.current+1))p.current++;
    p.settings={music:clamp(raw.settings?.music??.45,0,1),effects:clamp(raw.settings?.effects??.7,0,1),reduced:!!raw.settings?.reduced};
    return p;
  }
  function isUnlocked(p,i) {return Number.isInteger(i)&&i>=0&&i<missions.length&&(i===0||missions.slice(0,i).every(m=>p.completed[m.id]));}
  function load(storage) {try{return sanitize(JSON.parse(storage.getItem(SAVE_KEY)));}catch{return blank();}}
  function save(storage,p) {try{storage.setItem(SAVE_KEY,JSON.stringify(p));return true;}catch{return false;}}
  function score(p) {return missions.reduce((sum,m)=>sum+(p.completed[m.id]?1500:(p.checkpoints[m.id]?.solved.length||0)*400)+Math.max(p.records[m.id]||0,p.checkpoints[m.id]?.cells.length||0)*25,0);}
  function shuffled(answers,correct,rng=Math.random) {
    const a=answers.map((text,i)=>({text,correct:i===correct}));
    for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  return {SAVE_KEY,missions,simulate,blank,sanitize,isUnlocked,load,save,score,shuffled,clamp,experiment,route,cell,landingFloor,cleanLab,normalizeValue,comparisonReady,hint,recordRepair,notebook,observation,setting,wirePorts:recovery.ports,traceWires:recovery.trace};
});
