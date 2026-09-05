# Professional profile data

The first two migration units add data, target selection and English content.
The existing HTML
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
- `headlineRef` and `summaryRef` resolve profile fields. English wording lives in
  the profile; the target selects highlight IDs and provides English section labels.

## Evidence and publication

`verified` means explicitly confirmed by the user. `repository-only` preserves
existing content and its Git source; it is not a new user confirmation.
`needs-validation` means unresolved evidence and `not-provided` means missing data.

For content, `pending-editorial-review` means wording awaits user approval;
`editorialStatus: pending-review` serves the same purpose on individual records.
Editorial approval and factual provenance are separate: approving English wording
does not turn a repository-only claim into a newly user-verified fact. Summary
`sources` lists the evidence used to compose its text. Target `contentStatus`
remains pending until the content commit gate is approved.

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

- The user confirmed `Developer I.T. Analyst` as the official TCS designation.
  `title.kind: official` preserves that fact. `functionalRole` separately proposes
  `Full Stack Engineer`; it does not rename the official designation. The target's
  `functional-only` presentation renders only the functional role, as explicitly
  requested for Amadeus. The official title remains verified in the model and is
  not rendered by this target. The previous conflicting CV title is not used.
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

## English content review

The summary and selected highlights now provide the proposed English CV text.
They omit numerical achievements, internal proficiency codes and unsupported
leadership language. The baseline still supplies technical scope for several
bullets; their `repository-only` status is retained. RxJS and Bootstrap are in
Technical Skills, without inventing a particular employer/project attribution.
The confirmed SonarQube and SOAP contributions have their own experience bullets.

The original SENA credential is preserved alongside a descriptive English
translation. This does not assert equivalence to a bachelor's or associate degree.
Organization names remain proper names. Dates must be formatted in the target's
English locale using only the confirmed month precision.

Public content should derive city, country and relocation from `location`, and
the parallel consulting note from `parallelGroups`. Client names are derived from
the selected TCS assignments and can be deduplicated when summarized. Do not
repeat employment entries for those clients or render nonpublic assignments.

No title candidate or placeholder should be printed in the final CV.
Chronology-only entries may omit unknown titles.
Language names may be rendered without a proficiency descriptor where it is null;
the English prose itself is not evidence of spoken English proficiency.

Training, awards and projects remain unselected review candidates. Their absence
does not block a concise experience-first CV; adding them requires a separate
selection decision based on relevance, evidence and available page space.

This unit does not claim that an actual two-page PDF has been generated or
validated. Visual layout, extraction, English content, metadata and deterministic
PDF output remain acceptance checks for the dedicated PDF unit.
