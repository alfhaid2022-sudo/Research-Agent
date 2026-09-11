# PILOT-03 — STROBE (cross-sectional) checklist, with STARD methods items

**Companion to:** `01_Protocol/_working/01_pilot03-protocol_v0.1_2026-09-11.md` (v0.1, 2026-09-11)
**Prepared by:** `methodology-protocol-expert`
**Date:** 2026-09-11
**Status:** Gate G1 deliverable — completed **at protocol stage**. Items that can only be satisfied when results exist are marked **"to be completed at reporting"** with the protocol section that will govern them.

---

## Important caveat on the checklist itself

**`[UNVERIFIED]` — the official STROBE and STARD checklist documents were not opened in this environment.** The EQUATOR Network and all publisher pages are blocked by egress policy (Director decision D030). The item numbering and item content below are reproduced from working knowledge of the published checklists, expressed in paraphrase rather than as quotation, and **must be reconciled against the authoritative published checklists by a human before submission**. Do not treat the wording below as a verbatim reproduction of either instrument, and do not cite a checklist version number until the document has been read.

Two standards are mapped here (Director decision D027):
- **STROBE (cross-sectional) — primary reporting standard**, items 1–22.
- **STARD methods items — additionally satisfied** for the serology–genotype concordance component.

Legend: **Addressed** = specified in the protocol now; **At reporting** = cannot be completed before data exist; **N/A** = item does not apply, with the reason stated (never left blank).

---

## Part A — STROBE (cross-sectional) items 1–22

### Title and abstract

| # | Item (paraphrased) | Status | Where / how satisfied |
|---|---|---|---|
| **1a** | State the study design with a commonly used term in the title or abstract | **Addressed (protocol) / At reporting (manuscript)** | Protocol title states "multi-centre, prospective, cross-sectional laboratory study"; §4.1. The manuscript title must carry the same term. |
| **1b** | Provide in the abstract an informative and balanced summary of what was done and what was found | **At reporting** | Governed by protocol §13.3: discordant and null findings receive equal prominence; no "first" claim (D029); denominators with every percentage; any post-hoc element labelled post-hoc in the abstract itself (§19.2). |

### Introduction

| # | Item | Status | Where / how satisfied |
|---|---|---|---|
| **2** | Explain the scientific background and rationale for the investigation | **Addressed** | §1.1 (clinical problem), §1.2 (what is known in the GCC, tabulated by study), §1.3 (the gap, stated as a design-property gap per D022), §1.4 (explicit prohibition on novelty claims, per D023/D029). |
| **3** | State specific objectives, including any prespecified hypotheses | **Addressed** | §2.1 primary objective; §2.2 secondary objectives S1–S9 with the form of the answer for each; §2.3 explicit statement of what the study will **not** do (no causal claim; no policy claim; hr^S^/hr^B^/V/VS not reported as observed). No hypothesis test is the primary deliverable — the framing is estimation (§6.4, §12). |

### Methods

