(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScienceChemistryGrade5 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const options = (...pairs) => pairs.map(([value, label]) => ({value, label}));
  const tasks = {
    metalShape: {
      type: 'g5-shape', title: 'The metal-shaping bench',
      goal: 'Find the specimen that can be shaped into a curved clip without breaking.',
      options: options(['chalk', 'Chalk stick'], ['copper', 'Copper strip'], ['stone', 'Stone chip']), initial: 'chalk',
      prediction: 'Which specimen is suitable for shaping a clip?',
      predictions: ['The copper strip', 'The chalk stick', 'All solid materials bend equally'],
      answers: ['This copper specimen can be shaped without breaking: it is malleable.', 'Every shiny object is a metal.', 'Bending changes copper into a different substance.'],
      explain: 'Malleable metals can be shaped without breaking. The copper strip curves into a clip; the chalk and stone specimens break in this model. Appearance alone does not identify a metal.',
      hint: 'Compare the copper strip with the chalk specimen. Watch for a curve or a break.',
      fair: 'Compare the labelled specimens under the same model shaping test.'
    },
    wireDraw: {
      type: 'g5-wire', title: 'The thin-wire supply',
      goal: 'Choose a material that can be drawn into a continuous thin wire.',
      options: options(['clay', 'Dry clay'], ['chalk', 'Chalk'], ['copper', 'Copper']), initial: 'clay',
      prediction: 'Which material can supply a continuous metal wire?',
      predictions: ['Copper', 'Dry clay', 'Chalk'],
      answers: ['Copper is ductile: it can be drawn into thin wire.', 'All non-metals can be drawn into metal wires.', 'Drawing a wire creates more copper.'],
      explain: 'Ductile means able to be drawn into thin wire. Copper can make a continuous wire; the dry clay and chalk specimens crumble. This is a virtual manufacturing comparison, not a live electrical experiment.',
      hint: 'Look for the specimen that remains in one piece as it becomes longer and thinner.',
      fair: 'Use equal starting volumes in the same virtual drawing equipment.'
    },
    magnetSort: {
      type: 'g5-magnet', title: 'The magnetic sorting gate',
      goal: 'Find the metal sample that the gate’s magnet can attract.',
      options: options(['copper', 'Copper'], ['iron', 'Iron'], ['aluminium', 'Aluminium']), initial: 'copper',
      prediction: 'Will this magnet strongly attract every metal sample?',
      predictions: ['No; it attracts the iron sample here', 'Yes; all metals are strongly magnetic', 'No; magnets only attract wood'],
      answers: ['Iron is attracted here; copper and aluminium are metals that are not strongly attracted.', 'An object must be a non-metal if this magnet does not attract it.', 'All metals behave identically near a magnet.'],
      explain: 'Some metals are magnetic and some are not. In this classroom model, the magnet attracts iron but not copper or aluminium. A magnet test alone cannot identify every metal.',
      hint: 'Test iron, then compare it with copper or aluminium.',
      fair: 'Keep the magnet, sample size and starting distance the same.'
    },
    heatBridge: {
      type: 'g5-heat', title: 'The warm-sample bridge',
      goal: 'Choose the specimen that transfers heat most readily to the far-end sensor.',
      options: options(['wood', 'Wood rod'], ['copper', 'Copper rod'], ['plastic', 'Plastic rod']), initial: 'wood',
      prediction: 'Which rod will transfer heat to the sensor most readily?',
      predictions: ['The copper rod', 'The wood rod', 'All three rods transfer heat equally quickly'],
      answers: ['Copper conducts heat more readily than these wood and plastic specimens.', 'The rod transports liquid copper to the sensor.', 'A material must be magnetic to conduct heat.'],
      explain: 'Metals such as copper conduct heat well. These wood and plastic rods transfer heat much less readily during the same observation time. Heat conduction is different from magnetic attraction.',
      hint: 'Compare the far-end sensor while keeping the heat source unchanged.',
      fair: 'Use equal-size rods, the same source temperature and the same observation time. This is a virtual test.'
    },
    rustWatch: {
      type: 'g5-rust', title: 'The time-lapse rust watch',
      goal: 'Find the condition in which the uncoated iron specimen develops rust.',
      options: options(['dry', 'Dry air'], ['wet-air', 'Water and air'], ['no-oxygen', 'Water with oxygen excluded']), initial: 'dry',
      prediction: 'Which condition supports rusting of iron?',
      predictions: ['Water and oxygen from air together', 'Only completely dry air', 'Water with oxygen completely excluded'],
      answers: ['Iron rusts when water and oxygen are available together.', 'Every metal becomes iron rust.', 'Rust forms instantly whenever iron is visible.'],
      explain: 'Iron rusts when water and oxygen are available. The model compresses days of observation; the rust is not instant. Copper and aluminium do not form iron rust, although metals can corrode in other ways.',
      hint: 'Compare water plus air with a setup missing either water or oxygen.',
      fair: 'Use identical uncoated iron specimens and the same elapsed days. The oxygen-excluded setup is sealed and idealised.'
    },
    roofCoat: {
      type: 'g5-coating', title: 'The roof-fastener shield',
      goal: 'Protect the iron fastener with a barrier that keeps water and air away from its surface.',
      options: options(['bare', 'Bare iron'], ['chipped', 'Chipped paint coating'], ['intact', 'Intact paint coating']), initial: 'bare',
      prediction: 'Which coating will protect the whole model surface?',
      predictions: ['An intact paint coating', 'Paint with an exposed gap', 'No coating in wet air'],
      answers: ['An intact coating is a barrier; exposed iron at a chip can still rust.', 'Painting changes iron into a non-metal.', 'One patch of paint protects all uncovered iron forever.'],
      explain: 'An intact paint layer separates iron from water and oxygen. A chip exposes part of the iron, where rust can develop. Protection depends on keeping the barrier intact.',
      hint: 'Look for any place where water can reach exposed iron.',
      fair: 'Compare identical fasteners in the same wet-air conditions over the same elapsed days.'
    },
    paperPaste: {
      type: 'g5-process', process: 'paste', title: 'The paper-label repair',
      goal: 'Find a sticky paste for reattaching the academy’s paper labels.',
      options: options(['dry', 'Dry flour'], ['water', 'Water alone'], ['mixed', 'Flour mixed with water']), initial: 'dry',
      prediction: 'Which combination can make a sticky paper paste?',
      predictions: ['Flour mixed with water', 'Dry flour alone', 'Water with no flour'],
      answers: ['Combining flour and water makes a paste with useful sticking properties.', 'Mixing always leaves the properties unchanged.', 'The flour becomes a metal.'],
      explain: 'Flour and water can be combined into a sticky paste. The paste has a different useful property from dry flour or water alone. This model compares paper joins, not food preparation.',
      hint: 'Compare a paper join made with the mixture against either ingredient alone.',
      fair: 'Use the same paper strips, contact area and model joining test.'
    },
    plasterCast: {
      type: 'g5-process', process: 'plaster', title: 'The missing display cast',
      goal: 'Restore a firm display cast from the plaster mixture.',
      options: options(['powder', 'Dry plaster powder'], ['fresh', 'Freshly mixed plaster and water'], ['set', 'Mixture after setting']), initial: 'powder',
      prediction: 'What must happen after plaster powder is mixed with water?',
      predictions: ['The mixture needs time to set', 'The powder stays loose forever', 'Adding water makes metal wire'],
      answers: ['Mixing with water and allowing setting produces a firm plaster cast.', 'A freshly flowing mixture is already the same as the firm cast.', 'All processed materials set by freezing.'],
      explain: 'Plaster powder and water form a mixture that sets into a firm cast. Its properties change during processing. The snapshots show stages of the same virtual process; there is no real mixing recipe here.',
      hint: 'Compare the fresh flowing mixture with the cast after setting time.',
      fair: 'Compare process snapshots of the same starting materials and mould; only the stage changes.'
    },
    concreteSet: {
      type: 'g5-process', process: 'concrete', title: 'The courtyard repair block',
      goal: 'Choose the processed material that forms a hardened repair block.',
      options: options(['dry', 'Dry sand, gravel and cement'], ['fresh', 'Fresh mixture with water'], ['cured', 'Mixture after setting and curing']), initial: 'dry',
      prediction: 'Which process can make the hardened block?',
      predictions: ['Mix the ingredients with water, then allow setting and curing', 'Leave the dry ingredients loose', 'Remove cement and use only dry gravel'],
      answers: ['Concrete hardens through setting and curing after its ingredients are mixed with water.', 'Concrete hardens only because all water evaporates.', 'Fresh concrete is already ready for every building load.'],
      explain: 'Concrete combines sand, gravel, cement and water. It hardens during setting and curing; this is not simply all the water drying out. The game compresses the time and does not give construction instructions or load ratings.',
      hint: 'Follow the change from loose ingredients to a fresh mixture and then a hardened block.',
      fair: 'Compare stages of the same virtual batch in the same mould.'
    },
    clayPot: {
      type: 'g5-clay', title: 'The potter’s water vessel',
      goal: 'Choose the model pot whose finished surface holds the test water without leaking.',
      options: options(['wet', 'Shaped wet clay'], ['dry', 'Air-dried unglazed clay'], ['glazed', 'Fired ceramic with an intact fired glaze']), initial: 'wet',
      prediction: 'Which finished vessel is suitable for holding water here?',
      predictions: ['The fired vessel with its intact glaze', 'Wet clay that is still soft', 'Every unglazed clay object is waterproof'],
      answers: ['Shaping, drying, firing and glazing can produce this rigid, water-holding ceramic vessel.', 'Drying any clay makes it completely waterproof.', 'Firing guarantees every unglazed pot is waterproof.'],
      explain: 'Pottery is made by processing clay. Drying and firing change its properties; an intact fired glaze seals this vessel’s surface. Unglazed ceramics can still be porous. Firing is represented only as a virtual process.',
      hint: 'Compare both whether the pot keeps its shape and whether water passes through its surface.',
      fair: 'Compare the same vessel design and water test at the labelled processing stages.'
    },
    weaveMat: {
      type: 'g5-weave', title: 'The reed-weaving exhibit',
      goal: 'Make the prepared reed strips stay together as a mat during the gentle model lift.',
      options: options(['parallel', 'Loose parallel strips'], ['woven', 'Alternating over-and-under weave'], ['pile', 'Loose pile of strips']), initial: 'parallel',
      prediction: 'Which arrangement links the crossing strips into a mat?',
      predictions: ['The alternating over-and-under weave', 'Loose strips with no interlacing', 'Changing only the strip colour'],
      answers: ['Interlacing the prepared strips gives this woven mat a useful structure.', 'Weaving changes plant fibres into metal.', 'Every basket is made in exactly this one pattern.'],
      explain: 'People across Africa have long processed plant fibres into useful mats and baskets. This example interlaces prepared reeds. Different communities also use other materials, patterns, coiling and plaiting methods.',
      hint: 'Follow a crossing strip: it goes over one strip and under the next.',
      fair: 'Keep the prepared strips and gentle lift test the same; change their arrangement.'
    },
    doughCook: {
      type: 'g5-process', process: 'dough', title: 'The community kitchen record',
      goal: 'Find the processing stage that produces a cooked flatbread sample.',
      options: options(['mixed', 'Freshly mixed flour-and-water dough'], ['rested', 'Dough after resting without cooking'], ['cooked', 'Dough after cooking']), initial: 'mixed',
      prediction: 'What turns this prepared dough into cooked flatbread?',
      predictions: ['Cooking the dough', 'Resting without cooking', 'Changing its label only'],
      answers: ['Mixing and cooking produce a sample with different properties from the starting flour and water.', 'Resting always cooks every dough.', 'All processing methods produce identical materials.'],
      explain: 'Flour and water can be mixed into dough and then cooked to make a flatbread. Cooking changes the sample’s properties. This virtual archive is about processing, not a recipe or an invitation to taste laboratory samples.',
      hint: 'Compare the uncooked dough with the sample after cooking.',
      fair: 'Compare stages of the same prepared virtual dough sample.'
    },
    jellyCool: {
      type: 'g5-process', process: 'jelly', title: 'The cooling-gallery display',
      goal: 'Find the processing stage in which the prepared gelatine jelly has set.',
      options: options(['powder', 'Dry gelatine jelly powder'], ['warm', 'Powder dissolved in warm water'], ['cooled', 'Prepared mixture after sufficient cooling time']), initial: 'powder',
      prediction: 'Which step helps the prepared jelly mixture set?',
      predictions: ['Allowing the mixture to cool sufficiently', 'Keeping it warm throughout', 'Removing all its ingredients'],
      answers: ['Mixing and sufficient cooling let this gelatine mixture set into a soft gel.', 'Jelly sets only because all its water evaporates.', 'Every liquid becomes jelly when cooled.'],
      explain: 'Gelatine jelly powder is dissolved in water and the prepared mixture is cooled until it sets. The soft gel still contains water. This differs from plaster setting or cooking dough; processing methods are chosen for the material.',
      hint: 'Compare the warm, flowing mixture with the same mixture after sufficient cooling time.',
      fair: 'Compare stages of the same gelatine recipe and amount, without evaporation; exact times and temperatures are not modelled.'
    },
    windowChoice: {
      type: 'g5-window', title: 'The observation-window choice',
      goal: 'Choose a rigid, transparent sample that lets visitors see the exhibit behind it.',
      options: options(['wood', 'Opaque wood board'], ['glass', 'Clear window glass'], ['acrylic', 'Clear rigid acrylic sheet']), initial: 'wood',
      prediction: 'Can more than one processed material meet this window brief?',
      predictions: ['Yes; both clear glass and clear rigid acrylic can work here', 'Only a material’s colour matters', 'All plastics are opaque'],
      answers: ['Both clear specimens meet this brief; choose materials by the properties the job needs.', 'Every processed material has the same properties.', 'A transparent window must also be magnetic.'],
      explain: 'These glass and acrylic sheets are rigid and transparent. Both meet the model brief. Other jobs may need extra tests for impact, scratching, heat or cost; transparency alone does not decide every window design.',
      hint: 'Check which samples keep their shape and let you see the symbol behind them.',
      fair: 'Use the same panel size, lighting and viewing symbol.'
    },
    packingChoice: {
      type: 'g5-packing', title: 'The travelling-exhibit case',
      goal: 'Choose a container with cushioning that protects the fragile model during a dry indoor delivery.',
      options: options(['glass', 'Unlined glass jar'], ['basket', 'Woven reed basket with a soft lining'], ['box', 'Wooden box with a soft lining']), initial: 'glass',
      prediction: 'Which designs can combine a container and soft cushioning?',
      predictions: ['Both lined containers can meet this brief', 'Only the unlined glass jar', 'Cushioning never affects protection'],
      answers: ['Combining a suitable container with soft lining gives more than one working solution.', 'A woven basket must be waterproof to work on this dry route.', 'The strongest-looking material is best for every purpose.'],
      explain: 'Both lined containers protect this specimen in the same gentle model jolt. The container holds the exhibit and the lining cushions it. The unlined glass specimen fails this brief. These results are not real packaging safety ratings.',
      hint: 'Look for the lining as well as the outer container. The route is dry, so waterproofing is not the target.',
      fair: 'Use the same fragile specimen and gentle model jolt on a dry indoor route.'
    }
  };
  const mission = (id, title, topic, color, story, ending, ids, background) => ({id, title, grade: 5, topic, color, story, ending, tasks: ids, background});
  const missions = [
    mission('metal-store', 'The mislabelled metal store', 'Metal properties and magnetic attraction', '#87dbe8', 'The restored Element Archive reveals a locked makers’ wing. Its metal supplies have been mixed with brittle samples. Professor Nova needs a clip, a wire and a magnetic gate before the team can enter.', 'The gate opens. Your tests show why metals are useful—and why a magnet cannot identify every metal. A leaking roof now threatens the wing’s equipment.', ['metalShape', 'wireDraw', 'magnetSort'], 'workshop'),
    mission('rain-roof', 'The rain-roof rescue', 'Heat conduction and protecting iron', '#a8baff', 'Rain has reached the makers’ wing. Compare heat transfer, investigate time-lapse rust records and protect the iron fasteners. The right material needs the right protection.', 'The roof fasteners are protected and the heat sensor works. Your evidence leads to a hall where the repair casts have never set.', ['heatBridge', 'rustWatch', 'roofCoat'], 'storeroom'),
    mission('mixing-hall', 'The stalled casting hall', 'Combining materials, setting and curing', '#ffd08c', 'The casting hall has supplies but no finished repairs. Reattach the paper labels, restore a plaster cast and follow a concrete batch from loose ingredients to a hardened model block.', 'The hall can make repairs again. You have discovered that combining and processing can change useful properties. The makers’ courtyard is ready for its next exhibit.', ['paperPaste', 'plasterCast', 'concreteSet'], 'workshop'),
    mission('makers-court', 'The makers’ courtyard', 'Clay, plant fibres and traditional processing', '#92dfbd', 'Community makers are rebuilding the academy exhibition. Investigate a clay vessel, interlace a reed mat and correct a flatbread processing record. Their skills connect material knowledge with everyday life.', 'The courtyard exhibit celebrates several ways to process materials. Professor Nova invites you to help reopen the academy materials fair.', ['clayPot', 'weaveMat', 'doughCook'], 'workshop'),
    mission('materials-fair', 'The academy materials fair', 'Choosing processed materials for a purpose', '#efb5e9', 'The fair’s final displays need evidence, not guesses. Restore a cooling exhibit, choose an observation window and protect a travelling model. Different materials can solve the same problem when their properties fit the brief.', 'The makers’ wing reopens and the materials fair welcomes its visitors. Professor Nova awards you the Materials Maker badge. Your thirty discoveries now link materials, processing and useful designs; every comparison remains in your field notebook.', ['jellyCool', 'windowChoice', 'packingChoice'], 'archive')
  ];
  function simulate(t, value) {
    let success = false, metric = '', caption = '', amount = 0;
    switch (t.type) {
      case 'g5-shape':
        success = value === 'copper'; metric = success ? 'Curved clip formed' : 'Specimen breaks';
        caption = success ? 'The copper strip curves without breaking in this shaping test.' : 'This brittle specimen breaks instead of forming the curved clip.'; break;
      case 'g5-wire':
        success = value === 'copper'; metric = success ? 'Continuous thin wire' : 'Specimen crumbles';
        caption = success ? 'Copper is drawn into a longer, thinner continuous wire; the material amount stays the same.' : 'This dry specimen crumbles instead of forming a continuous thin wire.'; break;
      case 'g5-magnet':
        success = value === 'iron'; metric = success ? 'Attracted by the magnet' : 'Not strongly attracted';
        caption = success ? 'The iron sample moves toward the magnet.' : `This ${value} sample is a metal, but it is not strongly attracted by this magnet.`; break;
      case 'g5-heat':
        success = value === 'copper'; metric = success ? 'Far-end sensor warms readily' : 'Far-end sensor changes little';
        caption = success ? 'Heat transfers readily along copper to the far-end sensor during the fixed time.' : 'This specimen transfers heat much less readily to the far-end sensor during the same time.'; break;
      case 'g5-rust':
        success = value === 'wet-air'; metric = success ? 'Iron rust develops over days' : 'No rust in the idealised test';
        caption = success ? 'With water and oxygen available, rust develops over the elapsed days; the time-lapse is compressed.' : value === 'dry' ? 'With water absent, the iron does not rust in this idealised dry-air comparison.' : 'With oxygen excluded, the iron does not rust in this idealised sealed comparison.'; break;
      case 'g5-coating':
        success = value === 'intact'; metric = success ? 'Iron protected by intact barrier' : 'Exposed iron can rust';
        caption = success ? 'The intact paint separates the iron surface from water and air.' : value === 'chipped' ? 'Water and air reach exposed iron at the paint chip; rust can develop there.' : 'Water and air reach the uncoated iron surface; rust can develop over days.'; break;
      case 'g5-process': {
        const result = {
          paste: {mixed: ['Sticky paste joins the paper', 'Combining flour with water produces a sticky paste that joins these paper strips.'], dry: ['Loose flour; join fails', 'Dry flour alone does not form the sticky paste.'], water: ['Wet paper; join fails', 'Water alone does not form this flour paste.']},
          plaster: {set: ['Firm plaster cast', 'After mixing with water and allowing setting time, the plaster cast keeps the mould’s shape.'], powder: ['Loose powder', 'The unmixed plaster powder cannot form the firm cast.'], fresh: ['Fresh flowing mixture', 'The fresh mixture has not yet set into a firm cast.']},
          concrete: {cured: ['Hardened model block', 'The mixture has set and cured into a hardened block; hardening is not simply all the water drying out.'], dry: ['Loose dry ingredients', 'The dry sand, gravel and cement remain loose without water and processing.'], fresh: ['Fresh workable mixture', 'The fresh mixture needs setting and curing time before it becomes the hardened block.']},
          dough: {cooked: ['Cooked flatbread sample', 'Mixing and cooking produce a flatbread sample with properties different from the starting flour and water.'], mixed: ['Uncooked dough', 'Mixing makes dough, but this sample has not been cooked.'], rested: ['Still uncooked', 'Resting without cooking does not produce this cooked flatbread.']},
          jelly: {cooled: ['Soft gel; water remains inside', 'After sufficient cooling time, the prepared gelatine mixture has set into a soft gel that still contains water.'], powder: ['Dry powder', 'The dry powder has not been dissolved or processed into jelly.'], warm: ['Warm flowing mixture', 'The warm dissolved mixture has not yet cooled sufficiently to set.']}
        }[t.process];
        success = ({paste: 'mixed', plaster: 'set', concrete: 'cured', dough: 'cooked', jelly: 'cooled'})[t.process] === value;
        [metric, caption] = result[value]; break;
      }
      case 'g5-clay':
        success = value === 'glazed'; metric = success ? 'Rigid vessel; test water retained' : value === 'wet' ? 'Soft vessel changes shape' : 'Porous unglazed specimen';
        caption = success ? 'The fired ceramic vessel keeps its shape and its intact fired glaze retains the test water.' : value === 'wet' ? 'The wet clay vessel is soft and does not keep the required shape.' : 'This air-dried, unglazed clay specimen is porous and does not meet the water-holding brief.'; break;
      case 'g5-weave':
        success = value === 'woven'; metric = success ? 'Interlaced mat stays together' : 'Loose strips separate';
        caption = success ? 'The alternating over-and-under strips interlace into a mat that stays together during the gentle lift.' : 'These loose strips are not interlaced and separate during the same model lift.'; break;
      case 'g5-window':
        success = value !== 'wood'; metric = success ? 'Rigid and transparent' : 'Opaque: view blocked';
        caption = success ? `This clear ${value} specimen keeps its shape and lets the viewing symbol remain visible.` : 'The wood board keeps its shape but blocks the view.'; break;
      case 'g5-packing':
        success = value !== 'glass'; metric = success ? 'Lining cushions the model' : 'Unlined specimen fails this brief';
        caption = success ? 'The container holds the model and the soft lining cushions the same gentle jolt on the dry route.' : 'The unlined glass specimen does not cushion the fragile model during this test.'; break;
      default: return null;
    }
    return {valid: true, success, metric, caption, amount, state: ''};
  }
  return {tasks, missions, simulate};
});
