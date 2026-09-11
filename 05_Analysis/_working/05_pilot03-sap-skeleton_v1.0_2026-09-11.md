# PILOT-03 — Statistical Analysis Plan (SKELETON)

**File:** `05_pilot03-sap-skeleton_v1.0_2026-09-11.md`
**Version:** 1.0 — **DRAFT, NOT APPROVED**
**Prepared by:** biostatistics-expert (agent) for Dr. Fehaid M. Alanazi
**Date:** 2026-09-11

> **GATE STATUS — READ BEFORE ANYTHING ELSE.** This SAP is **unapproved**. `CLAUDE.md` §6 and Gate **G4** require it to be **written, dated and approved before any inferential analysis is run**. No PILOT-03 data exist and none has been examined. Nothing in this document was chosen by looking at a result. Sections marked **[TO BE COMPLETED AT G1/G4]** depend on protocol decisions not yet made and must be filled *before* approval, not after data arrive.

**Companion documents**
| | |
|---|---|
| Sample-size justification | `05_pilot03-sample-size-justification_v1.0_2026-09-11.md` |
| Sizing script / unedited output | `05_pilot03-sample-size_v1.0_2026-09-11.py` / `...-output_v1.0_2026-09-11.txt` |
| SPSS syntax (**not executed — SPSS is not installed**) | `05_pilot03-sample-size-and-analysis_v1.0_2026-09-11.sps` |
| Number registry | `05_Analysis/_working/NUMBER_REGISTRY.csv` |

**Fixed by Director decision — not re-opened here**
- **D025** — unit of analysis for concordance = **antigen–donor pair**, 7-class discordance taxonomy (C, D1–D7); hr^S^/hr^B^/V/VS **excluded from the primary outcome**.
- **D027** — agreement metric = **kappa with 95% CI plus percent agreement**; never bare percent agreement. STROBE primary, STARD methods items satisfied for the concordance component.
- **D003** — analysis executed in Python; annotated SPSS syntax delivered in parallel; default divergences disclosed.
- **D029** — no "first in region" claim.

---

## 1. Study design and estimands

Multi-centre **cross-sectional laboratory study** genotyping *RHD* and *RHCE* in GCC blood donors. Reporting standard: **STROBE (cross-sectional)**, with STARD methods items additionally satisfied for the concordance component (D027).

**Estimands, stated explicitly so that no analysis can drift between them:**

| # | Estimand | Population | Unit | Summary measure |
|---|---|---|---|---|
| E1 | Frequency of each pre-specified *RHCE* variant allele | GCC donors at participating centres | allele (2 per donor) | proportion, 95% CI |
| E2 | Frequency of each pre-specified *RHD* variant allele / genotype | as above | donor | proportion, 95% CI |
| E3 | Serology–genotype agreement, per antigen (D, C, E, c, e) | donors with **both** a valid serologic and a valid genotype call | antigen–donor pair | κ + 95% CI, percent agreement, PPA/NPA |
| E4 | Distribution of the 7-class discordance taxonomy | as E3 | antigen–donor pair | counts and proportions with CIs |
| E5 | P(DEL \| serologic D-negative) — **conditional; see §11** | serologic D-negative donors tested | donor | proportion, exact CI |

**E1/E2 are inventory-descriptive quantities** ("what is in the donor pool at these centres"), **not** population-genetic parameters for the GCC. The distinction is stated in the Methods and enforced in the Discussion: the donor pool is a self-selected, largely male, health-screened, ancestry-stratified sample. `[INFERENCE]`

**[TO BE COMPLETED AT G1]** Final centre list; sampling frame at each centre (consecutive vs random vs convenience); recruitment window.

---

## 2. Analysis populations

Defined before data, applied mechanically.

| Population | Definition | Used for |
|---|---|---|
| **ENROLLED** | Every donor from whom a sample was drawn under the protocol | CONSORT-style flow diagram, accountability |
| **GENOTYPED (GT)** | Enrolled donors with a valid Tier-1 genotype result (all assay controls passed) | E1, E2 |
| **PAIRED (PA)** | GT donors who **also** have a valid serologic result for the antigen in question | E3, E4 — **defined per antigen; the denominator differs per antigen and is reported per antigen** |
| **D-NEGATIVE (DN)** | Donors serologically D-negative by the protocol-defined method and phase | E5, zygosity, *RHD*Ψ/DEL discrimination |
| **ADJUDICATED (AD)** | Discordant pairs that completed the blinded adjudication pathway | discordance reclassification, sensitivity analyses |

