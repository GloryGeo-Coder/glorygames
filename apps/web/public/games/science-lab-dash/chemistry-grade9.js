(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScienceChemistryGrade9 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const options = (...pairs) => pairs.map(([value, label]) => ({value, label}));
  // Formula inventories count atoms without pretending ionic solids are molecules.
  const formulae = {Mg: {Mg: 1}, O2: {O: 2}, MgO: {Mg: 1, O: 1}, MgO2: {Mg: 1, O: 2}, Cu: {Cu: 1}, CuO: {Cu: 1, O: 1}, CuO2: {Cu: 1, O: 2}, C: {C: 1}, CO: {C: 1, O: 1}, CO2: {C: 1, O: 2}, S: {S: 1}, SO: {S: 1, O: 1}, SO2: {S: 1, O: 2}, SO3: {S: 1, O: 3}, HCl: {H: 1, Cl: 1}, MgCl: {Mg: 1, Cl: 1}, MgCl2: {Mg: 1, Cl: 2}, H2O: {H: 2, O: 1}, H2: {H: 2}, NaOH: {Na: 1, O: 1, H: 1}, NaCl: {Na: 1, Cl: 1}};
  function inventory(terms) {
    const totals = {};
    for (const [name, count] of terms) for (const [symbol, atoms] of Object.entries(formulae[name])) totals[symbol] = (totals[symbol] || 0) + atoms * count;
    return totals;
  }
  function conserved(before, after) {
    const a = inventory(before), b = inventory(after);
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].every(s => (a[s] || 0) === (b[s] || 0));
  }
  const tasks = {
    compoundNames: {
      type: 'g9-names', guide: true, title: 'The compound-name ledger',
      goal: 'Repair all three name/formula pairs in the district ledger.',
      options: options(['swapped', 'Record A: swapped prefixes'], ['verified', 'Record B: verified prefixes'], ['sulfur-error', 'Record C: sulfur label error']), initial: 'swapped',
      prediction: 'What does the “di” in carbon dioxide describe?',
      predictions: ['Two oxygen atoms per carbon atom in CO₂', 'Two carbon atoms in CO₂', 'Two separate elements named oxygen'],
      answers: ['CO is carbon monoxide, CO₂ carbon dioxide and SO₃ sulfur trioxide.', 'Changing a formula subscript keeps the same compound identity.', 'All compounds use their everyday common name as a formula.'],
      explain: 'Prefixes help read these names: monoxide has one oxygen atom, dioxide two and trioxide three. CO and CO₂ are different compounds. SO₃ is sulfur trioxide, while SO₂ is sulfur dioxide. Sulfur is also spelled sulphur in some school resources. Use exact case in element symbols; the guide is a reference, not a memory test.',
      hint: 'Check each oxygen count against mono, di and tri.',
      fair: 'Audit three proposed name/formula records for the same CO, CO₂ and SO₃ formulae.'
    },
    crystalRatio: {
      type: 'g9-lattice', guide: true, title: 'The salt-crystal record',
      goal: 'Find the proposed sodium-chloride crystal record with a 1:1 sodium-to-chloride ratio and balanced charge.',
      options: options(['sodium-rich', 'Record A: 12 Na⁺, 4 Cl⁻'], ['balanced', 'Record B: 8 Na⁺, 8 Cl⁻'], ['chloride-rich', 'Record C: 4 Na⁺, 12 Cl⁻']), initial: 'sodium-rich',
      prediction: 'What does NaCl tell us about this solid?',
      predictions: ['The crystal has a 1:1 ion ratio', 'Every salt crystal is one isolated NaCl molecule', 'Sodium chloride is a loose mixture of sodium and chlorine'],
      answers: ['NaCl describes the simplest ratio in an ionic lattice, with equal positive and negative charges here.', 'A sodium ion and a chlorine molecule are interchangeable.', 'A pure compound can have any sodium-to-chloride ratio.'],
      explain: 'Solid sodium chloride is an extended ionic structure, not a collection of separate NaCl molecules. Na⁺ and Cl⁻ occur in a 1:1 ratio, giving an overall neutral crystal. The two other proposed records do not describe the specified neutral NaCl lattice. The diagram is a 2D teaching slice, not the full 3D crystal.',
      hint: 'Compare both the number of each ion and their total positive/negative charge.',
      fair: 'Audit three sixteen-ion proposals; the symbols identify sodium and chlorine, and the charges identify their ions.'
    },
    magnesiumEquation: {
      type: 'g9-balance', metal: 'Mg', guide: true, title: 'The magnesium balance lock',
      goal: 'Select the balanced magnesium-oxide equation while keeping the product formula MgO.',
      options: options(['one', '1 Mg + O₂ → 1 MgO'], ['two', '2 Mg + O₂ → 2 MgO'], ['formula', '2 Mg + O₂ → 2 MgO₂']), initial: 'one',
      prediction: 'How should a reaction equation be balanced?',
      predictions: ['Change coefficients while retaining the substances’ formulae', 'Change MgO into any convenient formula', 'Balance the number of words on both sides'],
      answers: ['2 Mg + O₂ → 2 MgO conserves two Mg atoms and two O atoms without changing MgO.', 'A subscript and a coefficient mean exactly the same thing.', 'Balancing can remove an oxygen atom.'],
      explain: 'Magnesium (Mg) reacts with oxygen (O₂) to form magnesium oxide (MgO). A coefficient changes how many formula units or molecules are counted; a subscript is part of the substance’s formula. The MgO₂ proposal changes the product and is not a valid repair of this MgO equation. Ionic MgO is counted in formula units, not isolated molecules.',
      hint: 'O₂ supplies two O atoms. Keep MgO and count Mg as well as O.',
      fair: 'Audit three proposed equations for the same specified reactants and magnesium-oxide product.'
    },
    oxideFamily: {
      type: 'g9-oxide', title: 'The metal-oxide cabinet',
      goal: 'Find a metal oxide among the labelled cabinet records.',
      options: options(['CO2', 'Carbon dioxide: CO₂'], ['MgO', 'Magnesium oxide: MgO'], ['CuO', 'Copper(II) oxide: CuO']), initial: 'CO2',
      prediction: 'What do MgO and CuO have in common here?',
      predictions: ['Each combines a metal with oxygen', 'Both are molecules of oxygen only', 'Every compound containing oxygen is a metal oxide'],
      answers: ['MgO and CuO are metal oxides; CO₂ is a non-metal oxide.', 'Every metal oxide has identical chemical behaviour.', 'Metal oxides form without oxygen atoms.'],
      explain: 'Magnesium and copper are metals; carbon is a non-metal. MgO and the specified copper(II) oxide, CuO, are metal oxides. Both can react as bases with acids in these examples. This does not make every metal oxide chemically identical; some oxides have different acid/base behaviour. Solid MgO and CuO are represented by ratios in ionic structures.',
      hint: 'Identify the element combined with oxygen, rather than simply looking for the letter O.',
      fair: 'Compare the named elements and formulae in the three specified records.'
    },
    corrosionShield: {
      type: 'g9-corrosion', title: 'The observatory’s iron supports',
      goal: 'Choose the coating record that keeps oxygen and water away from the iron surface throughout the model interval.',
      options: options(['bare', 'Bare iron'], ['intact', 'Continuous protective paint'], ['scratched', 'Paint with an exposed scratch']), initial: 'bare',
      prediction: 'Why can a scratch undermine this barrier coating?',
      predictions: ['It exposes iron to oxygen and moisture', 'Paint converts all iron into copper', 'Iron cannot react underneath any damaged coating'],
      answers: ['An intact barrier limits access; an exposed scratch can allow local rusting.', 'Rusting is only iron changing physical state.', 'Rust is always a simple dry Fe₂O₃ crystal with no water involved.'],
      explain: 'Rusting is a slow chemical process requiring oxygen and water at exposed iron. Real rust is a complex mixture of hydrated iron oxides and related products; a simple iron-oxide formula is an introductory representation, not its complete composition. This virtual paint barrier remains intact over the stated interval. Real coating life also depends on preparation, wear and maintenance.',
      hint: 'Look for a continuous barrier, not merely the presence of some paint.',
      fair: 'Compare the same iron, moist-air exposure and elapsed interval; change only coating continuity. Rust markers are qualitative.'
    },
    copperEquation: {
      type: 'g9-balance', metal: 'Cu', title: 'The copper-oxide record',
      goal: 'Balance the specified copper(II)-oxide equation without changing CuO.',
      options: options(['one', '1 Cu + O₂ → 1 CuO'], ['two', '2 Cu + O₂ → 2 CuO'], ['formula', '2 Cu + O₂ → 2 CuO₂']), initial: 'one',
      prediction: 'Which count must agree on both sides?',
      predictions: ['The number of each kind of atom', 'Only the number of displayed groups', 'Only the number of oxygen molecules'],
      answers: ['2 Cu + O₂ → 2 CuO retains two copper atoms and two oxygen atoms.', 'Copper’s symbol is CO because its name begins with co.', 'Balancing requires turning CuO into CuO₂.'],
      explain: 'Copper has symbol Cu. The specified copper(II) oxide is CuO. Two copper atoms and one oxygen molecule are represented by two CuO formula units in the balanced record. This is a formula and inventory audit, not an instruction to heat copper or handle oxides.',
      hint: 'Keep CuO unchanged, then match copper and oxygen separately.',
      fair: 'Compare proposed equations for the same specified copper(II)-oxide product.'
    },
    carbonOxide: {
      type: 'g9-nonmetal', element: 'C', title: 'The carbon-and-oxygen record',
      goal: 'Select the carbon-dioxide record that accounts for one C atom and one O₂ molecule.',
      options: options(['CO', 'Proposal: carbon monoxide'], ['CO2', 'Record: carbon dioxide'], ['C', 'Proposal: carbon only']), initial: 'CO',
      prediction: 'What product matches the specified complete carbon-dioxide record?',
      predictions: ['CO₂, containing one C and two O atoms', 'CO, while the other O atom disappears', 'A new atom of a different element'],
      answers: ['C + O₂ → CO₂ preserves the specified atom inventory and names the non-metal oxide.', 'All carbon combustion always gives only CO₂ under every condition.', 'A non-metal oxide is another name for a metal.'],
      explain: 'For this specified carbon-dioxide record, carbon + oxygen → carbon dioxide, or C + O₂ → CO₂. Carbon is a non-metal. Other conditions can produce carbon monoxide and other products; those are not silently treated as this complete CO₂ record. CO is a different compound, and the shown CO-only proposal also leaves an O atom unaccounted for.',
      hint: 'Check the product name and account for both oxygen atoms.',
      fair: 'Audit proposed product records for a fixed one-C/two-O inventory.'
    },
    sulfurOxide: {
      type: 'g9-nonmetal', element: 'S', title: 'The sulfur-and-oxygen record',
      goal: 'Find the balanced record for sulfur dioxide from one S atom and one O₂ molecule.',
      options: options(['SO3', 'Proposal: sulfur trioxide'], ['SO2', 'Record: sulfur dioxide'], ['SO', 'Proposal: sulfur monoxide']), initial: 'SO3',
      prediction: 'How many oxygen atoms does sulfur dioxide contain per sulfur atom?',
      predictions: ['Two oxygen atoms', 'Three oxygen atoms', 'No oxygen atoms'],
      answers: ['S + O₂ → SO₂ accounts for one S and two O atoms in this record.', 'SO₂ and SO₃ are the same compound with different fonts.', 'The missing oxygen can be created when an equation is written.'],
      explain: 'Sulfur dioxide is SO₂, a non-metal oxide. The record S + O₂ → SO₂ conserves its atoms. SO₃ is sulfur trioxide and requires a different oxygen inventory. These are virtual records only; no combustion or gas-handling activity is provided.',
      hint: 'Match the prefix di to two O atoms, then compare the starting inventory.',
      fair: 'Audit proposed product formulae for the same one-S/two-O inventory.'
    },
    rainEvidence: {
      type: 'g9-rain', title: 'The skyline rain archive',
      goal: 'Choose the record that distinguishes naturally mild rain acidity from additional pollution-driven acidity.',
      options: options(['neutral', 'Record A: all rain is pH 7'], ['linked', 'Record B: background + pollution'], ['carbon-only', 'Record C: CO₂ is the only cause']), initial: 'neutral',
      prediction: 'Which pollutants are major contributors to human-caused acid deposition?',
      predictions: ['Sulfur dioxide and nitrogen oxides', 'Only oxygen gas', 'Every rainfall droplet is pure strong acid'],
      answers: ['CO₂ helps explain mild background acidity; SO₂ and nitrogen oxides can cause additional acid deposition.', 'A pH reading alone identifies every pollutant in a rain sample.', 'Ordinary unpolluted rain must always have pH exactly 7.'],
      explain: 'CO₂ dissolving in water helps make typical unpolluted rain mildly acidic, often described near pH 5.6. Sulfur dioxide and nitrogen oxides can undergo atmospheric reactions that cause additional acid deposition. Actual rain varies. The archive’s background 5.6 and affected 4.2 readings are illustrative examples, not a universal cutoff or a complete pollutant test.',
      hint: 'Keep background CO₂ chemistry separate from the main additional pollution sources.',
      fair: 'Audit the same illustrative background and affected-rain records; do not infer a unique pollutant from pH alone.'
    },
    phSample: {
      type: 'g9-ph', title: 'The pH-routing panel',
      goal: 'Find the acidic sample from three given pH readings at about 25 °C.',
      options: options(['control', 'Control: pH 7'], ['acid', 'Sample A: pH 3'], ['base', 'Sample B: pH 11']), initial: 'control',
      prediction: 'Which reading is acidic in this school model?',
      predictions: ['A pH below 7', 'Any pH above 7', 'Only a sample with a familiar household name'],
      answers: ['pH 3 is acidic, pH 7 neutral and pH 11 basic under the stated conditions.', 'A difference of four pH units means only four times the acidity.', 'pH alone tells us the intrinsic strength and concentration of every acid.'],
      explain: 'At about 25 °C, this aqueous model uses below 7 for acidic, 7 for neutral and above 7 for basic. The displayed school scale is 0–14, not a universal limit. pH is logarithmic, not a linear amount or an average to mix. Acid strength and solution concentration are different ideas; a pH reading alone does not identify both.',
      hint: 'Locate the reading relative to the neutral marker at 7.',
      fair: 'Compare the supplied aqueous sample readings at the same stated temperature; indicator colours are schematic.'
    },
    phEvidence: {
      type: 'g9-evidence', title: 'The indicator evidence check',
      goal: 'Choose evidence that places the model sample specifically within pH 2–4, rather than merely calling it acidic.',
      options: options(['litmus', 'Blue litmus turns red'], ['universal', 'Universal chart: pH 2–4'], ['meter', 'Calibrated meter: pH 3.0']), initial: 'litmus',
      prediction: 'Does blue litmus turning red establish a precise pH?',
      predictions: ['No; a broader acid result needs more evidence for a narrow range', 'Yes; every red strip means pH exactly 3', 'Indicators always identify a substance’s name'],
      answers: ['The specified universal chart or calibrated meter supports the narrow range; litmus alone does not.', 'One indicator colour has the same pH meaning for every indicator.', 'A pH result proves a sample is safe to drink.'],
      explain: 'Blue litmus turning red supports acidity, but does not establish pH 2–4 by itself. This particular universal-indicator chart estimates the 2–4 band; the specified calibrated meter reads 3.0. Indicator charts and meter calibration matter. Colours alone are not exact measurements or safety certificates.',
      hint: 'Compare the precision of the evidence with the range required by the brief.',
      fair: 'Compare three supplied observations of the same model sample; no substances are tasted, touched or mixed.'
    },
    neutralisationBand: {
      type: 'g9-neutralise', title: 'The neutralisation relay',
      goal: 'Match the six acid-equivalent counters with the base counters and reach the stated neutral sensor record.',
      options: options(['under', '3 base counters'], ['matched', '6 base counters'], ['over', '9 base counters']), initial: 'under',
      prediction: 'Must adding any amount of base make an acid mixture neutral?',
      predictions: ['No; the amount and reactant chemistry matter', 'Yes; any base amount always gives pH 7', 'More base must always be closer to neutral'],
      answers: ['The matched strong-acid/strong-base model is neutral; too little leaves acid and too much leaves base.', 'Neutralisation means averaging the two starting pH numbers.', 'All acid/base equivalence points must have pH 7 at every temperature.'],
      explain: 'The virtual HCl/NaOH record uses HCl + NaOH → NaCl + H₂O. At about 25 °C, the specified matched dilute strong-acid/strong-base example is neutral. Under- and over-supply leave different excess reactants. Six counters are abstract acid/base equivalents, not a mixing recipe. The pH readings 2, 7 and 12 are supplied illustrative sensor records, not calculated from counter number or averaged pH values.',
      hint: 'Match equivalent counters; check whether acid or base remains in excess.',
      fair: 'Keep the six acid-equivalent counters and temperature fixed. Change only abstract base supply; account for products and excess reactants.'
    },
    oxideProducts: {
      type: 'g9-products', title: 'The metal-oxide neutralisation lock',
      goal: 'Repair the product record for hydrochloric acid reacting with magnesium oxide.',
      options: options(['hydrogen', 'Proposal: salt + hydrogen'], ['water', 'Record: salt + water'], ['chloride', 'Proposal: wrong salt formula']), initial: 'hydrogen',
      prediction: 'What products are expected for the specified acid + metal oxide reaction?',
      predictions: ['A salt and water', 'Always hydrogen gas instead of water', 'Only the original acid with a new label'],
      answers: ['2 HCl + MgO → MgCl₂ + H₂O forms magnesium chloride and water with every atom accounted for.', 'MgO is the same reactant as magnesium metal.', 'All salts formed by every acid must be sodium chloride.'],
      explain: 'Hydrochloric acid and magnesium oxide form magnesium chloride and water: 2 HCl + MgO → MgCl₂ + H₂O. A metal oxide differs from the metal itself, so do not import a metal/acid product rule into this example. Salt identity depends on the reactants; a salt does not always mean table salt. The displayed solid/salt formulae are ratio records, not isolated ionic molecules.',
      hint: 'Check salt + water, retain MgCl₂, and count H, Cl, Mg and O.',
      fair: 'Audit three proposed product inventories for the same two HCl formula records and one MgO formula unit.'
    },
    soilTarget: {
      type: 'g9-soil', title: 'The greenhouse recovery brief',
      goal: 'Choose the supplied soil-treatment record meeting this greenhouse’s pH 6–7 target.',
      options: options(['untreated', 'Untreated record: pH 4.5'], ['target', 'Limestone record: pH 6.5'], ['excess', 'Above-target record: pH 7.9']), initial: 'untreated',
      prediction: 'Why should a treatment aim at a specified range?',
      predictions: ['Different plants and soils have different requirements', 'Every plant needs pH exactly 7', 'The greatest amount of treatment must always be best'],
      answers: ['The supplied pH 6.5 record meets this brief; the above-target record does not.', 'Changing soil pH automatically removes every contaminant.', 'All limestone amounts produce the same final pH in every soil.'],
      explain: 'Calcium carbonate in limestone can reduce soil acidity. This task selects among supplied illustrative soil records; it gives no application amounts or universal crop recommendation. Soil buffering, material, time and crop requirements affect real treatment. Meeting this pH brief does not certify soil or water as uncontaminated.',
      hint: 'Compare each final reading with the entire 6–7 band, rather than choosing the highest pH.',
      fair: 'Audit given records for the same greenhouse brief. The readings are illustrative; they are not a linear dose-response model.'
    },
    emissionBrief: {
      type: 'g9-emissions', title: 'The Reaction District restoration',
      goal: 'Choose a plan cutting both tracked air pollutants by at least 75% within six resource tokens.',
      options: options(['screen', 'Water-screen maintenance'], ['local', 'Local acidity treatment'], ['source', 'Verified source controls']), initial: 'screen',
      prediction: 'Which evidence addresses the continuing cause of pollution-driven acid deposition?',
      predictions: ['Lower SO₂ and nitrogen-oxide emissions at the sources', 'A clear-looking water sample alone', 'A temporary local pH change alone'],
      answers: ['The source-control record cuts both tracked emissions within the budget; local treatment alone leaves the emissions.', 'Lowering one pollutant guarantees every environmental problem is solved.', 'Resource tokens are measured real-world carbon emissions.'],
      explain: 'The supplied ledger starts at twelve SO₂ and eight nitrogen-oxide emission markers. Verified source controls leave three and two, respectively: 75% reductions for both, using six tokens. Local acidity treatment may help a particular site but does not cut these continuing air emissions. Markers and tokens are invented planning data, not field measurements, carbon footprints or a complete environmental assessment.',
      hint: 'Check both pollutant columns and the resource budget; distinguish treating an effect from reducing its source.',
      fair: 'Compare the same twelve/eight baseline ledger and six-token budget. Use supplied plan outcomes, not a claim about every real technology.'
    }
  };
  const mission = (id, title, topic, color, story, ending, ids, background) => ({id, title, grade: 9, topic, color, story, ending, tasks: ids, background});
  const missions = [
    mission('reaction-ledger', 'The Reaction District ledger', 'Compound names, formula ratios and balancing', '#b6d9ed', 'The restored Particle Observatory detects corrupted records in the Reaction District. Professor Nova needs exact names, a repaired crystal record and a balanced magnesium equation before the district gates will open.', 'The ledger’s names, ratios and atom counts agree. The district gates open onto a workshop where protective coatings and metal-oxide records have failed.', ['compoundNames', 'crystalRatio', 'magnesiumEquation'], 'archive'),
    mission('oxide-workshop', 'The oxide workshop', 'Metal oxides, corrosion and atom inventories', '#d9c29a', 'The workshop has confused carbon dioxide with metal oxides and labelled a scratched iron support as protected. Compare the materials, repair the barrier choice and balance the copper-oxide record.', 'The workshop’s records distinguish metal oxides and keep the iron barrier continuous. A signal from the skyline station asks why the rain archive is becoming more acidic.', ['oxideFamily', 'corrosionShield', 'copperEquation'], 'workshop'),
    mission('skyline-station', 'The skyline chemistry station', 'Non-metal oxides and rain evidence', '#c3b9ee', 'At the skyline station, a carbon record loses oxygen and a sulfur record gains it. Repair their product inventories, then separate the rain archive’s natural background chemistry from additional pollution.', 'The oxide records conserve atoms and the rain archive keeps its evidence limits. A pH relay can now guide the district’s recovery, provided its readings are interpreted carefully.', ['carbonOxide', 'sulfurOxide', 'rainEvidence'], 'archive'),
    mission('indicator-relay', 'The indicator and neutralisation relay', 'pH, evidence precision and neutralisation', '#9addcf', 'The recovery network has mistaken an acid label for an exact pH and assumes that more base always fixes a problem. Read the scale, match the evidence to the brief and restore the neutralisation relay.', 'The relay reaches the specified neutral record without overshooting. Professor Nova has one final restoration brief: repair an oxide reaction, recover a greenhouse and reduce continuing emissions.', ['phSample', 'phEvidence', 'neutralisationBand'], 'workshop'),
    mission('district-restoration', 'The Reaction District restoration', 'Salt formation and evidence-based recovery', '#efb7d3', 'The district core needs three decisions supported by chemistry. Identify the right salt-and-water products, choose the greenhouse record that meets its range and compare source-control plans against both pollution targets.', 'The Reaction District reconnects to the academy. Professor Nova names you a Reaction Guardian. Ninety discoveries now connect materials, atoms, balanced records and thoughtful restoration. Your notebook keeps the evidence for the final academy learning path.', ['oxideProducts', 'soilTarget', 'emissionBrief'], 'archive')
  ];
  function simulate(t, value) {
    if (!t || !t.options?.some(o => o.value === value)) return null;
    let success = false, metric = '', caption = '', detail = {};
    switch (t.type) {
      case 'g9-names': {
        const names = {swapped: ['Carbon dioxide', 'Carbon monoxide', 'Sulfur trioxide'], verified: ['Carbon monoxide', 'Carbon dioxide', 'Sulfur trioxide'], 'sulfur-error': ['Carbon monoxide', 'Carbon dioxide', 'Sulfur dioxide']}[value];
        detail = {pairs: ['CO','CO2','SO3'].map((formula,i)=>({formula,name:names[i]})), correct: value==='verified'?3:value==='swapped'?1:2}; success = detail.correct===3; metric = `${detail.correct}/3 names agree with formulae`;
        caption = success ? 'CO: carbon monoxide; CO₂: carbon dioxide; SO₃: sulfur trioxide. All three names match.' : 'At least one proposed prefix disagrees with the oxygen count. Compare every pair with the formula.'; break;
      }
      case 'g9-lattice': {
        const sodium = {'sodium-rich':12,balanced:8,'chloride-rich':4}[value], chloride=16-sodium; success = sodium===chloride; detail={sodium,chloride,charge:sodium-chloride,proposed:true}; metric=`${sodium} Na⁺ : ${chloride} Cl⁻; net charge ${detail.charge>0?'+':''}${detail.charge}`;
        caption = success ? 'Eight Na⁺ and eight Cl⁻ give the 1:1 ratio and balanced charge of the specified NaCl crystal slice.' : 'This proposed sixteen-ion record fails the specified 1:1 ratio and charge balance. It is not the requested neutral NaCl lattice.'; break;
      }
      case 'g9-balance': {
        const product=t.metal==='Mg'?'MgO':'CuO', coefficient=value==='one'?1:2, before=[[t.metal,coefficient],['O2',1]], after=[[value==='formula'?product+'2':product,coefficient]];
        success=value==='two'; detail={before,after,beforeCounts:inventory(before),afterCounts:inventory(after),balanced:conserved(before,after),formulaRetained:value!=='formula',proposed:true}; metric=success?'Both atom counts match; formula retained':value==='one'?'Oxygen inventory does not match':'Product formula was changed';
        caption=success?`Two ${t.metal} atoms and two O atoms are accounted for on each side; the product stays ${product}.` : value==='one'?`One ${t.metal} atom and two O atoms start the record, but only one O appears in the proposed product.`:`The proposal changes ${product} to ${product}₂ and also fails the atom inventory. Balance coefficients while keeping the specified substance.`; break;
      }
      case 'g9-oxide':
        success=value!=='CO2'; detail={formula:value,metal:value==='CO2'?null:value==='MgO'?'Mg':'Cu',counts:formulae[value],ionic:value!=='CO2'}; metric=success?'Metal oxide':'Non-metal oxide'; caption=value==='MgO'?'Magnesium oxide combines magnesium with oxygen in a 1:1 solid ratio.':value==='CuO'?'Copper(II) oxide combines copper with oxygen in a 1:1 solid ratio.':'Carbon dioxide combines the non-metal carbon with oxygen. Containing O does not make it a metal oxide.'; break;
      case 'g9-corrosion':
        success=value==='intact'; detail={exposedSites:value==='bare'?12:value==='scratched'?3:0,protectedSites:value==='bare'?0:value==='scratched'?9:12}; metric=success?'Continuous barrier; no exposed sites':`${detail.exposedSites}/12 iron sites exposed`;
        caption=success?'The specified continuous paint barrier limits oxygen and water reaching the iron during this model interval.':value==='bare'?'All twelve iron sites are exposed to moist air; the model allows rusting at exposed sites.':'Three sites at the scratch remain exposed. Some paint does not provide a continuous barrier.'; break;
      case 'g9-nonmetal': {
        const before=[[t.element,1],['O2',1]], after=[[value,1]]; success=value===t.element+'O2';detail={before,after,beforeCounts:inventory(before),afterCounts:inventory(after),balanced:conserved(before,after),proposed:!success}; metric=success?'Specified dioxide record conserved':'Proposed inventory or product does not match';
        caption=success?`${t.element==='C'?'Carbon':'Sulfur'} plus oxygen forms the specified dioxide; one ${t.element} and two O atoms remain accounted for.`:'This proposal does not match the specified dioxide record and its fixed starting atom inventory. No missing atoms may be silently lost or added.'; break;
      }
      case 'g9-rain':
        success=value==='linked'; detail={backgroundPH:5.6,affectedPH:4.2,backgroundExplained:value!=='neutral',pollutionLinked:success,illustrative:true}; metric=success?'Background and additional acidity distinguished':'Archive explanation is incomplete'; caption=success?'The illustrative 5.6 background reading is mildly acidic; the 4.2 affected record is more acidic. CO₂ contributes background chemistry; SO₂ and nitrogen oxides can add acid deposition.':value==='neutral'?'The proposed pH-7-only explanation ignores mildly acidic background rain. Actual rain does not have one fixed universal pH.':'CO₂ helps explain background acidity, but the CO₂-only explanation omits major additional acid-deposition sources such as SO₂ and nitrogen oxides.'; break;
      case 'g9-ph': {
        const ph={control:7,acid:3,base:11}[value];success=ph<7;detail={ph,classification:ph<7?'acidic':ph>7?'basic':'neutral'};metric=`pH ${ph}: ${detail.classification}`;caption=`At about 25 °C, this aqueous record is ${detail.classification}. The displayed scale is a school reference; pH is logarithmic, not a linear amount or a substance identity.`;break;
      }
      case 'g9-evidence':
        success=value!=='litmus';detail={range:value==='universal'?[2,4]:value==='meter'?[3,3]:null,method:value,certifiedDrinking:false};metric=value==='litmus'?'Acidic; narrow pH range not established':value==='universal'?'Chart estimate: pH 2–4':'Calibrated reading: pH 3.0';caption=value==='litmus'?'Blue litmus turns red, supporting acidity without establishing the required narrow range.':value==='universal'?'The supplied universal-indicator chart estimates pH 2–4 and meets this range brief; it does not establish an exact value.':'The specified calibrated meter reads 3.0 and meets the range brief. Calibration and measurement conditions still matter.';break;
      case 'g9-neutralise': {
        const base={under:3,matched:6,over:9}[value], reacted=Math.min(6,base), acidLeft=6-reacted, baseLeft=base-reacted, before=[['HCl',6],['NaOH',base]], after=[['NaCl',reacted],['H2O',reacted],['HCl',acidLeft],['NaOH',baseLeft]];success=value==='matched';detail={base,reacted,acidLeft,baseLeft,salt:reacted,water:reacted,ph:{under:2,matched:7,over:12}[value],before,after,beforeCounts:inventory(before),afterCounts:inventory(after),illustrative:true};metric=`Sensor record pH ${detail.ph}; ${acidLeft?`${acidLeft} acid`:baseLeft?`${baseLeft} base`:'no reactant'} equivalents left`;
        caption=success?'Six acid and six base equivalents match in this dilute HCl/NaOH model near 25 °C. Six salt formula units and six new water units are accounted for.':value==='under'?'Three acid equivalents remain after the model reaction; the supplied sensor record stays acidic.':'Three base equivalents remain after the model reaction; the supplied sensor record is basic. More base has overshot the neutral brief.';break;
      }
      case 'g9-products': {
        const before=[['HCl',2],['MgO',1]],after=value==='water'?[['MgCl2',1],['H2O',1]]:value==='hydrogen'?[['MgCl2',1],['H2',1]]:[['MgCl',1],['H2O',1]];success=value==='water';detail={before,after,beforeCounts:inventory(before),afterCounts:inventory(after),balanced:conserved(before,after),proposed:!success};metric=success?'Magnesium chloride + water; atoms match':value==='hydrogen'?'Wrong product; oxygen unaccounted for':'Wrong salt formula; chlorine unaccounted for';caption=success?'2 HCl + MgO → MgCl₂ + H₂O. The specified metal oxide forms a salt and water, preserving H, Cl, Mg and O.':'The proposed product record does not match this acid/metal-oxide reaction or account for all of its starting atoms.';break;
      }
      case 'g9-soil': {
        const ph={untreated:4.5,target:6.5,excess:7.9}[value];success=ph>=6&&ph<=7;detail={ph,low:6,high:7,illustrative:true,certifiedClean:false};metric=`Soil record pH ${ph}; target 6–7`;caption=success?'The supplied limestone-treatment record lies inside this greenhouse’s target range. It is not a universal application rate or a contamination clearance.':ph<6?'The untreated record remains below this greenhouse’s target range.':'The supplied above-target record misses this brief. A higher pH is not automatically a better result.';break;
      }
      case 'g9-emissions': {
        const [sulfur,nitrogen,tokens]={screen:[12,8,2],local:[12,8,3],source:[3,2,6]}[value];success=sulfur<=3&&nitrogen<=2&&tokens<=6;detail={sulfur,nitrogen,tokens,sulfurReduction:(12-sulfur)/12,nitrogenReduction:(8-nitrogen)/8,illustrative:true};metric=`SO₂: ${sulfur}/12; nitrogen oxides: ${nitrogen}/8; ${tokens} tokens`;caption=success?'Both tracked emission totals fall by 75% within the six-token budget. These supplied planning outcomes do not certify complete environmental recovery.':value==='local'?'Local acidity treatment can address an effect at one site, but this ledger leaves both continuing air-emission totals unchanged.':'Water-screen maintenance does not reduce either tracked air-emission total in this supplied ledger.';break;
      }
      default:return null;
    }
    return {valid:true,success,metric,caption,amount:0,state:'',...detail};
  }
  const sounds={'g9-names':'archive','g9-lattice':'crystal','g9-balance':'balance','g9-oxide':'scan','g9-corrosion':'paper','g9-nonmetal':'bond','g9-rain':'drop','g9-ph':'indicator','g9-evidence':'scan','g9-neutralise':'neutralise','g9-products':'bond','g9-soil':'scan','g9-emissions':'relay'};
  for(const t of Object.values(tasks))t.sound=sounds[t.type];
  return {tasks,missions,simulate,formulae,inventory,conserved};
});
