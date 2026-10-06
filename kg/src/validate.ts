/**
 * Check a knowledge-graph document: tier 1 (form, `graph.ts`) then tier 2
 * (against the ontology, `l1.ts`).
 *
 * Tier 2 is a port of smart-kg `tools/validate.mjs` `validateGraph`, rule for
 * rule and message for message, so a document's verdict does not depend on
 * which of the two checked it; `test/validate.test.ts` holds the two to the
 * same answers. It adds ONE rule smart-kg could not have, because l1.json did
 * not type properties: a property's VALUE must satisfy its declared type
 * (`publication.sha256` is 64 hex digits, `recommendation.strength` is a GRADE
 * code). That rule reports under its own prefix, `property value`, so a
 * reader can tell the new findings from the ported ones.
 *
 * Scope: the L1 layer. smart-kg's L2 layers import L1 and are not migrated
 * yet; a document naming another layer's context is refused with that reason
 * rather than checked against the wrong ontology.
 *
 *   npx tsx src/validate.ts path/to/graph.json [more.json ...]
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { GraphDocumentSchema, type GraphDocument } from "./graph.ts";
import { L1 } from "./l1.ts";
import { propertiesSchemaFor, type LayerSpec } from "./ontology.ts";

export interface Verdict {
  errors: string[];
  warnings: string[];
  metrics: Record<string, unknown>;
}

const RESOLVABLE = new Set(["unresolved", "resolved", "ambiguous"]);

/** Which layer a document names through its @context — smart-kg's rule. */
export function layerOf(doc: { "@context"?: unknown }): string {
  const ctx = typeof doc["@context"] === "string" ? doc["@context"] : "";
  const m = /\/(l\d+(?:-[a-z0-9]+)*)\.context\.jsonld$/.exec(ctx);
  return m ? m[1]! : "l1";
}

type AnyNode = { id: string; type: string; properties?: Record<string, unknown> };

/** Tier 2. `external`: nodes defined in sibling documents of the same graph. */
export function validateGraph(doc: GraphDocument, layer: LayerSpec = L1, external = new Map<string, AnyNode>()): Verdict {
  const errors: string[] = [];
  const warnings: string[] = [];
  const classes = new Map(layer.classes.map((c) => [c.id, c]));
  const openQualifier = new Set(layer.predicates.filter((p) => p.openQualifier).map((p) => p.predicate));
  const licensed = new Map<string, typeof layer.edges>();
  const between = new Map<string, Set<string>>();
  for (const e of layer.edges) {
    const key = `${e.predicate}|${e.source}|${e.target}`;
    if (!licensed.has(key)) licensed.set(key, []);
    licensed.get(key)!.push(e);
    const pair = `${e.source}|${e.target}`;
    if (!between.has(pair)) between.set(pair, new Set());
    between.get(pair)!.add(e.qualifier ? `${e.predicate} («${e.qualifier}»)` : e.predicate);
  }

  if (doc.ontologyVersion !== layer.schemaVersion) {
    errors.push(
      `ontologyVersion "${doc.ontologyVersion}" does not match the ontology's schemaVersion ` +
        `"${layer.schemaVersion}". Nothing below was checked.`,
    );
    return { errors, warnings, metrics: {} };
  }

  const nodes = new Map<string, GraphDocument["nodes"][number]>();
  for (const n of doc.nodes) {
    if (nodes.has(n.id)) errors.push(`duplicate node id "${n.id}"`);
    nodes.set(n.id, n);
    if (!classes.has(n.type)) errors.push(`node "${n.id}" has type "${n.type}", which the ontology does not declare`);
    if ((n.derivation === "inferred" || n.derivation === "decided") && !(n.note && n.evidence)) {
      errors.push(
        `node "${n.id}" is ${n.derivation} and carries no ${n.note ? "evidence" : "note"}. ` +
          `A claim that was not mechanically derived must say why and point at the source.`,
      );
    }
  }

  const byClass: Record<string, number> = {};
  for (const n of nodes.values()) byClass[n.type] = (byClass[n.type] ?? 0) + 1;
  const byPredicate: Record<string, number> = {};
  let crossDocument = 0;
  for (const e of doc.edges) {
    byPredicate[e.predicate] = (byPredicate[e.predicate] ?? 0) + 1;
    const s = nodes.get(e.source) ?? external.get(e.source);
    const t = nodes.get(e.target) ?? external.get(e.target);
    if (!s) {
      errors.push(`edge ${e.predicate} names source "${e.source}", which is defined in no document checked in this run`);
      continue;
    }
    if (!t) {
      errors.push(
        `edge ${e.predicate} names target "${e.target}", which is defined in no document checked in this run. ` +
          `If it belongs to another layer's document, pass that file too.`,
      );
      continue;
    }
    if ((external.has(e.source) && !nodes.has(e.source)) || (external.has(e.target) && !nodes.has(e.target))) crossDocument++;
    if (!classes.has(s.type) || !classes.has(t.type)) continue;
    const candidates = licensed.get(`${e.predicate}|${s.type}|${t.type}`);
    if (!candidates) {
      const alt = [...(between.get(`${s.type}|${t.type}`) ?? [])];
      errors.push(
        `edge "${s.type} ${e.predicate} ${t.type}" is not licensed by the ontology. ` +
          (alt.length
            ? `Between those classes the model licenses: ${alt.join(", ")}. ` +
              `An unlicensed edge is usually a missing intermediate node rather than a wrong predicate.`
            : `The model licenses no edge at all between those classes.`),
      );
      continue;
    }
    if (e.qualifier !== undefined && !openQualifier.has(e.predicate) && !candidates.some((c) => c.qualifier === e.qualifier)) {
      const known = candidates.map((c) => c.qualifier ?? "(none)").join(", ");
      warnings.push(
        `edge "${s.type} ${e.predicate} ${t.type}" carries qualifier «${e.qualifier}»; ` +
          `the model has: ${known}. More often a model that has moved on than a defect in the graph.`,
      );
    }
    if ((e.derivation === "inferred" || e.derivation === "decided") && !(e.note && e.evidence)) {
      errors.push(`edge "${s.type} ${e.predicate} ${t.type}" is ${e.derivation} and carries no ${e.note ? "evidence" : "note"}.`);
    }
  }

  // Property conformance: declared names (ported), then typed values (new).
  for (const n of nodes.values()) {
    const c = classes.get(n.type);
    if (!c) continue;
    const allowed = new Set(Object.keys(c.properties));
    for (const key of Object.keys(n.properties ?? {})) {
      if (!allowed.has(key)) errors.push(`node "${n.id}" (${n.type}) has property "${key}", which the class does not declare`);
    }
    const typed = propertiesSchemaFor(c).safeParse(
      Object.fromEntries(Object.entries(n.properties ?? {}).filter(([k]) => allowed.has(k))),
    );
    if (!typed.success) {
      for (const issue of typed.error.issues) {
        errors.push(`property value: node "${n.id}" (${n.type}) ${issue.path.join(".")}: ${issue.message}`);
      }
    }
  }

  for (const n of nodes.values()) {
    if (n.type !== "citation") continue;
    const status = n.properties?.resolutionStatus;
    const resolves = doc.edges.some((e) => e.predicate === "resolvesTo" && e.source === n.id);
    if (status === "resolved" && !resolves) errors.push(`citation "${n.id}" claims resolutionStatus "resolved" but has no resolvesTo edge`);
    if (resolves && status !== "resolved") warnings.push(`citation "${n.id}" has a resolvesTo edge but resolutionStatus is "${String(status)}"`);
    if (!n.properties?.text) errors.push(`citation "${n.id}" carries no verbatim text, so nothing can be checked against the source`);
  }

  const joins = { resolved: 0, unresolved: 0, ambiguous: 0 };
  for (const e of doc.edges) {
    const status = e.properties?.resolutionStatus;
    if (status === undefined) continue;
    if (typeof status !== "string" || !RESOLVABLE.has(status)) {
      errors.push(`edge "${e.predicate}" carries resolutionStatus "${String(status)}"; permitted values are ${[...RESOLVABLE].join(", ")}`);
      continue;
    }
    joins[status as keyof typeof joins]++;
    if (status !== "resolved") continue;
    const t = nodes.get(e.target) ?? external.get(e.target);
    const ts = t?.properties?.resolutionStatus;
    if (ts && ts !== "resolved") {
      errors.push(
        `edge "${e.predicate}" claims resolutionStatus "resolved" but its target "${e.target}" is itself "${String(ts)}". ` +
          `A join cannot be resolved against a placeholder.`,
      );
    }
    if ((e.derivation === "inferred" || e.derivation === "decided") && !e.evidence?.location) {
      errors.push(
        `edge "${e.predicate}" claims a resolved match but points at no evidence. A match made by string equality ` +
          `must say which file and which line it was made against.`,
      );
    }
  }

  return {
    errors,
    warnings,
    metrics: {
      nodes: nodes.size,
      edges: doc.edges.length,
      byClass,
      byPredicate,
      ...(joins.resolved + joins.unresolved + joins.ambiguous ? { joins } : {}),
      ...(crossDocument ? { crossDocumentEdges: crossDocument } : {}),
    },
  };
}

