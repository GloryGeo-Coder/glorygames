const {test}=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const gameDir=path.join(__dirname,'../public/games/swipe-racer');
const C=require(path.join(gameDir,'campaign.js'));
const source=fs.readFileSync(path.join(gameDir,'game.js'),'utf8').replace(/\r\n/g,'\n');
function runtime({width=390,height=620,broken=false,save=null}={}) {
  const data=new Map(save?Object.entries(save):[]),events={},nodes={},frames=[];
  const store={getItem(k){if(broken)throw Error('blocked');return data.get(k)||null;},setItem(k,v){if(broken)throw Error('quota');data.set(k,v);}};
  const ctx=new Proxy({},{get:(_,key)=>key==='createLinearGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
  const node=id=>nodes[id]||=( {style:{},dataset:{},hidden:false,textContent:'',children:[],replaceChildren(){this.children=[];},append(x){this.children.push(x);},addEventListener(k,fn){events[id+':'+k]=fn;},getContext:()=>ctx,getBoundingClientRect:()=>({width,height,left:0,top:0})});
  const box={document:{getElementById:node,createElement:()=>({dataset:{}}),addEventListener(k,fn){events[k]=fn;}},window:{innerWidth:width,innerHeight:height,devicePixelRatio:1,localStorage:store,addEventListener(k,fn){events[k]=fn;},parent:{postMessage(){}}},localStorage:store,Image:class{},fetch:async()=>({json:async()=>({title:'Swipe Racer'})}),requestAnimationFrame:fn=>frames.push(fn),performance:{now:()=>1000},setInterval:()=>1,clearInterval(){},Math,console};
  vm.createContext(box);vm.runInContext(fs.readFileSync(path.join(gameDir,'campaign.js'),'utf8'),box);
  vm.runInContext(source.replace('  resetRun();\n  showCampaignMenu();','  globalThis.probe={state,player,step,draw,resize,loadLevel,currentLevel,completeLevel,endGame,useBoost,selectEvent,showCampaignMenu,spawnTraffic,projectEntity,getCampaign:()=>campaign,getMode:()=>mode};\n  resetRun();\n  showCampaignMenu();'),box);
  box.probe.resize();return {...box.probe,nodes,events,data,box};
}
function start(r,index=0){r.selectEvent(index);r.nodes.btnStart.onclick();r.state.spawnT=999;r.state.pickupT=999;}
function finish(r){r.state.distance=r.currentLevel().targetDistance;r.state.elapsed=20;r.completeLevel();}
test('save validation rejects corrupt/old data and derives locks from contiguous completion',()=>{
  for(const value of [null,{},[],{version:0,results:{}},{version:1,results:{'first-light':{completed:'yes'}}}])assert.equal(C.unlocked(C.normalize(value)),0);
  const save=C.normalize({version:1,results:{'first-light':{completed:true,stars:Infinity,score:-5,time:'bad'},'metro-ticket':{completed:true}}});
  assert.equal(save.results['first-light'].stars,1);assert.equal(save.results['first-light'].time,null);assert.equal(C.unlocked(save),1);
  assert.equal(C.load({getItem:()=>'{bad'}).version,1);
});
test('completion unlocks all five events without random bonuses and replays retain personal bests',()=>{
  const r=runtime();assert.equal(r.nodes.eventList.children.filter(x=>!x.disabled).length,1);
  for(let i=0;i<5;i++){start(r,i);r.state.hits=2;r.state.elapsed=30;r.state.distance=r.currentLevel().targetDistance;r.state.totalScore=400+i;r.completeLevel();assert.ok(r.getCampaign().results[C.EVENTS[i].id]);}
  assert.equal(C.unlocked(r.getCampaign()),4);
  start(r,0);r.state.totalScore=900;r.state.boostsUsed=1;r.state.elapsed=10;r.state.distance=600;r.completeLevel();
  const best=r.getCampaign().results['first-light'];assert.equal(best.stars,3);assert.equal(best.score,900);assert.equal(best.time,10);
  start(r,0);r.state.totalScore=100;r.state.hits=2;finish(r);assert.deepEqual(r.getCampaign().results['first-light'],best);
  const reload=runtime({save:Object.fromEntries(r.data)});assert.equal(C.unlocked(reload.getCampaign()),4);assert.equal(reload.nodes.best.textContent,'900');
});
test('storage failures keep the game and in-session unlocks alive; legacy best survives',()=>{
  const r=runtime({broken:true});start(r);finish(r);assert.equal(C.unlocked(r.getCampaign()),1);assert.match(r.nodes.panelText.textContent,/storage is unavailable/);
  start(r,1);r.endGame('test');r.nodes.btnStart.onclick();assert.equal(r.state.running,true);
  const legacy=runtime({save:{wga_swipe_racer_best_v2:'9876',[C.KEY]:'bad'}});assert.equal(legacy.nodes.best.textContent,'9876');assert.equal(C.unlocked(legacy.getCampaign()),0);
});
test('clock freezes on pause/background; deadline failure and retry never unlock an event',()=>{
  const r=runtime();start(r);finish(r);start(r,1);r.step(.03);
  r.nodes.btnPause.onclick();const t=r.state.elapsed;r.step(10);assert.equal(r.state.elapsed,t);
  r.nodes.btnStart.onclick();r.box.document.hidden=true;r.events.visibilitychange();r.step(10);assert.equal(r.state.elapsed,t);
  r.nodes.btnStart.onclick();r.state.elapsed=33;r.step(.001);assert.equal(r.state.gameOver,true);assert.equal(C.unlocked(r.getCampaign()),1);
  r.nodes.btnStart.onclick();assert.equal(r.state.levelIndex,1);assert.equal(r.state.elapsed,0);assert.equal(r.state.totalScore,0);assert.equal(r.state.lives,3);
});
test('delivery milestones, clean/nitro stars and locked selections are deterministic',()=>{
  const r=runtime();r.selectEvent(4);assert.equal(r.state.levelIndex,0);
  for(let i=0;i<2;i++){start(r,i);finish(r);}start(r,2);
  r.state.distance=699;r.step(.03);assert.equal(r.state.deliveryMarker,2);
  r.useBoost();assert.equal(r.state.boostsUsed,1);assert.equal(C.stars(r.currentLevel(),r.state),3);
  r.state.hits=1;assert.equal(C.stars(r.currentLevel(),r.state),2);
});
test('classic route progression and current-level starting score retry remain accessible',()=>{
  const r=runtime();r.nodes.btnClassic.onclick();assert.equal(r.getMode(),'classic');assert.equal(r.currentLevel().name,'Metro Rush');
  r.state.totalScore=700;r.loadLevel(2);r.nodes.btnStart.onclick();r.state.totalScore=900;r.endGame('test');r.nodes.btnStart.onclick();
  assert.equal(r.state.levelIndex,2);assert.equal(r.state.totalScore,700);assert.equal(r.currentLevel().scenery,'coast');
  r.showCampaignMenu();assert.equal(r.state.levelIndex,0);
});
test('every Metro finish is achievable without pickups or near misses using normal frame steps',()=>{
  const r=runtime();
  for(let i=0;i<5;i++){
    start(r,i);
    for(let frame=0;frame<3000&&r.state.running;frame++)r.step(.016);
    assert.equal(r.state.levelClear,true,C.EVENTS[i].id);
    assert.equal(r.state.gameOver,false);assert.equal(r.state.near,0);assert.equal(r.state.boostsCollected,0);
    assert.ok(!r.currentLevel().limit||r.state.elapsed<r.currentLevel().limit);
  }
});
for(const [width,height] of [[320,450],[390,620],[844,280],[1440,760]])test('steering, collision, interrupted input and rendering '+width+'x'+height,()=>{
  const r=runtime({width,height});start(r);const center=r.player.x;
  r.events.keydown({key:'ArrowLeft',preventDefault(){}});r.step(.016);assert.ok(r.player.x<center);
  r.events['c:pointerdown']({pointerId:1,clientX:100,clientY:100});r.nodes.btnPause.onclick();
  r.events['c:pointermove']({pointerId:1,clientX:300,clientY:100});r.events['c:pointercancel']({type:'pointercancel',pointerId:1,clientX:300,clientY:100});assert.equal(r.state.boostsUsed,0);
  r.nodes.btnStart.onclick();r.player.x=r.player.targetX=width/2;
  const tr={type:'car',key:'red',lane:1,t:.1,speedF:1,nearGiven:false};
  for(let t=.1;t<1;t+=.002){tr.t=t;if(Math.abs(r.projectEntity(tr).y-r.player.y)<2)break;}
  r.state.traffic=[tr];r.step(.001);assert.equal(r.state.hits,1);assert.equal(r.state.lives,2);assert.ok(r.state.collisionSlow>0);
  r.draw(1000);r.nodes.btnRestart.onclick();assert.equal(r.state.hits,0);assert.equal(r.state.boostEnergy,2);
  for(let i=0;i<20;i++)r.spawnTraffic();assert.ok(new Set(r.state.traffic.map(t=>t.lane)).size<=2);
});
