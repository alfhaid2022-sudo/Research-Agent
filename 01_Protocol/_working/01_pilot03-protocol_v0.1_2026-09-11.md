> [!IMPORTANT]
> **RATIONALE REPLACED 2026-09-11 following audit FAIL (D035) and the Stage 1 gate (D041).**
> The original §1.3 novelty argument was false and unsearched. The gate-supported replacement below
> is the ONLY wording authorised for this protocol. Three of five novelty propositions were refuted.
>
> **AUTHORISED RATIONALE — paste verbatim, do not paraphrase:**
>
> In a PubMed and SciSpace search executed on 2026-09-11 — without access to Scopus, Embase, Web of
> Science, Cochrane/CENTRAL, trial registries, Arabic-language journals or the Saudi Digital Library —
> no study was retrieved that resolves, at ISBT allele level, the *RHD* variants underlying
> serologically weak or discrepant D in **Saudi** blood donors. The only Saudi donor cohort with *RHD*
> genotyping (Madkhali et al. 2025, PMID 41147787) applied ID RHD XT to 60 D-negative/weak-D donors and
> left the weak-D fraction unassigned to specific alleles; the only other (Alalshaikh et al. 2024,
> PMID 39055072) tested exon 3/4/7 presence and the hybrid Rhesus box only and states that
> variant-allele analysis remains to be done. **This is a retrieval statement, not an existence claim.**
> Serology–genotype concordance in Gulf donors has already been reported (Al-Riyami et al. 2021,
> PMID 34647328; Haffener et al. 2025, PMID 40916454), and allele-level *RHD* resolution including a
> DEL allele has been reported in an Omani cohort (Al Lawati 2021, DOI 10.24377/LJMU.T.00014274).
> **No priority or "first" claim is made on any of these grounds.**
>
> **PROHIBITED WORDING (false against retrieved records):** "no concordance analysis exists";
> "no GCC study has screened for DEL"; "first in the Gulf"; any universal negative not separately searched.
>
> Methodological content below (adjudication procedure, reference/index justification, RoB framing,
> discordance taxonomy) was unaffected by the rationale defect and stands.

# PILOT-03 — Study Protocol

**Full title:** Serology–genotype concordance and *RHD*/*RHCE* variant allele frequencies in Gulf Cooperation Council blood donors: a multi-centre, prospective, cross-sectional laboratory study (PILOT-03)

**Short title:** GCC Donor RH Genotyping and Concordance Study

**Protocol version:** v0.1 (DRAFT — not frozen)
**Date:** 2026-09-11
**Prepared by:** `methodology-protocol-expert` (AI research assistant; not an author — `CLAUDE.md` §1.10)
**Principal Investigator / Sponsor-Investigator:** Dr. Fehaid M. Alanazi, Associate Professor & Consultant, Laboratory Hematology
**Status:** **Gate G1 deliverable. Requires Dr. Alanazi's explicit written approval before any subsequent work proceeds.** No sample may be collected, and no registration submitted, until G1 is approved and the protocol is frozen.
**Reporting standard:** STROBE (cross-sectional) primary; STARD methods items additionally satisfied for the concordance component (Director decision D027)

---

## Document control and how to read this protocol

### Evidence tags
Every substantive statement carries a `CLAUDE.md` §2 tag: `[EVIDENCE]`, `[INFERENCE]`, `[HYPOTHESIS]`, `[UNCERTAIN]`, `[RECOMMENDATION]`, `[UNVERIFIED]`.

**`[UNVERIFIED]` items block Gate G1 closure** unless Dr. Alanazi explicitly accepts them as residual risks. They are consolidated in §16.

### Source of citations
Every bibliographic record cited below was retrieved in-session on 2026-09-11 by `transfusion-medicine-expert` via PubMed (MCP) and SciSpace and is carried forward from `01_Protocol/_working/01_pilot03-methods-scoping_v1.0_2026-09-11.md`. **None has yet passed `citation-verification-expert`.** Per `CLAUDE.md` §1.2, no citation in this protocol may be treated as verified support for its claim until that check is complete. This is a standing `[UNVERIFIED]` on the reference list as a whole, not on individual records' existence (the Director independently re-verified Ameen 2020 and Alalshaikh 2024 against PubMed — D022).

### Constraints this protocol works within
Fixed by logged Director decisions D018, D020, D022, D023, D025, D026, D027, D028, D029, D031. Where this protocol adds a methodological specification beyond those decisions, or identifies a tension with them, it is marked **`[FLAG TO DIRECTOR]`** and listed in §17. Nothing fixed by a Director decision has been silently redefined.

### Freeze rule
On approval at Gate G1 this protocol is **frozen**. From that moment every change — however small — is recorded in `01_Protocol/_working/PROTOCOL_DEVIATIONS.md` with: what changed, the date, the reason, **whether any results were known at the time of the change**, and the impact on interpretation. Any change made after results are known is labelled **post-hoc** in the protocol, in the manuscript, and in the abstract. Promotion of a secondary outcome to primary after seeing results (outcome switching) will be refused and escalated to Dr. Alanazi.

---

## 1. Background and rationale

### 1.1 The clinical problem

Transfusion-dependent patients with sickle cell disease (SCD) and β-thalassaemia in the Gulf region continue to form clinically significant red cell alloantibodies despite prophylactic serological Rh and K matching. In a Jazan multi-centre series of 1,027 transfusion-dependent patients (906 SCD, 121 thalassaemia) receiving Rh- and K-matched units, alloimmunisation was reported in 78/1,027 (7.6%), with anti-E (25.9%) and anti-K (24.1%) the commonest of 108 alloantibodies `[EVIDENCE — Meshi 2024, DOI 10.2147/IJGM.S444949]`. An earlier Jazan series reported alloimmunisation in 50/385 SCD (12.98%) and 7/53 thalassaemia (13.21%) patients `[EVIDENCE — Halawani 2022, DOI 10.2147/IJGM.S360320]`.

Residual alloimmunisation after serological Rh matching is consistent with — but does **not** demonstrate — a contribution from *RH* variant alleles that serology cannot see: partial D antigens in donors and recipients typing D-positive, partial c/e antigens encoded by variant *RHCE* alleles, and partial C encoded by *RHD–RHCE* hybrids. `[INFERENCE]` The association between residual alloimmunisation and *RH* variation in this population is untested; this protocol does not test causation and no output of this study may assert it.

### 1.2 What is already known in the GCC

**Six** donor-cohort molecular red cell genotyping datasets from GCC states have been retrieved across PILOT-02 and the PILOT-03 Stage 1 gate (`02_Search/_working/PILOT03_GATE_LOG.md`). The two final rows were retrieved by the gate and are the records that refuted the claims retracted in §1.3.3:

| Study | State | n | Platform | RH depth | Concordance analysis |
|---|---|---|---|---|---|
| Ameen 2020, PMID 32527616, DOI 10.1016/j.transci.2020.102748 | Kuwait | 917 | SNP DNA array | Multi-system; weak D 1/2/3 reported "not prevalent" (no numerator given — recorded `NR`) | No |
| Al-Riyami 2021, PMID 34647328, DOI 10.1111/vox.13204 | Oman | 180 genotyped (130 paired with serology) | RBC-FluoGene vERYfy eXtend | 12-system screen; "D variant 18.2% (22/121)" not resolved to allele in the abstract | Bare per-system percentages only; no taxonomy, no CI, no adjudication algorithm described |
| Alalshaikh 2024, PMID 39055072, DOI 10.4103/sjmms.sjmms_664_23 | Saudi Arabia | 136 | Multiplex PCR exons 3/4/7 + hybrid Rhesus box | *RHD* presence/absence + zygosity; no *RHCE* | No |
| Madkhali 2025, PMID 41147787, DOI 10.1111/tme.70040 | Saudi Arabia (Jazan) | 60 (*RHD*, D−/weak D only); 464 (*RHCE*) | ID RHD XT / ID CORE XT (Luminex) | Deepest *RHCE* dataset in the region | No — antigen frequencies are platform-**predicted**, not serologically observed |
| Haffener 2025, PMID 40916454, DOI 10.1111/trf.18401 | Oman | 100 | Whole-genome sequencing vs serology, 24 antigens | Rh prediction 100% by copy-number + *RHD*Ψ; **no partial-D resolution, no DEL** `[EVIDENCE — PMC12531907 full text, read by Integrity Auditor 2026-09-11]` | **Yes — 98.7% accuracy; 12 discordances investigated with candidate variants proposed.** Single centre (SQUH blood bank), randomly selected consented donors |
| Al Lawati 2021, DOI 10.24377/LJMU.T.00014274 (LJMU doctoral thesis; **no PMID, grey literature, abstract-level only**) | Oman | 203 serologic D− | Molecular *RHD* characterisation | Weak D types 45, 41, 4.2, DAR2.00, DIIIb, DVI.2; **includes a DEL allele (IVS8-31T>C)** | Not reported |

`[EVIDENCE]` for all four rows, at the access level recorded in the methods scoping (Al-Riyami 2021 is abstract-only; full text was not obtainable — `[UNVERIFIED]` for all methods detail beyond its abstract).

### 1.3 The gap — restated after the Stage 1 gate (D041)

> This section was rewritten on 2026-09-11. Its previous version asserted four claims that the Stage 1
> gate refuted or could not support. They are listed in §1.3.3 as **retracted**, so the correction is
> auditable rather than invisible.

#### 1.3.1 What the gap is NOT

**Not an absence of molecular RH data in the GCC.** Ameen 2020 alone genotyped 917 Kuwaiti donors. `[EVIDENCE — PMID 32527616]`

**Not an absence of serology–genotype concordance analysis.** Concordance is the stated objective of Al-Riyami 2021, which reports >95% across systems including RH `[EVIDENCE — PMID 34647328]`, and Haffener 2025 compared serology with whole-genome sequencing across 24 antigens in 100 Omanis, reporting 98.7% accuracy and **investigating 12 discordances with candidate variants proposed** `[EVIDENCE — PMID 40916454]`. A dedicated concordance-and-adjudication study therefore already exists in the GCC.

**Not an absence of allele-level *RHD* resolution or DEL detection in the Gulf.** An Omani doctoral thesis resolved weak D types 45, 41, 4.2, DAR2.00, DIIIb and DVI.2, including a DEL allele, in 203 D-negative Omani samples `[EVIDENCE, abstract-level only — Al Lawati 2021, DOI 10.24377/LJMU.T.00014274; grey literature, repository inaccessible, Director could not verify]`.

#### 1.3.2 What the gap IS — authorised wording, do not paraphrase

In a PubMed and SciSpace search executed on 2026-09-11 — without access to Scopus, Embase, Web of Science, Cochrane/CENTRAL, trial registries, Arabic-language journals or the Saudi Digital Library — **no study was retrieved that resolves, at ISBT allele level, the *RHD* variants underlying serologically weak or discrepant D in Saudi blood donors.** The only Saudi donor cohort with *RHD* genotyping (Madkhali 2025, PMID 41147787) applied ID RHD XT to 60 D-negative/weak-D donors and left **11/60 (18.3%)** in an unresolved "other than weak D types 1, 2, 3" bucket that the paper itself states may require additional molecular analysis `[EVIDENCE]`; the only other (Alalshaikh 2024, PMID 39055072) tested exon 3/4/7 presence and the hybrid Rhesus box only and states that variant-allele analysis remains to be done `[EVIDENCE]`.

**This is a retrieval statement, not an existence claim.** No priority or "first" claim is made on any of these grounds.

#### 1.3.3 Retracted claims — recorded, not deleted

| Retracted claim | Status after gate | Refuting record |
|---|---|---|
| "No multi-centre, prospectively-sampled, single-platform, serology-anchored concordance study exists in the GCC" | **Refuted in part** — concordance limb false | PMID 34647328; PMID 40916454 |
| "None reports serology–genotype concordance as a pre-specified outcome with a discordance classification" | **REFUTED** | PMID 40916454 (12 discordances adjudicated) |
| "No GCC study has genotyped serologically D-positive donors for partial D" | **UNVERIFIABLE — not assertable.** Alalshaikh genotyped 70 D-positive donors but for exon presence/zygosity only; Ameen's panel coverage and Haffener's *RHD* results are behind egress blocks | PMID 39055072; PMID 32527616; PMID 40916454 |
| "No GCC study has screened for DEL" | **REFUTED** | Al Lawati 2021 (DOI 10.24377/LJMU.T.00014274) |
| "No study has escalated such calls to sequencing at cohort scale" | **UNVERIFIED** — never searched; may not be asserted | — |

#### 1.3.4 Design properties offered as the contribution

These are **design properties, not novelty claims**, and none asserts that no one else has done it:

1. **Allele-level resolution of the weak/discrepant D fraction in Saudi donors**, per §1.3.2 — the surviving retrieval statement.
2. **A common protocol across multiple centres.** `[INFERENCE]` No multi-centre prospectively-sampled GCC donor RH genotyping study was retrieved, but design adjectives are under-reported in abstracts and two retrieved records could not be excluded (PMID 40916454; Al Lawati 2021). **This is the weakest claim in the protocol and is not load-bearing.**
3. **Platform harmonisation as a methodological rationale, not a novelty claim.** Retrieved GCC studies each used a different platform (SNP array / melting-curve PCR-SSP / multiplex PCR / Luminex bead assay / WGS); platform-versus-platform discordance is documented — 7 *RHD* and 6 *RHCE* alleles discordant between manual and automated methods `[EVIDENCE — Vege & Westhoff, DOI 10.1007/978-1-4419-7512-6_11]` — so frequencies across those studies cannot be pooled without confounding by assay.
4. **Pre-specified escalation of unresolved platform calls to sequencing**, addressing the documented 18.3% bucket. Whether others have done so at cohort scale is `[UNVERIFIED]`.

#### 1.3.5 Clinical motivation (independent of novelty)

A DEL donor types D-negative on routine serology, so the unit is labelled D-negative and issued to a D-negative recipient, yet can immunise: primary anti-D in a D-negative Korean recipient was traced to a DEL donor carrying *RHD*(c.1227G>A) `[EVIDENCE — Kim 2009, DOI 10.3343/kjlm.2009.29.4.361]`. Partial D in a normally-reacting D+ donor or patient is the configuration that matters most on the recipient side: two Saudi obstetric patients typing D+ on routine serology carried *RHD\*DAU2*/*DAU6* and weak D type 4.1, and neither received RhIG `[EVIDENCE — Owaidah 2023, DOI 10.23750/abm.v94iS1.14120]`. **This motivation stands regardless of how much of §1.3.2 survives future searching**, and is the reason the study is worth doing even if its novelty narrows further.

