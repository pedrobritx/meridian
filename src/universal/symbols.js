import universalSymbols from '../../design/meridian/universal-symbols.json' with {type: "json"};
import {paths as coreIcons} from '../icons.js';
const universal=Object.fromEntries(universalSymbols.icons.map(({name,path})=>[name,path]));
export const symbolPaths=Object.freeze({...coreIcons,...universal});
export const symbolNames=Object.freeze(Object.keys(symbolPaths).sort());
export function iconMarkup(name,{size=20,accessibleName=null}={}) {
  if(!Number.isInteger(size)||size<12||size>128)throw Error('Invalid symbol size');
  const path=symbolPaths[name];
  if(!path)throw Error('Unknown Meridian symbol: '+name);
  // The path strings are repository-owned, SVG-only markup. Catalog CI guards
  // against scripts, event handlers and external URLs.
  const label=accessibleName?String(accessibleName).replace(/[&<>"']/g,''):'';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" '+
    (label?'role="img" aria-label="'+label+'"':'aria-hidden="true"')+'>'+path+'</svg>';
}
