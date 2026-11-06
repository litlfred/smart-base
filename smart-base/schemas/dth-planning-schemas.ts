/**
 * Proposed WHO Digital Transformation Handbook (DTH) governance and planning
 * schemas (`litlfred/dth-sfp#1` Step P6d, `litlfred/dth-phc#1` Step P4b, and
 * `litlfred/smart-base#242`).
 *
 * ## Why these six schemas exist
 *
 * Across the five WHO Digital Transformation Handbooks — `dth-hrh`
 * (`9789240095687-eng`), `dth-phc` (`9789240093362-eng`), `dth-sc`
 * (`9789240089600-eng`), `dth-pc` (`9789240116191-eng`), and `dth-sfp`
 * (`9789240120747-eng`) — clinical and operational user personas, user
 * scenarios, business processes, core data elements, decision logic,
 * functional/non-functional requirements, and indicators map directly onto the
 * existing WHO SMART Guidelines DAK block kinds in `smart-base/block-kinds/`.
 *
 * However, six recurring governance, stakeholder, barrier-mapping, and
 * implementation-planning table structures appear across the DTH corpus and
 * have no fitting DAK logical model:
 *
 * 1. {@link GovernanceRoleSchema} (`dth-governance-role/v1`) — Organisational
 *    governance bodies and leadership roles (steering committee, technical
 *    working group, advisory council, project champion, coordinator,
 *    regulator). Covers SFP §2.3 and PHC Ch 1 §1.1.2.
 * 2. {@link RaciMatrixSchema} (`dth-raci-matrix/v1`) — Responsibility
 *    assignment matrices mapping activities and DIIG phases to role IRIs with
 *    `R | A | C | I` codes, distinguishing populated matrices (requiring at
 *    least one `"A"` per activity) from blank worksheet templates. Covers SFP
 *    Annex 4, PHC Annex 2, and HRH Ch 3.
 * 3. {@link RiskRegisterSchema} (`dth-risk-register/v1`) — Risk and mitigation
 *    registers supporting both populated risk tables and blank annex templates.
 *    Covers SFP Annex 7, PC Ch 1–5 risk tables, and PHC Ch 1–5.
 * 4. {@link BarrierSolutionMapSchema} (`dth-barrier-map/v1`) — Mappings from
 *    system/reporting barriers to affected roles, candidate digital/policy
 *    solutions, functional requirements, and ArchiMate Motivation assessments.
 *    Covers SFP Table 5 & Annex 6 and PHC Table 1.
 * 5. {@link StakeholderAnalysisSchema} (`dth-stakeholder-analysis/v1`) —
 *    Stakeholder analysis tables linking multi-sectoral stakeholders to their
 *    system role, interest/influence, engagement mechanism, and `smart-ra`
 *    ArchiMate stakeholder/role IRIs. Covers SFP Table 2 and PHC Ch 1 Table 2.
 * 6. {@link ImplementationStepListSchema} (`dth-implementation-steps/v1`) —
 *    Sequenced implementation and M&E planning step tables (unified with
 *    `dth-hrh` planning steps and PHC phase opener panels) with role-bound
 *    inputs, tools/resources, outputs, and optional `producesDakKind` pointers.
 *    Covers SFP Tables 14, 15, 17, PHC Ch 1–6 phase panels, and SC Ch 1–3.
 *
 * See the companion architect-committee proposal at
 * `docs/proposals/dth-planning-schemas-2026-10-31.md`.
 *
 * @module smart-base/schemas/dth-planning-schemas
 * @graphNode schema
 */

import { z } from "zod";

// ── Shared Citation & IRI Helpers ────────────────────────────────────────────

/**
 * Structured L1 source reference anchoring a DTH planning artefact or row to
 * an ingested WHO publication in `who-iris/library/<isbn>-eng`.
 */
