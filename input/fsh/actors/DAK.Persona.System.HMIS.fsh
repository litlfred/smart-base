Instance: DAK.Persona.System.HMIS
InstanceOf: ActorDefinition
Usage: #definition
* status = #draft
* experimental = true
* name = "HealthManagementInformationSystem"
* title = "Health Management Information System (HMIS)"
* type = #system
// smart-ra's actor is canonical; this id stays as an alias (smart-base#338).
* derivedFrom = "http://smart.who.int/ra/ActorDefinition/HealthManagementInformationSystem"
* description = """
A digital system used to collect, process, report, and use aggregate health data
for programme planning, monitoring, and evaluation at district and national levels.

The HMIS supports DHIs including:
- Routine health indicator data collection and management (2.2.4)
- Non-routine data collection and management (4.1.1)
- Data storage and aggregation (4.1.2)
- Data synthesis and visualisations (4.1.3)
- Data exchange across systems (4.4)

**Services and Application Type**: D6 — Health Management Information Systems (HMIS)

**Functional areas**: Data collection, reporting dashboards, target monitoring,
programme performance tracking, data quality management.

**Canonical definition**: smart-ra's [Health Management Information System](http://smart.who.int/ra/ActorDefinition/HealthManagementInformationSystem) is the main definition of this system. This persona is derived from it and keeps the id `DAK.Persona.System.HMIS` as an alias, so existing DAK references still resolve (WorldHealthOrganization/smart-base#338, WorldHealthOrganization/smart-ra#45).
"""
* documentation = "https://www.who.int/publications/i/item/9789240081949"