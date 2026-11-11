import { useEffect, useMemo, useState } from 'react';
import { currentChapter as ch } from './content/registry';
import { useStore, StoreProvider } from './lib/store';
import { go, hrefFor, routeKey, useRoute, type Route } from './lib/router';
import { SectionPage } from './components/SectionPage';
import { BookmarksPage, CasesPage, FlashcardsPage, GlossaryPage, QuizPage } from './components/Learning';
import { VirtualLab } from './components/VirtualLab';
import { Attributions } from './components/Panels';
import { SourceViewer, hasSourceFiles } from './components/SourceRef';

interface Hit { key: string; title: string; snippet: string }

function useSearch(q: string): Hit[] {
  return useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    const hits: Hit[] = [];
    const snip = (text: string) => {
      const i = text.toLowerCase().indexOf(t);
      return i < 0 ? '' : (i > 30 ? '…' : '') + text.slice(Math.max(0, i - 30), i + t.length + 50) + '…';
    };
    for (const s of ch.sections) {
      const text = [s.title, s.objective, ...s.explain.map((p) => p.text), ...s.interpret.map((p) => p.text)].join(' ');
      if (text.toLowerCase().includes(t)) hits.push({ key: `section/${s.id}`, title: `${s.number}. ${s.title}`, snippet: snip(text) });
    }
    for (const g of ch.glossary) {
      const text = `${g.term} ${(g.aka ?? []).join(' ')} ${g.definition}`;
      if (text.toLowerCase().includes(t)) hits.push({ key: 'glossary', title: `Glossary: ${g.term}`, snippet: snip(text) });
    }
    return hits.slice(0, 12);
  }, [q]);
}

