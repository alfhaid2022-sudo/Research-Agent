# FILE_LOCKS.md — concurrency control

**Rule:** one writer per file. An agent claims a file here before editing and releases it when done. The Director must not dispatch two agents onto the same file concurrently.

| File / path | Locked by | Claimed (UTC) | Released | Purpose |
|---|---|---|---|---|
| `01_Protocol/_working/01_pilot03-protocol_v0.1_*` | methodology-protocol-expert | 2026-09-11 | 🟡 active | Gate G1 protocol draft |
| `01_Protocol/_working/*strobe*` | methodology-protocol-expert | 2026-09-11 | 🟡 active | STROBE checklist |
| `05_Analysis/_working/*` | biostatistics-expert | 2026-09-11 | 🟡 active | Sample size + SAP skeleton |

## Director-write-only files (never delegated)

These are shared, append-only, and any agent may be tempted to write them. Two agents allocating the next free ID concurrently produced a real D008/D009 collision on 2026-09-11 (see D012). The write path is now closed rather than lock-managed: **agents report decisions in their return message; the Director records them.**

| File | Writer |
|---|---|
| `DECISION_LOG.md` | Director only |
| `CHANGELOG.md` | Director only |
| `PROJECT_STATUS.md` | Director only |
| `00_Admin/FILE_LOCKS.md` | Director only |

## Safe to parallelize
- Independent searches across different databases/concepts
- `hematology-expert` and `transfusion-medicine-expert` reviewing **different** claim sets
- Figure production + journal appraisal
- Automation scripting + extraction-form design

## Never parallelize
- Two agents editing any manuscript file
- Analysis while the dataset is still being cleaned
- Audit while content is still changing — always audit a frozen, versioned copy
