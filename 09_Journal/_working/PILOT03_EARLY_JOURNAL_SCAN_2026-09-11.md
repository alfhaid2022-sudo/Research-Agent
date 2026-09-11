# PILOT-03 — EARLY JOURNAL SCAN (protocol-shaping constraints)

**Date of verification attempts:** 2026-09-11
**Prepared by:** Journal Selection & Submission Compliance agent
**Status:** EARLY SCAN ONLY. **This is not the Stage 13 final journal selection.** No ranking here is a submission recommendation. Final selection happens after the manuscript exists and after G6/G7.
**Study (fixed):** primary, multi-centre observational laboratory study; RHD/RHCE genotyping in Gulf/GCC blood donors; variant allele frequencies + serology–genotype concordance; possible extension to match-probability modelling against transfusion-dependent thalassemia/SCD recipient phenotypes. PI Saudi-based.

> No statement in this file guarantees or implies acceptance by any journal.

---

## 0. VERIFICATION CAPABILITY IN THIS SESSION — READ FIRST

This is the single most important caveat in the document. **Primary-source verification of journal policy was not possible in this session.**

Tested directly on 2026-09-11, both by `curl` (CONNECT tunnel 403) and by WebFetch (`EGRESS_BLOCKED`):

| Domain | Needed for | Result |
|---|---|---|
| `onlinelibrary.wiley.com` | Vox Sanguinis, Transfusion, Transfusion Medicine, IJLH author guidelines | **BLOCKED** |
| `authorservices.wiley.com` | Wiley editorial/registration/AI policy | **BLOCKED** |
| `www.sciencedirect.com` | Transfus Apher Sci, Transfus Clin Biol guides | **BLOCKED** |
| `www.elsevier.com` | Elsevier policy pages | **BLOCKED** |
| `www.trasci.com` | Transfus Apher Sci society site | **BLOCKED** |
| `www.icmje.org` | ICMJE registration recommendation (primary text) | **BLOCKED** |
| `www.equator-network.org` | STROBE / STARD primary text | **BLOCKED** |
| `clinicaltrials.gov`, `www.isrctn.com`, `osf.io`, `trialsearch.who.int` | registry eligibility rules | **BLOCKED** |
| `doaj.org`, `publicationethics.org` | DOAJ listing, COPE membership | **BLOCKED** |
| `jcr.clarivate.com`, `www.scimagojr.com` | JCR quartile / impact factor / CiteScore | **BLOCKED** |
| `www.isbtweb.org` | ISBT allele nomenclature tables | **BLOCKED** |
| `www.bloodtransfusion.it`, `ajts.org`, `clin-lab-publications.com`, `karger.com`, `link.springer.com`, `aabb.org`, `pmc.ncbi.nlm.nih.gov`, `en.wikipedia.org` | misc. journal pages | **BLOCKED** |

**WebFetch appears to be blocked for every external domain attempted (14+ domains, zero successes).**

What *did* work: **PubMed via MCP** (strong, primary-record evidence) and **WebSearch** (returns an AI-generated summary of pages, not the page text).

**Consequence — and this is a hard rule applied throughout:**
- Claims marked `[EVIDENCE — PubMed]` are verified against retrieved PubMed records in this session.
- Claims marked `[PARTIALLY VERIFIED — SEARCH SNIPPET]` come from a WebSearch summariser that could not be checked against the source page. They are **indicative only** and must be re-checked by Dr. Alanazi on the journal's own site before they are allowed to constrain the protocol. One such snippet in this session was internally implausible (it reported a Transfusion and Apheresis Science *abstract* limit of "1,200 words", which is not a credible abstract limit) — direct proof that this channel is unreliable.
- **No impact factor, quartile, CiteScore, APC, acceptance rate, DOAJ listing or COPE membership is stated anywhere in this document.** None could be verified. All are `[UNVERIFIED — registry blocked]`.

---

## Q1. PROSPECTIVE REGISTRATION — the decision-critical question

### 1.1 What could and could not be established

