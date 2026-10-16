import { defineTool, toolFactory } from "../../platform/index.js";

export default toolFactory((t) =>
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
);
