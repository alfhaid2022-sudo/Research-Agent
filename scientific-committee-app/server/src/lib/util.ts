import crypto from 'node:crypto';
import { getDb } from '../db.js';

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(9).toString('hex')}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function sha256(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export type Scope = 'real' | 'demo';

export function normalizeScope(value: unknown): Scope {
  return value === 'demo' ? 'demo' : 'real';
}

/**
 * Arabic-aware normalization used only for *comparing* a model-produced quote
 * against the stored source text. It never changes what is displayed.
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ْٰـ]/g, '') // harakat + tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[‏‎ ]/g, ' ')
    .replace(/[«»"'“”‘’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function audit(action: string, entity: string, entityId: string, detail: unknown = ''): void {
  getDb()
    .prepare(
      `INSERT INTO audit_log (id, at, actor, action, entity, entity_id, detail)
       VALUES (?, ?, 'local', ?, ?, ?, ?)`,
    )
    .run(
      newId('aud'),
      nowIso(),
      action,
      entity,
      entityId,
      typeof detail === 'string' ? detail : JSON.stringify(detail),
    );
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export function must<T>(value: T | undefined | null, message: string, status = 404): T {
  if (value === undefined || value === null) throw new HttpError(status, message);
  return value;
}
