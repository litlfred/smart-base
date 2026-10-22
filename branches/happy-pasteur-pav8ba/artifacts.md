# Artifacts Summary - SMART Base v0.3.0

* [**Table of Contents**](toc.md)
* **Artifacts Summary**

## Artifacts Summary

This page provides a list of the FHIR artifacts defined as part of this implementation guide.

### Conformance 

constraints and profile structures for SMART Guidelines resources

| | |
| :--- | :--- |
| [SMART Guidelines ActivityDefinition](StructureDefinition-SGActivityDefinition.md) | The minimum expectations for ActivityDefinition resources used in SMART Guidelines |
| [SMART Guidelines Actor](StructureDefinition-SGActor.md) | Structure and constraints for ActorDefinition resources used in SMART Guidelines |
| [SMART Guidelines Business Process](StructureDefinition-SGBusinessProcess.md) | Structure and constraints for Business Processes represented in SMART Guidelines |
| [SMART Guidelines CodeSystem](StructureDefinition-SGCodeSystem.md) | Defines the minimum expectations for CodeSystem resources used in SMART Guidelines |
| [SMART Guidelines ConceptMap](StructureDefinition-SGConceptMap.md) | Defines the minimum expectations for ConceptMap resources used in SMART Guidelines |
| [SMART Guidelines GraphDefinition](StructureDefinition-SGGraphDefinition.md) | The minimum expectations for GraphDefinition resources used in SMART Guidelines |
| [SMART Guidelines Group Definition](StructureDefinition-SGGroupDefinition.md) | Structure and constraints for Group Definitions represented in SMART Guidelines |
| [SMART Guidelines ImplementationGuide](StructureDefinition-SGImplementationGuide.md) | Defines the minimum expectations for ImplementationGuide resources used in SMART Guidelines |
| [SMART Guidelines Library](StructureDefinition-SGLibrary.md) | Defines the minimum expectations for Library resources used in SMART Guidelines |
| [SMART Guidelines Logical Model](StructureDefinition-SGLogicalModel.md) | Defines the minimum expectations for Logical Models used in SMART Guidelines |
| [SMART Guidelines Measure](StructureDefinition-SGMeasure.md) | Defines the minimum expectations for Measure resources used in SMART Guidelines |
| [SMART Guidelines PlanDefinition](StructureDefinition-SGPlanDefinition.md) | Defines the minimum expectations for PlanDefinition resources used in SMART Guidelines |
| [SMART Guidelines Questionnaire](StructureDefinition-SGQuestionnaire.md) | Defines the minimum expectations for Questionnaire resources used in SMART Guidelines |
| [SMART Guidelines StructureDefinition](StructureDefinition-SGStructureDefinition.md) | Defines the minimum expectations for StructureDefinition resources used in SMART Guidelines |
| [SMART Guidelines StructureMap](StructureDefinition-SGStructureMap.md) | Defines the minimum expectations for StructureMap resources used in SMART Guidelines |
| [SMART Guidelines Transaction](StructureDefinition-SGTransaction.md) | Structure and constraints for TransactionDefinition resources used in SMART Guidelines |
| [SMART Guidelines ValueSet](StructureDefinition-SGValueSet.md) | Defines the minimum expectations for ValueSet resources used in SMART Guidelines |

### Requirements: Actor Definitions 

The following artifacts define the types of individuals and/or systems that will interact as part of the use cases covered by this implementation guide.

| | |
| :--- | :--- |
| [Business Analyst](ActorDefinition-SGAuthoring.Persona.BusinessAnalyst.md) | A digital health informatician specializing in business analysis who authors L2 DAK components. Business analysts translate clinical guidelines and normative products into structured DAK artifacts including business processes, data dictionaries, decision-support logic, and requirements.Key activities:* Review L1 source documents and extract structured content
* Author generic personas based on task-shifting guidelines
* Create user scenario narratives
* Design BPMN 2.0 business process diagrams
* Define core data elements and data dictionary
* Develop decision-support logic tables (DMN standard)
* Develop scheduling logic tables
* Define indicators and performance metrics
* Capture functional and non-functional requirements
* Streamline content across DAK components for consistency
**Source**: IG Starter Kit, L2 DAK Authoring, Section 2.1 "Fill in DAK components"; Community of Practice page |
| [Client Registry / Master Patient Index](ActorDefinition-DAK.Persona.System.ClientRegistry.md) | A digital system that creates, maintains, and provides authoritative unique identifiers for individuals (persons) accessing health services, enabling cross-facility patient matching and de-duplication.The client registry supports DHIs including:* Verify a person's unique identity (2.1.1)
* Enrol person(s) for health services/clinical care plan (2.1.2)
* Merge, de-duplicate and curate coded datasets (4.2.2)
* Standards-compliant interoperability to link records across systems (4.4.2)
**Services and Application Types**:* C6 — Identification registries and directories
* C8 — Master patient index
 |
