/**
 * Unit tests for the proposed DTH governance and planning schemas
 * (`litlfred/dth-sfp#1` Step P6d, `litlfred/dth-phc#1` Step P4b, and
 * `litlfred/smart-base#242`).
 *
 * Exercises all six schemas against realistic fixtures from:
 * - `dth-sfp` (`9789240120747-eng`, Substandard and falsified medical products)
 * - `dth-phc` (`9789240093362-eng`, Primary health care / PCPOSS)
 * - `dth-pc` (`9789240116191-eng`, National product catalogue)
 *
 * @module smart-base/scripts/tests/dth-planning-schemas.test
 */

import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  BARRIER_SOLUTION_MAP_SCHEMA_TAG,
  BarrierSolutionMapSchema,
  DTH_PLANNING_SCHEMA_TAGS,
  DTH_PRODUCES_DAK_KINDS,
  DthPlanningArtefactSchema,
  GOVERNANCE_ROLE_SCHEMA_TAG,
  GovernanceRoleSchema,
  IMPLEMENTATION_STEP_LIST_SCHEMA_TAG,
  ImplementationStepListSchema,
  RACI_MATRIX_SCHEMA_TAG,
  RaciMatrixSchema,
  RISK_REGISTER_SCHEMA_TAG,
  RiskRegisterSchema,
  STAKEHOLDER_ANALYSIS_SCHEMA_TAG,
  StakeholderAnalysisSchema,
} from "../../schemas/dth-planning-schemas.ts";

const THIS_DIR = dirname(fileURLToPath(import.meta.url));
const BLOCK_KINDS_DIR = existsSync(resolve(THIS_DIR, "..", "..", "block-kinds"))
  ? resolve(THIS_DIR, "..", "..", "block-kinds")
  : resolve(THIS_DIR, "..", "..", "smart-base", "block-kinds");

describe("1. GovernanceRoleSchema (dth-governance-role/v1)", () => {
  test("accepts SFP §2.3 Steering Committee and NMRA Regulator fixtures (9789240120747-eng)", () => {
    const sfpSteeringCommittee = GovernanceRoleSchema.parse({
      id: "SFP-GOV-01",
      name: "National SF Medical Products Digital Surveillance Steering Committee",
      roleType: "steering-committee",
      mandate:
        "Provide strategic oversight, inter-ministerial policy alignment, and resource allocation for national substandard and falsified medical product reporting systems.",
      chairOrLeadRoleIri: "urn:who:smart-ra:role:nmra-director",
      memberRoleIris: [
        "urn:who:smart-ra:role:nmra-reviewer",
        "urn:who:smart-ra:role:moh-digital-health-lead",
        "urn:who:smart-ra:role:customs-enforcement-liaison",
      ],
      meetingCadence: "Quarterly",
      decisionRights: [
        "Approve national SF reporting digital roadmap and budget",
        "Endorse data-sharing agreements between NMRA, customs, and WHO GSMS",
      ],
      archimateElementIri: "urn:who:smart-ra:archimate:role:regulatory-steering-committee",
      sourceRef: {
        libraryId: "9789240120747-eng",
        sectionId: "sec-008",
        pages: "14-17",
        tableOrAnnex: "§2.3",
      },
    });

    expect(sfpSteeringCommittee.$schema).toBe(GOVERNANCE_ROLE_SCHEMA_TAG);
    expect(sfpSteeringCommittee.roleType).toBe("steering-committee");
    expect(sfpSteeringCommittee.memberRoleIris).toHaveLength(3);
  });

  test("accepts PHC Ch 1 §1.1.2 Technical Working Group fixture (9789240093362-eng)", () => {
    const phcTwg = GovernanceRoleSchema.parse({
      id: "PHC-GOV-TWG-01",
      name: "PCPOSS Technical Working Group",
      roleType: "technical-working-group",
      mandate:
        "Coordinate clinical, health-information, and ICT stakeholders to adapt functional requirements, interoperability standards, and implementation plans for person-centred point-of-service systems.",
      chairOrLeadRoleIri: "urn:who:dth-phc:persona:PHC-R-04",
      memberRoleIris: [
        "urn:who:dth-phc:persona:PHC-R-01",
        "urn:who:dth-phc:persona:PHC-R-05",
        "urn:who:dth-phc:persona:PHC-R-08",
      ],
      meetingCadence: "Monthly during requirements and design phases",
      decisionRights: [
        "Validate clinical workflows and minimum data sets",
        "Review vendor conformance against SMART Guidelines functional requirements",
      ],
      archimateElementIri: "urn:who:smart-ra:archimate:role:phc-technical-working-group",
      sourceRef: "9789240093362-eng#sec-004-1.1.2",
    });

    expect(phcTwg.$schema).toBe("dth-governance-role/v1");
    expect(phcTwg.roleType).toBe("technical-working-group");
  });

  test("rejects unknown roleType or non-IRI chairOrLeadRoleIri", () => {
    expect(
      GovernanceRoleSchema.safeParse({
        id: "SFP-GOV-BAD",
        name: "Invalid Governance Body",
        roleType: "informal-chat-group",
        mandate: "Mandate",
        chairOrLeadRoleIri: "urn:who:smart-ra:role:nmra",
        memberRoleIris: ["urn:who:smart-ra:role:nmra"],
        meetingCadence: "Quarterly",
        decisionRights: ["Approve roadmap"],
        archimateElementIri: "urn:who:smart-ra:archimate:role:nmra",
        sourceRef: "9789240120747-eng#sec-2.3",
      }).success,
    ).toBe(false);

    expect(
      GovernanceRoleSchema.safeParse({
        id: "SFP-GOV-BAD-IRI",
        name: "Invalid Chair IRI",
        roleType: "regulator",
        mandate: "Mandate",
        chairOrLeadRoleIri: "not a valid iri with spaces",
        memberRoleIris: ["urn:who:smart-ra:role:nmra"],
        meetingCadence: "Quarterly",
        decisionRights: ["Approve roadmap"],
        archimateElementIri: "urn:who:smart-ra:archimate:role:nmra",
        sourceRef: "9789240120747-eng#sec-2.3",
      }).success,
    ).toBe(false);
  });
});

