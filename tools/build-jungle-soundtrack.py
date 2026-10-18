"""Compose Lost Jungle's original adventure score with NumPy, SciPy and FFmpeg.

All instruments, percussion and forest accents are synthesized here. No external
recordings, samples, songs or artist imitations are used. Run from any directory.
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
GAME = ROOT / 'apps/web/public/games/lost-jungle-3d-temple-of-the-sun'
SR = 44100
# Title, biome, BPM, tonic MIDI, scale, harmonic route and melodic identity.
SCORES = [
 ('The Emerald Trail','Jungle',106,45,'dorian',[0,3,5,4],0),
 ('River of First Light','River',96,50,'major',[0,4,5,3],1),
 ('Beyond the Waterfall','Waterfall',102,47,'minor',[0,5,3,4],2),
 ('Roots beneath the Moon','Cave',88,48,'minor',[0,3,5,4],3),
 ('The Canopy Road','Canopy',112,43,'dorian',[0,5,3,4],4),
 ('The Stone Sundial','Ruins',98,50,'minor',[0,3,1,4],5),
 ('Echoes in Amber','Crystal',92,47,'minor',[0,5,2,3],6),
 ('Lanterns in the Leaves','Village',100,41,'major',[0,3,5,4],7),
 ('Embers of the Lost Valley','Volcano',120,50,'minor',[0,5,3,4],8),
 ('Dawn at the Sun Temple','Sun Temple',108,48,'major',[0,5,3,4],9),
]
SCALES = {'major':[0,2,4,5,7,9,11], 'minor':[0,2,3,5,7,8,10], 'dorian':[0,2,3,5,7,9,10]}
MOTIFS = [[0,2,4,6,4,2,1,0],[4,2,1,0,2,4,5,4],[0,1,4,5,6,4,2,1],
          [0,4,3,1,0,2,1,-1],[0,2,4,2,5,4,6,4],[4,3,1,0,2,1,4,3],
          [2,4,6,5,4,2,1,0],[0,2,1,4,3,2,5,4],[0,0,4,3,2,1,4,6],
          [0,2,4,7,6,4,5,7]]

def hz(note):
    return 440 * 2 ** ((note-69)/12)

def instrument(kind, note, length, seed):
    t = np.arange(max(32, round(length*SR)),dtype=np.float64)/SR
    f = hz(note); rng = np.random.default_rng(seed); phase = 2*np.pi*f*t
    if kind == 'marimba':
        y = (np.sin(phase)*np.exp(-t/.38) + .35*np.sin(phase*3.99)*np.exp(-t/.065)
             + .10*np.sin(phase*9.98)*np.exp(-t/.025))
    elif kind == 'flute':
        vibrato = .004*np.sin(2*np.pi*5.1*t)*np.minimum(1,t/.25)
        p = phase + 2*np.pi*f*np.cumsum(vibrato)/SR
        breath = lfilter([1,-.8],[1,-.2],rng.normal(0,.025,len(t)))
        y = (np.sin(p)+.13*np.sin(2*p)+.035*np.sin(3*p)+breath)
        y *= np.minimum(1,t/.055)*np.minimum(1,(length-t)/.16)*.8
    elif kind == 'strings':
        y = np.zeros_like(t)
        for h in range(1,6):
            y += (np.sin(phase*h*.999)+np.sin(phase*h*1.001))/(h*h*2)
        y *= np.minimum(1,t/.24)*np.minimum(1,(length-t)/.4)*.7
    elif kind == 'bass':
        y = (np.sin(phase)+.18*np.sin(2*phase))*np.exp(-t/.5)
    elif kind in ('drum','tom'):
        base = 78 if kind=='drum' else f
        p = 2*np.pi*(base*t+base*.7*.018*(1-np.exp(-t/.018)))
        y = (np.sin(p)*np.exp(-t/.16)+.32*np.sin(p*1.59)*np.exp(-t/.055)
             + rng.normal(0,.13,len(t))*np.exp(-t/.009))
    elif kind == 'shaker':
        y = lfilter([1,-1],[1,-.25],rng.normal(0,.5,len(t)))*np.exp(-t/.024)
    elif kind == 'wood':
        y = (np.sin(phase)+.35*np.sin(phase*2.41))*np.exp(-t/.017)
    elif kind == 'chime':
        y = (np.sin(phase)*np.exp(-t/.85)+.18*np.sin(phase*2.76)*np.exp(-t/.24))
    else:  # quiet synthesized canopy bird, rather than a sampled recording
        p = 2*np.pi*(1700*t+1800*.075*(1-np.exp(-t/.075)))
        y = np.sin(p+1.6*np.sin(2*np.pi*19*t))*np.exp(-t/.09)*.4
    y *= np.minimum(1,t/.004)*np.minimum(1,(length-t)/.012)
    return y.astype(np.float32)

def compose(number, score, destination):
    title,biome,bpm,tonic,scale_name,progression,phrase = score
    scale = SCALES[scale_name];beat=60/bpm;duration=40*4*beat
    mix = np.zeros((round(duration*SR),2),np.float32);cache={}
    def pitch(degree,octave=0):
        return tonic+scale[degree%7]+12*(degree//7+octave)
    def add(kind,note,at,length,gain,pan=0,room=0):
        key=(kind,note,round(length,4))
        if key not in cache:cache[key]=instrument(kind,note,length,2500+number*111+len(cache))
        wave=cache[key]
        def put(time,level,panning):
            start=round(time*SR)
            if start<0 or start>=len(mix):return
            n=min(len(wave),len(mix)-start)
            mix[start:start+n,0]+=wave[:n]*level*np.sqrt((1-panning)/2)
            mix[start:start+n,1]+=wave[:n]*level*np.sqrt((1+panning)/2)
        put(at,gain,pan)
        if room:
            for delay,level,side in [(.079,.55,-.65),(.149,.32,.6),(.239,.2,-.3)]:
                put(at+delay,gain*room*level,side*pan)
    for bar in range(40):
        at=bar*4*beat;intro=bar<4;bridge=16<=bar<24;final=bar>=32
        energy=.68 if intro else .62 if bridge else 1.05 if final else .9
        degree=progression[(bar//2)%4]
        # Smooth string harmony under a clear, pentatonic-leaning adventure melody.
        if bar%2==0:
            for j in [0,2,4,6]:add('strings',pitch(degree+j,1),at,beat*7.9,.055*energy,(j-3)*.17,.2)
        for b in [0,2]:
            add('bass',pitch(degree,-1),at+b*beat,beat*1.75,.22*energy)
        drum_steps=[0,6,11,14] if number%2 else [0,3,8,10,14]
        for step in range(16):
            time=at+step*beat/4+(.017 if step%2 else 0)
            if not bridge or step%2==0:add('shaker',60,time,.12,(.021 if step%2 else .014)*energy,(-.5 if step%2 else .5))
            if step in drum_steps and (not bridge or step in [0,8]):
                add('drum',36,time,.42,(.28 if step in [0,8] else .17)*energy,-.08)
            if step in [4,12]:add('tom',55+(number%3)*2,time,.22,.13*energy,.24,.1)
            if step in [2+(number%3),9,15] and not intro:
                add('wood',78+number%4,time,.09,.055*energy,(-.4 if step%2 else .4),.25)
        arp=[0,4,2,6,4,2,0,2]
        for j,d in enumerate(arp):
            if bridge and j%2:continue
            add('marimba',pitch(degree+d,1),at+(j*.5+(phrase%2)*.125)*beat,.85,
                .075*energy*(.7 if j%2 else 1),(-.32 if j%2 else .32),.48)
        if not intro and bar%4 in [0,1,2]:
            positions=[0,.75,1.5,2.5] if phrase%2 else [.25,1,2,3]
            for j,pos in enumerate(positions):
                d=MOTIFS[phrase][(j+4*(bar%2))%8]
                # Keep the tune anchored to the tonic; answer phrases lift in the return.
                lift=7 if final and j==3 else 0
                add('flute',pitch(d+lift,2),at+pos*beat,beat*(.64 if j<3 else .9),.105*energy,(-.14 if bar%2 else .14),.5)
        if number in [4,7,10] and bar%4==2:
            for j in [0,4,7]:add('chime',pitch(j,2),at+(j%3)*beat,1.7,.045,-.35+j*.08,.55)
        if number in [1,2,3,5,8] and bar%8==5:add('bird',84,at+3*beat,.3,.035,.55,.4)
        if bar%8==7 and not bridge:
            for j in range(4):add('tom',57-j*2,at+(3+j*.25)*beat,.22,.08+j*.012,(j-1.5)*.23,.15)
    # Small seam fades prevent clicks. Each arrangement ends on a return harmony.
    mix=np.tanh(mix*.9);fade=round(.025*SR)
    mix[:fade]*=np.linspace(0,1,fade)[:,None];mix[-fade:]*=np.linspace(1,0,fade)[:,None]
    source_rms=float(np.sqrt(np.mean(mix**2)))
    with tempfile.TemporaryDirectory(prefix='jungle-score-') as temp:
        wav=Path(temp)/'master.wav';wavfile.write(wav,SR,(mix*32767).astype(np.int16))
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),
                        '-af','loudnorm=I=-18:TP=-2.5:LRA=8','-ar',str(SR),'-ac','2',
                        '-codec:a','libmp3lame','-b:a','128k','-map_metadata','-1',
                        '-metadata','title='+title,'-metadata','artist=WebGameArena',
                        '-metadata','album=Lost Jungle: The Sunlit Expedition',str(destination)],check=True)
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(destination)],text=True))
    return {'id':number,'title':title,'biome':biome,'bpm':bpm,'tonicMidi':tonic,'scale':scale_name,
            'bars':40,'duration':round(duration,3),'encodedDuration':float(probe['format']['duration']),
            'url':'./assets/music/'+destination.name,'bytes':destination.stat().st_size,
            'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),'sourceRms':round(source_rms,6),
            'score':{'progression':progression,'motif':phrase}}

def main():
    out=GAME/'assets/music';out.mkdir(parents=True,exist_ok=True);tracks=[]
    for i,score in enumerate(SCORES,1):
        t=compose(i,score,out/f'jungle-{i:02d}.mp3');tracks.append(t)
        print(f'{i:02d}: {t["title"]} ({t["duration"]} s)',flush=True)
    manifest={'title':'Lost Jungle: The Sunlit Expedition','style':'Original jungle adventure instrumentals',
              'provenance':'Composed and synthesized for WebGameArena; no third-party songs, recordings or samples.',
              'renderer':'tools/build-jungle-soundtrack.py','sampleRate':SR,'channels':2,'bitrateKbps':128,
              'mastering':{'integratedLufs':-18,'truePeakDb':-2.5},'tracks':tracks}
    (out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    public=[{k:t[k] for k in ['id','title','biome','bpm','duration','url']} for t in tracks]
    (GAME/'jungle-music.js').write_text('/* Original Lost Jungle soundtrack catalogue; themeId selects the biome. */\n(function(root){\n  const tracks='+json.dumps(public,separators=(',',':'))+';\n  if(typeof module==="object"&&module.exports)module.exports=tracks;else root.JungleMusic=tracks;\n})(typeof window!=="undefined"?window:globalThis);\n')

if __name__=='__main__':main()
