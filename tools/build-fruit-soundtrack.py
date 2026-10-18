"""Compose Fruit Slice's original per-level arcade score; requires numpy, scipy and ffmpeg.

No recordings, samples, artist imitations or third-party songs are used. All
instruments are synthesized here. Run from any directory; outputs are deterministic.
"""
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import lfilter

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / 'apps/web/public/games/fruit-slice'
SR = 44100
# Each stage has its own score: title, tempo, key, harmony, groove and motif.
LEVELS=json.loads(subprocess.check_output(['node','-e',
    "console.log(JSON.stringify(require('./apps/web/public/games/fruit-slice/fruit-levels.js').levels))"],cwd=ROOT,text=True))
SCORES=[(lv['title'],108+(i%6)*3+(i//5),[48,45,50,43,47,52,46][i%7],i%5,(i*5+i//5)%6,i) for i,lv in enumerate(LEVELS)]

PROGRESSIONS = [[0,5,8,7],[0,8,3,10],[0,3,5,8],[0,10,8,5],[0,5,3,7]]
GROOVES = [[0,3,6,10,11,14],[0,2,7,8,11,15],[1,4,6,9,12,14],
           [0,3,7,10,12,15],[0,2,5,8,11,14],[1,3,6,8,10,15]]
SCALE = [0,2,4,7,9,12,14,16,19,21]

def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)

def instrument(kind, note=48, length=.3, seed=0):
    t = np.arange(max(32, int(length * SR)), dtype=np.float64) / SR
    f = hz(note)
    rng = np.random.default_rng(seed)
    if kind == 'log':
        # Low percussion voice, available to the score.
        phase = 2*np.pi*(f*t + f*.055*(1-np.exp(-t/0.022)))
        y = np.sin(phase + 2.8*np.exp(-t/0.045)*np.sin(phase*2.01))
        y = np.tanh(y*1.5)*np.exp(-t/.19) + .12*np.sin(phase*2)*np.exp(-t/.04)
    elif kind == 'kick':
        phase = 2*np.pi*(49*t + 90*.018*(1-np.exp(-t/.018)))
        y = .9*np.sin(phase)*np.exp(-t/.10) + rng.normal(0,.07,len(t))*np.exp(-t/.004)
    elif kind in ('shaker','hat','clap','rim'):
        n = rng.normal(0,1,len(t))
        n = lfilter([1,-1],[1,-.35],n)
        if kind == 'clap':
            env = sum(np.exp(-np.maximum(0,t-x)/.025)*(t>=x) for x in [0,.012,.025])
            y = n*env*.35
        elif kind == 'rim':
            y = (np.sin(2*np.pi*1750*t)+.4*n)*np.exp(-t/.009)
        else:
            y = n*np.exp(-t/(.024 if kind=='shaker' else .055))*.5
    elif kind == 'keys':
        phase = 2*np.pi*f*t
        y = (np.sin(phase + 1.1*np.exp(-t/.12)*np.sin(phase*2))
             + .15*np.sin(phase*3)*np.exp(-t/.18))*np.exp(-t/.55)
    elif kind == 'pad':
        y = (np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*f*1.002*t)+.12*np.sin(4*np.pi*f*t))
        y *= np.minimum(1,t/.15)*np.minimum(1,(length-t)/.2)*.7
    elif kind == 'pluck':
        y=(np.sin(2*np.pi*f*t)+.32*np.sin(2*np.pi*f*2*t)*np.exp(-t/.12)+.12*np.sin(2*np.pi*f*3*t))*np.exp(-t/.26)
    else: # bright wooden mallet phrase
        y = (np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*f*2.01*t)*np.exp(-t/.06))*np.exp(-t/.22)
    y *= np.minimum(1,t/.003)*np.minimum(1,(length-t)/.012)
    return y.astype(np.float32)

