/* Exact Grade 6 diagrams and a saved, touch-sized transformation grid. */
(function(){
  'use strict';
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const svg=(markup,label)=>{const n=document.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('viewBox','0 0 360 150');n.setAttribute('role','img');n.setAttribute('aria-label',label);n.innerHTML=markup;return n;};
  const label=(x,y,text,size=18)=>`<text x="${x}" y="${y}" fill="#e2f9ff" font-size="${size}" text-anchor="middle">${text}</text>`;
  const cellName=id=>`${'ABC'[(id-1)%3]}${Math.floor((id-1)/3)+1}`;
  function renderResponse(t,s,{panel,onChange,effect}){
    if(t.kind!=='coordinate')return false;
    panel.className='response-panel tool-panel coordinate-panel';const grid=node('div',undefined,'coordinate-grid'),buttons=[];
    const status=node('output',Number(s.draft)>=1&&Number(s.draft)<=9?`Selected: ${cellName(Number(s.draft))}`:'Choose the destination cell.','tool-status');status.id='toolStatus';status.setAttribute('aria-label','Selected destination');
    for(let row=3;row>=1;row--)for(let col=1;col<=3;col++){const id=(row-1)*3+col,b=node('button',cellName(id));b.type='button';b.dataset.cell=id;b.setAttribute('aria-label',`Destination ${cellName(id)}`);b.setAttribute('aria-pressed',String(s.draft===String(id)));b.addEventListener('click',()=>{onChange(id);effect('move');buttons.forEach(other=>other.setAttribute('aria-pressed',String(other===b)));status.textContent=`Selected: ${cellName(id)}`;});buttons.push(b);grid.append(b);}
    panel.append(grid,status);return true;
  }
  function pieMarkup(values,labels,showPercent){
    const colours=['#f78496','#72cfff','#72e4bd'],total=values.reduce((a,b)=>a+b,0);let angle=-Math.PI/2,markup='';
    values.forEach((value,i)=>{const next=angle+value/total*Math.PI*2,x=90+56*Math.cos(angle),y=75+56*Math.sin(angle),ex=90+56*Math.cos(next),ey=75+56*Math.sin(next);markup+=`<path d="M90 75L${x} ${y}A56 56 0 ${value/total>.5?1:0} 1 ${ex} ${ey}Z" fill="${colours[i]}" stroke="#d8fff7" stroke-width="1.5"/>`;markup+=`<rect x="176" y="${35+i*32}" width="16" height="16" fill="${colours[i]}"/><text x="202" y="${49+i*32}" fill="white" font-size="17">${labels[i]}${showPercent?`: ${value}%`:''}</text>`;angle=next;});return markup;
  }
  function draw(t,v){
    if(!t.g6Model)return false;
    let markup='',description='';
    if(t.g6Model==='large'){
      const groups=[Math.floor(t.value/1000000),Math.floor(t.value/1000)%1000,t.value%1000],wrap=node('div',undefined,'g6-groups');['Millions','Thousands','Units'].forEach((name,i)=>{const col=node('div');col.append(node('small',name),node('b',String(groups[i]).padStart(i?3:1,'0')));wrap.append(col);});v.append(wrap);return true;
    }
    if(t.g6Model==='decimal'){
      const wrap=node('div',undefined,'g6-groups');['Units','Tenths','Hundredths'].forEach((name,i)=>{const digit=i===0?Math.floor(t.cents/100):i===1?Math.floor(t.cents/10)%10:t.cents%10,col=node('div');col.dataset.focus=String(i===t.power);col.append(node('small',name),node('b',String(digit)));wrap.append(col);});v.append(wrap);return true;
    }
    if(t.g6Model==='calculation'||t.g6Model==='division'||t.g6Model==='cards'){
      const text=t.display||(t.a!==undefined?`${t.a} ${t.op||'÷'} ${t.b}`:'Read the question. Choose a strategy, then check.');v.append(node('p',text,'math-readout'));return true;
    }
    if(t.g6Model==='ratio'){
      markup=label(180,22,'One symbol represents one equal part',16);let x=45;for(let i=0;i<t.ratio[0]+t.ratio[1];i++){markup+=`<circle cx="${x}" cy="75" r="13" fill="${i<t.ratio[0]?'#f78496':'#72cfff'}"/>`;x+=36;}markup+=label(180,132,`Red : Blue = ${t.ratio[0]} : ${t.ratio[1]}`,20);description=`Ratio model: ${t.ratio[0]} red parts and ${t.ratio[1]} blue parts. Each symbol is an equal part, not one cell.`;
    }else if(t.g6Model==='fractions'){
      t.operands.forEach((fraction,i)=>{const left=12+i*184,width=148/fraction.d,wholes=Math.ceil(fraction.n/fraction.d);markup+=label(left+74,23,t.labels[i],21);for(let whole=0;whole<wholes;whole++)for(let part=0;part<fraction.d;part++){const filled=whole*fraction.d+part<fraction.n;markup+=`<rect x="${left+part*width}" y="${40+whole*27}" width="${width}" height="21" fill="${filled?'#6be2cd':'#18324c'}" stroke="#d3fff6" stroke-width="1.3"/>`;}});description=t.operands.map(f=>`${f.n}/${f.d}, displayed in equal-sized whole strips`).join('; ');
    }else if(t.g6Model==='hundred'){
      for(let i=0;i<100;i++)markup+=`<rect x="${28+i%10*9}" y="${18+Math.floor(i/10)*11}" width="9" height="11" fill="${i<t.filled?'#6be2cd':'#18324c'}" stroke="#b9e4ee" stroke-width=".6"/>`;
      markup+=label(235,62,`${t.filled} out of 100`,22)+label(235,96,'One complete whole',16);description=`A hundred-square grid with ${t.filled} lit cells out of 100 equal cells.`;
    }else if(t.g6Model==='rule'){
      const boxes=[['Input',t.input],['Multiply',`× ${t.multiplier}`],['Then add',`+ ${t.offset}`],['Output','?']];boxes.forEach(([name,value],i)=>{const x=5+i*90;markup+=`<rect x="${x}" y="40" width="78" height="68" rx="8" fill="#173d56" stroke="#99edf0"/>`+label(x+39,30,name,14)+label(x+39,83,value,23);});description=`Input ${t.input}; multiply by ${t.multiplier}; then add ${t.offset}; find the output.`;
    }else if(t.g6Model==='angle'){
      const cx=180,cy=128,r=100;for(let degrees=0;degrees<=180;degrees+=15){const a=degrees*Math.PI/180,inner=degrees%30===0?84:91;markup+=`<path d="M${cx+Math.cos(a)*inner} ${cy-Math.sin(a)*inner}L${cx+Math.cos(a)*r} ${cy-Math.sin(a)*r}" stroke="#bcecf6" stroke-width="2"/>`;if(degrees%30===0)markup+=label(cx+Math.cos(a)*119,cy-Math.sin(a)*119+4,degrees,15);}
      const a=t.degrees*Math.PI/180;markup+=`<path d="M80 128A100 100 0 0 1 280 128" fill="none" stroke="#bcecf6"/><path d="M280 128H180L${cx+Math.cos(a)*96} ${cy-Math.sin(a)*96}" fill="none" stroke="#ffe38a" stroke-width="4"/><circle cx="180" cy="128" r="4" fill="white"/>`;description=`Protractor starts at zero on the right and ends at 180 on the left, with ticks every 15 degrees; the marked ray meets ${t.degrees} degrees.`;
    }else if(t.g6Model==='transform'){
      for(let r=3;r>=1;r--)for(let c=1;c<=3;c++)markup+=`<rect x="${120+(c-1)*34}" y="${24+(3-r)*34}" width="34" height="34" fill="#16354d" stroke="#9bd6e8"/>`;
      for(let i=0;i<3;i++)markup+=label(137+i*34,18,'ABC'[i],15)+label(109,47+i*34,3-i,15);
      const x=137+(t.from[0]-1)*34,y=41+(3-t.from[1])*34;markup+=`<circle cx="${x}" cy="${y}" r="9" fill="#ffe38a"/>`;
      if(t.operation==='reflect')markup+='<path d="M171 24V126" stroke="#fff" stroke-width="2" stroke-dasharray="4 4"/>';
      if(t.operation==='rotate')markup+='<path d="M166 70L176 80 M176 70L166 80" stroke="#82f5d5" stroke-width="3"/>';
      description=`Start marker at ${'ABC'[t.from[0]-1]}${t.from[1]}. Columns A to C go left to right. Rows 1 to 3 go bottom to top. ${t.operation==='reflect'?'Dotted mirror line through column B.':t.operation==='rotate'?'Rotation centre is B2.':''}`;
    }else if(t.g6Model==='net'){
      const face='fill="#63d8c4" stroke="#dcfff6" stroke-width="2"';
      if(t.net==='Cube'){for(const [x,y]of [[90,50],[120,50],[150,50],[180,50],[120,20],[120,80]])markup+=`<rect x="${x}" y="${y}" width="30" height="30" ${face}/>`;description='A flat net of six equal squares: four in a row and one above and below the second square.';}
      else if(t.net==='Triangular prism'){for(let i=0;i<3;i++)markup+=`<rect x="${105+i*40}" y="40" width="40" height="70" ${face}/>`;markup+=`<path d="M145 40L165 ${40-20*Math.sqrt(3)} 185 40Z M145 110L165 ${110+20*Math.sqrt(3)} 185 110Z" ${face}/>`;description='A flat net of three rectangles in a row and two equal triangular end faces attached to opposite ends of the middle rectangle.';}
      else if(t.net==='Square pyramid'){markup=`<rect x="140" y="50" width="40" height="40" ${face}/><path d="M140 50L160 15 180 50Z M180 50L215 70 180 90Z M180 90L160 125 140 90Z M140 90L105 70 140 50Z" ${face}/>`;description='A square with one triangular face attached to each of its four sides.';}
      else{const width=36*Math.PI,x=180-width/2;markup=`<rect x="${x}" y="43" width="${width}" height="60" ${face}/><circle cx="180" cy="25" r="18" ${face}/><circle cx="180" cy="121" r="18" ${face}/>`;description='A rectangular curved-surface piece with two equal circular end faces. The rectangle’s width equals the circles’ circumference.';}
    }else if(t.g6Model==='rectangle'){
      markup=`<rect x="90" y="35" width="170" height="80" fill="#163d4c" stroke="#83edd5" stroke-width="4"/>`+label(175,24,`${t.length} cm`,19)+label(303,80,`${t.width} cm`,19)+label(175,143,t.query==='area'?'Surface → square units':'Boundary → length units',15);description=`Rectangle, length ${t.length} centimetres and width ${t.width} centimetres.`;
    }else if(t.g6Model==='cuboid'){
      markup='<path d="M95 50L145 20H265L215 50Z" fill="#76e6d0" stroke="#dafff6" stroke-width="2"/><path d="M95 50H215V115H95Z" fill="#43b6b3" stroke="#dafff6" stroke-width="2"/><path d="M215 50L265 20V85L215 115Z" fill="#267d96" stroke="#dafff6" stroke-width="2"/>'+label(154,142,`${t.length} cm`,18)+label(285,72,`${t.height} cm`,18)+label(252,116,`${t.width} cm`,18);description=`Rectangular prism with inside length ${t.length} centimetres, width ${t.width} centimetres and height ${t.height} centimetres.`;
    }else if(t.g6Model==='journey'){
      markup=label(88,32,'Departure · Day 1',16)+label(271,32,'Arrival · Day 2',16)+label(88,82,t.labels[0],30)+label(271,82,t.labels[1],30)+label(180,127,'→ through midnight →',18);description=`Departure ${t.labels[0]}, arrival ${t.labels[1]} on the following day.`;
    }else if(t.g6Model==='pie'||t.g6Model==='spinner'){
      const values=t.g6Model==='pie'?t.values:t.counts;markup=pieMarkup(values,t.labels,t.g6Model==='pie');description=t.g6Model==='pie'?`Survey pie chart: ${t.labels.map((name,i)=>`${name} ${values[i]} percent`).join('; ')}.`:`Fair spinner with ${values.reduce((a,b)=>a+b)} equal sectors: ${t.labels.map((name,i)=>`${values[i]} ${name}`).join('; ')}.`;
      if(t.g6Model==='spinner'){for(let sector=0;sector<6;sector++){const a=-Math.PI/2+sector*Math.PI/3;markup+=`<path data-spinner-divider="true" d="M90 75L${90+56*Math.cos(a)} ${75+56*Math.sin(a)}" stroke="#d8fff7" stroke-width="1.5"/>`;}markup+='<path d="M84 8H96L90 23Z" fill="#ffe38a"/>';markup+=label(180,146,'6 equal sectors',14);}
    }else if(t.g6Model==='table'){
      markup=label(180,18,`Recorded ${t.unit}`,16);t.values.forEach((value,i)=>{const y=31+i*37;markup+=`<rect x="55" y="${y}" width="250" height="35" fill="#17374f" stroke="#8edce9"/>`+label(120,y+24,t.labels[i],18)+label(255,y+24,value,21);});description=`Frequency table, ${t.unit}: ${t.labels.map((name,i)=>`${name} ${t.values[i]}`).join('; ')}.`;
    }else if(t.g6Model==='values'){
      t.values.forEach((value,i)=>{const x=8+i*70;markup+=`<rect x="${x}" y="43" width="62" height="58" rx="7" fill="#163b55" stroke="#91e5ec"/>`+label(x+31,80,value,22);});description=`Recorded values: ${t.values.join(', ')}.`;
    }else return false;
    v.append(svg(markup,description));return true;
  }
  const essential=t=>!!t.g6Model&&!['cards','calculation','division','rule','large','decimal'].includes(t.g6Model);
  window.MathGrade6Tools={renderResponse,draw,essential};
})();
