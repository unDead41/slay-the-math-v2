"""Render exact recorded economy evidence; no new simulation or CP estimation."""
from pathlib import Path
import json, statistics
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/economy';FIG=OUT/'figures';FIG.mkdir(exist_ok=True)
load=lambda n:json.loads((OUT/'evidence'/n).read_text())
hist=load('offer_histograms.json');ab=load('support_weighting_ab.json');runs=load('route_cashflow_runs.json');summary=load('route_projection_summary.json');manifest=load('simulation_manifest.json');maps=load('map_route_inputs.json');ah=load('artifact_offer_histograms.json')
def table(cols,rows):
 return '| '+' | '.join(cols)+' |\n| '+' | '.join(['---']*len(cols))+' |\n'+'\n'.join('| '+' | '.join(str(c).replace('|',' / ').replace('\n',' ') for c in row)+' |' for row in rows)+'\n'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.spines.top':False,'axes.spines.right':False,'axes.titlesize':13,'figure.facecolor':'white','axes.facecolor':'white','savefig.facecolor':'white'})
colors=['#db5b52','#4c82ad','#c49b35'];titles={'current':'Runtime 2.24.0','easy':'Easy candidate','medium':'Medium candidate','hard':'Hard candidate'}
fig,axes=plt.subplots(1,2,figsize=(12,4.6),sharey=True)
for stage,ax in enumerate(axes,1):
 for i,rarity in enumerate(['common','uncommon','rare']):
  hs=[next(h for h in hist if h['difficulty']=='medium' and h['support'] and h['stage']==stage and h['source']==s) for s in ['normal','elite','shop']]
  y=np.array([h['firstRarity'][rarity]/h['seeds']*100 for h in hs]);target=np.array([next(c['target'] for c in h['firstRarityChecks'] if c['rarity']==rarity)*100 for h in hs]);cis=[next(c['wilson95'] for c in h['firstRarityChecks'] if c['rarity']==rarity) for h in hs];err=np.array([[y[j]-cis[j][0]*100 for j in range(3)],[cis[j][1]*100-y[j] for j in range(3)]])
  x=np.arange(3)+(i-1)*.24;ax.bar(x,y,.22,label=rarity.title(),color=colors[i]);ax.errorbar(x,y,yerr=err,fmt='none',ecolor='#374151',capsize=2,lw=.8);ax.scatter(x,target,marker='D',s=22,color='#17212d',zorder=4)
 ax.set_xticks(range(3),['Normal','Elite','Shop']);ax.set_title(f'Stage {stage} · Medium · support ON');ax.set_ylim(0,84);ax.grid(axis='y',alpha=.18);ax.set_axisbelow(True)
axes[0].set_ylabel('First-slot rarity (%)');axes[1].legend(frameon=False);fig.suptitle('Recorded card offers: observed rarity and configured target',fontweight='bold');fig.text(.5,.01,f'{len(manifest["histogramSeeds"])} seeds per cohort · bars = observed, diamonds = target, whiskers = Wilson 95% · first slot only',ha='center',fontsize=9);fig.tight_layout(rect=[0,.04,1,.94]);fig.savefig(FIG/'card_rarity_histogram.png',dpi=160);plt.close(fig)
cols=[(s,st) for st in [1,2] for s in ['normal','elite','shop','ME03','ME12']]
a=np.array([[next(x['deltaFraction']*100 for x in ab if x['difficulty']==d and x['source']==s and x['stage']==st) for s,st in cols] for d in ['easy','medium','hard']])
fig,ax=plt.subplots(figsize=(12,3.1));im=ax.imshow(a,cmap='YlGnBu',vmin=0,vmax=5,aspect='auto');ax.set_xticks(range(len(cols)),[f'{s}\nS{st}' for s,st in cols]);ax.set_yticks(range(3),['Easy','Medium','Hard']);ax.tick_params(length=0)
for i in range(3):
 for j in range(10):ax.text(j,i,f'{a[i,j]:.2f}',ha='center',va='center',color='white' if a[i,j]>2.8 else '#17212d')
ax.set_title('Paired support weighting: change in supported offer slots (percentage points)',pad=15,fontweight='bold');fig.colorbar(im,ax=ax,label='Percentage points');fig.text(.5,.01,'Same seeds and reference deck in both arms · rarity draws unchanged · eligibility stays positive for every eligible ID',ha='center',fontsize=9);fig.tight_layout(rect=[0,.04,1,1]);fig.savefig(FIG/'support_weighting_ab.png',dpi=160);plt.close(fig)
def post_gold(r):
 return sum(row['goldAfter']-row['goldBefore'] for row in r['rows'] if row.get('kind')=='prewon_fight_settlement' and row.get('type')=='boss' and row.get('stage')==2)
