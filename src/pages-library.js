// Meridian 1.0 website pages built from committed data: the Figma component library
// (site/library.json), the six environments and the changelog.
import library from '../site/library.json';
import environments from '../design/meridian/living-environments.json';
import changelog from '../CHANGELOG.md?raw';
import {environmentContrastPairs} from './universal/environment-tokens.mjs';
import {markdown} from './markdown.js';
import recipes from '../design/meridian/components.json';
import {guidance as componentGuidance} from './component-guidance.js';
import philosophy from '../docs/philosophy.md?raw';

const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const intro=(label,title,description)=>`<p class="eyebrow">${label}</p><h1>${title}</h1><p class="lede">${description}</p>`;
const heading=(n,title,note)=>`<div class="section-heading"><h2>${n} &nbsp; ${title}</h2><p>${note}</p></div>`;
const shots=import.meta.glob('../design/figma-export/components/screenshots/*.png',{eager:true,query:'?url',import:'default'});
const shot=file=>shots['../design/figma-export/components/screenshots/'+file];
const badge=status=>`<span class="md-badge ${status==='Preview'?'warning':'success'}">${escape(status)}</span>`;

function componentCard(c){
  const variants=c.properties.filter(p=>p.kind==='variant').map(p=>`${escape(p.name)}: ${p.options.map(escape).join(', ')}`);
  const other=c.properties.filter(p=>p.kind!=='variant').map(p=>`${escape(p.name)} (${p.kind})`);
  return `<article class="library-card" aria-labelledby="c-${c.id.replace(':','-')}">
<div class="library-shot"><img src="${shot(c.screenshot)}" alt="${escape(c.name)}, as rendered in Figma" loading="lazy"></div>
<div class="library-body"><h3 id="c-${c.id.replace(':','-')}">${escape(c.name)}</h3><p class="library-meta">${badge(c.status)} <span>${escape(c.kind)} · ${c.variants} ${c.variants===1?'variant':'variants'}</span></p>
${variants.length?`<p class="library-props"><strong>Variants</strong> ${variants.join('; ')}</p>`:''}${other.length?`<p class="library-props"><strong>Properties</strong> ${other.join(', ')}</p>`:''}
<p class="library-links"><a class="md-link" href="#component/${c.id.replace(':','-')}">Details <span class="sr-only">for ${escape(c.name)}</span></a> <a class="md-link" href="${escape(c.figma)}">Open in Figma <span class="sr-only">(${escape(c.name)})</span>↗</a></p></div></article>`;
}

function contrastSummary(modes){
  return ['Dawn','Dusk'].map(mode=>{
    const pairs=environmentContrastPairs(modes[mode]);
    const text=Math.min(...pairs.filter(p=>p.minimum===4.5).map(p=>p.ratio));
    const ui=Math.min(...pairs.filter(p=>p.minimum===3).map(p=>p.ratio));
    return `<li>${mode}: ${pairs.filter(p=>p.pass).length} of ${pairs.length} pairs pass; lowest text ${text.toFixed(2)}:1, lowest control ${ui.toFixed(2)}:1</li>`;
  }).join('');
}
const swatchRoles=['color/bg/page','color/bg/surface','color/text/primary','color/action/primary','color/link/default','color/focus/ring'];
function environmentCard(e){
  const strip=mode=>`<div class="env-strip" aria-hidden="true">${swatchRoles.map(r=>`<span style="background:${e.modes[mode][r].slice(0,7)}"></span>`).join('')}</div>`;
  return `<article class="env-card" aria-labelledby="env-${e.id}"><h3 id="env-${e.id}">${escape(e.name)} ${badge(e.status==='preview'?'Preview':'Candidate')}</h3>
${e.mood?`<p class="note">${escape(e.mood)}</p>`:''}<p class="library-meta">${escape(e.heritage)}</p>
<p class="env-label">Dawn</p>${strip('Dawn')}<p class="env-label">Dusk</p>${strip('Dusk')}
<ul class="env-checks">${contrastSummary(e.modes)}</ul>
${e.knownContrastFailures.length?`<p class="library-props"><strong>Known failure</strong> ${e.knownContrastFailures.map(escape).join('; ')}</p>`:''}</article>`;
}

