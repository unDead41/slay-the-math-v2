'use strict';

const {simulate} = require('./combat.cjs');
const {createDeckPolicy} = require('../../ai-playtester/deck-policy.cjs');
const {createReplay} = require('../map/replay.cjs');
const {pickNode} = require('../growth.cjs');

// Secondary default-game screen. Mystery is explicitly declined here; the
// primary Master campaign uses the complete existing replay including Mystery.
function campaign(x, o) {
  const {E, Q, A} = x, r0 = E.newRun(o.seed, 'challenge'), policy = createDeckPolicy(x);
  const helper = createReplay(x), random = helper.stream(o.seed, 'ordinary-artifact-feedback-2-attempts');
  const encounters = [], log = [];
  let r = r0, steps = 0;
  const artifact = () => E.artifactChoices(r).slice().sort((a, b) => helper.artifactMerit(b) - helper.artifactMerit(a) || a.id.localeCompare(b.id))[0];
  try {
    while (!['defeat', 'victory'].includes(r.scene) && steps++ < 300) {
      if (!E.validate(r)) throw Error('Invalid ordinary campaign at ' + r.scene);
      if (r.scene === 'master') E.chooseArtifact(r, artifact().id);
      else if (r.scene === 'education') {
        if (Q.ready(r)) E.continueEducation(r);
        else {
          const p = r.educationState.pending, available = p.choiceOrder.filter(id => !p.attempts.includes(id));
          E.selectEducation(r, available[Math.floor(random() * available.length)]);
          E.answerEducation(r);
        }
      } else if (r.scene === 'map') {
        const node = pickNode(E.availableNodes(r), o.routePolicy);
        log.push({kind: 'enter', stage: r.stage, depth: r.depth, type: node.type, hp: r.hp,
          size: r.deck.length, upgrades: r.deck.filter(c => c.upgraded).length, artifacts: A.owned(r).map(a => a.id)});
        E.enterNode(r, node.id);
      } else if (r.scene === 'battle') {
        const v = simulate(x, {...o, fromRun: r, returnRun: true,
          seed: Math.imul(o.seed ^ (r.stage * 17 + r.depth), 2654435761) >>> 0});
        const {run, ...metrics} = v;
        encounters.push(metrics);
        if (v.status === 'INVALID_POLICY_OR_ENGINE') throw Error(v.error);
        if (v.status === 'BENCHMARK_LIMIT_CENSORED') return {status: v.status, encounters, log};
        r = run;
      } else if (r.scene === 'reward') {
        if (r.artifactState?.offer?.ready) E.chooseArtifact(r, artifact().id);
        else {
          const d = policy.reward(r, r.rewards, !!r.battle.elite);
          log.push({kind: 'reward', key: d.key, offered: d.key === null || r.rewards.includes(d.key)});
          E.chooseReward(r, d.key);
        }
      } else if (r.scene === 'camp') {
        const d = policy.camp(r); log.push({kind: 'camp', ...d}); E.camp(r, d.action, d.uid);
      } else if (r.scene === 'shop') {
        const d = policy.shop(r); log.push({kind: 'shop', decision: d, gold: r.gold});
        if (d.kind === 'leave') E.leaveShop(r);
        else if (d.kind === 'remove') E.removeShopCard(r, d.uid);
        else if (d.kind === 'card') E.buyCard(r, d.index);
        else E.buyArtifact(r, d.index);
      } else if (r.scene === 'event') {
        log.push({kind: 'mystery-declined'}); E.leaveMystery(r);
      } else if (r.scene === 'stageclear') {
        if (E.artifactChoices(r).length) E.chooseArtifact(r, artifact().id);
        else E.nextStage(r);
      } else throw Error('Unhandled ordinary scene ' + r.scene);
    }
    if (steps >= 300) return {status: 'BENCHMARK_LIMIT_CENSORED', encounters, log};
    return {status: r.scene === 'victory' ? 'WIN' : 'LOSS', encounters, log, finalHp: r.hp,
      finalGold: r.gold, finalRng: r.rng, stage: r.stage, depth: r.depth,
      finalDeck: r.deck.map(c => ({key: c.key, upgraded: c.upgraded})), validFinal: E.validate(r)};
  } catch (error) { return {status: 'INVALID_POLICY_OR_ENGINE', error: error.stack, scene: r.scene, encounters, log}; }
}

module.exports = {campaign};
