(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScienceChemistryGrade5Visuals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[c]));
  const text = (x, y, value, size = 20) => `<text x="${x}" y="${y}" fill="#e4f6ff" font-size="${size}" font-family="system-ui,sans-serif">${escape(value)}</text>`;
  const rect = (x, y, w, h, fill, r = 6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
  const line = (x, y, x2, y2, color = '#a7cbd8', width = 5) => `<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  const arrow = () => line(270, 140, 320, 140, '#ffd389') + line(307, 128, 320, 140, '#ffd389') + line(307, 152, 320, 140, '#ffd389');
  const grain = (x, y, color = '#e3c795') => Array.from({length: 18}, (_, i) => rect(x + i % 6 * 17, y + Math.floor(i / 6) * 15, 8, 8, color, 2)).join('');
  function draw(t, value, result) {
    const good = result.success, mint = '#79e4d1', copper = '#d89563', pale = '#e1d1ac';
    let s = '';
    switch (t.type) {
      case 'g5-shape':
      case 'g5-wire':
        s = text(35, 35, 'Before shaping') + text(350, 35, 'After the model test') + rect(85, 100, 115, 62, value === 'copper' ? copper : pale) + arrow();
        if (good && t.type === 'g5-shape') s += '<path d="M390 175V115Q390 75 430 75Q470 75 470 115V153Q470 175 448 175Q426 175 426 153V120" fill="none" stroke="#d89563" stroke-width="14" stroke-linecap="round"/>';
        else if (good) s += line(348, 140, 535, 140, copper, 5) + text(360, 205, 'Longer and thinner', 18);
        else s += grain(385, 135) + line(417, 90, 428, 108, '#ffbdca') + line(452, 96, 446, 116, '#ffbdca');
        s += text(35, 258, good ? (t.type === 'g5-wire' ? 'Ductile: continuous wire' : 'Malleable: shaped without breaking') : 'This specimen breaks or crumbles', 19); break;
      case 'g5-magnet':
        s = text(35, 35, 'Same magnet, distance and sample size') + '<path d="M115 100V165Q115 205 155 205Q195 205 195 165V100" fill="none" stroke="#e5c8bd" stroke-width="30"/>' + rect(100, 85, 30, 40, '#ff8d9d') + rect(180, 85, 30, 40, '#82bded') + rect(good ? 225 : 410, 130, 75, 38, value === 'copper' ? copper : '#bbcddd');
        if (good) s += line(355, 150, 325, 150, mint) + line(336, 141, 325, 150, mint) + line(336, 159, 325, 150, mint);
        s += text(355, 220, value[0].toUpperCase() + value.slice(1), 20) + text(35, 258, good ? 'Iron is attracted' : 'Metal, but not strongly attracted here', 19); break;
      case 'g5-heat':
        s = text(35, 35, 'Same heat source and observation time') + rect(60, 170, 85, 45, '#cc6d53') + text(65, 243, 'Source', 18) + rect(105, 125, 370, 20, value === 'copper' ? copper : value === 'wood' ? '#b99268' : '#859fbd') + rect(452, 75, 36, 100, '#c5d8e2') + rect(462, good ? 95 : 140, 16, good ? 70 : 25, good ? '#ffbd84' : '#84c7f1') + text(419, 207, 'Sensor', 18);
        s += text(35, 268, good ? 'Heat transfers readily along copper' : 'Less heat reaches this sensor in the same time', 18); break;
      case 'g5-rust':
      case 'g5-coating': {
        const coated = t.type === 'g5-coating', rust = coated ? value !== 'intact' : good;
        s = text(35, 35, 'Days later · time compressed') + rect(125, 70, 350, 150, '#244c63') + rect(235, 113, 130, 20, coated && value !== 'bare' ? '#88cfe2' : '#bdc8d4') + rect(282, 123, 35, 66, coated && value !== 'bare' ? '#88cfe2' : '#bdc8d4');
        if (coated && value === 'chipped') s += rect(283, 139, 18, 22, '#bdc8d4');
        if (rust) for (let i = 0; i < (value === 'chipped' ? 4 : 12); i++) s += rect(value === 'chipped' ? 283 + i % 2 * 8 : 244 + i % 6 * 19, value === 'chipped' ? 141 + Math.floor(i / 2) * 9 : 114 + Math.floor(i / 6) * 10, 6, 6, '#c47946', 2);
        if (coated || value !== 'dry') s += line(145, 202, 455, 202, '#67bdea', 6);
        s += text(35, 258, coated ? (value === 'intact' ? 'Intact paint: barrier maintained' : 'Exposed iron: water and air can reach it') : value === 'dry' ? 'Water absent' : value === 'no-oxygen' ? 'Oxygen excluded in this sealed model' : 'Water + oxygen: iron rust develops', 19); break;
      }
      case 'g5-process': {
        const labels = {paste: ['Flour and water', 'Paper join'], plaster: ['Plaster and water', 'Cast in a mould'], concrete: ['Sand, gravel,', 'Repair block'], dough: ['Flour and water', 'Flatbread sample'], jelly: ['Jelly powder and water', 'Display sample']}[t.process];
        s = text(35, 35, 'Ingredients and selected process stage') + text(35, 83, labels[0], 18) + arrow();
        if (t.process === 'concrete') s += text(35, 106, 'cement and water', 18);
        s += grain(70, 142, t.process === 'plaster' ? '#f0e9d4' : '#d8b98c') + rect(188, 145, 35, 50, '#6db7d7');
        if (t.process === 'paste') s += rect(370, 105, 120, 47, '#dfd7bf') + rect(390, good ? 150 : 175, 120, 47, '#dfd7bf') + (good ? line(397, 150, 482, 150, '#ffd389', 7) : '');
        else if (t.process === 'dough') s += `<ellipse cx="435" cy="155" rx="80" ry="34" fill="${good ? '#c98b50' : '#e2c9a0'}"/>` + (good ? line(395, 145, 413, 160, '#8a5338', 3) + line(448, 145, 466, 160, '#8a5338', 3) : '');
        else {
          s += rect(355, 105, 155, 99, '#6b91a3');
          if (['powder', 'dry'].includes(value)) s += grain(380, 145);
          else s += rect(366, good ? 119 : 151, 133, good ? 73 : 41, t.process === 'jelly' ? '#ca83cf' : good ? '#d2cfbc' : '#92bcc8');
          if (good && t.process === 'concrete') s += grain(383, 143, '#9c9e99');
        }
        s += text(350, 238, labels[1], 18) + text(35, 270, result.metric, 18); break;
      }
      case 'g5-clay':
        s = text(35, 35, 'Same vessel and water test') + `<path d="M220 85Q180 145 220 215H390Q430 145 390 85Z" fill="${value === 'glazed' ? '#7fc9cf' : '#ba8562'}" stroke="#e2b48e" stroke-width="5"/>` + line(232, 124, 378, 124, '#69b9ea', 10);
        if (value === 'glazed') s += line(244, 151, 244, 192, '#c8f4f3', 8);
        else for (let i = 0; i < 5; i++) s += `<circle class="floating" cx="${195 + i * 52}" cy="${228 + i % 2 * 8}" r="5" fill="#69b9ea"/>`;
        s += text(35, 268, good ? 'Intact fired glaze seals this vessel' : value === 'wet' ? 'Wet clay: soft and unsuitable here' : 'Air-dried specimen: porous and unglazed', 19); break;
      case 'g5-weave':
        s = text(35, 35, 'Prepared reeds · same gentle lift test');
        for (let i = 0; i < 6; i++) s += rect(160 + i * 45, 65, 22, 150, '#ceae6d');
        if (value === 'woven') {
          for (let row = 0; row < 4; row++) {
            s += rect(145, 78 + row * 35, 300, 18, '#89b28a');
            for (let col = 0; col < 6; col++) if ((row + col) % 2 === 0) s += rect(160 + col * 45, 74 + row * 35, 22, 26, '#ceae6d', 1);
          }
        } else if (value === 'pile') for (let i = 0; i < 4; i++) s += `<path d="M${150+i*13} ${80+i*20}L${450-i*11} ${200-i*24}" stroke="#89b28a" stroke-width="17"/>`;
        s += text(35, 258, good ? 'Over, under: interlaced strips' : 'Loose strips are not interlaced', 19); break;
      case 'g5-window':
        s = text(35, 35, 'Can you see the exhibit through the panel?') + rect(180, 70, 240, 150, '#aac2d0') + text(255, 165, '★', 52) + rect(190, 80, 220, 130, value === 'wood' ? '#ad845c' : value === 'glass' ? '#70c8de35' : '#bc94de35') + text(35, 258, good ? 'Clear, rigid panel: view remains visible' : 'Opaque board: view is blocked', 19); break;
      case 'g5-packing':
        s = text(35, 35, 'Same fragile model · dry indoor delivery') + rect(160, 95, 280, 120, value === 'glass' ? '#8dc6de55' : '#b49366');
        if (value === 'basket') for (let i = 0; i < 10; i++) s += line(170 + i * 27, 105, 170 + i * 27, 203, '#d5b887', 5);
        if (good) s += rect(178, 111, 244, 88, '#caafcf');
        s += rect(269, 128, 62, 56, '#79e4d1') + text(287, 164, '★', 25);
        if (!good) s += line(271, 130, 329, 182, '#ff8498', 5);
        s += text(35, 258, good ? 'Container + soft lining: two useful properties' : 'Unlined specimen: insufficient cushioning', 18); break;
    }
    return s;
  }
  return {draw};
});