### 1.4 Novelty claims — explicit prohibition

No output of this study may claim to be "the first in Saudi Arabia", "the first in the Gulf/GCC", or "the first in the region" (Director decision D029, and `CLAUDE.md` §7). Madkhali 2025's own priority claim is contested by Alalshaikh 2024, which Madkhali cites (D023); it is recorded as `[UNCERTAIN]` and PILOT-03 will not adjudicate it, restate it, or imitate it. The study's contribution is stated as the specific design properties listed in §1.3, each of which is falsifiable and checkable.

### 1.5 Why this study is worth doing

`[RECOMMENDATION]` A harmonised, multi-state, serology-anchored dataset would: (i) quantify how often routine donor serology misclassifies RH antigen status in this population and in which direction; (ii) identify serologically D-negative donors who carry a functional *RHD* gene, which is directly actionable for donor-unit labelling; (iii) supply *RH* variant allele frequencies from this population estimated on a **single harmonised platform** and therefore comparable between centres without confounding by assay `[no priority claim — see §1.4]`; (iv) provide the input parameters for modelling the probability of finding RH-genotype-matched units for transfusion-dependent SCD/thalassaemia recipients. None of these outputs depends on the study finding a high discordance rate; a low discordance rate is an equally reportable and equally publishable result (`CLAUDE.md` §1.4).

---

## 2. Objectives

### 2.1 Primary objective

To estimate, in GCC blood donors, the **agreement between routine serological RH phenotyping and *RHD*/*RHCE* genotype-predicted phenotype** for the antigens D (RH1), C (RH2), E (RH3), c (RH4) and e (RH5), at the level of the antigen–donor pair, and to classify every discordant pair using the pre-specified seven-class taxonomy in §8.3.

**Answerable as:** per-antigen percent agreement and Cohen's kappa, each with a 95% confidence interval, with the full 2×2 cell counts reported; plus the count and proportion of pairs in each discordance class, each with a denominator.

### 2.2 Secondary objectives

| # | Objective | Answerable as |
|---|---|---|
| S1 | Estimate *RHD* allele frequencies, including variant, weak, partial, DEL and null alleles | Allele counts/frequencies with 95% CI, denominator = alleles; and carrier proportions, denominator = donors |
| S2 | Estimate *RHCE* allele and genotype frequencies | As S1 |
| S3 | Estimate the proportion of **serologically D-negative** donors who carry a functional *RHD* gene (discordance class D2), and discriminate these from *RHD*Ψ (*RHD\*08N.01*) carriers | Proportion with 95% CI, denominator = serologic D− donors tested |
| S4 | Estimate the proportion of **serologically D-positive** donors carrying a partial D allele (class D4) | Proportion with 95% CI, denominator = serologic D+ donors genotyped |
| S5 | Determine the *RHD* zygosity distribution (hybrid Rhesus box) among serologically D-negative donors, and use zygosity as an internal quality control on the *RHD* exon-scan result | Counts/proportions; count of zygosity–exon-scan inconsistencies |
| S6 | Quantify the **unresolved-call rate** (class D5) of the Tier-1 platform and the proportion of unresolved calls resolved by Tier-3 sequencing | Proportions with denominators; resolution yield |
| S7 | Quantify **platform-versus-platform discordance** (class D7) between Tier-1 and Tier-3/4 methods, reported separately from serology–genotype discordance | Counts; per-allele listing |
| S8 | Compare allele and antigen frequencies between national and expatriate donor strata, and between participating centres | Pre-specified comparisons only; see §12.5 |
| S9 (exploratory extension) | Model the probability of identifying RH-genotype-compatible donor units for locally observed transfusion-dependent SCD/thalassaemia recipient phenotypes | Simulation output with full parameter provenance; explicitly exploratory |

**S9 is conditional** on (a) Gate G1 approval of the extension, (b) availability of recipient phenotype data under a separate or amended ethics approval, and (c) the primary dataset being complete. If not executed it is reported as not executed, not quietly dropped.

### 2.3 What this study will not do

- It will not test whether *RH* variation **causes** alloimmunisation. No such design element exists here (no recipient outcomes are observed), and no causal language may appear in any output. `[INFERENCE]`
- It will not establish clinical management policy for weak D or partial D. Management recommendations are jurisdiction-dependent and no applicable national standard has been verified (§16).
- It will not report hr^S^ (RH19), hr^B^ (RH31), V (RH10) or VS (RH20) as *observed* phenotypes unless reference serology is obtained (D025; §8.5).

---

## 3. PICO / PIRD — operationalised

The study has two components requiring two frameworks. Both are given in full.

### 3.1 Descriptive (frequency) component — P–O framing

| Element | Specification |
|---|---|
| **P — Population** | Allogeneic blood donors presenting for whole-blood or apheresis donation at participating blood-transfusion centres in ≥2 GCC states during the enrolment window, meeting local donor-eligibility criteria, aged ≥18 years, providing written informed consent. Both national and expatriate donors are eligible and the stratum is recorded. |
| **O — Outcome** | *RHD* and *RHCE* allele and genotype frequencies; genotype-predicted antigen phenotype frequencies; *RHD* zygosity distribution |
| **Setting** | Hospital-based and/or regional blood-transfusion services; multi-centre, multi-state |
| **Time** | Single time point per donor (cross-sectional); no follow-up |

### 3.2 Concordance component — PIRD framing

| Element | Specification |
|---|---|
| **P — Population** | As §3.1. The concordance denominator is the **antigen–donor pair**; it differs by antigen and is reported separately for each antigen (as in Al-Riyami 2021, where denominators were 121 for D, 120 for e, 112 for FY) `[EVIDENCE, abstract-level]` |
| **I — Index test** | **Routine serological RH phenotyping** as performed under the harmonised study SOP: D by direct agglutination with a specified anti-D clone panel, plus IAT for weak D on all direct-negative samples; C, c, E, e by specified antisera and method |
| **R — Reference test** | **Tier-1 single-platform *RHD*/*RHCE* genotyping** with genotype-predicted phenotype derived through a locked mapping table, escalated per the tiered algorithm (§7) |
| **D — "Diagnosis" / target condition** | Presence or absence of each RH antigen (D, C, E, c, e) on the donor's red cells, as it would be recorded on a unit label and used for matching |

**Which is reference and which is index — and the justification (D027 item 1).**
The **genotype is designated the reference test** and **serology the index test**, for three reasons: (i) the practical question is whether the test in routine use (serology) correctly assigns antigen status, which makes serology the test under evaluation; (ii) for DEL and for partial D, serology is wrong *by design* — DEL is detectable serologically only by adsorption–elution `[EVIDENCE — Kim 2009]`, and partial D types as normal D+ — so serology cannot logically be the reference for those categories; (iii) the genotype carries information (allele identity, zygosity, partial vs weak) that serology cannot in principle produce.

