/* Versioned local-only saves. Hosts/files are rebuilt from authored data, never from saved executable content. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CyberProgress = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const keys = { campaign: 'wga_cyber_shield_campaign_v1', practice: 'wga_cyber_shield_practice_v1', preferences: 'wga_cyber_shield_preferences_v1' };
  const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const number = (value, min, max, fallback = min) => Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback;
  function snapshot(raw, chapters, practice = false) {
    raw = record(raw);
    const completed = {};
    let frontier = chapters.length - 1, foundGap = false;
    chapters.forEach((chapter, i) => {
      if (foundGap) return;
      chapter.objectives.forEach(([key]) => { if (record(raw.completed)[key] === true) completed[key] = true; });
      if (!chapter.objectives.every(([key]) => completed[key])) { frontier = i; foundGap = true; }
    });
    const levelIndex = practice ? number(raw.levelIndex, 0, frontier) : frontier;
    const permitted = chapters.slice(0, levelIndex + 1);
    const hosts = permitted.map(c => c.host);
    const connected = hosts.includes(raw.connected) ? raw.connected : chapters[levelIndex].host;
    const cwd = typeof raw.cwd === 'string' && Object.hasOwn(chapters.find(c => c.host === connected).fs, raw.cwd) ? raw.cwd : connected === 'local' ? '/home/cadet' : '/';
    const evidence = [...new Set((Array.isArray(raw.evidence) ? raw.evidence : []).filter(item => {
      if (typeof item !== 'string' || item.length > 200) return false;
      const at = item.indexOf(':'), host = item.slice(0, at), file = item.slice(at + 1);
      const chapter = permitted.find(c => c.host === host), slash = file.lastIndexOf('/');
      return chapter && Object.hasOwn(chapter.fs[file.slice(0, slash) || '/'] || {}, file.slice(slash + 1));
    }))].slice(0, 100);
    const objectives = new Set(chapters.flatMap(c => c.objectives.map(([key]) => key)));
    const hints = Object.fromEntries(Object.entries(record(raw.hints)).filter(([key]) => objectives.has(key)).map(([key, count]) => [key, number(count, 0, 3)]));
    const reviews = [...new Set(chapters.flatMap(c => Object.values(c.reads || {}).flat().map(file => `${c.host}:${file}`)))];
    const readFiles = (Array.isArray(raw.readFiles) ? raw.readFiles : []).filter(key => reviews.includes(key));
    const mistakes = (Array.isArray(raw.mistakes) ? raw.mistakes : []).filter(key => chapters.some(c => c.decision?.choices.some(([id, , correct]) => !correct && key === `${c.id}:${id}`))).slice(0, 40);
    const defenses = {};
    permitted.forEach(c => {
      const saved = record(record(raw.defenses)[c.host]);
      defenses[c.host] = { scanned: saved.scanned === true, probed: saved.probed === true };
    });
    return {
      levelIndex, completed, connected, cwd, evidence, defenses, hints, readFiles, mistakes,
      score: number(raw.score, 0, 1000000), trust: number(raw.trust, 0, 100, 100), trace: number(raw.trace, 0, 100),
      commandCount: number(raw.commandCount, 0, 100000), retries: number(raw.retries, 0, 10000),
      history: (Array.isArray(raw.history) ? raw.history : []).filter(v => typeof v === 'string').slice(-80).map(v => v.slice(0, 300)),
      transcript: (Array.isArray(raw.transcript) ? raw.transcript : []).slice(-60).map(row => ({ text: String(row?.text || '').slice(0, 2500), cls: ['cmd', 'ok', 'warn', 'bad', 'story', 'dim', 'ascii'].includes(row?.cls) ? row.cls : '' })),
      caseClosed: !!completed.submit_case, academyClosed: !!completed.submit_academy,
      pendingReport: !!completed.report || !!completed.beacon_report,
      gameOver: raw.gameOver === true && !practice, practiceComplete: practice && raw.practiceComplete === true
    };
  }
  function envelope(raw, chapters, practice = false) {
    raw = record(raw);
    if (raw.version !== 1 || !raw.state || typeof raw.state !== 'object') return null;
    const state = snapshot(raw.state, chapters, practice), checkpoints = {};
    for (const [id, value] of Object.entries(record(raw.checkpoints))) {
      const index = Number(id);
      if (!Number.isInteger(index) || index < 0 || index > state.levelIndex) continue;
      const candidate = snapshot(value, chapters);
      if (candidate.levelIndex === index && !chapters[index].objectives.some(([key]) => candidate.completed[key])) checkpoints[id] = candidate;
    }
    return { version: 1, state, checkpoints };
  }
  function read(storage, key, chapters, practice = false) {
    try {
      const text = storage?.getItem(key);
      if (!text || text.length > 1500000) return null;
      return envelope(JSON.parse(text), chapters, practice);
    } catch { return null; }
  }
  function write(storage, key, value) {
    try { if (!storage) return false; storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }
  function preferences(storage) {
    try { const p = record(JSON.parse(storage?.getItem(keys.preferences) || '{}')); return { muted: p.muted === true, mode: p.mode === 'practice' ? 'practice' : 'campaign' }; }
    catch { return { muted: false, mode: 'campaign' }; }
  }
  return { keys, snapshot, envelope, read, write, preferences };
});
