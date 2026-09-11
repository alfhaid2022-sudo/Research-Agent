# PILOT-02 FEASIBILITY SEARCH LOG — Stage 1 GO/NO-GO duplication & volume check

**Proposed topic:** Donor-side red cell antigen architecture in Gulf/GCC populations and its implications for extended matching of transfusion-dependent patients (donor antigen/phenotype frequencies; RH variant alleles RHD/RHCE; donor–recipient antigen mismatch; feasibility/inventory implications of extended matching in Gulf blood services).

**Executed by:** literature-search-expert agent (Claude Opus 5), on behalf of Dr. Fehaid M. Alanazi
**Date of all searches:** 2026-09-11
**Databases actually searched:** PubMed (via MCP `mcp__PubMed__search_articles`); SciSpace semantic index (via MCP `mcp__SciSpace__search-papers`)
**Databases NOT searched (no licensed access / network egress blocked in this environment):** Scopus, Embase, Web of Science, Cochrane Library/CENTRAL, ProQuest theses, Saudi Digital Library, ICTRP, ClinicalTrials.gov, Google Scholar. Direct HTTP to eutils.ncbi.nlm.nih.gov, api.crossref.org and Europe PMC is blocked at CONNECT (403). **No count from any of those sources is reported or implied anywhere in this log.**
**Platform constraint:** the PubMed MCP interface rejects queries with >20 Boolean operators (`INVALID_QUERY`). One string (P11-FAILED) had to be shortened; both the failed and the executed versions are recorded.
**Relationship to prior work:** this log does NOT repeat the alloimmunization-prevalence strings already run for PILOT-01; see `/home/user/Research-Agent/02_Search/_working/FEASIBILITY_SEARCH_LOG.md` (strings S1–S14, same date).

---

## Q1 — DOES AN EQUIVALENT REVIEW ALREADY EXIST?

### P1 — Donor antigen/phenotype frequency + review filter (global, no geography)
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** review terms / Review[PT] | **Date range:** inception–2026-09-11
- **String (verbatim):**
  `("blood donors"[Title/Abstract] OR donor[Title/Abstract]) AND ("antigen frequency"[Title/Abstract] OR "phenotype frequency"[Title/Abstract] OR phenotyping[Title/Abstract]) AND ("blood group"[Title/Abstract] OR "red cell"[Title/Abstract] OR "red blood cell"[Title/Abstract]) AND (review[Title/Abstract] OR Review[Publication Type] OR "systematic review"[Title/Abstract] OR "meta-analysis"[Title/Abstract])`
- **`query_translation`:** `("blood donors"[Title/Abstract] OR "donor"[Title/Abstract]) AND ("antigen frequency"[Title/Abstract] OR "phenotype frequency"[Title/Abstract] OR "phenotyping"[Title/Abstract]) AND ("blood group"[Title/Abstract] OR "red cell"[Title/Abstract] OR "red blood cell"[Title/Abstract]) AND ("Review"[Title/Abstract] OR "Review"[Publication Type] OR "systematic review"[Title/Abstract] OR "meta-analysis"[Title/Abstract])`
- **Records retrieved: 17**
- Key hit: 42704814.

### P2 — RH variant terms + wider Middle East/North Africa geography
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `(RHD[Title/Abstract] OR RHCE[Title/Abstract] OR "RH variant"[Title/Abstract] OR "RH variants"[Title/Abstract] OR "partial D"[Title/Abstract] OR "weak D"[Title/Abstract] OR "RHD variant"[Title/Abstract]) AND (Arab[Title/Abstract] OR Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Emirates[Title/Abstract] OR "Middle East"[Title/Abstract] OR Gulf[Title/Abstract] OR Iran[Title/Abstract] OR Egypt[Title/Abstract])`
- **Records retrieved: 94**
- **CRITICAL PRECISION WARNING (recorded because it changes interpretation):** the token `RHD` is also the standard abbreviation for **rheumatic heart disease**. Inspection of retrieved titles showed heavy contamination (rheumatic fever/rheumatic heart disease records in Saudi/Egyptian populations). This count is **not** a valid estimate of RH-variant literature volume and must not be quoted as one. Corrected strings are P3 and P4.

