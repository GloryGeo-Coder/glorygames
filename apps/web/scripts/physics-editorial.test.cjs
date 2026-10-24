const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),code=fs.readFileSync(path.join(root,'src/content/gameEditorials.ts'),'utf8'),start=code.indexOf('  "physics-force-lab": '),end=code.indexOf('  "recycle-rush": ',start),entry=JSON.parse(code.slice(start,end).replace(/^\s*"physics-force-lab": /,'').trim().replace(/,$/,'')),manifest=require('../public/games/physics-force-lab/game.json'),A=require('../public/games/physics-force-lab/adventure-data');
const R=require('../public/games/physics-force-lab/adventure-revision');
test('final public details match the actual adventure and original-lab counts',()=>{
  assert.equal(A.missions.length,30);assert.equal(manifest.features.adventureMissions,30);assert.equal(manifest.features.originalLabs,12);assert.equal(manifest.features.levels,42);assert.match(entry.summary,/30.*90.*4–10.*12/);assert.match(entry.faqs[0].a,/30.*90.*12/);
  assert.equal(R.cards.length,manifest.features.revisionConceptChecks);assert.match(entry.summary,new RegExp(R.cards.length+' revision'));assert.ok(entry.systems.some(s=>s.title==='The Revision Workshop'&&s.body.includes(String(R.cards.length))));
});
test('the final guide states controls, saves, learning scope and device support for both modes',()=>{
  const text=JSON.stringify(entry);for(const pattern of [/Space/,/interact/i,/force blast/i,/local storage/,/not the complete/,/Portrait and landscape/,/field notebook/i])assert.match(text,pattern);assert.ok(entry.story.some(t=>t.includes('Quantum Core')));assert.ok(entry.story.some(t=>t.includes('Junior Physics Guardian')));assert.ok(entry.faqs.length>=6);
});
