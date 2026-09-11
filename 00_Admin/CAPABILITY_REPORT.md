# CAPABILITY_REPORT.md

**Verified by direct testing on 2026-09-11.** Every entry below was tested, not assumed. Re-test before relying on anything here; do not treat an "unavailable" entry as having become available without re-testing.

---

## ✅ Available and tested

| Capability | Status | Evidence |
|---|---|---|
| **Genuine separate subagents** | ✅ Working | Spawned an agent in a separate context; it adopted a role file, called PubMed independently, returned real verified PMIDs |
| **PubMed (via MCP)** | ✅ Working | Live searches; returns PMID, DOI, title, abstract, authors + affiliations, journal + ISO abbreviation, date, volume, issue, **pages**, MeSH terms, keywords, article types |
| **PubMed full text (PMC open access)** | ✅ Tool present | `get_full_text_article` available |
| **PubMed citation lookup** | ✅ Tool present | `lookup_article_by_citation` — resolves partial/suspect citations |
| **SciSpace (280M+ papers, semantic)** | ✅ Working | Returns title, abstract, DOI, journal+ISSN, authors, affiliations, OA status, citation counts |
| **WebSearch** | ✅ Available | US-region |
| **File system (read/write/versioning)** | ✅ Working | Full read/write in project dir; git repository present |
| **Python 3.11.15 scientific stack** | ✅ Installed & verified | `pandas 3.0.5`, `numpy 2.4.6`, `scipy 1.17.1`, `statsmodels 0.15.0`, `matplotlib 3.11.1` |
| **Excel (.xlsx) read/write** | ✅ Working | `openpyxl 3.1.5` — `EVIDENCE_MAP.xlsx` built and verified |
| **Word (.docx) generation** | ✅ Installed | `python-docx` |
| **PowerPoint (.pptx) generation** | ✅ Installed | `python-pptx` — editable vector shapes for figures |
| **LibreOffice (headless)** | ✅ Installed | `/usr/bin/libreoffice` — format conversion, PDF export |
| **Node.js 22** | ✅ Installed | v22.22.2 |
| **git version control** | ✅ Working | Branch `claude/exciting-hypatia-yr2a0q` |
| **Specialist skills library** | ✅ Present | Incl. `prisma-systematic-review`, `systematic-review-operating-system-pro`, `biostat-pro-ai`, `spss-biomed-q1`, `acls-submission-check`, `clin-lab-submission`, `pubmed-citation-finder`, `reference-list-reader-verifier`, `pptx-figure-builder`, `dna-writing`, `citation-inserter` |

---

## ❌ Unavailable — tested and confirmed blocked or absent

