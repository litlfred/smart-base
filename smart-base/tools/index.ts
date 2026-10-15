/**
 * smart-base's Tool nodes — the `tools` graph for the WHO SMART base layer.
 *
 * @module smart-base/tools
 * @graphNode tool
 *
 * ## Why these are here, and what changed on 2026-09-22
 *
 * The owner: *"things like dmn -> fhir questionnaire should be a tool. the
 * skill/tools under smart-base should consolidate under the smart-base/tools/
 * directory under this repo"*, and the goal it serves — *"want to slowly get
 * smart-base back to a more conventional IG state w/o tooling"*.
 *
 * So the direction of travel is: `WorldHealthOrganization/smart-base` stops
 * being a toolchain host and becomes an ordinary FHIR IG. The capabilities it
 * hosts today move here, where the harness can declare, bind and audit them.
 *
 * ## This is NOT vendoring, and the distinction is the whole reconciliation
 *
 * `smart-base.json`'s own header says the upstream toolchain is not vendored
 * here, and [`smart-base-tools`](../../smart-base/skills/content/authoring-who-smart-guidelines/smart-base-tools.md)
 * argues why: a copy of the Python would be a second, drifting toolchain.
 *
 * **That argument is about copies of the CODE and it still stands.** A Tool
 * node is a DECLARATION — what the capability is, what it consumes and
 * produces, which skill it satisfies, and how it is invoked. Declaring that
 * `dmn_questionnaire_generator.py` exists and consumes DMN to produce
 * `Questionnaire` resources does not duplicate a line of it, and it is what
 * lets a process bind the step at all. The two statements are compatible:
 * **declare here, execute upstream, until the execution moves too.**
 *
 * ## Two tools are deliberately absent
 *
 * `strip_library_binaries.py` and `strip_library_content.py` arrived labelled
 * *DAK Postprocessing* and are not DAK-shaped — any IG depending on
 * `hl7.fhir.uv.cql` produces oversized `Library` resources. By the placement
 * question in
 * [`smart-stack-layering`](../../smart-base/skills/content/authoring-who-smart-guidelines/smart-stack-layering.md)
 * they belong to `fhir-harness`, and putting them here to keep the list
 * tidy would be the layering rule being overruled by a step's own name.
 *
 * ## `install: { none: true }` throughout, on purpose
 *
 * Every tool below is a Python script in a checkout whose location is given by
 * `SMART_BASE_HOME`. There is no install step and saying so explicitly is what
 * distinguishes "nothing to install" from "nobody finished the record" — the
 * distinction the `none` flag exists for, per `beans-manual`'s precedent.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { declarationPathIn, defineTool, toolTypeIri, type ToolDefinition } from "../platform/index.js";

/** The INSTANCE root — `<repo>/smart-base`, where `smart-base.json` lives. */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function decl(): { canonicalUrl?: string } {
  const p = declarationPathIn(ROOT);
  if (p === undefined || !existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as { canonicalUrl?: string };
  } catch {
    return {};
  }
}

/**
 * The publisher-site rules smart-base supplies to fhir-harness's
 * `fhir-cache-seed-npm`: package-name prefix → `OWNER/REPO[@BRANCH]` of the
 * repository holding the publisher's published site, where
 * `<rest-of-name>/<version>/package.tgz` is read.
 *
 * fhir-harness knows no publisher (ig-build-pipeline §"What this layer refuses
 * to know about"; owner ruling 2026-10-07: "parameterize it"), so its default
 * is empty and this WHO entry is passed in from here. Before #2436 it was a
 * literal inside the seeder (bean 3ka9); the repository and branch are the
 * ones that literal named, so WHO packages seed exactly as they did.
 */
export const SMART_PUBLISHER_SITE_REPOS: Readonly<Record<string, string>> = Object.freeze({
  "smart.who.int.": "WorldHealthOrganization/smart-html@main",
});

