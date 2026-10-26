(function(root){
  'use strict';
  // Original Vulcanis industrial arrangements: five melodies and drum/bass
  // patterns. No downloads, third-party recordings or autoplay dependency.
  const songs=[
    {bpm:102,root:130.81,notes:[0,7,3,0,10,7,2,3,12,7,10,3,5,2,7,0],bass:[0,3,0,7]},
    {bpm:114,root:116.54,notes:[0,0,3,7,6,3,0,10,12,10,6,7,3,0,2,6],bass:[0,6,3,5]},
    {bpm:86,root:146.83,notes:[0,3,7,14,12,7,5,3,2,5,9,12,10,9,5,2],bass:[0,5,2,3]},
    {bpm:122,root:123.47,notes:[0,7,0,10,3,7,12,10,5,12,7,14,10,7,3,2],bass:[0,0,5,7]},
    {bpm:130,root:103.83,notes:[0,3,0,6,7,10,7,3,12,10,6,3,14,12,7,6],bass:[0,6,3,7]}
  ];
  function note(audio,freq,start,duration,gain,type,dest){
    const c=audio.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g).connect(dest);o.start(start);o.stop(start+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  function music(audio,index,progress){
    const song=songs[index],c=audio.ctx,master=c.createGain();master.gain.value=.8;master.connect(audio.musicGain);
    let step=0,next=c.currentTime+.035;
    const schedule=()=>{
      if(c.state!=='running')return;
      // A throttled background tab must not replay a backlog on resume.
      if(next<c.currentTime-.25)next=c.currentTime+.035;
      while(next<c.currentTime+.16){
        const beat=60/song.bpm/2,n=song.notes[step%song.notes.length],section=Math.floor(step/16)%4,intensity=progress()>.72?1.3:1;
        note(audio,song.root*2**((n+(section===2?12:0))/12),next,beat*.82,.035*intensity,index===2?'sine':'triangle',master);
        if(step%4===0)note(audio,song.root/2*2**(song.bass[Math.floor(step/8)%4]/12),next,beat*1.7,.07,'sine',master);
        if(step%4===0){const kick=c.createOscillator(),g=c.createGain();kick.frequency.setValueAtTime(115,next);kick.frequency.exponentialRampToValueAtTime(42,next+.14);g.gain.setValueAtTime(.12,next);g.gain.exponentialRampToValueAtTime(.0001,next+.19);kick.connect(g).connect(master);kick.start(next);kick.stop(next+.2);kick.onended=()=>{kick.disconnect();g.disconnect();};}
        if(step%2===1)note(audio,2300+(step%3)*410,next,.036,.014,'square',master);
        if(step%8===4)note(audio,song.root*3,next,.065,.02,'triangle',master);
        if(step%8===6)note(audio,song.root*4,next,beat*1.4,.022,'sine',master);
        step++;next+=beat;
      }
    };
    schedule();const timer=setInterval(schedule,70);
    return {nodes:[master],timer,padGain:master};
  }
  const effects={jump:[310,850,.15,'triangle',.09],collect:[880,1760,.16,'sine',.1],shoot:[1250,150,.11,'sawtooth',.04],hurt:[150,42,.23,'sawtooth',.09],boom:[82,24,.38,'triangle',.15],boss:[135,32,.65,'sawtooth',.12],power:[420,1650,.3,'sine',.12]};
  function effect(audio,name){
    if(!audio.ctx||audio.muted)return;const [from,to,duration,type,volume]=effects[name],c=audio.ctx,now=c.currentTime,o=c.createOscillator(),g=c.createGain(),filter=c.createBiquadFilter();
    filter.type='lowpass';filter.frequency.value=name==='shoot'?1800:2800;o.type=type;o.frequency.setValueAtTime(from,now);o.frequency.exponentialRampToValueAtTime(to,now+duration);g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(filter).connect(g).connect(audio.sfxGain);o.start(now);o.stop(now+duration+.02);o.onended=()=>{o.disconnect();filter.disconnect();g.disconnect();};
  }
  root.SpacePilotChapterAudio={music,effect,songs};
})(typeof globalThis!=='undefined'?globalThis:this);

