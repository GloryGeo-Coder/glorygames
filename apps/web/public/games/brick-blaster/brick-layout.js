/* Arena geometry shared by initial generation and resize; never regenerates bricks. */
(function(root){
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const physicsScale=h=>clamp(h/620,.32,1);
  function grid(w,h,rows,cols){
    const margin=clamp(w*.035,10,28),gapX=clamp(w*.014,4,10),gapY=clamp(h*.009,2,7),top=clamp(h*.045,8,32);
    const brickW=(w-2*margin-gapX*(cols-1))/cols;
    const brickH=Math.max(2,Math.min(clamp(h*.033,7,25),(h*.43-top-gapY*(rows-1))/rows));
    return {margin,gapX,gapY,top,brickW,brickH,bottom:top+rows*brickH+(rows-1)*gapY};
  }
  function cell(g,row,col){return {x:g.margin+col*(g.brickW+g.gapX),y:g.top+row*(g.brickH+g.gapY),w:g.brickW,h:g.brickH};}
  const api={grid,cell,physicsScale,clamp};if(typeof module==='object'&&module.exports)module.exports=api;else root.BrickLayout=api;
})(typeof window!=='undefined'?window:globalThis);
