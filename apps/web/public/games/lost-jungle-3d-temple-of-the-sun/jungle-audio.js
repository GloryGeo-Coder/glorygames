/* One streamed adventure track and the existing Lost Jungle effect cues. */
(function(root){
  'use strict';
  function create(env=root,tracks=env.JungleMusic||[]){
    let context=null,master=null,musicGain=null,effectsGain=null,media=null;
    let routed=false,routeAttempted=false,selected=0,wanted=false,pending=false,epoch=0;
    let muted=false,musicVolume=.55,effectsVolume=.8,disposed=false;
    const voices=new Set(),lastEffect=new Map();
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
          musicGain.connect(master);effectsGain.connect(master);master.connect(context.destination);
        }
        if(context?.state==='suspended'||context?.state==='interrupted')context.resume()?.catch(()=>{});
        if(context&&!routeAttempted&&getMedia()&&context.createMediaElementSource){
          routeAttempted=true;context.createMediaElementSource(media).connect(musicGain);routed=true;
        }
      }catch{ /* Denied or unsupported audio never blocks the expedition. */ }
      gains();return context;
    }
    function stopEffects(){for(const v of [...voices])v.stop();}
    function pause(){wanted=false;pending=false;epoch++;media?.pause();stopEffects();}
    function selectTheme(themeId){
      const next=tracks.findIndex(t=>t.id===themeId);selected=next>=0?next:0;
      pause();lastEffect.clear();if(media)try{media.currentTime=0;}catch{}
    }
    function playTheme(themeId=tracks[selected]?.id){
      if(disposed)return;
      const next=tracks.findIndex(t=>t.id===themeId);
      if(next>=0&&next!==selected)selectTheme(themeId);
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
    function effect(kind){
      if(muted||effectsVolume===0||disposed)return;
      unlock();if(!context||context.state!=='running')return;
      const now=context.currentTime;if(now-(lastEffect.get(kind)??-Infinity)<.025)return;lastEffect.set(kind,now);
      try{
        if(kind==='jump')tone(420,.06,'triangle',.045);
        if(kind==='dash'){tone(780,.05,'triangle',.04);tone(520,.08,'sine',.025,.05);}
        if(kind==='coin'){tone(760,.05,'triangle',.045);tone(1040,.06,'sine',.03,.04);}
        if(kind==='relic'){tone(520,.07,'triangle',.05);tone(820,.08,'sine',.04,.06);tone(1200,.1,'sine',.025,.13);}
        if(kind==='key'){tone(660,.08,'triangle',.04);tone(990,.08,'triangle',.035,.06);}
        if(kind==='plate'){tone(310,.08,'square',.035);tone(620,.12,'triangle',.025,.08);}
        if(kind==='power'){tone(520,.06,'triangle',.04);tone(820,.08,'sine',.035,.05);}
        if(kind==='hit')tone(150,.14,'sawtooth',.05);
        if(kind==='boss'){tone(120,.12,'sawtooth',.055);tone(210,.1,'square',.03,.08);}
        if(kind==='gate'){tone(260,.08,'triangle',.04);tone(420,.09,'triangle',.03,.08);}
        if(kind==='win'){tone(392,.08,'triangle',.05);tone(554,.1,'triangle',.04,.08);tone(784,.12,'sine',.03,.18);}
      }catch{stopEffects();}
    }
    return {unlock,configure,selectTheme,playTheme,pause,effect,
      get track(){return tracks[selected]||null;},
      dispose(){pause();disposed=true;if(media){media.removeAttribute('src');media.load();}context?.close()?.catch(()=>{});}
    };
  }
  const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.JungleAudio=api;
})(typeof window!=='undefined'?window:globalThis);
