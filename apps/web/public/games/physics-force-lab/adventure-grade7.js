(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PhysicsHeatChapter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const lessons = {
    energy: {
      type:'energy',grade:7,topic:'Potential, kinetic and transferred energy',needsComparison:true,
      concept:'Stored potential energy can become kinetic energy. Energy transferred to the surroundings is not destroyed.',
      variable:'Position down the ramp',unit:'%',min:0,max:100,step:25,initial:0,
      prediction:'As the cart rolls down the ramp, what happens to its gravitational potential energy?',
      predictions:['It transfers into kinetic energy and, with resistance, energy in the surroundings','It increases because the cart is lower','It is destroyed when the cart moves'],correctPrediction:0,
      question:'What do the energy bars show as the cart moves down?',
      answers:['Potential energy decreases as kinetic energy increases','The cart creates energy by moving','Kinetic energy is greatest while the cart is still at the top'],correct:0,
      explanation:'The raised cart has gravitational potential energy. As it moves downhill, energy transfers into kinetic energy. Real energy is measured in joules (J); these bars use 100 model units to illustrate transfers. No energy is created or destroyed.',
      hint:'Compare the top with a position farther down. Add the potential, kinetic and surroundings bars: the total stays 100.'
    },
    conduction: {
      type:'conduction',grade:7,topic:'Heating, temperature and conduction',needsComparison:true,
      concept:'Heating transfers energy from a hotter object to a cooler one. Materials conduct heat at different rates.',
      variable:'Bridge material',initial:'wood',options:[['copper','Copper'],['steel','Steel'],['wood','Wood']],
      prediction:'With the same hot source and cooler sensor, which bridge should warm the sensor fastest?',
      predictions:['Copper, a good thermal conductor','Wood, a poor thermal conductor','All materials must conduct heat equally fast'],correctPrediction:0,
      question:'Why did the sensor temperature rise?',
      answers:['Energy transferred from the hotter source through the bridge to the cooler sensor','Cold moved from the sensor into the source','The bridge created heat without an energy source'],correct:0,
      explanation:'Energy transfers from hotter to cooler objects by conduction through the bridge. Copper conducts faster than steel in this model; wood slows the transfer. Temperature in degrees Celsius tells us how hot or cold the sensor is, not how much energy it contains.',
      hint:'Keep the 80 °C source, 20 °C starting sensor, bridge dimensions and two-minute observation time the same. Change only the material.'
    },
    convection: {
      type:'convection',grade:7,topic:'Heat transfer by convection',needsComparison:true,
      concept:'Heated fluid can rise while cooler fluid sinks, forming a convection current.',
      variable:'Heater position',initial:'top',options:[['top','At the top'],['bottom','At the bottom']],
      prediction:'Which heater position should set up a strong current throughout the model tank?',
      predictions:['Heating from below','Heating only the upper layer','Both positions must produce the same circulation'],correctPrediction:0,
      question:'What carries energy around the tank in a convection current?',
      answers:['The moving liquid: warmer water rises and cooler water sinks','Only the solid wall moves around the tank','Cold energy rises from the bottom'],correct:0,
      explanation:'Water heated from below expands and becomes less dense, so it rises. Cooler, denser water sinks and replaces it. Heating only the upper layer produces stable layering in this simplified tank, rather than a strong current through the whole tank.',
      hint:'Compare heating from the top and from the bottom. Follow the warm upward arrow and cool downward return path.'
    },
    radiation: {
      type:'radiation',grade:7,topic:'Radiation, absorption and reflection',needsComparison:true,
      concept:'Radiation can transfer energy without contact. Dark and shiny surfaces absorb different amounts.',
      variable:'Collector surface',initial:'shiny',options:[['shiny','Shiny silver'],['white','Matt white'],['black','Matt black']],
      prediction:'Under the same light source, which surface should warm fastest?',
      predictions:['Matt black, which absorbs more radiant energy','Shiny silver, which reflects more radiant energy','Surface finish cannot affect absorption'],correctPrediction:0,
      question:'Why did the black collector warm more quickly than the shiny one?',
      answers:['It absorbed more radiant energy from the same source','The collectors had to touch the Sun','The shiny collector destroyed the incoming energy'],correct:0,
      explanation:'Radiation transfers energy without direct contact or moving fluid. In this model the matt black surface absorbs more of the incoming energy, while shiny silver reflects more. The area, starting temperature, exposure time and light source remain the same.',
      hint:'Compare shiny silver and matt black. Use the temperature table to see which surface gains more energy.'
    },
    insulation: {
      type:'insulation',grade:7,topic:'Insulation and energy saving',needsComparison:true,
      concept:'Insulation slows energy transfer. It can keep hot objects warmer and cold objects cooler for longer.',
      variable:'Insulating wrap',initial:'bare',options:[['bare','No extra wrap'],['paper','Paper wrap'],['wool','Wool wrap']],
      prediction:'For the same container and surroundings, what should a good insulating wrap do?',
      predictions:['Slow the temperature change towards the surroundings','Create heat inside every container','Keep the temperature exactly unchanged forever'],correctPrediction:0,
      question:'Why does insulation help both warm and cold containers?',
      answers:['It slows energy transfer in either direction','It always makes the contents hotter','It destroys energy before it reaches the contents'],correct:0,
      explanation:'Energy transfers from hotter to cooler regions. Insulation slows that transfer: it reduces heat loss from hot contents and heat gain by cold contents. It does not create heat or prevent all transfer forever.',
      hint:'Compare the same container with no extra wrap and with wool. Read the temperatures at the same elapsed time.'
    }
  };
  const conductionStations = [
    {name:'Thermal sensor bridge',target:[60,65],goal:'Warm the sensor to 60–65 °C after two minutes.',hint2:'Compare wood with copper.'},
    {name:'Protected handle',target:[20,26],goal:'Keep the handle sensor at or below 26 °C.',lesson:{initial:'copper'},hint2:'Compare copper with wood. A poor conductor helps protect the handle.'},
    {name:'Calibration bridge',target:[42,46],goal:'Find the bridge giving a 42–46 °C reading.',hint2:'Compare wood with steel, using the same two-minute observation.'}
  ];
  const radiationStation={name:'Solar collector',target:[60,65],goal:'Warm the collector to 60–65 °C after ten model minutes.',hint2:'Compare shiny silver with matt black.'};
  const insulationStations=[
    {name:'Warm delivery',start:80,ambient:20,target:[65,80],goal:'Keep the container at 65 °C or warmer after ten model minutes.',hint2:'Compare no extra wrap with wool.'},
    {name:'Cold instrument box',start:5,ambient:30,target:[5,12],goal:'Keep the box at 12 °C or cooler after ten model minutes.',hint2:'Compare no extra wrap with wool. Heat flows into this colder box.'},
    {name:'Summer shelter',start:20,ambient:36,target:[20,25],goal:'Keep the shelter at or below 25 °C after ten model minutes.',hint2:'Compare no extra wrap with wool. Insulation also slows heat gain in summer.'}
  ];
  const missions=[
    {...lessons.energy,id:'energy-courier',title:'The energy courier',color:'#9ddec5',bg:'bg-springboard-energy.png',
      story:'The cooling district’s emergency rail has no powered launch. Newtonia proposes releasing a cart from a raised ramp. Track its stored and movement energy, then account for the energy transferred to the surroundings on the rough final section.',
      ending:'The cart delivers the first replacement sensor. Its energy ledger balances, but the sensor’s metal bridge warms too quickly. Pip guides you into the heat-exchange workshop.',
      stations:[
        {name:'Upper ramp monitor',loss:0,target:[25,25],goal:'Reach 25 kinetic units while keeping the model total at 100.',hint2:'Compare 0% with 25% of the way down the ramp.'},
        {name:'Lower ramp monitor',loss:0,target:[75,75],goal:'Reach 75 kinetic units and identify the remaining stored energy.',hint2:'Compare 0% with 75% of the way down the ramp.'},
        {name:'Rough-track ledger',loss:.2,target:[80,80],goal:'Reach 80 kinetic units and account for the other 20 units.',hint2:'Compare the top with 100% of the way down. Include energy transferred to the surroundings.',lesson:{question:'Where did the 20 units missing from useful movement go?',answers:['They transferred to the surroundings, mainly as heating','They were destroyed by friction','They turned back into height at the bottom'],correct:0,explanation:'At the bottom, the model has 80 kinetic units and 20 units transferred to the surroundings through resistance. Useful movement is reduced, but all 100 input units are accounted for.'}}
      ]},
    {...lessons.conduction,id:'thermal-bridges',title:'The heat-exchange workshop',color:'#ffb484',bg:'level-05-energy-reactor.png',
      story:'Three sensor bridges connect a hot source to cooler probes. Choose a material to warm one probe, protect a handle and calibrate a third. Compare equal bridges for the same time, and follow the energy from hot to cool.',
      ending:'The sensors now report reliable temperatures. Their records show that energy is spreading unevenly through the district. The next clue lies in the watchtowers’ tanks and solar collectors.',stations:conductionStations},
    {id:'thermal-watch',title:'The thermal watchtowers',grade:7,topic:'Convection and radiation',color:'#f2c577',bg:'bg-solar-boost.png',
      concept:'Convection moves energy with a fluid; radiation transfers energy without contact.',
      story:'Pip discovers that the watchtowers’ heaters were fitted in the wrong positions. Use two water models to compare circulation and layering, then restore the solar collector by testing how its surface absorbs radiation.',
      ending:'The watchtowers’ diagrams are corrected and their collector is working. Newtonia finds a second problem: the district wastes too much energy keeping supplies warm and instruments cool.',
      stations:[
        {name:'Circulation tank',expected:'bottom',goal:'Set up a current through the whole tank.',hint2:'Compare heating at the top with heating at the bottom.',lesson:lessons.convection},
        {name:'Layering tank',expected:'top',goal:'Heat the upper layer while keeping strong whole-tank circulation low.',hint2:'Compare bottom heating with top heating.',lesson:{...lessons.convection,initial:'bottom',question:'Why did heat remain concentrated near the top?',answers:['The warmed water was already above the cooler, denser water','Warm water always sinks below cold water','Convection happens through empty space'],correct:0}},
        {...radiationStation,lesson:lessons.radiation}
      ]},
    {...lessons.insulation,id:'insulation-route',title:'The insulated route',color:'#a9c8ff',bg:'bg-energy-park.png',
      story:'The recovery team needs warm deliveries, cool instruments and a shelter that stays comfortable in summer. Test the same containers with different wraps. Compare temperature changes over time before choosing each repair.',
      ending:'The insulated deliveries arrive, and the shelter uses less energy. Your notebook now shows why insulation helps in both hot and cold conditions. The central cooling relay is ready for its final repair.',stations:insulationStations},
    {id:'cooling-core',title:'The cooling-district rescue',grade:7,topic:'Heat and energy: combined investigation',color:'#e0b5ff',bg:'bg-physics-boss.png',
      concept:'Use evidence about conduction, radiation and insulation to manage energy transfers.',
      story:'The Quantum Core’s cooling district is still locked down. Fit a safe control handle, reflect unwanted solar heating away from a sensor and protect a cold instrument box. Use evidence from your investigations to restore the relay.',
      ending:'The cooling relay returns to service. Newtonia confirms that faulty heat readings triggered the Core shutdown. A missing electrical signal still prevents a restart. With the district safe, you and Pip prepare to investigate that signal next.',
      stations:[
        {...conductionStations[1],name:'Relay control handle',lesson:{...lessons.conduction,initial:'copper'}},
        {...radiationStation,name:'Reflective sensor shield',target:[20,30],goal:'Keep the exposed sensor at or below 30 °C after ten model minutes.',hint2:'Compare matt black with shiny silver.',lesson:{...lessons.radiation,initial:'black',question:'Why did the shiny shield keep the sensor cooler?',answers:['It reflected more of the incoming radiant energy','It stopped the Sun producing energy','It absorbed more energy than the black surface'],correct:0}},
        {...insulationStations[1],name:'Core instrument case',lesson:lessons.insulation}
      ]}
  ];

  const round=n=>Math.round(n*10)/10;
  const times=[0,2,4,6,8,10];
  function simulate(lesson,station,value){
    let output,unit,detail,series,energy,state;
    if(lesson.type==='energy'){
      const progress=Math.max(0,Math.min(100,Number(value)||0)),loss=station.loss||0;
      energy={potential:round(100-progress),kinetic:round(progress*(1-loss)),surroundings:round(progress*loss)};
      output=energy.kinetic;unit='kinetic units';detail=`Potential ${energy.potential} + kinetic ${energy.kinetic} + surroundings ${energy.surroundings} = 100 model units. ${loss?'Resistance transfers some energy to the surroundings.':'Resistance is ignored in this ideal ramp model.'}`;
    }else if(lesson.type==='conduction'){
      const fraction={copper:.7,steel:.4,wood:.08}[value]??.08;
      output=round(20+60*fraction);unit='°C';detail='Same 80 °C source, 20 °C starting sensor, bridge dimensions and two-minute test. Energy transfers from hot to cool.';
    }else if(lesson.type==='convection'){
      state=value==='bottom'?'circulating':'layered';output=state==='circulating'?1:0;unit='';
      detail=state==='circulating'?'Heating from below: warmer water rises and cooler water sinks, forming a current.':'Heating at the top: the warm upper layer stays above cooler water; whole-tank circulation is weak in this model.';
      return {output,unit,detail,state,success:value===station.expected};
    }else if(lesson.type==='radiation'){
      const rise={black:42,white:21,shiny:7}[value]??7;
      series=times.map(time=>({time,temperature:round(20+rise*time/10)}));output=series.at(-1).temperature;unit='°C';detail='Same source, collector area, starting temperature and ten-minute exposure; only surface finish changes.';
    }else if(lesson.type==='insulation'){
      const rate={bare:.18,paper:.06,wool:.025}[value]??.18;
      series=times.map(time=>({time,temperature:round(station.ambient+(station.start-station.ambient)*Math.exp(-rate*time))}));output=series.at(-1).temperature;unit='°C';detail=`Same container, starting temperature (${station.start} °C), surroundings (${station.ambient} °C) and ten-minute test. Only the wrap changes.`;
    }else return null;
    return {output,unit,detail,series,energy,state,success:output>=station.target[0]&&output<=station.target[1]};
  }
  return {missions,lessons,simulate};
});
