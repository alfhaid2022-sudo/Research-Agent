# Stage 2 — Domain Scoping (Transfusion Medicine)
**Review:** Red blood cell alloimmunization in transfusion-dependent patients in Saudi Arabia and the Gulf — prevalence, antibody specificities, and matching policy
**Planned reporting standard:** JBI scoping methodology + PRISMA-ScR
**Prepared by:** transfusion-medicine-expert (reviewer/verifier role)
**Date:** 2026-09-11
**File lock:** claimed in `00_Admin/FILE_LOCKS.md`
**Status:** DOMAIN CONTENT ONLY — not protocol text. The methodology agent drafts protocol language.

> **Scope of this document.** This defines *what the protocol must capture* and *where the field's definitions diverge*. Every prevalence figure quoted below is attributed to a specific retrieved source and is reproduced only to demonstrate the spread of definitions — none is a pooled or endorsed estimate. Literature retrieved this session via PubMed and SciSpace; DOIs given for every substantive claim.
>
> **Standing caveat required by my role file:** antigen frequencies and alloantibody specificity distributions are strongly population-dependent. No figure from a Western, African-ancestry or South-Asian cohort may be transferred onto a Saudi/Gulf population, or the reverse, without explicit statement.

---

## 1. CONCEPT SPACE — PCC framework content

### 1.1 Population (P)

**Tier 1 — core, must be in scope**

| Group | Rationale |
|---|---|
| Sickle cell disease (all genotypes: HbSS, HbS/β⁰, HbS/β⁺, HbSC, HbS/HPFH, HbS/D-Punjab, HbS/O-Arab) | The dominant chronically transfused group in the Gulf literature. Genotype must be captured, not collapsed — HbSS and HbSC differ in transfusion exposure and in disease-related inflammation. |
| β-thalassemia major / transfusion-dependent thalassemia (TDT) | The second dominant group; the comparator against which SCD alloimmunization risk is repeatedly contrasted. |
| β-thalassemia intermedia / non-transfusion-dependent thalassemia (NTDT) | **Include, but as a separately labelled stratum.** Sporadic, late-onset, often non-phenotype-matched exposure gives a distinct risk profile. The EMRO review reports TDT rates of 2.87–30% vs TI 6.8–19.5% [`10.1016/j.transci.2019.102678`], and an Omani TI series of 37 patients found one new antibody across 335 units after a phenotype-matched policy was adopted in 2009 [`10.1016/j.transci.2014.04.009`]. Merging TI into TDT destroys the exposure gradient. |
| HbH disease / α-thalassemia requiring transfusion, HbE/β-thalassemia | Present in Gulf hemoglobinopathy case-mix [`10.7754/Clin.Lab.2020.200334`]; small numbers but must not be silently folded into "thalassemia". |

**Tier 2 — include, flagged as a distinct chronic-transfusion context**

| Group | Rationale |
|---|---|
| Myelodysplastic syndrome (MDS) | An established high-risk responder group: MDS was among the diagnoses significantly more common among alloantibody responders in the REDS-III recipient database of 319,177 screened patients [`10.1111/bjh.15182`]. Chronic transfusion, older age, usually ABO/D-only matching. |
| Aplastic anemia / bone marrow failure | Chronic transfusion dependence, but with immunosuppression (ATG, ciclosporin) that plausibly suppresses alloresponse — a confounder that must be recorded, not assumed. `[INFERENCE]` |
| Hemato-oncology / chronically transfused solid tumour and stem-cell-transplant patients | Immunosuppression and ABO-mismatched HCT complicate both the numerator and the denominator. A Saudi HCT series specifically examined ABO mismatch and alloimmunization as determinants of transplant outcome [`10.1016/j.jtct.2024.11.003`]; a Gulf oncology case produced anti-Ku from a `KEL*02N.19` allele [`10.1111/vox.70209`]. |
| Chronic kidney disease on regular transfusion | Reported as a distinct alloimmunization population (12.4% RBC immunization in one transfused CKD cohort, ABO/D-only matched) [`10.5001/omj.2020.95`]. Relevant to "transfusion-dependent" only if the review's definition is exposure-based rather than diagnosis-based. |

**Tier 3 — RECOMMEND EXCLUSION from the primary synthesis**

*Obstetric / HDFN alloimmunization — EXCLUDE from the primary population; permit only as a clearly separated secondary context.*
`[RECOMMENDATION]`
Reasoning:
1. **The immunizing event is different.** Pregnancy-induced alloimmunization is fetomaternal exposure, not transfusion exposure. A review whose research question is transfusion-driven alloimmunization cannot use a denominator in which the exposure is gestational.
2. **Anti-D is confounded by prophylaxis.** Anti-D in a woman of childbearing age cannot be reliably classified as immune vs passive RhIG without data most studies do not report. Reverberi's persistence analysis explicitly excluded anti-D in women of childbearing age for exactly this reason [`10.2450/2008.0021-08`].
3. **The denominators are incompatible.** Antenatal series are population screening denominators (e.g. an Omani antenatal cohort of 1,251 women, 7.3% D-negative, 10% of D-negative women alloimmunized [`10.5001/omj.2016.15`]); transfusion series are patient-exposure denominators. Pooling produces an uninterpretable number.
4. **However**: parity/pregnancy history must be captured as a *covariate* in the included transfusion populations — it is a recognized independent predictor (female sex 2.38% vs male 1.68% in REDS-III [`10.1111/bjh.15182`]), and HDFN is a legitimate *consequence* to report qualitatively (a Gulf-region HDFN case from anti-Jkᵃ + anti-E is on record [`10.5001/omj.2020.135`]).

