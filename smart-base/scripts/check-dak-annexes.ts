#!/usr/bin/env bun
/**
 * check-dak-annexes.ts — what a DAK's annexes SAY is consistent, not only how
 * they are shaped.
 *
 * The `dak-annex` kind (typologies/dak-annex.json) is TYPED by its validators:
 * `check:kind-validators` parses every node against `dak-data-dictionary/v1`
 * or `dak-swimlanes/v1`. Typing is not judging (`audit-coverage`: a kind can
 * parse perfectly while nothing has an opinion about what it says), and the
 * kind read `typed-only` the day it arrived (folio-assistant#2529). This is
 * the opinion, kept to rules a schema cannot state:
 *
 * - **data dictionary** — every sheet that has rows declares the `idColumn`;
 *   every row has exactly one cell per column; every data element id is
 *   present, and no id is used twice across the workbook. A repeated or empty
 *   id is a dictionary a reader cannot look a data element up in.
 * - **swimlanes** — no lane word is BOTH a persona's alias (or its name) and a
 *   declared not-a-persona, and no alias belongs to two personas. Either makes
 *   the mapping `dak-swimlanes.ts` reads ambiguous, and a lane would be linked
 *   to whichever entry it met first.
 *
 * - **references** — what the annexes name resolves in the SAME instance's
 *   artefact index (the directory it declares `fhir-artifact-index`): every
 *   data element id belongs to a CodeSystem the index lists (`IMMZ.C.DE.1` to
 *   `IMMZ.C`), and every annex record in the index's `annexes.json` names a
 *   file that exists and, for a dictionary, columns every sheet with rows
 *   has. Persona aliases are NOT resolved: the index carries no persona
 *   artefact to resolve them against, and the run says so rather than
 *   counting them as resolved.
 *
 * Every `dak-annex` directory any instance in the checkout declares is read,
 * through the declarations — never a hard-coded path.
 *
 *   bun run smart-base/scripts/check-dak-annexes.ts
 *
 * Exit: 0 consistent, 1 a finding, 2 nothing to judge could be read.
 *
 * @module smart-base/scripts/check-dak-annexes
 * @covers dak-annex
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

import { directoriesForGraph, instanceRootsIn, repoRootFor } from "../platform/index.js";
import {
  DAK_DATA_DICTIONARY_SCHEMA,
  DAK_SWIMLANES_SCHEMA,
  DakDataDictionaryAnnexSchema,
  DakSwimlaneMapSchema,
  type DakDataDictionaryAnnex,
  type DakSwimlaneMap,
} from "../schemas/dak-annexes.ts";

/** Findings about one data dictionary. */
export function judgeDictionary(d: DakDataDictionaryAnnex): string[] {
  const out: string[] = [];
  const seen = new Map<string, string>();
  for (const sheet of d.sheets) {
    if (sheet.rows.length === 0) continue;
    const idAt = sheet.columns.findIndex((c) => c.key === d.idColumn);
    if (idAt < 0) {
      out.push(`sheet "${sheet.name}" has rows but no "${d.idColumn}" column`);
      continue;
    }
    sheet.rows.forEach((row, i) => {
      const where = `sheet "${sheet.name}" row ${i + 1}`;
      if (row.length !== sheet.columns.length) out.push(`${where} has ${row.length} cell(s) for ${sheet.columns.length} column(s)`);
      const id = (row[idAt] ?? "").trim();
      if (id === "") {
        out.push(`${where} has no ${d.idColumn}`);
        return;
      }
      const first = seen.get(id);
      if (first !== undefined) out.push(`${d.idColumn} "${id}" is used twice: ${first} and ${where}`);
      else seen.set(id, where);
    });
  }
  return out;
}

