'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'../public/games/science-lab-dash');
const Audio=require(path.join(root,'arcade-audio')),art=require(path.join(root,'arcade-art')),icons=require(path.join(root,'arcade-icons'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function labs(){const src=fs.readFileSync(path.join(root,'game.js'),'utf8'),box={};vm.runInNewContext(src.slice(0,src.indexOf('  const canvas ='))+'globalThis.levels=LEVELS;})();',box);return box.levels;}
test('new arcade atlas has twelve unique padded transparent poses with reproducible source provenance',()=>{
 const data=art.data,im=require('./helpers/kasi-png.cjs').rgba(path.join(root,data.src));assert.equal(im.w,768);assert.equal(im.h,576);assert.ok(fs.statSync(path.join(root,data.src)).size<650000);
 const frames=new Set();for(let n=0;n<12;n++){const cell=Buffer.alloc(192*192*4);let visible=0;for(let y=0;y<192;y++)for(let x=0;x<192;x++){const at=((Math.floor(n/4)*192+y)*im.w+n%4*192+x)*4;im.out.copy(cell,(y*192+x)*4,at,at+4);if(im.out[at+3]>8)visible++;if(x===0||x===191||y===0||y===191)assert.equal(im.out[at+3],0);}assert.ok(visible>3000);frames.add(crypto.createHash('sha256').update(cell).digest('hex'));}assert.equal(frames.size,12);
 assert.equal(data.sourceHash,hash(path.resolve(__dirname,'../../../tools/science-arcade-source/creatures.webp')));assert.equal(data.builderHash,hash(path.resolve(__dirname,'../../../tools/build-science-arcade.cjs')));
});
test('slime, robot and guardian sequences animate and reduced motion holds a stable pose',()=>{
 for(const kind of ['slime','robot','guardian']){const seen=new Set();for(let n=0;n<40;n++)seen.add(art.frame(kind,n/20).index);assert.equal(seen.size,4);for(const t of [0,.2,1,5,100])assert.equal(art.frame(kind,t,true).index,art.frame(kind,0,true).index);assert.equal(art.frame(kind,NaN).index,art.frame(kind,0).index);}assert.equal(art.frame('unknown'),null);
});
test('every original collectible, hazard, power-up and question has an intentional equipment pictogram',()=>{
 const ids=new Set([...labs().flatMap(l=>[...l.collectibles,...l.hazards]),'shield','slow','magnet','double','quiz']);assert.equal(ids.size,112);for(const id of ids){const svg=icons.svg(id);assert.ok(svg,id);assert.match(svg,/<svg/);assert.doesNotMatch(svg,/NaN|undefined|<script|onload=/);}assert.equal(icons.svg('unknown'),null);
});
test('all twenty original levels have distinct original phrases, harmony and bass',()=>{
 assert.equal(Audio.tracks.length,labs().length);const melodies=new Set();for(const t of Audio.tracks){assert.ok(t.name);assert.equal(t.melody.length,16);assert.equal(t.chords.length,4);assert.equal(t.bass.length,4);assert.ok(t.bpm>=90&&t.bpm<=140);assert.ok(t.melody.every(n=>Number.isFinite(n)&&t.root+n>=40&&t.root+n<=95));melodies.add(JSON.stringify([t.root,t.bpm,t.melody,t.chords,t.bass]));}assert.equal(melodies.size,20);
});
function fakeAudio(){
 const timers=new Set(),notes=[],stopped=[],gains=[];
 const param=()=>({setValueAtTime(v){assert.ok(Number.isFinite(v));},exponentialRampToValueAtTime(v){assert.ok(v>0&&Number.isFinite(v));},cancelScheduledValues(){}});
 const node=()=>({connect(){},disconnect(){},start(){},stop(){stopped.push(this);}});
 class AC{constructor(){this.currentTime=0;this.state='running';this.destination={};this.sampleRate=8000;}createGain(){const n={...node(),gain:param()};gains.push(n);return n;}createDynamicsCompressor(){return node();}createOscillator(){return {...node(),frequency:{setValueAtTime(v){notes.push(v);assert.ok(v>0&&Number.isFinite(v));},exponentialRampToValueAtTime(v){assert.ok(v>0&&Number.isFinite(v));}}};}createBuffer(ch,n){return {getChannelData:()=>new Float32Array(n)};}createBufferSource(){return node();}createBiquadFilter(){return {...node(),frequency:param(),Q:{value:0}};}}
 const box={AudioContext:AC,setInterval(f){timers.add(f);return f;},clearInterval(f){timers.delete(f);}};vm.runInNewContext(fs.readFileSync(path.join(root,'arcade-audio.js'),'utf8'),box);return {A:box.ScienceArcadeAudio,timers,notes,stopped,gains};
}
test('effects never restart a music phrase, pause clears scheduled nodes and only one music timer is owned',()=>{
 const {A,timers,notes}=fakeAudio(),a=new A();assert.equal(a.ctx,null);a.play(0);assert.equal(timers.size,0);assert.ok(a.unlock());a.play(0);assert.equal(timers.size,1);const step=a.step,timer=a.timer;for(const kind of ['collect','shoot','hurt','correct','wrong','power','shield','hit','lane','question','boss','level','fail'])a.effect(kind);assert.equal(a.step,step);assert.equal(a.timer,timer);a.play(0);assert.equal(a.timer,timer);assert.ok(notes.length>25);a.play(19);assert.equal(a.index,19);assert.equal(timers.size,1);a.stop();assert.equal(timers.size,0);assert.equal(a.nodes.size,0);
});
test('music and effects mute independently, volume changes stop existing sound and resume uses the selected lab',()=>{
 const {A,timers}=fakeAudio(),a=new A();a.unlock();a.play(7);a.effect('power');a.setVolume('music',0);assert.equal(timers.size,0);assert.ok([...a.nodes.values()].every(c=>c==='effects'));a.setVolume('effects',0);assert.equal(a.nodes.size,0);a.setVolume('music',.4);a.play(7);assert.equal(a.index,7);assert.equal(timers.size,1);a.setVolume('effects',.7);a.effect('correct');assert.ok([...a.nodes.values()].includes('effects'));a.stop();
});
test('scheduler skips elapsed background time instead of scheduling a backlog and tracks remain finite',()=>{
 const {A,timers}=fakeAudio(),a=new A();a.unlock();for(let index=0;index<20;index++){a.play(index);const before=a.step;a.ctx.currentTime+=3600;a.tick();assert.ok(a.step-before<=4);assert.ok(Number.isFinite(a.nextTime));assert.ok(a.nodes.size<=96);a.stop();assert.equal(timers.size,0);assert.equal(a.nodes.size,0);}
});
test('separate audio preferences clamp safely and never use either campaign progress key',()=>{
 assert.equal(Audio.SAVE_KEY,'wga_science_dash_audio_v1');assert.deepEqual(Audio.settings({music:Infinity,effects:-2}),{music:.36,effects:0});assert.deepEqual(Audio.settings({music:2,effects:'1'}),{music:1,effects:.64});const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};Audio.save(storage,{music:0,effects:.8});assert.deepEqual(Audio.load(storage),{music:0,effects:.8});assert.deepEqual([...data.keys()],[Audio.SAVE_KEY]);data.set(Audio.SAVE_KEY,'broken');assert.deepEqual(Audio.load(storage),Audio.settings());assert.doesNotThrow(()=>Audio.save({setItem(){throw Error('blocked');}},{}));
});
test('audio and art absence fail softly without timers or a game prerequisite',()=>{
 const box={};vm.runInNewContext(fs.readFileSync(path.join(root,'arcade-audio.js'),'utf8'),box);const a=new box.ScienceArcadeAudio();assert.equal(a.unlock(),false);assert.doesNotThrow(()=>{a.play(3);a.effect('shoot');a.setVolume('effects',0);a.stop();});assert.doesNotThrow(()=>art.load());assert.equal(icons.draw({},'goggles',0,0,70),false);
});
test('arcade entry loads only its new presentation modules and all relative references resolve',()=>{
 const html=fs.readFileSync(path.join(root,'original-dash.html'),'utf8');for(const file of ['chemistry-art-data.js','chemistry-art.js','arcade-art-data.js','arcade-icons.js','arcade-art.js','arcade-audio.js']){assert.ok(html.indexOf('./'+file)<html.indexOf('./game.js'));assert.ok(!fs.readFileSync(path.join(root,'index.html'),'utf8').includes('./'+file)||file.startsWith('chemistry-'));}for(const [,ref]of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g))assert.ok(fs.existsSync(path.join(root,ref)),ref);assert.match(html,/id="musicVolume"/);assert.match(html,/id="effectsVolume"/);assert.match(html,/data-science-fullscreen/);assert.doesNotMatch(html,/prototype|coming soon|demo|v3\./i);
});
