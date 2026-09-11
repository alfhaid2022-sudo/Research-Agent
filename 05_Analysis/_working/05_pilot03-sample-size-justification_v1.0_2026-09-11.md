# PILOT-03 — Sample-size justification (precision-based)

**File:** `05_pilot03-sample-size-justification_v1.0_2026-09-11.md`
**Prepared by:** biostatistics-expert (agent) for Dr. Fehaid M. Alanazi
**Date:** 2026-09-11
**Status:** PRE-SPECIFICATION DRAFT — **not approved**. Blocks on **Gate G4**.
**Binding constraints honoured:** D025 (unit of analysis = antigen–donor pair; 7-class discordance taxonomy; hr^S^/hr^B^/V/VS excluded from the primary outcome), D027 (kappa with 95% CI **plus** percent agreement), D003 (Python executed, SPSS syntax delivered and **not** claimed as run), D031.

**Computational provenance**
| Item | Value |
|---|---|
| Script | `05_Analysis/_working/05_pilot03-sample-size_v1.0_2026-09-11.py` |
| Unedited output | `05_Analysis/_working/05_pilot03-sample-size-output_v1.0_2026-09-11.txt` |
| SPSS syntax (**not executed — SPSS absent**) | `05_Analysis/_working/05_pilot03-sample-size-and-analysis_v1.0_2026-09-11.sps` |
| Input document | `01_Protocol/_working/01_pilot03-methods-scoping_v1.0_2026-09-11.md` |
| SHA-256 of input document | `1c8fb28d09aad05919b9368b54d1068762e1a3f5d039020af45f4efabe8c3599` |
| Analysis dataset | **None exists.** No PILOT-03 data have been collected. |
| Environment | Python 3.11.15; numpy 2.4.6; scipy 1.17.1; pandas 3.0.5; statsmodels 0.15.0 |

---

## 1. Why precision, not power

PILOT-03 has two primary output classes — **variant allele frequency estimation** and **serology–genotype concordance**. Neither is a comparison against a pre-specified alternative hypothesis. A power calculation would require an effect size the design does not contain, and manufacturing one to produce a round number would be a fiction dressed as a justification. The size is therefore driven by the **width of the confidence interval the study will be able to report**. `[INFERENCE]` The scoping file reached the same conclusion independently (§6.4 item 1).

Consequence for the manuscript: the Methods state a **target CI half-width**, not a target power. There is no α-spending, and no result in this study will be described as "significant" or "non-significant" in the primary analysis, because the primary analysis is estimation.

**Interval method.** Wald intervals are not used anywhere. Every frequency of interest here lies within a few percentage points of zero, where the Wald interval has actual coverage far below nominal and can extend below zero (`CLAUDE.md` §6). Pre-specified, by a mechanical rule declared before any data are seen:

- **Wilson score interval (uncorrected)** — primary for all proportions;
- **Clopper–Pearson exact interval** — additionally reported for any cell with observed count ≤ 5 or ≥ *n* − 5;
- **Exact one-sided upper bound 1 − 0.025^(1/n)** — for any zero cell (the exact analogue of the rule of three).

The rule is count-based, not result-based, so it cannot be used to select whichever interval is more flattering after the fact.

---

## 2. The inputs, and how fragile they are

`[EVIDENCE]` for the point estimates; `[UNCERTAIN]` for their transferability. **Gulf-derived and non-Gulf inputs are kept strictly segregated and are never mixed inside one scenario** (scoping file §6 instruction).

### 2.1 Gulf-derived inputs — highest relevance, weakest precision

All are from **Madkhali 2025 (Jazan, single centre, single region)**, DOI 10.1111/tme.70040, unless stated. Allele-level denominator = 708 alleles from 354 Saudi donors.

| Allele | x / n | p̂ | **95% CI of the input itself (Clopper–Pearson)** |
|---|---|---|---|
| *RHCE\*ce(733G)* | 67/708 | 9.46% | 7.41% to 11.86% |
| *RHCE\*ce(733G,1006T)* | 6/708 | 0.85% | 0.31% to 1.84% |
| *RHCE\*ceAR* | 5/708 | 0.71% | 0.23% to 1.64% |
| *RHCE\*ce(712G)* | 3/708 | 0.42% | 0.09% to 1.23% |
| *RHD\*r's-RHCE\*ce(733G,1006T)* | 2/708 | 0.28% | 0.03% to 1.02% |
| C^w^ (RH8) | 0/354 donors | 0% | 0% to **1.037%** (exact upper bound) |

