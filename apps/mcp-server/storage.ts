import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { CONFIG } from '../config.js';
import { getEncryptionKey } from '../config.js'; 

export interface Memory {
  id: string;
  category: string;
  content: string;
  embedding: number[];
  createdAt: string;
}

const ALGORITHM = 'aes-256-gcm';

function encryptData(text: string): string {
  const key = Buffer.from(getEncryptionKey(), 'hex'); 
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Store iv and authTag alongside the encrypted payload
  return JSON.stringify({ iv: iv.toString('hex'), authTag, data: encrypted });
}

function decryptData(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.iv && parsed.authTag && parsed.data) {
      const key = Buffer.from(getEncryptionKey(), 'hex');
      const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(parsed.iv, 'hex'));
      decipher.setAuthTag(Buffer.from(parsed.authTag, 'hex'));
      
      let decrypted = decipher.update(parsed.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    return raw;
  } catch {
    throw new Error('Failed to decrypt data.');
  }
}

function ensureDataFile(): void {
  const dir = dirname(CONFIG.dataFile);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(CONFIG.dataFile)) {
    atomicWrite([]);
  }
}

function atomicWrite(memories: Memory[]): void {
  const tmp = CONFIG.dataFile + '.tmp';
  const rawJson = JSON.stringify(memories, null, 2);
  
  // encrypt the JSON string before writing to disk
  const securePayload = encryptData(rawJson);
  
  writeFileSync(tmp, securePayload, 'utf-8');
  renameSync(tmp, CONFIG.dataFile);
}

export function loadMemories(): Memory[] {
  ensureDataFile();
  try {
    const raw = readFileSync(CONFIG.dataFile, 'utf-8');
    const decryptedJson = decryptData(raw);
    return JSON.parse(decryptedJson) as Memory[];
  } catch (error) {
    console.error('⚠️  memories.json is corrupted or decryption failed. Starting fresh.');
    atomicWrite([]);
    return [];
  }
}

export function saveMemories(memories: Memory[]): void {
  ensureDataFile();
  atomicWrite(memories);
}

export function addMemoryRecord(memory: Memory): void {
  const memories = loadMemories();
  memories.push(memory);
  saveMemories(memories);
}

export function deleteMemoryRecord(id: string): boolean {
  const memories = loadMemories();
  const idx = memories.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  memories.splice(idx, 1);
  saveMemories(memories);
  return true;
}

export function updateMemoryRecord(
  id: string,
  patch: Partial<Pick<Memory, 'content' | 'category' | 'embedding'>>
): boolean {
  const memories = loadMemories();
  const idx = memories.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  memories[idx] = { ...memories[idx], ...patch };
  saveMemories(memories);
  return true;
}

export function getMemoryById(id: string): Memory | undefined {
  return loadMemories().find((m) => m.id === id);
}

//export memories to a .md file
export function exportToMarkdown(memories: Memory[]): string {
  const lines: string[] = ['# OmniHub Memory Export\n'];
  const byCategory: Record<string, Memory[]> = {};

  for (const m of memories) {
    if (!byCategory[m.category]) byCategory[m.category] = [];
    byCategory[m.category].push(m);
  }

  for (const [cat, items] of Object.entries(byCategory)) {
    lines.push(`## ${cat}\n`);
    for (const m of items) {
      const date = new Date(m.createdAt).toLocaleString();
      lines.push(`### ${date} \`[${m.id}]\``);
      lines.push(m.content);
      lines.push('');
    }
  }
  return lines.join('\n');
}