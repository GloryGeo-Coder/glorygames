(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PhysicsLegacyVisuals=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function viewport(width,height,dpr=1){const scale=Math.min(1,Math.max(.55,height/600));return {scale,width:width/scale,height:height/scale,worldHeight:720,dpr:Math.min(2,Math.max(1,dpr))};}
  function draw(ctx,kind,p){
    const t=p.reduced?0:p.time||0,phase=t*8,stride=p.walking?Math.sin(phase)*.35:0,bob=p.walking?Math.abs(Math.cos(phase))*2:Math.sin(t*2)*1.1;
    const rect=(x,y,w,h,c,r=5)=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
    const oval=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
    const limb=(x,y,a,len,c,w)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);rect(-w/2,0,w,len,c,w/2);ctx.restore();};
    ctx.save();ctx.translate(p.x+p.w/2,p.y+p.h);ctx.scale(p.w/100,p.h/140);ctx.scale(p.facing===-1?-1:1,1);ctx.globalAlpha=p.hit?.65:1;
    oval(0,-2,43,6,'#03101b66');ctx.translate(0,-bob);
    if(kind==='player'||kind==='professor'){
      const prof=kind==='professor';
      limb(-18,-49,p.airborne?-.55:stride,46,'#203b55',20);limb(18,-49,p.airborne?.65:-stride,46,'#33566d',20);rect(-35,-11,31,12,'#0b1a2d');rect(8,-11,31,12,'#0b1a2d');
      rect(-38,-97,19,44,'#214e66');rect(-29,-99,60,56,prof?'#f1eee4':'#d4e7e7',9);rect(-5,-97,10,45,'#2bb8bd',2);rect(-28,-54,56,9,'#b8895e',3);
      limb(-30,-94,p.airborne?-.6:-stride*.75,47,'#b8d6dc',16);limb(31,-94,p.attacking?-1.3:p.airborne?.7:stride*.75,47,'#d1e8e7',16);
      oval(0,-118,23,23,prof?'#be8969':'#a76d4a');oval(0,-136,25,10,prof?'#d8e1e6':'#242735');rect(-25,-124,51,15,'#204158',6);rect(-20,-121,17,7,'#8affec',3);rect(5,-121,17,7,'#8affec',3);rect(-34,-100,12,17,'#64e7c4',3);
      if(prof){oval(-22,-123,8,15,'#d8e1e6');oval(23,-123,8,15,'#d8e1e6');}
    }else{
      const boss=kind==='boss',drone=kind==='drone'||kind==='helper',magnetic=kind==='magnetBot',accent=boss?'#ee91c6':magnetic?'#82e5b5':drone?'#8ad7fc':'#f19f9e';
      if(!drone){limb(-23,-40,stride,35,'#47667f',20);limb(23,-40,-stride,35,'#65859a',20);rect(-39,-12,31,12,'#1a2e45');rect(8,-12,31,12,'#1a2e45');}
      rect(-44,-104,88,drone?62:69,boss?'#4c365e':'#35536c',12);rect(-35,-96,70,34,'#10283d',8);oval(-15,-80,6,7,accent);oval(15,-80,6,7,accent);
      rect(-26,-53,52,13,'#1d344b',5);for(let i=0;i<3;i++)rect(-17+i*13,-50,7,7,accent,2);
      limb(-43,-89,-.3-Math.sin(t*4)*.12,boss?54:34,'#6889a1',boss?20:13);limb(43,-89,.3+Math.sin(t*4)*.12,boss?54:34,'#90aabb',boss?20:13);
      if(drone){for(const x of [-45,45]){rect(x-17,-117,34,8,'#6d91a6',3);rect(x-23,-125,46,p.reduced?4:4+Math.abs(Math.sin(t*32))*4,accent,3);}oval(0,-27,10,7,accent);}
      if(magnetic){rect(-33,-137,14,28,'#ef9da7',3);rect(20,-137,14,28,'#99c8f3',3);rect(-33,-119,67,12,'#8eb7bf',3);}
      if(boss){ctx.save();ctx.translate(0,-47);ctx.rotate(t*.8);for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);rect(-4,-25,8,15,accent,3);}ctx.restore();oval(0,-47,12,12,'#ffdc9c');rect(-14,-130,28,21,'#9ab1c3',5);}
    }
    ctx.restore();
  }
  return {viewport,draw};
});
