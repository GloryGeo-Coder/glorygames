/* Continuous arena pacing, independent of frame rate and score penalties. */
(function(root){
 'use strict';
 const scenes=[{id:1,title:'Coral Kingdom',file:'bg-underwater.png'},{id:2,title:'Moonlit Lagoon',file:'bg-lagoon.png'},{id:3,title:'Cosmic Drift',file:'bg-cosmic.png'},{id:4,title:'Jellylight Grotto',file:'bg-jelly-grotto.png'},{id:5,title:'Aurora Garden',file:'bg-aurora-garden.png'},{id:6,title:'Solar Oasis',file:'bg-solar-oasis.png'}];
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function pacing(pops,elapsed,width,height){const wave=1+Math.floor(Math.max(pops/20,elapsed/25)),pressure=Math.min(12,wave-1);return {wave,scene:(wave-1)%scenes.length,interval:Math.max(.19,.58-pressure*.032),batch:pressure>=8?3:pressure>=3?2:1,capacity:Math.min(34,Math.max(10,Math.floor(width*height/21000))+Math.min(14,pressure*2)),speed:1+Math.min(.45,pressure*.035)};}
 function cover(iw,ih,w,h){const scale=Math.max(w/iw,h/ih);return {x:(w-iw*scale)/2,y:(h-ih*scale)/2,w:iw*scale,h:ih*scale};}
 function distanceToSegment(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy,t=den?clamp(((px-ax)*dx+(py-ay)*dy)/den,0,1):0;return {distance:Math.hypot(px-ax-dx*t,py-ay-dy*t),t};}
 const api={scenes,pacing,cover,distanceToSegment,clamp};if(typeof module==='object'&&module.exports)module.exports=api;else root.BubbleRules=api;
})(typeof window!=='undefined'?window:globalThis);
