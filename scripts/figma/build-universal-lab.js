/**
 * Meridian Universal 0.6 Lab native component builder.
 * Load into Figma use_figma with project metadata as \`items\`.
 * All creates are idempotent by component name; stable library masters untouched.
 */
async function buildUniversalLab(figma, items) {
  let page=figma.root.children.find(p=>p.name==='17 · Universal Components · Lab');
  const createdNodeIds=[],masterIds=[],skipped=[];
  if(!page){page=figma.createPage();page.name='17 · Universal Components · Lab';createdNodeIds.push(page.id);}
  await figma.setCurrentPageAsync(page);
  for(const f of [
    {family:'Manrope',style:'Regular'},
    {family:'Manrope',style:'Medium'},
    {family:'Manrope',style:'SemiBold'},
    {family:'Manrope',style:'Bold'},
    {family:'Fraunces',style:'Regular'}
  ]) await figma.loadFontAsync(f);
  const collection=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==='Meridian / Colour');
  if(!collection)throw Error('Existing Meridian semantic colour collection missing');
  const all=(await Promise.all(collection.variableIds.map(id=>figma.variables.getVariableByIdAsync(id)))).filter(Boolean);
  const vars=new Map(all.map(v=>[v.name,v]));
  const palette={
    text:'color/text/primary',muted:'color/text/secondary',surface:'color/bg/surface',
    sunken:'color/bg/sunken',border:'color/border/subtle',
    action:'color/action/primary',onAction:'color/action/on-primary',
    focus:'color/focus/ring',success:'color/status/success',warning:'color/status/warning'
  };
  function paint(role) {
    const variable=vars.get(palette[role]||palette.text);
    if(!variable)throw Error('Missing semantic colour: '+role);
    return figma.variables.setBoundVariableForPaint(
      {type:'SOLID',color:{r:0.1,g:0.2,b:0.16}},'color',variable
    );
  }
  function txt(parent,value,{role='text',size=13,weight='Regular',font='Manrope',width=270}={}){
    const n=figma.createText();
    n.name='Text / '+String(value).slice(0,70);
    n.fontName={family:font,style:weight};
    n.characters=String(value);
    n.fontSize=size;
    n.fills=[paint(role)];
    n.resize(Math.max(20,width),Math.max(24,size+6));
    n.textAutoResize='HEIGHT';
    parent.appendChild(n);createdNodeIds.push(n.id);
    return n;
  }
  function box(parent,{name='Container',direction='VERTICAL',width=280,padding=12,gap=7,fill=null,border=false,radius=12}={}){
    const f=figma.createAutoLayout(direction);
    f.name=name;
    f.resize(width,50);
    f.primaryAxisSizingMode=direction==='VERTICAL'?'AUTO':'FIXED';
    f.counterAxisSizingMode=direction==='VERTICAL'?'FIXED':'AUTO';
    f.paddingTop=padding;f.paddingBottom=padding;f.paddingLeft=padding;f.paddingRight=padding;
    f.itemSpacing=gap;f.cornerRadius=radius;
    if('cornerSmoothing' in f)f.cornerSmoothing=.65;
    f.fills=fill?[paint(fill)]:[];
    if(border){f.strokes=[{...paint('border'),opacity:.65}];f.strokeWeight=1;}
    parent.appendChild(f);createdNodeIds.push(f.id);return f;
  }
  function chip(parent,label,{active=false,width=85,role=null}={}){
    const c=box(parent,{name:'Chip / '+label,width,padding:9,gap:4,fill:role||(active?'action':'sunken'),radius:22});
    txt(c,label,{role:active?'onAction':'text',size:12,weight:'SemiBold',width:Math.max(30,width-18)});
    return c;
  }
  const dataset=new Map(items.map(x=>[x.id,x]));
  function specimen(comp,item){
    const a=item.anatomy;
    const project=item.projects?.[0]==='all'?'General':item.projects?.slice(0,2).join(' + ')||'General';
    if(item.group==='Inputs & selection'){
      const container=box(comp,{name:'Input / '+item.id,width:300,padding:10,gap:6,fill:'sunken',radius:14});
      if(['radio-group','multi-select','colour-picker'].includes(item.id)){
        const line=box(container,{name:'Selected choices',direction:'HORIZONTAL',width:277,padding:0,gap:8});
        chip(line,item.id==='radio-group'?'Choice A':item.id==='colour-picker'?'#215A4A':'Selected',{active:true,width:115});
        chip(line,'Choice B',{width:110});
      }else if(item.id==='range-slider'){
        txt(container,'━━━━━━━━━●━━━━', {role:'action',size:16,width:254});
        txt(container,'Value: 60 / 100', {role:'muted',size:11,width:255});
      }else if(item.id==='passkey'){
        txt(container,'● ● ● ● ● ●', {role:'action',size:18,width:265});
      }else if(item.id==='file-dropzone'){
        txt(container,'Choose a file or drop here', {size:13,width:274,weight:'SemiBold'});
      }else if(item.id==='editor-toolbar'){
        txt(container,'B     I     U       ↶      ↷', {size:16,width:275});
      }else {
        const placeholders={'search-field':'Search projects, files or people…','combobox':'Choose from available records…','text-area':'Write a meaningful description…','date-time':'DD / MM / YYYY     14:00','editable-cell':'Click or press Enter to edit…'};
        txt(container,placeholders[item.id]||'Select an option…',{role:'muted',size:13,width:278});
      }
      txt(comp,'Visible label · help · keyboard · validation',{role:'muted',size:10,width:300});
      return;
    }
    if(item.group==='Navigation & workspace'){
      const nav=box(comp,{name:'Navigation specimen',direction:'HORIZONTAL',width:300,padding:0,gap:6});
      for(const [idx,n] of ['Overview','Workspace','More'].entries())
        chip(nav,n,{active:idx===0,width:idx===1?110:92});
      txt(comp,item.id==='command-menu'?'⌘ K  ·  Search commands and actions':a,{role:'muted',size:11,width:300});
      return;
    }
    if(item.group==='Records & insight'){
      const rec=box(comp,{name:'Structured record',width:300,padding:12,fill:'sunken',radius:13});
      if(item.id==='chart-panel'||item.id==='metric-card'){
        txt(rec,item.id==='metric-card'?'84.6   ·   sample units':'▁ ▂ ▄ ▃ ▆ ▇ ▅',{role:'action',font:item.id==='metric-card'?'Fraunces':'Manrope',size:22,width:276});
        txt(rec,'Source available · verified sample',{role:'muted',size:11,width:276});
      }else if(item.id==='empty-state'){
        txt(rec,'Nothing here yet',{size:16,font:'Fraunces',width:275});
        txt(rec,'Create your first record to get started.',{role:'muted',size:11,width:276});
      }else{
        txt(rec,'Record 001  ·  '+project,{weight:'SemiBold',size:12,width:276});
        txt(rec,a,{role:'muted',size:11,width:276});
      }
      return;
    }
    if(item.group==='Feedback & trust'){
      const c=box(comp,{name:'Status / '+item.id,width:300,padding:12,fill:'sunken',radius:13});
      const status=item.id==='error-retry'?'Action needs attention':item.id==='offline'?'Last checked a moment ago':item.id==='progress'?'Processing · 60%':item.id==='privacy'?'Permission required':'All clear · verified state';
      txt(c,status,{role:item.id==='error-retry'?'warning':'action',weight:'SemiBold',width:276,size:13});
      txt(c,a,{role:'muted',width:276,size:11});
      return;
    }
    // Project-specific patterns are domain specimens, not mocked business logic.
    const rec=box(comp,{name:'Product-specific specimen / '+item.id,width:300,padding:12,gap:10,fill:'sunken',radius:13});
    const samples={
      'translation-segment':['Source · Segment 014','Target · Review required'],
      'tm-match':['Translation memory · 92%','Use suggestion / inspect source'],
      'term-entry':['Preferred term · English','Evidence · Glossary reference'],
      'review-diff':['Before → After','Confirm reviewed revision'],
      'cefr-level':['B2 · Independent user','Reading / Listening / Writing'],
      'lesson-phase':['Input & noticing · 12 min','Objective → Activity → Evidence'],
      'quiz-choice':['Question 03 / 10','Choose one answer'],
      'rubric-row':['Criterion · Coherence','Band + feedback + source'],
      'audio-transcript':['▶  00:38 / 01:24','Transcript available'],
      'whiteboard-tool':['Pen · Size 4 · #215A4A','Selection and colour independent'],
      'artwork-card':['Artwork · Title and artist','Museum · Public domain / CC0'],
      'artwork-provenance':['Artist · Attribution','Museum, source and licence'],
      'evidence-record':['Evidence · DOC 2026-001','Source / uploaded / verified'],
      'waste-manifest':['MTR · 000001','Volume · Generator · CDF'],
      'permit-status':['Water permit · In review','Agency · validity · scope'],
      'resident-notice':['Maintenance notice','Audience · Accessible summary'],
      'maintenance-ticket':['Ticket #104 · Plumbing','Priority · Owner · Next action'],
      'impact-metric':['4.9 kg CO₂e','Inputs, method and source'],
      'scenario-compare':['In person ⇄ Remote','Time + cost + impact'],
      'media-tile':['Collection · Featured work','Format · Duration · Rights'],
      'playback-control':['▶    ━━━━━●━━━━','00:14 / 02:35 · Captions'],
      'booking-slot':['Tuesday · 14:00','Local timezone · Confirm'],
      'permission-matrix':['Role · Teacher','View ✓    Modify —'],
      'audit-entry':['2026-10-09 · Edit verified','Actor / reason / source']
    };
    const lines=samples[item.id]||[item.name,a];
    txt(rec,lines[0],{weight:'SemiBold',size:13,width:270});
    txt(rec,lines[1],{role:'muted',size:11,width:270});
    txt(comp,project+' · application owns authoritative data',{role:'muted',size:10,width:300});
  }
  const existing=new Map(page.children.filter(n=>n.type==='COMPONENT').map(n=>[n.name,n]));
  const index=items.map(x=>x.id);
  for(const item of items){
    const name='Universal / '+item.id;
    if(existing.has(name)){skipped.push(item.id);masterIds.push(existing.get(name).id);continue;}
    const c=figma.createComponent();
    createdNodeIds.push(c.id);
    c.name=name;
    c.description=item.name+' | '+item.group+' | '+item.anatomy+
      '. Applies to: '+item.projects.join(', ')+
      '. Lab 0.6 only. Follow semantic HTML, visible focus, reduced-motion alternatives, 48px targets and application-owned data/state.';
    c.resize(338,190);
    c.layoutMode='VERTICAL';
    c.primaryAxisSizingMode='AUTO';c.counterAxisSizingMode='FIXED';
    c.paddingTop=18;c.paddingBottom=18;c.paddingLeft=18;c.paddingRight=18;c.itemSpacing=10;
    c.cornerRadius=22;if('cornerSmoothing' in c)c.cornerSmoothing=.7;
    c.fills=[paint('surface')];
    c.strokes=[{...paint('border'),opacity:.5}];c.strokeWeight=1;
    // Very restrained depth. Original Start / Material Library 0.3 reference.
    c.effects=[{type:'DROP_SHADOW',color:{r:0.03,g:0.10,b:0.08,a:.09},offset:{x:0,y:5},radius:14,spread:0,visible:true,blendMode:'NORMAL'}];
    txt(c,item.group.toUpperCase(),{role:'muted',size:10,weight:'Bold',width:300});
    const label=txt(c,item.name,{size:19,font:'Fraunces',width:300});
    const labelProp=c.addComponentProperty('Label','TEXT',item.name);
    label.componentPropertyReferences={characters:labelProp};
    specimen(c,item);
    const globalIndex=(item._index??items.indexOf(item));
    c.x=80+(globalIndex%4)*396;
    c.y=190+Math.floor(globalIndex/4)*294;
    masterIds.push(c.id);
  }
  if(!page.children.some(n=>n.type==='TEXT'&&n.name==='Universal Components / title')){
    const h=figma.createText();createdNodeIds.push(h.id);h.name='Universal Components / title';
    h.fontName={family:'Manrope',style:'Bold'};h.characters='Universal components · Meridian 0.6 Lab';
    h.fontSize=30;h.fills=[paint('text')];h.x=80;h.y=68;h.resize(1400,52);
  }
  return {pageId:page.id,createdNodeIds,masterIds,count:masterIds.length,skipped,groups:[...new Set(items.map(x=>x.group))]};
}
