# PILOT-03 STAGE 1 GATE — TARGETED DUPLICATION / NOVELTY SEARCH LOG

**Purpose:** execute the Stage 1 gate required by audit findings C2 and C3 (`10_Audit/_working/10_interim-process-audit_v1.0_2026-09-11.md`). Five propositions, each with its own targeted search.
**Executed by:** `literature-search-expert` (Claude Opus 5), on behalf of Dr. Fehaid M. Alanazi
**Date of all searches:** 2026-09-11 | **Date range covered:** inception – 2026-09-11
**Databases actually searched:** PubMed (MCP `mcp__PubMed__search_articles`); SciSpace semantic index (MCP `mcp__SciSpace__search-papers`).
**Databases NOT searched — no access:** Scopus, Embase, Web of Science, Cochrane Library/CENTRAL, ClinicalTrials.gov, ICTRP, ProQuest, Saudi Digital Library, Google Scholar, Arabic-language journals. **No count below derives from any of these.**
**Full text blocked (tested this session, all EGRESS_BLOCKED):** `pmc.ncbi.nlm.nih.gov`, `www.biorxiv.org`, `researchonline.ljmu.ac.uk`. No full text of any key study could be read; abstract-level evidence only.
**Platform constraint:** PubMed MCP rejects >20 Boolean operators. One string failed and is recorded verbatim at G7-FAILED.
**Tool note (bears on audit M5):** this session exposes `search_articles`, `get_article_metadata`, `find_related_articles`, `convert_article_ids`. **No full-text tool** and no `lookup_article_by_citation`.

*All PubMed-derived records below are reported according to PubMed.*

---

## G1 — Concordance / discordance / agreement / kappa + blood group + GCC (tests P2)
- **Database:** PubMed (MCP) | **Filters:** none
- **String (verbatim):**
  `(concordance[Title/Abstract] OR discordance[Title/Abstract] OR discordant[Title/Abstract] OR discrepancy[Title/Abstract] OR agreement[Title/Abstract] OR kappa[Title/Abstract]) AND ("blood group"[Title/Abstract] OR "red cell"[Title/Abstract] OR RHD[Title/Abstract] OR RHCE[Title/Abstract] OR genotyping[Title/Abstract] OR phenotyping[Title/Abstract]) AND (Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Omani[Title/Abstract] OR Emirates[Title/Abstract] OR Gulf[Title/Abstract])`
- **query_translation:** returned identical to the string above (all terms mapped as Title/Abstract phrases; no automatic term mapping expansion).
- **Records retrieved: 22** — PMIDs 42540393, 41869969, 41464767, 38948735, 36622459, 35046417, 34647328, 33453365, 32088690, 31697429, 31040864, 29312964, 29151993, 24626804, 24044061, 22300956, 22004876, 19785540, 17594534, 16822964, 9241658, 7228033
- **Precision observed (all 22 titles inspected): 2/22 relevant.** Relevant: **38948735** (Omani WGS-vs-serology preprint), **34647328** (Al-Riyami, Omani donors). The other 20 are off-topic — freshwater fish mito-nuclear discordance, dermatophytes, COPD referral, oyster SNP arrays, Qatari QChip1, Vibrio, HPV assays, US glycophorin donors, camelid FISH, Brucella MLVA, MRSA, IL-10/miscarriage, lactase persistence, metapneumovirus, Fusarium, apoE, ALS, CYP2D6, Kuwaiti 1981 polymorphisms. `Gulf` collides with Gulf of Mexico / Gulf Coast / Gulf War; `kappa`/`agreement` are near-useless tokens. **This count must not be quoted as literature volume.**

