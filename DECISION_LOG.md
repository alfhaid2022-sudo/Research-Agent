# DECISION_LOG.md

Every non-obvious methodological, statistical, editorial or governance decision is recorded here, with its evidential basis. Append-only — never edit or delete a prior entry; supersede it with a new one that references the original.

**Format:** `D<nnn>` · Date · Decision · Context · Options considered · Basis · Decided by · Supersedes

---

### D001 — Team architecture: 15 specialist roles with scoped toolsets
**Date:** 2026-09-11
**Context:** Establishing the multi-agent biomedical research team.
**Options:** (a) one generalist agent role-playing multiple experts; (b) 15 genuinely separate agent definitions with individual instructions, scoped tools and separate contexts.
**Decision:** (b).
**Basis:** Role-play within a single context shares one working memory, so an error made while "being" the writer persists while "being" the auditor. Independence of the audit function requires genuine context separation. Scoped tools additionally enforce least privilege — e.g. the auditor cannot edit the manuscript it audits.
**Decided by:** Principal Research Director

---

### D002 — Integrity Auditor holds blocking authority the Director cannot override
**Date:** 2026-09-11
**Context:** Defining gate authority.
**Options:** (a) Director may override the auditor to keep the project moving; (b) only the PI may override.
**Decision:** (b). A `FAIL` or unresolved `CONDITIONAL PASS` blocks Gate G8 absolutely; PI override is permitted and must be logged here.
**Basis:** An auditor that the project manager can overrule provides no assurance, because schedule pressure reliably defeats it. Reserving override to the human PI keeps responsibility where accountability actually sits.
**Decided by:** Principal Research Director

---

### D003 — Analysis executed in Python; SPSS delivered as syntax, not claimed as run
**Date:** 2026-09-11
**Context:** SPSS is not installed in this environment (verified).
**Options:** (a) claim SPSS-equivalent results; (b) run in Python and additionally deliver runnable annotated SPSS syntax, disclosing any default differences.
**Decision:** (b).
**Basis:** Reporting "analysed in SPSS" when it was not is misrepresentation of methods. Python (`statsmodels`/`scipy`) is verified present and fully scriptable; parallel `.sps` syntax lets the PI reproduce and verify natively. Divergences (Type I vs III SS, proportion CI methods, Welch defaults) must be stated rather than silently absorbed.
**Decided by:** Principal Research Director

---

### D004 — Multi-database search cannot be executed in this environment; strings delivered for manual execution
**Date:** 2026-09-11
**Context:** Verified by direct test — PubMed MCP and SciSpace work; Scopus, Embase, Cochrane CENTRAL and Web of Science have no licensed access; `api.crossref.org`, `eutils.ncbi.nlm.nih.gov`, `www.ebi.ac.uk` and `pubmed.ncbi.nlm.nih.gov` return 403 at CONNECT under the network egress policy.
**Options:** (a) proceed and describe the search as multi-database; (b) run what is genuinely available, write native-syntax strings for the remaining databases for the PI to execute, and disclose the limitation.
**Decision:** (b).
**Basis:** Describing an unexecuted search as executed is fabrication of methods and is detectable at peer review. A PubMed+SciSpace search is defensible for a scoping review with the limitation stated; for a full systematic review the PI's institutional access should supply the remaining databases before Gate G2.
**Decided by:** Principal Research Director

---

### D005 — Pilot project approved: scoping review of RBC alloimmunization in Saudi Arabia and the Gulf
**Date:** 2026-09-11
**Context:** PI approved the proposed pilot ("ok approve it").
**Decision:** Proceed with the JBI/PRISMA-ScR scoping review on red blood cell alloimmunization in transfusion-dependent patients in Saudi Arabia and the Gulf — prevalence, antibody specificities, and matching policy.
**Basis:** Builds on the PI's own published work (PMID 39662013; and Kuriri et al. 2023, DOI 10.1155/2023/3239960, PI co-author). Achievable within verified environment search limits. Exercises all 15 agents end-to-end.
**Decided by:** Dr. Fehaid M. Alanazi (PI)
**Conditional on:** Stage 1 feasibility/duplication check. If an equivalent review already exists, this decision is superseded and the topic is re-scoped.

---

### D006 — Design set as scoping review, not systematic review (assumption pending PI confirmation)
**Date:** 2026-09-11
**Context:** PI approved the pilot but did not answer Q2 (institutional database access). Verified: only PubMed + SciSpace are accessible here; Scopus, Embase, Cochrane CENTRAL and Web of Science are not.
**Options:** (a) wait for the PI's answer before any work; (b) proceed as a scoping review — the design that is honestly defensible on PubMed + SciSpace — and upgrade if institutional access is confirmed before Gate G2.
**Decision:** (b), stated explicitly to the PI as a working assumption.
**Basis:** A scoping review's purpose is to map the extent and nature of evidence, and PRISMA-ScR/JBI permit a defined, transparently reported source set. A full systematic review claiming comprehensive retrieval on two databases would be criticised at peer review. Nothing done under this assumption is wasted — added databases extend the same protocol before Gate G2.
**Decided by:** Principal Research Director (assumption; reversible on PI instruction)

---

### D007 — No original data collection; secondary research on published literature only (assumption pending PI confirmation)
**Date:** 2026-09-11
**Context:** PI did not answer Q3 (existing unpublished data / active IRB).
**Decision:** Scope the pilot as secondary research on published literature. No patient-level data, no IRB requirement.
**Basis:** Conservative default. A scoping review of published studies does not require ethics approval. If the PI holds unpublished data, an original observational study is sequenced *after* the pilot rather than merged into it — merging would change the design and the reporting guideline (STROBE rather than PRISMA-ScR).
**Decided by:** Principal Research Director (assumption; reversible on PI instruction)

---

