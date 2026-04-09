# Fork 差异文档

> 本文档记录本仓库（`epfff/agent-vibes`，品牌名 **Cursor Proxy**）与上游仓库（`funny-vibes/agent-vibes`，品牌名 **Agent Vibes**）之间的所有功能和代码差异。
>
> **目的**：在后续合并原作者更新时，作为保留本地个性化功能的依据，防止解决冲突时意外丢失自定义逻辑。
>
> **基准版本**：upstream/dev `19b031b` (chore: release v0.1.3 for cursor 3.0.13)
>
> **最后更新**：2026-04-10

---

## 一、品牌重命名（全局性变更）

**所有合并都必须注意**：我们的 fork 将项目品牌从 `Agent Vibes` / `funny-vibes` 全面重命名为 `Cursor Proxy` / `epfff`。

| 维度 | 上游（原作者） | 本地（Fork） |
|------|---------------|-------------|
| 发布者 (publisher) | `funny-vibes` | `epfff` |
| 插件名 (name) | `agent-vibes` | `cursor-proxy` |
| 显示名 (displayName) | `Agent Vibes` | `Cursor Proxy` |
| 命令前缀 | `agentVibes.*` | `cursorProxy.*` |
| 配置命名空间 | `agentVibes.*` | `cursorProxy.*` |
| GitHub URLs | `funny-vibes/agent-vibes` | `epfff/cursor-proxy` |
| 数据目录 | `~/.agent-vibes/` | `~/.cursor-proxy/` |
| 二进制文件名 | `agent-vibes-bridge` | `cursor-proxy-bridge` |

### 涉及文件

- `apps/vscode-extension/package.json` — publisher、name、displayName、所有命令和配置键
- `apps/vscode-extension/src/constants.ts` — 命令 ID、配置键常量
- `apps/vscode-extension/src/extension.ts` — 激活逻辑中的品牌引用
- `apps/vscode-extension/src/services/config-manager.ts` — 配置命名空间
- `apps/vscode-extension/src/views/dashboard-panel.ts` — UI 标题
- `apps/vscode-extension/src/views/status-indicator.ts` — 状态栏文字
- `apps/vscode-extension/src/services/bridge-manager.ts` — 二进制名
- `apps/protocol-bridge/src/persistence/cursor-proxy-paths.ts` — 数据目录名（新增，替代 `agent-vibes-paths.ts`）
- `apps/protocol-bridge/src/persistence/index.ts` — 导出路径重映射
- `apps/protocol-bridge/src/persistence/persistence.service.ts` — 目录引用
- `apps/protocol-bridge/src/shared/protocol-bridge-paths.ts` — 路径常量
- `apps/protocol-bridge/scripts/build-sea.sh` — SEA 二进制名
- `README.md` / `README_zh.md` / `apps/vscode-extension/README.md` — 所有文档
- `scripts/` 下多个脚本 — 路径和名称引用

> **合并时注意**：上游的所有 `agentVibes`、`agent-vibes`、`funny-vibes` 引用在合并后**必须**替换回 `cursorProxy`、`cursor-proxy`、`epfff`。

---

## 二、核心功能差异（protocol-bridge）

### 2.1 `sanitizeForProxy` — 代理工具 Schema 清理

**文件**：
- `apps/protocol-bridge/src/llm/claude-api/claude-api.service.ts`
- `apps/protocol-bridge/src/llm/claude-api/schema-cleaner.ts`（**新增文件**，462 行）

**功能描述**：
为 Vertex AI / Antigravity 代理后端清理工具的 `input_schema`，移除不兼容的 JSON Schema 关键字（如 `$schema`、`additionalProperties`、`$ref/$defs` 等），防止 400 INVALID_ARGUMENT 错误。

