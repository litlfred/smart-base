import { describe, expect, test } from "bun:test";
import { DakDataDictionaryAnnexSchema, DakSwimlaneMapSchema } from "./dak-annexes";

describe("dak-annexes", () => {
  const annex = {
    $schema: "dak-data-dictionary/v1",
    title: "Core data dictionary",
    source: { label: "x.xlsx", sha256: "a".repeat(64) },
    idColumn: "data element id",
    sheets: [{ name: "S", columns: [{ key: "data element id", label: "Data element ID" }], rows: [["IMMZ.C.DE.1"]] }],
  };

  test("a data-dictionary annex parses, and a ragged row or a stray key does not", () => {
    expect(DakDataDictionaryAnnexSchema.safeParse(annex).success).toBe(true);
    const ragged = structuredClone(annex);
    ragged.sheets[0]!.rows.push(["a", "b"]);
    expect(DakDataDictionaryAnnexSchema.safeParse(ragged).success).toBe(false);
    expect(DakDataDictionaryAnnexSchema.safeParse({ ...annex, extra: 1 }).success).toBe(false);
  });

  test("a swimlane map parses; a persona's aliases must be a list", () => {
    const map = { $schema: "dak-swimlanes/v1", personas: { "Health worker": ["HW"] }, notPersonas: { Function: "header lane" } };
    expect(DakSwimlaneMapSchema.safeParse(map).success).toBe(true);
    expect(DakSwimlaneMapSchema.safeParse({ ...map, personas: { "Health worker": "HW" } }).success).toBe(false);
  });
});