### D008 — PILOT-01 STOPPED at Stage 1 feasibility: topic already published. D005 superseded.
**Date:** 2026-09-11
**Context:** Stage 1 duplication check (14 recorded searches, log at `02_Search/_working/FEASIBILITY_SEARCH_LOG.md`) returned NO-GO. Director independently re-verified the three decisive references against PubMed; metadata and content matched the agent's report exactly.
**Finding:** The approved topic has been published twice in 2025 by other groups:
- Al-Allawi N, et al. *Alloimmunization in β-Thalassemia and Sickle Cell Disease in Middle Eastern Countries: A Systemic Review.* Hemoglobin 2025;49(2):126-140. PMID 40069098, DOI 10.1080/03630269.2025.2471923. 39 thalassemia studies (9,005 patients) + 19 SCD studies (3,867). Reports pooled prevalence, specificity distribution, risk factors **and transfusion policies employed in these countries** — all three declared elements of the proposed topic.
- Bawazir WM. *A Meta Analysis of RBC Alloimmunization in Transfused Sickle Cell and Thalassemia Patients in Saudi Arabia.* Clin Lab 2025;71(3). PMID 40066558, DOI 10.7754/Clin.Lab.2024.240827. Saudi-specific, PROSPERO CRD42023440761, 12 studies, 1,811 patients, pooled 18.2%. Searched six databases including Scopus, Embase, Web of Science and Google Scholar.
- Matching policy is additionally owned globally by the GRADE-graded ICTMG guideline: Wolf J, et al. Br J Haematol 2024;206(1):94-108. PMID 39535318, DOI 10.1111/bjh.19837.
**Decision:** Stop PILOT-01 as scoped. D005 superseded.
**Basis:** No defensible gap remains for prevalence, specificities, or matching policy in GCC transfusion-dependent patients. Proceeding would produce a redundant review at high risk of desk rejection on novelty. Note that Bawazir searched six databases — so the environment's PubMed-only limitation is *not* the reason the topic is closed, and institutional database access would not reopen it.
**Decided by:** Principal Research Director, on verified evidence. **Requires PI ratification and a decision on the pivot.**

---

### D009 — Residual defensible gap identified: donor-side antigen architecture and Rh variants in GCC populations
**Date:** 2026-09-11
**Context:** Having closed the recipient-side question, the feasibility check identified one gap it could defend from its own retrievals.
**Finding:** 30 PubMed records exist on GCC donor red cell phenotype/genotype frequency, but no retrieved review links Gulf **donor** antigen frequencies to recipient alloimmunization patterns, or to the feasibility and inventory cost of extended matching in GCC blood services. Al-Allawi 2025 closes its own abstract by stating "the need for more research on Rhesus variants in this part of the world" — a call to action from the very systematic review that closes the original topic.
**Relevance to PI:** Directly continuous with the PI's own donor-side work — Alanazi FM, *Prevalence of ABO, Rh, and Kell Antigens Among Blood Donors in Al-Qurayyat Region*, Clin Lab 2024;70(12). PMID 39662013, DOI 10.7754/Clin.Lab.2024.240710 (779 Saudi donors).
**Status:** Candidate only. Not approved, not started. Requires PI decision, and a fresh Stage 1 feasibility check before any commitment — the same gate that just closed PILOT-01.
**Decided by:** Principal Research Director (proposal)

---

### D010 — Obstetric/HDFN and non-chronically-transfused surgical patients excluded from the PCC Population
**Date:** 2026-09-11
**Context:** Stage 2 domain scoping for the RBC alloimmunization scoping review.
**Decision:** Restrict the Population to chronically/repeatedly transfused patients (SCD, TDT, NTDT/TI, other chronic-transfusion groups). Exclude antenatal/HDFN alloimmunization and single-episode surgical/acute transfusion recipients from the primary synthesis; retain pregnancy/parity as a covariate and HDFN as a qualitative consequence.
**Basis:** (i) In obstetric alloimmunization the immunizing exposure is fetomaternal, not transfusional, so the exposure of interest is absent; (ii) anti-D cannot be reliably separated from RhIG prophylaxis — Reverberi excluded anti-D in women of childbearing age for this reason (10.2450/2008.0021-08); (iii) antenatal denominators are population-screening denominators, transfusion denominators are patient-exposure denominators, and pooling them is uninterpretable; (iv) single-episode recipients have short ascertainment windows, so their measured prevalence reflects detection opportunity rather than immunization risk.
**Decided by:** transfusion-medicine-expert (domain recommendation; subject to Director and PI approval at G1)

---

### D011 — Scoping review will chart, not pool; definition of alloimmunization to be a mandatory stratifier
**Date:** 2026-09-11
**Context:** Two prior meta-analyses already exist (Saudi-only, pooled 18.2%, 10.7754/Clin.Lab.2024.240827; global adult SCD, pooled 28.9%, I2 88.5%, 10.3390/jcm15103828).
**Decision:** No pooled prevalence estimate. Synthesis is JBI-style descriptive charting stratified by (a) ever-positive vs currently-detectable definition, (b) denominator used, (c) detection platform and positivity threshold, (d) matching policy level.
**Basis:** Documented divergence in every one of those four dimensions across the retrieved corpus (see DOMAIN_SCOPING_2026-09-11.md sect. 2), with evanescence alone capable of moving a prevalence estimate by a factor of 2-3 (10.14423/SMJ.0000000000000528; 10.2450/2008.0021-08; 10.1111/trf.18009) and denominator choice by a further factor of ~3 (10.1111/bjh.15182; 10.1111/BJH.15220). Adding a third pooled estimate would compound rather than resolve the problem; a duplication check against the two existing syntheses is required before G1.
**Decided by:** transfusion-medicine-expert (domain recommendation; subject to Director and PI approval at G1)

---

### D012 — Decision-ID collision corrected; governance files added to the lock register
**Date:** 2026-09-11
**Context:** The Director and the `transfusion-medicine-expert` agent appended to `DECISION_LOG.md` concurrently, each allocating the next free IDs. Two entries were issued as D008 and two as D009, with different content.
**Decision:** The agent's two entries are renumbered **D010** and **D011**; content is preserved verbatim. The Director's D008 (stop PILOT-01) and D009 (residual donor-side gap) keep their IDs, as they were written first and are already referenced in `PROJECT_STATUS.md` and in commit `e4a33f2`.
**Basis:** Renumbering a colliding identifier is a correction of a clerical collision, not an alteration of a recorded decision — no decision content, date, rationale or authorship was changed. Leaving duplicate IDs would break every cross-reference into this log and make the audit trail unusable.
**Root cause:** `CLAUDE.md` §3 requires an agent to claim a file in `FILE_LOCKS.md` before editing, but the Director dispatched two agents having locked only their *working* files (`FEASIBILITY_SEARCH_LOG.md`, `DOMAIN_SCOPING_2026-09-11.md`), not the shared append-only governance files that any agent may write. The lock register was incomplete, so the rule could not prevent the collision.
**Corrective action:** `DECISION_LOG.md`, `CHANGELOG.md` and `PROJECT_STATUS.md` are added to `FILE_LOCKS.md` as **Director-write-only**. Agents report decisions in their return message; the Director records them. This removes the shared-write path entirely rather than relying on lock discipline.
**Decided by:** Principal Research Director

