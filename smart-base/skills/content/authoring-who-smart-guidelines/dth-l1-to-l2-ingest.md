---
name: dth-l1-to-l2-ingest
description: >
  Turn a WHO Digital Transformation Handbook that exists only as an L1
  publication (ingested in who-iris) into an L2 DTH in its own repository that
  depends on smart-ra: write the handbook's workplan first (what goes in its
  repo, what goes in smart-ra, which BPMN, roles and DMN to model), then
  scaffold and seed it. Read before starting work on any dth-* handbook repo.
---

# dth-l1-to-l2-ingest

> Skill id: `dth-l1-to-l2-ingest` · Package: `authoring-who-smart-guidelines` ·
> Stages 0-2 of [`dth-authoring`](dth-authoring.md) for a handbook that WHO has
> already published. Worked examples (2026-10-31): `litlfred/dth-phc#1`,
> `dth-sc#2`, `dth-pc#2`, `dth-sfp#1`; pilot `litlfred/dth-hrh#47`.

**An L2 DTH is a handbook whose narrative validates against the glossaries and
links to the ArchiMate model.** The owner's definition (2026-10-31): the
handbook can *"naturally utilize and validate against the glossaries"*, and its
*"narrative content has a rendering/linkage/representation in ArchiMate"*.

## Where things go

| what | where |
|---|---|
| shared glossary, every ArchiMate element and view, roles every DTH has (business analyst, health informatician, ...) | smart-ra |
| the handbook's narrative, its own terms (linked to smart-ra's), its DAK-kind blocks, links from text to ArchiMate elements | the handbook's repo |
| the L2 DTH kind, its checks, the DAK kinds and their fields | smart-base |
| the source PDF and its L1 entry | who-iris `library/<isbn>-eng` |

## The workplan comes first

Write one workplan per handbook and show it to the owner before any content
work. It lives as an issue on the handbook's own repo. Open it with the issue
form [`dth-workplan.yml`](../../../templates/issue-forms/dth-workplan.yml):
copy it to `.github/ISSUE_TEMPLATE/` in the fork, so the BPMN, roles and DMN
sections cannot be skipped (owner, 2026-10-31, option A: skill plus issue form). Every workplan has these
sections; the last three are required (owner, 2026-10-31):

1. **Source**: IRIS item, ISBN, edition, who-iris entry, and anything missing
   from it (a missing PDF, a missed glossary).
2. **Repo vs smart-ra split**, per the table above.
3. **Dependencies**: other DTHs it mounts (dth-pc and dth-sfp mount dth-sc).
4. **Glossary**: the source's own glossary terms (see Terms below) and every
   conflict with smart-ra.
5. **ArchiMate**: elements and views it needs, existing or new.
6. **Business processes as BPMN**: one diagram per business process the
   handbook describes, each lane naming a role from section 7. Draw a process
   only as deep as the handbook goes. A worked example taken from a WHO DAK
   links to the DAK's version and is not redrawn.
7. **Roles as structured entries**: every role as a persona or actor-definition
   block, linked to its BPMN lanes, a smart-ra ArchiMate role and a glossary
   term. Systems are system actors.
8. **Decision tables as DMN**: only tables the handbook itself states. Each
   cites its source passage. Thresholds come only from the source text, never
   invented. A model the handbook does not recommend is not a decision table.
9. **Schema gaps**: content with a fixed shape that no kind holds yet. These are
   proposals for review by the architect group and the handbook owners, not
   approved work.

Ids are per handbook and per kind: `<HB>-BP-nn` (business process), `<HB>-R-nn`
(role), `<HB>-DT-nn` (decision table), for example `PC-BP-01`.

## Housekeeping

- **Forks only.** Every commit, PR and issue goes to `litlfred/dth-*`. Never
  push to, or open a PR or issue on, a `WorldHealthOrganization/dth-*` repo
  without the owner's explicit permission.
- **Issues on the fork.** GitHub turns Issues off on a fork. Ask the owner to
  tick Settings > Features > Issues, then put the workplan issue there, not on
  smart-ra.
- **Conflicts are issues, not choices.** When the handbook defines a term
  differently from smart-ra, open an issue on `litlfred/smart-ra` that keeps
  both definitions, each quoted with its page. Do not pick one.
- **Third-party material stays out.** A figure or table the handbook uses by
  someone else's permission is outside the handbook's licence: do not copy it;
  leave a note pointing to its page.
- **Mechanical before agentic.** Content with a fixed shape (a step box of
  inputs, tasks, outputs, resources and risks; an annex template; a table) is
  read from the PDF by a script (for example pdfplumber) and checked by a
  person. An agent writes only what has no fixed shape.
- **Verbatim, with the page.** Definitions, tables and quoted passages are
  copied word for word, each with its page.
- **Fetching what the sandbox cannot reach** (a missing PDF, a private repo):
  file a bean and give the owner a ready-to-paste prompt for the local agent.

## Terms

The handbook's own glossary is the first source of terms: extract it as SKOS
`candidate` terms, verbatim, from the latest edition, by folio-assistant-core's
`glossary-terms` skill ("Source glossary first"). Use the handbook's words, not
ours, in blocks and in ArchiMate names.

## Then

Once the owner approves the workplan: scaffold the repo from the dth-hrh layout
(stage 0), seed the folio from the L1 by the handbook's own chapter outline
(stage 2), and continue with [`dth-authoring`](dth-authoring.md) stage 3.