normalized=[]
for s in summary:
 if s['budgetName']!='conditional_all_fights_won':continue
 xs=[r for r in runs if r['difficulty']==s['difficulty'] and r['policy']==s['policy'] and r['budgetName']==s['budgetName']];values=[r['finalGold']-post_gold(r) for r in xs];normalized.append({**s,'meanGoldBeforeFinalBossReward':statistics.mean(values),'minGoldBeforeFinalBossReward':min(values),'maxGoldBeforeFinalBossReward':max(values),'meanPostRunGold':statistics.mean(post_gold(r) for r in xs)})
(OUT/'evidence/normalized_cashflow_summary.json').write_text(json.dumps(normalized,indent=2)+'\n')
fig,ax=plt.subplots(figsize=(11.5,5));cs=['#718096','#5b9c6c','#4c82ad','#ae6464']
for i,d in enumerate(titles):
 ss=[next(s for s in normalized if s['difficulty']==d and s['policy']==p) for p in ['safe_shop','elite_value','saver']];y=np.array([s['meanGoldBeforeFinalBossReward'] for s in ss]);err=np.array([[y[j]-ss[j]['minGoldBeforeFinalBossReward'] for j in range(3)],[ss[j]['maxGoldBeforeFinalBossReward']-y[j] for j in range(3)]]);x=np.arange(3)+(i-1.5)*.19;ax.bar(x,y,.17,label=titles[d],color=cs[i]);ax.errorbar(x,y,yerr=err,fmt='none',ecolor='#374151',capsize=2,lw=.8)
ax.set_xticks(range(3),['Safe route + sale / services','Elite route + artifact first','Saver route + sale only']);ax.set_ylabel('Gold before the final Boss reward');ax.grid(axis='y',alpha=.18);ax.set_axisbelow(True);ax.legend(frameon=False,ncols=2);ax.set_title('Conditional Gold flow: purchases made, then Gold left',fontweight='bold');fig.text(.5,.01,f'{len(manifest["routeSeeds"])} recorded seeds per policy · all fights assumed won · bars = mean, whiskers = seed range · runtime post-run +60 excluded',ha='center',fontsize=9);fig.tight_layout(rect=[0,.04,1,1]);fig.savefig(FIG/'gold_flow_projection.png',dpi=160);plt.close(fig)
h=next(h for h in ah if h['stage']==1 and h['passive'] and h['source']=='elite');ids=h['eligible'];y=[h['firstId'].get(i,0)/h['seeds']*100 for i in ids]
fig,ax=plt.subplots(figsize=(11,4));ax.bar([i[:3] for i in ids],y,color='#8c74a6');ax.axhline(100/len(ids),color='#17212d',linestyle='--',label='Uniform target');ax.set_ylabel('First offered artifact (%)');ax.set_title('Elite/Mystery artifacts: uniform within eligible unowned tier',fontweight='bold');ax.legend(frameon=False);ax.grid(axis='y',alpha=.18);ax.set_axisbelow(True);fig.text(.5,.01,f'{h["seeds"]} recorded seeds · Passive present · e13 excluded (no Hand-discard capability) · card support/duplicate weights never applied',ha='center',fontsize=9);fig.tight_layout(rect=[0,.04,1,1]);fig.savefig(FIG/'artifact_uniform_histogram.png',dpi=160);plt.close(fig)
finrows=[[titles[s['difficulty']],s['policy'],f"{s['meanGoldBeforeFinalBossReward']:.1f}",f"{s['minGoldBeforeFinalBossReward']}–{s['maxGoldBeforeFinalBossReward']}",f"{s['meanSpent']:.1f}",f"{s['meanArtifactsBought']:.2f}",s['shopVisits'],s['noAffordableCardVisits']] for s in normalized]
(OUT/'tables/gold_projection.md').write_text('# Conditional Gold projection\n\nAll fights are pre-won fixtures, not a combat policy. Same 12 seeds across profiles/policies. Runtime final Boss gives +60 after the run; this table excludes that unusable post-run amount for comparison. Values use actual Shop/claim/price/recovery owners.\n\n'+table(['Profile','Route/purchase policy','Mean Gold before final reward','Seed range','Mean spent','Mean artifacts bought','Shop visits','No affordable card'],finrows))
recrows=[]
for d in titles:
 for b in ['moderate','severe']:
  ss=[s for s in summary if s['difficulty']==d and s['budgetName']==b];recrows.append([titles[d],b,sum(s['cases'] for s in ss),sum(s['modelBudgetDepleted'] for s in ss),f"{statistics.mean(s['meanRecovery'] for s in ss):.1f}",f"{statistics.mean(s['meanFinalHp'] for s in ss):.1f}"])
