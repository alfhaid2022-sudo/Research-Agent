# DAT animated lesson (Papermorph)

An animated, narrated, interactive lesson on the **direct antiglobulin test (DAT)**. It was made with the Papermorph skill (tier 1, "diagrams that change") from one source: the single-page infographic `DAT2.pdf` (*The Blood Project*; written by Dr. Bentley Rodrigue, graphic design by Janie Vu).

**Use:** the user's own teaching only. The source's reuse licence is unverified, so the lesson is not for the open web. The PDF is not in this repository.

## Run

```bash
cd /home/user/Research-Agent/dat-lessons
```

```bash
python3 -m http.server 8765 --directory site
```

Open `http://localhost:8765/dat/` (the cover) or `http://localhost:8765/dat/ch01/` (the lesson). The lesson needs a web server; it does not play from `file://`.

## Layout

| Path | What |
|---|---|
| `site/dat/` | the static book (deliverable): cover `index.html`, lesson `ch01/`, engine copy and `lib/dat.js` |
| `site/dat/ch01/audio/en/` | 19 ElevenLabs clips plus `timings.js` (clip lengths, word marks, captions) |
| `content/dat/ch01/narration.en.json` | narration with `[[marks]]` |
| `books/dat/style.json` | the agreed style: palette, meanings, voice, models, the user's choices |
| `books/dat/chapters/ch01.md` | beat plan, errata and source decisions |
| `tools/dat/scribe_timings.py` | builds `timings.js` from ElevenLabs clips plus Scribe word times |

## Voice pipeline (and why it differs from stock Papermorph)

Papermorph's `eleven.py` uses OpenRouter and a local faster-whisper model; neither is reachable from this environment.

So the narration was made with the ElevenLabs connector:
1. Each beat was generated with `eleven_v4`, voice *Udem – Calm & Clear Educational Narrator*.
2. Each clip was transcribed with Scribe for word times.
3. `tools/dat/scribe_timings.py` turned those into `timings.js`, using Papermorph's own mark and caption functions.

Cost: 4,310 ElevenLabs credits in total, from the Pro plan's monthly characters:
- one test sentence;
- two sample beats;
- the remaining 17 beats.

Transcription was free.

## Scientific notes

- **[INFERENCE — standard immunology, not stated in the source; not literature-verified here]**
  - IgG is drawn bound to the red cell by its Fab arms, with the Fc outward.
  - Anti-human globulin bridges those Fc ends.
- **Source conflict.** "Delay in the addition of AHG after washing" is listed under both false negative and false positive. The lesson shows both listings and resolves neither.
- **Not in the source, so not in the lesson:**
  - criteria for each agglutination grade (1+ to 4+);
  - wash solution, centrifuge settings and specimen type;
  - the indirect antiglobulin test.
- **The source has no reference list.** Frequencies, detection limits and dates are attributed to the infographic only.
- **Drawings are schematic, not to scale.** Molecule counts are illustrative.
