import { defineTool, toolFactory } from "../../platform/index.js";

// WHO's L2 → L3 extractor, declared so the tools graph can find it. Until
// 2026-10-15 it was absent here, so an agent adapting a DAK searched the
// graph, found nothing for decision tables or requirements, and wrote its
// own converter in the adaptation repository (Uganda, folio-assistant#2559).
// Declare here, execute upstream (`smart-base-tools`): nothing is vendored.
export default toolFactory((t) =>
  defineTool({
    id: "extract-dak",
    title: "DAK spreadsheets → DMN, PlanDefinitions, CQL, requirements, logical models",
    description:
      "Run WHO's `extract_dak.py` in a DAK or IG repository: it reads the DAK template spreadsheets (`input/decision-logic/*.xlsx` via `dt_extractor`, `input/system-requirements/*.xlsx` via `req_extractor`, `input/dictionary/*.xlsx` via `dd_extractor`) and the BPMN, and writes the DMN decision tables, the CPG recommendation PlanDefinitions with their citations, CQL library skeletons, Requirements and logical-model FSH. The authoring path the WHO IG Starter Kit (`l3_decisiontables`, `l3_cql`) prescribes: an adapted decision or scheduling table is an edited copy of the upstream DAK's spreadsheet, never a parallel format.",
    install: { none: true },
    invoke: { shell: "python3 $SMART_BASE_HOME/input/scripts/extract_dak.py" },
    io: {
      inputs: [
        { name: "dakRepository", schema: t("FilesystemPath"), required: true, description: "The working directory: a DAK or IG repository holding `input/decision-logic/`, `input/system-requirements/` and `input/dictionary/` spreadsheets in the DAK template layout." },
      ],
      outputs: [
        { name: "dmn", schema: t("RepoPath"), description: "Decision tables in the DAK DMN format (namespace `https://www.omg.org/spec/DMN/20240513/MODEL/`), each with an `Annotations` and a `Reference(s)` output." },
        { name: "fsh", schema: t("RepoPath"), description: "PlanDefinition, ActivityDefinition, Requirements and logical-model FSH, for SUSHI to compile." },
        { name: "cql", schema: t("RepoPath"), description: "CQL library skeletons, one per decision table, with the definitions already present in `input/cql/` carried over." },
      ],
    },
    satisfies: ["smart-base-tools"],
    selection: {
      when: "An L2 decision-support, scheduling, requirements or data-dictionary component is created or adapted, and the upstream DAK keeps it in the WHO DAK spreadsheet template. Look for that spreadsheet in the upstream repository before writing any decision table by hand.",
      limits:
        "It reads only the DAK template layout (COVER sheet, per-tab inputs and outputs); a table in any other shape is invisible to it. It requires a `smart-base` checkout at `SMART_BASE_HOME`; without one the capability is ABSENT, not a clean run. Some DAK repositories (https://github.com/litlfred/smart-immunizations) also carry their own converters (`tools/node/processDT*.js`); use the upstream's own where it has one.",
      cost: "Seconds to minutes, no network unless `--run-publisher` is passed.",
    },
    requires: { runtime: ["python3"], network: false },
  }),
);
