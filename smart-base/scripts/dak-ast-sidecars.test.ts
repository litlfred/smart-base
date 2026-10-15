import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { flattenAst, GENERATORS, localSmartBaseScripts, lockedSmartBase } from "./dak-ast-sidecars";

const put = (p: string, body: unknown) => {
  mkdirSync(join(p, ".."), { recursive: true });
  writeFileSync(p, JSON.stringify(body));
};

describe("dak-ast-sidecars", () => {
  test("flattenAst lays resources out as Publisher output names them, with the build's expansions", () => {
    const ast = mkdtempSync(join(tmpdir(), "ast-"));
    put(join(ast, "resources/StructureDefinition/Cat--0.json"), { resourceType: "StructureDefinition", id: "Cat" });
    put(join(ast, "manifest.json"), {
      resources: [
        { resourceType: "StructureDefinition", id: "Cat", file: "resources/StructureDefinition/Cat--0.json" },
        { resourceType: "ValueSet", id: "Gone", file: "resources/ValueSet/Gone.json" },
      ],
    });
    const out = join(mkdtempSync(join(tmpdir(), "flat-")), "output");
    expect(flattenAst(ast, out)).toEqual({ resources: 1, expansions: false });
    expect(JSON.parse(readFileSync(join(out, "StructureDefinition-Cat.json"), "utf-8")).id).toBe("Cat");
    put(join(ast, "expansions.json"), { resourceType: "Bundle" });
    expect(flattenAst(ast, out).expansions).toBe(true);
    expect(existsSync(join(out, "expansions.json"))).toBe(true);
  });

  test("lockedSmartBase reads the smart-base pin of the nearest index.lock.json above", () => {
    const root = mkdtempSync(join(tmpdir(), "lock-"));
    put(join(root, "index.lock.json"), [{ instance: "smart-base", repository: "o/smart-base", sha: "a".repeat(40) }]);
    mkdirSync(join(root, "a/b"), { recursive: true });
    expect(lockedSmartBase(join(root, "a/b"))).toEqual({ repository: "o/smart-base", sha: "a".repeat(40) });
    const bare = mkdtempSync(join(tmpdir(), "nolock-"));
    put(join(bare, "index.lock.json"), [{ instance: "other", repository: "o/x", sha: "b" }]);
    expect(lockedSmartBase(bare)).toBeUndefined();
  });
});

describe("dak-ast-sidecars in smart-base's own repository (smart-base is a local instance)", () => {
  const repo = (local: boolean, withScripts = true) => {
    const d = mkdtempSync(join(tmpdir(), "dak-local-"));
    const source = local ? { local: { at: "smart-base" } } : { remote: { repository: "litlfred/smart-base", ref: "x" } };
    writeFileSync(join(d, "index.config.json"), JSON.stringify({ instances: [{ name: "smart-base", source }] }));
    mkdirSync(join(d, "input", "scripts"), { recursive: true });
    if (withScripts) for (const g of GENERATORS) writeFileSync(join(d, "input", "scripts", g), "");
    mkdirSync(join(d, "deep", "er"), { recursive: true });
    return d;
  };
  test("the checkout's own input/scripts/, found from below the root", () => {
    const d = repo(true);
    expect(localSmartBaseScripts(join(d, "deep", "er"))).toBe(join(d, "input", "scripts"));
  });
  test("not when smart-base is mounted (the lock's pin decides), nor when the generators are absent", () => {
    expect(localSmartBaseScripts(repo(false))).toBeUndefined();
    expect(localSmartBaseScripts(repo(true, false))).toBeUndefined();
  });
});
