# DAK skill scripts (pending migration)

What is left here is pending migration into the smart-base knowledge graph
(`smart-base/`), and nothing in this repository runs it: no workflow, no
build step and no container calls these scripts. Do not add to it.

| Directory | What it holds | Expected to move under |
|---|---|---|
| `dak_authoring/` | the issue classifier and L2 authoring actions and their prompts | bean folio-assistant-14un |
| `ig_publisher/` | the IG Publisher build, validate and error-interpretation actions | bean folio-assistant-14un |
| `common/` | shared helpers (`ig_errors`, `llm_utils`, `prompt_loader`, `ig_publisher_iface`) and shared prompts | with whichever of the above still uses them |

Notes for anyone running a script by hand before it moves:

- The scripts import each other from this directory, so run them with
  `.github/skills/` on `PYTHONPATH`.
- BPMN XML, swimlane structure and lane → `ActorDefinition` validation moved to
  `smart-base/L2-bpmn/tools/dak-swimlanes/dak-swimlanes.ts` (bean
  folio-assistant-tgaj), replacing `bpmn_author/`, `bpmn_import/`,
  `bpmn_layout/` and `common/fsh_utils.py`.
- ELM extraction is not here: fhir-harness owns the ELM strippers, and
  `ghbuild.yml` runs `input/scripts/strip_library_binaries.py`.
- The LLM steps read `DAK_LLM_API_KEY` and `DAK_LLM_MODEL` (see
  `.env.example`) through LiteLLM and are skipped when no key is set. No
  dependency lock is kept for these scripts any more.

Removed by bean folio-assistant-hhkw (epic folio-assistant-95e7): the Docker
CLI (`cli/`, `Dockerfile`, `docker-compose.yml`), `skills_registry.yaml` and
every `skills.yaml`, the label definitions, the `l1_review`, `l3_review` and
`translation` placeholders, `bpmn_import/actions/`, the ELM strip action,
the duplicate `safe_xml.py`, and the label and `/validate` workflows, none of
which could fire.
