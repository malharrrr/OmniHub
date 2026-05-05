import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { addMemory, searchMemories } from "./ai.js";
import { CONFIG } from "../config.js";

const server = new Server({
  name: "omnihub",
  version: "1.0.0"
}, {
  capabilities: { tools: {} }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "log_memory",
      description: "Logs a professional memory, thought, or decision.",
      inputSchema: {
        type: "object",
        properties: {
          category: { 
            type: "string", 
            enum: CONFIG.categories,
            description: `Must be one of: ${CONFIG.categories.join(', ')}`
          },
          content: { type: "string", description: "The detailed context or rationale." }
        },
        required: ["category", "content"]
      }
    },
    {
      name: "search_context",
      description: "Searches the user's past notes and trajectory.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "The semantic search query." },
          limit: { type: "number", description: "Number of results to return." }
        },
        required: ["query"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "log_memory") {
      const { category, content } = request.params.arguments as any;
      const result = await addMemory(category, content);
      return { content: [{ type: "text", text: result }] };
    }

    if (request.params.name === "search_context") {
      const { query, limit } = request.params.arguments as any;
      const results = await searchMemories(query, limit || CONFIG.defaultSearchLimit);
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }

    throw new Error(`Tool ${request.params.name} not found`);
  } catch (error: any) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(" OmniHub MCP Server running on stdio");
}

main().catch(console.error);