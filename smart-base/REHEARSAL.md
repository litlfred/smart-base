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

## Round 2 (2026-10-02): the harness at the root, the IG data under `smart-base/`

Owner: *"start smart-base round 2 after stage D"*, then **"1"**. Under that
choice the harness keeps the name `smart-base`, and the IG's data takes the
IG's id.

- **Built from stage D.** The base is litlfred/folio-assistant#1795 at
  `09fa3058`: the theme has moved from smart-trust, the chrome is re-keyed to
  its template, and smart-l1 and smart-dak are retired. #1766's
  instance-identity fix (`853f9532`) is applied on top.
- **Harness, `smart-base`, at the repository root (plan Q1(a)).**
  - Declared in `smart-base.json`, with `livesAt` set to litlfred/smart-base.
  - Holds `skills/`, `tools/`, `methodologies/`, `processes/`, `schemas/`,
    `scenarios/`, `themes/` and `AGENTS.md`.
  - None of these names existed in this repository before, so nothing was
    overwritten.
- **IG data, `smart-who-int-base`, under `smart-base/`.**
  - Declared in `smart-base/smart-who-int-base.json`, with
    `needs: [smart-base]`.
  - Holds `docs/`, `library/` (plan Q2(a)), `fhir-artifact-index/` and
    `test/results/`.
  - The id is the IG's, `smart.who.int.base`, with dots as hyphens. Instance
    names allow only `[a-z0-9-]`.
- **Both declarations validate** under `readDeclaration`, and
  `instanceRootsIn` finds both.

| check, with stage D's platform code | result |
|---|---|
| `gen-ig-pages --instance smart-base --chrome-owner smart-who-int-base --summary` | 225 of 226 pages byte-identical. `index.md` differs in one line: it names the data instance `smart-who-int-base`, as the rename intends. |
| the same run, plus round 1's `menu.json` | adds the 4 menu section pages |

### Findings

1. **Plan Q4 is not met by the lookup as written.**
   - `chromeFileFor` finds the chrome only in an instance's
     `fhir-artifact-index` directories.
   - A harness that holds no artefact index therefore cannot carry the
     chrome, so here it stays with the IG data (`--chrome-owner
     smart-who-int-base`).
   - To ship the chrome with the harness, the lookup needs a graph kind of
     its own for the chrome.
2. **Stage D's pages no longer embed the instance in asset URLs.** The only
   identity left in the pages is the `harness_details` include, so the rename
   is close to free.
3. **Dotted IG ids are not instance names.** A harness instantiated per IG
   needs a fixed id-to-name mapping. Here that is dots to hyphens.

## Round 3 (2026-10-02): the chrome ships with the harness (plan Q4)

Owner: *"go"*, which picks option 1, give the chrome a home with the harness.

- **The fix.** `chromeFileFor` now looks in an instance's `themes`
  directories before its `fhir-artifact-index`. This takes 8 files and
  +14/−7 lines on top of stage D. It is offered to stage D's owner on
  litlfred/folio-assistant#1795.
- **On this branch,** `chrome.json` moves from `smart-base/fhir-artifact-index/`
  (the IG data) to `themes/` at the root (the harness, beside the
  template's WHO theme).
- **Result.** `gen-ig-pages --instance smart-base --chrome-owner smart-base`
  applies the chrome from the harness: 35 tokens, 2 template layers. The
  pages match round 2.
- **In folio-assistant,** the same move keeps smart-base's 226 pages and
  smart-trust's 681 pages byte-identical. Kind validators and the theme
  check pass.

## Still not done

- Q4 lands in folio-assistant: see round 3; it waits on stage D's owner.
- Re-run on stage D's final head once #1795 merges.
- No workflow added, and no WHO repository touched.
