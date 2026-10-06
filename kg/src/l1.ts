/**
 * The L1 layer of the SMART Guidelines knowledge graph — recommendations,
 * evidence, PICO and the citations that point at them — as typed data.
 *
 * MIGRATED from WorldHealthOrganization/smart-kg `ontology/l1/l1.json` at
 * commit 66a9b1393fd7f315eb4eb0dab001db5e3eb0c5ef (main). Every note, predicate, edge and grounding
 * statement is carried verbatim; what is NEW is each property's type, Zod
 * schema and FHIR mapping. This file is now the source: `npm run build`
 * regenerates `generated/l1/l1.json` (the smart-kg format, unchanged) and the
 * FSH under `input/fsh/`, and `test/parity.test.ts` holds the JSON equal to
 * smart-kg's when a checkout is given.
 *
 * REUSE of existing models, before anything new is declared:
 *  - publication derives from smart-base `DublinCore` (its note already says
 *    "Metadata follows Dublin Core"); seven of its eleven properties are
 *    Dublin Core's, typed as DublinCore.fsh types them — so creator and
 *    identifier repeat (a single string is still accepted, see props.ts).
 *  - terminology-code derives from FHIR `Coding`: its four properties are
 *    Coding's four elements.
 *  - indicator and health-intervention take ProgramIndicator's and
 *    HealthInterventions' element names, types and definitions, and say on
 *    `correspondsTo` why they are not derived from them.
 *  - GRADE strength and certainty are folio-assistant's wg7r code lists.
 *
 * Typing decisions a reviewer should check, because l1.json named the
 * property and said nothing of its value:
 *  - publication.date is a FHIR `date` (YYYY allowed: WHO dates by year).
 *  - publication.language is text, as DublinCore.fsh has it.
 *  - schedule-entry.doseNumber is text: WHO tables print "Booster 1".
 *  - evidence.studyCount is an unsignedInt.
 *  - publication.publicationType binds the four kinds the class note names;
 *    a data portal or a form leaves it unset rather than being forced in.
 */
import type { LayerSpec } from "./ontology.ts";
import { p } from "./props.ts";
import { GRADE_CERTAINTY, GRADE_STRENGTH, PUBLICATION_TYPE, RESOLUTION_STATUS } from "./vocab.ts";

/** The smart-kg commit this layer was migrated from. */
export const MIGRATED_FROM = { repository: "https://github.com/WorldHealthOrganization/smart-kg", path: "ontology/l1/l1.json", commit: "66a9b1393fd7f315eb4eb0dab001db5e3eb0c5ef" } as const;

