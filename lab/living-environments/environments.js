/**
 * Meridian Lab LM-H07 — optional, experimental environmental palettes.
 * Hex colours are hand-authored experiment data, NOT published Meridian semantic tokens.
 * No environment or brand combination is represented as validated for production.
 */
export const environments = Object.freeze({
  forest: {
    name:'Forest', note:'Organic foliage, moss and filtered woodland light.',
    light:{page:'#F0F4EE',surface:'#FFFFFF',text:'#203C31',muted:'#466455',border:'#A9C4B1',action:'#205D47',onAction:'#FFFFFF',sun:'#DEEBD4',mid:'#ADCDB4',deep:'#668E72',atmosphere:'#DDE9DB'},
    dark:{page:'#101E19',surface:'#1D3127',text:'#F3F9F1',muted:'#C7DFCC',border:'#779884',action:'#205D47',onAction:'#FFFFFF',sun:'#385E4A',mid:'#254D3A',deep:'#142E24',atmosphere:'#1C3C2B'}
  },
  ocean:{
    name:'Ocean',note:'Tidal blues, deep water and refracted coastal light.',
    light:{page:'#ECF5F5',surface:'#FFFFFF',text:'#173A48',muted:'#3A6370',border:'#98BBC7',action:'#155A72',onAction:'#FFFFFF',sun:'#C6EBE9',mid:'#84C1C4',deep:'#477F9B',atmosphere:'#DFEFF0'},
    dark:{page:'#0E1F2A',surface:'#1A3340',text:'#F0F9F9',muted:'#C4E0E5',border:'#648A9A',action:'#155A72',onAction:'#FFFFFF',sun:'#326875',mid:'#1F4C64',deep:'#122C40',atmosphere:'#1C3A4B'}
  },
  desert:{
    name:'Desert',note:'Warm mineral pigments, sunlit sand and weathered clay.',
    light:{page:'#FAF2E9',surface:'#FFFDF9',text:'#4C2F20',muted:'#745845',border:'#C5AA8B',action:'#734321',onAction:'#FFFFFF',sun:'#F5DBB4',mid:'#DFB887',deep:'#C18C67',atmosphere:'#F7E8D5'},
    dark:{page:'#261A15',surface:'#39291F',text:'#FFF4E5',muted:'#E7CFB1',border:'#A28363',action:'#734321',onAction:'#FFFFFF',sun:'#7B5434',mid:'#563C2B',deep:'#38251F',atmosphere:'#443022'}
  },
  alpine:{
    name:'Alpine',note:'Cool stone, pale mist and high-altitude blue.',
    light:{page:'#F0F3F4',surface:'#FFFFFF',text:'#283A4C',muted:'#53677A',border:'#AFBECC',action:'#3A536C',onAction:'#FFFFFF',sun:'#DAE6EC',mid:'#ACCAD4',deep:'#7897AE',atmosphere:'#E7EEF0'},
    dark:{page:'#15202B',surface:'#273543',text:'#F3F8FB',muted:'#CDDAE5',border:'#8798A9',action:'#3A536C',onAction:'#FFFFFF',sun:'#536A7D',mid:'#364F61',deep:'#223B4D',atmosphere:'#314250'}
  },
  storm:{
    name:'Storm',note:'Slate clouds, diffuse rain and atmospheric contrast.',
    light:{page:'#EDF0F4',surface:'#FFFFFF',text:'#292F42',muted:'#535E74',border:'#A7B1C2',action:'#414B66',onAction:'#FFFFFF',sun:'#DCE0EA',mid:'#ADB8CB',deep:'#778AA2',atmosphere:'#E2E8ED'},
    dark:{page:'#151A26',surface:'#252C3F',text:'#F4F6FD',muted:'#CED7E9',border:'#8594AD',action:'#414B66',onAction:'#FFFFFF',sun:'#58657E',mid:'#3D4C68',deep:'#28374E',atmosphere:'#2A354D'}
  },
  celestial:{
    name:'Celestial',note:'Indigo twilight, mineral violet and evening sky.',
    light:{page:'#F3EFF7',surface:'#FFFFFF',text:'#342842',muted:'#695677',border:'#B9A8C6',action:'#553D74',onAction:'#FFFFFF',sun:'#E6DDF5',mid:'#C7B3DB',deep:'#9B80BB',atmosphere:'#EEE7F4'},
    dark:{page:'#1D182A',surface:'#2E2640',text:'#FAF6FF',muted:'#DFD2ED',border:'#9381AC',action:'#553D74',onAction:'#FFFFFF',sun:'#665482',mid:'#423359',deep:'#302243',atmosphere:'#37274D'}
  }
});

export const identities = Object.freeze({
  environment:{name:'Environment-led',accent:null,mark:'M'},
  wine:{name:'Independent wine brand',accent:'#71334D',mark:'W'},
  ink:{name:'Independent ink brand',accent:'#31475C',mark:'I'}
});

// WCAG relative luminance, computed from opaque colours in this exploratory registry.
// Composited glass surfaces require separate manual and screenshot-based checks.
export function contrastRatio(a,b){
  const lum=hex=>{
    const values=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
    const [r,g,blue]=values.map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);
    return r*0.2126+g*0.7152+blue*0.0722;
  };
  const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
