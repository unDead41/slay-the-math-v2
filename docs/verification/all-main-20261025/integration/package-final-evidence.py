from pathlib import Path
import json,hashlib,gzip,shutil,datetime,subprocess
src=Path('/dev/shm/stm-all-evidence-20261025')
repo=Path('/dev/shm/stm-all-main-20261025')
dst=repo/'docs/verification/all-main-20261025'
assert json.loads((src/'qa/evidence.json').read_text())['qaWindowClosed'] is True, 'Wait for closed QA evidence'
assert not dst.exists(), 'Evidence destination already exists'
roots=['integration','vfx-compat','tutorial-recapture']
files=[]
qa_index=json.loads((src/'qa/artifact-index.json').read_text())
assert len(qa_index['files'])==79
for row in qa_index['files']:
 rel=Path(row['path']);assert not rel.is_absolute() and '..' not in rel.parts
 f=src/'qa'/rel;data=f.read_bytes()
 assert len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256'], str(rel)
 files.append(f)
files += [src/'qa/artifact-index.json',src/'qa/handoff-hashes.json']
for name in roots:
 for f in (src/name).rglob('*'):
  if not f.is_file():continue
  rel=f.relative_to(src)
  if 'tmp' in rel.parts or 'node_modules' in rel.parts:continue
  files.append(f)
for f in src.iterdir():
 if f.is_file() and f.suffix in {'.json','.md','.log'} and f.name.startswith(('education-','pilot-','root-')):files.append(f)
rows=[]
for f in sorted(set(files)):
 rel=f.relative_to(src).as_posix();data=f.read_bytes()
 compress=f.suffix=='.log' or (f.suffix=='.json' and len(data)>262144)
 stored=rel+'.gz' if compress else rel
 encoded=gzip.compress(data,mtime=0) if compress else data
 target=dst/stored;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(encoded)
 assert (gzip.decompress(encoded) if compress else encoded)==data
 rows.append({'sourcePath':rel,'storedPath':stored,'sourceBytes':len(data),'sourceSHA256':hashlib.sha256(data).hexdigest(),'storedBytes':len(encoded),'storedSHA256':hashlib.sha256(encoded).hexdigest(),'compression':'gzip' if compress else 'none'})
index={'schemaVersion':1,'scope':'Closed release evidence, with original SHA256/bytes preserved; gzip decompresses to byte-identical source. QA index/evidence JSON unchanged. Temporary profiles/caches and private pilot ZIP excluded.','createdUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceRoot':str(src),'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo).decode().strip(),'files':rows,'fileCount':len(rows),'sourceBytes':sum(x['sourceBytes'] for x in rows),'storedBytes':sum(x['storedBytes'] for x in rows)}
(dst/'artifact-index.json').write_text(json.dumps(index,indent=2)+'\n')
(dst/'README.md').write_text('# Combined release evidence — 2.50.0\n\nThe index maps each original artifact to its stored file and records both hashes and lengths. Raw logs and large manifests are stored as lossless gzip; decompress to recover the exact original bytes. The original closed QA index and evidence JSON remain unchanged. Temporary browser profiles/caches and the private owner pilot ZIP are excluded.\n\nFull Node: 1,175 results, 1,173 passed and two failed, controlled math replay, 98 real tutorial captures, affected checks and final native outcomes remain separate records. The pilot integrity/static review concerns the original b3dc source; its 10-case results are not 2.50 measurements.\n')
print(json.dumps({'destination':str(dst),'files':len(rows),'sourceBytes':index['sourceBytes'],'storedBytes':index['storedBytes'],'indexSHA256':hashlib.sha256((dst/'artifact-index.json').read_bytes()).hexdigest()}))
