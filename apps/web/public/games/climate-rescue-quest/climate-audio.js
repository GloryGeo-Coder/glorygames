/* One streamed stage song; bounded original Climate Rescue Quest effects. */
(function(root){
  'use strict';
  function create(env=root,tracks=env.ClimateMusic||[]){
    let context=null,master=null,musicGain=null,effectsGain=null,media=null;
    let routed=false,routeAttempted=false,selected=0,wanted=false,pending=false,epoch=0;
    let muted=false,musicVolume=.55,effectsVolume=.8,disposed=false;
    const voices=new Set(),lastEffect=new Map();let noiseBuffer=null;
    const volume=(n,fallback)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(1,n)):fallback;
    function gains(){
      if(master)master.gain.setTargetAtTime(muted?0:.8,context.currentTime,.015);
      if(musicGain)musicGain.gain.setTargetAtTime(musicVolume*.5,context.currentTime,.03);
      if(effectsGain)effectsGain.gain.setTargetAtTime(effectsVolume*.65,context.currentTime,.015);
      if(media){media.muted=muted||musicVolume===0;try{media.volume=routed?1:musicVolume*.4;}catch{}}
    }
    function getMedia(){
      if(!media&&env.Audio&&!disposed){
        try{media=new env.Audio();media.loop=true;media.preload='none';media.playsInline=true;
          media.addEventListener?.('error',()=>{wanted=false;pending=false;epoch++;media.pause();});
        }catch{media=null;}
      }
      return media;
    }
    function unlock(){
      if(muted||disposed)return null;
      try{
        const Ctx=env.AudioContext||env.webkitAudioContext;
        if(!context&&Ctx){
          context=new Ctx();master=context.createGain();musicGain=context.createGain();effectsGain=context.createGain();
          musicGain.connect(master);effectsGain.connect(master);
          const limiter=context.createDynamicsCompressor?.();if(limiter){limiter.threshold.value=-8;limiter.knee.value=16;limiter.ratio.value=6;limiter.attack.value=.003;limiter.release.value=.18;master.connect(limiter);limiter.connect(context.destination);}else master.connect(context.destination);
        }
        if(context?.state==='suspended'||context?.state==='interrupted')context.resume()?.catch(()=>{});
        if(context&&!routeAttempted&&getMedia()&&context.createMediaElementSource){
          routeAttempted=true;context.createMediaElementSource(media).connect(musicGain);routed=true;
        }
      }catch{ /* Denied or unsupported audio never blocks the round. */ }
      gains();return context;
    }
    function stopEffects(){for(const v of [...voices])v.stop();}
    function pause(){wanted=false;pending=false;epoch++;media?.pause();stopEffects();}
    function selectLevel(levelId){
      const next=tracks.findIndex(t=>t.id===levelId);selected=next>=0?next:0;
      pause();lastEffect.clear();if(media)try{media.currentTime=0;}catch{}
    }
    function playLevel(levelId=tracks[selected]?.id){
      if(disposed)return;
      const next=tracks.findIndex(t=>t.id===levelId);
      if(next>=0&&next!==selected)selectLevel(levelId);
      if(muted||musicVolume===0||!tracks[selected])return;
      unlock();const el=getMedia();if(!el)return;
      const src=tracks[selected].url;
      if(el.getAttribute('src')!==src){el.src=src;try{el.currentTime=0;}catch{}}
      gains();wanted=true;if(pending||!el.paused)return;
      const request=++epoch;pending=true;
      try{
        const promise=el.play();
        Promise.resolve(promise).then(()=>{
          if(!wanted||disposed)el.pause();if(request===epoch)pending=false;
        }).catch(()=>{if(request===epoch)pending=false;});
      }catch{pending=false;}
    }
    function configure(settings={}){
      if('muted'in settings)muted=!!settings.muted;
      musicVolume=volume(settings.musicVolume,musicVolume);effectsVolume=volume(settings.effectsVolume,effectsVolume);
      gains();if(muted)pause();else{
        if(musicVolume===0){wanted=false;pending=false;epoch++;media?.pause();}
        if(effectsVolume===0)stopEffects();
      }
    }
    function tone(freq,dur=.08,type='sine',gain=.04,delay=0){
      if(!context||context.state!=='running'||!effectsGain)return;
      const at=context.currentTime+delay,source=context.createOscillator(),g=context.createGain();
      source.type=type;source.frequency.setValueAtTime(freq,at);
      g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(gain,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+dur);
      source.connect(g);g.connect(effectsGain);let cleaned=false;
      const voice={stop(){if(cleaned)return;cleaned=true;try{source.stop();}catch{}source.disconnect();g.disconnect();voices.delete(voice);}};
      source.onended=()=>voice.stop();voices.add(voice);
      while(voices.size>24)voices.values().next().value.stop();
      source.start(at);source.stop(at+dur+.04);
    }
    function noise(duration,gain){
      if(!context.createBufferSource)return;
      if(!noiseBuffer){noiseBuffer=context.createBuffer(1,context.sampleRate,context.sampleRate);const data=noiseBuffer.getChannelData(0);let seed=21;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/2147483648-1)*.7;}}
      const source=context.createBufferSource(),g=context.createGain(),at=context.currentTime;source.buffer=noiseBuffer;g.gain.setValueAtTime(gain,at);g.gain.exponentialRampToValueAtTime(.0001,at+duration);source.connect(g);g.connect(effectsGain);let cleaned=false;const voice={stop(){if(cleaned)return;cleaned=true;try{source.stop();}catch{}source.disconnect();g.disconnect();voices.delete(voice);}};source.onended=()=>voice.stop();voices.add(voice);while(voices.size>24)voices.values().next().value.stop();source.start(at);source.stop(at+duration+.02);
    }
    function effect(kind){
      if(muted||effectsVolume===0||disposed)return;
      unlock();if(!context||context.state!=='running')return;
      const now=context.currentTime;if(now-(lastEffect.get(kind)??-Infinity)<.025)return;lastEffect.set(kind,now);
      try{
        if(kind==='pickup'){tone(660,.07,'triangle',.1);tone(990,.1,'sine',.08,.05);}
        else if(kind==='water'){tone(580,.06,'sine',.12);tone(960,.09,'sine',.09,.07);}
        else if(kind==='tree'){tone(440,.09,'triangle',.1);tone(660,.12,'sine',.08,.06);tone(880,.1,'sine',.05,.12);}
        else if(kind==='shield'||kind==='block'){tone(520,.1,'sine',.11);tone(1040,.12,'triangle',.07,.05);}
        else if(kind==='magnet'){tone(330,.08,'triangle',.1);tone(660,.1,'sine',.09,.07);tone(990,.1,'sine',.07,.13);}
        else if(kind==='freeze'){noise(.12,.08);tone(1440,.13,'sine',.09);tone(1880,.09,'sine',.06,.06);}
        else if(kind==='supply'){tone(740,.07,'triangle',.1);tone(1110,.12,'sine',.09,.06);}
        else if(kind==='strike'){tone(330,.07,'triangle',.09);tone(770,.09,'sine',.07,.04);}
        else if(kind==='hit'){noise(.09,.13);tone(180,.12,'triangle',.13);}
        else if(kind==='boss'){noise(.22,.09);tone(110,.2,'sine',.13);tone(220,.15,'triangle',.1,.1);}
        else if(kind==='level'||kind==='start'||kind==='bossClear'){for(const[i,f]of[392,494,587,784].entries())tone(f,.15,'triangle',.1,i*.075);}
        else if(kind==='gameover'){tone(330,.13,'triangle',.1);tone(220,.2,'sine',.1,.12);}

      }catch{stopEffects();}
    }
    return {unlock,configure,selectLevel,playLevel,pause,effect,
      get track(){return tracks[selected]||null;},
      dispose(){pause();disposed=true;if(media){media.removeAttribute('src');media.load();}context?.close()?.catch(()=>{});}
    };
  }
  const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.ClimateAudio=api;
})(typeof window!=='undefined'?window:globalThis);
