(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PhysicsFinalVisuals=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const text=(x,y,s)=>`<text x="${x}" y="${y}">${s}</text>`;
  const line=(x,y,a,b,c='#9ce9ce',dash=false)=>`<path d="M${x} ${y}L${a} ${b}" fill="none" stroke="${c}" stroke-width="3"${dash?' stroke-dasharray="7 5"':''}/>`;
  const bar=(y,n,max,c)=>`<rect x="95" y="${y}" width="350" height="24" rx="4" fill="#29465b"/><rect x="95" y="${y}" width="${350*n/max}" height="24" rx="4" fill="${c}"/>`;
  function render(e,s,v,r,comparison){
    let b='';
    if(r.samples){
      const key=r.graph,all=[...r.samples,...(comparison?.samples||[])].map(p=>p[key]),min=Math.min(0,...all),max=Math.max(1,...all),point=p=>`${50+p.time*100},${205-(p[key]-min)/(max-min)*160}`;
      const zero=205-(0-min)/(max-min)*160;
      b=text(20,22,`${key==='position'?'Position (m)':'Velocity (m/s)'} versus time`)+line(50,42,50,205,'#9aafc3')+line(50,zero,470,zero,'#9aafc3')+text(11,50,String(max))+text(11,210,String(min))+text(47,240,'0 s')+text(425,240,'4 s');
      if(comparison?.samples)b+=`<polyline points="${comparison.samples.map(point).join(' ')}" fill="none" stroke="#ffd38b" stroke-width="3" stroke-dasharray="7 5"/>`;
      b+=`<polyline points="${r.samples.map(point).join(' ')}" fill="none" stroke="#92edca" stroke-width="4"/>`;
      for(const p of r.samples)b+=`<circle cx="${50+p.time*100}" cy="${205-(p[key]-min)/(max-min)*160}" r="4" fill="#92edca"/>`;
    }else if(e.type==='journey'){
      const x=65+(8-Number(v))*43;
      b=text(20,25,'East is positive →')+line(65,98,409,98,'#8ce4c8')+line(409,130,x,130,'#ffd38b')+line(65,180,409,180,'#8daabf');
      for(let i=0;i<=8;i+=2)b+=text(60+i*43,207,String(i));
      b+=`<circle cx="${x}" cy="180" r="9" fill="#ffd38b"/>`+text(20,57,'First leg: 8 m east')+text(20,242,`Distance ${r.distance} m • displacement ${r.displacement} m east`);
    }else if(e.type==='mechanical-energy'){
      b=text(20,25,'Ideal 2 kg cart • total mechanical energy: 98 J')+text(20,70,'Eₚ')+bar(51,r.potential,98,'#b9b5ff')+text(20,123,'Eₖ')+bar(104,r.kinetic,98,'#93eacb')+text(100,168,`${r.potential} J + ${r.kinetic} J = 98 J`)+text(20,223,`Speed ${r.speed} m/s • resistance omitted`);
    }else if(e.type==='kinetic-energy'||e.type==='potential-energy'){
      b=text(20,26,e.type==='kinetic-energy'?'Kinetic energy • fixed mass 2 kg':'Potential energy • fixed height 5 m')+bar(99,r.output,e.type==='kinetic-energy'?36:196,'#93eacb')+text(95,160,`${r.output} J`)+text(20,224,e.type==='kinetic-energy'?`Eₖ = ½mv² • speed ${v} m/s`:`Eₚ = mgh • mass ${v} kg`);
    }else if(e.type==='pulse-add'){
      b=text(20,25,'Pulse centres at exact overlap')+line(35,150,465,150,'#688ca3');
      for(const [a,c]of [[2,'#b8b1ff'],[Number(v),'#ffd38b'],[r.output,'#92edca']])b+=`<path d="M45 150H165L250 ${150-a*22}L335 150H455" stroke="${c}" stroke-width="${a===r.output?4:2}" fill="none"/>`;
      b+=text(20,213,`+2 cm + (${v} cm) = ${r.output} cm`)+text(20,245,'Zero displacement does not destroy the pulses');
    }else if(e.type==='wave-frequency'||e.type==='sound-wavelength'){
      b=text(20,25,e.type==='wave-frequency'?'Transverse: particles oscillate up/down':'Longitudinal: particles oscillate back/forth');
      const cycles=e.type==='wave-frequency'?r.frequency:r.frequency/170;
      if(e.type==='wave-frequency'){
        let d='';for(let x=35;x<=465;x+=3)d+=`${x===35?'M':'L'}${x} ${125-Math.sin((x-35)/430*cycles*2*Math.PI)*38}`;
        b+=`<path d="${d}" fill="none" stroke="#92edca" stroke-width="4"/>`+line(250,70,250,180,'#ffd38b',true);
      }else for(let i=0;i<55;i++){const x=36+i*7.8+Math.sin(i/54*cycles*2*Math.PI)*6;b+=line(x,85,x,165,'#a5cbed');}
      b+=text(20,213,`λ = ${r.output} m • f = ${r.frequency} Hz`)+text(20,245,`T ≈ ${r.period} s • pattern transfers energy`);
    }else if(e.type==='charge-sharing'){
      b=text(20,25,'Identical isolated conducting spheres')+text(25,68,'Before contact')+text(295,68,'After separation');
      for(const [x,q]of [[70,6],[190,Number(v)],[330,r.output],[450,r.output]])b+=`<circle cx="${x}" cy="120" r="32" fill="#2a4b62" stroke="#a9ccde" stroke-width="3"/>`+text(x-24,127,`${q>=0?'+':''}${q}`);
      b+=line(230,120,285,120,'#ffd38b')+text(20,202,`Initial total: ${r.total} µC`)+text(20,239,`Final total: ${r.final[0]} + ${r.final[1]} = ${r.total} µC`);
    }else if(e.type==='charge-flow'||e.type==='energy-per-charge'){
      b=text(20,25,e.type==='charge-flow'?'Current: charge per unit time':'Voltage: energy transferred per charge')+`<rect x="55" y="72" width="390" height="65" rx="10" fill="#284b61" stroke="#9bd2e0" stroke-width="3"/>`;
      for(let i=0;i<7;i++)b+=`<circle cx="${85+i*53}" cy="105" r="8" fill="#95edcc"/>`;
      b+=text(20,195,e.type==='charge-flow'?`Q = 0.5 A × ${r.time} s = ${r.output} C`:`V = 12 J ÷ ${r.charge} C = ${r.output} V`)+text(20,239,'Charges are not consumed by the device');
    }else if(e.type==='equivalent-resistance'){
      const parallel=v==='parallel';b=text(20,25,`Same 6 V source • two 6 Ω resistors`)+line(45,65,45,94)+line(45,111,45,210)+line(29,94,61,94,'#fff')+line(35,111,55,111,'#fff')+line(45,65,125,65)+line(440,65,440,210)+line(440,210,45,210);
      const rows=parallel?[65,150]:[65];if(parallel)b+=line(125,65,125,150);
      for(const y of rows){b+=line(125,y,440,y);for(const x of parallel?[280]:[230,355])b+=`<rect x="${x-23}" y="${y-11}" width="46" height="22" rx="4" fill="#254b60" stroke="#9ce9ce" stroke-width="3"/>`;}
      b+=text(155,188,`${r.output} Ω • total ${r.current} A`)+text(20,245,parallel?'Each branch: 6 V and 1 A':'Same current through both resistors');
    }else if(e.type==='em-link'){
      b=text(20,25,'Electromagnetic spectrum • all travel in vacuum');
      const bands=['Radio','Micro','IR','Visible','UV','X-ray','Gamma'];
      bands.forEach((name,i)=>b+=`<rect x="${18+i*69}" y="80" width="65" height="60" rx="5" fill="${(v==='radio'&&i===0)||(v==='visible'&&i===3)||(v==='xray'&&i===5)?'#427c71':'#26465d'}"/>`+text(22+i*69,115,name));
      b+=text(20,187,'Increasing frequency →')+text(20,225,v==='visible'?'500 nm visible light: optical receiver matched':'This band does not match the optical receiver');
    }else return null;
    return `<svg viewBox="0 0 500 260" aria-hidden="true" style="font:18px system-ui;fill:#e8f6ff">${b}</svg>`;
  }
  return {render};
});