| [Clinical Subject Matter Expert](ActorDefinition-SGAuthoring.Persona.ClinicalSME.md) | A clinician or subject matter expert (SME) of a specific health area who validates the clinical accuracy and completeness of DAK content against WHO guidelines and other normative products. SMEs should be the authors of the source documents or recognized experts actively engaged in, if not leading, the collaborative development of the DAKs.Key activities:* Validate that DAK components accurately reflect L1 recommendations
* Provide clinical ground-truthing through country visits and interviews
* Identify gaps or needed changes in DAK content
* Review decision-support logic for clinical correctness
* Confirm that workflows represent 80% of clinical scenarios
* Validate personas against real-world practice settings
* Advise on cross-programme overlaps (e.g. TB/HIV indicators)
**Source**: IG Starter Kit, L2 DAK Authoring, Sections 1 "Plan" and 2.2 "Validate" |
| [Community Health Worker](ActorDefinition-DAK.Persona.CommunityHealthWorker.md) | A frontline member of the health workforce who delivers health interventions at the community level, acting as a link between communities and formal health facilities. Community health workers are a key sub-group of healthcare providers.Community health workers use DHIs to:* Register and follow-up community members (2.1, 2.2.1)
* Receive community-based decision support and job aids (2.3)
* Report public health events from point of diagnosis (3.3.1)
* Access mobile training and competency assessments (2.8)
* Communicate with supervising clinical staff (2.5.1)
* Manage their daily visit planning and activities (2.7)
**ISCO-08**: 3255 (Community health workers), 5321 (Health care assistants).**Examples**: Village health worker, health extension worker, community health volunteer, lay health advisor, peer educator, traditional birth attendant, community case manager. |
| [Content Reviewer / Approver](ActorDefinition-SGAuthoring.Persona.ContentReviewer.md) | A designated reviewer responsible for approving SMART Guidelines content at key decision gates in the authoring lifecycle. Content Reviewers ensure that DAK and IG content meets quality standards, accurately reflects WHO normative guidance, and is ready to proceed to the next phase.Content Reviewers may be senior technical officers, programme leads, or designated governance committee members. They provide formal sign-off at phase transitions (L2→L3, draft→publication).Key activities:* Review and approve L2 DAK content before L3 authoring begins
* Review and approve L3 IG content before publication
* Assess whether content changes are breaking or non-breaking
* Approve draft publications for stakeholder circulation
* Provide final sign-off for release publication
* Ensure content aligns with WHO guidelines governance policies
* Participate in cross-programme content harmonization reviews
**Source**: IG Starter Kit, Publication page (review process); DAK Authoring, Section 2.2 "Validate DAK content with SMEs" |
| [Electronic Medical Record (EMR) System](ActorDefinition-DAK.Persona.System.EMR.md) | A secure, digital system that holds information about people's health and clinical care managed by healthcare providers. Also referred to as an Electronic Health Record (EHR).The EMR system supports DHIs including:* Longitudinal tracking of person's health status and services (2.2.1)
* Management of structured clinical records (2.2.2)
* Management of unstructured clinical records such as notes and images (2.2.3)
* Clinical decision support prompts and checklists (2.3)
* Person identification and registration (2.1)
* Prescription and medication management (2.9)
* Laboratory results reception (2.10.1)
* Routine health indicator data collection (2.2.4)
**Services and Application Type**: A5 — Electronic medical record systems**Functional areas**: Clinical decision support, record management, person registration, appointment scheduling, referral tracking. |
| [FHIR Modeller](ActorDefinition-SGAuthoring.Persona.FHIRModeller.md) | An L3 author who creates machine-readable FHIR artifacts from L2 DAK specifications. FHIR Modellers use FSH (FHIR Shorthand), SUSHI, and the IG Publisher toolchain to produce conformant Implementation Guides.Key activities:* Verify L2 input availability and consistency
* Author FHIR Logical Models from L2 data dictionaries
* Create FHIR Profiles (StructureDefinitions)
* Author FHIR Questionnaires from L2 forms
* Write CQL for decision logic, scheduling logic, and indicators
* Create StructureMaps for data extraction
* Author PlanDefinitions for business processes and decision tables
* Create ActorDefinitions from L2 personas (reusing Commons repository)
* Create ExampleScenario resources from L2 user scenarios
* Author FHIR Measure resources from L2 indicators
* Create FHIR Requirements resources
* Develop test cases (TestPlan, TestScript, example instances)
* Ensure all artifacts conform to CRMI Shareable/Publishable profiles
**Source**: IG Starter Kit, L2-L3 Overview and all L3 authoring pages |
| [Health Data Manager and Analyst](ActorDefinition-DAK.Persona.DataManager.md) | A professional who manages, analyses, and disseminates health data to support evidence-based decision-making. This corresponds to the 'Data services' user group in CDISAH v2, providing crosscutting functionality across the health system.Data managers use DHIs to:* Create data collection forms and manage data acquisition (4.1.1)
* Store and aggregate health data (4.1.2)
* Synthesise and visualise data for reporting and dashboards (4.1.3)
* Apply automated analytics and predictive modelling including AI/ML (4.1.4)
* Parse, de-duplicate, and curate coded datasets and terminologies (4.2)
* Classify disease codes and causes of mortality (4.2.3)
* Map geographic locations of facilities, events, populations, and providers (4.3)
* Enable point-to-point data integration and standards-compliant interoperability (4.4)
* Maintain data governance including authentication, privacy, and consent (4.5)
**ISCO-08**: 2120 (Mathematicians, actuaries and statisticians), 2521 (Database designers and administrators), 2523 (Computer network professionals), 3120 (Computer network and systems technicians).**Examples**: Biostatistician, epidemiologist, health informatician, data analyst, DHIS2 administrator, GIS specialist, interoperability engineer, terminology manager. |
| [Health Information Exchange / Interoperability Platform](ActorDefinition-DAK.Persona.System.InteropPlatform.md) | A middleware system or shared infrastructure that enables health data exchange between disparate health information systems using standard protocols and formats.The interoperability platform supports DHIs including:* Point-to-point data integration (4.4.1)
* Standards-compliant interoperability (4.4.2)
* Message routing to appropriate architecture components (4.4.3)
* Data storage and aggregation across systems (4.1.2)
**Services and Application Type**: D2 — Data interchange and interoperability**Functional areas**: Semantic interoperability, technical interoperability, information exchange, data mediation, enterprise service bus. |
| [Health Management Information System (HMIS)](ActorDefinition-DAK.Persona.System.HMIS.md) | A digital system used to collect, process, report, and use aggregate health data for programme planning, monitoring, and evaluation at district and national levels.The HMIS supports DHIs including:* Routine health indicator data collection and management (2.2.4)
* Non-routine data collection and management (4.1.1)
* Data storage and aggregation (4.1.2)
* Data synthesis and visualisations (4.1.3)
* Data exchange across systems (4.4)
**Services and Application Type**: D6 — Health Management Information Systems (HMIS)**Functional areas**: Data collection, reporting dashboards, target monitoring, programme performance tracking, data quality management. |
| [Health System Manager](ActorDefinition-DAK.Persona.HealthSystemManager.md) | A professional involved in the administration and oversight of health systems.Health system managers use DHIs to:* Manage health workforce information, performance, and certification (3.1)
* Oversee supply chain, inventory, cold chain, and procurement (3.2)
* Receive notifications of public health events (3.3)
* Register and certify vital events — births and deaths (3.4)
* Administer health coverage schemes, billing, payroll, and budgets (3.5)
* Monitor and track health equipment and assets (3.6)
* Manage health facility information and conduct assessments (3.7)
* Manage person-centred health certificate information (3.8)
**ISCO-08**: 1342 (Health services managers), 2446 (Social work professionals n.e.c.), 3354 (Government social benefits officials), 4311 (Accounting and bookkeeping clerks).**Examples**: District health officer, programme manager, supply chain officer, HMIS coordinator, hospital administrator, vital registration officer, health insurance administrator. |
| [Healthcare Provider](ActorDefinition-DAK.Persona.HealthcareProvider.md) | A member of the health workforce who delivers health interventions. This group has also been described as 'health workers' or 'healthcare workers'.Healthcare providers use DHIs to:* Identify and register persons for health services (2.1)
* Manage person-centred health records (2.2)
* Receive clinical decision support prompts and checklists (2.3)
* Conduct telemedicine consultations and remote monitoring (2.4)
* Communicate with supervisors, peers, and receive AI-assisted content (2.5)
* Coordinate referrals and emergency transport (2.6)
* Schedule and plan their clinical activities (2.7)
* Access training content and assessments (2.8)
* Manage prescriptions and medication adherence (2.9)
* Order and receive laboratory and diagnostic results (2.10)
* Verify health coverage and receive payments from individuals (2.11)
**ISCO-08**: 2211 (Generalist medical practitioners), 2212 (Specialist medical practitioners), 2221 (Nursing professionals), 2222 (Midwifery professionals), 3211 (Medical imaging and therapeutic equipment technicians), 3212 (Medical and pathology laboratory technicians), 3213 (Pharmaceutical technicians and assistants), 3221 (Nursing associate professionals), 3222 (Midwifery associate professionals), 3255 (Community health workers).**Examples**: Physician, nurse, midwife, clinical officer, pharmacist, laboratory technician, dentist, allied health professional. |
| [Laboratory Information System (LIS)](ActorDefinition-DAK.Persona.System.LIS.md) | A digital system that manages the complete lifecycle of laboratory test orders, specimen tracking, result production, and result reporting to healthcare providers and persons.The LIS supports DHIs including:* Transmit and track diagnostic orders (2.10.2)
* Capture diagnostic results from digital devices (2.10.3)
* Transmit person's diagnostic result to healthcare provider (2.10.1)
* Transmit diagnostics result or availability of result to person(s) (1.1.4)
* Track biological specimens (2.10.4)
**Services and Application Type**: A6 — Laboratory information systems**Functional areas**: Lab requests/test ordering, sample tracking, sample processing, results reporting. |
| [Logistics Management Information System (LMIS)](ActorDefinition-DAK.Persona.System.LMIS.md) | A digital system that manages the health supply chain from quantification and forecasting through distribution, inventory management, and consumption tracking.The LMIS supports DHIs including:* Manage inventory and distribution of health commodities (3.2.1)
* Notify stock levels of health commodities (3.2.2)
* Monitor cold-chain sensitive commodities (3.2.3)
* Register licensed drugs and health commodities (3.2.4)
* Manage procurement of commodities (3.2.5)
**Services and Application Type**: B6 — Logistics management information systems (LMIS) |
| [Person (Health Service User)](ActorDefinition-DAK.Persona.Person.md) | A member of the public who is a potential or current user of health services, including health prevention and wellness activities. Other terms used for this group include 'patient', 'client', 'individual', and 'health service user'. Caregivers of individuals receiving health services are also included.Persons interact with DHIs to:* Receive targeted (1.1) and untargeted (1.2) health communications
* Communicate with other persons as peers (1.3)
* Track their own health data and records (1.4)
* Report health events and system feedback (1.5)
* Access health information on demand including via chatbot/AI (1.6)
* Manage their financial transactions related to health services (1.7)
* Manage their consent for health data access and sharing (1.8)
**ISCO-08**: Not applicable (non-occupational role).**Examples**: Patient, pregnant woman, caregiver, child, community member, health scheme beneficiary, person living with a chronic condition. |
| [Programme Manager](ActorDefinition-SGAuthoring.Persona.ProgrammeManager.md) | A programme manager responsible for the overall coordination and management of the Digital Adaptation Kit (DAK) development process. Programme managers lead scoping, resource allocation, timeline planning, and stakeholder engagement.The DAK development team should be small (<10 people) and nimble. The Programme Manager ensures the team is empowered to self-organize and manage DAK-related work including collaboration with stakeholders, content development, validation, and publication.Key activities:* Define DAK scope and purpose
* Form and coordinate the DAK development team
* Establish development process and governance
* Define RASCI matrix for roles and responsibilities
* Plan sprint iterations and maintain the DAK backlog
* Coordinate SME consultations (workshops, country visits)
* Draft project roadmap with milestone dates
* Assess and secure resources and budget
**Source**: IG Starter Kit, L2 DAK Authoring, Section 1 "Plan" |
| [Public Health and Disease Surveillance System](ActorDefinition-DAK.Persona.System.SurveillanceSystem.md) | A digital system for detecting, monitoring, investigating, and responding to disease outbreaks and public health threats.The surveillance system supports DHIs including:* Notification of public health events from point of diagnosis (3.3.1)
* Transmit health event alerts to specific population group(s) (1.1.1)
* Map location of health event (4.3.2)
* Data synthesis and visualizations for outbreak response (4.1.3)
* Automated analysis of data to generate predictions (4.1.4)
**Services and Application Type**: E2 — Public health and disease surveillance systems |
| [Publication Manager](ActorDefinition-SGAuthoring.Persona.PublicationManager.md) | A specialist responsible for managing the FHIR Implementation Guide configuration, build process, versioning, and release publication workflow. Publication Managers ensure IGs are correctly configured, built, and published to smart.who.int following the established publication process.Key activities:* Set up IG repositories from smart-ig-empty template
* Configure sushi-config.yaml (canonical URL, package ID, dependencies)
* Enable GitHub Pages and CI build workflows
* Run FHIR IG Publisher builds and verify output
* Manage semantic versioning (major.minor.patch)
* Create publication-request.json for releases
* Create release branches, tags, and GitHub releases
* Monitor automated publication workflows
* Coordinate with WHO SMART Guidelines team for smart.who.int updates
* Manage cross-IG governance for shared artifacts
* Reset main branch to draft status after publication
**Source**: IG Starter Kit, IG Setup, IG Publication, and IG Configuration pages |
| [Quality Control Reviewer](ActorDefinition-SGAuthoring.Persona.QCReviewer.md) | A quality assurance specialist responsible for reviewing SMART Guidelines Implementation Guides for publication readiness. QC Reviewers use the publication checklist across L1-L4 layers, interpret QA validation reports, and verify artifact conformance and cross-component consistency.Key activities:* Run and interpret IG Publisher QA reports (qa.html)
* Review publication checklist across L1, L2, L3, L4, and Global sections
* Verify conformance to Shareable, Publishable, Computable, Executable profiles
* Validate StructureMap extraction produces expected output
* Verify CQL execution and measure calculations
* Check cross-component consistency (personas, data elements, processes)
* Validate all artifacts have required title, description, and mappings
* Confirm naming conventions and reference resolution
* Review change log completeness and versioning compliance
**Source**: IG Starter Kit, QA Check page, Checklist page, Validating IG page |
| [Technical Officer](ActorDefinition-SGAuthoring.Persona.TechnicalOfficer.md) | A health area technical officer who coordinates the work on the DAK and performs first-pass review and validation of DAK content. Technical officers are part of the DAK development team and serve as the primary bridge between the development team and the broader group of Subject Matter Experts.Key activities:* Coordinate DAK development work within the health programme area
* Perform first-pass review of drafted DAK components
* Validate that components accurately reflect L1 recommendations
* Identify gaps, ambiguities, and alternatives in DAK content
* Prepare agendas and questions for SME consultation meetings
* Ensure content is software-neutral and context-appropriate
* Spread awareness of SMART Guidelines within the department
**Source**: IG Starter Kit, L2 DAK Authoring, Section 2.2 "Validate DAK content with SMEs" |
| [Terminologist](ActorDefinition-SGAuthoring.Persona.Terminologist.md) | A specialist responsible for ensuring semantic interoperability of SMART Guidelines through proper terminology management. Terminologists manage the WHO Commons dictionary, concept mappings, and ensure every data element is mapped to approved standard terminologies.Key activities:* Map data elements to WHO Commons dictionary concepts
* Create and maintain CodeSystem resources
* Create and maintain ValueSet resources
* Create ConceptMap resources for cross-terminology mappings
* Map to ICD-11, SNOMED CT, LOINC, IPS, and WHO FIC
* Onboard new concepts into the Commons dictionary
* Verify no duplicate or overlapping concept definitions
* Review terminology bindings in logical models and profiles
* Flag unapproved concepts as QA issues before publication
**Source**: IG Starter Kit, Governance Concepts page; L3 authoring pages for CodeSystems, ValueSets, ConceptMaps |
| [Translator](ActorDefinition-SGAuthoring.Persona.Translator.md) | A language specialist responsible for translating SMART Guidelines Implementation Guide content across UN languages to support global adoption and adaptation.Key activities:* Translate IG narrative content across UN languages
* Translate FHIR resource display names and descriptions
* Review translated content for accuracy and clinical correctness
* Manage .pot/.po translation template files
* Coordinate with clinical SMEs for domain-specific terminology
* Ensure translated examples are available for each non-abstract profile
**Source**: IG Starter Kit, Checklist L4 (example resources per UN language); PR 288 translation skill infrastructure |

