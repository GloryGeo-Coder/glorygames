/* Gesture-unlocked, sample-based racing mix. No sound is requested before Play. */
(() => {
  'use strict';
  const FILES={low:'engine_low.wav',high:'engine_high.wav',nitro:'nitro_air.wav',road:'road_air.wav',
    gear:'gear_shift.wav',lane:'pass_whoosh.wav',crash:'impact.wav',pickup:'pickup.wav',level:'finish.wav',
    midnight:'midnight_grid.mp3',sunset:'sunset_run.mp3',voltage:'high_voltage.mp3',skyline:'skyline_drive.mp3'};
  function create({window:win=window,getState=()=>({}),getRoute=()=>({}),getCar=()=>'',onSettings=()=>{},fetcher=win.fetch?.bind(win),storage}={}) {
    const settings={muted:false,music:.28,engine:.48,effects:.65};
    try { const p=JSON.parse(storage?.getItem('high-spead-racer-audio-v1')||'null');
      if(p){settings.muted=Boolean(p.muted);for(const k of ['music','engine','effects']) if(Number.isFinite(p[k]))settings[k]=Math.max(0,Math.min(1,p[k]));}
    } catch {}
    let ctx=null,master=null,musicBus=null,engineBus=null,effectsBus=null,compressor=null;
    let engineWanted=false,musicWanted=false,paused=false,disposed=false,token=0,track=null,musicVoice=null,gear=0,lastShift=-10;
    const buffers=new Map(),pending=new Map(),loops=new Map(),effects=new Set(),musicLRU=[],controllers=new Set();
    let fallback=null;
    const active=()=>['running','countdown'].includes(getState().mode);
    function save(){try{storage?.setItem('high-spead-racer-audio-v1',JSON.stringify(settings));}catch{}}
    function ramp(param,value,seconds=.08){if(param&&ctx){param.cancelScheduledValues(ctx.currentTime);param.setTargetAtTime(value,ctx.currentTime,seconds);}}
    function mix(){if(!ctx)return;ramp(master.gain,settings.muted||paused?0:.82);ramp(musicBus.gain,settings.music);ramp(engineBus.gain,settings.engine);ramp(effectsBus.gain,settings.effects);}
    function notice(){onSettings({...settings,available:Boolean(ctx)});}
    async function load(key){
      if(disposed||!ctx||!fetcher||!FILES[key])return null;
      if(buffers.has(key))return buffers.get(key);
      if(pending.has(key))return pending.get(key);
      const request=Promise.resolve().then(async()=>{
        let controller,timer;
        try {
          controller=typeof AbortController==='function'?new AbortController():null;
          if(controller){controllers.add(controller);timer=setTimeout(()=>controller.abort(),10000);}
          const r=await fetcher(`assets/audio/racing/${FILES[key]}`,{signal:controller?.signal});
          if(!r.ok)throw Error('Audio unavailable');
          const buffer=await ctx.decodeAudioData(await r.arrayBuffer());
          if(disposed)return null;
          buffers.set(key,buffer);
          if(FILES[key].endsWith('.mp3')){
            const old=musicLRU.indexOf(key);if(old>=0)musicLRU.splice(old,1);musicLRU.push(key);
            while(musicLRU.length>2)buffers.delete(musicLRU.shift());
          }
          return buffer;
        } catch {return null;} finally {if(timer)clearTimeout(timer);controllers.delete(controller);pending.delete(key);}
      });pending.set(key,request);return request;
    }
    function voice(buffer,bus,loop=false,gain=1){
      if(!ctx||disposed)return null;
      const source=ctx.createBufferSource(),volume=ctx.createGain();source.buffer=buffer;source.loop=loop;volume.gain.value=gain;
      source.connect(volume);volume.connect(bus);source.start();
      const v={source,volume,stopped:false,stop(fade=.04){if(v.stopped)return;v.stopped=true;ramp(volume.gain,0,Math.max(.005,fade/3));try{source.stop(ctx.currentTime+fade);}catch{}},disconnect(){source.disconnect();volume.disconnect();}};
      source.onended=()=>{v.disconnect();effects.delete(v);};return v;
    }
    async function playMusic(){
      if(!ctx||disposed||!musicWanted||paused||settings.muted||!active())return;
      const key=getRoute().music||'midnight';
      if(track===key&&musicVoice)return;
      const request=++token;
      const b=await load(key);
      if(!b||request!==token||disposed||paused||settings.muted||!musicWanted||!active())return;
      const old=musicVoice;track=key;musicVoice=voice(b,musicBus,true,0);
      ramp(musicVoice.volume.gain,1,.3);old?.stop(.6);
    }
    async function startLoop(key){
      const b=await load(key);
      if(!b||disposed||!engineWanted||paused||settings.muted||loops.has(key))return;
      loops.set(key,voice(b,engineBus,true,0));
      if(key==='low'&&fallback){try{fallback.osc.stop();fallback.osc.disconnect();fallback.volume.disconnect();}catch{}fallback=null;}
    }
    function ensure(){
      if(disposed)return false;
      if(!ctx)try{
        const Context=win.AudioContext||win.webkitAudioContext;if(!Context)return false;
        ctx=new Context();master=ctx.createGain();musicBus=ctx.createGain();engineBus=ctx.createGain();effectsBus=ctx.createGain();compressor=ctx.createDynamicsCompressor();
        compressor.threshold.value=-12;compressor.knee.value=12;compressor.ratio.value=6;compressor.attack.value=.003;compressor.release.value=.15;
        musicBus.connect(master);engineBus.connect(master);effectsBus.connect(master);master.connect(compressor);compressor.connect(ctx.destination);
        for(const key of ['low','high','nitro','road','gear','lane','crash','pickup','level'])void load(key);
      }catch{ctx=null;return false;}
      try{if(ctx.state==='suspended')Promise.resolve(ctx.resume()).catch(()=>{});}catch{}
      mix();notice();if(musicWanted)void playMusic();return true;
    }
    function startMusic(){musicWanted=true;paused=false;mix();void playMusic();}
    function stopMusic(){musicWanted=false;++token;musicVoice?.stop(.25);musicVoice=null;track=null;}
    function startEngine(){
      engineWanted=true;paused=false;if(!ensure()||settings.muted)return;
      // A quiet sine-body covers loading/network failure, never a harsh saw wave.
      if(!fallback&&!loops.has('low')){const osc=ctx.createOscillator(),volume=ctx.createGain();osc.type='sine';osc.frequency.value=96;volume.gain.value=.035;osc.connect(volume);volume.connect(engineBus);osc.start();fallback={osc,volume};}
      for(const key of ['low','high','nitro','road'])void startLoop(key);
      mix();
    }
    function stopEngine(){
      engineWanted=false;gear=0;
      for(const v of loops.values())v.stop();loops.clear();
      if(fallback){try{fallback.osc.stop();fallback.osc.disconnect();fallback.volume.disconnect();}catch{}fallback=null;}
    }
    function effect(key){
      if(!ctx||disposed||settings.muted||paused)return;
      const b=buffers.get(key);if(!b){void load(key);return;}
      if(effects.size>=10)return;
      const v=voice(b,effectsBus,false,key==='crash'?.8:.65);effects.add(v);
    }
    function updateEngine(){
      if(!ctx||disposed||!engineWanted||paused||settings.muted)return;
      const state=getState(),running=state.mode==='running';
      const speed=Math.max(0,Number(state.roadSpeed)||0),nextGear=Math.max(1,Math.min(6,Math.floor((speed-28)/13)+1));
      if(running&&gear&&gear!==nextGear&&ctx.currentTime-lastShift>.55){effect('gear');lastShift=ctx.currentTime;}
      gear=nextGear;
      const character={mclaren:1,challenger:.82,porsche:1.1,audi:1.04}[getCar()]||1;
      const rpm=running?Math.max(2200,Math.min(8400,3100+((speed-28)%13)/13*3700+(state.nitroHeld?650:0))):1500;
      const lift=Math.max(0,Math.min(1,(rpm-2200)/5600)),duck=ctx.currentTime-lastShift<.12?.55:1;
      for(const [key,v] of loops){
        const gain=key==='low'?(.12+.19*Math.sqrt(1-lift)) * duck:key==='high'?.28*Math.sqrt(lift)*duck:key==='nitro'?(running&&state.nitroHeld&&state.nitro>0?.20:0):(running?.025+speed/6000:0);
        ramp(v.volume.gain,gain,.055);
        ramp(v.source.playbackRate,key==='low'?(.72+rpm/8000)*character:key==='high'?(.65+rpm/7000)*character:1,.065);
      }
      if(fallback)ramp(fallback.osc.frequency,65+rpm/45,.08);
    }
    function pause(){paused=true;++token;stopEngine();if(musicVoice)ramp(musicVoice.volume.gain,0,.05);mix();try{Promise.resolve(ctx?.suspend()).catch(()=>{});}catch{}}
    function resume(){paused=false;ensure();if(musicVoice)ramp(musicVoice.volume.gain,1,.1);startEngine();void playMusic();}
    function toggleMute(){settings.muted=!settings.muted;save();mix();if(settings.muted){++token;stopEngine();}else{ensure();if(active()){startEngine();void playMusic();}}notice();}
    function setVolume(bus,value){if(!['music','engine','effects'].includes(bus))return;const n=Number(value);if(!Number.isFinite(n))return;settings[bus]=Math.max(0,Math.min(1,n));save();mix();notice();}
    function dispose(){disposed=true;++token;controllers.forEach(c=>c.abort());controllers.clear();stopEngine();stopMusic();effects.forEach(v=>v.stop(0));effects.clear();buffers.clear();pending.clear();try{ctx?.close();}catch{}}
    notice();
    return {ensure,startMusic,stopMusic,startEngine,stopEngine,updateEngine,pause,resume,toggleMute,setVolume,dispose,
      get muted(){return settings.muted;},settings:()=>({...settings}),
      sfxLane:()=>effect('lane'),sfxNitro:()=>effect('gear'),sfxPickup:()=>effect('pickup'),sfxNearMiss:()=>effect('lane'),sfxCrash:()=>effect('crash'),sfxLevel:()=>effect('level'),sfxHazard:()=>effect('gear'),
      state:()=>({unlocked:Boolean(ctx),track,loops:loops.size,musicBuffers:musicLRU.length,pending:pending.size,paused,disposed,gear})};
  }
  window.RacerAudio={create,FILES};
})();