*Non-chronically-transfused surgical and acute-care patients — EXCLUDE from the primary population.*
`[RECOMMENDATION]`
Reasoning: single-episode or low-burden transfusion produces a fundamentally different cumulative antigen exposure, and these patients are rarely re-screened, so the ascertainment window is short and the observed prevalence is dominated by detection opportunity rather than by immunization risk. Including them would bias the pooled estimate downward for reasons that have nothing to do with Gulf transfusion practice. They remain useful as an *external comparator* in the discussion (background unexpected-antibody prevalence in general pre-transfusion testing), not as review population.

*Borderline case requiring an explicit protocol rule:* **episodically-transfused SCD**. Chou et al. found 58% of chronically transfused vs 15% of episodically transfused SCD patients alloimmunized in the same centre under the same matching policy [`10.1182/blood-2013-03-490623`]. If the review admits episodic SCD it must stratify; if it excludes them it must say so, because several Gulf series (which draw on "all SCD patients with a transfusion record") certainly contain them.

### 1.2 Concept (C)

1. **Alloimmunization frequency** — prevalence (cross-sectional, point or ever) and incidence (per patient-year, per unit transfused, cumulative). These are *not interchangeable* (see §2.1).
2. **Antibody specificities** — per-antibody counts by ISBT system (RH, KEL, FY, JK, MNS, LE, LU, DI, XG, and antibodies to high-prevalence antigens), including multiple-antibody combinations and antibodies to low-prevalence antigens.
3. **Autoantibodies and DAT positivity** — warm/cold autoantibodies, DAT result and strength, presence of autoantibody with or without underlying alloantibody. Gulf series report autoimmunization rates ranging from 0.52% to 5.3% within single studies [`10.2147/IJGM.S360320`; `10.1155/2023/3239960`] against a regional review range of 0.1–45% [`10.1016/j.transci.2019.102678`] — a spread that is almost certainly definitional rather than biological.
4. **Non-specific / unidentified reactivity** — "nonspecific", "inconclusive", "antibody of undetermined specificity". A Saudi SCD series reported unidentified alloantibodies as 17.5% of detected antibodies [`10.2147/JBM.S548152`]; an earlier Eastern Province series reported "nonspecific" 12.5% and "inconclusive" 12.5% [`10.26719/2007.13.5.1181`]. This category is large enough to change any pooled specificity distribution.
5. **Matching policy in force** — the exposure variable of greatest policy interest. Four levels, which must be captured as an ordinal variable, not a binary:
   - (a) ABO + D only
   - (b) ABO + D + limited Rh (usually C/c/E/e) ± K — "Rh/K matched" or "extended Rh and Kell"
   - (c) Extended serological phenotype (Rh, K, plus Fyᵃ/Fyᵇ, Jkᵃ/Jkᵇ, S/s, sometimes more)
   - (d) Molecular/genotype-guided matching (RHD/RHCE genotyping, SNP arrays, or full RBC genotyping)
   plus, orthogonally: **prophylactic vs reactive** (antigen-negative only after an antibody is formed), and **leucoreduction status** (pre- vs post-storage) and **whether the policy changed mid-study**.
6. **Risk factors / associations** — age at first transfusion, age at study, sex, transfusion burden (units, duration, frequency), splenectomy, exchange vs simple transfusion, donor–recipient ethnic concordance, HbF/haplotype, inflammatory state at transfusion, hydroxyurea, immunosuppression.
7. **Clinical consequences** — DHTR, hyperhemolysis, difficulty sourcing compatible units, transfusion delay, transfusion avoidance/failure.
8. **Service infrastructure** — donor phenotyping programmes, donor registries, national antibody databases, reference immunohematology laboratory access, molecular typing availability.

### 1.3 Context (C)

**Geography:** Kingdom of Saudi Arabia plus the five other GCC states — Kuwait, Bahrain, Qatar, Oman, United Arab Emirates. `[RECOMMENDATION]` Treat the wider Eastern Mediterranean/Arab region (Iran, Iraq, Yemen, Egypt, Jordan, Levant) as an explicitly labelled *comparator context* if included at all; the Gulf's distinguishing feature — a largely consanguineous indigenous recipient population transfused with a donor pool that includes a large expatriate component — does not transfer to those settings.

**Which Saudi regions will dominate the retrieved literature** `[EVIDENCE]` — based on where the studies actually come from:
- **Southwestern / Jazan province** — described by its own investigators as an endemic area for SCD and thalassemia; the largest single Saudi alloimmunization cohort retrieved is a Jazan three-hospital study of 1,027 patients [`10.2147/IJGM.S444949`], with a further 438-patient Jazan series [`10.2147/IJGM.S360320`].
- **Eastern Province, including Al-Ahsa and the Dammam/Qatif belt** — the Al-Ahsa investigators state SCD and thalassemia incidence rates there are the highest in Saudi Arabia [`10.1155/2023/3239960`]; the Eastern Province carries the Arab-Indian β-globin haplotype (614/746 HbS homozygotes AI/AI in a 778-patient Eastern Province cohort) [`10.1080/03630269.2020.1739068`], and an older 350-patient series comes from King Fahd Hospital of the University, Al-Khobar [`10.26719/2007.13.5.1181`].
- **Western region (Jeddah/Makkah/Madinah)** — multiple centres publishing (KAMC-Jeddah pediatric SCD [`10.1097/MPH.0000000000002889`]; KAUH [`10.1111/trf.15682`]; a private-sector Jeddah SCD cohort [`10.2147/JBM.S548152`]; a 27,027-donor S/s antigen frequency study [`10.7754/Clin.Lab.2025.250681`]; Al-Madinah [`10.7754/Clin.Lab.2021.210212`]).
- **Riyadh/Central region** — present but weighted toward apheresis and transplant practice rather than prevalence series [`10.4103/ajts.ajts_13_21`; `10.1016/j.jtct.2024.11.003`]; a Riyadh-province premarital screening dataset shows the hemoglobinopathy mix differs (thalassemia 66% vs SCD 34% of detections in Al-Kharj) [`10.3390/medicina61081458`].

