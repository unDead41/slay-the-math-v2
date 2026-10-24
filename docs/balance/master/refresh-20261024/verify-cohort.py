#!/usr/bin/env python3
"""Independent raw report/CSV and accounting verification; run from repo root."""
import csv, gzip, hashlib, json, math, pathlib, subprocess, sys
root=pathlib.Path.cwd()
out=root/(sys.argv[1] if len(sys.argv)>1 else 'reports/master-balance/refresh-20261024/final')
starts=json.loads(subprocess.check_output(['node','-e',"const {loadMaster}=require('./tools/balance/master/loader.cjs');console.log(JSON.stringify(Object.fromEntries(['easy','medium','hard'].map(d=>[d,loadMaster({difficulty:d}).E.newRun(61,'challenge').gold]))))"],text=True))
maxhp=json.loads((root/'tools/balance/master/config.json').read_text())['profileOverrides']
reports=[]
with gzip.open(out/'ai-current.jsonl.gz','rt') as f:
    for line in f: reports.append(json.loads(line))
source=None; rows=[]; receipt=gold=factorial=0; contexts=set()
for report in reports:
    assert report['schemaVersion']==3 and report['agentVersion']=='sampled-turn-search-3'
    assert report['jobStatus']=='completed'
    sources=report['sources']
    actual=hashlib.sha256(json.dumps(sources,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
    assert actual==report['sourceHash']
    if source is None:
        source=actual
        for name, digest in sources.items(): assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,name
    assert actual==source
    o=report['options']; rs=report['rows']; s=report['summary']
    assert s['attempts']==len(rs) and s['invalid']==s['censored']==0
    assert s['wins']==sum(r['status'] in ['WIN','VICTORY'] for r in rs)
    assert s['losses']==sum(r['status'] in ['LOSS','DEFEAT'] for r in rs)
    for r in rs:
        assert r['status'] in ['WIN','LOSS','VICTORY','DEFEAT']
        a=r['ai']; t=a['effects']['totals']; cards=list(a['cards'].values())
        assert sum(c['plays'] for c in cards)==r['committedCardPlays']==t['plays']
        assert sum(c['energySpent'] for c in cards)==a['energySpent']==t['energySpent']
        assert sum(c['focusSpent'] for c in cards)==a['focusSpent']==t['focusSpent']
        assert t['blockGranted']==sum(t[k] for k in ['blockUsed','blockExpired','blockUnused','blockRemaining'])
        receipt+=1
        if o['mode']=='campaign':
            assert starts[r['difficulty']]+r['metrics']['goldEarned']-r['metrics']['goldSpent']==r['final']['gold']
            assert r['metrics']['shop']['spentBasis']=='GROSS_CHECKOUT_SPENDING'
            gold+=1
        else:
            hp=0 if r['status']=='LOSS' else r['final']['playerHp']/maxhp[r['difficulty']]['starting_max_hp']
            assert math.isclose(r['utility'],100*(r['status']=='WIN')+20*hp-min(10,r['final']['turn']/2),abs_tol=1e-10)
        rows.append((report,r))
    if o['mode']=='cards':
        rs=sorted(rs,key=lambda r:r['mask']);assert [r['mask'] for r in rs]==list(range(1<<len(o['cards'])))
        u=[r['utility'] for r in rs]; p=s['power'][0]
        assert p['seedsComplete']==p['seedsExpected']==1 and p['seedsUnscored']==0
        assert math.isclose(p['totalDelta'],u[-1]-u[0],abs_tol=1e-10)
        for i,v in enumerate(p['individualDeltas']): assert math.isclose(v['delta'],u[1<<i]-u[0],abs_tol=1e-10)
        if len(u)==4: assert math.isclose(p['interaction'],u[3]-u[1]-u[2]+u[0],abs_tol=1e-10)
        else: assert p['interaction'] is None; contexts.add((o['cards'][0],o['upgraded'],o['enemy']))
        factorial+=1
with (out/'ai-current.csv').open(newline='') as f: exported=list(csv.DictReader(f))
assert len(exported)==len(rows)
for cell,(report,r) in zip(exported,rows):
    assert cell['sourceHash']==source and cell['route']==report['options']['route']
    assert cell['status']==r['status'] and cell['difficulty']==r['difficulty'] and cell['skill']==r['skill']
    assert cell['agentVersion']==report['agentVersion'] and cell['cards']=='+'.join(report['options']['cards'])
assert len(reports)==192 and len(rows)==403 and gold==15 and factorial==177 and len(contexts)==160
summary=json.loads((out/'summary.json').read_text());assert summary['sourceHash']==source and summary['attempts']==403
print(json.dumps({'status':'PASSED','reports':len(reports),'rows':len(rows),'receiptBlockChecks':receipt,'grossGoldChecks':gold,'individualFactorialChecks':factorial,'allCardContexts':len(contexts),'sourceHashesVerified':True,'sourceHash':source,'csvRows':len(exported),'routeIdentityVerified':True,'pupilTargetsMeasured':False},indent=2))
