/**
 * Meridian Lab 0.6 — Forest-first reference semantics.
 * EXPERIMENTAL. Not exported from stable Meridian 0.5 tokens or component APIs.
 * Adopting applications own event records, authoritative operations, read-state
 * persistence, cross-device reconciliation and notification delivery.
 */
export const forestPalettes = Object.freeze({
  dawn: Object.freeze({
    page:'#EDF1E6', surface:'#FCFDF8', text:'#243B2E', muted:'#435B49',
    border:'#94AB97', action:'#22583E', onAction:'#FFFFFF', focus:'#22583E',
    sunlight:'#E7E2B8', canopy:'#9CB8A1', earth:'#70886B', ambient:'#D6E4D0'
  }),
  dusk: Object.freeze({
    page:'#293B33', surface:'#354D40', text:'#F8F6E9', muted:'#E1E8D9',
    border:'#A6B7A4', action:'#F0D7A6', onAction:'#253A30', focus:'#FFE0A2',
    sunlight:'#C5A477', canopy:'#6E967D', earth:'#476C57', ambient:'#4B6556'
  })
});

export const EXPOSURE_MS = 1000;
export const INTERRUPTION_MS = 500;

export function resolveForestMode(choice, systemDark=false) {
  return choice==='system' ? (systemDark?'dusk':'dawn') : choice==='dusk'?'dusk':'dawn';
}
export function contrastRatio(foreground, background) {
  const luminance=hex=>{
    const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
      .map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
    return .2126*r+.7152*g+.0722*b;
  };
  const a=luminance(foreground),b=luminance(background);
  return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}

/**
 * Unread and pending are independent: history can be unread while workspace is
 * All clear. These sample records only model application-owned state.
 */
export function deriveNotificationStatus(records) {
  const unread=records.filter(record=>record.unread===true).length;
  const pending=records.filter(record=>record.kind==='action' && record.state==='pending').length;
  return {unread,pending,allClear:pending===0};
}

/** Distinguish a real semantic update from visual or timestamp-format changes. */
export function changesEventMeaning(previous,next) {
  return ['revision','description','source','eventType','occurredAt'].some(
    key=>previous[key]!==next[key] && Object.hasOwn(next,key)
  );
}
export function applyEventRevision(previous, patch) {
  const next={...previous,...patch};
  if(changesEventMeaning(previous,patch)) next.unread=true;
  // Deliberately unread items stay unread until intentional acknowledgement.
  if(previous.explicitUnread===true) {
    next.unread=true;
    next.explicitUnread=true;
  }
  return next;
}

/**
 * Never acknowledge from DOM focus alone, background tab focus, a collapsed
 * history, or an animation transiting the viewport. Accessible-navigation
 * encounters require the history to be open and the document to be active.
 */
export function canAcknowledgeHistory({
  active=false,historyOpen=false,method='visual',meaningfulExposureMs=0,
  essentialVisible=false,rapidScroll=false,substantialDisplacement=false,
  explicitUnread=false
}={}) {
  if(!active || !historyOpen) return false;
  if(method==='explicit') return true;
  if(explicitUnread) return false;
  if(method==='accessible-navigation') return true;
  return method==='visual' && essentialVisible && !rapidScroll &&
    !substantialDisplacement && meaningfulExposureMs>=EXPOSURE_MS;
}

export function acknowledgeHistory(record,context) {
  if(!canAcknowledgeHistory(context)) return record;
  return {...record,unread:false,explicitUnread:false};
}