**Per-antigen denominators are mandatory**, following the precedent in the source literature where they differed (121 for D, 120 for e, 112 for FY in Al-Riyami 2021). No single "n analysed" is quoted for the concordance outcome. **Every percentage in every table carries its numerator and denominator** (`CLAUDE.md` §6).

A **flow diagram** accounts for every enrolled donor: sample drawn → DNA extracted → Tier-1 result → serology available → paired. Losses are reported at each step **with reasons**.

---

## 3. Descriptive conventions

- Categorical: **n (%)** with the denominator stated; 95% CI on proportions of interest (Wilson; Clopper–Pearson when count ≤ 5 or ≥ n−5).
- Continuous (age, DNA concentration, A260/A280): **median [IQR]** and **mean (SD)** both reported, with n. Normality judged by **Q–Q plot, skewness and kurtosis in the light of n** — **not** by Shapiro–Wilk, which is over-powered at n = 3,000 and will reject trivial departures.
- Percentages to **one decimal**; frequencies below 1% to **two decimals**. Allele frequencies never rounded to fewer digits than the CI they carry.
- p-values, where any appear: **exact, to three decimals** (`p = 0.032`); `p < 0.001` only below that. **Never** `p = NS`, never a bare `p < 0.05`.
- Alleles reported in **current ISBT notation** with the table version and access date recorded (D028). Multi-designation calls are reported as an **allele group**, never collapsed to a designation the assay did not resolve.
- **"Serologic D-negative" and "molecularly *RHD*-negative" are distinct terms** and are never used interchangeably.
- Antigen frequencies derived from the platform are labelled **"predicted"** in every table title, axis label and legend where they are not serologically confirmed.

**Descriptive exploration for data-quality purposes** (call rates, control failures, DNA quality, centre-level completeness, duplicate detection) is permitted before G4 approval and is **labelled as data quality** in the output. It produces no estimate of E1–E5 and no test.

---

## 4. Variant frequency estimation (E1, E2)

- **Allele frequencies** reported with the **allele denominator** (2 × donors), **donor-level genotype frequencies** with the **donor denominator**. The two are **never pooled** (scoping §6.4 item 3).
- **Interval method**, pre-specified by mechanical count rule: **Wilson** primary; **Clopper–Pearson** additionally when count ≤ 5 or ≥ n−5; **exact one-sided upper bound 1 − 0.025^(1/n)** for zero cells, reported as "0/n (0%; 95% CI 0% to U%)" and never as "absent". **Wald is not used anywhere.**
- **Clustering is honoured in the reported CI.** The primary CI for every frequency is a **cluster bootstrap** (10,000 resamples; resample **centres**, then **donors within centre**; BCa interval; seed 20260911). The closed-form Wilson/CP interval is reported alongside as the unclustered comparator, explicitly labelled as such, so the reader can see the inflation. Treating 2n alleles from n donors as 2n independent observations is a known and serious error and is not done.
- **Centre heterogeneity** is reported for every primary allele: centre-specific frequencies, the random-effects pooled estimate, and a **prediction interval** for a new centre. A pooled estimate across heterogeneous centres is reported *with* that interval or not at all.
- Any allele meeting the **pre-declared uninformative criteria** (expected count < 5, **or** CI upper limit > 3 × lower limit) is reported as **case ascertainment** with the label *"not estimable to useful precision at this sample size."*

### 4.1 Hardy–Weinberg equilibrium — where it applies and where it does not

- **Applied to:** biallelic loci where **both** alleles are directly determined — principally *RHCE* genotypes from the Tier-1 platform, and *RHD* presence/absence **only where hybrid-Rhesus-box zygosity has been assayed (Tier 2)**. Without zygosity, *RHD* homozygous and heterozygous deletion cannot be distinguished and **no HWE test on *RHD* is possible**; this is stated rather than fudged.
- **Method:** **exact test** (conditional/Levene–Haldane distribution) for biallelic loci; permutation/MCMC exact test for multi-allelic *RHCE*. Not the asymptotic χ², which is unreliable with rare alleles. Neither SPSS nor `statsmodels` ships this; both implementations are bespoke and are **cross-checked against each other before any HWE result is reported**. If they disagree, neither is reported.
- **Interpretation, pre-specified:** HWE is tested **within ancestry stratum**, as an **assay quality-control signal only**. A pooled multi-ancestry donor sample is expected to show heterozygote deficiency through the **Wahlund effect**; a positive Wright's *F* in the pooled sample is population structure, **not** evidence of genotyping error, and will not be reported as such. HWE is **never** used to support a population-genetic claim about GCC populations, because the donor pool is not a random mating population.
- Exact p to three decimals, with the observed and expected genotype counts printed.

