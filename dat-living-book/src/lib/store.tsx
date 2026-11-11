import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const KEY = 'dat-living-book:v1';

export interface Progress {
  visited: Record<string, boolean>;
  completed: Record<string, boolean>;
  bookmarks: string[]; // route strings, e.g. "section/steps"
  quizAnswers: Record<string, number>; // quiz id -> chosen option
  flashKnown: Record<string, boolean>;
  casesDone: Record<string, boolean>;
  labRuns: number;
  labCleanRuns: number;
  last: string;
  theme: 'system' | 'light' | 'dark';
  motion: 'system' | 'reduce' | 'full';
}

const empty: Progress = {
  visited: {},
  completed: {},
  bookmarks: [],
  quizAnswers: {},
  flashKnown: {},
  casesDone: {},
  labRuns: 0,
  labCleanRuns: 0,
  last: '',
  theme: 'system',
  motion: 'system',
};

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

interface Store {
  p: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  reset: () => void;
  storageOk: boolean;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Progress>(load);
  const [storageOk, setOk] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
      setOk(true);
    } catch {
      setOk(false);
    }
  }, [p]);
  const update = useCallback((fn: (p: Progress) => Progress) => setP((old) => fn(old)), []);
  const reset = useCallback(() => setP({ ...empty, theme: p.theme, motion: p.motion }), [p.theme, p.motion]);
  const v = useMemo(() => ({ p, update, reset, storageOk }), [p, update, reset, storageOk]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}

export function usePrefersReducedMotion() {
  const { p } = useStore();
  const [sys, setSys] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setSys(m.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  if (p.motion === 'reduce') return true;
  if (p.motion === 'full') return false;
  return sys;
}
