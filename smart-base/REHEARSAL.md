# Separation rehearsal: smart-base's instance in its own repository

**Rehearsal branch. Do not merge.** This branch tests stage E of the
smart-* separation plan
([`smart-separation-2026-10-01.md`](https://github.com/litlfred/folio-assistant/blob/main/cat-harness/docs/proposals/smart-separation-2026-10-01.md),
bean `n3ni`, issue litlfred/folio-assistant#1767, rehearsal bean `rbz3`) on
the fork, before anything is done in the WHO repositories.

Owner, 2026-10-02: *"use forks litlfred/smart-* as staging before we do it on
WHO reps"*, then *"do smart-base and smart-[trust]. also start moving their
dir content over"*. The layout is the plan's, as the owner chose ("2"): each
IG repository keeps its data under `smart-base/`. smart-trust's rehearsal
is litlfred/smart-trust#3.

## What is on this branch (round 1)

- **`smart-base/`:** the whole instance directory from folio-assistant at
  `853f9532` (PR litlfred/folio-assistant#1766), copied unchanged. That is
  2,924 files and 51 MB:
  - `library/`: 2,430 files, the WHO digital-health corpus;
  - `docs/`: 300 generated pages;
  - `fhir-artifact-index/`: 142 files, including `releases.json`;
  - `test/`: 21 files;
  - the harness definition: `skills/`, `tools/`, `methodologies/`,
    `scenarios/`, `processes/` and `schemas/`;
  - `smart-base.json`.
- **`smart-base/fhir-artifact-index/menu.json`, new:** ingested here from this
  repository's own `sushi-config.yaml` at `e151a4d3`. folio-assistant could
  never write it, because it cannot reach the IG source. Without a menu,
  folio-assistant does not stage smart-base's just-the-docs IG site at all.

## Results (2026-10-02)

| check | result |
|---|---|
| `gen-ig-pages --instance smart-base --label "WHO SMART Base" --chrome-owner smart-base --summary --check`, with the 23 platform files of litlfred/smart-trust#3 and the templates | **pass**: 299 pages byte-identical |
| `ingest-ig-menu --source . --out smart-base/fhir-artifact-index` | written: 4 groups (Home, Authoring, Downloads, Indices) |

## Not done yet: round 2

- **Plan Q1(a): move the harness definition out of `smart-base/` to the
  repository root.** That covers `skills/`, `tools/`, `methodologies/`,
  `scenarios/`, `processes/` and `schemas/`. The IG's own data stays under
  `smart-base/`, like every other IG.
  - It waits on stage D (litlfred/folio-assistant#1795), which is still
    consolidating these same files in folio-assistant.
  - It also needs `smart-base.json`'s directory paths re-pointed. Doing it
    first would race that work.
- **Plan Q4: ship `chrome.json` with the harness.** Then smart-trust's
  pages stop reading smart-base's data, and its fork stops carrying a copy.
- No workflow is added and no WHO repository is touched.
