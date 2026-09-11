# FEASIBILITY SEARCH LOG — Stage 1 GO/NO-GO scoping check

**Proposed topic:** Red blood cell alloimmunization in transfusion-dependent patients in Saudi Arabia and the Gulf — prevalence, antibody specificities, and matching policy.
**Executed by:** literature-search-expert agent (Claude Opus 5), on behalf of Dr. Fehaid M. Alanazi
**Date of all searches:** 2026-09-11
**Databases actually searched:** PubMed (via MCP `mcp__PubMed__search_articles`); SciSpace semantic index (via MCP `mcp__SciSpace__search-papers`)
**Databases NOT searched (no access in this environment):** Scopus, Embase, Web of Science, Cochrane Library/CENTRAL, ProQuest theses, Saudi Digital Library, ICTRP, Google Scholar.
**Platform constraint encountered:** the PubMed MCP interface rejects queries containing >20 Boolean operators (`INVALID_QUERY / too many boolean operators`). Long multi-concept strings had to be split. This is a tool limit, not a PubMed limit; the strings below are the ones actually executed.

---

## S1 — FAILED (recorded for transparency)

- **Database:** PubMed (MCP)
- **String (verbatim):**
  `(alloimmunization[Title/Abstract] OR alloimmunisation[Title/Abstract] OR "red cell antibodies"[Title/Abstract] OR "red blood cell antibodies"[Title/Abstract]) AND ("Saudi Arabia"[MeSH Terms] OR Saudi[Title/Abstract] OR Kuwait*[Title/Abstract] OR Bahrain*[Title/Abstract] OR Qatar*[Title/Abstract] OR Oman*[Title/Abstract] OR "United Arab Emirates"[Title/Abstract] OR Emirati[Title/Abstract] OR Gulf[Title/Abstract] OR GCC[Title/Abstract] OR "Middle East"[Title/Abstract] OR Arab*[Title/Abstract]) AND (systematic[sb] OR "Systematic Review"[Publication Type] OR "Meta-Analysis"[Publication Type] OR Review[Publication Type] OR review[Title/Abstract] OR "scoping review"[Title/Abstract] OR "meta-analysis"[Title/Abstract])`
- **Filters:** none
- **Result:** **NOT EXECUTED** — error `INVALID_QUERY`, 22 operators vs max 20. No count obtained.

---

## S2 — Saudi + alloimmunization, no publication-type filter (sensitivity baseline)

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none | **Date range:** inception–2026-09-11
- **String (verbatim):**
  `(alloimmunization[Title/Abstract] OR alloimmunisation[Title/Abstract]) AND ("Saudi Arabia"[MeSH Terms] OR Saudi[Title/Abstract])`
- **PubMed `query_translation`:** `("alloimmunization"[Title/Abstract] OR "alloimmunisation"[Title/Abstract]) AND ("Saudi Arabia"[MeSH Terms] OR "Saudi"[Title/Abstract])`
- **Records retrieved: 37**

## S3 — Regional + review filter (Q1 duplication check)

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** Review[Publication Type] OR review/meta-analysis in title/abstract
- **String (verbatim):**
  `(alloimmunization[Title/Abstract] OR alloimmunisation[Title/Abstract]) AND (Saudi[Title/Abstract] OR Gulf[Title/Abstract] OR "Middle East"[Title/Abstract] OR Arab[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Emirates[Title/Abstract]) AND (Review[Publication Type] OR review[Title/Abstract] OR "meta-analysis"[Title/Abstract])`
- **Records retrieved: 12**
- **Key hits:** 40069098, 40066558, 29399805, 27197689

## S4 — Evidence-synthesis filter on the disease populations (no geography)

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** synthesis terms in title/abstract
- **String (verbatim):**
  `(alloimmunization[Title/Abstract] OR alloimmunisation[Title/Abstract] OR "red cell alloantibod*"[Title/Abstract]) AND (systematic review[Title/Abstract] OR meta-analysis[Title/Abstract] OR scoping review[Title/Abstract]) AND (thalassemia[Title/Abstract] OR thalassaemia[Title/Abstract] OR sickle cell[Title/Abstract])`
- **Records retrieved: 20**

## S5 — Synthesis filter + transfusion-dependent concept

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none beyond string
- **String (verbatim):**
  `(alloimmunization OR alloimmunisation OR alloantibodies) AND ("scoping review"[Title/Abstract] OR "narrative review"[Title/Abstract] OR "systematic review"[Title/Abstract]) AND (transfusion-dependent OR "chronic transfusion" OR hemoglobinopathy)`
