(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StackSkyline=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const worlds=[{name:'Harbour Heights',image:'skyline-city.webp',notes:[147,196,247,294,247,196,220,294]},{name:'Cloud Gardens',image:'skyline-clouds.webp',notes:[175,220,262,330,294,262,220,196]},{name:'Aurora Summit',image:'skyline-aurora.webp',notes:[165,247,294,370,330,294,247,220]}];
  const stageForHeight=height=>Math.floor(Math.max(0,height)/10);
  const worldForStage=stage=>worlds[Math.min(worlds.length-1,Math.max(0,stage))];
  function create(){return {stage:0,perfects:0,rewarded:false,repairs:0};}
  function placement(p,perfect,height){
    const events={contract:false,stage:false,repair:false};
    if(perfect){p.perfects++;if(p.perfects%4===0&&p.repairs<2){p.repairs++;events.repair=true;}}
    if(!p.rewarded&&p.perfects>=3){p.rewarded=true;events.contract=true;}
    const next=stageForHeight(height);
    if(next>p.stage){p.stage=next;p.perfects=0;p.rewarded=false;events.stage=true;}
    return events;
  }
  function repair(p,top,current,maxWidth){if(p.repairs<1||!top||!current)return false;const width=Math.min(maxWidth,top.w+Math.max(22,maxWidth*.14));if(width<=top.w)return false;p.repairs--;top.w=width;current.w=width;return true;}
  return {worlds,stageForHeight,worldForStage,create,placement,repair};
});
