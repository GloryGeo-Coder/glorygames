const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const { boot, root } = require('./helpers/kasi-runtime.cjs');
const presentation = require('../public/games/kasi-quest/kasi-presentation.js');

test('entry-point dependencies resolve in the public directory and presentation loads before gameplay', () => {
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url=m[1].split('?')[0];
    const file=url.startsWith('/') ? path.join(root,'../..',url) : path.join(root,url);
    assert.ok(fs.existsSync(file),url);
  }
  assert.ok(html.indexOf('src="./kasi-presentation.js')<html.indexOf('src="./game.js'));
});

test('sprite crop metadata fits the original PNGs and trims transparent margins', () => {
  const names={playerIdle:'sprites/player_idle',playerRun:'sprites/player_run',enemy:'sprites/enemy',boss:'sprites/boss',taxi:'obstacles/taxi',coin:'items/coin_spin'};
  for(const[name,file]of Object.entries(names)) {
    const png=fs.readFileSync(path.join(root,`assets/${file}.png`)); assert.equal(png.subarray(1,4).toString(),'PNG');
    const [x,y,w,h]=presentation.crops[name]; assert.ok(x>=0 && y>=0 && w>0 && h>0);
    assert.ok(x+w<=png.readUInt32BE(16) && y+h<=png.readUInt32BE(20));
  }
});

test('campaign definitions retain attainable objective counts and eight distinct backgrounds', () => {
  const backgrounds=new Set();
  for(let n=1;n<=8;n++) {
    const suffix=String(n).padStart(2,'0'),d=JSON.parse(fs.readFileSync(path.join(root,`levels/level-${suffix}.json`)));
    assert.ok(d.w>d.exit.x && d.spawn.x<d.exit.x); assert.ok(d.meta.timeLimit>d.meta.parTime);
    assert.ok(d.objective.coinsRequired<=d.coins.length); assert.ok(d.objective.collectiblesRequired<=d.collectibles.length);
    assert.ok(d.objective.enemiesRequired<=d.enemies.length); assert.ok(d.boss && d.npcs.length);
    backgrounds.add(fs.readFileSync(path.join(root,`assets/backgrounds/level-${suffix}.png`)).subarray(0,64).toString('base64')+fs.statSync(path.join(root,`assets/backgrounds/level-${suffix}.png`)).size);
  }
  assert.equal(backgrounds.size,8);
});

test('actual draw calls keep each background covering portrait, landscape and desktop canvases', async () => {
  for(const[width,height]of[[390,844],[844,390],[1280,720]]) {
    const r=await boot({width,height});
    for(let n=1;n<=8;n++) {
      await r.loadLevel(n); r.resetLevelState(); r.calls.length=0; r.render();
      const draws=r.calls.filter(c=>c[0]==='drawImage' && c[1].url.includes('/backgrounds/'));
      const v=r.state.display; assert.ok(draws.length>0);
      assert.ok(Math.min(...draws.map(c=>c[2]))<=0);
      assert.ok(Math.max(...draws.map(c=>c[2]+c[4]))>=v.worldWidth);
      assert.ok(draws.every(c=>c[3]===0 && c[5]>=v.worldHeight));
      const sprites=r.calls.filter(c=>c[0]==='drawImage' && !c[1].url.includes('/backgrounds/'));
      assert.ok(sprites.length>0 && sprites.every(c=>c.length===10));
      for(const c of sprites) assert.ok(Math.abs(c[4]/c[5]-c[8]/c[9])<1e-8);
    }
  }
});

test('resized taxis can be cleared with the actual jump physics in every campaign configuration', async () => {
  const r=await boot(); await r.startOrRestart();
  for(let n=1;n<=8;n++) {
    await r.loadLevel(n); r.resetLevelState();
    const state=r.state,taxi=state.obstacles.find(o=>o.type==='taxi');
    // A flat test lane isolates vehicle clearance from the authored pits and encounters.
    state.level.solids=[{x:0,y:15,w:state.level.width,h:3}]; state.level.hazards=[];
    state.enemies.length=0; state.bosses.length=0; state.obstacles.splice(0,state.obstacles.length,taxi);
    Object.assign(r.player,{x:taxi.x-160,y:430,vy:0,vx:0,onGround:true,invuln:0}); taxi.dir=-1;
    r.input.right=true; r.input.jump=true;
    for(let i=0;i<65;i++) { if(i===10) r.input.jump=false; r.frame(); }
    assert.equal(r.player.lives,3,`level ${n}`); assert.ok(r.player.x>taxi.x+taxi.w,`level ${n} cleared`);
  }
});
