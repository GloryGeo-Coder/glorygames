"""Compose City Quest's original instrumental score; requires numpy, scipy and ffmpeg.

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
GAME = ROOT / 'apps/web/public/games/city-quest-rise-of-the-guardian'
SR = 44100
# Title, tempo, tonic MIDI, progression family, bass groove, lead phrase.
SCORES = [
 ('Dawn over the Rooftops',110,45,0,0,0),('Main Street Bounce',112,48,1,1,1),
 ('Market Day Keys',111,43,2,2,2),('Last Taxi Home',114,46,3,3,3),
 ('Below the City',108,42,4,4,4),('Guardian in the Rank',115,44,1,5,5),
 ('Railway Afterglow',113,47,2,0,6),('Bridge to the Skyline',110,41,3,1,7),
 ('Vault of Echoes',109,40,4,2,8),('The First Crown',116,45,0,3,9),
 ('Ubuntu Sundown',110,48,2,4,10),('Sunrise at the Exchange',113,43,0,5,11),
 ('Spaza Street Shuffle',112,46,3,0,12),('Schoolyard Memories',109,41,1,1,13),
 ('Colours of the Square',115,44,4,2,14),('Garden Conversations',108,47,0,3,15),
 ('Crossing with Care',111,42,3,4,16),('Commuter Rhythm',114,45,2,5,17),
 ('Second Life Groove',112,40,1,0,18),('Waterline Guardian',116,43,4,1,19),
 ('Festival on the Avenue',114,46,0,2,20),('Solar Gold',111,41,2,3,21),
 ('Above the Water Tower',110,44,3,4,22),('Lanterns after Dark',113,47,1,5,23),
 ('Home is Ubuntu',115,48,4,0,24),
]
PROGRESSIONS = [[0,5,8,7],[0,8,3,10],[0,3,5,8],[0,10,8,5],[0,5,3,7]]
GROOVES = [[0,3,6,10,11,14],[0,2,7,8,11,15],[1,4,6,9,12,14],
           [0,3,7,10,12,15],[0,2,5,8,11,14],[1,3,6,8,10,15]]
SCALE = [0,2,3,5,7,8,10,12,14,15]

def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)

def instrument(kind, note=48, length=.3, seed=0):
    t = np.arange(max(32, int(length * SR)), dtype=np.float64) / SR
    f = hz(note)
    rng = np.random.default_rng(seed)
    if kind == 'log':
        # Pitch drop and FM knock over a round, sustained sub: log-drum voice.
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
    else: # mellow mallet phrase
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
        intro=bar<4; breakdown=16<=bar<20
        energy=.65 if intro else .55 if breakdown else 1
        degree=progression[(bar//2)%4]
        root=tonic+degree
        # Diatonic minor/major colours with seventh/ninth extensions.
        chord=[0,3,7,10,14] if degree in (0,5,7) else [0,4,7,11,14]
        at=bar*4*beat
        for i,interval in enumerate(chord):
            add('keys',root+12+interval,at+(0.015*i),1.5,.11*energy,(i-2)*.16,.28)
            if bar%2==1: add('keys',root+12+interval,at+2.75*beat+.01*i,1.1,.065*energy,(2-i)*.16,.24)
            if bar%2==0: add('pad',root+12+interval,at,beat*7.8,.022,(i-2)*.18)
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
                add('log',bass,at+step*beat/4+(.028 if step%2 else 0),.52,.28*energy)
            if bar%4==3 and not breakdown:
                for j in range(3): add('log',root-12+[7,3,0][j],at+(3.25+j*.25)*beat,.28,.17)
        # Each district has its own eight-note motif, phrase placement and answer.
        if bar%4 in [1,3] and not intro:
            for j in range(4):
                degree_i=(phrase*3+j*(1+phrase%3)+(bar//4)%3)%len(SCALE)
                n=tonic+24+SCALE[degree_i]
                position=[.5,1.25,2.5,3.25][j]+(phrase%2)*.125
                add('mallet',n,at+position*beat,.65,.045*energy,(-.25 if j%2 else .25),.38)
        if bar%8==7 and not breakdown:
            for j in range(4): add('rim',48,at+(3+j*.25)*beat,.09,.025+j*.008,(j-1.5)*.2)
    # Soft saturation and short seam fades keep the repeat free from edge clicks.
    mix=np.tanh(mix*.95)
    fade=int(.025*SR); mix[:fade]*=np.linspace(0,1,fade)[:,None];mix[-fade:]*=np.linspace(1,0,fade)[:,None]
    peak=float(np.max(np.abs(mix))); rms=float(np.sqrt(np.mean(mix**2)))
    with tempfile.TemporaryDirectory(prefix='city-music-') as temp:
        wav=Path(temp)/'master.wav';wavfile.write(wav,SR,(mix*32767).astype(np.int16))
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),
                        '-af','loudnorm=I=-18:TP=-2:LRA=7','-ar',str(SR),'-ac','2',
                        '-codec:a','libmp3lame','-b:a','112k','-map_metadata','-1',
                        '-metadata','title='+title,'-metadata','artist=WebGameArena',
                        '-metadata','album=City Quest: Township Rhythms',str(destination)],check=True)
    return {'id':number,'title':title,'bpm':bpm,'tonicMidi':tonic,'bars':32,'duration':round(duration,3),
            'url':'./assets/music/'+destination.name,'bytes':destination.stat().st_size,
            'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),
            'score':{'progression':family,'groove':groove,'phrase':phrase},'sourcePeak':round(peak,5),'sourceRms':round(rms,5)}

def main():
    out=GAME/'assets/music';out.mkdir(parents=True,exist_ok=True)
    tracks=[]
    for i,score in enumerate(SCORES,1):
        track=compose(i,score,out/f'city-{i:02d}.mp3');tracks.append(track)
        print(f'{i:02d}: {track["title"]} ({track["duration"]} s)',flush=True)
    manifest={'title':'City Quest: Township Rhythms','style':'Original Amapiano-inspired instrumentals',
              'provenance':'Procedurally composed and synthesized for WebGameArena; no third-party songs, recordings or samples.',
              'renderer':'tools/build-city-soundtrack.py','sampleRate':SR,'channels':2,'bitrateKbps':112,
              'mastering':{'integratedLufs':-18,'truePeakDb':-2},'tracks':tracks}
    (out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    public=[{k:t[k] for k in ['id','title','bpm','duration','url']} for t in tracks]
    (GAME/'city-music.js').write_text('/* Original City Quest soundtrack catalogue. */\n(function(root){\n  const tracks='+json.dumps(public,separators=(',',':'))+';\n  if(typeof module==="object"&&module.exports)module.exports=tracks;else root.CityMusic=tracks;\n})(typeof window!=="undefined"?window:globalThis);\n')

if __name__=='__main__': main()
