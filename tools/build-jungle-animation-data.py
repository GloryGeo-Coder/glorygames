"""Record unmodified alpha bounds; never rewrite the generated or legacy PNGs."""
from pathlib import Path
import hashlib,json,statistics
import numpy as np
from scipy import ndimage
from PIL import Image
root=Path(__file__).resolve().parents[1]/'apps/web/public/games/lost-jungle-3d-temple-of-the-sun'
groups={'explorer':['player'],'wildlife-a':['snake','frog','bat'],'wildlife-b':['spider','boar','monkey'],'temple':['crawler','wasp','sentry'],'guardians':['Monkey King','Spider Queen','Sun Guardian']}
atlases={};assets=[]
for filename,kinds in groups.items():
 p=root/'assets/animation'/(filename+'.png');im=Image.open(p);a=np.asarray(im.getchannel('A'))
 labels,_=ndimage.label(a>180);counts=np.bincount(labels.ravel());counts[0]=0
 ids=np.flatnonzero(counts>10000)
 assert len(ids)==12,(filename,len(ids),sorted(counts[counts>10000].tolist()))
 distance,nearest=ndimage.distance_transform_edt(~np.isin(labels,ids),return_indices=True);owners=labels[nearest[0],nearest[1]]
 fg=(a>40)&(distance<=18);bodies=[]
 for i in ids:
  yy,xx=np.nonzero(fg&(owners==i));bodies.append([int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)])
 bodies.sort(key=lambda b:(b[1]+b[3])/2);ordered=[]
 for row in range(3):ordered+=sorted(bodies[row*4:row*4+4],key=lambda b:(b[0]+b[2])/2)
 frames=[]
 for x,y,r,b in ordered:
  l,t,rr,bb=max(0,x-2),max(0,y-2),min(im.width,r+2),min(im.height,b+2)
  frames.append({'crop':[l,t,rr-l,bb-t],'content':[x,y,r-x,b-y]})
 for i,kind in enumerate(kinds):
  fs=frames if kind=='player' else frames[i*4:i*4+4]
  clips={'idle':[0,2,2],'run':[2,6,10],'rise':[8,1,1],'fall':[9,1,1],'shoot':[10,1,1],'hurt':[11,1,1]} if kind=='player' else {'idle':[0,2,3],'run':[0,2,7 if kind!='bat' else 11],'windup':[2,1,1],'attack':[3,1,1],'hurt':[2,1,1]}
  atlases[kind]={'url':'./assets/animation/'+filename+'.png','width':im.width,'height':im.height,'referenceHeight':statistics.median(f['content'][3] for f in fs[:2]),'frames':fs,'clips':{k:dict(zip(['start','count','fps'],v)) for k,v in clips.items()}}
 assets.append({'file':filename+'.png','width':im.width,'height':im.height,'frames':12,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
originals={}
for folder in ['sprites','items','effects','textures']:
 for p in (root/'assets'/folder).glob('*.png'):
  a=np.asarray(Image.open(p).convert('RGBA'))[:,:,3];yy,xx=np.nonzero(a>100)
  if len(xx):originals['./assets/'+folder+'/'+p.name]=[int(xx.min()),int(yy.min()),int(xx.max()+1-xx.min()),int(yy.max()+1-yy.min())]
data={'version':'2.4','atlases':atlases,'originals':originals}
(root/'jungle-animation-data.js').write_text('/* Generated from unchanged PNG alpha by tools/build-jungle-animation-data.py. */\n(function(r){const d='+json.dumps(data,separators=(',',':'))+';if(typeof module==="object"&&module.exports)module.exports=d;else r.JungleAnimationData=d;})(typeof window!=="undefined"?window:globalThis);\n')
(root/'assets/animation/manifest.json').write_text(json.dumps({'assets':assets,'poses':60},indent=2)+'\n')
print('Recorded 60 poses for',len(atlases),'actors and',len(originals),'legacy crops.')