**The reference standard is explicitly imperfect, and this is stated in the protocol rather than assumed away.** The Tier-1 platform detects only the alleles on its fixed panel; any off-panel allele produces either a false "conventional" call or an unresolved bucket — this is exactly what generated Madkhali 2025's unresolved 18.3% `[EVIDENCE]`. Consequently:

- **The primary metric is agreement (kappa, percent agreement), not accuracy.** Sensitivity, specificity and predictive values against the genotype are computed only as **secondary directional descriptors**, reported with an explicit statement that they are conditional on an imperfect reference standard and are not estimates of true diagnostic accuracy. **`[FLAG TO DIRECTOR — F1]`**
- **No antigen–donor pair is classified as an "error" of either test** on the basis of Tier-1 alone. Every discordance is escalated and adjudicated (§8.4) before classification.

---

## 4. Design and justification

### 4.1 Design

**Primary, multi-centre, prospective, cross-sectional observational laboratory study** with a paired within-donor comparison of two measurement methods (serology and genotype) applied to the same specimen, and a tiered, pre-specified escalation pathway for triggered samples.

### 4.2 Why this design

The primary question is the **frequency of, and agreement between, two classifications measured at a single time point** in a defined population. A cross-sectional design measures exactly that, with no follow-up, no intervention, and no temporal ordering requirement. `[INFERENCE]`

### 4.3 Alternatives considered and why each was rejected

| Alternative | Why rejected |
|---|---|
| **Cohort study (STROBE)** | There is no exposure→outcome-over-time relationship to observe. Donor antigen status is fixed; no follow-up would add information. A cohort framing would also invite causal reading of an association we cannot test. |
| **Case–control study (STROBE)** | Sampling on outcome status would destroy the frequency estimates, which are a co-primary deliverable. Selecting on "has a variant allele" requires knowing the genotype first, which is circular. |
| **Diagnostic accuracy study with STARD as the *primary* standard** | Rejected as primary because (a) **there is no gold standard** — both methods are imperfect, so accuracy parameters are not identifiable; (b) STARD does not cover allele-frequency estimation, which is half this study's output. **STARD's methods items are nevertheless adopted in full for the concordance component** per D027, because they force pre-specification of exactly the things that are most vulnerable to post-hoc drift here (reference/index designation, blinding, indeterminate handling, adjudication). |
| **Laboratory method-validation study (CLSI EP series)** | Rejected as primary. A method-validation study evaluates one assay against a defined truth set in a selected specimen panel; PILOT-03 evaluates two methods against each other in an unselected donor population and additionally estimates population frequencies, which a validation study cannot do. The qualitative method-comparison logic of the CLSI approach informs §12.2. `[UNVERIFIED]` — no specific CLSI document number or edition is cited, because none was accessible or read in this environment; do not add one without reading it. |
| **Systematic review / meta-analysis (PRISMA 2020)** | The question is about primary data that do not exist, not about synthesising data that do. The four existing GCC studies are not poolable — different platforms, different populations, different denominators, and none reports concordance (§1.3). This exact reasoning closed the review option at D019/D022. |
| **Randomised or quasi-experimental design (CONSORT/TREND)** | No intervention is allocated. |
| **Prediction-model study (TRIPOD+AI)** | Objective S9 is a resource/inventory simulation, not a clinical prediction model producing individual-level risk estimates, so TRIPOD is not the governing standard. S9 is reported as an exploratory simulation with full parameter provenance. **`[FLAG TO DIRECTOR — F7]`** |

### 4.4 Reporting standard

**STROBE (cross-sectional) is the primary reporting standard**, with **STARD's methods items additionally satisfied** for the concordance component (D027). A completed item-by-item STROBE checklist mapped to this protocol's sections is filed as `01_Protocol/_working/01_pilot03-strobe-checklist_v0.1_2026-09-11.md`; the STARD methods items are mapped in the same file.

---

## 5. Eligibility criteria

Each criterion below is written to be applied independently by two screeners from the donor record and the study enrolment form **without discussion**. Any criterion requiring judgement is marked and given an operational rule.

### 5.1 Inclusion criteria (ALL must be met)

| # | Criterion | Operational rule / source document |
|---|---|---|
| I1 | Presenting for **allogeneic** whole-blood or apheresis donation at a participating centre | Donation type field on the donation record |
| I2 | **Accepted as eligible to donate** under the participating centre's standing donor-selection criteria on the day of donation | Donor-selection outcome field = "accepted" |
| I3 | Age **≥18 years** on the date of donation | Date of birth on donor record |
| I4 | Donation occurs **within the defined enrolment window** at that centre | Donation date vs centre-specific window recorded in the site log |
| I5 | **Written informed consent** for research use of a residual sample and linked donor record, signed and dated before sampling | Signed consent form present in the study file |
| I6 | A **research aliquot of ≥2 mL EDTA whole blood** is obtained at the time of donation | Sample-receipt log |

### 5.2 Exclusion criteria (ANY one excludes)

| # | Criterion | Operational rule / source document | Rationale |
|---|---|---|---|
| E1 | Autologous or directed donation | Donation type field | Different donor population; not representative of the general inventory |
| E2 | Documented **red cell transfusion within the preceding 3 months** | Donor questionnaire / donor record | Donor red cells in circulation invalidate the serological phenotype (mixed-field); `[INFERENCE]` — 3 months is the operational rule adopted for this study, chosen to exceed the normal red cell lifespan, and is a study convention rather than a cited standard, since no applicable standard was verified (§16) |
| E3 | Documented **allogeneic haematopoietic stem cell transplant** at any time | Donor record | Donor-derived genotype would not correspond to the donor's own inheritance |
| E4 | **Duplicate enrolment**: the same donor already enrolled in this study at any centre | Deduplication on the centre donor identifier plus the study-wide hashed identifier (§10.4) | One record per donor; repeat donations within the window must not inflate frequency estimates |
| E5 | **Consent withdrawn** before testing | Withdrawal form date vs test date | |
| E6 | Research aliquot **not received, mislabelled, clotted, or <2 mL** | Sample-receipt log rejection field | |
| E7 | **DNA yield or purity below the pre-specified threshold** after two extraction attempts from the available sample | Quantitation record vs threshold in §7.2 | Assigned to class D6 (technical failure), excluded from the concordance denominator, reported separately with n |

**Not an exclusion criterion:** nationality, ethnicity, ABO group, D status, sex, or any previously recorded phenotype. Selection on any of these would bias the frequency estimates. The **only** permitted selection by D status is the declared supplementary stratum in §6.3, which is analysed separately and never pooled into the unweighted frequency estimates.

---

## 6. Setting, population, sampling, and sample size

### 6.1 Setting

Blood-transfusion services in **at least two, and preferably ≥3, GCC states**. `[UNVERIFIED]` — **the participating centre list is not yet fixed.** Centre recruitment, data-sharing agreements and local approvals are the PI's (D020). The protocol is written so that the centre list is a completable table, not a design change:

| Field to be completed before G1 closes or as an approved amendment | Status |
|---|---|
| Centre name, country, city | `[UNVERIFIED]` |
| Annual allogeneic donation volume | `[UNVERIFIED]` |
| Routine serological method in use (tube / gel / solid phase) and platform | `[UNVERIFIED]` |
| Anti-D clones, manufacturers and IgM/IgG class in routine use | `[UNVERIFIED]` — site-survey item (D025 item 3) |
| Local IRB and its relationship to the lead IRB | `[UNVERIFIED]` |
| Whether genotyping is performed locally or all DNA/samples are shipped to one central laboratory | `[UNVERIFIED]` — see §7.1 |

### 6.2 Target population and sampling frame

**Target population:** allogeneic blood donors in the participating GCC states.
**Sampling frame:** all donors presenting at a participating centre during that centre's enrolment window.
**Sampling method:** **consecutive enrolment** of all consenting eligible donors until the centre quota is reached. Consecutive sampling is chosen over convenience sampling because it is the only feasible method that does not select on donor characteristics; it is chosen over random sampling from a donor register because donors must be sampled at the point of donation for the research aliquot.

**Enrolment must not be paused, resumed or redirected on the basis of accruing results.** Centre quotas are fixed at G1.

### 6.3 Strata

| Stratum | Definition | Used for |
|---|---|---|
| **A — Primary consecutive stratum** | All consenting eligible donors enrolled consecutively until the centre quota is met, **irrespective of D status** | Primary concordance outcome; **all unweighted frequency estimates** |
| **B — Supplementary serologic D-negative stratum** | Additional serologically D-negative donors enrolled beyond the Stratum A quota during the same window | *RHD* variant, DEL and zygosity **characterisation only** (objectives S3, S5) |

**Stratum B is an enrichment stratum and is declared as such.** It is **excluded** from every unweighted population-frequency estimate. Where a combined A+B estimate is reported for a D-negative-restricted parameter, it is reported with its own denominator (all D-negative donors tested) and labelled as such. If any design-weighted population estimate is produced, the weighting method must be specified by `biostatistics-expert` in the SAP. **`[FLAG TO DIRECTOR — F3]`**

### 6.4 Sample size

**Supplied and adopted (D039): n = 3,000 donors as 12 centres x 250**, precision-based. Wilson primary; Clopper-Pearson when count <=5 or >=n-5; exact bound for zero cells; Wald nowhere. Allocation dominates total n (12x250 gives n_eff 808 vs 466 for 6x500), so **centre recruitment is the binding feasibility constraint**. Full justification: `05_Analysis/_working/05_pilot03-sample-size-justification_v1.0_2026-09-11.md`; every value traced in `NUMBER_REGISTRY.csv`. None may be inserted into this protocol except from that deliverable.

The inputs the sample-size calculation must work from, with their provenance and their limitations, are tabulated in §6 of `01_Protocol/_working/01_pilot03-methods-scoping_v1.0_2026-09-11.md`. The methodological requirements the calculation must satisfy are:

1. **Precision-based, not power-based**, as the primary framing — the deliverables are frequencies and an agreement coefficient, not a hypothesis test. `[RECOMMENDATION]`
2. Separate justification for (a) the **primary concordance** outcome (precision on kappa and on per-antigen percent agreement), and (b) the **rare-allele frequency** outcomes (CI half-width at plausible low frequencies).
3. Explicit handling of **zero counts** (e.g. C^w^ was 0/354 in Jazan `[EVIDENCE]`) — an upper-bound method must be named.
4. A **design effect for clustering by centre**; the multi-centre structure is not optional to model.
5. Explicit statement that most Gulf-derived rare-allele inputs rest on **1–6 observations from a single region of a single country** and must not be adopted as planning assumptions without a bracketing sensitivity scenario.
6. A Tier-2/3/4 **escalation budget**: the expected n requiring zygosity/DEL testing, Sanger and NGS referral, with the assumption used for each.

