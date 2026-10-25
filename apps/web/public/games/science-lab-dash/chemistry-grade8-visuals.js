(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScienceChemistryGrade8Visuals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[c]));
  const text = (x, y, value, size = 19) => `<text x="${x}" y="${y}" fill="#e4f6ff" font-size="${size}" font-family="system-ui,sans-serif">${escape(value)}</text>`;
  const rect = (x, y, w, h, fill, radius = 7) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}"/>`;
  const line = (x, y, x2, y2, color = '#a7cbd8', width = 3) => `<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  const arrow = (x, y, length = 45) => line(x, y, x + length, y, '#ffd389') + line(x + length - 9, y - 7, x + length, y, '#ffd389') + line(x + length - 9, y + 7, x + length, y, '#ffd389');
  const circle = (x, y, r, fill, attr = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${attr}/>`;
  const atomColor = {H: '#92d6e6', O: '#e7a5b3', C: '#cabbea'};
  function molecule(unit, x, y, small = false) {
    const step = small ? 12 : 35, radius = small ? 5 : 13;
    let s = '';
    unit.forEach((symbol, i) => {
      if (i) s += line(x + (i - 1) * step, y, x + i * step, y, '#a7cbd8', small ? 2 : 4);
    });
    unit.forEach((symbol, i) => {
      s += circle(x + i * step, y, radius, atomColor[symbol], `data-atom="${symbol}"`);
      if (!small) s += `<text x="${x+i*step}" y="${y+5}" fill="#173047" text-anchor="middle" font-size="15" font-family="system-ui,sans-serif">${symbol}</text>`;
    });
    return s;
  }
  function draw(t, value, r) {
    let s = '';
    switch (t.type) {
      case 'g8-atom': {
        s = text(30, 29, 'Schematic atom · sizes and distances not to scale', 18);
        s += `<ellipse cx="200" cy="142" rx="135" ry="89" fill="#183c55" stroke="#5e839b" stroke-dasharray="5 8"/>`;
        for (const [row, key, color, label] of [[0, 'protons', '#f1c481', '+'], [1, 'neutrons', '#92c8cb', '0']]) {
          for (let i = 0; i < r[key]; i++) {const x = 145 + i % 4 * 28, y = 105 + row * 47 + Math.floor(i / 4) * 22;s += circle(x, y, 10, color, `data-subatomic="${key}"`) + `<text x="${x}" y="${y+5}" text-anchor="middle" fill="#173047" font-size="14">${label}</text>`;}
        }
        for (let i = 0; i < r.electrons; i++) {const a = i / r.electrons * Math.PI * 2, x = 200 + Math.cos(a) * 119, y = 142 + Math.sin(a) * 71;s += circle(x, y, 9, '#c4adef', 'data-subatomic="electrons"') + line(x-4, y, x+4, y, '#173047', 2);}
        s += text(365, 93, `${r.protons} protons (+)`, 19) + text(365, 129, `${r.neutrons} neutrons (0)`, 19) + text(365, 165, `${r.electrons} electrons (−)`, 19) + text(365, 207, `Net charge: ${r.charge > 0 ? '+' : ''}${r.charge}`, 19);
        s += text(30, 266, 'Boundary marks a region, not an electron orbit.', 18); break;
      }
      case 'g8-labels':
        s = text(30, 28, 'Audit the proposed particle labels', 20);
        for (const [i, [name, charge, location]] of [['Proton', r.protonCharge, 'Nucleus'], ['Neutron', '0', 'Nucleus'], ['Electron', r.electronCharge, r.electronRegion]].entries()) {
          const y = 55 + i * 57;s += rect(30, y, 540, 48, r.success ? '#295a54' : '#284c65') + text(48, y+31, name) + text(222, y+31, charge, 23) + text(300, y+31, location, 18);
        }
        s += text(30, 267, r.success ? 'All three charge/location records agree.' : 'Proposed record: check charge and location.', 18); break;
      case 'g8-sample':
        s = text(30, 28, r.label, 20) + rect(50, 48, 500, 168, '#1c4158');
        r.units.forEach((unit, i) => {s += molecule(unit, 140 + i % 2 * 240 - (unit.length-1)*17, 93 + Math.floor(i/2)*73);});
        s += text(30, 246, `Classification: ${r.classification}`, 20) + text(30, 270, 'Connected symbols form one displayed molecule.', 17); break;
      case 'g8-ratio':
        s = text(30, 32, 'Read one formula and its bonded atom group', 20) + molecule(r.units[0], 240 - (r.units[0].length-2)*17, 120);
        s += text(215, 196, {peroxide: 'H₂O₂', water: 'H₂O', oxygen: 'O₂'}[value], 32) + text(30, 263, r.metric, 21); break;
      case 'g8-state':
        s = text(30, 28, `${value[0].toUpperCase()+value.slice(1)} · twelve equal-size particle markers`, 20) + rect(80, 47, 440, 181, '#1c4158');
        for (let i = 0; i < 12; i++) {const x = value === 'gas' ? 115 + i%4*122 + i%3*8 : 185 + i%4*48 + (value === 'liquid' ? i%3*7 : 0), y = value === 'gas' ? 75 + Math.floor(i/4)*66 + i%2*6 : value === 'solid' ? 112 + Math.floor(i/4)*38 : 141 + Math.floor(i/4)*29;s += circle(x, y, 9, '#91dfd1', `data-kind="particle" class="${value==='solid'?'vibrating':'floating'}" style="animation-delay:-${i*.17}s"`);}
        s += text(30, 265, value === 'solid' ? 'Vibrates around fixed positions' : value === 'liquid' ? 'Close particles can slide past one another' : 'Large empty model gaps; moving particles', 18); break;
      case 'g8-diffusion':
        s = text(30, 28, 'Twelve tracers · other medium particles not drawn', 18) + rect(50, 50, 500, 173, '#1c4158');
        for (let i = 0; i < 12; i++) {const spread = r.spread, x = spread === 0 ? 83+i%3*20 : spread === 1 ? 83+i%4*46+i%2*5 : 80+i%4*140+i%3*9, y = 78+Math.floor(i/(spread===0?3:4))*(spread===0?32:54)+i%2*7;s += circle(x, y, 7, '#e6b9ed', 'data-kind="tracer"');}
        s += text(30, 264, value === 'start' ? 'Before spreading · concentrated at the left' : value === 'liquid' ? 'Liquid snapshot · partial spreading' : 'Gas snapshot · greater spreading', 18); break;
      case 'g8-ice': {
        const top = value === 'compressed' ? 129 : 75, bottom = value === 'compressed' ? 193 : 211;
        s = text(30, 28, 'Before: liquid water', 20) + text(324, 28, 'Proposed freezing record', 18) + rect(35, 94, 217, 107, '#1c4158') + rect(335, top, 217, bottom-top, '#1c4158');
        for (let i=0;i<6;i++) {s += molecule(['H','O','H'], 57+i%3*67, 122+Math.floor(i/3)*48, true);s += molecule(value==='changed'?['O']:['H','O','H'], 357+i%3*67, top+23+Math.floor(i/3)*(bottom-top-46), true);}
        s += arrow(268, 147, 45) + text(30, 244, 'Small markers: H (blue), O (pink); bonds shown', 17) + text(30, 270, r.success ? 'Same water molecules; more open ice structure' : 'This proposal is inconsistent with freezing.', 18); break;
      }
      case 'g8-density':
        s = text(30, 28, 'Density = mass ÷ volume', 21) + text(51, 65, 'Cargo', 17) + text(168, 65, 'Mass', 17) + text(293, 65, 'Volume', 17) + text(449, 65, 'g/cm³', 17);
        for (const [i, [name, mass, volume, density, key]] of [['A',100,50,2,'small'],['B',80,100,.8,'light'],['C',200,100,2,'large']].entries()) {const y=78+i*49;s += rect(30,y,540,41,key===value?'#386c69':'#25485f')+text(58,y+28,name)+text(170,y+28,`${mass} g`,18)+text(293,y+28,`${volume} cm³`,18)+text(464,y+28,density,18);}
        s += text(30, 269, 'Brief: below 1 g/cm³ · invented cargo values', 18); break;
      case 'g8-expansion': {
        const radius = r.diameter*64;
        s = text(30, 28, 'Ball cross-section and fixed ring opening', 20) + circle(245, 137, radius, '#305b70');
        s += `<circle cx="245" cy="137" r="64" fill="none" stroke="#ffd389" stroke-width="3" stroke-dasharray="6 5"/>`;
        for(let i=0;i<12;i++)s += circle(245+(i%4-1.5)*26*r.diameter,137+(Math.floor(i/4)-1)*30*r.diameter,6,'#a7dfd6','data-kind="metal-atom"');
        s += text(355, 111, 'Gold: fixed ring', 17) + text(355, 148, '12 equal markers', 17) + text(355, 185, value==='warm'?'Warmer: no clearance':value==='cool'?'Cooler: clearance':'Reference: clearance',17);
        s += text(30, 264, 'Particle size/count unchanged; effect exaggerated.', 18); break;
      }
      case 'g8-pressure':
        s = text(30, 27, 'Supply', 20) + text(325, 27, 'Fixed-volume chamber', 20) + rect(30, 50, 230, 166, '#1c4158') + rect(325, 50, 245, 166, '#1c4158') + arrow(273, 132, 38);
        for(let i=0;i<r.supplyCount;i++)s += circle(53+i%6*36,82+Math.floor(i/6)*47,6,'#91dfd1','data-location="supply"');
        for(let i=0;i<r.chamberCount;i++)s += circle(348+i%6*39,82+Math.floor(i/6)*47,6,'#91dfd1','data-location="chamber" class="floating"');
        s += text(30, 243, `Supply: ${r.supplyCount} · chamber: ${r.chamberCount} · total: 18`, 19) + text(30, 269, `Same temperature · pressure index ${r.pressureIndex} (target 2)`, 18); break;
      case 'g8-change':
      case 'g8-ledger':
      case 'g8-decompose': {
        const proposed = t.type === 'g8-ledger';
        s = text(30, 28, 'Before: starting substances', 18) + text(335, 28, proposed?'Proposed products':'After: process record',18);
        r.before.forEach((unit,i)=>{s += molecule(unit,91,79+i*58);});r.after.forEach((unit,i)=>{s += molecule(unit,391,79+i*58);});s += arrow(259,137,66);
        const foot = t.type==='g8-ledger' ? r.success?'Atoms conserved; molecules rearranged':value==='missing'?'Reject: H atoms missing':'Reject: carbon was not in the reactants' : t.type==='g8-decompose' ? r.success?'Chemical change: 2 H₂O → 2 H₂ + O₂':'Physical process: H₂O identity retained' : r.success?'Reactants: C + O₂ · product: CO₂':'Physical state change: H₂O stays H₂O';
        s += text(30,243,foot,18) + text(30,269,'H = hydrogen · O = oxygen · C = carbon',17); break;
      }
      default: s = text(30,130,'Read the recorded observations below.',20);
    }
    return s;
  }
  return {draw};
});