**实现细节**：
- `ClaudeApiAccount` 接口新增 `sanitizeForProxy: boolean` 字段
- `ClaudeApiAccountFileEntry` 接口新增 `sanitizeForProxy?: boolean` 字段
- `buildClaudeApiAccountRecord()` 中解析该配置
- `buildClaudeApiRequest()` 在构建请求时，若 `account.sanitizeForProxy === true` 则调用 `sanitizeToolsForProxy()`
- `sanitizeToolsForProxy()` 方法：过滤 web_search 工具，使用 `schema-cleaner.ts` 清理 input_schema
- `schema-cleaner.ts`（新增）：移植自 sub2api 项目的 `schema_cleaner.go`，实现 $ref 展开、allOf 合并、anyOf/oneOf 解析、白名单过滤等

**配置示例**：
```json
{
  "accounts": [
    {
      "label": "vertex-proxy",
      "apiKey": "sk-xxx",
      "baseUrl": "https://proxy.example.com",
      "sanitizeForProxy": true
    }
  ]
}
```

> **合并风险**：高。上游如果修改 `buildClaudeApiRequest()` 的工具处理逻辑，需确保 `sanitizeForProxy` 分支不被覆盖。

---

### 2.2 `responsesApiModels` — 指定模型使用 Responses API

**文件**：
- `apps/protocol-bridge/src/llm/openai-compat/openai-compat.service.ts`

**功能描述**：
允许用户为每个 OpenAI 兼容账号指定一组模型名，这些模型将始终使用 Responses API（`/v1/responses`），即使未全局设置 `preferResponsesApi`。适用于仅路由特定推理模型（如 `o3`、`o4-mini`）到 Responses 端点。

**实现细节**：
- `OpenaiCompatAccount` 接口新增 `responsesApiModels?: string[]`
- `OpenaiCompatAccountFileEntry` 接口新增 `responsesApiModels?: string[] | string`（兼容逗号分隔字符串）
- 新增 `parseResponsesApiModels()` 方法解析配置
- `isResponsesApiEligible()` 方法签名新增 `account?` 参数，增加对 `responsesApiModels` 的匹配检查
- `shouldFallbackToResponsesApi()` / `shouldFallbackToChatCompletionsApi()` 方法签名同步新增 `account` 参数
- 所有调用 `isResponsesApiEligible` 的位置均传入 `account` 参数
- 环境变量支持：`OPENAI_COMPAT_RESPONSES_API_MODELS`

**配置示例**：
```json
{
  "accounts": [
    {
      "label": "openai-official",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": "sk-xxx",
      "responsesApiModels": ["o3", "o4-mini"]
    }
  ]
}
```

> **合并风险**：高。上游如果修改 `isResponsesApiEligible` 或 `shouldFallback*` 方法签名/逻辑，需仔细保留 `account` 参数和 `responsesApiModels` 逻辑。

---

### 2.3 `supportsModel()` — 按模型匹配路由

**文件**：
- `apps/protocol-bridge/src/llm/openai-compat/openai-compat.service.ts`
- `apps/protocol-bridge/src/llm/model-router.service.ts`

**功能描述**：
新增 `supportsModel(model)` 公共方法，根据账号配置的 `responsesApiModels` 判断该后端能否处理指定模型。配合 `model-router.service.ts` 的改动，实现更精确的模型级路由。

**实现细节**：
- `OpenaiCompatService.supportsModel()` 检查账号的 `responsesApiModels` 白名单或默认 GPT 家族模型
- `ModelRouterService` 新增 `codexSupportsModelProvider` 和 `openaiCompatSupportsModelProvider` 函数指针
- `setGptAvailabilityProviders()` 接受新的 `codexSupportsModel` / `openaiCompatSupportsModel` 参数
- `getOpenaiCompatSupportsModel()` 、`getCodexAvailability()` 使用模型级判断
- `resolveGptBackends()` 使用 `getOpenaiCompatSupportsModel(target.model)` 替代全局可用性判断
- `resolveClaudeBackends()` 现在也检查 OpenAI Compat 是否支持该模型，若支持则加入候选列表
- `shouldAttemptFallback()` 简化了候选后端判断逻辑