### Requirements: Formal Requirements 

The following artifacts describe the specific requirements to be met by systems compliant with the implementation guide.

| | |
| :--- | :--- |
| [Can author CQL](Requirements-SGAuthoring.Skills.AuthorCQL.md) | Capability to write Clinical Quality Language (CQL) for decision logic, scheduling logic, and indicator calculations. |
| [Can author FHIR profiles](Requirements-SGAuthoring.Skills.AuthorFHIRProfiles.md) | Capability to create FHIR profiles (StructureDefinitions) constraining base FHIR resources. |
| [Can author FHIR requirements](Requirements-SGAuthoring.Skills.AuthorFHIRRequirements.md) | Capability to create FHIR Requirements resources from L2 functional and non-functional requirements. |
| [Can author actor definitions](Requirements-SGAuthoring.Skills.AuthorActorDefinitions.md) | Capability to create FHIR ActorDefinitions from L2 personas, reusing existing definitions from the Commons repository. |
| [Can author business processes](Requirements-SGAuthoring.Skills.AuthorBusinessProcesses.md) | Capability to create BPMN 2.0 business process diagrams for DAK workflows. |
| [Can author code systems](Requirements-SGAuthoring.Skills.AuthorCodeSystems.md) | Capability to create and maintain FHIR CodeSystem resources. |
| [Can author concept maps](Requirements-SGAuthoring.Skills.AuthorConceptMaps.md) | Capability to create FHIR ConceptMap resources for cross-terminology mappings. |
| [Can author data dictionary](Requirements-SGAuthoring.Skills.AuthorDataDictionary.md) | Capability to define core data elements and map to standard terminologies. |
| [Can author decision-support logic](Requirements-SGAuthoring.Skills.AuthorDecisionLogic.md) | Capability to develop decision-support logic tables following the DMN standard. |
| [Can author example scenarios](Requirements-SGAuthoring.Skills.AuthorExampleScenarios.md) | Capability to create ExampleScenario resources from L2 user scenarios. |
| [Can author functional requirements](Requirements-SGAuthoring.Skills.AuthorFunctionalRequirements.md) | Capability to define high-level functional and non-functional requirements linked to personas and business processes. |
| [Can author indicators](Requirements-SGAuthoring.Skills.AuthorIndicators.md) | Capability to define indicators and performance metrics with numerator/denominator specifications. |
| [Can author logical models](Requirements-SGAuthoring.Skills.AuthorLogicalModels.md) | Capability to create FHIR logical models (StructureDefinitions) from L2 data dictionaries. |
| [Can author measures](Requirements-SGAuthoring.Skills.AuthorMeasures.md) | Capability to create FHIR Measure resources from L2 indicators. |
| [Can author personas](Requirements-SGAuthoring.Skills.AuthorPersonas.md) | Capability to define generic personas based on task-shifting guidelines and ground-truthing interviews. |
| [Can author plan definitions](Requirements-SGAuthoring.Skills.AuthorPlanDefinitions.md) | Capability to create FHIR PlanDefinitions for business processes and decision tables. |
| [Can author questionnaires](Requirements-SGAuthoring.Skills.AuthorQuestionnaires.md) | Capability to create FHIR Questionnaire resources aligned with L2 forms and data collection needs. |
| [Can author scheduling logic](Requirements-SGAuthoring.Skills.AuthorSchedulingLogic.md) | Capability to develop scheduling logic tables following the DMN standard. |
| [Can author structure maps](Requirements-SGAuthoring.Skills.AuthorStructureMaps.md) | Capability to create FHIR StructureMaps for data extraction from QuestionnaireResponses to FHIR resources. |
| [Can author test cases](Requirements-SGAuthoring.Skills.AuthorTestCases.md) | Capability to create TestPlan, TestScript, and example instances for validation of L3 artifacts. |
| [Can author user scenarios](Requirements-SGAuthoring.Skills.AuthorUserScenarios.md) | Capability to create user scenario narratives depicting typical interactions in health programme workflows. |
| [Can author value sets](Requirements-SGAuthoring.Skills.AuthorValueSets.md) | Capability to create and maintain FHIR ValueSet resources with appropriate terminology bindings. |
| [Can build IG](Requirements-SGAuthoring.Skills.BuildIG.md) | Capability to run the FHIR IG Publisher build process and verify output. |
| [Can configure IG](Requirements-SGAuthoring.Skills.ConfigureIG.md) | Capability to set up and configure a FHIR Implementation Guide (sushi-config, canonical URL, packages). |
| [Can interpret clinical recommendations](Requirements-SGAuthoring.Skills.InterpretClinicalRecommendations.md) | Capability to interpret clinical recommendations from L1 source documents with domain expertise. |
| [Can manage governance](Requirements-SGAuthoring.Skills.ManageGovernance.md) | Capability to manage cross-IG governance for shared artifacts including common personas, terminology, and libraries. |
| [Can manage releases](Requirements-SGAuthoring.Skills.ManageReleases.md) | Capability to manage versioning, publication-request.json, release tags, and publication workflow. |
| [Can manage stakeholders](Requirements-SGAuthoring.Skills.ManageStakeholders.md) | Capability to engage SMEs, coordinate consultations, and manage the RASCI matrix for DAK development. |
| [Can map concepts](Requirements-SGAuthoring.Skills.MapConcepts.md) | Capability to map data elements to WHO Commons dictionary, ICD-11, SNOMED CT, LOINC, and other standard terminologies. |
| [Can plan iterations](Requirements-SGAuthoring.Skills.PlanIterations.md) | Capability to plan sprint iterations, maintain the DAK backlog, draft the project roadmap, and facilitate retrospectives. |
| [Can review L1 guidelines](Requirements-SGAuthoring.Skills.ReviewL1Guidelines.md) | Capability to review WHO L1 narrative guidelines and normative products for accuracy and completeness. |
| [Can review and approve content](Requirements-SGAuthoring.Skills.ReviewAndApproveContent.md) | Capability to review and formally approve SMART Guidelines content at decision gates in the authoring lifecycle. |
| [Can review checklist](Requirements-SGAuthoring.Skills.ReviewChecklist.md) | Capability to review the SMART Guidelines publication checklist across L1-L4 layers and global requirements. |
| [Can review terminology](Requirements-SGAuthoring.Skills.ReviewTerminology.md) | Capability to review and validate terminology bindings, code systems, and value sets for correctness and completeness. |
| [Can review translations](Requirements-SGAuthoring.Skills.ReviewTranslations.md) | Capability to review translated content for accuracy and completeness. |
| [Can run QA checks](Requirements-SGAuthoring.Skills.RunQAChecks.md) | Capability to run and interpret IG Publisher QA validation reports. |
| [Can scope DAK](Requirements-SGAuthoring.Skills.ScopeDAK.md) | Capability to define DAK scope, identify source documents, and establish the development process and governance. |
| [Can translate content](Requirements-SGAuthoring.Skills.TranslateContent.md) | Capability to translate IG content across UN languages. |
| [Can validate DAK content](Requirements-SGAuthoring.Skills.ValidateDAKContent.md) | Capability to review and validate DAK components against L1 source documents and for cross-component consistency. |
| [Can validate L3 functionality](Requirements-SGAuthoring.Skills.ValidateL3Functionality.md) | Capability to test StructureMap extraction, CQL execution, and measure calculation using reference tooling. |
| [Can validate artifact conformance](Requirements-SGAuthoring.Skills.ValidateArtifactConformance.md) | Capability to verify conformance to CRMI Shareable, Publishable, Computable, and Executable profiles. |

