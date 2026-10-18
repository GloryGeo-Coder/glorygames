/* Authored route plans; emits the static JSON served by the game. No build step at runtime. */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../apps/web/public/games/kasi-quest/levels');
const {roles}=require('../apps/web/public/games/kasi-quest/kasi-enemies.js');
// Each district revisits the existing artwork with a new route, mission and guardian.
const plans = [
 ['Warm-Up Rooftops',1,'Lebo','Spaza Guard','taxi','Help the spaza auntie recover supplies along the rooftops.','terrace'],
 ['Taxi Rank Gaps',2,'Sipho','Rank Marshal','taxi','Recover taxi tokens and clear the rank for the evening commuters.','rank'],
 ['Rooftop Boosts',3,'Zinhle','Roof Sentry','airtime','Restore the neighbourhood airtime relay above the streets.','relay'],
 ['Market Street Run',4,'Auntie Nomsa','Market Enforcer','lunch','Bring lunch packs through the market and reopen its shutters.','market'],
 ['Rooftop Relay',5,'Lebo','Relay Keeper','badge','Carry street badges across the relay towers.','terrace'],
 ['Data Bundle Dash',6,'Ayanda','Signal Breaker','data','Return stolen data bundles and reconnect the block.','relay'],
 ['Tower Gate Trouble',7,'Sipho','Tower Watch','airtime','Open the tower switches while defending the repair route.','tower'],
 ['Final Boss Alley',8,'Thabo','Alley Overlord','badge','Break the alley blockade; a larger threat waits beyond the gate.','alley'],
 ['Morning Delivery',1,'Auntie Nomsa','Depot Defender','lunch','Deliver breakfast supplies before the neighbourhood wakes.','market'],
 ['Rank After Dark',2,'Sipho','Night Marshal','taxi','Recover the night-shift tokens from the drone patrols.','rank'],
 ['Solar Rooftops',3,'Zinhle','Solar Sentinel','airtime','Bring the solar relay back online across the upper roofs.','terrace'],
 ['Market Blackout',4,'Ayanda','Grid Warden','data','Carry backup data to the market and release its power locks.','market'],
 ['Skyline Crossing',5,'Lebo','Skyline Guardian','badge','Link the rooftop lookout posts and keep their runners safe.','tower'],
 ['Signal Under Siege',6,'Ayanda','Jammer Captain','data','Fight through the signal jammers with data for the repair crew.','relay'],
 ['Tower Rescue',7,'Zinhle','Rescue Blocker','lunch','Take emergency supplies past the tower defence patrol.','tower'],
 ['Alley Counterattack',8,'Thabo','Iron Lieutenant','badge','Push the bots out of the alley and reclaim its three gates.','alley'],
 ['Homeward Rooftops',1,'Auntie Nomsa','Rooftop Commander','lunch','Bring the recovered supplies home across the longest roof route.','terrace'],
 ['Last Taxi Home',2,'Sipho','Convoy Chief','taxi','Clear the final commuter route through the occupied rank.','rank'],
 ['The Relay Network',6,'Ayanda','Network General','data','Reconnect every relay before the showdown in the tower district.','relay'],
 ['Kasi United',8,'Thabo','The Iron King','badge','Unite the neighbourhoods, open the final locks and defeat the Iron King.','alley'],
];
function build(n) {
 const [name,background,npc,guardian,item,story,route]=plans[n-1];
 const sections=6+Math.floor((n-1)/4), width=sections*40+40;
 const d={meta:{name:`Level ${n} • ${name}`,background,district:route,timeLimit:260+sections*15+n*5,parTime:145+sections*8+n*3},tileSize:32,w:width,h:18,
 spawn:{x:2,y:13},exit:{x:width-5,y:13,w:1,h:2},solids:[],coins:[],collectibles:[],hazards:[],powerups:[],enemies:[],checkpoints:[],
 boss:{name:guardian,type:n===20 || n%4===0?'final':'mini',x:width-17,y:12,minX:width-27,maxX:width-8,hp:4+Math.floor(n/2),speed:85+n*3},
 npcs:[{name:npc,x:4,y:13,message:story,completeMessage:'Sharp! The route is clear. Head for the open gate.'}],obstacles:[],doors:[],switches:[]};
 for(let i=0;i<sections;i++) {
  const x=i*40, variant=(i+n)%4;
  d.solids.push({x,y:15,w:36,h:3}); // Four-tile gaps are traversable without upgrades.
  // Upper routes are optional, with steps never higher than three tiles.
  const raised=i>0 && (route==='tower'?i%2===0:variant!==2);
  d.solids.push({x:x+(i===0?6:10),y:12,w:5,h:1});
  if(raised) d.solids.push({x:x+18,y:9,w:5,h:1},{x:x+25,y:11,w:5,h:1});
  else if(i>0) d.solids.push({x:x+23,y:12,w:6,h:1});
  for(const offset of [6,10,18,24,30,34]) d.coins.push({x:x+offset,y:14});
  for(const [offset,y]of (i===0?[[7,11],[9,11],[22,14],[25,14]]:[[11,11],[13,11],[19,raised?8:11],[21,raised?8:11]])) d.coins.push({x:x+offset,y});
  d.collectibles.push({x:x+8,y:14,type:item},{x:x+33,y:14,type:['airtime','taxi','lunch','badge','data'][(i+n)%5]});
  if(raised) d.collectibles.push({x:x+20,y:8,type:item});
  // Ground patrol bounds never cross a gap, a checkpoint or the next section.
  d.enemies.push({type:i===0&&n===1?'patrol':'shooter',x:x+19,y:13.8,minX:x+18,maxX:x+22,speed:64+n*2,hp:n>12?2:1,dir:-1,fireInterval:Math.max(1.4,2.05-n*.025)});
  d.enemies.push({type:(i+n)%3===0?'chaser':'shooter',x:x+29,y:13.8,minX:x+27,maxX:x+31,speed:78+n*2,hp:n>16?2:1,dir:-1,fireInterval:Math.max(1.45,2.2-n*.025)});
  if(i%2===n%2 || n>=13) d.enemies.push({type:'drone',x:x+8,y:11.6-(i%2)*.5,minX:x+5,maxX:x+10,speed:48+n,hp:n>=15?2:1,dir:-1,fireInterval:Math.max(1.8,2.7-n*.035)});
  if(i>0 && i%2===0) d.checkpoints.push({x:x+3,y:13});
  if(i%2===1) d.powerups.push({x:x+5,y:14,type:i%3===0?'life':i%3===1?'shield':'rapidfire'});
  if(i%3===1) d.hazards.push({x:x+33,y:14.5,w:1,h:.5});
  if(i===0) d.obstacles.push({type:'taxi',x:x+24,y:14.05,w:2.5,h:.9,minX:x+19,maxX:x+30,speed:85+n*2});
  if(i===1) d.obstacles.push({type:'trampoline',x:x+10,y:14.65,w:1.4,h:.35});
  if(i===2) d.obstacles.push({type:'crate',x:x+26,y:3,w:1,h:1,triggerRadius:4,respawn:5});
  if(i===3) d.obstacles.push({type:'collapse',x:x+18,y:11,w:4,h:.55,delay:.65,respawn:3.3});
  if(i===4) d.obstacles.push({type:'movingPlatform',x:x+24,y:10.8,w:4,h:.55,minX:x+22,maxX:x+30,speed:48+n});
 }
 // Wide flat boss arena, with a recovery flag outside the guardian's patrol.
 d.solids.push({x:sections*40,y:15,w:40,h:3});
 d.checkpoints.push({x:sections*40+3,y:13});
 d.powerups.push({x:sections*40+6,y:14,type:'shield'});
 d.collectibles.push({x:width-33,y:14,type:item});
 d.coins.push({x:width-32,y:14},{x:width-30,y:14});
 const locks=n<4?0:n<10?1:n<16?2:3;
 for(let j=0;j<locks;j++) {
  const x=(j+1)*80-10,id=`route-${j+1}`;
  d.doors.push({id,x:x+4,y:12,w:1,h:3});
  // The same pressure switch can also be shot. It is always before its door.
  d.switches.push({id,x,y:14.45,w:.9,h:.55});
 }
 // Introduce one role at a time before mixing the full roster in the final act.
 const chooseRole=(i,slot)=>{
  if(n>=16)return slot===0?['warden','thrower','shooter','sprinter'][i%4]:['shooter','sprinter','ranger','thrower'][i%4];
  if(n>=12&&i===4&&slot===1)return 'ranger';
  if(n>=8&&i===3&&slot===0)return 'thrower';
  if(n>=5&&i===2&&slot===0)return 'warden';
  if(n>=2&&i%3===1&&slot===1)return 'sprinter';
  return null;
 };
 const ground=d.enemies.filter(e=>e.type!=='drone');
 for(let index=0;index<ground.length;index++){
  const en=ground[index],type=chooseRole(Math.floor(index/2),index%2);if(!type)continue;
  Object.assign(en,{type,hp:type==='sprinter'?(n>=14?2:1):type==='warden'?2:n>=17?3:2,
   speed:type==='sprinter'?100:type==='warden'?48:type==='thrower'?52:56});
 }
 if(n>=2){
  const introductions=Object.entries(roles).filter(([,r])=>r.firstLevel===n);
  const present=[...new Set(d.enemies.filter(e=>roles[e.type]).map(e=>e.type))];
  d.meta.encounterNote=introductions.length?introductions.map(([,r])=>`New rival: ${r.name}. ${r.tip}`).join(' '):
   `Rival patrol: ${present.map(type=>roles[type].name).join(', ')}. Watch their signals before attacking.`;
 }
 const coinsRequired=18+Math.floor(n*.8), collectiblesRequired=4+Math.floor(n/4),enemiesRequired=5+Math.floor(n*.55);
 d.objective={coinsRequired,collectiblesRequired,enemiesRequired,bossRequired:true,switchesRequired:locks,
 message:`${story} Collect ${coinsRequired} coins and ${collectiblesRequired} kasi items, defeat ${enemiesRequired} ${n===1?'bots':'opponents'}${locks?`, open ${locks} route locks`:''}, then beat ${guardian}.`};
 return d;
}
if(require.main===module) for(let n=1;n<=plans.length;n++) fs.writeFileSync(path.join(root,`level-${String(n).padStart(2,'0')}.json`),JSON.stringify(build(n),null,2)+'\n');
module.exports={build,plans};