/** Findings about one swimlane declaration. */
export function judgeSwimlanes(m: DakSwimlaneMap): string[] {
  const out: string[] = [];
  const owner = new Map<string, string>();
  for (const [persona, aliases] of Object.entries(m.personas)) {
    for (const word of [persona, ...aliases]) {
      const prior = owner.get(word);
      if (prior !== undefined && prior !== persona) out.push(`"${word}" names two personas: "${prior}" and "${persona}"`);
      else owner.set(word, persona);
    }
  }
  for (const lane of Object.keys(m.notPersonas)) {
    const persona = owner.get(lane);
    if (persona !== undefined) out.push(`"${lane}" is declared not a persona, and is also persona "${persona}"`);
  }
  return out;
}

/** The CodeSystem ids an artefact index lists (`index.json`, `artifacts[]`). */
export function codeSystemsIn(index: unknown): Set<string> {
  const arts = (index as { artifacts?: { resourceType?: unknown; id?: unknown }[] }).artifacts ?? [];
  return new Set(arts.filter((a) => a.resourceType === "CodeSystem" && typeof a.id === "string").map((a) => a.id as string));
}

/**
 * Findings about the data element ids a dictionary names: each must belong to
 * a CodeSystem the index lists, as a dot-separated prefix of the id.
 */
export function judgeDictionaryReferences(d: DakDataDictionaryAnnex, codeSystems: ReadonlySet<string>): string[] {
  const out: string[] = [];
  for (const sheet of d.sheets) {
    const idAt = sheet.columns.findIndex((c) => c.key === d.idColumn);
    if (idAt < 0) continue; // judgeDictionary reports it
    sheet.rows.forEach((row, i) => {
      const id = (row[idAt] ?? "").trim();
      if (id === "") return; // judgeDictionary reports it
      const parts = id.split(".");
      const owned = parts.some((_, n) => n > 0 && codeSystems.has(parts.slice(0, n).join(".")));
      if (!owned) out.push(`sheet "${sheet.name}" row ${i + 1}: ${d.idColumn} "${id}" belongs to no CodeSystem the artefact index lists`);
    });
  }
  return out;
}

/** One record of an index's `annexes.json`: the page that shows an annex, the file it reads, and for a dictionary the columns it shows. */
export interface AnnexRecord {
  page?: string;
  file?: string;
  columns?: string[];
}

/**
 * Findings about the annex records of one index: each names a file that
 * exists (relative to the index directory), and each column a dictionary view
 * shows is a column of every sheet that has rows.
 */
export function judgeAnnexRecords(
  records: AnnexRecord[],
  indexDir: string,
  read: (abs: string) => string | undefined,
): string[] {
  const out: string[] = [];
  for (const r of records) {
    const label = r.page ?? r.file ?? "(unnamed record)";
    if (typeof r.file !== "string" || r.file === "") {
      out.push(`annex record "${label}" names no file`);
      continue;
    }
    const abs = resolve(indexDir, r.file);
    const text = read(abs);
    if (text === undefined) {
      out.push(`annex record "${label}" names ${r.file}, which does not exist`);
      continue;
    }
    if (!r.columns || r.columns.length === 0) continue;
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = undefined;
    }
    const parsed = DakDataDictionaryAnnexSchema.safeParse(json);
    if (!parsed.success) {
      out.push(`annex record "${label}" shows columns of ${r.file}, which is not a ${DAK_DATA_DICTIONARY_SCHEMA}`);
      continue;
    }
    for (const sheet of parsed.data.sheets.filter((s) => s.rows.length > 0)) {
      const keys = new Set(sheet.columns.map((c) => c.key));
      for (const col of r.columns) if (!keys.has(col)) out.push(`annex record "${label}" shows column "${col}", which sheet "${sheet.name}" does not have`);
    }
  }
  return out;
}

