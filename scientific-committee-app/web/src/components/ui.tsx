import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError, type Scope } from '../api';

// ---------- scope (real vs demo) ----------

interface ScopeContextValue { scope: Scope; setScope: (scope: Scope) => void }
const ScopeContext = createContext<ScopeContextValue>({ scope: 'real', setScope: () => {} });

export function ScopeProvider({ children }: { children: ReactNode }) {
  const [scope, setScopeState] = useState<Scope>(() =>
    (localStorage.getItem('sca.scope') === 'demo' ? 'demo' : 'real'),
  );
  const setScope = useCallback((next: Scope) => {
    localStorage.setItem('sca.scope', next);
    setScopeState(next);
  }, []);
  const value = useMemo(() => ({ scope, setScope }), [scope, setScope]);
  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

export function useScope(): ScopeContextValue {
  return useContext(ScopeContext);
}

// ---------- toasts ----------

interface Toast { id: number; text: string; kind: 'info' | 'success' | 'error' }
const ToastContext = createContext<{ push: (text: string, kind?: Toast['kind']) => void }>({ push: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, kind: Toast['kind'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, text, kind }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 6000);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.kind}`}>{toast.text}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// ---------- async data ----------

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loader()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'تعذّر الاتصال بالخادم. تأكد من تشغيله.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}

// ---------- presentational ----------

export function Loading({ label = 'جارٍ التحميل…' }: { label?: string }) {
  return (
    <div className="loading">
      <span className="spinner" aria-hidden="true" /> <span>{label}</span>
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="notice danger">
      <div>{message}</div>
      {onRetry && (
        <button type="button" className="btn small" style={{ marginTop: 8 }} onClick={onRetry}>
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      {hint && <div className="small">{hint}</div>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

export function Badge({ kind, children }: { kind: 'neutral' | 'ok' | 'warn' | 'danger' | 'info' | 'demo'; children: ReactNode }) {
  return <span className={`badge ${kind}`}>{children}</span>;
}

export function Notice({ kind = 'neutral', children }: { kind?: 'neutral' | 'warn' | 'danger' | 'ok' | 'demo'; children: ReactNode }) {
  return <div className={`notice ${kind === 'neutral' ? '' : kind}`}>{children}</div>;
}

export function DemoBanner({ scope }: { scope: Scope }) {
  if (scope !== 'demo') return null;
  return (
    <Notice kind="demo">
      وضع العرض التجريبي — جميع البيانات الظاهرة اصطناعية: «للتجربة فقط — ليست لائحة معتمدة». لا تُستخدم في أي دراسة فعلية.
    </Notice>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint && <div className="hint">{hint}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} بايت`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} ك.ب`;
  return `${(size / 1024 / 1024).toFixed(2)} م.ب`;
}

export function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function extractionBadge(status: string): 'ok' | 'warn' | 'danger' | 'neutral' {
  if (status === 'extracted') return 'ok';
  if (status === 'partial' || status === 'needs_ocr') return 'warn';
  if (status === 'failed' || status === 'unsupported') return 'danger';
  return 'neutral';
}

export function verdictBadge(verdict: string): 'ok' | 'warn' | 'danger' | 'neutral' {
  if (verdict === 'met') return 'ok';
  if (verdict === 'not_met') return 'danger';
  if (verdict === 'unverifiable') return 'warn';
  return 'neutral';
}
