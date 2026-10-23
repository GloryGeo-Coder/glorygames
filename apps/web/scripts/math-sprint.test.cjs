const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const L=require('../public/games/math-sprint-arena/learning-data.js'),A=require('../public/games/math-sprint-arena/arena-audio.js');
const root=path.resolve(__dirname,'../public/games/math-sprint-arena');
function complete(p,s,assist=false){while(s.index<5){const t=L.current(s);if(assist)L.hint(s);assert.equal(L.submit(s,t.answer).ok,true);assert.equal(L.advance(p,s),true);}}
test('Grade 4–10 paths contain 1400 authored Adventure and alternate activities with grade, skill, unique IDs, explanations and three hints',()=>{
 assert.equal(L.missions.length,140);const ids=[];for(const m of L.missions){assert.ok([4,5,6,7,8,9,10].includes(m.grade));assert.equal(m.tasks.length,5);assert.ok(m.skill&&m.story&&m.lesson);assert.ok(fs.existsSync(path.join(root,'assets/backgrounds',`bg-${m.background}.png`)));for(const t of [...m.tasks,...m.practice]){ids.push(t.id);assert.ok(L.rational(t.answer),t.id);assert.equal(t.hints.length,3);assert.equal(new Set(t.hints).size,3);assert.ok(t.explanation.length>35);assert.ok(t.worked.length>4);}}
 assert.equal(new Set(ids).size,1400);
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
 assert.equal(A.themes.length,199);assert.equal(new Set(A.themes.map(t=>t.title)).size,199);assert.equal(new Set(A.themes.map(t=>JSON.stringify(t.notes))).size,199);for(const t of A.themes){assert.equal(t.notes.length,16);assert.equal(t.rhythm.length,16);assert.ok(t.bpm>=80&&t.bpm<=140);}
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
 const document={createElement:t=>new Element(t),createElementNS:(_,t)=>new Element(t)},window={};vm.runInNewContext(fs.readFileSync(path.join(root,'learning-grade6-tools.js'),'utf8'),{document,window});vm.runInNewContext(fs.readFileSync(path.join(root,'learning-grade7-tools.js'),'utf8'),{document,window});vm.runInNewContext(fs.readFileSync(path.join(root,'learning-grade8-tools.js'),'utf8'),{document,window});vm.runInNewContext(fs.readFileSync(path.join(root,'learning-grade9-tools.js'),'utf8'),{document,window});vm.runInNewContext(fs.readFileSync(path.join(root,'learning-grade10-tools.js'),'utf8'),{document,window});vm.runInNewContext(fs.readFileSync(path.join(root,'learning-tools.js'),'utf8'),{document,window});return {tools:window.MathLearningTools,Element};
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
test('metadata advertises only the implemented Grade 4–10 scope and exact activity/music counts',()=>{
 const meta=JSON.parse(fs.readFileSync(path.join(root,'game.json'))).features;assert.equal(meta.learningMissions,L.missions.length);assert.equal(meta.learningActivities,L.missions.reduce((n,m)=>n+m.tasks.length,0));assert.equal(meta.alternatePracticeActivities,L.missions.reduce((n,m)=>n+m.practice.length,0));assert.equal(meta.activityBankTotal,L.allTasks.length);assert.equal(meta.originalMusicArrangements,A.themes.length);assert.deepEqual(meta.learningGrades,[4,5,6,7,8,9,10]);assert.equal(meta.learningMissionsPerGrade,20);assert.equal(meta.originalLevelArrangements,meta.learningMissions+meta.sprintLevels);
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
 for(const t of L.allTasks.slice(600,800)){if(t.signedEntry)assert.ok(!t.fractionEntry);if(t.delta!==undefined){assert.equal(Number(t.answer),t.start+t.delta);assert.ok(Number(t.answer)>=t.min&&Number(t.answer)<=t.max);}if(t.exponent)assert.equal(Number(t.answer),t.base**t.exponent);if(t.rootBase)assert.equal(Number(t.answer),t.rootBase);}
 const s=L.fresh('adventure',60);assert.equal(L.submit(s,'−6').ok,true);assert.ok(L.equivalent('-0','0'));for(const bad of ['--6','6-','-','−','- 1/0'])assert.equal(L.rational(bad),null);
});
test('Grade 7 fractions and thousandths match independent exact reference answers',()=>{
 const expected=[['17/12','7/12','3/8','6/7','3/4'],['23/20','13/24','3/20','25/14','7/10']];for(const[bank,key]of [[0,'tasks'],[1,'practice']])L.missions[64][key].forEach((t,i)=>assert.ok(L.equivalent(t.answer,expected[bank][i]),t.id));
 assert.deepEqual(L.missions[65].tasks.slice(0,4).map(t=>t.answer),['6.045','5.267','7.125','2.160']);assert.deepEqual(L.missions[65].practice.slice(0,4).map(t=>t.answer),['6.224','5.637','5.700','1.645']);
 for(const t of L.allTasks.slice(600,800).filter(t=>t.decimalCalculation)){const scaled=Number(t.answer)*1000,expected=t.op==='+'?t.a+t.b:t.op==='−'?t.a-t.b:t.op==='×'?t.a*t.b:t.a/t.b;assert.ok(Math.abs(scaled-expected)<1e-8,t.id);}
});
test('Grade 7 finance, ratios and algebra have checked practical and substituted answers',()=>{
 assert.deepEqual(L.missions[66].tasks.map(t=>t.answer),['340','230','120','440','275']);assert.deepEqual(L.missions[66].practice.map(t=>t.answer),['480','280','120','680','330']);assert.deepEqual(L.missions[67].tasks.map(t=>t.answer),['18','36','50','90','300']);
 for(const t of L.allTasks.slice(600,800)){if(t.principal){const interest=t.principal*t.rate*t.years/100;const expected=t.query==='interest'?interest:t.query==='sale'?t.principal*(100-t.rate)/100:t.principal*(100+t.rate)/100;assert.equal(Number(t.answer),expected,t.id);}if(t.g7Model==='balance'){assert.equal(t.coefficient*Number(t.answer)+t.constant,t.total);}if(t.x!==undefined&&t.g7Model==='cards')assert.equal(Number(t.answer),t.coefficient*t.x+t.constant);if(t.g7Model==='function'){const answer=Number(t.answer);assert.equal(t.unknown?answer*t.multiplier+t.offset:t.input*t.multiplier+t.offset,t.unknown?t.input*t.multiplier+t.offset:answer);}}
});
test('Grade 7 graphs, angles, triangle area, surface area and data models carry accurate evidence',()=>{
 for(const t of L.allTasks.slice(600,800)){if(t.g7Model==='graph'){assert.equal(t.values.length,5);if(t.query==='read')assert.equal(Number(t.answer),t.values[3]);else{const label=t.options.find(o=>String(o.value)===t.answer).label;if(label==='Constant')assert.ok(t.values.every(v=>v===t.values[0]));if(label==='Steady increase')assert.ok(t.values.every((v,i)=>i===0||v-t.values[i-1]===t.values[1]-t.values[0]));if(label==='Steady decrease')assert.ok(t.values.every((v,i)=>i===0||v<t.values[i-1]));if(label==='Increase gets faster')assert.ok(t.values[4]-t.values[3]>t.values[1]-t.values[0]);}}
  if(t.g7Model==='angle')assert.equal(t.options.find(o=>String(o.value)===t.answer).label,t.degrees<90?'Acute':t.degrees<180?'Obtuse':'Reflex');if(t.g7Model==='triangle')assert.equal(Number(t.answer)*2,t.base*t.height);if(t.g7Model==='box')assert.equal(Number(t.answer),t.query==='surface'?2*(t.length*t.width+t.width*t.height+t.length*t.height):t.length*t.width*t.height);if(t.g7Model==='scale')assert.equal(Number(t.answer),(t.query==='width'?t.width:t.length)*t.factor);
  if(t.g7Model==='data'){const a=[...t.values].sort((a,b)=>a-b);assert.equal(Number(t.answer),t.query==='mean'?a.reduce((a,b)=>a+b)/5:t.query==='median'?a[2]:a[4]-a[0]);}}
 assert.equal(L.missions[76].tasks[1].answer,'14');assert.equal(L.missions[77].tasks[0].answer,'72');assert.equal(L.missions[77].practice[0].answer,'136');assert.deepEqual(L.missions[78].tasks.slice(0,3).map(t=>t.answer),['10','11','13']);
});
test('Grade 7 SVGs render every model, proportional arrays, five graph points and explicitly marked reflex arcs',()=>{
 const{tools,Element}=toolHarness();const kinds=new Set();for(const t of L.allTasks.slice(600,800)){const v=new Element('div');assert.equal(tools.draw(t,v),true,t.id);assert.ok(v.children.length);kinds.add(t.g7Model);if(t.g7Model==='growing')assert.equal((v.children[0].innerHTML.match(/data-pattern-cell=/g)||[]).length,t.stage*(t.stage+1));if(t.g7Model==='graph')assert.equal((v.children[0].innerHTML.match(/data-graph-point=/g)||[]).length,5);if(t.g7Model==='angle'&&t.degrees>180){assert.match(v.children[0].innerHTML,/ 0 1 0 /);assert.match(v.children[0].attrs['aria-label'],/larger reflex turn/);}}
 for(const kind of ['integer','function','balance','graph','angle','circle','triangle','box','scale','data'])assert.ok(kinds.has(kind),kind);
});

test('v4.4 content is preserved: all 800 activities and 136 music arrangements are hash-locked',()=>{
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(L.allTasks.slice(0,800))).digest('hex'),'7cfc501b1f68d8ea6374137a010deb929fed93f8a556654c2c0485cd35cdfb16');
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(A.themes.slice(0,136))).digest('hex'),'181b705f3240a9642392eaac8cab3ed53d670cb47bdaa4a99961f3dc53075e36');
});
test('Grade 8 has twenty independent unlocks and all 200 activities complete without cross-grade awards',()=>{
 assert.deepEqual(L.pathFor(8),{grade:8,title:'Skyline Lab',start:80,count:20,reviewMusic:156});const p=L.normalize(null),practice=L.normalize(null);
 for(let m=80;m<100;m++){assert.equal(L.unlocked(p,8),m);assert.equal(L.missions[m].music,136+m-80);const unique=[...L.missions[m].tasks,...L.missions[m].practice].map(({id,...t})=>JSON.stringify(t));assert.equal(new Set(unique).size,10,L.missions[m].id);complete(p,L.fresh('adventure',m));complete(practice,L.fresh('learn',m,1),true);}
 assert.equal(Object.keys(p.results).length,20);assert.deepEqual(practice.results,{});assert.equal(L.unlocked(practice,8),80);for(const[g,start]of[[4,0],[5,20],[6,40],[7,60]])assert.equal(L.unlocked(p,g),start);
 const results=JSON.stringify(p.results),review=L.freshReview(p,8);assert.ok(review.plan.every(r=>r.mission>=80&&r.mission<100));assert.equal(new Set(review.plan.map(r=>L.taskAt(r).id)).size,5);assert.equal(L.music(review),156);complete(p,review);assert.equal(JSON.stringify(p.results),results);
});
test('Grade 8 migration preserves all four earlier paths, settings, drafts and revision checkpoints',()=>{
 const old=L.normalize(null);for(let m=0;m<80;m++)complete(old,L.fresh('adventure',m));old.sessions.adventure=L.fresh();old.sessions.adventure.draft='3000';for(const[g,m,draft]of[[5,28,'3/'],[6,46,'7/'],[7,60,'-']]){old.gradeSessions[g].learn=L.fresh('learn',m,1);old.gradeSessions[g].learn.draft=draft;L.hint(old.gradeSessions[g].learn);old.gradeSessions[g].revision=L.freshReview(old,g);}old.activeGrade=7;old.settings={music:.2,sfx:.5};delete old.gradeSessions[8];
 const p=L.normalize(JSON.parse(JSON.stringify(old)));assert.deepEqual(p.results,old.results);assert.deepEqual(p.sessions,old.sessions);for(const g of[5,6,7])assert.deepEqual(p.gradeSessions[g],old.gradeSessions[g]);assert.equal(L.unlocked(p,8),80);assert.deepEqual(p.settings,old.settings);
 p.activeGrade=8;p.gradeSessions[8].learn=L.fresh('learn',91,1);p.gradeSessions[8].learn.draft='2';L.hint(p.gradeSessions[8].learn);p.gradeSessions[8].revision=L.freshReview(p,8);assert.deepEqual(L.normalize(JSON.parse(JSON.stringify(p))),p);p.gradeSessions[8].adventure=L.fresh('adventure',81);assert.equal(L.normalize(p).gradeSessions[8].adventure,null);const bad=L.freshReview(p,8);bad.plan[2]={mission:60,bank:0,index:0};assert.equal(L.valid(bad),false);
});
test('Grade 8 signed arithmetic, factorisation, scientific notation and exponent laws are exact',()=>{
 assert.deepEqual(L.missions[80].tasks.map(t=>t.answer),['-24','35','-12','9','-9']);assert.deepEqual(L.missions[80].practice.map(t=>t.answer),['-56','54','-12','8','-3']);assert.deepEqual(L.missions[81].tasks.map(t=>t.answer),['42','432','75','180','120']);assert.deepEqual(L.missions[81].practice.map(t=>t.answer),['72','360','36','200','180']);
 for(const t of L.allTasks.slice(800,1000)){if(t.exponentLaw)assert.equal(Number(t.answer),t.op==='×'?t.m+t.n:t.m-t.n);if(t.scientificValue){const label=t.options.find(o=>String(o.value)===t.answer).label;assert.equal(label,t.scientificValue===45000?'4.5 × 10⁴':'7.2 × 10⁵');}if(t.query==='HCF'){assert.equal(t.a%Number(t.answer),0);assert.equal(t.b%Number(t.answer),0);for(let n=Number(t.answer)+1;n<=Math.min(t.a,t.b);n++)assert.ok(t.a%n!==0||t.b%n!==0);}if(t.query==='LCM'){assert.equal(Number(t.answer)%t.a,0);assert.equal(Number(t.answer)%t.b,0);for(let n=Math.max(t.a,t.b);n<Number(t.answer);n++)assert.ok(n%t.a!==0||n%t.b!==0);}}
});
test('Grade 8 rational powers and decimal operations match exact independent references',()=>{
 for(const[bank,expected]of[['tasks',['29/12','6/7','4/9','3/4','2/5']],['practice',['57/20','3/2','9/16','4/9','3/7']]])L.missions[83][bank].forEach((t,i)=>assert.ok(L.equivalent(t.answer,expected[i]),t.id));
 assert.deepEqual(L.missions[84].tasks.map(t=>t.answer),['0.400','0.054','42.000','5.000','18.750']);assert.deepEqual(L.missions[84].practice.map(t=>t.answer),['0.900','0.120','39.000','12.000','21.000']);assert.deepEqual(L.missions[85].tasks.map(t=>t.answer),['460','1210','300','210','15']);assert.deepEqual(L.missions[85].practice.map(t=>t.answer),['690','1490','450','290','20']);
 for(const t of L.allTasks.slice(800,1000).filter(t=>t.decimalCalculation)){const x=L.rational(t.answer);assert.equal(t.op==='×'?x.n*10000n:x.n*BigInt(t.b),t.op==='×'?x.d*BigInt(t.a*t.b):x.d*BigInt(t.a));}
});
test('Grade 8 expression choices are uniquely equivalent and equations balance under substitution',()=>{
 for(const t of L.allTasks.slice(800,1000)){
  if(t.expectedCoefficients){const parse=label=>{const m=label.match(/^(-?\d+)x ([+−]) (\d+)$/);assert.ok(m,label);return[Number(m[1]),(m[2]==='−'?-1:1)*Number(m[3])];};const expected=t.divide?[t.a/t.factor,t.c/t.factor]:[t.a*t.factor,t.c*t.factor];const matches=t.options.filter(o=>JSON.stringify(parse(o.label))===JSON.stringify(expected));assert.equal(matches.length,1,t.id);assert.equal(String(matches[0].value),t.answer);}
  if(t.likeA!==undefined){const expected=`${t.subtract?t.likeA-t.likeB:t.likeA+t.likeB}${t.square?'x²':'x'}`;assert.equal(t.options.filter(o=>o.label===expected).length,1);assert.equal(t.options.find(o=>String(o.value)===t.answer).label,expected);}
  if(t.g8Model==='equation'){const x=Number(t.answer);assert.equal(t.a*x+t.c,t.rightA*x+t.rightC);}
  if(t.g8Model==='function'){const x=t.unknown?Number(t.answer):t.input,y=t.unknown?t.input*t.multiplier+t.offset:Number(t.answer);assert.equal(y,t.multiplier*x+t.offset);}
 }
});
test('Cartesian points and transformations have correct signed coordinates and saved real-control selections',()=>{
 const{tools,Element}=toolHarness();for(const t of L.allTasks.slice(800,1000).filter(t=>t.kind==='cartesian')){
  const id=Number(t.answer),decoded=[-2+(id-1)%3*2,-2+Math.floor((id-1)/3)*2];assert.deepEqual(decoded,t.target);if(t.operation==='x-axis')assert.deepEqual(t.target,[t.from[0],-t.from[1]||0]);if(t.operation==='y-axis')assert.deepEqual(t.target,[-t.from[0]||0,t.from[1]]);if(t.operation==='y=x')assert.deepEqual(t.target,[t.from[1],t.from[0]]);if(t.operation==='rotate')assert.deepEqual(t.target,[-t.from[1]||0,t.from[0]]);if(t.operation==='translate')assert.deepEqual(t.target,[t.from[0]+t.delta[0],t.from[1]+t.delta[1]]);
  const p=L.normalize(null),s=L.fresh('learn',91,t.id.includes('practice')?1:0),index=L.missions[91][s.bank?'practice':'tasks'].findIndex(v=>v.id===t.id);if(index<0)continue;s.index=index;s.steps.forEach((v,i)=>{v.done=i<index;});const panel=new Element('div');assert.equal(tools.renderResponse(t,s,{panel,onChange:v=>s.draft=String(v),effect:()=>{}}),true);const buttons=panel.children[0].children.filter(b=>b.tag==='button');assert.equal(buttons.length,9);assert.equal(panel.children[0].children.length,16);const button=buttons.find(b=>b.dataset.plot===id);assert.ok(button);button.click();assert.equal(button.attrs['aria-pressed'],'true');p.gradeSessions[8].learn=s;const restored=L.normalize(p).gradeSessions[8].learn;assert.equal(restored.draft,t.answer);assert.equal(L.submit(restored,restored.draft).ok,true);
 }
});
test('Grade 8 geometry distinguishes angle relationships, hypotenuse, circle units and closed-prism faces',()=>{
 for(const t of L.allTasks.slice(800,1000)){
  if(t.g8Model==='angles')assert.equal(Number(t.answer),['adjacent','cointerior'].includes(t.relationship)?180-t.given:t.given);
  if(t.g8Model==='triangleAngles')assert.equal(Number(t.answer)+t.angles[0]+t.angles[1],180);
  if(t.g8Model==='pythagoras'){if(t.radicand){assert.equal(t.radicand,t.a*t.a+t.b*t.b);assert.equal(t.options.find(o=>String(o.value)===t.answer).label,`√${t.radicand}`);}else assert.equal(Number(t.answer)**2,t.missing==='hypotenuse'?t.a*t.a+t.b*t.b:t.c*t.c-t.a*t.a);}
  if(t.g8Model==='circle')assert.ok(L.equivalent(t.answer,String((t.query==='area'?314*t.radius*t.radius:628*t.radius)/100)));
  if(t.g8Model==='composite')assert.equal(Number(t.answer),t.length*t.height-t.cutWidth*t.cutHeight);
  if(t.g8Model==='prism'){assert.equal(t.a*t.a+t.b*t.b,t.c*t.c);assert.equal(Number(t.answer),t.query==='volume'?t.a*t.b/2*t.length:t.a*t.b+(t.a+t.b+t.c)*t.length);}
 }
 assert.deepEqual(L.missions[97].tasks.map(t=>t.answer),['60','108','180','3.75','3000']);assert.deepEqual(L.missions[97].practice.map(t=>t.answer),['240','216','324','4.25','4000']);
});
test('Grade 8 data, chance and every evidence renderer agree with their supplied quantities',()=>{
 const{tools,Element}=toolHarness(),models=new Set();for(const t of L.allTasks.slice(800,1000)){
  const v=new Element('div');assert.equal(tools.draw(t,v),true,t.id);assert.ok(v.children.length);models.add(t.g8Model);
  if(t.g8Model==='statistics'){const sorted=[...t.values].sort((a,b)=>a-b);assert.equal(Number(t.answer),t.query==='mean'?t.values.reduce((a,b)=>a+b)/6:(sorted[2]+sorted[3])/2);}
  if(t.g8Model==='tokens'){assert.ok(L.equivalent(t.answer,`${t.counts[1]}/${t.counts[0]+t.counts[1]}`));assert.equal((v.children[0].innerHTML.match(/data-probability-token=/g)||[]).length,t.counts[0]+t.counts[1]);}
  if(t.g8Model==='pattern')assert.equal((v.children[0].innerHTML.match(/data-square-cell=/g)||[]).length,t.stage*t.stage);
  if(t.g8Model==='cartesian')assert.equal((v.children[0].innerHTML.match(/data-cartesian-point=/g)||[]).length,9);
  if(t.g8Model==='graph'){assert.equal((v.children[0].innerHTML.match(/data-signal-point=/g)||[]).length,5);assert.equal(Number(t.answer),t.query==='minimum'?Math.min(...t.values):Math.max(...t.values));}
 }
 assert.equal(L.missions[98].tasks[1].answer,'12.5');assert.equal(L.missions[98].practice[1].answer,'17');for(const model of['cartesian','angles','pythagoras','prism','stem','tokens'])assert.ok(models.has(model));
});
test('v4.5 content is preserved: all 1000 earlier activities and 157 arrangements are hash-locked',()=>{
 const crypto=require('node:crypto'),hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');assert.equal(hash(L.allTasks.slice(0,1000)),'9b23132a9c26072fcec0361cf43b006b5295c1d0b99b459f64c9a304cd1d2e65');assert.equal(hash(A.themes.slice(0,157)),'b8e9ab4f4bd14736ec96a989e3dbf57ac0fe256b581591de29729c17c4d0c837');
});
test('Grade 9 has twenty independent unlocks; every Adventure and alternate activity completes with isolated Review',()=>{
 assert.deepEqual(L.pathFor(9),{grade:9,title:'Horizon Station',start:100,count:20,reviewMusic:177});const p=L.normalize(null),practice=L.normalize(null);
 for(let m=100;m<120;m++){assert.equal(L.unlocked(p,9),m);assert.equal(L.missions[m].music,157+m-100);assert.equal(new Set([...L.missions[m].tasks,...L.missions[m].practice].map(({id,...t})=>JSON.stringify(t))).size,10,L.missions[m].id);complete(p,L.fresh('adventure',m));complete(practice,L.fresh('learn',m,1),true);}
 assert.equal(Object.keys(p.results).length,20);assert.deepEqual(practice.results,{});assert.equal(L.unlocked(practice,9),100);for(const g of[4,5,6,7,8])assert.equal(L.unlocked(p,g),(g-4)*20);
 const before=JSON.stringify(p.results),review=L.freshReview(p,9);assert.equal(L.music(review),177);assert.ok(review.plan.every(r=>r.mission>=100&&r.mission<120));complete(p,review);assert.equal(JSON.stringify(p.results),before);
});
test('Grade 9 migration preserves five earlier grade paths, settings and checkpoints, rejecting locked or cross-grade saves',()=>{
 const old=L.normalize(null);for(let m=0;m<100;m++)complete(old,L.fresh('adventure',m));old.sessions.adventure=L.fresh();old.sessions.adventure.draft='1000';for(const[g,m,draft]of[[5,28,'3/'],[6,46,'7/'],[7,60,'-3'],[8,91,'2']]){old.gradeSessions[g].learn=L.fresh('learn',m,1);old.gradeSessions[g].learn.draft=draft;L.hint(old.gradeSessions[g].learn);old.gradeSessions[g].revision=L.freshReview(old,g);}old.activeGrade=8;old.settings={music:.2,sfx:.5};delete old.gradeSessions[9];
 const p=L.normalize(JSON.parse(JSON.stringify(old)));assert.deepEqual(p.results,old.results);assert.deepEqual(p.sessions,old.sessions);for(const g of[5,6,7,8])assert.deepEqual(p.gradeSessions[g],old.gradeSessions[g]);assert.equal(L.unlocked(p,9),100);assert.deepEqual(p.settings,old.settings);
 p.activeGrade=9;p.gradeSessions[9].learn=L.fresh('learn',115,1);p.gradeSessions[9].learn.draft='2';L.hint(p.gradeSessions[9].learn);p.gradeSessions[9].revision=L.freshReview(p,9);assert.deepEqual(L.normalize(JSON.parse(JSON.stringify(p))),p);p.gradeSessions[9].adventure=L.fresh('adventure',101);assert.equal(L.normalize(p).gradeSessions[9].adventure,null);const bad=L.freshReview(p,9);bad.plan[2]={mission:80,bank:0,index:0};assert.equal(L.valid(bad),false);
});
test('Grade 9 negative exponents and scientific notation match exact rational references',()=>{
 for(const t of L.allTasks.slice(1000,1200).filter(t=>!['choice','cartesian'].includes(t.kind))){assert.match(t.answer,t.fractionEntry?/^[0-9/]+$/:t.signedEntry?/^-?[0-9]+$/:/^[0-9.]+$/,t.id);}
 for(const t of L.allTasks.slice(1000,1200).filter(t=>t.negativePower)){const r=L.rational(t.answer);assert.equal(r.n*BigInt(t.base)**BigInt(t.power),r.d);}
 for(const[bank,expected]of[['tasks',['-2','1/25','1/9','1/1000']],['practice',['-3','1/16','1/4','1/100']]])L.missions[101][bank].slice(0,4).forEach((t,i)=>assert.ok(L.equivalent(t.answer,expected[i])));
 for(const[bank,label,values]of[['tasks','4.5 × 10⁻⁴',['60','7.2','-3','0.0048']],['practice','7.2 × 10⁻⁵',['80','6.4','-3','0.0062']]]){const ts=L.missions[102][bank];assert.equal(ts[0].options.find(o=>String(o.value)===ts[0].answer).label,label);assert.deepEqual(ts.slice(1).map(t=>t.answer),values);}
 assert.equal(L.missions[100].tasks[0].answer,'-36');assert.equal(L.missions[100].practice[0].answer,'-49');
});
test('Grade 9 proportion, compound growth and linear equations satisfy independent numeric references',()=>{
 for(const t of L.allTasks.slice(1000,1200)){
  if(t.g9Model==='proportion')assert.equal(t.inverse?Number(t.answer)*t.newWorkers:Number(t.answer)*t.workers,t.inverse?t.workers*t.time:t.time*t.newWorkers);
  if(t.compound){let cents=t.principal*100;for(let y=0;y<t.years;y++)cents=cents*(100+t.rate)/100;assert.ok(L.equivalent(t.answer,String((cents-(t.query==='interest'?t.principal*100:0))/100)));}
  if(t.equation)assert.equal(t.a*(Number(t.answer)+t.c),t.a*(t.x+t.c));
 }
 assert.deepEqual(L.missions[104].tasks.slice(0,4).map(t=>t.answer),['1210','123','120','300']);assert.deepEqual(L.missions[104].practice.slice(0,4).map(t=>t.answer),['2420','164','120','330']);
});
// Small independent polynomial evaluator; accepts only x, integer constants, +/−, products and squares.
function polynomialAt(label,x,y=2){const s=label.replaceAll('−','-').replaceAll('²','^2').replaceAll('³','^3').replace(/\s/g,''),tokens=s.match(/\d+|[xy]|[()+*^/\-]/g)||[];assert.equal(tokens.join(''),s);let i=0;
 function atom(){let v;if(tokens[i]==='('){i++;v=sum();assert.equal(tokens[i++],')');}else if(['x','y'].includes(tokens[i])){v=tokens[i++]==='x'?x:y;}else{assert.match(tokens[i],/^\d+$/);v=Number(tokens[i++]);}if(tokens[i]==='^'){i++;const power=Number(tokens[i++]);assert.ok([2,3].includes(power));v**=power;}return v;}
 function product(){let v=atom();while(i<tokens.length&&tokens[i]!==')'&&!['+','-'].includes(tokens[i])){if(tokens[i]==='/'){i++;v/=atom();}else{if(tokens[i]==='*')i++;v*=atom();}}return v;}
 function sum(){let v=tokens[i]==='-'?(i++,-product()):product();while(['+','-'].includes(tokens[i])){const op=tokens[i++],w=product();v=op==='+'?v+w:v-w;}return v;}
 const result=sum();assert.equal(i,tokens.length);return result;
}
test('Grade 9 factorisation and binomial options have exactly one equivalent answer; fractions retain exclusions and zero products retain both roots',()=>{
 for(const t of L.allTasks.slice(1000,1200)){
  if(t.options){assert.equal(t.options.length,4);assert.equal(new Set(t.options.map(o=>o.label)).size,4,t.id);for(const o of t.options)assert.equal(typeof o.label,'string',t.id);}
  if(['expand','factor','differenceExpand','differenceFactor'].includes(t.algebra)){const expected=x=>t.algebra.startsWith('difference')?x*x-t.a*t.a:(x+t.a)*(x+t.b),matches=t.options.filter(o=>[-4,-1,0,2,5].every(x=>polynomialAt(o.label,x)===expected(x)));assert.equal(matches.length,1,t.id);assert.equal(String(matches[0].value),t.answer);}
  if(t.algebra==='fraction'){assert.equal(t.excluded,t.a);assert.match(t.prompt,new RegExp(`x ≠ ${t.a}`));const matches=t.options.filter(o=>[0,1,2,7].filter(x=>x!==t.a).every(x=>polynomialAt(o.label,x)===(x*x-t.a*t.a)/(x-t.a)));assert.equal(matches.length,1);assert.equal(String(matches[0].value),t.answer);}
  if(t.algebra==='roots'){const selected=t.options.find(o=>String(o.value)===t.answer).label;assert.equal(selected,`x = −${t.a} or −${t.b}`);assert.equal(Math.abs((-t.a+t.a)*(-t.a+t.b)),0);assert.equal(Math.abs((-t.b+t.a)*(-t.b+t.b)),0);}
 }
});
test('Grade 9 gradients, line equations and intercepts agree with independent coordinate differences',()=>{
 for(const t of L.allTasks.slice(1000,1200).filter(t=>t.g9Model==='line')){const[n,d]=t.slope,m=n/d,c=t.intercept,p=[-2,c-2*m],r=[2,c+2*m];if(t.query==='gradient')assert.ok(L.equivalent(t.answer,`${r[1]-p[1]}/${r[0]-p[0]}`));if(t.query==='x-intercept')assert.equal(m*Number(t.answer)+c,0);if(t.query==='y-intercept')assert.equal(Number(t.answer),c);if(t.query==='equation'){const parse=label=>{const match=label.match(/^y = (-?\d+)x ([+−]) (\d+)$/);assert.ok(match);return[Number(match[1]),Number(match[3])*(match[2]==='−'?-1:1)];},matches=t.options.filter(o=>{const[a,b]=parse(o.label);return a*p[0]+b===p[1]&&a*r[0]+b===r[1];});assert.equal(matches.length,1);assert.equal(String(matches[0].value),t.answer);}}
});
test('Grade 9 similarity, polygon angles, Pythagoras, transformations and cylinders use correct dimensional scaling',()=>{
 for(const t of L.allTasks.slice(1000,1200)){
  if(t.g9Model==='similar')assert.equal(Number(t.answer)/t.height,t.k);
  if(t.g9Model==='polygon')assert.equal(Number(t.answer),t.query==='sum'?(t.sides-2)*180:t.query==='interior'?180-360/t.sides:360/t.sides);
  if(t.g8Model==='pythagoras')assert.equal(Number(t.answer)**2,t.missing==='leg'?t.c*t.c-t.a*t.a:t.a*t.a+t.b*t.b);
  if(t.kind==='cartesian'){const id=Number(t.answer);assert.deepEqual([-2+(id-1)%3*2,-2+Math.floor((id-1)/3)*2],t.target);const expected=t.operation.startsWith('Enlarge')?t.from.map(n=>2*n):t.operation.startsWith('Reflect')?[t.from[1],t.from[0]]:[-t.from[1]||0,t.from[0]];assert.deepEqual(t.target,expected);}
  if(t.g9Model==='scale')assert.equal(Number(t.answer),t.value*t.k**(t.query==='area'?2:1));
  if(t.g9Model==='cylinder'){const hundredths=t.query==='volume'?314*t.radius*t.radius*t.height:2*314*t.radius*t.radius+2*314*t.radius*t.height;assert.ok(L.equivalent(t.answer,`${hundredths}/100`));assert.match(t.prompt,/π ≈ 3.14/);}
 }
});
test('Grade 9 outlier summaries and compound probability match enumerated sample spaces',()=>{
 for(const t of L.allTasks.slice(1000,1200)){
  if(t.g8Model==='statistics'){const a=[...t.values].sort((a,b)=>a-b);assert.equal(Number(t.answer),t.query==='mean'?a.reduce((a,b)=>a+b)/6:(a[2]+a[3])/2);}
  if(t.g9Model==='tree'){const outcomes=['HH','HT','TH','TT'],hits=outcomes.filter(s=>t.query==='one'?s.split('H').length===2:t.query==='heads'?s==='HH':t.query==='tails'?s==='TT':s.includes('H'));assert.deepEqual(t.success,hits);assert.ok(L.equivalent(t.answer,`${hits.length}/4`));}
  if(t.g9Model==='twoWay'){let hits=0;for(const coin of['H','T'])for(let die=1;die<=6;die++)if(coin==='H'&&(t.even?die%2===0:die%2===1))hits++;assert.ok(L.equivalent(t.answer,`${hits}/12`));}
  if(t.g9Model==='bag'){const tokens=Array.from({length:t.red+t.blue},(_,i)=>i<t.red?'R':'B');let hits=0;for(const first of tokens)for(const second of tokens)if(first==='B'&&second==='B')hits++;assert.ok(L.equivalent(t.answer,`${hits}/${tokens.length**2}`));}
 }
 assert.equal(L.missions[117].tasks[0].answer,'20');assert.equal(L.missions[117].tasks[1].answer,'12.5');
});
test('every Grade 9 evidence renderer exposes accessible task data, exact cell/point counts and touch controls',()=>{
 const{tools,Element}=toolHarness(),models=new Set();for(const t of L.allTasks.slice(1000,1200)){const v=new Element('div');assert.equal(tools.draw(t,v),true,t.id);assert.ok(v.children.length);models.add(t.g9Model||t.g8Model);if(t.g9Model&&t.g9Model!=='cards'){assert.equal(v.children[0].attrs.role,'img');assert.ok(v.children[0].attrs['aria-label'].length>35);assert.equal(tools.essential(t),true);}
  const html=v.children[0].innerHTML||'';if(t.g9Model==='frame')assert.equal((html.match(/data-border-cell=/g)||[]).length,4*t.stage+4);if(t.g9Model==='line')assert.equal((html.match(/data-line-point=/g)||[]).length,3);if(t.g9Model==='scatter')assert.equal((html.match(/data-scatter-point=/g)||[]).length,t.pairs.length);if(t.g9Model==='bag')assert.equal((html.match(/data-token=/g)||[]).length,t.red+t.blue);
  if(t.kind==='cartesian'){const s=L.fresh('learn',115),panel=new Element('div');assert.equal(tools.renderResponse(t,s,{panel,onChange:v=>s.draft=String(v),effect:()=>{}}),true);const button=panel.children[0].children.find(b=>b.dataset.plot===Number(t.answer));button.click();assert.equal(button.attrs['aria-pressed'],'true');assert.equal(L.equivalent(s.draft,t.answer),true);}
 }
 for(const name of['frame','binomial','line','similar','polygon','scale','cylinder','scatter','tree','twoWay','bag','cartesian','pythagoras','statistics'])assert.ok(models.has(name),name);
});
test('v4.6 content is preserved: 1200 previous activities and 178 arrangements remain byte-equivalent',()=>{
 const crypto=require('node:crypto'),hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');assert.equal(hash(L.allTasks.slice(0,1200)),'76a5695341344961e816e3591b2a1740e0d9ef48a29a5efb16dc9c645091cf69');assert.equal(hash(A.themes.slice(0,178)),'fc15bf245b35a01e40882a31af7ae2b5d2088d8183b19f0ab28439a97df76f29');
});
test('Grade 10 completes all twenty Adventure and alternate sets with isolated unlocks and revision',()=>{
 assert.deepEqual(L.pathFor(10),{grade:10,title:'Infinity Summit',start:120,count:20,reviewMusic:198});const p=L.normalize(null),practice=L.normalize(null);for(let m=120;m<140;m++){assert.equal(L.unlocked(p,10),m);assert.equal(L.missions[m].music,178+m-120);assert.equal(new Set([...L.missions[m].tasks,...L.missions[m].practice].map(({id,...t})=>JSON.stringify(t))).size,10,L.missions[m].id);complete(p,L.fresh('adventure',m));complete(practice,L.fresh('learn',m,1),true);}assert.equal(Object.keys(p.results).length,20);assert.deepEqual(practice.results,{});for(const g of[4,5,6,7,8,9])assert.equal(L.unlocked(p,g),(g-4)*20);const before=JSON.stringify(p.results),s=L.freshReview(p,10);assert.equal(L.music(s),198);assert.ok(s.plan.every(r=>r.mission>=120&&r.mission<140));complete(p,s);assert.equal(JSON.stringify(p.results),before);
});
test('Grade 10 migration keeps all six earlier paths, settings, hints, numeric/point drafts and revision plans',()=>{
 const old=L.normalize(null);for(let m=0;m<120;m++)complete(old,L.fresh('adventure',m));old.sessions.adventure=L.fresh();old.sessions.adventure.draft='1000';for(const[g,m,draft]of[[5,28,'3/'],[6,46,'7/'],[7,60,'-3'],[8,91,'2'],[9,101,'1/']]){old.gradeSessions[g].learn=L.fresh('learn',m,1);old.gradeSessions[g].learn.draft=draft;L.hint(old.gradeSessions[g].learn);old.gradeSessions[g].revision=L.freshReview(old,g);}old.activeGrade=9;old.settings={music:.2,sfx:.5};delete old.gradeSessions[10];const p=L.normalize(JSON.parse(JSON.stringify(old)));assert.deepEqual(p.results,old.results);assert.deepEqual(p.sessions,old.sessions);for(const g of[5,6,7,8,9])assert.deepEqual(p.gradeSessions[g],old.gradeSessions[g]);assert.deepEqual(p.settings,old.settings);assert.equal(L.unlocked(p,10),120);
 p.activeGrade=10;p.gradeSessions[10].learn=L.fresh('learn',127,1);p.gradeSessions[10].learn.draft='2';L.hint(p.gradeSessions[10].learn);p.gradeSessions[10].revision=L.freshReview(p,10);assert.deepEqual(L.normalize(JSON.parse(JSON.stringify(p))),p);p.gradeSessions[10].adventure=L.fresh('adventure',121);assert.equal(L.normalize(p).gradeSessions[10].adventure,null);const bad=L.freshReview(p,10);bad.plan[2]={mission:100,bank:0,index:0};assert.equal(L.valid(bad),false);
});
test('Grade 10 exact rational powers, surd bounds and keypad characters are valid for every numerical task',()=>{
 for(const t of L.allTasks.slice(1200)){if(!['choice','cartesian'].includes(t.kind))assert.match(t.answer,t.fractionEntry?/^[0-9/]+$/:t.signedEntry?/^-?[0-9]+$/:/^[0-9.]+$/,t.id);if(t.g10Model==='finance'){let cents=BigInt(t.principal)*100n;for(let y=0;y<t.years;y++)cents+=BigInt(t.rate)*(t.compound?cents:BigInt(t.principal)*100n)/100n;assert.ok(L.equivalent(t.answer,`${cents}/100`),t.id);}
 if(t.rationalPower){const value=L.rational(t.answer),n=BigInt(t.base)**BigInt(t.n),d=BigInt(t.d);assert.equal(t.negative?value.d**d:value.n**d,t.negative?value.n**d*n:value.d**d*n,t.id);}if(t.surd){const option=t.options.find(o=>String(o.value)===t.answer).label.match(/(\d+) and (\d+)/);assert.equal(Number(option[2])-Number(option[1]),1);assert.ok(Number(option[1])**2<t.surd&&Number(option[2])**2>t.surd);}}
 assert.equal(L.missions[120].tasks[2].answer,'3.142');assert.equal(L.missions[120].practice[2].answer,'2.718');
});
test('Grade 10 cubic, trinomial, grouped and fractional options are uniquely equivalent under independent evaluation',()=>{
 for(const t of L.allTasks.slice(1200)){
  if(t.options){assert.equal(t.options.length,4);assert.equal(new Set(t.options.map(o=>o.label)).size,4,t.id);t.options.forEach(o=>assert.equal(typeof o.label,'string',t.id));}
  if(['cube','cubicProduct','trinomial','cancelCube','fractionSum','grouping'].includes(t.algebra)){
   const expected=(x,y)=>t.algebra==='cube'?x**3+(t.plus?1:-1)*t.a**3:t.algebra==='cubicProduct'?(x+t.a)*(x*x+t.b*x+t.c):t.algebra==='trinomial'?(t.a*x+t.b)*(x+t.c):t.algebra==='cancelCube'?(x**3-t.a**3)/(x-t.a):t.algebra==='fractionSum'?1/(x-t.a)+(t.subtract?-1:1)/(x+t.a):(x+t.left)*(y+t.right);
   const xs=[-7,-5,0,5,7,11].filter(x=>!t.excluded?.includes(x)),matches=t.options.filter(o=>xs.every(x=>[1,3,5].every(y=>Math.abs(polynomialAt(o.label,x,y)-expected(x,y))<1e-9)));assert.equal(matches.length,1,t.id);assert.equal(String(matches[0].value),t.answer);if(t.excluded)for(const x of t.excluded)assert.ok(t.prompt.includes(String(Math.abs(x))),t.id);
  }
 }
});
test('Grade 10 quadratic options retain all and only roots; simultaneous solutions satisfy both equations',()=>{
 for(const t of L.allTasks.slice(1200)){
  if(t.quadratic){const [a,b,c]=t.coefficients,rootValues=[t.root,-t.numerator/t.denominator];assert.notEqual(rootValues[0],rootValues[1]);for(const x of rootValues)assert.ok(Math.abs(a*x*x+b*x+c)<1e-10);const selected=t.options.find(o=>String(o.value)===t.answer).label;assert.equal(selected,`x = ${t.root} or −${t.numerator}/${t.denominator}`);}
  if(t.g10Model==='system'){for(const[a,b,c]of t.rows)assert.equal(a*t.x+b*t.y,c);assert.equal(Number(t.answer),t.query==='x'?t.x:t.y);assert.notEqual(t.rows[0][0]*t.rows[1][1]-t.rows[1][0]*t.rows[0][1],0);}
 }
});
test('Grade 10 inequality options match their solution sets, endpoint inclusions and infinite bounds',()=>{
 for(const t of L.allTasks.slice(1200).filter(t=>t.inequality)){const matches=t.options.filter(o=>{const match=o.label.replaceAll('−','-').match(/^x ([<≥≤>]) (-?\d+)$/);assert.ok(match);const bound=Number(match[2]),op=match[1];return Array.from({length:41},(_,i)=>(i-20)/2).every(x=>{const actual=t.relation==='>'?t.a*x+t.c>t.rhs:t.a*x+t.c<=t.rhs,option=op==='<'?x<bound:op==='>'?x>bound:op==='≤'?x<=bound:x>=bound;return actual===option;});});assert.equal(matches.length,1,t.id);assert.equal(String(matches[0].value),t.answer);}
 for(const t of L.allTasks.slice(1200).filter(t=>t.g10Model==='interval')){const selected=t.options.find(o=>String(o.value)===t.answer).label.replaceAll('−','-');assert.equal(selected,`${t.lowClosed?'[':'('}${t.low}, ${t.high===null?'∞':t.high}${t.highClosed?']':')'}`);}
});
test('Grade 10 coordinate distances, midpoints and linear sequence positions agree with exact references',()=>{
 for(const t of L.allTasks.slice(1200)){
  if(t.g10Model==='segment'){if(t.query==='distance')assert.equal(Number(t.answer)**2,(t.r[0]-t.p[0])**2+(t.r[1]-t.p[1])**2);else{assert.deepEqual(t.target,[(t.p[0]+t.r[0])/2,(t.p[1]+t.r[1])/2]);const id=Number(t.answer);assert.deepEqual(t.target,[-2+(id-1)%3*2,-2+Math.floor((id-1)/3)*2]);}}
  if(t.g10Model==='sequence'){const n=t.query==='term'?t.n:Number(t.answer),term=t.first+(n-1)*t.diff;assert.equal(term,t.query==='term'?Number(t.answer):t.first+(t.n-1)*t.diff);}
 }
});
test('Grade 10 function values, excluded domains, intercepts, ranges and asymptote branches match their rules',()=>{
 const{tools,Element}=toolHarness();for(const t of L.allTasks.slice(1200).filter(t=>t.g10Model==='function')){const f=x=>t.family==='parabola'?t.a*x*x+t.offset:t.family==='reciprocal'?t.a/x+t.offset:t.a*t.base**x+t.offset;if(t.query==='value')assert.equal(Number(t.answer),f(t.x));if(t.query==='intercept')assert.equal(Number(t.answer),f(0));if(t.query==='asymptote')assert.equal(Number(t.answer),t.offset);if(t.query==='turning')assert.equal(t.options.find(o=>String(o.value)===t.answer).label,`(0, ${t.offset})`);if(t.query==='range'&&t.family==='parabola')assert.equal(t.options.find(o=>String(o.value)===t.answer).label,`y ${t.a>0?'≥':'≤'} ${t.offset}`);if(t.family==='reciprocal'&&t.query==='domain')assert.equal(t.options.find(o=>String(o.value)===t.answer).label,'All real x except 0');if(t.family==='reciprocal'&&t.query==='range')assert.equal(t.options.find(o=>String(o.value)===t.answer).label,`All real y except ${t.offset}`);
  if(t.query==='equation'){const matches=t.options.filter(o=>{const s=o.label.replace(/^y = /,'');return[-2,2].every(x=>Math.abs(polynomialAt(s,x)-f(x))<1e-10);});assert.equal(matches.length,1);assert.equal(String(matches[0].value),t.answer);}
  const v=new Element('div');tools.draw(t,v);const html=v.children[0].innerHTML;assert.equal((html.match(/data-function-branch=/g)||[]).length,t.family==='reciprocal'?2:1);assert.doesNotMatch(html,/NaN|Infinity/);
 }
});
test('Grade 10 trigonometry, signed coordinate ratios, special angles and survey geometry are consistent',()=>{
 for(const t of L.allTasks.slice(1200)){
  if(t.g10Model==='triangle'){assert.equal(t.opposite**2+t.adjacent**2,Math.round(t.hypotenuse**2));const parts=t.query==='sin'?[t.opposite,t.hypotenuse]:t.query==='cos'?[t.adjacent,t.hypotenuse]:t.query==='tan'?[t.opposite,t.adjacent]:[t.hypotenuse,t.adjacent];assert.ok(L.equivalent(t.answer,`${parts[0]}/${parts[1]}`));}
  if(t.g10Model==='trigPoint'){const[x,y]=t.point,r=Math.hypot(x,y),expected=(t.query==='sin'?y:x)/r,label=t.options.find(o=>String(o.value)===t.answer).label;assert.ok(L.equivalent(label,String(expected)));}
  if(t.g10Model==='wave'&&t.family!=='tan')assert.equal(Number(t.answer),t.offset+(t.query==='maximum'?1:-1)*Math.abs(t.a));
  if(t.g10Model==='survey'){assert.equal(Number(t.answer),t.query==='height'?t.opposite:t.adjacent);if(t.angleLabel==='30°')assert.ok(Math.abs(t.opposite/Math.hypot(t.opposite,t.adjacent)-.5)<1e-12);if(t.angleLabel==='45°')assert.equal(t.opposite,t.adjacent);if(t.angleLabel.includes('3/4'))assert.ok(L.equivalent(`${t.opposite}/${t.adjacent}`,'3/4'));}
 }
});
test('Grade 10 solids, scaling and midpoint geometry preserve dimensional units and all required faces',()=>{
 for(const t of L.allTasks.slice(1200)){
  if(t.g10Model==='solid'){let expected;if(t.shape==='cone')expected=t.query==='volume'?314*t.r*t.r*t.h/300:314*t.r*(t.r+Math.hypot(t.r,t.h))/100;else if(t.shape==='sphere')expected=t.query==='volume'?4*314*t.r**3/300:4*314*t.r*t.r/100;else if(t.shape==='pyramid')expected=t.query==='volume'?(2*t.r)**2*t.h/3:(2*t.r)**2+4*t.r*Math.hypot(t.r,t.h);else expected=314*t.r*t.r*t.cylinderHeight/100+314*t.r*t.r*t.coneHeight/300;assert.ok(L.equivalent(t.answer,expected.toFixed(2)),t.id);}
  if(t.g10Model==='midline')assert.equal(Number(t.answer),t.query==='midline'?t.base/2:t.base);if(t.scaleFactor)assert.equal(Number(t.answer),t.scaleFactor**t.dimension);
 }
});
test('Grade 10 quartiles, estimated grouped means and Venn regions match independently counted records',()=>{
 for(const t of L.allTasks.slice(1200)){
  if(t.g10Model==='box'){assert.equal(t.values.length,8);assert.deepEqual([...t.values].sort((a,b)=>a-b),t.values);const lo=(t.values[1]+t.values[2])/2,hi=(t.values[5]+t.values[6])/2;assert.equal(Number(t.answer),t.query==='q1'?lo:(hi-lo)/(t.query==='semi'?2:1));}
  if(t.g10Model==='grouped'){const expanded=t.counts.flatMap((n,i)=>Array(n).fill(i*10+5));if(t.query==='mean')assert.equal(Number(t.answer),expanded.reduce((a,b)=>a+b)/expanded.length);else{const i=t.counts.indexOf(Math.max(...t.counts));assert.equal(t.options.find(o=>String(o.value)===t.answer).label,`${i*10} ≤ t < ${(i+1)*10}`);}}
  if(t.g10Model==='venn'){const people=t.regions.flatMap((n,i)=>Array(n).fill(i)),hits=people.filter(i=>t.query==='union'?i!==3:t.query==='both'?i===1:i>=2);assert.ok(L.equivalent(t.answer,`${hits.length}/${people.length}`));}
 }
});
test('every Grade 10 diagram is accessible, finite and backed by the correct evidence model; midpoint touch selection works',()=>{
 const{tools,Element}=toolHarness(),models=new Set();for(const t of L.allTasks.slice(1200)){const v=new Element('div');assert.equal(tools.draw(t,v),true,t.id);assert.ok(v.children.length);models.add(t.g10Model||t.g9Model);if(t.g10Model&&t.g10Model!=='cards'){assert.equal(v.children[0].attrs.role,'img');assert.ok(v.children[0].attrs['aria-label'].length>35);assert.equal(tools.essential(t),true);assert.doesNotMatch(v.children[0].innerHTML,/NaN|Infinity/);}
  if(t.kind==='cartesian'){const s=L.fresh('learn',127),panel=new Element('div');assert.equal(tools.renderResponse(t,s,{panel,onChange:v=>s.draft=String(v),effect:()=>{}}),true);const b=panel.children[0].children.find(b=>b.dataset.plot===Number(t.answer));b.click();assert.equal(b.attrs['aria-pressed'],'true');assert.equal(s.draft,t.answer);assert.equal((v.children[0].innerHTML.match(/data-midpoint-candidate=/g)||[]).length,9);}
 }
 for(const name of['finance','system','interval','sequence','segment','function','triangle','wave','trigPoint','survey','midline','solid','box','grouped','venn'])assert.ok(models.has(name),name);
});
