import { defineTool, toolFactory } from "../../platform/index.js";

// ── The DAK API surface ──────────────────────────────────────────────
//
// `dak-api-hub` is the WHO-shaped one. Three siblings that were here —
// `logical-model-schemas`, `valueset-schemas`, `jsonld-vocabularies` —
// are any IG's JSON surface and moved to `fhir-harness/tools/` (#1767,
// stage B′), on the precedent the Library strippers set.



export default toolFactory((t) =>
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
);
