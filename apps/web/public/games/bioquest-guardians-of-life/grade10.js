'use strict';
// Selected Grade 10 CAPS Life Sciences investigations, not full syllabus coverage.
window.BIOQUEST_GRADE10 = [
  {
    "id": "g10-molecules",
    "title": "Molecular Evidence Lab",
    "place": "The archive laboratory",
    "icon": "🧪",
    "theme": "g10-molecules",
    "intro": "Nala and Pip begin the final chapter of their research-centre journey. Restore the Living Archive by testing ideas, from molecules to the history of life.",
    "learn": "Carbohydrates, lipids, proteins and nucleic acids have different roles in cells. Enzymes are biological catalysts, usually proteins. Temperature and pH affect their activity. Compare evidence fairly by changing one factor at a time.",
    "tasks": [
      {
        "kind": "sort",
        "prompt": "Match each molecule with its role in this model.",
        "groups": [
          "Stores genetic information",
          "Builds proteins",
          "Stores carbohydrate energy"
        ],
        "items": [
          {
            "name": "DNA",
            "icon": "🔎",
            "group": "Stores genetic information"
          },
          {
            "name": "Amino acid",
            "icon": "🔎",
            "group": "Builds proteins"
          },
          {
            "name": "Starch",
            "icon": "🔎",
            "group": "Stores carbohydrate energy"
          }
        ],
        "hint": "DNA carries information; amino acids join to make proteins.",
        "explain": "DNA stores genetic information. Amino acids are protein building blocks. Plants can store carbohydrate as starch."
      },
      {
        "kind": "choice",
        "prompt": "Pip records enzyme activity: 10°C = 2 units, 30°C = 8 units, 60°C = 1 unit. Which conclusion is supported?",
        "options": [
          "Activity always increases with temperature",
          "30°C gave the highest activity among the tested temperatures",
          "Every enzyme works best at 30°C"
        ],
        "answer": 1,
        "hint": "Compare only the temperatures and enzyme actually tested.",
        "explain": "The highest measured activity was at 30°C. These three readings do not establish the exact optimum or a rule for every enzyme. High temperatures can disrupt an enzyme’s shape."
      },
      {
        "kind": "choice",
        "prompt": "To test temperature’s effect on this enzyme, which plan makes the fairest comparison?",
        "options": [
          "Change temperature, pH and enzyme amount together",
          "Use a different enzyme at every temperature",
          "Change temperature; keep pH, enzyme amount, substrate amount and time the same"
        ],
        "answer": 2,
        "hint": "Only the factor being investigated should deliberately change.",
        "explain": "Temperature is the independent variable; measured activity is the dependent variable. Holding other conditions constant improves validity, and repeating trials improves reliability."
      }
    ]
  },
  {
    "id": "g10-membranes",
    "title": "Membrane Exchange",
    "place": "The cell boundary station",
    "icon": "🔬",
    "theme": "g10-membranes",
    "intro": "The archive’s cell model has lost its transport labels. Help Nala work out how substances cross cell membranes.",
    "learn": "Diffusion is net movement down a concentration gradient. Osmosis is the net movement of water across a selectively permeable membrane from higher to lower water potential. Active transport uses energy to move substances against a concentration gradient.",
    "tasks": [
      {
        "kind": "sort",
        "prompt": "Match each example with its transport process.",
        "groups": [
          "Diffusion",
          "Osmosis",
          "Active transport"
        ],
        "items": [
          {
            "name": "Oxygen moves down its concentration gradient",
            "icon": "🔎",
            "group": "Diffusion"
          },
          {
            "name": "Water crosses a selectively permeable membrane down its water-potential gradient",
            "icon": "🔎",
            "group": "Osmosis"
          },
          {
            "name": "A cell uses energy to move ions against their concentration gradient",
            "icon": "🔎",
            "group": "Active transport"
          }
        ],
        "hint": "Ask whether the example involves water, a concentration gradient or energy.",
        "explain": "Diffusion and osmosis are passive processes. Active transport requires energy and can move substances against their concentration gradient."
      },
      {
        "kind": "choice",
        "prompt": "A plant cell is placed in a more concentrated salt solution. Salt cannot cross in this model. Which initial net movement is expected?",
        "options": [
          "Water moves out of the cell",
          "Salt and water must both move into the cell",
          "No water can cross a cell membrane"
        ],
        "answer": 0,
        "hint": "The external solution has lower water potential in this model.",
        "explain": "Water moves out by osmosis, from higher water potential inside to lower water potential outside. The cell loses water; enough water loss can pull its membrane away from its wall."
      },
      {
        "kind": "choice",
        "prompt": "There is more oxygen outside a cell than inside. Oxygen can cross freely. What does diffusion predict?",
        "options": [
          "All molecules stop moving at equal concentrations",
          "Net oxygen movement is initially into the cell",
          "Oxygen needs a pump to move down this gradient"
        ],
        "answer": 1,
        "hint": "Net movement describes the overall result, not the path of every molecule.",
        "explain": "Oxygen moves both ways, but initially more moves into the cell. At equilibrium, random movement continues even though there is no net movement."
      }
    ]
  },
  {
    "id": "g10-growth",
    "title": "Growth and Repair",
    "place": "The growing-tissue studio",
    "icon": "🌱",
    "theme": "g10-growth",
    "intro": "Nala restores a model of a growing root tip. Follow cell division and discover how specialised cells help tissues work.",
    "learn": "Before mitosis, DNA is copied during interphase. Mitosis separates duplicated chromosomes into two nuclei; cytokinesis divides the cytoplasm. This supports growth and repair. Differentiation produces cells specialised for particular functions.",
    "tasks": [
      {
        "kind": "sequence",
        "prompt": "Order the stages of mitosis after DNA has already been copied.",
        "options": [
          "Anaphase: sister chromatids separate",
          "Telophase: new nuclei form",
          "Prophase: chromosomes condense",
          "Metaphase: chromosomes line up"
        ],
        "order": [
          "Prophase: chromosomes condense",
          "Metaphase: chromosomes line up",
          "Anaphase: sister chromatids separate",
          "Telophase: new nuclei form"
        ],
        "hint": "Line-up happens before separation; new nuclei form afterwards.",
        "explain": "These are the four named stages of mitosis. DNA replication occurs beforehand in interphase, not during mitosis. Cytokinesis divides the cytoplasm."
      },
      {
        "kind": "choice",
        "prompt": "A body cell with 8 chromosomes completes normal mitosis and cytokinesis. How many chromosomes does each daughter cell have?",
        "options": [
          "4",
          "16",
          "8"
        ],
        "answer": 2,
        "hint": "Mitosis preserves the chromosome number in each daughter cell.",
        "explain": "Each daughter cell has 8 chromosomes. DNA is copied first and distributed so that each receives the same chromosome set, barring mutation or errors."
      },
      {
        "kind": "choice",
        "prompt": "Why can a root-hair cell and a leaf guard cell have different shapes and functions?",
        "options": [
          "Differentiation produces specialised cell structures",
          "Every plant cell performs exactly the same role",
          "Mitosis always halves the chromosome number"
        ],
        "answer": 0,
        "hint": "Specialised structures suit different jobs in a plant.",
        "explain": "Differentiation gives cells features suited to their roles. Root hairs increase the surface for absorption; guard cells regulate stomatal openings. A tissue contains cells organised for particular functions."
      }
    ]
  },
  {
    "id": "g10-transport",
    "title": "Plant Transport Station",
    "place": "The research greenhouse",
    "icon": "🌿",
    "theme": "g10-transport",
    "intro": "The greenhouse brings the archive’s cell discoveries into a whole plant. Help Nala connect roots, stems and leaves using evidence.",
    "learn": "Xylem carries water and dissolved mineral ions from roots towards leaves. Phloem transports sugars from sources to sinks. Transpiration is water-vapour loss, mainly through stomata. Temperature, humidity, wind and light can affect its rate.",
    "tasks": [
      {
        "kind": "sort",
        "prompt": "Match each plant structure with its main role here.",
        "groups": [
          "Water and mineral transport",
          "Sugar transport",
          "Controls stomatal opening"
        ],
        "items": [
          {
            "name": "Xylem",
            "icon": "🔎",
            "group": "Water and mineral transport"
          },
          {
            "name": "Phloem",
            "icon": "🔎",
            "group": "Sugar transport"
          },
          {
            "name": "Guard cells",
            "icon": "🔎",
            "group": "Controls stomatal opening"
          }
        ],
        "hint": "Xylem and phloem are vascular tissues; guard cells surround a pore.",
        "explain": "Xylem transports water and minerals. Phloem moves sugars from sources to sinks, which can lie above or below a source. Guard cells regulate openings used in gas exchange and water-vapour loss."
      },
      {
        "kind": "sequence",
        "prompt": "Trace this simplified route of water from soil to air.",
        "options": [
          "Water travels through stem xylem to a leaf",
          "Water evaporates from leaf cells",
          "Water vapour diffuses out through stomata",
          "Water enters a root hair",
          "Water reaches root xylem"
        ],
        "order": [
          "Water enters a root hair",
          "Water reaches root xylem",
          "Water travels through stem xylem to a leaf",
          "Water evaporates from leaf cells",
          "Water vapour diffuses out through stomata"
        ],
        "hint": "Liquid water travels through xylem before evaporating in the leaf.",
        "explain": "Roots take up water, xylem conducts it to leaves, and water evaporates into leaf air spaces before diffusing out. Transpiration pull helps draw water along the xylem."
      },
      {
        "kind": "choice",
        "prompt": "Matched leafy shoots take up 2 mL in still air and 5 mL in moving air over the same time. Other conditions are held constant. What is the best conclusion?",
        "options": [
          "Wind proves plants make more sugar",
          "Water uptake equals transpiration exactly in every plant",
          "Moving air increased water uptake in this trial, consistent with faster transpiration"
        ],
        "answer": 2,
        "hint": "A potometer measures uptake, which estimates water loss but is not identical to it.",
        "explain": "Moving air can remove humid air around leaves. The result is consistent with increased transpiration, but water uptake is an indirect estimate. Repeat the trial and control leaf area and other conditions."
      }
    ]
  },
  {
    "id": "g10-archive",
    "title": "The Deep-Time Archive",
    "place": "The Karoo discovery hall",
    "icon": "🦴",
    "theme": "g10-archive",
    "intro": "The final archive room connects today’s living world with evidence from the past. Nala and Pip invite the community to explore South Africa’s fossil heritage and protect living habitats.",
    "learn": "Fossils preserve evidence of past life. In an undisturbed sedimentary sequence, lower layers are generally older than layers above. Relative dating gives an order, not an exact age. Evidence from fossils and living ecosystems helps us ask better questions about biodiversity.",
    "tasks": [
      {
        "kind": "sequence",
        "prompt": "Order this simplified example of fossil formation.",
        "options": [
          "More sediment accumulates and hardens over time",
          "Erosion later exposes the fossil-bearing rock",
          "An organism dies",
          "Sediment quickly buries the remains"
        ],
        "order": [
          "An organism dies",
          "Sediment quickly buries the remains",
          "More sediment accumulates and hardens over time",
          "Erosion later exposes the fossil-bearing rock"
        ],
        "hint": "Burial protects remains before rock formation; exposure comes later.",
        "explain": "This is one possible route, not a guarantee. Fossilisation is uncommon, and many organisms leave no fossil record. Fossils can include preserved remains or traces such as footprints."
      },
      {
        "kind": "choice",
        "prompt": "A fossil lies in layer A below layer B. The sedimentary layers are undisturbed. What can Nala infer?",
        "options": [
          "The fossil in A is generally older than fossils deposited in B",
          "The fossil is exactly one million years old",
          "Every organism in A was an ancestor of every organism in B"
        ],
        "answer": 0,
        "hint": "Layer order provides relative timing, not an exact date or an ancestry claim.",
        "explain": "Under these stated conditions, layer A was deposited earlier. Relative dating alone does not supply a numerical age or prove direct ancestry."
      },
      {
        "kind": "choice",
        "prompt": "Repeated surveys find fewer native species where a wetland has been drained. Which next step best uses evidence to protect biodiversity?",
        "options": [
          "Ignore the surveys because fossils are more important",
          "Protect remaining habitat, investigate other causes and monitor recovery",
          "Promise that one action will restore every species immediately"
        ],
        "answer": 1,
        "hint": "Use the observations, check possible causes and keep measuring.",
        "explain": "Habitat loss can threaten biodiversity. Evidence-informed protection combines action with continued observation and evaluation. Nala and Pip’s Living Archive is now ready to help the community keep learning and caring for life."
      }
    ]
  }
];
