'use strict';
// Coordinates are percentages of the uncropped location illustration, measured from top left.
(() => {
  const sites = [
    [
      'living',
      7,
      68,
      'Flowering protea',
      'Look for a flowering plant beside the garden path.',
      'Nala recorded a flowering plant. Following the same flower over time can reveal growth and change.'
    ],
    [
      'plants',
      86,
      57,
      'Potted plants',
      'Find the plants growing on the greenhouse workbench.',
      'The pots keep specimens separate so the team can compare their stems and leaves.'
    ],
    [
      'growth',
      8,
      45,
      'Watering can',
      'Find the tool the nursery team uses to water seedlings.',
      'A watering can lets the team vary how much water seedlings receive in a fair test.'
    ],
    [
      'habitats',
      81,
      68,
      'Wetland pool',
      'Find open water beside the boardwalk.',
      'The pool and its edges offer different sampling sites. Nala can compare aquatic and land habitats here.'
    ],
    [
      'shelters',
      12,
      23,
      'Tree hollow',
      'Find a natural shelter in the old tree.',
      'A hollow in the trunk offers shelter. Nala can observe the entrance from the path.'
    ],
    [
      'g5-biodiversity',
      79,
      49,
      'Waterhole',
      'Locate the waterhole beyond the dry ground.',
      'The waterhole is a useful place to watch for species visiting the reserve.'
    ],
    [
      'g5-skeletons',
      34,
      42,
      'Skeleton exhibit',
      'Find the animal skeleton exhibit in the field station.',
      'The exhibit gives Nala a starting point for comparing how animals support their bodies.'
    ],
    [
      'g5-foodchains',
      20,
      51,
      'Grassland',
      'Aim at the grass growing beside the track.',
      'Grass is a producer. A food chain can begin with energy captured by this plant.'
    ],
    [
      'g5-lifecycles',
      84,
      12,
      'Butterfly',
      'Find a flying adult near the garden canopy.',
      'The adult butterfly is one stage of a life cycle that also includes an egg, larva and pupa.'
    ],
    [
      'g5-interdependence',
      60,
      44,
      'River',
      'Find the water shared by organisms around the lookout.',
      'The river connects the observation sites and supplies water to organisms in the reserve.'
    ],
    [
      'g6-photosynthesis',
      77,
      47,
      'Greenhouse leaves',
      'Find the leafy plants growing along the right-hand bench.',
      'These leaves receive light through the roof. Nala can use them to investigate how plants make food.'
    ],
    [
      'g6-nutrients',
      10,
      52,
      'Food samples',
      'Find the colourful food samples on a bench.',
      'Different foods can be compared by the nutrients they supply.'
    ],
    [
      'g6-balanced',
      81,
      40,
      'Kitchen produce',
      'Locate the fresh produce waiting on the kitchen counter.',
      'Nala can use the produce to plan a meal with several food groups.'
    ],
    [
      'g6-ecosystems',
      65,
      54,
      'Stream',
      'Find the stream flowing between the fynbos plants.',
      'The stream is a non-living part of this ecosystem that supports living organisms.'
    ],
    [
      'g6-foodwebs',
      5,
      27,
      'Tree',
      'Find the large woody producer beside the observation area.',
      'A tree captures energy and can support several feeding relationships in a food web.'
    ],
    [
      'g7-biosphere',
      89,
      42,
      'Globe',
      'Find the model used to study the biosphere.',
      'The globe helps Nala connect this local habitat to the wider biosphere.'
    ],
    [
      'g7-classification',
      23,
      43,
      'Specimen cabinet',
      'Find the archive shelves holding grouped specimens.',
      'Comparing shared characteristics helps scientists classify organisms.'
    ],
    [
      'g7-animals',
      84,
      20,
      'Tree canopy',
      'Find a leafy canopy over the reserve trail.',
      'The canopy is a place to observe animals and record their visible characteristics.'
    ],
    [
      'g7-plants',
      90,
      43,
      'Palm-like plant',
      'Find the plant with a crown of long fronds beside the path.',
      'Nala can compare the fronds with other leaf shapes before identifying the plant.'
    ],
    [
      'g7-reproduction',
      6,
      65,
      'Pink flower',
      'Find a pink flower at the edge of the pollinator garden.',
      'Flowers contain reproductive structures. Watch for pollinator visits without disturbing the plant.'
    ],
    [
      'g8-photosynthesis',
      83,
      59,
      'Sunlit foliage',
      'Find green leaves receiving light inside the glasshouse.',
      'Nala recorded a candidate plant for a photosynthesis investigation.'
    ],
    [
      'g8-respiration',
      22,
      55,
      'Laboratory apparatus',
      'Locate the glass apparatus on the left-hand lab bench.',
      'This is the station for comparing evidence about energy release in living cells.'
    ],
    [
      'g8-ecology',
      50,
      56,
      'Wetland water',
      'Find the open water beyond the lookout rail.',
      'Water is an abiotic factor the team can record alongside the organisms present.'
    ],
    [
      'g8-energy',
      51,
      52,
      'Grass',
      'Find the grass in the sunlit part of the reserve.',
      'The grass captures sunlight. Its stored energy can pass to a grazing animal.'
    ],
    [
      'g8-interactions',
      55,
      58,
      'River crossing',
      'Find the water flowing under the footbridge.',
      'Nala can compare the organisms living along the banks and their interactions.'
    ],
    [
      'g9-cells',
      11,
      44,
      'Microscope',
      'Locate a microscope ready for examining a cell sample.',
      'A microscope reveals structures too small to resolve with the unaided eye.'
    ],
    [
      'g9-systems',
      85,
      44,
      'Systems exhibit',
      'Find the illuminated exhibit in the right-hand display.',
      'This exhibit starts Nala’s investigation into how systems work together.'
    ],
    [
      'g9-oxygen',
      15,
      63,
      'Glass apparatus',
      'Find the glass equipment at the left of the oxygen lab.',
      'Nala has located the station for comparing respiration and gas exchange.'
    ],
    [
      'g9-digestion',
      29,
      49,
      'Food display',
      'Find the food samples on the round demonstration table.',
      'These samples introduce an investigation into how the body processes food.'
    ],
    [
      'g9-reproduction',
      90,
      58,
      'Display case',
      'Locate the covered exhibit on the right of the learning room.',
      'Nala found the exhibit for this investigation of human reproductive systems.'
    ],
    [
      'g10-molecules',
      15,
      58,
      'Laboratory glassware',
      'Find the glassware on the left laboratory counter.',
      'The lab station is ready for comparing the roles of biological molecules.'
    ],
    [
      'g10-membranes',
      17,
      54,
      'Sample tank',
      'Find the transparent sample tank at the left of the lab.',
      'Nala marked the equipment for investigating the movement of substances.'
    ],
    [
      'g10-growth',
      78,
      46,
      'Microscope',
      'Find the microscope beside the window.',
      'This instrument lets the team examine cells during an investigation of growth.'
    ],
    [
      'g10-transport',
      80,
      54,
      'Potted specimen',
      'Find a plant on the right-hand greenhouse bench.',
      'The roots, stem and leaves provide a connected system for transport.'
    ],
    [
      'g10-archive',
      16,
      39,
      'Fossil display',
      'Locate a fossil in the left-hand wall of the archive.',
      'Fossils provide evidence of past life. The field record includes the specimen’s location.'
    ]
  ];
  const studies = [
    [
      'kit-pollinator',
      47,
      51,
      'Pollinator study',
      'Find where the visitor touches the flower.',
      'At the flower, a visitor may pick up or deposit pollen. A visit alone does not prove pollination.'
    ],
    [
      'kit-cells',
      53,
      29,
      'Leaf cell study',
      'Find a green chloroplast inside a cell.',
      'The green structures are chloroplasts. They contain chlorophyll and absorb light.'
    ],
    [
      'kit-fossil',
      49,
      50,
      'Fossil study',
      'Find the preserved imprint in the rock.',
      'The imprint records the shape of an organism that lived in the past.'
    ]
  ];
  const entries = Object.fromEntries(
    [...sites, ...studies].map(([id, x, y, label, clue, note]) => [
      id,
      {
        id,
        x,
        y,
        label,
        clue,
        note,
        image: id.startsWith('kit-')
          ? 'assets/fieldkit/' + id + '.webp'
          : 'assets/backgrounds/' + id + '.webp'
      }
    ])
  );
  const $ = (id) => document.getElementById(id);
  function open({ id, place, recorded, doneLabel, onRecord, onExit }) {
    const entry = entries[id],
      app = $('app');
    let x = 50,
      y = 50,
      finished = false;
    app.innerHTML = `<section class="survey"><button id="exit-survey" class="back">← Return</button>
      <div class="survey-title"><img src="assets/portraits/pip.webp" alt=""><div><p class="eyebrow">Pip’s field scanner</p><h1>${place}</h1></div></div>
      <p class="survey-clue">${entry.clue}</p>
      <div class="survey-stage" id="survey-stage" tabindex="0" role="group" aria-label="Field scanner. Use arrow keys to aim, then Enter to scan.">
        <img class="scan-base" src="${entry.image}" alt="" draggable="false"><span class="lens-ring" id="lens-ring" aria-hidden="true"><img src="${entry.image}" alt="" draggable="false"></span>
      </div>
      <div class="survey-controls"><button class="primary" id="scan">Scan here</button><button class="secondary" id="guide">Pip’s guide</button></div>
      <p id="scan-feedback" class="scan-feedback" role="status"></p><button id="survey-done" class="next" hidden>${doneLabel}</button>
      </section>`;
    const stage = $('survey-stage'),
      ring = $('lens-ring'),
      feedback = $('scan-feedback');
    const active = () => app.contains(stage);
    function position(a, b) {
      x = Math.max(0, Math.min(100, a));
      y = Math.max(0, Math.min(100, b));
      ring.style.left = x + '%';
      ring.style.top = y + '%';
      ring.style.setProperty('--scan-x', -x + '%');
      ring.style.setProperty('--scan-y', -y + '%');
    }
    function scan() {
      if (!active() || finished) return;
      const dx = entry.x - x,
        dy = entry.y - y;
      if (Math.hypot(dx, dy * 0.7) > 12) {
        const direction =
          Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        feedback.textContent = 'No match here. Move the lens ' + direction + ' and scan again.';
        return;
      }
      finished = true;
      position(entry.x, entry.y);
      ring.classList.add('found');
      feedback.innerHTML = '<strong>' + entry.label + '</strong><br>' + entry.note;
      $('scan').hidden = true;
      $('guide').hidden = true;
      $('survey-done').hidden = false;
      onRecord(id);
      $('survey-done').focus({ preventScroll: true });
    }
    position(x, y);
    feedback.textContent = recorded
      ? 'Field note already collected. Find the site again or return.'
      : 'Tap or drag to aim. Keyboard: arrows to move and Enter to scan.';
    const baseImage = stage.querySelector('.scan-base');
    const missing = () => {
      if (!finished)
        feedback.textContent =
          'The scene image is unavailable. Use Pip’s guide to align the lens and record the note.';
    };
    baseImage.onerror = missing;
    if (baseImage.complete && !baseImage.naturalWidth) missing();
    let pointer = null;
    function aim(event) {
      if (finished) return;
      const r = stage.getBoundingClientRect();
      position(((event.clientX - r.left) * 100) / r.width, ((event.clientY - r.top) * 100) / r.height);
    }
    stage.onpointerdown = (e) => {
      if (pointer !== null) return;
      pointer = e.pointerId;
      stage.setPointerCapture(pointer);
      aim(e);
    };
    stage.onpointermove = (e) => {
      if (pointer === e.pointerId) aim(e);
    };
    stage.onpointerup = stage.onpointercancel = (e) => {
      if (pointer === e.pointerId) pointer = null;
    };
    stage.onkeydown = (e) => {
      const moves = { ArrowUp: [0, -5], ArrowDown: [0, 5], ArrowLeft: [-5, 0], ArrowRight: [5, 0] };
      if (!finished && moves[e.key]) {
        e.preventDefault();
        position(x + moves[e.key][0], y + moves[e.key][1]);
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scan();
      }
    };
    $('scan').onclick = scan;
    $('guide').onclick = () => {
      if (!active() || finished) return;
      position(entry.x, entry.y);
      feedback.textContent = 'Pip aligned the lens. Scan here to record the evidence.';
    };
    $('exit-survey').onclick = () => {
      if (active()) onExit(false);
    };
    $('survey-done').onclick = () => {
      if (active() && finished) onExit(true);
    };
    app.focus({ preventScroll: true });
    app.scrollIntoView({ block: 'start' });
  }
  window.BioFieldwork = { entries, studies: studies.map((s) => s[0]), open };
})();
