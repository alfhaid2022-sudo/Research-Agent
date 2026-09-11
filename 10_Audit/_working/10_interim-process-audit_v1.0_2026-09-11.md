# INTERIM PROCESS AUDIT — PILOT-01 / 02 / 03 programme to date

**Auditor:** `integrity-auditor` (independent; did not draft, analyse or design any audited material)
**Date:** 2026-09-11
**Commissioned by:** D032
**Scope:** committed, frozen material only — `DECISION_LOG.md` D001–D032; `CLAUDE.md`; `00_Admin/CAPABILITY_REPORT.md`, `AGENT_REGISTRY.md`, `FILE_LOCKS.md`; `PROJECT_STATUS.md`; `CHANGELOG.md`; `01_Protocol/_working/01_pilot01-domain-scoping_v1.0_2026-09-11.md`; `01_Protocol/_working/01_pilot03-methods-scoping_v1.0_2026-09-11.md`; `02_Search/_working/FEASIBILITY_SEARCH_LOG.md`; `02_Search/_working/PILOT02_FEASIBILITY_LOG.md`; `09_Journal/_working/PILOT03_EARLY_JOURNAL_SCAN_2026-09-11.md`; `.claude/agents/*.md`.
**Explicitly NOT audited (in flight, per D032):** `01_Protocol/_working/01_pilot03-protocol_*`, `01_Protocol/_working/*strobe*`, anything under `05_Analysis/`. These were not opened.

---

## VERDICT: **FAIL**

A `FAIL` from this auditor **blocks Gate G8 absolutely**. The Principal Research Director may not override it. Only Dr. Fehaid M. Alanazi may override, and the override must be recorded in `DECISION_LOG.md` with his reasoning (D002; `CLAUDE.md` §4).

The failure is in the **record and the novelty argument**, not in the science of the proposed study. PILOT-03 is salvageable. Nothing found here requires abandoning it. What is required is that the rationale be restated to something true, and that a gate the Director waived be actually run.

**Recommendation to the Director:** the two in-flight tasks (`methodology-protocol-expert`, `biostatistics-expert`) are building on D022 and D029. Findings C1 and C2 below mean the novelty section they are writing is currently unsupportable. This should be transmitted to them now rather than after G1.

---

## 1. WHAT WAS ACTUALLY CHECKED

| Domain | Depth |
|---|---|
| Governance / decision trail | 100% — all 32 decisions read; every cross-reference traced |
| Citations | 17 records independently re-verified against PubMed, including **100%** of citations carrying load for D005, D008, D011, D015, D019, D022, D023, D025, D027, D028, D029. The `PILOT02_FEASIBILITY_LOG.md` P4 retrieval list was reconciled record-by-record against the log's own summary table |
| Numbers | Madkhali 2025 full text retrieved from PMC and every figure quoted in D025/D027/D029 recomputed against Tables 1–4 |
| Search reproducibility | Both feasibility logs read in full; string-level vocabulary coverage tested by grep |
| Capability claims | `CAPABILITY_REPORT.md` tested against the tools actually exposed in this session |

### Citations independently re-verified (all exist; all metadata as cited; **no fabrication found**)

