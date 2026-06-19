(() => {
  'use strict';

  const GAME_SLUG = 'science-lab-dash';
  const SAVE_KEY = 'wga_science_lab_dash_2_save';
  const BEST_KEY = 'wga_science_lab_dash_2_best';
  const CANVAS_W = 1600;
  const CANVAS_H = 900;

  const LEVELS = [
    {
      title: 'Lab Safety Training',
      zone: 'Safety Classroom Lab',
      concept: 'Safety symbols, goggles, gloves and careful lab behaviour.',
      principle: 'Safe science starts with identifying hazards and choosing the correct protective equipment before an investigation begins.',
      theme: 'cyan',
      bg: 'assets/backgrounds/bg-lab-safety.png',
      target: 8,
      questionsRequired: 2,
      difficulty: 1,
      badge: 'Safety',
      collectibles: ['goggles','gloves','coat','warning'],
      hazards: ['spill','glass'],
      enemies: ['slime'],
      questionSet: [
        ['Why do scientists wear goggles?', ['To protect eyes','To run faster','To hear better'], 0, 'Goggles protect eyes from splashes, dust and small particles.'],
        ['Which action is safest in a lab?', ['Taste a sample','Report spills quickly','Run between benches'], 1, 'Spills should be reported and cleaned using the correct procedure.'],
        ['What should you do before an experiment?', ['Read instructions','Guess quickly','Hide equipment'], 0, 'Reading instructions helps you understand risks and steps.']
      ]
    },
    {
      title: 'Scientific Method',
      zone: 'Investigation Hall',
      concept: 'Observation, hypothesis, fair test, results and conclusion.',
      principle: 'A fair test changes one variable at a time so results can be trusted.',
      theme: 'blue',
      bg: 'assets/backgrounds/bg-scientific-method.png',
      target: 10,
      questionsRequired: 2,
      difficulty: 1.15,
      badge: 'Method',
      collectibles: ['observe','hypothesis','measure','conclude'],
      hazards: ['badData','spill'],
      enemies: ['glitch'],
      questionSet: [
        ['A hypothesis is...', ['A testable idea','A final mark','A safety glove'], 0, 'A hypothesis is a possible explanation that can be tested.'],
        ['What makes a test fair?', ['Changing many things','Changing one variable','Ignoring results'], 1, 'Changing one variable helps show what caused the result.'],
        ['After collecting results, scientists...', ['Make conclusions','Throw data away','Stop thinking'], 0, 'A conclusion explains what the results show.']
      ]
    },
    {
      title: 'States of Matter',
      zone: 'Matter Lab',
      concept: 'Solids, liquids, gases, heating and cooling.',
      principle: 'Particles in solids vibrate in fixed positions, liquids flow, and gases spread out to fill space.',
      theme: 'green',
      bg: 'assets/backgrounds/bg-states-matter.png',
      target: 11,
      questionsRequired: 3,
      difficulty: 1.25,
      badge: 'Matter',
      collectibles: ['solid','liquid','gas','thermometer'],
      hazards: ['steam','freeze'],
      enemies: ['slime'],
      questionSet: [
        ['Which state has a fixed shape?', ['Gas','Liquid','Solid'], 2, 'Solids keep their shape because particles stay close together.'],
        ['Heating a liquid can make it...', ['Evaporate','Freeze','Disappear forever'], 0, 'Heating adds energy and can change liquid into gas.'],
        ['Gas particles are usually...', ['Far apart','Locked in rows','Always square'], 0, 'Gas particles are far apart and move freely.']
      ]
    },
    {
      title: 'Mixtures and Separation',
      zone: 'Separation Bench',
      concept: 'Filtering, sieving, evaporation and magnets.',
      principle: 'Different materials can be separated by using their properties, such as particle size, magnetism or boiling point.',
      theme: 'gold',
      bg: 'assets/backgrounds/bg-energy-lab.png',
      target: 12,
      questionsRequired: 3,
      difficulty: 1.35,
      badge: 'Chem',
      collectibles: ['filter','magnet','sieve','evaporate'],
      hazards: ['mixed','spill'],
      enemies: ['glitch'],
      questionSet: [
        ['A magnet is best for separating...', ['Iron filings','Salt water','Sand from sugar'], 0, 'Magnetic materials can be pulled out using a magnet.'],
        ['Filtering separates...', ['Insoluble solid from liquid','Two gases','Day from night'], 0, 'Filter paper traps insoluble solids while liquid passes through.'],
        ['Evaporation can recover...', ['Salt from salt water','Plastic from metal','A magnet from iron'], 0, 'Water evaporates and leaves dissolved salt behind.']
      ]
    },
    {
      title: 'Force Starter Lab',
      zone: 'Physics Motion Track',
      concept: 'Push, pull, gravity, friction and balanced forces.',
      principle: 'A force is a push or pull. Unbalanced forces change motion; balanced forces keep motion steady.',
      theme: 'cyan',
      bg: 'assets/backgrounds/bg-energy-lab.png',
      target: 13,
      questionsRequired: 3,
      difficulty: 1.45,
      badge: 'Physics',
      collectibles: ['force','arrow','mass','ramp'],
      hazards: ['friction','fall'],
      enemies: ['drone'],
      questionSet: [
        ['A force can...', ['Change motion','Remove gravity','Create oxygen'], 0, 'Forces can speed up, slow down or change the direction of motion.'],
        ['Friction usually...', ['Opposes motion','Makes everything float','Creates light only'], 0, 'Friction acts between surfaces and resists sliding.'],
        ['Gravity pulls objects...', ['Toward each other','Only sideways','Away from Earth'], 0, 'Gravity is an attractive force between masses.']
      ]
    },
    {
      title: 'Electricity Workshop',
      zone: 'Circuit Room',
      concept: 'Circuits, conductors, insulators, switches and bulbs.',
      principle: 'A complete circuit gives electric current a closed path to transfer energy.',
      theme: 'blue',
      bg: 'assets/backgrounds/bg-energy-lab.png',
      target: 14,
      questionsRequired: 3,
      difficulty: 1.55,
      badge: 'Circuit',
      collectibles: ['battery','wire','switch','bulb'],
      hazards: ['spark','short'],
      enemies: ['drone'],
      questionSet: [
        ['A bulb lights when the circuit is...', ['Complete','Open','Broken'], 0, 'Current needs a complete path to flow.'],
        ['Which material conducts electricity well?', ['Copper','Plastic','Rubber'], 0, 'Copper is a metal conductor.'],
        ['A switch can...', ['Open or close a circuit','Destroy gravity','Make paper organic'], 0, 'Switches control whether current can flow.']
      ]
    },
    {
      title: 'Light and Sound Lab',
      zone: 'Wave Tunnel',
      concept: 'Reflection, shadows, vibration, pitch and waves.',
      principle: 'Light travels in straight lines and sound is caused by vibrations moving through a medium.',
      theme: 'purple',
      bg: 'assets/backgrounds/bg-science-boss.png',
      target: 15,
      questionsRequired: 3,
      difficulty: 1.65,
      badge: 'Waves',
      collectibles: ['mirror','speaker','wave','shadow'],
      hazards: ['laser','noise'],
      enemies: ['glitch'],
      questionSet: [
        ['A shadow forms when light is...', ['Blocked','Eaten','Frozen'], 0, 'Opaque objects block light and create shadows.'],
        ['Sound is made by...', ['Vibrations','Still air only','Magnets only'], 0, 'Vibrating objects make sound waves.'],
        ['Pitch is linked to...', ['Frequency','Mass only','Colour only'], 0, 'Higher frequency usually means higher pitch.']
      ]
    },
    {
      title: 'Greenhouse Mission',
      zone: 'Biology Greenhouse',
      concept: 'Plants, photosynthesis, sunlight, water and carbon dioxide.',
      principle: 'Plants use light energy, water and carbon dioxide to make food and release oxygen.',
      theme: 'green',
      bg: 'assets/backgrounds/bg-ecosystem-web.png',
      target: 16,
      questionsRequired: 3,
      difficulty: 1.75,
      badge: 'Biology',
      collectibles: ['leaf','water','sun','oxygen'],
      hazards: ['drought','pest'],
      enemies: ['slime'],
      questionSet: [
        ['Photosynthesis needs...', ['Light, water and carbon dioxide','Only sand','Only darkness'], 0, 'Plants need light, water and carbon dioxide for photosynthesis.'],
        ['Plants release...', ['Oxygen','Plastic','Metal'], 0, 'Oxygen is released during photosynthesis.'],
        ['Roots usually absorb...', ['Water and minerals','Sunlight','Sound'], 0, 'Roots absorb water and dissolved minerals from soil.']
      ]
    },
    {
      title: 'Body Systems',
      zone: 'Human Science Lab',
      concept: 'Organs, breathing, circulation, digestion and muscles.',
      principle: 'Body systems work together to move materials, release energy and keep organisms alive.',
      theme: 'pink',
      bg: 'assets/backgrounds/bg-cell-biology.png',
      target: 17,
      questionsRequired: 3,
      difficulty: 1.85,
      badge: 'Body',
      collectibles: ['heart','lung','muscle','food'],
      hazards: ['germ','fatigue'],
      enemies: ['glitch'],
      questionSet: [
        ['The heart mainly...', ['Pumps blood','Digests food','Stores memories'], 0, 'The heart pumps blood around the body.'],
        ['Lungs help with...', ['Gas exchange','Making bones','Filtering sand'], 0, 'Lungs exchange oxygen and carbon dioxide.'],
        ['Muscles help the body...', ['Move','Photosynthesise','Become magnetic'], 0, 'Muscles contract to create movement.']
      ]
    },
    {
      title: 'Ecosystem Dome',
      zone: 'Food Web Habitat',
      concept: 'Producers, consumers, habitats and food chains.',
      principle: 'Energy flows through food chains from producers to consumers and decomposers recycle nutrients.',
      theme: 'green',
      bg: 'assets/backgrounds/bg-ecosystem-web.png',
      target: 18,
      questionsRequired: 3,
      difficulty: 1.95,
      badge: 'Eco',
      collectibles: ['producer','consumer','habitat','web'],
      hazards: ['pollution','invasive'],
      enemies: ['slime','drone'],
      questionSet: [
        ['A producer is usually...', ['A plant','A plastic bottle','A computer'], 0, 'Plants produce their own food using sunlight.'],
        ['A habitat is...', ['Where an organism lives','A type of wire','A pH number'], 0, 'A habitat provides shelter, food and conditions for life.'],
        ['Food chains show...', ['Energy flow','Only weather','Only planets'], 0, 'Food chains show how energy passes between organisms.']
      ]
    },
    {
      title: 'Atom Builder',
      zone: 'Atom Lab',
      concept: 'Atoms, elements, compounds and molecules.',
      principle: 'Matter is made of tiny particles. Atoms can join to form molecules and compounds.',
      theme: 'cyan',
      bg: 'assets/backgrounds/bg-cell-biology.png',
      target: 19,
      questionsRequired: 4,
      difficulty: 2.05,
      badge: 'Atoms',
      collectibles: ['proton','electron','atom','molecule'],
      hazards: ['unstable','spark'],
      enemies: ['glitch'],
      questionSet: [
        ['Atoms are...', ['Tiny particles of matter','Huge planets','Types of clouds'], 0, 'Atoms are very small units that make up matter.'],
        ['A molecule forms when atoms...', ['Join together','Disappear','Turn into sound'], 0, 'Atoms can bond together to form molecules.'],
        ['An element contains...', ['One type of atom','Only water','Only plastic'], 0, 'Each element has its own type of atom.']
      ]
    },
    {
      title: 'pH Chemistry Lab',
      zone: 'Acids and Bases',
      concept: 'pH scale, indicators, acids, neutral and bases.',
      principle: 'Indicators help classify substances as acidic, neutral or basic on the pH scale.',
      theme: 'pink',
      bg: 'assets/backgrounds/bg-states-matter.png',
      target: 20,
      questionsRequired: 4,
      difficulty: 2.15,
      badge: 'pH',
      collectibles: ['acid','base','indicator','neutral'],
      hazards: ['corrosive','spill'],
      enemies: ['slime'],
      questionSet: [
        ['pH 7 is usually...', ['Neutral','Strong acid','A magnet'], 0, 'Pure water is close to neutral pH 7.'],
        ['Indicators are useful because they...', ['Change colour','Make sound louder','Block gravity'], 0, 'Indicators change colour in different pH conditions.'],
        ['A base has pH...', ['Above 7','Always 1','Exactly 0'], 0, 'Bases usually have pH values above 7.']
      ]
    },
    {
      title: 'Earth Science Dome',
      zone: 'Rocks, Water and Erosion',
      concept: 'Rocks, soil, erosion, weathering and the water cycle.',
      principle: 'Earth systems are connected: water, rocks, atmosphere and living things shape the planet.',
      theme: 'gold',
      bg: 'assets/backgrounds/bg-earth-climate.png',
      target: 20,
      questionsRequired: 4,
      difficulty: 2.25,
      badge: 'Earth',
      collectibles: ['rock','soil','waterCycle','barrier'],
      hazards: ['erosion','flood'],
      enemies: ['drone'],
      questionSet: [
        ['Erosion means...', ['Movement of weathered material','Making a circuit','Plant breathing'], 0, 'Erosion moves rock and soil by water, wind or ice.'],
        ['The water cycle includes...', ['Evaporation and condensation','Only magnets','Only batteries'], 0, 'Water evaporates, condenses and falls as precipitation.'],
        ['Weathering breaks rocks...', ['Into smaller pieces','Into electricity','Into sound'], 0, 'Weathering is the breakdown of rocks at Earth’s surface.']
      ]
    },
    {
      title: 'Space Observatory',
      zone: 'Orbit Lab',
      concept: 'Planets, gravity, orbit, stars and moons.',
      principle: 'Gravity keeps planets, moons and satellites moving in curved paths called orbits.',
      theme: 'purple',
      bg: 'assets/backgrounds/bg-earth-climate.png',
      target: 21,
      questionsRequired: 4,
      difficulty: 2.35,
      badge: 'Space',
      collectibles: ['planet','moon','star','orbit'],
      hazards: ['meteor','gravityWell'],
      enemies: ['drone','glitch'],
      questionSet: [
        ['Orbits are caused by...', ['Gravity and motion','Plastic sorting','Photosynthesis only'], 0, 'Gravity pulls objects while their motion carries them forward.'],
        ['A moon orbits...', ['A planet','A beaker','A battery'], 0, 'Moons are natural satellites of planets.'],
        ['Stars produce...', ['Light and heat','Only soil','Only glass'], 0, 'Stars emit light and heat energy.']
      ]
    },
    {
      title: 'Climate and Energy',
      zone: 'Renewable Energy Park',
      concept: 'Weather, climate, renewable energy and sustainability.',
      principle: 'Energy choices affect the environment, and renewable systems can reduce pollution.',
      theme: 'green',
      bg: 'assets/backgrounds/bg-earth-climate.png',
      target: 22,
      questionsRequired: 4,
      difficulty: 2.45,
      badge: 'Climate',
      collectibles: ['solar','wind','hydro','carbon'],
      hazards: ['smog','heat'],
      enemies: ['slime','drone'],
      questionSet: [
        ['Solar panels use energy from...', ['Sunlight','Soil','Sound only'], 0, 'Solar panels convert sunlight into electrical energy.'],
        ['Climate describes...', ['Long-term weather patterns','One tiny moment','A single beaker'], 0, 'Climate is weather pattern data over long periods.'],
        ['Renewable energy includes...', ['Wind and solar','Coal only','Plastic only'], 0, 'Wind and solar are renewable sources.']
      ]
    },
    {
      title: 'Genetics Cell Lab',
      zone: 'DNA Research Room',
      concept: 'Cells, DNA, traits and microscopes.',
      principle: 'Cells are building blocks of living things, and DNA carries instructions for traits.',
      theme: 'cyan',
      bg: 'assets/backgrounds/bg-cell-biology.png',
      target: 22,
      questionsRequired: 4,
      difficulty: 2.55,
      badge: 'DNA',
      collectibles: ['cell','dna','trait','microscope'],
      hazards: ['virus','badSample'],
      enemies: ['glitch'],
      questionSet: [
        ['DNA carries...', ['Genetic instructions','Electric current only','Weather data only'], 0, 'DNA contains instructions linked to traits.'],
        ['Microscopes help us see...', ['Tiny objects','Only planets','Only sounds'], 0, 'Microscopes magnify small things like cells.'],
        ['Cells are...', ['Basic units of life','Types of rocks only','Toy robots'], 0, 'Cells are the basic unit of living organisms.']
      ]
    },
    {
      title: 'Robotics Lab',
      zone: 'Sensor Workshop',
      concept: 'Inputs, outputs, sensors, motors and simple automation.',
      principle: 'Robots use inputs from sensors, process information, and create outputs such as movement or sound.',
      theme: 'blue',
      bg: 'assets/backgrounds/bg-scientific-method.png',
      target: 23,
      questionsRequired: 4,
      difficulty: 2.65,
      badge: 'Robot',
      collectibles: ['sensor','motor','code','gear'],
      hazards: ['jam','spark'],
      enemies: ['drone','bot'],
      questionSet: [
        ['A sensor is an...', ['Input device','Food chain','Type of rock'], 0, 'Sensors collect information from the environment.'],
        ['A motor creates...', ['Movement','DNA','Evaporation'], 0, 'Motors convert energy into movement.'],
        ['Automation means...', ['A system does tasks with instructions','Guessing answers','Only using paper'], 0, 'Automated systems follow instructions to complete tasks.']
      ]
    },
    {
      title: 'Data Science Lab',
      zone: 'Graph Control Room',
      concept: 'Measurements, variables, graphs and patterns.',
      principle: 'Data helps scientists identify patterns and support evidence-based conclusions.',
      theme: 'purple',
      bg: 'assets/backgrounds/bg-scientific-method.png',
      target: 24,
      questionsRequired: 4,
      difficulty: 2.75,
      badge: 'Data',
      collectibles: ['graph','variable','trend','result'],
      hazards: ['badData','glitch'],
      enemies: ['glitch','drone'],
      questionSet: [
        ['A graph helps us...', ['See patterns','Make plants grow instantly','Avoid all maths'], 0, 'Graphs make patterns easier to understand.'],
        ['A variable is...', ['Something that can change','A fixed wall','Only a star'], 0, 'Variables are values or conditions that can change.'],
        ['Good conclusions use...', ['Evidence','Random guesses','Only speed'], 0, 'Scientific conclusions should be based on evidence.']
      ]
    },
    {
      title: 'Element Core Review',
      zone: 'Core Gateway',
      concept: 'Mixed science review across biology, chemistry, physics and Earth science.',
      principle: 'Science concepts connect: forces, energy, matter, life and data work together to explain the world.',
      theme: 'gold',
      bg: 'assets/backgrounds/bg-science-boss.png',
      target: 25,
      questionsRequired: 5,
      difficulty: 2.9,
      badge: 'Core',
      collectibles: ['core','review','formula','evidence'],
      hazards: ['unstable','spark','glitch'],
      enemies: ['drone','bot','glitch'],
      questionSet: [
        ['Evidence is important because it...', ['Supports conclusions','Removes all questions','Makes hazards safe'], 0, 'Evidence helps scientists justify explanations.'],
        ['Energy can be...', ['Transferred and transformed','Deleted forever','Only green'], 0, 'Energy changes form and moves between systems.'],
        ['A model helps scientists...', ['Represent ideas','Avoid testing','Hide data'], 0, 'Models simplify systems so they can be studied.']
      ]
    },
    {
      title: 'Final Boss: The Glitch Experiment',
      zone: 'Element Core Finale',
      concept: 'Final mixed challenge with all tools, questions and boss phases.',
      principle: 'A strong scientist combines curiosity, evidence, safety and problem-solving.',
      theme: 'pink',
      bg: 'assets/backgrounds/bg-science-boss.png',
      target: 26,
      questionsRequired: 5,
      difficulty: 3.1,
      badge: 'Master',
      boss: true,
      collectibles: ['core','atom','energy','life'],
      hazards: ['unstable','glitch','spark','badData'],
      enemies: ['bot','drone','glitch'],
      questionSet: [
        ['The best scientific answer is based on...', ['Evidence','Popularity','Fast clicking only'], 0, 'Science relies on evidence and careful reasoning.'],
        ['When a result is surprising, scientists should...', ['Investigate and repeat tests','Delete it','Ignore safety'], 0, 'Repeating tests improves confidence in results.'],
        ['The Element Core is restored by...', ['Correct evidence and problem-solving','Random guessing','Avoiding all questions'], 0, 'The final mission combines evidence, safety and scientific thinking.']
      ]
    }
  ];

  const THEME = {
    cyan: {a:'#42dfff', b:'#4dff9d', c:'#071426'},
    blue: {a:'#58a6ff', b:'#42dfff', c:'#07172d'},
    green: {a:'#4dff9d', b:'#ffd452', c:'#062617'},
    gold: {a:'#ffd452', b:'#ff9a3d', c:'#221706'},
    pink: {a:'#ff4fa2', b:'#42dfff', c:'#23071c'},
    purple: {a:'#a86cff', b:'#42dfff', c:'#150a2a'}
  };

  const BADGES = ['Safety','Method','Matter','Chem','Physics','Circuit','Waves','Biology','Body','Eco','Atoms','pH','Earth','Space','Climate','DNA','Robot','Data','Core','Master'];

  const EXTRA_QUESTION_BANK = {
    "Lab Safety Training": [
      [
        "A warning symbol tells you...",
        [
          "There may be a hazard",
          "The answer is finished",
          "The room is empty"
        ],
        0,
        "Warning symbols help scientists notice possible danger before they start."
      ],
      [
        "Broken glass should be handled by...",
        [
          "Following the lab clean-up rule",
          "Picking it up quickly with bare hands",
          "Leaving it on the floor"
        ],
        0,
        "Broken glass needs the correct clean-up method so nobody gets hurt."
      ],
      [
        "Before using chemicals you should check...",
        [
          "The label and instructions",
          "Only the colour",
          "Only the smell"
        ],
        0,
        "Labels and instructions explain risks and safe handling."
      ],
      [
        "A safe scientist moves...",
        [
          "Calmly and carefully",
          "As fast as possible",
          "With eyes closed"
        ],
        0,
        "Careful movement lowers the chance of spills, bumps and mistakes."
      ]
    ],
    "Scientific Method": [
      [
        "The variable you change on purpose is the...",
        [
          "Independent variable",
          "Conclusion",
          "Safety symbol"
        ],
        0,
        "The independent variable is changed to test its effect."
      ],
      [
        "A control variable should be...",
        [
          "Kept the same",
          "Changed every time",
          "Ignored"
        ],
        0,
        "Control variables are kept the same to make the test fair."
      ],
      [
        "Repeating an experiment helps make results...",
        [
          "More reliable",
          "Less useful",
          "Invisible"
        ],
        0,
        "Repeated trials help scientists check whether results are consistent."
      ],
      [
        "A good graph should have...",
        [
          "Clear labels",
          "No numbers",
          "Random axes"
        ],
        0,
        "Labels help people understand what the data means."
      ]
    ],
    "States of Matter": [
      [
        "Melting changes a solid into a...",
        [
          "Liquid",
          "Gas only",
          "New planet"
        ],
        0,
        "Melting happens when particles gain enough energy to move more freely."
      ],
      [
        "Condensation changes gas into...",
        [
          "Liquid",
          "Solid only",
          "Light"
        ],
        0,
        "Condensation happens when gas particles lose energy and come closer together."
      ],
      [
        "Liquid particles can...",
        [
          "Move past each other",
          "Never move",
          "Only orbit planets"
        ],
        0,
        "Liquid particles are close together but can flow."
      ],
      [
        "Cooling a liquid enough can cause...",
        [
          "Freezing",
          "Evaporation only",
          "Magnetism"
        ],
        0,
        "Cooling removes energy and can turn a liquid into a solid."
      ]
    ],
    "Mixtures and Separation": [
      [
        "Chromatography can separate...",
        [
          "Colours in ink",
          "Planets",
          "Sound waves"
        ],
        0,
        "Chromatography separates substances that move at different speeds."
      ],
      [
        "Sieving works because particles have different...",
        [
          "Sizes",
          "Opinions",
          "Temperatures only"
        ],
        0,
        "A sieve separates larger particles from smaller particles."
      ],
      [
        "Distillation uses differences in...",
        [
          "Boiling point",
          "Shape only",
          "Colour only"
        ],
        0,
        "Distillation separates liquids using boiling and condensation."
      ],
      [
        "A mixture is made of substances that are...",
        [
          "Physically combined",
          "Always new atoms",
          "Always alive"
        ],
        0,
        "Mixtures can often be separated using physical properties."
      ]
    ],
    "Force Starter Lab": [
      [
        "Balanced forces mean an object...",
        [
          "Keeps steady motion",
          "Must explode",
          "Loses mass"
        ],
        0,
        "Balanced forces do not change the object's motion."
      ],
      [
        "More mass usually means more force is needed to...",
        [
          "Change motion",
          "Make light",
          "Create water"
        ],
        0,
        "A larger mass usually needs more force for the same acceleration."
      ],
      [
        "A steeper ramp can make an object...",
        [
          "Speed up more",
          "Become a gas",
          "Turn into DNA"
        ],
        0,
        "A steeper ramp increases the component of gravity down the slope."
      ],
      [
        "When forces are unbalanced, motion can...",
        [
          "Change",
          "Never change",
          "Disappear"
        ],
        0,
        "Unbalanced forces can cause acceleration, slowing or direction changes."
      ]
    ],
    "Electricity Workshop": [
      [
        "An insulator...",
        [
          "Does not let current pass easily",
          "Always glows",
          "Stores food"
        ],
        0,
        "Insulators resist electric current."
      ],
      [
        "A battery provides...",
        [
          "Energy for a circuit",
          "A food web",
          "A microscope lens"
        ],
        0,
        "A battery supplies energy that drives current in a complete circuit."
      ],
      [
        "An open switch makes a circuit...",
        [
          "Incomplete",
          "Faster",
          "Magnetic only"
        ],
        0,
        "An open switch breaks the path, so current cannot flow."
      ],
      [
        "A series circuit has components...",
        [
          "On one path",
          "In separate oceans",
          "Only in stars"
        ],
        0,
        "In a series circuit current follows one path through all components."
      ]
    ],
    "Light and Sound Lab": [
      [
        "Reflection happens when light...",
        [
          "Bounces off a surface",
          "Turns into soil",
          "Stops existing"
        ],
        0,
        "Reflection is light bouncing from a surface."
      ],
      [
        "Transparent materials let light...",
        [
          "Pass through",
          "Always stop",
          "Become sound"
        ],
        0,
        "Transparent materials allow light to travel through them."
      ],
      [
        "A louder sound usually has greater...",
        [
          "Amplitude",
          "pH",
          "Mass only"
        ],
        0,
        "Sound amplitude is linked to loudness."
      ],
      [
        "Sound needs a...",
        [
          "Medium to travel through",
          "Battery only",
          "Plant root"
        ],
        0,
        "Sound travels through matter such as air, water or solids."
      ]
    ],
    "Greenhouse Mission": [
      [
        "Chlorophyll helps plants...",
        [
          "Absorb light",
          "Make metal",
          "Store electricity only"
        ],
        0,
        "Chlorophyll absorbs light energy for photosynthesis."
      ],
      [
        "Photosynthesis makes food called...",
        [
          "Glucose",
          "Plastic",
          "Copper"
        ],
        0,
        "Plants make glucose during photosynthesis."
      ],
      [
        "Tiny openings in leaves are called...",
        [
          "Stomata",
          "Motors",
          "Moons"
        ],
        0,
        "Stomata help gases move in and out of leaves."
      ],
      [
        "Carbon dioxide enters plants mainly through...",
        [
          "Leaves",
          "Wires",
          "Rocks"
        ],
        0,
        "Carbon dioxide usually enters through stomata in leaves."
      ]
    ],
    "Body Systems": [
      [
        "Digestion breaks food into...",
        [
          "Smaller useful substances",
          "Electric current",
          "Clouds"
        ],
        0,
        "Digestion breaks food into nutrients the body can use."
      ],
      [
        "Blood carries oxygen from the...",
        [
          "Lungs",
          "Soil",
          "Moon"
        ],
        0,
        "Blood transports oxygen from the lungs to body cells."
      ],
      [
        "The skeleton helps with...",
        [
          "Support and protection",
          "Photosynthesis",
          "Evaporation"
        ],
        0,
        "Bones support the body and protect organs."
      ],
      [
        "Exercise makes muscles need more...",
        [
          "Oxygen and energy",
          "Sand",
          "Plastic"
        ],
        0,
        "Working muscles need energy and oxygen."
      ]
    ],
    "Ecosystem Dome": [
      [
        "A consumer gets energy by...",
        [
          "Eating other organisms",
          "Making circuits",
          "Freezing water"
        ],
        0,
        "Consumers cannot make their own food and feed on other organisms."
      ],
      [
        "Decomposers help by...",
        [
          "Recycling nutrients",
          "Stopping gravity",
          "Making planets"
        ],
        0,
        "Decomposers break down dead matter and recycle nutrients."
      ],
      [
        "Removing one species can affect...",
        [
          "The whole food web",
          "Only the sky colour",
          "Nothing"
        ],
        0,
        "Food webs are connected, so changes can spread."
      ],
      [
        "A predator is an organism that...",
        [
          "Hunts other organisms",
          "Makes graphs only",
          "Has no habitat"
        ],
        0,
        "Predators get energy by hunting prey."
      ]
    ],
    "Atom Builder": [
      [
        "Electrons are found...",
        [
          "Around the nucleus",
          "Only in plants",
          "Inside clouds"
        ],
        0,
        "Electrons occupy regions around the nucleus."
      ],
      [
        "Protons are found in the...",
        [
          "Nucleus",
          "Beaker lid",
          "Leaf edge"
        ],
        0,
        "Protons are particles inside the atom's nucleus."
      ],
      [
        "A compound forms when...",
        [
          "Different elements join",
          "Data is deleted",
          "Water freezes only"
        ],
        0,
        "Compounds contain atoms of different elements bonded together."
      ],
      [
        "Chemical symbols help identify...",
        [
          "Elements",
          "Birds only",
          "Weather only"
        ],
        0,
        "Elements are represented by chemical symbols."
      ]
    ],
    "pH Chemistry Lab": [
      [
        "An acid usually has pH...",
        [
          "Below 7",
          "Always 14",
          "Exactly 100"
        ],
        0,
        "Acids usually have pH values below 7."
      ],
      [
        "Neutralisation happens when acid and base...",
        [
          "React to reduce acidity/basicity",
          "Become stars",
          "Ignore each other"
        ],
        0,
        "Neutralisation can form salt and water."
      ],
      [
        "Universal indicator shows pH by changing...",
        [
          "Colour",
          "Mass",
          "Gravity"
        ],
        0,
        "Universal indicator changes colour across the pH scale."
      ],
      [
        "A strong base has pH closer to...",
        [
          "14",
          "7 only",
          "0 always"
        ],
        0,
        "Strong bases are found toward the high end of the pH scale."
      ]
    ],
    "Earth Science Dome": [
      [
        "Sediment is...",
        [
          "Small pieces of rock or soil",
          "A battery",
          "A food chain"
        ],
        0,
        "Sediment can be moved by water, wind or ice."
      ],
      [
        "Runoff is water that...",
        [
          "Flows over land",
          "Only becomes stars",
          "Never moves"
        ],
        0,
        "Runoff can carry soil and pollutants into rivers."
      ],
      [
        "Condensation in the water cycle forms...",
        [
          "Cloud droplets",
          "Metal wires",
          "DNA"
        ],
        0,
        "Water vapour cools and condenses into tiny droplets."
      ],
      [
        "Plant roots can help reduce...",
        [
          "Erosion",
          "Orbit",
          "Voltage"
        ],
        0,
        "Roots hold soil and reduce erosion."
      ]
    ],
    "Space Observatory": [
      [
        "A satellite is an object that...",
        [
          "Orbits another object",
          "Filters water",
          "Digests food"
        ],
        0,
        "Natural or artificial satellites orbit planets or other bodies."
      ],
      [
        "Day and night are caused mainly by...",
        [
          "Earth's rotation",
          "Photosynthesis",
          "Filtration"
        ],
        0,
        "Earth rotates, causing different sides to face the Sun."
      ],
      [
        "Gravity is stronger when objects are...",
        [
          "Closer together",
          "Labelled blue",
          "Made of paper only"
        ],
        0,
        "Gravity gets stronger as distance decreases."
      ],
      [
        "A planet moves in orbit because it has...",
        [
          "Forward motion and gravity",
          "Only pH",
          "Only friction"
        ],
        0,
        "Orbital motion combines forward motion with gravitational pull."
      ]
    ],
    "Climate and Energy": [
      [
        "Weather is different from climate because weather is...",
        [
          "Short-term conditions",
          "Always 100 years",
          "A type of circuit"
        ],
        0,
        "Weather describes current or short-term atmospheric conditions."
      ],
      [
        "Carbon dioxide can trap...",
        [
          "Heat in the atmosphere",
          "Only magnets",
          "Only sound"
        ],
        0,
        "Carbon dioxide is a greenhouse gas that helps trap heat."
      ],
      [
        "Wind turbines convert wind energy into...",
        [
          "Electrical energy",
          "DNA",
          "Soil"
        ],
        0,
        "Wind turbines use moving air to generate electricity."
      ],
      [
        "Reducing pollution helps protect...",
        [
          "Air, water and ecosystems",
          "Only video games",
          "Only metal"
        ],
        0,
        "Pollution control helps living things and environments."
      ]
    ],
    "Genetics Cell Lab": [
      [
        "Genes are sections of...",
        [
          "DNA",
          "Glass",
          "Coal"
        ],
        0,
        "Genes are parts of DNA linked to traits."
      ],
      [
        "A trait is...",
        [
          "A feature of an organism",
          "A kind of beaker",
          "A circuit path"
        ],
        0,
        "Traits are characteristics such as eye colour or plant height."
      ],
      [
        "Chromosomes contain...",
        [
          "DNA",
          "Sand only",
          "Sound only"
        ],
        0,
        "Chromosomes are structures that carry DNA."
      ],
      [
        "A microscope uses lenses to...",
        [
          "Magnify small objects",
          "Create gravity",
          "Make food"
        ],
        0,
        "Lenses magnify tiny structures such as cells."
      ]
    ],
    "Robotics Lab": [
      [
        "An output device could be a...",
        [
          "Motor or light",
          "Rock layer",
          "Food chain"
        ],
        0,
        "Outputs are actions or signals a robot produces."
      ],
      [
        "An algorithm is...",
        [
          "Step-by-step instructions",
          "A plant root",
          "A moon"
        ],
        0,
        "Algorithms tell computers or robots what steps to follow."
      ],
      [
        "Feedback helps robots...",
        [
          "Adjust behaviour",
          "Avoid all sensors",
          "Become liquid"
        ],
        0,
        "Feedback lets a system respond to changing conditions."
      ],
      [
        "A robot uses code to...",
        [
          "Control actions",
          "Make weather",
          "Form rocks"
        ],
        0,
        "Code gives instructions to hardware and software."
      ]
    ],
    "Data Science Lab": [
      [
        "An outlier is a result that...",
        [
          "Does not fit the pattern",
          "Is always correct",
          "Means no conclusion"
        ],
        0,
        "Outliers should be checked because they may show error or unusual behaviour."
      ],
      [
        "A line graph is useful for showing...",
        [
          "Change over time",
          "Only animal names",
          "Only safety rules"
        ],
        0,
        "Line graphs can show trends across time or ordered values."
      ],
      [
        "A data table helps scientists...",
        [
          "Organise results",
          "Avoid measuring",
          "Stop variables"
        ],
        0,
        "Tables organise measurements before analysis."
      ],
      [
        "Evidence is stronger when data is...",
        [
          "Accurate and repeated",
          "Hidden",
          "Random"
        ],
        0,
        "Reliable evidence comes from careful, repeated measurements."
      ]
    ],
    "Element Core Review": [
      [
        "A scientific model is useful because it...",
        [
          "Represents complex ideas",
          "Replaces all evidence",
          "Stops questions"
        ],
        0,
        "Models help explain and test ideas about systems."
      ],
      [
        "Energy transfer means energy...",
        [
          "Moves from one object or system to another",
          "Vanishes forever",
          "Only becomes plastic"
        ],
        0,
        "Energy can transfer by heating, electricity, motion and other processes."
      ],
      [
        "Good science combines...",
        [
          "Evidence, safety and reasoning",
          "Guessing and speed",
          "Ignoring results"
        ],
        0,
        "Strong investigations use evidence, safety and logical thinking."
      ],
      [
        "A system is a group of parts that...",
        [
          "Work together",
          "Never interact",
          "Only float"
        ],
        0,
        "Systems have connected parts that influence each other."
      ]
    ],
    "Final Boss: The Glitch Experiment": [
      [
        "When tests disagree, scientists should...",
        [
          "Check methods and repeat",
          "Pick the fastest answer",
          "Ignore safety"
        ],
        0,
        "Repeating and checking methods improves confidence."
      ],
      [
        "A final conclusion should match...",
        [
          "The evidence",
          "The loudest person",
          "The brightest colour"
        ],
        0,
        "Conclusions should be supported by evidence."
      ],
      [
        "Science helps solve problems by using...",
        [
          "Questions, tests and evidence",
          "Random guessing",
          "Hidden data"
        ],
        0,
        "Science uses careful investigation to solve problems."
      ],
      [
        "The best lab strategy is...",
        [
          "Stay safe, collect evidence, then explain",
          "Rush and guess",
          "Avoid all observations"
        ],
        0,
        "Safe investigation and evidence-based explanations are core science skills."
      ]
    ]
  };


  // Longer, harder campaign tuning.
  // Each level now requires more evidence, more questions, a minimum mission time,
  // stronger bosses, faster projectile pressure, and a larger question pool.
  LEVELS.forEach((lv, i) => {
    const chapter = i + 1;
    const extraQuestions = EXTRA_QUESTION_BANK[lv.title] || [];
    lv.questionSet = lv.questionSet.concat(extraQuestions);
    lv.target = Math.round(lv.target * 1.55 + 8 + i * 1.45);
    lv.questionsRequired = Math.min(lv.questionSet.length, Math.max(lv.questionsRequired + 2, Math.ceil(3.5 + i / 4)));
    lv.minMissionSeconds = Math.round(44 + i * 3.8);
    lv.difficulty = Number((lv.difficulty + 0.22 + i * 0.035).toFixed(2));
    lv.bossHpBonus = Math.round(45 + chapter * 9 + lv.target * 1.25);
    lv.enemyFireRate = Math.max(0.56, 1.42 - lv.difficulty * 0.12);
    lv.spawnFloor = Math.max(0.22, 0.42 - i * 0.006);
  });


  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const els = {
    hudLevel: document.getElementById('hudLevel'),
    hudScore: document.getElementById('hudScore'),
    hudLives: document.getElementById('hudLives'),
    hudStars: document.getElementById('hudStars'),
    missionTitle: document.getElementById('missionTitle'),
    missionConcept: document.getElementById('missionConcept'),
    missionProgress: document.getElementById('missionProgress'),
    questionProgress: document.getElementById('questionProgress'),
    bossProgress: document.getElementById('bossProgress'),
    missionMeter: document.getElementById('missionMeter'),
    questionMeter: document.getElementById('questionMeter'),
    bossMeter: document.getElementById('bossMeter'),
    mentorText: document.getElementById('mentorText'),
    mentorMood: document.getElementById('mentorMood'),
    badgeGrid: document.getElementById('badgeGrid'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayText: document.getElementById('overlayText'),
    overlayPrimary: document.getElementById('overlayPrimary'),
    overlaySecondary: document.getElementById('overlaySecondary'),
    mapGrid: document.getElementById('mapGrid'),
    questionModal: document.getElementById('questionModal'),
    questionTitle: document.getElementById('questionTitle'),
    questionText: document.getElementById('questionText'),
    answerGrid: document.getElementById('answerGrid'),
    questionFeedback: document.getElementById('questionFeedback'),
    btnStart: document.getElementById('btnStart'),
    btnMap: document.getElementById('btnMap'),
    btnMusic: document.getElementById('btnMusic'),
    btnReset: document.getElementById('btnReset'),
    btnLaneUp: document.getElementById('btnLaneUp'),
    btnLaneDown: document.getElementById('btnLaneDown'),
    btnShoot: document.getElementById('btnShoot'),
    btnShield: document.getElementById('btnShield')
  };

  const images = new Map();
  function loadImage(src){
    if(images.has(src)) return images.get(src);
    const img = new Image();
    img.src = src;
    images.set(src, img);
    return img;
  }
  LEVELS.forEach(level => loadImage(level.bg));
  const spritePaths = {
    scientist: 'assets/sprites/scientist-runner.png',
    beaker: 'assets/sprites/item-beaker.png',
    goggles: 'assets/sprites/item-goggles.png',
    gloves: 'assets/sprites/item-gloves.png',
    solid: 'assets/sprites/item-solid.png',
    liquid: 'assets/sprites/item-liquid.png',
    gas: 'assets/sprites/item-gas.png',
    cell: 'assets/sprites/item-cell.png',
    dna: 'assets/sprites/item-dna.png',
    ecosystem: 'assets/sprites/item-ecosystem.png',
    energy: 'assets/sprites/item-energy.png',
    climate: 'assets/sprites/item-climate.png',
    hazard: 'assets/sprites/item-hazard.png',
    method: 'assets/sprites/item-method.png'
  };
  Object.values(spritePaths).forEach(loadImage);

  let audioCtx = null;
  let musicTimer = null;
  let muted = false;

  const save = loadSave();
  let game = resetRuntime();

  function resetRuntime(){
    return {
      mode: 'menu',
      levelIndex: Math.min(save.unlocked || 0, LEVELS.length - 1),
      score: save.score || 0,
      best: readBest(),
      stars: save.stars || 0,
      lives: 3,
      combo: 0,
      xp: save.xp || 0,
      completed: save.completed || {},
      unlocked: save.unlocked || 0,
      badges: save.badges || {},
      objects: [],
      shots: [],
      enemyShots: [],
      particles: [],
      floatText: [],
      player: {x:190, lane:1, targetLane:1, y:0, radius:42, shield:0, slow:0, magnet:0, double:0, shootCd:0, inv:0},
      levelTime: 0,
      spawnTimer: 0,
      questionTimer: 0,
      lessonTimer: 0,
      progress: 0,
      questionsAnswered: 0,
      bossHealth: 0,
      bossMax: 0,
      bossActive: false,
      bossAttackTimer: 0,
      phase: 1,
      pausedForQuestion: false,
      pendingQuestion: null,
      explanationIndex: 0,
      lastTime: performance.now(),
      shake: 0,
      levelClearTimer: 0,
      messageTimer: 0,
      pressurePulse: 0
    };
  }

  function readBest(){
    try { return Number(localStorage.getItem(BEST_KEY) || 0); } catch { return 0; }
  }
  function writeBest(value){
    try { localStorage.setItem(BEST_KEY, String(value)); } catch {}
  }
  function loadSave(){
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  function writeSave(){
    const payload = {
      score: game.score,
      stars: game.stars,
      xp: game.xp,
      unlocked: Math.max(game.unlocked, game.levelIndex),
      completed: game.completed,
      badges: game.badges
    };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(payload)); } catch {}
  }

  function postScore(final=false){
    const level = LEVELS[game.levelIndex] || LEVELS[0];
    const payload = {
      slug: GAME_SLUG,
      score: Math.round(game.score),
      level: game.levelIndex + 1,
      title: level.title,
      stars: game.stars,
      final
    };
    try {
      window.parent?.postMessage({ type:'GG_SCORE', ...payload }, '*');
      window.parent?.postMessage({ type:'gg:score', ...payload }, '*');
    } catch {}
  }

  function startAudio(){
    if(muted) return;
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    startMusic();
  }
  function tone(freq, dur=0.12, type='sine', gain=0.055, delay=0){
    if(muted || !audioCtx) return;
    const t = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp); amp.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + dur + 0.02);
  }
  function sfx(name){
    if(muted) return;
    startAudio();
    if(name === 'collect') { tone(660, .07, 'triangle', .045); tone(990, .08, 'triangle', .03, .04); }
    if(name === 'hurt') { tone(120, .22, 'sawtooth', .055); tone(90, .16, 'square', .025, .06); }
    if(name === 'shoot') { tone(740, .05, 'square', .038); tone(1180, .06, 'triangle', .024, .03); }
    if(name === 'correct') { tone(620, .08, 'triangle', .04); tone(780, .09, 'triangle', .04, .07); tone(1040, .12, 'triangle', .035, .14); }
    if(name === 'wrong') { tone(210, .12, 'sawtooth', .04); tone(150, .14, 'sawtooth', .03, .08); }
    if(name === 'level') { tone(392, .1, 'triangle', .045); tone(523, .11, 'triangle', .045, .1); tone(784, .16, 'triangle', .045, .2); }
    if(name === 'boss') { tone(70, .4, 'sawtooth', .06); tone(140, .2, 'square', .04, .08); }
    if(name === 'power') { tone(500, .08, 'sine', .04); tone(1000, .13, 'sine', .035, .06); }
  }
  function startMusic(){
    if(muted || !audioCtx) return;
    stopMusic();
    const level = LEVELS[game.levelIndex] || LEVELS[0];
    const themeNotes = {
      cyan: [262,330,392,523],
      blue: [220,294,370,440],
      green: [247,330,392,494],
      gold: [196,247,330,392],
      pink: [208,277,415,554],
      purple: [196,262,311,392]
    }[level.theme] || [262,330,392,523];
    let step = 0;
    musicTimer = setInterval(() => {
      if(game.mode !== 'play' || game.pausedForQuestion) return;
      const intensity = 1 + Math.min(2, game.combo / 8);
      const note = themeNotes[step % themeNotes.length];
      tone(note / 2, .12, 'sine', .012 * intensity);
      if(step % 2 === 0) tone(note, .09, 'triangle', .01 * intensity, .02);
      if(game.combo >= 6 && step % 4 === 0) tone(note * 1.5, .08, 'sine', .009, .05);
      step++;
    }, 240);
  }
  function stopMusic(){
    if(musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  function level(){
    return LEVELS[game.levelIndex] || LEVELS[0];
  }
  function theme(){
    return THEME[level().theme] || THEME.cyan;
  }
  function laneY(lane){
    return [CANVAS_H * .38, CANVAS_H * .56, CANVAS_H * .74][lane] || CANVAS_H * .56;
  }

  function setMentor(text, mood='🧪'){
    els.mentorText.textContent = text;
    els.mentorMood.textContent = mood;
  }

  function initBadges(){
    els.badgeGrid.innerHTML = '';
    BADGES.forEach((name, i) => {
      const d = document.createElement('div');
      d.className = 'badge' + (game.badges[name] ? ' unlocked' : '');
      d.title = name;
      d.textContent = name[0];
      els.badgeGrid.appendChild(d);
    });
  }

  function buildMap(){
    els.mapGrid.innerHTML = '';
    LEVELS.forEach((lv, i) => {
      const node = document.createElement('button');
      const unlocked = i <= game.unlocked;
      const complete = !!game.completed[i];
      node.className = 'map-node ' + (unlocked ? 'unlocked ' : 'locked ') + (complete ? 'complete' : '');
      node.innerHTML = `<b>${i + 1}. ${escapeHtml(lv.title)}</b><span>${complete ? 'Complete' : unlocked ? lv.concept : 'Locked'}</span>`;
      node.disabled = !unlocked;
      node.addEventListener('click', () => {
        if(!unlocked) return;
        game.levelIndex = i;
        hideOverlay();
        startLevel();
      });
      els.mapGrid.appendChild(node);
    });
  }

  function escapeHtml(text){
    return String(text).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function showOverlay(title, text, primaryText='Start Mission'){
    game.mode = game.mode === 'play' ? 'paused' : game.mode;
    els.overlayTitle.textContent = title;
    els.overlayText.textContent = text;
    els.overlayPrimary.textContent = primaryText;
    buildMap();
    els.overlay.classList.add('active');
  }
  function hideOverlay(){
    els.overlay.classList.remove('active');
  }

  function startLevel(){
    startAudio();
    const lv = level();
    game.mode = 'play';
    game.objects = [];
    game.shots = [];
    game.enemyShots = [];
    game.particles = [];
    game.floatText = [];
    game.lives = 3;
    game.combo = 0;
    game.levelTime = 0;
    game.spawnTimer = 0.35;
    game.questionTimer = 3.2;
    game.lessonTimer = 6.0;
    game.progress = 0;
    game.questionsAnswered = 0;
    game.bossActive = false;
    game.bossMax = (lv.boss ? 260 : 125) + lv.bossHpBonus + lv.difficulty * 26;
    game.bossHealth = game.bossMax;
    game.bossAttackTimer = 3.5;
    game.phase = 1;
    game.explanationIndex = 0;
    game.pressurePulse = 0;
    game.player = {x:190, lane:1, targetLane:1, y:laneY(1), radius:42, shield:0, slow:0, magnet:0, double:0, shootCd:0, inv:0};
    setMentor(`Mission ${game.levelIndex + 1}: ${lv.principle} Collect ${lv.target} evidence items, answer ${lv.questionsRequired} science challenges, survive the full lab run, then defeat the boss.`, '🔬');
    startMusic();
    sfx('level');
    syncUI();
  }

  function completeLevel(){
    const lv = level();
    game.mode = 'levelClear';
    game.completed[game.levelIndex] = true;
    game.badges[lv.badge] = true;
    game.unlocked = Math.max(game.unlocked, Math.min(LEVELS.length - 1, game.levelIndex + 1));
    const bonus = game.lives * 80 + game.combo * 15;
    game.score += bonus;
    game.stars += Math.max(1, Math.min(3, Math.ceil((game.progress / lv.target + game.questionsAnswered / lv.questionsRequired + Math.min(1, game.levelTime / lv.minMissionSeconds) + game.lives / 3) / 1.75)));
    if(game.score > game.best){ game.best = game.score; writeBest(game.best); }
    writeSave();
    postScore(game.levelIndex === LEVELS.length - 1);
    sfx('level');
    setMentor(`Excellent! ${lv.principle}`, '🏅');
    syncUI();
    if(game.levelIndex >= LEVELS.length - 1){
      showOverlay('Academy Restored!', 'The Element Core is stable again. You completed the full science adventure and unlocked Loop Lab review mode.', 'Play Again');
    } else {
      showOverlay('Mission Complete', `${lv.title} cleared. Badge earned: ${lv.badge}. Next mission unlocked.`, 'Next Mission');
    }
  }

  function failLevel(){
    game.mode = 'gameOver';
    game.combo = 0;
    sfx('hurt');
    setMentor('Circuit rebooted. Try the same mission again — scientists improve through careful repeats.', '⚠️');
    showOverlay('Circuit Reboot', 'You ran out of lives. This version uses checkpoints, so you retry the current mission instead of restarting the whole campaign.', 'Retry Mission');
  }

  function spawnObject(){
    const lv = level();
    const progressPressure = Math.min(1.25, game.progress / Math.max(1, lv.target));
    const timePressure = Math.min(1.1, game.levelTime / Math.max(1, lv.minMissionSeconds));
    const r = Math.random();

    const questionDue = game.questionsAnswered < lv.questionsRequired && game.questionTimer <= 0;
    const hazardChance = Math.min(.34, .15 + lv.difficulty * .026 + progressPressure * .08);
    const enemyChance = Math.min(.28, .10 + lv.difficulty * .021 + timePressure * .07);
    const powerChance = Math.max(.035, .095 - lv.difficulty * .012);

    let kind = 'collect';
    if(questionDue) kind = 'question';
    else if(r < hazardChance) kind = 'hazard';
    else if(r < hazardChance + enemyChance) kind = 'enemy';
    else if(r < hazardChance + enemyChance + powerChance) kind = 'power';
    else if(r > .986 && game.questionsAnswered < lv.questionsRequired) kind = 'question';

    // During boss pressure, add more threats but still leave collectible windows.
    if(game.bossActive && Math.random() < .24) kind = Math.random() < .66 ? 'hazard' : 'enemy';

    const lane = Math.floor(Math.random() * 3);
    const t = theme();
    const speedBoost = Math.min(90, game.levelTime * 0.55) + progressPressure * 70;
    const obj = {
      kind,
      lane,
      x: CANVAS_W + 90,
      y: laneY(lane),
      vx: 300 + lv.difficulty * 58 + speedBoost + Math.random() * 105,
      radius: kind === 'enemy' ? 50 : kind === 'hazard' ? 38 : 35,
      age: 0,
      color: t.a,
      label: '',
      id: '',
      hp: kind === 'enemy' ? (2 + Math.floor(lv.difficulty / 1.05) + Math.floor(progressPressure * 2)) : 1,
      shoot: lv.enemyFireRate + Math.random() * 0.8
    };

    if(kind === 'collect'){
      obj.id = choose(lv.collectibles);
      obj.label = labelFor(obj.id);
      obj.sprite = spriteFor(obj.id);
    } else if(kind === 'hazard'){
      obj.id = choose(lv.hazards);
      obj.label = labelFor(obj.id);
      obj.color = '#ff5f78';
      obj.sprite = spritePaths.hazard;
    } else if(kind === 'enemy'){
      obj.id = choose(lv.enemies);
      obj.label = labelFor(obj.id);
      obj.color = obj.id === 'drone' ? '#a86cff' : '#ff4fa2';
    } else if(kind === 'power'){
      obj.id = choose(['shield','slow','magnet','double']);
      obj.label = labelFor(obj.id);
      obj.color = obj.id === 'shield' ? '#42dfff' : obj.id === 'double' ? '#ffd452' : '#4dff9d';
    } else if(kind === 'question'){
      obj.id = 'quiz';
      obj.label = 'Puzzle';
      obj.color = '#ffd452';
      game.questionTimer = Math.max(5.2, 9.8 - lv.difficulty * .45);
    }
    game.objects.push(obj);
  }

  function choose(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
  function labelFor(id){
    const map = {
      goggles:'Goggles', gloves:'Gloves', coat:'Coat', warning:'Safety',
      observe:'Observe', hypothesis:'Hypothesis', measure:'Measure', conclude:'Conclude',
      solid:'Solid', liquid:'Liquid', gas:'Gas', thermometer:'Temp',
      filter:'Filter', magnet:'Magnet', sieve:'Sieve', evaporate:'Evaporate',
      force:'Force', arrow:'Vector', mass:'Mass', ramp:'Ramp',
      battery:'Battery', wire:'Wire', switch:'Switch', bulb:'Bulb',
      mirror:'Mirror', speaker:'Sound', wave:'Wave', shadow:'Shadow',
      leaf:'Leaf', water:'Water', sun:'Sun', oxygen:'O₂',
      heart:'Heart', lung:'Lung', muscle:'Muscle', food:'Food',
      producer:'Producer', consumer:'Consumer', habitat:'Habitat', web:'Food web',
      proton:'Proton', electron:'Electron', atom:'Atom', molecule:'Molecule',
      acid:'Acid', base:'Base', indicator:'Indicator', neutral:'Neutral',
      rock:'Rock', soil:'Soil', waterCycle:'Cycle', barrier:'Barrier',
      planet:'Planet', moon:'Moon', star:'Star', orbit:'Orbit',
      solar:'Solar', wind:'Wind', hydro:'Hydro', carbon:'Carbon',
      cell:'Cell', dna:'DNA', trait:'Trait', microscope:'Scope',
      sensor:'Sensor', motor:'Motor', code:'Code', gear:'Gear',
      graph:'Graph', variable:'Variable', trend:'Trend', result:'Result',
      core:'Core', review:'Review', formula:'Formula', evidence:'Evidence',
      energy:'Energy', life:'Life',
      spill:'Spill', glass:'Glass', badData:'Bad data', steam:'Steam', freeze:'Freeze',
      mixed:'Mixed', friction:'Friction', fall:'Gravity', spark:'Spark', short:'Short',
      laser:'Laser', noise:'Noise', drought:'Drought', pest:'Pest', germ:'Germ', fatigue:'Fatigue',
      pollution:'Pollution', invasive:'Invasive', unstable:'Unstable', corrosive:'Corrosive',
      erosion:'Erosion', flood:'Flood', meteor:'Meteor', gravityWell:'Gravity',
      smog:'Smog', heat:'Heat', virus:'Virus', badSample:'Bad sample', jam:'Jam', glitch:'Glitch',
      slime:'Slime', drone:'Drone', bot:'Lab bot',
      shield:'Shield', slow:'Slow-mo', double:'x2', quiz:'Question'
    };
    return map[id] || id;
  }
  function spriteFor(id){
    const map = {
      goggles: spritePaths.goggles, gloves: spritePaths.gloves, beaker: spritePaths.beaker,
      solid: spritePaths.solid, liquid: spritePaths.liquid, gas: spritePaths.gas,
      cell: spritePaths.cell, dna: spritePaths.dna, ecosystem: spritePaths.ecosystem,
      energy: spritePaths.energy, climate: spritePaths.climate, method: spritePaths.method
    };
    return map[id] || null;
  }

  function shoot(){
    if(game.mode !== 'play' || game.pausedForQuestion) return;
    if(game.player.shootCd > 0) return;
    game.player.shootCd = 0.28;
    game.shots.push({
      x: game.player.x + 55,
      y: game.player.y,
      vx: 860,
      radius: 12,
      color: theme().a,
      life: 1.8
    });
    sfx('shoot');
  }

  function useShield(){
    if(game.mode !== 'play') return;
    if(game.player.shield <= 0){
      game.player.shield = 4.5;
      addText(game.player.x, game.player.y - 75, 'Shield on', '#42dfff');
      sfx('power');
    }
  }

  function askQuestion(){
    if(game.pausedForQuestion) return;
    const lv = level();
    const q = choose(lv.questionSet);
    game.pausedForQuestion = true;
    game.pendingQuestion = q;
    els.questionTitle.textContent = lv.title;
    els.questionText.textContent = q[0];
    els.questionFeedback.textContent = '';
    els.answerGrid.innerHTML = '';
    q[1].forEach((answer, i) => {
      const b = document.createElement('button');
      b.className = 'answer-btn';
      b.textContent = answer;
      b.addEventListener('click', () => answerQuestion(i, b));
      els.answerGrid.appendChild(b);
    });
    els.questionModal.classList.add('active');
  }

  function answerQuestion(index, btn){
    const q = game.pendingQuestion;
    if(!q) return;
    const correct = index === q[2];
    Array.from(els.answerGrid.children).forEach((child, i) => {
      child.disabled = true;
      if(i === q[2]) child.classList.add('correct');
      else if(i === index) child.classList.add('wrong');
    });
    if(correct){
      game.questionsAnswered++;
      game.score += 160 + game.combo * 12;
      game.combo++;
      addText(game.player.x + 80, game.player.y - 80, '+ science answer', '#4dff9d');
      els.questionFeedback.textContent = q[3];
      setMentor(q[3], '✅');
      sfx('correct');
    } else {
      loseLife();
      els.questionFeedback.textContent = `Not quite. ${q[3]}`;
      setMentor(`Not quite. ${q[3]}`, '💡');
      sfx('wrong');
    }
    setTimeout(() => {
      els.questionModal.classList.remove('active');
      game.pausedForQuestion = false;
      game.pendingQuestion = null;
      syncUI();
    }, 1300);
  }

  function loseLife(){
    if(game.player.inv > 0) return;
    if(game.player.shield > 0){
      game.player.shield = 0;
      addText(game.player.x, game.player.y - 85, 'Shield saved you', '#42dfff');
      return;
    }
    game.lives--;
    game.combo = 0;
    game.player.inv = 1.2;
    game.shake = 12;
    sfx('hurt');
    if(game.lives <= 0) failLevel();
  }

  function collide(a,b){
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.hypot(dx,dy) < (a.radius + b.radius);
  }


  function showProgressLesson(){
    const lv = level();
    const checkpoints = [.22, .45, .68, .86];
    const pct = game.progress / Math.max(1, lv.target);
    if(game.explanationIndex < checkpoints.length && pct >= checkpoints[game.explanationIndex]){
      const lessonNumber = game.explanationIndex + 1;
      const messages = [
        `Checkpoint ${lessonNumber}: ${lv.principle}`,
        `Puzzle tip: ${lv.concept} Look for the correct evidence while avoiding hazards.`,
        `Challenge rising: enemies now fire faster. Use lane changes, shield and lab bursts.`,
        `Final checkpoint: finish the remaining evidence, answer the questions, then clear the boss anomaly.`
      ];
      setMentor(messages[game.explanationIndex] || lv.principle, lessonNumber === 3 ? '⚡' : '💡');
      game.explanationIndex++;
    }
  }

  function update(dt){
    if(game.mode !== 'play' || game.pausedForQuestion) return;
    const lv = level();
    const slowFactor = game.player.slow > 0 ? 0.52 : 1;
    game.levelTime += dt;
    game.spawnTimer -= dt;
    game.questionTimer -= dt;
    game.lessonTimer -= dt;
    game.pressurePulse = Math.min(1, game.levelTime / Math.max(1, lv.minMissionSeconds));
    game.player.y += (laneY(game.player.targetLane) - game.player.y) * Math.min(1, dt * 10);
    game.player.shootCd = Math.max(0, game.player.shootCd - dt);
    game.player.inv = Math.max(0, game.player.inv - dt);
    game.player.shield = Math.max(0, game.player.shield - dt);
    game.player.slow = Math.max(0, game.player.slow - dt);
    game.player.magnet = Math.max(0, game.player.magnet - dt);
    game.player.double = Math.max(0, game.player.double - dt);
    game.shake = Math.max(0, game.shake - dt * 18);

    if(game.spawnTimer <= 0){
      spawnObject();
      game.spawnTimer = Math.max(lv.spawnFloor, .92 - lv.difficulty * .075 - Math.min(.25, game.levelTime / 150));
    }

    const missionReady = game.progress >= lv.target && game.questionsAnswered >= lv.questionsRequired && game.levelTime >= lv.minMissionSeconds;
    const finalPressureReady = lv.boss && game.levelTime >= lv.minMissionSeconds + 24 && game.progress >= lv.target * .72 && game.questionsAnswered >= Math.ceil(lv.questionsRequired * .7);
    if(!game.bossActive && (missionReady || finalPressureReady)){
      game.bossActive = true;
      game.bossHealth = game.bossMax;
      game.bossAttackTimer = 1;
      setMentor(lv.boss ? 'Final anomaly detected. Use lab bursts and answer questions to stabilise the core!' : 'Boss challenge unlocked. Clear the anomaly to finish the mission!', '🚨');
      sfx('boss');
    }

    updateObjects(dt, slowFactor);
    updateShots(dt);
    updateBoss(dt);
    updateParticles(dt);
    showProgressLesson();
    if(game.progress >= lv.target && game.questionsAnswered >= lv.questionsRequired && game.levelTime >= lv.minMissionSeconds && game.bossActive && game.bossHealth <= 0){
      completeLevel();
    }
    syncUI();
  }

  function updateObjects(dt, slowFactor){
    for(const obj of game.objects){
      obj.age += dt;
      obj.x -= obj.vx * dt * slowFactor;
      obj.y += Math.sin(obj.age * 4 + obj.lane) * 10 * dt;
      if(game.player.magnet > 0 && obj.kind === 'collect'){
        obj.y += (game.player.y - obj.y) * Math.min(1, dt * 3.5);
        obj.x += (game.player.x + 45 - obj.x) * Math.min(1, dt * 2.5);
      }
      if(obj.kind === 'enemy'){
        obj.shoot -= dt;
        if(obj.shoot <= 0 && obj.x < CANVAS_W - 60 && obj.x > game.player.x + 120){
          obj.shoot = Math.max(.55, level().enemyFireRate + Math.random() * .65);
          game.enemyShots.push({x:obj.x - 30, y:obj.y, vx:-430 - level().difficulty * 58 - game.pressurePulse * 90, radius:13, color:obj.color, life:4.6});
        }
      }
      if(collide(game.player, obj)){
        handlePickup(obj);
        obj.dead = true;
      }
    }
    game.objects = game.objects.filter(o => !o.dead && o.x > -120);
    for(const bolt of game.enemyShots){
      bolt.x += bolt.vx * dt * slowFactor;
      bolt.life -= dt;
      if(collide(game.player, bolt)){
        bolt.dead = true;
        loseLife();
      }
    }
    game.enemyShots = game.enemyShots.filter(b => !b.dead && b.life > 0 && b.x > -60);
  }

  function handlePickup(obj){
    if(obj.kind === 'collect'){
      const points = game.player.double > 0 ? 60 : 30;
      game.progress++;
      game.combo++;
      game.score += points + Math.min(20, game.combo) * 5;
      addText(obj.x, obj.y - 45, `+${points}`, '#4dff9d');
      burst(obj.x, obj.y, theme().a);
      sfx('collect');
      if(game.progress === Math.ceil(level().target / 2)){
        setMentor(level().principle, '💡');
      }
    } else if(obj.kind === 'hazard' || obj.kind === 'enemy'){
      loseLife();
      burst(obj.x, obj.y, '#ff5f78');
    } else if(obj.kind === 'power'){
      applyPower(obj.id);
      burst(obj.x, obj.y, obj.color);
    } else if(obj.kind === 'question'){
      askQuestion();
    }
  }

  function applyPower(id){
    if(id === 'shield') game.player.shield = 7;
    if(id === 'slow') game.player.slow = 6;
    if(id === 'magnet') game.player.magnet = 7;
    if(id === 'double') game.player.double = 7;
    addText(game.player.x + 60, game.player.y - 60, labelFor(id), '#ffd452');
    sfx('power');
  }

  function updateShots(dt){
    for(const shot of game.shots){
      shot.x += shot.vx * dt;
      shot.life -= dt;
      for(const obj of game.objects){
        if((obj.kind === 'enemy' || obj.kind === 'hazard') && collide(shot, obj)){
          obj.hp -= 1;
          shot.dead = true;
          burst(obj.x, obj.y, shot.color);
          addText(obj.x, obj.y - 45, 'Lab burst', '#42dfff');
          game.score += 18;
          if(obj.hp <= 0) obj.dead = true;
          break;
        }
      }
      if(game.bossActive && game.bossHealth > 0 && shot.x > CANVAS_W - 260 && Math.abs(shot.y - CANVAS_H * .50) < 230){
        shot.dead = true;
        game.bossHealth -= 5;
        game.score += 20;
        burst(CANVAS_W - 230, shot.y, '#ffd452');
        sfx('shoot');
      }
    }
    game.shots = game.shots.filter(s => !s.dead && s.life > 0 && s.x < CANVAS_W + 80);
  }

  function updateBoss(dt){
    if(!game.bossActive || game.bossHealth <= 0) return;
    const lv = level();
    game.bossAttackTimer -= dt;
    if(game.bossAttackTimer <= 0){
      const wave = lv.boss ? 6 + game.phase * 2 : 4 + Math.floor(lv.difficulty / 1.25);
      for(let i=0;i<wave;i++){
        const lane = Math.floor(Math.random()*3);
        game.objects.push({
          kind: i % 3 === 0 ? 'question' : 'hazard',
          id: i % 3 === 0 ? 'quiz' : 'glitch',
          label: i % 3 === 0 ? '?' : 'Glitch',
          lane,
          x: CANVAS_W + 120 + i * 64,
          y: laneY(lane),
          vx: 390 + lv.difficulty * 86 + game.pressurePulse * 80,
          radius: i % 3 === 0 ? 35 : 38,
          age: 0,
          color: i % 3 === 0 ? '#ffd452' : '#ff4fa2',
          hp: 1
        });
      }
      game.bossAttackTimer = Math.max(.82, 3.35 - lv.difficulty * .28 - game.pressurePulse * .35);
    }
    if(lv.boss){
      const ratio = game.bossHealth / game.bossMax;
      game.phase = ratio < .33 ? 3 : ratio < .66 ? 2 : 1;
    }
  }

  function updateParticles(dt){
    for(const p of game.particles){
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.r *= 0.985;
    }
    game.particles = game.particles.filter(p => p.life > 0 && p.r > 0.5);
    for(const t of game.floatText){
      t.y -= 42 * dt;
      t.life -= dt;
    }
    game.floatText = game.floatText.filter(t => t.life > 0);
  }

  function burst(x,y,color){
    for(let i=0;i<16;i++){
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 180;
      game.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:5+Math.random()*8,life:.45+Math.random()*.35,color});
    }
  }
  function addText(x,y,text,color){
    game.floatText.push({x,y,text,color,life:1.1});
  }

  function draw(){
    const t = theme();
    ctx.save();
    ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
    if(game.shake > 0) ctx.translate((Math.random()-.5)*game.shake, (Math.random()-.5)*game.shake);
    drawBackground(t);
    drawLabTrack(t);
    drawObjects();
    drawShots();
    drawPlayer(t);
    drawBoss(t);
    drawParticles();
    drawTopCanvasHud(t);
    ctx.restore();
  }

  function drawBackground(t){
    const lv = level();
    const img = loadImage(lv.bg);

    // Keep the generated artwork visible. The previous dark veil made the
    // backgrounds look almost black on larger screens.
    ctx.fillStyle = t.c;
    ctx.fillRect(0,0,CANVAS_W,CANVAS_H);

    if(img.complete && img.naturalWidth > 0){
      ctx.globalAlpha = .96;
      ctx.drawImage(img,0,0,CANVAS_W,CANVAS_H);
      ctx.globalAlpha = 1;
    } else {
      const fallback = ctx.createLinearGradient(0,0,CANVAS_W,CANVAS_H);
      fallback.addColorStop(0, t.c);
      fallback.addColorStop(.55, '#102a46');
      fallback.addColorStop(1, '#061426');
      ctx.fillStyle = fallback;
      ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
    }

    // Soft readable tint only; not a heavy dark overlay.
    const veil = ctx.createLinearGradient(0,0,CANVAS_W,CANVAS_H);
    veil.addColorStop(0, 'rgba(2,7,16,.06)');
    veil.addColorStop(.52, 'rgba(6,20,38,.14)');
    veil.addColorStop(1, 'rgba(2,7,16,.24)');
    ctx.fillStyle = veil;
    ctx.fillRect(0,0,CANVAS_W,CANVAS_H);

    // Light glow to connect the background with the current mission theme.
    const glow = ctx.createRadialGradient(CANVAS_W * .72, CANVAS_H * .32, 40, CANVAS_W * .72, CANVAS_H * .32, 620);
    glow.addColorStop(0, `${t.a}26`);
    glow.addColorStop(.55, `${t.b}10`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0,0,CANVAS_W,CANVAS_H);

    drawGrid(t.a);
    drawLabProps(t);

    ctx.fillStyle = 'rgba(255,255,255,.96)';
    ctx.font = '900 22px Inter, Arial';
    ctx.fillText(lv.zone, 70, 82);
    ctx.font = '800 18px Inter, Arial';
    ctx.fillStyle = t.a;
    ctx.fillText(lv.concept, 70, 110);
  }

  function drawGrid(color){
    ctx.save();
    ctx.strokeStyle = color + '55';
    ctx.lineWidth = 2;
    const horizon = 555;
    for(let i=0;i<18;i++){
      const y = horizon + Math.pow(i/17, 1.6) * 330;
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(CANVAS_W,y); ctx.stroke();
    }
    for(let i=-12;i<=12;i++){
      const x = CANVAS_W/2 + i * 70;
      ctx.beginPath(); ctx.moveTo(x,horizon); ctx.lineTo(CANVAS_W/2 + i*210, CANVAS_H); ctx.stroke();
    }
    ctx.restore();
  }

  function drawLabProps(t){
    const time = performance.now() / 1000;
    for(let i=0;i<12;i++){
      const x = (i * 145 + (game.levelIndex*37)%90) % (CANVAS_W + 140) - 70;
      const h = 90 + ((i*47 + game.levelIndex*23) % 170);
      const y = 555 - h;
      ctx.fillStyle = 'rgba(3,8,19,.54)';
      roundRect(x,y,92,h,8,true,false);
      ctx.strokeStyle = t.a + '77';
      ctx.stroke();
      ctx.fillStyle = i%3===0 ? t.a : i%3===1 ? t.b : '#ffffff99';
      ctx.fillRect(x+20,y+28,52,9);
      if(i%2===0) ctx.fillRect(x+20,y+62,44,8);
    }
    ctx.strokeStyle = t.b + '88';
    ctx.lineWidth = 5;
    ctx.beginPath();
    const cy = 260 + Math.sin(time*.8) * 10;
    ctx.ellipse(1190, cy, 120, 38, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.fillStyle = t.b + 'cc';
    ctx.beginPath(); ctx.arc(1190, cy, 18, 0, Math.PI*2); ctx.fill();
    ctx.font = '900 36px Inter, Arial';
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    const symbols = ['F=ma','Ω','E','v','g','pH','DNA','μ','ΣF','H₂O'];
    for(let i=0;i<symbols.length;i++){
      const x = 260 + ((i*173 + game.levelIndex*61) % 980);
      const y = 170 + ((i*97 + game.levelIndex*49) % 270);
      ctx.fillText(symbols[i], x, y);
    }
  }

  function drawLabTrack(t){
    ctx.save();
    ctx.globalAlpha = .12;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 760, CANVAS_W, 140);
    ctx.globalAlpha = 1;
    [0,1,2].forEach((lane,i) => {
      const y = laneY(i);
      ctx.strokeStyle = i === game.player.targetLane ? t.b : t.a + '88';
      ctx.lineWidth = i === game.player.targetLane ? 5 : 2;
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(CANVAS_W,y); ctx.stroke();
    });
    ctx.restore();
  }

  function drawPlayer(t){
    const p = game.player;
    const bob = Math.sin(performance.now()/130) * 5;
    ctx.save();
    ctx.translate(p.x,p.y+bob);
    if(p.inv > 0 && Math.floor(p.inv*16)%2===0) ctx.globalAlpha=.45;

    if(p.shield > 0){
      ctx.strokeStyle = '#42dfff';
      ctx.lineWidth = 5;
      ctx.globalAlpha=.55 + Math.sin(performance.now()/100)*.18;
      ctx.beginPath(); ctx.arc(0,0,70,0,Math.PI*2); ctx.stroke();
      ctx.globalAlpha=1;
    }

    const img = loadImage(spritePaths.scientist);
    if(img.complete && img.naturalWidth > 0){
      ctx.drawImage(img, -54, -66, 108, 132);
    } else {
      ctx.fillStyle='#f4fbff';
      roundRect(-32,-50,64,78,18,true,false);
      ctx.fillStyle='#ffd3aa'; ctx.beginPath(); ctx.arc(0,-63,24,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#071426'; ctx.fillRect(-22,-70,44,10);
      ctx.strokeStyle=t.a; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(-28,-56); ctx.lineTo(28,-56); ctx.stroke();
      ctx.fillStyle='#071426'; roundRect(-24,-22,48,30,9,true,false);
      ctx.fillStyle=t.a; ctx.font='900 26px Inter, Arial'; ctx.fillText('F',-9,2);
      ctx.strokeStyle=t.b; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(38,-18); ctx.lineTo(70,-18); ctx.stroke();
      ctx.strokeStyle='#071426'; ctx.lineWidth=12; ctx.beginPath(); ctx.moveTo(-18,28); ctx.lineTo(-28,65); ctx.moveTo(18,28); ctx.lineTo(32,65); ctx.stroke();
    }

    if(p.magnet > 0){ drawPowerRing(0,0,88,'#4dff9d','MAG'); }
    if(p.slow > 0){ drawPowerRing(0,0,100,'#a86cff','SLOW'); }
    if(p.double > 0){ drawPowerRing(0,0,112,'#ffd452','x2'); }
    ctx.restore();
  }

  function drawPowerRing(x,y,r,color,label){
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.globalAlpha = .42;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha = .9; ctx.fillStyle = color; ctx.font = '900 15px Inter, Arial'; ctx.textAlign='center';
    ctx.fillText(label, x, y-r-8);
    ctx.restore();
  }

  function drawObjects(){
    for(const obj of game.objects){
      ctx.save();
      ctx.translate(obj.x, obj.y);
      const pulse = Math.sin(obj.age*6)*3;
      if(obj.kind === 'collect'){
        drawToken(obj, obj.radius + pulse);
      } else if(obj.kind === 'hazard'){
        drawHazard(obj, obj.radius + pulse);
      } else if(obj.kind === 'enemy'){
        drawEnemy(obj);
      } else if(obj.kind === 'power'){
        drawPower(obj);
      } else if(obj.kind === 'question'){
        drawQuestionCard(obj);
      }
      ctx.restore();
    }
  }

  function drawToken(obj, r){
    const img = obj.sprite ? loadImage(obj.sprite) : null;
    ctx.shadowColor = obj.color; ctx.shadowBlur = 20;
    if(img && img.complete && img.naturalWidth > 0){
      ctx.drawImage(img, -r, -r, r*2, r*2);
    } else {
      ctx.fillStyle = obj.color;
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#071426'; ctx.font = '900 18px Inter, Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(obj.label.slice(0,3).toUpperCase(),0,1);
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.font = '900 13px Inter, Arial'; ctx.textAlign='center';
    ctx.fillText(obj.label,0,r+20);
  }

  function drawHazard(obj, r){
    ctx.shadowColor = '#ff5f78'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff5f78';
    ctx.beginPath();
    for(let i=0;i<8;i++){
      const a = i/8*Math.PI*2;
      const rr = i%2 ? r*.55 : r;
      ctx.lineTo(Math.cos(a)*rr, Math.sin(a)*rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle = '#071426'; ctx.font='900 16px Inter, Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('!',0,1);
  }

  function drawEnemy(obj){
    ctx.shadowColor = obj.color; ctx.shadowBlur = 26;
    ctx.fillStyle = '#091326';
    roundRect(-46,-36,92,72,18,true,false);
    ctx.strokeStyle = obj.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = obj.color;
    ctx.beginPath(); ctx.arc(-18,-5,8,0,Math.PI*2); ctx.arc(18,-5,8,0,Math.PI*2); ctx.fill();
    if(obj.id === 'drone'){
      ctx.beginPath(); ctx.moveTo(-46,0); ctx.lineTo(-90,-24); ctx.lineTo(-72,14); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(46,0); ctx.lineTo(90,-24); ctx.lineTo(72,14); ctx.closePath(); ctx.fill();
    } else if(obj.id === 'slime'){
      ctx.globalAlpha=.7; ctx.beginPath(); ctx.arc(0,10,52,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
    } else {
      ctx.fillRect(-35,36,16,30); ctx.fillRect(19,36,16,30);
    }
    ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,.9)';
    ctx.font='900 13px Inter, Arial'; ctx.textAlign='center';
    ctx.fillText(obj.label,0,62);
  }

  function drawPower(obj){
    ctx.shadowColor = obj.color; ctx.shadowBlur = 30;
    ctx.strokeStyle = obj.color; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(0,0,38,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle = obj.color;
    ctx.globalAlpha=.22; ctx.beginPath(); ctx.arc(0,0,54,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
    ctx.fillStyle = '#fff'; ctx.font='900 22px Inter, Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    const icon = obj.id === 'shield' ? '⬟' : obj.id === 'slow' ? '⏱' : obj.id === 'magnet' ? 'U' : 'x2';
    ctx.fillText(icon,0,0);
    ctx.shadowBlur=0;
  }

  function drawQuestionCard(obj){
    ctx.shadowColor = '#ffd452'; ctx.shadowBlur = 26;
    ctx.fillStyle = '#071426';
    roundRect(-34,-42,68,84,13,true,false);
    ctx.strokeStyle = '#ffd452'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#ffd452'; ctx.font='900 46px Inter, Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('?',0,2);
    ctx.shadowBlur=0;
  }

  function drawShots(){
    for(const shot of game.shots){
      ctx.save();
      ctx.shadowColor = shot.color; ctx.shadowBlur = 20;
      ctx.fillStyle = shot.color;
      ctx.beginPath(); ctx.ellipse(shot.x, shot.y, 24, 8, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    for(const bolt of game.enemyShots){
      ctx.save();
      ctx.shadowColor = bolt.color; ctx.shadowBlur = 18;
      ctx.fillStyle = bolt.color;
      ctx.beginPath(); ctx.arc(bolt.x, bolt.y, bolt.radius, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  function drawBoss(t){
    if(!game.bossActive || game.bossHealth <= 0) return;
    const x = CANVAS_W - 230, y = CANVAS_H * .50;
    const ratio = Math.max(0, game.bossHealth / game.bossMax);
    ctx.save();
    ctx.translate(x,y);
    ctx.shadowColor = t.b; ctx.shadowBlur = 35;
    ctx.fillStyle = '#071426';
    roundRect(-105,-105,210,210,34,true,false);
    ctx.strokeStyle = t.b; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = t.b;
    ctx.beginPath(); ctx.arc(-38,-28,20,0,Math.PI*2); ctx.arc(38,-28,20,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-62,36,124,15);
    ctx.fillStyle = t.a;
    ctx.font = '1000 36px Inter, Arial'; ctx.textAlign='center';
    ctx.fillText(level().boss ? 'GLITCH' : 'CORE',0,-130);
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.fillStyle='rgba(255,255,255,.14)';
    roundRect(CANVAS_W-390, 92, 310, 18, 9, true, false);
    ctx.fillStyle = '#ff5f78';
    roundRect(CANVAS_W-390, 92, 310 * ratio, 18, 9, true, false);
    ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=2; ctx.stroke();
  }

  function drawParticles(){
    for(const p of game.particles){
      ctx.save(); ctx.globalAlpha = Math.max(0, p.life * 1.7);
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    for(const t of game.floatText){
      ctx.save(); ctx.globalAlpha = Math.max(0, t.life);
      ctx.fillStyle = t.color; ctx.font = '1000 24px Inter, Arial'; ctx.textAlign='center';
      ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 6;
      ctx.strokeText(t.text,t.x,t.y); ctx.fillText(t.text,t.x,t.y);
      ctx.restore();
    }
  }

  function drawTopCanvasHud(t){
    const lv = level();
    ctx.save();
    ctx.fillStyle = 'rgba(2,7,16,.56)';
    roundRect(52, 36, 610, 92, 20, true, false);
    ctx.strokeStyle = t.a; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '1000 30px Inter, Arial';
    ctx.fillText(`${game.levelIndex + 1}. ${lv.title}`, 82, 82);
    ctx.fillStyle = t.a; ctx.font = '900 18px Inter, Arial';
    ctx.fillText(lv.concept, 82, 110);

    const x = 1040, y = 38;
    ctx.fillStyle = 'rgba(2,7,16,.44)';
    roundRect(x, y, 500, 92, 20, true, false);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.stroke();
    const w = 440;
    ctx.fillStyle = 'rgba(255,255,255,.09)'; roundRect(x+30,y+24,w,14,8,true,false);
    ctx.fillStyle = t.a; roundRect(x+30,y+24,w*Math.min(1,game.progress/lv.target),14,8,true,false);
    ctx.fillStyle = 'rgba(255,255,255,.09)'; roundRect(x+30,y+58,w,14,8,true,false);
    ctx.fillStyle = '#ffd452'; roundRect(x+30,y+58,w*Math.min(1,game.questionsAnswered/lv.questionsRequired),14,8,true,false);
    ctx.fillStyle = '#fff'; ctx.font='900 13px Inter, Arial';
    ctx.fillText('Evidence', x+30,y+18); ctx.fillText('Questions', x+30,y+54);
    ctx.restore();
  }

  function roundRect(x,y,w,h,r,fill,stroke){
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr,y);
    ctx.arcTo(x+w,y,x+w,y+h,rr);
    ctx.arcTo(x+w,y+h,x,y+h,rr);
    ctx.arcTo(x,y+h,x,y,rr);
    ctx.arcTo(x,y,x+w,y,rr);
    ctx.closePath();
    if(fill) ctx.fill();
    if(stroke) ctx.stroke();
  }

  function syncUI(){
    const lv = level();
    els.hudLevel.textContent = String(game.levelIndex + 1);
    els.hudScore.textContent = Math.round(game.score);
    els.hudLives.textContent = Math.max(0, game.lives);
    els.hudStars.textContent = game.stars;
    els.missionTitle.textContent = lv.title;
    els.missionConcept.textContent = lv.concept;
    els.missionProgress.textContent = `${Math.min(game.progress, lv.target)} / ${lv.target}`;
    els.questionProgress.textContent = `${Math.min(game.questionsAnswered, lv.questionsRequired)} / ${lv.questionsRequired}`;
    const p = Math.min(1, game.progress / lv.target) * 100;
    const q = Math.min(1, game.questionsAnswered / lv.questionsRequired) * 100;
    els.missionMeter.style.width = `${p}%`;
    els.questionMeter.style.width = `${q}%`;
    if(game.bossActive){
      const br = Math.max(0, game.bossHealth / game.bossMax);
      els.bossProgress.textContent = game.bossHealth <= 0 ? 'Cleared' : `${Math.ceil(game.bossHealth)} HP`;
      els.bossMeter.style.width = `${br * 100}%`;
    } else {
      const wait = Math.max(0, Math.ceil(lv.minMissionSeconds - game.levelTime));
      els.bossProgress.textContent = (game.progress >= lv.target && game.questionsAnswered >= lv.questionsRequired) ? (wait > 0 ? `${wait}s lab run` : 'Ready') : 'Locked';
      els.bossMeter.style.width = '0%';
    }
    initBadges();
  }

  function moveLane(dir){
    if(game.mode !== 'play') return;
    game.player.targetLane = Math.max(0, Math.min(2, game.player.targetLane + dir));
  }

  function key(e){
    const k = e.key.toLowerCase();
    if(k === 'arrowup' || k === 'w' || k === '1'){ moveLane(-1); e.preventDefault(); }
    if(k === 'arrowdown' || k === 's' || k === '3'){ moveLane(1); e.preventDefault(); }
    if(k === '2'){ game.player.targetLane = 1; e.preventDefault(); }
    if(k === ' ' || k === 'enter'){ shoot(); e.preventDefault(); }
    if(k === 'shift'){ useShield(); e.preventDefault(); }
    if(k === 'escape'){ showOverlay('Paused', 'Continue the mission or choose another unlocked science zone.', 'Resume'); }
  }

  let touchY = null;
  canvas.addEventListener('pointerdown', (e) => {
    startAudio();
    touchY = e.clientY;
    if(game.mode === 'play') shoot();
  });
  canvas.addEventListener('pointerup', (e) => {
    if(touchY === null) return;
    const dy = e.clientY - touchY;
    if(Math.abs(dy) > 34) moveLane(dy > 0 ? 1 : -1);
    touchY = null;
  });
  window.addEventListener('keydown', key);

  els.btnStart.addEventListener('click', () => { hideOverlay(); startLevel(); });
  els.btnMap.addEventListener('click', () => showOverlay('Science World Map', 'Choose any unlocked curriculum mission. Complete missions to earn badges and open the next lab zone.', 'Resume'));
  els.overlayPrimary.addEventListener('click', () => {
    hideOverlay();
    if(game.mode === 'levelClear' && game.levelIndex < LEVELS.length - 1){
      game.levelIndex++;
      startLevel();
    } else {
      startLevel();
    }
  });
  els.overlaySecondary.addEventListener('click', () => { hideOverlay(); if(game.mode !== 'play') startLevel(); });
  els.btnMusic.addEventListener('click', () => {
    muted = !muted;
    els.btnMusic.textContent = muted ? 'Music: Off' : 'Music: On';
    if(muted) stopMusic(); else startAudio();
  });
  els.btnReset.addEventListener('click', () => {
    if(!confirm('Restart the Science Lab Dash campaign from level 1?')) return;
    try { localStorage.removeItem(SAVE_KEY); } catch {}
    Object.assign(save, {});
    game = resetRuntime();
    game.levelIndex = 0; game.score = 0; game.stars = 0; game.unlocked = 0; game.completed = {}; game.badges = {};
    writeSave();
    syncUI();
    showOverlay('Campaign Restarted', 'The Element Core mystery has been reset. Begin again from Lab Safety Training.', 'Start Mission');
  });
  els.btnLaneUp.addEventListener('click', () => moveLane(-1));
  els.btnLaneDown.addEventListener('click', () => moveLane(1));
  els.btnShoot.addEventListener('click', shoot);
  els.btnShield.addEventListener('click', useShield);

  function loop(now){
    const dt = Math.min(0.033, (now - game.lastTime) / 1000 || 0);
    game.lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  syncUI();
  buildMap();
  showOverlay('Restore Nova Science Academy', 'Dash through 20 science curriculum missions, collect evidence, solve lab puzzles, and defeat the Glitch Experiment.', 'Begin Adventure');
  requestAnimationFrame(loop);
})();
