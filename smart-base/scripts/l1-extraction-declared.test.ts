/**
 * Every `library/<entry>/l1-extraction/` is DECLARED, with the `l1-extraction`
 * typology — and every such declaration names a directory that is there.
 *
 * Owner, 2026-10-12, bean 8pzh item 1: the extraction output stays beside its
 * library entry AND is published with the source — "if its a part of the KG it
 * should be published". It was not published because it was not part of the
 * declared KG: plain files under `library/`, which no typology named. The
 * library publisher (`cat-harness-tools/scripts/gen-library-viz.ts`) publishes
 * the directories declared inside an entry whose kind is `within: "library"`,
 * so an undeclared `l1-extraction/` is an unpublished one, silently. This test
 * is what makes the declaration checked rather than assumed.
 *
 * Read from the files alone — the declaration and the typology node — so it
 * runs in this repository without the harness mounted.
 */
import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const KIND = "l1-extraction";

interface Dir { id: string; path: string; graphTypologies: string[] }
const decl = JSON.parse(readFileSync(join(ROOT, "smart-base.json"), "utf-8")) as { directories: Dir[] };
const libraryPath = decl.directories.find((d) => d.graphTypologies.includes("library"))!.path.replace(/\/$/, "");
const norm = (p: string): string => p.replace(/\/$/, "");

/** `library/<entry>/l1-extraction` for every entry that holds one, on disk. */
function onDisk(): string[] {
  const lib = join(ROOT, libraryPath);
  return readdirSync(lib)
    .filter((e) => statSync(join(lib, e)).isDirectory() && existsSync(join(lib, e, KIND)))
    .map((e) => `${libraryPath}/${e}/${KIND}`)
    .sort();
}

describe("l1-extraction is declared KG content", () => {
  const declared = decl.directories.filter((d) => d.graphTypologies.includes(KIND));

  it("the typology node exists, is a sub-graph of library, and is derived", () => {
    const node = JSON.parse(readFileSync(join(ROOT, "typologies", `${KIND}.json`), "utf-8"));
    expect(node.$schema).toBe("folio-graph-typology/v1");
    expect(node.kind).toBe(KIND);
    expect(node.within).toBe("library");
    expect(node.holds).toBe("derived");
    // The two are exclusive on a kind; this one says why no validator applies.
    expect(node.nodeSchemas).toBeUndefined();
    expect(typeof node.validatorNotApplicable).toBe("string");
  });

  it("at least one entry holds extraction output (the test is not vacuous)", () => {
    expect(onDisk().length).toBeGreaterThan(0);
  });

  it("every l1-extraction/ on disk is declared with the l1-extraction typology", () => {
    expect(declared.map((d) => norm(d.path)).sort()).toEqual(onDisk());
  });

  it("each declaration sits INSIDE a library entry and names that typology alone", () => {
    for (const d of declared) {
      expect(norm(d.path).startsWith(`${libraryPath}/`)).toBe(true);
      expect(d.graphTypologies).toEqual([KIND]);
    }
  });

  it("the declared L1 graph document is there to publish", () => {
    for (const d of declared) {
      const graph = JSON.parse(readFileSync(join(ROOT, d.path, "recommendations.l1.json"), "utf-8"));
      expect(typeof graph["@context"]).toBe("string");
    }
  });
});
