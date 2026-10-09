/**
 * Meridian 0.6 Lab-only GitHub -> Figma Forest contract.
 * No stable Meridian 0.5 collection, component or token is writable here.
 */
export const FOREST_ROLES = Object.freeze([
  'page','surface','text','muted','border','action','onAction','focus',
  'sunlight','canopy','earth','ambient'
]);

const sameKeys=(a,b)=>JSON.stringify(Object.keys(a).sort())===JSON.stringify(Object.keys(b).sort());
const hexRe=/^#[0-9A-F]{6}$/;

export function validateForestContract(input,template) {
  if(!input||input.schemaVersion!==1||input.fileKey!==template.fileKey||
    input.pageId!==template.pageId||input.collectionName!==template.collectionName||
    input.source!=='lab/forest-reference/forest-model.js')
    throw Error('Forest contract file, page, collection or schema mismatch');
  if(!sameKeys(input.modes||{}, {Dawn:1,Dusk:1}))
    throw Error('Forest requires Dawn and Dusk modes only');
  const modes={};
  for(const mode of ['Dawn','Dusk']){
    const palette=input.modes[mode];
    if(!palette||!sameKeys(palette,Object.fromEntries(FOREST_ROLES.map(r=>[r,1]))))
      throw Error('Forest palette roles differ: '+mode);
    modes[mode]={};
    for(const role of FOREST_ROLES){
      const h=palette[role];
      if(typeof h!=='string'||!hexRe.test(h.toUpperCase()))
        throw Error('Invalid Forest colour: '+mode+'/'+role);
      modes[mode][role]=h.toUpperCase();
    }
  }
  if(!sameKeys(input.fields||{},template.fields||{}))
    throw Error('Forest text field names differ');
  const fields={};
  for(const name of Object.keys(template.fields).sort()){
    const field=input.fields[name],expected=template.fields[name];
    if(field?.nodeId!==expected.nodeId||field.pageId!==template.pageId||
      typeof field.value!=='string'||field.value.length>280||
      /[\x00-\x08\x0B\x0E-\x1F]/.test(field.value))
      throw Error('Forest text field not authorised: '+name);
    fields[name]={nodeId:expected.nodeId,pageId:template.pageId,value:field.value};
  }
  return {schemaVersion:1,fileKey:template.fileKey,pageId:template.pageId,
    collectionName:template.collectionName,source:input.source,modes,fields};
}

export function hexToFigmaColor(hex) {
  if(!hexRe.test(hex.toUpperCase()))throw Error('Invalid Forest hex');
  return {r:parseInt(hex.slice(1,3),16)/255,
    g:parseInt(hex.slice(3,5),16)/255,
    b:parseInt(hex.slice(5,7),16)/255,a:1};
}
export function figmaColorToHex(c) {
  if(!c||['r','g','b'].some(k=>!Number.isFinite(c[k])||c[k]<0||c[k]>1)||
    (c.a!==undefined && (!Number.isFinite(c.a)||c.a<.999)))
    throw Error('Forest requires an opaque direct colour value');
  return '#'+['r','g','b'].map(k=>Math.round(c[k]*255).toString(16).padStart(2,'0')).join('').toUpperCase();
}

export function planForestImport(remote,local,template) {
  const target=validateForestContract(remote,template);
  const now=validateForestContract(local,template);
  const values=[],texts=[];
  for(const mode of ['Dawn','Dusk'])
    for(const role of FOREST_ROLES)
      if(target.modes[mode][role]!==now.modes[mode][role])
        values.push({mode,role,from:now.modes[mode][role],to:target.modes[mode][role]});
  for(const name of Object.keys(target.fields))
    if(target.fields[name].value!==now.fields[name].value)
      texts.push({name,nodeId:target.fields[name].nodeId,
        from:now.fields[name].value,to:target.fields[name].value});
  return {values,texts};
}
