import { describe, expect, test } from "bun:test";

import { codeSystemsIn, judgeAnnexRecords, judgeDictionary, judgeDictionaryReferences, judgeFile, judgeSwimlanes } from "./check-dak-annexes.ts";

const sheet = (rows: string[][]) => ({ name: "S", columns: [{ key: "data element id", label: "ID" }, { key: "label", label: "Label" }], rows });
const dict = (sheets: ReturnType<typeof sheet>[]) => ({
  $schema: "dak-data-dictionary/v1" as const,
  title: "t",
  source: { label: "x.xlsx", sha256: "0".repeat(64) },
  idColumn: "data element id",
  sheets,
});

describe("the data dictionary is judged, not only typed", () => {
  test("a consistent dictionary has no finding", () => {
    expect(judgeDictionary(dict([sheet([["A.1", "a"], ["A.2", "b"]])]))).toEqual([]);
  });
  test("an id used twice, across sheets, is a finding", () => {
    expect(judgeDictionary(dict([sheet([["A.1", "a"]]), sheet([["A.1", "b"]])])).join()).toContain('"A.1" is used twice');
  });
  test("an empty id and a short row are findings", () => {
    const f = judgeDictionary(dict([sheet([["", "a"], ["A.2"]])]));
    expect(f.some((x) => x.includes("has no data element id"))).toBe(true);
    expect(f.some((x) => x.includes("1 cell(s) for 2 column(s)"))).toBe(true);
  });
});

describe("the swimlane declaration is unambiguous", () => {
  test("a lane that is both a persona alias and not a persona is a finding", () => {
    expect(judgeSwimlanes({ $schema: "dak-swimlanes/v1", personas: { "Health worker": ["HW"] }, notPersonas: { HW: "header" } }).join()).toContain('"HW" is declared not a persona');
  });
  test("an alias claimed by two personas is a finding", () => {
    expect(judgeSwimlanes({ $schema: "dak-swimlanes/v1", personas: { A: ["X"], B: ["X"] }, notPersonas: {} }).join()).toContain('"X" names two personas');
  });
  test("a file of another kind is not judged here", () => {
    expect(judgeFile('{"$schema":"something-else/v1"}')).toBeUndefined();
  });
});

describe("what the annexes name resolves in the instance's artefact index", () => {
  const index = { artifacts: [{ resourceType: "CodeSystem", id: "A" }, { resourceType: "ValueSet", id: "B" }] };
  test("the index's CodeSystems, and only those", () => {
    expect([...codeSystemsIn(index)]).toEqual(["A"]);
  });
  test("a data element id under a listed CodeSystem resolves", () => {
    expect(judgeDictionaryReferences(dict([sheet([["A.DE.1", "a"]])]), codeSystemsIn(index))).toEqual([]);
  });
  test("an id under no listed CodeSystem is a finding, and a ValueSet does not count", () => {
    const f = judgeDictionaryReferences(dict([sheet([["B.DE.1", "a"], ["Z.DE.2", "b"]])]), codeSystemsIn(index));
    expect(f).toHaveLength(2);
    expect(f[0]).toContain('"B.DE.1" belongs to no CodeSystem');
  });
  test("a prefix must end at a dot: AB.DE.1 is not under A", () => {
    expect(judgeDictionaryReferences(dict([sheet([["AB.DE.1", "a"]])]), codeSystemsIn(index))).toHaveLength(1);
  });

  const files: Record<string, string> = {
    "/ig/dict.json": JSON.stringify(dict([sheet([["A.DE.1", "a"]])])),
    "/ig/index/page.md": "# page",
  };
  const read = (abs: string) => files[abs];
  test("records whose files exist and whose columns every sheet has resolve", () => {
    expect(judgeAnnexRecords([{ page: "d.md", file: "../dict.json", columns: ["data element id", "label"] }, { page: "p.md", file: "page.md" }], "/ig/index", read)).toEqual([]);
  });
  test("a missing file, and a column no sheet has, are findings", () => {
    const f = judgeAnnexRecords([{ page: "x.md", file: "gone.md" }, { page: "d.md", file: "../dict.json", columns: ["required"] }], "/ig/index", read);
    expect(f.join()).toContain("gone.md, which does not exist");
    expect(f.join()).toContain('column "required"');
  });
  test("columns over a file that is not a dictionary is a finding, not a crash", () => {
    expect(judgeAnnexRecords([{ page: "p.md", file: "page.md", columns: ["x"] }], "/ig/index", read).join()).toContain("is not a dak-data-dictionary/v1");
  });
});
