/* Hands-on recovery rules, independent of DOM, timing and animation. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RecyclePlay = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const activities = {
    flatten: { title: 'Flatten the box', help: 'Fold both empty flaps, then press the box flat to save collection space.', steps: [['left', 'Fold left flap'], ['right', 'Fold right flap'], ['press', 'Press flat']], unordered: 2 },
    empty: { title: 'Empty the bottle', help: 'Tip this bottle toward the designated sink, pour out the remaining drink, then replace its cap for this collection service.', steps: [['tilt', 'Tip toward sink'], ['pour', 'Pour into sink'], ['drain', 'Empty the rest'], ['cap', 'Replace cap']] },
    scrape: { title: 'Clear the lunch tray', help: 'Move the three food scraps into this project’s food-compost caddy. Keep the accepted container out of the compost.', steps: [['scrap-1', 'Food scrap 1'], ['scrap-2', 'Food scrap 2'], ['scrap-3', 'Food scrap 3']], unordered: 3 },
    repair: { title: 'Plan a safe repair', help: 'Sam is the qualified repairer. Help plan the job without opening the electrical device yourself.', steps: [['observe', 'Look from outside'], ['expert', 'Ask Sam to assess'], ['test', 'Sam tests the repair']] },
    reuse: { title: 'Ready to share', help: 'Check that this item is usable, then place it on the community exchange shelf.', steps: [['check', 'Check condition'], ['share', 'Ready for exchange']] }
  };
  const projects = {
    canopy: { title: 'Dry paper shelter', icon: 'assets/animated/paper-bundle.webp', fact: 'A covered, labelled collection point helps keep paper away from rain and food.' },
    shelf: { title: 'Community exchange', icon: 'assets/animated/book.webp', fact: 'A reuse shelf lets usable books and clothes serve another person before becoming waste.' },
    caddy: { title: 'Food-compost caddy', icon: 'assets/animated/compost-caddy.webp', fact: 'A labelled caddy keeps the listed food scraps separate from packaging and dry paper.' }
  };
  const battles = { 'school-tomorrow': 'The school recovery station is restored.', 'market-lights': 'The market square shines again.', 'recovery-rise': 'The recovery district is connected again.' };
  const isBattle = id => Object.hasOwn(battles, id);
  function kind(item) { return item?.prep || (item?.route === 'repair' ? 'repair' : item?.route === 'reuse' ? 'reuse' : null); }
  function initial(complete = false) { return { version: 1, work: {}, restored: {}, decisions: {}, streak: 0, bestStreak: 0, energy: 0, bossHits: complete ? 3 : 0, wisps: [] }; }
  function valid(value) {
    if (value === undefined) return true; // v3.0 sessions are migrated without losing work.
    if (!value || value.version !== 1 || !value.work || !value.restored || typeof value.work !== 'object' || typeof value.restored !== 'object' || Array.isArray(value.work) || Array.isArray(value.restored)) return false;
    if (!['streak', 'bestStreak', 'energy', 'bossHits'].every(k => Number.isSafeInteger(value[k]) && value[k] >= 0 && value[k] <= (k === 'bossHits' ? 3 : 1000))) return false;
    if (!Array.isArray(value.wisps) || new Set(value.wisps).size !== value.wisps.length || value.wisps.some(v => !Number.isSafeInteger(v) || v < 0 || v > 5)) return false;
    if (Object.entries(value.restored).some(([k, v]) => !/^[0-2]$/.test(k) || !Object.hasOwn(projects, v))) return false;
    if (value.decisions !== undefined && (!value.decisions || typeof value.decisions !== 'object' || Array.isArray(value.decisions) || Object.entries(value.decisions).some(([k, v]) => !/^[0-2]$/.test(k) || typeof v !== 'string' || !/^[a-z-]{1,32}$/.test(v)))) return false;
    return Object.entries(value.work).every(([key, entry]) => /^[0-2]-[0-5]$/.test(key) && Object.hasOwn(activities, entry?.type) && Array.isArray(entry.done) && new Set(entry.done).size === entry.done.length && entry.done.every(id => activities[entry.type].steps.some(s => s[0] === id)));
  }
  function hydrate(session) {
    if (!session.play) session.play = initial(session.complete);
    return session.play;
  }
  function entry(session, item) {
    const type = kind(item), key = `${session.stop}-${session.selected}`;
    const play = hydrate(session);
    if (!type || session.selected === null) return null;
    if (!play.work[key]) play.work[key] = { type, done: [] };
    return play.work[key];
  }
  function work(session, item, step) {
    const state = entry(session, item), spec = state && activities[state.type];
    if (!spec || !spec.steps.some(s => s[0] === step) || state.done.includes(step)) return { ok: false, text: 'Choose an unfinished action on this item.' };
    const next = spec.steps.findIndex(s => !state.done.includes(s[0]));
    const index = spec.steps.findIndex(s => s[0] === step);
    if (!(spec.unordered && index < spec.unordered) && index !== next) return { ok: false, text: `First: ${spec.steps[next][1].toLowerCase()}.` };
    state.done.push(step);
    return { ok: true, kind: 'work', finished: state.done.length === spec.steps.length, text: spec.steps[index][1] + ' · done' };
  }
  function ready(session, item) {
    const state = entry(session, item);
    return !kind(item) || state.done.length === activities[state.type].steps.length;
  }
  function restore(session, id) {
    const play = hydrate(session);
    if (!Object.hasOwn(projects, id) || session.done.length !== 6 || play.restored[session.stop]) return { ok: false, text: 'Complete the area before installing one project.' };
    play.restored[session.stop] = id;
    return { ok: true, kind: 'build', text: projects[id].fact };
  }
  function battle(session, action, value) {
    const play = hydrate(session);
    const requestPending = session.mission !== 'school-tomorrow' && !play.decisions?.[2];
    const deliveryPending = session.mission === 'recovery-rise' && play.dispatch?.[2]?.done?.length !== 4;
    if (!isBattle(session.mission) || session.stop !== 2 || session.done.length !== 6 || session.complete || requestPending || deliveryPending) return { ok: false, text: 'Complete every recovery task to expose Grime.' };
    if (action === 'wisp') {
      if (!Number.isSafeInteger(value) || value < play.bossHits * 2 || value >= (play.bossHits + 1) * 2 || play.wisps.includes(value)) return { ok: false, text: 'Clear the two visible Grime clouds first.' };
      play.wisps.push(value);
      return { ok: true, kind: 'wisp', text: 'Grime cloud cleared. Your recovered materials power The Loop.' };
    }
    if (action === 'pulse') {
      if (play.energy < 6 || play.wisps.length < (play.bossHits + 1) * 2) return { ok: false, text: 'Clear both clouds, then fire six recovered energy cells.' };
      play.energy -= 6; play.bossHits++;
      session.complete = play.bossHits === 3;
      return { ok: true, kind: session.complete ? 'complete' : 'pulse', text: session.complete ? 'Grime clears! ' + battles[session.mission] : 'Loop Pulse lands! Clear the next two Grime clouds.' };
    }
    return { ok: false, text: 'Choose a Grime cloud or the Loop Pulse control.' };
  }
  return { activities, projects, battles, isBattle, kind, initial, valid, hydrate, entry, work, ready, restore, battle };
});
