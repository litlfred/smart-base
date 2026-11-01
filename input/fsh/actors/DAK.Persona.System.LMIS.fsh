Instance: DAK.Persona.System.LMIS
InstanceOf: ActorDefinition
Usage: #definition
* status = #draft
* experimental = true
* name = "LogisticsManagementInformationSystem"
* title = "Logistics Management Information System (LMIS)"
* type = #system
// smart-ra's actor is canonical; this id stays as an alias (smart-base#338).
* derivedFrom = "http://smart.who.int/ra/ActorDefinition/LogisticsManagementInformationSystem"
* description = """
A digital system that manages the health supply chain from quantification
and forecasting through distribution, inventory management, and consumption tracking.

The LMIS supports DHIs including:
- Manage inventory and distribution of health commodities (3.2.1)
- Notify stock levels of health commodities (3.2.2)
- Monitor cold-chain sensitive commodities (3.2.3)
- Register licensed drugs and health commodities (3.2.4)
- Manage procurement of commodities (3.2.5)

**Services and Application Type**: B6 — Logistics management information systems (LMIS)

**Canonical definition**: smart-ra's [Logistics Management Information System](http://smart.who.int/ra/ActorDefinition/LogisticsManagementInformationSystem) is the main definition of this system. This persona is derived from it and keeps the id `DAK.Persona.System.LMIS` as an alias, so existing DAK references still resolve (WorldHealthOrganization/smart-base#338, WorldHealthOrganization/smart-ra#45).
"""
* documentation = "https://www.who.int/publications/i/item/9789240081949"