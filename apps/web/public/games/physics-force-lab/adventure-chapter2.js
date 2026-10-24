(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PhysicsRecoveryDistrict = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const lessons = {
    amplitude: {
      type: 'amplitude', grade: 4, topic: 'Sound: loudness and vibrations',
      concept: 'Stronger vibrations can make a louder sound without changing its pitch.',
      variable: 'Pluck strength', unit: '', min: 1, max: 5, step: 1, initial: 1,
      prediction: 'If you pluck the same string harder, keeping its length and tension fixed, what changes?',
      predictions: ['The sound becomes louder', 'Its pitch must become higher', 'The string stops vibrating'], correctPrediction: 0,
      question: 'What did the larger wave height show?',
      answers: ['Stronger vibrations and a louder sound', 'A higher pitch because every wave got taller', 'That the string no longer needed energy'], correct: 0,
      explanation: 'Wave height shows the size of the vibration. A harder pluck gives a larger vibration and a louder sound. The spacing of the waves, and the pitch, stay the same in this model.',
      hint: 'Compare the wave heights at two pluck settings. Keep the string length and tension unchanged.',
      needsComparison: true
    },
    water: {
      type: 'water', grade: 5, topic: 'Falling-water energy (extension)',
      concept: 'Raised water stores energy. Falling water can transfer energy to a wheel.',
      variable: 'Reservoir height', unit: 'm', min: 1, max: 8, step: 1, initial: 1,
      prediction: 'For the same amount of water and the same wheel, what can increasing the release height do?',
      predictions: ['Transfer more energy to the wheel', 'Remove all the stored energy', 'Create energy from nothing'], correctPrediction: 0,
      question: 'Where did the energy turning the wheel come from?',
      answers: ['Energy stored when the water was raised', 'The wheel created energy by spinning', 'The water lost its mass as it fell'], correct: 0,
      explanation: 'Energy was supplied to raise the water. As it fell, stored energy transferred to movement of the water and wheel. Raising the same amount of water higher stored more energy.',
      hint: 'Change only the release height. Compare the wheel movement for the same amount of water.',
      needsComparison: true
    },
    grid: {
      type: 'grid', grade: 6, topic: 'Electric circuits: complete conducting paths',
      concept: 'Current can flow when the cell, lamp and conducting wires form a complete circuit.',
      variable: 'Repair wires', initial: '000000000',
      prediction: 'The return wire is already connected. What must the repair wires do to light the lamp?',
      predictions: ['Make a continuous conducting route from the cell to the lamp', 'Leave a gap so current can jump across', 'Point towards the lamp without touching'], correctPrediction: 0,
      question: 'Why did the repaired route light the lamp?',
      answers: ['The repaired wires and fixed return lead completed the conducting circuit', 'The lamp supplied energy to the cell', 'A gap in the wire made the circuit complete'], correct: 0,
      explanation: 'The cell supplies energy. The rotated wires join the cell to the lamp, and the fixed return lead closes the circuit. A gap anywhere in that route prevents the lamp from lighting.',
      hint: 'Start at the cell on the left of the middle row. Each wire end must meet the next wire end. The lamp is on the right of the middle row.',
      needsComparison: true
    },
    daylight: {
      type: 'daylight', grade: 6, topic: 'Earth’s rotation: day and night',
      concept: 'Earth rotates. The side facing the Sun has day; the opposite side has night.',
      variable: 'Earth rotation angle', unit: '°', min: 0, max: 330, step: 30, initial: 180,
      prediction: 'When the marked city rotates from the sunlit side to the opposite side, what happens?',
      predictions: ['The city moves from day into night', 'The Sun stops shining everywhere', 'Earth must orbit the Sun once'], correctPrediction: 0,
      question: 'What caused day and night at the marked city?',
      answers: ['Earth rotated while the Sun remained the model’s light source', 'The Sun switched on and off', 'Earth completed its year-long orbit'], correct: 0,
      explanation: 'Earth spins on its axis about once every 24 hours. A place facing the Sun experiences day; a place on the opposite side experiences night. Rotation is different from Earth’s yearly revolution around the Sun.',
      hint: 'Keep the Sun fixed on the right. Rotate only Earth and watch whether the city marker faces towards or away from the Sun.',
      needsComparison: true
    }
  };

  const boards = [
    { tiles: ['corner','straight','corner','corner','blank','corner','blank','blank','blank'], solution: '112300000' },
    { tiles: ['blank','blank','blank','corner','blank','corner','corner','straight','corner'], solution: '000201013' },
    { tiles: ['corner','corner','blank','corner','straight','corner','blank','corner','corner'], solution: '120301003' }
  ];
  const waterStations = [
    { name: 'Canal hoist', target: [7.5,8.5], goal: 'Use falling water to turn the hoist wheel 7.5–8.5 rotations.', hint2: 'Compare height 1 m with height 4 m.' },
    { name: 'Cargo lift', target: [11.5,12.5], goal: 'Turn the cargo wheel 11.5–12.5 rotations.', hint2: 'Compare height 1 m with height 6 m.' },
    { name: 'Floodgate winch', target: [15.5,16.5], goal: 'Turn the floodgate wheel 15.5–16.5 rotations.', hint2: 'Compare height 1 m with height 8 m.' }
  ];
  const gridStations = boards.map((board, i) => ({
    name: ['Canal lights','Recovery workshop','Observatory supply'][i], board,
    goal: 'Rotate the wires to connect the cell on the left to the lamp on the right. The return lead is fixed.',
    hint2: ['Take the route above the middle row.','Take the route below the middle row.','Go up from the cell, then down through the centre before turning towards the lamp.'][i]
  }));
  const daylightStations = [
    { name: 'Daylight survey', condition: 'day', goal: 'Rotate the marked city into full daylight.', hint2: 'Compare 180° with 0°. At 0° the marker faces the Sun.' },
    { name: 'Night observation', condition: 'night', goal: 'Rotate the marked city onto the night side.', lesson: { initial: 0 }, hint2: 'Compare 0° with 180°. At 180° the marker faces away from the Sun.' },
    { name: 'Horizon relay', condition: 'boundary', goal: 'Place the city at the boundary between day and night.', lesson: { initial: 0 }, hint2: 'Compare 0° with 90°. At 90° the marker is on the day–night boundary.' }
  ];
  const missions = [
    {
      ...lessons.amplitude, id: 'sound-garden', title: 'The listening garden', color: '#f5c775', bg: 'level-09-wave-tunnel.png',
      story: 'Beyond the academy, Nova’s rescue crews cannot hear the garden beacons. Pip discovers that the notes have the right pitch but are too quiet. Adjust each string’s pluck strength, compare the visible vibrations and restore a clear signal.',
      ending: 'Three warm notes reach the recovery crews. Their reply points you towards a blocked canal, where an old water-powered hoist could move the next shipment.',
      stations: [
        { name: 'Garden call', target: [3.5,4.5], goal: 'Match a vibration height of 3.5–4.5 mm.', hint2: 'Compare pluck strength 1 with strength 2.' },
        { name: 'Canal call', target: [5.5,6.5], goal: 'Match a vibration height of 5.5–6.5 mm.', hint2: 'Compare pluck strength 1 with strength 3.' },
        { name: 'Rescue call', target: [7.5,8.5], goal: 'Match a vibration height of 7.5–8.5 mm.', hint2: 'Compare pluck strength 1 with strength 4.' }
      ]
    },
    {
      ...lessons.water, id: 'canal', title: 'Power from the canal', color: '#78cfff', bg: 'bg-water-rescue.png',
      story: 'A delivery barge is stranded behind the canal gate. Newtonia remembers a wheel once powered by falling water. Raise a fixed amount of water, release it from different heights and use the wheel to operate three recovery machines.',
      ending: 'The floodgate opens and the barge reaches the district. Under its deck, Pip finds the missing power cable for the observatory. First, repair the damaged supply route.',
      stations: waterStations
    },
    {
      ...lessons.grid, id: 'wireworks', title: 'The wireworks mystery', color: '#8ee4b1', bg: 'bg-circuit-room.png',
      story: 'Someone has rotated the repair wires inside three power cabinets. The cells, lamps and return leads are intact. Trace each route, test a broken connection, then rebuild a complete conducting circuit.',
      ending: 'The observatory receives power. A recovered maintenance record shows that the Core shutdown began during a scheduled night survey. The sky lab may hold the next clue.',
      stations: gridStations
    },
    {
      ...lessons.daylight, id: 'observatory', title: 'The turning sky', color: '#c1b2ff', bg: 'bg-orbit-space.png',
      story: 'The observatory’s city clock has confused rotation with revolution. Its night survey cannot begin. Use a light and Earth model to investigate day, night and the boundary between them while the Sun stays fixed.',
      ending: 'The night survey begins. Newtonia recovers a message recorded just before the shutdown: “Protect the cooling district.” A storm is approaching its emergency relay.',
      stations: daylightStations
    },
    {
      id: 'recovery-relay', title: 'A light through the storm', grade: 6, topic: 'Recovery challenge: energy, circuits and Earth',
      concept: 'Use evidence from energy systems, conducting circuits and Earth’s rotation to complete the rescue.', color: '#ffb98d', bg: 'bg-storm-rescue.png',
      story: 'Rain has isolated the cooling district. Pip needs you to lift its gate, reconnect its signal lamp and align the observatory’s night relay. Combine your earlier investigations to bring the rescue team through the storm.',
      ending: 'The rescue team reaches the cooling district. The Quantum Core’s emergency system was trying to prevent overheating, but its sensors reported the wrong temperatures. Your workshop gains a recovery-team badge. Newtonia asks you to investigate heat and energy next.',
      stations: [
        { ...waterStations[1], name: 'Emergency floodgate', lesson: lessons.water },
        { ...gridStations[2], name: 'Storm signal circuit', lesson: lessons.grid },
        { ...daylightStations[1], name: 'Night rescue relay', lesson: { ...lessons.daylight, initial: 0 } }
      ]
    }
  ];

  const directions = ['N','E','S','W'];
  function ports(kind, rotation) {
    return (kind === 'straight' ? [0,2] : kind === 'corner' ? [0,1] : []).map(d => directions[(d + Number(rotation)) % 4]);
  }
  function normalizeGrid(value) { return typeof value === 'string' && /^[0-3]{9}$/.test(value) ? value : '000000000'; }
  function trace(board, value) {
    const rotations = normalizeGrid(value), visited = [], queue = [];
    if (ports(board.tiles[3], rotations[3]).includes('W')) queue.push(3);
    while (queue.length) {
      const index = queue.shift();
      if (visited.includes(index)) continue;
      visited.push(index);
      for (const direction of ports(board.tiles[index], rotations[index])) {
        const d = directions.indexOf(direction), row = Math.floor(index / 3), col = index % 3;
        const nr = row + [-1,0,1,0][d], nc = col + [0,1,0,-1][d];
        if (nr < 0 || nr > 2 || nc < 0 || nc > 2) continue;
        const next = nr * 3 + nc;
        if (ports(board.tiles[next], rotations[next]).includes(directions[(d+2)%4]) && !visited.includes(next)) queue.push(next);
      }
    }
    return { visited, connected: visited.includes(5) && ports(board.tiles[5], rotations[5]).includes('E') };
  }
  function simulate(lesson, station, value) {
    let output, unit, detail, success;
    if (lesson.type === 'amplitude') {
      output = Math.max(1, Math.min(5, Number(value)||1)) * 2; unit = 'mm';
      detail = 'Same string length and tension; only pluck strength changes. Pitch stays the same.';
    } else if (lesson.type === 'water') {
      output = Math.max(1, Math.min(8, Number(value)||1)) * 2; unit = 'rotations';
      detail = 'Same amount of water and wheel; only the release height changes.';
    } else if (lesson.type === 'grid') {
      const route = trace(station.board, value); output = route.connected ? 1 : 0; unit = '';
      detail = route.connected ? 'The repair route and fixed return lead form a complete conducting circuit.' : 'The repair route contains a gap. The fixed return lead alone cannot complete the circuit.';
      success = route.connected;
    } else if (lesson.type === 'daylight') {
      output = Math.max(0, Math.min(330, Number(value)||0)); unit = '°';
      const light = Math.cos(output*Math.PI/180), state = light > .25 ? 'day' : light < -.25 ? 'night' : 'boundary';
      detail = state === 'day' ? 'The marked city faces the Sun: daytime.' : state === 'night' ? 'The marked city faces away from the Sun: night-time.' : 'The marked city is at the day–night boundary.';
      success = state === station.condition;
    } else return null;
    if (success === undefined) success = output >= station.target[0] && output <= station.target[1];
    return { output, unit, detail, success };
  }
  return { missions, lessons, boards, ports, trace, normalizeGrid, simulate };
});
