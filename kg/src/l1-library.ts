/**
 * L1 bound to the library it is read from — an extension layer over L1 3.0.
 *
 * Owner rulings, 2026-10-07 (folio-assistant session on the immunizations L1
 * library), which this layer encodes:
 *
 * 1. **Layering: every layer points only upstream.** L3 → L2 → L1 → library.
 *    The library — the ingested source document, its sections and blocks — is
 *    upstream of L1, so L1 MAY point at it; L1 never points down at L2 or L3.
 *    This refines 3.0's "nothing in L1 points out of L1", which was written
 *    before the library was a layer: the downstream half of it stands.
 *
 * 2. **L1's layout classes specialise the library's.** A `publication` IS a
 *    library source document, a `publication-section` IS a library section,
 *    and a `publication-element` IS a library block, each with L1's extra
 *    properties. Whatever sectioning strategy the library adopts — pages, an
 *    outline, a consensus TOC — L1 inherits it rather than inventing its own.
 *    Two levels:
 *      - class: `rdfs:subClassOf` ({@link SPECIALISES}), emitted as JSON-LD;
 *      - instance: `specializationOf` (PROV, "shares all aspects of the latter,
 *        and additionally presents more specific aspects") from each L1 layout
 *        node to the library node it specialises. L1 keeps smart-kg's IRIs
 *        (3.0 `iriPattern`), the library keeps its own, and the edge is what
 *        makes them one thing in two vocabularies — without `owl:sameAs`,
 *        which would merge every statement about both.
 *
 * 3. **A source the library holds but that is not L1** (a DAK, a technical
 *    specification) is still a resolution target: a DAK's reference entry
 *    resolves upstream to its library node rather than staying unresolved.
 *
 * The extension lives here, beside the migrated 3.0 layer and not inside it, so
 * `generated/l1/l1.json` stays equal to WHO's and this can be proposed to
 * smart-kg as its own layer. A document that uses it names
 * `l1-library.context.jsonld`; smart-kg's `validate.mjs` cannot check such a
 * document until the layer is upstream, and `validate.ts` here can.
 */
import type { LayerSpec } from "./ontology.ts";
import { p } from "./props.ts";

export const LAYERING_RULE =
  "Every layer points only upstream: L3 → L2 → L1 → library (the ingested source document, its sections and blocks). " +
  "A layer may point at any layer above it and never at one below it.";

/** folio-assistant's namespaces, from its `cat-harness/code-lists/own-namespaces.json` and `schemas/jsonld.ts`. */
export const CAT_HARNESS_NS = "https://litlfred.github.io/cat-harness/0.1.0/ns#";
export const DOCO_NS = "http://purl.org/spar/doco/";
export const PROV_NS = "http://www.w3.org/ns/prov#";

/** Class-level specialisation: each L1 layout class and the library class it specialises. */
export const SPECIALISES: readonly { l1: string; library: string; note: string }[] = [
  { l1: "publication", library: `${CAT_HARNESS_NS}SourceDocument`, note: "The library's ingested source document; L1 adds publicationType, grcStatus, identifiers, reviewBy." },
  { l1: "publication-section", library: `${DOCO_NS}Section`, note: "Whatever section the library's ingest cut — page, outline or consensus TOC; L1 adds number and ordinal." },
  { l1: "publication-element", library: `${CAT_HARNESS_NS}Block`, note: "A library block; L1 adds elementType, rowType, columns, columnMap and cells." },
];

/**
 * `publication-element` by element type → the narrower library class, where
 * DoCO (which the library already uses) has one. Types without one stay
 * `cat-harness:Block`; none is invented.
 */
export const ELEMENT_TYPE_CLASS: Readonly<Record<string, string>> = {
  table: `${DOCO_NS}Table`,
  figure: `${DOCO_NS}Figure`,
  footnote: `${DOCO_NS}Footnote`,
  list: `${DOCO_NS}List`,
  box: `${DOCO_NS}TextBox`,
};

export const L1_LIBRARY: LayerSpec = {
  schemaVersion: "3.0",
  layer: "l1-library",
  namespace: "http://smart.who.int/kg/",
  source: "authored",
  note: `${LAYERING_RULE} This layer adds what L1 needs to point at the library above it: one opaque upstream class and PROV's specializationOf. It imports L1 3.0 unchanged.`,
  imports: ["l1"],
  groundedIn: [
    {
      what: "The library a WHO SMART Guidelines DAK is built from",
      where: "folio-assistant library entries (structure.json, manifest.jsonld, blocks/*.jsonld)",
      detail: "Every L1 source is ingested into a library first; its sections and blocks exist, with their own IRIs, before any L1 node is minted from them.",
    },
    {
      what: "Owner ruling on layering and specialisation",
      where: "folio-assistant session, 2026-10-07",
      detail: "'Library is upstream to L1. L1 can point upstream but not downstream.' and 'the publication -> publication section -> publication element should inherit parent classes and specialize them to be the L1 kind with some extra properties.'",
    },
  ],
  valueSets: [],
  predicates: [
    {
      predicate: "specializationOf",
      iri: `${PROV_NS}specializationOf`,
      note: "An L1 layout node to the library node it specialises: the same printed thing, with L1's more specific aspects. Upstream only.",
    },
  ],
  classes: [
    {
      id: "library-node",
      name: "Library node",
      kind: "Reference",
      iri: "http://smart.who.int/kg/library-node",
      note: "A node in the ingested library L1 is read from: a source document, a section or a block, addressed by the library's own IRI. Opaque, as L1 asserts nothing about the library's internal model; the library is upstream, so pointing at it keeps the layering rule.",
      properties: {
        iri: p.uri("IRI", "The library node's own IRI."),
        libraryClass: p.uri("Library class", "The library class it is an instance of (cat-harness:SourceDocument, doco:Section, cat-harness:Block, …)."),
        entry: p.string("Entry", "The library entry it belongs to (e.g. 9789240016514-eng)."),
        pageRange: p.string("Page range", "Physical pages it covers, where it is a section or block."),
      },
      minDerivation: "derived",
    },
  ],
  edges: [
    { predicate: "specializationOf", source: "publication", target: "library-node", minDerivation: "derived" },
    { predicate: "specializationOf", source: "publication-section", target: "library-node", minDerivation: "derived" },
    { predicate: "specializationOf", source: "publication-element", target: "library-node", minDerivation: "inferred", note: "An element is cut from a library block by reading its layout; one element may span several blocks (a table over two pages), so this edge may repeat." },
    { predicate: "resolvesTo", source: "reference-entry", target: "library-node", minDerivation: "inferred", note: "A reference to a source the library holds that is not an L1 publication." },
    { predicate: "resolvesTo", source: "citation", target: "library-node", minDerivation: "inferred", note: "As for reference-entry." },
  ],
};
