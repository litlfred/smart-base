import { defineTool, toolFactory } from "../../platform/index.js";

// ── The metadata → Jekyll bridge ─────────────────────────────────────
//
// The seam the just-the-docs transition cuts at. It already does what
// `jut3` asks for; what it needs is re-pointing, not redesigning.
export default toolFactory((t) =>
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
);
