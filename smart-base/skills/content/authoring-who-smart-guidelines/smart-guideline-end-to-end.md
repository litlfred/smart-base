---
name: smart-guideline-end-to-end
description: >
  The whole road from a use case to a running application on WHO SMART
  Guidelines, for a new guideline or a jurisdiction's adaptation: find the L1
  guidelines that bear on the use case, ingest them into an L1 knowledge graph,
  choose the existing L2 DAKs and L3 IGs to build on, create or adapt the L2
  and L3 assets, then build the consuming application the user describes.
  Human adjudication follows every stage, as QA and never as a gate: the agent
  goes on to the next stage while the last one is reviewed. Read before
  starting any end-to-end authoring or adaptation, and to find which existing
  skill and process runs each stage.
---

# smart-guideline-end-to-end

> Skill id: `smart-guideline-end-to-end` · Package: `authoring-who-smart-guidelines` ·
> Process: [`smart-guideline-end-to-end.bpmn`](../../../processes/content/smart-guideline-end-to-end.bpmn)

**This skill adds an order, a dependency choice at each level, and an
adjudication record. It adds no authoring of its own.** Each stage runs a skill
or process that already exists, named in the table below. If a stage needs
something that skill does not say, fix that skill. Do not add it here.

## The rule that shapes everything: adjudication is QA, not a gate

Owner, 2026-10-14: *"while adjudication is required at every step, it is a QA
issue, not a gate. so once agent produces L2 it can produce L3."*

So every stage ends in a **fork**, not a decision:

```
stage n (agent) ──┬──► stage n+1 (agent)          keeps going
                  └──► adjudicate stage n (human)  runs beside it
```

What follows from that:

1. **Every stage needs adjudication, and the guideline is not done until every
   adjudication is recorded.** Not waiting is not the same as skipping. The
   process ends only when the last stage and all its adjudications are in.
2. **An asset built on unadjudicated input says so.** Every asset produced
   downstream of an adjudication that is still open carries
   `adjudication: pending` on the input it used (provenance, not a warning
   banner). When that adjudication closes, the flag updates.
3. **A rejection reopens the stage, and the flag spreads downstream.** A
   rejected or amended adjudication files a bean against the stage. Every
   downstream asset derived from the rejected item turns
   `adjudication: rejected-upstream` and is re-derived when the stage is
   redone. It is not deleted ahead of time: the re-derivation may come out
   the same.
4. **The agent never adjudicates.** The person who signs is named by role
   (table below). An agent may prepare the review material, never record the
   verdict. This is `recommendation-extraction`'s sign-off rule applied to
   every level.

> **Open conflict.** `l2-dak-authoring.bpmn` still has its
> **Clinically accurate?** gateway, which holds the DAK back until clinical
> validation passes. In this process the L2 stage does not wait on it: clinical
> validation is the L2 adjudication. Whether that gateway also becomes
> non-blocking is for the owner to decide.

## The stages

