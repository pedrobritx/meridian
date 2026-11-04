/**
 * Provenance ledger. design/figma/generated/figma-source.json is a native Figma capture taken
 * with full variable access; it is not refreshed by every publication. provenance-overrides.json
 * records every token value that is newer than that capture, per token and appearance, with
 * where it came from. The contract test requires the ledger to be exact: capture + ledger = tokens.
 */
import { captureNativeTokens, signature, modes } from "./roundtrip.mjs";

export function captureFromSource(source) {
  const variables = source.collections.flatMap((c) => c.variables.map((v) =>
    ({ ...v, variableCollectionId: c.id, resolvedType: v.type, valuesByMode: v.values })));
  return captureNativeTokens(source.collections, variables);
}
const targets = (entry) => entry.modes === "all"
  ? modes.map((mode) => [mode, entry.value])
  : Object.entries(entry.modes);

export function applyOverrides(captured, ledger) {
  if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger.overrides)) throw Error("Unexpected provenance ledger");
  const result = structuredClone(captured);
  for (const entry of ledger.overrides) {
    if (!entry.source || !entry.decision) throw Error("Override needs a source and a decision: " + entry.token);
    for (const [mode, value] of targets(entry)) {
      const token = result.modes[mode]?.[entry.token];
      if (!token) throw Error("Override targets an unknown token or appearance: " + entry.token + " / " + mode);
      if (signature(token.value) === signature(value)) throw Error("Stale override, remove it: " + entry.token + " / " + mode);
      result.modes[mode][entry.token] = { ...token, value };
    }
  }
  return result;
}

export function provenanceOverrides(captured, bundle, ledger, meta) {
  const previous = new Map((ledger?.overrides ?? []).map((e) => [e.token, e]));
  const overrides = [];
  for (const token of Object.keys(bundle.modes[modes[0]]).sort()) {
    const changed = modes.filter((m) => signature(captured.modes[m][token].value) !== signature(bundle.modes[m][token].value));
    if (!changed.length) continue;
    const values = changed.map((m) => bundle.modes[m][token].value);
    const uniform = changed.length === modes.length && values.every((v) => signature(v) === signature(values[0]));
    const entry = uniform
      ? { token, modes: "all", value: values[0] }
      : { token, modes: Object.fromEntries(changed.map((m) => [m, bundle.modes[m][token].value])) };
    const prior = previous.get(token);
    const same = prior && signature({ modes: prior.modes, value: prior.value }) === signature({ modes: entry.modes, value: entry.value });
    overrides.push(same ? prior : { ...entry, source: meta.source, decision: meta.decision });
  }
  return { ...ledger, schemaVersion: 1, overrides };
}
