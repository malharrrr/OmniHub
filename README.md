# ⚡ OmniHub (`omnihub-cli`)
<p align="center">
  <img src="./assets/logo.png" alt="OmniHub Logo" width="200" />
</p>


A blazing fast, local-first, privacy-compliant personal memory hub and Model Context Protocol (MCP) server for developers. 

OmniHub runs entirely on your local machine with a **zero-network footprint**. It eliminates external cloud dependencies, API keys, and network roundtrips by running specialized, highly optimized 4-bit quantized AI embedding pipelines directly inside an on-device WebAssembly environment.

[![npm package](https://img.shields.io/npm/v/omnihub-cli?color=CB3837&style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/omnihub-cli)
---

## 🚀 Key Features

- **100% Offline AI Inference**: Powered by an on-device WebAssembly ONNX runtime running `all-MiniLM-L6-v2`. Your data never leaves your computer.
- **Blazing Fast Performance**: Zero network latency. Sub-250ms semantic matching across your personal knowledge base.
- **70/30 Hybrid Search Engine**: Combines 384-dimensional dense semantic vectors with localized high-frequency exact keyword extraction to ensure flawless recall accuracy.
- **Local Heuristic Auto-Categorization**: Automatically tags incoming logs into developer-centric groups (`tech_stack`, `bug_fix`, `architecture`, `meeting_notes`, `idea`) using ultra-fast local keyword mapping.
- **Model Context Protocol (MCP) Support**: Acts as a native MCP server out of the box. Connect it seamlessly to LLM clients like Claude Desktop, Cursor, or custom AI agents to give them long-term localized memory.
- **Cryptographic Security**: At-rest data storage is fully encrypted using robust local encryption standards, protecting your sensitive developer secrets.

---

## 📊 Performance & Scaling Benchmarks

OmniHub scales linearly on single-threaded CPU architectures. Tested extensively using `hyperfine` in an Apple Silicon environment, the local engine delivers massive efficiency upgrades compared to legacy cloud-dependent wrappers:

| Dataset Scale | Stored Memories | At-Rest DB Size | Search Latency (Mean) | User Perception |
| :--- | :--- | :--- | :--- | :--- |
| **The Bootstrap** | 100 entries | ~2.02 MB | **148.0 ms** | Instantaneous |
| **The Developer Sweet Spot** | 1,000 entries | ~20.20 MB | **234.1 ms** | Fluid / Real-time |
| **The Power User Stress Test** | 10,000 entries | ~202.03 MB | **1.005 s** | Snappy Execution |
| *Legacy Cloud Baseline* | *10,000 entries* | *~398.00 MB* | *10.669 s* | *Workflow Blocker* |

### Why OmniHub 1.3.0 is 10x Faster:
1. **Dimensionality Reduction**: Slicing vector widths from 768 down to 384 dimensions reduces linear algebra operations by 50% per row scan.
2. **Quantization Performance (`q4`)**: Utilizing 4-bit quantized integers reduces the model memory footprint to a tiny **14MB**, enabling the CPU to load weights straight into L1/L2 caches with minimal memory bandwidth throttling.

---

## 🛠️ Installation

Ensure you have [Bun](https://bun.sh) or [Node.js](https://nodejs.org) installed on your system, then install the package globally via npm:

```bash
npm install -g omnihub-cli
```

---

## 💻 CLI Usage

### 1. Log a Memory
Add a quick note or code snippet. If you omit the inline content, OmniHub automatically launches your system's default editor (e.g., `nano` or `vim`).

```bash
# Explicitly pass a category
omnihub log "Configured Docker Compose with multi-stage build caching flags." --category tech_stack

# Let the local heuristic auto-categorize your note
omnihub log "Fixed a runtime exception thrown when passing invalid JWT claims."
# Output: 🤖 Auto-categorizing locally... [bug_fix]
```

### 2. Search Memories
Perform a hybrid keyword and dense vector semantic query across your encrypted data history.

```bash
omnihub search "docker cache"
```

### 3. Database Migration / Reset
If you are upgrading from legacy pre-1.3.0 environments using old cloud structures, clear your environment to match the new 384-dimensional vector database:

```bash
omnihub reset
```

---

## 🤖 Model Context Protocol (MCP) Integration

OmniHub functions perfectly as a local standard input/output (`stdio`) MCP server. You can configure LLM agents to automatically store and extract engineering insights on your behalf.

### Claude Desktop Configuration
Add the following snippet to your configuration file (located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "omnihub": {
      "command": "omnihub",
      "args": ["run", "apps/mcp-server/index.ts"]
    }
  }
}
```

### Exposed MCP Tools

- `log_memory`: Logs a structural memory, thought, or developer decision directly into your encrypted local cache (supports auto-categorization placeholders).
- `search_context`: Performs localized dense-vector semantic queries combined with structural parameters (`limit`, `min_score`, and `category` filtering).
- `list_memories`: Scans and outputs a clean, stripped sequence of recent logs (automatically omitting heavy raw vector dimensions for faster client-side parsing) with explicit category filters.
- `edit_memory`: Modifies the core content string or alters structural classification tags of an existing entry targeting a specific unique record ID.
- `delete_memory`: Safely drops an active unique tracking ID completely out of the local record array.
- `export_memories`: Compiles and marshals your entire structural knowledge base straight into a clean, portable standalone Markdown document stream.

---

## 🔒 Privacy & Architecture

OmniHub is uncompromised in its local-first approach. 
- **No Telemetry**: Zero tracking analytics.
- **No Cloud Syncing**: No unexpected outbound payloads.
- **Local Vectors**: Embeddings are calculated strictly on your CPU using WebAssembly bindings.
- **Security**: Flat JSON store with cryptographically sound local read/write mechanisms.

---

## 📄 License

MIT © [Malhar Sarang Bonde](https://github.com/malharrrr)