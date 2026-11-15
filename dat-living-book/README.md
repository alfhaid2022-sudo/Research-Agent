# DAT Living Book

An interactive "living book" on the **Direct Antiglobulin Test (DAT)** for clinical laboratory science students and blood-bank trainees. It is built from one source: `DAT2.pdf`.

**Project path:** `/home/user/Research-Agent/dat-living-book` (repository `Research-Agent`, folder `dat-living-book/`)
**Stack:** React 18 + TypeScript + Vite 6. No backend, no accounts, no paid services. Progress is saved in the browser's `localStorage`.

## Source

| Item | Value |
|---|---|
| Title | *Direct Antiglobulin Test (DAT)* |
| Publisher | The Blood Project — Encyclopedia of Blood (infographic) |
| Credits | Written by Dr. Bentley Rodrigue; graphic design by Janie Vu |
| Pages | **1** (a single tall page, 792 × 4068 pt) |
| References in source | **None.** Frequencies, detection limits and dates are attributed to the infographic only and have not been checked against primary literature. |

Because the source has only one page, every citation reads **`p. 1 · <panel name>`**. Clicking a citation opens the Source Viewer, which crops the original page to that panel (coordinates measured with `pdftotext -bbox`; see `src/content/dat/source.ts`).

### Why the PDF is not committed
The licence for redistributing the infographic could not be verified, so `public/source/` is git-ignored. After cloning, prepare it locally:

```bash
npm run source:prepare -- /path/to/DAT2.pdf
```

This copies the PDF, renders page 1 to PNG (needs `pdftoppm`) and extracts its text (needs `pdftotext`, used by the tests). Without these files the app still works; panel previews show a notice instead of the image, and the verbatim-quote tests are skipped with a warning.

## Run