### Knowledge Artifacts: Activity Definitions 

These define activities that can be performed as part of content in this implementation guide.

| |
| :--- |
| [SGDecisionTableGuidance](ActivityDefinition-SGDecisionTableGuidance.md) |

### Structures: Logical Models 

These define data models that represent the domain covered by this implementation guide in more business-friendly terms than the underlying FHIR resources.

| | |
| :--- | :--- |
| [Business Process Workflow (DAK)](StructureDefinition-BusinessProcessWorkflow.md) | Logical Model for representing Generic Business Processes and Workflows from a DAK. A business process is a set of related activities or tasks performed together to achieve the objectives of the health programme area. |
| [Business Process Workflow Source](StructureDefinition-BusinessProcessWorkflowSource.md) | Source reference for Business Process Workflow - exactly one of the following must be provided:* url (url data type): URL to retrieve BusinessProcessWorkflow definition from input/ or external source
* canonical (canonical data type): Canonical URI pointing to the BusinessProcessWorkflow definition
* instance: Inline BusinessProcessWorkflow instance data
 |
| [Core Data Element (DAK)](StructureDefinition-CoreDataElement.md) | Logical Model for representing Core Data Elements from a DAK. A core data element can be one of: a ValueSet, a CodeSystem, a ConceptMap, or a Logical Model adherent to SGLogicalModel. This is the ONE EXCEPTION to allowing FHIR R4 models into the DAK LMs. |
| [Core Data Element Source](StructureDefinition-CoreDataElementSource.md) | Source reference for Core Data Element - exactly one of the following must be provided:* url (url data type): URL to retrieve CoreDataElement definition from input/ or external source
* canonical (canonical data type): Canonical URI pointing to the CoreDataElement definition
* instance: Inline CoreDataElement instance data
 |
| [Decision Support Logic Source](StructureDefinition-DecisionSupportLogicSource.md) | Source reference for Decision Support Logic - exactly one of the following must be provided:* url (url data type): URL to retrieve DecisionSupportLogic definition from input/ or external source
* canonical (canonical data type): Canonical URI pointing to the DecisionSupportLogic definition
* instance: Inline DecisionSupportLogic instance data
 |
| [Decision-Support Logic (DAK)](StructureDefinition-DecisionSupportLogic.md) | Logical Model for representing Decision-Support Logic from a DAK. Decision-support logic and algorithms to support appropriate service delivery in accordance with WHO clinical, public health and data use guidelines. |
| [Digital Adaptation Kit (DAK)](StructureDefinition-DAK.md) | Logical Model for representing a complete Digital Adaptation Kit (DAK) with metadata and all 9 DAK components |
| [Dublin Core Metadata Element Set](StructureDefinition-DublinCore.md) | Logical Model representing Dublin Core metadata elements as defined at https://www.dublincore.org/specifications/dublin-core/dcmi-terms/ |
| [FHIR Schema Base (SMART Guidelines)](StructureDefinition-FHIRSchemaBase.md) | Base logical model providing the common schema metadata interface inherited by all SMART Guidelines logical models. Every SMART Guidelines logical model schema derives from this base, which documents the shared FHIR and JSON-LD metadata properties used by the JSON Schema generation pipeline. |
| [Functional Requirement (DAK)](StructureDefinition-FunctionalRequirement.md) | Logical Model for representing functional requirement from a DAK |
| [Functional and Non-Functional Requirements (DAK)](StructureDefinition-Requirements.md) | Logical Model for representing Functional and Non-Functional Requirements from a DAK. A high-level list of core functions and capabilities that the system must have to meet the end users' needs. |
| [Generic Persona (DAK)](StructureDefinition-GenericPersona.md) | Logical Model for representing Generic Personas from a DAK. Depiction of the human and system actors. Human actors are end users, supervisors and related stakeholders who would be interacting with the digital system or involved in the clinical care, public health or health system pathway. |
| [Generic Persona Source](StructureDefinition-GenericPersonaSource.md) | Source reference for Generic Persona - exactly one of the following must be provided:* url (url data type): URL to retrieve GenericPersona definition from input/ or external source
* canonical (canonical data type): Canonical URI pointing to the GenericPersona definition
* instance: Inline GenericPersona instance data
 |
| [Health Interventions Source](StructureDefinition-HealthInterventionsSource.md) | Source reference for Health Interventions - exactly one of the following must be provided:* url (url data type): URL to retrieve HealthInterventions definition from input/ or external source
* canonical (canonical data type): Canonical URI pointing to the HealthInterventions definition
* instance: Inline HealthInterventions instance data
 |
