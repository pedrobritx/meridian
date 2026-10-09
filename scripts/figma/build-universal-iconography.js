/**
 * Meridian Universal Iconography Figma builder (0.6 Lab).
 * Run with the scoped Icon records from design/meridian/universal-symbols.json.
 * Preserves the original 80 Outline component IDs and builds sibling variant sets.
 */
async function buildIconVariants(figma, icons, offset=0) {
  const pageName='Symbols / Semantic styles · Outline Filled Colour Duotone';
  let page=figma.root.children.find(p=>p.id==='274:34'||p.name===pageName||p.name==='10 · Icons · Semantic Styles');
  const createdNodeIds=[],mutatedNodeIds=[],createdSets=[],skipped=[];
  if(!page){page=figma.createPage();page.name=pageName;createdNodeIds.push(page.id);}
  await figma.setCurrentPageAsync(page);
  await Promise.all([{family:'Manrope',style:'Regular'},{family:'Manrope',style:'Bold'}].map(x=>figma.loadFontAsync(x)));
  const c=(await figma.variables.getLocalVariableCollectionsAsync()).find(x=>x.name==='Meridian / Colour');
  const vs=new Map((await Promise.all(c.variableIds.map(id=>figma.variables.getVariableByIdAsync(id)))).filter(Boolean).map(v=>[v.name,v]));
  const paint=role=>figma.variables.setBoundVariableForPaint(
    {type:'SOLID',color:{r:0,g:0,b:0}},'color',vs.get(role)
  );
  const states=[
    {name:'Outline',strokeRole:'color/action/primary',fillRole:null,width:1.85},
    {name:'Filled',strokeRole:'color/action/primary',fillRole:'color/action/primary',width:2.35},
    {name:'Colour',strokeRole:'color/status/info',fillRole:'color/status/info-bg',width:1.85},
    {name:'Duotone',strokeRole:'color/action/primary',fillRole:'color/status/success',width:1.85}
  ];
  for(let i=0;i<icons.length;i++){
    const icon=icons[i],index=offset+i;
    const label='Icon / Styles / '+icon.name;
    if(page.children.some(n=>n.type==='COMPONENT_SET'&&n.name===label)){
      skipped.push(icon.name);
      continue;
    }
    const comps=[];
    for(const state of states){
      let path=icon.path;
      if(state.fillRole){
        path=path.replace(/<path d="([^"]*)"([^>]*)\/>/g,
          (m,d,props)=>/z/i.test(d)?'<path d="'+d+'"'+props+' fill="#6B9D84"/>':m
        ).replace(/<(rect|circle|ellipse|polygon)(\s)/g,'<$1 fill="#6B9D84"$2');
      }
      const svg='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#235D50" stroke-width="'+state.width+'" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';
      const imported=figma.createNodeFromSvg(svg);
      const comp=figma.createComponentFromNode(imported);
      createdNodeIds.push(comp.id);
      comp.name='Style='+state.name;
      for(const descendant of comp.findAll(()=>true)){
        if('strokes'in descendant&&descendant.strokes?.length){
          descendant.strokes=[paint(state.strokeRole)];mutatedNodeIds.push(descendant.id);
        }
        if('fills'in descendant&&descendant.fills?.length&&state.fillRole){
          descendant.fills=[paint(state.fillRole)];mutatedNodeIds.push(descendant.id);
        }
      }
      comps.push(comp);
    }
    const set=figma.combineAsVariants(comps,page);
    createdNodeIds.push(set.id);set.name=label;
    set.description=icon.category+' · Reusable styles: Outline, Filled, Colour, Duotone. 24 px grid, rounded endings. Pair with accessible text unless decorative. Keep original icon master intact.';
    for(let j=0;j<comps.length;j++){comps[j].x=j*40;comps[j].y=0;}
    set.resizeWithoutConstraints(153,40);
    set.x=80+(index%8)*195;set.y=202+Math.floor(index/8)*132;
    const t=figma.createText();createdNodeIds.push(t.id);t.fontName={family:'Manrope',style:'Regular'};
    t.characters=icon.name;t.fontSize=12;t.fills=[paint('color/text/primary')];t.name='Icon label / '+icon.name;
    t.resize(186,25);t.x=set.x;t.y=set.y+49;
    createdSets.push({name:icon.name,id:set.id,variants:states.length});
  }
  return {pageId:page.id,createdNodeIds,mutatedNodeIds,createdSets,skipped};
}
