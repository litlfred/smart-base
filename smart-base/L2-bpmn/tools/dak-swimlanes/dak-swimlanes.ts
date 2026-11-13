#!/usr/bin/env bun
/**
 * dak-swimlanes.ts: one BPMN XML, swimlane structure, lane/participant →
 * ActorDefinition, and persona ↔ swimlane crosswalk tool for smart-base
 * (bean `folio-assistant-tgaj`, consolidating `.github/skills/bpmn_author`,
 * `.github/skills/bpmn_import`, `.github/skills/bpmn_layout`, and
 * `smart-base/scripts/dak-swimlanes.ts`).
 *
 * ## Two modes, one source of truth
 *
 * 1. **BPMN XML, swimlane structure, and actor resolution** (`--check`,
 *    `--changed [base]`, `[<file.bpmn|dir>...]`):
 *    - `BPMN-XML-001`..`005`: well-formed XML, `<bpmn:definitions>` root in the
 *      OMG BPMN 2.0 namespace (`http://www.omg.org/spec/BPMN/20100524/MODEL`),
 *      no forbidden vendor namespaces (Zeebe, Camunda, Camunda Modeler), at
 *      least one `<bpmn:process>`, and no duplicate `@id` attributes.
 *    - `SWIM-001`..`004`: every process has a `<bpmn:laneSet>` with at least
 *      one `<bpmn:lane>` (or a `<bpmn:collaboration>` with named participants),
 *      every lane has a unique `@id` and `@name`, lane `@id`s are FSH-valid,
 *      and every top-level flow node in a process with lanes belongs to a lane
 *      via `<bpmn:flowNodeRef>`.
 *    - `ACTOR-001`..`002`: every innermost `<bpmn:lane>` and lane-less
 *      `<bpmn:participant>` resolves to an `ActorDefinition` parsed from
 *      `input/fsh/` `.fsh` files (`Instance:` ID, `name`, `title` — never by
 *      guessing a filename from the lane ID) or `input/actors/` `.json` files,
 *      or to a declared role in `scenarios/roles.json` when the lane binds a
 *      harness role (`partitionElementRef` / `<bootstrap.processes:role>`).
 *    - Discovers `.bpmn` files from declared `processes` and
 *      `business-processes` graph directories (`smart-base.json` and nested
 *      `graph.json` subgraphs), with `input/bpmn/` as the IG convention
 *      fallback.
 *
 * 2. **Persona ↔ swimlane crosswalk and web annex** (`--ig-src <IG repo>
 *    --map <swimlanes.json> --out <dir> [--check]`):
 *    - Reads personas from `input/pagecontent/personas.md`, enumerated
 *      processes from `input/pagecontent/business-processes.md`, and lane
 *      headings from Visio `.svg` figures, cross-referencing them through a
 *      declared `dak-swimlanes/v1` map (`swimlanes.json`) and writing
 *      `personas-swimlanes.md`, `processes-swimlanes.md`, and
 *      `swimlanes.qa-results.json`.
 *
 * @module smart-base/L2-bpmn/tools/dak-swimlanes/dak-swimlanes
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

import { DOMParser } from "@xmldom/xmldom";

import { defineTool, toolFactory } from "../../../platform/index.js";
import { DakSwimlaneMapSchema, type DakSwimlaneMap } from "../../../schemas/dak-annexes.ts";

export type SwimlaneMap = DakSwimlaneMap;

export interface Process {
  letter: string;
  name: string;
  anchor: string;
  figure?: string;
}

/** kramdown's auto_ids. */
export const kramdownId = (t: string) => t.trim().toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/ /g, "-");

/** A persona's anchor on the personas page. */
export const personaAnchor = (p: string) => `persona-${kramdownId(p.replace(/\([^)]*\)/g, "")).replace(/-+$/, "")}`;

const HTML_ENTITIES: Readonly<Record<string, string>> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};
const decode = (s: string) => s.replace(/&(?:amp|lt|gt|quot|#39);/g, (m) => HTML_ENTITIES[m] ?? m);

export function personasFrom(md: string): string[] {
  return [...md.matchAll(/<tr>\s*<td>([^<]*)<\/td>/g)].map((m) => decode(m[1]!).replace(/\s+/g, " ").trim()).filter(Boolean);
}

export function processesFrom(md: string): Process[] {
  const out: Process[] = [];
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const h = /^#{2,6}[ \t]+(.+?)[ \t#]*$/.exec(lines[i]!);
    if (!h) continue;
    const text = h[1]!.trim();
    const m = /^([A-Z0-9]{1,3})\s*\.\s+(.+)$/.exec(text);
    if (!m) continue;
    let figure: string | undefined;
    for (let j = i + 1; j < lines.length && !/^#{1,6}\s/.test(lines[j]!); j++) {
      const f = /src="([^"]+\.svg)"/.exec(lines[j]!) ?? /\]\(([^)]+\.svg)\)/.exec(lines[j]!);
      if (f) { figure = f[1]; break; }
    }
    out.push({ letter: m[1]!, name: m[2]!.trim(), anchor: kramdownId(text), ...(figure ? { figure } : {}) });
  }
  return out;
}