export const DthStructuredSourceRefSchema = z.object({
  /** Publication identifier in `who-iris/library/`, e.g. `"9789240120747-eng"`. */
  libraryId: z.string().min(1),
  /** Section identifier in the ingested L1 entry, e.g. `"sec-008"`. */
  sectionId: z.string().min(1).optional(),
  /** Printed page range in the source handbook, e.g. `"14-17"`. */
  pages: z.string().min(1).optional(),
  /** Table, figure, section, or annex label, e.g. `"Table 5"` or `"Annex 4"`. */
  tableOrAnnex: z.string().min(1).optional(),
  /** Optional verbatim quote from the L1 source passage. */
  quote: z.string().min(1).optional(),
});

export type DthStructuredSourceRef = z.infer<typeof DthStructuredSourceRefSchema>;

/**
 * Source reference anchoring a DTH planning artefact or entry to its L1
 * handbook passage — either a compact locator string (such as
 * `"9789240120747-eng#Table-5"`) or a structured {@link DthStructuredSourceRef}.
 */
export const DthSourceRefSchema = z.union([
  z.string().min(1),
  DthStructuredSourceRefSchema,
]);

export type DthSourceRef = z.infer<typeof DthSourceRefSchema>;

/**
 * Non-empty IRI or CURIE string referencing a persona, governance role, or
 * `smart-ra` ArchiMate element (never free text without an identifier).
 */
export const RoleOrElementIriSchema = z
  .string()
  .min(1)
  .refine((val) => /^[a-zA-Z][a-zA-Z0-9+.-]*:\S+$/.test(val), {
    message: "Expected a valid IRI or CURIE (e.g. 'urn:who:smart-ra:role:nmra' or 'smart-ra:role/nmra')",
  });

// ── 1. GovernanceRoleSchema (dth-governance-role/v1) ─────────────────────────

/** Schema tag for {@link GovernanceRoleSchema}. */
export const GOVERNANCE_ROLE_SCHEMA_TAG = "dth-governance-role/v1" as const;

/**
 * Permitted governance body or leadership role classifications in DTH
 * handbooks (distinct from clinical/operational DAK user personas).
 */
export const GOVERNANCE_ROLE_TYPES = [
  "steering-committee",
  "technical-working-group",
  "advisory-council",
  "project-champion",
  "coordinator",
  "regulator",
] as const;

export type GovernanceRoleType = (typeof GOVERNANCE_ROLE_TYPES)[number];

/** Zod enum for {@link GOVERNANCE_ROLE_TYPES}. */
export const GovernanceRoleTypeSchema = z.enum(GOVERNANCE_ROLE_TYPES);

/**
 * Organisational governance body or leadership role (`dth-governance-role/v1`).
 *
 * Models multi-stakeholder governance structures such as steering committees,
 * technical working groups (TWGs), advisory councils, project champions,
 * coordinators, and regulatory authorities that oversee digital health
 * transformation but are not clinical/operational end-user DAK personas.
 *
 * Covers:
 * - `dth-sfp` (`9789240120747-eng`) §2.3 governance bodies and NMRA regulatory oversight
 * - `dth-phc` (`9789240093362-eng`) Ch 1 §1.1.2 governance & coordination bodies
 * - `dth-hrh` (`9789240095687-eng`) Ch 1–2 HRIS steering committee and TWG
 */
export const GovernanceRoleSchema = z.object({
  $schema: z.literal(GOVERNANCE_ROLE_SCHEMA_TAG).default(GOVERNANCE_ROLE_SCHEMA_TAG),
  /** Stable identifier for the governance role or body (e.g. `"SFP-GOV-01"`). */
  id: z.string().min(1),
  /** Human-readable name of the governance body or leadership role. */
  name: z.string().min(1),
  /** Classification of the governance body or leadership role. */
  roleType: GovernanceRoleTypeSchema,
  /** Mandate, terms of reference, or core responsibility statement. */
  mandate: z.string().min(1),
  /** IRI of the chairing or leading role/actor. */
  chairOrLeadRoleIri: RoleOrElementIriSchema,
  /** IRIs of constituent member roles or stakeholder organisations. */
  memberRoleIris: z.array(RoleOrElementIriSchema).min(1),
  /** Stated meeting cadence or review frequency (e.g. `"Quarterly"`, `"Monthly during rollout"`). */
  meetingCadence: z.string().min(1),
  /** Explicit decision rights or approval authorities held by this body/role. */
  decisionRights: z.array(z.string().min(1)).min(1),
  /** Link to the corresponding `smart-ra` ArchiMate Business Role, Actor, or Collaboration IRI. */
  archimateElementIri: RoleOrElementIriSchema,
  /** L1 handbook citation from which this governance role was extracted. */
  sourceRef: DthSourceRefSchema,
});

