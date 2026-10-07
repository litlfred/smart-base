# Knowledge graph L1: External artefact - SMART Base v0.3.0

* [**Table of Contents**](toc.md)
* [**Artifacts Summary**](artifacts.md)
* **Knowledge graph L1: External artefact**

## Logical Model: Knowledge graph L1: External artefact 

| | |
| :--- | :--- |
| *Official URL*:http://smart.who.int/base/StructureDefinition/KGExternalArtifact | *Version*:0.3.0 |
| Active as of 2026-10-06 | *Computable Name*:KGExternalArtifact |

 
An L2 or L3 artefact addressed by canonical URL — a BPMN process, a DMN decision table, a FHIR PlanDefinition. Deliberately opaque: it carries an IRI and a free-text kind, and this graph asserts nothing about its internal structure. That opacity is the boundary. The L2 and L3 subgraphs model those artefacts properly; L1 only needs to point. Class IRI: http://smart.who.int/kg/external-artifact. 

**Usages:**

* This Logical Model is not used by any profiles in this Specification

You can also check for [usages in the FHIR IG Statistics](https://packages2.fhir.org/xig/resource/smart.who.int.base|current/StructureDefinition/StructureDefinition-KGExternalArtifact.json)

### Formal Views of Profile Content

 [Description of Profiles, Differentials, Snapshots and how the different presentations work](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#structure-definitions). 

 

Other representations of profile: [CSV](StructureDefinition-KGExternalArtifact.csv), [Excel](StructureDefinition-KGExternalArtifact.xlsx) 



## Resource Content

```json
{
  "resourceType" : "StructureDefinition",
  "id" : "KGExternalArtifact",
  "url" : "http://smart.who.int/base/StructureDefinition/KGExternalArtifact",
  "version" : "0.3.0",
  "name" : "KGExternalArtifact",
  "title" : "Knowledge graph L1: External artefact",
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
  "description" : "An L2 or L3 artefact addressed by canonical URL — a BPMN process, a DMN decision table, a FHIR PlanDefinition. Deliberately opaque: it carries an IRI and a free-text kind, and this graph asserts nothing about its internal structure. That opacity is the boundary. The L2 and L3 subgraphs model those artefacts properly; L1 only needs to point. Class IRI: http://smart.who.int/kg/external-artifact.",
  "fhirVersion" : "4.0.1",
  "kind" : "logical",
  "abstract" : false,
  "type" : "http://smart.who.int/base/StructureDefinition/KGExternalArtifact",
  "baseDefinition" : "http://hl7.org/fhir/StructureDefinition/Base",
  "derivation" : "specialization",
  "differential" : {
    "element" : [{
      "id" : "KGExternalArtifact",
      "path" : "KGExternalArtifact",
      "short" : "Knowledge graph L1: External artefact",
      "definition" : "An L2 or L3 artefact addressed by canonical URL — a BPMN process, a DMN decision table, a FHIR PlanDefinition. Deliberately opaque: it carries an IRI and a free-text kind, and this graph asserts nothing about its internal structure. That opacity is the boundary. The L2 and L3 subgraphs model those artefacts properly; L1 only needs to point. Class IRI: http://smart.who.int/kg/external-artifact."
    },
    {
      "id" : "KGExternalArtifact.iri",
      "path" : "KGExternalArtifact.iri",
      "short" : "IRI",
      "definition" : "Canonical URL or IRI of the L2 or L3 artefact.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "uri"
      }]
    },
    {
      "id" : "KGExternalArtifact.targetKind",
      "path" : "KGExternalArtifact.targetKind",
      "short" : "Target kind",
      "definition" : "What kind of artefact it is, free text (\"DMN decision table\", \"DAK component\").",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    },
    {
      "id" : "KGExternalArtifact.version",
      "path" : "KGExternalArtifact.version",
      "short" : "Version",
      "definition" : "Version of the artefact, where known.",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "string"
      }]
    }]
  }
}

```
