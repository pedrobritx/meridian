import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-400-italic.css';
import './forest.css';
import {
  forestPalettes,resolveForestMode,deriveNotificationStatus,
  acknowledgeHistory,canAcknowledgeHistory,EXPOSURE_MS,INTERRUPTION_MS
} from './forest-model.js';

const $=selector=>document.querySelector(selector);
const root=document.documentElement;
const appearance=$('#appearance'),illumination=$('#illumination');
const atmosphere=$('#atmosphere'),motion=$('#motion'),glass=$('#glass');
const systemDark=matchMedia('(prefers-color-scheme: dark)');
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
const reducedTransparency=matchMedia('(prefers-reduced-transparency: reduce)');
const increasedContrast=matchMedia('(prefers-contrast: more)');
const forcedColors=matchMedia('(forced-colors: active)');
const preferenceKey='meridian.lab.forest.preferences.v1';
const accessibleDefaults={appearance:'system',illumination:50,atmosphere:'layered',motion:'system',glass:false};

function restorePreferences() {
  try {
    const saved=JSON.parse(localStorage.getItem(preferenceKey)||'null');
    if(!saved || typeof saved!=='object')return;
    if(['system','dawn','dusk'].includes(saved.appearance))appearance.value=saved.appearance;
    if(Number.isInteger(saved.illumination) && saved.illumination>=0 && saved.illumination<=100)illumination.value=String(saved.illumination);
    if(['layered','quiet'].includes(saved.atmosphere))atmosphere.value=saved.atmosphere;
    if(['system','quiet','expressive'].includes(saved.motion))motion.value=saved.motion;
    if(typeof saved.glass==='boolean')glass.checked=saved.glass;
  } catch { /* Blocked storage, malformed data: use accessible defaults. */ }
}
function savePreferences() {
  try {
    localStorage.setItem(preferenceKey,JSON.stringify({
      appearance:appearance.value,illumination:Number(illumination.value),
      atmosphere:atmosphere.value,motion:motion.value,glass:glass.checked
    }));
  } catch { /* The Lab remains functional without persistence. */ }
}
function effectiveMotion() {
  return systemMotion.matches||forcedColors.matches||increasedContrast.matches?'quiet':
    motion.value==='system'?'expressive':motion.value;
}
function effectiveMaterial() {
  return glass.checked&&!reducedTransparency.matches&&!increasedContrast.matches&&!forcedColors.matches?'glass':'opaque';
}
function applyForest({persist=false}={}) {
  const mode=resolveForestMode(appearance.value,systemDark.matches);
  const palette=forestPalettes[mode];
  for(const [key,value] of Object.entries(palette))
    root.style.setProperty('--fr-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value);
  root.style.setProperty('--fr-illumination',String(Number(illumination.value)/100));
  root.dataset.theme=mode;
  root.dataset.atmosphere=atmosphere.value;
  root.dataset.motion=effectiveMotion();
  root.dataset.material=effectiveMaterial();
  $('#scene-name').textContent='Forest '+(mode==='dusk'?'Dusk':'Dawn');
  $('#illumination-value').textContent=illumination.value+'%';
  const notes=[];
  if(systemMotion.matches)notes.push('Reduced motion respected');
  if(forcedColors.matches)notes.push('Forced colours respected');
  if(increasedContrast.matches)notes.push('Increased contrast respected');
  if(reducedTransparency.matches)notes.push('Reduced transparency respected');
  if(glass.checked&&effectiveMaterial()==='opaque')notes.push('Opaque fallback active');
  if(!notes.length)notes.push('Accessible native controls and focus remain unchanged');
  $('#accessibility-note').textContent=notes.join(' · ')+'.';
  if(persist)savePreferences();
}
restorePreferences();
applyForest();
for(const element of [appearance,illumination,atmosphere,motion,glass]) {
  element.addEventListener(element===illumination?'input':'change',()=>applyForest({persist:true}));
}
for(const query of [systemDark,systemMotion,reducedTransparency,increasedContrast,forcedColors])
  query.addEventListener('change',()=>applyForest());
$('#reset-settings').addEventListener('click',()=>{
  appearance.value=accessibleDefaults.appearance;
  illumination.value=String(accessibleDefaults.illumination);
  atmosphere.value=accessibleDefaults.atmosphere;
  motion.value=accessibleDefaults.motion;
  glass.checked=accessibleDefaults.glass;
  try{localStorage.removeItem(preferenceKey);}catch{}
  applyForest();
  $('#accessibility-note').textContent+=' Local overrides reset.';
});

function selectedDirection() {
  return document.querySelector('input[name="direction"]:checked')?.value||'Discover';
}
$('#confirm').addEventListener('click',()=>{
  $('#task-feedback').textContent='Direction confirmed: '+selectedDirection()+'. No task data was stored.';
});
$('#clear').addEventListener('click',()=>{
  document.querySelector('input[name="direction"][value="Discover"]').checked=true;
  $('#task-feedback').textContent='Choice reset to Discover. No task data was stored.';
});
document.querySelector('.fr-choices').addEventListener('change',()=>{
  $('#task-feedback').textContent=selectedDirection()+' selected. Confirm when ready.';
});

// All records are simulated in memory for this reference. No event service,
// notification permission, cross-device sync or background worker is created.
const records=[
  {id:'h1',kind:'history',source:'Reference workspace',eventType:'Workspace update',
    occurredAt:'2026-10-08T12:15:00Z',description:'The sample workspace finished preparing its reference layout.',
    revision:1,unread:true,explicitUnread:false},
  {id:'h2',kind:'history',source:'Forest Lab',eventType:'Appearance change',
    occurredAt:'2026-10-08T11:05:00Z',description:'The reference environment published an illustrative event.',
    revision:1,unread:true,explicitUnread:false}
];
const history=$('#history');
const exposure=new Map();
const observed=new Set();
let observer;

function isActive() {return document.visibilityState==='visible'&&document.hasFocus();}
function clearExposure(id,reset=true) {
  const slot=exposure.get(id);
  if(!slot)return;
  if(slot.timer)clearTimeout(slot.timer);
  slot.timer=null;
  if(reset)exposure.delete(id);
}
function pauseExposure(id,reset=false) {
  const slot=exposure.get(id);
  if(!slot)return;
  if(slot.runningSince)slot.accumulated+=performance.now()-slot.runningSince;
  slot.runningSince=0;
  slot.pausedSince=performance.now();
  if(slot.timer)clearTimeout(slot.timer);
  slot.timer=null;
  if(reset)exposure.delete(id);
}
function isEligible(id) {
  const record=records.find(r=>r.id===id);
  return Boolean(record&&record.kind==='history'&&record.unread&&!record.explicitUnread&&history.open&&isActive()&&observed.has(id));
}
function setRead(id,method='visual') {
  const i=records.findIndex(r=>r.id===id);
  if(i===-1||records[i].kind!=='history')return;
  const slot=exposure.get(id);
  const context={active:isActive(),historyOpen:history.open,method,
    essentialVisible:observed.has(id),meaningfulExposureMs:slot?.accumulated||0,
    explicitUnread:records[i].explicitUnread};
  const next=acknowledgeHistory(records[i],context);
  if(next!==records[i]) {
    records[i]=next;
    updateHistoryEntry(id);
    renderIndicators();
  }
  clearExposure(id);
}
function startExposure(id) {
  if(!isEligible(id))return;
  let slot=exposure.get(id);
  if(!slot){slot={accumulated:0,runningSince:0,pausedSince:0,timer:null};exposure.set(id,slot);}
  if(slot.runningSince)return;
  if(slot.pausedSince && performance.now()-slot.pausedSince>INTERRUPTION_MS)slot.accumulated=0;
  slot.pausedSince=0;
  slot.runningSince=performance.now();
  slot.timer=setTimeout(()=>{
    if(!isEligible(id))return;
    slot.accumulated+=performance.now()-slot.runningSince;
    slot.runningSince=0;
    if(slot.accumulated>=EXPOSURE_MS)setRead(id,'visual');
  },Math.max(0,EXPOSURE_MS-slot.accumulated));
}
function renderIndicators() {
  const {unread,pending,allClear}=deriveNotificationStatus(records);
  $('#unread-count').textContent=unread+' unread';
  $('#pending-count').textContent=pending+' pending action'+(pending===1?'':'s');
  $('#history-count').textContent='('+records.filter(r=>r.kind==='history'&&r.unread).length+' unread)';
  $('#workspace-status-title').textContent=allClear?'All clear':'Action required';
  $('#workspace-status-copy').textContent=allClear?
    'No action is currently required. Historical announcements may still be unread.':
    'One simulated issue needs attention. No real data or operations are affected.';
  $('#resolve-action').disabled=allClear;
  $('#simulate-action').disabled=!allClear;
  $('#resolve-help').textContent=allClear?
    'Resolution becomes available when the simulated issue is present.':
    'Resolve the simulated issue to return the workspace to All clear.';
  $('#actionable-empty').hidden=!allClear;
  $('#actionable-list').textContent=allClear?'':'Simulated workspace · Review needed · Select Resolve issue to complete the sample task.';
}
function updateHistoryEntry(id) {
  const record=records.find(r=>r.id===id),item=document.getElementById('history-'+id);
  if(!record||!item)return;
  item.dataset.unread=String(record.unread);
  item.querySelector('.fr-history-essential strong').textContent=record.eventType+(record.unread?' · Unread':'');
  const button=item.querySelector('button');
  button.textContent=record.unread?'Mark as read':'Mark as unread';
  button.setAttribute('aria-label',(record.unread?'Mark as read: ':'Mark as unread: ')+record.eventType);
}
function renderHistory() {
  const list=$('#history-list');
  for(const record of records.filter(r=>r.kind==='history')){
    const li=document.createElement('li');
    li.id='history-'+record.id;
    li.className='fr-history-item';
    li.tabIndex=0;
    li.dataset.unread=String(record.unread);
    const essential=document.createElement('div');
    essential.className='fr-history-essential';
    essential.dataset.historyEssential=record.id;
    const heading=document.createElement('strong');
    heading.textContent=record.eventType+(record.unread?' · Unread':'');
    const description=document.createElement('p');description.textContent=record.description;
    const metadata=document.createElement('small');
    metadata.textContent=record.source+' · '+new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(record.occurredAt));
    essential.append(heading,description,metadata);
    const button=document.createElement('button');button.type='button';
    button.textContent=record.unread?'Mark as read':'Mark as unread';
    button.setAttribute('aria-label',(record.unread?'Mark as read: ':'Mark as unread: ')+record.eventType);
    button.addEventListener('click',()=>{
      const current=records.find(r=>r.id===record.id);
      if(current.unread) {
        // Explicit acknowledgement is always available, even after Mark unread.
        records[records.findIndex(r=>r.id===record.id)]={...current,unread:false,explicitUnread:false};
      } else {
        records[records.findIndex(r=>r.id===record.id)]={...current,unread:true,explicitUnread:true};
      }
      clearExposure(record.id);
      const updated=records.find(r=>r.id===record.id);
      li.dataset.unread=String(updated.unread);
      heading.textContent=updated.eventType+(updated.unread?' · Unread':'');
      button.textContent=updated.unread?'Mark as read':'Mark as unread';
      button.setAttribute('aria-label',(updated.unread?'Mark as read: ':'Mark as unread: ')+updated.eventType);
      renderIndicators();
    });
    li.addEventListener('focusin',event=>{
      // Focusing the explicit read/unread button must not pre-acknowledge its entry.
      if(event.target!==li)return;
      if(isActive()&&history.open&&!record.explicitUnread) {
        const index=records.findIndex(r=>r.id===record.id);
        const next=acknowledgeHistory(records[index],{
          active:true,historyOpen:true,method:'accessible-navigation',
          explicitUnread:records[index].explicitUnread
        });
        if(next!==records[index]) {
          records[index]=next;
          li.dataset.unread='false';
          heading.textContent=next.eventType;
          button.textContent='Mark as unread';
          button.setAttribute('aria-label','Mark as unread: '+next.eventType);
          renderIndicators();
          clearExposure(record.id);
        }
      }
    });
    li.append(essential,button);
    list.append(li);
  }
  observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      const id=entry.target.dataset.historyEssential;
      if(entry.isIntersecting&&entry.intersectionRatio>=.8){
        observed.add(id);
        startExposure(id);
      }else{
        observed.delete(id);
        pauseExposure(id);
      }
    }
  },{threshold:[0,.8,1]});
  for(const el of list.querySelectorAll('[data-history-essential]'))observer.observe(el);
}
renderHistory();
renderIndicators();
history.addEventListener('toggle',()=>{
  if(!history.open) {
    observed.clear();
    for(const id of exposure.keys())clearExposure(id);
  }
});
document.addEventListener('visibilitychange',()=>{
  if(!isActive())for(const id of exposure.keys())clearExposure(id);
});
window.addEventListener('blur',()=>{for(const id of exposure.keys())clearExposure(id);});
window.addEventListener('focus',()=>{for(const id of observed)startExposure(id);});
let previousY=window.scrollY,previousT=performance.now(),scrollResume=null;
window.addEventListener('scroll',()=>{
  if(!history.open)return;
  const now=performance.now(),dy=Math.abs(window.scrollY-previousY);
  const velocity=dy/Math.max(1,now-previousT);
  const drastic=dy>innerHeight*.35||velocity>1.5;
  previousY=window.scrollY;previousT=now;
  for(const id of exposure.keys())pauseExposure(id,drastic);
  if(scrollResume)clearTimeout(scrollResume);
  scrollResume=setTimeout(()=>{for(const id of observed)startExposure(id);},120);
},{passive:true});

$('#simulate-action').addEventListener('click',()=>{
  records.push({id:'a1',kind:'action',state:'pending',unread:true});
  renderIndicators();
});
$('#resolve-action').addEventListener('click',()=>{
  const record=records.find(r=>r.id==='a1');
  if(record){record.state='resolved';record.unread=false;}
  renderIndicators();
});