export type GovernanceRole = z.infer<typeof GovernanceRoleSchema>;
export type GovernanceRoleInput = z.input<typeof GovernanceRoleSchema>;

// ── 2. RaciMatrixSchema (dth-raci-matrix/v1) ─────────────────────────────────

/** Schema tag for {@link RaciMatrixSchema}. */
export const RACI_MATRIX_SCHEMA_TAG = "dth-raci-matrix/v1" as const;

/** Standard RACI responsibility assignment codes. */
export const RACI_CODES = ["R", "A", "C", "I"] as const;

export type RaciCode = (typeof RACI_CODES)[number];

/** Zod enum for {@link RACI_CODES}. */
export const RaciCodeSchema = z.enum(RACI_CODES);

/**
 * Role column declaration in a RACI matrix, binding a short column key
 * (`roleId`) to a formal persona or governance-role IRI (`roleIri`).
 */
export const RaciRoleColumnSchema = z.object({
  /** Short role key used as a key in `activity.assignments` (e.g. `"nmra-lead"`). */
  roleId: z.string().min(1),
  /** Display label for the role column header. */
  label: z.string().min(1).optional(),
  /** Formal persona or governance-role IRI. */
  roleIri: RoleOrElementIriSchema,
});

export type RaciRoleColumn = z.infer<typeof RaciRoleColumnSchema>;

/**
 * Role entry in `RaciMatrix.roles[]`: either a structured {@link RaciRoleColumn}
 * or a direct persona/governance-role IRI string.
 */
export const RaciRoleRefSchema = z.union([
  RoleOrElementIriSchema,
  RaciRoleColumnSchema,
]);

export type RaciRoleRef = z.infer<typeof RaciRoleRefSchema>;

/**
 * Single activity row in a {@link RaciMatrixSchema}.
 */
export const RaciActivitySchema = z.object({
  /** Stable identifier for the activity row (e.g. `"SFP-RACI-ACT-01"`). */
  activityId: z.string().min(1),
  /** Description of the activity, deliverable, or decision task. */
  activity: z.string().min(1),
  /** Implementation or DIIG phase name/number (e.g. `"Phase 1: Assess current state"`). */
  phase: z.string().min(1),
  /**
   * Map from `roleId` (or role IRI) to one or more RACI codes (`"R"`, `"A"`,
   * `"C"`, `"I"`).
   */
  assignments: z.record(z.string().min(1), z.array(RaciCodeSchema)),
});

export type RaciActivity = z.infer<typeof RaciActivitySchema>;

/**
 * Responsibility assignment (RACI) matrix (`dth-raci-matrix/v1`).
 *
 * Supports two modes:
 * - `"populated"` (default): every activity row must assign `"A"` (Accountable)
 *   to at least one declared role, and every assignment key must reference a
 *   declared role in `roles[]`.
 * - `"template"`: represents a blank or illustrative worksheet annex (such as
 *   SFP Annex 4 or PHC Annex 2) where country teams populate assignments during
 *   national adaptation; unassigned `"A"` rows are permitted, while any present
 *   assignment keys must still reference declared `roles[]`.
 *
 * Covers:
 * - `dth-sfp` (`9789240120747-eng`) Annex 4 RACI matrix template & §2.3
 * - `dth-phc` (`9789240093362-eng`) Annex 2 RACI matrix worksheet
 * - `dth-hrh` (`9789240095687-eng`) Ch 3 governance & RACI tables
 */