def compose(number, score, destination):
    title,bpm,tonic,family,groove,phrase=score
    beat=60/bpm; duration=32*4*beat
    mix=np.zeros((int(duration*SR),2),np.float32)
    rng=np.random.default_rng(2300+number)
    cache={}
    def add(kind,note,at,length,gain,pan=0,send=.0):
        key=(kind,note,round(length,3))
        if key not in cache: cache[key]=instrument(kind,note,length,number*101+len(cache))
        wave=cache[key]
        def put(time,level,panning):
            start=round(time*SR)
            if start<0 or start>=len(mix): return
            n=min(len(wave),len(mix)-start)
            mix[start:start+n,0] += wave[:n]*level*np.sqrt((1-panning)/2)
            mix[start:start+n,1] += wave[:n]*level*np.sqrt((1+panning)/2)
        put(at,gain,pan)
        if send:
            put(at+beat*.75,gain*send,-pan*.7)
            put(at+beat*1.5,gain*send*.38,pan*.5)
    progression=PROGRESSIONS[family]
    for bar in range(32):
        intro=bar<2; breakdown=16<=bar<20
        energy=.8 if intro else .6 if breakdown else 1
        degree=progression[(bar//2)%4]
        root=tonic+degree
        # Diatonic minor/major colours with seventh/ninth extensions.
        chord=[0,4,7,14] if degree in (0,5,7) else [0,3,7,10]
        at=bar*4*beat
        for i,interval in enumerate(chord):
            add('keys',root+12+interval,at+(0.015*i),1.5,.085*energy,(i-1.5)*.16,.28)
            if bar%2==1: add('keys',root+12+interval,at+2.75*beat+.01*i,1.1,.065*energy,(1.5-i)*.16,.24)
            if bar%2==0: add('pad',root+12+interval,at,beat*7.8,.022,(i-1.5)*.18)
        for step in range(16):
            swing=(.035+(number%4)*.003) if step%2 else 0
            t=at+step*beat/4+swing
            add('shaker',48,t,.10,(.031 if step%2 else .022)*energy,(-.45 if step%2 else .45))
            if step%4==2: add('hat',48,t,.13,.027*energy,.2)
            if step in [4,12] and not intro: add('clap',48,t,.18,.075*energy,-.12,.06)
            if step in ([0,8] if intro or breakdown else [0,4,8,12]):
                add('kick',36,t,.30,.32*energy)
            if step in [3+(number%2),10,15] and not intro:
                add('rim',48,t,.08,.045*energy,.32,.13)
        if not intro or bar>=2:
            for j,step in enumerate(GROOVES[groove]):
                if breakdown and j%2: continue
                variation=(bar//4+phrase)%3
                offsets=[0,0,7,12,0,3] if variation==0 else [0,7,0,10,12,0] if variation==1 else [0,12,7,0,3,7]
                bass=root-12+offsets[(j+phrase)%6]
                while bass>47: bass-=12
                add('pluck',bass+12,at+step*beat/4+(.018 if step%2 else 0),.42,.16*energy)
            if bar%4==3 and not breakdown:
                for j in range(3): add('pluck',root+[7,4,0][j],at+(3.25+j*.25)*beat,.28,.12)
        # Each stage has its own motif, phrase placement, timbre and answer.
        if bar%4 in [0,1,3]:
            for j in range(4):
                degree_i=(phrase*3+j*(1+phrase%3)+(bar//4)%3+(phrase//5)*(j%2))%len(SCALE)
                n=tonic+24+SCALE[degree_i]
                position=[.5,1.25,2.5,3.25][j]+(phrase%2)*.125
                add('pluck' if phrase//5 in [1,3] else 'mallet',n,at+position*beat,.65,.09*energy,(-.25 if j%2 else .25),.38)
        if bar%8==7 and not breakdown:
            for j in range(4): add('rim',48,at+(3+j*.25)*beat,.09,.025+j*.008,(j-1.5)*.2)
    # Soft saturation and short seam fades keep the repeat free from edge clicks.
    mix=np.tanh(mix*.95)
    fade=int(.025*SR); mix[:fade]*=np.linspace(0,1,fade)[:,None];mix[-fade:]*=np.linspace(1,0,fade)[:,None]
    peak=float(np.max(np.abs(mix))); rms=float(np.sqrt(np.mean(mix**2)))
    with tempfile.TemporaryDirectory(prefix='fruit-music-') as temp:
        wav=Path(temp)/'master.wav';wavfile.write(wav,SR,(mix*32767).astype(np.int16))
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),
                        '-af','loudnorm=I=-18:TP=-2.5:LRA=7','-ar',str(SR),'-ac','2',
                        '-codec:a','libmp3lame','-b:a','112k','-map_metadata','-1',
                        '-metadata','title='+title,'-metadata','artist=WebGameArena',
                        '-metadata','album=Fruit Slice: Sunset Sessions',str(destination)],check=True)
    return {'id':number,'title':title,'bpm':bpm,'tonicMidi':tonic,'bars':32,'duration':round(duration,3),
            'url':'./assets/music/'+destination.name,'bytes':destination.stat().st_size,
            'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),
            'score':{'progression':family,'groove':groove,'phrase':phrase},'sourcePeak':round(peak,5),'sourceRms':round(rms,5)}

def main():
    out=GAME/'assets/music';out.mkdir(parents=True,exist_ok=True)
    tracks=[]
    for i,score in enumerate(SCORES,1):
        track=compose(i,score,out/f'fruit-{i:02d}.mp3');tracks.append(track)
        print(f'{i:02d}: {track["title"]} ({track["duration"]} s)',flush=True)
    manifest={'title':'Fruit Slice: Sunset Sessions','style':'Original playful arcade instrumentals with mallets, plucked keys, bass and percussion',
              'provenance':'Procedurally composed and synthesized for WebGameArena; no third-party songs, recordings or samples.',
              'renderer':'tools/build-fruit-soundtrack.py','sampleRate':SR,'channels':2,'bitrateKbps':112,
              'mastering':{'integratedLufs':-18,'truePeakDb':-2.5},'tracks':tracks}
    (out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    public=[{k:t[k] for k in ['id','title','bpm','duration','url']} for t in tracks]
    (GAME/'fruit-music.js').write_text('/* Original Fruit Slice per-stage soundtrack catalogue. */\n(function(root){\n  const tracks='+json.dumps(public,separators=(',',':'))+';\n  if(typeof module==="object"&&module.exports)module.exports=tracks;else root.FruitMusic=tracks;\n})(typeof window!=="undefined"?window:globalThis);\n')

if __name__=='__main__': main()
