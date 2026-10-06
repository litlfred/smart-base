/**
 * Write every artefact generated from the Zod source, or with `--check`, fail
 * when any committed copy differs from what would be written.
 *
 *   kg/generated/l1/l1.json                          the ontology, smart-kg format
 *   kg/generated/l1/recommendation-graph.schema.json the document shape, JSON Schema
 *   input/fsh/models/KGL1.fsh                        logical models
 *   input/fsh/codesystems/KG*.fsh, valuesets/KG*.fsh code systems and value sets
 *
 * Committed rather than built on demand for smart-kg's reason: a consumer
 * fetches the format its tool reads without installing this toolchain. And
 * committed generated files go stale silently, which is what `--check` is for.
 *
 *   npx tsx src/emit.ts           write
 *   npx tsx src/emit.ts --check   exit 1 and name each stale file
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

import { fshFiles } from "./fsh.ts";
import { GraphDocumentSchema } from "./graph.ts";
import { L1 } from "./l1.ts";
import { toOntologyJson } from "./ontology.ts";
import { SHAPE_ID, SHAPE_TITLE } from "./shape-text.ts";

/** smart-base repository root. */
export const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function graphJsonSchema(): Record<string, unknown> {
  const body = z.toJSONSchema(GraphDocumentSchema, { io: "input", reused: "inline", target: "draft-2020-12" }) as Record<string, unknown>;
  return { $schema: body.$schema, $id: SHAPE_ID, title: SHAPE_TITLE, ...body };
}

export function artefacts(): { path: string; text: string }[] {
  const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
  return [
    { path: "kg/generated/l1/l1.json", text: json(toOntologyJson(L1)) },
    { path: "kg/generated/l1/recommendation-graph.schema.json", text: json(graphJsonSchema()) },
    ...fshFiles(L1, "kg/src/l1.ts + kg/src/vocab.ts"),
  ];
}

function main(argv: string[]): number {
  const check = argv.includes("--check");
  const stale: string[] = [];
  for (const a of artefacts()) {
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
  if (check) {
    if (stale.length) {
      console.error(`${stale.length} generated file(s) are stale — run \`npm run build\` in kg/:`);
      for (const s of stale) console.error(`  ${s}`);
      return 1;
    }
    console.log(`✓ ${artefacts().length} generated file(s) current`);
  }
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main(process.argv.slice(2)));
