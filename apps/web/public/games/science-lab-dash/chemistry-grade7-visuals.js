(function (root, factory) {
  const data = typeof module === 'object' && module.exports ? require('./chemistry-grade7.js') : root.ScienceChemistryGrade7;
  const api = factory(data?.elements || []);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScienceChemistryGrade7Visuals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (elements) {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[c]));
  const text = (x, y, value, size = 20) => `<text x="${x}" y="${y}" fill="#e4f6ff" font-size="${size}" font-family="system-ui,sans-serif">${escape(value)}</text>`;
  const rect = (x, y, w, h, fill, radius = 6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}"/>`;
  const line = (x, y, x2, y2, color = '#a7cbd8', width = 4) => `<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  const arrow = (x, y, length = 40) => line(x, y, x + length, y, '#ffd389') + line(x + length - 10, y - 8, x + length, y, '#ffd389') + line(x + length - 10, y + 8, x + length, y, '#ffd389');
  const colors = {iron: '#bccbd8', sand: '#c9a77e', salt: '#ffd389', water: '#78bdee', aluminium: '#b7d8df', plastic: '#b8a6d9'};
  const dot = (x, y, kind, radius = 5, floating = false) => `<circle data-kind="${kind}" cx="${x}" cy="${y}" r="${radius}" fill="${colors[kind]}"${floating ? ' class="floating"' : ''}/>`;
  const vessel = (x, y, w, h) => `<path d="M${x} ${y}V${y+h}H${x+w}V${y}" fill="#21425b" stroke="#a7cbd8" stroke-width="4"/>`;
  const categoryColor = category => ({metal: '#315e7c', nonmetal: '#285c52', semimetal: '#786342'}[category]);
  function draw(t, value, result) {
    let s = '';
    switch (t.type) {
      case 'g7-conduct':
        s = text(35, 35, 'Virtual low-voltage circuit') + line(90, 105, 470, 105) + line(470, 105, 470, 210) + line(470, 210, 90, 210) + line(90, 210, 90, 105) + line(70, 135, 110, 135, '#ffd389', 6) + line(78, 153, 102, 153, '#ffd389', 5) + rect(237, 193, 126, 34, result.conducts ? '#79c6b5' : '#65768b') + text(230, 260, value, 19);
        s += `<circle cx="420" cy="105" r="30" fill="${result.conducts ? '#f3d889' : '#39546a'}" stroke="#d8e8ed" stroke-width="4"/>` + line(403, 88, 437, 122, '#17344b', 3) + line(437, 88, 403, 122, '#17344b', 3);
        s += text(120, 166, result.conducts ? 'Lamp on' : 'Lamp off', 20); break;
      case 'g7-thermal':
        s = text(35, 35, 'Same heat source and observation interval', 19);
        for (const [i, option] of t.options.entries()) {
          const n = {copper: 9, aluminium: 7, wood: 2}[option.value], y = 65 + i * 55;
          s += text(35, y + 23, option.label, 17) + rect(240, y, n * 28, 32, option.value === value ? '#79e4d1' : '#547e9a') + text(250 + n * 28, y + 23, n, 18);
        }
        s += text(35, 266, 'Warm-up markers are illustrative, not safety ratings', 17); break;
      case 'g7-boiling': {
        s = text(35, 27, 'Pure-water heating record · normal pressure', 19) + line(80, 58, 80, 220) + line(80, 220, 550, 220);
        for (const temp of [0, 50, 100, 150]) {const y = 220 - temp; s += text(35, y + 5, temp, 15) + line(80, y, 540, y, '#284c65', 1);}
        s += text(38, 53, '°C', 15);
        const points = result.temperatures.map((temp, i) => `${95+i*108},${220-temp}`).join(' ');
        s += `<polyline points="${points}" fill="none" stroke="#79e4d1" stroke-width="5"/>`;
        result.temperatures.forEach((temp, i) => {s += `<circle cx="${95+i*108}" cy="${220-temp}" r="5" fill="#ffd389"/>` + text(91+i*108, 241, i, 14);});
        s += text(35, 271, 'Water: melting ≈0 °C; boiling ≈100 °C', 18); break;
      }
      case 'g7-magnetic':
        s = text(35, 35, 'Separate collection') + text(330, 35, 'Remaining mixture') + vessel(40, 60, 210, 155) + vessel(335, 60, 210, 155);
        for (const [row, kind] of ['iron', 'aluminium', 'plastic'].entries()) for (let i = 0; i < 6; i++) s += dot((kind === 'iron' && result.ironCollected ? 60 : 355) + i * 31, 100 + row * 44, kind, 7);
        s += text(35, 264, result.success ? '6 iron collected; 6 aluminium + 6 plastic remain' : 'All 18 markers remain mixed', 18); break;
      case 'g7-distill':
        s = text(35, 35, 'Virtual salt-and-water separation') + vessel(40, 125, 130, 105) + vessel(412, 125, 145, 105);
        if (value !== 'tray') s += line(139, 120, 233, 90) + line(233, 90, 376, 90) + line(376, 90, 460, 129) + rect(250, 72, 100, 37, value === 'condenser' ? '#73bdd7' : '#64798a') + text(250, 155, value === 'condenser' ? 'Cooling' : 'Uncooled', 18);
        else s += arrow(210, 100, 125) + text(242, 152, 'Into air', 18);
        for (let i = 0; i < 6; i++) s += dot(63 + i % 3 * 36, 194 + Math.floor(i / 3) * 22, 'salt', 6);
        for (let i = 0; i < 12; i++) s += dot(result.waterCollected ? 430 + i % 6 * 20 : 63 + i % 6 * 20, result.waterCollected ? 165 + Math.floor(i / 6) * 32 : 65 + Math.floor(i / 6) * 29, 'water', 5, true);
        s += text(35, 267, result.success ? 'Salt retained; water collected by condensation' : 'Salt retained; water vapour remains uncollected', 18); break;
      case 'g7-chroma':
        s = text(35, 30, 'Paper and water · same observation interval', 19) + vessel(185, 170, 230, 90) + rect(190, 234, 220, 22, '#4e93b8') + rect(245, 49, 110, 196, '#e2dfc9', 2);
        s += line(245, 75, 355, 75, '#668c9f', 2) + line(245, 210, 355, 210, '#6f7783', 2) + text(377, 80, 'Solvent front', 16) + text(377, 216, 'Baseline', 16) + text(30, 245, 'Water level', 16);
        if (value === 'blend') {s += rect(257, 100, 86, 13, '#c6a1da', 2) + rect(257, 149, 86, 13, '#83bfb9', 2);for (let i = 0; i < 4; i++) s += `<circle data-kind="pigment" cx="${278+i%2*44}" cy="${i<2?106:155}" r="4" fill="#23415b"/>`;}
        else if (value === 'single') {s += rect(257, 139, 86, 13, '#c6a1da', 2);for (let i = 0; i < 4; i++) s += `<circle data-kind="pigment" cx="${267+i*22}" cy="145" r="3" fill="#23415b"/>`;}
        s += text(35, 271, result.metric, 17); break;
      case 'g7-litmus':
      case 'g7-audit': {
        s = text(35, 32, 'Read both litmus observations', 20);
        for (const [i, key] of ['redPaper', 'bluePaper'].entries()) {
          const before = i === 0 ? 'red' : 'blue', after = result[key], y = 66 + i * 80;
          s += text(35, y + 33, i === 0 ? 'Red paper' : 'Blue paper', 20) + rect(180, y, 65, 50, before === 'red' ? '#dc8e9e' : '#8bbce9') + arrow(265, y + 25, 60) + rect(355, y, 175, 50, after === 'red' ? '#dc8e9e' : after === 'blue' ? '#8bbce9' : '#596c80');
          s += `<text x="380" y="${y+33}" fill="${after?'#132f44':'#edf6ff'}" font-size="21" font-family="system-ui,sans-serif">${after ? after[0].toUpperCase()+after.slice(1) : 'Not recorded'}</text>`;
        }
        s += text(35, 264, t.type === 'g7-litmus' ? `Specified model class: ${result.classification}` : result.conclusive ? 'Both unchanged: neutral-control evidence' : 'One unchanged result is ambiguous', 18); break;
      }
      case 'g7-recovery': {
        s = text(35, 28, 'Track the four separate collections', 20);
        const counts = [result.ironSeparate, result.sandSeparate, result.saltSeparate, result.waterSeparate];
        ['iron', 'sand', 'salt', 'water'].forEach((kind, n) => {const x = 35 + n * 138;s += text(x + 8, 57, `${kind} · ${counts[n]}`, 17) + vessel(x, 68, 115, 75);for (let i = 0; i < counts[n]; i++) s += dot(x + 17 + i % 4 * 25, 87 + Math.floor(i / 4) * 20, kind, 5);});
        const remaining = [];
        if (value === 'filter') remaining.push(...Array(6).fill('iron'), ...Array(6).fill('sand'), ...Array(6).fill('salt'), ...Array(12).fill('water'));
        else if (value === 'evaporate') remaining.push(...Array(12).fill('water'));
        s += text(35, 175, value === 'filter' ? 'Mixed solids and salt solution remain' : value === 'evaporate' ? 'Uncollected water vapour in the air' : 'All named materials have a collection', 18);
        remaining.forEach((kind, i) => {s += dot(45 + i % 15 * 36, 202 + Math.floor(i / 15) * 24, kind, 5, kind === 'water');});
        s += text(35, 268, 'All 30 material markers are accounted for', 18); break;
      }
      case 'g7-resources':
        s = text(35, 30, 'Given ledger · same twenty-delivery brief', 19);
        ['new', 'reuse', 'film'].forEach((key, i) => {const y = 56 + i * 57, tokens = {new: 12, reuse: 2, film: 6}[key];s += text(35, y + 18, {new: 'New case', reuse: 'Reused case', film: 'Film envelope'}[key], 18) + text(35, y + 38, key === 'film' ? 'Protection fails' : 'Protection met', 14) + rect(230, y + 3, tokens * 24, 32, value === key ? '#79e4d1' : '#547e9a') + text(240 + tokens * 24, y + 26, tokens, 18);});
        s += text(35, 269, 'Resource tokens are illustrative comparison data', 18); break;
      case 'g7-symbols':
        s = text(35, 30, 'Proposed labels · compare with the guide', 19);
        result.pairs.forEach(([symbol, name], i) => {const y = 54 + i * 59;s += rect(60, y, 475, 47, result.success ? '#285c52' : '#3d536d') + text(83, y + 33, symbol, 28) + arrow(168, y + 24) + text(240, y + 31, name, 23);});
        s += text(35, 268, result.metric, 20); break;
      case 'g7-position':
      case 'g7-family':
        s = text(35, 22, 'First-twenty overview · columns are groups', 18);
        for (let group = 1; group <= 18; group++) s += text(29 + (group - 1) * 30, 44, group, 10);
        for (let period = 1; period <= 4; period++) s += text(8, 78 + (period - 1) * 42, period, 12);
        for (const e of elements) {
          const x = 24 + (e.group - 1) * 30, y = 54 + (e.period - 1) * 42;
          s += `<rect data-element-symbol="${e.symbol}" x="${x}" y="${y}" width="27" height="36" rx="4" fill="${categoryColor(e.category)}"${e.symbol===value?' stroke="#fff0ba" stroke-width="3"':''}/>` + text(x + 4, y + 24, e.symbol, 14);
        }
        s += text(113, 119, 'No first-20 entries in groups 3–12', 12);
        s += text(35, 247, `${result.name} (${result.symbol}) · group ${result.group}, period ${result.period}`, 19) + text(35, 274, result.category === 'metal' ? 'Metal' : result.category === 'semimetal' ? 'Semi-metal (metalloid)' : 'Non-metal', 18); break;
    }
    return s;
  }
  return {draw};
});