## G2 — DEL vocabulary + Arab/GCC/Middle East geography (tests P4)
- **Database:** PubMed (MCP) | **Filters:** none
- **String (verbatim):**
  `("DEL phenotype"[Title/Abstract] OR "DEL variant"[Title/Abstract] OR "DEL alleles"[Title/Abstract] OR "DEL allele"[Title/Abstract] OR "RHD-DEL"[Title/Abstract] OR "D-elute"[Title/Abstract] OR "Asian DEL"[Title/Abstract] OR "DEL red cells"[Title/Abstract]) AND (Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Omani[Title/Abstract] OR Emirates[Title/Abstract] OR Gulf[Title/Abstract] OR Arab[Title/Abstract] OR "Middle East"[Title/Abstract])`
- **query_translation:** PubMed **silently dropped** `"DEL red cells"[Title/Abstract]` (operator ceiling). Recorded because it changes reproducibility.
- **Records retrieved: 1** — PMID 32694967. **Inspected: irrelevant** (UCP2 45-bp insertion/deletion polymorphism and hypothyroidism, Jazan; `Ins/Del` false match).
- **Effective relevant yield: 0.** A near-zero result; string inspected and confirmed not broken (it retrieves DEL records when geography is removed — see G8).

## G3 — Partial D / weak D / RHD variant vocabulary + GCC/Arab (tests P3, P5)
- **Database:** PubMed (MCP) | **Filters:** none
- **String (verbatim):**
  `("partial D"[Title/Abstract] OR "partial RhD"[Title/Abstract] OR "D variant"[Title/Abstract] OR "D variants"[Title/Abstract] OR "weak D"[Title/Abstract] OR "RHD variant"[Title/Abstract] OR "RHD variants"[Title/Abstract] OR "RHD allele"[Title/Abstract] OR "RHD alleles"[Title/Abstract] OR "RHD genotyping"[Title/Abstract] OR "RHD zygosity"[Title/Abstract]) AND (Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Omani[Title/Abstract] OR Emirates[Title/Abstract] OR Gulf[Title/Abstract] OR Arab[Title/Abstract])`
- **Records retrieved: 9** — PMIDs 40160494, 39373300, 39055072, 36883669, 32527616, 31724935, 31954005, 23362929, 16642441
- **Inspected, relevant 5:** 39373300 (Omani SCD patients, extended typing), 39055072 (Alalshaikh, Saudi donors), 36883669 (Saudi pregnant women, case series), 32527616 (Ameen, Kuwaiti donors), 23362929 (Egypt — non-GCC). Irrelevant 4: 40160494 (UAE newborn haemoglobinopathies, "Hb D variant"), 31954005 (HBV variants), 31724935 (Saudi mangrove yeast), 16642441 (ACE/Alzheimer, Israeli Arab).
- **RECALL FAILURE, recorded:** this string did **not** retrieve Madkhali 2025 (PMID 41147787), the single most relevant Saudi donor RHD/RHCE study, because its abstract says "RHD and RHCE variations", not "RHD variant(s)". Antigen-variant vocabulary alone is not sufficient recall for this corpus. Corrected by G5/G6.

## G4 — "Weak D type n" allele-level vocabulary + GCC/Arab/Middle East (tests P5)
- **Database:** PubMed (MCP) | **Filters:** none
- **String (verbatim):**
  `("weak D type 1"[Title/Abstract] OR "weak D type 2"[Title/Abstract] OR "weak D type 3"[Title/Abstract] OR "weak D types"[Title/Abstract] OR "weak D type 4"[Title/Abstract] OR "RHD*weak"[Title/Abstract] OR "weak D alleles"[Title/Abstract]) AND (Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Omani[Title/Abstract] OR Emirates[Title/Abstract] OR Gulf[Title/Abstract] OR Arab[Title/Abstract] OR "Middle East"[Title/Abstract])`
- **Records retrieved: 2** — PMIDs 36883669 (Saudi pregnant women, RhD*DAU2/DAU6 + weak D type 4.1; **not donors**), 23362929 (Egypt, weak D type 4.2/DAR; **not GCC**).
- **Relevant GCC donor records: 0.**

