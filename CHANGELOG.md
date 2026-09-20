# CHANGELOG.md

Append-only record of every file created or modified. Newest first.

**Format:** `YYYY-MM-DD · <agent> · <action> · <file> · <reason>`

---

## 2026-09-11

- `2026-09-11 · Director · CREATE · 00_Admin/AGENT_REGISTRY.md · Agent registry with tools, I/O and dependencies`
- `2026-09-11 · Director · CREATE · 00_Admin/CAPABILITY_REPORT.md · Tested capability inventory (available vs unavailable)`
- `2026-09-11 · Director · CREATE · 00_Admin/FILE_LOCKS.md · Concurrency control register`
- `2026-09-11 · Director · CREATE · EVIDENCE_MAP.xlsx · Evidence traceability workbook (5 sheets)`
- `2026-09-11 · Director · CREATE · CHANGELOG.md · This file`
- `2026-09-11 · Director · CREATE · DECISION_LOG.md · Decision record, entries D001–D004`
- `2026-09-11 · Director · CREATE · PROJECT_STATUS.md · Master status, gates, risk register`
- `2026-09-11 · Director · CREATE · .claude/agents/*.md (15 files) · Specialist agent definitions`
- `2026-09-11 · Director · CREATE · CLAUDE.md · Mandatory team research rules`
- `2026-09-11 · Director · CREATE · 00_Admin … 10_Audit (33 dirs) · Workspace with _originals/_working/_approved per stage`
- `2026-09-11 · transfusion-medicine-expert · CREATE · 01_Protocol/_working/DOMAIN_SCOPING_2026-09-11.md · Stage 2 PCC concept space, definitional-heterogeneity analysis, extraction variable set, expected specificities, evidence tiers`
- `2026-09-11 · Director · FIX · DECISION_LOG.md · Renumbered colliding agent entries D008/D009 → D010/D011; appended D012 recording the collision, root cause and fix`
- `2026-09-11 · Director · UPDATE · CLAUDE.md · §3 governance files are Director-write-only`
- `2026-09-11 · Director · UPDATE · .claude/agents/*.md (14) · Appended the governance-write prohibition to every agent with Write access`
- `2026-09-11 · Director · UPDATE · 00_Admin/FILE_LOCKS.md · Added Director-write-only register; released PILOT-01 locks`
- `2026-09-11 · transfusion-medicine-expert · CREATE · 01_Protocol/_working/DOMAIN_SCOPING_2026-09-11.md · PCC concept space + 11 documented definitional divergences`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D013 PILOT-02 opened (feasibility only); D014 feasibility runs alone before downstream work`
- `2026-09-11 · Director · UPDATE · PROJECT_STATUS.md · PILOT-02 Stage 1 in progress`
- `2026-09-11 · literature-search-expert · CREATE · 02_Search/_working/PILOT02_FEASIBILITY_LOG.md · PILOT-02 duplication check search log`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D015 PILOT-02 NO-GO (self-duplication); D016 reframe recommendation; D017 RHD search hazard`
- `2026-09-11 · Director · UPDATE · .claude/agents/literature-search-expert.md · Added precision-hazard table (D017)`
- `2026-09-11 · literature-search-expert · CREATE · 02_Search/_working/PILOT02_FEASIBILITY_LOG.md · 18 searches P1-P18`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D018 PILOT-03 opened; D019 feasibility not re-run (novelty already verified); D020 wet-lab/regulatory scope boundary`
- `2026-09-11 · Director · UPDATE · PROJECT_STATUS.md · PILOT-03 Stage 2-3`
- `2026-09-11 · transfusion-medicine-expert · CREATE · 01_Protocol/_working/PILOT03_METHODS_SCOPING_2026-09-11.md · RH genotyping methods scoping`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D021 early journal/registration scan dispatched in parallel with methods scoping`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D022 corrects D019 premise; D023 Madkhali priority contested; D024 recall hazard; D025 methods recommendations adopted`
- `2026-09-11 · Director · UPDATE · .claude/agents/literature-search-expert.md · Added recall-hazard guidance (D024)`
- `2026-09-11 · Director · RENAME · 01_Protocol/_working/*.md · Applied CLAUDE.md §3 naming convention`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D026 OSF prospective registration; D027 STROBE+STARD; D028 ISBT nomenclature; D029 mid-tier target, no "first" claim; D030 egress far broader than documented`
- `2026-09-11 · Director · UPDATE · 00_Admin/CAPABILITY_REPORT.md · Corrected egress scope; added PI-must-verify table`
- `2026-09-11 · journal-submission-expert · CREATE · 09_Journal/_working/PILOT03_EARLY_JOURNAL_SCAN_2026-09-11.md · Early scan; all journal pages blocked`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D031 protocol and sample-size dispatched in parallel`
- `2026-09-11 · Director · UPDATE · 00_Admin/FILE_LOCKS.md · Claimed protocol and analysis working files`
- `2026-09-11 · Director · UPDATE · PROJECT_STATUS.md · Stage 3; added PI-must-resolve list for G1`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D032 interim process audit dispatched; scoped to frozen material, directed at the Director`
- `2026-09-11 · integrity-auditor · CREATE · 10_Audit/_working/10_interim-process-audit_v1.0_2026-09-11.md · Interim audit of D001-D032`
- `2026-09-11 · methodology-protocol-expert · CREATE · 01_Protocol/_working/01_pilot03-protocol_v0.1_2026-09-11.md · PILOT-03 protocol draft v0.1 (20 sections, 40 [UNVERIFIED] flags carried)`
- `2026-09-11 · biostatistics-expert · CREATE · 05_Analysis/_working/05_pilot03-sample-size_v1.0_2026-09-11.py · Sample-size calculation script (parses clean)`
- `2026-09-11 · biostatistics-expert · CREATE · 05_Analysis/_working/05_pilot03-sample-size-output_v1.0_2026-09-11.txt · Sample-size output`
- `2026-09-11 · methodology-protocol-expert · CREATE · 01_Protocol/_working/01_pilot03-strobe-checklist_v0.1_2026-09-11.md · STROBE 1-22 + STARD methods + JBI prevalence domains`
- `2026-09-11 · methodology-protocol-expert · CREATE · 01_Protocol/_working/PROTOCOL_DEVIATIONS.md · Deviation log stub, inactive until G1 freeze`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D033 parallel risk did not materialise; D034 flags F1-F8 triaged`
- `2026-09-11 · integrity-auditor · CREATE · 10_Audit/_working/10_interim-process-audit_v1.0_2026-09-11.md · Interim audit, verdict FAIL`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D035 FAIL accepted, G1 halted, D022/D029 corrected, D015 Finding 2 superseded; D036 D024 withdrawn as false; D037 PILOT-03 returned to Stage 1`
- `2026-09-11 · Director · UPDATE · .claude/agents/literature-search-expert.md · Removed false D024 lesson; installed reconciliation control`
- `2026-09-11 · Director · UPDATE · CLAUDE.md · §7 universal-negative rule added`
- `2026-09-11 · Director · UPDATE · PROJECT_STATUS.md · Corrected "Run twice" concealment; G1 marked halted`
- `2026-09-11 · Director · UPDATE · 01_Protocol/_working/01_pilot03-protocol_v0.1_2026-09-11.md · Superseded-rationale banner`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D038 gate designed as five falsifiable propositions`
- `2026-09-11 · Director · UPDATE · PROJECT_STATUS.md · Gate running; added open audit-correction tracker`
- `2026-09-11 · literature-search-expert · CREATE · 02_Search/_working/PILOT03_GATE_LOG.md · PILOT-03 Stage 1 gate log`
- `2026-09-11 · biostatistics-expert · CREATE · 05_Analysis/_working/*.md,.py,.txt,.sps,NUMBER_REGISTRY.csv · Sample size n=3000 (12x250), SAP skeleton, SPSS syntax, 15-entry number registry`
- `2026-09-11 · Director · VERIFY · 05_Analysis/_working/05_pilot03-sample-size_v1.0_2026-09-11.py · Re-ran independently; output byte-identical except timestamp`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D039 sample-size package adopted; D040 parallelism cost recorded`
- `2026-09-11 · literature-search-expert · CREATE · 02_Search/_working/PILOT03_GATE_LOG.md · Stage 1 gate: 11 PubMed + 5 SciSpace strings, P1-P5 verdicts`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D041 gate result GO WITH NARROWED CLAIM; 3 of 5 propositions refuted`
- `2026-09-11 · Director · UPDATE · 01_Protocol/_working/01_pilot03-protocol_v0.1_2026-09-11.md · Rationale replaced with gate-supported wording`
- `2026-09-11 · Director · UPDATE · 01_Protocol/_working/01_pilot03-protocol_v0.1_2026-09-11.md · §1.3 fully rewritten; retraction table added`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D042 D041 correction was incomplete; standing grep-before-announcing corrective`
- `2026-09-11 · integrity-auditor · CREATE · 10_Audit/_working/10_reaudit_v1.0_2026-09-11.md · Re-audit, verdict FAIL`
- `2026-09-11 · Director · UPDATE · protocol, methods-scoping, gate log, sample-size .py/.txt/registry, CAPABILITY_REPORT, DECISION_LOG · 12 audit corrections applied and verified`
- `2026-09-11 · Director · UPDATE · 05_Analysis/_working/NUMBER_REGISTRY.csv · Provenance note: input SHA changed, all numeric values unchanged`
- `2026-09-11 · Director · UPDATE · 01_Protocol/_working/01_pilot03-protocol_v0.1_2026-09-11.md · §1.1 Halawani numerators corrected to NR; source inconsistencies recorded`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D044 back-calculation corrected; external source found internally inconsistent`
- `2026-09-11 · citation-verification-expert · CREATE · 07_References/_working/*.csv,.md,.ris,.bib,.py · 16 records, 39 claims verified; 0 fabrications`
- `2026-09-11 · Director · UPDATE · 01_Protocol/_working/01_pilot03-protocol_v0.1_2026-09-11.md · §1.1 third correction; Haffener contradiction removed; superlative removed; Al Lawati label corrected`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D045 retracts D044; zero fabricated citations`
- `2026-09-11 · Director · UPDATE · 01_Protocol/_working/01_pilot03-protocol_v0.1_2026-09-11.md · All 12 citation blockers closed; 7 PMIDs added; Vege & Westhoff completed`
- `2026-09-11 · Director · UPDATE · DECISION_LOG.md · D046 U17 discharged`
- `2026-09-20 · Director · CREATE · .claude/agents/literature-searcher.md, reference-auditor.md, hematology-reviewer.md, methodology-reviewer.md · Four read-only manuscript review agents; model: inherit, permissionMode: default`
- `2026-09-20 · Director · UPDATE · .claude/agents/scientific-writer.md · model: inherit, permissionMode: default; Edit tool removed; revision-mode, missing-fact placeholder and injection-handling rules added`
- `2026-09-20 · Director · CREATE · MANUSCRIPT_REVIEW_USAGE.md · Parallel five-agent review pass usage guide`
- `2026-09-20 · Director · UPDATE · USAGE.md · Agent count 15 to 19; pointer to MANUSCRIPT_REVIEW_USAGE.md`
