import { defineTool, toolFactory } from "../../platform/index.js";

// ── The DAK configuration itself ─────────────────────────────────────
export default toolFactory((t) =>
  defineTool({
    id: "dak-config-from-sushi",
    title: "sushi-config.yaml → index.config.json#contentTypes.dak",
    description:
      "Derive the DAK configuration from `sushi-config.yaml` plus repository and branch context.",
    install: { none: true },
    invoke: { shell: "python3 input/scripts/generate_dak_from_sushi.py" },
    io: {
      inputs: [
        { name: "sushiConfig", schema: t("RepoPath"), required: true, description: "`sushi-config.yaml` at the IG root." },
        { name: "branch", schema: t("Branch"), required: false, description: "Sanitised branch name, for the publication and preview URLs." },
      ],
      outputs: [{ name: "dakConfig", schema: t("RepoPath"), description: "`index.config.json` (`contentTypes.dak`) — ours, per bean `cz17`. Upstream still writes `dak.json`." }],
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
);