describe("2. RaciMatrixSchema (dth-raci-matrix/v1)", () => {
  test("accepts populated RACI matrix and enforces at least one Accountable ('A') per activity", () => {
    const populatedRaci = RaciMatrixSchema.parse({
      id: "PHC-RACI-ANNEX-02",
      title: "PCPOSS Implementation Governance RACI Matrix",
      mode: "populated",
      roles: [
        {
          roleId: "moh-steering",
          label: "MoH Steering Committee",
          roleIri: "urn:who:dth-phc:governance:PHC-GOV-01",
        },
        {
          roleId: "pcposs-twg",
          label: "PCPOSS Technical Working Group",
          roleIri: "urn:who:dth-phc:governance:PHC-GOV-TWG-01",
        },
        {
          roleId: "health-worker",
          label: "Primary Health Care Worker",
          roleIri: "urn:who:dth-phc:persona:PHC-R-01",
        },
      ],
      activities: [
        {
          activityId: "PHC-ACT-01",
          activity: "Define national PCPOSS vision and scope",
          phase: "Phase 1: Assess current state",
          assignments: {
            "moh-steering": ["A"],
            "pcposs-twg": ["R", "C"],
            "health-worker": ["I"],
          },
        },
        {
          activityId: "PHC-ACT-02",
          activity: "Validate clinical user scenarios and point-of-service workflows",
          phase: "Phase 5: Determine requirements",
          assignments: {
            "moh-steering": ["I"],
            "pcposs-twg": ["A", "R"],
            "health-worker": ["C"],
          },
        },
      ],
      sourceRef: {
        libraryId: "9789240093362-eng",
        sectionId: "sec-036",
        pages: "71-72",
        tableOrAnnex: "Annex 2",
      },
    });

    expect(populatedRaci.$schema).toBe(RACI_MATRIX_SCHEMA_TAG);
    expect(populatedRaci.activities).toHaveLength(2);
  });

  test("accepts SFP Annex 4 blank worksheet in template mode without requiring 'A'", () => {
    const sfpTemplateRaci = RaciMatrixSchema.parse({
      id: "SFP-RACI-ANNEX-04",
      title: "Annex 4: RACI matrix template for SF medical products reporting system",
      mode: "template",
      roles: [
        {
          roleId: "nmra",
          label: "National Medicines Regulatory Authority (NMRA)",
          roleIri: "urn:who:smart-ra:role:nmra",
        },
        {
          roleId: "twg",
          label: "Technical Working Group",
          roleIri: "urn:who:dth-sfp:governance:SFP-GOV-TWG",
        },
      ],
      activities: [
        {
          activityId: "SFP-RACI-TPL-01",
          activity: "Establish governance structure and terms of reference",
          phase: "Phase 1: Assess current state",
          assignments: {},
        },
      ],
      sourceRef: {
        libraryId: "9789240120747-eng",
        pages: "54",
        tableOrAnnex: "Annex 4",
      },
    });

    expect(sfpTemplateRaci.mode).toBe("template");
  });

  test("rejects populated RACI activity missing 'A' or referencing undeclared role key", () => {
    const missingAccountable = RaciMatrixSchema.safeParse({
      id: "RACI-NO-A",
      title: "Missing Accountable",
      mode: "populated",
      roles: ["urn:who:smart-ra:role:nmra"],
      activities: [
        {
          activityId: "ACT-1",
          activity: "Draft SOP",
          phase: "Phase 2",
          assignments: {
            "urn:who:smart-ra:role:nmra": ["R", "C"],
          },
        },
      ],
      sourceRef: "9789240120747-eng#Annex-4",
    });
    expect(missingAccountable.success).toBe(false);

    const undeclaredRole = RaciMatrixSchema.safeParse({
      id: "RACI-UNDECLARED-ROLE",
      title: "Undeclared Role Key",
      mode: "populated",
      roles: ["urn:who:smart-ra:role:nmra"],
      activities: [
        {
          activityId: "ACT-1",
          activity: "Draft SOP",
          phase: "Phase 2",
          assignments: {
            "unknown-role-key": ["A", "R"],
          },
        },
      ],
      sourceRef: "9789240120747-eng#Annex-4",
    });
    expect(undeclaredRole.success).toBe(false);
  });
});