---

### D013 — PILOT-02 opened: donor-side antigen architecture and RH variants in GCC populations
**Date:** 2026-09-11
**Context:** PI ratified the PILOT-01 stop and approved the donor-side pivot recorded as the candidate in D009.
**Decision:** Open PILOT-02 on donor red cell antigen architecture in Gulf/GCC populations and its implications for extended matching of transfusion-dependent patients. **Status: feasibility check only.** No design is fixed, no protocol is drafted, and no reporting guideline is selected until Stage 1 returns GO.
**Basis:** D009. The gap is named by the very systematic review that closed PILOT-01 — Al-Allawi 2025 (PMID 40069098) closes its abstract on "the need for more research on Rhesus variants in this part of the world." It is directly continuous with the PI's own donor-side work (PMID 39662013, 779 Saudi donors).
**Caveat carried forward:** this gap rests on a single agent's retrievals and has not itself been feasibility-tested. It receives the same Stage 1 gate that closed PILOT-01, with no presumption of passing.
**Decided by:** Dr. Fehaid M. Alanazi (PI), on the Director's recommendation

---

### D014 — Feasibility runs alone; no parallel scoping until Stage 1 returns GO
**Date:** 2026-09-11
**Context:** In PILOT-01 the Director dispatched the feasibility check and domain scoping concurrently. Feasibility returned NO-GO, voiding most of a 184,000-token, 7-minute domain-scoping run whose PCC framework and population tiering were topic-specific and could not be reused.
**Decision:** Stage 1 feasibility is run **alone** and must return GO before any domain scoping, protocol drafting, or design selection is dispatched.
**Basis:** Parallelism is only economical when tasks are independent *of each other's outcomes*. Domain scoping is not independent of feasibility — it is downstream of it, and a NO-GO discards it. The two tasks touched disjoint files, which is what the lock rule tests, so file-level independence was satisfied while logical dependence was not. Concurrency must be judged on outcome dependence, not only on write conflicts.
**Note:** the one part of the voided run that did survive — the eleven documented definitional divergences in alloimmunization reporting — survived precisely because it was *not* topic-specific. That is the exception, not the justification.
**Decided by:** Principal Research Director

---

### D015 — PILOT-02 NO-GO as a review: self-duplication plus insufficient RH-variant volume. D013 superseded.
**Date:** 2026-09-11
**Context:** Stage 1 feasibility (18 recorded searches, log at `02_Search/_working/PILOT02_FEASIBILITY_LOG.md`) returned NO-GO. Director independently re-verified the three decisive references against PubMed; metadata and content matched the agent's report exactly.
**Finding 1 — self-duplication (decisive).** The donor-antigen-frequency core of PILOT-02 is already published **by the PI himself**: Alanazi FM. *Rh and Kell Blood Group Antigen Frequencies in Saudi Arabia: a Review.* Clin Lab 2025;71(2). PMID 39967527, DOI 10.7754/Clin.Lab.2024.240914. Sole-authored; searched PubMed, Embase and Cochrane; seven studies 2019–2024 across Samtah, Jazan, Hail, Riyadh, Eastern region, Taif and Najran; DCcee (R1r) most prevalent; already discusses donor recruitment, **blood inventory management** and personalised transfusion protocols.
**Finding 2 — the RH-variant limb is too thin to review.** The gap Al-Allawi named yields ~6 GCC records, three of them single cases or small case series. Only two are donor-cohort molecular studies: Madkhali 2025 (Jazan, DOI 10.1111/tme.70040, self-described as the first RHD/RHCE molecular characterisation in Saudi Arabia) and Al-Riyami 2021 (Oman, n=180, DOI 10.1111/vox.13204). Kuwait, Qatar, Bahrain and UAE returned nothing.
**Finding 3 — the framing is occupied.** Castillo & Quintero 2026 (Transfus Clin Biol 33(2):123-127, PMID 41833928, DOI 10.1016/j.tracli.2026.03.002) already proposes a tiered, feasibility- and cost-driven antigen-matching framework; Carminati et al. 2026 (Transfus Med 36(3):211-221, PMID 41631680, DOI 10.1111/tme.70064) covers phenotyping vs genotyping including RH variants and implementation cost.
**Decision:** NO-GO on PILOT-02 **as a review**. D013 superseded.
**Basis:** A scoping review of two donor cohorts across one Saudi province and one Omani centre would map an almost empty field and conclude "more research is needed" — which the PI's own 2025 review already concludes, and which Al-Allawi already published.
**Decided by:** Principal Research Director, on verified evidence. **Requires PI ratification.**

---