| [Health Interventions and Recommendations (DAK)](StructureDefinition-HealthInterventions.md) | Logical Model for representing Health Interventions and Recommendations from a DAK. Overview of the health interventions and WHO, regional or national recommendations included within the DAK. |
| [Knowledge graph L1-LIBRARY: Library node](StructureDefinition-KGLibraryNode.md) | A node in the ingested library L1 is read from: a source document, a section or a block, addressed by the library's own IRI. Opaque, as L1 asserts nothing about the library's internal model; the library is upstream, so pointing at it keeps the layering rule. Class IRI: http://smart.who.int/kg/library-node. |
| [Knowledge graph L1: Citation](StructureDefinition-KGCitation.md) | One citation string exactly as written in a DAK artefact. A cell holding several citations yields several nodes. Content-addressed in the DAK's namespace, so one string is one node across artefacts. Where a citation was found is recorded by appearsIn (L2) and by each use edge (L2-DMN, L3 citesSource), not on the node. Class IRI: http://smart.who.int/kg/citation. |
| [Knowledge graph L1: Evidence](StructureDefinition-KGEvidence.md) | One row of an evidence profile: the evidence for one outcome of one key question, with its certainty (handbook §9.2). Class IRI: http://smart.who.int/kg/evidence. |
| [Knowledge graph L1: Health intervention](StructureDefinition-KGHealthIntervention.md) | An intervention identified in a WHO catalogue or classification (UHC Compendium, ICHI, CDHI), digital interventions included. A peer of recommendation, not a recommendation. A DAK may draw on both. Corresponds to HealthInterventions: identifier and description correspond to HealthInterventions.id and description[x]; not a Parent because HealthInterventions requires reference 1..* DublinCore, which here is an edge (definedIn) rather than a field. Class IRI: http://smart.who.int/kg/health-intervention. |
| [Knowledge graph L1: Indicator](StructureDefinition-KGIndicator.md) | A WHO indicator, identified by its published reference number. Printed in several places (HIV SI 2022: summary list, Table 2.3, reference sheet) and stored once. variants is a list of {population, definition, numerator, denominator} for population-specific or level-specific forms (PRV.17, PRV.3). Corresponds to ProgramIndicator: definition, numerator, denominator and disaggregation are ProgramIndicator's elements and types (markdown); not a Parent because ProgramIndicator makes them 1..1 and an L1 indicator is recorded with what its source prints. Class IRI: http://smart.who.int/kg/indicator. |
| [Knowledge graph L1: Key question](StructureDefinition-KGKeyQuestion.md) | A question in PICO format, framed before the evidence search (handbook §7.1–7.4). P and C are verbatim text with codes through crossReferences; I is also joined to a catalogued intervention; O is the outcome node. Class IRI: http://smart.who.int/kg/key-question. |
| [Knowledge graph L1: Outcome](StructureDefinition-KGOutcome.md) | An outcome a guideline group chose to judge a key question by, with its importance in this guideline (handbook §7.6). A node because evidence attaches to it and one list is shared by several questions (ANC Web annex 1). Flat: one node per specific outcome. name as first printed; aliases are the other printed forms (e.g. 'EGWG'); category is the printed group heading (e.g. 'Fetal/newborn morbidity'). Class IRI: http://smart.who.int/kg/outcome. |
| [Knowledge graph L1: Publication](StructureDefinition-KGPublication.md) | A WHO publication: a guideline of any of the handbook's types, a position paper, a summary table, a classification, implementation guidance, or a supplement. Metadata follows Dublin Core. identifiers is a list of {type, value}; type is from identifier-type, and the first of isbn, iris-handle, doi, issn, url builds the IRI, so an edition change is a new publication. issued and modified are Dublin Core. reviewBy is the handbook's review-by date (§12.5.1). sha256 pins the PDF. Derives from DublinCore (smart-base input/fsh/models/DublinCore.fsh); title, creator, publisher, language, rights are its elements. Class IRI: http://smart.who.int/kg/publication. |
| [Knowledge graph L1: Publication element](StructureDefinition-KGPublicationElement.md) | One printed block: a table, a table row, a footnote, a figure, a chart, an image, a flowchart, a box or a list. It records where something is printed and exactly what is printed that no content node holds. It carries no meaning of its own; meaning lives in content nodes, joined by presentedIn. columns is the header text, verbatim. columnMap names, per column, the content field that fills it when the table is re-rendered (e.g. 'Recommendation' -> statement). cells holds only text no content node holds; a cell filled through columnMap is null. text is for unmodelled printed text such as a footnote that is not a remark. sha256 is for images. Class IRI: http://smart.who.int/kg/publication-element. |
| [Knowledge graph L1: Publication section](StructureDefinition-KGPublicationSection.md) | A chapter, annex or numbered section, at any depth. Class IRI: http://smart.who.int/kg/publication-section. |
| [Knowledge graph L1: Recommendation](StructureDefinition-KGRecommendation.md) | A normative statement from a WHO guideline. Kinds other than a graded recommendation (context-specific, research-only, good practice statement, no-recommendation) are the same node with a different kind. statement is verbatim and is the only stored copy. intervention, population, setting, provider and timing are verbatim slots taken from the statement, its remarks, or the enclosing caption or heading. setting absorbs the former conditionality. identifier is the published number (e.g. A.1.1), used in the IRI; sub-recommendations append their letter. Class IRI: http://smart.who.int/kg/recommendation. |
| [Knowledge graph L1: Reference entry](StructureDefinition-KGReferenceEntry.md) | One row of a DAK artefact's own reference list: '(1)' and the full bibliographic text and URL it stands for. Resolved once; every citation numbered to it shares the result. Class IRI: http://smart.who.int/kg/reference-entry. |
| [Knowledge graph L1: Remark](StructureDefinition-KGRemark.md) | A remark attached to a recommendation (handbook §10.6). May also be printed as a table footnote. Class IRI: http://smart.who.int/kg/remark. |
| [Knowledge graph L1: Terminology code](StructureDefinition-KGTerminologyCode.md) | A code in an external terminology — ICD-10, ICD-11, SNOMED CT, ATC, or a WHO classification such as CDHI. CROSS-REFERENCE ONLY. It records system, code and display, and asserts NOTHING about the terminology: no hierarchy, no subsumption, no synonyms, no post-coordination. The terminology has its own authority, its own release cycle and its own tooling, and a partial copy here would be wrong within one release. Resolve meaning against the terminology server, not against this graph. Derives from Coding (FHIR R4 core datatype); system, code, display, version are its elements. Class IRI: http://smart.who.int/kg/terminology-code. |
| [Knowledge graph L1: graph document](StructureDefinition-KGGraphDocument.md) | One L1 knowledge-graph document: typed nodes and reified edges, provenance-pinned to the sources it was extracted from. In JSON the context element is written @context. |
| [Knowledge graph: edge](StructureDefinition-KGEdge.md) | One reified statement: a predicate from a source node to a target node, with its derivation and evidence. |
| [Knowledge graph: evidence location](StructureDefinition-KGEvidenceLocation.md) | Where a node or edge came from in its source. Required on anything not mechanically derived. |
| [Knowledge graph: node](StructureDefinition-KGNode.md) | One typed node of a knowledge-graph document. Its instance fields are an instance of the logical model of its class (see definedBy), e.g. KGPublication for a publication. |
| [Knowledge graph: provenance source](StructureDefinition-KGProvenanceSource.md) | A source a graph document was extracted from, pinned by hash. |
| [Non-Functional Requirement (DAK)](StructureDefinition-NonFunctionalRequirement.md) | Logical Model for representing non-functional requirement from a DAK |
| [Persona (DAK)](StructureDefinition-Persona.md) | Logical Model for representing Personas from a DAK |
| [Program Indicator (DAK)](StructureDefinition-ProgramIndicator.md) | Logical Model for representing Program Indicators from a DAK. Core set of indicators that need to be aggregated for decision-making, performance metrics and subnational and national reporting. |
| [Program Indicator Source](StructureDefinition-ProgramIndicatorSource.md) | Source reference for Program Indicator - exactly one of the following must be provided:* url (url data type): URL to retrieve ProgramIndicator definition from input/ or external source
* canonical (canonical data type): Canonical URI pointing to the ProgramIndicator definition
* instance: Inline ProgramIndicator instance data
 |
| [Requirements Source](StructureDefinition-RequirementsSource.md) | Source reference for Requirements - exactly one of the following must be provided:* url (url data type): URL to retrieve Requirements definition from input/ or external source
* canonical (canonical data type): Canonical URI pointing to the Requirements definition
* instance: Inline Requirements instance data
 |
| [SUSHI Configuration Logical Model](StructureDefinition-SushiConfigLogicalModel.md) | Logical model defining the structure of sushi-config.yaml files used for FHIR Implementation Guide configuration. This model captures the essential metadata and configuration parameters needed for IG publishing. |
| [Test Scenario (DAK)](StructureDefinition-TestScenario.md) | Logical Model for representing Test Scenarios from a DAK. A set of test scenarios to validate an implementation of the DAK. |
| [Test Scenario Source](StructureDefinition-TestScenarioSource.md) | Source reference for Test Scenario - exactly one of the following must be provided:* url (url data type): URL to retrieve TestScenario definition from input/ or external source
* canonical (canonical data type): Canonical URI pointing to the TestScenario definition
* instance: Inline TestScenario instance data
 |
