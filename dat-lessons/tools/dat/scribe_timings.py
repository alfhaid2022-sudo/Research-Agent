#!/usr/bin/env python3
"""Build timings.js from ElevenLabs clips voiced through the ElevenLabs connector, with word times from Scribe.

    python3 tools/dat/scribe_timings.py content/dat/ch01/narration.en.json INBOX site/dat/ch01/audio/en

INBOX holds, per beat, <beat>.mp3 (the clip) and <beat>.words.json (Scribe's word list: [{text, start, end, type}]).
Why this exists: Papermorph's eleven.py needs OpenRouter and a local faster-whisper model, both unreachable from this
environment. The marks and caption cues use tts.py's own functions, so the page reads the same timings.js.
Beats already in timings.js and absent from INBOX are kept.
"""
import json, re, shutil, subprocess, sys
from pathlib import Path

SKILL = Path('/root/.claude/skills/synced/04f2eefa-9426-422d-a596-113126b40204_bfca546e-a590-49c6-bf09-b380573738fa/papermorph/scripts')
sys.path.insert(0, str(SKILL))
from tts import split_marks, mark_times, caption_cues, duration, js_object  # noqa: E402


def main(narr, inbox, out):
    narr, inbox, out = Path(narr), Path(inbox), Path(out)
    out.mkdir(parents=True, exist_ok=True)
    beats = json.loads(narr.read_text(encoding='utf-8'))['beats']
    tpath = out / 'timings.js'
    live = js_object(tpath) if tpath.exists() else {}
    for beat, raw in beats.items():
        mp3, wj = inbox / f'{beat}.mp3', inbox / f'{beat}.words.json'
        if not (mp3.exists() and wj.exists()):
            continue
        clean, marks = split_marks(raw)
        words = [(w['start'], re.sub(r'[.,;:!?"]+$', '', w['text'])) for w in (lambda d: d['words'] if isinstance(d, dict) else d)(json.loads(wj.read_text())) if w.get('type', 'word') == 'word']
        # Scribe may hyphenate ("anti-human") where the script has spaces: also offer each hyphen part as a word
        split = []
        for t, w in words:
            parts = w.split('-')
            split += [(t, parts[0])] + [(t, p) for p in parts[1:]] if len(parts) > 1 else [(t, w)]
        shutil.copyfile(mp3, out / f'{beat}.mp3')
        live[beat] = {'dur': duration(out / f'{beat}.mp3'), 'marks': mark_times(clean, marks, split),
                      'cues': caption_cues(clean, split)}
        heard = ' '.join(w for _, w in words)
        print(f'{beat}: {live[beat]["dur"]:.2f} s, marks {live[beat]["marks"]}')
        if heard.split()[-1].lower() != re.sub(r'[^\w\']', ' ', clean).split()[-1].lower():
            print(f'{beat}: WARNING last heard word {heard.split()[-1]!r} differs from the script; listen to the clip')
    order = {b: i for i, b in enumerate(beats)}
    live = dict(sorted(live.items(), key=lambda kv: order.get(kv[0], 999)))
    tpath.write_text('window.TIMINGS = ' + json.dumps(live, indent=1) + ';\n', encoding='utf-8')


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print(__doc__); sys.exit(2)
    main(*sys.argv[1:])
