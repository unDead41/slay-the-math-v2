import datetime, hashlib, json, os, subprocess, sys
from pathlib import Path

root=Path(sys.argv[1]); destination=Path(sys.argv[2])
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
tree=subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=root,text=True).strip()
rows=[];delta=[]
for item in subprocess.check_output(['git','ls-tree','-rz','--full-tree','HEAD'],cwd=root).split(b'\0'):
    if not item:continue
    info,name=item.split(b'\t',1);mode,kind,blob=info.decode().split();name=name.decode()
    if kind!='blob':continue
    path=root/name
    if not path.exists() and not path.is_symlink():
        delta.append({'path':name,'error':'missing'});continue
    if mode=='120000':
        data=os.readlink(path).encode();size=len(data)
        sha256=hashlib.sha256(data).hexdigest()
        gitsha=hashlib.sha1(b'blob '+str(size).encode()+b'\0'+data).hexdigest()
    else:
        size=path.stat().st_size;s=hashlib.sha256();g=hashlib.sha1(b'blob '+str(size).encode()+b'\0')
        with path.open('rb') as f:
            while chunk:=f.read(1024*1024):s.update(chunk);g.update(chunk)
        sha256=s.hexdigest();gitsha=g.hexdigest()
    row={'path':name,'bytes':size,'sha256':sha256,'gitBlob':blob,'actualGitBlob':gitsha}
    rows.append(row)
    if blob!=gitsha:delta.append(row)
artifacts={}
for relative in ['SLAY-THE-MATH-OFFLINE.html','release-prod/asset-manifest.json','release-prod/index.html']:
    p=root/relative
    if not p.is_file():continue
    s=hashlib.sha256()
    with p.open('rb') as f:
        while chunk:=f.read(1024*1024):s.update(chunk)
    artifacts[relative]={'bytes':p.stat().st_size,'sha256':s.hexdigest()}
result={'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'commit':commit,'tree':tree,'files':rows,'count':len(rows),'trackedDeltaFromHEAD':delta,'artifacts':artifacts}
destination.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='files'}))
sys.exit(1 if delta else 0)