/** A Visio export's lane titles. */
export function lanesFrom(svg: string): string[] {
  return [...svg.matchAll(/v:nameU="visHeadingText"[\s\S]*?v:val="VT4\(([\s\S]*?)\)"/g)].map((m) => decode(m[1]!).replace(/\s+/g, " ").trim()).filter(Boolean);
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Which declared personas a lane names, and what of it nothing accounts for. */
export function resolveLane(lane: string, map: SwimlaneMap): { personas: string[]; rest: string } {
  let rest = ` ${lane} `;
  const personas: string[] = [];
  const words = [
    ...Object.entries(map.personas).flatMap(([p, al]) => [p, ...al].map((w) => ({ w, p }))),
    ...Object.keys(map.notPersonas).map((w) => ({ w, p: undefined as string | undefined })),
  ].sort((a, b) => b.w.length - a.w.length);
  for (const { w, p } of words) {
    const re = new RegExp(`(^|[\\s/,])${esc(w)}(?=$|[\\s/,])`, "i");
    if (re.test(rest)) {
      rest = rest.replace(re, "$1 ");
      if (p && !personas.includes(p)) personas.push(p);
    }
  }
  rest = rest.replace(/\b(or|and)\b/gi, " ").replace(/[\s/,]+/g, " ").trim();
  return { personas, rest };
}

export interface Crosswalk {
  rows: { process: Process; lane: string; personas: string[]; rest: string }[];
  personaProcesses: Map<string, Process[]>;
  undeclaredPersonas: string[];
}

export function crosswalk(personas: string[], processes: Process[], lanesOf: (figure: string) => string[], map: SwimlaneMap): Crosswalk {
  const rows: Crosswalk["rows"] = [];
  const personaProcesses = new Map<string, Process[]>(personas.map((p) => [p, []]));
  for (const pr of processes) {
    if (!pr.figure) continue;
    // A figure repeats a lane title (one per lane shape, and the pool's own): one row each.
    for (const lane of [...new Set(lanesOf(pr.figure))]) {
      const r = resolveLane(lane, map);
      rows.push({ process: pr, lane, ...r });
      for (const p of r.personas) {
        const list = personaProcesses.get(p);
        if (list && !list.includes(pr)) list.push(pr);
      }
    }
  }
  return { rows, personaProcesses, undeclaredPersonas: Object.keys(map.personas).filter((p) => !personas.includes(p)) };
}

const NOTE = "<!-- Generated by smart-base/scripts/dak-swimlanes.ts from the personas page, the business-process figures and swimlanes.json. Do not edit; change those and regenerate. -->";

export function personasMarkdown(personas: string[], cw: Crosswalk, processesPage: string): string {
  const lines = [NOTE, "", "### Where each persona appears in the business processes", "",
    "Each generic persona above, with the business processes whose swimlanes name it. A persona with no swimlane is listed too: that is a gap between the personas and the processes, not an omission here.", "",
    "| Persona | Business processes |", "|---|---|"];
  for (const p of personas) {
    const procs = cw.personaProcesses.get(p) ?? [];
    const cell = procs.length ? procs.map((x) => `[${x.letter}. ${x.name}](${processesPage}#${x.anchor})`).join(", ") : "_no swimlane in any process_";
    lines.push(`| <span id="${personaAnchor(p)}"></span>${p} | ${cell} |`);
  }
  return `${lines.join("\n")}\n`;
}

export function processesMarkdown(cw: Crosswalk, map: SwimlaneMap, personasPage: string): string {
  const lines = [NOTE, "", "### Swimlanes and personas", "",
    "The swimlanes of each process figure, and the generic persona each one is. A lane that is deliberately not a persona says why; a lane nothing accounts for is marked.", "",
    "| Process | Swimlane | Persona | Note |", "|---|---|---|---|"];
  for (const r of cw.rows) {
    const persona = r.personas.map((p) => `[${p}](${personasPage}#${personaAnchor(p)})`).join(", ") || "—";
    const why = Object.entries(map.notPersonas).filter(([w]) => new RegExp(`(^|[\\s/,])${esc(w)}($|[\\s/,])`, "i").test(` ${r.lane} `)).map(([, y]) => y);
    const note = r.rest ? `**not a declared persona:** ${r.rest}` : why.join("; ");
    lines.push(`| [${r.process.letter}](#${r.process.anchor}) | ${r.lane} | ${persona} | ${note} |`);
  }
  return `${lines.join("\n")}\n`;
}

export function swimlaneQa(subject: string, producer: { script: string; script_hash: string }, personas: string[], cw: Crosswalk) {
  const noLane = personas.filter((p) => !(cw.personaProcesses.get(p) ?? []).length).map((p) => ({ persona: p }));
  const noPersona = cw.rows.filter((r) => r.rest).map((r) => ({ process: `${r.process.letter}. ${r.process.name}`, figure: r.process.figure, lane: r.lane, unaccounted: r.rest }));
  const undeclared = cw.undeclaredPersonas.map((p) => ({ persona: p }));
  return {
    $schema: "qa-results/v1",
    producer,
    subject: { kind: "fhir-ig", id: subject },
    families: {
      "persona-without-swimlane": { summary: "a generic persona that no business-process swimlane names", count: noLane.length, entries: noLane },
      "swimlane-without-persona": { summary: "a swimlane whose label names no declared persona and is not declared as deliberately not one", count: noPersona.length, entries: noPersona },
      "declared-persona-not-on-page": { summary: "a persona swimlanes.json declares that the personas page does not list", count: undeclared.length, entries: undeclared },
    },
    total: noLane.length + noPersona.length + undeclared.length,
  };
}

// ── BPMN XML, swimlane structure, and ActorDefinition validation ──────────

export const BPMN_MODEL_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";

export const FORBIDDEN_VENDOR_NAMESPACES: Readonly<Record<string, string>> = Object.freeze({
  "http://camunda.org/schema/zeebe/1.0": "Zeebe",
  "http://camunda.org/schema/1.0/bpmn": "Camunda",
  "http://camunda.org/schema/modeler/1.0": "Camunda Modeler",
});

/** Valid FSH identifier for DAK swimlane IDs (letters, digits, hyphens, dots; max 64 chars). */
export const FSH_ID_RE = /^[A-Za-z0-9.\-]{1,64}$/;
/** Valid identifier for harness process lanes that bind a role via partitionElementRef or bootstrap.processes:role. */
export const HARNESS_LANE_ID_RE = /^[A-Za-z0-9._\-]{1,64}$/;

const FLOW_NODE_LOCAL_NAMES = new Set([
  "task",
  "userTask",
  "serviceTask",
  "scriptTask",
  "businessRuleTask",
  "sendTask",
  "receiveTask",
  "manualTask",
  "callActivity",
  "subProcess",
  "transaction",
  "adHocSubProcess",
  "exclusiveGateway",
  "parallelGateway",
  "inclusiveGateway",
  "complexGateway",
  "eventBasedGateway",
  "startEvent",
  "endEvent",
  "intermediateCatchEvent",
  "intermediateThrowEvent",
  "boundaryEvent",
]);

export interface ValidationIssue {
  code: string;
  severity: "error" | "warning";
  message: string;
  file: string;
  elementId?: string;
}

export interface ActorDef {
  id: string;
  name?: string;
  title?: string;
  source: string;
  kind: "fsh" | "json" | "role";
}

type El = Element;
const childElements = (e: El): El[] => Array.from(e.childNodes ?? []).filter((n): n is El => n.nodeType === 1);
const localNameOf = (e: El): string => e.localName || e.tagName.replace(/^.*:/, "");

function parseXmlDocument(xml: string, file: string): { doc?: Document; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const parseErrors: string[] = [];
  let doc: Document | undefined;
  try {
    doc = new DOMParser({
      errorHandler: {
        warning: () => {},
        error: (msg: string) => parseErrors.push(String(msg).trim()),
        fatalError: (msg: string) => parseErrors.push(String(msg).trim()),
      },
    }).parseFromString(xml, "application/xml");
  } catch (e) {
    parseErrors.push((e as Error).message);
  }
  if (parseErrors.length > 0 || !doc || !doc.documentElement) {
    issues.push({
      code: "BPMN-XML-001",
      severity: "error",
      message: `Invalid XML: ${parseErrors[0] ?? "missing root element"}`,
      file,
    });
    return { issues };
  }
  return { doc, issues };
}

/**
 * Validate BPMN 2.0 XML structure: well-formedness, `<bpmn:definitions>` root
 * in `http://www.omg.org/spec/BPMN/20100524/MODEL`, no forbidden vendor
 * namespaces (Zeebe, Camunda, Camunda Modeler), at least one `<bpmn:process>`,
 * and no duplicate `@id` attributes.
 */
export function validateBpmnXml(xml: string, file = "<memory>"): ValidationIssue[] {
  const { doc, issues } = parseXmlDocument(xml, file);
  if (!doc || issues.length > 0) return issues;

  const root = doc.documentElement as unknown as El;
  const rootLocal = localNameOf(root);
  const rootNs = root.namespaceURI ?? "";
  if (rootLocal !== "definitions" || rootNs !== BPMN_MODEL_NS) {
    issues.push({
      code: "BPMN-XML-002",
      severity: "error",
      message: `Root element must be <bpmn:definitions> in namespace "${BPMN_MODEL_NS}" (found <${root.tagName}> in "${rootNs}")`,
      file,
    });
  }

  const forbiddenSeen = new Set<string>();
  const seenIds = new Set<string>();
  let processCount = 0;

  const walk = (el: El) => {
    if (localNameOf(el) === "process" && (el.namespaceURI === BPMN_MODEL_NS || !el.namespaceURI)) {
      processCount++;
    }
    if (el.namespaceURI && el.namespaceURI in FORBIDDEN_VENDOR_NAMESPACES) {
      forbiddenSeen.add(el.namespaceURI);
    }
    const attrs = el.attributes;
    if (attrs) {
      for (let i = 0; i < attrs.length; i++) {
        const a = attrs.item(i)!;
        if ((a.name === "xmlns" || a.name.startsWith("xmlns:")) && a.value in FORBIDDEN_VENDOR_NAMESPACES) {
          forbiddenSeen.add(a.value);
        }
        if (a.namespaceURI && a.namespaceURI in FORBIDDEN_VENDOR_NAMESPACES) {
          forbiddenSeen.add(a.namespaceURI);
        }
      }
    }
    const id = el.getAttribute("id")?.trim();
    if (id) {
      if (seenIds.has(id)) {
        issues.push({
          code: "BPMN-XML-005",
          severity: "error",
          message: `Duplicate @id attribute "${id}" on <${el.tagName}>`,
          file,
          elementId: id,
        });
      } else {
        seenIds.add(id);
      }
    }
    for (const c of childElements(el)) walk(c);
  };
  walk(root);

  for (const uri of [...forbiddenSeen].sort()) {
    const label = FORBIDDEN_VENDOR_NAMESPACES[uri]!;
    issues.push({
      code: "BPMN-XML-003",
      severity: "error",
      message: `Forbidden vendor namespace "${uri}" (${label}) is not permitted in standard BPMN 2.0`,
      file,
    });
  }

  if (processCount === 0) {
    issues.push({
      code: "BPMN-XML-004",
      severity: "error",
      message: "BPMN document contains no <bpmn:process> element",
      file,
    });
  }

  return issues;
}

/** Extract the harness role reference on a `<bpmn:lane>` if it binds one (`partitionElementRef` or `<bootstrap.processes:role ref="..."/>`). */
function laneRoleRef(lane: El): string | undefined {
  const part = lane.getAttribute("partitionElementRef")?.trim();
  if (part) return part.replace(/^role:/, "");
  const walkExt = (el: El): string | undefined => {
    for (const c of childElements(el)) {
      if (localNameOf(c) === "role" && c.getAttribute("ref")?.trim()) {
        return c.getAttribute("ref")!.trim().replace(/^role:/, "");
      }
      const found = walkExt(c);
      if (found) return found;
    }
    return undefined;
  };
  for (const c of childElements(lane)) {
    if (localNameOf(c) === "extensionElements") {
      const found = walkExt(c);
      if (found) return found;
    }
  }
  return undefined;
}

function collectLanesInSet(laneSet: El): El[] {
  const out: El[] = [];
  for (const c of childElements(laneSet)) {
    if (localNameOf(c) !== "lane") continue;
    out.push(c);
    for (const sub of childElements(c)) {
      if (localNameOf(sub) === "childLaneSet") out.push(...collectLanesInSet(sub));
    }
  }
  return out;
}

function isInnermostLane(lane: El): boolean {
  for (const sub of childElements(lane)) {
    if (localNameOf(sub) === "childLaneSet" && childElements(sub).some((k) => localNameOf(k) === "lane")) {
      return false;
    }
  }
  return true;
}

/**
 * Validate swimlane structure:
 * - `SWIM-001`: at least one process has a `laneSet` with lanes, or a `collaboration` has named `participant`s.
 * - `SWIM-002`: every lane has a non-empty, unique `@id` (error) and a `@name` (warning).
 * - `SWIM-003`: every lane `@id` is FSH-valid (`/^[A-Za-z0-9.\-]{1,64}$/`, or `/^[A-Za-z0-9._\-]{1,64}$/` when binding a harness role).
 * - `SWIM-004`: every top-level flow node in a process with lanes is referenced by `<bpmn:flowNodeRef>` in at least one lane.
 */
export function validateSwimlanes(xml: string, file = "<memory>"): ValidationIssue[] {
  const { doc, issues } = parseXmlDocument(xml, file);
  if (!doc || issues.length > 0) return issues;

  const root = doc.documentElement as unknown as El;
  const processes = childElements(root).filter((c) => localNameOf(c) === "process");
  const collaborations = childElements(root).filter((c) => localNameOf(c) === "collaboration");

  const participants = collaborations.flatMap((col) => childElements(col).filter((c) => localNameOf(c) === "participant"));
  const allLanes: El[] = [];
  const laneIds = new Set<string>();

  for (const proc of processes) {
    const laneSets = childElements(proc).filter((c) => localNameOf(c) === "laneSet");
    const procLanes = laneSets.flatMap(collectLanesInSet);
    allLanes.push(...procLanes);

    if (procLanes.length > 0) {
      const referencedNodes = new Set<string>();
      for (const lane of procLanes) {
        for (const c of childElements(lane)) {
          if (localNameOf(c) === "flowNodeRef" && c.textContent?.trim()) {
            referencedNodes.add(c.textContent.trim());
          }
        }
      }
      for (const c of childElements(proc)) {
        const ln = localNameOf(c);
        if (!FLOW_NODE_LOCAL_NAMES.has(ln)) continue;
        const nodeId = c.getAttribute("id")?.trim();
        if (nodeId && !referencedNodes.has(nodeId)) {
          issues.push({
            code: "SWIM-004",
            severity: "error",
            message: `Flow node "${nodeId}" (<${c.tagName}>) is not referenced by <bpmn:flowNodeRef> in any lane of process "${proc.getAttribute("id") ?? ""}"`,
            file,
            elementId: nodeId,
          });
        }
      }
    }
  }

  const hasNamedParticipants = participants.some((p) => Boolean(p.getAttribute("name")?.trim()));
  if (allLanes.length === 0 && !hasNamedParticipants) {
    issues.push({
      code: "SWIM-001",
      severity: "error",
      message: "BPMN document defines no swimlanes (<bpmn:laneSet>/<bpmn:lane>) and no named <bpmn:participant> pools",
      file,
    });
  }

  for (const lane of allLanes) {
    const id = lane.getAttribute("id")?.trim() ?? "";
    const name = lane.getAttribute("name")?.trim() ?? "";
    if (!id) {
      issues.push({
        code: "SWIM-002",
        severity: "error",
        message: `<bpmn:lane${name ? ` name="${name}"` : ""}> is missing a required @id attribute`,
        file,
      });
      continue;
    }
    if (laneIds.has(id)) {
      issues.push({
        code: "SWIM-002",
        severity: "error",
        message: `Duplicate <bpmn:lane> @id "${id}"`,
        file,
        elementId: id,
      });
    }
    laneIds.add(id);

    if (!name) {
      issues.push({
        code: "SWIM-002",
        severity: "warning",
        message: `<bpmn:lane id="${id}"> is missing a @name attribute`,
        file,
        elementId: id,
      });
    }

    const bindsHarnessRole = laneRoleRef(lane) !== undefined;
    const validId = bindsHarnessRole ? HARNESS_LANE_ID_RE.test(id) : FSH_ID_RE.test(id);
    if (!validId) {
      issues.push({
        code: "SWIM-003",
        severity: "error",
        message: `Lane @id "${id}" is not a valid FSH identifier (expected ${bindsHarnessRole ? HARNESS_LANE_ID_RE : FSH_ID_RE})`,
        file,
        elementId: id,
      });
    }
  }

  return issues;
}

const normToken = (s: string): string => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * Load `ActorDefinition` instances from `input/fsh/` `.fsh` files and
 * `input/actors/` `.json` files (plus `fsh-generated/resources/ActorDefinition-*.json`
 * when present), and declared harness roles from `scenarios/roles.json` —
 * reading `Instance:` IDs, `name`, and `title` from file contents and NEVER
 * guessing filenames from lane IDs.
 */
export function loadActorDefinitions(root: string): ActorDef[] {
  const out: ActorDef[] = [];
  const roots = new Set<string>([resolve(root)]);
  const parent = resolve(root, "..");
  if (existsSync(join(parent, "index.config.json")) || existsSync(join(parent, "input", "fsh"))) {
    roots.add(parent);
  }

  const walkFsh = (dir: string, inActorsDir: boolean) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        walkFsh(p, inActorsDir || e.name === "actors" || e.name === "personas");
        continue;
      }
      if (!e.isFile() || !e.name.endsWith(".fsh")) continue;
      const text = readFileSync(p, "utf-8");
      for (const block of text.split(/^(?=Instance:\s*\S)/m)) {
        const instMatch = /^Instance:\s*(\S+)/m.exec(block);
        if (!instMatch) continue;
        const instOf = /^InstanceOf:\s*(\S+)/m.exec(block)?.[1] ?? "";
        if (!inActorsDir && !/Actor|Persona/i.test(instOf)) continue;
        const instanceId = instMatch[1]!.trim();
        const explicitId = /^\*\s+id\s*=\s*"([^"]+)"/m.exec(block)?.[1]?.trim();
        const name = /^\*\s+name\s*=\s*"([^"]+)"/m.exec(block)?.[1]?.trim();
        const title = /^\*\s+title\s*=\s*"([^"]+)"/m.exec(block)?.[1]?.trim();
        out.push({
          id: explicitId || instanceId,
          ...(name ? { name } : {}),
          ...(title ? { title } : {}),
          source: p,
          kind: "fsh",
        });
        if (explicitId && explicitId !== instanceId) {
          out.push({
            id: instanceId,
            ...(name ? { name } : {}),
            ...(title ? { title } : {}),
            source: p,
            kind: "fsh",
          });
        }
      }
    }
  };

  const walkJsonActors = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        walkJsonActors(p);
        continue;
      }
      if (!e.isFile() || !e.name.endsWith(".json")) continue;
      try {
        const j = JSON.parse(readFileSync(p, "utf-8")) as { resourceType?: unknown; id?: unknown; name?: unknown; title?: unknown };
        if (j.resourceType !== "ActorDefinition" || typeof j.id !== "string") continue;
        out.push({
          id: j.id,
          ...(typeof j.name === "string" ? { name: j.name } : {}),
          ...(typeof j.title === "string" ? { title: j.title } : {}),
          source: p,
          kind: "json",
        });
      } catch {
        // Ignore unparseable JSON outside actor definitions.
      }
    }
  };

  const readRolesFile = (p: string) => {
    if (!existsSync(p)) return;
    try {
      const j = JSON.parse(readFileSync(p, "utf-8")) as {
        roles?: Array<{ id?: unknown; title?: unknown }>;
        extensions?: Array<{ role?: unknown }>;
      };
      for (const r of j.roles ?? []) {
        if (typeof r.id === "string") {
          out.push({
            id: r.id,
            ...(typeof r.title === "string" ? { title: r.title } : {}),
            source: p,
            kind: "role",
          });
        }
      }
      for (const ext of j.extensions ?? []) {
        if (typeof ext.role === "string") {
          out.push({
            id: ext.role,
            source: p,
            kind: "role",
          });
        }
      }
    } catch {
      // Ignore unreadable role graph.
    }
  };

  for (const r of roots) {
    walkFsh(join(r, "input", "fsh"), false);
    walkJsonActors(join(r, "input", "actors"));
    walkJsonActors(join(r, "fsh-generated", "resources"));
    readRolesFile(join(r, "scenarios", "roles.json"));
    if (existsSync(r)) {
      for (const e of readdirSync(r, { withFileTypes: true })) {
        if ((e.isDirectory() || e.isSymbolicLink()) && !e.name.startsWith(".") && e.name !== "node_modules") {
          readRolesFile(join(r, e.name, "scenarios", "roles.json"));
        }
      }
    }
  }

  return out;
}

