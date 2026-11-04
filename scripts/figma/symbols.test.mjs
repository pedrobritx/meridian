import test from "node:test";
import assert from "node:assert/strict";
import { symbolVariants, isSafeSvg } from "./symbols.mjs";

const set = (id, name, variants) => ({ id, name, type: "COMPONENT_SET", children: variants.map(([vid, vname]) => ({ id: vid, name: vname, type: "COMPONENT" })) });

test("symbol variants come from live pages only and map to stable file names", () => {
  const document = { children: [
    { id: "197:34", name: "Symbols", children: [{ id: "339:869", type: "SECTION", children: [
      set("449:1", "Symbol / chevron-down", [["449:2", "Style=Outline"], ["449:3", "Style=Duotone"]]),
      set("449:4", "Symbol / Meridian", [["449:5", "Style=Colour, Size=24"]]),
    ] }] },
    { id: "218:21", name: "Lab / Archive", children: [set("366:1", "Symbol / leaf", [["366:2", "Style=Outline"]])] },
  ] };
  assert.deepEqual(symbolVariants(document, ["218:21"]).map((s) => [s.id, s.file]), [
    ["449:3", "chevron-down/duotone.svg"], ["449:2", "chevron-down/outline.svg"], ["449:5", "meridian/colour-24.svg"],
  ]);
  const clash = { children: [{ id: "1:1", children: [set("2:1", "Symbol / a", [["2:2", "Style=X"], ["2:3", "Style=x"]])] }] };
  assert.throws(() => symbolVariants(clash), /same file/);
});

test("only plain SVG documents are accepted", () => {
  assert.ok(isSafeSvg('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>'));
  for (const bad of ["<html></html>", "<svg><script>x</script></svg>", '<svg onload="x()"></svg>', '<svg><a href="javascript:x"/></svg>', "<svg><foreignObject/></svg>", null])
    assert.equal(isSafeSvg(bad), false, String(bad));
});
