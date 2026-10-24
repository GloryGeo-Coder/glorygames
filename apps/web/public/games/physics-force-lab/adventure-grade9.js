(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PhysicsPowerChapter=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const lessons={
    forces:{type:'forces',grade:9,topic:'Balanced and unbalanced contact forces',needsComparison:true,
      concept:'Forces on the same object combine. A resultant force changes its velocity.',
      variable:'Rightward cable tension',unit:'N',min:0,max:80,step:20,initial:0,
      prediction:'Two cables pull the same cart equally in opposite directions. What is the horizontal resultant?',
      predictions:['Zero: the horizontal forces are balanced','Twice either pull, towards the right','A force that always makes the cart stop'],correctPrediction:0,
      question:'What does a zero resultant tell us about the cart?',
      answers:['Its velocity does not change: it can stay at rest or move steadily','It must be moving to the right','All forces on it have disappeared'],correct:0,
      explanation:'These cable tensions are contact forces on the same cart. Opposing horizontal forces subtract; zero resultant means no change in horizontal velocity. A nonzero resultant changes velocity in its direction. Weight and the supporting force balance vertically; other resistance is ignored. The two cable forces are not an action–reaction pair, because both act on the cart.',
      hint:'The left cable pulls with 40 N. Compare a smaller, equal and larger rightward tension.'},
    gravity:{type:'gravity-place',grade:9,topic:'Gravitational force, mass and weight',needsComparison:true,
      concept:'Mass stays the same when location changes; weight depends on gravitational field strength.',
      variable:'Test location',initial:'earth',options:[['earth','Earth'],['moon','Moon'],['mars','Mars']],
      prediction:'What happens to the same object when it is weighed on the Moon instead of Earth?',
      predictions:['Its mass stays the same but its weight is smaller','Both its mass and weight become zero','Its mass increases while its weight stays the same'],correctPrediction:0,
      question:'Why is the Moon reading lower?',
      answers:['The Moon exerts a weaker gravitational pull on the same mass','The object loses matter during the test','Weight is measured in kilograms everywhere'],correct:0,
      explanation:'Mass measures the amount of matter, in kilograms (kg). Weight is the gravitational force on that mass, in newtons (N). The location model uses approximate field strengths of 9.8 N/kg on Earth, 1.6 N/kg on the Moon and 3.7 N/kg on Mars. The object’s mass remains 10 kg.',
      hint:'Keep the same 10 kg object. Compare the Earth and Moon force-meter readings.'},
    mass:{type:'gravity-mass',grade:9,topic:'Mass and gravitational force',needsComparison:true,
      concept:'At the same location, a larger mass has a greater weight.',
      variable:'Mass on the force meter',unit:'kg',min:1,max:10,step:1,initial:1,
      prediction:'At the same location, what happens when the mass doubles?',
      predictions:['Its weight doubles','Its weight is halved','Its gravitational field strength doubles'],correctPrediction:0,
      question:'Which measurements distinguish mass and weight?',
      answers:['Mass in kg and weight in N','Mass in N and weight in kg','Both quantities must be measured in watts'],correct:0,
      explanation:'Earth’s model field strength stays at 9.8 N/kg. Increasing the mass increases the gravitational force in the same proportion. The force meter reports weight in newtons; the mass setting is in kilograms.',
      hint:'Compare 1 kg and 5 kg on the same Earth force meter.'},
    magnet:{type:'magnet',grade:9,topic:'Magnetic field forces',needsComparison:true,
      concept:'Opposite magnetic poles attract and like poles repel without contact.',
      variable:'Facing pole of the movable magnet',initial:'N',options:[['N','North pole'],['S','South pole']],
      prediction:'Which pole will a fixed north pole attract?',
      predictions:['A south pole','Another north pole','Neither pole unless they touch'],correctPrediction:0,
      question:'Why can the magnets interact across a gap?',
      answers:['Magnetism is a field force that acts without contact','Every force requires direct contact','Magnetic poles are the same as electric charges'],correct:0,
      explanation:'A magnet has north and south poles. Unlike poles attract and like poles repel through their magnetic fields. Magnetic poles are not positive and negative electric charges. The schematic compares polarity at a fixed separation, not force against distance.',
      hint:'The fixed facing pole is north. Compare a north and a south pole facing it.'},
    wire:{type:'wire',grade:9,topic:'Factors affecting electrical resistance',needsComparison:true,
      concept:'Resistance depends on a conductor’s material, length, thickness and temperature.',
      variable:'Wire length preset',unit:'m',min:1,max:4,step:1,initial:1,
      prediction:'For the same material, thickness and temperature, what does a longer wire do?',
      predictions:['Increase resistance and reduce current at the same voltage','Reduce resistance and increase current','Leave resistance exactly unchanged'],correctPrediction:0,
      question:'Why was changing only one wire property useful?',
      answers:['It lets the comparison show that property’s effect on resistance','It forces every sample to have the same current','It makes the wire create energy'],correct:0,
      explanation:'Longer wires have more resistance; thicker wires have less. Different materials resist current differently, and ordinary metal resistance generally rises with temperature. Each investigation changes one property while keeping the others and the 3 V source fixed. These are illustrative sample values, not measured material constants.',
      hint:'Compare the initial sample with another setting while keeping the other properties fixed.'},
    cells:{type:'cells',grade:9,topic:'Cells connected in series',needsComparison:true,
      concept:'Correctly aligned cells in series add their potential differences.',
      variable:'Number of aligned series cells',unit:'cells',min:1,max:3,step:1,initial:1,
      prediction:'What is the total voltage of two aligned 1.5 V cells in series?',
      predictions:['3 V','1.5 V','0 V in every arrangement'],correctPrediction:0,
      question:'Where does the circuit’s energy come from?',
      answers:['Chemical energy in the cells is transferred through the circuit','The wires create energy','Current is used up and becomes a new cell'],correct:0,
      explanation:'Cells are chemical energy systems. In this ideal circuit each cell provides 1.5 V. Aligned series cells add their voltages. The same current flows through the fixed resistor and returns through the cells; charge is not consumed. Cell internal resistance is omitted.',
      hint:'Compare one 1.5 V cell with two aligned cells in series.'},
    bank:{type:'cell-bank',grade:9,topic:'Cells in series and parallel',needsComparison:true,
      concept:'Identical cells in parallel retain one cell’s voltage; aligned series cells add voltages.',
      variable:'Connection of the two identical cells',initial:'series',options:[['series','Aligned series cells'],['parallel','Matched parallel cells']],
      prediction:'What voltage does a matched parallel pair of ideal 1.5 V cells provide?',
      predictions:['1.5 V, the same as one cell','3 V, always double','No voltage because there are two paths'],correctPrediction:0,
      question:'Why did the parallel pair still read 1.5 V?',
      answers:['Both matched cells connect across the same two circuit nodes','Every parallel connection doubles voltage','The voltmeter removed one cell’s charge'],correct:0,
      explanation:'Matched ideal cells in parallel share the same terminal voltage. In series their aligned voltages add. In this model the same load draws less total current at 1.5 V than at 3 V. This is a virtual comparison, not a battery-assembly activity.',
      hint:'Compare the same two 1.5 V cells in aligned series and matched parallel.'},
    divider:{type:'voltage-share',grade:9,topic:'Voltage across series resistors',needsComparison:true,
      concept:'Voltage drops across series resistors add to the source voltage.',
      variable:'First and second resistor',initial:'equal',options:[['equal','Equal: 15 Ω and 15 Ω'],['low-high','10 Ω then 20 Ω'],['high-low','20 Ω then 10 Ω']],
      prediction:'In one series path, which resistor has the larger voltage drop?',
      predictions:['The resistor with greater resistance','Always the first resistor regardless of resistance','Neither: both drops must be zero'],correctPrediction:0,
      question:'What do the two resistor voltmeters show together?',
      answers:['Their readings add to the 3 V source voltage','Their readings always add to 6 V','The first resistor uses up all current'],correct:0,
      explanation:'Both series resistors carry the same current. The larger resistance has the larger voltage drop; the two drops add to the source’s 3 V. Total resistance stays 30 Ω across these comparisons, so current stays 100 mA.',
      hint:'Compare equal resistors with 10 Ω first and 20 Ω second.'},
    route:{type:'supply-route',grade:9,topic:'Generation and the national electricity grid',needsComparison:true,
      concept:'Generation, high-voltage transmission and local voltage reduction form a connected supply system.',
      variable:'Electricity supply route',initial:'210',
      options:['012','021','102','120','201','210'].map(v=>[v,v]),
      prediction:'Which sequence delivers generated electricity to consumers?',
      predictions:['Generator, transmission lines, local transformer and distribution','Homes, local transformer, then the generator','Transmission lines create fuel for a generator'],correctPrediction:0,
      question:'What does the local transformer do in this supply route?',
      answers:['Reduce the voltage for local distribution','Create energy from nothing','Replace every generator with a wire'],correct:0,
      explanation:'Energy sources drive electricity generation: steam, wind or moving water can turn a turbine and generator. High-voltage lines transmit electrical energy; transformers reduce voltage for local distribution. Solar photovoltaic cells use a different route to generate electricity directly. Protection devices disconnect faulty or overloaded circuits. This route is a system diagram, not wiring instructions.',
      hint:'Move the generator to the beginning. Transmission must come before local voltage reduction.'},
    budget:{type:'energy-budget',grade:9,topic:'Electrical power, energy and cost',needsComparison:true,
      concept:'Energy in kWh equals power in kW multiplied by hours; cost depends on energy used.',
      variable:'Lamp providing the same useful lighting',initial:'filament',options:[['filament','60 W filament lamp'],['halogen','42 W halogen lamp'],['led','10 W LED lamp'],['off','Lamp switched off']],
      prediction:'For the same useful lighting over five hours, which lamp uses least electrical energy?',
      predictions:['The 10 W LED lamp','The 60 W filament lamp','All lit lamps use exactly the same energy'],correctPrediction:0,
      question:'Which statement correctly describes the energy bill?',
      answers:['Energy is measured in kWh; multiply it by the price per kWh for cost','Power in watts is the same quantity as energy in kWh','A switched-off lamp provides the required lighting'],correct:0,
      explanation:'Power is the rate of energy transfer, measured in W or kW. Five hours at 10 W uses 0.010 kW × 5 h = 0.050 kWh. At the illustrative lesson price of R3.00 per kWh, that costs R0.15. The lamps are assumed to provide equal useful lighting; switching off fails the lighting requirement. This price is a teaching example, not a current electricity tariff.',
      hint:'Keep five hours of useful lighting. Compare the filament lamp with the LED, then read kWh and cost.'}
  };
  const missions=[
    {...lessons.forces,id:'force-yard',title:'The stalled drive yard',color:'#96e1ce',bg:'bg-crane-yard.png',
      story:'The Core’s mechanical drive has pushed a repair cart against its stops. Newtonia isolates the drive and rigs two test cables. Balance their pulls, start the cart moving and oppose a moving cart without confusing force direction with motion.',
      ending:'Your force records explain the stalled cart. Pip finds that the drive’s load sensors were calibrated as if every location had the same gravitational pull. The field laboratory holds the next clue.',
      stations:[
        {name:'Balanced inspection cart',left:40,target:[0,0],motion:'rest',goal:'Balance the 40 N left pull so a resting cart stays at rest.',hint2:'Compare rightward tensions 0 N and 40 N.'},
        {name:'Rightward launch',left:40,target:[20,20],motion:'rest',goal:'Produce a 20 N resultant to the right.',hint2:'Compare 20 N and 60 N rightward tensions.',lesson:{initial:20,question:'Why does the cart begin speeding up to the right?',answers:['The rightward tension is greater, giving a rightward resultant','Balanced forces always accelerate it','The left cable has stopped exerting any force'],explanation:'The right cable pulls with 60 N and the left with 40 N. Their horizontal resultant is 20 N to the right, so the initially resting cart starts speeding up that way. Both forces act on the same object.'}},
        {name:'Controlled slowdown',left:40,target:[-20,-20],motion:'right',goal:'Apply a 20 N leftward resultant while the cart is moving right.',hint2:'Compare 60 N and 20 N rightward tensions.',lesson:{initial:60,question:'What initially happens when the resultant opposes the cart’s rightward motion?',answers:['It slows down before it could stop or reverse','It instantly travels left at full speed','Its mass becomes zero'],explanation:'With a 20 N right pull and a 40 N left pull, the resultant is 20 N left. The cart is initially moving right, so it first slows down. Force direction describes the change in velocity, not necessarily its current direction.'}}
      ]},
    {id:'field-laboratory',title:'The field laboratory',grade:9,topic:'Mass, weight and field forces',color:'#aebfff',bg:'bg-gravity-lab.png',
      concept:'Gravity and magnetism can act without contact; mass and weight are different quantities.',
      story:'The replacement load sensor mixes kilograms and newtons. Use the same object in different gravity settings, calibrate the Earth force meter and unlock a magnetic gate. Keep each comparison fair.',
      ending:'The corrected readings identify a genuine overload, not a change in the cart’s mass. The drive’s control current is also unstable. Follow its cables into the resistance works.',
      stations:[
        {name:'Location comparison',expected:'moon',goal:'Select the 16 N reading for the same 10 kg object.',hint2:'Compare Earth and Moon without changing mass.',lesson:lessons.gravity},
        {name:'Earth force-meter calibration',target:[49,49],goal:'Select a mass weighing 49 N in the Earth model.',hint2:'Test 1 kg, then 5 kg; the field stays 9.8 N/kg.',lesson:lessons.mass},
        {name:'Magnetic inspection gate',expected:'S',goal:'Attract the movable magnet towards the fixed north pole.',hint2:'Compare facing north and south poles.',lesson:lessons.magnet}]},
    {...lessons.wire,id:'resistance-works',title:'The resistance works',color:'#ffc496',bg:'bg-circuit-room.png',
      story:'A bundle of replacement control wires gives inconsistent readings. Test length, thickness and temperature separately. The source stays at 3 V; choose the sample that reaches each calibration target.',
      ending:'The wire tests are repeatable. Newtonia finds a second mismatch: a replacement cell pack was connected differently from its label. Trace the cells and voltage drops before reconnecting it.',
      stations:[
        {name:'Length comparison',factor:'length',target:[150,150],goal:'Find the 150 mA reading by changing only wire length.',hint2:'Compare 1 m and 2 m.'},
        {name:'Thickness comparison',factor:'area',target:[600,600],goal:'Reach 600 mA by changing only cross-sectional area.',hint2:'Compare 1 and 2 model area units.',lesson:{variable:'Cross-sectional area',unit:'model units',min:1,max:3,step:1,initial:1,prediction:'With other properties fixed, what does a thicker wire do?',predictions:['Reduce resistance','Increase resistance in every metal','Remove all resistance'],hint:'Compare areas while keeping length, material, temperature and source voltage fixed.'}},
        {name:'Temperature comparison',factor:'temperature',target:[200,200],goal:'Find the hot sample reading of 200 mA.',hint2:'Compare 20 °C and 120 °C.',lesson:{variable:'Metal temperature',unit:'°C',min:20,max:120,step:50,initial:20,prediction:'What generally happens to an ordinary metal’s resistance as its temperature rises?',predictions:['It increases','It always becomes zero','It changes the source voltage'],hint:'Compare the same metal sample at 20 °C and 120 °C.'}}]},
    {id:'cell-vault',title:'The cell vault',grade:9,topic:'Cells and circuit potential difference',color:'#8cd9f0',bg:'level-07-circuit-lab.png',
      concept:'Cell arrangements and resistor voltage drops must match the intended supply.',
      story:'The vault’s labels claim that every pair of cells provides the same voltage. Compare aligned series cells, matched parallel cells and a two-resistor path. Record both resistor voltages before restoring the signal supply.',
      ending:'The supply labels now match the measurements. The Core’s protected restart route can be reconnected once you choose the control-wire material, rebuild the supply chain and keep the workshop’s lighting within its energy budget.',
      stations:[
        {name:'Series cell pack',target:[3,3],goal:'Provide 3 V with aligned 1.5 V cells.',hint2:'Compare one and two series cells.',lesson:lessons.cells},
        {name:'Matched parallel pack',expected:'parallel',goal:'Keep two matched cells at one cell’s 1.5 V.',hint2:'Compare series with matched parallel.',lesson:lessons.bank},
        {name:'Two-resistor monitor',expected:'low-high',goal:'Give the first resistor 1 V and the second 2 V from the same 3 V source.',hint2:'Compare equal resistors with 10 Ω first and 20 Ω second.',lesson:lessons.divider}]},
    {id:'power-district',title:'The protected restart route',grade:9,topic:'Resistance, electricity supply and energy cost',color:'#e4b8ed',bg:'level-12-quantum-core.png',
      concept:'Combine material evidence, a connected supply system and efficient energy use.',
      story:'Pip has the Core’s restart plan. Choose a low-resistance control link, arrange the supply stages and keep five hours of useful workshop lighting within 0.10 kWh. The mechanical drive remains isolated until its motion can be tested safely.',
      ending:'Nova’s protected supply returns. Your workshop now holds twenty-five mission photographs and a complete record of the recovery so far. The Quantum Core can communicate, but its mechanical drive still needs a motion-and-energy investigation before the final restart.',
      stations:[
        {name:'Control-link material',factor:'material',target:[1500,1500],goal:'Choose the equal-sized sample giving 1,500 mA in this model.',hint2:'Compare the illustrative nichrome sample with copper.',lesson:{...lessons.wire,variable:'Equal-sized wire sample',unit:'',initial:'nichrome',options:[['nichrome','Nichrome'],['steel','Steel'],['copper','Copper']],prediction:'Can equal-sized conducting samples have different resistances?',predictions:['Yes: resistance also depends on material','No: all metals have identical resistance','Only if their source voltage changes'],hint:'Keep dimensions, temperature and voltage fixed. Compare different materials.'}},
        {name:'Supply-system route',expected:'012',goal:'Arrange generator, transmission and local distribution in supply order.',hint2:'Generator first; high-voltage transmission second; local transformer and distribution third.',lesson:lessons.route},
        {name:'Workshop lighting budget',target:[0,.1],goal:'Provide five hours of useful lighting using no more than 0.10 kWh.',hint2:'Compare the lit filament and LED options. Switching off does not provide the required lighting.',lesson:lessons.budget}]}
  ];
  const round=n=>Math.round(n*1000)/1000;
  function simulate(e,s,value){
    let output=0,unit='',detail='',state='',extra={};
    if(e.type==='forces'){
      const right=Math.max(0,Math.min(80,Number(value)||0));output=right-s.left;unit='N resultant';
      state=output===0?'balanced':output>0?'right':'left';extra={right,left:s.left,motion:s.motion};
      detail=output===0?'Horizontal forces balance. Velocity does not change.':s.motion==='right'&&output<0?'The resultant points left while the cart initially moves right, so it initially slows down.':`The resultant points ${state}; velocity changes in that direction.`;
      detail+=' These forces act on the same cart; their reaction forces act on the cables.';
    }else if(e.type==='gravity-place'||e.type==='gravity-mass'){
      const mass=e.type==='gravity-place'?10:Math.max(1,Math.min(10,Number(value)||1)),field=e.type==='gravity-place'?({earth:9.8,moon:1.6,mars:3.7}[value]||9.8):9.8;
      output=round(mass*field);unit='N';extra={mass,field};detail=`Mass ${mass} kg; gravitational field ${field} N/kg; weight ${output} N. ${e.type==='gravity-place'?'Only location changes.':'Only mass changes; location stays Earth.'}`;
    }else if(e.type==='magnet'){
      state=value==='S'?'attract':'repel';output=state==='attract'?1:-1;detail=`Fixed north facing ${value==='S'?'south':'north'}: ${state==='attract'?'attraction':'repulsion'} across the gap. The magnets do not need to touch.`;
    }else if(e.type==='wire'){
      let resistance=10,setting;
      if(s.factor==='length'){resistance=10*Number(value);setting=`Length ${value} m; area, material and temperature fixed.`;}
      if(s.factor==='area'){resistance=10/Number(value);setting=`Area ${value} model units; length, material and temperature fixed.`;}
      if(s.factor==='temperature'){resistance=10*(1+.005*(Number(value)-20));setting=`Temperature ${value} °C; same metal and dimensions.`;}
      if(s.factor==='material'){resistance={copper:2,steel:8,nichrome:40}[value]||40;setting=`Material ${value}; dimensions and temperature fixed.`;}
      output=round(3000/resistance);unit='mA';extra={resistance:round(resistance),voltage:3};detail=`${setting} Source 3 V; resistance ${round(resistance)} Ω; current ${output} mA. Illustrative samples, not laboratory readings.`;
    }else if(e.type==='cells'){
      const count=Math.max(1,Math.min(3,Math.round(Number(value)||1)));output=count*1.5;unit='V';extra={count,current:output/30*1000,resistors:[30],drops:[output]};detail=`${count} aligned 1.5 V cell${count===1?'':'s'}: ${output} V total; ${extra.current} mA through the same 30 Ω load. Chemical energy in the cells supplies the circuit.`;
    }else if(e.type==='cell-bank'){
      output=value==='parallel'?1.5:3;unit='V';extra={count:2,current:output/30*1000,resistors:[30],drops:[output]};state=value;detail=`Two matched ideal 1.5 V cells in ${value}: ${output} V across the same 30 Ω load; ${extra.current} mA total. ${value==='parallel'?'The matched cells share this current equally.':'Aligned series voltages add.'}`;
    }else if(e.type==='voltage-share'){
      const resistors=value==='low-high'?[10,20]:value==='high-low'?[20,10]:[15,15];extra={resistors,drops:resistors.map(r=>r*.1),current:100,count:2};output=extra.drops[0];unit='V at first resistor';detail=`First ${extra.drops[0]} V + second ${extra.drops[1]} V = 3 V source. Both resistors carry the same 100 mA.`;
    }else if(e.type==='supply-route'){
      let connected=0;for(let i=0;i<3&&value[i]===String(i);i++)connected++;
      output=connected;unit='stages in supply order';detail=connected===3?'Generator → high-voltage transmission → local transformer and distribution → consumers. Each stage has a different role; no stage creates energy.':'Supply route interrupted. Start with generation, then transmit, then reduce voltage locally before consumers.';
    }else if(e.type==='energy-budget'){
      const watts={filament:60,halogen:42,led:10,off:0}[value]??60,hours=5;output=round(watts/1000*hours);unit='kWh';extra={watts,hours,cost:round(output*3),lit:watts>0};detail=`${watts} W ÷ 1,000 × ${hours} h = ${output.toFixed(3)} kWh; example price R3.00/kWh gives R${extra.cost.toFixed(2)}. ${extra.lit?'The required lighting is provided.':'No useful lighting: this does not meet the task.'}`;
    }else return null;
    return {output,unit,state,detail,...extra,success:s.expected?value===s.expected:output>=s.target[0]&&output<=s.target[1]&&(e.type!=='energy-budget'||extra.lit)};
  }
  return {missions,lessons,simulate};
});
