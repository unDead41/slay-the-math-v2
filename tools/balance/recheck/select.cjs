'use strict';
const fs = require('node:fs'), path = require('node:path');
const {DEFAULT_OUT} = require('./run.cjs');
const dir = process.env.STM_RECHECK_OUT || DEFAULT_OUT, s = JSON.parse(fs.readFileSync(path.join(dir, 'SUMMARY.json')));
const positive = s.power.filter(p => p.kind === 'pairs' && p.cards[0] !== p.cards[1] && p.total?.mean > 5 && p.interaction?.mean > 0);
const master = positive.filter(p => p.context === 'master/medium').sort((a, b) => b.interaction.mean - a.interaction.mean)[0];
const ordinary = positive.filter(p => p.context === 'ordinary').sort((a, b) => b.interaction.mean - a.interaction.mean)[0];
const misleading = s.power.filter(p => p.kind === 'pairs' && p.cards[0] !== p.cards[1] && p.total?.mean < 0 && p.interaction?.mean > 0)
  .sort((a, b) => b.interaction.mean - a.interaction.mean)[0];
const adapt = p => ({family: p.context === 'ordinary' ? 'ordinary' : 'master', difficulty: 'medium', cards: p.cards || [p.card], enemy: p.enemy, upgraded: p.upgraded});
const focus = s.focus.filter(p => p.targetFocusEligible && p.opportunityDelta).sort((a, b) => a.opportunityDelta.mean - b.opportunityDelta.mean);
const unique = [], seen = new Set();
for (const p of focus) if (!seen.has(p.card)) {seen.add(p.card);unique.push(p);if(unique.length === 3) break;}
const selection = {method: 'Pilot adaptive extremes; disjoint seed offsets1100/1200; selection bias and multiple comparisons remain',
  pilotContexts: {followup: [master, ordinary, misleading], focus_followup: unique},
  followup: [master, ordinary, misleading].map(adapt), focus_followup: unique.map(adapt)};
fs.writeFileSync(path.join(dir, 'adaptive-selection.json'), JSON.stringify(selection, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({followup: selection.followup, focus: selection.focus_followup}));
