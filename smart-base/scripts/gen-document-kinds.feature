Feature: The document kinds smart-base authors
  The DAK document kind is the ten components, generated in order; the
  document-kind schema refuses malformed kinds; the authored kinds resolve as
  a set; and an ingested IG's artefacts are placed in DAK components by
  resource type.

  @test:smart-base/scripts/gen-document-kinds.test.ts::oneSectionPerDakComponentInOrder
  Scenario: has one section per DAK component, in DAK_COMPONENTS order
    Given the committed document-kinds/dak.json
    Then its section ids are the DAK components, in order

  @test:smart-base/scripts/gen-document-kinds.test.ts::fixedEverySectionRequired
  Scenario: is fixed: every section required
    Given the committed DAK kind
    Then its structure is "fixed" and every section is required

  @test:smart-base/scripts/gen-document-kinds.test.ts::marksSchedulingLogicNotYetField
  Scenario: says which component WHO's logical model does not yet formalize
    Given the committed DAK kind
    Then the "scheduling-logic" section's description contains "Not yet a field"

  @test:smart-base/scripts/gen-document-kinds.test.ts::committedDakKindMatchesGenerator
  Scenario: the committed file is what the generator writes
    Then the committed DAK kind equals the generated one

  @test:smart-base/scripts/gen-document-kinds.test.ts::refusesFixedWithOptionalSection
  Scenario: a fixed structure with an optional section
    Given the generated DAK kind with its first section made optional
    Then it does not parse as a document kind

  @test:smart-base/scripts/gen-document-kinds.test.ts::refusesKindWithNoSource
  Scenario: a kind that names no source
    Given the generated DAK kind with no sources
    Then it does not parse as a document kind

  @test:smart-base/scripts/gen-document-kinds.test.ts::refusesDuplicateSectionIds
  Scenario: two sections with one id
    Given the generated DAK kind with its first section repeated
    Then it does not parse as a document kind

  @test:smart-base/scripts/gen-document-kinds.test.ts::committedKindsHaveNoProblem
  Scenario: the committed kinds have no problem
    Given the committed kinds dak, l1, l1-guideline, dth and l2-dth and the pinned KG classes
    Then the kind set has no problems

  @test:smart-base/scripts/gen-document-kinds.test.ts::l1GuidelineAndDthExtendL1
  Scenario: l1-guideline and dth both extend l1, and neither redeclares its sections
    Then the kinds extending "l1" are exactly "dth" and "l1-guideline"

  @test:smart-base/scripts/gen-document-kinds.test.ts::l2DthExtendsDth
  Scenario: l2-dth extends dth (and transitively l1) without redeclaring any inherited section
    Given the l2-dth kind
    Then it extends "dth" with structure "semi-fixed"
    And its sections include "skos-glossary-alignment", "archimate-model-linkage" and "role-bound-bpmn-workflows"

  @test:smart-base/scripts/gen-document-kinds.test.ts::everySectionNamesSource
  Scenario: every section and every kind names a source
    Then every section of every kind other than dak names at least one source

  @test:smart-base/scripts/gen-document-kinds.test.ts::flagsExtendsNamingNoKind
  Scenario: an extends that names no kind
    Given the committed kinds with dth extending "l9"
    Then the problems mention 'extends "l9"'

  @test:smart-base/scripts/gen-document-kinds.test.ts::flagsLoopingExtendsChain
  Scenario: an extends chain that loops
    Given the committed kinds with l1 extending "dth"
    Then the problems mention "loops"

  @test:smart-base/scripts/gen-document-kinds.test.ts::flagsRedeclaredParentSection
  Scenario: a child redeclaring a section its parent has
    Given the committed kinds with dth adding a section "introduction"
    Then the problems mention '"introduction" is already its parent'

  @test:smart-base/scripts/gen-document-kinds.test.ts::flagsUndeclaredModelledByTerm
  Scenario: a modelledBy term the KG class lists do not declare
    Given the committed kinds with a dth section modelled by "sgkg-l2#not-a-class"
    Then the problems mention "sgkg-l2#not-a-class"

  @test:smart-base/scripts/gen-document-kinds.test.ts::placesResourceTypesInComponents
  Scenario: places each rule's resource type in its component
    Given the DAK coverage of an IG with an ActorDefinition, a Measure, a Library, a logical model, a resource profile and a ValueSet
    Then generic-personas holds the ActorDefinition, programme-indicators the Measure, decision-support-logic the Library and core-data-elements the logical model

  @test:smart-base/scripts/gen-document-kinds.test.ts::leavesProfilesAndUnruledUnplaced
  Scenario: a profile is not a data element, and nothing unruled is forced into a component
    Given the same DAK coverage
    Then the unplaced artefacts are one StructureDefinition and one ValueSet

  @test:smart-base/scripts/gen-document-kinds.test.ts::placedPlusUnplacedIsTotal
  Scenario: placed plus unplaced is every artefact
    Given the same DAK coverage
    Then the placed members plus the unplaced counts equal the total