(OUT/'tables/recovery_sensitivity.md').write_text('# Scripted recovery sensitivity\n\nNot a student win-rate study or an engine combat-policy simulation. Starting HP is runtime 60 in all profiles (+actual Ration), not proposed Combat HP 75/60/55.\n\nModerate cost per Normal/Elite/Boss = 4/8/12 HP. Severe = 7/14/20. Costs are declared assumptions; effects of buffs/card synergy are not translated into damage reductions. A budget depletion stops a case; it is not a measured combat defeat. Recovery includes real positive HP deltas from artifacts/Rest/stage clear/events.\n\n'+table(['Profile','Damage budget','Cases','Budget depleted','Mean actual HP recovery','Mean HP at stop/end'],recrows))
first_checks=[c for h in hist for c in h['firstRarityChecks']];delta=[x['deltaFraction']*100 for x in ab]
notes=f'''# Reproducible simulation findings

- Card offer cohorts: {len(hist)}; {len(manifest['histogramSeeds'])} recorded seeds each; 30,720 offers and 110,592 offered card slots. Support ON/OFF uses the same seed cohort/reference deck, before offers are opened.
- Artifact offer cohorts: {len(ah)}; {sum(h['seeds'] for h in ah):,} offers. Starting, Elite, Boss, Shop tiers and artifact event sources are uniform within their eligible/unowned tier. Owned s01 and unsupported Hand-discard e13 are excluded in these fixtures; Passive eligibility is tested both absent/present.
- First-slot rarity meets the declared exploratory tolerance `4 × sqrt(p(1-p)/512) + 0.01` in every cohort. This is a broad distribution sanity screen, not evidence of human preferences. Wilson intervals are recorded for first-slot observations. Multi-slot counts are descriptive because slots within an offer are dependent.
- Histogram reference deck is the fixed 12-card starter plus one owned Grimoire Ward; this is a sampling fixture, not a changed production starter. Depth alternates 1/6 in each stage. Exact snapshots are stored in sample_offer_receipts.json and the manifest.
- Bounded support raises supported-card exposure by {min(delta):.2f}–{max(delta):.2f} percentage points across the recorded cohorts. First-slot rarity counts are identical in every paired ON/OFF arm. No offer has duplicate IDs; every eligible ID has positive weight. No question or combat RNG is sampled by this operation.
- Gold/recovery projections: {len(runs)} cases, {len(manifest['routeSeeds'])} fixed seeds, 3 route/purchase policies, 4 runtime/candidate profiles, 3 explicit damage assumptions. All amounts/claims are settled through real engine owners. Fight outcome is a fixture, not measured Combat performance; no ICP/CCP or student win rate is produced.
- Conditional all-fights-won runs contain no Shop visit with zero affordable cards in this bounded cohort. This tests financial access only; card usefulness/optimal purchases require Combat/pick telemetry.
- Saver conditional policies leave roughly 350–506 candidate Gold at the end (before final Boss reward). This flags potential late unspent Gold. Do not automatically reduce income: the artifact-first policies spend more and Hard buys fewer artifacts than Easy. Review purchase opportunity timing and measured artifact/deck value with Map/Combat.
- Baseline read-only path analysis: {maps['forcedEliteMaps']} of {len(maps['maps'])} tested stage graphs have no route avoiding Elite. Their exact minimum paths/seeds are stored in map_route_inputs.json. This is NEEDS_INPUT for Map/Master; Economy changes no graph.
- Only 12 seeds per route/purchase/damage/profile cell: exploratory. Cashflow policies are intentionally simple and non-optimal. Artifact questions are scripted correct; event correctness follows a deterministic 75-percent threshold, instant scripted answer time (1 ms). No sample of pupils exists.
'''
(OUT/'SIMULATION_FINDINGS.md').write_text(notes)
print(json.dumps({'figures':4,'cardCohorts':len(hist),'artifactCohorts':len(ah),'routeCases':len(runs),'forcedEliteGraphs':maps['forcedEliteMaps']}))