### P3 — RH variant + GCC MeSH geography (still RHD-abbreviation contaminated)
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `(RHD[Title/Abstract] OR RHCE[Title/Abstract] OR "RH variant"[Title/Abstract] OR "partial D"[Title/Abstract] OR "weak D"[Title/Abstract] OR "D variant"[Title/Abstract] OR "RH genotyping"[Title/Abstract]) AND ("Saudi Arabia"[MeSH Terms] OR "Kuwait"[MeSH Terms] OR "Qatar"[MeSH Terms] OR "Bahrain"[MeSH Terms] OR "Oman"[MeSH Terms] OR "United Arab Emirates"[MeSH Terms])`
- **Records retrieved: 26**
- **Title inspection of the first 20 records returned by the metadata tool:** 14/20 were off-topic (rheumatic heart disease, COVID-19/ABO association, transfusion-transmitted infection, one microbiology record). Genuine RH-relevant GCC records in this set: 41147787, 36883669, 41473724 (ABO/Rh/Kell donor antigens, serology), 41670517 (MNS S/s antigens), 39373300 (extended antigen typing, Omani SCD patients). **Screened relevant ≈ 5–6 of 26.**

### P4 — De-contaminated RH variant string (`RHD gene` etc.) + Arab/GCC
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `("RHD gene"[Title/Abstract] OR "RHCE"[Title/Abstract] OR "RH variant"[Title/Abstract] OR "RHD variant"[Title/Abstract] OR "partial D"[Title/Abstract] OR "weak D"[Title/Abstract] OR "DEL phenotype"[Title/Abstract] OR "RHD alleles"[Title/Abstract] OR "RHD allele"[Title/Abstract]) AND (Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Omani[Title/Abstract] OR "United Arab Emirates"[Title/Abstract] OR Arab[Title/Abstract] OR "Gulf Cooperation"[Title/Abstract])`
- **Records retrieved: 11** (PMIDs 42397021, 41147787, 39373300, 39055072, 37122416, 36883669, 34647328, 33098316, 32527616, 31724935, 23362929)
- This is the single most informative count in this log for Q2(b).

### P5 — Red cell antigen/phenotype frequency + Middle East geography
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `("red cell"[Title/Abstract] OR "red blood cell"[Title/Abstract] OR "blood group"[Title/Abstract] OR erythrocyte[Title/Abstract]) AND ("antigen frequency"[Title/Abstract] OR "antigen frequencies"[Title/Abstract] OR "phenotype frequency"[Title/Abstract] OR "phenotype frequencies"[Title/Abstract] OR "antigen profile"[Title/Abstract]) AND (Arab[Title/Abstract] OR "Middle East"[Title/Abstract] OR Saudi[Title/Abstract] OR Gulf[Title/Abstract] OR Iran[Title/Abstract] OR Egypt[Title/Abstract] OR Kuwait[Title/Abstract] OR Oman[Title/Abstract] OR Qatar[Title/Abstract] OR Emirates[Title/Abstract] OR Bahrain[Title/Abstract])`
- **Records retrieved: 13**

### P6 — Regional blood/transfusion evidence-synthesis duplication check
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** review terms in title/abstract or review in Title
- **String (verbatim):**
  `("blood group"[Title/Abstract] OR "red cell"[Title/Abstract] OR "blood donor"[Title/Abstract] OR "blood donors"[Title/Abstract] OR transfusion[Title/Abstract]) AND (Arab[Title/Abstract] OR "Middle East"[Title/Abstract] OR "Eastern Mediterranean"[Title/Abstract] OR Gulf[Title/Abstract] OR GCC[Title/Abstract]) AND ("systematic review"[Title/Abstract] OR "scoping review"[Title/Abstract] OR "narrative review"[Title/Abstract] OR "a review"[Title] OR review[Title])`
- **Records retrieved: 42**

