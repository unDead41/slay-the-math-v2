import json, csv, pathlib, statistics, collections, gzip
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/economy/deep'
def read(n):
 p=OUT/n
 return p.read_text() if p.exists() else gzip.decompress((OUT/(n+'.gz')).read_bytes()).decode()
def load(n):return json.loads(read(n))
def csvout(name,rows):
 if not rows:return
 with (OUT/name).open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)
def quant(xs,p):
 import math
 return sorted(xs)[max(0,math.ceil(p*len(xs))-1)] if xs else None
def fmt(x):return '—' if x is None else str(round(x,2))
flows=[json.loads(x) for x in read('flows.jsonl').splitlines()]
assert len(flows)==1800, 'Wait for all 1,800 paired adaptive flows before final report'
assert all(x['finalGold']==x['startGold']+x['goldEarned']-x['goldSpent'] for x in flows)
for d in ['easy','medium','hard']:
 for p in ['sale_only','tag_support','artifact_first','removal_first','reserve','saver']:
  assert len({x['seed'] for x in flows if x['difficulty']==d and x['policy']==p})==100
offers=load('offers.json');events=load('events.json');routes=load('routes.json')
summary=[]
for difficulty in ['easy','medium','hard']:
 for policy in ['sale_only','tag_support','artifact_first','removal_first','reserve','saver']:
  xs=[x for x in flows if x['difficulty']==difficulty and x['policy']==policy];done=[x for x in xs if x['completed']]
  row={'difficulty':difficulty,'policy':policy,'n':len(xs),'modelCompleteN':len(done),'budgetStoppedN':len(xs)-len(done),'stopEndCashP05':quant([x['finalGold'] for x in xs],.05),'stopEndCashMedian':quant([x['finalGold'] for x in xs],.5),'stopEndCashP95':quant([x['finalGold'] for x in xs],.95),'completedCashMedian':quant([x['finalGold'] for x in done],.5),'spentMedian':quant([x['goldSpent'] for x in xs],.5),'cardsBoughtMean':statistics.mean(x['cardsBought'] for x in xs),'artifactsBoughtMean':statistics.mean(x['artifactsBought'] for x in xs),'removalsMean':statistics.mean(x['removals'] for x in xs),'recoveryMedian':quant([x['recovery'] for x in xs],.5),'unaffordableVisits':sum(x['noAffordableCards'] for x in xs),'noProxyAffordableVisits':sum(x['noAffordableProxyCards'] for x in xs),'shopVisits':sum(x['shops'] for x in xs),'cashAfterLastShopMedian':quant([x['postLastShopNetGold'] for x in xs if x['postLastShopNetGold'] is not None],.5)}
  summary.append(row)
csvout('flow_summary.csv',summary)
sensitivity=[]
for d in ['easy','medium','hard']:
 for a in ['struggling','developing','proficient','strong']:
  for b in ['moderate','severe']:
   xs=[x for x in flows if x['difficulty']==d and x['answer']==a and x['budget']==b]
   sensitivity.append({'difficulty':d,'answer':a,'budget':b,'n':len(xs),'uniqueSeeds':len(set(x['seed'] for x in xs)),'budgetStops':sum(not x['completed'] for x in xs),'eventCorrect':sum(x['eventCorrect'] for x in xs),'eventWrong':sum(x['eventWrong'] for x in xs),'eventTimeout':sum(x['eventTimeout'] for x in xs),'artifactAttempts':sum(x['artifactAttempts'] for x in xs),'artifactWrong':sum(x['artifactWrong'] for x in xs)})
csvout('answer_budget_sensitivity.csv',sensitivity)
worst=[]
for metric in ['finalGold','finalHp','goldSpent','noAffordableProxyCards','wastedRest']:
 xs=sorted(flows,key=lambda x:x[metric],reverse=metric in ['noAffordableProxyCards','wastedRest'])[:10]
 for x in xs:worst.append({'metric':metric,**{k:x[k] for k in ['seed','difficulty','policy','answer','budget','status','finalGold','finalHp','goldSpent','noAffordableProxyCards','wastedRest']}})
