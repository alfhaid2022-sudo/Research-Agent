# RE-AUDIT — PILOT-03 after the audit FAIL of 2026-09-11

**Auditor:** `integrity-auditor` (independent; drafted, analysed and designed none of the audited material)
**Date:** 2026-09-11 | **Supersedes nothing; extends** `10_Audit/_working/10_interim-process-audit_v1.0_2026-09-11.md`
**Scope:** D033–D042; `CLAUDE.md` §7; `02_Search/_working/PILOT03_GATE_LOG.md`; `01_Protocol/_working/01_pilot03-protocol_v0.1_2026-09-11.md`; `01_pilot03-strobe-checklist_v0.1_2026-09-11.md`; `01_pilot03-methods-scoping_v1.0_2026-09-11.md`; `PROTOCOL_DEVIATIONS.md`; all of `05_Analysis/_working/`; `PROJECT_STATUS.md`; `CHANGELOG.md`; `00_Admin/*`; `.claude/agents/literature-search-expert.md`.

---

## VERDICT: **FAIL**

A `FAIL` from this auditor **blocks Gate G8 absolutely**. The Principal Research Director may not override it. Only **Dr. Fehaid M. Alanazi** may override, and the override must be recorded in `DECISION_LOG.md` with his reasoning (D002; `CLAUDE.md` §4).

The gate itself (C2) is remediated and remediated well. The **correction is not complete for the fourth time**, and this time it includes an unhedged priority claim four lines below the protocol's own prohibition of priority claims.

---

## 1. WHAT WAS INDEPENDENTLY VERIFIED (state it before the defects)

| Check | Result |
|---|---|
| Sample-size reproducibility (D039 claim) | **CONFIRMED by re-execution.** `diff` of a clean re-run against the committed output = 4 lines, the generation timestamp only. Deterministic. |
| `NUMBER_REGISTRY.csv` — all 15 entries | **All line references resolve correctly** (lines 29, 33, 106, 119, 215, 218–223, 248, 266–272, 269, 364, 433, 438, 444–455, 453, 455). No orphan, no drift. |
| Haffener 2025 (PMID 40916454) | Exists; *Transfusion* 65(10):1922–1934; 98.7% prediction accuracy; 12 discordances; Lewis/Lutheran/MNS/P1 candidates. As cited. |
| Al Lawati 2021 thesis (DOI 10.24377/LJMU.T.00014274) | **Independently re-retrieved via SciSpace.** 203 serological D-negative Omani samples; 9/203 (4.43%) reclassified; DAR2.00, weak D 45, 41, 4.2, DIIIb, DVI.2 in cis/trans to DEL(IVS8-31T>C). The gate log's characterisation is exact. Accepting P4/P5 as REFUTED on this source is **sound**. |
| Vege & Westhoff (DOI 10.1007/978-1-4419-7512-6_11) | Verified: "RHD alleles were concordant … with the exception of seven alleles. For RHCE, all were concordant with the exception of six." Protocol's "7 *RHD* and 6 *RHCE*" is exact. |
| Kim 2009, Owaidah 2023, Meshi 2024, Madkhali 2025, Al-Riyami 2021, Alalshaikh 2024, Ameen 2020 | All exist; all metadata and quoted figures reconcile. 78/1027 = 7.6% ✓; 11/60 = 18.3% ✓; 67/708 = 9.46% ✓. |
| Gate log quality | Verbatim strings, `query_translation` recorded, a silently dropped operator disclosed, a failed query (`G7-FAILED`) recorded rather than hidden, a **self-reported recall failure** (G3 missed Madkhali), precision honesty ("this count must not be quoted as literature volume"), and an explicit reconciliation statement. This is a genuine gate. |
| `literature-search-expert.md` (M2) | **Remediated.** False Ameen example removed; reconciliation control installed and specific. |
| STROBE/STARD/JBI checklist | Genuinely completed to protocol stage; `[UNVERIFIED]` caveat on the instruments themselves is honest and correct. |

---

## 2. FINDINGS

### CRITICAL

