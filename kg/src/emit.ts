/**
 * Write every artefact generated from the Zod source, or with `--check`, fail
 * when any committed copy differs from what would be written.
 *
 *   kg/generated/l1/l1.json                          L1 3.0, smart-kg format, JSON-equal to WHO's
 *   kg/generated/l1/l1-library.json                  the extension layer (imports l1), smart-kg format
 *   kg/generated/l1/l1-library.jsonld                the specialisation: rdfs:subClassOf from L1 layout classes to the library's
 *   kg/generated/l1/recommendation-graph.schema.json the document JSON Schema
 *   input/fsh/models/KGL1.fsh, KGL1Library.fsh       logical models
 *   input/fsh/codesystems/KG*.fsh, valuesets/KG*VS.fsh
 *
 * A generated FSH file this run would not write — a value set renamed or
 * removed upstream — is deleted, and only if it carries this generator's
 * banner: a hand-written KG*.fsh is never touched. `--check` reports it.
 *
 *   npx tsx src/emit.ts           write
 *   npx tsx src/emit.ts --check   exit 1 and name each stale or orphaned file
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

import { fshFiles, GENERATED_BANNER } from "./fsh.ts";
import { GraphDocumentSchema } from "./graph.ts";
import { L1 } from "./l1.ts";
import { DOCO_NS, ELEMENT_TYPE_CLASS, L1_LIBRARY, LAYERING_RULE, SPECIALISES } from "./l1-library.ts";
import { toOntologyJson } from "./ontology.ts";
import { SHAPE_ID, SHAPE_TITLE } from "./shape-text.ts";

/** smart-base repository root. */
export const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function graphJsonSchema(): Record<string, unknown> {
  const body = z.toJSONSchema(GraphDocumentSchema, { io: "input", reused: "inline", target: "draft-2020-12" }) as Record<string, unknown>;
  return { $schema: body.$schema, $id: SHAPE_ID, title: SHAPE_TITLE, ...body };
}

/** The class-level half of the specialisation ruling, as linked data. */
export function specialisationJsonLd(): Record<string, unknown> {
  const sg = "http://smart.who.int/kg/";
  return {
    "@context": { rdfs: "http://www.w3.org/2000/01/rdf-schema#", sgkg: sg, doco: DOCO_NS, subClassOf: { "@id": "rdfs:subClassOf", "@type": "@id" }, comment: "rdfs:comment" },
    "@id": `${sg}l1-library`,
    comment: LAYERING_RULE,
    "@graph": [
      ...SPECIALISES.map((s) => ({ "@id": `${sg}${s.l1}`, subClassOf: s.library, comment: s.note })),
      ...Object.entries(ELEMENT_TYPE_CLASS).map(([type, cls]) => ({
        "@id": `${sg}publication-element#${type}`,
        subClassOf: [`${sg}publication-element`, cls],
        comment: `A publication-element whose elementType is "${type}".`,
      })),
    ],
  };
}

export function artefacts(): { path: string; text: string }[] {
  const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
  return [
    { path: "kg/generated/l1/l1.json", text: json(toOntologyJson(L1)) },
    { path: "kg/generated/l1/l1-library.json", text: json(toOntologyJson(L1_LIBRARY)) },
    { path: "kg/generated/l1/l1-library.jsonld", text: json(specialisationJsonLd()) },
    { path: "kg/generated/l1/recommendation-graph.schema.json", text: json(graphJsonSchema()) },
    ...fshFiles(L1, "kg/src/l1.ts (L1 3.0)"),
    ...fshFiles(L1_LIBRARY, "kg/src/l1-library.ts (the library extension)"),
  ];
}

/** Generated FSH on disk that this run would not write: renamed or removed upstream. */
export function orphans(written: Set<string>): string[] {
  const out: string[] = [];
  for (const dir of ["input/fsh/models", "input/fsh/codesystems", "input/fsh/valuesets"]) {
    const abs = join(REPO, dir);
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs)) {
      const rel = `${dir}/${f}`;
      if (!/^KG.*\.fsh$/.test(f) || written.has(rel)) continue;
      // Only this generator's own output: the banner's fixed prefix.
      if (readFileSync(join(abs, f), "utf8").startsWith(GENERATED_BANNER("").split(" from ")[0]!)) out.push(rel);
    }
  }
  return out.sort();
}

function main(argv: string[]): number {
  const check = argv.includes("--check");
  const all = artefacts();
  const stale: string[] = [];
  for (const a of all) {
    const abs = join(REPO, a.path);
    const current = existsSync(abs) ? readFileSync(abs, "utf8") : undefined;
    if (current === a.text) continue;
    if (check) {
      stale.push(`${a.path}${current === undefined ? " (missing)" : ""}`);
      continue;
    }
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, a.text);
    console.log(`wrote ${a.path}`);
  }
  for (const o of orphans(new Set(all.map((a) => a.path)))) {
    if (check) stale.push(`${o} (orphaned: generated, but nothing generates it now)`);
    else {
      rmSync(join(REPO, o));
      console.log(`removed ${o} (orphaned)`);
    }
  }
  if (check) {
    if (stale.length) {
      console.error(`${stale.length} generated file(s) are stale — run \`npm run build\` in kg/:`);
      for (const s of stale) console.error(`  ${s}`);
      return 1;
    }
    console.log(`✓ ${all.length} generated file(s) current, none orphaned`);
  }
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main(process.argv.slice(2)));
