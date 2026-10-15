/**
 * The validator FAILS on what it claims to catch, and agrees with smart-kg.
 *
 * The fixture is smart-kg's own: `tools/negative-test.mjs --emit` writes the
 * valid L1 3.0 document its tests mutate, so nothing is committed here (smart-kg
 * holds no DAK data, and a fixture big enough to be interesting is a dataset).
 * Each case mutates it and runs BOTH validators: this package's `check` and
 * smart-kg's `validateGraph`. They must agree on pass or fail — except the
 * typed-value cases, which only this package can see, and which are asserted
 * to be invisible to smart-kg so the difference is stated rather than hidden.
 *
 * Needs SMART_KG_HOME at a smart-kg checkout; without it every case reports
 * n/a (skipped), never a pass.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

import { check } from "../src/validate.ts";

const HOME = process.env.SMART_KG_HOME;
const ready = !!HOME && existsSync(join(HOME, "tools", "negative-test.mjs"));
const NA = "SMART_KG_HOME unset: NOT checked (n/a, not a pass)";

type Doc = { "@context": string; ontologyVersion: string; nodes: any[]; edges: any[] };
let base: Doc | undefined;
let theirs: ((d: Doc) => { errors: string[] }) | undefined;
if (ready) {
  const dir = mkdtempSync(join(tmpdir(), "kg-fixture-"));
  execFileSync("node", [join(HOME!, "tools", "negative-test.mjs"), "--emit", dir], { stdio: "ignore" });
  base = JSON.parse(readFileSync(join(dir, "l1.json"), "utf8"));
  const v = await import(pathToFileURL(join(HOME!, "tools", "validate.mjs")).href);
  const o = await import(pathToFileURL(join(HOME!, "tools", "ontology.mjs")).href);
  const layer = o.loadLayer("l1");
  theirs = (d) => v.validateGraph(d, layer);
}

const byType = (d: Doc, t: string) => d.nodes.find((n) => n.type === t);
const edge = (d: Doc, p: string) => d.edges.find((e) => e.predicate === p);
const rec = (d: Doc) => d.nodes.find((n) => n.type === "recommendation" && n.properties?.statement);

// [name, mutation, expected message (null = conforms), who sees it]
const CASES: [string, ((d: Doc) => void) | null, RegExp | null, "both" | "ours-only"][] = [
  ["smart-kg's L1 fixture conforms", null, null, "both"],
  ["unknown class is rejected", (d) => { byType(d, "remark").type = "wormhole"; }, /does not declare/, "both"],
  ["dangling edge target is rejected", (d) => { edge(d, "answers").target = "urn:nope"; }, /defined in no document/, "both"],
  ["undeclared property is rejected", (d) => { byType(d, "publication").properties.colour = "blue"; }, /does not declare/, "both"],
  ["inferred node without evidence is rejected", (d) => { delete rec(d).evidence; }, /carries no evidence/, "both"],
  ["version mismatch stops the run", (d) => { d.ontologyVersion = "0.9"; }, /Nothing below was checked/, "both"],
  ["a strength outside the value set is rejected", (d) => { rec(d).properties.strength = "weak"; }, /not a code in value set "recommendation-strength"/, "both"],
  ["an invented identifier type is rejected", (d) => { byType(d, "publication").properties.identifiers[0].type = "isbn13"; }, /identifier-type/, "both"],
  ["a strength without a direction is rejected", (d) => { const r = rec(d); r.properties.strength = "strong"; delete r.properties.direction; }, /without a direction/, "both"],
  ["schedule is no longer a class", (d) => { byType(d, "remark").type = "schedule"; }, /does not declare/, "both"],
  ["appearsIn is not licensed in L1 any more", (d) => { d.edges.push({ type: "Statement", predicate: "appearsIn", source: byType(d, "citation").id, target: byType(d, "publication").id, derivation: "derived" }); }, /not licensed/, "both"],
  ["an IRI minted outside the scheme is rejected", (d) => { const r = byType(d, "key-question"); const old = r.id; r.id = "https://example.org/kq/1"; for (const e of d.edges) { if (e.source === old) e.source = r.id; if (e.target === old) e.target = r.id; } }, /IRI shape/, "both"],
  ["a contentHash that does not match the stored text is rejected", (d) => { rec(d).properties.contentHash = "0".repeat(64); }, /contentHash that does not match/, "both"],
  ["content read from a PDF may not claim to be derived", (d) => { const r = rec(d); r.derivation = "derived"; }, /requires at least "inferred"/, "both"],
  ["a decided judgement must say who and when", (d) => { const r = rec(d); r.derivation = "decided"; delete r.evidence.by; delete r.evidence.at; }, /who decided and when/, "both"],
  ["a placeholder never resolves", (d) => { const c = d.nodes.find((n) => n.properties?.citationKind === "placeholder"); c.properties.resolutionStatus = "resolved"; }, /placeholder/, "both"],
  ["a good practice statement carrying a strength is rejected", (d) => { const r = rec(d); r.properties.kind = "good-practice-statement"; r.properties.strength = "strong"; r.properties.direction = "for"; }, /nothing to grade/, "both"],
  // Only this package types values smart-kg leaves untyped:
  ["an issued date that is not a date is rejected (new)", (d) => { byType(d, "publication").properties.issued = "last spring"; }, /property value: .* issued/, "ours-only"],
  ["an ordinal that is not a number is rejected (new)", (d) => { byType(d, "remark").properties.ordinal = "first"; }, /property value: .* ordinal/, "ours-only"],
  ["cells that are not a list are rejected (new)", (d) => { const row = d.nodes.find((n) => n.properties?.elementType === "table-row"); row.properties.cells = "Dietary interventions"; }, /property value: .* cells/, "ours-only"],
];

for (const [name, mutate, expected, who] of CASES) {
  test(name, { skip: ready ? false : NA }, () => {
    const d = structuredClone(base!) as Doc;
    mutate?.(d);
    const v = check(d);
    if (expected) assert.ok(v.errors.some((m) => expected.test(m)), `expected ${expected}, got: ${v.errors.join(" | ") || "(no errors)"}`);
    else assert.deepEqual(v.errors, []);
    const t = theirs!(d);
    if (who === "both") assert.equal(t.errors.length > 0, v.errors.length > 0, `smart-kg disagrees: ${t.errors.join(" | ")}`);
    else assert.deepEqual(t.errors, [], "smart-kg was expected NOT to see this: it types only bound properties");
  });
}

// ── the l1-library extension (owner rulings 2026-10-07) ─────────────────────

const LIB = "https://example.org/library/entry-1/manifest.jsonld";
const withLibrary = (d: Doc) => {
  d["@context"] = "http://smart.who.int/kg/l1-library.context.jsonld";
  d.nodes.push({ id: LIB, type: "library-node", label: "entry-1", properties: { iri: LIB, libraryClass: "https://litlfred.github.io/cat-harness/0.1.0/ns#SourceDocument", entry: "entry-1" }, derivation: "derived" });
  return d;
};

test("a publication may specialise its library source document (upstream)", { skip: ready ? false : NA }, () => {
  const d = withLibrary(structuredClone(base!));
  d.edges.push({ type: "Statement", predicate: "specializationOf", source: byType(d, "publication").id, target: LIB, derivation: "derived" });
  assert.deepEqual(check(d).errors, []);
});

test("a reference entry may resolve upstream to a library source that is not L1", { skip: ready ? false : NA }, () => {
  const d = withLibrary(structuredClone(base!));
  const r = byType(d, "reference-entry");
  r.properties.resolutionStatus = "resolved";
  d.edges.push({ type: "Statement", predicate: "resolvesTo", source: r.id, target: LIB, derivation: "inferred", note: "held by the library", evidence: { location: "fixture" } });
  assert.deepEqual(check(d).errors, []);
});

test("the layering rule holds: a library node may not point down into L1", { skip: ready ? false : NA }, () => {
  const d = withLibrary(structuredClone(base!));
  d.edges.push({ type: "Statement", predicate: "specializationOf", source: LIB, target: byType(d, "publication").id, derivation: "derived" });
  assert.ok(check(d).errors.some((m) => /not licensed/.test(m)));
});

test("plain L1 does not know the extension", { skip: ready ? false : NA }, () => {
  const d = structuredClone(base!);
  d.nodes.push({ id: LIB, type: "library-node", label: "x", properties: {}, derivation: "derived" });
  assert.ok(check(d).errors.some((m) => /does not declare/.test(m)));
});
