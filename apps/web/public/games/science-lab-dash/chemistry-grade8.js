(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScienceChemistryGrade8 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const options = (...pairs) => pairs.map(([value, label]) => ({value, label}));
  const samples = {
    oxygen: {label: 'Oxygen only', units: [['O', 'O'], ['O', 'O'], ['O', 'O']], classification: 'element'},
    water: {label: 'Water only', units: [['H', 'O', 'H'], ['H', 'O', 'H'], ['H', 'O', 'H']], classification: 'compound'},
    blend: {label: 'Oxygen and carbon dioxide', units: [['O', 'O'], ['O', 'C', 'O'], ['O', 'O'], ['O', 'C', 'O']], classification: 'mixture'}
  };
  const sampleOptions = options(['oxygen', 'Oxygen only: O₂'], ['water', 'Water only: H₂O'], ['blend', 'Oxygen + carbon dioxide']);
  const tasks = {
    neutralCarbon: {
      type: 'g8-atom', guide: true, title: 'The carbon identity lock',
      goal: 'Find a neutral carbon atom in the three labelled models.',
      options: options(['ion', '6 protons, 6 neutrons, 5 electrons'], ['carbon', '6 protons, 6 neutrons, 6 electrons'], ['nitrogen', '7 protons, 7 neutrons, 7 electrons']), initial: 'ion',
      prediction: 'What must match in a neutral carbon atom?',
      predictions: ['Six positive protons and six negative electrons', 'Any equal number of protons and electrons makes carbon', 'Neutrons carry the negative charge'],
      answers: ['Six protons identify carbon; six electrons balance its charge in the neutral model.', 'Carbon must have six neutrons in every isotope.', 'Changing electrons changes carbon into nitrogen.'],
      explain: 'Protons are positive, electrons are negative and neutrons have no charge. Carbon has six protons. A neutral carbon atom has six electrons. The shown carbon-12 example has six neutrons, but isotopes can have different neutron counts. The diagram is a schematic, not an image or a literal electron orbit.',
      hint: 'Check element identity using the proton count, then compare positive and negative counts.',
      fair: 'Read the same three model counts. The first-twenty guide supplies names and atomic numbers.'
    },
    nucleusLabels: {
      type: 'g8-labels', title: 'The nucleus record',
      goal: 'Repair the charge and location labels for a simple atom model.',
      options: options(['swapped', 'Record A: proton −; electron +'], ['standard', 'Record B: proton +; electron −'], ['misplaced', 'Record C: electrons in the nucleus']), initial: 'swapped',
      prediction: 'Which particles belong in the nucleus?',
      predictions: ['Protons and neutrons in this model', 'Only electrons', 'Protons and electrons, with neutrons outside'],
      answers: ['Protons and neutrons occupy the nucleus; negative electrons occupy the surrounding region.', 'A neutron is a negatively charged proton.', 'Every part of an atom is a solid coloured ball.'],
      explain: 'In this introductory model, positive protons and uncharged neutrons are in the central nucleus, with negative electrons in the surrounding region. Coloured markers help us reason; the sizes and distances are not to scale and electrons do not follow the drawn boundary as a fixed track.',
      hint: 'Check all three labels: charge and location must both agree.',
      fair: 'Compare alternative labels for the same introductory atom structure.'
    },
    elementMolecule: {
      type: 'g8-sample', target: 'element', title: 'The molecule of an element',
      goal: 'Find the pure sample whose molecules contain only one kind of atom.',
      options: sampleOptions, initial: 'blend',
      prediction: 'Can two bonded atoms still form an element?',
      predictions: ['Yes, when both atoms are the same element', 'No; every molecule is a compound', 'Only mixtures can contain molecules'],
      answers: ['O₂ is a molecule of an element because its two atoms are both oxygen.', 'An O₂ molecule contains two different elements.', 'Water is an element because all water molecules look alike.'],
      explain: 'An element contains one kind of atom. Two oxygen atoms bonded as O₂ form a molecule of an element. A water molecule contains hydrogen and oxygen and is a compound. A mixture contains more than one substance without making them all into a single new compound.',
      hint: 'Read the atom symbols, not just the number of circles joined together.',
      fair: 'Compare the labelled composition of the three idealised samples.'
    },
    compoundSample: {
      type: 'g8-sample', target: 'compound', title: 'The pure-compound cabinet',
      goal: 'Select the pure compound: one substance made from different elements bonded in a fixed ratio.',
      options: sampleOptions, initial: 'oxygen',
      prediction: 'What makes this pure water a compound?',
      predictions: ['Hydrogen and oxygen are bonded in a fixed ratio', 'Any transparent liquid is a compound', 'Pure substances must be elements'],
      answers: ['Pure water is a compound; both elements and compounds can be pure substances.', 'Every pure substance has only one kind of atom.', 'A compound is the same as a physical mixture.'],
      explain: 'Each H₂O molecule contains two hydrogen atoms bonded with one oxygen atom. A pure water sample contains one chemical substance. Pure elements and pure compounds are both pure substances; purity does not mean safe to drink.',
      hint: 'Look for repeated identical molecules containing two different element symbols.',
      fair: 'Compare idealised pure oxygen, pure water and an oxygen/carbon-dioxide mixture.'
    },
    mixtureRecord: {
      type: 'g8-sample', target: 'mixture', title: 'The mixed-gas evidence',
      goal: 'Identify the sample containing both molecules of an element and molecules of a compound.',
      options: sampleOptions, initial: 'water',
      prediction: 'What would show that two substances share this sample?',
      predictions: ['Separate O₂ and CO₂ molecules in the same sample', 'One oxygen atom inside a water molecule', 'All circles having the same display size'],
      answers: ['The O₂ and CO₂ molecules remain distinct substances in this mixture.', 'All atoms present in a mixture must be bonded into one giant molecule.', 'Mixing always makes a new compound.'],
      explain: 'This sample mixes oxygen, an element, and carbon dioxide, a compound. Their molecules remain distinct. Mixtures can have variable proportions; a particular compound has a fixed atomic ratio. Lines indicate bonds within each displayed molecule, not bonds between separate molecules.',
      hint: 'Look for two different molecule patterns in one sample.',
      fair: 'Compare the same labelled samples and use their bonded groups as evidence.'
    },
    waterRatio: {
      type: 'g8-ratio', title: 'The water-model repair',
      goal: 'Choose the molecule record matching water’s hydrogen-to-oxygen ratio.',
      options: options(['peroxide', 'Record A: H₂O₂'], ['water', 'Record B: H₂O'], ['oxygen', 'Record C: O₂']), initial: 'peroxide',
      prediction: 'How many hydrogen atoms belong with one oxygen atom in H₂O?',
      predictions: ['Two hydrogen atoms', 'One hydrogen atom', 'The ratio can change without changing the substance'],
      answers: ['H₂O has two H atoms for each O atom; H₂O₂ describes a different compound.', 'H₂O and H₂O₂ are interchangeable water labels.', 'A subscript counts the number of different elements.'],
      explain: 'The small 2 in H₂O applies to hydrogen; oxygen has an implied count of one. H₂O₂ is hydrogen peroxide, a different compound, while O₂ is a molecule of oxygen. These are virtual labelled records, not instructions for handling substances.',
      hint: 'Count each symbol within one bonded group and compare it with the formula.',
      fair: 'Compare three formula-and-particle records without changing their labels.'
    },
    stateMotion: {
      type: 'g8-state', title: 'The gas-routing window',
      goal: 'Find the particle arrangement that fills the available container as a gas.',
      options: options(['solid', 'Solid model'], ['liquid', 'Liquid model'], ['gas', 'Gas model']), initial: 'solid',
      prediction: 'How does a gas differ from a liquid in this model?',
      predictions: ['Its particles are much farther apart and move throughout the container', 'Its particles grow larger', 'It has no particles'],
      answers: ['Gas particles spread through the available space; liquid particles stay close and move past one another.', 'Solid particles never move at all.', 'The empty spaces between gas particles are filled with another layer of air.'],
      explain: 'Solids vibrate around fixed positions, liquids have close particles that can slide past one another, and gases have widely separated moving particles. This comparison keeps twelve equal model particles. The spaces are empty in the model, not filled with extra air. Marker sizes do not represent a particle growing with state.',
      hint: 'Compare spacing and movement while keeping the marker count the same.',
      fair: 'Use twelve identical markers in the same container, with arrangement representing each state.'
    },
    diffusionTrace: {
      type: 'g8-diffusion', title: 'The tracer message',
      goal: 'Find the record with the greatest tracer spread after the same illustrative interval.',
      options: options(['start', 'Starting cluster'], ['liquid', 'Liquid after the interval'], ['gas', 'Gas after the interval']), initial: 'start',
      prediction: 'Where would the specified tracer spread faster in this comparison?',
      predictions: ['In the gas model', 'The tracer turns into empty space', 'Diffusion requires every particle to move in one direction'],
      answers: ['Random particle motion spreads the tracer from its concentrated region; the gas record spreads farther here.', 'Diffusion destroys particles in the concentrated region.', 'Particles stop moving as soon as they are evenly spread.'],
      explain: 'Diffusion results from random motion, producing net spreading from higher toward lower concentration. The gas model spreads farther than the liquid model in the same interval. Twelve tracer markers remain in each record. Only tracers are drawn; the medium is not empty and the positions are illustrative snapshots, not tracked real molecules.',
      hint: 'Count the twelve tracers, then compare how much of the window they reach.',
      fair: 'Compare the same starting cluster, twelve tracers and elapsed interval. The two media differ; this is a qualitative model, not a measured diffusion coefficient.'
    },
    iceRecord: {
      type: 'g8-ice', title: 'The frozen-reservoir clue',
      goal: 'Choose the freezing record that retains water molecules and accounts for ice’s lower density.',
      options: options(['compressed', 'Record A: same mass, smaller volume'], ['expanded', 'Record B: same mass, larger volume'], ['changed', 'Record C: water becomes oxygen only']), initial: 'compressed',
      prediction: 'What happens to a fixed mass of ordinary liquid water when it freezes into ice?',
      predictions: ['It occupies more volume while remaining water', 'Its molecules become larger oxygen atoms', 'All solids must be denser than their liquids'],
      answers: ['Ordinary ice has a more open structure, so the same mass occupies more volume and has lower density.', 'Freezing water is a reaction that removes hydrogen.', 'The particles themselves expand to fill all the extra space.'],
      explain: 'Ordinary ice is less dense than liquid water and can float on it. For the same mass, its more open structure occupies more volume. H₂O molecules remain H₂O; this is a physical state change. Water is an important exception to the usual school comparison of solid and liquid density. The proposed records are schematic, not actual freezing measurements.',
      hint: 'Reject any record that changes water’s identity. Then connect the same mass and larger volume with lower density.',
      fair: 'Audit proposed before/after records for the same six water molecules under ordinary freezing conditions.'
    },
    densityCargo: {
      type: 'g8-density', title: 'The observatory cargo lift',
      goal: 'Select cargo with density below 1 g/cm³ for the model lift brief; compare mass and volume together.',
      options: options(['small', 'Cargo A: 100 g in 50 cm³'], ['light', 'Cargo B: 80 g in 100 cm³'], ['large', 'Cargo C: 200 g in 100 cm³']), initial: 'small',
      prediction: 'How can the same-size cargo blocks have different densities?',
      predictions: ['Different masses can occupy the same volume', 'The heavier one must always be larger', 'Density is the same as volume alone'],
      answers: ['Mass per volume gives A = 2, B = 0.8 and C = 2 g/cm³; only B meets this brief.', 'Cargo A has lower density than C because its mass is smaller.', 'Doubling mass and volume must double density.'],
      explain: 'Density describes mass in a given volume. Divide the stated mass by the volume: A and C both give 2 g/cm³ despite different sizes; B gives 0.8 g/cm³. These invented solid cargo blocks meet or miss a specific lift brief. Their values are not a universal ranking of real materials or a complete buoyancy model.',
      hint: 'Compare 100 ÷ 50, 80 ÷ 100 and 200 ÷ 100, using the same density units.',
      fair: 'Use the supplied mass and volume for each model cargo; do not rank density by mass alone.'
    },
    expansionJoint: {
      type: 'g8-expansion', title: 'The thermal gate',
      goal: 'Choose a metal-ball condition whose model diameter fits through the unchanged ring.',
      options: options(['warm', 'Warmer ball'], ['room', 'Reference-temperature ball'], ['cool', 'Cooler ball']), initial: 'warm',
      prediction: 'Why can warming this metal ball prevent it passing the same ring?',
      predictions: ['Average particle spacing increases', 'New metal atoms appear', 'Each atom swells into a bigger atom'],
      answers: ['The warmer model ball expands as average spacing increases; cooling can restore clearance.', 'Heating creates extra atoms to make the ball bigger.', 'All real materials expand equally under every condition.'],
      explain: 'This typical metal expands when warmed and contracts when cooled. The model retains twelve equal-size atom markers; their average spacing changes. The ring remains at the same temperature and size. Both the reference and cooler ball fit. Dimensions exaggerate the effect for clarity; they are not real apparatus measurements.',
      hint: 'Compare the ball diameter with the fixed opening, and count the markers.',
      fair: 'Keep the same ball, atom-marker count and unchanged ring; vary only the ball’s temperature condition.'
    },
    pressureChamber: {
      type: 'g8-pressure', title: 'The pressure-band relay',
      goal: 'Move gas into the fixed-volume chamber until its illustrative pressure index is exactly 2.',
      options: options(['six', '6 particles in the chamber'], ['twelve', '12 particles in the chamber'], ['eighteen', '18 particles in the chamber']), initial: 'six',
      prediction: 'What changes when more gas enters this chamber at the same temperature?',
      predictions: ['More particles collide with the walls, increasing pressure', 'The extra particles disappear', 'Each particle must become larger'],
      answers: ['Twelve chamber markers reach index 2; eighteen exceed the stated band, so more is not always better.', 'Pressure comes only from gas particles resting on the floor.', 'A pressure index is a real safe operating limit for any container.'],
      explain: 'Gas pressure arises from particle collisions with container walls. At fixed volume and temperature, adding particles raises pressure. The index 1, 2 or 3 is an invented teaching scale. Eighteen markers are accounted for across chamber and supply; transferring them does not create matter. This is not equipment-operation advice.',
      hint: 'Find the middle pressure index, not the greatest number of particles.',
      fair: 'Hold chamber volume and temperature fixed. Transfer markers from the same eighteen-particle supply.'
    },
    reactionSort: {
      type: 'g8-change', title: 'The new-substance signal',
      goal: 'Choose the record in which atoms form a new substance rather than water only changing state.',
      options: options(['melt', 'Ice melts into liquid water'], ['boil', 'Liquid water becomes water vapour'], ['react', 'Carbon and oxygen form carbon dioxide']), initial: 'melt',
      prediction: 'Which evidence distinguishes the chemical-change record here?',
      predictions: ['Atoms are rearranged into a different substance', 'Any movement of a particle proves a reaction', 'A state change must make a new element'],
      answers: ['Carbon and oxygen are reactants; carbon dioxide is the product, with atoms rearranged into new bonds.', 'Melting removes the hydrogen from water.', 'Bubbles alone always prove that a chemical reaction happened.'],
      explain: 'Melting and boiling retain H₂O molecules. In the illustrated chemical record, carbon and oxygen form carbon dioxide: carbon + oxygen → carbon dioxide. Reactants are starting substances and products are formed substances. Bubbles or a temperature change alone are not universal proof. This is a virtual record, not a procedure for burning carbon.',
      hint: 'Compare the identities and bonded groups before and after, not just movement.',
      fair: 'Audit the supplied before/after records; no real substances are heated or mixed.'
    },
    reactionLedger: {
      type: 'g8-ledger', title: 'The atom-conservation ledger',
      goal: 'Select the proposed water-formation record that preserves four H atoms and two O atoms.',
      options: options(['missing', 'Record A: loses two H atoms'], ['conserved', 'Record B: two H₂O molecules'], ['invented', 'Record C: adds a carbon atom']), initial: 'missing',
      prediction: 'What should remain accounted for during an ordinary chemical reaction?',
      predictions: ['Each kind and number of atom', 'The number of molecules must stay the same', 'Atoms may change into a different element'],
      answers: ['Two H₂ and one O₂ can be represented by two H₂O; atom counts match although molecule counts change.', 'The reaction can create carbon from hydrogen.', 'The reactant molecules must remain unchanged for a reaction to occur.'],
      explain: 'The model starts with two hydrogen molecules and one oxygen molecule: four H atoms and two O atoms. The valid product record has two water molecules with the same totals. Bonds are rearranged; atoms are not lost or converted into new elements. Invalid records are shown as proposals to reject, not possible outcomes. This is diagram interpretation, not a balancing-equations test or a reaction procedure.',
      hint: 'Count H and O on both sides. Reject a missing atom or a new element.',
      fair: 'Compare proposed product records for the same labelled reactant inventory.'
    },
    coreSeparation: {
      type: 'g8-decompose', title: 'The Particle Observatory core',
      goal: 'Choose the record that chemically separates water into hydrogen and oxygen while retaining every atom.',
      options: options(['filter', 'Ordinary filtration'], ['evaporate', 'Evaporation only'], ['decompose', 'Virtual energy-driven decomposition']), initial: 'filter',
      prediction: 'Can ordinary filter paper separate the hydrogen and oxygen bonded inside water?',
      predictions: ['No; breaking the compound requires chemical change', 'Yes; each element is already a separate loose mixture', 'Evaporation always turns water into hydrogen gas'],
      answers: ['Decomposition changes chemical bonding; filtration and evaporation do not split H₂O into its elements.', 'Every compound can be separated into elements by sieving.', 'A chemical reaction makes the original atoms disappear.'],
      explain: 'In this virtual energy-driven decomposition record, two H₂O molecules become two H₂ and one O₂. The same four H and two O atoms remain. Ordinary filtration retains water’s identity, and evaporation produces water vapour. Physical separation of mixtures differs from chemical decomposition of compounds. No apparatus, gas collection or electricity instructions are provided.',
      hint: 'Follow the bonded groups. Which record changes H–O groups into separate H–H and O–O groups?',
      fair: 'Track the same two water molecules through three labelled process records.'
    }
  };
  const mission = (id, title, topic, color, story, ending, ids, background) => ({id, title, grade: 8, topic, color, story, ending, tasks: ids, background});
  const missions = [
    mission('atom-observatory', 'The atom observatory', 'Atoms, subatomic particles and molecules', '#a7d8ef', 'The Element Registry reveals a silent observatory above the academy. Its instruments confuse atoms, charges and molecules. Professor Nova asks you to repair the identity lock and rebuild the labels before the particle windows can open.', 'The identity lock recognises a neutral carbon atom. Charges, locations and oxygen molecules are labelled again. A trail of mixed specimen cards leads into the sample vault.', ['neutralCarbon', 'nucleusLabels', 'elementMolecule'], 'archive'),
    mission('sample-vault', 'The sample vault', 'Elements, compounds, mixtures and fixed ratios', '#c0b9f0', 'The vault’s pure-substance records have been mixed with gas-mixture records. Compare what each sample contains, repair water’s formula and recover the key to the motion gallery.', 'The sample cards agree with their particles. One substance can contain several elements bonded in a fixed ratio, while mixtures keep distinct substances. The motion gallery is ready for your evidence.', ['compoundSample', 'mixtureRecord', 'waterRatio'], 'storeroom'),
    mission('motion-gallery', 'The motion gallery', 'Particle movement, diffusion and freezing', '#95ded0', 'A tracer message crosses the gallery, but its records disagree about movement and frozen water. Compare particle spacing, follow diffusion and repair the reservoir clue without losing a molecule.', 'The tracer message reaches the observatory bridge. Your records preserve the particles and explain why ordinary ice occupies more volume than the same mass of liquid water. The bridge’s cargo and pressure relays now need attention.', ['stateMotion', 'diffusionTrace', 'iceRecord'], 'workshop'),
    mission('observatory-bridge', 'The observatory bridge', 'Density, thermal expansion and gas pressure', '#e9cb94', 'The bridge has chosen cargo by weight alone, warmed a gate until it jams and overfilled a pressure relay. Professor Nova needs choices that meet each brief rather than simply choosing more.', 'The cargo meets its density brief, the thermal gate clears and the pressure relay reaches its band. Beyond the bridge, the core has confused physical changes with chemical ones.', ['densityCargo', 'expansionJoint', 'pressureChamber'], 'workshop'),
    mission('particle-core', 'The Particle Observatory core', 'Reactants, products and atom conservation', '#efb5cf', 'The core cannot reconnect until its reaction records conserve atoms. Distinguish new substances from state changes, audit a product ledger and explain why a compound needs chemical change to separate its elements.', 'The Particle Observatory reconnects. Professor Nova names you a Particle Pathfinder. Seventy-five discoveries now link material properties to atoms, particle behaviour and chemical change. Your notebook keeps the evidence for the next academy challenge.', ['reactionSort', 'reactionLedger', 'coreSeparation'], 'archive')
  ];
  const atomCounts = units => units.flat().reduce((totals, symbol) => ({...totals, [symbol]: (totals[symbol] || 0) + 1}), {});
  function simulate(t, value) {
    if (!t || !t.options?.some(o => o.value === value)) return null;
    let success = false, metric = '', caption = '', detail = {};
    switch (t.type) {
      case 'g8-atom': {
        const [protons, neutrons, electrons] = {ion: [6, 6, 5], carbon: [6, 6, 6], nitrogen: [7, 7, 7]}[value];
        success = value === 'carbon'; detail = {protons, neutrons, electrons, charge: protons - electrons};
        metric = `${protons} p⁺ · ${neutrons} n⁰ · ${electrons} e⁻`;
        caption = value === 'carbon' ? 'Six protons identify carbon, and six electrons make this carbon-12 model neutral.' : value === 'ion' ? 'Six protons identify carbon, but five electrons leave a positive ion, not the requested neutral atom.' : 'Seven protons identify nitrogen. Balanced charges make it neutral, but do not make it carbon.'; break;
      }
      case 'g8-labels':
        success = value === 'standard'; detail = {correctLabels: success, protonCharge: value === 'swapped' ? '−' : '+', electronCharge: value === 'swapped' ? '+' : '−', electronRegion: value === 'misplaced' ? 'Nucleus' : 'Outside nucleus'};
        metric = success ? 'Charges and locations agree' : 'Record has a label error';
        caption = success ? 'Proton: positive, nucleus. Neutron: uncharged, nucleus. Electron: negative, surrounding region.' : value === 'swapped' ? 'The proposed proton and electron charges are swapped. A neutron remains uncharged.' : 'The proposed record puts electrons in the nucleus; they belong in the surrounding region in this model.'; break;
      case 'g8-sample': {
        const sample = samples[value]; success = sample.classification === t.target; detail = {...sample, units: sample.units.map(u => u.slice()), counts: atomCounts(sample.units)};
        metric = `${sample.label}: ${sample.classification}`;
        caption = sample.classification === 'element' ? 'Only O₂ molecules are present. Two oxygen atoms form each molecule of this pure element.' : sample.classification === 'compound' ? 'Only H₂O molecules are present. The two elements are bonded in the fixed 2:1 ratio of this pure compound.' : 'Distinct O₂ and CO₂ molecules share the sample: an element and a compound form this mixture.'; break;
      }
      case 'g8-ratio': {
        const units = {peroxide: [['H', 'O', 'O', 'H']], water: [['H', 'O', 'H']], oxygen: [['O', 'O']]}[value]; success = value === 'water'; detail = {units, counts: atomCounts(units)};
        metric = `${detail.counts.H || 0} H : ${detail.counts.O} O`;
        caption = success ? 'The bonded group has two hydrogen atoms and one oxygen atom: H₂O.' : value === 'peroxide' ? 'H₂O₂ is hydrogen peroxide, not water. Its two oxygen atoms give a different ratio.' : 'O₂ contains only oxygen and has no hydrogen; it is not water.'; break;
      }
      case 'g8-state':
        success = value === 'gas'; detail = {particleCount: 12, arrangement: value}; metric = value === 'gas' ? 'Widely spaced; fills available volume' : value === 'solid' ? 'Close, ordered; vibrates in place' : 'Close, disordered; slides past neighbours';
        caption = `${metric}. The twelve equal markers represent particles, not changing particle sizes. Empty model gaps do not contain extra air.`; break;
      case 'g8-diffusion':
        success = value === 'gas'; detail = {tracerCount: 12, spread: {start: 0, liquid: 1, gas: 3}[value]}; metric = value === 'start' ? 'Starting concentrated cluster' : value === 'liquid' ? 'Partial spread after the interval' : 'Widest spread after the interval';
        caption = `${metric}. All twelve tracer markers remain. Random movement causes net spreading away from the concentrated region; the snapshots show tracers only, not every particle of the medium.`; break;
      case 'g8-ice':
        success = value === 'expanded'; detail = {moleculeCount: value === 'changed' ? 0 : 6, sameMass: value !== 'changed', volumeIndex: value === 'compressed' ? .8 : 1.1, identityRetained: value !== 'changed', proposed: true}; metric = success ? 'Same mass; larger ice volume' : 'Proposed record conflicts with freezing';
        caption = success ? 'Six H₂O molecules remain water in a more open ice structure. The same mass occupies more volume, so density is lower.' : value === 'compressed' ? 'This proposed smaller-volume record would make the same mass denser. It does not describe ordinary water freezing into ice.' : 'This proposed record loses hydrogen and changes identity. Freezing does not split water into elements.'; break;
      case 'g8-density': {
        const [mass, volume] = {small: [100, 50], light: [80, 100], large: [200, 100]}[value]; const density = mass / volume; success = density < 1; detail = {mass, volume, density, illustrative: true}; metric = `${mass} g ÷ ${volume} cm³ = ${density} g/cm³`;
        caption = `${metric}. ${success ? 'This model cargo meets the below-1 brief.' : 'This model cargo exceeds the stated density limit.'} A smaller mass alone does not guarantee a lower density.`; break;
      }
      case 'g8-expansion': {
        const diameter = {warm: 1.04, room: .96, cool: .94}[value]; success = diameter < 1; detail = {diameter, ringOpening: 1, particleCount: 12, illustrative: true}; metric = success ? 'Clearance remains; ball fits' : 'Expanded ball does not clear ring';
        caption = `${metric}. The twelve atom markers keep the same size and count. Only average spacing changes; the ring stays unchanged. Exaggerated model dimensions show the idea.`; break;
      }
      case 'g8-pressure': {
        const chamberCount = {six: 6, twelve: 12, eighteen: 18}[value], pressureIndex = chamberCount / 6; success = pressureIndex === 2; detail = {chamberCount, supplyCount: 18 - chamberCount, pressureIndex, fixedVolume: true, fixedTemperature: true, illustrative: true}; metric = `Pressure index ${pressureIndex}; target 2`;
        caption = `${chamberCount} particles are in the chamber and ${18 - chamberCount} remain in supply. ${success ? 'The target band is reached.' : pressureIndex < 2 ? 'The pressure index is below the brief.' : 'The index is above the brief.'} More particles cause more wall collisions at fixed volume and temperature; the scale is illustrative.`; break;
      }
      case 'g8-change':
        success = value === 'react'; detail = success ? {before: [['C'], ['O', 'O']], after: [['O', 'C', 'O']], chemical: true} : {before: [['H', 'O', 'H'], ['H', 'O', 'H']], after: [['H', 'O', 'H'], ['H', 'O', 'H']], chemical: false};
        metric = success ? 'Carbon + oxygen → carbon dioxide' : value === 'melt' ? 'Ice → liquid water: physical change' : 'Liquid water → water vapour: physical change';
        caption = success ? 'The reactants carbon and oxygen form the product carbon dioxide. All atoms remain, but the bonded groups change.' : 'The before and after groups are still H₂O. This changes the physical state, not the chemical identity.'; break;
      case 'g8-ledger':
        success = value === 'conserved'; detail = {before: [['H', 'H'], ['H', 'H'], ['O', 'O']], after: value === 'missing' ? [['H', 'O', 'H'], ['O']] : value === 'invented' ? [['H', 'O', 'H'], ['H', 'O', 'H'], ['C']] : [['H', 'O', 'H'], ['H', 'O', 'H']], proposed: true};
        metric = success ? 'H: 4 → 4; O: 2 → 2' : value === 'missing' ? 'Invalid proposal: two H atoms missing' : 'Invalid proposal: carbon added';
        caption = success ? 'Two H₂ and one O₂ become two H₂O in the valid diagram record. Atom counts agree even though three molecules become two.' : value === 'missing' ? 'The proposed product record accounts for only two of the four H atoms. Reject the incomplete ledger.' : 'The proposed product record invents a carbon atom absent from the reactants. Ordinary chemical reactions do not create a new element.'; break;
      case 'g8-decompose':
        success = value === 'decompose'; detail = {before: [['H', 'O', 'H'], ['H', 'O', 'H']], after: success ? [['H', 'H'], ['H', 'H'], ['O', 'O']] : [['H', 'O', 'H'], ['H', 'O', 'H']], chemical: success};
        metric = success ? 'Water → hydrogen + oxygen' : value === 'filter' ? 'Filtration: water remains water' : 'Evaporation: water vapour remains H₂O';
        caption = success ? 'The virtual energy-driven decomposition rearranges four H and two O atoms into two H₂ molecules and one O₂ molecule.' : 'This physical process does not break the compound into its elements. H₂O keeps its chemical identity.'; break;
      default: return null;
    }
    return {valid: true, success, metric, caption, amount: 0, state: '', ...detail};
  }
  const sounds = {'g8-atom': 'particle', 'g8-labels': 'scan', 'g8-sample': 'particle', 'g8-ratio': 'bond', 'g8-state': 'flow', 'g8-diffusion': 'flow', 'g8-ice': 'cool', 'g8-density': 'scan', 'g8-expansion': 'relay', 'g8-pressure': 'pressure', 'g8-change': 'bond', 'g8-ledger': 'archive', 'g8-decompose': 'bond'};
  for (const t of Object.values(tasks)) t.sound = sounds[t.type];
  return {tasks, missions, simulate, atomCounts};
});
