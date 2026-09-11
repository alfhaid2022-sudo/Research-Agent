# PROJECT_STATUS.md

**Principal Investigator:** Dr. Fehaid M. Alanazi
**Principal Research Director:** Claude (main session)
**Last updated:** 2026-09-11

---

## Current state

| Item | Value |
|---|---|
| **Active project** | **PILOT-02** — donor-side antigen architecture & RH variants in GCC populations (feasibility only, D013) |
| **Current stage** | Stage 1 feasibility running — no design fixed, no protocol drafted |
| **Current gate** | Pre-G1 — no protocol drafted; project stopped before protocol work began |
| **Blocked on** | Stage 1 GO/NO-GO verdict. Nothing downstream is dispatched until it returns (D014) |

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
| 1 | Project intake & feasibility | — | 🟡 PILOT-02 running (PILOT-01: ✅ NO-GO) |
| 2 | Research question & design selection | — | ⬜ Held pending Stage 1 |
| 3 | Protocol & reporting guideline | **G1** | ⬜ Not started |
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

1. 🟡 PILOT-02 Stage 1 feasibility — running alone, per D014
2. ⬜ Director independently verifies the decisive citations before acting on the verdict
3. ⬜ If GO: domain scoping, then protocol → **Gate G1 (PI approval)**. If NO-GO: report and re-scope.

## Open question the gate must answer

Whether the gap is **review-shaped** (enough scattered primary studies exist to map) or **primary-research-shaped** (the Gulf RH-variant studies do not exist, so there is nothing to review). This decides whether PILOT-02 is a review at all — and a "too sparse to review, good primary study" answer is a useful finding, not a failure.

## Why PILOT-01 stopped

The topic was published twice in 2025 (PMID 40069098; PMID 40066558). Note that the Saudi meta-analysis searched six databases including Scopus and Embase — so this is **not** an artefact of this environment's PubMed-only limitation, and institutional database access would not reopen the topic.

**The feasibility gate worked as designed: it cost one agent run instead of a desk rejection.**

## Pending PI input (non-blocking)

- **Q2 — institutional database access** (Scopus/Embase/Cochrane/WoS): determines whether the design can be upgraded from scoping review to systematic review. Must be resolved before Gate G2.
- **Q3 — unpublished data / active IRB**: if held, an original observational study (STROBE) is sequenced after this pilot.
