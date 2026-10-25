(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScienceChemistryGrade10 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const NA = 6.02214076e23;
  const options = (...pairs) => pairs.map(([value,label])=>({value,label}));
  const tasks = {
    isotopeIdentity10: {
      type:'g10-isotope',guide:true,title:'The isotope identity lock',
      goal:'Find the neutral carbon-14 model: atomic number 6 and mass number 14.',
      options:options(['nitrogen','7 p, 7 n, 7 e'],['carbon12','6 p, 6 n, 6 e'],['carbon14','6 p, 8 n, 6 e']),initial:'nitrogen',
      prediction:'Which count can differ between isotopes of carbon?',predictions:['The neutron count','The proton count must differ','The element symbol must change'],
      answers:['Carbon-14 has six protons and eight neutrons; six electrons make this model neutral.','Mass number is always the same as atomic number.','Isotopes are different elements because their masses differ.'],
      explain:'Atomic number Z counts protons; mass number A counts protons plus neutrons. Carbon-12 and carbon-14 share six protons and differ in neutrons. Nitrogen-14 has seven protons and is a different element. The nucleus and electron-region diagram is schematic, not a scale model or a literal electron orbit.',
      hint:'Check six protons first, then add protons and neutrons to obtain fourteen.',fair:'Compare the three supplied neutral-atom records; p means protons, n neutrons and e electrons.'
    },
    chlorideIon10: {
      type:'g10-ion',guide:true,title:'The chloride-ion relay',
      goal:'Find the chloride ion Cl⁻ without changing chlorine’s proton count.',
      options:options(['neutral','17 protons, 17 electrons'],['chloride','17 protons, 18 electrons'],['argon','18 protons, 18 electrons']),initial:'neutral',
      prediction:'How does a chlorine atom become a chloride ion in this model?',predictions:['It gains one electron','It gains one proton','Its nucleus becomes a new element'],
      answers:['Seventeen protons retain chlorine identity; eighteen electrons give a charge of −1.','A negative ion has fewer electrons than protons.','Adding a proton is the same as adding an electron.'],
      explain:'An ion forms when the electron count differs from the proton count. Chlorine keeps seventeen protons when it gains an electron to form Cl⁻. The eighteen-proton record is argon, not chloride. These records compare counts; they do not show a practical ion-making procedure.',
      hint:'Calculate charge as proton count minus electron count, while keeping Z = 17.',fair:'Compare the labelled proton/electron records. Neutrality and element identity are separate checks.'
    },
    isotopeAverage10: {
      type:'g10-average',guide:true,title:'The isotope-abundance archive',
      goal:'Choose the weighted relative atomic mass for a model sample with 75% mass-35 and 25% mass-37 chlorine isotopes.',
      options:options(['mean','Aᵣ = 36'],['weighted','Aᵣ ≈ 35.5'],['majority','Aᵣ = 35']),initial:'mean',
      prediction:'Why is the result closer to 35 than to 37?',predictions:['The mass-35 isotope is more abundant','Both isotopes occur in equal amounts','Every chlorine atom has a fractional neutron'],
      answers:['0.75 × 35 + 0.25 × 37 = 35.5; this is a weighted relative mass, not an atom’s mass number.','The average of 35 and 37 ignores their abundances correctly.','Aᵣ = 35.5 means each nucleus contains half a neutron.'],
      explain:'Relative atomic mass depends on isotope abundances. This invented 75:25 sample uses approximate relative isotope masses 35 and 37, giving 35.5. It is not an exact natural-abundance measurement. Aᵣ is relative and dimensionless; individual isotope mass numbers remain integers. Chlorine’s atomic number is still seventeen.',
      hint:'Give the mass-35 contribution three times the weight of the mass-37 contribution.',fair:'Use the same 100%-total abundance record and supplied approximate isotope masses; no extra precision is implied.'
    },
    electronConfiguration10: {
      type:'g10-config',guide:true,title:'The neon electron record',
      goal:'Choose a ground-state neon record with ten electrons and a valid 2p occupancy.',
      options:options(['nine','1s² 2s² 2p⁵'],['ten','1s² 2s² 2p⁶'],['overfilled','1s² 2s² 2p⁸']),initial:'nine',
      prediction:'How many electrons can the complete 2p subshell hold?',predictions:['Six electrons','Eight electrons','Any number if the atom is neutral'],
      answers:['1s² 2s² 2p⁶ accounts for neon’s ten electrons without overfilling 2p.','A full second shell means the 2p subshell alone holds eight.','Subshell labels identify literal circular paths followed by electrons.'],
      explain:'The supplied ground-state model fills 1s, 2s and then 2p. Each s subshell holds at most two electrons, and the three p orbitals together hold at most six. Neon has ten electrons in the neutral model: 2 + 2 + 6. The second shell contains eight in total, not eight in 2p alone. This activity reads occupancy; it does not model electron trajectories.',
      hint:'Add all three superscripts and check the 2p maximum of six.',fair:'Compare the three introductory occupancy records for neutral neon, Z = 10.'
    },
    covalentPair10: {
      type:'g10-bond',title:'The bonding-evidence bridge',
      goal:'Choose the record showing a covalent bond formed by a shared electron pair in H₂.',
      options:options(['transfer','NaCl: electron transfer'],['shared','H₂: a shared pair'],['metallic','Copper: delocalised electrons']),initial:'transfer',
      prediction:'What does one single covalent bond represent here?',predictions:['A shared pair of electrons','Two protons transferred between nuclei','Every electron leaving the entire material'],
      answers:['Two H atoms share one pair of electrons in this simple H₂ model.','An ionic lattice is a collection of H₂ molecules.','Ionic, covalent and metallic bonding are identical arrangements.'],
      explain:'The H₂ Lewis model has two H nuclei associated with one shared electron pair. The NaCl record describes ions in a lattice after electron transfer; the copper record describes metallic bonding with delocalised electrons. These are introductory representations, not pictures of electron paths, bond energies or reaction procedures.',
      hint:'Find the pair shared between the two hydrogen labels.',fair:'Compare the three specified bonding models; dots represent electrons only in the stated schematic.'
    },
    magnesiumChloride10: {
      type:'g10-ratio',title:'The magnesium-chloride lattice',
      goal:'Choose the formula ratio that balances Mg²⁺ with Cl⁻.',
      options:options(['one','MgCl: 1 Mg²⁺, 1 Cl⁻'],['two','MgCl₂: 1 Mg²⁺, 2 Cl⁻'],['metal-rich','Mg₂Cl: 2 Mg²⁺, 1 Cl⁻']),initial:'one',
      prediction:'How many chloride ions balance one magnesium ion?',predictions:['Two chloride ions','One chloride ion','Two magnesium ions'],
      answers:['One Mg²⁺ and two Cl⁻ give zero net charge and the formula ratio MgCl₂.','MgCl₂ is always an isolated three-atom molecule in the solid.','The subscript 2 means two magnesium ions.'],
      explain:'The +2 charge of one magnesium ion is balanced by two −1 chloride ions. MgCl₂ describes this simplest neutral ratio in an extended ionic solid. The other proposed ratios retain a net charge and do not describe the specified neutral compound. A 2D ion group illustrates the ratio without claiming a discrete MgCl₂ molecule.',
      hint:'Sum the positive and negative charges for each proposed ratio.',fair:'Keep the ion charges fixed at Mg²⁺ and Cl⁻; compare proposed simplest formula ratios.'
    },
    structureConduction10: {
      type:'g10-structure',title:'The solid-conductor connection',
      goal:'Find a supplied solid structure with mobile electrons that can carry charge.',
      options:options(['diamond','Diamond network'],['graphite','Graphite layers'],['copper','Copper metal']),initial:'diamond',
      prediction:'Can two forms of carbon have different conducting behaviour?',predictions:['Yes; their bonding structures differ','No; a shared element fixes every property','Only metals can ever conduct'],
      answers:['Graphite and copper have mobile electrons in these models; diamond does not provide the same conducting path.','Graphite conducts because it is a metal.','Every covalent network must have identical properties.'],
      explain:'Diamond and graphite are different structures of carbon. Diamond’s electrons are bound in its covalent network; graphite has delocalised electrons associated with its layers and conducts well along them. Copper has mobile delocalised electrons in its metal structure. These examples link structure to properties without treating all directions or conditions as identical.',
      hint:'Look for the record with mobile electron carriers; both graphite and copper can meet the brief.',fair:'Compare the specified solid structures under their stated ordinary conditions; diagrams are qualitative.'
    },
    boilingBonds10: {
      type:'g10-phase',title:'The boiling-energy record',
      goal:'Choose the proposed boiling record in which water molecules keep their identity while moving farther apart.',
      options:options(['grow','Proposal: molecules grow'],['separate','Record: molecules separate'],['split','Proposal: H–O bonds split']),initial:'grow',
      prediction:'What happens during ordinary liquid-water boiling at fixed normal pressure?',predictions:['Intermolecular attractions are overcome while H₂O molecules remain','Every O–H bond must break to make water vapour','The water molecules become larger atoms'],
      answers:['During the boiling plateau, supplied energy helps separate molecules while their internal O–H bonds remain.', 'Water vapour must be hydrogen and oxygen gases mixed together.','A constant boiling temperature means no energy is transferred.'],
      explain:'At fixed normal pressure, pure water can boil near a temperature plateau while energy supports the phase change. Intermolecular attractions are overcome; the covalent O–H bonds within the molecules remain. H₂O vapour is still water. Six equal-size molecule markers are retained in the valid record; size changes and split-molecule proposals are errors to reject.',
      hint:'Distinguish attractions between molecules from bonds inside a molecule.',fair:'Audit proposed records for six water molecules at the same fixed normal pressure; sizes, timing and spacing are schematic.'
    },
    closedMass10: {
      type:'g10-mass',title:'The sealed-system audit',
      goal:'Find the record retaining the full 120 g apparatus-and-contents inventory on the balance.',
      options:options(['open','Open: 116 g + escaped gas'],['closed','Closed: 120 g retained'],['lost','Proposal: 4 g destroyed']),initial:'open',
      prediction:'Why can an open vessel’s reading fall during a gas-forming reaction?',predictions:['Some material leaves the measured boundary as gas','Mass is destroyed in ordinary reactions','The balance stops measuring all solids'],
      answers:['A closed record retains 120 g; the valid open record accounts for 116 g on the scale plus 4 g of escaped gas.','An open-vessel reading alone measures the whole environment.', 'Conservation of mass means gas cannot have mass.'],
      explain:'These supplied records start with 120 g for the same apparatus and contents. The closed system retains all material on the balance. The open system can read 116 g while 4 g is accounted for outside as escaped gas. Both preserve total mass when the boundary is tracked. The destroyed-mass proposal fails the inventory. No experiment or gas-production procedure is supplied.',
      hint:'Track what stays on the balance and what crosses its boundary.',fair:'Audit the supplied idealised mass records for the same initial 120 g inventory, including apparatus mass.'
    },
    moleEntities10: {
      type:'g10-mole',title:'The particle-count observatory',
      goal:'Select the water-molecule count corresponding to 0.5 mol.',
      options:options(['one','6.02214076 × 10²³'],['half','3.01107038 × 10²³'],['two','1.204428152 × 10²⁴']),initial:'one',
      prediction:'What is the entity count in half a mole?',predictions:['Half of Avogadro’s number','Twice Avogadro’s number','Half of one water molecule'],
      answers:['0.5 mol contains 0.5 × Nₐ water molecules; the total atom count is three times the molecule count.','One mole means one particle.', 'Counting water molecules and counting all their atoms gives the same number.'],
      explain:'One mole contains exactly 6.02214076 × 10²³ specified elementary entities. Here the entities are H₂O molecules. Half a mole has 3.01107038 × 10²³ molecules; each molecule contains three atoms. Always name the entity being counted. The scale bars represent amounts, not pictures of Avogadro’s number of particles.',
      hint:'Multiply 6.02214076 × 10²³ by 0.5 and keep “water molecules” in the label.',fair:'Use the SI Avogadro constant and the same specified entity; numerical records use standard scientific notation.'
    },
    waterMolarMass10: {
      type:'g10-molar',title:'The water molar-mass record',
      goal:'Choose M(H₂O) using the supplied rounded values H = 1 and O = 16 g/mol.',
      options:options(['seventeen','17 g/mol'],['eighteen','18 g/mol'],['thirtyfour','34 g/mol']),initial:'seventeen',
      prediction:'How many hydrogen contributions belong in H₂O’s molar mass?',predictions:['Two contributions of 1 g/mol','Only one contribution of 1 g/mol','Sixteen hydrogen contributions'],
      answers:['2 × 1 + 16 = 18 g/mol for water with these rounded teaching values.','H₂O and H₂O₂ have the same formula mass.', 'Molar mass is measured in grams only, with no amount denominator.'],
      explain:'A water molecule has two H atoms and one O atom. With the supplied rounded atomic molar masses, M(H₂O) = 18 g/mol. This is a school calculation using stated rounded values, not a claim that the precise molar mass is exactly 18. Molar mass differs from the dimensionless relative molecular mass.',
      hint:'Include the subscript 2 before adding the oxygen contribution.',fair:'Keep the supplied rounded atomic molar masses fixed; significant-figure assessment is outside this activity.'
    },
    massAmount10: {
      type:'g10-amount',title:'The mass-to-amount converter',
      goal:'Select the amount of substance for 9 g of water using M = 18 g/mol.',
      options:options(['inverse','n = 2 mol'],['half','n = 0.5 mol'],['quarter','n = 0.25 mol']),initial:'inverse',
      prediction:'Which relationship converts mass into amount of substance?',predictions:['n = m ÷ M','n = M ÷ m','n = m × M'],
      answers:['9 g ÷ 18 g/mol = 0.5 mol; the units reduce to mol.', 'A smaller mass must mean a larger amount of the same substance.', 'Moles and grams are always interchangeable.'],
      explain:'Amount of substance n equals mass m divided by molar mass M. Here 9 ÷ 18 = 0.5 mol. The inverted 18 ÷ 9 gives 2 but does not have the required units or meaning. The supplied molar mass is rounded for this calculation.',
      hint:'Compare 9 g with the 18 g mass of one mole under the given values.',fair:'Use the same 9 g sample and rounded M = 18 g/mol in every proposed calculation.'
    },
    concentration10: {
      type:'g10-concentration',title:'The solution-concentration relay',
      goal:'Select the concentration of 0.20 mol NaCl in 500 mL of final solution.',
      options:options(['multiply','c = 0.10 mol/dm³'],['correct','c = 0.40 mol/dm³'],['volume-error','c = 400 mol/dm³']),initial:'multiply',
      prediction:'What volume belongs in c = n ÷ V when c is in mol/dm³?',predictions:['500 mL = 0.500 dm³','500 mL = 500 dm³','500 mL = 0.0005 dm³'],
      answers:['0.20 mol ÷ 0.500 dm³ = 0.40 mol/dm³ for this supplied record.', 'Multiplying amount by volume gives mol/dm³.', 'The volume is always the water volume before dissolving, regardless of the final solution.'],
      explain:'Molar concentration is amount of solute per final solution volume: c = n/V. Convert 500 mL to 0.500 dm³, then divide 0.20 by 0.500. The result refers to the supplied NaCl amount; dissolved ions are not treated as discrete NaCl molecules. This is calculation from a record, not a preparation procedure.',
      hint:'Convert mL to dm³ before dividing, and keep the final solution volume in view.',fair:'Use the same 0.20 mol solute and 500 mL final solution volume for all proposed records.'
    },
    theoreticalYield10: {
      type:'g10-yield',title:'The reaction-quantity ledger',
      goal:'Choose the ideal water mass from complete reaction of 4 g H₂ with oxygen in excess, using the supplied molar masses.',
      options:options(['half','18 g H₂O'],['correct','36 g H₂O'],['double','72 g H₂O']),initial:'half',
      prediction:'What H₂-to-H₂O amount ratio follows from 2 H₂ + O₂ → 2 H₂O?',predictions:['1:1 in moles','1:2 in moles','1:1 in grams'],
      answers:['4 g H₂ ÷ 2 g/mol = 2 mol H₂, giving 2 mol H₂O × 18 g/mol = 36 g in the ideal record.', 'Equation coefficients are direct gram ratios for all reactants.', 'A theoretical yield guarantees every real experiment reaches that mass.'],
      explain:'The balanced equation gives a 2:2, or 1:1, mole ratio between hydrogen and water. With rounded M(H₂) = 2 and M(H₂O) = 18 g/mol, 4 g H₂ corresponds to 2 mol and ideally yields 36 g water. Oxygen is explicitly in excess and the model assumes complete conversion without losses. Actual yields can be lower. The activity supplies no reaction or gas-handling procedure.',
      hint:'Convert hydrogen mass to moles, use the balanced ratio, then convert water moles to mass.',fair:'Use the same 4 g hydrogen, excess oxygen, complete-conversion assumption and rounded molar masses.'
    },
    coreCalibration10: {
      type:'g10-core',title:'The Element Core calibration',
      goal:'Choose the NaCl mass record for 0.20 mol/dm³ in 250 mL final solution, using M(NaCl) = 58.5 g/mol.',
      options:options(['low','Record A: 1.4625 g'],['matched','Record B: 2.925 g'],['high','Record C: 11.7 g']),initial:'low',
      prediction:'Which amount of NaCl is required by this final-volume brief?',predictions:['0.20 × 0.250 = 0.050 mol','0.20 ÷ 0.250 = 0.80 mol','250 mol because the volume is 250 mL'],
      answers:['n = cV = 0.050 mol, then m = nM = 2.925 g with the given values.', 'The highest mass always meets a concentration target best.', 'Final solution volume can be ignored if the mass is known.'],
      explain:'Convert 250 mL to 0.250 dm³. The required amount is 0.20 × 0.250 = 0.050 mol, and the stated molar mass gives 0.050 × 58.5 = 2.925 g. Values are retained for transparent arithmetic; this is not a measurement-precision assessment or a laboratory recipe. The selected record meets the specified final solution volume and concentration.',
      hint:'Use n = cV before m = nM, and compare every record against the same final volume.',fair:'Audit proposed mass records for one stated final-volume/concentration brief and supplied rounded molar mass.'
    }
  };
  const mission=(id,title,topic,color,story,ending,ids,background)=>({id,title,grade:10,topic,color,story,ending,tasks:ids,background});
  const missions=[
    mission('isotope-archive','The isotope archive','Isotopes, ions and relative atomic mass','#b8dcec','The Reaction District opens the route to the Element Core. Its atomic archive has confused mass number, charge and isotope averages. Professor Nova asks you to restore the records that identify each sample.','The archive distinguishes identity, charge and weighted mass. Its reference key opens the bonding workshop, where electron records determine the next bridge.',['isotopeIdentity10','chlorideIon10','isotopeAverage10'],'archive'),
    mission('bonding-workshop','The bonding workshop','Electron arrangements and chemical bonding','#d1bce9','The workshop cannot connect its structures until neon’s electron record is repaired. Compare bonding models and balance ion charges to restore the magnesium-chloride lattice record.','The electron and bond records agree. The next laboratory asks how the same element can have different properties, and what changes when a substance boils.',['electronConfiguration10','covalentPair10','magnesiumChloride10'],'workshop'),
    mission('structure-laboratory','The structure and change laboratory','Structure, phase energy and mass conservation','#a5d9c6','A diamond block has been installed in a conducting path, a boiling record splits water into elements and an open vessel seems to lose mass. Repair the reasoning by following structure, bonds and system boundaries.','The conducting path works, water vapour remains water and the mass ledger accounts for escaped gas. Your evidence reaches the particle-count observatory.',['structureConduction10','boilingBonds10','closedMass10'],'workshop'),
    mission('amount-observatory','The amount observatory','Moles, molar mass and amount of substance','#e4ca95','The observatory counts enormous collections of particles. Professor Nova has left a reference constant and rounded mass values. Name the counted entity, repair water’s molar mass and convert a sample mass into moles.','The amount observatory reconnects. Its calculations carry a complete evidence trail into the Element Core’s final concentration and reaction-quantity locks.',['moleEntities10','waterMolarMass10','massAmount10'],'archive'),
    mission('element-core-finale','The Element Core finale','Concentration and basic reaction quantities','#eeb8ce','Every restored wing now links to the Element Core. Use final solution volumes, balanced mole ratios and the correct units to repair its last three records. This time, the academy’s recovery depends on the evidence you have learned to keep.','The Element Core lights up and Nova Science Academy reopens. Professor Nova names you an Element Core Investigator. One hundred and five recorded discoveries connect seven learning paths, from material properties to chemical quantities. The mystery is resolved; every restored mission remains yours to revisit through the mission map and field notebook.',['concentration10','theoreticalYield10','coreCalibration10'],'archive')
  ];
  function simulate(t,value){
    if(!t||!t.options?.some(o=>o.value===value))return null;
    let success=false,metric='',caption='',detail={};
    switch(t.type){
      case 'g10-isotope':{const [protons,neutrons,electrons]={nitrogen:[7,7,7],carbon12:[6,6,6],carbon14:[6,8,6]}[value];success=value==='carbon14';detail={protons,neutrons,electrons,atomicNumber:protons,massNumber:protons+neutrons};metric=`Z = ${protons}; A = ${protons+neutrons}`;caption=success?'Six protons identify carbon; eight neutrons give mass number fourteen. Six electrons make the record neutral.':value==='carbon12'?'This is neutral carbon-12: carbon identity is correct, but the required mass number is fourteen.':'This is neutral nitrogen-14. Mass number fourteen alone does not identify carbon.';break;}
      case 'g10-ion':{const protons=value==='argon'?18:17,electrons=value==='neutral'?17:18;success=value==='chloride';detail={protons,electrons,charge:protons-electrons};metric=`${protons} p⁺, ${electrons} e⁻; charge ${detail.charge}`;caption=success?'The seventeen-proton chlorine record gains an electron, giving Cl⁻ with charge −1.':value==='neutral'?'Equal seventeen-proton and seventeen-electron counts describe a neutral chlorine atom, not chloride.':'Eighteen protons identify argon. Changing proton count changes the element.';break;}
      case 'g10-average':{const proposed={mean:36,weighted:35.5,majority:35}[value];success=value==='weighted';detail={proposed,average:.75*35+.25*37,abundances:[75,25],masses:[35,37]};metric=`Proposed Aᵣ = ${proposed}; weighted result 35.5`;caption=success?'The weighted model gives 0.75 × 35 + 0.25 × 37 = 35.5. Individual nuclei still have integer mass numbers.':value==='mean'?'The simple mean 36 treats unequal abundances as equal. Use the stated 75:25 weighting.':'The majority isotope alone omits the 25% mass-37 contribution.';break;}
      case 'g10-config':{const occupancy=value==='nine'?[2,2,5]:value==='ten'?[2,2,6]:[2,2,8];success=value==='ten';detail={occupancy,electrons:occupancy.reduce((a,b)=>a+b,0),validOccupancy:occupancy[2]<=6,proposed:true};metric=`${detail.electrons} electrons; 2p occupancy ${occupancy[2]}/6`;caption=success?'1s² 2s² 2p⁶ has ten electrons and respects the subshell capacities.':value==='nine'?'This proposed record has only nine electrons, so it is not neutral neon.':'This proposed record overfills 2p and totals twelve electrons; neither condition matches neon.';break;}
      case 'g10-bond':success=value==='shared';detail={kind:value,sharedElectrons:success?2:0};metric=value==='shared'?'H₂: one shared electron pair':value==='transfer'?'NaCl: ionic transfer/lattice model':'Copper: metallic delocalisation';caption=success?'Two hydrogen labels share a pair of electron dots, representing a single covalent bond.':value==='transfer'?'The sodium/chloride record represents ionic bonding and a lattice, not the requested H₂ shared-pair record.':'The copper record represents metallic bonding with delocalised electrons, not an H₂ molecule.';break;
      case 'g10-ratio':{const magnesium=value==='metal-rich'?2:1,chloride=value==='two'?2:1,charge=2*magnesium-chloride;success=charge===0;detail={magnesium,chloride,charge,proposed:true};metric=`${magnesium} Mg²⁺ : ${chloride} Cl⁻; net charge ${charge}`;caption=success?'One Mg²⁺ is balanced by two Cl⁻. MgCl₂ is the simplest neutral formula ratio in the specified ionic solid.':'The proposed ratio leaves a positive net charge and fails the specified neutral magnesium-chloride brief.';break;}
      case 'g10-structure':success=value!=='diamond';detail={structure:value,mobileElectrons:success};metric=success?'Mobile electron carriers available':'No equivalent mobile-carrier path';caption=value==='diamond'?'This diamond network does not provide the mobile-electron path required here.':value==='graphite'?'Graphite has delocalised electrons associated with its layers; the supplied along-layer conducting record meets the brief.':'Copper has delocalised electrons in its metal structure; the supplied conducting record meets the brief.';break;
      case 'g10-phase':success=value==='separate';detail={waterMolecules:value==='split'?0:6,identityRetained:value!=='split',sizeRetained:value!=='grow',internalBondsRetained:value!=='split',proposed:!success};metric=success?'Six unchanged H₂O molecules farther apart':'Proposed record misrepresents ordinary boiling';caption=success?'The six equal-size H₂O markers keep their internal bonds while separating. Energy supports overcoming intermolecular attractions during the boiling plateau.':value==='grow'?'This proposed record enlarges molecules. Ordinary boiling changes their arrangement and separation, not their individual size.':'This proposed record splits O–H bonds. Ordinary water boiling does not decompose water into its elements.';break;
      case 'g10-mass':{const retained=value==='closed'?120:116,escaped=value==='open'?4:0;success=value==='closed';detail={initial:120,retained,escaped,accounted:retained+escaped,proposed:value==='lost'};metric=`On balance: ${retained} g; outside: ${escaped} g`;caption=success?'All 120 g of the apparatus-and-contents inventory stays on the balance in the supplied closed-system record.':value==='open'?'The open record accounts for 116 g on the balance and 4 g outside as gas. Total mass remains 120 g, but not all material stays on the balance.':'The destroyed-mass proposal accounts for only 116 g of the starting 120 g and fails mass conservation.';break;}
      case 'g10-mole':{const amount={one:1,half:.5,two:2}[value];success=amount===.5;detail={amount,entities:NA*amount,totalAtoms:3*NA*amount,avogadro:NA};metric=`${amount} mol of H₂O molecules`;caption=success?'0.5 × Nₐ = 3.01107038 × 10²³ water molecules. Counting all atoms would give three times that entity count.':'This proposed molecule count corresponds to '+amount+' mol, not the required half mole. Name the entity and multiply by the amount.';break;}
      case 'g10-molar':{const proposed={seventeen:17,eighteen:18,thirtyfour:34}[value];success=proposed===18;detail={proposed,molarMass:18,hydrogenCount:2,hydrogenMass:1,oxygenCount:1,oxygenMass:16};metric=`Proposed M = ${proposed} g/mol; supplied-value result 18`;caption=success?'Two H contributions and one O contribution give 2 × 1 + 16 = 18 g/mol with the stated rounded values.':'This proposed value does not match H₂O with H = 1 and O = 16 g/mol. Check the atom counts and contributions.';break;}
      case 'g10-amount':{const proposed={inverse:2,half:.5,quarter:.25}[value];success=proposed===.5;detail={mass:9,molarMass:18,amount:.5,proposed};metric=`n = 9 ÷ 18 = 0.5 mol; proposed ${proposed}`;caption=success?'The supplied 9 g sample is half of the 18 g needed for one mole under these rounded values.':'The proposed amount fails n = m/M. Divide 9 g by 18 g/mol and retain the mol unit.';break;}
      case 'g10-concentration':{const proposed={multiply:.1,correct:.4,'volume-error':400}[value];success=proposed===.4;detail={amount:.2,volumeML:500,volumeDM3:.5,concentration:.4,proposed};metric=`0.20 ÷ 0.500 = 0.40 mol/dm³`;caption=success?'500 mL is 0.500 dm³ of final solution, giving 0.40 mol/dm³.':'The proposed concentration does not match c = n/V with the volume in dm³. Use 0.500 dm³, not an unconverted or misconverted volume.';break;}
      case 'g10-yield':{const proposed={half:18,correct:36,double:72}[value];success=proposed===36;detail={hydrogenMass:4,hydrogenMolarMass:2,hydrogenMoles:2,waterMoles:2,waterMolarMass:18,theoreticalMass:36,oxygenExcess:true,proposed};metric=`2 mol H₂ → 2 mol H₂O → 36 g`;caption=success?'The balanced 1:1 H₂/H₂O mole ratio gives an ideal 36 g water with the supplied rounded molar masses.':'This proposed mass does not match the ideal complete-conversion record. Use moles for the balanced ratio; actual incomplete conversion would be a different brief.';break;}
      case 'g10-core':{const proposed={low:1.4625,matched:2.925,high:11.7}[value],actualConcentration=proposed/58.5/.25;success=value==='matched';detail={volumeML:250,volumeDM3:.25,targetConcentration:.2,amount:.05,molarMass:58.5,requiredMass:2.925,proposed,actualConcentration};metric=`Proposed ${proposed} g → ${Number(actualConcentration.toFixed(3))} mol/dm³`;caption=success?'0.20 × 0.250 = 0.050 mol; multiplying by 58.5 g/mol gives 2.925 g. The final-volume concentration brief is met.':'This proposed mass gives '+Number(actualConcentration.toFixed(3))+' mol/dm³ at the stated final volume, missing the 0.20 target.';break;}
      default:return null;
    }
    return {valid:true,success,metric,caption,amount:0,state:'',...detail};
  }
  const sounds={'g10-isotope':'particle','g10-ion':'relay','g10-average':'balance','g10-config':'particle','g10-bond':'bond','g10-ratio':'crystal','g10-structure':'relay','g10-phase':'cool','g10-mass':'balance','g10-mole':'count','g10-molar':'balance','g10-amount':'count','g10-concentration':'calibrate','g10-yield':'bond','g10-core':'core'};
  for(const t of Object.values(tasks))t.sound=sounds[t.type];
  return {tasks,missions,simulate,NA};
});
