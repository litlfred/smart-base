/**
 * The closed code lists of the knowledge-graph schema.
 *
 * Each list is declared ONCE, here, and three things are generated from it:
 * the Zod enum a document is checked with, the FSH CodeSystem + ValueSet the
 * FHIR toolchain builds, and the `enum` in the emitted JSON Schema. Before the
 * migration the same lists lived as prose in smart-kg (`propertyNote` strings
 * and the shape file's `derivation` enum), which a checker could not read and
 * a FHIR tool could not bind to.
 *
 * Every code carries its definition. A code list a reviewer cannot read the
 * meaning of is a list of strings.
 *
 * REUSE before invention: the two GRADE lists are folio-assistant's
 * `cat-harness/code-lists/grade-*.json` (bean wg7r, which moved them out of
 * smart-kg's methodology notes), copied with their codes, labels, definitions
 * and citations unchanged. Only the lists nothing yet defines — derivation,
 * resolution status, publication type — are authored here.
 */
import { z } from "zod";

export interface Code {
  code: string;
  display: string;
  definition: string;
}

export interface CodeList {
  /** FSH name of the CodeSystem and of its all-codes ValueSet. */
  name: string;
  title: string;
  description: string;
  /** Where the list came from in smart-kg, so a reviewer can check the migration. */
  source: string;
  codes: readonly Code[];
}

const list = <const C extends readonly Code[]>(l: Omit<CodeList, "codes"> & { codes: C }) => l;

export const DERIVATION = list({
  name: "KGDerivation",
  title: "Knowledge graph: derivation",
  description:
    "How a node or edge of a SMART Guidelines knowledge graph came to be. Every node and edge is exactly one of the three, and `decided` is the one a reviewer needs to find.",
  source: "smart-kg shapes/recommendation-graph.schema.json $defs.derivation",
  codes: [
    { code: "derived", display: "Derived", definition: "Mechanically produced, no choice involved." },
    { code: "inferred", display: "Inferred", definition: "A rule that could reasonably have gone another way." },
    { code: "decided", display: "Decided", definition: "The source is silent and someone chose." },
  ],
});

export const RESOLUTION_STATUS = list({
  name: "KGResolutionStatus",
  title: "Knowledge graph: resolution status",
  description:
    "Whether a citation string, or a cross-format join, was matched to the thing it names. `ambiguous` is a legitimate terminal state and must not be collapsed to `resolved`.",
  source: "smart-kg ontology/l1/l1.json class citation propertyNote; tools/validate.mjs RESOLVABLE",
  codes: [
    { code: "unresolved", display: "Unresolved", definition: "Not matched to anything. The honest default." },
    { code: "resolved", display: "Resolved", definition: "Matched to exactly one target, with evidence for the match." },
    { code: "ambiguous", display: "Ambiguous", definition: "More than one target fits and none can be preferred from the source." },
  ],
});

export const GRADE_STRENGTH = list({
  name: "KGGradeStrength",
  title: "Knowledge graph: GRADE recommendation strength",
  description: "How strongly a recommendation is made. Strength is NOT certainty: a strong recommendation can rest on low-certainty evidence and a conditional one on high certainty. Moved from smart-kg/methodologies/grade.md by bean wg7r, 2026-09-24 (owner: 'needs to be part of skill/SKOS'). Read with the `grade` skill.",
  source: "folio-assistant cat-harness/code-lists/grade-recommendation-strength.json (bean wg7r), codes and definitions verbatim; Andrews JC, et al. GRADE guidelines: 15. Going from evidence to recommendation — determinants of a recommendation's direction and strength. J Clin Epidemiol 2013;66(7):726-735; WHO Handbook for Guideline Development, 2nd ed. (2014), which uses 'conditional' for GRADE's 'weak' <https://doi.org/10.1016/j.jclinepi.2013.02.003>",
  codes: [
    { code: "strong", display: "Strong", definition: "The guideline panel is confident that the desirable effects of following the recommendation clearly outweigh the undesirable effects — or clearly do not, for a recommendation against — so most informed people would choose the recommended course." },
    { code: "conditional", display: "Conditional", definition: "The desirable effects probably outweigh the undesirable effects, but the panel is less confident: the balance is close, the evidence uncertain, or values and preferences vary, so different choices will suit different people or settings. GRADE's 'weak'; WHO uses 'conditional'." },
  ],
});

export const GRADE_CERTAINTY = list({
  name: "KGGradeCertainty",
  title: "Knowledge graph: GRADE certainty of evidence",
  description: "The four levels of certainty GRADE assigns to a BODY of evidence for one outcome — never to a single citation. Randomised trials start at high and observational studies at low, before rating down or up. Moved from smart-kg/methodologies/grade.md by bean wg7r, 2026-09-24 (owner: 'needs to be part of skill/SKOS'). Read with the `grade` skill.",
  source: "folio-assistant cat-harness/code-lists/grade-certainty.json (bean wg7r), codes and definitions verbatim; Balshem H, et al. GRADE guidelines: 3. Rating the quality of evidence. J Clin Epidemiol 2011;64(4):401-406 <https://doi.org/10.1016/j.jclinepi.2010.07.015>",
  codes: [
    { code: "high", display: "High", definition: "We are very confident that the true effect lies close to the estimate of the effect." },
    { code: "moderate", display: "Moderate", definition: "We are moderately confident in the effect estimate: the true effect is likely to be close to it, but there is a possibility that it is substantially different." },
    { code: "low", display: "Low", definition: "Our confidence in the effect estimate is limited: the true effect may be substantially different from it." },
    { code: "very-low", display: "Very low", definition: "We have very little confidence in the effect estimate: the true effect is likely to be substantially different from it. Not the same finding as 'could not determine' — absent evidence is a gap, not a grade." },
  ],
});

export const PUBLICATION_TYPE = list({
  name: "KGPublicationType",
  title: "Knowledge graph: publication type",
  description:
    "What kind of normative publication an L1 publication is. A summary table restates recommendations made elsewhere, and conflating it with a guideline makes provenance wrong. A publication that is none of these (a data portal, a reporting form) leaves the property unset rather than being forced into one.",
  source:
    "smart-kg ontology/l1/l1.json class publication note ('a guideline, guidance, recommendation summary, or classification') and propertyNote",
  codes: [
    { code: "guideline", display: "Guideline", definition: "A normative WHO guideline: it makes recommendations." },
    { code: "guidance", display: "Guidance", definition: "Guidance that operationalises recommendations without making new ones." },
    { code: "summary-table", display: "Summary table", definition: "A summary that restates recommendations made elsewhere." },
    { code: "classification", display: "Classification", definition: "A classification, such as the Classification of Digital Health Interventions." },
  ],
});

/** Every closed list, in the order the FSH is emitted. */
export const CODE_LISTS: readonly CodeList[] = [DERIVATION, RESOLUTION_STATUS, GRADE_STRENGTH, GRADE_CERTAINTY, PUBLICATION_TYPE];

/** A Zod enum over a list's codes. */
export function enumOf<L extends { codes: readonly Code[] }>(l: L) {
  const codes = l.codes.map((c) => c.code) as [L["codes"][number]["code"], ...L["codes"][number]["code"][]];
  return z.enum(codes);
}
