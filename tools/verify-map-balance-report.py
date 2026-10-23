#!/usr/bin/env python3
"""Independent CSV/JSON, graph, coverage and provenance checks for map reports."""
import argparse
import csv
import hashlib
import json
import math
import subprocess
from collections import defaultdict
from pathlib import Path


def verify(report):
    root = Path(__file__).resolve().parents[1]
    report = Path(report).resolve()
    load = lambda name: json.loads((report / name).read_text())
    context, manifest, summary = [load(n) for n in ('context.json', 'manifest.json', 'summary.json')]
    routes, seeds, maps, trials, campaigns, nodes = [load(n) for n in
        ('routes.json', 'seeds.json', 'maps.json', 'trials.json', 'campaigns.json', 'nodes.json')]
    digest = lambda data: hashlib.sha256(data).hexdigest()
    context_id = digest(json.dumps(context, separators=(',', ':'), ensure_ascii=False).encode())
    assert context_id == manifest['contextId'] == summary['contextId']
    for file, info in manifest['files'].items():
        data = (report / file).read_bytes()
        assert len(data) == info['bytes'] and digest(data) == info['sha256'], file
    for file, expected in {**context['sourceHashes'], **context['toolHashes']}.items():
        assert digest((root / file).read_bytes()) == expected, file
    assert digest((root / 'tools/balance/map/inputs/balance-v1.2-reference.json').read_bytes()) == context['inputPackage']['memberSha256']
    for name, rows in [('routes', routes), ('seeds', seeds), ('campaigns', campaigns)]:
        with (report / (name + '.csv')).open(newline='') as stream:
            csv_rows = list(csv.DictReader(stream))
        assert len(csv_rows) == len(rows), name
        for text_row, row in zip(csv_rows, rows):
            for key, value in text_row.items():
                expected = row.get(key)
                if expected is None:
                    assert value == '', (name, key, value)
                elif isinstance(expected, (dict, list, bool)):
                    assert json.loads(value) == expected, (name, key)
                elif isinstance(expected, (int, float)):
                    assert float(value) == expected, (name, key)
                else:
                    assert value == str(expected), (name, key)
    seed_rows = {(r['seed'], r['stage']): r for r in seeds}
    snapshots = {(m['seed'], m['stage']): m['snapshot'] for m in maps}
    assert len(seed_rows) == len(seeds) == len(snapshots)
    assert len(set(context['seedList'])) == len(context['seedList']) == summary['seedCount']
    assert len(seeds) == summary['mapCount'] == 2 * len(context['seedList'])
    groups, route_keys = defaultdict(list), set()
    for r in routes:
        key = (r['seed'], r['stage'], r['id'])
        assert key not in route_keys
        route_keys.add(key)
        assert r['contextId'] == context_id and r['combatPower'] is None
        assert r['scoreKind'] == 'ESTIMATED_PRESSURE' and math.isfinite(r['estimatedPressure'])
        assert r['fullyTraversedTrials'] <= r['simulationTrials']
        groups[key[:2]].append(r)
        m = snapshots[key[:2]]
        by_id = {n['id']: n for n in m['nodes']}
        edges = {(e['from'], e['to']) for e in m['edges']}
        path = r['nodeIds']
        assert len(path) == 10 and all((a, b) in edges for a, b in zip(path, path[1:]))
        assert [by_id[n]['level'] for n in path] == list(range(1, 11))
        assert [by_id[path[i]]['type'] for i in (4, 8, 9)] == ['mystery', 'rest', 'boss']
        probability = 1 / sum(n['level'] == 1 for n in m['nodes'])
        for n in path[:-1]:
            probability /= sum(e['from'] == n for e in m['edges'])
        assert abs(probability - r['probability']) < 1e-12
    assert len(routes) == summary['structureRoutes']
    for key, rows in groups.items():
        s = seed_rows[key]
        assert len(rows) == s['routeCount'] and abs(sum(r['probability'] for r in rows) - 1) < 1e-12
        ranked = sorted(rows, key=lambda r: (r['estimatedPressure'], r['id']))
        for field, i in [('easiestRouteId', 0), ('medianRouteId', (len(rows)-1)//2), ('hardestRouteId', -1)]:
            assert ranked[i]['id'] == s[field], (key, field)
    assert len({t['trialId'] for t in trials}) == len(trials)
    pilot = [t for t in trials if t['batch'] == 'pilot']
    diagnostics = [t for t in trials if t['batch'] == 'diagnostic']
    assert len(pilot) == summary['actualPilotTrials'] and len(diagnostics) == summary['actualDiagnosticTrials']
    for t in trials:
        assert t['contextId'] == context_id and t['invalidStates'] == 0
        assert t['seed'] == f"STM-{t['runSeed'] % 100 + 1:03}"
        assert t['apiCalls'] <= context['limits']['maxActions']
        for stage in (1, 2):
            plan = t['plannedRoutes'][str(stage)]
            assert (t['seed'], stage, plan['id']) in route_keys
            visited = [r['nodeId'] for r in t['rooms'] if r['stage'] == stage]
            assert visited == plan['nodeIds'][:len(visited)], t['trialId']
        if t['status'] == 'VICTORY':
            assert all(s['cleared'] for s in t['stages']) and t['campaignWon'] is True
        elif t['status'] == 'DEFEAT':
            assert t['final']['hp'] == 0 and t['campaignWon'] is False
        else:
            assert t['campaignWon'] is None
    for c in campaigns:
        group = [t for t in pilot if t['seed'] == c['seed']]
        assert len(group) == context['pilotTrialsPerSeed']
        assert c['wins'] == sum(t['status'] == 'VICTORY' for t in group)
        assert c['wins'] + c['losses'] == c['trials']
        if c['errors'] or c['censored']:
            assert c['combatPower'] is None
    exposures, full = set(), set()
    for t in trials:
        for stage in (1, 2):
            visited = [r for r in t['rooms'] if r['stage'] == stage]
            if visited:
                key = (t['seed'], stage, t['plannedRoutes'][str(stage)]['id'])
                exposures.add(key)
                if len(visited) == 10:
                    full.add(key)
    assert len(exposures) == summary['simulatedUniqueStageRoutes']
    assert len(full) == summary['fullyTraversedUniqueStageRoutes']
    assert sum(n['entries'] for n in nodes) == sum(len(t['rooms']) for t in pilot)
    for s in seeds:
        entered = [r for t in pilot if t['seed'] == s['seed'] for r in t['rooms'] if r['stage'] == s['stage'] and r['roomType'] == 'boss']
        assert len(entered) == s['bossEntries']
        if entered:
            assert math.isclose(sum(r['enter']['hp'] for r in entered) / len(entered), s['meanBossEntryHp'])
    return {'status': 'PASS', 'contextId': context_id, 'seeds': len(context['seedList']),
            'maps': len(maps), 'routes': len(routes), 'pilotTrials': len(pilot),
            'diagnosticTrials': len(diagnostics), 'manifestFiles': len(manifest['files']),
            'sourceFiles': len(context['sourceHashes']), 'toolAndInputFiles': len(context['toolHashes']),
            'csvCellsChecked': sum(len(list(csv.DictReader((report / (n + '.csv')).open(newline='')))[0]) * len(rows) for n, rows in [('routes', routes), ('seeds', seeds), ('campaigns', campaigns)]),
            'routeExposureCount': len(exposures), 'fullTenNodeTraversalCount': len(full)}


def verify_pairs(report, pairs_dir):
    root = Path(__file__).resolve().parents[1]
    report, pairs_dir = Path(report).resolve(), Path(pairs_dir).resolve()
    load = lambda folder, name: json.loads((folder / name).read_text())
    context, manifest, seeds = [load(pairs_dir, n) for n in ('context.json', 'manifest.json', 'seeds.json')]
    if not (pairs_dir / 'pairs-index.json').exists():
        rows = load(pairs_dir, 'pairs.json')
    else:
        index = load(pairs_dir, 'pairs-index.json')
        rows = []
        for chunk in index['chunks']:
            assert hashlib.sha256((pairs_dir / chunk['file']).read_bytes()).hexdigest() == chunk['sha256']
            part = load(pairs_dir, chunk['file'])
            assert len(part) == chunk['rows']
            rows.extend(part)
        assert len(rows) == index['totalRows']
    digest = lambda data: hashlib.sha256(data).hexdigest()
    assert digest(json.dumps(context, separators=(',', ':'), ensure_ascii=False).encode()) == manifest['contextId']
    assert digest((root / 'tools/balance/map-campaign-pairs.cjs').read_bytes()) == context['toolSha256']
    for name, info in manifest['files'].items():
        data = (pairs_dir / name).read_bytes()
        assert digest(data) == info['sha256'] and len(data) == info['bytes']
    for name, expected in context['sourceReportHashes'].items():
        assert digest((report / name).read_bytes()) == expected
    runtime = json.loads(subprocess.check_output(['node', '-e', "const c=require('./dist/config.js'); console.log(JSON.stringify({enemies:c.enemies,stages:c.stages}));"], cwd=root, text=True))
    maps = {(m['seed'], m['stage']): m['snapshot'] for m in load(report, 'maps.json')}
    routes = {(r['seed'], r['stage'], r['id']): r for r in load(report, 'routes.json')}
    vectors = {}
    for key, r in routes.items():
        seed, stage, _ = key
        nodes = {n['id']: n for n in maps[(seed, stage)]['nodes']}
        config = runtime['stages'][stage - 1]
        variants = []
        for v in r['variants']:
            values = []
            for node_id in r['nodeIds']:
                n = nodes[node_id]
                if n['type'] == 'rest':
                    values.append(-context['referenceRestHeal'])
                elif n['type'] in ('battle', 'elite', 'boss'):
                    elite = n['type'] == 'elite'
                    roster = config['elites'] if elite else config['normals']
                    enemy_id = config['boss'] if n['type'] == 'boss' else roster[(n['level'] + n['column'] + v['runSeed'] % len(roster)) % len(roster)]
                    e = runtime['enemies'][enemy_id]
                    per_turn = context['referenceDamagePerTurn'] - sum(p.get('block', 0) for p in e['patterns']) / len(e['patterns'])
                    turns = min(100, max(1, math.ceil((e['hp'] + (10 if elite else 0)) / per_turn))) if per_turn > 0 else 100
                    burden = 0
                    for t in range(1, turns):
                        p = e['patterns'][(t-1) % len(e['patterns'])]
                        raw = p['damage'] + 2*((t-1)//6) + (2 if elite else 0)
                        attack = math.ceil(raw * (0.7 if context['mode'] == 'learn' else 1))
                        burden += max(0, attack*p.get('hits', 1) - context['referenceBlockPerTurn'])
                    values.append(burden)
                else:
                    values.append(0)
            variants.append(values)
        vectors[key] = variants
    seen, groups = set(), defaultdict(list)
    with (pairs_dir / 'pairs.csv').open(newline='') as stream:
        csv_rows = list(csv.DictReader(stream))
    assert len(csv_rows) == len(rows)
    for r, text in zip(rows, csv_rows):
        assert r['contextId'] == manifest['contextId'] == text['contextId']
        key = (r['seed'], r['stage1RouteId'], r['stage2RouteId'])
        assert key not in seen and r['combatPower'] is None and text['combatPower'] == ''
        seen.add(key); groups[r['seed']].append(r)
        a, b = (r['seed'], 1, key[1]), (r['seed'], 2, key[2])
        assert math.isclose(r['probability'], routes[a]['probability']*routes[b]['probability'])
        peaks = []
        for av, bv in zip(vectors[a], vectors[b]):
            debt = peak = 0
            for value in av + [-context['nominalStageClearHeal']] + bv:
                debt = max(0, debt + value)
                peak = max(peak, debt)
            peaks.append(peak)
        assert math.isclose(r['estimatedPressure'], sum(peaks)/3)
        assert math.isclose(float(text['estimatedPressure']), r['estimatedPressure'])
        assert text['id'] == r['id'] and text['stage1RouteId'] == key[1] and text['stage2RouteId'] == key[2]
    expected = 0
    for s in seeds:
        seed = s['seed']
        count = sum(k[0] == seed and k[1] == 1 for k in routes) * sum(k[0] == seed and k[1] == 2 for k in routes)
        expected += count
        assert count == len(groups[seed]) == s['pairCount']
        assert abs(sum(r['probability'] for r in groups[seed]) - 1) < 1e-12
        ranked = sorted(groups[seed], key=lambda r: (r['estimatedPressure'], r['id']))
        assert [s[k]['id'] for k in ['easiestPair', 'medianPair', 'hardestPair']] == [ranked[0]['id'], ranked[(count-1)//2]['id'], ranked[-1]['id']]
    assert expected == len(rows) == manifest['structuralPairCount']
    return {'status': 'PASS', 'seeds': len(seeds), 'pairs': expected, 'independentPeakRecalculations': 3*expected}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('report', nargs='?', default='reports/map-balance/base-2800f9a')
    parser.add_argument('--pairs', help='Also verify the derived two-stage structural pair report')
    args = parser.parse_args()
    result = verify(args.report)
    if args.pairs:
        result['campaignPairs'] = verify_pairs(args.report, args.pairs)
    print(json.dumps(result, indent=2))
