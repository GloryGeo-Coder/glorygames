// Serialized by Playwright: all referenced values belong to the test page.
function readGrimeTarget() {
  const score = Number(document.getElementById('scoreValue')?.textContent);
  const bossWidth = parseFloat(document.getElementById('bossFill')?.style.width);
  if (!Number.isFinite(score) || !Number.isFinite(bossWidth)) throw Error('Gameplay HUD values are unavailable');
  const hazard = (window.__arcadePaints || []).find(p => p.src.includes('grime-atlas') && p.y > 10 && p.w >= 40) || null;
  return { hazard, score, bossWidth };
}
// Select only targets whose centres are not covered by a higher-priority sprite.
function readSortTarget({mapping, binArt}) {
  const paints = window.__arcadePaints || [];
  const covers = (paint, x, y) => Math.abs(paint.x-x) <= paint.w/2+4 && Math.abs(paint.y-y) <= paint.h/2+4;
  const grime = paints.filter(p => p.src.includes('grime-atlas'));
  for (let i=paints.length-1;i>=0;i--) {
    const item = paints[i], category = mapping[item.src.split('/').at(-1)];
    if (![44,50].includes(item.w) || item.y<=35 || !category) continue;
    if (grime.some(p => covers(p,item.x,item.y))) continue;
    if (paints.slice(i+1).some(p => [44,50].includes(p.w) && covers(p,item.x,item.y))) continue;
    const bin = paints.find(p => p.w===28 && p.src.endsWith('/'+binArt[category]));
    if (!bin || grime.some(p => covers(p,bin.x,bin.y))) continue;
    return {item,bin};
  }
  return null;
}
module.exports = { readGrimeTarget, readSortTarget };
