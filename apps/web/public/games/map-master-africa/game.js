(() => {
  'use strict';

  const GAME_SLUG = 'map-master-africa-explorer-missions';
  const BEST_KEY = 'wga_map_master_africa_explorer_best_v1';

  const $ = (id) => document.getElementById(id);
  const canvas = $('gameCanvas');
  const ctx = canvas.getContext('2d');

  const ui = {
    overlay: $('overlay'),
    overlayTitle: $('overlayTitle'),
    overlayText: $('overlayText'),
    startBtn: $('startBtn'),
    helpBtn: $('helpBtn'),
    scoreValue: $('scoreValue'),
    livesValue: $('livesValue'),
    streakValue: $('streakValue'),
    starsValue: $('starsValue'),
    bestValue: $('bestValue'),
    missionNumber: $('missionNumber'),
    missionTitle: $('missionTitle'),
    missionText: $('missionText'),
    missionFill: $('missionFill'),
    missionPct: $('missionPct'),
    missionMode: $('missionMode'),
    questionText: $('questionText'),
    questionType: $('questionType'),
    choiceList: $('choiceList'),
    passportText: $('passportText'),
    badgeCount: $('badgeCount'),
    badgeGrid: $('badgeGrid'),
    toast: $('toast'),
    pauseBtn: $('pauseBtn'),
    hintBtn: $('hintBtn'),
    skipBtn: $('skipBtn'),
    mapBtn: $('mapBtn'),
    submitBtn: $('submitBtn'),
    restartBtn: $('restartBtn'),
    muteBtn: $('muteBtn')
  };

  const ASSETS = {
    pin: './assets/ui/pin-explorer.png',
    compass: './assets/ui/compass-v3.png',
    passport: './assets/ui/passport.png',
    trophy: './assets/ui/trophy-map-master.png',
    badgeMaster: './assets/badges/badge-master.png',
    backgrounds: {
      world: './assets/backgrounds/bg-world-overview.png',
      explorer: './assets/backgrounds/bg-explorer-desk.png',
      continents: './assets/backgrounds/bg-continents-focus.png',
      africaPolitical: './assets/backgrounds/bg-africa-political.png',
      africaPhysical: './assets/backgrounds/bg-africa-physical.png',
      river: './assets/backgrounds/bg-river-expedition.png',
      mountain: './assets/backgrounds/bg-mountain-mission.png',
      desert: './assets/backgrounds/bg-desert-survival.png',
      lakes: './assets/backgrounds/bg-ocean-grid.png',
      islands: './assets/backgrounds/bg-island-mission.png',
      southAfrica: './assets/backgrounds/bg-sa-provinces.png',
      gis: './assets/backgrounds/bg-coordinate-lab.png',
      final: './assets/backgrounds/bg-final-arena.png'
    },
    badges: [
      './assets/badges/badge-continent.png',
      './assets/badges/badge-regions.png',
      './assets/badges/badge-countries.png',
      './assets/badges/badge-capitals.png',
      './assets/badges/badge-rivers.png',
      './assets/badges/badge-mountains.png',
      './assets/badges/badge-deserts.png',
      './assets/badges/badge-lakes.png',
      './assets/badges/badge-islands.png',
      './assets/badges/badge-sa.png',
      './assets/badges/badge-gis.png',
      './assets/badges/badge-master.png'
    ]
  };

  const HOTSPOTS = {
    world: {
      northAmerica: { label:'North America', x:.31, y:.37 },
      southAmerica: { label:'South America', x:.38, y:.60 },
      europe: { label:'Europe', x:.48, y:.34 },
      africa: { label:'Africa', x:.51, y:.53 },
      asia: { label:'Asia', x:.68, y:.39 },
      australia: { label:'Australia', x:.73, y:.66 },
      antarctica: { label:'Antarctica', x:.56, y:.78 }
    },
    africa: {
      northAfrica: { label:'North Africa', x:.50, y:.30 },
      westAfrica: { label:'West Africa', x:.40, y:.47 },
      eastAfrica: { label:'East Africa', x:.63, y:.48 },
      centralAfrica: { label:'Central Africa', x:.50, y:.54 },
      southernAfrica: { label:'Southern Africa', x:.52, y:.75 },
      morocco: { label:'Morocco', x:.40, y:.24 },
      egypt: { label:'Egypt', x:.58, y:.24 },
      ghana: { label:'Ghana', x:.38, y:.49 },
      nigeria: { label:'Nigeria', x:.42, y:.45 },
      ethiopia: { label:'Ethiopia', x:.60, y:.38 },
      kenya: { label:'Kenya', x:.61, y:.50 },
      tanzania: { label:'Tanzania', x:.60, y:.58 },
      drc: { label:'DRC', x:.50, y:.56 },
      southAfrica: { label:'South Africa', x:.52, y:.80 },
      madagascar: { label:'Madagascar', x:.69, y:.73 },
      mauritius: { label:'Mauritius', x:.76, y:.78 },
      seychelles: { label:'Seychelles', x:.74, y:.55 },
      capeVerde: { label:'Cape Verde', x:.27, y:.38 },
      nile: { label:'Nile River', x:.58, y:.30 },
      nigerRiver: { label:'Niger River', x:.39, y:.41 },
      congoRiver: { label:'Congo River', x:.49, y:.57 },
      zambezi: { label:'Zambezi River', x:.55, y:.66 },
      sahara: { label:'Sahara Desert', x:.48, y:.30 },
      namib: { label:'Namib Desert', x:.46, y:.72 },
      kalahari: { label:'Kalahari Desert', x:.51, y:.70 },
      atlasMountains: { label:'Atlas Mountains', x:.40, y:.22 },
      kilimanjaro: { label:'Mount Kilimanjaro', x:.61, y:.58 },
      drakensberg: { label:'Drakensberg', x:.57, y:.79 },
      ethiopianHighlands: { label:'Ethiopian Highlands', x:.60, y:.39 },
      riftValley: { label:'Great Rift Valley', x:.61, y:.44 },
      lakeVictoria: { label:'Lake Victoria', x:.58, y:.53 },
      lakeTanganyika: { label:'Lake Tanganyika', x:.56, y:.60 },
      lakeMalawi: { label:'Lake Malawi', x:.58, y:.65 }
    },
    southAfrica: {
      northernCape: { label:'Northern Cape', x:.38, y:.53 },
      westernCape: { label:'Western Cape', x:.33, y:.66 },
      easternCape: { label:'Eastern Cape', x:.47, y:.67 },
      freeState: { label:'Free State', x:.48, y:.53 },
      northWest: { label:'North West', x:.44, y:.42 },
      gauteng: { label:'Gauteng', x:.53, y:.42 },
      mpumalanga: { label:'Mpumalanga', x:.59, y:.46 },
      limpopo: { label:'Limpopo', x:.58, y:.34 },
      kwazuluNatal: { label:'KwaZulu-Natal', x:.63, y:.61 },
      capeTown: { label:'Cape Town', x:.31, y:.69 },
      durban: { label:'Durban', x:.63, y:.66 },
      johannesburg: { label:'Johannesburg', x:.53, y:.45 },
      pretoria: { label:'Pretoria', x:.54, y:.41 },
      bloemfontein: { label:'Bloemfontein', x:.48, y:.55 }
    },
    gis: {
      equator: { label:'Equator', x:.50, y:.51 },
      primeMeridian: { label:'Prime Meridian', x:.39, y:.39 },
      northArrow: { label:'North Arrow', x:.13, y:.16 },
      legend: { label:'Legend', x:.85, y:.18 },
      scaleBar: { label:'Scale Bar', x:.74, y:.79 },
      coordinatePoint: { label:'Coordinate Point', x:.62, y:.58 },
      gridCell: { label:'Grid Cell', x:.44, y:.64 }
    }
  };

  const tap = (question, correct, group, keys, fact = '', hint = '') => ({ type:'tap', question, correct, group, keys, fact, hint });
  const choice = (question, correct, options, fact = '', hint = '') => ({ type:'choice', question, correct, options, fact, hint });
  const route = (question, routeKeys, group, fact = '', hint = '') => ({ type:'route', question, routeKeys, group, fact, hint });
  const coordinate = (question, target, tolerance, fact = '', hint = '') => ({ type:'coordinate', question, target, tolerance, fact, hint });

  const MISSIONS = [
    {
      title:'World Explorer Training',
      badge:'Continent Badge',
      map:'world',
      bg:'world',
      objective:'Start with global map thinking and locate Africa in the world.',
      skill:'Continents, oceans and relative location.',
      rounds:[
        tap('Tap Africa on the world map.', 'africa', 'world', ['africa','europe','asia','southAmerica'], 'Africa lies south of Europe and is bordered by the Atlantic and Indian Oceans.', 'Africa is below Europe and west of the Indian Ocean.'),
        tap('Tap Europe, the continent north of Africa.', 'europe', 'world', ['europe','africa','asia','northAmerica'], 'Europe lies across the Mediterranean Sea from North Africa.'),
        choice('Which ocean lies west of Africa?', 'Atlantic Ocean', ['Indian Ocean','Atlantic Ocean','Pacific Ocean','Arctic Ocean'], 'The Atlantic Ocean borders western Africa.'),
        tap('Tap Asia.', 'asia', 'world', ['asia','europe','australia','africa'], 'Asia lies to the east and northeast of Africa.'),
        choice('Africa is crossed by which important line of latitude?', 'Equator', ['Prime Meridian','Equator','Tropic of Capricorn only','International Date Line'], 'The Equator crosses Africa, so the continent spans both hemispheres.')
      ]
    },
    {
      title:'Find Africa',
      badge:'Explorer Focus Badge',
      map:'world',
      bg:'explorer',
      objective:'Use relative clues to identify Africa from nearby continents and oceans.',
      skill:'Relative position and spatial reasoning.',
      rounds:[
        tap('Tap the continent south of Europe.', 'africa', 'world', ['africa','europe','asia','australia'], 'Africa is directly south of Europe across the Mediterranean Sea.'),
        choice('Which continent is east of Africa?', 'Asia', ['Europe','Asia','South America','Antarctica'], 'Asia lies east and northeast of Africa.'),
        tap('Tap Australia.', 'australia', 'world', ['australia','asia','africa','antarctica'], 'Australia is southeast of Asia and far east of Africa.'),
        tap('Tap Antarctica.', 'antarctica', 'world', ['antarctica','australia','southAmerica','africa'], 'Antarctica surrounds the South Pole.'),
        choice('Which continent is directly west across the Atlantic from Africa?', 'South America', ['South America','Asia','Australia','Europe'], 'South America lies across the Atlantic Ocean from West Africa.')
      ]
    },
    {
      title:'African Regions',
      badge:'Regions Badge',
      map:'africa',
      bg:'africaPolitical',
      objective:'Identify Africa’s major geographic regions.',
      skill:'Regional geography.',
      rounds:[
        tap('Tap North Africa.', 'northAfrica', 'africa', ['northAfrica','westAfrica','eastAfrica','southernAfrica'], 'North Africa includes countries such as Morocco and Egypt.'),
        tap('Tap West Africa.', 'westAfrica', 'africa', ['westAfrica','eastAfrica','centralAfrica','northAfrica'], 'West Africa includes countries such as Ghana and Nigeria.'),
        tap('Tap East Africa.', 'eastAfrica', 'africa', ['eastAfrica','centralAfrica','northAfrica','southernAfrica'], 'East Africa includes Kenya, Ethiopia and Tanzania.'),
        tap('Tap Central Africa.', 'centralAfrica', 'africa', ['centralAfrica','westAfrica','eastAfrica','southernAfrica'], 'Central Africa includes the Congo Basin region.'),
        tap('Tap Southern Africa.', 'southernAfrica', 'africa', ['southernAfrica','eastAfrica','northAfrica','westAfrica'], 'Southern Africa includes South Africa, Namibia, Botswana and nearby countries.')
      ]
    },
    {
      title:'Country Quest',
      badge:'Countries Badge',
      map:'africa',
      bg:'africaPolitical',
      objective:'Locate major African countries on the map.',
      skill:'Country location.',
      rounds:[
        tap('Tap Nigeria.', 'nigeria', 'africa', ['nigeria','ghana','kenya','egypt'], 'Nigeria is in West Africa.'),
        tap('Tap Kenya.', 'kenya', 'africa', ['kenya','ethiopia','tanzania','drc'], 'Kenya is in East Africa.'),
        tap('Tap Egypt.', 'egypt', 'africa', ['egypt','morocco','ethiopia','ghana'], 'Egypt is in northeastern Africa.'),
        tap('Tap the DRC.', 'drc', 'africa', ['drc','nigeria','tanzania','southAfrica'], 'The Democratic Republic of the Congo is in Central Africa.'),
        tap('Tap Madagascar.', 'madagascar', 'africa', ['madagascar','southAfrica','kenya','egypt'], 'Madagascar is a large island country off the southeast coast of Africa.')
      ]
    },
    {
      title:'Capital Challenge',
      badge:'Capitals Badge',
      map:'africa',
      bg:'explorer',
      objective:'Match countries with their capital cities.',
      skill:'Political geography and capitals.',
      rounds:[
        choice('Capital of Kenya?', 'Nairobi', ['Nairobi','Accra','Abuja','Cairo'], 'Nairobi is Kenya’s capital.'),
        choice('Capital of Egypt?', 'Cairo', ['Rabat','Cairo','Addis Ababa','Dodoma'], 'Cairo is Egypt’s capital.'),
        choice('Capital of Nigeria?', 'Abuja', ['Lagos','Abuja','Nairobi','Accra'], 'Abuja is Nigeria’s capital.'),
        choice('Capital of Ghana?', 'Accra', ['Accra','Cairo','Pretoria','Rabat'], 'Accra is Ghana’s capital.'),
        choice('Capital of Ethiopia?', 'Addis Ababa', ['Addis Ababa','Nairobi','Kinshasa','Windhoek'], 'Addis Ababa is Ethiopia’s capital.')
      ]
    },
    {
      title:'River Expedition',
      badge:'Rivers Badge',
      map:'africa',
      bg:'river',
      objective:'Follow major African river systems.',
      skill:'Physical geography and route sequencing.',
      rounds:[
        route('Trace the Nile route: Lake Victoria → Nile River → Egypt.', ['lakeVictoria','nile','egypt'], 'africa', 'The Nile flows northwards through northeastern Africa toward Egypt.', 'Tap the route points in order.'),
        tap('Tap the Niger River area.', 'nigerRiver', 'africa', ['nigerRiver','nile','congoRiver','zambezi'], 'The Niger River is important in West Africa.'),
        tap('Tap the Congo River area.', 'congoRiver', 'africa', ['congoRiver','nigerRiver','nile','lakeVictoria'], 'The Congo River basin drains a large rainforest region.'),
        tap('Tap the Zambezi River area.', 'zambezi', 'africa', ['zambezi','congoRiver','nigerRiver','sahara'], 'The Zambezi River flows through southern Africa.'),
        choice('Which river is strongly associated with Egypt?', 'Nile River', ['Nile River','Congo River','Orange River','Limpopo River'], 'The Nile is strongly linked to Egypt’s geography and history.')
      ]
    },
    {
      title:'Mountain Mission',
      badge:'Mountains Badge',
      map:'africa',
      bg:'mountain',
      objective:'Identify mountains and highland regions.',
      skill:'Landforms and elevation.',
      rounds:[
        tap('Tap Mount Kilimanjaro.', 'kilimanjaro', 'africa', ['kilimanjaro','atlasMountains','drakensberg','riftValley'], 'Mount Kilimanjaro is the highest mountain in Africa.'),
        tap('Tap the Atlas Mountains.', 'atlasMountains', 'africa', ['atlasMountains','kilimanjaro','drakensberg','ethiopianHighlands'], 'The Atlas Mountains stretch across northwestern Africa.'),
        tap('Tap the Ethiopian Highlands.', 'ethiopianHighlands', 'africa', ['ethiopianHighlands','riftValley','sahara','kalahari'], 'The Ethiopian Highlands are an important highland region in East Africa.'),
        tap('Tap the Drakensberg area.', 'drakensberg', 'africa', ['drakensberg','atlasMountains','lakeVictoria','nigerRiver'], 'The Drakensberg is a major mountain range in southern Africa.'),
        choice('Mount Kilimanjaro is located in which country?', 'Tanzania', ['Kenya','Tanzania','Egypt','Morocco'], 'Kilimanjaro is in Tanzania.')
      ]
    },
    {
      title:'Desert Survival',
      badge:'Deserts Badge',
      map:'africa',
      bg:'desert',
      objective:'Locate Africa’s major deserts.',
      skill:'Climate zones and dry regions.',
      rounds:[
        tap('Tap the Sahara Desert.', 'sahara', 'africa', ['sahara','kalahari','namib','nile'], 'The Sahara is the world’s largest hot desert.'),
        tap('Tap the Namib Desert.', 'namib', 'africa', ['namib','sahara','kalahari','congoRiver'], 'The Namib lies along the southwestern coast of Africa.'),
        tap('Tap the Kalahari Desert.', 'kalahari', 'africa', ['kalahari','sahara','namib','lakeVictoria'], 'The Kalahari covers parts of southern Africa.'),
        choice('Which desert is in North Africa?', 'Sahara', ['Namib','Kalahari','Sahara','Gobi'], 'The Sahara dominates much of North Africa.'),
        choice('Which two deserts are in southern/southwestern Africa?', 'Namib and Kalahari', ['Sahara and Atlas','Namib and Kalahari','Nile and Congo','Victoria and Malawi'], 'The Namib and Kalahari are associated with southern Africa.')
      ]
    },
    {
      title:'Great Lakes Mission',
      badge:'Lakes Badge',
      map:'africa',
      bg:'lakes',
      objective:'Find Africa’s Great Lakes.',
      skill:'Water bodies and regional geography.',
      rounds:[
        tap('Tap Lake Victoria.', 'lakeVictoria', 'africa', ['lakeVictoria','lakeTanganyika','lakeMalawi','nile'], 'Lake Victoria is one of Africa’s Great Lakes.'),
        tap('Tap Lake Tanganyika.', 'lakeTanganyika', 'africa', ['lakeTanganyika','lakeVictoria','lakeMalawi','zambezi'], 'Lake Tanganyika is long and deep and lies in East Africa.'),
        tap('Tap Lake Malawi.', 'lakeMalawi', 'africa', ['lakeMalawi','lakeVictoria','nigerRiver','congoRiver'], 'Lake Malawi is also known as Lake Nyasa in some contexts.'),
        choice('Lake Victoria is closely connected to which river system?', 'Nile', ['Nile','Niger','Congo','Zambezi'], 'Lake Victoria is part of the Nile basin.'),
        choice('Africa’s Great Lakes are mainly associated with which region?', 'East Africa', ['North Africa','East Africa','West Africa','Sahara region'], 'Many of Africa’s Great Lakes lie in East Africa.')
      ]
    },
    {
      title:'Islands of Africa',
      badge:'Islands Badge',
      map:'africa',
      bg:'islands',
      objective:'Locate African island countries and island groups.',
      skill:'Island geography.',
      rounds:[
        tap('Tap Madagascar.', 'madagascar', 'africa', ['madagascar','mauritius','seychelles','southAfrica'], 'Madagascar is the largest island country near Africa.'),
        tap('Tap Mauritius.', 'mauritius', 'africa', ['mauritius','madagascar','seychelles','capeVerde'], 'Mauritius lies in the Indian Ocean east of Madagascar.'),
        tap('Tap Seychelles.', 'seychelles', 'africa', ['seychelles','mauritius','madagascar','capeVerde'], 'Seychelles is an island nation in the Indian Ocean.'),
        tap('Tap Cape Verde.', 'capeVerde', 'africa', ['capeVerde','seychelles','mauritius','ghana'], 'Cape Verde lies in the Atlantic Ocean off West Africa.'),
        choice('Madagascar is located off which side of Africa?', 'Southeast coast', ['North coast','Southeast coast','West coast','Mediterranean coast'], 'Madagascar lies off Africa’s southeast coast.')
      ]
    },
    {
      title:'South Africa Provinces',
      badge:'South Africa Badge',
      map:'southAfrica',
      bg:'southAfrica',
      objective:'Explore South Africa’s 9 provinces.',
      skill:'South African provincial geography.',
      rounds:[
        tap('Tap Gauteng.', 'gauteng', 'southAfrica', ['gauteng','northWest','freeState','mpumalanga'], 'Gauteng is South Africa’s smallest province by area.'),
        tap('Tap Western Cape.', 'westernCape', 'southAfrica', ['westernCape','easternCape','northernCape','kwazuluNatal'], 'The Western Cape includes Cape Town.'),
        tap('Tap KwaZulu-Natal.', 'kwazuluNatal', 'southAfrica', ['kwazuluNatal','easternCape','westernCape','mpumalanga'], 'KwaZulu-Natal borders the Indian Ocean.'),
        tap('Tap Limpopo.', 'limpopo', 'southAfrica', ['limpopo','mpumalanga','gauteng','freeState'], 'Limpopo is in northern South Africa.'),
        choice('Which province is the largest by area?', 'Northern Cape', ['Gauteng','Free State','Northern Cape','North West'], 'The Northern Cape is the largest province by area.')
      ]
    },
    {
      title:'South African Cities',
      badge:'Cities Badge',
      map:'southAfrica',
      bg:'explorer',
      objective:'Find major South African cities.',
      skill:'City location and urban geography.',
      rounds:[
        tap('Tap Cape Town.', 'capeTown', 'southAfrica', ['capeTown','durban','johannesburg','pretoria'], 'Cape Town is in the Western Cape.'),
        tap('Tap Durban.', 'durban', 'southAfrica', ['durban','capeTown','pretoria','bloemfontein'], 'Durban is a coastal city in KwaZulu-Natal.'),
        tap('Tap Johannesburg.', 'johannesburg', 'southAfrica', ['johannesburg','pretoria','durban','capeTown'], 'Johannesburg is in Gauteng.'),
        tap('Tap Pretoria.', 'pretoria', 'southAfrica', ['pretoria','johannesburg','bloemfontein','durban'], 'Pretoria is part of the City of Tshwane in Gauteng.'),
        choice('Which city is South Africa’s judicial capital?', 'Bloemfontein', ['Cape Town','Pretoria','Bloemfontein','Durban'], 'Bloemfontein is South Africa’s judicial capital.')
      ]
    },
    {
      title:'Compass & Direction',
      badge:'Compass Badge',
      map:'gis',
      bg:'gis',
      objective:'Understand map elements and direction.',
      skill:'Compass, legend, scale and orientation.',
      rounds:[
        tap('Tap the North Arrow.', 'northArrow', 'gis', ['northArrow','legend','scaleBar','equator'], 'A north arrow helps orient the map.'),
        tap('Tap the Legend.', 'legend', 'gis', ['legend','northArrow','scaleBar','coordinatePoint'], 'A legend explains symbols and colours.'),
        tap('Tap the Scale Bar.', 'scaleBar', 'gis', ['scaleBar','legend','equator','primeMeridian'], 'A scale bar helps estimate real-world distance.'),
        choice('Which direction is opposite north?', 'South', ['East','West','South','Northeast'], 'South is opposite north.'),
        choice('If Kenya is east of Ghana, which direction would you travel from Ghana to Kenya?', 'East', ['West','East','South','Northwest'], 'Kenya lies east of Ghana.')
      ]
    },
    {
      title:'Coordinates & GIS',
      badge:'GIS Badge',
      map:'gis',
      bg:'gis',
      objective:'Use latitude, longitude, and GIS map elements.',
      skill:'Coordinate systems and map reading.',
      rounds:[
        tap('Tap the Equator.', 'equator', 'gis', ['equator','primeMeridian','legend','coordinatePoint'], 'Latitude is measured north and south from the Equator.'),
        tap('Tap the Prime Meridian.', 'primeMeridian', 'gis', ['primeMeridian','equator','northArrow','scaleBar'], 'Longitude is measured east and west from the Prime Meridian.'),
        coordinate('Place a marker near the coordinate point shown on the grid.', {x:.62,y:.58}, .08, 'Coordinate points combine x/y map position or longitude/latitude.', 'Tap near the highlighted coordinate point on the map.'),
        choice('Which GIS layer type is best for city points?', 'Point layer', ['Point layer','Raster only','Line layer only','Compass layer'], 'Cities are often represented as points in GIS.'),
        choice('Which GIS layer type is best for rivers?', 'Line layer', ['Point layer','Line layer','Legend layer','Label only'], 'Rivers are usually represented as lines.')
      ]
    },
    {
      title:'Grand Africa Challenge',
      badge:'Map Master Badge',
      map:'africa',
      bg:'final',
      objective:'Complete a mixed final trial covering Africa geography and GIS.',
      skill:'Mixed geography mastery.',
      rounds:[
        tap('Final Trial: Tap Africa’s largest hot desert.', 'sahara', 'africa', ['sahara','kalahari','namib','lakeVictoria'], 'The Sahara is the largest hot desert.'),
        tap('Final Trial: Tap Nigeria.', 'nigeria', 'africa', ['nigeria','ghana','kenya','egypt'], 'Nigeria is in West Africa.'),
        choice('Which country has Nairobi as its capital?', 'Kenya', ['Egypt','Kenya','Morocco','Ghana'], 'Nairobi is the capital of Kenya.'),
        route('Final Trial: Follow Lake Victoria → Nile River → Egypt.', ['lakeVictoria','nile','egypt'], 'africa', 'This sequence follows the Nile system northwards.'),
        choice('Which map element explains symbols?', 'Legend', ['Legend','Scale Bar','North Arrow','Grid Line'], 'A legend explains symbols and colours.'),
        tap('Final Trial: Tap South Africa.', 'southAfrica', 'africa', ['southAfrica','madagascar','drc','egypt'], 'South Africa lies at the southern tip of Africa.')
      ]
    }
  ];

  const state = {
    started:false,
    paused:false,
    muted:false,
    score:0,
    lives:3,
    streak:0,
    stars:0,
    missionIndex:0,
    roundIndex:0,
    unlockedBadges:[],
    particles:[],
    selectedRoute:[],
    message:'',
    messageTime:0,
    best:Number(localStorage.getItem(BEST_KEY) || 0),
    time:0,
    answeredThisRound:false
  };

  const images = {};
  let canvasRect = {x:0,y:0,w:1,h:1};
  let last = performance.now();
  let AC = null, master = null, musicTimer = null;

  function currentMission(){ return MISSIONS[state.missionIndex] || MISSIONS[0]; }
  function currentRound(){ return currentMission().rounds[state.roundIndex] || currentMission().rounds[0]; }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

  function loadImages(){
    const paths = new Set([ASSETS.pin, ASSETS.compass, ASSETS.passport, ASSETS.trophy, ASSETS.badgeMaster, ...ASSETS.badges]);
    Object.values(ASSETS.backgrounds).forEach(p => paths.add(p));
    return Promise.all([...paths].map(src => new Promise(resolve => {
      const img = new Image();
      images[src] = img;
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    })));
  }

  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    canvasRect = {x:0, y:0, w:rect.width, h:rect.height};
  }

  function getW(){ return canvas.getBoundingClientRect().width || 960; }
  function getH(){ return canvas.getBoundingClientRect().height || 540; }

  function mapArea(){
    const w = getW(), h = getH();
    return {
      x: Math.round(w * .07),
      y: Math.round(h * .13),
      w: Math.round(w * .86),
      h: Math.round(h * .72)
    };
  }

  function toScreen(point){
    const area = mapArea();
    return {
      x: area.x + point.x * area.w,
      y: area.y + point.y * area.h
    };
  }

  function groupHotspots(group){ return HOTSPOTS[group] || HOTSPOTS.africa; }

  function draw(){
    const w = getW(), h = getH();
    const mission = currentMission();
    const round = currentRound();
    const bgPath = ASSETS.backgrounds[mission.bg] || ASSETS.backgrounds.africaPolitical;
    const bg = images[bgPath];

    if (bg && bg.naturalWidth) {
      const ratio = Math.max(w/bg.naturalWidth, h/bg.naturalHeight);
      const dw = bg.naturalWidth * ratio, dh = bg.naturalHeight * ratio;
      ctx.drawImage(bg, (w-dw)/2, (h-dh)/2, dw, dh);
    } else {
      ctx.fillStyle = '#07111f';
      ctx.fillRect(0,0,w,h);
    }

    drawAtmosphere();
    drawMapFrame();
    drawHotspots();
    drawRoute();
    drawCompass();
    drawParticles();
    drawMissionHud();
  }

  function drawAtmosphere(){
    const w = getW(), h = getH();
    ctx.save();
    // drifting clouds
    for (let i=0; i<8; i++){
      const x = ((i*190 + state.time*(10+i*2)) % (w+220)) - 110;
      const y = 35 + (i%4)*44 + Math.sin(state.time*.45+i)*9;
      ctx.globalAlpha = .10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, y, 70, 20, 0, 0, Math.PI*2);
      ctx.ellipse(x+38, y+5, 58, 18, 0, 0, Math.PI*2);
      ctx.fill();
    }
    // subtle grid sweep
    ctx.globalAlpha = .10;
    ctx.strokeStyle = '#6cf0a7';
    ctx.lineWidth = 1;
    const offset = (state.time*32) % 70;
    for (let x=-70+offset; x<w; x+=70) ctx.strokeRect(x,0,1,h);
    ctx.restore();
  }

  function drawMapFrame(){
    const a = mapArea();
    ctx.save();
    ctx.fillStyle = 'rgba(2,10,18,.35)';
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 2;
    roundRect(a.x, a.y, a.w, a.h, 26);
    ctx.fill();
    ctx.stroke();

    // latitude/longitude hints
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.lineWidth = 1;
    for (let i=1;i<5;i++){
      ctx.beginPath();
      ctx.moveTo(a.x, a.y + a.h*i/5);
      ctx.lineTo(a.x+a.w, a.y+a.h*i/5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(a.x + a.w*i/5, a.y);
      ctx.lineTo(a.x+a.w*i/5, a.y+a.h);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHotspots(){
    const round = currentRound();
    if (!['tap','route','coordinate'].includes(round.type)) return;
    if (round.type === 'coordinate') {
      const target = toScreen(round.target);
      ctx.save();
      ctx.strokeStyle = 'rgba(255,207,90,.60)';
      ctx.setLineDash([8,8]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(target.x, target.y, Math.max(22, getW()*round.tolerance*.55), 0, Math.PI*2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }

    const spots = groupHotspots(round.group);
    const keys = round.type === 'route' ? round.routeKeys : round.keys;
    keys.forEach((key, idx) => {
      const p = spots[key];
      if (!p) return;
      const s = toScreen(p);
      const pulse = Math.sin(state.time*4 + idx)*4;
      const isDone = state.selectedRoute.includes(key);
      ctx.save();
      ctx.globalAlpha = isDone ? .38 : .95;
      ctx.fillStyle = isDone ? 'rgba(108,240,167,.45)' : 'rgba(255,207,90,.28)';
      ctx.strokeStyle = isDone ? '#6cf0a7' : '#ffcf5a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 17 + pulse, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();

      const pin = images[ASSETS.pin];
      if (pin && pin.naturalWidth) {
        ctx.drawImage(pin, s.x-18, s.y-48-pulse*.3, 36, 46);
      }
      ctx.fillStyle = 'rgba(2,10,18,.76)';
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      roundRect(s.x-54, s.y+22, 108, 22, 11);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f4fff8';
      ctx.font = '800 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, s.x, s.y+37);
      ctx.restore();
    });
  }

  function drawRoute(){
    const round = currentRound();
    if (round.type !== 'route' || state.selectedRoute.length < 1) return;
    const spots = groupHotspots(round.group);
    ctx.save();
    ctx.strokeStyle = '#6cf0a7';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#6cf0a7';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    state.selectedRoute.forEach((key, i) => {
      const p = toScreen(spots[key]);
      if (i === 0) ctx.moveTo(p.x,p.y);
      else ctx.lineTo(p.x,p.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawCompass(){
    const img = images[ASSETS.compass];
    const size = Math.max(54, Math.min(92, getW()*0.07));
    const x = getW() - size - 22, y = 22;
    ctx.save();
    ctx.translate(x+size/2,y+size/2);
    ctx.rotate(Math.sin(state.time*.8)*.08);
    if (img && img.naturalWidth) ctx.drawImage(img, -size/2, -size/2, size, size);
    ctx.restore();
  }

  function drawMissionHud(){
    const w = getW();
    ctx.save();
    ctx.fillStyle = 'rgba(2,10,18,.68)';
    ctx.strokeStyle = 'rgba(255,207,90,.24)';
    roundRect(18, 18, Math.min(620, w-130), 72, 20);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffcf5a';
    ctx.font = '900 14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`MISSION ${state.missionIndex+1} / ${MISSIONS.length}`, 40, 44);
    ctx.fillStyle = '#f4fff8';
    ctx.font = '1000 25px system-ui';
    ctx.fillText(currentMission().title, 40, 72);
    ctx.restore();
  }

  function drawParticles(){
    ctx.save();
    state.particles.forEach(p => {
      ctx.globalAlpha = clamp(p.life/p.ttl, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.vy += .06;
      p.life -= 1;
    });
    state.particles = state.particles.filter(p => p.life > 0);
    ctx.restore();
  }

  function roundRect(x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function startGame(){
    state.started = true;
    state.paused = false;
    ui.overlay.classList.remove('active');
    resetMissionState();
    startMusic();
    syncUI();
    toast('Mission started: ' + currentMission().title);
  }

  function resetMissionState(){
    state.score = 0;
    state.lives = 3;
    state.streak = 0;
    state.stars = 0;
    state.missionIndex = 0;
    state.roundIndex = 0;
    state.unlockedBadges = [];
    state.selectedRoute = [];
    state.answeredThisRound = false;
  }

  function answer(correct, fact){
    if (state.answeredThisRound) return;
    state.answeredThisRound = true;
    if (correct) {
      const streakBonus = Math.min(200, state.streak*15);
      const earned = 100 + streakBonus;
      state.score += earned;
      state.streak++;
      makeParticles('#6cf0a7');
      toast(`Correct! +${earned}. ${fact || ''}`, 'ok');
      sfx('good');
      setTimeout(nextRound, 700);
    } else {
      state.lives--;
      state.streak = 0;
      makeParticles('#ff6b75');
      toast(`Not quite. ${fact || 'Try the location clue.'}`, 'bad');
      sfx('bad');
      if (state.lives <= 0) setTimeout(gameOver, 800);
      else setTimeout(() => { state.answeredThisRound = false; syncUI(); }, 650);
    }
    syncUI();
    postScore('live');
  }

  function nextRound(){
    state.roundIndex++;
    state.selectedRoute = [];
    state.answeredThisRound = false;
    if (state.roundIndex >= currentMission().rounds.length) {
      completeMission();
    } else {
      syncUI();
    }
  }

  function completeMission(){
    const perfect = state.lives >= 3;
    const starEarn = perfect ? 3 : state.lives === 2 ? 2 : 1;
    state.stars += starEarn;
    const mission = currentMission();
    if (!state.unlockedBadges.includes(state.missionIndex)) state.unlockedBadges.push(state.missionIndex);
    state.score += 350 + starEarn * 150;
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(BEST_KEY, String(state.best));
    sfx('level');
    toast(`Badge unlocked: ${mission.badge} • ${starEarn} star(s)`, 'ok');

    if (state.missionIndex >= MISSIONS.length - 1) {
      setTimeout(victory, 900);
      syncUI();
      return;
    }

    state.missionIndex++;
    state.roundIndex = 0;
    state.lives = 3;
    state.streak = 0;
    state.selectedRoute = [];
    state.answeredThisRound = false;
    setTimeout(() => {
      showOverlay(`Mission Complete`, `${mission.badge} earned. Next mission: ${currentMission().title}`, 'Continue');
      syncUI();
    }, 800);
  }

  function gameOver(){
    state.paused = true;
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(BEST_KEY, String(state.best));
    showOverlay('Expedition Paused', `You ran out of lives. Score: ${state.score}. Restart the expedition and try again.`, 'Restart');
    postScore('game_over');
  }

  function victory(){
    state.paused = true;
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(BEST_KEY, String(state.best));
    showOverlay('Map Master Africa!', `Final score: ${state.score}. You completed all explorer missions and earned your Map Master badge.`, 'Play Again');
    postScore('game_won');
  }

  function showOverlay(title, text, buttonText){
    ui.overlayTitle.textContent = title;
    ui.overlayText.textContent = text;
    ui.startBtn.textContent = buttonText;
    ui.overlay.classList.add('active');
  }

  function handleCanvasClick(ev){
    if (!state.started || state.paused || state.answeredThisRound) return;
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
    const round = currentRound();

    if (round.type === 'tap') {
      const nearest = nearestHotspot(round.group, round.keys, x, y);
      if (!nearest || nearest.dist > Math.max(44, Math.min(getW(),getH())*.07)) {
        toast('Tap closer to one of the glowing map pins.', 'warn');
        return;
      }
      answer(nearest.key === round.correct, nearest.key === round.correct ? round.fact : `That was ${nearest.label}. Try again.`);
      return;
    }

    if (round.type === 'route') {
      const expected = round.routeKeys[state.selectedRoute.length];
      const nearest = nearestHotspot(round.group, round.routeKeys, x, y);
      if (!nearest || nearest.dist > Math.max(44, Math.min(getW(),getH())*.07)) {
        toast('Tap the next route marker.', 'warn');
        return;
      }
      if (nearest.key === expected) {
        state.selectedRoute.push(nearest.key);
        makeParticles('#ffcf5a', x, y, 16);
        sfx('good');
        if (state.selectedRoute.length === round.routeKeys.length) {
          answer(true, round.fact);
        } else {
          toast(`Route point ${state.selectedRoute.length}/${round.routeKeys.length}: ${nearest.label}`, 'ok');
        }
        syncUI();
      } else {
        answer(false, `Route order matters. Next expected point is ${groupHotspots(round.group)[expected].label}.`);
      }
      return;
    }

    if (round.type === 'coordinate') {
      const target = toScreen(round.target);
      const dist = Math.hypot(x-target.x, y-target.y);
      const allowed = Math.max(36, Math.min(getW(),getH())*round.tolerance);
      answer(dist <= allowed, dist <= allowed ? round.fact : 'The coordinate point is closer to the highlighted grid area.');
    }
  }

  function nearestHotspot(group, keys, x, y){
    let best = null;
    const spots = groupHotspots(group);
    keys.forEach(key => {
      const p = spots[key];
      if (!p) return;
      const s = toScreen(p);
      const dist = Math.hypot(x-s.x, y-s.y);
      if (!best || dist < best.dist) best = {key, label:p.label, dist};
    });
    return best;
  }

  function makeParticles(color, x, y, n=24){
    const pos = x !== undefined ? {x,y} : {x:getW()/2, y:getH()/2};
    for (let i=0; i<n; i++){
      state.particles.push({
        x: pos.x + (Math.random()*50-25),
        y: pos.y + (Math.random()*50-25),
        vx: Math.random()*5-2.5,
        vy: Math.random()*-5-1,
        r: Math.random()*4+2,
        color,
        life: 35 + Math.random()*20,
        ttl: 55
      });
    }
  }

  function toast(msg, type=''){
    ui.toast.textContent = msg;
    ui.toast.className = 'toast show';
    if (type) ui.toast.classList.add(type);
    clearTimeout(toast._t);
    toast._t = setTimeout(() => ui.toast.classList.remove('show'), 2400);
  }

  function syncUI(){
    const mission = currentMission();
    const round = currentRound();
    ui.scoreValue.textContent = Math.floor(state.score);
    ui.livesValue.textContent = state.lives;
    ui.streakValue.textContent = state.streak;
    ui.starsValue.textContent = state.stars;
    ui.bestValue.textContent = state.best;
    ui.missionNumber.textContent = `${state.missionIndex+1} / ${MISSIONS.length}`;
    ui.missionTitle.textContent = mission.title;
    ui.missionText.textContent = mission.objective;
    const pct = Math.round((state.roundIndex / mission.rounds.length) * 100);
    ui.missionPct.textContent = `${pct}%`;
    ui.missionFill.style.width = `${pct}%`;
    ui.missionMode.textContent = round.type.toUpperCase();
    ui.questionText.textContent = round.question;
    ui.questionType.textContent = mission.skill;
    renderChoices(round);
    renderBadges();
    ui.muteBtn.textContent = state.muted ? 'Sound Off' : 'Sound On';
    ui.pauseBtn.textContent = state.paused && state.started ? 'Resume' : 'Pause';
  }

  function renderChoices(round){
    ui.choiceList.innerHTML = '';
    if (round.type !== 'choice') return;
    round.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.addEventListener('click', () => answer(opt === round.correct, opt === round.correct ? round.fact : `Correct answer: ${round.correct}.`));
      ui.choiceList.appendChild(btn);
    });
  }

  function renderBadges(){
    ui.badgeGrid.innerHTML = '';
    ui.badgeCount.textContent = `${state.unlockedBadges.length}`;
    ui.passportText.textContent = state.unlockedBadges.length ? `${state.unlockedBadges.length} badge(s) unlocked. Keep exploring.` : 'Complete missions to unlock badges.';
    ASSETS.badges.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'badge';
      if (state.unlockedBadges.includes(i) || (i === ASSETS.badges.length-1 && state.unlockedBadges.length >= MISSIONS.length)) div.classList.add('unlocked');
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      div.appendChild(img);
      ui.badgeGrid.appendChild(div);
    });
  }

  function hint(){
    const r = currentRound();
    toast(r.hint || 'Use map position, direction and the glowing hints.', 'warn');
  }

  function skip(){
    if (!state.started || state.paused) return;
    state.score = Math.max(0, state.score - 50);
    state.streak = 0;
    toast('Task skipped. -50 points.', 'warn');
    nextRound();
  }

  function showMissionMap(){
    const list = MISSIONS.map((m,i) => `${i+1}. ${m.title}`).join(' • ');
    toast(list, 'ok');
  }

  function restart(){
    state.started = true;
    state.paused = false;
    resetMissionState();
    ui.overlay.classList.remove('active');
    syncUI();
    toast('Expedition restarted.');
    postScore('restart');
  }

  function postScore(mode='live'){
    const payload = { gameSlug: GAME_SLUG, slug: GAME_SLUG, score: Math.floor(state.score), best: state.best, level: state.missionIndex+1, mode };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(payload.score, {gameSlug:GAME_SLUG}); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(payload.score, {gameSlug:GAME_SLUG}); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({type:'GG_SCORE', ...payload, payload}, '*'); } catch {}
    try { window.parent?.postMessage?.({type:'gg:score', ...payload, payload}, '*'); } catch {}
  }

  // Audio
  function ensureAudio(){
    if (state.muted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!window.__mmaAudio) {
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = .12;
      master.connect(AC.destination);
      window.__mmaAudio = {AC, master};
    } else {
      AC = window.__mmaAudio.AC;
      master = window.__mmaAudio.master;
    }
    if (AC.state === 'suspended') AC.resume().catch(()=>{});
    return AC;
  }

  function tone(freq, dur=.08, type='sine', gain=.04, delay=0){
    const ac = ensureAudio();
    if (!ac) return;
    const t = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(gain,t+.015);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t+dur+.04);
  }

  function sfx(kind){
    if (kind === 'good') { tone(540,.06,'triangle',.045); tone(820,.08,'sine',.03,.05); }
    if (kind === 'bad') tone(150,.14,'sawtooth',.04);
    if (kind === 'level') { tone(392,.08,'triangle',.05); tone(554,.10,'triangle',.04,.08); tone(784,.14,'sine',.03,.18); }
  }

  function startMusic(){
    if (state.muted || musicTimer) return;
    let step = 0;
    const notes = [196,247,294,330,392,330,294,247,220,262,330,392];
    musicTimer = setInterval(() => {
      if (!state.started || state.paused || state.muted || document.hidden) return;
      const n = notes[step++ % notes.length];
      tone(n,.08,'triangle',.008);
      if (step % 2 === 0) tone(n/2,.13,'sine',.005,.03);
    }, 285);
  }

  function stopMusic(){
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  function bind(){
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 150));
    if (window.ResizeObserver) new ResizeObserver(resizeCanvas).observe(canvas.parentElement);

    canvas.addEventListener('pointerdown', handleCanvasClick);

    ui.startBtn.addEventListener('click', () => {
      if (!state.started || state.paused && ui.startBtn.textContent.toLowerCase().includes('restart')) restart();
      else {
        state.paused = false;
        ui.overlay.classList.remove('active');
        syncUI();
      }
      if (!state.started) startGame();
    });
    ui.helpBtn.addEventListener('click', () => {
      ui.overlayTitle.textContent = 'How to Play';
      ui.overlayText.textContent = 'Complete each mission by tapping glowing map pins, choosing correct answers, tracing routes in order, and placing coordinate markers. Earn badges in your explorer passport.';
      ui.startBtn.textContent = state.started ? 'Continue' : 'Start Expedition';
    });
    ui.pauseBtn.addEventListener('click', () => {
      if (!state.started) return;
      state.paused = !state.paused;
      if (state.paused) {
        showOverlay('Paused', 'Your expedition is paused.', 'Continue');
      } else ui.overlay.classList.remove('active');
      syncUI();
    });
    ui.hintBtn.addEventListener('click', hint);
    ui.skipBtn.addEventListener('click', skip);
    ui.mapBtn.addEventListener('click', showMissionMap);
    ui.restartBtn.addEventListener('click', restart);
    ui.submitBtn.addEventListener('click', () => postScore('manual_submit'));
    ui.muteBtn.addEventListener('click', () => {
      state.muted = !state.muted;
      if (state.muted) stopMusic(); else startMusic();
      syncUI();
    });

    window.addEventListener('message', ev => {
      const data = ev.data || {};
      const type = data.type || data.event;
      if (type === 'GG_RESTART') restart();
      if (type === 'GG_MUTE') {
        state.muted = !!(data.payload?.muted ?? data.muted);
        if (state.muted) stopMusic(); else startMusic();
        syncUI();
      }
      if (type === 'GG_PAUSE') {
        state.paused = !!(data.payload?.paused ?? data.paused);
        syncUI();
      }
    });
  }

  function loop(now){
    const dt = Math.min(.05, Math.max(.001, (now-last)/1000));
    last = now;
    if (state.started && !state.paused) state.time += dt;
    draw();
    requestAnimationFrame(loop);
  }

  loadImages().then(() => {
    resizeCanvas();
    bind();
    syncUI();
    requestAnimationFrame(loop);
  });
})();