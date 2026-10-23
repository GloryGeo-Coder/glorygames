const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const L=require('../public/games/math-sprint-arena/learning-data.js'),A=require('../public/games/math-sprint-arena/arena-audio.js');
const root=path.resolve(__dirname,'../public/games/math-sprint-arena');
function complete(p,s,assist=false){while(s.index<5){const t=L.current(s);if(assist)L.hint(s);assert.equal(L.submit(s,t.answer).ok,true);assert.equal(L.advance(p,s),true);}}
test('Grade 4–7 paths contain 800 authored Adventure and alternate activities with grade, skill, unique IDs, explanations and three hints',()=>{
 assert.equal(L.missions.length,80);const ids=[];for(const m of L.missions){assert.ok([4,5,6,7].includes(m.grade));assert.equal(m.tasks.length,5);assert.ok(m.skill&&m.story&&m.lesson);assert.ok(fs.existsSync(path.join(root,'assets/backgrounds',`bg-${m.background}.png`)));for(const t of [...m.tasks,...m.practice]){ids.push(t.id);assert.ok(L.rational(t.answer),t.id);assert.equal(t.hints.length,3);assert.equal(new Set(t.hints).size,3);assert.ok(t.explanation.length>35);assert.ok(t.worked.length>4);}}
 assert.equal(new Set(ids).size,800);
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
 assert.equal(A.themes.length,136);assert.equal(new Set(A.themes.map(t=>t.title)).size,136);assert.equal(new Set(A.themes.map(t=>JSON.stringify(t.notes))).size,136);for(const t of A.themes){assert.equal(t.notes.length,16);assert.equal(t.rhythm.length,16);assert.ok(t.bpm>=80&&t.bpm<=140);}
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
test('all 200 Grade 4 activities, first 50 questions and first 62 music arrangements are exactly preserved',()=>{
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(L.allTasks.slice(0,200))).digest('hex'),'20aedeced01525648f66c5432a9f497f1dfece194d7b8ba98520a0866bac16bf');
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
 const document={createElement:t=>new Element(t),createElementNS:(_,t)=>new Element(t)},window={};vm.runInNewContext(fs.readFileSync(path.join(root,'learning-grade6-tools.js'),'utf8'),{document,window});vm.runInNewContext(fs.readFileSync(path.join(root,'learning-grade7-tools.js'),'utf8'),{document,window});vm.runInNewContext(fs.readFileSync(path.join(root,'learning-tools.js'),'utf8'),{document,window});return {tools:window.MathLearningTools,Element};
}
test('survey, scale, clock and graph renderers match the authored mathematical data',()=>{
 const {tools,Element}=toolHarness();for(const t of L.allTasks.filter(t=>['ruler','mass','jug','elapsed','tally','chart'].includes(t.kind))){const v=new Element('div');assert.equal(tools.draw(t,v),true);assert.ok(v.children.length>0);
  if(t.kind==='ruler')assert.match(v.children[0].innerHTML,new RegExp(`width="${(t.end-t.start)*25}"`));
  if(t.kind==='jug')assert.match(v.children[0].attrs['aria-label'],new RegExp(`Water level: ${t.fill} mL`));
  if(t.kind==='tally')assert.equal(v.children[0].children.length,t.counts.reduce((a,b)=>a+b,0));
  if(t.kind==='chart'&&!t.pictograph){const max=Math.ceil(Math.max(...t.values)/2)*2,plot=v.children[0].children[1];for(let i=0;i<3;i++)assert.equal(plot.children[i].children[0].style.height,`${t.values[i]/max*100}%`);}
  if(t.kind==='chart'&&t.pictograph)for(let i=0;i<3;i++)assert.equal(v.children[0].children[i].children[1].textContent.length,t.values[i]/(t.scale||1));
 }
});
test('new interactive activities can be submitted through their real shape, mirror, tile and tally models',()=>{
 const {tools,Element}=toolHarness();for(const mission of L.missions.slice(10))for(const [bank,tasks]of [[0,mission.tasks],[1,mission.practice]])for(const [index,t]of tasks.entries()){
  if(!['choice','mirror','tile','tally'].includes(t.kind))continue;const s=L.fresh('learn',L.missions.indexOf(mission),bank);s.index=index;for(let j=0;j<index;j++)s.steps[j].done=true;const panel=new Element('div');assert.equal(tools.renderResponse(t,s,{panel,onChange:v=>s.draft=String(v),effect(){}}),true);
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
test('metadata advertises only the implemented Grade 4–7 scope and exact activity/music counts',()=>{
 const meta=JSON.parse(fs.readFileSync(path.join(root,'game.json'))).features;assert.equal(meta.learningMissions,L.missions.length);assert.equal(meta.learningActivities,L.missions.reduce((n,m)=>n+m.tasks.length,0));assert.equal(meta.alternatePracticeActivities,L.missions.reduce((n,m)=>n+m.practice.length,0));assert.equal(meta.activityBankTotal,L.allTasks.length);assert.equal(meta.originalMusicArrangements,A.themes.length);assert.deepEqual(meta.learningGrades,[4,5,6,7]);assert.equal(meta.learningMissionsPerGrade,20);assert.equal(meta.originalLevelArrangements,meta.learningMissions+meta.sprintLevels);
});

test('Grade 5 has an independent twenty-mission unlock chain and 200 activities; Grade 4 gaps do not erase it',()=>{
 const p=L.normalize(null);assert.equal(L.unlocked(p,5),20);assert.equal(L.pathMissions(5).length,20);assert.equal(L.pathMissions(4).length,20);
 for(let m=20;m<40;m++){assert.equal(L.unlocked(p,5),m);complete(p,L.fresh('adventure',m));assert.equal(L.unlocked(p,4),0);assert.equal(Object.keys(L.normalize(p).results).length,m-19);}
 assert.equal(Object.keys(p.results).length,20);assert.deepEqual(L.normalize(p).results,p.results);for(let m=0;m<20;m++)complete(p,L.fresh('adventure',m));assert.equal(Object.keys(L.normalize(p).results).length,40);
 const early=L.normalize(null);early.results[L.missions[21].id]={independent:5,assisted:0};assert.deepEqual(L.normalize(early).results,{});
});
test('every Grade 5 alternate set completes with no Adventure unlock and revision stays inside the chosen grade',()=>{
 const p=L.normalize(null);for(let m=20;m<40;m++)complete(p,L.fresh('learn',m,1),true);assert.deepEqual(p.results,{});assert.equal(L.unlocked(p,5),20);assert.equal(Object.keys(p.review).length,100);
 const g5=L.freshReview(p,5),g4=L.freshReview(p,4);assert.ok(g5.plan.every(r=>r.mission>=20));assert.ok(g4.plan.every(r=>r.mission<20));assert.equal(L.music(g5),93);assert.equal(L.music(g4),72);const before=JSON.stringify(p.results);complete(p,g5);assert.equal(JSON.stringify(p.results),before);
});
test('v4.1 results, all three checkpoints and settings survive grade switches, reloads and independent Grade 5 saves',()=>{
 const p=L.normalize(null);for(let m=0;m<20;m++)complete(p,L.fresh('adventure',m));p.sessions.adventure=L.fresh('adventure',19);p.sessions.learn=L.fresh('learn',11,1);p.sessions.learn.draft='37';p.sessions.revision=L.freshReview(p);p.settings={music:.2,sfx:.5};
 const original=JSON.stringify(p.sessions),old={...p};delete old.activeGrade;delete old.gradeSessions;const migrated=L.normalize(old);assert.equal(JSON.stringify(migrated.sessions),original);assert.deepEqual(migrated.results,p.results);assert.equal(L.unlocked(migrated,5),20);
 migrated.activeGrade=5;const sessions=L.sessionsFor(migrated,5);sessions.adventure=L.fresh('adventure',20);sessions.adventure.draft='300000';L.hint(sessions.adventure);sessions.learn=L.fresh('learn',28,1);sessions.learn.draft='3/';sessions.revision=L.freshReview(migrated,5);L.hint(sessions.revision);migrated.practiceVisits['g5-fraction-energy']=1;
 const loaded=L.normalize(JSON.parse(JSON.stringify(migrated)));assert.deepEqual(loaded,migrated);assert.equal(JSON.stringify(loaded.sessions),original);assert.equal(L.current(loaded.gradeSessions[5].learn).answer,'4/8');assert.equal(loaded.gradeSessions[5].learn.draft,'3/');assert.deepEqual(loaded.settings,{music:.2,sfx:.5});
 sessions.adventure=L.fresh('adventure',22);assert.equal(L.normalize(migrated).gradeSessions[5].adventure,null);sessions.adventure=L.fresh('adventure',0);assert.equal(L.normalize(migrated).gradeSessions[5].adventure,null);
 const bad=L.freshReview(migrated,5);bad.plan[4]={mission:0,bank:0,index:0};assert.equal(L.valid(bad),false);
});
test('Grade 5 arithmetic, place values, rounding, fractions and models agree with independent calculations',()=>{
 for(const m of L.pathMissions(5))for(const t of [...m.tasks,...m.practice]){
  if(t.kind==='placeRead')assert.equal(Number(t.answer),Math.floor(t.value/10**t.power)%10*10**t.power);
  if(t.kind==='round')assert.equal(Number(t.answer),Math.round(t.value/t.unit)*t.unit);
  if(t.kind==='product'){assert.equal(Number(t.answer),t.op==='×'?t.a*t.b:t.a/t.b);assert.ok(Number.isInteger(Number(t.answer)));if(t.op==='÷')assert.ok(t.a>=100&&t.a<=999&&t.b>=10&&t.b<=99);}
  if(t.kind==='fractionMath'){const [a,d,op,b]=t.prompt.match(/^(\d+)\/(\d+) ([+−]) (\d+)/).slice(1);assert.ok(L.equivalent(t.answer,`${op==='+'?+a+ +b:+a- +b}/${d}`));assert.ok(L.submit(L.fresh('learn',L.missions.indexOf(m),0),'' ).empty);}
  if(t.kind==='growing')assert.equal(Number(t.answer),t.values[2]+t.values[2]-t.values[1]);
  if(t.kind==='volume')assert.equal(Number(t.answer),t.rows*t.columns*t.layers);
  if(t.kind==='areaGrid')assert.equal(Number(t.answer),t.cells.flat().filter(Boolean).length);
  if(t.pictograph){assert.ok(t.scale>1);assert.ok(t.values.every(n=>Number.isInteger(n/t.scale)));}
  if(t.kind==='choice'&&t.bars?.length===2){const [a,b]=t.bars,delta=a.n*b.d-b.n*a.d;assert.equal(Number(t.answer),delta===0?3:delta>0?1:2);}
  if(t.angle!==undefined){const correct=t.angle<90?1:t.angle===90?2:t.angle<180?3:4;assert.equal(Number(t.answer),correct);}
 }
 const eq=L.missions[27];for(const t of [...eq.tasks,...eq.practice]){if(t.prompt.includes('equivalent')){const target=t.prompt.match(/to (\d+\/\d+)/)[1];assert.equal(t.options.filter(o=>L.equivalent(o.label,target)).length,1);assert.ok(L.equivalent(t.options[Number(t.answer)-1].label,target));}}
 assert.equal(L.missions[25].tasks[0].answer,'6');assert.equal(L.missions[25].practice[1].answer,'9');assert.equal(L.missions[30].tasks[1].answer,'84.50');assert.equal(L.missions[34].practice[3].answer,'6.25');
});
test('Grade 5 mathematical diagrams expose the same data as their questions, including scaled symbols and unit cubes',()=>{
 const {tools,Element}=toolHarness();for(const m of L.pathMissions(5))for(const t of [...m.tasks,...m.practice]){if(['entry','pattern','money','perimeter'].includes(t.kind))continue;const v=new Element('div');assert.equal(tools.draw(t,v),true,t.id);assert.ok(v.children.length,t.id);
  if(t.kind==='volume')assert.equal((v.children[0].innerHTML.match(/fill="#42b7b2"/g)||[]).length,Number(t.answer));
  if(t.kind==='growing')assert.equal((v.children[0].innerHTML.match(/<circle /g)||[]).length,t.values.reduce((a,b)=>a+b));
  if(t.kind==='areaGrid')assert.equal((v.children[0].innerHTML.match(/fill="#55d5c4"/g)||[]).length,Number(t.answer));
  if(t.kind==='chart'&&t.pictograph)assert.match(v.children[1].textContent,new RegExp(`Each ★ represents ${t.scale} learners`));
 }
});
test('all previous 73 musical arrangements remain unchanged and Grade 5 receives 20 mission themes and its own review theme',()=>{
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(A.themes.slice(0,73))).digest('hex'),'a34c06654b40b4c380592b429fde2cb22b141679d3dda6d7b5be9264851b5c3c');assert.deepEqual(L.pathMissions(5).map(m=>m.music),Array.from({length:20},(_,i)=>73+i));
});
test('v4.2 activity and music banks remain byte-for-byte equivalent when Grade 6 is appended',()=>{
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(L.allTasks.slice(0,400))).digest('hex'),'f7473e089c1ebe949aafd4e7104225aad26a2539be007184795915db1381e603');
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(A.themes.slice(0,94))).digest('hex'),'2fea30d1c0c4b62bc25cad49d878292fa43ac11da3f562e66459932fd6ded84b');
 assert.deepEqual(L.pathMissions(6).map(m=>m.music),Array.from({length:20},(_,i)=>94+i));assert.equal(L.music(L.freshReview(L.normalize(null),6)),114);
});
test('Grade 6 Adventure and alternate banks complete without unlocking or erasing either earlier path',()=>{
 for(const m of L.pathMissions(6))for(const tasks of [m.tasks,m.practice])assert.equal(new Set(tasks.map(({id,...content})=>JSON.stringify(content))).size,5,`${m.id}: distinct tasks within each bank`);
 const p=L.normalize(null);for(let m=40;m<60;m++){assert.equal(L.unlocked(p,6),m);complete(p,L.fresh('adventure',m));complete(p,L.fresh('learn',m,1),true);assert.equal(L.unlocked(p,4),0);assert.equal(L.unlocked(p,5),20);}
 assert.equal(Object.keys(p.results).length,20);assert.equal(Object.keys(p.review).length,200);assert.deepEqual(L.normalize(p),p);
 const results=JSON.stringify(p.results),review=L.freshReview(p,6);assert.ok(review.plan.every(r=>r.mission>=40&&r.mission<60));assert.ok(new Set(review.plan.map(r=>r.mission)).size>=4);complete(p,review);assert.equal(JSON.stringify(p.results),results);
});
test('Grade 4 and Grade 5 saves migrate with exact drafts, hints, reviews and results while Grade 6 starts independently',()=>{
 const p=L.normalize(null);for(let m=0;m<40;m++)complete(p,L.fresh('adventure',m));p.sessions.adventure=L.fresh('adventure',0);p.sessions.adventure.draft='3000';L.hint(p.sessions.adventure);p.gradeSessions[5].learn=L.fresh('learn',28,1);p.gradeSessions[5].learn.draft='3/';L.hint(p.gradeSessions[5].learn);p.gradeSessions[5].revision=L.freshReview(p,5);p.activeGrade=5;p.settings={music:.2,sfx:.5};delete p.gradeSessions[6];
 const old=JSON.stringify(p),loaded=L.normalize(p);assert.equal(JSON.stringify(p),old);assert.deepEqual(loaded.results,p.results);assert.deepEqual(loaded.sessions,p.sessions);assert.deepEqual(loaded.gradeSessions[5],p.gradeSessions[5]);assert.equal(L.unlocked(loaded,6),40);assert.equal(loaded.gradeSessions[6].adventure,null);
 loaded.activeGrade=6;loaded.gradeSessions[6].learn=L.fresh('learn',52,1);loaded.gradeSessions[6].learn.draft='4';L.hint(loaded.gradeSessions[6].learn);loaded.gradeSessions[6].revision=L.freshReview(loaded,6);assert.deepEqual(L.normalize(JSON.parse(JSON.stringify(loaded))),loaded);assert.deepEqual(loaded.sessions,p.sessions);assert.deepEqual(loaded.gradeSessions[5],p.gradeSessions[5]);
 const locked=L.normalize(null);locked.gradeSessions[6].adventure=L.fresh('adventure',41);assert.equal(L.normalize(locked).gradeSessions[6].adventure,null);locked.gradeSessions[6].learn=L.fresh('learn',59);assert.ok(L.normalize(locked).gradeSessions[6].learn);const wrong=L.freshReview(loaded,6);wrong.plan[4]={mission:20,bank:0,index:0};assert.equal(L.valid(wrong),false);
});
test('Grade 6 arithmetic, place values, mixed fractions, decimal calculations and overnight times are exact',()=>{
 for(const m of L.pathMissions(6))for(const t of [...m.tasks,...m.practice]){
  if(t.g6Model==='large'){assert.ok(t.value>=100000000&&t.value<=999999999);assert.equal(Number(t.answer),Math.floor(t.value/10**t.power)%10*10**t.power);}
  if(t.kind==='product'){assert.ok(t.a>=1000&&t.b>=100&&t.b<=999);assert.equal(Number(t.answer),t.a*t.b);}
  if(t.g6Model==='division'){assert.ok(t.a>=1000&&t.a<10000&&t.b>=100&&t.b<=999);assert.equal(t.a,t.b*t.quotient+t.remainder);assert.ok(t.remainder>=0&&t.remainder<t.b);assert.equal(Number(t.answer),t.query==='remainder'?t.a%t.b:Math.floor(t.a/t.b));}
  if(t.g6Model==='ratio')assert.equal(Number(t.answer),t.total*t.ratio[1]/t.ratio.reduce((a,b)=>a+b));
  if(t.g6Model==='fractions'){const [a,b]=t.operands;assert.equal(Math.max(a.d,b.d)%Math.min(a.d,b.d),0);assert.ok(L.equivalent(t.answer,`${a.n*b.d+(t.op==='+'?1:-1)*b.n*a.d}/${a.d*b.d}`));assert.ok(t.operands.every(f=>f.n>0&&f.d>0));}
  if(t.g6Model==='decimal'){const digit=t.power===1?Math.floor(t.cents/10)%10:t.cents%10;assert.ok(L.equivalent(t.answer,`${digit}/${t.power===1?10:100}`));}
  if(t.centsA!==undefined)assert.ok(L.equivalent(t.answer,`${t.op==='+'?t.centsA+t.centsB:t.centsA-t.centsB}/100`));
  if(t.g6Model==='hundred'){assert.ok(t.filled>=0&&t.filled<=100);const expected=t.query==='quantity'?`${t.filled*t.total}/100`:t.query==='decimal'?`${t.filled}/100`:String(t.filled);assert.ok(L.equivalent(t.answer,expected));}
  if(t.g6Model==='rule')assert.equal(Number(t.answer),t.input*t.multiplier+t.offset);
  if(t.g6Model==='journey'){assert.ok(t.start<1440&&t.start>t.end&&t.end>=0);assert.equal(Number(t.answer),1440-t.start+t.end);assert.ok(t.labels.every(s=>/^\d\d:\d\d$/.test(s)&&Number(s.slice(0,2))<24));}
 }
 assert.deepEqual(L.missions[47].tasks.map(t=>t.answer),['0.4','0.06','1','3.5','0.02']);assert.deepEqual(L.missions[49].tasks.map(t=>t.answer),['30','125','60','0.25','40']);assert.equal(L.missions[56].tasks[4].answer,'7');assert.equal(L.missions[56].practice[4].answer,'10.5');
});
test('transformation grids follow the labelled axes, save a selected cell and submit through real controls',()=>{
 const {tools,Element}=toolHarness();for(const m of L.pathMissions(6))for(const [bank,tasks]of [[0,m.tasks],[1,m.practice]])for(const [index,t]of tasks.entries())if(t.kind==='coordinate'){
  const [c,r]=t.from,to=t.operation==='reflect'?[4-c,r]:t.operation==='rotate'?[r,4-c]:[c+t.delta[0],r+t.delta[1]];assert.deepEqual(t.to,to);assert.equal(Number(t.answer),(to[1]-1)*3+to[0]);assert.ok(to.every(n=>n>=1&&n<=3));
  const s=L.fresh('learn',L.missions.indexOf(m),bank);s.index=index;for(let i=0;i<index;i++)s.steps[i].done=true;const panel=new Element('div');assert.equal(tools.renderResponse(t,s,{panel,onChange:v=>s.draft=String(v),effect(){}}),true);assert.equal(panel.children[0].children.length,9);panel.children[0].children.find(b=>String(b.dataset.cell)===t.answer).click();assert.equal(panel.children[0].children.filter(b=>b.attrs['aria-pressed']==='true').length,1);
  const p=L.normalize(null);p.gradeSessions[6].learn=s;const restored=L.normalize(p).gradeSessions[6].learn;assert.equal(restored.draft,t.answer);assert.equal(L.submit(restored,restored.draft).ok,true);
 }
});
test('Grade 6 shapes, charts and chance models use consistent counts and units',()=>{
 const isPrime=n=>n>1&&Array.from({length:Math.floor(Math.sqrt(n))-1},(_,i)=>i+2).every(i=>n%i!==0);
 for(const m of L.pathMissions(6))for(const t of [...m.tasks,...m.practice]){
  if(t.g6Model==='rectangle')assert.equal(Number(t.answer),t.query==='area'?t.length*t.width:2*(t.length+t.width));
  if(t.g6Model==='cuboid')assert.equal(Number(t.answer),t.length*t.width*t.height);
  if(t.g6Model==='angle'){assert.equal(Number(t.answer),t.degrees);assert.equal(t.degrees%15,0);assert.ok(t.degrees>0&&t.degrees<180);}
  if(t.g6Model==='pie'){assert.equal(t.values.reduce((a,b)=>a+b),100);const expected=t.query==='count'?`${t.values[2]*t.total}/100`:t.query==='decimal'?`${t.values[2]}/100`:String(t.values[0]+t.values[1]);assert.ok(L.equivalent(t.answer,expected));}
  if(t.g6Model==='spinner'){assert.equal(t.counts.reduce((a,b)=>a+b),6);assert.equal(t.labels.length,t.counts.length);if(t.prompt.includes('most likely'))assert.equal(Number(t.answer)-1,t.counts.indexOf(Math.max(...t.counts)));if(t.prompt.includes('Yellow'))assert.equal(t.options[Number(t.answer)-1].label,'Impossible');}
  if(t.g6Model==='values'&&t.query==='mode'){const counts=new Map();for(const n of t.values)counts.set(n,(counts.get(n)||0)+1);const frequencies=[...counts].sort((a,b)=>b[1]-a[1]);assert.ok(frequencies[0][1]>frequencies[1][1]);assert.equal(Number(t.answer),frequencies[0][0]);}
  if(t.prompt==='Which number is prime?'){const primes=t.options.filter(o=>isPrime(Number(o.label)));assert.equal(primes.length,1);assert.equal(primes[0].value,Number(t.answer));}
  if(t.prompt.startsWith('Choose the prime factorisation')){const n=Number(t.prompt.match(/of (\d+)/)[1]),valid=t.options.filter(o=>{const factors=o.label.split(' × ').map(Number);return factors.every(isPrime)&&factors.reduce((a,b)=>a*b,1)===n;});assert.equal(valid.length,1);assert.equal(valid[0].value,Number(t.answer));}
 }
});
test('Grade 6 diagram renderers reproduce their authored evidence without missing mathematical models',()=>{
 const {tools,Element}=toolHarness();for(const m of L.pathMissions(6))for(const t of [...m.tasks,...m.practice]){const v=new Element('div');assert.equal(tools.draw(t,v),true,t.id);assert.ok(v.children.length);const image=v.children[0];if(t.g6Model==='hundred'){assert.equal((image.innerHTML.match(/<rect /g)||[]).length,100);assert.equal((image.innerHTML.match(/fill="#6be2cd"/g)||[]).length,t.filled);}
  if(t.g6Model==='fractions')assert.equal((image.innerHTML.match(/fill="#6be2cd"/g)||[]).length,t.operands.reduce((n,f)=>n+f.n,0));
  if(t.g6Model==='pie')for(let i=0;i<3;i++)assert.ok(image.attrs['aria-label'].includes(`${t.labels[i]} ${t.values[i]} percent`));
  if(t.g6Model==='spinner')assert.equal((image.innerHTML.match(/data-spinner-divider="true"/g)||[]).length,6);
  if(t.g6Model==='net'&&t.net==='Cube')assert.equal((image.innerHTML.match(/<rect /g)||[]).length,6);
  if(t.g6Model==='net'&&t.net==='Cylinder'){assert.equal((image.innerHTML.match(/<circle /g)||[]).length,2);assert.match(image.innerHTML,new RegExp(`width="${36*Math.PI}"`));}
  if(t.g6Model==='transform')assert.equal((image.innerHTML.match(/<rect /g)||[]).length,9);
 }
});

