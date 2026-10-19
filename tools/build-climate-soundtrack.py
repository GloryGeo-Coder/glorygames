"""Deterministic original nature-inspired Climate Rescue Quest score (no samples).
Requires numpy, scipy and ffmpeg. All 25 scores and encoded hashes are recorded.
"""
from pathlib import Path
import hashlib,json,subprocess,tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import lfilter
ROOT=Path(__file__).resolve().parents[1];GAME=ROOT/'apps/web/public/games/climate-rescue-quest';SR=22050
LEVELS=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./apps/web/public/games/climate-rescue-quest/climate-levels.js').levels))"],cwd=ROOT,text=True))
SCALE=[0,2,4,7,9,12,14,16,19];PROGRESSIONS=[[0,5,7,0],[0,7,5,9],[0,9,5,7],[0,5,9,7],[0,7,2,5]]
def voice(kind,note,duration,seed):
 t=np.arange(round(duration*SR))/SR;f=440*2**((note-69)/12);rng=np.random.default_rng(seed);ph=2*np.pi*f*t
 if kind=='wood':y=(np.sin(ph)+.28*np.sin(ph*2.76)*np.exp(-t/.045)+.12*np.sin(ph*5.4)*np.exp(-t/.03))*np.exp(-t/.2)
 elif kind=='pluck':y=(np.sin(ph)+.3*np.sin(ph*2)+.12*np.sin(ph*3))*np.exp(-t/.35)
 elif kind=='flute':y=(np.sin(ph+.012*np.sin(t*29))+.15*np.sin(ph*2)+.035*lfilter([.2],[1,-.8],rng.normal(0,1,len(t))))*np.minimum(1,t/.06)*np.minimum(1,(duration-t)/.18)
 elif kind=='pad':y=(np.sin(ph)+.3*np.sin(ph*1.003))*np.minimum(1,t/.3)*np.minimum(1,(duration-t)/.4)
 elif kind=='drum':y=np.sin(2*np.pi*(85*t+45*.02*(1-np.exp(-t/.02))))*np.exp(-t/.07)
 elif kind=='shaker':y=lfilter([1,-1],[1,-.4],rng.normal(0,1,len(t)))*np.exp(-t/.025)*.3
 elif kind=='bird':y=np.sin(2*np.pi*(1500*t+600*t*t/duration))*np.sin(np.pi*t/duration)**2*.35
 else:y=np.sin(2*np.pi*(650*t+250*.08*(1-np.exp(-t/.08))))*np.exp(-t/.12)
 return (y*np.minimum(1,t/.004)*np.minimum(1,(duration-t)/.012)).astype(np.float32)
def compose(i,level,out):
 bpm=82+(i%6)*3+i//10;beat=60/bpm;duration=64*beat;n=round(duration*SR);mix=np.zeros((n,2),np.float32);rng=np.random.default_rng(7900+i);tonic=[48,50,53,55,57][i%5];progression=PROGRESSIONS[i%5];family=level['bg'];motif=[SCALE[(i*3+j*2+j//3)%len(SCALE)] for j in range(8)];cache={}
 def add(kind,note,at,length,gain,pan=0,echo=.2):
  key=(kind,note,length)
  if key not in cache:cache[key]=voice(kind,note,length,i*100+len(cache))
  wave=cache[key]
  for delay,volume,panning in [(0,gain,pan),(beat*.75,gain*echo,-pan),(beat*1.5,gain*echo*.35,pan*.6)]:
   start=round((at+delay)*SR)
   if start>=n:continue
   m=min(len(wave),n-start);mix[start:start+m,0]+=wave[:m]*volume*np.sqrt((1-panning)/2);mix[start:start+m,1]+=wave[:m]*volume*np.sqrt((1+panning)/2)
 # Continuous, synthesized soft wind/water texture. No field recordings are used.
 ambience=lfilter([.01],[1,-.99],rng.normal(0,1,n)).astype(np.float32)
 ambience*=.045 if family in [2,4,5] else .025
 mix[:,0]+=ambience;mix[:,1]+=np.roll(ambience,round(SR*.013))
 for bar in range(16):
  root=tonic+progression[(bar//1)%4];at=bar*4*beat;energy=.7 if bar in [0,8] else 1
  for k,interval in enumerate([0,4,7,14]):add('pad',root+interval,at,4*beat,.027*energy,(k-1.5)*.3,.1)
  for k in range(8):
   tm=at+k*.5*beat;note=tonic+12+motif[(k+bar//4)%8]
   add('wood' if family%2==0 else 'pluck',note,tm,.65,.11*energy,(-.35 if k%2 else .35),.25)
   if bar%4 in [1,3] and k in [0,3,6]:add('flute',note+12,tm,beat*.85,.045,-.1,.22)
   add('shaker',48,tm,.12,.047*energy,(-.6 if k%2 else .6),0)
   if k in [0,4] or k==7 and i%2:add('drum',40,tm,.3,.13*energy,0,.05)
  if family in [2,4,5]:
   for k in [1,5]:add('drop',75,at+(k+.2*(i%3))*.5*beat,.45,.045,.5 if k==1 else -.5,.3)
  if family in [0,3,4,8] and bar%2==i%2:add('bird',80,at+(1+i%3)*beat,.22+.02*(i%4),.035,-.6+1.2*(bar%3)/2,.22)
 fade=round(SR*.18);mix[:fade]*=np.linspace(0,1,fade)[:,None];mix[-fade:]*=np.linspace(1,0,fade)[:,None]
 mix=np.tanh(mix*1.25);peak=float(np.max(np.abs(mix)));mix*=.70/max(peak,.001);rms=float(np.sqrt(np.mean(mix.astype(np.float64)**2)))
 with tempfile.TemporaryDirectory() as tmp:
  wav=Path(tmp)/'score.wav';wavfile.write(wav,SR,(mix*32767).astype(np.int16));subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','128k',str(out)],check=True)
 b=out.read_bytes();return dict(id=i+1,title=level['title'],url='./assets/music/climate-%02d.mp3'%(i+1),duration=round(duration,3),bytes=len(b),sha256=hashlib.sha256(b).hexdigest(),sourcePeak=round(float(np.max(np.abs(mix))),5),sourceRms=round(rms,5),score=dict(bpm=bpm,tonic=tonic,progression=progression,motif=motif,ambience='water and soft wind' if family in [2,4,5] else 'soft wind and occasional birds',seed=7900+i))
if __name__=='__main__':
 from concurrent.futures import ThreadPoolExecutor
 folder=GAME/'assets/music';folder.mkdir(exist_ok=True)
 with ThreadPoolExecutor(max_workers=3) as pool:tracks=list(pool.map(lambda pair:compose(pair[0],pair[1],folder/('climate-%02d.mp3'%(pair[0]+1))),enumerate(LEVELS)))
 (folder/'manifest.json').write_text(json.dumps(dict(composer='Original synthesized Climate Rescue Quest score',samples='None; birds, water and wind are synthesized',sampleRate=SR,tracks=tracks),indent=2)+'\n')
 data=[dict(id=t['id'],title=t['title'],url=t['url']) for t in tracks];(GAME/'climate-music.js').write_text("(function(root){'use strict';const tracks="+json.dumps(data,separators=(',',':'))+";if(typeof module==='object'&&module.exports)module.exports=tracks;else root.ClimateMusic=tracks;})(typeof window!=='undefined'?window:globalThis);\n")
 print(json.dumps(dict(tracks=len(tracks),bytes=sum(t['bytes'] for t in tracks),minRms=min(t['sourceRms'] for t in tracks),maxRms=max(t['sourceRms'] for t in tracks))))