> `[UNVERIFIED]` A *national ranking* of Saudi regions by SCD/thalassemia burden. Individual papers assert their own region is highest (Al-Ahsa in `10.1155/2023/3239960`; Jazan described as endemic in `10.2147/IJGM.S444949`). I could not retrieve a single current national surveillance source in this session that adjudicates between them. The protocol should say "regions reported by primary studies as high-burden" and must not assert a ranking.
>
> **Migration caveat** `[INFERENCE]` — a Cureus study of SCD children *living in* the Eastern Province found 88/114 were of Southwestern origin [`10.7759/cureus.73532`]. Region of *care* ≠ region of *ancestry*. Extraction must record both where available, or the review will mis-attribute genetic background to geography.

---

## 2. DEFINITIONAL HETEROGENEITY — where pooling and comparison become unsafe

This is the section on which I would rest the scientific value of the review. Each item below is a *documented* divergence in the retrieved literature, not a hypothetical one.

### 2.1 "Alloimmunization" — ever-positive vs currently-detectable

**The divergence.** Most Gulf studies are retrospective record reviews that count a patient as alloimmunized if an alloantibody appears *anywhere* in the transfusion record (an "ever-positive" definition). Others report a cross-sectional antibody screen at a single time point (a "currently-detectable" definition). Almost none state which they used.

**Why it threatens comparability.** Red cell alloantibodies evanesce. In 71 SCD patients, 81% had at least one antibody that became undetectable within a 2-year window [`10.14423/SMJ.0000000000000528`]. Across a general antibody population, 37% of alloantibodies were non-persistent on re-testing, with strong specificity dependence — anti-D 14% non-persistence, anti-Jkᵃ 43% [`10.2450/2008.0021-08`]. A Japanese multi-institutional prospective study found 33% of identified antibodies evanesced [`10.1111/trf.18009`]. One authoritative review estimates that fewer than 30% of alloantibodies are detected by current screening practice in SCD [`10.1016/j.tracli.2019.02.003`].

Consequence: a cross-sectional design and a cumulative-record design applied to the *identical* patient population will produce prevalence estimates that differ by a factor of two or more, for purely methodological reasons. **A pooled prevalence that mixes the two designs is not a prevalence of anything.** `[EVIDENCE]` This alone justifies pre-specifying the definition as a mandatory stratifier.

Second-order consequence: length of the look-back window, and whether the centre *retains and consults* historical antibody records, become determinants of measured prevalence. Reverberi showed non-persistent antibodies were associated with longer follow-up and more post-detection tests [`10.2450/2008.0021-08`] — i.e. the more you look, the more evanescence you find, which paradoxically *raises* an ever-positive estimate and *lowers* a point-prevalence estimate from the same data.

### 2.2 "Transfusion-dependent" — no shared operational definition

**The divergence.** Studies variously define the population as: patients on a regular/chronic transfusion programme; patients with "multiple transfusions"; patients who received ≥N units (N unstated, or 1, or 6, or 10, or 20); or simply "all patients with diagnosis X and a blood bank record". A Saudi study of "multi-transfused patients" comprised 68 patients [`10.1016/j.transci.2008.09.013`]; a Brazilian series defined polytransfused as ≥6 units in 3 months [`10.1590/S1679-45082011AO1777`]; Gulf series often do not define it at all.

**Why it threatens comparability.** Antigen exposure is the primary driver of immunization, and the dose–response is steep and front-loaded. In 6,496 French SCD patients on RH-K matched units, 75% of patients who would ever form an antibody had formed their first by the 17th unit [`10.1182/bloodadvances.2022009328`]. In the REDS-III cohort, transfusion volume proxies dominated responder status [`10.1111/bjh.15182`]. A Japanese prospective study found units transfused significantly associated with antibody development (p<0.001) [`10.1111/trf.18009`]. A Saudi study found burden >10 units significantly predicted alloimmunization (p=0.02) — though note this particular report is a **repository preprint, not a peer-reviewed article** [`10.5281/zenodo.15222886`] and must be handled under the review's grey-literature rule, not cited as a peer-reviewed finding.

Consequence: two studies reporting "alloimmunization in transfusion-dependent SCD" may be describing populations with a tenfold difference in cumulative exposure. Comparing their percentages is a category error.

### 2.3 Antibody detection methodology

**The divergence.** Retrieved Gulf/Saudi studies use, variously: column/gel agglutination (an Omani series explicitly used the DiaMed gel system [`10.4084/MJHID.2017.013`]); solid-phase (a Saudi donor antigen study used solid phase [`10.7754/Clin.Lab.2025.250681`]); conventional tube LISS/PEG IAT; and unstated methods. Enzyme (papain/ficin) and saline-phase testing are used at some centres and not others, and are often not reported at all.

