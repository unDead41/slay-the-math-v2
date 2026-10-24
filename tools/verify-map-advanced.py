#!/usr/bin/env python3
"""Independent stdlib verification of canonical-engine map experiment exports.

Does not import the Node report, score, worker or policy implementation.
"""
import argparse
import collections
import csv
import hashlib
import json
import math
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()


def load(path):
    return json.loads(path.read_text())


def near(actual, expected):
    assert actual is not None and math.isclose(actual, expected, rel_tol=1e-11, abs_tol=1e-10), (actual, expected)


def verify_score(row, cohort, stage, planned, reference):
    """Reconstruct a table scope directly from immutable trials, including unknowns."""
    selected = [r for r in cohort if stage is None or r["stages"][stage-1]["reached"]]
    unresolved = [r for r in cohort if stage is None or not r["stages"][stage-1]["cleared"]]
    terminal = [r for r in selected if (stage is not None and r["stages"][stage-1]["cleared"]) or r["status"] in ["VICTORY", "DEFEAT"]]
    wins = sum(r["status"] == "VICTORY" if stage is None else r["stages"][stage-1]["cleared"] for r in terminal)
    errors = sum(r["status"] == "INVALID_POLICY_OR_ENGINE" for r in unresolved)
    censored = sum(r["status"] == "BENCHMARK_LIMIT_CENSORED" for r in unresolved)
    n = len(terminal)
    expected = {"plannedTrials": planned, "completedCampaignTrials": len(cohort), "trials": n, "wins": wins, "losses": n-wins, "notReached": len(cohort)-len(selected), "errors": errors, "censored": censored,
                "campaignErrors": sum(r["status"] == "INVALID_POLICY_OR_ENGINE" for r in cohort), "campaignCensored": sum(r["status"] == "BENCHMARK_LIMIT_CENSORED" for r in cohort),
                "scoreStatus": "UNSCORABLE" if errors or censored else "PROVISIONAL" if n else "NOT_SIMULATED", "evaluationComplete": len(cohort) == planned and not errors and not censored}
    for key, value in expected.items():
        assert row[key] == value, (key, row[key], value)
    if errors or censored or not n:
        assert all(row[key] is None for key in ["combatPower", "winRate", "smoothedWinProbability", "winInterval95", "combatPowerInterval95"])
    else:
        p, smoothed, z = wins/n, (wins+.5)/(n+1), 1.959963984540054
        center = (p+z*z/(2*n))/(1+z*z/n)
        half = z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/(1+z*z/n)
        interval = [0 if wins == 0 else max(0, center-half), 1 if wins == n else min(1, center+half)]
        power = lambda probability: 1000*math.log(1/probability)/math.log(1/reference)
        near(row["winRate"], p)
        near(row["smoothedWinProbability"], smoothed)
        near(row["combatPower"], power(smoothed))
        for actual, value in zip(row["winInterval95"], interval):
            near(actual, value)
        near(row["combatPowerInterval95"][0], power(interval[1]))
        if interval[0]:
            near(row["combatPowerInterval95"][1], power(interval[0]))
        else:
            assert row["combatPowerInterval95"][1] is None
        assert row["cpUpperUnbounded"] == (interval[0] == 0)
    if stage is None:
        unknown = errors+censored+max(0, planned-len(cohort))
        near(row["allCaseWinBounds"][0], wins/planned)
        near(row["allCaseWinBounds"][1], (wins+unknown)/planned)


