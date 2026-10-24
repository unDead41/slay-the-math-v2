'use strict';

const {createReplay} = require('../map/replay.cjs');
const {createAgent} = require('../../ai-playtester/agent.cjs');
const {createDeckPolicy} = require('../../ai-playtester/deck-policy.cjs');
const {createEffectsTracker} = require('../../ai-playtester/effects.cjs');

// Controlled sensitivity only: an explicitly declared answer-key oracle changes
// artifact-trial choices, while the actual trial/award/decline APIs still run.
function trial(x, job) {
  const {E, Q} = x, originalSelect = E.selectEducation;
  const agent = createAgent(x, {skill: 'intermediate'}), tracker = createEffectsTracker(x);
  const ai = {energySpent: 0, focusSpent: 0, trials: []};
  let ordinal = 0, completed = 0;
  function paid(r) {
    if (r.stats.cardsPlayed === ordinal) return;
    const tx = r.battle.cardCombat.receipts.at(-1);
    if (!tx || tx.status !== 'resolved') return;
    if (r.stats.cardsPlayed !== ordinal + 1) throw Error('Artifact sensitivity missed a receipt');
    ordinal++; ai.energySpent += tx.energy; ai.focusSpent += tx.focus;
  }
  if (job.artifactOracle) E.selectEducation = (r, id) => originalSelect(r, Q.current(r).correctChoiceId);
  try {
    const result = createReplay(x).runCampaign({runSeed: job.seed, mode: 'challenge', difficulty: job.difficulty,
      predictProfile: job.predict, routePolicy: job.route, telemetry: true,
      combatAgent: r => agent.decide(r), combatChoice: r => agent.choose(r), onCombatPlay: paid,
      observeAction(r, fn) {
        const v = tracker.capture(r, fn), list = r.educationState?.completed || [];
        while (completed < list.length) ai.trials.push({...list[completed++]});
        return v;
      }, deckPolicy: createDeckPolicy(x), agentVersion: agent.version});
    const {cards, ...effects} = tracker.snapshot();
    if (effects.totals.energySpent !== ai.energySpent || effects.totals.focusSpent !== ai.focusSpent) throw Error('Artifact sensitivity cost accounting');
    return {...result, ai: {...ai, cards, effects}, artifactOracle: job.artifactOracle,
      artifactAbility: job.artifactOracle ? 'synthetic correct-first artifact trials only' : 'uniform untried visible artifact answers, runtime two-attempt cap',
      pupilWinRatesMeasured: false};
  } finally {tracker.dispose(); E.selectEducation = originalSelect;}
}
module.exports = {trial};
