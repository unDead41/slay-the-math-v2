"""Import both supplied left-facing bosses without changing other animation actors."""
from pathlib import Path
import hashlib,json,subprocess,argparse,sys
from PIL import Image
sys.path.insert(0,str(Path(__file__).parent))
from importlib import import_module
helper=import_module('import-enemy-animations')
ROOT=Path(__file__).resolve().parents[1]
def main():
 p=argparse.ArgumentParser();p.add_argument('source',type=Path);args=p.parse_args()
 target=ROOT/'dist/animation-data.js'
 runtime=json.loads(subprocess.check_output(['node','-e','process.stdout.write(JSON.stringify(require(process.argv[1])))',str(target)],text=True))
 audit={'inputs':json.loads((args.source.parent/'input-audit.json').read_text()),'actors':[],'note':'Native 1024 runtime cells, lossless visible RGB/alpha. Uniform per-boss projection; frame order/holds retained; authored pivot [512,768] maps to [800,1000] with matching host registration; transparent VFX remains inside the canvas. No combat event hooks executed.'}
 for game_id,stem,stage in [('sentinel','twin_sigil_guardian',0),('dealer','deck_lord',1)]:
  source=args.source/'bosses'/stem;manifest=json.loads((source/'animation_manifest.json').read_text())
  assert manifest['facing']=='left' and manifest['flipX'] is False and manifest['frame_count']==30
  # Runtime anchor 512,768 is anatomical. Register the host to a 1000px canvas
  # floor, leaving 200px below it for authored translucent VFX, without clipping.
  actor={'id':stem,'name':manifest['character'],'stage':stage,'type':'boss','facing':'left','flipX':False,'sourcePivot':[512,768],'floorPivot':[800,1000],'drawScale':1.65,'animations':{},'intentActions':({'Stone Fist':'attack','Rune Shield':'defend','Double Strike':'skill'} if stage==0 else {'Sharp Cards':'attack','Dark Veil':'defend','Rune Storm':'skill'})}
  entry={'id':game_id,'source_id':stem,'sourcePivot':actor['sourcePivot'],'drawScale':actor['drawScale'],'clips':[]}
  dest=ROOT/'docs/animations/boss-v1'/stem;dest.mkdir(parents=True,exist_ok=True)
  for name in ['animation_manifest.json','SOR_ANIMATION.md','README.md','validation_report.json']:
   (dest/name).write_bytes((source/name).read_bytes())
  for action,clip in manifest['animations'].items():
   sheet=Image.open(source/clip['sheet_runtime']).convert('RGBA'); assert sheet.size==(3200,2144)
   name=f'motion-s{stage+1}-{stem}-{action}.webp';path=ROOT/'dist/assets'/name
   sheet.save(path,'WEBP',lossless=True,quality=100,method=6,exact=True)
   decoded=Image.open(path).convert('RGBA');helper.visible_equal(sheet,decoded)
   frames=[];checks=[]
   for i,f in enumerate(clip['frames']):
    x,y,w,h=f['runtime_atlas_rect'];assert [x,y,w,h]==[32+i%3*1056,32+i//3*1056,1024,1024]
    box=decoded.crop((x,y,x+w,y+h)).getchannel('A').getbbox();assert min(box[0],box[1],w-box[2],h-box[3])>=120
    projected=[actor['floorPivot'][j%2]+(box[j]-actor['sourcePivot'][j%2])*actor['drawScale'] for j in range(4)]
    assert projected[0]>=0 and projected[1]>=0 and projected[2]<=1600 and projected[3]<=1200,projected
    frames.append([x,y,w,h]);checks.append({'index':i,'bounds':list(box),'canvas':projected})
   actor['animations'][action]={'image':name,'durationsMs':clip['durations_ms'],'loop':clip['loop'],'frames':frames}
   assert len(frames)==6 and sum(clip['durations_ms'])==clip['duration_ms']
   post=helper.poster({**runtime,'floorPivot':actor['floorPivot']},actor,action,decoded)
   entry['clips'].append({'action':action,'source_sha256':helper.digest((source/clip['sheet_runtime']).read_bytes()),'runtime':name,'runtime_sha256':helper.digest(path.read_bytes()),'bytes':path.stat().st_size,'frames':checks,'poster':post})
  runtime['actors'][game_id]=actor;audit['actors'].append(entry)
 runtime['version']='3.2'
 target.write_text("(function(root){'use strict';\n const data="+json.dumps(runtime,separators=(',',':'))+";\n if(typeof module!=='undefined')module.exports=data;else root.DCAnimationData=data;\n})(typeof window!=='undefined'?window:globalThis);\n")
 (ROOT/'docs/animations/boss-v1/import-audit.json').write_text(json.dumps(audit,indent=2)+'\n')
 print(json.dumps({'actors':2,'clips':10,'frames':60,'atlas_bytes':sum(c['bytes'] for a in audit['actors'] for c in a['clips'])}))
if __name__=='__main__':main()
