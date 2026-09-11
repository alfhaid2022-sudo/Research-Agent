# PILOT-03 — Citation Verification Report (audit finding U17)

**Verifier:** `citation-verification-expert` | **Date:** 2026-09-11 | **Version:** v1.0
**Document verified:** `01_Protocol/_working/01_pilot03-protocol_v0.1_2026-09-11.md` (805 lines)
**Ledger:** `07_References/_working/07_pilot03-citation-ledger_v1.0_2026-09-11.csv` (39 claim-level rows)
**Library:** `07_pilot03-references-verified_v1.0_2026-09-11.ris` / `.bib` (16 records, generated programmatically from the ledger source file)

> **I am accountable for every verdict below. "All references verified" is NOT what this report says.**
> Every reference EXISTS. Not every reference SUPPORTS the sentence it is attached to.

---

## 1. HEADLINE COUNTS

### Bibliographic records (Levels 1–3)

| Level | Result |
|---|---|
| Records cited in the protocol body | **15** |
| Additional record verified because it feeds §6.4's adopted n (Nuchnoi 2022) | 1 |
| **Total records verified** | **16** |
| **L1 — FABRICATED (resolved to nothing)** | **0** |
| L1 — resolved to an authoritative record | **16 / 16** (14 via PubMed, 2 via SciSpace) |
| L2 — metadata accurate on every field the protocol states | **16 / 16** — **no false author, title, journal, year, volume, issue, page, DOI or PMID anywhere** |
| L2 — incomplete citations (fields missing, none wrong) | **7** (§4.2) |
| L3 — retracted / expression of concern | **0 of 14** PubMed-indexed records |
| L3 — retraction status **UNDETERMINABLE** | **2** (Al Lawati thesis; Vege & Westhoff chapter) |

### Claim support (Level 4) — 39 in-text claims

| Verdict | n |
|---|---|
| SUPPORTS | **26** |
| PARTIALLY SUPPORTS | **7** |
| DOES NOT SUPPORT | **3** |
| CONTRADICTS | **1** |
| CANNOT VERIFY — full text needed | **2** |

**13 of 39 claims (33%) are not cleanly supported as written.** All 13 are listed individually below.

---

## 2. FABRICATED CITATIONS

**NONE. Zero fabricated references were found.**

All 16 records resolve to a real, independently retrieved authoritative record. Every PMID and every DOI stated in the protocol resolves to the article the protocol names. The DOIs the brief flagged as highest-risk all resolved:

| Flagged as high-risk | Outcome |
|---|---|
| Vege & Westhoff, `10.1007/978-1-4419-7512-6_11` (book chapter) | **REAL.** Vege S, Westhoff CM. *Identification of Altered RHD and RHCE Alleles: A Comparison of Manual and Automated Molecular Methods.* Book chapter, 2011, American Red Cross. Container: *BeadChip Molecular Immunohematology*, Springer, New York. |
| Al Lawati 2021, `10.24377/LJMU.T.00014274` (grey literature) | **REAL.** Al Lawati M. *Molecular background of serological D negative phenotype in the Omani population.* Doctoral dissertation, Liverpool John Moores University, February 2021. |
| Nuchnoi 2022, `10.2450/2022.0160-22` | **REAL.** PMID 36346882, *Blood Transfus* 2022;21(3):209–217. |
| Kim 2009, `10.3343/kjlm.2009.29.4.361` | **REAL.** PMID 19726900, *Korean J Lab Med* 2009;29(4):361–5. |
| Owaidah 2023, `10.23750/abm.v94iS1.14120` | **REAL.** PMID 36883669, *Acta Biomed* 2023;94(S1):e2023080. |
| Srivastava 2022, `10.21307/immunohematology-2022-036` | **REAL.** PMID 35852060, *Immunohematology* 2022;38(1):17–24. |

---

## 3. CRITICAL AND MAJOR CLAIM-LEVEL FAILURES

### 3.1 CONTRADICTS — 1 claim. **Escalated.**

**C1 — §1.3.3, line 113: "Haffener's *RHD* results are behind egress blocks."**
**This is false.** I retrieved PMC12531907 in full via `get_full_text_article` on 2026-09-11 — the second independent retrieval of that full text in this project. Haffener's *RHD* method and results are fully readable and are quoted in the ledger (R07). Re-audit finding MJ4 required exactly this correction; the protocol still carries the false statement. **The retraction-table row "No GCC study has genotyped serologically D-positive donors for partial D" must be narrowed to Ameen 2020 as the sole unread limb.**

### 3.2 DOES NOT SUPPORT — 3 claims. **All are assertions the source does not make.**

