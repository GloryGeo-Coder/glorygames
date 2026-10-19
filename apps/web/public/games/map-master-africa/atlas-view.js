(function(root){
 'use strict';
 const symbols={
  tree:'<path d="M12 15v7" stroke="#674526" stroke-width="3"/><circle cx="12" cy="9" r="8" fill="#39835f"/><circle cx="9" cy="7" r="4" fill="#70b486"/>',
  cross:'<rect x="2" y="2" width="20" height="20" rx="5" fill="#fff4e7"/><path d="M12 6v12M6 12h12" stroke="#c55150" stroke-width="4"/>',
  water:'<path d="M2 8q3-5 7 0t7 0t7 0M2 15q3-5 7 0t7 0t7 0" fill="none" stroke="#277eaf" stroke-width="3"/>',
  school:'<path d="M2 5q5-2 10 1q5-3 10-1v15q-5-2-10 1q-5-3-10-1Z" fill="#fff7e7" stroke="#556c91" stroke-width="2"/><path d="M12 6v15" stroke="#556c91" stroke-width="2"/>',
  market:'<path d="M3 10h18v11H3z" fill="#edcc91"/><path d="M2 5h20l1 6H1z" fill="#c3654a"/><path d="M7 5v6M13 5v6M19 5v6" stroke="#fff2d2" stroke-width="3"/><path d="M9 15h6v6" fill="#855e3e"/>',
  train:'<rect x="5" y="2" width="14" height="17" rx="4" fill="#52758a"/><path d="M8 6h8v6H8z" fill="#d9f1f4"/><path d="M8 19l-2 4M16 19l2 4" stroke="#3b505d" stroke-width="2"/><circle cx="9" cy="16" r="1.4" fill="#f8d16d"/><circle cx="15" cy="16" r="1.4" fill="#f8d16d"/>'
 };
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=kind=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+symbols[kind]+'</svg>';
 const palette={'Africa':'#e3c48f','Europe':'#b7bce2','Asia':'#b6c9a7','North America':'#d7b79d','South America':'#87bdab','Oceania':'#dbc185','Antarctica':'#e5eff0','Seven seas (open ocean)':'#c7dada'};
 const provincePalette={'ZA-EC':'#dec18c','ZA-FS':'#b8cdb1','ZA-GT':'#e3b39a','ZA-NL':'#a8cece','ZA-LP':'#c3c0de','ZA-MP':'#c3d7a3','ZA-NC':'#e2cda6','ZA-NW':'#abc8bb','ZA-WC':'#c3c9e1'};
 const provinceCodes={'ZA-EC':'EC','ZA-FS':'FS','ZA-GT':'GP','ZA-NL':'KZN','ZA-LP':'LP','ZA-MP':'MP','ZA-NC':'NC','ZA-NW':'NW','ZA-WC':'WC'};
 function create(svg,geometry,data,content,provinceData){const G=geometry,doc=svg.ownerDocument;let mode='',view={...G.world},selected=null;const townExtent={x:-.45,y:-.55,w:5.9,h:6.15},saExtent={x:15,y:20,w:27,h:29},mainland={x:15.5,y:21,w:19,h:15.5},landscapeExtent={x:0,y:0,w:100,h:60};
  const extent=()=>mode==='world'?G.world:mode==='provinces'?saExtent:mode==='landscape'?landscapeExtent:townExtent,initial=()=>mode==='provinces'?mainland:extent();
  const add=(tag,attrs,parent=svg)=>{const n=doc.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));parent.appendChild(n);return n;};
  const text=(value,x,y,attrs={},parent=svg)=>{const n=add('text',{x,y,...attrs},parent);n.textContent=value;return n;};
  function setView(next){view={...next};svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);const r=svg.getBoundingClientRect(),scale=G.fit(r.width,r.height,view).scale||1;svg.style.setProperty('--grid-font',12/scale+'px');svg.style.setProperty('--place-font',10.5/scale+'px');}
  function world(){svg.replaceChildren();add('rect',{x:-180,y:-90,width:360,height:180,fill:'#c1e2e4','pointer-events':'none'});
   for(let x=-180;x<=180;x+=30)add('path',{d:`M${x},-90V90`,class:'graticule'});
   for(let y=-60;y<=60;y+=30)add('path',{d:`M-180,${y}H180`,class:y===0?'equator':'graticule'});
   const group=add('g',{'aria-label':'Countries and territories'});
   for(const c of data.countries)add('path',{d:G.path(c),fill:palette[c.region]||'#c1cbb5',class:'country','fill-rule':'evenodd','data-country':c.id,'aria-label':c.name,role:'button',tabindex:'-1','vector-effect':'non-scaling-stroke'},group);
   text('EQUATOR · 0°',-177,-1.5,{class:'map-label'});text('PACIFIC OCEAN',-140,8,{class:'ocean-label'});text('ATLANTIC',-42,3,{class:'ocean-label'});text('INDIAN OCEAN',67,20,{class:'ocean-label'});
   add('g',{id:'atlasMarkers','pointer-events':'none'});setView(G.world);
  }
  function town(){svg.replaceChildren();add('rect',{x:-.45,y:-.55,width:5.9,height:5.9,fill:'#e8ecda'});
   for(let col=0;col<5;col++){text(String.fromCharCode(65+col),col+.5,-.13,{class:'grid-label'});text(col+1,-.22,col+.58,{class:'grid-label'});}
   for(let row=0;row<5;row++)for(let col=0;col<5;col++){
    const ref=String.fromCharCode(65+col)+(row+1),group=add('g',{'data-cell':ref,role:'button',tabindex:0,'aria-label':'Grid square '+ref,class:'town-cell'});
    add('rect',{x:col+.025,y:row+.025,width:.95,height:.95,rx:.09,class:'cell-tile'},group);
    const place=content.places.find(p=>p.cell===ref);
    if(place){const symbol=add('g',{transform:`translate(${col+.25} ${row+.16}) scale(.0208)`,'pointer-events':'none'},group);symbol.innerHTML=symbols[place.symbol];text(place.name,col+.5,row+.83,{class:'place-label','pointer-events':'none'},group);}
    else{add('rect',{x:col+.2,y:row+.25,width:.24,height:.22,rx:.03,fill:'#b8c7b2','pointer-events':'none'},group);add('rect',{x:col+.55,y:row+.52,width:.22,height:.2,rx:.03,fill:'#c4ccb4','pointer-events':'none'},group);}
   }
   add('g',{id:'atlasMarkers','pointer-events':'none'});setView(townExtent);
  }
  function provinces(){svg.replaceChildren();add('rect',{x:15,y:20,width:27,height:29,fill:'#c1e2e4','pointer-events':'none'});
   for(const c of data.countries.filter(c=>['NAM','BWA','ZWE','MOZ','LSO','SWZ'].includes(c.id)))add('path',{d:G.path(c),fill:'#e7e7d6',stroke:'#9cafa2','stroke-width':.04,'fill-rule':'evenodd','pointer-events':'none'});
   for(const p of provinceData.provinces)add('path',{d:G.path(p),fill:provincePalette[p.id],class:'country province','fill-rule':'evenodd','data-province':p.id,'aria-label':p.name,role:'button',tabindex:'-1','vector-effect':'non-scaling-stroke'});
   for(const p of provinceData.provinces){const at=G.project(p.label);text(provinceCodes[p.id],at.x,at.y,{class:'province-label','pointer-events':'none','text-anchor':'middle'});}
   text('ATLANTIC',16.3,34.7,{class:'province-ocean'});text('INDIAN OCEAN',29.2,35,{class:'province-ocean'});
   text('LESOTHO',28.2,29.6,{class:'neighbour-label'});text('BOTSWANA',24,23.3,{class:'neighbour-label'});text('NAMIBIA',17.5,25,{class:'neighbour-label'});
   add('g',{id:'atlasMarkers','pointer-events':'none'});setView(mainland);
  }
  function landscape(){svg.replaceChildren();svg.innerHTML='<rect width="100" height="60" fill="#e5f1eb"/><path d="M0 45H100V60H0Z" fill="#bedfe1"/><path d="M18 45L34 42L44 23H62L72 7L84 31L92 45V60H18Z" fill="#b4c99c" stroke="#758c65" stroke-width=".7"/><path d="M64 37Q72 30 82 43L88 45" fill="none" stroke="#4c9db9" stroke-width="2"/><g fill="#234c42" font-family="system-ui" font-size="4" font-weight="700"><text x="22" y="40">A</text><text x="49" y="20">B</text><text x="71" y="5">C</text><text x="82" y="40">D</text></g><text x="4" y="53" fill="#407d8e" font-family="system-ui" font-size="3">SEA</text><text x="5" y="58" fill="#587075" font-family="system-ui" font-size="2.3">SCHEMATIC · NOT TO SCALE</text><g id="atlasMarkers"/>';setView(landscapeExtent);
  }
  function context(next){if(mode===next)return;mode=next;selected=null;svg.parentElement?.classList.toggle('town-mode',next==='town');next==='world'?world():next==='provinces'?provinces():next==='landscape'?landscape():town();}
  function mark(id,{route=[],from,to,hint=false,hideNames=false}={}){
   if(mode==='town'){
    for(const n of svg.querySelectorAll('[data-cell]')){const ref=n.getAttribute('data-cell');n.classList.toggle('selected',ref===id);n.classList.toggle('hinted',hint&&ref===id);n.classList.toggle('visited',route.includes(ref));n.classList.toggle('origin',ref===from||ref===to);}
    for(const n of svg.querySelectorAll('.place-label'))n.style.visibility=hideNames?'hidden':'visible';
    const layer=svg.querySelector('#atlasMarkers');layer.replaceChildren();if(route.length>1)add('polyline',{points:route.map(ref=>{const p=G.cell(ref);return p.x+','+p.y;}).join(' '),class:'route-line'},layer);
   }else{
    selected=(mode==='provinces'?provinceData.provinces:mode==='world'?data.countries:[]).find(c=>c.id===id)||null;
    for(const n of svg.querySelectorAll('[data-country],[data-province]'))n.classList.toggle('selected',(n.getAttribute('data-country')||n.getAttribute('data-province'))===id);
    const layer=svg.querySelector('#atlasMarkers');layer.replaceChildren();if(selected){const p=G.project(selected.label);add('circle',{cx:p.x,cy:p.y,r:Math.max(.25,view.w*.008),class:'country-marker'},layer);}
   }
  }
  function locate(event){const rect=svg.getBoundingClientRect(),p=G.unscreen({x:event.clientX-rect.left,y:event.clientY-rect.top},rect.width,rect.height,view);return {point:p,cell:mode==='town'?G.cellAt(p):null,country:mode==='world'?G.countryAt(data.countries,p):null,province:mode==='provinces'?G.countryAt(provinceData.provinces,p):null};}
  function zoom(factor,point){setView(G.zoom(view,factor,point,extent()));}
  function pan(dx,dy){setView(G.pan(view,dx,dy,extent()));}
  return {context,mark,locate,zoom,pan,setView,reset(){setView(initial());},region(name){if(mode==='provinces'){setView(name==='Prince Edward Islands'?{x:36.5,y:45.5,w:2.8,h:2.8}:mainland);}else if(G.regions[name])setView(G.regions[name]);},focus(id){const c=(mode==='provinces'?provinceData.provinces:data.countries).find(c=>c.id===id);if(c){if(mode==='provinces'){const pts=c.polygons.flat(2).filter(p=>p[1]>-40),xs=pts.map(p=>p[0]),ys=pts.map(p=>-p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y,pad=.6;setView(G.constrain({x:x-pad,y:y-pad,w:Math.max(2.5,w+pad*2),h:Math.max(2.5,h+pad*2)},saExtent));}else setView(G.focus(c));mark(id);}},get mode(){return mode;},get view(){return {...view};},get extent(){return extent();}};
 }
 const api={create,icon,symbols,palette,provincePalette,provinceCodes,esc};if(typeof module==='object'&&module.exports)module.exports=api;else root.AtlasView=api;
})(typeof window!=='undefined'?window:globalThis);
