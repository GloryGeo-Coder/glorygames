'use strict';
// Cell indices are zero based, reading left-to-right in the 4 × 3 generated pose sheets.
// Clip lengths, timing, body bounds and feet anchors retain the v4.6 gameplay contract.
const sequences={
  player:{idle:[0],run:[1,2,3,4],rise:[5,5,6],fall:[6,6,7],land:[7,7,0],interact:[8,8,9,8],cast:[0,9,9,9,8,0],hurt:[10,10,0],celebrate:[11]},
  professor:{idle:[0,1],talk:[2,3,2,8],gesture:[4,5,6,4],celebrate:[9,10,9,11]},
  helper:{hover:[0,1,2,3],scan:[4,5,6,7],cheer:[8,9],recoil:[10,10,11]},
  glitch:{idle:[0],walk:[1,2,3,4],attack:[5,6,6,7,7,0],hurt:[8,8,9],defeat:[8,10,10,11,11,11]},
  drone:{hover:[0,1,2,3],attack:[4,5,5,6,7,0],hurt:[8,8,9],defeat:[8,10,10,11,11,11]},
  magnetBot:{idle:[0],walk:[1,2,3,4],attack:[5,6,6,7,7,0],hurt:[8,8,9],defeat:[8,10,10,11,11,11]},
  boss:{idle:[0],walk:[1,2,3,4],charge:[5,6,6,5],fire:[7,7,8,8,7,0],hurt:[9,9,0],defeat:[9,10,10,11,11,11]},
  maintenance:{hover:[0,1,2,3],scan:[4,5,6,7],bump:[8,8,9]}
};
function pose(kind,clip,i,length,loop){
  const seq=sequences[kind][clip],position=loop?Math.floor(i*seq.length/length)%seq.length:Math.round(i*(seq.length-1)/Math.max(1,length-1));
  const phase=i/Math.max(1,loop?length:length-1),wave=Math.sin(phase*Math.PI*2);
  // Small secondary movement supplements the drawn limb/action poses. Feet stay anchored.
  const fly=['helper','drone','maintenance'].includes(kind);
  return {cell:seq[position],dx:clip==='hurt'||clip==='bump'||clip==='recoil'?Math.round(-3*(1-phase)):0,
    dy:loop?Math.round(wave*(fly?2:1)):clip==='land'?Math.round(2*(1-phase)):0};
}
module.exports={sequences,pose};