Until that deliverable is approved at G4, every n in this protocol is `[UNVERIFIED]`.

---

## 7. Laboratory methods

### 7.1 Platform architecture — tiered, single Tier-1 platform (D025 item 1)

**Tier 1 must be one platform, one vendor, one assay version, across all centres.** Where centres cannot run the same platform locally, **all genotyping is centralised in a single reference laboratory** and local centres contribute samples and serology only. A multi-platform Tier 1 is prohibited: it would manufacture class-D7 discordance and confound every between-centre comparison `[EVIDENCE — Vege & Westhoff, DOI 10.1007/978-1-4419-7512-6_11]` `[INFERENCE]`.

| Tier | Applied to | Purpose | Fixed before data collection |
|---|---|---|---|
| **Tier 1** | **All** enrolled donors | Serology + single harmonised commercial multi-system *RHD*/*RHCE* genotyping platform | Vendor, assay, kit version, software version, and **lot-change policy** — recorded as dataset variables |
| **Tier 2** | All serologically D-negative donors (Strata A and B) | (a) *RHD* zygosity via hybrid Rhesus box; (b) DEL screening targeting c.1227G>A **with explicit *RHD*Ψ (*RHD\*08N.01*) discrimination** | Assay, primers/kit, and the *RHD*Ψ discrimination method |
| **Tier 3** | Triggered (§7.4) | Targeted Sanger sequencing with **gene-specific primers** | Amplicons, primer design source, and the requirement that *RHD*/*RHCE* homology co-amplification be controlled |
| **Tier 4** | Triggered, referral | NGS / long-read sequencing for novel or unresolvable alleles | Referral laboratory, referral criteria, and a **budgeted maximum n** |

**Tier 4 must have a named referral pathway and a budgeted n before G1 closes.** `[UNVERIFIED]` — neither is fixed. Leaving it implicit is the failure mode that turns "unresolved" into "unreported".

**`[UNVERIFIED]` — no specific commercial platform is named in this protocol version.** Naming one requires (a) confirmation of local availability and procurement, (b) the vendor's current panel content, and (c) a decision on centralised versus distributed testing. All three sit with the PI (D020). The protocol's design does not depend on which platform is chosen, but the **unresolved-call rate (S6) and the class-D5 count depend on it entirely**, and the panel content must be appended to this protocol as a locked annex before the first sample is tested.

### 7.2 Specimen handling and DNA

| Step | Specification |
|---|---|
| Specimen | ≥2 mL EDTA whole blood, drawn at donation |
| Storage/transport | To be fixed in the laboratory SOP annex; temperature and maximum time-to-extraction recorded per sample `[UNVERIFIED — SOP not yet written]` |
| Extraction | Single documented method across all samples; method, kit and lot recorded |
| Quantitation | Concentration and purity ratio recorded for every sample; **acceptance thresholds pre-specified in the SOP annex** and applied identically at all centres `[UNVERIFIED — thresholds not yet fixed]` |
| Failure | Two extraction attempts permitted; second failure = class D6 |

### 7.3 Serological methods — harmonised, and recorded as data not prose (D025 item 3)

The genotype arm is uninterpretable without a specified serology arm. The following are **mandatory and are recorded as per-test dataset variables**, not as a Methods sentence:

1. **Anti-D clone panel, not a single reagent.** For every D test, record: **clone identity, manufacturer, lot number, immunoglobulin class (IgM/IgG/blend), and method**. Without clone identity a class-D3 or D4 discordance is uninterpretable, because monoclonal anti-D clones differ in their reactivity with partial and weak D `[EVIDENCE — Srivastava 2022, DOI 10.21307/immunohematology-2022-036; Rodrigues 2021, DOI 10.1016/j.transci.2021.103135]`. A minimum of **two anti-D clones of differing specificity profile** is required for the D determination. `[UNVERIFIED]` — which clones are available at each centre is a site-survey item.
2. **Phase definitions, fixed for this study.** The protocol must state, and the SOP must enforce, which phase defines each result:
   - **D-positive** = macroscopic agglutination at direct/immediate-spin phase with both study anti-D clones;
   - **Weak D** = direct-phase negative, **IAT-positive**;
   - **D-negative (serologic)** = direct-phase negative **and** IAT-negative.
   This definition determines the class-D2 count and therefore must not be changed after data are seen.
3. **Weak D testing is performed on every direct-phase D-negative donor**, by a single specified method across all centres. The serological method itself moves the discordance rate: adding a high-sensitivity solid-phase confirmatory test reduced the frequency of weak D samples typed as D-negative `[EVIDENCE — de Paula Vendrame 2019, DOI 10.1111/vox.12851]`. Mixing methods across centres would therefore create artefactual between-centre differences.
4. **Adsorption–elution is NOT performed routinely.** DEL is therefore a **genotype-only finding** in this study, and the protocol states this explicitly rather than implying serological confirmation. `[EVIDENCE — Kim 2009 defines DEL as serologically detectable only by adsorption–elution]` If adsorption–elution is performed on a defined subset, that subset and its trigger must be pre-specified as an amendment before any DEL result is known.
5. **C, c, E, e phenotyping** by a single specified method with specified antisera (clone, manufacturer, lot recorded). **Dosage is acknowledged in advance:** heterozygotes give weaker reactions, and a weak reaction is **not** automatically a discordance. A **reaction-grade cut-off for antigen-positive is pre-specified in the SOP annex** and applied uniformly. `[UNVERIFIED — cut-off not yet fixed]`
6. **hr^S^ (RH19), hr^B^ (RH31), V (RH10), VS (RH20)** — **excluded from the primary outcome** (D025 item 5). Serological reagents are scarce; Madkhali 2025's figures for these antigens are platform-**predicted**, not observed `[EVIDENCE]`. These antigens are reported in this study as **genotype-predicted phenotypes only, labelled as predicted**, unless reference-laboratory serology is obtained for a pre-specified subset — in which case they enter a clearly-labelled secondary concordance analysis. Presenting predicted phenotypes as observed would breach `CLAUDE.md` §2. `[UNVERIFIED]` — whether hr^S^/hr^B^ reference serology is obtainable is unresolved and sits with the PI.
7. **DAT** on any donor with unexpected or discrepant reactivity; result recorded.
8. **Internal QC and external quality assessment (EQA)** records retained per centre for the enrolment period, and EQA participation status reported.

### 7.4 Escalation triggers — fixed before any data exist

A sample escalates to Tier 3 (Sanger) if **any** of the following holds. The list is closed; adding a trigger after data collection begins is a protocol deviation.

| Trigger | Rationale |
|---|---|
| T1 | Tier-1 returns a non-specific or bucketed call (e.g. "variant other than weak D types 1, 2, 3") | The unresolved bucket consumed 18.3% of Madkhali 2025's *RHD* cohort and was never resolved `[EVIDENCE]` |
| T2 | Any serology–genotype discordance surviving repeat testing of both arms | Discordance is the outcome; it must be resolved, not counted |
| T3 | Tier-2 zygosity result inconsistent with the Tier-1 exon-scan result | Indicates assay failure or an unrecognised hybrid |
| T4 | Any suspected *RHD–RHCE* hybrid allele | Hybrids encode partial antigens (e.g. partial C) and are poorly resolved by panel assays |
| T5 | Tier-2 DEL screen positive, or *RHD*Ψ versus DEL not discriminated | Misclassifying *RHD*Ψ as DEL would wrongly discard genuinely D-negative donors |
| T6 | Weak D phenotype with no weak D allele detected, or vice versa | |

Escalation to **Tier 4** (NGS/long read) occurs only if Tier 3 fails to resolve the call, and within the budgeted n.

---

## 8. Outcome definitions

### 8.1 Primary outcome

**Antigen–donor pair concordance** between the serological phenotype (index) and the genotype-predicted phenotype (reference) for **D (RH1), C (RH2), E (RH3), c (RH4), e (RH5)**.

- **Unit of analysis: the antigen–donor pair** (D025 item 2). A donor contributes up to five pairs. Donor-level concordance is **not** the primary outcome and is not reported as a headline figure.
- **Denominator is stated per antigen** and will differ by antigen (missing serology, missing genotype, or class-D6 failure removes that pair only, not the whole donor).
- **Measurement instrument:** serology per §7.3 under the study SOP; genotype per §7.1; genotype-predicted phenotype derived through the **locked genotype→phenotype mapping table** (§8.6).
- **Timing:** both measurements are made on aliquots of the **same specimen**, drawn at the same donation. Maximum permissible interval between serological testing and genotyping is fixed in the SOP annex and recorded per sample. `[UNVERIFIED — interval not yet fixed]`

### 8.2 Primary metric

For each antigen, **all** of the following are reported together — none alone:

1. The full **2×2 cell counts** (serology + / −  ×  genotype-predicted + / −);
2. **Percent agreement** with 95% CI;
3. **Cohen's kappa** with 95% CI (D027 item 2).

**Kappa's prevalence dependence is anticipated, not discovered.** Several RH antigens are extremely skewed in this population (e.g. predicted e 98.84%, hr^S^ 97.75% in Jazan `[EVIDENCE]`). At such prevalences kappa can be low despite near-perfect agreement — the well-known first kappa paradox. A **prevalence-and-bias-adjusted agreement statistic is therefore pre-specified as a mandatory companion metric** for every antigen, with the choice (PABAK, Gwet's AC1, or equivalent) and its justification to be fixed by `biostatistics-expert` in the SAP. Reporting kappa alone for a 98%-prevalent antigen would systematically understate agreement. **`[FLAG TO DIRECTOR — F2]`** — this supplements D027 item 2; it does not replace kappa, which remains the named primary agreement coefficient.

### 8.3 Discordance taxonomy (D025 item 2) — locked

Every antigen–donor pair is assigned **exactly one** class:

| Class | Definition | Typical mechanism | Counted as concordant? |
|---|---|---|---|
| **C** | Serologic phenotype = genotype-predicted phenotype | — | **Yes** |
| **D1** | Serology-positive, genotype-negative | Reagent cross-reactivity; allele outside the platform panel | No |
| **D2** | Serology-negative, genotype-positive | **DEL**; antigen expression below reagent threshold | No — **highest clinical priority (donor-side safety)** |
| **D3** | Quantitative discordance — same direction, discrepant strength | Weak D versus conventional D | No |
| **D4** | Qualitative/partial discordance — antigen detected, genotype predicts a **partial** antigen | Partial D typing D+; partial e typing e+ | No |
| **D5** | **Unresolved genotype** — platform returns a non-specific bucket and Tier-3/4 does not resolve it | Off-panel or novel allele | **No — must never be counted as concordant** |
| **D6** | Assay/technical failure — no call, invalid control, insufficient DNA, unusable serology | — | **Excluded from the denominator; reported separately with n** |
| **D7** | **Platform-versus-platform** discordance — two molecular methods disagree | Tier-1 versus Tier-3/4 | **Not a serology–genotype discordance. Reported entirely separately (S7) and never pooled into the primary outcome** `[EVIDENCE — Vege & Westhoff]` |

### 8.4 Discordance adjudication procedure (D027 item 3) — locked, blinded

This is the single element most vulnerable to the accusation that results drove the method. It is specified in full, in advance.

**Step 1 — Automated flagging.** Discordant pairs are identified by a **script applied by the data manager** to the locked mapping table (§8.6). Laboratory staff do not decide what counts as a discordance. The flagging script is written and version-controlled **before** the first result is entered.

**Step 2 — Mandatory repeat, both arms, before adjudication.**
- Serology repeated on a **fresh aliquot**, including at least one anti-D clone not used in the original test, by an operator blinded to the genotype result.
- Genotyping repeated from a **fresh DNA extraction**, by an operator blinded to the serology result.
- A discordance that resolves on repeat is recorded as **resolved-on-repeat**, with the original and repeat results both retained in the dataset, and is counted according to the repeat result. The **count of resolve-on-repeat events is itself reported** (it is an assay-reproducibility finding, not an embarrassment to hide).

**Step 3 — Tier-3 escalation** per §7.4 for any discordance surviving repeat.

**Step 4 — Blinded independent adjudication.**
- **Adjudication packet contents:** study-blinded specimen code; all serological reaction grades with clone/lot/method; all genotype calls (raw platform call and ISBT allele) from every tier; QC/control status. 
- **Masked from adjudicators:** donor identity, **centre identity**, donor nationality/stratum, the other adjudicator's classification, and **any running or aggregate concordance statistic**.
- **Adjudicators:** **two** independent adjudicators — one immunohaematologist and one molecular scientist — **neither of whom performed or supervised the testing of that sample**, and neither of whom is the PI of the contributing centre. Each independently assigns one class from §8.3 and records a free-text reason.
- **Disagreement:** referred to a **third adjudicator**, independent of both, who adjudicates blind to the first two classifications and whose decision is final.
- **Persistent non-resolution** (third adjudicator cannot assign a class on the available evidence): the pair is classed **D5 (unresolved)** and counted as non-concordant. It is never reassigned to C.
- **Inter-adjudicator agreement is itself measured and reported** (raw agreement and kappa on the class assignment).

**Step 5 — Timing and lock.** Adjudication is conducted in **batches during data collection**, blinded to accruing concordance totals. `biostatistics-expert` does not release, and no team member requests, an interim concordance estimate. Each adjudicated class is **locked** on entry; any subsequent change requires a written deviation entry stating whether results were known (§17 and the deviation log).

**`[UNVERIFIED]`** — the named adjudicators and the independence attestation are not yet fixed. These must be named before the first sample is tested.

### 8.5 Pre-specified handling of indeterminate and unresolved calls (D027 item 4)

| Situation | Primary analysis | Reported separately |
|---|---|---|
| **D5 — unresolved genotype** | Counted as **non-concordant** (conservative) | Count and proportion, with denominator; and resolution yield of Tier 3/4 (S6) |
| **D6 — technical failure** | **Excluded from the denominator** | Count, proportion, and reason category, per antigen and per centre |
| **Missing serology or missing genotype for a pair** | Pair excluded from that antigen's denominator only | Count per antigen |
| **Weak/indeterminate serological reaction below the pre-specified grade cut-off** | Classified per the cut-off in §7.3(5); **the cut-off is fixed before data collection and cannot be moved afterwards** | Count of such reactions per antigen |

**Pre-specified sensitivity analyses on the D5 assumption** (all three reported together, in the same table, in the primary manuscript):
- **SA1** — D5 counted as non-concordant (**primary**);
- **SA2** — D5 excluded from the denominator;
- **SA3** — D5 counted as concordant (best case).
Reporting all three brackets the effect of the assumption and removes any incentive to choose one after seeing the data.

### 8.6 Genotype→phenotype mapping table — locked before data collection

The rule that converts a genotype call into a predicted phenotype **is a study instrument and is version-controlled as one**. It is written, reviewed and locked before the first sample is tested, and filed as an annex to this protocol. Changing a mapping rule after results are known changes the concordance rate and is a post-hoc modification.

**Multi-designation alleles are reported honestly as allele groups.** Where the platform cannot distinguish, for example, *RHCE\*01.20.01* from *RHCE\*01.20.02*, the result is reported as the **group**, not collapsed to one designation the assay did not resolve `[EVIDENCE — Madkhali 2025 footnotes exactly this limitation]`.

### 8.7 Secondary outcomes

All secondary outcomes in §2.2 (S1–S9) are defined by their measurement instrument (§7) and reported with denominators and 95% CI. **No secondary outcome may be promoted to primary after results are known** (§17).

---

## 9. Variables

Each variable has a definition, type, unit/levels and source. `[UNVERIFIED]` marks fields whose permitted values depend on decisions not yet made.

### 9.1 Donor and administrative variables

| Variable | Definition | Type | Unit / levels | Source |
|---|---|---|---|---|
| `study_id` | Study-wide pseudonymous identifier | String | — | Generated at enrolment |
| `centre_id` | Participating centre | Categorical | `[UNVERIFIED — centre list]` | Enrolment form |
| `country` | GCC state of the centre | Categorical | `[UNVERIFIED]` | Enrolment form |
| `enrol_date` | Date of donation/enrolment | Date | YYYY-MM-DD | Donation record |
| `stratum` | Sampling stratum | Categorical | A (consecutive) / B (supplementary D−) | Enrolment log |
| `age` | Age at donation | Continuous | Years, integer | Donor record |
| `sex` | Sex as recorded | Categorical | M / F / not recorded | Donor record |
| `donor_status` | Donor category | Categorical | First-time / repeat | Donor record |
| `nationality_stratum` | National of a GCC state vs expatriate | Categorical | National / expatriate / not recorded | Donor record |
| `self_reported_origin` | Country of origin as self-reported | Categorical | Free list | Donor record — **collected because the GCC donor pool is an admixture of distinct ancestral repertoires** `[INFERENCE]`; see §9.5 |

### 9.2 Serological variables (index test)

| Variable | Definition | Type | Unit / levels | Source |
|---|---|---|---|---|
| `sero_D_direct` | D result, direct/immediate-spin phase | Ordinal | 0, w+, 1+…4+ | Serology worksheet |
| `sero_D_IAT` | D result by IAT (performed on all direct-negative) | Ordinal | 0, w+, 1+…4+ | Serology worksheet |
| `sero_D_final` | Study D classification | Categorical | D-positive / weak D / serologic D-negative (per §7.3(2)) | Derived by locked rule |
| `antiD_clone_1/2` | Anti-D clone identity | Categorical | `[UNVERIFIED — site inventory]` | Reagent record |
| `antiD_mfr_1/2`, `antiD_lot_1/2`, `antiD_class_1/2` | Manufacturer, lot, Ig class | String / String / Categorical | — / — / IgM, IgG, blend | Reagent record |
| `sero_C`, `sero_c`, `sero_E`, `sero_e` | Antigen results | Ordinal | 0, w+, 1+…4+ | Serology worksheet |
| `antisera_*_clone/mfr/lot` | For each of C, c, E, e | String | — | Reagent record |
| `sero_method` | Serological method | Categorical | Tube / gel column / solid phase | Serology worksheet |
| `DAT` | Direct antiglobulin test (on unexpected reactivity) | Categorical | Neg / pos / not performed | Serology worksheet |
| `sero_operator_blinded` | Operator blinded to genotype at time of test | Boolean | Yes / No | Worksheet attestation |
| `sero_repeat_*` | Full repeat set for adjudicated samples | As above | — | Repeat worksheet |

### 9.3 Molecular variables (reference test)

| Variable | Definition | Type | Unit / levels | Source |
|---|---|---|---|---|
| `dna_conc`, `dna_purity` | DNA concentration and purity ratio | Continuous | ng/µL; ratio | Quantitation record |
| `tier1_platform`, `tier1_kit_version`, `tier1_lot`, `tier1_software_version` | Tier-1 assay identity | String | — | Run record |
| `tier1_raw_call_RHD` | **Raw platform call, verbatim, as issued** | String | — | Instrument output (D028) |
| `tier1_raw_call_RHCE` | As above | String | — | Instrument output |
| `isbt_allele_RHD_1/2` | *RHD* alleles in **ISBT allele nomenclature** | Categorical | ISBT allele or allele group | Derived via locked mapping (D028) |
| `isbt_allele_RHCE_1/2` | *RHCE* alleles in ISBT nomenclature | Categorical | ISBT allele or allele group | Derived via locked mapping |
| `isbt_table_version` | ISBT allele table version used for mapping | String | `[UNVERIFIED]` — see §16 | ISBT resource, with access date |
| `pred_D`, `pred_C`, `pred_E`, `pred_c`, `pred_e` | Genotype-predicted phenotype | Categorical | Positive / negative / partial / weak / unresolved | Locked mapping table §8.6 |
| `pred_V`, `pred_VS`, `pred_hrS`, `pred_hrB`, `pred_Cw` | Predicted only — **never reported as observed** | Categorical | As above | Locked mapping table |
| `tier2_zygosity` | Hybrid Rhesus box result | Categorical | *RHD* homozygous / hemizygous / *RHD*-deleted homozygous / not done | Tier-2 run record |
| `tier2_DEL_c1227GA` | Asian-type DEL screen | Categorical | Detected / not detected / not done | Tier-2 run record |
| `tier2_RHDpsi` | *RHD*Ψ (*RHD\*08N.01*) discrimination | Categorical | Detected / not detected / not done | Tier-2 run record |
| `tier3_performed`, `tier3_result`, `tier3_trigger` | Sanger escalation | Boolean / String / Categorical (T1–T6) | — | Sequencing record |
| `tier4_performed`, `tier4_result`, `tier4_lab` | NGS/long-read referral | Boolean / String / String | — | Referral record |
| `mol_operator_blinded` | Operator blinded to serology at time of test | Boolean | Yes / No | Run attestation |

### 9.4 Outcome and adjudication variables