function matchesActor(candidates: ReadonlyArray<string>, actors: ReadonlyArray<ActorDef>): ActorDef | undefined {
  for (const raw of candidates) {
    const c = raw.trim();
    if (!c) continue;
    const lower = c.toLowerCase();
    const norm = normToken(c);
    const suffix = c.includes(".") ? c.slice(c.lastIndexOf(".") + 1) : undefined;
    const suffixNorm = suffix ? normToken(suffix) : undefined;

    for (const a of actors) {
      if (a.id === c || a.id.toLowerCase() === lower) return a;
      if (a.name && (a.name === c || a.name.toLowerCase() === lower || normToken(a.name) === norm)) return a;
      if (a.title && (a.title === c || a.title.toLowerCase() === lower || normToken(a.title) === norm)) return a;
      const aSuffix = a.id.includes(".") ? a.id.slice(a.id.lastIndexOf(".") + 1) : a.id;
      if (normToken(aSuffix) === norm || (suffixNorm && normToken(aSuffix) === suffixNorm)) return a;
    }
  }
  return undefined;
}

/**
 * Validate that every innermost `<bpmn:lane>` (`ACTOR-001`) and every
 * lane-less `<bpmn:participant>` (`ACTOR-002`) resolves to an `ActorDefinition`
 * (by `Instance:` ID, `name`, or `title` read from `.fsh` / `.json` files —
 * never by filename) or to a declared harness role when the lane binds one.
 */
