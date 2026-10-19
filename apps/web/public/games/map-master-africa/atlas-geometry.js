/* A single coordinate transform drives rendering, markers and pointer selection. */
(function(root){
  'use strict';
  const world={x:-180,y:-90,w:360,h:180};
  const regions={World:world,Africa:{x:-20,y:-39,w:75,h:77},Europe:{x:-25,y:-73,w:70,h:40},Asia:{x:25,y:-80,w:155,h:95},'North America':{x:-170,y:-84,w:125,h:80},'South America':{x:-85,y:-15,w:55,h:75},'Australia & Pacific':{x:105,y:-10,w:75,h:65},Antarctica:{x:-180,y:60,w:360,h:30}};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function fit(width,height,view=world){const scale=Math.min(width/view.w,height/view.h);return {scale,x:(width-view.w*scale)/2,y:(height-view.h*scale)/2};}
  function screen(point,width,height,view=world){const f=fit(width,height,view);return {x:f.x+(point.x-view.x)*f.scale,y:f.y+(point.y-view.y)*f.scale};}
  function unscreen(point,width,height,view=world){const f=fit(width,height,view);return {x:view.x+(point.x-f.x)/f.scale,y:view.y+(point.y-f.y)/f.scale};}
  const project=([lon,lat])=>({x:lon,y:-lat});
  function constrain(v,extent=world){const w=clamp(v.w,extent.w/32,extent.w),h=clamp(v.h,extent.h/32,extent.h);return {x:clamp(v.x,extent.x,extent.x+extent.w-w),y:clamp(v.y,extent.y,extent.y+extent.h-h),w,h};}
  function zoom(view,factor,anchor={x:view.x+view.w/2,y:view.y+view.h/2},extent=world){const t=clamp(factor,.1,10),w=view.w/t,h=view.h/t;return constrain({x:anchor.x-(anchor.x-view.x)/t,y:anchor.y-(anchor.y-view.y)/t,w,h},extent);}
  function pan(view,dx,dy,extent=world){return constrain({...view,x:view.x+dx,y:view.y+dy},extent);}
  function path(country){return country.polygons.map(p=>p.map(r=>r.map((c,i)=>(i?'L':'M')+c[0]+','+(-c[1])).join('')+'Z').join('')).join('');}
  function inRing(point,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const[a,b]=ring[i],[c,d]=ring[j];if(((b>point[1])!==(d>point[1]))&&(point[0]<(c-a)*(point[1]-b)/(d-b)+a))inside=!inside;}return inside;}
  function contains(country,lon,lat){return country.polygons.some(p=>inRing([lon,lat],p[0])&&!p.slice(1).some(r=>inRing([lon,lat],r)));}
  function countryAt(countries,point){return countries.find(c=>contains(c,point.x,-point.y))||null;}
  function focus(country){const pts=country.polygons.flat(2),xs=pts.map(p=>p[0]),ys=pts.map(p=>-p[1]);let x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
    if(w>180){x=country.label[0]-15;y=-country.label[1]-12;w=30;h=24;}
    const pad=Math.max(w,h)*.15+1;return constrain({x:x-pad,y:y-pad,w:Math.max(8,w+pad*2),h:Math.max(8,h+pad*2)});
  }
  function cell(ref){if(!/^[A-E][1-5]$/.test(ref))return null;return {x:ref.charCodeAt(0)-65+.5,y:Number(ref[1])-.5};}
  function cellAt(point){if(point.x<0||point.y<0||point.x>=5||point.y>=5)return null;return String.fromCharCode(65+Math.floor(point.x))+(Math.floor(point.y)+1);}
  const api={world,regions,clamp,fit,screen,unscreen,project,constrain,zoom,pan,path,inRing,contains,countryAt,focus,cell,cellAt};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.AtlasGeometry=api;
})(typeof window!=='undefined'?window:globalThis);
