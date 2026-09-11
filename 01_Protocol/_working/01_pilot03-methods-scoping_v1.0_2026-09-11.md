# PILOT-03 — Domain & Laboratory Methods Scoping

**Prepared by:** Transfusion Medicine / Immunohematology reviewer agent
**Date:** 2026-09-11
**Status:** INPUT DOCUMENT for `methodology-protocol-expert`. **Not protocol text.**
**Study under scoping:** Primary, multi-centre observational laboratory study — *RHD* and *RHCE* genotyping in Gulf/GCC blood donors; primary clinically meaningful outcome = serology–genotype concordance; optional extension = match-probability modelling against local transfusion-dependent thalassemia / SCD recipient phenotypes.

> **Source attribution.** Bibliographic records and abstracts in this document were retrieved from **PubMed** (via MCP) and **SciSpace** in this session on 2026-09-11. DOIs are given for every source. Nothing below is cited from memory.

> **Filename deviation (for Director).** The requested filename `PILOT03_METHODS_SCOPING_2026-09-11.md` does not follow the `CLAUDE.md` §3 convention `<stage>_<slug>_v<major>.<minor>_YYYY-MM-DD[_TAG].<ext>`. Written as instructed; recommend renaming to `01_pilot03-methods-scoping_v1.0_2026-09-11.md` before Gate G1.

---

## 0. Evidence-tier key used throughout

| Tier | Meaning in this document |
|---|---|
| **Routine** | Uncontested standard laboratory/transfusion practice |
| **Guideline** | Recommendation of a named body — jurisdiction stated |
| **Emerging** | Promising, not yet standard of care |
| **Local policy** | Saudi CBAHI / SCFHS / institutional SOP — never presented as universal |

Content tags follow `CLAUDE.md` §2 (`[EVIDENCE]`, `[INFERENCE]`, `[UNCERTAIN]`, `[UNVERIFIED]`, `[RECOMMENDATION]`).

---

## 1. PRIOR WORK

### 1.0 IMPORTANT CORRECTION TO THE TASK PREMISE — read first

The task brief states that *"across all six GCC states only two donor-cohort molecular RH studies were found"* and that *"Kuwait, Qatar, Bahrain and UAE have nothing retrievable."*

**This premise is partly incorrect and must be repaired before the protocol is drafted.** Two further GCC donor-cohort molecular RH datasets were retrieved in this session:

