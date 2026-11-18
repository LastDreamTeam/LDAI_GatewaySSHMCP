# Gateway SSH MCP

> **停止维护 / Discontinued — 2026-11-18**
>
> 本仓库维护者已决定主动停止对 GatewaySSH（trygateway.sh）的适配、更新与维护，并将本项目作为历史资料保留。**我们不推荐使用 GatewaySSH 产品，尤其不建议把重要项目或无人值守 Agent 任务依赖在该服务上。**

## 为什么停止维护

这是维护者基于本次实际使用及申诉经历作出的决定，不是因为 MCP 或 SSH 技术本身不可用。

- **服务突然不可用，缺乏可预期的过渡。** 维护者表示，在未收到事先警告或获得整改机会的情况下，账号已被限制，原有工作流直接中断。
- **说明与举证要求不清楚。** 账号受限后，维护者仍不清楚具体是哪项使用行为导致问题，以及究竟应提交哪些材料；后台无法正常进入，也增加了提供资料的困难。
- **短时限加重了用户负担。** 维护者收到 24 小时内响应的要求，并面对关闭账号、删除数据的后续处置。对于可能长时间运行、未必有人随时看邮件的 Agent 工作流，这种处理方式让人难以放心。
- **申诉体验破坏了信任。** 维护者已说明两个账号分别由不同使用者使用、对应不同主机。我们不接受在具体依据和补救路径未被清楚解释的情况下，让用户被动承担突然断服的后果。

我们理解服务商需要做风控和执行服务条款，但这不意味着用户就应接受含糊的说明、仓促的时限和不可预期的中断。**我们认为这次服务与沟通方式不尊重用户，也不符合本项目对长期稳定运行的要求，因此主动放弃继续维护和推荐该产品。**

以上是维护者对自身经历的说明和评价，不代表已经证明服务商存在强迫付费、未经授权访问主机或其他恶意行为；本仓库不以猜测代替证据，也不公开账号、主机或凭据细节。

## 归档后的范围

- 不再提供新功能、兼容性适配、故障修复或安全更新。
- 下方配置、命令和代码仅保留历史参考，不再是安装建议，也不保证仍可用。
- 后续方向优先考虑自托管、访问凭据与停用机制由自己掌控、可明确审计的替代方案；本仓库不声称替代服务已部署或已完成验证。
- 现有使用者应自行评估依赖和迁移，按需要从客户端断开服务，并在自己管理的主机上撤销不再使用的访问授权。

---

## 历史使用说明（不再维护）

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