## G5 — Panel-level / platform-level vocabulary + GCC + donor (D024 recall control)
- **Database:** PubMed (MCP) | **Filters:** none
- **String (verbatim):**
  `("blood group genotyping"[Title/Abstract] OR "red cell genotyping"[Title/Abstract] OR "molecular blood group"[Title/Abstract] OR "blood group antigens"[Title/Abstract] OR "erythrocyte antigen"[Title/Abstract] OR "SNP array"[Title/Abstract] OR "DNA array"[Title/Abstract] OR "whole genome sequencing"[Title/Abstract] OR "extended genotyping"[Title/Abstract]) AND (Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Omani[Title/Abstract] OR Emirates[Title/Abstract] OR Gulf[Title/Abstract]) AND (donor[Title/Abstract] OR donors[Title/Abstract] OR transfusion[Title/Abstract])`
- **Records retrieved: 28** — PMIDs 42492973, 42375313, 41246749, 41192249, 40916454, 39967527, 39662013, 39554869, 39308969, 38965955, 38948735, 38111036, 38084679, 37436389, 36883669, 35741842, 35450032, 35002415, 34964319, 34887679, 34647328, 34349461, 33491438, 31745413, 30421425, 30183354, 29441679, 28469144
- **This string is the one that found the study everything else missed: PMID 40916454** — Haffener et al., *Transfusion* 65(10):1922–1934, 2025, the **peer-reviewed** version of preprint 38948735. It appears in no antigen-anchored string. The D024 panel-level control worked.

## G6 — Rh/blood-group MeSH + GCC MeSH *and* free-text geography + molecular vocabulary
- **Database:** PubMed (MCP) | **Filters:** none
- **String (verbatim):**
  `("Rh-Hr Blood-Group System"[MeSH Terms] OR "Blood Group Antigens"[MeSH Terms]) AND ("Saudi Arabia"[MeSH Terms] OR "Kuwait"[MeSH Terms] OR "Qatar"[MeSH Terms] OR "Bahrain"[MeSH Terms] OR "Oman"[MeSH Terms] OR "United Arab Emirates"[MeSH Terms] OR Saudi[Title/Abstract] OR Omani[Title/Abstract] OR Kuwaiti[Title/Abstract] OR Qatari[Title/Abstract] OR Emirati[Title/Abstract] OR Bahraini[Title/Abstract]) AND (genotyping[Title/Abstract] OR genotype[Title/Abstract] OR molecular[Title/Abstract] OR allele[Title/Abstract] OR alleles[Title/Abstract] OR PCR[Title/Abstract] OR sequencing[Title/Abstract])`
- **Records retrieved: 25** — PMIDs 41881027, 41248728, 41147787, 40916454, 39373300, 38657987, 36883669, 35888577, 35800382, 35741842, 35256491, 34647328, 34137046, 33491438, 33098316, 32527616, 30554968, 30450861, 29441679, 26214466, 20642943, 18247104, 16686845, 11939260, 11205816
- Retrieves Madkhali 41147787 (which G3 missed) and Ameen 32527616. Off-topic fraction inspected: ABO-only, TTI/COVID association, salivary antigens, Algerian and Korean records.

## G7-FAILED — multicentre + prospective + donors + antigen + GCC (NOT EXECUTED)
- **String (verbatim, as submitted):**
  `(multicentre[Title/Abstract] OR multicenter[Title/Abstract] OR "multi-centre"[Title/Abstract] OR "multi-center"[Title/Abstract] OR prospective[Title/Abstract] OR prospectively[Title/Abstract] OR "consecutive donors"[Title/Abstract]) AND ("blood donor"[Title/Abstract] OR "blood donors"[Title/Abstract] OR "Blood Donors"[MeSH Terms]) AND ("blood group"[Title/Abstract] OR "red cell"[Title/Abstract] OR genotyping[Title/Abstract] OR phenotyping[Title/Abstract] OR antigen[Title/Abstract]) AND (Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Omani[Title/Abstract] OR Emirates[Title/Abstract] OR Gulf[Title/Abstract])`
