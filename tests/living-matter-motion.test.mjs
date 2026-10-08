import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stepAttraction,anchorOffset} from '../lab/physics/attraction.mjs';

test('LM-04 attraction has bounded overshoot and eventually settles on the chosen anchor',()=>{
  const target=100;
  let state={position:0,velocity:0},overshot=false,settled=false;
  for(let n=0;n<300;n++){
    const next=stepAttraction(state,target,1/60);
    if(next.position>target+0.5)overshot=true;
    state={position:next.position,velocity:next.velocity};
    if(next.settled){settled=true;break;}
  }
  assert.ok(overshot,'Underdamped physical response should demonstrate inertia rather than easing only');
  assert.ok(settled,'Damped simulation must settle within a practical iteration count');
  assert.equal(state.position,target);
  assert.equal(state.velocity,0);
});
test('LM-04 fixed timestep limit and immediate zero-duration tick are safe',()=>{
  const state={position:12,velocity:4};
  const zero=stepAttraction(state,100,0);
  assert.equal(zero.position,12);
  assert.equal(zero.velocity,4);
  const bounded=stepAttraction(state,100,100);
  const maxStep=stepAttraction(state,100,1/30);
  assert.deepEqual(bounded,maxStep);
  assert.throws(()=>stepAttraction(state,Infinity,0.02),TypeError);
  assert.throws(()=>stepAttraction(state,20,0.02,{stiffness:-1}),RangeError);
});
test('LM-04 anchors are symmetric, responsive and input validated',()=>{
  assert.equal(anchorOffset('center',400),0);
  assert.equal(anchorOffset('west',400),-115);
  assert.equal(anchorOffset('east',400),115);
  assert.equal(anchorOffset('east',220),63);
  assert.equal(anchorOffset('west',220),-63);
  assert.throws(()=>anchorOffset('invalid',220),RangeError);
});
