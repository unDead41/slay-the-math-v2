import * as Rng from './map-rng.mjs';
import { SEEDS } from './seeds.mjs';
import { ICON_FILES } from './map-icons.mjs';

let instanceNumber = 0;
const SHELL = "<main data-stm-map>\n  <header class=\"masthead\">\n    <div class=\"brand\"><div class=\"sigil\" aria-hidden=\"true\"><span>◇</span></div><div><h1>MATHEMATICS SLAYER</h1><p class=\"eyebrow\">Seeded dungeon maps</p></div></div>\n    <div class=\"edition\"><strong>100 seeds · 2 stages</strong>Map rules v1.0</div>\n  </header>\n  <div class=\"toolbar\">\n    <div class=\"field stage-field\"><label for=\"stage\">Dungeon</label><select id=\"stage\"><option value=\"1\">Stage 1 · Sigil Keep</option><option value=\"2\">Stage 2 · Deck Tower</option></select></div>\n    <div class=\"field seed-field\"><label for=\"seed\">Map seed</label><select id=\"seed\"></select></div>\n    <div class=\"arrows\"><button class=\"quiet-btn\" id=\"previous\" type=\"button\" aria-label=\"Previous seed\">‹</button><button class=\"quiet-btn\" id=\"next\" type=\"button\" aria-label=\"Next seed\">›</button></div>\n  </div>\n  <div class=\"description\"><span id=\"path-summary\"></span><span class=\"verified\" id=\"valid-state\">All map rules passed</span></div>\n  <div class=\"layout\">\n    <section class=\"map-panel\" aria-label=\"Ten-level dungeon map\">\n      <div class=\"map-heading\"><h2>CHOOSE YOUR PATH</h2><span>10 LEVELS</span></div>\n      <div class=\"map-host\" id=\"map-host\"></div>\n      <div class=\"legend\" id=\"legend\"></div>\n    </section>\n    <aside class=\"inspector\" aria-label=\"Selected room details\">\n      <p class=\"eyebrow\">Selected room</p><p class=\"room-position\" id=\"room-position\"></p><h2 id=\"room-title\">Battle</h2>\n      <div class=\"room-mark\" id=\"room-mark\" aria-hidden=\"true\"></div>\n      <p class=\"room-copy\" id=\"room-copy\"></p>\n      <div class=\"links\"><span>Incoming paths</span><b id=\"incoming\"></b></div>\n      <div class=\"links\"><span>Next-room choices</span><b id=\"outgoing\"></b></div>\n      <div class=\"quota-block\"><p class=\"quota-heading\">WHOLE-MAP ROOM QUOTAS</p><div id=\"quotas\"></div></div>\n      <div class=\"rule-note\"><strong>Level 05</strong> · Every path is Mystery<br><strong>Level 09</strong> · Rest on every path<br><strong>Level 10</strong> · One stage boss</div>\n      <button class=\"export\" id=\"export\" type=\"button\">Download this map</button>\n      <p class=\"selection-help\">Select any room to inspect its connections. Rest rooms may be shared by several paths.</p>\n    </aside>\n  </div>\n  <footer class=\"footer\"><span>3–5 corridors · Sparse connections · Shared Rest before the boss</span><span>Map preview · Combat and events are not simulated</span></footer>\n  <p class=\"sr-only\" aria-live=\"polite\" id=\"announce\"></p>\n</main>";

/** Mount a map inspector inside an existing game's DOM container.
 * onRoomInspect is a viewing callback, not authorization to enter/complete a room.
 */