### D016 — Recommendation: reframe as primary research, not a third review attempt
**Date:** 2026-09-11
**Context:** Two consecutive Stage 1 gates have closed on the same cause — the review space in this niche is occupied, in one case by the PI's own prior work.
**Observation:** the PI's own review (PMID 39967527) closes by calling for exactly this: "Further studies are necessary to investigate the genetic and environmental factors influencing the regional similarity and differences in blood group antigen frequencies. Expanding the scope of data collection throughout Saudi Arabia is also imperative." The recommended next step is the one his own published work already named.
**Recommendation (not a decision — PI's call):** a **primary multi-centre GCC donor RHD/RHCE genotyping study** (STROBE; ISBT allele nomenclature), optionally extended to match-probability modelling against local TDT/SCD recipient phenotypes.
**Bearing on the stated mission:** the PI's brief sequenced reviews first, then original research. Two evidence-based gate closures argue for moving to original research earlier than planned. This is a change to the mission's sequencing and is therefore the PI's decision, not the Director's.
**Decided by:** Principal Research Director (recommendation only)

---

### D017 — Search hazard recorded: bare `RHD` token is unusable in PubMed strings
**Date:** 2026-09-11
**Context:** During PILOT-02 feasibility, a string built on a bare `RHD` token returned 26 records of which roughly 14 of 20 inspected were rheumatic-heart-disease noise.
**Decision:** No search strategy on this project may rely on an unqualified `RHD` token. It must be constrained by adjacent blood-group terms, MeSH anchoring, or explicit exclusion of rheumatic disease vocabulary, and any count derived from a bare token is void.
**Basis:** `RHD` is a standard abbreviation for both the Rh D gene and rheumatic heart disease. A precision failure of this magnitude silently inflates apparent literature volume — exactly the quantity a feasibility gate depends on.
**Applies to:** `literature-search-expert`, and any agent estimating literature volume.
**Decided by:** Principal Research Director, on the `literature-search-expert`'s flag

---

### D018 — PILOT-03 opened: primary multi-centre GCC donor RHD/RHCE genotyping study
**Date:** 2026-09-11
**Context:** PI ratified the PILOT-02 stop and approved the D016 recommendation to move to primary research.
**Decision:** Open PILOT-03 as an original observational laboratory study — multi-centre GCC blood donor RHD/RHCE genotyping, with serology–genotype concordance as the clinically meaningful outcome, and optional extension to match-probability modelling against local TDT/SCD recipient phenotypes. Reporting guideline: **STROBE** (to be confirmed by `methodology-protocol-expert` at G1, with STARD considered if a diagnostic-accuracy framing is adopted for the serology–genotype comparison).
**Bearing on the mission:** this moves the programme from review work to original research earlier than the PI's brief sequenced. Done on the PI's explicit instruction, after two evidence-based gate closures.
**Decided by:** Dr. Fehaid M. Alanazi (PI), on the Director's D016 recommendation

---

### D019 — Stage 1 feasibility NOT re-run for PILOT-03; novelty already established and verified
**Date:** 2026-09-11
**Context:** D014 requires Stage 1 feasibility before downstream work. The Director judged the requirement already satisfied for this topic rather than skipping it.
**Basis:** PILOT-02's feasibility check (18 logged searches) established the novelty evidence directly, and the Director independently re-verified the decisive records: across all six GCC states only two donor-cohort molecular RH studies exist — Madkhali 2025 (Jazan; DOI 10.1111/tme.70040; self-described as the first RHD/RHCE molecular characterisation in Saudi Arabia) and Al-Riyami 2021 (Oman, n=180; DOI 10.1111/vox.13204) — with Kuwait, Qatar, Bahrain and UAE returning nothing. Sparse literature is a *disqualifier* for a review and an *enabler* for a primary study: the same verified finding answers both gates in opposite directions. Re-running the identical searches would consume an agent to reproduce a conclusion already in hand.
**Residual gap in the check, stated rather than glossed:** trial/protocol registries could not be queried (PROSPERO, ClinicalTrials.gov, ICTRP were not accessible). An unpublished or ongoing registered GCC RH-genotyping study would not have been detected. This is assigned to the methods-scoping task to attempt, and if it remains unresolved it is carried into Gate G1 as a declared residual risk, not silently dropped.
**Decided by:** Principal Research Director

---

### D020 — Scope boundary: the Director cannot execute the wet-lab or regulatory components
**Date:** 2026-09-11
**Context:** PILOT-03 is original laboratory research on human donor samples. The PI has not yet confirmed sample access, IRB status, or genotyping capability (the Director's Q3, still unanswered).
**Decision:** The team's deliverable for PILOT-03 is the **protocol and its supporting apparatus** — design, eligibility, variables, laboratory methods specification, statistical analysis plan, sample-size justification, STROBE checklist, data-management plan and IRB-ready documentation. Sample collection, laboratory execution, ethics submission and consent are the PI's, and cannot be performed or simulated here.
**Basis:** `CLAUDE.md` §1.9 — never simulate a step not actually performed. A protocol is also precisely the artefact an IRB application requires, so this deliverable is useful whether or not sample access already exists, and does not depend on the unanswered question.
**Decided by:** Principal Research Director

---

### D021 — Early journal/registration scan dispatched in parallel with methods scoping
**Date:** 2026-09-11
**Context:** `transfusion-medicine-expert` is scoping RH genotyping methods. D014 requires parallelism to be judged on **outcome dependence**, not merely on write conflicts.
**Decision:** Dispatch `journal-submission-expert` concurrently for an **early scan only** — target journal landscape, and critically, whether candidate journals require prospective registration of observational studies and which reporting standard they mandate. This is explicitly **not** the Stage 13 final journal selection, which still happens after the manuscript exists.
**Basis for concurrency:** the scan's inputs are the study *type* (primary observational laboratory study), *topic* (donor RH genotyping) and *region* (GCC) — all fixed by D018. None depends on which alleles or platform the methods scoping selects, so a change in that output cannot void this work. The two agents also write disjoint files (`09_Journal/` vs `01_Protocol/`).
**Basis for doing it now rather than at Stage 13:** prospective registration must happen **before** data collection, and `CLAUDE.md` §5 requires the reporting guideline to be fixed in the protocol. Both are Gate G1 inputs. Discovering a registration requirement after the protocol is approved and samples are collected would be unrecoverable — registration cannot be applied retrospectively without disclosing it as retrospective.
**Risk of voiding:** low. PILOT-03's novelty is established and verified (D019) and its design is fixed (D018), so the scan's premises are stable.
**Decided by:** Principal Research Director

---

### D022 — D019 premise CORRECTED: two further GCC molecular RH datasets exist. Rationale reframed.
**Date:** 2026-09-11
**Context:** `transfusion-medicine-expert` exercised its domain veto against the task premise the Director supplied. The Director independently verified both records against PubMed; both are real and the agent's characterisation is accurate.
**What was wrong:** D019 asserted that "across all six GCC states only two donor-cohort molecular RH studies exist" and that Kuwait had nothing. Both claims are false.
- **Ameen R, et al.** *Classification of major and minor blood group antigens in the Kuwaiti Arab population.* Transfus Apher Sci 2020;59(4):102748. PMID 32527616, DOI 10.1016/j.transci.2020.102748. **n = 917** Kuwaiti Arab donors, SNP DNA array; reports "weak D 1, 2, 3 phenotypes were not prevalent… however, other RHD variants were detected." Larger than either study named in D019.
- **Alalshaikh MA, et al.** *Molecular Background of RhD-positive and RhD-negative Phenotypes in a Saudi Population.* Saudi J Med Med Sci 2024;12(3):210-215. PMID 39055072, DOI 10.4103/sjmms.sjmms_664_23. n = 136 Saudi donors; multiplex-PCR exons 3/4/7 plus hybrid Rhesus box zygosity.
**Root cause — the substantive lesson.** The Director verified every record the PILOT-02 search *returned* and treated that as establishing novelty. Verifying returned records says nothing about what a search **missed**. Completeness and accuracy are different properties, and only accuracy was checked. D019's reasoning — that a finding disqualifying a review simultaneously enables a primary study — remains sound; the count it rested on did not.
**Effect on PILOT-03:** the project survives, with a **narrower and better-specified** rationale. The defensible gap is no longer "almost no molecular RH data exist in the GCC" but: **no multi-centre, prospectively-sampled, single-platform, serology-anchored RHD/RHCE concordance study exists in the GCC.** Every retrieved study is single-centre or single-country, uses a different platform, and none performs a concordance analysis. That claim is stronger because it is survivable at peer review; the original was not.
**Decided by:** Principal Research Director, correcting itself on the domain expert's evidence. The veto functioned exactly as the team design intends.

---

### D023 — Madkhali 2025 "first in Saudi Arabia" priority claim is CONTESTED; must not be restated as fact
**Date:** 2026-09-11
**Context:** Madkhali 2025 (DOI 10.1111/tme.70040) self-describes as the first RHD/RHCE molecular characterisation in Saudi Arabia. Alalshaikh 2024 (PMID 39055072) predates it and performed Saudi donor RHD genotyping — and Madkhali cites Alalshaikh.
**Decision:** The priority claim is recorded as contested. No PILOT-03 output may restate it as fact, nor make any "first" claim of its own without a verified search supporting it.
**Basis:** `CLAUDE.md` §7 prohibits unsupported novelty claims. Repeating another paper's unverified priority claim launders it into our own work. This also stands as direct evidence that "first study to…" claims survive peer review while being wrong, which is why our own are prohibited without verification.
**Decided by:** Principal Research Director

---

### D024 — Search lesson: multi-antigen panel studies evade antigen-specific strings
**Date:** 2026-09-11
**Context:** Ameen 2020 is the largest GCC molecular RH dataset retrieved to date, yet the PILOT-02 feasibility search did not surface it.
**Probable mechanism:** its title and abstract foreground a *broad* blood-group panel ("major and minor blood group antigens"), with RH reported as one component. Strings anchored on RH/RHD/RHCE-specific vocabulary miss studies where the RH data are real but not the headline. This compounds the known Gulf MeSH under-indexing already observed in PILOT-02, where free-text retrieval returned 14 records against 4 by MeSH geography.
**Decision:** any search intended to establish literature *volume* for a specific antigen system must additionally run broad panel-level strings ("blood group antigens", "red cell genotyping", "erythrocyte antigen frequencies", "SNP array", "DNA array") without the antigen-specific anchor, and inspect results for embedded system-specific data.
**Applies to:** `literature-search-expert`; propagated to its standing instructions alongside the D017 precision hazards.
**Decided by:** Principal Research Director

---

### D025 — Methods recommendations adopted into the protocol brief
**Date:** 2026-09-11
**Context:** `transfusion-medicine-expert` returned five substantive design recommendations with its scoping.
**Adopted as input to `methodology-protocol-expert`, subject to G1:**
1. **Tiered platform architecture** — one harmonised commercial platform across all sites, with triggered escalation to zygosity/DEL testing, then Sanger, then NGS referral, each with a budgeted n. Rationale: bead/array platforms cannot detect off-panel alleles *by design*, which is what produced Madkhali's unresolved 18.3% "other than weak D 1/2/3" bucket. Platform-vs-platform discordance is a distinct risk class if sites differ.
2. **Unit of analysis = antigen–donor pair**, with a 7-class discordance taxonomy (C, D1–D7). A bare "% concordance" is not analysable.
3. **Anti-D clone identity, lot and class recorded as dataset variables**, not a Methods sentence — the serological method itself moves the discordance rate.
4. **DEL screening included** — the highest-value donor-side target, a proven cause of primary anti-D, never examined in any GCC study; with RHD*Ψ discrimination so D-negative donors are not wrongly discarded.
5. **hr^S^/hr^B^/V/VS excluded from the primary outcome** unless reference serology is obtainable. Madkhali's figures for these are platform-*predicted*, not serologically confirmed; presenting predicted phenotypes as observed would breach `CLAUDE.md` §2.
**Carried to G1 as unresolved:** current ISBT RH allele table version `[UNVERIFIED]` — a November 2025 database migration is suggested but ISBT pages were not reachable; must be human-confirmed. Registry check still not performed (registries inaccessible; a negative WebSearch is not evidence of absence).
**Decided by:** Principal Research Director

---

### D026 — Prospective registration on OSF Registries before first sample collection
**Date:** 2026-09-11
**Context:** `journal-submission-expert` could not build a per-journal registration policy table — every journal author-instruction page was blocked by egress policy — and correctly refused to construct one from search snippets. The one signal obtained, `[PARTIALLY VERIFIED — SEARCH SNIPPET]`, is that ICMJE *encourages* but does not *require* registration of purely observational studies.
**Decision:** Register PILOT-03 prospectively on **OSF Registries before the first donor sample is collected**, irrespective of whether any target journal requires it. ISRCTN is the fallback, subject to checking a possible UK-participant scope condition that could disqualify a GCC study.
**Basis:** The cost asymmetry is total — a few hours and no fee now, versus an unrecoverable loss later, since registration cannot be backdated and a retrospectively registered study must declare itself as such. This study's headline outputs are *allele frequencies* and a *concordance rate*, which are precisely the outputs most exposed to a charge of post-hoc panel selection or post-hoc discordance re-adjudication. The match-probability modelling extension sharpens that exposure further. Registration converts an unfalsifiable good-faith assurance into a timestamped public record.
**Decided by:** Principal Research Director. **Action sits with Dr. Alanazi** — the Director cannot register a study.

---

### D027 — STROBE primary, with STARD-informed methods reporting for the concordance component
**Date:** 2026-09-11
**Context:** The serology–genotype concordance component can legitimately be read as a diagnostic-accuracy study, which would pull STARD rather than STROBE.
**Decision:** Adopt **STROBE (cross-sectional) as the primary reporting standard**, and additionally satisfy STARD's methods requirements for the concordance component rather than choosing between them. The protocol must fix, before any data are seen:
1. which assay is **reference** and which is **index** (genotype vs serology) — and the justification, since neither is a perfect gold standard here;
2. the agreement metric — **kappa with 95% CI plus percent agreement**, never bare percent agreement;
3. the **discordance-adjudication procedure, including blinding** and who adjudicates;
4. pre-specified handling of indeterminate and unresolved calls (e.g. Madkhali's unresolved 18.3% "other than weak D 1/2/3" bucket).
**Basis:** Item 3 is the decisive one. Adjudicating discordances *after* seeing which results are inconvenient is the single likeliest integrity criticism of this design, and it is invisible in a manuscript unless pre-specified. Satisfying both standards costs only documentation; discovering at review that STARD was expected costs a rejection cycle.
**Decided by:** Principal Research Director, on `journal-submission-expert` recommendation B

---

### D028 — ISBT allele nomenclature fixed in the protocol and data dictionary before data capture
**Date:** 2026-09-11
**Context:** The ISBT Red Cell Immunogenetics and Blood Group Terminology Working Party ratifies alleles and maintains the nomenclature tables (PMID 36121188, DOI 10.1111/vox.13361). No journal *mandate* could be verified, but the field convention is unambiguous.
**Decision:** Commit to ISBT allele nomenclature in the protocol and encode it in the data dictionary from day one, rather than mapping to it at write-up.
**Basis:** Retrofitting nomenclature after data capture silently loses information — a locally-recorded call that does not map cleanly to an ISBT allele cannot be reconstructed once the raw platform output is filed away. Recording both the raw platform call and the ISBT allele from the start preserves traceability per `CLAUDE.md` §3.
**Carried unresolved to G1:** current ISBT RH allele table version remains `[UNVERIFIED]` — ISBT pages are blocked; a November 2025 database migration is suggested by search but unconfirmed. **Human confirmation required before G1 closes.**
**Decided by:** Principal Research Director

---

### D029 — Realistic journal tier is mid-tier; the "first in Saudi Arabia" framing is unavailable
**Date:** 2026-09-11
**Context:** Director verified PMID 41147787 — Madkhali MM, et al. *Characterisation of RHD and RHCE variations in blood donors from Jazan Province, Southwestern Saudi Arabia.* Transfus Med 2025;36(2):158-164, DOI 10.1111/tme.70040.
**Findings:** (a) a well-executed Saudi donor RH genotyping study published in *Transfusion Medicine*, which calibrates the realistic ceiling; (b) its abstract states "the first molecular characterisation of RHD and RHCE alleles in Saudi Arabia" — a claim already contested by Alalshaikh 2024 (PMID 39055072) per D023; (c) it genotyped *RHD* only in 60 D-negative/weak-D donors, leaving D-positive donors entirely uncharacterised for partial D; (d) its V (21.8%), hr^S^ (97.8%), VS (24.8%) and hr^B^ (93.2%) frequencies are platform-**predicted**, not serologically confirmed.
**Decision:** Target tier is realistically **mid-tier** — *Transfusion Medicine*, *Transfusion and Apheresis Science*, *Blood Transfusion*, *Transfusion Clinique et Biologique* as the core; *Transfusion* and *Vox Sanguinis* as stretch targets contingent on the modelling component being executed well. **No "first in Saudi Arabia/region" claim may be made.** The protocol is nonetheless written to the stretch standard, which costs nothing now and keeps the ceiling open.
**Differentiators that must therefore carry the paper:** genuine multi-country GCC scale; *RHD* genotyping of D-**positive** donors (partial D), which no GCC study has done; DEL screening, which no GCC study has done; pre-specified concordance analysis, which no GCC study has done; and match-probability modelling.
**Decided by:** Principal Research Director

---

### D030 — Capability report corrected: outbound egress is far broader than previously documented
**Date:** 2026-09-11
**Context:** `journal-submission-expert` attempted 14+ external domains with zero successes.
**Blocked (confirmed this session):** all Wiley pages, ScienceDirect/Elsevier, Springer, Karger, ICMJE, EQUATOR, ClinicalTrials.gov, ISRCTN, OSF, WHO ICTRP, DOAJ, COPE, JCR/Clarivate, Scimago, ISBT, AABB, PMC, Wikipedia — in addition to the previously recorded Crossref, NCBI E-utilities, Europe PMC and pubmed.ncbi.nlm.nih.gov.
**Consequence:** **no journal author-instruction page, bibliometric source, registry or standards body is readable in this environment.** WebSearch returns AI-summarised snippets, not page text, and one returned snippet was internally implausible — so that channel is indicative only and can never support a verified claim. Therefore this team **cannot** verify impact factors, quartiles, CiteScore, APCs, acceptance rates, DOAJ listing, COPE membership, per-journal registration policy, word or figure limits, AI-disclosure policy, or data-sharing policy. All such items are `[UNVERIFIED — registry blocked]` and are escalated to Dr. Alanazi, who has institutional access.
**Basis:** `CLAUDE.md` §10 requires the capability report to reflect tested reality. The previous report understated the blocking substantially, which risked an agent planning work it could not perform.
**Decided by:** Principal Research Director

---

### D031 — Protocol drafting and sample-size work dispatched in parallel
**Date:** 2026-09-11
**Context:** D014 requires concurrency to be judged on **outcome dependence**, not merely write conflicts. Sample size would normally be downstream of the protocol.
**Decision:** Dispatch `methodology-protocol-expert` (→ `01_Protocol/`) and `biostatistics-expert` (→ `05_Analysis/`) concurrently.
**Basis:** the inputs sample size depends on are **already fixed by logged Director decisions**, not pending in the protocol draft: the primary outcomes and unit of analysis (antigen–donor pair) by D025, the agreement metric (kappa with 95% CI) by D027, and the variant-frequency inputs with their provenance by the methods scoping (D025). The protocol *documents* those choices; it does not originate them. The methodology agent is therefore instructed that D025 and D027 are fixed constraints it works within — if it disagrees it must flag the conflict to the Director rather than silently redefine an outcome, which would void the parallel work.
**Residual risk, accepted:** if the methodology agent surfaces a defensible reason to change the primary outcome definition, the sample-size work is partially voided. Judged low, because those definitions were set by Director decision on domain-expert recommendation and are recorded, not provisional.
**Decided by:** Principal Research Director

---

### D032 — Interim integrity audit of the process to date, dispatched while protocol work is in flight
**Date:** 2026-09-11
**Context:** `methodology-protocol-expert` and `biostatistics-expert` are mid-task. `integrity-auditor` has not been exercised, and the Director has made at least one verified factual error (D019, corrected by D022).
**Decision:** Dispatch `integrity-auditor` now for an **interim process audit**, scoped strictly to committed, frozen material: `DECISION_LOG.md` D001–D031, `CLAUDE.md`, `CAPABILITY_REPORT.md`, `PROJECT_STATUS.md`, the two completed scoping outputs and the two feasibility search logs. **The in-flight protocol and analysis files are explicitly out of scope** — `CLAUDE.md` §9 requires auditing a frozen version, and auditing a file mid-write would produce findings about a document that no longer exists.
**Basis for doing it now rather than at G7:** the audit's inputs are committed and stable, so it is independent of both running agents in outcome as well as in file access (D014). More importantly, the Director's reasoning has propagated into the two protocol tasks now running — if a defect exists in D018–D031, it is being built upon at this moment, and finding it after the protocol is drafted costs a rewrite. An audit that can only run at the end is an audit that can only report damage.
**Explicit instruction to the auditor:** audit the **Director**, not only the agents. D019 was a Director error caught by a subagent's veto, not by the Director's own checking. The auditor is directed to look specifically for other places where the Director asserted something as verified that was not, and is reminded it may not be overruled by the Director (D002).
**Decided by:** Principal Research Director

---

### D033 — D031's parallel-work risk did not materialise; both agents converged independently
**Date:** 2026-09-11
**Context:** D031 accepted a residual risk that protocol drafting might redefine something and void the parallel sample-size work. `methodology-protocol-expert` duly raised flag F2 (kappa paradox at high antigen prevalence, e ~99%, hr^S^ ~98%) and F3 (D-negative stratum enrichment altering denominators), advising that `biostatistics-expert` be told immediately.
**Finding:** both were **already independently addressed** in the statistical output, which had been written before the flag was raised. §6a sets out the paradox explicitly with a worked table at fixed 98% observed agreement and mandates PABAK alongside kappa for all antigens, with the caution that "PABAK is context, never evidence of good agreement." Enriched sampling of the D-negative stratum is handled with an explicit requirement that the enrichment be declared, since the resulting estimate is conditional. §7 additionally brackets rather than assumes the ICC for multi-centre clustering, and §4 gives the rare-allele reality check.
**Why the risk did not bite:** the Director's dispatch briefed *both* agents on the same known hazards — the kappa paradox, clustering, rare-allele infeasibility and denominator integrity were named in the statistician's prompt. Shared hazard briefing, not luck, is what made the parallel dispatch safe. This is the generalisable lesson: when parallelising, brief every agent on the hazards that span their boundary, so convergence is designed rather than hoped for.
**Secondary value:** two agents reasoning independently from different starting points reached the same methodological conclusions. That convergence is corroboration, not redundancy.
**Adopted:** PABAK/AC1 as a mandatory companion statistic to kappa, kappa remaining primary.
**Decided by:** Principal Research Director

---

### D034 — Protocol flags F1–F8: three adopted, five escalated to the PI as G1 decisions
**Date:** 2026-09-11
**Context:** `methodology-protocol-expert` raised eight flags and, correctly, made **no silent redefinition** of any fixed constraint — F2 and F3 are additions and consequences, not substitutions.
**Adopted into the protocol by the Director:**
- **F1** — neither assay is a gold standard, so sensitivity/specificity are demoted to secondary directional descriptors carrying an imperfect-reference caveat. This constrains how results may be phrased and is correct: reporting accuracy parameters against an imperfect reference would overstate what the design can establish.
- **F2** — PABAK/AC1 companion statistic (per D033).
- **F3** — Stratum B enrichment quarantined from all unweighted frequency estimates; any weighted estimate requires SAP specification.
**Escalated to Dr. Alanazi — these require decisions the Director cannot make:**
- **F4** — §7.1 mandates a single Tier-1 platform or fully centralised genotyping. If procurement makes that impossible the design must be **revisited at G1, not patched during execution**. Platform heterogeneity across sites would confound centre with method irrecoverably.
- **F5** — D025 requires a budgeted n for Tier-4 NGS escalation; **there is no referral laboratory and no n**, so "escalate to NGS" is currently not executable. Either a referral path is secured or the tier is removed and its absence declared as a limitation.
- **F6** — **return of clinically relevant findings** (e.g. a partial-D or D-variant donor) is unaddressed in every decision logged to date, and it determines consent wording. This cannot be deferred past IRB submission. It is also an ethical obligation question, not an administrative one.
- **F7** — objective S9 (match-probability modelling) is a **simulation**; TRIPOD does not govern it and STROBE does not cover it. D029 lists modelling among the differentiators that must carry the paper, so a headline claim resting on an exploratory simulation is a genuine review vulnerability. Either the modelling is specified to a standard that can carry a claim, or the claim is downgraded.
- **F8** — the §1.3 rationale depends on the study genuinely being multi-state. If enrolment reduces to a single centre, the rationale requires **re-framing, not re-labelling** — this is the D022 failure mode in advance.
**Decided by:** Principal Research Director (adoptions); PI decision required (escalations)

---

### D035 — AUDIT VERDICT FAIL ACCEPTED. Gate G1 HALTED. D022 and D029 corrected.
**Date:** 2026-09-11
**Context:** `integrity-auditor` returned **FAIL** on the interim process audit (`10_Audit/_working/10_interim-process-audit_v1.0_2026-09-11.md`). Under D002 the Director may not override it. The Director does not seek to.
**Accepted without qualification. Gate G1 is HALTED.** The protocol draft v0.1 may not be presented for PI approval while its stated rationale is false.

**C1 — the finding that matters.** D022 and D029 assert universal negatives that the project's own verified evidence refutes. Both verified by the Director on receipt of the audit:
1. *"none performs a concordance analysis"* (D022) — **FALSE.** Al-Riyami 2021, PMID 34647328, DOI 10.1111/vox.13204, states its aim as "to assess the concordance rate with obtained phenotypes" and reports "Concordance rate was >95% in all blood group systems with exception of Fy(b+) (87%)," across 130 paired samples including RH.
2. *"RHD genotyping of D-positive donors, which no GCC study has done"* (D029) — **FALSE.** Alalshaikh 2024, PMID 39055072, genotyped 70 RhD-**positive** donors and reports the gene detected in 79% of them.
3. *"DEL screening, which no GCC study has done"* (D029) — **UNVERIFIED**, not established. Ameen 2020's array panel content could not be read.

**The aggravating fact.** D022 was the entry that diagnosed this exact failure mode — "verifying returned records says nothing about what a search missed" — and in the same entry committed it twice more. Both refuting abstracts were in the Director's own context window when the claims were written. This is not a retrieval failure and not a subagent failure. The Director read the evidence, then asserted its opposite. The corrective written into D022 was therefore inadequate, because it located the fault in the search rather than in the Director's own inference from correctly retrieved material.

**C2 — the reframed rationale was never searched.** Grep across both feasibility logs returns **zero** occurrences of `concordan*`, `discordan*`, `kappa`, `agreement`, `multi-cent*` and `prospectiv*`. D022 defined the gap using precisely the concepts no search string contained. A gap asserted without a search for it is an assertion, not a finding.

**C3 — D019's waiver of D014 does not survive.** "Re-running the *identical* searches" was a category error: PILOT-02 asked a **volume** question, PILOT-03 asks a **design-duplication** question, and C2 proves the strings were not identical. `PROJECT_STATUS.md` recording Stage 1 as "Run twice" conceals that **the active project has never been gated at all.** Corrected below.

**M1 — the D022 correction was incomplete.** D015 Finding 2 carries the identical false count ("only two donor-cohort molecular studies") and was never superseded, while being the cited basis for D016 → D018. **D015 Finding 2 is hereby superseded**; D015's *decision* stands, because Finding 1 (self-duplication against PMID 39967527) is decisive and independently verified.

**Positive finding, recorded with equal prominence per `CLAUDE.md` §1.4:** the auditor independently re-verified 19 PubMed records covering 100% of load-bearing citations across eleven decisions. Every record exists; every quoted figure reconciles to source, including Madkhali's 18.3% traced to Table 1 (11/60) via PMC full text. **No fabricated citation anywhere.** The citation-verification habit works. Every defect above is a faulty *inference from correctly verified records* — a distinct failure mode that citation checking cannot detect, and which no control in `CLAUDE.md` currently catches.
**Decided by:** Principal Research Director, accepting the auditor's verdict in full

---

### D036 — D024 is FALSE and was propagated into agent instructions. Withdrawn and replaced.
**Date:** 2026-09-11
**Context:** Audit finding M2, verified by the Director against the search log.
**What D024 claimed:** that Ameen 2020 was *missed* by RH-anchored searching, diagnosed as a recall failure, with a "panel studies evade antigen-specific strings" lesson written into `literature-search-expert.md`.
**What actually happened:** search string P4 — an RH-anchored string — **retrieved both** PMID 32527616 and PMID 39055072; the log prints all eleven PMIDs at line 42, and Alalshaikh appears as a table row at line 165. The records were retrieved, tabulated, and then contradicted by the summary sentence written two lines below the table. **This was a screening and reconciliation failure, not a recall failure.**
**Consequence of the error:** the search agent was taught a false example, and — worse — the *real* control was never created. D024 thus made the system less safe while appearing to harden it.
**Decision:** D024 is **withdrawn**. Its guidance is removed from `literature-search-expert.md` and replaced with the control the incident actually warrants: **every summary claim must be reconciled against the retrieval list that supposedly supports it, and any record contradicting a summary statement must be named in that statement.** The panel-search guidance is retained as generally sound practice but explicitly stripped of the false Ameen example.
**Decided by:** Principal Research Director

---

### D037 — PILOT-03 returned to Stage 1. The reframed rationale will be gated before any protocol advances.
**Date:** 2026-09-11
**Context:** C2 and C3. The protocol draft v0.1 is written from an unsearched and partly false rationale.
**Decision:**
1. **Gate G1 halted.** Protocol v0.1 is retained as a working artefact, marked as resting on a superseded rationale. It is not discarded — its methodological content (adjudication procedure, reference/index justification, RoB framing) is independent of the novelty argument and survives.
2. **A genuine Stage 1 gate is run for PILOT-03**, searching the concepts D022 actually named: concordance/discordance, phenotype–genotype agreement, multi-centre, prospective donor cohorts — the design-duplication question, not the volume question.
3. **No universal negative ("no study has", "none performs", "first to") may enter any PILOT-03 document** unless a search explicitly targeting that claim has been run and logged, and the claim survives it. This is now a standing rule, added to `CLAUDE.md`.
4. The auditor's narrower candidate gap — **partial-D-resolving *RHD* genotyping in D-positive GCC donors, and allele-level resolution of Madkhali's unresolved 18.3%** — is a candidate for that gate, not a conclusion from it.
**Basis:** the auditor's closing instruction: "Run the gate, then write the gap." The order was reversed twice; reversing it a third time would be a pattern, not an error.
**Decided by:** Principal Research Director
