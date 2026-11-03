import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {libraryData} from '../scripts/build-site-data.mjs';
import {markdown} from '../src/markdown.js';

test('site/library.json is reproducible from the Figma export and covers all 62 components once',async()=>{
  const committed=JSON.parse(await readFile(new URL('../site/library.json',import.meta.url),'utf8'));
  assert.deepEqual(committed,await libraryData());
  const ids=committed.groups.flatMap(g=>g.components.map(c=>c.id));
  assert.equal(ids.length,62);
  assert.equal(new Set(ids).size,62);
  assert.ok(committed.groups.flatMap(g=>g.components).every(c=>c.screenshot));
});

test('changelog Markdown is escaped before formatting and only https links become links',()=>{
  const html=markdown('## Release <b>\n- Use `a<b>` and **bold** [ok](https://example.com) [no](javascript:alert(1))');
  assert.match(html,/<h2>Release &lt;b&gt;<\/h2>/);
  assert.match(html,/<code>a&lt;b&gt;<\/code>/);
  assert.match(html,/<a class="md-link" href="https:\/\/example.com">ok<\/a>/);
  assert.doesNotMatch(html,/href="javascript/);
});
