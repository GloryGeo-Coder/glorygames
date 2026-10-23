/* Precise mathematical diagrams and touch tools. All values come from the authored activity bank. */
(function(){
  'use strict';
  const svg=(markup,label,viewBox='0 0 360 150')=>{const n=document.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('viewBox',viewBox);n.setAttribute('role','img');n.setAttribute('aria-label',label);n.innerHTML=markup;return n;};
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const shapeMarkup=name=>{
    const common='fill="#61daca" stroke="#d3fff4" stroke-width="3"';
    if(name==='circle')return `<circle cx="60" cy="50" r="34" ${common}/>`;
    if(name==='square')return `<rect x="27" y="17" width="66" height="66" ${common}/>`;
    if(name==='rectangle')return `<rect x="13" y="25" width="94" height="50" ${common}/>`;
    if(name==='triangle')return `<polygon points="60,10 14,88 106,88" ${common}/>`;
    if(name==='hexagon')return `<polygon points="35,14 85,14 110,50 85,86 35,86 10,50" ${common}/>`;
    if(name==='pentagon')return `<polygon points="${Array.from({length:5},(_,i)=>{const a=(i*72-90)*Math.PI/180;return `${60+42*Math.cos(a)},${50+42*Math.sin(a)}`;}).join(' ')}" ${common}/>`;
    return '';
  };
  const shapeImage=(name,label)=>svg(shapeMarkup(name),label||`${name} diagram`,'0 0 120 100');
  const names=['circle','square','triangle'];
  function output(text,label){const out=node('output',text,'tool-status');out.id='toolStatus';out.setAttribute('aria-label',label);return out;}
  function tallyImage(count){let lines='';for(let i=0;i<count;i++){const group=Math.floor(i/5),at=i%5,x=4+group*34;if(at===4)lines+=`<path d="M${x-2} 23L${x+26} 3"/>`;else lines+=`<path d="M${x+at*7} 4V23"/>`;}return svg(`<g stroke="#ffe38a" stroke-width="2.3">${lines}</g>`,`${count} tally marks`,'0 0 68 28');}
  function renderResponse(t,s,{panel,onChange,effect}){
    if(window.MathGrade6Tools?.renderResponse(t,s,{panel,onChange,effect}))return true;
    if(!['choice','mirror','tile','tally'].includes(t.kind))return false;
    panel.className=`response-panel tool-panel ${t.kind}-panel`;
    const change=value=>{onChange(value);effect('move');};
    if(t.kind==='choice'){
      const grid=node('div',undefined,'shape-options'),status=output('Choose an answer.','Selected answer');
      const buttons=[];for(const o of t.options){const b=node('button');b.type='button';b.dataset.choice=o.value;if(o.shape){const img=shapeImage(o.shape);img.setAttribute('aria-hidden','true');b.append(img);}b.append(node('span',o.label));b.setAttribute('aria-pressed',String(String(o.value)===s.draft));b.addEventListener('click',()=>{change(o.value);for(const other of buttons)other.setAttribute('aria-pressed',String(other===b));status.textContent=`Selected: ${o.label}`;});buttons.push(b);grid.append(b);if(String(o.value)===s.draft)status.textContent=`Selected: ${o.label}`;}panel.append(grid,status);
    }else if(t.kind==='mirror'){
      let mask=(Number(s.draft)||0)&63;const grid=node('div',undefined,'mirror-grid');const status=output('Complete the right half.','Reflection progress');
      for(let r=0;r<3;r++)for(let c=0;c<4;c++){
        if(c<2){const on=!!t.source[r*2+c],cell=node('span',on?'●':'','mirror-cell given');cell.dataset.lit=String(on);cell.setAttribute('aria-label',`Given ${on?'lit':'unlit'} square, row ${r+1}, column ${c+1}`);grid.append(cell);}
        else{const bit=r*2+c-2,b=node('button','●','mirror-cell');b.type='button';b.dataset.bit=bit;b.setAttribute('aria-label',`Reflection row ${r+1}, column ${c-1}`);b.setAttribute('aria-pressed',String(!!(mask&(1<<bit))));b.addEventListener('click',()=>{mask^=1<<bit;b.setAttribute('aria-pressed',String(!!(mask&(1<<bit))));change(mask);status.textContent='Reflection updated. Check when ready.';});grid.append(b);}
      }panel.append(grid,status);
    }else if(t.kind==='tile'){
      const count=Math.max(0,Math.min(t.rows*t.columns,Number(s.draft)||0)),selected=new Set(Array.from({length:count},(_,i)=>i));const grid=node('div',undefined,'tile-grid');grid.style.setProperty('--tile-columns',t.columns);const status=output(`${selected.size} square units covered`,'Area covered');
      for(let i=0;i<t.rows*t.columns;i++){const b=node('button','□');b.type='button';b.dataset.tile=i;b.setAttribute('aria-label',`Cover square in row ${Math.floor(i/t.columns)+1}, column ${i%t.columns+1}`);b.setAttribute('aria-pressed',String(selected.has(i)));b.addEventListener('click',()=>{selected.has(i)?selected.delete(i):selected.add(i);b.setAttribute('aria-pressed',String(selected.has(i)));change(selected.size);status.textContent=`${selected.size} square units covered`;});grid.append(b);}panel.append(grid,status);
    }else{
      const encoded=Number(s.draft)||0,counts=[encoded%100,Math.floor(encoded/100)%100,Math.floor(encoded/10000)%100].map(n=>Math.max(0,Math.min(9,n)));const grid=node('div',undefined,'tally-counters');
      for(let i=0;i<3;i++){
        const col=node('div',undefined,'tally-column'),label=node('small',t.labels[i]),marks=node('div',undefined,'tally-marks'),count=node('strong',String(counts[i]));marks.append(tallyImage(counts[i]));
        const plus=node('button','+'),minus=node('button','−');plus.dataset.tally=i;plus.dataset.delta='1';minus.dataset.tally=i;minus.dataset.delta='-1';plus.setAttribute('aria-label',`Add a tally for ${t.labels[i].toLowerCase()}`);minus.setAttribute('aria-label',`Remove a tally for ${t.labels[i].toLowerCase()}`);
        for(const [b,delta]of [[plus,1],[minus,-1]])b.addEventListener('click',()=>{counts[i]=Math.max(0,Math.min(9,counts[i]+delta));count.textContent=counts[i];marks.replaceChildren(tallyImage(counts[i]));change(counts[0]+counts[1]*100+counts[2]*10000);});
        col.append(label,marks,plus,count,minus);grid.append(col);
      }panel.append(grid);
    }
    return true;
  }
  function clock(total){
    const hour=Math.floor(total/60)%12,minute=total%60,hand=(angle,length)=>{const a=angle*Math.PI/180;return [60+Math.sin(a)*length,55-Math.cos(a)*length];},h=hand((hour+minute/60)*30,25),m=hand(minute*6,37);
    const markup=`<circle cx="60" cy="55" r="45" fill="#102c47" stroke="#9ce9f5" stroke-width="3"/><g fill="#fff" font-size="12" text-anchor="middle"><text x="60" y="23">12</text><text x="96" y="60">3</text><text x="60" y="95">6</text><text x="24" y="60">9</text></g><path d="M60 55L${h[0]} ${h[1]}" stroke="#ffe38a" stroke-width="5" stroke-linecap="round"/><path d="M60 55L${m[0]} ${m[1]}" stroke="#84f5e3" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="55" r="4" fill="#fff"/>`;
    const time=`${String(Math.floor(total/60)).padStart(2,'0')}:${String(minute).padStart(2,'0')}`,wrap=node('div',undefined,'clock-unit');wrap.append(svg(markup,`Clock showing ${time}`,'0 0 120 110'),node('b',time));return wrap;
  }
  function draw(t,v){
    if(window.MathGrade6Tools?.draw(t,v))return true;
    if(!['choice','shape','mirror','ruler','tile','mass','jug','elapsed','tally','chart','placeRead','round','readout','product','growing','fractionMath','solid','areaGrid','volume'].includes(t.kind))return false;
    if(t.kind==='placeRead'){
      const table=node('div',undefined,'digit-chart');const labels=['100 000','10 000','1 000','100','10','1'];String(t.value).padStart(6,'0').split('').forEach((digit,i)=>{const col=node('div');col.dataset.focus=String(5-i===t.power);col.append(node('small',labels[i]),node('b',digit));table.append(col);});v.append(table,node('p','Column values'));
    }else if(t.kind==='round'){
      const x=30+(t.value-t.low)/t.unit*300;v.append(svg(`<path d="M30 65H330 M30 55V75 M180 55V75 M330 55V75" stroke="#91e8f7" stroke-width="3"/><circle cx="${x}" cy="65" r="7" fill="#ffe38a"/><g fill="white" text-anchor="middle" font-size="17"><text x="55" y="104">${t.low}</text><text x="180" y="33">Halfway</text><text x="305" y="104">${t.high}</text><text x="180" y="140">${t.value}</text></g>`,`Rounding number line from ${t.low} to ${t.high}. Marked number: ${t.value}.`));
    }else if(t.kind==='readout')v.append(node('p',t.display,'math-readout'));
    else if(t.kind==='product')v.append(node('p',`${t.a} ${t.op} ${t.b}`,'math-readout'));
    else if(t.kind==='growing'){
      let markup='';t.values.forEach((count,i)=>{markup+=`<text x="${60+i*120}" y="24" text-anchor="middle" fill="white" font-size="16">Stage ${i+1}</text>`;for(let n=0;n<count;n++)markup+=`<circle cx="${22+i*120+n%4*24}" cy="${49+Math.floor(n/4)*26}" r="8" fill="#ffe38a"/>`;});v.append(svg(markup,`Dot patterns: stages 1, 2, 3 contain ${t.values.join(', ')} dots.`));
    }else if(t.kind==='fractionMath'||t.kind==='choice'&&t.bars){
      let markup='';t.bars.forEach((bar,i)=>{const y=22+i*65,w=250/bar.d;for(let n=0;n<bar.d;n++)markup+=`<rect x="${85+n*w}" y="${y}" width="${w}" height="35" fill="${n<bar.n?'#56d6c8':'#193752'}" stroke="#dcfff8"/>`;markup+=`<text x="10" y="${y+25}" fill="white" font-size="22">${bar.label}</text>`;});v.append(svg(markup,t.bars.map(b=>`${b.n} out of ${b.d} equal parts`).join('; ')));
    }else if(t.kind==='choice'&&t.angle!==undefined){
      const a=t.angle*Math.PI/180,cx=130,cy=114,r=78,x=cx+r*Math.cos(a),y=cy-r*Math.sin(a),arc=38;v.append(svg(`<path d="M${x} ${y}L${cx} ${cy}H${cx+r}" fill="none" stroke="#a5effc" stroke-width="5"/><path d="M${cx+arc} ${cy}A${arc} ${arc} 0 0 0 ${cx+arc*Math.cos(a)} ${cy-arc*Math.sin(a)}" fill="none" stroke="#ffe38a" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="4" fill="white"/>`,`Angle with highlighted interior region; compare with a square corner.`));
    }else if(t.kind==='solid'){
      const common='stroke="#cafff3" stroke-width="2.5" stroke-linejoin="round"';let markup;
      if(t.solid==='Square pyramid')markup=`<path d="M180 15L75 104 180 138Z" fill="#47adbb" ${common}/><path d="M180 15L285 104 180 138Z" fill="#268294" ${common}/><path d="M75 104L180 74 285 104 M180 74V15" fill="none" stroke="#cafff3" stroke-dasharray="5 4"/>`;
      else if(t.solid==='Triangular prism')markup=`<path d="M70 115L120 35 170 115Z" fill="#53cabb" ${common}/><path d="M120 35L250 20 300 100 170 115Z" fill="#268294" ${common}/><path d="M70 115L200 100 250 20 M200 100L300 100" stroke="#cafff3" stroke-dasharray="5 4" fill="none"/>`;
      else{const right=t.solid==='Cube'?245:290;markup=`<path d="M95 48L145 18 ${right} 18 ${right-50} 48Z" fill="#79e4ce" ${common}/><path d="M95 48H${right-50}V132H95Z" fill="#47adbb" ${common}/><path d="M${right-50} 48L${right} 18V102L${right-50} 132Z" fill="#268294" ${common}/><path d="M95 132L145 102H${right} M145 102V18" stroke="#cafff3" stroke-dasharray="5 4" fill="none"/>`;}
      v.append(svg(markup,`${t.solid}. Dashed edges show hidden parts.`));
    }else if(t.kind==='areaGrid'){
      const rows=t.cells.length,columns=t.cells[0].length,size=100/rows;let markup='';t.cells.forEach((row,r)=>row.forEach((on,c)=>{markup+=`<rect x="${90+c*size}" y="${10+r*size}" width="${size}" height="${size}" fill="${on?'#55d5c4':'#12263c'}" stroke="#b1e6f3" stroke-width="2"/>`;}));markup+='<text x="180" y="143" text-anchor="middle" fill="white" font-size="17">1 lit cell = 1 square unit</text>';v.append(svg(markup,`Floor grid, rows from top: ${t.cells.map(row=>row.map(on=>on?'lit':'empty').join(', ')).join('; ')}. Each lit cell is one square unit.`));
    }else if(t.kind==='volume'){
      let markup='';for(let layer=0;layer<t.layers;layer++){const left=12+layer*(336/t.layers);markup+=`<text x="${left+48}" y="24" text-anchor="middle" fill="white" font-size="17">Layer ${layer+1}</text>`;for(let r=0;r<t.rows;r++)for(let c=0;c<t.columns;c++){const x=left+c*24+r*5,y=50+r*32;markup+=`<path d="M${x} ${y}l6 -6h22l-6 6Z" fill="#88edd2" stroke="#d4fff5"/><path d="M${x} ${y}h22v22h-22Z" fill="#42b7b2" stroke="#d4fff5"/><path d="M${x+22} ${y}l6 -6v22l-6 6Z" fill="#247d93" stroke="#d4fff5"/>`;}}v.append(svg(markup,`${t.layers} separately shown layers; each layer has ${t.rows} rows of ${t.columns} unit cubes.`));
    }else if(t.kind==='choice'||t.kind==='shape'){
      if(t.shape)v.append(shapeImage(t.shape,t.kind==='choice'?'Shape to identify':'Shape with straight sides'));else v.append(node('p','Compare each shape’s sides and corners.'));
    }else if(t.kind==='mirror')v.append(node('p','The dotted line is the mirror. Match distance and row.'));
    else if(t.kind==='tile')v.append(node('div','1 square = 1 square unit','unit-tile'),node('p','Cover the surface without gaps or overlaps.'));
    else if(t.kind==='ruler'){
      const x=n=>25+n*25;let ticks='';for(let n=0;n<=12;n++)ticks+=`<path d="M${x(n)} 65V${n%2===0?90:82}"/><text x="${x(n)}" y="109" text-anchor="middle" fill="white" stroke="none" font-size="14">${n}</text>`;
      v.append(svg(`<rect x="${x(t.start)}" y="20" width="${(t.end-t.start)*25}" height="23" fill="#ffe38a"/><path d="M${x(t.start)} 43V65 M${x(t.end)} 43V65" stroke="#ffe38a" stroke-dasharray="3 3"/><g stroke="#8fe9f5" stroke-width="2">${ticks}<path d="M25 65H325"/></g><text x="341" y="90" fill="white" font-size="14">cm</text>`,`Ruler in centimetres. Strip starts at ${t.start} cm and ends at ${t.end} cm.`,'0 0 360 120'));
    }else if(t.kind==='mass'){
      const load=node('div',undefined,'mass-load');load.append(node('span',`${t.kg} kg`),node('b','+'),node('span',`${t.grams} g`));v.append(load,node('p','1 kg = 1 000 g'));
    }else if(t.kind==='jug'){
      const y=value=>135-value/t.capacity*115;let ticks='';for(let amount=0;amount<=t.capacity;amount+=t.step)ticks+=`<path d="M145 ${y(amount)}H165" stroke="#d5f8ff"/><text x="138" y="${y(amount)+4}" text-anchor="end" fill="white" font-size="13">${amount}</text>`;
      v.append(svg(`<rect x="165" y="20" width="100" height="115" fill="#123652"/><rect x="166" y="${y(t.fill)}" width="98" height="${135-y(t.fill)}" fill="#4ad3e6"/><path d="M165 12V135H265V12 M265 35Q310 35 265 80" stroke="#b7e9f6" stroke-width="3" fill="none"/>${ticks}<text x="290" y="118" fill="white" font-size="14">mL</text>`,`Jug scale in millilitres, marked every ${t.step} mL. Water level: ${t.fill} mL.`,'60 0 270 150'));
    }else if(t.kind==='elapsed'){
      const pair=node('div',undefined,'clock-pair');pair.append(clock(t.start),node('span','→'),clock(t.end));v.append(pair);
    }else if(t.kind==='tally'){
      const items=node('ul',undefined,'survey-items');const remaining=[...t.counts];let turn=0;while(remaining.some(n=>n>0)){const category=turn++%3;if(!remaining[category])continue;remaining[category]--;const item=node('li');item.setAttribute('aria-label',names[category]);const image=shapeImage(names[category]);image.setAttribute('aria-hidden','true');item.append(image);items.append(item);}v.append(items);
    }else if(t.pictograph){
      const chart=node('div',undefined,'pictograph');chart.setAttribute('role','img');chart.setAttribute('aria-label',t.labels.map((l,i)=>`${l}: ${t.values[i]} learners`).join('; '));
      for(let i=0;i<t.values.length;i++){const row=node('div');row.append(node('b',t.labels[i]),node('span','★'.repeat(t.values[i]/(t.scale||1))));chart.append(row);}v.append(chart,node('p',`Each ★ represents ${t.scale||'one'} ${t.scale>1?'learners':'learner'}.`));
    }else{
      const chart=node('div',undefined,'bar-chart'),max=Math.ceil(Math.max(...t.values)/2)*2;chart.setAttribute('role','img');chart.setAttribute('aria-label',`Travel survey, number of learners. ${t.labels.map((l,i)=>`${l}: ${t.values[i]}`).join('; ')}`);
      const axis=node('div',undefined,'bar-axis');for(const n of [max,max/2,0])axis.append(node('span',String(n)));
      const plot=node('div',undefined,'bar-plot');for(let i=0;i<t.values.length;i++){const col=node('div',undefined,'bar-column'),bar=node('div',undefined,'data-bar');bar.style.height=`${t.values[i]/max*100}%`;bar.append(node('span',String(t.values[i])));col.append(bar,node('b',t.labels[i]));plot.append(col);}chart.append(axis,plot);v.append(chart);
    }
    return true;
  }
  const essential=t=>window.MathGrade6Tools?.essential(t)||['shape','ruler','mass','jug','elapsed','tally','chart','growing','solid','areaGrid','volume'].includes(t.kind)||(t.kind==='choice'&&(!!t.shape||!!t.bars||t.angle!==undefined));
  window.MathLearningTools={renderResponse,draw,essential};
})();