export const RaciMatrixSchema = z
  .object({
    $schema: z.literal(RACI_MATRIX_SCHEMA_TAG).default(RACI_MATRIX_SCHEMA_TAG),
    /** Stable identifier for the RACI matrix (e.g. `"SFP-RACI-ANNEX-04"`). */
    id: z.string().min(1),
    /** Human-readable title of the RACI matrix. */
    title: z.string().min(1),
    /**
     * Whether this matrix is fully populated (`"populated"`) or a blank/partial
     * worksheet template (`"template"`).
     */
    mode: z.enum(["template", "populated"]).default("populated"),
    /** Declared roles (persona IRIs or governance-role IRIs) participating in the matrix. */
    roles: z.array(RaciRoleRefSchema).min(1),
    /** Sequenced activities with per-role RACI assignments. */
    activities: z.array(RaciActivitySchema).min(1),
    /** L1 handbook citation for the RACI matrix. */
    sourceRef: DthSourceRefSchema,
  })
  .superRefine((matrix, ctx) => {
    const validRoleKeys = new Set<string>();
    for (const r of matrix.roles) {
      if (typeof r === "string") {
        validRoleKeys.add(r);
      } else {
        validRoleKeys.add(r.roleId);
        validRoleKeys.add(r.roleIri);
      }
    }

    matrix.activities.forEach((act, idx) => {
      for (const roleKey of Object.keys(act.assignments)) {
        if (!validRoleKeys.has(roleKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["activities", idx, "assignments", roleKey],
            message: `Assignment key "${roleKey}" in activity "${act.activityId}" is not declared in roles[]`,
          });
        }
      }

      if (matrix.mode === "populated") {
        const hasAccountable = Object.values(act.assignments).some((codes) =>
          codes.includes("A"),
        );
        if (!hasAccountable) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["activities", idx, "assignments"],
            message: `Populated RACI activity "${act.activityId}" must assign at least one Accountable ("A") role`,
          });
        }
      }
    });
  });

export type RaciMatrix = z.infer<typeof RaciMatrixSchema>;
export type RaciMatrixInput = z.input<typeof RaciMatrixSchema>;

// ── 3. RiskRegisterSchema (dth-risk-register/v1) ─────────────────────────────

/** Schema tag for {@link RiskRegisterSchema}. */
export const RISK_REGISTER_SCHEMA_TAG = "dth-risk-register/v1" as const;

/** Qualitative likelihood and impact levels in DTH risk registers. */
export const RISK_LEVELS = ["low", "medium", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];
export const RiskLevelSchema = z.enum(RISK_LEVELS);

/** Qualitative risk priority ratings in DTH risk registers. */
export const RISK_PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type RiskPriority = (typeof RISK_PRIORITIES)[number];
export const RiskPrioritySchema = z.enum(RISK_PRIORITIES);

/**
 * Single risk and mitigation row in a {@link RiskRegisterSchema}.
 */
export const RiskEntrySchema = z.object({
  /** Stable identifier for the risk entry (e.g. `"PC-RISK-01"` or `"SFP-RISK-01"`). */
  riskId: z.string().min(1),
  /** Risk category or domain (e.g. `"Governance"`, `"Technical"`, `"Operational"`, `"Data privacy"`). */
  category: z.string().min(1),
  /** Description of the risk event and its impact on the digital transformation effort. */
  riskDescription: z.string().min(1),
  /** Qualitative likelihood rating (`"low" | "medium" | "high"`), optional when unstated in L1. */
  likelihood: RiskLevelSchema.optional(),
  /** Qualitative impact rating (`"low" | "medium" | "high"`), optional when unstated in L1. */
  impact: RiskLevelSchema.optional(),
  /** Qualitative overall priority rating (`"low" | "medium" | "high" | "critical"`). */
  priority: RiskPrioritySchema.optional(),
  /** Recommended mitigation strategy or control action. */
  mitigation: z.string().min(1),
  /** Optional persona or governance-role IRI responsible for owning/monitoring this risk. */
  ownerRoleIri: RoleOrElementIriSchema.optional(),
  /** Optional reference to an implementation step ID (`ImplementationStep.stepId` or step number). */
  stepRef: z.string().min(1).optional(),
  /** Optional row-level L1 handbook citation. */
  sourceRef: DthSourceRefSchema.optional(),
});

