import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  forestPalettes,contrastRatio,resolveForestMode,deriveNotificationStatus,
  canAcknowledgeHistory,acknowledgeHistory,applyEventRevision,
  EXPOSURE_MS,INTERRUPTION_MS
} from '../lab/forest-reference/forest-model.js';

test('Forest Dawn and Dusk roles maintain opaque text and action contrast',()=>{
  for(const [name,p] of Object.entries(forestPalettes)){
    for(const [label,fg,bg] of [
      ['essential text',p.text,p.surface],
      ['secondary text',p.muted,p.surface],
      ['action text',p.onAction,p.action]
    ])assert.ok(contrastRatio(fg,bg)>=4.5,name+' '+label);
  }
  assert.equal(resolveForestMode('system',false),'dawn');
  assert.equal(resolveForestMode('system',true),'dusk');
  assert.equal(resolveForestMode('dawn',true),'dawn');
  assert.equal(resolveForestMode('dusk',false),'dusk');
});

test('unread historical events do not create pending actions',()=>{
  assert.deepEqual(deriveNotificationStatus([
    {kind:'history',unread:true},
    {kind:'history',unread:true},
    {kind:'action',unread:false,state:'resolved'}
  ]),{unread:2,pending:0,allClear:true});
  assert.deepEqual(deriveNotificationStatus([
    {kind:'history',unread:true},
    {kind:'action',unread:true,state:'pending'}
  ]),{unread:2,pending:1,allClear:false});
});

test('visual history encounter requires a foreground, open history and meaningful exposure',()=>{
  const valid={active:true,historyOpen:true,method:'visual',essentialVisible:true,meaningfulExposureMs:EXPOSURE_MS};
  assert.equal(EXPOSURE_MS,1000);
  assert.equal(INTERRUPTION_MS,500);
  assert.equal(canAcknowledgeHistory(valid),true);
  for(const change of [
    {active:false},{historyOpen:false},{essentialVisible:false},
    {meaningfulExposureMs:999},{rapidScroll:true},{substantialDisplacement:true},
    {explicitUnread:true}
  ])assert.equal(canAcknowledgeHistory({...valid,...change}),false,JSON.stringify(change));
  assert.equal(canAcknowledgeHistory({active:true,historyOpen:true,method:'accessible-navigation'}),true);
  assert.equal(canAcknowledgeHistory({active:false,historyOpen:true,method:'accessible-navigation'}),false);
  assert.equal(canAcknowledgeHistory({active:true,historyOpen:true,method:'explicit',explicitUnread:true}),true);
});

test('metadata formatting alone does not create unread revisions; meaningful updates do',()=>{
  const original={id:'x',kind:'history',source:'App',description:'Export finished',eventType:'Export',
    occurredAt:'2026-10-08T12:00:00Z',revision:1,unread:false,explicitUnread:false};
  assert.equal(applyEventRevision(original,{formattedTime:'12:00'}).unread,false);
  assert.equal(applyEventRevision(original,{description:'Export failed',revision:2}).unread,true);
  assert.equal(applyEventRevision(original,{revision:2}).unread,true);
  assert.equal(applyEventRevision({...original,unread:true,explicitUnread:true},{formattedTime:'12:00'}).unread,true);
  assert.equal(acknowledgeHistory({...original,unread:true},{active:false,historyOpen:true,method:'explicit'}).unread,true);
  assert.equal(acknowledgeHistory({...original,unread:true},{active:true,historyOpen:true,method:'explicit'}).unread,false);
  assert.equal(acknowledgeHistory({...original,unread:true,explicitUnread:true},
    {active:true,historyOpen:true,method:'visual',essentialVisible:true,meaningfulExposureMs:1500,explicitUnread:true}).unread,true);
});
