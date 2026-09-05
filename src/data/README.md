# Professional profile data

This first migration unit adds data and target selection only. The existing HTML
and PDF generator do not consume these files yet; they remain unchanged until
their separately approved migration units. No new runtime dependency is needed.

## Files and relationships

- `professional-profile.json` owns identity, contact, location, positioning,
  skills, organizations, professional history, assignments, education, training,
  awards, projects and languages.
- `targets/amadeus-r35120.json` selects records by ID and defines order and PDF
  presentation. It must not copy dates, employer names, skill facts or bullets.
- `schemaVersion` versions the data contract. IDs are stable within a collection.
  `profileId` links the target to its source profile.
- `headlineRef` and `summaryRef` resolve profile fields. The summary, translated
  credential and English experience bullets are reserved for the content unit.

## Evidence and publication

`verified` means explicitly confirmed by the user. `repository-only` preserves
existing content and its Git source; it is not a new user confirmation.
`needs-validation` means unresolved evidence, `not-provided` means missing data,
and `pending-editorial-review` means English wording has not been prepared.

An experience's status covers its organization, dates, kind and assignments.
Nested titles and highlights have their own status and source. A parent marked
verified must never promote a repository-only title to a verified title.
Organization names inherit the evidence of the referencing record. TCS assignment
records inherit their employment record's confirmation.

Future renderers must select fields explicitly. They must not dump the whole
profile or render source references, title candidates, evidence notes or records
with `public: false`. Source files are traceability references, not public assets.
The current Pages workflow does not copy `src/data` into its deployment artifact.
Do not copy the internal Digital Profile or its personnel identifiers into a
future public bundle. Internal proficiency classifications are intentionally not
imported: they are unnecessary for this target and are not external skill levels.

The target's `reviewCandidates` are not selected content. Training, awards and
projects remain candidates until their evidence and wording are reviewed. The
`training` collection supports `training`, `certification` and `needs-validation`
kinds; listing an item in the old CV's certification section does not establish
that it is a professional certification. A null English proficiency must never
be inferred from CV language or converted to a CEFR level.

## Chronology and scope

Dates use `YYYY-MM`, preserving the precision confirmed by the user. A null
experience/assignment end means ongoing; it does not mean unknown. Month-level
boundaries cannot establish exact handover days or overlapping workdays.

TCS is an `employment` record. Bancolombia and Banistmo are nested client
assignments, never separate employment. SUMMA is internal; the brief August
transition is preserved but omitted from public target selection.

SoftwareONE and Intergrupo are `consulting-engagement` records sharing a
`parallelGroupId`. Their real overlap is intentional. Do not invent an employment
contract, intermediary relationship or revised dates to explain it. Other history
uses `professional-experience` where the contractual relationship was not given.

The SOAP/RUES highlight records consumption from Java EE applications deployed on
IBM WebSphere Application Server, with explicit exclusions for SOAP service
development and maintenance. A related organization does not establish direct
employment or a contractual relationship with that organization.

The target keeps Personal Soft, Extreme Technologies and SENA as chronology-only
entries, avoiding an unexplained 2020-2021 gap without inventing responsibilities
or titles. The two earliest records remain in the complete model but are not
selected. Assignment IDs may be summarized by client within TCS for the CV.

## Pending content decisions

- TCS title: the Digital Profile says `Developer I.T. Analyst`; the old CV says
  `Senior Software Engineering`. Neither is silently chosen or rewritten.
- SENA's confirmed period is consolidated; the two old role labels do not prove
  a single title or the dates of promotions. Chronology-only rendering needs no
  guessed title.
- New historical employers have no supplied titles or responsibilities.
- Education retains the verified original 2015 credential. The unverified
  2016-2017 degree entry is excluded, not translated into a bachelor's degree.
- English proficiency remains unspecified. Identity, contact and Spanish native
  proficiency retain their repository provenance.
- Existing numerical achievements and leadership claims are not imported as
  verified facts. The baseline Git references preserve them for review. Later
  content should describe supported technical scope instead of unsupported
  numbers. SAFe is not a verified skill and must not be selected or inferred.
- Project records currently form an inventory, not complete project descriptions.
  Details and links belong to the later content/portfolio migration.

## Validation contract

Before staging, parse both JSON files; check unique IDs, source references,
organization/skill/selection references, chronological ranges and nested
assignment containment. Check TCS as the only ongoing employment, the exact
parallel consulting dates, SOAP consumption exclusions, verified education,
relocation and the lack of inferred language/internal skill levels. Selected
assignments must belong to their employment and be public. Candidate lists must
not be rendered as selected lists. The target must select only verified skills.

This unit does not claim that an actual two-page PDF has been generated or
validated. Visual layout, extraction, English content, metadata and deterministic
PDF output remain acceptance checks for the dedicated PDF unit.