**Why it threatens comparability.**
- **Sensitivity differs by platform and by specificity.** Reverberi observed that antibodies detected in the later decade of his series were both *weaker* and *less persistent*, and attributed this to increasing screening-test sensitivity over time [`10.2450/2008.0021-08`]. A more sensitive platform converts "non-alloimmunized" patients into "alloimmunized" ones without any change in biology — and this is confounded with *calendar year*, which matters because the Gulf corpus spans 2003–2026 [`10.1046/j.1537-2995.2003.00549.x` … `10.7759/cureus.113206`].
- **Enzyme and saline methods change the antibody mix.** The Japanese prospective study found antibodies detectable only by saline and/or enzyme methods — the ones conventionally called clinically insignificant — had a significantly higher evanescence rate (p=0.012) [`10.1111/trf.18009`]. A study that runs enzyme panels will report more antibodies, a higher proportion of them transient and of doubtful significance, and a different specificity profile.
- **Screening cell panel composition determines what can be found at all.** Two- vs three-cell screens, homozygous vs heterozygous expression of dosage-sensitive antigens (notably Jkᵃ, Jkᵇ, Fyᵃ, Fyᵇ, M, N, S, s), and whether the panel cells reflect local antigen frequencies, all set a hard ceiling on detectable specificities. Antibodies to low-prevalence antigens are essentially invisible to routine screening and are found only by crossmatch incompatibility — one polytransfused series found an unexpectedly high rate of anti-Diᵃ [`10.1590/S1679-45082011AO1777`]. **A specificity distribution is a property of the reagent panel as much as of the patient.** `[EVIDENCE]`
- **Antibodies to high-prevalence antigens require reference-laboratory resolution.** The UAE anti-Ku case needed enzyme, DTT and AET testing plus genotyping and confirmation at an external reference laboratory, and even then the initial genotype prediction was wrong [`10.1111/vox.70209`]. Centres without that access will record such patients as "panagglutinin, unidentified".

**Extraction implication:** platform, enhancement medium, phases read, panel size and vendor, and whether an immunohematology reference laboratory was available must all be captured — and studies not reporting them flagged, not imputed (`NR` per CLAUDE.md §1.3).

### 2.4 The positivity threshold

**The divergence.** Thresholds for calling a screen positive are rarely stated — but when they are, they differ materially. The Bahrain study defined an alloimmunized patient as one with a positive IAT showing a *consistent reaction strength of 2+ or greater* [`10.7759/cureus.113206`]. Most other retrieved studies imply any reactivity counts.

**Why it threatens comparability.** A ≥2+ rule excludes weak (1+, w+) reactivity — which is exactly the reactivity characteristic of evanescing antibodies and of antibodies showing dosage. Reverberi found non-persistent antibodies had a significantly lower maximum score than persistent ones (2+ vs 3+, p<0.001) [`10.2450/2008.0021-08`]. A ≥2+ threshold therefore systematically removes the transient and the weak, biasing prevalence downward and shifting the specificity mix toward strong, persistent antibodies (anti-D, anti-K). This is a plausible partial explanation for the Bahrain thalassemia figure of 4.6% sitting far below regional thalassemia figures, and the review must say so rather than treat it as a biological finding. `[HYPOTHESIS]`

### 2.5 Whether autoantibodies and non-specific reactivity are counted

**The divergence.** Some studies report allo- and autoimmunization separately and cleanly [`10.2147/IJGM.S360320`; `10.1155/2023/3239960`]. Others report a combined "RBC immunization" figure [`10.5001/omj.2020.95` reports 12.4% immunized = 12% allo + 0.4% auto]. Others include "nonspecific" and "inconclusive" reactivity within the alloantibody tally [`10.26719/2007.13.5.1181`; `10.2147/JBM.S548152`]. The EMRO regional review found reported autoantibody rates spanning 0.1–45% [`10.1016/j.transci.2019.102678`] — a 450-fold range that cannot be biological and must be definitional.

**Why it threatens comparability.** Three distinct consequences: (i) a combined numerator inflates alloimmunization; (ii) counting unidentified reactivity as an "alloantibody" inflates both prevalence and the "other/unknown" specificity bin; (iii) autoantibody presence masks underlying alloantibodies unless adsorption studies are performed, so studies without adsorption capability *under*count alloantibodies in exactly the most heavily transfused patients. Allo- and autoimmunization are mechanistically linked in SCD [`10.1016/j.tracli.2019.02.003`], so they cannot simply be assumed independent either.

### 2.6 Transfusion burden reporting

**The divergence.** Burden is reported as: lifetime units; units in the study window; units per year; years on transfusion; transfusion frequency; "regularly transfused"; or not at all. Exchange transfusion (manual or automated) is frequently not distinguished from simple transfusion, despite an order-of-magnitude difference in units — a Riyadh audit recorded a median 28.64 packed-cell units/patient/year on automated exchange vs 13.39 on manual exchange [`10.4103/ajts.ajts_13_21`].

**Why it threatens comparability.** Without a common exposure metric, alloimmunization *prevalence* cannot be converted into *risk*, and between-study differences cannot be attributed to matching policy rather than to exposure. Given the front-loaded dose–response [`10.1182/bloodadvances.2022009328`], even the distribution of burden (not just the mean) matters.

### 2.7 Denominator: patients screened vs patients transfused vs patients registered

**The divergence.** Denominators in the retrieved corpus include: all patients with the diagnosis on a hospital register; all patients with any blood-bank record; all patients with a documented transfusion; and all patients with at least one post-transfusion antibody screen.

**Why it threatens comparability.** This alone moves the headline number by a factor of ~3 in the same dataset: in REDS-III, 2.07% of 319,177 *screened* patients had a clinically significant alloantibody [`10.1111/bjh.15182`], and the accompanying editorial states the prevalence ranged from 2% to 6% "depending on whether the denominator included all patients or only those with confirmed RBC transfusion" [`10.1111/BJH.15220`]. A registry denominator additionally includes never- and rarely-transfused patients, diluting the estimate; a screened denominator conditions on having been tested, which is itself associated with being transfused more.

### 2.8 Matching policy is a moving target within studies

