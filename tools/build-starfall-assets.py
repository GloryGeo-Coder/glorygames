"""Original compact Starfall spacecraft and landmarks. No existing assets are regenerated.
Uses the repository's standard-library glTF geometry writer. +Y up, nose +Z.
"""
from pathlib import Path
import importlib.util, math, json, struct, hashlib
spec=importlib.util.spec_from_file_location('wga_geometry',Path(__file__).with_name('build-high-speed-racer-assets.py'))
g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
g.OUT=Path(__file__).resolve().parents[1]/'apps/web/public/games/space-dodger/assets/models/starfall'
M=g.Model;mat=g.material
assets=[]
def save(m,name):
    entry=m.save(name);p=g.OUT/name;b=p.read_bytes();n=struct.unpack_from('<I',b,12)[0];doc=json.loads(b[20:20+n]);doc['asset']['generator']='WebGameArena original Starfall asset builder';doc['extras']['forward']='+Z'
    j=json.dumps(doc,separators=(',',':')).encode();j+=b' '*((-len(j))%4);tail=b[20+n:];data=struct.pack('<III',0x46546c67,2,20+len(j)+len(tail))+struct.pack('<II',len(j),0x4e4f534a)+j+tail;p.write_bytes(data)
    entry.update(bytes=len(data),sha256=hashlib.sha256(data).hexdigest());assets.append(entry)
def disk(m,name,material,x,y,z,r,n=12):
    for i in range(n):
        a,b=i*math.tau/n,(i+1)*math.tau/n;m.tri(name,material,(x,y,z),(x+r*math.cos(a),y+r*math.sin(a),z),(x+r*math.cos(b),y+r*math.sin(b),z))
def wing(m,name,material,side,width,z):
    a=(side*.42,-.05,z+.85);b=(side*width,-.16,z-.65);c=(side*(width-.18),-.16,z-1.15);d=(side*.38,-.05,z-.75)
    m.quad(name,material,a,b,c,d);m.quad(name,material,(a[0],a[1]-.13,a[2]),(d[0],d[1]-.13,d[2]),(c[0],c[1]-.13,c[2]),(b[0],b[1]-.13,b[2]))
    m.quad(name,1,b,(b[0],b[1]-.13,b[2]),(c[0],c[1]-.13,c[2]),c)
def fighter(file,variant):
    hero=variant==0;color=[(.72,.79,.89),(.16,.20,.28),(.27,.17,.22),(.21,.26,.28)][variant]
    mats=[mat('Armour panels',color,.25,.35),mat('Carbon framing',(.025,.035,.06),.2,.55),mat('Cockpit glass',(.025,.12,.20),.28,.2),mat('Signal red',(.75,.045,.075),.2,.36,(.45,.01,.025)),mat('Blue engine',(.12,.65,.94),.1,.3,(.2,.8,1))]
    m=M('Starfall '+('pathfinder' if hero else 'interceptor'),mats)
    m.loft('Hull',0,[(-1.75,.52,-.18,.20),(-.7,.67,-.22,.38),(.5,.55,-.18,.30),(1.7,.22,-.08,.13),(2.1,.035,-.01,.05)])
    m.loft('Hull',2,[(-.6,.30,.26,.38),(0,.35,.30,.63),(.75,.23,.24,.46),(1.05,.16,.17,.24)])
    for side in [-1,1]:
        wing(m,'Hull',0,side,[1.9,1.45,1.8,1.7][variant],-.15)
        m.box('Hull',3,(side*1.32,-.06,-.65),(.12,.08,1.25));m.box('Hull',1,(side*1.77,-.12,-.25),(.13,.15,1.6))
        m.box('Hull',0,(side*.55,.03,-1.37),(.48,.43,.90));disk(m,'Hull',4 if hero else 3,side*.55,.03,-1.84,.19)
        m.box('Hull',1,(side*.55,.28,-1.2),(.09,.58,.56));m.box('Hull',3,(side*.22,.37,-.25),(.08,.03,.76))
        for i in range(5):m.box('Hull',1,(side*.7,.13,-.8+i*.22),(.14,.05,.06))
    if variant==2:
        for x in [-1,0,1]:m.box('Hull',0,(x*.6,.24,-.65),(.45,.4,.85))
    disk(m,'Nose',4 if hero else 3,0,.02,2.105,.035)
    save(m,file)
def fortress():
    mats=[mat('Fortress armour',(.08,.10,.16),.28,.48),mat('Reactor red',(.95,.03,.16),.1,.32,(1,.015,.08)),mat('Silver braces',(.30,.37,.46),.4,.32)]
    m=M('Starfall Sovereign citadel',mats)
    m.loft('Citadel',0,[(-2.5,1.8,-.9,.2),(-1.2,4,-.8,.65),(1.1,3.5,-.65,.85),(2.2,2.3,-.4,.3)])
    for side in [-1,1]:
        for i in range(4):
            x=side*(.9+i*.66);h=2.8-i*.55
            m.box('Citadel',0,(x,.8+h*.42,-.65+i*.3),(.55,h,.65));m.box('Citadel',1,(x,.7+h*.57,-.28+i*.3),(.09,.36,.035))
        for z in [-1.6,-.7,.2,1.1]:m.box('Citadel',2,(side*2.7,.32,z),(1.3,.10,.17))
        for x in [1.4,2.7]:
            m.box('Citadel',0,(side*x,-.25,2),(.33,.42,2));disk(m,'Citadel',1,side*x,-.25,3.01,.17)
    m.box('Citadel',2,(0,.05,2.22),(1.4,1.35,.24));disk(m,'Reactor',1,0,.03,2.38,.55,16)
    for i in range(18):
        a=i*math.tau/18;x,y=math.cos(a)*.89,math.sin(a)*.89;m.box('Citadel',2,(x,y,2.26),(.10,.16,.18))
    save(m,'sovereign_citadel.glb')