**CR1 — An unhedged priority claim survives in the protocol body, four lines below the section that prohibits it.**
`01_pilot03-protocol_v0.1_2026-09-11.md` **line 130** (§1.5, item iii): *"supply **the first** *RH* variant allele frequencies from this population that are estimated on a single platform and are therefore comparable between centres."* §1.4 (line 126) prohibits exactly this; D041 lists such wording as prohibited; `CLAUDE.md` §7 forbids any universal negative not separately searched. "First single-platform frequencies from this population" was never a gate proposition and was never searched. **Required:** delete "the first"; restate as "supply *RH* variant allele frequencies estimated on a single platform, which the retrieved GCC studies (each using a different platform) do not provide."

**CR2 — §1.2 still reports the pre-gate count. It says four; the gate counted six, and the two missing records are the two that refuted the retracted claims.**
Line 70: *"Four donor-cohort molecular red cell genotyping datasets from GCC states were retrieved"* — table lists Ameen, Al-Riyami, Alalshaikh, Madkhali. `PILOT03_GATE_LOG.md` counts **six**, adding **Haffener 2025 (PMID 40916454)** and **Al Lawati 2021**. This is the identical defect as D015 Finding 2 ("only two"), now in the live G1 deliverable, one section above the retraction table that names both missing records. A PI reading §1.2 then §1.3.1 encounters a contradiction inside one page. **Required:** rewrite §1.2 to six rows with the gate log as source.

**CR3 — §10.2 restates D024 as fact. D024 was withdrawn as FALSE by D036.**
Line 544: *"Director decision D024 records the specific retrieval failure mode that concealed Ameen 2020: multi-antigen panel studies evade antigen-specific search strings."* Ameen 2020 was not concealed; PILOT-02 string P4 retrieved it (PMID 32527616, printed in that log). The protocol propagates a decision the Director withdrew as false, and `PROJECT_STATUS.md` records M2 as "✅ Withdrawn". **Required:** replace with the reconciliation-failure account from D036, and cite `PILOT03_GATE_LOG.md` as the evidence base.

### MAJOR

**MJ1 — Retracted universal negatives survive in four further locations, none marked.**
- `01_pilot03-methods-scoping_v1.0_2026-09-11.md` **line 211**: *"no GCC study retrieved in this session screened for DEL at all."* Refuted (Al Lawati 2021). This file is the protocol's cited evidence base (§10.2, §19.4).
- `DECISION_LOG.md` **D025 item 4**: DEL screening *"never examined in any GCC study."* D039 superseded D025's DEL *estimand*; nothing superseded this universal negative.
- `05_pilot03-sample-size-justification_v1.0_2026-09-11.md` **line 63**, `05_pilot03-sample-size_v1.0_2026-09-11.py` **line 385**, `05_pilot03-sample-size-output_v1.0_2026-09-11.txt` **line 142**: *"targets/alleles that no GCC study has ever measured."* DEL and DVI were measured in a GCC population by Al Lawati 2021. This one is compiled into the script, so it will reappear in every future output.

**MJ2 — The protocol still rests on the superseded D022 rationale in §17 and §18, contradicting the rewritten §1.3.**
§17 R15: multi-centre design is *"the study's central differentiator"* and *"the rationale in §1.3 no longer holds"* if it is lost. §18 F8: *"Standing condition on D022's rationale."* §1.3.4 item 2 now says the multi-centre property is *"the weakest claim in the protocol and is not load-bearing."* Both cannot be true. **Required:** rewrite R15 and F8 against §1.3.2/§1.3.4 and drop the D022 reference.

**MJ3 — A back-calculated numerator is presented as `[EVIDENCE]`, and the source contradicts it.**
§1.1: *"50/385 SCD (12.98%) and 7/53 thalassaemia (13.21%)"* `[EVIDENCE — Halawani 2022]`. The abstract reports **percentages only**; 50 and 7 are reverse-computed. The full text (PMC9017690) states *"56 antibodies were detected in **50 immunized patients**"* — 50 is the **total** across both groups, of whom 7 were thalassaemia. `CLAUDE.md` §1.3 forbids back-calculation unless pre-specified, documented and flagged as derived. **Required:** report percentages with n as denominators only, or flag both numerators `[DERIVED]`.

