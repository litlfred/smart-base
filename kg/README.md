# kg — the SMART Guidelines knowledge-graph schema (L1 3.0)

The L1 layer of the SMART Guidelines knowledge graph as **Zod**, with the FHIR
artefacts generated from it:
- **layout:** publication, section, element;
- **content:** recommendation, remark, key question, outcome, evidence, catalogued intervention, indicator;
- **references a DAK uses to point at them:** citation, reference entry, terminology code.

Migrated from [WorldHealthOrganization/smart-kg](https://github.com/WorldHealthOrganization/smart-kg)
`ontology/l1/l1.json` and `shapes/recommendation-graph.schema.json` at main
(`3f5e477`, L1 **3.0**). Every class, value set, predicate, edge and note is
carried verbatim. What's new is a **type** for every property: smart-kg names
its properties and binds some to value sets, but doesn't type the rest.

## One source, every format

| file | what | generated? |
|---|---|---|
| `src/l1.ts` | L1 3.0: 13 classes with typed properties, 18 value sets, 21 predicates, 68 licensed edges | source (migrated) |
| `src/l1-library.ts` | the **library extension**: the layering rule, the specialisation of L1's layout classes, and the upstream `library-node` class | source |
| `src/graph.ts` | a graph document's form (tier 1) | source |
| `src/validate.ts` | tier 1 + tier 2: a port of smart-kg `validate.mjs` 3.0, plus a check on typed values | source |
| `src/kgid.ts` | L1 IRIs and content hashes: a port of `tools/kgid.mjs` | source |
| `generated/l1/l1.json` | L1 3.0 in smart-kg's format, JSON-equal to WHO's | generated |
| `generated/l1/l1-library.json`, `l1-library.jsonld` | the extension layer, and its `rdfs:subClassOf` statements | generated |
| `generated/l1/recommendation-graph.schema.json` | the document JSON Schema | generated |
| `../input/fsh/models/KGL1.fsh`, `KGL1Library.fsh` | logical models | generated |
| `../input/fsh/codesystems/KG*.fsh`, `../input/fsh/valuesets/KG*VS.fsh` | one CodeSystem + ValueSet per value set | generated |

SUSHI compiles the FSH. smart-base's own `generate_logical_model_schemas.py`
and `generate_valueset_schemas.py` turn it into JSON Schema, as they do for
every other logical model here.

## The library extension (owner rulings, 2026-10-07)

1. **Layering:** every layer points only upstream: L3 → L2 → L1 → **library**
   (the ingested source, its sections and blocks). L1 may point at the library,
   never down.
2. **L1's layout classes specialise the library's:**
   - `publication` ⊂ `cat-harness:SourceDocument`;
   - `publication-section` ⊂ `doco:Section`;
   - `publication-element` ⊂ `cat-harness:Block`, narrowed to `doco:Table`, `doco:Figure`, `doco:Footnote`, `doco:List` or `doco:TextBox` by element type.

   At instance level, each L1 layout node is `specializationOf` (PROV) the
   library node it is read from. L1 inherits whatever sectioning the library
   produces.
3. A source the library holds that **isn't L1** is still a resolution target:
   `reference-entry resolvesTo library-node`.

It is kept as its own layer (`l1-library`, which imports `l1`), so
`generated/l1/l1.json` stays equal to WHO's and the extension can be proposed
upstream unchanged. A document using it names `l1-library.context.jsonld`.

## Reuse before invention

| L1 element | reuses |
|---|---|
| `publication` | **`Parent: DublinCore`**; title, creator, publisher, language and rights are Dublin Core's |
| `terminology-code` | **`Parent: Coding`** |
| `indicator`, `health-intervention` | `ProgramIndicator`'s and `HealthInterventions`' element names and types (not parents: those make fields required) |
| GRADE value sets | the same codes as folio-assistant's `grade-*` code lists; 3.0's handbook-sourced definitions are emitted |

## Commands

```sh
cd kg && npm ci
npm run build                            # regenerate everything; removes orphaned generated FSH
npm run check                            # fail if any generated file is stale or orphaned
SMART_KG_HOME=../../smart-kg npm test    # parity, kgid agreement, smart-kg's L1 cases, the extension
npm run validate -- path/to/graph.json   # check a graph document
```

Without `SMART_KG_HOME`, the parity and agreement tests report **n/a**: they
are skipped, never passed.

## Known limits

- L1 only. smart-kg's L2, L2-BPMN, L2-DMN and L3 layers stay in smart-kg.
- smart-base's `generate_logical_model_schemas.py` flattens a BackboneElement's
  children into top-level properties (`identifiers.value` appears as `value`).
  That's an existing behaviour of the generator: `DAK.publisher` is nested the
  same way.
