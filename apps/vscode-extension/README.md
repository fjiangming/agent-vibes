# Cursor Proxy

Cursor Proxy 是一款统一的本地 AI 代理网关客户端插件，允许你在 Cursor IDE 与 Claude Code CLI 中直接使用自己的 AI 后端（如 Antigravity 代理资源或其他大语言模型兼容 API），并在前端仪表盘进行统一管理。

---

## 核心特性

- **协议转换桥接**：在本地无缝转换和桥接各种大语言模型的通讯调用，支持注入拦截。
- **免配置凭据注入**：一键同步各类提供商（Claude, Codex等）的账号池及凭证至 IDE 的环境变量中直接生效。
- **可视化日志看板**：直接通过可视化 Dashboard 仪表盘管理端口、查看请求流的抓包与运行日志。

---

## 🔥 插件配置参数使用说明

你可以在 VS Code 或 Cursor 的**设置选项面板 (Settings)** 中搜索 `@ext:fjming.cursor-proxy` (或直接搜索 `Cursor Proxy`) 来进行以下自定义配置：

| 配置项 | 默认值 | 作用说明 |
| :--- | :---: | :--- |
| **Auto Start**<br>`cursorProxy.autoStart` | `true` | 是否在每次开启编辑器时自动在后台启动桥接服务，建议关闭后只在需要时手动唤起。 |
| **Port**<br>`cursorProxy.port` | `8000` | 桥接网关服务运行监听的本地端口。如果该端口被占用可在此处修改。 |
| **Debug Mode**<br>`cursorProxy.debugMode` | `false` | 是否开启详细的调试与运行日志输出。排查问题时建议打开。 |
| **Data Dir**<br>`cursorProxy.dataDir` | `空` | 本地存储账号证书、环境变量和凭据配置的数据目录，默认会使用系统目录下的 `~/.cursor-proxy` 作为安全落盘路径。 |

如果有特殊需求，你可以针对单独的认证路径进行微调：
- **`cursorProxy.antigravityAccountsPath`**：覆盖默认 Antigravity 证书的路径
- **`cursorProxy.claudeApiAccountsPath`**：覆盖默认 Claude 原始 API 的本地映射路径
- **`cursorProxy.codexAccountsPath`**：覆盖默认 Codex 授权服务的认证路径

---

## 🧰 常用控制面板快捷指令

安装后所有能力都可以快捷唤出：请按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS) 打开开发者调色板，输入 `Cursor Proxy` 来使用提供的各种快捷指令：

- 打开数据控制台查看连接状态：  
  👉 **`Cursor Proxy: Open Dashboard`**
  
- 服务控制与重启：  
  👉 **`Cursor Proxy: Start / Stop / Restart Server`**

- 一键应用或还原对 Cursor 所做的透明拦截补丁：  
  👉 **`Cursor Proxy: Apply Cursor Patch`** / **`Cursor Proxy: Restore Cursor Original`**

- 一键分别获取最新证书或账号信息同步至本地环境变量：  
  👉 **`Cursor Proxy: Sync Antigravity / Claude / Codex Credentials`**

---

## 常见问题与排错 (FAQ)

1. **安装后提示服务端口冲突未拉起？**
   尝试修改 Settings 中的 `Port` (例如改为 `8001`) 后执行 `Restart Server` 命令。

2. **如何知道拦截是否生效？**
   在命令调色板里执行 `Cursor Proxy: Open Dashboard`，然后在 Cursor 中尝试发起任意 AI 请求，观察仪表盘右侧的抓包流量（Traffic Dump）与响应追踪（Trace）是否有记录出现。

3. **如何反馈问题？**
   你可以通过 `Cursor Proxy: Collect Diagnostics` 命令快速将当前发生的环境报错信息一键打包收集供您参考，同时也欢迎到我们对应的社区讨论提 Issue！
