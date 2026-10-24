(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.PhysicsDisplayControls=api;const mount=()=>api.mount(root);if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();}})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const unavailable='This browser does not support game fullscreen. The game already fills this tab; landscape may give you a wider view.';
  function bind({document:doc,window:win}){
    const root=doc.documentElement,buttons=[...doc.querySelectorAll('[data-physics-fullscreen]')],statuses=[...doc.querySelectorAll('[data-physics-display-status]')];
    const request=typeof root.requestFullscreen==='function'&&doc.fullscreenEnabled!==false?root.requestFullscreen:typeof root.webkitRequestFullscreen==='function'&&doc.webkitFullscreenEnabled!==false?root.webkitRequestFullscreen:null;
    const supported=typeof request==='function';
    let busy=false,disposed=false;
    const active=()=>!!(doc.fullscreenElement||doc.webkitFullscreenElement);
    function message(text){const target=doc.querySelector('dialog[open] [data-physics-display-status]')||statuses[0];statuses.forEach(s=>s.textContent=s===target?text:'');}
    function sync(){const label=active()?'Exit Fullscreen':'Enter Fullscreen';for(const b of buttons){b.hidden=!supported;b.disabled=busy;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(active()));b.title=label+' (Alt+Enter)';b.querySelector('.screen-label').textContent=label;}if(supported)message('');}
    async function toggle(){
      if(disposed||busy||!supported)return;busy=true;sync();
      try{if(active()){const exit=doc.exitFullscreen||doc.webkitExitFullscreen;if(typeof exit!=='function')throw Error('No fullscreen exit');await exit.call(doc);}else await request.call(root);if(!disposed)sync();}
      catch{if(!disposed)message('Fullscreen could not open. Your progress is safe and the game still fills this tab. Try the fullscreen control again or use landscape.');}
      finally{busy=false;if(!disposed)buttons.forEach(b=>b.disabled=false);}
    }
    const click=e=>{e.preventDefault();e.stopPropagation();void toggle();},stop=e=>e.stopPropagation();
    const key=e=>{if(supported&&e.altKey&&e.key==='Enter'&&!e.repeat&&!['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)&&!e.target?.isContentEditable){e.preventDefault();e.stopPropagation();void toggle();}};
    for(const b of buttons){b.addEventListener('click',click);b.addEventListener('pointerdown',stop);}
    doc.addEventListener('fullscreenchange',sync);doc.addEventListener('webkitfullscreenchange',sync);win.addEventListener('keydown',key,true);sync();if(!supported)statuses.forEach((s,i)=>s.textContent=i===statuses.length-1?unavailable:'');
    return {toggle,dispose(){disposed=true;for(const b of buttons){b.removeEventListener('click',click);b.removeEventListener('pointerdown',stop);}doc.removeEventListener('fullscreenchange',sync);doc.removeEventListener('webkitfullscreenchange',sync);win.removeEventListener('keydown',key,true);}};
  }
  function mount(win){if(win.__physicsDisplay)return win.__physicsDisplay;win.__wgaGameTab?.fullscreen?.dispose();const controller=bind({document:win.document,window:win});win.__physicsDisplay=controller;if(win.__wgaGameTab)win.__wgaGameTab.fullscreen=controller;return controller;}
  return {bind,mount};
});
