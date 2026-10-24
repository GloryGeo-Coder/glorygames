(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PhysicsSignalVisuals=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const colors=['#ff8585','#ffaf6f','#ffe583','#92ec9c','#8ed9ff','#b6adff','#df9dff'];
  const text=(x,y,s)=>`<text x="${x}" y="${y}">${s}</text>`;
  const line=(x,y,a,b,color='#9fe9d5',dash=false)=>`<path d="M${x} ${y}L${a} ${b}" fill="none" stroke="${color}" stroke-width="4"${dash?' stroke-dasharray="7 6"':''}/>`;
  function arrow(x,y,a,b,color='#ffe583'){
    const t=Math.atan2(b-y,a-x),h=10;
    return line(x,y,a,b,color)+`<path d="M${a-h*Math.cos(t-.5)} ${b-h*Math.sin(t-.5)}L${a} ${b}L${a-h*Math.cos(t+.5)} ${b-h*Math.sin(t+.5)}" fill="none" stroke="${color}" stroke-width="3"/>`;
  }
  const resistor=(x,y)=>`<rect x="${x-27}" y="${y-10}" width="54" height="20" rx="3" fill="#183f54" stroke="#a0e9cf" stroke-width="3"/>`;
  function source(){return line(40,82,40,28)+line(40,112,40,210)+line(22,85,58,85,'#fff')+line(29,105,51,105,'#fff')+text(8,148,'3 V');}
  function render(e,s,value,r){
    let body='';
    if(e.type==='charge'){
      body=text(22,24,'Electron transfer • protons stay fixed');
      for(const [x,label,q,el]of [[30,'Cloth',r.clothCharge,r.clothElectrons],[215,'Rod',r.rodCharge,r.rodElectrons]])body+=`<rect x="${x}" y="105" width="110" height="72" rx="15" fill="#29485f" stroke="${q>0?'#ffad8d':'#9fc9ff'}" stroke-width="3"/>`+text(x+12,132,`${label}: ${q>0?'+':'−'}`)+text(x+12,160,`4 p / ${el} e`);
      body+=text(163,55,'electrons')+(value==='gain'?arrow(88,76,268,76,'#9fc9ff'):arrow(268,76,88,76,'#9fc9ff'));
      body+=`<circle cx="435" cy="140" r="34" fill="#274658" stroke="${r.probe>0?'#ffad8d':'#9fc9ff'}" stroke-width="3"/>`+text(418,148,r.probe>0?'+':'−')+text(400,201,'Probe');
      body+=r.state==='attract'?arrow(393,140,345,140):arrow(340,140,389,140);
      body+=text(28,225,r.state==='attract'?'Unlike charges attract':'Like charges repel');
    }else if(e.type==='network'){
      body=source()+text(80,244,`Source current: ${r.output} mA`);
      if(s.layout==='series'){
        body+=line(40,28,460,28)+line(460,28,460,210)+line(460,210,40,210);
        for(let n=0;n<r.count;n++)body+=resistor(160+n*115,28);
        body+=text(110,94,`Meter A: ${r.output} mA`)+text(110,130,`Meter B: ${r.meterB} mA`)+text(110,174,'One complete path');
      }else{
        const last=58+(r.count-1)*55;
        body+=line(40,28,110,28)+line(110,28,110,last)+line(440,58,440,210)+line(440,210,40,210);
        for(let n=0;n<r.count;n++){const y=58+n*55;body+=line(110,y,440,y)+resistor(270,y)+text(225,y+29,'200 mA');}
      }
    }else if(e.type==='branch'){
      body=source()+line(40,28,90,28)+line(90,28,90,165)+line(440,65,440,210)+line(440,210,40,210);
      const parallel=value!=='series-break';
      if(parallel){
        for(let n=0;n<2;n++){const y=65+n*100,on=r.lamps[n];body+=line(90,y,140,y)+line(175,y,440,y)+line(140,y,175,on?y:y-20)+`<circle cx="310" cy="${y}" r="21" fill="${on?'#ffe583':'#26475f'}" stroke="#d6ecf5" stroke-width="3"/>`+text(280,y+48,`Lamp ${n+1}`);}
      }else{
        // One broken route, no accidental bypass around either lamp.
        body=line(40,82,40,28)+line(40,112,40,210)+line(22,85,58,85,'#fff')+line(29,105,51,105,'#fff')+text(8,148,'3 V')+line(40,28,140,28)+line(140,28,175,8)+line(175,28,440,28)+line(440,28,440,210)+line(440,210,40,210);
        for(const x of [260,365])body+=`<circle cx="${x}" cy="28" r="20" fill="#26475f" stroke="#d6ecf5" stroke-width="3"/>`;
        body+=text(110,124,'Only path broken')+text(110,162,'Both lamps off');
      }
      body+=text(80,244,parallel?'Separate paths • local branch switch':'Series • one path');
    }else if(e.type==='mirror'){
      const t=r.angle*Math.PI/180,dx=Math.sin(t)*145,dy=Math.cos(t)*145;
      body=line(35,185,465,185,'#c4d9e4')+line(250,20,250,220,'#b3c6d2',true)+arrow(250-dx,185-dy,250,185)+arrow(250,185,250+dx,185-dy,'#91f0ca');
      for(const [name,angle]of [['near',15],['middle',30],['wide',60]]){const a=angle*Math.PI/180;body+=`<circle cx="${250+145*Math.sin(a)}" cy="${185-145*Math.cos(a)}" r="8" fill="${name===s.expected?'#ffe583':'#45677d'}" stroke="#ecf5ff" stroke-width="2"/>`;}
      body+=text(270,22,'Normal')+text(25,232,'Equal angles • gold receiver is the target')+text(342,173,'Mirror');
    }else if(e.type==='surface'){
      body=text(20,24,value==='smooth'?'Smooth mirror: parallel reflection':'Rough surface: scattered reflection');
      const path=value==='smooth'?'M80 175H430':'M80 180l50 -12 60 13 60 -16 60 13 60 -10 60 10';body+=`<path d="${path}" fill="none" stroke="#bfd8e7" stroke-width="5"/>`;
      for(let n=0;n<3;n++){const x=145+n*100;body+=arrow(x-60,50,x,175);body+=arrow(x,175,x+(value==='smooth'?60:[-30,20,75][n]),value==='smooth'?50:[55,40,110][n],'#91f0ca');}
    }else if(e.type==='refract'){
      const t=r.angle*Math.PI/180;
      body=`<rect x="20" y="105" width="460" height="122" rx="8" fill="${value==='air'?'#213c50':'#245f7c'}"/>`+line(20,105,480,105,'#9ecce5')+line(250,12,250,227,'#b3c6d2',true)+arrow(195,10,250,105)+arrow(250,105,250+115*Math.sin(t),105+115*Math.cos(t),'#91f0ca')+text(35,55,'Air')+text(35,153,value==='water'?'Water':value==='glass'?'Glass':'Air')+text(283,44,'Normal')+text(20,248,value==='air'?'Same medium: no change of direction':'Entering water/glass: towards normal');
    }else if(e.type==='transmit'){
      body=text(25,24,'Same source • same window position')+arrow(45,125,205,125)+`<rect x="205" y="55" width="36" height="140" rx="4" fill="${value==='glass'?'#83c7e577':'#907d62'}" stroke="#c3d8e4" stroke-width="3"/>`;
      if(value==='glass')body+=arrow(241,125,400,125,'#91f0ca');else body+=`<path d="M241 55L435 35V215L241 195Z" fill="#030c1466"/>`;
      body+=`<circle cx="430" cy="125" r="26" fill="${value==='glass'?'#ffe583':'#26475f'}" stroke="#d4e7ee" stroke-width="3"/>`+text(25,229,value==='glass'?'Most light transmitted':'Opaque barrier: shadow behind it');
    }else if(e.type==='spectrum'){
      body=text(22,24,'White-light source')+arrow(35,118,195,118,'#fff');
      if(value==='prism'){
        body+='<path d="M220 50L165 175H275Z" fill="#75abc766" stroke="#b1e2fa" stroke-width="3"/>';
        for(let n=0;n<7;n++)body+=line(245,118,445,48+n*25,colors[n]);
        body+=text(384,34,'Red')+text(383,225,'Violet');
      }else if(value==='gap')body+=arrow(195,118,445,118,'#fff')+text(265,174,'White beam');
      else body+='<rect x="195" y="55" width="30" height="140" fill="#907d62"/>'+text(260,174,'Beam blocked');
      body+=text(22,248,'Same beam • only the object changes');
    }else if(e.type==='combine'){
      body=text(22,24,'Full spectrum • ideal optical combiner');
      for(let n=0;n<7;n++){const y=48+n*25;body+=line(30,y,220,y,colors[n])+line(220,y,430,value==='overlap'?125:y,colors[n]);}
      body+='<rect x="211" y="34" width="18" height="185" rx="6" fill="#89bbcf77" stroke="#a4c8dc"/>';
      if(value==='overlap')body+='<circle cx="435" cy="125" r="15" fill="#fff"/>';
      body+=text(22,248,value==='overlap'?'Recombined light: white':'Separate components on the screen');
    }else if(e.type==='coil'){
      body=text(22,24,'Same current • same core • five-unit load')+'<rect x="200" y="58" width="100" height="43" rx="6" fill="#a6b5c5"/>';
      for(let n=0;n<r.output;n++)body+=`<ellipse cx="${211+n*18}" cy="80" rx="9" ry="30" fill="none" stroke="#e8b77f" stroke-width="4"/>`;
      body+=line(200,80,140,80)+line(140,80,140,210)+line(140,210,355,210)+line(355,210,355,80)+line(355,80,300,80);
      body+='<rect x="200" y="192" width="105" height="32" rx="5" fill="#294b62" stroke="#c0dce9" stroke-width="2"/>'+text(214,215,'Supply');
      const y=r.state==='lifted'?114:166;body+=`<rect x="213" y="${y}" width="74" height="35" rx="4" fill="#8195a5" stroke="#d2e5ed" stroke-width="3"/>`+text(230,y+25,'5')+text(23,248,r.state==='lifted'?'Load lifted by the magnetic field':'Increase turns to lift the load');
    }else return null;
    return `<svg viewBox="0 0 500 260" aria-hidden="true" style="color:#e8f6ff;font:18px system-ui;fill:currentColor">${body}</svg>`;
  }
  return {render};
});
