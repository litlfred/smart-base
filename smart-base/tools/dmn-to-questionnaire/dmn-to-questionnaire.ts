import { defineTool, toolFactory } from "../../platform/index.js";

// ── L2 authoring transforms ──────────────────────────────────────────
//
// The owner named this one specifically. It is the clearest case in the
// set for why these are tools rather than pipeline steps: it MINTS FHIR
// RESOURCES. Delete it and the IG is missing `Questionnaire`s — not
// missing a page. It runs in the pre-processing phase only because the
// pipeline had nowhere earlier to put it.
export default toolFactory((t) =>
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
);
