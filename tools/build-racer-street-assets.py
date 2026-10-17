"""Six original GLB street landmarks, using the unchanged racing mesh exporter."""
from pathlib import Path
import importlib.util,json,math
spec=importlib.util.spec_from_file_location('racer_assets',Path(__file__).with_name('build-high-speed-racer-assets.py'))
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
a.OUT=Path(__file__).resolve().parents[1]/'apps/web/public/games/high-spead-racer/assets/models/streets'
M=a.material
mats=[M('Structural steel',(.07,.12,.16),.65,.38),M('Warm masonry',(.32,.16,.10),.1,.85),
      M('Cyan signage',(.06,.4,.5),.2,.3,(.02,.6,.8)),M('Amber windows',(.5,.27,.06),.1,.5,(.8,.35,.06)),
      M('Container red',(.38,.035,.045),.4,.55),M('Pale concrete',(.3,.33,.39),.1,.7)]
def silo(m,x,z,radius,height):
 for i in range(20):
  p,q=i*math.tau/20,(i+1)*math.tau/20
  m.quad('Landmark',0,(x+math.cos(p)*radius,0,z+math.sin(p)*radius),(x+math.cos(p)*radius,height,z+math.sin(p)*radius),(x+math.cos(q)*radius,height,z+math.sin(q)*radius),(x+math.cos(q)*radius,0,z+math.sin(q)*radius))
  m.tri('Landmark',5,(x,height+.6,z),(x+math.cos(q)*radius,height,z+math.sin(q)*radius),(x+math.cos(p)*radius,height,z+math.sin(p)*radius))
records=[]
for env in ['harbour','oldtown','industrial','tunnel','airport','skyway']:
 m=a.Model(env+' street landmark',mats)
 def box(mat,p,s):m.box('Landmark',mat,p,s)
 if env=='harbour':
  for layer in range(3):
   for col in range(3-layer):
    box(4 if col%2 else 0,(col*2.8,1.1+layer*2.2,0),(2.7,2.1,6))
    for rib in range(8):box(5,(col*2.8-1.36,1.1+layer*2.2,-2.6+rib*.75),(.035,1.9,.08))
  for x in [-3,7]:box(0,(x,7.5,0),(.55,15,.55))
  box(4,(2,15,0),(11,.8,1));box(3,(2,13,0),(.10,4,.1))
 elif env=='oldtown':
  for x in [-3.1,0,3.1]:
   box(1,(x,4.1,0),(3,8.2,4));box(5,(x,8.3,0),(3.15,.3,4.1))
   for floor in range(3):
    for side in [-.8,.8]:box(3,(x+side,1.5+floor*2.3,2.02),(.65,1.25,.05))
   box(0,(x,.9,2.03),(1.25,1.8,.08));box(2,(x,2.3,2.4),(2.8,.1,1))
 elif env=='industrial':
  for x,h in [(-2,10),(2,14)]:silo(m,x,0,1.6,h);box(3,(x,h+1,0),(.2,.4,.2))
  box(0,(0,5.5,3),(9,.5,.6));box(4,(4,3,2),(.5,6,.5))
  for y in range(1,11):box(5,(0,y,2),(.8,.07,.08))
 elif env=='tunnel':
  for x in [-8.7,8.7]:box(5,(x,3.6,0),(.45,7.2,24));box(2,(x*.98,4.8,0),(.07,.12,23.8))
  box(0,(0,7.3,0),(17.8,.35,24))
  for x in [-5,5]:box(2,(x,7.08,0),(.15,.06,23.9))
  for x in [-8.35,8.35]:box(0,(x,3.5,-10),(.25,7,.25))
 elif env=='airport':
  box(5,(0,2.8,0),(14,5.6,9));box(0,(0,2.5,4.55),(12,4.5,.1));box(5,(0,5.7,0),(14.5,.2,9.5))
  for x in range(-6,7,2):box(2,(x,4.7,4.63),(1.4,.8,.06))
  box(5,(6,8,0),(2.2,6,2.2));box(0,(6,11,0),(4,2,4));box(2,(6,11,2.02),(3.9,1.1,.05));box(3,(6,12.7,0),(.18,1,.18))
 else:
  for side in [-1,1]:
   box(5,(side*10,8.5,0),(.6,17,.8));box(2,(side*10,17,0),(.25,.25,1))
   for i in range(9):box(5,(side*(10-i*.25),8.1-i*.65,-1-i*1.5),(.10,15-i*1.35,.12))
  box(5,(0,17,0),(20.5,.4,.8))
 records.append(m.save(env+'.glb'))
(a.OUT/'assets.json').write_text(json.dumps({'original_assets':True,'assets':records},indent=2)+'\n')
print(json.dumps(records,indent=2))
