import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Offline check of every Figma node ID the repo references, against design/figma/links.json,
// a snapshot taken from the Figma file. A new ID fails until the snapshot is re-checked.
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const links=JSON.parse(await read('design/figma/links.json'));
const patterns=[/node-id=(\d+)[-:](\d+)/g,/node-id=(\d+)%3A(\d+)/g,/"(?:nodeId|pageId|node|id|startNode|figmaPage|page|frame)"\s*:\s*"(\d+):(\d+)"/g];
async function idsIn(file){
  const text=await read(file), ids=new Set();
  for(const p of patterns)for(const m of text.matchAll(p))ids.add(m[1]+':'+m[2]);
  if(file==='design/figma/config.json')for(const id of Object.values(JSON.parse(text).frames))ids.add(id);
  return [...ids];
}
const known=new Set(links.known),missing=new Set(links.missing),archived=new Set(links.archived);

test('every Figma node ID in live and working files is known, present and allowed',async()=>{
  for(const [kind,files] of [['live',links.policy.live],['allowArchived',links.policy.allowArchived]])
    for(const file of files)for(const id of await idsIn(file)){
      assert.ok(known.has(id),`${file}: ${id} is not in design/figma/links.json; re-check the Figma file`);
      assert.ok(!missing.has(id),`${file}: ${id} no longer exists in Figma`);
      if(kind==='live')assert.ok(!archived.has(id),`${file}: ${id} sits on an archive page`);
    }
});

test('the link snapshot covers historical files and keeps its lists consistent',async()=>{
  for(const file of links.policy.historical)for(const id of await idsIn(file))assert.ok(known.has(id),`${file}: ${id}`);
  for(const id of [...missing,...archived])assert.ok(known.has(id),id);
  for(const id of missing)assert.ok(!archived.has(id),id);
});
