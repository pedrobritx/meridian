import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-400-italic.css';
import '@fontsource/newsreader/latin-400.css';
import '@fontsource/newsreader/latin-400-italic.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '../styles/tokens.css';
import '../styles/components.css';
import '../styles/reference.css';
import {pages} from './pages.js';
import {icon} from './icons.js';
const content=document.querySelector('#content');
const announcement=document.querySelector('#announcement');
const media=matchMedia('(prefers-color-scheme: dark)');
const picker=document.querySelector('#theme');
let preference='system';
try{const saved=localStorage.getItem('meridian-environment');if(['system','dawn','dusk'].includes(saved))preference=saved;}catch{/* Theme remains usable when storage is blocked. */}
function applyTheme(){document.documentElement.dataset.theme=(preference==='system'?media.matches:preference==='dusk')?'dark':'light';picker.value=preference;}
picker.addEventListener('change',()=>{preference=picker.value;applyTheme();try{localStorage.setItem('meridian-environment',preference);}catch{/* Persisting preference is optional. */}});
media.addEventListener('change',()=>{if(preference==='system')applyTheme();});
applyTheme();
const profilePicker=document.querySelector('#profile');
let profile='grass';
try{const saved=localStorage.getItem('meridian-profile');if(['grass','paper'].includes(saved))profile=saved;}catch{}
function applyProfile(){document.documentElement.dataset.meridian=profile;profilePicker.value=profile;}
profilePicker.addEventListener('change',()=>{profile=profilePicker.value;applyProfile();try{localStorage.setItem('meridian-profile',profile);}catch{}});
applyProfile();
document.querySelector('#brand-mark').innerHTML=icon('meridian',38);
function announce(message){announcement.textContent='';requestAnimationFrame(()=>{announcement.textContent=message;});}
function activateTab(tab){const group=tab.closest('[role="tablist"]');for(const item of group.querySelectorAll('[role="tab"]')){const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!selected;}}
function render(focus=false){const key=location.hash.slice(1);const page=Object.hasOwn(pages,key)?key:'overview';content.innerHTML=pages[page]();document.title=`${page==='overview'?'A human rhythm for software':page[0].toUpperCase()+page.slice(1)} — Meridian`;document.querySelector('#page-label').textContent=page.replace('adoption','Product adaptations').toUpperCase();for(const link of document.querySelectorAll('[data-page]')){if(link.dataset.page===page)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}if(focus){content.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}}
window.addEventListener('hashchange',()=>{if(location.hash==='#content'){content.focus();return;}render(true);});
render();
content.addEventListener('click',async event=>{const target=event.target.closest('button');if(!target)return;
 if(target.hasAttribute('data-list-item'))announce(target.dataset.listItem+' selected. This example does not store information.');
 if(target.hasAttribute('data-demo'))announce(target.dataset.demo);
 if(target.hasAttribute('data-open-dialog'))document.querySelector('#example-dialog').showModal();
 if(target.matches('[role="tab"]'))activateTab(target);
 if(target.id==='create-item'){const status=document.querySelector('#item-status');status.hidden=false;status.textContent='Example item added. This demonstration is kept only on this page.';target.disabled=true;target.textContent='Example added';}
 if(target.hasAttribute('data-copy')){try{await navigator.clipboard.writeText(target.dataset.copy);const small=target.querySelector('small');small.textContent='Copied';announce(`${target.dataset.copy} copied.`);setTimeout(()=>{if(small.isConnected)small.textContent=target.dataset.copy;},1800);}catch{announce(`Copy unavailable. Colour value: ${target.dataset.copy}`);target.querySelector('small').textContent=`Copy manually: ${target.dataset.copy}`;}}
});
content.addEventListener('keydown',event=>{if(!event.target.matches('[role="tab"]'))return;const tabs=[...event.target.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];let i=tabs.indexOf(event.target);if(event.key==='ArrowRight')i=(i+1)%tabs.length;else if(event.key==='ArrowLeft')i=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')i=0;else if(event.key==='End')i=tabs.length-1;else return;event.preventDefault();activateTab(tabs[i]);tabs[i].focus();});
content.addEventListener('submit',event=>{if(event.target.id!=='preferences-form')return;event.preventDefault();const input=event.target.elements.displayName;const error=document.querySelector('#display-error');const status=document.querySelector('#form-status');if(!input.value.trim()){input.setAttribute('aria-invalid','true');error.hidden=false;status.hidden=true;input.focus();return;}input.removeAttribute('aria-invalid');error.hidden=true;status.hidden=false;status.textContent='Preferences validated. In a product, this is where confirmed saving feedback belongs. No data was stored.';});
