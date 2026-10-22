const {completeMystery}=require('./helpers/mystery.cjs');
const {claimArtifact,completeTrial,completeBrowserTrial}=require('./helpers/education.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const Q = require('../dist/education.js');

const copy = r => JSON.parse(JSON.stringify(r));
// Resolve only the actual bounded choices offered by the public engine.
function finishCardChoices(r){
 const decisions=[];
 for(let i=0;E.cardChoice(r);i++){
  assert.ok(i<12,'bounded card choices must finish');
  const choice=E.cardChoice(r),cards=choice.candidates||[],preferred=cards.find(c=>E.definition(c).role==='attack')||cards[0];
  let value=choice.kind==='card_search'?'attack':choice.kind==='burning_page'?'take':preferred.uid;
  if(choice.kind==='read_ahead')value={take:preferred.uid,order:cards.filter(c=>c.uid!==preferred.uid).map(c=>c.uid)};
  E.chooseCardOption(r,value);decisions.push(value);
 }
 return decisions;
}


function solveForecast(r, useHint = false) {
  let q;
  try { q = E.forecast(r); }
  catch (error) {
    if (/Not enough cards in the source/.test(error.message)) return;
    throw error;
  }
  if (useHint) E.hint(r);
  if(q.source==='bank'){
    if(q.exhausted){const result=E.completeExhaustedForecast(r);assert.equal(result.scored,false);assert.equal(result.focusGained,0);}
    else {E.selectForecast(r,Q.catalog[q.questionId].correctChoiceId);assert.equal(E.answerBankForecast(r).correct,true);}
  }else assert.equal(E.answer(r, `${q.n}/${q.d}`).correct, true);
  E.closeForecast(r);
}

// A small deterministic one-turn planner. Every selected action is replayed
// through the public engine; it never grants cards, energy, HP or damage.
function planTurn(r) {
  const initialHp = r.battle.hp;
  function score(candidate) {
    if (candidate.scene !== 'battle') return 100000 + candidate.hp;
    const b = candidate.battle;
    const loss = Math.max(0, E.intent(candidate).damage - b.block);
    if (loss >= candidate.hp) return -100000 + (initialHp - b.hp);
    return (initialHp - b.hp) * 1.65 - loss * 2.15 + Math.min(b.block, E.intent(candidate).damage) * .05;
  }
  let beam = [{state: copy(r), actions: []}];
  let best = beam[0];
  for (let depth = 0; depth < 6; depth++) {
    const next = [];
    for (const node of beam) {
      const state = node.state;
      if (state.scene !== 'battle') continue;
      const seen = new Set();
      for (const c of state.battle.hand) {
        const signature = `${c.key}/${c.upgraded}`;
        if (seen.has(signature) || E.canPlay(state,c)) continue;
        seen.add(signature);
        const def = E.definition(c);
        let targetSets = [[]];
        if (def.filter) {
          const n = E.filterLimit(state, c);
          const pool = state.battle.draw;
          targetSets = ['attack', 'guard'].map(role => [...pool]
            .sort((a,b) => (E.definition(b).role === role) - (E.definition(a).role === role))
            .slice(0,n).map(card => card.uid));
        }
        const boostOptions = (E.cardPlan(state,c)?.card.focus_eligible || def.damage || def.block) && state.battle.focus && !state.battle.boostUsed ? [false,true] : [false];
        for (const targets of targetSets) for (const boost of boostOptions) {
          const changed = copy(state);
          if (boost) E.armFocus(changed);
          E.playCard(changed, c.uid, targets);
          const choices=finishCardChoices(changed);
          const candidate = {state: changed, actions: [...node.actions, {uid: c.uid, targets, boost,choices}]};
          if (score(candidate.state) > score(best.state)) best = candidate;
          next.push(candidate);
        }
      }
    }
    beam = next.sort((a,b) => score(b.state) - score(a.state)).slice(0,16);
    if (!beam.length) break;
  }
  return best.actions;
}

function fight(r, trace, hints = false) {
  const encounter = r.battle.enemyId;
  let turns = 0;
  while (r.scene === 'battle') {
    assert.ok(++turns < 45, `fight did not finish: ${encounter}`);
    solveForecast(r, hints);
    const plan = planTurn(r);
    for (const action of plan) {
      if (action.boost) E.armFocus(r);
      E.playCard(r, action.uid, action.targets);
      for(const choice of action.choices||[])E.chooseCardOption(r,choice);
      assert.ok(E.validate(r), `invalid state after ${encounter} card`);
      if (r.scene !== 'battle') break;
    }
    if (r.scene === 'battle') E.endTurn(r);
    assert.ok(E.validate(r), `invalid state after ${encounter} turn`);
    // Save/continue between every turn must be behavior preserving.
    const saved = copy(r);
    assert.deepEqual(E.intent(saved), E.intent(r));
  }
  trace.push({enemy: encounter, turns, hp: r.hp, result:r.scene});
}

function campaign(seed, hints = false, mode = 'learn', routeVersion = 2) {
  const r = E.newRun(seed, mode, routeVersion);
  const trace = [];
  const priority = ['stm.attack.twin_shot','stm.attack.rune_strike','stm.attack.weak_point','stm.defend.rune_guard','stm.defend.foreseen_guard','stm.attack.sure_hit','balance','blast','fort','guard','flameguard','clarity','pierce','ember','strike','draw','filter','renew'];
  let steps = 0;
  while (!['victory','defeat'].includes(r.scene)) {
    assert.ok(++steps < 80);
    if(E.artifactChoices(r).length) claimArtifact(r,E.artifactChoices(r)[0].id);
    else if (r.scene === 'map') {
      const map = E.getMap(r);
      const risk = node => (node.type === 'elite' ? 100 : node.type === 'camp' ? -4 : node.type === 'event' ? -2 : 0) +
        (node.next.length ? Math.min(...node.next.map(id => risk(map.nodes.find(n => n.id === id)))) : 0);
      const choice = E.availableNodes(r).sort((a,b) => risk(a) - risk(b))[0];
      E.enterNode(r, choice.id);
    }
    else if (r.scene === 'battle') fight(r, trace, hints);
    else if (r.scene === 'reward') {
      const choice = priority.find(key => r.rewards.includes(key));
      assert.equal(new Set(r.rewards).size,3);
      E.chooseReward(r,choice);
    } else if (r.scene === 'camp') {
      if (r.hp < 49) E.camp(r,'heal');
      else {
        const target=r.deck.find(c => E.canUpgrade(c) && ['stm.attack.twin_shot','stm.attack.rune_strike','stm.attack.weak_point','blast','balance','ember','strike'].includes(c.key)) || r.deck.find(c=>E.canUpgrade(c));
        if(target)E.camp(r,'upgrade',target.uid);else E.camp(r,'heal');
      }
    } else if (r.scene === 'event') completeMystery(r);
    else if (r.scene === 'shop') E.leaveShop(r);
    else if (r.scene === 'stageclear') {
      const hp = r.hp;
      E.nextStage(r);
      assert.equal(r.hp,Math.min(60,hp+12));
      assert.ok(r.checkpoint);
    } else assert.fail(`unexpected scene ${r.scene}`);
    assert.ok(E.validate(r), `invalid state at ${r.scene}`);
  }
  return {run:r,trace};
}

test('ten-level maps can complete both stages through real combat, events, rests and rewards', t => {
  const results=[7,42,81].map(seed=>({seed,...campaign(seed,false,'learn',3)}));
  for(const {seed,run,trace} of results)t.diagnostic(JSON.stringify({map:'10 levels',seed,result:run.scene,hp:run.hp,trace}));
  const winner=results.find(result=>result.run.scene==='victory');
  assert.ok(winner,'No representative ten-level campaign reached both bosses');
  assert.equal(winner.run.depth,9);
  assert.equal(winner.run.route.path.length,9);
  assert.equal(winner.trace.filter(x=>['sentinel','dealer'].includes(x.enemy)).length,2);
  assert.ok(E.restore(copy(winner.run)));
});

test('challenge mode has a complete winnable two-stage route through real actions', t => {
  const results = [1,7,42,112,2026].map(seed => ({seed, ...campaign(seed, false, 'challenge')}));
  for (const {seed,run,trace} of results) {
    t.diagnostic(JSON.stringify({seed,result:run.scene,hp:run.hp,trace}));
  }
  const winner = results.find(x => x.run.scene === 'victory');
  assert.ok(winner,'none of five seeds was winnable with a bounded one-turn strategy');
  assert.equal(winner.run.stats.battles,6);
  assert.equal(winner.run.stage,1);
  assert.equal(winner.run.battle.enemyId,'dealer');
  assert.equal(winner.run.battle.seals,2);
  assert.equal(winner.trace.filter(x => ['sentinel','dealer'].includes(x.enemy)).length,2);
  assert.ok(E.validate(copy(winner.run)));
});

test('guided learning mode remains accessible across representative full campaigns', t => {
  const results = [1,7,42,112,2026].map(seed => ({seed, ...campaign(seed, true, 'learn')}));
  let victories = 0;
  for (const {seed,run,trace} of results) {
    t.diagnostic(JSON.stringify({mode:run.mode,seed,result:run.scene,hp:run.hp,trace}));
    assert.equal(run.mode,'learn');
    assert.ok(run.stats.assisted > 0);
    assert.equal(run.stats.firstCorrect,0,'guided answers must not silently award first-answer mastery');
    if (run.scene === 'victory') {
      victories++;
      assert.equal(run.stats.battles,6);
      assert.equal(run.battle.seals,2);
      assert.ok(E.validate(copy(run)));
    }
  }
  assert.ok(victories >= 4, `only ${victories}/5 guided learning campaigns won`);
});

test('stage checkpoint remains exact and reusable after repeated defeats and save/reload', () => {
  const r = E.newRun(81, 'learn', 2);
  r.scene = 'stageclear';
  r.depth = 4;
  r.hp = 21;
  r.deck[0].upgraded = true;
  E.nextStage(r);
  const checkpoint = copy(r.checkpoint);
  assert.equal(r.stage,1);
  assert.equal(r.hp,33);
  let current = r;
  for (let attempt = 0; attempt < 3; attempt++) {
    E.enterNode(current);
    current.hp = 0;
    current.scene = 'defeat';
    assert.ok(E.validate(current));
    current = E.retry(copy(current));
    assert.equal(current.stage,1,`retry ${attempt + 1} unexpectedly reset stage`);
    assert.equal(current.depth,0);
    assert.equal(current.hp,33);
    assert.equal(current.rng,checkpoint.rng);
    assert.deepEqual(current.deck,checkpoint.deck);
    assert.deepEqual(current.stats,checkpoint.stats);
    assert.ok(current.checkpoint,`retry ${attempt + 1} lost checkpoint`);
    assert.ok(E.validate(current));
  }
});

test('starting-run retry restores the same seed and full starter deck', () => {
  const r = E.newRun(718, 'learn', 2);
  E.enterNode(r);
  r.hp = 0;
  r.scene = 'defeat';
  const retry = E.retry(r);
  assert.equal(retry.seed,718);
  assert.equal(retry.stage,0);
  assert.equal(retry.depth,0);
  assert.equal(retry.hp,60);
  assert.deepEqual(retry.deck,E.newRun(718, 'learn', 2).deck);
  assert.ok(E.validate(retry));
});
