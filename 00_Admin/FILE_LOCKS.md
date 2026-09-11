# FILE_LOCKS.md — concurrency control

**Rule:** one writer per file. An agent claims a file here before editing and releases it when done. The Director must not dispatch two agents onto the same file concurrently.

| File / path | Locked by | Claimed (UTC) | Released | Purpose |
|---|---|---|---|---|
| _(none — no active project)_ | | | | |

## Safe to parallelize
- Independent searches across different databases/concepts
- `hematology-expert` and `transfusion-medicine-expert` reviewing **different** claim sets
- Figure production + journal appraisal
- Automation scripting + extraction-form design

## Never parallelize
- Two agents editing any manuscript file
- Analysis while the dataset is still being cleaned
- Audit while content is still changing — always audit a frozen, versioned copy