| # | stage | runs | produces | adjudicated by | what the adjudicator sees |
|---|---|---|---|---|---|
| 0 | **Describe the use case** | user | the use case: population, setting, jurisdiction, interventions in scope | (the user *is* the source) | — |
| 1 | **Identify L1 guidelines and recommendations** that bear on the use case | [`dak-l1-library`](dak-l1-library.md) (Component 1 sources first, then WHO IRIS and the jurisdiction's own guidelines) | a list of candidate L1 sources, each marked *in the library* / *ingested to KG* / *not yet* | Clinical SME | the list, each with why it was included or left out |
| 2 | **Ingest into an L1 KG** the sources not yet in one | `bun run cat ingest` → [`dak-l1-library`](dak-l1-library.md) (generic-document layer, `l1-library`) → [`recommendation-extraction`](recommendation-extraction.md) (L1 layer: recommendations, remarks, practices, scenario candidates) | `library/<bib>/` and `library/<bib>/l1-extraction/` | `l1-extraction-reviewer` (exclusions and coverage), Clinical SME (recommendations) | the extraction beside the printed page; coverage score; every `WARNING` |
| 3 | **Choose L2 dependencies**: which existing DAKs (WHO, or the jurisdiction's adaptation) to build on | agent, reading the L1 KG's `implementedBy` / `realises` edges against each candidate DAK's Component 1 | a dependency list: DAK, version, which components are reused, extended or not used, and why | Programme manager + Business analyst | one row per candidate DAK, including the ones rejected |
| 4 | **Create or adapt the L2 DAK assets** | the steps of [`l2-dak-authoring.bpmn`](../../../processes/content/l2-dak-authoring.bpmn): [`l2-dak-authoring`](l2-dak-authoring.md), `bpmn-authoring`, `dmn-authoring`, `terminology-management`; pre/post-processing by [`dak-preprocessing`](dak-preprocessing.md) / [`dak-postprocessing`](dak-postprocessing.md) | the DAK components | per asset, see [Per-asset review](#per-asset-review) | per asset; **before and after** for an adaptation |
| 5 | **Choose L3 dependencies**: which existing FHIR IGs (WHO, or the jurisdiction's) to build on | [`ig-artifact-ingestion`](ig-artifact-ingestion.md) to index each candidate IG; agent matches the L1 KG and the stage-4 L2 assets against the index | a dependency list: IG package, version, which profiles / value sets / libraries are reused, derived from or not used | FHIR modeller + Terminologist | one row per candidate IG, including the ones rejected |
| 6 | **Produce the L3 assets** from the L2 assets | [`dak-l3-ig.bpmn`](../../../processes/content/dak-l3-ig.bpmn): `l3-fhir-authoring` with `l2-dak-authoring`, then fhir-harness's L3 pipeline up to a clean IG build | the FHIR IG (FSH, CQL, profiles, terminology, examples, tests) | per asset, see [Per-asset review](#per-asset-review) | per asset; **before and after** for an adaptation |
| 7 | **Describe the consuming application** | user, prompted by the agent | the application brief: who uses it, on what device, which L2 processes it covers, which L3 resources and operations it calls, connectivity, the systems it talks to | (the user *is* the source) | — |
| 8 | **Build the consuming application** | agent, against the stage-6 IG (it needs a clean build, not a publication) | the application and its conformance tests against the IG's examples and test cases | Business analyst + Clinical SME (does it do what the L2 says?), FHIR modeller (does it conform to L3?) | the running app, walked through each L2 user scenario |

Publication of the IG (the end of `dak-l3-ig.bpmn`) runs as normal and is not
on the path to stage 8: an application can be built against an IG that has
not been published yet.

### Stages 0 and 7 belong to the user

The agent does not invent the use case or the application. If the request
does not describe them, ask a numbered question. Use the user's own words
where they gave any, and offer options drawn from the L2 personas and
processes already found:

> Which application are we building?
>
> 1. **A point-of-care app** for the DAK's main persona, covering its business
>    processes *(recommended when stage 4 found one dominant persona)*.
> 2. **A reporting / indicator dashboard** over the DAK's indicators.
> 3. **A decision-support service** (CDS Hooks / `$apply`) that an existing
>    EMR calls.
> 4. **Tell me more.**

### Stage 2 is skipped only for what is already in a KG

"Already ingested" means `library/<bib>/l1-extraction/` is there, declared,
and at the same source version. A library entry with no extraction still needs
the L1 half. Skipping is per source, not for the whole stage.

### Stages 3 and 5: dependency choice

A dependency decides what the guideline inherits, so the choice is an asset in
its own right and is adjudicated like one. For each candidate, record:

| field | meaning |
|---|---|
| `candidate` | DAK id or IG package id, and version |
| `publisher` | WHO, or the adapting jurisdiction |
| `evidence` | the L1 KG nodes (and, at L3, the L2 assets) that point at it |
| `decision` | `reuse` (unchanged) · `adapt` (fork and change) · `extend` (depend and add) · `reject` |
| `reason` | one sentence; required for `reject` |

**Reuse first.** This is the precedence `recommendation-extraction` already
uses for personas and processes: reuse an existing asset, then adapt one, and
create only when neither fits, with a `WARNING` saying none fitted. Prefer the
jurisdiction's adaptation over the WHO original when one exists for the same
scope, because it already holds the local decisions. Record the WHO original
too, as the upstream of that adaptation.

## Per-asset review

Every asset a stage **creates or changes** gets its own review item. An asset
that was reused unchanged gets none: its upstream's adjudication covers it.
The review item shows the asset the way its reviewer reads it, not as source:

| level | asset | review shows |
|---|---|---|
| L1 | recommendation / remark / practice | the node beside the printed sentence and page |
| L2 | persona, user scenario | the card: role, goal, setting |
| L2 | business process (BPMN) | the rendered diagram (`render:bpmn` / `dak-swimlanes`) |
| L2 | decision table (DMN) | the table, with the L1 recommendation each rule cites |
| L2 | core data elements | data-dictionary rows (`dak-data-dictionary`), and a **wireframe** of the form that captures them |
| L2 | indicators, requirements | the indicator definition / requirement list, each with the persona and process it serves |
| L3 | Questionnaire, profile with UI | a **wireframe** rendered from the resource |
| L3 | profile, logical model | the IG Publisher's differential view |
| L3 | CQL / PlanDefinition | the logic beside the DMN rule it implements, and its test cases passing or failing |
| L3 | terminology | the expansion, and the mapping to ICD-11 / SNOMED CT / LOINC |
| app | screen / flow | the running screen, walked through the L2 scenario it serves |

**An adaptation is reviewed as a diff.** When the asset came from a stage-3 or
stage-5 dependency with `decision: adapt`, the review item shows **before**
(the upstream asset at its pinned version) and **after** side by side, with the
change highlighted, and the L1 node that justifies the change. A changed asset
with no L1 justification is a finding in its own right: an adaptation is local
evidence or local policy, and the KG has to say which.

The verdict on a review item is `accepted`, `amended` (the reviewer's change
replaces the agent's, recorded with `by` and `at`), or `rejected` with a reason.
That is the shape `recommendation-extraction` already records
(`review: {by, at}`). Use the same field at every level.

## New guideline or adaptation: one process

An adaptation is not a separate process. It is this process with stages 3 and
5 returning `adapt` decisions, which makes stages 4 and 6 show diffs. A new
guideline is the case where those stages return only `reuse`, `extend` or
nothing. Do not maintain two copies of the stages.

## What this does not change

- The WHO DAK component set and L1–L4 layering: [`smart-stack-layering`](smart-stack-layering.md).
- How a new repository or IG is set up: [`smart-guideline-create`](smart-guideline-create.md).
  Run it before stage 4 if the guideline has no home yet.
- The persona-swimlane lifecycle (planning, QC, translation, publication) on
  the IG's [Authoring Process](https://worldhealthorganization.github.io/smart-base/authoring-process.html)
  page. Those phases still run. This process says what goes *into* phases 2a
  and 2b, and what comes before and after them.