According to PubMed: 40069098 ([DOI](https://doi.org/10.1080/03630269.2025.2471923)); 40066558 ([DOI](https://doi.org/10.7754/Clin.Lab.2024.240827)); 39535318 ([DOI](https://doi.org/10.1111/bjh.19837)); 39967527 ([DOI](https://doi.org/10.7754/Clin.Lab.2024.240914)); 41147787 ([DOI](https://doi.org/10.1111/tme.70040)); 34647328 ([DOI](https://doi.org/10.1111/vox.13204)); 32527616 ([DOI](https://doi.org/10.1016/j.transci.2020.102748)); 39055072 ([DOI](https://doi.org/10.4103/sjmms.sjmms_664_23)); 41833928 ([DOI](https://doi.org/10.1016/j.tracli.2026.03.002)); 41631680 ([DOI](https://doi.org/10.1111/tme.70064)); 39662013 ([DOI](https://doi.org/10.7754/Clin.Lab.2024.240710)); 36121188 ([DOI](https://doi.org/10.1111/vox.13361)); 42194795 ([DOI](https://doi.org/10.3390/jcm15103828)); 42704814 ([DOI](https://doi.org/10.1080/16078454.2026.2729588)); 42397021 ([DOI](https://doi.org/10.1111/tme.70098)); 42632288 ([DOI](https://doi.org/10.1016/j.transci.2026.104520)); 19112738 ([DOI](https://doi.org/10.2450/2008.0021-08)); 39288000 ([DOI](https://doi.org/10.1111/trf.18009)); 37152479 ([DOI](https://doi.org/10.1155/2023/3239960)).

**Positive finding, recorded with the same prominence as the negatives:** every bibliographic assertion checked was accurate. Pooled figures (18.2% Bawazir; 28.9%/I²=88.5% Alsalman; 39 + 19 studies / 9,005 + 3,867 patients Al-Allawi), page ranges, PROSPERO IDs, and Madkhali's 76.7% / 18.3% / 1.7% / 3.3% and V 21.8% / hr^S^ 97.8% / VS 24.8% / hr^B^ 93.2% all reconcile exactly to source. The 18.3% figure used in D025 and D027 is real (Madkhali Table 1: 11/60 = 18.33%) and correctly attributed. **The Director's citation-level verification habit works.** The defects below are all at the level of *inference from* correctly verified records — which is precisely the blind spot D022 identified and then failed to close.

---

## 2. FINDINGS

### CRITICAL — blocks submission

---

#### **C1 — The corrected rationale (D022) and the differentiator list (D029) both assert universal negatives that the Director's own verified records refute. Both are load-bearing and both are being built on right now.**

**File / location:** `DECISION_LOG.md` D022 ("Effect on PILOT-03", final paragraph); D029 ("Differentiators that must therefore carry the paper").

**Evidence:**

D022 states the defensible gap is that no such GCC study exists and that *"Every retrieved study is single-centre or single-country, uses a different platform, and **none performs a concordance analysis**."*

That last clause is **false**. Al-Riyami 2021 (PMID 34647328, [DOI](https://doi.org/10.1111/vox.13204)) — a study the Director names in D015, D019 and D022 and claims to have independently re-verified — states in its own abstract: *"This study aims at evaluating the genotypes of common blood group antigens in the Omani blood donors **and to assess the concordance rate with obtained phenotypes**."* It reports paired serology and genotype in 130 donors and *"Concordance rate was >95% in all blood group systems with exception of Fy(b+) (87%)"* — **all systems includes RH**. It is a GCC donor-cohort serology–genotype concordance study. The project's own scoping file records this verbatim (`01_pilot03-methods-scoping_v1.0_2026-09-11.md` §1.2, "Concordance **>95% in all systems except Fy(b+) at 87%**"), so the disconfirming evidence was in the Director's hands when D022 was written.

D029 states the paper must be carried by *"RHD genotyping of D-**positive** donors (partial D), which no GCC study has done; DEL screening, which no GCC study has done; pre-specified concordance analysis, which no GCC study has done."*

- *"RHD genotyping of D-positive donors … which no GCC study has done"* is **false**. Alalshaikh 2024 (PMID 39055072) genotyped 70 RhD-**positive** Saudi donors for *RHD* exons 3/4/7 and hybrid Rhesus box (79% *RHD*-negative haplotype detected). Ameen 2020 (PMID 32527616) typed **917 unselected** Kuwaiti donors — necessarily including D-positive donors — on an SNP DNA array and reports *"other RHD variants were detected."* The narrower claim that survives is: *no GCC study has performed partial-D-resolving RHD genotyping in serologically D-positive donors.* That is defensible; what is written is not.
- *"DEL screening, which no GCC study has done"* is **unverified**, not false. I could not establish the allele coverage of Ameen 2020's SNP array (ScienceDirect blocked; no PMC record). It must be tagged `[UNVERIFIED]` until the array panel is read.
- *"pre-specified concordance analysis, which no GCC study has done"* is narrowly survivable only because of the word "pre-specified"; as D022 restates it without that qualifier, it is false.

**Why this is CRITICAL and not MAJOR.** D022 was the decision in which the Director diagnosed its own failure mode — asserting an unchecked universal negative — and in the *same entry* replaced it with two more unchecked universal negatives, one of which is refuted by a paper cited three lines above. D029 then added two more. These four claims are the entire novelty argument for PILOT-03. `CLAUDE.md` §7 prohibits unsupported novelty claims and §1.1 prohibits asserting what has not been verified. `methodology-protocol-expert` is writing the protocol's rationale section from D022 at this moment.

**Required correction:**
1. Supersede D022's gap statement. Replace *"none performs a concordance analysis"* with a statement that is true of the retrieved corpus and is tagged to the retrieval: e.g. *"one GCC donor cohort (Al-Riyami 2021, n=130 paired) reports cross-system concordance including RH at the summary level; no GCC study reports RH-specific, allele-resolved serology–genotype concordance with a pre-specified discordance taxonomy."* Verify that narrower claim by search before it is used.
2. Supersede D029's differentiator list: narrow differentiator (b) to partial-D-resolving genotyping of D-positive donors, tag DEL coverage of Ameen 2020 as `[UNVERIFIED]`, and qualify the concordance differentiator.
3. Every gap statement must be phrased as a retrieval statement ("no such study was retrieved in PubMed + SciSpace on 2026-09-11, with the search limitations at §X") — never as an existence claim. The environment cannot support existence claims (see C2).

---

#### **C2 — The reframed rationale has never been searched. No executed string in either feasibility log contains any concordance, agreement, multi-centre or prospective vocabulary.**

**File / location:** `02_Search/_working/PILOT02_FEASIBILITY_LOG.md` (strings P1–P18); `02_Search/_working/FEASIBILITY_SEARCH_LOG.md` (S1–S14); `DECISION_LOG.md` D022.

**Evidence (grep over both logs, executed by this auditor):**

| Term | Occurrences across both search logs |
|---|---|
| `concordan*` | **0** |
| `discordan*` | **0** |
| `kappa` | **0** |
| `agreement` | **0** |
| `multicent* / multi-cent*` | **0** |
| `prospectiv*` | **0** |
| `genotype-phenotype` | **0** |

D022's gap is defined by exactly these concepts. Not one of them was ever put into a search string. The PILOT-02 strings were built on RH-variant vocabulary and donor-antigen-frequency vocabulary to answer a *volume* question for a review. They were never designed to test whether a multi-centre, prospectively-sampled, serology-anchored GCC concordance study exists, and therefore they cannot establish that one does not.

**Required correction:** run a targeted Stage 1 duplication check for PILOT-03 as now framed, with strings covering concordance / agreement / discrepancy / genotype-phenotype vocabulary, DEL and partial-D vocabulary, and the D024 panel-level strings, across PubMed and SciSpace. Log it under the naming convention. Carry the registry gap forward as the declared residual risk it already is. Until that is done, no protocol text may assert that the gap exists.

---

#### **C3 — D019 waived D014 — a Director decision two entries old — on a justification that does not survive inspection, and PILOT-03 has still never been gated.**

**File / location:** `DECISION_LOG.md` D014, D019; `PROJECT_STATUS.md` ("Workflow stages", Stage 1 marked ✅ "Run twice").

**Evidence:** D014 states Stage 1 feasibility *"is run **alone** and must return GO before any domain scoping, protocol drafting, or design selection is dispatched"*, and D013 promised PILOT-02 *"the same Stage 1 gate that closed PILOT-01, with no presumption of passing."* D019 waived that requirement for PILOT-03 on the grounds that *"Re-running the identical searches would consume an agent to reproduce a conclusion already in hand"* and that *"the same verified finding answers both gates in opposite directions."*

The justification is a category error. PILOT-02's gate asked *"is there enough literature to review?"* — a volume question. PILOT-03's gate asks *"has this specific primary study already been done or registered?"* — a duplication question about a study design. Those questions require different vocabulary, as C2 demonstrates empirically: the concordance/multi-centre/prospective concepts that define PILOT-03 appear in zero executed strings. The searches that would have been run were therefore **not** "identical".

The empirical test of the waiver is decisive: **within one decision of waiving the gate, the waived premise was found to be false** — not by the Director, but by a subagent's domain veto (D022). D019's stated residual gap (registries unreachable) remains unresolved and is now carried into G1. `PROJECT_STATUS.md` records Stage 1 as "Run twice — NO-GO both times", which is accurate for PILOT-01 and PILOT-02 and conceals that the **currently active project has never been gated at all**.

**Assessment of the reasoning as requested by D032:** this is post-hoc rationalisation of a convenient choice. The cost saved was one agent run. The cost incurred was a false premise entering four downstream decisions (D021, D022, D025, D029) and two agent dispatches. D014 was written by the Director specifically to prevent this, three decisions earlier, after exactly this cost was incurred on PILOT-01.

**Required correction:** run the PILOT-03 Stage 1 gate (this is the same action as C2). Correct `PROJECT_STATUS.md` Stage 1 to state plainly that PILOT-03 has not been feasibility-gated. Record the D014 waiver in a protocol deviation log as a deviation, per `CLAUDE.md` §1.5 — at present it is recorded as a judgement, not as a deviation from a standing rule.

---

### MAJOR — must fix

---

#### **M1 — D022's correction is incomplete. D015 still contains the identical false claim, has never been superseded, and is the cited basis for the entire PILOT-03 pivot.**

**File / location:** `DECISION_LOG.md` D015 "Finding 2"; propagated via D016 → D018.

**Evidence:** D015 states *"Only two are donor-cohort molecular studies: Madkhali 2025 … and Al-Riyami 2021 … Kuwait, Qatar, Bahrain and UAE returned nothing."* This is the same false statement D022 corrected in D019. D022 corrects **only D019**. D015 remains in the append-only log as an uncorrected "Finding", and D016 ("Two consecutive Stage 1 gates have closed on the same cause") and D018 (PILOT-03 opened) both rest on it. A reader of the log — including the PI at G1 — encounters the false count as a standing finding.

**Load-bearing check:** the PILOT-02 NO-GO itself **survives** this error. D015 Finding 1 (self-duplication against the PI's own PMID 39967527) was stated as decisive and is independently verified — abstract confirms PubMed/Embase/Cochrane, seven studies 2019–2024, Samtah/Jazan/Hail/Riyadh/Eastern/Taif/Najran, DCcee (R1r) predominant, donor recruitment and inventory management discussed. The NO-GO stands on Finding 1 alone. Only Finding 2 is defective.

**Required correction:** append a decision superseding D015 Finding 2, stating the corrected count (at least four GCC donor-cohort molecular RH datasets: Madkhali 2025, Al-Riyami 2021, Ameen 2020 n=917, Alalshaikh 2024 n=136), and stating explicitly that the PILOT-02 NO-GO is unaffected because Finding 1 was decisive.

---

#### **M2 — D022's root-cause analysis is wrong; D024 is factually false; and the false lesson has been written into a subagent's standing instructions while the real failure mode remains active.**

**File / location:** `DECISION_LOG.md` D022 ("Root cause — the substantive lesson"), D024 ("Probable mechanism"); `.claude/agents/literature-search-expert.md` §"Recall hazard: panel studies hide system-specific data (D024)"; `02_Search/_working/PILOT02_FEASIBILITY_LOG.md` P4.

**Evidence:** D022 concludes the lesson is that *"Verifying returned records says nothing about what a search **missed**."* D024 states *"Ameen 2020 is the largest GCC molecular RH dataset retrieved to date, yet the PILOT-02 feasibility search **did not surface it**"* and attributes this to antigen-specific strings missing panel studies.

**The search did surface it.** `PILOT02_FEASIBILITY_LOG.md` P4 — an RH-anchored string, described in the log as *"the single most informative count in this log"* — records: *"Records retrieved: 11 (PMIDs 42397021, 41147787, 39373300, **39055072**, 37122416, 36883669, 34647328, 33098316, **32527616**, 31724935, 23362929)."* Ameen 2020 is PMID **32527616**. Alalshaikh 2024 is PMID **39055072**. Both were retrieved by the RH-anchored string. Alalshaikh additionally appears as a **row in the log's own GCC RH-variant table** ("136 donors"), directly two lines above the summary sentence asserting "only 2 … are donor-cohort molecular studies".

So neither record was missed. The true failure mode is a **screening and reconciliation failure**: the search agent built a six-row summary table from an eleven-PMID retrieval, dropped Ameen and misclassified Alalshaikh, wrote a summary line contradicting its own table, and the Director adopted the summary line as a verified count without reconciling it against the PMID list printed in the same document. The log had already warned that this would happen — limitation 5: *"Where 'screened' counts appear above … they come from inspection of retrieved titles/abstracts by a single agent, unblinded and unreplicated, and should be treated as indicative only."* The Director quoted the resulting number as established fact anyway.

**Consequence:** `.claude/agents/literature-search-expert.md` now carries a standing instruction built on a false worked example. The broad-panel-string advice is good practice and should be kept, but the mechanism attributed to it is wrong, and the actual control needed — *reconcile every summary count against the retrieved record list before any decision quotes it* — does not exist anywhere in the agent set or in `CLAUDE.md`.

**Required correction:**
1. Supersede D024's "probable mechanism" with the evidence above; retain the broad-panel-string requirement on its own merits.
2. Correct the false example in `.claude/agents/literature-search-expert.md`.
3. Add a standing rule (agent instructions and/or `CLAUDE.md` §3): **no count in a summary table may be quoted in a decision until it has been reconciled, record by record, against the retrieval list it derives from.** Assign the reconciliation to a named step.
4. Amend D022's root-cause paragraph: the lesson is not only "completeness ≠ accuracy"; it is also that the Director verified three hand-picked records and treated that as verifying a summary it never reconciled.

---

#### **M3 — D031's justification for parallelising sample size with protocol drafting overstates what is fixed, and its risk assessment is an argument from authority.**

**File / location:** `DECISION_LOG.md` D031 ("Basis", "Residual risk, accepted").

**Evidence:** D031 claims *"the inputs sample size depends on are **already fixed by logged Director decisions**"* — naming the unit of analysis (D025), the agreement metric (D027) and the variant-frequency inputs (D025).

Those are necessary but not sufficient. A sample-size calculation for a kappa-based, clustered, antigen–donor-pair design additionally requires at minimum: (i) the **denominator stratum** for the *RHD* arm — all donors, or serologically D-negative/weak-D only (the single largest driver of n, and unresolved: D029 argues the study's differentiator is genotyping D-**positive** donors, which changes the stratum entirely); (ii) the **antigen panel**, which follows from the platform — D025 specifies only "one harmonised commercial platform", unnamed; (iii) the **number of participating sites** (unfixed; PI has not confirmed access, D020); (iv) the **intra-donor correlation** across antigens, which the antigen–donor-pair unit makes unavoidable and which depends on (ii). None of these is fixed by a logged decision. They are protocol content, and the protocol is being written concurrently.

The residual-risk assessment — *"Judged low, because those definitions were set by Director decision on domain-expert recommendation and are recorded, not provisional"* — is an argument from the status of the decision-maker, not from evidence. `CLAUDE.md` §9 requires disagreements and judgements to rest on evidence, not seniority. A definition does not become robust by being logged.

**Required correction:** either (a) fix items (i)–(iv) by explicit decision now and transmit them to `biostatistics-expert` as constraints, or (b) restate D031's residual risk honestly — that the *RHD*-arm denominator and the platform panel are open and that any sample-size figure produced before they close is conditional and must be recomputed. Option (b) costs nothing and is truthful.

---

#### **M4 — `PROJECT_STATUS.md` carries superseded PILOT-01/02 framing in the master document the in-flight agents and the PI read, and contradicts itself.**

**File / location:** `PROJECT_STATUS.md` — "Open risks" R1; "Workflow stages" rows 4–6; "Pending PI input (non-blocking)" Q2 and Q3.

**Evidence:**
- Q3 states: *"if the PI holds unpublished data, an original observational study (STROBE) is sequenced **after this pilot**."* The same document's first table states the active project **is** that original observational STROBE study (D018). Directly self-contradictory.
- Q2 frames the outstanding decision as *"determines whether the design can be upgraded from scoping review to systematic review"* — a PILOT-01 question, closed by D008 and D018.
- R1 describes the search limitation as *"may not satisfy a strict SR reviewer"* — review framing, no longer the design.
- Workflow stages 4–6 (search-strategy development, literature search & dedup at G2, screening & full-text eligibility at G3) describe an evidence-synthesis pipeline. For a primary laboratory study these stages are either inapplicable or mean something entirely different, and G2/G3 as written are not the gates PILOT-03 must pass.

**Required correction:** rewrite these four sections for the active design, or mark them explicitly as PILOT-01/02 history. This is not cosmetic: `CLAUDE.md` directs agents to this file for current state, and two agents are running against it now.

---

#### **M5 — `CAPABILITY_REPORT.md` and `AGENT_REGISTRY.md` assert tool capabilities I cannot reproduce, in a document whose entire value is that its entries were tested.**

**File / location:** `00_Admin/CAPABILITY_REPORT.md` ("Available and tested" table, rows "PubMed citation lookup" and "PubMed full text"); `00_Admin/AGENT_REGISTRY.md` (tool columns "PubMed×2/×3/×4/×6"); `.claude/agents/literature-search-expert.md` ("Related-articles (`find_related_articles`)").

**Evidence:** The report lists `lookup_article_by_citation` as **"✅ Tool present"**. `AGENT_REGISTRY.md` assigns `citation-verification-expert` "PubMed×6" and several agents "PubMed×4". In this auditor's session the PubMed MCP server exposes exactly **three** tools: `search_articles`, `get_article_metadata`, `get_full_text_article`. No `lookup_article_by_citation` and no `find_related_articles` is available. Tool scoping can only ever grant an agent a **subset** of what the server exposes, so "PubMed×6" is not achievable if the server exposes three.

**What I cannot verify:** I cannot inspect another agent's runtime toolset, so I cannot state categorically that these tools do not exist for some other agent. What I can state is that the report's own header — *"Every entry below was tested, not assumed"* — is not satisfied for these rows, that "Tool present" is not a test result, and that D030 already had to correct this same document for materially understating the egress blocking. A capability register that is wrong in both directions is a planning hazard: the citation-verification workflow at Stage 11 is scoped around a citation-resolution tool that may not exist.

**Required correction:** re-test and correct the PubMed tool inventory; state the exact tool names available; reconcile `AGENT_REGISTRY.md`'s tool counts to it; remove `find_related_articles` from `literature-search-expert.md` or confirm it. `CLAUDE.md` §10 requires exactly this.

---

### MINOR — should fix

- **m1 — D009 quotes an unscreened retrieval count as a fact about the literature.** D009: *"30 PubMed records exist on GCC donor red cell phenotype/genotype frequency"*. That is S13's raw count (`FEASIBILITY_SEARCH_LOG.md` S13), and the log's limitation 5 states retrieved counts are upper bounds, unscreened. Restate as "S13 retrieved 30 records, unscreened".

- **m2 — D023 asserts an unverified bibliographic relationship as fact.** D023 states *"Madkhali cites Alalshaikh"*. I retrieved Madkhali's full text (PMC13077421). The tool does not return the reference list, so the citation link could not be directly confirmed. The Introduction sentence — *"A recent study in Saudi Arabia revealed that most individuals with the RhD-negative phenotype are likely to see a homozygous, complete deletion of the [RHD] gene and that [RHD] allele deletion is prevalent among the RhD-positive phenotype"* — is a precise description of Alalshaikh 2024's two findings, so the claim is **strongly corroborated but not verified**. Tag it `[EVIDENCE — content match; reference list not retrievable in this environment]`. D023's substance (the priority claim is contested; do not restate it) is correct and should stand.

- **m3 — D029 states a bibliometric tier as a decision one entry before D030 records that all bibliometric sources are unreadable.** The source scan (`PILOT03_EARLY_JOURNAL_SCAN_2026-09-11.md` §Q4) carefully tags the tier judgement `[INFERENCE]` and states no impact factor or quartile is asserted anywhere. D029 drops the tag and states *"Target tier is realistically **mid-tier**"*. Restore the tag. (The underlying reasoning — that a comparable Saudi donor RH study landed in *Transfusion Medicine* — is sound and verified; PMID 41147787 confirms journal, volume 36(2), pages 158–164.)

- **m4 — `CLAUDE.md` §3 naming convention applied selectively.** `01_Protocol/_working/` files were renamed (CHANGELOG, 2026-09-11) after `transfusion-medicine-expert` flagged the deviation in its own return. `02_Search/_working/FEASIBILITY_SEARCH_LOG.md`, `02_Search/_working/PILOT02_FEASIBILITY_LOG.md` and `09_Journal/_working/PILOT03_EARLY_JOURNAL_SCAN_2026-09-11.md` remain non-compliant. The rule was enforced where an agent raised it and not otherwise.

- **m5 — The rename created dead cross-references in an append-only log.** D011 cites *"DOMAIN_SCOPING_2026-09-11.md sect. 2"*; `CHANGELOG.md` has three entries naming `DOMAIN_SCOPING_2026-09-11.md` and one naming `PILOT03_METHODS_SCOPING_2026-09-11.md`. None of those filenames now exists. The CHANGELOG `RENAME` line does not record the old→new mapping. Add a mapping entry so D011's evidential basis remains locatable.

- **m6 — Duplicate CHANGELOG entry.** `DOMAIN_SCOPING_2026-09-11.md` is recorded as CREATE twice, with different reasons. One is spurious.

- **m7 — CHANGELOG records this audit report as created before it was written.** The entry *"integrity-auditor · CREATE · 10_Audit/_working/10_interim-process-audit_v1.0_2026-09-11.md"* was committed in `c390799` (D032 dispatch), before any audit had been performed. Recording a state that does not yet exist is the same habit that produces "verified" claims that are not — in a governance file whose only function is to be an accurate record.

- **m8 — Two PI-assigned verification checks were dropped in transmission.** `PILOT03_EARLY_JOURNAL_SCAN_2026-09-11.md` §1.5 assigns Dr. Alanazi five checks. Checks 3 (confirm OSF Registries accepts this study type and which template) and 4 (ISRCTN UK-participant condition) do not appear in `PROJECT_STATUS.md` "Items the PI must resolve before G1 can close" or in `CAPABILITY_REPORT.md`'s PI-must-verify table. D026 carries the ISRCTN caveat but drops the OSF one — while *deciding* to register on OSF. If OSF turns out not to accept the design, D026's action is undeliverable and the registration window (which D026 itself calls unrecoverable) is at risk.

- **m9 — `PROJECT_STATUS.md` marks all 15 agents "Validated ✅" on evidence that does not support it.** The same file's R5 and `CAPABILITY_REPORT.md` record that spawning by name returns "Agent type not found"; only `transfusion-medicine-expert` is noted as spawn-tested; and the file's own "Workflow validation status" table lists "Independent audit" under **Not yet exercised** while row 15 is ticked Validated. The evidence supports "frontmatter and tools valid", not "validated".

- **m10 — `FILE_LOCKS.md` "Never parallelize: Audit while content is still changing — always audit a frozen, versioned copy."** D032 dispatches an audit while two agents write. The Director's scoping of this audit to frozen files is a correct and sufficient reading, and this auditor did not open the in-flight files. But the register still states a blanket prohibition that the current dispatch appears to breach. Amend the register to record the distinction (audit of frozen artefacts is permitted; audit of live files is not), or the next agent will read a rule the Director has apparently ignored.

---

## 3. IS THE D022 RATIONALE DEFENSIBLE? — the specific question posed by D032

**Answer: not as written. It fails the same way D019 did, and for the same reason.**

D022's gap: *"no multi-centre, prospectively-sampled, single-platform, serology-anchored RHD/RHCE concordance study exists in the GCC."*

Four independent attacks, in order of severity:

1. **One clause is simply false** (C1). Al-Riyami 2021 performed a GCC donor serology–genotype concordance analysis and reported it. A reviewer with PubMed access finds this in one search, and finds it in a paper the manuscript will itself cite.

2. **The claim was never searched** (C2). Zero concordance, agreement, multi-centre or prospective terms appear in any executed string. D022 replaced an untested existence claim with a differently-worded untested existence claim. The *form* of the error is identical to D019: a universal negative asserted from a search that was not designed to test it.

3. **The environment cannot support any existence claim about this literature, and the record already proves it.** `PILOT02_FEASIBILITY_LOG.md` documents (a) PubMed + SciSpace only — no Embase, Scopus, WoS, ICTRP, ClinicalTrials.gov, grey literature, Arabic-language journals or the Saudi Digital Library; (b) demonstrated Gulf MeSH under-indexing (P14 returned 4 records where free-text P15 returned 14, and a known eligible Omani record was absent from the MeSH run); (c) a worked false-negative (P12 returned **zero** for a title-phrase search of a paper that demonstrably exists). D019's registry gap is still open. Under those conditions the only honest formulation is a **retrieval** statement, not an existence statement. Note that this constraint does *not* dissolve the argument — it reshapes it. A retrieval statement with the limitations disclosed is publishable; an existence claim is not.

4. **What remains is design novelty, not knowledge novelty, and that is a weak card.** Strip the false and unverified clauses and the surviving differentiators are adjectives about the study's own design — multi-centre, prospective, single-platform, pre-specified. "Nobody has run exactly this configuration" is true of almost any study and reviewers discount it. The genuinely knowledge-shaped gaps the record *does* support are narrower and stronger, and they exist: **partial-D-resolving *RHD* genotyping in serologically D-positive GCC donors** (no retrieved GCC study does this; Alalshaikh tested exon presence only, which cannot resolve partial D; Madkhali genotyped *RHD* only in 60 D-negative/weak-D donors, per its own Methods §2.1); **allele-level resolution of the "other than weak D types 1, 2 and 3" category** (11/60, 18.3%, explicitly left unresolved by Madkhali's own Table 1 footnote and limitations); and **DEL screening**, pending verification of Ameen 2020's array coverage.

**Conclusion.** PILOT-03 has a real gap. It is narrower than D022 states, it is knowledge-shaped rather than adjective-shaped, and it has not yet been searched. The correct sequence is: run the gate (C2), then write the gap from what the gate returns — not the reverse, which is what has happened twice.

---

## 4. WHAT I COULD NOT VERIFY

Stated explicitly, because an audit claiming completeness it does not have is worse than no audit.

| Item | Why not |
|---|---|
| DOI registration independent of PubMed | Crossref blocked (403 at CONNECT) — confirmed, not assumed |
| Retraction / correction / expression-of-concern banners on any cited record | Publisher pages and `pubmed.ncbi.nlm.nih.gov` blocked. **No cited record has been screened for retraction.** This applies to all 19 records above |
| Madkhali 2025 reference list (bears on D023, m2) | PMC full text returned without references |
| Al-Riyami 2021 full text | No PMC record; abstract only. RH-specific concordance is reported at summary level in the abstract; whether the full text resolves it per-antigen is unknown |
| Ameen 2020 array panel — does it include DEL alleles? (bears on C1) | ScienceDirect blocked; no PMC record |
| Zaid & Mustafa 2020 MENA review (DOI 10.36462/H.BIOSCI.20221) | SciSpace metadata only; not in PubMed. Remains `[UNVERIFIED]` as the log states — correctly flagged there |
| Any registry, journal author-instruction, ISBT, DOAJ, COPE or bibliometric page | Blocked (D030) — independently re-confirmed against the journal scan's own test table |
| Whether an ongoing registered GCC RH-genotyping study exists | Registries unreachable. This is the largest open risk to PILOT-03 and remains exactly where D019 left it |
| Current ISBT RH allele table version (D025, D028) | `[UNVERIFIED]`; isbtweb.org blocked. Correctly flagged by the Director and carried to G1 |
| Whether other agents hold PubMed tools I do not (M5) | Cannot inspect another agent's runtime toolset |
| `01_pilot03-protocol_*`, `*strobe*`, `05_Analysis/**` | Out of scope by D032; not opened. **Nothing in this report says anything about them** |
| `01_pilot01-domain-scoping_v1.0_2026-09-11.md` | Read; belongs to a closed project (D008). Its DOIs sampled (10.2450/2008.0021-08, 10.1111/trf.18009) verified and accurately characterised. Not audited in depth, as it is voided work |

---

## 5. REQUIRED CORRECTIONS — numbered, located, verifiable

| # | Finding | File | Verifiable when |
|---|---|---|---|
| 1 | Supersede D022's gap statement; remove "none performs a concordance analysis" | `DECISION_LOG.md` | New entry exists naming Al-Riyami 2021's concordance analysis |
| 2 | Supersede D029's differentiator list; narrow (b), tag DEL `[UNVERIFIED]`, qualify concordance | `DECISION_LOG.md` | New entry exists |
| 3 | Restate all gap claims as retrieval statements, never existence claims | `DECISION_LOG.md`, protocol | No unqualified "no study exists" remains |
| 4 | Run the PILOT-03 Stage 1 duplication gate with concordance / multi-centre / prospective / DEL / partial-D vocabulary | `02_Search/_working/` | Log exists, conventionally named, strings verbatim with counts and dates |
| 5 | Record the D014 waiver as a protocol deviation; correct Stage 1 status | deviation log; `PROJECT_STATUS.md` | Deviation logged; status states PILOT-03 ungated |
| 6 | Supersede D015 Finding 2; state the NO-GO is unaffected (Finding 1 decisive) | `DECISION_LOG.md` | New entry exists |
| 7 | Supersede D024's mechanism; correct the false Ameen example in the agent file | `DECISION_LOG.md`; `.claude/agents/literature-search-expert.md` | Both updated |
| 8 | Add standing rule: reconcile every summary count to its retrieval list before any decision quotes it | `CLAUDE.md` §3 and/or agent files | Rule present and assigned |
| 9 | Fix or honestly restate D031's sample-size preconditions (RHD-arm denominator, platform panel, site count, intra-donor correlation) | `DECISION_LOG.md`; brief to `biostatistics-expert` | Constraints transmitted or risk restated |
| 10 | Rewrite the four superseded `PROJECT_STATUS.md` sections (R1, stages 4–6, Q2, Q3) | `PROJECT_STATUS.md` | No review-era framing presented as current |
| 11 | Re-test and correct the PubMed tool inventory and registry tool counts | `CAPABILITY_REPORT.md`; `AGENT_REGISTRY.md`; `literature-search-expert.md` | Exact tool names listed |
| 12 | m1–m10 as specified above | as listed | each individually checkable |

---

## 6. AUTHORITY

This verdict is **FAIL**. Under D002 and `CLAUDE.md` §4, a `FAIL` or unresolved `CONDITIONAL PASS` from the Integrity Auditor **blocks Gate G8 absolutely**. The Principal Research Director may not override it. Only **Dr. Fehaid M. Alanazi** may override, and the override must be recorded in `DECISION_LOG.md` with his reasoning.

This auditor will re-audit on request once corrections 1–12 are made. Corrections 1, 2, 4 and 6 are the ones that change the science; the rest change the record.

*According to PubMed. All PubMed-derived records cited in this report are listed with DOI links in §1.*
