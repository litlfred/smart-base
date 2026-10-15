#!/usr/bin/env bun
/**
 * dak-api-hub-page.ts: the DAK API hub page, `dak-api.html`, as a THIN page
 * over a JSON-LD node, for an IG repository's own site built from the AST.
 *
 *   bun run smart-base/scripts/dak-api-hub-page.ts --ast <output-ast> --sidecars <dir> --site <dir> [--label <name>]
 *
 * ## Why
 *
 * The Publisher-run build had `generate_dak_api_hub.py` (post-processing step
 * 6) inject the hub into `dak-api.html` at its `<!-- DAK_API_CONTENT -->`
 * marker. On the AST route there is no Publisher page to inject into, so
 * there was no hub. Owner, 2026-10-14, asked whether a thin hub page should be
 * rendered from the sidecars: *"Yes, thin page"*. It is written in the shape
 * of the artefact pages: a shell (`thinPageHtml`, cat-harness-tools'
 * `scripts/thin-page.ts`) that holds identity and a pointer, and a node,
 * `dak-api.jsonld`, that the page's one loader (`assets/dak-api-hub.js`)
 * draws from (`visualizer-loading`).
 *
 * ## One layout with the IG's other pages
 *
 * Owner, 2026-10-15: *"can we be more consistent with the DAK API stlying -
 * full width. keep it on the other pages as well... please consolidate
 * behaviours/appearance"*. The page links the shared page layout
 * (cat-harness-tools `page-layout.ts`) and its column is that layout's
 * full-width one, so it reads like every other page of the IG's site; its
 * lists are tables that fill the column. Its top bar is the IG's, which
 * fhir-harness's `publisher-pages` gives every page of the site
 * (`ig-search.ts` `withIgBar`); the layout's files are the site's.
 *
 * It belongs here, not in fhir-harness: the hub and its name are WHO's
 * (`check:fhir-harness-exclusions`). `ig-site:sidecars` writes it into
 * `$SITE_WORK/ig-api/site/`, which fhir-harness's `ig-site:publisher-pages`
 * serves at the site root. Skill: `dak-postprocessing` §"On an IG
 * repository's own site: `ig-site:sidecars`".
 *
 * ## What the node lists
 *
 * - the OpenAPI page, `openapi/`, when the site has one (the hub's Swagger UI
 *   page, or the IG's own OpenAPI graph);
 * - every sidecar, served at `fhir-artifact-index/sidecars/<file>`, with its
 *   artefact's page and, for a JSON Schema or JSON-LD sidecar, its view page
 *   `artifact/<file>.html`. A sidecar is bound to an artefact by the rule
 *   fhir-harness binds it by (`ast-to-artifact-index.ts` `attachSidecars`:
 *   the stem as `<Type>-<id>`, `<Type>-<name>`, then `<Type>-<title>` with each
 *   run of non-word characters as `_`), so the page links exactly the view
 *   pages fhir-harness writes, and a sidecar bound to nothing gets no view
 *   link;
 * - the enumeration schemas and other documents the hub run left at the site
 *   root.
 *
 * @module smart-base/scripts/dak-api-hub-page
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { escHtml, thinPageHtml } from "../../cat-harness-tools/scripts/thin-page.ts";
import { PAGE_MAIN_CLASS } from "../../cat-harness-tools/scripts/page-layout.ts";

/** The page, its node and its loader, at the site root. */
export const HUB_PAGE = "dak-api.html";
export const HUB_NODE = "dak-api.jsonld";
export const HUB_SCRIPT = "assets/dak-api-hub.js";
/** The config block's id: how a run recognises its own page. */
export const HUB_CONFIG_ID = "dak-api-hub";
/** Where fhir-harness serves the sidecars (`ig-repo-site.ts` `SIDECARS_SERVED`), and its artefact pages. */
export const SIDECARS_SERVED = "fhir-artifact-index/sidecars";
export const ARTIFACT_DIR = "artifact";
const LOADER = join(import.meta.dir, "templates", "dak-api-hub.js");

