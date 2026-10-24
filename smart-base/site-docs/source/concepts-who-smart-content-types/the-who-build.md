The FHIR IG Publisher and FHIR content in general are described on the
[FHIR IG Publisher](https://litlfred.github.io/folio-assistant/fhir-harness/fhir/ig-publisher.html)
and [FHIR content](https://litlfred.github.io/folio-assistant/fhir-harness/fhir/fhir-content.html)
pages of the FHIR IG layer. This section holds what is specific to the WHO
SMART Guidelines build.

**The Publisher is one step of many.** In the WHO SMART Guidelines build it
runs between six pre-processing invocations and nine post-processing ones.
Most of what a reader sees on a published SMART Guideline (the DAK API, the
JSON Schemas, the JSON-LD vocabularies) is produced *after* the Publisher
exits, by scripts, and is not the Publisher's work at all.

**The version floats.** The WHO build downloads `publisher.jar` from the
**latest** release on every run, so two builds of an unchanged commit can
differ, and nothing in the output says which version produced them.

**The dependency closure.** For the DAK layer, the Publisher resolves
`hl7.terminology`, `hl7.fhir.uv.extensions.r4`, `hl7.fhir.uv.cql`,
`hl7.fhir.uv.cpg`, `hl7.fhir.uv.crmi` and `hl7.fhir.uv.sdc`.

The rules are skills, and where the two disagree the skill wins and this page
is wrong:

- **`l2-dak-authoring`**: authoring at L2, and deriving rather than retyping.
- **`ig-artifact-ingestion`**: reading a *published* IG back as a knowledge
  graph: which IGs qualify, what to read, what to refuse, the four partial
  views and the two traps.
- **`dak-preprocessing`** and **`dak-postprocessing`**: the WHO-specific
  phases around the Publisher run, step by step.
- **`smart-stack-layering`**: which harness layer a given asset belongs to,
  and the question that settles it.
