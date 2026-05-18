import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const CONFIG_DIR = join(homedir(), '.omnihub');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

// resolve data file path: always stored in ~/.omnihub/ so it's stable
// regardless of which directory the user runs the CLI from.
export const DATA_FILE = join(CONFIG_DIR, 'memories.json');

export const CONFIG = {
  categories: ["architecture", "bug_fix", "tech_stack", "idea", "meeting_notes"],
  dataFile: DATA_FILE,
  defaultEmbeddingModel: "all-MiniLM-L6-v2-q4",
  defaultSearchLimit: 5,
  maxContentLength: 10_000,
};

interface StoredConfig {
  ENCRYPTION_KEY?: string;
}

function readStoredConfig(): StoredConfig {
  if (existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) as StoredConfig;
    } catch {
      return {};
    }
  }
  return {};
}

export function getEncryptionKey(): string {
  const stored = readStoredConfig();
  
  // if a key already exists, return it
  if (stored.ENCRYPTION_KEY) {
    return stored.ENCRYPTION_KEY;
  }

  // otherwise, generate a secure 256-bit hex key
  const newKey = randomBytes(32).toString('hex');
  
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const updated: StoredConfig = {
    ...stored,
    ENCRYPTION_KEY: newKey,
  };
  writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), {
    mode: 0o600,
  });

  return newKey;
}