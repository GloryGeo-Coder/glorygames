/* Saved community work orders. The trained team performs specialist work. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RecycleOrders = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function attempt(plan, state, id) {
    const step = plan.steps.find(step => step.id === id);
    if (!step) return { ok: false, text: plan.pitfalls.find(step => step.id === id)?.fact || 'Choose an action on this work order.' };
    if (state.done.includes(id)) return { ok: false, text: 'That action is already saved. Choose another action.' };
    if (step.requires.some(id => !state.done.includes(id))) return { ok: false, text: step.blocked };
    state.done.push(id);
    return { ok: true, text: step.fact };
  }
  function read(plan, record) {
    if (!record || !Array.isArray(record.done) || record.done.length > plan.steps.length) return null;
    const state = { done: [] };
    for (const id of record.done) if (!attempt(plan, state, id).ok) return null;
    return state;
  }
  function complete(plan, record) { return read(plan, record)?.done.length === plan.steps.length; }
  function next(plan, record) {
    const state = read(plan, record || { done: [] });
    return state && plan.steps.find(step => attempt(plan, { done: [...state.done] }, step.id).ok);
  }
  function pending(session, mission) {
    const plan = mission.orders?.[session.stop];
    return !!(plan && !session.complete && session.done.length === mission.sets[session.stop].length && !complete(plan, session.play?.orders?.[session.stop]));
  }
  function valid(session, mission) {
    const records = session.play?.orders;
    if (records !== undefined && (!records || typeof records !== 'object' || Array.isArray(records))) return false;
    for (const [stop, record] of Object.entries(records || {})) {
      if (!/^[0-2]$/.test(stop) || Number(stop) > session.stop || !mission.orders?.[stop] || !read(mission.orders[stop], record)) return false;
      if (Number(stop) === session.stop && (session.done.length !== mission.sets[stop].length || session.play?.decisions?.[stop] !== mission.requests[stop].answer)) return false;
    }
    if (mission.orders) for (let stop = 0; stop < (session.complete ? 3 : session.stop); stop++) if (!complete(mission.orders[stop], records?.[stop])) return false;
    if (mission.orders && session.play?.dispatch?.[session.stop] && !complete(mission.orders[session.stop], records?.[session.stop])) return false;
    if (mission.orders && session.play?.bossHits && !complete(mission.orders[2], records?.[2])) return false;
    return true;
  }
  function act(session, mission, id) {
    if (!pending(session, mission)) return { ok: false, text: 'Finish this area and its community request before starting the work order.' };
    const records = session.play.orders ||= {}, record = records[session.stop] ||= { done: [] };
    const state = read(mission.orders[session.stop], record);
    if (!state) return { ok: false, text: 'This work order cannot be resumed. Retry this area from the pause menu.' };
    const result = attempt(mission.orders[session.stop], state, id);
    if (result.ok) record.done = state.done;
    return result;
  }
  return { read, complete, next, pending, valid, act };
});
