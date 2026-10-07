# Knowledge graph L1: Comparator - SMART Base v0.3.0

* [**Table of Contents**](toc.md)
* [**Artifacts Summary**](artifacts.md)
* **Knowledge graph L1: Comparator**

## Logical Model: Knowledge graph L1: Comparator 

| | |
| :--- | :--- |
| *Official URL*:http://smart.who.int/base/StructureDefinition/KGComparator | *Version*:0.3.0 |
| Active as of 2026-10-06 | *Computable Name*:KGComparator |

 
PICO C. Frequently absent in WHO recommendations; absence is recorded rather than invented. Class IRI: http://smart.who.int/kg/comparator. 

**Usages:**

* This Logical Model is not used by any profiles in this Specification

You can also check for [usages in the FHIR IG Statistics](https://packages2.fhir.org/xig/resource/smart.who.int.base|current/StructureDefinition/StructureDefinition-KGComparator.json)

### Formal Views of Profile Content

 [Description of Profiles, Differentials, Snapshots and how the different presentations work](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#structure-definitions). 

 

Other representations of profile: [CSV](StructureDefinition-KGComparator.csv), [Excel](StructureDefinition-KGComparator.xlsx) 



## Resource Content

```json
{
  "resourceType" : "StructureDefinition",
  "id" : "KGComparator",
  "url" : "http://smart.who.int/base/StructureDefinition/KGComparator",
  "version" : "0.3.0",
  "name" : "KGComparator",
  "title" : "Knowledge graph L1: Comparator",
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
  "description" : "PICO C. Frequently absent in WHO recommendations; absence is recorded rather than invented. Class IRI: http://smart.who.int/kg/comparator.",
  "fhirVersion" : "4.0.1",
  "kind" : "logical",
  "abstract" : false,
  "type" : "http://smart.who.int/base/StructureDefinition/KGComparator",
  "baseDefinition" : "http://hl7.org/fhir/StructureDefinition/Base",
  "derivation" : "specialization",
  "differential" : {
    "element" : [{
      "id" : "KGComparator",
      "path" : "KGComparator",
      "short" : "Knowledge graph L1: Comparator",
      "definition" : "PICO C. Frequently absent in WHO recommendations; absence is recorded rather than invented. Class IRI: http://smart.who.int/kg/comparator."
    },
    {
      "id" : "KGComparator.description",
      "path" : "KGComparator.description",
      "short" : "Description",
      "definition" : "PICO comparator, as described in the source.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    }]
  }
}

```
