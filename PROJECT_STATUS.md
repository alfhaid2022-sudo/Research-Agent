# PROJECT_STATUS.md

**Principal Investigator:** Dr. Fehaid M. Alanazi
**Principal Research Director:** Claude (main session)
**Last updated:** 2026-09-11

---

## Current state

| Item | Value |
|---|---|
| **Active project** | **PILOT-03** — primary multi-centre GCC donor RHD/RHCE genotyping study (D018) |
| **Current stage** | Stage 3: protocol drafting + sample size (parallel, D031) |
| **Current gate** | Working toward **G1** (protocol approval) |
| **Blocked on** | Nothing. PI's sample/IRB/genotyping access (Q3) still unanswered but **non-blocking** — the deliverable is the protocol, which is what an IRB application needs (D020) |

---

## Team status

| # | Agent | Defined | Validated | Notes |
|---|---|---|---|---|
| 1 | principal-research-director | ✅ | ✅ | Main session |
| 2 | hematology-expert | ✅ | ✅ | Frontmatter + tools valid |
| 3 | transfusion-medicine-expert | ✅ | ✅ | Spawn-tested |
| 4 | methodology-protocol-expert | ✅ | ✅ | |
| 5 | literature-search-expert | ✅ | ✅ | |
| 6 | screening-eligibility-expert | ✅ | ✅ | |
| 7 | citation-verification-expert | ✅ | ✅ | |
| 8 | data-extraction-manager | ✅ | ✅ | |
| 9 | biostatistics-expert | ✅ | ✅ | |
| 10 | research-automation-expert | ✅ | ✅ | |
| 11 | scientific-writer | ✅ | ✅ | |
| 12 | tables-figures-expert | ✅ | ✅ | |
| 13 | mechanism-graphics-expert | ✅ | ✅ | |
| 14 | journal-submission-expert | ✅ | ✅ | |
| 15 | integrity-auditor | ✅ | ✅ | |

---

## Workflow stages

| # | Stage | Gate | Status |
|---|---|---|---|
| 0 | Team setup & capability verification | — | ✅ Complete |
| 1 | Project intake & feasibility | — | ✅ Run twice — **NO-GO** both times |
| 2 | Research question & design selection | — | ✅ Primary observational lab study (D018) |
| 3 | Protocol & reporting guideline | **G1** | 🟡 Drafting |
| 4 | Search-strategy development & peer review | — | ⬜ |
| 5 | Literature search & deduplication | **G2** | ⬜ |
| 6 | Screening & full-text eligibility | **G3** | ⬜ |
| 7 | Extraction & risk-of-bias assessment | — | ⬜ |
| 8 | Statistical / qualitative synthesis | **G4, G5** | ⬜ |
| 9 | Manuscript drafting | **G6** | ⬜ |
| 10 | Statistical figures & conceptual graphics | — | ⬜ |
| 11 | Reference-library verification | — | ⬜ |
| 12 | Independent audit | **G7** | ⬜ |
| 13 | Journal selection & formatting | — | ⬜ |
| 14 | Final submission package | **G8** | ⬜ |

Legend: ⬜ not started · 🟡 in progress · 🔴 blocked · ✅ complete

---

## Open risks

| ID | Risk | Impact | Mitigation | Status |
|---|---|---|---|---|
| R1 | Only PubMed + SciSpace searchable; Scopus/Embase/Cochrane/WoS unavailable | Reduced search sensitivity; may not satisfy a strict SR reviewer | Write native strings for PI to run at institution; disclose in limitations | 🔴 Open |
| R2 | Crossref / NCBI E-utilities / Europe PMC blocked by egress policy | Cannot independently confirm DOI registration, page numbers, publisher corrections | Verify via PubMed MCP + SciSpace; mark residual fields `[UNVERIFIED — registry blocked]` | 🔴 Open |
| R3 | No SPSS in environment | Cannot produce native SPSS output | Analyse in Python; deliver annotated `.sps` syntax for PI to reproduce; document any default differences | 🟡 Mitigated |
| R4 | No EndNote application | Cannot import/verify final library in EndNote | Deliver validated RIS/BibTeX/ENW/XML; PI imports and confirms | 🟡 Mitigated |
| R5 | Named subagents not registered until session restart | Delegation by name unavailable this session | Use role-file injection via general-purpose agent (validated); names activate next session | 🟡 Mitigated |

---

## Next actions

1. ✅ `transfusion-medicine-expert` — methods scoping (vetoed the Director's premise; D022)
2. ✅ `journal-submission-expert` — early scan (mid-tier target, register prospectively; D026–D030)
3. 🟡 `methodology-protocol-expert` — protocol + STROBE checklist
4. 🟡 `biostatistics-expert` — sample size + SAP skeleton
5. ⬜ Director integrates, re-verifies citations, checks constraint compliance
6. ⬜ **Gate G1 — PI approval**

## Items the PI must resolve before G1 can close

| Item | Status |
|---|---|
| Current ISBT RH allele table version | `[UNVERIFIED]` — ISBT pages blocked (D028) |
| Registry check for an ongoing GCC RH-genotyping study | Not performed — registries unreachable (D019) |
| Per-journal registration policy | `[UNVERIFIED]` — all journal pages blocked (D030) |
| Sample access, IRB status, genotyping capability | Unanswered since first response (D020) |

## What this team can and cannot deliver for PILOT-03 (D020)

| Team delivers | PI owns |
|---|---|
| Protocol, design, eligibility, variables | Donor sample access |
| Laboratory methods specification | IRB submission and approval |
| Statistical analysis plan + sample size | Informed consent |
| STROBE checklist, data-management plan | Wet-lab execution |
| IRB-ready documentation | Genotyping platform procurement |

The protocol is exactly what an IRB application requires, so this work is useful whether or not sample access already exists.

## Declared residual risk carried to G1 (D019)

Trial and protocol registries (PROSPERO, ClinicalTrials.gov, ICTRP) could not be queried in this environment. An unpublished or ongoing registered GCC RH-genotyping study would not have been detected. The methods-scoping task will attempt a registry check; if it remains unresolved this is declared at G1, not dropped.

## Two gates, one pattern

Both NO-GOs closed on the same cause: the review space in this niche is already occupied — in PILOT-02's case **by the PI's own 2025 review** (PMID 39967527). The gate answered its question: the gap is **primary-research-shaped**, not review-shaped.

Cost so far: two agent runs. Cost avoided: two redundant manuscripts, one of which would have duplicated the PI's own prior publication.

## Workflow validation status

| Exercised and proven | Not yet exercised |
|---|---|
| Subagent spawning & isolation | Extraction & data management |
| Tool scoping | Biostatistics & SAP |
| PubMed/SciSpace retrieval | Manuscript drafting |
| Director-side citation re-verification | Tables & figures |
| Feasibility gating (×2) | Conceptual graphics |
| Decision logging & collision recovery | Independent audit |
| Concurrency control | Journal selection |

## Why PILOT-01 stopped

The topic was published twice in 2025 (PMID 40069098; PMID 40066558). Note that the Saudi meta-analysis searched six databases including Scopus and Embase — so this is **not** an artefact of this environment's PubMed-only limitation, and institutional database access would not reopen the topic.

**The feasibility gate worked as designed: it cost one agent run instead of a desk rejection.**

## Pending PI input (non-blocking)

- **Q2 — institutional database access** (Scopus/Embase/Cochrane/WoS): determines whether the design can be upgraded from scoping review to systematic review. Must be resolved before Gate G2.
- **Q3 — unpublished data / active IRB**: if held, an original observational study (STROBE) is sequenced after this pilot.