**The divergence.** Several centres changed policy during the study window (an Omani TI service adopted phenotype matching in 2009 mid-series [`10.1016/j.transci.2014.04.009`]); others describe "extended phenotypic crossmatching" without enumerating the antigens [`10.7759/cureus.113206`]; the EMRO review found most regional centres use ABO and RhD matching only [`10.1016/j.transci.2019.102678`], while large Saudi series describe Rh/K-matched programmes [`10.2147/IJGM.S444949`].

**Why it threatens comparability.** The exposure of interest is time-varying and often mis-specified as a study-level constant. A patient alloimmunized in 2005 under ABO/D-only matching, counted in a 2024 cross-section at a centre that now matches Rh/K, will be attributed to the wrong policy. **Policy must be captured as policy-at-time-of-immunization where reported, and the ambiguity flagged where not.** `[RECOMMENDATION]`

### 2.9 Serologic phenotype ≠ antigen match (the RH variant problem)

**The divergence.** Studies treat "Rh-matched" as a binary achieved state. It is not. Chou et al. found 58% of chronically transfused SCD patients alloimmunized *despite* transfusion with serologically Rh(D,C,E)- and K-matched units from African-American donors; 91 of 146 antibodies were unexplained Rh antibodies, 56 of them in patients whose own cells typed *positive* for the corresponding antigen, and high-resolution RH genotyping showed variant alleles in 87% of individuals [`10.1182/blood-2013-03-490623`]. Variant RHCE/RHD haplotypes are well characterized in African-ancestry and Comorian donor populations [`10.2450/2016.0275-15`; `10.1111/j.1365-2141.2011.08691.x`]. The Gulf analogue — Kell-system null alleles producing a false genotype-predicted phenotype — is documented in the region [`10.1111/vox.70209`].

**Why it threatens comparability.** A study reporting "alloimmunization despite Rh matching" may be describing a serological-matching failure caused by partial antigens, not an immunological surprise. `[UNCERTAIN]` **I could not retrieve, in this session, any study characterizing RHD/RHCE variant allele frequencies in a Saudi or Gulf SCD/thalassemia cohort or donor pool.** That absence is itself a finding worth reporting as an evidence gap, and it means Western RH-variant frequencies must not be assumed to apply to Arab-Indian-haplotype populations.

### 2.10 Study design, era, and setting mixing

Retrospective chart review, cross-sectional serology, prospective cohort, single-centre, multi-centre, and registry designs are all present, spanning 2003–2026, with leucoreduction status (post-storage vs pre-storage) varying — the Kuwaiti thalassemia study explicitly attributed its 30% rate in part to the use of post-storage leucodepleted blood [`10.1046/j.1537-2995.2003.00549.x`]. Donor–recipient ethnic concordance is a further Gulf-specific variable: one Saudi study reported no antibodies among 13 patients transfused within the same (Arab) ethnic group vs 10/47 among those receiving multi-ethnic blood [`10.1016/j.transci.2008.09.013`] — a small, uncontrolled observation that should be reported as hypothesis-generating, **not** as an established effect. `[HYPOTHESIS]`

### 2.11 Illustration of the resulting spread (do NOT pool these)

Reported figures from the retrieved Saudi/Gulf corpus, presented solely to show the range that definitional variation produces:

| Setting | n | Reported rate | Source DOI |
|---|---|---|---|
| Jazan, SCD+thal, Rh/K matched | 1,027 | 7.6% overall | `10.2147/IJGM.S444949` |
| Al-Madinah, SCA+β-thal | 137 | 6.57% | `10.7754/Clin.Lab.2021.210212` |
| Oman, TDT, 25 years | 268 | 9.3% | `10.1111/trf.14508` |
| Jazan, second centre | 438 | SCD 12.98% / thal 13.21% | `10.2147/IJGM.S360320` |
| Eastern Province (Al-Khobar), SCA | 350 | 13.7% | `10.26719/2007.13.5.1181` |
| Bahrain (≥2+ IAT rule) | 311 | 14.8% overall; SCD 20.2% vs thal 4.6% | `10.7759/cureus.113206` |
| Al-Ahsa, SCD+thal | 364 | SCD 16.7% / thal 11.97% | `10.1155/2023/3239960` |
| Jeddah, pediatric SCD | 121 | 17.4% | `10.1097/MPH.0000000000002889` |
| Saudi, "multi-transfused" | 68 | 22.06% | `10.1016/j.transci.2008.09.013` |
| Kuwait, thalassemia major | 190 | 30% | `10.1046/j.1537-2995.2003.00549.x` |
| Oman, SCD+thal (gel) | 262 | SCD 31.6% / thal 20% | `10.4084/MJHID.2017.013` |

For orientation only: a Saudi meta-analysis (12 studies, 1,811 patients) reported a pooled rate of 18.2% (SCD 18.6%, thalassemia 19.5%) [`10.7754/Clin.Lab.2024.240827`], and a global adult-SCD meta-analysis (9 studies, n=1,711) reported 28.9% (95% CI 22.4–35.4) with I² = 88.5% [`10.3390/jcm15103828`]. The I² of 88.5% is the quantitative expression of exactly the heterogeneity catalogued above. **A JBI/PRISMA-ScR scoping review should map this heterogeneity, not add another pooled estimate to it.** `[RECOMMENDATION]`

---

## 3. KEY VARIABLES FOR THE EXTRACTION FORM

### A. Study identification and design
A1 Citation, PMID/DOI · A2 Publication year · A3 Data collection period (start–end) · A4 Country · A5 Region/province · A6 Centre name(s) and number of centres · A7 Sector (government / military / academic / private) · A8 Design (retrospective chart review / cross-sectional / prospective cohort / registry) · A9 Sampling frame and consecutive-vs-selected · A10 Ethics approval reported (Y/N) · A11 Funding and conflicts · A12 Peer-reviewed vs preprint/repository/thesis