export function validateSwimlaneActors(
  xml: string,
  actorsOrRoot: ReadonlyArray<ActorDef> | string,
  file = "<memory>",
): ValidationIssue[] {
  const { doc, issues } = parseXmlDocument(xml, file);
  if (!doc || issues.length > 0) return issues;

  const actors = typeof actorsOrRoot === "string" ? loadActorDefinitions(actorsOrRoot) : actorsOrRoot;
  const dakActors = actors.filter((a) => a.kind === "fsh" || a.kind === "json");
  const hasRoleDeclarations = actors.some((a) => a.kind === "role");
  const root = doc.documentElement as unknown as El;
  const processes = childElements(root).filter((c) => localNameOf(c) === "process");
  const collaborations = childElements(root).filter((c) => localNameOf(c) === "collaboration");
  const declaredResources = new Set(
    childElements(root)
      .filter((c) => localNameOf(c) === "resource")
      .map((r) => r.getAttribute("id")?.trim() ?? "")
      .filter(Boolean),
  );

  const processHasLanes = new Map<string, boolean>();
  for (const proc of processes) {
    const pid = proc.getAttribute("id")?.trim() ?? "";
    const laneSets = childElements(proc).filter((c) => localNameOf(c) === "laneSet");
    const lanes = laneSets.flatMap(collectLanesInSet).filter(isInnermostLane);
    processHasLanes.set(pid, lanes.length > 0);

    for (const lane of lanes) {
      const id = lane.getAttribute("id")?.trim() ?? "";
      const name = lane.getAttribute("name")?.trim() ?? "";
      const roleRef = laneRoleRef(lane);
      const docText = childElements(lane)
        .filter((c) => localNameOf(c) === "documentation")
        .map((c) => c.textContent?.trim() ?? "")
        .join(" ");
      const docPersonaIds = [...docText.matchAll(/\(([A-Za-z0-9._\-]+)\)/g)].map((m) => m[1]!);

      if (roleRef) {
        const hit = matchesActor([roleRef, id, name], actors) || (hasRoleDeclarations && declaredResources.has(roleRef));
        if (!hit) {
          issues.push({
            code: "ACTOR-001",
            severity: "error",
            message: `Swimlane "${id}"${name ? ` ("${name}")` : ""} role "${roleRef}" does not resolve to any declared role or ActorDefinition`,
            file,
            elementId: id || undefined,
          });
        }
      } else {
        const pool = dakActors.length > 0 ? dakActors : actors;
        const hit = matchesActor([id, name, ...docPersonaIds], pool);
        if (!hit) {
          issues.push({
            code: "ACTOR-001",
            severity: "error",
            message: `Swimlane "${id}"${name ? ` ("${name}")` : ""} does not resolve to any ActorDefinition (by Instance: ID, name, or title)`,
            file,
            elementId: id || undefined,
          });
        }
      }
    }
  }

  // Participants for processes without lanes (or black-box participant pools when multiple participants exist).
  const participants = collaborations.flatMap((col) => childElements(col).filter((c) => localNameOf(c) === "participant"));
  for (const part of participants) {
    const procRef = part.getAttribute("processRef")?.trim() ?? "";
    if (procRef && processHasLanes.get(procRef)) continue;
    const id = part.getAttribute("id")?.trim() ?? "";
    const name = part.getAttribute("name")?.trim() ?? "";
    const pool = dakActors.length > 0 ? dakActors : actors;
    const hit = matchesActor([id, name], pool);
    if (!hit) {
      issues.push({
        code: "ACTOR-002",
        severity: "error",
        message: `Participant "${id}"${name ? ` ("${name}")` : ""} has no lanes and does not resolve to any ActorDefinition`,
        file,
        elementId: id || undefined,
      });
    }
  }

  return issues;
}