/** Judge one file; `undefined` when it is not a node of this kind. */
export function judgeFile(text: string): { schema: string; findings: string[] } | undefined {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return undefined;
  }
  const schema = (json as { $schema?: unknown }).$schema;
  if (schema === DAK_DATA_DICTIONARY_SCHEMA) {
    const r = DakDataDictionaryAnnexSchema.safeParse(json);
    return { schema, findings: r.success ? judgeDictionary(r.data) : [`does not parse as ${schema}: ${r.error.issues[0]?.message}`] };
  }
  if (schema === DAK_SWIMLANES_SCHEMA) {
    const r = DakSwimlaneMapSchema.safeParse(json);
    return { schema, findings: r.success ? judgeSwimlanes(r.data) : [`does not parse as ${schema}: ${r.error.issues[0]?.message}`] };
  }
  return undefined;
}

function readOrUndefined(abs: string): string | undefined {
  try {
    return readFileSync(abs, "utf-8");
  } catch {
    return undefined;
  }
}

function main(): number {
  const repo = repoRootFor(resolve(import.meta.dir, ".."));
  const dirs = new Set<string>();
  /** Each dak-annex directory's instance's artefact index directories. */
  const indexesOf = new Map<string, string[]>();
  for (const inst of instanceRootsIn(repo)) {
    const indexes = directoriesForGraph(inst, "fhir-artifact-index");
    for (const d of directoriesForGraph(inst, "dak-annex")) {
      dirs.add(d);
      indexesOf.set(d, indexes);
    }
  }
  if (dirs.size === 0) {
    console.log("check:dak-annexes — no instance here declares a dak-annex directory; nothing to judge.");
    return 0;
  }
  let judged = 0;
  let findings = 0;
  for (const dir of [...dirs].sort()) {
    if (!existsSync(dir)) {
      console.error(`✗ ${relative(repo, dir)}: declared, and absent from this checkout`);
      return 2;
    }
    const indexes = (indexesOf.get(dir) ?? []).filter((d) => existsSync(join(d, "index.json")));
    const codeSystems = new Set<string>();
    for (const d of indexes) for (const c of codeSystemsIn(JSON.parse(readFileSync(join(d, "index.json"), "utf-8")))) codeSystems.add(c);
    for (const f of readdirSync(dir).filter((n) => n.endsWith(".json")).sort()) {
      const text = readFileSync(join(dir, f), "utf-8");
      const r = judgeFile(text);
      if (r === undefined) continue;
      judged++;
      const rel = relative(repo, join(dir, f));
      if (r.schema === DAK_DATA_DICTIONARY_SCHEMA && r.findings.length === 0) {
        if (indexes.length === 0) r.findings.push("its instance declares no artefact index with an index.json, so the data element ids it names resolve against nothing");
        else r.findings.push(...judgeDictionaryReferences(DakDataDictionaryAnnexSchema.parse(JSON.parse(text)), codeSystems));
      }
      if (r.schema === DAK_SWIMLANES_SCHEMA) console.log(`  · ${rel}: persona aliases not resolved — the artefact index carries no persona artefact`);
      if (r.findings.length === 0) console.log(`✓ ${rel} (${r.schema})`);
      for (const x of r.findings) console.error(`✗ ${rel}: ${x}`);
      findings += r.findings.length;
    }
    for (const d of indexes) {
      const recordsAt = join(d, "annexes.json");
      if (!existsSync(recordsAt)) continue;
      const records = JSON.parse(readFileSync(recordsAt, "utf-8")) as AnnexRecord[];
      const found = judgeAnnexRecords(records, dirname(recordsAt), readOrUndefined);
      const rel = relative(repo, recordsAt);
      if (found.length === 0) console.log(`✓ ${rel} (${records.length} annex record(s) resolve)`);
      for (const x of found) console.error(`✗ ${rel}: ${x}`);
      findings += found.length;
    }
  }
  if (judged === 0) {
    console.error("check:dak-annexes — dak-annex directories are declared, and none holds a node to judge.");
    return 2;
  }
  console.log(`check:dak-annexes — ${judged} annex(es) judged, ${findings} finding(s).`);
  return findings > 0 ? 1 : 0;
}

if (import.meta.main) process.exit(main());
