import { readFileSync, writeFileSync, existsSync } from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cosineSimilarity from 'cosine-similarity';
import { CONFIG } from '../config.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

if (!existsSync(CONFIG.dataFile)) {
  writeFileSync(CONFIG.dataFile, JSON.stringify([]));
}

export async function addMemory(category: string, content: string) {
  const model = genAI.getGenerativeModel({ model: CONFIG.embeddingModel });
  const result = await model.embedContent(content);
  const embedding = result.embedding.values as number[]; 
  
  const memories = JSON.parse(readFileSync(CONFIG.dataFile, 'utf-8'));
  
  memories.push({ 
    id: Date.now().toString(), 
    category, 
    content, 
    embedding, 
    createdAt: new Date().toISOString() 
  });
  
  writeFileSync(CONFIG.dataFile, JSON.stringify(memories, null, 2));
  return `Memory stored successfully under category: ${category}.`;
}

export async function searchMemories(query: string, limit: number = CONFIG.defaultSearchLimit) {
  const model = genAI.getGenerativeModel({ model: CONFIG.embeddingModel });
  const result = await model.embedContent(query);
  const queryVector = result.embedding.values as number[];
  
  const memories = JSON.parse(readFileSync(CONFIG.dataFile, 'utf-8'));
  
  const results = memories.map((m: any) => ({
    ...m,
    similarity: cosineSimilarity(queryVector, m.embedding) 
  })).sort((a: any, b: any) => b.similarity - a.similarity);

  return results.slice(0, limit).map(({ embedding, ...rest }: any) => rest);
}