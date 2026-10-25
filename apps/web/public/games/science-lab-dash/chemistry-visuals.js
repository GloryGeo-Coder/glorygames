(function(r,f){const grade5=typeof module==='object'&&module.exports?require('./chemistry-grade5-visuals.js'):r.ScienceChemistryGrade5Visuals;const grade6=typeof module==='object'&&module.exports?require('./chemistry-grade6-visuals.js'):r.ScienceChemistryGrade6Visuals;const grade7=typeof module==='object'&&module.exports?require('./chemistry-grade7-visuals.js'):r.ScienceChemistryGrade7Visuals;const grade8=typeof module==='object'&&module.exports?require('./chemistry-grade8-visuals.js'):r.ScienceChemistryGrade8Visuals;const grade9=typeof module==='object'&&module.exports?require('./chemistry-grade9-visuals.js'):r.ScienceChemistryGrade9Visuals;const api=f(grade5,grade6,grade7,grade8,grade9);if(typeof module==='object'&&module.exports)module.exports=api;else r.ScienceChemistryVisuals=api;})(typeof globalThis!=='undefined'?globalThis:this,function(grade5,grade6,grade7,grade8,grade9){
'use strict';
const text=(x,y,s,size=22)=>`<text x="${x}" y="${y}" fill="#e4f6ff" font-size="${size}" font-family="system-ui,sans-serif">${s}</text>`;
const rect=(x,y,w,h,c,rad=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="${c}"/>`;
const line=(x1,y1,x2,y2,c='#a7cbd8',w=5)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
function vessel(x){return `<path d="M${x} 65V220H${x+170}V65" fill="#1e3e55" stroke="#a7cbd8" stroke-width="4"/>`;}
function dots(state,x){return Array.from({length:18},(_,i)=>{const cx=x+18+(i%6)*(state==='gas'?26:24),cy=state==='gas'?85+Math.floor(i/6)*52:state==='solid'?145+Math.floor(i/6)*24:166+Math.floor(i/6)*19;return `<circle class="${state==='solid'?'':'floating'}" cx="${cx}" cy="${cy}" r="7" fill="${state==='solid'?'#b0e3ff':'#79e4d1'}" style="animation-delay:-${i*.13}s"/>`;}).join('');}
function visual(t,value,result){
 let s='',success=result?.success;
 if(t.type.startsWith('g9-')){s=grade9?grade9.draw(t,value,result):text(35,130,'Read the comparison observations below.',20);}
 else if(t.type.startsWith('g8-')){s=grade8?grade8.draw(t,value,result):text(35,130,'Read the comparison observations below.',20);}
 else if(t.type.startsWith('g7-')){s=grade7?grade7.draw(t,value,result):text(35,130,'Read the comparison observations below.',20);}
 else if(t.type.startsWith('g6-')){s=grade6?grade6.draw(t,value,result):text(35,130,'Read the comparison observations below.',20);}
 else if(t.type.startsWith('g5-')){s=grade5?grade5.draw(t,value,result):text(35,130,'Read the comparison observations below.',20);}
 else if(t.type==='evaporation'){s=text(40,35,'Earlier: liquid water')+text(337,35,'After the observation',20)+vessel(35)+vessel(340)+dots('liquid',35);for(let i=0;i<18;i++){const vapour=i<(value==='open'?9:3);s+=`<circle class="floating" cx="${358+i%6*25}" cy="${vapour?65+Math.floor(i/6)*28:166+Math.floor(i/6)*19}" r="7" fill="#79e4d1"/>`;}if(value!=='open')s+=rect(335,52,180,9,'#a7cbd8');s+=text(35,260,'Water vapour is invisible; dots are a model.',19);}
 else if(['phase','shape','flow'].includes(t.type)){
  const state=t.type==='phase'?value==='cold'?'solid':value==='room'?'liquid':'gas':value==='wood'?'solid':value==='water'?'liquid':'gas';
  if(t.type==='phase'){const before=t.start==='ice'?'solid':t.start==='vapour'?'gas':'liquid';s=text(45,38,'Starting sample')+text(350,38,'After the test')+vessel(35)+vessel(340)+dots(before,35)+dots(state,340)+text(73,250,before)+text(380,250,state)+line(237,142,290,142,'#ffd389',5);}
  else{s=text(40,38,'First container')+text(340,38,'Receiving container')+vessel(35)+`<path d="M365 65V220H470V65" fill="#1e3e55" stroke="#a7cbd8" stroke-width="4"/>`;if(state==='solid')s+=rect(80,135,90,65,'#bd986d')+rect(373,135,90,65,'#bd986d');else if(state==='liquid')s+=rect(45,175,150,45,'#50add0',2)+rect(373,145,90,75,'#50add0',2);else{s+=dots('gas',35);for(let i=0;i<18;i++)s+=`<circle class="floating" cx="${383+i%3*31}" cy="${85+Math.floor(i/3)*24}" r="7" fill="#79e4d1"/>`;}s+=text(250,250,state);}
 }else if(t.type==='gas'){
  s=vessel(200)+dots('gas',200)+text(40,35,'Air-sample capsule');if(value==='sealed')s+=rect(192,56,186,12,'#79e4d1');else{s+=line(245,63,245,31,'#ffd389',4)+text(400,100,'Opening',18);if(value==='mesh')for(let i=0;i<6;i++)s+=rect(200+i*29,56,15,8,'#b0c6d6',2);}
  s+=text(160,250,value==='sealed'?'Closed without gaps':'Air can move through gaps',19);
 }else if(t.type==='waterproof'){
  s=text(35,35,'Same 100 mL water test')+rect(175,90,250,12,value==='plastic'?'#79e4d1':value==='paper'?'#e8d7ab':'#bd9cc9');for(let i=0;i<9;i++)s+=`<circle class="floating" cx="${200+i*25}" cy="${55+i%2*12}" r="5" fill="#85cfff"/>`;
  s+=`<path d="M215 115V220H385V115" fill="#1e3e55" stroke="#a7cbd8" stroke-width="4"/>`+rect(220,218-(result?.amount||0)*.7,160,(result?.amount||0)*.7,'#3d92c2',2)+text(40,250,result?.metric||'Select a specimen',20);
 }else if(['beam','pillar','brace'].includes(t.type)){
  s=text(35,35,'Same model test each time')+rect(60,215,480,12,'#9dbccc');
  if(t.type==='brace'){const shift=value==='diagonal'?0:40;s+=line(180,211,180+shift,75)+line(420,211,420+shift,75)+line(180+shift,75,420+shift,75);if(value==='diagonal')s+=line(180,211,420,75,'#79e4d1',8);if(value==='across')s+=line(200,145,440,145,'#ffd389');}
  else{const h=success?105:45;if(t.type==='pillar')s+=rect(220,215-h,160,h,value==='flat'?'#bfc9c9':'#ebd5ad',value==='circle'?32:4);else{s+=rect(120,150,25,65,'#6892a4')+rect(455,150,25,65,'#6892a4');s+=`<path d="M125 150Q300 ${success?150:235} 470 150" fill="none" stroke="#ebd5ad" stroke-width="${value==='flat'?5:12}"/>`;}
  for(let i=0;i<3;i++)s+=rect(252+i*33,(t.type==='pillar'?215-h:success?150:190)-32,28,28,'#ffd389',3);}
  s+=text(35,255,result?.metric||'Compare the structure',19);
 }else if(t.type==='flex'){
  s=text(35,35,'Same bend test')+line(110,210,110,90)+line(490,210,490,90);s+=`<path d="M110 105Q300 ${value==='rubber'?280:115} 490 105" stroke="${value==='rubber'?'#79e4d1':'#c9b093'}" stroke-width="15" fill="none"/>`+text(110,255,result?.metric||'Choose a strip',20);
 }else{
  s=text(35,35,t.type==='origin'?'Where does the material come from?':'Raw material → manufactured product',21);
  const raw=t.type==='origin'?value==='wood':value==='sand-glass';
  s+=rect(70,95,145,95,raw?'#ba9363':'#7dd5da')+text(88,151,t.type==='processing'?(value==='sand-glass'?'Sand':value==='glass-wood'?'Glass':'Wood'):(value==='wood'?'Wood':value==='glass'?'Glass':'Plastic'),22)+line(255,140,315,140,'#ffd389');
  s+=rect(365,95,145,95,'#b7dfdf')+text(390,151,t.type==='processing'?(value==='glass-wood'?'Wood':'Glass'):'Paper',22)+text(35,250,result?.metric||'Compare the material records',19);
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 280" aria-hidden="true">${s}</svg>`;
}
return {visual};
});
