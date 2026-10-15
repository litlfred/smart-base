# CLAUDE.md — litlfred/smart-base

This repository holds two different things, and they publish two different
ways. Most mistakes here come from treating one as the other.

| | what | published by | previewed at |
|---|---|---|---|
| `input/`, `sushi-config.yaml` | the WHO SMART Base **FHIR IG** | IG Publisher (`ghbuild.yml`) | `gh-pages/branches/<branch>/` (`/deploy`) |
| `smart-base/` | the smart-base **harness instance**: skills, processes (BPMN), library, KG | folio-assistant's just-the-docs site, which **mounts** this directory | folio-assistant `STAGING/<slug>/` (`feature-staging`) |

## The platform is mounted, not absent

`folio-assistant/` is a submodule. The SessionStart hook
(`.claude/mount-platform.sh`) initialises it and replays its lock, which puts
folio-assistant-core, cat-harness, cat-harness-tools, fhir-harness,
bootstrap-tools and smart-base on disk under `folio-assistant/`. **Read the
platform's skills there before choosing how to build, render, review or
stage anything** (`folio-assistant/cat-harness/skills/`,
`folio-assistant/fhir-harness/skills/`). If `folio-assistant/` is empty, run
`bash .claude/mount-platform.sh`.

`folio-assistant/smart-base/` is the **pinned** copy the platform mounts.
Edit `./smart-base/`, never the mounted copy.

## Rules

1. **A change under `smart-base/` is previewed on the just-the-docs staging
   site, never with `/deploy` or `ghbuild.yml`.** Stage it with a
   folio-assistant pull request that re-pins the `smart-base` mount to the
   branch's commit, recorded by `bun run cat mount:remote --staging`.
   `feature-staging.yml` then publishes `STAGING/<slug>/` and comments the
   links. `/deploy` builds the IG, which does not contain this content.
   - **Every re-pinned ref needs the owner's consent** (CI refuses an
     unconsented mount). Ask for it, then record it in `index.config.json`
     (the source's `consent`: `by`, `on`, `ref`, `evidence` quoting the
     owner) and keep that instance's `trust` in `index.lock.json` as
     `basis: consent` at the new ref. `mount:remote --staging` rewrites
     every `trust` to `basis: staging`; put the consent records back before
     committing, and check the lock diff is only the pins (2026-10-15,
     folio-assistant#2559).
   - **Before pushing the re-pin**, run in that folio-assistant checkout,
     against the mounts it now holds: `bun run cat check:l1-complete` and
     `bun run cat translate-bpmn --check`. Both failed a staging run on
     2026-10-15, and each failure stopped every job after it.
2. **Processes live under `smart-base/processes/`**: the `.bpmn`, its
   documentation, and its picture beside it
   (`NODE_PATH=folio-assistant/node_modules bun run smart-base/scripts/render-processes.ts`,
   which draws with the mounted bootstrap-tools). Do not copy a process
   or its picture into `input/`; the just-the-docs site draws every mounted
   process itself. **A changed `.bpmn` also changes its translation
   templates**: re-extract them in the same push, or `translate-bpmn:check`
   fails. Run `bun run cat translate-bpmn --extract` in a folio-assistant
   checkout whose `smart-base` mount is this branch's commit (the submodule
   here may be pinned too old to read this branch's declaration), then copy
   `smart-base/translations/*/processes/<name>.pot` back into
   `./smart-base/translations/` (2026-10-15, smart-base `cf8b7aa`).
3. **Reuse before adding.** A skill, schema, process or role the platform
   already has is used by name. Check the mounted layers first.
