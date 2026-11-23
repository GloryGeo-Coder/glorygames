'use strict';
function flightArt(canvas) {
  const ctx = canvas.getContext('2d');
  const palette = [
    ['#12172b','#4d3552','#f1b781','#875879'], ['#131c31','#294955','#96e2ce','#438697'],
    ['#18152f','#443754','#cdb2ff','#7566b4'], ['#201526','#543346','#f7988f','#ba6474']
  ];
  const stars = Array.from({length:95}, (_,i)=>({
    x:((i*179+7)%997)/997, y:((i*i*31+83*i+13)%983)/983, size:1+i%3*.42
  }));
  let width=1,height=1,time=0,angle=0,flashes=[];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const observer = new ResizeObserver(()=>{
    const box=canvas.getBoundingClientRect(), ratio=Math.min(2,devicePixelRatio||1);
    width=box.width;height=box.height;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
  });
  observer.observe(canvas);
  function polygon(points,colour) {
    ctx.fillStyle=colour;ctx.beginPath();
    points.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
    ctx.closePath();ctx.fill();
  }
  function fire(x,y,burst) {
    angle=Math.atan2((x-.5)*width,(.92-y)*height);
    flashes.push({x,y,burst,age:0});
  }
  function draw(dt,sector,intro,contacts) {
    time+=reduce.matches?0:dt;
    const [night,haze,sun,shade]=palette[sector];
    const bg=ctx.createLinearGradient(0,0,width*.5,height);bg.addColorStop(0,night);bg.addColorStop(.64,haze);bg.addColorStop(1,'#111427');
    ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
    for(const star of stars){
      ctx.globalAlpha=.35+star.size*.22;ctx.fillStyle='#fff6e7';
      ctx.fillRect(star.x*width,(star.y*height+time*star.size*2)%height,star.size,star.size);
    }
    ctx.globalAlpha=1;
    const px=width*.79,py=height*.34,r=Math.min(width*.21,height*.31);
    ctx.save();ctx.translate(px,py);ctx.rotate(-.27);
    const planet=ctx.createLinearGradient(-r,-r,r,r);planet.addColorStop(0,'#ffead0');planet.addColorStop(.32,sun);planet.addColorStop(.75,shade);planet.addColorStop(1,night);
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fillStyle=planet;ctx.fill();
    ctx.save();ctx.clip();ctx.globalAlpha=.43;
    for(let i=0;i<16;i++){const y=-r+i*r*.14;
      ctx.beginPath();ctx.ellipse(-r*.14,y,r*1.13,r*.14,0,.05,Math.PI-.05);
      ctx.strokeStyle=i%3===0?sun:shade;ctx.lineWidth=r*(i%3===0?.045:.085);ctx.stroke();}
    ctx.restore();
    ctx.beginPath();ctx.ellipse(0,0,r*1.52,r*.22,-.1,0,Math.PI);ctx.lineWidth=r*.095;ctx.strokeStyle=sun;ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,0,r*1.68,r*.25,-.1,0,Math.PI);ctx.lineWidth=1.5;ctx.strokeStyle='#e6d6ba';ctx.stroke();ctx.restore();
    // Each word rides a chunk of ice; loose letters have a separate brass carrier.
    for(const target of contacts){
      const x=width*target.x,y=height*target.y,rock=Math.min(27,width*.054);
      ctx.save();ctx.translate(x,y);
      if(target.word.length>1){
        const tail=ctx.createLinearGradient(0,0,0,-rock*3.6);
        tail.addColorStop(0,target.core?'#e5bd67':'#b68ce5');tail.addColorStop(1,'transparent');
        polygon([[-rock*.88,-4],[-rock*.37,-rock*3.1],[-rock*.14,-rock*1.5],[rock*.29,-rock*3.7],[rock*.79,-2]],tail);
        polygon([[-rock*1.2,2],[-rock*.6,-rock*.85],[rock*.25,-rock],[rock,-rock*.46],[rock*1.18,3],[rock*.55,rock*.85],[-rock*.5,rock]],target.core?'#e5bd67':'#ac88c6');
        polygon([[-rock*.5,rock],[rock*.08,rock*.17],[rock,0],[rock*.55,rock*.85]],target.core?'#966e45':'#715579');
        if(target.core){ctx.strokeStyle='#ffe79c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,rock*1.4,time*.6,time*.6+4.9);ctx.stroke();}
      }else{
        ctx.strokeStyle='#e9b671';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(-rock*.65,0);ctx.lineTo(0,-rock*1.26);ctx.lineTo(rock*.65,0);ctx.lineTo(0,rock*1.26);ctx.closePath();ctx.stroke();
      }
      ctx.restore();
    }
    const cx=width*(intro?.75:.5),cy=height*(intro?.76:.92);
    ctx.save();ctx.translate(cx,cy);ctx.rotate(intro?-.47:angle*.65);
    const scale=intro?Math.min(width/240,height/170):Math.min(width/370,height/220,1.5);
    ctx.scale(scale,scale);
    for(const engine of [-14,14]){
      polygon([[engine-3,11],[engine-2,22],[engine,28+Math.sin(time*16)*3],[engine+3,11]],'#83e5d6');
      polygon([[engine-3,-1],[engine+3,-4],[engine+4,17],[engine-4,17]],'#527077');
    }
    polygon([[-6,18],[0,32+Math.sin(time*12)*4],[6,18]],'#71e0d3');
    polygon([[0,-27],[-8,-4],[-29,19],[-23,21],[-7,14],[0,21],[7,14],[23,21],[29,19],[8,-4]],'#b2c8be');
    polygon([[0,-27],[0,16],[-7,10],[-4,-13]],'#fff3c5');
    polygon([[0,-15],[5,-2],[3,7],[-3,7],[-5,-2]],'#315566');
    polygon([[-10,4],[-25,17],[-17,16],[-8,10]],'#f89167');
    polygon([[10,4],[25,17],[17,16],[8,10]],'#f89167');ctx.restore();
    for(const f of flashes){f.age+=dt;const x=f.x*width,y=f.y*height;
      ctx.globalAlpha=Math.max(0,1-f.age/.32);ctx.strokeStyle=f.burst?'#f8ec8d':'#9fffe2';
      if(f.age<.13){ctx.beginPath();ctx.moveTo(width*.5,height*.88);ctx.lineTo(x,y);ctx.lineWidth=reduce.matches?1:3;ctx.stroke();}
      if(f.burst&&!reduce.matches){for(let i=0;i<8;i++){const a=i*Math.PI/4,dist=8+f.age*100;
        ctx.beginPath();ctx.moveTo(x+Math.cos(a)*dist,y+Math.sin(a)*dist);ctx.lineTo(x+Math.cos(a)*(dist+5),y+Math.sin(a)*(dist+5));ctx.stroke();}}}
    ctx.globalAlpha=1;flashes=flashes.filter(f=>f.age<.32);
  }
  return {draw,fire};
}

