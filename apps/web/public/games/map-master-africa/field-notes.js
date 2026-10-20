/* Evidence stays readable as text and tables; illustrations carry no exclusive answers. */
(function(root){
 'use strict';
 const F=typeof module==='object'&&module.exports?require('./field-lab.js'):root.AtlasFieldLab;
 const drawings={
  settlement:'<path d="M9 47V29L25 16L41 29V47ZM54 47V12H83V47" fill="#b5c8a3" stroke="#456c5b" stroke-width="2"/><path d="M18 47V34H30V47M61 20H68M73 20H79M61 29H68M73 29H79" fill="none" stroke="#456c5b" stroke-width="3"/><path d="M0 49H95" stroke="#9aa994" stroke-width="3"/>',
  food:'<path d="M15 49V18M15 34Q-1 23 6 20Q15 20 15 28M15 28Q31 14 28 26Q24 32 15 35" fill="#8fb78b" stroke="#447858" stroke-width="2"/><path d="M37 31H54M49 25L56 31L49 37" fill="none" stroke="#bb9450" stroke-width="3"/><path d="M66 18H87L91 49H62Z" fill="#e3c78e" stroke="#8a7147" stroke-width="2"/>',
  water:'<path d="M17 6Q-5 33 8 41Q25 52 30 35Q34 27 17 6Z" fill="#83bfcc"/><path d="M42 22H61M55 16L62 22L55 28" fill="none" stroke="#aa914f" stroke-width="3"/><path d="M69 15H89V46H69Z" fill="#c3d6bb" stroke="#527c63" stroke-width="2"/><path d="M73 33H85M73 38H85" stroke="#5596ac" stroke-width="3"/>',
  landform:'<path d="M0 49L25 47L40 24H58L70 6L89 46H95V55H0Z" fill="#bdceab" stroke="#66815c" stroke-width="2"/><path d="M61 42L70 38L89 48" fill="none" stroke="#599bb0" stroke-width="3"/>',
  weather:'<circle cx="23" cy="19" r="12" fill="#e7bd66"/><path d="M35 34C19 34 21 16 34 17C38 3 59 6 63 18C80 14 84 35 68 35Z" fill="#c2d9db" stroke="#6a999f" stroke-width="2"/><path d="M39 41L35 49M52 41L48 49M65 41L61 49" stroke="#548eab" stroke-width="3"/>',
  mining:'<path d="M6 48L16 25L37 31L47 49M59 49V16H86V49" fill="#c1c5b4" stroke="#747c65" stroke-width="2"/><path d="M54 16L72 5L92 16M66 27H79M66 36H79" stroke="#836b49" stroke-width="3" fill="none"/><path d="M0 53H95" stroke="#7da478" stroke-width="4"/>'
 };
 function render(doc,card,evidence,{open=true}={}){
  card.hidden=!evidence;if(!evidence){card.replaceChildren();return;}
  card.open=open;card.replaceChildren();const add=(tag,text,parent=card)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;parent.appendChild(n);return n;};
  add('summary',evidence.title);const body=add('div');body.className='evidence-body';
  if(drawings[evidence.visual]){const art=add('div',undefined,body);art.className='evidence-art';art.setAttribute('aria-hidden','true');art.innerHTML='<svg viewBox="0 0 96 58">'+drawings[evidence.visual]+'</svg>';}
  if(evidence.chart){const caption=add('p',evidence.chart.title,body);caption.className='chart-caption';const graphic=doc.createElementNS('http://www.w3.org/2000/svg','svg');graphic.setAttribute('class','evidence-chart');body.appendChild(graphic);F.chart(graphic,evidence.chart);}
  add('p',evidence.text,body);
  if(evidence.source){const p=add('p',undefined,body),link=add('a',evidence.source.label,p);link.setAttribute('href',evidence.source.url);link.setAttribute('target','_blank');link.setAttribute('rel','noopener noreferrer');}
  const wrap=add('div',undefined,body);wrap.className='evidence-table-wrap';const table=add('table',undefined,wrap);table.className='evidence-table';const caption=add('caption',evidence.title,table);caption.className='sr-only';const head=add('thead',undefined,table),tr=add('tr',undefined,head);
  for(const title of evidence.columns){const th=add('th',title,tr);th.setAttribute('scope','col');}
  const rows=add('tbody',undefined,table);for(const row of evidence.rows){const tr=add('tr',undefined,rows);row.forEach((value,i)=>{const n=add(i===0?'th':'td',value,tr);if(i===0)n.setAttribute('scope','row');});}
 }
 const api={render,drawings};if(typeof module==='object'&&module.exports)module.exports=api;else root.AtlasFieldNotes=api;
})(typeof window!=='undefined'?window:globalThis);
