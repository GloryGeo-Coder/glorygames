/* Fruit Slice: 25 authored trials; Endless retains the original arcade rules. */
(function(root){
 'use strict';
 const names=['First Slice','Orange Orbit','Melon Morning','Triple Cut','Golden Crown','Market Warm-up','Melon Market','Juice Rush','Market Combos','Golden Basket','Garden Glide','Kiwi Crossing','Frenzy Bloom','Garden Rhythm','Golden Harvest','Lantern Launch','Pineapple Lanterns','Festival Frenzy','Five-fruit Flow','Midnight Gold','Masters Gate','Apple Precision','Sunburst Frenzy','Perfect Rhythm','Sunset Champion'];
 const chapters=['Sunset Dojo','Fruit Market','Tropical Garden','Lantern Festival','Master Trials'];
 const keys=['apple','orange','watermelon','kiwi','pineapple'];
 const levels=names.map((title,i)=>{
  const id=i+1,chapter=Math.floor(i/5),kind=id%5===2?'focus':id%5===4?'combo':id%5===0?'gold':id>5&&id%5===3?'frenzy':'harvest';
  return {id,title,chapter:chapters[chapter],duration:50+chapter*5,lives:5-Math.floor(i/10),scoreTarget:240+id*30,cutTarget:12+Math.floor(id*1.1),kind,
   focus:keys[(chapter+1)%5],focusTarget:6+chapter,comboTarget:3+Math.floor(chapter/2),goldTarget:2+Math.floor(chapter/2),frenzyTarget:1,
   interval:kind==='combo'?.70:1.18-chapter*.075,bombChance:id<3?0:.08+i*.008,fruitPool:keys.slice(0,Math.min(5,id)),
   tint:['#ffb35b','#ffa757','#65d6ad','#f497cc','#ffd866'][chapter],pattern:['fan','duet','cascade','crossing','flow'][chapter]};
 });
 function extraGoal(lv,stats){
  if(lv.kind==='focus')return {label:lv.focus+' slices',value:stats.byFruit[lv.focus]||0,target:lv.focusTarget};
  if(lv.kind==='combo')return {label:'Best combo',value:stats.bestCombo,target:lv.comboTarget};
  if(lv.kind==='gold')return {label:'Golden fruit',value:stats.golden,target:lv.goldTarget};
  if(lv.kind==='frenzy')return {label:'Frenzy activations',value:stats.frenzies,target:lv.frenzyTarget};
  return null;
 }
 function goals(lv,stats,score){return [{label:'Score',value:score,target:lv.scoreTarget},{label:'Fruit sliced',value:stats.sliced,target:lv.cutTarget},extraGoal(lv,stats)].filter(Boolean);}
 function complete(lv,stats,score){return goals(lv,stats,score).every(g=>g.value>=g.target);}
 const api={levels,chapters,keys,goals,complete};if(typeof module==='object'&&module.exports)module.exports=api;else root.FruitCampaign=api;
})(typeof window!=='undefined'?window:globalThis);