### B. Population
B1 Diagnosis and diagnostic method (HPLC / capillary electrophoresis / genotype) · B2 Hemoglobinopathy genotype detail · B3 SCD/thal split with n per group · B4 TDT vs NTDT/TI classification and how assigned · B5 n total, n analyzed, n excluded and why · B6 Age (mean/median, range, paediatric/adult split) · B7 Sex · B8 Nationality / expatriate proportion · B9 Ancestry or β-globin haplotype if reported · B10 Consanguinity if reported · B11 Splenectomy status · B12 Hydroxyurea / disease-modifying therapy · B13 Pregnancy/parity history · B14 Immunosuppression or chemotherapy · B15 Prior HCT

### C. Transfusion exposure
C1 Definition of "transfusion-dependent" **as stated by the authors, verbatim** · C2 Units transfused (lifetime / in window / per year) — mean, median, range, and which · C3 Duration on transfusion · C4 Age at first transfusion · C5 Simple vs manual exchange vs automated exchange · C6 Leucoreduction (none / post-storage / pre-storage / not stated) · C7 Irradiation, washing, other modification · C8 Donor pool description and donor–recipient ethnic concordance · C9 Transfusions received outside the reporting centre (Y/N/unknown) — a direct threat to both exposure and antibody-history completeness

### D. Matching and compatibility policy
D1 Policy level (ABO+D / +Rh / +Rh+K / extended phenotype / genotype-guided) · D2 Exact antigens matched, enumerated · D3 Prophylactic vs reactive antigen-negative provision · D4 Policy change during the study window and date · D5 Patient extended phenotyping performed before first transfusion (Y/N) · D6 Donor extended phenotyping / typed donor inventory available · D7 Molecular genotyping available (patient / donor / both / none) · D8 Crossmatch method (serologic IAT / immediate spin / electronic) · D9 Access to an immunohematology reference laboratory · D10 National or regional antibody database available

### E. Serological methodology  *(the section most often missing — record `NR` aggressively)*
E1 Platform (tube / column-gel / solid phase / automated analyzer, with vendor) · E2 Enhancement medium (LISS / PEG / albumin / none) · E3 Phases tested (IS / 37°C / IAT) · E4 Enzyme technique used (Y/N; papain/ficin) · E5 Screening cell panel — number of cells, vendor, homozygous expression for dosage-sensitive antigens · E6 Identification panel size · E7 Positivity threshold / minimum reaction strength counted, **verbatim** · E8 DAT performed routinely (Y/N), method, and IgG/C3d differentiation · E9 Autoadsorption / alloadsorption / elution capability · E10 Titration performed · E11 Screening frequency and timing relative to transfusion · E12 Look-back window for historical antibodies; whether historical records were consulted

### F. Outcomes — alloimmunization
F1 Author's definition of alloimmunization, **verbatim** · F2 Ever-positive vs currently-detectable (reviewer-coded; record "cannot determine" where true) · F3 Denominator used, **verbatim**, with n · F4 Number and % alloimmunized, with exact n/N · F5 Incidence (per patient-year, per unit) if reported · F6 Single vs multiple alloantibodies (n and %) · F7 Total alloantibodies identified (note: antibody count ≠ patient count — many studies report % of antibodies, not % of patients; both must be extracted separately) · F8 Specificity table by ISBT system and antigen, with n for each · F9 Antibodies to high-prevalence antigens · F10 Antibodies to low-prevalence antigens · F11 "Unidentified" / "nonspecific" / "inconclusive" count and how classified · F12 Evanescence / non-persistence reported (Y/N) and rate

### G. Outcomes — autoimmunization and DAT
G1 Autoantibody definition, verbatim · G2 Autoimmunization rate with n/N · G3 Warm / cold / mixed · G4 Autoantibody with vs without concurrent alloantibody · G5 DAT-positive rate and persistence · G6 Whether autoantibodies were included in the alloimmunization numerator

### H. Risk factors and associations
H1 Variables tested · H2 Univariable results (effect size, 95% CI, exact p) · H3 Multivariable model, covariates, and results · H4 Statistically significant associations reported · H5 **Null and negative findings** (mandatory — CLAUDE.md §1.4)

### I. Clinical consequences and service impact
I1 DHTR (n, definition used) · I2 Hyperhemolysis (n) · I3 Acute HTR · I4 Difficulty/failure to source compatible units · I5 Transfusion delay · I6 Alloimmunization-attributable morbidity/mortality · I7 Iron overload / ferritin where linked to transfusion burden · I8 Cost or service-burden data

### J. Authors' policy conclusions
J1 Matching policy recommended by the authors · J2 Whether that recommendation is supported by the study's own data or asserted · J3 Implementation barriers named (donor inventory, cost, expertise, genotyping access) · J4 Reported limitations

---

## 4. CLINICALLY SIGNIFICANT SPECIFICITIES EXPECTED TO DOMINATE

**Mandatory caveat (role file, hard rule 3):** what follows is what the *retrieved Gulf and Saudi literature reports*, not a transferable epidemiological law. Alloantibody specificity distribution is a joint product of (i) recipient antigen frequencies, (ii) donor antigen frequencies, (iii) the matching policy in force, and (iv) the reagent panel used. All four differ between the Gulf, Western Europe/North America, and African-ancestry populations. **A Western specificity ranking must not be substituted where Gulf data are absent, and Gulf findings must not be generalized outward.**

