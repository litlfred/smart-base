# Knowledge graph L1: Schedule entry - SMART Base v0.3.0

* [**Table of Contents**](toc.md)
* [**Artifacts Summary**](artifacts.md)
* **Knowledge graph L1: Schedule entry**

## Logical Model: Knowledge graph L1: Schedule entry 

| | |
| :--- | :--- |
| *Official URL*:http://smart.who.int/base/StructureDefinition/KGScheduleEntry | *Version*:0.3.0 |
| Active as of 2026-10-06 | *Computable Name*:KGScheduleEntry |

 
One row of a schedule: which intervention, for whom, when, how many doses. This is the granularity a decision table actually consumes — the BCG rules turn on dose count, age and interval since a live vaccine. Class IRI: http://smart.who.int/kg/schedule-entry. 

**Usages:**

* This Logical Model is not used by any profiles in this Specification

You can also check for [usages in the FHIR IG Statistics](https://packages2.fhir.org/xig/resource/smart.who.int.base|current/StructureDefinition/StructureDefinition-KGScheduleEntry.json)

### Formal Views of Profile Content

 [Description of Profiles, Differentials, Snapshots and how the different presentations work](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#structure-definitions). 

 

Other representations of profile: [CSV](StructureDefinition-KGScheduleEntry.csv), [Excel](StructureDefinition-KGScheduleEntry.xlsx) 



## Resource Content

```json
{
  "resourceType" : "StructureDefinition",
  "id" : "KGScheduleEntry",
  "url" : "http://smart.who.int/base/StructureDefinition/KGScheduleEntry",
  "version" : "0.3.0",
  "name" : "KGScheduleEntry",
  "title" : "Knowledge graph L1: Schedule entry",
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
  "description" : "One row of a schedule: which intervention, for whom, when, how many doses. This is the granularity a decision table actually consumes — the BCG rules turn on dose count, age and interval since a live vaccine. Class IRI: http://smart.who.int/kg/schedule-entry.",
  "fhirVersion" : "4.0.1",
  "kind" : "logical",
  "abstract" : false,
  "type" : "http://smart.who.int/base/StructureDefinition/KGScheduleEntry",
  "baseDefinition" : "http://hl7.org/fhir/StructureDefinition/Base",
  "derivation" : "specialization",
  "differential" : {
    "element" : [{
      "id" : "KGScheduleEntry",
      "path" : "KGScheduleEntry",
      "short" : "Knowledge graph L1: Schedule entry",
      "definition" : "One row of a schedule: which intervention, for whom, when, how many doses. This is the granularity a decision table actually consumes — the BCG rules turn on dose count, age and interval since a live vaccine. Class IRI: http://smart.who.int/kg/schedule-entry."
    },
    {
      "id" : "KGScheduleEntry.antigen",
      "path" : "KGScheduleEntry.antigen",
      "short" : "Antigen",
      "definition" : "The antigen or vaccine the row is about.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    },
    {
      "id" : "KGScheduleEntry.doseNumber",
      "path" : "KGScheduleEntry.doseNumber",
      "short" : "Dose number",
      "definition" : "Dose in the series as printed (\"1\", \"Booster 1\"). Text, because schedules label boosters rather than count them.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    },
    {
      "id" : "KGScheduleEntry.series",
      "path" : "KGScheduleEntry.series",
      "short" : "Series",
      "definition" : "Primary series or booster series, as stated.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    },
    {
      "id" : "KGScheduleEntry.targetAge",
      "path" : "KGScheduleEntry.targetAge",
      "short" : "Target age",
      "definition" : "Age at which the dose is due, as stated.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    },
    {
      "id" : "KGScheduleEntry.minimumInterval",
      "path" : "KGScheduleEntry.minimumInterval",
      "short" : "Minimum interval",
      "definition" : "Minimum interval since the previous dose, as stated.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    },
    {
      "id" : "KGScheduleEntry.note",
      "path" : "KGScheduleEntry.note",
      "short" : "Note",
      "definition" : "The row's footnote or remark, verbatim.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    }]
  }
}

```
