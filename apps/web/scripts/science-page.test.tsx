import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require=createRequire(import.meta.url);
require.extensions['.css']=(module:any)=>{module.exports=new Proxy({},{get:(_target,key)=>key==='__esModule'?false:String(key)});};
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {GAME_EDITORIALS,getGameEditorial}=require('../src/content/gameEditorials.ts');
const {GAME_CATALOG,catalogGame}=require('../src/lib/gameCatalog.ts');
const {getFallbackGameBySlug}=require('../src/lib/fallbackGames.ts');
const GameEditorial=require('../src/components/GameEditorial.tsx').default;
const PlayClient=require('../src/app/play/[slug]/play-client.tsx').default;
const A=require('../public/games/science-lab-dash/chemistry-data.js');
const manifest=JSON.parse(readFileSync('public/games/science-lab-dash/game.json','utf8'));
const slug='science-lab-dash',guide=getGameEditorial(slug);
const markup=renderToStaticMarkup(React.createElement(GameEditorial,{slug,title:manifest.title}));

test('final editorial describes the actual 35-mission adventure and the separate original mode',()=>{
 assert.equal(A.missions.length,35);assert.equal(manifest.features.investigations,105);assert.match(guide.summary,/35 untimed adventure missions and 105 investigations/);assert.match(markup,/original 20-mission/);assert.match(markup,/Grades 4–10/);assert.match(markup,/Element Core Investigator/);assert.doesNotMatch(markup,/coming soon|prototype|draft|demo|v3\./i);
 const counts=guide.faqs.find((f:any)=>f.q==='How many missions are there?').a;assert.match(counts,/35 missions and 105 investigations/);assert.match(counts,/55 missions in total/);
});
test('all seven grade descriptions and the selected-curriculum scope are rendered',()=>{
 for(const grade of [4,5,6,7,8,9,10]){assert.equal(A.missions.filter((m:any)=>m.grade===grade).length,5);assert.match(markup,new RegExp(`Grade ${grade}:`));}
 assert.match(markup,/selected CAPS chemistry topics/);assert.match(markup,/not a complete annual/);assert.match(markup,/moles, molar mass, concentration/);
});
test('story, controls, evidence rules, progress and audio descriptions match the shipped modes',()=>{
 for(const phrase of ['Story and setting','Field notebook','at least two different settings','100 points','300','5 per newly collected fragment','separate saves','not turn these local checkpoints into cloud saves','35 adventure missions has its own original music arrangement'])assert.ok(markup.includes(phrase),phrase);
 assert.match(guide.desktop.join(' '),/A\/D or Left\/Right/);assert.match(guide.desktop.join(' '),/Alt\+Enter/);assert.match(guide.desktop.join(' '),/Space fires/);assert.match(guide.mobile.join(' '),/hold the on-screen left\/right/);assert.match(markup,/untimed/);
});
test('canonical descriptions and titles replace stale database and fallback values',()=>{
 const old={id:'existing',slug,title:'Science Lab Dash',category:'ARCADE',description:'Old 20-mission description',tags:['science']};const normalized=catalogGame(old),fallback=getFallbackGameBySlug(slug);
 for(const g of [normalized,fallback]){assert.equal(g.title,manifest.title);assert.equal(g.description,guide.summary);assert.equal(g.category,'EDUCATIONAL');}assert.equal(normalized.id,'existing');assert.deepEqual(normalized.tags,['science']);
});
test('rendered launch retains the thumbnail, dedicated tab, score and sidebar chat',()=>{
 const html=renderToStaticMarkup(React.createElement(PlayClient,getFallbackGameBySlug(slug)));assert.doesNotMatch(html,/<iframe/);assert.match(html,/\/games\/science-lab-dash\/thumb.png/);assert.match(html,/href="\/games\/science-lab-dash\/index.html" target="_blank" rel="noopener noreferrer"/);assert.match(html,/Game Chat/);assert.match(html,/Live score/);
});
test('both information routes derive metadata and FAQs from the final guide and keep related games',()=>{
 for(const file of ['src/app/play/[slug]/page.tsx','src/app/games/[slug]/page.tsx']){const s=readFileSync(file,'utf8');assert.match(s,/editorial\?\.summary/);assert.match(s,/GameEditorial/);assert.match(s,/getGameEditorial/);assert.match(s,/relatedGames/);}
 const category=readFileSync('src/app/categories/[category]/page.tsx','utf8');assert.match(category,/35 chemistry missions and 105 investigations for Grades 4–10/);
});
