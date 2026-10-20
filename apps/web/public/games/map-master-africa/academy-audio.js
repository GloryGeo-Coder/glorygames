/* Original quiet expedition arpeggios and feedback cues, scheduled only during active play. */
(function(root){
 'use strict';
 function create(env=root){let ctx,master,music,effects,active=false,muted=false,next=0,beat=0,level=0,mv=.35,ev=.7;const voices=new Set();
  function stop(){active=false;for(const v of [...voices])v.stop();}
  function configure(p={}){if('muted'in p)muted=!!p.muted;if(Number.isFinite(p.musicVolume))mv=Math.max(0,Math.min(1,p.musicVolume));if(Number.isFinite(p.effectsVolume))ev=Math.max(0,Math.min(1,p.effectsVolume));if(master){master.gain.setTargetAtTime(muted?0:.6,ctx.currentTime,.02);music.gain.setTargetAtTime(mv*.28,ctx.currentTime,.02);effects.gain.setTargetAtTime(ev*.65,ctx.currentTime,.02);}if(muted)stop();}
  function unlock(){if(muted)return;try{const C=env.AudioContext||env.webkitAudioContext;if(!ctx&&C){ctx=new C();master=ctx.createGain();music=ctx.createGain();effects=ctx.createGain();music.connect(master);effects.connect(master);master.connect(ctx.destination);}if(ctx?.state==='suspended'||ctx?.state==='interrupted')ctx.resume()?.catch(()=>{});configure({});}catch{}}
  function tone(freq,duration,gain,dest,delay=0){if(!ctx||ctx.state!=='running'||!dest||muted)return;try{const source=ctx.createOscillator(),g=ctx.createGain(),at=ctx.currentTime+delay;source.type='sine';source.frequency.setValueAtTime(freq,at);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(gain,at+.025);g.gain.exponentialRampToValueAtTime(.0001,at+duration);source.connect(g);g.connect(dest);let done=false;const v={stop(){if(done)return;done=true;try{source.stop();}catch{}source.disconnect();g.disconnect();voices.delete(v);}};source.onended=v.stop;voices.add(v);while(voices.size>20)voices.values().next().value.stop();source.start(at);source.stop(at+duration+.03);}catch{}}
  function play(id=0){unlock();active=true;if(level!==id){level=id;beat=0;}next=ctx?.currentTime||0;}
  function tick(){if(!active||muted||mv===0||!ctx||ctx.state!=='running'||ctx.currentTime<next)return;next=ctx.currentTime+.72;const notes=[0,7,12,4,9,7,4,12],base=[196,220,174.61,207.65,185,164.81,233.08,246.94,261.63,155.56,146.83,130.81,138.59,277.18,293.66,311.13,329.63,349.23,369.99,392,415.3,440,466.16,493.88,523.25,110,116.54,123.47,103.83,98,92.5,87.31][level%32];tone(base*2**(notes[beat%8]/12),.62,.12,music);if(beat%4===0)tone(base/2,1.2,.08,music);beat++;}
  function effect(kind){if(muted||ev===0)return;unlock();const notes=kind==='correct'?[523.25,659.25]:kind==='complete'?[392,494,587,784]:kind==='retry'?[330,294]:[440];notes.forEach((n,i)=>tone(n,.2,.13,effects,i*.1));}
  return {unlock,configure,play,tick,effect,pause:stop,get voiceCount(){return voices.size;},dispose(){stop();ctx?.close()?.catch(()=>{});}};
 }
 const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.AcademyAudio=api;
})(typeof window!=='undefined'?window:globalThis);