> **合并风险**：高。`model-router.service.ts` 是路由核心，上游任何对路由逻辑的改动都需仔细比对。

---

### 2.4 `baseUrl` 自动清理

**文件**：
- `apps/protocol-bridge/src/llm/openai-compat/openai-compat.service.ts`

**功能描述**：
在 `buildAccountRecord()` 中自动剥离 baseUrl 末尾的 `/responses` 和 `/chat/completions` 后缀，允许用户直接粘贴完整的 endpoint URL 而无需手动截断。

**实现细节**：
```typescript
// First remove trailing slashes so endsWith works reliably
cleanBaseUrl = cleanBaseUrl.replace(/\/+$/, "")
if (cleanBaseUrl.endsWith("/responses")) {
  cleanBaseUrl = cleanBaseUrl.slice(0, -"/responses".length)
} else if (cleanBaseUrl.endsWith("/chat/completions")) {
  cleanBaseUrl = cleanBaseUrl.slice(0, -"/chat/completions".length)
}
```

> **合并风险**：低。独立逻辑在 `buildAccountRecord` 内部，不太可能与上游冲突。

---

### 2.5 调试日志增强

**文件**：
- `apps/protocol-bridge/src/llm/claude-api/claude-api.service.ts`
- `apps/protocol-bridge/src/llm/openai-compat/openai-compat.service.ts`

**功能描述**：
在 `LOG_DEBUG=true` 环境变量下输出完整的请求/响应 body 和流式 chunk 内容，便于调试。

**新增日志点**：
- Claude API：非流式请求体、非流式响应体、流式 chunk
- OpenAI Compat：流式请求体、流式 chunk、错误响应中包含 URL

> **合并风险**：低。均为独立的 `if (LOG_DEBUG)` 块，不影响主流程。

---

### 2.6 `preferResponsesApi` 类型宽松化

**文件**：
- `apps/protocol-bridge/src/llm/openai-compat/openai-compat.service.ts`

**功能描述**：
`OpenaiCompatAccountFileEntry.preferResponsesApi` 类型从 `boolean` 扩展为 `boolean | string`，支持 JSON 配置中写 `"true"` 字符串。

```typescript
preferResponsesApi: a.preferResponsesApi === "true" || a.preferResponsesApi === true
```

> **合并风险**：低。

---

## 三、扩展层差异（vscode-extension）

### 3.1 独立插件 README

**文件**：`apps/vscode-extension/README.md`（**新增文件**，92 行）

上游没有独立的插件 README，VSCode Marketplace 上显示的是根 README。我们新增了面向终端用户的简化中文文档，包含：
- 核心特性三点概要
- 插件配置参数说明表
- 常用命令面板指令
- 干净卸载步骤
- FAQ

> **合并风险**：低。上游没有此文件，不会冲突。但若上游新增同名文件则需手动合并。

### 3.2 Release 工作流

**文件**：`.github/workflows/release.yml`

我们的 release 工作流使用 `body_path` 模式（引用文件作为 release notes），上游使用内联 `body` 模式。

> **合并风险**：中。上游如果修改 release 工作流的结构，需保留 `body_path` 模式。

### 3.3 构建辅助脚本

**文件**：`build-extension.bat`（**新增文件**）

Windows 下的一键打包脚本，上游没有。

> **合并风险**：无。上游没有此文件。

### 3.4 账号配置模板

**文件**：
- `apps/protocol-bridge/data/claude-api-accounts.example.json`（**新增**）
- `apps/protocol-bridge/data/codex-accounts.example.json`（**新增**）

提供空白配置模板供用户参考。

> **合并风险**：无。上游没有这些文件。

### 3.5 插件图标

**文件**：`apps/vscode-extension/resources/icon.png`

替换了上游的图标（128KB → 13KB）。

