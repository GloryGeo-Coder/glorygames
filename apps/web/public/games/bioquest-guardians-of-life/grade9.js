'use strict';
// Selected Grade 9 CAPS Life and Living concepts; see docs/releases/bioquest-grade9.md.
window.BIOQUEST_GRADE9 = [
  {
    "id": "g9-cells",
    "title": "The Cell Discovery Lab",
    "place": "Microscope studio",
    "icon": "🔬",
    "theme": "g9-cells",
    "intro": "Nala and Pip open a new exhibit about life at a tiny scale. Use models and observations to investigate cells.",
    "learn": "Cells are the basic structural and functional units of life. A cell membrane controls movement into and out of a cell. The nucleus contains genetic material, and mitochondria release energy through cellular respiration. Typical green leaf cells also have chloroplasts, a cell wall and a large vacuole.",
    "tasks": [
      {
        "kind": "sort",
        "prompt": "Match each cell structure to its main role.",
        "groups": [
          "Controls entry and exit",
          "Contains genetic material",
          "Releases energy"
        ],
        "items": [
          {
            "name": "Cell membrane",
            "icon": "🔎",
            "group": "Controls entry and exit"
          },
          {
            "name": "Nucleus",
            "icon": "🔬",
            "group": "Contains genetic material"
          },
          {
            "name": "Mitochondrion",
            "icon": "⚡",
            "group": "Releases energy"
          }
        ],
        "hint": "The membrane is a boundary; the nucleus contains DNA; mitochondria help release energy.",
        "explain": "Cell structures have different roles that help the cell function."
      },
      {
        "kind": "choice",
        "prompt": "Which structure occurs in a typical green leaf cell but not an animal cell?",
        "options": [
          "Nucleus",
          "Chloroplast",
          "Cell membrane"
        ],
        "answer": 1,
        "hint": "Think about the structure that absorbs light for photosynthesis.",
        "explain": "Chloroplasts absorb light for photosynthesis. Plant and animal cells both have cell membranes and usually a nucleus. Not all plant cells contain chloroplasts."
      },
      {
        "kind": "choice",
        "prompt": "A microscope image shows repeated tiny compartments in an onion sample. What is the best scientific record?",
        "options": [
          "Draw and label only what is visible, noting the magnification",
          "Invent structures that cannot be seen",
          "Decide that all cells have exactly this shape"
        ],
        "answer": 0,
        "hint": "Separate observations from assumptions.",
        "explain": "A labelled observational drawing records visible evidence. Different cell types can have different shapes and structures."
      }
    ]
  },
  {
    "id": "g9-systems",
    "title": "The Body Systems Hub",
    "place": "Living systems gallery",
    "icon": "🧩",
    "theme": "g9-systems",
    "intro": "The community exhibit needs a map showing how small structures work together. Help Nala connect the levels of organisation.",
    "learn": "In a multicellular organism, specialised cells work together in tissues. Tissues form organs, and organs cooperate in systems. Systems interact to keep the organism functioning.",
    "tasks": [
      {
        "kind": "sequence",
        "prompt": "Arrange the levels from smallest to largest.",
        "options": [
          "Organ",
          "Organism",
          "Cell",
          "System",
          "Tissue"
        ],
        "order": [
          "Cell",
          "Tissue",
          "Organ",
          "System",
          "Organism"
        ],
        "hint": "Cells work together in tissues; tissues form organs.",
        "explain": "Cells form tissues, tissues form organs, organs work in systems, and interacting systems make up an organism."
      },
      {
        "kind": "sort",
        "prompt": "Match each organ to the system highlighted here.",
        "groups": [
          "Nervous",
          "Circulatory",
          "Excretory"
        ],
        "items": [
          {
            "name": "Brain",
            "icon": "🧠",
            "group": "Nervous"
          },
          {
            "name": "Heart",
            "icon": "🫀",
            "group": "Circulatory"
          },
          {
            "name": "Kidney",
            "icon": "🔎",
            "group": "Excretory"
          }
        ],
        "hint": "The brain processes signals, the heart pumps blood, and kidneys remove wastes from blood.",
        "explain": "Organs contribute to systems: the brain to the nervous system, the heart to circulation, and kidneys to excretion."
      },
      {
        "kind": "choice",
        "prompt": "Why do digestive and circulatory systems work together?",
        "options": [
          "Digestion replaces the need for blood",
          "Blood digests all food in the stomach",
          "Absorbed nutrients are transported to cells in the blood"
        ],
        "answer": 2,
        "hint": "Food molecules must reach cells throughout the body.",
        "explain": "After absorption, nutrients can be carried in blood to cells. Body systems cooperate rather than working in isolation."
      }
    ]
  },
  {
    "id": "g9-oxygen",
    "title": "The Oxygen Journey",
    "place": "Breathing and circulation dome",
    "icon": "🫁",
    "theme": "g9-oxygen",
    "intro": "Pip follows an oxygen molecule from the air to a body cell. Distinguish the processes along its route.",
    "learn": "Breathing moves air into and out of the lungs. Gas exchange occurs by diffusion between alveoli and blood. The heart circulates blood, and cells use oxygen in aerobic respiration to release energy from glucose. Arteries carry blood away from the heart; veins return blood to it.",
    "tasks": [
      {
        "kind": "sort",
        "prompt": "Match each event with its process.",
        "groups": [
          "Breathing",
          "Gas exchange",
          "Cellular respiration"
        ],
        "items": [
          {
            "name": "Air moves into the lungs",
            "icon": "🫁",
            "group": "Breathing"
          },
          {
            "name": "Oxygen diffuses from an alveolus into blood",
            "icon": "🫧",
            "group": "Gas exchange"
          },
          {
            "name": "A cell releases energy from glucose using oxygen",
            "icon": "⚡",
            "group": "Cellular respiration"
          }
        ],
        "hint": "Moving air, moving gases across a surface, and releasing energy are different processes.",
        "explain": "Breathing ventilates the lungs, gas exchange transfers gases by diffusion, and aerobic respiration releases energy in cells."
      },
      {
        "kind": "sequence",
        "prompt": "Follow oxygen-rich blood from the lungs towards body tissues.",
        "options": [
          "Body capillaries",
          "Left side of the heart",
          "Lung capillaries",
          "Arteries to the body"
        ],
        "order": [
          "Lung capillaries",
          "Left side of the heart",
          "Arteries to the body",
          "Body capillaries"
        ],
        "hint": "Blood returns from the lungs to the left side of the heart before being pumped around the body.",
        "explain": "Blood receives oxygen in the lungs, returns to the left side of the heart, and travels through arteries to body capillaries, where oxygen diffuses towards cells."
      },
      {
        "kind": "choice",
        "prompt": "Which statement correctly describes arteries and veins?",
        "options": [
          "All veins carry oxygen-poor blood",
          "Arteries carry blood away from the heart; veins carry it towards the heart",
          "All arteries carry oxygen-rich blood"
        ],
        "answer": 1,
        "hint": "Name the vessel by its direction relative to the heart, not its oxygen content.",
        "explain": "Pulmonary arteries carry oxygen-poor blood from the heart to the lungs; pulmonary veins carry oxygen-rich blood back. Direction defines the vessel type."
      }
    ]
  },
  {
    "id": "g9-digestion",
    "title": "The Digestive Trail",
    "place": "Nutrient discovery hall",
    "icon": "🍎",
    "theme": "g9-digestion",
    "intro": "Nala traces what happens to food inside the body. Rebuild the exhibit using a simplified digestive-system model.",
    "learn": "Digestion breaks food down mechanically and chemically into smaller molecules. Many nutrients are absorbed through the small-intestine wall into the blood. Most remaining water is absorbed before undigested material leaves the body; the large intestine absorbs water from the remaining contents.",
    "tasks": [
      {
        "kind": "sequence",
        "prompt": "Arrange these parts in the order food passes through them.",
        "options": [
          "Stomach",
          "Large intestine",
          "Mouth",
          "Small intestine",
          "Oesophagus"
        ],
        "order": [
          "Mouth",
          "Oesophagus",
          "Stomach",
          "Small intestine",
          "Large intestine"
        ],
        "hint": "Food travels from the mouth down the oesophagus before reaching the stomach.",
        "explain": "This simplified route follows the alimentary canal. Material eventually passes through the rectum and anus."
      },
      {
        "kind": "choice",
        "prompt": "Which example describes absorption rather than digestion?",
        "options": [
          "Chewing breaks food into smaller pieces",
          "Enzymes break large food molecules into smaller ones",
          "Small nutrient molecules move through the intestinal wall into blood"
        ],
        "answer": 2,
        "hint": "Absorption means taking digested nutrients across the gut wall.",
        "explain": "Digestion breaks food down. Absorption moves small nutrient molecules through the gut wall into the body’s transport system."
      },
      {
        "kind": "choice",
        "prompt": "Why does the small intestine have many tiny projections called villi?",
        "options": [
          "They increase surface area for absorption",
          "They pump blood around the whole body",
          "They prevent all molecules from entering blood"
        ],
        "answer": 0,
        "hint": "More surface area allows more contact with digested nutrients.",
        "explain": "Villi increase the surface available for absorbing nutrients. Their blood supply helps transport absorbed nutrients away."
      }
    ]
  },
  {
    "id": "g9-reproduction",
    "title": "Life Continues",
    "place": "Life-cycle learning studio",
    "icon": "🌱",
    "theme": "g9-reproduction",
    "intro": "Nala and Pip finish the exhibit with a respectful, scientific look at human reproduction. These activities use general biological models and never ask about your own body.",
    "learn": "Human reproduction involves sperm and egg cells. Fertilisation usually occurs in an oviduct when a sperm joins an egg to form a zygote. The developing ball of cells can implant in the lining of the uterus. Puberty is a period of biological development; its timing varies between people.",
    "tasks": [
      {
        "kind": "sort",
        "prompt": "Match each structure with its reproductive role.",
        "groups": [
          "Produces sperm",
          "Produces egg cells",
          "Supports development after implantation"
        ],
        "items": [
          {
            "name": "Testis",
            "icon": "🔎",
            "group": "Produces sperm"
          },
          {
            "name": "Ovary",
            "icon": "🔎",
            "group": "Produces egg cells"
          },
          {
            "name": "Uterus",
            "icon": "🔎",
            "group": "Supports development after implantation"
          }
        ],
        "hint": "Testes produce sperm, ovaries produce egg cells, and development after implantation takes place in the uterus.",
        "explain": "The reproductive system has specialised structures with different roles. These are general biological descriptions, not questions about any individual."
      },
      {
        "kind": "sequence",
        "prompt": "Order this simplified model of early human development.",
        "options": [
          "Implantation in the uterine lining",
          "Fertilisation forms a zygote",
          "The cells divide as they travel towards the uterus"
        ],
        "order": [
          "Fertilisation forms a zygote",
          "The cells divide as they travel towards the uterus",
          "Implantation in the uterine lining"
        ],
        "hint": "Fertilisation happens before cell division and implantation.",
        "explain": "After fertilisation, the zygote divides. The developing group of cells may then implant in the uterine lining; fertilisation and implantation are different events."
      },
      {
        "kind": "choice",
        "prompt": "Which statement about puberty is scientifically accurate?",
        "options": [
          "Everyone begins on the same birthday",
          "Its timing and pace can vary between people",
          "It means every person must become a parent"
        ],
        "answer": 1,
        "hint": "Biological development is not a competition or a fixed timetable.",
        "explain": "Puberty involves biological changes as the body matures. Timing varies, and reproductive development does not determine anyone’s choices about becoming a parent."
      }
    ]
  }
];
