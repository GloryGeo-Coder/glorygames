(function(r, f) { const api = f(r); if (typeof module === 'object' && module.exports) module.exports = api; else r.ScienceArcadeIcons = api; })(typeof globalThis !== 'undefined' ? globalThis : this, function(r) {
  'use strict';
  // Editable, labelled science equipment. Every collectible has an intentional
  // pictogram; the game supplies the full label separately from the icon.
  const line = d => `<path d="${d}" fill="none" stroke="#79c6d9"/>`;
  const circle = (x,y,rad,fill='url(#glass)') => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${fill}"/>`;
  const text = (s,y=57,size=23) => `<text x="48" y="${y}" font-family="Arial,sans-serif" font-size="${size}" font-weight="800" text-anchor="middle" stroke="none" fill="#07314d">${s}</text>`;
  const beaker = color => `<path d="M34 18h28M38 18v28L24 71q-4 7 5 7h38q9 0 5-7L58 46V18" fill="url(#glass)"/><path d="M33 58h30l9 16H24z" fill="${color}" stroke="none"/>${circle(43,64,3,'#fff')}${circle(57,70,2,'#fff')}`;
  const leaf = `<path d="M23 70Q14 21 76 19Q80 78 23 70Z" fill="url(#green)"/>${line('M24 71L66 30M40 53l-3-16m13 6 16 2')}`;
  const bulb = `<path d="M35 64C35 53 25 50 25 36a23 23 0 0 1 46 0c0 14-10 17-10 28Z" fill="url(#gold)"/><path d="M36 64h24v14H36z" fill="url(#metal)"/>${line('M40 82h16M43 63V44l5 6 6-6v19M13 35h-7m76 0h8M20 13l-5-5m62 5 5-5')}`;
  const atom = `${circle(48,48,9,'#ffb756')}<g fill="none"><ellipse cx="48" cy="48" rx="34" ry="14"/><ellipse cx="48" cy="48" rx="34" ry="14" transform="rotate(60 48 48)"/><ellipse cx="48" cy="48" rx="34" ry="14" transform="rotate(120 48 48)"/></g>${circle(78,54,5,'#83fbe6')}`;
  const gear = `<path d="M41 12h14l3 10 10 5 10-3 7 13-8 8v10l8 8-7 12-11-3-9 6-3 10H41l-3-10-10-6-10 3-7-12 8-8V45l-8-8 7-13 10 3 10-5Z" fill="url(#metal)"/>${circle(48,50,17,'url(#glass)')}`;
  const chart = `<path d="M17 16h62v65H17Z" fill="url(#glass)"/>${line('M28 28v41h39M29 60l12-14 12 7 14-23')}<path d="M62 30h7v8" fill="none"/>`;
  const book = `<path d="M12 22q20-7 36 4 16-11 36-4v54q-20-7-36 4-16-11-36-4Z" fill="url(#glass)"/>${line('M48 26v54M23 37h14m-14 11h14m-14 11h14M60 37h13m-13 11h13m-13 11h13')}`;
  const shield = `<path d="M48 12 77 25v23c0 21-29 37-29 37S19 69 19 48V25Z" fill="url(#glass)"/>${line('M33 47l11 11 21-24')}`;
  const wave = line('M10 49q10-36 19 0t19 0 19 0 19 0');
  const globe = `${circle(48,48,33)}<path d="m26 25 16 1 7 13-7 9-15-3-9 7m31 23-5-16 10-9 21 5" fill="url(#green)"/>`;
  const molecule = `${line('M29 55l18-27 23 30M29 55l41 3')}${circle(29,55,13,'#69d9ff')}${circle(47,28,12,'#ff7ea1')}${circle(70,58,13,'#7cf1bd')}`;
  const icons = {
    goggles: `<path d="M8 37h80M16 35h27v27H16q-7-12 0-27Zm37 0h27q7 15 0 27H53Z" fill="url(#glass)"/>${line('M43 44h10M22 41l12 12m25-12 12 12')}`,
    gloves: `<path d="M29 84 16 59q-4-12 4-13l10 13V25q0-10 8-8v29-32q8-7 10 1v31-30q9-7 10 4v27-22q9-5 10 5v32l-9 22Z" fill="url(#gold)"/>`,
    coat: `<path d="m33 15-17 12-9 33 16 5 6-25v43h38V40l6 25 16-5-9-33-17-12-15 12Z" fill="url(#metal)"/>${line('M48 27v55M34 15l3 23 11-11 11 11 4-23M55 55h9v12h-9')}`,
    warning: `<path d="m48 13 37 65H11Z" fill="url(#gold)"/>${line('M48 34v21')}${circle(48,66,3,'#14314b')}`,
    observe: `${circle(42,40,25)}${line('M59 59l22 22M31 39q11-13 22 0-11 13-22 0')}${circle(42,39,4,'#0b4260')}`,
    hypothesis: bulb,
    measure: `<path d="m14 65 51-51 18 18-51 51Z" fill="url(#gold)"/>${line('m57 22 7 7m-18 4 10 10M35 44l7 7M24 55l10 10')}`,
    conclude: `<path d="M24 13h43l11 13v58H24Z" fill="url(#metal)"/>${line('M67 13v14h11M35 39h30M35 50h20M34 66l9 8 21-18')}`,
    solid: `<path d="m48 14 29 17v34L48 82 19 65V31Z" fill="url(#glass)"/>${line('M19 31l29 17 29-17M48 48v34')}`,
    liquid: beaker('#4fcaff'),
    gas: `${circle(30,60,13)}${circle(59,30,13)}${circle(69,67,11)}${line('M19 34l6-7m14 56 7 2m33-37 4-5')}`,
    thermometer: `<path d="M41 55V20a7 7 0 0 1 14 0v35a17 17 0 1 1-14 0Z" fill="url(#glass)"/>${line('M48 29v34M61 27h9m-9 12h6')}${circle(48,69,9,'#ff7b81')}`,
    filter: `<path d="M15 19h66L55 50v27l-14 7V50Z" fill="url(#glass)"/>${line('M26 29h44M38 36h20')}`,
    magnet: `<path d="M20 18h18v37a10 10 0 0 0 20 0V18h18v37a28 28 0 0 1-56 0Z" fill="url(#metal)"/><path d="M20 18h18v19H20z" fill="#ff829f"/><path d="M58 18h18v19H58z" fill="#75d5ff"/>`,
    sieve: `<ellipse cx="41" cy="43" rx="27" ry="23" fill="url(#glass)"/>${line('M61 60l23 22M24 29l32 28M20 40l25 23M39 22l26 24M22 56l36-32M33 64l32-29')}`,
    evaporate: `${beaker('#6bd1ff')}${line('M27 29q-9-10 0-20m44 25q9-10 0-20')}`,
    force: `<path d="M12 36h41V20l32 28-32 28V60H12Z" fill="url(#gold)"/>`,
    arrow: line('M18 77 76 19M47 19h29v29'),
    mass: `<path d="M24 34h48l11 47H13Z" fill="url(#metal)"/>${circle(48,24,12,'none')}${text('kg',65,21)}`,
    ramp: `<path d="m12 77 71-47v47Z" fill="url(#metal)"/>${circle(58,34,12,'url(#gold)')}`,
    battery: `<path d="M19 28h62v45H19Z" fill="url(#glass)"/><path d="M81 40h7v21h-7Z" fill="url(#metal)"/>${line('M29 41v20m-8-10h16m26 0h12')}`,
    wire: `${line('M16 67q-10-46 22-39c25 7-8 58 19 42q25-12 17-42')}<path d="M68 18h15v14H68ZM9 67h16v13H9Z" fill="url(#gold)"/>`,
    switch: `<path d="M13 65h70v15H13Z" fill="url(#metal)"/>${circle(26,56,5)}${circle(71,56,5)}${line('M26 56l35-30')}`,
    bulb,
    mirror: `<path d="M22 12h52v64H22Z" fill="url(#glass)"/>${line('M48 76v10M33 87h30M29 47l27-26m-22 40 29-29')}`,
    speaker: `<path d="M15 37h18l23-18v58L33 60H15Z" fill="url(#metal)"/>${line('M65 32q17 16 0 32m10-45q29 29 0 58')}`,
    wave,
    shadow: `${circle(46,40,24,'url(#gold)')}<path d="M21 78 42 44h12l30 34Z" fill="#1a3657"/>`,
    leaf,
    water: `<path d="M48 10C38 30 23 43 23 59a25 25 0 0 0 50 0c0-16-15-29-25-49Z" fill="url(#glass)"/>${line('M33 58q-1 13 11 16')}`,
    sun: `${circle(48,48,22,'url(#gold)')}${line('M48 5v12M48 79v12M5 48h12m62 0h12M18 18l9 9m42 42 9 9M18 78l9-9m42-42 9-9')}`,
    oxygen: `${circle(48,48,31)}${text('O₂',58,29)}`,
    heart: `<path d="M48 81 17 50C-5 23 32 5 48 29 64 5 101 23 79 50Z" fill="url(#pink)"/>${line('M19 48h17l6-14 10 29 7-15h17')}`,
    lung: `<path d="M43 34C27 15 9 39 14 65c4 20 25 9 29 1ZM53 34C69 15 87 39 82 65c-4 20-25 9-29 1Z" fill="url(#pink)"/>${line('M48 12v32M48 31 30 58m18-27 18 27')}`,
    muscle: `<path d="m17 76 3-26 15-10 9 15c19-25 34-12 36-2 10 22-21 31-39 25Z" fill="url(#pink)"/>${line('M24 45V22l17-6 10 14-14 7-5-8')}`,
    food: `<path d="M49 26C11 5 6 63 34 81q12 7 17-1 17 11 29-13 17-44-14-43Z" fill="url(#pink)"/>${line('M49 30q-5-12 8-20')}<path d="M55 20q11-16 25-9-2 17-25 9" fill="url(#green)"/>`,
    producer: leaf,
    consumer: `${circle(48,47,28,'url(#gold)')}${circle(26,22,11,'url(#gold)')}${circle(70,22,11,'url(#gold)')}${circle(37,44,4,'#14314b')}${circle(59,44,4,'#14314b')}${line('M40 61q8 8 16 0')}`,
    habitat: `<path d="m11 44 37-31 37 31-9 1v35H22V45Z" fill="url(#glass)"/>${leaf.replace(/M23 70/, 'M23 70')}`,
    web: `${line('M48 14 16 68h64ZM48 14v54M16 68l48-27M80 68 32 41')}${circle(48,14,6,'url(#green)')}${circle(16,68,6,'url(#gold)')}${circle(80,68,6,'url(#pink)')}`,
    proton: `${circle(48,48,30,'url(#pink)')}${line('M48 29v38M29 48h38')}`,
    electron: `${circle(48,48,30)}${line('M29 48h38')}`,
    atom,
    molecule,
    acid: `${beaker('#ff7b9d')}${text('pH',71,15)}`,
    base: `${beaker('#b895ff')}${text('pH',71,15)}`,
    indicator: `<path d="M25 14h46v70H25Z" fill="url(#metal)"/>${[0,1,2,3].map((n)=>`<path d="M31 ${20+n*15}h34v13H31Z" fill="${['#ff7d8d','#ffdf77','#75efba','#ab95ff'][n]}" stroke="none"/>`).join('')}`,
    neutral: `${beaker('#8bedba')}${text('7',73,22)}`,
    rock: `<path d="m13 63 12-32 30-14 26 23 3 30-34 12Z" fill="url(#metal)"/>${line('M25 31 49 48l32-8M49 48 50 82M13 63l36-15')}`,
    soil: `<path d="M15 39h66v44H15Z" fill="#b48b55"/>${line('M15 51h66M15 64h66M47 39V17')}<path d="M47 31q-27-5-24-19 22-5 24 19m0-6Q55 4 75 12q-3 19-28 13" fill="url(#green)"/>`,
    waterCycle: `${circle(48,48,23)}${line('M17 37q15-33 46-18m-6-10 9 13-16 1M79 58Q62 91 32 76m5 12-10-15 17 1')}`,
    barrier: `<path d="M12 39h72v28H12ZM20 67v18m56-18v18" fill="url(#gold)"/>${line('m18 62 17-21m5 21 17-21m5 21 16-21')}`,
    planet: `${circle(48,48,26,'url(#glass)')}<ellipse cx="48" cy="48" rx="43" ry="12" transform="rotate(-24 48 48)" fill="none" stroke="#ffd276"/>`,
    moon: `<path d="M66 15C24 12 11 69 49 81c-6-25 9-45 31-48Z" fill="url(#metal)"/>`,
    star: `<path d="m48 8 12 26 29 5-21 20 5 29-25-14-25 14 5-29L7 39l29-5Z" fill="url(#gold)"/>`,
    orbit: `${circle(48,48,15,'url(#gold)')}<ellipse cx="48" cy="48" rx="39" ry="25" transform="rotate(-25 48 48)" fill="none"/>${circle(81,33,7)}`,
    solar: `<path d="M13 28h70L74 73H22Z" fill="url(#glass)"/>${line('M36 29 33 73m26-44 3 44M17 43h62M20 58h57M48 74v13M31 87h34')}`,
    wind: `${line('M48 40v45M48 40 19 28q8-16 21 2ZM48 40l26-22q12 15-11 23ZM48 40l5 32q-19 5-18-20Z')}${circle(48,40,6,'url(#gold)')}`,
    hydro: `${globe}${wave}`,
    carbon: `${circle(48,48,30,'url(#metal)')}${text('C',59,32)}`,
    cell: `<ellipse cx="48" cy="48" rx="36" ry="29" fill="url(#green)"/>${circle(46,46,12,'url(#pink)')}${circle(25,44,5)}${circle(67,56,6)}${line('M55 28q16 2 16 12M25 62l10 3')}`,
    dna: `${line('M28 13c0 25 40 43 40 70M68 13c0 25-40 43-40 70M31 23h34M39 38h18M39 57h18M31 74h34')}`,
    trait: `<path d="M16 22h64v56H16Z" fill="url(#glass)"/>${text('Aa',61,30)}`,
    microscope: `<path d="m42 13 19 10-20 36-19-10Z" fill="url(#glass)"/>${line('M57 39q34 28 0 39H28m15-18h30M26 87h49M50 78v9')}`,
    sensor: `${circle(48,48,10,'url(#gold)')}${line('M28 27q-20 21 0 42M68 27q20 21 0 42M17 15q-31 33 0 66M79 15q31 33 0 66')}`,
    motor: `<path d="M20 28h54v43H20Z" fill="url(#metal)"/>${line('M74 47h15M8 47h12M30 19v9m32-9v9M30 71v10m32-10v10')}${circle(47,49,12)}`,
    code: `<path d="M12 21h72v54H12Z" fill="url(#glass)"/>${line('M34 36 24 48l10 12M62 36 72 48 62 60M54 33 43 64M48 75v9M32 85h32')}`,
    gear,
    graph: chart,
    variable: `${chart}${text('x',60,24)}`,
    trend: chart,
    result: `${book}${line('m55 58 7 7 15-18')}`,
    core: `${atom}${circle(48,48,14,'#bca0ff')}`,
    review: book,
    formula: `<path d="M15 17h66v65H15Z" fill="url(#glass)"/>${text('n =',47,22)}${text('m/M',70,19)}`,
    evidence: `${beaker('#72e7c0')}${line('m56 33 7 7 16-18')}`,
    energy: `<path d="M51 9 21 53h24l-2 34 32-48H51Z" fill="url(#gold)"/>`,
    life: `${globe}${leaf}`,
    shield,
    slow: `${circle(48,51,28)}${line('M48 51V31m0 20 16 10M37 12h22M48 12v11')}`,
    double: `${circle(48,48,31,'url(#gold)')}${text('×2',59,29)}`,
    quiz: `${book}${text('?',60,28)}`,
    spill: `<path d="M13 65q14-20 29-7t37 1q16 23-21 23H25Q7 82 13 65Z" fill="url(#pink)"/>${beaker('#e98aa8')}`,
    glass: `<path d="m20 17 25 21-16 28ZM68 28l12 43-28-10ZM39 72l7 12 12-15Z" fill="url(#glass)"/>`,
    badData: `${chart}${line('M27 30l43 40M70 30 27 70')}`,
    steam: `${line('M22 77q23-13 8-33t7-31M48 80q23-13 8-33t7-31M72 76q22-13 8-33t4-22')}`,
    freeze: `${line('M48 10v76M15 29l66 38M15 67l66-38M38 17l10 9 10-9M38 79l10-9 10 9M18 41l12-3-2-12M68 70l-2-12 12-3M18 55l12 3-2 12M68 26l-2 12 12 3')}`,
    mixed: molecule,
    friction: `${line('M12 75h72M20 63l7-8 7 8 7-8 7 8 7-8 7 8')}<path d="M27 26h44v26H27Z" fill="url(#metal)"/>`,
    fall: `${circle(48,30,17,'url(#metal)')}${line('M48 55v29M36 72l12 12 12-12')}`,
    spark: `<path d="m50 8-26 39h24L39 88l36-48H52Z" fill="url(#gold)"/>`,
    short: `${line('M11 65h23V29h15m36 0H66v36H54M45 13l8 18-12 14 10 13-7 24')}`,
    laser: `${line('M9 48h78M46 30l8 18-8 18M70 16l-7 16m0 32 7 16')}`,
    noise: wave,
    drought: `${leaf}${line('M17 80l20-17 8 11 19-22 17 15')}`,
    pest: `${circle(48,50,20,'url(#green)')}${line('M30 42 14 30m16 23-18 1m21 11-17 15M66 42l16-12M66 53l18 1M63 65l17 15M40 31l-7-14m23 14 7-14M48 31v39')}`,
    germ: `${circle(48,48,22,'url(#green)')}${[0,1,2,3,4,5,6,7].map(n=>{const a=n*Math.PI/4,x=48+33*Math.cos(a),y=48+33*Math.sin(a);return line(`M48 48 ${x} ${y}`)+circle(x,y,4,'#83dca5');}).join('')}${circle(42,43,3,'#14314b')}${circle(56,55,4,'#14314b')}`,
    fatigue: `<path d="M19 30h60v44H19Z" fill="url(#metal)"/><path d="M25 37h11v30H25Z" fill="#ff7d92"/>${line('M79 42h8v19h-8')}`,
    pollution: `${globe}<path d="M30 33h13v29H30ZM48 23h13v39H48Z" fill="#698092"/>`,
    invasive: leaf,
    unstable: atom,
    corrosive: beaker('#f68eaf'),
    erosion: `${line('M8 70h19l10-14h19l11-15h22M17 30l39 10M31 17l39 10')}`,
    flood: `${wave}${line('M10 69q10-20 19 0t19 0 19 0 19 0')}`,
    meteor: `<path d="m40 58 10-40 7 21L79 8 68 46l19-7-31 36Z" fill="url(#gold)"/>${circle(34,66,20,'url(#metal)')}`,
    gravityWell: `<g fill="none"><ellipse cx="48" cy="48" rx="37" ry="21"/><ellipse cx="48" cy="48" rx="25" ry="13"/></g>${circle(48,48,10,'#283455')}`,
    smog: `<path d="M18 71c-24-3-10-33 8-29-6-32 43-42 48-12 26-1 31 39 7 41Z" fill="url(#metal)"/>`,
    heat: `<path d="M48 10c1 29 32 31 25 57-8 31-56 25-53-5 1-16 17-22 17-36 13 6 9 18 11 20 10-13 8-24 0-36Z" fill="url(#gold)"/>`,
    virus: `${circle(48,48,22,'url(#pink)')}${line('M48 10v16M48 70v16M10 48h16m44 0h16M20 20l12 12m32 32 12 12M20 76l12-12m32-32 12-12')}${circle(41,43,4,'#8e4278')}${circle(56,55,5,'#8e4278')}`,
    badSample: `${beaker('#d5a1f4')}${line('M34 51l29 22M63 51 34 73')}`,
    jam: gear,
    glitch: `<path d="M17 19h55v12H56v14h24v18H62v15H21V62h18V47H15V32h23V19Z" fill="url(#pink)"/>`
  };
  const cache = new Map();
  function svg(id) {
    if (!icons[id]) return null;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="glass" x2=".8" y2="1"><stop stop-color="#f1ffff"/><stop offset=".4" stop-color="#80e1f6"/><stop offset="1" stop-color="#249abb"/></linearGradient><linearGradient id="metal" x2=".8" y2="1"><stop stop-color="#fff"/><stop offset=".5" stop-color="#d3e6f0"/><stop offset="1" stop-color="#7d9fb6"/></linearGradient><linearGradient id="gold" x2=".8" y2="1"><stop stop-color="#fff4b3"/><stop offset=".45" stop-color="#ffda73"/><stop offset="1" stop-color="#df8a29"/></linearGradient><linearGradient id="green" x2=".8" y2="1"><stop stop-color="#daffd1"/><stop offset=".5" stop-color="#73e9ab"/><stop offset="1" stop-color="#209579"/></linearGradient><linearGradient id="pink" x2=".8" y2="1"><stop stop-color="#ffe0e7"/><stop offset=".4" stop-color="#ff99b3"/><stop offset="1" stop-color="#c64c87"/></linearGradient></defs><g fill="url(#glass)" stroke="#17465d" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${icons[id]}</g></svg>`;
  }
  function draw(ctx, id, x, y, size) {
    if (!icons[id] || !r.Image) return false;
    let item = cache.get(id);
    if (!item) {
      item = {image: new r.Image(), ready: false};
      item.image.onload = () => {item.ready = true;};
      item.image.onerror = () => {item.failed = true;};
      item.image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(id));
      cache.set(id, item);
    }
    if (!item.ready) return false;
    ctx.drawImage(item.image, x, y, size, size);
    return true;
  }
  return {draw, svg, ids: Object.keys(icons), status: () => [...cache].map(([id,v]) => ({id,ready:v.ready,failed:!!v.failed}))};
});