/**
 * Resolve declared `processes` and `business-processes` directories under
 * `root` from `<name>.json` and nested `graph.json` declarations, with
 * `input/bpmn` as the IG convention fallback.
 */
export function declaredProcessDirectories(root: string): string[] {
  const absRoot = resolve(root);
  const found = new Set<string>();

  const scanDeclDir = (baseDir: string, declFile: string) => {
    if (!existsSync(declFile)) return;
    let parsed: { directories?: Array<{ path?: unknown; graphTypologies?: unknown }> };
    try {
      parsed = JSON.parse(readFileSync(declFile, "utf-8")) as typeof parsed;
    } catch {
      return;
    }
    for (const d of parsed.directories ?? []) {
      if (typeof d.path !== "string") continue;
      const subDir = resolve(baseDir, d.path);
      const kinds = Array.isArray(d.graphTypologies) ? d.graphTypologies : [];
      if (kinds.includes("processes") || kinds.includes("business-processes")) {
        if (existsSync(subDir)) found.add(subDir);
      }
      if (kinds.includes("cat-harness") || existsSync(join(subDir, "graph.json"))) {
        scanDeclDir(subDir, join(subDir, "graph.json"));
      }
    }
  };

  const candidates = [absRoot];
  if (existsSync(absRoot)) {
    for (const e of readdirSync(absRoot, { withFileTypes: true })) {
      if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") {
        candidates.push(join(absRoot, e.name));
      }
    }
  }
  for (const dir of candidates) {
    const base = resolve(dir);
    for (const name of [`${basenameOf(base)}.json`, "harness.json", "graph.json"]) {
      scanDeclDir(base, join(base, name));
    }
  }

  // IG convention fallback (`input/bpmn`), matching `input/scripts/installer.py`.
  const igBpmn = join(absRoot, "input", "bpmn");
  if (existsSync(igBpmn)) found.add(igBpmn);

  return [...found].sort();
}

