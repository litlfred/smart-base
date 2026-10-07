# Knowledge graph L1: Population - SMART Base v0.3.0

* [**Table of Contents**](toc.md)
* [**Artifacts Summary**](artifacts.md)
* **Knowledge graph L1: Population**

## Logical Model: Knowledge graph L1: Population 

| | |
| :--- | :--- |
| *Official URL*:http://smart.who.int/base/StructureDefinition/KGPopulation | *Version*:0.3.0 |
| Active as of 2026-10-06 | *Computable Name*:KGPopulation |

 
PICO P. Class IRI: http://smart.who.int/kg/population. 

**Usages:**

* This Logical Model is not used by any profiles in this Specification

You can also check for [usages in the FHIR IG Statistics](https://packages2.fhir.org/xig/resource/smart.who.int.base|current/StructureDefinition/StructureDefinition-KGPopulation.json)

### Formal Views of Profile Content

 [Description of Profiles, Differentials, Snapshots and how the different presentations work](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#structure-definitions). 

 

Other representations of profile: [CSV](StructureDefinition-KGPopulation.csv), [Excel](StructureDefinition-KGPopulation.xlsx) 



## Resource Content

```json
{
  "resourceType" : "StructureDefinition",
  "id" : "KGPopulation",
  "url" : "http://smart.who.int/base/StructureDefinition/KGPopulation",
  "version" : "0.3.0",
  "name" : "KGPopulation",
  "title" : "Knowledge graph L1: Population",
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
  "description" : "PICO P. Class IRI: http://smart.who.int/kg/population.",
  "fhirVersion" : "4.0.1",
  "kind" : "logical",
  "abstract" : false,
  "type" : "http://smart.who.int/base/StructureDefinition/KGPopulation",
  "baseDefinition" : "http://hl7.org/fhir/StructureDefinition/Base",
  "derivation" : "specialization",
  "differential" : {
    "element" : [{
      "id" : "KGPopulation",
      "path" : "KGPopulation",
      "short" : "Knowledge graph L1: Population",
      "definition" : "PICO P. Class IRI: http://smart.who.int/kg/population."
    },
    {
      "id" : "KGPopulation.description",
      "path" : "KGPopulation.description",
      "short" : "Description",
      "definition" : "PICO population, as described in the source.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    },
    {
      "id" : "KGPopulation.ageRange",
      "path" : "KGPopulation.ageRange",
      "short" : "Age range",
      "definition" : "Age range of the population, as stated.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    },
    {
      "id" : "KGPopulation.qualifier",
      "path" : "KGPopulation.qualifier",
      "short" : "Qualifier",
      "definition" : "Further qualification of the population, as stated.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    }]
  }
}

```
