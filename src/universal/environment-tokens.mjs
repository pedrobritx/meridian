/**
 * Living Environments 0.6: independent semantic palette layer.
 * Forest/Desert are exact copies of existing Grass/Paper colour roles.
 * Order follows the Figma collection Meridian / Environment (VariableCollectionId:302:34).
 * This is opt-in until a documented, accessible stable release.
 */
export const APPEARANCES=Object.freeze(['Dawn','Dusk']);
export const ENVIRONMENT_NAMES=Object.freeze(['Forest','Core','Desert','Ocean','Alpine','Storm','Celestial','Aurora','Glacier','Embers']);
export const ENVIRONMENT_NAMES=Object.freeze(['Prism','Forest','Desert','Ocean','Aurora','Canyon']);
export const ENVIRONMENT_STATUSES=Object.freeze(['candidate','preview']);
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
  if(!ENVIRONMENT_STATUSES.includes(env.status))throw Error('Unknown environment status: '+env.name);
  if(!Array.isArray(env.knownContrastFailures))throw Error('knownContrastFailures list required: '+env.name);
  if((env.status==='preview')!==(env.knownContrastFailures.length>0))
    throw Error('Preview status must match recorded contrast failures: '+env.name);
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
export function environmentCss(source,compatibility){
 const doc=validateEnvironmentManifest(source);
 const lines=['/* Generated from design/meridian/living-environments.json; experimental and opt-in. */'];
 const retired=compatibility?.environments.filter(e=>!doc.environments.some(n=>n.id===e.id))??[];
 for(const env of [...doc.environments,...retired])for(const appearance of APPEARANCES){
  const base='[data-meridian][data-meridian-environment="'+env.id+'"]';
  // Dusk also honours the stable 0.5 `.dark` class boundary, so a profile and its
  // environment never resolve different appearances on the same element.
  const selector=appearance==='Dusk'
    ?base+'[data-theme="dark"], '+base+'.dark:not([data-theme="light"])'
    :base+':not([data-theme="dark"])';
  lines.push(selector+' {');
  lines.push('  color-scheme: '+(appearance==='Dusk'?'dark':'light')+';');
  for(const [name,value]of Object.entries(env.modes[appearance])){
   const prefix=name.startsWith('ambient/')?'--md-env-':'--md-';
   const role=name.startsWith('ambient/')?name.slice(8):name;
   lines.push('  '+prefix+role.replaceAll('/','-')+': '+hexToCss(value)+';');
  }
  // Selection follows the environment palette without extending legacy colour roles.
  lines.push('  --md-color-selection-background: var(--md-color-bg-sunken);');
  lines.push('  --md-color-selection-foreground: var(--md-color-text-primary);');
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
function rgba(value){
 if(!color.test(value))throw Error('Unexpected environment colour');
 return [1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255).concat(value.length===9?parseInt(value.slice(7,9),16)/255:1);
}
function ratioOf(a,b){
 const luminance=c=>[.2126,.7152,.0722].reduce((sum,w,i)=>sum+w*(c[i]<=.04045?c[i]/12.92:((c[i]+.055)/1.055)**2.4),0);
 const [x,y]=[a,b].map(luminance);
 return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
/**
 * The pair set used by scripts/build-contrast-report.mjs for 0.5 tokens, applied to one
 * environment appearance: text, links and controls on every opaque surface, status pairs,
 * action labels, and button glass composited over each surface and over black and white.
 */
export function environmentContrastPairs(roles){
 const pairs=[];
 const pair=(foreground,background,minimum,backdrop=rgba(roles[background]))=>{
  const ratio=ratioOf(rgba(roles[foreground]),backdrop);
  pairs.push({foreground,background,ratio:Number(ratio.toFixed(4)),minimum,pass:ratio>=minimum});
 };
 const surfaces=['page','surface','sunken','overlay'].map(x=>'color/bg/'+x);
 for(const bg of surfaces){
  for(const fg of ['text/primary','text/secondary','text/muted','link/default','action/secondary'])pair('color/'+fg,bg,4.5);
  for(const fg of ['border/control','focus/ring'])pair('color/'+fg,bg,3);
 }
 for(const status of ['success','warning','error','info'])pair('color/status/'+status,'color/status/'+status+'-bg',4.5);
 for(const state of ['primary','hover','active'])pair('color/action/on-primary','color/action/'+state,4.5);
 pair('color/action/on-destructive','color/action/destructive',4.5);
 const backdrops=Object.fromEntries(surfaces.map(bg=>[bg,rgba(roles[bg])]));
 Object.assign(backdrops,{black:[0,0,0,1],white:[1,1,1,1]});
 for(const glass of ['color/button/glass','color/button/glass-hover'])for(const [name,backdrop]of Object.entries(backdrops)){
  const tint=rgba(roles[glass]);
  const composite=[0,1,2].map(i=>tint[i]*tint[3]+backdrop[i]*(1-tint[3]));
  for(const [fg,min]of [['color/action/secondary',4.5],['color/border/control',3],['color/focus/ring',3]])
   pair(fg,glass+' over '+name,min,composite);
 }
 return pairs;
}
