/* Recycle Rush: Restore Verdale. Pure mission rules; also used by regression tests. */
(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./story-play.js') : root.RecyclePlay);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RecycleLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (P) {
  'use strict';
  const SAVE_KEY = 'wga_recycle_restore_v1';
  const SOURCES = ['https://petco.co.za/consumers/'];
  const routes = {
    paper: { label: 'Paper & card', icon: 'assets/sprites/item-newspaper.png', color: '#70d8ff' },
    containers: { label: 'Empty containers', icon: 'assets/sprites/item-plastic-bottle.png', color: '#74eda8' },
    compost: { label: 'Food compost', icon: 'assets/sprites/item-organic.png', color: '#c7e57b' },
    reuse: { label: 'Reuse shelf', icon: 'assets/sprites/item-textiles.svg', color: '#ffd178' },
    repair: { label: 'Repair expert', icon: 'assets/sprites/item-ewaste.png', color: '#a9bbff' },
    special: { label: 'Special drop-off', icon: 'assets/sprites/item-battery.svg', color: '#f5a6c8' },
    centre: { label: 'Recovery centre', icon: 'assets/sprites/item-bonus-recycle.png', color: '#83eee1' },
    residual: { label: 'Residual waste', icon: 'assets/sprites/item-contamination.png', color: '#d4c6ba' }
  };
  const items = {
    newspaper: { name: 'Dry newspaper', material: 'Paper', condition: 'Clean and dry', icon: routes.paper.icon, route: 'paper', fact: 'Keep paper separate from food and wet waste so its fibres stay useful.' },
    box: { name: 'Delivery box', material: 'Cardboard', condition: 'Empty, still bulky', icon: 'assets/sprites/item-cardboard.png', route: 'paper', prep: 'flatten', fact: 'Flattening an empty cardboard box saves collection space.' },
    bottle: { name: 'Water bottle', material: 'PET plastic packaging', condition: 'Empty, cap on', icon: routes.containers.icon, route: 'containers', fact: 'This station accepts empty PET bottles. Check the label and your collector’s acceptance list elsewhere.' },
    can: { name: 'Drink can', material: 'Metal packaging', condition: 'Empty', icon: 'assets/sprites/item-tin-can.png', route: 'containers', fact: 'This station accepts empty metal cans with its containers. Other collectors may separate them.' },
    peel: { name: 'Banana peel', material: 'Food scraps', condition: 'Unpackaged', icon: routes.compost.icon, route: 'compost', fact: 'Food scraps go to this supervised compost project, away from dry recycling.' },
    apple: { name: 'Apple core', material: 'Food scraps', condition: 'Unpackaged', icon: routes.compost.icon, route: 'compost', fact: 'Only the listed food scraps belong in our compost collection. Packaging stays out.' },
    juice: { name: 'Half-full PET bottle', material: 'PET plastic packaging', condition: 'Liquid remains inside', icon: routes.containers.icon, route: 'containers', prep: 'empty', fact: 'Empty the remaining drink at the designated sink before sorting the packaging.' },
    tray: { name: 'Lunch container', material: 'Accepted plastic packaging', condition: 'Food scraps remain', icon: routes.containers.icon, route: 'containers', prep: 'scrape', fact: 'Remove food into the compost caddy first. This accepted container can then join the empty containers.' },
    wetpaper: { name: 'Soggy food wrapper', material: 'Food-soiled paper', condition: 'Wet and greasy; not accepted here', icon: routes.paper.icon, route: 'residual', fact: 'This local service does not accept this food-soiled wrapper in paper recycling or compost. Follow its residual-waste guidance.' },
    book: { name: 'Story book', material: 'Paper product', condition: 'Complete and readable', icon: routes.paper.icon, route: 'reuse', fact: 'A usable book can be shared again before its materials need recycling.' },
    shirt: { name: 'School shirt', material: 'Textile', condition: 'Clean and wearable', icon: routes.reuse.icon, route: 'reuse', fact: 'Use the school clothing exchange for clean, wearable clothes.' },
    radio: { name: 'Silent radio', material: 'Electrical device', condition: 'Not working; no visible damage', icon: routes.repair.icon, route: 'repair', fact: 'Ask a qualified repairer to assess this device. Do not open electronics yourself.' },
    battery: { name: 'Spent household battery', material: 'Battery', condition: 'Identified by the supervisor', icon: routes.special.icon, route: 'special', fact: 'Ask the supervisor to arrange an approved battery drop-off. Keep batteries out of ordinary recycling; never open or handle damaged batteries.' },
    carton: { name: 'Empty drink carton', material: 'Liquid beverage carton', condition: 'Empty; accepted at the recovery centre', icon: 'assets/sprites/item-cardboard.png', route: 'centre', fact: 'Cartons have a recovery route where collection facilities accept them. This street service does not; our centre does.' },
    glass: { name: 'Empty glass bottle', material: 'Glass packaging', condition: 'Intact; centre collection only here', icon: 'assets/sprites/item-glass-bottle.png', route: 'centre', fact: 'The local recovery centre accepts intact glass bottles. Do not handle broken glass; ask an adult or collection worker.' }
  };
  for (const [id, item] of Object.entries(items)) { item.legacyIcon = item.icon; item.icon = `assets/animated/${id}.webp`; }
  items.box.preparedIcon = 'assets/animated/box-flat.webp';
  items.juice.preparedIcon = items.bottle.icon;
  items.tray.preparedIcon = 'assets/animated/tray-empty.webp';
  const routeArt = {paper:'newspaper',containers:'bottle',compost:'peel',reuse:'shirt',repair:'radio',special:'battery',centre:'carton',residual:'wetpaper'};
  for (const [id, art] of Object.entries(routeArt)) { routes[id].legacyIcon = routes[id].icon; routes[id].icon = `assets/animated/${art}.webp`; }
  const preparations = {
    flatten: { label: 'Flatten empty box', result: 'Box flattened. Its clean, dry cardboard is ready for collection.' },
    empty: { label: 'Empty at the sink', result: 'Drink emptied at the designated sink. The bottle is ready for collection.' },
    scrape: { label: 'Remove food scraps', result: 'Food goes into the compost caddy. The accepted container is now empty.' }
  };
  const mission = (id, title, subtitle, ally, intro, goal, background, stops, destinations, sets, restoration) => ({ id, title, subtitle, ally, intro, goal, background, stops, destinations, sets, restoration });
  const missions = [
    mission('workshop', 'Wake the Workshop', 'School district · collection & sorting', 'Professor Loop',
      'Circuit wakes beneath a dusty workbench. The school’s recovery station has stopped, and Grime is feeding on the mixed rubbish. Start with the courtyard and bring the workshop back to life.',
      'Collect each item, inspect its condition, then choose the accepted destination.', 'assets/backgrounds/bg-school-cleanup.png',
      ['The courtyard', 'The classroom steps', 'The workshop door'], ['paper', 'containers', 'compost'],
      [['newspaper', 'bottle', 'peel', 'can', 'newspaper', 'apple'], ['can', 'apple', 'bottle', 'newspaper', 'peel', 'bottle'], ['peel', 'newspaper', 'can', 'bottle', 'apple', 'newspaper']],
      'The workshop lights are back on. A fresh collection station opens beside the school.'),
    mission('lunch', 'Lunchbreak Rescue', 'School district · preparation & quality', 'Nandi · school caretaker',
      'Nandi has collected the lunch waste, but wet scraps are threatening the clean paper. Help her prepare the packaging before the collection truck arrives.',
      'Empty, scrape or flatten when needed. Keep wet, food-soiled wrappers out of the clean paper stream.', 'assets/backgrounds/bg-school-cleanup.png',
      ['The lunch tables', 'The preparation sink', 'The clean store'], ['paper', 'containers', 'compost', 'residual'],
      [['juice', 'box', 'tray', 'wetpaper', 'peel', 'newspaper'], ['tray', 'juice', 'box', 'apple', 'wetpaper', 'can'], ['box', 'wetpaper', 'juice', 'tray', 'newspaper', 'peel']],
      'Clean materials fill the store. Nandi opens a food-compost caddy and keeps the paper dry.'),
    mission('second-life', 'A Second Life', 'Neighbourhood · reuse & repair', 'Sam · repair technician',
      'The workshop shelves are almost empty. Sam can assess broken devices while neighbours share books and uniforms. Not everything needs to become waste.',
      'Prioritise reuse for usable goods. Send electrical repairs and batteries to the right specialists.', 'assets/backgrounds/bg-community-day.png',
      ['The exchange table', 'Sam’s repair bench', 'The neighbourhood shelf'], ['reuse', 'repair', 'special', 'paper'],
      [['book', 'shirt', 'radio', 'battery', 'box', 'book'], ['radio', 'book', 'shirt', 'battery', 'newspaper', 'shirt'], ['battery', 'radio', 'book', 'box', 'shirt', 'newspaper']],
      'The first repaired radio plays again. Books and uniforms return to use on a busy exchange shelf.'),
    mission('collection', 'Collection Day', 'Neighbourhood · local acceptance routes', 'Musa · community collector',
      'Musa is ready to collect the sorted materials. His street service takes paper and containers, while glass and drink cartons go to the recovery centre. Read the service board before dispatching.',
      'Match each item to this neighbourhood’s service board. Acceptance varies between collection services.', 'assets/backgrounds/bg-buyback-centre.png',
      ['Musa’s street round', 'The loading point', 'The recovery centre'], ['paper', 'containers', 'centre', 'special'],
      [['carton', 'glass', 'bottle', 'newspaper', 'battery', 'can'], ['glass', 'box', 'carton', 'juice', 'can', 'battery'], ['bottle', 'carton', 'glass', 'newspaper', 'box', 'can']],
      'Musa’s collection round is running. Labelled bundles reach the centre without mixing the streams.'),
    mission('school-tomorrow', 'The School of Tomorrow', 'School district · Grime showdown', 'Professor Loop & the community',
      'Grime returns to the school, blocking the new station. Every well-routed item removes part of its shield. Work through all three areas with your neighbours to reopen the station.',
      'Finish every recovery task to clear Grime’s shield. Correct preparation and routing power the final restoration.', 'assets/backgrounds/bg-circular-challenge.png',
      ['Grime at the gate', 'Power the recovery loop', 'Reopen the school station'], ['paper', 'containers', 'compost', 'reuse', 'repair', 'special', 'centre', 'residual'],
      [['juice', 'book', 'battery', 'carton', 'peel', 'box'], ['radio', 'wetpaper', 'glass', 'shirt', 'tray', 'newspaper'], ['bottle', 'box', 'apple', 'radio', 'carton', 'can']],
      'The school station shines again. Circuit, Nandi, Sam and Musa have built a working recovery loop together. The market traders have heard about your work and are asking for help next.'),
    {
      "id": "market-morning",
      "title": "Market Morning",
      "subtitle": "Market district · clean collection",
      "ally": "Asha · market organiser",
      "intro": "The school station is working, but Grime has followed the delivery crates to Verdale Market. Asha needs Circuit to open a clean collection lane before the stalls fill the square.",
      "goal": "Prepare the market packaging, keep food away from dry paper and help each trader plan a better collection point.",
      "background": "assets/backgrounds/bg-market-square.webp",
      "stops": [
        "The delivery lane",
        "The produce stalls",
        "The market collection point"
      ],
      "destinations": [
        "paper",
        "containers",
        "compost",
        "residual"
      ],
      "sets": [
        [
          "box",
          "juice",
          "peel",
          "newspaper",
          "tray",
          "wetpaper"
        ],
        [
          "apple",
          "box",
          "can",
          "juice",
          "tray",
          "newspaper"
        ],
        [
          "wetpaper",
          "bottle",
          "box",
          "peel",
          "tray",
          "can"
        ]
      ],
      "restoration": "Asha opens the market collection lane. Traders keep their food scraps, dry paper and empty packaging separate, and Circuit earns the market team’s trust.",
      "requests": [
        {
          "prompt": "Asha’s delivery boxes are empty but still take up the whole collection trolley. What should the team do?",
          "answer": "flatten",
          "choices": [
            {
              "id": "fill",
              "label": "Fill them with food scraps",
              "feedback": "Food scraps would contaminate this clean cardboard stream."
            },
            {
              "id": "flatten",
              "label": "Flatten the empty boxes",
              "feedback": "Flat cardboard takes less collection space."
            },
            {
              "id": "wet",
              "label": "Soak them to make them smaller",
              "feedback": "Keep this service’s cardboard clean and dry."
            }
          ],
          "success": "Flat, empty boxes leave more room in the collection trolley."
        },
        {
          "prompt": "The fruit stall puts peels beside a stack of dry newspapers. How can Circuit protect both streams?",
          "answer": "separate",
          "choices": [
            {
              "id": "separate",
              "label": "Use a separate food-compost caddy",
              "feedback": "Listed scraps belong in the supervised food-compost collection."
            },
            {
              "id": "mix",
              "label": "Wrap the peels in the newspaper stack",
              "feedback": "Wet food can spoil the clean paper collection."
            },
            {
              "id": "bottle",
              "label": "Put the peels inside empty bottles",
              "feedback": "Packaging and food must be separated."
            }
          ],
          "success": "The caddy holds the food scraps while the newspaper stays dry."
        },
        {
          "prompt": "A trader asks which container belongs at this market’s empty-container station.",
          "answer": "empty",
          "choices": [
            {
              "id": "full",
              "label": "A bottle with drink still inside",
              "feedback": "Empty it at the designated sink before collection."
            },
            {
              "id": "wrapper",
              "label": "A soggy food wrapper",
              "feedback": "This service sends that wrapper to residual waste."
            },
            {
              "id": "empty",
              "label": "An empty accepted drink can",
              "feedback": "This service accepts empty drink cans with its containers."
            }
          ],
          "success": "Asha’s station accepts the empty can. Check a different collector’s own list elsewhere."
        }
      ]
    },
    {
      "id": "food-loop",
      "title": "The Food Loop",
      "subtitle": "Market district · food & packaging",
      "ally": "Nandi & Asha",
      "intro": "Lunch at the market has left half-full drinks and food-covered containers beside the vegetable stalls. Nandi joins Asha to protect the dry collection store and organise the supervised food-compost project.",
      "goal": "Separate listed food scraps from packaging, prepare each container and explain why the streams must stay separate.",
      "background": "assets/backgrounds/bg-park-clean-sweep.png",
      "stops": [
        "The lunch corner",
        "The preparation station",
        "The supervised compost point"
      ],
      "destinations": [
        "compost",
        "containers",
        "residual",
        "paper"
      ],
      "sets": [
        [
          "tray",
          "apple",
          "juice",
          "wetpaper",
          "peel",
          "box"
        ],
        [
          "juice",
          "tray",
          "peel",
          "newspaper",
          "apple",
          "wetpaper"
        ],
        [
          "apple",
          "tray",
          "box",
          "peel",
          "juice",
          "wetpaper"
        ]
      ],
      "restoration": "The market’s food-compost caddies are labelled and its accepted containers leave empty. Nandi’s team can keep wet scraps out of the dry store.",
      "requests": [
        {
          "prompt": "The lunch tray still has three food scraps on it. Which part goes into this project’s compost caddy?",
          "answer": "scraps",
          "choices": [
            {
              "id": "tray",
              "label": "The whole tray and its food",
              "feedback": "Packaging does not belong in the food-compost caddy."
            },
            {
              "id": "scraps",
              "label": "Only the listed food scraps",
              "feedback": "Keep the accepted tray for the container collection after clearing it."
            },
            {
              "id": "paper",
              "label": "The wet food wrapper instead",
              "feedback": "This local compost project does not accept that wrapper."
            }
          ],
          "success": "Food scraps go to the supervised compost point and the cleared tray follows its accepted packaging route."
        },
        {
          "prompt": "A half-full PET bottle reaches the preparation station. What comes before routing it?",
          "answer": "sink",
          "choices": [
            {
              "id": "sink",
              "label": "Empty at the designated sink, then recap here",
              "feedback": "This local service asks for an empty, capped PET bottle."
            },
            {
              "id": "food",
              "label": "Pour the drink into the paper box",
              "feedback": "Liquid would damage the clean cardboard."
            },
            {
              "id": "sort",
              "label": "Route it while still half full",
              "feedback": "Liquid remains inside; finish the preparation activity first."
            }
          ],
          "success": "The preparation station protects the clean collection streams."
        },
        {
          "prompt": "Why does Nandi keep food caddies away from clean paper?",
          "answer": "quality",
          "choices": [
            {
              "id": "colour",
              "label": "Because all green bins mean compost everywhere",
              "feedback": "Bin colours are not universal; follow each collector’s guidance."
            },
            {
              "id": "same",
              "label": "Because all waste has the same recovery route",
              "feedback": "Different materials and conditions need different routes."
            },
            {
              "id": "quality",
              "label": "Food and moisture can spoil the dry paper",
              "feedback": "Keeping materials separate protects their collection quality."
            }
          ],
          "success": "Separate streams help the project recover useful materials without food contamination."
        }
      ]
    },
    {
      "id": "swap-day",
      "title": "The Great Swap Day",
      "subtitle": "Community district · reuse before recycling",
      "ally": "Sam & the neighbourhood",
      "intro": "Neighbours arrive with books, clothes and a silent radio for the first market swap day. Sam sets up a repair bench while Circuit helps usable objects find a second home.",
      "goal": "Check usable goods for the exchange, leave electrical repairs to Sam and keep special drop-offs out of ordinary bins.",
      "background": "assets/backgrounds/bg-community-day.png",
      "stops": [
        "The exchange entrance",
        "The repair corner",
        "The community shelves"
      ],
      "destinations": [
        "reuse",
        "repair",
        "special",
        "paper"
      ],
      "sets": [
        [
          "book",
          "shirt",
          "radio",
          "box",
          "battery",
          "book"
        ],
        [
          "shirt",
          "radio",
          "newspaper",
          "book",
          "battery",
          "box"
        ],
        [
          "book",
          "shirt",
          "radio",
          "battery",
          "shirt",
          "box"
        ]
      ],
      "restoration": "The swap shelves are busy and Sam’s assessed repairs return to the community. Asha invites the neighbours to help protect the whole market.",
      "requests": [
        {
          "prompt": "A readable book arrives at the swap table. What keeps the whole item useful?",
          "answer": "share",
          "choices": [
            {
              "id": "share",
              "label": "Check its condition and offer it for reuse",
              "feedback": "A complete readable book can serve another reader."
            },
            {
              "id": "tear",
              "label": "Tear it into recycling pieces immediately",
              "feedback": "Check whether it can be used again before recycling its materials."
            },
            {
              "id": "residual",
              "label": "Place it in residual waste",
              "feedback": "The community exchange accepts this usable book."
            }
          ],
          "success": "A book keeps its story when another reader can use it."
        },
        {
          "prompt": "The silent radio has no visible damage. Who should assess and test its repair?",
          "answer": "sam",
          "choices": [
            {
              "id": "circuit",
              "label": "Circuit opens the radio at the table",
              "feedback": "Do not open electronics yourself; use a qualified repairer."
            },
            {
              "id": "sam",
              "label": "Sam, the qualified repair technician",
              "feedback": "Sam handles the assessment and electrical repair safely."
            },
            {
              "id": "bin",
              "label": "The ordinary container collection",
              "feedback": "Electrical devices do not belong in this packaging stream."
            }
          ],
          "success": "Sam assesses and tests the device. Circuit helps plan the job without dismantling it."
        },
        {
          "prompt": "A neighbour brings a spent battery identified by the supervisor. What is the right plan?",
          "answer": "supervisor",
          "choices": [
            {
              "id": "paper",
              "label": "Hide it in a paper bundle",
              "feedback": "Batteries must stay out of ordinary recycling."
            },
            {
              "id": "open",
              "label": "Open it to see what is inside",
              "feedback": "Never open or handle damaged batteries."
            },
            {
              "id": "supervisor",
              "label": "Ask the supervisor to arrange approved drop-off",
              "feedback": "A special collection route is needed for batteries."
            }
          ],
          "success": "The supervisor arranges an approved drop-off while the ordinary streams stay clear."
        }
      ]
    },
    {
      "id": "weather-ready",
      "title": "Before the Rain",
      "subtitle": "Market district · protect & dispatch",
      "ally": "Musa · community collector",
      "intro": "Rain clouds gather while Musa prepares his market collection round. The team must keep clean paper dry, prepare bulky boxes and send centre-only packaging to its listed service.",
      "goal": "Protect material quality and check this service’s acceptance list before dispatch. Never guess a route from a bin colour.",
      "background": "assets/backgrounds/bg-market-square.webp",
      "stops": [
        "The covered loading bay",
        "The local service desk",
        "Musa’s dispatch point"
      ],
      "destinations": [
        "paper",
        "containers",
        "centre",
        "residual"
      ],
      "sets": [
        [
          "newspaper",
          "box",
          "carton",
          "juice",
          "glass",
          "wetpaper"
        ],
        [
          "carton",
          "box",
          "glass",
          "newspaper",
          "can",
          "wetpaper"
        ],
        [
          "glass",
          "juice",
          "carton",
          "box",
          "wetpaper",
          "bottle"
        ]
      ],
      "restoration": "The market bundles are covered and the dispatch labels are ready. Musa’s collection service and the recovery centre each receive the materials they accept.",
      "requests": [
        {
          "prompt": "Musa spots clean newspaper beneath an open sky before rain. What protects its quality?",
          "answer": "cover",
          "choices": [
            {
              "id": "soak",
              "label": "Wet the stack before collection",
              "feedback": "Paper for this service should stay clean and dry."
            },
            {
              "id": "cover",
              "label": "Move it to the covered, labelled paper point",
              "feedback": "Shelter keeps rain away from the dry paper."
            },
            {
              "id": "food",
              "label": "Hide it under food scraps",
              "feedback": "Food would contaminate the paper stream."
            }
          ],
          "success": "The dry-paper shelter protects the clean newspaper until Musa collects it."
        },
        {
          "prompt": "The service board says drink cartons go to the recovery centre here. What should Circuit follow?",
          "answer": "board",
          "choices": [
            {
              "id": "board",
              "label": "This service’s acceptance list",
              "feedback": "Our centre accepts these empty cartons; the street service does not."
            },
            {
              "id": "colour",
              "label": "A bin colour seen in another town",
              "feedback": "Colours are not a universal guide to acceptance."
            },
            {
              "id": "guess",
              "label": "Any paper bin because cartons look like card",
              "feedback": "Follow the local acceptance list for this packaging."
            }
          ],
          "success": "Checking the board prevents an otherwise useful carton from entering the wrong stream."
        },
        {
          "prompt": "A glass bottle is broken near the loading bay. What should the team do?",
          "answer": "worker",
          "choices": [
            {
              "id": "grab",
              "label": "Pick up the pieces with bare hands",
              "feedback": "Do not handle broken glass."
            },
            {
              "id": "sweep",
              "label": "Ask Circuit to collect it with the playable items",
              "feedback": "This mission’s glass items are intact; broken glass needs trained help."
            },
            {
              "id": "worker",
              "label": "Ask an adult or trained collection worker",
              "feedback": "Keep clear of the broken glass and get appropriate help."
            }
          ],
          "success": "Musa asks a trained worker to deal with the broken glass; Circuit keeps the playable collection route clear."
        }
      ]
    },
    {
      "id": "market-lights",
      "title": "Light Up the Market",
      "subtitle": "Market district · community showdown",
      "ally": "Asha, Sam, Nandi & Musa",
      "intro": "The market festival is ready, but Grime has wrapped the community station in a new cloud. Circuit must bring the market team’s sorting, preparation and reuse skills together to restore the square.",
      "goal": "Recover all eighteen objects, solve the community requests and power three Loop Pulses to clear Grime from the market.",
      "background": "assets/backgrounds/bg-market-square.webp",
      "stops": [
        "The festival stalls",
        "The community lane",
        "The market power station"
      ],
      "destinations": [
        "paper",
        "containers",
        "compost",
        "reuse",
        "repair",
        "special",
        "centre",
        "residual"
      ],
      "sets": [
        [
          "tray",
          "book",
          "battery",
          "carton",
          "peel",
          "box"
        ],
        [
          "radio",
          "wetpaper",
          "glass",
          "shirt",
          "juice",
          "newspaper"
        ],
        [
          "box",
          "apple",
          "radio",
          "bottle",
          "carton",
          "can"
        ]
      ],
      "restoration": "Warm lights return to the market square. The school and market teams now share a working recovery loop. Replay for a cleaner run, or try the faster arcade challenge.",
      "requests": [
        {
          "prompt": "Festival visitors want to help but do not know this market’s services. What should Asha show them?",
          "answer": "labels",
          "choices": [
            {
              "id": "labels",
              "label": "The labelled local service board",
              "feedback": "Material names and the accepted list explain this market’s routes."
            },
            {
              "id": "guess",
              "label": "Only a colour and ask them to guess",
              "feedback": "Bin colours are not universal; use the accepted list."
            },
            {
              "id": "mix",
              "label": "One box for every material",
              "feedback": "Mixing food, packaging and special items spoils the recovery loop."
            }
          ],
          "success": "Clear labels help each visitor make an informed recovery choice."
        },
        {
          "prompt": "A wearable shirt and a broken radio arrive together. Which plan fits their conditions?",
          "answer": "split",
          "choices": [
            {
              "id": "same",
              "label": "Send both to the empty-container station",
              "feedback": "Neither item is accepted packaging for that station."
            },
            {
              "id": "split",
              "label": "Exchange the shirt; let Sam assess the radio",
              "feedback": "Usable goods can be reused while electrical repair needs a qualified expert."
            },
            {
              "id": "throw",
              "label": "Send both straight to residual waste",
              "feedback": "These goods have useful reuse and repair routes here."
            }
          ],
          "success": "The shirt can be shared and Sam can assess the radio: condition matters as much as material."
        },
        {
          "prompt": "Grime claims that recycling everything is the only way to finish. What has the community learned?",
          "answer": "loop",
          "choices": [
            {
              "id": "all",
              "label": "Put batteries, food and books in one recycling bin",
              "feedback": "These items need different routes, including special drop-off and reuse."
            },
            {
              "id": "rush",
              "label": "Skip preparation so collection is faster",
              "feedback": "Emptying, scraping and flattening protect the collection streams."
            },
            {
              "id": "loop",
              "label": "Reuse, repair and prepare before choosing accepted routes",
              "feedback": "A working recovery loop matches each item’s condition to an appropriate service."
            }
          ],
          "success": "Every recovery choice counts. The market team is ready to power The Loop together."
        }
      ]
    }
  ];
  const clone = value => JSON.parse(JSON.stringify(value));
  const integer = (v, max) => Number.isSafeInteger(v) && v >= 0 && v <= max;
  function fresh(id) { return { mission: id, stop: 0, done: [], prepared: [], selected: null, mistakes: 0, hints: 0, score: 0, checkpointScore: 0, checkpointMistakes: 0, checkpointHints: 0, elapsed: 0, complete: false, play: P.initial() }; }
  function validSession(value) {
    const m = missions.find(m => m.id === value?.mission);
    if (!m || !P.valid(value.play) || !integer(value.stop, m.sets.length - 1) || !Array.isArray(value.done) || !Array.isArray(value.prepared)) return false;
    const ids = m.sets[value.stop].map((_, i) => i);
    if (![value.done, value.prepared].every(a => new Set(a).size === a.length && a.every(v => ids.includes(v)))) return false;
    if (!['score', 'checkpointScore', 'mistakes', 'hints', 'elapsed', 'checkpointMistakes', 'checkpointHints'].every(k => Number.isFinite(value[k]) && value[k] >= 0 && value[k] <= 1e8)) return false;
    if (value.done.some(i => items[m.sets[value.stop][i]].prep && !value.prepared.includes(i))) return false;
    const decisions = value.play?.decisions || {};
    if (Object.entries(decisions).some(([stop, answer]) => !m.requests?.[Number(stop)] || answer !== m.requests[Number(stop)].answer || Number(stop) > value.stop || Number(stop) === value.stop && value.done.length !== ids.length)) return false;
    if (m.requests && m.requests.slice(0, value.stop).some((q, i) => decisions[i] !== q.answer)) return false;
    if (value.complete && m.requests && m.requests.some((q, i) => decisions[i] !== q.answer)) return false;
    return (value.selected === null || ids.includes(value.selected) && !value.done.includes(value.selected)) && typeof value.complete === 'boolean' && (!value.complete || !P.isBattle(value.mission) || !value.play || value.play.bossHits === 3) && (!value.complete || value.stop === m.sets.length - 1 && value.done.length === ids.length);
  }
  function normalize(raw) {
    const out = { version: 1, unlocked: 0, stars: {}, results: {}, session: null, practice: false };
    if (!raw || raw.version !== 1) return out;
    out.unlocked = integer(raw.unlocked, missions.length) ? raw.unlocked : 0;
    missions.forEach(m => {
      if (integer(raw.stars?.[m.id], 3) && raw.stars[m.id] > 0) out.stars[m.id] = raw.stars[m.id];
      if (raw.results?.[m.id] && integer(raw.results[m.id].score, 1e8)) out.results[m.id] = { score: raw.results[m.id].score };
    });
    // Only a contiguous completed route can unlock the next mission.
    let contiguous = 0;
    while (contiguous < missions.length && out.stars[missions[contiguous].id]) contiguous++;
    out.unlocked = Math.min(out.unlocked, contiguous);
    out.practice = raw.practice === true;
    if (validSession(raw.session) && missions.findIndex(m => m.id === raw.session.mission) <= out.unlocked) { out.session = clone(raw.session); P.hydrate(out.session); const p = progress(out.session); out.session.play.energy = Math.max(out.session.play.energy, p.done - out.session.play.bossHits * 6); }
    return out;
  }
  function selectedItem(session) {
    const m = missions.find(m => m.id === session.mission);
    if (!m || session.selected === null || session.done.includes(session.selected)) return null;
    return items[m.sets[session.stop][session.selected]];
  }
  function act(session, action, value) {
    if (!validSession(session) || session.complete) return { ok: false, text: 'This mission is already complete.' };
    const m = missions.find(m => m.id === session.mission);
    const set = m.sets[session.stop];
    const play = P.hydrate(session);
    if (action === 'decision' || action === 'decision-hint') return decide(session, action, value);
    if (action === 'restore') { if (requestReady(session)) return { ok: false, text: 'Help your neighbour with the community request first.' }; return P.restore(session, value); }
    if (action === 'wisp' || action === 'pulse') { if (requestReady(session)) return { ok: false, text: 'Complete the community request before powering The Loop.' }; return P.battle(session, action, value); }
    if (action === 'select') {
      if (!integer(value, set.length - 1) || session.done.includes(value)) return { ok: false, text: 'Choose an item still in the area.' };
      session.selected = value;
      return { ok: true, kind: 'collect', text: items[set[value]].condition };
    }
    const item = selectedItem(session);
    if (action === 'hint' && item) {
      session.hints++;
      return { ok: true, kind: 'hint', text: item.prep && !session.prepared.includes(session.selected) ? `First: ${preparations[item.prep].label.toLowerCase()}. ${item.fact}` : item.fact };
    }
    if (action === 'work' && item && !session.prepared.includes(session.selected)) return P.work(session, item, value);
    if (action === 'prepare' && P.kind(item) && !session.prepared.includes(session.selected)) {
      if (value !== P.kind(item) || !P.ready(session, item)) return { ok: false, text: 'Finish the hands-on activity before routing this item.' };
      session.prepared.push(session.selected);
      session.score += 25;
      return { ok: true, kind: 'prepare', text: preparations[item.prep]?.result || (P.kind(item) === 'repair' ? 'Sam has assessed and tested the device. Keep electrical work with qualified experts.' : 'The item is ready for the exchange shelf.') };
    }
    if (action === 'route' && item && m.destinations.includes(value)) {
      if (P.kind(item) && !session.prepared.includes(session.selected)) {
        session.mistakes++; play.streak = 0;
        return { ok: false, kind: 'retry', text: `Complete the activity first: ${P.activities[P.kind(item)].title.toLowerCase()}. ${item.fact}` };
      }
      if (value !== item.route) {
        session.mistakes++; play.streak = 0;
        return { ok: false, kind: 'retry', text: `Let’s try again. ${item.fact} Destination: ${routes[item.route].label}.` };
      }
      play.streak++; play.bestStreak = Math.max(play.bestStreak, play.streak); play.energy++;
      session.done.push(session.selected);
      session.selected = null;
      session.score += 100;
      const checkpoint = session.done.length === set.length;
      const finished = checkpoint && session.stop === m.sets.length - 1;
      const request = requestReady(session);
      const battle = finished && P.isBattle(m.id);
      session.complete = finished && !battle && !request;
      return { ok: true, kind: request ? 'request' : battle ? 'battle' : finished ? 'complete' : checkpoint ? 'checkpoint' : 'sort', text: item.fact, route: value };
    }
    return { ok: false, text: 'Select an item to inspect before choosing a destination.' };
  }
  function requestReady(session) {
    const m = missions.find(m => m.id === session?.mission);
    return !!(m?.requests?.[session.stop] && session.done.length === m.sets[session.stop].length && !session.complete && session.play?.decisions?.[session.stop] !== m.requests[session.stop].answer);
  }
  function decide(session, action, answer) {
    if (!requestReady(session)) return { ok: false, text: 'Finish this area before answering its community request.' };
    const m = missions.find(m => m.id === session.mission), q = m.requests[session.stop];
    if (action === 'decision-hint') { session.hints++; return { ok: true, kind: 'hint', text: q.choices.find(c => c.id === q.answer).feedback }; }
    const choice = q.choices.find(c => c.id === answer);
    if (!choice) return { ok: false, text: 'Choose one of the community plans.' };
    const play = P.hydrate(session);
    if (answer !== q.answer) { session.mistakes++; play.streak = 0; return { ok: false, kind: 'retry', text: choice.feedback + ' Try another plan.' }; }
    play.decisions ||= {}; play.decisions[session.stop] = answer; session.score += 50;
    const finished = session.stop === m.sets.length - 1;
    session.complete = finished && !P.isBattle(m.id);
    return { ok: true, kind: finished ? session.complete ? 'complete' : 'battle' : 'checkpoint', text: q.success };
  }
  function nextStop(session) {
    if (!validSession(session) || session.complete) return false;
    const m = missions.find(m => m.id === session.mission);
    if (session.done.length !== m.sets[session.stop].length || session.stop + 1 >= m.sets.length) return false;
    if (requestReady(session)) return false;
    if (session.play && !session.play.restored[session.stop]) return false;
    session.stop++; session.done = []; session.prepared = []; session.selected = null;
    session.checkpointScore = session.score; session.checkpointMistakes = session.mistakes; session.checkpointHints = session.hints;
    return true;
  }
  function retryStop(session) {
    if (!validSession(session)) return false;
    const m = missions.find(m => m.id === session.mission);
    session.score = session.checkpointScore; session.mistakes = session.checkpointMistakes; session.hints = session.checkpointHints;
    if (session.play) { for (const key of Object.keys(session.play.work)) if (key.startsWith(`${session.stop}-`)) delete session.play.work[key]; delete session.play.restored[session.stop]; if (session.play.decisions) delete session.play.decisions[session.stop]; session.play.streak = 0; session.play.energy = m.sets.slice(0, session.stop).reduce((n, set) => n + set.length, 0); session.play.bossHits = 0; session.play.wisps = []; }
    session.done = []; session.prepared = []; session.selected = null; session.complete = false;
    return true;
  }
  function finish(save, session) {
    if (!validSession(session) || !session.complete) return false;
    const index = missions.findIndex(m => m.id === session.mission);
    const stars = session.mistakes === 0 && session.hints === 0 ? 3 : session.mistakes <= 3 ? 2 : 1;
    save.stars[session.mission] = Math.max(save.stars[session.mission] || 0, stars);
    save.results[session.mission] = { score: Math.max(save.results[session.mission]?.score || 0, session.score) };
    save.unlocked = Math.max(save.unlocked, index + 1);
    return stars;
  }
  function progress(session) {
    const m = missions.find(m => m.id === session.mission);
    const total = m.sets.reduce((n, s) => n + s.length, 0);
    const done = m.sets.slice(0, session.stop).reduce((n, s) => n + s.length, 0) + session.done.length;
    return { done, total, fraction: done / total };
  }
  return { SAVE_KEY, SOURCES, routes, items, preparations, play: P, missions, fresh, normalize, validSession, requestReady, selectedItem, act, nextStop, retryStop, finish, progress };
});
