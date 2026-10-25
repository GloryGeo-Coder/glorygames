(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScienceChemistryGrade6Visuals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[c]));
  const text = (x, y, value, size = 20) => `<text x="${x}" y="${y}" fill="#e4f6ff" font-size="${size}" font-family="system-ui,sans-serif">${escape(value)}</text>`;
  const rect = (x, y, w, h, color, radius = 7) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${color}"/>`;
  const line = (x, y, x2, y2, color = '#a7cbd8', width = 4) => `<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  const dot = (x, y, kind, radius = 6, color = '#ffd389', motion = '') => `<circle data-kind="${kind}" cx="${x}" cy="${y}" r="${radius}" fill="${color}"${motion ? ` class="${motion}"` : ''}/>`;
  const vessel = (x, y = 65, w = 180, h = 150) => `<path d="M${x} ${y}V${y+h}H${x+w}V${y}" fill="#20465f" stroke="#abcbd9" stroke-width="4"/>`;
  const arrow = (x, y, length = 42) => line(x, y, x + length, y, '#ffd389') + line(x + length - 10, y - 8, x + length, y, '#ffd389') + line(x + length - 10, y + 8, x + length, y, '#ffd389');
  function draw(t, value, result) {
    let s = '';
    switch (t.type) {
      case 'g6-particles':
        s = text(35, 35, 'Same 18 model particles · closed container') + rect(177, 63, 246, 165, '#20465f') + line(177, 63, 423, 63);
        for (let i = 0; i < 18; i++) {
          const x = value === 'gas' ? 197 + i % 6 * 41 : 229 + i % 6 * 26 + (value === 'liquid' ? i % 3 * 2 : 0);
          const y = value === 'gas' ? 88 + Math.floor(i / 6) * 55 : 150 + Math.floor(i / 6) * 25 + (value === 'liquid' ? i % 2 * 3 : 0);
          s += dot(x, y, 'particle', 7, '#79e4d1', value === 'solid' ? 'vibrating' : 'floating');
        }
        s += text(35, 266, value === 'gas' ? 'Widely spaced; fills the available space' : value === 'liquid' ? 'Close together; can move past one another' : 'Close together; vibrate around fixed positions', 18); break;
      case 'g6-sieve':
        s = text(35, 35, 'Retained above · passed below') + line(95, 132, 505, 132, '#abcbd9', value === 'closed' ? 10 : 3);
        if (value !== 'closed') for (let i = 0; i < (value === 'wide' ? 7 : 27); i++) s += rect(95 + i * (value === 'wide' ? 62 : 15), 126, 6, 13, '#c2dce7', 1);
        for (let i = 0; i < 6; i++) s += dot(150 + i * 56, i < result.retainedBeans ? 77 : 177, 'bean', 10, '#b9926b');
        for (let i = 0; i < 18; i++) s += dot(135 + i % 9 * 38, (i < result.retainedSand ? 99 : 204) + Math.floor(i / 9) * 13, 'sand', 3, '#ffd389');
        s += text(35, 265, result.metric, 19); break;
      case 'g6-settle':
        s = text(35, 35, 'First jar') + text(350, 35, 'Collecting jar') + vessel(45) + vessel(350) + arrow(258, 140);
        if (value !== 'shake') s += rect(50, value === 'decant' ? 175 : 120, 170, value === 'decant' ? 35 : 90, '#3b82a5');
        if (value !== 'rest') s += rect(355, 123, 170, 87, '#3b82a5');
        for (let i = 0; i < 6; i++) s += dot((value === 'shake' ? 373 : 66) + i * 25, value === 'shake' ? 150 + i % 2 * 30 : 201, 'sand', 5);
        s += text(35, 265, value === 'decant' ? 'Sediment left behind; upper water transferred' : value === 'rest' ? 'Settled, but no water collected yet' : 'Suspended sand moves with the poured mixture', 18); break;
      case 'g6-soluble':
        s = text(35, 35, 'Particle model: solids remain present') + vessel(185, 65, 230, 155);
        for (let i = 0; i < 12; i++) s += dot(205 + i % 4 * 57, 99 + Math.floor(i / 4) * 43, 'water', 6, '#73bcf0', 'floating');
        for (let i = 0; i < 6; i++) s += dot(result.success ? 232 + i % 3 * 57 : 212 + i * 34, result.success ? 121 + Math.floor(i / 3) * 43 : 207, 'solute', result.success ? 4 : 7, '#ffd389', result.success ? 'floating' : '');
        s += text(35, 265, result.success ? 'Six solute markers dispersed, not destroyed' : 'Six insoluble sand markers remain as grains', 18); break;
      case 'g6-filter':
        s = text(35, 35, 'Filter residue') + text(355, 35, 'Collected filtrate') + '<path d="M80 95H235L175 155V193H145V155Z" fill="#526e86" stroke="#a7cbd8" stroke-width="4"/>' + vessel(350, 70) + rect(355, 120, 170, 90, '#387fa1') + arrow(263, 142);
        for (let i = 0; i < 6; i++) s += dot(result.retained ? 111 + i % 3 * 45 : 380 + i % 3 * 48, result.retained ? 83 + Math.floor(i / 3) * 20 : 138 + Math.floor(i / 3) * 42, 'solid', result.retained ? 6 : 4, '#ffd389', result.retained ? '' : 'floating');
        s += text(35, 265, result.retained ? 'Sand retained; water not certified for drinking' : 'Dissolved solute passes through ordinary paper', 18); break;
      case 'g6-recover': {
        s = text(35, 35, 'Before') + text(340, 35, 'After processing');
        for (const [panel, x] of [['before', 35], ['after', 340]]) {
          const dry = panel === 'after' && result.success;
          s += `<g data-panel="${panel}">` + vessel(x, dry ? 190 : 67, 190, dry ? 37 : 160);
          for (let i = 0; i < 12; i++) s += dot(x + 20 + i % 4 * 46, (dry ? 70 : 98) + Math.floor(i / 4) * (dry ? 35 : 38), 'water', 5, '#73bcf0', 'floating');
          for (let i = 0; i < 6; i++) s += dot(x + (dry ? 20 + i * 30 : 40 + i % 3 * 46), dry ? 217 : 117 + Math.floor(i / 3) * 56, 'salt', dry ? 6 : 4);
          s += '</g>';
        }
        s += text(35, 266, result.success ? 'Salt stays; water vapour moves into the air' : 'Salt is still dispersed in the collected solution', 18); break;
      }
      case 'g6-rate':
        s = text(35, 35, 'Illustrative time units · shorter means faster', 19);
        for (const [i, option] of t.options.entries()) {
          const y = 65 + i * 56, time = result.times[option.value];
          s += text(30, y + 23, option.label, 16) + rect(240, y, time * 16, 32, value === option.value ? '#79e4d1' : '#547e9a') + text(250 + time * 16, y + 23, time, 18);
        }
        s += text(35, 265, 'Same dose and endpoint; change one factor', 19); break;
      case 'g6-saturation':
        s = text(35, 35, 'Fixed water amount and temperature') + vessel(185, 60, 230, 165);
        for (let i = 0; i < 12; i++) s += dot(205 + i % 4 * 57, 95 + Math.floor(i / 4) * 40, 'water', 5, '#73bcf0', 'floating');
        for (let i = 0; i < result.added; i++) s += dot(i < result.dissolved ? 238 + i % 2 * 90 : 268 + (i - result.dissolved) * 53, i < result.dissolved ? 119 + Math.floor(i / 2) * 43 : 215, 'solute', i < result.dissolved ? 5 : 8, '#ffd389', i < result.dissolved ? 'floating' : '');
        s += text(35, 262, `${result.saturated ? 'Saturated' : 'Unsaturated'} · ${result.dissolved} dissolved + ${result.residue} excess`, 19); break;
      case 'g6-audit':
        s = text(35, 35, 'Evidence coverage, not a safety certificate', 19);
        for (const [i, label] of ['Physical', 'Chemical', 'Microbial'].entries()) {
          const checked = i === 0 || result.success;
          s += rect(35 + i * 180, 77, 165, 120, checked ? '#285a58' : '#634958') + text(50 + i * 180, 116, label, 20) + text(50 + i * 180, 160, checked ? 'Check requested' : 'Not checked', 15);
        }
        s += text(35, 262, 'Clear appearance alone cannot rule out hazards', 18); break;
      case 'g6-wetland':
        s = text(35, 35, 'Same rain pulse · different landscape') + rect(50, 75, 500, 98, value === 'paved' ? '#637687' : '#548278') + '<path d="M55 113Q180 65 280 127T545 125" fill="none" stroke="#78bddd" stroke-width="20"/>';
        if (value !== 'paved') for (let i = 0; i < (value === 'intact' ? 14 : 4); i++) s += line(88 + i * 32, 159, 88 + i * 32, 91 + i % 3 * 8, '#b7df94', 4) + line(88 + i * 32, 130, 79 + i * 32, 116, '#b7df94', 3);
        s += text(55, 202, 'Peak-flow markers', 18);
        for (let i = 0; i < result.peak; i++) s += rect(55 + i * 50, 216, 37, 22, '#8dc9f0');
        s += text(35, 272, 'Slower peak flow is not water disappearing', 18); break;
      case 'g6-treatment': {
        s = text(35, 35, 'Compare visible removal and final-filter load', 19);
        const labels = ['Screen', value === 'settle-filter' ? 'Settle + decant' : 'No settling', value === 'screen' ? 'No filter' : 'Filter'];
        for (let i = 0; i < 3; i++) {
          s += rect(35 + i * 185, 85, 155, 89, i === 1 && value !== 'settle-filter' || i === 2 && value === 'screen' ? '#38475c' : '#315e6c') + text(48 + i * 185, 120, labels[i], 17);
          if (i < 2) s += arrow(198 + i * 185, 132, 18);
        }
        s += text(35, 210, `${result.removed}/12 visible markers removed`, 19) + text(35, 239, result.filterLoad === null ? 'No final filter is used' : `Final filter captures ${result.filterLoad} solid markers`, 19) + text(35, 270, 'Other hazards still require assessment', 18); break;
      }
      case 'g6-disinfect':
        s = text(35, 35, 'Track microbial and chemical evidence separately', 18) + rect(50, 75, 235, 113, result.microbialControl ? '#285a58' : '#634958') + rect(315, 75, 235, 113, '#634958') + text(65, 111, 'Microbial control', 20) + text(65, 157, result.microbialControl ? 'Managed stage' : 'Not established', 18) + text(330, 111, 'Chemical hazard', 20) + text(330, 157, 'Still unresolved', 18) + text(95, 253, 'Sample not certified for drinking', 21); break;
      case 'g6-release':
        s = text(35, 35, 'Clear appearance · unresolved chemical alert', 19) + rect(95, 65, 410, 80, '#634958') + text(120, 99, 'Chemical report: unresolved', 22) + text(120, 127, 'Appearance does not cancel the alert', 17) + rect(95, 171, 410, 55, result.success ? '#285a58' : '#634958') + text(116, 205, result.success ? 'Hold for specialist assessment' : 'Release is not justified', 21) + text(35, 266, 'Keep the sample out of drinking use', 19); break;
    }
    return s;
  }
  return {draw};
});
