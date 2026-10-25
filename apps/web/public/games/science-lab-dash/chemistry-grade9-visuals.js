(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScienceChemistryGrade9Visuals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const text=(x,y,value,size=19)=>`<text x="${x}" y="${y}" fill="#e4f6ff" font-size="${size}" font-family="system-ui,sans-serif">${escape(value)}</text>`;
  const rect=(x,y,w,h,fill,r=7)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
  const line=(x,y,x2,y2,color='#a7cbd8',width=3)=>`<path d="M${x} ${y}L${x2} ${y2}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
  const circle=(x,y,r,fill,attr='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${attr}/>`;
  const fmt=f=>f.replace(/\d/g,n=>'₀₁₂₃₄₅₆₇₈₉'[Number(n)]);
  const terms=a=>a.filter(([,n])=>n>0).map(([f,n])=>(n===1?'':n+' ')+fmt(f)).join(' + ');
  const phColors=['#d97e95','#df8492','#e39d7d','#e4bc82','#e1cd83','#d0d58a','#a8d59a','#87c9ac','#7cc3c8','#83b9de','#9eafe7','#b2a1e0','#c399d4','#d394c6','#d58cbb'];
  function phScale(ph,low=7,high=7){
    let s='';for(let n=0;n<=14;n++)s+=rect(30+n*36,88,34,43,phColors[n],3)+text(38+n*36,154,n,16);
    const x=47+ph*36;s+=`<path d="M${x-8} 65L${x+8} 65L${x} 80Z" fill="#f9e2b5"/>`+text(30,200,`Selected reading: pH ${ph}`,22)+text(30,232,low===high?'Reference: pH 7 neutral near 25 °C':`Brief: pH ${low}–${high}`,18);return s;
  }
  function inventoryDiagram(t,r){
    let s=text(30,27,t.type==='g9-balance'?'Audit coefficients and formulae':'Audit the proposed reaction record',20);
    s+=text(30,65,terms(r.before),22)+text(310,65,'→',24)+text(350,65,terms(r.after),22);
    s+=text(48,101,'Atom',16)+text(190,101,'Before',16)+text(365,101,'After',16);
    const symbols=[...new Set([...Object.keys(r.beforeCounts),...Object.keys(r.afterCounts)])];
    symbols.forEach((symbol,i)=>{const y=112+i*30,a=r.beforeCounts[symbol]||0,b=r.afterCounts[symbol]||0;s+=rect(30,y,540,27,a===b?'#29564f':'#624555',4)+text(48,y+20,symbol,18)+text(210,y+20,a,18)+text(385,y+20,b,18);});
    s+=text(30,267,r.success?'Atom counts and specified substance formulae agree.':'Proposed record: retain formulae and account for every atom.',17);return s;
  }
  function draw(t,value,r){
    let s='';
    switch(t.type){
      case 'g9-names':
        s=text(30,28,'Check the oxygen-count prefixes',20);
        r.pairs.forEach((p,i)=>{const y=57+i*56;s+=rect(30,y,540,46,r.success?'#29564f':'#284b63')+text(48,y+30,fmt(p.formula),23)+text(190,y+30,p.name,20);});
        s+=text(30,268,`${r.correct}/3 verified · mono 1, di 2, tri 3`,18);break;
      case 'g9-lattice':
        s=text(30,28,'Proposed 2D ionic-crystal slice',20);
        for(let i=0;i<16;i++){const sodium=value==='balanced'?(i%4+Math.floor(i/4))%2===0:i<r.sodium,x=65+i%4*65,y=74+Math.floor(i/4)*48;s+=circle(x,y,21,sodium?'#94d7d3':'#cfb6e9',`data-ion="${sodium?'Na':'Cl'}"`)+`<text x="${x}" y="${y+5}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="#153249">${sodium?'Na⁺':'Cl⁻'}</text>`;}
        s+=text(350,88,`Na⁺ count: ${r.sodium}`,20)+text(350,129,`Cl⁻ count: ${r.chloride}`,20)+text(350,170,`Net charge: ${r.charge>0?'+':''}${r.charge}`,19)+text(350,214,r.success?'1:1; neutral record':'Reject this proposal',18)+text(30,269,'NaCl is a lattice ratio, not an isolated molecule.',18);break;
      case 'g9-balance':case 'g9-nonmetal':case 'g9-products':s=inventoryDiagram(t,r);break;
      case 'g9-oxide':
        s=text(30,28,r.ionic?'Metal-oxide solid ratio':'Non-metal oxide',21)+text(45,83,fmt(r.formula),36);
        if(r.ionic){for(let i=0;i<12;i++){const metal=(i%4+Math.floor(i/4))%2===0,x=210+i%4*73,y=77+Math.floor(i/4)*58;s+=circle(x,y,23,metal?'#94d7d3':'#e5acbd',`data-oxide-ion="${metal?r.metal:'O'}"`)+`<text x="${x}" y="${y+6}" text-anchor="middle" font-size="17" font-family="system-ui,sans-serif" fill="#153249">${metal?r.metal+'²⁺':'O²⁻'}</text>`;}s+=text(30,266,'Schematic solid slice · equal metal/oxygen ion counts',17);}
        else{s+=line(255,145,325,145)+line(325,145,395,145);for(const [symbol,x]of [['O',255],['C',325],['O',395]])s+=circle(x,145,25,symbol==='C'?'#cabbea':'#e5acbd',`data-atom="${symbol}"`)+`<text x="${x}" y="152" text-anchor="middle" font-size="23" font-family="system-ui,sans-serif" fill="#153249">${symbol}</text>`;s+=text(30,266,'Carbon is a non-metal; this is a CO₂ molecule.',18);}break;
      case 'g9-corrosion':
        s=text(30,28,'Twelve iron sites · same moist-air interval',20)+rect(40,91,520,104,'#7d8b9b');
        for(let i=0;i<12;i++){const x=58+i*43,exposed=i<r.exposedSites;s+=rect(x,77,29,17,exposed?'#ba806d':'#82c9bb',2)+circle(x+14,145,9,exposed?'#bd7f66':'#cfdae3',`data-site="${exposed?'exposed':'protected'}"`);}
        s+=text(30,230,`Exposed: ${r.exposedSites} · protected: ${r.protectedSites}`,21)+text(30,266,'Rust at exposed sites is a qualitative model.',18);break;
      case 'g9-rain':
        s=text(30,28,'Same archive records; compare explanations',20)+rect(30,59,255,139,'#24465e')+rect(312,59,258,139,'#24465e');
        s+=text(48,91,'Background example',18)+text(48,145,'pH 5.6',32)+text(330,91,'Affected example',18)+text(330,145,'pH 4.2',32)+text(48,181,'CO₂ contributes',18)+text(330,181,'SO₂ + nitrogen oxides',17);
        s+=text(30,234,r.success?'Background and additional sources distinguished':'Proposed explanation omits important evidence',18)+text(30,267,'Illustrative readings; pH alone cannot identify pollutants.',17);break;
      case 'g9-ph':
        s=text(30,28,'Aqueous pH reference · about 25 °C',20)+phScale(r.ph)+text(30,267,'School scale 0–14 · logarithmic, not a mixing average',17);break;
      case 'g9-evidence':
        s=text(30,28,'Same sample · brief requires pH 2–4',20);
        if(value==='litmus'){s+=rect(70,83,122,54,'#86b9df')+text(222,120,'→',30)+rect(290,83,215,54,'#d98e9f')+text(70,179,'Blue litmus → red',22)+text(70,219,'Acidity, not a precise pH',21);}
        else if(value==='universal'){s+=rect(65,70,440,79,'#65523f')+text(85,120,'Supplied chart band: 2–4',25)+text(65,202,'An estimate supports the range.',21);}
        else{s+=rect(65,70,440,93,'#285a55')+text(88,131,'Calibrated pH reading: 3.0',26)+text(65,212,'Meets the given range brief.',21);}
        s+=text(30,267,'Colour depends on indicator and chart; not a safety test.',17);break;
      case 'g9-neutralise':
        s=text(30,28,'Abstract equivalents · given sensor readings',20)+text(40,65,'Acid input: 6',19)+text(310,65,`Base input: ${r.base}`,19);
        for(let i=0;i<6;i++)s+=circle(57+i*34,93,9,'#dba3b2','data-counter="acid"');for(let i=0;i<r.base;i++)s+=circle(320+i%6*36,87+Math.floor(i/6)*25,9,'#94d7d3','data-counter="base"');
        s+=rect(30,127,540,81,'#244b62')+text(48,155,`Reacted pairs: ${r.reacted} · salt units: ${r.salt} · new water: ${r.water}`,19)+text(48,190,`Acid excess: ${r.acidLeft} · base excess: ${r.baseLeft}`,20);
        s+=text(30,240,`Given sensor record: pH ${r.ph}`,24)+text(30,269,'Dilute HCl/NaOH near 25 °C; counters are not a recipe.',17);break;
      case 'g9-soil':
        s=text(30,28,'Greenhouse brief · supplied soil records',20)+phScale(r.ph,r.low,r.high)+text(30,267,'Specified crop/soil target; no real application amounts.',17);break;
      case 'g9-emissions':
        s=text(30,28,'Planning ledger · source emissions after each plan',19);
        for(const [i,label,count,total]of [[0,'SO₂',r.sulfur,12],[1,'Nitrogen oxides',r.nitrogen,8]]){const y=64+i*77;s+=text(35,y+23,label,19)+rect(220,y,300,32,'#304c63',3)+rect(220,y,300*count/total,32,'#94d7d3',3)+text(225,y+57,`${count} of ${total} remain`,17);}
        s+=text(30,236,`Resource tokens: ${r.tokens}/6`,23)+text(30,267,'Target: both pollutants reduced by at least 75%.',18);break;
      default:s=text(30,130,'Read the recorded observations below.',20);
    }
    return s;
  }
  return {draw};
});