csvout('worst_seeds.csv',worst)
off=[]
for fixture in sorted(set(x['fixture'] for x in offers['rows'])):
 for support in [False,True]:
  xs=[x for x in offers['rows'] if x['fixture']==fixture and x['support']==support];slots=sum(x['slots'] for x in xs);n=sum(x['offers'] for x in xs)
  off.append({'fixture':fixture,'support':support,'offers':n,'slots':slots,'actionableProxyPct':100*sum(x['actionableSlots'] for x in xs)/slots,'allProxyRejectedPct':100*sum(x['allProxyRejected'] for x in xs)/n,'missingRequirementPct':100*sum(x['missingRequirementSlots'] for x in xs)/slots,'redundantPassivePct':100*sum(x['redundantPassiveSlots'] for x in xs)/slots,'thirdCopyPct':100*sum(x['thirdCopySlots'] for x in xs)/slots})
csvout('deck_offer_summary.csv',off);csvout('offer_support_pairs.csv',offers['paired'])
eventrows=[]
for d in ['easy','medium','hard']:
 for event in sorted(set(x['id'] for x in events['rows'])):
  row={'difficulty':d,'event':event}
  for mode in ['correct_fast','wrong_fast','correct_35s','correct_55s','correct_75s','deadline_minus1','deadline_exact','abandon','skip_before','decline_after_correct']:
   xs=[x for x in events['rows'] if x['difficulty']==d and x['id']==event and x['mode']==mode]
   row[mode]='|'.join(sorted(set(x['outcome'] for x in xs)))
  eventrows.append(row)
csvout('all_event_timing.csv',eventrows)
routepairs=[]
for d in ['easy','medium','hard']:
 for seed in sorted(set(x['seed'] for x in routes['flows'])):
  pair={x['routeStyle']:x for x in routes['flows'] if x['difficulty']==d and x['seed']==seed};a,b=pair['minElite'],pair['maxElite']
  routepairs.append({'difficulty':d,'seed':seed,'minStatus':a['status'],'maxStatus':b['status'],'minElites':a['elites'],'maxElites':b['elites'],'minGoldEarned':a['goldEarned'],'maxGoldEarned':b['goldEarned'],'minRecovery':a['recovery'],'maxRecovery':b['recovery'],'minArtifacts':a['finalArtifacts'],'maxArtifacts':b['finalArtifacts'],'minNodes':a['nodes'],'maxNodes':b['nodes']})
csvout('route_risk_pairs.csv',routepairs)
plt.rcParams.update({'figure.dpi':130,'font.size':10})
fig,axes=plt.subplots(1,3,figsize=(15,4.5))
for ax,d in zip(axes,['easy','medium','hard']):
 rows=[x for x in summary if x['difficulty']==d];ax.barh([x['policy'] for x in rows],[x['stopEndCashMedian'] for x in rows],color='#7473c7');ax.set_title(d.title());ax.set_xlabel('Stop/end Gold median (all models)');ax.invert_yaxis()
fig.suptitle('Unspent Gold under six declared buying heuristics');fig.tight_layout();fig.savefig(OUT/'spending.png');plt.close(fig)
fig,ax=plt.subplots(figsize=(11,6));names=sorted(set(x['fixture'] for x in off));vals=[[next(x['actionableProxyPct'] for x in off if x['fixture']==n and x['support']==s) for n in names] for s in [False,True]]
import numpy as np
ys=np.arange(len(names));ax.barh(ys-.18,vals[0],.36,label='Support OFF',color='#a6abb7');ax.barh(ys+.18,vals[1],.36,label='Support ON',color='#6b54b8');ax.set_yticks(ys,names);ax.set_xlim(0,100);ax.set_xlabel('Actionable proxy slots (%) — NOT measured combat utility');ax.legend();fig.tight_layout();fig.savefig(OUT/'deck_offers.png');plt.close(fig)
fig,axes=plt.subplots(1,3,figsize=(14,4.5))
for ax,d in zip(axes,['easy','medium','hard']):
 for action,color in [('heal','#4f9986'),('upgrade','#a779bc')]:
  xs=[x for x in events['rest'] if x['difficulty']==d and x['action']==action];group=collections.defaultdict(list)
  for x in xs:group[x['inputHp']].append(x['actualHeal'])
  ax.plot(sorted(group),[statistics.mean(group[k]) for k in sorted(group)],marker='o',label=action,color=color)
 ax.set_title(d.title());ax.set_xlabel('HP on arrival');ax.set_ylabel('Actual healing');ax.legend()
