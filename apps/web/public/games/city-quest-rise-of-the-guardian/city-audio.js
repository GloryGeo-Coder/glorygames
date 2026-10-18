/* City Quest: one streamed district song, original synthesized gameplay effects. */
(function(root) {
  'use strict';
  function create(env=root,tracks=env.CityMusic||[]) {
    let context=null,master=null,musicGain=null,effectsGain=null,music=null,routed=false;
    let selected=0,wanted=false,muted=false,musicVolume=.55,effectsVolume=.8;
    let noiseBuffer=null;
    const voices=new Set(),lastEffect=new Map();
    const volume=(n,fallback)=>Number.isFinite(Number(n))?Math.max(0,Math.min(1,Number(n))):fallback;
    function gains() {
      if(master)master.gain.setTargetAtTime(muted?0:.8,context.currentTime,.015);
      if(musicGain)musicGain.gain.setTargetAtTime(musicVolume,context.currentTime,.025);
      if(effectsGain)effectsGain.gain.setTargetAtTime(effectsVolume,context.currentTime,.015);
      if(music)music.volume=routed?1:muted?0:musicVolume*.8;
    }
    function media() {
      if(!music&&env.Audio) {
        try { music=new env.Audio();music.loop=true;music.preload='none';music.playsInline=true; }
        catch { music=null; }
      }
      return music;
    }
    function unlock() {
      if(muted)return;
      try {
        const Ctx=env.AudioContext||env.webkitAudioContext;
        if(!context&&Ctx) {
          context=new Ctx();master=context.createGain();musicGain=context.createGain();effectsGain=context.createGain();
          const limiter=context.createDynamicsCompressor();
          limiter.threshold.value=-10;limiter.knee.value=16;limiter.ratio.value=6;limiter.attack.value=.003;limiter.release.value=.18;
          musicGain.connect(master);effectsGain.connect(master);master.connect(limiter);limiter.connect(context.destination);
        }
        if(context?.state==='suspended'||context?.state==='interrupted')context.resume()?.catch(()=>{});
        if(context&&!routed&&media()&&context.createMediaElementSource) {
          context.createMediaElementSource(music).connect(musicGain);routed=true;
        }
        gains();
      }catch { /* Unsupported or denied audio must never block a mission. */ }
    }
    function stopEffects() {
      for(const v of [...voices])v.stop();
    }
    function pause() {
      wanted=false;if(music)music.pause();stopEffects();
    }
    function selectLevel(index) {
      selected=Math.max(0,Math.min(tracks.length-1,Math.floor(Number(index)||0)));
      pause();lastEffect.clear();
      if(music) {try {music.currentTime=0;}catch{}}
    }
    function playLevel(index=selected) {
      const next=Math.max(0,Math.min(tracks.length-1,Math.floor(Number(index)||0)));
      if(next!==selected)selectLevel(next);
      if(muted||!tracks[selected])return;
      unlock();if(musicVolume===0)return;
      const el=media();if(!el)return;
      const src=tracks[selected].url;
      if(el.getAttribute('src')!==src)el.src=src;
      gains();wanted=true;
      try {
        const promise=el.play();
        if(promise?.then)promise.then(()=>{if(!wanted)el.pause();}).catch(()=>{});
      }catch { /* A later user gesture can retry after a browser autoplay refusal. */ }
    }
    function configure(settings={}) {
      if('muted' in settings)muted=!!settings.muted;
      musicVolume=volume(settings.musicVolume,musicVolume);effectsVolume=volume(settings.effectsVolume,effectsVolume);
      gains();if(muted){pause();}else if(musicVolume===0&&music){wanted=false;music.pause();}
    }
    function voice(source,at,duration,level,pan=0,filter=null) {
      const envelope=context.createGain(),panner=context.createStereoPanner?.();
      envelope.gain.setValueAtTime(.0001,at);
      envelope.gain.exponentialRampToValueAtTime(Math.max(.0001,level),at+.006);
      envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
      const chain=[source];if(filter)chain.push(filter);chain.push(envelope);if(panner){panner.pan.value=pan;chain.push(panner);}chain.push(effectsGain);
      for(let i=0;i<chain.length-1;i++)chain[i].connect(chain[i+1]);
      let cleaned=false;
      const entry={stop(){if(cleaned)return;cleaned=true;try{source.stop();}catch{}for(const node of chain.slice(0,-1))try{node.disconnect();}catch{}voices.delete(entry);}};
      source.onended=()=>entry.stop();voices.add(entry);
      while(voices.size>32)voices.values().next().value.stop();
      source.start(at);source.stop(at+duration+.015);
    }
    function note(freq,end,duration,level,type='sine',delay=0,pan=0) {
      const at=context.currentTime+.008+delay,osc=context.createOscillator();osc.type=type;
      osc.frequency.setValueAtTime(freq,at);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),at+duration);
      voice(osc,at,duration,level,pan);
    }
    function noise(duration,level,cutoff=1200,delay=0) {
      if(!noiseBuffer) {
        noiseBuffer=context.createBuffer(1,context.sampleRate,context.sampleRate);
        const samples=noiseBuffer.getChannelData(0);let seed=23;
        for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;samples[i]=seed/2147483648-1;}
      }
      const source=context.createBufferSource(),filter=context.createBiquadFilter();source.buffer=noiseBuffer;
      filter.type='highpass';filter.frequency.value=cutoff;voice(source,context.currentTime+.008+delay,duration,level,0,filter);
    }
    function effect(kind) {
      if(muted||effectsVolume===0||!context||context.state!=='running')return;
      const now=context.currentTime,gate=kind==='enemyShoot'?.14:kind==='coin'?.045:.025;
      if(now-(lastEffect.get(kind)??-Infinity)<gate)return;
      lastEffect.set(kind,now);
      try {
        if(kind==='coin'){note(1046,1318,.11,.13,'sine');note(1568,1568,.14,.07,'sine',.04,.2);}
        else if(kind==='token'){note(659,988,.16,.13,'triangle');note(1318,1568,.22,.08,'sine',.08);}
        else if(kind==='jump'){note(180,640,.16,.12,'sine');noise(.06,.025,2400);}
        else if(kind==='land'){noise(.07,.065,450);note(95,50,.10,.09);}
        else if(kind==='shoot'){note(950,170,.10,.10,'triangle');noise(.045,.045,3500);}
        else if(kind==='enemyShoot'){note(330,125,.13,.06,'triangle');noise(.035,.025,1700);}
        else if(kind==='hit'){noise(.19,.17,500);note(135,38,.23,.21,'triangle');}
        else if(kind==='shield'){note(780,260,.24,.13);note(1175,390,.28,.08,'sine',.03);noise(.12,.04,4000);}
        else if(kind==='boss'){note(160,48,.18,.18,'triangle');noise(.12,.10,750);}
        else if(kind==='enemyDefeat'){noise(.16,.10,1800);note(220,50,.20,.13,'triangle');}
        else if(kind==='power'||kind==='checkpoint'){[523,659,784,1046].forEach((f,i)=>note(f,f,.22,.08,'sine',i*.065,(i-1.5)*.15));}
        else if(kind==='level'||kind==='victory'){[392,494,587,784,988].forEach((f,i)=>note(f,f,.38,.10,'triangle',i*.10));}
        else if(kind==='gameOver'){[392,330,262,196].forEach((f,i)=>note(f,f*.98,.30,.10,'sine',i*.16));}
        else if(kind==='npc'){note(440,523,.09,.075,'sine');note(659,659,.12,.06,'sine',.09);}
      }catch { stopEffects(); }
    }
    return {unlock,configure,selectLevel,playLevel,pause,effect,
      get track(){return tracks[selected]||null;},
      dispose(){pause();if(music){music.removeAttribute('src');music.load();}context?.close()?.catch(()=>{});}
    };
  }
  const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.CityAudio=api;
})(typeof window!=='undefined'?window:globalThis);
