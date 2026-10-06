/**
 * The migration lost nothing: the ontology JSON generated from `l1.ts` equals
 * smart-kg's `ontology/l1/l1.json`, and every committed generated file is
 * current.
 *
 * Equality is of the PARSED JSON. Byte equality is not claimed: smart-kg's
 * file groups its edges with hand-placed blank lines, which the data does not
 * carry. Run with SMART_KG_HOME at a smart-kg checkout (CI checks out WHO's
 * at the commit `l1.ts` records); without one the parity test reports n/a.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { REPO, artefacts } from "../src/emit.ts";
import { L1 } from "../src/l1.ts";
import { OntologyLayerSchema, toOntologyJson } from "../src/ontology.ts";

const SMART_KG = process.env.SMART_KG_HOME;
const theirs = SMART_KG ? join(SMART_KG, "ontology", "l1", "l1.json") : undefined;

test(
  "generated l1.json equals smart-kg's",
  { skip: theirs && existsSync(theirs) ? false : "SMART_KG_HOME unset: parity with smart-kg NOT checked (n/a, not a pass)" },
  () => {
    assert.deepEqual(toOntologyJson(L1), JSON.parse(readFileSync(theirs!, "utf8")));
  },
);

test("the ontology is internally consistent", () => {
  OntologyLayerSchema.parse(toOntologyJson(L1));
});

test("every committed generated file is current", () => {
  const stale = artefacts().filter((a) => {
    const abs = join(REPO, a.path);
    return !existsSync(abs) || readFileSync(abs, "utf8") !== a.text;
  });
  assert.deepEqual(stale.map((s) => s.path), [], "run `npm run build` in kg/");
});

test("reuse is real: publication derives from DublinCore, terminology-code from Coding", () => {
  const fsh = readFileSync(join(REPO, "input/fsh/models/KGL1.fsh"), "utf8");
  assert.match(fsh, /Logical: KGPublication\nParent: DublinCore\n/);
  assert.match(fsh, /Logical: KGTerminologyCode\nParent: Coding\n/);
  // An inherited element is not restated: restating it is the drifting copy reuse exists to avoid.
  const pub = fsh.split(/\n(?=Logical: )/).find((b) => b.startsWith("Logical: KGPublication\n"))!;
  assert.doesNotMatch(pub, /^\* title /m);
  assert.match(pub, /^\* sha256 /m);
});