**Expected to dominate — RH and KEL.** `[EVIDENCE]`
- **Anti-E** — the single most frequently reported specificity across the Gulf corpus: 25.9% of antibodies in the 1,027-patient Jazan cohort [`10.2147/IJGM.S444949`], 24% in Omani TDT [`10.1111/trf.14508`], 17.19% in the second Jazan cohort [`10.2147/IJGM.S360320`], 20% in a Jeddah SCD cohort [`10.2147/JBM.S548152`], 18.8% (as a lone antibody) in the Eastern Province series [`10.26719/2007.13.5.1181`], 45.6% of alloimmunized Kuwaiti thalassemia patients [`10.1046/j.1537-2995.2003.00549.x`].
- **Anti-K** — co-dominant with anti-E and in some series clearly first: 72% of alloimmunized Kuwaiti thalassemia major patients [`10.1046/j.1537-2995.2003.00549.x`], 24.1% of antibodies in Jazan [`10.2147/IJGM.S444949`], 24% in Oman [`10.1111/trf.14508`], 23.7% in Jeddah paediatric SCD [`10.1097/MPH.0000000000002889`], the most frequent specificity in Al-Madinah [`10.7754/Clin.Lab.2021.210212`]. The regional review names anti-K and anti-E as the two commonest [`10.1016/j.transci.2019.102678`]. The dominance of anti-K is expected where K antigen frequency in recipients is low (reported at 3.81% in Al-Madinah patients [`10.7754/Clin.Lab.2021.210212`], 8.29% in a Jeddah SCD cohort [`10.2147/JBM.S548152`], 6.25% of patients vs 9.16% of donors at KAUH [`10.1111/trf.15682`]) — a donor–recipient mismatch gradient that makes K provision a high-yield, low-cost intervention.
- **Anti-C, anti-c, anti-D, anti-e** — consistently present; anti-C at 15% of antibodies in one Jeddah SCD series [`10.2147/JBM.S548152`], anti-c 6.3% in the Eastern Province series [`10.26719/2007.13.5.1181`], and the Omani SCD/thal series detected antibodies to E, e, C, c and D with ~85% of immunized patients carrying Rh and/or Kell antibodies [`10.4084/MJHID.2017.013`].

**Expected as a consistent minority — JK, FY, MNS, and others.** `[EVIDENCE]` Anti-S at 9.5% in Jeddah paediatric SCD [`10.1097/MPH.0000000000002889`]; Kidd, Duffy, Lutheran and MNS specificities reported at low frequency but present in Jeddah [`10.2147/JBM.S548152`]; the Omani series additionally identified anti-Fyᵃ, anti-Kpᵃ, anti-Jkᵃ and anti-Cʷ [`10.4084/MJHID.2017.013`]. These matter disproportionately: anti-Jkᵃ is both clinically significant and the most evanescence-prone common specificity (43% non-persistence [`10.2450/2008.0021-08`]), making it a classic DHTR antibody. S/s antigen frequencies in the Saudi donor pool have been characterized (S 59.70%, s 84.07% among Saudi donors; S+s+ 43.89%) [`10.7754/Clin.Lab.2025.250681`] — data the review should use to reason about matching feasibility.

**Expected but poorly captured — antibodies to high-prevalence antigens and unidentified reactivity.** Anti-Ku from a Kell-null allele has been reported in the region [`10.1111/vox.70209`]; and "unidentified" antibodies account for a substantial share of the tally in some Saudi series (17.5% [`10.2147/JBM.S548152`]; "nonspecific" + "inconclusive" = 25% [`10.26719/2007.13.5.1181`]). These are not a nuisance category — they are a marker of reference-laboratory access and should be analyzed as such.

**What is NOT established for this population.** `[UNCERTAIN]`
- Whether Rh variant alleles contribute to Gulf SCD alloimmunization as they do in African-ancestry cohorts [`10.1182/blood-2013-03-490623`] — no Gulf RH genotyping frequency data retrieved this session.
- Whether the Arab-Indian haplotype's higher HbF and milder phenotype [`10.1080/03630269.2020.1739068`] translates into lower transfusion burden and therefore lower alloimmunization. Biologically plausible; **untested in the retrieved literature**. `[HYPOTHESIS]` This is a strong candidate research gap for the review to name.

---

## 5. EVIDENCE TIERS FOR STANDARDS AND PRACTICE STATEMENTS

