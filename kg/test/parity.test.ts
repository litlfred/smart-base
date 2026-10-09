/**
 * The migration lost nothing: the L1 JSON generated from `l1.ts` equals WHO
 * smart-kg's `ontology/l1/l1.json`, identity and hashing agree with
 * `tools/kgid.mjs`, and every committed generated file is current.
 *
 * Equality is of the PARSED JSON. Run with SMART_KG_HOME at a smart-kg checkout
 * (CI checks out WHO's at the commit `l1.ts` records); without one the parity
 * tests report n/a.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

import { REPO, artefacts, orphans } from "../src/emit.ts";
import * as kgid from "../src/kgid.ts";
import { L1, MIGRATED_FROM } from "../src/l1.ts";
import { L1_LIBRARY } from "../src/l1-library.ts";
import { OntologyLayerSchema, toOntologyJson } from "../src/ontology.ts";

const HOME = process.env.SMART_KG_HOME;
const NA = { skip: HOME && existsSync(join(HOME, "ontology", "l1", "l1.json")) ? false : "SMART_KG_HOME unset: NOT checked (n/a, not a pass)" };

test("generated l1.json equals smart-kg's", NA, () => {
  assert.deepEqual(toOntologyJson(L1), JSON.parse(readFileSync(join(HOME!, "ontology", "l1", "l1.json"), "utf8")));
});

test("identity and hashing agree with smart-kg's kgid.mjs", NA, async () => {
  const theirs = await import(pathToFileURL(join(HOME!, "tools", "kgid.mjs")).href);
  const ids = [{ type: "isbn", value: "978-92-4-001651-4" }];
  assert.equal(kgid.publicationId(ids), theirs.publicationId(ids));
  const web = [{ type: "url", value: "https://www.who.int/teams/x/summary-tables/" }];
  assert.equal(kgid.publicationId(web), theirs.publicationId(web));
  const pub = kgid.publicationId(ids);
  assert.equal(kgid.sectionId(pub, "Annex 2"), theirs.sectionId(pub, "Annex 2"));
  assert.equal(kgid.publicationElementId(pub, "Table 3", "row 2"), theirs.publicationElementId(pub, "Table 3", "row 2"));
  assert.equal(kgid.healthInterventionId("UHC", "1.2"), theirs.healthInterventionId("UHC", "1.2"));
  const text = "  WHO recommends\n a birth dose ";
  assert.equal(kgid.contentHash(kgid.normText(text)), theirs.contentHash(theirs.normText(text)));
});

test("the migration records the commit it was taken from", () => {
  assert.match(MIGRATED_FROM.commit, /^[0-9a-f]{40}$/);
});

test("both layers are internally consistent", () => {
  OntologyLayerSchema.parse(toOntologyJson(L1));
  assert.equal(toOntologyJson(L1_LIBRARY).imports?.[0], "l1");
});

test("every committed generated file is current, and none is orphaned", () => {
  const all = artefacts();
  const stale = all.filter((a) => {
    const abs = join(REPO, a.path);
    return !existsSync(abs) || readFileSync(abs, "utf8") !== a.text;
  });
  assert.deepEqual(stale.map((s) => s.path), [], "run `npm run build` in kg/");
  assert.deepEqual(orphans(new Set(all.map((a) => a.path))), []);
});

test("reuse is real: publication derives from DublinCore, terminology-code from Coding", () => {
  const fsh = readFileSync(join(REPO, "input/fsh/models/KGL1.fsh"), "utf8");
  assert.match(fsh, /Logical: KGPublication\nParent: DublinCore\n/);
  assert.match(fsh, /Logical: KGTerminologyCode\nParent: Coding\n/);
  const pub = fsh.split(/\n(?=Logical: )/).find((b) => b.startsWith("Logical: KGPublication\n"))!;
  assert.doesNotMatch(pub, /^\* title /m, "an inherited element is not restated");
  assert.match(pub, /^\* identifiers 0\.\.\* BackboneElement /m);
});

test("the specialisation ruling is emitted as linked data", () => {
  const ld = JSON.parse(readFileSync(join(REPO, "kg/generated/l1/l1-library.jsonld"), "utf8"));
  const sub = Object.fromEntries(ld["@graph"].map((n: { "@id": string; subClassOf: unknown }) => [n["@id"], n.subClassOf]));
  assert.equal(sub["http://smart.who.int/kg/publication"], "https://litlfred.github.io/cat-harness/0.1.0/ns#SourceDocument");
  assert.equal(sub["http://smart.who.int/kg/publication-section"], "http://purl.org/spar/doco/Section");
});
