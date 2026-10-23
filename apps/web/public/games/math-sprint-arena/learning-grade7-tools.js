/* Data-driven Grade 7 models. SVG geometry is derived from task evidence. */
(function(){
  'use strict';
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const text=(x,y,s,size=17)=>`<text x="${x}" y="${y}" fill="#e2f9ff" font-size="${size}" text-anchor="middle">${s}</text>`;
  const stroke='fill="none" stroke="#8ce8de" stroke-width="3"';
  const svg=(markup,label)=>{const n=document.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('viewBox','0 0 360 150');n.setAttribute('role','img');n.setAttribute('aria-label',label);n.innerHTML=markup;return n;};
  function draw(t,v){
    if(!t.g7Model)return false;
    let m='',label='';
    if(t.g7Model==='cards'){
      v.append(node('p',t.display||'Read the question. Choose a strategy, then check.','math-readout'));return true;
    }
    if(t.g7Model==='integer'){
      const min=t.min??-10,max=t.max??10,x=n=>24+(n-min)/(max-min)*312,step=max-min>20?5:2;
      m=`<path d="M18 85H342 M24 80L18 85 24 90 M336 80L342 85 336 90" ${stroke}/>`;
      for(let n=min;n<=max;n++){const major=n%step===0;m+=`<path d="M${x(n)} ${major?76:81}V${major?94:89}" stroke="#b1e7ef"/>`;if(major)m+=text(x(n),116,n,15);}
      const mark=t.focus??t.start;
      if(mark!==undefined)m+=`<circle cx="${x(mark)}" cy="85" r="6" fill="#ffe38a"/>`;
      if(t.delta!==undefined){const end=t.start+t.delta;m+=`<path data-integer-move="true" d="M${x(t.start)} 72Q${(x(t.start)+x(end))/2} 12 ${x(end)} 72" fill="none" stroke="#ffe38a" stroke-width="2.5"/><path d="M${x(end)-4} 65L${x(end)} 73 ${x(end)+4} 65" fill="none" stroke="#ffe38a" stroke-width="2"/>`+text(180,22,`${Math.abs(t.delta)} units ${t.delta<0?'left':'right'}`,17);}
      else m+=text(180,24,t.display||'Negative ← 0 → Positive',17);
      label=`Integer scale from ${min} to ${max}, increasing left to right. ${mark!==undefined?`Marker at ${mark}.`:''} ${t.delta!==undefined?`Start ${t.start}, move ${Math.abs(t.delta)} units ${t.delta<0?'left':'right'}.`:''}`;
    }else if(t.g7Model==='growing'){
      const n=t.stage,unit=Math.min(19,260/(n+1),105/n),left=180-(n+1)*unit/2,top=30;
      for(let r=0;r<n;r++)for(let c=0;c<n+1;c++)m+=`<rect data-pattern-cell="true" x="${left+c*unit}" y="${top+r*unit}" width="${unit-2}" height="${unit-2}" rx="2" fill="#6be2cd"/>`;
      m+=text(180,19,`Stage ${n} · ${n} rows × ${n+1} cells`,16);label=`Rectangular array with ${n} rows and ${n+1} cells in every row.`;
    }else if(t.g7Model==='function'){
      const values=[t.unknown?'?':t.input,`× ${t.multiplier}`,`+ ${t.offset}`,t.unknown?t.input*t.multiplier+t.offset:'?'];
      values.forEach((value,i)=>{const x=6+i*90;m+=`<rect x="${x}" y="43" width="75" height="65" rx="8" fill="#173d56" stroke="#9aeeef"/>`+text(x+37,30,['Input','First','Then','Output'][i],15)+text(x+37,82,value,22);if(i<3)m+=`<path d="M${x+77} 75h10m-4-4 4 4-4 4" stroke="#a8e3ec" fill="none"/>`;});label=`Function: multiply by ${t.multiplier}, then add ${t.offset}. ${t.unknown?`Output ${t.input*t.multiplier+t.offset}; find the input.`:`Input ${t.input}; find the output.`}`;
    }else if(t.g7Model==='balance'){
      m=`<path d="M180 47V121M135 123H225M35 48H325M62 48V92M298 48V92" ${stroke}/><path d="M17 93H147L132 112H32Z M233 93H353L339 112H247Z" fill="#234f68" stroke="#8ce8de"/>`+text(82,80,`${t.coefficient}x + ${t.constant}`,22)+text(293,80,t.total,24)+text(180,32,'Both sides have equal value',17);label=`Balanced equation: ${t.coefficient}x + ${t.constant} equals ${t.total}.`;
    }else if(t.g7Model==='graph'){
      const max=Math.max(...t.values),x=i=>54+i*65,y=n=>118-n/max*82;
      for(let i=0;i<=4;i++){m+=`<path d="M54 ${y(max*i/4)}H322" stroke="#44667b" stroke-width="1"/>`+text(32,y(max*i/4)+5,max*i/4,13)+text(x(i),135,i,13);}
      m+='<path d="M54 28V118H325" fill="none" stroke="#c5f8ff" stroke-width="2"/>';
      m+=`<polyline data-journey-line="true" points="${t.values.map((n,i)=>`${x(i)},${y(n)}`).join(' ')}" fill="none" stroke="#ffe38a" stroke-width="3"/>`;
      t.values.forEach((n,i)=>{m+=`<circle data-graph-point="true" cx="${x(i)}" cy="${y(n)}" r="3.5" fill="#fff2ab"/>`;});m+=text(178,16,'Distance from dock (m)',15)+text(298,149,'Time (min)',12);label=`Distance–time graph. Minutes 0, 1, 2, 3, 4; corresponding distances in metres ${t.values.join(', ')}. Both axes start at zero.`;
    }else if(t.g7Model==='angle'){
      const cx=180,cy=78,r=56,a=t.degrees*Math.PI/180,ex=cx+r*Math.cos(a),ey=cy-r*Math.sin(a),ar=30;
      m=`<path d="M${cx+r} ${cy}H${cx}L${ex} ${ey}" fill="none" stroke="#b7f2f3" stroke-width="3"/><path data-marked-angle="${t.degrees}" d="M${cx+ar} ${cy}A${ar} ${ar} 0 ${t.degrees>180?1:0} 0 ${cx+ar*Math.cos(a)} ${cy-ar*Math.sin(a)}" fill="none" stroke="#ffe38a" stroke-width="4"/>`+text(282,30,`${t.degrees}°`,22);label=`Two rays form a marked angle of ${t.degrees} degrees. The gold arc marks ${t.degrees>180?'the larger reflex turn':'the smaller turn'}.`;
    }else if(t.g7Model==='lines'){
      m=t.perpendicular?`<path d="M75 82H285M180 24V132" ${stroke}/><path d="M180 68H194V82" fill="none" stroke="#ffe38a" stroke-width="2"/>`:`<path d="M65 45H295M65 105H295" ${stroke}/><path d="M173 39L181 45 173 51 M173 99L181 105 173 111" fill="none" stroke="#ffe38a" stroke-width="2"/>`;
      label=t.perpendicular?'Two straight lines intersect with a right-angle square at their crossing.':'Two horizontal straight lines with matching parallel arrow markings.';
    }else if(t.g7Model==='circle'){
      m=`<circle cx="155" cy="76" r="56" ${stroke}/><circle cx="155" cy="76" r="3" fill="#e2f9ff"/>`;
      if(t.part==='radius')m+='<path d="M155 76H211" stroke="#ffe38a" stroke-width="5"/>';
      if(t.part==='diameter')m+='<path d="M99 76H211" stroke="#ffe38a" stroke-width="5"/>';
      if(t.part==='circumference')m+='<circle cx="155" cy="76" r="56" fill="none" stroke="#ffe38a" stroke-width="5"/>';
      if(t.part==='centre')m+='<circle cx="155" cy="76" r="6" fill="#ffe38a"/>';
      m+=text(273,72,t.radius?`${t.radius} cm`:'Gold = marked part',t.radius?22:14);label=`Circle with its ${t.part} highlighted in gold${t.radius?`, radius ${t.radius} centimetres`:''}.`;
    }else if(t.g7Model==='squares'){
      t.sides.forEach((side,i)=>{const size=side*13,x=75+i*170;m+=`<rect x="${x-size/2}" y="${76-size/2}" width="${size}" height="${size}" ${stroke}/>`+text(x,137,`${side} cm`,18);});label=`Two squares, side lengths ${t.sides[0]} and ${t.sides[1]} centimetres, drawn using the same scale.`;
    }else if(t.g7Model==='equilateral'){
      const h=100*Math.sqrt(3)/2;m=`<path d="M130 ${118-h}L80 118H180Z" ${stroke}/><path d="M99 72L108 77 M152 77L161 72 M130 113V123" stroke="#ffe38a" stroke-width="2"/>`+text(272,70,'Equal-side marks',16);label='An equilateral triangle; all three sides have a single matching tick mark.';
    }else if(t.g7Model==='scale'){
      const unit=Math.min(21,260/t.length,95/t.width),w=t.length*unit,h=t.width*unit,x=180-w/2,y=75-h/2;
      for(let c=0;c<=t.length;c++)m+=`<path d="M${x+c*unit} ${y}V${y+h}" stroke="#6bb3c3"/>`;
      for(let r=0;r<=t.width;r++)m+=`<path d="M${x} ${y+r*unit}H${x+w}" stroke="#6bb3c3"/>`;
      m+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" ${stroke}/>`+text(180,20,`Original: ${t.length} × ${t.width} grid units`,17)+text(180,143,`Scale factor ${t.factor}`,18);label=`Original rectangle on a unit grid, length ${t.length}, width ${t.width}. Enlarge every length by scale factor ${t.factor}.`;
    }else if(t.g7Model==='triangle'){
      const unit=Math.min(220/t.base,90/t.height),w=t.base*unit,h=t.height*unit,x=180-w/2,y=116-h;
      m=`<path d="M${x} ${y}V116H${x+w}Z" fill="#1a4c5b" stroke="#8ce8de" stroke-width="3"/><path d="M${x} 106h10v10" fill="none" stroke="#ffe38a" stroke-width="2"/>`+text(180,142,`${t.base} cm`,18)+text(x-28,116-h/2,`${t.height} cm`,16);label=`Right triangle, horizontal base ${t.base} centimetres, perpendicular height ${t.height} centimetres. A small square marks the right angle.`;
    }else if(t.g7Model==='box'){
      m='<path d="M80 50L128 20H248L200 50Z" fill="#70dcca" stroke="#d3fff6" stroke-width="2"/><path d="M80 50H200V111H80Z" fill="#337f98" stroke="#d3fff6" stroke-width="2"/><path d="M200 50L248 20V81L200 111Z" fill="#24566f" stroke="#d3fff6" stroke-width="2"/>'+text(140,139,`${t.length} cm`,18)+text(279,66,`${t.height} cm`,18)+text(244,115,`${t.width} cm`,18);label=`Labelled rectangular prism: length ${t.length}, width ${t.width}, height ${t.height}, all in centimetres. ${t.query==='surface'?'All six faces form a closed box.':'Find its inside volume.'} Diagram is schematic.`;
    }else if(t.g7Model==='data'){
      t.values.forEach((value,i)=>{m+=`<rect x="${6+i*71}" y="45" width="64" height="56" rx="7" fill="#173d56" stroke="#8ce8de"/>`+text(38+i*71,80,value,22);});m+=text(180,25,'Five journey times · minutes',17);label=`Five recorded journey times in minutes: ${t.values.join(', ')}. Values are not sorted.`;
    }else return false;
    v.append(svg(m,label));return true;
  }
  window.MathGrade7Tools={draw,essential:t=>!!t.g7Model&&t.g7Model!=='cards'};
})();