export type RiskEntry = z.infer<typeof RiskEntrySchema>;

/**
 * Risk and mitigation register (`dth-risk-register/v1`).
 *
 * Supports both `"populated"` registers (such as the chapter risk/mitigation
 * tables in `dth-pc` Ch 1–5 and `dth-phc` Ch 1–5, where at least one risk row
 * is required) and `"template"` registers (such as `dth-sfp` Annex 7's blank
 * risk register worksheet).
 *
 * Covers:
 * - `dth-sfp` (`9789240120747-eng`) Annex 7 risk register template
 * - `dth-pc` (`9789240116191-eng`) Ch 1–5 step risk & mitigation tables
 * - `dth-phc` (`9789240093362-eng`) Ch 1–5 planning risk callouts and Annex worksheets
 */
export const RiskRegisterSchema = z
  .object({
    $schema: z.literal(RISK_REGISTER_SCHEMA_TAG).default(RISK_REGISTER_SCHEMA_TAG),
    /** Stable identifier for the risk register (e.g. `"PC-RISK-REG-CH02"`). */
    id: z.string().min(1),
    /** Human-readable title of the risk register. */
    title: z.string().min(1),
    /** Whether this register is populated with concrete risks or is a worksheet template. */
    mode: z.enum(["template", "populated"]),
    /** Risk and mitigation entries (must be non-empty when `mode === "populated"`). */
    entries: z.array(RiskEntrySchema),
    /** L1 handbook citation for the risk register. */
    sourceRef: DthSourceRefSchema,
  })
  .superRefine((reg, ctx) => {
    if (reg.mode === "populated" && reg.entries.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entries"],
        message: `Populated RiskRegister "${reg.id}" must contain at least one risk entry`,
      });
    }
  });

export type RiskRegister = z.infer<typeof RiskRegisterSchema>;
export type RiskRegisterInput = z.input<typeof RiskRegisterSchema>;

// ── 4. BarrierSolutionMapSchema (dth-barrier-map/v1) ─────────────────────────

/** Schema tag for {@link BarrierSolutionMapSchema}. */
export const BARRIER_SOLUTION_MAP_SCHEMA_TAG = "dth-barrier-map/v1" as const;

/**
 * Single barrier-to-candidate-solution entry in a {@link BarrierSolutionMapSchema}.
 */
export const BarrierSolutionEntrySchema = z.object({
  /** Stable identifier for the barrier entry (e.g. `"SFP-BAR-01"` or `"PHC-BAR-01"`). */
  barrierId: z.string().min(1),
  /** Barrier category (e.g. `"Awareness and reporting culture"`, `"Connectivity"`, `"Feedback loop"`). */
  category: z.string().min(1),
  /** Statement of the barrier or root cause identified in the handbook. */
  barrier: z.string().min(1),
  /** Persona or governance-role IRIs affected by this barrier. */
  affectedRoleIris: z.array(RoleOrElementIriSchema).min(1),
  /** Candidate digital or operational solutions addressing this barrier. */
  candidateSolutions: z.array(z.string().min(1)).min(1),
  /** Identifiers of functional or non-functional requirements that realise the candidate solutions. */
  relatedRequirementIds: z.array(z.string().min(1)).default([]),
  /** Optional `smart-ra` ArchiMate Motivation `Assessment` or `Driver` element IRI. */
  archimateAssessmentIri: RoleOrElementIriSchema.optional(),
  /** Optional row-level L1 handbook citation. */
  sourceRef: DthSourceRefSchema.optional(),
});

export type BarrierSolutionEntry = z.infer<typeof BarrierSolutionEntrySchema>;

