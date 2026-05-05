import { join } from 'path';

export const CONFIG = {
  // feel free to use a different model but ensure that you update the code in ai.ts accordingly
  embeddingModel: "gemini-embedding-2",
  
  // JSON database will be stored, you can modify this to a different path if you want
  dataFile: join(process.cwd(), 'memories.json'),
  
  // users can customize these to fit their profession!
  // e.g., A designer might use: ["inspiration", "feedback", "typography", "process"]
  categories: ["architecture", "milestone", "interest", "tech_stack", "idea", "bug_fix"],
  
  // default number of memories to return in AI searches
  defaultSearchLimit: 5
};