1. **Ameen R, Al Shemmari S, Harris S, Teramura G, Delaney M. "Classification of major and minor blood group antigens in the Kuwaiti Arab population." *Transfus Apher Sci* 2020;59(4):102748.** PMID 32527616. DOI [10.1016/j.transci.2020.102748](https://doi.org/10.1016/j.transci.2020.102748).
   - **n = 917 Kuwaiti Arab donors** from the Kuwaiti Bone Marrow Registry, typed on a **single-nucleotide-polymorphism DNA array**.
   - Abstract explicitly reports RH findings: *"The weak D 1, 2, 3 phenotypes were not prevalent in the Kuwaiti Arab population; however, other RHD variants were detected."* Also reports low predicted *FY\*A*, Fy(a−b−) and K-negative rare phenotypes, and MNS frequencies not significantly different from European.
   - **This is a Kuwaiti donor-cohort molecular RH dataset and it is larger than either of the two studies named in the brief.** `[EVIDENCE]`

2. **Alalshaikh M, Alsughayir AH, Alsaif AS, Ababtain SA, Aloyouni SY, Aldilaijan KE, Alsubaie S. "Molecular Background of RhD-positive and RhD-negative Phenotypes in a Saudi Population." *Saudi J Med Med Sci* 2024.** DOI [10.4103/sjmms.sjmms_664_23](https://doi.org/10.4103/sjmms.sjmms_664_23) (retrieved via SciSpace).
   - **n = 136 Saudi donors** (70 RhD+, 66 RhD−); serological D, C, c, E, e; **multiplex-PCR for *RHD* exons 3, 4, 7** and **single-specific-primer PCR for the hybrid Rhesus box** (zygosity).
   - Findings: no RhD− donor carried exons 3/4/7; hybrid Rhesus box detected in **all** RhD− donors and in **79%** of RhD+ donors. `[EVIDENCE]`

**Consequences for PILOT-03 (both are design-level, not cosmetic):**

- **(a) The novelty framing must change.** The gap is *not* "only two studies exist." The defensible gap is: **no multi-centre, prospectively-sampled, standardised-platform, serology-anchored concordance study exists across GCC states; existing work is single-centre, cross-sectionally heterogeneous in platform (SNP array vs. multiplex-PCR vs. Luminex bead), and none reports serology–genotype concordance as a primary outcome with a pre-specified discordance classification.** `[INFERENCE]` That gap survives the corrected premise; "only two studies" does not.
- **(b) `CLAUDE.md` §7 forbids unsupported novelty claims.** Madkhali 2025 self-describes as *"the first molecular characterisation of RHD and RHCE alleles in Saudi Arabia."* That phrase is **the authors' own claim**, and it is in tension with Alalshaikh 2024 (*RHD* molecular work in Saudi donors, published earlier) — which **Madkhali 2025 itself cites** in its Introduction. PILOT-03 must **not** repeat "first in Saudi Arabia" as if it were established fact. If the priority claim is used at all it must be attributed (*"described by its authors as the first…"*) and scoped (*RHD* **and** *RHCE* **combined**). `[UNCERTAIN]` — priority is contested; do not adjudicate it in PILOT-03.
- **(c) Qatar, Bahrain and UAE remain genuinely unretrieved in this session.** That part of the premise held up. `[EVIDENCE — negative finding, subject to §7 search-limitation caveat]`

---

### 1.1 Madkhali *et al.* 2025 — Jazan, Saudi Arabia

**Full citation:** Madkhali MM, Khormy M, Meshi AA, Kameli B, Ghazwani K, Sufyani O, Hakami S, Khawaji Y, Mobarki AA, Essawi K, Hakami W, Alyahyawi Y, Madkhali AM, Dobie G, Hamali HA. "Characterisation of *RHD* and *RHCE* variations in blood donors from Jazan Province, Southwestern Saudi Arabia." *Transfus Med* 2025;36(2):158–164. PMID 41147787; PMCID PMC13077421. DOI [10.1111/tme.70040](https://doi.org/10.1111/tme.70040).

**Access level: FULL TEXT retrieved (PMC open access).** Methods below are read from the article, not inferred.

| Item | What the paper reports |
|---|---|
| **Design** | Retrospective review of blood-donor records, single region (Jazan), **single centre** |
| **Population** | Saudi and non-Saudi (expatriate) donors, Jazan Regional Blood Bank |
| **Sampling period** | **DISCREPANT WITHIN THE PAPER** — abstract says "June 2023 and December 2024"; Methods §2.1 says "June 2023 and March 2024". `[UNCERTAIN]` |
| ***RHD* arm, n** | **60** donors — *selected*: only those **serologically D-negative or weak D** |
| ***RHCE* arm, n** | **354 Saudi + 110 non-Saudi = 464** |
| **DNA** | QIAamp DNA Blood Mini / FlexiGene (Qiagen); 8–80 ng/µL; A260/A280 1.63–2.1; Qubit 4 |
| ***RHD* platform** | **ID RHD XT** (Grifols/Progenika) |
| ***RHCE* platform** | **ID CORE XT** (Grifols/Progenika) — multiplex PCR with biotinylated dCTP, hybridisation to oligonucleotide-probe-coupled microspheres, streptavidin-phycoerythrin, read on **Luminex 200** |
| **Statistics** | Descriptive counts/%; Fisher's exact for Saudi vs non-Saudi; R 2024.12.1+563 |
| **Ethics** | IRB Jazan MoH no. 2402; consent waived (retrospective) |

**Key findings** `[EVIDENCE]`:
- *RHD* (n=60 D−/weak D): *RHD* deletion (*RHD\*01N.01*) **76.7%**; "other than weak D types 1, 2, 3" **18.3%**; **weak D type 1 (*RHD\*01W.1*) 1.7% (1 donor)**; ***RHD\*DIIIa-CE(3-7)-D* (*RHD\*03N.01*) heterozygous 3.3% (2 donors)**.
- *RHCE* alleles, Saudi (708 alleles): *RHCE\*Ce* 44.07%, *RHCE\*ce* 31.92%, *RHCE\*cE* 12.29%, ***RHCE\*ce(733G)* 9.46%**, *RHCE\*ce(733G,1006T)* 0.85%, ***RHCE\*ceAR* 0.71%**, *RHCE\*ce(712G)* 0.42%, *RHD\*r's-RHCE\*ce(733G,1006T)* 0.28%.
- *RHCE* alleles, non-Saudi (220 alleles): only four alleles seen — *RHCE\*Ce* 48.18%, *RHCE\*ce* 30.91%, *RHCE\*cE* 13.18%, *RHCE\*ce(733G)* 7.73%. **No rare/hybrid alleles.**
- Commonest genotype *RHCE\*ce/RHCE\*Ce* 26.84% (Saudi).
- **Predicted** antigen frequencies, Saudi: C 68.36%, E 23.44%, c 80.48%, e 98.84%, **C^w^ 0%**, **V 21.75%**, **hr^S^ 97.75%**, **VS 24.84%**, **hr^B^ 93.24%**.
- Fisher's exact: no significant Saudi vs non-Saudi difference in allele (p=0.5066) or genotype (p=0.8627) distribution.

**What Madkhali 2025 did NOT cover — the extension space for PILOT-03:**

1. ***RHD* genotyping was applied ONLY to serologically D-negative/weak D donors (n=60).** **D-positive donors were never *RHD*-genotyped.** Therefore **partial D in serologically-normal D+ donors is completely uncharacterised** — and partial D in a D+ donor is exactly the situation that produces anti-D in a D+ recipient. This is the single largest uncovered domain.
2. **No *RHD* zygosity determination.** The hybrid Rhesus box was not assayed (contrast Alalshaikh 2024, which did). *RHD\*01N.01* homozygosity vs heterozygosity was not resolved.
3. **No DEL screening.** *RHD\*01EL.01* (c.1227G>A) and other DEL alleles were not targeted. The authors' own limitation section concedes "complete sequencing was not performed, meaning that some hybrid or recombinant alleles may not have been detected."
4. **The 18.3% "other than weak D types 1, 2 and 3" bucket was never resolved to an allele.** The paper's own footnote says "The exact identification may require additional molecular analysis." **This is an unresolved ~18% of the D−/weak D stratum and is the most clinically actionable loose end in the entire GCC literature.** `[INFERENCE]`
5. **No confirmatory serology against the genotype.** Antigen frequencies in Table 4 are **platform-predicted phenotypes**, not serologically determined. **No concordance analysis was performed.** The paper does not report a single discordant case, because discordance was not an outcome.
6. **No anti-D clone panel**, no adsorption-elution, no D-epitope mapping.
7. **No sequencing** (Sanger or NGS) — targeted SNP/bead assay only.
8. **Single centre, single region** (Jazan). Jazan has atypically high African-ancestry admixture and hemoglobinopathy prevalence for Saudi Arabia; its allele frequencies **must not** be extrapolated to Riyadh, the Eastern Province, or other GCC states. `[INFERENCE]`
9. **No linkage to recipient phenotypes.** No match-probability or inventory modelling.
10. **Retrospective record review**, consent waived — no prospective, standardised sampling frame.

> **Same group, subsequent case report (context, not a cohort study):** Madkhali MM *et al.* "First identification and molecular characterisation of a rare D− − donor in Saudi Arabia." *Transfus Med* (e-pub 2026-07-03). PMID 42397021. DOI [10.1111/tme.70098](https://doi.org/10.1111/tme.70098). **n = 1**. Used ID RHD XT + ID CORE XT **then NGS** (RH promoter, exons 1–10, introns 2–3) to resolve homozygous ***RHCE\*CeN.08* (*RHCE\*02N.08*)** with two conventional *RHD\*01*. Relevance to PILOT-03: it demonstrates the **escalation pathway (bead assay → NGS)** that PILOT-03 should formalise, and confirms rare *RHCE* hybrids do occur in this population. `[EVIDENCE]`

---

### 1.2 Al-Riyami *et al.* 2021 — Oman

**Full citation:** Al-Riyami AZ, Al Hinai D, Al-Rawahi M, Al-Hosni S, Al-Zadjali S, Al-Marhoobi A, Al-Khabori M, Al-Riyami H, Denomme GA. "Molecular blood group screening in Omani blood donors." *Vox Sang* 2021;117(3):424–430. PMID 34647328. DOI [10.1111/vox.13204](https://doi.org/10.1111/vox.13204).

**Access level: ABSTRACT ONLY.** Full text was **not** retrievable in this session (no PMC record). Everything below is from the abstract. **Methods detail beyond the abstract is not stated here and must not be inferred.** `[UNVERIFIED — full text not accessed]`

| Item | What the abstract reports |
|---|---|
| **Population** | Omani blood donors |
| **n genotyped** | **180** |
| **n with paired serology + genotype** | **130** (this is the concordance denominator; it varies by system — see below) |
| **Serology** | Typed for MNS, RH (*RHD*/*RHCE*), KEL, FY, JK |
| **Platform** | **RBC-FluoGene vERYfy eXtend** (inno-train) — fluorescence/melting-curve PCR-SSP-format kit |
| **Coverage** | Predicted phenotypes for **70 RBC antigens** across MNS, RH, KEL, FY, JK, DO, LU, YT, DI, VEL, CO, KN |

**Key findings** `[EVIDENCE, abstract-level]`:
- Concordance **>95% in all systems except Fy(b+) at 87%**.
- ***FY\*02N.01*** (GATA *c.-67T>C*) **homozygous in 81/112 (72%)** of genotyped samples.
- **14/112** discrepant FY phenotype/genotype — **13 heterozygous GATA**, 1 wild-type GATA.
- **D variant in 22/121 (18.2%)**; **partial e *c.733C>G* (V+VS+) in 14/120 (11.7%)**.
- Di(a−b+) 99.4%; Js(a−b+) 95.8%; Yt(a+b−) 91.9%; Kn(a+b−) 97.7%.

**What Al-Riyami 2021 did NOT cover — the extension space for PILOT-03:**

1. **RH was not the focus.** It is a **12-system broad screen**, not an RH-depth study. RH results are reported at the level of "D variant 18.2%" — **no *RHD* allele names, no weak D typing, no partial D subclassification are given in the abstract.** `[UNVERIFIED — cannot confirm whether the full text resolves alleles]`
2. **Small n (180 genotyped; 130 with paired serology).** Underpowered for rare-allele frequency estimation.
3. **Single centre** (Sultan Qaboos University Hospital catchment), **Omani nationals only** — expatriates (a very large share of the GCC donor base) excluded.
4. **No *RHD* zygosity**, no DEL screening, no sequencing reported in the abstract.
5. **Concordance was reported as a bare percentage per system.** No pre-specified discordance taxonomy, no per-antigen 95% CI reported in the abstract, no adjudication algorithm described.
6. **No recipient-side linkage / match modelling.**
7. The headline discordance (FY) is a **known assay-design artefact** (GATA heterozygotes with a silenced allele in *cis*), not a novel finding — which illustrates precisely why PILOT-03 needs a discordance *classification* rather than a concordance *number*.

---

### 1.3 Synthesis — what PILOT-03 must add to be non-redundant

| Uncovered domain | Madkhali 2025 | Al-Riyami 2021 | Ameen 2020 (KW) | Alalshaikh 2024 (SA) | PILOT-03 should cover |
|---|---|---|---|---|---|
| *RHD* genotyping of **D-POSITIVE** donors | ✗ (D−/weak only) | Partial (D variant 18.2%, unresolved) | Partial (array) | ✗ | **✓ core** |
| Partial D allele resolution | ✗ | ✗ | ✗ | ✗ | **✓ core** |
| *RHD* zygosity (hybrid Rhesus box) | ✗ | ✗ | ✗ | **✓** | ✓ |
| DEL (*RHD\*01EL.01*) screening | ✗ | ✗ | ✗ | ✗ | **✓ core** |
| Resolution of "other than weak D 1/2/3" | ✗ (18.3% left open) | n/a | ✗ | n/a | **✓ core** |
| *RHCE* variant depth | **✓ (best in region)** | Partial | Partial | ✗ | ✓ confirm + extend |
| **Serology–genotype concordance as primary outcome** | ✗ | Partial (bare %) | ✗ | ✗ | **✓ core** |
| Anti-D clone panel / IAT / adsorption-elution | ✗ | ✗ | ✗ | ✗ | **✓ core** |
| Sequencing escalation for unresolved | ✗ (done in n=1 case report) | ✗ | ✗ | ✗ | **✓** |
| Multi-centre, multi-state | ✗ | ✗ | ✗ | ✗ | **✓ core** |
| Expatriate donors | ✓ (n=110) | ✗ | ✗ | ✗ | ✓ |
| Recipient match-probability model | ✗ | ✗ | ✗ | ✗ | ✓ extension |

---

## 2. TARGET ALLELES

### 2.1 Why the Gulf is a distinctive RH population

The GCC donor pool is an **admixture zone**, not a single ancestry. Contributing streams: Arabian Peninsula Arab; East African / sub-Saharan African (historic and ongoing, heaviest on the Red Sea and Indian Ocean littorals — Jazan, Hijaz, Omani coast); South Asian (Indian, Pakistani, Bangladeshi, Sri Lankan — the largest expatriate bloc in most GCC states); Southeast Asian (Filipino, Indonesian); and Persian/Iranian across the Gulf. `[INFERENCE from the demographic composition reported by Madkhali 2025, which lists its non-Saudi donors as Yemeni 73, Egyptian 16, Sudanese 6, Indian 5, Pakistani 4, Syrian 3, Jordanian 1, Nepali 1, Filipino 1]`

The immunohematological consequence is that **three different variant repertoires co-occur in one inventory**:
- an **African-ancestry *RHCE* repertoire** (*ce* variants, hr^S^/hr^B^-negative phenotypes, *RHD* hybrids) — confirmed present by Madkhali 2025's V 21.75% / VS 24.84% `[EVIDENCE]`;
- an **East/Southeast Asian *RHD* repertoire** (DEL, Asian-type weak D) — expected from the South/SE Asian expatriate stream, **not yet measured in any GCC donor cohort retrieved in this session** `[INFERENCE]`;
- a **European-type weak D repertoire** (weak D types 1/2/3) which the GCC data so far suggest is **uncommon** — Madkhali reported weak D type 1 in 1/60, and Ameen 2020 explicitly reported weak D 1/2/3 as "not prevalent" in Kuwaitis `[EVIDENCE]`.

> **Population-transfer warning (role hard rule).** Every Western or African-American frequency quoted in §6 is flagged as such. **Do not transfer any of them onto a Gulf population without stating that you are doing so.** Conversely, Jazan figures must not be presented as "Saudi" or "Gulf" figures.

### 2.2 *RHD* — weak D

**Alloimmunisation-relevant vs inventory-relevant:** weak D is primarily a **recipient/obstetric** question (should this person get D− blood and RhIG?) and secondarily a **donor labelling** question (a weak D donor unit is D+ and must be labelled D+). For a **donor** study the actionable output is: *which weak D alleles are present, and do any of them carry partial-D risk?*

| Allele group | ISBT notation | Status | Clinical handling |
|---|---|---|---|
| Weak D type 1 | *RHD\*01W.1* / *RHD\*weak D type 1* | Detected in Jazan (1/60) `[EVIDENCE]` | See below |
| Weak D type 2 | *RHD\*01W.2* | Not yet reported in GCC donors | See below |
| Weak D type 3 | *RHD\*01W.3* | Not yet reported in GCC donors | See below |
| Weak D type 4.0 / 4.1 | *RHD\*09.03.01* / *RHD\*09.04* group (DAR-related) | Type 4.1 **reported in a Saudi pregnant woman** (Owaidah 2023) `[EVIDENCE]` | See below |
| Weak partial 4 / DAR cluster | *RHD\*09.xx* | Dominant variant in Brazil (47% of variants) `[EVIDENCE]`; **unmeasured in GCC** | Treat as partial |

**Which weak D types are considered safe to manage as D-positive:**

> **Claim:** "Individuals with molecular weak D types 1, 2, 3, 4.0 or 4.1 may be treated as D-positive."
> **Verdict:** `JURISDICTION-DEPENDENT`
> **Evidence tier:** **Guideline recommendation — US.**
> **Applicable standard:** This is the recommendation of a **joint AABB / College of American Pathologists work group on *RHD* genotyping**, as restated in **Srivastava K, Bueno MU, Flegel WA. *Immunohematology* 2022;38(1):17–24. DOI [10.21307/immunohematology-2022-036](https://doi.org/10.21307/immunohematology-2022-036)**, whose abstract states: *"According to recent work group recommendations, individuals with the serologic weak D phenotypes should be [RHD] genotyped and individuals with molecular weak D types 1, 2, 3, 4.0, or 4.1 should be treated as D+."* `[EVIDENCE]`
> **[UNVERIFIED]** — I did **not** access the work-group's own primary publication in this session, and I have **not** verified any AABB *Standards* clause number, edition, or BSH/JPAC or EDQM equivalent. **The protocol must not cite a clause number.** BSH/JPAC (UK) and EDQM practice on weak D differ in detail and were not verified here.
> **Correction / suggested wording for the protocol:** *"Weak D types 1, 2, 3, 4.0 and 4.1 are managed as D-positive under work-group recommendations adopted in US practice (Srivastava et al., 2022); the corresponding UK (BSH/JPAC), EDQM and Saudi CBAHI positions were not verified for this protocol and must be confirmed before any local policy inference is drawn."*
> **Confidence:** High that the US work-group recommendation exists and covers types 1/2/3/4.0/4.1 (directly quoted from a retrieved abstract). Low-to-none on any clause-level or non-US citation.

**Critical corollary, same source:** for a **novel** *RHD* allele in *trans* to any *RHD* allele other than weak D 1, 2 or 3, Srivastava *et al.* recommend the patient be **treated as D-negative** pending resolution. `[EVIDENCE]` This directly dictates PILOT-03's handling of the "unresolved variant" category.

### 2.3 *RHD* — partial D

**This is the highest-yield uncovered target for PILOT-03.** `[INFERENCE]`

Partial D carriers type as D+ (often normal-strength) on routine serology and are therefore **invisible to a study design that genotypes only D−/weak D donors** — which is precisely the Madkhali 2025 design. Partial D matters on both sides:
- **Alloimmunisation-relevant (recipient side):** a partial D patient transfused with conventional D+ red cells can make anti-D. Owaidah *et al.* 2023 reported **two Saudi obstetric patients typed D+ on routine serology who carried *RHD\*DAU2/DAU6* and weak D type 4.1**, neither of whom received RhIG. DOI [10.23750/abm.v94iS1.14120](https://doi.org/10.23750/abm.v94iS1.14120). `[EVIDENCE]`
- **Inventory-relevant (donor side):** a partial D **donor** unit is a normal D+ unit and is not a safety problem for the recipient. Its value is as a **registry entry** — identifying donors whose own future transfusion/pregnancy needs D− support.

Priority partial-D targets for a Gulf panel:
- ***RHD\*DIIIa* and the *RHD\*DIIIa-CE(4-7)-D* hybrid** — African-ancestry-associated; the hybrid encodes **partial C** and travels in *cis* with *RHCE\*ceS*. Madkhali 2025 already found *RHD\*DIIIa-CE(3-7)-D* (*RHD\*03N.01*) in 2/60 Jazan donors. `[EVIDENCE]`
- ***RHD\*DAU* cluster** (*DAU0* through *DAU6*+). African-ancestry origin; *DAU-4*, *DAU-5*, *DAU-6* each reported at 1.6–2.4% of *RHD* variants in a Brazilian donor cohort (Rodrigues *et al.* 2021, DOI [10.1016/j.transci.2021.103135](https://doi.org/10.1016/j.transci.2021.103135)) `[EVIDENCE — Brazilian, NOT Gulf]`; **DAU2/DAU6 confirmed present in Saudi Arabia** by Owaidah 2023 `[EVIDENCE]`. **Alloimmunisation-relevant** — the DAU cluster contains alleles associated with anti-D.
- ***RHD\*DVI*** — the classic "must be typed D− as a recipient, D+ as a donor" partial D; detected incidentally at 1 in 731 in a US multiethnic donor pool (Flegel *et al.* 2025, DOI [10.1186/s12967-025-06716-8](https://doi.org/10.1186/s12967-025-06716-8)) `[EVIDENCE — US, NOT Gulf]`.
- ***RHD\*DAR* / weak partial 4 cluster** — dominant variant class in Brazil (47%) `[EVIDENCE — Brazilian]`; unmeasured in GCC.
- ***RHD\*DVII*, *RHD\*DIII type 8*, *RHD\*DMH*** — each <4% of variants in the Brazilian cohort `[EVIDENCE — Brazilian]`; include as panel coverage, expect low yield.

### 2.4 *RHD* — DEL

**Alloimmunisation-relevant, and specifically a *donor* safety issue — the one place where a donor-side genotype directly prevents recipient harm.** `[INFERENCE]`

A DEL donor types D− by routine serology, so the unit is labelled D− and transfused to a D− recipient; the unit nevertheless carries RhD protein and can immunise.

- **Proof of harm:** Kim *et al.* documented **primary anti-D immunisation in a D− Korean recipient traced to a DEL donor** carrying *RHD*(K409K, c.1227G>A). *Korean J Lab Med* 2009;29(4):361–5. DOI [10.3343/kjlm.2009.29.4.361](https://doi.org/10.3343/kjlm.2009.29.4.361). `[EVIDENCE]`
- **Frequency, East/Southeast Asia:** in **1,270 serologically D− Thai donors**, ***RHD\*01EL.01*** (Asian-type DEL, c.1227G>A) had allele frequency **7.60%**, second only to *RHD\*01N.01* (86.81%); *RHD\*01N.03* 3.46%. **183/184 *RHD\*01EL.01* carriers were C-positive**, supporting a **C-antigen-triggered screening algorithm**. Nuchnoi *et al.*, *Blood Transfus* 2022;21(3):209–217. DOI [10.2450/2022.0160-22](https://doi.org/10.2450/2022.0160-22). `[EVIDENCE — Thai, NOT Gulf]`
- **Frequency, multiethnic Western donor pool:** **42/2254 (1.9%)** serologic D− donors were *RHD*-gene-positive over 15 years at the NIH Clinical Center; **34/42 (80.9%) were the *RHD*Ψ pseudogene**, 7 carried 5 known *RHD* alleles, 1 a novel deletion. Flegel *et al.*, *J Transl Med* 2025;23(1):686. DOI [10.1186/s12967-025-06716-8](https://doi.org/10.1186/s12967-025-06716-8). `[EVIDENCE — US, NOT Gulf]`

**Why this is a first-class PILOT-03 target:** the GCC donor base contains a very large South/Southeast Asian expatriate component, and **no GCC study retrieved in this session screened for DEL at all.** The C+ enrichment strategy from the Thai data makes DEL screening cheap to bolt on. `[INFERENCE]` `[RECOMMENDATION]`

**Also screen *RHD*Ψ (*RHD\*08N.01*)** — the dominant cause of D-negativity in African-ancestry individuals and the dominant *RHD*-positive finding among serologic D− donors in a multiethnic pool `[EVIDENCE, Flegel 2025]`. It is **inventory-relevant, not alloimmunisation-relevant** (it is non-functional; carriers are genuinely D−) — but misclassifying *RHD*Ψ as a DEL would wrongly discard D− donors, so it must be discriminated. Madkhali 2025's Discussion explicitly notes *RHD*Ψ as the main cause of D-negativity in African backgrounds and that Jazan did **not** follow that pattern. `[EVIDENCE]`

### 2.5 *RHD* zygosity

**Inventory-relevant and counselling-relevant; not directly alloimmunisation-relevant.** `[INFERENCE]`

Determined by assaying the **hybrid Rhesus box** (the recombination product left behind by the *RHD* deletion). Alalshaikh 2024 found the hybrid box in **100%** of Saudi RhD− donors and **79%** of RhD+ donors, implying a high *RHD*-deletion haplotype frequency in Saudis. DOI [10.4103/sjmms.sjmms_664_23](https://doi.org/10.4103/sjmms.sjmms_664_23). `[EVIDENCE]`

Uses: (i) predicting fetal D status / paternal zygosity in HDFN risk assessment; (ii) donor-registry planning — a *RHD\*01N.01* homozygote is a stable D− donor; (iii) **quality control on the *RHD* assay itself** — a zygosity result inconsistent with the exon-scan result flags an assay failure or an unrecognised hybrid. **Madkhali 2025 did not do this.** `[RECOMMENDATION]`

### 2.6 *RHCE* variants

**This is where the African-ancestry admixture bites, and it is alloimmunisation-relevant on the recipient side and inventory-relevant on the donor side simultaneously.** `[INFERENCE]`

Confirmed present in Jazan donors `[EVIDENCE, Madkhali 2025]`:

| Allele | ISBT | Jazan Saudi allele freq | Predicted consequence |
|---|---|---|---|
| ***RHCE\*ce(733G)*** (ceS / ceVS-type) | *RHCE\*01.20.01* / *01.20.02* | **9.46%** | partial c, **V+ VS+**; in some genotypes partial e and hr^B^− |
| ***RHCE\*ce(733G,1006T)*** | *RHCE\*01.20.03* / *01.20.05* | 0.85% | partial c, partial e, **hr^B^−** |
| ***RHCE\*ceAR*** | *RHCE\*01.04* | **0.71%** | partial c, partial e, **hr^S^− hr^B^+**, V weak+ |
| ***RHCE\*ce(712G)*** | *RHCE\*01.05* / *01.08* / *01.09* | 0.42% | partial e (homozygous pattern hr^S^−) |
| ***RHD\*r's-RHCE\*ce(733G,1006T)*** | (hybrid; paper lists *RHCE\*01.20.03*) | 0.28% | **partial C**, partial c, partial e, hr^B^− |
| ***RHCE\*CeN.08*** | *RHCE\*02N.08* | case report, n=1 | **D− − phenotype** (no RhCE antigens) `[EVIDENCE, DOI 10.1111/tme.70098]` |

**Why these matter clinically:**
- **Partial e / hr^S^-negative / hr^B^-negative patients** — typically SCD patients of African ancestry — type e+ on routine serology but can make **anti-hr^S^, anti-hr^B^, anti-e-like** antibodies. These are **clinically significant** (implicated in haemolytic transfusion reactions) `[EVIDENCE — Madkhali 2025 Discussion states alloimmunisation risk if hr^S^+/hr^B^+ cells are given to negative recipients]`, and compatible units are extremely difficult to source because **serological hr^S^/hr^B^ reagents are scarce**. **Donor-side genotyping is the only practical way to build a matched inventory.** `[INFERENCE]` `[RECOMMENDATION]`
- **Partial C from *RHD\*DIIIa-CE(4-7)-D* / *RHD\*r's*** — patients can make **anti-C** despite typing C+. `[EVIDENCE — SciSpace abstract, Chang et al., *Blood* 2024, DOI 10.1182/blood-2024-198223, which states these hybrids "encode partial C" and *RHD\*DIIIa-CEVS(4-7)-D* is "frequently found in patients with sickle cell disease"]`
- **V (RH10) and VS (RH20)** are **low-frequency in Europeans but 26–40% in African-ancestry populations**; Jazan sits at **21.75% / 24.84%** `[EVIDENCE]` — i.e. intermediate, an admixture signature. Anti-V and anti-VS exist but are generally **not** considered as clinically significant as anti-hr^S^/anti-hr^B^. **Do not generalise "RHCE variants are clinically significant" — significance is specificity-by-specificity.**

**Not clinically significant / inventory-only:** C^w^ (RH8) was **absent** in the Jazan cohort (0%) `[EVIDENCE]`; anti-C^w^ is usually of limited clinical significance. Include on the panel for completeness, not for safety.

### 2.7 Alloimmunisation-relevant vs inventory-relevant — summary table

| Target | Alloimmunisation-relevant | Inventory-relevant | Note |
|---|---|---|---|
| Weak D 1/2/3 | Low (managed as D+) | ✓ | Jurisdiction-dependent management |
| Weak D 4.0/4.1, DAR cluster | **✓ (partial-D behaviour)** | ✓ | |
| Partial D (DIIIa, DAU, DVI, DVII) | **✓✓ recipient side** | ✓ | Invisible to D−-only designs |
| **DEL (*RHD\*01EL.01*)** | **✓✓ donor side** | ✓ | Proven primary anti-D `[EVIDENCE]` |
| *RHD*Ψ (*RHD\*08N.01*) | ✗ (truly D−) | **✓** | Must be discriminated from DEL |
| *RHD* zygosity | ✗ | **✓** | + assay QC, HDFN counselling |
| *RHCE\*ce(733G)* / ceVS | ✓ (V/VS, partial c) | ✓ | Moderate significance |
| *RHCE\*ceAR*, *ce(733G,1006T)*, *ce(712G)* | **✓✓ (hr^S^/hr^B^-negative)** | **✓✓** | Hardest units to source |
| *RHD\*r's* hybrids | **✓ (partial C)** | ✓ | |
| C^w^ | Low | ✓ | |

---

## 3. PLATFORMS

**Framing rule for the protocol author:** *a platform that cannot detect hybrid alleles, or cannot phase* RHCE*, is a design-level constraint that must appear in Methods and Limitations — not a footnote.* Every row below states what the platform **cannot** do.

| Platform | Cost | Throughput | Allele coverage | Novel alleles? | **CANNOT detect** |
|---|---|---|---|---|---|
| **PCR-SSP (in-house or kit)** | Lowest per-target; high per-sample if many targets | Low–moderate; gel/manual read | Only the SNPs you design for | **No** | Anything outside designed primers; hybrid breakpoints unless a specific hybrid-spanning primer pair is included; **cannot phase**; cannot distinguish *cis*/*trans* |
| **Multiplex PCR / exon-scan (e.g. exons 3,4,7 + hybrid Rhesus box)** — *Alalshaikh 2024 approach* | Low | Moderate | Gene presence/absence + zygosity | **No** | Point-mutation weak/partial D (a partial D with all exons present looks normal); DEL by c.1227G>A unless separately targeted; *RHCE* entirely |
| **Commercial RBC genotyping arrays / bead assays** — ID CORE XT, ID RHD XT (Luminex); RBC-FluoGene (inno-train); BeadChip | Moderate–high per sample; low labour | **High**, automated, software-called | Fixed, vendor-defined panel; ID CORE XT covers multiple systems | **No — by design** | **Any allele not on the panel.** This produces the "**other than weak D types 1, 2 and 3**" bucket that consumed **18.3%** of Madkhali 2025's *RHD* cohort `[EVIDENCE]`. Novel/rare hybrids; most breakpoints; **phase is inferred by software, not measured** |
| **Sanger sequencing (targeted exons ± introns)** | Moderate per amplicon; expensive if all 10 exons | Low | Whatever you amplify, at base resolution | **Yes, within the amplicon** | Large structural variants and hybrid breakpoints in un-amplified introns; **cannot phase** across distant heterozygous sites; *RHD*/*RHCE* homology causes **co-amplification artefacts unless gene-specific primers are used** — a real and under-reported failure mode |
| **Short-read NGS / targeted panel** | Moderate (at scale) | High | Broad, unbiased across captured region | **Yes** | **Structural variants and hybrids are poorly resolved**; **phasing across the ~175 kb *RHD*–*RHCE* region fails** — this is the explicit motivation given by Chou *et al.*, *Am J Hum Genet* 2022, DOI [10.1016/j.ajhg.2021.12.003](https://doi.org/10.1016/j.ajhg.2021.12.003): short reads "pose a limitation on identification of structural variants, sequencing repetitive regions, phasing of distant nucleotide changes, and distinguishing highly homologous genomic regions" `[EVIDENCE]` |
| **Long-read sequencing (PacBio HiFi ± target capture)** | **Highest**; specialist bioinformatics | Low–moderate | Full *RHD*–*RHCE* locus, phased | **Yes** | Cost, turnaround and expertise are the binding constraints; **not a routine blood-bank capability** `[INFERENCE]` |

**Verified capability claims for the long-read tier** `[EVIDENCE]`:
- Chou *et al.* 2022 (DOI [10.1016/j.ajhg.2021.12.003](https://doi.org/10.1016/j.ajhg.2021.12.003)): targeted capture + PacBio + custom pipeline fully assembled the RH region; 771 assembly markers; direct linkage of coding and intronic variants; *RHD*–*RHCE* haplotype phasing. **Stated limitation: phasing success depends on heterozygous-marker density and was therefore best in African Black individuals.** This is directly relevant to an admixed Gulf cohort.
- Song *et al.*, *Clin Chem* 2025, DOI [10.1093/clinchem/hvaf090](https://doi.org/10.1093/clinchem/hvaf090): HiFi long reads across *RHD*–*RHCE* in 63 individuals; **complete phase resolution in 76.2%**; 96 allelic reference sequences. Argues *RHD* and *RHCE* should be analysed as **a single evolutionary/typing unit** rather than independently. `[EVIDENCE]`
- Chang *et al.*, *Blood* 2024 (abstract), DOI [10.1182/blood-2024-198223](https://doi.org/10.1182/blood-2024-198223): PacBio defined breakpoints of *RHD\*DIIIa-CEVS(4-7)-D*; identified **three intronic SNPs** (g.25293603G>A, g.25293891A>G, g.25310934T>C) with sensitivity 94.74% / 78.95% / 96.49% and specificity ~99.8% for detecting the hybrid — offering a **low-cost hybrid-detection proxy** validated against 912 SCD patients. `[EVIDENCE — note this is a conference abstract, lower evidentiary weight; flag for the citation-verification agent]`

**Concordance-of-platforms caution:** Vege & Westhoff compared automated BeadChip against manual PCR-RFLP/sequencing in 149 *RHD* and 168 *RHCE* referrals; **7 *RHD* and 6 *RHCE* alleles were discordant between manual and automated methods** (DOI [10.1007/978-1-4419-7512-6_11](https://doi.org/10.1007/978-1-4419-7512-6_11)) `[EVIDENCE]`. **Platform-versus-platform discordance is therefore a real and quantifiable phenomenon and must not be conflated with serology–genotype discordance** in PILOT-03's outcome definition. `[INFERENCE]` This is a live risk for a multi-centre study where sites may not share one platform.

**`[RECOMMENDATION]` — tiered architecture for PILOT-03** (for `methodology-protocol-expert` to formalise):
- **Tier 1 (all donors):** serology + a single **commercial multi-system bead/array platform**, harmonised across ALL sites — one platform, one lot policy, one software version. Multi-platform designs will manufacture discordance.
- **Tier 2 (triggered):** *RHD* zygosity (hybrid Rhesus box) on all D−; **DEL/c.1227G>A + *RHD*Ψ discrimination** on all serologic D− (optionally C+-enriched per the Thai algorithm).
- **Tier 3 (triggered):** **Sanger sequencing** for any sample falling into an unresolved bucket ("other than weak D types 1/2/3"), any serology–genotype discordance, any suspected hybrid.
- **Tier 4 (rare, referral):** **NGS / long-read** for novel or unresolvable alleles — exactly the escalation the Jazan group used for their D− − case `[EVIDENCE, DOI 10.1111/tme.70098]`. **Budget an explicit n and a referral pathway**; do not leave this implicit.

---

## 4. NOMENCLATURE

**The protocol must commit, in Methods, to reporting all alleles in current ISBT allele notation, with the exact table version and access date recorded.** `[RECOMMENDATION]`

**Reference resource (verified to exist in this session):** the **ISBT Working Party on Red Cell Immunogenetics and Blood Group Terminology (RCIBGT)**, which maintains the blood-group allele tables. RH tables are published as **"004 RHD Alleles"** and **"004 RHCE Alleles"** at `isbtweb.org`. `[EVIDENCE — pages confirmed to exist via web search]`

**Format requirements the protocol must adopt:**
- Genes italicised, allele names in ISBT form: ***RHD\*01N.01***, ***RHD\*01W.1***, ***RHD\*03N.01***, ***RHD\*01EL.01***, ***RHD\*08N.01***, ***RHCE\*01***, ***RHCE\*02***, ***RHCE\*03***, ***RHCE\*01.20.01***, ***RHCE\*01.04***, ***RHCE\*02N.08***.
- Where a trivial name is used for readability (*ceS*, *ceAR*, *ceVS*, *DAU*, *DIIIa*), **pair it with the ISBT allele name at first use** and thereafter be consistent.
- Antigens in ISBT notation with numeric equivalents at first use: **D (RH1), C (RH2), E (RH3), c (RH4), e (RH5), C^w^ (RH8), V (RH10), hr^S^ (RH19), VS (RH20), hr^B^ (RH31)**. Superscripts must be typeset (hr^S^, not "hrS"); Madkhali 2025's rendering as "hrS"/"hrB" in plain text is a typesetting artefact and **should not be copied**.
- **Flag as obsolete/colloquial and do not use:** "Rh-negative gene", "Du" (use weak D), "Rh factor", bare "D-negative" without specifying serologic vs molecular. Flegel *et al.* 2025 make exactly this distinction the point of their paper — **"serologic D-negative" ≠ "molecularly *RHD*-negative"** `[EVIDENCE]`; PILOT-03 should adopt that vocabulary explicitly.
- **Multi-designation alleles must be reported honestly.** Madkhali 2025 footnotes that *RHCE\*ce(733G)* may map to *RHCE\*01.20.01* **or** *01.20.02* depending on additional changes not assayed. PILOT-03 must report such results as an **allele group**, not collapse to a single designation it did not resolve. `[EVIDENCE]` `[RECOMMENDATION]`

### 4.1 What I could NOT verify — must be confirmed before G1

`[UNVERIFIED]` — **The current ISBT RH allele table version and date could not be confirmed in this session.** What I established and what remains open:

- Web search indicates ISBT **migrated all blood group allele data to a new database system in November 2025**, that the **new ISBT Blood Group Database replaces the PDF allele tables**, and that legacy PDFs remain in an Archive for ~6 months without further update. Search snippets referenced RHD/RHCE documents "dated December 1, 2025" and an upload-history entry "V2.1 12 NOV 2024". **I could not open the ISBT pages themselves to confirm any of this.** Treat all of it as **unconfirmed search-snippet text, not verified fact.**
- **Must be confirmed by Dr. Alanazi or a human before G1:** (i) the exact current version identifier and date of the RH (004) *RHD* and *RHCE* allele tables in the new ISBT database; (ii) whether the new database or the archived PDF is the citable resource; (iii) the correct citation format ISBT now requests.
- A WP business-meeting report appears to exist — **Hyland *et al.*, *Vox Sang* 2026, DOI 10.1111/vox.70148** (Gothenburg, Barcelona + four virtual meetings). **Retrieved only as a web-search result title; NOT verified in PubMed and NOT read.** `[UNVERIFIED]` Do not cite without verification.

> **Hard rule reminder for the protocol author:** do **not** write an AABB *Standards* clause number, a BSH guideline section, an EDQM Guide chapter, or a CBAHI standard number into this protocol unless it has been opened and read. None was verified in this session.

---

## 5. OUTCOME DEFINITION — serology–genotype concordance/discordance

### 5.1 The core design point

Neither Madkhali 2025 (no concordance analysis at all) nor Al-Riyami 2021 (bare per-system percentages) defined a discordance taxonomy. **A single "% concordance" figure is not an analysable outcome** — it mixes together phenomena with completely different clinical meanings and completely different remedies. `[INFERENCE]` Al-Riyami's own data prove this: their headline discordance (Fy(b+) at 87%) was driven almost entirely by **GATA heterozygotes** — an interpretable, expected, assay-design phenomenon, not an error. `[EVIDENCE]`

### 5.2 `[RECOMMENDATION]` Proposed discordance classification

Unit of analysis: **antigen-donor pair** (not donor). Define the denominator explicitly per antigen — it will differ per antigen, as in Al-Riyami (121 for D, 120 for e, 112 for FY).

| Class | Definition | Example | Clinical action |
|---|---|---|---|
| **C — Concordant** | Serologic phenotype = genotype-predicted phenotype | D+ / conventional *RHD\*01* | None |
| **D1 — Serology-positive, genotype-negative** | Antigen detected serologically, not predicted | Reagent cross-reactivity; unrecognised allele | Repeat both; sequence |
| **D2 — Serology-negative, genotype-positive** | Antigen predicted, not detected serologically | **DEL** typed D−; weak antigen below reagent threshold | **Highest priority** — donor-safety implication |
| **D3 — Quantitative discordance** | Same antigen, discrepant strength | Weak D vs conventional D | Grade the reaction; anti-D clone panel |
| **D4 — Qualitative/partial discordance** | Antigen present but genotype predicts **partial** | Partial D typed D+; partial e typed e+ | Recipient-side risk; register donor |
| **D5 — Unresolved genotype** | Platform returns a non-specific bucket | "other than weak D types 1/2/3" | **Escalate to Tier 3/4** — must not be counted as concordant |
| **D6 — Assay/technical failure** | No call, invalid control, insufficient DNA | — | Excluded from concordance denominator; **reported separately with n** |
| **D7 — Platform-vs-platform discordance** | Two molecular methods disagree | BeadChip vs sequencing | **Not** serology–genotype discordance; report separately `[EVIDENCE — Vege & Westhoff]` |

**Pre-specification requirements** (for `methodology-protocol-expert` and `biostatistics-expert`):
- Every discordance must be **adjudicated by a blinded second method** before classification. Pre-specify the adjudication algorithm and the reference standard.
- Pre-specify **whether serology or genotype is the reference standard** for each antigen — and accept that for **DEL it is neither**: serology is wrong by design and genotype is the truth. This asymmetry must be stated, not averaged away.
- **`CLAUDE.md` §1.4:** discordant results are reported with the same prominence as concordant ones. Given that discordance *is* the outcome here, this is straightforward — but the "% concordance >95%" headline must not be allowed to bury the D2/D4/D5 counts.
- Report **95% CI on every proportion** (Wilson or Clopper-Pearson — `biostatistics-expert` to choose and justify) and the **n for every percentage** (§6 of CLAUDE.md).

### 5.3 Serological methods the comparison requires

The genotype arm is meaningless without a **specified, harmonised, multi-centre serology arm**. `[INFERENCE]` Minimum requirements to pre-specify:

1. **Anti-D clone panel — not a single reagent.** Different monoclonal anti-D clones react differently with partial and weak D. Madkhali 2025 used gel microcolumn without specifying clones; the D− − case report used "a panel of monoclonal anti-D reagents" for the sibling paper's phenotyping approach, and Srivastava *et al.* 2022 explicitly used **"a panel of monoclonal anti-D reagents"** to characterise a novel allele's serologic behaviour `[EVIDENCE, DOI 10.21307/immunohematology-2022-036]`. Rodrigues *et al.* 2021 likewise analysed "the serological profile of all *RHD* variant alleles identified using different Anti-D clones" `[EVIDENCE, DOI 10.1016/j.transci.2021.103135]`.
   - **`[RECOMMENDATION]`** Pre-specify **clone identity, manufacturer, lot, IgM/IgG class and method** for every anti-D used at every site. Record them in the dataset as variables, not as a Methods sentence. **Without clone identity, a D3/D4 discordance is uninterpretable.**
   - **[UNVERIFIED]** Which specific clones (e.g. those known to miss DVI) are in routine use at each participating GCC centre — this is a site-survey item, not something I can state.
2. **Direct (immediate-spin/room-temperature) testing vs IAT.** Routine D typing is direct agglutination; **weak D testing requires the indirect antiglobulin phase**. The protocol must state which phase defines "D-positive", "weak D" and "D-negative" **for this study**, because that definition determines the D2 count.
3. **Weak D testing policy.** State whether weak D testing is performed on **all** D− donors (required if D2/DEL is an outcome) and by which method (tube IAT vs gel vs solid phase). **Method sensitivity differs and changes the answer**: de Paula Vendrame *et al.* found that adding a **high-sensitivity solid-phase confirmatory test (Capture-R) reduced the frequency of weak D samples typed as D-negative** — i.e. the serology method itself moves the discordance rate. *Vox Sang* 2019;114(8):869–875. DOI [10.1111/vox.12851](https://doi.org/10.1111/vox.12851). `[EVIDENCE]`
4. **Adsorption–elution for DEL.** DEL is **by definition** detectable only by adsorption-elution. If PILOT-03 claims to identify DEL serologically it must perform adsorption-elution; otherwise DEL is a **genotype-only** finding and the protocol must say so. `[EVIDENCE — Kim et al. 2009 defines DEL as "serologically detectable only by adsorption-elution techniques"]`
5. **C, c, E, e phenotyping** by a stated method, with **dosage** acknowledged: heterozygotes (e.g. *RHCE\*Ce/RHCE\*ce*) give weaker reactions, and weak reactivity must not be auto-classified as discordance. Pre-specify a reaction-grade cut-off.
6. **hr^S^ / hr^B^ / V / VS** — **`[RECOMMENDATION]` state honestly that serological confirmation of these is limited by reagent scarcity.** Madkhali 2025's V/VS/hr^S^/hr^B^ figures are **platform-predicted, not serologically confirmed** `[EVIDENCE]`. PILOT-03 should either (a) obtain reference-laboratory serology for a defined subset, or (b) report these as predicted phenotypes and **exclude them from the primary concordance outcome**. Option (b) is honest; option (a) is stronger. Do not silently present predicted phenotypes as observed.
7. **DAT** on donors with unexpected reactivity, and **quality-control/EQA** records per site.

---

## 6. SAMPLE SIZE INPUTS (for `biostatistics-expert` — NO sample size computed here)

**Instruction to the statistician:** these are **inputs with provenance and uncertainty**, not assumptions to be adopted. Almost every precise figure available is from a **non-Gulf** population. The Gulf-specific figures come from **one region of one country (Jazan)** with **small denominators** and cannot be treated as GCC-representative.

### 6.1 Gulf-derived inputs (highest relevance, weakest precision)

| Parameter | Point estimate | n / denominator | Source | Uncertainty |
|---|---|---|---|---|
| *RHD* deletion among serologic D−/weak D donors | 76.7% | 46/60 | Madkhali 2025, DOI [10.1111/tme.70040](https://doi.org/10.1111/tme.70040) | **n=60, single centre, Jazan only.** Wide CI. Denominator is D−/weak D **only**, not all donors |
| Unresolved "other than weak D 1/2/3" | 18.3% | 11/60 | same | **Not an allele** — a platform bucket. Highly platform-dependent |
| Weak D type 1 | 1.7% | 1/60 | same | Single observation; CI includes near-zero |
| *RHD\*DIIIa-CE(3-7)-D* het | 3.3% | 2/60 | same | Two observations |
| *RHCE\*ce(733G)* allele freq (Saudi) | 9.46% | 67/708 alleles | same | Allele-level; Jazan-specific; **high African admixture region** |
| *RHCE\*ceAR* allele freq (Saudi) | 0.71% | 5/708 | same | 5 observations |
| *RHCE\*ce(733G,1006T)* | 0.85% | 6/708 | same | 6 observations |
| *RHCE\*ce(712G)* | 0.42% | 3/708 | same | 3 observations |
| *RHD\*r's-RHCE\*ce(733G,1006T)* | 0.28% | 2/708 | same | 2 observations |
| Predicted V (RH10) | 21.75% | 354 donors | same | **Predicted, not serologic** |
| Predicted VS (RH20) | 24.84% | 354 | same | **Predicted** |
| Predicted hr^B^ | 93.24% (→ **6.76% hr^B^−**) | 354 | same | **Predicted**; hr^B^− is the scarce-unit driver |
| Predicted hr^S^ | 97.75% (→ **2.25% hr^S^−**) | 354 | same | **Predicted** |
| C^w^ (RH8) | **0%** | 354 | same | Zero-count — needs rule-of-three upper bound |
| "D variant" among Omani donors | **18.2%** | 22/121 | Al-Riyami 2021, DOI [10.1111/vox.13204](https://doi.org/10.1111/vox.13204) | **Abstract only; "D variant" undefined at allele level.** `[UNVERIFIED]` Do **not** use as a partial-D rate |
| Partial e *c.733C>G* (V+VS+), Oman | **11.7%** | 14/120 | same | Abstract only |
| Concordance, all systems except FY, Oman | **>95%** | 130 paired | same | **Bare figure, no CI, no taxonomy** |
| Concordance, Fy(b+), Oman | **87%** | 112 | same | Driven by GATA heterozygosity |
| Hybrid Rhesus box in RhD+ Saudis | **79%** | 70 RhD+ | Alalshaikh 2024, DOI [10.4103/sjmms.sjmms_664_23](https://doi.org/10.4103/sjmms.sjmms_664_23) | n=70; single centre |
| Weak D 1/2/3 in Kuwaiti Arabs | "**not prevalent**" — **no number given** | 917 | Ameen 2020, DOI [10.1016/j.transci.2020.102748](https://doi.org/10.1016/j.transci.2020.102748) | **NR.** Record as `NR`; do not back-calculate (`CLAUDE.md` §1.3) |

### 6.2 Non-Gulf inputs — usable ONLY as bracketing scenarios, never as the planning assumption

| Parameter | Estimate | Population | Source |
|---|---|---|---|
| *RHD\*01EL.01* (Asian DEL) allele freq among serologic D− | **7.60%** | **Thai** (n=1,270 D− donors) | Nuchnoi 2022, DOI [10.2450/2022.0160-22](https://doi.org/10.2450/2022.0160-22) |
| *RHD\*01N.03* among serologic D− | 3.46% | **Thai** | same |
| *RHD*-gene-positive among serologic D− donors | **1.9%** (42/2254) | **US multiethnic** | Flegel 2025, DOI [10.1186/s12967-025-06716-8](https://doi.org/10.1186/s12967-025-06716-8) |
| — of which *RHD*Ψ | 80.9% (34/42) | **US multiethnic** | same |
| *RHD\*DVI* population frequency | **1 in 731** | **US** | same |
| Atypical/discrepant serologic D typing among donors | **0.79%** | **SE Brazil** | Rodrigues 2021, DOI [10.1016/j.transci.2021.103135](https://doi.org/10.1016/j.transci.2021.103135) |
| *RHD\*weak partial 4* share of variants | 47% | **SE Brazil** | same |
| *RHD\*weak D type 3* share of variants | 29.9% | **SE Brazil** | same |
| *RHD\*DAU-4 / -5 / -6* share of variants | 1.6% / 2.4% / 1.6% | **SE Brazil** | same |
| Non-functional *RHD* among D− donors | 18.4% (353/1920 screened) | **Brazil** | de Paula Vendrame 2019, DOI [10.1111/vox.12851](https://doi.org/10.1111/vox.12851) |
| *RHD* homozygous deletion among D− | 99% (198/200) | **Iran** | PMC6369079 — **`[UNVERIFIED]`**, seen only as a web-search snippet; verify before use |

### 6.3 Recipient-side inputs for the match-probability extension

| Parameter | Estimate | n | Source |
|---|---|---|---|
| Alloimmunisation, SCD, Jazan | 12.98% | 385 SCD | Halawani 2022, DOI [10.2147/IJGM.S360320](https://doi.org/10.2147/IJGM.S360320) |
| Alloimmunisation, thalassemia, Jazan | 13.21% | 53 thal | same |
| Autoimmunisation, SCD / thal | 0.52% / 3.77% | same | same |
| Commonest specificities | **anti-E 17.19%, anti-K 14.06%** | 438 total | same |
| Alloimmunisation **after Rh+K-matched** transfusion, Jazan multicentre | **7.6%** (78/1027) | 1027 (906 SCD, 121 thal) | Meshi 2024, DOI [10.2147/IJGM.S444949](https://doi.org/10.2147/IJGM.S444949) |
| Specificities post-matching | **anti-E 25.9%, anti-K 24.1%** of 108 alloantibodies | same | same |

**`[INFERENCE]` for the statistician and for the Discussion:** the **residual 7.6% alloimmunisation despite Rh+K matching** (Meshi 2024) is the strongest available quantitative justification for RH *genotyping* in this population — serological Rh matching demonstrably does not close the gap, and partial antigens are a leading candidate explanation. **It is an inference, not a demonstrated causal link**, and must be written as such (`CLAUDE.md` §7, association vs causation).

### 6.4 Explicit warnings to carry into the SAP

1. **Most rare-allele estimates rest on 1–6 observations.** Precision-based sizing (CI half-width), not power-based hypothesis testing, is likely the appropriate framing. `[RECOMMENDATION]` — `biostatistics-expert` to decide and justify.
2. **Zero counts** (C^w^ 0/354) require an explicit upper-bound method.
3. **Allele-level vs donor-level denominators are mixed in the source literature** (Madkhali reports *RHCE* as 708 alleles from 354 donors). Do not pool the two.
4. **Stratification is not optional.** Gulf donor pools are ancestry-stratified (national vs expatriate; and expatriate is itself many strata). Madkhali 2025 found **no statistically significant** Saudi-vs-non-Saudi difference (p=0.5066 allele, p=0.8627 genotype) **but also found zero rare/hybrid alleles in the 110 non-Saudi donors** — a null test on a small, heterogeneous comparator group. **Treat as inconclusive, not as evidence of no difference.** `[UNCERTAIN]`
5. **Do not transfer Jazan frequencies to other GCC states or to other Saudi regions** in the sizing assumptions without an explicit sensitivity scenario.
6. Multi-centre design implies **clustering by centre**; the design effect must be addressed.

---

## 7. REGISTRY CHECK

**`[UNVERIFIED — registry access not available]`. This is a plain "could not check," per D019 and `CLAUDE.md` §1.9.**

**What I actually attempted in this session:**
1. WebSearch for a ClinicalTrials.gov-registered RHD/RHCE genotyping donor study across GCC states — returned journal articles only, no registry records.
2. WebSearch restricted to `clinicaltrials.gov` for "RHD genotyping blood donor study" — returned one incidental hit, **NCT04156906 ("RHD Genotype Matched Red Cells for Anti-D")**, which is a **US/non-GCC interventional transfusion study, not a GCC donor-cohort genotyping study.** Not relevant as a duplicate.
3. WebSearch for WHO **ICTRP** and the **Saudi Clinical Trial Registry (SCTR, sctr.sfda.gov.sa)** — confirmed both registries **exist** and that SCTR is the national registry for Saudi Arabia, but returned **no study records**.

**What I could NOT do, and why:**
- **I cannot execute a structured query against ClinicalTrials.gov, WHO ICTRP, SCTR, or any other trial/study registry.** WebSearch returns web pages indexed by a general search engine; it is **not a registry search interface**. A negative WebSearch result is **not** evidence that no registered study exists. The `CAPABILITY_REPORT.md` records Crossref, NCBI E-utilities, Europe PMC and the PubMed website as egress-blocked; **registry APIs were not listed as tested, and I did not find a working route to one.**
- **PROSPERO is not applicable** — PILOT-03 is a primary observational study, not a systematic review.

**Honest conclusion:** **I could not determine whether a registered or ongoing GCC RH-genotyping study exists.** The absence of evidence here is an **access limitation**, not a finding.

**`[RECOMMENDATION]` — escalate to Dr. Alanazi, before G1:**
1. Manual search of **ClinicalTrials.gov**, **WHO ICTRP**, and **SCTR (sctr.sfda.gov.sa)**; also consider **OSF Registries** and **ISRCTN** for observational registration.
2. Direct enquiry to the national blood transfusion services / MoH of **Qatar, Bahrain, UAE and Kuwait** — unpublished or in-progress work is the most likely reason those states appear empty.
3. **Decide and record whether PILOT-03 itself will be prospectively registered** (OSF or SCTR) before data collection, per `CLAUDE.md` §5, and record the ID or the reason none was obtained.
4. Contact the **Jazan group (Madkhali/Hamali)** and the **Oman group (Al-Riyami/SQUH)** — they are the only two active RH-molecular groups identified in the GCC, they are the most likely collaborators, **and they are the most likely people to be already doing this study.** `[INFERENCE]`

---

## 8. Open items blocking Gate G1

| # | Item | Owner |
|---|---|---|
| 1 | Task premise "only two GCC donor studies / Kuwait has nothing" is **incorrect** — Ameen 2020 (n=917, Kuwait) and Alalshaikh 2024 (n=136, Saudi) exist. Rationale must be reframed | Director → `methodology-protocol-expert` |
| 2 | Madkhali 2025 "first in Saudi Arabia" priority claim is **contested**; must not be restated as fact | `methodology-protocol-expert` |
| 3 | Madkhali 2025 internal date discrepancy (Dec 2024 vs Mar 2024) | Citation verification agent |
| 4 | **Al-Riyami 2021 full text not accessed** — all methods detail beyond the abstract is unknown | Dr. Alanazi (institutional access) |
| 5 | **Current ISBT RH allele table version/date unconfirmed** | Dr. Alanazi / human |
| 6 | Hyland *et al.* 2026 *Vox Sang* WP report (DOI 10.1111/vox.70148) seen only as a search-result title | Citation verification agent |
| 7 | Chang *et al.* 2024 *Blood* is a **conference abstract** — lower evidentiary weight | Citation verification agent |
| 8 | Iran 99% figure (PMC6369079) is an unverified search snippet | Citation verification agent |
| 9 | **No AABB / BSH / EDQM / CBAHI clause verified in this session** — none may be cited | All agents |
| 10 | **Registry check could not be performed** (D019) | Dr. Alanazi |
| 11 | Anti-D clone inventory at each candidate site unknown | Site survey |
| 12 | Whether hr^S^/hr^B^ reference serology is obtainable — determines whether these enter the primary outcome | Dr. Alanazi |