### P7 — RH system + review + population-frequency concept (global)
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** review in Title, or SR/scoping review in title/abstract
- **String (verbatim):**
  `("Rh-Hr Blood-Group System"[MeSH Terms] OR "Rh variant"[Title/Abstract] OR RHCE[Title/Abstract] OR "RHD genotyping"[Title/Abstract] OR "RHD alleles"[Title/Abstract]) AND (review[Title] OR "systematic review"[Title/Abstract] OR "scoping review"[Title/Abstract]) AND (population[Title/Abstract] OR ethnic[Title/Abstract] OR frequency[Title/Abstract] OR frequencies[Title/Abstract] OR distribution[Title/Abstract])`
- **Records retrieved: 19**
- Key hit: **39967527** (see Q1 duplication table).

### P8 — Extended matching / genotyping feasibility + review filter (any region)
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** review terms
- **String (verbatim):**
  `("antigen matching"[Title/Abstract] OR "antigen-matched"[Title/Abstract] OR "extended matching"[Title/Abstract] OR "red cell genotyping"[Title/Abstract] OR "blood group genotyping"[Title/Abstract] OR "extended phenotyping"[Title/Abstract]) AND (feasibility[Title/Abstract] OR inventory[Title/Abstract] OR "donor pool"[Title/Abstract] OR implementation[Title/Abstract] OR "cost"[Title/Abstract]) AND (review[Title] OR "systematic review"[Title/Abstract] OR "scoping review"[Title/Abstract] OR "narrative review"[Title/Abstract])`
- **Records retrieved: 12**
- Key hits: 41631680, 41833928, 42704814, 39535318, 42194795, 34390866, 33765748.

### P9 — Matching / inventory-modelling volume (no review filter, any region)
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `("antigen-matched"[Title/Abstract] OR "antigen matching"[Title/Abstract] OR "extended matching"[Title/Abstract] OR "phenotype-matched"[Title/Abstract] OR "genotype-matched"[Title/Abstract]) AND ("blood inventory"[Title/Abstract] OR inventory[Title/Abstract] OR "donor pool"[Title/Abstract] OR feasibility[Title/Abstract] OR "supply"[Title/Abstract] OR modelling[Title/Abstract] OR modeling[Title/Abstract] OR simulation[Title/Abstract])`
- **Records retrieved: 130**

### P10 — Author check: prior work by the PI in this exact space
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):** `Alanazi FM[Author] AND (blood group[Title/Abstract] OR antigen[Title/Abstract] OR transfusion[Title/Abstract])`
- **`query_translation`:** `(alanazi, fm[Author] OR alanazi fm[Author]) AND ("blood group"[Title/Abstract] OR "antigen"[Title/Abstract] OR "transfusion"[Title/Abstract])`
- **Records retrieved: 3** (39967527, 42570442, 39662013)
- **Caveat:** `Alanazi FM[Author]` is not disambiguated by ORCID and may conflate distinct individuals; and it will miss the PI's papers where the initials are indexed differently. Treat 3 as a floor, not a complete bibliography.

### P11 — FAILED (recorded for transparency)
- **Database:** PubMed (MCP) | **Date:** 2026-09-11
- **String (verbatim):**
  `("blood donor"[Title/Abstract] OR "blood donors"[Title/Abstract] OR donors[Title/Abstract]) AND ("blood group"[Title/Abstract] OR phenotype[Title/Abstract] OR phenotypes[Title/Abstract] OR antigen[Title/Abstract] OR antigens[Title/Abstract]) AND (frequency[Title/Abstract] OR frequencies[Title/Abstract] OR prevalence[Title/Abstract] OR distribution[Title/Abstract]) AND (Omani[Title/Abstract] OR Kuwaiti[Title/Abstract] OR Qatari[Title/Abstract] OR Bahraini[Title/Abstract] OR Emirati[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR "United Arab Emirates"[Title/Abstract])`
- **Result:** **NOT EXECUTED** — `INVALID_QUERY`, 21 operators vs max 20. No count obtained. Shortened and re-run as P14.