---

## 5. Concordance analysis (E3, E4)

### 5.1 Unit, denominator, taxonomy
Unit = **antigen–donor pair** (D025). Primary antigens: **D (RH1), C (RH2), E (RH3), c (RH4), e (RH5)**. **hr^S^ (RH19), hr^B^ (RH31), V (RH10) and VS (RH20) are excluded from the primary outcome** (D025) because the only regional figures for them are platform-*predicted* and reference serology is not confirmed obtainable; if reference serology is obtained for a defined subset, they enter as a **pre-specified secondary** outcome with the subset denominator stated, never as primary.

Taxonomy, exactly as fixed in D025:

| Class | Meaning | Handling — **fixed in advance** |
|---|---|---|
| C | Concordant | numerator of percent agreement |
| D1 | Serology +, genotype − | discordant; adjudicated |
| D2 | Serology −, genotype + | discordant; **highest clinical priority**; adjudicated |
| D3 | Quantitative (strength) discordance | discordant; requires the recorded reaction grade and anti-D clone |
| D4 | Qualitative / partial discordance | discordant |
| D5 | **Unresolved genotype** (platform bucket, e.g. "other than weak D 1/2/3") | **NEVER counted as concordant**; §6 below |
| D6 | Assay / technical failure | **excluded from the concordance denominator; reported separately with its n** |
| D7 | Platform-vs-platform discordance | **not** serology–genotype discordance; **separate table entirely** |

The "% concordance" headline must not bury D2, D4 or D5. D2/D4/D5 counts appear in the **abstract**, not only in a supplement (`CLAUDE.md` §1.4).

### 5.2 Agreement statistics (D027)
Per antigen, from the 2×2 table:
1. **Cohen's κ with 95% CI** — variance under the **alternative** (Fleiss–Cohen–Everitt), implementation verified against `statsmodels` to 6 dp. **Reported CI is a cluster bootstrap over centres**, because the Wald-type κ interval has poor coverage as κ → 1.
2. **Percent agreement with 95% CI** — with a donor-clustered variance when computed across antigen–donor pairs (pairs are nested within donor; ignoring this falsely narrows the interval).
3. **PPA and NPA with exact (Clopper–Pearson) CIs**, and the **full 2×2 counts printed in the table**, not only the summary statistics.
4. **PABAK**, always accompanied by the caveat that it is a monotone relabelling of observed agreement (2p_o − 1), adds nothing beyond p_o, and describes a hypothetical balanced-marginal population this study does not sample.
5. **Weighted κ is not used** — all primary antigen calls are binary. Where a graded call is analysed (reaction strength), **linearly weighted κ** is used and **the weighting is stated in the table**.

**Pre-specified prevalence rule.** For any antigen whose **observed** marginal prevalence falls outside **10%–90%**, κ is reported but is **not the lead statistic**; PPA, NPA and the raw counts lead. The rule is mechanical and declared before data are seen, so it cannot be used to select a favourable statistic after the fact. For antigen e the Jazan predicted prevalence (98.84%) makes this near-certain in advance, and the SAP says so now rather than discovering it later.

**Reference standard.** STARD requires index and reference to be named. Pre-specified per antigen — and the asymmetry is stated, not averaged away:
- For **D, C, E, c, e** in routine donors: **[TO BE COMPLETED AT G1]** — the protocol must state which assay is reference for each antigen and why, accepting that neither is a perfect gold standard.
- For **DEL**: serology is **wrong by design** (DEL is detectable serologically only by adsorption–elution). Genotype is the reference. This is recorded explicitly and DEL discordance is **not** pooled into the overall percent agreement.

### 5.3 Adjudication
Every discordance is adjudicated by a **blinded second method** before classification, following a **pre-specified algorithm** with a named adjudicator (D027 item 3). **Adjudicating discordances after seeing which are inconvenient is the single most likely integrity criticism of this design.** The algorithm, the blinding, the adjudicator and the escalation tiers must be fixed in the protocol at G1. Reclassification after adjudication is reported as a **transition table** (pre-adjudication class → post-adjudication class), so the effect of adjudication is visible rather than absorbed.

