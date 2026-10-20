/* Authored activities. Curriculum references identify scope, not departmental endorsement. */
(function(root){
 'use strict';
 const sources={
  ip:'https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20IP%20%20SOCIAL%20SCIENCES%20%20WEB.pdf',
  sp:'https://www.education.gov.za/LinkClick.aspx?fileticket=6jpCz5DCZ08%3D&mid=1629&portalid=0&tabid=573',
  fet:'https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20GEOGRAPHY%20_%20GR%2010-12%20_%20WEB_C9A9.pdf'
 };
 const places=[
  {id:'park',name:'Park',cell:'A1',symbol:'tree',description:'A tree symbol marks the public park.'},
  {id:'clinic',name:'Clinic',cell:'C2',symbol:'cross',description:'A cross symbol marks the clinic.'},
  {id:'lake',name:'Lake',cell:'E2',symbol:'water',description:'A blue wave symbol marks the lake.'},
  {id:'school',name:'School',cell:'B3',symbol:'school',description:'A book symbol marks the school.'},
  {id:'market',name:'Market',cell:'D4',symbol:'market',description:'A striped stall symbol marks the market.'},
  {id:'station',name:'Station',cell:'A5',symbol:'train',description:'A train symbol marks the station.'}
 ];
 const choice=(id,prompt,answer,options,explanation,hint,extra={})=>({id,type:'choice',prompt,answer,options:options.map(v=>({id:v,label:v})),explanation,hint,...extra});
 const pick=(id,prompt,answer,explanation,hint,extra={})=>({id,type:'cell',prompt,answer,explanation,hint,...extra});
 const route=(id,prompt,cells,explanation,hint)=>({id,type:'route',prompt,answer:cells,explanation,hint});
 const missions=[
  {id:'symbols',title:'The Missing Map Key',skill:'Symbols and legends',grade:4,term:2,source:'ip',scope:'CAPS map skills; original practice-town activities',context:'town',badge:'Key Keeper',colour:'#e9ad44',brief:'Your mapping team has a town plan with no key. Match each symbol to its place, then use the key to deliver a health pack.',lesson:'A map is a view from above. Its key explains what each symbol means. This practice town is fictional; north is at the top.',questions:[
   choice('s1','Which place does the cross symbol in C2 represent?','Clinic',['Clinic','Market','Station','Park'],'The cross in the key represents the clinic. A symbol stands for a real feature.','Find the cross in the map key.',{highlight:'C2'}),
   pick('s2','Tap the school, marked by the book symbol.','B3','The book symbol marks the school in B3. Symbols and their key must agree.','Look for the open-book shape.',{place:'school'}),
   choice('s3','What is the purpose of a map key?','Explain symbols',['Explain symbols','Show the date','Count houses','Measure rainfall'],'A map key, also called a legend, explains the meaning of symbols.','The key links a picture to its meaning.'),
   pick('s4','Find the public park using the tree symbol.','A1','The tree symbol represents the park in A1. Map symbols simplify real objects.','The park is in the top-left grid square.',{place:'park'}),
   pick('s5','Where would you go to catch a train? Tap its symbol.','A5','The train symbol marks the station. A key helps you identify services.','Look at the bottom-left square.',{place:'station'}),
   pick('s6','Deliver the health pack to the clinic.','C2','You used the key to find the clinic in C2. The town atlas now has a working legend.','Use the cross symbol.',{place:'clinic'})
  ]},
  {id:'directions',title:'The Compass Courier',skill:'Compass directions',grade:4,term:2,source:'ip',scope:'CAPS four-point compass directions',context:'town',badge:'Compass Courier',colour:'#55c5d8',brief:'A courier needs clear directions. Use the north arrow to guide deliveries around the town.',lesson:'On this north-up map, north is up, east is right, south is down and west is left. Directions compare one place with another.',questions:[
   choice('d1','Which direction is at the top of this map?','North',['North','East','South','West'],'The north arrow points to the top of this map.','Check the arrow marked N.'),
   choice('d2','From the clinic in C2, the lake in E2 is in which direction?','East',['North','East','South','West'],'C2 and E2 share a row. Moving right is east.','Follow row 2 from C towards E.',{highlight:'C2',destination:'E2'}),
   choice('d3','From the park in A1, the station in A5 is in which direction?','South',['North','East','South','West'],'The station is below the park in the same column. That is south.','Move down column A.',{highlight:'A1',destination:'A5'}),
   choice('d4','From the lake in E2, travel west. Which service do you reach in C2?','Clinic',['Clinic','School','Market','Station'],'Travelling west along row 2 takes you from the lake to the clinic.','Move left from E2.',{highlight:'E2'}),
   choice('d5','A courier moves from B3 to B2. Which direction is this?','North',['North','East','South','West'],'The row number decreases as you move up this grid. Up is north.','Compare rows 3 and 2.',{highlight:'B3',destination:'B2'}),
   choice('d6','To return from the clinic in C2 to the lake in E2, go…','East',['North','East','South','West'],'East is right on this north-up town plan. You can now give reliable four-point directions.','Use the north arrow, then find the right-hand direction.',{highlight:'C2',destination:'E2'})
  ]},
  {id:'grids',title:'Grid Detectives',skill:'Alphanumeric grid references',grade:4,term:2,source:'ip',scope:'CAPS alphanumeric grid references',context:'town',badge:'Grid Detective',colour:'#b199df',brief:'The team is recording services for a new community atlas. Give each place a reliable grid reference.',lesson:'Read the column letter first, then the row number. A1 is the top-left square. Grid references identify squares, not latitude and longitude.',questions:[
   pick('g1','Tap D4 to place the market delivery marker.','D4','D is the fourth column; 4 is the fourth row. D4 contains the market.','Find column D, then follow it to row 4.'),
   choice('g2','What is the grid reference of the school?','B3',['B3','C2','D4','A5'],'The school lies in column B, row 3: B3.','Read the column letter before the row number.',{highlight:'B3'}),
   pick('g3','Place the water-testing marker in E2.','E2','Column E and row 2 meet at the lake.','E is the rightmost column; row 2 is near the top.'),
   choice('g4','Which reference identifies the station?','A5',['A5','E2','C2','A1'],'The station is in the first column and fifth row: A5.','It is at the bottom left.',{highlight:'A5'}),
   pick('g5','Record the clinic at C2. Tap the correct square.','C2','Column C and row 2 identify the clinic. This reference stays the same when the map is zoomed.','Find the middle column and second row.'),
   pick('g6','Finish the survey by marking the park in A1.','A1','A1 is the first column and first row. Your service locations now have consistent references.','Use the top-left square.')
  ]},
  {id:'routes',title:'The Community Supply Run',skill:'Routes and simple distance',grade:4,term:2,source:'ip',scope:'Grid/direction consolidation; 100-metre route distances are enrichment',context:'town',badge:'Route Planner',colour:'#72bb91',brief:'Plan safe supply runs through neighbouring grid squares. Every move between neighbouring square centres represents 100 metres in this fictional town.',lesson:'Build a route one square at a time, moving north, east, south or west. Diagonal moves are not allowed. Our practice-grid distances are not measurements from the world atlas.',questions:[
   route('r1','Tap this delivery route in order: B3 → C3 → C2.',['B3','C3','C2'],'From the school, go east to C3 and north to the clinic. Two 100 m moves make 200 m.','Start at the school; move right, then up.'),
   choice('r2','That route used two 100 m moves. How far was it?','200 m',['100 m','200 m','300 m','400 m'],'2 × 100 metres = 200 metres. Count moves, not visited squares.','Three visited squares contain two moves.'),
   route('r3','Continue to the lake: C2 → D2 → E2.',['C2','D2','E2'],'The clinic-to-lake route moves east twice and covers 200 m.','Stay on row 2 and move right.'),
   choice('r4','A route has four 100 m moves. What is its length?','400 m',['200 m','300 m','400 m','500 m'],'Four equal 100-metre moves make 400 metres. Measure the segments between square centres.','Count four equal 100 m segments.'),
   route('r5','Take the park survey route: A1 → A2 → B2 → C2.',['A1','A2','B2','C2'],'This route goes south once, then east twice. Three moves make 300 m.','Start at the park, move down, then right twice.'),
   choice('r6','Which directions did that park-to-clinic route use?','South, then east',['South, then east','North, then west','East, then north','West, then south'],'A1 to A2 is south. A2 through B2 to C2 is east. Your route combines a grid, directions and distance.','Trace each segment while checking the north arrow.')
  ]},
  {id:'world',title:'Your First World Expedition',skill:'World-map orientation',grade:4,term:2,source:'ip',scope:'CAPS world-map orientation; country finding and hemispheres are supported enrichment',context:'world',badge:'World Explorer',colour:'#e2a96c',brief:'The community atlas is ready to connect with the wider world. Visit South Africa, Brazil and Japan and discover their continents.',lesson:'This is a world overview drawn from geographic data. Tap a country boundary, or use Find and the country list. North is up. The Equator separates the Northern and Southern hemispheres. You can browse all regions in Explore.',questions:[
   {id:'w1',type:'country',prompt:'Find South Africa. Tap its actual outline on the world map.',answer:'ZAF',region:'Africa',hint:'South Africa is at the southern end of mainland Africa. Find can help you zoom to it.',explanation:'South Africa is a country at the southern end of mainland Africa. Africa is its continent.'},
   choice('w2','Which continent is South Africa part of?','Africa',['Africa','Asia','Europe','South America'],'South Africa is a country on the continent of Africa. Country and continent are different geographic ideas.','Look at the region highlighted around South Africa.',{focus:'ZAF'}),
   {id:'w3',type:'country',prompt:'Find Brazil on the South American mainland.',answer:'BRA',region:'South America',hint:'Brazil is the large country in the eastern part of South America. Use Find for a closer view.',explanation:'Brazil is in South America. The Atlantic Ocean lies along its eastern coastline.'},
   choice('w4','Which continent contains Brazil?','South America',['South America','Africa','North America','Europe'],'Brazil is part of South America. The Americas contain two continents: North America and South America.','Recall the map region you just visited.',{focus:'BRA'}),
   {id:'w5',type:'country',prompt:'Find Japan, an island country east of the Asian mainland.',answer:'JPN',region:'Asia',hint:'Look east of China and the Korean Peninsula. Find can zoom to the islands.',explanation:'Japan is an island country east of the Asian mainland. It lies in Asia and the Northern Hemisphere.'},
   choice('w6','Japan is north of the Equator. Which hemisphere is it in?','Northern Hemisphere',['Northern Hemisphere','Southern Hemisphere'],'Places north of the Equator are in the Northern Hemisphere. Keep exploring the world to practise your new atlas skills.','The Equator is 0° latitude.',{focus:'JPN'})
  ]}
 ];
 const roadmap=[
  {grade:4,topics:['Settlements','Symbols and keys','Grids and compass directions','South Africa and world orientation','Food and farming','Water'],source:'ip'},
  {grade:5,topics:['Africa map skills','South African landforms','Weather, climate and vegetation','Minerals and mining'],source:'ip'},
  {grade:6,topics:['World map skills, latitude and longitude','Trade','World climate and vegetation','Population and settlement location'],source:'ip'},
  {grade:7,topics:['Local maps and scale','Earthquakes, volcanoes and floods','Population growth and change','Natural resources and conservation'],source:'sp'},
  {grade:8,topics:['Maps and globes','Climate regions','Settlement','Transport and trade'],source:'sp'},
  {grade:9,topics:['Topographic and orthophoto maps','Development','Surface processes','Resource use and sustainability'],source:'sp'},
  {grade:10,topics:['Coordinates in degrees, minutes and seconds; scale','1:50,000 topographic maps, bearings, contours and simple cross-sections','Aerial and orthophoto interpretation','GIS, remote sensing and fieldwork','The atmosphere and synoptic maps','Geomorphology and tectonics','Population','Water resources'],source:'fet'}
 ];
 const expansion=typeof module==='object'&&module.exports?require('./academy-expansion.js'):root.AcademyExpansion;
 if(!expansion)throw new Error('The Grade 4–5 activities could not load.');
 missions.push(...expansion.missions);
 const grade6=typeof module==='object'&&module.exports?require('./academy-grade6.js'):root.AcademyGrade6;
 if(!grade6)throw new Error('The Grade 6 activities could not load.');
 missions.push(...grade6.missions);
 const grade7=typeof module==='object'&&module.exports?require('./academy-grade7.js'):root.AcademyGrade7;
 if(!grade7)throw new Error('The Grade 7 activities could not load.');
 missions.push(...grade7.missions);
 const grade8=typeof module==='object'&&module.exports?require('./academy-grade8.js'):root.AcademyGrade8;
 if(!grade8)throw new Error('The Grade 8 activities could not load.');
 missions.push(...grade8.missions);
 const grade9=typeof module==='object'&&module.exports?require('./academy-grade9.js'):root.AcademyGrade9;
 if(!grade9)throw new Error('The Grade 9 activities could not load.');
 missions.push(...grade9.missions);
 for(const [i,m] of missions.entries()){
  m.topic=m.topic||'Map skills';m.objective=m.objective||m.skill;
  m.prerequisite=missions.slice(0,i).filter(p=>p.grade===m.grade).at(-1)?.id||null;
 }
 const api={sources,places,missions,roadmap,provinceNotes:expansion.provinceNotes,countryNotes:expansion.countryNotes};if(typeof module==='object'&&module.exports)module.exports=api;else root.AcademyContent=api;
})(typeof window!=='undefined'?window:globalThis);
