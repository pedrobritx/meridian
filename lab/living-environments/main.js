import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-400-italic.css';
import '../../styles/tokens.css';
import './living-environments.css';
import {environments,identities,contrastRatio} from './environments.js';

const $ = selector => document.querySelector(selector);
const environmentSelect=$('#environment'),appearanceSelect=$('#appearance'),identitySelect=$('#identity');
const glassInput=$('#glass');
const deviceDark=matchMedia('(prefers-color-scheme: dark)');
const reducedTransparency=matchMedia('(prefers-reduced-transparency: reduce)');
const increasedContrast=matchMedia('(prefers-contrast: more)');
const forcedColors=matchMedia('(forced-colors: active)');
const root=document.documentElement;

const semanticRoles=[
  ['--le-bg','page'],['--le-surface','surface'],['--le-text','text'],
  ['--le-muted','muted'],['--le-border','border'],['--le-on-action','onAction'],
  ['--le-sun','sun'],['--le-mid','mid'],['--le-deep','deep'],
  ['--le-atmosphere','atmosphere']
];

const appearance=()=>appearanceSelect.value==='system'
  ? (deviceDark.matches?'dark':'light'):appearanceSelect.value;

function environmentTheme(){
  const id=environmentSelect.value in environments?environmentSelect.value:'forest';
  return {id,profile:environments[id],mode:appearance()};
}
function getAccent(profile,mode){
  return identities[identitySelect.value]?.accent??profile[mode].action;
}
function isOpaque(){
  return !glassInput.checked||reducedTransparency.matches||increasedContrast.matches||forcedColors.matches;
}
function redrawSwatchButtons(active){
  for(const button of document.querySelectorAll('[data-environment-choice]'))
    button.setAttribute('aria-pressed',String(button.dataset.environmentChoice===active));
}
function applyEnvironment(){
  const {id,profile,mode}=environmentTheme(),palette=profile[mode];
  for(const [cssRole,key] of semanticRoles)root.style.setProperty(cssRole,palette[key]);
  const accent=getAccent(profile,mode);
  root.style.setProperty('--le-action',accent);
  // Focus must remain visible over both light and dark surfaces, regardless of product accent.
  root.style.setProperty('--le-focus',mode==='dark'?'#FFE2A8':accent);
  root.style.setProperty('--le-brand-ink',palette.onAction);
  root.dataset.theme=mode;
  root.dataset.environment=id;
  root.dataset.material=isOpaque()?'opaque':'glass';
  root.dataset.identity=identitySelect.value;
  $('#environment-label').textContent=profile.name+' / '+(mode==='dark'?'Dusk':'Dawn');
  $('#environment-description').textContent=profile.note;
  $('.le-brand-glyph').textContent=identities[identitySelect.value]?.mark??'M';
  redrawSwatchButtons(id);
  const fg=contrastRatio(palette.text,palette.surface);
  const button=contrastRatio(palette.onAction,accent);
  const ratios='Opaque surface text '+fg.toFixed(1)+':1 · action label '+button.toFixed(1)+':1';
  $('#contrast-metrics').textContent=ratios;
  const notes=[];
  if(forcedColors.matches)notes.push('Forced colours active');
  if(increasedContrast.matches)notes.push('Increased contrast requested');
  if(reducedTransparency.matches)notes.push('Reduced transparency requested');
  if(glassInput.checked&&isOpaque())notes.push('Glass replaced with an opaque surface');
  notes.push('Product identity is independent of environment');
  $('#preference-status').textContent=notes.join(' · ')+'.';
}
function createCatalogue(){
  const container=$('#palette-grid');
  for(const [id,environment] of Object.entries(environments)){
    const button=document.createElement('button');
    button.type='button';
    button.className='le-palette-card';
    button.dataset.environmentChoice=id;
    button.setAttribute('aria-label','Choose '+environment.name+' environment');
    const swatch=document.createElement('span');swatch.className='le-swatch';swatch.setAttribute('aria-hidden','true');
    swatch.style.setProperty('--swatch-a',environment.light.sun);
    swatch.style.setProperty('--swatch-b',environment.light.mid);
    swatch.style.setProperty('--swatch-c',environment.light.deep);
    const name=document.createElement('span');name.className='le-palette-label';name.textContent=environment.name;
    const marker=document.createElement('span');marker.className='le-selected-marker';marker.setAttribute('aria-hidden','true');marker.textContent='↗';
    const caption=document.createElement('span');caption.className='le-palette-caption';caption.textContent=environment.note;
    button.append(swatch,name,marker,caption);
    button.addEventListener('click',()=>{environmentSelect.value=id;applyEnvironment();});
    container.append(button);
  }
}
createCatalogue();
for(const control of [environmentSelect,appearanceSelect,identitySelect,glassInput])
  control.addEventListener('change',applyEnvironment);
for(const preference of [deviceDark,reducedTransparency,increasedContrast,forcedColors])
  preference.addEventListener('change',applyEnvironment);
applyEnvironment();

function selectedDestination(){
  return document.querySelector('input[name="destination"]:checked')?.value??'Discover';
}
$('#confirm-action').addEventListener('click',()=>{
  $('#task-status').textContent='Selection confirmed: '+selectedDestination()+'. No data was stored.';
});
$('#reset-action').addEventListener('click',()=>{
  document.querySelector('input[name="destination"][value="Discover"]').checked=true;
  $('#task-status').textContent='Choice reset to Discover. No information was stored.';
});
document.querySelector('.le-choice-group').addEventListener('change',event=>{
  if(event.target.matches('input[name="destination"]'))
    $('#task-status').textContent=selectedDestination()+' selected. Confirm when ready.';
});
