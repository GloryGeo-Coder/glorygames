'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(process.env.WORD_DASH_SOURCE || path.join(__dirname,'../public/games/word-dash/game.js'),'utf8');
function game() {
  let now=0,frame;
  const nodes={},events={},storage=new Map();
  function element(tagName='DIV') {
    return {tagName,style:{setProperty(){}},classList:{add(){},remove(){}},children:[],textContent:'',value:'copy',
      addEventListener(type,fn){this[type]=fn;},appendChild(child){this.children.push(child);},remove(){},
      focus(){document.activeElement=this;}};
  }
  const document={hidden:false,activeElement:null,getElementById:id=>nodes[id]||=(element(id.startsWith('btn')?'BUTTON':'DIV')),createElement:element,addEventListener:(type,fn)=>{events[type]=fn;}};
  const sandbox={document,window:{innerWidth:390,innerHeight:844,WordDashVocabulary:{BRAIN:'Thinking organ'},addEventListener:(type,fn)=>{events[type]=fn;},parent:{postMessage(){}}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},performance:{now:()=>now},fetch:async()=>({json:async()=>({})}),setTimeout(){},setInterval:()=>1,clearInterval(){},requestAnimationFrame:fn=>{frame=fn;},console,Math};
  vm.createContext(sandbox);
  vm.runInContext(source.replace('  buildKeys();','  globalThis.qa = {state, setTarget, updateHUD};\n  buildKeys();'),sandbox);
  const {state,setTarget,updateHUD}=sandbox.qa;
  const click=id=>nodes[id].click();
  function key(value,target=document.activeElement){events.keydown({key:value,target,preventDefault(){}});}
  function word({wrong=false,hint=false,keypad=false}={}) {
    setTarget('BRAIN');
    if(hint)click('btnHint');
    for(const ch of (wrong?'XXXXX':hint?'RAIN':'BRAIN')){
      if(keypad)nodes.keys.children.flatMap(row=>row.children).find(button=>button.textContent===ch).click();
      else key(ch);
    }
    click('btnEnter');
  }
  return {state,nodes,events,document,storage,click,key,word,updateHUD,advance(ms){now+=ms;},frame(ms=0){now+=ms;frame(now);},start(){click('btnStart');}};
}
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,actual+' !== '+expected);
for(const [fps,frames,every] of [[10,200,33],[50,1000,165]])test(fps+' FPS: six typed words over twenty active seconds display 18 WPM',()=>{
  const g=game();g.start();
  for(let i=1;i<=frames;i++){g.frame(1000/fps);if(i%every===0)g.word();}
  assert.equal(g.state.correctChars,30);assert.equal(g.state.runWords,6);
  assert.equal(g.nodes.wpm.textContent,'18 WPM');close(g.state.activeSeconds,20);
  // The legacy simulation cap remains independent of the WPM clock.
  if(fps===10)assert.ok(g.state.timeLeft>40);
});
test('idle before start and an unpaused long frame gap count only the real active interval',()=>{
  const g=game();g.advance(90000);g.start();g.frame(20000);
  close(g.state.activeSeconds,20);close(g.state.timeLeft,44.95);
});
for(const resume of ['btnPause','btnStart'])test('suspended rendering during pause, resumed with '+resume,()=>{
  const g=game();g.start();g.frame(20);g.advance(980);g.click('btnPause');
  g.advance(60000);g.click(resume);g.frame(1000);
  close(g.state.activeSeconds,2);g.word();assert.equal(g.nodes.wpm.textContent,'30 WPM');
});
test('multiple rapid pause/resume transitions between frames neither lose active time nor count pauses',()=>{
  const g=game();g.start();g.advance(200);g.click('btnPause');g.advance(300);g.click('btnStart');
  g.advance(100);g.click('btnPause');g.advance(400);g.click('btnPause');g.frame(1000);
  close(g.state.activeSeconds,1.3);
});
test('How to play pauses the metric and UI Start resumes it',()=>{
  const g=game();g.start();g.advance(1000);g.click('btnInfo');g.frame(30000);g.click('btnStart');g.frame(1000);
  close(g.state.activeSeconds,2);
});
test('host pause/unpause messages account at event boundaries even with no intervening frames',()=>{
  const g=game();g.start();g.advance(1000);g.events.message({data:{type:'GG_PAUSE',paused:true}});
  g.advance(60000);g.events.message({data:{type:'GG_PAUSE',payload:{paused:false}}});g.frame(1000);
  close(g.state.activeSeconds,2);
});
test('background time is excluded; foreground waits for explicit resume',()=>{
  const g=game();g.start();g.advance(1000);g.document.hidden=true;g.events.visibilitychange();
  g.advance(60000);g.document.hidden=false;g.events.visibilitychange();g.frame(10000);
  g.click('btnStart');g.frame(1000);close(g.state.activeSeconds,2);
});
test('a host unpause while hidden cannot count hidden time or lose the following visible interval',()=>{
  const g=game();g.start();g.advance(1000);g.document.hidden=true;g.events.visibilitychange();
  g.advance(20000);g.events.message({data:{type:'GG_PAUSE',paused:false}});g.frame(20000);
  g.document.hidden=false;g.events.visibilitychange();g.frame(1000);close(g.state.activeSeconds,2);
});
test('submissions and level-clear boundaries between frames use current time; inter-level waits are excluded',()=>{
  const g=game();g.start();
  for(let i=0;i<8;i++){g.advance(1000);g.word();}
  assert.equal(g.state.levelClear,true);close(g.state.activeSeconds,8);assert.match(g.nodes.panelText.textContent,/60 WPM/);
  g.advance(60000);g.frame();close(g.state.activeSeconds,8);g.click('btnStart');
  assert.equal(g.state.levelIndex,1);g.advance(5000);g.word();close(g.state.activeSeconds,13);
  assert.equal(g.nodes.wpm.textContent,'42 WPM');
});
test('game-over stops the clock and restart clears metric history without charging old frame time',()=>{
  const g=game();g.start();
  for(let i=0;i<6;i++){g.advance(1000);g.word({wrong:true});g.click('btnClear');}
  assert.equal(g.state.gameOver,true);close(g.state.activeSeconds,6);
  g.frame(60000);close(g.state.activeSeconds,6);g.click('btnStart');close(g.state.activeSeconds,0);
  g.advance(1000);g.word();assert.equal(g.nodes.wpm.textContent,'60 WPM');
  g.advance(1000);g.click('btnRestart');g.frame(1000);close(g.state.activeSeconds,1);assert.equal(g.state.correctChars,0);
  g.advance(1000);g.events.message({data:{type:'GG_RESTART'}});g.frame(1000);close(g.state.activeSeconds,1);
});
test('focus changes, spelling edits, hints, freeze and independent audio controls retain metric accounting',()=>{
  const g=game();g.nodes.challengeMode.value='spelling';g.start();assert.match(g.nodes.target.textContent,/Spell/);
  g.advance(1000);g.key('X');g.click('btnBack');g.word({hint:true,keypad:true});
  assert.equal(g.state.correctChars,4);assert.equal(g.state.runWords,1);assert.equal(g.nodes.wpm.textContent,'48 WPM');
  g.click('btnMute');g.click('btnMusic');assert.equal(g.nodes.btnMute.textContent,'Muted');assert.equal(g.nodes.btnMusic.textContent,'Music off');
  g.document.activeElement=g.nodes.btnEnter;g.key('Enter');assert.equal(g.state.runWords,1);
  g.click('btnFreeze');const left=g.state.timeLeft;g.frame(1000);close(g.state.timeLeft,left);close(g.state.activeSeconds,2);
  g.word({keypad:true});assert.equal(g.state.correctChars,9);assert.equal(g.nodes.accuracy.textContent,'100%');assert.equal(g.nodes.wpm.textContent,'54 WPM');
});
test('all four worlds retain cumulative WPM, accuracy and saved best; victory then resets the run',()=>{
  const g=game();g.start();
  for(const count of [8,10,12,15]){
    for(let i=0;i<count;i++){g.advance(1000);g.word();}
    assert.equal(g.state.levelClear,true);assert.equal(g.nodes.wpm.textContent,'60 WPM');
    const active=g.state.activeSeconds;g.frame(60000);close(g.state.activeSeconds,active);
    if(!g.state.victory)g.click('btnStart');
  }
  assert.equal(g.state.victory,true);assert.equal(g.state.runWords,45);assert.equal(g.nodes.accuracy.textContent,'100%');
  assert.ok(Number(g.storage.get('gg_word_dash_best_v2'))>0);
  g.click('btnStart');assert.equal(g.state.levelIndex,0);close(g.state.activeSeconds,0);assert.equal(g.state.runWords,0);
});
test('simulation timeout settles real time once and repeated inactive host messages add nothing',()=>{
  const g=game();g.events.message({data:{type:'GG_PAUSE',paused:false}});g.frame(10000);close(g.state.activeSeconds,0);
  g.start();g.state.timeLeft=.01;g.frame(1000);assert.equal(g.state.gameOver,true);close(g.state.activeSeconds,1);
  for(let i=0;i<3;i++){g.advance(1000);g.events.message({data:{type:'GG_PAUSE',paused:false}});}
  g.frame();close(g.state.activeSeconds,1);
});
