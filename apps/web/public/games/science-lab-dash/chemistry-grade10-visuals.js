(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ScienceChemistryGrade10Visuals=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const text=(x,y,v,size=20)=>`<text x="${x}" y="${y}" fill="#e4f6ff" font-size="${size}" font-family="system-ui,sans-serif">${esc(v)}</text>`;
  const rect=(x,y,w,h,fill,r=7)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
  const circle=(x,y,r,fill,attr='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${attr}/>`;
  const line=(x,y,x2,y2,color='#a7cbd8',w=3)=>`<path d="M${x} ${y}L${x2} ${y2}" stroke="${color}" stroke-width="${w}" fill="none"/>`;
  const centered=(x,y,v,size=19)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#153249" font-size="${size}" font-family="system-ui,sans-serif">${esc(v)}</text>`;
  const water=(x,y,k=1,bonds=true)=>{let s=bonds?line(x-11*k,y,x,y,'#a7cbd8',2)+line(x,y,x+11*k,y,'#a7cbd8',2):'';s+=circle(x,y,5*k,'#e5acbd','data-atom="O"')+circle(x-11*k,y,4*k,'#94d7e3','data-atom="H"')+circle(x+11*k,y,4*k,'#94d7e3','data-atom="H"');return s;};
  function calculation(title,lines,proposal,working){let s=text(30,29,title,20);lines.forEach((v,i)=>{s+=rect(30,55+i*48,540,40,'#254a60')+text(46,82+i*48,v,21);});s+=text(30,228,proposal,20)+text(30,266,working?'The proposed record meets the calculation brief.':'Compare the proposed record with the calculation.',18);return s;}
  function draw(t,value,r){
    let s='';
    switch(t.type){
      case 'g10-isotope':case 'g10-ion':{
        s=text(30,28,t.type==='g10-isotope'?'Atomic identity · counts, not scale':'Element identity and net ion charge',20);
        const rows=t.type==='g10-isotope'?[['Protons',r.protons,'#edc58e','protons'],['Neutrons',r.neutrons,'#98d1d1','neutrons'],['Electrons',r.electrons,'#cbb6ed','electrons']]:[['Protons',r.protons,'#edc58e','protons'],['Electrons',r.electrons,'#cbb6ed','electrons']];
        rows.forEach(([name,count,color,key],i)=>{const y=63+i*48;s+=text(35,y+21,`${name}: ${count}`,19);for(let n=0;n<count;n++)s+=circle(210+n*17,y+14,6,color,`data-subatomic="${key}"`);});
        s+=text(30,233,t.type==='g10-isotope'?`Z = ${r.atomicNumber}; A = ${r.massNumber}`:`Charge = ${r.protons} − ${r.electrons} = ${r.charge}`,25)+text(30,267,t.type==='g10-isotope'?'Same-element isotopes retain the same proton count.':'Changing electrons need not change the element.',18);break;
      }
      case 'g10-average':
        s=text(30,28,'Model abundance: 75% mass-35, 25% mass-37',20)+rect(50,60,375,37,'#94d7d3')+text(440,86,'75%',20)+rect(50,112,125,37,'#cabbea')+text(190,138,'25%',20)+text(30,194,'0.75 × 35 + 0.25 × 37 = 35.5',25)+text(30,232,`Proposed Aᵣ: ${r.proposed}`,22)+text(30,267,'Weighted relative mass; integer isotope mass numbers.',17);break;
      case 'g10-config':
        s=text(30,28,'Proposed neon occupancy · capacities shown',20);
        ['1s','2s','2p'].forEach((label,i)=>{const y=60+i*50,capacity=i===2?6:2;s+=text(35,y+25,label,23)+rect(110,y,300,34,'#24485f')+text(430,y+25,`${r.occupancy[i]}/${capacity}`,22);for(let n=0;n<r.occupancy[i];n++)s+=circle(130+n*34,y+17,8,'#cbb6ed','data-kind="electron"');});
        s+=text(30,266,`Total ${r.electrons}; neutral neon requires 10 electrons.`,19);break;
      case 'g10-bond':
        s=text(30,28,'Compare the specified bonding records',20);
        if(value==='shared'){s+=circle(190,124,42,'#94d7e3')+circle(410,124,42,'#94d7e3')+centered(190,133,'H',31)+centered(410,133,'H',31)+circle(285,124,8,'#cabbea','data-kind="shared-electron"')+circle(315,124,8,'#cabbea','data-kind="shared-electron"')+text(145,222,'One shared pair: a single covalent bond',19);}
        else if(value==='transfer'){s+=circle(185,125,45,'#94d7d3')+circle(415,125,45,'#cabbea')+centered(185,135,'Na⁺',28)+centered(415,135,'Cl⁻',28)+text(270,133,'→',36)+text(30,222,'After-transfer ions · extended lattice ratio',20);}
        else {for(let i=0;i<12;i++)s+=circle(145+i%4*92,80+Math.floor(i/4)*49,14,'#94d7d3')+centered(145+i%4*92,86+Math.floor(i/4)*49,'+',21);for(let i=0;i<6;i++)s+=circle(190+i%3*90,101+Math.floor(i/3)*52,6,'#cabbea','data-kind="mobile-electron" class="floating"');s+=text(30,241,'Metallic kernels and delocalised electrons',19);}
        s+=text(30,268,'Schematic bonding evidence, not electron trajectories.',17);break;
      case 'g10-ratio':
        s=text(30,28,'Proposed magnesium/chloride ratio',20);
        for(let i=0;i<r.magnesium;i++)s+=circle(120+i*95,111,34,'#94d7d3','data-ion="Mg"')+centered(120+i*95,119,'Mg²⁺',21);
        for(let i=0;i<r.chloride;i++)s+=circle(365+i*95,111,34,'#cabbea','data-ion="Cl"')+centered(365+i*95,119,'Cl⁻',24);
        s+=text(30,207,`Charge sum: ${r.magnesium} × (+2) + ${r.chloride} × (−1) = ${r.charge}`,22)+text(30,266,r.success?'MgCl₂: neutral ratio in an extended ionic solid.':'Reject this charged proposal for the neutral solid.',18);break;
      case 'g10-structure':
        s=text(30,28,value==='diamond'?'Diamond: bound covalent-network electrons':value==='graphite'?'Graphite: mobile electrons along layers':'Copper: mobile electrons in a metal',19);
        for(let row=0;row<3;row++)for(let col=0;col<4;col++){const x=130+col*100,y=72+row*53;if(col<3)s+=line(x,y,x+100,y);if(row<2&&value!=='graphite')s+=line(x,y,x,y+53);s+=circle(x,y,12,value==='copper'?'#94d7d3':'#cabbea','data-kind="structure-site"');}
        if(r.mobileElectrons)for(let i=0;i<6;i++)s+=circle(175+i%3*100,91+Math.floor(i/3)*55,6,'#f0cd91','data-kind="mobile-electron" class="floating"');
        s+=text(30,239,r.mobileElectrons?'Mobile carriers support this conducting record.':'No equivalent mobile-electron path in this record.',18)+text(30,268,'Structure motifs are qualitative, not exact geometry.',17);break;
      case 'g10-phase':
        s=text(30,28,'Before: liquid water',20)+text(330,28,'Proposed boiling record',19)+rect(30,84,235,125,'#24485f')+rect(330,55,240,165,'#24485f');
        for(let i=0;i<6;i++){s+=water(69+i%3*75,125+Math.floor(i/3)*45);s+=water(369+i%3*75,86+Math.floor(i/3)*98,value==='grow'?2:1,value!=='split');}
        s+=text(30,244,r.success?'Internal bonds retained; molecules separate.':value==='grow'?'Reject: water molecules do not grow on boiling.':'Reject: ordinary boiling does not split H₂O.',18)+text(30,269,'H blue, O pink · schematic markers, not measured sizes',17);break;
      case 'g10-mass':
        s=text(30,28,'Initial apparatus + contents: 120 g',21)+rect(45,71,500,35,'#31536b')+rect(45,71,500*r.retained/120,35,'#94d7d3')+text(45,143,`On balance: ${r.retained} g`,25)+text(45,186,`Outside as escaped gas: ${r.escaped} g`,22)+text(45,227,`Accounted total: ${r.accounted} g`,25)+text(30,268,'Track the system boundary; gas also has mass.',18);break;
      case 'g10-mole':{
        const scientific={one:'6.02214076 × 10²³',half:'3.01107038 × 10²³',two:'1.204428152 × 10²⁴'}[value];
        s=text(30,28,'Specified entity: H₂O molecule',21)+rect(45,65,500,33,'#31536b')+rect(45,65,500*r.amount/2,33,'#94d7d3')+text(45,133,`${r.amount} mol`,29)+text(45,183,scientific+' molecules',23)+text(30,229,'1 mol contains exactly Nₐ specified entities.',20)+text(30,267,'Scaled amount bar; each water molecule has 3 atoms.',17);break;
      }
      case 'g10-molar':s=calculation('Molar mass with supplied rounded values',['2 H: 2 × 1 = 2 g/mol','1 O: 1 × 16 = 16 g/mol','M(H₂O): 2 + 16 = 18 g/mol'],`Proposed: ${r.proposed} g/mol`,r.success);break;
      case 'g10-amount':s=calculation('Convert sample mass to amount',['n = m ÷ M','9 g ÷ 18 g/mol','Calculated amount: 0.5 mol'],`Proposed: ${r.proposed} mol`,r.success);break;
      case 'g10-concentration':s=calculation('Use the final solution volume',['500 mL = 0.500 dm³','c = n ÷ V = 0.20 ÷ 0.500','Calculated c: 0.40 mol/dm³'],`Proposed: ${r.proposed} mol/dm³`,r.success);break;
      case 'g10-yield':s=calculation('2 H₂ + O₂ → 2 H₂O; oxygen in excess',['4 g ÷ 2 g/mol = 2 mol H₂','Mole ratio H₂ : H₂O = 1 : 1','2 mol × 18 g/mol = 36 g H₂O'],`Proposed ideal product: ${r.proposed} g`,r.success);break;
      case 'g10-core':s=calculation('Final concentration: 0.20 mol/dm³',['250 mL = 0.250 dm³','n = cV = 0.20 × 0.250 = 0.050 mol','m = nM = 0.050 × 58.5 = 2.925 g'],`Proposed: ${r.proposed} g`,r.success);break;
      default:s=text(30,130,'Read the recorded observations below.',20);
    }
    return s;
  }
  return {draw};
});
