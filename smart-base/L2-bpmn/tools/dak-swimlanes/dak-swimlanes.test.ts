import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  crosswalk,
  declaredProcessDirectories,
  discoverBpmnFiles,
  lanesFrom,
  loadActorDefinitions,
  personaAnchor,
  personasFrom,
  personasMarkdown,
  processesFrom,
  processesMarkdown,
  resolveLane,
  swimlaneQa,
  validateBpmnFile,
  validateBpmnXml,
  validateSwimlaneActors,
  validateSwimlanes,
  type SwimlaneMap,
} from "./dak-swimlanes";

const map: SwimlaneMap = {
  $schema: "dak-swimlanes/v1",
  annexOf: "10665/380303",
  label: "Web Annex B",
  section: "dak#generic-business-processes-and-workflows",
  personas: { "Health worker (HW)": ["Health worker", "HW"], "Community health worker": ["CHW"], Client: [], Caregiver: [] },
  notPersonas: { Function: "header lane", "Vaccination location": "a pool", Community: "a pool" },
};

const personasPage = "<table><tbody>\n<tr>\n<td>Health worker (HW)</td><td>x</td></tr>\n<tr>\n<td>Community health worker</td></tr>\n<tr>\n<td>Client</td></tr>\n<tr>\n<td>Caregiver</td></tr></tbody></table>";
const processesPage = [
  "#### Overview",
  "####  A.  Register  ",
  '<img src="a.svg" />',
  "####  F .  Trace  ",
  '<img src="f.svg" />',
].join("\n");
const svg = (...lanes: string[]) => lanes.map((l) => `<v:ud v:nameU="visHeadingText" v:prompt="" v:val="VT4(${l})" />`).join("\n");
const figures: Record<string, string> = { "a.svg": svg("Function", "Vaccination location\nHealth worker", "Client", "Client"), "f.svg": svg("Community\nCHW", "PCPOSS") };

const validBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://smart.who.int/bpmn">
  <bpmn:collaboration id="Collab_1">
    <bpmn:participant id="Pool_Clinic" name="Clinic Workflow" processRef="Proc_1" />
  </bpmn:collaboration>
  <bpmn:process id="Proc_1" name="Registration" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="DAK.Client" name="Client">
        <bpmn:flowNodeRef>Start_1</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="DAK.HealthWorker" name="Health worker">
        <bpmn:flowNodeRef>Task_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_1</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="Start_1" name="Arrive" />
    <bpmn:task id="Task_1" name="Register client" />
    <bpmn:endEvent id="End_1" name="Done" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="End_1" />
  </bpmn:process>
