(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.PhysicsWorldArt=api;})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const locations=['workshop','motion','gravity','friction','energy','machines','circuit','magnet','waves','pressure','space','core'];
  const aliases={
    'bg-stadium-throw.png':'motion','bg-bicycle-momentum.png':'motion','bg-playground-slide.png':'motion',
    'bg-water-rescue.png':'pressure','bg-orbit-space.png':'space','bg-mars-test.png':'space',
    'bg-bridge-clearance.png':'machines','bg-springboard-energy.png':'energy','bg-storm-rescue.png':'pressure',
    'bg-projectile-range.png':'motion','bg-windy-drone-delivery.png':'waves','bg-friction-track.png':'friction',
    'bg-circuit-room.png':'circuit','bg-gravity-lab.png':'gravity','bg-safety-brake-zone.png':'friction',
    'bg-magnet-zone.png':'magnet','bg-solar-boost.png':'energy','bg-cargo-ramp.png':'machines',
    'bg-energy-park.png':'energy','bg-crane-yard.png':'machines','bg-magnetic-recycling.png':'magnet','bg-physics-boss.png':'core'
  };
  const originals=['force-lab','motion-track','gravity-chamber','friction-factory','energy-reactor','machines-workshop','circuit-lab','magnet-zone','wave-tunnel','pressure-dome','space-lab','quantum-core'];
  originals.forEach((name,i)=>aliases[`level-${String(i+1).padStart(2,'0')}-${name}.png`]=locations[i]);
  locations.forEach(name=>aliases[name+'.webp']=name);
  const cache=new Map(),limit=3;
  const keyFor=src=>String(src).split('/').pop().split('?')[0];
  function location(src){return aliases[keyFor(src)]||'workshop';}
  function source(src){return './assets/worlds/'+location(src)+'.webp';}
  function load(src){
    const key=location(src);if(cache.has(key)){const r=cache.get(key);cache.delete(key);cache.set(key,r);return r.promise;}
    if(!root.Image)return Promise.resolve(false);
    const record={image:null,ready:false,fallback:false,promise:null};
    record.promise=new Promise(resolve=>{
      const im=new root.Image();record.image=im;
      im.onload=()=>{record.ready=true;resolve(true);};
      im.onerror=()=>{if(!record.fallback){record.fallback=true;im.src='./assets/backgrounds/'+keyFor(src);}else resolve(false);};
      im.src=source(src);
    });cache.set(key,record);
    while(cache.size>limit)cache.delete(cache.keys().next().value);
    return record.promise;
  }
  function cover(iw,ih,w,h){const s=Math.max(w/iw,h/ih);return {x:(w-iw*s)/2,y:(h-ih*s)/2,w:iw*s,h:ih*s};}
  function background(ctx,src,w,h,time=0,reduced=false){
    load(src);const r=cache.get(location(src));ctx.save();
    // One logical pixel of overscan also covers rounded physical canvas dimensions.
    ctx.fillStyle='#091b30';ctx.fillRect(-1,-1,w+2,h+2);
    if(r?.ready){const im=r.image,box=cover(im.naturalWidth,im.naturalHeight,w+2,h+2);ctx.drawImage(im,box.x-1,box.y-1,box.w,box.h);}
    else{const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#193c70');g.addColorStop(1,'#091b30');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
    // Low-contrast atmosphere keeps foreground controls, characters and targets readable.
    const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#0312290d');shade.addColorStop(.5,'#0312291a');shade.addColorStop(1,'#03122988');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
    if(!reduced){ctx.fillStyle='#b9fff5';for(let i=0;i<7;i++){const x=((i*157+31)%997)/997*w,y=h*(.12+((i*47)%53)/100),alpha=.025+.035*(1+Math.sin(time*.8+i));ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x,y,1.3,0,Math.PI*2);ctx.fill();}}
    ctx.restore();return true;
  }
  function platform(ctx,x,y,w,h,accent='#72e6d1',moving=false){
    if(w<=0||h<=0)return;ctx.save();
    const g=ctx.createLinearGradient(0,y,0,y+Math.min(h,30));g.addColorStop(0,'#738eaa');g.addColorStop(.22,'#344c68');g.addColorStop(1,'#142a45');ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(5,h/3));ctx.fill();
    ctx.fillStyle='#d1e5e6';ctx.fillRect(x+2,y,Math.max(0,w-4),2);ctx.fillStyle=moving?'#ffd074':accent;ctx.fillRect(x+4,y+3,Math.max(0,w-8),3);
    ctx.fillStyle='#101f36';for(let n=12;n<w-15;n+=32)ctx.fillRect(x+n,y+8,17,Math.min(4,Math.max(1,h-9)));
    if(h>18){ctx.fillStyle='#8eabc1';for(const bx of [x+7,x+w-8]){ctx.beginPath();ctx.arc(bx,y+15,1.5,0,Math.PI*2);ctx.fill();}}
    ctx.restore();
  }
  return {locations,aliases,location,source,load,cover,background,platform,status:()=>({limit,entries:[...cache].map(([key,r])=>({key,ready:r.ready,fallback:r.fallback}))})};
});
