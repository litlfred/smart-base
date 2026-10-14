# Knowledge graph: GRADE recommendation strength - SMART Base v0.3.0

* [**Table of Contents**](toc.md)
* [**Artifacts Summary**](artifacts.md)
* **Knowledge graph: GRADE recommendation strength**

## CodeSystem: Knowledge graph: GRADE recommendation strength 

| | |
| :--- | :--- |
| *Official URL*:http://smart.who.int/base/CodeSystem/KGGradeStrength | *Version*:0.3.0 |
| Active as of 2026-10-06 | *Computable Name*:KGGradeStrength |

 
How strongly a recommendation is made. Strength is NOT certainty: a strong recommendation can rest on low-certainty evidence and a conditional one on high certainty. Moved from smart-kg/methodologies/grade.md by bean wg7r, 2026-09-24 (owner: 'needs to be part of skill/SKOS'). Read with the `grade` skill. Source: folio-assistant cat-harness/code-lists/grade-recommendation-strength.json (bean wg7r), codes and definitions verbatim; Andrews JC, et al. GRADE guidelines: 15. Going from evidence to recommendation — determinants of a recommendation's direction and strength. J Clin Epidemiol 2013;66(7):726-735; WHO Handbook for Guideline Development, 2nd ed. (2014), which uses 'conditional' for GRADE's 'weak' [https://doi.org/10.1016/j.jclinepi.2013.02.003](https://doi.org/10.1016/j.jclinepi.2013.02.003). 

 This Code system is referenced in the content logical definition of the following value sets: 

* [Knowledge graph: GRADE recommendation strength](ValueSet-KGGradeStrengthVS.md)



## Resource Content

```json
{
  "resourceType" : "CodeSystem",
  "id" : "KGGradeStrength",
  "url" : "http://smart.who.int/base/CodeSystem/KGGradeStrength",
  "version" : "0.3.0",
  "name" : "KGGradeStrength",
  "title" : "Knowledge graph: GRADE recommendation strength",
  "status" : "active",
  "experimental" : false,
  "date" : "2026-10-06T10:56:46+00:00",
  "publisher" : "WHO",
  "contact" : [{
    "name" : "WHO",
    "telecom" : [{
      "system" : "url",
      "value" : "http://who.int"
    }]
  }],
  "description" : "How strongly a recommendation is made. Strength is NOT certainty: a strong recommendation can rest on low-certainty evidence and a conditional one on high certainty. Moved from smart-kg/methodologies/grade.md by bean wg7r, 2026-09-24 (owner: 'needs to be part of skill/SKOS'). Read with the `grade` skill. Source: folio-assistant cat-harness/code-lists/grade-recommendation-strength.json (bean wg7r), codes and definitions verbatim; Andrews JC, et al. GRADE guidelines: 15. Going from evidence to recommendation — determinants of a recommendation's direction and strength. J Clin Epidemiol 2013;66(7):726-735; WHO Handbook for Guideline Development, 2nd ed. (2014), which uses 'conditional' for GRADE's 'weak' <https://doi.org/10.1016/j.jclinepi.2013.02.003>.",
  "caseSensitive" : true,
  "content" : "complete",
  "count" : 2,
  "concept" : [{
    "code" : "strong",
    "display" : "Strong",
    "definition" : "The guideline panel is confident that the desirable effects of following the recommendation clearly outweigh the undesirable effects — or clearly do not, for a recommendation against — so most informed people would choose the recommended course."
  },
  {
    "code" : "conditional",
    "display" : "Conditional",
    "definition" : "The desirable effects probably outweigh the undesirable effects, but the panel is less confident: the balance is close, the evidence uncertain, or values and preferences vary, so different choices will suit different people or settings. GRADE's 'weak'; WHO uses 'conditional'."
  }]
}

```