**MJ4 — The gate declared full text unreadable; it is readable in this environment, and reading it moves two verdicts.**
`PILOT03_GATE_LOG.md` header: *"No full text of any key study could be read."* Using `get_full_text_article`, I retrieved **PMC12531907** (Haffener 2025) in full. It states: *"One hundred healthy male and female Omani **blood donors** … attending the Sultan Qaboos University Hospital (SQUH) blood bank were randomly selected and consented"* — **single centre**, prospective, consented. Rh prediction accuracy 100%; D inferred by *RHD*/*RHCE* coverage ratio plus *RHD*Ψ (rs748783394); **no partial-D resolution and no DEL testing**. Consequences: P1's Haffener "challenger" is resolved (single-centre, so it does not contradict P1); P3's Haffener limb is resolved (Haffener does **not** resolve partial D), leaving only Ameen 2020's array panel unread. The prior audit had already read Madkhali via PMC, so the project's own record contradicted the header. This is audit finding **M5 unremediated**: `CAPABILITY_REPORT.md` still lists `lookup_article_by_citation` as "✅ Tool present" (absent in this session), and per-agent tool scoping is not documented — the gate agent had `find_related_articles`/`convert_article_ids` but no full-text tool.

**MJ5 — The protocol never cites the gate log.** `PILOT03_GATE_LOG.md` appears nowhere in the protocol: not in §10.2 (evidence base), not in §19.4 (related files), not in §1.3. The document that carries the entire corrected rationale is unreferenced by the document it corrects.

**MJ6 — Sample size: adopted in D039, absent from the G1 deliverables.** §6.4 (*"No sample size is stated here"*), §16 U13 (*"in progress, D031"*) and STROBE item 10 (*"no number is stated in this protocol"*) all predate D039's adoption of **n = 3,000 (12 × 250)**. The G1 package is internally inconsistent with the decision log.

**MJ7 (old M3, partially remediated) — D031's preconditions.** D039 honestly records ICC unanchored, planning-input fragility and the platform-prediction circularity — a real improvement. Still unfixed: the *RHD*-arm denominator (Stratum B enrichment, §6.3/Flag F3) and platform panel identity (U7) remain open while an n has been adopted. D039 does not state that the adopted n is conditional on them.

**MJ8 (old M4, partially remediated) — `PROJECT_STATUS.md`.** Still stale: R1 ("may not satisfy a strict SR reviewer"), workflow stages 4–6 (evidence-synthesis pipeline), Q2 ("upgraded from scoping review to systematic review"), Q3 ("an original observational study … is sequenced after this pilot" — the active project *is* that study). Newly stale: "Stage 1 gate **running**" and "C2 — Gate running now" after D041 closed it; stage 12 "Independent audit ⬜ not started" and "Independent audit — Not yet exercised" after two audits; all 15 agents still "Validated ✅" (m9).

### MINOR

- **mn1** — Gate-log reconciliation arithmetic: *"GCC records screened 12; excluded … 6; counted … 6."* The exclusion list names **seven** records (42397021, 37122416, 36883669, 39373300, Allawati 2022, 23362929, Irshaid 2002) and the table holds **13** records (one row carries two). 13 − 7 = 6 is right; 12 − 6 = 6 is the stated arithmetic and does not match the stated list. The new control produced an off-by-one on its first use.
- **mn2** — §1.3.2's surviving gap is **Saudi**-specific; the title, design and objectives remain **multi-state GCC**. The rationale no longer motivates the non-Saudi arms. Not dishonest, but a reviewer will ask.
- **mn3** — STROBE item 2 cites §1.3 as *"the gap, stated as a design-property gap **per D022**"*. Stale reference to the superseded decision.
- **mn4** — §1.2 asserts of Al-Riyami "no taxonomy, no CI, no adjudication algorithm described" from an abstract-only reading; the gate log records 14/112 Fy^b^ discrepancies adjudicated. Qualify as "not described in the abstract".
- **mn5** — `FILE_LOCKS.md`: the three locks are still 🟡 active and the register still states "Never parallelize: audit while content is still changing". This re-audit was dispatched onto actively locked files. Release the locks or record the frozen-artefact distinction (old m10, worse).
- **mn6** — `CHANGELOG.md` now records `PILOT03_GATE_LOG.md` as CREATE **twice** and the interim audit as CREATE **twice** (old m6/m7 recurring). The RENAME old→new mapping (old m5) is still absent, so D011's cited filename still does not exist.
- **mn7** — `PROTOCOL_DEVIATIONS.md` contains no entry for the D014 waiver (old required correction 5). Substantively moot — the gate was run — but the record item is unclosed.
- **mn8–mn12** — old m1, m2, m3, m4, m8 unaddressed; **U17** (reference list not citation-verified) remains open and, by the protocol's own §16, **blocks G1**.

---

## 3. THE FIVE SPECIFIC QUESTIONS

**(1) Is §1.3 safe?** The §1.3.2 wording is, on its own, the best formulation in this repository: it names the databases searched, names those not searched, names the two Saudi studies and what each did not do, and says plainly that it is a retrieval statement. The **implicature leak is not in §1.3.2 — it is in §1.3.4 and §1.5**. Framing a retrieval statement as "the contribution" (§1.3.4 item 1) invites the novelty reading, and §1.5(iii) then makes it explicit with "the first" (CR1). §1.3.4 items 2 and 4 are correctly hedged; item 3 is verified. **The retraction table omits one withdrawn claim** — D025 item 4's "never examined in any GCC study" — and the table's first row understates: "refuted in part — concordance limb false" is accurate, but the multi-centre limb is now also weakened by a record the gate could not read and I could (MJ4).

**(2) Is the correction complete?** No. Seven surviving instances (CR1, CR2, CR3, MJ1×4), one of them compiled into an executable script. Each is findable by a one-line grep for `first`, `no GCC study`, `never examined`, `D024`.

**(3) Is the gate sound?** Yes, with the caveats at MJ4 and mn1. P2, P4, P5 REFUTED are correct and independently confirmed. P3 UNVERIFIABLE should now be narrowed to Ameen 2020 alone. P1 SURVIVES is weak but honestly labelled, and MJ4 strengthens rather than undermines it. Grey-literature acceptance is sound: the thesis abstract is reproducibly retrievable and the refutation direction is the conservative one. Nothing else in the record depends on unverifiable grey literature.

**(4) Prior open findings.** M2 remediated. C1/C3/M1 remediated. C2 remediated (gate run). M3 partially (MJ7). M4 partially (MJ8). M5 open (MJ4). m1–m10 largely open. U17 open and blocking.

**(5) Does D042's self-diagnosis hold?** Partly, and it is too flattering. "Announcing a correction after fixing the most visible instance" describes the symptom. The mechanism this cycle is narrower and worse: **the Director corrects the sentence the auditor quoted, and does not re-derive the content that depended on it.** §1.2's count, §17/§18's dependencies, §10.2's D024 reference and §1.5's "first" are all logical dependents of the retracted claims; none was quoted by the auditor; none was touched. The decisive evidence is that D042's own standing corrective — grep for the retracted claim and every paraphrase before announcing — was announced and **not executed**; four of the seven survivors match a literal grep of the retracted wording. A corrective that fails on its first application is a stronger finding than any diagnosis of the pattern.

---

## 4. WHAT I COULD NOT VERIFY

| Item | Why |
|---|---|
| Ameen 2020 array panel (DEL coverage) | No PMC record; ScienceDirect blocked. P3 remains open on this limb alone. |
| Al Lawati 2021 beyond its abstract | LJMU repository blocked; SciSpace abstract only. Donor status still `[UNVERIFIED]`. |
| Al-Riyami 2021 full text | No PMC record. §1.2's negatives about it remain abstract-level. |
| Retraction/correction status of any cited record | Publisher and PubMed web pages blocked. **No record has been retraction-screened.** |
| Registries (OSF, ICTRP, ClinicalTrials.gov, ISRCTN) | Blocked. Duplication risk unchanged since D019. |
| Whether other agents hold PubMed tools I do not | Cannot inspect another agent's runtime toolset. My session exposes exactly three: `search_articles`, `get_article_metadata`, `get_full_text_article`. |
| Halawani 2022's own internal inconsistency (57 screen-positive vs 50 immunised vs 12.98% of 385) | Present in the source itself; not a PILOT-03 defect, but it makes the derived numerator unusable. |

---

## 5. REQUIRED CORRECTIONS

| # | Finding | File / location | Verifiable when |
|---|---|---|---|
| 1 | Delete "the first" | protocol line 130 | `grep -n "the first" ` returns only §1.4's prohibition |
| 2 | §1.2 → six datasets, add Haffener 2025 and Al Lawati 2021 | protocol lines 68–79 | table has six rows sourced to the gate log |
| 3 | Replace the D024 sentence with D036's account | protocol line 544 | no D024 reference outside the log |
| 4 | Mark/remove the four surviving DEL universal negatives | scoping l.211; D025 item 4; justification l.63; `.py` l.385 (re-run to regenerate output l.142) | grep for "no GCC study has ever measured" / "never examined" returns nothing unmarked |
| 5 | Rewrite §17 R15 and §18 F8 against §1.3.4 | protocol lines 749, 766 | no D022 dependency remains |
| 6 | Flag or remove the Halawani numerators | protocol §1.1 | `[DERIVED]` present or numerators removed |
| 7 | Correct the gate log header; record that PMC full text is retrievable by MCP; resolve P3's Haffener limb and P1's Haffener challenger | `PILOT03_GATE_LOG.md`; `CAPABILITY_REPORT.md` | header corrected; `lookup_article_by_citation` row re-tested |
| 8 | Cite `PILOT03_GATE_LOG.md` in protocol §10.2 and §19.4 | protocol | both present |
| 9 | Insert n = 3,000 or state why it is withheld; update U13 and STROBE item 10 | protocol §6.4, §16; checklist | consistent with D039 |
| 10 | State D039's n as conditional on the *RHD*-arm denominator and U7 | `DECISION_LOG.md` | conditionality recorded |
| 11 | `PROJECT_STATUS.md` R1, Q2, Q3, stages 4–6, 12, gate status, agent-validation column | `PROJECT_STATUS.md` | no review-era or pre-D041 framing |
| 12 | mn1–mn12 as listed | as listed | each individually checkable |

Corrections 1, 2, 3, 4 and 7 change what the paper may claim. The rest change the record.

---

## 6. AUTHORITY

**FAIL.** Under D002 and `CLAUDE.md` §4 this blocks Gate G8 absolutely. The Principal Research Director may not override it. Only **Dr. Fehaid M. Alanazi** may, and the override must be recorded in `DECISION_LOG.md` with his reasoning.

*According to PubMed, for all PubMed-derived records cited here: PMID 40916454 ([DOI](https://doi.org/10.1111/trf.18401)); 38948735 ([DOI](https://doi.org/10.1101/2024.06.17.599396)); 34647328 ([DOI](https://doi.org/10.1111/vox.13204)); 41147787 ([DOI](https://doi.org/10.1111/tme.70040)); 39055072 ([DOI](https://doi.org/10.4103/sjmms.sjmms_664_23)); 32527616 ([DOI](https://doi.org/10.1016/j.transci.2020.102748)); 38947563 ([DOI](https://doi.org/10.2147/IJGM.S444949)); 35450032 ([DOI](https://doi.org/10.2147/IJGM.S360320)); 36883669 ([DOI](https://doi.org/10.23750/abm.v94iS1.14120)); 19726900 ([DOI](https://doi.org/10.3343/kjlm.2009.29.4.361)); 37122416 ([DOI](https://doi.org/10.5001/omj.2023.11)); 39373300 ([DOI](https://doi.org/10.2478/immunohematology-2024-0014)). Non-PubMed records verified via SciSpace: Al Lawati 2021 ([DOI](https://doi.org/10.24377/LJMU.T.00014274)); Vege & Westhoff 2011 ([DOI](https://doi.org/10.1007/978-1-4419-7512-6_11)).*