```bash
cd /home/user/Research-Agent/dat-living-book
```

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build && npm run preview
```

```bash
npm test
```

```bash
npm run e2e
```

`npm run e2e` needs a built app (`npm run build`) and an installed Playwright with Chromium. It starts `vite preview` on port 4317, runs 25 interaction checks and writes screenshots to `test-output/`.

### Hosted copy without the source files
Build with `VITE_NO_SOURCE=1 npx vite build` to produce a copy that omits the PDF and the page image. In that copy, source links show the cited panel and its position on the page instead of a crop.

## Source map: book structure

Sections follow the infographic from top to bottom. Each one moves through five stages: **Explain → See it → Try it → Interpret → Check**.

| # | Section | Source panel(s), p. 1 | Mechanism / interaction | Status |
|---|---|---|---|---|
| 1 | What the DAT asks | Term Definition | Coating gallery (none / IgG / C3d / both) | Complete |
| 2 | Principle of the test | Method › Principle of the Test | Crosslink animation; reagent × coating explorer | Complete |
| 3 | The five steps | Method › Steps | Full procedure animation (coated and uncoated branches, check cells); link to the virtual lab | Complete |
| 4 | The antiglobulin reaction | Antiglobulin Reaction figure; Proximate Mechanisms | Source figure animated: coated cells → AHG → crosslinking | Complete |
| 5 | Factoids | Factoids; AHG production | AHG production stepper; flip cards | Complete |
| 6 | True and false results | − Result / + Result | Results map; technical-error troubleshooter with check-cell outcome | Complete |
| 7 | Classic patterns of response | Classic Patterns of Response | Interactive algorithm (poly → mono → column) | Complete |
| 8 | Proximate mechanisms | Proximate Mechanisms | Check-cell animation (valid / no usable AHG); detection-limit slider | Complete |
| 9 | History of medicine | History of Medicine | Timeline (1908, 1945, today) | Complete |
| 10 | Notes, attributions and source limits | Notes / Attributions | Source card, flagged issues, topics the source does not cover | Complete |

Every panel of the source is covered. No further chapters exist yet. The content registry (`src/content/registry.ts`) and model (`src/content/types.ts`) are designed so that a new chapter can be added as `src/content/<id>/index.ts`; none is listed until it has actually been converted.

## Features

- Searchable contents and glossary, section navigation, previous/next pager, mobile drawer.
- Citation chips on every statement, opening the cited panel of the original PDF.
- Quoted source text is shown in quotation style. Added explanations carry a **Teaching note** label. Source problems carry a **⚑** label.
- Animations in SVG with captions tied to the steps they show: play/pause, previous/next, first step, replay, speed (0.5–2×), clickable step dots, arrow-key/space/Home keyboard control, and reduced motion (follows the OS setting or can be set by the user).
- Learner variables: coating type, reagent (polyspecific / anti-IgG / anti-C3d), washing, AHG added or active, centrifugation, nonspecific binding, delay before AHG, molecules per cell.
- **Virtual lab:** 4 illustrative specimens plus a blind run. It follows the five source steps, offers each listed mistake as a choice, validates negatives with check cells, runs monospecific follow-up, and ends with a debrief that cites the source.
- **4 branching simulated cases**, labelled illustrative, with feedback on every option.
- **20-question quiz** (feedback and saved score), **21 flashcards** (flip, mark known, filter), **24-term glossary**.
- Bookmarks, saved progress (sections, quiz, cards, cases, lab runs), last-location resume, reset.
- Light, dark and system themes. Responsive from 360 px upward.
- Optional narration through the browser Web Speech API ("Listen to this section", "Read captions aloud"). It is user-triggered, captions stay on screen, and it is disabled with a message where unsupported.

## Verification performed

- `npm run build`: TypeScript strict build passes.
- `npm test`: 16 unit tests.
  - Every citation resolves to a real panel on page 1 within page bounds.
  - Every paragraph marked as a quote appears verbatim in the PDF text.
  - Every number used (1,000; 14,000; 7–8%; 97–99%; 100–500; 400–1,100; 1908; 1945; 4+) appears in the source.
  - Quiz answers are in range, and case graphs are connected.
  - Simulator rules match the source lists, including that the "delay" item is never given a direction.
- `npm run e2e`: 25 Playwright checks.
  - Source-viewer crop offset.
  - A section completes and stays complete after reload.
  - Animation captions and branches.
  - Play, speed and keyboard controls; reduced motion removes transitions.
  - Explorer, troubleshooter, flowchart and slider.
  - Three full virtual-lab runs.
  - One full case.
  - Quiz feedback, flashcards, bookmarks after reload, search, dark theme.
  - No horizontal overflow on five pages at 390 px; mobile drawer.
  - No runtime errors.
- Animation frames were inspected manually after they settled: AHG bridges sit between facing IgG on neighbouring cells, and check cells are bridged only when usable AHG is present.

## Source issues and limits (also shown in the app)

1. "Delay in the addition of AHG after washing" is listed under **both** false negative and false positive. The book reports both listings and does not choose between them.
2. The grading criteria for Negative–4+ are not described, so the simulator records only present/absent.
3. No procedure parameters are given (wash solution, number of washes, centrifuge speed/time, anticoagulant). None are invented.
4. The reagent is written as anti-C3d, anti-C3 and C3 in different panels. Each is preserved as printed.
5. There are typos ("AGH reagents", "Graphic deign").
6. The source has no reference list.
7. The rule "anti-C3d → IgM" is the source's simplification. It should be read together with the Classic Patterns panel.

**Not covered by the source, so not in this book:**
- the indirect antiglobulin test;
- elution and antibody identification;
- grade criteria;
- test formats (gel/column);
- treatment.

**Teaching models**, labelled in the app:
- Inadequate washing neutralises AHG.
- Check cells react only when usable AHG is present and the tube is spun adequately.
- The mechanisms behind the listed technical errors are not in the source. The simulator models only the direction of error that the source states.

**Not clinical advice.** Cases and specimens are invented. The drawings are schematic teaching models, not microscopy.

## AI-assistance disclosure
This edition was drafted with AI assistance. The scientific content is attributed to the source infographic. Responsibility for its use in teaching rests with the instructor who adopts it.