/** `SMART_PUBLISHER_SITE_REPOS` as the seeder's `--site-repo` arguments. */
export function smartSiteRepoArgs(): string[] {
  return Object.entries(SMART_PUBLISHER_SITE_REPOS).flatMap(([prefix, repo]) => ["--site-repo", `${prefix}=${repo}`]);
}

export function tools(baseUrl?: string): ToolDefinition[] {
  const B = baseUrl ?? decl().canonicalUrl ?? "";
  const t = (n: Parameters<typeof toolTypeIri>[1]): string => toolTypeIri(B, n);

  return [
    // ── L2 authoring transforms ──────────────────────────────────────────
    //
    // The owner named this one specifically. It is the clearest case in the
    // set for why these are tools rather than pipeline steps: it MINTS FHIR
    // RESOURCES. Delete it and the IG is missing `Questionnaire`s — not
    // missing a page. It runs in the pre-processing phase only because the
    // pipeline had nowhere earlier to put it.
    defineTool({
      id: "dmn-to-questionnaire",
      title: "DMN → FHIR Questionnaire",
      description:
        "Generate FHIR `Questionnaire` resources from a DAK's DMN decision tables. Authoring, not rendering: its output is validated and indexed by the IG Publisher like any other resource.",
      install: { none: true },
      invoke: { shell: "python3 input/scripts/dmn_questionnaire_generator.py" },
      io: {
        inputs: [
          { name: "dmnDir", schema: t("RepoPath"), required: true, description: "The directory of DMN sources. `input/dmn/` by convention." },
        ],
        outputs: [
          { name: "questionnaires", schema: t("RepoPath"), description: "The generated `Questionnaire` resources, written where SUSHI's output is collected from." },
          { name: "generated", schema: t("Count"), description: "How many were produced. Zero is a determined empty only if the DMN directory was found; absent input is a different state and is reported as such." },
        ],
      },
      // `l2-dak-authoring` dropped 2026-09-22 (bean p0za): that skill's contract
      // requires `dakComponent` and `sourceGuideline`, which this Tool does not
      // accept. The edge had never been checked, because no check could see
      // smart-base's Tools until tool auto-discovery.
      satisfies: ["dak-preprocessing"],
      selection: {
        when: "A DAK carries DMN decision tables and the IG is to expose them as answerable questionnaires.",
        limits:
          "It reads DMN and nothing else — a decision expressed only in prose or only in CQL is invisible to it, and it reports no error for one. It cannot tell an empty DMN directory from a DAK with no decisions.",
        cost: "Seconds, no network. It runs before the Publisher, so a failure here costs a whole build cycle to discover if it is only noticed downstream.",
      },
      requires: { runtime: ["python3"], network: false },
    }),

    defineTool({
      id: "dmn-to-html",
      title: "DMN → HTML",
      description:
        "Render each DMN decision table to HTML for inclusion in a page, via `dmn2html.xslt` and `dmn.css`. The only human-readable rendering of a decision table an IG has.",
      install: { none: true },
      invoke: { shell: "python3 input/scripts/transform_dmn.py" },
      io: {
        inputs: [{ name: "dmnDir", schema: t("RepoPath"), required: true }],
        outputs: [{ name: "html", schema: t("RepoPath"), description: "One HTML fragment per decision table." }],
      },
      // `l2-dak-authoring` dropped 2026-09-22 (bean p0za): that skill's contract
      // requires `dakComponent` and `sourceGuideline`, which this Tool does not
      // accept. The edge had never been checked, because no check could see
      // smart-base's Tools until tool auto-discovery.
      satisfies: ["dak-preprocessing"],
      selection: {
        when: "A reader needs to see a decision table. Nothing else in the toolchain renders one.",
        limits:
          "Its output is HTML, which the JSON-only render contract does not take as a representation — see `ig-render-jekyll`. Under the just-the-docs pipeline it is either given a structured output or its HTML is carried as an embedded asset. That is open (bean `kn0t`), not settled.",
        cost: "Seconds. An XSLT dependency that has no other consumer here.",
      },
      requires: { runtime: ["python3"], network: false },
    }),

    defineTool({
      id: "bpmn-to-fsh",
      title: "BPMN → FHIR Shorthand",
      description:
        "Derive FSH from a DAK's BPMN business processes — the render direction, of which the extractors are the inverse.",
      install: { none: true },
      invoke: { shell: "python3 scripts/smart-base-transform.py" },
      io: {
        inputs: [{ name: "bpmn", schema: t("FilesystemPath"), required: true }],
        outputs: [{ name: "fsh", schema: t("RepoPath"), description: "Generated FSH, for SUSHI to compile." }],
      },
      // `l2-dak-authoring` dropped 2026-09-22 (bean p0za): that skill's contract
      // requires `dakComponent` and `sourceGuideline`, which this Tool does not
      // accept. The edge had never been checked, because no check could see
      // smart-base's Tools until tool auto-discovery.
      satisfies: ["smart-base-tools"],
      selection: {
        when: "An L2 business process is to reach L3 as a computable artefact rather than as a picture.",
        limits:
          "It requires a `smart-base` checkout at `SMART_BASE_HOME`. Without one the capability is ABSENT, which `smart-base-tools` is explicit is not the same as a clean run.",
        cost: "Seconds. Needs the upstream checkout, which is the dependency this layer's direction of travel is meant to end.",
      },
      requires: { runtime: ["python3"], network: false },
    }),

    // WHO's L2 → L3 extractor, declared so the tools graph can find it. Until
    // 2026-10-15 it was absent here, so an agent adapting a DAK searched the
    // graph, found nothing for decision tables or requirements, and wrote its
    // own converter in the adaptation repository (Uganda, folio-assistant#2559).
    // Declare here, execute upstream (`smart-base-tools`): nothing is vendored.
    defineTool({
      id: "extract-dak",
      title: "DAK spreadsheets → DMN, PlanDefinitions, CQL, requirements, logical models",
      description:
        "Run WHO's `extract_dak.py` in a DAK or IG repository: it reads the DAK template spreadsheets (`input/decision-logic/*.xlsx` via `dt_extractor`, `input/system-requirements/*.xlsx` via `req_extractor`, `input/dictionary/*.xlsx` via `dd_extractor`) and the BPMN, and writes the DMN decision tables, the CPG recommendation PlanDefinitions with their citations, CQL library skeletons, Requirements and logical-model FSH. The authoring path the WHO IG Starter Kit (`l3_decisiontables`, `l3_cql`) prescribes: an adapted decision or scheduling table is an edited copy of the upstream DAK's spreadsheet, never a parallel format.",
      install: { none: true },
      invoke: { shell: "python3 $SMART_BASE_HOME/input/scripts/extract_dak.py" },
      io: {
        inputs: [
          { name: "dakRepository", schema: t("FilesystemPath"), required: true, description: "The working directory: a DAK or IG repository holding `input/decision-logic/`, `input/system-requirements/` and `input/dictionary/` spreadsheets in the DAK template layout." },
        ],
        outputs: [
          { name: "dmn", schema: t("RepoPath"), description: "Decision tables in the DAK DMN format (namespace `https://www.omg.org/spec/DMN/20240513/MODEL/`), each with an `Annotations` and a `Reference(s)` output." },
          { name: "fsh", schema: t("RepoPath"), description: "PlanDefinition, ActivityDefinition, Requirements and logical-model FSH, for SUSHI to compile." },
          { name: "cql", schema: t("RepoPath"), description: "CQL library skeletons, one per decision table, with the definitions already present in `input/cql/` carried over." },
        ],
      },
      satisfies: ["smart-base-tools"],
      selection: {
        when: "An L2 decision-support, scheduling, requirements or data-dictionary component is created or adapted, and the upstream DAK keeps it in the WHO DAK spreadsheet template. Look for that spreadsheet in the upstream repository before writing any decision table by hand.",
        limits:
          "It reads only the DAK template layout (COVER sheet, per-tab inputs and outputs); a table in any other shape is invisible to it. It requires a `smart-base` checkout at `SMART_BASE_HOME`; without one the capability is ABSENT, not a clean run. Some DAK repositories (https://github.com/litlfred/smart-immunizations) also carry their own converters (`tools/node/processDT*.js`); use the upstream's own where it has one.",
        cost: "Seconds to minutes, no network unless `--run-publisher` is passed.",
      },
      requires: { runtime: ["python3"], network: false },
    }),

    // ── The DAK configuration itself ─────────────────────────────────────
    defineTool({
      id: "dak-config-from-sushi",
      title: "sushi-config.yaml → dak.config.json",
      description:
        "Derive the DAK configuration from `sushi-config.yaml` plus repository and branch context.",
      install: { none: true },
      invoke: { shell: "python3 input/scripts/generate_dak_from_sushi.py" },
      io: {
        inputs: [
          { name: "sushiConfig", schema: t("RepoPath"), required: true, description: "`sushi-config.yaml` at the IG root." },
          { name: "branch", schema: t("Branch"), required: false, description: "Sanitised branch name, for the publication and preview URLs." },
        ],
        outputs: [{ name: "dakConfig", schema: t("RepoPath"), description: "`dak.config.json` — ours, per bean `cz17`. Upstream still writes `dak.json`." }],
      },
      satisfies: ["dak-preprocessing"],
      selection: {
        when: "A DAK repository has no configuration yet, or its branch context has changed.",
        limits:
          "Upstream runs it TWICE — once before the branch name is sanitised and again after — which is an ordering workaround, not two facts. Do not reproduce the double run: compute it once, in the right order.",
        cost: "Seconds. It writes a file the whole DAK phase is gated on, so a silent failure here disables every step after it.",
      },
      requires: { runtime: ["python3"], network: false },
    }),

    // ── The DAK API surface ──────────────────────────────────────────────
    //
    // `dak-api-hub` is the WHO-shaped one. Three siblings that were here —
    // `logical-model-schemas`, `valueset-schemas`, `jsonld-vocabularies` —
    // are any IG's JSON surface and moved to `fhir-harness/tools/` (#1767,
    // stage B′), on the precedent the Library strippers set.



    defineTool({
      id: "dak-api-hub",
      title: "DAK API hub",
      description:
        "Generate `dak-api.html` and the per-artefact `.openapi.json` / `.displays.json` sidecars — the hub a reader enters the DAK API through.",
      install: { none: true },
      invoke: { shell: "python3 input/scripts/generate_dak_api_hub.py" },
      io: {
        inputs: [{ name: "igOutput", schema: t("RepoPath"), required: true }],
        outputs: [
          { name: "hub", schema: t("RepoPath"), description: "`dak-api.html`." },
          { name: "sidecars", schema: t("RepoPath"), description: "`.openapi.json` and `.displays.json` under `schemas/`." },
        ],
      },
      satisfies: ["dak-postprocessing", "ig-artifact-ingestion"],
      selection: {
        when: "The DAK API is to have a reader-facing entry point.",
        limits:
          "`dak-api.html` links its schemas to a `schemas/` directory that the root enumeration schemas are NOT in — the documented discrepancy `qsf5` found. Do not resolve a sidecar by composing the hub's path; resolve it from the index.",
        cost: "The largest script in the upstream set. It runs inside the publisher container against the full output.",
      },
      requires: { runtime: ["python3"], network: false },
    }),

    // ── The metadata → Jekyll bridge ─────────────────────────────────────
    //
    // The seam the just-the-docs transition cuts at. It already does what
    // `jut3` asks for; what it needs is re-pointing, not redesigning.
    defineTool({
      id: "smart-liquid-variables",
      title: "IG metadata → Liquid variables",
      description:
        "Scan the Publisher's `output/` for `{ResourceType}-{id}.json` and emit a Liquid include assigning `smart__<ResourceType>__<id>__<category>__<key>` for each published resource.",
      install: { none: true },
      invoke: { shell: "python3 input/scripts/generate_smart_liquid.py" },
      io: {
        inputs: [
          { name: "igOutput", schema: t("RepoPath"), required: true, description: "The Publisher's `output/`; the script names this its source of truth." },
          { name: "igRoot", schema: t("RepoPath"), required: false, description: "Repository root, where `input/` lives. Defaults to `.`." },
        ],
        outputs: [
          { name: "include", schema: t("RepoPath"), description: "`input/includes/smart.liquid`, copied to `output/smart.liquid`." },
          { name: "categories", schema: t("Text"), description: "`url__canonical`, `url__page`, `url__json`, `text__display`, `link__html`, `elements__<key>`." },
        ],
      },
      satisfies: ["dak-postprocessing"],
      selection: {
        when:
          "Page content needs to reference a published resource by canonical URL, page URL, download URL or display label without hard-coding any of them. It is the existing answer to \"use IG Publisher metadata to populate the variables Jekyll processes\".",
        limits:
          "The documentation page it writes, `input/pagecontent/smart.liquid.md`, is processed BY THE NEXT BUILD — the script says so itself and works around it by writing `output/smart.liquid.html` directly. A surface that takes two builds to converge cannot underpin an incremental staging loop. Resource ids are normalised by replacing every non-alphanumeric character with `_`, so two ids differing only in punctuation collide into one variable name.",
        cost: "Seconds. The variables are recomputed from scratch on every run; there is no delta path.",
      },
      requires: { runtime: ["python3"], network: false },
    }),

    // ── The FHIR package-cache seeder, with WHO's publisher site ─────────
    //
    // fhir-harness's `fhir-cache-seed-npm` takes publisher-site rules as a
    // parameter and has none of its own. This is the same seeder invoked with
    // the rule smart-base owns — the seam the owner chose 2026-10-07.
    defineTool({
      id: "smart-fhir-cache-seed",
      title: "Seed the FHIR package cache, with WHO's published site as a source",
      description:
        "Run fhir-harness's `fhir-cache-seed-npm` with smart-base's publisher-site rules (`SMART_PUBLISHER_SITE_REPOS`): `smart.who.int.*` packages are also read from WHO's published-site repository, each fetch verified against the tarball's own package.json. Every other source and check is the seeder's own.",
      install: { none: true },
      invoke: {
        shell: `bun run fhir-harness/scripts/fhir-cache-seed-npm.ts ${smartSiteRepoArgs().join(" ")} [--cache <dir>] [--sushi-config <file>] [--mirror <dir|git-url>] [--template-repo <name=owner/repo>] [--missing-out <file>] [--dry-run] [name#version ...]`,
      },
      io: {
        inputs: [
          { name: "sushi-config", schema: t("FilesystemPath"), required: false, description: "Seed what this IG pins: its `dependencies:` and the core package for its `fhirVersion`." },
          { name: "cache", schema: t("FilesystemPath"), required: false, description: "Default `~/.fhir/packages`, which SUSHI and the IG Publisher read." },
        ],
        outputs: [
          { name: "installed", schema: t("Count") },
          { name: "missing", schema: t("Count"), description: "Exit 1 when any is missing, each listed with why." },
        ],
      },
      satisfies: ["ig-publisher-fork"],
      selection: {
        when: "Seeding the cache for a WHO SMART IG where packages.fhir.org is unreachable, so `smart.who.int.*` dependencies can also come from WHO's published site.",
        limits: "The site rule only adds a source; the seeder's trust checks, exact-version rule and missing list are unchanged.",
        cost: "As `fhir-cache-seed-npm`, plus one `git ls-remote` and one download per `smart.who.int.*` package.",
      },
      requires: { runtime: ["bun", "npm", "git"], network: true },
      remedies: [
        { host: "github.com", none: "WHO's published-site repository is read from GitHub; with it refused, only npm and `--mirror` remain." },
      ],
    }),

    // ── L1 recommendation extraction → L2 candidates ─────────────────────
    //
    // Task #23, beans `kvd2` / `8pzh`: an ingested L1 guideline → its
    // recommendations (L1 3.0) → one user-scenario candidate each, with the
    // persona, process and domain reused from existing vocabulary. Two tools,
    // because the judgement BETWEEN them is an agent's and lives in the skill
    // `recommendation-extraction`, not in code: the first writes the work list
    // and gates the agent's curation; the second gates the agent's mapping.
    // Both are implemented in `smart-base/scripts/` (this harness's code
    // directory), and each run writes a `folio-run-context/v1` beside its output.
    defineTool({
      id: "l1-recommendation-candidates",
      title: "L1 guideline → recommendation candidates (L1 3.0)",
      description:
        "Find every normative sentence of an ingested `library/` entry (folio-assistant-core's `l1-coverage` markers), hint where a reading is uncertain, and propose the publication's identity. Given an agent's `l1-recommendation-curation/v1`, refuse a non-verbatim statement or an unknown location, and write the recommendations and remarks as an L1 3.0 graph, checked with `kg/src/validate.ts`, with coverage and the proposed (unsigned) exclusions.",
      install: { none: true },
      invoke: { shell: "bun run smart-base/scripts/l1-recommendation-candidates.ts --entry <library entry> [--curation <curation.yaml>] --out <dir> [--check]" },
      io: {
        inputs: [
          { name: "entry", schema: t("RepoPath"), required: true, description: "An ingested `library/<id>/` with page-tagged `sections/*.md` and `structure.json`." },
          { name: "curation", schema: t("RepoPath"), required: false, description: "The agent's decisions per candidate location (`l1-recommendation-curation/v1`). Absent: only the work list is written." },
        ],
        outputs: [
          { name: "candidates", schema: t("RepoPath"), description: "`recommendation-candidates.json` — every normative sentence, its hints and its decision; cites the run context." },
          { name: "graph", schema: t("RepoPath"), description: "`l1.json` — L1 3.0 publication, recommendation and remark nodes, every one `inferred`." },
          { name: "exclusions", schema: t("RepoPath"), description: "`exclusions.proposed.json`, in `l1-coverage`'s shape; none counts until a person signs it." },
          { name: "warnings", schema: t("RepoPath"), description: "`extraction-warnings.md` — undecided candidates, unsigned exclusions, statements taken from a layout fragment." },
          { name: "runContext", schema: t("RepoPath"), description: "`run-context.json`, cat-harness `folio-run-context/v1`." },
        ],
      },
      satisfies: ["recommendation-extraction"],
      selection: {
        when: "A WHO guideline, position paper or handbook has been ingested and its recommendations are to become L1 3.0 nodes — in particular one that prints no `Recommendation N:` labels, where `extract-smart-kg-l1` finds none.",
        limits:
          "It finds candidates by marker words only, so a recommendation printed without `should`/`must`/`recommend…` (a step in a table, an imperative) is invisible to it. The sentence splitter reads a bulleted list or a table row as one sentence; the curation's `statement` override narrows it. It decides nothing: with no curation every candidate is `undecided`.",
        cost: "Seconds, no network.",
      },
      requires: { runtime: ["bun"], network: false },
    }),

    defineTool({
      id: "l1-recommendation-scenarios",
      title: "L1 recommendations → L2 user-scenario candidates",
      description:
        "One smart-kg L2 `user-scenario` candidate per L1 recommendation, joined to a `persona` and a `business-process` by the edges smart-kg L2 already licenses, from an agent's `l1-scenario-mapping/v1`. Reuses the guide's own personas and processes, then smart-base's generic `DAK.Persona.*`; otherwise a glossary candidate or `could-not-determine`, each with a WARNING. Never invents a process.",
      install: { none: true },
      invoke: { shell: "bun run smart-base/scripts/l1-recommendation-scenarios.ts --l1 <l1.json|yaml> --vocabulary <guide.json> [--generic <generic.json>] --mapping <mapping.yaml> --out <dir> [--check]" },
      io: {
        inputs: [
          { name: "l1", schema: t("RepoPath"), required: true, description: "The recommendations: the first tool's L1 3.0 graph, or an authored L1 YAML." },
          { name: "vocabulary", schema: t("RepoPath"), required: true, description: "The target guide's personas and processes (`l1-scenario-vocabulary/v1`)." },
          { name: "generic", schema: t("RepoPath"), required: false, description: "smart-base's generic personas, the second rung." },
          { name: "mapping", schema: t("RepoPath"), required: true, description: "The agent's persona, process, act, outcome and domain per recommendation, each with a source and a basis." },
        ],
        outputs: [
          { name: "graph", schema: t("RepoPath"), description: "`scenario-candidates.l2.json`." },
          { name: "warnings", schema: t("RepoPath"), description: "`scenario-warnings.md` — processes not determined, personas that are glossary candidates." },
          { name: "runContext", schema: t("RepoPath"), description: "`run-context.json`, cat-harness `folio-run-context/v1`." },
        ],
      },
      satisfies: ["recommendation-extraction"],
      selection: {
        when: "Each extracted recommendation is to say who acts on it and during which business process, before any L2 asset is drawn.",
        limits:
          "It checks ids against the vocabulary and coverage against the recommendations; whether a persona or process is the RIGHT one is the agent's judgement in the mapping, and stays `candidate` until a person reviews the entry. smart-kg's `user-scenario` has no slot for domain, link source or review status, so those ride on the edges.",
        cost: "Seconds, no network.",
      },
      requires: { runtime: ["bun"], network: false },
    }),

    // Written 2026-10-15 for the Uganda adaptation after the `smart-base-tools` search found no
    // upstream check for L1 authored from inspected images: a declared Tool, not a script in the
    // adaptation repository (that repository's hand-written copy is retired).
    defineTool({
      id: "l1-transcription-verbatim",
      title: "Authored L1 → verbatim against transcriptions and image narratives",
      description:
        "Check authored L1 (`*.l1.yaml`, the measles pattern) for a source with no usable text layer: each statement must be verbatim in the image narrative (`images.json`) or the `transcription` block it names, every transcription word (digits aside) must be corroborated by the entry's text layer unless listed under `inspectionOnly`, and keys must be unique.",
      install: { none: true },
      invoke: { shell: "bun run smart-base/scripts/l1-transcription-verbatim.ts --dir <dir of *.l1.yaml> [--root <repo>]" },
      io: {
        inputs: [
          { name: "dir", schema: t("RepoPath"), required: true, description: "The directory of authored `*.l1.yaml`; each names its library entry in `graph.source.entry`." },
        ],
        outputs: [
          { name: "report", schema: t("Text"), description: "One summary line per file and one `FINDING` line per failure. Exit 0 clean, 1 findings, 2 nothing to check (not a pass)." },
        ],
      },
      satisfies: ["recommendation-extraction"],
      selection: {
        when: "The L1 was authored from inspected images or transcriptions because `l1-recommendation-candidates` found no normative sentence in the entry's text layer (a poster, a slide deck).",
        limits:
          "Verbatim is checked after NFKC normalisation and with private-use glyphs dropped, so digits a text layer maps to private-use code points rest on the inspection alone; that the transcription reads the picture correctly is the reviewer's call (`bun run cat narratives`).",
        cost: "Seconds, no network.",
      },
      requires: { runtime: ["bun"], network: false },
    }),
  ];
}
