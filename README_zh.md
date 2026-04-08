# Cursor Proxy

[English](README.md) | 中文

> **统一 Agent 网关** �?通过 **Claude Code CLI** �?**Cursor IDE** 使用 **Antigravity** �?**Codex** AI 后端�?

[![CI](https://github.com/fjiangming/cursor-proxy/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fjiangming/cursor-proxy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-�?4-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Fastify](https://img.shields.io/badge/Fastify-HTTP%2F2-000000?logo=fastify&logoColor=white)](https://fastify.dev/)

## 概览

Cursor Proxy 是一个代理服务器，通过协议转换�?AI 编程客户端连接到不同�?AI 后端�?

**客户�?*（前端）�?

- **Claude Code CLI** �?Anthropic Messages API
- **Cursor IDE** �?协议兼容的原�?ConnectRPC/gRPC 实现

**后端**（后端）�?

- **Antigravity IDE** �?协议兼容�?Google Cloud Code API
- **Codex CLI** �?面向 GPT �?Codex 模型�?OpenAI 兼容 API
- **Claude 兼容 API** �?通过第三�?key 直连 Anthropic-compatible `/v1/messages`

> **免责声明�?* 本项目仅用于学习与研究目的�?
>
> 使用该代理可能会让你�?Antigravity 账号面临封禁风险，请自行评估并承担相关风险�?

## 架构

```text
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
�?                         Clients                            �?
�?                                                            �?
�? Claude Code CLI                Cursor IDE                  �?
�? POST /v1/messages              POST /agent.v1.*            �?
�? (Anthropic SSE)                (ConnectRPC/gRPC)           �?
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
                              �?
                              �?
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
�?                 Cursor Proxy Proxy Server                   �?
�?                                                            �?
�? Gemini           �?Antigravity IDE (Cloud Code)            �?
�? Claude           �?Claude API / Antigravity                �?
�? GPT              �?Codex CLI / OpenAI-compatible API       �?
�?                                                            �?
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
```

## 功能特�?

- `Claude Code CLI`: 协议 `Anthropic Messages API (SSE)`，后�?`Antigravity IDE / Claude 兼容 API / Codex CLI`，模�?`Gemini / Claude / GPT`
- `Cursor IDE`: 协议 `ConnectRPC/gRPC（协议兼容）`，后�?`Antigravity IDE / Claude 兼容 API / Codex CLI`，模�?`Gemini / Claude / GPT`

## �?[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) 的差�?

[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) 是这个项目最接近的参考项目，但两者重心不同�?
[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) 更偏 API-first �?CLI 场景；Cursor Proxy 则把主要精力放在 Cursor 的原生客户端兼容性，以及 Antigravity 的原生上游保真度上�?

- **Cursor�?* Cursor Proxy 并不止步�?OpenAI / Claude 兼容接口，而是直接实现�?Cursor 原生 ConnectRPC/gRPC Agent 通道，以协议兼容�?protobuf 定义实现了互操作性，并直接实现流式工具循环�?
- **Antigravity�?* 本仓库当前的主路径是较新�?worker-native 方案，围绕运�?Antigravity 自身运行时与模块来构建，�?Cloud Code 请求保持协议兼容，并在此基础上实现配额感知的 worker 轮转�?
- **致谢�?* 本项目借鉴和移植了大量开源项目的代码与思路，其�?Claude Code CLI �?Codex CLI 主要参�?
  [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)，在 TypeScript/NestJS 架构下重写。Cursor 原生协议层和 Antigravity worker 池为原创实现�?

## 快速开�?

### 一键部署启动（推荐�?

这是最简单的使用方式，无需手动拉取代码或配置环境。脚本会自动拉取最�?`dev` 分支代码�?`~/.cursor-proxy` 隐藏目录，并安装依赖启动服务�?

**🖥�?Windows (PowerShell):**

```powershell
# 默认安装�?C:\Users\<用户�?\.cursor-proxy
Invoke-RestMethod -Uri "https://raw.githubusercontent.com/fjiangming/cursor-proxy/dev/quick-start.ps1" | Invoke-Expression

# 自定义安装路径（例如安装�?D:\agent-vibes�?
$env:AGENT_VIBES_DIR="D:\agent-vibes"; Invoke-RestMethod -Uri "https://raw.githubusercontent.com/fjiangming/cursor-proxy/dev/quick-start.ps1" | Invoke-Expression
```

**🍎 macOS / 🐧 Linux:**

```bash
# 默认安装�?~/.cursor-proxy
curl -sSL https://raw.githubusercontent.com/fjiangming/cursor-proxy/dev/quick-start.sh | bash

# 自定义安装路径（例如安装�?/opt/agent-vibes�?
curl -sSL https://raw.githubusercontent.com/fjiangming/cursor-proxy/dev/quick-start.sh | bash -s -- /opt/agent-vibes
```

- **停止服务**：在运行服务的终端中按下 `Ctrl + C` 即可�?
- **如何更新**：无论是一键安装还是自定义路径安装，你只需�?*重新执行一次你安装时运行的命令**即可�?
  脚本会自动检测已存在的目录，使用 `git fetch` �?`git reset --hard origin/dev` 拉取最新代码并强制重新编译安装依赖�?
- **干净卸载**：只需删除用户主目录下�?`.cursor-proxy` 文件夹（Windows 可执�?`Remove-Item -Recurse -Force "$env:USERPROFILE\.cursor-proxy"`，macOS/Linux 执行 `rm -rf ~/.cursor-proxy`），没有任何注册表或全局系统污染�?

### 手动源码安装（进阶）

**源码安装（全平台）：**

> **提示�?* 如果你只需�?Cursor IDE 支持，可以跳过源码安装，直接使用[扩展安装](#配合-cursor-ide-使用)，无需编译�?
>
> **说明�?* 当前主要�?macOS 上开发与测试�?
> Linux �?Windows 虽然都已实现支持，但尚未完整验证，脚本在这些平台上仍可能存在边界问题。欢�?PR�?

```bash
git clone https://github.com/fjiangming/cursor-proxy.git
cd agent-vibes
npm install && npm run build
npm link                          # �?`agent-vibes` 注册为全局命令
```

生成 SSL 证书�?

```bash
# 先安�?mkcert: https://github.com/FiloSottile/mkcert#installation
mkcert -install
agent-vibes cert
```

上面这一步完成安装�?

**干净卸载�?*

```bash
npm rm -g agent-vibes             # 移除全局命令
rm -rf ~/.cursor-proxy             # 清除用户数据（Windows 用户请执行：Remove-Item -Recurse -Force "$env:USERPROFILE\.cursor-proxy"�?
```

下面开始选择你的上游来源�?

### 选择一个上游来�?

Antigravity（[Antigravity IDE](https://antigravity.google) �?[Antigravity Manager](https://github.com/lbjlaq/Antigravity-Manager)）：

```bash
agent-vibes sync --ide       # �?Antigravity IDE 同步
agent-vibes sync --tools     # �?Antigravity Manager 同步
```

Claude Code 第三方配置：

```bash
agent-vibes sync --claude
```

Codex�?

```bash
codex --login
agent-vibes sync --codex
```

### 日常使用

#### 配合 Claude Code CLI 使用

```bash
agent-vibes                  # 启动代理
```

在另一个终端中�?

```bash
export ANTHROPIC_BASE_URL=https://localhost:8000
claude
```

> **提示�?* 可以�?`export ANTHROPIC_BASE_URL=https://localhost:8000` 写入你的 shell profile，以便长期生效�?

#### 配合 Cursor IDE 使用

Cursor 客户端侧使用 free 账号即可，不需要开�?Cursor 付费订阅�?

**方式 A：扩展安装（推荐�?*

> **💡 关于二次开发与自定义功能的特别说明�?*
>
> 如果你在本地对核心代码（例如 `apps/protocol-bridge` 等）进行了任何修改，**请绝对不�?*下载官方 Releases 页面提供的现�?VSCode 插件�?(`.vsix`)。官方预编译�?`.vsix` 内置了未经你修改的上游后端文件，直接安装会导致你的所有本地自定义逻辑及修复被覆盖�?
> 
> **如需打包含有你的自定义功能的插件，请按以下步骤由源码自行打包构建�?*
> 1. 确保已安�?Node.js �?`npm` 环境�?
> 2. 在项目根目录执行：`npm install`
> 3. 进入插件目录：`cd apps/vscode-extension`
> 4. 执行一键构建与打包命令：`npm run package`
> 5. 构建完成后，该目录下会生成包含你最新改动的 `agent-vibes-xxx.vsix`�?
> 6. 你可以使�?`cursor --install-extension <你的vsix文件�?.vsix --force` 或者直接运�?`npm run pack`（自动完成打包、安装及重启代理进程）将其安装到 Cursor 内部�?
>
> *提示：如果需要快速打包调试扩展，并且核心进程未变动，也可使用 `npm run package:fast` �?`npm run pack:fast`�?

若未经定制修改，你可以直接从 [GitHub Releases](https://github.com/fjiangming/cursor-proxy/releases) 一键下载并安装�?

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

安装后重�?Cursor，扩展会自动启动代理服务器并引导你完成首次配置（SSL 证书、账号同步、网络转发等均可在命令面板中操作）�?

**方式 B：CLI**

Cursor 需�?HTTPS 拦截，以下为一次性设置：

```bash
# 1. �?hosts 中添�?DNS 重定�?
agent-vibes forward hosts

# 2. 开启端口转发（macOS 使用 TCP relay，Linux 使用 iptables，Windows 使用 netsh�?
agent-vibes forward on
```

然后启动代理�?

```bash
agent-vibes
```

验证是否正常工作�?

```bash
agent-vibes forward status
```

## 后端配置参�?

### 1. Antigravity

用于接入 Antigravity / Google Cloud Code�?

> **⚠️ 关于 Antigravity 模式（Google Cloud Code 原生反代）的重要警告**
>
> 当使用原生的 Antigravity/Google 请求路径时，本项目会向模型的每一次请求中**强制注入一段极大的硬编码系统提示词**（约 35,000 字符）。这是为了模拟官�?Antigravity/Cloud Code 客户端的行为并满足其后端校验，但由此会带来一些严重的副作用：
>
> - **“降智”与指令冲突�?* 模型被强迫遵守这套严苛且预先设定好的 Agent 规则（例如强制要求所�?Web 应用具备特定 UI 结构、玻璃拟物化风格、必须加 SEO 规则等），这经常会与你通过 Cursor 给出的明确直接的任务指令发生冲突或表现为“画蛇添足”�?
> - **上下文挤占与失忆�?* 请求一建立就先消耗了�?1 �?tokens 的容量，这严重限制了有效上下文窗口的长度，导致模型比常规情况更早开始遗忘前面的对话记录�?
> - **建议�?* 如果你追求原汁原味的模型推理能力，反感这些主观强加的系统�?UI 预设行为，强烈建议切换配置，转而走 **Codex (GPT)** 路径或�?**Claude API** 转发路径。仅在明确期望体验它那套重度预设�?Agent 风格表现时，再使用原�?Antigravity 路线�?

配置方式�?

```bash
agent-vibes sync --ide
agent-vibes sync --tools
```

行为�?

- 凭据会同步到 `~/.cursor-proxy/data/antigravity-accounts.json`�?
- 支持多账号轮转�?
- **Claude 模型路由�?* �?Claude Code CLI 通过 Google 后端路由时，
  只有 **Opus** 模型�?Claude-through-Google（Cloud Code）路径�?
  �?Opus �?Claude 模型（Sonnet、Haiku 等）会自动重定向�?
  **Gemini 3.1 Pro High**，从而节�?Claude 配额用于复杂�?agentic 任务�?
- **配额降级（可选）�?* 当所�?Google Cloud Code 账号配额耗尽�?
  且冷却时间超过最大等待阈值时，系统可以自动降级到配置�?
  Gemini 模型，而非返回 429 错误�?
  �?`antigravity-accounts.json` 顶层添加 `"quotaFallbackModel"` 即可开启：

```json
{
  "quotaFallbackModel": "gemini-3.1-pro-high",
  "accounts": [...]
}
```

�?`"quotaFallbackModel"` 设为目标降级模型 ID�?
或删除该字段以禁用（默认：禁用，行为与之前一致，返回 429）�?

### 2. GPT

用于接入 GPT 模型�?

配置方式�?

- Codex�?

```bash
codex --login
agent-vibes sync --codex
```

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
      "proxyUrl": "http://127.0.0.1:7897"
    },
    {
      "label": "claude-provider",
      "baseUrl": "https://c.example.com/v1",
      "apiKey": "sk-zzz",
      "preferResponsesApi": true,
      "responsesApiModels": ["claude"]
    }
  ]
}
```

行为�?

- Codex �?OpenAI 兼容后端都支持多账号轮转�?
- 同时配置 OpenAI 兼容后端�?Codex 后端时，针对具体模型如果�?OpenAI 端点支持，则优先�?OpenAI 兼容后端；否则回退�?Codex（如 OpenAI 端点没配置对应的 gpt 账号时）�?
- 额度耗尽时自动切换到下一个可用账号�?
- `proxyUrl` 可为该账号指�?HTTP/SOCKS 代理地址�?
- `preferResponsesApi=true` 时使�?OpenAI Responses API（`/v1/responses`）代�?Chat Completions�?
- `responsesApiModels` 列表有两个作用（支持字符串数组，或逗号分隔的字符串）：
  1. **模型白名�?*：显式声明该账号支持哪些模型（前缀匹配）。未配置此项时，账号默认只支持原�?OpenAI 模型（如 `gpt`, `o1`, `o3` 等）。如果配置了此项（例�?`["claude", "gemini"]`），则该账号**只会**支持指定列表中的模型。这允许�?OpenAI-compat 类型中接入各类只支持特定模型的第三方 API 转发层，使得底层路由能够精准分辨。当没有 OpenAI-compat 账号支持所请求的模型（�?`gpt`）时，框架能正确回退到其他后端（�?`codex`）�?
  2. **Responses API 路由**：当开启了 `preferResponsesApi: true` 时，只有在此列表中匹配的模型，才会改为通过 `/v1/responses` 访问；即便没开启，也能充当纯白名单路由作用�?

### 3. Claude API

用于接入第三�?Claude 兼容 API�?

配置方式�?

- `agent-vibes sync --claude` 会读�?`~/.claude/settings.json`，并�?`~/.cursor-proxy/data/claude-api-accounts.json` 中写入或更新一个受管理�?`claude-code-sync` 条目�?
  这个受管理条目会以当前源设置为准；如果源设置里已经没有显式模�?ID，旧的受�?`models` 也会被清掉，以便动态发现生效�?
- 或手动编�?`~/.cursor-proxy/data/claude-api-accounts.json`�?

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
    },
    {
      "label": "cpa-proxy",
      "apiKey": "sk-cpa-zzz",
      "baseUrl": "https://cpa.example.com",
      "sanitizeForProxy": true
    }
  ]
}
```

行为�?

- 未加前缀�?Claude 模型，如果存在匹配账号，会优先走 Claude API 后端，失败后再回退�?Antigravity / Google Cloud Code�?
- `forceModelPrefix=false` 时，带前缀账号会同时暴�?`claude-sonnet-latest` �?`team-a/claude-sonnet-latest`�?
- `forceModelPrefix=true` 时，带前缀账号必须显式用前缀模型名访问�?
- 带前缀的模型，例如 `team-a/claude-sonnet-latest`，只会命中对�?`prefix` �?Claude API 账号�?
- 如果没有配置 `models`，代理会优先尝试从上�?`GET /v1/models` 动态发现可用模型；发现失败时，仍会保留内置默认列表并继续支�?Claude-family 模型名原样透传�?
- 如果配置�?`models`，则以手动映射为准，不再自动发现该账号的模型列表�?
- `stripThinking=true` 时，会在转发前移�?Anthropic thinking 相关字段，适合只支持基础 Claude 模型名的第三方端点�?
- `sanitizeForProxy=true` 开启面向代理后端（�?CLIProxyAPI �?Vertex AI / Antigravity）的请求体预清洗�?
  启用后，所有工具的 `input_schema` 定义会在转发前被清理�?
  - 剥离 `$schema`、`additionalProperties`、`$ref`/`$defs`、`default`、`format` �?Gemini/Vertex AI 不支持的 JSON Schema 关键字�?
  - 使用严格白名单（`type`、`description`、`properties`、`required`、`items`、`enum`、`title`）�?
  - 内联展开 `$ref`/`$defs`，解�?`anyOf`/`oneOf`/`allOf` 联合类型，规范化类型数组（`["string","null"]` �?`"string"` 并标�?`(nullable)`）�?
  - 为空 object 补充占位 property，对�?`required` 与实�?`properties`�?
  - 不支持的约束（如 `minLength`、`pattern`）迁移到 description 文本中�?
  - 过滤�?`web_search` 类型的工具（由代理原生处理）�?
    此功能可解决来自 Vertex AI/Gemini 后端�?`400 INVALID_ARGUMENT` 错误�?
    仅对�?Claude→Gemini 代理转换的账号启用；直连 Anthropic 的账号保持关闭即可（默认：`false`）�?
- `excludedModels` 支持大小写不敏感的通配符写法，例如 `claude-3-*`、`*-thinking`、`*haiku*`�?
- 官方 `api.anthropic.com` 使用 `x-api-key`；第三方兼容端点使用 `Authorization: Bearer ...`�?

## 项目结构

```text
agent-vibes/
├── bin/
�?  └── agent-vibes                            # CLI 入口
├── apps/
�?  └── protocol-bridge/                       # 主代理服务（NestJS + Fastify�?
�?      ├── src/
�?      �?  ├── main.ts                        # 应用启动（Fastify 适配器、CORS、Swagger�?
�?      �?  ├── app.module.ts                  # NestJS 根模�?
�?      �?  ├── health.controller.ts           # 健康检�?+ 进程池状�?
�?      �?  �?
�?      �?  ├── protocol/                      # �?协议适配�?
�?      �?  �?  ├── cursor/                    #   CursorModule �?Cursor IDE (ConnectRPC)
�?      �?  �?  �?  ├── cursor.module.ts
�?      �?  �?  �?  ├── cursor-adapter.controller.ts
�?      �?  �?  �?  ├── cursor-connect-stream.service.ts
�?      �?  �?  �?  ├── cursor-grpc.service.ts
�?      �?  �?  �?  └── ...                    #   （认证、解析、会话等�?
�?      �?  �?  └── anthropic/                 #   AnthropicModule �?Claude Code CLI
�?      �?  �?      ├── anthropic.module.ts
�?      �?  �?      ├── messages.controller.ts #   POST /v1/messages
�?      �?  �?      ├── messages.service.ts
�?      �?  �?      └── dto/                   #   请求 DTO
�?      �?  �?
�?      �?  ├── context/                       # �?会话上下�?
�?      �?  �?  ├── history.module.ts          #   HistoryModule
�?      �?  �?  ├── tokenizer.module.ts        #   TokenizerModule
�?      �?  �?  ├── conversation-truncator.service.ts
�?      �?  �?  ├── tokenizer.service.ts
�?      �?  �?  └── ...                        #   （摘要、计数、工具一致性等�?
�?      �?  �?
�?      �?  ├── llm/                           # �?LLM 层（路由 + Provider�?
�?      �?  �?  ├── model.module.ts            #   ModelModule
�?      �?  �?  ├── model-registry.ts          #   模型别名 �?后端 ID 映射
�?      �?  �?  ├── model-router.service.ts    #   多后端分�?
�?      �?  �?  ├── claude-api/                #   ClaudeApiModule �?Claude 兼容 key �?
�?      �?  �?  ├── google/                    #   GoogleModule �?Cloud Code API
�?      �?  �?  ├── codex/                     #   CodexModule �?OpenAI Codex 反向代理
�?      �?  �?  ├── native/                    #   NativeModule �?进程�?workers
�?      �?  �?  └── websearch/                 #   WebsearchModule �?网络搜索
�?      �?  �?
�?      �?  ├── shared/                        # 基础设施（启动、守卫、环境、类型）
�?      �?  �?  ├── content-type-parsers.ts    #   gRPC/ConnectRPC 请求体解�?
�?      �?  �?  ├── request-hooks.ts           #   请求日志钩子
�?      �?  �?  ├── env.validation.ts          #   环境变量校验
�?      �?  �?  ├── api-key.guard.ts           #   API Key 鉴权守卫
�?      �?  �?  └── anthropic.ts, cloud-code.ts #  共享 TypeScript 类型
�?      �?  �?
�?      �?  └── gen/                           # 自动生成�?protobuf（不要手改）
�?      �?
�?      ├── proto/                             # Protobuf 定义（协议兼容，仅本地）
�?      └── data/                              # 各后端凭据池（JSON�?
├── packages/
�?  ├── eslint-config/                         # 共享 ESLint 配置
�?  ├── prettier-config/                       # 共享 Prettier 配置
�?  └── typescript-config/                     # 共享 TypeScript 基础配置
└── scripts/
    ├── lib/                                   # 跨平台共享工�?
    ├── accounts/                              # 账号同步脚本
    ├── cursor/                                # Cursor 补丁 / 调试脚本
    ├── diagnostics/                           # 一键问题收�?
    ├── proxy/                                 # 端口转发（TCP relay / iptables / netsh�?
    └── capture/                               # 抓包与流量分�?
```

## API 端点

| 路径                         | 方法 | 协议                         | 说明                     |
| ---------------------------- | ---- | ---------------------------- | ------------------------ |
| `/v1/messages`               | POST | Anthropic Messages API (SSE) | Claude Code CLI          |
| `/v1/messages/count_tokens`  | POST | Anthropic Messages API       | 请求 token 计数          |
| `/agent.v1.AgentService/Run` | POST | ConnectRPC (HTTP/2 BiDi)     | Cursor IDE（Agent 模式�?|
| `/v1/models`                 | GET  | REST JSON                    | Anthropic 模型列表       |
| `/v1/anthropic/models`       | GET  | REST JSON                    | 可用模型列表             |
| `/health`                    | GET  | REST JSON                    | 健康检�?                |
| `/docs`                      | GET  | Swagger UI                   | API 文档                 |

## 技术栈

| 组件        | 技�?                                              |
| ----------- | -------------------------------------------------- |
| Runtime     | Node.js �?24                                       |
| Framework   | NestJS 11 + Fastify (HTTP/2 + HTTP/1.1)            |
| Language    | TypeScript (ES2021, CommonJS)                      |
| Protobuf    | `@bufbuild/protobuf` v2 + `@connectrpc/connect` v2 |
| Monorepo    | Turborepo + npm workspaces                         |
| Linting     | ESLint 9 + Prettier 3 + markdownlint               |
| Git Hooks   | Husky + lint-staged + commitlint                   |
| Testing     | Jest 30 + ts-jest                                  |
| Database    | better-sqlite3（本�?KV 存储�?                    |
| Tokenizer   | tiktoken                                           |
| HTTP Client | 原生 `fetch` + SOCKS/HTTP 代理 agent               |
| Platform    | macOS, Linux, Windows                              |

## CI/CD

- **`ci.yml`**（当代码推送至 `dev` 或 `main` 时触发）
  - 这是一个纯粹的代码健康与质量门禁。它负责运行 `lint`、`types`、`build` 和 `test` 确保没有语法或类型错误。**该流水线绝不会发布任何插件安装包。**
- **`release.yml`**（**仅**在推送例如 `v0.2.3` 等 `v` 开头的 Tag 时严格触发）
  - 这是真正的打包发行车间！它会在全平台（Windows、macOS、Linux）同时进行底层核心的静态编译构建，并将最终的二进制文件封装进 VSCode 插件外壳（`.vsix`），最后在 GitHub Releases 页面自动发布。
- **`deploy-proxy.yml`** 自动部署（仅当 `apps/protocol-bridge/**` 变更推送到 `main` 时触发）
  - Build �?SCP 上传到服务器 �?重启 systemd 服务
  - 生产环境使用 Let's Encrypt SSL 以支�?HTTP/2
- **`claude.yml`** �?Claude Code 自动�?
  - Issue 处理：打�?`claude` 标签 �?自动实现 �?�?`dev` 创建 PR
  - PR 审查：自�?review �?审批后合�?
  - 交互触发：评论中使用 `@claude` �?`@c`

### 分支策略

| 分支               | 用�?                       |
| ------------------ | --------------------------- |
| `dev`              | 开发分支（默认 PR 目标�?   |
| `main`             | 生产分支（push 后自动部署） |
| `issue-{N}-{slug}` | 功能分支（由 CI 创建�?     |

## 交流讨论

欢迎�?[LINUX DO](https://linux.do/t/topic/1814066) 参与关于 Cursor Proxy 的讨论与交流，或者随时在 [GitHub Issues](https://github.com/fjiangming/cursor-proxy/issues) 反馈问题�?

## 贡献

如果你发现了 bug，或者有新的想法，欢迎使用我们的 [issue templates](https://github.com/fjiangming/cursor-proxy/issues/new/choose) 提交 bug 或功能请求�?

> **提示�?* 可以运行 `agent-vibes issues`（或 `npm run issues`）自动收集诊断信息，结果会复制到剪贴板中，方便你直接粘贴�?bug 模板里�?

提交 PR 前，请先阅读 [`CONTRIBUTING.md`](CONTRIBUTING.md)�?

pre-commit hooks 会自动执�?lint �?format 检查�?

---

祝你 Vibe Coding 顺利�?

## License

[MIT](LICENSE) © 2025-2026 recronin
