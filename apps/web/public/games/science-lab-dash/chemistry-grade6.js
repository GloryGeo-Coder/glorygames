(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScienceChemistryGrade6 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const options = (...pairs) => pairs.map(([value, label]) => ({value, label}));
  const tasks = {
    particleSpace: {
      type: 'g6-particles', title: 'The particle-view decoder',
      goal: 'Choose the particle arrangement for a gas spreading throughout a closed container.',
      options: options(['solid', 'Close, fixed positions'], ['liquid', 'Close, able to rearrange'], ['gas', 'Widely spaced and moving']), initial: 'solid',
      prediction: 'Which model can spread throughout the available space?',
      predictions: ['The widely spaced gas model', 'Only the solid model', 'Particles must grow larger to fill the container'],
      answers: ['Gas particles are widely spaced and move throughout the container; the particles do not grow.', 'Solid particles never move at all.', 'Gas has no particles or matter.'],
      explain: 'A solid’s particles vibrate around fixed positions. A liquid’s close particles can move past one another. Gas particles are much farther apart and move throughout the available space. The same eighteen model dots are used; drawings are not to scale.',
      hint: 'Compare the spacing and the region occupied by each model. Look beyond the colour.',
      fair: 'Compare the same number of model particles and the same closed container; these are schematic arrangements.'
    },
    grainSieve: {
      type: 'g6-sieve', title: 'The mixed delivery sacks',
      goal: 'Separate the fine sand from the larger beans in one pass through a suitable screen.',
      options: options(['wide', 'Holes larger than beans'], ['suitable', 'Holes between grain and bean sizes'], ['closed', 'No screen openings']), initial: 'wide',
      prediction: 'Which screen can let sand through while retaining the beans?',
      predictions: ['Holes larger than sand grains but smaller than beans', 'Holes larger than every object', 'A completely closed screen'],
      answers: ['Sieving uses the difference in particle or object sizes to separate this dry mixture.', 'The screen turns sand into beans.', 'Anything passing a screen must be dissolved.'],
      explain: 'This mixture still contains both materials. A suitable sieve lets the small grains through and retains the beans. Wide holes let both through; a closed screen retains both. Neither substance disappears.',
      hint: 'Compare each hole with both the sand grains and the beans.',
      fair: 'Use the same six beans and eighteen model sand grains; change only the screen openings.'
    },
    settlePour: {
      type: 'g6-settle', title: 'The cloudy sample jars',
      goal: 'Collect the upper water in a second jar after the coarse sand has settled, without a filter.',
      options: options(['shake', 'Shake, then pour at once'], ['rest', 'Settle without pouring'], ['decant', 'Settle, then carefully decant']), initial: 'shake',
      prediction: 'Which process can leave the settled coarse sand behind?',
      predictions: ['Settling followed by careful decanting', 'Shaking the sand back into the water', 'Changing only the jar’s label'],
      answers: ['Settling moves coarse sand to the bottom; careful decanting transfers the upper water.', 'Decanting removes every dissolved substance and germ.', 'The sand dissolves because it settles.'],
      explain: 'Insoluble coarse sand can settle. Decanting means carefully pouring off the upper liquid while leaving the sediment. Finer suspended particles, dissolved substances or germs may remain; the collected water is not certified for drinking.',
      hint: 'First let the grains reach the bottom, then follow which part is transferred.',
      fair: 'Compare stages of identical sand-and-water samples with the same settling interval.'
    },
    soluteSearch: {
      type: 'g6-soluble', title: 'The hidden-solute records',
      goal: 'Find a solid that forms a uniform solution in this amount of water after enough mixing time.',
      options: options(['sand', 'Fine sand'], ['salt', 'Table salt'], ['sugar', 'Sugar']), initial: 'sand',
      prediction: 'Which solids can form a solution under these conditions?',
      predictions: ['Both the salt and the sugar samples', 'Only the sand sample', 'A solid that dissolves stops existing'],
      answers: ['A soluble solid disperses through the water; it is still present even when individual grains cannot be seen.', 'Dissolving salt is the same as melting pure salt.', 'A solution is not a mixture.'],
      explain: 'Salt and sugar are soluble in this model’s amount of water. They form solutions, which are special mixtures. Sand remains insoluble. Dissolving mixes a solute with a solvent; it is different from melting a single material.',
      hint: 'Compare sand with either salt or sugar. Uniform appearance does not mean the solute vanished.',
      fair: 'Keep water amount, temperature, starting solid amount and sufficient mixing time the same; each soluble dose is below saturation.'
    },
    filterCompare: {
      type: 'g6-filter', title: 'The filter-paper comparison',
      goal: 'Choose the feed whose solid is retained by this ordinary filter paper.',
      options: options(['salt', 'Salt solution'], ['sand', 'Sand-and-water mixture'], ['sugar', 'Sugar solution']), initial: 'salt',
      prediction: 'Which solid will this ordinary filter paper retain?',
      predictions: ['The insoluble sand grains', 'All dissolved salt and sugar', 'Every substance in the water'],
      answers: ['The filter retains these sand grains, while dissolved salt and sugar pass through with water.', 'A paper filter removes every chemical and germ.', 'The filter destroys the sand it catches.'],
      explain: 'The sand grains are large enough to be retained by this filter. Dissolved salt and sugar remain in the filtrate. The diagrams track all six model solid units; retained material is separated, not destroyed. The filtrate is not proved safe to drink.',
      hint: 'Check both the filter residue and what reaches the collecting jar.',
      fair: 'Use identical ordinary filter paper, water amounts and six model solid units; change only the feed.'
    },
    saltRecover: {
      type: 'g6-recover', title: 'The salt-recovery tray',
      goal: 'Recover solid salt from the model solution by allowing its water to leave as vapour.',
      options: options(['filter', 'Ordinary paper filtration'], ['settle', 'Covered solution left to settle'], ['evaporate', 'Open tray: evaporate the water']), initial: 'filter',
      prediction: 'Which process can leave the salt behind as solid crystals?',
      predictions: ['Evaporation of the water', 'Ordinary filtering of the dissolved salt', 'Waiting for dissolved salt to settle like sand'],
      answers: ['Water evaporates while non-volatile salt remains and can form crystals.', 'Evaporation destroys the salt particles.', 'The disappearing water becomes salt.'],
      explain: 'Dissolved salt is still present. As water evaporates over sufficient time, salt can be recovered as crystals. Water moves into the surrounding air as invisible vapour. The task recovers salt, not drinking water, and does not require boiling.',
      hint: 'Follow the salt and water separately. Which material leaves the tray?',
      fair: 'Compare identical model salt solutions over the stated process interval; the evaporation snapshot represents sufficient elapsed time.'
    },
    rateHeat: {
      type: 'g6-rate', factor: 'temperature', title: 'The temperature timing bench',
      goal: 'Find the temperature setting with the shortest model dissolving time for this sugar sample.',
      options: options(['cool', 'Cool water'], ['room', 'Room-temperature water'], ['warm', 'Warmer water']), initial: 'cool',
      prediction: 'Which setting is likely to dissolve this sugar sample faster?',
      predictions: ['The warmer water in this comparison', 'The coolest water must always be fastest', 'Changing temperature destroys sugar'],
      answers: ['The warmer mixture dissolves this sample faster when the other test conditions stay the same.', 'A shorter time proves unlimited sugar can dissolve.', 'Changing temperature and sugar amount together is the same fair test.'],
      explain: 'Temperature can affect dissolving rate. This sugar sample dissolves sooner in warmer water in the model. The comparison holds amount, grain size and stirring fixed. The bar chart uses illustrative time units, not measured seconds or a universal rule for every substance.',
      hint: 'A shorter bar means less time. Compare cool and warm while keeping the other conditions fixed.',
      fair: 'Keep water amount, sugar amount, grain size and stirring identical. Change only temperature; the whole dose can dissolve.'
    },
    rateStir: {
      type: 'g6-rate', factor: 'stirring', title: 'The stirring timing bench',
      goal: 'Find the stirring setting that gives the shortest model dissolving time.',
      options: options(['still', 'No stirring'], ['gentle', 'Gentle stirring'], ['steady', 'Steady stirring']), initial: 'still',
      prediction: 'What can stirring change in this comparison?',
      predictions: ['The time taken for the dose to dissolve', 'The identity of the sugar', 'The fixed amount of water'],
      answers: ['Stirring helps this dose dissolve faster; it does not make the solvent hold an unlimited amount.', 'Stirring turns all insoluble materials into solutions.', 'The fastest trial must contain less sugar.'],
      explain: 'Stirring changes how quickly the soluble dose disperses through the water. The model compares time to the same endpoint, with the same starting amounts. Rate is different from the amount that can dissolve at saturation.',
      hint: 'Compare the time bars, not how much sugar was added: every trial starts with the same dose.',
      fair: 'Keep water amount, sugar amount, temperature and grain size fixed; change only stirring.'
    },
    rateGrain: {
      type: 'g6-rate', factor: 'grain size', title: 'The grain-size timing bench',
      goal: 'Find the grain size that gives the shortest model dissolving time for the same mass of sugar.',
      options: options(['coarse', 'Coarse sugar grains'], ['medium', 'Medium sugar grains'], ['fine', 'Fine sugar grains']), initial: 'coarse',
      prediction: 'Which same-mass sample gives water more exposed sugar surface?',
      predictions: ['The finer grains', 'The largest grains only', 'The sample must gain extra sugar when crushed'],
      answers: ['Finer grains expose more surface and dissolve faster here without increasing the starting sugar mass.', 'Crushing creates more sugar matter.', 'Grain size changes sugar into water.'],
      explain: 'Smaller grains expose more total surface to the water. This can shorten dissolving time for the same mass. The model holds temperature, stirring and amounts fixed. It does not claim that crushing increases the saturation limit.',
      hint: 'Keep the mass the same. Compare the exposed surfaces and the time bars.',
      fair: 'Use equal sugar mass and equal water amount, temperature and stirring; change only grain size.'
    },
    saturationTank: {
      type: 'g6-saturation', title: 'The saturation-limit tank',
      goal: 'Show the model’s dissolving limit by adding a dose that leaves excess solid after enough mixing time.',
      options: options(['small', 'Add two model solute units'], ['limit', 'Add four model solute units'], ['excess', 'Add six model solute units']), initial: 'small',
      prediction: 'What can remain when the dose exceeds the limit at fixed conditions?',
      predictions: ['Some undissolved solid alongside a saturated solution', 'An unlimited amount always dissolves', 'The excess solid becomes more solvent'],
      answers: ['At fixed temperature and water amount, this model dissolves at most four units; extra solid remains.', 'A saturated solution must always have visible solid at its bottom.', 'More stirring makes the saturation limit unlimited.'],
      explain: 'Two units give an unsaturated solution here. Four units reach saturation with no excess solid. Six units also give a saturated solution, but two units remain undissolved. The four-unit capacity is illustrative, not a real solubility measurement.',
      hint: 'Compare four with six units. Saturation and visible excess solid are related but not identical.',
      fair: 'Keep water amount, temperature and enough mixing time fixed. The model capacity is four units; change only the added dose.'
    },
    pollutionAudit: {
      type: 'g6-audit', title: 'The clear-water evidence file',
      goal: 'Choose evidence that checks visible particles, dissolved contaminants and microbial hazards.',
      options: options(['look', 'Check appearance only'], ['smell', 'Appearance and smell only'], ['report', 'All three test-report categories']), initial: 'look',
      prediction: 'Can clear-looking water still need further investigation?',
      predictions: ['Yes; some hazards are invisible', 'No; clear water is always safe', 'A pleasant smell proves every hazard is absent'],
      answers: ['Water quality needs appropriate evidence; appearance or smell alone cannot rule out every hazard.', 'A clear sample proves that all germs have gone.', 'Ordinary paper filtering removes all dissolved contaminants.'],
      explain: 'Water can contain suspended material, dissolved contaminants and microscopic organisms. A clear appearance alone does not establish drinking-water safety. This virtual evidence file requests checks for different hazard types; experiment samples remain labelled for laboratory use.',
      hint: 'Look for evidence covering all three categories, including things you cannot see.',
      fair: 'Compare evidence packages for the same labelled water sample; do not taste the sample.'
    },
    wetlandFlow: {
      type: 'g6-wetland', title: 'The wetland flow model',
      goal: 'Choose the landscape that protects wetland habitat and gives the lowest model runoff peak.',
      options: options(['paved', 'Wetland replaced by paving'], ['drained', 'Drained, sparse vegetation'], ['intact', 'Wetland and vegetation protected']), initial: 'paved',
      prediction: 'How can a protected wetland help the surrounding area?',
      predictions: ['It can slow flow, retain some sediment and support living things', 'It removes every pollutant forever', 'Paving always improves wetland habitat'],
      answers: ['A functioning wetland can regulate flow and improve water quality while providing habitat.', 'A wetland guarantees its water is safe to drink.', 'All water entering a wetland vanishes permanently.'],
      explain: 'Wetlands can slow and store water, retain some sediment and support biodiversity. Their performance depends on conditions and the pollutants present. This model shows an illustrative runoff peak; wetland water is not automatically safe to drink.',
      hint: 'Compare the peak-flow markers and the habitat shown for the same incoming rain pulse.',
      fair: 'Use the same model area and incoming rain pulse; change only the wetland condition.'
    },
    treatmentTrain: {
      type: 'g6-treatment', title: 'The waterworks route planner',
      goal: 'Remove the visible debris using the lowest filter load among these model routes.',
      options: options(['screen', 'Screen only'], ['filter', 'Screen, then filter'], ['settle-filter', 'Screen, settle, decant, then filter']), initial: 'screen',
      prediction: 'Which route can reduce the solid load reaching the final filter?',
      predictions: ['Screening plus settling and decanting before filtration', 'A screen removes all kinds of contaminants', 'The colour of a pipe determines its filtering power'],
      answers: ['Earlier stages remove larger or settling material, reducing the solid load reaching the final filter.', 'A clear filtrate is automatically safe to drink.', 'Filtration destroys dissolved salt.'],
      explain: 'Both routes with a filter remove the visible model solids. Settling and decanting first leave fewer solids for that filter to capture. The chosen route meets this model’s filter-load brief. Dissolved substances and microbial hazards still need separate evaluation.',
      hint: 'Compare two results: visible solids removed and how many solid markers the final filter must capture.',
      fair: 'Use the same twelve visible solid markers and filter type. The labelled routes show idealised process stages, not a municipal plant specification.'
    },
    disinfectionScope: {
      type: 'g6-disinfect', title: 'The microbial-control briefing',
      goal: 'Identify a managed stage that targets harmful germs, while tracking the chemical hazard separately.',
      options: options(['paper', 'Ordinary paper filter only'], ['heat', 'Controlled heat disinfection'], ['managed', 'Managed chemical disinfection']), initial: 'paper',
      prediction: 'Which stages can address microbial hazards under verified conditions?',
      predictions: ['Managed heat or chemical disinfection', 'Any paper filter removes every hazard', 'Disinfection always removes dissolved chemicals too'],
      answers: ['Disinfection targets germs; it does not establish that dissolved chemical hazards have been removed.', 'Boiling removes every chemical contaminant.', 'A model success result is a real drinking-water certificate.'],
      explain: 'Controlled heating or managed chemical disinfection can reduce harmful germs under verified conditions. Many chemical hazards can remain. This briefing gives no doses, times or treatment instructions, and it does not certify any sample for drinking.',
      hint: 'Follow the microbial and chemical status labels separately. A change in one is not proof about the other.',
      fair: 'Compare virtual control categories for the same sample; real effectiveness requires professionally verified conditions.'
    },
    sourceDecision: {
      type: 'g6-release', title: 'The final waterworks decision',
      goal: 'Respond to a clear-looking sample whose chemical-hazard alert remains unresolved.',
      options: options(['clear', 'Release because it looks clear'], ['boil', 'Assume boiling removes chemicals'], ['hold', 'Hold for specialist assessment']), initial: 'clear',
      prediction: 'What should happen while the chemical alert is unresolved?',
      predictions: ['Keep the sample on hold for specialist assessment', 'Treat appearance as a complete safety test', 'Ignore the alert after heating'],
      answers: ['Keep it out of drinking use until qualified assessment and appropriate controls resolve the hazard.', 'A clear colour cancels chemical test results.', 'All water hazards respond to the same single process.'],
      explain: 'The unresolved alert means there is not enough evidence to release the sample for drinking. Holding it and involving qualified water specialists completes the evidence-led decision. Real contamination concerns should follow the responsible water authority’s advice.',
      hint: 'The task is a decision under unresolved evidence. Which choice respects the remaining alert?',
      fair: 'Use the same unresolved chemical report in every decision; appearance does not change the evidence.'
    }
  };
  const mission = (id, title, topic, color, story, ending, ids, background) => ({id, title, grade: 6, topic, color, story, ending, tasks: ids, background});
  const missions = [
    mission('mixture-dock', 'The mixed-up supply dock', 'Particle models and separating mixtures', '#89d9f0', 'After the materials fair, a storm mixes the waterworks supply records. Professor Nova sends you to the academy’s water wing. Decode the particle viewer, sort the delivery sacks and separate a cloudy sample before reopening the dock.', 'The dock’s mixtures are separated and its records agree with the evidence. A clear-looking sample from the solution vault has a surprising secret.', ['particleSpace', 'grainSieve', 'settlePour'], 'storeroom'),
    mission('solution-vault', 'The hidden-solution vault', 'Soluble substances, filtration and recovery', '#b8b4ff', 'The vault’s notes claim that dissolved solids have vanished. Compare soluble and insoluble samples, challenge the filter report and recover salt without losing track of the water.', 'Your records show that dissolving does not destroy matter. The salt is recovered, while the timing hub still disagrees about which tests are fastest.', ['soluteSearch', 'filterCompare', 'saltRecover'], 'archive'),
    mission('dissolving-hub', 'The dissolving timing hub', 'Fair comparisons of dissolving rates', '#ffd48c', 'Three timing benches changed too many things at once. Restore fair comparisons by testing temperature, stirring and grain size separately. Read the model time bars and explain what each result can—and cannot—show.', 'The timing hub now compares evidence fairly. Faster dissolving is not the same as unlimited solubility. A wetland monitoring alert calls the team to the next station.', ['rateHeat', 'rateStir', 'rateGrain'], 'workshop'),
    mission('wetland-route', 'The wetland evidence route', 'Saturation, water pollution and wetlands', '#92e1c1', 'The academy’s wetland exhibition is warning of runoff and invisible pollution. Find a dissolving limit, review a clear-water evidence file and compare how a protected wetland responds to a rain pulse.', 'The wetland’s value is visible in the evidence: habitat, slower flow and some sediment retention. The waterworks relay now needs a careful final decision about the samples.', ['saturationTank', 'pollutionAudit', 'wetlandFlow'], 'workshop'),
    mission('waterworks-relay', 'The waterworks evidence relay', 'Treatment stages and responsible decisions', '#a8cfff', 'The relay will reopen only when every claim has evidence. Compare treatment routes, distinguish germ control from chemical hazards and decide what to do with a sample that still has an unresolved alert.', 'The waterworks teaching wing reopens with honest records and labelled samples. Professor Nova names you a Water Investigator. Forty-five discoveries now connect materials, processing, mixtures and water evidence. The unresolved sample stays with qualified specialists, and your comparisons remain in the notebook.', ['treatmentTrain', 'disinfectionScope', 'sourceDecision'], 'archive')
  ];
  const rateTimes = {
    temperature: {cool: 18, room: 12, warm: 6},
    stirring: {still: 18, gentle: 11, steady: 6},
    'grain size': {coarse: 18, medium: 12, fine: 6}
  };
  function simulate(t, value) {
    if (!t || !t.options?.some(o => o.value === value)) return null;
    let success = false, metric = '', caption = '', details = {};
    switch (t.type) {
      case 'g6-particles':
        success = value === 'gas'; metric = value === 'gas' ? 'Gas: widely spaced' : value === 'liquid' ? 'Liquid: close and rearranging' : 'Solid: close, fixed positions';
        caption = value === 'gas' ? 'The eighteen gas-model particles spread throughout the closed container without becoming larger.' : value === 'liquid' ? 'The close liquid-model particles can move past one another but do not fill the whole container as a gas.' : 'The close solid-model particles vibrate around fixed positions; this is not the gas arrangement.';
        details = {particleCount: 18, state: value}; break;
      case 'g6-sieve': {
        const retainedBeans = value === 'wide' ? 0 : 6, retainedSand = value === 'closed' ? 18 : 0;
        success = value === 'suitable'; details = {retainedBeans, retainedSand, passedBeans: 6 - retainedBeans, passedSand: 18 - retainedSand};
        metric = success ? 'Beans retained; sand passes' : value === 'wide' ? 'Both materials pass' : 'Both materials retained';
        caption = success ? 'All six beans remain above the screen and all eighteen model sand grains pass through.' : value === 'wide' ? 'The holes are so large that both the beans and sand pass through.' : 'No openings means neither the beans nor the sand can pass through.'; break;
      }
      case 'g6-settle':
        success = value === 'decant'; metric = success ? 'Upper water collected; sediment left' : value === 'rest' ? 'Sediment settles; no transfer yet' : 'Sand travels with the mixture';
        caption = success ? 'Settling and careful decanting leave the coarse sand behind while upper water enters the collecting jar. Other contaminants may remain.' : value === 'rest' ? 'The coarse sand has settled, but the upper water has not been transferred yet.' : 'Shaking suspends the coarse sand again, so pouring immediately carries it into the next jar.'; break;
      case 'g6-soluble':
        success = value !== 'sand'; metric = success ? 'Uniform solution; solute still present' : 'Insoluble grains remain';
        caption = success ? `The ${value} disperses through the water to form a solution. The six model solute units still exist; this is dissolving, not melting.` : 'The sand does not dissolve under these conditions; its grains remain in the mixture.';
        details = {dissolved: success ? 6 : 0, residue: success ? 0 : 6, total: 6}; break;
      case 'g6-filter':
        success = value === 'sand'; details = {retained: success ? 6 : 0, passed: success ? 0 : 6, total: 6};
        metric = success ? 'Six solid units retained' : 'Dissolved solid passes with water';
        caption = success ? 'The six model sand units are retained on the filter paper. The collected water is not certified for drinking.' : `All six dissolved ${value} units pass through this ordinary filter with the water; filtering does not recover this solute.`; break;
      case 'g6-recover':
        success = value === 'evaporate'; metric = success ? 'Salt crystals remain; water enters air' : 'Salt remains dissolved';
        caption = success ? 'After sufficient evaporation time, six model salt units remain as crystals. Twelve water markers have moved into the surrounding air as invisible vapour; matter is not destroyed.' : value === 'filter' ? 'The dissolved salt passes through ordinary filter paper with the water; it is not recovered as crystals.' : 'Dissolved salt does not settle like sand in this covered solution.';
        details = {salt: 6, liquidWater: success ? 0 : 12, vapourWater: success ? 12 : 0}; break;
      case 'g6-rate': {
        const time = rateTimes[t.factor][value]; success = time === 6;
        metric = `${time} illustrative time units`; caption = `This dose reaches the same dissolving endpoint in ${time} model time units. ${success ? 'It is the shortest time in this comparison.' : 'Compare with another setting while holding the other conditions fixed.'} These are not measured seconds.`;
        details = {time, times: {...rateTimes[t.factor]}, endpoint: 'Same complete soluble dose', illustrative: true}; break;
      }
      case 'g6-saturation': {
        const added = {small: 2, limit: 4, excess: 6}[value], dissolved = Math.min(4, added), residue = added - dissolved;
        success = residue > 0; details = {added, dissolved, residue, saturated: dissolved === 4, capacity: 4};
        metric = `${dissolved} dissolved; ${residue} excess units`;
        caption = value === 'small' ? 'Two units dissolve. This model solution is below its four-unit saturation limit.' : value === 'limit' ? 'Four units dissolve: the solution is saturated with no excess solid. The goal asks for visible excess evidence; compare a larger dose.' : 'Four units dissolve and two remain undissolved after enough mixing time. The solution is saturated and the dose exceeded its model limit.'; break;
      }
      case 'g6-audit':
        success = value === 'report'; metric = success ? 'All three hazard categories checked' : 'Important hazard evidence missing';
        caption = success ? 'The evidence package requests physical, chemical and microbial checks. Results still require appropriate interpretation; this is not a drinking-water certificate.' : 'Appearance or smell alone cannot rule out dissolved contaminants or harmful microscopic organisms.';
        details = {physical: true, chemical: success, microbial: success, certifiedDrinking: false}; break;
      case 'g6-wetland': {
        const peak = {paved: 9, drained: 6, intact: 3}[value]; success = value === 'intact';
        metric = `${peak} illustrative peak-flow markers`; caption = success ? 'The protected wetland has the lowest model runoff peak, retains some sediment and provides habitat. Its water is not automatically safe to drink.' : 'This altered landscape has a higher model runoff peak and less wetland habitat than the protected wetland.';
        details = {peak, habitat: success ? 'Protected' : 'Reduced', certifiedDrinking: false}; break;
      }
      case 'g6-treatment': {
        const removed = value === 'screen' ? 4 : 12, filterLoad = value === 'screen' ? null : value === 'filter' ? 8 : 2;
        success = value === 'settle-filter'; details = {removed, remaining: 12 - removed, filterLoad, dissolvedHazard: 'Not assessed', microbialHazard: 'Not assessed', certifiedDrinking: false};
        metric = `${removed}/12 visible markers removed`;
        caption = value === 'screen' ? 'The screen catches four larger debris markers; eight smaller solid markers remain. No final filter is used.' : value === 'filter' ? 'All twelve visible solid markers are removed, but the final filter captures eight. Dissolved and microbial hazards are not assessed.' : 'All twelve visible markers are removed: four at screening, six in the settled residue and two at the final filter. This is the lowest final-filter load among these routes; other hazards are not assessed.'; break;
      }
      case 'g6-disinfect':
        success = value !== 'paper'; metric = success ? 'Microbial control; chemical alert remains' : 'Microbial control not established';
        caption = success ? 'Under verified managed conditions, this stage can reduce harmful germs. The chemical hazard remains unresolved, so the sample is not certified for drinking.' : 'Ordinary paper filtration alone does not establish control of all harmful germs; the chemical alert also remains unresolved.';
        details = {microbialControl: success, chemicalResolved: false, certifiedDrinking: false}; break;
      case 'g6-release':
        success = value === 'hold'; metric = success ? 'Sample held for specialist assessment' : 'Unresolved alert: release not justified';
        caption = success ? 'The sample stays out of drinking use while qualified specialists assess and resolve the chemical alert.' : value === 'boil' ? 'Boiling does not remove every chemical hazard; it cannot justify releasing this unresolved sample.' : 'A clear appearance cannot cancel the unresolved chemical-hazard report.';
        details = {held: success, chemicalResolved: false, certifiedDrinking: false}; break;
      default: return null;
    }
    return {valid: true, success, metric, caption, amount: 0, state: details.state || '', ...details};
  }
  const sounds={'g6-particles':'scan','g6-sieve':'sieve','g6-settle':'pour','g6-soluble':'mix','g6-filter':'flow','g6-recover':'cool','g6-rate':'stir','g6-saturation':'mix','g6-audit':'scan','g6-wetland':'flow','g6-treatment':'valve','g6-disinfect':'scan','g6-release':'repair'};
  for(const task of Object.values(tasks))task.sound=sounds[task.type];
  return {tasks, missions, simulate, rateTimes};
});
