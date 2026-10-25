// Game-specific, player-focused editorial content based on the shipped game manifests.
// Keep guides aligned with actual deployed gameplay. Do not invent undocumented controls.

export type GameEditorial = {
  category: string;
  sponsor?: string;
  summary: string;
  overview: string[];
  story: string[];
  howToPlay: string[];
  desktop: string[];
  mobile: string[];
  systems: { title: string; body: string }[];
  progression: string[];
  tips: string[];
  faqs: { q: string; a: string }[];
  learning?: string[];
};

export const GAME_EDITORIALS: Record<string, GameEditorial> = {
  "brick-blaster": {
    "category": "Arcade",
    "summary": "Restore Neon Grid through five missions with interactive bricks, rescue drones, enemies and the Grid Warden, or chase high scores in Classic Arcade.",
    "overview": [
      "Brick Blaster combines Classic Arcade with the five-mission Neon Grid campaign. Clear barriers, activate relays, release repair drones, defeat a Sentinel and dismantle the Grid Warden’s generators before striking its exposed eye. Five illustrated scenes give each campaign mission its own setting.",
      "The fun comes from the changing angles. A return near the middle of the paddle can behave differently from one caught near an edge, so good play involves looking ahead to where the ball will travel after its next impact. The game also includes collectible power-ups and a score-submission option."
    ],
    "story": [
      "Neon Grid has fallen silent. Restore its five connected sites by breaching the outer barrier, rerouting power, evacuating repair drones and clearing the security dockyard. At the signal spire, disable the Grid Warden’s generators and watch for its eye to open.",
      "Classic Arcade keeps the pure paddle-and-ball score challenge available whenever you want a quick run. The campaign adds designed objectives, enemy warnings and a saved route through the city."
    ],
    "howToPlay": [
      "Choose Classic Arcade or an unlocked Neon Grid mission, then use Launch to release the ball.",
      "Steer with the dedicated control strip below the arena. Choose relative drag or direct positioning in Settings.",
      "Keep the ball from passing the paddle while aiming rebounds toward unbroken bricks.",
      "Watch for power-ups during play and use the opportunities they provide to maintain momentum.",
      "When the round finishes, review your score and use the available score submission or restart controls."
    ],
    "desktop": [
      "Move the paddle with the input displayed in the game; dragging moves the paddle.",
      "Tap or click the launch control to release the ball and continue when prompted."
    ],
    "mobile": [
      "Drag on the control strip beneath the arena to keep your finger clear of the ball. Tap Launch and Pause/Menu as needed.",
      "Rotate freely; the game pauses for a safe layout change. Continue when you are ready."
    ],
    "systems": [
      {
        "title": "Paddle and rebound control",
        "body": "The paddle is both your defence and your aiming tool. Follow the ball's downward path early so you can arrive at the interception point rather than chasing it."
      },
      {
        "title": "Brick clearing",
        "body": "Progress is visible in the bricks removed from the board. Look for openings that let the ball travel behind clusters instead of repeatedly striking the same protected region."
      },
      {
        "title": "Power-ups and score runs",
        "body": "Power-ups can change the rhythm of a round. Their exact effect is communicated by the game when collected; keep the ball safe while adapting to the change."
      },
      {
        "title": "Neon Grid objectives and scenes",
        "body": "Activate relays, free drones from rescue pods, stop shooting enemies and disable generators. Each of the five missions has its own illustrated scene; Settings also offers the neon-grid background."
      }
    ],
    "progression": [
      "Complete the five Neon Grid missions in order. Best scores, unlocks and one-to-three-star results save on the same browser when storage is available. Fewer lives lost earns a stronger star result.",
      "Campaign missions begin with three lives. Classic Arcade remains a separate repeatable score challenge, with six collectible power-ups and progressively generated brick formations."
    ],
    "tips": [
      "Watch the ball's trajectory, not just its current location; move before it reaches the paddle.",
      "Aim rebounds toward isolated bricks or gaps rather than returning the ball at random.",
      "Keep the paddle near the expected landing zone after a difficult ricochet.",
      "Do not abandon a safe catch to chase a power-up that would leave the ball uncovered.",
      "Use a few practice rounds to understand the pace before trying to maximise points."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "Neon Grid has five progressively unlocked missions: Breach the Grid, Circuit Reroute, Skybridge Evac, Sentinel Sweep and The Grid Warden. Classic Arcade is a separate score challenge with generated formations."
      },
      {
        "q": "How do I move the paddle?",
        "a": "Use the control strip below the arena. Settings offers relative movement and direct positioning; mouse and touch input are supported."
      },
      {
        "q": "What happens when I miss the ball?",
        "a": "Missing the ball costs a life. When no lives remain, the run ends; restart Classic Arcade or retry the campaign mission. Position the paddle early to protect each return."
      },
      {
        "q": "Can I submit a high score?",
        "a": "The game includes on-screen score-submission functionality; whether a result appears publicly depends on the site's score service."
      }
    ]
  },
  "bubble-pop-arena": {
    "category": "Casual",
    "summary": "Pop and drag through a continuous score attack across six changing arenas. Chain combos, collect time, freeze and bonus bubbles, and avoid bombs.",
    "overview": [
      "Bubble Pop Arena is one continuous round that begins with 45 seconds. Gold time bubbles extend the same run while six arena backgrounds and musical themes change as your score grows. Later waves bring denser, more varied bubbles; there is no campaign level selector.",
      "Instead of asking you to navigate a maze or defeat an enemy, Bubble Pop Arena tests visual scanning. You have to notice which bubbles are worth pursuing, choose a safe path for your finger or cursor and decide when chasing a combo is better than playing conservatively."
    ],
    "story": [
      "Bubbles drift across the arena as the clock counts down. Some are simple targets, others extend your time or briefly freeze the action, and a dangerous bomb bubble can interrupt a promising run. Each round is an opportunity to plan quicker, more accurate popping routes."
    ],
    "howToPlay": [
      "Start the round and watch the bubbles appearing in the arena.",
      "Tap ordinary bubbles to pop them, or drag across a group to pop several in sequence.",
      "Look for opportunities to chain successful pops into combos.",
      "Recognise special time and freeze bubbles, and consider how they can help your remaining run.",
      "Avoid bomb bubbles while maintaining your streak, then check the final score and replay to improve."
    ],
    "desktop": [
      "Click bubbles with the mouse, or hold and drag the pointer across safe clusters.",
      "Use the displayed buttons to pause, restart or submit a score."
    ],
    "mobile": [
      "Tap individual bubbles or drag a finger through groups of safe bubbles.",
      "Use the game's on-screen controls for pause, restarting and score submission."
    ],
    "systems": [
      {
        "title": "Timed rounds",
        "body": "The clock makes every movement matter. Long pauses and unnecessary cursor travel cost opportunities even when no bubble is missed."
      },
      {
        "title": "Combos",
        "body": "Rapid, clean popping can create combinations. Planning a short path across nearby safe targets is often more effective than hopping across the full screen."
      },
      {
        "title": "Special and hazardous bubbles",
        "body": "Time bubbles, freeze effects and bomb hazards add decisions beyond simple tapping. The best target is not always the nearest one."
      }
    ],
    "progression": [
      "This is a replay-focused score-attack game rather than a level-based narrative. Each run begins with the same core task and ends when its timed challenge is complete.",
      "Track the balance between speed and accuracy. Special bubbles can give you more room to build a strong result, but careless movement through a hazard can undermine a promising run."
    ],
    "tips": [
      "Scan an area before starting a drag so the swipe does not cross a bomb.",
      "Target tight clusters for efficient combos instead of scattering taps around the screen.",
      "Prioritise extra-time opportunities when the clock is running low.",
      "Use a freeze opportunity to control the pace and choose the next safe targets.",
      "Replay with attention to your missed opportunities, not just the final number."
    ],
    "faqs": [
      {
        "q": "Does this game have a fixed campaign?",
        "a": "There are six changing arenas within a continuous round. You start with 45 seconds and collect time bubbles to extend the run; there are no fixed campaign levels."
      },
      {
        "q": "Can I drag through multiple bubbles?",
        "a": "Yes. The controls support both tapping and dragging as supported ways to pop bubbles."
      },
      {
        "q": "Are all bubbles safe?",
        "a": "No. Bomb bubbles are hazards, while time and freeze bubbles are special opportunities."
      },
      {
        "q": "Is there a story mode?",
        "a": "Bubble Pop Arena is a timed arcade challenge: pop safe bubbles, build combos and make the most of each round before the clock runs out."
      }
    ]
  },
  "city-quest-rise-of-the-guardian": {
    "category": "Adventure",
    "summary": "Explore 25 township platforming levels with animated characters, NPC missions, shooting enemies and drones, moving platforms, bosses and Amapiano-inspired music.",
    "overview": [
      "City Quest: Rise of the Guardian is a 25-level township adventure with longer routes, animated movement and combat, NPC objectives, moving platforms, ground fire and shooting drones. The fifteen added routes extend the original township setting with new local scenes and increasingly demanding encounters.",
      "Movement and combat share the spotlight. Some sections require careful jumps or moving-platform timing; others ask you to deal with walking enemies, flying drones and obstacles. Coins, collectible items, equipment power-ups and character skins make exploring worthwhile beyond simply reaching the exit."
    ],
    "story": [
      "The Guardian's journey is the thread connecting the city's locations. NPCs provide missions and story guidance as you move from familiar neighbourhood spaces toward more demanding areas such as a rail yard, skyline bridge, underground vault and final trial.",
      "The setting matters because each area changes the kind of challenge you face. A rooftop sequence emphasises jumps and elevation, whereas a mission around traffic, marketplaces or hostile drones demands different reactions. The game contains 25 levels and includes boss stages."
    ],
    "howToPlay": [
      "Start story mode and read the guidance or mission information provided in the current area.",
      "Move through the environment, jump between platforms and avoid hazards.",
      "Speak to mission NPCs and interact with exits or objectives when prompted.",
      "Use Guardian energy shots against enemies or drones when a clear opportunity appears.",
      "Collect coins and helpful items, including defensive or recovery power-ups.",
      "Open the map when you need to understand your location or the next destination, then progress toward the level objective."
    ],
    "desktop": [
      "Move with the left/right arrow keys or A and D; jump with Space, Up or W.",
      "Shoot with J or Ctrl, interact or complete an exit with E or Enter, and open the map with M."
    ],
    "mobile": [
      "Use the displayed directional, Jump, Shoot, Action and Map buttons.",
      "Allow a moment to learn the touch-button arrangement before attempting a difficult platform sequence."
    ],
    "systems": [
      {
        "title": "NPC missions and guidance",
        "body": "Characters in the world explain what needs doing next. Mission text is part of the adventure rather than background decoration."
      },
      {
        "title": "Traversal and combat",
        "body": "Jumping, moving platforms and energy attacks create alternating traversal and enemy encounters."
      },
      {
        "title": "Collectibles and powers",
        "body": "Coins and items reward exploration. Shield, heart and blaster power-ups are gameplay mechanics, while unlockable skins provide longer-term goals."
      },
      {
        "title": "Township sound and movement",
        "body": "Twenty-five original Amapiano-inspired instrumentals accompany the routes. Animated movement, moving platforms, buffered jumps and touch controls support portrait and landscape play."
      }
    ],
    "progression": [
      "The game has 25 stages connected by a level map. Progress introduces new environments and challenges, building toward boss encounters and the final trial.",
      "Scoring integrates with WebGameArena, but a high score is not the only objective: completing missions and getting through each area's hazards are central to the experience."
    ],
    "tips": [
      "Read the floating mission guidance before racing past an NPC.",
      "Observe a moving platform's cycle for one moment before committing to a jump.",
      "Separate the problems of jumping and shooting; find safe footing before engaging a hard-to-reach drone.",
      "Look around for coins and defensive power-ups rather than following the shortest route every time.",
      "Use the map when an objective seems unclear; the level structure provides context."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "There are 25 campaign levels. Complete each route to unlock the next, with longer original routes and fifteen added township-themed stages."
      },
      {
        "q": "Does City Quest have a storyline?",
        "a": "Yes. Story mode, NPC missions and a 25-level sequence are parts of the game."
      },
      {
        "q": "Can the Guardian attack enemies?",
        "a": "Yes. Guardian energy shooting is used against enemies and flying drones."
      },
      {
        "q": "Is there a map?",
        "a": "Yes. Press M on desktop or use the Map button on mobile."
      }
    ]
  },
  "climate-rescue-quest": {
    "category": "Educational",
    "summary": "Restore the environment across 25 animated climate missions and five boss encounters, with nature-inspired level music, touch controls and saved progress.",
    "overview": [
      "Climate Rescue Quest combines an environmental theme with an accessible arcade challenge. The game moves across distinct scenes inspired by city environments, clean energy, waterways, forests and oceans. Players guide a hero through active stages while responding to obstacles and collecting helpful items.",
      "The environmental setting is more than a colour palette. Each backdrop suggests a different part of the climate challenge: energy decisions, water protection, healthy ecosystems and the importance of reducing waste. It is an introduction to those ideas through play, not a substitute for a complete climate-science lesson."
    ],
    "story": [
      "The adventure is framed as a sequence of environmental rescue tasks. The hero moves from one affected setting to the next, with later levels increasing the challenge and introducing a boss-style encounter.",
      "The rescue journey passes through 25 increasingly demanding missions, leading toward a major final challenge. Animated environments, changing hazards and powers such as Shield, Magnet and Freeze make each destination feel like a new part of the adventure."
    ],
    "howToPlay": [
      "Begin the current mission and watch how obstacles and collectible items enter the play area.",
      "Move the hero left or right to line up with beneficial items and avoid hazards.",
      "Use power-ups only when they will help: shielding for protection, magnet for collecting and freeze for control.",
      "Follow the game's level transitions as each new environment introduces another stage of the rescue theme.",
      "Keep an eye on remaining health or opportunities as the game becomes more demanding."
    ],
    "desktop": [
      "Use the arrow keys for horizontal movement.",
      "The controls support S, M and F for Shield, Magnet and Freeze, respectively."
    ],
    "mobile": [
      "Drag anywhere in the arena or hold the movement buttons to steer left and right.",
      "Use the on-screen movement and power-up buttons when available."
    ],
    "systems": [
      {
        "title": "Environmental level themes",
        "body": "City, energy, water, forest, ocean and related scenes visually connect each level to a sustainability topic."
      },
      {
        "title": "Three utility powers",
        "body": "Shield helps with protection, Magnet supports collection and Freeze changes the moment-to-moment pace."
      },
      {
        "title": "Increasing challenge",
        "body": "A 25-mission progression includes five smog-front encounters rather than repeating one identical screen."
      }
    ],
    "progression": [
      "Complete stages by surviving the challenges presented in each environment and making good use of limited power-up opportunities.",
      "Your results improve as you dodge hazards, collect helpful items and clear more challenging environmental stages. Watch the in-game score and mission feedback to see which actions help you progress."
    ],
    "tips": [
      "Steer early when multiple objects are approaching rather than making a last-second correction.",
      "Save a protective power for sections with little space to dodge.",
      "Treat environmental themes as prompts to learn more about recycling, clean energy and ecosystem protection.",
      "Learn which visual objects help and which hinder you before chasing speed.",
      "Use shorter practice attempts to become familiar with the power-up buttons."
    ],
    "learning": [
      "The game can spark discussion about environmental pressures affecting cities, water, forests and oceans.",
      "Parents and teachers can use the level settings to ask what real-world actions reduce pollution or support healthier environments."
    ],
    "faqs": [
      {
        "q": "How many stages are in Climate Rescue Quest?",
        "a": "There are 25 missions, including five boss encounters, with an original nature-inspired musical arrangement for each level."
      },
      {
        "q": "What does the magnet power do?",
        "a": "Magnet helps draw collectable items toward the hero, making it useful when pickups would otherwise be difficult to reach."
      },
      {
        "q": "Is this a science course?",
        "a": "No. It is an educationally themed arcade game that can motivate further discussion about climate and environmental care."
      }
    ]
  },
  "cyber-shield-academy": {
    "category": "Educational",
    "summary": "Solve 16 fictional cybersecurity investigations with saved checkpoints, chapter retries, evidence-led choices, progressive hints and untimed practice.",
    "overview": [
      "Cyber Shield Academy: Terminal Ops is a learning-focused cybersecurity adventure built around a simulated command-line interface. Instead of clicking an attack button, players examine information, type commands and work through a fictional case using principles such as authorisation, careful evidence handling and system integrity.",
      "The environment is intentionally simulated. Its terminals, files, hosts and investigation tools are part of the game and do not grant access to external systems. That makes the experience a way to practise structured reasoning and safe defensive habits without handling a real network."
    ],
    "story": [
      "Your first eight missions investigate Case BIT and the disappearance of ShieldOS creator Bit. The next eight bring Bit back as your adviser while you protect the fictional Beacon community network.",
      "Beacon investigations cover suspicious email, MFA recovery, role permissions, backup restoration, update planning, network containment, privacy and a final incident response. Compare source files, use simulated review tools and choose actions that protect legitimate services."
    ],
    "howToPlay": [
      "Read the objective and scope of the current training stage before entering commands.",
      "Use the simulated terminal to examine the files, hosts and tools available in that mission.",
      "Explore carefully; use tab completion and command history to avoid repeating long entries.",
      "Compare clues, check integrity where requested and preserve evidence as part of the fictional case.",
      "Use the Mission panel to choose an evidence-led response. Hints reveal a principle, then the next objective, then a command. Retry Chapter restores its starting checkpoint while retaining earlier evidence."
    ],
    "desktop": [
      "Type commands using the keyboard inside the simulated terminal.",
      "Use Tab to complete available commands, filenames, hosts and tools; use Up and Down to revisit command history."
    ],
    "mobile": [
      "Switch between Terminal, Mission, Network, Files and Toolkit using the panel buttons. Tap files or tools to insert a command, then press run.",
      "Use Complete for autocomplete and Previous / Next for command history. The layout adjusts to portrait, landscape and the on-screen keyboard."
    ],
    "systems": [
      {
        "title": "Simulated terminal",
        "body": "Commands and files operate inside a self-contained game environment. Their purpose is learning, not accessing real systems."
      },
      {
        "title": "Evidence and integrity",
        "body": "Tasks introduce evidence preservation, integrity verification and careful reporting as parts of an investigation."
      },
      {
        "title": "Ethics and defensive scope",
        "body": "The curriculum explicitly includes authorisation, least privilege, log preservation, incident response and change management."
      }
    ],
    "progression": [
      "Sixteen missions unlock in order. Close Case BIT after mission eight, then build a Beacon response using evidence from the following investigations. Progress, evidence, command history and chapter checkpoints save on this browser when browser storage is available.",
      "Untimed practice revisits any unlocked chapter without a countdown or leaderboard submissions. Practice progress is saved separately; Return to Campaign restores your campaign investigation. The learning review records completed skills, hint use and choices to revisit."
    ],
    "tips": [
      "Read a task's allowed scope before exploring any part of the simulation.",
      "Use Tab completion when unsure of a filename rather than relying on memory.",
      "Check available evidence before forming an explanation of what happened.",
      "Avoid changing simulated evidence unless the mission explicitly asks you to.",
      "Use Learning Review after a chapter and untimed practice for skills you want to revisit. If a containment timer expires, retry that chapter instead of restarting the whole investigation."
    ],
    "learning": [
      "The game introduces the language of Unix-like terminals, digital evidence and incident response.",
      "It reinforces ethical and defensive concepts: permission, least privilege, integrity and responsible reporting."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "There are 16 missions: eight Case BIT investigations followed by eight Beacon network investigations. Saved checkpoints, chapter retries and untimed practice support revision."
      },
      {
        "q": "Does the game connect to real servers?",
        "a": "No. It is described as a safe, simulated terminal-based cybersecurity game."
      },
      {
        "q": "Do I need coding experience?",
        "a": "No. Begin with the mission brief, practise the commands provided by the terminal, and use the available hints and feedback to build confidence."
      },
      {
        "q": "What is Case BIT?",
        "a": "Case BIT is the first eight-mission investigation. It leads into eight Beacon community-network investigations with Bit as your adviser."
      },
      {
        "q": "Will refreshing lose my progress?",
        "a": "Progress saves locally on this browser after you start and after commands. Continue Investigation restores your evidence, objectives and chapter state. If browser storage is unavailable, the game displays a notice and you can keep playing in the current tab."
      },
      {
        "q": "Does untimed practice affect my campaign or leaderboard?",
        "a": "No. Practice has a separate save and no leaderboard submissions. It is limited to unlocked chapters and pauses the containment countdown. Return to Campaign resumes your campaign save."
      }
    ]
  },
  "fruit-slice": {
    "category": "Arcade",
    "summary": "Slice animated fruit through 25 sunset trials or Endless Arcade, build combos and frenzy, avoid bombs and enjoy original stage music.",
    "overview": [
      "Fruit Slice is a reflex-based browser arcade game in which pieces of fruit move through the play area waiting to be sliced. Your finger or mouse becomes the blade: a clean swipe cuts the target and adds to the pace of the round.",
      "The key difference between an ordinary swipe and a strong run is control. You need to follow fast-moving fruit, connect safe targets into combos and resist the temptation to swing blindly when a bomb enters the same part of the screen. Twenty-five campaign trials add score, fruit-type, combo, golden-fruit and frenzy goals, with later stages unlocked through play. Endless Arcade keeps the original three-life challenge."
    ],
    "story": [
      "Fruit flies through the arena in bursts, inviting you to draw quick, accurate slicing lines. Safe targets sometimes appear beside bombs, so the most tempting swipe is not always the best one. Every round balances speed with restraint."
    ],
    "howToPlay": [
      "Choose Campaign or Endless. In Campaign, reach every displayed target before the timer expires to unlock the next trial.",
      "Swipe through one fruit or several aligned pieces to slice them.",
      "Build successful sequences to pursue combos and higher scoring opportunities.",
      "Avoid bomb objects even when they appear close to fruit you want to cut.",
      "Use frenzy for bonus scoring. Pause opens music and effects volumes, the level map, restart and score controls."
    ],
    "desktop": [
      "Click and drag the mouse through fruit to perform a slicing motion."
    ],
    "mobile": [
      "Swipe one or two fingers across the full-screen play area. The arena adapts to portrait and landscape; rotate safely and resume when ready.",
      "Try a controlled short swipe when hazards are near a group of targets."
    ],
    "systems": [
      {
        "title": "Swipe-based slicing",
        "body": "A swipe crosses the path of moving fruit. Choosing the start and end of the swipe matters more than frantically moving across the entire screen."
      },
      {
        "title": "Combos",
        "body": "Grouping successful cuts creates combo opportunities; scanning the fruit arrangement helps you chain actions."
      },
      {
        "title": "Bomb avoidance and frenzy",
        "body": "Bombs introduce risk, while frenzy mode creates moments of increased action that reward calm control."
      }
    ],
    "progression": [
      "This is an arcade replay loop with sound, animations and a score-focused round structure, not a campaign with named stages.",
      "Your progress is measured through the outcome of each attempt. Learn to improve safe target selection and combo building instead of only increasing swipe speed."
    ],
    "tips": [
      "Look for two or more fruit following similar paths and slice when they align.",
      "Use short deliberate gestures when a bomb is close to otherwise safe fruit.",
      "Wait for a clear opportunity instead of slicing every object immediately.",
      "During frenzy, focus on groups rather than trying to reach every separate fruit.",
      "Pause and restart between attempts when the pace begins to affect precision."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "There are 25 campaign trials with progressive unlocks. Endless Arcade is a separate three-life score challenge."
      },
      {
        "q": "How do I slice fruit on a laptop?",
        "a": "Click and drag the pointer across fruit. A quick motion works like a swipe."
      },
      {
        "q": "Should I slice every object?",
        "a": "No. Bombs are hazards and should be avoided."
      },
      {
        "q": "What makes a good Fruit Slice run?",
        "a": "Accurate swipes, well-timed fruit combinations and careful bomb avoidance are the keys to building a stronger score."
      }
    ]
  },
  "high-spead-racer": {
    "category": "Racing",
    "summary": "Rebuild your family garage in High Speed Racer: City of Legends through six career jobs, twelve arcade streets, 3D cars, reactive rivals and recoverable collisions.",
    "overview": [
      "High Speed Racer: City of Legends combines a six-job opening career chapter with twelve arcade streets. Choose your driver’s name, appearance and driving identity, race original 3D cars, improve the garage and compete with rivals that accelerate, defend space and recover from contact.",
      "Career jobs reward clean deliveries, engine tests, a timed downtown run and crew races. Arcade streets cover coastal, city, mountain, harbour, old-town, industrial, tunnel, airport and skyway settings. Garage upgrades, unlocked cars, driver identity and career reputation save on the same device."
    ],
    "story": [
      "You return to Veyra Bay with a worn Family Coupe and a garage facing closure. Your sibling’s championship crash still shadows the family name. Mechanic Mara guides your first rainy duel against Ivo beneath the highway.",
      "Six playable career jobs move from that first race to a careful customer-car delivery, an engine test, a downtown time challenge, a harbour race and the Precision crew’s mountain invitation. Photographs, parts and reputation mark the garage’s recovery as Lena and Sora begin to recognise your driving."
    ],
    "howToPlay": [
      "Choose Career for the six-job opening chapter or Arcade for the twelve street routes. Set your driver identity and review the job objective before starting.",
      "Watch the road ahead and use left/right movement to change lanes when traffic or rivals threaten your route.",
      "Build speed carefully and hold Nitro when a clear stretch makes a boost worthwhile.",
      "Contact costs speed and can push the car sideways. Correct your line and rebuild momentum; collisions do not automatically end an arcade race. Career delivery condition affects its objective and reward.",
      "Aim for checkpoints and finish lines while tracking the current lap and remaining competition.",
      "Use earned coins and available upgrades between attempts to plan your next race."
    ],
    "desktop": [
      "Use Left/Right or A/D to change lanes, Down or S to brake, and hold Space or Shift for Nitro.",
      "Hold Space or Shift for Nitro, P or Esc to pause, and M to mute."
    ],
    "mobile": [
      "Tap the left/right lane controls or swipe horizontally to change lanes.",
      "Hold the on-screen Nitro control to boost.",
      "Hold Brake to reduce speed and make space. Release it to accelerate again; separate music, engine and effects controls are available."
    ],
    "systems": [
      {
        "title": "Rivals and racing position",
        "body": "Competing cars change lanes and can overtake. The position indicator provides a reason to race strategically rather than simply travel as far as possible."
      },
      {
        "title": "Garage and upgrades",
        "body": "Available cars can differ in attributes such as speed, handling and nitro. Coins and upgrades support longer-term progression."
      },
      {
        "title": "Laps, checkpoints and boosts",
        "body": "Crossing checkpoints and completing laps are part of the campaign. Nitro is a short-term advantage best used when the path ahead is open."
      },
      {
        "title": "Recoverable contact and car audio",
        "body": "Independent rival movement, traffic spacing, sideways impact response and temporary speed loss make contact recoverable. Engine and gear sounds, instrumental music and effects have separate volume controls."
      }
    ],
    "progression": [
      "Complete the six career jobs in order, earning reputation and visible garage improvements. Each job has a specific objective, such as delivery condition, Nitro test time, beating the clock or reaching a race position.",
      "Arcade retains twelve street routes, vehicle choices, checkpoints, laps and garage upgrades. Recover from impacts by correcting your line and rebuilding speed. Rain affects grip and fog shortens the view."
    ],
    "tips": [
      "Look several car lengths ahead and make lane changes before reaching a blockage.",
      "Keep some Nitro for an open section instead of activating it while boxed in by traffic.",
      "Avoid switching lanes repeatedly when another racer is close beside you.",
      "Use the garage to match a car's strengths to the kind of race you find difficult.",
      "Focus on finishing cleanly before trying to squeeze out every overtaking bonus."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "The opening career chapter contains six jobs, from First Green to The Precision Invitation. Arcade offers twelve street routes. Career and arcade progression retain their own objectives."
      },
      {
        "q": "How do I use Nitro?",
        "a": "Hold Space or Shift on desktop, or press and hold the Nitro button on mobile."
      },
      {
        "q": "Can I choose different cars?",
        "a": "Yes. Visit the garage to choose among unlocked cars and review available upgrades. Each vehicle can offer a different driving feel."
      },
      {
        "q": "How do I improve my race position?",
        "a": "Anticipate traffic early, overtake rivals safely and use nitro on clear sections of the track while working toward each checkpoint and finish line."
      },
      {
        "q": "Does a collision immediately end the race?",
        "a": "No. A collision slows the car and can nudge it sideways. Recover your line and speed. In career deliveries, damage also affects condition and the job result."
      }
    ]
  },
  "kasi-quest": {
    "category": "Adventure",
    "summary": "Explore 20 longer township campaign levels with animated heroes and enemies, shooting drones, NPC missions, collectibles, upgrades, bosses and a daily challenge.",
    "overview": [
      "Kasi Quest is a 20-level township campaign with longer side-scrolling routes, animated characters and enemies, ground combat, shooting drones, bosses and NPC missions. Complete levels to unlock the next route, collect rewards for the upgrade shop and return for the separate daily challenge.",
      "Instead of treating each jump as an isolated obstacle, players are encouraged to think about the wider mission. Coins and collectibles support progression, a shop provides upgrade decisions, and boss encounters test how well you've mastered movement and timing."
    ],
    "story": [
      "The word 'kasi' grounds the adventure in a township-inspired setting. The player moves through quests that connect local environments, NPC conversations and challenges.",
      "Coins, collectible rewards and an upgrade shop provide reasons to explore beyond the shortest route. NPC encounters lead you toward fresh missions, while bosses and daily challenges test the movement and combat skills developed during the adventure."
    ],
    "howToPlay": [
      "Start a level and pay attention to the current mission or NPC instructions.",
      "Move through the platform area, time jumps and avoid enemy or environmental hazards.",
      "Collect coins and other rewards while following the mission route.",
      "Use the upgrade shop when available to strengthen your options for later stages.",
      "Approach boss fights patiently and learn their movement or attack patterns.",
      "Try daily challenges or replay a level to improve your combo and score."
    ],
    "desktop": [
      "Follow the on-screen movement, jump and interaction controls. Read each level's prompts before setting off so you know which actions are available."
    ],
    "mobile": [
      "Use the platformer's on-screen movement and action controls.",
      "Use the in-game help screen whenever you want a reminder of movement, jumping or interaction buttons."
    ],
    "systems": [
      {
        "title": "Quests and NPCs",
        "body": "Objectives from in-game characters give the adventure direction beyond simply reaching the far edge of a level."
      },
      {
        "title": "Collectibles and upgrades",
        "body": "Coins and an upgrade shop create reasons to explore instead of rushing through every route."
      },
      {
        "title": "Boss and daily challenges",
        "body": "Boss encounters test learned skills, while daily challenges provide a reason to return for new score attempts."
      },
      {
        "title": "Animated combat and responsive controls",
        "body": "Animated heroes, enemies and bosses respond to movement and attacks. Multi-touch movement and action controls adapt to portrait and landscape screens while keeping the township backgrounds."
      }
    ],
    "progression": [
      "Complete 20 campaign levels in order, with later routes locked until earned. Longer routes add more ground enemies, shooting drones and boss encounters, while saved coins, upgrades and level results support repeat play.",
      "Follow NPC instructions and level objectives as the adventure opens up. Collecting coins, exploring routes and preparing for boss encounters can make later challenges easier."
    ],
    "tips": [
      "Read what an NPC asks you to do before leaving the area.",
      "Learn how far your character can jump before tackling narrow platforms.",
      "Collect coins on safe routes so the shop becomes useful without risking a promising run.",
      "Observe boss attack patterns before moving in.",
      "For daily challenges, focus on completing the objective consistently before chasing complex combos."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "There are 20 campaign levels. Later routes unlock through completion; the daily challenge is available as a separate mode."
      },
      {
        "q": "Does Kasi Quest have missions?",
        "a": "Yes. Talk to the characters you meet and follow the mission instructions to progress through the township adventure."
      },
      {
        "q": "Can I upgrade equipment or abilities?",
        "a": "Yes. The upgrade shop lets you turn collected rewards into improvements for later challenges."
      },
      {
        "q": "Are the keyboard controls the same as other platformers?",
        "a": "Read the control prompts within Kasi Quest. Movement, jumping and interaction actions are introduced through the game's own interface."
      }
    ]
  },
  "lost-jungle-3d-temple-of-the-sun": {
    "category": "Adventure",
    "summary": "Follow Ari through 25 long 2D jungle levels and five story chapters to recover the Sun Seals, find a missing mentor and restore the Temple of the Sun.",
    "overview": [
      "Lost Jungle: Temple of the Sun is a side-scrolling jungle expedition presented with richly themed backgrounds and platform challenges. Players travel through 25 long stages, searching for Sun Relics, coins and keys while navigating gaps, water and lava hazards, traps and enemies.",
      "The exploration is more involved than a straight race to an exit. Locked gates and pressure-plate puzzles make collected items and observation important, while special powers such as dash, shield, torch and healing fruit offer different ways to approach difficult sections."
    ],
    "story": [
      "Ari, an apprentice cartographer, follows the trail of their missing mentor Mara. Relic hunter Voss has broken the Sun Lattice, and five chapters take Ari across the jungle to recover its Sun Seals and return daylight to the valley.",
      "Among the threats are snakes, frogs, spiders, bats, stone monkeys, boars, armored crawlers, sun wasps and stone sentries. Boss encounters include the Monkey King, Spider Queen and Sun Guardian, giving the adventure a clear sense of escalation as the player pushes toward the Sun Relics."
    ],
    "howToPlay": [
      "Move through the level while watching the ground, platforms and upcoming traps.",
      "Jump over gaps or onto safe ledges; use a dash attack when appropriate.",
      "Collect coins and Sun Relics, and look for keys needed by locked gates.",
      "Observe pressure-plate puzzles instead of walking blindly into suspicious temple areas.",
      "Use shield, torch or healing items when the stage makes them valuable.",
      "Check the expedition map if you lose track of the route, then prepare for the next boss."
    ],
    "desktop": [
      "Use A/Left Arrow to move left and D/Right Arrow to move right.",
      "Press Space/Up/W to jump, Shift or J for a dash attack, K/F to shoot, P/Escape to pause and M to open the expedition map."
    ],
    "mobile": [
      "Hold either direction while tapping Jump or Dash. Hold Shoot for repeated relic bolts while ammunition lasts.",
      "Refer to the on-screen Map button when available."
    ],
    "systems": [
      {
        "title": "Temple collectibles and gates",
        "body": "Sun Relics, keys and coins help define progress. Keys connect exploration to puzzle-gate access."
      },
      {
        "title": "Traps and movement",
        "body": "Spikes, lava, water pits, darts, boulders and gaps reward careful timing and route awareness."
      },
      {
        "title": "Enemies and guardian bosses",
        "body": "Ordinary enemies build combat pressure, while major guardians create set-piece challenges."
      }
    ],
    "progression": [
      "Explore 25 long jungle stages across five story chapters, with distinctive backgrounds, expedition maps and new challenges. Checkpoint beacons offer safe recovery as you collect the items needed to open gates and restore the five Sun Seals.",
      "The side-scrolling adventure is built around careful platforming, relic collection, puzzles and timed encounters. Each cleared section opens the way to another part of the expedition."
    ],
    "tips": [
      "Look for the landing area before jumping from a narrow platform.",
      "Collect a key before repeatedly testing a locked gate.",
      "Avoid using dash without checking what lies just beyond the enemy.",
      "Watch environmental clues around pressure plates and traps.",
      "Save recovery or protection items for sections you have not mastered."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "There are 25 long 2D levels across five story chapters, with checkpoint beacons, Sun Seals and progressively harder enemies, traps and Guardian encounters."
      },
      {
        "q": "What kind of adventure is Temple of the Sun?",
        "a": "Temple of the Sun is a side-scrolling jungle platform adventure featuring relics, keys, puzzles, traps and boss encounters."
      },
      {
        "q": "How do I open the map?",
        "a": "Press M on desktop or use the in-game map control if shown."
      },
      {
        "q": "Are there boss fights?",
        "a": "Yes. The bosses include the Monkey King, Spider Queen and Sun Guardian."
      }
    ]
  },
  "map-master-africa": {
    "category": "Educational",
    "summary": "Practise Grades 4–10 geography through 84 missions and 504 campaign tasks, with 56 alternate revision activities, world and province atlases, and printable learning summaries.",
    "overview": [
      "Seven playable learning paths provide topic practice for Grades 4–10. Grades 4, 6, 7, 8 and 9 each have 12 missions; Grade 5 has eight and Grade 10 has sixteen. Each mission has six tasks, a field note, explanations, hints and an earned badge. Grade 10 adds 16 missions across advanced skills, atmosphere, geomorphology, population and water resources.",
      "Grade 4 combines the original five Map Academy expeditions with settlements, provincial geography, food and farming, and water investigations. Grade 5 introduces African neighbours and directions, physical features, weather and climate evidence, vegetation, minerals and mining. Grade 6 adds world coordinates, word and line scales, trade, climate and vegetation comparisons, population and settlement investigations. Grade 7 adds a street-route planner, Earth structure, historical hazard cases, population graphs and conservation investigations. Grade 8 adds coordinates in degrees and minutes, ratio scale, world time, seasons, climate graphs, settlements and transport. Grade 9 adds contour interpretation, a metric distance tool, a historical USGS orthoimage, development indicators, erosion, food security and resource sustainability. Grade 10 adds exact seconds entry, compass bearings, GIS layer inspection, terrain profiles, age-sex diagrams, weather interpretation and water investigations. These are original practice activities, not a complete school course or an official assessment.",
      "The free atlases contain 242 mapped countries and territories, plus a separate geographic view of all nine South African provinces with capitals, map keys, search and close-ups. Natural Earth data keep outlines, map markers and selections aligned. Community scenarios use a fictional town; weather and other practice records are labelled, and the landform cross-section is schematic."
    ],
    "story": [
      "You join a young mapping team creating a useful community atlas. Restore its missing map key, guide a courier, record services and plan supply routes before connecting your atlas with the wider world.",
      "Each expedition begins with a field note. Apply the skill on the map, read feedback after each answer and collect a badge for your atlas journal."
    ],
    "howToPlay": [
      "Choose Grade 4, 5, 6, 7, 8, 9 or 10. The first mission in each grade is available immediately; later missions unlock through completion within that grade. Read each mission’s briefing and field note.",
      "Tap a town square, country outline, province outline or answer button when asked. Read evidence tables for investigation questions; their heading can collapse the table when you are ready to answer.",
      "For a route, tap neighbouring squares in order. Coordinate tasks use labelled latitude and longitude controls; a map tap previews a 30-degree intersection before Check point records your answer. The Grade 7 street planner accepts connected open routes within the stated distance limit. Add junctions, use Undo or Start again freely, then Check route. Grade 8 coordinates use degree, minute and hemisphere controls; numeric answers show their unit. Ratio-scale tasks supply paper measurements rather than screen centimetres. On the Grade 9 metric plan, select two endpoints and Check measurement; Reset edits the draft freely. The historical web image has no ground ruler. Grade 10 coordinate tasks include seconds. Compass, GIS and profile inspection are free; Check records the task answer. Dragging only pans the map.",
      "Use Map key freely. Hint provides guidance; Find opens a searchable country close-up and counts as a hint during a mission.",
      "Read the explanation, then choose Continue. Mistakes allow another attempt without losing the whole expedition.",
      "From the menu, choose focus-topic or mixed revision to revisit up to six tasks you have tried. Fifty-six alternate activities change selected values, evidence or map targets. Resume an unfinished set, and use Learning summary to review or print grade/topic progress. Revision records practice separately; replay campaign missions to improve Atlas XP and stars.",
      "Complete a mission to unlock the next within its grade. Open either free atlas at any time, and use the atlas selector to switch between world countries and South African provinces."
    ],
    "desktop": [
      "Click squares, country outlines and answer buttons. Drag to pan and use the zoom controls or mouse wheel.",
      "Tab to controls and activate them with Enter or Space. Within the town grid, arrow keys move between squares.",
      "On the world map, arrow keys pan; Enter selects the country at the centre. Find provides a searchable list."
    ],
    "mobile": [
      "Tap squares, outlines and answer buttons. Drag with one finger to pan; pinch or use + / − to zoom.",
      "The map and task share one viewport in portrait and landscape. Open the menu for your journal and sound settings.",
      "Rotation or interruptions pause the expedition. Resume explicitly when ready."
    ],
    "systems": [
      {
        "title": "Revision and learning summaries",
        "body": "Short focus sets prioritise recent mistakes, hints and supported answers; mixed sets revisit earlier tasks. Some use one of 56 authored alternatives. An independent revision answer clears its focus flag. Grade/topic summaries show tasks tried, best independent campaign answers and next practice, with a printable view. Revision resumes on the same browser and preserves the campaign cursor, XP, stars and unlocks."
      },
      {
        "title": "Grades 4–10 learning paths",
        "body": "Eighty-four missions contain 504 tasks. Each grade progresses independently, so learners can begin Grade 5, 6, 7, 8, 9 or 10 without clearing earlier grades."
      },
      {
        "title": "World atlas",
        "body": "Browse 242 mapped countries and territories across all continents, with region views and searchable close-ups. This is a cartographic feature count, not a count of sovereign states."
      },
      {
        "title": "South African provincial atlas",
        "body": "Explore all nine provinces with capitals, coastal or inland descriptions and geographic notes. Map key explains provincial abbreviations. Switch between mainland and Prince Edward Islands views; Lesotho remains a separate country."
      },
      {
        "title": "Evidence investigations",
        "body": "Compare labelled practice records for farming, water, weather, mining, trade and settlement. World layers compare January/July temperatures, annual rainfall and vegetation at seven fictional study points with matching text tables. Distance bars stay attached to the practice maps when zooming. Grade 7 adds line, bar and pie graphs with matching tables and source links for historical cases. Clearly labelled invented water data are separate from national statistics. Grade 8 adds degrees-and-minutes controls, numeric ratio-scale investigations, UTC and SAST calculations, a seasonal comparison model, twelve-month climate graphs, urbanisation and transport planning."
      },
      {
        "title": "Learning feedback",
        "body": "Answers receive explanations and learner-controlled continuation. Wrong answers remain recoverable; map-key reference is free, while hints provide supported practice."
      },
      {
        "title": "Saved mastery",
        "body": "Your browser records completed tasks, best results, stars and unlocked expeditions. Replaying improves results without awarding duplicate XP for the same task."
      }
    ],
    "progression": [
      "Complete missions in order within your chosen grade. Grades 4–10 have separate unlock paths, while free exploration remains open from the beginning. Original Map Academy progress, stars, hints, current task and previous best scores are retained.",
      "Independent answers earn 100 Atlas XP, hinted answers 70 and answers after mistakes 50. Only the best score per task contributes to your total. Stars reward clean runs; completed badges and better results are retained."
    ],
    "tips": [
      "Read the field note before beginning a new skill.",
      "Use the north arrow and map key rather than guessing from pictures.",
      "Read a grid column letter first, then its row number.",
      "For practice-town routes, count moves between square centres rather than counting visited squares.",
      "Zoom into small countries and islands. The world overview is not a surface for measuring ground distances.",
      "Read feedback and revisit tasks that needed help to improve your independent results."
    ],
    "learning": [
      "Practise the Grade 4 topic areas of settlements, map skills, food and farming, and water in South Africa.",
      "Practise Grade 5 Africa map skills, South African physical features, weather, climate, vegetation, minerals and mining.",
      "Practise Grade 10 exact coordinates, bearings, GIS, atmosphere, geomorphology, population structure/movement and water systems.",
      "Practise Grade 9 map and image interpretation, development comparisons, weathering, erosion, food systems and resource choices.",
      "Practise Grade 8 coordinates in degrees and minutes, ratio scale, world time, seasons, climate, settlements and transport.",
      "Practise Grade 6 latitude and longitude, word and line scales, imports and exports, climate profiles, population patterns and settlement factors.",
      "Practise Grade 7 local mapwork, route distances, Earth structure, earthquakes and floods, population change, resources and conservation.",
      "Interpret original evidence tables and a schematic cross-section, compare units and distinguish what evidence can support.",
      "Use provincial outlines, capitals, country boundaries, compass directions, symbols, grids and routes. All seven grade paths include original topic practice."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "There are 84 missions and 504 campaign tasks across Grades 4–10, plus 56 alternate revision activities. Grades 4, 6, 7, 8 and 9 have 12 missions each, Grade 5 has eight and Grade 10 has sixteen."
      },
      {
        "q": "How does revision affect my campaign progress?",
        "a": "Revision uses a separate local practice record. It can clear tasks from your focus list, while campaign XP, stars, unlocks and your saved campaign position remain intact. Replay a campaign mission to improve its best result. Existing saves seed focus from supported results and pending mistakes; detailed recent history begins with the learning tools."
      },
      {
        "q": "Which grades and missions can I play?",
        "a": "Grades 4, 6, 7, 8 and 9 each have 12 missions; Grade 5 has eight and Grade 10 has sixteen: 84 missions and 504 tasks in total. You can begin any of these grades. Each path unlocks its later missions through completion, and both atlases are available freely."
      },
      {
        "q": "Does a wrong answer end the game?",
        "a": "No. Read the clue and choose Try again. Your completed progress remains saved."
      },
      {
        "q": "What does Find do?",
        "a": "Find searches the current atlas: countries and territories in the world view, or all nine provinces in the South African view. It opens a close-up. During a mission it uses a hint, and location tasks can also be answered using its accessible list."
      },
      {
        "q": "Which curriculum and grades does Map Master cover?",
        "a": "The learning journey follows South African CAPS geography topics for Grades 4–10. All seven grade paths offer playable topic practice. The menu lists topics and availability for every grade. The activities support practice and are not a complete school course or an official assessment."
      },
      {
        "q": "Is my old score preserved?",
        "a": "The previous Explorer Missions best score is retained on the same browser. New learning progress uses its own saved record."
      },
      {
        "q": "Will my earlier Map Academy progress remain?",
        "a": "Yes. All earlier Grade 4–9 missions keep their results, stars, current position and hint history on the same browser. New missions begin without invented completion. Music settings and the previous Explorer Missions best score are retained."
      }
    ]
  },
  "math-sprint-arena": {
    "category": "Educational",
    "summary": "Explore Grades 4–10 through seven independent maths paths: 140 untimed missions, 1 400 Adventure and practice activities, visual tools, saved checkpoints and focused revision, plus a 52-level Sprint.",
    "overview": [
      "Math Sprint Arena turns selected Grade 4–10 CAPS mathematics skills into seven journeys with Pi-Bot. Restore Number City, explore Discovery District, launch Innovation Harbour, open Research Ridge, connect Skyline Lab launch Horizon Station and open Infinity Summit. Each grade can be started immediately and progresses independently.",
      "Each grade contains twenty missions, 100 Adventure activities and 100 alternate practice activities. Review with Pi-Bot revisits practised questions within the selected grade, prioritising completed activities that used hints or retries. The separate 52-level Sprint retains its timed arithmetic, fraction, multiplication, geometry and algebra challenges."
    ],
    "story": [
      "Number City has lost power, and Pi-Bot needs a resourceful partner to restore it. Rebuild the Number Gates, reconnect the workshop and station, and bring the market and fraction bridges back to life.",
      "The next district is preparing a city exhibition. Design shape signs, reflect illuminated patterns, measure strips and floors, label deliveries, read water levels and organise tram journeys. Finally, collect a shape survey and interpret travel data to prepare the City Showcase.",
      "In Grade 5, Discovery District is preparing a festival. Connect six-digit signal towers, estimate delivery routes, power the solar factory and plan the market. Fraction bridges, geometric designs, cargo cubes and transport surveys bring the final Discovery Festival to life.",
      "Innovation Harbour brings a new Grade 6 challenge. Balance large energy accounts, pack cargo, connect prime-number locks and calibrate decimal instruments. Transform designs, fold nets, measure gardens and storage boxes, plan overnight deliveries and interpret research evidence before the harbour launch.",
      "Grade 7 climbs to Research Ridge. Decode signed signals, calculate powers and roots, compare budgets, describe growing arrays, substitute into expressions and balance equations. Journey graphs, angle beacons, scale drawings, triangle terraces and research data help open the final observatory.",
      "In Grade 8, Pi-Bot connects Skyline Lab. Restart integer reactors, synchronise factor switches and decode algebraic signals. Guide coordinate couriers, align parallel beams, calculate Pythagorean spans and plan circle decks and prism cargo pods. A research-and-chance investigation completes the network.",
      "In Grade 9, Pi-Bot launches Horizon Station. Decode negative-exponent signals, plan compound-growth budgets, factorise airlock codes and repair algebraic fractions. Calibrate gradients, compare similar supports, build cylindrical tanks and investigate compound probability with trees and tables.",
      "Grade 10 opens Infinity Summit. Factorise cubic locks, connect simultaneous signals and set inequality boundaries. Coordinate surveys, parabolic reflectors, reciprocal crossings and exponential launches lead to trigonometric sighting tasks. Plan festival savings and solid cargo, then interpret quartiles, grouped data and Venn surveys before Pi-Bot opens the summit festival."
    ],
    "howToPlay": [
      "Choose Grade 4, 5, 6, 7, 8, 9 or 10, then start Adventure for that grade’s ordered twenty-mission route, Learn & Practise for any topic, or Review with Pi-Bot for saved revision. Play Sprint opens the separate timed challenge.",
      "Read each activity and its model. Use place-value columns, illustrated choices, mirror squares, floor tiles, tally counters, a labelled transformation grid, Cartesian point selector or the built-in number pad. Integer tasks include a − key to change the sign. Use / between a fraction’s numerator and denominator; an improper fraction is accepted for a mixed-number calculation.",
      "Tap a diagram to enlarge it when you need a closer look at a scale, graph or clock. Close the diagram to enter your answer.",
      "Select Check answer, read the feedback and request a hint when needed. Mistakes are recoverable and the explanations stay until you continue.",
      "Complete all five activities to finish an Adventure mission and unlock the next one. After a set, Try a fresh practice set switches to the alternate bank without changing Adventure results."
    ],
    "desktop": [
      "Use the pointer to operate visual tools and the keypad. For numerical entry tasks, type digits, a decimal point or comma, / for fraction calculations, − to change an integer’s sign, and Backspace to correct an entry.",
      "In Sprint, choose an answer tile or press 1–4. Arrow keys or A/D change lanes; Space pauses or resumes."
    ],
    "mobile": [
      "Tap the large on-screen tools and keypad. Cartesian point selections, transformation cells, reflection squares and tally counts retain their saved state when you refresh.",
      "Portrait and landscape layouts keep questions and response controls together. Tap a mathematical diagram to enlarge it; Menu & sound contains the current mission strategy, volumes and supported-browser fullscreen control."
    ],
    "systems": [
      {
        "title": "Seven independent learning paths",
        "body": "Grades 4–10 each contain twenty untimed missions with 100 Adventure activities and 100 alternate practice activities. Unlocks and Adventure, Learn and Review checkpoints are separate for every grade."
      },
      {
        "title": "Hands-on mathematical tools",
        "body": "Build place values, compare and calculate fractions, classify and measure angles, inspect solid objects and nets, transform grid markers, count square or cubic units and interpret charts. Grade 6 adds hundred-square models, mixed-fraction strips, labelled protractors, overnight timelines, pie charts and fair-spinner evidence. Grade 7 adds signed number lines, function diagrams, equation balances, distance–time graphs, reflex-angle arcs, circle parts, scale grids, triangular area and surface-area models. Grade 8 adds a saved Cartesian point selector, parallel-line angle evidence, triangle and Pythagoras models, exact-root choices, circle and composite-area plans, triangular prisms and stem-and-leaf data. Grade 9 adds border-cell patterns, binomial area models, coordinate-labelled line graphs, similar triangles, regular polygons, area-scale squares, closed cylinders, scatter plots, coin trees, two-way outcome tables and replacement-token models. Grade 10 adds interval number lines, simultaneous-equation cards, midpoint grids, correctly separated function branches, trigonometric waves, right-triangle surveys, cones, spheres, pyramids, combined solids, box plots, histograms and Venn evidence."
      },
      {
        "title": "Focused revision",
        "body": "Five-question Review sessions stay within the selected grade, prioritise previously completed activities that used support, then mix practised topics. Review has its own saved checkpoint and does not change Adventure results or Sprint scores."
      },
      {
        "title": "Progressive support and fresh practice",
        "body": "Each activity has three stages of help and a persistent worked explanation. Alternate practice sets change the questions while retaining the same topic and learning controls."
      },
      {
        "title": "Music for every mission",
        "body": "The 140 learning missions and 52 Sprint levels have distinct original musical arrangements, with a separate Review theme for each grade. Music and effects have separate controls."
      }
    ],
    "progression": [
      "Complete five activities to finish an Adventure mission and unlock the next mission within that grade. Grades 5–10 can begin before earlier grades are complete. Existing results, drafts and checkpoints remain intact. Independent and supported answers stay separate, and weaker replays do not erase better results.",
      "Adventure, Learn and Review checkpoints save separately for each grade on the same browser when storage is available. Switching grades preserves unfinished drafts and hints. Learn and Review do not unlock Adventure or submit learning results to the Sprint leaderboard."
    ],
    "tips": [
      "Identify what a question asks, then inspect the relevant labels, units and scale.",
      "For a ruler that starts above zero, subtract the start reading from the end reading.",
      "For reflections, match the row and distance from the dotted mirror line.",
      "Count area using equal squares, mass using grams or kilograms, and time using 60 minutes per hour.",
      "Use a fresh set to practise a method with different values. Review can help revisit activities previously completed with support.",
      "Read a pictograph key before counting learners. A star may represent two or five people. For common fractions with matching denominators, keep the part size and add or subtract numerators.",
      "For a mixed-number calculation, rename the number as an improper fraction, then use equal-sized parts.",
      "On the transformation grid, columns A–C go left to right and rows 1–3 go bottom to top. A clockwise quarter-turn uses B2 as its centre.",
      "Recorded spinner trials describe past results; they do not guarantee the next outcome."
    ],
    "learning": [
      "Grade 10 practises selected CAPS Mathematics skills using the DBE teaching plan retained for 2026: real numbers and accuracy, rational exponents, cubic products and factorisation, algebraic fractions, quadratic and simultaneous equations, inequalities and intervals, linear sequences, coordinate geometry, straight-line, quadratic, reciprocal, exponential and trigonometric functions, special angles, right-triangle applications, simple and compound growth, midpoint geometry, solids, quartiles, grouped data and Venn probability.",
      "Grade 9 practises selected CAPS skills informed by the DBE 2026 plan: real numbers, integer exponents, scientific notation, proportion, compound growth, patterns, binomial products, factorisation, algebraic fractions and restrictions, linear and zero-product equations, gradients and intercepts, similarity, polygons, Pythagoras, coordinate transformations, cylinder measurement, outliers, sampling and compound probability.",
      "Grade 8 practises selected CAPS skills informed by the DBE 2026 plan: signed multiplication and division, three-digit HCF and LCM, ratio changes, exponent laws and scientific notation, rational powers and roots, decimal calculations, finance, patterns, functions, like terms, distributive expressions, equations, Cartesian points and transformations, graph features, angle relationships, Pythagoras, circles, composite area, triangular prisms, data summaries and probability.",
      "Grade 7 introduces selected Senior Phase skills: integer addition and subtraction, exponents and roots, HCF and LCM, fraction operations, three-place decimals, percentages and simple interest, ratio and rate, geometric patterns, functions, variables and substitution, equations by inspection, global graphs, lines and angles, circle parts, enlargement, triangle area, surface area, volume, data summaries and fair samples.",
      "Practise selected Grade 4 CAPS skills: place value, calculations, patterns, money, common fractions, 2-D shape properties, line symmetry, length, area by counting squares, mass, liquid measures, time intervals, tallies and graph interpretation.",
      "Grade 5 adds six-digit place values, rounding, five-digit calculations, three-digit by two-digit multiplication and division, factors and multiples, number and dot patterns, equivalent fractions, fraction calculations and quantities, money and rates, angles, 3-D objects, symmetry, unit conversions, area, cubic units, time and scaled pictographs.",
      "Grade 6 adds nine-digit place value, larger whole-number calculations, prime factors, ratio and rate, unlike-denominator and mixed fractions, decimal place value and calculations, percentages, rules, protractor readings, transformations, nets, rectangular area and volume, unit conversions, overnight time, pie charts, frequency tables, mode and chance investigations.",
      "All seven paths practise selected CAPS skills. They are learning resources rather than complete grade courses or formal assessments. The selected grade and activity topic are visible during play."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "Grades 4–10 each have 20 missions, 100 Adventure activities and 100 alternate practice activities: 140 missions and 1 400 activities in total. The separate Sprint has 52 levels. These paths practise selected CAPS skills rather than complete school courses."
      },
      {
        "q": "Which grades and topics are included?",
        "a": "Grades 4–10 each have twenty missions and 200 Adventure and practice activities, covering selected CAPS number, pattern, geometry, measurement and data skills. Grades 6, 8 and 9 include chance investigations. These are practice resources rather than complete grade courses or formal assessments. Sprint is a separate mixed-topic timed game."
      },
      {
        "q": "Do I need to finish earlier grades before starting Grade 10?",
        "a": "No. Select Grade 4, 5, 6, 7, 8, 9 or 10 from Learning grade on the home screen. Each begins with its first Adventure mission available and unlocks later missions through its own progress. Switching grades preserves separate checkpoints."
      },
      {
        "q": "How do I enter a mixed-number answer?",
        "a": "Use an equivalent improper fraction, such as 7/4 for 1 3/4. The keypad includes / for fraction calculations, and equivalent fractions are accepted."
      },
      {
        "q": "What does Review with Pi-Bot do?",
        "a": "Review creates a saved five-activity revision session from practised topics within the selected grade, prioritising completed questions that used hints or retries. A new player starts with that grade’s first topic. Review does not change Adventure results or submit Sprint scores."
      },
      {
        "q": "How can I get different practice questions?",
        "a": "After completing a set, choose Try a fresh practice set. Every mission has a guided bank and an alternate bank of five activities. Practice keeps its own checkpoint and does not unlock Adventure."
      },
      {
        "q": "Will my original ten-mission progress remain?",
        "a": "Yes. Existing results, hints, drafts, checkpoints, settings and the earlier Sprint best-score record are retained. Players who completed the original ten missions can continue with Shape Workshop."
      },
      {
        "q": "Can I enlarge a graph or measuring diagram on my phone?",
        "a": "Yes. Tap the diagram or focus it with a keyboard and press Enter or Space. The enlarged view retains the same data and labels. Close it to answer the activity."
      },
      {
        "q": "Do mistakes end my learning session?",
        "a": "No. Adventure, Learn and Review are untimed and allow retries. Answers completed after a hint or mistake are recorded as supported. Sprint is the optional mode with a timer and lives."
      },
      {
        "q": "Will progress survive a refresh?",
        "a": "Yes, when browser storage is available. Each grade and learning mode retains its own checkpoint on the same browser and device. If storage is blocked, the game remains playable and shows that saving is unavailable."
      },
      {
        "q": "How do I answer algebra, interval or exact-root questions?",
        "a": "Choose one of the displayed options for symbolic expressions, intervals and exact roots. Use the number pad for numerical answers, including signed integers or fractions when their keys are provided. Coordinate questions use the labelled point selector."
      }
    ]
  },
  "neon-hover-runner": {
    "category": "Racing",
    "summary": "Carry the core through five neon zones. Switch lanes, jump barriers, collect energy and data shards, use boosts and shields, and complete each zone objective.",
    "overview": [
      "Neon Hover Runner takes you through five zones: Skyline Warmup, Metro Surge, Data Tunnel, Reactor Bridge and Apex Night Run. Each has a distance goal and an objective involving energy, boosts, combos, survival or data shards. Finish the final zone to restore the core.",
      "The gameplay combines steering, jumping and occasional bursts of extra speed. Energy orbs, shields and magnets encourage you to make choices about which lanes are worth entering instead of simply steering away from everything you see."
    ],
    "story": [
      "A hover pilot speeds along a futuristic track of glowing lanes, barriers and mines. Helpful energy pickups are scattered among the obstacles, turning every movement into a choice between a safer route and a potentially rewarding detour.",
      "The setting changes the feeling of the challenge: glowing lanes, barriers and mines turn the track into a constantly moving navigation puzzle."
    ],
    "howToPlay": [
      "Begin a run and observe the next obstacles and pickup locations.",
      "Swipe or drag to steer your hover vehicle from side to side.",
      "Tap to jump an obstacle when moving around it is not the safest option.",
      "Collect energy orbs and other useful pickups when the path is clear.",
      "Use a charged boost when it will help, while staying alert to what follows the acceleration.",
      "Continue for as long as the game allows and use the resulting score as a target for another run."
    ],
    "desktop": [
      "Drag the pointer horizontally to steer. Tap or click for the jump action, and follow the game's boost prompts when enough energy has been collected."
    ],
    "mobile": [
      "Swipe or drag horizontally to steer and tap to jump.",
      "Swipe up to activate a boost when the charge is available."
    ],
    "systems": [
      {
        "title": "Movement and jump timing",
        "body": "A runner may present an obstacle that can be avoided by steering or by jumping. Spotting it early gives you options."
      },
      {
        "title": "Energy and power-ups",
        "body": "Energy orbs, shields, magnets and boosts are gameplay pickups with different tactical roles."
      },
      {
        "title": "Survival scoring",
        "body": "The game is described as score-attack gameplay: the quality and length of a run drive the challenge."
      }
    ],
    "progression": [
      "Advance through five zones by reaching each distance checkpoint. Pursue energy, boost, combo, survival and data-shard objectives for rewards, then complete Apex Night Run to restore the core.",
      "Boosts can help you cover distance quickly, but choosing the right moment matters. Watch the charge indicator and the hazards ahead before accelerating."
    ],
    "tips": [
      "Look ahead to the next two obstacles so one dodge does not place you in front of another.",
      "Save jump input for obstacles that genuinely need an elevated move.",
      "Collect a useful power-up only when the route to it remains safe.",
      "Boost on a comparatively open track rather than just before a dense hazard section.",
      "Practise smooth steering; frantic cross-track swipes make later corrections harder."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "There are five zones, ending with Apex Night Run. Complete the distance route and pursue each zone’s objective as you carry the core to the uplink."
      },
      {
        "q": "How do I jump?",
        "a": "Tap during play, according to the controls provided with the game."
      },
      {
        "q": "How do I trigger boost?",
        "a": "Swipe upward when a boost is charged."
      },
      {
        "q": "Are there different power-ups?",
        "a": "Yes. Energy orbs, shields, magnets and speed boosts add different tactical opportunities."
      }
    ]
  },
  "neon-orb-defender": {
    "category": "Defense",
    "summary": "Defend Fort Nova across 25 missions, with 15 robot and drone types, a boss in every mission, animated supplies, reserve lives and original level music.",
    "overview": [
      "Neon Orb: Base Defence follows the defence of Fort Nova through 25 missions. Fifteen enemy types mix ground robots and aerial drones, and every mission ends with a boss drawn from five boss families. Animated pickups and reserve lives support recovery as formations become more demanding.",
      "Unlike a pure survival shooter, the game has an explicit protective objective. Positioning and responding to threats matter because enemies do not have to defeat the player personally to create pressure; they can threaten the orb or disrupt the defence mission."
    ],
    "story": [
      "Fort Nova’s Neon Orb powers the last working base. Mixed robot and drone formations press from different directions, and each of the 25 missions ends with a boss. Protect the core, recover supplies and learn to prioritise threats before later waves arrive.",
      "Twenty-five missions of enemy attacks test more than shooting accuracy. The defender must choose which threat to stop first while keeping the Neon Orb safe. The campaign builds toward a boss encounter that puts every learned skill under pressure."
    ],
    "howToPlay": [
      "Enter a mission and identify the position of the Neon Orb and the nearest incoming threat.",
      "Use the movement and attack controls provided by the on-screen interface to face approaching robots or drones.",
      "Watch for friendly AI units that can be rescued or protected as part of the situation.",
      "Collect power-ups when you can reach them safely without abandoning the base.",
      "Advance through stages and prepare for stronger enemies and the boss encounter."
    ],
    "desktop": [
      "Use the movement and firing controls shown when the mission begins. Keep the Neon Orb in view while aiming at approaching threats."
    ],
    "mobile": [
      "Use the on-screen controls to move, attack and activate any support actions offered during the mission.",
      "Check the on-screen layout at the start of a level because the touch arrangement can differ from platform games."
    ],
    "systems": [
      {
        "title": "Orb defence",
        "body": "Protecting the central objective changes the priorities of combat: stop threats headed for the orb instead of chasing every target."
      },
      {
        "title": "Friendly AI rescue",
        "body": "Supporting friendly units creates a second responsibility alongside eliminating hostile machines."
      },
      {
        "title": "Waves and bosses",
        "body": "Twenty-five missions have three waves each, 25 boss encounters, saved unlocks and replay stars."
      },
      {
        "title": "Supplies, reserve lives and aim assistance",
        "body": "Animated life and power-up sprites make recovery opportunities visible. Reserve lives, responsive touch movement and optional auto-fire help players manage dense waves without hiding the campaign’s increasing difficulty."
      }
    ],
    "progression": [
      "Complete 25 progressively unlocked defence missions, each with a boss, its own scene and its own musical arrangement. Fifteen enemy types and five boss families vary formation, attack timing and priority.",
      "Sound effects, background music and WebGameArena scoring are supported, but exact score awards or enemy weaknesses should be learned in play."
    ],
    "tips": [
      "Watch the orb's immediate surroundings before pursuing enemies at the edge of the screen.",
      "Prioritise threats that are already approaching the main objective.",
      "Learn how each kind of drone or robot moves before committing to a risky position.",
      "Pick up assistance when it does not expose the base to an avoidable attack.",
      "Prepare for a boss by keeping track of the safest movement space."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "There are 25 missions and 25 boss encounters, one per mission, with 15 enemy types and five boss families. Each mission has its own background and musical arrangement."
      },
      {
        "q": "What is the main objective?",
        "a": "Protect the Neon Orb while dealing with rogue AI robots and drones."
      },
      {
        "q": "Are there story levels?",
        "a": "Yes. Neon Orb: Base Defence offers nine stages, a connected story and a boss encounter."
      },
      {
        "q": "Can I play on a phone?",
        "a": "The game includes mobile controls, though their exact layout should be checked in the running game."
      }
    ]
  },
  "physics-force-lab": {
    "category": "Educational",
    "summary": "Join Newtonia and Pip to restore Nova through 30 untimed missions and 90 investigations covering selected Grades 4–10 physics topics, with saved discoveries, 55 revision checks and 12 animated action labs.",
    "overview": [
      "Pull on your field jacket, settle your goggles and step into Nova, a city whose machines have fallen silent. Physics Force Lab: Rise of the Young Physicist is a colourful 2D adventure starring a young scientist, Professor Newtonia and Pip, a bright-eyed floating lab companion. Every machine you restore begins with an idea you can investigate.",
      "Explore 30 Adventure missions and complete 90 repair investigations. Make a prediction, adjust the equipment, compare measurements and explain what happened. The route introduces selected South African CAPS Grades 4–10 physics topics through movement, sound, heat, circuits, light, forces, energy, waves and motion graphs. Investigations are untimed, with hints and feedback that help you keep learning.",
      "Your field notebook saves discoveries for later, while the Revision Workshop turns completed repairs into 55 distinct concept checks. For a faster challenge, enter the separate 12 original action labs, where animated robots, drones and GlitchBot guard routes filled with platforms, physics tools and experiment terminals. These modes provide supplementary practice, not the complete Natural Sciences or Physical Sciences curriculum."
    ],
    "story": [
      "Your first morning at Nova Physics Institute begins with a blackout. A supply lift has stalled with Professor Newtonia trapped behind it, the Quantum Core has fallen silent, and Pip has found a damaged log that could explain the failure. Your small workshop becomes the recovery team’s base. A trolley delivery and a working circuit are the first steps towards bringing the city back to life.",
      "With Newtonia’s guidance and Pip beside you, follow the repair routes through Nova. Restore carts, radios, springs and beacons, then investigate the cooling watchtowers, circuit causeway, mirror stations and mechanical drive. The young physicist’s goggles, field jacket and orange tool bracer belong to a hands-on explorer: progress comes from testing equipment and explaining the evidence.",
      "As the districts recover, photographs fill your workshop and observations build a field notebook of the journey. The final Grade 10 chapter brings motion records, energy, waves, charge and circuit measurements together for the Quantum Core restart. Restore the Core and earn your place as a Junior Physics Guardian.",
      "The investigation continues in the Revision Workshop, where your repair discoveries become short, untimed practice sessions. In the separate original action campaign, use your physics tools to cross hazardous laboratory routes, face rogue robots and drones, and confront GlitchBot at the Core."
    ],
    "howToPlay": [
      "Choose Begin adventure or continue your saved checkpoint, then read the district briefing.",
      "Move along the route, jump over maintenance drones and collect optional data cells. Interact with each repair station when its prompt appears.",
      "Choose a prediction and adjust the equipment. From the recovery chapter onward, test two different settings before explaining a successful result.",
      "Read the diagram, measurements, trial history and feedback. Use the two-stage hints whenever you need help.",
      "Apply all three repairs, reach the district relay and complete the mission to unlock the next one.",
      "Open the field notebook from Pause or Settings to revisit recorded explanations and observations. Choose Revision from the opening menu, Pause or notebook to practise completed discoveries. Choose the 12 original labs from the opening menu for the separate action campaign."
    ],
    "desktop": [
      "Adventure: use A/D or Left/Right to move, Space, W or Up to jump, and E to interact. Use the mouse or keyboard for equipment, answers and supply-route ordering. P pauses.",
      "Original labs: use A/D or arrows to move, W/Up/Space to jump, F for the current physics tool and E for force blast. Use Pause, Sound and Restart on the HUD.",
      "Use the fullscreen control beside the play buttons, in Adventure Settings or in the original start/pause menu where supported. Alt+Enter also toggles fullscreen outside input fields. The game opens in its own browser tab."
    ],
    "mobile": [
      "Use the dedicated movement, jump and interaction controls beneath the Adventure play area. Tap equipment choices, move sliders and use Earlier/Later buttons to order the electricity supply stages.",
      "The original labs have their own movement, jump, Tool and Blast buttons below the play area. Both modes provide a fullscreen control where supported. Questions and menus scroll on small screens. Portrait and landscape layouts keep controls reachable and preserve world positions during rotation; browsers without fullscreen retain the tab-filling view."
    ],
    "systems": [
      {
        "title": "An illustrated cast of explorers and machines",
        "body": "Travel with the young physicist, Professor Newtonia and Pip. Expressive movement, tool actions and repair celebrations bring the Adventure to life, while distinct robots, drones, magnetic bots and GlitchBot animate the original action labs."
      },
      {
        "title": "Thirty missions, six chapters",
        "body": "Restore the academy and recovery districts, investigate Grade 7 heat and energy, Grade 8 electricity and light, Grade 9 forces and power, and complete the Grade 10 Core restart."
      },
      {
        "title": "Evidence-led repair investigations",
        "body": "Predictions, controlled comparisons, diagrams, temperature and motion tables, progressive hints and explanations connect each successful repair to a physics idea."
      },
      {
        "title": "A saved field notebook",
        "body": "Adventure checkpoints, tested equipment settings, hints, completed missions and notebook findings save on this device. Findings remain available when a mission is retried."
      },
      {
        "title": "Twelve original action labs",
        "body": "Animated scientists, robots, drones and GlitchBot accompany moving platforms, hazards, collectible power-ups, physics tools, experiment terminals and level music. This mode uses health and a separate best-score record."
      },
      {
        "title": "The Revision Workshop",
        "body": "Completed repairs unlock 55 distinct concept checks across the full Adventure. Review up to six ideas in an untimed session, choose a grade or mix your discoveries, read scientific feedback and revisit your own experiment notes. Missed ideas receive another turn, and practice saves separately from campaign progress."
      }
    ],
    "progression": [
      "Complete missions in sequence to unlock the next district. Each mission has three required repairs and twelve optional data cells; any completed mission can be replayed. The notebook keeps your discoveries through retries.",
      "The first ten missions introduce selected Grades 4–6 topics and clearly marked enrichment. Grades 7, 8, 9 and 10 each add five missions. The Grade 10 route introduces signed motion and graphs, energy calculations, superposition, wave relationships, charge conservation and circuit measurements.",
      "Adventure saves use this browser’s local storage. Revision saves its selected questions, answer order, feedback and session position separately, and never unlocks missions or adds campaign score. The original labs retain a separate best score; their current action run is not a saved Adventure checkpoint. Clearing browser data removes locally saved records."
    ],
    "learning": [
      "Practise making predictions, changing one factor, comparing observations and explaining evidence.",
      "Keep related quantities distinct: mass and weight, heat and temperature, distance and displacement, current and charge, power and energy.",
      "Connect Grade 10 graphs and equations to the model readings, including position/velocity slopes, mechanical energy, wavelength and frequency, and energy transferred per charge.",
      "Use short revision sessions to recall ideas from completed repairs, compare the explanation with your saved observations and return to concepts that need another look."
    ],
    "faqs": [
      {
        "q": "How many missions and levels are included?",
        "a": "The main adventure contains 30 missions and 90 repair investigations. The separate original action campaign contains 12 labs. Each adventure mission also has 12 optional data cells."
      },
      {
        "q": "Which school grades does the game support?",
        "a": "The adventure covers selected physics topics associated with South African CAPS Grades 4–10. It is a practice resource, not the complete Natural Sciences or Physical Sciences syllabus or a formal assessment. The original action labs are a separate mixed-topic challenge."
      },
      {
        "q": "Does refreshing erase my investigation?",
        "a": "Adventure checkpoints, equipment choices, trial history, hints and notebook findings save on the current device when browser storage is available. Revision also saves the current question, answer order, feedback and session position. The original labs save a best score, rather than the current action run."
      },
      {
        "q": "Can I play without sound or a timer?",
        "a": "Adventure investigations are untimed and provide diagrams, written observations and feedback with sound off. Music and effects have separate volume controls, and reduced decorative motion is available. The original labs include a Sound toggle and reduced-motion setting."
      },
      {
        "q": "Can I play on a phone?",
        "a": "Yes. Both modes have touch controls and responsive portrait/landscape layouts. Menus and experiment questions scroll, and rotation preserves the world’s geometry. Fullscreen is available beside the play controls and in the menus where the browser supports it."
      },
      {
        "q": "Are the readings real laboratory measurements?",
        "a": "No. The repeatable teaching models illustrate relationships under stated assumptions. Read each experiment’s explanation and model notes before applying the idea to a real physical situation."
      },
      {
        "q": "How does the Revision Workshop work?",
        "a": "Complete Adventure repairs to unlock their ideas for revision. The 90 repairs provide 55 distinct concept checks. Choose a grade or mix your discoveries in sessions of up to six questions, with explanations and experiment notes. Practice progress saves separately and does not change mission unlocks or game scores."
      }
    ],
    "tips": [
      "Keep the comparison fair by changing only the factor identified in the investigation.",
      "Read units and reference directions before using a number.",
      "Compare recorded trials rather than judging a result only by its animation.",
      "A failed target is evidence: adjust the equipment, test again and use the next hint.",
      "After a repair, open Revision and recall the idea before checking the feedback. Use your experiment notes whenever a comparison would help.",
      "In the original labs, combine movement and jumping, collect the required rewards and solve terminals before entering the exit portal."
    ]
  },
  "recycle-rush": {
    "category": "Educational",
    "sponsor": "Fibre Circle",
    "summary": "Restore Verdale with Circuit through 25 untimed story missions and 450 recovery tasks, plus 20 arcade missions with animated bosses, material cards and power-ups.",
    "overview": [
      "Bring colour back to Verdale in Recycle Rush: Restore Verdale, a recycling adventure sponsored by Fibre Circle. Join Circuit and Professor Loop as they help a community rebuild its collection points, share useful goods and connect everyday recovery choices to a cleaner town.",
      "Explore 25 story missions across the school, neighbourhood, market, recovery district, repair quarter and civic square. Inspect each object, prepare accepted packaging, share usable books and clothes, and refer electrical repairs to qualified experts. Solve community requests, complete saved community work orders and plan collection rounds, choosing pickups and accepted deliveries while managing the vehicle’s available load space.",
      "Choose community projects, build clean sorting streaks and use recovered energy to face Grime in five showdowns. Animated characters and original mission music accompany untimed story play, with clues, feedback and checkpoints saved on your device. For a faster challenge, enter the separate 20-mission Arcade Campaign with animated bosses, illustrated powers and clear material cards. Master its sorting waves, and complete it to unlock endless Loop Mode."
    ],
    "story": [
      "Circuit awakens beneath a dusty workbench in Verdale’s neglected school workshop. Outside, mixed rubbish has stalled the recovery station, and Grime is growing stronger with every misplaced item. Professor Loop gives Circuit a first task: clear the courtyard and get the school’s collection system working again.",
      "With Nandi, the school caretaker, Circuit learns why clean paper must stay away from food and wet waste. Sam, the repair technician, assesses broken devices while neighbours share readable books and wearable clothes at the exchange shelf. When Grime blocks the school gate, the community’s recovery work powers the first Loop Pulse showdown.",
      "News reaches the market, where organiser Asha needs help with delivery boxes, lunch waste and a busy swap day. Circuit works with the traders to protect clean materials, prepare packaging and reopen the community station. As the festival approaches, Grime returns to the square, and the market team must restore its lights together.",
      "The journey continues with Musa, the community collector, and Lebo, the recovery coordinator. Plan collection rounds, protect fibre from the rain, check accepted destinations and keep delivery records tied to completed visits. When Grime cuts off the recovery district, reconnect its network and reopen the collection gates.",
      "Sam then opens the repair quarter, where Circuit helps plan qualified assessments, checked exchanges and supervised specialist appointments. Complete the workshop’s work orders and restore its beacon before joining the city team at the civic square.",
      "The final chapter connects all five districts. Nandi protects the school link, Asha organises the market celebration, Musa and Lebo confirm deliveries, and Sam brings the repair team. As rain approaches and Grime makes a final stand, the community’s checked plans power The Loop. Verdale’s restored square celebrates what its neighbours can keep building together."
    ],
    "howToPlay": [
      "Choose Begin Story or continue a saved story mission. New missions unlock in order.",
      "Tap an object in the scene and read its condition on the item card.",
      "If an activity action appears, open it and use its touch buttons or swipe across the item to fold, empty, scrape, check or assess it before routing.",
      "Choose a destination by its label and icon. Use Other routes when a mission has more than four destinations.",
      "Use a clue or the Service Board to review the local rules. Mistakes can be corrected without restarting the story mission.",
      "Complete six tasks per area and answer any community request. Complete any work order by checking its conditions and service arrangements, getting the team’s approval and recording the outcome. On dispatch boards, visit the pickup and delivery stops, checking vehicle space and any separate-load rule. Then install a community project between areas. Each Grime showdown needs all recovery tasks and its district objectives before three charged Loop Pulses. Each action saves on this device when storage is available."
    ],
    "desktop": [
      "Use the pointer or keyboard Tab and Enter to collect items and choose story actions. Escape opens the mission menu.",
      "In Arcade Campaign, tap an item then its bin, or drag it there. A/D or arrow keys select bins; Enter routes the lowest item. Space activates a power-up. Tap Grime hazards to clear them."
    ],
    "mobile": [
      "Play in portrait or landscape with large item targets and labelled destination buttons.",
      "Tap to collect and tap to route, or drag an item to a destination. Hands-on activities also offer visible buttons, so gestures are optional. Story play has no countdown.",
      "Pause / Menu includes audio sliders, reduced motion and a retry for the current story area. Enter Fullscreen is available where the browser supports it."
    ],
    "systems": [
      {
        "title": "Community work orders",
        "body": "Complete two independent checks in either order, ask the team to approve the job, then record the outcome. Every action saves. Feedback explains unsafe shortcuts, and qualified experts perform specialist work."
      },
      {
        "title": "Collection dispatch",
        "body": "Plan each load’s pickup before its accepted delivery. Delivering frees vehicle space, while separate-load rounds keep the listed streams apart. Each visited stop saves; clues and retries support learning."
      },
      {
        "title": "Material and condition",
        "body": "The item card distinguishes a usable book, empty packaging, food scraps and materials that need preparation or specialist attention."
      },
      {
        "title": "Reuse, preparation and local routes",
        "body": "Empty or scrape accepted packaging, flatten boxes, share usable goods and ask qualified people to assess electrical repairs. Read the local service board for cartons, glass and batteries."
      },
      {
        "title": "Saved areas and recoverable mistakes",
        "body": "The story saves after decisions and supports area retries. Earlier areas and the existing arcade campaign save remain intact. Choose a community project between areas and watch it appear in the scene. Completing without corrections or clues earns three stars."
      }
    ],
    "progression": [
      "Twenty-five story missions contain 450 recovery tasks in total. Five chapters end in Grime showdowns, and the final mission celebrates all five restored districts. The 20-mission arcade campaign offers a separate, faster challenge across eight themed eco-hubs.",
      "All story missions are untimed. Arcade difficulty rises through more material categories, wind, power-ups, hazards and bosses. A boss mission requires both its sorting target and the boss defeat."
    ],
    "tips": [
      "Read the material and condition together; a usable book has a different first destination from unwanted paper.",
      "Prepare an item before routing when a preparation button is shown.",
      "Read the service board rather than treating bin colours as a universal code.",
      "On the dispatch board, deliver the load on board when another pickup will not fit. Check whether the round requires separate trips.",
      "Use clues to learn, then replay a mission to improve its star rating.",
      "Ask an adult or trained worker about batteries, electronics, chemicals or broken glass. Do not open or dismantle them."
    ],
    "learning": [
      "Practises separation at source, contamination prevention, preparation, reuse, repair and local acceptance rules.",
      "Shows the role of caretakers, repairers, community collectors and recovery facilities. Real-world services have different acceptance rules; check local guidance."
    ],
    "faqs": [
      {
        "q": "How many levels are in Recycle Rush?",
        "a": "There are 25 story missions, each with three areas and 18 recovery tasks, plus a separate 20-mission arcade campaign. Completing Arcade unlocks endless Loop Mode."
      },
      {
        "q": "Is the story timed?",
        "a": "No. Inspect items, read feedback and use clues at your own pace. Mistakes can be corrected. Progress saves on the same device when browser storage is available."
      },
      {
        "q": "Are my previous arcade saves kept?",
        "a": "Yes. The story uses a separate save. Arcade stars, badges, unlocked hubs and Loop Mode remain available."
      },
      {
        "q": "Does the game replace local recycling instructions?",
        "a": "No. The service board describes the fictional community in the game. Accepted materials and preparation rules differ between real collection services; follow your packaging label and local collector’s instructions."
      }
    ]
  },
  "science-lab-dash": {
    "category": "Educational",
    "summary": "Restore Nova Science Academy through 35 untimed adventure missions and 105 investigations covering selected Grades 4–10 chemistry topics, with animated characters, saved evidence and an element guide, plus the original 20-mission science dash.",
    "overview": [
      "Science Lab Dash: The Element Core Mystery is a chemistry adventure through Nova Science Academy. Explore 35 story missions and complete 105 investigations across seven learning paths for Grades 4–10. Move between laboratory stations, make predictions, compare labelled settings and explain the evidence that restores each room. The adventure is untimed, with progressive hints and recoverable movement challenges.",
      "Animated scientists, helpers and patrol scanners bring the academy to life. Each adventure mission has its own original music arrangement, with sound effects, separate music and effects volumes, reduced decorative motion and optional fullscreen. The original 20-mission science dash remains available from the game menu, with lane switching, science questions, hazards, power-ups and boss encounters."
    ],
    "story": [
      "The Glitch Experiment has scrambled Nova Science Academy’s records. Join Professor Nova as a young investigator and rebuild the Element Archive by testing which observations support each repair. A restored room becomes a route to the next part of the academy.",
      "The journey grows from material properties and makers’ workshops into the waterworks, Element Registry, Particle Observatory and Reaction District. In the final laboratories, isotope records, chemical structures and quantities unlock the Element Core. Each learning path adds five missions and fifteen recorded investigations.",
      "The finale reconnects the academy through the evidence you have gathered. Completing all seven paths resolves the Element Core mystery and awards the story title Element Core Investigator. Restored missions and their notebook records remain available to revisit."
    ],
    "howToPlay": [
      "Select Play Game to open the game in a new tab. Begin or continue the adventure; the Missions map shows restored and locked rooms.",
      "Move through the laboratory, collect optional fragments and use Jump to pass patrol scanners. Scanner contact briefly slows movement; you can recover and continue.",
      "Approach an investigation station and use Inspect. Record a prediction, choose a labelled sample or process setting and run a test.",
      "Compare at least two different settings, then run a setting that meets the investigation’s goal. Use the diagrams, observation table and progressive hints to explain your evidence.",
      "Choose the supported explanation and Apply the discovery. Complete all three investigations, then reach and activate the archive relay to restore the mission and unlock the next.",
      "Use Menu for the Field notebook, mission replay, audio settings and reduced motion. Choose Play the original dash for the separate 20-mission action game."
    ],
    "desktop": [
      "Adventure: A/D or Left/Right moves; Space, W or Up jumps; E inspects a nearby station or uses the archive relay; P opens the menu.",
      "Use the pointer or keyboard to operate investigation buttons, selectors, reference cards and menus. Alt+Enter or an Enter Fullscreen control toggles fullscreen where supported.",
      "Original dash: Up/W and Down/S change lanes; 1, 2 and 3 select lanes directly; Space fires a lab burst and Shift uses an available shield."
    ],
    "mobile": [
      "Adventure: hold the on-screen left/right buttons to move, tap Jump and use Inspect near a station or relay. Movement and jump can be used together.",
      "Tap investigation choices and Run test, then scroll within the laboratory panel to review observations, explanations and Apply the discovery. Portrait and landscape layouts are supported.",
      "Use the in-game fullscreen control where the browser supports it. Original dash uses swipe lane changes and on-screen lab-burst and Shield controls."
    ],
    "systems": [
      {
        "title": "Seven chemistry learning paths",
        "body": "Grades 4–10 each add five adventure missions and fifteen investigations. The path progresses from materials and mixtures to atoms, bonding, reactions and introductory chemical quantities."
      },
      {
        "title": "Predict, compare, explain and apply",
        "body": "Predictions guide exploration. Distinct recorded trials, a tested working setting and a supported explanation are required to apply a discovery. Some briefs have more than one working choice; a larger amount or higher reading can overshoot a target."
      },
      {
        "title": "Diagrams and an element reference",
        "body": "Labelled diagrams show particles, structures, indicator readings, inventories and calculations. The first-twenty element guide is available in designated Element Registry and later reference activities and their replays; selecting cards does not award score."
      },
      {
        "title": "Saved evidence and replay",
        "body": "The Field notebook retains applied discoveries and comparison records. Active investigations save choices, trial history, hints and answer order when device storage is available. Replaying a mission retains permanent discoveries and does not award the same discovery or completion score again."
      },
      {
        "title": "Original science dash",
        "body": "The preserved action mode has 20 missions across laboratory safety, scientific method, physics, chemistry, biology, Earth science, space, robotics and data science. It keeps its own progression, power-ups, badges and Glitch Experiment encounters."
      }
    ],
    "progression": [
      "The adventure contains 35 missions and 105 investigation records. Complete missions in order to unlock the next; each completed grade opens the following grade. Earlier restored rooms can be replayed from the mission map.",
      "Adventure scoring awards 100 points for each first applied discovery, 300 for each first mission restoration and 5 per newly collected fragment. Reference-card taps and repeated completion do not duplicate those awards. Platform score displays remain available on the game information page.",
      "Progress is saved on the current device when browser storage is available. The chemistry adventure and original dash keep separate saves. Clearing browser data or using a different device can remove or separate local progress; signing into the platform does not turn these local checkpoints into cloud saves."
    ],
    "tips": [
      "Read the goal and fair-comparison note before changing equipment. Keep track of what changes and what stays the same.",
      "A failed comparison is useful evidence. Record it, try another setting and return to a working setting before explaining the result.",
      "Check the named substance, entity and units. Ionic formula ratios, molecules, atoms, mass and moles describe different things.",
      "Use the reference guide where available and the Field notebook to review earlier discoveries. Open a hint when you need a starting point.",
      "In quantity investigations, use the stated molar masses and final solution volume. A higher dose, pH or concentration is not automatically a better answer.",
      "Take your time in the adventure. Use the original dash when you want the separate lane-based action challenge."
    ],
    "learning": [
      "The adventure covers selected CAPS chemistry topics, not a complete annual Natural Sciences or Physical Sciences course, a formal assessment or a substitute for supervised practical work. Virtual records use stated assumptions, schematic diagrams and supplied or rounded quantities.",
      "Grade 4: material states and properties, water changes, suitable materials and strengthened structures.",
      "Grade 5: metal properties, rust prevention, processing materials and choosing products for a purpose.",
      "Grade 6: mixtures, solutions, separation, dissolving comparisons and water-treatment evidence.",
      "Grade 7: material properties, separation methods, acids and bases, paired indicators and the first twenty elements.",
      "Grade 8: atoms, compounds and mixtures, particle behaviour, density, expansion, pressure and chemical change.",
      "Grade 9: formulae and balanced records, metal and non-metal oxides, corrosion, pH, neutralisation and restoration decisions.",
      "Grade 10: isotopes and ions, electron arrangements, bonding and structures, system boundaries, moles, molar mass, concentration and basic reaction quantities."
    ],
    "faqs": [
      {
        "q": "How many missions are there?",
        "a": "The chemistry adventure has 35 missions and 105 investigations across Grades 4–10. The original science dash adds 20 separate action missions. These are two game modes, with 55 missions in total."
      },
      {
        "q": "Is the adventure timed?",
        "a": "No. Investigations, hints and retries are untimed. Patrol scanners can slow movement, but you can recover and continue. The original dash keeps its separate action format."
      },
      {
        "q": "Can I start at any grade?",
        "a": "The adventure follows a continuous learning path. Complete each mission to unlock the next, and complete a grade to open the following grade. Restored missions remain available to replay."
      },
      {
        "q": "Does refreshing lose my investigation?",
        "a": "The adventure saves active choices, trials, hints and progress on this device when browser storage is available. Refreshing can resume an unfinished investigation. Device changes, private browsing restrictions or cleared browser data can affect local saves."
      },
      {
        "q": "Does this cover the whole school curriculum?",
        "a": "It covers selected CAPS chemistry topics for Grades 4–10. It supports learning and revision alongside teaching and textbooks; it does not cover the complete annual science syllabus or replace formal assessments and supervised practicals."
      },
      {
        "q": "Can I use it on a phone?",
        "a": "Yes. The adventure has touch movement, jump and inspection controls, scrollable investigation panels and portrait/landscape layouts. It fills its dedicated browser tab, with optional fullscreen where supported."
      },
      {
        "q": "Can I control music and sound effects separately?",
        "a": "Yes. Open Menu to adjust independent music and sound-effect volumes. Each of the 35 adventure missions has its own original music arrangement. Browser audio starts after player interaction."
      },
      {
        "q": "Can I still play the original science dash?",
        "a": "Yes. Choose Play the original dash from the game menu. Its 20 action missions, science questions, power-ups, badges, bosses and separate local progression remain available."
      },
      {
        "q": "Do replays or element cards give extra discovery points?",
        "a": "Replays retain permanent discoveries and notebook records. Repeating the same discovery or mission completion does not duplicate its points, and reference-card taps award no score."
      }
    ]
  },
  "sky-temple-3d-rise-of-the-relic-master": {
    "category": "Adventure",
    "summary": "Explore four 3D worlds, collect five relics in each and defeat their Guardians using jumps, gliding and relic blasts, with world music and saved checkpoints.",
    "overview": [
      "Sky Temple 3D: Rise of the Relic Master is a browser adventure across floating islands, crystal caverns, stormy citadels and a sunlit sanctuary. Recover ancient relics and face a Guardian in each world.",
      "Select Play Game to open the campaign in a new tab with the whole window available. Each world includes exploration music, Guardian music, sound effects and saved checkpoints."
    ],
    "story": [
      "The journey leads through Sky Garden, Crystal Caverns, Storm Citadel and Solar Sanctuary. Each environment introduces new platforming and combat situations on the way to the Relic Master.",
      "Named guardians help distinguish the stages: Garden Sentinel, Crystal Warden, Thunder Golem and Relic Master. Relics and world exploration connect the fights into a larger fantasy quest."
    ],
    "howToPlay": [
      "Select Play Game, then start or continue your adventure from the world chooser.",
      "Move across islands and bridges, jumping over gaps and holding Glide to extend your descent.",
      "Use relic blasts to defeat drones and respond to Guardian attacks.",
      "Find five relics in each world and defeat its Guardian.",
      "Use the portals to travel through Sky Garden, Crystal Caverns and Storm Citadel, then complete the final challenge in Solar Sanctuary."
    ],
    "desktop": [
      "WASD or arrow keys move. Space jumps, Shift glides and E fires a relic blast.",
      "Drag on the game canvas to turn the camera. Use the pause menu for resume, fullscreen and separate music/effects volume controls."
    ],
    "mobile": [
      "Drag the movement pad, use Jump and Blast, and hold Glide.",
      "Drag the game canvas to turn the camera. Portrait and landscape play are supported."
    ],
    "systems": [
      {
        "title": "Four fantasy worlds",
        "body": "Sky Garden, Crystal Caverns, Storm Citadel and Solar Sanctuary each have distinct routes, hazards and a Guardian."
      },
      {
        "title": "Movement and combat",
        "body": "Jump, glide and aim relic blasts while responding to drones, projectiles and Guardian warnings."
      },
      {
        "title": "World music and checkpoints",
        "body": "Exploration and Guardian themes change with each encounter. Checkpoints, audio preferences and progress are saved on the device."
      }
    ],
    "progression": [
      "Recover the five relics in each world, defeat Garden Sentinel, Crystal Warden and Thunder Golem, and face the Relic Master in Solar Sanctuary.",
      "Progress and campaign scores stay on this device. Use the same browser profile to continue a saved adventure."
    ],
    "tips": [
      "Plan a landing before jumping or gliding.",
      "Explore the side routes to find every relic.",
      "Watch Guardian warnings and move clear before an attack lands.",
      "Pause to adjust music and sound effects independently."
    ],
    "faqs": [
      {
        "q": "How many worlds are there?",
        "a": "There are four campaign worlds: Sky Garden, Crystal Caverns, Storm Citadel and Solar Sanctuary. Collect five relics in each world and defeat its Guardian."
      },
      {
        "q": "Can the character fly?",
        "a": "Hold Glide to slow your descent and extend jumps. The campaign uses jumping and gliding rather than an unlockable flight power."
      },
      {
        "q": "What does my browser need?",
        "a": "A browser with working WebGL graphics. If 3D graphics cannot start, enable hardware acceleration or try another supported browser."
      },
      {
        "q": "Will my progress be saved?",
        "a": "Checkpoints, collected relics, scores and audio preferences are saved on the device when browser storage is available."
      }
    ]
  },
  "space-dodger": {
    "category": "Adventure",
    "summary": "Pilot a GLB spacecraft through 18 story sectors with cinematic space backgrounds, rescue and escort objectives, reactive bosses, saved checkpoints and separate audio controls.",
    "overview": [
      "Space Dodger 3D: Starfall Odyssey is an eighteen-sector campaign with original GLB spacecraft, cinematic backgrounds and forward-moving star effects. Survive asteroids and plasma gates, complete rescue and relay objectives, escort the Ark, navigate gravity gates and confront the Sovereign.",
      "Built as a Babylon.js space adventure, Starfall Odyssey includes asteroid fields, plasma gates, glowing engine trails, collectible power-ups, enemy fire and major boss encounters. Solid spacecraft and fortress models give depth to the action. Rescue pods, disable command relays, escort the Dawn Ark and cross charged ion lanes. Staying aware of the space around your ship matters as much as firing quickly."
    ],
    "story": [
      "Starfall Odyssey casts the player as a pilot making their way through a dangerous region of space. Rather than surviving one endless meteor field, you work through eighteen story levels involving shifting hazards and hostile spacecraft.",
      "Each mission makes the surrounding space feel like territory to be crossed and defended. Boss encounters raise the stakes and require a different rhythm from ordinary asteroid avoidance."
    ],
    "howToPlay": [
      "Launch the spacecraft and familiarise yourself with how steering changes its position.",
      "Fly around asteroids and plasma gates while tracking the next safe route.",
      "Fire at hostile ships when you have a clear opportunity.",
      "Use boost to cross a dangerous stretch or reposition, but plan the path beyond the acceleration.",
      "Look for helpful power-ups and collectibles.",
      "Complete mission objectives and progress through the eighteen-sector campaign."
    ],
    "desktop": [
      "Use WASD or arrow keys to fly.",
      "Use Space or hold the mouse to shoot, Shift to boost, E for plasma, P/Escape to pause and M to mute."
    ],
    "mobile": [
      "Drag to fly or use the on-screen thrusters. FIRE shoots, BOOST accelerates and PLASMA releases a stored charge. Automatic fire is available in the flight settings."
    ],
    "systems": [
      {
        "title": "Three-dimensional flight",
        "body": "The Babylon.js scene gives space to dodge obstacles in more than one direction."
      },
      {
        "title": "Enemy spacecraft and bosses",
        "body": "AI opponents fire back; survival requires movement and attacking at the right time."
      },
      {
        "title": "Powers and effects",
        "body": "Collectibles and power-ups appear alongside animated particles, engine trails and audio feedback."
      }
    ],
    "progression": [
      "Work through eighteen story missions with increasingly demanding hazards, hostile ships and major boss encounters.",
      "Practise turning, firing and boosting until controlling the ship feels natural. Cleared sectors unlock checkpoint continuation and replay, with medals and personal records saved on your device. Your best runs can contribute scores to WebGameArena when leaderboard saving is enabled."
    ],
    "tips": [
      "Keep moving when hostile projectiles are approaching rather than staying directly in one firing line.",
      "Look for a clear exit route before using boost.",
      "Give asteroids space; tight passes may be more dangerous than they look in 3D.",
      "Use short firing opportunities instead of losing track of obstacles while aiming.",
      "Spend an early attempt learning movement sensitivity before focusing on mission speed."
    ],
    "faqs": [
      {
        "q": "Is Starfall Odyssey a 3D game?",
        "a": "Yes. The game features Babylon.js as its 3D rendering engine."
      },
      {
        "q": "Can the ship shoot?",
        "a": "Yes. Space, mouse/tap or FIRE are attack inputs."
      },
      {
        "q": "How many story levels are included?",
        "a": "There are 18 story sectors. Unlock sectors through play, continue saved checkpoints and revisit completed routes for medals and personal records."
      }
    ]
  },
  "space-pilot-platformer": {
    "category": "Adventure",
    "summary": "Guide Pilot Nova through eight space platforming missions, collect star cores, cross moving platforms, battle drones and defeat an animated boss in every level.",
    "overview": [
      "Space Pilot Platformer follows Pilot Nova through eight missions, from Crash Landing to Final Gate. Longer asteroid routes, moving platforms, rising star-core targets and hostile drones lead to an animated boss at the end of every level.",
      "Platform timing and collection are closely linked. Star cores reward exploration, while hostile drones and level-ending bosses keep the route from becoming a simple jumping exercise."
    ],
    "story": [
      "Pilot Nova's expedition crosses dangerous asteroid-platform environments. The character collects star cores and battles robotic opponents on the way to distinctive animated bosses.",
      "Nova gathers star cores while battling drones and travelling toward an animated boss at the end of each stage. The journey rewards careful landings, thoughtful exploration and learning when to attack or wait."
    ],
    "howToPlay": [
      "Start a level and note the nearest stable platform and your intended next landing point.",
      "Move toward the edge carefully and jump across gaps or up to new ledges.",
      "Avoid enemy fire and deal with drones when a safe attack opportunity is available.",
      "Collect star cores when they are within reach without creating unnecessary risk.",
      "Reach the end-of-level boss and learn its movement before attempting a fast victory.",
      "Continue to the next platforming area and refine your timing."
    ],
    "desktop": [
      "Use the movement, jump and attack keys shown in the game's control instructions. Study the next platform before committing to a jump."
    ],
    "mobile": [
      "Touch controls are supported. Use the on-screen directions and action controls identified by the running game."
    ],
    "systems": [
      {
        "title": "Asteroid platforms",
        "body": "Gaps, heights and landings define the movement challenge."
      },
      {
        "title": "Drones and star cores",
        "body": "Enemies encourage careful positioning, and collectibles give the player a reason to explore beyond the shortest path."
      },
      {
        "title": "Boss encounters",
        "body": "A distinctive animated boss closes each level, shifting attention from travel to pattern recognition."
      }
    ],
    "progression": [
      "Complete eight missions in order, gathering each route’s required star cores, overcoming its hazards and defeating its animated boss before entering the rescue portal.",
      "A strong attempt balances safe traversal with optional collecting rather than treating every jump as a sprint."
    ],
    "tips": [
      "Check the distance and height of the next landing before leaving a platform.",
      "Use a safe ledge to observe a drone rather than entering its path immediately.",
      "Do not chase a star core when it would remove your only stable landing.",
      "Study a boss pattern for a moment before approaching.",
      "Practice difficult jumps deliberately instead of repeating the same mistimed input."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "There are eight missions: Crash Landing, Asteroid Platforms, Pirate Outpost, Crystal Nebula Ruins, Space Station Wreckage, Comet Foundry, NOVA-X Fortress and Final Gate. Each ends with a boss."
      },
      {
        "q": "Who is the playable character?",
        "a": "The game description identifies the pilot as Pilot Nova."
      },
      {
        "q": "What do I collect?",
        "a": "Star cores are the collectibles."
      },
      {
        "q": "Does it support mobile play?",
        "a": "Yes. Play with the touch controls shown on screen for movement and actions."
      }
    ]
  },
  "stack-tower": {
    "category": "Puzzle",
    "summary": "Time each block drop, build perfect-placement combos, charge Focus Mode and keep climbing in an endless tower-building score challenge.",
    "overview": [
      "Stack Tower is a timing challenge built around a single satisfying action: dropping a moving block onto the structure below it. Each new block tests your sense of rhythm, alignment and the small corrections needed to keep a tower stable as it grows.",
      "The polished presentation features glowing pseudo-3D blocks, sound and background music, while the game systems give accurate players extra goals. Perfect placements can build combinations, and Focus Mode becomes a tactical tool when timing is difficult."
    ],
    "story": [
      "There is no named hero or cinematic story. Your construction project is the challenge itself: build a tower as high as your precision allows.",
      "The tower becomes a visible record of every earlier decision. A slight misalignment may not end the session at once, but it can make the next placement harder."
    ],
    "howToPlay": [
      "Start a round and observe the movement of the next block.",
      "Wait for the moving block to line up with the top of the tower.",
      "Tap, click or press the drop key to place it.",
      "Aim for accurate placement and repeated perfect drops to build combos.",
      "Notice when Focus Mode becomes available and use it to help with difficult timing.",
      "Continue building until the round ends, then compare your height and score with earlier attempts."
    ],
    "desktop": [
      "Press Space or Enter to drop a block; clicking the drop control also works.",
      "Use the on-screen Pause, Drop, Submit, Restart and Sound options."
    ],
    "mobile": [
      "Tap the screen or Drop control to place the current block.",
      "Keep your view on the tower's top edge rather than the moving block alone."
    ],
    "systems": [
      {
        "title": "Alignment-based gameplay",
        "body": "The relationship between the moving block and the existing tower determines a strong placement."
      },
      {
        "title": "Perfect-drop combos",
        "body": "Repeated accurate placements reward consistency rather than frantic tapping."
      },
      {
        "title": "Focus Mode",
        "body": "The game features a charged Focus Mode that supports more deliberate timing."
      }
    ],
    "progression": [
      "Stack Tower is an endless-style replayable timing challenge, not a campaign with characters and level dialogue.",
      "Progress is measured in height, accuracy and the result of successive drops. The challenge naturally changes as small alignment mistakes accumulate."
    ],
    "tips": [
      "Watch for the instant when the moving block crosses the centre of the supporting block.",
      "Choose a visual reference on the stack and time your input against it.",
      "Prioritise a safe placement over a risky perfect attempt when the tower becomes narrow.",
      "Use Focus Mode when it can prevent a mistake, rather than automatically when available.",
      "Try to establish a steady rhythm; inconsistent tapping makes alignment harder."
    ],
    "faqs": [
      {
        "q": "Does this game have a fixed campaign?",
        "a": "The tower is an endless score challenge. Keep placing blocks while enough of the top surface remains to continue; there is no fixed final campaign level."
      },
      {
        "q": "Which keys drop a block?",
        "a": "Space and Enter are desktop drop controls."
      },
      {
        "q": "Does the game have power-ups?",
        "a": "It includes a charged Focus Mode,."
      },
      {
        "q": "How do I get a taller tower?",
        "a": "Prioritise consistent alignment of each block with the top of the stack."
      }
    ]
  },
  "swipe-racer": {
    "category": "Racing",
    "summary": "Race through four city, mountain, coastal and neon-night missions. Swipe around traffic, collect pickups, use nitro and complete route objectives.",
    "overview": [
      "Swipe Racer is an arcade driving game designed around steering gestures and quick decisions. You navigate a 3D-style car through traffic and collect helpful items while looking ahead to the next safe space in the road.",
      "It combines the replayability of an endless traffic dodger with a four-part mission structure. The racing environments include a daytime city, a mountain pass, a coastal sunset route and a neon night scene, each bringing a different visual atmosphere."
    ],
    "story": [
      "The game follows a driver's progression through a sequence of increasingly demanding routes rather than a named protagonist's scripted journey.",
      "The campaign's four environments provide a sense of travel from city streets toward scenic and nighttime roads. Successful driving is about responding to traffic patterns while making considered use of nitro."
    ],
    "howToPlay": [
      "Start the current route or mission and familiarise yourself with steering sensitivity.",
      "Swipe or drag left and right to move your car across the roadway.",
      "Watch the position and movement of traffic ahead before changing direction.",
      "Collect useful pickups when a safe route leads through them.",
      "Use nitro when available to gain speed, but avoid activating it directly into a dense group of cars.",
      "Continue through missions and compare your results across the four environments."
    ],
    "desktop": [
      "The game features swipe/drag steering; use pointer dragging and the game's on-screen buttons."
    ],
    "mobile": [
      "Swipe or drag horizontally to steer.",
      "Tap or press the Boost button to use nitro when charged; use the Pause, Submit, Restart and Sound controls as needed."
    ],
    "systems": [
      {
        "title": "Four themed routes",
        "body": "City, mountain, coast and neon-night backdrops distinguish the mission environments."
      },
      {
        "title": "Traffic and pickups",
        "body": "Avoiding other vehicles keeps the run alive while selected pickups offer extra opportunities."
      },
      {
        "title": "Nitro boost",
        "body": "Boost rewards planning: gaining speed is useful only if the route remains clear."
      }
    ],
    "progression": [
      "Complete missions across four racing environments: city streets, mountain passes, coastal roads and neon night routes. Pickups, nitro and careful traffic navigation help you build stronger runs.",
      "Anticipation and smooth steering are the foundations of a good result. Follow the game's on-screen score and mission feedback while learning when a pickup is worth the detour."
    ],
    "tips": [
      "Aim for an empty lane before you reach a vehicle rather than swiping at the last second.",
      "Watch two or three cars ahead to avoid escaping one obstacle into another.",
      "Use nitro on clear sections and plan how you will slow your decisions afterward.",
      "Steer smoothly instead of making long frantic movements.",
      "Replay a route to learn its visual cues before focusing on maximum speed."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "There are four mission routes: city streets, a mountain pass, the coast and a neon-night road."
      },
      {
        "q": "How do I steer?",
        "a": "Swipe or drag left and right, including on a touch screen."
      },
      {
        "q": "Can I use nitro?",
        "a": "Yes. The game includes a boost control for nitro."
      },
      {
        "q": "Are there different roads?",
        "a": "The game includes city, mountain, coastal and neon-night routes across four levels."
      }
    ]
  },
  "word-dash": {
    "category": "Educational",
    "summary": "Complete four themed word missions by typing or tapping letters, building spelling streaks and using Hint, Freeze and extra-time powers.",
    "overview": [
      "Word Dash turns spelling and vocabulary practice into a fast sequence of word challenges. Players match target words using physical or on-screen letters while managing a timer, improving accuracy and building streaks.",
      "Rather than repeating one plain keyboard exercise, the game moves through themed environments such as a library, city of words, mountain focus setting and neon letters area. Mission progression and helpful power-ups make it feel like an arcade challenge as well as a learning exercise."
    ],
    "story": [
      "The premise is a sprint through a series of language-focused arenas. Each location gives the word task a new visual setting, but the centre of the challenge remains the same: recognise a target and enter it accurately.",
      "Each round challenges you to recognise and enter target words before time runs out. Correct answers build streaks, while Hint, Freeze and extra-time powers give you options when the timer starts running low."
    ],
    "howToPlay": [
      "Start a word mission and read the target word carefully.",
      "Type the letters in the correct order or tap them on the mobile keyboard.",
      "Use Enter to submit a word when playing with a physical keyboard.",
      "Correct mistakes with Backspace before submitting.",
      "Build streaks through consecutive correct entries while watching the timer.",
      "Use Hint, Freeze or extra time when a mission becomes difficult, then continue toward the next themed level."
    ],
    "desktop": [
      "Type with the keyboard, press Enter to submit and Backspace to delete an incorrect letter.",
      "Use the displayed power-up buttons when Hint, Freeze or extra time is available."
    ],
    "mobile": [
      "Tap letters on the in-game keyboard.",
      "Use the on-screen Hint, Freeze and +Time controls, along with Pause or Restart."
    ],
    "systems": [
      {
        "title": "Spelling and vocabulary",
        "body": "Recognising and reproducing target words accurately is the central task."
      },
      {
        "title": "Streaks and time pressure",
        "body": "Successful sequences encourage speed, but rushing at the expense of spelling accuracy can interrupt momentum."
      },
      {
        "title": "Three support powers",
        "body": "Hint, Freeze and +Time are tools for difficult moments."
      }
    ],
    "progression": [
      "Word Dash includes four mission-based levels with different visual themes.",
      "Scores and streaks provide immediate feedback, while repeated play helps users identify words or typing patterns they need to practise."
    ],
    "tips": [
      "Read the whole word before entering the first letter.",
      "Aim for accuracy first; a fast incorrect entry often wastes more time than a careful correct one.",
      "Use Backspace as soon as you notice an error.",
      "Save Freeze or extra-time help for a demanding portion of the run.",
      "Treat Hint as a learning aid: try to remember the word on the next encounter."
    ],
    "learning": [
      "Practise spelling accuracy, word recognition, vocabulary and keyboard familiarity.",
      "Develop proofreading habits under mild time pressure."
    ],
    "faqs": [
      {
        "q": "How many levels or missions can I play?",
        "a": "There are four themed mission levels with target words, streak scoring and power-ups."
      },
      {
        "q": "How do I submit a word on desktop?",
        "a": "Enter submits the current word and Backspace removes the last input."
      },
      {
        "q": "Can I play without a physical keyboard?",
        "a": "Yes. The game provides on-screen letter keys for mobile play."
      },
      {
        "q": "What power-ups are available?",
        "a": "Hint, Freeze and +Time are in the game."
      }
    ]
  }
};

export function getGameEditorial(slug: string): GameEditorial | undefined {
  return GAME_EDITORIALS[slug];
}
