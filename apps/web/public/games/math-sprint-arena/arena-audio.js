/* Original procedurally composed level arrangements, with independent music/effects buses. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MathArenaAudio=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const titles=['Columns of Light','Across the Number Line','Workshop Sparks','Station Signals','Array Engines','Equal Energy','Tram Patterns','Market Lights','Fraction Crossing','City Restored',...Array.from({length:52},(_,i)=>`${i<10?'Arithmetic':i<20?'Fraction':i<30?'Multiplication':i<40?'Geometry':'Algebra'} Sprint ${i+1}`),'Shape Signs','Mirror Lights','Ruler Route','Square Steps','Delivery Weights','Water Measures','Tram Minutes','Survey Sparks','Data Skyline','Exhibition Night','Pi-Bot Review','Discovery Signals','Estimate Express','Ledger Lights','Solar Batches','Delivery Rhythm','Factor Locks','Pattern Network','Equivalent Bridges','Fraction Energy','Garden Shares','Market Plans','Angle Designs','Solid Workshop','Mirror Gallery','Measure Depot','Floor Plans','Cube Cargo','Journey Clock','Survey Centre','Discovery Festival','Discovery Review','Harbour Codes','Energy Accounts','Turbine Batches','Cargo Packing','Prime Workshop','Crew Ratios','Fraction Reservoir','Decimal Dock','Decimal Engines','Percent Plaza','Function Signals','Angle Lab','Design Moves','Net Studio','Garden Measures','Storage Volume','Measurement Mission','Research Data','Chance Station','Innovation Launch','Harbour Review'];
  titles.push('Signed Signals','Integer Elevators','Telescope Powers','Factor Frequencies','Fraction Fuel','Decimal Detectors','Budget Beats','Ratio Relay','Solar Array Steps','Function Gateway','Algebra Language','Balance Bridge','Journey Recorder','Angle Beacons','Shape Survey','Scale Studio','Triangle Terraces','Surface and Space','Data Detectives','Research Ridge Opening','Ridge Reflection');
  titles.push('Integer Reactors','Factor Switchboard','Exponent Array','Rational Fuel Cells','Decimal Calibration','Finance Lift','Solar Pattern Terrace','Function Uplink','Like-Term Locks','Distributive Workshop','Equation Relays','Coordinate Couriers','Signal Graph Observatory','Parallel Beam Alignment','Shape Structures','Pythagoras Bridges','Circle Decks','Prism Packing Bay','Evidence and Chance Lab','Skyline Lab Connected','Skyline Reflection');
  const themes=titles.map((title,i)=>({title,bpm:88+(i%16)*3,root:[48,50,53,55,57][i%5],notes:Array.from({length:16},(_,n)=>[0,2,4,7,9,12,7,4][((Math.imul(i+7,(n+3)*1103515245)>>>12)+n)%8]),rhythm:Array.from({length:16},(_,n)=>(n+i)%[3,4,5,6][i%4]!==0),bass:[0,5,3,4].map(n=>n+(i%3))}));
  // Give the new solid-object theme its own closing phrase; earlier arrangements stay intact.
  themes[85].notes[15]=11;
  // Preserve the first 94 arrangements; give new themes distinct closing phrases.
  for(let i=94;i<themes.length;i++){const used=new Set(themes.slice(0,i).map(t=>JSON.stringify(t.notes)));if(used.has(JSON.stringify(themes[i].notes)))for(const note of [11,14,16,19,21,23]){themes[i].notes[15]=note;if(!used.has(JSON.stringify(themes[i].notes)))break;}}
  function create(env,initial={}){
    const settings={music:.35,sfx:.65,...initial};let ac=null,musicBus=null,effectBus=null,timer=null,next=0,step=0,theme=0,active=false,blocked=false;const voices=new Set();
    const clear=()=>{if(timer!==null)env.clearInterval(timer);timer=null;for(const osc of voices){try{osc.stop();}catch{}}voices.clear();};
    function ensure(){if(blocked)return false;try{const Ctx=env.AudioContext||env.webkitAudioContext;if(!Ctx)return false;if(!ac){ac=new Ctx();musicBus=ac.createGain();effectBus=ac.createGain();musicBus.connect(ac.destination);effectBus.connect(ac.destination);apply();}if(ac.state==='suspended')ac.resume().catch(()=>{});return true;}catch{blocked=true;clear();return false;}}
    function apply(){if(!ac)return;musicBus.gain.value=Math.max(0,Math.min(1,settings.music))*.19;effectBus.gain.value=Math.max(0,Math.min(1,settings.sfx))*.22;}
    function voice(midi,time,duration,volume,type='triangle',bus=musicBus){const osc=ac.createOscillator(),gain=ac.createGain();osc.type=type;osc.frequency.value=440*Math.pow(2,(midi-69)/12);gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(volume,time+.012);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);osc.connect(gain);gain.connect(bus);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(time);osc.stop(time+duration+.025);}
    function schedule(){if(!active||!ac||env.document?.hidden)return;const t=themes[theme],beat=60/t.bpm/2;if(next<ac.currentTime-.2)next=ac.currentTime+.02;while(next<ac.currentTime+.16){const n=step%16;if(t.rhythm[n])voice(t.root+12+t.notes[n],next,beat*.8,.22);if(n%4===0){voice(t.root-12+t.bass[Math.floor(n/4)],next,beat*2,.30,'sine');voice(33,next,.09,.12,'sine');}if(n%2===1)voice(94+(theme%3),next,.025,.025,'triangle');step++;next+=beat;}}
    return {
      themes,
      get available(){return !!ac&&!blocked;},
      start(index){index=Math.max(0,Math.min(themes.length-1,Math.floor(index)||0));if(active&&theme===index&&timer!==null)return;clear();theme=index;step=0;active=true;if(!ensure())return;next=ac.currentTime+.03;schedule();timer=env.setInterval(schedule,80);},
      pause(){active=false;clear();},
      volume(kind,value){if(!['music','sfx'].includes(kind))return;settings[kind]=Math.max(0,Math.min(1,Number(value)||0));apply();},
      effect(kind){if(settings.sfx<=0||!ensure())return;const notes=({tap:[65],hint:[67,69],wrong:[55,53],correct:[72,76,79],complete:[60,64,67,72,76],move:[60,62]})[kind]||[65];notes.forEach((n,i)=>voice(n,ac.currentTime+i*.085,.12,kind==='wrong'?.12:.24,'sine',effectBus));},
      dispose(){active=false;clear();try{ac?.close()?.catch(()=>{});}catch{}}
    };
  }
  return {themes,create};
});