**This is the fragility, stated plainly.** Four of these six rest on **2, 3, 5 and 6 observations**. Their own 95% intervals span roughly an order of magnitude — *RHD\*r's* is consistent with anything from 0.03% to 1.02%, a **34-fold** range. A sample size computed from a point estimate derived from two alleles inherits that uncertainty in full. Section 1 of the output therefore recomputes every requirement at **both ends of each input's own CI**; for *RHCE\*ceAR* at a ±0.25 pp target the required n moves from **871 to 4,985 donors** depending only on where within its own interval the truth lies. `[UNCERTAIN]`

They are also **Jazan-specific**. Jazan has atypically high African-ancestry admixture for Saudi Arabia, and these frequencies must not be presented as Saudi or GCC values (scoping file §2.1, §6.4 item 5). They are used here as *planning brackets*, not as expected results.

Further Gulf inputs used only for the D-negative stratum: *RHD* deletion 46/60, unresolved "other than weak D 1/2/3" 11/60, *RHD\*DIIIa-CE(3-7)-D* 2/60, weak D type 1 1/60 — **denominator is serologic D-negative/weak D donors only, never the donor pool**. Al-Riyami 2021 (Oman) "D variant" 22/121 is `[UNVERIFIED]` at allele level (abstract only) and is used only as an order-of-magnitude bracket, never as a partial-D rate.

### 2.2 Non-Gulf inputs — bracketing scenarios only

*RHD\*01EL.01* 7.60% among Thai serologic D− donors; any *RHD*-gene-positive 42/2254 (1.9%) among US multiethnic serologic D− donors; *RHD\*DVI* 1 in 731 (US); atypical serologic D typing 0.79% (SE Brazil). These bound the order of magnitude for targets **no GCC study has ever measured**. They are never transferred onto the GCC donor pool.

### 2.3 Values that do not exist and were not invented

- **Ameen 2020 (Kuwait, n=917):** weak D types 1/2/3 recorded as *"not prevalent"* with **no number**. Recorded `NR`. Not back-calculated (`CLAUDE.md` §1.3).
- **Iran 99% homozygous *RHD* deletion (PMC6369079):** an unverified web-search snippet in the scoping file. **Excluded entirely.**
- **π_D−, the serologic D-negative prevalence in the GCC donor pool:** absent from the scoping file. Madkhali's n=60 and Alalshaikh's 70 D+/66 D− are **selected**, not prevalence, samples. Every DEL calculation below is therefore expressed **conditionally**.
- **ICC of any RH allele across GCC centres:** no multi-centre GCC RH dataset exists. Handled as a labelled bracket; PILOT-03 must publish its own.

---

## 3. Frequency estimation — what n buys

Selected rows from output §1 (Wilson, allele denominator converted to donors):

| Allele | p_plan | ±1.0 pp | ±0.5 pp | ±0.25 pp | ±0.1 pp |
|---|---|---|---|---|---|
| *RHCE\*ce(733G)* 9.46% | 0.0946 | 1,648 | 6,585 | 26,332 | 164,565 |
| *RHCE\*ceAR* 0.71% | 0.0071 | 182 | 597 | 2,218 | 13,533 |
| *RHD\*r's* 0.28% | 0.0028 | 125 | 326 | 1,009 | 5,573 |

**Absolute precision is the wrong criterion for rare alleles and must not be quoted alone.** A ±0.25 pp interval around a 0.28% allele runs from 0.03% to 0.53% — an 18-fold range that supports no clinical or inventory statement. Relative precision (output §2) is therefore reported alongside: half-width ≤ 50% of the point estimate needs **2,870 donors** for *RHD\*r's*; ≤ 25% needs **11,013**.

**Zero counts.** If PILOT-03 observes no C^w^, the strongest claim available is an exact upper bound: 0.368% at n = 1,000, 0.123% at n = 3,000, 0.037% at n = 10,000. Excluding a frequency of 0.1% requires **3,688 donors with zero observed**. Zero cells are reported as "0/n (0%; 95% CI 0% to U%)" and **never as "absent"**.

---

## 4. Kappa — precision, and why the paradox bites here

