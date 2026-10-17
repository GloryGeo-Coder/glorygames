"""Original racing sound design and four composed instrumental loops.
Requires NumPy and ffmpeg; never downloads audio. Existing audio is untouched.
"""
from pathlib import Path
import json, math, subprocess, tempfile, wave, hashlib
import numpy as np

OUT=Path(__file__).resolve().parents[1]/'apps/web/public/games/high-spead-racer/assets/audio/racing'
SR=44100
rng=np.random.default_rng(1602026)

def time(seconds): return np.arange(round(seconds*SR))/SR
def fade(a,seconds=.008):
    a=a.copy(); n=min(len(a)//2,round(seconds*SR)); ramp=np.linspace(0,1,n)
    if a.ndim>1:ramp=ramp[:,None]
    a[:n]*=ramp;a[-n:]*=ramp[::-1];return a
def save(name,a,mp3=False):
    a=np.nan_to_num(a);a-=np.mean(a,axis=0)
    peak=np.max(np.abs(a));a=a/max(peak,1e-9)*.84
    if a.ndim==1:a=np.column_stack((a,a))
    pcm=(np.clip(a,-.98,.98)*32767).astype('<i2')
    OUT.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory() as d:
        p=Path(d)/'source.wav'
        with wave.open(str(p),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
        dest=OUT/name
        if mp3: subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-codec:a','libmp3lame','-b:a','112k','-write_xing','1',str(dest)],check=True)
        else: dest.write_bytes(p.read_bytes())
    return {'file':name,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'seconds':round(len(a)/SR,4),'bytes':dest.stat().st_size,'peak':round(float(np.max(np.abs(a))),4),'rms':round(float(np.sqrt(np.mean(a*a))),4)}

def engine(hz):
    t=time(1); phase=math.tau*hz*t+.045*np.sin(math.tau*7*t)
    # Firing pulses, exhaust harmonics, intake whine and subharmonic body.
    body=sum(np.sin(phase*i+i*.19)/i**1.25 for i in range(1,14))
    body+=.24*np.sin(phase*.5)+.13*np.sin(phase*2.5)
    body*=.9+.1*np.sin(math.tau*11*t)
    body=np.tanh(body*1.3)
    return np.column_stack((body,body*.94+.06*np.sin(phase+.18)))

def synthwave(bpm,root,variant):
    beat=60/bpm; seconds=beat*64; n=round(seconds*SR); mix=np.zeros((n,2))
    def add(start,sound,gain=1,pan=0):
        offset=round(start*SR); end=min(n,offset+len(sound)); sound=sound[:end-offset]
        if sound.ndim==1:sound=np.column_stack((sound*np.sqrt((1-pan)/2),sound*np.sqrt((1+pan)/2)))
        mix[offset:end]+=sound*gain
    def note(freq,dur,tone='pluck'):
        t=time(dur); ph=math.tau*freq*t
        if tone=='bass':y=np.sin(ph)+.22*np.sin(2*ph)+.10*np.sin(3*ph); env=(1-np.exp(-t*200))*np.exp(-t*5)
        elif tone=='pad':y=np.sin(ph)+.2*np.sin(ph*2)+.12*np.sin(ph*1.003); env=np.minimum(t/.18,1)*np.minimum((dur-t)/.35,1)*.6
        else:y=np.sin(ph)+.24*np.sin(ph*2)+.1*np.sin(ph*3);env=(1-np.exp(-t*300))*np.exp(-t*8)
        return fade(y*env,.004)
    chord_roots=[0,-3,-5,-2] if variant%2==0 else [0,3,-2,-5]
    melody=[0,7,12,10,7,3,5,7,12,15,14,10,7,5,3,7]
    for bar in range(16):
        c=chord_roots[(bar//2)%4]
        # Four chord changes, stereo pads and a varied two-bar lead phrase.
        for semitone in [0,3,7]:
            f=root*2**((c+semitone)/12);add(bar*4*beat,note(f,beat*4,'pad'),.11,-.45 if semitone==0 else .45)
        for step in range(8):
            start=(bar*4+step*.5)*beat
            bass=root*.5*2**((c+(7 if step in [3,7] else 0))/12)
            add(start,note(bass,beat*.43,'bass'),.38)
            f=root*2**((c+melody[(bar*8+step+variant*3)%16])/12)
            add(start,note(f,beat*.75),.16,-.35 if step%2 else .35)
            if start+beat*.375<seconds:add(start+beat*.375,note(f*.5,beat*.4),.04,.4 if step%2 else -.4)
        for step in range(4):
            start=(bar*4+step)*beat;t=time(.3)
            phase=math.tau*(45*t+90*.035*(1-np.exp(-t/.035)))
            kick=np.sin(phase)*np.exp(-t*18)+rng.normal(0,.09,len(t))*np.exp(-t*180)
            add(start,fade(kick,.002),.55)
            if step in [1,3]:
                t=time(.19);noise=rng.normal(0,1,len(t));noise=np.diff(noise,prepend=0)
                snare=(noise*.22+np.sin(math.tau*185*t)*.22)*np.exp(-t*23)
                add(start,fade(snare,.002),.38)
        for step in range(8):
            t=time(.09 if step%2 else .045);noise=rng.normal(0,1,len(t));noise=np.diff(noise,prepend=0)*np.exp(-t*65)
            add((bar*4+step*.5)*beat,fade(noise,.001),.045,.35 if step%2 else -.35)
    # Gentle master saturation, small loop seam fade; MP3 encoder delay is tagged.
    return fade(np.tanh(mix*1.2),.012)

def effects():
    result={}
    t=time(.28);result['gear_shift.wav']=fade((rng.normal(0,1,len(t))*.4+np.sin(math.tau*(190*t-140*t*t)))*np.exp(-t*22))
    t=time(.45);result['pass_whoosh.wav']=fade(rng.normal(0,1,len(t))*np.sin(np.pi*t/.45)**2*.4)
    t=time(.7);result['impact.wav']=fade((rng.normal(0,1,len(t))*.35+np.sin(math.tau*(65*t-25*t*t))*.65)*np.exp(-t*8))
    t=time(.6);result['pickup.wav']=fade((np.sin(math.tau*659*t)*np.exp(-t*9)+np.sin(math.tau*988*np.maximum(0,t-.1))*np.exp(-np.maximum(0,t-.1)*8)*(t>.1))*.5)
    t=time(1.6);result['finish.wav']=fade(sum(np.sin(math.tau*f*np.maximum(0,t-i*.12))*np.exp(-np.maximum(0,t-i*.12)*3)*(t>i*.12) for i,f in enumerate([440,554.37,659.25,880]))*.25)
    t=time(1);noise=sum(np.sin(math.tau*f*t+f) for f in [731,947,1327,1733,2503,3109])/6
    result['nitro_air.wav']=noise*(.7+.3*np.sin(math.tau*5*t))
    t=time(1);result['road_air.wav']=sum(np.sin(math.tau*f*t+f) for f in [113,197,317,509,811,1223,1709])/7
    return result

if __name__=='__main__':
    manifest=[save('engine_low.wav',engine(96)),save('engine_high.wav',engine(192))]
    for name,a in effects().items():manifest.append(save(name,a))
    for name,bpm,key,var in [('midnight_grid.mp3',124,110,0),('sunset_run.mp3',116,130.8128,1),('high_voltage.mp3',132,123.4708,2),('skyline_drive.mp3',120,146.8324,3)]:
        manifest.append(save(name,synthwave(bpm,key,var),True))
    (OUT/'audio.json').write_text(json.dumps({'original_composition':True,'sample_rate':SR,'tracks':manifest},indent=2)+'\n')
    print(json.dumps(manifest,indent=2))
