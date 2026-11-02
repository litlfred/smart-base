/**
 * The IG citation gate, seen failing on planted pages and passing on a
 * migrated one.
 */
import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { adopted, judge, judgePage, knownUrl, normUrl, readBibliography, type Bibliography } from "./check-ig-citations.ts";

const bib = (): Bibliography => ({
  keys: new Set(["voo2021", "w3c-did-core"]),
  urls: new Set([normUrl("https://www.w3.org/TR/did-core/")]),
  ids: new Set(["9789240010567", "10665/334306"]),
  dirs: ["references/"],
});
const B = "en/folio-assistant-core/bibliography/";

describe("check-ig-citations", () => {
  it("passes a citation into the bibliography page", () => {
    expect(judgePage("p.md", `As shown <a href="${B}#ref-voo2021">[voo2021]</a> and [[w3c-did-core]](${B}#ref-w3c-did-core).`, bib())).toEqual([]);
  });

  it("flags a key with no entry, and a citation to the page itself", () => {
    const f = judgePage("p.md", `See [[x]](${B}#ref-nope) and <a href="#ref-voo2021">(1)</a>.`, bib());
    expect(f.map((x) => x.rule)).toEqual(["dangling-citation", "dangling-citation"]);
    expect(f[1]!.detail).toContain("not the bibliography page");
  });

  it("flags a page reference list", () => {
    const f = judgePage("p.md", "### References\n<!-- references:begin style=ul keys=voo2021 -->\n<ul><li>x</li></ul>\n<!-- references:end -->\n", bib());
    expect(f.map((x) => x.rule)).toEqual(["page-reference-list"]);
  });

  it("flags hand-written entries and unlisted links in a references section, and stops at the next heading", () => {
    const page = [
      "## References",
      "- WHO. Global strategy on digital health 2020-2025.",
      "- Implementation tools:",
      "- [DID Core](https://www.w3.org/TR/did-core)",
      "- [Elsewhere](https://example.org/x)",
      "- [DIIG](https://www.who.int/publications/i/item/9789240010567)",
      "## Next",
      "- [Elsewhere](https://example.org/y)",
    ].join("\n");
    const f = judgePage("p.md", page, bib());
    expect(f.map((x) => `${x.line}:${x.rule}`)).toEqual(["2:hand-written-reference", "5:unlisted-link"]);
  });

  it("treats a whole references.md as a references section, but not a 'Reference Implementations' heading", () => {
    expect(judgePage("input/pagecontent/references.md", "- [x](https://example.org/x)", bib()).map((x) => x.rule)).toEqual(["unlisted-link"]);
    expect(judgePage("p.md", "## Reference Implementations\n- Set Passcode: do it", bib())).toEqual([]);
  });

  it("matches a link by its ISBN or IRIS handle", () => {
    expect(knownUrl(bib(), "https://iris.who.int/handle/10665/334306")).toBe(true);
    expect(knownUrl(bib(), "https://www.who.int/publications/i/item/9789241548960")).toBe(false);
  });

  it("reads the own instance's references directory through its declaration", () => {
    const root = mkdtempSync(join(tmpdir(), "igc-"));
    mkdirSync(join(root, "references"));
    mkdirSync(join(root, "input", "pagecontent"), { recursive: true });
    writeFileSync(join(root, "ig.json"), JSON.stringify({ directories: [{ id: "references", path: "references/", graphTypologies: ["references"] }] }));
    writeFileSync(join(root, "references", "k1.json"), JSON.stringify({ id: "k1", URL: "https://example.org/k1" }));
    writeFileSync(join(root, "input", "pagecontent", "a.md"), `[[k1]](${B}#ref-k1) [[k2]](${B}#ref-k2)\n`);
    const r = judge(root);
    expect(r.bib.dirs).toEqual(["references"]);
    expect(r.findings.map((x) => x.detail)).toEqual(["#ref-k2 is no entry of the KG bibliography"]);
  });
});

describe("ratchet", () => {
  it("an IG with no declared bibliography has not adopted the gate; one with a references directory has", () => {
    const root = mkdtempSync(join(tmpdir(), "igc-ratchet-"));
    expect(adopted(readBibliography(root))).toBe(false);
    mkdirSync(join(root, "references"));
    writeFileSync(join(root, "ig.json"), JSON.stringify({ directories: [{ path: "references/", graphTypologies: ["references"] }] }));
    expect(adopted(readBibliography(root))).toBe(true);
  });
});
