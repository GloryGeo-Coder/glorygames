/** Timed lightning vents: triggered near players, with a full wind-up window. */
import {floorAt} from './world-logic.mjs';
export const STORM_HAZARDS = Object.freeze([
  {id:'spire-rod',name:'Spire lightning rod',x:-3.6,y:-4.4,radius:1.45},
  {id:'sky-bridge',name:'Bridge charge',x:0.15,y:2.5,radius:1.20},
  {id:'arena-flank',name:'Citadel conductor',x:0.0,y:13.2,radius:1.55},
]);
export const HAZARD_WARNING_SECONDS = 1.5;
export const HAZARD_RECOVERY_SECONDS = 2.0;
export const HAZARD_REARM_SECONDS = 3.0;
export const HAZARD_TRIGGER_RANGE = 4.7;
export function createHazardStates() {
  return STORM_HAZARDS.map((h,i)=>({...h,h:floorAt(h.x,h.y)?.height??0,
    mode:'idle',timer:i*.65,casts:0}));
}
/** Advance one hazard. Return {type:'warn'|'strike', hazard} when event occurs. */
export function stepHazard(hazard,dt,player,enabled=true) {
  if (!enabled || !hazard) return [];
  const seconds=Math.min(.1,Math.max(0,dt));
  hazard.timer=Math.max(0,hazard.timer-seconds);
  if(hazard.timer>0)return [];
  if(hazard.mode==='windup'){
    hazard.mode='recovery';hazard.timer=HAZARD_RECOVERY_SECONDS;
    hazard.casts++;
    return [{type:'strike',hazard}];
  }
  if(hazard.mode==='recovery'){
    hazard.mode='idle';hazard.timer=HAZARD_REARM_SECONDS;
    return [];
  }
  if(!player || Math.hypot(player.x-hazard.x,player.y-hazard.y)>HAZARD_TRIGGER_RANGE){
    return [];
  }
  hazard.mode='windup';hazard.timer=HAZARD_WARNING_SECONDS;
  return [{type:'warn',hazard}];
}
export function lightningHits(player,hazard) {
  return Boolean(player?.grounded) &&
    Math.abs(player.h-hazard.h)<1.1 &&
    Math.hypot(player.x-hazard.x,player.y-hazard.y)<=hazard.radius;
}
