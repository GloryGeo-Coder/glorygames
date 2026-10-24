(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PhysicsPowerVisuals=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const label=(x,y,s)=>`<text x="${x}" y="${y}">${s}</text>`;
  const line=(x,y,a,b,c='#9be6ce')=>`<path d="M${x} ${y}L${a} ${b}" stroke="${c}" stroke-width="4" fill="none"/>`;
  function arrow(x,y,a,b,c='#ffe291'){
    const t=Math.atan2(b-y,a-x);return line(x,y,a,b,c)+`<path d="M${a-10*Math.cos(t-.5)} ${b-10*Math.sin(t-.5)}L${a} ${b}L${a-10*Math.cos(t+.5)} ${b-10*Math.sin(t+.5)}" stroke="${c}" stroke-width="3" fill="none"/>`;
  }
  const box=(x,y,w,h,c='#23485f')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${c}" stroke="#9fc3d5" stroke-width="2"/>`;
  function render(e,s,value,r){
    let b='';
    if(e.type==='forces'){
      b=label(20,24,'Horizontal forces on the same cart')+box(205,95,90,45)+line(25,156,475,156,'#6f93a8');
      for(const x of [224,275])b+=`<circle cx="${x}" cy="147" r="10" fill="#bdd4de"/>`;
      b+=arrow(205,112,205-r.left*2,112,'#ffa88d')+label(45,88,`${r.left} N left`)+label(325,88,`${r.right} N right`);
      if(r.right)b+=arrow(295,112,295+r.right*2,112);
      if(r.output)b+=arrow(250,195,250+r.output*2,195,'#9be6ce');else b+=label(176,199,'Forces balance');
      b+=label(20,242,`${Math.abs(r.output)} N resultant${r.output?' '+r.state:''} • ${r.motion==='right'?'initial motion right':'initially at rest'}`);
    }else if(e.type==='gravity-place'||e.type==='gravity-mass'){
      b=label(20,24,'Force meter: weight in newtons')+line(150,43,350,43,'#9cb4c4')+box(200,56,100,46)+label(215,85,`${r.output} N`)+line(250,43,250,56)+line(250,102,250,130)+box(212,130,76,39)+label(220,156,`${r.mass} kg`)+arrow(250,172,250,172+Math.max(10,r.output*.6),'#ffbb91')+label(305,203,'Weight')+label(20,245,`${r.mass} kg × ${r.field} N/kg = ${r.output} N`);
    }else if(e.type==='magnet'){
      b=label(20,24,'Facing poles • fixed gap')+box(40,93,125,58,'#67495f')+box(335,93,125,58,'#365e81')+label(58,130,'S')+label(132,130,'N')+label(350,130,value)+label(424,130,value==='S'?'N':'S');
      b+=r.state==='attract'?arrow(325,122,185,122):arrow(185,122,325,122);
      b+=label(20,222,r.state==='attract'?'Opposite poles attract without contact':'Like poles repel without contact');
    }else if(e.type==='wire'){
      const w=s.factor==='length'?Number(value)*70:240,h=s.factor==='area'?Number(value)*8:12;
      b=label(20,24,'Same 3 V source • one property changes')+box(38,55,110,50)+label(53,86,`${r.resistance} Ω`)+box(285,55,175,50)+label(300,86,`${r.output} mA`)+line(40,164,460,164,'#567a90');
      b+=`<rect x="${250-w/2}" y="${164-h/2}" width="${w}" height="${h}" rx="4" fill="${s.factor==='temperature'&&Number(value)>20?'#ecaa85':'#a1c9dc'}"/>`;
      b+=label(20,225,s.factor==='material'?'Equal-sized samples • fixed temperature':s.factor==='temperature'?'Same metal and dimensions':s.factor==='area'?'Same length, material and temperature':'Same area, material and temperature');
    }else if(['cells','cell-bank','voltage-share'].includes(e.type)){
      b=line(45,68,45,30)+line(45,110,45,208)+line(45,30,455,30)+line(455,30,455,208)+line(455,208,45,208);
      const parallel=e.type==='cell-bank'&&value==='parallel';
      if(parallel){
        b=line(45,30,455,30)+line(455,30,455,208)+line(455,208,45,208)+line(45,30,45,60)+line(45,110,45,208)+line(45,50,105,50)+line(105,50,105,60)+line(105,110,105,125)+line(105,125,45,125);
        for(const x of [45,105])b+=line(x-16,75,x+16,75,'#fff')+line(x-9,97,x+9,97,'#fff')+line(x,60,x,75)+line(x,97,x,110);
      }else if(e.type==='voltage-share'){
        b+=line(29,75,61,75,'#fff')+line(36,98,54,98,'#fff')+line(45,68,45,75)+line(45,98,45,110);
      }else{
        // Cell pack is a gap in the left path; no wire bypasses the source.
        // Build the cell symbols explicitly after the continuous external path.
        b=line(45,58,45,30)+line(45,58+(r.count-1)*22+10,45,208)+line(45,30,455,30)+line(455,30,455,208)+line(455,208,45,208);
        for(let i=0;i<r.count;i++){const y=58+i*22;b+=line(29,y,61,y,'#fff')+line(36,y+10,54,y+10,'#fff');if(i<r.count-1)b+=line(45,y+10,45,y+22);}
      }
      r.resistors.forEach((ohms,i)=>{const x=r.resistors.length===1?285:210+i*145;b+=box(x-30,18,60,25)+label(x-28,73,`${ohms} Ω`)+label(x-28,110,`${r.drops[i]} V`);});
      b+=label(155,161,`Current: ${r.current} mA`)+label(100,244,e.type==='voltage-share'?'Resistor drops add to 3 V':`${r.output} V across the load`);
    }else if(e.type==='supply-route'){
      const names=['Generator','Transmission','Local supply'];b=label(20,24,'Build a connected electricity supply route');
      for(let i=0;i<3;i++){b+=box(22+i*166,75,142,70,i<r.output?'#285d55':'#29465c')+label(32+i*166,117,names[Number(value[i])]);if(i<2)b+=arrow(170+i*166,110,183+i*166,110);}
      b+=label(20,190,`${r.output}/3 stages in supply order`)+label(20,234,'Local supply reduces voltage before consumers');
    }else if(e.type==='energy-budget'){
      const fill=r.output/.3*390;
      b=label(20,24,'Same useful lighting • five hours')+box(25,49,130,60)+label(42,86,`${r.watts} W`)+box(180,49,140,60)+label(192,86,`${r.output.toFixed(3)} kWh`)+box(345,49,130,60)+label(357,86,`R${r.cost.toFixed(2)}`);
      b+=`<rect x="45" y="146" width="390" height="24" rx="5" fill="#2c455a"/><rect x="45" y="146" width="${fill}" height="24" rx="5" fill="#86ddc3"/>`+line(175,137,175,185,'#ffe291')+label(130,212,'0.10 kWh limit')+label(20,248,r.lit?'Lighting supplied • example price R3.00/kWh':'Switched off: lighting task not satisfied');
    }else return null;
    return `<svg viewBox="0 0 500 260" aria-hidden="true" style="font:18px system-ui;fill:#e8f6ff">${b}</svg>`;
  }
  return {render};
});