/**
 * Barrier-to-candidate-solution mapping (`dth-barrier-map/v1`).
 *
 * Captures the structured causal link between health-system / reporting
 * barriers, the roles affected, the candidate digital interventions proposed by
 * the handbook, the system requirements (`functional-requirement` /
 * `non-functional-requirement`) that trace to them, and the ArchiMate
 * Motivation `Assessment` element in `smart-ra`.
 *
 * Covers:
 * - `dth-sfp` (`9789240120747-eng`) Table 5 (reporting barriers and candidate
 *   solutions) and Annex 6
 * - `dth-phc` (`9789240093362-eng`) Ch 1 Table 1 (challenges in primary health
 *   care point-of-service systems and digital responses)
 */
export const BarrierSolutionMapSchema = z.object({
  $schema: z.literal(BARRIER_SOLUTION_MAP_SCHEMA_TAG).default(BARRIER_SOLUTION_MAP_SCHEMA_TAG),
  /** Stable identifier for the barrier-solution map. */
  id: z.string().min(1),
  /** Human-readable title of the barrier-solution map. */
  title: z.string().min(1),
  /** Barrier-to-candidate-solution mapping entries. */
  entries: z.array(BarrierSolutionEntrySchema).min(1),
  /** L1 handbook citation for the barrier map. */
  sourceRef: DthSourceRefSchema,
});

export type BarrierSolutionMap = z.infer<typeof BarrierSolutionMapSchema>;
export type BarrierSolutionMapInput = z.input<typeof BarrierSolutionMapSchema>;

// ── 5. StakeholderAnalysisSchema (dth-stakeholder-analysis/v1) ───────────────

/** Schema tag for {@link StakeholderAnalysisSchema}. */
export const STAKEHOLDER_ANALYSIS_SCHEMA_TAG = "dth-stakeholder-analysis/v1" as const;

/**
 * Single stakeholder row in a {@link StakeholderAnalysisSchema}.
 */
export const StakeholderEntrySchema = z.object({
  /** Stable identifier for the stakeholder entry (e.g. `"SFP-STK-01"`). */
  stakeholderId: z.string().min(1),
  /** Name of the stakeholder group or institution (e.g. `"National Medicines Regulatory Authority (NMRA)"`). */
  name: z.string().min(1),
  /** Sector classification (e.g. `"Public health & regulation"`, `"Law enforcement & customs"`, `"Supply chain & industry"`, `"Civil society & patients"`). */
  sector: z.string().min(1),
  /** Description of the stakeholder's functional role in the health/regulatory system. */
  roleInSystem: z.string().min(1),
  /** Statement of the stakeholder's interest, motivation, or influence in the digital transformation. */
  interestOrInfluence: z.string().min(1),
  /** Mechanism or channel for engaging this stakeholder across DIIG phases. */
  engagementMechanism: z.string().min(1),
  /** Optional link to a DAK persona or `GovernanceRole` IRI when this stakeholder also acts in a workflow lane or governance body. */
  roleIri: RoleOrElementIriSchema.optional(),
  /** Optional link to the `smart-ra` ArchiMate Motivation `Stakeholder` or Business `Actor`/`Role` IRI. */
  archimateStakeholderIri: RoleOrElementIriSchema.optional(),
  /** Optional row-level L1 handbook citation. */
  sourceRef: DthSourceRefSchema.optional(),
});

export type StakeholderEntry = z.infer<typeof StakeholderEntrySchema>;

/**
 * Multi-sectoral stakeholder mapping and analysis (`dth-stakeholder-analysis/v1`).
 *
 * Captures stakeholder analysis tables that sit upstream of end-user persona
 * selection (DIIG Phase 1), linking institutional and community stakeholder
 * groups to their sector, system role, interest/influence, engagement
 * mechanism, and `smart-ra` ArchiMate Motivation `Stakeholder` element.
 *
 * Covers:
 * - `dth-sfp` (`9789240120747-eng`) Ch 1 Table 2 (stakeholders in SF medical
 *   product reporting and surveillance)
 * - `dth-phc` (`9789240093362-eng`) Ch 1 Table 2 (PCPOSS stakeholder groups
 *   and roles)
 * - `dth-sc` (`9789240089600-eng`) & `dth-pc` (`9789240116191-eng`) stakeholder
 *   mapping tables
 */
