"""Build original, self-contained glTF 2.0 racing assets. Python standard library only.

Units: metres; Y up; vehicle nose points -Z. Geometry is batched by material.
Existing game GLBs remain untouched. Run from any working directory.
"""
from pathlib import Path
import math
import json
import struct
from collections import defaultdict

OUT = Path(__file__).resolve().parents[1] / 'apps/web/public/games/high-spead-racer/assets/models/neon'

def material(name, rgb, metal=0, rough=.5, emission=None, coat=False):
    m = {'name': name, 'pbrMetallicRoughness': {'baseColorFactor': [*rgb, 1],
         'metallicFactor': metal, 'roughnessFactor': rough}}
    if emission:
        m['emissiveFactor'] = emission
    if coat:
        m['extensions'] = {'KHR_materials_clearcoat': {'clearcoatFactor': 1, 'clearcoatRoughnessFactor': .15}}
    return m

class Model:
    def __init__(self, name, mats):
        self.name, self.mats = name, mats
        self.groups = defaultdict(list)
        self.transforms = {}

    def tri(self, name, mat, a, b, c):
        u, v = [b[i]-a[i] for i in range(3)], [c[i]-a[i] for i in range(3)]
        n = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]
        length = math.sqrt(sum(x*x for x in n))
        if length < 1e-9:
            return
        normal = [x/length for x in n]
        self.groups[name, mat].extend((list(p), normal) for p in (a,b,c))

    def quad(self, name, mat, a, b, c, d):
        self.tri(name, mat, a,b,c); self.tri(name, mat, a,c,d)

    def box(self, name, mat, pos, scale):
        x,y,z = pos; w,h,l = [s/2 for s in scale]
        p = [(x+sx*w,y+sy*h,z+sz*l) for sx,sy,sz in
             [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
        for a,b,c,d in [(0,3,2,1),(4,5,6,7),(0,4,7,3),(1,2,6,5),(3,7,6,2),(0,1,5,4)]:
            self.quad(name,mat,p[a],p[b],p[c],p[d])

    def loft(self, name, mat, sections):
        # Closed cross-sections, clockwise when viewed from the nose.
        rings=[]
        for z,w,lo,hi in sections:
            rings.append([(-w*.83,lo,z),(-w,lo+.12,z),(-w,hi-.10,z),(-w*.75,hi,z),
                          (w*.75,hi,z),(w,hi-.10,z),(w,lo+.12,z),(w*.83,lo,z)])
        for j in range(len(rings)-1):
            for i in range(8):
                self.quad(name,mat,rings[j][i],rings[j+1][i],rings[j+1][(i+1)%8],rings[j][(i+1)%8])
        for ring,reverse in [(rings[0],False),(rings[-1],True)]:
            for i in range(1,7):
                indices=(0,i+1,i) if reverse else (0,i,i+1)
                self.tri(name,mat,*(ring[k] for k in indices))

    def ring(self, name, mat, radius, width, segments=28):
        # Axle is X; local origin is the wheel centre.
        for i in range(segments):
            a,b=i*math.tau/segments,(i+1)*math.tau/segments
            for r0,r1,x0,x1 in [(radius,radius,-width/2,width/2),
                                (radius*.68,radius,-width/2,-width/2),
                                (radius,radius*.68,width/2,width/2)]:
                self.quad(name,mat,(x0,math.sin(a)*r0,math.cos(a)*r0),
                          (x1,math.sin(a)*r1,math.cos(a)*r1),
                          (x1,math.sin(b)*r1,math.cos(b)*r1),
                          (x0,math.sin(b)*r0,math.cos(b)*r0))

    def save(self, filename):
        blob=bytearray(); views=[]; accessors=[]; meshes=[]; nodes=[]
        def accessor(values, kind):
            data=struct.pack('<'+'f'*len(values),*values)
            offset=len(blob); blob.extend(data)
            views.append({'buffer':0,'byteOffset':offset,'byteLength':len(data),'target':34962})
            dim=3
            entry={'bufferView':len(views)-1,'componentType':5126,'count':len(values)//dim,'type':kind}
            if kind=='VEC3':
                entry['min']=[min(values[i::dim]) for i in range(dim)]
                entry['max']=[max(values[i::dim]) for i in range(dim)]
            accessors.append(entry); return len(accessors)-1
        for name in sorted({key[0] for key in self.groups}):
            primitives=[]
            for (group,mat),vertices in self.groups.items():
                if group!=name: continue
                p=accessor([x for v,n in vertices for x in v],'VEC3')
                n=accessor([x for v,n in vertices for x in n],'VEC3')
                primitives.append({'attributes':{'POSITION':p,'NORMAL':n},'material':mat,'mode':4})
            meshes.append({'name':name,'primitives':primitives})
            node={'name':name,'mesh':len(meshes)-1}
            if name in self.transforms: node['translation']=self.transforms[name]
            nodes.append(node)
        doc={'asset':{'version':'2.0','generator':'WebGameArena original racing asset builder'},
             'scene':0,'scenes':[{'name':self.name,'nodes':list(range(len(nodes)))}],
             'nodes':nodes,'meshes':meshes,'materials':self.mats,
             'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors,
             'extras':{'units':'metres','forward':'-Z','copyright':'Glory Mulopo / WebGameArena'}}
        if any('extensions' in m for m in self.mats): doc['extensionsUsed']=['KHR_materials_clearcoat']
        j=json.dumps(doc,separators=(',',':')).encode(); j+=b' '*((-len(j))%4)
        blob.extend(b'\0'*((-len(blob))%4))
        data=struct.pack('<III',0x46546c67,2,12+8+len(j)+8+len(blob))
        data+=struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(blob),0x004e4942)+blob
        OUT.mkdir(parents=True,exist_ok=True); (OUT/filename).write_bytes(data)
        return {'file':filename,'bytes':len(data),'triangles':sum(len(v)//3 for v in self.groups.values()),
                'draw_primitives':sum(len(m['primitives']) for m in meshes)}

def car(filename, color, variant):
    mats=[material('Ceramic metallic paint',color,.62,.23,coat=True),
          material('Carbon aero',(.018,.025,.036),.35,.35),
          material('Midnight glass',(.035,.085,.14),.72,.12,coat=True),
          material('Rubber',(.012,.015,.02),.05,.88),
          material('Forged alloy',(.42,.48,.56),.88,.19),
          material('Ice LED',(.65,.92,1),.2,.2,(.35,.85,1)),
          material('Rear LED',(1,.03,.08),.1,.2,(1,.012,.025))]
    m=Model('Neon racing vehicle',mats)
    # Distinct silhouette per preserved garage slot; no brand logos or external assets.
    width=[1.17,1.13,1.08,1.12][variant]
    h=[.90,1.02,.95,.88][variant]
    sections=[(-2.48,.76,.34,.58),(-2.18,width,.33,.77),(-1.53,width,.32,h),
              (-.70,width*.94,.32,.90),(.55,width*.94,.32,.93),(1.53,width,.32,.97),(2.34,width*.86,.38,.77)]
    m.loft('Coachwork',0,sections)
    m.loft('Coachwork',1,[(-2.5,.86,.24,.38),(-1.8,1.18,.24,.38),(1.85,1.18,.24,.38),(2.43,.98,.24,.42)])
    m.loft('Coachwork',2,[(-1.10,.68,.83,.95),(-.35,.77,.88,1.45),(.62,.72,.88,1.46),(1.24,.67,.88,1.02)])
    m.box('Coachwork',0,(0,1.46,.24),(1.22,.055,.89))
    for side in [-1,1]:
        # Window frames, skirts, sculpted fender blades, LED signatures.
        m.box('Coachwork',0,(side*.76,1.16,.60),(.045,.58,.055))
        m.box('Coachwork',1,(side*1.12,.35,0),(.12,.16,3.7))
        m.box('Coachwork',0,(side*1.03,.92,-1.5),(.29,.08,.75))
        m.box('Coachwork',5,(side*.72,.72,-2.2),(.66,.055,.09))
        m.box('Coachwork',5,(side*.98,.68,-2.14),(.055,.13,.12))
        m.box('Coachwork',6,(side*.70,.80,2.28),(.74,.045,.08))
        m.box('Coachwork',1,(side*.70,.48,-2.40),(.62,.17,.10))
        m.box('Coachwork',1,(side*.90,.83,.55),(.24,.18,.75))
        m.box('Coachwork',4,(side*.53,.47,2.39),(.24,.13,.15))
        for i in range(5):
            m.box('Coachwork',1,(side*.6,.96,1.18+i*.15),(.52,.035,.065))
    m.box('Coachwork',1,(0,.80,-1.64),(.20,.035,.8))
    # Rear aero wing: supports are separate surfaces in the batched carbon mesh.
    for x in [-.74,.74]: m.box('Coachwork',1,(x,1.15,1.96),(.08,.59,.13))
    m.box('Coachwork',1,(0,1.46,2.04),(2.39,.08,.40))
    for x in [-1.20,1.20]: m.box('Coachwork',0,(x,1.48,2.04),(.04,.24,.45))
    for i in range(-3,4): m.box('Coachwork',1,(i*.22,.32,2.35),(.035,.21,.36))
    for side in [-1,1]:
        for z,label in [(-1.52,'F'),(1.54,'R')]:
            name=f'Wheel_{label}{"L" if side<0 else "R"}'
            m.transforms[name]=[side*1.06,.45,z]
            m.ring(name,3,.45,.29)
            m.ring(name,4,.31,.30)
            for face in [-1,1]:
                for i in range(10):
                    a=i*math.tau/10; b=a+.13
                    m.quad(name,4,(face*.155,math.sin(a)*.07,math.cos(a)*.07),
                           (face*.155,math.sin(a)*.30,math.cos(a)*.30),
                           (face*.155,math.sin(b)*.30,math.cos(b)*.30),
                           (face*.155,math.sin(b)*.07,math.cos(b)*.07))
    return m.save(filename)

def road():
    mats=[material('Wet graphite asphalt',(.038,.047,.065),.55,.25),
          material('Barrier alloy',(.10,.14,.20),.7,.3),
          material('Cyan edge',(.03,.65,.9),.1,.3,(.015,.65,1)),
          material('Magenta edge',(.7,.02,.32),.1,.3,(1,.015,.25)),
          material('Lane reflectors',(.72,.82,.89),.15,.35,(.11,.16,.20))]
    m=Model('128 metre seamless neon highway',mats)
    m.box('Highway',0,(0,-.10,-64),(13.8,.20,128))
    for s in [-1,1]:
        m.box('Highway',1,(s*7.5,-.16,-64),(1.2,.3,128))
        m.box('Highway',1,(s*7.7,.65,-64),(.16,.18,128))
        m.box('Highway',2 if s<0 else 3,(s*7.7,.77,-64),(.06,.055,128))
        m.box('Highway',2 if s<0 else 3,(s*6.64,.012,-64),(.10,.02,128))
        for i in range(16): m.box('Highway',1,(s*7.7,.27,-i*8-4),(.10,.74,.1))
    for x in [-2.18,2.18]:
        for i in range(16): m.box('Highway',4,(x,.012,-i*8-3),(.15,.015,3.1))
    return m.save('neon_highway_128.glb')

def tower(filename, variant):
    mats=[material('Obsidian facade',(.035,.055,.09),.45,.3),
          material('Cyan windows',(.07,.30,.48),.1,.35,(.025,.28,.50)),
          material('Warm offices',(.4,.27,.12),.05,.5,(.38,.23,.08)),
          material('Neon architecture',(.42,.015,.24),.3,.3,(.8,.008,.30))]
    m=Model('Neon skyline tower',mats)
    height=18+variant*7; width=5.4+variant*.5
    m.box('Skyline',0,(0,height/2,0),(width,height,5))
    m.box('Skyline',0,(0,height+1.2,0),(width*.60,2.4,4))
    for x in [-width/2,width/2]: m.box('Skyline',3,(x,height/2,2.51),(.055,height,.055))
    for y in range(2,int(height),2):
        for x in [-1.7,-.85,0,.85,1.7]:
            mat=2 if (int(y)+int(x*10))%7==0 else 1
            for z in [-2.51,2.51]: m.box('Skyline',mat,(x,y,z),(.46,.58,.035))
    for y in [height*.2,height*.7,height]: m.box('Skyline',3,(0,y,0),(width+.12,.07,5.12))
    m.box('Skyline',1,(0,height+4,0),(.08,5,.08))
    return m.save(filename)

if __name__=='__main__':
    results=[car('apex_red.glb',(.72,.015,.035),0),car('muscle_gold.glb',(.87,.34,.025),1),
             car('gt_silver.glb',(.38,.44,.53),2),car('coupe_blue.glb',(.015,.23,.62),3),road(),
             tower('skyline_cyan.glb',0),tower('skyline_magenta.glb',1)]
    (OUT/'assets.json').write_text(json.dumps({'version':1,'original_assets':True,'assets':results},indent=2)+'\n')
    print(json.dumps(results,indent=2))