/** fhir-harness's sidecar kinds, by suffix, in the order it tries them. */
export const SIDECAR_KINDS: ReadonlyArray<{ kind: string; suffix: string; label: string; view: boolean }> = [
  { kind: "schema", suffix: ".schema.json", label: "JSON Schema", view: true },
  { kind: "displays", suffix: ".displays.json", label: "Displays", view: false },
  { kind: "openapi", suffix: ".openapi.json", label: "OpenAPI", view: false },
  { kind: "jsonld", suffix: ".jsonld", label: "JSON-LD", view: true },
];

/** A title as a file stem, as fhir-harness reads it. */
export const titleStem = (t: string): string => t.trim().replace(/\W+/g, "_").replace(/^_+|_+$/g, "");
/** An artefact's page name, as fhir-harness writes it (`artifactPageName`). */
export const pageName = (type: string, id: string): string => `${type}-${id}`.replace(/[^A-Za-z0-9._-]/g, "_");

export interface AstArtefact {
  resourceType: string;
  id: string;
  name?: string;
  title?: string;
}

/** The artefacts an AST holds, with the name and title each resource states. */
export function astArtefacts(ast: string): AstArtefact[] {
  const m = JSON.parse(readFileSync(join(ast, "manifest.json"), "utf-8")) as { resources?: { resourceType?: string; id?: string; file?: string }[] };
  const out: AstArtefact[] = [];
  for (const r of m.resources ?? []) {
    if (!r.resourceType || !r.id) continue;
    let j: { name?: unknown; title?: unknown } = {};
    try {
      if (r.file && existsSync(join(ast, r.file))) j = JSON.parse(readFileSync(join(ast, r.file), "utf-8"));
    } catch {
      j = {};
    }
    out.push({ resourceType: r.resourceType, id: r.id, ...(typeof j.name === "string" ? { name: j.name } : {}), ...(typeof j.title === "string" ? { title: j.title } : {}) });
  }
  return out;
}

/** The stem → artefact map fhir-harness binds by; the first artefact to claim a stem keeps it. Pure. */
export function stemIndex(artefacts: readonly AstArtefact[]): Map<string, AstArtefact> {
  const by = new Map<string, AstArtefact>();
  for (const a of artefacts) {
    for (const s of [a.id, a.name, a.title ? titleStem(a.title) : undefined]) {
      if (!s) continue;
      const k = `${a.resourceType}-${s}`;
      if (!by.has(k)) by.set(k, a);
    }
  }
  return by;
}

export interface HubEntry {
  file: string;
  kind: string;
  label: string;
  /** Where the file is served, relative to the site root. */
  href: string;
  /** Its artefact's page, when it binds to one. */
  artefact?: { key: string; page: string };
  /** Its view page, for a bound JSON Schema or JSON-LD sidecar. */
  view?: string;
}

/** One entry per sidecar file, bound as fhir-harness binds it. Pure over the names and the stems. */
export function hubEntries(files: readonly string[], stems: ReadonlyMap<string, AstArtefact>): HubEntry[] {
  const out: HubEntry[] = [];
  for (const file of [...files].sort()) {
    const k = SIDECAR_KINDS.find((x) => file.endsWith(x.suffix));
    if (!k) continue;
    const a = stems.get(file.slice(0, -k.suffix.length));
    const page = a ? `${ARTIFACT_DIR}/${pageName(a.resourceType, a.id)}.html` : undefined;
    out.push({
      file,
      kind: k.kind,
      label: k.label,
      href: `${SIDECARS_SERVED}/${file}`,
      ...(a && page ? { artefact: { key: `${a.resourceType}/${a.id}`, page } } : {}),
      ...(a && k.view ? { view: `${ARTIFACT_DIR}/${file}.html` } : {}),
    });
  }
  return out;
}

