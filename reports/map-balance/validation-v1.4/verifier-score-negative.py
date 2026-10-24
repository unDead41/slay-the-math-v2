import csv,hashlib,importlib.util,json,pathlib,shutil,tempfile,sys
root=pathlib.Path(__file__).resolve().parents[3]
source_root=pathlib.Path(sys.argv[2]).resolve() if len(sys.argv)>2 else root
spec=importlib.util.spec_from_file_location('checker',source_root/'tools/verify-map-advanced.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
base=pathlib.Path(sys.argv[1]).resolve()
cases=[('policy-summary','combatPower'),('predict-summary','combatPower'),('policy-stage-summary','combatPower'),('seed-policy-summary','combatPower'),('policy-summary','allCaseWinBounds'),('predict-summary','censoredNull')]
mod.verify(base)
print('BASELINE VERIFIED before negative cases')
accepted=[]
for table,field in cases:
 with tempfile.TemporaryDirectory(prefix='map-score-negative-') as tmp:
  out=pathlib.Path(tmp)/'out';shutil.copytree(base,out)
  jp=out/(table+'.json'); rows=json.loads(jp.read_text())
  if field=='censoredNull':
   i=next(i for i,r in enumerate(rows) if r['censored']); rows[i]['combatPower']=42
  elif field=='allCaseWinBounds': i=0;rows[i][field]=[0,0]
  else: i=next(i for i,r in enumerate(rows) if r[field] is not None);rows[i][field]+=123
  jp.write_text(json.dumps(rows,separators=(',',':'))+'\n')
  cp=out/(table+'.csv')
  with cp.open(newline='') as f: reader=csv.DictReader(f);columns=reader.fieldnames; cr=list(reader)
  key='combatPower' if field=='censoredNull' else field
  value=rows[i][key];cr[i][key]=json.dumps(value,separators=(',',':')) if isinstance(value,list) else str(value)
  with cp.open('w',newline='') as f: writer=csv.DictWriter(f,fieldnames=columns);writer.writeheader();writer.writerows(cr)
  mp=out/'manifest.json';m=json.loads(mp.read_text())
  for p in [jp,cp]:b=p.read_bytes();m['files'][p.name]={'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
  mp.write_text(json.dumps(m)+'\n')
  try: mod.verify(out)
  except AssertionError: print('REJECTED',table,field)
  else: accepted.append((table,field));print('FAIL: accepted incorrect exported score',table,field)
if accepted: raise SystemExit(1)
print('PASS: all six consistently corrupted JSON/CSV exports rejected against raw records')
