# Cursor Proxy

English | [中文](README_zh.md)

> **Unified Agent Gateway** — Use **Antigravity** and **Codex** AI backends with **Claude Code CLI** and **Cursor IDE**.

[![CI](https://github.com/fjiangming/cursor-proxy/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fjiangming/cursor-proxy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-≥24-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Fastify](https://img.shields.io/badge/Fastify-HTTP%2F2-000000?logo=fastify&logoColor=white)](https://fastify.dev/)

## Overview
Cursor Proxy is a proxy server that connects AI coding clients to AI backends through protocol translation.

**Clients** (front-end):

- **Claude Code CLI** — Anthropic Messages API
- **Cursor IDE** — Protocol-compatible ConnectRPC/gRPC implementation

**Backends** (back-end):

- **Antigravity IDE** — Google Cloud Code API with protocol-compliant requests
- **Codex CLI** — OpenAI-compatible API for GPT and Codex models
- **Claude-Compatible API** — Anthropic-compatible `/v1/messages` with third-party keys

> **Disclaimer:** This project is for educational and research purposes only.
>
> Using this proxy may put your Antigravity account at risk of being banned. Proceed at your own discretion.

## Architecture
```text
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
│                          Clients                            │
│                                                             │
│  Claude Code CLI                Cursor IDE                  │
│  POST /v1/messages              POST /agent.v1.*            │
│  (Anthropic SSE)                (ConnectRPC/gRPC)           │
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
                              │
                              ▼
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
│                  Cursor Proxy Server                   │
│                                                             │
│  Gemini           → Antigravity IDE (Cloud Code)            │
│  Claude           → Claude-Compatible API / Antigravity     │
│  GPT              → Codex CLI / OpenAI-compatible API       │
│                                                             │
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
```

## Features
| Client          | Protocol                              | Backend                                           | Models              |
| --------------- | ------------------------------------- | ------------------------------------------------- | ------------------- |
| Claude Code CLI | Anthropic Messages API (SSE)          | Antigravity IDE, Claude-Compatible API, Codex CLI | Gemini, Claude, GPT |
| Cursor IDE      | ConnectRPC/gRPC (protocol-compatible) | Antigravity IDE, Claude-Compatible API, Codex CLI | Gemini, Claude, GPT |

## Compared with [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)
[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) is the closest reference project for this repo, but the focus is different.
[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) is primarily API-first and CLI-oriented. Cursor Proxy puts its main weight on
native client compatibility for Cursor and native upstream fidelity for Antigravity.

- **Cursor:** instead of stopping at OpenAI/Claude-compatible endpoints,
  Cursor Proxy implements Cursor's native ConnectRPC/gRPC agent channel
  with protocol-compatible protobuf definitions for interoperability,
  and implements the streaming tool loop directly.
- **Antigravity:** this repo's main Antigravity path is a newer
  worker-native approach, built around running Antigravity's own runtime
  and modules so Cloud Code requests stay protocol-compliant,
  with quota-aware worker rotation around that model.
- **Credits:** this project ports and adapts code from many open-source projects.
  The Claude Code CLI and Codex CLI integrations are primarily based on
  [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI), rebuilt in a
  TypeScript/NestJS architecture. The Cursor native protocol layer and
  Antigravity worker pool are original implementations.

## Installation

A free Cursor account is enough to use all agentic proxy features. No paid Cursor plan is required.
This project is exclusively designed to be used as a Cursor Extension. It handles the backend proxy execution natively.

> **💡 Important Note on Secondary Development and Custom Features:**
>
> If you have modified any core code locally (such as `apps/protocol-bridge`), **please DO NOT** download the pre-built VSCode extension (`.vsix`) from the official Releases page. The official `.vsix` bundles the unmodified upstream backend files; installing it will override all your local custom logic and fixes.
> 
> **To build a customized extension including your changes, follow these steps to package it from source:**
> 1. Ensure Node.js and `npm` are installed.
> 2. Run `npm install` in the project root.
> 3. Enter the extension directory: `cd apps/vscode-extension`
> 4. Run the build and package command: `npm run package`
> 5. Once finished, a `.vsix` file containing your latest changes will be generated in the same directory.
> 6. Install it into Cursor by running `cursor --install-extension <your_vsix_file>.vsix --force`, or simply use `npm run pack` which automatically packages, installs, and restarts the proxy.
>
> *Tip: For rapid packaging during extension development without full backend rebuilds, you can use `npm run package:fast` or `npm run pack:fast`.*

If you haven't made custom modifications, you can use one-click download + install from [GitHub Releases](https://github.com/fjiangming/cursor-proxy/releases):

#### macOS Apple Silicon

```bash
# Download
curl -L -o cursor-proxy-darwin-arm64-0.1.0.vsix https://github.com/fjiangming/cursor-proxy/releases/download/v0.1.0/cursor-proxy-darwin-arm64-0.1.0.vsix

# Install
cursor --install-extension cursor-proxy-darwin-arm64-0.1.0.vsix --force
```

#### macOS Intel

```bash
# Download
curl -L -o cursor-proxy-darwin-x64-0.1.0.vsix https://github.com/fjiangming/cursor-proxy/releases/download/v0.1.0/cursor-proxy-darwin-x64-0.1.0.vsix

# Install
cursor --install-extension cursor-proxy-darwin-x64-0.1.0.vsix --force
```

#### Linux x64

```bash
# Download
curl -L -o cursor-proxy-linux-x64-0.1.0.vsix https://github.com/fjiangming/cursor-proxy/releases/download/v0.1.0/cursor-proxy-linux-x64-0.1.0.vsix

# Install
cursor --install-extension cursor-proxy-linux-x64-0.1.0.vsix --force
```

#### Windows x64

```powershell
# Download
Invoke-WebRequest -Uri "https://github.com/fjiangming/cursor-proxy/releases/download/v0.1.0/cursor-proxy-win32-x64-0.1.0.vsix" -OutFile "cursor-proxy-win32-x64-0.1.0.vsix"

# Install
cursor --install-extension cursor-proxy-win32-x64-0.1.0.vsix --force
```

Restart Cursor after installation.
The extension auto-starts the proxy server and guides you through first-run setup
(SSL certificates, account sync, network forwarding — all from the Command Palette).


**Uninstall Extension Cleanly:**

> **⚠️ Important:** The proxy bridge process is designed as a **persistent background daemon** — it intentionally survives Cursor restarts so that forwarding stays active between sessions. This means simply closing Cursor will **not** stop the bridge. You must explicitly stop it before uninstalling.

1. **Stop the Bridge daemon**: Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and execute **Cursor Proxy: Stop Server**. This sends a termination signal to the background bridge process and releases all file locks.

   If the Command Palette is unavailable (e.g. Cursor already closed), manually kill the process:

   - **Windows (PowerShell):**
     ```powershell
     Get-Process | Where-Object { $_.ProcessName -like "*cursor-proxy-bridge*" -or $_.ProcessName -like "*agent-vibes-bridge*" } | Stop-Process -Force
     ```
   - **macOS / Linux:**
     ```bash
     pkill -f "cursor-proxy-bridge" ; pkill -f "agent-vibes-bridge"
     ```

2. Go to the Extensions panel in Cursor, search for **Cursor Proxy**, and click **Uninstall**.
3. Delete the generated backend data folder from your user directory (Windows: `Remove-Item -Recurse -Force "$env:USERPROFILE\.cursor-proxy"`, macOS/Linux: `rm -rf ~/.cursor-proxy`). If the folder refuses to delete, a bridge process is still running — go back to Step 1.
4. **Upgrading from old version?** If you previously used the extension under its old name (`agent-vibes`), you may also need to:
   - Uninstall the old extension `funny-vibes.agent-vibes` from the Extensions panel (or run `cursor --uninstall-extension funny-vibes.agent-vibes`).
   - Delete the legacy data directory `~/.agent-vibes` (Windows: `Remove-Item -Recurse -Force "$env:USERPROFILE\.agent-vibes"`, macOS/Linux: `rm -rf ~/.agent-vibes`).

## Backend Configuration Reference

### 1. Antigravity

Use for Antigravity / Google Cloud Code access.
> **⚠️ Important Warning regarding Antigravity Mode (Google Cloud Code native proxy)**
>
> When using the native Antigravity/Google path, this project **actively injects a massive hardcoded system prompt**
> (~35,000 characters) into every request. This is required to emulate the official Antigravity/Cloud Code behavior
> and pass backend validation, but it comes with severe side effects:
>
> - **"Degradation" / Instruction Conflict:** The model is forced to obey strict, heavy-handed preset rules
>   (such as mandatory web-app UI structures, glassmorphism aesthetics, SEO rules, etc.),
>   which often conflict with the simple, direct instructions you send via Cursor.
> - **Context Window Bloat / Amnesia:** Consuming ~10k tokens right off the bat severely limits
>   your effective context window, causing the model to forget earlier parts of the conversation much sooner than usual.
> - **Recommendation:** If you desire pure, unadulterated model intelligence without forced "Cursor Proxy" UI bloat,
>   it is highly recommended to use the **Codex (GPT)** or **Claude API** routing paths instead.
>   The native Antigravity path should only be used if you explicitly want the heavy-handed agentic AI pre-prompts.



Configuration:

*   Open Cursor Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
*   Execute **`Cursor Proxy: Sync Antigravity IDE Credentials`** (or **`Sync Antigravity Tools`**)

Behavior:

- Credentials are synced into `~/.cursor-proxy/data/antigravity-accounts.json`.
- Supports multi-account rotation.
- **Claude model routing:** When Cursor routes through the Google backend,
  only **Opus** models use the proxy path.
  Non-Opus Claude models (Sonnet, Haiku, etc.) are automatically redirected to
  **Gemini 3.1 Pro High**, preserving Claude quota for complex agentic tasks.
- **Quota fallback (opt-in):** When all Google Cloud Code accounts are quota-exhausted
  and the cooldown exceeds the max wait threshold, the system can automatically fall back
  to a configured Gemini model instead of returning a 429 error.
  Configure by adding `"quotaFallbackModel"` to the top level of `antigravity-accounts.json`:

```json
{
  "quotaFallbackModel": "gemini-3.1-pro-high",
  "accounts": [...]
}
```

Set `"quotaFallbackModel"` to the desired fallback model ID, or remove the field entirely to disable (default: disabled — returns 429 as before).

### 2. GPT
Use for GPT models.

Configuration:

- Codex:

*   Login via `codex --login` in your terminal.
*   Open Cursor Command Palette and execute **`Cursor Proxy: Sync Codex Credentials`**.

- OpenAI-compatible file: `~/.cursor-proxy/data/openai-compat-accounts.json`

```json
{
  "accounts": [
    {
      "label": "provider-1",
      "baseUrl": "https://a.example.com/v1",
      "apiKey": "sk-xxx"
    },
    {
      "label": "provider-2",
      "baseUrl": "https://b.example.com/v1",
      "apiKey": "sk-yyy",
      "proxyUrl": "http://127.0.0.1:7897",
      "preferResponsesApi": true,
      "responsesApiModels": ["o3", "o4-mini"]
    }
  ]
}
```

Behavior:

- Codex and OpenAI-compatible both support multi-account rotation.
- If both OpenAI-compatible and Codex are configured, GPT requests go to OpenAI-compatible first.
- When quota is exhausted, the system automatically switches to the next available account.
- `proxyUrl` routes requests through the specified HTTP/SOCKS proxy for that account.
- `preferResponsesApi=true` uses the OpenAI Responses API (`/v1/responses`) instead of Chat Completions for all models on this account.
- `responsesApiModels` (optional): an array of model name patterns (or comma-separated string) that should always use the Responses API, even when `preferResponsesApi` is not set. Useful for routing only specific reasoning models (e.g. `o3`, `o4-mini`) through the Responses endpoint while keeping others on Chat Completions.

### 3. Claude API
Use for third-party Claude-compatible APIs.

Configuration:

*   Open Cursor Command Palette and execute **`Cursor Proxy: Sync Claude Credentials`**. This reads `~/.claude/settings.json` and writes or updates a managed `claude-code-sync` entry in `~/.cursor-proxy/data/claude-api-accounts.json`.
  The managed entry mirrors the current source settings; if the source no longer declares explicit model IDs, stale managed `models` are removed so dynamic discovery can take effect.
- Or edit `~/.cursor-proxy/data/claude-api-accounts.json` manually:

```json
{
  "forceModelPrefix": false,
  "accounts": [
    {
      "label": "anthropic-official",
      "apiKey": "sk-ant-xxx",
      "baseUrl": "https://api.anthropic.com"
    },
    {
      "label": "third-party",
      "apiKey": "sk-third-yyy",
      "baseUrl": "https://claude.example.com",
      "stripThinking": true,
      "proxyUrl": "socks5://127.0.0.1:1080",
      "prefix": "team-a",
      "priority": 10,
      "headers": {
        "X-Custom-Header": "value"
      },
      "excludedModels": ["claude-3-*"],
      "models": [
        {
          "name": "claude-opus-4-6",
          "alias": "claude-4.6-opus-thinking"
        }
      ]
    }
  ]
}
```

Behavior:

- Unprefixed Claude models prefer the Claude API backend when a matching account exists, and fall back to Antigravity/Google Cloud Code.
- `forceModelPrefix=false` means a prefixed account exposes both `claude-sonnet-latest` and `team-a/claude-sonnet-latest`.
- `forceModelPrefix=true` requires explicit prefixed requests for prefixed accounts.
- Prefixed models such as `team-a/claude-sonnet-latest` only route to the matching Claude API account prefix.
- If `models` is omitted, the proxy first tries to discover models from upstream via `GET /v1/models`;
  if discovery is unavailable, it falls back to the built-in defaults and still allows Claude-family passthrough.
- If `models` is configured, the explicit mappings take precedence and automatic discovery is skipped for that account.
- `stripThinking=true` removes Anthropic thinking fields before forwarding for providers that only support the base Claude model name.
- `excludedModels` supports case-insensitive wildcard patterns such as `claude-3-*`, `*-thinking`, or `*haiku*`.
- Official `api.anthropic.com` accounts use `x-api-key`; third-party endpoints use `Authorization: Bearer ...`.

## Project Structure

```text
agent-vibes/
├── bin/
│   └── agent-vibes                            # CLI entry point
├── apps/
│   └── protocol-bridge/                         # Main proxy server (NestJS + Fastify)
│       ├── src/
│       │   ├── main.ts                        # App bootstrap (Fastify adapter, CORS, Swagger)
│       │   ├── app.module.ts                  # NestJS root module
│       │   ├── health.controller.ts           # Health check + pool status
│       │   │
│       │   ├── protocol/                      # ← Protocol adapters
│       │   │   ├── cursor/                    #   CursorModule — Cursor IDE (ConnectRPC)
│       │   │   │   ├── cursor.module.ts
│       │   │   │   ├── cursor-adapter.controller.ts
│       │   │   │   ├── cursor-connect-stream.service.ts
│       │   │   │   ├── cursor-grpc.service.ts
│       │   │   │   └── ...                    #   (auth, parser, session, etc.)
│       │   │   └── anthropic/                 #   AnthropicModule — Claude Code CLI
│       │   │       ├── anthropic.module.ts
│       │   │       ├── messages.controller.ts  #   POST /v1/messages
│       │   │       ├── messages.service.ts
│       │   │       └── dto/                   #   Request DTOs
│       │   │
│       │   ├── context/                       # ← Conversation context
│       │   │   ├── history.module.ts          #   HistoryModule
│       │   │   ├── tokenizer.module.ts        #   TokenizerModule
│       │   │   ├── conversation-truncator.service.ts
│       │   │   ├── tokenizer.service.ts
│       │   │   └── ...                        #   (summary, token counting, tool integrity)
│       │   │
│       │   ├── llm/                           # ← LLM layer (Routing + Providers)
│       │   │   ├── model.module.ts            #   ModelModule
│       │   │   ├── model-registry.ts          #   Model alias → backend ID mapping
│       │   │   ├── model-router.service.ts    #   Multi-backend dispatcher
│       │   │   ├── claude-api/                #   ClaudeApiModule — Claude-compatible key pool
│       │   │   ├── google/                    #   GoogleModule — Cloud Code API
│       │   │   ├── codex/                     #   CodexModule — OpenAI Codex reverse proxy
│       │   │   ├── native/                    #   NativeModule — Process pool workers
│       │   │   └── websearch/                 #   WebsearchModule — Web search
│       │   │
│       │   ├── shared/                        # Infrastructure (bootstrap, guards, env, types)
│       │   │   ├── content-type-parsers.ts    #   gRPC/ConnectRPC body parsers
│       │   │   ├── request-hooks.ts           #   Request logging hooks
│       │   │   ├── env.validation.ts          #   Environment variable validation
│       │   │   ├── api-key.guard.ts           #   API key authentication guard
│       │   │   └── anthropic.ts, cloud-code.ts #  Shared TypeScript types
│       │   │
│       │   └── gen/                           # Auto-generated protobuf (DO NOT edit)
│       │
│       ├── proto/                             # Protobuf definitions (protocol-compatible, local only)
│       └── data/                              # Per-backend credential pools (JSON)
├── packages/
│   ├── eslint-config/                         # Shared ESLint config
│   ├── prettier-config/                       # Shared Prettier config
│   └── typescript-config/                     # Shared TypeScript base config
└── scripts/
    ├── lib/                                   # Shared cross-platform utilities
    ├── accounts/                              # Account credential sync helpers
    ├── diagnostics/                           # One-click issue report collector
    ├── proxy/                                 # Port forwarding (TCP relay/iptables/netsh)
    └── capture/                               # Traffic capture and dump inspection
```

## API Endpoints
| Path                         | Method | Protocol                     | Description             |
| ---------------------------- | ------ | ---------------------------- | ----------------------- |
| `/v1/messages`               | POST   | Anthropic Messages API (SSE) | Claude Code CLI         |
| `/v1/messages/count_tokens`  | POST   | Anthropic Messages API       | Count request tokens    |
| `/agent.v1.AgentService/Run` | POST   | ConnectRPC (HTTP/2 BiDi)     | Cursor IDE (Agent mode) |
| `/v1/models`                 | GET    | REST JSON                    | Anthropic model list    |
| `/v1/anthropic/models`       | GET    | REST JSON                    | List available models   |
| `/health`                    | GET    | REST JSON                    | Health check            |
| `/docs`                      | GET    | Swagger UI                   | API documentation       |

## Tech Stack
| Component   | Technology                                         |
| ----------- | -------------------------------------------------- |
| Runtime     | Node.js ≥ 24                                       |
| Framework   | NestJS 11 + Fastify (HTTP/2 + HTTP/1.1)            |
| Language    | TypeScript (ES2021, CommonJS)                      |
| Protobuf    | `@bufbuild/protobuf` v2 + `@connectrpc/connect` v2 |
| Monorepo    | Turborepo + npm workspaces                         |
| Linting     | ESLint 9 + Prettier 3 + markdownlint               |
| Git Hooks   | Husky + lint-staged + commitlint                   |
| Testing     | Jest 30 + ts-jest                                  |
| Database    | better-sqlite3 (local KV store)                    |
| Tokenizer   | tiktoken                                           |
| HTTP Client | Native `fetch` + SOCKS/HTTP proxy agents           |
| Platform    | macOS, Linux, Windows                              |

## CI/CD
- **`ci.yml`** (Triggered on pushes to `dev` or `main`)
  - A strict quality gate that runs `lint`, `types`, `build`, and `test` to ensure code health. **This pipeline does NOT generate downloadable release binaries or VSCode extensions.**
- **`release.yml`** (Triggered **ONLY** when a `v*` tag like `v0.2.3` is pushed)
  - The actual build and release factory. It compiles the native proxy binaries across different systems (macOS, Linux, Windows), bundles them into the VSCode extension shell (`.vsix`), and automatically publishes a new GitHub Release page.
- **`deploy-proxy.yml`** — Auto-deploy on push to `main` (only `apps/protocol-bridge/**` changes)
  - Build → SCP to server → restart systemd service
  - Production uses Let's Encrypt SSL for HTTP/2
- **`claude.yml`** — Claude Code automation
  - Issue handling: `claude` label → auto-implement → create PR to `dev`
  - PR review: auto-review → merge after approval
  - Interactive: `@claude` or `@c` in comments

| Branch             | Purpose                          |
| ------------------ | -------------------------------- |
| `dev`              | Development (default PR target)  |
| `main`             | Production (auto-deploy on push) |
| `issue-{N}-{slug}` | Feature branches (created by CI) |

## Community
Join the discussion and share your thoughts about Cursor Proxy on [LINUX DO](https://linux.do/t/topic/1814066), or feel free to report bugs and feedback on [GitHub Issues](https://github.com/fjiangming/cursor-proxy/issues).

## Contributing
Found a bug or have an idea? Use our [issue templates](https://github.com/fjiangming/cursor-proxy/issues/new/choose) to report bugs or request features.

> **Tip:** Run `agent-vibes issues` (or `npm run issues`) to auto-collect diagnostics — the report is copied to your clipboard, ready to paste into the bug report template.

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening PRs.

Pre-commit hooks automatically run lint + format checks.

---

Happy vibing!

## License
[MIT](LICENSE) © 2025-2026 recronin