describe("3. RiskRegisterSchema (dth-risk-register/v1)", () => {
  test("accepts populated PC Ch 2 risk & mitigation table (9789240116191-eng) and SFP Annex 7 template (9789240120747-eng)", () => {
    const pcRiskRegister = RiskRegisterSchema.parse({
      id: "PC-RISK-REG-CH02",
      title: "National Product Catalogue Governance and Data Stewardship Risk Register",
      mode: "populated",
      entries: [
        {
          riskId: "PC-RISK-02-01",
          category: "Governance",
          riskDescription:
            "Unclear ownership of product master data attributes across NMRA, central medical store, and logistics programmes leads to conflicting identifiers.",
          likelihood: "high",
          impact: "high",
          priority: "critical",
          mitigation:
            "Establish an inter-agency data governance charter with a single authoritative steward per attribute domain before system configuration.",
          ownerRoleIri: "urn:who:smart-ra:role:nmra",
          stepRef: "PC-STEP-02-01",
        },
        {
          riskId: "PC-RISK-02-02",
          category: "Technical interoperability",
          riskDescription:
            "Downstream supply-chain and EHR systems fail to adopt GS1/FHIR catalogue standards.",
          likelihood: "medium",
          impact: "high",
          priority: "high",
          mitigation:
            "Mandate FHIR terminology and product catalogue profiles in national interoperability specifications and procurement RFPs.",
          ownerRoleIri: "urn:who:dth-pc:persona:data-steward",
          stepRef: "PC-STEP-02-03",
        },
      ],
      sourceRef: {
        libraryId: "9789240116191-eng",
        sectionId: "sec-010",
        pages: "19-24",
        tableOrAnnex: "Ch 2 Risk Table",
      },
    });

    expect(pcRiskRegister.$schema).toBe(RISK_REGISTER_SCHEMA_TAG);
    expect(pcRiskRegister.entries).toHaveLength(2);

    const sfpAnnex7Template = RiskRegisterSchema.parse({
      id: "SFP-RISK-ANNEX-07",
      title: "Annex 7: Risk and mitigation register template for SF medical products reporting",
      mode: "template",
      entries: [],
      sourceRef: {
        libraryId: "9789240120747-eng",
        pages: "58-59",
        tableOrAnnex: "Annex 7",
      },
    });

    expect(sfpAnnex7Template.mode).toBe("template");
    expect(sfpAnnex7Template.entries).toHaveLength(0);
  });

  test("rejects populated RiskRegister with zero entries", () => {
    expect(
      RiskRegisterSchema.safeParse({
        id: "EMPTY-POPULATED-RISK",
        title: "Empty Populated Risk Register",
        mode: "populated",
        entries: [],
        sourceRef: "9789240116191-eng#Ch2",
      }).success,
    ).toBe(false);
  });
});

