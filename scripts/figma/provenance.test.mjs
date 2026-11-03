import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { captureFromSource, applyOverrides, provenanceOverrides } from "./provenance.mjs";

const read = async (p) => JSON.parse(await readFile(new URL(p, import.meta.url), "utf8"));
const captured = captureFromSource(await read("../../design/figma/generated/figma-source.json"));
const meta = { source: "Plugin publication 2026-11-02", decision: "Published from Figma for review" };

test("ledger records uniform changes once and per-appearance changes per mode", () => {
  const bundle = structuredClone(captured);
  for (const mode of Object.values(bundle.modes)) mode["radius/xs"].value = 6;
  bundle.modes.PaperDusk["spacing/1"].value = 5;
  const ledger = provenanceOverrides(captured, bundle, { schemaVersion: 1, overrides: [] }, meta);
  assert.deepEqual(ledger.overrides.map((e) => [e.token, e.modes]), [["radius/xs", "all"], ["spacing/1", { PaperDusk: 5 }]]);
  assert.deepEqual(applyOverrides(captured, ledger), bundle);
});

test("unchanged entries keep their original source; stale and unknown entries fail", () => {
  const bundle = structuredClone(captured);
  for (const mode of Object.values(bundle.modes)) mode["radius/xs"].value = 6;
  const first = provenanceOverrides(captured, bundle, { schemaVersion: 1, overrides: [] }, { source: "GitHub edit", decision: "ADR" });
  const second = provenanceOverrides(captured, bundle, first, meta);
  assert.equal(second.overrides[0].source, "GitHub edit");
  const stale = { schemaVersion: 1, overrides: [{ token: "radius/xs", modes: "all", value: captured.modes.Dawn["radius/xs"].value, source: "x", decision: "y" }] };
  assert.throws(() => applyOverrides(captured, stale), /Stale override/);
  assert.throws(() => applyOverrides(captured, { schemaVersion: 1, overrides: [{ token: "nope", modes: "all", value: 1, source: "x", decision: "y" }] }), /unknown token/);
});