| Variable | Definition | Type | Levels | Source |
|---|---|---|---|---|
| `pair_id` | Antigen–donor pair identifier | String | — | Derived |
| `antigen` | Antigen for this pair | Categorical | D, C, E, c, e (primary); others secondary | Derived |
| `concordance_class` | Final adjudicated class | Categorical | C, D1–D7 | Adjudication (§8.4) |
| `adjudicator_1_class`, `adjudicator_2_class`, `adjudicator_3_class` | Individual blinded classifications | Categorical | C, D1–D7 | Adjudication forms |
| `adjudication_reason` | Free-text basis | String | — | Adjudication form |
| `resolved_on_repeat` | Discordance resolved by repeat testing | Boolean | Yes / No | §8.4 step 2 |
| `class_locked_date` | Date class locked | Date | — | Data system audit trail |

### 9.5 Covariates, potential confounders and effect modifiers

This is an estimation study, not an effect-estimation study, so "confounder" carries a restricted meaning here: variables that could distort a **frequency** or an **agreement** estimate. `[INFERENCE]`

| Variable | Role | Why |
|---|---|---|
| `centre_id` | **Clustering variable and potential source of bias** | Serological method, reagent lots, operator practice and donor catchment all vary by centre. Clustering must be modelled (§6.4 item 4). |
| `nationality_stratum`, `self_reported_origin` | **Effect modifier for allele frequency** | Three distinct variant repertoires co-occur in the GCC donor pool — an African-ancestry *RHCE* repertoire, an East/Southeast Asian *RHD* repertoire (DEL, Asian-type weak D), and a European-type weak D repertoire `[INFERENCE from the donor-origin composition reported in Madkhali 2025]`. Pooling without stratification would produce a frequency that describes no actual subgroup. |
| `antiD_clone_*`, `sero_method` | **Measurement-bias variable for the concordance outcome** | Clone reactivity and method sensitivity both move the discordance rate `[EVIDENCE — de Paula Vendrame 2019; Srivastava 2022]`. This is why they are dataset variables (D025 item 3). |
| `tier1_lot`, `tier1_software_version` | **Measurement-bias variable** | Lot and software changes are a known source of platform drift `[INFERENCE]` |
| `stratum` | **Selection variable** | Stratum B is an enrichment stratum and must be excluded from unweighted frequency estimates (§6.3) |

**Prohibited:** any subgroup analysis on ancestry, centre, or clone that is not either (a) pre-specified in §12.5 or (b) declared post-hoc in the manuscript, the deviation log and the abstract (`CLAUDE.md` §1.6).

---

## 10. Data sources, data management and search strategy reference

### 10.1 Data sources
Primary data generated by this study: donor enrolment record, serology worksheet, molecular run records, adjudication forms. No routinely-collected clinical data are extracted beyond the eligibility and demographic fields in §9.1.

### 10.2 Literature/search strategy reference
This is a primary study; no systematic search underpins its results. The background evidence base is documented in `01_Protocol/_working/01_pilot03-methods-scoping_v1.0_2026-09-11.md`, which records the searches performed, the databases used (PubMed via MCP, SciSpace), and — importantly — the search limitations. Director decision **D024 was withdrawn as factually false (D036)**: Ameen 2020 was never concealed — PILOT-02 string P4 retrieved it and the log printed its PMID. The real failure was one of **reconciliation** — records were retrieved, tabulated, and then contradicted by a summary sentence written below the table. The governing evidence base for this protocol is `02_Search/_working/PILOT03_GATE_LOG.md`. Any pre-submission literature update must reconcile every summary claim against its own retrieval list, and run broad panel-level strings in addition to RH-specific ones.

**`[UNVERIFIED]`** — the registry check has **not** been performed. Registries (ClinicalTrials.gov, WHO ICTRP, SCTR, OSF, ISRCTN) are not reachable from this environment (D030), and a negative web search is not evidence of absence (D019, D025). Whether a registered or ongoing GCC RH-genotyping study already exists is **unknown**. This is an access limitation, not a finding. It is escalated to Dr. Alanazi and carried into G1 as a declared residual risk.

### 10.3 Data capture
Single study database with a defined schema matching §9, controlled vocabularies for every categorical field, range checks on every numeric field, and a full audit trail of every entry and change. Double data entry or source-data verification for a pre-specified random sample — method and fraction to be fixed in the data-management plan. `[UNVERIFIED — DMP not yet written]`

### 10.4 Identifiers and linkage
Donor identifiers never leave the originating centre. Each centre maintains a local linkage file mapping the donor identifier to `study_id`; only `study_id` enters the study database. Deduplication (criterion E4) uses a **salted hash** of the donor identifier computed locally, so duplicate detection is possible without transferring the identifier. **No MRN, donor number, name, or national ID may appear in any study file, export, commit or output** (`CLAUDE.md` §1.7).

### 10.5 Nomenclature (D028)

ISBT allele nomenclature is encoded in the data dictionary **from day one**, alongside the retained raw platform call (§9.3). Retrofitting nomenclature after data capture silently loses information.

Reporting conventions, fixed:
- Genes italicised; alleles in ISBT form (*RHD\*01N.01*, *RHD\*01W.1*, *RHD\*01EL.01*, *RHD\*08N.01*, *RHCE\*01.20.01*, *RHCE\*01.04*, etc.).
- Trivial names (*ceS*, *ceAR*, *DAU*, *DIIIa*) paired with the ISBT allele name at first use, then used consistently.
- Antigens in ISBT notation with numeric equivalent at first use: D (RH1), C (RH2), E (RH3), c (RH4), e (RH5), C^w^ (RH8), V (RH10), hr^S^ (RH19), VS (RH20), hr^B^ (RH31). Superscripts typeset, not rendered as "hrS".
- **"Serologic D-negative" and "molecularly *RHD*-negative" are distinct terms and are never used interchangeably** `[EVIDENCE — Flegel 2025, DOI 10.1186/s12967-025-06716-8]`.
- Obsolete terms prohibited: "Du", "Rh factor", "Rh-negative gene", and unqualified "D-negative".

**`[UNVERIFIED]` — the current ISBT RH allele table version and date are not confirmed.** Web search suggested an ISBT database migration in November 2025 replacing the legacy PDF allele tables, but ISBT pages were not reachable (D025, D028, D030). Before the mapping table (§8.6) is locked, a human must confirm: (i) the current version identifier and date of the RH (004) *RHD* and *RHCE* allele tables; (ii) whether the database or the archived PDF is the citable resource; (iii) the citation format ISBT requests. **This blocks locking the mapping table, and therefore blocks first sample testing.**

---

## 11. Risk of bias / quality framework

### 11.1 Statement of what applies and what does not

Formal risk-of-bias instruments (RoB 2, ROBINS-I, Newcastle–Ottawa, AMSTAR-2, QUADAS-2) are designed to appraise **existing** studies for evidence synthesis. PILOT-03 generates primary data, so none of them "scores" this study. Saying otherwise would be methodological theatre. `[INFERENCE]`

What is appropriate, and what this protocol therefore adopts, is to use the relevant instruments' **domains as a prospective design specification** — i.e. to design against each known bias domain and to state where the design is exposed.

### 11.2 Instruments adopted, and why

| Instrument | Use here | Justification |
|---|---|---|
| **QUADAS-2** (four domains: patient selection; index test; reference standard; flow and timing) | **Prospective design-time framework for the concordance component**, and the appraisal instrument a future systematic reviewer would apply to this paper | The concordance component is structurally a test-comparison study. Designing against QUADAS-2's domains is the most direct way to ensure the published paper is appraisable as low risk of bias. See §11.3. |
| **JBI Critical Appraisal Checklist for Studies Reporting Prevalence Data** | **Prospective design-time framework for the frequency component** (objectives S1–S5) | Its items (appropriate sampling frame, appropriate recruitment, adequate sample size, subject/setting description, coverage of the identified sample, valid methods for identifying the condition, standard measurement across participants, appropriate statistical analysis, adequate response rate) map exactly onto the design decisions in §5, §6 and §7. |
| **STROBE** + **STARD methods items** | Reporting | D027 |

### 11.3 Domain-by-domain design response (QUADAS-2 framing)

| QUADAS-2 domain | Bias risk in this study | Design response |
|---|---|---|
| **Patient selection** | Selecting donors on D status, ancestry or known phenotype would bias frequencies | Consecutive enrolment (§6.2); enrichment confined to a declared, separately-analysed Stratum B (§6.3); nationality/ancestry never an eligibility criterion (§5.2) |
| **Index test (serology)** | Reagent clone and method sensitivity move the discordance rate; interpretation could be influenced by knowledge of the genotype | Single harmonised SOP; clone/lot/class recorded per test (§7.3); **serology performed and interpreted blind to genotype** (§9.2 `sero_operator_blinded`); reaction-grade cut-off pre-specified |
| **Reference standard (genotype)** | Panel assays cannot detect off-panel alleles *by design*; genotype-predicted phenotype is a model, not an observation | Reference standard explicitly declared **imperfect** (§3.2); mapping table locked in advance (§8.6); unresolved calls have their own class and are never counted as concordant (§8.3 D5); **genotyping performed blind to serology** (§9.3) |
| **Flow and timing** | Differential escalation of only the "inconvenient" samples is the classic partial-verification bias | Escalation triggers are a **closed, pre-specified list** (§7.4); repeat testing is mandatory on **both** arms (§8.4 step 2); both measurements are from the same specimen; every donor's disposition is accounted for in a flow diagram (§13.2) |
| **Additional — adjudication** (not a QUADAS-2 domain, but the dominant risk here) | Adjudicating discordances after seeing which are inconvenient | Blinded, independent, two-plus-tiebreak adjudication with masked centre identity and masked aggregate statistics; classes locked on entry (§8.4) |
| **Additional — multiplicity** | Frequency-mining across many alleles and subgroups | Pre-specified analysis set (§12.5); everything else declared exploratory or post-hoc |

### 11.4 Certainty of evidence (GRADE)

**GRADE is not applied to this study's own findings.** GRADE and GRADE-CERQual rate certainty in a **body of evidence** addressing a question, typically within a systematic review; applying a GRADE rating to a single primary study's own results would be a misuse of the instrument. `[INFERENCE]`

Instead, the certainty burden is carried explicitly by: (i) a 95% CI on every estimate with the denominator stated; (ii) the QUADAS-2 and JBI domain-by-domain self-appraisal in §11.3, reported in the manuscript's limitations; (iii) explicit precision statements for rare alleles, where estimates will rest on few observations; and (iv) explicit non-transferability statements (Jazan frequencies are not "Saudi" frequencies; Gulf frequencies are not transferable from Thai, Brazilian or US data). If a future synthesis incorporates this study, GRADE would be applied there, by that review.