| [User Scenario (DAK)](StructureDefinition-UserScenario.md) | Logical Model for representing User Scenarios from a DAK. Narratives that describe how the different personas may interact with each other. |
| [User Scenario Source](StructureDefinition-UserScenarioSource.md) | Source reference for User Scenario - exactly one of the following must be provided:* url (url data type): URL to retrieve UserScenario definition from input/ or external source
* canonical (canonical data type): Canonical URI pointing to the UserScenario definition
* instance: Inline UserScenario instance data
 |

### Structures: Questionnaires 

These define forms used by systems conforming to this implementation guide to capture or expose data to end users.

| | |
| :--- | :--- |
| [Questionnaire for IMMZ.D2 Determine required vaccination(s) if any](Questionnaire-DAK.DT.IMMZ.D2.DT.BCGQuestionnaire.md) | Auto-generated questionnaire for decision table DAK.DT.IMMZ.D2.DT.BCG |

### Structures: Resource Profiles 

These define constraints on FHIR resources for systems conforming to this implementation guide.

| | |
| :--- | :--- |
| [SMART Guidelines Communication Request](StructureDefinition-SGCommunicationRequest.md) | Provide communication |
| [SMART Guidelines Decision Table](StructureDefinition-SGDecisionTable.md) | Defines the minimum expectations for PlanDefinition resources used in SMART Guidelines which are derived from DAK Decision Tables |
| [SMART Guidelines Requirements](StructureDefinition-SGRequirements.md) | Smart Guidelines Requirements |

### Structures: Extension Definitions 

These define constraints on FHIR data types for systems conforming to this implementation guide.

| | |
| :--- | :--- |
| [LinkIdExt](StructureDefinition-LinkIdExt.md) | Smart Guidelines link identifier extension |
| [Markdown](StructureDefinition-Markdown.md) | Markdown extension |
| [SGActorExt](StructureDefinition-SGActorExt.md) | Smart Guidelines Actor Reference extension |
| [SGDocumentation](StructureDefinition-SGDocumentation.md) | Smart Guidelines Documentation extension |
| [SGMarkdown](StructureDefinition-SGMarkdown.md) | Smart Guidelines markdown extension |
| [SGRequirementExt](StructureDefinition-SGRequirementExt.md) | Smart Guidelines Requirements extension |
| [SGString](StructureDefinition-SGString.md) | Smart Guidelines (required) string extension for use in a complex extension |
| [SGTask](StructureDefinition-SGTask.md) | Extension to reference SMART Guidelines task type |
| [SGUserStory](StructureDefinition-SGUserStory.md) | Smart Guidelines extension to support structured User Stories (As a `Actor` I want to `capability` so that `benefit`) extension |
| [SGcode](StructureDefinition-SGcode.md) | Smart Guidelines code extension |
| [Satisfies](StructureDefinition-Satisfies.md) | Indicates that if the conditions for this requirement are satisified, then that it should be viewed as satisifying the referenced requirement. |

### Terminology: Value Sets 

These define sets of codes used by systems conforming to this implementation guide.

| | |
| :--- | :--- |
| [Classification of Digital Health Interventions v1](ValueSet-CDHIv1.md) | Value Set for Classification of Digital Health Interventions v1. Autogenerated from DAK artifacts |
| [Classification of Digital Health Interventions v2](ValueSet-CDHIv2.md) | Value Set for the Classification of Digital Interventions, Services and Applications in Health (CDISAH), second edition (2023). |
| [Core Data Element Type Value Set](ValueSet-CoreDataElementTypeVS.md) | Value set of core data element types |
| [Digital Health Interventions for Clients](ValueSet-CDHIv1.1.md) | Digital Health Interventions whose primary user group is Clients (persons using health services). Group 1 of the Classification of Digital Health Interventions v1 (2018). |
| [Digital Health Interventions for Health Management and Support Personnel](ValueSet-CDHIv2.3.md) | Digital Health Interventions whose primary user group is Health Management and Support Personnel. Group 3 of the Classification of Digital Interventions, Services and Applications in Health v2 (CDISAH, 2023). |
| [Digital Health Interventions for Health System Managers](ValueSet-CDHIv1.3.md) | Digital Health Interventions whose primary user group is Health System Managers. Group 3 of the Classification of Digital Health Interventions v1 (2018). |
| [Digital Health Interventions for Health Workers](ValueSet-CDHIv1.2.md) | Digital Health Interventions whose primary user group is Health Workers. Group 2 of the Classification of Digital Health Interventions v1 (2018). |
| [Digital Health Interventions for Healthcare Providers](ValueSet-CDHIv2.2.md) | Digital Health Interventions whose primary user group is Healthcare Providers. Group 2 of the Classification of Digital Interventions, Services and Applications in Health v2 (CDISAH, 2023). |
| [Digital Health Interventions for Persons](ValueSet-CDHIv2.1.md) | Digital Health Interventions whose primary user group is Persons (health service users). Group 1 of the Classification of Digital Interventions, Services and Applications in Health v2 (CDISAH, 2023). |
| [Digital Health Interventions: Data Services](ValueSet-CDHIv1.4.md) | Crosscutting Data Services DHIs. Group 4 of the Classification of Digital Health Interventions v1 (2018). |
| [Digital Health Interventions: Data Services](ValueSet-CDHIv2.4.md) | Crosscutting Data Services DHIs. Group 4 of the Classification of Digital Interventions, Services and Applications in Health v2 (CDISAH, 2023). |
| [Health System Challenges](ValueSet-CDSCv1.md) | Value set for Health System Challenges (Classification of Digital Health System Categories v1, 2018). Includes all 25 system category codes (A–Y). |
| [ISCO-08 Value Set](ValueSet-ISCO08ValueSet.md) | Extensible value set of ISCO-08 codes for persona classification |
| [Knowledge graph L1: certainty](ValueSet-KGCertaintyVS.md) | All codes of KGCertainty. |
| [Knowledge graph L1: change status](ValueSet-KGChangeStatusVS.md) | All codes of KGChangeStatus. |
| [Knowledge graph L1: citation kind](ValueSet-KGCitationKindVS.md) | All codes of KGCitationKind. |
| [Knowledge graph L1: classes](ValueSet-KGL1ClassesVS.md) | All codes of KGL1Classes. |
| [Knowledge graph L1: element type](ValueSet-KGElementTypeVS.md) | All codes of KGElementType. |
| [Knowledge graph L1: evidence type](ValueSet-KGEvidenceTypeVS.md) | All codes of KGEvidenceType. |
| [Knowledge graph L1: grc status](ValueSet-KGGrcStatusVS.md) | All codes of KGGrcStatus. |
| [Knowledge graph L1: identifier type](ValueSet-KGIdentifierTypeVS.md) | All codes of KGIdentifierType. |
| [Knowledge graph L1: intervention type](ValueSet-KGInterventionTypeVS.md) | All codes of KGInterventionType. |
| [Knowledge graph L1: outcome importance](ValueSet-KGOutcomeImportanceVS.md) | All codes of KGOutcomeImportance. |
| [Knowledge graph L1: predicates](ValueSet-KGL1PredicatesVS.md) | All codes of KGL1Predicates. |
| [Knowledge graph L1: publication type](ValueSet-KGPublicationTypeVS.md) | All codes of KGPublicationType. |
| [Knowledge graph L1: recommendation direction](ValueSet-KGRecommendationDirectionVS.md) | All codes of KGRecommendationDirection. |
| [Knowledge graph L1: recommendation kind](ValueSet-KGRecommendationKindVS.md) | All codes of KGRecommendationKind. |
| [Knowledge graph L1: recommendation status](ValueSet-KGRecommendationStatusVS.md) | All codes of KGRecommendationStatus. |
| [Knowledge graph L1: recommendation strength](ValueSet-KGRecommendationStrengthVS.md) | All codes of KGRecommendationStrength. |
| [Knowledge graph L1: remark type](ValueSet-KGRemarkTypeVS.md) | All codes of KGRemarkType. |
| [Knowledge graph L1: resolution status](ValueSet-KGResolutionStatusVS.md) | All codes of KGResolutionStatus. |
| [Knowledge graph L1: row type](ValueSet-KGRowTypeVS.md) | All codes of KGRowType. |
| [Knowledge graph L1: terminology system](ValueSet-KGTerminologySystemVS.md) | All codes of KGTerminologySystem. |
| [Knowledge graph L1Library: classes](ValueSet-KGL1LibraryClassesVS.md) | All codes of KGL1LibraryClasses. |
| [Knowledge graph L1Library: predicates](ValueSet-KGL1LibraryPredicatesVS.md) | All codes of KGL1LibraryPredicates. |
| [Knowledge graph: derivation](ValueSet-KGDerivationVS.md) | All codes of KGDerivation. |
| [SMART Guidelines Authoring Persona Types ValueSet](ValueSet-SGAuthoringPersonaTypesVS.md) | ValueSet for SMART Guidelines authoring persona types |
| [SMART Guidelines Authoring Skills ValueSet](ValueSet-SGAuthoringSkillsVS.md) | ValueSet for all SMART Guidelines authoring skill capabilities |
| [Services and Application Types](ValueSet-CDSCv2.md) | Value set for Services and Application Types (Classification of Digital Health Services and Application Types v2, CDISAH 2023). Includes all codes across the five architecture groups (A–E). |
| [Services and Application Types: Data Management Services](ValueSet-CDSCv2.D.md) | Services and systems that support the collection, aggregation, storage, analysis, and exchange of health data. Group D of the Classification of Digital Health Services and Application Types v2 (CDISAH, 2023). |
| [Services and Application Types: Health System/Provider Administration](ValueSet-CDSCv2.B.md) | Systems that support the administrative and managerial functions of health systems and healthcare organisations. Group B of the Classification of Digital Health Services and Application Types v2 (CDISAH, 2023). |
| [Services and Application Types: Point of Service](ValueSet-CDSCv2.A.md) | Systems that facilitate the provision and delivery of healthcare services to persons at the point of care. Group A of the Classification of Digital Health Services and Application Types v2 (CDISAH, 2023). |
| [Services and Application Types: Registries and Directories](ValueSet-CDSCv2.C.md) | Systems that create, maintain, and provide authoritative master records for persons, providers, facilities, products and health events. Group C of the Classification of Digital Health Services and Application Types v2 (CDISAH, 2023). |
| [Services and Application Types: Surveillance and Response](ValueSet-CDSCv2.E.md) | Systems that support the detection, monitoring, and response to disease outbreaks and public health threats. Group E of the Classification of Digital Health Services and Application Types v2 (CDISAH, 2023). |
| [Smart Guidelines Decision Table Actions](ValueSet-DecisionTableActions.md) | Value Set for Smart Guidelines Documentation Decision Table Actions |
| [Smart Guidelines Documentation Section](ValueSet-DocumentationSection.md) | Value Set for Smart Guidelines Documentation Section to autogenerate documentation from artifacts |
| [Smart Guidelines Persona Types Value Set](ValueSet-SGPersonaTypesVS.md) | Value Set for Smart Guidelines Persona Section to autogenerate documentation from artifacts |