Kappa is computed **per antigen** from a 2×2 table (serologic call × genotype-predicted call), *not* by pooling antigen–donor pairs across antigens. Pooling mixes tables with different marginals and within-donor correlated errors and yields an uninterpretable number. D025's antigen–donor pair unit governs the **taxonomy tabulation and the overall percent agreement**, which is exactly why that percent agreement needs a donor-clustered variance (§6 below).

**The paradox, at the prevalences this study will actually meet** (output §6a; observed agreement fixed at 98%):

| Marginal prevalence π | p_e | κ | PABAK |
|---|---|---|---|
| 50% | 0.5000 | 0.960 | 0.960 |
| 90% | 0.8200 | 0.889 | 0.960 |
| 95% | 0.9050 | 0.790 | 0.960 |
| **98.84%** (Jazan predicted antigen e) | 0.9771 | **0.128** | 0.960 |
| 99% | 0.9802 | **−0.010** | 0.960 |

Two methods agreeing on 98% of donors score **κ ≈ 0.13 for antigen e**. That is the kappa paradox, not an assay failure, and reporting κ alone for antigen e would actively mislead a reader.

**n for a 95% CI on κ** (output §6b; marginal prevalences are Madkhali's **platform-predicted, not serologic**, Jazan n=354; D is an explicitly unsourced bracket):

| Antigen | π | n for ±0.10 (κ=0.80) | n for ±0.05 (κ=0.80) |
|---|---|---|---|
| C (RH2) | 68.36% | 162 | 646 |
| E (RH3) | 23.44% | 197 | 786 |
| c (RH4) | 80.48% | 226 | 903 |
| **e (RH5)** | **98.84%** | **3,208** | **12,829** |
| D (RH1) — bracket 0.92 | 92% *(unsourced)* | 492 | 1,968 |
| D (RH1) — bracket 0.97 | 97% *(unsourced)* | 1,259 | 5,033 |

**Pre-specified consequence.** For any antigen whose **observed** marginal prevalence falls outside **10%–90%**, κ is still reported with its CI, but it is **not the lead statistic**. The lead statistics there are the **full 2×2 counts, positive percent agreement and negative percent agreement, each with exact CIs**. This rule is mechanical and is declared before any data are seen, so it cannot be used to choose a favourable statistic post hoc.

**PABAK** (= 2p_o − 1) is reported alongside κ for every antigen, with this caveat attached every time it appears: PABAK is a strictly monotone relabelling of observed agreement, contains no information beyond p_o, and describes a hypothetical balanced-marginal population that PILOT-03 does not sample. It is context, never evidence of good agreement, and never a prevalence-robust substitute for κ. `[INFERENCE]` Gwet's AC1 may be added as a secondary sensitivity statistic; it is less prevalence-sensitive but rests on its own chance-agreement model, and if it is reported at all it must be reported for **all** antigens, pre-specified, not introduced where κ disappoints.

The κ CI planned here is a Wald-type interval on the κ scale (Fleiss–Cohen–Everitt variance; the implementation is verified against `statsmodels.stats.inter_rater.cohens_kappa` to six decimal places — output §0). Its coverage degrades as κ approaches 1, so the **reported** interval is a **cluster bootstrap** (§6), and these n are planning approximations.

---

## 5. Rare-allele reality check — what is not achievable

Pre-declared, mechanically applied criteria: an estimate is **uninformative** if the expected count E = n·p < 5, **or** if the CI upper limit exceeds 3× the lower limit.

| Target | p | n (donors) for E ≥ 5 | n for E ≥ 10 |
|---|---|---|---|
| *RHCE\*ce(733G,1006T)* 0.85% | allele | 295 | 590 |
| *RHCE\*ceAR* 0.71% | allele | 354 | 708 |
| *RHCE\*ce(712G)* 0.42% | allele | 590 | 1,180 |
| *RHD\*r's* 0.28% | allele | 885 | 1,770 |
| *RHD\*DVI* 0.137% *(US bracket)* | donor | 3,655 | 7,310 |

At the recommended design (§7), the **effective** sample size after clustering is ≈ 810 donors ≈ 1,620 alleles. Expected counts are then **4.6 alleles for *RHD\*r's*** and 6.9 for *ce(712G)* — at or below the declared floor. At *RHD\*DVI*'s US bracket, even **10,000 independent donors** give a CI whose upper limit is more than 3× its lower limit.

### DEL — the honest answer is that the pool-frequency version is infeasible

DEL is the highest-value donor-side target in the whole study (a proven cause of primary anti-D; never screened in any GCC cohort). It is also the one the sample size cannot deliver in the form usually wanted.

- To estimate P(DEL | serologic D−) at the Thai bracket of 7.60% to **±2 pp** requires **681 serologic D-negative donors**.
- Total donors required = 681 / π_D−. **π_D− is unknown and is not invented.** Across labelled brackets of 3%–15% the total intake is **4,540 to 22,700 donors — before any design effect.** With a design effect of ≈ 3.7 it is **17,000 to 84,000**.

**Say it plainly: a DEL frequency for the GCC donor pool, obtained by sampling the D-negative stratum at its natural prevalence, is not achievable at any feasible sample size.** `[EVIDENCE — output §5]` That is a design finding the protocol needs, not a failure of the calculation.

**The design remedy is to change the estimand, declared in advance:** test **all** serologic D-negative donors presenting over an extended window (optionally further enriched to C-positive D-negative donors, following the Thai algorithm in which 183/184 *RHD\*01EL.01* carriers were C-positive). The quantity then estimated is **P(DEL | serologic D-negative)** — which is the clinically actionable quantity anyway, since it governs whether D-negative units need molecular screening. The enrichment **must** be declared in the protocol and in every table legend, because a conditional frequency presented as a pool frequency would misrepresent the design. If enrichment is used, the C+ restriction introduces a known **spectrum/verification bias** against C-negative DEL alleles, and that bias must be stated, not buried.

---

## 6. Multi-centre clustering — the design effect, and the real constraint

Donors cluster by **centre** (the sampling unit) and are cross-classified by **ancestry**. Ignoring this would falsely narrow every CI in the study. Kish's design effect with unequal cluster sizes is used: **DEFF = 1 + ((cv² + 1)·m̄ − 1)·ICC**, with cv = 0.30 as a labelled bracket.

| donors/centre | ICC 0.005 | ICC 0.010 | ICC 0.020 | ICC 0.050 |
|---|---|---|---|---|
| 100 | 1.54 | 2.08 | 3.16 | 6.40 |
| 250 | 2.36 | 3.71 | 6.43 | 14.58 |
| 500 | 3.72 | 6.44 | 11.88 | 28.20 |

**The dominant term is ICC × m̄.** Once it exceeds 1, additional donors *within* a centre buy almost nothing.

**The constraint is the number of centres, not the number of donors** (output §7b). As donors per centre grows, Var(pooled p̂) → τ²/K, where τ² = ICC·p(1−p) is the between-centre variance and K the number of centres. This is a **floor** no donor recruitment can beat. For *RHCE\*ce(733G)* at 9.46%:

| ICC | τ | K=6 | K=8 | K=12 | K=20 |
|---|---|---|---|---|---|
| 0.005 | 2.07 pp | ±1.66 pp | ±1.43 pp | ±1.17 pp | ±0.91 pp |
| 0.010 | 2.93 pp | ±2.34 pp | ±2.03 pp | ±1.66 pp | ±1.28 pp |
| 0.020 | 4.14 pp | ±3.31 pp | ±2.87 pp | ±2.34 pp | ±1.81 pp |
| 0.050 | 6.55 pp | ±5.24 pp | ±4.54 pp | ±3.70 pp | ±2.87 pp |

With K < 15 a *t*(K−1) reference distribution replaces the normal, widening these further (at K=6, t = 2.571 vs z = 1.960 — about 31% wider).

**ICC estimation and reporting (pre-specified).** For each allele and antigen, fit a random-intercept logistic model with centre as the random effect and report **both** the latent-scale ICC (σ²_u/(σ²_u + π²/3)) and the proportion-scale ICC, **each named by its scale** — the two are different quantities and are routinely conflated. With ~12 centres the between-centre variance is estimated on very few degrees of freedom, so the ICC's own interval will be wide; it is reported, not suppressed. **PILOT-03 must publish these ICCs**: no GCC multi-centre RH ICC exists, which is precisely why this study's own sizing had to rest on a bracket.

**Analysis consequence.** With ~12 centres the Liang–Zeger sandwich is anti-conservative. The SAP pre-specifies the **Mancl–DeRouen bias-reduced covariance with a t(K−1) reference distribution**, and a **cluster bootstrap resampling centres** as the sensitivity analysis. SPSS GENLIN offers no such correction; see Part 3 of the `.sps` file.

---

## 7. Recommended sample size

### Pre-specified primary precision criterion
- **(a)** Frequency of ***RHCE\*ce(733G)*** — the commonest clinically relevant *RHCE* variant and the only one with more than a handful of Gulf observations — estimated with a **95% CI half-width ≤ 2.0 percentage points after the design effect**.
- **(b)** **Kappa for each of D, C, E and c** estimated with a **95% CI half-width ≤ 0.10**. Antigen e is excluded from (b) by the 10%–90% prevalence rule and is governed by PPA/NPA instead.

Criterion (a) is binding.

### Recommendation

> **n = 3,000 donors, allocated as 12 centres × 250 donors, with a hard floor of 8 centres and at least one centre in each participating GCC state.**

| ICC (labelled bracket) | DEFF | n_eff | half-width on *ce(733G)* |
|---|---|---|---|
| 0.002 | 1.54 | 1,944 | ±0.92 pp |
| 0.005 | 2.36 | 1,273 | ±1.14 pp |
| 0.010 | 3.71 | 808 | ±1.43 pp |
| 0.020 | 6.43 | 467 | ±1.88 pp |
| 0.050 | 14.58 | 206 | ±2.84 pp |

Criterion (a) is met up to ICC ≈ 0.020. Criterion (b) needs an **effective** n of 492 (worst of D/C/E/c at κ = 0.80) and is likewise met up to ICC ≈ 0.020.

**Why 12 × 250 and not 6 × 500.** Identical total n; at ICC = 0.010 they give n_eff of **808** and **466** respectively. Spreading the same 3,000 donors over twice as many centres nearly doubles the information content at identical cost. **Centre recruitment, not donor recruitment, is the primary feasibility risk and should be treated as such in the protocol.**

**Statement required in the protocol.** If the ICC proves to be at the top of the bracket (0.05), n = 3,000 delivers ±2.84 pp on a 9.5% allele and criterion (b) fails. That is **not** rescuable by recruiting more donors — only by recruiting more centres.

### Not supported at any feasible n — a design finding, not a failure
1. *RHD\*r's-RHCE\*ce(733G,1006T)* (0.28%, two observed alleles) to useful relative precision.
2. *RHCE\*ce(712G)* (0.42%, three observed alleles).
3. *RHD\*DVI* at the US bracket of 1 in 731.
4. A **donor-pool** DEL frequency at natural D-negative prevalence.

These four are **not** frequency-estimation outcomes. They are reported as **case ascertainment** — "k carriers identified among n donors tested (exact 95% CI a% to b%)" — carrying the explicit label *"not estimable to useful precision at this sample size."* No frequency claim, no between-group comparison, and no extrapolation to the GCC donor pool is permitted for them.

---

## 8. What this justification rests on, and what could not be determined

**Rests on (all `[UNCERTAIN]` to some degree):**
- A planning frequency of 9.46% for *RHCE\*ce(733G)* from **one region of one country** (Jazan, high African admixture), whose own 95% CI is 7.41%–11.86%.
- Antigen marginal prevalences that are **platform-predicted, not serologically observed** (Madkhali Table 4) — and the concordance study exists precisely to test whether prediction matches serology, so these inputs are circular in a way the protocol must acknowledge.
- An **ICC bracket with no empirical anchor whatsoever**.
- An assumed true κ of 0.80–0.90, which is an assumption, not a measurement.

**Could not be determined:**
- **π_D−** (serologic D-negative prevalence in GCC donors) — absent from all retrieved sources; a site-survey item.
- **ICC** for any RH allele across GCC centres — no multi-centre GCC dataset exists.
- **Per-centre ancestry composition** — only Madkhali's single-centre nationality list exists.
- Whether **hr^S^/hr^B^ reference serology** is obtainable (scoping §8 item 12). It does not affect this sizing, because D025 already excludes these from the primary outcome; it would affect a secondary outcome if obtained.
- Whether **Al-Riyami 2021's** full text resolves "D variant" to alleles — full text inaccessible.

**Recommended protocol text on revisability.** Because the ICC bracket is unanchored, the protocol should pre-specify a **blinded internal pilot** at n ≈ 600 (all 12 centres, first 50 donors each) whose **only** output is the estimated ICC and the achieved DEFF, used to revise the target n. The pilot must not report any frequency or concordance estimate, and the revision rule must be written down before it runs — otherwise it becomes an interim look that biases the primary estimate.
