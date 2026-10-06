# kg — the SMART Guidelines knowledge-graph schema (L1)

The L1 layer of the SMART Guidelines knowledge graph — publications,
recommendations, evidence, PICO, schedules, indicators and the citations that
point at them — as **Zod**, with the FHIR artefacts generated from it.

Migrated from [WorldHealthOrganization/smart-kg](https://github.com/WorldHealthOrganization/smart-kg)
`ontology/l1/l1.json` and `shapes/recommendation-graph.schema.json` at main
(`66a9b13`). Every class, predicate, edge and note is carried verbatim; what is
new is a **type** for every property, which `l1.json` named but did not type.

## One source, every format

| file | what | generated? |
|---|---|---|
| `src/l1.ts` | the L1 ontology: classes with typed properties, predicates, licensed edges | source |
| `src/vocab.ts` | closed code lists: derivation, resolution status, GRADE, publication type | source |
| `src/graph.ts` | a graph document's form (tier 1) | source |
| `src/validate.ts` | tier 1 + tier 2 checker — a port of smart-kg `validate.mjs`, plus typed values | source |
| `generated/l1/l1.json` | the ontology in smart-kg's format, JSON-equal to WHO's | generated |
| `generated/l1/recommendation-graph.schema.json` | the document JSON Schema | generated |
| `../input/fsh/models/KGL1.fsh` | logical models: one per class, plus `KGGraphDocument`, `KGNode`, `KGEdge` | generated |
| `../input/fsh/codesystems/KG*.fsh`, `../input/fsh/valuesets/KG*VS.fsh` | code systems and value sets | generated |

The FSH is ordinary smart-base FSH: SUSHI compiles it, the IG Publisher
renders it, and `input/scripts/generate_logical_model_schemas.py` and
`generate_valueset_schemas.py` turn it into JSON Schema exactly as they do for
every other logical model here.

## Reuse before invention

| L1 element | reuses |
|---|---|
| `publication` | **`Parent: DublinCore`** — seven of its properties are Dublin Core's |
| `terminology-code` | **`Parent: Coding`** — its four properties are Coding's |
| `indicator` | `ProgramIndicator`'s element names, types and definitions (not a parent: those are required there) |
| `health-intervention` | `HealthInterventions`' id and description (not a parent: `reference 1..*` is an edge here) |
| GRADE strength, certainty | folio-assistant's `grade-*` code lists, verbatim |

Only derivation, resolution status, publication type, and the class and
predicate code systems are new — nothing defined them before.

## Commands

```sh
cd kg && npm ci
npm run build                     # regenerate everything
npm run check                     # fail if any generated file is stale
SMART_KG_HOME=../../smart-kg npm test   # parity + negative cases + agreement with validate.mjs
npm run validate -- path/to/graph.json   # check a graph document
```

Without `SMART_KG_HOME` the parity and agreement tests report **n/a** — skipped,
never passed.

## Scope

L1 only. smart-kg's L2, L2-BPMN, L2-DMN and L3 layers import L1 and stay in
smart-kg for now; `validate.ts` refuses a document of another layer rather than
checking it against the wrong ontology.