export const StakeholderAnalysisSchema = z.object({
  $schema: z.literal(STAKEHOLDER_ANALYSIS_SCHEMA_TAG).default(STAKEHOLDER_ANALYSIS_SCHEMA_TAG),
  /** Stable identifier for the stakeholder analysis table. */
  id: z.string().min(1),
  /** Human-readable title of the stakeholder analysis table. */
  title: z.string().min(1),
  /** Stakeholder mapping rows. */
  stakeholders: z.array(StakeholderEntrySchema).min(1),
  /** L1 handbook citation for the stakeholder analysis table. */
  sourceRef: DthSourceRefSchema,
});

export type StakeholderAnalysis = z.infer<typeof StakeholderAnalysisSchema>;
export type StakeholderAnalysisInput = z.input<typeof StakeholderAnalysisSchema>;

// ── 6. ImplementationStepListSchema (dth-implementation-steps/v1) ────────────

/** Schema tag for {@link ImplementationStepListSchema}. */
export const IMPLEMENTATION_STEP_LIST_SCHEMA_TAG = "dth-implementation-steps/v1" as const;

/**
 * Canonical DAK block kinds in `smart-base/block-kinds/` that an
 * implementation/formalization step can produce as an output (for example,
 * PHC Ch 3 steps producing `persona`, `user-scenario`, `business-process`,
 * `data-element`, `decision-table`, `scheduling-logic`, `indicator`,
 * `functional-requirement`, and `non-functional-requirement`).
 */
export const DTH_PRODUCES_DAK_KINDS = [
  "actor-definition",
  "business-process",
  "cql-library",
  "data-element",
  "decision-table",
  "functional-requirement",
  "health-intervention",
  "indicator",
  "logical-model",
  "measure",
  "non-functional-requirement",
  "persona",
  "plan-definition",
  "profile",
  "questionnaire",
  "scheduling-logic",
  "structure-map",
  "test-case",
  "test-scenario",
  "user-scenario",
  "value-set",
] as const;

export type DthProducesDakKind = (typeof DTH_PRODUCES_DAK_KINDS)[number];

export const DthProducesDakKindSchema = z.enum(DTH_PRODUCES_DAK_KINDS);

/**
 * Single sequenced step in an {@link ImplementationStepListSchema}.
 */
export const ImplementationStepSchema = z.object({
  /** 1-based sequence number of the step within the list. */
  stepNumber: z.number().int().positive(),
  /** Optional stable step identifier (e.g. `"SFP-STEP-05-01"` or `"PHC-CH03-STEP-01"`). */
  stepId: z.string().min(1).optional(),
  /** Short imperative title of the step. */
  title: z.string().min(1),
  /** Narrative description of what the step entails. */
  description: z.string().min(1),
  /** Optional persona or governance-role IRI leading this step. */
  leadRoleIri: RoleOrElementIriSchema.optional(),
  /** Persona or governance-role IRIs participating in this step ("Who should be involved"). */
  participatingRoleIris: z.array(RoleOrElementIriSchema).default([]),
  /** Prerequisite inputs or documents consumed by this step ("Inputs"). */
  inputs: z.array(z.string().min(1)).default([]),
  /** Tools, templates, standards, or resources used during this step ("Tools / Resources"). */
  toolsOrResources: z.array(z.string().min(1)).default([]),
  /** Deliverables or artefacts produced by this step ("Outputs"). */
  outputs: z.array(z.string().min(1)).default([]),
  /** Optional DAK block kind produced by this step (e.g. `"persona"`, `"business-process"`). */
  producesDakKind: DthProducesDakKindSchema.optional(),
  /** Optional references to risk IDs (`RiskEntry.riskId`) associated with this step. */
  riskRefs: z.array(z.string().min(1)).optional(),
  /** Optional step-level L1 handbook citation. */
  sourceRef: DthSourceRefSchema.optional(),
});

