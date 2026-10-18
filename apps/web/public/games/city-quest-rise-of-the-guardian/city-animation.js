(function(root) {
  'use strict';
  const data=root.CityAnimationData;
  const cache=new Map();
  function load(kind) {
    const a=data?.atlases[kind]; if(!a)return Promise.resolve(false);
    if(cache.has(a.url))return cache.get(a.url).ready;
    const item={img:new Image(),ok:false};
    item.ready=new Promise(resolve=>{
      item.img.onload=()=>{item.ok=item.img.width===a.width&&item.img.height===a.height;resolve(item.ok);};
      item.img.onerror=()=>resolve(false);
      item.img.src=a.url;
    });cache.set(a.url,item);return item.ready;
  }
  function draw(ctx,kind,clip,time,x,feet,height,dir=1,alpha=1) {
    const a=data?.atlases[kind],item=a&&cache.get(a.url);
    if(!item?.ok)return false;
    const c=a.clips[clip]||a.clips.idle;
    const n=c.loop?Math.floor(time*c.fps)%c.count:Math.min(c.count-1,Math.floor(time*c.fps));
    const f=a.frames[c.start+n], [sx,sy,sw,sh]=f.crop,s=height/a.referenceHeight;
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,feet);ctx.scale(dir,1);
    ctx.drawImage(item.img,sx,sy,sw,sh,-sw*s/2,-sh*s,sw*s,sh*s);ctx.restore();return true;
  }
  function prop(ctx,img,x,y,w,h,dir=1) {
    if(!img?.width)return;
    const crop=img.cityCropped?null:data?.originals[img.getAttribute?.('src')||img.citySource];
    const [sx,sy,sw,sh]=crop||[0,0,img.width,img.height];
    const s=Math.min(w/sw,h/sh),dw=sw*s,dh=sh*s;
    ctx.save();ctx.translate(x+w/2,y+h);ctx.scale(dir,1);
    ctx.drawImage(img.bitmap||img,sx,sy,sw,sh,-dw/2,-dh,dw,dh);ctx.restore();
  }
  root.CityAnimation={load,draw,prop};
})(typeof window!=='undefined'?window:globalThis);
