// Serialized by Playwright: all referenced values belong to the test page.
function readGrimeTarget() {
  const score = Number(document.getElementById('scoreValue')?.textContent);
  const bossWidth = parseFloat(document.getElementById('bossFill')?.style.width);
  if (!Number.isFinite(score) || !Number.isFinite(bossWidth)) throw Error('Gameplay HUD values are unavailable');
  const canvas=document.getElementById('gameCanvas'),rect=canvas.getBoundingClientRect();
  const visible=p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=4&&p.y>=4&&p.x<=rect.width-4&&p.y<=rect.height-4&&rect.left+p.x>=4&&rect.top+p.y>=4&&rect.left+p.x<=window.innerWidth-4&&rect.top+p.y<=window.innerHeight-4&&document.elementFromPoint(rect.left+p.x,rect.top+p.y)===canvas;
  const hazard = (window.__arcadePaints || []).find(p => p.src.includes('grime-atlas') && p.y > 10 && p.w >= 40 && visible(p)) || null;
  return { hazard, score, bossWidth };
}
// Select only targets whose centres are not covered by a higher-priority sprite.
function readSortTarget({mapping, binArt}) {
  const paints = window.__arcadePaints || [];
  const canvas=document.getElementById('gameCanvas'),rect=canvas.getBoundingClientRect();
  const visible=p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=4&&p.y>=4&&p.x<=rect.width-4&&p.y<=rect.height-4&&rect.left+p.x>=4&&rect.top+p.y>=4&&rect.left+p.x<=window.innerWidth-4&&rect.top+p.y<=window.innerHeight-4&&document.elementFromPoint(rect.left+p.x,rect.top+p.y)===canvas;

  const covers = (paint, x, y) => Math.abs(paint.x-x) <= paint.w/2+4 && Math.abs(paint.y-y) <= paint.h/2+4;
  const grime = paints.filter(p => p.src.includes('grime-atlas'));
  for (let i=paints.length-1;i>=0;i--) {
    const item = paints[i], category = mapping[item.src.split('/').at(-1)];
    if (![44,50].includes(item.w) || item.y<=35 || !category || !visible(item)) continue;
    if (grime.some(p => covers(p,item.x,item.y))) continue;
    if (paints.slice(i+1).some(p => [44,50].includes(p.w) && covers(p,item.x,item.y))) continue;
    const bin = paints.find(p => p.w===28 && p.src.endsWith('/'+binArt[category]));
    if (!bin || !visible(bin) || grime.some(p => covers(p,bin.x,bin.y))) continue;
    return {item,bin};
  }
  return null;
}
function readPromptProof() {
  const p=window.__sortPrompt;if(!p)return null;
  const canvas=document.getElementById('gameCanvas'),dpr=canvas.width/canvas.getBoundingClientRect().width;
  const x=Math.floor((p.x-(p.maxWidth+12)/2+4)*dpr),y=Math.floor((p.y-4)*dpr);
  return {fill:p.fill,x,y,canvasWidth:canvas.width,canvasHeight:canvas.height,frame:p.frame,rgba:Array.from(canvas.getContext('2d').getImageData(x,y,1,1).data)};
}
function readSortProgress() {
  const scoreText=document.getElementById('scoreValue')?.textContent;
  const objective=document.getElementById('objectiveText')?.textContent;
  const progress=objective?.match(/(?:^|: )([0-9]+)\/([0-9]+) clean sorts(?: •|$)/);
  if(!scoreText?.trim() || !Number.isFinite(Number(scoreText)) || !progress)throw Error('Sort progress HUD is unavailable');
  return {score:Number(scoreText),sorted:Number(progress[1]),target:Number(progress[2])};
}
function assertSortProgress(before,after) {
  const assert=require('node:assert/strict');
  assert.equal(after.target,before.target,'The encounter target stays unchanged');
  assert.equal(after.sorted,before.sorted+1,'Native taps complete exactly one additional clean sort');
  assert.ok(after.score>=before.score+100,'Native taps add the clean-sort points to the previous score');
}
module.exports = { readGrimeTarget, readSortTarget, readPromptProof, readSortProgress, assertSortProgress };