/** The hub's JSON-LD node. Pure. */
export function hubNode(o: { label: string; entries: readonly HubEntry[]; openapi: boolean; documents: readonly string[] }): Record<string, unknown> {
  return {
    "@context": { schema: "https://schema.org/" },
    "@id": HUB_NODE,
    "@type": "schema:WebAPI",
    "schema:name": o.label,
    ...(o.openapi ? { "schema:documentation": "openapi/" } : {}),
    "schema:hasPart": o.entries.map((e) => ({
      "@type": "schema:DigitalDocument",
      "schema:name": e.file,
      "schema:additionalType": e.label,
      "schema:contentUrl": e.href,
      ...(e.view ? { "schema:url": e.view } : {}),
      ...(e.artefact ? { "schema:about": { "@id": e.artefact.page, "schema:identifier": e.artefact.key } } : {}),
    })),
    "schema:workExample": [...o.documents].sort().map((d) => ({ "@type": "schema:DigitalDocument", "schema:name": d, "schema:contentUrl": d })),
  };
}

/** The thin page: identity and a pointer; the loader draws the lists from the node. */
export function hubPage(o: { label: string; openapi: boolean }): string {
  const label = escHtml(o.label);
  return thinPageHtml({
    title: o.label,
    jsonld: HUB_NODE,
    script: HUB_SCRIPT,
    configId: HUB_CONFIG_ID,
    config: { node: HUB_NODE },
    canonical: HUB_PAGE,
    // At the site root, which serves the layout's files.
    layout: "",
    noscriptLead: `The ${label} hub`,
    body:
      `<main class="dak-api-hub ${PAGE_MAIN_CLASS}"><h1>${label}</h1>` +
      `<p>The ${label}: a JSON Schema, JSON-LD, display and OpenAPI file for the artefacts of this guide, each with its artefact and its view.</p>` +
      (o.openapi ? `<p><a href="openapi/">The OpenAPI documentation</a></p>` : "") +
      `<div class="dak-api-hub-body" aria-live="polite"><p>Loading the ${label}…</p></div></main>`,
  });
}

/**
 * Write the page, its node (as `.jsonld` and `.json`, since GitHub Pages
 * serves no JSON type for `.jsonld`) and its loader into `site`. `site` is the
 * directory served at the site root; `openapi` says whether it will hold
 * `openapi/`, and `documents` the hub run's other root files.
 */
export function writeHub(o: { ast: string; sidecars: string; site: string; label: string; openapi: boolean; documents: readonly string[] }): { entries: number; views: number } {
  const files = readdirSync(o.sidecars).filter((f) => !f.startsWith("."));
  const entries = hubEntries(files, stemIndex(astArtefacts(o.ast)));
  const node = `${JSON.stringify(hubNode({ label: o.label, entries, openapi: o.openapi, documents: o.documents }), null, 2)}\n`;
  mkdirSync(join(o.site, "assets"), { recursive: true });
  writeFileSync(join(o.site, HUB_NODE), node);
  writeFileSync(join(o.site, HUB_NODE.replace(/\.jsonld$/, ".json")), node);
  writeFileSync(join(o.site, HUB_PAGE), hubPage({ label: o.label, openapi: o.openapi }));
  copyFileSync(LOADER, join(o.site, HUB_SCRIPT));
  return { entries: entries.length, views: entries.filter((e) => e.view).length };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const opt = (k: string) => {
    const i = args.indexOf(k);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const ast = opt("--ast");
  const sidecars = opt("--sidecars");
  const site = opt("--site");
  if (!ast || !sidecars || !site) {
    console.error("usage: dak-api-hub-page.ts --ast <output-ast> --sidecars <dir> --site <dir> [--label <name>]");
    process.exit(2);
  }
  const root = resolve(site);
  const documents = existsSync(root) ? readdirSync(root).filter((f) => f.endsWith(".json") && !f.startsWith("dak-api.")) : [];
  const r = writeHub({ ast: resolve(ast), sidecars: resolve(sidecars), site: root, label: opt("--label") ?? "DAK API", openapi: existsSync(join(root, "openapi", "index.html")), documents });
  console.error(`${HUB_PAGE}: a thin hub over ${r.entries} sidecar(s), ${r.views} with a view page`);
}
