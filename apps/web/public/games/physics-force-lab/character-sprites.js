(function(root,factory){const data=typeof module==='object'&&module.exports?require('./character-sprite-data.js'):root.PhysicsCharacterData;const api=factory(root,data);if(typeof module==='object'&&module.exports)module.exports=api;else root.PhysicsCharacterSprites=api;})(typeof globalThis!=='undefined'?globalThis:this,function(root,data){
  'use strict';
  const characters=data?.characters||{},images=new Map(),failed=new Set();const pending=new Map();
  function stateFor(kind,state){const c=characters[kind];return c&&(c.clips[state]?state:Object.keys(c.clips)[0]);}
  function frame(kind,state,time=0,reduced=false){
    const character=characters[kind],clip=character?.clips[stateFor(kind,state)];if(!clip)return null;
    const t=Number.isFinite(time)?Math.max(0,time):0;
    const index=reduced?(state==='defeat'?clip.length-1:Math.min(clip.length-1,Math.floor(clip.length/2))):clip.loop?Math.floor(t*clip.fps)%clip.length:Math.min(clip.length-1,Math.floor(t*clip.fps));
    const n=clip.start+index;return {x:n%data.columns*data.frameWidth,y:Math.floor(n/data.columns)*data.frameHeight,width:data.frameWidth,height:data.frameHeight,index:n};
  }
  class Animator{
    constructor(kind){this.kind=kind;this.state=stateFor(kind,'idle');this.time=0;}
    set(state,restart=false){const next=stateFor(this.kind,state);if(restart||next!==this.state){this.state=next;this.time=0;}return this;}
    step(dt){if(Number.isFinite(dt))this.time+=Math.max(0,Math.min(.1,dt));return this;}
    get finished(){const c=characters[this.kind]?.clips[this.state];return !!c&&!c.loop&&this.time>=c.length/c.fps;}
  }
  function load(kinds=Object.keys(characters)){
    if(!root.Image)return Promise.resolve(false);
    return Promise.all([...new Set(kinds)].map(kind=>{
      const c=characters[kind];if(!c)return Promise.resolve(false);if(images.has(kind))return Promise.resolve(true);if(pending.has(kind))return pending.get(kind);
      const task=new Promise(resolve=>{const im=new root.Image();im.onload=()=>{if(im.naturalWidth===c.width&&im.naturalHeight===c.height){images.set(kind,im);resolve(true);}else{failed.add(kind);resolve(false);}};im.onerror=()=>{failed.add(kind);resolve(false);};im.src='./'+c.src;});pending.set(kind,task);return task;
    })).then(results=>results.every(Boolean));
  }

  function draw(ctx,kind,p){
    const im=images.get(kind),character=characters[kind];if(!im||!character)return false;
    const pose=frame(kind,p.state||p.animator?.state,p.time??p.animator?.time??0,p.reduced);if(!pose||![p.x,p.y,p.w,p.h].every(Number.isFinite)||p.w<=0||p.h<=0)return false;
    ctx.save();ctx.translate(p.x+p.w/2,p.y+p.h);ctx.scale((p.facing===-1?-1:1)*p.w/character.body[0],p.h/character.body[1]);if(Number.isFinite(p.opacity))ctx.globalAlpha*=Math.max(0,Math.min(1,p.opacity));ctx.imageSmoothingEnabled=true;
    ctx.drawImage(im,pose.x,pose.y,pose.width,pose.height,-data.anchor[0],-data.anchor[1],data.frameWidth,data.frameHeight);ctx.restore();return true;
  }
  return {Animator,draw,frame,load,data,status:()=>({ready:[...images.keys()],failed:[...failed]})};
});
