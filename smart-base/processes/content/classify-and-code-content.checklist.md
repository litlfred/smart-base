<!-- GENERATED from smart-base/processes/content/classify-and-code-content.bpmn by cat-harness-tools/scripts/bpmn-checklist.ts. Do not edit: change the diagram and regenerate (bun run cat bpmn:checklist). -->

# Checklist — Classify and code content

> **Generated, and not the authority.** This is `smart-base/processes/content/classify-and-code-content.bpmn` (process `Process_ClassifyAndCodeContent`) walked as a state machine. The diagram and the workflow engine decide; this list only reads them. Follow the `next:` line of each step rather than the order on the page, and record each step with the call it names, so the engine's committed state — not this list — says which edge was taken.

Classifies and codes L1 extracted statements (recommendations, implementation practices, remarks, and proposed coverage exclusions) and L2 DAK slots (personas, business processes, guideline domains, conditions, interventions, medicines, and GRADE ratings) following the terminology-coding methodology

## Begin — L1 extraction or L2 component ready to classify and code (`Start_ContentReady`)

- Begin here: Triggered when an L1 source has been extracted into candidate statements and exclusions, or when an L2 DAK component (personas, user scenarios, business processes, data dictionary, decision tables) requires terminology classification and coding.
- Call `workflow_start` with `process: "Process_ClassifyAndCodeContent"` and the subject this run is about; keep the instance id it returns.
- next: → `Gateway_Rework`

### Merge — `Gateway_Rework`

- Nothing to do or decide: the paths meet here and the engine passes through.
- next: → `Task_IdentifySlots` (Identify slots and proposed exclusions)

### 1. Identify slots and proposed exclusions (`Task_IdentifySlots`)

- Who: the `Authoring agent` lane (role `authoring-agent`).
- Skill: `classify-and-code-content`, `recommendation-extraction`.
- What: Enumerate the classifiable slots in the L1 statements or L2 component (condition, intervention, persona, medicine, domain, business-process, recommendation-strength, recommendation-direction, evidence-certainty) and any proposed L1 coverage exclusions in exclusions.proposed.json naming l1-extraction
- Record it: `workflow_complete` with `node: "Task_IdentifySlots"`.
- next: → `Task_LookupAndCode` (Run reuse-first lookup and record candidates)

### 2. Run reuse-first lookup and record candidates (`Task_LookupAndCode`)

- Who: the `Authoring agent` lane (role `authoring-agent`).
- Skill: `classify-and-code-content`, `recommendation-scenarios`, `glossary-terms`.
- What: Run the terminology-lookup Tool across the four reuse-first rungs of the terminology-coding methodology: (1) target guide vocabulary, (2) smart-base generic personas, GRADE code lists and guideline-domain glossary, (3) external WHO-FIC/ILO standards (ICD-11, ICHI/CDHIv2, ISCO-08, ATC), and (4) local
- Record it: `workflow_complete` with `node: "Task_LookupAndCode"`.
- next: → `Task_StageForReview` (Stage codings, warnings and exclusions for review)

### 3. Stage codings, warnings and exclusions for review (`Task_StageForReview`)

- Who: the `Authoring agent` lane (role `authoring-agent`).
- Skill: `staging-review`, `interaction-modality`.
- What: Write the candidate codings, provenance bases, warnings report, and any unsigned exclusions.proposed.json entries, and request human review with deep links to the staged extraction or component pages and the printed page sections.
- Record it: `workflow_complete` with `node: "Task_StageForReview"`.
- next: → `Gateway_HasExclusions` (Proposed exclusions?)

### Decide — Proposed exclusions? (`Gateway_HasExclusions`)

- When the L1 extraction includes unsigned entries in exclusions.proposed.json, route them to the l1-extraction-reviewer lane first so coverage exclusions are verified against the printed page before final coding sign-off; otherwise proceed directly to the terminologist/ontologist review lane.
- Call `workflow_complete` with `node: "Gateway_HasExclusions"` and `outcome` set to the label that holds:
  - «yes» → `Task_ReviewExclusions` (Read proposed exclusions against page and sign)
  - «no» → `Task_ReviewCodings` (Adjudicate slot codings and glossary candidates)

### 4. Read proposed exclusions against page and sign (`Task_ReviewExclusions`)

- Who: the `L1 extraction reviewer (person)` lane (role `l1-extraction-reviewer`).
- Skill: `classify-and-code-content`, `recommendation-extraction`, `content-review`.
- What: Open library/<doc_id>/sections/page-NNN.md beside exclusions.proposed.json.
- Record it: `workflow_complete` with `node: "Task_ReviewExclusions"`.
- next: → `Gateway_ExclusionVerdict` (Exclusions signed?)

### 5. Adjudicate slot codings and glossary candidates (`Task_ReviewCodings`)

- Who: the `Terminologist / ontologist reviewer (person)` lane (role `terminologist`).
- Skill: `classify-and-code-content`, `ontologist`, `glossary-terms`, `terminology-management`, `content-review`.
- What: Review each slot's classification and code against the terminology-coding methodology: verify that the authoritative scheme for the slot was used, confirm reuse-first rung selection, check skos:exactMatch vs skos:closeMatch precision (ontologist), and adjudicate any Rung 4 glossary candidates (promo
- Record it: `workflow_complete` with `node: "Task_ReviewCodings"`.
- next: → `Gateway_TerminologistVerdict` (Coding verdict?)

### Decide — Exclusions signed? (`Gateway_ExclusionVerdict`)

- If all proposed exclusions are verified and signed by the l1-extraction-reviewer, proceed to terminologist/ontologist review; if any exclusion is rejected as normative, return to the authoring agent to re-curate the sentence as an L1 node.
- Call `workflow_complete` with `node: "Gateway_ExclusionVerdict"` and `outcome` set to the label that holds:
  - «reject-exclusion» → `Gateway_Rework`
  - «signed» → `Task_ReviewCodings` (Adjudicate slot codings and glossary candidates)

### Decide — Coding verdict? (`Gateway_TerminologistVerdict`)

- The terminologist/ontologist reviewer's decision: approve promotes candidate links to reviewed and approved glossary candidates to authored; request-changes returns the mapping or glossary candidates to the authoring agent with specific findings.
- Call `workflow_complete` with `node: "Gateway_TerminologistVerdict"` and `outcome` set to the label that holds:
  - «request-changes» → `Gateway_Rework`
  - «approve» → `End_ClassifiedAndCoded` (Content classified, coded and signed off)

## Done — Content classified, coded and signed off (`End_ClassifiedAndCoded`)

- The instance completes here: All L1 coverage exclusions are signed by l1-extraction-reviewer, slot codings are marked reviewed, and approved local glossary terms are promoted to authored. `workflow_next` then reports nothing enabled — that, not this line, is the record of completion.
