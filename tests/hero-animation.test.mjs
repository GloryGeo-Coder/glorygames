import test from 'node:test';
import assert from 'node:assert/strict';
import { CLIP_NAMES, chooseHeroClip, createHeroAnimator } from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/hero-animation.mjs';

test('all nine clips are exposed',()=>assert.deepEqual(CLIP_NAMES,['Idle','Walk','Run','Jump','Glide','Land','Blast','Hit','Victory']));
test('locomotion selects idle, walk, run, jump and glide',()=>{
  const x={grounded:true,moving:false,speed:0,glide:false};
  assert.equal(chooseHeroClip(x),'Idle');
  assert.equal(chooseHeroClip({...x,moving:true,speed:5.4}),'Walk');
  assert.equal(chooseHeroClip({...x,moving:true,speed:7.2}),'Run');
  assert.equal(chooseHeroClip({...x,grounded:false}),'Jump');
  assert.equal(chooseHeroClip({...x,grounded:false,glide:true}),'Glide');
});
test('animation driver plays one clip at a time and resumes locomotion',()=>{
  const groups=CLIP_NAMES.map(name=>({name,startCount:0,stops:0,start(){this.startCount++},stop(){this.stops++},pause(){},play(){}}));
  const a=createHeroAnimator(groups);
  assert.equal(a.hasRig,true);
  a.reset();
  a.update(.05,{grounded:true,moving:true,speed:7.2,glide:false});
  assert.equal(a.currentClip,'Run');
  a.trigger('Blast',.2);assert.equal(a.currentClip,'Blast');
  a.update(.1,{grounded:true,moving:true,speed:7.2,glide:false});assert.equal(a.currentClip,'Blast');
  a.update(.13,{grounded:true,moving:true,speed:7.2,glide:false});assert.equal(a.currentClip,'Run');
  assert.ok(groups.find(g=>g.name==='Blast').startCount>=1);
});
test('hit clip cannot be replaced by blast prematurely',()=>{
  const groups=CLIP_NAMES.map(name=>({name,start(){},stop(){},pause(){},play(){}}));
  const a=createHeroAnimator(groups);a.reset();a.trigger('Hit',.5);
  assert.equal(a.trigger('Blast',.3),false);
  assert.equal(a.currentClip,'Hit');
});
test('fallback without animation groups does not throw',()=>{
  const a=createHeroAnimator([]);a.reset();a.trigger('Blast',.2);
  assert.equal(a.hasRig,false);
});
