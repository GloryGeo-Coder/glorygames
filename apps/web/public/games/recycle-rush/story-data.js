/* Recycle Rush: Restore Verdale. Pure mission rules; also used by regression tests. */
(function (root, factory) {
  const common = typeof module === 'object' && module.exports;
  const api = factory(common ? require('./story-play.js') : root.RecyclePlay, common ? require('./story-dispatch.js') : root.RecycleDispatch);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RecycleLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (P, D) {
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
      "restoration": "Warm lights return to the market square. The school and market teams now share a working recovery loop. Musa invites Circuit onto the collection routes next.",
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
    },
    {
      "id": "collection-round",
      "title": "Musa’s Collection Round",
      "subtitle": "Recovery district · pickups & deliveries",
      "ally": "Musa · community collector",
      "intro": "With the school and market restored, Musa invites Circuit on his collection round. The community points need a reliable route into the recovery district. Help him pick up prepared loads and deliver them before the vehicle runs out of room.",
      "goal": "Recover the area, help your neighbour, then plan the pickups and accepted deliveries on Musa’s dispatch board.",
      "background": "assets/backgrounds/bg-community-day.png",
      "stops": [
        "The library collection point",
        "The market return lane",
        "The recovery district gate"
      ],
      "destinations": [
        "paper",
        "containers",
        "reuse",
        "compost"
      ],
      "sets": [
        [
          "box",
          "newspaper",
          "book",
          "bottle",
          "peel",
          "juice"
        ],
        [
          "can",
          "box",
          "tray",
          "book",
          "apple",
          "newspaper"
        ],
        [
          "juice",
          "newspaper",
          "box",
          "peel",
          "bottle",
          "book"
        ]
      ],
      "restoration": "Musa’s first district round is working. The school, library and market can now send prepared loads to the services that accept them.",
      "requests": [
        {
          "prompt": "Musa’s vehicle has space for one more collection load. What makes the next pickup possible?",
          "answer": "deliver",
          "choices": [
            {
              "id": "squash",
              "label": "Push every stream into one mixed load",
              "feedback": "Mixed food, dry paper and special items need different routes."
            },
            {
              "id": "deliver",
              "label": "Deliver the current load to its listed destination",
              "feedback": "Unloading the completed delivery frees collection space."
            },
            {
              "id": "forget",
              "label": "Mark the next pickup done without collecting it",
              "feedback": "The dispatch record should match the visits actually completed."
            }
          ],
          "success": "A completed delivery frees room for the next collection."
        },
        {
          "prompt": "The library has both readable books and dry, unwanted newspapers. Which plan fits their condition?",
          "answer": "split",
          "choices": [
            {
              "id": "split",
              "label": "Share the books and collect newspaper separately",
              "feedback": "Reuse keeps a usable item in service; unwanted dry paper has its own route."
            },
            {
              "id": "tear",
              "label": "Tear up every readable book",
              "feedback": "Check whether a book can be shared before recycling its fibres."
            },
            {
              "id": "mixed",
              "label": "Mix both with the food-compost load",
              "feedback": "Food scraps and clean paper should remain separate."
            }
          ],
          "success": "Musa’s route can support both reuse and paper recovery without mixing their purposes."
        },
        {
          "prompt": "A collection point has changed its accepted materials. What should Circuit use when planning the round?",
          "answer": "current",
          "choices": [
            {
              "id": "memory",
              "label": "The colours used by a different town",
              "feedback": "Bin colours do not give a universal acceptance rule."
            },
            {
              "id": "old",
              "label": "An old list even if the service has changed",
              "feedback": "Acceptance lists can differ and should be checked."
            },
            {
              "id": "current",
              "label": "The current service board and labels",
              "feedback": "Use the current local guidance for each destination."
            }
          ],
          "success": "The route follows the service that is available here, rather than guessing from a colour."
        }
      ],
      "dispatch": [
        {
          "title": "Round 1 · The library collection point",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 4,
          "separate": false,
          "loads": [
            {
              "id": "paper",
              "label": "Dry paper bundles",
              "item": "newspaper",
              "route": "paper",
              "pickup": "Covered paper point",
              "delivery": "Dry paper store",
              "spaces": 2,
              "fact": "Keep clean fibre away from food and moisture."
            },
            {
              "id": "containers",
              "label": "Empty accepted containers",
              "item": "bottle",
              "route": "containers",
              "pickup": "Container collection point",
              "delivery": "Container intake",
              "spaces": 2,
              "fact": "This service accepts these empty containers."
            }
          ]
        },
        {
          "title": "Round 2 · The market return lane",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 3,
          "separate": false,
          "loads": [
            {
              "id": "reuse",
              "label": "Readable books for sharing",
              "item": "book",
              "route": "reuse",
              "pickup": "Library exchange point",
              "delivery": "Community reuse shelf",
              "spaces": 2,
              "fact": "Usable books can serve another reader."
            },
            {
              "id": "paper",
              "label": "Dry paper bundles",
              "item": "newspaper",
              "route": "paper",
              "pickup": "Covered paper point",
              "delivery": "Dry paper store",
              "spaces": 2,
              "fact": "Keep clean fibre away from food and moisture."
            }
          ]
        },
        {
          "title": "Round 3 · The recovery district gate",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 3,
          "separate": false,
          "loads": [
            {
              "id": "containers",
              "label": "Empty accepted containers",
              "item": "bottle",
              "route": "containers",
              "pickup": "Container collection point",
              "delivery": "Container intake",
              "spaces": 2,
              "fact": "This service accepts these empty containers."
            },
            {
              "id": "paper",
              "label": "Dry paper bundles",
              "item": "newspaper",
              "route": "paper",
              "pickup": "Covered paper point",
              "delivery": "Dry paper store",
              "spaces": 2,
              "fact": "Keep clean fibre away from food and moisture."
            }
          ]
        }
      ]
    },
    {
      "id": "dry-store",
      "title": "Keep the Fibre Dry",
      "subtitle": "Recovery district · quality under cover",
      "ally": "Nandi & Musa",
      "intro": "A rain front is closing in on the covered loading bays. Nandi has protected the dry-paper store, but the route must keep wet food caddies away from the clean fibre loads.",
      "goal": "Prepare the packaging, protect dry paper and complete separate-load dispatch rounds before reopening the store.",
      "background": "assets/backgrounds/bg-recovery-district.webp",
      "stops": [
        "The covered paper bay",
        "The separate food round",
        "The dry-store entrance"
      ],
      "destinations": [
        "paper",
        "compost",
        "containers",
        "residual"
      ],
      "sets": [
        [
          "box",
          "wetpaper",
          "peel",
          "newspaper",
          "tray",
          "juice"
        ],
        [
          "apple",
          "box",
          "newspaper",
          "tray",
          "peel",
          "wetpaper"
        ],
        [
          "juice",
          "box",
          "wetpaper",
          "can",
          "apple",
          "newspaper"
        ]
      ],
      "restoration": "The paper store is sheltered and the separate collection rounds are running. Nandi can keep the food caddies away from the clean fibre store.",
      "requests": [
        {
          "prompt": "Rain is approaching the loading bay. Which load should be protected from moisture?",
          "answer": "paper",
          "choices": [
            {
              "id": "food",
              "label": "Mix the paper into the food caddy",
              "feedback": "Food and moisture can contaminate the dry paper stream."
            },
            {
              "id": "paper",
              "label": "The clean, dry paper and cardboard",
              "feedback": "Covered, labelled storage helps keep paper useful."
            },
            {
              "id": "wet",
              "label": "Soak the cardboard before collection",
              "feedback": "This paper service expects clean, dry materials."
            }
          ],
          "success": "The dry-paper shelter protects the fibre collection while the team prepares the route."
        },
        {
          "prompt": "Why does today’s quality round deliver the food caddy before collecting the dry paper?",
          "answer": "apart",
          "choices": [
            {
              "id": "apart",
              "label": "This round keeps food and dry paper loads apart",
              "feedback": "Separate handling helps protect the clean paper from wet food."
            },
            {
              "id": "same",
              "label": "Food and paper should always be mixed",
              "feedback": "Wet scraps can contaminate clean paper."
            },
            {
              "id": "colour",
              "label": "One universal bin colour requires it",
              "feedback": "Follow the local project’s handling guidance, not a universal colour."
            }
          ],
          "success": "The dispatch board asks for separate loads so the paper stays away from wet scraps."
        },
        {
          "prompt": "A wet, greasy wrapper is placed beside clean cardboard. Which guidance applies here?",
          "answer": "residual",
          "choices": [
            {
              "id": "dry",
              "label": "Call it clean paper because it has dried",
              "feedback": "Food-soiling can remain even after moisture has gone."
            },
            {
              "id": "compost",
              "label": "Put it into any compost project",
              "feedback": "This supervised food-compost project does not accept that wrapper."
            },
            {
              "id": "residual",
              "label": "Use this service’s residual-waste route",
              "feedback": "Our service excludes this food-soiled wrapper from its paper and compost streams."
            }
          ],
          "success": "Condition matters: this wrapper follows the local residual guidance, while clean cardboard stays separate."
        }
      ],
      "dispatch": [
        {
          "title": "Round 1 · The covered paper bay",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room. This round keeps its two material streams on separate trips.",
          "capacity": 4,
          "separate": true,
          "loads": [
            {
              "id": "paper",
              "label": "Dry paper bundles",
              "item": "newspaper",
              "route": "paper",
              "pickup": "Covered paper point",
              "delivery": "Dry paper store",
              "spaces": 2,
              "fact": "Keep clean fibre away from food and moisture."
            },
            {
              "id": "food",
              "label": "Listed food-scrap caddy",
              "item": "apple",
              "route": "compost",
              "pickup": "Supervised food point",
              "delivery": "Food-compost project",
              "spaces": 2,
              "fact": "The project accepts listed food scraps, without packaging."
            }
          ]
        },
        {
          "title": "Round 2 · The separate food round",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room. This round keeps its two material streams on separate trips.",
          "capacity": 4,
          "separate": true,
          "loads": [
            {
              "id": "food",
              "label": "Listed food-scrap caddy",
              "item": "apple",
              "route": "compost",
              "pickup": "Supervised food point",
              "delivery": "Food-compost project",
              "spaces": 2,
              "fact": "The project accepts listed food scraps, without packaging."
            },
            {
              "id": "paper",
              "label": "Dry paper bundles",
              "item": "newspaper",
              "route": "paper",
              "pickup": "Covered paper point",
              "delivery": "Dry paper store",
              "spaces": 2,
              "fact": "Keep clean fibre away from food and moisture."
            }
          ]
        },
        {
          "title": "Round 3 · The dry-store entrance",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 3,
          "separate": false,
          "loads": [
            {
              "id": "containers",
              "label": "Empty accepted containers",
              "item": "bottle",
              "route": "containers",
              "pickup": "Container collection point",
              "delivery": "Container intake",
              "spaces": 2,
              "fact": "This service accepts these empty containers."
            },
            {
              "id": "paper",
              "label": "Dry paper bundles",
              "item": "newspaper",
              "route": "paper",
              "pickup": "Covered paper point",
              "delivery": "Dry paper store",
              "spaces": 2,
              "fact": "Keep clean fibre away from food and moisture."
            }
          ]
        }
      ]
    },
    {
      "id": "centre-connections",
      "title": "The Right Destination",
      "subtitle": "Recovery district · service connections",
      "ally": "Lebo · recovery coordinator",
      "intro": "Lebo welcomes Circuit at the recovery centre. Some packaging accepted here is not collected by Musa’s street service. The team needs clear labels and deliveries that match the current acceptance board.",
      "goal": "Read each item’s condition and this centre’s acceptance list, then connect the collected loads to their listed destinations.",
      "background": "assets/backgrounds/bg-buyback-centre.png",
      "stops": [
        "Lebo’s welcome desk",
        "The acceptance board",
        "The centre delivery bays"
      ],
      "destinations": [
        "paper",
        "containers",
        "centre",
        "special"
      ],
      "sets": [
        [
          "carton",
          "glass",
          "box",
          "juice",
          "battery",
          "can"
        ],
        [
          "bottle",
          "carton",
          "glass",
          "newspaper",
          "box",
          "battery"
        ],
        [
          "glass",
          "juice",
          "carton",
          "can",
          "newspaper",
          "box"
        ]
      ],
      "restoration": "Lebo’s service board connects the collection points to accepted recovery routes. Intact glass, empty cartons, paper and containers reach their listed services.",
      "requests": [
        {
          "prompt": "Lebo finds an empty drink carton in the street-container load. What should happen here?",
          "answer": "centre",
          "choices": [
            {
              "id": "paper",
              "label": "Treat it as ordinary paper without checking",
              "feedback": "Different services accept different packaging types."
            },
            {
              "id": "centre",
              "label": "Send it to the centre that lists cartons",
              "feedback": "Our recovery centre accepts these empty cartons; this street service does not."
            },
            {
              "id": "any",
              "label": "Leave it in whichever load is closest",
              "feedback": "Follow the accepted route on the local board."
            }
          ],
          "success": "Lebo’s accepted-material list gives the carton a recovery route at this centre."
        },
        {
          "prompt": "A bottle’s symbol alone does not tell Circuit whether the local service collects it. What else should be checked?",
          "answer": "list",
          "choices": [
            {
              "id": "list",
              "label": "The collector’s accepted-material list",
              "feedback": "Packaging information and local acceptance should be checked together."
            },
            {
              "id": "guess",
              "label": "The nearest bin colour only",
              "feedback": "Bin colours do not give a universal acceptance rule."
            },
            {
              "id": "speed",
              "label": "Whichever destination is quickest to tap",
              "feedback": "The accepted route matters more than rushing."
            }
          ],
          "success": "A recovery route depends on the facilities and collection service available here."
        },
        {
          "prompt": "An intact glass bottle and a broken one arrive at the centre. Which action is appropriate?",
          "answer": "help",
          "choices": [
            {
              "id": "bare",
              "label": "Collect the broken pieces with bare hands",
              "feedback": "Do not handle broken glass."
            },
            {
              "id": "mix",
              "label": "Hide the pieces in a paper bundle",
              "feedback": "Keep broken glass out of the dry paper stream and ask for trained help."
            },
            {
              "id": "help",
              "label": "Ask a trained worker to handle the broken glass",
              "feedback": "The playable glass items are intact; broken glass needs appropriate adult or trained help."
            }
          ],
          "success": "Lebo arranges trained help and keeps the ordinary collection streams clear."
        }
      ],
      "dispatch": [
        {
          "title": "Round 1 · Lebo’s welcome desk",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 3,
          "separate": false,
          "loads": [
            {
              "id": "cartons",
              "label": "Empty drink cartons",
              "item": "carton",
              "route": "centre",
              "pickup": "Carton holding point",
              "delivery": "Listed carton recovery bay",
              "spaces": 2,
              "fact": "This centre lists these empty cartons on its acceptance board."
            },
            {
              "id": "containers",
              "label": "Empty accepted containers",
              "item": "bottle",
              "route": "containers",
              "pickup": "Container collection point",
              "delivery": "Container intake",
              "spaces": 2,
              "fact": "This service accepts these empty containers."
            }
          ]
        },
        {
          "title": "Round 2 · The acceptance board",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 3,
          "separate": false,
          "loads": [
            {
              "id": "glass",
              "label": "Intact glass bottles",
              "item": "glass",
              "route": "centre",
              "pickup": "Supervised glass point",
              "delivery": "Listed intact-glass bay",
              "spaces": 2,
              "fact": "Trained staff handle the physical delivery; do not handle broken glass."
            },
            {
              "id": "paper",
              "label": "Dry paper bundles",
              "item": "newspaper",
              "route": "paper",
              "pickup": "Covered paper point",
              "delivery": "Dry paper store",
              "spaces": 2,
              "fact": "Keep clean fibre away from food and moisture."
            }
          ]
        },
        {
          "title": "Round 3 · The centre delivery bays",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 3,
          "separate": false,
          "loads": [
            {
              "id": "cartons",
              "label": "Empty drink cartons",
              "item": "carton",
              "route": "centre",
              "pickup": "Carton holding point",
              "delivery": "Listed carton recovery bay",
              "spaces": 2,
              "fact": "This centre lists these empty cartons on its acceptance board."
            },
            {
              "id": "glass",
              "label": "Intact glass bottles",
              "item": "glass",
              "route": "centre",
              "pickup": "Supervised glass point",
              "delivery": "Listed intact-glass bay",
              "spaces": 2,
              "fact": "Trained staff handle the physical delivery; do not handle broken glass."
            }
          ]
        }
      ]
    },
    {
      "id": "load-by-load",
      "title": "Load by Load",
      "subtitle": "Recovery district · space & records",
      "ally": "Lebo & Musa",
      "intro": "The recovery district is busy again. A confused intake record and bulky collection loads are slowing the team down. Circuit helps verify what arrived and plans deliveries that make room for the next pickup.",
      "goal": "Keep the intake record honest, flatten bulky packaging and finish each dispatch round within its vehicle-space limit.",
      "background": "assets/backgrounds/bg-material-recovery-facility.png",
      "stops": [
        "The intake record",
        "The prepared-load shelter",
        "The dispatch desk"
      ],
      "destinations": [
        "paper",
        "containers",
        "reuse",
        "centre"
      ],
      "sets": [
        [
          "box",
          "book",
          "carton",
          "juice",
          "newspaper",
          "glass"
        ],
        [
          "box",
          "tray",
          "bottle",
          "book",
          "can",
          "carton"
        ],
        [
          "newspaper",
          "glass",
          "box",
          "juice",
          "carton",
          "shirt"
        ]
      ],
      "restoration": "The intake record matches the completed visits. Musa and Lebo can see which prepared loads arrived and where they were delivered.",
      "requests": [
        {
          "prompt": "Lebo’s intake list says two paper bundles arrived, but only one is visible. What should the team do?",
          "answer": "check",
          "choices": [
            {
              "id": "invent",
              "label": "Count an extra bundle to match the list",
              "feedback": "Records should describe the actual collection."
            },
            {
              "id": "check",
              "label": "Check the delivery with Musa before recording it",
              "feedback": "Verify the load before confirming its arrival."
            },
            {
              "id": "delete",
              "label": "Remove the whole route without checking",
              "feedback": "A discrepancy can be checked and corrected."
            }
          ],
          "success": "Musa and Lebo check the delivery so the intake record reflects what actually arrived."
        },
        {
          "prompt": "A bulky empty box occupies room on the collection trolley. What helps before dispatch?",
          "answer": "flat",
          "choices": [
            {
              "id": "flat",
              "label": "Flatten it and keep it clean and dry",
              "feedback": "Flat cardboard uses less collection space."
            },
            {
              "id": "food",
              "label": "Fill it with wet food to save a caddy",
              "feedback": "Wet food can contaminate clean cardboard."
            },
            {
              "id": "glass",
              "label": "Hide glass pieces in it",
              "feedback": "Broken glass needs trained handling and must not be hidden in paper."
            }
          ],
          "success": "Prepared cardboard makes better use of the collection space."
        },
        {
          "prompt": "The route is complete. Which record helps the collection team follow its work?",
          "answer": "visits",
          "choices": [
            {
              "id": "guess",
              "label": "A guessed weight and payment",
              "feedback": "The game does not measure real weights or calculate payments."
            },
            {
              "id": "colour",
              "label": "Only the colour of a bin",
              "feedback": "A colour alone does not identify the load and destination."
            },
            {
              "id": "visits",
              "label": "The actual pickups and accepted deliveries",
              "feedback": "The visit record shows which loads reached their listed destinations."
            }
          ],
          "success": "A clear dispatch record connects a collected load with its actual delivery."
        }
      ],
      "dispatch": [
        {
          "title": "Round 1 · The intake record",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 3,
          "separate": false,
          "loads": [
            {
              "id": "paper",
              "label": "Dry paper bundles",
              "item": "newspaper",
              "route": "paper",
              "pickup": "Covered paper point",
              "delivery": "Dry paper store",
              "spaces": 2,
              "fact": "Keep clean fibre away from food and moisture."
            },
            {
              "id": "reuse",
              "label": "Readable books for sharing",
              "item": "book",
              "route": "reuse",
              "pickup": "Library exchange point",
              "delivery": "Community reuse shelf",
              "spaces": 2,
              "fact": "Usable books can serve another reader."
            }
          ]
        },
        {
          "title": "Round 2 · The prepared-load shelter",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 3,
          "separate": false,
          "loads": [
            {
              "id": "containers",
              "label": "Empty accepted containers",
              "item": "bottle",
              "route": "containers",
              "pickup": "Container collection point",
              "delivery": "Container intake",
              "spaces": 2,
              "fact": "This service accepts these empty containers."
            },
            {
              "id": "cartons",
              "label": "Empty drink cartons",
              "item": "carton",
              "route": "centre",
              "pickup": "Carton holding point",
              "delivery": "Listed carton recovery bay",
              "spaces": 2,
              "fact": "This centre lists these empty cartons on its acceptance board."
            }
          ]
        },
        {
          "title": "Round 3 · The dispatch desk",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 4,
          "separate": false,
          "loads": [
            {
              "id": "paper",
              "label": "Dry paper bundles",
              "item": "newspaper",
              "route": "paper",
              "pickup": "Covered paper point",
              "delivery": "Dry paper store",
              "spaces": 2,
              "fact": "Keep clean fibre away from food and moisture."
            },
            {
              "id": "glass",
              "label": "Intact glass bottles",
              "item": "glass",
              "route": "centre",
              "pickup": "Supervised glass point",
              "delivery": "Listed intact-glass bay",
              "spaces": 2,
              "fact": "Trained staff handle the physical delivery; do not handle broken glass."
            }
          ]
        }
      ]
    },
    {
      "id": "recovery-rise",
      "title": "The Recovery District Rises",
      "subtitle": "Recovery district · Grime showdown",
      "ally": "Circuit & the collection team",
      "intro": "Grime coils around the district gate, breaking the connection between collection points and recovery services. The community joins Musa and Lebo for one final round. Correct recovery tasks and completed deliveries will reopen the network.",
      "goal": "Complete all recovery tasks, community requests and dispatch rounds, then clear Grime with three charged Loop Pulses.",
      "background": "assets/backgrounds/bg-recovery-district.webp",
      "stops": [
        "The blocked collection gate",
        "Reconnect the services",
        "The district restoration station"
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
          "box",
          "juice",
          "book",
          "peel",
          "battery",
          "carton"
        ],
        [
          "radio",
          "wetpaper",
          "glass",
          "shirt",
          "tray",
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
      "restoration": "The recovery district is connected again. The school and market now have reliable collection links and accepted delivery points. Sam’s workshop is next to ask for Circuit’s help.",
      "requests": [
        {
          "prompt": "Grime blocks the recovery district. What gives Circuit a working route through the problem?",
          "answer": "team",
          "choices": [
            {
              "id": "solo",
              "label": "Mix every load and send it to one machine",
              "feedback": "The recovery loop depends on separate accepted routes."
            },
            {
              "id": "team",
              "label": "Prepare, separate and deliver with the team",
              "feedback": "Musa’s collections and Lebo’s accepted destinations work together."
            },
            {
              "id": "skip",
              "label": "Skip all preparation and dispatch checks",
              "feedback": "Unprepared or misrouted material can spoil the recovery loop."
            }
          ],
          "success": "Circuit brings the neighbourhood’s collection and recovery work together."
        },
        {
          "prompt": "Sam offers to assess a silent radio while Lebo receives packaging. Which plan fits those roles?",
          "answer": "sam",
          "choices": [
            {
              "id": "sam",
              "label": "Give the radio to Sam’s qualified repair service",
              "feedback": "Electrical assessment and testing belong with a qualified repairer."
            },
            {
              "id": "open",
              "label": "Open the radio on the collection route",
              "feedback": "Do not dismantle electronics yourself."
            },
            {
              "id": "can",
              "label": "Place it in the empty-can load",
              "feedback": "An electrical device is not accepted packaging for that stream."
            }
          ],
          "success": "The recovery district connects people to the right service, including qualified repair."
        },
        {
          "prompt": "The final load has reached its listed destination. What powers the district’s restoration?",
          "answer": "loop",
          "choices": [
            {
              "id": "all",
              "label": "Calling every discarded item recyclable everywhere",
              "feedback": "Acceptance depends on material, condition and available services."
            },
            {
              "id": "hazard",
              "label": "Opening batteries to make more energy cells",
              "feedback": "Never open batteries or handle damaged ones."
            },
            {
              "id": "loop",
              "label": "The correctly prepared, separated and delivered materials",
              "feedback": "Circuit’s Loop Pulse is powered by the recovery tasks completed with the community."
            }
          ],
          "success": "The district is ready. Clear Grime’s clouds and power The Loop together."
        }
      ],
      "dispatch": [
        {
          "title": "Round 1 · The blocked collection gate",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 2,
          "separate": false,
          "loads": [
            {
              "id": "paper",
              "label": "Dry paper bundles",
              "item": "newspaper",
              "route": "paper",
              "pickup": "Covered paper point",
              "delivery": "Dry paper store",
              "spaces": 2,
              "fact": "Keep clean fibre away from food and moisture."
            },
            {
              "id": "containers",
              "label": "Empty accepted containers",
              "item": "bottle",
              "route": "containers",
              "pickup": "Container collection point",
              "delivery": "Container intake",
              "spaces": 2,
              "fact": "This service accepts these empty containers."
            }
          ]
        },
        {
          "title": "Round 2 · Reconnect the services",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 3,
          "separate": false,
          "loads": [
            {
              "id": "reuse",
              "label": "Readable books for sharing",
              "item": "book",
              "route": "reuse",
              "pickup": "Library exchange point",
              "delivery": "Community reuse shelf",
              "spaces": 2,
              "fact": "Usable books can serve another reader."
            },
            {
              "id": "cartons",
              "label": "Empty drink cartons",
              "item": "carton",
              "route": "centre",
              "pickup": "Carton holding point",
              "delivery": "Listed carton recovery bay",
              "spaces": 2,
              "fact": "This centre lists these empty cartons on its acceptance board."
            }
          ]
        },
        {
          "title": "Round 3 · The district restoration station",
          "brief": "Musa and the trained collection team handle the loads. Choose each pickup and its listed delivery. Load spaces show the vehicle’s available room.",
          "capacity": 3,
          "separate": false,
          "loads": [
            {
              "id": "containers",
              "label": "Empty accepted containers",
              "item": "bottle",
              "route": "containers",
              "pickup": "Container collection point",
              "delivery": "Container intake",
              "spaces": 2,
              "fact": "This service accepts these empty containers."
            },
            {
              "id": "paper",
              "label": "Dry paper bundles",
              "item": "newspaper",
              "route": "paper",
              "pickup": "Covered paper point",
              "delivery": "Dry paper store",
              "spaces": 2,
              "fact": "Keep clean fibre away from food and moisture."
            }
          ]
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
    if (!D.valid(value, m)) return false;
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
    if (action === 'dispatch' || action === 'dispatch-hint') return dispatchAction(session, m, action, value);
    if (action === 'decision' || action === 'decision-hint') return decide(session, action, value);
    if (action === 'restore') { if (requestReady(session) || D.pending(session, m)) return { ok: false, text: 'Complete the community request and collection dispatch first.' }; return P.restore(session, value); }
    if (action === 'wisp' || action === 'pulse') { if (requestReady(session) || D.pending(session, m)) return { ok: false, text: 'Complete the request and deliveries before powering The Loop.' }; return P.battle(session, action, value); }
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
      return { ok: true, kind: checkpoint ? areaKind(session) : 'sort', text: item.fact, route: value };
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
    return { ok: true, kind: areaKind(session), text: q.success };
  }
  function areaKind(session) {
    const m = missions.find(m => m.id === session.mission);
    const finished = session.stop === m.sets.length - 1;
    const kind = requestReady(session) ? 'request' : D.pending(session, m) ? 'dispatch' : finished ? P.isBattle(m.id) ? 'battle' : 'complete' : 'checkpoint';
    session.complete = kind === 'complete';
    return kind;
  }
  function dispatchReady(session) {
    const m = missions.find(m => m.id === session?.mission);
    return !!m && !requestReady(session) && D.pending(session, m);
  }
  function dispatchAction(session, m, action, id) {
    if (!dispatchReady(session)) return { ok: false, text: 'Complete this area and its community request before planning dispatch.' };
    const plan = m.dispatch[session.stop], record = session.play.dispatch?.[session.stop];
    if (action === 'dispatch-hint') { session.hints++; return { ok: true, kind: 'hint', text: `Next useful stop: ${D.next(plan, record).label}. Check the load spaces and the listed destination.` }; }
    if (!D.jobs(plan).some(job => job.id === id) || record?.done.includes(id)) return { ok: false, text: 'Choose a stop that still needs a visit.' };
    const result = D.act(session, m, id);
    if (!result.ok) { session.mistakes++; session.play.streak = 0; return { ...result, kind: 'retry' }; }
    session.score += 25;
    return { ...result, kind: D.pending(session, m) ? 'dispatch' : areaKind(session) };
  }

  function nextStop(session) {
    if (!validSession(session) || session.complete) return false;
    const m = missions.find(m => m.id === session.mission);
    if (session.done.length !== m.sets[session.stop].length || session.stop + 1 >= m.sets.length) return false;
    if (requestReady(session) || D.pending(session, m)) return false;
    if (session.play && !session.play.restored[session.stop]) return false;
    session.stop++; session.done = []; session.prepared = []; session.selected = null;
    session.checkpointScore = session.score; session.checkpointMistakes = session.mistakes; session.checkpointHints = session.hints;
    return true;
  }
  function retryStop(session) {
    if (!validSession(session)) return false;
    const m = missions.find(m => m.id === session.mission);
    session.score = session.checkpointScore; session.mistakes = session.checkpointMistakes; session.hints = session.checkpointHints;
    if (session.play) { for (const key of Object.keys(session.play.work)) if (key.startsWith(`${session.stop}-`)) delete session.play.work[key]; delete session.play.restored[session.stop]; if (session.play.dispatch) delete session.play.dispatch[session.stop]; if (session.play.decisions) delete session.play.decisions[session.stop]; session.play.streak = 0; session.play.energy = m.sets.slice(0, session.stop).reduce((n, set) => n + set.length, 0); session.play.bossHits = 0; session.play.wisps = []; }
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
  return { SAVE_KEY, SOURCES, routes, items, preparations, play: P, dispatch: D, missions, fresh, normalize, validSession, requestReady, dispatchReady, selectedItem, act, nextStop, retryStop, finish, progress };
});