| # | Item | Status | Where / how satisfied |
|---|---|---|---|
| **4** | Present key elements of study design early in the paper | **Addressed** | §4.1 design; §4.3 alternative designs considered and reasons for rejection; §4.4 reporting standard. |
| **5** | Describe the setting, locations, and relevant dates, including periods of recruitment, exposure, follow-up and data collection | **Partially addressed — `[UNVERIFIED]`** | §6.1 specifies the setting type and the table of centre fields to be completed; **the centre list, countries and enrolment windows are not yet fixed (register item U4)**. Dates to be completed at reporting. No follow-up (cross-sectional). |
| **6a** | Give the eligibility criteria, and the sources and methods of selection of participants | **Addressed** | §5.1 inclusion I1–I6 and §5.2 exclusion E1–E7, each written to be applied independently by two screeners from a named source document; §6.2 consecutive enrolment; §6.3 Strata A and B, with Stratum B declared as an enrichment stratum. |
| **6b** | *(Cohort-specific matching item)* | **N/A** | No matched design; matching applies to cohort/case–control studies, neither of which is used (§4.3). |
| **7** | Clearly define all outcomes, exposures, predictors, potential confounders and effect modifiers; give diagnostic criteria if applicable | **Addressed** | §8 outcome definitions (primary outcome, metric, seven-class discordance taxonomy, indeterminate handling, locked genotype→phenotype mapping); §9 full variable list with definition, type, unit/levels and source; §9.5 covariates, clustering variable, effect modifiers and measurement-bias variables, with the restricted meaning of "confounder" in an estimation study stated explicitly. |
| **8** | For each variable of interest, give sources of data and details of methods of assessment (measurement); describe comparability of assessment methods if there is more than one group | **Addressed** | §7.1 tiered platform architecture with a **single** Tier-1 platform mandatory (comparability across centres); §7.2 specimen and DNA; §7.3 harmonised serological methods with anti-D clone identity, manufacturer, lot and Ig class recorded as **per-test dataset variables** (D025 item 3); §7.4 closed list of escalation triggers; §9 source column for every variable. **`[UNVERIFIED]`** — platform identity (U7), clone inventory (U5), DNA thresholds and reaction-grade cut-off (U9) not yet fixed. |
| **9** | Describe any efforts to address potential sources of bias | **Addressed** | §11.3 domain-by-domain design response using the QUADAS-2 domains (patient selection; index test; reference standard; flow and timing) plus an added adjudication domain and a multiplicity domain; §8.4 blinded independent adjudication; §7.3/§9.2–§9.3 bidirectional blinding of serology and genotyping operators; §17 risk register R1–R15 with mitigations and residual risk. |
| **10** | Explain how the study size was arrived at | **Deferred by design — `[UNVERIFIED]`** | §6.4. Sample size is the `biostatistics-expert` deliverable running in parallel (D031) and **no number is stated in this protocol**. The six methodological requirements the calculation must satisfy (precision-based framing; separate justification for concordance and rare-allele objectives; zero-count upper bound; centre design effect; bracketing scenarios for inputs resting on 1–6 observations; Tier-2/3/4 escalation budget) are fixed in §6.4. Register item U13. |
| **11** | Explain how quantitative variables were handled in the analyses; if applicable, describe which groupings were chosen and why | **Addressed** | §7.3(5) and §9.2 — serological reaction grades are ordinal (0, w+, 1+…4+) and are dichotomised to antigen-positive/negative by a **cut-off pre-specified before data collection and immovable afterwards** (§19.3); §8.2 the 2×2 cell counts underlying every agreement statistic are reported; §12.3 allele-level and donor-level denominators are never pooled. **`[UNVERIFIED]`** — the numeric cut-off is not yet fixed (U9). |
| **12a** | Describe all statistical methods, including those used to control for confounding | **Framework addressed; detail deferred to the SAP** | §12.1 analysis populations; §12.2 primary analysis (2×2 counts, percent agreement with 95% CI, Cohen's kappa with 95% CI, mandatory prevalence-adjusted companion statistic); §12.3 frequency analysis; §12.4 clustering. The detailed SAP is the `biostatistics-expert` deliverable, approved at Gate G4 **before** any analysis (`CLAUDE.md` §6). |
| **12b** | Describe any methods used to examine subgroups and interactions | **Addressed** | §12.5 **closed list** of three pre-specified subgroups (national vs expatriate; centre/country; serologic D+ vs D−). Any other subgroup is post-hoc and must be labelled post-hoc in the deviation log, manuscript and abstract. Multiplicity control delegated to the SAP. |
| **12c** | Explain how missing data were addressed | **Addressed** | §8.5 table of indeterminate/unresolved handling (D5 counted non-concordant; D6 excluded from the denominator and reported separately; missing arm removes that antigen–donor pair only); §12.4 no imputation for the primary outcome. |
| **12d** | *(Cross-sectional)* If applicable, describe analytical methods taking account of the sampling strategy | **Addressed** | §6.3 Stratum B quarantined from all unweighted frequency estimates; §12.1 three distinct analysis populations; §12.4 centre-level clustering modelled. Any design-weighted estimate requires the weighting method to be specified in the SAP (§6.3, Flag F3). |
| **12e** | Describe any sensitivity analyses | **Addressed** | §8.5 SA1–SA3 bracketing the D5 assumption (non-concordant / excluded / concordant), **all three reported together in the same table**; §12.5 further pre-specified sensitivity analyses (with/without resolve-on-repeat reclassification; single-centre vs pooled). |

### Results

| # | Item | Status | Where / how satisfied |
|---|---|---|---|
| **13a** | Report numbers of individuals at each stage of the study | **At reporting** | Governed by §13.2, which mandates a flow diagram accounting for donors approached → consented → enrolled → sample received → DNA QC → Tier 1 → Tier 2 → Tier 3 → Tier 4 → adjudication → analysis set. |
| **13b** | Give reasons for non-participation at each stage | **At reporting** | §13.2 requires exclusions **and their reasons** at every step; §5.2 supplies the reason categories (E1–E7); §8.5 supplies the D6 reason categories. |
| **13c** | Consider use of a flow diagram | **At reporting — mandatory here, not optional** | §13.2. Because denominators differ by antigen, the diagram must be reported per antigen where they differ. |
| **14a** | Give characteristics of study participants and information on exposures and potential confounders | **At reporting** | Variables fixed in §9.1 (age, sex, donor status, nationality stratum, self-reported origin, centre, stratum). |
| **14b** | Indicate the number of participants with missing data for each variable of interest | **At reporting** | §12.4 requires extent of missingness reported per variable. |
| **14c** | *(Cohort-specific: summarise follow-up time)* | **N/A** | Cross-sectional; no follow-up (§4.1). |
| **15** | Report numbers of outcome events or summary measures | **At reporting** | §8.2 mandates full 2×2 cell counts per antigen; §8.3 mandates counts and proportions per discordance class C, D1–D7 with denominators; §2.2 fixes the form of every secondary outcome. |
| **16a** | Give unadjusted estimates and, if applicable, confounder-adjusted estimates and their precision; make clear which confounders were adjusted for and why | **At reporting** | §12.2–§12.3: every estimate reported with 95% CI and denominator (`CLAUDE.md` §6). Adjustment here means accounting for centre-level clustering and stratification (§9.5, §12.4), not causal confounder adjustment — the study estimates frequencies and agreement, not effects (§2.3, §9.5). |
| **16b** | Report category boundaries when continuous variables were categorised | **At reporting** | The only categorisation of a quantitative variable is the serological reaction-grade cut-off (§7.3(5)), which must be reported explicitly as the pre-specified boundary. |
| **16c** | If relevant, consider translating estimates of relative risk into absolute risk for a meaningful time period | **N/A** | No relative-risk estimates are produced; the study reports proportions and agreement statistics, which are already absolute. |
| **17** | Report other analyses done — e.g. analyses of subgroups and interactions, and sensitivity analyses | **At reporting** | §12.5 (closed subgroup list) and §8.5/§12.5 (sensitivity analyses). Anything outside that list must be reported **and labelled post-hoc** (§19.2–§19.3). |

### Discussion

| # | Item | Status | Where / how satisfied |
|---|---|---|---|
| **18** | Summarise key results with reference to study objectives | **At reporting** | §13.3 — discordant and null findings carry the same prominence as concordant ones (`CLAUDE.md` §1.4); a high concordance rate may not bury the D2/D4/D5 counts. |
| **19** | Discuss limitations, taking into account sources of potential bias or imprecision; discuss both direction and magnitude of any potential bias | **Addressed in advance** | §11.3 QUADAS-2/JBI domain self-appraisal is written now and carries into the limitations section; §17 risk register states the **residual** risk after mitigation for each of R1–R15, including risks that weaken the authors' preferred conclusion (R2 off-panel alleles inflating apparent concordance; R7 imperfect blinding in small laboratories; R11 wide CIs on rare alleles). |
| **20** | Give a cautious overall interpretation considering objectives, limitations, multiplicity, results from similar studies and other relevant evidence | **At reporting** | §2.3 and §13.3: no causal language; no policy recommendation beyond hedged `[RECOMMENDATION]`; §12.5 records the specific interpretive error to avoid (a non-significant subgroup test on a small heterogeneous comparator is inconclusive, not evidence of no difference). |
| **21** | Discuss the generalisability (external validity) of the study results | **Addressed in advance** | §11.4 mandates explicit non-transferability statements: Jazan frequencies are not "Saudi" frequencies; Gulf frequencies are not transferable from Thai, Brazilian or US data; §9.5 requires ancestry stratification because three distinct variant repertoires co-occur. §17 R15 — if the study reduces to one centre it must be **reported as single-centre**, not re-labelled. |
| **22** | Give the source of funding and the role of the funders | **`[UNVERIFIED]` — At reporting** | §14.6. Any relationship with the Tier-1 platform manufacturer is a material conflict in a single-platform study and must be declared even if no support was received. Register item U15. |

---

## Part B — STARD methods items additionally satisfied (D027)

**`[UNVERIFIED]` — STARD item numbers below are reproduced from working knowledge and have not been checked against the published checklist (EQUATOR blocked, D030). Numbering must be reconciled by a human before submission; the substance, not the numbering, is what D027 requires.**

| STARD item (substance) | Status | Where satisfied |
|---|---|---|
| Study objectives and hypotheses stated | **Addressed** | §2.1–§2.3 |
| Eligibility criteria for participants | **Addressed** | §5.1–§5.2 |
| Basis on which potentially eligible participants were identified | **Addressed** | §6.2 — all donors presenting at a participating centre during the enrolment window |
| Where and when participants were identified | **Partially — `[UNVERIFIED]`** | §6.1; centre list and windows pending (U4) |
| Whether sampling was consecutive, random or convenience | **Addressed** | §6.2 **consecutive**; §6.3 declares the supplementary enrichment stratum separately |
| **Index test described in sufficient detail to permit replication** | **Addressed** | §7.3 — serology, including clone identity, manufacturer, lot, Ig class, method and phase definitions |
| **Reference standard described in sufficient detail to permit replication** | **Addressed** | §7.1 tiered architecture; §8.6 locked genotype→phenotype mapping table filed as a version-controlled annex; **`[UNVERIFIED]`** platform identity and panel annex pending (U7) |
| **Rationale for choosing the reference standard** | **Addressed — this is the decisive item** | §3.2: **genotype = reference, serology = index**, with three stated reasons, and an explicit declaration that **neither test is a gold standard**; consequently agreement (kappa) is primary and accuracy parameters are secondary directional descriptors carrying an imperfect-reference caveat (Flag F1) |
| **Index test cut-offs / result categories defined in advance** | **Addressed in principle — `[UNVERIFIED]` numerically** | §7.3(2) phase definitions for D-positive / weak D / serologic D-negative; §7.3(5) pre-specified reaction-grade cut-off for C, c, E, e, with the value pending (U9) |
| **Reference standard cut-offs / result categories defined in advance** | **Addressed** | §8.6 locked mapping table; §8.3 class D5 for unresolved calls; multi-designation alleles reported as **allele groups**, never collapsed to a designation the assay did not resolve |
| **Whether clinical information and other test results were available to those performing / interpreting the index test** | **Addressed** | §7.3 and §9.2 — serology performed and interpreted **blind to genotype**, with a per-test blinding attestation variable (`sero_operator_blinded`) |
| **Whether clinical information and index test results were available to those assessing the reference standard** | **Addressed** | §7.1 and §9.3 — genotyping performed **blind to serology**, with `mol_operator_blinded` recorded per run |
| **Methods for estimating and comparing measures of agreement/accuracy** | **Addressed; detail to the SAP** | §8.2, §12.2 — 2×2 counts, percent agreement with 95% CI, Cohen's kappa with 95% CI, plus a mandatory prevalence-adjusted companion statistic (Flag F2) |
| **How indeterminate index or reference standard results were handled** | **Addressed** | §8.5 — D5 counted non-concordant in the primary analysis, with SA1–SA3 bracketing; D6 excluded from the denominator and reported separately with n and reason |
| **How missing data were handled** | **Addressed** | §8.5, §12.4 — no imputation for the primary outcome |
| **Analyses of variability (e.g. by subgroup, centre, reader)** | **Addressed** | §12.5 closed subgroup list; §8.4 step 4 reports **inter-adjudicator agreement** (raw agreement and kappa on the class assignment) |
| **Intended sample size and how it was determined** | **Deferred — `[UNVERIFIED]`** | §6.4; `biostatistics-expert` deliverable (U13) |
| **Discrepant-result / adjudication procedure** | **Addressed — specified in full in advance** | §8.4: automated flagging by the data manager against a version-controlled script; mandatory repeat of **both** arms by blinded operators; Tier-3 escalation on a closed trigger list; two independent adjudicators with a third for ties; donor identity, **centre identity**, stratum, the other adjudicator's decision and **all aggregate concordance statistics masked**; persistent non-resolution classed D5 and never reassigned to C; classes locked on entry with any later change requiring a written deviation entry stating whether results were known |
| **Time interval and any clinical interventions between index test and reference standard** | **Addressed in principle — `[UNVERIFIED]` numerically** | §8.1 — both measurements are made on aliquots of the **same specimen** from the same donation; maximum permissible interval to be fixed in the SOP annex and recorded per sample (U9). No intervention occurs between tests. |
| **Cross-tabulation of index test results by reference standard results** | **At reporting** | §8.2 mandates the full 2×2 cell counts per antigen |
| **Estimates of accuracy/agreement with precision** | **At reporting** | §8.2, §12.2 — every estimate with 95% CI and denominator |
| **Adverse events from performing the index test or reference standard** | **N/A with reason** | Both tests are performed on an already-drawn research aliquot; no additional procedure is performed on the donor beyond the single 2 mL EDTA sample taken at donation (§5.1 I6). Sample-collection-related events, if any, are recorded under the site's routine donor-adverse-event process. |
| **Registration number and name of registry** | **`[UNVERIFIED]`** | §15 — prospective OSF Registries registration before first sample collection (D026); **ID not yet obtained** (U3). PROSPERO not applicable. |
| **Where the full study protocol can be accessed** | **Addressed in principle** | §15 requires the registration to record the primary outcome, adjudication procedure, pre-specified subgroups and sensitivity analyses **as defined here**, not a vaguer summary; the protocol version and date are to be cited in the manuscript |
| **Sources of funding and role of funders** | **`[UNVERIFIED]`** | §14.6 (U15) |

---

## Part C — JBI prevalence-appraisal domains mapped (frequency component)

Used prospectively as a design specification for objectives S1–S5 (protocol §11.2). Not a "score"; a checklist of design exposures.

| JBI domain (substance) | Design response |
|---|---|
| Appropriate sample frame for the target population | §6.2 — all donors presenting at a participating centre; the target population is GCC blood donors, not the general population, and this limit is stated (§11.4 generalisability) |
| Appropriate recruitment of study participants | §6.2 consecutive enrolment; §5.2 prohibits selection on phenotype, ancestry or D status; §17 R9 enrolment audit |
| Adequate sample size | §6.4 — deferred to `biostatistics-expert` (U13); precision-based framing mandated |
| Study subjects and setting described in detail | §6.1, §9.1 |
| Data analysis conducted with sufficient coverage of the identified sample | §13.2 flow diagram; §8.5 D6 reported separately rather than silently dropped |
| Valid methods used for identification of the condition | §7 tiered platform architecture; §8.6 locked mapping; §7.4 escalation triggers for unresolved calls |
| Condition measured in a standard, reliable way for all participants | §7.1 single Tier-1 platform mandatory or centralised genotyping; §7.3 harmonised serology SOP; §17 R3, R6 |
| Appropriate statistical analysis | §12; SAP at Gate G4 |
| Adequate response rate, or non-response addressed | §13.2 flow diagram records donors approached vs consented; **`[UNVERIFIED]`** — consent-decline data capture must be specified in the data-management plan (U14) |

---

## Part D — Items deliberately not claimed

| Instrument | Why not used |
|---|---|
| **GRADE / GRADE-CERQual** | Rates certainty in a **body of evidence**, typically within a systematic review. Applying it to a single primary study's own results would misuse the instrument. Protocol §11.4 states what carries the certainty burden instead. |
| **RoB 2** | For randomised trials. No randomisation (§4.3). |
| **ROBINS-I** | For non-randomised studies of **interventions**. No intervention and no causal effect estimand (§2.3). |
| **Newcastle–Ottawa Scale** | For appraising cohort and case–control studies within a synthesis. Neither design is used (§4.3). |
| **AMSTAR-2** | For appraising systematic reviews. This is a primary study. |
| **PRISMA 2020 / PRISMA-ScR / PRISMA-S / MOOSE** | Synthesis reporting standards. Not applicable to primary data collection (§4.3). |
| **TRIPOD+AI** | Governs clinical prediction models producing individual-level risk estimates. Objective S9 is an inventory/match-probability **simulation**, reported as exploratory with full parameter provenance (§12.6, Flag F7). |
| **CONSORT / TREND / CARE / COREQ / SRQR / ARRIVE** | Trials, quasi-experiments, case reports, qualitative research and animal research respectively. None applies. |

---

**END OF CHECKLIST v0.1 — completed to protocol stage; "At reporting" items to be completed against the frozen protocol at manuscript preparation.**