- **Note:** PubMed automatic term mapping expanded the unfielded terms heavily (see `query_translation` in session record) — sensitivity high, precision low.
- **Records retrieved: 23**

## S6 — Title-field alloimmunization + Gulf states (precision check)

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `("red blood cell alloimmunization"[Title] OR "red cell alloimmunization"[Title] OR alloimmunization[Title] OR alloimmunisation[Title]) AND (Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR "United Arab Emirates"[Title/Abstract])`
- **Records retrieved: 19**

## S7 — MeSH-anchored concept + MeSH-anchored geography (Q2 volume, Gulf-wide, all indications)

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `("Blood Group Incompatibility"[MeSH Terms] OR "Isoantibodies"[MeSH Terms] OR alloimmunization[Title/Abstract] OR alloimmunisation[Title/Abstract] OR alloantibod*[Title/Abstract]) AND ("Saudi Arabia"[MeSH Terms] OR "Kuwait"[MeSH Terms] OR "Qatar"[MeSH Terms] OR "Bahrain"[MeSH Terms] OR "Oman"[MeSH Terms] OR "United Arab Emirates"[MeSH Terms])`
- **Records retrieved: 40** (all indications, incl. obstetric/HDFN and platelet-adjacent records — not all eligible)

## S8 — Q2 core: Saudi + alloimmunization + SCD/thalassemia

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `(alloimmunization[Title/Abstract] OR alloimmunisation[Title/Abstract] OR alloantibod*[Title/Abstract]) AND (thalassemia[Title/Abstract] OR thalassaemia[Title/Abstract] OR "sickle cell"[Title/Abstract]) AND ("Saudi Arabia"[MeSH Terms] OR Saudi[Title/Abstract])`
- **Records retrieved: 18**

## S9 — Q2 core: other five GCC states + alloimmunization + transfusion-dependent populations

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `(alloimmunization[Title/Abstract] OR alloimmunisation[Title/Abstract] OR alloantibod*[Title/Abstract]) AND (thalassemia[Title/Abstract] OR thalassaemia[Title/Abstract] OR "sickle cell"[Title/Abstract] OR "transfusion-dependent"[Title/Abstract]) AND ("Kuwait"[MeSH Terms] OR "Qatar"[MeSH Terms] OR "Bahrain"[MeSH Terms] OR "Oman"[MeSH Terms] OR "United Arab Emirates"[MeSH Terms] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Emirates[Title/Abstract])`
- **Records retrieved: 8**

## S10 — Matching-policy concept + synthesis filter (third element of the proposed topic)

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `("blood group matching"[Title/Abstract] OR "antigen matching"[Title/Abstract] OR "extended phenotyping"[Title/Abstract] OR "transfusion policy"[Title/Abstract] OR "transfusion practice"[Title/Abstract]) AND (haemoglobinopath*[Title/Abstract] OR hemoglobinopath*[Title/Abstract] OR thalassemia[Title/Abstract] OR "sickle cell"[Title/Abstract]) AND ("systematic review"[Title/Abstract] OR guideline[Title/Abstract] OR "scoping review"[Title/Abstract])`
- **Records retrieved: 8**
- **Key hit:** 39535318 (ICTMG guideline + updated SR)

## S11 — Middle East / EMRO region review check

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** review terms / Review[PT]
- **String (verbatim):**
  `(alloimmunization[Title/Abstract] OR alloimmunisation[Title/Abstract]) AND ("Middle East"[MeSH Terms] OR "Middle East"[Title/Abstract] OR "Arab World"[Title/Abstract] OR "Eastern Mediterranean"[Title/Abstract]) AND (review[Title/Abstract] OR Review[Publication Type])`
- **Records retrieved: 9**
- **Key hit:** 31753776 (Al-Riyami & Daar, EMRO review)

## S12 — Explicit "scoping review" + region (targeted duplication check)

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `"scoping review"[Title/Abstract] AND (transfusion[Title/Abstract] OR alloimmunization[Title/Abstract] OR blood[Title/Abstract]) AND (Saudi[Title/Abstract] OR Gulf[Title/Abstract] OR "Middle East"[Title/Abstract])`
- **Records retrieved: 8** — on inspection of titles/abstracts returned, **none** is a scoping review of RBC alloimmunization in Gulf transfusion-dependent patients. **No scoping review on this exact topic was retrieved.**

## S13 — Donor antigen/phenotype profile in the Gulf (candidate residual gap)

