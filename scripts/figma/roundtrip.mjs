import { validateTokens, profiles, profileForMode } from "./token-contract.mjs";
export const modes = profiles.flatMap(p => [p.light, p.dark]);
export const fileKey = "aJ2f6aYX9KBucAdPsCmkXn";
export function modeForCollection(collection, theme) {
  const profile = profileForMode(theme);
  const match = collection.modes.find(m => m.name === profile.nativeName || m.name === theme)
    || collection.modes.find(m => m.name === profile.name);
  if (match) return match;
  if (collection.modes.length === 1 && !["Meridian / Colour", "Meridian / Project Colour", "Meridian / Layout", "Meridian / Motion"].includes(collection.name)) return collection.modes[0];
  throw Error("Missing profile mode in " + collection.name);
}
function semanticForMode(variables, collections, theme) {
  const colour = profileForMode(theme).projectColour ? "Meridian / Project Colour" : "Meridian / Colour";
  return variables.filter(v => {
    const name = collections[v.variableCollectionId]?.name;
    return name?.startsWith("Meridian /") && name !== "Meridian / Primitives"
      && (!name.endsWith("Colour") || name === colour)
      && ["COLOR", "FLOAT", "STRING"].includes(v.resolvedType);
  });
}
export function validateContent(content, template) {
  if (content?.schemaVersion !== 1 || content.fileKey !== fileKey)
    throw Error("Wrong shared-content file/schema");
  const names = Object.keys(template.fields).sort();
  if (
    JSON.stringify(Object.keys(content.fields ?? {}).sort()) !==
    JSON.stringify(names)
  )
    throw Error("Shared-content fields differ");
  const fields = {};
  for (const name of names) {
    const field = content.fields[name],
      expected = template.fields[name];
    if (
      field.nodeId !== expected.nodeId ||
      field.pageId !== expected.pageId ||
      typeof field.value !== "string" ||
      field.value.length > 4000
    )
      throw Error("Invalid shared-content field: " + name);
    fields[name] = {
      nodeId: field.nodeId,
      pageId: field.pageId,
      value: field.value,
    };
  }
  return { schemaVersion: 1, fileKey, fields };
}
export function extractContent(document, template) {
  const byId = {};
  const visit = (n) => {
    byId[n.id] = n;
    for (const child of n.children ?? []) visit(child);
  };
  visit(document);
  const fields = {};
  for (const [name, field] of Object.entries(template.fields)) {
    const n = byId[field.nodeId];
    if (n?.type !== "TEXT")
      throw Error(
        "Named version lacks current shared content: " +
          name +
          ". Save a new version of the current library.",
      );
    fields[name] = { ...field, value: n.characters };
  }
  return validateContent({ schemaVersion: 1, fileKey, fields }, template);
}
export function signature(value) {
  const normal = (v) =>
    typeof v === "number"
      ? Number(v.toFixed(6))
      : Array.isArray(v)
        ? v.map(normal)
        : v && typeof v === "object"
          ? Object.fromEntries(
              Object.keys(v)
                .sort()
                .map((k) => [k, normal(v[k])]),
            )
          : v;
  return JSON.stringify(normal(value));
}
export function syncDirection(base, local, remote) {
  const l = signature(local),
    r = signature(remote);
  if (l === r) return "equal";
  if (!base) return "choose";
  const b = signature(base);
  if (l === b) return "import";
  if (r === b) return "publish";
  return "conflict";
}
export function captureNativeTokens(collections, variables) {
  const cs = Object.fromEntries(collections.map((c) => [c.id, c])),
    vs = Object.fromEntries(variables.map((v) => [v.id, v]));
  const resolve = (v, theme, seen = new Set()) => {
    if (!v || seen.has(v.id)) throw Error("Missing or cyclic alias");
    seen.add(v.id);
    const c = cs[v.variableCollectionId];
    const m = modeForCollection(c, theme);
    const value = v.valuesByMode[m.modeId];
    return value?.type === "VARIABLE_ALIAS"
      ? resolve(vs[value.id], theme, seen)
      : value;
  };
  return validateTokens(
    {
      schemaVersion: 1,
      fileKey,
      modes: Object.fromEntries(
        modes.map((theme) => [
          theme,
          Object.fromEntries(
            semanticForMode(variables, cs, theme).map((v) => [
              v.name,
              { type: v.resolvedType, value: resolve(v, theme) },
            ]),
          ),
        ]),
      ),
    },
    { fileKey, themeModes: modes },
  );
}
export function planTokenImport(bundle, collections, variables) {
  const candidate = validateTokens(bundle, { fileKey, themeModes: modes });
  const cs = Object.fromEntries(collections.map((c) => [c.id, c])),
    vs = Object.fromEntries(variables.map((v) => [v.id, v]));
  const localNames = semanticForMode(variables, cs, modes[0]).map(v => v.name).sort();
  if (
    JSON.stringify(localNames) !==
    JSON.stringify(Object.keys(candidate.modes.Dawn).sort())
  )
    throw Error(
      "Import requires the same semantic token names; new tokens need a library update",
    );
  const terminal = (v, theme, seen = new Set()) => {
    if (!v || seen.has(v.id)) throw Error("Missing or cyclic alias");
    seen.add(v.id);
    const c = cs[v.variableCollectionId];
    const m = modeForCollection(c, theme);
    const current = v.valuesByMode[m.modeId];
    return current?.type === "VARIABLE_ALIAS"
      ? terminal(vs[current.id], theme, seen)
      : { id: v.id, modeId: m.modeId, type: v.resolvedType, current };
  };
  const cells = new Map();
  for (const theme of modes)
    for (const v of semanticForMode(variables, cs, theme)) {
      const token = candidate.modes[theme][v.name];
      if (token.type !== v.resolvedType)
        throw Error("Token type differs: " + v.name);
      const cell = terminal(v, theme);
      const key = cell.id + "@" + cell.modeId;
      if (cell.type !== token.type) throw Error("Alias type differs");
      const previous = cells.get(key);
      if (previous && signature(previous.value) !== signature(token.value))
        throw Error(
          "Shared alias has conflicting values: " +
            v.name +
            ". Update all roles sharing this primitive together.",
        );
      cells.set(key, { ...cell, value: token.value });
    }
  return [...cells.values()].filter(
    (c) => signature(c.current) !== signature(c.value),
  );
}
