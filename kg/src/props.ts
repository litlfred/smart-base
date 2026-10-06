/**
 * Constructors for {@link PropertySpec}. One per FHIR type, so a property's
 * Zod schema and its FHIR element type cannot be chosen independently and
 * disagree.
 */
import { z } from "zod";

import type { PropertySpec } from "./ontology.ts";
import { enumOf, type CodeList } from "./vocab.ts";

const text = (fhir: "string" | "markdown") => (short: string, definition: string): PropertySpec => ({
  schema: z.string().min(1),
  fhir,
  short,
  definition,
});

export const p = {
  string: text("string"),
  markdown: text("markdown"),
  uri: (short: string, definition: string): PropertySpec => ({
    // Any absolute IRI, `urn:` included — a handle or an ISBN URN is as much
    // an identifier as an https URL, and FHIR `uri` admits both.
    schema: z.string().regex(/^[A-Za-z][A-Za-z0-9+.-]*:\S+$/, "an absolute IRI"),
    fhir: "uri",
    short,
    definition,
  }),
  /** FHIR `date`: YYYY, YYYY-MM or YYYY-MM-DD — WHO often dates a publication by year alone. */
  date: (short: string, definition: string): PropertySpec => ({
    schema: z.string().regex(/^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/, "a FHIR date: YYYY, YYYY-MM or YYYY-MM-DD"),
    fhir: "date",
    short,
    definition,
  }),
  sha256: (short: string, definition: string): PropertySpec => ({
    schema: z.string().regex(/^[0-9a-f]{64}$/, "64 lower-case hex digits"),
    fhir: "string",
    short,
    definition,
  }),
  unsignedInt: (short: string, definition: string): PropertySpec => ({
    schema: z.number().int().nonnegative(),
    fhir: "unsignedInt",
    short,
    definition,
  }),
  /**
   * A repeating text element (FHIR `0..*`), as Dublin Core's `creator` and
   * `identifier` are. A single string is also accepted: every smart-kg-era
   * document wrote `identifier` as one string, and refusing them would make
   * reuse a breaking change. The FHIR form is the array.
   */
  stringList: (short: string, definition: string): PropertySpec => ({
    schema: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
    fhir: "string",
    max: "*",
    short,
    definition,
  }),
  /** Mark a spec as defined by the class's parent model. */
  inherited: (spec: PropertySpec): PropertySpec => ({ ...spec, inherited: true }),
  code: (binding: CodeList, short: string, definition: string): PropertySpec => ({
    schema: enumOf(binding),
    fhir: "code",
    binding,
    short,
    definition,
  }),
};
