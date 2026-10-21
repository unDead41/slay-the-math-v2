from pathlib import Path
import subprocess,numpy as np,json,sys
src=Path(sys.argv[1])
out=Path(__file__).resolve().parents[1]/'dist/assets/music'
records=[]
for name,ids in [('Combat normal,elite stage 1.mp3.mpeg',['stage1_dungeon','stage1_elite']),('Combat boss stage.mp3.mpeg',['stage1_boss']),('Combat boss stage 2.mp3.mpeg',['stage2_boss'])]:
 p=src/name
 raw=subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','f32le','-ar','44100','-ac','2','-'],capture_output=True,check=True).stdout
 a=np.frombuffer(raw,dtype=np.float32).reshape(-1,2);n=88200
 # Bake a circular equal-power two-second overlap, then start after that head.
 t=np.linspace(0,np.pi/2,n)[:,None];seam=a[-n:]*np.cos(t)+a[:n]*np.sin(t)
 loop=np.concatenate([a[n:-n],seam]).astype(np.float32)
 peak=float(np.max(np.abs(loop)));loop*=min(1,.91/max(peak,.001))
 for track in ids:
  for ext,codec in [('mp3','libmp3lame'),('ogg','libvorbis')]:
   cmd=['ffmpeg','-v','error','-y','-f','f32le','-ar','44100','-ac','2','-i','-','-c:a',codec]+(['-b:a','128k'] if ext=='mp3' else ['-q:a','4'])+[str(out/(track+'.'+ext))]
   subprocess.run(cmd,input=loop.tobytes(),check=True)
  records.append({'id':track,'source':name,'duration':len(loop)/44100,'seamOverlapSeconds':2,'processing':'Circular crossfade and peak normalization; no new composition'})
(out/'user-track-import.json').write_text(json.dumps(records,indent=2));print('Imported user music',len(records),'cues')