export type ImplementationStep = z.infer<typeof ImplementationStepSchema>;

/**
 * Sequenced implementation or M&E planning step list (`dth-implementation-steps/v1`).
 *
 * Unifies the step-table structures across the five WHO DTH handbooks
 * (`smart-base#242` item 2):
 * - `dth-sfp` (`9789240120747-eng`) Tables 14, 15, and 17 (implementation and
 *   M&E planning steps)
 * - `dth-phc` (`9789240093362-eng`) Ch 1–6 "Who should be involved / Inputs /
 *   Outputs" phase panels and Ch 3 DAK-method steps
 * - `dth-pc` (`9789240116191-eng`) Ch 1–5 INPUTS / STEPS / RESOURCES / OUTPUTS
 *   tables
 * - `dth-sc` (`9789240089600-eng`) Ch 1–3 implementation step tables
 * - `dth-hrh` (`9789240095687-eng`) planning step tables
 */
export const ImplementationStepListSchema = z
  .object({
    $schema: z
      .literal(IMPLEMENTATION_STEP_LIST_SCHEMA_TAG)
      .default(IMPLEMENTATION_STEP_LIST_SCHEMA_TAG),
    /** Stable identifier for the step list (e.g. `"SFP-STEPS-TBL-14"`). */
    id: z.string().min(1),
    /** Human-readable title of the step list or phase panel. */
    title: z.string().min(1),
    /** Optional DIIG phase alignment (e.g. `"Phase 5: Determine requirements"` or `"Phase 7: Plan implementation"`). */
    diigPhase: z.string().min(1).optional(),
    /** Ordered sequence of implementation or M&E planning steps. */
    steps: z.array(ImplementationStepSchema).min(1),
    /** L1 handbook citation for the step list. */
    sourceRef: DthSourceRefSchema,
  })
  .superRefine((list, ctx) => {
    const seen = new Set<number>();
    list.steps.forEach((step, idx) => {
      if (seen.has(step.stepNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["steps", idx, "stepNumber"],
          message: `Duplicate stepNumber ${step.stepNumber} in ImplementationStepList "${list.id}"`,
        });
      }
      seen.add(step.stepNumber);
      if (idx > 0 && step.stepNumber <= list.steps[idx - 1]!.stepNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["steps", idx, "stepNumber"],
          message: `steps[] in ImplementationStepList "${list.id}" must be ordered by strictly increasing stepNumber (${step.stepNumber} after ${list.steps[idx - 1]!.stepNumber})`,
        });
      }
    });
  });

export type ImplementationStepList = z.infer<typeof ImplementationStepListSchema>;
export type ImplementationStepListInput = z.input<typeof ImplementationStepListSchema>;

// ── Discriminated Union of All 6 DTH Planning Schemas ────────────────────────

/** All six DTH governance and planning `$schema` tags. */
export const DTH_PLANNING_SCHEMA_TAGS = [
  GOVERNANCE_ROLE_SCHEMA_TAG,
  RACI_MATRIX_SCHEMA_TAG,
  RISK_REGISTER_SCHEMA_TAG,
  BARRIER_SOLUTION_MAP_SCHEMA_TAG,
  STAKEHOLDER_ANALYSIS_SCHEMA_TAG,
  IMPLEMENTATION_STEP_LIST_SCHEMA_TAG,
] as const;

export type DthPlanningSchemaTag = (typeof DTH_PLANNING_SCHEMA_TAGS)[number];

/**
 * Union of all six proposed DTH governance and planning artefacts.
 */
export const DthPlanningArtefactSchema = z.union([
  GovernanceRoleSchema,
  RaciMatrixSchema,
  RiskRegisterSchema,
  BarrierSolutionMapSchema,
  StakeholderAnalysisSchema,
  ImplementationStepListSchema,
]);

export type DthPlanningArtefact = z.infer<typeof DthPlanningArtefactSchema>;