def verify(out):
    context, manifest = load(out / "context.json"), load(out / "manifest.json")
    cfg = context["config"]
    current = cfg.get("runtimeBuild") == "master"
    context_id = digest(compact(context))
    assert context_id == manifest["contextId"]
    files = 0
    for name, info in manifest["files"].items():
        data = (out / name).read_bytes()
        assert digest(data) == info["sha256"] and len(data) == info["bytes"], name
        files += 1
    provenance = load(out / "analysis-provenance.json")
    sources = {}
    for key in ["sourceHashes", "legacyToolHashes", "protocolHashes", "referenceHashes"]:
        sources.update(context[key])
    sources.update(provenance["analysisHashes"])
    for name, expected in sources.items():
        assert digest((ROOT / name).read_bytes()) == expected, "Changed source/input: " + name

    base = ROOT / "reports/map-balance/base-2800f9a"
    maps = {(r["seed"], r["stage"]): r["snapshot"] for r in load(base / "maps.json")}
    seeds = {(r["seed"], r["stage"]): r for r in load(base / "seeds.json")}
    routes = {(r["seed"], r["stage"], r["id"]): r for r in load(base / "routes.json")}
    old = {r["trialId"]: r for r in load(base / "trials.json")}
    records, captured, seen = [], {}, set()
    index = load(out / "trials-index.json")
    for shard in index["shards"]:
        data = (out / shard["file"]).read_bytes()
        assert len(data) == shard["bytes"] <= cfg["shardBytes"] and digest(data) == shard["sha256"]
        for line in data.splitlines():
            r = json.loads(line)
            assert digest(line.rsplit(b',"recordHash":', 1)[0] + b"}") == r["recordHash"]
            assert r["contextId"] == context_id and r["task"]["id"] not in seen
            seen.add(r["task"]["id"])
            assert r["seed"] in context["seedList"] and r["runSeed"] % 100 + 1 == int(r["seed"][4:])
            assert r["status"] in ["VICTORY", "DEFEAT", "STAGE_CLEARED", "BENCHMARK_LIMIT_CENSORED"], (r["task"]["id"], r["status"])
            assert r["invalidStates"] == 0 and 0 < r["apiCalls"] <= cfg["limits"]["maxActions"]
            assert r["syntheticOracleUsed"] == (r["predictProfile"] in ["high", "low"])
            if current:
                assert r["difficulty"] == context["difficulty"] and r["runtimeIdentity"] == context["runtimeIdentity"]
                assert r["metrics"]["predict"]["attempts"] <= 2 * r["metrics"]["predict"]["firstAttempts"]
            assert r["metrics"]["predict"]["attempts"] == sum(x["predict"]["attempts"] for x in r["rooms"])
            for stage in [1, 2]:
                rs = [x for x in r["rooms"] if x["stage"] == stage]
                m = maps[r["seed"], stage]
                nodes = {x["id"]: x for x in m["nodes"]}
                edges = {(x["from"], x["to"]) for x in m["edges"]}
                ids = [x["nodeId"] for x in rs]
                assert len(ids) <= 10 and all(nodes[x]["level"] == i + 1 for i, x in enumerate(ids))
                assert all((a, b) in edges for a, b in zip(ids, ids[1:]))
                plan = r["plannedRoutes"][str(stage)]
                assert ids == plan["nodeIds"][:len(ids)]
                if plan["id"]:
                    assert plan["id"] == "route-" + digest(compact(plan["nodeIds"]))[:16]
                    assert (r["seed"], stage, plan["id"]) in routes
                if r["stages"][stage - 1]["cleared"] and (r["task"]["batch"] == "campaign" or r["task"]["targetStage"] == stage):
                    assert len(ids) == 10 and rs[-1]["roomType"] == "boss"
            for room in r["rooms"]:
                a, b, metrics = room["enter"], room["exit"], room["metrics"]
                assert b["hp"] - a["hp"] == metrics["hpRecovered"] - metrics["hpLost"]
                assert b["gold"] - a["gold"] == metrics["goldEarned"] - metrics["goldSpent"]
                assert metrics["minHp"] <= min(a["hp"], b["hp"])
            raw = line.decode()
            cursor = raw.find('"checkpoints":')
            for checkpoint in r["checkpoints"]:
                cursor = raw.find('"state":', cursor) + len('"state":')
                state, end = json.JSONDecoder().raw_decode(raw, cursor)
                assert digest(raw[cursor:end].encode()) == checkpoint["stateHash"]
                cursor = end
                assert state == checkpoint["state"] and state["scene"] == "map" and state["depth"] == 0
                assert state["seed"] == r["runSeed"] and state["stage"] + 1 == checkpoint["stage"]
                assert state["route"]["version"] == 3 and checkpoint["clock"] >= state["started"]
                if current:
                    assert state["balanceState"]["difficulty"] == context["difficulty"]
                    assert state["balanceState"]["version"] == context["runtimeIdentity"]["version"]
                    assert state["balanceState"]["definitionHash"] == context["runtimeIdentity"]["definitionHash"]
                    assert state["economyState"]["difficulty"] == context["difficulty"]
                captured[r["task"]["id"], checkpoint["stage"]] = checkpoint
            records.append(r)
    assert len(records) == index["records"]
    campaigns = [r for r in records if r["task"]["batch"] == "campaign"]
    matched = [r for r in records if r["task"]["batch"] == "matched"]
    expected_ids = set()
    for seed in context["seedList"]:
        for group, counts in [("route", cfg["routePolicies"]), ("predict", cfg["predictProfiles"])]:
            for name, n in counts.items():
                expected_ids.update(f"{group}:{seed}:{name}:{i}" for i in range(n))
    assert {r["task"]["id"] for r in campaigns} == expected_ids
    uniform = [r for r in campaigns if r["task"]["policy"] == "uniform-visible-v1"]
    control = {(r["seed"], r["task"]["repetition"]): r for r in uniform}
    same_reference_runtime = context["sourceHashes"] == context["referenceRuntimeHashes"]
    legacy_matches = 0
    for r in campaigns:
        a = control[r["seed"], r["task"]["repetition"]]
        assert r["runSeed"] == a["runSeed"] and r["entryStateHash"] == a["entryStateHash"]
        if r["task"].get("referenceTrialId"):
            previous = old[r["task"]["referenceTrialId"]]
            identical = (r["status"], r["traceHash"]) == (previous["status"], previous["traceHash"])
            legacy_matches += int(identical)
            if same_reference_runtime:
                assert identical

    bank = load(out / "entry-bank.json")
    entries, triples, unique_entries = {}, collections.defaultdict(dict), set()
    for entry in bank:
        key = (entry["seed"], entry["stage"], entry["runSeed"])
        assert key not in unique_entries
        unique_entries.add(key)
        checkpoint = captured[entry["sourceTrialId"], entry["stage"]]
        state = checkpoint["state"]
        assert all(entry[k] == checkpoint[k] for k in ["stateHash", "runSeed", "clock", "policyRngStates"])
        assert entry["hp"] == state["hp"] and entry["gold"] == state["gold"] and entry["maxHp"] == state["maxHp"]
        assert entry["deckSize"] == len(state["deck"]) and entry["artifactIds"] == sorted(state["artifactState"]["owned"])
        assert entry["upgrades"] == sum(bool(c.get("upgraded")) for c in state["deck"])
        entries[entry["id"]] = entry
    captured_unique = {(r["seed"], c["stage"], r["runSeed"]) for r in uniform for c in r["checkpoints"]}
    assert unique_entries == captured_unique
    for r in matched:
        task = r["task"]
        entry = entries[task["entryId"]]
        assert r["entryStateHash"] == task["entryStateHash"] == entry["stateHash"]
        assert r["runSeed"] == entry["runSeed"] and task["targetStage"] == entry["stage"]
        assert task["routeId"] == seeds[r["seed"], task["targetStage"]][task["rank"] + "RouteId"]
        assert task["rank"] not in triples[entry["id"]]
        triples[entry["id"]][task["rank"]] = r
        if r["rooms"]:
            first = r["rooms"][0]["enter"]
            assert (first["hp"], first["maxHp"], first["gold"], first["deckFingerprint"], first["artifacts"]) == (entry["hp"], entry["maxHp"], entry["gold"], entry["deckFingerprint"], entry["artifactIds"])
    assert len(triples) == len(bank) and all(set(t) == set(cfg["ranks"]) for t in triples.values())

    score_rows = load(out / "matched-route-summary.json")
    assert len(score_rows) == len(context["seedList"]) * 2 * 3
    score_checks = 0
    for row in score_rows:
        scope = [r for r in matched if r["seed"] == row["seed"] and r["task"]["targetStage"] == row["stage"] and r["task"]["rank"] == row["rank"]]
        terminal = [r for r in scope if r["stages"][row["stage"]-1]["cleared"] or r["status"] in ["VICTORY", "DEFEAT"]]
        n, w = len(terminal), sum(r["stages"][row["stage"] - 1]["cleared"] for r in terminal)
        unresolved = any(r["status"] == "BENCHMARK_LIMIT_CENSORED" and not r["stages"][row["stage"]-1]["cleared"] for r in scope)
        assert (row["trials"], row["wins"], row["losses"]) == (n, w, n - w)
        if n and not unresolved:
            probability = (w + .5) / (n + 1)
            near(row["combatPower"], 1000 * math.log(1 / probability) / math.log(1 / cfg["referenceWinProbability"]))
            z, p = 1.959963984540054, w / n
            center = (p + z*z / (2*n)) / (1 + z*z/n)
            half = z * math.sqrt(p*(1-p)/n + z*z/(4*n*n)) / (1 + z*z/n)
            near(row["winInterval95"][0], 0 if w == 0 else max(0, center-half))
            near(row["winInterval95"][1], 1 if w == n else min(1, center+half))
        else:
            assert row["combatPower"] is None and row["winRate"] is None
        score_checks += 1
    contrasts = load(out / "matched-contrasts.json")
    assert len(contrasts) == 2 * len(bank)
    for row in contrasts:
        a, b = triples[row["entryId"]]["easiest"], triples[row["entryId"]][row["challengerRank"]]
        stage = row["stage"] - 1
        resolved = all(r["stages"][stage]["cleared"] or r["status"] == "DEFEAT" for r in [a,b])
        expected_delta = int(b["stages"][stage]["cleared"]) - int(a["stages"][stage]["cleared"]) if resolved else None
        assert row["winDelta"] == expected_delta
        assert row["finalHpDelta"] == b["final"]["hp"] - a["final"]["hp"]

    cells = 0
    for csv_path in sorted(out.glob("*.csv")):
        rows = load(csv_path.with_suffix(".json"))
        with csv_path.open(newline="") as f:
            exported = list(csv.DictReader(f))
        assert len(rows) == len(exported), csv_path.name
        for expected, actual in zip(rows, exported):
            for key, cell in actual.items():
                value = expected.get(key)
                if value is None:
                    assert cell == "", (csv_path.name, key)
                elif isinstance(value, bool):
                    assert cell == str(value).lower()
                elif isinstance(value, (list, dict)):
                    assert json.loads(cell) == value
                elif isinstance(value, (int, float)):
                    near(float(cell), value)
                else:
                    safe = "'" + value if re.match(r"^\s*[=+@-]", value) else value
                    assert cell == safe, (csv_path.name, key, cell, safe)
                cells += 1
    coverage = load(out / "route-coverage.json")
    assert len(coverage) == sum(1 for key in routes if key[0] in context["seedList"])
    observed_coverage = collections.defaultdict(collections.Counter)
    for r in records:
        batch = r["task"]["batch"]
        for stage_text, plan in r["plannedRoutes"].items():
            stage = int(stage_text)
            if not plan["id"] or (batch == "matched" and stage != r["task"]["targetStage"]):
                continue
            counts = observed_coverage[r["seed"], stage, plan["id"]]
            visits = sum(x["stage"] == stage for x in r["rooms"])
            counts[batch + "Plans"] += 1
            counts[batch + "Starts"] += int(visits > 0)
            counts[batch + "FullVisits"] += int(visits == 10)
    for row in coverage:
        assert (row["seed"], row["stage"], row["routeId"]) in routes
        assert row["campaignFullVisits"] <= row["campaignStarts"] <= row["campaignPlans"]
        assert row["matchedFullVisits"] <= row["matchedStarts"] <= row["matchedPlans"]
        counts = observed_coverage[row["seed"], row["stage"], row["routeId"]]
        assert all(row[key] == counts[key] for key in ["campaignPlans", "campaignStarts", "campaignFullVisits", "matchedPlans", "matchedStarts", "matchedFullVisits"])
    seed_policy = load(out / "seed-policy-summary.json")
    assert len(seed_policy) == len(context["seedList"]) * 2 * len(cfg["routePolicies"])
    for row in seed_policy:
        cohort = [r for r in campaigns if r["seed"] == row["seed"] and r["task"]["group"] == "route" and r["task"]["policy"] == row["policy"]]
        arrived = [r for r in cohort if r["stages"][row["stage"]-1]["reached"]]
        wins = sum(r["stages"][row["stage"]-1]["cleared"] for r in arrived)
        resolved = [r for r in arrived if r["stages"][row["stage"]-1]["cleared"] or r["status"] in ["VICTORY", "DEFEAT"]]
        assert (row["trials"], row["wins"], row["notReached"]) == (len(resolved), wins, len(cohort)-len(arrived))
    for row in load(out / "risk-reward.json"):
        cohort = [r for r in campaigns if r["task"]["policy"] == row["policy"] and r["predictProfile"] == row["predictProfile"]]
        rooms = [x for r in cohort for x in r["rooms"] if {"camp": "rest", "event": "mystery"}.get(x["roomType"], x["roomType"]) == row["roomType"]]
        assert row["visits"] == len(rooms)
        near(row["meanNetHp"], sum(x["exit"]["hp"]-x["enter"]["hp"] for x in rooms)/len(rooms))
        near(row["meanNetGold"], sum(x["exit"]["gold"]-x["enter"]["gold"] for x in rooms)/len(rooms))
    recovery = load(out / "recovery-windows.json")
    by_trial = {r["task"]["id"]: r for r in campaigns}
    for window in recovery:
        trial = by_trial[window["trialId"]]
        stage_rooms = [x for x in trial["rooms"] if x["stage"] == window["stage"]]
        before = stage_rooms[:next(i for i, x in enumerate(stage_rooms) if x["nodeId"] == window["nodeId"])]
        load_since_rest = 0
        for room in before:
            if room["roomType"] in ["rest", "camp"]:
                load_since_rest = 0
            elif room["roomType"] in ["battle", "elite", "boss"] or (room["roomType"] in ["mystery", "event"] and (room["predict"]["opportunities"] > 0 or room["playerTurns"] > 0)):
                load_since_rest += 1
        assert window["combatsSincePreviousRest"] == load_since_rest
    for driver in load(out / "difficulty-drivers.json"):
        cohort_ids = {r["task"]["id"] for r in campaigns if r["seed"] == driver["seed"] and r["task"]["group"] == "route"}
        windows = [w for w in recovery if w["trialId"] in cohort_ids and w["stage"] == driver["stage"] and w["kind"] == "mystery-failure-hp-loss"]
        assert driver["mysteryFailureHpLossWindows"] == len(windows)
        assert driver["mysteryFailureDeathsBeforeRest"] == sum(w["deathBeforeRest"] for w in windows)
    summary, gate = load(out / "summary.json"), load(out / "quality-gate.json")
    assert summary["evaluationComplete"]
    assert not set(gate["failures"]) - {"CENSORED_SCOPE_SCORES"}, gate["failures"]
    assert (gate["status"] == "PASS") == (not gate["failures"])
    assert summary["censored"] == sum(r["status"] == "BENCHMARK_LIMIT_CENSORED" for r in records)
    assert summary["campaignReturned"] == len(campaigns) and summary["matchedReturned"] == len(matched)
    assert summary["actualEngineCalls"] == sum(r["apiCalls"] for r in records)
    assert summary["fullDifficultyProfilesImplemented"] == ([context["difficulty"]] if current else []) and summary["studentPlaytests"] == 0
    if current:
        assert context["postRunBossGrant"] == cfg["postRunBossGrant"] == 0
        for table in ["policy-summary", "policy-stage-summary", "predict-summary", "seed-policy-summary", "matched-route-summary"]:
            for row in load(out / (table+".json")):
                if table == "matched-route-summary":
                    cohort = [r for r in matched if r["seed"] == row["seed"] and r["task"]["targetStage"] == row["stage"] and r["task"]["rank"] == row["rank"]]
                    planned = sum(e["seed"] == row["seed"] and e["stage"] == row["stage"] for e in bank)
                else:
                    cohort = [r for r in campaigns if r["task"]["policy"] == row["policy"] and r["predictProfile"] == row["predictProfile"] and ("seed" not in row or r["seed"] == row["seed"])]
                    if table == "predict-summary":
                        per_seed = max(cfg["predictProfiles"].values()) if row["predictProfile"] == "feedback" else cfg["predictProfiles"][row["predictProfile"]]
                        cohort = [r for r in cohort if r["task"]["repetition"] < per_seed]
                    else:
                        per_seed = cfg["routePolicies"][row["policy"]] if row["predictProfile"] == "feedback" else cfg["predictProfiles"][row["predictProfile"]]
                    planned = per_seed*(1 if "seed" in row else len(context["seedList"]))
                verify_score(row, cohort, row.get("stage"), planned, cfg["referenceWinProbability"])
        for row in load(out / "policy-summary.json"):
            near(row["meanFinalGoldExcludingPostRunBossGrant"], row["meanFinalGold"])
        assert "FULL_EASY_MEDIUM_HARD_ADAPTER_UNAVAILABLE" not in gate["warnings"]
    return {"status": "PASS", "contextId": context_id, "manifestFiles": files, "sourceAndInputHashes": len(sources), "trialRecords": len(records), "campaigns": len(campaigns), "matchedReplays": len(matched), "entryStates": len(bank), "matchedScoreRows": score_checks, "csvCells": cells, "routeRows": len(coverage), "uniformLegacyTraceMatches": legacy_matches, "legacyReferenceStatus": "NOT_COMPARABLE_CURRENT_PROFILE" if current else "PASS" if same_reference_runtime else "NEEDS_NEW_REFERENCE", "censoredTrials": summary["censored"], "scoreGateStatus": gate["status"], "studentCalibration": False}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("out", nargs="?", default="reports/map-balance/v1.3")
    parser.add_argument("--save", type=pathlib.Path)
    args = parser.parse_args()
    result = verify(pathlib.Path(args.out).resolve())
    text = json.dumps(result, indent=2) + "\n"
    if args.save:
        args.save.parent.mkdir(parents=True, exist_ok=True)
        args.save.write_text(text)
    print(text, end="")