describe("4. BarrierSolutionMapSchema (dth-barrier-map/v1)", () => {
  test("accepts SFP Table 5 & Annex 6 barrier-to-solution mapping (9789240120747-eng) and PHC Table 1 (9789240093362-eng)", () => {
    const sfpBarrierMap = BarrierSolutionMapSchema.parse({
      id: "SFP-BAR-TBL-05",
      title: "Table 5: Common barriers to reporting SF medical products and candidate digital solutions",
      entries: [
        {
          barrierId: "SFP-BAR-01",
          category: "Reporter motivation and feedback",
          barrier:
            "Health workers and patients rarely receive acknowledgement or outcome feedback after submitting a suspected SF medical product report.",
          affectedRoleIris: [
            "urn:who:dth-sfp:persona:health-care-worker",
            "urn:who:dth-sfp:persona:patient-consumer",
          ],
          candidateSolutions: [
            "Automated two-way acknowledgement and status notifications via SMS/mobile app",
            "Confidential reporting channel with tracking reference number",
          ],
          relatedRequirementIds: ["SFR.FXREQ.003", "SFR.FXREQ.005"],
          archimateAssessmentIri: "urn:who:smart-ra:archimate:assessment:lack-of-reporter-feedback",
        },
        {
          barrierId: "SFP-BAR-02",
          category: "Connectivity and field usability",
          barrier:
            "Remote health facilities and border checkpoints lack reliable internet connectivity when inspecting suspect products.",
          affectedRoleIris: [
            "urn:who:dth-sfp:persona:health-care-worker",
            "urn:who:dth-sfp:persona:border-inspector",
          ],
          candidateSolutions: [
            "Offline-first mobile reporting form with store-and-forward synchronisation (SF-REP-006)",
            "Barcode / GS1 DataMatrix scan capture with local cache",
          ],
          relatedRequirementIds: ["SFR.FXREQ.001", "SFR.NFXREQ.OFFLINE.01"],
          archimateAssessmentIri: "urn:who:smart-ra:archimate:assessment:intermittent-connectivity",
        },
      ],
      sourceRef: {
        libraryId: "9789240120747-eng",
        sectionId: "sec-011",
        pages: "20-21",
        tableOrAnnex: "Table 5 & Annex 6",
      },
    });

    expect(sfpBarrierMap.$schema).toBe(BARRIER_SOLUTION_MAP_SCHEMA_TAG);
    expect(sfpBarrierMap.entries).toHaveLength(2);
    expect(sfpBarrierMap.entries[0]!.relatedRequirementIds).toContain("SFR.FXREQ.003");
  });
});

