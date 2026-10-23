import { defineTool, toolFactory } from "../../platform/index.js";

// ── The l1-extraction viewer ─────────────────────────────────────────
//
// smart-base owns the `l1-extraction` kind (owner, 2026-10-16:
// "l1-extraction is part of smart-base"), so its viewer is drawn here: a hub
// at the visualiser's route and one page per instance declaring a directory
// of the kind (smart-base's handbook extraction, and the measles example of
// the immunizations guideline layer above it). Implemented in `smart-base/scripts/gen-l1-extraction-pages.ts`.
export default toolFactory((t) =>
  defineTool({
    id: "l1-extraction-pages",
    title: "Write the L1 extraction viewer: a page per instance holding `l1-extraction` directories, and a hub",
    description:
      "For every visualiser an instance declares `renderedBy: l1-extraction-pages`, write the hub at `<locale>/<harness>/<id>/` and, with `subgraphs: \"instance\"`, one page per instance that declares an `l1-extraction` directory. Each shows what was extracted, read from the files by what they declare: the L1 statements (graph nodes carrying a `statement`, and an authored L1 source's `recommendations`), the candidate work list's counts, coverage and decisions, each graph document's nodes by type and edges by predicate (the L2 scenario candidates among them), the curation, mapping, vocabulary, exclusions and run context counted, and every file linked to its published copy (cat-harness's `library:viz`) when the site holds it and to its source at the pinned commit. A declared directory not on disk is reported UNKNOWN, never as zero.",
    install: { none: true },
    invoke: { shell: "bun run smart-base/scripts/gen-l1-extraction-pages.ts" },
    // What this Tool CAN draw. An instance declares that it DOES, in its own
    // `visualisers`, and `check:visualiser-routes` checks the kind is listed here.
    renders: ["l1-extraction"],
    io: {
      inputs: [
        { name: "site", schema: t("RepoPath"), required: false, arg: { flag: "--site" }, description: "A site being built: the pages go under it (`visualiser-writers.ts` in cat-harness-tools passes it). Absent, they go under the checkout's site directory." },
        { name: "root", schema: t("RepoPath"), required: false, arg: { flag: "--root" }, description: "The checkout whose declarations are read. Default: the checkout holding the working directory." },
        { name: "check", schema: t("Flag"), required: false, description: "Write nothing; exit 1 when a page is stale, missing or orphaned." },
      ],
      outputs: [{ name: "pages", schema: t("Count"), description: "Pages written: the hub and one per instance." }],
    },
    // A page writer, as the other kind viewers are (`bibliography-page`,
    // `glossary-page`, `iris-pages`): it draws what an extraction holds and
    // takes none of `recommendation-extraction`'s inputs (`l1Sources`).
    satisfies: ["graph-rendering"],
    selection: {
      when: "Publishing a site that should show what each L1 extraction holds.",
      limits: "Shows what the files hold; it validates nothing (`l1-recommendation-candidates` and `l1-recommendation-scenarios` do, on every write) and does not re-render the JSON-LD (the library viewer publishes it).",
      cost: "Reads each file of each declared directory once.",
    },
    requires: { runtime: ["bun"], network: false },
  }),
);
