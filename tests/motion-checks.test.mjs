import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const bundle=JSON.parse(await read('../design/figma/generated/tokens.json'));

// Governance: "Immediate contact, gentle settling". Feedback above ~100 ms stops feeling instant.
test('contact feedback stays at or below 100 ms in every appearance',()=>{
  for(const [mode,tokens] of Object.entries(bundle.modes)){
    const contact=tokens['motion/duration/contact'].value;
    assert.ok(contact<=100,mode+' contact '+contact+'ms');
    assert.ok(tokens['motion/duration/release'].value>=contact,mode+' release settles after contact');
  }
});

// Reduced motion keeps state changes visible but removes spatial movement.
test('reduced motion removes transitions, animation and press transforms',async()=>{
  const css=(await read('../styles/components.css')).replace(/\s+/g,'');
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\*,\*::before,\*::after\{[^}]*transition:none!important;animation:none!important\}\}/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.md-button:not\(:disabled\):active,\.md-list-row:active\{transform:none\}\}/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.md-button\[data-state="pressed"\]\{transform:none\}\}/);
});
