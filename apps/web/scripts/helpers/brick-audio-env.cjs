/* Audio lifecycle adapter; browser autoplay policy and speaker output are not emulated. */
function audioEnv({rejectPlay=false,noContext=false,noAudio=false,denyContext=false,deferredPlay=false,rejectResume=false,webkitOnly=false}={}){
 const media=[],contexts=[],pending=[];
 class Param{constructor(){this.value=0;}setValueAtTime(v){this.value=v;}setTargetAtTime(v){this.value=v;}exponentialRampToValueAtTime(v){if(!(v>0))throw Error('invalid gain');this.value=v;}}
 class Node{
  constructor(c){this.context=c;this.connections=[];this.gain=new Param();this.frequency=new Param();}
  connect(n){this.connections.push(n);return n;}disconnect(){this.connections=[];}
  start(at){this.at=at;this.context.starts.push(this);}stop(at){if(at===undefined){this.stopped=true;this.onended?.();}else this.end=at;}
  finish(){this.stopped=true;this.onended?.();}
 }
 class Context{
  constructor(){if(denyContext)throw Error('context denied');this.currentTime=0;this.state='suspended';this.sampleRate=44100;this.bufferCount=0;this.destination={};this.starts=[];this.gains=[];this.mediaSources=0;contexts.push(this);}
  resume(){if(rejectResume)return Promise.reject(Error('gesture required'));this.state='running';return Promise.resolve();}
  close(){this.state='closed';return Promise.resolve();}
  createGain(){const n=new Node(this);this.gains.push(n);return n;}
  createOscillator(){return new Node(this);}
  createBuffer(channels,length){this.bufferCount++;const data=new Float32Array(length);return {getChannelData:()=>data};}
  createBufferSource(){return new Node(this);}
  createDynamicsCompressor(){return Object.assign(new Node(this),Object.fromEntries(['threshold','knee','ratio','attack','release'].map(k=>[k,new Param()])));}
  createMediaElementSource(){this.mediaSources++;if(this.mediaSources>1)throw Error('duplicate source');return new Node(this);}
 }
 class Audio{
  constructor(){this.currentTime=0;this.src='';this.paused=true;this.playCalls=0;this.pauseCalls=0;this.requests=[];this.events={};media.push(this);}
  getAttribute(k){return k==='src'?this.src:null;}removeAttribute(k){if(k==='src')this.src='';}load(){this.loaded=true;}
  addEventListener(k,fn){this.events[k]=fn;}emit(k){this.events[k]?.();}
  play(){this.playCalls++;this.requests.push(this.src);if(rejectPlay)return Promise.reject(Error('play denied'));if(deferredPlay)return new Promise(resolve=>pending.push(()=>{this.paused=false;resolve();}));this.paused=false;return Promise.resolve();}
  pause(){this.paused=true;this.pauseCalls++;}
 }
 const env={};if(!noAudio)env.Audio=Audio;if(!noContext)env[webkitOnly?'webkitAudioContext':'AudioContext']=Context;
 return {env,media,contexts,pending};
}
module.exports={audioEnv};