### P12 — Title-phrase verification of the PI's own review
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):** `"Rh and Kell Blood Group Antigen Frequencies in Saudi Arabia"[Title]`
- **Records retrieved: 0** — **ZERO-RESULT SEARCH, REPORTED.** This is a **false negative caused by the string, not by the literature**: the record exists (PMID 39967527) and was confirmed by direct metadata retrieval. The PubMed `[Title]` phrase index did not match the full title string. Documented as a worked example of why a null result must be inspected before it is believed.

---

## Q2 — PRIMARY LITERATURE VOLUME

### P13 — (a) Saudi donor red cell antigen/phenotype frequency
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `("blood donors"[MeSH Terms] OR "blood donor"[Title/Abstract] OR donors[Title/Abstract]) AND ("Rh"[Title/Abstract] OR Kell[Title/Abstract] OR Kidd[Title/Abstract] OR Duffy[Title/Abstract] OR MNS[Title/Abstract] OR "blood group"[Title/Abstract] OR phenotype[Title/Abstract]) AND (frequency[Title/Abstract] OR frequencies[Title/Abstract] OR prevalence[Title/Abstract] OR distribution[Title/Abstract] OR incidence[Title/Abstract]) AND ("Saudi Arabia"[MeSH Terms] OR Saudi[Title/Abstract])`
- **Records retrieved: 53** (unscreened; includes ABO-only, TTI-association and COVID-19/ABO records that would not be eligible)

### P14 — (a) Non-Saudi GCC donor antigen/phenotype frequency, MeSH geography
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `("blood donors"[MeSH Terms] OR "blood donor"[Title/Abstract] OR donors[Title/Abstract]) AND (Kell[Title/Abstract] OR Kidd[Title/Abstract] OR Duffy[Title/Abstract] OR MNS[Title/Abstract] OR "blood group"[Title/Abstract] OR phenotype[Title/Abstract] OR "Rh"[Title/Abstract]) AND (frequency[Title/Abstract] OR frequencies[Title/Abstract] OR prevalence[Title/Abstract] OR distribution[Title/Abstract]) AND ("Kuwait"[MeSH Terms] OR "Qatar"[MeSH Terms] OR "Bahrain"[MeSH Terms] OR "Oman"[MeSH Terms] OR "United Arab Emirates"[MeSH Terms])`
- **Records retrieved: 4**
- **Note:** MeSH geographic indexing is clearly incomplete for this region — known eligible records (e.g. 31745413, Omani donors) did **not** appear. Re-run as free-text in P15. This is itself evidence of regional under-indexing.

### P15 — (a) Non-Saudi GCC donor antigen/phenotype frequency, free-text geography
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `("blood donor"[Title/Abstract] OR "blood donors"[Title/Abstract]) AND ("blood group"[Title/Abstract] OR phenotype[Title/Abstract] OR antigen[Title/Abstract]) AND (frequency[Title/Abstract] OR frequencies[Title/Abstract] OR prevalence[Title/Abstract]) AND (Omani[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Emirati[Title/Abstract] OR "United Arab Emirates"[Title/Abstract])`
- **Records retrieved: 14** (PMIDs 41246749, 37122416, 34964319, 34647328, 31745413, 22691239, 17143367, 16888395, 16533987, 16371052, 16029430, 15573057, 1412910, 7112657). Note 6/14 predate 2007; several are ABO/RhD only.

### P16 — Donor–recipient antigen mismatch concept, Gulf/Arab
- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `("donor-recipient"[Title/Abstract] OR "donor recipient"[Title/Abstract] OR mismatch[Title/Abstract] OR "antigen mismatch"[Title/Abstract] OR "phenotype match"[Title/Abstract] OR "match probability"[Title/Abstract]) AND ("red cell"[Title/Abstract] OR "red blood cell"[Title/Abstract] OR "blood group"[Title/Abstract] OR transfusion[Title/Abstract]) AND (Saudi[Title/Abstract] OR Gulf[Title/Abstract] OR Arab[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Oman[Title/Abstract] OR Bahrain[Title/Abstract] OR Emirates[Title/Abstract])`
- **Records retrieved: 5** (42403973, 41151152, 40854798, 37524584, 31249230). **The donor–recipient mismatch/inventory-modelling limb of the proposed topic is close to empty in the Gulf.**