fig.suptitle('Rest Heal versus Upgrade: healing component only');fig.tight_layout();fig.savefig(OUT/'rest_recovery.png');plt.close(fig)
fig,ax=plt.subplots(figsize=(9,5))
for d,color in [('easy','#519e80'),('medium','#ad8b4f'),('hard','#be6474')]:
 xs=[x for x in routepairs if x['difficulty']==d and x['minStatus']=='MODEL_FLOW_COMPLETE' and x['maxStatus']=='MODEL_FLOW_COMPLETE'];ax.scatter([x['maxElites']-x['minElites'] for x in xs],[x['maxGoldEarned']-x['minGoldEarned'] for x in xs],alpha=.45,label=f'{d}: {len(xs)} paired completions',color=color)
ax.set_xlabel('Extra Elites on max-Elite route');ax.set_ylabel('Extra Gold earned (paired complete models only)');ax.legend();fig.tight_layout();fig.savefig(OUT/'route_risk.png');plt.close(fig)
forced=sum(x['minElite']['elites']>0 for x in routes['surveys']);pathcount=sum(x['pathCount'] for x in routes['surveys']);ns=sum(x['offers'] for x in offers['rows']);slots=sum(x['slots'] for x in offers['rows'])
md=['# Economy, Loot & Rewards — Deep Validation', '', 'Status: CADANGAN; CP UNMEASURED. Base 2800f9a; branch balance/economy. No production tuning changed by this extension.', '',f'Observed coverage: **{len(flows):,} adaptive flows**, 100 identical paired seeds per policy/difficulty; **{len(routes["flows"]):,} controlled route flows**; **{ns:,} card offers / {slots:,} slots**; **{len(events["rows"]):,} event timing/answer cases**, **{len(events["boundary"]):,} HP/Gold boundary cases**, **{len(events["rest"]):,} Rest cases**.', '', '## Meaning and limits', '', 'Every fight is pre-won after paying an explicit moderate (4/8/12) or severe (7/14/20) normal/Elite/Boss HP budget. No card/artifact strength reduces those budgets. MODEL_HP_BUDGET_EXHAUSTED means the assumed HP budget could not be paid; it is not observed combat defeat. All stop/end cash includes incomplete models. Completed-only cash is reported separately. These results cannot validate pupil win rates, optimal buying or combat power.', '', 'The same 100 seeds are replayed for all six policies and all difficulties. Answer profile cycles every four seeds; budget every four-seed block. Each of eight sensitivity cells has 12 or 13 unique seeds. This pairing controls seed/profile/budget when comparing policies; it does not provide 100 independent seeds per sensitivity cell. Four fixed answer profiles use 40/60/80/95% hash thresholds and fixed 55/35/15/15 second response times. Artifact wrong answers permit up to three wrong choices followed by a correct choice; retries add time but do not remove the gift. Mystery answers settle once and exact deadlines time out.', '', '## Spending and recovery', '', '| Difficulty | Policy | N | Completed models | Stop/end Gold p05 / median / p95 | Completed Gold median | Spent median |', '|---|---|---:|---:|---|---:|---:|']
for x in summary:md.append(f'| {x["difficulty"]} | {x["policy"]} | {x["n"]} | {x["modelCompleteN"]} | {fmt(x["stopEndCashP05"])} / {fmt(x["stopEndCashMedian"])} / {fmt(x["stopEndCashP95"])} | {fmt(x["completedCashMedian"])} | {fmt(x["spentMedian"])} |')
md+=['', '![Spending](spending.png)', '', 'Six heuristics: buy the single sale; support/category proxy with 20 Gold reserve; prioritize an economic/artifact tier heuristic; removal first; stage reserve 80/35; and save everything. Scores used to order decisions are arbitrary policy rules, not CP. Removal and purchases use actual engine quotes; no future loot is inspected. Full raw summaries retain affordability, purchases, recovery, answer attempts and last-Shop cash. Representative traces retain pending fight modifiers and conditional reward vectors.', '', '## Deck offers', '', 'Across 3,438 Shop visits, 73 had no affordable card and 96 had no affordable actionable proxy on arrival. This can follow earlier spending and is not proof of bad pricing. Saver median stop/end Gold is 543 / 427.5 / 356 on Easy / Medium / Hard; the real effect of each purchase needs Combat input.', '', 'Twelve fixtures cover lean/large/duplicate/upgraded decks and Attack, Block, Skill/Focus, Passive/draw and Exhaust builds. Six sources preserve category restrictions before support weighting. Support ON/OFF first-slot rarity draws match; source/uniqueness, positive weights, unchanged player state, frozen receipts and question/combat RNG checks all run.', '',f'Invariant counters: `{json.dumps(offers["checks"],sort_keys=True)}`.', '', '![Deck offers](deck_offers.png)', '', 'Aggregated actionable-proxy change from support weighting ranges from -0.297 to +0.338 percentage points across fixtures. This is a small mixed effect, not evidence that weighting improves every deck. Requirement-ready and conditional-support counters must be inspected separately; retain bounded weights pending measured Combat utility.', '', 'Actionable proxy = requirement tags available, no already-owned Passive, fewer than two owned copies. It does not measure usefulness, activation likelihood, passive-slot contention or value of an upgraded replacement. See separate upgradeOpportunity counters in offers.json. Offers are independent cross-sectional fixtures; evolving decks are exercised by actual main flows. Waiting-time-to-specific-synergy is not estimated.', '', '## Events and Rest', '', 'Cumulative stress adds 24 runs with HP sacrifice followed by Max HP sacrifice across two stages, reload after each settlement and repeat rejection. Forged extra cumulative Max HP sacrifice saves are rejected by the once-per-run cap. Eighteen adaptive-policy traces and six controlled-route traces retain actual reward vectors. scriptedAttemptTimeMs is attempted response time (including attempts after deadline), not actual elapsed play time.', '', 'all_event_timing.csv records every event and difficulty for correct/wrong, 35/55/75 seconds, one millisecond before deadline, exact deadline, abandon, skip before start and reward decline. events.json retains option-specific deltas, deadlines, modifiers, low-HP/Gold affordability and capped healing. Rest Heal is valuable only for missing HP; Upgrade has no healing component and its combat value requires Combat input.', '', '![Rest recovery](rest_recovery.png)', '', '**Explore: NEEDS_INPUT_DEFINITION.** No Explore action exists at this base; no invented reward is assigned.', '', '## Route risk and reward', '', f'Exact dynamic-programming survey covers **{len(routes["surveys"])} maps / {pathcount:,} legal paths counted**. Minimum/maximum Elite routes are exact; flows sample those two extremes and adaptive routes, rather than simulating all paths. **{forced}/{len(routes["surveys"])} stage maps force at least one Elite**. Topology remains Map-owned. route_risk_pairs.csv includes stopped and complete runs; the graph compares only paired completions and therefore has explicit survivorship limits.', '', '![Route risk](route_risk.png)', '', '## Decisions and Master handoff', '', '- Retain prices/rarity/support profiles: no measured CP or student data justifies numerical calibration.', '- Use cash at last Shop and income after it before changing Gold rates: end cash can reflect late income or an intentional saver.', '- Recheck low-affordability/proxy-rejected seeds from worst_seeds.csv with Combat value estimates; a rejected proxy is not proof an offer is useless.', '- Combat input NEEDS_INPUT: damage distributions by build/accuracy, upgrade/removal/artifact marginal value, passive activation/cap, measured ICP/CCP.', '- Map input NEEDS_INPUT: approved route coverage and mandatory-Elite decisions. Route economy is conditional on current topology.', '- Three difficulty targets 90%/70%/50% remain unverified; model completion is not a pupil win rate.', '', '## Reproduce', '', '`node tools/economy/deep-study.cjs offers` / `events` / `flow` / `routes` / `traces` / `manifest`, then `python3 tools/economy/deep-report.py`. manifest.json records seeds, profiles, assumptions and source hashes. Raw JSON/JSONL evidence is also stored as deterministic .gz files in git; the report reader accepts either representation. All original v1.2 evidence remains intact.']
(OUT/'REPORT.md').write_text('\n'.join(md)+'\n')
print(json.dumps({'flows':len(flows),'offers':ns,'slots':slots,'eventCases':len(events['rows']),'boundary':len(events['boundary']),'rest':len(events['rest']),'maps':len(routes['surveys']),'paths':pathcount,'forcedEliteMaps':forced},indent=2))