| Capability | Status | What was observed | Consequence |
|---|---|---|---|
| **Crossref API** (`api.crossref.org`) | ❌ Blocked | 403 at CONNECT (egress policy); WebFetch `EGRESS_BLOCKED` | Cannot independently confirm DOI registration or publisher metadata |
| **NCBI E-utilities direct** (`eutils.ncbi.nlm.nih.gov`) | ❌ Blocked | 403 at CONNECT | No bulk/scripted PubMed access; MCP tool only |
| **Europe PMC** (`www.ebi.ac.uk`) | ❌ Blocked | 403 at CONNECT | No secondary index cross-check |
| **PubMed website** (`pubmed.ncbi.nlm.nih.gov`) | ❌ Blocked | `EGRESS_BLOCKED` | Cannot read the rendered record page (retraction banners, linked corrections) |
| **Scopus / Web of Science / Embase / Cochrane CENTRAL** | ❌ No access | No licensed subscription in this environment | **A true multi-database systematic-review search cannot be executed here** |
| **SPSS** | ❌ Not installed | Not on PATH | Analysis runs in Python; annotated `.sps` syntax delivered for PI to reproduce |
| **EndNote (application)** | ❌ Not installed | Not on PATH; no GUI | Validated RIS/BibTeX/ENW/XML delivered; PI imports and confirms |
| **Microsoft Word / Excel / PowerPoint (applications)** | ❌ Not installed | No Microsoft Office | Files generated via Python libraries; fully compatible, but not rendered/validated in Office |
| **Computer control / GUI automation** | ❌ Not available | Headless Linux container; no desktop session | Cannot drive EndNote, SPSS, or Office interactively |
| **ALL journal/registry/standards web pages** | ❌ Blocked (D030) | 14+ domains attempted, **zero successes**: all Wiley, ScienceDirect/Elsevier, Springer, Karger, ICMJE, EQUATOR, ClinicalTrials.gov, ISRCTN, OSF, WHO ICTRP, DOAJ, COPE, JCR/Clarivate, Scimago, ISBT, AABB, PMC, Wikipedia | **No journal author instructions, bibliometrics, registry or standards document is readable here.** Impact factors, quartiles, APCs, registration policies, word limits, AI-disclosure and data-sharing policies are all `[UNVERIFIED — registry blocked]` and must be checked by the PI |
| **WebSearch as a verification source** | ⚠️ Indicative only | Returns AI-summarised snippets, not page text; one returned snippet was internally implausible | May **never** support a verified claim. Usable to locate and to orient, never to confirm |
| **Consensus MCP server** | ⚠️ Needs authorization | Listed as requiring OAuth; session is non-interactive | PI must authorize in claude.ai connector settings to enable |
| **Named subagent types** (`hematology-expert` etc.) | ⚠️ Next session | Spawn by name returned "Agent type not found" — Claude Code registers `.claude/agents/` at session start | **Workaround validated:** general-purpose agent reading the role file works now; names activate on restart |

---

## What the PI must verify personally (this team cannot)

Because every journal, registry, bibliometric and standards page is blocked, the following are **structurally impossible** here and are escalated rather than guessed:

| Item | Why it matters |
|---|---|
| Per-journal registration policy for observational studies | Must be known **before** sample collection — registration cannot be backdated (D026) |
| Per-journal reporting-checklist requirement | Determines STROBE vs STARD emphasis (D027) |
| Current ISBT RH allele table version | Must be fixed in the data dictionary before data capture (D028) |
| Word/figure limits, AI-disclosure, data-sharing policy | Shape the manuscript and the submission package |
| Impact factor, quartile, indexing, APC, DOAJ/COPE status | Journal selection and predatory screening |
| Whether a registered GCC RH-genotyping study is already ongoing | Duplication risk; registries are unreachable and a negative WebSearch is **not** evidence of absence |

## Practical consequences for research conduct

1. **Search breadth is genuinely limited.** PubMed + SciSpace is a defensible evidence base for a **scoping review** or an evidence-based narrative review, with the limitation disclosed. It is **below the standard a strict reviewer expects for a full systematic review**, which normally requires ≥2–3 databases including Embase or Scopus. Mitigation: the Literature Search agent writes native-syntax strings for Scopus/Embase/Cochrane/WoS for Dr. Alanazi to execute through his institutional access before Gate G2.

2. **Citation verification is strong but not complete.** PubMed-indexed references can be verified to a high standard including pages, volume, issue and DOI. What cannot be verified here: DOI registration via Crossref, publisher-page correction/retraction banners, and metadata for non-PubMed-indexed sources beyond what SciSpace returns. Those fields are marked `[UNVERIFIED — registry blocked]` and never guessed.

3. **Statistics are fully reproducible, just not natively in SPSS.** Python output plus annotated SPSS syntax, with any default differences documented.

4. **Office documents are produced, not rendered.** Generated `.docx`/`.xlsx`/`.pptx` are standard-compliant, but final appearance should be confirmed by Dr. Alanazi in Microsoft Office before submission.

5. **No action is taken outside this project directory**, and nothing is submitted, sent, purchased, installed, or deleted without explicit approval.
