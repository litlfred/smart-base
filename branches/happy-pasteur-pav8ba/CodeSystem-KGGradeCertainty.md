# Knowledge graph: GRADE certainty of evidence - SMART Base v0.3.0

* [**Table of Contents**](toc.md)
* [**Artifacts Summary**](artifacts.md)
* **Knowledge graph: GRADE certainty of evidence**

## CodeSystem: Knowledge graph: GRADE certainty of evidence 

| | |
| :--- | :--- |
| *Official URL*:http://smart.who.int/base/CodeSystem/KGGradeCertainty | *Version*:0.3.0 |
| Active as of 2026-10-06 | *Computable Name*:KGGradeCertainty |

 
The four levels of certainty GRADE assigns to a BODY of evidence for one outcome — never to a single citation. Randomised trials start at high and observational studies at low, before rating down or up. Moved from smart-kg/methodologies/grade.md by bean wg7r, 2026-09-24 (owner: 'needs to be part of skill/SKOS'). Read with the `grade` skill. Source: folio-assistant cat-harness/code-lists/grade-certainty.json (bean wg7r), codes and definitions verbatim; Balshem H, et al. GRADE guidelines: 3. Rating the quality of evidence. J Clin Epidemiol 2011;64(4):401-406 [https://doi.org/10.1016/j.jclinepi.2010.07.015](https://doi.org/10.1016/j.jclinepi.2010.07.015). 

 This Code system is referenced in the content logical definition of the following value sets: 

* [Knowledge graph: GRADE certainty of evidence](ValueSet-KGGradeCertaintyVS.md)



## Resource Content

```json
{
  "resourceType" : "CodeSystem",
  "id" : "KGGradeCertainty",
  "url" : "http://smart.who.int/base/CodeSystem/KGGradeCertainty",
  "version" : "0.3.0",
  "name" : "KGGradeCertainty",
  "title" : "Knowledge graph: GRADE certainty of evidence",
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
  "description" : "The four levels of certainty GRADE assigns to a BODY of evidence for one outcome — never to a single citation. Randomised trials start at high and observational studies at low, before rating down or up. Moved from smart-kg/methodologies/grade.md by bean wg7r, 2026-09-24 (owner: 'needs to be part of skill/SKOS'). Read with the `grade` skill. Source: folio-assistant cat-harness/code-lists/grade-certainty.json (bean wg7r), codes and definitions verbatim; Balshem H, et al. GRADE guidelines: 3. Rating the quality of evidence. J Clin Epidemiol 2011;64(4):401-406 <https://doi.org/10.1016/j.jclinepi.2010.07.015>.",
  "caseSensitive" : true,
  "content" : "complete",
  "count" : 4,
  "concept" : [{
    "code" : "high",
    "display" : "High",
    "definition" : "We are very confident that the true effect lies close to the estimate of the effect."
  },
  {
    "code" : "moderate",
    "display" : "Moderate",
    "definition" : "We are moderately confident in the effect estimate: the true effect is likely to be close to it, but there is a possibility that it is substantially different."
  },
  {
    "code" : "low",
    "display" : "Low",
    "definition" : "Our confidence in the effect estimate is limited: the true effect may be substantially different from it."
  },
  {
    "code" : "very-low",
    "display" : "Very low",
    "definition" : "We have very little confidence in the effect estimate: the true effect is likely to be substantially different from it. Not the same finding as 'could not determine' — absent evidence is a gap, not a grade."
  }]
}

```