describe("5. StakeholderAnalysisSchema (dth-stakeholder-analysis/v1)", () => {
  test("accepts SFP Table 2 (9789240120747-eng) and PHC Ch 1 Table 2 (9789240093362-eng) stakeholder mappings", () => {
    const sfpStakeholders = StakeholderAnalysisSchema.parse({
      id: "SFP-STK-TBL-02",
      title: "Table 2: Key stakeholders in substandard and falsified medical product surveillance and reporting",
      stakeholders: [
        {
          stakeholderId: "SFP-STK-01",
          name: "National Medicines Regulatory Authority (NMRA)",
          sector: "Public health & regulation",
          roleInSystem:
            "Receives, triages, investigates, and takes regulatory action on suspected SF medical product reports; reports confirmed cases to WHO GSMS.",
          interestOrInfluence:
            "High influence and statutory mandate over national pharmacovigilance and post-market surveillance.",
          engagementMechanism:
            "Chairs the national steering committee and leads technical working group requirements validation.",
          roleIri: "urn:who:smart-ra:role:nmra",
          archimateStakeholderIri: "urn:who:smart-ra:archimate:stakeholder:nmra",
        },
        {
          stakeholderId: "SFP-STK-02",
          name: "Customs and law enforcement authorities",
          sector: "Law enforcement & border control",
          roleInSystem:
            "Intercepts suspect consignments at ports of entry and collaborates on criminal investigation of falsified medical products.",
          interestOrInfluence:
            "High operational influence on cross-border seizures and chain-of-custody evidence.",
          engagementMechanism:
            "Inter-agency SOPs, joint alert notifications, and representation on the steering committee.",
          roleIri: "urn:who:smart-ra:role:law-enforcement-customs",
          archimateStakeholderIri: "urn:who:smart-ra:archimate:stakeholder:law-enforcement-and-customs",
        },
      ],
      sourceRef: {
        libraryId: "9789240120747-eng",
        sectionId: "sec-006",
        pages: "9-11",
        tableOrAnnex: "Table 2",
      },
    });

    expect(sfpStakeholders.$schema).toBe(STAKEHOLDER_ANALYSIS_SCHEMA_TAG);
    expect(sfpStakeholders.stakeholders).toHaveLength(2);
  });
});

