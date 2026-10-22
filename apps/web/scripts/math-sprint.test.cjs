const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const L=require('../public/games/math-sprint-arena/learning-data.js'),A=require('../public/games/math-sprint-arena/arena-audio.js');
const root=path.resolve(__dirname,'../public/games/math-sprint-arena');
function complete(p,s,assist=false){while(s.index<5){const t=L.current(s);if(assist)L.hint(s);assert.equal(L.submit(s,t.answer).ok,true);assert.equal(L.advance(p,s),true);}}
test('Number City contains 200 authored Adventure and alternate activities with grade, skill, unique IDs, explanations and three hints',()=>{
 assert.equal(L.missions.length,20);const ids=[];for(const m of L.missions){assert.equal(m.grade,4);assert.equal(m.tasks.length,5);assert.ok(m.skill&&m.story&&m.lesson);assert.ok(fs.existsSync(path.join(root,'assets/backgrounds',`bg-${m.background}.png`)));for(const t of [...m.tasks,...m.practice]){ids.push(t.id);assert.ok(L.rational(t.answer),t.id);assert.equal(t.hints.length,3);assert.equal(new Set(t.hints).size,3);assert.ok(t.explanation.length>35);assert.ok(t.worked.length>4);}}
 assert.equal(new Set(ids).size,200);
});
test('generated mathematical statements, currency and visual models have correct answers',()=>{
 for(const m of L.missions)for(const t of [...m.tasks,...m.practice]){if(t.kind==='place')assert.equal(Number(t.answer),t.value);if(t.kind==='line')assert.equal(Number(t.answer),t.a+t.b);if(t.kind==='entry')assert.equal(Number(t.answer),t.op==='+'?t.a+t.b:t.a-t.b);if(t.kind==='array')assert.equal(Number(t.answer),t.groups*t.each);if(t.kind==='share')assert.equal(Number(t.answer)*t.groups,t.total);if(t.kind==='fraction')assert.equal(t.answer,`${t.take}/${t.parts}`);if(t.kind==='perimeter')assert.equal(Number(t.answer),2*(t.length+t.width));}
 assert.deepEqual(L.missions[7].tasks.map(t=>t.answer),['25.00','12.50','25.00','15.00','28.00']);assert.deepEqual(L.missions[6].tasks.map(t=>t.answer),['28','75','225','48','40']);
});
test('answer comparison uses exact rational equivalence, including decimals, fractions and decimal commas',()=>{
 for(const[a,b]of [['1/3','2/6'],['2/4','0.5'],['12,50','12.5'],['1 200','1200'],['-0.25','-1/4'],['1/-2','-0.5'],['26.0','26']])assert.ok(L.equivalent(a,b));
 for(const bad of ['',null,'1/0','NaN','Infinity','1e3','1,000,00','1/2/3','1+1','<script>','0.333333333333333333333333333333'])assert.equal(L.rational(bad),null);
 assert.equal(L.equivalent('0.333333','1/3'),false);assert.equal(L.equivalent('0.1','0.100001'),false);
});
test('mistakes and hints are recoverable and saved; assisted answers cannot be labelled independent',()=>{
 const p=L.normalize(null),s=L.fresh();assert.equal(L.advance(p,s),false);assert.equal(L.submit(s,'').empty,true);assert.equal(s.steps[0].mistakes,0);assert.equal(L.submit(s,'999').ok,false);assert.equal(s.index,0);assert.ok(L.hint(s));assert.ok(L.hint(s));assert.equal(s.steps[0].hints,2);
 p.sessions.adventure=s;const restored=L.normalize(JSON.parse(JSON.stringify(p))).sessions.adventure;assert.deepEqual(restored,s);const r=L.submit(restored,L.current(restored).answer);assert.equal(r.independent,false);assert.equal(L.submit(restored,L.current(restored).answer).ignored,true);assert.equal(L.advance(p,restored),true);assert.equal(L.advance(p,restored),false);assert.equal(restored.index,1);
});
test('all twenty Adventure missions unlock in order; all 100 successes are required and completion is idempotent',()=>{
 const p=L.normalize(null);for(let i=0;i<20;i++){assert.equal(L.unlocked(p),i);const s=L.fresh('adventure',i);assert.equal(L.advance(p,s),false);complete(p,s);assert.equal(s.index,5);assert.deepEqual(p.results[L.missions[i].id],{independent:5,assisted:0});assert.equal(L.advance(p,s),false);}assert.equal(Object.keys(p.results).length,20);assert.deepEqual(L.normalize(p),p);
});
test('Learn permits any mission without unlocking Adventure or changing independent results',()=>{
 const p=L.normalize(null),s=L.fresh('learn',9);complete(p,s,true);assert.equal(L.unlocked(p),0);assert.deepEqual(p.results,{});assert.equal(L.stars({independent:5}),3);assert.equal(L.stars({independent:3}),2);assert.equal(L.stars({independent:0}),1);
});
test('replaying with support preserves a better previous result; improvement replaces the earlier result',()=>{
 const p=L.normalize(null);complete(p,L.fresh(),true);assert.equal(p.results['place-power'].independent,0);complete(p,L.fresh());assert.equal(p.results['place-power'].independent,5);complete(p,L.fresh(),true);assert.equal(p.results['place-power'].independent,5);
});
test('corrupt, future and locked saves are bounded without inventing completion or touching Sprint keys',()=>{
 for(const raw of [null,[],42,{version:9},{version:1,results:{'city-champion':{independent:5,assisted:0}}}])assert.equal(L.unlocked(L.normalize(raw)),0);
 const p=L.normalize(null);p.sessions.adventure=L.fresh('adventure',9);assert.equal(L.normalize(p).sessions.adventure,null);p.sessions.learn=L.fresh('learn',9);assert.ok(L.normalize(p).sessions.learn);
 for(const change of [{index:6},{draft:'x'.repeat(25)},{steps:[]},{mission:-1},{mode:'unknown'},{index:5},{feedback:'<img>'}])assert.equal(L.valid({...L.fresh(),...change}),false);
 p.settings={music:8,sfx:-3};assert.deepEqual(L.normalize(p).settings,{music:1,sfx:0});
 const best=fs.readFileSync(path.join(root,'game.js'),'utf8');assert.match(best,/wga_math_sprint_arena_v3_best/);assert.match(best,/wga_math_sprint_arena_v4_sprint/);
});
test('every learning and Sprint level has an original distinct melody and named arrangement',()=>{
 assert.equal(A.themes.length,73);assert.equal(new Set(A.themes.map(t=>t.title)).size,73);assert.equal(new Set(A.themes.map(t=>JSON.stringify(t.notes))).size,73);for(const t of A.themes){assert.equal(t.notes.length,16);assert.equal(t.rhythm.length,16);assert.ok(t.bpm>=80&&t.bpm<=140);}
});
test('unavailable audio does not block play, and pause clears scheduled timers',()=>{
 for(const env of [{setInterval,clearInterval},{setInterval,clearInterval,AudioContext:class{constructor(){throw Error('blocked');}}}]){const a=A.create(env);assert.doesNotThrow(()=>{a.start(0);a.effect('correct');a.volume('music',0);a.pause();a.dispose();});assert.equal(a.available,false);}
});
test('all shipped local HTML, CSS, JS asset references exist and production copy matches coverage',()=>{
 const files=['index.html','learning.css','game.js','learning-ui.js'];for(const name of files){const s=fs.readFileSync(path.join(root,name),'utf8');for(const m of s.matchAll(/(?:["'`(])(\.\/assets\/[a-zA-Z0-9_./-]+\.(?:png|webp))/g))assert.ok(fs.existsSync(path.join(root,m[1])),`${name}: ${m[1]}`);}
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.match(html,/selected Grade 4 CAPS skills/);assert.match(html,/52 Sprint Levels/);assert.doesNotMatch(html,/maximum-scale|user-scalable=no/);
});
const {boot}=require('./helpers/math-runtime.cjs');
test('Sprint retains all 52 levels and every sampled answer set has exactly one mathematically correct choice',async()=>{
 const r=await boot(),p=r.probe;assert.equal(p.LEVEL_COUNT,52);assert.equal(r.initialRequests,0);assert.ok(r.requests.length>10);for(const ref of r.requests)assert.ok(fs.existsSync(path.join(root,ref)),ref);
 const triangleAnswers=new Set();for(let level=1;level<=52;level++){p.state.level=level;for(let n=0;n<40;n++){p.generateQuestion();assert.equal(p.state.options.length,4);assert.equal(p.state.options.filter(v=>L.equivalent(v,p.state.question.answer)).length,1,`${level}: ${p.state.options}`);assert.ok(p.state.question.text.length<200);assert.doesNotMatch(p.state.question.text,/0\.333333|0\.666666/);if(level===40)triangleAnswers.add(p.state.question.answer);}}assert.ok(triangleAnswers.size>5);
});
test('all 260 Sprint questions can be played to victory and final bonus is included in the preserved best score',async()=>{
 const r=await boot(),p=r.probe;p.startGame();for(let level=1;level<=52;level++){assert.equal(p.state.level,level);for(let round=0;round<5;round++){assert.equal(p.state.round,round);p.chooseAnswer(p.state.question.answer);p.update(.7);}if(level<52){assert.equal(p.state.paused,true);p.startGame();}}
 assert.equal(Object.keys(p.state.levelResults).length,52);assert.equal(p.state.paused,true);assert.equal(Number(r.saved.get('wga_math_sprint_arena_v3_best')),p.state.score);assert.match(r.elements.get('overlayTitle').textContent,/Arena Champion/);
 const restored=await boot({saved:r.saved});assert.match(restored.elements.get('startBtn').textContent,/Play Again/);
});
test('Sprint refresh restores the exact question, score, round and pending transition; Continue does not reroll',async()=>{
 const saved=new Map([['wga_math_sprint_arena_v3_best','12345']]),r=await boot({saved}),p=r.probe;p.startGame();p.chooseAnswer(p.state.question.answer);const q=JSON.stringify(p.state.question),score=p.state.score;p.saveSprint();
 const restored=await boot({saved}),a=restored.probe;assert.equal(a.state.best,12345);assert.equal(a.state.score,score);assert.equal(JSON.stringify(a.state.question),q);assert.equal(a.state.answered,true);assert.equal(a.pending.kind,'round');a.startGame();assert.equal(JSON.stringify(a.state.question),q);a.update(.7);assert.equal(a.state.round,1);assert.equal(a.state.answered,false);
 const next=JSON.stringify(a.state.question);restored.elements.get('pauseBtn').click();a.update(10);assert.equal(JSON.stringify(a.state.question),next);a.startGame();assert.equal(JSON.stringify(a.state.question),next);
});
test('Skip changes the question without advancing the round or unlocking a level',async()=>{
 const r=await boot(),p=r.probe;p.startGame();p.state.score=200;for(let i=0;i<15;i++)p.skip();assert.equal(p.state.round,0);assert.equal(p.state.level,1);assert.equal(p.state.score,0);assert.deepEqual(Object.keys(p.state.levelResults),[]);p.chooseAnswer(p.state.question.answer);const score=p.state.score;p.skip();assert.equal(p.state.score,score);
});
test('wrong answers, timeout, background pause and mode changes cannot leak transitions into learning',async()=>{
 const r=await boot(),p=r.probe;p.startGame();p.chooseAnswer(-99);assert.equal(p.state.lives,2);r.window.MathSprintLegacy.leave();r.document.body.dataset.view='learn';p.update(20);assert.equal(p.state.answered,true);assert.equal(p.state.round,0);
 r.document.body.dataset.view='sprint';await r.window.MathSprintLegacy.enter();p.startGame();p.update(1);assert.equal(p.state.answered,false);p.state.timeLeft=.01;p.update(.1);assert.equal(p.state.timeLeft,0);p.saveSprint();const reload=await boot({saved:r.saved});assert.equal(reload.probe.state.lives,1);reload.probe.startGame();reload.probe.update(1);assert.equal(reload.probe.state.round,1);
 reload.window.MathSprintLegacy.pauseForVisibility();assert.equal(reload.probe.state.paused,true);assert.match(reload.elements.get('overlayTitle').textContent,/Paused/);
});
test('blocked storage and failed assets keep Sprint playable with safe fallbacks',async()=>{
 const r=await boot({failStorage:true,failAssets:true});assert.doesNotThrow(()=>{r.probe.startGame();r.probe.draw();r.probe.chooseAnswer(r.probe.state.question.answer);r.probe.update(1);r.probe.saveSprint();});assert.equal(r.probe.state.round,1);
});
test('refresh during the final failed-answer delay retains the best score and offers a safe restart',async()=>{
 const r=await boot(),p=r.probe;p.startGame();p.chooseAnswer(p.state.question.answer);p.update(1);p.state.lives=1;p.chooseAnswer(-99);const score=p.state.score;assert.equal(p.pending.kind,'over');const restored=await boot({saved:r.saved});assert.equal(restored.probe.state.best,score);assert.equal(Number(r.saved.get('wga_math_sprint_arena_v3_best')),score);assert.equal(restored.elements.get('startBtn').textContent,'Restart');restored.probe.startGame();assert.equal(restored.probe.state.lives,3);assert.equal(restored.probe.state.round,0);
});
const crypto=require('node:crypto');
test('v4.0 first 50 questions and first 62 music arrangements are exactly preserved',()=>{
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(L.missions.slice(0,10).flatMap(m=>m.tasks))).digest('hex'),'d3d29a721bbc709a6422368a584a8296ce0cc860729110e51f37c92453484e9c');
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(A.themes.slice(0,62))).digest('hex'),'42d941f9a02cca4c7cbf577bafbab0494ed69ce7c722f7c0fa201cfa85ca1cb7');
 for(let i=0;i<10;i++)assert.equal(L.missions[i].music,i);for(let i=10;i<20;i++)assert.equal(L.missions[i].music,62+i-10);
});
test('complete and partial v4.0 profiles migrate without invented results or lost drafts, hints and settings',()=>{
 const old={version:1,results:{},sessions:{adventure:null,learn:null},activeMode:'adventure',settings:{music:.2,sfx:.5}};for(const m of L.missions.slice(0,10))old.results[m.id]={independent:3,assisted:2};
 const session={mode:'adventure',mission:9,index:5,steps:Array.from({length:5},()=>({done:true,mistakes:0,hints:0})),draft:'',feedback:''};old.sessions.adventure=session;const p=L.normalize(old);assert.deepEqual(p.results,old.results);assert.deepEqual(p.sessions.adventure,session);assert.deepEqual(p.settings,old.settings);assert.equal(L.unlocked(p),10);assert.equal(p.results['shape-workshop'],undefined);
 old.sessions.adventure={mode:'adventure',mission:8,index:2,steps:Array.from({length:5},(_,i)=>({done:i<2,mistakes:i===2?2:0,hints:i===2?1:0})),draft:'2/6',feedback:'hint'};const restored=L.normalize(old);assert.deepEqual(restored.sessions.adventure,old.sessions.adventure);assert.equal(L.current(restored.sessions.adventure).id,'fraction-bridge-3');assert.equal(L.current(restored.sessions.adventure).answer,'4/6');
});
test('all twenty alternate practice sets complete independently without unlocking Adventure',()=>{
 const p=L.normalize(null);for(let mission=0;mission<20;mission++){const s=L.fresh('learn',mission,1);assert.equal(L.current(s).id,`${L.missions[mission].id}-practice-1`);p.sessions.learn=s;const restored=L.normalize(p).sessions.learn;assert.equal(restored.bank,1);complete(p,restored);assert.equal(restored.index,5);}assert.equal(L.unlocked(p),0);assert.deepEqual(p.results,{});assert.equal(Object.keys(p.review).length,100);
});
test('mirror masks reflect each row correctly, tiled areas match equal squares and tallies are unambiguous',()=>{
 for(const t of L.allTasks){if(t.kind==='mirror'){const expected=t.source.reduce((sum,on,i)=>sum+(on?2**(Math.floor(i/2)*2+1-i%2):0),0);assert.equal(Number(t.answer),expected);assert.ok(expected>0&&expected<64);}
 if(t.kind==='tile'){assert.equal(Number(t.answer),t.rows*t.columns);assert.ok(t.rows>=1&&t.rows<=3&&t.columns>=1&&t.columns<=5);}
 if(t.kind==='tally'){assert.ok(t.counts.every(n=>n>0&&n<=9));const n=Number(t.answer);assert.deepEqual([n%100,Math.floor(n/100)%100,Math.floor(n/10000)%100],t.counts);assert.ok(t.counts.reduce((a,b)=>a+b,0)<=15);}}
});
test('ruler lengths, mass conversions, liquid scales and clock intervals have consistent units and answers',()=>{
 for(const t of L.allTasks){if(t.kind==='ruler'){assert.ok(t.start>=0&&t.end<=t.max&&t.end>t.start);assert.equal(Number(t.answer),t.end-t.start);}
 if(t.kind==='mass')assert.equal(Number(t.answer),t.kg*1000+t.grams);
 if(t.kind==='jug'){assert.ok(t.fill>0&&t.fill<=t.capacity);assert.equal(t.fill%t.step,0);assert.equal(t.capacity%t.step,0);assert.equal(Number(t.answer),t.fill);}
 if(t.kind==='elapsed'){assert.ok(t.start>=0&&t.end<1440&&t.end>t.start);assert.equal(Number(t.answer),t.end-t.start);}}
});
test('every bar/picture question matches its supplied counts and every shape choice has one valid answer',()=>{
 for(const t of L.allTasks){if(t.kind==='chart'){assert.equal(t.values.length,t.labels.length);assert.ok(t.values.every(Number.isInteger));const q=t.query,expected=q.kind==='value'?t.values[q.a]:q.kind==='total'?t.values.reduce((a,b)=>a+b,0):q.kind==='difference'?t.values[q.a]-t.values[q.b]:t.values[q.a]+t.values[q.b];assert.equal(Number(t.answer),expected);assert.ok(expected>=0);}
 if(t.kind==='choice'){assert.equal(new Set(t.options.map(o=>o.value)).size,t.options.length);assert.equal(t.options.filter(o=>L.equivalent(o.value,t.answer)).length,1);}}
});
test('revision prioritises support needs, mixes practised topics and never changes Adventure results',()=>{
 const p=L.normalize(null);for(let i=0;i<20;i++)complete(p,L.fresh('adventure',i));const reviewBefore=JSON.stringify(p.results),retry=L.fresh('learn',17);L.hint(retry);L.submit(retry,L.current(retry).answer);L.advance(p,retry);
 const s=L.freshReview(p);assert.equal(L.taskAt(s.plan[0]).id,'survey-square-1');assert.ok(new Set(s.plan.map(r=>r.mission)).size>=4);assert.equal(new Set(s.plan.map(r=>L.taskAt(r).id)).size,5);assert.equal(L.music(s),72);
 p.sessions.revision=s;L.hint(s);s.draft='123';const loaded=L.normalize(JSON.parse(JSON.stringify(p)));assert.deepEqual(loaded.sessions.revision,s);complete(p,s);assert.equal(JSON.stringify(p.results),reviewBefore);assert.equal(p.review['survey-square-1'].lastSupported,true);
 const independent=L.freshReview(p);L.submit(independent,L.current(independent).answer);const id=L.current(independent).id;L.advance(p,independent);assert.equal(p.review[id].lastSupported,false);assert.equal(JSON.stringify(p.results),reviewBefore);
});
test('unfinished and duplicate revision transitions cannot inflate history or erase an Adventure checkpoint',()=>{
 const p=L.normalize(null),adventure=L.fresh();adventure.draft='3000';p.sessions.adventure=adventure;const s=L.freshReview(p);assert.equal(L.advance(p,s),false);L.submit(s,L.current(s).answer);assert.equal(L.advance(p,s),true);const history=JSON.stringify(p.review);assert.equal(L.advance(p,s),false);assert.equal(JSON.stringify(p.review),history);assert.equal(p.sessions.adventure.draft,'3000');
});
test('invalid review plans, unknown history IDs and invalid bank values do not corrupt valid saved progress',()=>{
 const p=L.normalize(null);complete(p,L.fresh());const expected=JSON.stringify(p.results),good=L.freshReview(p);for(const plan of [[...good.plan.slice(0,4),good.plan[0]],[...good.plan.slice(0,4),{mission:99,bank:0,index:0}],[...good.plan.slice(0,4),{mission:0,bank:2,index:0}]]){p.sessions.revision={...good,plan};const restored=L.normalize(p);assert.equal(restored.sessions.revision,null);assert.equal(JSON.stringify(restored.results),expected);}
 p.review.unknown={independent:1,assisted:0,lastSupported:false};assert.equal(L.normalize(p).review.unknown,undefined);assert.equal(L.valid({...L.fresh(),bank:1}),false);assert.equal(L.valid({...L.fresh('learn'),bank:2}),false);
});
function toolHarness(){
 const vm=require('node:vm');class Element{constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.style={setProperty(k,v){this[k]=String(v);}};this.dataset={};this.textContent='';this.events={};}setAttribute(k,v){this.attrs[k]=String(v);}append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items;}addEventListener(k,v){this.events[k]=v;}click(){this.events.click?.();}}
 const document={createElement:t=>new Element(t),createElementNS:(_,t)=>new Element(t)},window={};vm.runInNewContext(fs.readFileSync(path.join(root,'learning-tools.js'),'utf8'),{document,window});return {tools:window.MathLearningTools,Element};
}
test('survey, scale, clock and graph renderers match the authored mathematical data',()=>{
 const {tools,Element}=toolHarness();for(const t of L.allTasks.filter(t=>['ruler','mass','jug','elapsed','tally','chart'].includes(t.kind))){const v=new Element('div');assert.equal(tools.draw(t,v),true);assert.ok(v.children.length>0);
  if(t.kind==='ruler')assert.match(v.children[0].innerHTML,new RegExp(`width="${(t.end-t.start)*25}"`));
  if(t.kind==='jug')assert.match(v.children[0].attrs['aria-label'],new RegExp(`Water level: ${t.fill} mL`));
  if(t.kind==='tally')assert.equal(v.children[0].children.length,t.counts.reduce((a,b)=>a+b,0));
  if(t.kind==='chart'&&!t.pictograph){const max=Math.ceil(Math.max(...t.values)/2)*2,plot=v.children[0].children[1];for(let i=0;i<3;i++)assert.equal(plot.children[i].children[0].style.height,`${t.values[i]/max*100}%`);}
  if(t.kind==='chart'&&t.pictograph)for(let i=0;i<3;i++)assert.equal(v.children[0].children[i].children[1].textContent.length,t.values[i]);
 }
});
test('new interactive activities can be submitted through their real shape, mirror, tile and tally models',()=>{
 const {tools,Element}=toolHarness();for(const mission of L.missions.slice(10))for(const [bank,tasks]of [[0,mission.tasks],[1,mission.practice]])for(const [index,t]of tasks.entries()){
  if(!['choice','mirror','tile','tally'].includes(t.kind))continue;const s=L.fresh('learn',mission.number-1,bank);s.index=index;for(let j=0;j<index;j++)s.steps[j].done=true;const panel=new Element('div');assert.equal(tools.renderResponse(t,s,{panel,onChange:v=>s.draft=String(v),effect(){}}),true);
  if(t.kind==='choice')panel.children[0].children.find(b=>String(b.dataset.choice)===t.answer).click();
  if(t.kind==='mirror')for(const b of panel.children[0].children)if(b.tag==='button'&&(Number(t.answer)&(1<<Number(b.dataset.bit))))b.click();
  if(t.kind==='tile')for(const b of panel.children[0].children)b.click();
  if(t.kind==='tally')for(let i=0;i<3;i++){const plus=panel.children[0].children[i].children[2];for(let n=0;n<t.counts[i];n++)plus.click();}
  assert.equal(L.submit(s,s.draft).ok,true,t.id);
 }
});
test('revision rotates through all previously completed topics rather than trapping older saves in the first five',()=>{
 const old={version:1,results:{}};for(const m of L.missions)old.results[m.id]={independent:5,assisted:0};const p=L.normalize(old),seen=new Set();for(let round=0;round<4;round++){const s=L.freshReview(p);s.plan.forEach(r=>seen.add(r.mission));complete(p,s);}assert.equal(seen.size,20);
});
test('metadata advertises only the implemented Grade 4 scope and exact activity/music counts',()=>{
 const meta=JSON.parse(fs.readFileSync(path.join(root,'game.json'))).features;assert.equal(meta.learningMissions,L.missions.length);assert.equal(meta.learningActivities,L.missions.reduce((n,m)=>n+m.tasks.length,0));assert.equal(meta.alternatePracticeActivities,L.missions.reduce((n,m)=>n+m.practice.length,0));assert.equal(meta.activityBankTotal,L.allTasks.length);assert.equal(meta.originalMusicArrangements,A.themes.length);assert.equal(meta.learningGrade,4);assert.equal(meta.originalLevelArrangements,meta.learningMissions+meta.sprintLevels);
});