**D1 — §1.1 numerator-correction box, line 66 (Halawani 2022). The correction is itself wrong.**
The box asserts: *"50 is a **combined total across both disease groups**, not an SCD numerator."*
The source states only: *"In the study population, 56 antibodies were detected in 50 immunized patients."* It never says 50 is a cross-group total. Worse, the source's own arithmetic points the other way:
- 12.98% × 385 = **49.97 ≈ 50**; 13.21% × 53 = **7.00**; 50 + 7 = **57** = the stated *"57 patients had positive antibody screening test results"*;
- anti-E in SCD is reported as *"n = 11; 19.64%"* → 11/56, so **the 56 antibodies are the SCD group's**.

The defensible statement is *"the source does not report per-group numerators explicitly; neither reading may be asserted."* The current wording replaced one unsupported number with an unsupported claim in the opposite direction, inside the very box that invokes `CLAUDE.md` §1.3. **Must be rewritten before G1.**

**D2 — §1.2 table, line 81 (Madkhali 2025): "Deepest *RHCE* dataset in the region."**
No such statement in the source. This is an unsearched comparative superlative written in the protocol's own voice inside a table that line 85 tags `[EVIDENCE]` in full. It is a soft universal claim of the class `CLAUDE.md` §7 governs and the Stage 1 gate did not license. Restate as *"the largest RHCE dataset among the records retrieved in this project."*

**D3 — §1.2 table header, line 74 (Al Lawati 2021): counted as one of "six **donor-cohort** molecular red cell genotyping datasets."**
The thesis abstract says: *"A total of 203 dry blood samples on Whatman's FTA card were collected from Omani cohort from different regions of the country."* **The word "donor" does not appear.** The re-audit already recorded donor status as `[UNVERIFIED]`; the table nonetheless asserts it, and the count of six depends on it. Qualify the row or exclude it from the donor-cohort count.

### 3.3 CANNOT VERIFY — 2 claims

**V1 — Rodrigues 2021 (PMID 33867285), §7.3(1).** Co-cited for *"monoclonal anti-D clones differ in their reactivity with partial and weak D."* The abstract states only that the comparison was **performed** (*"the serological profile of all RHD variant alleles identified was analyzed using different Anti-D clones"*) and reports **no clone-level result**. No PMC record exists; Elsevier/ScienceDirect is egress-blocked. **I cannot quote a supporting sentence, therefore I have not verified it.** The claim survives on Srivastava 2022 alone (which I did verify from full text). Mark this co-citation `[UNVERIFIED — full text needed]` or obtain the PDF through Dr. Alanazi's institutional access.

**V2 — Al-Riyami 2021 (PMID 34647328), §1.2 table concordance column:** *"no taxonomy, no CI, no adjudication algorithm described."* This is a **negative claim about a paper read only at abstract level**, stated unqualified in the table cell. No PMC record; Wiley egress-blocked. The gate log itself records 14/112 Fy^b^ discrepancies that *were* adjudicated. Must be qualified to *"not described in the abstract"* (re-audit mn4, still open).

### 3.4 PARTIALLY SUPPORTS — 7 claims (drift, over-reach, modality)

| # | Locus | Defect |
|---|---|---|
| P1 | §1.1 box l.68 (Halawani) | *"the stated group rates imply 57 alloimmunised **plus 4 autoimmunised (61)**"* — the 61 is the protocol's own back-calculation, not in the source. Tag `[INFERENCE]` or delete. |
| P2 | §1.1 box l.68 (Halawani) | *"**three different** anti-E frequencies"* — **overstated ~3×**. 17.19% (all patients, 11/64) and 19.64% (SCD only, 11/56) are different **denominators**, not a contradiction; anti-K is 14.06% in both Abstract and Discussion. The **only** genuine inconsistency is anti-E 17.19% (Abstract) vs 17.9% (Discussion). |
| P3 | §1.2 + §1.3.1 (Haffener) | *"12 discordances investigated with candidate variants proposed"* reads as all 12. Source: candidates proposed in **4**, a genotyping error in **1**, and **7 (all MNS) remain unresolved**. Haffener's 58% non-resolution rate is a directly relevant feasibility datum for §8.4 that the protocol omits. |
| P4 | §7.3(3) l.349 + §17 R6 (de Paula Vendrame) | **Modality drift.** Source: high-sensitivity confirmatory testing *"**can reduce**"* the frequency of weak D typed as D-negative — an inference from *"No weak D type was found in either screening populations."* Protocol says *"**reduced**"*, asserting an observed before/after reduction that was never measured. |
| P5 | §9.5 l.536 (Srivastava) | *"Clone reactivity ... **move the discordance rate**"* — Srivastava is n=1 and reports no rate. Supports "clones vary"; not "moves the rate". |
| P6 | §9.5 l.535 (Madkhali, `[INFERENCE]`) | The East/Southeast Asian repertoire limb rests on a donor composition containing **2 of 110** East/SE Asian donors (Nepal 1, Philippines 1). The African-ancestry limb is well supported by the same paper; the Asian limb is not. |
| P7 | §1.2 + §1.3.1 (Ameen) | n, platform and *"weak D 1, 2, 3 phenotypes were not prevalent"* all verified. But *"no numerator given"* is a claim about a **full text I could not read** (no PMC; Elsevier blocked). Re-label that sub-claim `[UNVERIFIED]`. |

