/**
 * Illustrative product identities for the Environment Patterns Lab, derived from
 * the stable 0.5 profile tokens (design/figma/generated/tokens.json). They are
 * product accents laid over an environment, not new environments.
 */
import tokens from '../../design/figma/generated/tokens.json' with {type:'json'};

const hex=v=>'#'+['r','g','b'].map(k=>Math.round(v[k]*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const pair=mode=>{
 const m=tokens.modes[mode];
 return {primary:hex(m['color/action/primary'].value),onPrimary:hex(m['color/action/on-primary'].value),
  hover:hex(m['color/action/hover'].value),secondary:hex(m['color/action/secondary'].value)};
};
export const identities=Object.freeze({
 lexis:{name:'Lexis',profile:'paper',mark:'book',Dawn:pair('PaperDawn'),Dusk:pair('PaperDusk')},
 verbalis:{name:'Verbalis',profile:'parallel',mark:'segments',Dawn:pair('ParallelDawn'),Dusk:pair('ParallelDusk')}
});
