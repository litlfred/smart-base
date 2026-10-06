/**
 * The shape of an ontology LAYER — what `ontology/<layer>/<layer>.json` held in
 * smart-kg — and the typed property declaration a class now carries.
 *
 * ## What the migration adds, and what it keeps
 *
 * smart-kg declared a class's properties as a list of NAMES. A checker could
 * say "this key is not declared" and nothing about its value; a FHIR tool had
 * nothing to build an element from. Here each property is a {@link PropertySpec}:
 * a Zod schema for its value, the FHIR type its logical-model element takes,
 * and the value set it binds to where the value is coded.
 *
 * The emitted ontology JSON ({@link toOntologyJson}) still lists names only,
 * byte-for-byte the smart-kg format, so tools written against smart-kg —
 * `validate.mjs`, `build-exports.mjs`, folio-assistant's pin snapshot — read
 * it unchanged. `test/parity.test.ts` holds that equality against a smart-kg
 * checkout.
 */
import { z } from "zod";

import type { CodeList } from "./vocab.ts";

/** FHIR primitive types an L1 property maps to. Deliberately a short list. */
export type FhirType = "string" | "markdown" | "uri" | "date" | "dateTime" | "code" | "integer" | "unsignedInt";

export interface PropertySpec {
  /** The value's schema. Every L1 property is optional on an instance. */
  schema: z.ZodType;
  fhir: FhirType;
  /** `"*"` when the element repeats (FHIR `0..*`). */
  max?: "*";
  /** Required binding to a code list from `vocab.ts`, for `fhir: "code"`. */
  binding?: CodeList;
  /** Set when the class's {@link ClassSpec.parent} already defines this element. */
  inherited?: true;
  short: string;
  definition: string;
}

/**
 * An existing model a class's logical model derives from — the REUSE
 * mechanism. The FSH emits `Parent:` and leaves out the elements the parent
 * already defines, so a publication IS a Dublin Core record with four
 * additions rather than a second, drifting copy of Dublin Core.
 */
export interface ParentModel {
  /** FSH name or FHIR type: `DublinCore` (smart-base), `Coding` (FHIR core). */
  name: string;
  where: string;
}

export interface ClassSpec {
  id: string;
  name: string;
  kind: "Source" | "Concept" | "Reference";
  iri: string;
  note: string;
  propertyNote?: string;
  parent?: ParentModel;
  /** An existing smart-base model this class corresponds to without deriving from it, and why not. */
  correspondsTo?: { name: string; why: string };
  /** Insertion order is the order smart-kg lists them in, and is kept. */
  properties: Record<string, PropertySpec>;
}

export const PredicateSchema = z
  .object({
    predicate: z.string().regex(/^[a-z][A-Za-z0-9]*$/),
    iri: z.string().url(),
    note: z.string().min(1),
    openQualifier: z.boolean().optional(),
  })
  .strict();

export const EdgeRuleSchema = z
  .object({
    predicate: z.string(),
    source: z.string(),
    target: z.string(),
    qualifier: z.string().optional(),
    note: z.string().optional(),
  })
  .strict();

export const GroundingSchema = z.object({ what: z.string(), where: z.string(), detail: z.string() }).strict();

/** A class as the ontology JSON states it: properties by NAME. */
export const OntologyClassSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    name: z.string().min(1),
    kind: z.enum(["Source", "Concept", "Reference"]),
    iri: z.string().url(),
    note: z.string().min(1),
    properties: z.array(z.string()),
    propertyNote: z.string().optional(),
    elaborates: z.string().optional(),
  })
  .strict();

/** One ontology layer document — the smart-kg `<layer>.json` format. */
export const OntologyLayerSchema = z
  .object({
    schemaVersion: z.string(),
    layer: z.string(),
    namespace: z.string().url(),
    source: z.string(),
    note: z.string(),
    imports: z.array(z.string()).optional(),
    groundedIn: z.array(GroundingSchema),
    predicates: z.array(PredicateSchema),
    classes: z.array(OntologyClassSchema),
    edges: z.array(EdgeRuleSchema),
  })
  .strict()
  .superRefine((o, ctx) => {
    // The integrity a reader of the JSON assumes: every edge names declared
    // classes and a declared predicate. smart-kg checked this only implicitly,
    // by validate.mjs failing on documents; here the ontology itself fails.
    const classes = new Set(o.classes.map((c) => c.id));
    const predicates = new Set(o.predicates.map((p) => p.predicate));
    o.edges.forEach((e, i) => {
      for (const end of ["source", "target"] as const) {
        if (!classes.has(e[end]) && !(o.imports?.length)) {
          ctx.addIssue({ code: "custom", path: ["edges", i, end], message: `"${e[end]}" is not a class of this layer` });
        }
      }
      if (!predicates.has(e.predicate) && !(o.imports?.length)) {
        ctx.addIssue({ code: "custom", path: ["edges", i, "predicate"], message: `"${e.predicate}" is not a predicate of this layer` });
      }
    });
    const ids = o.classes.map((c) => c.id);
    const dup = ids.find((id, i) => ids.indexOf(id) !== i);
    if (dup) ctx.addIssue({ code: "custom", path: ["classes"], message: `class "${dup}" is declared twice` });
  });

export type OntologyLayer = z.infer<typeof OntologyLayerSchema>;
export type Predicate = z.infer<typeof PredicateSchema>;
export type EdgeRule = z.infer<typeof EdgeRuleSchema>;
export type Grounding = z.infer<typeof GroundingSchema>;

/** A layer as authored here: classes carry typed property specs. */
export interface LayerSpec {
  schemaVersion: string;
  layer: string;
  namespace: string;
  source: string;
  note: string;
  groundedIn: Grounding[];
  predicates: Predicate[];
  classes: ClassSpec[];
  edges: EdgeRule[];
}

/** Project a typed layer to the smart-kg JSON format (property names only). */
export function toOntologyJson(l: LayerSpec): OntologyLayer {
  return OntologyLayerSchema.parse({
    schemaVersion: l.schemaVersion,
    layer: l.layer,
    namespace: l.namespace,
    source: l.source,
    note: l.note,
    groundedIn: l.groundedIn,
    predicates: l.predicates,
    classes: l.classes.map((c) => ({
      id: c.id,
      name: c.name,
      kind: c.kind,
      iri: c.iri,
      note: c.note,
      properties: Object.keys(c.properties),
      ...(c.propertyNote ? { propertyNote: c.propertyNote } : {}),
    })),
    edges: l.edges,
  });
}

/** The strict Zod object an instance's `properties` must satisfy for a class. */
export function propertiesSchemaFor(c: ClassSpec): z.ZodType {
  const shape: Record<string, z.ZodType> = {};
  for (const [name, p] of Object.entries(c.properties)) shape[name] = p.schema.optional();
  return z.object(shape).strict();
}
