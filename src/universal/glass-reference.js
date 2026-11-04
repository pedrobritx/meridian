import {iconMarkup} from './symbols.js';

/** Mark functional chrome only; documents, forms and data surfaces stay opaque. */
export function markGlassSurfaces(root=document) {
  const roles=[
    ['.sidebar,.topbar,.u-top nav,.le-nav,.fr-header nav,.panel-tabs,.md-tabs,.lm-choice-group,[role="tablist"]','navigation'],
    ['.md-glass,.panel,dialog','sheet'],
    ['.md-button:not(.danger):not(.opaque),.icon-button,.u-specimen button:not([role="menuitem"]),.u-clear,.u-demobutton,.lm-button-face,.lm-choice-indicator,.toolbar button,.panel-head button,#reset,.le-primary,.le-secondary,.fr-primary,.fr-secondary,.fr-reset','control'],
    ['.sidebar nav a,.md-tabs button,.panel-tabs button','control'],
    ['input[type="range"]','range']
  ];
  for(const [selector,role] of roles) for(const el of root.querySelectorAll(selector)) {
    if(!el.hasAttribute('data-liquid-glass')) el.dataset.liquidGlass=role;
  }
  for(const el of root.querySelectorAll('.sidebar,.topbar,.u-top nav,.panel')) el.setAttribute('data-glass-floating','');
  for(const el of root.querySelectorAll('.topbar,.u-top nav')) el.setAttribute('data-glass-scroll-edge','');
}

/** A real toolbar/menu/knob reference using the existing Living Matter symbols. */
export function mountGlassReference(host) {
  if(!host) return;
  const glyph=(name)=>iconMarkup(name,{size:18});
  const section=document.createElement('section');
  section.className='u-liquid-section';
  section.setAttribute('aria-labelledby','glass-reference-title');
  section.innerHTML=`
    <div class="u-section-heading"><h2 id="glass-reference-title">Light above the work.</h2><span>Liquid Glass · Living Matter</span></div>
    <p class="u-lede">A floating layer for navigation and controls. The Environment passes through; the work stays clear.</p>
    <div class="md-glass-stage">
      <div class="md-glass-toolbar" role="toolbar" aria-label="Workspace actions">
        <div class="md-glass-group" data-liquid-glass="toolbar" role="group" aria-label="Navigation">
          <button type="button" aria-pressed="true" data-liquid-glass="control" data-glass-view="Workspace">${glyph('layers')}Workspace</button>
          <button type="button" aria-pressed="false" data-liquid-glass="control" data-glass-view="Explore">${glyph('compass')}Explore</button>
        </div>
        <div class="md-glass-group" data-liquid-glass="toolbar" role="group" aria-label="Document actions">
          <button type="button" data-glass-action="Save selected.">${glyph('bookmark')}Save</button>
          <div class="md-glass-menu-origin">
            <button type="button" data-liquid-glass="control" data-glass-menu-trigger="glass-actions-menu" aria-controls="glass-actions-menu" aria-haspopup="menu" aria-expanded="false">${glyph('ellipsis')}More</button>
            <div id="glass-actions-menu" data-glass-menu data-liquid-glass="menu" role="menu" aria-label="Document actions" hidden>
              <button type="button" role="menuitem" data-glass-menu-close data-glass-action="Save selected.">${glyph('bookmark')}Save</button>
              <button type="button" role="menuitem" data-glass-menu-close data-glass-action="Copy selected.">${glyph('clipboard')}Copy</button>
              <button type="button" role="menuitem" data-glass-menu-close data-glass-action="Share selected.">${glyph('share')}Share</button>
            </div>
          </div>
        </div>
      </div>
      <article class="md-glass-content"><h3>A little room for thought.</h3><p>Read, write, and learn on a stable surface. Navigation floats above it, gathering light and focus as you interact.</p></article>
      <div class="md-glass-interactions">
        <label>Soft light <input type="checkbox" role="switch" aria-label="Soft light" data-liquid-glass="switch" checked></label>
        <label>Focus <input type="range" aria-label="Focus" min="0" max="100" value="60" data-liquid-glass="range"><output id="glass-focus-value">60%</output></label>
        <button type="button" data-liquid-glass="control" data-glass-size="xl" data-glass-action="Create your space selected.">${glyph('plus')}Create your space</button>
      </div>
      <p class="md-glass-status" id="glass-reference-status" role="status" aria-live="polite">Workspace selected.</p>
    </div>`;
  host.append(section);
  section.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button) return;
    if(button.dataset.glassView) {
      for(const sibling of section.querySelectorAll('[data-glass-view]')) sibling.setAttribute('aria-pressed',String(sibling===button));
      section.querySelector('#glass-reference-status').textContent=button.dataset.glassView+' selected.';
    }
    if(button.dataset.glassAction) section.querySelector('#glass-reference-status').textContent=button.dataset.glassAction;
  });
  section.querySelector('input[type="range"]').addEventListener('input',event=>{
    section.querySelector('#glass-focus-value').textContent=event.target.value+'%';
  });
  section.querySelector('[role="switch"]').addEventListener('change',event=>{
    section.querySelector('.md-glass-stage').dataset.softLight=String(event.target.checked);
    section.querySelector('#glass-reference-status').textContent=event.target.checked?'Soft light enabled.':'Soft light dimmed.';
  });
}