---

## 12. Analysis framework

**The detailed Statistical Analysis Plan is the `biostatistics-expert` deliverable, filed in `05_Analysis/` and approved at Gate G4 before any analysis.** This section fixes the framework the SAP must implement; it does not pre-empt the SAP's choices of estimator.

### 12.1 Analysis populations
- **Concordance analysis set:** all antigen–donor pairs with both a serological result and a genotype call, in Stratum A. Class D6 excluded, reported separately.
- **Frequency analysis set:** all Stratum A donors with a valid genotype.
- **D-negative characterisation set:** all serologically D-negative donors from Strata A and B, with its own denominator, never pooled into unweighted population estimates.

### 12.2 Primary analysis
Per antigen: 2×2 cell counts; percent agreement with 95% CI; Cohen's kappa with 95% CI; the pre-specified prevalence-adjusted companion statistic (§8.2). Discordance-class counts and proportions with denominators. Secondary directional descriptors (sensitivity/specificity of serology against genotype) reported with the imperfect-reference caveat (§3.2).

### 12.3 Frequency analysis
Allele and genotype counts and frequencies with 95% CI (exact or score interval; `biostatistics-expert` to choose and justify). **Allele-level and donor-level denominators are never pooled** — Madkhali 2025 reports *RHCE* as 708 alleles from 354 donors, and the two are different quantities `[EVIDENCE]`. Zero counts require a named upper-bound method.

### 12.4 Clustering and missing data
Centre-level clustering addressed explicitly (method per the SAP). Missing data: mechanism described, extent reported per variable, and handling pre-specified. Missing values are never imputed for the primary concordance outcome — a pair with a missing arm is excluded from that antigen's denominator and counted.

### 12.5 Pre-specified subgroup and sensitivity analyses — closed list

**Subgroups (pre-specified, limited):**
1. National versus expatriate donor stratum;
2. Centre (and country, if ≥3 states participate);
3. Serologic D-positive versus serologic D-negative donors (for *RHD* objectives only).

Multiplicity control across these is the SAP's responsibility and must be stated. **Any other subgroup analysis is post-hoc** and is labelled post-hoc in the protocol deviation log, the manuscript and the abstract.

**Note on interpreting a null subgroup result:** Madkhali 2025 found no statistically significant Saudi-versus-non-Saudi difference (p=0.5066 allele, p=0.8627 genotype) but also found zero rare or hybrid alleles among 110 non-Saudi donors `[EVIDENCE]`. A non-significant test on a small, internally heterogeneous comparator group is **inconclusive, not evidence of no difference** `[UNCERTAIN]`, and PILOT-03 must not repeat that interpretive error.

**Sensitivity analyses (pre-specified):** SA1–SA3 on the D5 assumption (§8.5); analysis with and without resolve-on-repeat reclassification; analysis restricted to a single centre versus pooled, to expose centre-driven effects.

