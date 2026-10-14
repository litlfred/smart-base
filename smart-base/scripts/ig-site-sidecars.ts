#!/usr/bin/env bun
/**
 * ig-site-sidecars.ts: smart-base's step in an IG repository's site, the
 * checkout script `ig-site:sidecars`. It writes the IG's DAK API sidecars from
 * the cached AST and hands them to fhir-harness, which binds and serves them.
 *
 *   bun run smart-base/scripts/ig-site-sidecars.ts [--ig <checkout>] [--work <dir>]
 *
 * ## Why it is here
 *
 * Owner, 2026-10-14, on an IG repository (smart-trust) that lost its DAK API
 * sidecars when it dropped its own `site.build`: *"that should already be
 * there in smart-base (dak api)"*. An IG repository declares no steps of its
 * own; it names this layer as its site's landing (`index.config.json`
 * `"site": {"landing": "smart-base"}`), and the site route
 * (cat-harness-tools `stage-local.ts`) runs the `ig-site:sidecars` step that
 * the landing layer provides. This file is that step for every IG built on
 * smart-base, so no IG repository carries a copy.
 *
 * ## What it does, and what it leaves to fhir-harness
 *
 * 1. Runs `dak-ast-sidecars.ts` over the AST `ig-site:ast` restored
 *    (`<ig>/output-ast`). That script runs WHO's DAK post-processing
 *    generators at the smart-base commit the checkout pins.
 * 2. Leaves the files in `<work>/ig-api/sidecars/` and writes
 *    `<work>/ig-api/ig-api.json`, saying what the IG calls them: `DAK API`
 *    when the IG declares a DAK (`dak.json` at its root), and no label
 *    otherwise, so fhir-harness's own default, "IG API", stands.
 *
 * fhir-harness's `ig-site:compose` and `ig-site:publisher-pages` read that
 * directory and descriptor (its `ig-repo-site.ts`, §"What a layer above
 * leaves"). The DAK name stays here: fhir-harness must not know it
 * (`check:fhir-harness-exclusions`).
 *
 * `<work>` is the site build's work directory, `SITE_WORK` when the build runs
 * the step.
 *
 * @module smart-base/scripts/ig-site-sidecars
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

/** fhir-harness's names for the handshake (`ig-repo-site.ts` `IG_API_WORK`, `IG_API_DESCRIPTOR`). */
export const IG_API_WORK = "ig-api";
export const IG_API_DESCRIPTOR = "ig-api.json";
/** What a DAK calls its sidecars. */
export const DAK_API_LABEL = "DAK API";
/** The file whose presence says the IG is a DAK. */
export const DAK_DECLARATION = "dak.json";

/** The descriptor this step writes for an IG: the DAK label when it declares a DAK, none otherwise. */
export function descriptorFor(ig: string): { label?: string } {
  return existsSync(join(ig, DAK_DECLARATION)) ? { label: DAK_API_LABEL } : {};
}

export function igSiteSidecars(o: { ig: string; work: string; log?: (s: string) => void }): { files: number; label?: string } {
  const log = o.log ?? ((s: string) => console.error(s));
  const ig = resolve(o.ig);
  const ast = join(ig, "output-ast");
  if (!existsSync(join(ast, "manifest.json"))) throw new Error(`${ast}: no AST — the site route's ig-site:ast step restores it first`);
  const dir = join(resolve(o.work), IG_API_WORK);
  const sidecars = join(dir, "sidecars");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(sidecars, { recursive: true });
  const r = spawnSync("bun", ["run", join(import.meta.dir, "dak-ast-sidecars.ts"), "--ast", ast, "--out", sidecars], { cwd: ig, stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error(`dak-ast-sidecars.ts exited ${r.status}: the IG's sidecars were not written`);
  const d = descriptorFor(ig);
  writeFileSync(join(dir, IG_API_DESCRIPTOR), `${JSON.stringify(d, null, 2)}\n`);
  const files = readdirSync(sidecars).length;
  log(`ig-site:sidecars: ${files} sidecar file(s) in ${sidecars}${d.label ? `, called "${d.label}"` : " (no dak.json: no label, the IG API default stands)"}`);
  return { files, ...d };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const opt = (k: string) => {
    const i = args.indexOf(k);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const work = opt("--work") ?? process.env.SITE_WORK;
  if (!work) {
    console.error("usage: ig-site-sidecars.ts [--ig <checkout>] [--work <dir>]  (SITE_WORK from the site build when --work is absent)");
    process.exit(2);
  }
  try {
    igSiteSidecars({ ig: opt("--ig") ?? ".", work });
  } catch (e) {
    console.error(`✗ ig-site:sidecars: ${(e as Error).message}`);
    process.exit(1);
  }
}