</bpmn:definitions>`;

describe("dak-swimlanes", () => {
  test("readsPersonasProcessesAndLaneTitles", () => {
    expect(personasFrom(personasPage)).toEqual(["Health worker (HW)", "Community health worker", "Client", "Caregiver"]);
    const p = processesFrom(processesPage);
    expect(p.map((x) => [x.letter, x.name, x.anchor, x.figure])).toEqual([
      ["A", "Register", "a--register", "a.svg"],
      ["F", "Trace", "f---trace", "f.svg"],
    ]);
    expect(lanesFrom(figures["a.svg"]!)).toContain("Vaccination location Health worker");
  });

  test("resolvesLaneThroughAliases", () => {
    expect(resolveLane("Vaccination location Health worker", map)).toEqual({ personas: ["Health worker (HW)"], rest: "" });
    expect(resolveLane("Community CHW", map)).toEqual({ personas: ["Community health worker"], rest: "" });
    expect(resolveLane("PCPOSS", map)).toEqual({ personas: [], rest: "PCPOSS" });
  });

  test("crosswalkLinksBothWaysQaNamesGaps", () => {
    const personas = personasFrom(personasPage);
    const cw = crosswalk(personas, processesFrom(processesPage), (f) => lanesFrom(figures[f] ?? ""), map);
    // Client appears twice in a.svg and is one row.
    expect(cw.rows.filter((r) => r.lane === "Client").length).toBe(1);
    const pm = personasMarkdown(personas, cw, "bp.html");
    expect(pm).toContain(`<span id="${personaAnchor("Health worker (HW)")}"></span>Health worker (HW) | [A. Register](bp.html#a--register)`);
    expect(pm).toContain("Caregiver | _no swimlane in any process_");
    const qm = processesMarkdown(cw, map, "p.html");
    expect(qm).toContain("[Community health worker](p.html#persona-community-health-worker)");
    expect(qm).toContain("**not a declared persona:** PCPOSS");
    const qa = swimlaneQa("ig", { script: "s", script_hash: "h" }, personas, cw);
    expect(qa.families["persona-without-swimlane"].entries).toEqual([{ persona: "Caregiver" }]);
    expect(qa.families["swimlane-without-persona"].count).toBe(1);
    expect(qa.total).toBe(2);
  });

  test("validatesBpmnXmlAndRejectsVendorNamespaces", () => {
    expect(validateBpmnXml(validBpmn)).toEqual([]);
    expect(validateBpmnXml("<unclosed").map((i) => i.code)).toContain("BPMN-XML-001");
    expect(validateBpmnXml(`<other xmlns="http://example.org"/>`).map((i) => i.code)).toContain("BPMN-XML-002");

    const withVendor = validBpmn
      .replace(
        `xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"`,
        `xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:camunda="http://camunda.org/schema/1.0/bpmn"`,
      )
      .replace(`id="Task_1"`, `id="Start_1"`);
    const codes = validateBpmnXml(withVendor).map((i) => i.code);
    expect(codes).toContain("BPMN-XML-003");
    expect(codes).toContain("BPMN-XML-005");
  });

  test("validatesSwimlaneStructureAndOrphanFlowNodes", () => {
    expect(validateSwimlanes(validBpmn)).toEqual([]);

    const noLanes = `<?xml version="1.0" encoding="UTF-8"?>
      <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D1">
        <bpmn:process id="P1"><bpmn:task id="T1" name="Step"/></bpmn:process>
      </bpmn:definitions>`;
    expect(validateSwimlanes(noLanes).map((i) => i.code)).toContain("SWIM-001");

    const badLaneAndOrphan = validBpmn
      .replace(`id="DAK.Client"`, `id="invalid id with spaces"`)
      .replace(`<bpmn:flowNodeRef>End_1</bpmn:flowNodeRef>`, "");
    const issues = validateSwimlanes(badLaneAndOrphan);
    expect(issues.map((i) => i.code)).toContain("SWIM-003");
    expect(issues.map((i) => i.code)).toContain("SWIM-004");
    expect(issues.find((i) => i.code === "SWIM-004")?.elementId).toBe("End_1");
  });

  test("resolvesActorsByInstanceIdRegardlessOfFilenameAndDiscoversDeclaredDirs", () => {
    const tmp = mkdtempSync(join(tmpdir(), "dak-swimlanes-test-"));
    try {
      // ActorDefinitions live in an arbitrarily named .fsh file (e.g. ActorDefinition-client.fsh
      // or SG.Personas.fsh), never requiring ActorDefinition-DAK.<laneId>.fsh.
      const fshDir = join(tmp, "input", "fsh", "actors");
      mkdirSync(fshDir, { recursive: true });
      writeFileSync(
        join(fshDir, "ActorDefinition-client.fsh"),
        [
          "Instance: DAK.Client",
          "InstanceOf: ActorDefinition",
          '* name = "Client"',
          '* title = "Client"',
          "",
          "Instance: DAK.HealthWorker",
          "InstanceOf: SGPersona",
          '* name = "HealthWorker"',
          '* title = "Health worker"',
        ].join("\n"),
      );

      // Declare a custom `processes` directory in a nested graph.json, plus `input/bpmn/` fallback.
      const procDir = join(tmp, "L2", "processes");
      mkdirSync(procDir, { recursive: true });
      writeFileSync(
        join(tmp, "test-ig.json"),
        JSON.stringify({
          name: "test-ig",
          directories: [{ id: "l2", path: "L2/", graphTypologies: ["cat-harness"] }],
        }),
      );
      writeFileSync(
        join(tmp, "L2", "graph.json"),
        JSON.stringify({
          name: "L2",
          directories: [{ id: "l2-procs", path: "processes/", graphTypologies: ["processes"] }],
        }),
      );
      const bpmnPath = join(procDir, "registration.bpmn");
      writeFileSync(bpmnPath, validBpmn);

      expect(declaredProcessDirectories(tmp)).toEqual([procDir]);
      expect(discoverBpmnFiles(tmp)).toEqual([bpmnPath]);

      const actors = loadActorDefinitions(tmp);
      expect(actors.map((a) => a.id)).toEqual(["DAK.Client", "DAK.HealthWorker"]);
      expect(validateBpmnFile(bpmnPath, actors)).toEqual([]);

      const unknownLane = validBpmn.replace(`id="DAK.HealthWorker" name="Health worker"`, `id="DAK.Unknown" name="Unmapped Role"`);
      const actorIssues = validateSwimlaneActors(unknownLane, actors, bpmnPath);
      expect(actorIssues.map((i) => i.code)).toEqual(["ACTOR-001"]);
      expect(actorIssues[0]?.elementId).toBe("DAK.Unknown");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