---

## 4. METADATA AND CONSISTENCY REPORT

### 4.1 Duplicates
**No duplicate records.** All 16 keys, 14 PMIDs and 16 DOIs are unique. No record is cited under two identifiers. No citation laundering was found: every claim traces to a primary source, and the two review-like sources (Vege & Westhoff chapter; Kim 2009's DEL background sentence) are used only for statements they themselves make.

### 4.2 Incomplete citations (fields missing — none wrong)

| Record | Missing from the protocol | Correct value |
|---|---|---|
| Meshi 2024 | PMID | **38947563** |
| Kim 2009 | PMID | **19726900** |
| Owaidah 2023 | PMID | **36883669** |
| Srivastava 2022 | PMID | **35852060** |
| Rodrigues 2021 | PMID | **33867285** |
| de Paula Vendrame 2019 | PMID | **31587310** |
| Flegel 2025 | PMID | **40537781** |
| **Vege & Westhoff** | **year, book title, publisher, pages** | 2011; *BeadChip Molecular Immunohematology*; Springer, New York; **pages `[UNVERIFIED — registry blocked]`** |

The `.ris` and `.bib` carry the complete, verified fields.

### 4.3 Defects **in the cited sources themselves** (not PILOT-03 errors — record, do not fix)

1. **Madkhali 2025 — sampling-window discrepancy. This resolves open item U18.** Abstract: *"records between June 2023 and **December 2024**"*; Methods §2.1: *"conducted between June 2023 and **March 2024**"*. The discrepancy is in the **published source**, not a PILOT-03 transcription error. No PILOT-03 number depends on it. **U18 can be closed as `[UNCERTAIN]` against the source.**
2. **Madkhali 2025 — predicted-vs-observed contradiction.** Its Discussion states *"we were able to study the expression of rarely examined Rh antigens **using serology**"*, yet no serology for V/hr^S^/VS/hr^B^ appears anywhere in its Methods (Table 4 is headed *"typed with ID CORE XT"*). **This strengthens §7.3(6) and should be cited explicitly as the reason.**
3. **Halawani 2022 — one genuine internal inconsistency**: anti-E 17.19% (Abstract) vs 17.9% (Discussion). The other apparent discrepancies dissolve on denominator inspection (§3.4 P2).
4. **Rodrigues 2021** is typed by PubMed as `Clinical Trial` — almost certainly an indexing artefact for an observational donor study. **Do not describe it as a trial.**
5. **Vege & Westhoff** analysed **149 RHD and 168 RHCE referrals**, and states *"All samples were problem **referrals** encountered in routine transfusion practice"* — an enriched referral panel from the 2011 BeadChip era. The 7/6 discordance counts are exact, but the **rate is not transferable to PILOT-03's unselected donors**, and §1.3.4(3) / §7.1 should say so.
6. **Nuchnoi 2022** figures are exact but Thai. Asian-type DEL is strongly population-specific (cf. Flegel et al., PMID 42181271: *"The Asian-type DEL is absent from India"*). Its use as a planning input to the adopted **n = 3,000** requires the bracketing sensitivity scenario §6.4 item 5 already demands.

### 4.4 Universal negatives and priority claims — status after this check

- §1.3.2's retrieval statement is correctly framed and its two Saudi limbs are **verified verbatim** (Madkhali's 11/60 bucket footnote; Alalshaikh's *"a more comprehensive analysis of variant RHD alleles ... is required"*).
- **No surviving "the first" was found in the protocol** other than §1.4's prohibition — re-audit CR1 appears remediated in the file I verified.
- **But three soft universals remain unlicensed:** §1.2's *"Deepest RHCE dataset in the region"* (D2), §1.2's unqualified negatives about Al-Riyami (V2), and §1.3.3's false egress claim (C1).
- Priority claims **in the sources** (Al-Riyami: *"This is the first study reporting..."*; Madkhali: *"the first molecular characterisation..."*; Owaidah: *"the first reported cases..."*) are correctly **not** repeated by PILOT-03.

---

## 5. WHAT I COULD NOT VERIFY, AND WHY

| Item | Reason |
|---|---|
| Rodrigues 2021 clone-reactivity **result** | No PMC record; Elsevier egress-blocked |
| Ameen 2020 full text (weak D numerator, array panel/DEL coverage) | No PMC record; Elsevier egress-blocked |
| Al-Riyami 2021 full text (taxonomy/CI/adjudication) | No PMC record; Wiley egress-blocked |
| Al Lawati 2021 beyond its abstract; degree level; donor status | `researchonline.ljmu.ac.uk` **egress-blocked** (tested this session, confirmed) |
| Vege & Westhoff page range and editors | Springer egress-blocked; a page range appears in a search-result snippet only, which is **not** acceptable verification under my role rules |
| DOI registration / Crossref deposit for any record | **Crossref egress-blocked.** Every DOI was validated by resolving through PubMed's own identifier record or SciSpace, not through the registry |
| Retraction/erratum status of Al Lawati 2021 and Vege & Westhoff | Neither is PubMed-indexed; no reachable retraction register |
| **Erratum linkage for the 14 PubMed records** | PubMed's `CommentsCorrections` field is **not exposed** by this MCP server. My L3 screen used `article_types` (no `Retracted Publication` / `Expression of Concern` on any record) plus title-level searching. **A published erratum cannot be positively excluded.** |

---

## 6. VERDICT ON U17

> ### U17 CANNOT BE CLOSED YET. It is, however, now **specifically** rather than globally open.

**What U17 can be downgraded from:** the blanket standing `[UNVERIFIED]` on the reference list as a whole (protocol line 50). That is discharged — **every** record exists, **every** stated identifier resolves, and **no** record is retracted. The fabrication risk that U17 was written to catch is **closed with a zero finding**.

**What blocks closure — 6 items, all correctable inside the protocol:**

| # | Blocker | Fix |
|---|---|---|
| 1 | **C1** §1.3.3 l.113 states Haffener's *RHD* results are egress-blocked. **False.** | Delete; narrow the row to Ameen 2020 |
| 2 | **D1** §1.1 correction box asserts an unsupported cross-group reading of "50 immunized patients" | Rewrite as "per-group numerators not explicitly reported; neither reading assertable" |
| 3 | **D2** §1.2 "Deepest *RHCE* dataset in the region" | Restate as retrieval-relative |
| 4 | **D3** §1.2 counts Al Lawati as a **donor** cohort without support | Qualify or remove from the count of six |
| 5 | **V1/V2** Rodrigues 2021 and Al-Riyami 2021 claims unverifiable at full-text level | Tag `[UNVERIFIED — full text needed]` or obtain institutional PDFs |
| 6 | **P1–P7** seven drift/over-reach corrections | Apply the specific rewrites in §3.4 |

Items 1–4 change what the protocol may claim. Items 5–6 change how precisely it must claim it. **None requires new literature.**

**Separately closable now:** **U18 (Madkhali date discrepancy) is RESOLVED** — the discrepancy is real and is a defect in the published source, not in PILOT-03 (§4.3 item 1).

**I am not the approving authority.** This report goes to the Principal Research Director and to Dr. Alanazi. No citation in this protocol should be treated as verified support for its sentence except as recorded, claim by claim, in the ledger CSV.

---

## 7. ATTRIBUTION

Bibliographic and abstract data for 14 of 16 records, and full texts for PMC9017690, PMC13077421, PMC12531907 and PMC9364384, were obtained **from PubMed / PubMed Central**. According to PubMed, the records verified here are:
PMID 38947563 ([DOI](https://doi.org/10.2147/IJGM.S444949)); 35450032 ([DOI](https://doi.org/10.2147/IJGM.S360320)); 32527616 ([DOI](https://doi.org/10.1016/j.transci.2020.102748)); 34647328 ([DOI](https://doi.org/10.1111/vox.13204)); 39055072 ([DOI](https://doi.org/10.4103/sjmms.sjmms_664_23)); 41147787 ([DOI](https://doi.org/10.1111/tme.70040)); 40916454 ([DOI](https://doi.org/10.1111/trf.18401)); 19726900 ([DOI](https://doi.org/10.3343/kjlm.2009.29.4.361)); 36883669 ([DOI](https://doi.org/10.23750/abm.v94iS1.14120)); 35852060 ([DOI](https://doi.org/10.21307/immunohematology-2022-036)); 33867285 ([DOI](https://doi.org/10.1016/j.transci.2021.103135)); 31587310 ([DOI](https://doi.org/10.1111/vox.12851)); 40537781 ([DOI](https://doi.org/10.1186/s12967-025-06716-8)); 36346882 ([DOI](https://doi.org/10.2450/2022.0160-22)). Population context for Asian-type DEL cited from PMID 42181271 ([DOI](https://doi.org/10.1016/j.isci.2026.115717)).
The two non-PubMed records were verified via **SciSpace**: Al Lawati 2021 ([DOI](https://doi.org/10.24377/LJMU.T.00014274)) and Vege & Westhoff 2011 ([DOI](https://doi.org/10.1007/978-1-4419-7512-6_11)).
