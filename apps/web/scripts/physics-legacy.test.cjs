const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'../public/games/physics-force-lab'),V=require(path.join(root,'legacy-visuals'));
test('original twelve level definitions and all extra experiment questions remain byte-equivalent',()=>{
  const code=fs.readFileSync(path.join(root,'game.js'),'utf8');for(const [name,end,hash]of [['LEVELS','MUSIC','03dc2853478c2e2ea9f9b548106bc139bae2c419ce697ad715f73aaceae69c05'],['EXTRA_QUIZZES','LESSON_STEPS','faf1619424f04acaa98f73e81f587b688b30c994bdb2c8a62daddd0a3bd7fb4d']])assert.equal(crypto.createHash('sha256').update(code.slice(code.indexOf('  const '+name),code.indexOf('  const '+end))).digest('hex'),hash);
});
test('legacy rendering keeps world height fixed and inverts display scaling across portrait and landscape',()=>{
  for(const [w,h]of [[320,260],[390,500],[568,145],[844,200],[1440,650]]){const v=V.viewport(w,h,3);assert.equal(v.worldHeight,720);assert.equal(v.dpr,2);assert.ok(v.scale>=.55&&v.scale<=1);assert.ok(Math.abs(v.width*v.scale-w)<1e-8);assert.ok(Math.abs(v.height*v.scale-h)<1e-8);}
});
function trace(kind,time,reduced=false,extra={}){const calls=[],ctx=new Proxy({},{get:(_,key)=>key==='fillStyle'?undefined:(...args)=>calls.push([key,...args]),set:(_,key,value)=>{calls.push([key,value]);return true;}});V.draw(ctx,kind,{x:0,y:0,w:58,h:92,time,walking:true,facing:1,reduced,...extra});return calls;}
test('scientist and all robot classes have changing articulated frames',()=>{
  for(const kind of ['player','professor','glitch','drone','magnetBot','boss','helper']){const a=trace(kind,.1),b=trace(kind,.4);assert.notDeepEqual(a,b,kind);assert.ok(a.some(c=>c[0]==='rotate'));for(const call of a)for(const n of call.slice(1))if(typeof n==='number')assert.ok(Number.isFinite(n));}
});
test('reduced motion produces stable decorative frames and player jump/tool poses are distinct',()=>{
  for(const kind of ['player','glitch','drone','magnetBot','boss'])assert.deepEqual(trace(kind,.1,true),trace(kind,3,true));
  assert.notDeepEqual(trace('player',.1,false,{airborne:true}),trace('player',.1,false,{airborne:false}));assert.notDeepEqual(trace('player',.1,false,{attacking:true}),trace('player',.1,false,{attacking:false}));
});
test('legacy entry exposes accessible dialogs and independently labelled touch controls',()=>{
  const html=fs.readFileSync(path.join(root,'original-labs.html'),'utf8');assert.match(html,/<dialog id="overlay"/);assert.match(html,/<dialog id="quizPanel"/);assert.match(html,/legacy-visuals.js/);for(const id of ['leftBtn','rightBtn','jumpBtn','toolBtn','blastBtn'])assert.match(html,new RegExp(`id="${id}"[^>]*aria-label=`));
});
