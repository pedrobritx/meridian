/**
 * Environment Patterns (Lab, PROPOSED): resolves independent Meridian settings
 * into boundary attributes. Environment, Appearance, Product identity, Material
 * and Motion stay orthogonal; accessibility constraints are applied last.
 * This is an illustrative model for review, not a stable API.
 */
import {contrastRatio} from '../../src/universal/environment-tokens.mjs';

export const ENVIRONMENTS=Object.freeze(['prism', 'forest', 'desert', 'ocean', 'aurora', 'canyon']);
export const APPEARANCE_CHOICES=Object.freeze(['system','dawn','dusk']);
export const MATERIALS=Object.freeze(['opaque','glass']);
export const MOTIONS=Object.freeze(['system','reduced','expressive']);

export function resolveAppearance(choice,systemDark){
 if(!APPEARANCE_CHOICES.includes(choice))throw Error('Unknown appearance choice: '+choice);
 return choice==='system'?(systemDark?'Dusk':'Dawn'):choice==='dusk'?'Dusk':'Dawn';
}

export function environmentPalette(manifest,environment,appearance){
 const env=manifest.environments.find(x=>x.id===environment);
 if(!env)throw Error('Unknown environment: '+environment);
 return env.modes[appearance];
}

/** Product identity pairs must hold in the environment they land in. */
export function validateIdentity(pair,palette){
 const failures=[];
 const check=(label,a,b,min)=>{const ratio=contrastRatio(a,b);if(ratio<min)failures.push({label,ratio:+ratio.toFixed(2),min});};
 check('on-primary on primary',pair.onPrimary,pair.primary,4.5);
 if(pair.hover)check('on-primary on hover',pair.onPrimary,pair.hover,4.5);
 if(pair.secondary)check('secondary text on surface',pair.secondary,palette['color/bg/surface'],4.5);
 check('primary boundary on page',pair.primary,palette['color/bg/page'],3);
 return {ok:failures.length===0,failures};
}

export function resolveContext(context,{manifest,identities={},systemDark=false,system={}}){
 const environment=context.environment??'prism';
 if(!ENVIRONMENTS.includes(environment))throw Error('Unknown environment: '+environment);
 const appearance=resolveAppearance(context.appearance??'system',systemDark);
 const palette=environmentPalette(manifest,environment,appearance);
 const identity=context.identity?identities[context.identity]:null;
 const attributes={
  'data-meridian':identity?.profile??context.productProfile??'core',
  'data-meridian-environment':environment,
  'data-theme':appearance==='Dusk'?'dark':'light',
  'data-material':MATERIALS.includes(context.material)?context.material:'opaque',
  'data-motion':MOTIONS.includes(context.motion)?context.motion:'system'
 };
 const style={'--md-ambient-intensity':String(Math.min(1,Math.max(0,Number(context.ambientIntensity??.6))))};
 const warnings=[];
 if(context.identity&&!identity)warnings.push('Unknown product identity: '+context.identity);
 if(identity){
  const pair=identity[appearance];
  const result=validateIdentity(pair,palette);
  if(result.ok){
   style['--md-color-action-primary']=pair.primary;
   style['--md-color-action-on-primary']=pair.onPrimary;
   if(pair.hover)style['--md-color-action-hover']=pair.hover;
   if(pair.secondary)style['--md-color-action-secondary']=pair.secondary;
  }else warnings.push(identity.name+' accent kept out of '+environment+' '+appearance+': '+result.failures.map(f=>f.label+' '+f.ratio+':1').join(', '));
 }
 // Accessibility outranks decoration: system requests override the chosen material and motion.
 if(system.reducedTransparency||system.increasedContrast||system.forcedColors)attributes['data-material']='opaque';
 if(system.reducedMotion&&attributes['data-motion']!=='reduced')attributes['data-motion']='reduced';
 return {environment,appearance,attributes,style,warnings};
}