- **Result: NOT EXECUTED — `INVALID_QUERY`, 22 operators vs max 20. No count obtained.** Split into G8 and G9.

## G8 — Multi-centre design vocabulary + blood group/donor + GCC (tests P1)
- **Database:** PubMed (MCP) | **Filters:** none
- **String (verbatim):**
  `(multicentre[Title/Abstract] OR multicenter[Title/Abstract] OR "multi-centre"[Title/Abstract] OR "multi-center"[Title/Abstract] OR "multiple centres"[Title/Abstract] OR "multiple centers"[Title/Abstract] OR "multisite"[Title/Abstract]) AND ("blood group"[Title/Abstract] OR "red cell"[Title/Abstract] OR "blood donor"[Title/Abstract] OR "blood donors"[Title/Abstract] OR RHD[Title/Abstract] OR RHCE[Title/Abstract]) AND (Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Omani[Title/Abstract] OR Emirates[Title/Abstract] OR Gulf[Title/Abstract])`
- **Records retrieved: 11** — PMIDs 42403973, 41899264, 41470155, 39449868, 39050827, 38991002, 38947563, 37717976, 36748665, 33583715, 32903199
- **All 11 titles inspected. GCC donor blood-group genotyping studies: 0.** Closest: 41899264 (multicentre **retrospective** alloimmunization in Riyadh **patients**), 33583715 (multi-centre Eastern Mediterranean donation/ferritin), 36748665 (national multicentre donation-perception survey). Remainder: ABO-incompatible transplant, TTI seroprevalence ×2, iron-deficiency anaemia, ABO/Rh–COVID outcomes, Rh/K-matched transfusion in SCD/thalassaemia **patients**, pulmonary-embolism biomarkers, COVID convalescent plasma protocol.

## G9 — Prospective / consecutive sampling vocabulary + donors + GCC (tests P1)
- **Database:** PubMed (MCP) | **Filters:** none
- **String (verbatim):**
  `(prospective[Title/Abstract] OR prospectively[Title/Abstract] OR consecutive[Title/Abstract]) AND ("blood donor"[Title/Abstract] OR "blood donors"[Title/Abstract]) AND ("blood group"[Title/Abstract] OR genotyping[Title/Abstract] OR phenotyping[Title/Abstract] OR antigen[Title/Abstract] OR RHD[Title/Abstract]) AND (Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Omani[Title/Abstract] OR Emirates[Title/Abstract] OR Gulf[Title/Abstract])`
