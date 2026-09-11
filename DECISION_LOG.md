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
