(function(r, f) { const api = f(r); if (typeof module === 'object' && module.exports) module.exports = api; else r.ScienceArcadeAudio = api; })(typeof globalThis !== 'undefined' ? globalThis : this, function(r) {
  'use strict';
  const SAVE_KEY = 'wga_science_dash_audio_v1';
  // Original 32-step phrases, harmony and bass movements for the twenty labs.
  // All sound is synthesised locally: no network music, samples or licensed tracks.
  const tracks = [
    {name:'Safety lights',root:60,bpm:106,melody:[0,4,7,12,9,7,4,2,0,7,9,12,14,12,7,4],chords:[0,5,9,7],bass:[0,7,12,7]},
    {name:'A curious idea',root:57,bpm:110,melody:[0,7,4,9,7,2,4,12,11,7,4,2,9,7,2,0],chords:[0,9,5,7],bass:[0,12,7,4]},
    {name:'Particle playground',root:62,bpm:112,melody:[0,2,5,9,12,9,7,5,2,7,9,14,12,7,5,2],chords:[0,5,7,2],bass:[0,5,7,12]},
    {name:'Separate the signal',root:55,bpm:114,melody:[0,4,9,7,12,11,7,4,2,4,7,9,14,12,9,7],chords:[0,7,9,5],bass:[0,7,4,12]},
    {name:'Momentum makers',root:59,bpm:118,melody:[0,7,12,7,4,9,12,14,11,7,4,2,0,4,7,12],chords:[0,5,2,7],bass:[0,12,7,9]},
    {name:'Closed circuit',root:64,bpm:120,melody:[0,4,7,11,12,7,9,4,2,7,11,14,12,9,7,4],chords:[0,9,7,5],bass:[0,7,12,4]},
    {name:'Prism echoes',root:58,bpm:108,melody:[0,3,7,10,12,10,7,5,3,7,12,15,10,7,5,3],chords:[0,5,8,7],bass:[0,7,3,12]},
    {name:'Glasshouse morning',root:60,bpm:104,melody:[0,4,9,12,7,9,4,2,0,2,4,7,12,9,7,4],chords:[0,5,9,7],bass:[0,5,12,7]},
    {name:'Heartbeat discovery',root:56,bpm:116,melody:[0,7,3,10,7,12,10,5,3,7,12,10,8,7,3,0],chords:[0,8,5,7],bass:[0,12,7,3]},
    {name:'Living connections',root:61,bpm:112,melody:[0,5,9,12,14,9,7,5,2,5,7,12,9,7,4,2],chords:[0,5,7,9],bass:[0,5,9,7]},
    {name:'Tiny universe',root:63,bpm:118,melody:[0,3,7,12,10,7,5,3,0,7,10,15,12,10,7,5],chords:[0,8,7,5],bass:[0,7,12,3]},
    {name:'Indicator glow',root:57,bpm:114,melody:[0,4,8,11,12,8,7,4,2,7,11,14,12,8,4,0],chords:[0,5,9,7],bass:[0,7,4,12]},
    {name:'Stone and stream',root:53,bpm:108,melody:[0,5,7,12,9,7,5,2,4,7,9,14,12,9,5,0],chords:[0,5,2,7],bass:[0,12,5,7]},
    {name:'Observatory orbit',root:65,bpm:102,melody:[0,7,12,16,14,12,9,7,4,9,12,14,11,7,4,2],chords:[0,9,5,7],bass:[0,7,12,9]},
    {name:'A brighter planet',root:58,bpm:110,melody:[0,4,7,9,12,9,7,2,4,7,12,14,9,7,4,0],chords:[0,5,9,7],bass:[0,5,7,12]},
    {name:'The living code',root:62,bpm:116,melody:[0,3,7,10,14,12,10,7,5,10,12,15,10,7,3,2],chords:[0,5,8,7],bass:[0,7,12,5]},
    {name:'Workshop companions',root:59,bpm:122,melody:[0,4,7,12,11,9,7,4,2,7,9,14,12,7,4,2],chords:[0,7,5,9],bass:[0,12,7,4]},
    {name:'Patterns in motion',root:55,bpm:118,melody:[0,2,7,9,12,7,4,2,0,4,9,11,14,12,7,4],chords:[0,9,5,7],bass:[0,7,12,2]},
    {name:'Core resonance',root:60,bpm:124,melody:[0,7,11,12,16,14,12,7,4,9,12,19,16,12,11,7],chords:[0,5,9,7],bass:[0,12,7,9]},
    {name:'The Glitch Experiment',root:54,bpm:128,melody:[0,3,7,12,15,12,10,7,5,8,12,17,15,10,7,3],chords:[0,8,5,7],bass:[0,7,12,3]}
  ];
  const volume = (v, fallback) => typeof v === 'number' && Number.isFinite(v) ? Math.min(1,Math.max(0,v)) : fallback;
  function settings(raw) {return {music:volume(raw?.music,.36),effects:volume(raw?.effects,.64)};}
  function load(storage) {try {return settings(JSON.parse(storage.getItem(SAVE_KEY)));} catch {return settings();}}
  function save(storage, value) {try {storage.setItem(SAVE_KEY,JSON.stringify(settings(value)));} catch {}}
  class Audio {
    constructor(value) {
      this.settings=settings(value);this.ctx=null;this.timer=null;this.nodes=new Map();this.channels={};this.index=0;this.step=0;this.nextTime=0;this.pressure=0;this.noiseBuffer=null;
    }
    unlock() {
      try {
        const AC=r.AudioContext||r.webkitAudioContext;
        if(!AC)return false;
        if(!this.ctx){
          this.ctx=new AC();
          const out=this.ctx.createDynamicsCompressor?.()||this.ctx.createGain();out.connect(this.ctx.destination);this.output=out;
          for(const name of ['music','effects']){const gain=this.ctx.createGain();gain.gain.setValueAtTime(this.settings[name]*.6,this.ctx.currentTime);gain.connect(out);this.channels[name]=gain;}
        }
        if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});
        return true;
      } catch {this.stop();return false;}
    }
    setVolume(channel,value) {
      if(!['music','effects'].includes(channel))return;
      this.settings[channel]=volume(value,this.settings[channel]);
      if(this.channels[channel]){const p=this.channels[channel].gain;p.cancelScheduledValues?.(this.ctx.currentTime);p.setValueAtTime(this.settings[channel]*.6,this.ctx.currentTime);}
      if(this.settings[channel]===0)this.silence(channel);
      if(channel==='music'&&this.settings.music===0)this.stopMusic();
    }
    trackNode(node,channel,extras=[]) {
      this.nodes.set(node,channel);node.onended=()=>{this.nodes.delete(node);try{node.disconnect();for(const n of extras)n.disconnect();}catch{}};
    }
    tone(midi,time,duration,gain,type='sine',channel='music',glide=0) {
      if(!this.ctx||!this.settings[channel]||this.nodes.size>=96)return;
      try {
        const osc=this.ctx.createOscillator(),amp=this.ctx.createGain(),hz=440*2**((midi-69)/12);
        osc.type=type;osc.frequency.setValueAtTime(hz,time);if(glide)osc.frequency.exponentialRampToValueAtTime(hz*glide,time+duration);
        amp.gain.setValueAtTime(.0001,time);amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),time+.014);amp.gain.exponentialRampToValueAtTime(.0001,time+duration);
        osc.connect(amp);amp.connect(this.channels[channel]);this.trackNode(osc,channel,[amp]);osc.start(time);osc.stop(time+duration+.025);
      } catch {}
    }
    noise(time,duration,gain,frequency,channel='music') {
      if(!this.ctx?.createBuffer||!this.settings[channel]||this.nodes.size>=96)return;
      try {
        if(!this.noiseBuffer){const n=this.ctx.sampleRate*.25;this.noiseBuffer=this.ctx.createBuffer(1,Math.ceil(n),this.ctx.sampleRate);const a=this.noiseBuffer.getChannelData(0);let seed=937;for(let i=0;i<a.length;i++){seed=(1664525*seed+1013904223)>>>0;a[i]=seed/2147483648-1;}}
        const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),amp=this.ctx.createGain();source.buffer=this.noiseBuffer;filter.type='bandpass';filter.frequency.setValueAtTime(frequency,time);filter.Q.value=.7;
        amp.gain.setValueAtTime(gain,time);amp.gain.exponentialRampToValueAtTime(.0001,time+duration);source.connect(filter);filter.connect(amp);amp.connect(this.channels[channel]);this.trackNode(source,channel,[filter,amp]);source.start(time);source.stop(time+duration);
      } catch {}
    }
    schedule(step,time) {
      const a=tracks[this.index],s=step%32,bar=Math.floor(s/8),chord=a.chords[bar],note=a.root+a.melody[s%16]+(s>=16&&s%4===3?12:0),loud=.085+this.pressure*.025;
      if(s%4!==3||this.pressure>.55){this.tone(note,time,.22,loud,'triangle');this.tone(note+12,time+.008,.14,.014);}
      if(s%2===0)this.tone(a.root-24+chord+a.bass[(s/2)%4],time,.30,.19,'sine');
      if(s%8===0)for(const interval of [0,4,7])this.tone(a.root-12+chord+interval,time,1.25,.027,'triangle');
      if(s%4===0)this.tone(37,time,.14,.24,'sine','music',.32);
      if(s%8===4)this.noise(time,.10,.09,1700);
      if(s%2===1)this.noise(time,.035,.025+this.pressure*.015,6500);
      if(this.pressure>.6&&s%8===6)this.tone(a.root+19,time,.10,.05,'sine');
    }
    tick() {
      if(!this.ctx||!this.settings.music)return;
      // Mobile suspension must not produce a burst of missed notes on return.
      if(this.nextTime<this.ctx.currentTime-.1)this.nextTime=this.ctx.currentTime+.02;
      let count=0;while(this.nextTime<this.ctx.currentTime+.14&&count++<4){this.schedule(this.step++,this.nextTime);this.nextTime+=60/tracks[this.index].bpm/2;}
    }
    play(index=0) {
      if(!this.ctx||!this.settings.music)return;
      const next=Math.min(19,Math.max(0,Math.floor(Number(index)||0)));
      if(this.timer!==null&&next===this.index)return;
      this.stopMusic();this.index=next;this.step=0;this.nextTime=this.ctx.currentTime+.02;this.tick();this.timer=r.setInterval(()=>this.tick(),50);
    }
    silence(channel) {
      for(const [node,c]of this.nodes)if(!channel||c===channel){try{node.stop();}catch{}this.nodes.delete(node);}
    }
    stopMusic() {if(this.timer!==null)r.clearInterval(this.timer);this.timer=null;this.silence('music');}
    stop() {this.stopMusic();this.silence();}
    effect(kind) {
      if(!this.ctx||!this.settings.effects)return;
      const time=this.ctx.currentTime,notes={collect:[76,83],hurt:[43,38],shoot:[82,90],correct:[72,76,79,84],wrong:[56,51],level:[60,64,67,72,79],boss:[36,43,48],power:[64,76,83],shield:[67,79,86],hit:[57,69],lane:[69,74],question:[72,79,76],fail:[55,51,48]}[kind];
      if(!notes)return;
      if(['hurt','hit','boss'].includes(kind))this.noise(time,.13,kind==='boss'?.13:.08,kind==='boss'?400:1200,'effects');
      notes.forEach((n,i)=>this.tone(n,time+i*(kind==='shoot'?.025:.065),kind==='boss'?.25:.13,kind==='shoot'?.08:.12,['hurt','wrong','boss'].includes(kind)?'triangle':'sine','effects',kind==='shoot'?1.35:0));
    }
    status() {return {available:!!this.ctx,track:this.index,playing:this.timer!==null,step:this.step,nodes:this.nodes.size};}
  }
  Audio.tracks=tracks;Audio.settings=settings;Audio.load=load;Audio.save=save;Audio.SAVE_KEY=SAVE_KEY;
  return Audio;
});
