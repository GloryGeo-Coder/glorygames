(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PhysicsSignalChapter=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const lessons={
    charge:{type:'charge',grade:8,topic:'Static electricity and electron transfer',needsComparison:true,
      concept:'Electron transfer changes net charge. Like charges repel; unlike charges attract.',
      variable:'Transfer between cloth and rod',initial:'lose',options:[['lose','Rod loses electrons'],['gain','Rod gains electrons']],
      prediction:'If electrons move from the cloth onto the initially neutral rod, what charge does the rod gain?',
      predictions:['Negative charge, because it has extra electrons','Positive charge, because protons move onto it','No charge, because electrons have no charge'],correctPrediction:0,
      question:'What explains the force between the rod and the probe?',
      answers:['Unlike charges attract and like charges repel','All charged objects repel each other','Protons moved between the rod and cloth'],correct:0,
      explanation:'Rubbing certain materials can transfer electrons. Gaining electrons makes the rod negative; losing electrons makes it positive. Protons stay in their materials. The cloth gains the opposite charge, so total charge is conserved. This model compares already charged probes, not polarisation of neutral objects.',
      hint:'Compare both transfer directions. Read the signs on the rod and the already charged probe.'},
    network:{type:'network',grade:8,topic:'Series and parallel circuits',needsComparison:true,
      concept:'Series gives one current path; parallel gives separate branches.',
      variable:'Number of identical resistors',unit:'',min:1,max:3,step:1,initial:1,
      prediction:'At the same source voltage, what happens when another identical resistor is added in series?',
      predictions:['The current decreases','The current increases','The cell creates a new current path'],correctPrediction:0,
      question:'Why did adding a resistor in series reduce the current?',
      answers:['The same path has more resistance at the same source voltage','The current was used up before returning to the cell','The cell stopped storing chemical energy'],correct:0,
      explanation:'A series circuit has one conducting path. Current is the same at every point of that path; adding resistance reduces the current throughout. These are identical fixed resistors with an ideal 3 V source and wires, not temperature-dependent lamp filaments. No circuit equations are needed.',
      hint:'Compare one resistor with two or three. Keep the source voltage and each resistor unchanged.'},
    mirror:{type:'mirror',grade:8,topic:'Reflection of light',needsComparison:true,
      concept:'Light reflects from a smooth mirror with equal angles to the normal.',
      variable:'Incoming ray preset',initial:'near',options:[['near','Near the normal'],['middle','Middle receiver'],['wide','Wide receiver']],
      prediction:'If the incoming ray moves farther from the normal, what happens to the reflected ray?',
      predictions:['It moves equally far from the normal on the other side','It passes through the opaque mirror','It always returns along the normal'],correctPrediction:0,
      question:'Which relationship did the mirror diagram show?',
      answers:['The incoming and reflected rays make equal angles with the normal','The angles are measured along the mirror surface','The reflected angle is always twice the incoming angle'],correct:0,
      explanation:'The normal is perpendicular to the mirror. The angle of incidence equals the angle of reflection, both measured from the normal. Preset rays help you aim without calculating or measuring angles.',
      hint:'Compare the near-normal preset with the middle preset. Follow the outgoing arrow to its receiver.'},
    surface:{type:'surface',grade:8,topic:'Smooth and rough reflection',needsComparison:true,
      concept:'Smooth surfaces reflect parallel rays together; rough surfaces scatter them.',
      variable:'Reflecting surface',initial:'rough',options:[['rough','Crumpled foil'],['smooth','Smooth mirror']],
      prediction:'Which surface should keep the reflected parallel rays together?',
      predictions:['A smooth mirror','Crumpled foil','Both must absorb every ray'],correctPrediction:0,
      question:'Why did the rough surface spread out the reflected light?',
      answers:['Its small surfaces have different orientations','Reflection stops obeying its rule on rough surfaces','The surface created new colours'],correct:0,
      explanation:'Each small part of a rough surface still obeys the reflection rule, but its orientation differs. This scatters the reflected rays. A smooth surface reflects parallel incoming rays together.',
      hint:'Keep the incoming rays unchanged. Compare crumpled foil with a smooth mirror.'},
    refract:{type:'refract',grade:8,topic:'Refraction of light',needsComparison:true,
      concept:'Light entering water or glass obliquely from air bends towards the normal.',
      variable:'Medium below the boundary',initial:'air',options:[['air','Air'],['water','Water'],['glass','Glass']],
      prediction:'What should happen when this oblique ray enters water from air?',
      predictions:['It bends towards the normal','It must bend away from the normal','It stops permanently at the surface'],correctPrediction:0,
      question:'Why did the transmitted ray change direction at the boundary?',
      answers:['Light changes speed as it enters a different transparent medium obliquely','The water produces a new light source','Reflection and refraction are always the same process'],correct:0,
      explanation:'Light changes speed between transparent media. Entering water or glass obliquely from air bends this ray towards the normal. Along the normal there is no change of direction. The diagram shows the transmitted ray; a weaker reflected ray is omitted. The model uses fixed optical properties without assessing refraction equations.',
      hint:'Compare air with water. The incoming ray stays fixed; watch the transmitted ray below the boundary.'},
    transmit:{type:'transmit',grade:8,topic:'Transparent and opaque materials',needsComparison:true,
      concept:'A transparent window passes most light; an opaque barrier blocks it and casts a shadow.',
      variable:'Signal window',initial:'card',options:[['card','Opaque card'],['glass','Clear glass']],
      prediction:'Which window should let most of the beacon light reach the receiver?',
      predictions:['Clear glass','Opaque card','Both must block all light'],correctPrediction:0,
      question:'Why was the receiver dark behind the card?',
      answers:['The opaque card blocked the direct light and cast a shadow','The card made light travel faster','All transparent materials absorb all light'],correct:0,
      explanation:'Opaque card does not transmit visible light; it absorbs or reflects it and casts a shadow behind it. Clear glass transmits most light, although some is reflected or absorbed. Light travels in straight lines between boundaries.',
      hint:'Compare card and clear glass. Follow the direct beam to the receiver.'},
    spectrum:{type:'spectrum',grade:8,topic:'White light and the visible spectrum',needsComparison:true,
      concept:'A triangular prism can refract and disperse white light into its component colours.',
      variable:'Object in the white beam',initial:'gap',options:[['gap','Empty gap'],['prism','Triangular glass prism'],['card','Opaque card']],
      prediction:'What can a triangular glass prism reveal about white light?',
      predictions:['White light contains a range of visible colours','White light contains only red','The prism creates light from nothing'],correctPrediction:0,
      question:'Why did a spectrum appear beyond the prism?',
      answers:['The prism refracted different colours by different amounts','The prism created the colours from no input','The opaque screen emitted sunlight'],correct:0,
      explanation:'White light contains the visible spectrum: red, orange, yellow, green, blue, indigo and violet. A prism refracts and separates these components; violet is deviated more than red in this glass model. The prism does not create light.',
      hint:'Compare the empty gap and the glass prism with the same white-light source.'},
    combine:{type:'combine',grade:8,topic:'Recombining visible light',needsComparison:true,
      concept:'The full visible spectrum can be recombined to give white light.',
      variable:'Spectrum beams on the screen',initial:'spread',options:[['spread','Keep the colours separate'],['overlap','Overlap the full spectrum']],
      prediction:'What should equal, balanced components of the full spectrum produce when recombined?',
      predictions:['White light','Black light','Only violet light'],correctPrediction:0,
      question:'What does recombining the spectrum show?',
      answers:['The separate colours were components of the original white light','Mixing coloured paints always gives white','The screen creates energy when the beams overlap'],correct:0,
      explanation:'An ideal optical combiner brings the full, balanced spectrum back together as white light. This is mixing light, not mixing paints. The diagram is schematic; it does not model the lenses or relative intensity of each spectral band.',
      hint:'Compare separate spectral beams with all components overlapping at the same spot.'},
    coil:{type:'coil',grade:8,topic:'Magnetic effect of an electric current',needsComparison:true,
      concept:'A current in a coil produces a magnetic field that can lift an iron load.',
      variable:'Coil turns preset',unit:'',min:1,max:5,step:1,initial:1,
      prediction:'With the same iron core and current, what should adding coil turns do?',
      predictions:['Strengthen the electromagnet','Remove its magnetic field','Turn its iron core into a permanent source of energy'],correctPrediction:0,
      question:'What made the model crane an electromagnet?',
      answers:['Electric current in the coil produced a magnetic field','The coil created electricity without a source','The iron load supplied all the energy'],correct:0,
      explanation:'A current in the coil creates a magnetic field. With current and core fixed, more turns make this model electromagnet stronger. Its strength is shown as abstract load units. The power supply maintains the same current during this comparison; real lifting capacity also depends on geometry and materials.',
      hint:'Compare the one-turn preset with the five-turn preset, keeping current and core fixed.'},
    branch:{type:'branch',grade:8,topic:'Faults in series and parallel circuits',needsComparison:true,
      concept:'A break in one parallel branch need not interrupt another complete branch.',
      variable:'Circuit and maintenance break',initial:'series-break',options:[['series-break','Series: one lamp branch broken'],['parallel-break','Parallel: one branch broken'],['parallel-intact','Parallel: both branches closed']],
      prediction:'Which arrangement keeps a second lamp on while the first branch is opened for maintenance?',
      predictions:['Parallel, with the other branch still complete','Series, with its only path broken','Any arrangement with the main source removed'],correctPrediction:0,
      question:'Why did the second lamp stay on with one parallel branch broken?',
      answers:['It still had its own complete path through the source','The broken branch created energy','Current jumped across the open branch'],correct:0,
      explanation:'Opening the only path in series turns both lamps off. In parallel, a local break in one branch leaves the other conducting path complete. A break in a shared supply wire would turn both off. These are virtual low-voltage circuits.',
      hint:'Compare the broken series path with the parallel circuit that has one broken branch.'}
  };
  const mirrorStation={name:'Mirror receiver',expected:'middle',goal:'Aim the reflected ray at the middle receiver.',hint2:'Test the near-normal and middle presets.'};
  const missions=[
    {...lessons.charge,id:'charge-yard',title:'The charged cargo yard',color:'#bba9ff',bg:'level-07-circuit-lab.png',
      story:'Static charges are pulling signal tags onto the wrong cargo gates. Pip finds two rubbing materials and three charged probes. Track which way electrons move, then use attraction and repulsion to sort the tags.',
      ending:'The tags reach their gates. Their logs reveal that the missing Core signal entered a damaged resistor network. Newtonia sends you to the circuit causeway.',
      stations:[
        {name:'Attraction gate',probe:1,expected:'attract',goal:'Attract the positive probe towards the rod.',hint2:'A positive probe attracts a negative rod. Compare losing and gaining electrons.'},
        {name:'Separation gate',probe:-1,expected:'repel',goal:'Repel the negative probe away from the rod.',hint2:'Like negative charges repel. Give the rod extra electrons.'},
        {name:'Positive tag sorter',probe:1,expected:'repel',goal:'Repel the positive probe away from the rod.',hint2:'A rod that loses electrons becomes positive.',lesson:{initial:'gain'}}
      ]},
    {...lessons.network,id:'circuit-causeway',title:'The circuit causeway',color:'#79dfc9',bg:'bg-circuit-room.png',
      story:'The causeway has power, but its current monitors disagree. Compare identical resistors in complete series and parallel circuits. Keep the same source and inspect the current in each path before restoring the monitors.',
      ending:'The current monitors agree. A parallel feed restores the district’s optical beacon, but its outgoing light misses the next tower. Follow the beam to the mirror station.',
      stations:[
        {name:'Series monitor',layout:'series',target:[100,100],goal:'Use two identical resistors in series and compare the current with one.',hint2:'Test one resistor, then two. Read both series meters.'},
        {name:'Series limiter',layout:'series',target:[66.7,66.7],goal:'Use three identical resistors to reduce the series current further.',hint2:'Compare one resistor with three.'},
        {name:'Parallel supply',layout:'parallel',target:[600,600],goal:'Supply three separate resistor branches. Compare total current with one branch.',hint2:'Compare one branch with three; inspect each branch and the source meter.',lesson:{variable:'Number of identical parallel branches',prediction:'At the same source voltage, what happens when another identical resistor branch is added in parallel?',predictions:['Total source current increases','Each existing branch must lose all its current','There is still only one possible current path'],question:'Why did the source current increase?',answers:['The added branch provides another conducting path','Each branch creates its own energy source','The current is used up in the first branch'],explanation:'Each parallel branch has its own path across the same source. In this ideal model an unchanged branch keeps the same current, while total source current is the sum of all branch currents. Adding a branch increases the total.'}}
      ]},
    {id:'beacon-mirrors',title:'The beacon’s missing ray',grade:8,topic:'Reflection and refraction',color:'#ffd38c',bg:'level-09-wave-tunnel.png',
      concept:'Trace reflected and refracted rays using the normal at each boundary.',
      story:'The beacon beam disappears across a flooded passage. Aim its mirror, replace a rough reflector and compare the ray’s path through different transparent media. The receiver will reveal where the signal went.',
      ending:'A clear beam reaches the spectrum gallery. Pip can read only fragments of the return message: the Core’s safety lock is waiting for a complete optical signature.',
      stations:[{...mirrorStation,lesson:lessons.mirror},
        {name:'Parallel-ray reflector',expected:'smooth',goal:'Keep the three reflected rays parallel.',hint2:'Compare crumpled foil with a smooth mirror.',lesson:lessons.surface},
        {name:'Flooded receiver',expected:'water',goal:'Restore the water-filled path and compare it with air.',hint2:'Select water after testing air. Watch the ray bend towards the normal.',lesson:lessons.refract}]},
    {id:'spectrum-gallery',title:'The spectrum gallery',grade:8,topic:'Visible light and its spectrum',color:'#9acaff',bg:'bg-solar-boost.png',
      concept:'A transparent path, a dispersed spectrum and recombined white light reveal the signal.',
      story:'The gallery’s signature lock checks the whole visible spectrum. Clear the blocked window, reveal the colours in white light and bring them together again. Record what changes and what remains in the beam.',
      ending:'The optical signature matches. Newtonia discovers that the final relay was isolated for maintenance. You will need a magnetic crane, an independent circuit branch and a clean mirror signal to reconnect it.',
      stations:[
        {name:'Beacon window',expected:'glass',goal:'Let most direct light reach the receiver.',hint2:'Compare opaque card with clear glass.',lesson:lessons.transmit},
        {name:'Spectrum reader',expected:'prism',goal:'Reveal the components of the same white-light beam.',hint2:'Test the gap, then insert the triangular glass prism.',lesson:lessons.spectrum},
        {name:'White-light signature',expected:'overlap',goal:'Recombine the full spectrum at one screen position.',hint2:'Compare keeping the colours separate with overlapping them.',lesson:lessons.combine}]},
    {id:'signal-relay',title:'The signal-tower rescue',grade:8,topic:'Electricity and light: combined investigation',color:'#efb4d9',bg:'bg-physics-boss.png',
      concept:'Use magnetic, circuit and optical evidence to restore an independent signal.',
      story:'The tower’s relay is stranded behind an iron maintenance gate. Lift its five-unit load, keep the signal lamp powered while its neighbour is disconnected, and aim the final mirror. Every repair must be supported by a comparison.',
      ending:'The missing signal reaches the Quantum Core. Your team’s evidence proves the safety lock was protecting Nova from an unstable mechanical drive. Newtonia keeps the drive isolated while you and Pip prepare to investigate the forces acting inside it.',
      stations:[
        {name:'Magnetic maintenance crane',target:[5,5],goal:'Lift the five-unit iron load with the same current and core.',hint2:'Compare coil-turn presets one and five.',lesson:lessons.coil},
        {name:'Independent signal branch',expected:'parallel-break',goal:'Keep the second lamp on while the first branch remains open.',hint2:'Choose parallel with one branch broken, after comparing the broken series path.',lesson:lessons.branch},
        {...mirrorStation,name:'Tower mirror',expected:'wide',goal:'Aim the final reflected ray at the wide receiver.',hint2:'Compare the near-normal and wide ray presets.',lesson:lessons.mirror}]
    }
  ];
  const round=n=>Math.round(n*10)/10;
  function simulate(e,s,value){
    let output=0,unit='',detail='',state='',extra={};
    if(e.type==='charge'){
      const charge=value==='gain'?-1:1,cloth=-charge;
      state=charge===s.probe?'repel':'attract';output=state==='attract'?1:-1;
      extra={rodCharge:charge,clothCharge:cloth,probe:s.probe,rodElectrons:4-charge,clothElectrons:4-cloth};
      detail=`Rod ${charge>0?'positive':'negative'}, cloth ${cloth>0?'positive':'negative'}; probe ${s.probe>0?'positive':'negative'}: ${state==='attract'?'attraction':'repulsion'}. Only electrons transfer; total rod-and-cloth charge remains zero.`;
    }else if(e.type==='network'){
      const count=Math.max(1,Math.min(3,Math.round(Number(value)||1))),series=s.layout==='series';
      output=round(series?200/count:200*count);unit='mA';state=s.layout;
      extra={count,branchCurrent:series?output:200,meterB:output};
      detail=`Ideal 3 V source; identical 15 Ω fixed resistors. ${series?`One path: both meters read ${output} mA; current is not used up.`:`${count} paths: each branch carries 200 mA; source total ${output} mA.`} Equations are not assessed.`;
    }else if(e.type==='mirror'){
      output={near:15,middle:30,wide:60}[value]??15;state=value;extra={angle:output};
      detail=`Incoming and reflected angles are equal on opposite sides of the normal. Outgoing ray: ${value} preset. Use the presets to align the receiver; angle measurement is not required.`;
    }else if(e.type==='surface'){
      state=value;output=value==='smooth'?1:0;detail=value==='smooth'?'Parallel incoming rays remain parallel after reflection from a smooth surface.':'The rough surface has differently oriented patches, so the reflected rays scatter.';
    }else if(e.type==='refract'){
      const index={air:1,water:1.33,glass:1.5}[value]||1;
      output=round(Math.asin(Math.sin(Math.PI/6)/index)*180/Math.PI);state=value;extra={angle:output};
      detail=`Same oblique incoming ray from air. ${value==='air'?'No medium change: no bending.':`Entering ${value}: the transmitted ray bends towards the normal.`} Only the transmitted ray is shown; numerical refraction equations are not assessed.`;
    }else if(e.type==='transmit'){
      state=value==='glass'?'transmitted':'blocked';output=value==='glass'?90:0;unit='% model transmission';
      detail=value==='glass'?'Most light passes through the clear glass; some is reflected or absorbed.':'Opaque card blocks the direct light and casts a shadow. Blocked light is reflected or absorbed, not destroyed.';
    }else if(e.type==='spectrum'){
      state=value==='prism'?'spectrum':value==='card'?'blocked':'white';output=value==='prism'?7:0;
      detail=state==='spectrum'?'The prism separates white light into its visible components. Violet bends more than red in this glass model.':state==='blocked'?'Card blocks the beam.':'The same white beam crosses the empty gap without dispersion.';
    }else if(e.type==='combine'){
      state=value==='overlap'?'white':'separate';output=value==='overlap'?1:0;detail=value==='overlap'?'The full, balanced spectrum recombines as white light. Light is mixed, not paint.':'The spectral components reach separate places on the screen. An ideal optical combiner is represented schematically.';
    }else if(e.type==='coil'){
      output=Math.max(1,Math.min(5,Math.round(Number(value)||1)));unit='model load units';state=output>=s.target[0]?'lifted':'waiting';
      detail='Same maintained current, iron core and load; only coil turns change. More turns strengthen the model field. These load units are illustrative, not real crane ratings.';
    }else if(e.type==='branch'){
      extra={lamps:value==='series-break'?[false,false]:value==='parallel-break'?[false,true]:[true,true]};output=extra.lamps.filter(Boolean).length;state=value;
      detail=value==='series-break'?'The only series path is broken: both lamps off.':value==='parallel-break'?'First branch open; second branch complete: only the second lamp stays on.':'Both parallel branches complete: both lamps on, but the first branch is not isolated for maintenance.';
    }else return null;
    return {output,unit,detail,state,...extra,success:s.expected?(e.type==='charge'?state===s.expected:value===s.expected):output>=s.target[0]&&output<=s.target[1]};
  }
  return {missions,lessons,simulate};
});
