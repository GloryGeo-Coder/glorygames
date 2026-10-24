(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PhysicsHeatVisuals=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function render(lesson,station,value,result,comparison){
    const color=lesson.color||'#9fe9d5';
    if(result.energy){
      return `<text x="18" y="19">Energy ledger • total: 100 model units</text>${[['Potential',result.energy.potential,'#a9bfff'],['Kinetic',result.energy.kinetic,'#6ceac1'],['Surroundings',result.energy.surroundings,'#ffc189']].map(([label,n,c],i)=>`<text x="18" y="${48+i*35}">${label}</text><rect x="125" y="${33+i*35}" width="290" height="20" rx="4" fill="#263f51"/><rect x="125" y="${33+i*35}" width="${n*2.9}" height="20" rx="4" fill="${c}"/><text x="430" y="${48+i*35}">${n}</text>`).join('')}`;
    }
    if(lesson.type==='conduction'){
      return `<text x="18" y="20">Heat transfers from the hotter source to the cooler sensor.</text><rect x="28" y="44" width="82" height="60" rx="9" fill="#9a4e3a"/><text x="45" y="79">80 °C</text><rect x="110" y="68" width="235" height="14" rx="4" fill="${value==='copper'?'#cd986c':value==='steel'?'#b6c6cd':'#9b805b'}"/><path class="heat-flow" d="M150 59h52m-9 -7 9 7 -9 7" fill="none" stroke="#ffc790" stroke-width="3"/><rect x="345" y="44" width="125" height="60" rx="9" fill="#345d78"/><text x="362" y="79">${result.output} °C</text><text x="18" y="135">Sensor started at 20 °C • equal bridges • two minutes</text>`;
    }
    if(lesson.type==='convection'){
      const loop=result.state==='circulating';
      return `<rect x="100" y="28" width="300" height="93" rx="8" fill="#264e6b" stroke="#a7cede" stroke-width="2"/><rect x="105" y="32" width="290" height="${loop?85:23}" rx="4" fill="#f2a37355"/><rect x="190" y="${value==='bottom'?123:13}" width="120" height="9" rx="4" fill="#ffac78"/>${loop?'<path class="heat-flow" d="M160 104V47H245m-9 -7 9 7 -9 7" fill="none" stroke="#ffc08c" stroke-width="5"/><path class="cool-flow" d="M340 46v56h-85m9 -7 -9 7 9 7" fill="none" stroke="#8edaff" stroke-width="5"/>':'<text x="172" y="51">Warm upper layer</text><text x="182" y="96">Cooler below</text>'}<text x="18" y="141">${loop?'Warm water rises • cooler water sinks':'Top heating • weak whole-tank circulation'}</text>`;
    }
    if(result.series){
      const points=series=>series.map(p=>`${42+p.time*42},${117-p.temperature*.85}`).join(' ');
      return `<text x="18" y="17">Temperature over model time</text><path d="M42 27V117H470" fill="none" stroke="#91acbb" stroke-width="2"/>${[0,50,100].map(n=>`<text x="8" y="${121-n*.85}">${n}</text>`).join('')}<text x="38" y="137">0</text><text x="415" y="137">10 min</text><text x="48" y="36">°C</text>${comparison?`<polyline points="${points(comparison.series)}" fill="none" stroke="#ffd18a" stroke-width="3" stroke-dasharray="6 4"/>`:''}<polyline points="${points(result.series)}" fill="none" stroke="${color}" stroke-width="3"/>${result.series.map(p=>`<circle cx="${42+p.time*42}" cy="${117-p.temperature*.85}" r="3" fill="${color}"/>`).join('')}`;
    }
    return null;
  }
  return {render};
});
