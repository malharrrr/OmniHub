<p align="center">
  <img src="./assets/logo.png" alt="OmniHub Logo" width="200" />
</p>

<h1 align="center">OmniHub</h1>

<p align="center">
  <strong>A zero-infrastructure MCP server and CLI for your AI second brain.</strong>
</p>

[![npm package](https://img.shields.io/npm/v/omnihub-cli?color=CB3837&style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/omnihub-cli)

OmniHub is a lightweight, local memory system that gives your AI assistants (Claude, Gemini, etc.) access to your personal knowledge history — decisions, ideas, milestones, notes — through semantic search over the Model Context Protocol (MCP). No database to provision, no container to run. Just a JSON file and a fast CLI.

---

## Why OmniHub?

AI assistants have no memory of your past work by default. You end up re-explaining context every session. OmniHub fixes this by letting you log structured notes from anywhere on your machine and expose them to your AI via MCP — so instead of repeating yourself, you just ask.

> _"What was the last architectural decision I made regarding databases?"_  
> Your AI queries OmniHub, scans your logs, and answers based on your actual history.

**No Docker. No Postgres. No cloud.**  
Everything lives in `~/.omnihub/memories.json`, searched in-memory using cosine similarity over vector embeddings. Atomic writes protect your data even if the process is interrupted.

---

## Features

- **Hybrid Search** — Combines semantic vector similarity (70%) with exact keyword matching (30%) to find both concepts and specific technical IDs.
- **At-Rest Encryption** — All memories are encrypted using AES-256-GCM before being written to disk, ensuring your second brain remains private even if files are accessed.
- **Fast CLI** — Log a memory or search your history in one command from any directory.
- **Editor mode** — Omit the content argument and OmniHub opens your `$EDITOR` for longer notes.
- **Auto-categorization** — Skip the `-c` flag and let the AI pick the right category for you.
- **Multi-provider support** — Use Gemini (default) or OpenAI for both embeddings and categorization.
- **6 MCP tools** — Log, search, list, edit, delete, and export memories directly from your AI client.
- **Markdown export** — Dump your entire memory bank as a structured `.md` file grouped by category.
- **Persistent config** — API keys and encryption keys stored securely in `~/.omnihub/config.json` with `0600` permissions.
- **Atomic writes** — Memories written via temp-file-then-rename to prevent data corruption.
---

## Prerequisites

- [Bun](https://bun.sh/) installed on your machine
- An API key for your chosen provider:
  - **Gemini (default):** [Google AI Studio](https://aistudio.google.com/app/apikey)
  - **OpenAI:** [platform.openai.com](https://platform.openai.com/api-keys)

---

## Installation

### Option 1: npm / npx (No clone needed)

The package is published on npm as [`omnihub-cli`](https://www.npmjs.com/package/omnihub-cli). Install it globally with your package manager of choice:

```bash
# npm
npm install -g omnihub-cli

# bun
bun add -g omnihub-cli

# pnpm
pnpm add -g omnihub-cli
```

Once installed, the `omnihub` command is available system-wide:

```bash
omnihub login
omnihub log -c architecture "My note here"
omnihub search "database decisions"
```

You can also run it without installing using `npx` or `bunx` for a quick try:

```bash
npx omnihub-cli login
npx omnihub-cli log -c idea "My note here"

# or with bun
bunx omnihub-cli login
```

> `npx`/`bunx` won't persist the global `omnihub` alias between sessions, but is handy before committing to a global install.

### Option 2: Clone & Link (For Contributors / Local Development)

```bash
git clone https://github.com/malharrrr/OmniHub.git
cd OmniHub
bun install
bun link
```

### Option 3: Local Run

Run directly from the project folder without any global install:

```bash
bun run ./apps/cli/index.ts log -c architecture "My note here"
```

---

## Setup

Run the login command to save your API key. It is stored securely (mode `0600`) at `~/.omnihub/config.json` — never in your project directory.

```bash
omnihub login
# 🔑 Enter your Gemini API Key (get one at aistudio.google.com): ...
# ✅ API Key saved securely to ~/.omnihub/config.json
```

You can also set keys via environment variables, which take precedence over stored config:

```bash
export GEMINI_API_KEY=your_key_here
# or
export OPENAI_API_KEY=your_key_here
export OMNIHUB_PROVIDER=openai
```

---

## CLI Usage

### Log a Memory

Provide a category with `-c` and your note inline:

```bash
omnihub log -c architecture "Swapped Postgres for a pure JSON file to keep the tool portable"
omnihub log -c bug_fix "Fixed cosine similarity returning NaN when embedding was empty"
omnihub log -c tech_stack "Chose Bun over Node for faster startup and native TypeScript support"
```

**Auto-categorization** — omit `-c` and the AI picks the best category for you:

```bash
omnihub log "Decided to use atomic writes to prevent data corruption on crashes"
# 🤖 Auto-categorizing... [architecture]
# ✅ Saved successfully.
```

**Editor mode** — omit the content argument entirely to open your `$EDITOR` (defaults to `nano`):

```bash
omnihub log -c meeting_notes
# Opening nano...
# (write your notes, save, and close)
# ✅ Saved successfully.
```

### Search Memories

Search by concept or intent — not exact keywords:

```bash
omnihub search "database decisions"
omnihub search "why did I pick this runtime"
omnihub search "performance tradeoffs I made"
```

---

## MCP Tools

OmniHub exposes six tools over stdio that any MCP-compatible AI client can call automatically.

| Tool | Description |
|---|---|
| `log_memory` | Log a memory with a category and content |
| `search_context` | Semantic search with optional `limit`, `min_score`, and `category` filter |
| `list_memories` | List stored memories, optionally filtered by category and limit |
| `edit_memory` | Update the content (and optionally category) of an existing memory by ID |
| `delete_memory` | Delete a memory by ID |
| `export_memories` | Export the full memory bank as a Markdown document |

### Connecting to Claude Code

Run this from inside your cloned OmniHub directory:

```bash
claude mcp add omnihub --transport stdio "bun run $(pwd)/apps/mcp-server/index.ts"
```

Once connected, your AI can query and manage your memory bank automatically:

> _"Summarize all the architectural decisions I've logged."_  
> _"Edit the memory about the database migration — we went with SQLite, not JSON."_  
> _"Delete the memory about the bug I fixed last week."_  
> _"Export all my memories as Markdown."_

### Connecting Other MCP Clients

Any client supporting the MCP stdio transport can connect the same way — point it to `apps/mcp-server/index.ts` using `bun run`.

---

## Multi-Provider Support

OmniHub supports Gemini and OpenAI for both embeddings and auto-categorization. Provider resolution follows this priority:

1. `OMNIHUB_PROVIDER` environment variable
2. `provider` field in `~/.omnihub/config.json` (set via `omnihub login`)
3. Default: **Gemini**

| Provider | Embedding Model | Categorization Model |
|---|---|---|
| Gemini (default) | `gemini-embedding-2` | `gemini-2.5-flash` |
| OpenAI | `text-embedding-3-small` | `gpt-4o-mini` |

To switch to OpenAI:

```bash
export OMNIHUB_PROVIDER=openai
export OPENAI_API_KEY=your_key_here
```

---

## Customization

Open `apps/config.ts` to configure categories, search defaults, and limits:

```typescript
export const CONFIG = {
  categories: ["architecture", "bug_fix", "tech_stack", "idea", "meeting_notes"],
  defaultSearchLimit: 5,
  maxContentLength: 10_000,
  defaultEmbeddingModel: "gemini-embedding-2",
};
```

Tailor categories to your workflow:

```typescript
// Designers
categories: ["inspiration", "feedback", "typography", "color_system"]

// Founders
categories: ["product_idea", "user_feedback", "marketing", "investor"]
```

---

## How It Works

1. **Login & Keys** — `omnihub login` saves your API key and generates a unique 256-bit encryption key in `~/.omnihub/config.json`.
2. **Log** — When you log a note, OmniHub generates a vector embedding. The entire memory object is then encrypted using your local key and saved to `memories.json` via an atomic write.
3. **Hybrid Search** — Your query is embedded and compared against stored vectors. This is combined with a keyword-frequency score to ensure specific terms (like "Bug-123") aren't lost in semantic translation.
4. **MCP** — Connected AI clients (like Claude Code) can call tools to query your history. OmniHub handles the decryption and ranking in-memory to provide the most relevant context.
5. **Export** — `export_memories` decrypts your history and formats it into a structured Markdown document.

## Data & Privacy

| What | Where | Security |
|---|---|---|
| Memories | `~/.omnihub/memories.json` | **Encrypted (AES-256-GCM)** |
| Config & Keys | `~/.omnihub/config.json` | **Restricted (mode 0600)** |
| Gitignore | `memories.json` | **Excluded by default** |
| External calls | Gemini / OpenAI APIs | **Embeddings & Categorization only** |

Your data never leaves your machine in plain text except for the text sent to your chosen provider's API. No telemetry, no cloud storage.

> **Never commit your `~/.omnihub/` directory or any `.env` files to a public repository.**

---

## Performance & Benchmarks (At 1,000 Stored Memories)

OmniHub is built to maintain a zero-infrastructure, low-latency profile even after a year of heavy daily usage. Benchmarks performed using `hyperfine` (Apple Silicon) on a dataset of 1,000 encrypted entries (approx. 40MB at-rest):

| Operation | Total Latency | Local CPU Execution | Network API (Gemini) |
| :--- | :--- | :--- | :--- |
| **Hybrid Search** | ~1.6s | < 1.0s | ~600ms |
| **Log Memory** | ~8.6s | < 400ms | ~8.2s |

* **Search Performance:** Local AES-256 decryption, JSON parsing, and O(n) cosine similarity math across 1,000 high-dimensional vectors executes in roughly **1 second**. 
* **Write Pipeline:** The local file operations (decrypting, appending, re-encrypting 40MB) complete in under **400ms**. 
* *Note: Total execution times are strictly bottlenecked by the external AI provider's API response time for generating embeddings, not the local engine, will be switching to a local embedding model in future patches.*

---

## Scripts

```bash
bun install        # Install dependencies
bun run start      # Run the CLI directly
bun run typecheck  # Type-check without emitting
bun link           # Link globally (enables the omnihub command system-wide)
```

---
## License

MIT — fork it, change it, make it yours.

---

## Author

Built by [Malhar Bonde](https://github.com/malharrrr)
