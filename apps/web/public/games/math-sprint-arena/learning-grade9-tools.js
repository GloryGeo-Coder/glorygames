/* Grade 9 evidence models. All labels derive from the authored task data. */
(function(){
  'use strict';
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const text=(x,y,s,size=16)=>`<text x="${x}" y="${y}" fill="#e2f9ff" font-size="${size}" text-anchor="middle">${s}</text>`;
  const stroke='fill="none" stroke="#8ce8de" stroke-width="2"';
  const svg=(markup,label)=>{const n=document.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('viewBox','0 0 360 150');n.setAttribute('role','img');n.setAttribute('aria-label',label);n.innerHTML=markup;return n;};
  function draw(t,v){
    if(!t.g9Model)return false;
    let m='',label='';
    if(t.g9Model==='cards'){v.append(node('p',t.display||'Inspect the question, choose a strategy and check.','math-readout'));return true;}
    if(t.g9Model==='proportion'){
      const rows=[[t.inverse?'Pumps':'Packs',t.inverse?'Minutes':'Cost (R)'],[t.workers,t.time],[t.newWorkers,'?']];
      rows.forEach((row,r)=>row.forEach((value,c)=>{m+=`<rect x="${45+c*135}" y="${7+r*45}" width="135" height="45" fill="${r?'#193e55':'#245768'}" stroke="#8ce8de"/>`+text(112+c*135,36+r*45,value,18);}));label=`${t.inverse?'Identical pumps draining one tank':'Identical packs at a fixed unit price'}: ${t.workers} for ${t.time}; ${t.newWorkers} for unknown ${t.inverse?'minutes':'rand'}.`;
    }else if(t.g9Model==='frame'){
      const n=t.stage+2,u=Math.min(18,116/n),left=180-n*u/2;
      for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(r===0||c===0||r===n-1||c===n-1)m+=`<rect data-border-cell="true" x="${left+c*u}" y="${25+r*u}" width="${u-1}" height="${u-1}" fill="#6be2cd"/>`;
      m+=text(180,18,`Outer ${n} × ${n}; empty centre ${t.stage} × ${t.stage}`,15);label=`A one-cell border around an empty ${t.stage} by ${t.stage} square. The outside is ${n} by ${n}. Count only the border.`;
    }else if(t.g9Model==='binomial'){
      const unit=Math.min(25,230/(6+t.b),103/(6+t.a)),x=70,y=30,w=6*unit,h=6*unit;
      for(const [px,py,pw,ph,fill,s]of[[x,y,w,h,'#1b526a','x²'],[x+w,y,t.b*unit,h,'#296e71',`${t.b}x`],[x,y+h,w,t.a*unit,'#296e71',`${t.a}x`],[x+w,y+h,t.b*unit,t.a*unit,'#806839',`${t.a*t.b}`]])m+=`<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${fill}" stroke="#8ce8de"/>`+text(px+pw/2,py+ph/2+5,s,16);
      m+=text(x+w/2,20,'x',16)+text(x+w+t.b*unit/2,20,t.b,16)+text(45,y+h/2,'x',16)+text(45,y+h+t.a*unit/2,t.a,16);label=`Area model for (x + ${t.a})(x + ${t.b}), for positive x. Four regions: x squared, ${t.b}x, ${t.a}x and ${t.a*t.b}. Symbolic x is shown at an illustrative length.`;
    }else if(t.g9Model==='line'){
      const mSlope=t.slope[0]/t.slope[1],c=t.intercept,points=[[-2,c-2*mSlope],[0,c],[2,c+2*mSlope]],max=Math.max(2,...points.map(p=>Math.abs(p[1]))),ux=55,uy=53/max,px=x=>180+x*ux,py=y=>77-y*uy;
      m+=`<path d="M45 77H321M180 15V137" ${stroke}/>`;
      for(let x=-2;x<=2;x++)m+=`<path d="M${px(x)} 73V81" ${stroke}/>`+text(px(x),146,x,12);
      for(const y of[-max,0,max])m+=`<path d="M176 ${py(y)}H184" ${stroke}/>`+text(156,py(y)+4,y,12);
      m+=text(333,79,'x',14)+text(198,14,'y',14)+`<path d="M${px(-2)} ${py(c-2*mSlope)}L${px(2)} ${py(c+2*mSlope)}" stroke="#ffe38a" stroke-width="3"/>`;
      for(const [i,p]of points.entries())m+=`<circle data-line-point="${p.join(',')}" cx="${px(p[0])}" cy="${py(p[1])}" r="4" fill="#fff"/>`+text(px(p[0])+(i===1?36:0),py(p[1])-9,`(${p.join(', ')})`,13);
      label=`Straight line through ${points.map(p=>`(${p.join(', ')})`).join(', ')}. Horizontal labels give x; vertical labels give y. Use coordinate differences, not the drawing angle.`;
    }else if(t.g9Model==='similar'){
      const u=Math.min(100/(t.base*t.k),92/(t.height*t.k)),smallX=35,largeX=190,y=121;
      for(const [x,k,names]of[[smallX,1,['A','B','C']],[largeX,t.k,['D','E','F']]]){const w=t.base*k*u,h=t.height*k*u;m+=`<path d="M${x} ${y}H${x+w}L${x} ${y-h}Z" fill="#193e55" stroke="#8ce8de" stroke-width="2"/>`+text(x+w/2,146,`${t.base*k} cm`,16)+text(x-16,y-h/2,k===1?`${t.height} cm`:'x',14)+text(x-6,y+13,names[0],11)+text(x+w+8,y+3,names[1],11)+text(x,y-h-6,names[2],11);}
      m+=text(180,17,'A ↔ D, B ↔ E, C ↔ F',16);label=`Similar triangles ABC and DEF. AB ${t.base} cm corresponds to DE ${t.base*t.k} cm. AC ${t.height} cm corresponds to DF x. Matching angles are equal. Both triangles use one drawing scale.`;
    }else if(t.g9Model==='polygon'){
      const pts=Array.from({length:t.sides},(_,i)=>{const a=-Math.PI/2+2*Math.PI*i/t.sides;return [180+58*Math.cos(a),78+58*Math.sin(a)];});m+=`<polygon data-sides="${t.sides}" points="${pts.map(p=>p.join(',')).join(' ')}" fill="#193e55" stroke="#8ce8de" stroke-width="3"/>`+text(180,81,`${t.sides} sides`,16)+text(180,148,'Regular polygon · equal sides and angles',13);label=`Regular convex ${t.sides}-sided polygon with equal sides and angles.`;
    }else if(t.g9Model==='scale'){
      const small=84/t.k,top=36;
      m+=`<rect x="55" y="${top+84-small}" width="${small}" height="${small}" fill="#276b78" stroke="#8ce8de"/><rect x="211" y="${top}" width="84" height="84" fill="#276b78" stroke="#8ce8de"/>`+text(92,144,`${t.query==='area'?'Area':'Perimeter'} ${t.value} ${t.query==='area'?'cm²':'cm'}`,14)+text(253,144,'Find matching measure',13)+text(180,20,`Length scale factor ×${t.k}`,17);label=`Two similar squares. The larger side is ${t.k} times the smaller side. Small ${t.query} ${t.value} ${t.query==='area'?'square centimetres':'centimetres'}. Find the larger ${t.query}.`;
    }else if(t.g9Model==='cylinder'){
      m+=`<path d="M112 36V112C112 141 248 141 248 112V36" fill="#193e55" stroke="#8ce8de" stroke-width="3"/><ellipse cx="180" cy="36" rx="68" ry="18" fill="#296476" stroke="#8ce8de" stroke-width="3"/><path d="M180 36H248M269 36V112M262 36H276M262 112H276" stroke="#ffe38a" stroke-width="2"/><circle cx="180" cy="36" r="3" fill="#fff"/>`+text(205,29,`r = ${t.radius} cm`,14)+text(311,80,`${t.height} cm`,16)+text(180,149,'Both circular ends included · π ≈ 3.14',14);label=`Closed cylinder. Radius ${t.radius} cm from the top centre to rim; perpendicular height ${t.height} cm. Both circular ends are included. Use pi approximately 3.14. Drawing is a schematic.`;
    }else if(t.g9Model==='scatter'){
      const px=x=>55+x*39,py=y=>127-y*10;m+=`<path d="M55 17V127H325" ${stroke}/>`;
      for(let x=0;x<=6;x++)m+=text(px(x),144,x,12);
      for(const y of[0,5,10])m+=text(35,py(y)+4,y,12);
      for(const [x,y]of t.pairs)m+=`<circle data-scatter-point="${x},${y}" cx="${px(x)}" cy="${py(y)}" r="5" fill="#ffe38a"/>`;
      m+=text(340,129,'x',14)+text(54,13,'y',14);label=`Fictional research scatter plot with coordinate pairs ${t.pairs.map(p=>p.join(',')).join('; ')}. Inspect the overall association; no causal claim is supplied.`;
    }else if(t.g9Model==='tree'){
      m+=text(30,82,'Start',13);
      for(const [i,first]of['H','T'].entries()){const y=38+i*70;m+=`<path d="M52 77L132 ${y}" ${stroke}/>`+text(139,y+5,first,17)+text(88,y+(i?10:-8),'½',14);for(const[j,second]of['H','T'].entries()){const end=y+(j?20:-20);m+=`<path d="M154 ${y}L265 ${end}" ${stroke}/>`+text(211,end+(j?10:-5),'½',14)+text(295,end+5,first+second,18);}}
      label='Two independent fair coin tosses. First branch heads or tails, each probability one half. Each branches into heads or tails, each one half. Four equally likely complete outcomes HH, HT, TH, TT.';
    }else if(t.g9Model==='twoWay'){
      for(let r=0;r<3;r++)for(let c=0;c<7;c++){const value=r===0?(c===0?'Coin/die':c):c===0?(r===1?'H':'T'):`${r===1?'H':'T'}${c}`;m+=`<rect x="${5+c*50}" y="${9+r*44}" width="50" height="44" fill="${r&&c?'#193e55':'#245768'}" stroke="#8ce8de"/>`+text(30+c*50,37+r*44,value,c||r?16:10);}
      label='Two-way table for an independent fair coin and fair six-sided die. Columns die 1 to 6; rows heads and tails. Twelve equally likely outcomes H1 to H6 and T1 to T6.';
    }else if(t.g9Model==='bag'){
      const total=t.red+t.blue;for(let i=0;i<total;i++)m+=`<circle data-token="${i<t.red?'red':'blue'}" cx="${180+(i-(total-1)/2)*35}" cy="55" r="13" fill="${i<t.red?'#ff8b91':'#78bfff'}" stroke="#fff"/>`+text(180+(i-(total-1)/2)*35,60,i<t.red?'R':'B',13);
      m+=text(180,99,`${t.red} red · ${t.blue} blue`,18)+text(180,130,'Draw → replace → mix → draw again',16);label=`Bag with ${t.red} red tokens marked R and ${t.blue} blue tokens marked B. All equally likely. Draw at random, replace and mix before a second draw.`;
    }else return false;
    v.append(svg(m,label));return true;
  }
  window.MathGrade9Tools={draw,essential:t=>Boolean(t.g9Model&&t.g9Model!=='cards')};
})();
