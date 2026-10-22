/* Final two story chapters. Authored community requests and dependency-based work orders. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RecycleFinale = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return [
  {
    "id": "repair-row",
    "title": "Repair Row",
    "subtitle": "Repair quarter · assessment before replacement",
    "ally": "Sam · repair technician",
    "intro": "Sam’s courtyard is full of forgotten goods. Grime wants every broken object thrown away before anyone checks it. Reopen the repair desk and help neighbours choose a safe second chance.",
    "goal": "Inspect condition, ask the right expert and record a safe return to use.",
    "background": "assets/backgrounds/bg-repair-courtyard.webp",
    "stops": [
      "The intake desk",
      "The assessment bay",
      "The return counter"
    ],
    "destinations": [
      "repair",
      "reuse",
      "special",
      "paper"
    ],
    "sets": [
      [
        "radio",
        "book",
        "battery",
        "shirt",
        "box",
        "newspaper"
      ],
      [
        "battery",
        "shirt",
        "box",
        "newspaper",
        "radio",
        "book"
      ],
      [
        "box",
        "newspaper",
        "radio",
        "book",
        "battery",
        "shirt"
      ]
    ],
    "restoration": "Sam reopens the repair desk. Neighbours collect tested repairs and usable goods instead of replacing them without a check.",
    "requests": [
      {
        "prompt": "A silent radio arrives at Sam’s desk. What is the useful next step?",
        "answer": "plan",
        "choices": [
          {
            "id": "plan",
            "label": "Ask qualified Sam to assess it",
            "feedback": "A qualified assessment can identify whether a safe repair is possible."
          },
          {
            "id": "shortcut",
            "label": "Open the casing yourself",
            "feedback": "Electrical devices stay closed unless a qualified expert is working on them."
          },
          {
            "id": "mix",
            "label": "Send it straight to ordinary containers",
            "feedback": "Electrical devices do not belong in this ordinary container service."
          }
        ],
        "success": "A qualified assessment can identify whether a safe repair is possible."
      },
      {
        "prompt": "A complete readable book is beside the paper pile. What comes first?",
        "answer": "plan",
        "choices": [
          {
            "id": "shortcut",
            "label": "Shred every page",
            "feedback": "Shredding would end this book’s useful life unnecessarily."
          },
          {
            "id": "mix",
            "label": "Leave it in the rain",
            "feedback": "Rain can spoil a usable book and its recoverable paper."
          },
          {
            "id": "plan",
            "label": "Offer it through the reuse shelf",
            "feedback": "A usable book can serve another reader before its fibres need recycling."
          }
        ],
        "success": "A usable book can serve another reader before its fibres need recycling."
      },
      {
        "prompt": "Who confirms that an electrical repair is safe to return?",
        "answer": "plan",
        "choices": [
          {
            "id": "mix",
            "label": "Circuit without testing",
            "feedback": "The qualified technician must complete the assessment and tests."
          },
          {
            "id": "plan",
            "label": "The qualified repair technician",
            "feedback": "Sam performs the assessment and testing; Circuit helps record the handover."
          },
          {
            "id": "shortcut",
            "label": "Anyone who likes the colour",
            "feedback": "Appearance alone cannot confirm electrical safety."
          }
        ],
        "success": "Sam performs the assessment and testing; Circuit helps record the handover."
      }
    ],
    "orders": [
      {
        "title": "The intake desk · work order",
        "brief": "Help Sam complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Check the radio from outside",
            "requires": [],
            "fact": "Check the radio from outside · checked for the intake desk.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm Sam’s qualified assessment",
            "requires": [],
            "fact": "Confirm Sam’s qualified assessment · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Sam assesses and tests the repair",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Sam assesses and tests the repair. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the tested return to use",
            "requires": [
              "team"
            ],
            "fact": "Record the tested return to use. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Skip assessment and open the casing",
            "fact": "Do not open the casing yourself. Sam performs electrical work."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "team",
          "record",
          "unsafe",
          "skip",
          "check",
          "confirm"
        ]
      },
      {
        "title": "The assessment bay · work order",
        "brief": "Help Sam complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Check the radio from outside",
            "requires": [],
            "fact": "Check the radio from outside · checked for the assessment bay.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm Sam’s qualified assessment",
            "requires": [],
            "fact": "Confirm Sam’s qualified assessment · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Sam assesses and tests the repair",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Sam assesses and tests the repair. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the tested return to use",
            "requires": [
              "team"
            ],
            "fact": "Record the tested return to use. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Skip assessment and open the casing",
            "fact": "Do not open the casing yourself. Sam performs electrical work."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "record",
          "unsafe",
          "skip",
          "check",
          "confirm",
          "team"
        ]
      },
      {
        "title": "The return counter · work order",
        "brief": "Help Sam complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Check the radio from outside",
            "requires": [],
            "fact": "Check the radio from outside · checked for the return counter.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm Sam’s qualified assessment",
            "requires": [],
            "fact": "Confirm Sam’s qualified assessment · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Sam assesses and tests the repair",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Sam assesses and tests the repair. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the tested return to use",
            "requires": [
              "team"
            ],
            "fact": "Record the tested return to use. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Skip assessment and open the casing",
            "fact": "Do not open the casing yourself. Sam performs electrical work."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "unsafe",
          "skip",
          "check",
          "confirm",
          "team",
          "record"
        ]
      }
    ]
  },
  {
    "id": "sharing-shelves",
    "title": "The Sharing Shelves",
    "subtitle": "Repair quarter · reuse before recycling",
    "ally": "Nandi & Sam",
    "intro": "The library needs books and the school needs uniforms. Useful goods are arriving in the wrong streams. Circuit can reconnect them with the people who need them.",
    "goal": "Protect usable goods and organise a checked, labelled exchange.",
    "background": "assets/backgrounds/bg-repair-courtyard.webp",
    "stops": [
      "The book drive",
      "The uniform exchange",
      "The neighbourhood library"
    ],
    "destinations": [
      "reuse",
      "paper",
      "repair"
    ],
    "sets": [
      [
        "book",
        "shirt",
        "box",
        "newspaper",
        "radio",
        "book"
      ],
      [
        "box",
        "newspaper",
        "radio",
        "book",
        "book",
        "shirt"
      ],
      [
        "radio",
        "book",
        "book",
        "shirt",
        "box",
        "newspaper"
      ]
    ],
    "restoration": "Books reach new readers and wearable uniforms find new owners. The exchange now has a clear check-in and collection routine.",
    "requests": [
      {
        "prompt": "The book drive has clean, complete story books. Which plan keeps them useful?",
        "answer": "plan",
        "choices": [
          {
            "id": "shortcut",
            "label": "Mix them with food scraps",
            "feedback": "Food can spoil books and dry paper."
          },
          {
            "id": "mix",
            "label": "Recycle them without a reuse check",
            "feedback": "Check for a useful second life before recycling usable goods."
          },
          {
            "id": "plan",
            "label": "Check and offer them to readers",
            "feedback": "Condition checks help the exchange offer usable books."
          }
        ],
        "success": "Condition checks help the exchange offer usable books."
      },
      {
        "prompt": "A clean wearable uniform arrives. Where does it belong here?",
        "answer": "plan",
        "choices": [
          {
            "id": "mix",
            "label": "The empty-container station",
            "feedback": "This service accepts packaging there, not clothing."
          },
          {
            "id": "plan",
            "label": "The checked clothing exchange",
            "feedback": "This exchange accepts clean, wearable clothes."
          },
          {
            "id": "shortcut",
            "label": "The food-compost caddy",
            "feedback": "Clothes do not belong in this food-compost project."
          }
        ],
        "success": "This exchange accepts clean, wearable clothes."
      },
      {
        "prompt": "What helps a neighbour choose a shared item?",
        "answer": "plan",
        "choices": [
          {
            "id": "plan",
            "label": "A clear condition label",
            "feedback": "Honest condition information makes the exchange useful."
          },
          {
            "id": "shortcut",
            "label": "Hide missing parts",
            "feedback": "The recipient needs accurate condition information."
          },
          {
            "id": "mix",
            "label": "Claim every item is brand new",
            "feedback": "Shared items need truthful descriptions, not invented claims."
          }
        ],
        "success": "Honest condition information makes the exchange useful."
      }
    ],
    "orders": [
      {
        "title": "The book drive · work order",
        "brief": "Help Nandi & Sam complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "book",
        "steps": [
          {
            "id": "check",
            "label": "Check the book is complete and usable",
            "requires": [],
            "fact": "Check the book is complete and usable · checked for the book drive.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm a reader’s exchange request",
            "requires": [],
            "fact": "Confirm a reader’s exchange request · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Offer the checked book on the shelf",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Offer the checked book on the shelf. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the new reader’s collection",
            "requires": [
              "team"
            ],
            "fact": "Record the new reader’s collection. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Shred the usable book immediately",
            "fact": "A usable book has a reuse opportunity before material recycling."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "record",
          "unsafe",
          "skip",
          "check",
          "confirm",
          "team"
        ]
      },
      {
        "title": "The uniform exchange · work order",
        "brief": "Help Nandi & Sam complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "book",
        "steps": [
          {
            "id": "check",
            "label": "Check the book is complete and usable",
            "requires": [],
            "fact": "Check the book is complete and usable · checked for the uniform exchange.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm a reader’s exchange request",
            "requires": [],
            "fact": "Confirm a reader’s exchange request · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Offer the checked book on the shelf",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Offer the checked book on the shelf. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the new reader’s collection",
            "requires": [
              "team"
            ],
            "fact": "Record the new reader’s collection. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Shred the usable book immediately",
            "fact": "A usable book has a reuse opportunity before material recycling."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "unsafe",
          "skip",
          "check",
          "confirm",
          "team",
          "record"
        ]
      },
      {
        "title": "The neighbourhood library · work order",
        "brief": "Help Nandi & Sam complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "book",
        "steps": [
          {
            "id": "check",
            "label": "Check the book is complete and usable",
            "requires": [],
            "fact": "Check the book is complete and usable · checked for the neighbourhood library.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm a reader’s exchange request",
            "requires": [],
            "fact": "Confirm a reader’s exchange request · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Offer the checked book on the shelf",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Offer the checked book on the shelf. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the new reader’s collection",
            "requires": [
              "team"
            ],
            "fact": "Record the new reader’s collection. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Shred the usable book immediately",
            "fact": "A usable book has a reuse opportunity before material recycling."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "skip",
          "check",
          "confirm",
          "team",
          "record",
          "unsafe"
        ]
      }
    ]
  },
  {
    "id": "care-and-keep",
    "title": "Care and Keep",
    "subtitle": "Repair quarter · making goods last",
    "ally": "Sam & Professor Loop",
    "intro": "The repair queue is shrinking, but Grime whispers that new is always better. Help the workshop teach safe care, thoughtful reuse and expert assessment before replacement.",
    "goal": "Separate safe care from specialist repair, then help neighbours keep useful items in service.",
    "background": "assets/backgrounds/bg-repair-courtyard.webp",
    "stops": [
      "The care counter",
      "The repair queue",
      "The keep-it-working station"
    ],
    "destinations": [
      "repair",
      "reuse",
      "special",
      "paper"
    ],
    "sets": [
      [
        "radio",
        "shirt",
        "book",
        "battery",
        "box",
        "newspaper"
      ],
      [
        "book",
        "battery",
        "box",
        "newspaper",
        "radio",
        "shirt"
      ],
      [
        "box",
        "newspaper",
        "radio",
        "shirt",
        "book",
        "battery"
      ]
    ],
    "restoration": "Sam’s care station opens. Neighbours know when a simple reuse check is enough and when qualified help is needed.",
    "requests": [
      {
        "prompt": "A neighbour wants to replace a quiet radio without checking it. What can Sam offer?",
        "answer": "plan",
        "choices": [
          {
            "id": "mix",
            "label": "Instructions to open it at home",
            "feedback": "Electrical assessment and repair stay with qualified people."
          },
          {
            "id": "plan",
            "label": "A qualified assessment first",
            "feedback": "A safe assessment may reveal a repair option before replacement."
          },
          {
            "id": "shortcut",
            "label": "A promise every device can be repaired",
            "feedback": "Some devices cannot be safely or sensibly repaired."
          }
        ],
        "success": "A safe assessment may reveal a repair option before replacement."
      },
      {
        "prompt": "Which action can extend a usable item’s life?",
        "answer": "plan",
        "choices": [
          {
            "id": "plan",
            "label": "Follow its safe care guidance",
            "feedback": "Appropriate care and reuse can keep useful goods in service."
          },
          {
            "id": "shortcut",
            "label": "Ignore visible damage",
            "feedback": "Damage may require expert help or a different route."
          },
          {
            "id": "mix",
            "label": "Use it in ways it was not designed for",
            "feedback": "Follow the item’s own safe-use guidance."
          }
        ],
        "success": "Appropriate care and reuse can keep useful goods in service."
      },
      {
        "prompt": "Sam says a device cannot be safely repaired. What next?",
        "answer": "plan",
        "choices": [
          {
            "id": "shortcut",
            "label": "Put it with clean paper",
            "feedback": "Electrical devices cannot join this paper collection."
          },
          {
            "id": "mix",
            "label": "Break it apart for the bins",
            "feedback": "Do not dismantle electrical devices yourself."
          },
          {
            "id": "plan",
            "label": "Confirm an accepted specialist route",
            "feedback": "Ask the trained team to confirm an approved collection service."
          }
        ],
        "success": "Ask the trained team to confirm an approved collection service."
      }
    ],
    "orders": [
      {
        "title": "The care counter · work order",
        "brief": "Help Sam & Professor Loop complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Read the device’s safe care guidance",
            "requires": [],
            "fact": "Read the device’s safe care guidance · checked for the care counter.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm a qualified repair appointment",
            "requires": [],
            "fact": "Confirm a qualified repair appointment · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Sam assesses the reported fault",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Sam assesses the reported fault. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record Sam’s safe next destination",
            "requires": [
              "team"
            ],
            "fact": "Record Sam’s safe next destination. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Guarantee every device is repairable",
            "fact": "A device needs qualified assessment; do not promise every fault can be repaired."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "unsafe",
          "skip",
          "check",
          "confirm",
          "team",
          "record"
        ]
      },
      {
        "title": "The repair queue · work order",
        "brief": "Help Sam & Professor Loop complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Read the device’s safe care guidance",
            "requires": [],
            "fact": "Read the device’s safe care guidance · checked for the repair queue.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm a qualified repair appointment",
            "requires": [],
            "fact": "Confirm a qualified repair appointment · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Sam assesses the reported fault",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Sam assesses the reported fault. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record Sam’s safe next destination",
            "requires": [
              "team"
            ],
            "fact": "Record Sam’s safe next destination. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Guarantee every device is repairable",
            "fact": "A device needs qualified assessment; do not promise every fault can be repaired."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "skip",
          "check",
          "confirm",
          "team",
          "record",
          "unsafe"
        ]
      },
      {
        "title": "The keep-it-working station · work order",
        "brief": "Help Sam & Professor Loop complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Read the device’s safe care guidance",
            "requires": [],
            "fact": "Read the device’s safe care guidance · checked for the keep-it-working station.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm a qualified repair appointment",
            "requires": [],
            "fact": "Confirm a qualified repair appointment · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Sam assesses the reported fault",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Sam assesses the reported fault. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record Sam’s safe next destination",
            "requires": [
              "team"
            ],
            "fact": "Record Sam’s safe next destination. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Guarantee every device is repairable",
            "fact": "A device needs qualified assessment; do not promise every fault can be repaired."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "check",
          "confirm",
          "team",
          "record",
          "unsafe",
          "skip"
        ]
      }
    ]
  },
  {
    "id": "special-appointments",
    "title": "Special Appointments",
    "subtitle": "Repair quarter · supervised collection",
    "ally": "Sam & Lebo",
    "intro": "A collection day needs careful planning. Batteries and electrical devices cannot join the ordinary paper or container loads. Circuit helps the adults confirm the specialist service and record the handover.",
    "goal": "Plan approved specialist appointments without opening devices or handling damaged items.",
    "background": "assets/backgrounds/bg-repair-courtyard.webp",
    "stops": [
      "The appointment desk",
      "The supervisor’s office",
      "The confirmed handover point"
    ],
    "destinations": [
      "special",
      "repair",
      "centre",
      "paper",
      "containers"
    ],
    "sets": [
      [
        "battery",
        "radio",
        "carton",
        "glass",
        "box",
        "bottle"
      ],
      [
        "carton",
        "glass",
        "box",
        "bottle",
        "battery",
        "radio"
      ],
      [
        "box",
        "bottle",
        "battery",
        "radio",
        "carton",
        "glass"
      ]
    ],
    "restoration": "The supervisor confirms approved appointments. Batteries and electrical devices stay out of ordinary loads, and the team keeps a handover record.",
    "requests": [
      {
        "prompt": "Who arranges a spent household battery handover?",
        "answer": "plan",
        "choices": [
          {
            "id": "plan",
            "label": "The supervisor using an approved service",
            "feedback": "The supervisor confirms an approved battery collection route."
          },
          {
            "id": "shortcut",
            "label": "A child opening it to inspect inside",
            "feedback": "Never open batteries; adults or trained workers handle concerns."
          },
          {
            "id": "mix",
            "label": "The ordinary paper collector without checking",
            "feedback": "Batteries stay out of ordinary paper and container loads."
          }
        ],
        "success": "The supervisor confirms an approved battery collection route."
      },
      {
        "prompt": "A battery looks damaged. What should Circuit’s plan say?",
        "answer": "plan",
        "choices": [
          {
            "id": "shortcut",
            "label": "Pick it up to inspect closely",
            "feedback": "Damaged batteries should not be handled by the player."
          },
          {
            "id": "mix",
            "label": "Hide it inside a box of paper",
            "feedback": "Keep batteries out of ordinary recycling and alert the supervisor."
          },
          {
            "id": "plan",
            "label": "Stay clear and tell the supervisor",
            "feedback": "Do not handle damaged batteries. Ask an adult or trained worker."
          }
        ],
        "success": "Do not handle damaged batteries. Ask an adult or trained worker."
      },
      {
        "prompt": "What confirms that a specialist handover is ready?",
        "answer": "plan",
        "choices": [
          {
            "id": "mix",
            "label": "An unverified message",
            "feedback": "The supervisor must verify the service details."
          },
          {
            "id": "plan",
            "label": "The supervisor has checked the service and appointment",
            "feedback": "Acceptance and arrangements must be confirmed before the trained team hands over."
          },
          {
            "id": "shortcut",
            "label": "A familiar bin colour",
            "feedback": "Bin colours are not a universal acceptance code."
          }
        ],
        "success": "Acceptance and arrangements must be confirmed before the trained team hands over."
      }
    ],
    "orders": [
      {
        "title": "The appointment desk · work order",
        "brief": "Help Sam & Lebo complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "battery",
        "steps": [
          {
            "id": "check",
            "label": "Tell the supervisor which item is listed",
            "requires": [],
            "fact": "Tell the supervisor which item is listed · checked for the appointment desk.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Supervisor confirms an approved service",
            "requires": [],
            "fact": "Supervisor confirms an approved service · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Trained team confirms the handover",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Trained team confirms the handover. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the approved appointment",
            "requires": [
              "team"
            ],
            "fact": "Record the approved appointment. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Open the battery for inspection",
            "fact": "Never open or handle damaged batteries. The supervisor arranges specialist work."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "skip",
          "check",
          "confirm",
          "team",
          "record",
          "unsafe"
        ]
      },
      {
        "title": "The supervisor’s office · work order",
        "brief": "Help Sam & Lebo complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "battery",
        "steps": [
          {
            "id": "check",
            "label": "Tell the supervisor which item is listed",
            "requires": [],
            "fact": "Tell the supervisor which item is listed · checked for the supervisor’s office.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Supervisor confirms an approved service",
            "requires": [],
            "fact": "Supervisor confirms an approved service · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Trained team confirms the handover",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Trained team confirms the handover. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the approved appointment",
            "requires": [
              "team"
            ],
            "fact": "Record the approved appointment. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Open the battery for inspection",
            "fact": "Never open or handle damaged batteries. The supervisor arranges specialist work."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "check",
          "confirm",
          "team",
          "record",
          "unsafe",
          "skip"
        ]
      },
      {
        "title": "The confirmed handover point · work order",
        "brief": "Help Sam & Lebo complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "battery",
        "steps": [
          {
            "id": "check",
            "label": "Tell the supervisor which item is listed",
            "requires": [],
            "fact": "Tell the supervisor which item is listed · checked for the confirmed handover point.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Supervisor confirms an approved service",
            "requires": [],
            "fact": "Supervisor confirms an approved service · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Trained team confirms the handover",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Trained team confirms the handover. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the approved appointment",
            "requires": [
              "team"
            ],
            "fact": "Record the approved appointment. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Open the battery for inspection",
            "fact": "Never open or handle damaged batteries. The supervisor arranges specialist work."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "confirm",
          "team",
          "record",
          "unsafe",
          "skip",
          "check"
        ]
      }
    ]
  },
  {
    "id": "workshop-beacon",
    "title": "The Workshop Beacon",
    "subtitle": "Repair quarter · Grime showdown",
    "ally": "Sam & the repair team",
    "intro": "Grime wraps the workshop beacon in purple clouds. Sam’s team needs every reuse, repair and collection job ready before The Loop can reopen the courtyard.",
    "goal": "Complete the workshop work orders, then power the beacon with correctly recovered materials.",
    "background": "assets/backgrounds/bg-repair-courtyard.webp",
    "stops": [
      "The blocked courtyard",
      "The repair team’s rally",
      "The workshop beacon"
    ],
    "destinations": [
      "repair",
      "special",
      "reuse",
      "centre",
      "containers",
      "paper"
    ],
    "sets": [
      [
        "radio",
        "battery",
        "book",
        "carton",
        "tray",
        "box"
      ],
      [
        "book",
        "carton",
        "tray",
        "box",
        "radio",
        "battery"
      ],
      [
        "tray",
        "box",
        "radio",
        "battery",
        "book",
        "carton"
      ]
    ],
    "restoration": "The workshop beacon glows. Sam joins Circuit’s city team, and every district is ready to help restore the civic square.",
    "requests": [
      {
        "prompt": "Grime says every faulty device is ordinary rubbish. How should the team respond?",
        "answer": "plan",
        "choices": [
          {
            "id": "shortcut",
            "label": "Mix them into paper bundles",
            "feedback": "Devices and clean fibre require separate routes."
          },
          {
            "id": "mix",
            "label": "Let Circuit open them all",
            "feedback": "Electrical work belongs with qualified experts."
          },
          {
            "id": "plan",
            "label": "Use qualified assessment and accepted routes",
            "feedback": "Repair assessment and specialist collection give devices appropriate routes."
          }
        ],
        "success": "Repair assessment and specialist collection give devices appropriate routes."
      },
      {
        "prompt": "How should the workshop describe an item offered for reuse?",
        "answer": "plan",
        "choices": [
          {
            "id": "mix",
            "label": "Claim the game guarantees safety",
            "feedback": "The game cannot certify a real item’s safety."
          },
          {
            "id": "plan",
            "label": "Give an honest checked condition",
            "feedback": "A reuse offer should match the item’s actual condition."
          },
          {
            "id": "shortcut",
            "label": "Hide damage to clear the shelf",
            "feedback": "Hiding damage does not make a safe or useful exchange."
          }
        ],
        "success": "A reuse offer should match the item’s actual condition."
      },
      {
        "prompt": "What powers the workshop beacon?",
        "answer": "plan",
        "choices": [
          {
            "id": "plan",
            "label": "Completed recovery jobs and the team’s safe plan",
            "feedback": "Correct recovery and completed work orders prepare The Loop."
          },
          {
            "id": "shortcut",
            "label": "Skipping the specialist appointment",
            "feedback": "The specialist arrangement is part of the safe plan."
          },
          {
            "id": "mix",
            "label": "Mixing all the loads for speed",
            "feedback": "Mixed loads can contaminate useful materials."
          }
        ],
        "success": "Correct recovery and completed work orders prepare The Loop."
      }
    ],
    "orders": [
      {
        "title": "The blocked courtyard · work order",
        "brief": "Help Sam & the repair team complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Check the workshop’s reuse list",
            "requires": [],
            "fact": "Check the workshop’s reuse list · checked for the blocked courtyard.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm Sam’s repair and specialist plan",
            "requires": [],
            "fact": "Confirm Sam’s repair and specialist plan · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "The qualified team signs off its jobs",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "The qualified team signs off its jobs. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Connect the workshop beacon",
            "requires": [
              "team"
            ],
            "fact": "Connect the workshop beacon. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Return devices without expert checks",
            "fact": "Completed expert checks must come before the workshop opens its return counter."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "check",
          "confirm",
          "team",
          "record",
          "unsafe",
          "skip"
        ]
      },
      {
        "title": "The repair team’s rally · work order",
        "brief": "Help Sam & the repair team complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Check the workshop’s reuse list",
            "requires": [],
            "fact": "Check the workshop’s reuse list · checked for the repair team’s rally.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm Sam’s repair and specialist plan",
            "requires": [],
            "fact": "Confirm Sam’s repair and specialist plan · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "The qualified team signs off its jobs",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "The qualified team signs off its jobs. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Connect the workshop beacon",
            "requires": [
              "team"
            ],
            "fact": "Connect the workshop beacon. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Return devices without expert checks",
            "fact": "Completed expert checks must come before the workshop opens its return counter."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "confirm",
          "team",
          "record",
          "unsafe",
          "skip",
          "check"
        ]
      },
      {
        "title": "The workshop beacon · work order",
        "brief": "Help Sam & the repair team complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Check the workshop’s reuse list",
            "requires": [],
            "fact": "Check the workshop’s reuse list · checked for the workshop beacon.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm Sam’s repair and specialist plan",
            "requires": [],
            "fact": "Confirm Sam’s repair and specialist plan · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "The qualified team signs off its jobs",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "The qualified team signs off its jobs. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Connect the workshop beacon",
            "requires": [
              "team"
            ],
            "fact": "Connect the workshop beacon. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Return devices without expert checks",
            "fact": "Completed expert checks must come before the workshop opens its return counter."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "team",
          "record",
          "unsafe",
          "skip",
          "check",
          "confirm"
        ]
      }
    ]
  },
  {
    "id": "school-to-square",
    "title": "School to Square",
    "subtitle": "City restoration · connect the school",
    "ally": "Nandi & Musa",
    "intro": "The civic square is reopening, but its new services need a dependable school link. Nandi sends Circuit back to the first station to help plan a complete collection journey.",
    "goal": "Check the school’s service plan, prepare its materials and connect pickups to accepted deliveries.",
    "background": "assets/backgrounds/bg-verdale-square.webp",
    "stops": [
      "The school link",
      "The covered meeting point",
      "The square’s school station"
    ],
    "destinations": [
      "paper",
      "containers",
      "compost",
      "reuse"
    ],
    "sets": [
      [
        "newspaper",
        "box",
        "tray",
        "peel",
        "book",
        "bottle"
      ],
      [
        "tray",
        "peel",
        "book",
        "bottle",
        "newspaper",
        "box"
      ],
      [
        "book",
        "bottle",
        "newspaper",
        "box",
        "tray",
        "peel"
      ]
    ],
    "restoration": "The school link reaches the square. Nandi’s dry store, exchange shelf and separate food collection have dependable handover points.",
    "requests": [
      {
        "prompt": "Nandi’s school sends dry paper to the square. What protects it?",
        "answer": "plan",
        "choices": [
          {
            "id": "mix",
            "label": "An uncovered puddle-side pile",
            "feedback": "Moisture can spoil the dry paper stream."
          },
          {
            "id": "plan",
            "label": "A covered, labelled dry holding point",
            "feedback": "Paper needs protection from food and moisture."
          },
          {
            "id": "shortcut",
            "label": "A food caddy inside the paper bundle",
            "feedback": "Food scraps can contaminate the fibre."
          }
        ],
        "success": "Paper needs protection from food and moisture."
      },
      {
        "prompt": "Which visit must happen before a listed delivery?",
        "answer": "plan",
        "choices": [
          {
            "id": "plan",
            "label": "Collect the matching load",
            "feedback": "The vehicle needs the correct load on board before delivering it."
          },
          {
            "id": "shortcut",
            "label": "Deliver an empty vehicle as a completed load",
            "feedback": "A delivery cannot be recorded before the pickup."
          },
          {
            "id": "mix",
            "label": "Collect every load regardless of space",
            "feedback": "Respect the vehicle’s available game load spaces."
          }
        ],
        "success": "The vehicle needs the correct load on board before delivering it."
      },
      {
        "prompt": "Who keeps the school connection reliable?",
        "answer": "plan",
        "choices": [
          {
            "id": "shortcut",
            "label": "Circuit working without local information",
            "feedback": "The local team knows its service and acceptance arrangements."
          },
          {
            "id": "mix",
            "label": "A colour code assumed to work everywhere",
            "feedback": "Acceptance and colours vary between services."
          },
          {
            "id": "plan",
            "label": "The school and collection team sharing a clear plan",
            "feedback": "Clear acceptance, storage and handover arrangements connect the service."
          }
        ],
        "success": "Clear acceptance, storage and handover arrangements connect the service."
      }
    ],
    "orders": [
      {
        "title": "The school link · work order",
        "brief": "Help Nandi & Musa complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "newspaper",
        "steps": [
          {
            "id": "check",
            "label": "Check the school’s accepted streams",
            "requires": [],
            "fact": "Check the school’s accepted streams · checked for the school link.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm the covered dry holding point",
            "requires": [],
            "fact": "Confirm the covered dry holding point · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Nandi and Musa approve the school link",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Nandi and Musa approve the school link. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the school collection connection",
            "requires": [
              "team"
            ],
            "fact": "Record the school collection connection. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Store food inside dry paper bundles",
            "fact": "Food and wet waste stay away from the school’s clean, dry paper."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "confirm",
          "team",
          "record",
          "unsafe",
          "skip",
          "check"
        ]
      },
      {
        "title": "The covered meeting point · work order",
        "brief": "Help Nandi & Musa complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "newspaper",
        "steps": [
          {
            "id": "check",
            "label": "Check the school’s accepted streams",
            "requires": [],
            "fact": "Check the school’s accepted streams · checked for the covered meeting point.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm the covered dry holding point",
            "requires": [],
            "fact": "Confirm the covered dry holding point · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Nandi and Musa approve the school link",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Nandi and Musa approve the school link. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the school collection connection",
            "requires": [
              "team"
            ],
            "fact": "Record the school collection connection. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Store food inside dry paper bundles",
            "fact": "Food and wet waste stay away from the school’s clean, dry paper."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "team",
          "record",
          "unsafe",
          "skip",
          "check",
          "confirm"
        ]
      },
      {
        "title": "The square’s school station · work order",
        "brief": "Help Nandi & Musa complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "newspaper",
        "steps": [
          {
            "id": "check",
            "label": "Check the school’s accepted streams",
            "requires": [],
            "fact": "Check the school’s accepted streams · checked for the square’s school station.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm the covered dry holding point",
            "requires": [],
            "fact": "Confirm the covered dry holding point · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Nandi and Musa approve the school link",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Nandi and Musa approve the school link. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the school collection connection",
            "requires": [
              "team"
            ],
            "fact": "Record the school collection connection. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Store food inside dry paper bundles",
            "fact": "Food and wet waste stay away from the school’s clean, dry paper."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "record",
          "unsafe",
          "skip",
          "check",
          "confirm",
          "team"
        ]
      }
    ],
    "dispatch": [
      {
        "title": "The school link · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 4,
        "separate": false,
        "loads": [
          {
            "id": "paper",
            "label": "Dry paper bundles",
            "item": "newspaper",
            "route": "paper",
            "pickup": "Covered school store",
            "delivery": "Square dry-paper point",
            "spaces": 2,
            "fact": "Protect clean fibre from moisture and food."
          },
          {
            "id": "reuse",
            "label": "Checked books for sharing",
            "item": "book",
            "route": "reuse",
            "pickup": "Library exchange",
            "delivery": "Square reading shelf",
            "spaces": 2,
            "fact": "Usable books can serve another reader."
          }
        ]
      },
      {
        "title": "The covered meeting point · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 3,
        "separate": true,
        "loads": [
          {
            "id": "containers",
            "label": "Empty accepted containers",
            "item": "bottle",
            "route": "containers",
            "pickup": "Traders’ container point",
            "delivery": "Listed container intake",
            "spaces": 2,
            "fact": "This local service accepts these empty containers."
          },
          {
            "id": "food",
            "label": "Listed food scraps",
            "item": "peel",
            "route": "compost",
            "pickup": "Separate food caddy",
            "delivery": "Supervised compost project",
            "spaces": 2,
            "fact": "Keep food separate from dry paper and packaging."
          }
        ]
      },
      {
        "title": "The square’s school station · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 2,
        "separate": false,
        "loads": [
          {
            "id": "paper",
            "label": "Dry paper bundles",
            "item": "newspaper",
            "route": "paper",
            "pickup": "Covered school store",
            "delivery": "Square dry-paper point",
            "spaces": 2,
            "fact": "Protect clean fibre from moisture and food."
          },
          {
            "id": "containers",
            "label": "Empty accepted containers",
            "item": "bottle",
            "route": "containers",
            "pickup": "Traders’ container point",
            "delivery": "Listed container intake",
            "spaces": 2,
            "fact": "This local service accepts these empty containers."
          }
        ]
      }
    ]
  },
  {
    "id": "market-promise",
    "title": "The Market Promise",
    "subtitle": "City restoration · reuse at events",
    "ally": "Asha & Musa",
    "intro": "Asha is preparing a community celebration. Grime hopes the busy stalls will mix everything again. Give traders a simple plan that works during the rush and after the last stall closes.",
    "goal": "Keep reusable goods in use, protect dry paper and plan separate collections for the celebration.",
    "background": "assets/backgrounds/bg-verdale-square.webp",
    "stops": [
      "The traders’ briefing",
      "The return table",
      "The after-market round"
    ],
    "destinations": [
      "containers",
      "compost",
      "paper",
      "reuse",
      "residual"
    ],
    "sets": [
      [
        "tray",
        "juice",
        "peel",
        "box",
        "book",
        "wetpaper"
      ],
      [
        "peel",
        "box",
        "book",
        "wetpaper",
        "tray",
        "juice"
      ],
      [
        "book",
        "wetpaper",
        "tray",
        "juice",
        "peel",
        "box"
      ]
    ],
    "restoration": "The traders keep their promise. Reuse and clear collection points are part of the celebration, and the square stays welcoming after closing.",
    "requests": [
      {
        "prompt": "Asha wants less waste at the celebration. Which plan comes first?",
        "answer": "plan",
        "choices": [
          {
            "id": "plan",
            "label": "Use suitable reusable goods where practical",
            "feedback": "Avoiding unnecessary single-use items can reduce what needs collecting."
          },
          {
            "id": "shortcut",
            "label": "Buy extra disposable items for decoration",
            "feedback": "Unnecessary items add to the collection task."
          },
          {
            "id": "mix",
            "label": "Assume recycling removes the need to reduce waste",
            "feedback": "Reduction and reuse still matter."
          }
        ],
        "success": "Avoiding unnecessary single-use items can reduce what needs collecting."
      },
      {
        "prompt": "A food stall has peels and empty accepted cans. What helps?",
        "answer": "plan",
        "choices": [
          {
            "id": "shortcut",
            "label": "Put peels inside the cans",
            "feedback": "Food inside packaging contaminates the container load."
          },
          {
            "id": "mix",
            "label": "Hide them under clean boxes",
            "feedback": "Mixing food into cardboard can spoil fibre."
          },
          {
            "id": "plan",
            "label": "Separate the food caddy and container point",
            "feedback": "Food scraps and accepted empty packaging follow different streams."
          }
        ],
        "success": "Food scraps and accepted empty packaging follow different streams."
      },
      {
        "prompt": "What should the team check after closing?",
        "answer": "plan",
        "choices": [
          {
            "id": "mix",
            "label": "Whether every bin has the same colour",
            "feedback": "Local acceptance matters more than matching colours."
          },
          {
            "id": "plan",
            "label": "Each stream has a confirmed handover",
            "feedback": "Good collection planning includes the final accepted destination."
          },
          {
            "id": "shortcut",
            "label": "Only whether the square looks empty",
            "feedback": "Moving waste out of sight does not confirm an appropriate route."
          }
        ],
        "success": "Good collection planning includes the final accepted destination."
      }
    ],
    "orders": [
      {
        "title": "The traders’ briefing · work order",
        "brief": "Help Asha & Musa complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "book",
        "steps": [
          {
            "id": "check",
            "label": "Check the stall’s suitable reuse options",
            "requires": [],
            "fact": "Check the stall’s suitable reuse options · checked for the traders’ briefing.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm separate food and packaging points",
            "requires": [],
            "fact": "Confirm separate food and packaging points · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Asha approves the traders’ collection plan",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Asha approves the traders’ collection plan. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the after-market handover",
            "requires": [
              "team"
            ],
            "fact": "Record the after-market handover. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Buy extra disposable items to fill bins",
            "fact": "Reduction and reuse belong in the plan before collecting the remaining materials."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "team",
          "record",
          "unsafe",
          "skip",
          "check",
          "confirm"
        ]
      },
      {
        "title": "The return table · work order",
        "brief": "Help Asha & Musa complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "book",
        "steps": [
          {
            "id": "check",
            "label": "Check the stall’s suitable reuse options",
            "requires": [],
            "fact": "Check the stall’s suitable reuse options · checked for the return table.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm separate food and packaging points",
            "requires": [],
            "fact": "Confirm separate food and packaging points · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Asha approves the traders’ collection plan",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Asha approves the traders’ collection plan. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the after-market handover",
            "requires": [
              "team"
            ],
            "fact": "Record the after-market handover. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Buy extra disposable items to fill bins",
            "fact": "Reduction and reuse belong in the plan before collecting the remaining materials."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "record",
          "unsafe",
          "skip",
          "check",
          "confirm",
          "team"
        ]
      },
      {
        "title": "The after-market round · work order",
        "brief": "Help Asha & Musa complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "book",
        "steps": [
          {
            "id": "check",
            "label": "Check the stall’s suitable reuse options",
            "requires": [],
            "fact": "Check the stall’s suitable reuse options · checked for the after-market round.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm separate food and packaging points",
            "requires": [],
            "fact": "Confirm separate food and packaging points · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Asha approves the traders’ collection plan",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Asha approves the traders’ collection plan. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the after-market handover",
            "requires": [
              "team"
            ],
            "fact": "Record the after-market handover. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Buy extra disposable items to fill bins",
            "fact": "Reduction and reuse belong in the plan before collecting the remaining materials."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "unsafe",
          "skip",
          "check",
          "confirm",
          "team",
          "record"
        ]
      }
    ],
    "dispatch": [
      {
        "title": "The traders’ briefing · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 4,
        "separate": false,
        "loads": [
          {
            "id": "reuse",
            "label": "Checked books for sharing",
            "item": "book",
            "route": "reuse",
            "pickup": "Library exchange",
            "delivery": "Square reading shelf",
            "spaces": 2,
            "fact": "Usable books can serve another reader."
          },
          {
            "id": "containers",
            "label": "Empty accepted containers",
            "item": "bottle",
            "route": "containers",
            "pickup": "Traders’ container point",
            "delivery": "Listed container intake",
            "spaces": 2,
            "fact": "This local service accepts these empty containers."
          }
        ]
      },
      {
        "title": "The return table · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 3,
        "separate": true,
        "loads": [
          {
            "id": "food",
            "label": "Listed food scraps",
            "item": "peel",
            "route": "compost",
            "pickup": "Separate food caddy",
            "delivery": "Supervised compost project",
            "spaces": 2,
            "fact": "Keep food separate from dry paper and packaging."
          },
          {
            "id": "paper",
            "label": "Dry paper bundles",
            "item": "newspaper",
            "route": "paper",
            "pickup": "Covered school store",
            "delivery": "Square dry-paper point",
            "spaces": 2,
            "fact": "Protect clean fibre from moisture and food."
          }
        ]
      },
      {
        "title": "The after-market round · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 2,
        "separate": false,
        "loads": [
          {
            "id": "containers",
            "label": "Empty accepted containers",
            "item": "bottle",
            "route": "containers",
            "pickup": "Traders’ container point",
            "delivery": "Listed container intake",
            "spaces": 2,
            "fact": "This local service accepts these empty containers."
          },
          {
            "id": "reuse",
            "label": "Checked books for sharing",
            "item": "book",
            "route": "reuse",
            "pickup": "Library exchange",
            "delivery": "Square reading shelf",
            "spaces": 2,
            "fact": "Usable books can serve another reader."
          }
        ]
      }
    ]
  },
  {
    "id": "centre-check",
    "title": "The Centre Check",
    "subtitle": "City restoration · acceptance & handover",
    "ally": "Lebo & Musa",
    "intro": "A new route reaches the recovery centre. A mixed delivery would undo the team’s work, so Lebo asks Circuit to check the accepted streams and the handover record before dispatch.",
    "goal": "Verify the centre’s acceptance list and keep glass and cartons on their listed routes.",
    "background": "assets/backgrounds/bg-verdale-square.webp",
    "stops": [
      "The acceptance board",
      "The labelled holding bays",
      "The signed handover"
    ],
    "destinations": [
      "centre",
      "containers",
      "paper",
      "special"
    ],
    "sets": [
      [
        "carton",
        "glass",
        "bottle",
        "box",
        "battery",
        "can"
      ],
      [
        "bottle",
        "box",
        "battery",
        "can",
        "carton",
        "glass"
      ],
      [
        "battery",
        "can",
        "carton",
        "glass",
        "bottle",
        "box"
      ]
    ],
    "restoration": "Lebo confirms the centre connection. Labelled loads reach the right bays, and the city team can trace each completed handover.",
    "requests": [
      {
        "prompt": "The street service does not take cartons, but this centre does. What should Musa do?",
        "answer": "plan",
        "choices": [
          {
            "id": "shortcut",
            "label": "Assume every street service accepts cartons",
            "feedback": "Acceptance differs between collection services."
          },
          {
            "id": "mix",
            "label": "Put them in food compost",
            "feedback": "Packaging stays out of this food-compost stream."
          },
          {
            "id": "plan",
            "label": "Use the centre’s listed carton bay",
            "feedback": "Follow the confirmed local acceptance route for these empty cartons."
          }
        ],
        "success": "Follow the confirmed local acceptance route for these empty cartons."
      },
      {
        "prompt": "A bottle is broken beside the intact-glass bay. What is the right response?",
        "answer": "plan",
        "choices": [
          {
            "id": "mix",
            "label": "Hide the pieces in paper bundles",
            "feedback": "Hidden glass can injure workers and contaminate paper."
          },
          {
            "id": "plan",
            "label": "Keep clear and alert the trained worker",
            "feedback": "Do not handle broken glass. Ask an adult or trained collection worker."
          },
          {
            "id": "shortcut",
            "label": "Pick up the fragments by hand",
            "feedback": "Broken glass requires trained handling."
          }
        ],
        "success": "Do not handle broken glass. Ask an adult or trained collection worker."
      },
      {
        "prompt": "Why record the handover destination?",
        "answer": "plan",
        "choices": [
          {
            "id": "plan",
            "label": "To confirm where the accepted load went",
            "feedback": "A clear record links collection with the listed receiving service."
          },
          {
            "id": "shortcut",
            "label": "To invent a guaranteed payment",
            "feedback": "The game does not promise real collection prices."
          },
          {
            "id": "mix",
            "label": "To avoid checking acceptance next time",
            "feedback": "The team must keep checking current service arrangements."
          }
        ],
        "success": "A clear record links collection with the listed receiving service."
      }
    ],
    "orders": [
      {
        "title": "The acceptance board · work order",
        "brief": "Help Lebo & Musa complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "carton",
        "steps": [
          {
            "id": "check",
            "label": "Read Lebo’s current acceptance board",
            "requires": [],
            "fact": "Read Lebo’s current acceptance board · checked for the acceptance board.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm the labelled receiving bay",
            "requires": [],
            "fact": "Confirm the labelled receiving bay · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "The trained team approves the centre load",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "The trained team approves the centre load. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the accepted destination",
            "requires": [
              "team"
            ],
            "fact": "Record the accepted destination. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Hide batteries inside the paper load",
            "fact": "Only the listed accepted materials go to each bay. Never hide unaccepted items in a load."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "record",
          "unsafe",
          "skip",
          "check",
          "confirm",
          "team"
        ]
      },
      {
        "title": "The labelled holding bays · work order",
        "brief": "Help Lebo & Musa complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "carton",
        "steps": [
          {
            "id": "check",
            "label": "Read Lebo’s current acceptance board",
            "requires": [],
            "fact": "Read Lebo’s current acceptance board · checked for the labelled holding bays.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm the labelled receiving bay",
            "requires": [],
            "fact": "Confirm the labelled receiving bay · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "The trained team approves the centre load",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "The trained team approves the centre load. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the accepted destination",
            "requires": [
              "team"
            ],
            "fact": "Record the accepted destination. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Hide batteries inside the paper load",
            "fact": "Only the listed accepted materials go to each bay. Never hide unaccepted items in a load."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "unsafe",
          "skip",
          "check",
          "confirm",
          "team",
          "record"
        ]
      },
      {
        "title": "The signed handover · work order",
        "brief": "Help Lebo & Musa complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "carton",
        "steps": [
          {
            "id": "check",
            "label": "Read Lebo’s current acceptance board",
            "requires": [],
            "fact": "Read Lebo’s current acceptance board · checked for the signed handover.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm the labelled receiving bay",
            "requires": [],
            "fact": "Confirm the labelled receiving bay · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "The trained team approves the centre load",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "The trained team approves the centre load. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the accepted destination",
            "requires": [
              "team"
            ],
            "fact": "Record the accepted destination. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Hide batteries inside the paper load",
            "fact": "Only the listed accepted materials go to each bay. Never hide unaccepted items in a load."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "skip",
          "check",
          "confirm",
          "team",
          "record",
          "unsafe"
        ]
      }
    ],
    "dispatch": [
      {
        "title": "The acceptance board · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 4,
        "separate": false,
        "loads": [
          {
            "id": "cartons",
            "label": "Empty accepted cartons",
            "item": "carton",
            "route": "centre",
            "pickup": "Carton holding bay",
            "delivery": "Lebo’s listed carton bay",
            "spaces": 2,
            "fact": "The centre confirms that it accepts these empty cartons."
          },
          {
            "id": "paper",
            "label": "Dry paper bundles",
            "item": "newspaper",
            "route": "paper",
            "pickup": "Covered school store",
            "delivery": "Square dry-paper point",
            "spaces": 2,
            "fact": "Protect clean fibre from moisture and food."
          }
        ]
      },
      {
        "title": "The labelled holding bays · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 3,
        "separate": false,
        "loads": [
          {
            "id": "containers",
            "label": "Empty accepted containers",
            "item": "bottle",
            "route": "containers",
            "pickup": "Traders’ container point",
            "delivery": "Listed container intake",
            "spaces": 2,
            "fact": "This local service accepts these empty containers."
          },
          {
            "id": "cartons",
            "label": "Empty accepted cartons",
            "item": "carton",
            "route": "centre",
            "pickup": "Carton holding bay",
            "delivery": "Lebo’s listed carton bay",
            "spaces": 2,
            "fact": "The centre confirms that it accepts these empty cartons."
          }
        ]
      },
      {
        "title": "The signed handover · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 2,
        "separate": false,
        "loads": [
          {
            "id": "paper",
            "label": "Dry paper bundles",
            "item": "newspaper",
            "route": "paper",
            "pickup": "Covered school store",
            "delivery": "Square dry-paper point",
            "spaces": 2,
            "fact": "Protect clean fibre from moisture and food."
          },
          {
            "id": "cartons",
            "label": "Empty accepted cartons",
            "item": "carton",
            "route": "centre",
            "pickup": "Carton holding bay",
            "delivery": "Lebo’s listed carton bay",
            "spaces": 2,
            "fact": "The centre confirms that it accepts these empty cartons."
          }
        ]
      }
    ]
  },
  {
    "id": "rain-ready-city",
    "title": "A Rain-Ready City",
    "subtitle": "City restoration · protect the network",
    "ally": "Musa & the community",
    "intro": "Dark clouds gather over the celebration. Grime is waiting for wet paper and mixed food loads. Help the team protect the collection points and finish the routes before the square opens.",
    "goal": "Keep fibre dry, separate food loads and choose a safe supervised plan when conditions change.",
    "background": "assets/backgrounds/bg-verdale-square.webp",
    "stops": [
      "The shelter inspection",
      "The protected street round",
      "The square before the rain"
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
        "newspaper",
        "peel",
        "tray",
        "juice",
        "wetpaper"
      ],
      [
        "peel",
        "tray",
        "juice",
        "wetpaper",
        "box",
        "newspaper"
      ],
      [
        "juice",
        "wetpaper",
        "box",
        "newspaper",
        "peel",
        "tray"
      ]
    ],
    "restoration": "The first rain falls on covered stores and clearly separated loads. The city network keeps working, and the community gathers at the square.",
    "requests": [
      {
        "prompt": "Rain is coming toward clean cardboard. What can the team do?",
        "answer": "plan",
        "choices": [
          {
            "id": "mix",
            "label": "Cover the boxes with wet food scraps",
            "feedback": "Food and moisture can contaminate cardboard."
          },
          {
            "id": "plan",
            "label": "Move the collection into its covered dry store",
            "feedback": "Keeping fibre dry protects this service’s paper stream."
          },
          {
            "id": "shortcut",
            "label": "Soak the boxes to flatten them",
            "feedback": "Flatten empty boxes without soaking their fibres."
          }
        ],
        "success": "Keeping fibre dry protects this service’s paper stream."
      },
      {
        "prompt": "The round requires food and paper on separate trips. What is the useful next move?",
        "answer": "plan",
        "choices": [
          {
            "id": "plan",
            "label": "Deliver the current stream before another pickup",
            "feedback": "Separate trips keep these loads apart and free vehicle space."
          },
          {
            "id": "shortcut",
            "label": "Stack both streams together anyway",
            "feedback": "This round explicitly requires separate loads."
          },
          {
            "id": "mix",
            "label": "Ignore the load-space display",
            "feedback": "Load-space limits still apply."
          }
        ],
        "success": "Separate trips keep these loads apart and free vehicle space."
      },
      {
        "prompt": "Conditions at a collection point become unsafe. What should the plan say?",
        "answer": "plan",
        "choices": [
          {
            "id": "shortcut",
            "label": "Rush through the unsafe point",
            "feedback": "Unsafe conditions need assessment, not rushing."
          },
          {
            "id": "mix",
            "label": "Tell children to handle damaged items",
            "feedback": "Hazardous or damaged items belong with trained workers."
          },
          {
            "id": "plan",
            "label": "Pause and ask the trained team to reassess",
            "feedback": "A safe supervised arrangement takes priority over a quick handover."
          }
        ],
        "success": "A safe supervised arrangement takes priority over a quick handover."
      }
    ],
    "orders": [
      {
        "title": "The shelter inspection · work order",
        "brief": "Help Musa & the community complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "box",
        "steps": [
          {
            "id": "check",
            "label": "Check the covered dry paper store",
            "requires": [],
            "fact": "Check the covered dry paper store · checked for the shelter inspection.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm separate food and paper trips",
            "requires": [],
            "fact": "Confirm separate food and paper trips · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Musa approves the protected collection round",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Musa approves the protected collection round. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the safe supervised handover",
            "requires": [
              "team"
            ],
            "fact": "Record the safe supervised handover. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Rush through an unsafe collection point",
            "fact": "Keep fibre dry and ask the trained team to reassess unsafe conditions."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "unsafe",
          "skip",
          "check",
          "confirm",
          "team",
          "record"
        ]
      },
      {
        "title": "The protected street round · work order",
        "brief": "Help Musa & the community complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "box",
        "steps": [
          {
            "id": "check",
            "label": "Check the covered dry paper store",
            "requires": [],
            "fact": "Check the covered dry paper store · checked for the protected street round.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm separate food and paper trips",
            "requires": [],
            "fact": "Confirm separate food and paper trips · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Musa approves the protected collection round",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Musa approves the protected collection round. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the safe supervised handover",
            "requires": [
              "team"
            ],
            "fact": "Record the safe supervised handover. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Rush through an unsafe collection point",
            "fact": "Keep fibre dry and ask the trained team to reassess unsafe conditions."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "skip",
          "check",
          "confirm",
          "team",
          "record",
          "unsafe"
        ]
      },
      {
        "title": "The square before the rain · work order",
        "brief": "Help Musa & the community complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "box",
        "steps": [
          {
            "id": "check",
            "label": "Check the covered dry paper store",
            "requires": [],
            "fact": "Check the covered dry paper store · checked for the square before the rain.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Confirm separate food and paper trips",
            "requires": [],
            "fact": "Confirm separate food and paper trips · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "Musa approves the protected collection round",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "Musa approves the protected collection round. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Record the safe supervised handover",
            "requires": [
              "team"
            ],
            "fact": "Record the safe supervised handover. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Rush through an unsafe collection point",
            "fact": "Keep fibre dry and ask the trained team to reassess unsafe conditions."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "check",
          "confirm",
          "team",
          "record",
          "unsafe",
          "skip"
        ]
      }
    ],
    "dispatch": [
      {
        "title": "The shelter inspection · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 4,
        "separate": true,
        "loads": [
          {
            "id": "paper",
            "label": "Dry paper bundles",
            "item": "newspaper",
            "route": "paper",
            "pickup": "Covered school store",
            "delivery": "Square dry-paper point",
            "spaces": 2,
            "fact": "Protect clean fibre from moisture and food."
          },
          {
            "id": "food",
            "label": "Listed food scraps",
            "item": "peel",
            "route": "compost",
            "pickup": "Separate food caddy",
            "delivery": "Supervised compost project",
            "spaces": 2,
            "fact": "Keep food separate from dry paper and packaging."
          }
        ]
      },
      {
        "title": "The protected street round · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 3,
        "separate": true,
        "loads": [
          {
            "id": "food",
            "label": "Listed food scraps",
            "item": "peel",
            "route": "compost",
            "pickup": "Separate food caddy",
            "delivery": "Supervised compost project",
            "spaces": 2,
            "fact": "Keep food separate from dry paper and packaging."
          },
          {
            "id": "paper",
            "label": "Dry paper bundles",
            "item": "newspaper",
            "route": "paper",
            "pickup": "Covered school store",
            "delivery": "Square dry-paper point",
            "spaces": 2,
            "fact": "Protect clean fibre from moisture and food."
          }
        ]
      },
      {
        "title": "The square before the rain · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 2,
        "separate": false,
        "loads": [
          {
            "id": "paper",
            "label": "Dry paper bundles",
            "item": "newspaper",
            "route": "paper",
            "pickup": "Covered school store",
            "delivery": "Square dry-paper point",
            "spaces": 2,
            "fact": "Protect clean fibre from moisture and food."
          },
          {
            "id": "containers",
            "label": "Empty accepted containers",
            "item": "bottle",
            "route": "containers",
            "pickup": "Traders’ container point",
            "delivery": "Listed container intake",
            "spaces": 2,
            "fact": "This local service accepts these empty containers."
          }
        ]
      }
    ]
  },
  {
    "id": "verdale-together",
    "title": "Verdale, Together",
    "subtitle": "City restoration · the final Loop",
    "ally": "Circuit & all of Verdale",
    "intro": "Grime makes one last stand in the civic square. Nandi, Asha, Musa, Lebo and Sam bring everything the community has learned. Connect the final services, then light The Loop together.",
    "goal": "Complete every work order and delivery, clear Grime’s last clouds and restore the city together.",
    "background": "assets/backgrounds/bg-verdale-square.webp",
    "stops": [
      "The community assembly",
      "The five-district link",
      "The heart of The Loop"
    ],
    "destinations": [
      "repair",
      "special",
      "reuse",
      "centre",
      "containers",
      "paper"
    ],
    "sets": [
      [
        "radio",
        "battery",
        "book",
        "carton",
        "tray",
        "box"
      ],
      [
        "book",
        "carton",
        "tray",
        "box",
        "radio",
        "battery"
      ],
      [
        "tray",
        "box",
        "radio",
        "battery",
        "book",
        "carton"
      ]
    ],
    "restoration": "The Loop lights up across Verdale. The school, market, recovery district, repair quarter and civic square are connected. Grime’s clouds clear as neighbours keep useful goods in use, protect clean materials and support the collectors. Circuit returns to the once-dusty workbench, now surrounded by the community’s photographs. Verdale’s next chapter belongs to everyone.",
    "requests": [
      {
        "prompt": "How does Verdale keep Grime from returning?",
        "answer": "plan",
        "choices": [
          {
            "id": "plan",
            "label": "Reduce waste, reuse and keep accepted streams clean",
            "feedback": "Daily community habits keep useful goods and materials circulating."
          },
          {
            "id": "shortcut",
            "label": "Rely on one giant mixed bin",
            "feedback": "Mixing everything can spoil useful materials."
          },
          {
            "id": "mix",
            "label": "Stop checking collection guidance",
            "feedback": "Local acceptance still needs checking."
          }
        ],
        "success": "Daily community habits keep useful goods and materials circulating."
      },
      {
        "prompt": "The final vehicle has limited room. How can the team finish?",
        "answer": "plan",
        "choices": [
          {
            "id": "shortcut",
            "label": "Record deliveries without collecting anything",
            "feedback": "A real game load must be on board first."
          },
          {
            "id": "mix",
            "label": "Ignore capacity for the last route",
            "feedback": "The final route follows the same clear space rules."
          },
          {
            "id": "plan",
            "label": "Use accepted deliveries to free space",
            "feedback": "Delivering a load frees room for the next appropriate pickup."
          }
        ],
        "success": "Delivering a load frees room for the next appropriate pickup."
      },
      {
        "prompt": "Who made the restored city possible?",
        "answer": "plan",
        "choices": [
          {
            "id": "mix",
            "label": "Grime mixing the streams",
            "feedback": "Grime’s mixed loads blocked the recovery network."
          },
          {
            "id": "plan",
            "label": "The whole community and its collection and repair teams",
            "feedback": "Circuit’s work connects neighbours, collectors and qualified experts."
          },
          {
            "id": "shortcut",
            "label": "Circuit alone without local advice",
            "feedback": "Local knowledge and trained teams make the network work."
          }
        ],
        "success": "Circuit’s work connects neighbours, collectors and qualified experts."
      }
    ],
    "orders": [
      {
        "title": "The community assembly · work order",
        "brief": "Help Circuit & all of Verdale complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Confirm all five districts’ service boards",
            "requires": [],
            "fact": "Confirm all five districts’ service boards · checked for the community assembly.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Check reuse, repair and specialist links",
            "requires": [],
            "fact": "Check reuse, repair and specialist links · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "The community team approves the final plan",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "The community team approves the final plan. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Connect the heart of The Loop",
            "requires": [
              "team"
            ],
            "fact": "Connect the heart of The Loop. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Mix every material into one final load",
            "fact": "The final Loop needs the community’s checked services, not a mixed load."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "skip",
          "check",
          "confirm",
          "team",
          "record",
          "unsafe"
        ]
      },
      {
        "title": "The five-district link · work order",
        "brief": "Help Circuit & all of Verdale complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Confirm all five districts’ service boards",
            "requires": [],
            "fact": "Confirm all five districts’ service boards · checked for the five-district link.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Check reuse, repair and specialist links",
            "requires": [],
            "fact": "Check reuse, repair and specialist links · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "The community team approves the final plan",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "The community team approves the final plan. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Connect the heart of The Loop",
            "requires": [
              "team"
            ],
            "fact": "Connect the heart of The Loop. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Mix every material into one final load",
            "fact": "The final Loop needs the community’s checked services, not a mixed load."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "check",
          "confirm",
          "team",
          "record",
          "unsafe",
          "skip"
        ]
      },
      {
        "title": "The heart of The Loop · work order",
        "brief": "Help Circuit & all of Verdale complete this community job. The two checks can be done in either order. The team then approves the job before you record its outcome.",
        "item": "radio",
        "steps": [
          {
            "id": "check",
            "label": "Confirm all five districts’ service boards",
            "requires": [],
            "fact": "Confirm all five districts’ service boards · checked for the heart of the loop.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "confirm",
            "label": "Check reuse, repair and specialist links",
            "requires": [],
            "fact": "Check reuse, repair and specialist links · confirmed for this work order.",
            "blocked": "Start with the two checks on this work order."
          },
          {
            "id": "team",
            "label": "The community team approves the final plan",
            "requires": [
              "check",
              "confirm"
            ],
            "fact": "The community team approves the final plan. The trained team handles any specialist work.",
            "blocked": "Complete both the condition/service checks before the team can approve this job."
          },
          {
            "id": "record",
            "label": "Connect the heart of The Loop",
            "requires": [
              "team"
            ],
            "fact": "Connect the heart of The Loop. This completed step is saved.",
            "blocked": "The team must approve its work before you record the final handover or connection."
          }
        ],
        "pitfalls": [
          {
            "id": "unsafe",
            "label": "Mix every material into one final load",
            "fact": "The final Loop needs the community’s checked services, not a mixed load."
          },
          {
            "id": "skip",
            "label": "Record the job without confirmation",
            "fact": "A complete work order needs its checks and the team’s approval before the final record."
          }
        ],
        "actions": [
          "confirm",
          "team",
          "record",
          "unsafe",
          "skip",
          "check"
        ]
      }
    ],
    "dispatch": [
      {
        "title": "The community assembly · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 4,
        "separate": false,
        "loads": [
          {
            "id": "paper",
            "label": "Dry paper bundles",
            "item": "newspaper",
            "route": "paper",
            "pickup": "Covered school store",
            "delivery": "Square dry-paper point",
            "spaces": 2,
            "fact": "Protect clean fibre from moisture and food."
          },
          {
            "id": "reuse",
            "label": "Checked books for sharing",
            "item": "book",
            "route": "reuse",
            "pickup": "Library exchange",
            "delivery": "Square reading shelf",
            "spaces": 2,
            "fact": "Usable books can serve another reader."
          }
        ]
      },
      {
        "title": "The five-district link · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 3,
        "separate": false,
        "loads": [
          {
            "id": "containers",
            "label": "Empty accepted containers",
            "item": "bottle",
            "route": "containers",
            "pickup": "Traders’ container point",
            "delivery": "Listed container intake",
            "spaces": 2,
            "fact": "This local service accepts these empty containers."
          },
          {
            "id": "cartons",
            "label": "Empty accepted cartons",
            "item": "carton",
            "route": "centre",
            "pickup": "Carton holding bay",
            "delivery": "Lebo’s listed carton bay",
            "spaces": 2,
            "fact": "The centre confirms that it accepts these empty cartons."
          }
        ]
      },
      {
        "title": "The heart of The Loop · city connection",
        "brief": "Musa and the trained collection team handle the loads. Connect the listed pickups and deliveries without exceeding the available game load spaces.",
        "capacity": 2,
        "separate": false,
        "loads": [
          {
            "id": "reuse",
            "label": "Checked books for sharing",
            "item": "book",
            "route": "reuse",
            "pickup": "Library exchange",
            "delivery": "Square reading shelf",
            "spaces": 2,
            "fact": "Usable books can serve another reader."
          },
          {
            "id": "paper",
            "label": "Dry paper bundles",
            "item": "newspaper",
            "route": "paper",
            "pickup": "Covered school store",
            "delivery": "Square dry-paper point",
            "spaces": 2,
            "fact": "Protect clean fibre from moisture and food."
          }
        ]
      }
    ]
  }
];
});
