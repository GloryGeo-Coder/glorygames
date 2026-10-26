(function(root){
  'use strict';
  // Original polar motifs: sparse cave bells, broken-station ostinato, refuge
  // lullaby, coolant machinery and a carrier battle. No downloaded recordings.
  const songs=[
    {bpm:72,root:130.81,notes:[0,12,7,14,3,10,7,19,12,7,5,14,10,3,2,7],bass:[0,3,5,2],pulse:8},
    {bpm:98,root:110,notes:[0,7,2,10,0,14,5,7,3,10,2,14,5,12,7,2],bass:[0,2,5,3],pulse:3},
    {bpm:66,root:196,notes:[0,4,7,11,14,11,7,4,5,9,12,16,12,9,7,2],bass:[0,5,4,2],pulse:8},
    {bpm:112,root:116.54,notes:[0,3,7,10,2,7,14,10,5,8,12,15,7,10,14,17],bass:[0,5,3,7],pulse:3},
    {bpm:132,root:103.83,notes:[0,12,7,6,3,15,10,7,0,7,13,6,10,17,12,3],bass:[0,6,3,5],pulse:2}
  ];
  function note(audio,freq,start,duration,gain,type,dest,slide=1){
    const c=audio.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);if(slide!==1)o.frequency.exponentialRampToValueAtTime(freq*slide,start+duration);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.018);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g).connect(dest);o.start(start);o.stop(start+duration+.025);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  function music(audio,index,progress){
    const song=songs[index],c=audio.ctx,master=c.createGain();master.gain.value=.78;master.connect(audio.musicGain);let step=0,next=c.currentTime+.035;
    const schedule=()=>{
      if(c.state!=='running')return;
      if(next<c.currentTime-.25)next=c.currentTime+.035;
      while(next<c.currentTime+.16){
        const beat=60/song.bpm/2,n=song.notes[step%16],section=Math.floor(step/16)%4,intensity=progress()>.72?1.15:1,f=song.root*2**((n+(section===3?12:0))/12);
        // Cavern and refuge arrangements breathe between notes; the station
        // and carrier use a continuous pulse with a separate low motor voice.
        if(index!==0||step%2===0){note(audio,f*2,next,beat*(index===2?2.8:1.65),.03*intensity,index===4?'triangle':'sine',master);note(audio,f*3.98,next,beat*.8,.006,'sine',master,.997);}
        if(step%4===0)note(audio,song.root/2*2**(song.bass[Math.floor(step/8)%4]/12),next,beat*3.5,.053,'triangle',master);
        if(step%8===0){note(audio,song.root,next,beat*7.5,.014,'sine',master,1.003);note(audio,song.root*2**(7/12),next,beat*7.5,.009,'sine',master,.998);}
        if(step%song.pulse===0)note(audio,index===4?110:74,next,.2,index===4?.085:.05,'sine',master,.36);
        if(index!==2&&step%4===2)note(audio,1500+index*180,next,.05,.006,'triangle',master,.7);
        if((index===1||index===3)&&step%8===5)note(audio,song.root*4,next+beat*.3,beat*.6,.014,'triangle',master,.5);
        if(index===4&&step%8===7)note(audio,f,next,.11,.012,'sawtooth',master,.98);
        step++;next+=beat;
      }
    };
    schedule();const timer=setInterval(schedule,70);return {nodes:[master],timer,padGain:master};
  }
  const effects={jump:[290,940,.18,'triangle',.08],collect:[1047,2637,.24,'sine',.09],shoot:[1900,240,.11,'triangle',.075],hurt:[185,46,.25,'sawtooth',.075],boom:[125,27,.45,'triangle',.14],boss:[175,30,.78,'sawtooth',.105],power:[440,1760,.4,'sine',.12]};
  function effect(audio,name){
    if(!audio.ctx||audio.muted||!effects[name])return;
    const [from,to,duration,type,volume]=effects[name],c=audio.ctx,now=c.currentTime,o=c.createOscillator(),g=c.createGain(),filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=name==='shoot'?2500:2900;o.type=type;o.frequency.setValueAtTime(from,now);o.frequency.exponentialRampToValueAtTime(to,now+duration);g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(filter).connect(g).connect(audio.sfxGain);o.start(now);o.stop(now+duration+.025);o.onended=()=>{o.disconnect();filter.disconnect();g.disconnect();};
  }
  root.SpacePilotChapterAudio={music,effect,songs};
})(typeof globalThis!=='undefined'?globalThis:this);
