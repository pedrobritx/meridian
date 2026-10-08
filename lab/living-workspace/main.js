import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-400-italic.css';
import '../../styles/tokens.css';
import './workspace.css';

const $ = selector => document.querySelector(selector);
const expressive=$('#expressive'), opaque=$('#opaque'),panel=$('#workspace-panel'),opener=$('#open-panel'),closer=$('#close-panel'),range=$('#surface-width'),surface=$('#surface'),result=$('#result');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const transparency=matchMedia('(prefers-reduced-transparency: reduce)');
const contrast=matchMedia('(prefers-contrast: more)');
const forced=matchMedia('(forced-colors: active)');
function sync(){
 const quiet=!expressive.checked||motion.matches||forced.matches;
 const solid=opaque.checked||transparency.matches||contrast.matches||forced.matches;
 document.documentElement.dataset.labMotion=quiet?'quiet':'expressive';
 document.documentElement.dataset.labOpaque=String(solid);
 $('#settings-status').textContent=quiet?'Decorative motion is off; all actions remain available.':solid?'Motion enabled; glass replaced with an opaque surface.':'Experimental effects active; system preferences take precedence.';
}
for(const input of [expressive,opaque])input.addEventListener('change',sync);
for(const media of [motion,transparency,contrast,forced])media.addEventListener('change',sync);
sync();
function open(){
 panel.hidden=false;opener.setAttribute('aria-expanded','true');
 closer.focus();
 result.textContent='LM-04: Inspector opened. Focus moved into the panel.';
}
function close(){
 panel.hidden=true;opener.setAttribute('aria-expanded','false');
 opener.focus();
 result.textContent='LM-04: Panel closed. Focus returned to Open panel.';
}
opener.addEventListener('click',()=>panel.hidden?open():close());
closer.addEventListener('click',close);
panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
const tabs=[...document.querySelectorAll('[role=tab]')];
function selectTab(tab,focus=false){
 for(const t of tabs){
  const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;
  document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;
 }
 if(focus)tab.focus();
 result.textContent='LM-04: '+tab.textContent+' view selected.';
}
tabs.forEach(t=>{
 t.addEventListener('click',()=>selectTab(t));
 t.addEventListener('keydown',event=>{
  let i=tabs.indexOf(t);if(event.key==='ArrowRight')i=(i+1)%tabs.length;else if(event.key==='ArrowLeft')i=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')i=0;else if(event.key==='End')i=tabs.length-1;else return;
  event.preventDefault();selectTab(tabs[i],true);
 });
});
function resizeSurface(){
 const width=Number(range.value);
 surface.style.width=width+'%';
 surface.style.borderRadius=(45-width/2)+'px';
 $('#surface-value').value=width+'%';
 result.textContent='LM-05: Surface width '+width+'%. Native range control remains active.';
}
range.addEventListener('input',resizeSurface);
$('#reset').addEventListener('click',()=>{range.value=60;resizeSurface();result.textContent='Workspace surface reset to 60%.';});