---

## SciSpace searches (non-PubMed coverage)

### P17
- **Database:** SciSpace (semantic, 280M+) | **Date:** 2026-09-11 | **Filters:** none available
- **Question (verbatim):** `Is there a published systematic or scoping review of red blood cell antigen and phenotype frequencies among blood donors in Arab, Gulf or Middle Eastern populations?`
- **Records returned: 10** (SciSpace returns a ranked set, no denominator — not usable for volume estimation)
- **Decisive hits:**
  - Alanazi FM. *Rh and Kell Blood Group Antigen Frequencies in Saudi Arabia: a Review.* Clin Lab 71(2), 2025. DOI 10.7754/Clin.Lab.2024.240914 — **subsequently verified in PubMed as PMID 39967527, article type Journal Article / Review.**
  - Zaid R, Mustafa I. *The distribution of the ABO and RH blood groups among different populations in the MENA region: A review.* 2020. DOI 10.36462/H.BIOSCI.20221. `[UNVERIFIED]` — not retrievable in PubMed; SciSpace record only.
  - Rophina M, Pandhare KR, Scaria V. *A comprehensive characterization of blood group antigen variants in the Middle Eastern population genomes.* medRxiv preprint, 2023. DOI 10.1101/2023.11.20.23298777. **Preprint, not peer-reviewed** — includes the `alnasab` Arab/Persian blood group allele resource.

### P18
- **Database:** SciSpace | **Date:** 2026-09-11 | **Filters:** none available
- **Question (verbatim):** `Has anyone reviewed RHD and RHCE variant allele frequencies in Middle Eastern or Arab populations and their implications for transfusion and RhD typing?`
- **Records returned: 10**
- No Gulf-specific RH-variant review found. Retrieved instead **primary** North African RH-variant work (Morocco: Vox Sang 2019, DOI 10.2450/2018.0153-18; Tunisia: DOI 10.1111/TME.12254, DOI 10.1016/J.TRACLI.2014.10.004) and one global weak-D narrative review (DOI 10.5493/wjem.v15.i2.102345).

---

## Reviews identified as duplication threats (all verified in PubMed unless flagged)

| PMID | Year | Citation | Type | Why it threatens PILOT-02 |
|---|---|---|---|---|
| **39967527** | 2025 | **Alanazi FM. Rh and Kell Blood Group Antigen Frequencies in Saudi Arabia: a Review. Clin Lab 71(2). DOI 10.7754/Clin.Lab.2024.240914** | Journal Article / Review (described in its own abstract as a systematic analysis; PubMed/Embase/Cochrane; 7 studies, 2019–2024) | **Self-duplication.** The PI has already published the Saudi donor Rh+Kell antigen-frequency review, and it already discusses donor recruitment, inventory management and personalised transfusion protocols. |
| 41631680 | 2026 | Carminati CR et al. What is the best approach to blood transfusion in sickle cell disease? A scientometric analysis and literature review. Transfus Med 36(3):211–221. DOI 10.1111/tme.70064 | Review (scientometric + narrative; 224 records, 26 studies) | Occupies the phenotyping-vs-genotyping / RH-variant / cost-feasibility argument. |
| 41833928 | 2026 | Castillo LS, Quintero Santacruz M. Red cell alloimmunization in resource-constrained settings. Transfus Clin Biol 33(2):123–127. DOI 10.1016/j.tracli.2026.03.002 | Critical review, PRISMA-informed | Already proposes a risk-adapted **tiered antigen-matching framework** driven by feasibility and cost. |
| 39535318 | 2024 | ICTMG. Red cell specifications for blood group matching in patients with haemoglobinopathies. Br J Haematol 206:94–108 | SR + GRADE guideline | Owns the matching-policy question globally. |
| 42704814 | 2026 | Hjazi AM. Beyond antigen matching: compatibility intelligence theory. Hematology 31(1):2729588. DOI 10.1080/16078454.2026.2729588 | Narrative review (Saudi author) | A Saudi-authored conceptual review already published in the donor–recipient matching space. |
| 40069098 | 2025 | Al-Allawi N et al. Hemoglobin 49(2):126–140 | Systematic Review | The PILOT-01 blocker; its final sentence is the origin of PILOT-02. |
| 3086472466 (SciSpace id) | 2020 | Zaid R, Mustafa I. ABO and RH blood groups in the MENA region: A review. DOI 10.36462/H.BIOSCI.20221 | Review | ABO/RhD regional distribution already reviewed. `[UNVERIFIED]` — SciSpace record only, not found in PubMed. |

