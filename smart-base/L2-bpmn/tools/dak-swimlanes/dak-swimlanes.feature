Feature: dak-swimlanes validates BPMN XML, swimlane structure, ActorDefinition resolution, and persona crosswalks
  BPMN 2.0 files in declared process directories are checked for well-formed
  OMG BPMN 2.0 XML without vendor namespaces, valid swimlane structure with no
  orphan flow nodes, and lane/participant resolution against ActorDefinition
  instances by Instance: ID (never by filename); and a DAK's personas page and
  Visio figures are cross-referenced through a declared swimlane map.

  @test:smart-base/L2-bpmn/tools/dak-swimlanes/dak-swimlanes.test.ts::dak-swimlanes::readsPersonasProcessesAndLaneTitles
  Scenario: reads personas, enumerated processes with their figure, and Visio lane titles
    Given a personas page table and a processes page with headings "A. Register" and "F . Trace", each followed by a figure
    Then the personas are "Health worker (HW)", "Community health worker", "Client" and "Caregiver"
    And the processes are A "Register" (anchor "a--register", figure a.svg) and F "Trace" (anchor "f---trace", figure f.svg)
    And the lanes of a.svg include "Vaccination location Health worker"

  @test:smart-base/L2-bpmn/tools/dak-swimlanes/dak-swimlanes.test.ts::dak-swimlanes::resolvesLaneThroughAliases
  Scenario: a lane resolves through declared aliases; pools and header lanes are accounted for; the rest is reported
    Given a swimlane map with persona aliases and declared non-personas
    Then "Vaccination location Health worker" resolves to "Health worker (HW)" with nothing left over
    And "Community CHW" resolves to "Community health worker" with nothing left over
    And "PCPOSS" resolves to no persona, with "PCPOSS" left over

  @test:smart-base/L2-bpmn/tools/dak-swimlanes/dak-swimlanes.test.ts::dak-swimlanes::crosswalkLinksBothWaysQaNamesGaps
  Scenario: the crosswalk links both ways and its QA names each gap
    Given the crosswalk of the personas, the processes and their figures' lanes
    Then "Client", which appears twice in a.svg, is one row
    And the personas markdown links "Health worker (HW)" to "A. Register" and says "Caregiver | _no swimlane in any process_"
    And the processes markdown links "Community health worker" to its persona anchor and lists "**not a declared persona:** PCPOSS"
    And the swimlane QA reports "Caregiver" as a persona without swimlane, one swimlane without persona, and 2 in total

  @test:smart-base/L2-bpmn/tools/dak-swimlanes/dak-swimlanes.test.ts::dak-swimlanes::validatesBpmnXmlAndRejectsVendorNamespaces
  Scenario: validates BPMN 2.0 XML well-formedness, root namespace, duplicate IDs, and forbidden vendor namespaces
    Given a standard BPMN 2.0 XML document and variants with malformed XML, wrong root namespace, duplicate IDs, or Zeebe/Camunda namespaces
    Then the standard BPMN 2.0 XML passes with no issues
    And malformed XML is rejected with BPMN-XML-001 and a non-BPMN root with BPMN-XML-002
    And Zeebe or Camunda vendor namespaces are rejected with BPMN-XML-003 and duplicate @id attributes with BPMN-XML-005

  @test:smart-base/L2-bpmn/tools/dak-swimlanes/dak-swimlanes.test.ts::dak-swimlanes::validatesSwimlaneStructureAndOrphanFlowNodes
  Scenario: validates swimlane presence, FSH-valid lane IDs, and flowNodeRef coverage for all process flow nodes
    Given a BPMN process without swimlanes and a BPMN process with an invalid lane ID and an unreferenced flow node
    Then the lane-less process is rejected with SWIM-001
    And the invalid lane ID is rejected with SWIM-003 and the orphan flow node "End_1" is rejected with SWIM-004

  @test:smart-base/L2-bpmn/tools/dak-swimlanes/dak-swimlanes.test.ts::dak-swimlanes::resolvesActorsByInstanceIdRegardlessOfFilenameAndDiscoversDeclaredDirs
  Scenario: resolves swimlanes to ActorDefinition instances by Instance: ID regardless of FSH filename and discovers declared process directories
    Given ActorDefinition instances "DAK.Client" and "DAK.HealthWorker" declared inside "ActorDefinition-client.fsh" and a BPMN file in a declared "L2/processes/" directory
    Then declaredProcessDirectories and discoverBpmnFiles find the BPMN file from the nested graph declaration
    And loadActorDefinitions parses both ActorDefinitions by Instance: ID and validateBpmnFile passes with zero issues
    And a lane whose ID and name match no ActorDefinition is rejected with ACTOR-001
