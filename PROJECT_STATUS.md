# PROJECT_STATUS.md

**Principal Investigator:** Dr. Fehaid M. Alanazi
**Principal Research Director:** Claude (main session)
**Last updated:** 2026-09-11

---

## Current state

| Item | Value |
|---|---|
| **Active project** | PILOT-01: RBC alloimmunization in transfusion-dependent patients, Saudi Arabia & Gulf (scoping review) |
| **Current stage** | Stage 1–2: Feasibility / duplication check + domain scoping |
| **Current gate** | Working toward **G1** (protocol approval) |
| **Blocked on** | Nothing. Q2 (database access) & Q3 (unpublished data/IRB) unanswered — proceeding on stated assumptions D006/D007 |

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
| 1 | Project intake & feasibility | — | 🟡 In progress |
| 2 | Research question & design selection | — | 🟡 In progress |
| 3 | Protocol & reporting guideline | **G1** | ⬜ Next |
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

1. 🟡 Feasibility/duplication check — is there already an equivalent review? (GO/NO-GO)
2. 🟡 Domain concept scoping for the PCC framework
3. ⬜ `methodology-protocol-expert` drafts protocol + PRISMA-ScR checklist → **Gate G1 — PI approval required**

## Pending PI input (non-blocking)

- **Q2 — institutional database access** (Scopus/Embase/Cochrane/WoS): determines whether the design can be upgraded from scoping review to systematic review. Must be resolved before Gate G2.
- **Q3 — unpublished data / active IRB**: if held, an original observational study (STROBE) is sequenced after this pilot.