> **合并风险**：低。

---

## 四、文档差异

### README.md / README_zh.md

除品牌重命名外，我们的文档有以下额外内容：
1. **安装部分**：增加了"二次开发注意事项"（不要使用预编译 .vsix）和源码打包步骤
2. **CI/CD 部分**：增加了 `release.yml` 的详细说明（区分 ci.yml 质量门禁与 release.yml 打包发行)
3. **卸载部分**：增加了持久化 bridge 进程的杀进程说明和旧版 agent-vibes 数据清理指引
4. **OpenAI 兼容配置**：增加了 `responsesApiModels` 字段的说明和示例
5. **风险提示**：增加了 Antigravity 代理的免责声明

---

## 五、合并检查清单

每次合并上游更新时，请逐项核对：

- [ ] **品牌名称**：所有 `agentVibes` → `cursorProxy`、`agent-vibes` → `cursor-proxy`、`funny-vibes` → `epfff`
- [ ] **数据目录**：所有 `.agent-vibes` → `.cursor-proxy`
- [ ] **sanitizeForProxy**：`claude-api.service.ts` 中的 `sanitizeForProxy` 字段和 `sanitizeToolsForProxy()` 方法及 `schema-cleaner.ts` 是否完整保留
- [ ] **responsesApiModels**：`openai-compat.service.ts` 中的 `responsesApiModels` 字段、`parseResponsesApiModels()` 方法、`isResponsesApiEligible()` 扩展参数是否完整保留
- [ ] **supportsModel**：`openai-compat.service.ts` 的 `supportsModel()` 方法和 `model-router.service.ts` 的模型级路由逻辑是否完整保留
- [ ] **baseUrl 清理**：`buildAccountRecord()` 中的 URL 后缀剥离逻辑是否保留
- [ ] **调试日志**：`LOG_DEBUG` 条件日志块是否保留
- [ ] **Release 工作流**：`body_path` 模式是否保留
- [ ] **插件 README**：`apps/vscode-extension/README.md` 是否保留
- [ ] **package.json**：命令 ID、配置键、publisher 等是否正确

---

## 六、文件级差异总览

以下为所有差异文件的完整列表（54 文件，+1473 / -766 行）：

### 新增文件
| 文件 | 说明 |
|------|------|
| `apps/protocol-bridge/src/llm/claude-api/schema-cleaner.ts` | 工具 Schema 清理器（462 行） |
| `apps/protocol-bridge/src/persistence/cursor-proxy-paths.ts` | 数据目录路径（替代 agent-vibes-paths.ts） |
| `apps/protocol-bridge/data/claude-api-accounts.example.json` | 配置模板 |
| `apps/protocol-bridge/data/codex-accounts.example.json` | 配置模板 |
| `apps/vscode-extension/README.md` | 独立插件文档（92 行） |
| `build-extension.bat` | Windows 打包脚本 |

### 删除文件
| 文件 | 说明 |
|------|------|
| `apps/protocol-bridge/src/persistence/agent-vibes-paths.ts` | 被 cursor-proxy-paths.ts 替代 |
| `apps/vscode-extension/resources/icon.svg` | 替换为新 icon.png |

### 重要修改文件
| 文件 | 改动行数 | 差异类型 |
|------|---------|---------|
| `claude-api.service.ts` | +86 | sanitizeForProxy 功能 + 调试日志 |
| `openai-compat.service.ts` | +164 | responsesApiModels + supportsModel + baseUrl 清理 + 调试日志 |
| `model-router.service.ts` | +45/-10 | 模型级路由 + fallback 逻辑简化 |
| `package.json (extension)` | +120/-120 | 全量品牌重命名 |
| `README.md` | +229/-210 | 品牌重命名 + 文档增强 |
| `README_zh.md` | +206/-190 | 品牌重命名 + 文档增强 |
| `release.yml` | +81/-75 | body_path 模式 |