---

## 6. Indeterminate and unresolved calls

| Situation | Pre-specified handling |
|---|---|
| **D5 — platform returns a non-specific bucket** (e.g. "other than weak D types 1/2/3", or an allele group that may be *RHCE\*01.20.01* **or** *01.20.02*) | Reported as its **own class with its own n and CI**. **Never** counted as concordant, never redistributed to the commonest allele, never silently merged. Escalated to Tier 3/4 where the protocol budgets it. Frequency tables report the resolved alleles **and** the size of the unresolved bucket **on the same line of sight**, so the reader sees how much of the distribution is unassigned. |
| **D6 — assay/technical failure, no call, failed control, insufficient DNA** | Excluded from the concordance denominator; reported separately with n and reason. Call-rate by centre and by platform lot is reported as a quality outcome. |
| **Serologic indeterminate** (e.g. weak/equivocal reaction below the pre-specified grade cut-off) | Coded as a distinct value, not as negative. The **reaction-grade cut-off defining positive/weak/negative is fixed in the protocol at G1**, with the phase (immediate-spin vs IAT) stated. Dosage effects in heterozygotes are anticipated: weak reactivity is **not** auto-classified as discordance. |
| **Novel / unclassifiable allele** | Reported as novel with the sequence evidence; excluded from frequency denominators for named alleles but included in the "any variant" denominator, with both denominators printed. |

---

## 7. Missing data

**Mechanism reasoning first, percentage second.** A percentage alone says nothing about whether an analysis is biased.

| Source of missingness | Likely mechanism | Reasoning | Handling |
|---|---|---|---|
| Assay failure (DNA quality, control failure) | Plausibly **MCAR**, but **must be tested against centre, lot and sample age** — a centre with a failing extraction protocol makes it **MAR**, and a variant allele whose primer site is disrupted makes it **MNAR** (the failure is *caused by* the genotype) | MNAR here is not hypothetical: assay dropout at a disrupted primer site is a recognised failure mode for RH | Complete-case primary; call-rate reported by centre and lot; **any allele-correlated failure pattern is reported as a limitation, not imputed** |
| Serology unavailable for a genotyped donor | **MAR** conditional on centre and on donor type | Depends on site workflow | Per-antigen denominators; complete-case |
| Donor covariates (age, sex, nationality) | **MAR** conditional on centre | Administrative | Reported with n; not imputed for descriptive tables |

**Pre-specified rules:**
- **Primary analyses are complete-case**, with the **n analysed reported for every single result**, including the loss from missingness.
- **Genotype and antigen calls are never imputed.** Imputing a laboratory result would fabricate data (`CLAUDE.md` §1.1).
- **Multiple imputation** is used only for **covariates** in secondary regression models, if and only if missingness exceeds 5% and a plausible MAR conditioning set exists; m = 20, Rubin's rules, with the imputation model stated. A **complete-case sensitivity analysis is always reported alongside** (mandatory, not conditional on agreement).
- **Differential missingness by centre or by ancestry stratum is itself reported as a result**, because it bears directly on generalisability.

---

## 8. Outliers and data quality

Outliers are **investigated, never deleted for being inconvenient** (`CLAUDE.md` §1.6). Pre-specified rules:
- Any donor with an internally inconsistent result (e.g. zygosity contradicting the exon scan) is **flagged, investigated, and retained** unless a documented laboratory error is identified; the **rule for exclusion is documented before data are seen**, and every exclusion is listed individually in a deviation log with its reason.
- A centre whose allele frequencies differ markedly from the rest is **not excluded**. Between-centre heterogeneity is a **finding** in an ancestry-stratified region, not contamination. It is reported and, where possible, explained by ancestry composition.
- Duplicate-donor detection (repeat donation within the window) is run before analysis; duplicates are collapsed to one record with a documented rule, since retaining both would breach the independence the CI assumes.

---

## 9. Clustering, stratification and model specification

