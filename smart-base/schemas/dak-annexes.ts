/**
 * The two DAK annex formats the litlfred/smart-* IG sites carry beside their
 * artefact index, as Zod schemas a `folio-validator/v1` node can name.
 *
 * - `dak-data-dictionary/v1`: a DAK's core data dictionary workbook as JSON,
 *   loaded on demand by the IG site's annex view
 *   (`scripts/dak-data-dictionary.ts`).
 * - `dak-swimlanes/v1`: the declared mapping from a DAK's generic personas to
 *   the swimlanes of its business-process figures
 *   (`scripts/dak-swimlanes.ts`).
 *
 * Declared here so the files are judged, not only typed: until 2026-10-11
 * each format was a TypeScript type and a `$schema` string, and
 * `check:kind-validators:require-all` reported both families as unmapped.
 *
 * @module smart-base/schemas/dak-annexes
 */
import { z } from "zod";
import { nodeKind } from "../../cat-harness/schemas/node-kind.ts";

export const DAK_DATA_DICTIONARY_SCHEMA = "dak-data-dictionary/v1";
export const DAK_SWIMLANES_SCHEMA = "dak-swimlanes/v1";

/** One sheet of the workbook: its columns (stable key, header as written) and the rows that carry an id. */
export const DakAnnexSheetSchema = z
  .object({
    name: z.string().min(1),
    columns: z.array(z.object({ key: z.string().min(1), label: z.string() }).strict()),
    rows: z.array(z.array(z.string())),
  })
  .strict()
  .refine((s) => s.rows.every((r) => r.length === s.columns.length), {
    message: "every row has one cell per column",
  });

export const DakDataDictionaryAnnexSchema = z
  .object({
    $schema: z.literal(DAK_DATA_DICTIONARY_SCHEMA),
    title: z.string().min(1),
    /** The workbook it was read from, and the sha256 of its bytes. */
    source: z.object({ label: z.string().min(1), sha256: z.string().regex(/^[0-9a-f]{64}$/) }).strict(),
    /** The column key that identifies a data element. */
    idColumn: z.string().min(1),
    sheets: z.array(DakAnnexSheetSchema),
  })
  .strict();
export type DakDataDictionaryAnnex = z.infer<typeof DakDataDictionaryAnnexSchema>;
export type DakAnnexSheet = z.infer<typeof DakAnnexSheetSchema>;

export const DakSwimlaneMapSchema = z
  .object({
    $schema: z.literal(DAK_SWIMLANES_SCHEMA),
    /** Persona as named on the personas page -> the words a lane uses for it. */
    personas: z.record(z.string().min(1), z.array(z.string().min(1))),
    /** Lane words that are deliberately not personas -> why. */
    notPersonas: z.record(z.string().min(1), z.string().min(1)),
  })
  .strict();
export type DakSwimlaneMap = z.infer<typeof DakSwimlaneMapSchema>;

/**
 * The two annex formats as node kinds (issue #2195), so `validators/dak-data-dictionary.json`
 * and `validators/dak-swimlanes.json` name kinds and `node-kinds:check` files each
 * family under one. Unversioned: the family's tag is not SemVer, so the `$schema` literal stays a
 * field of the shape rather than one `nodeKind()` generates.
 * Strict, as the schemas are.
 */
export const DakDataDictionaryAnnexKind = nodeKind("dak-data-dictionary", [], DakDataDictionaryAnnexSchema.shape, { strict: true });
export const DakSwimlaneMapKind = nodeKind("dak-swimlanes", [], DakSwimlaneMapSchema.shape, { strict: true });
