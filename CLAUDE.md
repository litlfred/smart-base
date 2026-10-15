# CLAUDE.md — litlfred/smart-base

This repository holds two different things, and they publish two different
ways. Most mistakes here come from treating one as the other.

| | what | published by | previewed at |
|---|---|---|---|
| `input/`, `sushi-config.yaml` | the WHO SMART Base **FHIR IG** | the gh-pages ROOT: an agent, by the IG route every smart-* IG uses (`bun run cat-harness-tools/scripts/stage-local.ts --repo .`, from the cached AST; `index.config.json` `site`). The IG Publisher (`ghbuild.yml`) only previews, and never deploys over a folio root | `STAGING/<branch>/` (stage-local); Publisher output at `gh-pages/branches/<branch>/` (`/deploy`) |
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
   branch's commit, recorded by `bun run cat mount:remote --staging` (basis
   `staging`, no consent needed). `feature-staging.yml` then publishes
   `STAGING/<slug>/` and comments the links. `/deploy` builds the IG, which
   does not contain this content.
2. **Processes live under `smart-base/processes/`**: the `.bpmn`, its
   documentation, and its picture beside it
   (`NODE_PATH=folio-assistant/node_modules bun run smart-base/scripts/render-processes.ts`,
   which draws with the mounted bootstrap-tools). Do not copy a process
   or its picture into `input/`; the just-the-docs site draws every mounted
   process itself.
3. **Reuse before adding.** A skill, schema, process or role the platform
   already has is used by name. Check the mounted layers first.
