/* Exact Grade 8 evidence diagrams and a keyboard/touch Cartesian point selector. */
(function(){
  'use strict';
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const text=(x,y,s,size=17)=>`<text x="${x}" y="${y}" fill="#e2f9ff" font-size="${size}" text-anchor="middle">${s}</text>`;
  const stroke='fill="none" stroke="#8ce8de" stroke-width="3"';
  const svg=(markup,label)=>{const n=document.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('viewBox','0 0 360 150');n.setAttribute('role','img');n.setAttribute('aria-label',label);n.innerHTML=markup;return n;};
  const coords=id=>[-2+(id-1)%3*2,-2+Math.floor((id-1)/3)*2],name=id=>'ABCDEFGHI'[id-1];
  function renderResponse(t,s,{panel,onChange,effect}){
    if(t.kind!=='cartesian')return false;
    panel.className='response-panel tool-panel cartesian-panel';const grid=node('div',undefined,'coordinate-grid cartesian-grid'),buttons=[];
    const valid=Number(s.draft)>=1&&Number(s.draft)<=9,status=node('output',valid?`Selected: ${name(Number(s.draft))} · (${coords(Number(s.draft)).join(', ')})`:'Choose a labelled point.','tool-status');status.id='toolStatus';status.setAttribute('aria-label','Selected Cartesian point');
    for(const value of ['y/x','−2','0','2']){const label=node('span',value);label.setAttribute('aria-hidden','true');grid.append(label);}
    for(let row=2;row>=0;row--){const label=node('span',String(-2+row*2));label.setAttribute('aria-hidden','true');grid.append(label);for(let col=0;col<3;col++){
      const id=row*3+col+1,b=node('button',name(id));b.type='button';b.dataset.plot=id;b.setAttribute('aria-label',`Point ${name(id)}, x ${coords(id)[0]}, y ${coords(id)[1]}`);b.setAttribute('aria-pressed',String(s.draft===String(id)));
      b.addEventListener('click',()=>{onChange(id);effect('move');buttons.forEach(other=>other.setAttribute('aria-pressed',String(other===b)));status.textContent=`Selected: ${name(id)} · (${coords(id).join(', ')})`;});buttons.push(b);grid.append(b);
    }
    }
    panel.append(grid,status);return true;
  }
  function arc(cx,cy,start,end,r=19){const rad=d=>d*Math.PI/180;return `<path d="M${cx+r*Math.cos(rad(start))} ${cy-r*Math.sin(rad(start))}A${r} ${r} 0 ${end-start>180?1:0} 0 ${cx+r*Math.cos(rad(end))} ${cy-r*Math.sin(rad(end))}" fill="none" stroke="#ffe38a" stroke-width="2"/>`;}
  const angleLabel=(cx,cy,start,end,label,r=42)=>{const a=(start+end)/2*Math.PI/180;return text(cx+r*Math.cos(a),cy-r*Math.sin(a)+5,label,17);};
  function draw(t,v){
    if(!t.g8Model)return false;
    let m='',label='';
    if(t.g8Model==='cards'){v.append(node('p',t.display||'Read the question. Choose a strategy, then check.','math-readout'));return true;}
    if(t.g8Model==='pattern'){
      const n=t.stage,u=Math.min(19,200/n,98/n),left=150-n*u/2,top=30;
      for(let r=0;r<n;r++)for(let c=0;c<n;c++)m+=`<rect data-square-cell="true" x="${left+c*u}" y="${top+r*u}" width="${u-1.5}" height="${u-1.5}" fill="#6be2cd"/>`;
      for(let i=0;i<2;i++)m+=`<rect data-spare-cell="true" x="${left+n*u+16}" y="${60+i*22}" width="18" height="18" fill="#ffe38a"/>`;
      m+=text(180,19,`Stage ${n}: ${n} × ${n} square + 2 spares`,16);label=`A ${n} by ${n} square of cells and two separate spare cells.`;
    }else if(t.g8Model==='function'){
      const values=[t.unknown?'?':t.input,`× ${t.multiplier}`,`+ ${t.offset}`,t.unknown?t.input*t.multiplier+t.offset:'?'];values.forEach((value,i)=>{const x=6+i*90;m+=`<rect x="${x}" y="42" width="76" height="66" rx="8" fill="#173d56" stroke="#9aeeef"/>`+text(x+38,30,['Input x','Multiply','Then add','Output y'][i],14)+text(x+38,83,value,22);});label=`Function y = ${t.multiplier}x + ${t.offset}. ${t.unknown?`Output ${t.input*t.multiplier+t.offset}; find the input.`:`Input ${t.input}; find the output.`}`;
    }else if(t.g8Model==='equation'){
      const signed=n=>n<0?`− ${-n}`:`+ ${n}`;m=`<path d="M180 44V123M138 125H222M28 46H332M75 46V92M285 46V92" ${stroke}/><path d="M18 93H152L137 112H33Z M218 93H352L337 112H233Z" fill="#234f68" stroke="#8ce8de"/>`+text(85,80,`${t.a}x ${signed(t.c)}`,22)+text(285,80,`${t.rightA}x ${signed(t.rightC)}`,22)+text(180,28,'Equal values on both sides',17);label=`Balanced equation: ${t.a}x plus ${t.c} equals ${t.rightA}x plus ${t.rightC}.`;
    }else if(t.g8Model==='cartesian'){
      const x=n=>180+n*26,y=n=>75-n*26;
      for(let n=-2;n<=2;n++){m+=`<path d="M${x(n)} 23V127M128 ${y(n)}H232" stroke="#416980" stroke-width="1"/>`;if(n!==0)m+=text(x(n),91,n,12)+text(166,y(n)+4,n,12);}
      m+='<path d="M116 75H248M180 139V9" fill="none" stroke="#baf5ff" stroke-width="2"/>'+text(258,81,'x',16)+text(169,14,'y',14)+text(171,89,'0',12);
      for(let id=1;id<=9;id++){const[c,r]=coords(id);m+=`<circle data-cartesian-point="${id}" cx="${x(c)}" cy="${y(r)}" r="3" fill="#ffe38a"/>`+text(x(c)+10,y(r)-6,name(id),13);}
      if(t.from)m+=`<circle cx="${x(t.from[0])}" cy="${y(t.from[1])}" r="7" fill="none" stroke="#ffe38a" stroke-width="2"/>`;
      label='Cartesian plane, equal unit spacing on both axes. '+Array.from({length:9},(_,i)=>`${name(i+1)} at (${coords(i+1).join(', ')})`).join('; ')+(t.from?`. Start point (${t.from.join(', ')}), ringed in gold.`:'.');
    }else if(t.g8Model==='graph'){
      const x=n=>180+n*48,y=n=>75-n*13;
      for(let n=-4;n<=4;n++){m+=`<path d="M84 ${y(n)}H276" stroke="#3d6077"/>`;if(n!==0)m+=text(68,y(n)+4,n,12);}
      for(let n=-2;n<=2;n++)m+=`<path d="M${x(n)} 23V127" stroke="#3d6077"/>`+text(x(n),145,n,13);
      m+='<path d="M80 75H286M180 132V18" fill="none" stroke="#baf5ff" stroke-width="2"/>';
      m+=`<polyline points="${t.values.map((n,i)=>`${x(i-2)},${y(n)}`).join(' ')}" fill="none" stroke="#ffe38a" stroke-width="3"/>`;t.values.forEach((n,i)=>{m+=`<circle data-signal-point="true" cx="${x(i-2)}" cy="${y(n)}" r="3" fill="#fff2ab"/>`;});m+=text(180,13,'Signal level (vertical)',14)+text(318,145,'Time',12)+text(68,79,'0',12);label=`Signal graph: at times −2, −1, 0, 1, 2, levels are ${t.values.join(', ')}. Vertical scale −4 to 4 in steps of one.`;
    }else if(t.g8Model==='angles'){
      const rel=t.relationship,g=t.given;
      if(rel==='corresponding'||rel==='cointerior'){
        const theta=rel==='cointerior'?180-g:g,tan=Math.tan(theta*Math.PI/180),at=y=>180+(78-y)/tan,upper=45,lower=111;
        m=`<path d="M50 ${upper}H310M50 ${lower}H310M${at(9)} 9L${at(141)} 141" ${stroke}/><path d="M72 40L80 45 72 50 M72 106L80 111 72 116" stroke="#ffe38a" fill="none" stroke-width="2"/>`;
        const start=rel==='cointerior'?180+theta:0,end=rel==='cointerior'?360:theta;
        m+=arc(at(upper),upper,start,end,17)+angleLabel(at(upper),upper,start,end,`${g}°`,36)+arc(at(lower),lower,0,theta,17)+angleLabel(at(lower),lower,0,theta,'x',36);
      }else{
        const a=g*Math.PI/180,cx=180,cy=77;m=`<path d="M65 ${cy}H295M${cx-68*Math.cos(a)} ${cy+68*Math.sin(a)}L${cx+68*Math.cos(a)} ${cy-68*Math.sin(a)}" ${stroke}/>`+arc(cx,cy,0,g)+angleLabel(cx,cy,0,g,`${g}°`);
        const start=rel==='opposite'?180:g,end=rel==='opposite'?180+g:180;m+=arc(cx,cy,start,end)+angleLabel(cx,cy,start,end,'x');
      }
      label=`${rel} angle diagram. The marked known angle is ${g} degrees; the other marked angle is x.${['corresponding','cointerior'].includes(rel)?' Matching arrows mark the two horizontal lines as parallel.':''}`;
    }else if(t.g8Model==='triangleAngles'){
      const[a,b]=t.angles,ta=Math.tan(a*Math.PI/180),tb=Math.tan(b*Math.PI/180),width=Math.min(170,80/(ta*tb/(ta+tb))),u=width*tb/(ta+tb),h=u*ta,left=180-width/2,base=121;
      m=`<path d="M${left} ${base}H${left+width}L${left+u} ${base-h}Z" fill="#1a4c5b" stroke="#8ce8de" stroke-width="3"/>`+text(left,145,`${a}°`,18)+text(left+width,145,`${b}°`,18)+text(left+u,base-h-8,'x',20);label=`Triangle with left base angle ${a} degrees, right base angle ${b} degrees and unknown apex angle x. The drawn slopes follow the given angles.`;
    }else if(t.g8Model==='pythagoras'){
      const unit=Math.min(160/t.a,85/t.b),w=t.a*unit,h=t.b*unit,left=100,base=115;
      m=`<path d="M${left} ${base-h}V${base}H${left+w}Z" fill="#1a4c5b" stroke="#8ce8de" stroke-width="3"/><path d="M${left} ${base-9}h9v9" stroke="#ffe38a" fill="none" stroke-width="2"/>`+text(left+w/2,140,`${t.a} cm`,18)+text(left-30,base-h/2,t.missing==='leg'?'x cm':`${t.b} cm`,18)+text(left+w/2+27,base-h/2-10,t.missing==='hypotenuse'?'x cm':`${t.c} cm`,18);
      label=t.missing==='leg'?`Right triangle: known shorter side ${t.a} cm, hypotenuse ${t.c} cm, unknown other leg x.`:`Right triangle: shorter sides ${t.a} and ${t.b} cm, unknown hypotenuse x. The right angle is marked.`;
    }else if(t.g8Model==='circle'){
      m=`<circle cx="145" cy="76" r="56" ${stroke}/><circle cx="145" cy="76" r="3" fill="#e2f9ff"/><path d="M145 76H201" stroke="#ffe38a" stroke-width="3"/>`+text(276,69,`r = ${t.radius} cm`,21)+text(276,98,'π ≈ 3.14',17);label=`Circle with radius ${t.radius} centimetres marked from the centre to its boundary. Use pi approximately 3.14 as stated in the question.`;
    }else if(t.g8Model==='composite'){
      const u=Math.min(200/t.length,90/t.height),w=t.length*u,h=t.height*u,cw=t.cutWidth*u,ch=t.cutHeight*u,left=180-w/2,top=27;
      m=`<path d="M${left} ${top}H${left+w-cw}V${top+ch}H${left+w}V${top+h}H${left}Z" fill="#1a4c5b" stroke="#8ce8de" stroke-width="3"/><rect x="${left+w-cw}" y="${top}" width="${cw}" height="${ch}" fill="none" stroke="#ffe38a" stroke-dasharray="4 3"/>`+text(180,top+h+23,`${t.length} cm`,18)+text(left-27,top+h/2,`${t.height} cm`,17)+text(left+w-cw/2,top-9,`${t.cutWidth} cm`,16)+text(left+w+28,top+ch/2+5,`${t.cutHeight} cm`,16);label=`An outer rectangle ${t.length} by ${t.height} cm with a ${t.cutWidth} by ${t.cutHeight} cm top-right corner removed. Dashed gold lines show the removed rectangle.`;
    }else if(t.g8Model==='prism'){
      const u=Math.min(100/t.a,80/t.b),w=t.a*u,h=t.b*u,x=105,y=119,dx=55,dy=-20;
      m=`<path d="M${x} ${y-h}L${x+dx} ${y-h+dy} ${x+w+dx} ${y+dy} ${x+w} ${y}Z" fill="#327e96" stroke="#d3fff6" stroke-width="2"/><path d="M${x} ${y}L${x+dx} ${y+dy} ${x+w+dx} ${y+dy} ${x+w} ${y}Z" fill="#24576f" stroke="#d3fff6" stroke-width="2"/><path d="M${x} ${y-h}V${y}H${x+w}Z" fill="#60c7b9" stroke="#d3fff6" stroke-width="2"/><path d="M${x} ${y-8}h8v8" stroke="#ffe38a" fill="none" stroke-width="2"/>`+text(x+w/2,y+23,`${t.a} cm`,17)+text(x-30,y-h/2,`${t.b} cm`,17)+text(x+w/2+16,y-h/2-8,`${t.c} cm`,16)+text(x+w+dx+35,y-h/2-22,`${t.length} cm`,17);label=`Closed triangular prism. The right-triangle ends have perpendicular sides ${t.a} and ${t.b} cm and hypotenuse ${t.c} cm. The length joining the ends is ${t.length} cm. Perspective schematic.`;
    }else if(t.g8Model==='statistics'){
      t.values.forEach((value,i)=>{m+=`<rect x="${3+i*60}" y="45" width="54" height="56" rx="6" fill="#173d56" stroke="#8ce8de"/>`+text(30+i*60,80,value,21);});m+=text(180,25,'Six journey times · minutes',17);label=`Six journey times in minutes, in recorded order: ${t.values.join(', ')}.`;
    }else if(t.g8Model==='stem'){
      m=text(115,22,'Stem',17)+text(230,22,'Leaves',17)+'<path d="M155 29V121" stroke="#8ce8de" stroke-width="2"/>';
      t.rows.forEach(([stem,leaves],i)=>{m+=text(115,50+i*29,stem,22)+text(230,50+i*29,leaves.join('   '),22);});m+=text(180,146,'Key: 2 | 4 = 24',16);label=`Stem-and-leaf display, key 2 | 4 means 24. Rows: ${t.rows.map(([s,l])=>`${s} | ${l.join(' ')}`).join('; ')}.`;
    }else if(t.g8Model==='tokens'){
      const total=t.counts[0]+t.counts[1];for(let i=0;i<total;i++)m+=`<circle data-probability-token="true" cx="${64+i%4*70}" cy="${51+Math.floor(i/4)*53}" r="17" fill="${i<t.counts[0]?'#f78496':'#72cfff'}" stroke="#d3fff6" stroke-width="2"/>`;
      m+=text(180,18,'Each token is equally likely',16)+text(180,145,`${t.counts[0]} red · ${t.counts[1]} blue`,17);label=`Random selection from ${total} identical-sized tokens: ${t.counts[0]} red and ${t.counts[1]} blue. Every individual token is equally likely.`;
    }else return false;
    v.append(svg(m,label));return true;
  }
  window.MathGrade8Tools={renderResponse,draw,essential:t=>!!t.g8Model&&t.g8Model!=='cards'};
})();
