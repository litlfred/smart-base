### Authoring Process

The SMART Guidelines authoring lifecycle encompasses DAK development, L3 FHIR authoring, quality control, translation, and publication. This process is defined as a BPMN 2.0 collaboration diagram with swimlanes for each [authoring persona](authoring-personas.html).

The process is based on the [WHO SMART IG Starter Kit](https://smart.who.int/ig-starter-kit/) guidance.

#### End to End: From Use Case to Application

The phases below describe *who* does the work. This section describes the
order of the work, from a use case to a running application. It is the same
for a new guideline and for a jurisdiction's adaptation of an existing one.

| # | Stage | Builds on | Produces | Adjudicated by |
|---|---|---|---|---|
| 0 | Describe the use case | — | population, setting, jurisdiction, interventions in scope | (requester) |
| 1 | Identify existing L1 guidelines and recommendations relevant to the use case | WHO guidelines, the jurisdiction's own guidelines | candidate L1 sources | Clinical SME |
| 2 | Ingest any source not yet in a knowledge graph (KG) | the L1 sources | structured KG assets at the generic-document level and the L1 level (recommendations, remarks, practices) | L1 extraction reviewer, Clinical SME |
| 3 | Choose the existing L2 DAKs to build on | the L1 KG; WHO DAKs and the jurisdiction's adapted DAKs | dependency list: reuse / adapt / extend / reject, with reasons | Programme Manager, Business Analyst |
| 4 | Create or adapt the L2 DAK assets ([Phase 2a](#phase-2a-l2-dak-authoring-business-analyst-iterative)) | the L1 KG; the chosen DAKs | DAK components | per asset (see below) |
| 5 | Choose the existing L3 FHIR IGs to build on | the L1 KG, the L2 assets; WHO IGs and the jurisdiction's IGs | dependency list: reuse / adapt / extend / reject, with reasons | FHIR Modeller, Terminologist |
| 6 | Produce the L3 assets from the L2 assets ([Phase 2b](#phase-2b-l3-fhir-authoring-fhir-modeller)) | the L2 assets; the chosen IGs | FHIR IG | per asset (see below) |
| 7 | Describe the consuming application | the L2 personas and processes | application brief | (requester) |
| 8 | Wireframe, then build the consuming application | the application brief; the L3 IG (a clean build, not a publication) | wireframes (web and mobile); the application, with conformance tests | Requester, Business Analyst, Clinical SME, FHIR Modeller |

**Adjudication is quality assurance, not a gate.** Every stage is adjudicated
by a person, but the next stage does not wait for it: once the L2 assets
exist, the L3 assets can be produced while the L2 assets are still under
review. In practice:

- an asset built on input that is still being adjudicated records that in
  its provenance;
- a rejection reopens the stage, and the assets derived from the rejected item
  are re-derived;
- the guideline is complete only when every adjudication is recorded.

Each stage's work is staged as a preview before it is reviewed, so every
review item links to the **current** (main) and the **staged** version of the
page it changes. A reviewer approves an item, requests changes (optionally
writing the change themselves), or rejects it.

**Each created or changed asset gets its own review**, shown the way its
reviewer reads it: a rendered BPMN diagram, a decision table beside the
recommendation it cites, data-dictionary rows with a **wireframe** of the
form that captures them, a Questionnaire beside the wireframe it was built
from, a profile's
differential. An **adapted** asset is reviewed as **before and after**: the
upstream asset beside the adapted one, with the change and the
recommendation or local policy behind it. A reused asset that was not changed
needs no new review.

**Forms are designed at L2, as wireframes.** For each step where a persona
records data, two or more wireframe designs (web and mobile, filled with the
real data elements) are drawn from the persona, the user scenario and the
core data elements, and one is chosen in review. The L3 Questionnaire is then
built from the chosen wireframe, field by field, and checked against it.

**Dependency choices are adjudicated too.** Stages 3 and 5 decide what the
guideline inherits. Each candidate DAK or IG is recorded with its evidence in
the L1 KG and a decision: reuse, adapt, extend or reject. Where a
jurisdiction's adaptation covers the same scope, it is preferred over the WHO
original, and the WHO original is recorded as its upstream.

#### Lifecycle Overview

```
Phase 1          Phase 2a         Phase 2b        Phase 3       Phase 4
PLANNING    →    L2 DAK      →    L3 FHIR    →    QUALITY   →   PUBLICATION
                 AUTHORING        AUTHORING       CONTROL
Programme        Business         FHIR            QC            Publication
Manager          Analyst          Modeller        Reviewer      Manager
                 Clinical SME     Terminologist   Translator
                 Technical Officer
```

#### Phase 1: Planning (Programme Manager)

1. **Scoping** — Define DAK purpose, target audience, and gaps
2. **Form team** — Assemble DAK development team (<10 people), define RASCI matrix
3. **Establish process** — Select Agile/Scrum methodology and project tooling
4. **Gather source documents** — Collect WHO guidelines, registers, policy documents
5. **Plan timeline** — Draft project roadmap, create backlog, set sprint cadence
6. **Plan consultations** — Schedule SME consultation format and frequency
7. **Assign work** — Begin sprint cycle

#### Phase 2a: L2 DAK Authoring (Business Analyst, iterative)

The L2 authoring follows an iterative sprint cycle of **Fill → Validate → Incorporate**:

1. **Review L1 source documents** for current sprint scope
2. **Identify health interventions and recommendations** (Component 1)
3. **Author generic personas** (Component 2)
4. **Author user scenarios** (Component 3)
5. **Author BPMN business processes** (Component 4)
6. **For each business process:**
   - Draft detailed workflow annotations
   - Define core data elements (Component 5)
   - Develop decision-support logic (Component 6)
   - Develop scheduling logic (Component 7)
   - List indicators and metrics (Component 8)
   - Define functional/non-functional requirements (Component 9)
7. **Streamline** all DAK components for cross-component consistency
8. **Validate with SMEs** (Clinical SME review)
9. **Incorporate feedback** and begin next sprint

#### Clinical Review (Clinical SME)

- Validate DAK components against L1 recommendations
- Ground-truth with field practice (country visits, facility interviews)
- Provide clinical feedback and identify gaps

#### Phase 2b: L3 FHIR Authoring (FHIR Modeller)

1. **Verify L2 input** availability and consistency
2. **Set up IG repository** from smart-ig-empty template
3. **Author L3 artifacts** in recommended sequence:
   - Logical Models → Profiles → Questionnaires → StructureMaps
   - CodeSystems, ValueSets, ConceptMaps (with Terminologist)
   - CQL (decision logic, scheduling, indicators)
   - PlanDefinitions (processes, decision tables)
   - ActorDefinitions (reusing Commons repository)
   - Measures, Requirements, Scenarios, Tests
4. **Run IG Publisher build** and fix issues iteratively

#### Terminology Management (Terminologist, concurrent with L3)

- Review terminology bindings and code systems
- Map concepts to WHO Commons dictionary
- Map to ICD-11, SNOMED CT, LOINC
- Onboard new concepts through governance process

#### Phase 3: Quality Control (QC Reviewer)

1. **Review QA report** (qa.html) from IG Publisher
2. **Review checklist** items across L1, L2, L3, L4, Global sections
3. **Validate artifact conformance** to CRMI profiles
4. **Test L3 functionality** (StructureMaps, CQL, Measures)
5. **Decision gate**: Publication ready?
   - **No**: Report issues to FHIR Modeller for resolution → re-review
   - **Yes**: Approve for publication
6. **Review translated content** for completeness

#### Translation (Translator, concurrent with QC)

- Translate narrative and resource metadata
- Create example resources per UN language
- Submit translations for QC review

#### Phase 4: Publication (Publication Manager)

1. **Review changes** since last release, determine version number
2. **Optionally create** release-candidate branch
3. **Update IG status** — status=active, version=X.Y.Z, releaseLabel=release
4. **Create publication-request.json**
5. **Run final build** and verify
6. **Create GitHub release and tag** (vX.Y.Z) — triggers automated workflow
7. **Verify** automated publication succeeded (sitepreview)
8. **Request WHO team** to update smart.who.int
9. **Reset main** to draft, update version for next cycle

#### BPMN Process Diagram

The formal BPMN 2.0 process diagram is available at: [SGAuthoring.DAKLifecycle.bpmn](bpmn/SGAuthoring.DAKLifecycle.bpmn)

This diagram models the full lifecycle as a collaboration with swimlanes for each authoring persona, including message flows between participants for handoffs (e.g. Business Analyst → Clinical SME for validation, QC Reviewer → Publication Manager for approval).

The end-to-end stages above are modelled separately for authoring agents, with
each stage forking into the next stage and its adjudication:
`smart-base/processes/content/smart-guideline-end-to-end.bpmn` in the source
repository, described by the `smart-guideline-end-to-end` skill.
