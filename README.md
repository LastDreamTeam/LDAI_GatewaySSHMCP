# Gateway SSH MCP

**自用 · 跨客户端连接配置**。本仓库让 Cursor、DeepSeek Harness（DSH）、Claude Code、GitHub Copilot 和 Antigravity 连接 Next Generation Media 提供的 Gateway SSH 服务。每位使用者在 Gateway 官方网页登录自己的账号。服务器清单、SSH 凭据和访问授权由 Gateway 管理。

## 选择客户端

服务地址为 `https://trygateway.sh/mcp`，使用 Streamable HTTP 和浏览器 OAuth。已有配置时，将示例中的 `gateway` 条目合并到相应的服务器列表。

| 客户端 | 添加方式 | 个人登录 |
| --- | --- | --- |
| Cursor | 将 [Cursor 配置](clients/cursor.json) 合并到个人 `~/.cursor/mcp.json` 或项目 `.cursor/mcp.json` | 在 MCP 设置里对 Gateway 点 Connect，按浏览器提示授权 |
| Claude Code | 运行下方命令，或将 [Claude Code 配置](clients/claude-code.json) 合并到项目的 `.mcp.json` | 打开 `/mcp`，选择 Gateway 并认证 |
| GitHub Copilot CLI | 运行下方命令，或将 [Copilot CLI 配置](clients/copilot-cli.json) 合并到个人 `~/.copilot/mcp-config.json` | 在 MCP 管理界面选择 Gateway 并认证 |
| VS Code（Copilot） | 通过命令面板打开用户 MCP 配置，或将 [编辑器配置](clients/vscode.json) 合并到项目 `.vscode/mcp.json`。采用新 Copilot CLI 配置格式的环境使用上一行 | 在服务器操作中启动 Gateway，按提示选择 Authenticate |
| Antigravity | 在 MCP Servers → Manage MCP Servers → View raw config 中合并 [Antigravity 配置](clients/antigravity.json) | 刷新服务器列表，选择 Gateway 并完成浏览器授权 |
| DSH | 按下节配置 stdio；已有支持 OAuth 的 MCP 管理插件也可直接填写服务地址并选择 OAuth | 在运行 DSH 的用户环境中执行下方登录命令 |

Claude Code 用户级安装命令

```sh
claude mcp add --scope user --transport http gateway https://trygateway.sh/mcp
```

Copilot CLI 用户级安装命令

```sh
copilot mcp add --transport http gateway https://trygateway.sh/mcp
```

## DSH 浏览器登录

DSH 的内置管理器可启动 stdio 服务。这里使用固定版本的 `mcp-remote` 连接 Gateway，由它处理浏览器授权和令牌刷新。需要 Node.js 22.12 或更高版本、npm，以及从 DSH 运行环境访问 Gateway 的网络。下面三条命令在仓库根目录执行。

```sh
npm install --prefix dsh --ignore-scripts
node dsh/setup.mjs login
node dsh/setup.mjs config
```

1. 在浏览器登录自己的 Gateway 账号并确认授权。登录命令通过 MCP 获取可用工具；若终端仍在等待，可在看到连接成功后退出。
2. `config` 输出当前机器的 `command`、`args` 和 `env`。在 DSH 的 MCP 设置中新增名为 `gateway` 的 stdio 服务，按输出填写这些字段。使用 Cordis 配置的版本可将整个输出对象作为 `@deepseek-ai/dsh-mcp-client` 的 `config`。
3. 启用该条目，在 DSH 中刷新工具列表。保留本地仓库及其依赖，DSH 启动时会使用输出中的绝对路径。

登录与 DSH 应以同一操作系统用户运行。该用户的 Gateway 登录保存在个人目录的 `.mcp-auth/gateway-ssh`。每位使用者使用独立的用户环境。远程 DSH 的浏览器登录需要让 OAuth 的本机回调到达运行桥接程序的机器，可使用远程桌面浏览器，也可选择支持远程网页登录回调的 DSH 管理器。

## 验收与更换账号

首次连接可询问「列出我的 Gateway 服务器，仅显示名称」。核对结果是否与自己在 Gateway 网页中看到的一致。新账号可能返回空列表，可先在 Gateway 页面添加一台自己管理的服务器。对同一账号授权给多个客户端时，各客户端独立保存连接。要换号，先在 Gateway 撤销原客户端授权，在客户端断开该连接，再用目标账号重新登录。DSH 使用独立系统用户可同时保留各自的登录。

本仓库提供连接配置和 DSH 辅助程序，采用 **AGPL-3.0-only**。[许可证](LICENSE)。Gateway 服务由原厂运营，能力和账户权限以其服务端为准。

## 文档

- [Gateway 官方使用与登录指南](https://trygateway.sh/docs/)
- [Cursor MCP](https://cursor.com/docs/mcp) · [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [GitHub Copilot CLI MCP](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers) · [VS Code MCP 配置](https://code.visualstudio.com/docs/agents/reference/mcp-configuration)
- [Antigravity MCP](https://antigravity.google/docs/mcp) · [DeepSeek Harness MCP 客户端](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/mcp/mcp-client) · [mcp-remote](https://www.npmjs.com/package/mcp-remote)
