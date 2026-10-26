(function(root){
  'use strict';
  // Five original crystalline arrangements, synthesised after player input.
  // Different meters, roots and melodic contours distinguish each mission.
  const songs=[
    {bpm:88,root:146.83,notes:[0,7,14,12,9,7,4,7,16,14,12,7,9,4,2,7],bass:[0,5,9,7],pulse:4},
    {bpm:104,root:164.81,notes:[0,4,11,7,14,11,4,7,12,16,11,7,9,14,7,4],bass:[0,4,5,7],pulse:3},
    {bpm:78,root:174.61,notes:[0,7,9,12,16,12,9,7,5,9,14,12,7,5,4,2],bass:[0,5,2,7],pulse:4},
    {bpm:116,root:138.59,notes:[0,7,3,14,10,7,15,12,3,10,7,14,12,10,5,2],bass:[0,3,5,7],pulse:3},
    {bpm:124,root:123.47,notes:[0,7,12,3,10,14,7,6,12,19,15,10,14,7,6,3],bass:[0,6,3,7],pulse:4}
  ];
  function note(audio,freq,start,duration,gain,type,dest){
    const c=audio.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g).connect(dest);o.start(start);o.stop(start+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  function music(audio,index,progress){
    const song=songs[index],c=audio.ctx,master=c.createGain();master.gain.value=.8;master.connect(audio.musicGain);let step=0,next=c.currentTime+.035;
    const schedule=()=>{
      if(c.state!=='running')return;
      if(next<c.currentTime-.25)next=c.currentTime+.035;
      while(next<c.currentTime+.16){
        const beat=60/song.bpm/2,n=song.notes[step%16],section=Math.floor(step/16)%4,intensity=progress()>.72?1.2:1,f=song.root*2**((n+(section===2?12:0))/12);
        note(audio,f*2,next,beat*1.5,.035*intensity,'sine',master);
        // A quiet inharmonic partial gives the melody a glass-like timbre.
        note(audio,f*4.01,next,.16,.009,'sine',master);
        if(step%4===0)note(audio,song.root/2*2**(song.bass[Math.floor(step/8)%4]/12),next,beat*3.2,.062,'triangle',master);
        if(step%8===0){note(audio,song.root*2,next,beat*7,.012,'sine',master);note(audio,song.root*2**(7/12),next,beat*7,.009,'sine',master);}
        if(step%song.pulse===0){const kick=c.createOscillator(),g=c.createGain();kick.frequency.setValueAtTime(index===4?100:75,next);kick.frequency.exponentialRampToValueAtTime(38,next+.12);g.gain.setValueAtTime(.075,next);g.gain.exponentialRampToValueAtTime(.0001,next+.18);kick.connect(g).connect(master);kick.start(next);kick.stop(next+.2);kick.onended=()=>{kick.disconnect();g.disconnect();};}
        if(step%4===2)note(audio,1800+index*130,next,.045,.008,'triangle',master);
        if(step%8===7)note(audio,f*1.5,next+beat*.35,beat*.9,.012,'sine',master);
        step++;next+=beat;
      }
    };
    schedule();const timer=setInterval(schedule,70);return {nodes:[master],timer,padGain:master};
  }
  const effects={jump:[370,1050,.16,'triangle',.085],collect:[1175,2350,.2,'sine',.09],shoot:[1700,280,.105,'triangle',.075],hurt:[220,58,.23,'sawtooth',.08],boom:[150,32,.4,'triangle',.14],boss:[210,40,.7,'sawtooth',.11],power:[590,2100,.34,'sine',.12]};
  function effect(audio,name){
    if(!audio.ctx||audio.muted||!effects[name])return;const [from,to,duration,type,volume]=effects[name],c=audio.ctx,now=c.currentTime,o=c.createOscillator(),g=c.createGain(),filter=c.createBiquadFilter();
    filter.type='lowpass';filter.frequency.value=name==='shoot'?2400:3100;o.type=type;o.frequency.setValueAtTime(from,now);o.frequency.exponentialRampToValueAtTime(to,now+duration);g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(filter).connect(g).connect(audio.sfxGain);o.start(now);o.stop(now+duration+.02);o.onended=()=>{o.disconnect();filter.disconnect();g.disconnect();};
  }
  root.SpacePilotChapterAudio={music,effect,songs};
})(typeof globalThis!=='undefined'?globalThis:this);
