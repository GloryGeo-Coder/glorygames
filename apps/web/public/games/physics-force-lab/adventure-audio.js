/* Original, synthesized arrangements. No external recordings or audio downloads. */
(function(root){
  'use strict';
  const themes=[
    {bpm:96,root:130.81,chords:[0,5,9,7],notes:[0,7,12,16,14,7,4,12],wave:'triangle'},
    {bpm:108,root:146.83,chords:[0,7,3,5],notes:[12,7,15,19,12,10,7,3],wave:'sine'},
    {bpm:112,root:110,chords:[0,3,7,5],notes:[0,12,7,15,19,7,10,12],wave:'triangle'},
    {bpm:100,root:164.81,chords:[0,5,2,7],notes:[12,16,19,7,14,12,4,7],wave:'sine'},
    {bpm:120,root:123.47,chords:[0,7,5,9],notes:[0,7,12,14,19,16,12,7],wave:'triangle'}
  ];
  class AdventureAudio{
    constructor(settings){this.settings=settings;this.ctx=null;this.timer=null;this.index=0;this.step=0;this.active=false;}
    unlock(){
      try{const AC=root.AudioContext||root.webkitAudioContext;if(!AC)return false;
        if(!this.ctx){this.ctx=new AC();this.music=this.ctx.createGain();this.effects=this.ctx.createGain();this.music.connect(this.ctx.destination);this.effects.connect(this.ctx.destination);this.volumes();}
        if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return true;
      }catch{return false;}
    }
    volumes(){if(!this.ctx)return;this.music.gain.setTargetAtTime(this.settings.music*.15,this.ctx.currentTime,.02);this.effects.gain.setTargetAtTime(this.settings.effects*.22,this.ctx.currentTime,.02);}
    note(freq,duration=.16,bus='effects',wave='sine',level=.4,delay=0){
      if(!this.ctx||this.ctx.state!=='running')return;
      const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();
      o.type=wave;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this[bus]);o.start(t);o.stop(t+duration+.02);
      o.onended=()=>{o.disconnect();g.disconnect();};
    }
    effect(kind,value){
      if(!this.unlock())return;
      const notes={jump:[260,390],cell:[660,990],repair:[392,523,659,784],bump:[130,90],test:[330,440],click:[520],signal:[value||440]};
      (notes[kind]||notes.click).forEach((f,i)=>this.note(f,kind==='signal'?.5:.12,'effects','sine',.25,i*.075));
    }
    play(index){this.index=index;this.active=true;if(!this.unlock()||this.timer)return;this.step=0;this.timer=setInterval(()=>this.tick(),60000/themes[index].bpm/2);}
    tick(){
      if(!this.active||root.document?.hidden)return;
      const m=themes[this.index],s=this.step++,chord=m.chords[Math.floor(s/16)%4],f=n=>m.root*2**(n/12);
      if(s%4===0){this.note(f(chord-12),.42,'music','sine',.42);[0,4,7].forEach((n,i)=>this.note(f(chord+n),.7,'music','sine',.08,i*.025));}
      this.note(f(m.notes[s%8]+chord),.23,'music',m.wave,.12);
      if(s%2===0)this.note(55,.08,'music','sine',.25);
    }
    stop(){this.active=false;clearInterval(this.timer);this.timer=null;}
  }
  root.PhysicsAdventureAudio=AdventureAudio;
})(typeof globalThis!=='undefined'?globalThis:this);
