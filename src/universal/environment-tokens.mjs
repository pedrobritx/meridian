/**
 * Living Environments 0.6: independent semantic palette layer.
 * Forest/Desert are exact copies of existing Grass/Paper colour roles.
 * This is opt-in until a documented, accessible stable release.
 */
export const APPEARANCES=Object.freeze(['Dawn','Dusk']);
export const ENVIRONMENT_NAMES=Object.freeze(['Forest','Desert','Aurora','Glacier','Embers']);
const color=/^#[0-9A-F]{6}(?:[0-9A-F]{2})?$/i;
export function validateEnvironmentManifest(input){
 if(input?.schemaVersion!==1||!Array.isArray(input.environments)||
 input.environments.length!==ENVIRONMENT_NAMES.length)throw Error('Unexpected environment contract');
 const result={...input,environments:[]};
 let keys=null;
 for(let i=0;i<input.environments.length;i++){
  const env=input.environments[i];
  if(env.name!==ENVIRONMENT_NAMES[i]||env.id!==env.name.toLowerCase())
    throw Error('Environment identifiers changed: '+i);
  if(!env.modes||Object.keys(env.modes).sort().join(',')!=='Dawn,Dusk')
    throw Error('Dawn and Dusk required: '+env.name);
  const modes={};
  for(const mode of APPEARANCES){
   const src=env.modes[mode];
   const names=Object.keys(src||{}).sort();
   if(names.length!==39)throw Error('Expected 39 semantic/decorative roles: '+env.name+'/'+mode);
   if(keys&&names.join('|')!==keys.join('|'))throw Error('Different semantic roles across environments');
   keys=names;
   for(const [name,value]of Object.entries(src)){
    if(!/^(color|ambient)\/[a-z0-9/-]+$/.test(name)||!color.test(value))
      throw Error('Invalid role value: '+env.name+'/'+mode+'/'+name);
   }
   modes[mode]={...src};
  }
  result.environments.push({...env,modes});
 }
 return result;
}
export function hexToCss(value){
 if(!color.test(value))throw Error('Unexpected environment colour');
 const [r,g,b]=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16));
 const alpha=value.length===9?(parseInt(value.slice(7,9),16)/255).toFixed(4):'1';
 return 'rgb('+r+' '+g+' '+b+' / '+alpha+')';
}
export function environmentCss(source){
 const doc=validateEnvironmentManifest(source);
 const lines=['/* Generated from design/meridian/living-environments.json; experimental and opt-in. */'];
 for(const env of doc.environments)for(const appearance of APPEARANCES){
  const selector='[data-meridian][data-meridian-environment="'+env.id+'"]'+
    (appearance==='Dusk'?'[data-theme="dark"]':':not([data-theme="dark"])');
  lines.push(selector+' {');
  lines.push('  color-scheme: '+(appearance==='Dusk'?'dark':'light')+';');
  for(const [name,value]of Object.entries(env.modes[appearance])){
   const prefix=name.startsWith('ambient/')?'--md-env-':'--md-';
   const role=name.startsWith('ambient/')?name.slice(8):name;
   lines.push('  '+prefix+role.replaceAll('/','-')+': '+hexToCss(value)+';');
  }
  lines.push('}','');
 }
 return lines.join('\n');
}
export function contrastRatio(a,b){
 const luminance=hex=>{
  const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
   .map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
  return .2126*r+.7152*g+.0722*b;
 };
 const [x,y]=[a,b].map(luminance);
 return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
