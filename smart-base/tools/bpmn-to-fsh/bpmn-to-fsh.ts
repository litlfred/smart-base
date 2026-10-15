import { defineTool, toolFactory } from "../../platform/index.js";

export default toolFactory((t) =>
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
);
