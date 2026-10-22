/** Exact diagrams, tables and token pools; never evaluates a player's answer. */
import {renderRichText} from '../rich_text/renderer.mjs';
const SVG_NS='http://www.w3.org/2000/svg';
const SVG_TAGS=new Set(['svg','title','desc','defs','clipPath','circle','mask','g','rect','text','tspan']);
const SVG_ATTRS=new Set(['viewBox','role','aria-labelledby','id','cx','cy','r','x','y','width','height','fill','fill-opacity','stroke','stroke-width','rx','maskUnits','mask','clip-path','text-anchor','data-role','font-size','font-weight','font-family','dy']);
let diagramSequence=0;

function safeVenn(xml,glossary,reference=false) {
  const parsed=new DOMParser().parseFromString(xml,'image/svg+xml');
  if(parsed.querySelector('parsererror')||parsed.documentElement.localName!=='svg')throw new Error('Invalid diagram SVG');
  function clone(source) {
    if(source.nodeType===3)return document.createTextNode(source.textContent);
    if(source.nodeType!==1||source.namespaceURI!==SVG_NS||!SVG_TAGS.has(source.localName))throw new Error('Unsafe diagram element');
    const node=document.createElementNS(SVG_NS,source.localName);
    for(const a of source.attributes) {
      if(a.name==='xmlns')continue;
      if(!SVG_ATTRS.has(a.name))throw new Error('Unsafe diagram attribute');
      if(['mask','clip-path'].includes(a.name)&&!/^url\(#[\w:-]+\)$/.test(a.value))throw new Error('Non-local SVG reference');
      node.setAttribute(a.name,a.value);
    }
    for(const child of source.childNodes)node.append(clone(child));
    return node;
  }
  const svg=clone(parsed.documentElement);svg.setAttribute('class','learning-venn');
  // Hint, More Hint and solution can display the same valued source diagram
  // together. Every rendered instance needs its own clip/mask/title IDs.
  const prefix='stm-venn-'+(++diagramSequence)+'-',ids=new Map();
  for(const node of svg.querySelectorAll('[id]')){ids.set(node.id,prefix+node.id);node.id=prefix+node.id;}
  for(const node of [svg,...svg.querySelectorAll('*')]){
    if(node.hasAttribute('aria-labelledby'))node.setAttribute('aria-labelledby',node.getAttribute('aria-labelledby').split(/\s+/).map(id=>ids.get(id)||id).join(' '));
    for(const attr of ['mask','clip-path'])if(node.hasAttribute(attr)){
      const old=node.getAttribute(attr).slice(5,-1);if(ids.has(old))node.setAttribute(attr,'url(#'+ids.get(old)+')');
    }
  }
  if(reference){
    for(const text of svg.querySelectorAll('tspan'))if(text.textContent==='?')text.textContent='Not given';
    for(const shade of svg.querySelectorAll('rect[mask]'))shade.remove();
    const description=svg.querySelector('desc');
    if(description)description.textContent='The diagram shows the region values. Not given means the question does not specify that value. Use the text table below for the same information.';
  }
  for(const label of svg.querySelectorAll('text[data-role="set-label"]')) {
    const text=label.textContent;
    const exact=Object.entries(glossary.entries).find(([,e])=>e.aliases.includes(text));
    const key=exact?.[0]||(/^[A-Z]$/.test(text)?'qb:variable':null);
    if(!key)continue;
    label.setAttribute('class','rt-term');label.setAttribute('data-category',glossary.entries[key].category);
    label.setAttribute('data-richtext-kind','term');label.setAttribute('data-glossary-id',key);
    label.setAttribute('role','button');label.setAttribute('tabindex','0');
  }
  return svg;
}

export function renderVisual(container,visual,options) {
  container.replaceChildren();if(!visual)return;
  const title=document.createElement('h3');title.textContent=visual.title;container.append(title);
  const rich=(parent,runs)=>renderRichText(parent,runs,options);
  if(visual.kind==='venn')container.append(safeVenn(visual.svg,options.glossary,visual.reference));
  if(['venn','table'].includes(visual.kind)) {
    const wrap=document.createElement('div');wrap.className='learning-table-scroll';
    wrap.setAttribute('tabindex','0');wrap.setAttribute('role','region');wrap.setAttribute('aria-label',visual.title+' table');
    const table=document.createElement('table');table.className='learning-table';
    const caption=document.createElement('caption');caption.className='sr-only';caption.textContent=visual.title;table.append(caption);
    const head=document.createElement('thead'),headrow=document.createElement('tr');
    for(let i=0;i<visual.headers.length;i++){
      const th=document.createElement('th');th.scope='col';rich(th,visual.headerRichText[i]);headrow.append(th);
    }
    head.append(headrow);table.append(head);const body=document.createElement('tbody');
    for(let r=0;r<visual.rows.length;r++){
      const row=document.createElement('tr');
      if(visual.kind==='venn'&&visual.regions[r]?.selected)row.className='learning-selected-region';
      for(let c=0;c<visual.headers.length;c++){
        const cell=document.createElement(c===0?'th':'td');if(c===0)cell.scope='row';
        const original=visual.rows[r][c];if(original?.selected)cell.className='learning-selected-cell';
        rich(cell,visual.rowRichText[r][c]);
        if(original?.selected){const mark=document.createElement('span');mark.textContent=' ✓';mark.setAttribute('aria-label','qualifies');cell.append(mark);}
        row.append(cell);
      }
      body.append(row);
    }
    table.append(body);wrap.append(table);container.append(wrap);
  } else if(visual.kind==='flow') {
    const list=document.createElement('ol');list.className='learning-flow';
    for(let i=0;i<visual.nodes.length;i++){
      const item=document.createElement('li');const number=document.createElement('span');number.className='learning-flow-number';number.textContent=i+1;
      const body=document.createElement('div');rich(body,visual.nodeRichText[i]);item.append(number,body);list.append(item);
    }
    container.append(list);
  } else if(visual.kind==='pool') {
    const list=document.createElement('div');list.className='learning-pool';
    for(const group of visual.groups){
      const row=document.createElement('div');row.className='learning-pool-group';
      const label=document.createElement('div');rich(label,group.labelRichText);
      const count=document.createElement('strong');count.textContent=' × '+group.count;label.append(count);
      const tokens=document.createElement('div');tokens.className='learning-pool-tokens';tokens.setAttribute('aria-hidden','true');
      for(let i=0;i<group.count;i++){
        const token=document.createElement('span');token.className='learning-pool-token';token.textContent=group.label[0];
        const color=group.label.startsWith('Red')?'red':group.label.startsWith('Blue')?'blue':group.label.startsWith('Gold')?'gold':group.label.startsWith('Silver')?'silver':'card';
        token.dataset.tokenColor=color;tokens.append(token);
      }
      row.append(label,tokens);list.append(row);
    }
    container.append(list);
  } else throw new Error('Unsupported learning visual');
  if(visual.caption){const caption=document.createElement('p');caption.className='learning-visual-caption';rich(caption,visual.captionRichText);container.append(caption);}
}
