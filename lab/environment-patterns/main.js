import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/fraunces/latin-400.css';
// Product identities bring their own profile typography (Paper: Newsreader/JetBrains Mono; Parallel: Geist).
import '@fontsource/newsreader/latin-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/geist/latin-400.css';
import '@fontsource/geist/latin-500.css';
import '@fontsource/geist/latin-600.css';
import '@fontsource/geist/latin-700.css';
import '../../styles/tokens.css';
import '../../styles/components.css';
import '../../styles/living-environments.css';
import './material.css';
import './patterns.css';
import manifest from '../../design/meridian/living-environments.json' with {type:'json'};
import {ENVIRONMENTS,resolveContext} from './resolve.mjs';
import {identities} from './identities.mjs';
import {icon} from '../../src/icons.js';

const $=selector=>document.querySelector(selector);
const media={
 dark:matchMedia('(prefers-color-scheme: dark)'),
 reducedMotion:matchMedia('(prefers-reduced-motion: reduce)'),
 reducedTransparency:matchMedia('(prefers-reduced-transparency: reduce)'),
 increasedContrast:matchMedia('(prefers-contrast: more)'),
 forcedColors:matchMedia('(forced-colors: active)')
};
const systemState=()=>({reducedMotion:media.reducedMotion.matches,reducedTransparency:media.reducedTransparency.matches,
 increasedContrast:media.increasedContrast.matches,forcedColors:media.forcedColors.matches});
const nameOf=id=>manifest.environments.find(x=>x.id===id).name;

/** The single shared fixture. Every specimen is built from this function. */
function fixture(id){
 return `<div class="ep-fixture">
  <div class="ep-chrome ep-liquid ep-bar">
   <fieldset class="ep-segmented" style="--count:3"><legend>Lesson view</legend><span class="ep-lens" aria-hidden="true"></span>
    <label><input type="radio" name="view-${id}" checked>Draft</label><label><input type="radio" name="view-${id}">Review</label><label><input type="radio" name="view-${id}">Publish</label>
   </fieldset>
  </div>
  <article class="md-card ep-card" aria-labelledby="title-${id}">
   <h3 id="title-${id}">Lesson draft</h3>
   <label class="md-field"><span>Lesson title</span><input class="md-input" value="Present perfect" aria-describedby="help-${id}"><span class="helper" id="help-${id}">Shown to students.</span></label>
   <label class="md-field"><span>Unit code</span><input class="md-input" aria-invalid="true" aria-describedby="error-${id}"><span class="error" id="error-${id}">Enter a unit code to continue.</span></label>
   <div class="button-row"><button class="md-button" type="button">Publish lesson</button><button class="md-button secondary" type="button">Save draft</button></div>
   <div class="md-alert">${icon('info',20)}<span>Changes are kept on this device.</span></div>
   <span class="md-badge success">${icon('check',14)}Saved</span>
  </article>
 </div>`;
}

function boundary(context,id,label){
 const resolved=resolveContext(context,{manifest,identities,systemDark:media.dark.matches,system:context.ignoreSystem?{}:systemState()});
 const section=document.createElement('section');
 section.className='ep-boundary ep-atmosphere';
 for(const [name,value] of Object.entries(resolved.attributes))section.setAttribute(name,value);
 for(const [name,value] of Object.entries(resolved.style))section.style.setProperty(name,value);
 section.setAttribute('aria-label',label??`${nameOf(resolved.environment)} ${resolved.appearance}`);
 const identity=context.identity?identities[context.identity]:null;
 section.innerHTML=`<p class="ep-mode">${nameOf(resolved.environment)} <span>${resolved.appearance}</span>${identity?` <span class="ep-brand">${icon(identity.mark==='segments'?'layers':'book',16)}${identity.name}</span>`:''}</p>${fixture(id)}`;
 return {section,resolved};
}

function render(){
 // Forest first
 const pair=$('#forest-pair');pair.replaceChildren();
 for(const appearance of ['dawn','dusk'])pair.append(boundary({environment:'forest',appearance},`forest-${appearance}`).section);
 // Matrix
 const matrix=$('#matrix');matrix.replaceChildren();
 for(const environment of ENVIRONMENTS)for(const appearance of ['dawn','dusk'])
  matrix.append(boundary({environment,appearance},`${environment}-${appearance}`).section);
 // Accessibility override demonstration
 const override=$('#override-pair');override.replaceChildren();
 const request={environment:'aurora',appearance:'dusk',material:'glass',motion:'expressive',ambientIntensity:1};
 override.append(boundary({...request,ignoreSystem:true},'aurora-requested','Aurora Dusk as requested: glass, expressive motion').section);
 const constrained=resolveContext(request,{manifest,identities,system:{reducedTransparency:true,reducedMotion:true}});
 override.append(boundary({...request,material:constrained.attributes['data-material'],motion:constrained.attributes['data-motion']},'aurora-constrained','Aurora Dusk under reduced transparency and reduced motion').section);
 renderSpecimen();
}

function currentContext(){
 return {environment:$('#environment').value,appearance:$('#appearance').value,identity:$('#identity').value||null,
  material:$('#material').value,motion:$('#motion').value,ambientIntensity:Number($('#ambient').value)/100};
}

function renderSpecimen(){
 const host=$('#specimen-boundary');
 const {section,resolved}=boundary(currentContext(),'specimen');
 host.replaceChildren(section);
 $('#ambient-value').textContent=$('#ambient').value+'%';
 const attrs=Object.entries(resolved.attributes).map(([k,v])=>`${k}="${v}"`).join('\n        ');
 const styles=Object.entries(resolved.style).map(([k,v])=>`${k}:${v}`).join(';');
 $('#resolved').textContent=`<section ${attrs}\n        style="${styles}">`;
 $('#warnings').textContent=resolved.warnings.join(' ');
 bindLiquid(section);
}

function bindLiquid(scope){
 for(const el of scope.querySelectorAll('.ep-liquid')){
  el.addEventListener('pointermove',event=>{const r=el.getBoundingClientRect();
   el.style.setProperty('--mx',((event.clientX-r.left)/r.width*100).toFixed(1)+'%');
   el.style.setProperty('--my',((event.clientY-r.top)/r.height*100).toFixed(1)+'%');});
  el.addEventListener('pointerleave',()=>{el.style.removeProperty('--mx');el.style.removeProperty('--my');});
 }
}

$('#controls').addEventListener('input',renderSpecimen);
$('#controls').addEventListener('submit',event=>event.preventDefault());
for(const query of Object.values(media))query.addEventListener('change',render);
render();
