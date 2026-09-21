import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Each test worker gets its own data directory, so tests never touch real data.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sca-test-'));
process.env.DATA_DIR = dir;
process.env.DB_FILE = path.join(dir, 'test.db');
process.env.AI_API_KEY = ''; // automatic analysis is off in tests unless a case enables it
