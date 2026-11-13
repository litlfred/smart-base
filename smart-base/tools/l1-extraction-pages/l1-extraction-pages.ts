import { defineTool, toolFactory } from "../../platform/index.js";

export default toolFactory((t) =>
  defineTool({
    id: "l1-extraction-pages",
    title: "Draw the l1-extraction viewer: a hub and one page per layer that declares an extraction",
    description:
      "For every visualiser a layer declares with `renderedBy: l1-extraction-pages`, write the hub at `<locale>/<harness>/<id>/` and, with `subgraphs: \"instance\"`, one page per layer that declares an `l1-extraction` directory: its L1 statements, candidate work list, graph documents by node type and edge predicate, and a link from every file to its published copy and to its source at the pinned commit. A declared directory not on disk is reported UNKNOWN, never zero.",
    install: { none: true },
    invoke: { shell: "bun run smart-base/scripts/gen-l1-extraction-pages.ts" },
    // What this Tool CAN draw. smart-base.json declares that it DOES
    // (`visualisers`, `renderedBy: l1-extraction-pages`), and
    // `check:visualiser-routes` checks the covered kind is listed here.
    renders: ["l1-extraction"],
    io: {
      inputs: [
        { name: "root", schema: t("RepoPath"), required: false, arg: { flag: "--root" }, description: "The checkout whose layers are read. Default: the checkout this script is in." },
        { name: "site", schema: t("RepoPath"), required: false, arg: { flag: "--site" }, description: "A site being built: the pages go under it. Without it, under the checkout's site directory." },
        { name: "check", schema: t("Flag"), required: false, arg: { flag: "--check" }, description: "Write nothing; exit 1 when a page is stale, missing or orphaned." },
      ],
      outputs: [
        { name: "pages", schema: t("Count"), description: "Pages written: the hub and one per layer declaring an `l1-extraction` directory." },
      ],
    },
    satisfies: ["docs-generation"],
    selection: {
      when: "Building the docs site or a staging preview: a layer declares an `l1-extraction` directory.",
      limits: "Reads what the files declare; it does not re-run the extraction or judge it.",
      cost: "Seconds; one page per declaring layer.",
    },
    requires: { runtime: ["bun"], network: false },
  }),
);
