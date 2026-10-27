import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require=createRequire(import.meta.url);
require.extensions['.css']=(module:any)=>{module.exports=new Proxy({},{get:(_target,key)=>key==='__esModule'?false:String(key)});};
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {getGameEditorial}=require('../src/content/gameEditorials.ts');
const {catalogGame}=require('../src/lib/gameCatalog.ts');
const {getFallbackGameBySlug}=require('../src/lib/fallbackGames.ts');
const GameEditorial=require('../src/components/GameEditorial.tsx').default;
const PlayClient=require('../src/app/play/[slug]/play-client.tsx').default;
const manifest=require('../public/games/space-pilot-platformer/game.json');
const names=['asterion','vulcanis','luminara','cryon','verdantis','novax'];
const chapters=names.map(name=>require('../public/games/space-pilot-platformer/'+name+'.js'));
const slug='space-pilot-platformer',guide=getGameEditorial(slug);
const markup=renderToStaticMarkup(React.createElement(GameEditorial,{slug,title:manifest.title}));

test('the final page preserves every approved story paragraph in order',()=>{
 const roadmap=readFileSync('../../docs/space-pilot-starfall-rift-roadmap.md','utf8');
 const approved=roadmap.split('## Approved storyline\n\n')[1].split('\n## Incremental route')[0].trim().split('\n\n').map(p=>p.replaceAll('**','').replace(/\*([^*]+)\*/g,'$1'));
 assert.deepEqual(guide.story,approved);assert.match(markup,/Story and setting/);
 assert.match(markup,/Something enormous moves inside the portal/);
});
test('published counts and all six world descriptions match the implemented campaign',()=>{
 assert.equal(chapters.length,manifest.features.campaignWorlds);assert.equal(chapters.flatMap(c=>c.levels).length,manifest.features.campaignLevels);
 assert.equal(chapters.flatMap(c=>c.levels).filter(l=>l.boss).length,6);
 assert.match(guide.summary,/30.*six worlds/);assert.match(guide.faqs[0].a,/30.*six worlds.*38/);
 for(const name of ['Asterion','Vulcanis','Luminara','Cryon','Verdantis','NOVA-X'])assert.ok(markup.includes(name));
 assert.match(markup,/original eight missions/);assert.match(markup,/Final Gate/);
 assert.doesNotMatch(markup,/prototype|coming soon|draft|demo|v1\./i);
});
test('final copy explains actual controls, checkpoints, audio and finale requirements',()=>{
 for(const text of ['double jump','300 points','100 points','three gate controls','Wayfarer beacon','same browser','cloud saves','2D side-scrolling','30 campaign missions have original music'])assert.ok(markup.includes(text),text);
 assert.match(guide.desktop.join(' '),/A\/D.*Left\/Right/);assert.match(guide.desktop.join(' '),/Alt\+Enter/);assert.match(guide.desktop.join(' '),/J or E/);
 assert.match(guide.mobile.join(' '),/another finger/);assert.match(markup,/Portrait and landscape/);
});
test('stale database and fallback details use the final title and summary without changing routes',()=>{
 const old={id:'existing',slug,title:'Space Pilot Platformer',category:'ARCADE',description:'Eight missions',tags:['space']};
 for(const game of [catalogGame(old),getFallbackGameBySlug(slug)]){assert.equal(game.title,manifest.title);assert.equal(game.description,guide.summary);assert.equal(game.category,'PLATFORMER');}
 assert.equal(manifest.description,guide.summary);assert.equal(catalogGame(old).id,old.id);assert.deepEqual(catalogGame(old).tags,old.tags);
});
test('the rendered launch preserves the thumbnail, direct new tab, scores and chat',()=>{
 const html=renderToStaticMarkup(React.createElement(PlayClient,getFallbackGameBySlug(slug)));
 assert.doesNotMatch(html,/<iframe/);assert.match(html,/\/games\/space-pilot-platformer\/thumb.png/);
 assert.match(html,/href="\/games\/space-pilot-platformer\/index.html" target="_blank" rel="noopener noreferrer"/);
 assert.match(html,/Game Chat/);assert.match(html,/Live score/);
});
test('both information routes retain final metadata, FAQs and related games',()=>{
 for(const file of ['src/app/play/[slug]/page.tsx','src/app/games/[slug]/page.tsx']){
  const code=readFileSync(file,'utf8');for(const token of ['getGameEditorial','editorial?.summary','GameEditorial','relatedGames'])assert.ok(code.includes(token),file+' '+token);
 }
});
