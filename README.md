# Multi-Agent Biomedical Research Team

A 15-agent research system for Dr. Fehaid M. Alanazi (Associate Professor & Consultant, Laboratory Hematology) covering hematology, transfusion medicine, immunohematology and biostatistics — from research question to submission-ready manuscript.

> **Status: no manuscript exists.** Three pilot topics have been opened; two were closed at the feasibility gate and the third is mid-protocol with a standing audit `FAIL`. That is the system working as designed, not a stalled project — see [Track record](#track-record).

---

## Start here

| If you want to… | Read |
|---|---|
| Understand the rules every agent obeys | [`CLAUDE.md`](CLAUDE.md) |
| See current state, gates and blockers | [`PROJECT_STATUS.md`](PROJECT_STATUS.md) |
| Follow every decision and its reasoning | [`DECISION_LOG.md`](DECISION_LOG.md) — 46 entries, append-only |
| See who does what | [`00_Admin/AGENT_REGISTRY.md`](00_Admin/AGENT_REGISTRY.md) |
| Know what this environment can/cannot do | [`00_Admin/CAPABILITY_REPORT.md`](00_Admin/CAPABILITY_REPORT.md) |
| Read the independent audits | [`10_Audit/_working/`](10_Audit/_working/) |

## The team

Fifteen agents defined in [`.claude/agents/`](.claude/agents/), each with its own instructions, context and **deliberately scoped tools**:

**Domain** — hematology · transfusion medicine/immunohematology
**Method** — methodology & protocol · literature search · screening & eligibility
**Data** — extraction & management · biostatistics · research automation
**Output** — scientific writing · statistical tables & figures · mechanism graphics
**Compliance** — journal selection & submission · independent integrity auditor
**Coordination** — Principal Research Director (the main session)

Tool scoping enforces separation of duties rather than just describing it:

- the **auditor has no Edit tool** — it cannot modify what it audits
- **domain experts have no Bash or Edit** — they review; they do not alter files
- the **writer has no literature tools** — it structurally cannot introduce an unverified citation
- **governance files are Director-write-only** — after two agents appending concurrently corrupted decision numbering (`D012`)

## How it works

Fourteen stages, eight approval gates. Work **stops** at each gate until the PI approves. A `FAIL` from the integrity auditor blocks submission absolutely — **the Director cannot override it**; only the PI can, and the override is logged (`D002`).

```
Intake → Question → Protocol [G1] → Search strategy → Search [G2] → Screening [G3]
→ Extraction → Analysis [G4,G5] → Manuscript [G6] → Figures → References
→ Audit [G7] → Journal → Submission package [G8]
```

## Track record

The value of this system so far has been in **what it stopped**, not what it produced.

| Pilot | Outcome |
|---|---|
| **01** — RBC alloimmunization in GCC transfusion-dependent patients | **NO-GO.** Already published twice in 2025 (PMID 40069098; PMID 40066558) |
| **02** — GCC donor antigen architecture & RH variants | **NO-GO.** The review core was already published *by the PI himself* (PMID 39967527) |
| **03** — Multi-centre GCC donor *RHD*/*RHCE* genotyping | Active. Protocol drafted; **audit `FAIL` standing**; Gate G1 halted |

Cost: a handful of agent runs. Avoided: two redundant manuscripts, one duplicating the PI's own prior publication.

**The audits found real defects in the Director's own work** — universal negatives contradicted by records the project had already retrieved, a correction applied to a document header while the body kept asserting the retracted claim, and a control that was written down but never executed. Each is recorded in `DECISION_LOG.md` with the evidence, not quietly amended. Retracted claims survive **inside the notices that retract them**, because deleting the wording would erase the evidence that the error occurred.

## Integrity rules (abridged — full text in `CLAUDE.md`)

- Never fabricate a study, citation, number, guideline or journal metric
- Never cite what has not been verified — **and verify that the source states the specific claim**
- Never invent missing data; record `NR`
- Never hide null, negative or contradictory results
- **No universal negative** ("no study has", "first to") without a search targeting it, logged, which the claim survived
- Never back-calculate a value and present it as reported
- Report access limitations rather than simulating a result
- **AI agents are research assistants, not authors.** They do not meet ICMJE criteria. The human researcher retains full responsibility for scientific content, authorship, ethics and submission.

## Repository layout

`00_Admin` governance · `01_Protocol` · `02_Search` · `03_Screening` · `04_Extraction` · `05_Analysis` · `06_Manuscript` · `07_References` · `08_Figures` · `09_Journal` · `10_Audit`

Each holds `_originals/` (never modified), `_working/` (dated versions), `_approved/` (PI sign-off).

## Environment limits

Working: PubMed & PMC full text (MCP), SciSpace, Python scientific stack, openpyxl/python-docx/python-pptx, LibreOffice.

**Not available** — and never worked around: Scopus, Embase, Cochrane, Web of Science, Crossref, trial registries, all publisher and journal pages (egress-blocked), SPSS, EndNote, Microsoft Office. Every consequence is recorded in `00_Admin/CAPABILITY_REPORT.md` and carried into the agents' own instructions, so no agent can claim a search it did not run.
