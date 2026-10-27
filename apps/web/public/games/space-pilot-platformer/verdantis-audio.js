(function(root){
  'use strict';
  // Original forest/electronic arrangements: root pulse, call-and-response,
  // sanctuary melody, syncopated seed trail and the Brood Titan encounter.
  const songs=[
    {bpm:84,root:146.83,notes:[0,3,7,10,12,10,7,3,5,7,12,14,10,7,5,3],bass:[0,5,3,7],pulse:4},
    {bpm:96,root:164.81,notes:[0,7,12,7,3,10,14,10,5,12,17,12,7,14,19,14],bass:[0,3,5,2],pulse:4},
    {bpm:76,root:174.61,notes:[0,4,7,9,12,9,7,4,5,9,12,14,17,14,12,9],bass:[0,5,4,2],pulse:8},
    {bpm:112,root:130.81,notes:[0,7,3,10,7,12,10,15,5,12,8,15,12,17,15,20],bass:[0,3,5,7],pulse:3},
    {bpm:128,root:110,notes:[0,3,7,6,12,10,7,3,5,8,12,11,17,15,12,7],bass:[0,5,3,6],pulse:2}
  ];
  function note(audio,freq,start,duration,gain,type,dest,slide=1){
    const c=audio.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);if(slide!==1)o.frequency.exponentialRampToValueAtTime(freq*slide,start+duration);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g).connect(dest);o.start(start);o.stop(start+duration+.025);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  function emit(audio,index,step,next,master,intensity=1){
    const song=songs[index],beat=60/song.bpm/2,n=song.notes[step%16],section=Math.floor(step/16)%4,f=song.root*2**((n+(section===3?12:0))/12);
    if(index!==1||step%8<4)note(audio,f*2,next,beat*(index===2?2.5:1.2),.032*intensity,index===4?'triangle':'sine',master,1.001);
    if(index===1&&step%8>=4)note(audio,f,next,beat*1.6,.04,'triangle',master,.999);
    if(step%4===0||index===3&&step%8===7)note(audio,song.root/2*2**(song.bass[Math.floor(step/8)%4]/12),next,beat*2.8,.06,'triangle',master);
    if(step%8===0){note(audio,song.root,next,beat*7,.014,'sine',master);note(audio,song.root*1.5,next,beat*7,.01,'sine',master,.998);}
    if(step%song.pulse===0)note(audio,105,next,.17,.075,'sine',master,.35);
    if(step%4===2)note(audio,280+index*20,next,.09,.025,'triangle',master,.46);
    if(step%2===1)note(audio,2200+(step%3)*300,next,.025,.006,'triangle',master,.8);
    if(index!==4&&step%8===5)note(audio,f*4,next+beat*.25,.11,.01,'sine',master,1.08);
    if(index===4&&step%8===7)note(audio,song.root*3,next,.12,.018,'sawtooth',master,.65);
  }
  function music(audio,index,progress){
    const c=audio.ctx,master=c.createGain();master.gain.value=.76;master.connect(audio.musicGain);let step=0,next=c.currentTime+.035;
    const schedule=()=>{if(c.state!=='running')return;if(next<c.currentTime-.25)next=c.currentTime+.035;while(next<c.currentTime+.16){emit(audio,index,step++,next,master,progress()>.72?1.2:1);next+=60/songs[index].bpm/2;}};
    schedule();const timer=setInterval(schedule,70);return {nodes:[master],timer,padGain:master};
  }
  // The same score can be rendered offline for waveform QA or future exports.
  function render(audio,index,duration){const c=audio.ctx,master=c.createGain();master.gain.value=.76;master.connect(audio.musicGain);const beat=60/songs[index].bpm/2;for(let step=0;step*beat<duration-.05;step++)emit(audio,index,step,.02+step*beat,master);return master;}
  const effects={jump:[280,960,.17,'triangle',.08],collect:[988,2490,.21,'sine',.09],shoot:[1700,210,.095,'triangle',.08],hurt:[170,43,.24,'sawtooth',.075],boom:[130,29,.4,'triangle',.14],boss:[210,32,.8,'sawtooth',.1],power:[390,1560,.36,'sine',.12]};
  function effect(audio,name){
    if(!audio.ctx||audio.muted||!effects[name])return;const [from,to,duration,type,volume]=effects[name],c=audio.ctx,now=c.currentTime,o=c.createOscillator(),g=c.createGain(),filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=name==='shoot'?2400:2900;o.type=type;o.frequency.setValueAtTime(from,now);o.frequency.exponentialRampToValueAtTime(to,now+duration);g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(filter).connect(g).connect(audio.sfxGain);o.start(now);o.stop(now+duration+.025);o.onended=()=>{o.disconnect();filter.disconnect();g.disconnect();};
  }
  root.SpacePilotChapterAudio={music,effect,songs,render};
})(typeof globalThis!=='undefined'?globalThis:this);
