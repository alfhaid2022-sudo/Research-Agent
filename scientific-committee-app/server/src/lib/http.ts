import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';
import { HttpError, normalizeScope, type Scope } from './util.js';

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new HttpError(400, 'بيانات غير صالحة.', result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    })));
  }
  return result.data;
}

export function scopeOf(req: Request): Scope {
  return normalizeScope(req.query.scope ?? (req.body as { scope?: unknown } | undefined)?.scope);
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message, details: error.details ?? null });
    return;
  }
  const message = (error as Error)?.message ?? 'خطأ غير متوقع';
  if (message.includes('File too large')) {
    res.status(400).json({ error: 'حجم الملف يتجاوز الحد المسموح.' });
    return;
  }
  console.error('[error]', error);
  res.status(500).json({ error: `خطأ في الخادم: ${message}` });
}

/** Express types route params as possibly-undefined; a missing one is a 400, not a crash. */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new HttpError(400, `المعرف المطلوب (${name}) مفقود في المسار.`);
  }
  return value;
}

/**
 * Multipart fields arrive as strings, where z.coerce.boolean() would read "false" as true.
 */
export const booleanField = z
  .union([z.boolean(), z.string()])
  .transform((value) => value === true || value === 'true' || value === '1' || value === 'on');
