# Canonical product identities

The owner authorised canonical Polaris/Axis naming in current repository content and corresponding native Figma labels. Design tokens, product identities, licensing, architecture and promotion gates are unchanged.

Six affected text nodes on the existing Figma Archive page were normalized in place: `7:61`, `248:66`, `248:197`, `I271:3252;248:66`, `I271:3467;248:197`, `182:104`. The two instance labels inherited their main-component edits. Node IDs, fonts and bounds were preserved. No nodes were deleted and no library publication or new named version was requested.

`generated/snapshot.json` and `generated/changes.json` still describe the captured named version `2410432353106277961`. Their display `name` fields now use canonical identities; `sourceNameUtf8Hex` reversibly preserves each original label. Their source `hash`, `versionId`, capture timestamp and change classification are unchanged. The snapshot producer applies the same display normalization to later exports, including older named versions. Hashes continue to cover unmodified upstream properties, so a later capture of the actual live Figma renames is detected as a source change.

Do not recompute an old source hash from a normalized display name, reinterpret this as a fresh Figma capture, or advance content/token baselines for this editorial change. The naming regression and source-hash tests protect this distinction. Current canon links pin the Polaris naming commit until source cutover is reviewed.