export function mountMapScreen(host, options = {}) {
  if (!host || typeof host.querySelector !== 'function' || !host.ownerDocument) {
    throw new TypeError('host must be a DOM element');
  }
  const initialSeed = options.seed ?? SEEDS[0];
  const initialStage = options.stage ?? 1;
  if (!SEEDS.includes(initialSeed)) throw new RangeError('seed must be STM-001 through STM-100');
  if (![1, 2].includes(initialStage)) throw new RangeError('stage must be 1 or 2');
  if (options.onRoomInspect !== undefined && typeof options.onRoomInspect !== 'function') {
    throw new TypeError('onRoomInspect must be a function');
  }
  const document = host.ownerDocument;
  const idPrefix = `stm-map-${++instanceNumber}-`;
  host.innerHTML = SHELL.replace(/\bid="([^"]+)"/g, (_, id) => `id="${idPrefix}${id}"`)
    .replace(/\bfor="([^"]+)"/g, (_, id) => `for="${idPrefix}${id}"`);
  const root = host.querySelector('[data-stm-map]');
  const $ = id => root.querySelector(`[id="${idPrefix}${id}"]`);
  $('stage').value = String(initialStage);
  let destroyed = false;

  'use strict';
  const api = Rng;

  const labels = { battle: 'Battle', elite: 'Elite', shop: 'Shop', rest: 'Rest', mystery: 'Mystery', boss: 'Boss' };
  const assetBase = options.assetBaseUrl === undefined
    ? new URL('../assets/map-icons/square/', import.meta.url).href
    : new URL(String(options.assetBaseUrl).replace(/\/?$/, '/'), document.baseURI).href;
  const ICON_IMAGES = Object.freeze(Object.fromEntries(Object.entries(ICON_FILES)
    .map(([type, file]) => [type, new URL(file, assetBase).href])));
  const icon = type => `<img src="${ICON_IMAGES[type]}" alt="" aria-hidden="true" draggable="false">`;
  const copy = {
    battle: 'A standard enemy encounter. Choose the route that suits your deck.',
    elite: 'A tougher encounter. Elite rooms are spread across the whole map; some routes can avoid them.',
    shop: 'Visit the stage merchant. A route may miss the shop even when the map contains one.',
    rest: 'A safe stop in the middle or later part of the stage. Several paths can share this room.',
    mystery: 'A random event. Every room on level 5 is a Mystery, so no route can skip it.',
    boss: 'The stage boss. Every approach passes through Rest on level 9.'
  };
  const cache = new Map();
  let current, selected, seedIndex = SEEDS.indexOf(initialSeed);
  function getMap(seed, stage) {
    const key = `${seed}|${stage}`;
    if (!cache.has(key)) cache.set(key, api.generateMap(seed, { stage }));
    return cache.get(key);
  }
  function refreshSeedOptions() {
    const stage = Number($('stage').value);
    $('seed').replaceChildren(...SEEDS.map(seed => {
      const m = getMap(seed, stage), option = document.createElement('option');
      option.value = seed; option.textContent = `${seed} · ${m.initialPaths} → ${m.preRestPaths} paths`;
      return option;
    }));
    $('seed').selectedIndex = seedIndex;
  }
  function renderMap() {
    const report = api.validateMap(current);
    if (!report.valid) throw new Error(report.errors.join('; '));
    $('path-summary').innerHTML = `<b>${current.initialPaths} starting paths → ${current.preRestPaths} before Rest</b> &nbsp; · &nbsp; ${report.restGateCount} Rest ${report.restGateCount === 1 ? 'gate' : 'gates'}`;
    $('quotas').innerHTML = ['shop', 'elite', 'rest'].map(type => `<div class="quota-row"><span>${icon(type)}${labels[type]}</span><b>${report.counts[type]} / ${current.quotas[type]} ✓</b></div>`).join('');
    $('previous').disabled = seedIndex === 0; $('next').disabled = seedIndex === SEEDS.length - 1;
    const host = $('map-host'), w = Math.max(300, host.clientWidth), h = 730;
    const r = w < 400 ? 18 : 22;
    const coords = node => ({ x: 42 + node.x * (w - 74), y: 49 + (10 - node.level) * 70 });
    const byId = new Map(current.nodes.map(n => [n.id, n]));
    let markup = `<svg xmlns="http://www.w3.org/2000/svg" role="group" aria-label="${current.stageName}, seed ${current.seed}, ten levels" viewBox="0 0 ${w} ${h}">`;
    markup += '<path d="M20 49V679" stroke="#a28e67" opacity=".3"/>';
    for (let level = 1; level <= 10; level++) markup += `<text x="20" y="${49 + (10 - level) * 70 + 4}" text-anchor="middle" class="level-number ${[5, 9, 10].includes(level) ? 'special' : ''}">${String(level).padStart(2, '0')}</text>`;
    for (const edge of current.edges) {
      const a = coords(byId.get(edge.from)), b = coords(byId.get(edge.to));
      const emphasis = selected && (edge.from === selected || edge.to === selected);
      const state = selected ? (emphasis ? 'emphasis' : 'dim') : '';
      // Shorten paths at circle edges so route lines do not run through icons.
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
      const x1 = a.x + dx / len * (r + 3), y1 = a.y + dy / len * (r + 3);
      const x2 = b.x - dx / len * (r + 3), y2 = b.y - dy / len * (r + 3);
      markup += `<path class="map-edge ${state}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
    }
    for (const node of current.nodes) {
      const p = coords(node), radius = node.type === 'boss' ? r + 3 : r, size = radius * 2.5;
      markup += `<g class="room ${node.type === 'boss' ? 'boss' : ''} ${node.id === selected ? 'selected' : ''}" data-node="${node.id}" data-type="${node.type}" transform="translate(${p.x},${p.y})" tabindex="0" role="button" aria-pressed="${node.id === selected}" aria-label="Level ${node.level}, ${labels[node.type]}, room ${node.column + 1}"><title>Level ${node.level} · ${labels[node.type]} · Room ${node.column + 1}</title><circle r="${Math.max(radius + 6, 22)}" fill="transparent"/><circle class="halo" r="${radius + 4}"/><image class="room-art" href="${ICON_IMAGES[node.type]}" x="${-size / 2}" y="${-size / 2}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/></g>`;
      if (node.type === 'boss') markup += `<text x="${p.x}" y="${p.y + radius + 19}" text-anchor="middle" class="boss-name">${current.bossName}</text>`;
    }
    host.innerHTML = markup + '</svg>';
    host.querySelectorAll('[data-node]').forEach(el => {
      const choose = () => {
        selected = el.dataset.node; renderMap(); renderInspector();
        if (options.onRoomInspect) {
          const room = current.nodes.find(node => node.id === selected);
          options.onRoomInspect({ ...room }, JSON.parse(JSON.stringify(current)));
        }
      };
      el.addEventListener('click', choose);
      el.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); const id = el.dataset.node; choose(); host.querySelector(`[data-node="${id}"]`).focus(); }
      });
    });
  }
  function renderInspector() {
    const node = current.nodes.find(n => n.id === selected);
    $('room-position').textContent = `LEVEL ${String(node.level).padStart(2, '0')} · ROOM ${node.column + 1}`;
    $('room-title').textContent = node.type === 'boss' ? current.bossName : labels[node.type];
    $('room-mark').innerHTML = icon(node.type);
    $('room-copy').textContent = copy[node.type];
    $('incoming').textContent = node.level === 1 ? 'Entry room' : String(current.edges.filter(e => e.to === node.id).length);
    $('outgoing').textContent = node.level === 10 ? 'Stage complete' : String(current.edges.filter(e => e.from === node.id).length);
    $('announce').textContent = `${current.seed}, ${current.stageName}. Level ${node.level}, ${labels[node.type]}. All rules passed.`;
  }
  function loadSelection() {
    current = getMap(SEEDS[seedIndex], Number($('stage').value));
    selected = current.nodes.find(n => n.level === 1 && n.type === 'battle').id;
    renderMap(); renderInspector();
  }
  $('legend').innerHTML = Object.keys(labels).map(type => `<span>${icon(type)}${labels[type]}</span>`).join('');
  $('seed').addEventListener('change', () => { seedIndex = $('seed').selectedIndex; loadSelection(); });
  $('stage').addEventListener('change', () => { refreshSeedOptions(); loadSelection(); });
  $('previous').addEventListener('click', () => { if (seedIndex > 0) { seedIndex--; $('seed').selectedIndex = seedIndex; loadSelection(); } });
  $('next').addEventListener('click', () => { if (seedIndex < SEEDS.length - 1) { seedIndex++; $('seed').selectedIndex = seedIndex; loadSelection(); } });
  $('export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = `${current.seed}-stage-${current.stage}.json`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  let lastWidth = 0;
  const resizeObserver = new ResizeObserver(entries => { const w = Math.round(entries[0].contentRect.width); if (Math.abs(w - lastWidth) > 1) { lastWidth = w; if (current) renderMap(); } });
  resizeObserver.observe($('map-host'));
  refreshSeedOptions(); loadSelection();

  return Object.freeze({
    getCurrentMap: () => JSON.parse(JSON.stringify(current)),
    setMap(seed, stage = current.stage) {
      if (destroyed) throw new Error('Map screen was destroyed');
      if (!SEEDS.includes(seed) || ![1, 2].includes(stage)) throw new RangeError('Invalid seed or stage');
      seedIndex = SEEDS.indexOf(seed);
      $('stage').value = String(stage);
      refreshSeedOptions(); loadSelection();
    },
    destroy() {
      if (destroyed) return;
      resizeObserver.disconnect();
      root.remove();
      destroyed = true;
    }
  });
}
