/* Crop-aware real-pose animation with bounded, resized runtime frame caches. */
(function(root){
  'use strict';
  const data=root.JungleAnimationData,cache=new Map();
  function source(kind){return data.atlases[kind]?.url;}
  function original(url){return data.originals[url];}
  function retain(urls){for(const [kind,value] of cache)if(!urls.has(value.url))cache.delete(kind);}
  function prepare(image,url,doc){
    for(const [kind,atlas] of Object.entries(data.atlases))if(atlas.url===url){
      const bound=kind.includes(' ')?260:192;
      const frames=atlas.frames.map(f=>{const [x,y,w,h]=f.crop,scale=Math.min(1,bound/Math.max(w,h));
        const surface=doc.createElement('canvas');surface.width=Math.max(1,Math.round(w*scale));surface.height=Math.max(1,Math.round(h*scale));
        const painter=surface.getContext?.('2d');if(!painter)return null;painter.drawImage(image,x,y,w,h,0,0,surface.width,surface.height);return surface;
      });
      if(frames.every(Boolean))cache.set(kind,{url,frames});
    }
  }
  function draw(ctx,kind,clip,x,y,w,h,dir,time){
    const atlas=data.atlases[kind],entry=cache.get(kind);if(!atlas||!entry)return false;
    const animation=atlas.clips[clip]||atlas.clips.run;
    const n=animation.start+Math.floor(time*animation.fps)%animation.count,frame=atlas.frames[n],image=entry.frames[n];
    const scale=h/atlas.referenceHeight,iw=frame.crop[2]*scale,ih=frame.crop[3]*scale;
    ctx.save();ctx.translate(x+w/2,y+h);ctx.scale(dir<0?-1:1,1);ctx.drawImage(image,-iw/2,-ih,iw,ih);ctx.restore();return true;
  }
  const api={source,original,retain,prepare,draw};if(typeof module==='object'&&module.exports)module.exports=api;else root.JungleAnimation=api;
})(typeof window!=='undefined'?window:globalThis);