function basenameOf(p: string): string {
  const parts = p.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function walkBpmnFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const st = statSync(dir);
  if (st.isFile()) return dir.endsWith(".bpmn") ? [resolve(dir)] : [];
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkBpmnFiles(p));
    else if (e.isFile() && e.name.endsWith(".bpmn")) out.push(resolve(p));
  }
  return out;
}

/** Discover `.bpmn` files from explicit paths or declared process directories, optionally filtered by `--changed`. */
export function discoverBpmnFiles(
  root: string,
  opts: { paths?: ReadonlyArray<string>; changedBase?: string } = {},
): string[] {
  const absRoot = resolve(root);
  const dirs = opts.paths && opts.paths.length > 0
    ? opts.paths.map((p) => resolve(absRoot, p))
    : declaredProcessDirectories(absRoot);
  const all = [...new Set(dirs.flatMap(walkBpmnFiles))].sort();
  if (!opts.changedBase) return all;

  try {
    const diffOut = execFileSync("git", ["diff", "--name-only", opts.changedBase, "--"], {
      cwd: absRoot,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const changed = new Set(
      diffOut
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.endsWith(".bpmn"))
        .map((l) => resolve(absRoot, l)),
    );
    return all.filter((f) => changed.has(f));
  } catch {
    return all;
  }
}

/** Run BPMN XML, swimlane structure, and actor resolution checks on one `.bpmn` file. */
export function validateBpmnFile(
  filePath: string,
  actorsOrRoot?: ReadonlyArray<ActorDef> | string,
): ValidationIssue[] {
  const xml = readFileSync(filePath, "utf-8");
  const xmlIssues = validateBpmnXml(xml, filePath);
  if (xmlIssues.some((i) => i.code === "BPMN-XML-001" || i.code === "BPMN-XML-002")) {
    return xmlIssues;
  }
  const swimIssues = validateSwimlanes(xml, filePath);
  const actorIssues = actorsOrRoot !== undefined ? validateSwimlaneActors(xml, actorsOrRoot, filePath) : [];
  return [...xmlIssues, ...swimIssues, ...actorIssues];
}

// ── Tool node declaration ─────────────────────────────────────────────────

export default toolFactory((t) =>
  defineTool({
    id: "dak-swimlanes",
    title: "BPMN XML, swimlane structure, ActorDefinition resolution, and persona crosswalk",
    description:
      "Validate BPMN 2.0 XML structure (`BPMN-XML-001`..`005`, including forbidden vendor namespaces), swimlane structure (`SWIM-001`..`004`), and lane/participant → `ActorDefinition` / role resolution (`ACTOR-001`..`002`) across declared `processes` / `business-processes` directories (`input/bpmn/` fallback), or cross-reference a DAK's personas page and Visio business-process figures through a `dak-swimlanes/v1` declaration.",
    install: { none: true },
    invoke: {
      shell:
        "bun run smart-base/L2-bpmn/tools/dak-swimlanes/dak-swimlanes.ts [--check] [--changed [base]] [--ig-src <IG repo>] [--map <swimlanes.json> --out <dir>]",
    },
    io: {
      inputs: [
        {
          name: "igSrc",
          schema: t("RepoPath"),
          required: false,
          arg: { flag: "--ig-src" },
          description: "Root of the IG or layer repository to validate or extract from (defaults to `.`).",
        },
        {
          name: "map",
          schema: t("RepoPath"),
          required: false,
          arg: { flag: "--map" },
          description: "Optional `dak-swimlanes/v1` declaration (`swimlanes.json`) for persona ↔ Visio swimlane annex generation.",
        },
        {
          name: "out",
          schema: t("RepoPath"),
          required: false,
          arg: { flag: "--out" },
          description: "Output directory for `personas-swimlanes.md`, `processes-swimlanes.md`, and `swimlanes.qa-results.json` when `--map` is supplied.",
        },
      ],
      outputs: [
        {
          name: "qa",
          schema: t("RepoPath"),
          description: "Validation report on stdout/stderr, or `swimlanes.qa-results.json` and markdown annexes under `--out`.",
        },
      ],
    },
    satisfies: ["l2-component-edit-review"],
    selection: {
      when: "Checking L2 BPMN diagrams for valid OMG BPMN 2.0 XML, swimlane structure, and lane → ActorDefinition resolution, or generating the persona ↔ swimlane crosswalk annexes for a DAK.",
      limits:
        "Resolves lanes against `ActorDefinition` instances parsed from `input/fsh/**/*.fsh` and `input/actors/**/*.json` (by `Instance:` ID, `name`, or `title`, never by filename) and declared roles in `scenarios/roles.json`, or through a declared `swimlanes.json` map for Visio figures.",
      cost: "Milliseconds, offline.",
    },
    requires: { runtime: ["bun"], network: false },
  }),
);

// ── CLI ───────────────────────────────────────────────────────────────────

if (import.meta.main) {
  const args = process.argv.slice(2);
  const opt = (k: string) => {
    const i = args.indexOf(k);
    return i >= 0 && i + 1 < args.length && !args[i + 1]!.startsWith("--") ? args[i + 1] : undefined;
  };
  const ig = opt("--ig-src");
  const mapPath = opt("--map");
  const out = opt("--out");

  // Mode 1: Persona ↔ Visio figure swimlane crosswalk annex generation (`--map` and `--out` supplied).
  if (mapPath || out) {
    if (!ig || !mapPath || !out) {
      console.error("usage: dak-swimlanes.ts --ig-src <IG repo> --map <swimlanes.json> --out <dir> [--check] [--subject <ig>]");
      process.exit(2);
    }
    const pc = join(ig, "input", "pagecontent");
    // Parsed, not cast: a declaration this cannot read is refused before it is used.
    const map = DakSwimlaneMapSchema.parse(JSON.parse(readFileSync(mapPath, "utf-8")));
    const personas = personasFrom(readFileSync(join(pc, "personas.md"), "utf-8"));
    const processes = processesFrom(readFileSync(join(pc, "business-processes.md"), "utf-8"));
    const cw = crosswalk(personas, processes, (f) => {
      const p = join(ig, "input", "images", f);
      return existsSync(p) ? lanesFrom(readFileSync(p, "utf-8")) : [];
    }, map);
    const script = "smart-base/scripts/dak-swimlanes.ts";
    const qaPath = opt("--qa") ?? join(out, "swimlanes.qa-results.json");
    const files: Record<string, string> = {
      [join(out, "personas-swimlanes.md")]: personasMarkdown(personas, cw, "business-processes.html"),
      [join(out, "processes-swimlanes.md")]: processesMarkdown(cw, map, "personas.html"),
      [qaPath]: `${JSON.stringify(swimlaneQa(opt("--subject") ?? "ig", { script, script_hash: createHash("sha256").update(readFileSync(import.meta.path)).digest("hex").slice(0, 12) }, personas, cw), null, 2)}\n`,
    };
    let stale = 0;
    for (const [p, body] of Object.entries(files)) {
      mkdirSync(dirname(p), { recursive: true });
      const cur = existsSync(p) ? readFileSync(p, "utf-8") : undefined;
      if (cur === body) continue;
      if (args.includes("--check")) { console.error(`stale: ${p}`); stale++; } else writeFileSync(p, body);
    }
    const qa = JSON.parse(files[qaPath]!) as { families: Record<string, { count: number; entries: unknown[] }> };
    for (const [k, v] of Object.entries(qa.families)) console.error(`${k}: ${v.count}${v.count ? ` — ${JSON.stringify(v.entries)}` : ""}`);
    process.exit(stale ? 1 : 0);
  }

  // Mode 2: BPMN XML, swimlane structure, and ActorDefinition validation across declared process directories or explicit paths.
  const root = resolve(ig ?? ".");
  const changedIdx = args.indexOf("--changed");
  const changedBase = changedIdx >= 0
    ? (args[changedIdx + 1] && !args[changedIdx + 1]!.startsWith("--") ? args[changedIdx + 1]! : "origin/main")
    : undefined;

  const flagWithValue = new Set(["--ig-src", "--subject", "--qa"]);
  if (changedIdx >= 0 && args[changedIdx + 1] && !args[changedIdx + 1]!.startsWith("--")) {
    flagWithValue.add("--changed");
  }
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (flagWithValue.has(a)) {
      i++;
      continue;
    }
    if (a.startsWith("--")) continue;
    positional.push(a);
  }

  const bpmnFiles = discoverBpmnFiles(root, { paths: positional, changedBase });
  if (bpmnFiles.length === 0) {
    if (changedBase) {
      console.log(`dak-swimlanes: 0 changed .bpmn file(s) against ${changedBase}.`);
      process.exit(0);
    }
    console.error(`dak-swimlanes: no .bpmn files found under ${root}`);
    process.exit(2);
  }

  const actors = loadActorDefinitions(root);
  let errorCount = 0;
  let warningCount = 0;
  for (const f of bpmnFiles) {
    const rel = relative(root, f) || f;
    const issues = validateBpmnFile(f, actors);
    const errs = issues.filter((i) => i.severity === "error");
    const warns = issues.filter((i) => i.severity === "warning");
    errorCount += errs.length;
    warningCount += warns.length;
    if (errs.length === 0 && warns.length === 0) {
      console.log(`✓ ${rel}`);
    } else {
      for (const issue of issues) {
        const prefix = issue.severity === "error" ? "✗" : "!";
        console.error(`${prefix} ${rel} [${issue.code}]${issue.elementId ? ` (${issue.elementId})` : ""}: ${issue.message}`);
      }
    }
  }
  console.log(`dak-swimlanes: ${bpmnFiles.length} BPMN file(s) checked, ${errorCount} error(s), ${warningCount} warning(s).`);
  process.exit(errorCount > 0 ? 1 : 0);
}
