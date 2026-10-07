# Knowledge graph L1: Intervention - SMART Base v0.3.0

* [**Table of Contents**](toc.md)
* [**Artifacts Summary**](artifacts.md)
* **Knowledge graph L1: Intervention**

## Logical Model: Knowledge graph L1: Intervention 

| | |
| :--- | :--- |
| *Official URL*:http://smart.who.int/base/StructureDefinition/KGIntervention | *Version*:0.3.0 |
| Active as of 2026-10-06 | *Computable Name*:KGIntervention |

 
PICO I. The clinical or public-health action, distinct from health-intervention, which is the DAK-facing component. Class IRI: http://smart.who.int/kg/intervention. 

**Usages:**

* This Logical Model is not used by any profiles in this Specification

You can also check for [usages in the FHIR IG Statistics](https://packages2.fhir.org/xig/resource/smart.who.int.base|current/StructureDefinition/StructureDefinition-KGIntervention.json)

### Formal Views of Profile Content

 [Description of Profiles, Differentials, Snapshots and how the different presentations work](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#structure-definitions). 

 

Other representations of profile: [CSV](StructureDefinition-KGIntervention.csv), [Excel](StructureDefinition-KGIntervention.xlsx) 



## Resource Content

```json
{
  "resourceType" : "StructureDefinition",
  "id" : "KGIntervention",
  "url" : "http://smart.who.int/base/StructureDefinition/KGIntervention",
  "version" : "0.3.0",
  "name" : "KGIntervention",
  "title" : "Knowledge graph L1: Intervention",
  "status" : "active",
  "date" : "2026-10-06T10:56:46+00:00",
  "publisher" : "WHO",
  "contact" : [{
    "name" : "WHO",
    "telecom" : [{
      "system" : "url",
      "value" : "http://who.int"
    }]
  }],
  "description" : "PICO I. The clinical or public-health action, distinct from health-intervention, which is the DAK-facing component. Class IRI: http://smart.who.int/kg/intervention.",
  "fhirVersion" : "4.0.1",
  "kind" : "logical",
  "abstract" : false,
  "type" : "http://smart.who.int/base/StructureDefinition/KGIntervention",
  "baseDefinition" : "http://hl7.org/fhir/StructureDefinition/Base",
  "derivation" : "specialization",
  "differential" : {
    "element" : [{
      "id" : "KGIntervention",
      "path" : "KGIntervention",
      "short" : "Knowledge graph L1: Intervention",
      "definition" : "PICO I. The clinical or public-health action, distinct from health-intervention, which is the DAK-facing component. Class IRI: http://smart.who.int/kg/intervention."
    },
    {
      "id" : "KGIntervention.description",
      "path" : "KGIntervention.description",
      "short" : "Description",
      "definition" : "PICO intervention, as described in the source.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    }]
  }
}

```