### Terminology: Code Systems 

These define new code systems used by systems conforming to this implementation guide.

| | |
| :--- | :--- |
| [Classification of Digital Health Interventions v1](CodeSystem-CDHIv1.md) | CodeSystem for Classification of Digital Health Interventions v1. Autogenerated from DAK artifacts |
| [Classification of Digital Health Interventions v2](CodeSystem-CDHIv2.md) | CodeSystem for the Classification of Digital Interventions, Services and Applications in Health (CDISAH), second edition (2023). ISBN 978-92-4-008194-9.Organised into four groups based on the primary user:1. Persons
1. Healthcare providers
1. Health management and support personnel
1. Data services
New categories vs v1: 1.4.4, 1.6.2, 1.8, 2.5.6, 2.11, 3.1.5, 3.5.7, 3.5.8, 3.8, 4.3.5, 4.4.2, 4.4.3, 4.5. See ConceptMap CDHIv1toCDHIv2 for the full mapping from the first edition. |
| [Classification of Digital Health Services and Application Types v2](CodeSystem-CDSCv2.md) | CodeSystem for the Classification of Digital Health Services and Application Types v2, as defined in the Classification of Digital Interventions, Services and Applications in Health (CDISAH), second edition (2023). ISBN 978-92-4-008194-9.Services and Application Types represent the types of software, ICT systems and services or communication channels that deliver or execute digital health interventions (DHIs) and health content.The types are organised into five representations within the Digital Health Architecture: A. Point of service B. Health system/Provider administration C. Registries and Directories D. Data Management services E. Surveillance and Response |
| [Classification of Digital Health System Categories v1](CodeSystem-CDSCv1.md) | CodeSystem for Classification of Digital Health System Categories v1. Autogenerated from DAK artifacts |
| [Core Data Element Type](CodeSystem-CoreDataElementType.md) | CodeSystem for Core Data Element types - defines the type of FHIR resource that a Core Data Element references. |
| [International Standard Classification of Occupations 2008](CodeSystem-ISCO08.md) | ISCO-08 codes from the International Labour Organization official classification |
| [Knowledge graph L1: certainty](CodeSystem-KGCertainty.md) | GRADE certainty of evidence. The 2014 handbook calls it quality of evidence and names certainty as a synonym (§9.1). Rated per outcome on evidence; the overall certainty on a recommendation is the lowest across its critical outcomes (§9.6). Source: smart-kg ontology/l1/l1.json valueSets "certainty"; WHO handbook for guideline development (2014) §9.1, §9.5–9.6. |
| [Knowledge graph L1: change status](CodeSystem-KGChangeStatus.md) | Whether this edition of a consolidated guideline introduces, updates or carries a recommendation or indicator unchanged. Printed as NEW / UPDATE tags. Source: smart-kg ontology/l1/l1.json valueSets "change-status"; Consolidated guidelines on person-centred HIV strategic information (2022), summary recommendations; handbook §1.7.2. |
| [Knowledge graph L1: citation kind](CodeSystem-KGCitationKind.md) | Whether a citation string names a source, or stands in for one that is missing. Source: smart-kg ontology/l1/l1.json valueSets "citation-kind"; IMMZ DAK indicators workbook: '[Add appropriate reference]'. |
| [Knowledge graph L1: classes](CodeSystem-KGL1Classes.md) | The classes of the L1 layer of the SMART Guidelines knowledge graph. A node's `type` is one of these. Source: kg/src/L1.ts (migrated from smart-kg ontology/L1/L1.json). |
| [Knowledge graph L1: element type](CodeSystem-KGElementType.md) | What kind of printed block a publication element is. Source: smart-kg ontology/l1/l1.json valueSets "element-type"; Observed in the ANC and HIV SI guidelines and the immunization summary tables. |
| [Knowledge graph L1: evidence type](CodeSystem-KGEvidenceType.md) | Which kind of evidence a row is, and so which scale its certainty is on: GRADE for effects, GRADE-CERQual for qualitative findings. Source: smart-kg ontology/l1/l1.json valueSets "evidence-type"; ANC guideline (2016) methods (GRADE and GRADE-CERQual). |
| [Knowledge graph L1: grc status](CodeSystem-KGGrcStatus.md) | Whether the Guideline Review Committee approved the publication. All WHO publications containing recommendations must be approved (handbook §1.10.1); a consolidated guideline whose recommendations were all previously approved and unchanged does not require review (§1.7.2). Absent means not recorded — not the same as not reviewed. Source: smart-kg ontology/l1/l1.json valueSets "grc-status"; WHO handbook for guideline development (2014), §1.7.2, §1.10.1. |
| [Knowledge graph L1: identifier type](CodeSystem-KGIdentifierType.md) | Which kind of identifier a publication carries. The first available, in this order, builds the publication IRI. url comes last: a web address is the least stable identifier and is used only for sources that have no other. Source: smart-kg ontology/l1/l1.json valueSets "identifier-type"; WHO IRIS practice; CDHIv2.fsh carries an ISBN. |
| [Knowledge graph L1: intervention type](CodeSystem-KGInterventionType.md) | DRAFT. What kind of intervention a recommendation or catalogued intervention concerns. To be aligned with the UHC Compendium's categories once checked. Source: smart-kg ontology/l1/l1.json valueSets "intervention-type"; WHO handbook §1.7.1 (clinical, health system, public health, diagnostic, surveillance); digital interventions per CDHI. |
| [Knowledge graph L1: outcome importance](CodeSystem-KGOutcomeImportance.md) | How the guideline development group rated an outcome on the 1–9 scale: 7–9 critical, 4–6 important. Unimportant outcomes are not carried into evidence profiles, so they have no code here. Source: smart-kg ontology/l1/l1.json valueSets "outcome-importance"; WHO handbook for guideline development (2014) §7.6, Fig. 7.1. |
| [Knowledge graph L1: predicates](CodeSystem-KGL1Predicates.md) | The predicates of the L1 layer. An edge's `predicate` is one of these; which (source, target) pairs each licenses is the layer's edge table. Source: kg/src/L1.ts (migrated from smart-kg ontology/L1/L1.json). |
| [Knowledge graph L1: publication type](CodeSystem-KGPublicationType.md) | What kind of publication this is. The distinction that matters most for provenance is guideline versus not: a summary table or position paper restates recommendations made elsewhere, and a §1.9 product makes none of its own. Conflating them makes a citation resolve to the wrong authority. Source: smart-kg ontology/l1/l1.json valueSets "publication-type"; WHO handbook for guideline development (2014), Table 1.2 and §1.7–1.9; the BCG decision table's citation for summary-table; CDHIv2.fsh for classification. |
| [Knowledge graph L1: recommendation direction](CodeSystem-KGRecommendationDirection.md) | For or against. The handbook prefers "we recommend against X" to "X is not recommended", which is ambiguous between against and no recommendation (§10.6). Source: smart-kg ontology/l1/l1.json valueSets "recommendation-direction"; WHO handbook for guideline development (2014) §10.1, §10.6. |
| [Knowledge graph L1: recommendation kind](CodeSystem-KGRecommendationKind.md) | What sort of normative statement this is. Grading is optional: ANC 2016 prints a direction ('Recommended', 'Not recommended') and no GRADE strength. A strength always needs a direction. A good practice statement and a no-recommendation carry no strength or certainty, and a no-recommendation carries no direction. Source: smart-kg ontology/l1/l1.json valueSets "recommendation-kind"; WHO handbook §10.4, §10.7; ANC guideline (2016) Table 1, verified; Guyatt et al. 2016 on good practice statements. |
| [Knowledge graph L1: recommendation status](CodeSystem-KGRecommendationStatus.md) | Whether a recommendation is still in force. Recommendations in one guideline go out of date at different times (§1.7.2), and a department that doubts a recommendation's validity should say so before the update is done (§12.5.4). This is what impact analysis filters on. Source: smart-kg ontology/l1/l1.json valueSets "recommendation-status"; WHO handbook for guideline development (2014) §1.7.2, §12.5. |
| [Knowledge graph L1: recommendation strength](CodeSystem-KGRecommendationStrength.md) | GRADE strength. Strength is not certainty: a strong recommendation can rest on low-certainty evidence and a conditional one on high. Record "weak" as conditional; the handbook treats them as synonyms (§10.4). Source: smart-kg ontology/l1/l1.json valueSets "recommendation-strength"; WHO handbook for guideline development (2014) §10.4. |
| [Knowledge graph L1: remark type](CodeSystem-KGRemarkType.md) | What a remark is for. Grounded in the six remarks attached to ANC recommendation A.1.1. Source: smart-kg ontology/l1/l1.json valueSets "remark-type"; ANC guideline (2016) p. 15; handbook §10.6, §10.8. |
| [Knowledge graph L1: resolution status](CodeSystem-KGResolutionStatus.md) | Whether a citation string has been matched to what it cites. `ambiguous` is a legitimate terminal state — two publications with similar titles is a question for a person — and must not be collapsed to resolved. Source: smart-kg ontology/l1/l1.json valueSets "resolution-status"; docs/SCOPE.md. |
| [Knowledge graph L1: row type](CodeSystem-KGRowType.md) | The role of a row within a table. Source: smart-kg ontology/l1/l1.json valueSets "row-type"; HIV SI guideline Table 2.3; ANC Table 1. |
| [Knowledge graph L1: terminology system](CodeSystem-KGTerminologySystem.md) | Code systems a DAK is expected to use. An unknown system is a warning, because a misspelt system silently breaks joins across guidelines. Source: smart-kg ontology/l1/l1.json valueSets "terminology-system"; smart-base input/fsh/profiles/SGLogicalModel.fsh and Aliases.fsh; UHC Compendium; CDHIv2.fsh. |
| [Knowledge graph L1Library: classes](CodeSystem-KGL1LibraryClasses.md) | The classes of the L1Library layer of the SMART Guidelines knowledge graph. A node's `type` is one of these. Source: kg/src/l1-library.ts (migrated from smart-kg ontology/l1-library/l1-library.json). |
| [Knowledge graph L1Library: predicates](CodeSystem-KGL1LibraryPredicates.md) | The predicates of the L1Library layer. An edge's `predicate` is one of these; which (source, target) pairs each licenses is the layer's edge table. Source: kg/src/l1-library.ts (migrated from smart-kg ontology/l1-library/l1-library.json). |
| [Knowledge graph: derivation](CodeSystem-KGDerivation.md) | How a node or edge of a SMART Guidelines knowledge graph came to be. Every node and edge is exactly one of the three, and `decided` is the one a reviewer needs to find. Source: smart-kg shapes/recommendation-graph.schema.json $defs.derivation. |
| [SMART Guidelines Authoring Persona Types](CodeSystem-SGAuthoringPersonaTypes.md) | CodeSystem for SMART Guidelines authoring persona types. These represent roles involved in the authoring, review, and publication of SMART Guidelines and Digital Adaptation Kits, as distinct from the clinical/health personas defined within a DAK. |
| [SMART Guidelines Authoring Skills](CodeSystem-SGAuthoringSkills.md) | CodeSystem for SMART Guidelines authoring skill capabilities. Each code represents a discrete skill that an authoring persona may possess. Skills are used to define Requirements resources as capability statements. |
| [SMART Guidelines Persona Types](CodeSystem-SGPersonaTypes.md) | CodeSystem for SMART Guidelines Persona Types |
| [SMART Guidelines Tasks](CodeSystem-SGTasks.md) | CodeSystem for SMART Guidelines tasks which are specializations of the Business Process Modeling Notatiton (BPMN) tasks, which are included in this codesystemSee [BPMN Spectification](https://www.omg.org/spec/BPMN) for more info. The descriptions were adapted from the [normative human readable documentation](https://www.omg.org/spec/BPMN/2.0.2/PDF). |
| [Smart Guidelines Actions (columns) for Decision Tables](CodeSystem-DecisionTableActions.md) | CodeSystem for Smart Guidelines Documentation Actions for Decision Tables" |
| [Smart Guidelines Documentation Section](CodeSystem-DocumentationSections.md) | CodeSystem for Smart Guidelines Documentation Section to autogenerate documentation from artifacts |

### Terminology: Concept Maps 

These define transformations to convert between codes by systems conforming with this implementation guide.

| | |
| :--- | :--- |
| [Hierarchy of the Classification of Digital Health Interventions v1](ConceptMap-CDHIv1Hierarchy.md) | Mapping to represent hierarchy within the Classification of Digital Health Interventions v1. |
| [Hierarchy of the Classification of Digital Health Interventions v2](ConceptMap-CDHIv2Hierarchy.md) | Mapping to represent hierarchy within the Classification of Digital Interventions, Services and Applications in Health (CDISAH) v2. |
| [Mapping from CDHI v1 to CDISAH v2](ConceptMap-CDHIv1toCDHIv2.md) | Mapping from the Classification of Digital Health Interventions v1 (CDHI v1, 2018) to the Classification of Digital Interventions, Services and Applications in Health v2 (CDISAH v2, 2023).Key structural changes reflected in this map:* User group labels updated throughout (e.g. 'Clients' → 'Persons', 'Health workers' → 'Healthcare providers', 'Health system managers' → 'Health management and support personnel').
* Civil Registration and Vital Statistics (CRVS) consolidated: six v1 codes (3.4.1–3.4.6) merged into two v2 codes (3.4.1, 3.4.2).
* Health financing section restructured: v1 3.5.1 (insurance membership) and 3.5.2 (billing) updated; v1 3.5.3–3.5.6 shifted by one (now 3.5.4–3.5.6 + new 3.5.3).
* Data services (group 4) substantially revised: 4.1.1 changed scope, 4.3 expanded from 4 to 5 codes, 4.4 split from 1 to 3 codes, 4.5 is entirely new.
* New v2 categories with no v1 equivalent are listed as 'unmatched' targets.
 |
| [Mapping from CDSC v1 to Services and Application Types v2](ConceptMap-CDSCv1toCDSCv2.md) | Mapping from the Classification of Digital Health System Categories v1 (CDSCv1, 2018) to the Classification of Digital Health Services and Application Types v2 (CDSCv2, 2023).The v1 used 25 single-letter codes (A–Y). The v2 completely restructured this into 5 representations within the digital health enterprise architecture, each with alphanumeric codes (A1–A9, B1–B8, C1–C11, D1–D8, E1–E2).Several new v2 categories have no v1 equivalent: A3 (Decision support), A4 (Diagnostics), B1 (Blood bank), B3 (Health program monitoring), B7 (Patient administration), C4 (Facility registries), C5 (Health worker registry), C7 (Immunisation information), C8 (Master patient index), C9 (Product catalogues), C10 (Public Key directories), D1 (Analytics), D3 (Data warehouses). |

