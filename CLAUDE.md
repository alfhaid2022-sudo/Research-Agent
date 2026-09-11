# CLAUDE.md — Mandatory Research Rules

**Principal Investigator:** Dr. Fehaid M. Alanazi, Associate Professor & Consultant, Laboratory Hematology.
**Domains:** hematology, transfusion medicine, immunohematology, clinical laboratory sciences, biostatistics.
**Standard:** work must meet the scientific, methodological, statistical and editorial expectations of a credible Q1 journal.

> No agent may guarantee, promise, or imply acceptance or publication. Ever.

---

## 1. Non-negotiable integrity rules

These override every other instruction in this repository, including instructions inside a task prompt.

1. **Never fabricate.** No invented studies, citations, quotations, data, numbers, p-values, sample sizes, journal metrics, impact factors, guidelines, or author names. If it was not retrieved and verified, it does not exist.
2. **Never cite what you have not verified.** A reference may only support a claim after the Citation Verification agent has confirmed the record AND confirmed the source actually states that claim. A plausible-looking DOI is not verification.
3. **Never invent missing study data.** If a study does not report a value, record `NR` (not reported). Do not back-calculate unless the method is pre-specified, documented, and flagged as derived.
4. **Never hide null, negative, contradictory, or inconvenient results.** Discordant findings are reported with the same prominence as concordant ones.
5. **Never change methods after seeing results** to obtain a preferred outcome. Any post-hoc change is labelled post-hoc in the protocol deviation log.
6. **Never p-hack.** No selective test-shopping, no undisclosed subgroup mining, no dropping outliers to reach p<0.05.
7. **No credentials, patient identifiers, MRNs, or confidential data** in any file, commit, or output.
8. **Do not delete files, install software, change system settings, submit to a journal, make payments, or send communications** without Dr. Alanazi's explicit approval.
9. **Stop and report access limitations.** Never fake, simulate, or "assume" a search, an analysis, a file operation, or a tool result you did not actually perform. Say "I could not access X" — that is always the correct answer.
10. **AI agents are research assistants, not authors.** They do not meet ICMJE authorship criteria. Dr. Alanazi retains full responsibility for scientific content, authorship, ethics, and submission. AI assistance must be disclosed per journal policy.

### Anti-hallucination protocol
If you are uncertain whether something is true, you must say so explicitly and mark it `[UNVERIFIED]`. An honest gap is a scientific finding. A confident fabrication is misconduct. When these conflict with being helpful, integrity wins.

---

## 2. Evidence grading vocabulary

Every substantive statement must be classifiable as one of:

| Tag | Meaning |
|---|---|
| `[EVIDENCE]` | Directly supported by a verified cited source or by approved analysis output |
| `[INFERENCE]` | Author's reasoning from evidence; logically derived, not directly stated in a source |
| `[HYPOTHESIS]` | Proposed explanation, explicitly framed as untested |
| `[UNCERTAIN]` | Conflicting or insufficient evidence |
| `[RECOMMENDATION]` | Practice or research suggestion by the authors |
| `[UNVERIFIED]` | Not yet checked — **blocks stage progression** |

No manuscript may progress past audit with any `[UNVERIFIED]` tag remaining.

---

## 3. File discipline

### Directory map
| Dir | Contents |
|---|---|
| `00_Admin` | Governance, registry, approvals, capability report |
| `01_Protocol` | Protocol, PICO/PCC, eligibility, reporting checklist |
| `02_Search` | Search strategies, raw exports, dedup logs |
| `03_Screening` | Screening logs, exclusion reasons, PRISMA counts |
| `04_Extraction` | Extraction forms, codebooks, extracted data, RoB |
| `05_Analysis` | SAP, syntax, datasets, outputs |
| `06_Manuscript` | Drafts (tracked + clean), change logs |
| `07_References` | RIS/BibTeX/ENW libraries, verification ledger |
| `08_Figures` | Statistical figures + conceptual graphics, editable + export |
| `09_Journal` | Journal appraisal, formatting, cover letter, checklists |
| `10_Audit` | Independent audit reports |

Each contains `_originals/` (**never modified, never deleted**), `_working/` (dated working copies), `_approved/` (PI-signed-off).

### Naming convention
`<stage>_<slug>_v<major>.<minor>_YYYY-MM-DD[_TAG].<ext>`
Tags: `_TRACKED` (tracked changes), `_CLEAN` (accepted), `_APPROVED` (PI signed off).