---

## GCC RH-variant / molecular RH primary studies actually identified (from P3, P4, P15, P18)

| PMID | Study | Design note |
|---|---|---|
| 41147787 | Madkhali MM et al. Characterisation of RHD and RHCE variations in blood donors from Jazan Province, SW Saudi Arabia. Transfus Med 2025. DOI 10.1111/tme.70040 | 60 D-neg/weak-D + 354 Saudi and 110 non-Saudi donors genotyped. States it is the first molecular characterisation of RHD/RHCE alleles in Saudi Arabia. |
| 34647328 | Al-Riyami AZ et al. Molecular blood group screening in Omani blood donors. Vox Sang 117(3):424–430, 2021. DOI 10.1111/vox.13204 | 180 Omani donors, multi-system genotyping incl. RH. |
| 39055072 | Alalshaikh MA et al. Molecular Background of RhD-positive and RhD-negative Phenotypes in a Saudi Population. Saudi J Med Med Sci 12(3):210–215, 2024. DOI 10.4103/sjmms.sjmms_664_23 | 136 donors; exon 3/4/7 presence only — explicitly states variant-allele analysis is still required. |
| 42397021 | Madkhali MM et al. First molecularly characterised D- - donor in Saudi Arabia. Transfus Med 2026. DOI 10.1111/tme.70098 | **Single case.** |
| 37122416 | Al Lawati M, Al Balushi B. RHD Positive Haplotype in D Negative Omani Blood Donor. Oman Med J 38(2):e488, 2023. DOI 10.5001/omj.2023.11 | **Single case report.** |
| 36883669 | RhD*DAU2/DAU6 and weak D type 4.1 in pregnant women in Saudi Arabia. Acta Biomed | **Case series; pregnant women, not donors.** |

**Screened total: 6 GCC records, of which 3 are single cases or a small case series, and only 2 (41147787, 34647328) are donor-cohort molecular studies. Comparable non-GCC Arab work exists in Egypt (23362929), Morocco and Tunisia but is outside the GCC.**

---

## Limitations of this feasibility check (must be carried into any protocol)

1. Only **two** sources were searched: PubMed and SciSpace. Scopus, Embase, Web of Science, Cochrane/CENTRAL, ICTRP, ClinicalTrials.gov, ProQuest and the Saudi Digital Library were **not** searched — no access. No count from those sources is reported or implied.
2. Grey literature, Arabic-language journals, Gulf blood-service reports and regional journals not indexed in PubMed were **not** searched. Given the P14-vs-P15 discrepancy, regional under-indexing is demonstrated, not merely suspected.
3. SciSpace returns a ranked result set with no denominator; its counts are **not** comparable to PubMed counts and are not used for volume estimation.
4. No deduplication has been performed across P1–P18; counts are per-string retrieval counts, not unique-record totals.
5. No formal title/abstract screening against eligibility criteria was performed. Where "screened" counts appear above (P3, RH-variant table) they come from inspection of retrieved titles/abstracts by a single agent, unblinded and unreplicated, and should be treated as indicative only.
6. P2/P3 demonstrate a live precision hazard: `RHD` collides with "rheumatic heart disease". Any executed PILOT-02 search must neutralise this.
7. `[UNVERIFIED]`: the Zaid & Mustafa 2020 MENA review is recorded from SciSpace metadata only and has not been verified against an independent bibliographic record.
