(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScienceChemistryGrade7 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const options = (...pairs) => pairs.map(([value, label]) => ({value, label}));
  const elements = [
    [1, 'H', 'Hydrogen', 1, 1, 'nonmetal'], [2, 'He', 'Helium', 18, 1, 'nonmetal'],
    [3, 'Li', 'Lithium', 1, 2, 'metal'], [4, 'Be', 'Beryllium', 2, 2, 'metal'],
    [5, 'B', 'Boron', 13, 2, 'semimetal'], [6, 'C', 'Carbon', 14, 2, 'nonmetal'],
    [7, 'N', 'Nitrogen', 15, 2, 'nonmetal'], [8, 'O', 'Oxygen', 16, 2, 'nonmetal'],
    [9, 'F', 'Fluorine', 17, 2, 'nonmetal'], [10, 'Ne', 'Neon', 18, 2, 'nonmetal'],
    [11, 'Na', 'Sodium', 1, 3, 'metal'], [12, 'Mg', 'Magnesium', 2, 3, 'metal'],
    [13, 'Al', 'Aluminium', 13, 3, 'metal'], [14, 'Si', 'Silicon', 14, 3, 'semimetal'],
    [15, 'P', 'Phosphorus', 15, 3, 'nonmetal'], [16, 'S', 'Sulfur', 16, 3, 'nonmetal'],
    [17, 'Cl', 'Chlorine', 17, 3, 'nonmetal'], [18, 'Ar', 'Argon', 18, 3, 'nonmetal'],
    [19, 'K', 'Potassium', 1, 4, 'metal'], [20, 'Ca', 'Calcium', 2, 4, 'metal']
  ].map(([number, symbol, name, group, period, category]) => ({number, symbol, name, group, period, category}));
  const familyName = category => ({metal: 'Metal', nonmetal: 'Non-metal', semimetal: 'Semi-metal (metalloid)'}[category]);
  const litmusOptions = options(['vinegar', 'Vinegar model sample'], ['soap', 'Basic soap model sample'], ['water', 'Neutral pure-water model']);
  const litmus = {
    vinegar: {classification: 'acid', redPaper: 'red', bluePaper: 'red'},
    soap: {classification: 'base', redPaper: 'blue', bluePaper: 'blue'},
    water: {classification: 'neutral', redPaper: 'red', bluePaper: 'blue'}
  };
  const symbolPackets = {
    'packet-a': [['Na', 'Nitrogen'], ['K', 'Calcium'], ['Ca', 'Carbon']],
    'packet-b': [['Na', 'Sodium'], ['K', 'Potassium'], ['Ca', 'Calcium']],
    'packet-c': [['H', 'Hydrogen'], ['N', 'Neon'], ['O', 'Oxygen']]
  };
  const tasks = {
    circuitSpecimen: {
      type: 'g7-conduct', title: 'The low-voltage relay bridge',
      goal: 'Choose a specimen that completes the model circuit and lights its lamp.',
      options: options(['rubber', 'Rubber strip'], ['copper', 'Copper strip'], ['graphite', 'Graphite rod']), initial: 'rubber',
      prediction: 'Can a non-metal specimen sometimes conduct electricity?',
      predictions: ['Yes; this graphite specimen can conduct', 'No; every non-metal is an insulator', 'All materials conduct equally well'],
      answers: ['Both copper and this graphite specimen conduct; classification alone does not predict every property.', 'A conducting specimen must always be magnetic.', 'Graphite conducts because every form of carbon behaves identically.'],
      explain: 'Copper conducts electricity. Graphite is a conducting form of carbon, a non-metal; other forms of carbon need not behave the same way. The rubber specimen does not complete this model circuit. This is a virtual low-voltage comparison, not a mains-electricity activity.',
      hint: 'Compare rubber with copper and graphite. Check the lamp rather than assuming that all non-metals behave alike.',
      fair: 'Use the same virtual circuit, source, contacts and comparable specimen dimensions.'
    },
    handleChoice: {
      type: 'g7-thermal', title: 'The heat-transfer handle',
      goal: 'Choose the specimen with the least far-end warming during the same model observation.',
      options: options(['copper', 'Copper specimen'], ['aluminium', 'Aluminium specimen'], ['wood', 'Dry wood specimen']), initial: 'copper',
      prediction: 'Which specimen is likely to transfer heat less readily in this set?',
      predictions: ['The dry wood specimen', 'Copper must be best for every handle', 'Magnetism alone decides heat transfer'],
      answers: ['The wood specimen transfers heat less readily here; suitability depends on the property the job requires.', 'All metals and non-metals transfer heat equally quickly.', 'A low sensor reading proves a real product is safe in every situation.'],
      explain: 'These metal specimens transfer heat more readily than this dry wood specimen. A good conductor can suit a heat-transfer part while an insulating material can suit a handle. Strength, temperature limits and other requirements still matter in real designs.',
      hint: 'Compare the far-end sensor readings for the same observation interval.',
      fair: 'Keep dimensions, starting conditions, heat source and observation interval fixed. Readings are illustrative warm-up markers, not safety ratings.'
    },
    boilingTrace: {
      type: 'g7-boiling', title: 'The boiling-record repair',
      goal: 'Choose the simplified heating record consistent with pure water boiling at normal atmospheric pressure.',
      options: options(['rising', 'Record A: keeps rising above 100 °C'], ['plateau', 'Record B: a plateau near 100 °C'], ['stalled', 'Record C: stays near 20 °C']), initial: 'rising',
      prediction: 'What can happen to temperature while this pure-water sample boils steadily?',
      predictions: ['It stays near its boiling point while state changes', 'It must rise without limit', 'The water particles become a new element'],
      answers: ['At fixed normal pressure, continued heating can change liquid water to gas near a constant boiling temperature.', 'Every liquid boils at 100 °C under every pressure.', 'Melting and boiling name the same state change.'],
      explain: 'Pure water boils near 100 °C at normal atmospheric pressure in this simplified record. During boiling, energy supports the liquid-to-gas change instead of an unlimited temperature rise. Melting is solid-to-liquid; pure ice melts near 0 °C at the same pressure. Other substances and pressures differ.',
      hint: 'Find the rising section followed by a stable boiling section. Distinguish a plateau from a heater that never warmed the water.',
      fair: 'Compare schematic records for the same pure-water sample, fixed normal pressure and continuing heat input; time steps are illustrative.'
    },
    magneticPickup: {
      type: 'g7-magnetic', title: 'The mixed-metal recovery tray',
      goal: 'Separate the iron pieces from equal-size aluminium and plastic pieces.',
      options: options(['sieve', 'Size sieve'], ['magnet', 'Magnetic pickup'], ['paper', 'Ordinary filter paper']), initial: 'sieve',
      prediction: 'Which property can distinguish iron in this equal-size mixture?',
      predictions: ['Its attraction to the magnet', 'All metal pieces are equally magnetic', 'Every object must pass through a sieve separately'],
      answers: ['The magnet separates iron here; aluminium remains a metal even though it is not strongly attracted.', 'A magnet collects every recyclable metal.', 'The iron disappears when it is separated.'],
      explain: 'Physical separation uses a property difference. The magnet collects six iron markers while six aluminium and six plastic markers remain. The pieces have the same size, so the specified size sieve does not separate their material types. No material is destroyed.',
      hint: 'Compare material response to the magnet instead of the equal piece sizes.',
      fair: 'Use the same six iron, six aluminium and six plastic markers; change only the selected method.'
    },
    condenserRoute: {
      type: 'g7-distill', title: 'The condensate collection route',
      goal: 'Collect the model water separately while leaving the non-volatile salt behind.',
      options: options(['tray', 'Evaporation tray only'], ['uncool', 'Uncooled vapour pathway'], ['condenser', 'Condenser cools the vapour']), initial: 'tray',
      prediction: 'What is needed to collect the water after it becomes vapour?',
      predictions: ['Cooling the vapour so it condenses into a receiver', 'Destroying the water particles', 'Using ordinary filter paper to catch dissolved salt'],
      answers: ['Vaporisation followed by condensation can collect water separately from this non-volatile salt.', 'Evaporating water always means it has been destroyed.', 'Any distilled sample is automatically safe to drink.'],
      explain: 'In this virtual distillation, water becomes vapour and is then cooled into liquid in a separate receiver. The non-volatile salt remains behind. Merely evaporating water does not collect it. The example models only salt and water and does not certify drinking-water safety.',
      hint: 'Follow the twelve water markers: which route puts them in a collecting receiver?',
      fair: 'Start with the same six salt and twelve water markers. Compare idealised process endpoints; no apparatus-building or heating instructions are supplied.'
    },
    inkTrail: {
      type: 'g7-chroma', title: 'The coloured-ink trail',
      goal: 'Find the model ink whose coloured components produce two separated bands.',
      options: options(['single', 'Ink sample A'], ['blend', 'Ink sample B'], ['blank', 'Water-only blank']), initial: 'single',
      prediction: 'What can two separated coloured bands tell us in this comparison?',
      predictions: ['At least two coloured components separated', 'Every black ink has the same composition', 'One band proves a sample is completely pure'],
      answers: ['Components can travel differently with the solvent; two bands provide evidence of separated components.', 'The paper creates new coloured substances from nothing.', 'A single observed band proves that no other substance is present.'],
      explain: 'Chromatography can separate components because they interact differently with a stationary material and a moving solvent. These water-soluble model inks use paper and water. Two bands show separated coloured components; one band does not prove purity or uniquely identify a chemical.',
      hint: 'Compare the number of detected bands while keeping paper, solvent and observation interval the same.',
      fair: 'Use equal-volume sample spots or a water blank, the same paper, water solvent and elapsed interval. Band positions are illustrative.'
    },
    acidEvidence: {
      type: 'g7-litmus', target: 'acid', title: 'The acid-indicator record',
      goal: 'Find the model sample that turns blue litmus red while red litmus remains red.',
      options: litmusOptions, initial: 'water',
      prediction: 'Which pair of results is evidence of an acid in this model?',
      predictions: ['Blue paper becomes red; red paper stays red', 'Both papers become blue', 'Both papers keep their original colours'],
      answers: ['The vinegar model gives the acid pattern on both litmus papers.', 'Red paper staying red alone proves the sample is an acid.', 'A sample is safe to taste whenever an indicator is available.'],
      explain: 'An acid turns blue litmus red and leaves red litmus red. Read both papers: unchanged red paper alone could also indicate a neutral sample. These are labelled virtual specimens; never taste or touch unknown laboratory substances.',
      hint: 'Read the blue-paper result as well as the red-paper result.',
      fair: 'Compare fresh red and blue indicator results for the same three model samples; no samples are mixed together.'
    },
    baseEvidence: {
      type: 'g7-litmus', target: 'base', title: 'The base-indicator record',
      goal: 'Find the model sample that turns red litmus blue while blue litmus remains blue.',
      options: litmusOptions, initial: 'vinegar',
      prediction: 'Which paired results indicate a base in this model?',
      predictions: ['Red paper becomes blue; blue paper stays blue', 'Both papers become red', 'Blue paper staying blue alone always proves a base'],
      answers: ['The specified basic soap sample gives the base pattern on both papers.', 'All household soaps have exactly the same acidity.', 'A base is always harmless because it is not an acid.'],
      explain: 'A base turns red litmus blue and leaves blue litmus blue. This particular soap model is basic; real formulations can differ. Acids and bases can both be hazardous. Classification uses the indicator evidence, not tasting or touching.',
      hint: 'Compare the red-paper change and check the blue-paper result too.',
      fair: 'Use the same indicator types and labelled model samples, without mixing chemicals.'
    },
    neutralEvidence: {
      type: 'g7-litmus', target: 'neutral', title: 'The neutral-control record',
      goal: 'Find the model sample in which both litmus papers keep their original colours.',
      options: litmusOptions, initial: 'soap',
      prediction: 'What is the paired litmus pattern for the neutral pure-water control?',
      predictions: ['Red stays red and blue stays blue', 'Both papers must become red', 'Both papers must become blue'],
      answers: ['The neutral control leaves each litmus paper unchanged; use both results together.', 'A neutral indicator result proves any water is safe to drink.', 'Every real water sample must be neutral.'],
      explain: 'The idealised pure-water control is neutral: red paper stays red and blue paper stays blue. Real water samples can differ. Neutrality does not establish drinking-water safety, and one unchanged litmus paper alone is insufficient evidence.',
      hint: 'Look for two unchanged papers, not two papers of the same final colour.',
      fair: 'Compare the same paired indicator tests for these specified samples; pure water is an idealised neutral control.'
    },
    indicatorAudit: {
      type: 'g7-audit', title: 'The incomplete indicator log',
      goal: 'Complete enough evidence to classify an unknown neutral-control sample in this model.',
      options: options(['red', 'Red litmus result only'], ['blue', 'Blue litmus result only'], ['both', 'Both red and blue results']), initial: 'red',
      prediction: 'Can one unchanged litmus paper distinguish every class?',
      predictions: ['No; compare both red and blue results', 'Yes; unchanged red always means acid', 'Yes; unchanged blue always means base'],
      answers: ['The pair of unchanged results supports neutral classification; either unchanged result alone is ambiguous.', 'Two indicator colours prove all possible chemical hazards are absent.', 'A missing result should be replaced by a guess.'],
      explain: 'Unchanged red alone is consistent with an acid or a neutral. Unchanged blue alone is consistent with a base or a neutral. In this simple model, both unchanged results identify the neutral control. Evidence should cover what the claim requires.',
      hint: 'List what each single unchanged result could mean, then compare the pair.',
      fair: 'Use the same unknown neutral-control sample; vary only which recorded indicator results are available.'
    },
    recoveryPlan: {
      type: 'g7-recovery', title: 'The complete recovery plan',
      goal: 'Recover iron, sand, salt and water in separate labelled collections.',
      options: options(['filter', 'Filter only'], ['evaporate', 'Magnet, filter, evaporate'], ['distill', 'Magnet, filter, distil']), initial: 'filter',
      prediction: 'Which plan can recover the water as well as the three solids?',
      predictions: ['Magnetic separation, filtration and distillation', 'Evaporation always collects liquid water', 'One paper filter separates all four components'],
      answers: ['Use different properties at successive stages; condensation is needed to collect the water too.', 'Materials not collected must have been destroyed.', 'All mixtures require exactly the same separation method.'],
      explain: 'The magnet separates iron, filtering retains sand, and distillation separates the non-volatile salt from water while collecting condensed water. Evaporation can recover salt but leaves the water uncollected in the air. This model uses only the named materials and makes no drinking-water claim.',
      hint: 'Track all four labelled materials and check whether the water has a receiver.',
      fair: 'Start every route with six iron, six sand, six salt and twelve water markers. Compare idealised endpoints and separate collections.'
    },
    resourceBrief: {
      type: 'g7-resources', title: 'The reusable exhibition case',
      goal: 'Meet the protection brief using the fewest new-resource tokens in the supplied model ledger.',
      options: options(['new', 'New aluminium case'], ['reuse', 'Existing sound aluminium case'], ['film', 'Single-use film envelope']), initial: 'new',
      prediction: 'What evidence matters when choosing a material or product for this brief?',
      predictions: ['Both required properties and the supplied resource figures', 'Only the brightest colour', 'One material is always best for every use'],
      answers: ['Reuse of the sound case meets this brief with fewer new-resource tokens in this particular ledger.', 'Every metal product always has less impact than every plastic product.', 'The game’s tokens are measured carbon-emission values.'],
      explain: 'The sound existing case and new case both protect this exhibit; the existing one uses fewer new-resource tokens in the given model. The film envelope fails the protection test. Tokens are invented comparison data, not a real life-cycle assessment or a universal ranking of materials.',
      hint: 'First check the protection requirement, then compare new-resource tokens among suitable choices.',
      fair: 'Compare the same exhibit and twenty-delivery brief, using the supplied illustrative ledger and protection test.'
    },
    symbolRegistry: {
      type: 'g7-symbols', guide: true, title: 'The element-label registry',
      goal: 'Find the label packet in which all three element names match their symbols.',
      options: options(['packet-a', 'Label packet A'], ['packet-b', 'Label packet B'], ['packet-c', 'Label packet C']), initial: 'packet-a',
      prediction: 'How can the first-twenty guide help check unfamiliar symbols?',
      predictions: ['Match the exact symbol with its element name', 'Guess from the first letter of the English name every time', 'Treat Na, N and Ne as the same symbol'],
      answers: ['Na is sodium, K is potassium and Ca is calcium; exact symbol letters and case matter.', 'Every element has a one-letter symbol.', 'An element’s atomic number is its symbol.'],
      explain: 'Each element has a name and symbol. Na means sodium, K means potassium and Ca means calcium. Symbols use a capital first letter and, where present, a lower-case second letter. Explore all twenty reference cards; memorising atomic numbers is not required for this activity.',
      hint: 'Open the element guide and compare each pair, especially Na, N and Ne.',
      fair: 'Compare every packet against the same first-twenty reference; change only the proposed labels.'
    },
    tablePosition: {
      type: 'g7-position', guide: true, title: 'The table-coordinate lock',
      goal: 'Find the first-twenty element in group 14 and period 3.',
      options: options(['C', 'Carbon (C)'], ['Si', 'Silicon (Si)'], ['P', 'Phosphorus (P)']), initial: 'C',
      prediction: 'How are groups and periods read in the standard table?',
      predictions: ['Groups are columns; periods are rows', 'Groups and periods are both names for symbols', 'Every element in one row has the same atomic number'],
      answers: ['Silicon occupies group 14, period 3; carbon shares its group but is in period 2.', 'Group number and period number always mean the same thing.', 'Phosphorus and silicon occupy the same table position.'],
      explain: 'Groups are vertical columns and periods are horizontal rows. The field guide gives each element’s coordinates. Silicon is in group 14 and period 3. The first-twenty overview leaves the unoccupied group 3–12 region visible rather than shifting elements into incorrect columns.',
      hint: 'Check both coordinates on the card: the correct group alone is not enough.',
      fair: 'Use the same standard group numbering and first-twenty table; compare only the selected element.'
    },
    familyBridge: {
      type: 'g7-family', guide: true, title: 'The semi-metal bridge',
      goal: 'Find an example classified as a semi-metal in this introductory reference.',
      options: options(['Al', 'Aluminium (Al)'], ['B', 'Boron (B)'], ['Si', 'Silicon (Si)']), initial: 'Al',
      prediction: 'Can the reference contain more than one semi-metal example?',
      predictions: ['Yes; boron and silicon are examples here', 'No; every element is an ordinary metal', 'Hydrogen is a metal because it appears on the left'],
      answers: ['Boron and silicon are semi-metal examples; aluminium is a metal in this reference.', 'All non-metals have identical properties.', 'A table position alone makes every left-hand element a metal.'],
      explain: 'Boron and silicon are commonly taught as semi-metals, also called metalloids. They have some properties associated with metals and some with non-metals. Aluminium is a metal. Hydrogen is a non-metal despite its left-hand position. Specific forms and conditions can affect properties.',
      hint: 'Read the named category on each card rather than relying on colour alone.',
      fair: 'Use the same introductory classification for all three element cards.'
    }
  };
  const mission = (id, title, topic, color, story, ending, ids, background) => ({id, title, grade: 7, topic, color, story, ending, tasks: ids, background});
  const missions = [
    mission('property-relay', 'The senior-lab relay', 'Material properties and heating records', '#9ad8ef', 'The restored water wing unlocks the senior laboratory. Its relay uses the wrong materials, and a heating record has lost its meaning. Professor Nova asks you to compare properties before restoring the next archive link.', 'The relay works and the heating record is repaired. A useful material depends on the job it must do. The next clue lies in the separation gallery.', ['circuitSpecimen', 'handleChoice', 'boilingTrace'], 'workshop'),
    mission('separation-gallery', 'The separation gallery', 'Magnetism, distillation and chromatography', '#bdb6f0', 'The gallery has mixed collections and an unidentified ink trail. Collect iron using its magnetic response, recover water through condensation and compare coloured bands without losing track of the materials.', 'The recovered collections have labels again. Separation uses physical differences, while evidence must be read carefully. The indicator wing now needs its records checked.', ['magneticPickup', 'condenserRoute', 'inkTrail'], 'storeroom'),
    mission('indicator-wing', 'The indicator evidence wing', 'Acids, bases, neutrals and litmus', '#f1b8d8', 'The indicator wing has classified samples using single colour readings. Test the paired red and blue results for an acid, a base and a neutral control. The virtual specimens stay separate while you rebuild the evidence.', 'The paired indicator records now agree. Neither an unchanged strip nor a familiar household label is enough on its own. The evidence workshop has one final design brief.', ['acidEvidence', 'baseEvidence', 'neutralEvidence'], 'workshop'),
    mission('evidence-workshop', 'The recovery design workshop', 'Complete evidence, recovery and resource choices', '#97dfba', 'Professor Nova has three incomplete plans: a missing indicator result, a recovery route that loses a collection and an exhibition case chosen without its resource ledger. Repair the reasoning behind each decision.', 'The workshop’s plans now meet their stated briefs. Your evidence opens the Element Registry, where names, symbols and positions form the final navigation system.', ['indicatorAudit', 'recoveryPlan', 'resourceBrief'], 'workshop'),
    mission('element-registry', 'The Element Registry', 'First-twenty elements and table navigation', '#e7ca94', 'The registry’s labels have drifted away from their correct cards. Explore the first twenty elements, repair the symbol packets, navigate a table coordinate and identify a semi-metal bridge. The guide is yours to consult throughout.', 'The Element Registry reconnects to the academy. Professor Nova names you an Element Navigator. Sixty discoveries now connect properties, processing, mixtures, indicators and element references. Your field notebook keeps the evidence, and the first-twenty guide remains available in these investigations.', ['symbolRegistry', 'tablePosition', 'familyBridge'], 'archive')
  ];
  function simulate(t, value) {
    if (!t || !t.options?.some(o => o.value === value)) return null;
    let success = false, metric = '', caption = '', details = {};
    switch (t.type) {
      case 'g7-conduct':
        success = value !== 'rubber'; metric = success ? 'Lamp lights; conducting path' : 'Lamp remains off';
        caption = success ? `The ${value} specimen completes this model circuit. ${value === 'graphite' ? 'Graphite is a conducting form of the non-metal carbon.' : 'Copper is a metal conductor.'}` : 'The rubber specimen does not complete the conducting path in this virtual circuit.';
        details = {conducts: success}; break;
      case 'g7-thermal': {
        const warming = {copper: 9, aluminium: 7, wood: 2}[value]; success = value === 'wood'; metric = `${warming} illustrative warm-up markers`;
        caption = `The far-end sensor shows ${warming} model warm-up markers. ${success ? 'This is the least warming among these specimens during the same interval.' : 'Compare it with the less-conducting wood specimen.'} This is not a real product safety rating.`;
        details = {warming}; break;
      }
      case 'g7-boiling':
        success = value === 'plateau'; details = {temperatures: {rising: [20, 60, 100, 120, 140], plateau: [20, 60, 100, 100, 100], stalled: [20, 20, 20, 20, 20]}[value], normalPressure: true};
        metric = success ? 'Boiling plateau near 100 °C' : 'Record inconsistent with this brief';
        caption = success ? 'The simplified pure-water record rises toward 100 °C, then stays near that temperature while boiling at fixed normal pressure.' : value === 'stalled' ? 'The water remains near 20 °C; this does not show the required warming and boiling sequence.' : 'Continued rise above 100 °C during steady liquid-water boiling does not fit this fixed-normal-pressure, pure-water model.'; break;
      case 'g7-magnetic':
        success = value === 'magnet'; details = {ironCollected: success ? 6 : 0, ironRemaining: success ? 0 : 6, aluminiumRemaining: 6, plasticRemaining: 6};
        metric = success ? 'Iron collected separately' : 'Material types remain mixed';
        caption = success ? 'Six iron markers move to the magnetic collection. Six aluminium and six plastic markers remain; not all metals are strongly magnetic.' : 'This method does not isolate iron from the other equal-size pieces. All eighteen material markers remain in the mixture.'; break;
      case 'g7-distill':
        success = value === 'condenser'; details = {saltRemaining: 6, waterCollected: success ? 12 : 0, waterUncollected: success ? 0 : 12, certifiedDrinking: false};
        metric = success ? 'Water condenses into the receiver' : 'Water not collected as liquid';
        caption = success ? 'Twelve water markers are collected after vapour cools and condenses. Six non-volatile salt markers remain behind. The receiver is not a drinking-water certificate.' : 'The six salt markers remain, but the twelve water markers are uncollected as vapour. The water has not been destroyed.'; break;
      case 'g7-chroma':
        success = value === 'blend'; details = {bands: value === 'blend' ? [2, 2] : value === 'single' ? [4] : [], pigmentUnits: value === 'blank' ? 0 : 4};
        metric = value === 'blend' ? 'Two coloured bands detected' : value === 'single' ? 'One band; purity not established' : 'No coloured sample detected';
        caption = value === 'blend' ? 'Two bands separate from this model ink under the same paper-and-water conditions, providing evidence of different coloured components.' : value === 'single' ? 'One coloured band is detected. That observation alone does not prove the sample is pure.' : 'The water-only blank produces no coloured sample band.'; break;
      case 'g7-litmus': {
        const observed = litmus[value]; success = observed.classification === t.target; details = {...observed};
        metric = `Red paper: ${observed.redPaper}; blue paper: ${observed.bluePaper}`;
        caption = `The specified ${value === 'water' ? 'pure-water control' : value + ' model'} is ${observed.classification === 'neutral' ? 'neutral' : 'a ' + observed.classification}. Red paper is ${observed.redPaper}; blue paper is ${observed.bluePaper}. Read both results; do not taste or touch unknown samples.`; break;
      }
      case 'g7-audit':
        success = value === 'both'; metric = success ? 'Paired evidence supports neutral' : 'Single result remains ambiguous';
        caption = success ? 'Red stays red and blue stays blue, supporting the neutral-control classification in this model.' : value === 'red' ? 'Red stays red. That alone is consistent with an acid or a neutral; the blue result is still needed.' : 'Blue stays blue. That alone is consistent with a base or a neutral; the red result is still needed.';
        details = {redPaper: value === 'blue' ? null : 'red', bluePaper: value === 'red' ? null : 'blue', conclusive: success}; break;
      case 'g7-recovery':
        success = value === 'distill'; details = {ironSeparate: value === 'filter' ? 0 : 6, sandSeparate: value === 'filter' ? 0 : 6, mixedSolids: value === 'filter' ? 12 : 0, saltSeparate: value === 'filter' ? 0 : 6, saltInSolution: value === 'filter' ? 6 : 0, waterSeparate: success ? 12 : 0, waterInSolution: value === 'filter' ? 12 : 0, waterInAir: value === 'evaporate' ? 12 : 0, certifiedDrinking: false};
        metric = success ? 'All four labelled collections recovered' : value === 'filter' ? 'Several materials remain mixed' : 'Water remains uncollected in the air';
        caption = success ? 'Six iron, six sand and six salt markers reach separate collections, and twelve water markers reach the condensate receiver.' : value === 'filter' ? 'The filter retains twelve mixed iron-and-sand markers. Six dissolved salt and twelve water markers pass through together.' : 'Six iron, six sand and six salt markers are recovered, but twelve water markers remain uncollected as vapour. Matter is conserved, but the four-collection brief is not met.'; break;
      case 'g7-resources': {
        const tokens = {new: 12, reuse: 2, film: 6}[value], protects = value !== 'film'; success = value === 'reuse';
        details = {tokens, protects, deliveries: 20, illustrative: true}; metric = `${protects ? 'Protection met' : 'Protection fails'}; ${tokens} resource tokens`;
        caption = `For the same twenty-delivery brief, this ledger assigns ${tokens} new-resource tokens. ${protects ? 'The case meets the protection requirement.' : 'The film envelope fails the protection requirement.'} ${success ? 'This is the lowest-token suitable option here.' : 'Compare only suitable options before choosing the lower-token one.'} These are invented model values.`; break;
      }
      case 'g7-symbols': {
        const pairs = symbolPackets[value], correctPairs = pairs.filter(([symbol, name]) => elements.find(e => e.symbol === symbol)?.name === name).length;
        success = correctPairs === 3; details = {pairs: pairs.map(p => p.slice()), correctPairs}; metric = `${correctPairs}/3 label pairs verified`;
        caption = success ? 'Na matches sodium, K matches potassium and Ca matches calcium. All three pairs agree with the guide.' : 'At least one label pair disagrees with the reference. Use exact symbols and compare each name in the field guide.'; break;
      }
      case 'g7-position': {
        const element = elements.find(e => e.symbol === value); success = element.group === 14 && element.period === 3; details = {...element};
        metric = `Group ${element.group}, period ${element.period}`;
        caption = `${element.name} (${element.symbol}) is in group ${element.group}, period ${element.period}. ${success ? 'Both coordinates match the lock.' : 'The lock needs both group 14 and period 3.'}`; break;
      }
      case 'g7-family': {
        const element = elements.find(e => e.symbol === value); success = element.category === 'semimetal'; details = {...element};
        metric = familyName(element.category); caption = `${element.name} (${element.symbol}) is classified here as ${element.category === 'metal' ? 'a metal' : 'a semi-metal (metalloid)'}. Use its named category and remember that properties can depend on form and conditions.`; break;
      }
      default: return null;
    }
    return {valid: true, success, metric, caption, amount: 0, state: '', ...details};
  }
  const sounds = {'g7-conduct': 'relay', 'g7-thermal': 'scan', 'g7-boiling': 'cool', 'g7-magnetic': 'magnet', 'g7-distill': 'cool', 'g7-chroma': 'drop', 'g7-litmus': 'indicator', 'g7-audit': 'scan', 'g7-recovery': 'valve', 'g7-resources': 'scan', 'g7-symbols': 'archive', 'g7-position': 'archive', 'g7-family': 'archive'};
  for (const task of Object.values(tasks)) task.sound = sounds[task.type];
  return {tasks, missions, simulate, elements, familyName};
});
