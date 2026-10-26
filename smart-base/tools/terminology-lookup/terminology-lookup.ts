import { defineTool, toolFactory } from "../../platform/index.js";

export default toolFactory((t) =>
  defineTool({
    id: "terminology-lookup",
    title: "Reuse-first terminology and code-list lookup",
    description:
      "Look up a concept or code token for a semantic slot (`condition`, `intervention`, `persona`, `medicine`, `domain`, `business-process`, `recommendation-strength`, `recommendation-direction`, `evidence-certainty`) across the four reuse-first precedence rungs of the `terminology-coding` methodology: (1) target guide's `l1-scenario-vocabulary/v1`, (2) `smart-base` generic personas (`DAK.Persona.*`), GRADE `code-lists/*.json` and `guideline-domain` SKOS glossary, (3) local WHO/ILO FSH CodeSystems (`ISCO08`, `CDHIv2`, `CDHIv1`, `CDSCv2`, `KGTerminologySystem`), and (4) a proposed `glossary-terms` candidate (`status: \"candidate\"`) or `could-not-determine` for `business-process`.",
    install: { none: true },
    invoke: {
      shell:
        "bun run smart-base/scripts/terminology-lookup.ts --slot <slot> --query <query> [--vocabulary <guide.json>] [--generic <generic.json>] [--scheme <scheme>] [--out <out.json>]",
    },
    io: {
      inputs: [
        {
          name: "slot",
          schema: t("Slug"),
          required: true,
          description:
            "The semantic slot to classify and code (`condition`, `intervention`, `persona`, `medicine`, `domain`, `business-process`, `recommendation-strength`, `recommendation-direction`, `evidence-certainty`).",
        },
        {
          name: "query",
          schema: t("DocId"),
          required: true,
          description:
            "The concept term, identifier, or code token to look up across the reuse-first precedence rungs.",
        },
        {
          name: "vocabulary",
          schema: t("RepoPath"),
          required: false,
          description: "Optional path to the target guide's personas and business processes (`l1-scenario-vocabulary/v1`), Rung 1.",
        },
        {
          name: "generic",
          schema: t("RepoPath"),
          required: false,
          description: "Optional path to smart-base's generic personas (`l1-scenario-vocabulary/v1`), Rung 2.",
        },
        {
          name: "scheme",
          schema: t("DocId"),
          required: false,
          description: "Optional scheme identifier filter (e.g. `guideline-domain`, `ISCO08`, `CDHIv2`, `grade-recommendation-strength`).",
        },
        {
          name: "out",
          schema: t("RepoPath"),
          required: false,
          description: "Optional repository path where the lookup result JSON is written.",
        },
      ],
      outputs: [
        {
          name: "result",
          schema: t("RepoPath"),
          description: "Lookup result JSON conforming to `schemas/skills/classify-and-code-content/output.schema.json`.",
        },
      ],
    },
    satisfies: ["classify-and-code-content"],
    selection: {
      when: "Classifying and coding L1 narrative statements or L2 DAK slots (personas, processes, domains, interventions, conditions, medicines, GRADE ratings) under the reuse-first precedence of `terminology-coding`.",
      limits:
        "First implementation queries local code lists, SKOS glossaries, `l1-scenario-vocabulary/v1` files, and FSH CodeSystems offline. It ranks lexical exact/close matches and prepares Rung 4 candidate records, while semantic fit and exclusion sign-off remain human judgements in `classify-and-code-content.bpmn`.",
      cost: "Milliseconds, offline.",
    },
    requires: { runtime: ["bun"], network: false },
  }),
);
