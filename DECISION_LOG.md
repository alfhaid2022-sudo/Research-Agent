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