- **Database:** PubMed (MCP) | **Date:** 2026-09-11 | **Filters:** none
- **String (verbatim):**
  `("blood donors"[Title/Abstract] OR donor[Title/Abstract]) AND ("antigen frequency"[Title/Abstract] OR phenotype[Title/Abstract] OR genotyping[Title/Abstract]) AND ("blood group"[Title/Abstract] OR "red cell"[Title/Abstract]) AND ("Saudi Arabia"[MeSH Terms] OR Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Oman[Title/Abstract] OR Bahrain[Title/Abstract] OR Emirates[Title/Abstract])`
- **Records retrieved: 30**

## S14 — SciSpace semantic search (non-PubMed coverage)

- **Database:** SciSpace (280M+ index, semantic) | **Date:** 2026-09-11 | **Filters:** none available
- **Question (verbatim):** `Is there a published scoping review or systematic review of red blood cell alloimmunization prevalence, antibody specificities, and blood matching policy in transfusion-dependent patients in Saudi Arabia and the Gulf Cooperation Council countries?`
- **Records returned:** 10 (SciSpace returns a ranked set, not a total count — no denominator is available from this tool)
- **Notable non-PubMed-highlighted item:** Shaikh A, Asiri A, Alasmari S, Makkawi M, Mansor A. *Alloimmunization Rates and Associated Factors in Transfusion-Dependent Patients: a Regional Study from Saudi Arabia.* Clinical Laboratory, 2026. DOI 10.7754/clin.lab.2025.250507 — a further Saudi primary study.
- Also surfaced Franchini et al. 2019, *Red blood cell alloimmunisation in transfusion-dependent thalassaemia: a systematic review*, Blood Transfus (DOI 10.2450/2019.0229-18, PMID 30653458) — 41 cohort studies, 9,256 patients, global.

---

## Reviews identified as potential duplicates (all verified via PubMed metadata retrieval)

| PMID | Year | Title (abbreviated) | Type | Coverage |
|---|---|---|---|---|
| 40069098 | 2025 | Alloimmunization in β-Thalassemia and Sickle Cell Disease in Middle Eastern Countries: A Systemic Review (Hemoglobin 49(2):126–140) | Systematic Review | Middle East; 39 thal studies (9,005 pts) + 19 SCD studies (3,867 pts); prevalence, specificities, risk factors AND transfusion policies |
| 40066558 | 2025 | A Meta Analysis of RBC Alloimmunization in Transfused Sickle Cell and Thalassemia Patients in Saudi Arabia (Clin Lab 71(3)) | Meta-Analysis / SR | Saudi Arabia only; 12 studies, 1,811 pts; PROSPERO CRD42023440761; 6 databases searched |
| 31753776 | 2019 | Red cell alloimmunization in transfusion-dependent and transfusion-independent beta thalassemia: A review from the Eastern Mediterranean Region (EMRO) | Review | EMRO; 17 publications; rates, specificities, matching practice |
| 39535318 | 2024 | Red cell specifications for blood group matching in patients with haemoglobinopathies — ICTMG updated SR + clinical practice guideline (Br J Haematol 206:94–108) | Systematic Review + Guideline | Global; the matching-policy question, GRADE-assessed |
| 42194795 | 2026 | Global Prevalence of Alloimmunization in Adults with Sickle Cell Disease Receiving RBC Transfusions: SR and Meta-Analysis (J Clin Med 15(10):3828) | SR / MA | Global, adults; PROSPERO CRD420251167042; Saudi (King Faisal Univ) author group |
| 30653458 | 2019 | RBC alloimmunisation in transfusion-dependent thalassaemia: a systematic review (Blood Transfus) | Systematic Review | Global; 41 cohorts, 9,256 pts |
| 42632288 | 2026 | Prevalence and risk factors of RBC alloimmunization among SCD patients in resource-limited countries: SR and MA | SR / MA | LMICs (Africa/Asia); 27 studies — GCC high-income states largely out of scope |

---

## Limitations of this feasibility check (must be stated in any protocol)

1. Only **two** sources were searched: PubMed and SciSpace. Scopus, Embase, Web of Science and the Cochrane Library were **not** searched — no licensed access in this environment. No count from those databases is reported or implied.
2. Grey literature, Saudi Digital Library theses, Arabic-language journals, and regional journals not indexed in PubMed were **not** searched.
3. SciSpace returns a ranked result set without a total denominator; its "count" is therefore not comparable to a PubMed count and is not used for volume estimation.
4. No de-duplication across S2–S13 has been performed; the counts above are per-string retrieval counts, not a unique-record total.
5. No title/abstract screening against eligibility criteria has been performed; retrieved counts are upper bounds on eligible primary studies, not eligible-study counts.