export const L1: LayerSpec = {
  schemaVersion: "1.0",
  layer: "L1",
  namespace: "http://smart.who.int/kg/",
  source: "authored",
  note: "Authored, not generated. The ArchiMate model in smart-ig-starter-kit has no L1 layer, and extending it before this shape is proven would put a governance process in front of a draft. Every class and edge below is grounded in an artefact that exists today; the `grounding` field on each says which one. Nothing here is speculative vocabulary.",
  groundedIn: [
    {
      "what": "The citation format L1 references already use",
      "where": "smart-base input/dmn/DAK.DT.IMMZ.D2.DT.BCG.dmn",
      "detail": "The decision table declares an output column `References` whose description is literally \"Reference for the source content (L1)\", and each rule carries a free-text citation in its second annotationEntry, e.g. \"WHO recommendations for routine immunization – summary tables (March 2023) (1)\". L1 traceability already exists at DMN rule granularity — as an unresolvable string. Turning those strings into resolvable IRIs is the point of this graph."
    },
    {
      "what": "The bibliographic vocabulary already in use",
      "where": "smart-base input/fsh/models/DublinCore.fsh and HealthInterventions.fsh",
      "detail": "HealthInterventions carries `reference 1..* DublinCore`. Publication metadata below reuses Dublin Core terms rather than inventing a citation model."
    },
    {
      "what": "How WHO normative publications are already identified in this estate",
      "where": "smart-base input/fsh/codesystems/CDHIv2.fsh, CDSCv2.fsh",
      "detail": "Carries ISBN 978-92-4-008194-9, publisher, version and CC BY-NC-SA rights. A worked example of a normative WHO publication given machine-readable identity."
    },
    {
      "what": "An existing L1-ward link from a DAK component",
      "where": "smart-base input/fsh/models/ProgramIndicator.fsh",
      "detail": "`references 0..* id` — \"References to Health Intervention IDs providing additional context\"."
    }
  ],
  predicates: [
    {
      "predicate": "contains",
      "iri": "http://smart.who.int/kg/contains",
      "note": "Structural containment. A publication contains sections; a section contains recommendations."
    },
    {
      "predicate": "supersedes",
      "iri": "http://smart.who.int/kg/supersedes",
      "note": "This publication replaces that one. Guideline updates are the reason impact analysis matters."
    },
    {
      "predicate": "refines",
      "iri": "http://smart.who.int/kg/refines",
      "note": "A recommendation narrows or conditions another, rather than replacing it."
    },
    {
      "predicate": "hasPopulation",
      "iri": "http://smart.who.int/kg/hasPopulation",
      "note": "PICO."
    },
    {
      "predicate": "hasIntervention",
      "iri": "http://smart.who.int/kg/hasIntervention",
      "note": "PICO."
    },
    {
      "predicate": "hasComparator",
      "iri": "http://smart.who.int/kg/hasComparator",
      "note": "PICO."
    },
    {
      "predicate": "hasOutcome",
      "iri": "http://smart.who.int/kg/hasOutcome",
      "note": "PICO."
    },
    {
      "predicate": "supportedBy",
      "iri": "http://smart.who.int/kg/supportedBy",
      "note": "Recommendation to its body of evidence, carrying GRADE certainty."
    },
    {
      "predicate": "hasRemark",
      "iri": "http://smart.who.int/kg/hasRemark",
      "note": "Implementation consideration. Often the part a DAK author actually acts on."
    },
    {
      "predicate": "recommends",
      "iri": "http://smart.who.int/kg/recommends",
      "note": "A recommendation is about a health intervention. The hinge to L2."
    },
    {
      "predicate": "definedIn",
      "iri": "http://smart.who.int/kg/definedIn",
      "note": "A schedule or indicator is normatively defined in a publication."
    },
    {
      "predicate": "schedules",
      "iri": "http://smart.who.int/kg/schedules",
      "note": "A schedule entry prescribes when an intervention is delivered."
    },
    {
      "predicate": "measures",
      "iri": "http://smart.who.int/kg/measures",
      "note": "An indicator measures delivery of an intervention."
    },
    {
      "predicate": "derivedFrom",
      "iri": "http://smart.who.int/kg/derivedFrom",
      "note": "This normative content restates or operationalises that recommendation."
    },
    {
      "predicate": "crossReferences",
      "iri": "http://smart.who.int/kg/crossReferences",
      "note": "Names an external code. THE ONLY edge into terminology: it records that a code was cited, never what the code means. See the terminology-code class."
    },
    {
      "predicate": "classifiedAs",
      "iri": "http://smart.who.int/kg/classifiedAs",
      "note": "Placement in a WHO classification — CDHI for interventions. Also a cross-reference, kept separate because classification is an assertion about the thing, not a mention of a code."
    },
    {
      "predicate": "appearsIn",
      "iri": "http://smart.who.int/kg/appearsIn",
      "note": "A citation string appears in an L2 or L3 artefact at a stated location."
    },
    {
      "predicate": "resolvesTo",
      "iri": "http://smart.who.int/kg/resolvesTo",
      "note": "A citation string resolves to a publication or a recommendation. Almost always `inferred` or `decided`, never `derived` — matching a free-text citation is a judgement."
    },
    {
      "predicate": "implementedBy",
      "iri": "http://smart.who.int/kg/implementedBy",
      "note": "L1 content is implemented by an L2 or L3 artefact, addressed by canonical URL. The graph does not model the target's structure."
    }
  ],
  classes: [
    {
      id: "publication",
      name: "Publication",
      kind: "Source",
      iri: "http://smart.who.int/kg/publication",
      note: "A WHO normative publication: a guideline, guidance, recommendation summary, or classification. Metadata follows Dublin Core, which HealthInterventions already uses.",
      propertyNote: "publicationType distinguishes normative guideline from guidance from summary table — a summary table restates recommendations made elsewhere, and conflating the two makes provenance wrong. identifier holds ISBN/ISSN/DOI, as CDHIv2 already does. sha256 pins the PDF.",
      // The note says "Metadata follows Dublin Core, which HealthInterventions
      // already uses" — so the model DERIVES from smart-base's DublinCore and
      // adds only what Dublin Core lacks. Types follow DublinCore.fsh.
      parent: { name: "DublinCore", where: "smart-base input/fsh/models/DublinCore.fsh" },
      properties: {
        title: p.inherited(p.string("Title", "A name given to the resource")),
        creator: p.inherited(p.stringList("Creator", "An entity responsible for making the resource")),
        publisher: p.inherited(p.string("Publisher", "An entity responsible for making the resource available")),
        date: p.inherited(p.date("Date", "A point or period of time associated with an event in the lifecycle of the resource")),
        version: p.string("Version", "Edition or version, as printed."),
        identifier: p.inherited(p.stringList("Identifier", "An unambiguous reference to the resource within a given context")),
        language: p.inherited(p.string("Language", "A language of the resource")),
        rights: p.inherited(p.string("Rights", "Information about rights held in and over the resource")),
        url: p.uri("URL", "Where the publication is published."),
        sha256: p.sha256("SHA-256", "Hash of the PDF the extraction read; pins the source."),
        publicationType: p.code(PUBLICATION_TYPE, "Publication type", "Normative guideline, guidance, summary table or classification. Unset when the publication is none of these."),
      },
    },
    {
      id: "publication-section",
      name: "Publication section",
      kind: "Source",
      iri: "http://smart.who.int/kg/publication-section",
      note: "A chapter, annex or numbered section. Recommendations are located by section and page, which is what makes an extraction checkable.",
      properties: {
        heading: p.string("Heading", "The section heading, verbatim."),
        number: p.string("Number", "The section number as printed (\"1.2\", \"Annex 3\")."),
        pageRange: p.string("Page range", "PDF page or page range the section occupies (\"12-18\")."),
      },
    },
    {
      id: "recommendation",
      name: "Recommendation",
      kind: "Concept",
      iri: "http://smart.who.int/kg/recommendation",
      note: "The atomic normative statement. This is the node nothing in the WHO estate currently makes addressable.",
      propertyNote: "statement is a VERBATIM quote, never a paraphrase — a paraphrased recommendation is a new recommendation. strength is GRADE (strong | conditional); certainty is GRADE (high | moderate | low | very-low); conditionality records the 'in settings where…' qualifier that decides whether a DAK can adopt it unchanged.",
      properties: {
        identifier: p.string("Identifier", "The recommendation's label or number as printed."),
        statement: p.markdown("Statement", "The recommendation text, VERBATIM. A paraphrased recommendation is a new recommendation."),
        strength: p.code(GRADE_STRENGTH, "Strength", "GRADE strength, as stated in the source."),
        certainty: p.code(GRADE_CERTAINTY, "Certainty", "GRADE certainty of evidence, as stated in the source."),
        conditionality: p.string("Conditionality", "The 'in settings where…' qualifier, verbatim, that decides whether a DAK can adopt the recommendation unchanged."),
        status: p.string("Status", "The recommendation's standing in its publication (for example current or superseded), as stated."),
      },
    },
    {
      id: "remark",
      name: "Remark",
      kind: "Concept",
      iri: "http://smart.who.int/kg/remark",
      note: "An implementation consideration attached to a recommendation. Grounded: the BCG table's first annotationEntry carries exactly this — \"Neonates born to women of unknown HIV status should be vaccinated as the benefits…\" — clinical nuance that shapes the decision logic but is not the recommendation itself.",
      properties: {
        text: p.markdown("Text", "The implementation consideration, verbatim."),
      },
    },
    {
      id: "evidence",
      name: "Evidence",
      kind: "Concept",
      iri: "http://smart.who.int/kg/evidence",
      note: "The body of evidence behind a recommendation, with its GRADE certainty rating.",
      properties: {
        summary: p.markdown("Summary", "Summary of the body of evidence."),
        certainty: p.code(GRADE_CERTAINTY, "Certainty", "GRADE certainty of the body of evidence."),
        studyCount: p.unsignedInt("Study count", "Number of studies in the body of evidence."),
        citation: p.string("Citation", "Bibliographic citation of the evidence review."),
      },
    },
    {
      id: "population",
      name: "Population",
      kind: "Concept",
      iri: "http://smart.who.int/kg/population",
      note: "PICO P.",
      properties: {
        description: p.string("Description", "PICO population, as described in the source."),
        ageRange: p.string("Age range", "Age range of the population, as stated."),
        qualifier: p.string("Qualifier", "Further qualification of the population, as stated."),
      },
    },
    {
      id: "intervention",
      name: "Intervention",
      kind: "Concept",
      iri: "http://smart.who.int/kg/intervention",
      note: "PICO I. The clinical or public-health action, distinct from health-intervention, which is the DAK-facing component.",
      properties: {
        description: p.string("Description", "PICO intervention, as described in the source."),
      },
    },
    {
      id: "comparator",
      name: "Comparator",
      kind: "Concept",
      iri: "http://smart.who.int/kg/comparator",
      note: "PICO C. Frequently absent in WHO recommendations; absence is recorded rather than invented.",
      properties: {
        description: p.string("Description", "PICO comparator, as described in the source."),
      },
    },
    {
      id: "outcome",
      name: "Outcome",
      kind: "Concept",
      iri: "http://smart.who.int/kg/outcome",
      note: "PICO O.",
      properties: {
        description: p.string("Description", "PICO outcome, as described in the source."),
      },
    },
    {
      id: "health-intervention",
      name: "Health intervention",
      kind: "Concept",
      iri: "http://smart.who.int/kg/health-intervention",
      note: "What a recommendation is about, and the hinge to L2. Corresponds to the DAK component smart-base defines as HealthInterventions — today `id`, `description[x]` and `reference 1..* DublinCore`, i.e. a bibliographic citation with no recommendation behind it. This class is what that citation should resolve to.",
      correspondsTo: {
        name: "HealthInterventions",
        why: "identifier = HealthInterventions.id and description = HealthInterventions.description[x]; not a Parent because HealthInterventions requires reference 1..* DublinCore, which in the graph is an edge to a publication rather than a field",
      },
      properties: {
        identifier: p.string("Health Intervention ID", "An identifier for the health intervention"),
        name: p.string("Name", "Name of the health intervention, as listed."),
        description: p.markdown("Description", "Description of the health intervention"),
      },
    },
    {
      id: "schedule",
      name: "Schedule",
      kind: "Concept",
      iri: "http://smart.who.int/kg/schedule",
      note: "A normative delivery schedule. Grounded: the BCG table cites \"WHO recommendations for routine immunization – summary tables\", which IS a schedule publication — the single most-cited L1 source in the immunization DAK.",
      properties: {
        identifier: p.string("Identifier", "Identifier of the schedule, where the source gives one."),
        name: p.string("Name", "Name of the schedule (a summary table's title)."),
        scope: p.string("Scope", "Who or what the schedule covers, as stated."),
      },
    },
    {
      id: "schedule-entry",
      name: "Schedule entry",
      kind: "Concept",
      iri: "http://smart.who.int/kg/schedule-entry",
      note: "One row of a schedule: which intervention, for whom, when, how many doses. This is the granularity a decision table actually consumes — the BCG rules turn on dose count, age and interval since a live vaccine.",
      properties: {
        antigen: p.string("Antigen", "The antigen or vaccine the row is about."),
        doseNumber: p.string("Dose number", "Dose in the series as printed (\"1\", \"Booster 1\"). Text, because schedules label boosters rather than count them."),
        series: p.string("Series", "Primary series or booster series, as stated."),
        targetAge: p.string("Target age", "Age at which the dose is due, as stated."),
        minimumInterval: p.string("Minimum interval", "Minimum interval since the previous dose, as stated."),
        note: p.string("Note", "The row's footnote or remark, verbatim."),
      },
    },
    {
      id: "indicator",
      name: "Indicator",
      kind: "Concept",
      iri: "http://smart.who.int/kg/indicator",
      note: "A programme indicator defined normatively at L1. Distinct from the DAK's ProgramIndicator component, which is its L2 expression; that model already carries `references 0..* id` pointing at health intervention ids.",
      correspondsTo: {
        name: "ProgramIndicator",
        why: "same element names and types (markdown), identifier = ProgramIndicator.id; not a Parent because ProgramIndicator makes name, definition, numerator, denominator and disaggregation 1..1 and an L1 indicator is recorded with what its source states",
      },
      properties: {
        identifier: p.string("Indicator ID", "Identifier for the program indicator"),
        name: p.string("Name", "Name of the indicator"),
        definition: p.markdown("Definition", "Definition of what the indicator measures"),
        numerator: p.markdown("Numerator", "Description of the numerator calculation"),
        denominator: p.markdown("Denominator", "Description of the denominator calculation"),
        disaggregation: p.markdown("Disaggregation", "Description of how the indicator should be disaggregated"),
      },
    },
    {
      id: "terminology-code",
      name: "Terminology code",
      kind: "Reference",
      iri: "http://smart.who.int/kg/terminology-code",
      note: "A code in an external terminology — ICD-10, ICD-11, SNOMED CT, ATC, or a WHO classification such as CDHI. CROSS-REFERENCE ONLY. It records system, code and display, and asserts NOTHING about the terminology: no hierarchy, no subsumption, no synonyms, no post-coordination. The terminology has its own authority, its own release cycle and its own tooling, and a partial copy here would be wrong within one release. Resolve meaning against the terminology server, not against this graph.",
      // system, code, display, version ARE FHIR Coding's four elements, so the
      // model derives from Coding rather than restating it.
      parent: { name: "Coding", where: "FHIR R4 core datatype" },
      properties: {
        system: p.inherited(p.uri("System", "Identity of the terminology system")),
        code: p.inherited(p.string("Code", "Symbol in syntax defined by the system")),
        display: p.inherited(p.string("Display", "Representation defined by the system")),
        version: p.inherited(p.string("Version", "Version of the system - if relevant")),
      },
    },
    {
      id: "citation",
      name: "Citation",
      kind: "Reference",
      iri: "http://smart.who.int/kg/citation",
      note: "A citation string exactly as it appears in an L2 or L3 artefact, together with what it was resolved to. Grounded directly in the BCG table, where every rule's annotationEntry[1] reads \"WHO recommendations for routine immunization – summary tables (March 2023) (1)\" — a citation that no tool can currently follow. This class is where that string becomes a link, and where the fact that resolving it was a judgement gets recorded.",
      propertyNote: "text is verbatim. location is the artefact path plus the element id — e.g. the DMN rule id. numbering preserves the \"(1)\" back-reference into the source document's own bibliography. resolutionStatus is unresolved | resolved | ambiguous; ambiguous is a legitimate terminal state and must not be collapsed to resolved.",
      properties: {
        text: p.string("Text", "The citation string, VERBATIM as it appears in the citing artefact."),
        location: p.string("Location", "The citing artefact's path plus the element id (a DMN rule id, a page)."),
        numbering: p.string("Numbering", "The '(1)' back-reference into the citing document's own bibliography."),
        resolutionStatus: p.code(RESOLUTION_STATUS, "Resolution status", "unresolved | resolved | ambiguous. Ambiguous is a legitimate terminal state."),
      },
    },
    {
      id: "external-artifact",
      name: "External artefact",
      kind: "Reference",
      iri: "http://smart.who.int/kg/external-artifact",
      note: "An L2 or L3 artefact addressed by canonical URL — a BPMN process, a DMN decision table, a FHIR PlanDefinition. Deliberately opaque: it carries an IRI and a free-text kind, and this graph asserts nothing about its internal structure. That opacity is the boundary. The L2 and L3 subgraphs model those artefacts properly; L1 only needs to point.",
      properties: {
        iri: p.uri("IRI", "Canonical URL or IRI of the L2 or L3 artefact."),
        targetKind: p.string("Target kind", "What kind of artefact it is, free text (\"DMN decision table\", \"DAK component\")."),
        version: p.string("Version", "Version of the artefact, where known."),
      },
    },
  ],
  edges: [
    {
      "predicate": "contains",
      "source": "publication",
      "target": "publication-section"
    },
    {
      "predicate": "contains",
      "source": "publication-section",
      "target": "recommendation"
    },
    {
      "predicate": "contains",
      "source": "publication",
      "target": "recommendation",
      "qualifier": "unsectioned",
      "note": "A short publication may carry recommendations directly."
    },
    {
      "predicate": "supersedes",
      "source": "publication",
      "target": "publication"
    },
    {
      "predicate": "refines",
      "source": "recommendation",
      "target": "recommendation"
    },
    {
      "predicate": "hasPopulation",
      "source": "recommendation",
      "target": "population"
    },
    {
      "predicate": "hasIntervention",
      "source": "recommendation",
      "target": "intervention"
    },
    {
      "predicate": "hasComparator",
      "source": "recommendation",
      "target": "comparator"
    },
    {
      "predicate": "hasOutcome",
      "source": "recommendation",
      "target": "outcome"
    },
    {
      "predicate": "supportedBy",
      "source": "recommendation",
      "target": "evidence"
    },
    {
      "predicate": "hasRemark",
      "source": "recommendation",
      "target": "remark"
    },
    {
      "predicate": "recommends",
      "source": "recommendation",
      "target": "health-intervention"
    },
    {
      "predicate": "definedIn",
      "source": "schedule",
      "target": "publication"
    },
    {
      "predicate": "contains",
      "source": "schedule",
      "target": "schedule-entry"
    },
    {
      "predicate": "schedules",
      "source": "schedule-entry",
      "target": "health-intervention"
    },
    {
      "predicate": "derivedFrom",
      "source": "schedule-entry",
      "target": "recommendation"
    },
    {
      "predicate": "definedIn",
      "source": "indicator",
      "target": "publication"
    },
    {
      "predicate": "measures",
      "source": "indicator",
      "target": "health-intervention"
    },
    {
      "predicate": "derivedFrom",
      "source": "indicator",
      "target": "recommendation"
    },
    {
      "predicate": "crossReferences",
      "source": "recommendation",
      "target": "terminology-code"
    },
    {
      "predicate": "crossReferences",
      "source": "population",
      "target": "terminology-code"
    },
    {
      "predicate": "crossReferences",
      "source": "intervention",
      "target": "terminology-code"
    },
    {
      "predicate": "crossReferences",
      "source": "outcome",
      "target": "terminology-code"
    },
    {
      "predicate": "crossReferences",
      "source": "schedule-entry",
      "target": "terminology-code"
    },
    {
      "predicate": "crossReferences",
      "source": "indicator",
      "target": "terminology-code"
    },
    {
      "predicate": "crossReferences",
      "source": "health-intervention",
      "target": "terminology-code"
    },
    {
      "predicate": "classifiedAs",
      "source": "health-intervention",
      "target": "terminology-code",
      "qualifier": "CDHI"
    },
    {
      "predicate": "appearsIn",
      "source": "citation",
      "target": "external-artifact"
    },
    {
      "predicate": "resolvesTo",
      "source": "citation",
      "target": "publication"
    },
    {
      "predicate": "resolvesTo",
      "source": "citation",
      "target": "recommendation"
    },
    {
      "predicate": "resolvesTo",
      "source": "citation",
      "target": "schedule"
    },
    {
      "predicate": "implementedBy",
      "source": "recommendation",
      "target": "external-artifact"
    },
    {
      "predicate": "implementedBy",
      "source": "schedule-entry",
      "target": "external-artifact"
    },
    {
      "predicate": "implementedBy",
      "source": "indicator",
      "target": "external-artifact"
    },
    {
      "predicate": "implementedBy",
      "source": "health-intervention",
      "target": "external-artifact"
    }
  ],
};