I could **not** read a single journal's author-instruction page. Therefore I **cannot** tell you today, to the standard this project requires, which of the candidate journals require, recommend, or are silent on registration of observational studies. Presenting a per-journal require/recommend/silent table from search snippets would be exactly the kind of confident fabrication CLAUDE.md §1 forbids.

**This specific check is handed to Dr. Alanazi.** See §1.5 for the exact checklist.

### 1.2 The one substantive signal obtained

`[PARTIALLY VERIFIED — SEARCH SNIPPET]` Two independent WebSearch queries returned consistent wording attributed to the ICMJE clinical-trial-registration recommendation: the ICMJE **encourages** registration of non-trial designs including observational studies, but **purely observational studies — those in which assignment of the medical intervention is not at the investigator's discretion — are not required to be registered**. The same source states that retrospective registration (e.g. at manuscript submission) "meets none of the purposes" of registration.

`[PARTIALLY VERIFIED — SEARCH SNIPPET]` A snippet attributed to the Transfusion and Apheresis Science guide for authors repeated the same ICMJE formula: registration required for trials, "purely observational studies ... do not require registration", and trials "must be registered at or before the onset of patient enrolment".

`[INFERENCE]` If that ICMJE language is accurate and is inherited by the Wiley/Elsevier transfusion titles (which commonly adopt ICMJE recommendations verbatim), then **PILOT-03 as designed would most likely not be *required* to register** — it is a laboratory-observational study with no investigator-assigned intervention. This inference is **not a finding** and must not enter the protocol until §1.5 is completed.

### 1.3 Why the answer should be "register anyway"

`[RECOMMENDATION]` Regardless of how §1.5 resolves, the asymmetry is stark and one-directional:

- **Cost of registering prospectively:** a few hours of work, free on OSF Registries, before sample collection begins.
- **Cost of not registering:** irreversible. Registration cannot be applied retrospectively without disclosing it as retrospective. A reviewer who asks "was the variant-allele panel and the concordance definition pre-specified?" cannot be answered credibly after the fact. For a study whose headline outputs are *frequencies* and a *concordance rate* — both highly susceptible to post-hoc panel selection and post-hoc discordance re-adjudication — a prospective record is the strongest available defence and is directly aligned with CLAUDE.md §1 rules 3, 5 and 6.
- The match-probability modelling extension makes this sharper still: an unregistered, unpre-specified modelling extension invites the charge that the model was tuned after seeing the allele frequencies.

**The window is open now and closes at first sample collection.** This is the reason this scan was commissioned before the protocol.

### 1.4 Registries that would plausibly accept this design

| Registry | Would it take a purely observational lab study? | Verification status |
|---|---|---|
| **OSF Registries** | `[PARTIALLY VERIFIED — SEARCH SNIPPET]` Described as a general-purpose preregistration platform used for observational studies and secondary-data analyses, without needing to meet a clinical registry's eligibility criteria. Free. | `osf.io` **BLOCKED** — PI to confirm |
| **ISRCTN** | `[PARTIALLY VERIFIED — SEARCH SNIPPET]` Described as accepting both observational and interventional studies; recommends prospective but permits retrospective registration. Charges a fee. Snippet also referenced a UK-participant scope condition — **this could be disqualifying for a GCC-only study and must be checked.** | `isrctn.com` **BLOCKED** — PI to confirm |
| **ClinicalTrials.gov** | `[PARTIALLY VERIFIED — SEARCH SNIPPET]` Search results included observational studies hosted on clinicaltrials.gov with NCT numbers, indicating an observational study type exists. Whether a non-US laboratory-only donor study qualifies is unconfirmed. | `clinicaltrials.gov` **BLOCKED** — PI to confirm |
| **WHO ICTRP partner registries** (incl. any Saudi/regional primary registry) | Not assessed. | `trialsearch.who.int` **BLOCKED** |

