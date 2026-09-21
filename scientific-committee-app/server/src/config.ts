import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
// server/src -> server -> scientific-committee-app
export const appRoot = path.resolve(here, '..', '..');

dotenv.config({ path: path.join(appRoot, '.env'), quiet: true });

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const dataDirDefault = path.join(appRoot, 'data');

export const config = {
  port: envInt('PORT', 4000),
  /** Bind to loopback by default: this build is a single-user local tool. */
  host: process.env.HOST ?? '127.0.0.1',
  dataDir: process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : dataDirDefault,
  get uploadsDir() {
    return path.join(this.dataDir, 'uploads');
  },
  get dbFile() {
    return process.env.DB_FILE ? path.resolve(process.env.DB_FILE) : path.join(this.dataDir, 'committee.db');
  },
  maxUploadBytes: envInt('MAX_UPLOAD_MB', 25) * 1024 * 1024,
  // Read lazily so the process can be started with, or without, a key without a rebuild.
  ai: {
    get provider(): string {
      return (process.env.AI_PROVIDER ?? 'anthropic').trim().toLowerCase();
    },
    get apiKey(): string {
      return (process.env.AI_API_KEY ?? '').trim();
    },
    get baseUrl(): string {
      return (process.env.AI_BASE_URL ?? 'https://api.anthropic.com').trim().replace(/\/+$/, '');
    },
    get model(): string {
      return (process.env.AI_MODEL ?? 'claude-sonnet-5').trim();
    },
    get maxOutputTokens(): number {
      return envInt('AI_MAX_OUTPUT_TOKENS', 8000);
    },
    get timeoutMs(): number {
      return envInt('AI_TIMEOUT_MS', 120000);
    },
  },
};

export function ensureDirs(): void {
  for (const dir of [config.dataDir, config.uploadsDir]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** true only when a server-side key is present. The browser never sees it. */
export function aiConfigured(): boolean {
  return config.ai.apiKey.length > 0;
}
