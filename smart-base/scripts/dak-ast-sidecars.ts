#!/usr/bin/env bun
/**
 * dak-ast-sidecars.ts: a DAK's IG API sidecars (JSON Schema, JSON-LD, display
 * files), produced from the IG Publisher AST rather than read off WHO's
 * published site.
 *
 * Owner, 2026-10-11: the artefact pages linked JSON to WHO and carried no
 * JSON-LD or JSON Schema; fix it "use AST route". The JSON is the AST's own
 * resource (fhir-harness serves it). The JSON-LD and JSON Schema are what
 * WHO's DAK post-processing writes after a Publisher run, and that processing
 * is WHO's, so it lives here, in the overlay, never in fhir-harness
 * (`check:fhir-harness-exclusions`). fhir-harness only binds whatever files
 * land in `--out` to the artefacts (`ast-to-artifact-index.ts --sidecars`).
 *
 * ## The same generators, not a re-implementation
 *
 * `generate_valueset_schemas.py`, `generate_jsonld_vocabularies.py` and
 * `generate_logical_model_schemas.py` from smart-base's `input/scripts/` are
 * run unchanged. They read a Publisher `output/` directory: `expansions.json`
 * and `StructureDefinition-<id>.json` / `Binary-<id>.json` /
 * `ImplementationGuide-<id>.json` files. So the AST's resources are laid out
 * under those names first. The AST carries no ValueSet expansions; the cache
 * keeps the build's own `expansions.json` beside the AST (`ig-cache.sh seed`),
 * and without it the two ValueSet generators are skipped, and SAID to be.
 *
 * The scripts come from `--scripts <dir>`, or else from the commit of
 * smart-base the platform's `index.lock.json` pins, so the generators that run
 * are the ones this build is pinned to, never "whatever is on main today".
 *
 *   bun run smart-base/scripts/dak-ast-sidecars.ts --ast <output-ast> --out <dir> [--scripts <input/scripts dir>]
 *
 * @module smart-base/scripts/dak-ast-sidecars
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

export const GENERATORS = ["generate_valueset_schemas.py", "generate_jsonld_vocabularies.py", "generate_logical_model_schemas.py"] as const;

interface ManifestResource {
  resourceType: string;
  id: string;
  file: string;
}

/**
 * Lay an AST's resources out as a Publisher `output/` directory names them:
 * `<Type>-<id>.json`, plus the build's `expansions.json` when the AST kept it.
 * Returns how many resources were written and whether expansions were found.
 */
export function flattenAst(ast: string, out: string): { resources: number; expansions: boolean } {
  const manifest = JSON.parse(readFileSync(join(ast, "manifest.json"), "utf-8")) as { resources?: ManifestResource[] };
  mkdirSync(out, { recursive: true });
  let resources = 0;
  for (const r of manifest.resources ?? []) {
    const src = join(ast, r.file);
    if (!existsSync(src)) continue;
    copyFileSync(src, join(out, `${r.resourceType}-${r.id}.json`));
    resources++;
  }
  const exp = join(ast, "expansions.json");
  const expansions = existsSync(exp);
  if (expansions) copyFileSync(exp, join(out, "expansions.json"));
  return { resources, expansions };
}

/** The `smart-base` pin of the nearest `index.lock.json` above `from`, if any. */
export function lockedSmartBase(from: string): { repository: string; sha: string } | undefined {
  for (let d = resolve(from); ; d = dirname(d)) {
    const p = join(d, "index.lock.json");
    if (existsSync(p)) {
      const lock = JSON.parse(readFileSync(p, "utf-8")) as unknown;
      const list = (Array.isArray(lock) ? lock : ((lock as { instances?: unknown[] }).instances ?? [])) as { instance?: string; repository?: string; sha?: string }[];
      const e = list.find((x) => x.instance === "smart-base");
      return e?.repository && e.sha ? { repository: e.repository, sha: e.sha } : undefined;
    }
    if (dirname(d) === d) return undefined;
  }
}

function git(args: string[], cwd: string): void {
  const r = spawnSync("git", args, { cwd, stdio: ["ignore", "ignore", "pipe"] });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr?.toString().trim()}`);
}

/** Fetch the three generators at one commit, into `dir`. */
function fetchGenerators(repository: string, sha: string, dir: string): string {
  mkdirSync(dir, { recursive: true });
  git(["init", "-q"], dir);
  git(["remote", "add", "origin", `https://github.com/${repository}`], dir);
  git(["fetch", "-q", "--depth", "1", "--filter=blob:none", "origin", sha], dir);
  git(["checkout", "-q", "FETCH_HEAD", "--", ...GENERATORS.map((g) => `input/scripts/${g}`)], dir);
  return join(dir, "input", "scripts");
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const opt = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  const ast = opt("--ast");
  const out = opt("--out");
  if (!ast || !out) {
    console.error("usage: dak-ast-sidecars.ts --ast <output-ast> --out <dir> [--scripts <input/scripts dir>]");
    process.exit(2);
  }
  const work = mkdtempSync(join(tmpdir(), "dak-ast-sidecars-"));
  try {
    let scripts = opt("--scripts");
    if (!scripts) {
      const pin = lockedSmartBase(process.cwd());
      if (!pin) {
        console.error("no --scripts given and no index.lock.json pins smart-base: cannot tell which generators to run");
        process.exit(2);
      }
      scripts = fetchGenerators(pin.repository, pin.sha, join(work, "smart-base"));
      console.error(`generators: ${pin.repository}@${pin.sha.slice(0, 12)} input/scripts/`);
    }
    for (const g of GENERATORS) if (!existsSync(join(scripts, g))) throw new Error(`${g} is not in ${scripts}`);
    const flat = join(work, "output");
    const f = flattenAst(resolve(ast), flat);
    console.error(`AST: ${f.resources} resource(s) laid out as Publisher output; expansions.json ${f.expansions ? "present" : "ABSENT"}`);
    const dest = resolve(out);
    mkdirSync(dest, { recursive: true });
    const run = (g: string, a: string[]) => {
      // Run in the scratch directory: the generators write their QA reports to
      // relative paths, which must not land in the caller's checkout.
      const r = spawnSync("python3", [join(resolve(scripts!), g), ...a], { cwd: work, stdio: ["ignore", "ignore", "pipe"] });
      if (r.status !== 0) throw new Error(`${g} exited ${r.status}: ${r.stderr?.toString().trim().split("\n").slice(-5).join("\n")}`);
    };
    if (f.expansions) {
      run("generate_valueset_schemas.py", [join(flat, "expansions.json"), dest]);
      run("generate_jsonld_vocabularies.py", [join(flat, "expansions.json"), dest]);
    } else {
      console.error("! no expansions.json beside the AST: ValueSet schemas and JSON-LD vocabularies NOT generated (re-seed the AST cache to keep the build's expansions)");
    }
    run("generate_logical_model_schemas.py", [flat, dest]);
    const files = readdirSync(dest);
    const count = (suf: string) => files.filter((x) => x.endsWith(suf)).length;
    const summary = { schema: count(".schema.json"), jsonld: count(".jsonld"), displays: count(".displays.json"), expansions: f.expansions };
    writeFileSync(join(work, "summary.json"), JSON.stringify(summary));
    console.error(`${dest}: ${summary.schema} JSON Schema, ${summary.jsonld} JSON-LD, ${summary.displays} display file(s)`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
