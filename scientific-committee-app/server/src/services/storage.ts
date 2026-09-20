import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { config } from '../config.js';
import { HttpError, newId, sha256 } from '../lib/util.js';
import { SUPPORTED_EXTENSIONS } from './extract.js';

/** Extensions accepted for upload. Executable/scriptable types are never accepted. */
const ALLOWED_UPLOAD_EXTENSIONS = new Set<string>([
  ...SUPPORTED_EXTENSIONS,
  '.doc',
  '.png',
  '.jpg',
  '.jpeg',
  '.xlsx',
]);

const BLOCKED_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.sh', '.bash', '.py', '.rb', '.php', '.pl',
  '.exe', '.bat', '.cmd', '.com', '.msi', '.dll', '.so', '.jar', '.app',
  '.html', '.htm', '.svg', '.xhtml', '.vbs', '.ps1', '.scr',
]);

export const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes, files: 10 },
});

export interface StoredFile {
  fileName: string;
  storedName: string;
  mime: string;
  size: number;
  sha256: string;
  buffer: Buffer;
}

/**
 * Multipart file names arrive latin1-decoded, which turns Arabic names into
 * mojibake. Re-decode when that round-trip yields valid UTF-8.
 */
export function decodeFileName(rawName: string): string {
  if (!/[\u0080-\u00ff]/.test(rawName)) return rawName;
  try {
    const decoded = Buffer.from(rawName, 'latin1').toString('utf8');
    if (!decoded.includes('\ufffd') && /[\u0600-\u06ff]/.test(decoded)) return decoded;
  } catch {
    /* keep the original name */
  }
  return rawName;
}

/**
 * Strips directory components, control characters and Unicode bidi marks — some
 * Arabic file names arrive with an RTL control character in front of the name.
 */
export function safeBaseName(rawName: string): string {
  const decoded = decodeFileName(rawName);
  const base = path.basename(decoded.replace(/\\/g, '/'));
  const cleaned = base
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\u061c]/g, '')
    .replace(/^\.+/, '')
    .trim();
  return cleaned.length > 0 ? cleaned.slice(0, 180) : 'ملف';
}

export function validateUpload(file: Express.Multer.File): void {
  const name = safeBaseName(file.originalname);
  const ext = path.extname(name).toLowerCase();
  if (!ext) throw new HttpError(400, 'الملف بدون امتداد. يرجى رفع ملف بامتداد معروف.');
  if (BLOCKED_EXTENSIONS.has(ext)) {
    throw new HttpError(400, `الامتداد ${ext} غير مسموح به لأسباب أمنية.`);
  }
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
    throw new HttpError(
      400,
      `الامتداد ${ext} غير مسموح به. المسموح: ${[...ALLOWED_UPLOAD_EXTENSIONS].join('، ')}.`,
    );
  }
  if (file.size <= 0) throw new HttpError(400, 'الملف فارغ.');
  if (file.size > config.maxUploadBytes) {
    throw new HttpError(400, `حجم الملف يتجاوز الحد المسموح (${Math.floor(config.maxUploadBytes / 1024 / 1024)} ميجابايت).`);
  }
}

/** Persists the upload under a server-generated name; the original name is metadata only. */
export function storeUpload(file: Express.Multer.File): StoredFile {
  validateUpload(file);
  const fileName = safeBaseName(file.originalname);
  const ext = path.extname(fileName).toLowerCase();
  const storedName = `${newId('f')}${ext}`;
  const target = path.join(config.uploadsDir, storedName);
  fs.mkdirSync(config.uploadsDir, { recursive: true });
  fs.writeFileSync(target, file.buffer, { mode: 0o600 });
  return {
    fileName,
    storedName,
    mime: file.mimetype || 'application/octet-stream',
    size: file.size,
    sha256: sha256(file.buffer),
    buffer: file.buffer,
  };
}

/** Resolves a stored file, refusing anything that escapes the uploads directory. */
export function resolveStoredPath(storedName: string): string {
  const base = path.basename(storedName);
  if (base !== storedName || base.includes('..') || base.length === 0) {
    throw new HttpError(400, 'اسم ملف غير صالح.');
  }
  const uploadsDir = path.resolve(config.uploadsDir);
  const full = path.resolve(uploadsDir, base);
  if (!full.startsWith(uploadsDir + path.sep)) {
    throw new HttpError(400, 'مسار ملف غير صالح.');
  }
  if (!fs.existsSync(full)) throw new HttpError(404, 'الملف غير موجود على القرص.');
  return full;
}