function Sidebar({ route, onNavigate }: { route: Route; onNavigate: () => void }) {
  const { p } = useStore();
  const [q, setQ] = useState('');
  const hits = useSearch(q);
  const cur = routeKey(route);
  const done = ch.sections.filter((s) => p.completed[s.id]).length;
  const link = (key: string, label: string, extra?: string) => (
    <a href={hrefFor(key)} className={cur === key ? 'active' : ''} aria-current={cur === key ? 'page' : undefined} onClick={onNavigate}>
      {label}
      {extra && <span className="nav-extra">{extra}</span>}
    </a>
  );
  return (
    <nav className="sidebar" aria-label="Contents">
      <label className="search-field">
        <span className="sr-only">Search the book</span>
        <input type="search" placeholder="Search contents & glossary…" value={q} onChange={(e) => setQ(e.target.value)} data-testid="search" />
      </label>
      {q.trim().length >= 2 && (
        <div className="search-results" aria-live="polite">
          <p className="small muted">{hits.length} result{hits.length === 1 ? '' : 's'}</p>
          <ul>
            {hits.map((h, i) => (
              <li key={i}>
                <a href={hrefFor(h.key)} onClick={() => { setQ(''); onNavigate(); }}><strong>{h.title}</strong><span className="small muted">{h.snippet}</span></a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="progress-box" aria-label="Progress">
        <div className="small">Progress: {done} / {ch.sections.length} sections</div>
        <div className="bar"><div style={{ width: `${(done / ch.sections.length) * 100}%` }} /></div>
      </div>
      <h2 className="nav-h">Chapter · {ch.title}</h2>
      <ol className="toc">
        {ch.sections.map((s) => (
          <li key={s.id} className={p.completed[s.id] ? 'done' : p.visited[s.id] ? 'visited' : ''}>
            {link(`section/${s.id}`, `${s.number}. ${s.title}`, p.completed[s.id] ? '✓' : '')}
          </li>
        ))}
      </ol>
      <h2 className="nav-h">Practice</h2>
      <ul className="toc">
        <li>{link('lab', 'Virtual lab', p.labRuns ? `${p.labRuns} run${p.labRuns > 1 ? 's' : ''}` : '')}</li>
        <li>{link('cases', 'Simulated cases', `${Object.keys(p.casesDone).length}/${ch.cases.length}`)}</li>
        <li>{link('quiz', 'Quiz', `${ch.quiz.filter((q) => p.quizAnswers[q.id] === q.answer).length}/${ch.quiz.length}`)}</li>
        <li>{link('flashcards', 'Flashcards')}</li>
      </ul>
      <h2 className="nav-h">Reference</h2>
      <ul className="toc">
        <li>{link('glossary', 'Glossary')}</li>
        <li>{link('bookmarks', 'Bookmarks', p.bookmarks.length ? String(p.bookmarks.length) : '')}</li>
        <li>{link('source', 'Source, flags & limits')}</li>
      </ul>
    </nav>
  );
}

function Home() {
  const { p } = useStore();
  const resume = p.last && p.last !== 'home' ? p.last : `section/${ch.sections[0].id}`;
  return (
    <article className="page home">
      <p className="eyebrow">Living book · Chapter 1</p>
      <h1>{ch.title}</h1>
      <p className="lead">{ch.subtitle}.</p>
      <div className="home-cta">
        <button type="button" className="primary" onClick={() => go(resume)} data-testid="start">{p.last ? 'Resume where you left off' : 'Start reading'} →</button>
        <button type="button" onClick={() => go('lab')}>Open the virtual lab</button>
      </div>
      <section className="about-src">
        <h2>What this book is built from</h2>
        <p>
          One source: the single-page infographic <em>{ch.source.title}</em> ({ch.source.publisher}; {ch.source.authors.join('; ')}).
          It has no numbered pages beyond page 1, so every citation reads <strong>p. 1 · panel name</strong>{hasSourceFiles ? ' and opens that panel of the original.' : '. This online copy does not include the original infographic.'}
        </p>
        <p>Each section moves through five stages: <strong>explain → see it → try it → interpret → check</strong>.</p>
        <ul className="legend-list">
          <li><span className="sample-quote">“Quoted text”</span> reproduces the source verbatim.</li>
          <li><span className="badge badge-teach">Teaching note</span> marks explanations added for this book and not found in the source.</li>
          <li><span className="badge badge-flag">⚑</span> marks gaps or inconsistencies found in the source.</li>
        </ul>
      </section>
      <section>
        <h2>Contents</h2>
        <ol className="home-toc">
          {ch.sections.map((s) => (
            <li key={s.id}><a href={hrefFor(`section/${s.id}`)}>{s.title}</a> <span className="muted small">— {s.objective}</span></li>
          ))}
        </ol>
        <p className="muted small">Further chapters can be added through the content registry; none are converted yet.</p>
      </section>
    </article>
  );
}

function Shell() {
  const route = useRoute();
  const { p, update, reset, storageOk } = useStore();
  const [navOpen, setNavOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const key = routeKey(route);

  useEffect(() => {
    update((x) => ({
      ...x,
      last: key,
      visited: route.name === 'section' ? { ...x.visited, [route.id]: true } : x.visited,
    }));
    window.scrollTo?.(0, 0);
    setNavOpen(false);
    if (key !== 'home') document.getElementById('main')?.focus?.({ preventScroll: true });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const root = document.documentElement;
    if (p.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', p.theme);
  }, [p.theme]);

  const section = route.name === 'section' ? ch.sections.find((s) => s.id === route.id) : undefined;
  const bookmarked = p.bookmarks.includes(key);
  const titleFor = section ? section.title : ({ home: ch.title, lab: 'Virtual lab', cases: 'Cases', quiz: 'Quiz', flashcards: 'Flashcards', glossary: 'Glossary', bookmarks: 'Bookmarks', source: 'Source' } as Record<string, string>)[route.name] ?? ch.title;
  useEffect(() => { document.title = `${titleFor} · DAT Living Book`; }, [titleFor]);

  let body;
  if (route.name === 'section') body = section ? <SectionPage s={section} /> : <article className="page"><h1>Section not found</h1><p><a href="#">Back to the start</a></p></article>;
  else if (route.name === 'lab') body = (
    <article className="page wide">
      <h1>Virtual lab: performing a DAT</h1>
      <p className="lead">The five steps from the source, with the mistakes the source lists. Choices are logged and debriefed with source references.</p>
      <VirtualLab />
    </article>
  );
  else if (route.name === 'cases') body = <CasesPage />;
  else if (route.name === 'quiz') body = <QuizPage />;
  else if (route.name === 'flashcards') body = <FlashcardsPage />;
  else if (route.name === 'glossary') body = <GlossaryPage />;
  else if (route.name === 'bookmarks') body = <BookmarksPage />;
  else if (route.name === 'source') body = <article className="page"><h1>Source, flags & limits</h1><Attributions /></article>;
  else body = <Home />;

  return (
    <div className={`app ${navOpen ? 'nav-open' : ''}`}>
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar">
        <button type="button" className="icon-btn menu-btn" aria-expanded={navOpen} aria-controls="sidenav" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle contents">☰</button>
        <a href="#" className="brand"><span className="brand-mark" aria-hidden="true">◉</span> DAT Living Book</a>
        <span className="spacer" />
        {key !== 'home' && (
          <button type="button" className={`icon-btn ${bookmarked ? 'on' : ''}`} aria-pressed={bookmarked} data-testid="bookmark"
            onClick={() => update((x) => ({ ...x, bookmarks: bookmarked ? x.bookmarks.filter((b) => b !== key) : [...x.bookmarks, key] }))}>
            {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
        )}
        <label className="tb-select">
          <span className="sr-only">Theme</span>
          <select value={p.theme} onChange={(e) => update((x) => ({ ...x, theme: e.target.value as typeof x.theme }))} aria-label="Theme" data-testid="theme">
            <option value="system">Theme: system</option>
            <option value="light">Theme: light</option>
            <option value="dark">Theme: dark</option>
          </select>
        </label>
        <label className="tb-select">
          <span className="sr-only">Motion</span>
          <select value={p.motion} onChange={(e) => update((x) => ({ ...x, motion: e.target.value as typeof x.motion }))} aria-label="Motion">
            <option value="system">Motion: system</option>
            <option value="reduce">Motion: reduced</option>
            <option value="full">Motion: full</option>
          </select>
        </label>
      </header>
      <div className="layout">
        <aside id="sidenav" className="side">
          <Sidebar route={route} onNavigate={() => setNavOpen(false)} />
          <div className="side-foot small">
            {!storageOk && <p className="warn">Progress cannot be saved in this browser (storage blocked).</p>}
            {!confirmReset ? (
              <button type="button" className="link" onClick={() => setConfirmReset(true)}>Reset saved progress</button>
            ) : (
              <div className="confirm-box" role="group" aria-label="Confirm reset">
                <p>Clear all saved progress, answers and bookmarks on this device?</p>
                <button type="button" onClick={() => { reset(); setConfirmReset(false); }}>Yes, clear everything</button>{' '}
                <button type="button" className="link" onClick={() => setConfirmReset(false)}>Cancel</button>
              </div>
            )}
          </div>
        </aside>
        {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />}
        <main id="main" tabIndex={-1}>{body}</main>
      </div>
      <SourceViewer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
