"""Extract runtime assets from Ijamm's supplied model sheets; originals stay intact."""
from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np
from scipy import ndimage
import json,sys,hashlib
src=Path(sys.argv[1]); out=Path(__file__).resolve().parents[1]/'dist/assets'
records=[]
def record(p,name,box=None):
 records.append({'asset':name,'source':str(p.relative_to(src)),'crop':box,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'operation':'crop, edge-connected parchment removal and WebP encoding' if box else 'WebP encoding','provenance':'User-supplied source; original bytes retained by user'})
def cut(p,box,name):
 im=Image.open(p).convert('RGB').crop(box); a=np.asarray(im).astype(float)
 hi=a.max(2);lo=a.min(2);sat=(hi-lo)/np.maximum(hi,1)
 # Only remove pale, neutral parchment connected to the crop edge.
 bg=(lo>145)&(sat<.28)
 seed=np.zeros(bg.shape,bool);seed[0,:]=bg[0,:];seed[-1,:]=bg[-1,:];seed[:,0]=bg[:,0];seed[:,-1]=bg[:,-1]
 remove=ndimage.binary_propagation(seed,mask=bg)
 mask=~remove
 labs,n=ndimage.label(mask); sizes=np.bincount(labs.ravel());sizes[0]=0
 # Keep the actual character and detached bright effects, discard tiny sheet marks.
 mask=sizes[labs]>max(10,mask.size*.0008)
 for label,region in enumerate(ndimage.find_objects(labs),1):
  if region is not None:
   h=region[0].stop-region[0].start;w=region[1].stop-region[1].start
   if h<=4 and w>h*8:mask[labs==label]=False
 alpha=Image.fromarray((mask*255).astype('uint8')).filter(ImageFilter.GaussianBlur(.35))
 im=im.convert('RGBA');im.putalpha(alpha);bb=im.getbbox()
 if bb: im=im.crop(bb)
 im.save(out/name,'WEBP',quality=93,method=6)
 record(p,name,box)
hero=src/'Slay_the_Math_MC_Model_Sheets.zip'
for filename,name in [('Sheet 1 • Standing-1.png','hero-standing.webp'),('Sheet 2 • Attack-2.png','hero-attack.webp'),('Sheet 3 • Defend-3.png','hero-defend.webp'),('SHEET 4 • SKILL-4.png','hero-skill.webp'),('SHEET 5 • DAMAGE TAKEN-5.png','hero-damage.webp')]:
 cut(hero/filename,(40,37,520,728),name)
roster=json.loads((src/'Slay_the_Math_Model_Sheets_V2/roster.json').read_text())
# Row and column crop boundaries follow the supplied guide.
for sheet in roster['sheets']:
 p=src/'Slay_the_Math_Model_Sheets_V2'/sheet['file']
 bounds=([(132,386),(424,647),(685,928),(969,1191),(1230,1431)] if sheet['sheet']==2 else [(133,390),(424,655),(697,938),(977,1197),(1237,1431)] if sheet['sheet']==4 else [(132,357),(397,612),(653,839),(884,1094),(1141,1418)])
 for c in sheet['characters']:
  y0,y1=bounds[c['row']-1]
  cut(p,(19,y0,322,y1),c['id']+'.webp')
for source,name in [('Quiet Slate Dungeon Arena-1.png','arena-1.webp'),('Midnight Archive Arena-2.png','arena-2.webp'),('Twin-ring prism gate sanctuary-1.png','arena-boss-1.webp'),('Midnight arcane card gate arena-2.png','arena-boss-2.webp')]:
 p=src/'Background Arena'/source
 Image.open(p).convert('RGB').save(out/name,'WEBP',quality=90,method=6);record(p,name)
(out/'source-assets.json').write_text(json.dumps(records,indent=2))
print('Prepared',len(records),'source assets')
