# How to use this research team

You do **not** invoke agents individually. You talk to the **Principal Research Director** — the main Claude session — in ordinary language, and it delegates, verifies, and reports back. Your job is to decide; its job is to do the work and tell you honestly how it went.

---

## 1. Setup (once)

```bash
git clone https://github.com/alfhaid2022-sudo/Research-Agent.git
cd Research-Agent
claude
```

That is the whole setup. On startup Claude Code automatically:
- loads `CLAUDE.md` as binding project rules
- registers all 19 agent definitions from `.claude/agents/` — the 14 stage-owning specialists plus the 5-agent manuscript review pass (see `MANUSCRIPT_REVIEW_USAGE.md`)

**Important:** agents register **at session start**. If you add or edit an agent definition, restart the session before expecting it to work by name.

---

## 2. Daily use — just talk

Speak to the Director in plain language. It picks the specialist.

| You say | What happens |
|---|---|
| "I want to study X" | Feasibility gate runs **first** — it may tell you the topic is dead |
| "Is this novel?" | Decomposed into falsifiable propositions, each searched separately |
| "Draft the protocol" | `methodology-protocol-expert`, then back to you at **Gate G1** |
| "How many donors do I need?" | `biostatistics-expert` — precision-based, with infeasibility stated plainly |
| "Check my references" | `citation-verification-expert` — existence, metadata, retraction, **and claim support** |
| "Audit this" | `integrity-auditor` — independent, and it can fail the Director |
| "Where should I submit?" | `journal-submission-expert` — scope fit first, predatory screening always |

To force a specific specialist, name it: *"have the transfusion-medicine-expert check this claim."*

For a review pass over text you already have — five agents in parallel, one combined report, original untouched — see **`MANUSCRIPT_REVIEW_USAGE.md`**.

---

## 3. The rhythm: work → gate → you

Work **stops** at eight gates. Nothing proceeds until you say so.

```
Intake → Question → Protocol [G1] → Search strategy → Search [G2] → Screening [G3]
→ Extraction → Analysis [G4,G5] → Manuscript [G6] → Audit [G7] → Journal → Package [G8]
```

Approving is just saying so — "approved", "go ahead with the protocol". Redirecting is the same: *"no, use a cohort design instead."*

**One gate you cannot be talked past:** a `FAIL` from the Integrity Auditor blocks submission absolutely. The Director cannot override it. **Only you can**, and your override is written into `DECISION_LOG.md` with your reasoning.

---

## 4. Five prompts worth reusing

1. **"Run the feasibility gate before anything else."**
   Two of three pilots died here. Each cost one agent run instead of a rejected manuscript.

2. **"Audit the Director, not just the agents."**
   This found real defects: universal negatives contradicted by records already retrieved, and a control written down but never executed.

3. **"Show me the grep, don't tell me it's fixed."**
   Two corrections were announced as complete while the document still said the false thing. Ask for the evidence.

4. **"What could you not verify?"**
   Every agent is required to answer this. The answer is often the most useful part.

5. **"State that as a falsifiable proposition and search it."**
   Turns "is this novel?" into something that can actually fail.

---

## 5. What only you can do

The team cannot, and will not pretend to:

| Task | Why |
|---|---|
| IRB submission and approval | Requires you as PI |
| Informed consent | Requires you |
| Donor samples, wet-lab execution | Physical |
| Scopus / Embase / Web of Science searches | No licence here — you get native-syntax strings to run |
| Journal policy, impact factor, APC checks | All publisher pages are egress-blocked |
| Prospective registration (OSF / ClinicalTrials.gov) | Registries unreachable |
| Submitting to a journal | **Never done without your explicit instruction** |

Give it the answers and it continues; it will not invent them.

---

## 6. Starting a new project

> "Open PILOT-04: [topic]. Run Stage 1 feasibility first."

The Director opens it, logs the decision, runs the gate, and reports GO / GO WITH NARROWED CLAIM / NO-GO with the evidence. A NO-GO is a successful outcome — it means you did not spend six months on a published topic.

---

## 7. Reading the record

- `PROJECT_STATUS.md` — where things stand, what is blocked, what needs you
- `DECISION_LOG.md` — every decision with its reasoning. **Append-only**: superseded entries stay, marked, so you can see what changed and why
- `10_Audit/_working/` — the independent audits, including the ones that failed the Director
- `CHANGELOG.md` — every file touched

Retracted claims deliberately survive **inside the notices that retract them**. Deleting the wording would erase the evidence that the error happened.

---

## 8. What to expect

It will tell you your topic is already published. It will tell you your sample size is infeasible. It will tell you its own previous answer was wrong. That is the system working — the value so far has been in **what it stopped**, not what it produced.

It will never guarantee publication, and it is not an author. You retain full responsibility for scientific content, authorship, ethics and submission (`CLAUDE.md` §1.10).