test('v4.3: all 600 earlier activities and 115 arrangements remain identical',()=>{
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(L.allTasks.slice(0,600))).digest('hex'),'e1de0ae5cad2d1a376b6854c3c5bdbbe56472a6b3b4df65e50a805df55645f7b');
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(A.themes.slice(0,115))).digest('hex'),'a54b65bb64ad3abbd0c037193f00b28dfce55d047ffb95a437d82e78330877a4');
});
test('Grade 7 unlocks twenty missions independently and all alternate sets complete with no awards',()=>{
 assert.deepEqual(L.pathFor(7),{grade:7,title:'Research Ridge',start:60,count:20,reviewMusic:135});const p=L.normalize(null);
 for(let i=60;i<80;i++){assert.equal(L.unlocked(p,7),i);const m=L.missions[i];assert.equal(m.music,115+i-60);assert.equal(m.number,i-59);const values=[...m.tasks,...m.practice].map(({id,...t})=>JSON.stringify(t));assert.equal(new Set(values).size,10,m.id);complete(p,L.fresh('adventure',i));}
 assert.equal(Object.keys(p.results).length,20);assert.equal(L.unlocked(p,4),0);assert.equal(L.unlocked(p,5),20);assert.equal(L.unlocked(p,6),40);
 const clean=L.normalize(null);for(let i=60;i<80;i++)complete(clean,L.fresh('learn',i,1));assert.deepEqual(clean.results,{});assert.equal(L.unlocked(clean,7),60);assert.equal(Object.keys(clean.review).length,100);
});
test('Grade 7 saved signs, fractional drafts, hints and Review are independent of all three earlier grades',()=>{
 const old=L.normalize(null);for(let i=0;i<60;i++)complete(old,L.fresh('adventure',i));old.sessions.adventure=L.fresh();old.sessions.adventure.draft='3000';for(const[g,m]of [[5,28],[6,46]]){old.gradeSessions[g].learn=L.fresh('learn',m,1);old.gradeSessions[g].learn.draft='3/';L.hint(old.gradeSessions[g].learn);old.gradeSessions[g].revision=L.freshReview(old,g);}delete old.gradeSessions[7];old.activeGrade=6;
 const p=L.normalize(old);assert.deepEqual(p.results,old.results);assert.deepEqual(p.sessions,old.sessions);for(const g of [5,6])assert.deepEqual(p.gradeSessions[g],old.gradeSessions[g]);assert.equal(p.gradeSessions[7].adventure,null);assert.equal(L.unlocked(p,7),60);
 p.activeGrade=7;p.gradeSessions[7].adventure=L.fresh('adventure',60);p.gradeSessions[7].adventure.draft='-';L.hint(p.gradeSessions[7].adventure);assert.equal(L.submit(p.gradeSessions[7].adventure,'-').empty,true);assert.equal(p.gradeSessions[7].adventure.steps[0].mistakes,0);
 complete(p,L.fresh('learn',64,1),true);p.gradeSessions[7].learn=L.fresh('learn',64,1);p.gradeSessions[7].learn.draft='7/';p.gradeSessions[7].revision=L.freshReview(p,7);const round=L.normalize(JSON.parse(JSON.stringify(p)));assert.deepEqual(round,p);assert.ok(round.gradeSessions[7].revision.plan.every(r=>r.mission>=60&&r.mission<80));assert.equal(L.music(round.gradeSessions[7].revision),135);
 const before=JSON.stringify(p.results);complete(p,p.gradeSessions[7].revision);assert.equal(JSON.stringify(p.results),before);const cross=L.freshReview(p,7);cross.plan[2]={mission:40,bank:0,index:0};assert.equal(L.valid(cross),false);p.gradeSessions[7].adventure=L.fresh('adventure',61);assert.equal(L.normalize(p).gradeSessions[7].adventure,null);
});
test('Grade 7 integers, powers and roots obey signed arithmetic and inverse relationships',()=>{
 assert.deepEqual(L.missions[60].tasks.map(t=>t.answer),['-6','-5','4','-7','5']);assert.deepEqual(L.missions[61].tasks.map(t=>t.answer),['3','-6','-4','13','-9']);assert.deepEqual(L.missions[62].tasks.map(t=>t.answer),['36','64','32','9','5']);
 for(const t of L.allTasks.slice(600)){if(t.signedEntry)assert.ok(!t.fractionEntry);if(t.delta!==undefined){assert.equal(Number(t.answer),t.start+t.delta);assert.ok(Number(t.answer)>=t.min&&Number(t.answer)<=t.max);}if(t.exponent)assert.equal(Number(t.answer),t.base**t.exponent);if(t.rootBase)assert.equal(Number(t.answer),t.rootBase);}
 const s=L.fresh('adventure',60);assert.equal(L.submit(s,'−6').ok,true);assert.ok(L.equivalent('-0','0'));for(const bad of ['--6','6-','-','−','- 1/0'])assert.equal(L.rational(bad),null);
});
test('Grade 7 fractions and thousandths match independent exact reference answers',()=>{
 const expected=[['17/12','7/12','3/8','6/7','3/4'],['23/20','13/24','3/20','25/14','7/10']];for(const[bank,key]of [[0,'tasks'],[1,'practice']])L.missions[64][key].forEach((t,i)=>assert.ok(L.equivalent(t.answer,expected[bank][i]),t.id));
 assert.deepEqual(L.missions[65].tasks.slice(0,4).map(t=>t.answer),['6.045','5.267','7.125','2.160']);assert.deepEqual(L.missions[65].practice.slice(0,4).map(t=>t.answer),['6.224','5.637','5.700','1.645']);
 for(const t of L.allTasks.slice(600).filter(t=>t.decimalCalculation)){const scaled=Number(t.answer)*1000,expected=t.op==='+'?t.a+t.b:t.op==='−'?t.a-t.b:t.op==='×'?t.a*t.b:t.a/t.b;assert.ok(Math.abs(scaled-expected)<1e-8,t.id);}
});
test('Grade 7 finance, ratios and algebra have checked practical and substituted answers',()=>{
 assert.deepEqual(L.missions[66].tasks.map(t=>t.answer),['340','230','120','440','275']);assert.deepEqual(L.missions[66].practice.map(t=>t.answer),['480','280','120','680','330']);assert.deepEqual(L.missions[67].tasks.map(t=>t.answer),['18','36','50','90','300']);
 for(const t of L.allTasks.slice(600)){if(t.principal){const interest=t.principal*t.rate*t.years/100;const expected=t.query==='interest'?interest:t.query==='sale'?t.principal*(100-t.rate)/100:t.principal*(100+t.rate)/100;assert.equal(Number(t.answer),expected,t.id);}if(t.g7Model==='balance'){assert.equal(t.coefficient*Number(t.answer)+t.constant,t.total);}if(t.x!==undefined&&t.g7Model==='cards')assert.equal(Number(t.answer),t.coefficient*t.x+t.constant);if(t.g7Model==='function'){const answer=Number(t.answer);assert.equal(t.unknown?answer*t.multiplier+t.offset:t.input*t.multiplier+t.offset,t.unknown?t.input*t.multiplier+t.offset:answer);}}
});
test('Grade 7 graphs, angles, triangle area, surface area and data models carry accurate evidence',()=>{
 for(const t of L.allTasks.slice(600)){if(t.g7Model==='graph'){assert.equal(t.values.length,5);if(t.query==='read')assert.equal(Number(t.answer),t.values[3]);else{const label=t.options.find(o=>String(o.value)===t.answer).label;if(label==='Constant')assert.ok(t.values.every(v=>v===t.values[0]));if(label==='Steady increase')assert.ok(t.values.every((v,i)=>i===0||v-t.values[i-1]===t.values[1]-t.values[0]));if(label==='Steady decrease')assert.ok(t.values.every((v,i)=>i===0||v<t.values[i-1]));if(label==='Increase gets faster')assert.ok(t.values[4]-t.values[3]>t.values[1]-t.values[0]);}}
  if(t.g7Model==='angle')assert.equal(t.options.find(o=>String(o.value)===t.answer).label,t.degrees<90?'Acute':t.degrees<180?'Obtuse':'Reflex');if(t.g7Model==='triangle')assert.equal(Number(t.answer)*2,t.base*t.height);if(t.g7Model==='box')assert.equal(Number(t.answer),t.query==='surface'?2*(t.length*t.width+t.width*t.height+t.length*t.height):t.length*t.width*t.height);if(t.g7Model==='scale')assert.equal(Number(t.answer),(t.query==='width'?t.width:t.length)*t.factor);
  if(t.g7Model==='data'){const a=[...t.values].sort((a,b)=>a-b);assert.equal(Number(t.answer),t.query==='mean'?a.reduce((a,b)=>a+b)/5:t.query==='median'?a[2]:a[4]-a[0]);}}
 assert.equal(L.missions[76].tasks[1].answer,'14');assert.equal(L.missions[77].tasks[0].answer,'72');assert.equal(L.missions[77].practice[0].answer,'136');assert.deepEqual(L.missions[78].tasks.slice(0,3).map(t=>t.answer),['10','11','13']);
});
test('Grade 7 SVGs render every model, proportional arrays, five graph points and explicitly marked reflex arcs',()=>{
 const{tools,Element}=toolHarness();const kinds=new Set();for(const t of L.allTasks.slice(600)){const v=new Element('div');assert.equal(tools.draw(t,v),true,t.id);assert.ok(v.children.length);kinds.add(t.g7Model);if(t.g7Model==='growing')assert.equal((v.children[0].innerHTML.match(/data-pattern-cell=/g)||[]).length,t.stage*(t.stage+1));if(t.g7Model==='graph')assert.equal((v.children[0].innerHTML.match(/data-graph-point=/g)||[]).length,5);if(t.g7Model==='angle'&&t.degrees>180){assert.match(v.children[0].innerHTML,/ 0 1 0 /);assert.match(v.children[0].attrs['aria-label'],/larger reflex turn/);}}
 for(const kind of ['integer','function','balance','graph','angle','circle','triangle','box','scale','data'])assert.ok(kinds.has(kind),kind);
});
