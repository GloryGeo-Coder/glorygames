/** Solar prism beams: fair, visible warnings before damaging ground pulses. */
import {floorAt} from './world-logic.mjs';
export const SOLAR_HAZARDS = Object.freeze([
  {id:'terrace-prism',name:'Sun Terrace prism',x:-9.0,y:1.0,radius:1.38},
  {id:'bridge-lens',name:'Bridge sunlight lens',x:-2.0,y:4.0,radius:1.26},
  {id:'courtyard-ray',name:'Solar Courtyard beacon',x:0.7,y:13.9,radius:1.48},
]);
export const HAZARD_WARNING_SECONDS = 1.65;
export const HAZARD_RECOVERY_SECONDS = 2.2;
export const HAZARD_REARM_SECONDS = 3.2;
export const HAZARD_TRIGGER_RANGE = 4.6;
export function createHazardStates() {
  return SOLAR_HAZARDS.map((h,i)=>({...h,h:floorAt(h.x,h.y)?.height??0,
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
export function solarPulseHits(player,hazard) {
  return Boolean(player?.grounded) &&
    Math.abs(player.h-hazard.h)<1.1 &&
    Math.hypot(player.x-hazard.x,player.y-hazard.y)<=hazard.radius;
}
