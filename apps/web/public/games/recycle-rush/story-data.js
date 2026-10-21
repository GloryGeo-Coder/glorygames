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
      'The school station shines again. Circuit, Nandi, Sam and Musa have built a working recovery loop together. Return for a cleaner run or take on the arcade hubs.')
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
    return (value.selected === null || ids.includes(value.selected) && !value.done.includes(value.selected)) && typeof value.complete === 'boolean' && (!value.complete || value.mission !== 'school-tomorrow' || !value.play || value.play.bossHits === 3) && (!value.complete || value.stop === m.sets.length - 1 && value.done.length === ids.length);
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
    if (action === 'restore') return P.restore(session, value);
    if (action === 'wisp' || action === 'pulse') return P.battle(session, action, value);
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
      const battle = finished && m.id === 'school-tomorrow';
      session.complete = finished && !battle;
      return { ok: true, kind: battle ? 'battle' : finished ? 'complete' : checkpoint ? 'checkpoint' : 'sort', text: item.fact, route: value };
    }
    return { ok: false, text: 'Select an item to inspect before choosing a destination.' };
  }
  function nextStop(session) {
    if (!validSession(session) || session.complete) return false;
    const m = missions.find(m => m.id === session.mission);
    if (session.done.length !== m.sets[session.stop].length || session.stop + 1 >= m.sets.length) return false;
    if (session.play && !session.play.restored[session.stop]) return false;
    session.stop++; session.done = []; session.prepared = []; session.selected = null;
    session.checkpointScore = session.score; session.checkpointMistakes = session.mistakes; session.checkpointHints = session.hints;
    return true;
  }
  function retryStop(session) {
    if (!validSession(session)) return false;
    const m = missions.find(m => m.id === session.mission);
    session.score = session.checkpointScore; session.mistakes = session.checkpointMistakes; session.hints = session.checkpointHints;
    if (session.play) { for (const key of Object.keys(session.play.work)) if (key.startsWith(`${session.stop}-`)) delete session.play.work[key]; delete session.play.restored[session.stop]; session.play.streak = 0; session.play.energy = m.sets.slice(0, session.stop).reduce((n, set) => n + set.length, 0); session.play.bossHits = 0; session.play.wisps = []; }
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
  return { SAVE_KEY, SOURCES, routes, items, preparations, play: P, missions, fresh, normalize, validSession, selectedItem, act, nextStop, retryStop, finish, progress };
});
