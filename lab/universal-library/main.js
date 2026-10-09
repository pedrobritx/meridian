import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/fraunces/latin-400.css';
import '../../styles/tokens.css';
import '../../styles/living-environments.css';
import './universal.css';
import {universalComponents,universalGroups,projectNames,componentsFor} from '../../src/universal/catalog.js';
import universalSymbols from '../../design/meridian/universal-symbols.json';
import {iconMarkup,symbolNames} from '../../src/universal/symbols.js';

const byId=id=>document.getElementById(id);
const node=(tag,attrs={},...children)=>{
  const el=document.createElement(tag);
  for(const [key,value] of Object.entries(attrs)){
    if(key==='class')el.className=value;
    else if(key==='text')el.textContent=value;
    else if(key==='html')el.innerHTML=value; // static repository-owned symbol paths only
    else if(key==='hidden')el.hidden=Boolean(value);
    else if(key==='value')el.value=value;
    else if(key==='checked')el.checked=Boolean(value);
    else if(key==='disabled')el.disabled=Boolean(value);
    else if(value!==null&&value!==undefined)el.setAttribute(key,String(value));
  }
  for(const child of children.flat()){
    if(child===null||child===undefined)continue;
    el.append(child instanceof Node?child:document.createTextNode(String(child)));
  }
  return el;
};
const text=(tag,value,cls='')=>node(tag,{class:cls,text:value});
function iconElement(name,size=20){
  const wrap=node('span',{class:'u-component-icon'});
  const fallback=symbolNames.includes(name)?name:'layers';
  wrap.innerHTML=iconMarkup(fallback,{size});
  return wrap;
}
function button(label,action,primary=false){
  const b=node('button',{type:'button',class:primary?'u-primary':''},label);
  if(action)b.addEventListener('click',action);
  return b;
}
const sampleStatus=(parent,message='Reference only · no operation was sent.')=>{
  let messageNode=parent.querySelector('[data-sample-status]');
  if(!messageNode){messageNode=node('p',{class:'u-subtle','data-sample-status':''});parent.append(messageNode);}
  messageNode.textContent=message;
};
function formInput(type,label,value=''){
  const input=node('input',{type,value});
  const id='sample-'+Math.random().toString(36).slice(2,10);
  input.id=id;
  return node('label',{},label,input);
}
function appendInfo(area,main,detail){
  area.append(text('p',main,'u-source'),text('p',detail,'u-subtle'));
}
function commonDemo(item,area){
  const intro=text('p',item.anatomy,'u-subtle');
  if(item.group==='Inputs & selection'){
    switch(item.id){
      case 'search-field':{
        const input=formInput('search','Search this example','');
        const status=text('p','Type to filter sample records.','u-subtle');
        input.querySelector('input').addEventListener('input',e=>{
          status.textContent=e.target.value.trim()?'Search query: '+e.target.value.trim():'Type to filter sample records.';
        });
        area.append(input,status);break;
      }
      case 'combobox':{
        const label=node('label',{},'Select a record');
        const select=node('select',{},node('option',{value:'1'},'Sample item A'),node('option',{value:'2'},'Sample item B'));
        label.append(select);area.append(label);break;
      }
      case 'multi-select':
      case 'radio-group':{
        const f=node('fieldset',{},node('legend',{},'Choose '+(item.id==='radio-group'?'one':'any')));
        for(const word of ['Source','Target','Review']){
          const input=node('input',{type:item.id==='radio-group'?'radio':'checkbox',name:item.id+item.group,value:word});
          f.append(node('label',{},input,word));
        }
        area.append(f);break;
      }
      case 'text-area':{
        const label=node('label',{},'Your notes',node('textarea',{rows:'2','aria-describedby':'demo-hint-'+item.id}));
        const help=text('p','0 characters · sample only','u-subtle');
        label.querySelector('textarea').addEventListener('input',e=>help.textContent=e.target.value.length+' characters · sample only');
        area.append(label,help);break;
      }
      case 'range-slider':{
        const output=node('output',{},'60 / 100');
        const range=node('input',{type:'range',min:'0',max:'100',value:'60','aria-label':'Sample range'});
        range.addEventListener('input',()=>output.textContent=range.value+' / 100');
        area.append(node('label',{},'Value',range),output);break;
      }
      case 'date-time':{
        area.append(formInput('datetime-local','Date and time'));break;
      }
      case 'file-dropzone':{
        area.append(formInput('file','Select a local file'));
        area.append(text('p','Demo: no file leaves this browser.','u-subtle'));break;
      }
      case 'passkey':{
        area.append(node('label',{},'One-time code',node('input',{type:'text',inputmode:'numeric',autocomplete:'one-time-code',maxlength:'6',placeholder:'••••••'})));
        break;
      }
      case 'colour-picker':{
        const chosen=text('p','Example ink: #235D50','u-subtle');
        const color=node('input',{type:'color',value:'#235D50','aria-label':'Choose example ink colour'});
        color.addEventListener('input',()=>chosen.textContent='Example ink: '+color.value.toUpperCase());
        area.append(color,chosen);break;
      }
      case 'editor-toolbar':{
        const bar=node('div',{class:'u-row',role:'toolbar','aria-label':'Text formatting example'});
        for(const name of ['Bold','Italic','Underline']){
          const b=button(name,null);
          b.setAttribute('aria-pressed','false');
          b.addEventListener('click',()=>b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true')));
          bar.append(b);
        }
        area.append(bar);break;
      }
      case 'editable-cell':{
        const label=formInput('text','Record value','Draft value');
        const input=label.querySelector('input');
        const result=text('p','Not committed · local demo','u-subtle');
        area.append(label,button('Commit example',()=>result.textContent='Example accepted: '+input.value,true),result);break;
      }
      default:area.append(intro);
    }
    return;
  }
  if(item.group==='Navigation & workspace'){
    switch(item.id){
      case 'tab-list':{
        const tablist=node('div',{role:'tablist','aria-label':'Example tabs',class:'u-row'});
        const panel=node('div',{role:'tabpanel',id:'panel-'+item.id,'aria-label':'Example tab content',class:'u-subtle'},'Overview panel');
        for(const [i,name] of ['Overview','Materials','Motion'].entries()){
          const tab=button(name,()=>activate(i));
          tab.setAttribute('role','tab');tab.setAttribute('id','tab-'+item.id+'-'+i);tab.setAttribute('aria-controls',panel.id);
          tab.setAttribute('aria-selected',String(i===0));tab.tabIndex=i===0?0:-1;tablist.append(tab);
        }
        function activate(index){
          [...tablist.children].forEach((t,i)=>{t.setAttribute('aria-selected',String(i===index));t.tabIndex=i===index?0:-1;});
          panel.textContent=['Overview panel','Material settings','Motion preferences'][index];
          tablist.children[index].focus();
        }
        tablist.addEventListener('keydown',event=>{
          const tabs=[...tablist.children],index=tabs.indexOf(document.activeElement);
          if(index<0)return;
          const next=event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:-1;
          if(next>=0){event.preventDefault();activate(next);}
        });
        area.append(tablist,panel);break;
      }
      case 'drawer':{
        const d=node('dialog',{'aria-label':'Sample drawer'});
        d.append(text('h4','Sample drawer'),text('p','Dismiss to return focus to the opener.'));
        d.append(button('Close drawer',()=>d.close()));
        area.append(button('Open drawer',()=>d.showModal(),true),d);
        break;
      }
      case 'pagination':{
        let current=1;const currentLabel=text('span','Page 1 of 3','u-subtle');
        const previous=button('Previous',()=>change(-1));const next=button('Next',()=>change(1));
        function change(d){current=Math.max(1,Math.min(3,current+d));currentLabel.textContent='Page '+current+' of 3';previous.disabled=current===1;next.disabled=current===3;}
        previous.disabled=true;area.append(node('div',{class:'u-row'},previous,currentLabel,next));break;
      }
      case 'breadcrumbs':{
        area.append(node('nav',{'aria-label':'Example breadcrumb'},node('ol',{},
          node('li',{},node('a',{href:'#catalog'},'Workspace')),
          node('li',{},node('a',{href:'#catalog'},'Files')),
          node('li',{'aria-current':'page'},'Current'))));break;
      }
      case 'tree-view':
      case 'context-menu':
      case 'popover':{
        area.append(node('details',{},node('summary',{},item.id==='tree-view'?'Folders':item.id==='context-menu'?'More actions':'More information'),
          text('p',item.anatomy,'u-subtle')));break;
      }
      case 'command-menu':{
        area.append(formInput('search','Find a command'),text('p','Save · Search · Export','u-subtle'));break;
      }
      case 'split-pane':{
        const label=node('label',{},'Left pane width',node('input',{type:'range',min:'25',max:'75',value:'50'}));
        area.append(label,text('p','Keyboard arrows adjust the split.','u-subtle'));break;
      }
      default:{
        const nav=node('nav',{'aria-label':item.name+' example'});
        const row=node('div',{class:'u-row'});
        for(const name of ['Overview','Workspace','More']){
          const b=button(name,()=>sampleStatus(area,'Selected '+name+' in example.'),name==='Overview');
          row.append(b);
        }
        nav.append(row);area.append(nav);break;
      }
    }
    return;
  }
  if(item.group==='Records & insight'){
    if(item.id==='data-table'){
      const table=node('table',{class:'u-data-table'},node('caption',{},'Sample records'));
      const head=node('thead',{},node('tr',{},node('th',{scope:'col'},'Name'),node('th',{scope:'col'},'State')));
      const body=node('tbody',{},node('tr',{},node('td',{},'Record A'),node('td',{},'Ready')),node('tr',{},node('td',{},'Record B'),node('td',{},'Review')));
      table.append(head,body);area.append(table);return;
    }
    if(item.id==='metric-card'||item.id==='chart-panel'){
      appendInfo(area,item.id==='metric-card'?'84.6 sample units':'▁ ▂ ▄ ▃ ▆ ▇ ▅','Sample figure · source and data required in adopting app');return;
    }
    if(item.id==='empty-state'){appendInfo(area,'Nothing here yet','Create a record to get started.');return;}
    if(item.id==='timeline'||item.id==='activity-feed'){
      area.append(node('ol',{},node('li',{},'08:30 · Sample event'),node('li',{},'09:45 · Status updated')));return;
    }
    if(item.id==='filter-bar'||item.id==='tag-chip'){
      const row=node('div',{class:'u-row'}),state=text('p','Filter not applied.','u-subtle');
      for(const name of ['Pending','Reviewed']){
        const b=button(name,()=>state.textContent='Showing '+name.toLowerCase()+' sample items');
        row.append(b);
      }
      area.append(row,state);return;
    }
    appendInfo(area,item.id==='calendar-event'?'Sample session · 14:00':item.id==='source-citation'?'Source · Example citation':'Record 001 · Example item',item.anatomy);
    return;
  }
  if(item.group==='Feedback & trust'){
    if(item.id==='progress'){
      const p=node('progress',{value:'60',max:'100','aria-label':'Example progress'});
      const b=button('Advance sample',()=>{p.value=Math.min(100,p.value+10);sampleStatus(area,p.value+'% complete in demo');});
      area.append(p,b);return;
    }
    if(item.id==='toast'){
      const message=node('div',{role:'status','aria-live':'polite',class:'u-subtle'},'No notification pending.');
      area.append(button('Show sample',()=>message.textContent='Draft changed. Undo is available in the adopting app.'),message);return;
    }
    if(item.id==='confirmation'){
      const d=node('dialog',{'aria-label':'Example confirmation'});
      d.append(text('h4','Discard example changes?'),text('p','No real data will be changed.'));
      d.append(button('Cancel',()=>d.close()),button('Confirm sample',()=>{d.close();sampleStatus(area,'Sample confirmed · no records changed.');},true));
      area.append(button('Open confirmation',()=>d.showModal()),d);return;
    }
    if(item.id==='privacy'){
      const input=node('input',{type:'checkbox'});
      area.append(node('label',{},input,' Allow sample data access'));
      area.append(button('Revoke',()=>{input.checked=false;sampleStatus(area,'Sample permission revoked.');}));return;
    }
    if(item.id==='notification-centre'){
      area.append(text('p','2 unread · 0 pending actions','u-status'));
      area.append(node('details',{},node('summary',{},'Announcement history'),text('p','Forest Lab · Appearance updated · 08 Oct','u-subtle')));return;
    }
    if(item.id==='skeleton'){
      area.append(node('div',{class:'u-meter',role:'presentation'},node('span',{'aria-hidden':'true'})));
      area.append(text('p','Loading placeholder; content follows the same layout.','u-subtle'));return;
    }
    appendInfo(area,item.id==='error-retry'?'Action needs attention':item.id==='offline'?'Status not verified':'All clear · sample state',item.anatomy);
    area.append(button(item.id==='error-retry'?'Retry sample':'Inspect state',()=>sampleStatus(area,'Demonstration only; authoritative state belongs to the app.')));
    return;
  }
  // Project-oriented sample anatomy. No real user/client/project records are shown.
  const scenarios={
    'translation-segment':['Source · Segment 014','Target · Pending review'],
    'tm-match':['Translation memory · 92%','Suggested translation available'],
    'term-entry':['Preferred term · British English','Domain · Source glossary'],
    'review-diff':['Before / after revision','Review and confirm difference'],
    'cefr-level':['B2 · Independent user','Reading · Skills and confidence'],
    'lesson-phase':['Input and noticing · 12 minutes','Goal → Activity → Evidence'],
    'quiz-choice':['Question 3 of 10','Select one answer and submit'],
    'rubric-row':['Criterion · Coherence','Band / evidence / comments'],
    'audio-transcript':['Audio example · 01:24','Transcript available on request'],
    'whiteboard-tool':['Pen · 4px · Ink','Canvas selection independent of toolbar'],
    'artwork-card':['Untitled work · Example artist','Museum and open-access licence'],
    'artwork-provenance':['Artist and institution','Licence, accession and source'],
    'evidence-record':['Evidence · Document 001','Origin · timestamp · verification'],
    'waste-manifest':['MTR 000001 · Draft','Volume / generator / CDF'],
    'permit-status':['Permit example · Review','Regulator · expiration · scope'],
    'resident-notice':['Building notice · Maintenance','Audience · Date · Read state'],
    'maintenance-ticket':['Ticket 104 · Plumbing','Urgency · Supplier · Next action'],
    'impact-metric':['4.9 kg CO₂e · sample','Formula + inputs + source'],
    'scenario-compare':['In-person ↔ Remote','Time · Cost · Emissions'],
    'media-tile':['Featured work · Example','Format · Length · Attribution'],
    'playback-control':['Play · 00:14 / 02:35','Captions · Volume · Seek'],
    'booking-slot':['Tuesday 14:00 · Sample','Timezone · Verification required'],
    'permission-matrix':['Role · Teacher','View ✓ · Modify —'],
    'audit-entry':['09 Oct · Example change','Actor · Reason · Source']
  };
  const [title,subtitle]=scenarios[item.id]||[item.name,item.anatomy];
  appendInfo(area,title,subtitle);
  if(['quiz-choice','scenario-compare'].includes(item.id)){
    const options=node('fieldset',{},node('legend',{},'Example choice'));
    for(const label of ['Option A','Option B'])options.append(node('label',{},node('input',{type:'radio',name:item.id,value:label}),label));
    area.append(options);
  } else if(item.id==='translation-segment'){
    area.append(node('label',{},'Target text',node('textarea',{rows:'2',placeholder:'Enter translation…'})));
  } else if(['audio-transcript','playback-control'].includes(item.id)){
    const status=text('p','Playback is not connected to audio.','u-subtle');
    area.append(button('Show transcript',()=>status.textContent='Transcript sample: The meeting starts at nine.'),status);
  } else {
    area.append(button('Inspect sample',()=>sampleStatus(area,'Reference pattern only. No project data changed.')));
  }
}
function renderCard(item){
  const card=node('article',{class:'u-component','data-component':item.id,'data-group':item.group});
  const header=node('div',{class:'u-component-header'});
  header.append(iconElement(item.icon),node('div',{},text('div',item.group,'u-component-category'),text('h3',item.name)));
  const demo=node('div',{class:'u-specimen','aria-label':item.name+' illustrative example'});
  commonDemo(item,demo);
  card.append(header,text('p',item.anatomy,'u-anatomy'),demo,
    node('div',{class:'u-component-footer'},text('span',item.projects.join(' · '),'u-projects'),
      node('a',{class:'u-contract',href:'https://github.com/pedrobritx/meridian/blob/main/design/meridian/universal-project-patterns.json'},'Specification ↗')));
  return card;
}
function renderCatalog(){
  const selected={search:byId('component-search').value,group:byId('group-filter').value,project:byId('project-filter').value};
  const list=componentsFor(selected),grid=byId('component-grid');
  grid.replaceChildren(...list.map(renderCard));
  byId('no-results').hidden=list.length!==0;
  byId('total-count').textContent=universalComponents.length+' component contracts';
  byId('filter-status').textContent=list.length+' of '+universalComponents.length+' components shown';
}
for(const group of universalGroups)byId('group-filter').append(node('option',{value:group},group));
for(const project of projectNames)byId('project-filter').append(node('option',{value:project},project));
for(const id of ['component-search','group-filter','project-filter']){
  byId(id).addEventListener(id==='component-search'?'input':'change',renderCatalog);
}
byId('filters').addEventListener('reset',()=>requestAnimationFrame(renderCatalog));
function renderSymbols(){
  const q=byId('symbol-filter').value.trim().toLowerCase();
  const icons=universalSymbols.icons.filter(icon=>[icon.name,icon.category].join(' ').includes(q));
  const grid=byId('symbol-grid');grid.replaceChildren();
  for(const icon of icons){
    const element=node('div',{class:'u-symbol-cell',title:icon.category+' · '+icon.name});
    element.innerHTML=iconMarkup(icon.name,{size:25}); // repo-owned static path only
    element.append(text('small',icon.name));
    grid.append(element);
  }
  byId('symbol-count').textContent=icons.length+' / '+universalSymbols.icons.length+' symbols';
}
byId('symbol-filter').addEventListener('input',renderSymbols);
const appearance=byId('appearance-mode');
appearance.addEventListener('change',()=>{
  const [environment,mode]=appearance.value.split(':');
  document.documentElement.dataset.meridian='grass';
  document.documentElement.dataset.meridianEnvironment=environment;
  document.documentElement.dataset.theme=mode;
  byId('appearance-status').textContent=appearance.selectedOptions[0].textContent+' selected';
});
renderCatalog();
renderSymbols();
