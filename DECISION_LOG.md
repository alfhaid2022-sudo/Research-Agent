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
