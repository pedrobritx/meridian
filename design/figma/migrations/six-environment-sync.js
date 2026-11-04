// Run once per environment. Substitute PALETTE and MODE_ID from the checked manifest
// and live collection inventory. Stable 0.5 collections and retired mode values stay intact.
const environment = __PALETTE__;
const modeId = '__MODE_ID__';
const collection = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:302:34');
const appearance = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:302:35');
const primitives = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:90');
if(!collection || !appearance || !primitives)throw Error('Expected Meridian collections missing');
const appModes=Object.fromEntries(appearance.modes.map(m=>[m.name,m.modeId]));
if(!appModes.Dawn||!appModes.Dusk)throw Error('Appearance contract changed');
const vars=await figma.variables.getLocalVariablesAsync('COLOR');
const byKey=new Map(vars.map(v=>[v.variableCollectionId+'/'+v.name,v]));
const changed=[];const created=[];
const rgba=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255,a:h.length===9?parseInt(h.slice(7,9),16)/255:1});
const semanticScopes=role=>role.startsWith('color/text/')||role.startsWith('color/link/')?['TEXT_FILL']:role.startsWith('color/border/')||role==='color/focus/ring'?['STROKE_COLOR']:['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];
for(const role of Object.keys(environment.modes.Dawn)){
 const semantic=byKey.get(collection.id+'/'+role);
 if(!semantic)throw Error('Missing semantic role '+role);
 const key='six-environments/'+environment.id+'/'+role;
 let app=byKey.get(appearance.id+'/'+key);
 if(!app){app=figma.variables.createVariable(key,appearance,'COLOR');app.scopes=semanticScopes(role);app.hiddenFromPublishing=true;created.push(app.id);}
 for(const mode of ['Dawn','Dusk']){
  const primitiveName='six-environments/'+environment.id+'/'+mode.toLowerCase()+'/'+role;
  let primitive=byKey.get(primitives.id+'/'+primitiveName);
  if(!primitive){primitive=figma.variables.createVariable(primitiveName,primitives,'COLOR');primitive.scopes=[];primitive.hiddenFromPublishing=true;created.push(primitive.id);}
  primitive.setValueForMode(primitives.defaultModeId,rgba(environment.modes[mode][role]));
  app.setValueForMode(appModes[mode],figma.variables.createVariableAlias(primitive));
  changed.push(primitive.id);
 }
 semantic.setValueForMode(modeId,figma.variables.createVariableAlias(app));
 const prefix=role.startsWith('ambient/')?'--md-env-'+role.slice(8).replaceAll('/','-'):'--md-'+role.replaceAll('/','-');
 semantic.setVariableCodeSyntax('WEB','var('+prefix+')');
 changed.push(app.id,semantic.id);
}
collection.renameMode(modeId,environment.name);
return {environment:environment.id,modeId,roles:39,createdVariableIds:created,mutatedVariableIds:[...new Set(changed)],mutatedCollectionIds:[collection.id]};
