# Cursor Proxy

[English](README.md) | 中文

> **统一 Agent 网关** — 通过 **Claude Code CLI** 和 **Cursor IDE** 使用 **Antigravity** 与 **Codex** AI 后端。

[![CI](https://github.com/fjiangming/agent-vibes/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/fjiangming/agent-vibes/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-≥24-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Fastify](https://img.shields.io/badge/Fastify-HTTP%2F2-000000?logo=fastify&logoColor=white)](https://fastify.dev/)

## 概览
Cursor Proxy 是一个代理服务器，通过协议转换将 AI 编程客户端连接到不同的 AI 后端。

**客户端**（前端）：

- **Claude Code CLI** — Anthropic Messages API
- **Cursor IDE** — 协议兼容的原生 ConnectRPC/gRPC 实现

**后端**（后端）：

- **Antigravity IDE** — 协议兼容的 Google Cloud Code API
- **Codex CLI** — 面向 GPT 与 Codex 模型的 OpenAI 兼容 API
- **Claude 兼容 API** — 通过第三方 key 直连 Anthropic-compatible `/v1/messages`

> **免责声明：** 本项目仅用于学习与研究目的。
>
> 使用该代理可能会让你的 Antigravity 账号面临封禁风险，请自行评估并承担相关风险。

## 架构
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
│  Claude           → Claude API / Antigravity                │
│  GPT              → Codex CLI / OpenAI-compatible API       │
│                                                             │
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
```

## 功能特性
- `Claude Code CLI`: 协议 `Anthropic Messages API (SSE)`，后端 `Antigravity IDE / Claude 兼容 API / Codex CLI`，模型 `Gemini / Claude / GPT`
- `Cursor IDE`: 协议 `ConnectRPC/gRPC（协议兼容）`，后端 `Antigravity IDE / Claude 兼容 API / Codex CLI`，模型 `Gemini / Claude / GPT`

## 与 [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) 的差异
[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) 是这个项目最接近的参考项目，但两者重心不同。
[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) 更偏 API-first 和 CLI 场景；Cursor Proxy 则把主要精力放在 Cursor 的原生客户端兼容性，以及 Antigravity 的原生上游保真度上。

- **Cursor：** Cursor Proxy 并不止步于 OpenAI / Claude 兼容接口，而是直接实现了 Cursor 原生 ConnectRPC/gRPC Agent 通道，以协议兼容的 protobuf 定义实现了互操作性，并直接实现流式工具循环。
- **Antigravity：** 本仓库当前的主路径是较新的 worker-native 方案，围绕运行 Antigravity 自身运行时与模块来构建，使 Cloud Code 请求保持协议兼容，并在此基础上实现配额感知的 worker 轮转。
- **致谢：** 本项目借鉴和移植了大量开源项目的代码与思路，其中 Claude Code CLI 和 Codex CLI 主要参考
  [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)，在 TypeScript/NestJS 架构下重写。Cursor 原生协议层和 Antigravity worker 池为原创实现。


## 安装

使用免费版 Cursor 账号即可体验所有的 AI 代理特性，不需要开通 Cursor 付费订阅。
本项目现已完全转换为 Cursor 内部扩展（Extension），所有代理服务均由插件自动接管。

> **💡 关于二次开发与自定义功能的特别说明：**
>
> 如果你在本地对核心代码（例如 `apps/protocol-bridge` 等）进行了任何修改，**请绝对不要**下载官方 Releases 页面提供的现成 VSCode 插件包 (`.vsix`)。官方预编译的 `.vsix` 内置了未经你修改的上游后端文件，直接安装会导致你的所有本地自定义逻辑及修复被覆盖。
> 
> **如需打包含有你的自定义功能的插件，请按以下步骤由源码自行打包构建：**
> 1. 确保已安装 Node.js 和 `npm` 环境。
> 2. 在项目根目录执行：`npm install`
> 3. 进入插件目录：`cd apps/vscode-extension`
> 4. 执行一键构建与打包命令：`npm run package`
> 5. 构建完成后，该目录下会生成包含你最新改动的 `.vsix`。
> 6. 你可以使用 `cursor --install-extension <你的vsix文件名>.vsix --force` 或者直接运行 `npm run pack`（自动完成打包、安装及重启代理进程）将其安装到 Cursor 内部。
>
> *提示：如果需要快速打包调试扩展，并且核心进程未变动，也可使用 `npm run package:fast` 或 `npm run pack:fast`。*

若未经定制修改，你可以直接从 [GitHub Releases](https://github.com/fjiangming/cursor-proxy/releases) 一键下载并安装：

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

安装后重启 Cursor，扩展会自动启动代理服务器并引导你完成首次配置（SSL 证书、账号同步、网络转发等均可在命令面板中操作）。


**干净卸载插件：**

> **⚠️ 重要提示：** 代理桥接进程（bridge）被设计为**持久化后台守护进程**——它会在 Cursor 重启后继续运行，以保持网络转发在会话间持续生效。这意味着单纯关闭 Cursor **不会**停止 bridge 进程。卸载前必须先手动停止它。

1. **停止 Bridge 守护进程**：打开命令面板（`Ctrl+Shift+P` / `Cmd+Shift+P`），执行 **Cursor Proxy: Stop Server**。该命令会向后台 bridge 进程发送终止信号并释放所有文件锁。

   如果命令面板不可用（例如 Cursor 已经关闭），请手动终止进程：

   - **Windows (PowerShell)：**
     ```powershell
     Get-Process | Where-Object { $_.ProcessName -like "*cursor-proxy-bridge*" -or $_.ProcessName -like "*agent-vibes-bridge*" } | Stop-Process -Force
     ```
   - **macOS / Linux：**
     ```bash
     pkill -f "cursor-proxy-bridge" ; pkill -f "agent-vibes-bridge"
     ```

2. 在 Cursor 左侧的扩展面板中搜索 **Cursor Proxy**，点击 **卸载 (Uninstall)**。
3. 删除后端数据目录（Windows：`Remove-Item -Recurse -Force "$env:USERPROFILE\.cursor-proxy"`，macOS/Linux：`rm -rf ~/.cursor-proxy`）。如果提示"文件被占用"，说明 bridge 进程仍在运行，请返回第 1 步。程序纯绿色，没有任何注册表残留。
4. **从旧版升级？** 如果你之前使用的是旧名称 `agent-vibes` 版本的插件，还需要额外清理：
   - 卸载旧版扩展 `funny-vibes.agent-vibes`（可在扩展面板搜索卸载，或执行 `cursor --uninstall-extension funny-vibes.agent-vibes`）。
   - 删除旧版数据目录 `~/.agent-vibes`（Windows：`Remove-Item -Recurse -Force "$env:USERPROFILE\.agent-vibes"`，macOS/Linux：`rm -rf ~/.agent-vibes`）。

## 后端配置参考

### 1. Antigravity

用于接入 Antigravity / Google Cloud Code。

配置方式：

*   打开 Cursor 命令面板 (`Cmd+Shift+P` / `Ctrl+Shift+P`)
*   执行 **`Cursor Proxy: Sync Antigravity IDE Credentials`**（或 **`Sync Antigravity Tools`**）

行为：

- 凭据会同步到 `~/.cursor-proxy/data/antigravity-accounts.json`。
- 支持多账号轮转。
- **Claude 模型路由：** 当使用 Google 后端进行请求时，只有 **Opus** 模型走 Cloud Code 原生代理通道。
  非 Opus 的 Claude 模型（Sonnet、Haiku 等）会自动重定向到
  **Gemini 3.1 Pro High**，从而节省 Claude 配额用于复杂的 agentic 任务。
- **配额降级（可选）：** 当所有 Google Cloud Code 账号配额耗尽，
  且冷却时间超过最大等待阈值时，系统可以自动降级到配置的
  Gemini 模型，而非返回 429 错误。
  在 `antigravity-accounts.json` 顶层添加 `"quotaFallbackModel"` 即可开启：

```json
{
  "quotaFallbackModel": "gemini-3.1-pro-high",
  "accounts": [...]
}
```

将 `"quotaFallbackModel"` 设为目标降级模型 ID，
或删除该字段以禁用（默认：禁用，行为与之前一致，返回 429）。

### 2. GPT
用于接入 GPT 模型。

配置方式：

- Codex：

*   在终端执行 `codex --login` 完成登录。
*   打开 Cursor 命令面板执行 **`Cursor Proxy: Sync Codex Credentials`**。

- OpenAI 兼容配置文件：`~/.cursor-proxy/data/openai-compat-accounts.json`

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

行为：

- Codex 和 OpenAI 兼容后端都支持多账号轮转。
- 同时配置 OpenAI 兼容后端和 Codex 后端时，GPT 请求优先走 OpenAI 兼容后端。
- 额度耗尽时自动切换到下一个可用账号。
- `proxyUrl` 可为该账号指定 HTTP/SOCKS 代理地址。
- `preferResponsesApi=true` 时，该账号的所有模型都使用 OpenAI Responses API（`/v1/responses`）代替 Chat Completions。
- `responsesApiModels`（可选）：一个模型名称数组（或逗号分隔的字符串），指定哪些模型应始终使用 Responses API，即使未设置 `preferResponsesApi`。适用于仅将特定推理模型（如 `o3`、`o4-mini`）路由到 Responses 端点，而其他模型仍走 Chat Completions。

### 3. Claude API
用于接入第三方 Claude 兼容 API。

配置方式：

*   打开 Cursor 命令面板执行 **`Cursor Proxy: Sync Claude Credentials`**。这会读取 `~/.claude/settings.json`，并在 `~/.cursor-proxy/data/claude-api-accounts.json` 中写入或更新一个受管理的 `claude-code-sync` 条目。
  这个受管理条目会以当前源设置为准；如果源设置里已经没有显式模型 ID，旧的受管 `models` 也会被清掉，以便动态发现生效。
- 或手动编辑 `~/.cursor-proxy/data/claude-api-accounts.json`：

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

行为：

- 未加前缀的 Claude 模型，如果存在匹配账号，会优先走 Claude API 后端，失败后再回退到 Antigravity / Google Cloud Code。
- `forceModelPrefix=false` 时，带前缀账号会同时暴露 `claude-sonnet-latest` 和 `team-a/claude-sonnet-latest`。
- `forceModelPrefix=true` 时，带前缀账号必须显式用前缀模型名访问。
- 带前缀的模型，例如 `team-a/claude-sonnet-latest`，只会命中对应 `prefix` 的 Claude API 账号。
- 如果没有配置 `models`，代理会优先尝试从上游 `GET /v1/models` 动态发现可用模型；发现失败时，仍会保留内置默认列表并继续支持 Claude-family 模型名原样透传。
- 如果配置了 `models`，则以手动映射为准，不再自动发现该账号的模型列表。
- `stripThinking=true` 时，会在转发前移除 Anthropic thinking 相关字段，适合只支持基础 Claude 模型名的第三方端点。
- `excludedModels` 支持大小写不敏感的通配符写法，例如 `claude-3-*`、`*-thinking`、`*haiku*`。
- 官方 `api.anthropic.com` 使用 `x-api-key`；第三方兼容端点使用 `Authorization: Bearer ...`。

## 项目结构

```text
agent-vibes/
├── bin/
│   └── agent-vibes                            # CLI 入口
├── apps/
│   └── protocol-bridge/                       # 主代理服务（NestJS + Fastify）
│       ├── src/
│       │   ├── main.ts                        # 应用启动（Fastify 适配器、CORS、Swagger）
│       │   ├── app.module.ts                  # NestJS 根模块
│       │   ├── health.controller.ts           # 健康检查 + 进程池状态
│       │   │
│       │   ├── protocol/                      # ← 协议适配层
│       │   │   ├── cursor/                    #   CursorModule — Cursor IDE (ConnectRPC)
│       │   │   │   ├── cursor.module.ts
│       │   │   │   ├── cursor-adapter.controller.ts
│       │   │   │   ├── cursor-connect-stream.service.ts
│       │   │   │   ├── cursor-grpc.service.ts
│       │   │   │   └── ...                    #   （认证、解析、会话等）
│       │   │   └── anthropic/                 #   AnthropicModule — Claude Code CLI
│       │   │       ├── anthropic.module.ts
│       │   │       ├── messages.controller.ts #   POST /v1/messages
│       │   │       ├── messages.service.ts
│       │   │       └── dto/                   #   请求 DTO
│       │   │
│       │   ├── context/                       # ← 会话上下文
│       │   │   ├── history.module.ts          #   HistoryModule
│       │   │   ├── tokenizer.module.ts        #   TokenizerModule
│       │   │   ├── conversation-truncator.service.ts
│       │   │   ├── tokenizer.service.ts
│       │   │   └── ...                        #   （摘要、计数、工具一致性等）
│       │   │
│       │   ├── llm/                           # ← LLM 层（路由 + Provider）
│       │   │   ├── model.module.ts            #   ModelModule
│       │   │   ├── model-registry.ts          #   模型别名 → 后端 ID 映射
│       │   │   ├── model-router.service.ts    #   多后端分发
│       │   │   ├── claude-api/                #   ClaudeApiModule — Claude 兼容 key 池
│       │   │   ├── google/                    #   GoogleModule — Cloud Code API
│       │   │   ├── codex/                     #   CodexModule — OpenAI Codex 反向代理
│       │   │   ├── native/                    #   NativeModule — 进程池 workers
│       │   │   └── websearch/                 #   WebsearchModule — 网络搜索
│       │   │
│       │   ├── shared/                        # 基础设施（启动、守卫、环境、类型）
│       │   │   ├── content-type-parsers.ts    #   gRPC/ConnectRPC 请求体解析
│       │   │   ├── request-hooks.ts           #   请求日志钩子
│       │   │   ├── env.validation.ts          #   环境变量校验
│       │   │   ├── api-key.guard.ts           #   API Key 鉴权守卫
│       │   │   └── anthropic.ts, cloud-code.ts #  共享 TypeScript 类型
│       │   │
│       │   └── gen/                           # 自动生成的 protobuf（不要手改）
│       │
│       ├── proto/                             # Protobuf 定义（协议兼容，仅本地）
│       └── data/                              # 各后端凭据池（JSON）
├── packages/
│   ├── eslint-config/                         # 共享 ESLint 配置
│   ├── prettier-config/                       # 共享 Prettier 配置
│   └── typescript-config/                     # 共享 TypeScript 基础配置
└── scripts/
    ├── lib/                                   # 跨平台共享工具
    ├── accounts/                              # 账号同步脚本
    ├── cursor/                                # Cursor 补丁 / 调试脚本
    ├── diagnostics/                           # 一键问题收集
    ├── proxy/                                 # 端口转发（TCP relay / iptables / netsh）
    └── capture/                               # 抓包与流量分析
```

## API 端点
| 路径                         | 方法 | 协议                         | 说明                     |
| ---------------------------- | ---- | ---------------------------- | ------------------------ |
| `/v1/messages`               | POST | Anthropic Messages API (SSE) | Claude Code CLI          |
| `/v1/messages/count_tokens`  | POST | Anthropic Messages API       | 请求 token 计数          |
| `/agent.v1.AgentService/Run` | POST | ConnectRPC (HTTP/2 BiDi)     | Cursor IDE（Agent 模式） |
| `/v1/models`                 | GET  | REST JSON                    | Anthropic 模型列表       |
| `/v1/anthropic/models`       | GET  | REST JSON                    | 可用模型列表             |
| `/health`                    | GET  | REST JSON                    | 健康检查                 |
| `/docs`                      | GET  | Swagger UI                   | API 文档                 |

## 技术栈
| 组件        | 技术                                               |
| ----------- | -------------------------------------------------- |
| Runtime     | Node.js ≥ 24                                       |
| Framework   | NestJS 11 + Fastify (HTTP/2 + HTTP/1.1)            |
| Language    | TypeScript (ES2021, CommonJS)                      |
| Protobuf    | `@bufbuild/protobuf` v2 + `@connectrpc/connect` v2 |
| Monorepo    | Turborepo + npm workspaces                         |
| Linting     | ESLint 9 + Prettier 3 + markdownlint               |
| Git Hooks   | Husky + lint-staged + commitlint                   |
| Testing     | Jest 30 + ts-jest                                  |
| Database    | better-sqlite3（本地 KV 存储）                     |
| Tokenizer   | tiktoken                                           |
| HTTP Client | 原生 `fetch` + SOCKS/HTTP 代理 agent               |
| Platform    | macOS, Linux, Windows                              |

## CI/CD
- **`ci.yml`**（当代码推送至 `dev` 或 `main` 时触发）
  - 这是一个纯粹的代码健康与质量门禁。它负责运行 `lint`、`types`、`build` 和 `test` 确保没有语法或类型错误。**该流水线绝不会发布任何可供下载的插件安装包。**
- **`release.yml`**（**仅**在推送例如 `v0.2.3` 等 `v` 开头的 Tag 时严格触发）
  - 这是真正的打包发行车间！它会在全平台（Windows、macOS、Linux）同时进行底层核心的静态编译构建，并将最终的二进制文件封装进 VSCode 插件外壳（`.vsix`），最后在 GitHub Releases 页面自动发布。
- **`deploy-proxy.yml`** — push 到 `main` 时自动部署（仅在 `apps/protocol-bridge/**` 变更时触发）
  - Build → SCP 上传到服务器 → 重启 systemd 服务
  - 生产环境使用 Let's Encrypt SSL 以支持 HTTP/2
- **`claude.yml`** — Claude Code 自动化
  - Issue 处理：打上 `claude` 标签 → 自动实现 → 向 `dev` 创建 PR
  - PR 审查：自动 review → 审批后合并
  - 交互触发：评论中使用 `@claude` 或 `@c`

| 分支               | 用途                        |
| ------------------ | --------------------------- |
| `dev`              | 开发分支（默认 PR 目标）    |
| `main`             | 生产分支（push 后自动部署） |
| `issue-{N}-{slug}` | 功能分支（由 CI 创建）      |

## 交流讨论
欢迎在 [LINUX DO](https://linux.do/t/topic/1814066) 参与关于 Cursor Proxy 的讨论与交流，或者随时在 [GitHub Issues](https://github.com/fjiangming/cursor-proxy/issues) 反馈问题。

## 贡献
如果你发现了 bug，或者有新的想法，欢迎使用我们的 [issue templates](https://github.com/fjiangming/cursor-proxy/issues/new/choose) 提交 bug 或功能请求。

> **提示：** 可以运行 `agent-vibes issues`（或 `npm run issues`）自动收集诊断信息，结果会复制到剪贴板中，方便你直接粘贴到 bug 模板里。

提交 PR 前，请先阅读 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

pre-commit hooks 会自动执行 lint 和 format 检查。

---

祝你 Vibe Coding 顺利！

## License
[MIT](LICENSE) © 2025-2026 recronin

