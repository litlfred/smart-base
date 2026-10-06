/**
 * The validator FAILS on what it claims to catch, and agrees with smart-kg.
 *
 * The L1 cases are smart-kg `tools/negative-test.mjs`'s, rebuilt here (that
 * file builds its documents rather than committing them, for the reason it
 * gives: a fixture big enough to be interesting is a dataset wearing a
 * fixture's name). Two more cover what only this package checks: an
 * unlicensed edge, and a property value of the wrong type.
 *
 * With SMART_KG_HOME pointing at a smart-kg checkout, every case also runs
 * through smart-kg's own `validateGraph`, and the two must agree on pass or
 * fail — except the typed-value case, which smart-kg cannot see and which is
 * asserted to be invisible to it, so the difference is stated rather than
 * hidden.
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

import { check } from "../src/validate.ts";

const NS = "https://example.org/dak";
const doc = (nodes: unknown[], edges: unknown[]) => ({
  "@context": "http://smart.who.int/kg/l1.context.jsonld",
  id: `${NS}/kg/l1`,
  type: "Entity",
  ontologyVersion: "1.0",
  generatedAt: "2026-01-01T00:00:00Z",
  wasDerivedFrom: [{ path: "fixture", sha256: "0".repeat(64) }],
  nodes,
  edges,
});
const n = (id: string, type: string, label: string, properties = {}, extra = {}) => ({ id, type, label, properties, derivation: "derived", ...extra });
const e = (predicate: string, source: string, target: string, extra = {}) => ({ type: "Statement", predicate, source, target, derivation: "derived", ...extra });

const DMN_FILE = `${NS}/artifact/DT.EXAMPLE`;
const CITATION = `${NS}/citation/abc123abc123`;
const PUB = "urn:isbn:9789240000000";
const base = () =>
  doc(
    [
      n(DMN_FILE, "external-artifact", "Example decision table", { iri: DMN_FILE, targetKind: "dmn:DecisionTable" }),
      n(CITATION, "citation", "Example guideline (1)", { text: "Example guideline (1)", location: "fixture#rule1", numbering: "1", resolutionStatus: "unresolved" }),
      n(PUB, "publication", "Example guideline", { title: "Example guideline", identifier: "ISBN 978-92-4-000000-0", date: "2024" }),
    ],
    [e("appearsIn", CITATION, DMN_FILE)],
  );

type Doc = ReturnType<typeof base> & { nodes: any[]; edges: any[]; ontologyVersion: string };
const CASES: [string, ((d: Doc) => void) | null, RegExp | null, "both" | "zod-only"][] = [
  ["L1 conforms", null, null, "both"],
  ["unknown class is rejected", (d) => { d.nodes[0].type = "wormhole"; }, /does not declare/, "both"],
  ["dangling edge target is rejected", (d) => { d.edges[0].target = "urn:nope"; }, /defined in no document/, "both"],
  ["undeclared property is rejected", (d) => { d.nodes[0].properties.colour = "blue"; }, /does not declare/, "both"],
  ["inferred node without evidence is rejected", (d) => { d.nodes[0].derivation = "inferred"; d.nodes[0].note = "why"; }, /evidence/, "both"],
  ["citation claiming resolution without a resolvesTo edge is rejected", (d) => { d.nodes[1].properties.resolutionStatus = "resolved"; }, /no resolvesTo edge/, "both"],
  ["a citation with no verbatim text is rejected", (d) => { delete d.nodes[1].properties.text; }, /no verbatim text/, "both"],
  ["version mismatch stops the run", (d) => { d.ontologyVersion = "0.9"; }, /Nothing below was checked/, "both"],
  ["an unlicensed edge is rejected", (d) => { d.edges.push(e("supersedes", CITATION, DMN_FILE)); }, /not licensed/, "both"],
  ["a resolved citation with its resolvesTo edge conforms", (d) => {
    d.nodes[1].properties.resolutionStatus = "resolved";
    d.edges.push(e("resolvesTo", CITATION, PUB, { derivation: "inferred", note: "title match", evidence: { location: "fixture#ref1" } }));
  }, null, "both"],
  ["a typed value of the wrong type is rejected (new: smart-kg types no values)", (d) => { d.nodes[2].properties.date = "last spring"; }, /property value/, "zod-only"],
  ["a GRADE strength outside the code list is rejected (new)", (d) => {
    d.nodes.push(n(`${NS}/rec/1`, "recommendation", "Rec 1", { statement: "WHO recommends X.", strength: "weak" }));
  }, /property value/, "zod-only"],
];

const SMART_KG = process.env.SMART_KG_HOME;
const smartKg = SMART_KG && existsSync(join(SMART_KG, "tools", "validate.mjs"))
  ? {
      validate: (await import(pathToFileURL(join(SMART_KG, "tools", "validate.mjs")).href)).validateGraph,
      layer: (await import(pathToFileURL(join(SMART_KG, "tools", "ontology.mjs")).href)).loadLayer("l1"),
    }
  : undefined;

for (const [name, mutate, expected, scope] of CASES) {
  test(name, () => {
    const d = structuredClone(base()) as Doc;
    mutate?.(d);
    const v = check(d);
    if (expected) assert.ok(v.errors.some((m) => expected.test(m)), `expected ${expected}, got: ${v.errors.join(" | ") || "(no errors)"}`);
    else assert.deepEqual(v.errors, []);

    if (!smartKg) return; // n/a without a checkout — never reported as agreement
    const theirs = smartKg.validate(d, smartKg.layer);
    if (scope === "both") assert.equal(theirs.errors.length > 0, v.errors.length > 0, `smart-kg disagrees: ${theirs.errors.join(" | ")}`);
    else assert.deepEqual(theirs.errors, [], "smart-kg was expected NOT to see this (it types no values)");
  });
}

test("smart-kg agreement was checked", { skip: smartKg ? false : "SMART_KG_HOME unset: agreement with smart-kg NOT checked (n/a, not a pass)" }, () => {});