### 12.6 Exploratory extension (S9)
The match-probability model is **exploratory**. Every input parameter must carry its provenance (this study's own estimate, or an external estimate with its population explicitly named). Model structure, assumptions and code are published or deposited. No inventory or policy recommendation may be drawn from it beyond a clearly-hedged `[RECOMMENDATION]`.

### 12.7 Traceability
Every number in any output must be traceable to the final approved dataset and output file by filename and line/table reference (`CLAUDE.md` §6). Complete syntax and unedited output are retained.

---

## 13. Reporting

### 13.1 Standards
STROBE (cross-sectional) checklist completed at reporting; STARD methods items satisfied. Checklist file: `01_Protocol/_working/01_pilot03-strobe-checklist_v0.1_2026-09-11.md`.

### 13.2 Flow diagram
A participant/specimen flow diagram is mandatory, accounting for: donors approached → consented → enrolled → sample received → DNA passed QC → Tier-1 result → Tier-2 (with trigger) → Tier-3 (with trigger) → Tier-4 (with trigger) → adjudication → final analysis set, with all exclusions and their reasons at every step, per antigen where denominators differ.

### 13.3 Mandatory reporting commitments
- Discordant and null findings receive the same prominence as concordant ones (`CLAUDE.md` §1.4). A high concordance rate will **not** be allowed to bury the D2, D4 and D5 counts.
- Values not reported are recorded `NR`; nothing is back-calculated unless pre-specified and flagged as derived.
- No "first" claim of any kind (D029).
- Association is never written as causation.
- AI assistance disclosed per journal policy (`CLAUDE.md` §1.10).

---

## 14. Ethics

`[UNVERIFIED]` throughout this section — ethics, consent and sample access are the PI's responsibility (D020) and none of the following is yet in place. This section is written so that it can be lifted directly into an IRB application.

### 14.1 IRB / REC approval
- **Status: not yet submitted.** `[UNVERIFIED]`
- A **lead IRB** must be identified, with local approvals or acknowledgements from each participating centre and, where applicable, national research-authority approval in each participating GCC state. The multi-state structure means more than one regulatory regime applies. `[UNVERIFIED]` — the applicable national research regulations for each state have **not** been verified and none may be cited by clause in this protocol or in the IRB application drafted from it.
- No sample may be collected at any centre before that centre's approval is in hand.

### 14.2 Consent
Written informed consent is obtained from every donor before the research aliquot is drawn. **A consent waiver is not appropriate for this study** — unlike a retrospective record review, this is prospective collection of a research specimen and generation of genetic data. The consent document must cover, at minimum: the purpose; that genetic testing of blood group genes will be performed; that the sample and data will be shared with a central laboratory and possibly a referral laboratory in another country; the retention period and eventual disposition of the sample; whether and how individual results will be returned; the right to withdraw and what withdrawal means for already-generated data; and that no clinical decision about the donor will be made on the study result unless the result-return pathway in §14.4 applies.

### 14.3 Data protection
- No identifiers leave the originating centre (§10.4).
- Cross-border transfer of samples and coded data between GCC states requires a data-transfer agreement and must satisfy the data-protection law of each state involved. **`[UNVERIFIED]`** — the applicable instruments have not been verified and **no statute or article number may be cited** in this protocol or the IRB application until read (`CLAUDE.md` §1.1).
- Access controls, retention period and destruction schedule specified in the data-management plan. `[UNVERIFIED — DMP not written]`

### 14.4 Incidental and clinically relevant findings
This study will generate findings with potential clinical relevance to the donor — most clearly a serologically D-negative donor carrying a functional *RHD* gene (class D2), and a partial D donor whose own future transfusion or pregnancy management may differ. **A result-return pathway must be pre-specified in the IRB application, not improvised**, covering: which findings are returned, to whom, through which clinician, on what timeline, and whether the donor's blood-bank record is annotated. `[UNVERIFIED — pathway not yet defined; this is a decision for the PI and the IRB.]` `[RECOMMENDATION]` This must be resolved before consent documents are finalised, because it determines what the consent form must say.

### 14.5 Unit labelling
This study does **not** change the labelling or release of any donated unit. Any proposal to act on a study genotype in unit labelling requires separate regulatory approval and is outside this protocol.

### 14.6 Funding and conflicts
`[UNVERIFIED]` — funding source and any vendor relationship (particularly with the Tier-1 platform manufacturer) must be declared in the protocol, the IRB application and every output. A vendor relationship is a material conflict in a single-platform study and must be stated even if no vendor support is received.

---

## 15. Registration

**Decision (D026): PILOT-03 will be registered prospectively on OSF Registries before the first donor sample is collected**, irrespective of whether any target journal requires it. ISRCTN is the fallback, subject to checking a possible UK-participant scope condition that could disqualify a GCC study. `[UNVERIFIED]` — that scope condition has not been checked; ISRCTN is not reachable from this environment.

- **Registration ID: `[UNVERIFIED — not yet registered]`.** It must be inserted into this protocol, and the protocol version re-issued, before the first sample is collected.
- **PROSPERO is not applicable** — this is a primary observational study, not a systematic review.
- Registration must record, at minimum: the primary outcome exactly as defined in §8.1–§8.3, the adjudication procedure (§8.4), the pre-specified subgroups (§12.5) and the D5 sensitivity analyses (§8.5). Registering a vaguer version of the protocol than the one in hand would defeat the purpose.
- **The action sits with Dr. Alanazi**; no agent can register a study.

---

## 16. Consolidated `[UNVERIFIED]` register

Every item below must be resolved, or explicitly accepted as a residual risk by Dr. Alanazi, before Gate G1 closes. Items marked **BLOCKING** additionally prevent the first sample being tested even if G1 closes.

| # | Item | Blocks | Owner |
|---|---|---|---|
| U1 | **Current ISBT RH allele table version/date**, and which resource is citable after the suggested Nov-2025 migration | **BLOCKING** — mapping table (§8.6) cannot be locked | Dr. Alanazi / human (ISBT pages unreachable, D030) |
| U2 | **Registry check not performed** — unknown whether a registered/ongoing GCC RH genotyping study exists | G1 (declared residual risk) | Dr. Alanazi |
| U3 | **PILOT-03's own OSF registration ID** | **BLOCKING** — first sample collection | Dr. Alanazi |
| U4 | Participating centre list, countries, volumes, methods, local IRBs | **BLOCKING** | PI |
| U5 | Anti-D clone inventory at each centre (D025 item 3) | **BLOCKING** — §7.3(1) cannot be operationalised | Site survey |
| U6 | Whether hr^S^/hr^B^/V/VS **reference serology** is obtainable (D025 item 5) | G1 — determines secondary outcome scope | Dr. Alanazi |
| U7 | Tier-1 platform identity, panel content annex, kit/software version, lot policy | **BLOCKING** | PI |
| U8 | Tier-4 referral laboratory and budgeted maximum n | **BLOCKING** | PI |
| U9 | DNA quality thresholds; serological reaction-grade cut-off; serology–genotype maximum interval (SOP annex) | **BLOCKING** | PI / laboratory |
| U10 | Named adjudicators and independence attestation (§8.4) | **BLOCKING** | PI |
| U11 | IRB status, consent document, cross-border transfer agreements, applicable data-protection instruments | **BLOCKING** | PI |
| U12 | Incidental/clinically relevant finding return pathway (§14.4) | **BLOCKING** — determines consent wording | PI + IRB |
| U13 | Sample size and escalation budget | G1/G4 | `biostatistics-expert` (in progress, D031) |
| U14 | Data-management plan (double entry fraction, retention, access control) | G1 | PI / data manager |
| U15 | Funding source and vendor relationships | G1 | PI |
| U16 | **Al-Riyami 2021 full text not accessed** — all methods detail beyond the abstract is unknown | G1 | Dr. Alanazi (institutional access) |
| U17 | **Entire reference list not yet citation-verified** (`CLAUDE.md` §1.2) | G1 | `citation-verification-expert` |
| U18 | Madkhali 2025 internal date discrepancy (Dec 2024 vs Mar 2024 sampling window) | G1 | `citation-verification-expert` |
| U19 | Chang 2024 (*Blood*) is a **conference abstract** — lower evidentiary weight; Hyland 2026 (*Vox Sang*) seen only as a search-result title; Iran 99% figure is an unverified snippet | G1 | `citation-verification-expert` |
| U20 | **No AABB, BSH/JPAC, EDQM or CBAHI standard has been read.** No clause, section or edition may be cited anywhere in this protocol, the IRB application, or any output | Standing prohibition | All agents |

---

## 17. Methodological risk register

Risks are ordered by the product of likelihood and consequence for the study's validity, not by ease of mitigation.

| # | Risk | Consequence if unmitigated | Mitigation in this protocol | Residual |
|---|---|---|---|---|
| R1 | **Post-hoc adjudication of discordances** — classifying inconvenient discordances after seeing aggregate results | The single most likely integrity criticism of this design; invisible in a manuscript unless pre-specified | §8.4: automated flagging, blinded independent adjudication with masked centre identity, masked aggregate statistics, third-adjudicator tiebreak, classes locked on entry, inter-adjudicator agreement reported | Requires named, genuinely independent adjudicators (U10). **Moderate until U10 resolved.** |
| R2 | **Off-panel alleles inflating apparent concordance** — a panel assay reports "conventional" for an allele it cannot see | Concordance overstated; partial D silently missed | §7.4 escalation triggers; class D5 never counted as concordant; SA1–SA3 bracketing; panel content locked as an annex | **Irreducible in part** — a truly novel allele indistinguishable from conventional on all tiers will be missed. Stated as a limitation. |
| R3 | **Multi-platform Tier 1** if centres cannot standardise | Class-D7 discordance contaminates the primary outcome; between-centre comparison confounded by assay | §7.1: single Tier-1 platform mandatory, or centralised genotyping; D7 reported entirely separately | **High until U7 resolved.** If a single platform is impossible, the design must be revisited at G1, not patched later. |
| R4 | **Kappa paradox at high antigen prevalence** (e ≈ 99%) | Near-perfect agreement reported as poor kappa; misleading conclusion | §8.2: mandatory prevalence-adjusted companion statistic plus full 2×2 counts; kappa never reported alone | Low, once SAP fixes the statistic. **`[FLAG F2]`** |
| R5 | **Enrichment stratum leaking into frequency estimates** | Variant frequencies inflated; the headline numbers become wrong | §6.3 Stratum B excluded from unweighted estimates; separate analysis populations (§12.1) | Low if analysis sets are enforced in code. **`[FLAG F3]`** |
| R6 | **Serological method heterogeneity across centres** | Between-centre "differences" that are reagent artefacts; discordance rate driven by method `[EVIDENCE — de Paula Vendrame 2019]` | §7.3 harmonised SOP; clone/lot/method as per-test variables; centre-stratified sensitivity analysis (§12.5) | Moderate — full harmonisation may be impractical; the variables at least make it analysable rather than invisible. |
| R7 | **Unblinding between arms** — a technologist who knows the genotype grading a weak reaction | Differential misclassification biasing concordance upward | §7.3, §9.2–§9.3 blinding attestations per test; repeat testing by blinded operators | Moderate in small laboratories where separation is hard. Must be reported honestly if not achieved. |
| R8 | **Ancestry stratification ignored** | A pooled frequency that describes no actual subgroup; three distinct variant repertoires averaged together | §9.5 and §12.5 stratification mandatory; non-transferability statements required | Low methodologically; limited by how well nationality/origin is recorded (U4). |
| R9 | **Selective enrolment** — centres steering D-negative or "interesting" donors into Stratum A | Frequencies biased | §6.2 consecutive enrolment; §5.2 prohibits selection on phenotype; enrolment log audited against donation log | Moderate; requires an enrolment audit, which should be specified in the DMP. |
| R10 | **Result-return pathway improvised after a D2 finding** | Ethical exposure; consent that did not cover what actually happened | §14.4 requires the pathway before consent documents are finalised | **High until U12 resolved.** |
| R11 | **Sample size inadequate for rare alleles** — most planning inputs rest on 1–6 observations from one region | Uninformatively wide CIs on the alleles of greatest interest | §6.4 precision-based framing with bracketing scenarios, delegated to `biostatistics-expert` | Open until U13 delivered. Honest reporting of wide CIs is the fallback, not narrative inflation. |
| R12 | **A registered/ongoing GCC study duplicates this one** | Wasted effort; a scoop | §10.2 escalated to PI for manual registry search; direct enquiry to national blood services of Qatar, Bahrain, UAE, Kuwait, and to the Jazan and Oman groups, recommended | **Unresolved (U2).** |
| R13 | **Vendor conflict of interest in a single-platform study** | Credibility of the concordance estimate | §14.6 mandatory declaration whether or not support is received | Low if declared. |
| R14 | **Scope creep in the S9 modelling extension** | An exploratory simulation presented as a finding | §12.6 explicitly exploratory; full parameter provenance; no policy recommendation beyond a hedged `[RECOMMENDATION]` | Low. **`[FLAG F7]`** |
| R15 | **Attrition of a participating centre mid-study** | Loss of the multi-centre design property — which §1.3.4 item 2 explicitly records as **the weakest claim in the protocol and not load-bearing** | Minimum of two states with a stated contingency; if the study reduces to one centre it **must be reported as single-centre**. The §1.3.2 rationale (Saudi allele-level resolution) and the §1.3.5 clinical motivation both survive that reduction; only §1.3.4 item 2 is lost | Moderate; an honest re-framing, not a re-labelling, is the only acceptable response. |

---

## 18. Flags to the Director

These are specifications or tensions arising from fixed constraints. **None is a unilateral change**; each is raised for Director ratification per D031.

| # | Flag | Nature |
|---|---|---|
| **F1** | D027 requires designating a reference and an index test. This protocol designates **genotype = reference, serology = index**, but adds that because **neither is a gold standard, the primary metric must be agreement (kappa), not accuracy (sensitivity/specificity)**. Sensitivity/specificity are reported only as secondary directional descriptors with an imperfect-reference caveat. | Specification consistent with D027; needs ratification because it constrains how results may be phrased. |
| **F2** | D027 fixes "kappa with 95% CI plus percent agreement". For antigens with ~98–99% prevalence (e, hr^S^) kappa will be paradoxically low despite near-perfect agreement. This protocol **adds a mandatory prevalence-adjusted companion statistic** (PABAK/AC1/equivalent, choice delegated to the SAP). Kappa remains the named primary coefficient. | **Addition** to D027, not a replacement. Needs ratification and must be communicated to `biostatistics-expert` — it may affect the sample-size work now running in parallel. |
| **F3** | The Stratum B D-negative enrichment required to deliver DEL/zygosity objectives (S3, S5) **alters denominators**. This protocol quarantines Stratum B from all unweighted frequency estimates. If any design-weighted population estimate is wanted, the weighting must be specified in the SAP. | Design consequence of D025 item 4; needs ratification and communication to `biostatistics-expert`. |
| **F4** | **§7.1 mandates a single Tier-1 platform or fully centralised genotyping.** If procurement or logistics make this impossible, the design must be revisited **at G1**, not patched during execution — a multi-platform Tier 1 would contaminate the primary outcome. | Escalation trigger, not a change. |
| **F5** | **Tier 4 has no named referral laboratory and no budgeted n** (D025 item 1 requires a budgeted n). Until both exist, "escalate to NGS" is not an executable procedure. | Gap in an adopted decision; blocking (U8). |
| **F6** | **§14.4 (return of clinically relevant findings) is unresolved and determines consent wording.** It is not addressed in any logged decision and cannot be deferred past IRB submission. | Gap; blocking (U12). |
| **F7** | Objective **S9 (match-probability modelling)** is a simulation, not a clinical prediction model; **TRIPOD does not govern it** and STROBE does not cover it. It is specified as exploratory with full parameter provenance. If S9 is intended to be a headline contribution (D029 lists modelling among the differentiators), that tension should be resolved explicitly — a headline claim resting on an exploratory simulation is a peer-review vulnerability. | Tension between D029's differentiator list and the evidentiary weight a simulation can bear. |
| **F8** | The rationale in §1.3 depends on the study actually being **multi-centre and multi-state**. If enrolment reduces to one centre or one country (R15), the stated gap is no longer addressed and the paper must be re-framed, not re-labelled. | Standing condition on D022's rationale. |

---

## 19. Protocol governance

### 19.1 Version history

| Version | Date | Author | Change | Results known? |
|---|---|---|---|---|
| v0.1 | 2026-09-11 | `methodology-protocol-expert` | Initial draft for Gate G1 | No — no data exist |

### 19.2 Freeze and deviations
On Gate G1 approval this protocol is frozen at the approved version. Every subsequent change is recorded in `01_Protocol/_working/PROTOCOL_DEVIATIONS.md`. Changes made after any result is known are labelled **post-hoc** in the protocol, the manuscript and the abstract, without exception.

### 19.3 Prohibited actions after freeze
- Changing the primary outcome, its metric, the discordance taxonomy, or the adjudication procedure.
- Promoting a secondary outcome to primary (**outcome switching**) — will be refused and escalated to Dr. Alanazi.
- Adding an escalation trigger, subgroup, or sensitivity analysis without declaring it post-hoc.
- Moving the serological reaction-grade cut-off or the genotype→phenotype mapping.
- Re-adjudicating a locked concordance class without a written deviation entry stating whether results were known.

### 19.4 Related files
| File | Contents |
|---|---|
| `01_Protocol/_working/01_pilot03-methods-scoping_v1.0_2026-09-11.md` | Domain and laboratory scoping; evidence base; sample-size inputs |
| `01_Protocol/_working/01_pilot03-strobe-checklist_v0.1_2026-09-11.md` | STROBE item-by-item + STARD methods items |
| `01_Protocol/_working/PROTOCOL_DEVIATIONS.md` | Deviation log (stub; active from G1 freeze) |
| `05_Analysis/` (pending) | Sample size and Statistical Analysis Plan — `biostatistics-expert` |
| Annexes pending | Laboratory SOP; Tier-1 panel content; genotype→phenotype mapping table; data-management plan; consent document |

---

**END OF PROTOCOL v0.1 — DRAFT, NOT FROZEN, NOT APPROVED.**
