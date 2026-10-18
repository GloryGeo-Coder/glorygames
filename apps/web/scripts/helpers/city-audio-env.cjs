/* Deterministic transport/node adapter; this does not emulate browser audio policy. */
function audioEnv({rejectPlay=false,noContext=false,webkitOnly=false,denyContext=false,deferredPlay=false}={}) {
  const media=[],contexts=[],pending=[];
  class Param {
    constructor(value=0){this.value=value;this.events=[];}
    setValueAtTime(value,time){this.value=value;this.events.push({value,time});}
    setTargetAtTime(value,time,constant){this.value=value;this.events.push({value,time,constant});}
    exponentialRampToValueAtTime(value,time){if(!(value>0&&Number.isFinite(time)))throw Error('invalid ramp');this.value=value;this.events.push({value,time});}
  }
  class Node {
    constructor(context){this.context=context;this.connections=[];this.gain=new Param();this.frequency=new Param();this.pan=new Param();this.stopped=false;}
    connect(node){this.connections.push(node);return node;}
    disconnect(){this.connections=[];}
    start(at){if(!Number.isFinite(at))throw Error('invalid start');this.at=at;this.context.starts.push(this);}
    stop(at){if(at===undefined){this.stopped=true;this.onended?.();}else{if(at<this.at)throw Error('negative duration');this.end=at;}}
    finish(){this.stopped=true;this.onended?.();}
  }
  class Context {
    constructor(){if(denyContext)throw Error('audio unavailable');this.currentTime=0;this.state='suspended';this.sampleRate=44100;this.destination={};this.starts=[];this.gains=[];this.bufferCount=0;this.mediaSources=0;contexts.push(this);}
    resume(){this.state='running';return Promise.resolve();}
    close(){this.state='closed';return Promise.resolve();}
    createGain(){const n=new Node(this);this.gains.push(n);return n;}
    createDynamicsCompressor(){return Object.assign(new Node(this),Object.fromEntries(['threshold','knee','ratio','attack','release'].map(k=>[k,new Param()])));}
    createMediaElementSource(){this.mediaSources++;if(this.mediaSources>1)throw Error('media source reused');return new Node(this);}
    createOscillator(){return new Node(this);}
    createStereoPanner(){return new Node(this);}
    createBiquadFilter(){return new Node(this);}
    createBuffer(channels,length){this.bufferCount++;const data=new Float32Array(length);return {getChannelData:()=>data};}
    createBufferSource(){return new Node(this);}
  }
  class Audio {
    constructor(){this.currentTime=0;this.src='';this.paused=true;this.playCalls=0;this.pauseCalls=0;this.requests=[];media.push(this);}
    getAttribute(name){return name==='src'?this.src:null;}
    removeAttribute(name){if(name==='src')this.src='';}
    load(){}
    play(){this.playCalls++;this.requests.push(this.src);if(rejectPlay)return Promise.reject(Error('gesture required'));if(deferredPlay)return new Promise(resolve=>pending.push(()=>{this.paused=false;resolve();}));this.paused=false;return Promise.resolve();}
    pause(){this.paused=true;this.pauseCalls++;}
  }
  const env={Audio};if(!noContext)env[webkitOnly?'webkitAudioContext':'AudioContext']=Context;
  return {env,media,contexts,pending};
}
module.exports={audioEnv};