- **Centre** is the primary design cluster. Every reported CI accounts for it: cluster bootstrap (primary) or GEE with **Mancl–DeRouen bias-reduced covariance and a t(K−1) reference distribution** (secondary). The uncorrected Liang–Zeger sandwich is **anti-conservative** with ~12 centres and is not reported as primary.
- **ICC is estimated and published** for every primary allele and antigen, from a random-intercept logistic model with centre as the random effect. **Both** the latent-scale and the proportion-scale ICC are reported, **each named by its scale**. Their own intervals will be wide with few centres; they are reported, not suppressed. Estimation uses adaptive Gauss–Hermite quadrature; the pseudo-likelihood value (what SPSS GENLINMIXED gives by default) is reported beside it, because pseudo-likelihood biases the variance component — and therefore the ICC — **downward**, which makes the design look better than it is.
- **Ancestry stratum** is a cross-classified factor, not a nested one. **Stratum-specific estimates are reported for every primary outcome**, alongside any pooled estimate.
- Model diagnostics reported for every model fitted: convergence status, residual and influence diagnostics (Cook's distance, DFBETA at the centre level), and for any predictive model both **calibration** (calibration slope and plot) and **discrimination** (c-statistic with CI).
- **Events per variable ≥ 10** is required for any regression on a binary outcome; if a model cannot meet it, the model is not fitted and the reason is stated. Variable selection is **clinical/DAG-driven**, pre-specified. **Stepwise selection on p-values is not used** (`CLAUDE.md` §6). **[TO BE COMPLETED AT G4]** — the DAG and the covariate set for any adjusted model.

---

## 10. Pre-specified subgroups — **all exploratory**

| Subgroup | Levels | Rationale |
|---|---|---|
| **Nationality group** | Saudi / non-Saudi (and, where n permits, national-origin blocs) | The strongest a-priori source of allele-frequency heterogeneity |
| **Centre** | each participating centre | Design cluster; also assay-quality signal |
| **Sex** | male / female | Donor-pool composition; no RH-biological hypothesis |
| **Age band** | **[TO BE COMPLETED AT G1]** — bands fixed before data | Cohort/administrative description |

> **EXPLICIT STATEMENT, REQUIRED VERBATIM IN THE MANUSCRIPT: all subgroup analyses in PILOT-03 are EXPLORATORY, hypothesis-generating, and are reported with unadjusted 95% confidence intervals. They are not powered, they are not adjusted for multiplicity, and no subgroup finding may be presented as a primary result.** Unless the approved protocol designates a specific subgroup contrast as confirmatory — it currently does not — this stands.

Subgroup results are presented as **estimates with CIs**, not as a list of p-values, and **all** pre-specified subgroups are reported whatever they show (`CLAUDE.md` §1.4). Only the four listed above may be reported; any further subgroup is **post-hoc** and is labelled post-hoc in the protocol deviation log.

**The Saudi-vs-non-Saudi contrast carries a specific warning.** Madkhali 2025 found no significant difference (p = 0.5066 allele, p = 0.8627 genotype) **but also found zero rare/hybrid alleles in 110 non-Saudi donors**. That is a **null test on a small, heterogeneous comparator**, and it is **inconclusive, not evidence of no difference** (scoping §6.4 item 4). PILOT-03 must not repeat that interpretation. Any non-significant contrast is interpreted **through the width of its CI and what the CI excludes** — never as "no effect".

---

## 11. Sensitivity analyses — all pre-specified

1. **Complete-case vs imputed** for any model using imputation (mandatory whenever imputation is used).
2. **Clustered vs unclustered CI** for every primary frequency — reported side by side, so the design effect is visible rather than asserted.
3. **Wilson vs Clopper–Pearson** for every primary frequency.
4. **Pre- vs post-adjudication** classification of every discordance (transition table).
5. **D5 handling:** primary analysis keeps D5 as its own class. Two bounding analyses are reported: D5 counted as **concordant** (best case) and as **discordant** (worst case). This gives an honest range rather than a single number resting on a convention.
6. **Centre leave-one-out** for every primary frequency and every κ — with ~12 centres, one centre can move a pooled estimate materially.
7. **Ancestry-stratified vs pooled** estimates.
8. **DEL estimand:** if the D-negative stratum is enriched (see below), the enriched conditional estimate **P(DEL | serologic D-negative)** is primary, and any pool-level projection is reported **only** as an explicitly labelled projection with π_D− stated as an input, never as a measured frequency.
9. **Platform-lot and software-version** effects on call rate and on the D5 bucket size.

**Note on the DEL estimand (carried from the sample-size work).** A donor-pool DEL frequency is not achievable at feasible n. If the protocol adopts enriched testing of serologic D-negative (optionally C-positive) donors, the estimand changes and **must** be declared as conditional in every table legend; C+ enrichment additionally introduces **spectrum bias** against C-negative DEL alleles, which is stated, not buried.

---

## 12. Multiplicity

- **Primary outcomes are estimation, not testing.** No α is spent on them and no adjustment is applied to an interval whose purpose is to describe precision. **But** the SAP states explicitly that with ~15–25 alleles and 5 antigens the **simultaneous** coverage of the reported family of 95% intervals is well below 95%, and every CI is therefore labelled **marginal (pointwise)**.
- **Family definition, declared now:** Family 1 = the pre-specified primary allele frequencies; Family 2 = the five per-antigen κ statistics; Family 3 = the 7-class taxonomy proportions; Family 4 = all subgroup contrasts.
- **Families 1–3:** no formal multiplicity control; intervals reported as pointwise; a **Bonferroni-adjusted simultaneous interval** is reported in the supplement for Family 1 so a reader who wants simultaneous coverage has it.
- **Family 4 (subgroups): explicitly exploratory and unadjusted**, as stated in §10. This is a declaration, not an omission.
- **No hypothesis test is performed unless it is listed in this SAP before approval.** Running tests until one is significant, or adding a test after seeing a pattern, is p-hacking and will be refused and escalated to the Director.

---

## 13. Software, reproducibility and traceability

- **Primary analysis: Python 3.11.15** (numpy 2.4.6, scipy 1.17.1, pandas 3.0.5, statsmodels 0.15.0). Fully scripted; no manual steps; seed 20260911.
- **SPSS syntax is delivered for independent verification by Dr. Alanazi. SPSS is NOT installed in the environment where this was prepared, and no SPSS output exists or is claimed to exist** (D003, `CLAUDE.md` §1.9).
- **Known Python/SPSS default divergences are documented in Part 3 of the `.sps` file** and are summarised in the manuscript Methods where they affect a reported number. The most consequential: SPSS GENLIN applies **no small-sample correction** to the GEE sandwich; the reported result is the **Mancl–DeRouen-corrected Python** one with a t(K−1) reference distribution, with the uncorrected SPSS figure given alongside as a stated sensitivity. Also: SPSS returns **no kappa at all** for a non-square table rather than an error — a silent failure mode that is explicitly trapped.
- **Every number destined for the manuscript is logged in `05_Analysis/_working/NUMBER_REGISTRY.csv`** with manuscript location, value as reported, source output file, table/line reference, script and line, date generated, and dataset version. A number without a registry entry is **unsourced** and blocks the audit gate.
- Saved for the audit trail: analysis script, **unedited** output, session/version information, SPSS syntax, and the **SHA-256 hash of the analysis dataset**.

---

## 14. Open items blocking G4 approval

| # | Item | Owner |
|---|---|---|
| 1 | Reference standard per antigen (STARD) — which assay is index, which reference, and why | `methodology-protocol-expert` → Dr. Alanazi |
| 2 | Serologic reaction-grade cut-off and testing phase defining +/weak/− | Protocol, G1 |
| 3 | Discordance adjudication algorithm, blinding, named adjudicator | Protocol, G1 (D027 item 3) |
| 4 | Final centre list and donors per centre; whether ≥ 8 centres is achievable | Dr. Alanazi |
| 5 | π_D− (serologic D-negative prevalence) per centre — **required input, currently absent** | Site survey |
| 6 | Whether the D-negative stratum is enriched (changes the DEL estimand) | Protocol, G1 |
| 7 | Age-band definitions | Protocol, G1 |
| 8 | Whether hr^S^/hr^B^ reference serology is obtainable (affects a secondary outcome only) | Dr. Alanazi (scoping §8 item 12) |
| 9 | ISBT RH allele table version — still `[UNVERIFIED]`, ISBT pages blocked (D028, D030) | Human confirmation |
| 10 | Internal-pilot ICC estimation and n-revision rule, if adopted | Dr. Alanazi |
| 11 | Whether any subgroup contrast is designated **confirmatory** (currently none) | Dr. Alanazi |
| 12 | DAG and covariate set for any adjusted model | `methodology-protocol-expert` + biostatistics |

---

**Approval block — to be completed by the Principal Investigator**

```
Statistical Analysis Plan v_____   approved / not approved
Signed: ________________________   Dr. Fehaid M. Alanazi
Date:   ________________________
Gate G4 status: ________________
```

*No inferential analysis of PILOT-03 data may begin until this block is signed and dated.*
