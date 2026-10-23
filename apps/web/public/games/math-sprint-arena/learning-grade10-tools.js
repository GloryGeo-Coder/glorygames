/* Exact Grade 10 evidence, with scalable diagrams and accessible descriptions. */
(function(){
  'use strict';
  let serial=0;
  const node=(tag,value,cls)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=value;if(cls)n.className=cls;return n;};
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),fmt=n=>Number(n.toFixed(4)),sign=n=>n<0?`− ${-n}`:`+ ${n}`;
  const text=(x,y,value,size=16)=>`<text x="${x}" y="${y}" fill="#e2f9ff" text-anchor="middle" font-size="${size}">${esc(value)}</text>`,stroke='fill="none" stroke="#8ce8de" stroke-width="2"';
  const svg=(markup,label)=>{const n=document.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('viewBox','0 0 360 150');n.setAttribute('role','img');n.setAttribute('aria-label',label);n.innerHTML=markup;return n;};
  function draw(t,v){
    if(!t.g10Model)return false;
    let m='',label='';
    if(t.g10Model==='cards'){v.append(node('p',t.display||'Choose a method. Track the conditions and check.','math-readout'));return true;}
    if(t.g10Model==='finance'){
      const rows=[`Starting principal: R${t.principal}`,`${t.rate}% per year · ${t.years} years`,t.compound?'Compounded once each year':'Simple interest on original principal','Fictional savings · no payments or fees'];
      rows.forEach((s,i)=>{m+=text(180,27+i*34,s,i===3?13:18);});label=`Fictional savings question. Starting principal ${t.principal} rand, rate ${t.rate}% per year, term ${t.years} years. ${t.compound?'Interest is compounded once at the end of each year':'Simple interest is calculated on the original principal'}. No deposits, withdrawals or fees. Find the final balance in rand.`;
    }else if(t.g10Model==='system'){
      m+=text(180,22,'Two equations · the same x and y',17);t.rows.forEach(([a,b,r],i)=>{m+=`<rect x="42" y="${36+i*53}" width="276" height="46" rx="8" fill="#193e55" stroke="#8ce8de"/>`+text(180,67+i*53,`${a}x + ${b===1?'':b}y = ${r}`,25);});label=`Solve these simultaneous equations using the same unknowns: ${t.rows.map(([a,b,r])=>`${a}x plus ${b}y equals ${r}`).join('; ')}. Find ${t.query}.`;
    }else if(t.g10Model==='interval'){
      const lo=t.low-3,hi=t.high===null?t.low+6:t.high+3,px=x=>30+(x-lo)*300/(hi-lo),end=t.high===null?hi-.2:t.high;
      m+=`<path d="M25 82H337" ${stroke}/><path d="M${px(t.low)} 82H${px(end)}" stroke="#ffe38a" stroke-width="6"/>`;
      for(let x=lo;x<=hi;x++)m+=`<path d="M${px(x)} 76V88" ${stroke}/>`+text(px(x),114,x,12);
      m+=`<circle cx="${px(t.low)}" cy="82" r="7" fill="${t.lowClosed?'#ffe38a':'#091b31'}" stroke="#ffe38a" stroke-width="3"/>`;
      if(t.high===null)m+=`<path d="M${px(end)-9} 73L${px(end)+3} 82L${px(end)-9} 91" fill="none" stroke="#ffe38a" stroke-width="3"/>`;else m+=`<circle cx="${px(t.high)}" cy="82" r="7" fill="${t.highClosed?'#ffe38a':'#091b31'}" stroke="#ffe38a" stroke-width="3"/>`;
      m+=text(180,26,'Read the endpoints and direction',17);label=`Number line. ${t.lowClosed?'Filled, included':'Open, excluded'} endpoint at ${t.low}; ${t.high===null?'ray towards larger values without an upper bound':`${t.highClosed?'filled, included':'open, excluded'} endpoint at ${t.high}, with the segment between the endpoints marked`}.`;
    }else if(t.g10Model==='sequence'){
      for(let i=0;i<4;i++){const x=12+i*87;m+=text(x+39,25,`Term ${i+1}`,15)+`<rect x="${x}" y="42" width="77" height="66" rx="7" fill="#193e55" stroke="#8ce8de"/>`+text(x+39,84,t.first+i*t.diff,25);}
      m+=text(180,140,'Continue with the same difference',16);label=`Linear sequence. Terms one to four are ${Array.from({length:4},(_,i)=>t.first+i*t.diff).join(', ')}. The difference stays constant.`;
    }else if(t.g10Model==='segment'){
      const limit=Math.max(3,...t.p.map(Math.abs),...t.r.map(Math.abs)),u=49/limit,px=x=>180+x*u,py=y=>82-y*u;
      m+=`<path d="M${px(-limit)} 82H${px(limit)}M180 ${py(-limit)}V${py(limit)}" ${stroke}/>`+text(250,85,'x',13)+text(184,28,'y',13);
      for(let n=-limit;n<=limit;n++){m+=`<path d="M${px(n)} 79V85M177 ${py(n)}H183" stroke="#5e9eae"/>`;if(n!==0)m+=text(px(n),py(-limit)+13,n,10);}
      if(t.kind==='cartesian')for(let id=1;id<=9;id++){const x=-2+(id-1)%3*2,y=-2+Math.floor((id-1)/3)*2;m+=`<circle data-midpoint-candidate="${id}" cx="${px(x)}" cy="${py(y)}" r="2.5" fill="#b0deed"/>`+text(px(x)+8,py(y)+3,'ABCDEFGHI'[id-1],10);}
      m+=`<path d="M${px(t.p[0])} ${py(t.p[1])}L${px(t.r[0])} ${py(t.r[1])}" stroke="#ffe38a" stroke-width="2"/>`;
      for(const [name,p]of[['P',t.p],['Q',t.r]])m+=`<circle cx="${px(p[0])}" cy="${py(p[1])}" r="4" fill="#ffe38a"/>`+text(px(p[0])-10,py(p[1])-6,name,12);
      m+=text(180,17,`P (${t.p.join(', ')}) · Q (${t.r.join(', ')})`,17);label=`Equal-unit Cartesian grid with endpoints P (${t.p.join(', ')}) and Q (${t.r.join(', ')}), joined by a segment. ${t.kind==='cartesian'?'The nine response candidates A to I use x and y values −2, 0 and 2.':'Use coordinate differences to calculate the distance.'}`;
    }else if(t.g10Model==='function'||t.g10Model==='wave'){
      const wave=t.g10Model==='wave',family=t.family,f=x=>wave?(family==='sin'?t.a*Math.sin(x*Math.PI/180)+t.offset:family==='cos'?t.a*Math.cos(x*Math.PI/180)+t.offset:t.a*Math.tan(x*Math.PI/180)+t.offset):family==='parabola'?t.a*x*x+t.offset:family==='reciprocal'?t.a/x+t.offset:t.a*t.base**x+t.offset;
      const xlo=wave?0:-3,xhi=wave?360:3,critical=wave?[t.offset-Math.abs(t.a),t.offset+Math.abs(t.a)]:family==='reciprocal'?[-Math.abs(t.a)*1.5+t.offset,Math.abs(t.a)*1.5+t.offset]:[f(-3),f(0),f(3)],ylo=family==='tan'?-3:Math.floor(Math.min(0,...critical))-1,yhi=family==='tan'?3:Math.ceil(Math.max(0,...critical))+1,px=x=>42+(x-xlo)*277/(xhi-xlo),py=y=>127-(y-ylo)*94/(yhi-ylo),id=`g10-curve-${++serial}`;
      m+=`<defs><clipPath id="${id}"><rect x="42" y="33" width="277" height="94"/></clipPath></defs><path d="M42 ${py(0)}H324M${px(0)} 29V130" ${stroke}/>`;
      for(const x of wave?[0,90,180,270,360]:[-3,-2,-1,0,1,2,3])m+=`<path d="M${px(x)} ${py(0)-3}V${py(0)+3}" stroke="#8ce8de"/>`+text(px(x),145,`${x}${wave?'°':''}`,11);
      for(const y of[...new Set([ylo,0,yhi])])m+=text(22,py(y)+4,y,11);
      const parts=family==='reciprocal'?[[-3,-.04],[.04,3]]:family==='tan'?[[0,89.8],[90.2,269.8],[270.2,360]]:[[xlo,xhi]];
      for(const [start,end]of parts){let d='';for(let i=0;i<=180;i++){const x=start+(end-start)*i/180;d+=`${i?'L':'M'}${px(x).toFixed(3)} ${py(f(x)).toFixed(3)}`;}m+=`<path data-function-branch="true" d="${d}" fill="none" stroke="#ffe38a" stroke-width="2.6" clip-path="url(#${id})"/>`;}
      if(family==='reciprocal'||family==='exponential')m+=`<path data-asymptote="horizontal" d="M42 ${py(t.offset)}H319" stroke="#ff9fae" stroke-width="2" stroke-dasharray="5 4"/>`+text(280,py(t.offset)-5,`y = ${t.offset}`,12);
      if(family==='reciprocal')m+=`<path data-asymptote="vertical" d="M${px(0)} 33V127" stroke="#ff9fae" stroke-width="2" stroke-dasharray="5 4"/>`;
      if(family==='tan')for(const x of[90,270])m+=`<path data-asymptote="vertical" d="M${px(x)} 33V127" stroke="#ff9fae" stroke-width="2" stroke-dasharray="4 3"/>`;
      if(t.query==='equation')for(const x of[-2,2]){const y=f(x);m+=`<circle data-function-point="${x},${y}" cx="${px(x)}" cy="${py(y)}" r="3" fill="#fff"/>`+text(px(x),py(y)-6,`(${x}, ${fmt(y)})`,12);}
      const rule=wave?`y = ${t.a===1?'':t.a}${family} θ ${t.offset===0?'':sign(t.offset)}`:family==='parabola'?`f(x) = ${t.a}x² ${sign(t.offset)}`:family==='reciprocal'?`f(x) = ${t.a}/x ${sign(t.offset)}`:`f(x) = ${t.a} × ${t.base}ˣ ${sign(t.offset)}`;
      m+=text(180,18,t.query==='equation'?`${family==='parabola'?'Parabola':'Reciprocal function'} · read marked coordinates`:rule,15)+text(336,py(0)+4,wave?'θ':'x',13);
      label=`${t.query==='equation'?'Function graph; determine its rule from marked points':rule}. Horizontal ${wave?'angle in degrees from zero to 360':'x from −3 to 3'}, vertical y from ${ylo} to ${yhi}. ${family==='reciprocal'?'Two separate branches, excluding x = 0, with horizontal asymptote y = '+t.offset+'.':family==='tan'?'Three separate tangent branches; values at 90 and 270 degrees are undefined.':family==='exponential'?'The horizontal asymptote is y = '+t.offset+'.':'Read the labelled axis values.'}`;
    }else if(t.g10Model==='triangle'||t.g10Model==='survey'){
      const a=t.opposite,b=t.adjacent,c=Math.hypot(a,b),u=Math.min(220/b,91/a),left=68,right=68+b*u,bottom=125,top=125-a*u,angle=Math.atan2(a,b),survey=t.g10Model==='survey';
      m+=`<path d="M${left} ${top}V${bottom}H${right}Z" fill="#193e55" stroke="#8ce8de" stroke-width="2.5"/><path d="M${left} ${bottom-9}H${left+9}V${bottom}" ${stroke}/><path d="M${right-22} ${bottom}A22 22 0 0 1 ${right-22*Math.cos(angle)} ${bottom-22*Math.sin(angle)}" fill="none" stroke="#ffe38a" stroke-width="2"/>`+text(right-34,bottom-7,'θ',16);
      const opp=survey?(t.query==='height'?'x':t.known==='opposite'?`${fmt(a)} m`:''):fmt(a),adj=survey?(t.query==='ground'?'x':t.known==='adjacent'?`${fmt(b)} m`:''):fmt(b),hyp=survey?(t.known==='hypotenuse'?`${fmt(c)} m`:''):fmt(c);
      m+=text(left-25,(top+bottom)/2,opp,15)+text((left+right)/2,147,adj,16)+text((left+right)/2+19,(top+bottom)/2-9,hyp,16)+text(180,18,survey?(t.angleLabel.includes('tan')?t.angleLabel:`θ = ${t.angleLabel}`):'Right triangle · θ at the right-hand vertex',15);
      label=survey?`Right-triangle survey, angle ${t.angleLabel} measured from horizontal ground. Known ${t.known} ${fmt(t.known==='hypotenuse'?c:t.known==='adjacent'?b:a)} metres. Find ${t.query==='height'?'vertical height':'horizontal ground distance'} x. Other unlabelled dimensions are not givens.`:`Right triangle. Relative to θ at the right-hand vertex: opposite ${a}, adjacent ${b}, hypotenuse ${fmt(c)}. Find ${t.query} theta.`;
    }else if(t.g10Model==='trigPoint'){
      const [x,y]=t.point,r=Math.hypot(x,y),u=11,cx=180,cy=82,a=(Math.atan2(y,x)+2*Math.PI)%(2*Math.PI),ex=cx+25*Math.cos(a),ey=cy-25*Math.sin(a);
      m+=`<path d="M110 82H250M180 22V142" ${stroke}/><path d="M180 82L${cx+x*u} ${cy-y*u}V82Z" fill="#20445c" stroke="#ffe38a" stroke-width="2"/><path d="M205 82A25 25 0 ${a>Math.PI?1:0} 0 ${ex} ${ey}" fill="none" stroke="#ffaf9e" stroke-width="2"/>`+text(180,16,`P (${x}, ${y}) · r = ${fmt(r)}`,17)+text(264,87,'x',14)+text(187,30,'y',14)+text(cx+x*u+(x<0?-12:12),cy-y*u,'P',15)+text(215,69,'θ',17);label=`Cartesian point P (${x}, ${y}), distance r = ${fmt(r)} from the origin. Theta is measured anticlockwise from the positive x-axis in the interval 0 to 360 degrees. Use the signed coordinate ratios.`;
    }else if(t.g10Model==='midline'){
      m+=`<path d="M180 28L70 126H300Z" fill="#193e55" stroke="#8ce8de" stroke-width="2.5"/><path d="M125 77H240" stroke="#ffe38a" stroke-width="3"/>`;
      for(const [x,y]of[[152.5,52.5],[97.5,101.5]])m+=`<path d="M${x-4} ${y-4}L${x+4} ${y+4}" ${stroke}/>`;
      for(const [x,y]of[[210,52.5],[270,101.5]])m+=`<path d="M${x-3} ${y+4}L${x+4} ${y-4}M${x} ${y+7}L${x+7} ${y-1}" ${stroke}/>`;
      m+=text(180,19,'A',15)+text(58,134,'B',15)+text(312,134,'C',15)+text(112,77,'D',15)+text(251,77,'E',15)+text(185,69,t.query==='midline'?'x':`${t.base/2} cm`,17)+text(184,147,t.query==='base'?'x':`${t.base} cm`,17);label=`Triangle ABC. D is the midpoint of AB; E is the midpoint of AC, as marked by matching ticks on each pair of halves. ${t.query==='midline'?`BC is ${t.base} cm; find DE`:`DE is ${t.base/2} cm; find BC`}.`;
    }else if(t.g10Model==='solid'){
      if(t.shape==='sphere')m+=`<circle cx="180" cy="81" r="53" fill="#193e55" stroke="#8ce8de" stroke-width="2.5"/><ellipse cx="180" cy="81" rx="53" ry="14" ${stroke}/><path d="M180 81H233" stroke="#ffe38a" stroke-width="2"/>`+text(206,74,`r = ${t.r} cm`,14);
      else if(t.shape==='cone')m+=`<path d="M113 119L180 25L247 119" fill="#193e55" stroke="#8ce8de" stroke-width="2.5"/><ellipse cx="180" cy="119" rx="67" ry="16" fill="#234a62" stroke="#8ce8de" stroke-width="2"/><path d="M180 25V119H247" stroke="#ffe38a" stroke-dasharray="4 3"/>`+text(154,75,`h = ${t.h}`,15)+text(214,115,`r = ${t.r}`,15)+(t.query==='surface'?text(246,69,`ℓ = ${fmt(t.slant)}`,15):'');
      else if(t.shape==='pyramid')m+=`<path d="M110 107L194 134L268 97L185 72Z M180 23L110 107M180 23L194 134M180 23L268 97M180 23L185 72" fill="#193e55" stroke="#8ce8de" stroke-width="2"/><path d="M180 23V103" stroke="#ffe38a" stroke-dasharray="4 3"/>`+text(150,66,`h = ${t.h}`,14)+text(171,148,`base edge = ${2*t.r} cm`,15)+(t.query==='surface'?text(255,56,`ℓ = ${fmt(t.slant)}`,14):'');
      else m+=`<path d="M125 72L180 20L235 72V121C235 143 125 143 125 121Z" fill="#193e55" stroke="#8ce8de" stroke-width="2.5"/><ellipse cx="180" cy="72" rx="55" ry="12" fill="#234a62" stroke="#8ce8de"/><path d="M180 20V72M180 72V121M180 72H235" stroke="#ffe38a" stroke-dasharray="4 3"/>`+text(290,47,`cone h = ${t.coneHeight}`,14)+text(293,108,`cylinder h = ${t.cylinderHeight}`,13)+text(207,67,`r = ${t.r}`,13);
      m+=text(180,15,t.shape==='combined'?'Joined cylinder and cone · all lengths cm':`${t.shape==='pyramid'?'Square pyramid':t.shape} · lengths in cm`,14);label=t.shape==='combined'?`Joined cylinder and right cone, common radius ${t.r} cm. Cylinder perpendicular height ${t.cylinderHeight} cm; cone perpendicular height ${t.coneHeight} cm. No interior overlap. Add the volumes.`:t.shape==='sphere'?`Sphere radius ${t.r} cm. Calculate ${t.query}. Use pi approximately 3.14.`:`${t.shape==='pyramid'?'Right square pyramid with base edge '+2*t.r:'Right cone with base radius '+t.r} cm. Perpendicular height ${t.h} cm${t.query==='surface'?`; ${t.shape==='pyramid'?'face':'cone'} slant height ${fmt(t.slant)} cm`:''}. Calculate ${t.query}. Dimension labels, rather than drawing lengths, are the givens.`;
    }else if(t.g10Model==='box'){
      const a=t.values,q1=(a[1]+a[2])/2,median=(a[3]+a[4])/2,q3=(a[5]+a[6])/2,min=a[0],max=a[7],px=x=>28+x*14;
      m+=text(180,19,`Sorted: ${a.join(', ')}`,15)+`<path d="M${px(min)} 76H${px(max)}M${px(min)} 63V89M${px(max)} 63V89" ${stroke}/><rect x="${px(q1)}" y="57" width="${px(q3)-px(q1)}" height="38" fill="#286b78" stroke="#8ce8de"/><path d="M${px(median)} 57V95M28 119H336" stroke="#ffe38a" stroke-width="2"/>`;
      for(let n=0;n<=22;n++)m+=`<path d="M${px(n)} 116V122" stroke="#8ce8de"/>`+(n%5===0?text(px(n),138,n,12):'');m+=text(180,43,'Quartiles: medians of the two halves',13);label=`Eight sorted values ${a.join(', ')}. Box-and-whisker plot on a unit scale; use the median of each four-value half for quartiles. The whisker ends are the minimum and maximum, and the central line is the median.`;
    }else if(t.g10Model==='grouped'){
      const u=14,left=73,bottom=122;m+=text(180,17,'Fictional journey times · frequency',16)+`<path d="M${left} 28V${bottom}H292" ${stroke}/>`;
      for(let n=0;n<=6;n+=2)m+=text(53,bottom-n*u+4,n,12);
      t.counts.forEach((n,i)=>{m+=`<rect data-histogram-bin="${i}" x="${left+i*70}" y="${bottom-n*u}" width="70" height="${n*u}" fill="#286b78" stroke="#8ce8de"/>`+text(left+i*70+35,bottom-n*u-5,n,15);});for(let i=0;i<=3;i++)m+=text(left+i*70,143,i*10,13);label=`Histogram of fictional journey times in minutes. Equal-width intervals ${t.counts.map((n,i)=>`${i*10} inclusive to ${(i+1)*10} exclusive: ${n} journeys`).join('; ')}. The bars touch because the intervals are adjacent. Individual times are unknown.`;
    }else if(t.g10Model==='venn'){
      const [onlyA,both,onlyB,neither]=t.regions,total=onlyA+both+onlyB+neither;m+=`<rect x="8" y="4" width="344" height="141" rx="7" fill="#10263d" stroke="#8ce8de"/><circle cx="140" cy="82" r="60" fill="#244c5c" fill-opacity=".7" stroke="#8ce8de" stroke-width="2"/><circle cx="220" cy="82" r="60" fill="#244c5c" fill-opacity=".7" stroke="#ffe38a" stroke-width="2"/>`+text(180,19,`Survey: ${total} learners`,15)+text(126,42,'A',17)+text(234,42,'B',17)+text(110,89,onlyA,22)+text(180,89,both,22)+text(250,89,onlyB,22)+text(324,132,neither,20);label=`Venn survey of ${total} equally likely selected learners. A only ${onlyA}; both A and B ${both}; B only ${onlyB}; neither ${neither}. All four counts are separate regions within the sample-space rectangle.`;
    }else return false;
    v.append(svg(m,label));return true;
  }
  window.MathGrade10Tools={draw,essential:t=>Boolean(t.g10Model&&t.g10Model!=='cards')};
})();