`[RECOMMENDATION]` **OSF Registries is the pragmatic first choice** for this design — free, fast, explicitly built for observational preregistration, and produces a timestamped, citable, immutable record. ISRCTN is the fallback if a named ICTRP-partner registry turns out to be required by a target journal; its UK-scope condition must be resolved first.

### 1.5 What "prospective" means here — and the exact checks to run before the protocol is finalised

`[INFERENCE]` "Prospective" for this study means **registered before the first donor sample is collected or the first record is extracted for study purposes** — not before genotyping, and not before analysis. If any samples or donor records have already been collected for this study, the registration is retrospective and must be labelled as such in both the registry entry and the manuscript.

**Hand-off checklist for Dr. Alanazi (institutional access required; all blocked here):**
1. For each shortlisted journal, open the author-instruction page and search the text for: "registration", "registry", "observational", "prospectively registered". Record require / recommend / silent, with the date accessed and the URL.
2. Check whether any journal demands an ICTRP-partner registry specifically (which would rule OSF out).
3. Confirm on `osf.io` that OSF Registries accepts this study type and which template (e.g. a generic/OSF preregistration) fits a laboratory observational study.
4. Confirm on `isrctn.com` whether the UK-participant condition excludes a GCC-only study.
5. Establish the exact date of first sample/record collection and put it in the protocol, so prospective vs retrospective status is documented and cannot later be disputed.

---

## Q2. REPORTING STANDARD

### 2.1 STROBE — the primary standard

`[EVIDENCE — PubMed]` STROBE is the established reporting standard for observational research (cohort, case-control, cross-sectional), 22 checklist items, indexed in PubMed (e.g. PMID 18313558, PMID 30930717).
`[PARTIALLY VERIFIED — SEARCH SNIPPET]` At least one transfusion-medicine journal (Transfusion Medicine and Hemotherapy, Karger) reportedly states that a completed STROBE checklist is **required** for observational studies and that submissions lacking it are returned as incomplete. The corresponding requirement at the Wiley/Elsevier transfusion titles could not be read (`karger.com`, `onlinelibrary.wiley.com`, `sciencedirect.com` all **BLOCKED**).

`[RECOMMENDATION]` **Build the protocol to STROBE (cross-sectional variant) from the outset.** It is the lowest-cost assumption: no candidate journal will penalise STROBE compliance, and several will require it. Complete the checklist during protocol drafting, not at submission.

### 2.2 STARD — the component that should shape the protocol

The serology–genotype concordance component can legitimately be framed as a **diagnostic-accuracy / method-comparison** analysis, and `[INFERENCE]` this is where an early decision has real downstream consequences. If a reviewer reads the concordance analysis as an accuracy study and the protocol never pre-specified a reference standard, the paper is exposed.