def rock(file,ice=False):
    mats=[mat('Rock',(.24,.30,.38) if ice else (.14,.10,.13),.1,.78),mat('Crystal seams' if ice else 'Lava seams',(.1,.6,.8) if ice else (.8,.10,.01),0,.5,(.1,.5,.8) if ice else (.8,.08,.008))]
    m=M('Crystal shard' if ice else 'Fractured asteroid',mats)
    rings=[]
    for j,(y,r) in enumerate([(-1,.3),(-.5,.94),(.3,1.02),(.85,.47)]):
        rings.append([(math.cos(i*math.tau/9)*r*(1+.14*math.sin(i*9+j)),y,math.sin(i*math.tau/9)*r) for i in range(9)])
    for j in range(3):
        for i in range(9):m.quad('Asteroid',1 if (i+j*3)%8==0 else 0,rings[j][i],rings[j][(i+1)%9],rings[j+1][(i+1)%9],rings[j+1][i])
    for i in range(9):m.tri('Asteroid',0,(0,-1.05,0),rings[0][(i+1)%9],rings[0][i]);m.tri('Asteroid',0,(0,1,0),rings[-1][i],rings[-1][(i+1)%9])
    save(m,file)
def relay():
    m=M('Remnant command relay',[mat('Relay alloy',(.20,.24,.33),.3,.4),mat('Red signal',(1,.06,.18),.1,.3,(1,.02,.08))])
    m.box('Relay',0,(0,0,0),(.65,.65,.65))
    for side in [-1,1]:
        m.box('Relay',0,(side*1.15,0,0),(1.5,.08,.95));m.box('Relay',1,(side*1.2,.055,0),(1.2,.03,.55))
        m.box('Relay',0,(0,side*.9,0),(.1,1.4,.12))
    disk(m,'Relay',1,0,0,.34,.22);save(m,'command_relay.glb')
def ark():
    m=M('Dawn Ark rescue ship',[mat('Ark hull',(.6,.65,.7),.2,.5),mat('Ark blue',(.03,.45,.8),.1,.4,(.02,.6,1)),mat('Ark dark',(.035,.06,.12),.15,.6)])
    m.loft('Ark',0,[(-2.6,.55,-.5,.5),(-1.8,1.1,-.55,.65),(1.1,.95,-.55,.6),(2.6,.2,-.2,.2)])
    for side in [-1,1]:
        for z in [-1.5,-.3,.9]:m.box('Ark',2,(side*1.08,0,z),(.35,1.05,1.0));m.box('Ark',1,(side*1.27,.16,z),(.02,.12,.6))
        m.box('Ark',0,(side*.72,.1,-2.25),(.55,.65,.7));disk(m,'Ark',1,side*.72,.1,-2.61,.22)
    save(m,'dawn_ark.glb')
def ring():
    m=M('Orbital navigation ring',[mat('Station metal',(.20,.27,.35),.3,.45),mat('Guide cyan',(.08,.65,.85),.1,.3,(.02,.7,1))])
    for i in range(24):
        a,b=i*math.tau/24,(i+1)*math.tau/24
        for r0,r1,z in [(9,10,-.5),(10,9,.5)]:m.quad('Ring',0,(math.cos(a)*r0,math.sin(a)*r0,z),(math.cos(b)*r0,math.sin(b)*r0,z),(math.cos(b)*r1,math.sin(b)*r1,z),(math.cos(a)*r1,math.sin(a)*r1,z))
        m.quad('Ring',1,(math.cos(a)*9.1,math.sin(a)*9.1,-.52),(math.cos(b)*9.1,math.sin(b)*9.1,-.52),(math.cos(b)*9.25,math.sin(b)*9.25,-.52),(math.cos(a)*9.25,math.sin(a)*9.25,-.52))
    save(m,'orbital_ring.glb')
def pod():
    m=M('Survey crew escape pod',[mat('Pod shell',(.68,.74,.79),.15,.4),mat('Rescue beacon',(.06,.8,.35),0,.3,(.04,1,.4)),mat('Pod window',(.025,.07,.13),.2,.3)])
    m.loft('Pod',0,[(-.9,.25,-.25,.25),(-.5,.45,-.38,.40),(.45,.45,-.38,.40),(.85,.22,-.2,.2)])
    m.box('Pod',2,(0,.4,0),(.5,.03,.6));m.box('Pod',1,(0,.05,.85),(.18,.18,.05));m.box('Pod',1,(.45,0,0),(.02,.18,.5));m.box('Pod',1,(-.45,0,0),(.02,.18,.5));save(m,'escape_pod.glb')
if __name__=='__main__':
    for name,index in [('pathfinder.glb',0),('red_scout.glb',1),('siege_fighter.glb',2),('warden_drone.glb',3)]:fighter(name,index)
    fortress();rock('lava_asteroid.glb');rock('cryo_shard.glb',True);relay();ark();ring();pod()
    (g.OUT/'assets.json').write_text(json.dumps({'license':'Original WebGameArena assets; Glory Mulopo','forward':'+Z','assets':assets},indent=2)+'\n')
    print(json.dumps(assets,indent=2))
