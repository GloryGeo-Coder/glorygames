/* Original vector artwork and rigs. Coordinates use a 128 × 160 frame; feet anchor at (64,148). */
'use strict';
const TAU=Math.PI*2;
const rect=(x,y,w,h,fill,rx=4,stroke='#16334b',sw=1.3)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const ellipse=(x,y,rx,ry,fill,stroke='none',sw=1)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const path=(d,fill,stroke='#16334b',sw=1.3)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const group=(transform,body)=>`<g transform="${transform}">${body}</g>`;
const gradient=(id,a,b)=>`<linearGradient id="${id}" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const glow=(x,y,r,c)=>ellipse(x,y,r,r,c,'none').replace('<ellipse','<ellipse opacity=".16"');
function star(x,y,r,c){return path(Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,rr=i%2?r*.3:r;return `${i?'L':'M'}${x+Math.cos(a)*rr} ${y+Math.sin(a)*rr}`;}).join(' ')+'Z',c,'none');}
function human(kind,clip,t){
  const prof=kind==='professor',walk=clip==='run',wave=Math.sin(t*TAU),swing=walk?wave*29:0,air=clip==='rise'||clip==='fall',land=clip==='land',hurt=clip==='hurt';
  const coat=prof?'url(#ivory)':'url(#jacket)',skin='url(#skin)',top=prof?51:57;
  const bend=air?(clip==='rise'?10+t*18:24-t*12):land?(1-t)*27:0,hip=land?(1-t)*6:0;
  let rearArm=walk?-swing*.8:4,frontArm=walk?swing*.8:-4;
  if(air){rearArm=clip==='rise'?-30-t*20:20+t*20;frontArm=clip==='rise'?-50-t*20:-45+t*15;}
  if(clip==='interact'||clip==='gesture'){frontArm=-72+wave*5;rearArm=8;}
  if(clip==='cast'){frontArm=-88+(t<.45?-t*12:-(1-t)*9);rearArm=22;}
  if(clip==='celebrate'){rearArm=-143-wave*8;frontArm=-143-wave*8;}
  if(hurt){rearArm=-30;frontArm=-46;}
  const arm=(side,angle,front)=>group(`translate(${64+side*20} ${top+10+hip}) rotate(${angle*side})`,
    ellipse(0,1,8,8,'#254e64')+path('M-7 1Q-12 17 -7 27L-5 35Q0 39 6 33L8 15Q9 3 5 0Z',coat)+rect(-6,26,12,10,prof?'#9cb8c5':'#f3a14f',3)+ellipse(0,38,6.5,7,skin,'#5f4238')+(front&&!prof?rect(-8,23,16,10,'url(#teal)',3)+rect(-4,25,8,3,'#b9ffec',1,'none'):''));
  const leg=(side,angle)=>group(`translate(${64+side*11} ${101+hip}) rotate(${angle})`,
    path(`M-8 0H8L${7+side*bend*.18} 19L8 36Q0 41 -8 36L-9 17Z`,'url(#pants)')+rect(-7,16,14,9,'#426c81',3)+path('M-8 30H9L14 39Q9 45 -13 42L-14 36Z','url(#boot)')+path('M-12 40H11','none',prof?'#becad0':'#f5ab5c',2.4));
  let b=ellipse(64,149,27,4,'#082335').replace('<ellipse','<ellipse opacity=".25"');
  const tilt=hurt?-9*(1-t):walk?5:0,bob=air?-2:walk?Math.abs(Math.cos(t*TAU))*2:Math.sin(t*TAU)*1.2;
  let body=rect(35,top+4,18,43,'url(#backpack)',6)+rect(34,top+13,10,22,'#f0a04d',3)+ellipse(39,top+9,4,4,'#a5fff0');
  body+=arm(-1,rearArm,false)+leg(-1,air?-16-bend*.6:swing)+leg(1,air?15+bend*.6:-swing);
  if(prof){
    body+=path(`M45 ${top}Q64 44 83 ${top}L88 104L71 112L64 96L57 112L39 105Z`,coat)+path('M60 53L64 78L69 53','url(#teal)')+path('M48 55L59 65L53 71M80 55L69 66L75 72','none','#85a3b2',1.4)+rect(70,80,12,14,'#d5e3e7',2)+path('M72 80V73M77 80V72','none','#e49a4a',2);
  }else{
    body+=path('M44 56Q63 49 84 56L88 91Q74 103 40 94Z',coat)+path('M58 57L64 66L70 56L76 98H54Z','url(#teal)')+path('M44 56L49 72L57 69L52 57Z','#cfe7e8')+rect(72,73,12,12,'#2b7180',2)+path('M75 77H81M78 75V81','none','#c1ffe9',1.8)+path('M43 94L84 95L82 102L43 102Z','#725139')+rect(61,94,9,9,'#b8d5d7',2)+rect(41,86,10,16,'#f1ad57',3);
  }
  body+=rect(58,44,12,14,skin,3,'#7c5142')+ellipse(65,32,20,24,skin,'#6a493d',1.2)+path('M49 37Q54 52 68 52Q78 51 82 40','none','#9b654d',1.4);
  if(prof){
    body+=ellipse(44,19,11,12,'url(#hairSilver)','#637b8c')+path('M44 31Q39 11 53 8Q75 1 84 18L84 31L77 26L74 13Q62 27 47 25Z','url(#hairSilver)','#637b8c')+path('M48 13Q60 3 73 10M47 20Q59 18 68 12','none','#e9f0ec',2.5);
  }else{
    body+=path('M44 31Q38 13 49 9Q58 1 65 7Q73 2 80 10Q90 14 84 31L79 28L76 19Q62 26 48 23L48 32Z','url(#hairDark)','#142c3b')+path('M49 17Q62 11 79 17','none','#edab5c',5)+rect(52,11,14,9,'#25475b',3)+rect(55,13,8,4,'#a2efe7',2,'none')+path('M46 13Q52 8 58 11','none','#516369',1.8);
  }
  const blink=(clip==='idle'||clip==='talk')&&t>.8;
  body+=ellipse(82,34,4,6,skin)+path('M64 32L65 39L69 40','none','#80513e',1.2);
  if(blink)body+=path('M52 34H58M72 34H78','none','#193744',1.8);
  else body+=ellipse(55,34,3,3.6,'#f6f2df')+ellipse(75,34,3,3.6,'#f6f2df')+ellipse(56,34,1.7,2.5,'#1a3345')+ellipse(76,34,1.7,2.5,'#1a3345');
  body+=path('M50 28Q54 26 59 28M71 28Q76 26 79 29','none',prof?'#6e7d80':'#233d46',1.7);
  if(prof)body+=`<circle cx="55" cy="34" r="7" fill="none" stroke="#c7b47d" stroke-width="1.8"/><circle cx="75" cy="34" r="7" fill="none" stroke="#c7b47d" stroke-width="1.8"/>`+path('M62 33H68','none','#c7b47d',1.5);
  body+=clip==='talk'?ellipse(65,45,3,2+Math.abs(wave), '#67483d'):path(hurt?'M60 45Q65 42 70 45':'M60 44Q65 48 71 43','none','#68473d',1.3);
  body+=arm(1,frontArm,true);
  if(prof)body+=group('translate(81 87) rotate(-12)',rect(-11,-14,24,32,'#283f52',3)+rect(-8,-11,18,25,'#d89d46',2)+path('M-5 -6H6M-5 -1H6M-5 4H3','none','#fff3bd',1.3));
  if(clip==='cast'||clip==='interact')body+=glow(103,top+1,15,'#92ffe1')+ellipse(103,top+1,4+Math.abs(wave)*2,5,'#baffec')+path('M98 51L107 44M106 63L115 60','none','#89f0d6',1.4);
  if(hurt)body+=star(36,24,5,'#ffdc9a')+star(92,13,3,'#ffdca6');
  if(clip==='celebrate')body+=star(31,37,4,'#ffda8b')+star(98,25,5,'#a3f6de');
  return b+group(`translate(0 ${bob}) rotate(${tilt} 64 145)`,body);
}
function pip(clip,t){
  const wave=Math.sin(t*TAU),cheer=clip==='cheer',scan=clip==='scan',bump=clip==='recoil',y=cheer?-4-Math.abs(wave)*3:Math.sin(t*TAU)*2;
  let b=glow(64,138,17,'#88ecdc')+ellipse(64,146,20,3,'#17394b').replace('<ellipse','<ellipse opacity=".3"');
  let body=path('M29 87L14 72Q8 83 18 99L31 105Z','url(#teal)')+path('M99 87L114 72Q120 83 110 99L97 105Z','url(#teal)');
  body+=group(`rotate(${cheer?-20-wave*9:wave*4} 30 96)`,path('M32 98L13 110L24 116L40 106Z','#8fd7d8'))+group(`rotate(${cheer?20+wave*9:-wave*4} 98 96)`,path('M96 98L115 110L104 116L88 106Z','#8fd7d8'));
  body+=ellipse(64,91,38,35,'url(#pipShell)','#2c5765',1.8)+path('M37 68Q64 43 92 68L98 82Q64 62 30 84Z','url(#ivory)')+path('M35 112Q64 130 93 112L83 129L45 129Z','url(#teal)')+rect(32,78,65,28,'url(#visor)',12)+ellipse(64+(scan?wave*13:2),92,bump?7:11,bump?2:9,'#b2fff1')+ellipse(69+(scan?wave*13:2),88,3,3,'#fff');
  body+=ellipse(30,91,5,8,'#e5af57')+ellipse(98,91,5,8,'#e5af57')+path('M64 56V41','none','#608d9e',3)+ellipse(64,39,5,5,cheer?'#ffdc86':'#85f5d3')+path('M56 116Q64 122 73 115','none','#c4ffed',2)+path('M47 129L42 137H54L57 130M75 130L78 137H90L85 129','url(#ivory)');
  if(scan)body+=path(`M96 88L119 ${70+wave*7}M96 93L120 ${107+wave*7}`,'none','#9cf6df',1.5)+path('M116 77Q123 90 116 104','none','#a1ffeb',1.5);
  if(cheer)body+=star(19,48,5,'#ffe29c')+star(107,43,6,'#8bf1d6');
  return b+group(`translate(${bump?-wave*3:0} ${y}) rotate(${bump?-8*(1-t):wave*2} 64 100)`,body);
}
function machine(kind,clip,t){
  const boss=kind==='boss',fly=kind==='drone'||kind==='maintenance',maintenance=kind==='maintenance',magnet=kind==='magnetBot',walk=clip==='walk',attack=clip==='attack'||clip==='fire',hurt=clip==='hurt'||clip==='bump',defeat=clip==='defeat',wave=Math.sin(t*TAU),stride=walk?wave*18:0;
  const accent=defeat?'#7e96a4':boss?'#e88ec1':magnet?'#8defbe':maintenance?'#ffc873':'#ff9b80';
  let body='';
  if(fly){
    for(const x of [24,104]){
      body+=path(`M${x<64?50:78} 76L${x} 65V88L${x<64?49:79} 96Z`,'url(#steel)');
      body+=ellipse(x,64,20,10,'#263e55','#91adbd',2)+ellipse(x,64,15,6,'#102b42')+group(`rotate(${t*360} ${x} 64)`,path(`M${x-13} 64H${x+13}M${x} 57V71`,'none',maintenance?'#d9b06c':'#8cafc6',2.5));
    }
    body+=path('M34 79L46 66H82L95 79L90 111L77 124H51L38 111Z',maintenance?'url(#ochre)':'url(#steel)')+path('M36 81L50 71H79L92 82L87 92H41Z','url(#visor)')+path('M48 84L58 87M70 87L80 84','none',accent,3.5)+rect(51,102,26,12,maintenance?'#7e572e':'#8e4e49',4)+rect(58,105,12,5,'#f9df9b',1,'none');
    if(maintenance){body+=`<ellipse cx="64" cy="108" rx="44" ry="14" fill="none" stroke="#c3d4d9" stroke-width="4"/>`+path('M24 105L32 109M96 109L104 105','none','#efb361',5);}
    else body+=path('M49 121L43 136L51 139L59 125M77 121L85 136L77 139L69 125Z','url(#steel)')+rect(58,119,13,12,'#45394a',3);
    if(maintenance&&clip==='scan')body+=path(`M64 120L${95+wave*5} 143H${33+wave*5}Z`,'#9ce8d533','none');
    if(attack)body+=glow(65,131,12,'#ffa68a')+ellipse(65,131,4,4,'#fff2c6');
  }else{
    for(const side of [-1,1]){
      body+=group(`rotate(${side*stride} ${64+side*17} 108)`,rect(64+side*17-9,102,18,27,'url(#joint)',5)+ellipse(64+side*17,119,8,8,'#294459','#91adbb',1.4)+path(`M${64+side*17-10} 129H${64+side*17+10}L${64+side*17+14} 146H${64+side*17-14}Z`,'url(#steel)')+rect(64+side*17-16,141,32,7,'#132f44',2)+path(`M${64+side*17-10} 143H${64+side*17+10}`,'none',accent,2));
    }
    const hull=boss?'M32 62L43 49H85L98 64L91 111L77 120H51L36 108Z':magnet?'M35 64L45 52H83L94 65L87 110H41Z':'M38 60L47 51H83L94 65L87 111H42L34 78Z';
    body+=path(hull,boss?'url(#bossShell)':magnet?'url(#greenShell)':'url(#orangeShell)')+path('M42 74H86L82 99H46Z','#283e53')+path('M46 105H83M49 110H79','none','#b0c5cd',2);
    for(const side of [-1,1]){
      const ax=64+side*(boss?28:26),angle=side*(attack?-25+(1-t)*8:boss&&clip==='charge'?-24:walk?-stride*.5:5);
      let arm=ellipse(ax,69,boss?13:10,boss?13:10,'url(#joint)','#233e53',2)+group(`rotate(${angle} ${ax} 69)`,path(`M${ax-9} 69L${ax-12} 91L${ax-8} 108H${ax+8}L${ax+13} 87L${ax+8} 68Z`,'url(#steel)')+rect(ax-10,96,20,17,magnet?(side<0?'#b56c6b':'#5c9abb'):boss?'#72517d':'#ae7355',4));
      if(magnet)arm+=group(`rotate(${angle} ${ax} 69)`,path(`M${ax-10} 110V123H${ax-4}V115H${ax+4}V123H${ax+10}V110Z`,side<0?'#efa4a0':'#a2d5f4'));
      body+=arm;
    }
    body+=path(boss?'M37 25L49 17H81L92 29L87 55H42Z':'M41 32L50 24H81L90 35L86 56H44Z',boss?'url(#bossShell)':'url(#steel)')+path('M45 37L52 33H80L87 38L82 48H49Z','url(#visor)')+path(hurt?'M51 40L58 44L51 46M77 40L70 44L77 46':'M51 40L59 42M70 42L78 39','none',accent,3)+rect(58,51,14,6,'#152b3e',2);
    if(magnet)body+=path('M46 26V11H54V22H74V11H82V26Z','url(#ivory)')+rect(46,8,8,9,'#e8a19b',1)+rect(74,8,8,9,'#8fc8ed',1);
    if(boss){
      for(const side of [-1,1])body+=path(side<0?'M31 49L15 42L20 73L37 80Z':'M97 49L113 42L108 73L91 80Z','url(#bossShell)')+path(side<0?'M20 49L25 62':'M108 49L103 62','none',accent,2.4);
      body+=glow(64,85,clip==='charge'?25:16,'#ed9cda')+ellipse(64,85,17,17,'#162d43','#ad82b4',3)+group(`rotate(${t*180} 64 85)`,Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return path(`M${64+Math.cos(a)*7} ${85+Math.sin(a)*7}L${64+Math.cos(a+.3)*14} ${85+Math.sin(a+.3)*14}L${64+Math.cos(a+.6)*8} ${85+Math.sin(a+.6)*8}Z`,'#edb8dc','none');}).join(''))+ellipse(64,85,clip==='charge'?8+Math.abs(wave)*4:6,clip==='charge'?8+Math.abs(wave)*4:6,'#ffdf96');
      if(attack)body+=star(113,107,9*(1-t*.5),'#ffe2a8');
    }else body+=rect(53,79,23,15,magnet?'#448775':'#bd664e',4)+ellipse(64,86,4,4,'#d1f9dd');
    if(attack&&!boss)body+=glow(104,105,9,'#ffc688')+ellipse(104,105,3.5,3.5,'#fff0c2');
  }
  if(hurt)body+=star(23,34,5,'#ffe1a1')+star(103,24,4,'#ffe7b5');
  if(defeat)body+=path('M29 35L23 27M102 43L112 35M34 117L23 123','none','#ffd095',2.2);
  const tilt=defeat?t*17:hurt?-8*(1-t):fly?wave*3:0,dy=defeat?t*10:fly?wave*2:walk?Math.abs(Math.cos(t*TAU))*2:Math.sin(t*TAU)*.7;
  return ellipse(64,150,fly?23:35,4,'#0c283c').replace('<ellipse','<ellipse opacity=".25"')+group(`translate(0 ${dy}) translate(64 148) rotate(${tilt}) scale(${defeat?1-t*.15:1} ${defeat?1-t*.4:1}) translate(-64 -148)`,body);
}
function frame(kind,clip,t){
  const defs=gradient('skin','#c28b61','#925e43')+gradient('ivory','#fff9df','#afc9cf')+gradient('jacket','#f5f7dd','#94c2c8')+gradient('teal','#57d6c4','#25647a')+gradient('pants','#3e6578','#172e46')+gradient('boot','#41586a','#15273a')+gradient('backpack','#365f78','#193348')+gradient('hairDark','#43535a','#162d3b')+gradient('hairSilver','#f3edda','#8ca7b5')+gradient('pipShell','#ffd592','#c47b39')+gradient('visor','#233f59','#0a2135')+gradient('steel','#b0c4cf','#486c88')+gradient('joint','#677f91','#253e53')+gradient('bossShell','#a582b2','#49375c')+gradient('orangeShell','#d89966','#855547')+gradient('greenShell','#8eb9a0','#406f71')+gradient('ochre','#e4bd72','#997d4d');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="192" viewBox="-16 -16 160 192"><defs>${defs}</defs><g stroke-linejoin="round">${kind==='player'||kind==='professor'?human(kind,clip,t):kind==='helper'?pip(clip,t):machine(kind,clip,t)}</g></svg>`;
}
const clips={
  player:{idle:[6,6,true],run:[8,12,true],rise:[4,10,false],fall:[4,8,false],land:[3,15,false],interact:[6,9,true],cast:[6,15,false],hurt:[4,12,false],celebrate:[6,9,true]},
  professor:{idle:[6,5,true],talk:[6,7,true],gesture:[6,7,true],celebrate:[6,7,true]},
  helper:{hover:[6,8,true],scan:[6,9,true],cheer:[6,10,true],recoil:[4,12,false]},
  glitch:{idle:[6,5,true],walk:[8,10,true],attack:[6,15,false],hurt:[4,16,false],defeat:[6,12,false]},
  drone:{hover:[6,10,true],attack:[6,15,false],hurt:[4,16,false],defeat:[6,12,false]},
  magnetBot:{idle:[6,5,true],walk:[8,9,true],attack:[6,15,false],hurt:[4,16,false],defeat:[6,12,false]},
  boss:{idle:[6,5,true],walk:[8,8,true],charge:[6,15,true],fire:[6,15,false],hurt:[4,16,false],defeat:[6,10,false]},
  maintenance:{hover:[6,9,true],scan:[6,9,true],bump:[4,12,false]}
};
const bounds={player:[80,140],professor:[80,140],helper:[96,108],glitch:[88,128],drone:[110,96],magnetBot:[94,142],boss:[112,140],maintenance:[112,96]};
module.exports={frame,clips,bounds};