`[RECOMMENDATION]` Decide **now**, in the protocol, and state it explicitly:
- Is genotype the reference standard and serology the index test, or the reverse? (For RHD/RHCE the defensible framing is usually genotype-as-reference, serology-as-index — but it must be argued and fixed.)
- Pre-specify the concordance metric (simple percent agreement is weak; specify Cohen's kappa and/or positive/negative agreement with 95% CI).
- Pre-specify the discordance-adjudication procedure, including who adjudicates, blinded to what, and what third method resolves ties. **Adjudicating discordances after seeing the results is the single most likely integrity criticism of this study.**
- Pre-specify handling of indeterminate/failed genotyping calls (they are not "missing at random").
- Record whether operators performing serology were blinded to genotype, and vice versa. If not blinded, say so — CLAUDE.md §7.

Whether any candidate journal *mandates* STARD in addition to STROBE could **not be verified** (`equator-network.org` and all publisher pages **BLOCKED**). `[RECOMMENDATION]` Adopt **STROBE as primary + STARD-informed methods reporting for the concordance component**. This dual approach costs little and satisfies either expectation. Keep both checklists in `01_Protocol/`.

### 2.3 Transfusion-specific reporting expectations and ISBT nomenclature

`[EVIDENCE — PubMed]` The **ISBT Working Party on Red Cell Immunogenetics and Blood Group Terminology** is the body that ratifies blood group systems, antigens and **alleles**, and it maintains the **allele nomenclature tables**. Its reports are published in **Vox Sanguinis** — the ISBT's journal:
- Gassner C, et al. *Vox Sang* 2022;117(11):1332-1344. PMID 36121188. DOI 10.1111/vox.13361 — states the WP "is charged with ratifying blood group systems, antigens and alleles" and "continues to update the blood group antigen tables and the allele nomenclature tables", hosted on the ISBT website.
- Storry JR, et al. *Vox Sang* 2018;114(1):95-102. PMID 30421425. DOI 10.1111/vox.12717.

`[EVIDENCE — PubMed]` Contemporary RHD/RHCE donor papers report alleles in ISBT format in practice — e.g. `RHCE*Ce`, `RHCE*ce`, `RHCE*ceAR`, `RHCE*CeN.08 (RHCE*02N.08)`, `RHD*01` appear as the reporting convention in PMID 41147787 and PMID 42397021 (both *Transfusion Medicine*).

`[INFERENCE]` Whether ISBT allele nomenclature is formally *mandated* in any journal's instructions could not be verified (`isbtweb.org` and all publisher pages **BLOCKED**). However, the field convention is unambiguous.
`[RECOMMENDATION]` **Write the protocol and the data dictionary in ISBT allele nomenclature from day one**, with the ISBT table version and access date recorded. Retro-fitting nomenclature after data collection is error-prone and reviewers in this field will notice. Also pre-specify: genotyping platform and version, assay coverage (which exons/introns/promoter), and the confirmatory method (e.g. NGS) for novel or ambiguous alleles — PMID 42397021 illustrates the expected depth (promoter, exons 1-10, introns 2-3).

---

## Q3. CANDIDATE LANDSCAPE (early, indicative)

**Scope fit below is evidenced by PubMed searches run in this session** (per the role rule: never assert fit from the title). Article types and word/figure limits could **not** be verified — publisher pages blocked — and are marked accordingly.

According to PubMed, searches run 2026-09-11:

| Journal | Scope-fit evidence (this session, PubMed) | Indexing currency | Limits / article types |
|---|---|---|---|
| **Transfusion Medicine** (Wiley/BBTS) | **Strongest demonstrated fit.** 237 hits for journal + RHD/RHCE/genotyping since 2021. Includes two Saudi RHD/RHCE donor papers: PMID 41147787 (DOI 10.1111/tme.70040), *Characterisation of RHD and RHCE variations in blood donors from Jazan Province* (2025, 36(2):158-164), and PMID 42397021 (DOI 10.1111/tme.70098), *First identification and molecular characterisation of a rare D- - donor in Saudi Arabia* (2026). | Records to 2026 | `[UNVERIFIED — page blocked]` |
| **Transfusion** (Wiley/AABB) | 144 hits for RHD/RHCE/genotyping + donors since 2021; e.g. PMID 39710624, *RHCE genotyping using next generation sequencing: allele specific reference sequences* (2024). Publishes methodologically deep RH genotyping work. | Records to 2026 | `[PARTIALLY VERIFIED — SEARCH SNIPPET]` research articles ~3,500 words excl. abstract/refs/legends; brief reports ~1,800 words, ≤3 figures/tables, ≤25 refs. **Must be re-checked.** |
| **Vox Sanguinis** (Wiley/ISBT) | 57 hits since 2021 for RHD/RHCE/blood group genotyping + donors. Home of the ISBT terminology working-party reports (PMID 36121188). Natural venue for allele-nomenclature-heavy work. | Records to 2026 | `[PARTIALLY VERIFIED — SEARCH SNIPPET]` Original Articles ≤5,000 words *inclusive* of title page, abstract, text, refs, legends and tables; structured abstract ≤250 words beginning "Background and Objectives". **Must be re-checked.** |
| **Transfusion and Apheresis Science** (Elsevier) | 207 hits since 2021. Publishes regional transfusion/immunohematology series, incl. Middle East (e.g. PMID 41151152, Iraq alloimmunisation). | Records to 2026 | `[PARTIALLY VERIFIED — SEARCH SNIPPET]` original paper ~3,000 words, ≤50 refs, no figure/table cap. **Snippet was internally unreliable; must be re-checked.** |
| **Blood Transfusion** (SIMTI) / **Transfusion Clinique et Biologique** (Elsevier) | Combined 305 hits since 2021 for RHD/RHCE/genotyping. `Blood Transfus` 1,714 records since 2025; `Transfus Clin Biol` 2,010 records since 2026 — both actively indexed. | Records to 2026 | `[UNVERIFIED — page blocked]` |
| **International Journal of Laboratory Hematology** (Wiley) | Part of a 64-hit combined search (with Clin Lab, AJTS) for RHD/RHCE/genotyping since 2020; 3,226 records since 2026 overall. Fit is plausible but **less demonstrated for donor RH genotyping specifically** than the transfusion titles. | Records to 2026 | `[UNVERIFIED — page blocked]` |
| **Clinical Laboratory** | Publishes Saudi immunohematology work — PMID 41670517, *The Incidences of S and s Antigens of the MNS Blood Group System in the Western Region of Saudi Arabia* (2026), PubMed article type **"Observational Study"**. 5,291 records since 2025. | Records to 2026 | `[UNVERIFIED — page blocked]` |
| **Asian Journal of Transfusion Science** | 917 records since 2025; part of the 64-hit RHD/RHCE combined search. Regional/descriptive transfusion science. | Records to 2025-26 | `[UNVERIFIED — page blocked]` |

### 3.1 Predatory screening

`[EVIDENCE — PubMed]` All nine candidates return **current PubMed records (2025-2026)** from searches run in this session — they are real, currently indexed journals, not simulacra. None was reached through a solicitation email. Titles are long-established and do not mimic another journal.

`[UNVERIFIED — registry blocked]` The remaining Think.Check.Submit items **could not be completed**: DOAJ listing (`doaj.org` blocked), COPE membership (`publicationethics.org` blocked), Scopus/Web of Science coverage and quartile (`jcr.clarivate.com`, `scimagojr.com` blocked), APC disclosure, editorial-board verifiability, publisher address, retraction/ethics policy.

`[INFERENCE]` PubMed/MEDLINE indexing plus long publication history is a **meaningful but not sufficient** predatory screen. No candidate here shows a red flag on the evidence available, and none is cleared. Full screening is deferred to Stage 13, when the shortlist is short and the checks can be run with access.

**No new or unfamiliar journal is proposed in this scan.** Any candidate arriving later by email solicitation is to be treated as a red flag on arrival.

---

## Q4. HONEST TIER ASSESSMENT

`[INFERENCE]` **Expectations should sit mid-tier, not at the top of the transfusion-medicine list — and the reason is specific, not generic pessimism.**

1. **Prior art already exists in this exact space, and it landed mid-tier.** PMID 41147787 characterised RHD and RHCE alleles in Saudi blood donors (Jazan) and self-describes in its abstract as "the first molecular characterisation of RHD and RHCE alleles in Saudi Arabia". It was published in **Transfusion Medicine**, not in *Transfusion* or *Blood Advances*. That is the single most informative datapoint in this scan: a well-executed Saudi donor RH genotyping study, published in 2025, found its level.
2. **This directly constrains the novelty claim.** PILOT-03 cannot be framed as the first molecular RH characterisation in Saudi Arabia. CLAUDE.md §7 forbids unsupported novelty claims, and this one is already contradicted by a PubMed-verified record. The defensible differentiators are (a) genuinely **multi-centre and multi-country GCC** coverage rather than one province, (b) the **serology–genotype concordance** component done to a pre-specified standard, and (c) the **match-probability modelling** against thalassemia/SCD recipient phenotypes — which is the only component with real potential to lift the paper above descriptive regional prevalence.
3. **Descriptive regional allele frequency is, by itself, a mid-tier product.** It is valuable and publishable, but it is not a mechanistic or practice-changing finding. *Blood*, *Blood Advances*, *Haematologica* and *British Journal of Haematology* are not realistic targets for the descriptive core; *British Journal of Haematology* publishes in the adjacent space (e.g. PMID 39535318, red cell matching guideline for haemoglobinopathies) but at guideline/systematic-review level, not regional donor prevalence.
4. **Where the ceiling actually is.** *Transfusion* and *Vox Sanguinis* are realistic **stretch** targets **if and only if** the modelling extension is executed well and the study is genuinely multi-country with a substantial donor n. *Transfusion Medicine*, *Transfusion and Apheresis Science*, *Blood Transfusion* and *Transfusion Clinique et Biologique* are the realistic core. This is not a discouraging finding — it is a well-matched, publishable study in a field that wants regional allele data. It is simply not a high-impact-factor study, and planning as though it were would waste months on predictable desk rejections.

`[RECOMMENDATION]` The protocol should be written to the standard of the **stretch** target (multi-centre design, pre-specified concordance methods, ISBT nomenclature, prospective registration, STROBE+STARD). That costs nothing extra at protocol stage and keeps the ceiling open. Sequencing is a Stage 13 decision, not this one.

---

## 5. PROTOCOL-SHAPING ACTIONS (the point of this scan)

Ordered by how recoverable they are:

| # | Action | Window |
|---|---|---|
| P1 | **Prospectively register the study (OSF Registries recommended) before the first sample or record is collected.** | **CLOSES AT FIRST COLLECTION — unrecoverable after** |
| P2 | Record the exact date of first sample/record collection in the protocol. | Now |
| P3 | Pre-specify the concordance analysis: reference standard, metric (kappa + agreement with 95% CI), discordance adjudication procedure and blinding, handling of indeterminate calls. | Before any testing |
| P4 | Pre-specify the variant allele panel and platform coverage; do not extend it after seeing frequencies (CLAUDE.md §1.5). | Before any testing |
| P5 | Adopt ISBT allele nomenclature in the protocol and data dictionary; record ISBT table version + access date. | Before data capture |
| P6 | Complete STROBE (cross-sectional) checklist; add STARD-informed methods reporting for the concordance component. Both to `01_Protocol/`. | Protocol drafting |
| P7 | Pre-specify the match-probability model (inputs, assumptions, recipient phenotype source) or explicitly label it exploratory/post-hoc. | Before G4 |
| P8 | Drop any "first in Saudi Arabia / first in the region" framing for RHD/RHCE characterisation; PMID 41147787 already holds that claim. | Protocol + manuscript |
| P9 | Dr. Alanazi to complete the five blocked registration checks in §1.5 using institutional access. | Before G1 approval |

---

## 6. OPEN ITEMS — carried to Stage 13

- Per-journal registration policy for observational studies (require / recommend / silent) — **blocked, unresolved**.
- Per-journal STROBE/STARD checklist submission requirement — **blocked, unresolved**.
- All word/abstract/reference/figure limits — **unverified or snippet-level only**.
- AI-use disclosure policy per journal — **not obtained**.
- Data-sharing / data-availability requirements per journal — **not obtained**.
- DOAJ, COPE, Scopus, JCR quartile, CiteScore, impact factor, APC, acceptance rate, turnaround — **all blocked, all `[UNVERIFIED]`, none stated in this document**.

---

*According to PubMed. PubMed records cited above: PMID 41147787 ([DOI](https://doi.org/10.1111/tme.70040)); PMID 42397021 ([DOI](https://doi.org/10.1111/tme.70098)); PMID 36121188 ([DOI](https://doi.org/10.1111/vox.13361)); PMID 30421425 ([DOI](https://doi.org/10.1111/vox.12717)). PMIDs 39710624, 41670517, 41151152, 39535318, 18313558 and 30930717 were retrieved as search records in this session; their DOIs were not individually fetched and are therefore not asserted here.*
