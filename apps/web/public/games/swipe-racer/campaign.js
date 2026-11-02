(function (root) {
  'use strict';
  const KEY = 'wga_swipe_racer_campaign_v1';
  const EVENTS = [
    { id:'first-light', name:'First Light', type:'Sprint', targetDistance:600, baseSpeed:250, spawnEvery:1.15, limit:0, par:14, clean:0, skill:'nitro', story:'Nia, crew chief: Welcome to the Horizon Circuit. Find your line through Metro. The finish is all you need; stars are a bonus.' },
    { id:'rush-hour', name:'Rush Hour', type:'Timed traffic run', targetDistance:900, baseSpeed:260, spawnEvery:1.0, limit:32, par:20, clean:1, skill:'near', story:'Kai, spotter: Traffic is building. Keep an escape lane and reach the finish before the clock runs out.' },
    { id:'crew-delivery', name:'Crew Delivery', type:'Delivery dash', targetDistance:1050, baseSpeed:265, spawnEvery:1.05, limit:38, par:24, clean:0, skill:'nitro', story:'Nia: Bring our spare parts across three delivery markers. Contact dents the cargo, but you can still finish and unlock the next event.' },
    { id:'blue-minute', name:'Blue Minute', type:'Time trial', targetDistance:1200, baseSpeed:280, spawnEvery:1.2, limit:36, par:22, clean:0, skill:'time', story:'Kai: Your next challenge is the clock. Use the nitro charges we packed and aim for a personal best.' },
    { id:'metro-ticket', name:'Metro Ticket', type:'City qualifier', targetDistance:1500, baseSpeed:290, spawnEvery:.9, limit:45, par:29, clean:1, skill:'near', story:'Nia: One last Metro run. Earn your Circuit ticket here. The next regions are still ahead of us.' }
  ].map(event => Object.freeze({ bg:'bgCity', scenery:'city', lanes:3, targetNear:1, targetBoosts:1, targetScore:0, ...event }));
  const finite = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
  function normalize(input) {
    const result = { version:1, results:{} };
    if (!input || input.version !== 1 || !input.results || typeof input.results !== 'object') return result;
    for (const event of EVENTS) {
      const item = input.results[event.id];
      if (!item || item.completed !== true) continue;
      result.results[event.id] = {
        completed:true,
        stars:finite(item.stars,1,3) ? Math.floor(item.stars) : 1,
        score:finite(item.score,0,1e9) ? Math.floor(item.score) : 0,
        time:finite(item.time,.01,3600) ? item.time : null
      };
    }
    return result;
  }
  function storage() { try { return root.localStorage; } catch { return null; } }
  function load(store = storage()) { try { return normalize(JSON.parse(store?.getItem(KEY) || 'null')); } catch { return normalize(null); } }
  function save(data, store = storage()) { try { if (!store) return false; store.setItem(KEY, JSON.stringify(normalize(data))); return true; } catch { return false; } }
  function unlocked(data) {
    let index=0;
    while (index<EVENTS.length-1 && data.results[EVENTS[index].id]?.completed) index++;
    return index;
  }
  function stars(event, run) {
    const clean = run.hits <= event.clean;
    const skill = event.skill === 'nitro' ? run.boostsUsed >= 1 : event.skill === 'time' ? run.elapsed <= event.par : run.near >= 1 || run.elapsed <= event.par;
    return 1 + Number(clean) + Number(skill);
  }
  function record(data, index, run) {
    const next=normalize(data), event=EVENTS[index];
    if (!event || index>unlocked(next) || !finite(run.elapsed,.01,3600) || !finite(run.totalScore,0,1e9)) return next;
    const old=next.results[event.id];
    next.results[event.id]={completed:true,stars:Math.max(old?.stars || 0,stars(event,run)),score:Math.max(old?.score || 0,Math.floor(run.totalScore)),time:Math.min(old?.time || Infinity,run.elapsed)};
    return next;
  }
  const api = { KEY, EVENTS:Object.freeze(EVENTS), normalize, load, save, unlocked, stars, record };
  root.SwipeCampaign = api;
  if (typeof module !== 'undefined') module.exports=api;
})(typeof window !== 'undefined' ? window : globalThis);