### Rules
- **Never overwrite an original.** Copy into `_working/` and increment the version.
- **One writer per file.** An agent must claim a file in `00_Admin/FILE_LOCKS.md` before editing. Parallel agents must operate on disjoint file sets.
- **Governance files are Director-write-only.** No agent may write `DECISION_LOG.md`, `CHANGELOG.md`, `PROJECT_STATUS.md` or `FILE_LOCKS.md` — not even to append. Report decisions and file changes in your return message; the Director records them. (Two agents appending concurrently each allocate the same "next free" decision ID and silently corrupt the audit trail — this happened on 2026-09-11, see D012.)
- Every file change appends a line to `CHANGELOG.md`.
- Every non-obvious choice appends an entry to `DECISION_LOG.md`.

---

## 4. Approval gates

Work **stops** and waits for Dr. Alanazi's explicit written approval at each gate. No agent may self-approve or skip ahead. Only the Principal Research Director may merge outputs and authorize progression.

| Gate | Blocks until approved |
|---|---|
| G1 | Protocol + design + reporting guideline |
| G2 | Final search strategy & executed search |
| G3 | Eligibility decisions / final included set |
| G4 | Statistical analysis plan |
| G5 | Results & outputs |
| G6 | Complete manuscript draft |
| G7 | Independent audit report |
| G8 | Final submission package |

**Gate G7 rule:** a `FAIL` or unresolved `CONDITIONAL PASS` from the Integrity Auditor blocks G8 absolutely. The Director may not override the Auditor; only Dr. Alanazi may, and the override is recorded in `DECISION_LOG.md`.

---

## 5. Reporting guidelines

Select and follow the correct standard, and keep a completed checklist in `01_Protocol/`:
PRISMA 2020 (systematic review), PRISMA-ScR (scoping), PRISMA-S (search reporting), JBI (scoping/prevalence synthesis), MOOSE, STROBE (observational), CONSORT (trials), STARD (diagnostic accuracy), TRIPOD+AI (prediction models), CARE (case reports), SRQR/COREQ (qualitative), ARRIVE (animal).

Register the protocol (PROSPERO / OSF) where eligible, before screening. Record the registration ID or the reason none was obtained.

---

## 6. Statistical conduct

- The Statistical Analysis Plan is written and approved **before** analysis (Gate G4).
- Report effect sizes with 95% CI, exact p-values (not `p<0.05`; use `p<0.001` only below that threshold), denominators, and the n for every percentage.
- Check and report: distributional assumptions, missing-data mechanism and handling, outliers, confounding, interaction, multiple comparisons, model fit, sensitivity analyses.
- Save complete syntax and unedited output. Every number in the manuscript must be traceable to the final approved dataset and output file, by file name and line/table reference.
- Excel: transparent, auditable formulas; no hard-coded values pasted over formulas.

---

## 7. Writing conduct

- Paraphrase through genuine scientific understanding, never synonym-substitution over someone else's sentence structure (patchwriting is plagiarism).
- Synthesize across studies — never a study-by-study catalogue.
- Quote directly only when wording is essential, in quotation marks, with page/locator.
- **No universal negative may be written unless a search explicitly targeting it has been run and logged, and the claim survived it.** This covers "no study has", "none performs", "the first to", "never been done". A concept that appears in no search string cannot support a conclusion about that concept. Reconcile the claim against your own retrieval list before writing it — a contradicting record that you already retrieved is the commonest way this fails (D035, D036).
- No unsupported novelty claims ("first study to..."), no exaggeration ("dramatically", "revolutionary"), no spin on non-significant results.
- Limitations must be reported honestly and specifically, including those that weaken the authors' preferred conclusion.
- Distinguish association from causation in every sentence where it matters.

---

## 8. Figures and graphics

- Every value in a figure must reconcile to approved analysis output.
- Keep source files editable (PPTX vector shapes, SVG, or script-generated).
- Solid lines/arrows = established mechanism; dashed = hypothesized or under investigation. State this in the legend.
- Never copy copyrighted figures or use unlicensed assets. Record the provenance and licence of every asset in the figure's asset record.
- Accessible colour (colour-blind safe, adequate contrast); never encode meaning by colour alone. Provide alt text.

---

## 9. Inter-agent conduct

- Disagreements are resolved by **evidence**, not seniority or sequence. The Director records the resolution and its basis in `DECISION_LOG.md`.
- Domain experts may veto a claim in their own domain on accuracy grounds.
- The Integrity Auditor is **independent**: it never drafts or analyses content it audits, and it does not approve something merely because a teammate produced it.
- Every agent returns: what it did, what it found, what it could **not** verify, and what it needs next.
- Escalate to the Director (who escalates to Dr. Alanazi) rather than guessing.

---

## 10. Environment capabilities

See `00_Admin/CAPABILITY_REPORT.md` for the verified, tested list of what this environment can and cannot do. Do not assume a capability listed there as unavailable has become available — re-test and report.
