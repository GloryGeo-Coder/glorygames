/* Collection scheduling rules. Route space is a game unit, never a real weight. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RecycleDispatch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function jobs(plan) {
    return plan.loads.flatMap(load => [
      { id: `pickup-${load.id}`, load: load.id, kind: 'pickup', label: `Collect · ${load.pickup}` },
      { id: `deliver-${load.id}`, load: load.id, kind: 'deliver', label: `Deliver · ${load.delivery}` }
    ]);
  }
  function attempt(plan, state, id) {
    const job = jobs(plan).find(job => job.id === id);
    if (!job || state.done.includes(id)) return { ok: false, text: 'Choose a stop that still needs a visit.' };
    const load = plan.loads.find(load => load.id === job.load);
    if (job.kind === 'pickup') {
      if (state.used + load.spaces > plan.capacity) return { ok: false, text: `There is not enough room for ${load.label.toLowerCase()}. Deliver a load already on board to free collection space.` };
      if (plan.separate && state.cargo.length) return { ok: false, text: 'This round keeps these loads apart. Deliver the load on board before collecting another stream.' };
      state.cargo.push(load.id); state.used += load.spaces;
    } else {
      if (!state.cargo.includes(load.id)) return { ok: false, text: `Collect ${load.label.toLowerCase()} before visiting its listed destination.` };
      state.cargo = state.cargo.filter(id => id !== load.id); state.used -= load.spaces;
    }
    state.done.push(id);
    return { ok: true, text: job.kind === 'pickup' ? `${load.label} collected with Musa · ${state.used}/${plan.capacity} load spaces occupied.` : `${load.label} delivered to ${load.delivery}. ${load.fact}` };
  }
  function read(plan, record) {
    if (!record || !Array.isArray(record.done) || record.done.length > jobs(plan).length) return null;
    const state = { done: [], cargo: [], used: 0 };
    for (const id of record.done) if (!attempt(plan, state, id).ok) return null;
    return state;
  }
  function complete(plan, record) { const state = record && read(plan, record); return !!state && state.done.length === jobs(plan).length && state.cargo.length === 0; }
  function valid(session, mission) {
    const records = session.play?.dispatch;
    if (records !== undefined && (!records || typeof records !== 'object' || Array.isArray(records))) return false;
    for (const [stop, record] of Object.entries(records || {})) {
      if (!/^[0-2]$/.test(stop) || Number(stop) > session.stop || !mission.dispatch?.[Number(stop)] || !read(mission.dispatch[Number(stop)], record)) return false;
      if (Number(stop) === session.stop && (session.done.length !== mission.sets[session.stop].length || mission.requests && session.play?.decisions?.[stop] !== mission.requests[stop].answer)) return false;
    }
    if (mission.dispatch) for (let stop = 0; stop < (session.complete ? 3 : session.stop); stop++) if (!complete(mission.dispatch[stop], records?.[stop])) return false;
    return true;
  }
  function pending(session, mission) {
    const plan = mission.dispatch?.[session.stop];
    return !!(plan && !session.complete && session.done.length === mission.sets[session.stop].length && !complete(plan, session.play?.dispatch?.[session.stop]));
  }
  function next(plan, record) {
    const state = read(plan, record || { done: [] });
    if (!state) return null;
    return jobs(plan).find(job => attempt(plan, { done: [...state.done], cargo: [...state.cargo], used: state.used }, job.id).ok) || null;
  }
  function act(session, mission, id) {
    if (!pending(session, mission)) return { ok: false, text: 'Complete this area and its community request before planning dispatch.' };
    const plan = mission.dispatch[session.stop], records = session.play.dispatch ||= {}, record = records[session.stop] ||= { done: [] };
    const state = read(plan, record);
    if (!state) return { ok: false, text: 'This route cannot be resumed. Retry the current area from the pause menu.' };
    const result = attempt(plan, state, id);
    if (result.ok) record.done = state.done;
    return result;
  }
  return { jobs, read, complete, valid, pending, next, act };
});
