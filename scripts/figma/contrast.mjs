/** WCAG 2.x contrast pairs for the 0.5 token contract (tokens.json), all twelve appearances. */
const luminance = c => ['r','g','b'].reduce((sum,key,i) => {
  const n=c[key], linear=n<=.04045?n/12.92:((n+.055)/1.055)**2.4;
  return sum+linear*[.2126,.7152,.0722][i];
},0);
const ratio = (a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
export function contrastReport(bundle) {
const report=[];
for (const [mode,t] of Object.entries(bundle.modes)) {
  const pair=(foreground,background,minimum,bg=t[background].value) => {
    const value=ratio(t[foreground].value,bg);
    report.push({mode,foreground,background,ratio:Number(value.toFixed(4)),minimum,pass:value>=minimum});
  };
  for (const bg of ['page','surface','sunken','overlay']) {
    for (const fg of ['text/primary','text/secondary','text/muted','link/default','action/secondary']) pair('color/'+fg,'color/bg/'+bg,4.5);
    for (const fg of ['border/control','focus/ring']) pair('color/'+fg,'color/bg/'+bg,3);
  }
  for (const status of ['success','warning','error','info']) pair('color/status/'+status,'color/status/'+status+'-bg',4.5);
  for (const state of ['primary','hover','active']) pair('color/action/on-primary','color/action/'+state,4.5);
  pair('color/action/on-destructive','color/action/destructive',4.5);
  const backgrounds=Object.fromEntries(['page','surface','sunken','overlay'].map(bg=>['color/bg/'+bg,t['color/bg/'+bg].value]));
  Object.assign(backgrounds,{black:{r:0,g:0,b:0},white:{r:1,g:1,b:1}});
  for (const glass of ['color/button/glass','color/button/glass-hover']) for (const [name,bg] of Object.entries(backgrounds)) {
    const tint=t[glass].value;
    const composite=Object.fromEntries(['r','g','b'].map(c=>[c,tint[c]*tint.a+bg[c]*(1-tint.a)]));
    for (const [fg,min] of [['color/action/secondary',4.5],['color/border/control',3],['color/focus/ring',3]]) pair(fg,glass+' over '+name,min,composite);
  }
}
return report;
}
