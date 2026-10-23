(function (root, factory) {
  const data = typeof module !== 'undefined' && module.exports
    ? require('./card-data.js') : root.STMCardData;
  const api = factory(data);
  root.STMCardKit = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (data) {
  'use strict';
  const byId = new Map(data.cards.map(c => [c.id, c]));
  const num = (v, fallback = 0) => Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : fallback;
  const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalizeLanguage = value => /^(bm|ms)(-|$)/i.test(String(value)) ? 'bm' : 'en';
  const cardName = (card, lang='en') => card.display_name?.[normalizeLanguage(lang)] || card.name;
  const cardNotes = (card, lang='en') => card.mechanic_notes?.[normalizeLanguage(lang)] || '';
  const assetPath = path => globalThis.STM_CARD_ASSETS?.[path] || path;
  function context(raw = {}) {
    return {
      ...raw, energy: Math.max(0, num(raw.energy, 3)), strength: num(raw.strength), agility: num(raw.agility),
      focusStock: Math.max(0, Math.min(3, num(raw.focusStock, 3))), focusUsed: !!raw.focusUsed,
      handAfterPlay: Math.max(0, Math.min(10, num(raw.handAfterPlay, 4))),
      availableDrawCards: Math.max(0, num(raw.availableDrawCards, 30)),
      discardCount: Math.max(0, num(raw.discardCount, 5)), hasTarget: raw.hasTarget !== false,
      lostHpLastEnemyTurn: !!raw.lostHpLastEnemyTurn, hasBlock: !!raw.hasBlock,
      enemyAttacks: !!raw.enemyAttacks, activePassives: raw.activePassives || []
    };
  }
  function condition(key, ctx) {
    return ({ lost_hp_last_enemy_turn:ctx.lostHpLastEnemyTurn, has_block:ctx.hasBlock,
      enemy_attacks:ctx.enemyAttacks, empty_hand_after_play_snapshot:ctx.handAfterPlay === 0 })[key] || false;
  }
  function compute(card, ctx, focused) {
    const values = {}, calculations = {};
    for (const [key, spec] of Object.entries(card.values)) {
      let value = spec.base;
      const terms = [{name:'base', amount:spec.base}];
      if (spec.energy_multiplier) {
        value += spec.energy_multiplier * ctx.energy;
        terms.push({name:`${spec.energy_multiplier} × X(${ctx.energy})`, amount:spec.energy_multiplier * ctx.energy});
      }
      if (spec.stat) { value += ctx[spec.stat]; terms.push({name:spec.stat, amount:ctx[spec.stat]}); }
      if (spec.condition) {
        const amount = condition(spec.condition.key, ctx) ? spec.condition.bonus : 0;
        value += amount; terms.push({name:spec.condition.key, amount});
      }
      const extra = focused ? spec.focus_bonus : 0;
      if (spec.focus_bonus) { value += extra; terms.push({name:'Focus', amount:extra}); }
      values[key] = Math.max(0, value);
      calculations[key] = {terms, result:values[key], minimum:0};
    }
    return {values, calculations};
  }
  function benefit(card, ctx) {
    const free = 10 - ctx.handAfterPlay;
    if (card.category === 'attack' || card.category === 'defend') {
      const n=compute(card,ctx,false).values, f=compute(card,ctx,true).values;
      return Object.keys(card.values).some(k=>card.values[k].focus_bonus>0 && f[k]>n[k]);
    }
    const normal = compute(card, ctx, false).values;
    if (card.name === 'Next Chapter') return true; // Future capacity is unknown at commit.
    if (card.name === 'Recall') return free > normal.return && ctx.availableDrawCards > 0;
    if (card.name === 'Last Page') {
      const count = normal.draw + (ctx.handAfterPlay === 0 ? normal.emptyBonus : 0);
      return free > count && ctx.availableDrawCards > count;
    }
    if (['Quick Study','Deep Study','Mana Reading'].includes(card.name)) {
      return free > normal.draw && ctx.availableDrawCards > normal.draw;
    }
    if (['Read Ahead','Clear Choice'].includes(card.name)) return free > 0 && ctx.availableDrawCards > normal.look;
    if (card.name === 'Card Search') return free > 0 && ctx.availableDrawCards > normal.search;
    if (card.name === 'Burning Page') return free > 0 && ctx.availableDrawCards > normal.replace + 1;
    return false;
  }
  function materializeAction(action, values) {
    const result = {...action};
    for (const field of ['value','look','take','limit','replacement_limit']) {
      if (typeof result[field] === 'string' && Object.prototype.hasOwnProperty.call(values,result[field])) {
        result[field + '_ref'] = result[field]; result[field] = values[result[field]];
      }
    }
    return result;
  }
  function preparePlay(id, raw = {}, requestedFocus = false) {
    const card = byId.get(id); if (!card) throw new Error('Unknown card ID: '+id);
    const ctx = context(raw), errors = [];
    const cost = card.energy.kind === 'fixed' ? card.energy.amount : ctx.energy;
    if (ctx.energy < cost || (card.energy.kind === 'all_remaining' && ctx.energy < card.energy.minimum)) errors.push('insufficient_energy');
    const needsTarget = card.category === 'attack' || card.actions.some(a => a.target === 'selected_enemy');
    if (needsTarget && !ctx.hasTarget) errors.push('no_living_target');
    if (card.name === 'Recall' && (!ctx.discardCount || ctx.handAfterPlay >= 10)) errors.push('no_legal_recall');
    if (card.category === 'passive' && ctx.activePassives.includes(card.id)) errors.push('passive_already_active');
    let reason = 'not_requested';
    if (requestedFocus) {
      reason = !card.focus_eligible ? 'passive_has_no_focus' : errors.length ? 'invalid_play'
        : ctx.focusUsed ? 'already_used_this_turn' : !ctx.focusStock ? 'no_focus_stock'
        : !benefit(card,ctx) ? 'no_additional_benefit' : 'focused';
    }
    const focused = reason === 'focused';
    const {values,calculations} = compute(card,ctx,focused);
    const actions = card.actions.filter(a => !a.condition || condition(a.condition,ctx)).map(a => materializeAction(a,values));
    return {card,context:ctx,legal:!errors.length,errors,requestedFocus,focused,focusReason:reason,values,calculations,actions,
      payEnergy:errors.length ? 0 : cost,payFocus:focused ? 1 : 0,
      focusArmedAfter:requestedFocus && !focused, focusUsedAfter:ctx.focusUsed || focused,
      passive:card.passive ? {...card.passive,effects:card.passive.effects.map(a=>materializeAction(a,values))} : null};
  }
  function calculationTip(plan, ref, lang) {
    const calc = plan.calculations[ref]; if (!calc) throw new Error('Missing calculation: '+ref);
    const words = lang === 'bm' ? {base:'Asas',strength:'Kekuatan',agility:'Ketangkasan',Focus:'Fokus',
      lost_hp_last_enemy_turn:'Bonus kerana HP berkurang',has_block:'Bonus kerana ada Blok',enemy_attacks:'Bonus kerana musuh akan menyerang',empty_hand_after_play_snapshot:'Bonus tangan kosong'}
      : {base:'Base',strength:'Strength',agility:'Agility',Focus:'Focus',lost_hp_last_enemy_turn:'Bonus for losing HP',has_block:'Bonus for having Block',enemy_attacks:'Bonus for an enemy Attack',empty_hand_after_play_snapshot:'Empty hand bonus'};
    const suffix=plan.card.category==='attack' && !ref.startsWith('constant_')
      ? (lang==='bm'?'. Sebelum Pertahanan dan Blok musuh.':'. Before enemy Defense and Block.')
      : (lang==='bm'?'. Dikira sekali menggunakan nilai pratonton ini.':'. Calculated once using these preview values.');
    return calc.terms.map(t => (words[t.name] || t.name)+': '+t.amount).join(' + ')+' = '+calc.result+suffix;
  }
  function getTokens(plan, lang) {
    // Keep the Normal Recall description concise instead of displaying “Draw 0”.
    lang = normalizeLanguage(lang);
    if (plan.card.name === 'Recall' && !plan.focused && !(plan.values.extra > 0)) {
      const tokens = plan.card.text[lang];
      const end = tokens.findIndex((t,i) => i>0 && t.type==='game' && t.ref==='draw');
      return [...tokens.slice(0,end), {type:'game',ref:'exhaust'}, {type:'text',text:'.'}];
    }
    const tokens=plan.card.text[lang] || plan.card.text.en,gift=plan.upgraded&&plan.card.upgrade?.activation;
    if(!gift)return tokens;
    const effects=[gift.block?(lang==='bm'?'dapat '+gift.block+' Blok':'gain '+gift.block+' Block'):'',gift.draw?(lang==='bm'?'ambil '+gift.draw+' kad':'draw '+gift.draw+' card'):''].filter(Boolean).join(lang==='bm'?' dan ':' and ');
    return [...tokens,{type:'text',text:(lang==='bm'?' Pada pengaktifan pertama combat ini, ':' On first activation this combat, ')+effects+'.'}];
  }
  function renderHTML(plan, lang = 'en') {
    lang = normalizeLanguage(lang);
    return getTokens(plan,lang).map(t => {
      if(t.type==='text') return esc(t.text);
      let label, tooltip;
      if(t.type==='calculation') { label=plan.values[t.ref]; tooltip=calculationTip(plan,t.ref,lang); }
      else {
        const term=data.glossary[t.ref]; if(!term)throw new Error('Missing glossary '+t.ref);
        label=term.label[lang] || term.label.en; tooltip=term.tooltip[lang] || term.tooltip.en;
      }
      return '<span class="stm-rt stm-rt-'+esc(t.type)+'" tabindex="0" data-kind="'+esc(t.type)+'" data-tooltip="'+esc(tooltip)+'" aria-label="'+esc(label+': '+tooltip)+'">'+esc(label)+'</span>';
    }).join('');
  }
  function renderPlain(plan,lang='en') {
    lang = normalizeLanguage(lang);
    return getTokens(plan,lang).map(t => t.type==='text'?t.text:t.type==='calculation'?plan.values[t.ref]:data.glossary[t.ref].label[lang]).join('');
  }
  function framePath(card, focused, fourK=false) {
    const paths = data.frames.categories[card.category];
    return paths[focused && card.focus_eligible ? (fourK?'focus_4K':'focus') : (fourK?'normal_4K':'normal')];
  }
  return Object.freeze({data,context,preparePlay,renderHTML,renderPlain,framePath,normalizeLanguage,cardName,cardNotes,assetPath,escapeHTML:esc});
});
