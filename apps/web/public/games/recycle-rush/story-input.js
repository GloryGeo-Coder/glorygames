/* Reliable touch taps, captured-drag recovery and compatibility-click isolation. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RecycleInput=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function create(document,now,dragging){
    let compatibilityClickPending=false;
    document.addEventListener('pointerdown',()=>{compatibilityClickPending=false;},true);
    document.addEventListener('click',event=>{if(compatibilityClickPending&&event.detail>0){compatibilityClickPending=false;event.preventDefault();event.stopImmediatePropagation();}},true);
    function bind(element, handler) {
    let pointer = null, touchedAt = -1000;
    element.addEventListener('pointerdown', event => { if (event.pointerType === 'touch' && event.button === 0 && !pointer) pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }; });
    element.addEventListener('pointerup', event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const start = pointer; pointer = null;
      if (element.disabled || dragging() || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10 || !element.contains(document.elementFromPoint(event.clientX, event.clientY))) return;
      event.preventDefault(); compatibilityClickPending = true; touchedAt = now(); handler(event);
    });
    element.addEventListener('pointercancel', event => { if (pointer?.id === event.pointerId) pointer = null; });
    element.addEventListener('lostpointercapture', event => { if (pointer?.id === event.pointerId) pointer = null; });
    element.addEventListener('click', event => { if (event.detail === 0 || now() - touchedAt > 650) handler(event); });
  }
    bind.suppressNextClick = () => { compatibilityClickPending = true; };
    return bind;
  }
  return {create};
});