| # | Statement | Verdict | Evidence tier | Applicable standard | Note |
|---|---|---|---|---|---|
| 1 | Red cell transfusion in SCD requires attention to antigen typing/matching and to prevention and management of alloimmunization and DHTR | ACCURATE | **Guideline recommendation** | American Society of Hematology 2020 guidelines for sickle cell disease: transfusion support, *Blood Adv* 2020;4(2):327–355 [`10.1182/bloodadvances.2019001143`] — **verified this session** | The guideline itself states that the *majority of its 10 recommendations are conditional*, due to paucity of direct high-certainty evidence. Do not upgrade its strength. |
| 2 | Whether serologic or genotypic red cell matching is superior in SCD is unresolved | ACCURATE | **Guideline-identified research priority** | Same ASH 2020 document [`10.1182/bloodadvances.2019001143`] explicitly names "the role of serologic vs genotypic red cell matching" as a research priority | Any claim that genotype matching is standard of care is OVERGENERALIZED. |
| 3 | Prophylactic Rh (C/c/E/e) and K matching substantially reduces, but does not abolish, alloimmunization in chronically transfused patients | ACCURATE | **Emerging-to-established evidence; not universally mandated** | Chou 2013 [`10.1182/blood-2013-03-490623`]; Floch 2023 [`10.1182/bloodadvances.2022009328`]; Jazan Rh/K-matched cohort still 7.6% alloimmunized [`10.2147/IJGM.S444949`]; Bahrain reports continued alloimmunization despite extended phenotypic crossmatching [`10.7759/cureus.113206`] | Never state that Rh/K matching "prevents" alloimmunization. |
| 4 | Extended phenotyping/genotyping for chronically transfused hemoglobinopathy patients is recommended | ACCURATE **as an author/consensus recommendation** | **Emerging evidence + repeated regional recommendation — NOT a verified mandatory standard** | Recommended by Gulf authors [`10.2147/IJGM.S360320`; `10.1155/2023/3239960`; `10.7759/cureus.113206`; `10.7754/Clin.Lab.2024.240827`] | See row 7. |
| 5 | Alloantibodies evanesce, and historical antibody records must be consulted before transfusion | ACCURATE | **Routine standard practice**, supported by primary evidence | [`10.2450/2008.0021-08`]; [`10.14423/SMJ.0000000000000528`]; [`10.1111/trf.18009`]; [`10.1016/j.tracli.2019.02.003`] | The *practice* of honouring historical antibodies is uncontested; the specific standards clause requiring it is **[UNVERIFIED]** here. |
| 6 | A national/regional shared antibody database would reduce DHTR risk | Reasonable | **Emerging evidence / expert recommendation** | Argued in [`10.14423/SMJ.0000000000000528`]; consistent with Gulf reference-lab findings [`10.1111/vox.70209`] | Present as a recommendation, never as an existing requirement. |
| 7 | Any specific AABB, BSH/JPAC, EDQM, ISBT, TIF, CBAHI or Saudi national blood-transfusion-service **clause number, edition, or version** | — | — | **`[UNVERIFIED]`** | **I did not retrieve or read any of these standards documents in this session.** Per my hard rules and CLAUDE.md §1.1–1.2, I will not name a clause, standard number, or edition from memory. If the protocol needs to cite a standards requirement — e.g. a mandated minimum antigen set, a mandated look-back period, or a CBAHI blood-bank requirement — that clause **must be retrieved and verified before Gate G1**, and the review must not assert one jurisdiction's requirement as global. |
| 8 | Saudi/GCC national or CBAHI policy on extended phenotype matching for hemoglobinopathy patients | CANNOT VERIFY | **Local/regional policy — unretrieved** | `[UNVERIFIED]` | The retrieved literature shows *centre-level* policy heterogeneity (ABO/D-only in much of the EMRO region [`10.1016/j.transci.2019.102678`] vs Rh/K programmes in Jazan [`10.2147/IJGM.S444949`]), which is itself evidence that no uniformly enforced national requirement was in effect across the study periods. `[INFERENCE]` Do not upgrade this inference to a statement about current policy. |

---

## 6. FLAGS FOR THE DIRECTOR AND METHODOLOGY AGENT

1. **A Saudi meta-analysis already exists** (12 studies, 1,811 patients, pooled 18.2%, PROSPERO CRD42023440761) [`10.7754/Clin.Lab.2024.240827`], as does a 2026 global adult-SCD meta-analysis (PROSPERO CRD420251167042, pooled 28.9%, I² 88.5%) [`10.3390/jcm15103828`]. **This is a duplication risk that must reach Gate G1.** The defensible niche is not another pooled prevalence — it is (a) GCC-wide rather than Saudi-only coverage, (b) systematic mapping of matching policy and serological methodology as the review's primary object, and (c) explicit characterization of the definitional heterogeneity catalogued in §2. Coordinate with the literature-search-expert's feasibility log.
2. **Language restriction is a real threat.** The existing Saudi meta-analysis restricted to English [`10.7754/Clin.Lab.2024.240827`]. Arabic-language and local-journal reports, Saudi/Gulf theses, and national blood-service reports may be missed. Decide and justify explicitly; PRISMA-ScR requires it.
3. **Preprints/repositories.** At least one relevant Saudi extended-typing report is a Zenodo repository record, not peer-reviewed [`10.5281/zenodo.15222886`]. A grey-literature rule must be pre-specified, and such records must never be cited as peer-reviewed findings.
4. **Antibody-level vs patient-level denominators.** Several Gulf papers report specificity percentages with the *antibody* as denominator and prevalence with the *patient* as denominator, in the same results paragraph. The extraction form must force these apart (F4 vs F7), or the charting will silently mix them.
5. **Do not attempt meta-analysis in a scoping review.** Given I² ≈ 88.5% in the existing global synthesis [`10.3390/jcm15103828`] and the definitional divergence in §2, pooling would be methodologically indefensible here. JBI-style descriptive charting with stratification by definition, methodology and matching policy is the appropriate synthesis.

---

## 7. WHAT I COULD NOT VERIFY IN THIS SESSION

- Any AABB / BSH / JPAC / EDQM / ISBT / TIF / CBAHI standard clause, number, or edition. **`[UNVERIFIED]` — blocks any protocol statement that relies on one.**
- Current Saudi national or GCC-level transfusion policy on minimum antigen matching for hemoglobinopathy patients.
- A national surveillance source ranking Saudi regions by SCD/thalassemia burden (only individual studies' self-descriptions were retrieved).
- Any RHD/RHCE variant allele frequency data for Saudi or Gulf patients or donors.
- Full texts: this scoping was conducted on titles, abstracts and structured metadata retrieved via PubMed and SciSpace. Method-level details (§2.3, §2.4, Section E of the extraction form) are precisely the details that abstracts omit — **full-text retrieval will be required at the extraction stage, and a substantial proportion of these fields should be expected to return `NR`.**

---

*Sources retrieved this session via PubMed and SciSpace; all DOIs above are as returned by those services. Per PubMed terms, article information used here is attributed to PubMed. No figure, citation, guideline number or prevalence value in this document was written from memory.*
