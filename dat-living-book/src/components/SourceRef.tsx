import { useEffect, useRef, useState } from 'react';
import { currentChapter as ch } from '../content/registry';
import type { SourceRef } from '../content/types';

const EVT = 'open-source-ref';

/** Build with VITE_NO_SOURCE=1 to omit the original PDF and page image (e.g. for hosted copies). */
export const hasSourceFiles = import.meta.env.VITE_NO_SOURCE !== '1';

export function refLabel(r: SourceRef) {
  const p = ch.source.panels.find((x) => x.id === r.panel);
  if (!p) return `p. ? · ${r.panel}`;
  return `p. ${p.page} · ${p.label}${r.detail ? ` · ${r.detail}` : ''}`;
}

export function SourceRefs({ refs }: { refs: SourceRef[] }) {
  if (!refs.length) return null;
  return (
    <span className="refs">
      {refs.map((r, i) => (
        <button
          key={i}
          type="button"
          className="ref-chip"
          onClick={() => window.dispatchEvent(new CustomEvent(EVT, { detail: r }))}
          title={hasSourceFiles ? 'Show this panel in the original PDF' : 'Show which panel of the source this cites'}
        >
          <span aria-hidden="true">📄</span> {refLabel(r)}
        </button>
      ))}
    </span>
  );
}

export function SourceLink() {
  if (!hasSourceFiles) return <span className="muted small">The original PDF is not included in this copy.</span>;
  return (
    <a href={`${ch.source.pdfPath}#page=1`} target="_blank" rel="noopener">
      Open original PDF (page 1)
    </a>
  );
}

type ImgState = 'loading' | 'ok' | 'missing';

/** Modal that shows the cited panel cropped from the rendered source page. */
export function SourceViewer() {
  const [ref, setRef] = useState<SourceRef | null>(null);
  const [img, setImg] = useState<ImgState>('loading');
  const [full, setFull] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      opener.current = document.activeElement as HTMLElement;
      setRef((e as CustomEvent<SourceRef>).detail);
      setFull(false);
    };
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, []);
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (ref && !d.open) d.showModal?.();
    if (!ref && d.open) d.close();
  }, [ref]);

  const close = () => {
    setRef(null);
    opener.current?.focus?.();
  };
  const panel = ref ? ch.source.panels.find((p) => p.id === ref.panel) : undefined;
  const h = panel ? panel.y1 - panel.y0 : 1;
  const src = panel ? ch.source.pageImagePath(panel.page) : '';

  return (
    <dialog ref={dlg} className="source-dialog" onClose={close} onCancel={close} aria-labelledby="srcv-title">
      {panel && ref && (
        <div>
          <header>
            <h3 id="srcv-title">Source · {refLabel(ref)}</h3>
            <button type="button" onClick={close} aria-label="Close source viewer" className="icon-btn">✕</button>
          </header>
          <div
            className="crop"
            style={!hasSourceFiles ? undefined : full ? { aspectRatio: `${ch.source.pageSizePt.width} / ${ch.source.pageSizePt.height}` } : { aspectRatio: `${ch.source.pageSizePt.width} / ${h}` }}
          >
            {hasSourceFiles && img !== 'missing' && (
              <img
                src={src}
                alt={`Original infographic, page ${panel.page}, panel “${panel.label}”`}
                onLoad={() => setImg('ok')}
                onError={() => setImg('missing')}
                style={full ? { top: 0 } : { top: `${-(panel.y0 / h) * 100}%` }}
              />
            )}
            {!hasSourceFiles && (
              <div className="crop-missing">
                <p><strong>Cited: page {panel.page}, panel “{panel.label}”{ref.detail ? ` (${ref.detail})` : ''}.</strong></p>
                <p className="small">This copy does not include the original infographic. Look up this panel in your copy of DAT2.pdf; the panel spans y = {panel.y0}–{panel.y1} pt on the page.</p>
              </div>
            )}
            {hasSourceFiles && img === 'missing' && (
              <div className="crop-missing">
                <p><strong>Original page image not found.</strong></p>
                <p className="small">The PDF is kept out of version control (licence unverified). Run <code>npm run source:prepare -- /path/to/DAT2.pdf</code> to enable panel previews.</p>
              </div>
            )}
          </div>
          <footer>
            <span className="small muted">Page {panel.page} of {ch.source.pageCount} · panel spans y = {panel.y0}–{panel.y1} pt</span>
            <span className="spacer" />
            {hasSourceFiles && <button type="button" className="link" onClick={() => setFull(!full)}>{full ? 'Show cited panel' : 'Show whole page'}</button>}
            <SourceLink />
          </footer>
        </div>
      )}
    </dialog>
  );
}