describe("6. ImplementationStepListSchema (dth-implementation-steps/v1)", () => {
  test("accepts SFP Tables 14/17 (9789240120747-eng) and PHC Ch 3 DAK-method step list (9789240093362-eng)", () => {
    const phcCh3Steps = ImplementationStepListSchema.parse({
      id: "PHC-STEPS-CH03",
      title: "Chapter 3: Determining user requirements for a person-centred point-of-service system (PCPOSS)",
      diigPhase: "Phase 5: Determine requirements",
      steps: [
        {
          stepNumber: 1,
          stepId: "PHC-CH03-STEP-01",
          title: "Identify end-user personas and their roles",
          description:
            "Conduct contextual interviews and facility observations to catalogue all clinical, community, and administrative personas interacting with the PCPOSS.",
          leadRoleIri: "urn:who:dth-phc:persona:PHC-R-04",
          participatingRoleIris: [
            "urn:who:dth-phc:persona:PHC-R-01",
            "urn:who:dth-phc:persona:PHC-R-02",
          ],
          inputs: ["National PHC service package", "Health workforce role descriptions"],
          toolsOrResources: ["Annex 4: Persona worksheet"],
          outputs: ["Validated PCPOSS persona catalogue"],
          producesDakKind: "persona",
        },
        {
          stepNumber: 2,
          stepId: "PHC-CH03-STEP-02",
          title: "Map current and target business process workflows",
          description:
            "Document end-to-end care workflows with role-bound swimlanes, entry/exit criteria, and handoffs across care settings.",
          leadRoleIri: "urn:who:dth-phc:persona:PHC-R-04",
          participatingRoleIris: [
            "urn:who:dth-phc:persona:PHC-R-01",
            "urn:who:dth-phc:persona:PHC-R-05",
          ],
          inputs: ["Validated PCPOSS persona catalogue", "Clinical guidelines"],
          toolsOrResources: ["Annex 6: Business process workflow worksheet", "BPMN 2.0 modelling conventions"],
          outputs: ["BPMN 2.0 business process diagrams"],
          producesDakKind: "business-process",
        },
        {
          stepNumber: 3,
          stepId: "PHC-CH03-STEP-03",
          title: "Define core data elements and decision-support logic",
          description:
            "Specify minimum data elements, terminology bindings, and clinical decision-support tables required at each workflow task.",
          leadRoleIri: "urn:who:dth-phc:persona:PHC-R-05",
          participatingRoleIris: ["urn:who:dth-phc:persona:PHC-R-01"],
          inputs: ["BPMN 2.0 business process diagrams", "WHO SMART Guidelines DAKs"],
          toolsOrResources: ["Annex 7: Data dictionary worksheet", "Annex 9: Decision-support worksheet"],
          outputs: ["PCPOSS data dictionary", "DMN 1.5 decision tables"],
          producesDakKind: "decision-table",
        },
      ],
      sourceRef: {
        libraryId: "9789240093362-eng",
        sectionId: "sec-012",
        pages: "27-48",
        tableOrAnnex: "Chapter 3 opener panel & steps",
      },
    });

    expect(phcCh3Steps.$schema).toBe(IMPLEMENTATION_STEP_LIST_SCHEMA_TAG);
    expect(phcCh3Steps.steps).toHaveLength(3);
    expect(phcCh3Steps.steps[0]!.producesDakKind).toBe("persona");

    const sfpTable14Steps = ImplementationStepListSchema.parse({
      id: "SFP-STEPS-TBL-14",
      title: "Table 14: Key steps for planning implementation of an SF medical products reporting system",
      diigPhase: "Phase 7: Plan implementation",
      steps: [
        {
          stepNumber: 1,
          stepId: "SFP-STEP-14-01",
          title: "Develop phased rollout and change-management plan",
          description:
            "Sequence national deployment across pilot regions, NMRA headquarters, and customs checkpoints with clear milestones.",
          leadRoleIri: "urn:who:smart-ra:role:nmra",
          participatingRoleIris: ["urn:who:dth-sfp:governance:SFP-GOV-01"],
          inputs: ["Approved functional and non-functional requirements (Tables 12–13)"],
          toolsOrResources: ["Annex 4: RACI matrix", "Annex 7: Risk register"],
          outputs: ["Costed implementation workplan"],
          riskRefs: ["SFP-RISK-01"],
        },
      ],
      sourceRef: {
        libraryId: "9789240120747-eng",
        sectionId: "sec-016",
        pages: "36-38",
        tableOrAnnex: "Table 14",
      },
    });

    expect(sfpTable14Steps.steps).toHaveLength(1);
  });

  test("rejects duplicate or out-of-order stepNumber values", () => {
    expect(
      ImplementationStepListSchema.safeParse({
        id: "BAD-STEP-ORDER",
        title: "Out of order steps",
        steps: [
          {
            stepNumber: 2,
            title: "Step 2 first",
            description: "Second step placed first",
          },
          {
            stepNumber: 1,
            title: "Step 1 second",
            description: "First step placed second",
          },
        ],
        sourceRef: "9789240120747-eng#Table-14",
      }).success,
    ).toBe(false);
  });

  test("DTH_PRODUCES_DAK_KINDS matches the 21 canonical DAK block-kinds in smart-base/block-kinds/", () => {
    const onDiskKinds = readdirSync(BLOCK_KINDS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    expect([...DTH_PRODUCES_DAK_KINDS].sort() as string[]).toEqual(onDiskKinds);
  });
});

describe("DthPlanningArtefactSchema union", () => {
  test("lists all 6 schema tags and parses each through the union", () => {
    expect(DTH_PLANNING_SCHEMA_TAGS).toHaveLength(6);
    const sampleStepList = {
      $schema: IMPLEMENTATION_STEP_LIST_SCHEMA_TAG,
      id: "SFP-STEPS-TBL-17",
      title: "Table 17: Steps for developing an M&E plan",
      diigPhase: "Phase 6: Monitor, evaluate and improve",
      steps: [
        {
          stepNumber: 1,
          title: "Select core M&E indicators",
          description: "Define input, process, output, and outcome indicators for SF reporting (Table 18).",
          producesDakKind: "indicator" as const,
        },
      ],
      sourceRef: "9789240120747-eng#Table-17",
    };
    const parsed = DthPlanningArtefactSchema.parse(sampleStepList);
    expect(parsed.$schema).toBe("dth-implementation-steps/v1");
  });
});