const allComponents=library.groups.flatMap(g=>g.components.map(c=>({...c,group:g.name})));
const tab=(id,label,selected)=>`<button role="tab" aria-selected="${selected}" id="tab-${id}" aria-controls="panel-${id}" tabindex="${selected?0:-1}">${label}</button>`;
const panel=(id,html,selected)=>`<div role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}" tabindex="0"${selected?'':' hidden'}>${html}</div>`;
function componentPage(arg=''){
  const c=allComponents.find(x=>x.id===arg.replace('-',':'));
  if(!c)return `${intro('FIGMA LIBRARY','Component not found.','This link does not match a component in the current library.')}<p><a class="md-link" href="#library">Back to the Figma library</a></p>`;
  const recipe=recipes.find(r=>r.name===c.name);
  const guide=componentGuidance[c.name];
  const overview=`<div class="library-shot component-shot"><img src="${shot(c.screenshot)}" alt="${escape(c.name)}, as rendered in Figma"></div><p class="library-meta">${badge(c.status)} <span>${escape(c.group)} · ${escape(c.kind)} · ${c.variants} ${c.variants===1?'variant':'variants'}</span></p><p><a class="md-link" href="${escape(c.figma)}">Open ${escape(c.name)} in Figma ↗</a></p>`;
  const specs=c.properties.length?`<div class="table-scroll"><table class="adoption-table"><caption class="sr-only">${escape(c.name)} properties</caption><thead><tr><th scope="col">Property</th><th scope="col">Kind</th><th scope="col">Options</th></tr></thead><tbody>${c.properties.map(p=>`<tr><th scope="row">${escape(p.name)}</th><td>${escape(p.kind)}</td><td>${p.options?p.options.map(escape).join(', '):'None'}</td></tr>`).join('')}</tbody></table></div>`:'<p>This component has no configurable properties.</p>';
  const guidance=`<p>${escape(guide.purpose)}</p>${recipe?`<p>${escape(recipe.use)}</p><p class="library-props"><strong>States</strong> ${recipe.states.map(escape).join(', ')}</p>`:''}`;
  const accessibility=`<p>${escape(guide.accessibility)}</p><p>Verify keyboard and touch operation, visible focus, text at 200% zoom, narrow layouts, screen-reader announcements, reduced motion and opaque/forced-color treatments in the adopting product. This guidance is a contract, not a certification.</p>`;
  const code=`<p>Semantic starting point for ${escape(c.name)}. Composite examples require the behavior described in Accessibility; they are not a shipped component package.</p><pre class="code-block" tabindex="0" aria-label="${escape(c.name)} semantic example"><code>${escape(guide.code)}</code></pre><p>Load <code>styles/tokens.css</code> and <code>styles/components.css</code> for the established CSS recipes. Use native semantics when wrapping them in a framework. Do not infer a runtime API from a Figma variant.</p>`;
  return `${intro('FIGMA LIBRARY / '+escape(c.group.toUpperCase()),escape(c.name),c.status==='Preview'?'Preview: this component may still change.':'Candidate for stable, pending its Definition of ready review.')}
<div class="md-tabs" role="tablist" aria-label="${escape(c.name)} documentation">${tab('overview','Overview',true)}${tab('specs','Specs',false)}${tab('guidelines','Guidelines',false)}${tab('accessibility','Accessibility',false)}${tab('code','Code',false)}</div>
${panel('overview',overview,true)}${panel('specs',specs,false)}${panel('guidelines',guidance,false)}${panel('accessibility',accessibility,false)}${panel('code',code,false)}
<p class="note"><a class="md-link" href="#library">Back to the Figma library</a></p>`;
}

export const pages={
 philosophy:()=>`${intro('PRINCIPLES / PRACTICE','A human rhythm for software.','Natural cues, clear behavior and room for the content.')}<div class="reading">${markdown(philosophy.replace(/^# .*\n/,''))}</div>`,
 component:componentPage,
 library:()=>`${intro('FIGMA LIBRARY / 62 COMPONENTS','Everything in the library, <em>in one place.</em>','Every component and component set in the Meridian Figma file, grouped by purpose. Images are rendered by Figma; open any item to inspect its variants.')}
<div class="md-alert"><span>${escape(library.statusRule)}</span></div>
<p class="library-index">${library.groups.map(g=>`${escape(g.name)} · ${g.components.length}`).join(' &nbsp;/&nbsp; ')}</p>
${library.groups.map((g,i)=>`<section aria-label="${escape(g.name)}">${heading(String(i+1).padStart(2,'0'),escape(g.name),`${g.components.length} components`)}<div class="library-grid">${g.components.map(componentCard).join('')}</div></section>`).join('')}
<p class="note">Source: ${escape(library.source)}.</p>`,
 environments:()=>`${intro('STYLES / COLOUR','Six environments. <em>Two appearances.</em>','Environment and appearance are Meridian’s public colour API. Each environment fills the same 39 roles in Dawn and Dusk, and is checked against 72 contrast pairs per appearance.')}
<div class="md-alert"><span>A candidate passes all 72 contrast pairs in both appearances. A preview environment fails at least one, and the failure is listed. Every environment stays experimental until it is reviewed.</span></div>
<div class="env-grid">${environments.environments.map(environmentCard).join('')}</div>
<p class="note">Swatches, left to right: page, surface, primary text, primary action, link and focus ring. Contrast results are calculated in your browser from <code>design/meridian/living-environments.json</code>.</p>`,
 changelog:()=>`${intro('RELEASES / DECISIONS','What changed, <em>and why.</em>','Every change to Meridian is recorded here and in the repository, with links to the decision behind it.')}<div class="changelog reading">${markdown(changelog)}</div>`
};
