# Knowledge graph L1: Schedule - SMART Base v0.3.0

* [**Table of Contents**](toc.md)
* [**Artifacts Summary**](artifacts.md)
* **Knowledge graph L1: Schedule**

## Logical Model: Knowledge graph L1: Schedule 

| | |
| :--- | :--- |
| *Official URL*:http://smart.who.int/base/StructureDefinition/KGSchedule | *Version*:0.3.0 |
| Active as of 2026-10-06 | *Computable Name*:KGSchedule |

 
A normative delivery schedule. Grounded: the BCG table cites "WHO recommendations for routine immunization – summary tables", which IS a schedule publication — the single most-cited L1 source in the immunization DAK. Class IRI: http://smart.who.int/kg/schedule. 

**Usages:**

* This Logical Model is not used by any profiles in this Specification

You can also check for [usages in the FHIR IG Statistics](https://packages2.fhir.org/xig/resource/smart.who.int.base|current/StructureDefinition/StructureDefinition-KGSchedule.json)

### Formal Views of Profile Content

 [Description of Profiles, Differentials, Snapshots and how the different presentations work](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#structure-definitions). 

 

Other representations of profile: [CSV](StructureDefinition-KGSchedule.csv), [Excel](StructureDefinition-KGSchedule.xlsx) 



## Resource Content

```json
{
  "resourceType" : "StructureDefinition",
  "id" : "KGSchedule",
  "url" : "http://smart.who.int/base/StructureDefinition/KGSchedule",
  "version" : "0.3.0",
  "name" : "KGSchedule",
  "title" : "Knowledge graph L1: Schedule",
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
  "description" : "A normative delivery schedule. Grounded: the BCG table cites \"WHO recommendations for routine immunization – summary tables\", which IS a schedule publication — the single most-cited L1 source in the immunization DAK. Class IRI: http://smart.who.int/kg/schedule.",
  "fhirVersion" : "4.0.1",
  "kind" : "logical",
  "abstract" : false,
  "type" : "http://smart.who.int/base/StructureDefinition/KGSchedule",
  "baseDefinition" : "http://hl7.org/fhir/StructureDefinition/Base",
  "derivation" : "specialization",
  "differential" : {
    "element" : [{
      "id" : "KGSchedule",
      "path" : "KGSchedule",
      "short" : "Knowledge graph L1: Schedule",
      "definition" : "A normative delivery schedule. Grounded: the BCG table cites \"WHO recommendations for routine immunization – summary tables\", which IS a schedule publication — the single most-cited L1 source in the immunization DAK. Class IRI: http://smart.who.int/kg/schedule."
    },
    {
      "id" : "KGSchedule.identifier",
      "path" : "KGSchedule.identifier",
      "short" : "Identifier",
      "definition" : "Identifier of the schedule, where the source gives one.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    },
    {
      "id" : "KGSchedule.name",
      "path" : "KGSchedule.name",
      "short" : "Name",
      "definition" : "Name of the schedule (a summary table's title).",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    },
    {
      "id" : "KGSchedule.scope",
      "path" : "KGSchedule.scope",
      "short" : "Scope",
      "definition" : "Who or what the schedule covers, as stated.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    }]
  }
}

```