/** Tier 1 then tier 2, for one parsed JSON value. */
export function check(raw: unknown, external = new Map<string, AnyNode>()): Verdict {
  const layer = layerOf((raw ?? {}) as { "@context"?: unknown });
  if (layer !== "l1") {
    return {
      errors: [`layer "${layer}" is not migrated to this package yet (L1 only); check it with smart-kg tools/validate.mjs`],
      warnings: [],
      metrics: {},
    };
  }
  const parsed = GraphDocumentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((i) => `tier 1: ${i.path.join(".") || "(document)"}: ${i.message}`),
      warnings: [],
      metrics: {},
    };
  }
  return validateGraph(parsed.data, L1, external);
}

function main(argv: string[]): number {
  const files = argv.filter((a) => !a.startsWith("--"));
  if (!files.length) {
    console.error("usage: validate.ts <graph-document.json>...");
    return 2;
  }
  const docs = files.map((f) => ({ f, raw: JSON.parse(readFileSync(f, "utf8")) as { nodes?: AnyNode[] } }));
  const every = new Map<string, AnyNode>();
  for (const { raw } of docs) for (const n of raw.nodes ?? []) if (!every.has(n.id)) every.set(n.id, n);
  let failed = false;
  for (const { f, raw } of docs) {
    const v = check(raw, every);
    const m = v.metrics as { nodes?: number; edges?: number; byClass?: Record<string, number>; joins?: Record<string, number> };
    console.log(
      `${f} [l1]: ${m.nodes ?? "?"} nodes, ${m.edges ?? "?"} edges` +
        (m.byClass ? ` [${Object.entries(m.byClass).map(([k, n]) => `${k}:${n}`).join(" ")}]` : ""),
    );
    for (const w of v.warnings) console.warn(`  warning: ${w}`);
    for (const e of v.errors) console.error(`  error: ${e}`);
    if (v.errors.length) failed = true;
    else console.log("  conforms to the ontology");
  }
  return failed ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main(process.argv.slice(2)));