- **Records retrieved: 6** — PMIDs 39662013, 38991002, 27019315, 21967468, 10174292, 21164232
- **Inspected: 0 are GCC donor RH genotyping studies.** 39662013 = serological ABO/Rh/Kell prevalence, Al-Qurayyat (the PI's own); 27019315 = platelet alloantigens; remainder hepatitis serology.
- **Methodological caveat, recorded:** design descriptors ("prospective", "multicentre") are frequently absent from abstracts even when true of the study. G8/G9 therefore establish that **no such study was retrieved**, not that none exists. Screening of the G5/G6 corpus by study (below) is the load-bearing evidence for P1, not these two counts.

## G10 — DEL / zygosity / Rhesus box + RHD + GCC/Arab (tests P3, P4)
- **Database:** PubMed (MCP) | **Filters:** none
- **String (verbatim):**
  `(DEL[Title/Abstract] OR "DEL phenotype"[Title/Abstract] OR zygosity[Title/Abstract] OR "Rhesus box"[Title/Abstract] OR "hybrid Rhesus box"[Title/Abstract]) AND (RHD[Title/Abstract] OR "Rh-Hr Blood-Group System"[MeSH Terms]) AND (Saudi[Title/Abstract] OR Kuwait[Title/Abstract] OR Qatar[Title/Abstract] OR Bahrain[Title/Abstract] OR Oman[Title/Abstract] OR Omani[Title/Abstract] OR Emirates[Title/Abstract] OR Gulf[Title/Abstract] OR Arab[Title/Abstract] OR "Middle East"[Title/Abstract])`
- **Records retrieved: 2** — 39055072 (Alalshaikh; hybrid Rhesus box / zygosity, **no DEL**), 37122416 (Al Lawati & Al Balushi; single-case zygosity discussion, **no DEL**).
- **GCC records screening for DEL: 0 in PubMed.**

## G11 — Author check (Al Lawati / Allawati, Oman RHD)
- **Database:** PubMed (MCP) | **Filters:** none
- **String (verbatim):** `(Al Lawati[Author] OR Allawati[Author] OR "Al-Lawati"[Author]) AND (RHD[Title/Abstract] OR "blood group"[Title/Abstract] OR "D negative"[Title/Abstract] OR Rh[Title/Abstract])`
- **query_translation:** `(Al-Lawati[Author] OR Allawati[Author] OR "Al-Lawati"[Author]) AND (...)` — note PubMed silently hyphenated `Al Lawati` to `Al-Lawati`.
- **Records retrieved: 5** — 42655563 (hydrogen gas sensors — name collision), 37122416 (relevant), 36381864 (paediatric fistula — collision), 29621271, 24433648.
- **The Omani RHD doctoral thesis is not in PubMed.** Found only via SciSpace (S4/S5).

---

## SciSpace searches (semantic; ranked set, **no denominator — not usable for volume**)

| ID | Question (verbatim) | Returned | Decisive retrievals |
|---|---|---|---|
| S1 | `Has any multi-centre, prospectively sampled study genotyped RHD and RHCE in blood donors across Gulf Cooperation Council countries such as Saudi Arabia, Oman, Kuwait, Qatar, Bahrain or the United Arab Emirates?` | 10 | Madkhali 2025 (10.1111/tme.70040); no GCC multi-centre prospective donor RH genotyping study returned |
| S2 | `What studies report concordance or discordance between red cell serological phenotyping and blood group genotyping in blood donors from Arab or Gulf populations, including per-antigen agreement for the Rh system?` | 10 | **Al-Riyami 2021** (10.1111/VOX.13204); **Haffener 2025** (10.1111/trf.18401) + preprint (10.1101/2024.06.17.599396); Irshaid 2002 **Jordanian** donors (10.1046/J.1423-0410.2002.00182.X — non-GCC Arab concordance study) |
| S3 | `Has any study in Saudi Arabia or the Gulf resolved weak D alleles at the molecular level beyond weak D types 1, 2 and 3, identifying the specific RHD alleles in the unresolved weak D fraction of blood donors?` | 10 | No Saudi/Gulf record returned; all hits French, Russian, Chinese, Italian, German, US |
| S4 | `Has the DEL phenotype or RHD DEL alleles been screened for in blood donors in Saudi Arabia, Oman, Kuwait, Qatar, Bahrain, the United Arab Emirates or other Arab populations?` | 10 | **Al Lawati M (2021), doctoral thesis, Liverpool John Moores University, DOI 10.24377/LJMU.T.00014274** — 203 serological D-negative Omani samples; DEL allele reported. Also Allawati & Balushi 2022 (10.4103/gjtm.gjtm_13_22), novel partial-D allele, Omani donor |
| S5 | `What is the molecular background of the serological D-negative phenotype in Omani blood donors, and were RHD variant alleles including DEL identified in that population?` | 10 | Confirms S4 thesis record; abstract retrieved verbatim |

---

## SCREENING AND RECONCILIATION — GCC donor / population molecular RH corpus

Retrieved across G3, G5, G6, G10, G11, S1–S5 and PILOT-02 string P4. **Every record named; nothing dropped silently.**

| Record | n / population | RHD in D-POS? | Concordance analysis? | DEL? | Weak D alleles beyond 1/2/3? | Centres / sampling |
|---|---|---|---|---|---|---|
| **41147787** Madkhali 2025, *Transfus Med* 36(2):158–164, DOI 10.1111/tme.70040 | 60 D-neg/weak-D (ID RHD XT); 354 Saudi + 110 non-Saudi (RHCE, ID CORE XT), Jazan | **No** — RHD arm restricted to D-neg/weak-D | Not reported in abstract | Not reported | Not resolved (weak-D fraction left unassigned) | Jazan regional blood bank; **"records… were reviewed"** = retrospective |
| **34647328** Al-Riyami 2021, *Vox Sang* 117(3):424–430, DOI 10.1111/vox.13204 | 180 Omani donors; 130 with paired serology+genotype | Unselected donors; RHD/RHCE genotyped | **YES — explicit objective.** Concordance >95% all systems (RH included); Fy(b+) 87%; 14/112 Fyb discrepancies adjudicated | Not reported | No | Sultan Qaboos University Hospital; single centre |
| **40916454** Haffener 2025, *Transfusion* 65(10):1922–1934, DOI 10.1111/trf.18401 (preprint **38948735**, DOI 10.1101/2024.06.17.599396) | 100 Omanis, 24 antigens, WGS | WGS — unselected | **YES — dedicated.** 98.7% prediction accuracy; **12 discordances investigated**, candidate variants proposed (Lewis, Lutheran, MNS, P1) | Not stated | Not stated | Authors at SQUH **and** Royal Oman Police Hospital; donor status and sampling direction **[UNVERIFIED]** — full text blocked |
| **32527616** Ameen 2020, *Transfus Apher Sci* 59(4):102748, DOI 10.1016/j.transci.2020.102748 | 917 **unselected** Kuwaiti donors, SNP DNA array | **Yes by construction** (unselected ⇒ includes D-pos); *"weak D 1, 2, 3… not prevalent; however, other RHD variants were detected"* | Not reported | **Array DEL coverage [UNVERIFIED]** — full text inaccessible (audit C1 unchanged) | Named types 1/2/3 only; "other variants" unspecified | Kuwaiti Bone Marrow Registry; single source |
| **39055072** Alalshaikh 2024, *Saudi J Med Med Sci* 12(3):210–215, DOI 10.4103/sjmms.sjmms_664_23 | 136 Saudi donors (70 D-pos, 66 D-neg) | **Yes — 70 D-positive genotyped**, but exon 3/4/7 presence + hybrid Rhesus box only | No | No | No — paper states variant-allele analysis still required | King Fahad Medical City; single centre |
| **Al Lawati M 2021**, LJMU doctoral thesis, DOI 10.24377/LJMU.T.00014274 — **no PMID; not PubMed-indexed** | 203 serological D-negative Omani samples, "different regions of the country"; AS-RT-PCR, BAGene, digital PCR, Sanger | No (D-neg only) | Serology reclassified by genotype in 9/203 (4.43%) | **YES — DVI.2 in cis/trans to DEL(IVS8-31T>C)** | **YES — weak D DAR2.00, type 45, type 41, type 4.2; DIIIb; DVI.2** | Multi-region; donor status **[UNVERIFIED]**, repository blocked |
| 42397021 Madkhali 2026, DOI 10.1111/tme.70098 | Single D- - case | — | — | — | — | Case report |
| 37122416 Al Lawati & Al Balushi 2023, DOI 10.5001/omj.2023.11 | Single D-neg Omani donor, RHDΨ | — | — | — | — | Case report |
| 36883669 (Acta Biomed) | Saudi **pregnant women** | — | — | — | DAU2/DAU6, weak D 4.1 | Case series, not donors |
| 39373300 Al Breiki 2024, DOI 10.2478/immunohematology-2024-0014 | 38 Omani **SCD patients** | — | — | — | RHD/RHCE variants in 5 | Patients, not donors |
| Allawati & Balushi 2022, DOI 10.4103/gjtm.gjtm_13_22 | 1 Omani donor, novel DBS-0-like partial D | — | — | — | Partial D | Case report |
| 23362929 (Egypt), Irshaid 2002 (Jordan, DOI 10.1046/J.1423-0410.2002.00182.X) | Arab but **non-GCC** | — | Both report serology-vs-genotype discordance resolution | — | weak D 4.0/4.2 (Egypt) | Outside GCC scope |

**Arithmetic:** GCC records screened **12**; excluded as non-donor or single-case **6** (42397021, 37122416, 36883669, 39373300, Allawati 2022 — case/non-donor; plus non-GCC comparators 23362929, Irshaid 2002 excluded on geography); **counted as GCC donor/population molecular RH datasets: 6** — 41147787, 34647328, 40916454 (+preprint 38948735 = same study, deduplicated), 32527616, 39055072, Al Lawati 2021 thesis.
**Deduplication rule applied:** preprint 38948735 and journal article 40916454 are one study; counted once, journal version preferred.

---

## VERDICTS

| # | Proposition | Verdict | Refuting record |
|---|---|---|---|
| P1 | No multi-centre, prospectively-sampled GCC donor RHD/RHCE genotyping study | **SURVIVES (weak; retrieval statement only)** | none retrieved; **challengers named:** 40916454 (two Omani institutions, sampling [UNVERIFIED]); Al Lawati 2021 thesis (multi-region) |
| P2 | No GCC donor study reports RH serology–genotype concordance/discordance | **REFUTED** | **34647328** and **40916454** (+38948735) |
| P3 | No GCC study genotyped RHD in D-POSITIVE donors sufficiently to resolve partial D | **UNVERIFIABLE** | not refuted, not assertable — **32527616** (unselected 917 donors, array panel inaccessible) and **40916454** (WGS, full text inaccessible) both unresolved |
| P4 | No GCC study has screened for DEL | **REFUTED** (grey literature) | **Al Lawati 2021, DOI 10.24377/LJMU.T.00014274 — no PMID.** PubMed yield: 0 |
| P5 | No study resolved weak D beyond types 1/2/3 at allele level in a Saudi **or Gulf** donor population | **REFUTED as worded**; **SURVIVES if narrowed to Saudi Arabia** | **Al Lawati 2021, DOI 10.24377/LJMU.T.00014274 — no PMID** |

**Reconciliation statement (required by D036 control):** before recording the P1 SURVIVES verdict, every PMID listed in G1, G3, G4, G5, G6, G8, G9, G10, G11 and in S1–S5 was re-read against the claim. Two retrieved records could contradict it — 40916454 and the Al Lawati 2021 thesis — and both are named in the verdict rather than dropped in screening. No other retrieved record qualifies.

## LIMITATIONS (must be carried into the protocol)
1. Two sources only (PubMed, SciSpace). No Scopus/Embase/WoS/CENTRAL/registries/grey-literature databases/Arabic journals/Saudi Digital Library. **The registry gap (D019) remains open: whether an ongoing registered GCC RH-genotyping study exists is still unknown.**
2. **No full text of any key study could be read.** PMC, bioRxiv and the LJMU repository are all egress-blocked. Ameen 2020's array panel, Haffener 2025's RH-specific results, and the Al Lawati thesis beyond its abstract are all `[UNVERIFIED]`.
3. Design descriptors are under-reported in abstracts; G8/G9 counts are weak evidence and are not the basis of the P1 verdict.
4. No record has been screened for retraction or correction (publisher pages blocked).
5. No deduplication across G1–G11 beyond the single rule stated above; counts are per-string.
6. Screening was performed by a single unblinded agent, unreplicated. Indicative only.
7. Every gap statement derived from this log **must** be phrased as a retrieval statement, never an existence claim.
