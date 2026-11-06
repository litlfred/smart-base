Instance: DAK.Persona.System.ClientRegistry
InstanceOf: ActorDefinition
Usage: #definition
* status = #draft
* experimental = true
* name = "ClientRegistry"
* title = "Client Registry / Master Patient Index"
* type = #system
// smart-ra's actor is canonical; this id stays as an alias (smart-base#338).
* derivedFrom = "http://smart.who.int/ra/ActorDefinition/ClientRegistry"
* description = """
A digital system that creates, maintains, and provides authoritative unique
identifiers for individuals (persons) accessing health services, enabling
cross-facility patient matching and de-duplication.

The client registry supports DHIs including:
- Verify a person's unique identity (2.1.1)
- Enrol person(s) for health services/clinical care plan (2.1.2)
- Merge, de-duplicate and curate coded datasets (4.2.2)
- Standards-compliant interoperability to link records across systems (4.4.2)

**Services and Application Types**:
- C6 — Identification registries and directories
- C8 — Master patient index

**Canonical definition**: smart-ra's [Client Registry](http://smart.who.int/ra/ActorDefinition/ClientRegistry) is the main definition of this system. This persona is derived from it and keeps the id `DAK.Persona.System.ClientRegistry` as an alias, so existing DAK references still resolve (WorldHealthOrganization/smart-base#338, WorldHealthOrganization/smart-ra#45).
"""
* documentation = "https://www.who.int/publications/i/item/9789240081949"