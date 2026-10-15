import { defineTool, toolFactory } from "../../platform/index.js";

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
export default toolFactory((t) =>
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
);
